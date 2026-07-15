import type {
  Answer,
  AnswerMap,
  BandKey,
  BandRange,
  DiagnosticResult,
  DimensionScore,
  FacetScore,
  ScaleScore,
  StructureDef,
  ValidityResult,
  ValidityStatus,
} from "./types"
import { contentItems } from "./structure"

// Skórování dle vyhodnocovacích klíčů ELITE 200™ / ELITE 100™.
// Pořadí dle klíče: nejdřív validita, teprve potom skóry.

/** Rekódování obrácené položky: 6 − x */
function recode(value: Answer, reversed: boolean): number {
  return reversed ? 6 - value : value
}

function bandFor(score: number, bands: BandRange[]): BandKey {
  for (const b of bands) {
    if (score >= b.min && score <= b.max) return b.band
  }
  // mimo rozsah (nemělo by nastat) — přiřaď krajní pásmo
  return score < bands[0].min ? bands[0].band : bands[bands.length - 1].band
}

function percent(raw: number, min: number, max: number): number {
  return Math.round(((raw - min) / (max - min)) * 1000) / 10
}

const worse = (a: ValidityStatus, b: ValidityStatus): ValidityStatus => {
  const order: ValidityStatus[] = ["ok", "caution", "invalid"]
  return order[Math.max(order.indexOf(a), order.indexOf(b))]
}

export function evaluateValidity(s: StructureDef, answers: AnswerMap): ValidityResult {
  // 2.1 Kontrola pozornosti
  const attentionEntries = Object.entries(s.validity.attention)
  const failedItems = attentionEntries
    .filter(([item, required]) => answers[Number(item)] !== required)
    .map(([item]) => Number(item))
  const attentionErrors = failedItems.length
  const attention = {
    status: (attentionErrors === 0 ? "ok" : attentionErrors === 1 ? "caution" : "invalid") as ValidityStatus,
    errors: attentionErrors,
    total: attentionEntries.length,
    failedItems,
  }

  // 2.2 Index infrekvence (jen elite200)
  let infrequency: ValidityResult["infrequency"]
  if (s.validity.infrequency) {
    const flagged: number[] = []
    for (const item of s.validity.infrequency.expectAgree) {
      const a = answers[item]
      if (a !== undefined && a <= 2) flagged.push(item)
    }
    for (const item of s.validity.infrequency.expectDisagree) {
      const a = answers[item]
      if (a !== undefined && a >= 4) flagged.push(item)
    }
    const signals = flagged.length
    infrequency = {
      status: signals === 0 ? "ok" : signals === 1 ? "caution" : "invalid",
      signals,
      flaggedItems: flagged,
    }
  }

  // 2.3 Index konzistence
  const pairDiffs = s.validity.consistency.pairs.map(({ a, b, type }) => {
    const va = answers[a]
    const vb = answers[b]
    const diff =
      va === undefined || vb === undefined
        ? 0
        : Math.abs(va - (type === "reversed" ? 6 - vb : vb))
    return { a, b, diff }
  })
  const meanDiff = Math.round((pairDiffs.reduce((sum, p) => sum + p.diff, 0) / pairDiffs.length) * 100) / 100
  const pairsOver3 = pairDiffs.filter((p) => p.diff >= 3).length
  const consistency = {
    status: (meanDiff > 1.5 || pairsOver3 >= s.validity.consistency.invalidPairCount
      ? "invalid"
      : meanDiff > 1.0
        ? "caution"
        : "ok") as ValidityStatus,
    meanDiff,
    pairsOver3,
    pairDiffs,
  }

  // 2.4 Index upřímnosti
  const honestyItems = s.validity.honesty.items
  const honestyScore = honestyItems.reduce((sum, item) => sum + (answers[item] ?? 0), 0)
  const [maxStandard, maxElevated] = s.validity.honesty.thresholds
  const honesty = {
    status: (honestyScore <= maxStandard ? "ok" : honestyScore <= maxElevated ? "caution" : "invalid") as ValidityStatus,
    score: honestyScore,
    min: honestyItems.length,
    max: honestyItems.length * 5,
  }

  // 2.5 Akvieskence, extrémní styl, dlouhé série
  const values = Array.from({ length: s.itemCount }, (_, i) => answers[i + 1]).filter(
    (v): v is Answer => v !== undefined,
  )
  const n = values.length || 1
  const agreePct = Math.round((values.filter((v) => v >= 4).length / n) * 1000) / 10
  const disagreePct = Math.round((values.filter((v) => v <= 2).length / n) * 1000) / 10
  const extremePct = Math.round((values.filter((v) => v === 1 || v === 5).length / n) * 1000) / 10
  let longestRun = 0
  let run = 0
  let prev: number | undefined
  for (let i = 1; i <= s.itemCount; i++) {
    const v = answers[i]
    if (v !== undefined && v === prev) {
      run += 1
    } else {
      run = 1
    }
    prev = v
    if (run > longestRun) longestRun = run
  }
  const flags: ("acquiescence" | "nay-saying" | "extreme" | "long-run")[] = []
  if (agreePct >= 90) flags.push("acquiescence")
  if (disagreePct >= 90) flags.push("nay-saying")
  if (extremePct > 85) flags.push("extreme")
  if (s.validity.longestRunThreshold && longestRun >= s.validity.longestRunThreshold) flags.push("long-run")
  const responseStyle = {
    status: (flags.length > 0 ? "caution" : "ok") as ValidityStatus,
    agreePct,
    disagreePct,
    extremePct,
    longestRun,
    flags,
  }

  let overall: ValidityStatus = "ok"
  for (const st of [attention.status, infrequency?.status ?? "ok", consistency.status, honesty.status, responseStyle.status]) {
    overall = worse(overall, st)
  }

  return { attention, infrequency, consistency, honesty, responseStyle, overall }
}

