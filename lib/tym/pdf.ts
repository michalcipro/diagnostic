import {
  BARVA,
  OKRAJ,
  PRAVY_KRAJ,
  SIRKA,
  Sazba,
  novyDokument,
  type RGB,
} from "../diagnostic/pdf/sazba"
import { TYM, type TymLang } from "./obsah"
import { CASTI, KRATCE, MAPA, shodaKratce, slovoUrovne } from "./slova"
import {
  MAPA_ROZSAH,
  krokSkaly,
  podilX,
  podilY,
  rozestrkej,
  rozprostri,
  vyberUkazku,
} from "./mapa-geometrie"
import { RAMEC } from "./ramec"
import { VYKLAD } from "./vyklad"
import {
  oblastiKOtazkam,
  oblastiSPraci,
  sestavPlan,
  sestavShrnuti,
  tvarKlic,
  urovenKlic,
  type ProfilProCteni,
} from "./plan"
import type { NalezKod } from "./typy"
import type { DimensionId } from "../diagnostic/types"

// PDF týmového reportu.
//
// Osm oddílů v pořadí, ve kterém je kouč potřebuje. Nejdřív shrnutí, které
// stojí samo o sobě, potom návod, jak report číst, pak podklad, a nakonec
// plán práce a mantinely. Kdo dočte první stranu, má to podstatné; kdo dočte
// všechno, ví i proč.
//
// Vstup je hotový profil ze serveru. Prahy, podle kterých nálezy vznikly,
// tady nejsou a nemají tu co dělat.

/** Profil, jak ho vrací server. Drží se tvaru z convex/teams.ts. */
export interface TymPdfVstup extends ProfilProCteni {
  nazev: string
}

const PORADI: DimensionId[] = ["A", "B", "C", "D", "E", "F", "G"]
const CERVENA: RGB = [255, 59, 48]
const ZELENA: RGB = [48, 209, 88]
const ORANZOVA: RGB = [255, 149, 0]

/** Podklady kvadrantů. Světlé natolik, aby text nad nimi zůstal čitelný. */
const CERVENA_SVETLA: RGB = [255, 241, 240]
const ZELENA_SVETLA: RGB = [232, 249, 237]
const ORANZOVA_SVETLA: RGB = [255, 245, 230]

/** Pětistupňová škála a barva textu na ní. Stejné hodnoty jako v aplikaci. */
const SKALA: RGB[] = [
  [134, 182, 228],
  [95, 154, 214],
  [53, 116, 184],
  [35, 89, 160],
  [13, 60, 107],
]
const SKALA_TEXT: RGB[] = [
  [16, 36, 58],
  [16, 36, 58],
  [255, 255, 255],
  [255, 255, 255],
  [255, 255, 255],
]

/** Malý prostrkaný popisek nad odstavcem. */
function popisek(s: Sazba, text: string, barva: RGB = BARVA.slaba, odsazeni = 0) {
  s.misto(5)
  s.pismo(7.2, true, barva)
  s.doc.text(text.toUpperCase(), OKRAJ.levy + odsazeni, s.y, { charSpace: 0.4 })
  s.mezera(4.2)
}

/**
 * Prostrkaný popisek zarovnaný na pravý kraj sazby.
 *
 * jsPDF si při `align: "right"` spočítá šířku textu bez prostrkání, takže
 * text o to prostrkání přeteče za okraj strany. Bylo to vidět na názvech
 * oblastí v plánu: „EMOTION REGULATION AND PERFORMANCE UNDER PRESSURE" končilo
 * dvanáct milimetrů za sazbou. Šířka se proto počítá ručně a text se sází
 * zleva. Když by se do zbylého místa nevešel, zmenší se.
 */
function popisekVpravo(s: Sazba, text: string, y: number, odkud: number) {
  const PROSTRKANI = 0.4
  const misto = PRAVY_KRAJ - odkud
  let velikost = 7.4
  const sirka = (v: number) => s.sirkaTextu(text, v, true) + PROSTRKANI * text.length
  while (velikost > 5.4 && sirka(velikost) > misto) velikost -= 0.2
  s.prostrkany(text, PRAVY_KRAJ, y, velikost, BARVA.slaba, PROSTRKANI)
}

/** Odrážky. Puntík je čtvereček, aby nekolidoval s číslovanými kroky. */
function odrazky(s: Sazba, polozky: string[], velikost = 9.6) {
  for (const p of polozky) {
    s.misto(velikost * 0.5 + 2)
    const y = s.y
    s.doc.setFillColor(BARVA.tlumena[0], BARVA.tlumena[1], BARVA.tlumena[2])
    s.doc.roundedRect(OKRAJ.levy + 0.6, y - 1.6, 1.6, 1.6, 0.4, 0.4, "F")
    s.text(p, {
      velikost,
      barva: BARVA.text2,
      radek: velikost * 0.48,
      x: OKRAJ.levy + 6,
      sirka: SIRKA - 6,
    })
    s.mezera(1.8)
  }
}

