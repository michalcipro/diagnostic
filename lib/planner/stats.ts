import {
  METRIKY,
  METRIKY_SKALA,
  REFLEXE,
  type MetricKey,
  type PlannerDay,
  type PlannerHabit,
} from "./types"
import { indexDne, posun, rozdilDnu } from "./datum"

// Statistiky deníku.
//
// Všechno tady jsou čisté funkce nad načtenými dny: dostanou seznam záznamů
// a hranice období a vrátí čísla. Nic nesahá do sítě ani do databáze, takže
// se totéž dá spočítat na serveru i v prohlížeči a hlavně se to dá ověřit.
//
// Dvě zásady, na kterých čísla stojí:
//
// 1. Budoucí dny se nepočítají. Kdo se ve středu podívá na statistiku týdne,
//    má vidět „3 ze 3", ne „3 ze 7". Jinak by úspěšnost celý týden klesala
//    jen proto, že týden ještě neskončil.
// 2. Návyk se počítá jen ode dne, kdy vznikl, a jen do dne, kdy byl
//    archivovaný. Návyk založený dvacátého v měsíci nemá mít za ten měsíc
//    třicet možných dnů, to by z každého nového předsevzetí udělalo selhání.

// ─────────────────────────────────────────────────────────────────────────────
// Pomocné výpočty
// ─────────────────────────────────────────────────────────────────────────────

export function prumer(cisla: number[]): number | undefined {
  if (!cisla.length) return undefined
  return cisla.reduce((a, b) => a + b, 0) / cisla.length
}

/** Datum vzniku návyku jako „YYYY-MM-DD". */
function denVzniku(h: PlannerHabit): string {
  return new Date(h.createdAt).toISOString().slice(0, 10)
}

/** Poslední den, kdy návyk platil; u nearchivovaného nic. */
function denArchivace(h: PlannerHabit): string | undefined {
  return h.archivedAt ? new Date(h.archivedAt).toISOString().slice(0, 10) : undefined
}

/** Má den vůbec nějaký obsah? Prázdný den se do „vyplněných" nepočítá. */
export function jeVyplneny(den: PlannerDay): boolean {
  if (den.habits.length) return true
  if (den.schedule.some((s) => s.text.trim())) return true
  if (METRIKY.some((m) => typeof den.ratings[m] === "number")) return true
  if (REFLEXE.some((r) => (den.reflection[r] ?? "").trim())) return true
  return false
}

/** Kolik políček reflexe je v daném dni vyplněných (0 až 3). */
function vyplnenaReflexe(den: PlannerDay): number {
  return REFLEXE.filter((r) => (den.reflection[r] ?? "").trim()).length
}

/** Denní skóre: průměr čtyř bodových ukazatelů. Spánek do něj nepatří. */
export function denniSkore(den: PlannerDay): number | undefined {
  const hodnoty = METRIKY_SKALA.map((m) => den.ratings[m]).filter(
    (v): v is number => typeof v === "number",
  )
  return prumer(hodnoty)
}

/** Seznam dat od „od" do „do" včetně. */
export function dnyRozsahu(od: string, do_: string): string[] {
  const pocet = rozdilDnu(od, do_) + 1
  if (pocet <= 0) return []
  return Array.from({ length: pocet }, (_, i) => posun(od, i))
}

/** Mapa datum → den, ať se nehledá v poli pro každý výpočet znovu. */
export function mapaDnu(dny: PlannerDay[]): Map<string, PlannerDay> {
  const m = new Map<string, PlannerDay>()
  for (const d of dny) m.set(d.date, d)
  return m
}

// ─────────────────────────────────────────────────────────────────────────────
// Souhrny
// ─────────────────────────────────────────────────────────────────────────────

export interface MetrikaSouhrn {
  klic: MetricKey
  prumer?: number
  /** kolik dnů má hodnotu zapsanou */
  pocet: number
  min?: number
  max?: number
  /** rozdíl průměru proti předchozímu období, v jednotkách ukazatele */
  zmena?: number
  /** hodnoty po dnech období, v pořadí kalendáře; nevyplněné jsou undefined */
  rada: (number | undefined)[]
}

