import type { jsPDF } from "jspdf"
import type { BandKey, Lang } from "../types"
import { novyDokument, type Geometrie, type RGB } from "./sazba"

// Tisková sestava: společná kostra všech vyhodnocení na papír.
//
// Tlačítko Tisk i tlačítko PDF dávají tentýž dokument. Dřív tiskl prohlížeč
// obrazovku (u ELITE 200 třiadvacet stran na šířku a bez grafů) a PDF bylo
// jiný dokument. Teď se tiskne hotové PDF, takže kouč má na papíře přesně to,
// co by poslal klientovi.
//
// Strana se skládá z bloků. Každý blok umí říct, jak je vysoký při dané
// šířce, a pak se vykreslit. Strana se proto dá nejdřív změřit a teprve potom
// vysázet: předem víme, jestli se dvě oblasti vejdou na jednu stranu, a místo,
// které dole zbude, nezůstane prázdné, ale dostanou ho linky na poznámky.
//
// Pásmo nikdy nenese jen barva. Štítek má slovo a čtyři tečky, z nichž je
// plných tolik, kolikáté pásmo to je; na černobílé tiskárně se tak pásma
// nesmíchají a pro protanopa, kterému červená a oranžová splývají, taky ne.

/** Jeden typografický bod v milimetrech. */
export const BOD = 25.4 / 72

export const SESTAVA: Geometrie = {
  sirkaStrany: 210,
  vyskaStrany: 297,
  okraj: { levy: 15, pravy: 15, horni: 19, dolni: 18 },
  naSirku: false,
}

const SIRKA_SAZBY = SESTAVA.sirkaStrany - SESTAVA.okraj.levy - SESTAVA.okraj.pravy
const VYSKA_SAZBY = SESTAVA.vyskaStrany - SESTAVA.okraj.horni - SESTAVA.okraj.dolni

/** Barvy papíru. Světlé i v PDF staženém z tmavého režimu. */
export const PAPIR = {
  inkoust: [29, 29, 31] as RGB,
  inkoust2: [85, 87, 94] as RGB,
  inkoust3: [138, 140, 147] as RGB,
  linka: [226, 227, 231] as RGB,
  drazka: [233, 233, 239] as RGB,
  mekky: [244, 244, 247] as RGB,
  modra: [0, 122, 255] as RGB,
  ryska: [176, 178, 186] as RGB,
  tlumena: [150, 152, 160] as RGB,
}

export interface BarvyPasma {
  pismo: RGB
  podklad: RGB
  /** barva úseku na ose pod profilem; světlejší, aby osa nekřičela */
  osa: RGB
  /** kolik ze čtyř teček je plných */
  plnych: number
}

export const BARVY_PASEM: Record<BandKey, BarvyPasma> = {
  priority: { pismo: [192, 15, 45], podklad: [253, 236, 236], osa: [192, 15, 45], plnych: 1 },
  stabilization: { pismo: [167, 82, 0], podklad: [253, 241, 227], osa: [232, 161, 74], plnych: 2 },
  strong: { pismo: [10, 95, 189], podklad: [233, 242, 253], osa: [90, 160, 234], plnych: 3 },
  elite: { pismo: [26, 127, 55], podklad: [230, 245, 234], osa: [70, 181, 106], plnych: 4 },
}

export const PORADI_PASEM: BandKey[] = ["priority", "stabilization", "strong", "elite"]

/** Upozornění v oranžové, například „dílčí oblasti se výrazně liší“. */
export const BARVY_UPOZORNENI = { pismo: BARVY_PASEM.stabilization.pismo, podklad: BARVY_PASEM.stabilization.podklad }

export interface Styl {
  pt: number
  tucne?: boolean
  barva?: RGB
  /** výška řádku jako násobek velikosti písma */
  proklad?: number
  /** prostrkání mezi písmeny v mm */
  prostrkani?: number
}

export const STYL = {
  text: { pt: 9.8, barva: PAPIR.inkoust2 } as Styl,
  textTmavy: { pt: 9.8, barva: PAPIR.inkoust } as Styl,
  h1: { pt: 16.5, tucne: true, proklad: 1.15 } as Styl,
  h2: { pt: 12.5, tucne: true, proklad: 1.2 } as Styl,
  h3: { pt: 7.4, tucne: true, barva: PAPIR.inkoust3, proklad: 1.3, prostrkani: 0.31 } as Styl,
  eyebrow: { pt: 6.8, tucne: true, barva: PAPIR.inkoust3, proklad: 1.3, prostrkani: 0.31 } as Styl,
  jmeno: { pt: 28, tucne: true, proklad: 1.05 } as Styl,
  meta: { pt: 9.4, barva: PAPIR.inkoust2 } as Styl,
  mala: { pt: 7.8, barva: PAPIR.inkoust3, proklad: 1.35 } as Styl,
}

/**
 * Jednopísmenné předložky a spojky nesmí zůstat na konci řádku. Mezi ně
 * a následující slovo jde nezlomitelná mezera; zalamování ji drží, při
 * kreslení se z ní stane obyčejná mezera (písmo nezlomitelnou mezeru nemá).
 */