/** Číslované kroky. Číslo je ve značkové barvě, text vedle něj. */
function cislovane(s: Sazba, polozky: string[], velikost = 9.6) {
  polozky.forEach((krok, k) => {
    s.misto(velikost * 0.5 + 2)
    const y = s.y
    s.pismo(8.6, true, BARVA.znacka)
    s.doc.text(String(k + 1), OKRAJ.levy, y)
    s.text(krok, {
      velikost,
      barva: BARVA.text2,
      radek: velikost * 0.48,
      x: OKRAJ.levy + 6,
      sirka: SIRKA - 6,
    })
    s.mezera(1.8)
  })
}

/** Pás se čtyřmi pásmy, aby číslo 0 až 100 něco znamenalo. */
function pasmaSkaly(s: Sazba, t: (typeof MAPA)[TymLang]) {
  const podklady = [CERVENA_SVETLA, ORANZOVA_SVETLA, BARVA.podklad, ZELENA_SVETLA]
  const sirka = SIRKA / 4
  s.misto(24)
  const zaklad = s.y
  let nejnizsi = zaklad
  t.pasma.forEach((p, i) => {
    const x = OKRAJ.levy + i * sirka
    const b = podklady[i]
    s.doc.setFillColor(b[0], b[1], b[2])
    s.doc.roundedRect(x + 0.6, zaklad, sirka - 1.2, 20, 2, 2, "F")
    s.pismo(8.6, true, BARVA.text)
    s.doc.text(p.rozsah, x + 4, zaklad + 6)
    s.pismo(7.6, false, BARVA.text2)
    const radky = s.doc.splitTextToSize(p.popis, sirka - 8) as string[]
    radky.slice(0, 3).forEach((r, k) => s.doc.text(r, x + 4, zaklad + 11 + k * 3.4))
    nejnizsi = Math.max(nejnizsi, zaklad + 11 + radky.length * 3.4)
  })
  s.y = Math.max(zaklad + 20, nejnizsi) + 3
}

/**
 * Mapa týmu.
 *
 * Stejné souřadnice jako na obrazovce, jen bez zaostřování. Popisky dostanou
 * bílou podložku, protože v PDF neexistuje obrys textu a přes vlásečnice by
 * se přestaly číst.
 */
