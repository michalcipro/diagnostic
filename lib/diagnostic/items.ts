import { doplnJazykyPolozek, lok } from "./lang"
import type { Lang, Localized, TestId } from "./types"
import elite200Sport from "./data/items/elite200-sport.json"
import elite200Business from "./data/items/elite200-business.json"
import elite100Sport from "./data/items/elite100-sport.json"
import elite100Business from "./data/items/elite100-business.json"
import vzorce from "../vzorce/data/polozky.json"
import vzorceSk from "../vzorce/data/polozky-sk.json"
import vzorceSportIndividual from "../vzorce/data/polozky-sport-individual.json"
import vzorceSportIndividualSk from "../vzorce/data/polozky-sport-individual-sk.json"
import vzorceSportTym from "../vzorce/data/polozky-sport-tym.json"
import vzorceSportTymSk from "../vzorce/data/polozky-sport-tym-sk.json"

type ItemsFile = Record<string, Localized>

/**
 * Vzorce mají zdrojový dotazník česky a slovenský překlad ve vlastním souboru.
 * Angličtina zatím chybí, doplní se z češtiny; přeložit ji je samostatný krok.
 */
const spojJazyky = (cs: Record<string, string>, sk: Record<string, string>): ItemsFile =>
  doplnJazykyPolozek(
    Object.fromEntries(Object.entries(cs).map(([id, text]) => [id, { cs: text, sk: sk[id] }])),
  )

const VZORCE_ITEMS: ItemsFile = spojJazyky(
  vzorce as Record<string, string>,
  vzorceSk as Record<string, string>,
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
)

const VZORCE_SPORT_TYM_ITEMS: ItemsFile = spojJazyky(
  vzorceSportTym as Record<string, string>,
  vzorceSportTymSk as Record<string, string>,
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
