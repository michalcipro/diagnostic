import type { BandKey, DimensionId, DiagnosticResult } from "../diagnostic/types"
import type { Nalez, NalezKod, OblastProfil, Sila, TymovyProfil } from "./typy"

// Z profilů jednotlivců udělá profil skupiny.
//
// Běží na serveru. Do prohlížeče jde až hotový výsledek, takže se z něj
// jednotlivé profily poskládat nedají a prahy níž zůstávají u nás.
//
// PROČ NE PRŮMĚR. Dva týmy se stejným průměrem se chovají úplně jinak podle
// toho, jestli jsou vyrovnané, nebo rozdělené. Rozdělený tým má zlomovou
// linii: přijde tlak, mužstvo se rozpadne na ty, kdo si poradí, a ty, kdo ne,
// a první skupina místo hraní začne řešit druhou. Proto se u každé oblasti
// počítá úroveň i rozptyl a hledá se mezera v rozdělení.

const OBLASTI: DimensionId[] = ["A", "B", "C", "D", "E", "F", "G"]

/** Kolik hráčů nejmíň, aby se profil nedal číst jako profil jednotlivce. */
const MALO_DAT_POD = 5

/** Nad tímhle rozptylem je oblast nevyrovnaná, i když mezera není zřetelná. */
const VYSOKY_ROZPTYL = 18

/** Mezera mezi dvěma skupinami, od které to je zlomová linie, v bodech. */
const MEZERA_ZLOMU = 18

/** Nejmenší podíl kádru na každé straně mezery, aby šlo o skupiny, ne o výjimky. */
const PODIL_STRANY = 0.3

const prumer = (x: number[]) => x.reduce((a, b) => a + b, 0) / x.length

function smerodatnaOdchylka(x: number[]): number {
  if (x.length < 2) return 0
  const m = prumer(x)
  return Math.sqrt(prumer(x.map((v) => (v - m) ** 2)))
}

/**
 * Zlomová linie: v seřazených hodnotách je mezera, která dělí tým na dvě
 * skupiny. Hledá se jen uvnitř, ne na krajích, aby jeden odlehlý hráč
 * nevypadal jako polovina mužstva.
 */
function najdiRozkol(hodnoty: number[]): boolean {
  if (hodnoty.length < 6) return false
  const s = [...hodnoty].sort((a, b) => a - b)
  const nejmensiStrana = Math.max(2, Math.ceil(s.length * PODIL_STRANY))
  for (let i = nejmensiStrana - 1; i <= s.length - nejmensiStrana - 1; i++) {
    if (s[i + 1] - s[i] >= MEZERA_ZLOMU) return true
  }
  return false
}

/** Profil jedné oblasti napříč týmem. */
function oblastProfil(id: DimensionId, vysledky: DiagnosticResult[]): OblastProfil | null {
  const skore = vysledky
    .map((r) => r.dimensions.find((d) => d.id === id))
    .filter((d): d is NonNullable<typeof d> => d !== undefined && d.reported)
  if (!skore.length) return null

  const hodnoty = skore.map((d) => d.percent)
  const pasma: Record<BandKey, number> = { priority: 0, stabilization: 0, strong: 0, elite: 0 }
  for (const d of skore) pasma[d.band]++

  const smodch = smerodatnaOdchylka(hodnoty)
  const podilSlabych = (pasma.priority + pasma.stabilization) / skore.length
  // Zlomová linie a velký rozptyl se hlásí zvlášť. Dřív stačil k obojímu
  // rozptyl, takže jediný člověk daleko od zbytku vypadal jako dvě skupiny
  // s mezerou mezi sebou. Kouč by pak hledal dvě party tam, kde je jeden
  // osamělý hráč, a řešil by to úplně jinak, než by měl.
  const rozkol = najdiRozkol(hodnoty)
  return {
    id,
    prumer: prumer(hodnoty),
    smodch,
    min: Math.min(...hodnoty),
    max: Math.max(...hodnoty),
    pasma,
    rozkol,
    rozptyl: !rozkol && smodch >= VYSOKY_ROZPTYL,
    // Plošná slabina: skoro nikdo nad stabilizací a zároveň malý rozptyl.
    // To není součet problémů jednotlivců, to je věc kultury a vedení.
    plosna: podilSlabych >= 0.75 && smodch < 12,
  }
}

