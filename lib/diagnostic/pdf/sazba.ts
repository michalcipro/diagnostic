import { jsPDF } from "jspdf"
import type { Lang } from "../types"
import { FONT_BOLD, FONT_REGULAR } from "./font"

// Sdílený sazeč pro všechna PDF s vyhodnocením.
//
// Proč se PDF skládá tady a nenechává se na tiskovém dialogu prohlížeče:
// na iPhonu z tiskového dialogu nejde soubor uložit ani odeslat. Takhle
// vznikne skutečný soubor, který jde přes systémové sdílení poslat klientovi
// nebo uložit do Souborů. Text zůstává textem, takže se v PDF dá vyhledávat
// a soubor váží desítky kilobajtů, ne megabajty.
//
// Sazba stojí na jednom svislém rytmu: každý blok si nejdřív řekne o místo,
// pak se vykreslí. Pruh skóre má vždy dráhu přes celou šířku sazby a nad
// sebou míň místa než pod sebou, aby patřil k řádku nad ním a nečetl se jako
// podtržení odstavce, který následuje.
//
// Výplň pruhu má jednu barvu. Pásmo nese štítek se slovem, ne odstín:
// červená a oranžová jsou pro protanopii prakticky totožné, takže barevně
// kódovaná pásma by pro část lidí nesla nulovou informaci.

export const A4 = { sirka: 210, vyska: 297 }
export const OKRAJ = { levy: 18, pravy: 18, horni: 20, dolni: 22 }
export const SIRKA = A4.sirka - OKRAJ.levy - OKRAJ.pravy
export const PRAVY_KRAJ = A4.sirka - OKRAJ.pravy

export type RGB = [number, number, number]

export const BARVA = {
  text: [28, 28, 30] as RGB,
  text2: [90, 90, 95] as RGB,
  slaba: [142, 142, 147] as RGB,
  linka: [226, 226, 231] as RGB,
  podklad: [244, 244, 247] as RGB,
  drazka: [230, 230, 236] as RGB,
  znacka: [0, 113, 227] as RGB,
  /** utlumená data: dost tmavá, aby pruh byl vidět i bez čísla vedle */
  tlumena: [144, 144, 153] as RGB,
  bila: [255, 255, 255] as RGB,
}

/** Barvy jednoho štítku. */
export interface BarvyStitku {
  pismo: RGB
  podklad: RGB
}

/** Neutrální štítek pro popisky, které nejsou dobrá ani špatná zpráva. */
export const STITEK_NEUTRALNI: BarvyStitku = {
  pismo: BARVA.text2,
  podklad: BARVA.podklad,
}

/** Sloupec tabulky. Podíly všech sloupců mají dohromady dát jedničku. */
export interface SloupecTabulky {
  popis: string
  podil: number
  /** čísla patří doprava, text doleva */
  vpravo?: boolean
}

/**
 * Buňka tabulky.
 *
 * Krátký zápis je samotný řetězec. Delší tvar umí ztučnit, obarvit a hlavně
 * vykreslit pruh: úspěšnost se v tabulce čte líp jako délka než jako procento,
 * a když je pruh přímo v buňce, nemusí se kvůli němu stavět druhá tabulka.
 */
export type BunkaTabulky =
  | string
  | {
      text?: string
      tucne?: boolean
      barva?: RGB
      /** 0 až 100; vykreslí pruh přes šířku sloupce */
      pruh?: number
      barvaPruhu?: RGB
    }

const MESICE_EN = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

/**
 * Datum v místním tvaru. Vstup je ISO, ať se dá řadit.
 * Čeština i slovenština píšou „29. 7. 2026", angličtina „29 Jul 2026".
 */
export function datumLokalne(iso: string | undefined, lang: Lang): string {
  if (!iso) return ""
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso)
  if (!m) return iso
  if (lang === "en") return `${Number(m[3])} ${MESICE_EN[Number(m[2]) - 1]} ${m[1]}`
  return `${Number(m[3])}. ${Number(m[2])}. ${m[1]}`
}

/** Nový dokument s nahranými řezy písma. */
export function novyDokument(): jsPDF {
  const doc = new jsPDF({ unit: "mm", format: "a4", compress: true })
  doc.addFileToVFS("Liberation-Regular.ttf", FONT_REGULAR)
  doc.addFont("Liberation-Regular.ttf", "Liberation", "normal")
  doc.addFileToVFS("Liberation-Bold.ttf", FONT_BOLD)
  doc.addFont("Liberation-Bold.ttf", "Liberation", "bold")
  return doc
}