function vazby(text: string, lang: Lang): string {
  if (lang === "en") return text
  let predtim = ""
  let ted = text
  while (ted !== predtim) {
    predtim = ted
    ted = ted.replace(/(^|[\s („])([vkszouaiVKSZOUAI]) /g, "$1$2 ")
  }
  return ted
}

/** Blok sazby. Nejdřív se změří, pak se vykreslí. */
export interface Blok {
  vyska(sirka: number): number
  /** `vyska` je místo, které blok dostal; pevný blok ho má stejné jako změřené */
  kresli(x: number, y: number, sirka: number, vyska: number): void
  /** pružný blok si vezme místo, které na straně zbude */
  pruzny?: { min: number; vaha: number }
}

/** Místo bloku může stát i nic: podmíněný blok se zapisuje `podminka && blok`. */
export type MoznyBlok = Blok | null | false | undefined | ""

export interface Hlavicka {
  vlevo: string
  vpravo: string
  /** vlevo stojí značka Winning Minds, ne jméno */
  znacka?: boolean
}

export interface Polozka {
  popis: string
  hodnota: string
  barva?: RGB
}

/** Řádek profilu: název, pruh, hodnota a pásmo. */
export interface RadekProfilu {
  nazev: string
  /** hodnota k zobrazení; null = škála se nevykazuje */
  hodnota: string | null
  /** 0 až 100 */
  procenta: number
  pasmo: BandKey | null
  /** slovo do štítku */
  stitek: string
  /** zvýraznit (silnější písmo názvu) */
  duraz?: boolean
  /** jemnější řádek pod hlavním, například fazeta osobnosti */
  podrizeny?: boolean
  /** šedý pruh pro data, která nejsou v popředí */
  tlumeny?: boolean
}

/** Osa pod profilem: kde začínají pásma a jak se jmenují. */
export interface OsaProfilu {
  popis: string
  /** hranice mezi pásmy v procentech osy, vzestupně */
  hranice: number[]
  /** popisky pásem zleva doprava; o jeden víc než hranic */
  popisky: string[]
  /** barvy úseků; bez nich barvy pásem ELITE v pořadí PORADI_PASEM */
  barvy?: RGB[]
}

/** Stupně šedi pro osu, kde pásmo neznamená dobře ani špatně, jen víc nebo míň. */
export function sedaOsa(useku: number): RGB[] {
  return Array.from({ length: useku }, (_, i) => {
    const v = Math.round(205 - (i * 120) / Math.max(1, useku - 1))
    return [v, v, v + 6] as RGB
  })
}

export interface BunkaMapy {
  nazev: string
  hodnota: string
  /** null = škála se nevykazuje */
  pasmo: BandKey | null
}

export class Sestava {
  readonly doc: jsPDF
  readonly lang: Lang
  readonly sirka = SIRKA_SAZBY
  readonly vyskaPlochy = VYSKA_SAZBY
  private readonly strany: { hlavicka: Hlavicka; paticka?: string }[] = []
  /** strany, na které se obsah nevešel; test je hlídá, v aplikaci se jen vysází dál */
  readonly preteceni: { strana: number; mm: number }[] = []

  constructor(lang: Lang) {
    this.doc = novyDokument()
    this.lang = lang
  }

  // -------------------------------------------------------------------------
  // Písmo a měření
  // -------------------------------------------------------------------------

  nastav(st: Styl) {
    this.doc.setFont("Liberation", st.tucne ? "bold" : "normal")
    this.doc.setFontSize(st.pt)
    const b = st.barva ?? PAPIR.inkoust
    this.doc.setTextColor(b[0], b[1], b[2])
  }

  /** Šířka jednoho řádku textu v mm. */
  sirkaTextu(text: string, st: Styl): number {
    this.nastav(st)
    const cisty = text.replace(/ /g, " ")
    return this.doc.getTextWidth(cisty) + (st.prostrkani ?? 0) * cisty.length
  }

  radek(st: Styl): number {
    return st.pt * BOD * (st.proklad ?? 1.45)
  }

  /**
   * Zalomí text do šířky. Vlastní zalamování místo splitTextToSize, protože
   * to potřebuje znát nezlomitelné mezery za jednopísmennými slovy a slovo
   * delší než sloupec rozdělit, ne nechat přetéct.
   */
  zalom(text: string, sirka: number, st: Styl): string[] {
    const radky: string[] = []
    for (const odstavec of vazby(text, this.lang).split("\n")) {
      const slova = odstavec.split(" ").filter((x) => x.length > 0)
      if (!slova.length) {
        radky.push("")
        continue
      }
      let r = ""
      for (const slovo of slova) {
        const kandidat = r ? `${r} ${slovo}` : slovo
        if (!r || this.sirkaTextu(kandidat, st) <= sirka) {
          r = kandidat
          continue
        }
        radky.push(r)
        r = slovo
      }
      radky.push(r)
    }
    return radky
      .flatMap((r) => (this.sirkaTextu(r, st) <= sirka + 0.01 ? [r] : this.rozsekej(r, sirka, st)))
      .map((r) => r.replace(/ /g, " "))
  }

  /** Slovo širší než sloupec se rozdělí po písmenech. Stává se jen v úzkých buňkách. */
  private rozsekej(text: string, sirka: number, st: Styl): string[] {
    const out: string[] = []
    let r = ""
    for (const znak of text) {
      if (r && this.sirkaTextu(r + znak, st) > sirka) {
        out.push(r)
        r = znak.trim() ? znak : ""
      } else {
        r += znak
      }
    }
    if (r) out.push(r)
    return out
  }

  vyskaTextu(text: string, sirka: number, st: Styl): number {
    if (!text) return 0
    return this.zalom(text, sirka, st).length * this.radek(st)
  }

  /** Účaří řádku, který začíná na `y`. Odpovídá tomu, jak řádek sází prohlížeč. */
  ucari(y: number, st: Styl): number {
    return y + this.radek(st) / 2 + 0.35 * st.pt * BOD
  }

  /** Napíše text do šířky. Vrací spotřebovanou výšku. */
  pis(
    text: string,
    x: number,
    y: number,
    sirka: number,
    st: Styl,
    zarovnani: "left" | "right" | "center" = "left",
  ): number {
    if (!text) return 0
    const radky = this.zalom(text, sirka, st)
    const vyska = this.radek(st)
    radky.forEach((r, i) => {
      this.nastav(st)
      const w = this.sirkaTextu(r, st)
      const xx = zarovnani === "right" ? x + sirka - w : zarovnani === "center" ? x + (sirka - w) / 2 : x
      this.nastav(st)
      this.doc.text(r, xx, this.ucari(y + i * vyska, st), st.prostrkani ? { charSpace: st.prostrkani } : undefined)
    })
    return radky.length * vyska
  }

  // -------------------------------------------------------------------------
  // Kreslení
  // -------------------------------------------------------------------------

  vypln(b: RGB) {
    this.doc.setFillColor(b[0], b[1], b[2])
  }

  tah(b: RGB, tloustka: number) {
    this.doc.setDrawColor(b[0], b[1], b[2])
    this.doc.setLineWidth(tloustka)
  }

  vodorovna(x: number, y: number, sirka: number, barva: RGB = PAPIR.linka, tloustka = 0.2) {
    this.tah(barva, tloustka)
    this.doc.line(x, y, x + sirka, y)
  }

  /** Čtyři tečky pásma. Vrací šířku. */
  tecky(x: number, yStred: number, pasmo: BandKey, polomer = 0.52): number {
    const b = BARVY_PASEM[pasmo]
    const krok = polomer * 2.6
    for (let i = 0; i < 4; i++) {
      const cx = x + polomer + i * krok
      this.tah(b.pismo, 0.18)
      if (i < b.plnych) {
        this.vypln(b.pismo)
        this.doc.circle(cx, yStred, polomer, "FD")
      } else {
        this.doc.circle(cx, yStred, polomer - 0.09, "S")
      }
    }
    return polomer * 2 + krok * 3
  }

  sirkaTecek(polomer = 0.52): number {
    return polomer * 2 + polomer * 2.6 * 3
  }

  private stylStitku(pt: number): Styl {
    return { pt, tucne: true, proklad: 1 }
  }

  sirkaStitku(text: string, pt = 7.2): number {
    return 1.8 + this.sirkaTextu(text, this.stylStitku(pt)) + 1.4 + this.sirkaTecek() + 1.8
  }

  /** Štítek pásma: slovo a tečky na barevném podkladu. Vrací šířku. */
  stitek(x: number, yStred: number, text: string, pasmo: BandKey, pt = 7.2): number {
    const b = BARVY_PASEM[pasmo]
    const sirka = this.sirkaStitku(text, pt)
    const vyska = pt * BOD + 2.1
    this.vypln(b.podklad)
    this.doc.roundedRect(x, yStred - vyska / 2, sirka, vyska, vyska / 2, vyska / 2, "F")
    const st = { ...this.stylStitku(pt), barva: b.pismo }
    this.nastav(st)
    this.doc.text(text, x + 1.8, yStred + 0.35 * pt * BOD)
    this.tecky(x + 1.8 + this.sirkaTextu(text, st) + 1.4, yStred, pasmo)
    return sirka
  }

  /** Dráha s modrou výplní a volitelně s ryskami hranic pásem. */
  pruh(
    x: number,
    y: number,
    sirka: number,
    vyska: number,
    procenta: number,
    hranice: number[] = [],
    barva: RGB = PAPIR.modra,
  ) {
    const r = vyska / 2
    this.vypln(PAPIR.drazka)
    this.doc.roundedRect(x, y, sirka, vyska, r, r, "F")
    const w = Math.max(vyska, (sirka * Math.min(100, Math.max(0, procenta))) / 100)
    this.vypln(barva)
    this.doc.roundedRect(x, y, w, vyska, r, r, "F")
    for (const h of hranice) {
      const hx = x + (sirka * h) / 100
      this.tah(PAPIR.ryska, 0.25)
      this.doc.line(hx, y - 0.7, hx, y + vyska + 0.7)
    }
  }

  // -------------------------------------------------------------------------
  // Bloky
  // -------------------------------------------------------------------------

  text(obsah: string, st: Styl = STYL.text, zarovnani: "left" | "right" | "center" = "left"): Blok {
    return {
      vyska: (sirka) => this.vyskaTextu(obsah, sirka, st),
      kresli: (x, y, sirka) => {
        this.pis(obsah, x, y, sirka, st, zarovnani)
      },
    }
  }

  /** Malý nadpis velkými písmeny. */
  h3(obsah: string, st: Styl = STYL.h3): Blok {
    return this.text(obsah.toLocaleUpperCase(this.lang), st)
  }

  mezera(mm: number): Blok {
    return { vyska: () => mm, kresli: () => {} }
  }

  /** Bloky pod sebou s mezerou. */
  skupina(bloky: MoznyBlok[], mezera = 0): Blok {
    const b = bloky.filter(Boolean) as Blok[]
    const vysky = (sirka: number) => b.map((x) => x.vyska(sirka))
    return {
      vyska: (sirka) => {
        const v = vysky(sirka)
        return v.reduce((a, c) => a + c, 0) + mezera * Math.max(0, b.length - 1)
      },
      kresli: (x, y, sirka) => {
        let yy = y
        for (const blok of b) {
          const v = blok.vyska(sirka)
          blok.kresli(x, yy, sirka, v)
          yy += v + mezera
        }
      },
    }
  }

  /** Sloupce vedle sebe. Sloupec má pevnou šířku, nebo podíl ze zbytku. */
  sloupce(
    sloupce: { sirka?: number; podil?: number; blok: Blok }[],
    mezera = 5,
    opts: { vyrovnat?: boolean } = {},
  ): Blok {
    const sirky = (celkem: number) => {
      const pevne = sloupce.reduce((a, s) => a + (s.sirka ?? 0), 0)
      const podily = sloupce.reduce((a, s) => a + (s.sirka === undefined ? (s.podil ?? 1) : 0), 0)
      const zbytek = celkem - pevne - mezera * (sloupce.length - 1)
      return sloupce.map((s) => s.sirka ?? (zbytek * (s.podil ?? 1)) / Math.max(1, podily))
    }
    return {
      vyska: (sirka) => {
        const w = sirky(sirka)
        return Math.max(0, ...sloupce.map((s, i) => s.blok.vyska(w[i])))
      },
      kresli: (x, y, sirka, vyska) => {
        const w = sirky(sirka)
        let xx = x
        sloupce.forEach((s, i) => {
          // Vyrovnané sloupce (dva rámečky vedle sebe) dostanou stejnou výšku.
          s.blok.kresli(xx, y, w[i], opts.vyrovnat ? vyska : s.blok.vyska(w[i]))
          xx += w[i] + mezera
        })
      },
    }
  }

  /** Obsah na měkkém podkladu se zaoblenými rohy. */
  box(obsah: Blok, opts: { podklad?: RGB; svisle?: number; vodorovne?: number; okrajova?: RGB } = {}): Blok {
    const sv = opts.svisle ?? 3.2
    const vo = opts.vodorovne ?? 3.6
    return {
      vyska: (sirka) => obsah.vyska(sirka - 2 * vo) + 2 * sv,
      kresli: (x, y, sirka, vyska) => {
        this.vypln(opts.podklad ?? PAPIR.mekky)
        this.doc.roundedRect(x, y, sirka, vyska, 2, 2, "F")
        obsah.kresli(x + vo, y + sv, sirka - 2 * vo, vyska - 2 * sv)
      },
    }
  }

  /** Oddíl s tlustou linkou nahoře, jak ho má každá oblast a každá priorita. */
  oddil(obsah: Blok, odsazeni = 3.2): Blok {
    return {
      vyska: (sirka) => 0.3 + odsazeni + obsah.vyska(sirka),
      kresli: (x, y, sirka) => {
        this.vodorovna(x, y + 0.15, sirka, PAPIR.inkoust, 0.3)
        obsah.kresli(x, y + 0.3 + odsazeni, sirka, obsah.vyska(sirka))
      },
    }
  }

  /** Text v barevném rámečku jen tak širokém, jak je potřeba. */
  upozorneni(obsah: string, barvy: { pismo: RGB; podklad: RGB } = BARVY_UPOZORNENI, pt = 6.8): Blok {
    const st: Styl = { pt, barva: barvy.pismo, proklad: 1.35 }
    const sv = 0.7
    const vo = 1.8
    return {
      vyska: (sirka) => this.vyskaTextu(obsah, sirka - 2 * vo, st) + 2 * sv,
      kresli: (x, y, sirka, vyska) => {
        const radky = this.zalom(obsah, sirka - 2 * vo, st)
        const w = Math.max(...radky.map((r) => this.sirkaTextu(r, st))) + 2 * vo
        this.vypln(barvy.podklad)
        this.doc.roundedRect(x, y, w, vyska, 1.2, 1.2, "F")
        this.pis(obsah, x + vo, y + sv, sirka - 2 * vo, st)
      },
    }
  }

  /** Úvod strany: drobný nadpis, jméno a řádek s údaji. */
  uvod(eyebrow: string, jmeno: string, meta: string[], velikostJmena = 28): Blok {
    const stJmeno: Styl = { ...STYL.jmeno, pt: velikostJmena }
    return this.skupina(
      [
        this.h3(eyebrow, STYL.eyebrow),
        this.mezera(1.2),
        this.text(jmeno || "–", stJmeno),
        meta.filter(Boolean).length ? this.mezera(1.4) : null,
        ...meta.filter(Boolean).map((m) => this.text(m, STYL.meta)),
      ],
      0,
    )
  }

  /** Pruh údajů mezi dvěma linkami: vyplnění, pozornost, tempo. */
  infoPruh(polozky: Polozka[]): Blok {
    const mezera = 3
    const stHodnota: Styl = { pt: 9.4, tucne: true }
    const sirkaSloupce = (sirka: number) => (sirka - mezera * (polozky.length - 1)) / polozky.length
    const vyskaSloupce = (p: Polozka, w: number) =>
      this.vyskaTextu(p.popis.toLocaleUpperCase(this.lang), w, STYL.h3) + 0.6 + this.vyskaTextu(p.hodnota, w, stHodnota)
    return {
      vyska: (sirka) => {
        const w = sirkaSloupce(sirka)
        return 2.6 * 2 + Math.max(...polozky.map((p) => vyskaSloupce(p, w)))
      },
      kresli: (x, y, sirka, vyska) => {
        this.vodorovna(x, y, sirka, PAPIR.linka, 0.25)
        this.vodorovna(x, y + vyska, sirka, PAPIR.linka, 0.25)
        const w = sirkaSloupce(sirka)
        polozky.forEach((p, i) => {
          const xx = x + i * (w + mezera)
          let yy = y + 2.6
          yy += this.pis(p.popis.toLocaleUpperCase(this.lang), xx, yy, w, STYL.h3)
          yy += 0.6
          this.pis(p.hodnota, xx, yy, w, { ...stHodnota, barva: p.barva ?? PAPIR.inkoust })
        })
      },
    }
  }

  /**
   * Profil: řádky s pruhem a štítkem pásma, pod nimi osa s pásmy.
   *
   * Sloupec štítků je široký podle nejdelšího štítku v daném jazyce, ne pevně:
   * „Development priority“ je o třetinu delší než „Silná oblast“.
   */
  profil(radky: RadekProfilu[], osa: OsaProfilu | null, opts: { mezera?: number; sirkaNazvu?: number } = {}): Blok {
    const mezeraRadku = opts.mezera ?? 3.7
    const gap = 2.4
    const stNazev: Styl = { pt: 9.2, tucne: true, proklad: 1.2 }
    const stPodrizeny: Styl = { pt: 8.4, barva: PAPIR.inkoust2, proklad: 1.2 }
    const stHodnota: Styl = { pt: 9.6, tucne: true }
    const stOsa: Styl = { pt: 6.4, barva: PAPIR.inkoust3, proklad: 1.2 }

    const sloupce = (sirka: number) => {
      const nazev = sirka * (opts.sirkaNazvu ?? 0.38)
      const maStitky = radky.some((r) => r.stitek)
      const stitky = maStitky
        ? Math.max(
            18,
            ...radky.map((r) =>
              r.pasmo && r.stitek ? this.sirkaStitku(r.stitek) : this.sirkaTextu(r.stitek, { pt: 7.4 }),
            ),
          )
        : 0
      const hodnota = Math.max(8, ...radky.map((r) => this.sirkaTextu(r.hodnota ?? "–", stHodnota) + 1))
      const pruh = sirka - nazev - stitky - hodnota - (maStitky ? 3 : 2) * gap
      return { nazev, pruh, hodnota, stitky }
    }
    const ODSAZENI = 4
    const vyskaRadku = (r: RadekProfilu, w: number) =>
      Math.max(
        this.vyskaTextu(r.nazev, w - (r.podrizeny ? ODSAZENI : 0), r.podrizeny ? stPodrizeny : stNazev),
        r.pasmo ? 4.6 : 3.6,
      )
    const vyskaOsy = osa ? 0.5 + 0.6 + this.radek(stOsa) : 0

    return {
      vyska: (sirka) => {
        const s = sloupce(sirka)
        const v = radky.reduce((a, r) => a + vyskaRadku(r, s.nazev), 0) + mezeraRadku * Math.max(0, radky.length - 1)
        return v + (osa ? mezeraRadku + vyskaOsy : 0)
      },
      kresli: (x, y, sirka) => {
        const s = sloupce(sirka)
        const xPruh = x + s.nazev + gap
        const xHodnota = xPruh + s.pruh + gap
        const xStitek = xHodnota + s.hodnota + gap
        let yy = y
        for (const r of radky) {
          const v = vyskaRadku(r, s.nazev)
          const stred = yy + v / 2
          const st = r.podrizeny ? stPodrizeny : { ...stNazev, tucne: r.duraz ?? true }
          const odsaz = r.podrizeny ? ODSAZENI : 0
          const vyskaNazvu = this.vyskaTextu(r.nazev, s.nazev - odsaz, st)
          this.pis(r.nazev, x + odsaz, stred - vyskaNazvu / 2, s.nazev - odsaz, st)
          const vyskaPruhu = r.podrizeny ? 2 : 2.8
          if (r.hodnota === null) {
            this.tah(PAPIR.linka, 0.4)
            this.doc.setLineDashPattern([1, 1.2], 0)
            this.doc.line(xPruh, stred, xPruh + s.pruh, stred)
            this.doc.setLineDashPattern([], 0)
          } else {
            this.pruh(
              xPruh,
              stred - vyskaPruhu / 2,
              s.pruh,
              vyskaPruhu,
              r.procenta,
              r.podrizeny ? [] : (osa?.hranice ?? []),
              r.tlumeny ? PAPIR.tlumena : PAPIR.modra,
            )
          }
          const stH = r.podrizeny ? { ...stHodnota, pt: 8.6, tucne: false, barva: PAPIR.inkoust2 } : stHodnota
          this.nastav(stH)
          const hodnota = r.hodnota ?? "–"
          this.doc.text(hodnota, xHodnota + s.hodnota, stred + 0.35 * stH.pt * BOD, { align: "right" })
          if (r.pasmo && r.stitek) {
            this.stitek(xStitek, stred, r.stitek, r.pasmo)
          } else if (r.stitek) {
            const stSlovo: Styl = { pt: 7.4, barva: PAPIR.inkoust3 }
            this.nastav(stSlovo)
            this.doc.text(r.stitek, xStitek, stred + 0.35 * stSlovo.pt * BOD)
          }
          yy += v + mezeraRadku
        }
        if (osa) {
          const yOsa = yy
          this.pis(osa.popis, x, yOsa + 0.5, s.nazev, stOsa)
          const okraje = [0, ...osa.hranice, 100]
          const barvy = osa.barvy ?? PORADI_PASEM.map((p) => BARVY_PASEM[p].osa)
          okraje.slice(0, -1).forEach((_, i) => {
            const od = xPruh + (s.pruh * okraje[i]) / 100
            const sirkaUseku = (s.pruh * (okraje[i + 1] - okraje[i])) / 100
            this.tah(barvy[i] ?? PAPIR.ryska, 0.5)
            this.doc.line(od, yOsa + 0.25, od + sirkaUseku - 0.3, yOsa + 0.25)
            const popis = osa.popisky[i] ?? ""
            const vejde = this.sirkaTextu(popis, stOsa) <= sirkaUseku - 0.6
            if (vejde) this.pis(popis, od, yOsa + 0.5 + 0.6, sirkaUseku - 0.3, stOsa, "center")
          })
        }
      },
    }
  }

  /** Mapa dílčích oblastí: řádek na oblast, buňka na fazetu, podklad podle pásma. */
  mapa(radky: { skupina: string; bunky: BunkaMapy[] }[], opts: { mezera?: number } = {}): Blok {
    const mezeraRadku = opts.mezera ?? 1.5
    const sirkaSkupiny = 24
    const gap = 1.2
    const stSkupina: Styl = { pt: 7.8, tucne: true, proklad: 1.2 }
    const stNazev: Styl = { pt: 7, proklad: 1.2 }
    const stCislo: Styl = { pt: 8.6, tucne: true, proklad: 1 }
    const sv = 1.5
    const vo = 1.8
    const sloupcu = Math.max(1, ...radky.map((r) => r.bunky.length))
    const sirkaBunky = (sirka: number) => (sirka - sirkaSkupiny - gap * sloupcu) / sloupcu
    const sirkaCisla = Math.max(this.sirkaTecek(0.42), this.sirkaTextu("40", stCislo))
    const vyskaBunky = (b: BunkaMapy, w: number) =>
      Math.max(this.vyskaTextu(b.nazev, w - 2 * vo - sirkaCisla - 1.5, stNazev), 3.2 + 1.6) + 2 * sv
    const vyskaRadku = (r: { bunky: BunkaMapy[] }, w: number) => Math.max(...r.bunky.map((b) => vyskaBunky(b, w)))
    return {
      vyska: (sirka) => {
        const w = sirkaBunky(sirka)
        return radky.reduce((a, r) => a + vyskaRadku(r, w), 0) + mezeraRadku * Math.max(0, radky.length - 1)
      },
      kresli: (x, y, sirka) => {
        const w = sirkaBunky(sirka)
        let yy = y
        for (const r of radky) {
          const v = vyskaRadku(r, w)
          const vyskaSkupiny = this.vyskaTextu(r.skupina, sirkaSkupiny - 1, stSkupina)
          this.pis(r.skupina, x, yy + (v - vyskaSkupiny) / 2, sirkaSkupiny - 1, stSkupina)
          r.bunky.forEach((b, i) => {
            const bx = x + sirkaSkupiny + gap + i * (w + gap)
            const barvy = b.pasmo ? BARVY_PASEM[b.pasmo] : { podklad: PAPIR.mekky, pismo: PAPIR.inkoust3 }
            this.vypln(barvy.podklad)
            this.doc.roundedRect(bx, yy, w, v, 1.2, 1.2, "F")
            const sirkaNazvu = w - 2 * vo - sirkaCisla - 1.5
            const vn = this.vyskaTextu(b.nazev, sirkaNazvu, stNazev)
            this.pis(b.nazev, bx + vo, yy + (v - vn) / 2, sirkaNazvu, { ...stNazev, barva: PAPIR.inkoust })
            const xCislo = bx + w - vo
            const yStred = yy + v / 2
            this.nastav({ ...stCislo, barva: barvy.pismo })
            this.doc.text(b.hodnota, xCislo, yStred + 0.2, { align: "right" })
            if (b.pasmo) this.tecky(xCislo - this.sirkaTecek(0.42), yStred + 1.9, b.pasmo, 0.42)
          })
          yy += v + mezeraRadku
        }
      },
    }
  }

  /** Šedé čipy vedle sebe, zalomené do více řádků, když je jich hodně. */
  cipy(texty: string[], pt = 8): Blok {
    const st: Styl = { pt, proklad: 1.2 }
    const vo = 1.8
    const vyska = this.radek(st) + 1.2
    const gap = 1.2
    const rozloz = (sirka: number) => {
      const out: { x: number; y: number; w: number; t: string }[] = []
      let xx = 0
      let yy = 0
      for (const t of texty) {
        const w = Math.min(sirka, this.sirkaTextu(t, st) + 2 * vo)
        if (xx > 0 && xx + w > sirka) {
          xx = 0
          yy += vyska + gap
        }
        out.push({ x: xx, y: yy, w, t })
        xx += w + gap
      }
      return { out, vyska: texty.length ? yy + vyska : 0 }
    }
    return {
      vyska: (sirka) => rozloz(sirka).vyska,
      kresli: (x, y, sirka) => {
        for (const c of rozloz(sirka).out) {
          this.vypln(PAPIR.mekky)
          this.doc.roundedRect(x + c.x, y + c.y, c.w, vyska, vyska / 2, vyska / 2, "F")
          this.nastav({ ...st, barva: PAPIR.inkoust })
          this.doc.text(c.t, x + c.x + vo, this.ucari(y + c.y + 0.6, st))
        }
      },
    }
  }

  /** Číslovaný seznam. Číslo stojí v okraji, text se zalamuje pod sebe. */
  seznam(polozky: string[], st: Styl = STYL.text, opts: { cisla?: boolean; mezera?: number } = {}): Blok {
    const odsazeni = 4.4
    const mezera = opts.mezera ?? 1.4
    return {
      vyska: (sirka) =>
        polozky.reduce((a, p) => a + this.vyskaTextu(p, sirka - odsazeni, st), 0) +
        mezera * Math.max(0, polozky.length - 1),
      kresli: (x, y, sirka) => {
        let yy = y
        polozky.forEach((p, i) => {
          const znak = opts.cisla === false ? "•" : `${i + 1}.`
          this.nastav({ ...st, tucne: true, barva: PAPIR.inkoust3 })
          this.doc.text(znak, x, this.ucari(yy, st))
          yy += this.pis(p, x + odsazeni, yy, sirka - odsazeni, st) + mezera
        })
      },
    }
  }

  /** Očíslované body: tučný titulek a pod ním text, například otázka do rozhovoru. */
  body(
    polozky: { titulek: string; text: string }[],
    opts: { stTitulek?: Styl; stText?: Styl; mezera?: number; odrazky?: boolean } = {},
  ): Blok {
    const odsazeni = 4.4
    const mezera = opts.mezera ?? 2
    const stT: Styl = opts.stTitulek ?? { pt: 9.2, tucne: true, proklad: 1.3 }
    const stX: Styl = opts.stText ?? { pt: 9.6, barva: PAPIR.inkoust2, proklad: 1.4 }
    const vyskaBodu = (p: { titulek: string; text: string }, w: number) =>
      this.vyskaTextu(p.titulek, w, stT) + 0.4 + this.vyskaTextu(p.text, w, stX)
    return {
      vyska: (sirka) =>
        polozky.reduce((a, p) => a + vyskaBodu(p, sirka - odsazeni), 0) + mezera * Math.max(0, polozky.length - 1),
      kresli: (x, y, sirka) => {
        let yy = y
        polozky.forEach((p, i) => {
          this.nastav({ ...stT, barva: PAPIR.inkoust3 })
          this.doc.text(opts.odrazky ? "•" : `${i + 1}.`, x, this.ucari(yy, stT))
          yy += this.pis(p.titulek, x + odsazeni, yy, sirka - odsazeni, stT) + 0.4
          yy += this.pis(p.text, x + odsazeni, yy, sirka - odsazeni, stX) + mezera
        })
      },
    }
  }

  /** Údaje pod sebou: popis vlevo, hodnota vpravo, mezi nimi vlasová linka. */
  udaje(polozky: Polozka[], st: Styl = { pt: 9.2, barva: PAPIR.inkoust2, proklad: 1.35 }): Blok {
    const stH: Styl = { ...st, tucne: true, barva: PAPIR.inkoust }
    const sv = 1.7
    const vyskaRadku = (p: Polozka, sirka: number) => {
      const wH = Math.min(sirka * 0.5, this.sirkaTextu(p.hodnota, stH) + 0.5)
      return Math.max(this.vyskaTextu(p.popis, sirka - wH - 4, st), this.vyskaTextu(p.hodnota, wH, stH)) + 2 * sv
    }
    return {
      vyska: (sirka) => polozky.reduce((a, p) => a + vyskaRadku(p, sirka), 0),
      kresli: (x, y, sirka) => {
        let yy = y
        polozky.forEach((p, i) => {
          const v = vyskaRadku(p, sirka)
          const wH = Math.min(sirka * 0.5, this.sirkaTextu(p.hodnota, stH) + 0.5)
          this.pis(p.popis, x, yy + sv, sirka - wH - 4, st)
          this.pis(p.hodnota, x + sirka - wH, yy + sv, wH, { ...stH, barva: p.barva ?? PAPIR.inkoust }, "right")
          if (i < polozky.length - 1) this.vodorovna(x, yy + v, sirka, PAPIR.linka, 0.15)
          yy += v
        })
      },
    }
  }

  /** Dvanáct políček na odškrtávání týdnů. */
  tydny(pocet = 12): Blok {
    const stCislo: Styl = { pt: 5.6, barva: PAPIR.inkoust3, proklad: 1.2 }
    const ctverec = 4.2
    return {
      vyska: () => this.radek(stCislo) + 0.5 + ctverec,
      kresli: (x, y, sirka) => {
        const gap = 1.2
        const w = (sirka - gap * (pocet - 1)) / pocet
        for (let i = 0; i < pocet; i++) {
          const cx = x + i * (w + gap) + w / 2
          this.pis(String(i + 1), cx - w / 2, y, w, stCislo, "center")
          this.tah(PAPIR.inkoust3, 0.3)
          this.doc.roundedRect(cx - ctverec / 2, y + this.radek(stCislo) + 0.5, ctverec, ctverec, 0.8, 0.8, "S")
        }
      },
    }
  }

  /** Linky na psaní. Pružné: vezmou si místo, které na straně zbude. */
  linky(min = 16, vaha = 1, rozestup = 7.85): Blok {
    return {
      vyska: () => min,
      pruzny: { min, vaha },
      kresli: (x, y, sirka, vyska) => {
        for (let yy = y + rozestup; yy <= y + vyska + 0.01; yy += rozestup) {
          this.vodorovna(x, yy, sirka, PAPIR.linka, 0.25)
        }
      },
    }
  }

  /** Nadpis a pod ním linky. Celé pružné, takže nadpis nikdy nezůstane bez linek. */
  zapis(nadpis: string, minLinek = 2, vaha = 1): Blok {
    const hlava = this.h3(nadpis)
    const rozestup = 7.85
    const min = (sirka: number) => hlava.vyska(sirka) + 1.5 + minLinek * rozestup
    return {
      vyska: (sirka) => min(sirka),
      pruzny: { min: min(SIRKA_SAZBY), vaha },
      kresli: (x, y, sirka, vyska) => {
        const v = hlava.vyska(sirka)
        hlava.kresli(x, y, sirka, v)
        this.linky(0, 1, rozestup).kresli(x, y + v + 1.5, sirka, vyska - v - 1.5)
      },
    }
  }

  /** Řádek na podpisy: linka a pod ní popisek. */
  podpisy(popisky: string[]): Blok {
    const st: Styl = { pt: 7.4, barva: PAPIR.inkoust3 }
    const gap = 8
    return {
      vyska: () => 1.2 + this.radek(st),
      kresli: (x, y, sirka) => {
        const w = (sirka - gap * (popisky.length - 1)) / popisky.length
        popisky.forEach((p, i) => {
          const xx = x + i * (w + gap)
          this.vodorovna(xx, y, w, PAPIR.inkoust3, 0.25)
          this.pis(p, xx, y + 1.2, w, st)
        })
      },
    }
  }

  /** Velké číslo s drobným doplňkem: „95 ze 120“. */
  skore(hodnota: string, doplnek: string): Blok {
    const stCislo: Styl = { pt: 30, tucne: true, proklad: 1 }
    const stDoplnek: Styl = { pt: 8.5, barva: PAPIR.inkoust3 }
    return {
      vyska: () => this.radek(stCislo),
      kresli: (x, y) => {
        const ucari = this.ucari(y, stCislo)
        this.nastav(stCislo)
        this.doc.text(hodnota, x, ucari)
        const w = this.sirkaTextu(hodnota, stCislo)
        this.nastav(stDoplnek)
        this.doc.text(doplnek, x + w + 1, ucari)
      },
    }
  }

  /** Samostatný štítek pásma. S `vyska` se usadí doprostřed řádku té výšky, třeba vedle nadpisu. */
  stitekBlok(text: string, pasmo: BandKey, vyska?: number): Blok {
    return {
      vyska: () => vyska ?? 7.2 * BOD + 2.1,
      kresli: (x, y, _s, vyska) => {
        this.stitek(x, y + vyska / 2, text, pasmo)
      },
    }
  }

  /** Řádek s názvem vlevo a hodnotou s tečkami pásma vpravo, pod ním tenký pruh. */
  fazeta(nazev: string, hodnota: string, procenta: number, pasmo: BandKey | null): Blok {
    const st: Styl = { pt: 8.2, proklad: 1.25, barva: PAPIR.inkoust }
    const stH: Styl = { pt: 8.2, tucne: true, proklad: 1.25 }
    const vpravo = () => this.sirkaTextu(hodnota, stH) + (pasmo ? 1.2 + this.sirkaTecek(0.42) : 0)
    return {
      vyska: (sirka) => this.vyskaTextu(nazev, sirka - vpravo() - 2, st) + 0.9 + 1.6,
      kresli: (x, y, sirka) => {
        const vn = this.pis(nazev, x, y, sirka - vpravo() - 2, st)
        const ucari = this.ucari(y, stH)
        let xx = x + sirka
        if (pasmo) {
          xx -= this.sirkaTecek(0.42)
          this.tecky(xx, ucari - 0.35 * stH.pt * BOD, pasmo, 0.42)
          xx -= 1.2
        }
        this.nastav({ ...stH, barva: pasmo ? BARVY_PASEM[pasmo].pismo : PAPIR.inkoust })
        this.doc.text(hodnota, xx, ucari, { align: "right" })
        this.pruh(x, y + vn + 0.9, sirka, 1.6, procenta)
      },
    }
  }

  // -------------------------------------------------------------------------
  // Strany
  // -------------------------------------------------------------------------

  /** Kolik místa by bloky zabraly při dané mezeře. Pružné bloky se počítají svým minimem. */
  zmer(bloky: Blok[], mezera = 5.8): number {
    const b = bloky.filter(Boolean)
    return (
      b.reduce((a, x) => a + (x.pruzny ? x.pruzny.min : x.vyska(this.sirka)), 0) + mezera * Math.max(0, b.length - 1)
    )
  }

  /**
   * Přidá stranu a vysází na ni bloky shora dolů. Pružné bloky si rozdělí
   * místo, které zbude, podle své váhy.
   */
  strana(hlavicka: Hlavicka, bloky: MoznyBlok[], opts: { mezera?: number; paticka?: string } = {}) {
    const b = bloky.filter(Boolean) as Blok[]
    const mezera = opts.mezera ?? 5.8
    if (this.strany.length) this.doc.addPage("a4", "portrait")
    this.strany.push({ hlavicka, paticka: opts.paticka })

    const pevne = this.zmer(b, mezera)
    const zbyva = this.vyskaPlochy - pevne
    if (zbyva < -0.5) this.preteceni.push({ strana: this.strany.length, mm: Math.round(-zbyva * 10) / 10 })
    const vahy = b.reduce((a, x) => a + (x.pruzny?.vaha ?? 0), 0)

    let y = SESTAVA.okraj.horni
    for (const blok of b) {
      const v = blok.pruzny
        ? blok.pruzny.min + (vahy > 0 ? (Math.max(0, zbyva) * blok.pruzny.vaha) / vahy : 0)
        : blok.vyska(this.sirka)
      blok.kresli(SESTAVA.okraj.levy, y, this.sirka, v)
      y += v + mezera
    }
  }

  /**
   * Bloky, které se nemusí vejít na jednu stranu. Sázejí se postupně a další
   * strana začne, když se další blok nevejde. Nadpis proto patří do jednoho
   * bloku s tím, co pod ním je, jinak by mohl zůstat sám na konci strany.
   * Na poslední straně dostanou zbylé místo poznámky, pokud se vejdou.
   */
  tok(hlavicka: Hlavicka, bloky: MoznyBlok[], opts: { mezera?: number; poznamky?: Blok; paticka?: string } = {}) {
    const b = bloky.filter(Boolean) as Blok[]
    const mezera = opts.mezera ?? 5.8
    // Když chybí jen kousek, stáhnou se mezery a obsah zůstane na jedné straně.
    // Jinak by na další straně osiřela jedna věta a pod ní prázdný list.
    for (const tesnejsi of [mezera, mezera * 0.8, mezera * 0.65]) {
      if (this.zmer(b, tesnejsi) <= this.vyskaPlochy) {
        const sPoznamkami = opts.poznamky && this.zmer([...b, opts.poznamky], tesnejsi) <= this.vyskaPlochy
        this.strana(hlavicka, sPoznamkami ? [...b, opts.poznamky!] : b, { mezera: tesnejsi, paticka: opts.paticka })
        return
      }
    }
    let strana: Blok[] = []
    for (const blok of b) {
      if (strana.length && this.zmer([...strana, blok], mezera) > this.vyskaPlochy) {
        this.strana(hlavicka, strana, { mezera, paticka: opts.paticka })
        strana = []
      }
      strana.push(blok)
    }
    if (opts.poznamky && this.zmer([...strana, opts.poznamky], mezera) <= this.vyskaPlochy) strana.push(opts.poznamky)
    if (strana.length) this.strana(hlavicka, strana, { mezera, paticka: opts.paticka })
  }

  /**
   * Strana s několika rozvrženími od nejvzdušnějšího po nejtěsnější. Vezme
   * první, které se vejde. Když se nevejde ani to poslední, obsah přeteče na
   * další stranu, místo aby se vysázel přes zápatí.
   */
  stranaVeVariantach(
    hlavicka: Hlavicka,
    varianty: { bloky: MoznyBlok[]; mezera: number }[],
    opts: { paticka?: string } = {},
  ) {
    for (const v of varianty) {
      const b = v.bloky.filter(Boolean) as Blok[]
      if (this.zmer(b, v.mezera) <= this.vyskaPlochy) {
        this.strana(hlavicka, b, { mezera: v.mezera, paticka: opts.paticka })
        return
      }
    }
    const posledni = varianty[varianty.length - 1]
    this.tok(hlavicka, posledni.bloky, { mezera: posledni.mezera, paticka: opts.paticka })
  }

  get pocetStran(): number {
    return this.strany.length
  }

  /** Záhlaví a zápatí na všechny strany, až je známý jejich počet. Vrací hotové PDF. */
  dokonci(patickaVychozi: string): Blob {
    const celkem = this.strany.length
    const x = SESTAVA.okraj.levy
    const sirka = this.sirka
    const stDrobne: Styl = { pt: 6.6, barva: PAPIR.inkoust3, proklad: 1.2, prostrkani: 0.05 }
    const stZnacka: Styl = { pt: 6.6, tucne: true, barva: PAPIR.inkoust, proklad: 1.2, prostrkani: 0.37 }
    this.strany.forEach((s, i) => {
      this.doc.setPage(i + 1)
      // záhlaví
      const yZ = 8
      const levy = s.hlavicka.znacka ? stZnacka : stDrobne
      const sirkaPrava = Math.min(sirka * 0.45, this.sirkaTextu(s.hlavicka.vpravo, stDrobne) + 0.5)
      this.pis(s.hlavicka.vlevo, x, yZ, sirka - sirkaPrava - 4, levy)
      this.pis(s.hlavicka.vpravo, x + sirka - sirkaPrava, yZ, sirkaPrava, stDrobne, "right")
      this.vodorovna(x, yZ + this.radek(stDrobne) + 1.6, sirka)
      // zápatí
      const yP = SESTAVA.vyskaStrany - 7.5 - this.radek(stDrobne)
      this.vodorovna(x, yP - 1.6, sirka)
      const cislo = `${i + 1} / ${celkem}`
      const sirkaCisla = this.sirkaTextu(cislo, stDrobne) + 0.5
      this.pis(s.paticka ?? patickaVychozi, x, yP, sirka - sirkaCisla - 4, stDrobne)
      this.pis(cislo, x + sirka - sirkaCisla, yP, sirkaCisla, stDrobne, "right")
    })
    return this.doc.output("blob")
  }
}

/**
 * Hranice mezi pásmy v procentech osy.
 *
 * Pásma jsou celočíselná (24–54, 55–82…), takže hranice leží v půlce mezi
 * koncem jednoho a začátkem dalšího. Ryska tak sedí tam, kde se pásmo opravdu
 * mění, a ne o půl bodu vedle.
 */
export function hranicePasem(pasma: { min: number; max: number }[], min: number, max: number): number[] {
  return pasma.slice(0, -1).map((p) => ((p.max + 0.5 - min) / (max - min)) * 100)
}
