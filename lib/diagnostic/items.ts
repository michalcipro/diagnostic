import { doplnJazykyPolozek, lok } from "./lang"
import type { Lang, Localized, TestId } from "./types"

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


/**
 * Sportovní verze mají vlastní dotazníky, ne přeformulovaný obecný. Vzorec se
 * v kabině projeví jinak než na okruhu a jinak než v kanceláři, takže se
 * každá položka ptá na situaci, kterou daný sportovec skutečně zná. Položky
 * si mezi variantami odpovídají číslo po čísle, míří na stejné schéma.
 */



/**
 * Sportovní verze má vlastní dotazník, ne přeformulovaný byznysový: archetyp
 * je týž, ale ptát se majitele firmy a sportovce stejnými slovy nejde.
 */

/**
 * Načtení dotazníku až ve chvíli, kdy je potřeba.
 *
 * Dřív byly všechny soubory naimportované staticky, takže si respondent
 * pozvaný na archetypy stáhl i všech 200 položek ELITE a obě sportovní
 * verze vzorců, ve třech jazycích. Stačilo otevřít zdroj stránky a byl
 * z toho kompletní soupis položek celého produktu.
 */
const NACITACE: Record<TestId, () => Promise<ItemsFile>> = {
  "elite200-sport": async () => doplnJazykyPolozek((await import("./data/items/elite200-sport.json")).default),
  "elite200-business": async () => doplnJazykyPolozek((await import("./data/items/elite200-business.json")).default),
  "elite100-sport": async () => doplnJazykyPolozek((await import("./data/items/elite100-sport.json")).default),
  "elite100-business": async () => doplnJazykyPolozek((await import("./data/items/elite100-business.json")).default),
  vzorce: async () =>
    spojJazyky(
      (await import("../vzorce/data/polozky.json")).default,
      (await import("../vzorce/data/polozky-sk.json")).default,
      (await import("../vzorce/data/polozky-en.json")).default,
    ),
  // původní nerozdělená sportovní verze, kvůli už rozeslaným odkazům
  "vzorce-sport": async () => NACITACE["vzorce-sport-tym"](),
  "vzorce-sport-individual": async () =>
    spojJazyky(
      (await import("../vzorce/data/polozky-sport-individual.json")).default,
      (await import("../vzorce/data/polozky-sport-individual-sk.json")).default,
      (await import("../vzorce/data/polozky-sport-individual-en.json")).default,
    ),
  "vzorce-sport-tym": async () =>
    spojJazyky(
      (await import("../vzorce/data/polozky-sport-tym.json")).default,
      (await import("../vzorce/data/polozky-sport-tym-sk.json")).default,
      (await import("../vzorce/data/polozky-sport-tym-en.json")).default,
    ),
  archetypy: async () =>
    spojJazyky(
      (await import("../archetypy/data/polozky.json")).default,
      (await import("../archetypy/data/polozky-sk.json")).default,
      (await import("../archetypy/data/polozky-en.json")).default,
    ),
  "archetypy-sport": async () =>
    spojJazyky(
      (await import("../archetypy/data/polozky-sport.json")).default,
      (await import("../archetypy/data/polozky-sport-sk.json")).default,
      (await import("../archetypy/data/polozky-sport-en.json")).default,
    ),
}

export interface Item {
  id: number
  text: Localized
}

/** Jednou načtený dotazník se drží, ať se přepnutím jazyka nestahuje znovu. */
const nactene = new Map<TestId, Item[]>()

export async function getItems(testId: TestId): Promise<Item[]> {
  const hotove = nactene.get(testId)
  if (hotove) return hotove
  const file = await NACITACE[testId]()
  const items = Object.entries(file)
    .map(([id, text]) => ({ id: Number(id), text }))
    .sort((a, b) => a.id - b.id)
  nactene.set(testId, items)
  return items
}

export function itemText(item: Item, lang: Lang): string {
  return lok(item.text, lang)
}