export interface NavykSouhrn {
  habitId: string
  name: string
  target?: number
  archivovany: boolean
  splneno: number
  /** dnů, kdy návyk platil a zároveň už proběhly */
  moznych: number
  /** 0 až 1; nedefinované, když nebyl žádný možný den */
  uspesnost?: number
  /** změna úspěšnosti proti předchozímu období, v procentních bodech */
  zmena?: number
  aktualniSerie: number
  nejdelsiSerie: number
  /** odškrtnuto po dnech období, v pořadí kalendáře */
  rada: boolean[]
}

export interface DenVTydnuSouhrn {
  /** 0 je pondělí */
  index: number
  skore?: number
  navykyUspesnost?: number
  pocet: number
}

export interface VlivNavyku {
  habitId: string
  name: string
  metrika: MetricKey
  sNavykem: number
  bezNavyku: number
  /** kladný rozdíl znamená lepší hodnotu ve dnech se splněným návykem */
  rozdil: number
  dnuS: number
  dnuBez: number
}

export interface Statistika {
  od: string
  do: string
  /** dnů období, která už proběhla */
  dnuCelkem: number
  vyplnenychDnu: number
  metriky: MetrikaSouhrn[]
  /** průměr denního skóre za období */
  skore?: number
  skoreZmena?: number
  navyky: NavykSouhrn[]
  navykyCelkem: {
    splneno: number
    moznych: number
    uspesnost?: number
    /** změna v procentních bodech proti předchozímu období */
    zmena?: number
  }
  reflexe: { vyplneno: number; moznych: number; podil?: number }
  rozvrh: { hodin: number; dnuSPlanem: number }
  /** kolik dnů v řadě si klient deník vede, ke dni „dnesniDatum" */
  serieVedeni: number
  nejdelsiSerieVedeni: number
  podleDnuVTydnu: DenVTydnuSouhrn[]
  vlivNavyku: VlivNavyku[]
}

export interface VstupStatistiky {
  /** načtené dny; mohou přesahovat období, funkce si je vyfiltruje */
  dny: PlannerDay[]
  navyky: PlannerHabit[]
  od: string
  do: string
  /** předchozí srovnatelné období; bez něj se změny nepočítají */
  predchozi?: { od: string; do: string }
  dnesniDatum: string
}

/**
 * Platil návyk v daný den?
 *
 * Před založením ne, po archivaci taky ne. Bez tohoto omezení by archivace
 * návyku zpětně pokazila všechna minulá období, protože by se od archivace
 * dál počítaly samé nesplněné dny.
 */
function navykPlatil(h: PlannerHabit, datum: string): boolean {
  if (datum < denVzniku(h)) return false
  const konec = denArchivace(h)
  if (konec && datum > konec) return false
  return true
}

/** Souhrn jednoho návyku za období. */
function souhrnNavyku(
  h: PlannerHabit,
  mapa: Map<string, PlannerDay>,
  data: string[],
  dnesniDatum: string,
): { splneno: number; moznych: number; rada: boolean[] } {
  let splneno = 0
  let moznych = 0
  const rada: boolean[] = []
  for (const datum of data) {
    const odskrtnuto = mapa.get(datum)?.habits.includes(h.id) ?? false
    rada.push(odskrtnuto)
    if (datum > dnesniDatum) continue
    if (!navykPlatil(h, datum)) continue
    moznych++
    if (odskrtnuto) splneno++
  }
  return { splneno, moznych, rada }
}

/**
 * Nejdelší série po sobě jdoucích splněných dnů uvnitř období.
 *
 * Dny, kdy návyk neplatil, sérii nepřerušují ani neprodlužují – přeskočí se.
 * Kdyby přerušovaly, ukončila by každá pauza v definici návyku sérii, kterou
 * člověk fakticky nepřerušil.
 */
function nejdelsiSerie(
  h: PlannerHabit,
  mapa: Map<string, PlannerDay>,
  data: string[],
  dnesniDatum: string,
): number {
  let nej = 0
  let ted = 0
  for (const datum of data) {
    if (datum > dnesniDatum) break
    if (!navykPlatil(h, datum)) continue
    if (mapa.get(datum)?.habits.includes(h.id)) {
      ted++
      if (ted > nej) nej = ted
    } else {
      ted = 0
    }
  }
  return nej
}

/**
 * Aktuální série ke dni „dnesniDatum".
 *
 * Počítá se odzadu přes všechny načtené dny, ne jen přes období: série, která
 * začala minulý měsíc, je pořád tatáž série. Dnešek, který ještě není
 * odškrtnutý, sérii nenuluje – den ještě neskončil, takže se začíná od včerejška.
 */
