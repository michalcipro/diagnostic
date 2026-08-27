import type { BandKey, DimensionId, DiagnosticResult } from "../diagnostic/types"
import type { CastProfil, Nalez, NalezKod, OblastProfil, Sila, TymovyProfil } from "./typy"
import { PASMO_CASTI, jeSilna, jeSlaba, podily, urovenTymu } from "./prahy"

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

/**
 * Kolik kádru musí být v části v rozvojové prioritě, aby to byl nález.
 *
 * Dřív se hlásila každá část s průměrem pod 62, jenže 62 je zrovna spodní
 * hranice silného pásma testu: vlaječku dostalo skoro všechno a přestala něco
 * znamenat. Čtvrtina kádru v nejnižším pásmu je naopak tvrdý fakt o lidech,
 * ne o průměru.
 */
const CAST_PODIL_PRIORIT = 0.25

/** Nad tímhle rozptylem se v části tým rozchází natolik, že průměr neplatí. */
const CAST_ROZCHOD = 18

/** O kolik musí být část pod svojí oblastí, aby to byl nález, a ne šum. */
const TRHLINA_ROZDIL_U = 6

/** Nebo o kolik musí být rozkolísanější než oblast, ve které leží. */
const TRHLINA_ROZDIL_SD = 8

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
  const p = podily(pasma)
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
    // Úroveň se čte z toho, kolik hráčů je v kterém pásmu testu, ne z průměru.
    // Průměr je jedno číslo za skupinu a umí zakrýt, že půlka kádru propadá.
    uroven: urovenTymu(pasma),
    rozkol,
    rozptyl: !rozkol && smodch >= VYSOKY_ROZPTYL,
    // Plošná slabina: skoro nikdo v silném pásmu a zároveň malý rozptyl.
    // To není součet problémů jednotlivců, to je věc kultury a vedení.
    plosna: p.podPrahem >= 0.75 && smodch < 12,
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

/**
 * Profily všech částí, v pořadí, ve kterém je vrací skórování.
 *
 * Seznam částí se bere z výsledků, ne ze struktury testu. Struktura nese
 * i vyhodnocovací klíče a tenhle soubor se dostane do Convexu; není důvod
 * ho sem tahat kvůli seznamu názvů.
 */
