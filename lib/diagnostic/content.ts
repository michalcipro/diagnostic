import { doplnJazyky } from "./lang"
import { applyGender } from "./gender"
import type { BandKey, DimensionId, Gender, Lang, Localized, Variant } from "./types"

// Znovu vyvezeno, ať se kvůli jedné funkci nemusí přepisovat všechna volání.
export { applyGender }
import contentA from "./data/content/A.json"
import contentB from "./data/content/B.json"
import contentC from "./data/content/C.json"
import contentD from "./data/content/D.json"
import contentE from "./data/content/E.json"
import contentF from "./data/content/F.json"
import contentG from "./data/content/G.json"

// Texty vyhodnocení – na fazetové i dimenzní úrovni, sport/business,
// česky, anglicky a slovensky.
//
// Slovenština se překládá po souborech; dokud u některého textu chybí, doplní
// se čeština. Zajišťuje to doplnJazyky() níž, takže zbytek aplikace nikde
// neřeší, jestli překlad existuje.

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

const CONTENT: Record<DimensionId, DimensionContent> = doplnJazyky({
  A: contentA as unknown as DimensionContent,
  B: contentB as unknown as DimensionContent,
  C: contentC as unknown as DimensionContent,
  D: contentD as unknown as DimensionContent,
  E: contentE as unknown as DimensionContent,
  F: contentF as unknown as DimensionContent,
  G: contentG as unknown as DimensionContent,
})

export function getDimensionContent(id: DimensionId): DimensionContent {
  return CONTENT[id]
}

export function getFacetContent(facetId: string): FacetContent | undefined {
  const dim = facetId.charAt(0) as DimensionId
  return CONTENT[dim]?.facets[facetId]
}

export function vt(text: VariantText, variant: Variant, lang: Lang, gender: Gender = "male"): string {
  return applyGender(text[variant]?.[lang] ?? "", gender)
}

export const ALL_DIMENSION_CONTENT = CONTENT
