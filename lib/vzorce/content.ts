import type { Lang } from "../diagnostic/types"
import { OBSAH } from "./data/obsah"
import { OBSAH_SK } from "./data/obsah-sk"
import { OBSAH_SPORT_INDIVIDUAL } from "./data/obsah-sport-individual"
import { OBSAH_SPORT_INDIVIDUAL_SK } from "./data/obsah-sport-individual-sk"
import { OBSAH_SPORT_TYM } from "./data/obsah-sport-tym"
import { OBSAH_SPORT_TYM_SK } from "./data/obsah-sport-tym-sk"
import { OBSAH_EN } from "./data/obsah-en"
import { OBSAH_SPORT_INDIVIDUAL_EN } from "./data/obsah-sport-individual-en"
import { OBSAH_SPORT_TYM_EN } from "./data/obsah-sport-tym-en"
import { DVOJICE_EN } from "./data/dvojice-en"
import { DVOJICE_SPORT_INDIVIDUAL_EN } from "./data/dvojice-sport-individual-en"
import { DVOJICE_SPORT_TYM_EN } from "./data/dvojice-sport-tym-en"
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
// Všechny tři jazyky mají vlastní texty ve všech třech variantách. Angličtina
// tu dřív chyběla a padala na češtinu, takže anglicky pozvaný klient dostal
// české vyhodnocení; hlídá to scripts/test-jazyky.cjs.

const OBSAHY: Record<Varianta, Record<Lang, Record<VzorecId, VzorecObsah>>> = {
  obecna: { cs: OBSAH, sk: OBSAH_SK, en: OBSAH_EN },
  "sport-individual": {
    cs: OBSAH_SPORT_INDIVIDUAL,
    sk: OBSAH_SPORT_INDIVIDUAL_SK,
    en: OBSAH_SPORT_INDIVIDUAL_EN,
  },
  "sport-tym": { cs: OBSAH_SPORT_TYM, sk: OBSAH_SPORT_TYM_SK, en: OBSAH_SPORT_TYM_EN },
}

const DVOJICE_VSE: Record<Varianta, Record<Lang, Record<string, string>>> = {
  obecna: { cs: DVOJICE, sk: DVOJICE_SK, en: DVOJICE_EN },
  "sport-individual": {
    cs: DVOJICE_SPORT_INDIVIDUAL,
    sk: DVOJICE_SPORT_INDIVIDUAL_SK,
    en: DVOJICE_SPORT_INDIVIDUAL_EN,
  },
  "sport-tym": { cs: DVOJICE_SPORT_TYM, sk: DVOJICE_SPORT_TYM_SK, en: DVOJICE_SPORT_TYM_EN },
}

export function obsahVzorce(id: VzorecId, lang: Lang, varianta: Varianta = "obecna"): VzorecObsah {
  return OBSAHY[varianta][lang][id]
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
  return DVOJICE_VSE[varianta][lang][klic]
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