function castiProfil(vysledky: DiagnosticResult[]): CastProfil[] {
  const poradi: string[] = []
  const prazdna = (): Record<BandKey, number> => ({
    priority: 0,
    stabilization: 0,
    strong: 0,
    elite: 0,
  })
  const podle = new Map<
    string,
    { oblast: DimensionId; hodnoty: number[]; pasma: Record<BandKey, number> }
  >()
  for (const r of vysledky) {
    for (const f of r.facets ?? []) {
      if (!f.reported) continue
      if (!podle.has(f.id)) {
        podle.set(f.id, { oblast: f.dimension, hodnoty: [], pasma: prazdna() })
        poradi.push(f.id)
      }
      const zaznam = podle.get(f.id)!
      zaznam.hodnoty.push(f.percent)
      zaznam.pasma[f.band]++
    }
  }
  return poradi.map((id) => {
    const { oblast, hodnoty, pasma } = podle.get(id)!
    const p = prumer(hodnoty)
    const sd = smerodatnaOdchylka(hodnoty)
    return {
      id,
      oblast,
      prumer: p,
      smodch: sd,
      min: Math.min(...hodnoty),
      max: Math.max(...hodnoty),
      pasma,
      riziko: podily(pasma).priority >= CAST_PODIL_PRIORIT || sd >= CAST_ROZCHOD,
    }
  })
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
function najdiNalezy(
  o: Map<DimensionId, OblastProfil>,
  casti: CastProfil[],
  vysledky: DiagnosticResult[],
): Nalez[] {
  const out: Nalez[] = []
  const pridej = (kod: NalezKod, sila: Sila, oblasti: DimensionId[]) =>
    out.push({ kod, sila, oblasti })

  // Prahy nálezů se čtou ze stejné úrovně jako všechno ostatní v reportu.
  // Dřív tu stála vlastní čísla (nízká pod 50, vysoká nad 65) a odporovala
  // slovům, kterými report tytéž oblasti popisoval o stránku dřív.
  const nizka = (id: DimensionId) => {
    const x = o.get(id)
    return x !== undefined && jeSlaba(x.uroven)
  }
  const vysoka = (id: DimensionId) => {
    const x = o.get(id)
    return x !== undefined && jeSilna(x.uroven)
  }

  /**
   * Slabá část. Stejné pravidlo jako u vlaječky v mřížce, aby nález a mřížka
   * neříkaly každý něco jiného: buď je v nejnižším pásmu aspoň čtvrtina kádru,
   * nebo je průměr části pod hranicí silného pásma a někdo v prioritě je.
   */
  const slabaCast = (id: string) => {
    const c = casti.find((x) => x.id === id)
    if (!c) return false
    const p = podily(c.pasma)
    return p.priority >= CAST_PODIL_PRIORIT || (c.prumer < PASMO_CASTI.silne && p.priority > 0)
  }

  const g2rozptyl = fazetaRozptyl("G2", vysledky) // hranice a asertivita

  // Sebejistá, ale tichá šatna. Navenek silný tým, který se v posledních
  // minutách nepřeskupí, protože nepříjemnou věc nikdo neřekne nahlas.
  // G1 = komunikace a psychologické bezpečí.
  if (vysoka("B") && slabaCast("G1")) {
    pridej("sebejista-ticha-satna", "vysoka", ["B", "G"])
  }

  // Vysoké nároky a odolnost bez regenerace. Vydrží všechno, a pak spadne
  // z útesu v půlce sezony. Je to předvídatelné na měsíce dopředu.
  // F2 = spánek a regenerace.
  if ((vysoka("E") || vysoka("F")) && slabaCast("F2")) {
    pridej("trajektorie-vyhoreni", "vysoka", ["E", "F"])
  }

  // Sebehodnota visí na výsledku. Nálada skupiny pak kopíruje formu.
  if (slabaCast("A3")) pridej("nalada-podle-vysledku", "vysoka", ["A"])

  // Velký rozptyl v hranicích: pár lidí nese náklad za všechny a vyhoří dřív.
  if (g2rozptyl >= VYSOKY_ROZPTYL) pridej("par-nese-naklad", "stredni", ["G"])

  // Zlomová linie pod tlakem.
  if (o.get("D")?.rozkol) pridej("zlom-pod-tlakem", "vysoka", ["D"])

  // Zlomová linie v pozornosti. Hlásí se za tlakem, protože když jsou obě,
  // rozhoduje ta pod tlakem: bez ní se rutiny pozornosti stejně nepoužijí.
  if (o.get("C")?.rozkol) pridej("zlom-v-pozornosti", "vysoka", ["C"])

  // Pozornost i regulace nízko naráz: pod tlakem se rozpadá hra, ne jen nervy.
  if (nizka("C") && nizka("D")) pridej("pozornost-mizi-pod-tlakem", "vysoka", ["C", "D"])

  // Tvrdost k sobě po chybě. Zvenčí vypadá jako nasazení, uvnitř brzdí návrat
  // do hry a nakazí i ostatní. B3 = vztah k sobě po chybě.
  if (slabaCast("B3")) pridej("tvrdi-na-sebe", "stredni", ["B"])

  // Chybí opora v okolí. G3 = sociální opora.
  if (slabaCast("G3")) pridej("bez-opory", "stredni", ["G"])

  // Nejasná identita a motivace.
  if (nizka("A")) pridej("krehka-identita", "stredni", ["A"])

  // Vyrovnaný základ. Hlásí se jen tehdy, když se nenašlo nic jiného: tým,
  // který má sebejistou a přitom tichou kabinu, vyrovnaný není, i když mu
  // žádná oblast nepropadla. Bez téhle podmínky by dobrá zpráva stála vedle
  // rizika a kouč by nevěděl, čemu věřit.
  const vsechny = [...o.values()]
  if (
    !out.length &&
    vsechny.length === OBLASTI.length &&
    vsechny.every((x) => !jeSlaba(x.uroven) && !x.rozkol && !x.rozptyl)
  ) {
    pridej("vyrovnany-zaklad", "stredni", [])
  }

  return out.sort((a, b) => (a.sila === b.sila ? 0 : a.sila === "vysoka" ? -1 : 1))
}

const soucet = (p: Record<BandKey, number>) => p.priority + p.stabilization + p.strong + p.elite

/**
 * Skryté trhliny.
 *
 * Hlásí se jen tam, kde trenér nemá důvod se dívat: oblast není rozdělená ani
 * rozkolísaná, tedy vypadá klidně, a přesto v ní leží část výrazně mimo.
 * Rozdíl pár bodů se nepočítá; to je šum, ne nález, a kdyby se hlásil, přestal
 * by trenér brát vážně celý oddíl.
 */
function najdiTrhliny(
  oblasti: OblastProfil[],
  casti: CastProfil[],
): { oblast: DimensionId; cast: string }[] {
  const out: { oblast: DimensionId; cast: string }[] = []
  for (const o of oblasti) {
    // Hlásí se jen tam, kde oblast vypadá klidně. Rozdělenou ani slabou oblast
    // report pojmenuje sám a trenér se na ni dívá tak jako tak.
    if (o.rozkol || o.rozptyl || o.plosna || jeSlaba(o.uroven)) continue
    if (o.smodch >= CAST_ROZCHOD) continue
    const spatne = casti
      .filter(
        (c) =>
          c.oblast === o.id &&
          c.riziko &&
          (o.prumer - c.prumer >= TRHLINA_ROZDIL_U || c.smodch - o.smodch >= TRHLINA_ROZDIL_SD),
      )
      // Nejhorší je ta, která je od oblasti nejdál v obou směrech naráz.
      .sort((a, b) => b.smodch - b.prumer - (a.smodch - a.prumer))
    if (spatne.length) out.push({ oblast: o.id, cast: spatne[0].id })
  }
  return out
}

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
  const casti = castiProfil(vysledky)

  return {
    nazev,
    pozvano,
    odevzdano,
    zapocteno: vysledky.length,
    oblasti,
    casti,
    trhliny: najdiTrhliny(oblasti, casti),
    // Opora je oblast, na kterou se dá spolehnout: úroveň v ní je silná
    // a zároveň se v ní tým nerozchází. Vysoký průměr s velkým rozptylem
    // oporou není, protože pod tlakem se rozpadne, a rozdělená oblast už
    // vůbec ne, i kdyby jí vyšel hezký průměr.
    opory: oblasti
      .filter((x) => jeSilna(x.uroven) && !x.rozkol && !x.rozptyl)
      .sort((a, b) => b.prumer - a.prumer)
      .slice(0, 3)
      .map((x) => x.id),
    // Priorita je oblast, kde je práce nejpotřebnější. Bere se ze stejné
    // úrovně, kterou report vypisuje u oblasti slovy, takže se nemůže stát,
    // že by v seznamu priorit stálo něco, co je o stránku dál pojmenované
    // jako silné.
    priority: oblasti
      .filter((x) => jeSlaba(x.uroven))
      .sort((a, b) => a.prumer - b.prumer)
      .slice(0, 3)
      .map((x) => x.id),
    zlomy: oblasti.filter((x) => x.rozkol).map((x) => x.id),
    nalezy: najdiNalezy(mapa, casti, vysledky),
    maloDat: vysledky.length < MALO_DAT_POD,
  }
}
