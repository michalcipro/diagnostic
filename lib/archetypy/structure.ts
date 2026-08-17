import type { Lang } from "../diagnostic/types"
import type { ArchetypDef, ArchetypId, Motivace, Varianta } from "./types"

// Struktura testu archetypů značky.
//
// 12 archetypů po 8 položkách, škála 1-6, skóre archetypu 8 až 48. Položky
// jsou číslované průběžně 1-96: archetyp v pořadí registru má položky
// (n-1)*8+1 až n*8. Pořadí registru sleduje knihu: čtyři motivační skupiny
// po třech archetypech.

export const POCET_POLOZEK = 96
export const POLOZEK_NA_ARCHETYP = 8

const rozsah = (poradi: number): number[] => {
  const zacatek = (poradi - 1) * POLOZEK_NA_ARCHETYP
  return Array.from({ length: POLOZEK_NA_ARCHETYP }, (_, i) => zacatek + i + 1)
}

export const ARCHETYPY: ArchetypDef[] = [
  // nezávislost a naplnění
  { id: "nevinatko", motivace: "nezavislost", polozky: rozsah(1) },
  { id: "objevitel", motivace: "nezavislost", polozky: rozsah(2) },
  { id: "mudrc", motivace: "nezavislost", polozky: rozsah(3) },
  // riziko a mistrovství
  { id: "hrdina", motivace: "mistrovstvi", polozky: rozsah(4) },
  { id: "rebel", motivace: "mistrovstvi", polozky: rozsah(5) },
  { id: "mag", motivace: "mistrovstvi", polozky: rozsah(6) },
  // sounáležitost a potěšení
  { id: "jeden-z-nas", motivace: "sounalezitost", polozky: rozsah(7) },
  { id: "milenec", motivace: "sounalezitost", polozky: rozsah(8) },
  { id: "sprymar", motivace: "sounalezitost", polozky: rozsah(9) },
  // stabilita a kontrola
  { id: "pecovatel", motivace: "rad", polozky: rozsah(10) },
  { id: "tvurce", motivace: "rad", polozky: rozsah(11) },
  { id: "vladce", motivace: "rad", polozky: rozsah(12) },
]

export function archetyp(id: ArchetypId): ArchetypDef {
  return ARCHETYPY.find((a) => a.id === id)!
}

// ---------------------------------------------------------------------------
// Názvy motivačních skupin ve všech třech jazycích.
// ---------------------------------------------------------------------------

const MOTIVACE_CS: Record<Motivace, string> = {
  nezavislost: "Nezávislost a naplnění",
  mistrovstvi: "Riziko a mistrovství",
  sounalezitost: "Sounáležitost a potěšení",
  rad: "Stabilita a kontrola",
}

const MOTIVACE_SK: Record<Motivace, string> = {
  nezavislost: "Nezávislosť a naplnenie",
  mistrovstvi: "Riziko a majstrovstvo",
  sounalezitost: "Spolupatričnosť a potešenie",
  rad: "Stabilita a kontrola",
}

const MOTIVACE_EN: Record<Motivace, string> = {
  nezavislost: "Independence and fulfilment",
  mistrovstvi: "Risk and mastery",
  sounalezitost: "Belonging and enjoyment",
  rad: "Stability and control",
}

export const NAZVY_MOTIVACI: Record<Lang, Record<Motivace, string>> = {
  cs: MOTIVACE_CS,
  sk: MOTIVACE_SK,
  en: MOTIVACE_EN,
}

/** Čemu skupina odpovídá v praxi; ukazuje se pod grafem motivací. */
const MOTIVACE_POPIS_CS: Record<Motivace, string> = {
  nezavislost: "být svůj, rozumět světu a žít podle vlastního přesvědčení",
  mistrovstvi: "dokázat něco, změnit svět a nechat po sobě stopu",
  sounalezitost: "patřit k lidem, mít je rád a užívat si s nimi",
  rad: "postarat se, vybudovat a udržet věci pod kontrolou",
}

const MOTIVACE_POPIS_SK: Record<Motivace, string> = {
  nezavislost: "byť svoj, rozumieť svetu a žiť podľa vlastného presvedčenia",
  mistrovstvi: "dokázať niečo, zmeniť svet a nechať po sebe stopu",
  sounalezitost: "patriť k ľuďom, mať ich rád a užívať si s nimi",
  rad: "postarať sa, vybudovať a udržať veci pod kontrolou",
}

const MOTIVACE_POPIS_EN: Record<Motivace, string> = {
  nezavislost: "to be your own person, understand the world and live by your own convictions",
  mistrovstvi: "to achieve something, change the world and leave a mark",
  sounalezitost: "to belong with people, care for them and enjoy their company",
  rad: "to look after things, build them and keep them under control",
}

/** Táž čtveřice ve sportovním jazyce: motiv se nemění, mění se hřiště. */
const MOTIVACE_POPIS_SPORT_CS: Record<Motivace, string> = {
  nezavislost: "být sám sebou, rozumět svému sportu a jít vlastní cestou",
  mistrovstvi: "dokázat, co ve mně je, překonávat hranice a vyhrávat",
  sounalezitost: "patřit do party, mít lidi kolem sebe rád a užívat si sport",
  rad: "držet řád, starat se o ostatní a mít přípravu pod kontrolou",
}

const MOTIVACE_POPIS_SPORT_SK: Record<Motivace, string> = {
  nezavislost: "byť sám sebou, rozumieť svojmu športu a ísť vlastnou cestou",
  mistrovstvi: "dokázať, čo vo mne je, prekonávať hranice a vyhrávať",
  sounalezitost: "patriť do party, mať ľudí okolo seba rád a užívať si šport",
  rad: "držať poriadok, starať sa o ostatných a mať prípravu pod kontrolou",
}

const MOTIVACE_POPIS_SPORT_EN: Record<Motivace, string> = {
  nezavislost: "to be yourself, understand your sport and go your own way",
  mistrovstvi: "to show what is in you, push past limits and win",
  sounalezitost: "to belong to the group, care for the people around you and enjoy the sport",
  rad: "to hold the order, look after the others and keep preparation under control",
}

export const POPISY_MOTIVACI: Record<Varianta, Record<Lang, Record<Motivace, string>>> = {
  business: {
    cs: MOTIVACE_POPIS_CS,
    sk: MOTIVACE_POPIS_SK,
    en: MOTIVACE_POPIS_EN,
  },
  sport: {
    cs: MOTIVACE_POPIS_SPORT_CS,
    sk: MOTIVACE_POPIS_SPORT_SK,
    en: MOTIVACE_POPIS_SPORT_EN,
  },
}