/** Průměr procentního skóre fazety napříč týmem; chybí, když ji nikdo nevykázal. */
function fazeta(id: string, vysledky: DiagnosticResult[]): number | null {
  const hodnoty = vysledky
    .flatMap((r) => r.facets ?? [])
    .filter((f) => f.id === id && f.reported)
    .map((f) => f.percent)
    return hodnoty.length ? prumer(hodnoty) : null
}

/** Rozptyl fazety napříč týmem. */
function fazetaRozptyl(id: string, vysledky: DiagnosticResult[]): number {
  const hodnoty = vysledky
    .flatMap((r) => r.facets ?? [])
    .filter((f) => f.id === id && f.reported)
    .map((f) => f.percent)
  return smerodatnaOdchylka(hodnoty)
}

/**
 * Strukturální nálezy.
 *
 * Hodnota není v jednotlivých oblastech, ale v jejich kombinacích. Vysoká
 * sebedůvěra sama o sobě je dobrá zpráva; vysoká sebedůvěra vedle chybějícího
 * bezpečí v komunikaci je šatna, která se pod tlakem nedokáže přeskupit,
 * protože to nikdo nezačne. Právě tyhle dvojice se hledají tady.
 */
function najdiNalezy(o: Map<DimensionId, OblastProfil>, vysledky: DiagnosticResult[]): Nalez[] {
  const out: Nalez[] = []
  const pridej = (kod: NalezKod, sila: Sila, oblasti: DimensionId[]) =>
    out.push({ kod, sila, oblasti })

  const uroven = (id: DimensionId) => o.get(id)?.prumer ?? null
  const nizka = (id: DimensionId, prah = 50) => {
    const v = uroven(id)
    return v !== null && v < prah
  }
  const vysoka = (id: DimensionId, prah = 65) => {
    const v = uroven(id)
    return v !== null && v > prah
  }

  const g1 = fazeta("G1", vysledky) // komunikace a psychologické bezpečí
  const g2rozptyl = fazetaRozptyl("G2", vysledky) // hranice a asertivita
  const g3 = fazeta("G3", vysledky) // sociální opora
  const f2 = fazeta("F2", vysledky) // spánek a regenerace
  const a3 = fazeta("A3", vysledky) // sebehodnota nezávislá na výsledku
  const b3 = fazeta("B3", vysledky) // vztah k sobě po chybě

  // Sebejistá, ale tichá šatna. Navenek silný tým, který se v posledních
  // minutách nepřeskupí, protože nepříjemnou věc nikdo neřekne nahlas.
  if (vysoka("B") && g1 !== null && g1 < 50) {
    pridej("sebejista-ticha-satna", "vysoka", ["B", "G"])
  }

  // Vysoké nároky a odolnost bez regenerace. Vydrží všechno, a pak spadne
  // z útesu v půlce sezony. Je to předvídatelné na měsíce dopředu.
  if ((vysoka("E") || vysoka("F", 60)) && f2 !== null && f2 < 45) {
    pridej("trajektorie-vyhoreni", "vysoka", ["E", "F"])
  }

  // Sebehodnota visí na výsledku. Nálada skupiny pak kopíruje formu.
  if (a3 !== null && a3 < 45) pridej("nalada-podle-vysledku", "vysoka", ["A"])

  // Velký rozptyl v hranicích: pár lidí nese náklad za všechny a vyhoří dřív.
  if (g2rozptyl >= VYSOKY_ROZPTYL) pridej("par-nese-naklad", "stredni", ["G"])

  // Zlomová linie pod tlakem.
  if (o.get("D")?.rozkol) pridej("zlom-pod-tlakem", "vysoka", ["D"])

  // Pozornost i regulace nízko naráz: pod tlakem se rozpadá hra, ne jen nervy.
  if (nizka("C") && nizka("D")) pridej("pozornost-mizi-pod-tlakem", "vysoka", ["C", "D"])

  // Tvrdost k sobě po chybě. Zvenčí vypadá jako nasazení, uvnitř brzdí návrat
  // do hry a nakazí i ostatní.
  if (b3 !== null && b3 < 45) pridej("tvrdi-na-sebe", "stredni", ["B"])

  // Chybí opora v okolí.
  if (g3 !== null && g3 < 45) pridej("bez-opory", "stredni", ["G"])

  // Nejasná identita a motivace.
  if (nizka("A", 45)) pridej("krehka-identita", "stredni", ["A"])

  // Vyrovnaný základ. Hlásí se jen tehdy, když se nenašlo nic jiného: tým,
  // který má sebejistou a přitom tichou kabinu, vyrovnaný není, i když mu
  // žádná oblast nepropadla. Bez téhle podmínky by dobrá zpráva stála vedle
  // rizika a kouč by nevěděl, čemu věřit.
  const vsechny = [...o.values()]
  if (
    !out.length &&
    vsechny.length === OBLASTI.length &&
    vsechny.every(
      (x) => x.pasma.priority / Math.max(1, soucet(x.pasma)) < 0.2 && !x.rozkol && !x.rozptyl,
    )
  ) {
    pridej("vyrovnany-zaklad", "stredni", [])
  }

  return out.sort((a, b) => (a.sila === b.sila ? 0 : a.sila === "vysoka" ? -1 : 1))
}