/** Sazeč, který si hlídá pozici na stránce a sám zalamuje. */
export class Sazba {
  doc: jsPDF
  y = OKRAJ.horni

  constructor(doc: jsPDF) {
    this.doc = doc
  }

  /** Zalomí stránku, pokud se výška nevejde. */
  misto(vyska: number) {
    if (this.y + vyska <= A4.vyska - OKRAJ.dolni) return
    this.zalom()
  }

  mezera(v: number) {
    this.y += v
  }

  /** Vynucené zalomení na novou stránku. */
  zalom() {
    this.doc.addPage()
    this.y = OKRAJ.horni
  }

  /** Kolik místa na stránce ještě zbývá. */
  zbyva(): number {
    return A4.vyska - OKRAJ.dolni - this.y
  }

  pismo(velikost: number, tucne = false, barva: RGB = BARVA.text) {
    this.doc.setFont("Liberation", tucne ? "bold" : "normal")
    this.doc.setFontSize(velikost)
    this.doc.setTextColor(barva[0], barva[1], barva[2])
  }

  /** Šířka textu v daném písmu. */
  sirkaTextu(t: string, velikost: number, tucne = false): number {
    this.pismo(velikost, tucne)
    return this.doc.getTextWidth(t)
  }

  /** Odstavec se zalomením mezi stránkami. */
  text(
    obsah: string,
    opts: {
      velikost?: number
      tucne?: boolean
      kurziva?: boolean
      barva?: RGB
      sirka?: number
      x?: number
      radek?: number
      prostrkani?: number
    } = {},
  ) {
    if (!obsah) return
    const velikost = opts.velikost ?? 9.6
    const sirka = opts.sirka ?? SIRKA
    const x = opts.x ?? OKRAJ.levy
    const radek = opts.radek ?? velikost * 0.5
    this.pismo(velikost, opts.tucne, opts.barva)
    const radky = this.doc.splitTextToSize(obsah, sirka) as string[]
    for (const r of radky) {
      this.misto(radek)
      this.pismo(velikost, opts.tucne, opts.barva)
      this.doc.text(r, x, this.y, opts.prostrkani ? { charSpace: opts.prostrkani } : undefined)
      this.y += radek
    }
  }

  /** Vodorovná linka přes celou sazbu. */
  linka(barva: RGB = BARVA.linka) {
    this.misto(1)
    this.doc.setDrawColor(barva[0], barva[1], barva[2])
    this.doc.setLineWidth(0.2)
    this.doc.line(OKRAJ.levy, this.y, PRAVY_KRAJ, this.y)
  }

  /** Nadpis oddílu: text a pod ním tenká linka. */
  nadpis(text: string, velikost = 13.5) {
    this.misto(velikost * 0.6 + 14)
    this.text(text, { velikost, tucne: true, radek: velikost * 0.34 })
    this.mezera(3)
    this.linka()
    this.mezera(6)
  }

  /**
   * Štítek. Kreslí se doleva od `konec`, vrací svoji šířku, aby se vedle něj
   * dalo zarovnat skóre.
   */
  stitek(popis: string, barvy: BarvyStitku, konec: number, stred: number): number {
    if (!popis) return 0
    const velikost = 7.4
    const sirka = this.sirkaTextu(popis, velikost, true) + 5.4
    const vyska = 4.6
    this.doc.setFillColor(barvy.podklad[0], barvy.podklad[1], barvy.podklad[2])
    this.doc.roundedRect(konec - sirka, stred - vyska / 2, sirka, vyska, 2.3, 2.3, "F")
    this.pismo(velikost, true, barvy.pismo)
    this.doc.text(popis, konec - sirka / 2, stred + 1.15, { align: "center" })
    return sirka
  }

  /** Dráha s výplní. Kreslí se na dané y, nemění pozici sazby. */
  pruh(
    y: number,
    procenta: number,
    opts: { vyska?: number; x?: number; sirka?: number; barva?: RGB } = {},
  ) {
    const vyska = opts.vyska ?? 2.6
    const x = opts.x ?? OKRAJ.levy
    const sirka = opts.sirka ?? SIRKA
    const r = vyska / 2
    this.doc.setFillColor(BARVA.drazka[0], BARVA.drazka[1], BARVA.drazka[2])
    this.doc.roundedRect(x, y, sirka, vyska, r, r, "F")
    const w = Math.max(vyska, (sirka * Math.min(100, Math.max(0, procenta))) / 100)
    const b = opts.barva ?? BARVA.znacka
    this.doc.setFillColor(b[0], b[1], b[2])
    this.doc.roundedRect(x, y, w, vyska, r, r, "F")
  }

