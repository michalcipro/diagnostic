import type { Lang, Localized, TestId } from "./types"
import elite200Sport from "./data/items/elite200-sport.json"
import elite200Business from "./data/items/elite200-business.json"
import elite100Sport from "./data/items/elite100-sport.json"
import elite100Business from "./data/items/elite100-business.json"

type ItemsFile = Record<string, { cs: string; en: string }>

const FILES: Record<TestId, ItemsFile> = {
  "elite200-sport": elite200Sport as ItemsFile,
  "elite200-business": elite200Business as ItemsFile,
  "elite100-sport": elite100Sport as ItemsFile,
  "elite100-business": elite100Business as ItemsFile,
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
  // EN překlad s CZ fallbackem, dokud není doplněn
  return item.text[lang] || item.text.cs
}