function aktualniSerie(
  h: PlannerHabit,
  mapa: Map<string, PlannerDay>,
  dnesniDatum: string,
  /** kam nejdál se smí koukat dozadu */
  nejstarsi: string,
): number {
  const konec = denArchivace(h)
  // U archivovaného návyku se série počítá ke dni archivace, ne k dnešku.
  let datum = konec && konec < dnesniDatum ? konec : dnesniDatum
  if (!mapa.get(datum)?.habits.includes(h.id)) {
    // Dnešek se ještě může doplnit, proto se nezapočítá a jde se o den zpět.
    datum = posun(datum, -1)
  }
  let serie = 0
  while (datum >= nejstarsi && navykPlatil(h, datum)) {
    if (!mapa.get(datum)?.habits.includes(h.id)) break
    serie++
    datum = posun(datum, -1)
  }
  return serie
}

/**
 * Souhrn ukazatele za období.
 *
 * Řada pokrývá celé období, ať se graf kryje s kalendářem, ale do průměru
 * jdou jen dny, které už proběhly. Kdo si dopředu zapíše plánovaný spánek,
 * nemá si tím posunout tenhle týden.
 */
function souhrnMetriky(
  klic: MetricKey,
  mapa: Map<string, PlannerDay>,
  data: string[],
  dnesniDatum: string,
): { hodnoty: number[]; rada: (number | undefined)[] } {
  const rada: (number | undefined)[] = []
  const hodnoty: number[] = []
  for (const datum of data) {
    const v = mapa.get(datum)?.ratings[klic]
    rada.push(typeof v === "number" ? v : undefined)
    if (typeof v === "number" && datum <= dnesniDatum) hodnoty.push(v)
  }
  return { hodnoty, rada }
}

/**
 * Vliv návyku na denní ukazatele.
 *
 * Porovnává průměr ukazatele ve dnech, kdy byl návyk splněný, s průměrem ve
 * dnech, kdy splněný nebyl. Není to důkaz příčiny: kdo má dobrý den, spíš si
 * i odškrtne návyk, takže vztah může vést oběma směry. Aplikace to u výpisu
 * říká nahlas.
 *
 * Prahem je pět dnů v každé skupině. Pod ním je rozdíl dvou průměrů náhoda,
 * kterou by bylo nezodpovědné ukazovat jako zjištění.
 */
const PRAH_VLIVU = 5

function spocitejVliv(
  navyky: PlannerHabit[],
  mapa: Map<string, PlannerDay>,
  data: string[],
  dnesniDatum: string,
): VlivNavyku[] {
  const out: VlivNavyku[] = []
  for (const h of navyky) {
    for (const metrika of METRIKY) {
      const s: number[] = []
      const bez: number[] = []
      for (const datum of data) {
        if (datum > dnesniDatum) continue
        if (!navykPlatil(h, datum)) continue
        const den = mapa.get(datum)
        const v = den?.ratings[metrika]
        if (typeof v !== "number") continue
        if (den?.habits.includes(h.id)) s.push(v)
        else bez.push(v)
      }
      if (s.length < PRAH_VLIVU || bez.length < PRAH_VLIVU) continue
      const a = prumer(s)
      const b = prumer(bez)
      if (a === undefined || b === undefined) continue
      out.push({
        habitId: h.id,
        name: h.name,
        metrika,
        sNavykem: a,
        bezNavyku: b,
        rozdil: a - b,
        dnuS: s.length,
        dnuBez: bez.length,
      })
    }
  }
  // Nejsilnější rozdíly první; znaménko nerozhoduje, zajímavé je obojí.
  return out.sort((x, y) => Math.abs(y.rozdil) - Math.abs(x.rozdil))
}

/**
 * Série dnů, kdy si klient deník vedl, ke dni „dnesniDatum".
 *
 * Stejně jako u návyků: dnešek bez zápisu sérii nenuluje, jen se nezapočítá.
 */
function serieVedeni(mapa: Map<string, PlannerDay>, dnesniDatum: string, nejstarsi: string): number {
  let datum = dnesniDatum
  const vyplneny = (d: string) => {
    const den = mapa.get(d)
    return !!den && jeVyplneny(den)
  }
  if (!vyplneny(datum)) datum = posun(datum, -1)
  let serie = 0
  while (datum >= nejstarsi && vyplneny(datum)) {
    serie++
    datum = posun(datum, -1)
  }
  return serie
}