  /**
   * Řádek se skóre: název vlevo, hodnota a štítek vpravo, pod tím pruh.
   * `odsazeni` odlišuje podřízené škály od hlavních.
   */
  radekSkore(
    nazev: string,
    hodnota: string,
    stitekText: string,
    stitekBarvy: BarvyStitku,
    procenta: number,
    opts: {
      odsazeni?: number
      velikost?: number
      tucne?: boolean
      mezeraPo?: number
      barvaPruhu?: RGB
    } = {},
  ) {
    const odsazeni = opts.odsazeni ?? 0
    const velikost = opts.velikost ?? 9.8
    const x = OKRAJ.levy + odsazeni
    const sirka = SIRKA - odsazeni

    this.misto(11)
    const zaklad = this.y

    const sirkaStitku = this.stitek(stitekText, stitekBarvy, PRAVY_KRAJ, zaklad - 1)

    this.pismo(9.4, true, BARVA.text)
    const konecHodnoty = PRAVY_KRAJ - sirkaStitku - (sirkaStitku ? 3 : 0)
    this.doc.text(hodnota, konecHodnoty, zaklad, { align: "right" })
    const sirkaHodnoty = this.doc.getTextWidth(hodnota)

    // Název se ořízne tak, aby nikdy nevlezl pod hodnotu.
    const mistoNaNazev = sirka - sirkaStitku - sirkaHodnoty - 8
    this.pismo(velikost, opts.tucne ?? false, opts.tucne ? BARVA.text : BARVA.text2)
    const [prvniRadek] = this.doc.splitTextToSize(nazev, Math.max(10, mistoNaNazev)) as string[]
    this.doc.text(prvniRadek ?? nazev, x, zaklad)

    // Pruh patří k řádku nad sebou, proto je nad ním míň místa než pod ním.
    this.y = zaklad + 3
    const vyskaPruhu = odsazeni ? 2.2 : 2.8
    this.pruh(this.y, procenta, { x, sirka, vyska: vyskaPruhu, barva: opts.barvaPruhu })
    this.y += vyskaPruhu + (opts.mezeraPo ?? 7)
  }

  /** Řádek pro škálu, která se pro chybějící odpovědi nevykazuje. */
  radekChybi(nazev: string, popis: string, odsazeni = 0) {
    this.misto(9)
    const zaklad = this.y
    const x = OKRAJ.levy + odsazeni
    this.pismo(9.4, false, BARVA.text2)
    this.doc.text(nazev, x, zaklad)
    this.pismo(8.4, false, BARVA.slaba)
    this.doc.text(popis, PRAVY_KRAJ, zaklad, { align: "right" })
    this.y = zaklad + 3.2
    this.doc.setDrawColor(BARVA.linka[0], BARVA.linka[1], BARVA.linka[2])
    this.doc.setLineWidth(0.4)
    this.doc.setLineDashPattern([1, 1.2], 0)
    this.doc.line(x, this.y + 1.2, x + SIRKA - odsazeni, this.y + 1.2)
    this.doc.setLineDashPattern([], 0)
    this.y += 6.4
  }

  /**
   * Mřížka údajů: nad hodnotou drobný popisek. Sloupce mají stejnou šířku,
   * takže hlavička lícuje bez ohledu na délku hodnot.
   */
  mrizkaUdaju(polozky: { popis: string; hodnota: string }[], sloupcu = 3, velikost = 9.8) {
    if (!polozky.length) return
    // Čtyři údaje ve třech sloupcích nechají poslední osamocený; dva sloupce
    // je rozdělí na dvě plné řady.
    if (polozky.length === 4 && sloupcu === 3) sloupcu = 2
    const sirkaSloupce = SIRKA / sloupcu
    for (let i = 0; i < polozky.length; i += sloupcu) {
      const rada = polozky.slice(i, i + sloupcu)
      // nejvyšší buňka v řadě určuje výšku
      let radku = 1
      for (const p of rada) {
        this.pismo(velikost, true)
        radku = Math.max(
          radku,
          (this.doc.splitTextToSize(p.hodnota, sirkaSloupce - 6) as string[]).length,
        )
      }
      const vyska = 3.4 + radku * (velikost * 0.5) + 3
      this.misto(vyska)
      const zaklad = this.y
      rada.forEach((p, j) => {
        const x = OKRAJ.levy + j * sirkaSloupce
        this.pismo(6.8, true, BARVA.slaba)
        this.doc.text(p.popis.toUpperCase(), x, zaklad, { charSpace: 0.35 })
        this.pismo(velikost, true, BARVA.text)
        const radky = this.doc.splitTextToSize(p.hodnota, sirkaSloupce - 6) as string[]
        radky.forEach((r, k) => this.doc.text(r, x, zaklad + 4.2 + k * (velikost * 0.5)))
      })
      this.y = zaklad + vyska
    }
  }

