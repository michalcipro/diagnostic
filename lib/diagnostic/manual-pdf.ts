import {
  BARVA,
  OKRAJ,
  PRAVY_KRAJ,
  SIRKA,
  Sazba,
  novyDokument,
} from "./pdf/sazba"
import { TEST_NAMES } from "./i18n"
import { MANUAL, type ManualPolozka } from "./manual"
import {
  PORADI_TESTU,
  oblastiElite,
  oblastiVzorcu,
  oblastiVzorcuSport,
  prehledTestu,
  prezdivkySport,
  rozsahTestu,
  skupinyArchetypu,
  vzorceRadky,
} from "./manual-data"
import type { Lang } from "./types"

// Manuál pro kouče jako PDF.
//
// Sází se ze stejných textů jako záložka v aplikaci, takže nemůže zestárnout
// zvlášť, a stejným sazečem jako vyhodnocení, takže vypadá jako zbytek
// produktu. Vzniká ve všech třech jazycích; kdo si přepne rozhraní, dostane
// manuál v tomtéž jazyce.

const NADPIS_KAPITOLY = 17
const NADPIS_TESTU = 12.2
const ZAKLAD = 9.6
const SLOUPEC_POPISU = 34

/** Popisek verzálkami, jaký nese celý manuál nad oddíly. */
function popisek(s: Sazba, text: string) {
  s.text(text.toUpperCase(), {
    velikost: 7.4,
    tucne: true,
    barva: BARVA.slaba,
    radek: 4.4,
    prostrkani: 0.5,
  })
  s.mezera(1.4)
}

/** Odstavec pod popiskem. */
function odstavec(s: Sazba, text: string, barva = BARVA.text2) {
  s.text(text, { velikost: ZAKLAD, barva, radek: 4.6 })
}

/**
 * Odstavec, který začíná tučným popiskem a pokračuje běžným textem na témž
 * řádku. jsPDF neumí přepnout řez uprostřed odstavce, takže se řádky lámou
 * ručně: první má o šířku popisku míň místa než ostatní. Dřív se popisek
 * přetiskoval přes hotový řádek, jenže tučné písmo je širší a text pod ním
 * vykukoval.
 *
 * S `kresli: false` jen změří výšku, aby se dopředu vědělo, jestli se blok
 * na stránku vejde.
 */
function popiskovyOdstavec(
  s: Sazba,
  lbl: string,
  text: string,
  opts: { x: number; sirka: number; velikost?: number; radek?: number; kresli?: boolean },
): number {
  const velikost = opts.velikost ?? ZAKLAD
  const radek = opts.radek ?? 4.6
  const kresli = opts.kresli !== false

  s.pismo(velikost, true)
  const sirkaLbl = lbl ? s.doc.getTextWidth(lbl) : 0
  s.pismo(velikost)
  const mezera = lbl ? s.doc.getTextWidth(" ") : 0

  const radky: string[] = []
  let aktualni = ""
  let kapacita = opts.sirka - sirkaLbl - mezera
  for (const slovo of text.split(/\s+/).filter(Boolean)) {
    const zkouska = aktualni ? `${aktualni} ${slovo}` : slovo
    if (!aktualni || s.doc.getTextWidth(zkouska) <= kapacita) {
      aktualni = zkouska
      continue
    }
    radky.push(aktualni)
    aktualni = slovo
    kapacita = opts.sirka
  }
  if (aktualni) radky.push(aktualni)

  const vyska = Math.max(1, radky.length) * radek
  if (!kresli) return vyska

  if (!radky.length && lbl) {
    s.misto(radek)
    s.pismo(velikost, true, BARVA.text)
    s.doc.text(lbl, opts.x, s.y)
    s.y += radek
    return vyska
  }

  radky.forEach((r, i) => {
    s.misto(radek)
    if (i === 0 && lbl) {
      s.pismo(velikost, true, BARVA.text)
      s.doc.text(lbl, opts.x, s.y)
      s.pismo(velikost, false, BARVA.text2)
      s.doc.text(r, opts.x + sirkaLbl + mezera, s.y)
    } else {
      s.pismo(velikost, false, BARVA.text2)
      s.doc.text(r, opts.x, s.y)
    }
    s.y += radek
  })
  return vyska
}

