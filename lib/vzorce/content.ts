import type { Lang } from "../diagnostic/types"
import { OBSAH } from "./data/obsah"
import { OBSAH_SK } from "./data/obsah-sk"
import { OBSAH_SPORT } from "./data/obsah-sport"
import { OBSAH_SPORT_SK } from "./data/obsah-sport-sk"
import { DVOJICE } from "./data/dvojice"
import { DVOJICE_SK } from "./data/dvojice-sk"
import { DVOJICE_SPORT } from "./data/dvojice-sport"
import { DVOJICE_SPORT_SK } from "./data/dvojice-sport-sk"
import type { Varianta, VzorecId, VzorecObsah } from "./types"

// Výběr textů vyhodnocení podle varianty a jazyka.
//
// Čtyři soubory na obsah a čtyři na dvojice, protože obojí se liší jak
// variantou, tak jazykem. Volba je schválně na jednom místě: kdyby si ji
// každá komponenta řešila sama, dřív nebo později by se jedna zapomněla
// a vyhodnocení by bylo napůl obecné nebo napůl české.
//
// Angličtina obsah vzorců zatím nemá a sahá po češtině, stejně jako to dělá
// lok() v lib/diagnostic/lang.ts.

const OBSAHY: Record<Varianta, Record<"cs" | "sk", Record<VzorecId, VzorecObsah>>> = {
  obecna: { cs: OBSAH, sk: OBSAH_SK },
  sport: { cs: OBSAH_SPORT, sk: OBSAH_SPORT_SK },
}

const DVOJICE_VSE: Record<Varianta, Record<"cs" | "sk", Record<string, string>>> = {
  obecna: { cs: DVOJICE, sk: DVOJICE_SK },
  sport: { cs: DVOJICE_SPORT, sk: DVOJICE_SPORT_SK },
}

const jazyk = (lang: Lang): "cs" | "sk" => (lang === "sk" ? "sk" : "cs")

export function obsahVzorce(id: VzorecId, lang: Lang, varianta: Varianta = "obecna"): VzorecObsah {
  return OBSAHY[varianta][jazyk(lang)][id]
}

/** Název vzorce v daném jazyce. Zkratka pro místa, kde jde jen o popisek. */
export function nazevVzorce(id: VzorecId, lang: Lang, varianta: Varianta = "obecna"): string {
  return obsahVzorce(id, lang, varianta).nazev
}

/** Popis dvojice vzorců; klíč je „01-07“. Vrací undefined, když text není. */
export function popisDvojiceProJazyk(
  klic: string,
  lang: Lang,
  varianta: Varianta = "obecna",
): string | undefined {
  return DVOJICE_VSE[varianta][jazyk(lang)][klic]
}

/**
 * Má dvojice vlastní popsaný mechanismus?
 *
 * Nezávisí na jazyce ani na variantě, protože klíče jsou ve všech čtyřech
 * souborech stejné; hlídá to scripts/test-vzorce-sk.cjs.
 */
export function maVlastniPopis(klic: string, varianta: Varianta = "obecna"): boolean {
  return DVOJICE_VSE[varianta].cs[klic] !== undefined
}
