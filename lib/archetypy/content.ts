import type { Lang } from "../diagnostic/types"
import type { ArchetypId, ArchetypObsah } from "./types"
import { OBSAH_ARCHETYPU } from "./data/obsah"
import { OBSAH_ARCHETYPU_SK } from "./data/obsah-sk"

// Přístup k textům archetypů.
//
// Zdroj je česky, slovenština má vlastní soubor se shodnými klíči.
// Angličtina zatím není a sahá po češtině, stejné pravidlo jako u vzorců:
// přeložit jen rámování a nechat uvnitř český výklad by bylo horší než
// poctivá čeština v celém dokumentu.

export function obsahArchetypu(id: ArchetypId, lang: Lang): ArchetypObsah {
  return (lang === "sk" ? OBSAH_ARCHETYPU_SK : OBSAH_ARCHETYPU)[id]
}

export function nazevArchetypu(id: ArchetypId, lang: Lang): string {
  return obsahArchetypu(id, lang).nazev
}
