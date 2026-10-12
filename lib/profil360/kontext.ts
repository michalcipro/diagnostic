import { KONTEXT_OTAZKY } from "../elitepro/dotaznik"

// Kontext sportovce jedním řádkem.
//
// Samotné odpovědi bez otázek se číst nedají: „6 až 10 let · jednou · 11 až 15“
// neříká, co je co. Každá odpověď se proto převádí na krátkou frázi, která
// nese i otázku: „soutěží 6 až 10 let · jedno vážnější zranění za poslední rok
// · trénuje 11 až 15 hodin týdně“.

const FRAZE: Record<number, (odpoved: string, index: number) => string> = {
  3001: (o) => `${o} sport`,
  3002: (o) => o,
  3003: (o) => `soutěží ${o}`,
  3004: (_o, i) =>
    [
      "bez vážnějšího zranění za poslední rok",
      "jedno vážnější zranění za poslední rok",
      "dvě vážnější zranění za poslední rok",
      "tři a víc vážnějších zranění za poslední rok",
    ][i] ?? "",
  3005: (o) => o,
  3006: (o) => `trénuje ${o} hodin týdně`,
}

/** Odpovědi na kontextové otázky jako čitelné fráze, v pořadí otázek. */
export function popisKontextu(odpovedi: Record<string, number>): string[] {
  return KONTEXT_OTAZKY.flatMap((o) => {
    const x = odpovedi[String(o.id)]
    if (typeof x !== "number") return []
    const moznost = o.moznosti[x - 1]
    if (!moznost) return []
    const fraze = FRAZE[o.id]
    return [fraze ? fraze(moznost, x - 1) : moznost]
  })
}