function nakresliMapu(s: Sazba, data: TymPdfVstup, t: (typeof MAPA)[TymLang], lang: TymLang) {
  const VYSKA = 104
  const LEVY = 26
  const SIRKA_PLOCHY = SIRKA - LEVY
  const { xMin, xMax, xDel, yMax, yDel } = MAPA_ROZSAH

  s.misto(VYSKA + 26)
  const y0 = s.y + 8
  const x0 = OKRAJ.levy + LEVY
  const X = (u: number) => x0 + podilX(u) * SIRKA_PLOCHY
  const Y = (sd: number) => y0 + podilY(sd) * VYSKA

  s.doc.setFillColor(CERVENA_SVETLA[0], CERVENA_SVETLA[1], CERVENA_SVETLA[2])
  s.doc.rect(X(xMin), Y(yDel), X(xDel) - X(xMin), Y(yMax) - Y(yDel), "F")
  s.doc.setFillColor(ZELENA_SVETLA[0], ZELENA_SVETLA[1], ZELENA_SVETLA[2])
  s.doc.rect(X(xDel), Y(0), X(xMax) - X(xDel), Y(yDel) - Y(0), "F")

  s.doc.setLineWidth(0.15)
  s.doc.setDrawColor(BARVA.linka[0], BARVA.linka[1], BARVA.linka[2])
  for (const v of [55, 60, 65, 70, 75, 80]) {
    s.doc.line(X(v), Y(0), X(v), Y(yMax))
    s.pismo(6.6, false, BARVA.slaba)
    s.doc.text(String(v), X(v), Y(yMax) + 4, { align: "center" })
  }
  s.doc.setDrawColor(BARVA.slaba[0], BARVA.slaba[1], BARVA.slaba[2])
  s.doc.setLineDashPattern([0.8, 0.8], 0)
  s.doc.line(X(xDel), Y(0), X(xDel), Y(yMax))
  s.doc.line(X(xMin), Y(yDel), X(xMax), Y(yDel))
  s.doc.setLineDashPattern([], 0)

  // Osy slovy. Číslo samo trenérovi neřekne, kterým směrem je líp.
  s.pismo(7.4, true, BARVA.text2)
  s.doc.text(t.osaXVlevo, X(xMin), Y(yMax) + 9)
  s.doc.text(t.osaXVpravo, X(xMax), Y(yMax) + 9, { align: "right" })
  s.pismo(7, false, BARVA.slaba)
  s.doc.text(t.osaX, (X(xMin) + X(xMax)) / 2, Y(yMax) + 9, { align: "center" })
  s.pismo(7.4, true, BARVA.text2)
  s.doc.text(t.osaYNahore, X(xMin) - 3, Y(1), { align: "right" })
  s.doc.text(t.osaYDole, X(xMin) - 3, Y(yMax - 1), { align: "right" })

  const rohy: [number, number, "left" | "right", { titul: string; popis: string }][] = [
    [X(xMin) + 2, Y(0) + 4, "left", t.rohy[0]],
    [X(xMax) - 2, Y(0) + 4, "right", t.rohy[1]],
    [X(xMin) + 2, Y(yMax) - 5.5, "left", t.rohy[2]],
    [X(xMax) - 2, Y(yMax) - 5.5, "right", t.rohy[3]],
  ]
  for (const [rx, ry, kotva, r] of rohy) {
    s.pismo(6.8, true, BARVA.text2)
    s.doc.text(r.titul, rx, ry, { align: kotva })
    s.pismo(6.4, false, BARVA.slaba)
    s.doc.text(r.popis, rx, ry + 3, { align: kotva })
  }

  const ukazka = vyberUkazku(data.oblasti, data.casti)
  const nazev = (id: string) => KRATCE[lang][id as DimensionId] ?? id
  // Popisky rohů drží místo; uhnout musí popisek oblasti, ne vysvětlivka.
  const prekazky = rohy.flatMap(([rx, ry, kotva, r]) => [
    { x: rx, y: ry, sirka: s.sirkaTextu(r.titul, 6.8, true), vpravo: kotva === "left" },
    { x: rx, y: ry + 3, sirka: s.sirkaTextu(r.popis, 6.4), vpravo: kotva === "left" },
  ])
  const popisky = rozestrkej(
    rozprostri(
      data.oblasti.map((o) => {
      const x = X(o.prumer)
      const sirka = s.sirkaTextu(nazev(o.id), 7.4, true) + 3
        return { data: o, x, y: Y(o.smodch), ty: Y(o.smodch), sirka, vpravo: x + sirka < X(xMax) }
      }),
      6.4,
    ),
    4.4,
    prekazky,
  )

  // Vlásečnice od oblasti k jejím částem: ukazují, jak daleko utekly.
  s.doc.setLineWidth(0.15)
  s.doc.setDrawColor(200, 200, 206)
  for (const p of popisky) {
    for (const c of data.casti.filter((x) => x.oblast === p.data.id)) {
      s.doc.line(p.x, p.y, X(c.prumer), Y(c.smodch))
    }
  }

  for (const c of data.casti) {
    const cx = X(c.prumer)
    const cy = Y(c.smodch)
    if (c.riziko) {
      const d = 1.5
      s.doc.setFillColor(CERVENA[0], CERVENA[1], CERVENA[2])
      s.doc.lines([[d, d], [d, -d], [-d, -d]], cx - d, cy, [1, 1], "F", true)
    } else {
      s.doc.setFillColor(SKALA[3][0], SKALA[3][1], SKALA[3][2])
      s.doc.circle(cx, cy, 1.4, "F")
    }
  }

  for (const p of popisky) {
    s.doc.setFillColor(255, 255, 255)
    s.doc.setDrawColor(BARVA.text[0], BARVA.text[1], BARVA.text[2])
    s.doc.setLineWidth(0.5)
    s.doc.circle(p.x, p.y, 2.9, "FD")
    s.pismo(7, true, BARVA.text)
    s.doc.text(p.data.id, p.x, p.y + 1.1, { align: "center" })

    if (p.skryt) continue
    const tx = p.vpravo ? p.x + 4 : p.x - 4
    const sirkaTextu = s.sirkaTextu(nazev(p.data.id), 7.4, true)
    s.doc.setFillColor(255, 255, 255)
    s.doc.rect(p.vpravo ? tx - 0.6 : tx - sirkaTextu - 0.6, p.ty - 2, sirkaTextu + 1.2, 3.4, "F")
    s.pismo(7.4, true, BARVA.text)
    s.doc.text(nazev(p.data.id), tx, p.ty + 0.6, { align: p.vpravo ? "left" : "right" })
  }

  // Ukázka čtení na skutečném případu. V PDF si čtenář nemůže na nic najet,
  // takže je tenhle jeden vysvětlený případ to jediné, co ho naučí mapu číst.
  if (ukazka) {
    const ox = X(ukazka.oblast.prumer)
    const oy = Y(ukazka.oblast.smodch)
    const cx = X(ukazka.cast.prumer)
    const cy = Y(ukazka.cast.smodch)
    s.doc.setDrawColor(ORANZOVA[0], ORANZOVA[1], ORANZOVA[2])
    s.doc.setLineWidth(0.3)
    s.doc.setLineDashPattern([0.7, 0.7], 0)
    s.doc.line(cx, cy - 2.4, ox, oy + 3.2)
    s.doc.setLineDashPattern([], 0)
  }

  s.y = Y(yMax) + 14

  // Legenda tvarů. Barva sama význam nenese, tvar a slovo ano.
  s.pismo(7.4, false, BARVA.text2)
  let lx = OKRAJ.levy
  s.doc.setDrawColor(BARVA.text2[0], BARVA.text2[1], BARVA.text2[2])
  s.doc.setLineWidth(0.4)
  s.doc.circle(lx + 1.4, s.y - 1, 1.4, "D")
  s.doc.text(t.legenda[0], lx + 4.4, s.y)
  lx += 6 + s.sirkaTextu(t.legenda[0], 7.4) + 8
  s.doc.setFillColor(SKALA[3][0], SKALA[3][1], SKALA[3][2])
  s.doc.circle(lx + 1.4, s.y - 1, 1.4, "F")
  s.doc.text(t.legenda[1], lx + 4.4, s.y)
  lx += 6 + s.sirkaTextu(t.legenda[1], 7.4) + 8
  s.doc.setFillColor(CERVENA[0], CERVENA[1], CERVENA[2])
  s.doc.lines([[1.5, 1.5], [1.5, -1.5], [-1.5, -1.5]], lx, s.y - 1, [1, 1], "F", true)
  s.doc.text(t.legenda[2], lx + 4.4, s.y)
  s.mezera(4)

  // Vysvětlení ukázky stojí pod grafem, kde je vždycky čitelné a jmenuje
  // oblast i část. Popisek plovoucí v ploše by se pral se jmény oblastí.
  if (ukazka) {
    s.pismo(8, true, ORANZOVA)
    s.misto(5)
    const sirkaTitulku = s.sirkaTextu(`${t.prikladTitul}. `, 8, true)
    s.doc.text(`${t.prikladTitul}.`, OKRAJ.levy, s.y)
    s.text(
      t.prikladVeta(
        KRATCE[lang][ukazka.oblast.id as DimensionId] ?? ukazka.oblast.id,
        CASTI[lang][ukazka.cast.id] ?? ukazka.cast.id,
      ),
      { velikost: 8, barva: BARVA.text2, radek: 3.8, x: OKRAJ.levy + sirkaTitulku, sirka: SIRKA - sirkaTitulku },
    )
    s.mezera(3)
  }
}

