// ELITE Performance Diagnostic — typy
// Modely: elite200 (7 dimenzí × 3 fazety × 8 položek), elite100 (7 dimenzí × 12 položek)

export type Lang = "cs" | "en"
export type Variant = "sport" | "business"
export type TestModel = "elite200" | "elite100"
/**
 * Emocionálně-destruktivní vzorce. Samostatný test s jinou škálou i logikou,
 * proto stojí vedle rodiny ELITE, ne uvnitř ní.
 */
export type TestId = `${TestModel}-${Variant}` | "vzorce"

/**
 * Rod respondenta. Řídí gramatické tvary v českém vyhodnocení — žena nesmí
 * dostat text v mužském rodě. Angličtina rod neřeší.
 */
export type Gender = "male" | "female"

/**
 * Odpověď na položku. ELITE používá škálu 1-5, emocionálně-destruktivní vzorce
 * škálu 1-6. Rozsah konkrétního testu hlídá TEST_META a serverová validace.
 */
export type Answer = 1 | 2 | 3 | 4 | 5 | 6
/** Mapa odpovědí: číslo položky (1-based) → hodnota na škále testu */
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
    /**
     * Kolik minutých kontrol pozornosti znamená varování a kolik neplatnost.
     * Jedna chyba nestačí — i pozorní respondenti instruktážní položku minou
     * ve 2–5 % případů, takže práh „1 = varování" označí ~11 % poctivých lidí.
     */
    attentionThresholds: { caution: number; invalid: number }
    /** infrekvence (jen elite200): expectAgree → signál při 1/2, expectDisagree → signál při 4/5 */
    infrequency?: { expectAgree: number[]; expectDisagree: number[] }
    honesty: {
      items: number[]
      /** hranice pásem: [maxStandard, maxElevated]; nad tím výrazná stylizace */
      thresholds: [number, number]
    }
    consistency: {
      pairs: ConsistencyPair[]
      /** průměrný rozdíl párů, nad kterým je varování */
      cautionMeanDiff: number
      /** průměrný rozdíl párů, nad kterým je neplatné */
      invalidMeanDiff: number
      /** neplatné také při tomto počtu párů s rozdílem ≥ 3 */
      invalidPairCount: number
      /** podíl párů, které musí být zodpovězené, aby index vůbec něco znamenal */
      minUsablePairs: number
    }
    /** kontrola dlouhých sérií stejných odpovědí */
    longestRunThreshold?: number
    /**
     * Tempo vyplňování v sekundách na položku. Příliš rychlé vyplnění je jeden
     * z nejspolehlivějších ukazatelů nedbalého odpovídání — položku nelze
     * přečíst a zvážit za dvě sekundy.
     */
    pace?: { cautionSecPerItem: number; invalidSecPerItem: number }
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
    /**
     * Minimální podíl zodpovězených položek, aby se skóre škály vůbec vykázalo.
     * Pod touto hranicí je dopočet z průměru už příliš nejistý a číslo by
     * budilo zdání přesnosti, kterou nemá.
     */
    minCoverage: number
  }
}

// ---------- Výsledky skórování ----------

export type ValidityStatus = "ok" | "caution" | "invalid"

export interface ValidityResult {
  attention: { status: ValidityStatus; errors: number; total: number; failedItems: number[] }
  infrequency?: { status: ValidityStatus; signals: number; flaggedItems: number[] }
  consistency: {
    status: ValidityStatus
    /** false = zodpovězeno málo párů, index nic neříká a do verdiktu nevstupuje */
    available: boolean
    meanDiff: number
    pairsUsed: number
    pairsTotal: number
    pairsOver3: number
    /** diff = null u páru, kde chybí odpověď — takový pár se do průměru nepočítá */
    pairDiffs: { a: number; b: number; diff: number | null }[]
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
  /** tempo vyplňování; chybí, pokud nebyl změřen čas */
  pace?: { status: ValidityStatus; secPerItem: number; totalSec: number }
  /**
   * Celkový verdikt. Určují ho tvrdé indexy (pozornost, infrekvence,
   * konzistence, tempo). Měkké indexy (upřímnost, odpověďový styl) popisují,
   * jak respondent o sobě vypovídá — samy o sobě vyhodnocení neruší, mohou
   * verdikt zvednout nejvýš na „opatrně".
   */
  overall: ValidityStatus
}

export interface ScaleScore {
  id: string // "A" | "A1" ...
  /** hrubé skóre; při chybějících položkách dopočtené z průměru zodpovězených */
  raw: number
  min: number
  max: number
  percent: number // 0–100, (raw − min) / (max − min) × 100
  band: BandKey
  answered: number
  total: number
  /** false = zodpovězeno málo položek, skóre se nevykazuje */
  reported: boolean
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
  /** doba vyplňování v sekundách, je-li známa */
  durationSec?: number
}

/** Volitelné údaje o administraci, které vstupují do kontroly validity. */
export interface AdministrationInfo {
  /** doba mezi otevřením a odesláním dotazníku */
  durationSec?: number
}

// ---------- Osoba / administrace ----------

export interface PersonInfo {
  name: string
  birthDate?: string
  /** sport: disciplína a úroveň; business: role/oblast působení */
  role?: string
  /** rod pro české vyhodnocení; u starších záznamů chybí */
  gender?: Gender
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