const soucet = (p: Record<BandKey, number>) => p.priority + p.stabilization + p.strong + p.elite

/** Poskládá týmový profil z profilů jednotlivců. */
export function tymovyProfil(
  nazev: string,
  pozvano: number,
  odevzdano: number,
  vsechna: DiagnosticResult[],
): TymovyProfil {
  // Dotazník, který neprošel kontrolou spolehlivosti, do profilu nepatří.
  // Jeho skóre neměří to, co měřit mělo, ale do průměru i do rozptylu by
  // promluvilo stejnou vahou jako poctivé vyplnění a umí vyrobit zlomovou
  // linii, která v týmu není. Kouč se o vyřazených dozví z rozdílu mezi
  // odevzdanými a započtenými, report ho pojmenuje.
  //
  // Mírné příznaky (upřímnost, odpověďový styl) končí na „opatrně" a počítají
  // se dál. Ty popisují, JAK o sobě hráč vypovídá; to je věc k výkladu, ne
  // důvod vyhodnocení zahodit.
  const vysledky = vsechna.filter((v) => v.validity.overall !== "invalid")

  const oblasti = OBLASTI.map((id) => oblastProfil(id, vysledky)).filter(
    (x): x is OblastProfil => x !== null,
  )
  const mapa = new Map(oblasti.map((x) => [x.id, x]))

  const podilSilnych = (x: OblastProfil) => (x.pasma.strong + x.pasma.elite) / Math.max(1, soucet(x.pasma))
  const podilSlabych = (x: OblastProfil) => x.pasma.priority / Math.max(1, soucet(x.pasma))

  return {
    nazev,
    pozvano,
    odevzdano,
    zapocteno: vysledky.length,
    oblasti,
    // Opora je oblast, na kterou se dá spolehnout: většina týmu ji má silnou
    // a zároveň se v ní tým nerozchází. Vysoký průměr s velkým rozptylem
    // oporou není, protože pod tlakem se rozpadne.
    opory: oblasti
      .filter((x) => podilSilnych(x) >= 0.6 && x.smodch < 14)
      .sort((a, b) => b.prumer - a.prumer)
      .slice(0, 3)
      .map((x) => x.id),
    priority: oblasti
      .filter((x) => podilSlabych(x) >= 0.35 || x.prumer < 45)
      .sort((a, b) => a.prumer - b.prumer)
      .slice(0, 3)
      .map((x) => x.id),
    zlomy: oblasti.filter((x) => x.rozkol).map((x) => x.id),
    nalezy: najdiNalezy(mapa, vysledky),
    maloDat: vysledky.length < MALO_DAT_POD,
  }
}