  /** Odstavec na barevném podkladu. */
  ramecek(
    obsah: string,
    opts: { velikost?: number; tucne?: boolean; barva?: RGB; odsazeni?: number } = {},
  ) {
    const velikost = opts.velikost ?? 9.6
    const radek = velikost * 0.52
    const odsazeni = opts.odsazeni ?? 0
    const sirka = SIRKA - odsazeni
    this.pismo(velikost, opts.tucne)
    const radky = this.doc.splitTextToSize(obsah, sirka - 12) as string[]
    const vyska = radky.length * radek + 9
    this.misto(vyska + 2)
    const podklad = opts.barva ?? BARVA.podklad
    this.doc.setFillColor(podklad[0], podklad[1], podklad[2])
    this.doc.roundedRect(OKRAJ.levy + odsazeni, this.y, sirka, vyska, 3, 3, "F")
    this.y += 6
    for (const r of radky) {
      this.pismo(velikost, opts.tucne, BARVA.text)
      this.doc.text(r, OKRAJ.levy + odsazeni + 6, this.y)
      this.y += radek
    }
    this.y += 3
  }

  /**
   * Tabulka s hlavičkou a vlasovými linkami mezi řádky.
   *
   * Svislé linky tu nejsou schválně: sloupce drží zarovnání samo a mřížka
   * navíc jen přidá šum. Čísla jdou doprava, text doleva, protože při čtení
   * sloupce číslic se oko chytá jednotek, ne první číslice.
   *
   * Hlavička se po zalomení stránky zopakuje. Bez toho by druhá strana delší
   * tabulky byla jen hromada čísel bez popisků.
   */
  tabulka(
    sloupce: SloupecTabulky[],
    radky: BunkaTabulky[][],
    opts: { velikost?: number; x?: number; sirka?: number } = {},
  ) {
    if (!radky.length) return
    const velikost = opts.velikost ?? 9.2
    const x0 = opts.x ?? OKRAJ.levy
    const sirka = opts.sirka ?? SIRKA
    const vyskaRadku = velikost * 0.62 + 4.4
    const odsazeniBunky = 2

    const hranice = (i: number) => {
      let podil = 0
      for (let k = 0; k < i; k++) podil += sloupce[k].podil
      return x0 + sirka * podil
    }

    const hlavicka = () => {
      this.misto(vyskaRadku + 4)
      const zaklad = this.y + 3.4
      this.pismo(6.8, true, BARVA.slaba)
      sloupce.forEach((sl, i) => {
        if (!sl.popis) return
        const levy = hranice(i)
        const pravy = hranice(i) + sirka * sl.podil
        if (sl.vpravo) {
          this.doc.text(sl.popis.toUpperCase(), pravy - odsazeniBunky, zaklad, {
            align: "right",
            charSpace: 0.35,
          })
        } else {
          this.doc.text(sl.popis.toUpperCase(), levy + odsazeniBunky, zaklad, { charSpace: 0.35 })
        }
      })
      this.y = zaklad + 2.2
      this.doc.setDrawColor(BARVA.linka[0], BARVA.linka[1], BARVA.linka[2])
      this.doc.setLineWidth(0.3)
      this.doc.line(x0, this.y, x0 + sirka, this.y)
      this.y += 1.2
    }

    hlavicka()

    radky.forEach((radek, r) => {
      if (this.y + vyskaRadku > A4.vyska - OKRAJ.dolni) {
        this.zalom()
        hlavicka()
      }
      const zaklad = this.y + vyskaRadku * 0.66
      radek.forEach((bunka, i) => {
        const sl = sloupce[i]
        if (!sl) return
        const levy = hranice(i)
        const sirkaSloupce = sirka * sl.podil
        const pravy = levy + sirkaSloupce
        const b = typeof bunka === "string" ? { text: bunka } : bunka

        if (typeof b.pruh === "number") {
          this.pruh(zaklad - 1.6, b.pruh, {
            x: levy + odsazeniBunky,
            sirka: sirkaSloupce - odsazeniBunky * 2,
            vyska: 2.2,
            barva: b.barvaPruhu,
          })
          return
        }
        if (!b.text) return

        this.pismo(velikost, b.tucne, b.barva ?? (b.tucne ? BARVA.text : BARVA.text2))
        if (sl.vpravo) {
          this.doc.text(b.text, pravy - odsazeniBunky, zaklad, { align: "right" })
        } else {
          const [prvni] = this.doc.splitTextToSize(
            b.text,
            Math.max(8, sirkaSloupce - odsazeniBunky * 2),
          ) as string[]
          this.doc.text(prvni ?? b.text, levy + odsazeniBunky, zaklad)
        }
      })
      this.y += vyskaRadku
      if (r < radky.length - 1) {
        this.doc.setDrawColor(BARVA.linka[0], BARVA.linka[1], BARVA.linka[2])
        this.doc.setLineWidth(0.15)
        this.doc.line(x0, this.y, x0 + sirka, this.y)
      }
    })
    this.y += 2
  }

