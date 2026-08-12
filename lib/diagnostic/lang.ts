import type { Lang, Localized } from "./types"

// Práce s jazyky obsahu.
//
// Aplikace umí češtinu, angličtinu a slovenštinu. Obsah se ale nepřekládá
// najednou: texty vyhodnocení jsou desítky tisíc slov a překládají se po
// souborech. Aby aplikace fungovala i v mezičase, má každý jazyk náhradní
// řetězec. Chybějící slovenský text se vezme z češtiny, které Slovák rozumí,
// a jakmile se překlad doplní, začne se sám používat bez další změny kódu.

export const JAZYKY: Lang[] = ["cs", "en", "sk"]

/** Krátký kód jazyka pro přepínač. */
export const KOD_JAZYKA: Record<Lang, string> = { cs: "CZ", en: "EN", sk: "SK" }

/**
 * Pořadí náhrad, když text v požadovaném jazyce ještě není.
 *
 * Slovenština sahá po češtině, protože jsou si blízké a čeština je vždy
 * kompletní. Angličtina sahá po češtině až jako po poslední možnosti; radši
 * srozumitelný cizí text než prázdno.
 */
const NAHRADY: Record<Lang, Lang[]> = {
  cs: ["cs", "sk", "en"],
  sk: ["sk", "cs", "en"],
  en: ["en", "cs", "sk"],
}

/** Text v daném jazyce, s náhradou podle pořadí výše. */
export function lok(text: Partial<Record<Lang, string>> | undefined, lang: Lang): string {
  if (!text) return ""
  for (const l of NAHRADY[lang]) {
    const t = text[l]
    if (t) return t
  }
  return ""
}

/** Vypadá objekt jako přeložený řetězec, tedy `{ cs, en, sk }`? */
function jePrelozeny(o: unknown): o is Partial<Record<Lang, string>> {
  if (typeof o !== "object" || o === null || Array.isArray(o)) return false
  const klice = Object.keys(o)
  if (!klice.length) return false
  if (!klice.every((k) => k === "cs" || k === "en" || k === "sk")) return false
  return Object.values(o).every((v) => typeof v === "string")
}

/**
 * Doplní chybějící jazyky podle náhradního řetězce, rekurzivně přes celý strom.
 *
 * Volá se jednou při načtení dat. Díky tomu je každý přeložený řetězec vždy
 * kompletní a všechna místa v aplikaci můžou dál sahat prostě přes `[lang]`,
 * aniž by řešila, jestli překlad existuje.
 */
export function doplnJazyky<T>(data: T): T {
  const projdi = (uzel: unknown): void => {
    if (Array.isArray(uzel)) {
      for (const x of uzel) projdi(x)
      return
    }
    if (typeof uzel !== "object" || uzel === null) return
    const o = uzel as Record<string, unknown>
    for (const klic of Object.keys(o)) {
      const hodnota = o[klic]
      if (jePrelozeny(hodnota)) {
        const t = hodnota as Partial<Record<Lang, string>>
        for (const l of JAZYKY) if (!t[l]) t[l] = lok(t, l)
      } else {
        projdi(hodnota)
      }
    }
  }
  // Kořen sám může být přeložený řetězec.
  if (jePrelozeny(data)) {
    const t = data as Partial<Record<Lang, string>>
    for (const l of JAZYKY) if (!t[l]) t[l] = lok(t, l)
    return data
  }
  projdi(data)
  return data
}

/** Doplní jazyky u mapy `{ "1": { cs, en } }`, jak ji mají soubory s položkami. */
export function doplnJazykyPolozek(
  file: Record<string, Partial<Record<Lang, string>>>,
): Record<string, Localized> {
  for (const t of Object.values(file)) {
    for (const l of JAZYKY) if (!t[l]) t[l] = lok(t, l)
  }
  return file as Record<string, Localized>
}
