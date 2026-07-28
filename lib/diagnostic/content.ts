import type { BandKey, DimensionId, Gender, Lang, Localized, Variant } from "./types"
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

/**
 * Rozvine rodové tvary zapsané jako `{mužský|ženský}`.
 *
 * Čeština rod oslovované osoby prozradí u příčestí minulých, krátkých tvarů
 * a přídavných jmen v přísudku. Nechat ženu číst text v mužském rodě je hrubá
 * chyba, proto se každé takové místo v obsahu označuje a tady se rozvíjí.
 *
 * Angličtina rod neřeší — značka se v anglických textech nevyskytuje, a kdyby
 * se tam omylem dostala, rozvine se stejným způsobem a nerozbije větu.
 */
export function applyGender(text: string, gender: Gender): string {
  if (!text.includes("{")) return text
  const zensky = gender === "female"
  return text.replace(/\{([^{}|]*)\|([^{}|]*)\}/g, (_, m: string, f: string) => (zensky ? f : m))
}

export function vt(text: VariantText, variant: Variant, lang: Lang, gender: Gender = "male"): string {
  return applyGender(text[variant]?.[lang] ?? "", gender)
}

export const ALL_DIMENSION_CONTENT = CONTENT
