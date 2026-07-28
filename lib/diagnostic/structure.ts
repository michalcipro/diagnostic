import type { DimensionDef, FacetDef, StructureDef, TestId, TestModel, Variant } from "./types"

// Přepis vyhodnocovacích klíčů ELITE 200™ a ELITE 100™ (Winning Minds).
// Sport i Business varianta sdílejí identickou strukturu (paralelní formy),
// liší se pouze zněním položek a textací vyhodnocení.

export const DIMENSIONS: DimensionDef[] = [
  { id: "A", name: { cs: "Identita a vnitřní motivace", en: "Identity and inner motivation" } },
  { id: "B", name: { cs: "Sebedůvěra a vnitřní dialog", en: "Confidence and inner dialogue" } },
  { id: "C", name: { cs: "Koncentrace a řízení pozornosti", en: "Concentration and attention control" } },
  { id: "D", name: { cs: "Emoční regulace a výkon pod tlakem", en: "Emotion regulation and performance under pressure" } },
  { id: "E", name: { cs: "Odolnost a růstové nastavení mysli", en: "Resilience and growth mindset" } },
  { id: "F", name: { cs: "Disciplína, návyky a regenerace", en: "Discipline, habits and recovery" } },
  { id: "G", name: { cs: "Vztahy, komunikace a prostředí", en: "Relationships, communication and environment" } },
]

// ---------- ELITE 200 ----------

export const ELITE200_FACETS: FacetDef[] = [
  { id: "A1", dimension: "A", name: { cs: "Jasnost identity a hodnot", en: "Clarity of identity and values" }, items: [1, 23, 47, 70, 94, 118, 141, 165] },
  { id: "A2", dimension: "A", name: { cs: "Vnitřní motivace a smysl", en: "Intrinsic motivation and purpose" }, items: [8, 31, 55, 78, 103, 126, 149, 173] },
  { id: "A3", dimension: "A", name: { cs: "Sebehodnota nezávislá na výsledku", en: "Self-worth independent of results" }, items: [16, 39, 63, 87, 110, 134, 157, 185] },
  { id: "B1", dimension: "B", name: { cs: "Výkonová sebedůvěra", en: "Performance confidence" }, items: [2, 24, 48, 72, 95, 119, 142, 166] },
  { id: "B2", dimension: "B", name: { cs: "Kvalita vnitřního dialogu", en: "Quality of inner dialogue" }, items: [9, 32, 57, 80, 104, 127, 151, 174] },
  { id: "B3", dimension: "B", name: { cs: "Vztah k sobě po chybě", en: "Self-relation after mistakes" }, items: [17, 40, 64, 88, 111, 135, 158, 187] },
  { id: "C1", dimension: "C", name: { cs: "Selektivní pozornost a odolnost vůči rušení", en: "Selective attention and resistance to distraction" }, items: [3, 25, 49, 73, 96, 120, 143, 167] },
  { id: "C2", dimension: "C", name: { cs: "Znovuzaměření a rutiny pozornosti", en: "Refocusing and attention routines" }, items: [10, 33, 58, 81, 105, 128, 152, 175] },
  { id: "C3", dimension: "C", name: { cs: "Přítomný okamžik a proces", en: "Present moment and process" }, items: [18, 42, 65, 89, 112, 136, 159, 189] },
  { id: "D1", dimension: "D", name: { cs: "Vnímání tělesných signálů", en: "Awareness of bodily signals" }, items: [4, 26, 51, 74, 97, 121, 144, 168] },
  { id: "D2", dimension: "D", name: { cs: "Regulace aktivace a techniky", en: "Arousal regulation and techniques" }, items: [11, 35, 59, 82, 106, 129, 153, 177] },
  { id: "D3", dimension: "D", name: { cs: "Výzva vs. hrozba a jednání pod tlakem", en: "Challenge vs. threat and acting under pressure" }, items: [19, 43, 66, 90, 113, 137, 160, 191] },
  { id: "E1", dimension: "E", name: { cs: "Růstové přesvědčení", en: "Growth beliefs" }, items: [5, 28, 52, 75, 98, 122, 145, 170] },
  { id: "E2", dimension: "E", name: { cs: "Vytrvalost a dlouhodobé úsilí", en: "Persistence and long-term effort" }, items: [12, 36, 60, 83, 107, 130, 154, 179] },
  { id: "E3", dimension: "E", name: { cs: "Zpracování neúspěchu a zpětné vazby", en: "Processing setbacks and feedback" }, items: [20, 44, 67, 91, 114, 138, 162, 193] },
  { id: "F1", dimension: "F", name: { cs: "Seberegulace a konzistence", en: "Self-regulation and consistency" }, items: [6, 29, 53, 76, 99, 123, 147, 171] },
  { id: "F2", dimension: "F", name: { cs: "Spánek a regenerace", en: "Sleep and recovery" }, items: [14, 37, 61, 84, 108, 132, 155, 181] },
  { id: "F3", dimension: "F", name: { cs: "Energie a životní styl", en: "Energy and lifestyle" }, items: [21, 45, 68, 92, 115, 139, 163, 195] },
  { id: "G1", dimension: "G", name: { cs: "Komunikace a psychologické bezpečí", en: "Communication and psychological safety" }, items: [7, 30, 54, 77, 102, 125, 148, 172] },
  { id: "G2", dimension: "G", name: { cs: "Hranice a asertivita", en: "Boundaries and assertiveness" }, items: [15, 38, 62, 85, 109, 133, 156, 183] },
  { id: "G3", dimension: "G", name: { cs: "Sociální opora a prostředí", en: "Social support and environment" }, items: [22, 46, 69, 93, 117, 140, 164, 197] },
]