/** Nejdelší souvislá řada vyplněných dnů uvnitř období. */
function nejdelsiVedeni(mapa: Map<string, PlannerDay>, data: string[], dnesniDatum: string): number {
  let nej = 0
  let ted = 0
  for (const datum of data) {
    if (datum > dnesniDatum) break
    const den = mapa.get(datum)
    if (den && jeVyplneny(den)) {
      ted++
      if (ted > nej) nej = ted
    } else {
      ted = 0
    }
  }
  return nej
}

/** Hlavní výpočet statistiky za období. */
export function spocitejStatistiku(vstup: VstupStatistiky): Statistika {
  const { dny, navyky, od, do: do_, predchozi, dnesniDatum } = vstup
  const mapa = mapaDnu(dny)
  const data = dnyRozsahu(od, do_)
  const probehle = data.filter((d) => d <= dnesniDatum)
  // Nejstarší načtený den je hranice, za kterou se při hledání sérií nesmí.
  const nejstarsi = dny.length ? dny.map((d) => d.date).sort()[0] : od

  // Ukazatele
  const predchoziData = predchozi ? dnyRozsahu(predchozi.od, predchozi.do) : []
  const metriky: MetrikaSouhrn[] = METRIKY.map((klic) => {
    const { hodnoty, rada } = souhrnMetriky(klic, mapa, data, dnesniDatum)
    const p = prumer(hodnoty)
    let zmena: number | undefined
    if (predchozi) {
      const minule = prumer(souhrnMetriky(klic, mapa, predchoziData, dnesniDatum).hodnoty)
      if (p !== undefined && minule !== undefined) zmena = p - minule
    }
    return {
      klic,
      prumer: p,
      pocet: hodnoty.length,
      min: hodnoty.length ? Math.min(...hodnoty) : undefined,
      max: hodnoty.length ? Math.max(...hodnoty) : undefined,
      zmena,
      rada,
    }
  })

  // Denní skóre
  const skoreHodnoty = probehle
    .map((d) => mapa.get(d))
    .filter((d): d is PlannerDay => !!d)
    .map(denniSkore)
    .filter((v): v is number => typeof v === "number")
  const skore = prumer(skoreHodnoty)
  let skoreZmena: number | undefined
  if (predchozi) {
    const minule = prumer(
      predchoziData
        .map((d) => mapa.get(d))
        .filter((d): d is PlannerDay => !!d)
        .map(denniSkore)
        .filter((v): v is number => typeof v === "number"),
    )
    if (skore !== undefined && minule !== undefined) skoreZmena = skore - minule
  }

  // Návyky
  const souhrny: NavykSouhrn[] = navyky.map((h) => {
    const { splneno, moznych, rada } = souhrnNavyku(h, mapa, data, dnesniDatum)
    let zmena: number | undefined
    if (predchozi) {
      const m = souhrnNavyku(h, mapa, predchoziData, dnesniDatum)
      if (moznych > 0 && m.moznych > 0) {
        zmena = (splneno / moznych - m.splneno / m.moznych) * 100
      }
    }
    return {
      habitId: h.id,
      name: h.name,
      target: h.target,
      archivovany: !!h.archivedAt,
      splneno,
      moznych,
      uspesnost: moznych > 0 ? splneno / moznych : undefined,
      zmena,
      aktualniSerie: aktualniSerie(h, mapa, dnesniDatum, nejstarsi),
      nejdelsiSerie: nejdelsiSerie(h, mapa, data, dnesniDatum),
      rada,
    }
  })

  const splnenoCelkem = souhrny.reduce((a, s) => a + s.splneno, 0)
  const moznychCelkem = souhrny.reduce((a, s) => a + s.moznych, 0)
  let navykyZmena: number | undefined
  if (predchozi) {
    let sP = 0
    let mP = 0
    for (const h of navyky) {
      const m = souhrnNavyku(h, mapa, predchoziData, dnesniDatum)
      sP += m.splneno
      mP += m.moznych
    }
    if (moznychCelkem > 0 && mP > 0) {
      navykyZmena = (splnenoCelkem / moznychCelkem - sP / mP) * 100
    }
  }

  // Reflexe a rozvrh
  let reflexeVyplneno = 0
  let hodin = 0
  let dnuSPlanem = 0
  let vyplnenychDnu = 0
  for (const datum of probehle) {
    const den = mapa.get(datum)
    if (!den) continue
    if (jeVyplneny(den)) vyplnenychDnu++
    reflexeVyplneno += vyplnenaReflexe(den)
    const bloky = den.schedule.filter((s) => s.text.trim()).length
    hodin += bloky
    if (bloky) dnuSPlanem++
  }

  // Podle dnů v týdnu
  const podleDnuVTydnu: DenVTydnuSouhrn[] = Array.from({ length: 7 }, (_, i) => {
    const dnyIndexu = probehle.filter((d) => indexDne(d) === i)
    const skoreDne = dnyIndexu
      .map((d) => mapa.get(d))
      .filter((d): d is PlannerDay => !!d)
      .map(denniSkore)
      .filter((v): v is number => typeof v === "number")
    let splneno = 0
    let moznych = 0
    for (const datum of dnyIndexu) {
      for (const h of navyky) {
        if (!navykPlatil(h, datum)) continue
        moznych++
        if (mapa.get(datum)?.habits.includes(h.id)) splneno++
      }
    }
    return {
      index: i,
      skore: prumer(skoreDne),
      navykyUspesnost: moznych > 0 ? splneno / moznych : undefined,
      pocet: skoreDne.length,
    }
  })

  return {
    od,
    do: do_,
    dnuCelkem: probehle.length,
    vyplnenychDnu,
    metriky,
    skore,
    skoreZmena,
    navyky: souhrny,
    navykyCelkem: {
      splneno: splnenoCelkem,
      moznych: moznychCelkem,
      uspesnost: moznychCelkem > 0 ? splnenoCelkem / moznychCelkem : undefined,
      zmena: navykyZmena,
    },
    reflexe: {
      vyplneno: reflexeVyplneno,
      moznych: probehle.length * REFLEXE.length,
      podil: probehle.length ? reflexeVyplneno / (probehle.length * REFLEXE.length) : undefined,
    },
    rozvrh: { hodin, dnuSPlanem },
    serieVedeni: serieVedeni(mapa, dnesniDatum, nejstarsi),
    nejdelsiSerieVedeni: nejdelsiVedeni(mapa, data, dnesniDatum),
    podleDnuVTydnu,
    vlivNavyku: spocitejVliv(navyky, mapa, data, dnesniDatum),
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Rozpad po kratších úsecích, pro grafy vývoje
// ─────────────────────────────────────────────────────────────────────────────

export interface BodVyvoje {
  /** popisný klíč úseku, „2026-08" u měsíce nebo pondělí u týdne */
  klic: string
  skore?: number
  metriky: Partial<Record<MetricKey, number>>
  navykyUspesnost?: number
  vyplnenychDnu: number
  dnuCelkem: number
}

/**
 * Průměry za jeden úsek. Používá se pro body grafu vývoje, kde je jeden bod
 * měsíc (roční pohled) nebo týden (měsíční pohled).
 */
export function bodVyvoje(
  klic: string,
  dny: PlannerDay[],
  navyky: PlannerHabit[],
  od: string,
  do_: string,
  dnesniDatum: string,
): BodVyvoje {
  const mapa = mapaDnu(dny)
  const data = dnyRozsahu(od, do_).filter((d) => d <= dnesniDatum)
  const metriky: Partial<Record<MetricKey, number>> = {}
  for (const m of METRIKY) {
    const p = prumer(souhrnMetriky(m, mapa, data, dnesniDatum).hodnoty)
    if (p !== undefined) metriky[m] = p
  }
  const skoreHodnoty = data
    .map((d) => mapa.get(d))
    .filter((d): d is PlannerDay => !!d)
    .map(denniSkore)
    .filter((v): v is number => typeof v === "number")
  let splneno = 0
  let moznych = 0
  for (const datum of data) {
    for (const h of navyky) {
      if (!navykPlatil(h, datum)) continue
      moznych++
      if (mapa.get(datum)?.habits.includes(h.id)) splneno++
    }
  }
  return {
    klic,
    skore: prumer(skoreHodnoty),
    metriky,
    navykyUspesnost: moznych > 0 ? splneno / moznych : undefined,
    vyplnenychDnu: data.filter((d) => {
      const den = mapa.get(d)
      return !!den && jeVyplneny(den)
    }).length,
    dnuCelkem: data.length,
  }
}
