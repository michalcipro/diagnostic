import type {
  AdministrationInfo,
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
  // mimo rozsah (nemělo by nastat) – přiřaď krajní pásmo
  return score < bands[0].min ? bands[0].band : bands[bands.length - 1].band
}

function percent(raw: number, min: number, max: number): number {
  return Math.round(((raw - min) / (max - min)) * 1000) / 10
}

const worse = (a: ValidityStatus, b: ValidityStatus): ValidityStatus => {
  const order: ValidityStatus[] = ["ok", "caution", "invalid"]
  return order[Math.max(order.indexOf(a), order.indexOf(b))]
}

export function evaluateValidity(
  s: StructureDef,
  answers: AnswerMap,
  admin: AdministrationInfo = {},
): ValidityResult {
  // 2.1 Kontrola pozornosti
  const attentionEntries = Object.entries(s.validity.attention)
  const failedItems = attentionEntries
    .filter(([item, required]) => answers[Number(item)] !== required)
    .map(([item]) => Number(item))
  const attentionErrors = failedItems.length
  const attThr = s.validity.attentionThresholds
  const attention = {
    status: (attentionErrors >= attThr.invalid
      ? "invalid"
      : attentionErrors >= attThr.caution
        ? "caution"
        : "ok") as ValidityStatus,
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
  //
  // Pár, u kterého chybí některá odpověď, se do průměru NEPOČÍTÁ. Dřív se
  // takový pár bral jako dokonalá shoda, takže vynechávání položek index
  // validity zlepšovalo – přesně opačně, než má být.
  const cfg = s.validity.consistency
  const pairDiffs = cfg.pairs.map(({ a, b, type }) => {
    const va = answers[a]
    const vb = answers[b]
    const diff =
      va === undefined || vb === undefined ? null : Math.abs(va - (type === "reversed" ? 6 - vb : vb))
    return { a, b, diff }
  })
  const usable = pairDiffs.filter((p): p is { a: number; b: number; diff: number } => p.diff !== null)
  const pairsUsed = usable.length
  const consistencyAvailable = pairsUsed >= Math.ceil(cfg.pairs.length * cfg.minUsablePairs)
  const meanDiff = pairsUsed === 0 ? 0 : Math.round((usable.reduce((sum, p) => sum + p.diff, 0) / pairsUsed) * 100) / 100
  const pairsOver3 = usable.filter((p) => p.diff >= 3).length
  const consistency = {
    // Bez dostatku párů index nic neříká – pak zůstává „ok" a do celkového
    // verdiktu nevstupuje, ale v reportu je označený jako nezjistitelný.
    status: (!consistencyAvailable
      ? "ok"
      : meanDiff > cfg.invalidMeanDiff || pairsOver3 >= cfg.invalidPairCount
        ? "invalid"
        : meanDiff > cfg.cautionMeanDiff
          ? "caution"
          : "ok") as ValidityStatus,
    available: consistencyAvailable,
    meanDiff,
    pairsUsed,
    pairsTotal: cfg.pairs.length,
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

  // 2.6 Tempo vyplňování
  //
  // Položku nelze přečíst a zvážit za dvě sekundy. Krátký čas je jeden
  // z nejspolehlivějších ukazatelů nedbalého odpovídání a stojí nulové úsilí
  // navíc. Dlouhý čas naopak nic neznamená – respondent si mohl dát pauzu.
  let pace: ValidityResult["pace"]
  if (s.validity.pace && admin.durationSec !== undefined && admin.durationSec > 0 && values.length > 0) {
    const secPerItem = Math.round((admin.durationSec / values.length) * 100) / 100
    pace = {
      status: (secPerItem < s.validity.pace.invalidSecPerItem
        ? "invalid"
        : secPerItem < s.validity.pace.cautionSecPerItem
          ? "caution"
          : "ok") as ValidityStatus,
      secPerItem,
      totalSec: admin.durationSec,
    }
  }

  // Celkový verdikt.
  //
  // Tvrdé indexy říkají, jestli odpovědi vůbec odrážejí to, co měly měřit.
  // Měkké indexy (upřímnost, odpověďový styl) popisují, JAK o sobě respondent
  // vypovídá – to je informace k interpretaci, ne důvod vyhodnocení zahodit.
  // Proto mohou verdikt zvednout nejvýš na „opatrně".
  let overall: ValidityStatus = "ok"
  for (const st of [attention.status, infrequency?.status ?? "ok", consistency.status, pace?.status ?? "ok"]) {
    overall = worse(overall, st)
  }
  const soft = worse(honesty.status, responseStyle.status)
  if (soft !== "ok" && overall === "ok") overall = "caution"

  return { attention, infrequency, consistency, honesty, responseStyle, pace, overall }
}

/**
 * Skóre jedné škály.
 *
 * Chybějící položka se NEPOČÍTÁ jako nula. Minimum škály je počet položek
 * (každá alespoň 1 bod), takže nula by skóre srazila pod teoretické minimum –
 * tři vynechané položky z osmi dokázaly poslat jinak maximální profil
 * z pásma „elitní" do „stabilizace". Místo toho se skóre dopočte z průměru
 * zodpovězených položek a při příliš velkém výpadku se nevykazuje vůbec.
 */
function scoreScale(
  id: string,
  items: number[],
  answers: AnswerMap,
  reversedSet: Set<number>,
  bands: BandRange[],
  minCoverage: number,
): ScaleScore {
  const values: number[] = []
  for (const item of items) {
    const a = answers[item]
    if (a !== undefined) values.push(recode(a, reversedSet.has(item)))
  }
  const total = items.length
  const answered = values.length
  const min = total
  const max = total * 5
  const raw =
    answered === 0 ? min : Math.round((values.reduce((sum, v) => sum + v, 0) / answered) * total)
  return {
    id,
    raw,
    min,
    max,
    percent: percent(raw, min, max),
    band: bandFor(raw, bands),
    answered,
    total,
    reported: answered / total >= minCoverage,
  }
}

export function evaluate(
  s: StructureDef,
  answers: AnswerMap,
  admin: AdministrationInfo = {},
): DiagnosticResult {
  const validity = evaluateValidity(s, answers, admin)
  const reversedSet = new Set(s.reversedItems)
  const cover = s.scoring.minCoverage

  let facets: FacetScore[] | undefined
  let dimensions: DimensionScore[]

  if (s.facets) {
    // ELITE 200: fazety 8–40, dimenze 24–120
    const facetBands = s.scoring.facetBands!
    facets = s.facets.map((f) => ({
      ...scoreScale(f.id, f.items, answers, reversedSet, facetBands, cover),
      dimension: f.dimension,
    }))
    dimensions = s.dimensions.map((d) => {
      const dimFacets = facets!.filter((f) => f.dimension === d.id)
      // Dimenze se počítá přímo ze svých 24 položek, ne součtem fazetových
      // skóre – při chybějících odpovědích je dopočet z celé sady přesnější.
      const dimItems = dimFacets.flatMap((f) => s.facets!.find((x) => x.id === f.id)!.items)
      const base = scoreScale(d.id, dimItems, answers, reversedSet, s.scoring.dimensionBands, cover)
      // Heterogenitu má smysl číst jen tehdy, když jsou všechny tři fazety
      // vykazatelné – jinak by rozpětí míchalo skóre s mírou chybějících dat.
      const allReported = dimFacets.every((f) => f.reported)
      const spread = Math.max(...dimFacets.map((f) => f.raw)) - Math.min(...dimFacets.map((f) => f.raw))
      return {
        ...base,
        id: d.id,
        facets: dimFacets,
        facetSpread: allReported ? spread : undefined,
        heterogeneous:
          allReported && s.scoring.heterogeneityThreshold !== undefined
            ? spread >= s.scoring.heterogeneityThreshold
            : undefined,
      }
    })
  } else {
    // ELITE 100: dimenze = 12 položek, 12–60
    dimensions = s.dimensions.map((d) => ({
      ...scoreScale(d.id, d.items!, answers, reversedSet, s.scoring.dimensionBands, cover),
      id: d.id,
    }))
  }

  // Nejsilnější / nejslabší škály – jen z těch, které se vykazují.
  const pool: ScaleScore[] = (facets ?? dimensions).filter((x) => x.reported)
  const sorted = [...pool].sort((a, b) => b.raw - a.raw || a.id.localeCompare(b.id))
  const strongest = sorted.slice(0, s.scoring.topCount)
  const weakest = pool.length > s.scoring.topCount ? sorted.slice(-s.scoring.topCount).reverse() : []

  const reportedDims = dimensions.filter((d) => d.reported)
  const dimensionSpread =
    reportedDims.length > 1
      ? Math.max(...reportedDims.map((d) => d.raw)) - Math.min(...reportedDims.map((d) => d.raw))
      : undefined

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
      s.scoring.imbalanceThreshold !== undefined && dimensionSpread !== undefined
        ? dimensionSpread > s.scoring.imbalanceThreshold
        : undefined,
    answeredCount,
    complete: answeredCount === s.itemCount,
    durationSec: admin.durationSec,
  }
}

/** Kontrola integrity struktury – používá se v testech i při startu. */
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
