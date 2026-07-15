// ELITE Performance Diagnostic — typy
// Modely: elite200 (7 dimenzí × 3 fazety × 8 položek), elite100 (7 dimenzí × 12 položek)

export type Lang = "cs" | "en"
export type Variant = "sport" | "business"
export type TestModel = "elite200" | "elite100"
export type TestId = `${TestModel}-${Variant}`

export type Answer = 1 | 2 | 3 | 4 | 5
/** Mapa odpovědí: číslo položky (1-based) → 1..5 */
export type AnswerMap = Record<number, Answer>

export type BandKey = "priority" | "stabilization" | "strong" | "elite"

export interface Localized {
  cs: string
  en: string
}

export interface FacetDef {
  id: string // "A1".."G3"
  dimension: DimensionId
  name: Localized
  items: number[] // 8 položek
}

export type DimensionId = "A" | "B" | "C" | "D" | "E" | "F" | "G"

export interface DimensionDef {
  id: DimensionId
  name: Localized
  /** elite100: 12 položek přímo; elite200: odvozeno z fazet */
  items?: number[]
}

export interface ConsistencyPair {
  a: number
  b: number
  /** "agree" = souhlasný pár (|a − b|), "reversed" = obrácený pár (|a − (6 − b)|) */
  type: "agree" | "reversed"
}

export interface BandRange {
  min: number
  max: number
  band: BandKey
}

export interface StructureDef {
  model: TestModel
  itemCount: number
  dimensions: DimensionDef[]
  facets?: FacetDef[] // pouze elite200
  /** Obrácené obsahové položky — rekódují se 6 − x před součtem */
  reversedItems: number[]
  validity: {
    /** položka → požadovaná odpověď */
    attention: Record<number, Answer>
    /** infrekvence (jen elite200): expectAgree → signál při 1/2, expectDisagree → signál při 4/5 */
    infrequency?: { expectAgree: number[]; expectDisagree: number[] }
    honesty: {
      items: number[]
      /** hranice pásem: [maxStandard, maxElevated]; nad tím výrazná stylizace */
      thresholds: [number, number]
    }
    consistency: {
      pairs: ConsistencyPair[]
      /** neplatné při: průměr > 1,5 NEBO počet párů s rozdílem ≥ 3 dosáhne invalidPairCount */
      invalidPairCount: number
    }
    /** kontrola dlouhých sérií stejných odpovědí (jen elite200) */
    longestRunThreshold?: number
  }
  scoring: {
    /** rozsah skóru jedné škály (fazeta: 8–40, dimenze100: 12–60) */
    facetBands?: BandRange[] // elite200
    dimensionBands: BandRange[]
    /** heterogenita fazet uvnitř dimenze (elite200): rozdíl ≥ threshold ⇒ interpretovat po fazetách */
    heterogeneityThreshold?: number
    /** nevyvážený profil (elite100): rozpětí dimenzí > threshold */
    imbalanceThreshold?: number
    /** počet nejsilnějších/nejslabších škál do souhrnu */
    topCount: number
    /** prakticky významná změna při retestu */
    retestSignificance: { facet?: number; dimension: number }
  }
}

// ---------- Výsledky skórování ----------

export type ValidityStatus = "ok" | "caution" | "invalid"

export interface ValidityResult {
  attention: { status: ValidityStatus; errors: number; total: number; failedItems: number[] }
  infrequency?: { status: ValidityStatus; signals: number; flaggedItems: number[] }
  consistency: {
    status: ValidityStatus
    meanDiff: number
    pairsOver3: number
    pairDiffs: { a: number; b: number; diff: number }[]
  }
  honesty: { status: ValidityStatus; score: number; min: number; max: number }
  responseStyle: {
    status: ValidityStatus
    agreePct: number // podíl 4/5
    disagreePct: number // podíl 1/2
    extremePct: number // podíl 1/5
    longestRun: number
    flags: ("acquiescence" | "nay-saying" | "extreme" | "long-run")[]
  }
  /** celkový verdikt: invalid pokud kterákoli tvrdá kontrola selhala */
  overall: ValidityStatus
}

export interface ScaleScore {
  id: string // "A" | "A1" ...
  raw: number
  min: number
  max: number
  percent: number // 0–100, (raw − min) / (max − min) × 100
  band: BandKey
}

export interface DimensionScore extends ScaleScore {
  id: DimensionId
  facets?: FacetScore[]
  /** elite200: rozdíl nejvyšší − nejnižší fazety; heterogenní ⇒ interpretovat po fazetách */
  facetSpread?: number
  heterogeneous?: boolean
}

export interface FacetScore extends ScaleScore {
  dimension: DimensionId
}

export interface DiagnosticResult {
  model: TestModel
  validity: ValidityResult
  dimensions: DimensionScore[]
  facets?: FacetScore[]
  strongest: ScaleScore[] // top fazety (200) / dimenze (100)
  weakest: ScaleScore[]
  /** elite100: rozpětí dimenzí a příznak nevyváženého profilu */
  dimensionSpread?: number
  imbalanced?: boolean
  answeredCount: number
  complete: boolean
}

// ---------- Osoba / administrace ----------

export interface PersonInfo {
  name: string
  birthDate?: string
  /** sport: disciplína a úroveň; business: role/oblast působení */
  role?: string
  fillDate: string // ISO
}

export interface StoredSession {
  testId: TestId
  lang: Lang
  person: PersonInfo
  answers: AnswerMap
  startedAt: string
  finishedAt?: string
}
