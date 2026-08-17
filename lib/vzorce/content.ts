import type { Lang } from "../diagnostic/types"
import { OBSAH } from "./data/obsah"
import { OBSAH_SK } from "./data/obsah-sk"
import { OBSAH_SPORT_INDIVIDUAL } from "./data/obsah-sport-individual"
import { OBSAH_SPORT_INDIVIDUAL_SK } from "./data/obsah-sport-individual-sk"
import { OBSAH_SPORT_TYM } from "./data/obsah-sport-tym"
import { OBSAH_SPORT_TYM_SK } from "./data/obsah-sport-tym-sk"
import { OBSAH_EN } from "./data/obsah-en"
import { DVOJICE } from "./data/dvojice"
import { DVOJICE_SK } from "./data/dvojice-sk"
import { DVOJICE_SPORT_INDIVIDUAL } from "./data/dvojice-sport-individual"
import { DVOJICE_SPORT_INDIVIDUAL_SK } from "./data/dvojice-sport-individual-sk"
import { DVOJICE_SPORT_TYM } from "./data/dvojice-sport-tym"
import { DVOJICE_SPORT_TYM_SK } from "./data/dvojice-sport-tym-sk"
import type { Varianta, VzorecId, VzorecObsah } from "./types"

// Výběr textů vyhodnocení podle varianty a jazyka.
//
// Čtyři soubory na obsah a čtyři na dvojice, protože obojí se liší jak
// variantou, tak jazykem. Volba je schválně na jednom místě: kdyby si ji
// každá komponenta řešila sama, dřív nebo později by se jedna zapomněla
// a vyhodnocení by bylo napůl obecné nebo napůl české.
//
// Angličtina se doplňuje po částech. Kde už anglický text je, použije se;
// kde ještě není, sáhne se po češtině, stejně jako to dělá lok()
// v lib/diagnostic/lang.ts. Stav hlídá scripts/test-jazyky.cjs, aby bylo
// vidět, co ještě chybí, a aby se na to nezapomnělo.

/** Anglický text je zatím jen u některých variant; `en` je proto volitelné. */
type SadaObsahu = { cs: Record<VzorecId, VzorecObsah>; sk: Record<VzorecId, VzorecObsah>; en?: Record<VzorecId, VzorecObsah> }

const OBSAHY: Record<Varianta, SadaObsahu> = {
  obecna: { cs: OBSAH, sk: OBSAH_SK, en: OBSAH_EN },
  "sport-individual": { cs: OBSAH_SPORT_INDIVIDUAL, sk: OBSAH_SPORT_INDIVIDUAL_SK },
  "sport-tym": { cs: OBSAH_SPORT_TYM, sk: OBSAH_SPORT_TYM_SK },
}

type SadaDvojic = { cs: Record<string, string>; sk: Record<string, string>; en?: Record<string, string> }

const DVOJICE_VSE: Record<Varianta, SadaDvojic> = {
  obecna: { cs: DVOJICE, sk: DVOJICE_SK },
  "sport-individual": { cs: DVOJICE_SPORT_INDIVIDUAL, sk: DVOJICE_SPORT_INDIVIDUAL_SK },
  "sport-tym": { cs: DVOJICE_SPORT_TYM, sk: DVOJICE_SPORT_TYM_SK },
}

export function obsahVzorce(id: VzorecId, lang: Lang, varianta: Varianta = "obecna"): VzorecObsah {
  const sada = OBSAHY[varianta]
  if (lang === "sk") return sada.sk[id]
  if (lang === "en" && sada.en) return sada.en[id]
  return sada.cs[id]
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
  const sada = DVOJICE_VSE[varianta]
  if (lang === "sk") return sada.sk[klic]
  if (lang === "en" && sada.en) return sada.en[klic]
  return sada.cs[klic]
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