/** Odrážka s puntíkem; `kresli: false` ji jen změří. */
function odrazka(
  s: Sazba,
  p: ManualPolozka,
  x = OKRAJ.levy,
  sirka = SIRKA - 4.4,
  kresli = true,
): number {
  const odsazeni = 4.4
  if (kresli) {
    s.misto(6)
    s.doc.setFillColor(BARVA.drazka[0], BARVA.drazka[1], BARVA.drazka[2])
    s.doc.circle(x + 1.1, s.y - 1.1, 0.7, "F")
  }
  const vyska = popiskovyOdstavec(s, p.lbl, p.text, { x: x + odsazeni, sirka, kresli })
  if (kresli) s.mezera(1.6)
  return vyska + 1.6
}

/** Řádek tabulky: klíč, název, popis. Klíč i název se smějí vynechat. */
function radek(
  s: Sazba,
  klic: string | null,
  nazev: string,
  popis: string,
  sirkaNazvu = SLOUPEC_POPISU,
) {
  const xKlic = OKRAJ.levy
  const sirkaKlice = klic === null ? 0 : 8
  const xNazev = xKlic + sirkaKlice
  const xPopis = xNazev + sirkaNazvu
  const sirkaPopisu = PRAVY_KRAJ - xPopis

  s.pismo(ZAKLAD, true, BARVA.text)
  const radkyNazvu = s.doc.splitTextToSize(nazev, sirkaNazvu - 4) as string[]
  s.pismo(ZAKLAD, false, BARVA.text2)
  const radkyPopisu = s.doc.splitTextToSize(popis, sirkaPopisu) as string[]
  const vyska = Math.max(radkyNazvu.length, radkyPopisu.length) * 4.6 + 3.4

  s.misto(vyska + 2)
  const zacatek = s.y

  if (klic !== null) {
    s.pismo(ZAKLAD, true, BARVA.znacka)
    s.doc.text(klic, xKlic, zacatek)
  }
  s.pismo(ZAKLAD, true, BARVA.text)
  radkyNazvu.forEach((r, i) => s.doc.text(r, xNazev, zacatek + i * 4.6))
  s.pismo(ZAKLAD, false, BARVA.text2)
  radkyPopisu.forEach((r, i) => s.doc.text(r, xPopis, zacatek + i * 4.6))

  s.y = zacatek + vyska
  s.doc.setDrawColor(BARVA.linka[0], BARVA.linka[1], BARVA.linka[2])
  s.doc.setLineWidth(0.2)
  s.doc.line(OKRAJ.levy, s.y - 2.4, PRAVY_KRAJ, s.y - 2.4)
}

/** Otvírák kapitoly: vždy na nové straně, ať se manuál dá listovat. */
function kapitola(s: Sazba, kicker: string, title: string, standfirst: string, prvni = false) {
  if (!prvni) s.zalom()
  s.doc.setDrawColor(BARVA.text[0], BARVA.text[1], BARVA.text[2])
  s.doc.setLineWidth(0.7)
  s.doc.line(OKRAJ.levy, s.y, PRAVY_KRAJ, s.y)
  s.mezera(5)
  popisek(s, kicker)
  s.text(title, { velikost: NADPIS_KAPITOLY, tucne: true, radek: NADPIS_KAPITOLY * 0.42 })
  s.mezera(3)
  s.text(standfirst, { velikost: 10.4, barva: BARVA.text2, radek: 5 })
  s.mezera(7)
}

/** Kolik místa text zabere, aniž by se vysázel. */
function vyskaTextu(s: Sazba, text: string, velikost: number, sirka: number, radek: number): number {
  s.pismo(velikost)
  return (s.doc.splitTextToSize(text, sirka) as string[]).length * radek
}

