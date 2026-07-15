import type { BandKey, DimensionId, Lang, Localized, Variant } from "./types"
import contentA from "./data/content/A.json"
import contentB from "./data/content/B.json"
import contentC from "./data/content/C.json"
import contentD from "./data/content/D.json"
import contentE from "./data/content/E.json"
import contentF from "./data/content/F.json"
import contentG from "./data/content/G.json"

// Texty vyhodnocení — na fazetové i dimenzní úrovni, sport/business, cs/en.

export interface VariantText {
  sport: Localized
  business: Localized
}

export interface FacetContent {
  name: Localized
  bands: Record<BandKey, VariantText>
  development: VariantText
}

export interface DimensionContent {
  id: DimensionId
  name: Localized
  tagline: VariantText
  bands: Record<BandKey, VariantText>
  facets: Record<string, FacetContent>
}

const CONTENT: Record<DimensionId, DimensionContent> = {
  A: contentA as unknown as DimensionContent,
  B: contentB as unknown as DimensionContent,
  C: contentC as unknown as DimensionContent,
  D: contentD as unknown as DimensionContent,
  E: contentE as unknown as DimensionContent,
  F: contentF as unknown as DimensionContent,
  G: contentG as unknown as DimensionContent,
}

export function getDimensionContent(id: DimensionId): DimensionContent {
  return CONTENT[id]
}

export function getFacetContent(facetId: string): FacetContent | undefined {
  const dim = facetId.charAt(0) as DimensionId
  return CONTENT[dim]?.facets[facetId]
}

export function vt(text: VariantText, variant: Variant, lang: Lang): string {
  return text[variant]?.[lang] ?? ""
}

export const ALL_DIMENSION_CONTENT = CONTENT
