import { KONTROLNI, SKALY, VINETY } from "./klic"
import { POLOZEK_NA_SKALU, VINET_NA_SKUPINU } from "./spolecne"

// Pilotní forma: co přesně dostane jeden sportovec.
//
// Celá banka má 432 položek a do 45 minut se nevejde. Každý proto dostane
// z každé škály náhodnou polovinu kandidátů, dvě viněty z každé skupiny
// a pět kontrol. Každá škála je tak zastoupená u každého a každá dvojice
// položek se u stejných lidí potká dost často na to, aby šla spočítat
// korelace (plán validace, pilot 1).
//
// Forma se odvozuje z tokenu pozvánky, ne ukládá: stejný token dá vždycky
// stejnou formu, takže ji server při odeslání umí přepočítat a ověřit, že
// sportovec odpověděl právě na to, co dostal. Jen pro server, sahá do klíče.

export interface Forma {
  /** čísla položek v pořadí, jak se ukazují (dotazník je řadí do bloků podle formátu) */
  polozky: number[]
  /** čísla vinět v pořadí, jak se ukazují */
  vinety: number[]
}

/** FNV-1a, 32 bitů. Stačí na rozházení, nejde o bezpečnost. */
function hash(text: string): number {
  let h = 0x811c9dc5
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return h >>> 0
}

/** mulberry32: malý deterministický generátor, 0 ≤ x < 1. */
function generator(seminko: number): () => number {
  let a = seminko
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function zamichej<T>(pole: readonly T[], nahoda: () => number): T[] {
  const out = [...pole]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(nahoda() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

export function sestavFormu(token: string): Forma {
  const nahoda = generator(hash(`elitepro:${token}`))

  const polozky: number[] = []
  for (const s of SKALY) polozky.push(...zamichej(s.polozky, nahoda).slice(0, POLOZEK_NA_SKALU))

  // Kontroly: jedna instruovaná na souhlas, jedna na četnost a tři
  // nepravděpodobné. Víc by jen prodlužovalo; méně by nerozlišilo nepozornost
  // od jednoho přehmatu.
  const instruovane = KONTROLNI.filter((k) => k.druh === "instruovana")
  polozky.push(zamichej(instruovane.filter((k) => k.format === "P"), nahoda)[0].id)
  polozky.push(zamichej(instruovane.filter((k) => k.format === "C"), nahoda)[0].id)
  const nepravdepodobne = KONTROLNI.filter((k) => k.druh === "nepravdepodobna")
  polozky.push(...zamichej(nepravdepodobne, nahoda).slice(0, 3).map((k) => k.id))

  const vinety: number[] = []
  for (const skupina of [...new Set(VINETY.map((v) => v.skupina))]) {
    const zeSkupiny = VINETY.filter((v) => v.skupina === skupina)
    vinety.push(...zamichej(zeSkupiny, nahoda).slice(0, VINET_NA_SKUPINU).map((v) => v.id))
  }

  return { polozky: zamichej(polozky, nahoda), vinety: zamichej(vinety, nahoda) }
}

/** Čísla reakcí u vinět formy; na ty všechny má sportovec odpovědět. */
export function reakceFormy(forma: Forma): number[] {
  return forma.vinety.flatMap((vid) => VINETY.find((v) => v.id === vid)?.reakce.map((r) => r.id) ?? [])
}
