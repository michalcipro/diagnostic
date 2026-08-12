import { doplnJazykyPolozek, lok } from "./lang"
import type { Lang, Localized, TestId } from "./types"
import elite200Sport from "./data/items/elite200-sport.json"
import elite200Business from "./data/items/elite200-business.json"
import elite100Sport from "./data/items/elite100-sport.json"
import elite100Business from "./data/items/elite100-business.json"
import vzorce from "../vzorce/data/polozky.json"

type ItemsFile = Record<string, Localized>

/**
 * Vzorce mají položky jen česky, protože zdrojový dotazník existuje jen v této
 * podobě. Ostatní jazyky se zatím doplní z češtiny; překlad je samostatný krok.
 */
const VZORCE_ITEMS: ItemsFile = doplnJazykyPolozek(
  Object.fromEntries(Object.entries(vzorce as Record<string, string>).map(([id, cs]) => [id, { cs }])),
)

const FILES: Record<TestId, ItemsFile> = {
  "elite200-sport": doplnJazykyPolozek(elite200Sport),
  "elite200-business": doplnJazykyPolozek(elite200Business),
  "elite100-sport": doplnJazykyPolozek(elite100Sport),
  "elite100-business": doplnJazykyPolozek(elite100Business),
  vzorce: VZORCE_ITEMS,
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
