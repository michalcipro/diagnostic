import { doplnJazykyPolozek, lok } from "./lang"
import type { Lang, Localized, TestId } from "./types"
import elite200Sport from "./data/items/elite200-sport.json"
import elite200Business from "./data/items/elite200-business.json"
import elite100Sport from "./data/items/elite100-sport.json"
import elite100Business from "./data/items/elite100-business.json"
import vzorce from "../vzorce/data/polozky.json"
import vzorceSk from "../vzorce/data/polozky-sk.json"
import vzorceSport from "../vzorce/data/polozky-sport.json"
import vzorceSportSk from "../vzorce/data/polozky-sport-sk.json"

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
 * Sportovní verze má vlastní dotazník, ne přeformulovaný obecný. Vzorec se
 * v kabině projeví jinak než v kanceláři, takže se každá položka ptá na
 * situaci, kterou sportovec zná.
 */
const VZORCE_SPORT_ITEMS: ItemsFile = spojJazyky(
  vzorceSport as Record<string, string>,
  vzorceSportSk as Record<string, string>,
)

const FILES: Record<TestId, ItemsFile> = {
  "elite200-sport": doplnJazykyPolozek(elite200Sport),
  "elite200-business": doplnJazykyPolozek(elite200Business),
  "elite100-sport": doplnJazykyPolozek(elite100Sport),
  "elite100-business": doplnJazykyPolozek(elite100Business),
  vzorce: VZORCE_ITEMS,
  "vzorce-sport": VZORCE_SPORT_ITEMS,
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