/** Šířka dlaždice v mřížce částí. Sdílí ji kreslení i kontrola. */
export const SIRKA_DLAZDICE = (SIRKA - 42 - 2 * 1.6) / 3

/**
 * Velikost písma slova vedle čísla, aby se do dlaždice vešlo.
 *
 * Angličtina má „large differences" tam, kde čeština „velké rozdíly", takže
 * pevná velikost přeteče. Vrací nulu, když se slovo nevejde ani nejmenší
 * velikostí; to je chyba sazby a kontrola na ni upozorní.
 */
export function velikostSlova(
  merac: { sirkaTextu(t: string, velikost: number, tucne?: boolean): number },
  cislo: string,
  slovo: string,
): number {
  const zbyva = SIRKA_DLAZDICE - 6 - merac.sirkaTextu(cislo, 12, true) - 1.6
  let velikost = 6.8
  while (velikost > 4.6 && merac.sirkaTextu(slovo, velikost, true) > zbyva) velikost -= 0.2
  return merac.sirkaTextu(slovo, velikost, true) <= zbyva ? velikost : 0
}

/** Mřížka jednadvaceti částí, tři na řádek. */
function nakresliCasti(s: Sazba, data: TymPdfVstup, t: (typeof MAPA)[TymLang], lang: TymLang) {
  const SLOUPEC_NAZVU = 42
  const MEZERA = 1.6
  const sirkaDlazdice = (SIRKA - SLOUPEC_NAZVU - 2 * MEZERA) / 3
  const vyska = 16

  s.pismo(6.6, true, BARVA.slaba)
  s.misto(6)
  t.castiZahlavi.forEach((h, i) => {
    const x = i === 0 ? OKRAJ.levy : OKRAJ.levy + SLOUPEC_NAZVU + (i - 1) * (sirkaDlazdice + MEZERA)
    s.doc.text(h.toUpperCase(), x, s.y, { charSpace: 0.3 })
  })
  s.mezera(3)

  for (const o of data.oblasti) {
    const casti = data.casti.filter((c) => c.oblast === o.id)
    if (!casti.length) continue
    s.misto(vyska + 3)
    const y = s.y
    s.pismo(8, true, BARVA.text)
    const nazev = KRATCE[lang][o.id as DimensionId] ?? o.id
    const radky = s.doc.splitTextToSize(nazev, SLOUPEC_NAZVU - 3) as string[]
    radky.slice(0, 2).forEach((r, k) => s.doc.text(r, OKRAJ.levy, y + 6 + k * 3.6))
    s.pismo(6.8, false, BARVA.slaba)
    s.doc.text(t.celkem(Math.round(o.prumer)), OKRAJ.levy, y + 6 + Math.min(2, radky.length) * 3.6 + 1)

    casti.forEach((c, i) => {
      const x = OKRAJ.levy + SLOUPEC_NAZVU + i * (sirkaDlazdice + MEZERA)
      const k = krokSkaly(c.prumer) - 1
      const b = SKALA[k]
      const tb = SKALA_TEXT[k]
      s.doc.setFillColor(b[0], b[1], b[2])
      s.doc.roundedRect(x, y, sirkaDlazdice, vyska, 2, 2, "F")

      // Kosočtverec sedí v pravém horním rohu, takže mu název musí uhnout.
      // Bez toho se text schová pod značku a je nečitelný.
      const misto = sirkaDlazdice - 6 - (c.riziko ? 5 : 0)
      s.pismo(7, true, tb)
      const nazevCasti = CASTI[lang][c.id] ?? c.id
      const rc = s.doc.splitTextToSize(nazevCasti, misto) as string[]
      rc.slice(0, 2).forEach((r, j) => s.doc.text(r, x + 3, y + 4.4 + j * 3.2))

      const cislo = String(Math.round(c.prumer))
      s.pismo(12, true, tb)
      s.doc.text(cislo, x + 3, y + vyska - 3.2)

      // Slovo se zarovnává k pravému okraji dlaždice a zmenšuje se, dokud se
      // vedle čísla nevejde. Angličtina má „large differences" tam, kde má
      // čeština „velké rozdíly", takže pevná velikost přeteče.
      const slovo = shodaKratce(c.smodch, lang)
      s.pismo(velikostSlova(s, cislo, slovo) || 4.6, true, tb)
      s.doc.text(slovo, x + sirkaDlazdice - 3, y + vyska - 3.6, { align: "right" })

      if (c.riziko) {
        s.doc.setFillColor(tb[0], tb[1], tb[2])
        s.doc.lines([[1.2, 1.2], [1.2, -1.2], [-1.2, -1.2]], x + sirkaDlazdice - 5, y + 3.4, [1, 1], "F", true)
      }
    })
    s.y = y + vyska + 2.4
  }
  s.mezera(2)
}