/** Rámeček „co je ve vyhodnocení“. */
function panel(s: Sazba, title: string, lede: string, polozky: ManualPolozka[]) {
  const vnitrni = 6
  const sirkaObsahu = SIRKA - 2 * vnitrni
  const sirkaOdrazky = sirkaObsahu - 4.4

  // Panel se musí vejít celý. Kdyby se zalomil, rám by se kreslil od y na
  // předchozí straně k y na následující, což je nesmysl, a půlka seznamu
  // „co je ve vyhodnocení“ na odvrácené straně se stejně čte špatně.
  const vyska =
    2 * vnitrni +
    vyskaTextu(s, title, 12.6, sirkaObsahu, 5.2) +
    2 +
    vyskaTextu(s, lede, 9, sirkaObsahu, 4.3) +
    3.4 +
    polozky.reduce((soucet, p) => soucet + odrazka(s, p, OKRAJ.levy + vnitrni, sirkaOdrazky, false), 0)

  s.mezera(4)
  if (s.zbyva() < vyska) s.zalom()
  const zacatek = s.y

  s.y += vnitrni
  s.text(title, { velikost: 12.6, tucne: true, radek: 5.2, x: OKRAJ.levy + vnitrni, sirka: sirkaObsahu })
  s.mezera(2)
  s.text(lede, { velikost: 9, barva: BARVA.text2, radek: 4.3, x: OKRAJ.levy + vnitrni, sirka: sirkaObsahu })
  s.mezera(3.4)
  for (const p of polozky) odrazka(s, p, OKRAJ.levy + vnitrni, sirkaOdrazky)
  s.y += vnitrni

  s.doc.setDrawColor(BARVA.text[0], BARVA.text[1], BARVA.text[2])
  s.doc.setLineWidth(0.4)
  s.doc.roundedRect(OKRAJ.levy, zacatek, SIRKA, s.y - zacatek, 2.6, 2.6, "S")
  s.mezera(6)
}

/** Poznámka s modrým praporkem u levého okraje. */
function poznamka(s: Sazba, text: string) {
  const sirka = SIRKA - 5
  // Praporek se kreslí jednou čarou od začátku do konce textu, takže text
  // musí zůstat na jedné straně.
  s.mezera(3)
  if (s.zbyva() < vyskaTextu(s, text, ZAKLAD, sirka, 4.6) + 4) s.zalom()
  const zacatek = s.y
  s.text(text, { velikost: ZAKLAD, barva: BARVA.text2, radek: 4.6, x: OKRAJ.levy + 5, sirka })
  s.doc.setDrawColor(BARVA.znacka[0], BARVA.znacka[1], BARVA.znacka[2])
  s.doc.setLineWidth(0.8)
  s.doc.line(OKRAJ.levy, zacatek - 3.4, OKRAJ.levy, s.y - 2)
  s.mezera(4)
}

/** Karta jednoho testu: číslo, název, tři údaje a odstavec „k čemu je“. */
function kartaTestu(s: Sazba, id: (typeof PORADI_TESTU)[number], poradi: number, lang: Lang) {
  const t = MANUAL[lang]
  const karta = t.testy[id]

  s.misto(52)
  s.mezera(4)
  s.doc.setDrawColor(BARVA.text[0], BARVA.text[1], BARVA.text[2])
  s.doc.setLineWidth(0.4)
  s.doc.line(OKRAJ.levy, s.y, PRAVY_KRAJ, s.y)
  s.mezera(5.4)

  const zacatek = s.y
  s.pismo(9, true, BARVA.znacka)
  s.doc.text(String(poradi).padStart(2, "0"), OKRAJ.levy, zacatek)

  const x = OKRAJ.levy + 9
  const sirka = SIRKA - 9
  s.text(TEST_NAMES[id][lang], { velikost: NADPIS_TESTU, tucne: true, radek: 5.2, x, sirka })
  s.mezera(0.6)
  s.text(karta.podtitul, { velikost: 8.8, barva: BARVA.slaba, radek: 4.2, x, sirka })
  s.mezera(3.4)

  // Tři údaje vedle sebe na podkladu, stejně jako karta v aplikaci.
  const udaje: [string, string][] = [
    [t.popiskyKaret.proKoho, karta.proKoho],
    [t.popiskyKaret.rozsah, rozsahTestu(id, lang)],
    [t.popiskyKaret.jazyky, t.jazykyHodnota],
  ]
  const sirkaSloupce = sirka / 3
  let nejvyssi = 0
  for (const [, hodnota] of udaje) {
    s.pismo(8.6, false, BARVA.text)
    nejvyssi = Math.max(nejvyssi, (s.doc.splitTextToSize(hodnota, sirkaSloupce - 7) as string[]).length)
  }
  const vyskaPasu = 8.4 + nejvyssi * 4
  s.misto(vyskaPasu + 4)
  s.doc.setFillColor(BARVA.podklad[0], BARVA.podklad[1], BARVA.podklad[2])
  s.doc.roundedRect(x, s.y - 1, sirka, vyskaPasu, 2, 2, "F")
  udaje.forEach(([popis, hodnota], i) => {
    const sx = x + i * sirkaSloupce + 3.5
    s.pismo(6.9, true, BARVA.slaba)
    s.doc.text(popis.toUpperCase(), sx, s.y + 3.4, { charSpace: 0.4 })
    s.pismo(8.6, false, BARVA.text)
    const radky = s.doc.splitTextToSize(hodnota, sirkaSloupce - 7) as string[]
    radky.forEach((r, j) => s.doc.text(r, sx, s.y + 7.8 + j * 4))
  })
  s.y += vyskaPasu + 3.4

  popisek(s, t.kCemuJe)
  s.text(karta.kCemuJe, { velikost: ZAKLAD, barva: BARVA.text2, radek: 4.6, x, sirka })
  s.mezera(3)
}

