import { doplnJazykyPolozek, lok } from "./lang"
import type { Lang, Localized, TestId } from "./types"
import elite200Sport from "./data/items/elite200-sport.json"
import elite200Business from "./data/items/elite200-business.json"
import elite100Sport from "./data/items/elite100-sport.json"
import elite100Business from "./data/items/elite100-business.json"
import vzorce from "../vzorce/data/polozky.json"
import vzorceSk from "../vzorce/data/polozky-sk.json"
import vzorceEn from "../vzorce/data/polozky-en.json"
import vzorceSportIndividual from "../vzorce/data/polozky-sport-individual.json"
import vzorceSportIndividualSk from "../vzorce/data/polozky-sport-individual-sk.json"
import vzorceSportIndividualEn from "../vzorce/data/polozky-sport-individual-en.json"
import vzorceSportTym from "../vzorce/data/polozky-sport-tym.json"
import vzorceSportTymSk from "../vzorce/data/polozky-sport-tym-sk.json"
import vzorceSportTymEn from "../vzorce/data/polozky-sport-tym-en.json"
import archetypy from "../archetypy/data/polozky.json"
import archetypySk from "../archetypy/data/polozky-sk.json"
import archetypyEn from "../archetypy/data/polozky-en.json"
import archetypySport from "../archetypy/data/polozky-sport.json"
import archetypySportSk from "../archetypy/data/polozky-sport-sk.json"
import archetypySportEn from "../archetypy/data/polozky-sport-en.json"

type ItemsFile = Record<string, Localized>

/**
 * Vzorce a archetypy mají každý jazyk ve vlastním souboru, protože dotazník
 * není přeložený řádek po řádku, ale psaný pro daný jazyk celý.
 *
 * Angličtina tu dřív chyběla a doplňovala se z češtiny. Vypadalo to jako
 * drobnost, ale znamenalo to, že anglicky pozvaný klient dostal český
 * dotazník; přesně kvůli tomu přišla reklamace.
 */
const spojJazyky = (
  cs: Record<string, string>,
  sk: Record<string, string>,
  en: Record<string, string>,
): ItemsFile =>
  doplnJazykyPolozek(
    Object.fromEntries(
      Object.entries(cs).map(([id, text]) => [id, { cs: text, sk: sk[id], en: en[id] }]),
    ),
  )

const VZORCE_ITEMS: ItemsFile = spojJazyky(
  vzorce as Record<string, string>,
  vzorceSk as Record<string, string>,
  vzorceEn as Record<string, string>,
)

/**
 * Sportovní verze mají vlastní dotazníky, ne přeformulovaný obecný. Vzorec se
 * v kabině projeví jinak než na okruhu a jinak než v kanceláři, takže se
 * každá položka ptá na situaci, kterou daný sportovec skutečně zná. Položky
 * si mezi variantami odpovídají číslo po čísle, míří na stejné schéma.
 */
const VZORCE_SPORT_INDIVIDUAL_ITEMS: ItemsFile = spojJazyky(
  vzorceSportIndividual as Record<string, string>,
  vzorceSportIndividualSk as Record<string, string>,
  vzorceSportIndividualEn as Record<string, string>,
)

const VZORCE_SPORT_TYM_ITEMS: ItemsFile = spojJazyky(
  vzorceSportTym as Record<string, string>,
  vzorceSportTymSk as Record<string, string>,
  vzorceSportTymEn as Record<string, string>,
)

const ARCHETYPY_ITEMS: ItemsFile = spojJazyky(
  archetypy as Record<string, string>,
  archetypySk as Record<string, string>,
  archetypyEn as Record<string, string>,
)

/**
 * Sportovní verze má vlastní dotazník, ne přeformulovaný byznysový: archetyp
 * je týž, ale ptát se majitele firmy a sportovce stejnými slovy nejde.
 */
const ARCHETYPY_SPORT_ITEMS: ItemsFile = spojJazyky(
  archetypySport as Record<string, string>,
  archetypySportSk as Record<string, string>,
  archetypySportEn as Record<string, string>,
)

const FILES: Record<TestId, ItemsFile> = {
  "elite200-sport": doplnJazykyPolozek(elite200Sport),
  "elite200-business": doplnJazykyPolozek(elite200Business),
  "elite100-sport": doplnJazykyPolozek(elite100Sport),
  "elite100-business": doplnJazykyPolozek(elite100Business),
  vzorce: VZORCE_ITEMS,
  // původní nerozdělená sportovní verze, kvůli už rozeslaným odkazům
  "vzorce-sport": VZORCE_SPORT_TYM_ITEMS,
  "vzorce-sport-individual": VZORCE_SPORT_INDIVIDUAL_ITEMS,
  "vzorce-sport-tym": VZORCE_SPORT_TYM_ITEMS,
  archetypy: ARCHETYPY_ITEMS,
  "archetypy-sport": ARCHETYPY_SPORT_ITEMS,
}

export interface Item {
  id: number
  text: Localized
}

export function getItems(testId: TestId): Item[] {
  const file = FILES[testId]
  return Object.entries(file)
    .map(([id, text]) => ({ id: Number(id), text }))
    .sort((a, b) => a.id - b.id)
}

export function itemText(item: Item, lang: Lang): string {
  return lok(item.text, lang)
}