export function buildTymPdf(data: TymPdfVstup, lang: TymLang): Blob {
  const t = TYM[lang]
  const r = RAMEC[lang]
  const v = VYKLAD[lang]
  const doc = novyDokument()
  const s = new Sazba(doc)
  const podleId = new Map(data.oblasti.map((o) => [o.id, o]))
  const nazevOblasti = (id: string) => t.oblasti[id as DimensionId] ?? id

  // =========================================================================
  // 1. Hlavička a shrnutí pro kouče
  // =========================================================================
  s.doc.setFillColor(BARVA.znacka[0], BARVA.znacka[1], BARVA.znacka[2])
  s.doc.roundedRect(OKRAJ.levy, s.y, 32, 1.4, 0.7, 0.7, "F")
  s.mezera(9)
  s.text(data.nazev, { velikost: 24, tucne: true, radek: 10 })
  s.mezera(1)
  s.text(t.titul.toUpperCase(), {
    velikost: 7.6,
    tucne: true,
    barva: BARVA.slaba,
    radek: 4.4,
    prostrkani: 0.5,
  })
  s.mezera(3)
  s.text(t.podtitul, { velikost: 10.2, barva: BARVA.text2, radek: 5, sirka: SIRKA * 0.84 })
  s.mezera(2)
  s.text(t.pocty(data.odevzdano, data.pozvano), { velikost: 9, barva: BARVA.slaba, radek: 4.4 })
  s.mezera(6)

  if (data.maloDat) {
    s.ramecek(`${t.maloDatTitul}. ${t.maloDat}`, { velikost: 9.4 })
    s.mezera(4)
  }
  if (data.odevzdano > data.zapocteno) {
    const kolik = data.odevzdano - data.zapocteno
    s.ramecek(`${t.nezapoctenoTitul}. ${t.nezapocteno(kolik, data.zapocteno)}`, { velikost: 9.4 })
    s.mezera(4)
  }

  const plan = sestavPlan(data, lang)
  // Oblasti, které dostanou vlastní kroky v plánu, je nemají mít znovu
  // v přehledu oblastí. Dvakrát totéž čtenáře učí, že se části reportu dají
  // přeskakovat.
  const vPlanu = new Set<string>(plan.map((f) => f.oblast).filter((x): x is DimensionId => x !== null))
  const sPraci = oblastiSPraci(data, vPlanu)
  const shrnuti = sestavShrnuti(data, lang)
  s.nadpis(r.shrnutiTitul)
  s.text(r.shrnutiUvod, { velikost: 9.6, barva: BARVA.text2, radek: 4.6 })
  s.mezera(5)

  const shrnutiBlok = (titul: string, barva: RGB, radky: string[]) => {
    s.misto(20)
    s.doc.setFillColor(barva[0], barva[1], barva[2])
    s.doc.roundedRect(OKRAJ.levy, s.y - 1.4, 9, 1.4, 0.7, 0.7, "F")
    s.mezera(5)
    s.text(titul, { velikost: 11.6, tucne: true, radek: 5 })
    s.mezera(1.6)
    odrazky(s, radky, 9.6)
    s.mezera(4)
  }
  shrnutiBlok(r.drziTitul, ZELENA, shrnuti.drzi)
  shrnutiBlok(r.krehkeTitul, ORANZOVA, shrnuti.krehke)

  s.misto(24)
  s.doc.setFillColor(BARVA.znacka[0], BARVA.znacka[1], BARVA.znacka[2])
  s.doc.roundedRect(OKRAJ.levy, s.y - 1.4, 9, 1.4, 0.7, 0.7, "F")
  s.mezera(5)
  s.text(r.prvniKrokTitul, { velikost: 11.6, tucne: true, radek: 5 })
  s.mezera(1.6)
  s.text(shrnuti.prvniKrok, { velikost: 9.8, barva: BARVA.text2, radek: 4.7 })

  // =========================================================================
  // 2. Co znamenají čísla, mapa týmu, skryté trhliny a části oblastí
  // =========================================================================
  const m = MAPA[lang]
  // Stejná pojistka jako na obrazovce: starý server části oblastí nevrací.
  const maCasti = (data.casti ?? []).length > 0
  s.zalom()
  s.nadpis(m.cislaTitul)
  s.text(m.cislaUvod, { velikost: 9.6, barva: BARVA.text2, radek: 4.6 })
  s.mezera(4)
  pasmaSkaly(s, m)
  s.mezera(2)
  s.text(m.cislaPoznamka, { velikost: 9, barva: BARVA.slaba, radek: 4.3 })
  s.mezera(7)

  if (maCasti) {
    s.nadpis(m.titul)
    s.text(`${m.navodTitul} ${m.navodUvod}`, { velikost: 9.4, barva: BARVA.text2, radek: 4.5 })
    s.mezera(2.4)
    odrazky(s, m.navod, 9.2)
    s.mezera(4)
    nakresliMapu(s, data, m, lang)

    if (data.trhliny.length) {
      s.mezera(4)
      s.misto(50)
      s.nadpis(m.trhlinyTitul)
      s.text(m.trhlinyUvod, { velikost: 9.4, barva: BARVA.text2, radek: 4.5 })
      s.mezera(4)
      for (const tr of data.trhliny) {
        const o = data.oblasti.find((x) => x.id === tr.oblast)
        const c = data.casti.find((x) => x.id === tr.cast)
        if (!o || !c) continue
        const rozdil = Math.round(o.prumer) - Math.round(c.prumer)
        s.misto(22)
        const zacatek = s.y
        s.text(CASTI[lang][c.id] ?? c.id, { velikost: 10.4, tucne: true, radek: 4.8, x: OKRAJ.levy + 5, sirka: SIRKA - 5 })
        s.pismo(7.6, true, ORANZOVA)
        s.doc.text(KRATCE[lang][o.id as DimensionId] ?? o.id, PRAVY_KRAJ, zacatek, { align: "right" })
        s.mezera(1)
        s.text(m.trhlinaVeta(Math.round(o.prumer), Math.round(c.prumer), rozdil), {
          velikost: 9.2,
          barva: BARVA.text2,
          radek: 4.4,
          x: OKRAJ.levy + 5,
          sirka: SIRKA - 5,
        })
        s.doc.setDrawColor(ORANZOVA[0], ORANZOVA[1], ORANZOVA[2])
        s.doc.setLineWidth(0.8)
        s.doc.line(OKRAJ.levy, zacatek - 3.4, OKRAJ.levy, s.y - 1)
        s.mezera(5)
      }
    }

    s.mezera(4)
    s.misto(60)
    s.nadpis(m.castiTitul)
    s.text(m.castiUvod, { velikost: 9.4, barva: BARVA.text2, radek: 4.5 })
    s.mezera(4)
    nakresliCasti(s, data, m, lang)
  }

  // =========================================================================
  // 3. Jak report číst
  // =========================================================================
  s.mezera(6)
  s.misto(70)
  s.nadpis(r.jakCistTitul)
  for (const odstavec of r.jakCistOdstavce) {
    s.text(odstavec, { velikost: 9.4, barva: BARVA.text2, radek: 4.5 })
    s.mezera(2.8)
  }
  s.mezera(3)
  popisek(s, r.coToNeniTitul)
  odrazky(s, r.coToNeni, 9.6)
  s.mezera(6)

  // =========================================================================
  // 4. Struktura týmu: opory, priority, zlomové linie
  // =========================================================================
  s.mezera(4)
  // Tři sloupce vedle sebe. Na výšku pod sebou by tenhle přehled zabral půl
  // strany a přitom nese jen tři krátké seznamy; vedle sebe se navíc čtou
  // jako jeden obrázek stavu týmu, což je přesně to, co jsou.
  const MEZISLOUPI = 6
  const sirkaSloupce = (SIRKA - 2 * MEZISLOUPI) / 3
  const sloupce: [string, string, string[], RGB][] = [
    [t.oporyTitul, t.oporyUvod, data.opory, ZELENA],
    [t.prioritTitul, t.prioritUvod, data.priority, ORANZOVA],
    [t.zlomyTitul, t.zlomyUvod, data.zlomy, CERVENA],
  ]

  s.misto(64)
  const zacatekSloupcu = s.y
  let konecSloupcu = s.y
  sloupce.forEach(([titul, uvod, ids, barva], i) => {
    const x = OKRAJ.levy + i * (sirkaSloupce + MEZISLOUPI)
    s.y = zacatekSloupcu
    s.doc.setFillColor(barva[0], barva[1], barva[2])
    s.doc.roundedRect(x, s.y, 9, 1.4, 0.7, 0.7, "F")
    s.y += 6
    s.text(titul, { velikost: 11, tucne: true, radek: 4.8, x, sirka: sirkaSloupce })
    s.mezera(1.2)
    s.text(uvod, { velikost: 8.2, barva: BARVA.slaba, radek: 3.9, x, sirka: sirkaSloupce })
    s.mezera(2)
    if (!ids.length) {
      s.text(t.zadne, { velikost: 9, barva: BARVA.text2, radek: 4.3, x, sirka: sirkaSloupce })
    } else {
      for (const id of ids) {
        const o = podleId.get(id)
        const znacky = [o?.plosna ? t.plosna : null, o?.rozptyl ? t.velkyRozptyl : null]
          .filter(Boolean)
          .join(", ")
        s.text(`${nazevOblasti(id)}${znacky ? ` (${znacky})` : ""}`, {
          velikost: 9,
          tucne: true,
          radek: 4.3,
          x,
          sirka: sirkaSloupce,
        })
        s.mezera(0.8)
      }
    }
    konecSloupcu = Math.max(konecSloupcu, s.y)
  })
  s.y = konecSloupcu
  s.mezera(6)

  // =========================================================================
  // 5. Co z toho plyne: strukturální nálezy
  // =========================================================================
  s.mezera(3)
  s.nadpis(t.nalezyTitul)
  s.text(t.nalezyUvod, { velikost: 9.8, barva: BARVA.text2, radek: 4.7 })
  s.mezera(5)

  if (!data.nalezy.length) {
    s.text(t.bezNalezu, { velikost: 10, barva: BARVA.text2, radek: 4.8 })
    s.mezera(4)
  }

  data.nalezy.forEach((n, i) => {
    const text = t.nalezy[n.kod as NalezKod]
    if (!text) return
    s.misto(46)
    s.mezera(2)

    if (i === 0 && n.sila === "vysoka") {
      s.pismo(7.4, true, CERVENA)
      s.doc.text(t.prvniPraskne.toUpperCase(), OKRAJ.levy, s.y, { charSpace: 0.5 })
      s.mezera(5)
    }

    const zaklad = s.y
    s.text(text.nadpis, { velikost: 13, tucne: true, radek: 5.6, sirka: SIRKA - 26 })
    const oblastiText = n.oblasti.join(" · ")
    if (oblastiText) {
      s.pismo(8.4, true, BARVA.slaba)
      s.doc.text(oblastiText, PRAVY_KRAJ, zaklad, { align: "right" })
    }
    s.mezera(2.4)

    for (const [popis, obsah] of [
      [t.stitkyNalezu.coJeVidet, text.coJeVidet],
      [t.stitkyNalezu.coToDela, text.coToDela],
    ] as const) {
      popisek(s, popis)
      s.text(obsah, { velikost: 9.6, barva: BARVA.text2, radek: 4.6 })
      s.mezera(3)
    }

    popisek(s, t.stitkyNalezu.coSTim)
    cislovane(s, text.coSTim)
    s.mezera(2)

    const zacatekVaru = s.y
    popisek(s, t.stitkyNalezu.coNedelat, CERVENA, 5)
    s.text(text.coNedelat, {
      velikost: 9.6,
      barva: BARVA.text2,
      radek: 4.6,
      x: OKRAJ.levy + 5,
      sirka: SIRKA - 5,
    })
    s.doc.setDrawColor(CERVENA[0], CERVENA[1], CERVENA[2])
    s.doc.setLineWidth(0.8)
    s.doc.line(OKRAJ.levy, zacatekVaru - 3.4, OKRAJ.levy, s.y - 2)
    s.mezera(7)
  })

  // =========================================================================
  // 6. Sedm oblastí podrobně
  // =========================================================================
  s.mezera(4)
  s.misto(80)
  s.nadpis(r.oblastiDetailTitul)
  s.text(r.oblastiDetailUvod, { velikost: 9.6, barva: BARVA.text2, radek: 4.6 })
  s.mezera(5)

  for (const id of PORADI) {
    const o = podleId.get(id)
    if (!o) continue
    const vy = v[id]

    // Čísla a tvar rozdělení nese mapa a mřížka částí. Tady zůstává jen
    // hlavička a výklad; kdyby se grafika opakovala i sem, report by o třetinu
    // narostl a nepřidal by jedinou informaci.
    s.misto(46)
    s.mezera(2)
    const zaklad = s.y
    s.pismo(12.6, true, BARVA.text)
    s.doc.text(nazevOblasti(id), OKRAJ.levy, zaklad)
    s.pismo(8.4, false, BARVA.slaba)
    s.doc.text(
      `${Math.round(o.prumer)} · ${slovoUrovne(o.uroven, lang)}, ${shodaKratce(o.smodch, lang)}`,
      PRAVY_KRAJ,
      zaklad,
      { align: "right" },
    )
    s.y = zaklad + 3.6

    const stitky = [
      o.rozkol ? t.rozkol : null,
      o.rozptyl ? t.velkyRozptyl : null,
      o.plosna ? t.plosna : null,
    ].filter(Boolean)
    if (stitky.length) {
      s.pismo(8, true, o.rozkol ? CERVENA : ORANZOVA)
      s.misto(4)
      s.doc.text(stitky.join("  ·  "), OKRAJ.levy, s.y)
      s.y += 4
    }
    s.mezera(1)

    popisek(s, r.popiskyVykladu.coMeri)
    s.text(`${vy.coMeri} ${vy.procZalezi}`, { velikost: 9, barva: BARVA.text2, radek: 4.3 })
    s.mezera(2.6)

    popisek(s, r.popiskyVykladu.stav)
    s.text(vy.uroven[urovenKlic(o.uroven)], { velikost: 9, barva: BARVA.text2, radek: 4.3 })
    s.mezera(1.8)
    s.text(vy.tvar[tvarKlic(o)], { velikost: 9, barva: BARVA.text2, radek: 4.3 })
    s.mezera(2.6)

    // Práci a znaky posunu jen u oblastí, které ji potřebují. U zdravé oblasti
    // by tři kroky a dva ukazatele byly jen výplň a odvedly by pozornost od
    // toho, kde je práce opravdu potřeba.
    if (sPraci.has(id)) {
      popisek(s, r.popiskyVykladu.prace)
      cislovane(s, vy.prace, 9)
      s.mezera(2)
      popisek(s, r.popiskyVykladu.znaky)
      odrazky(s, vy.znaky, 9)
    }
    s.mezera(4)
    s.linka(BARVA.linka)
    s.mezera(3.6)
  }

  // =========================================================================
  // 7. Plán práce na dvanáct týdnů
  // =========================================================================
  s.mezera(3)
  s.nadpis(r.planTitul)
  s.text(r.planUvod, { velikost: 9.8, barva: BARVA.text2, radek: 4.8 })
  s.mezera(6)

  for (const faze of plan) {
    s.misto(52)
    const zaklad = s.y
    s.pismo(7.4, true, BARVA.znacka)
    s.doc.text(r.planTydny(faze.odTydne, faze.doTydne).toUpperCase(), OKRAJ.levy, zaklad, {
      charSpace: 0.5,
    })
    // Název oblasti se sází na účaří popisku týdnů, ne k nadpisu fáze. Nadpis
    // je velký a dlouhý název oblasti by do něj vjel; popisek týdnů je krátký
    // a vedle něj zbývá místo.
    if (faze.nazevOblasti) {
      const tydny = r.planTydny(faze.odTydne, faze.doTydne).toUpperCase()
      const konecTydnu = OKRAJ.levy + s.sirkaTextu(tydny, 7.4, true) + 0.5 * tydny.length
      popisekVpravo(s, faze.nazevOblasti.toUpperCase(), zaklad, konecTydnu + 4)
    }
    s.mezera(5)
    s.text(faze.nazev, { velikost: 13, tucne: true, radek: 5.6 })
    s.mezera(2.4)

    popisek(s, r.planProc)
    s.text(faze.duvod, { velikost: 9.4, barva: BARVA.text2, radek: 4.5 })
    s.mezera(3)

    popisek(s, r.planKroky)
    cislovane(s, faze.kroky, 9.4)
    s.mezera(2.4)

    popisek(s, r.planZnaky)
    odrazky(s, faze.znaky, 9.4)
    s.mezera(5.5)
  }
  s.ramecek(r.planPoznamka, { velikost: 9.2 })

  // =========================================================================
  // 8. Individuální rozhovory
  // =========================================================================
  s.mezera(3)
  s.nadpis(r.rozhovoryTitul)
  s.text(r.rozhovoryUvod, { velikost: 9.4, barva: BARVA.text2, radek: 4.5 })
  s.mezera(4)
  odrazky(s, r.rozhovoryJak, 9.2)
  s.mezera(5)

  popisek(s, r.rozhovoryOtazkyTitul)
  s.mezera(1)
  for (const id of PORADI) {
    if (!podleId.has(id)) continue
    s.misto(16)
    s.text(nazevOblasti(id), { velikost: 9.6, tucne: true, radek: 4.4 })
    s.mezera(0.8)
    odrazky(s, v[id].otazky, 9)
    s.mezera(2.4)
  }

  // =========================================================================
  // 9. Mantinely použití
  // =========================================================================
  s.mezera(3)
  s.nadpis(r.mantinelyTitul)
  s.text(r.mantinelyUvod, { velikost: 9.8, barva: BARVA.text2, radek: 4.8 })
  s.mezera(5)
  odrazky(s, r.mantinely, 9.8)

  s.paticka(`${data.nazev} · ${r.paticka}`)
  return doc.output("blob")
}

export function tymPdfFileName(nazev: string, lang: TymLang): string {
  const kdo = nazev.replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-|-$/g, "")
  return `${kdo || (lang === "en" ? "Team" : "Tym")}-${lang === "en" ? "team-profile" : "profil-tymu"}.pdf`
}