export function buildManualPdf(lang: Lang): Blob {
  const t = MANUAL[lang]
  const doc = novyDokument()
  const s = new Sazba(doc)

  // ---- titulní strana ----
  s.mezera(34)
  s.doc.setFillColor(BARVA.znacka[0], BARVA.znacka[1], BARVA.znacka[2])
  s.doc.roundedRect(OKRAJ.levy, s.y, 42, 1.6, 0.8, 0.8, "F")
  s.mezera(11)
  s.text(t.title, { velikost: 30, tucne: true, radek: 12.5 })
  s.mezera(5)
  s.text(t.lede, { velikost: 12, barva: BARVA.text2, radek: 5.8, sirka: SIRKA * 0.78 })
  s.mezera(14)

  popisek(s, t.obsah)
  s.mezera(1)
  t.kapitoly.forEach((k, i) => {
    s.misto(8)
    const zacatek = s.y
    s.pismo(9.6, true, BARVA.znacka)
    s.doc.text(String(i + 1), OKRAJ.levy, zacatek)
    s.pismo(9.6, false, BARVA.text)
    s.doc.text(k.title, OKRAJ.levy + 8, zacatek)
    s.y = zacatek + 5.4
    s.doc.setDrawColor(BARVA.linka[0], BARVA.linka[1], BARVA.linka[2])
    s.doc.setLineWidth(0.2)
    s.doc.line(OKRAJ.levy, s.y - 2, PRAVY_KRAJ, s.y - 2)
  })

  // ---- 1. jak to probíhá ----
  kapitola(s, t.kapitoly[0].kicker, t.kapitoly[0].title, t.kapitoly[0].standfirst)
  t.postup.forEach((p, i) => {
    s.misto(12)
    const zacatek = s.y
    s.pismo(8.6, true, BARVA.znacka)
    s.doc.text(String(i + 1), OKRAJ.levy, zacatek)
    popiskovyOdstavec(s, p.lbl, p.text, { x: OKRAJ.levy + 7, sirka: SIRKA - 7 })
    s.mezera(2.6)
  })
  poznamka(s, t.vysledkyNote)
  for (const b of t.ch1Bloky) {
    s.mezera(3)
    popisek(s, b.lbl)
    odstavec(s, b.text)
  }

  // ---- 2. kterou vybrat ----
  kapitola(s, t.kapitoly[1].kicker, t.kapitoly[1].title, t.kapitoly[1].standfirst)
  for (const r of t.rodiny) radek(s, null, r.nazev, `${r.otazka} ${r.kdy}`, 52)
  s.mezera(6)
  popisek(s, t.volbaTitle)
  for (const v of t.volba) radek(s, null, v.q, v.a, 52)
  s.mezera(3)
  s.text(t.volbaFootnote, { velikost: 8.6, barva: BARVA.slaba, radek: 4.2 })

  // ---- 3. ELITE ----
  kapitola(s, t.kapitoly[2].kicker, t.kapitoly[2].title, t.kapitoly[2].standfirst)
  popisek(s, t.oblastiTitle)
  for (const o of oblastiElite(lang)) radek(s, o.id, o.nazev, o.popis)
  s.mezera(3)
  s.text(t.oblastiFootnote, { velikost: 8.6, barva: BARVA.slaba, radek: 4.2 })
  PORADI_TESTU.slice(0, 4).forEach((id, i) => kartaTestu(s, id, i + 1, lang))
  panel(s, t.eliteEvalTitle, t.eliteEvalLede, t.eliteEval)

  // ---- 4. vzorce ----
  kapitola(s, t.kapitoly[3].kicker, t.kapitoly[3].title, t.kapitoly[3].standfirst)
  popisek(s, t.vzorceTitle)
  for (const v of vzorceRadky(lang)) radek(s, v.id, v.nazev, v.tema)
  s.mezera(6)
  popisek(s, t.oblastiVzorcuTitle)
  odstavec(s, t.oblastiVzorcuIntro)
  s.mezera(3)
  for (const o of oblastiVzorcu(lang)) radek(s, null, o.nazev, `${t.chybi} ${o.potreba}`, 56)
  s.mezera(3)
  s.text(`${t.oblastiVzorcuFootnote} ${oblastiVzorcuSport(lang)}.`, {
    velikost: 8.6,
    barva: BARVA.slaba,
    radek: 4.2,
  })
  PORADI_TESTU.slice(4, 7).forEach((id, i) => kartaTestu(s, id, i + 5, lang))
  panel(s, t.vzorceEvalTitle, t.vzorceEvalLede, t.vzorceEval)
  poznamka(s, t.vzorceNote)

  // ---- 5. archetypy ----
  kapitola(s, t.kapitoly[4].kicker, t.kapitoly[4].title, t.kapitoly[4].standfirst)
  popisek(s, t.archetypyTitle)
  for (const g of skupinyArchetypu(lang)) radek(s, null, g.nazev, `${g.archetypy}. ${g.popis}`, 48)
  s.mezera(3)
  s.text(`${t.archetypyFootnote} ${prezdivkySport(lang)}.`, {
    velikost: 8.6,
    barva: BARVA.slaba,
    radek: 4.2,
  })
  PORADI_TESTU.slice(7).forEach((id, i) => kartaTestu(s, id, i + 8, lang))
  panel(s, t.archEvalTitle, t.archEvalLede, t.archEval)
  s.mezera(2)
  popisek(s, t.archSportTitle)
  for (const p of t.archSport) odrazka(s, p)
  poznamka(s, t.archNote)

  // ---- 6. týmy a kluby ----
  kapitola(s, t.kapitoly[5].kicker, t.kapitoly[5].title, t.kapitoly[5].standfirst)
  for (const b of t.tymBloky) odrazka(s, b)
  s.mezera(4)
  popisek(s, t.tymRoleTitle)
  for (const rl of t.tymRole) odrazka(s, rl)
  s.mezera(3)
  poznamka(s, t.tymNote)

  // ---- 7. praktické poznámky ----
  kapitola(s, t.kapitoly[6].kicker, t.kapitoly[6].title, t.kapitoly[6].standfirst)
  for (const b of t.praktickeBloky) {
    s.mezera(3)
    popisek(s, b.title)
    for (const p of b.polozky) odrazka(s, p)
  }
  s.mezera(4)
  popisek(s, t.zachazeniTitle)
  for (const o of t.zachazeni) {
    odstavec(s, o)
    s.mezera(2.4)
  }

  // Rejstřík je to, k čemu se kouč vrací, takže dostane vlastní stranu.
  s.zalom()
  popisek(s, t.prehledTitle)
  odstavec(s, t.prehledLede, BARVA.slaba)
  s.mezera(3)
  for (const r of prehledTestu(lang)) radek(s, r.cislo, r.nazev, `${r.rozsah} · ${r.prostredi}`, 62)

  s.paticka(t.title)
  return doc.output("blob")
}

export function manualPdfFileName(lang: Lang): string {
  const nazev = { cs: "Manual-pro-kouce", sk: "Manual-pre-koucov", en: "Coach-handbook" }[lang]
  return `${nazev}.pdf`
}
