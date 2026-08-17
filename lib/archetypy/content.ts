import type { Lang } from "../diagnostic/types"
import type { ArchetypId, ArchetypObsah, Varianta } from "./types"
import { OBSAH_ARCHETYPU } from "./data/obsah"
import { OBSAH_ARCHETYPU_SK } from "./data/obsah-sk"
import { OBSAH_ARCHETYPU_SPORT } from "./data/obsah-sport"
import { OBSAH_ARCHETYPU_SPORT_SK } from "./data/obsah-sport-sk"
import { OBSAH_ARCHETYPU_EN } from "./data/obsah-en"
import { OBSAH_ARCHETYPU_SPORT_EN } from "./data/obsah-sport-en"

// Přístup k textům archetypů.
//
// Zdroj je česky, slovenština i angličtina mají vlastní soubory se shodnými
// klíči. Angličtina tu dřív chyběla a sahala po češtině, takže anglicky
// pozvaný klient dostal české vyhodnocení.
//
// Varianta rozhoduje, jestli se čte byznysový, nebo sportovní výklad.
// Archetyp je v obou týž, ale hřiště je jiné, takže se nesdílí ani věta.

const TABULKY: Record<Varianta, Record<Lang, Record<ArchetypId, ArchetypObsah>>> = {
  business: { cs: OBSAH_ARCHETYPU, sk: OBSAH_ARCHETYPU_SK, en: OBSAH_ARCHETYPU_EN },
  sport: {
    cs: OBSAH_ARCHETYPU_SPORT,
    sk: OBSAH_ARCHETYPU_SPORT_SK,
    en: OBSAH_ARCHETYPU_SPORT_EN,
  },
}

export function obsahArchetypu(
  id: ArchetypId,
  lang: Lang,
  varianta: Varianta = "business",
): ArchetypObsah {
  return TABULKY[varianta][lang][id]
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