function scoreScale(
  id: string,
  items: number[],
  answers: AnswerMap,
  reversedSet: Set<number>,
  bands: BandRange[],
): ScaleScore {
  const raw = items.reduce((sum, item) => {
    const a = answers[item]
    return sum + (a === undefined ? 0 : recode(a, reversedSet.has(item)))
  }, 0)
  const min = items.length
  const max = items.length * 5
  return { id, raw, min, max, percent: percent(raw, min, max), band: bandFor(raw, bands) }
}

export function evaluate(s: StructureDef, answers: AnswerMap): DiagnosticResult {
  const validity = evaluateValidity(s, answers)
  const reversedSet = new Set(s.reversedItems)

  let facets: FacetScore[] | undefined
  let dimensions: DimensionScore[]

  if (s.facets) {
    // ELITE 200: fazety 8–40, dimenze = součet tří fazet 24–120
    const facetBands = s.scoring.facetBands!
    facets = s.facets.map((f) => ({
      ...scoreScale(f.id, f.items, answers, reversedSet, facetBands),
      dimension: f.dimension,
    }))
    dimensions = s.dimensions.map((d) => {
      const dimFacets = facets!.filter((f) => f.dimension === d.id)
      const raw = dimFacets.reduce((sum, f) => sum + f.raw, 0)
      const min = dimFacets.reduce((sum, f) => sum + f.min, 0)
      const max = dimFacets.reduce((sum, f) => sum + f.max, 0)
      const spread = Math.max(...dimFacets.map((f) => f.raw)) - Math.min(...dimFacets.map((f) => f.raw))
      return {
        id: d.id,
        raw,
        min,
        max,
        percent: percent(raw, min, max),
        band: bandFor(raw, s.scoring.dimensionBands),
        facets: dimFacets,
        facetSpread: spread,
        heterogeneous: s.scoring.heterogeneityThreshold !== undefined && spread >= s.scoring.heterogeneityThreshold,
      }
    })
  } else {
    // ELITE 100: dimenze = součet 12 položek, 12–60
    dimensions = s.dimensions.map((d) => ({
      ...scoreScale(d.id, d.items!, answers, reversedSet, s.scoring.dimensionBands),
      id: d.id,
    }))
  }

  // Nejsilnější / nejslabší škály (200: fazety, 100: dimenze)
  const pool: ScaleScore[] = facets ?? dimensions
  const sorted = [...pool].sort((a, b) => b.raw - a.raw || a.id.localeCompare(b.id))
  const strongest = sorted.slice(0, s.scoring.topCount)
  const weakest = sorted.slice(-s.scoring.topCount).reverse()

  const dimensionSpread =
    Math.max(...dimensions.map((d) => d.raw)) - Math.min(...dimensions.map((d) => d.raw))

  const answeredCount = Array.from({ length: s.itemCount }, (_, i) => answers[i + 1]).filter(
    (v) => v !== undefined,
  ).length

  return {
    model: s.model,
    validity,
    dimensions,
    facets,
    strongest,
    weakest,
    dimensionSpread,
    imbalanced:
      s.scoring.imbalanceThreshold !== undefined ? dimensionSpread > s.scoring.imbalanceThreshold : undefined,
    answeredCount,
    complete: answeredCount === s.itemCount,
  }
}

/** Kontrola integrity struktury — používá se v testech i při startu. */
export function structureIntegrity(s: StructureDef): { ok: boolean; problems: string[] } {
  const problems: string[] = []
  const content = contentItems(s)
  const validityItems = [
    ...Object.keys(s.validity.attention).map(Number),
    ...(s.validity.infrequency ? [...s.validity.infrequency.expectAgree, ...s.validity.infrequency.expectDisagree] : []),
    ...s.validity.honesty.items,
    ...s.validity.consistency.pairs.map((p) => p.b),
  ]
  const all = [...content, ...validityItems]
  const seen = new Set<number>()
  for (const item of all) {
    if (seen.has(item)) problems.push(`Duplicitní položka ${item}`)
    seen.add(item)
  }
  for (let i = 1; i <= s.itemCount; i++) {
    if (!seen.has(i)) problems.push(`Chybí položka ${i}`)
  }
  if (all.length !== s.itemCount) problems.push(`Součet položek ${all.length} ≠ ${s.itemCount}`)
  for (const r of s.reversedItems) {
    if (!content.includes(r)) problems.push(`Obrácená položka ${r} není obsahová`)
  }
  return { ok: problems.length === 0, problems }
}