  /**
   * Sloupcový graf. Používá se pro vývoj v čase a rozdíly mezi dny v týdnu.
   *
   * Chybějící hodnota se kreslí jen jako prázdná dráha, ne jako nula: měsíc
   * bez zápisu není měsíc s nulovým skóre.
   */
  graf(
    body: { popisek: string; hodnota?: number }[],
    max: number,
    opts: { vyska?: number; barva?: RGB; popisHodnoty?: (v: number) => string } = {},
  ) {
    if (!body.length) return
    const vyska = opts.vyska ?? 24
    // Nad sloupcem je řádek na hodnotu, pod ním na popisek.
    this.misto(vyska + 12)
    const zaklad = this.y + 4
    const rozestup = SIRKA / body.length
    const sirkaSloupce = Math.min(rozestup * 0.42, 7)

    body.forEach((b, i) => {
      const stred = OKRAJ.levy + rozestup * (i + 0.5)
      const x = stred - sirkaSloupce / 2
      this.doc.setFillColor(BARVA.drazka[0], BARVA.drazka[1], BARVA.drazka[2])
      this.doc.roundedRect(x, zaklad, sirkaSloupce, vyska, 1, 1, "F")
      if (typeof b.hodnota === "number") {
        const h = Math.max(1, vyska * Math.min(1, Math.max(0, b.hodnota / max)))
        const barva = opts.barva ?? BARVA.znacka
        this.doc.setFillColor(barva[0], barva[1], barva[2])
        this.doc.roundedRect(x, zaklad + vyska - h, sirkaSloupce, h, 1, 1, "F")
        // Hodnota nad sloupcem. Bez ní se dva sloupce lišící se o desetinu
        // nedají od sebe rozeznat a graf tvrdí, že se nic nezměnilo.
        if (opts.popisHodnoty) {
          this.pismo(6.4, true, BARVA.text2)
          this.doc.text(opts.popisHodnoty(b.hodnota), stred, zaklad - 1.4, { align: "center" })
        }
      }
      this.pismo(6.4, false, BARVA.slaba)
      this.doc.text(b.popisek, stred, zaklad + vyska + 4, { align: "center" })
    })
    this.y = zaklad + vyska + 8
  }

  /** Patička na každé straně: linka, text vlevo, číslo strany vpravo. */
  paticka(popis: string) {
    const stran = this.doc.getNumberOfPages()
    for (let i = 1; i <= stran; i++) {
      this.doc.setPage(i)
      this.doc.setDrawColor(BARVA.linka[0], BARVA.linka[1], BARVA.linka[2])
      this.doc.setLineWidth(0.2)
      this.doc.line(OKRAJ.levy, A4.vyska - 14, PRAVY_KRAJ, A4.vyska - 14)
      this.pismo(7.4, false, BARVA.slaba)
      this.doc.text(popis, OKRAJ.levy, A4.vyska - 9.5)
      this.doc.text(`${i}/${stran}`, PRAVY_KRAJ, A4.vyska - 9.5, { align: "right" })
    }
  }
}