/**
 * Obrácené obsahové položky ELITE 200 (rekódování 6 − x).
 * Pozn.: tučné zvýraznění se v PDF klíči nedochovalo – seznam je odvozen
 * ze znění položek a ověřen proti typům párů konzistence (viz testy).
 */
export const ELITE200_REVERSED: number[] = [
  25, 37, 38, 39, 53, 54, 55, 57, 60, 65, 66, 67, 70, 74, 75, 82, 84, 87, 88, 92,
  104, 107, 109, 112, 113, 117, 119, 122, 126, 128, 135, 143, 144, 147, 148, 153,
  156, 157, 163, 164, 165, 166, 167, 174, 175, 179, 181, 189, 191, 193,
]

export const ELITE200: StructureDef = {
  model: "elite200",
  itemCount: 200,
  dimensions: DIMENSIONS,
  facets: ELITE200_FACETS,
  reversedItems: ELITE200_REVERSED,
  validity: {
    attention: { 50: 2, 100: 4, 150: 1, 188: 3 },
    attentionThresholds: { caution: 2, invalid: 3 },
    infrequency: { expectAgree: [34, 79], expectDisagree: [124, 169] },
    honesty: { items: [13, 27, 41, 56, 71, 86, 101, 116, 131, 146, 161, 176], thresholds: [33, 44] },
    consistency: {
      pairs: [
        { a: 31, b: 178, type: "agree" },
        { a: 3, b: 180, type: "agree" },
        { a: 58, b: 182, type: "agree" },
        { a: 19, b: 184, type: "reversed" },
        { a: 6, b: 186, type: "reversed" },
        { a: 29, b: 190, type: "reversed" },
        { a: 2, b: 192, type: "agree" },
        { a: 12, b: 194, type: "reversed" },
        { a: 16, b: 196, type: "reversed" },
        { a: 11, b: 198, type: "agree" },
        { a: 44, b: 199, type: "agree" },
        { a: 14, b: 200, type: "agree" },
      ],
      // Prahy jsou zkalibrované na rozdělení průměrného rozdílu u poctivého
      // respondenta (simulace 60 000 profilů, šum na úrovni položky σ = 0,8,
      // tj. korelace mezi dvěma položkami měřícími totéž ≈ 0,52 – konzervativní
      // odhad, párové položky jsou parafráze a korelují spíš výš).
      // Výsledek: varování ~5 % poctivých, neplatné ~0,02 %; náhodný respondent
      // je označen jako neplatný v 98 % případů.
      cautionMeanDiff: 1.2,
      invalidMeanDiff: 1.7,
      invalidPairCount: 4,
      minUsablePairs: 2 / 3,
    },
    longestRunThreshold: 15,
    pace: { cautionSecPerItem: 3, invalidSecPerItem: 2 },
  },
  scoring: {
    facetBands: [
      { min: 8, max: 18, band: "priority" },
      { min: 19, max: 27, band: "stabilization" },
      { min: 28, max: 34, band: "strong" },
      { min: 35, max: 40, band: "elite" },
    ],
    dimensionBands: [
      { min: 24, max: 54, band: "priority" },
      { min: 55, max: 82, band: "stabilization" },
      { min: 83, max: 102, band: "strong" },
      { min: 103, max: 120, band: "elite" },
    ],
    heterogeneityThreshold: 12,
    topCount: 3,
    retestSignificance: { facet: 4, dimension: 8 },
    minCoverage: 0.75,
  },
}

