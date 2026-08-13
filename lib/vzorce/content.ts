import type { Lang } from "../diagnostic/types"
import { OBSAH } from "./data/obsah"
import { OBSAH_SK } from "./data/obsah-sk"
import { DVOJICE } from "./data/dvojice"
import { DVOJICE_SK } from "./data/dvojice-sk"
import type { VzorecId, VzorecObsah } from "./types"

// Výběr jazykové verze textů vyhodnocení.
//
// Každý jazyk má vlastní soubor se stejnými klíči. Volba je schválně na jednom
// místě: kdyby si ji každá komponenta řešila sama, dřív nebo později by se
// jedna zapomněla a vyhodnocení by bylo napůl české.
//
// Angličtina obsah vzorců zatím nemá a sahá po češtině, stejně jako to dělá
// lok() v lib/diagnostic/lang.ts. Až přijde, přibude tady jedna větev.

export function obsahVzorce(id: VzorecId, lang: Lang): VzorecObsah {
  return lang === "sk" ? OBSAH_SK[id] : OBSAH[id]
}

/** Název vzorce v daném jazyce. Zkratka pro místa, kde jde jen o popisek. */
export function nazevVzorce(id: VzorecId, lang: Lang): string {
  return obsahVzorce(id, lang).nazev
}

/** Popis dvojice vzorců; klíč je „01-07“. Vrací undefined, když text není. */
export function popisDvojiceProJazyk(klic: string, lang: Lang): string | undefined {
  return lang === "sk" ? DVOJICE_SK[klic] : DVOJICE[klic]
}

/** Má dvojice vlastní popsaný mechanismus? Nezávisí na jazyce, klíče jsou shodné. */
export function maVlastniPopis(klic: string): boolean {
  return DVOJICE[klic] !== undefined
}
