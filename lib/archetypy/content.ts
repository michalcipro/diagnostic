import type { Lang } from "../diagnostic/types"
import type { ArchetypId, ArchetypObsah, Varianta } from "./types"
import { OBSAH_ARCHETYPU } from "./data/obsah"
import { OBSAH_ARCHETYPU_SK } from "./data/obsah-sk"
import { OBSAH_ARCHETYPU_SPORT } from "./data/obsah-sport"
import { OBSAH_ARCHETYPU_SPORT_SK } from "./data/obsah-sport-sk"

// Přístup k textům archetypů.
//
// Zdroj je česky, slovenština má vlastní soubor se shodnými klíči.
// Angličtina zatím není a sahá po češtině, stejné pravidlo jako u vzorců:
// přeložit jen rámování a nechat uvnitř český výklad by bylo horší než
// poctivá čeština v celém dokumentu.
//
// Varianta rozhoduje, jestli se čte byznysový, nebo sportovní výklad.
// Archetyp je v obou týž, ale hřiště je jiné, takže se nesdílí ani věta.

const TABULKY: Record<Varianta, Record<"cs" | "sk", Record<ArchetypId, ArchetypObsah>>> = {
  business: { cs: OBSAH_ARCHETYPU, sk: OBSAH_ARCHETYPU_SK },
  sport: { cs: OBSAH_ARCHETYPU_SPORT, sk: OBSAH_ARCHETYPU_SPORT_SK },
}

export function obsahArchetypu(
  id: ArchetypId,
  lang: Lang,
  varianta: Varianta = "business",
): ArchetypObsah {
  return TABULKY[varianta][lang === "sk" ? "sk" : "cs"][id]
}

export function nazevArchetypu(
  id: ArchetypId,
  lang: Lang,
  varianta: Varianta = "business",
): string {
  return obsahArchetypu(id, lang, varianta).nazev
}

/**
 * Název pro grafy a seznamy. Sportovní verze přidává přezdívku, aby trenér
 * poznal typ dřív, než si přečte výklad.
 */
export function nazevSPrezdivkou(
  id: ArchetypId,
  lang: Lang,
  varianta: Varianta = "business",
): string {
  const o = obsahArchetypu(id, lang, varianta)
  return o.prezdivka ? `${o.nazev} · ${o.prezdivka}` : o.nazev
}