// ---------- ELITE 100 ----------

export const ELITE100_DIMENSION_ITEMS: Record<string, number[]> = {
  A: [1, 8, 16, 24, 31, 40, 48, 56, 63, 71, 80, 87],
  B: [2, 9, 17, 25, 33, 41, 49, 57, 64, 72, 81, 88],
  C: [3, 11, 18, 26, 34, 42, 50, 58, 65, 73, 82, 90],
  D: [4, 12, 19, 27, 35, 43, 51, 59, 67, 74, 83, 91],
  E: [5, 13, 20, 28, 36, 45, 52, 60, 68, 76, 84, 92],
  F: [6, 14, 22, 29, 37, 46, 53, 61, 69, 77, 85, 93],
  G: [7, 15, 23, 30, 39, 47, 54, 62, 70, 79, 86, 94],
}

/** Obrácené obsahové položky ELITE 100 – přesně 3 v každé dimenzi. */
export const ELITE100_REVERSED: number[] = [
  17, 18, 20, 22, 23, 24, 27, 41, 42, 43, 45, 46, 48, 54, 64, 65, 68, 71, 74, 85, 86,
]

export const ELITE100: StructureDef = {
  model: "elite100",
  itemCount: 100,
  dimensions: DIMENSIONS.map((d) => ({ ...d, items: ELITE100_DIMENSION_ITEMS[d.id] })),
  reversedItems: ELITE100_REVERSED,
  validity: {
    attention: { 38: 2, 75: 4 },
    // Kontroly jsou jen dvě, takže shovívavější práh než u ELITE 200 nejde –
    // jedna minutá kontrola z dvou už je polovina.
    attentionThresholds: { caution: 1, invalid: 2 },
    honesty: { items: [10, 21, 32, 44, 55, 66, 78, 89], thresholds: [22, 29] },
    consistency: {
      pairs: [
        { a: 63, b: 95, type: "agree" },
        { a: 3, b: 96, type: "agree" },
        { a: 51, b: 97, type: "agree" },
        { a: 35, b: 98, type: "reversed" },
        { a: 14, b: 99, type: "reversed" },
        { a: 61, b: 100, type: "reversed" },
      ],
      // Šest párů kolísá víc než dvanáct, proto vyšší prahy než u ELITE 200.
      // Varování ~3 % poctivých, neplatné ~0,08 %.
      cautionMeanDiff: 1.35,
      invalidMeanDiff: 1.85,
      invalidPairCount: 3,
      minUsablePairs: 2 / 3,
    },
    longestRunThreshold: 12,
    pace: { cautionSecPerItem: 3, invalidSecPerItem: 2 },
  },
  scoring: {
    dimensionBands: [
      { min: 12, max: 27, band: "priority" },
      { min: 28, max: 41, band: "stabilization" },
      { min: 42, max: 51, band: "strong" },
      { min: 52, max: 60, band: "elite" },
    ],
    imbalanceThreshold: 15,
    topCount: 2,
    retestSignificance: { dimension: 5 },
    minCoverage: 0.75,
  },
}

// ---------- Registr testů ----------

export const TEST_IDS: TestId[] = [
  "elite200-sport",
  "elite200-business",
  "elite100-sport",
  "elite100-business",
  "vzorce",
]

/** Testy z rodiny ELITE, tedy ty, které mají dimenze, fazety a škálu 1-5. */
export const ELITE_TEST_IDS = TEST_IDS.filter((t) => t !== "vzorce")

/** Emocionálně-destruktivní vzorce se skórují jinde, v lib/vzorce. */
export function jeVzorce(testId: string): boolean {
  return testId === "vzorce"
}

export function parseTestId(testId: string): { model: TestModel; variant: Variant } | null {
  const m = testId.match(/^(elite200|elite100)-(sport|business)$/)
  if (!m) return null
  return { model: m[1] as TestModel, variant: m[2] as Variant }
}

export function getStructure(model: TestModel): StructureDef {
  return model === "elite200" ? ELITE200 : ELITE100
}

/** Položky, které se započítávají do obsahových škál (bez validity). */
export function contentItems(s: StructureDef): number[] {
  if (s.facets) return s.facets.flatMap((f) => f.items)
  return s.dimensions.flatMap((d) => d.items ?? [])
}
