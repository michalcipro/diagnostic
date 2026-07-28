import type { Domena, PasmoRozsah, VzorecDef, VzorecId } from "./types"

// Struktura testu emocionálně-destruktivních vzorců.
//
// 11 vzorců po 10 položkách, škála 1-6, skóre jednoho vzorce 10 až 60.
// Položky jsou číslované průběžně 1-110 v pořadí, v jakém jdou v dotazníku:
// vzorec 01 má položky 1-10, vzorec 02 položky 11-20 a tak dál.

export const POCET_POLOZEK = 110
export const POLOZEK_NA_VZOREC = 10

const rozsah = (poradi: number): number[] => {
  const zacatek = (poradi - 1) * POLOZEK_NA_VZOREC
  return Array.from({ length: POLOZEK_NA_VZOREC }, (_, i) => zacatek + i + 1)
}

export const VZORCE: VzorecDef[] = [
  { id: "01", nazev: "Opuštění", tema: "Strach ze ztráty a emoční nestability", domena: "odpojeni", polozky: rozsah(1) },
  { id: "02", nazev: "Nedůvěra", tema: "Ostražitost, nedůvěra a očekávání zrady", domena: "odpojeni", polozky: rozsah(2) },
  { id: "03", nazev: "Citová deprivace", tema: "Emoční hlad a nenaplněná potřeba blízkosti", domena: "odpojeni", polozky: rozsah(3) },
  { id: "04", nazev: "Společenské vyloučení", tema: "Pocit odlišnosti a vyloučení ze skupiny", domena: "odpojeni", polozky: rozsah(4) },
  { id: "05", nazev: "Závislost", tema: "Nejistota v samostatnosti a rozhodování", domena: "autonomie", polozky: rozsah(5) },
  { id: "06", nazev: "Zranitelnost", tema: "Katastrofizace a očekávání ohrožení", domena: "autonomie", polozky: rozsah(6) },
  { id: "07", nazev: "Méněcennost", tema: "Stud, vnitřní nedostatečnost a strach z odhalení", domena: "odpojeni", polozky: rozsah(7) },
  { id: "08", nazev: "Selhání", tema: "Očekávání neúspěchu a výkonová nedůvěra v sebe", domena: "autonomie", polozky: rozsah(8) },
  { id: "09", nazev: "Podmanění", tema: "Přizpůsobení, potlačení sebe a ztráta hranic", domena: "zamereni", polozky: rozsah(9) },
  { id: "10", nazev: "Perfekcionismus", tema: "Neúprosné nároky, tlak a výkonová identita", domena: "ostrazitost", polozky: rozsah(10) },
  { id: "11", nazev: "Výjimečnost / velikášství", tema: "Nárokovost, impulz a problém s hranicí", domena: "hranice", polozky: rozsah(11) },
]

/** Pásma aktivace přesně podle klíče v dokumentu. */
export const PASMA: PasmoRozsah[] = [
  { min: 10, max: 19, pasmo: "velmi-nizka" },
  { min: 20, max: 29, pasmo: "nizka" },
  { min: 30, max: 39, pasmo: "stredni" },
  { min: 40, max: 49, pasmo: "vysoka" },
  { min: 50, max: 60, pasmo: "dominantni" },
]

export const NAZVY_PASEM: Record<PasmoRozsah["pasmo"], string> = {
  "velmi-nizka": "Velmi nízká aktivace",
  nizka: "Nízká aktivace",
  stredni: "Střední aktivace",
  vysoka: "Vysoká aktivace",
  dominantni: "Dominantní aktivace",
}

export const NAZVY_DOMEN: Record<Domena, string> = {
  odpojeni: "Odpojení a odmítnutí",
  autonomie: "Narušená autonomie a výkon",
  hranice: "Narušené hranice",
  zamereni: "Zaměření na druhé",
  ostrazitost: "Přehnaná ostražitost a nároky",
}

/**
 * Co v dětství zůstalo nenaplněné. Používá se v propojeném shrnutí, aby
 * několik vzorců ze stejné domény dalo jednu větu místo tří.
 */
export const POTREBA_DOMENY: Record<Domena, string> = {
  odpojeni: "bezpečná a spolehlivá blízkost",
  autonomie: "podpora k samostatnosti a důvěra ve vlastní síly",
  hranice: "laskavé, ale pevné hranice",
  zamereni: "právo mít vlastní potřeby a říkat je nahlas",
  ostrazitost: "přijetí bez podmínek a bez výkonu",
}

/** Minimální podíl zodpovězených položek, aby se skóre vzorce vykázalo. */
export const MIN_POKRYTI = 0.8

/** Kolik odpovědí 5-6 stačí, aby se vzorec hlásil jako situačně aktivovaný. */
export const SILNYCH_PRO_SITUACNI = 3

export function vzorec(id: VzorecId): VzorecDef {
  return VZORCE.find((v) => v.id === id)!
}

export function pasmoProSkore(skore: number): PasmoRozsah["pasmo"] {
  for (const p of PASMA) if (skore >= p.min && skore <= p.max) return p.pasmo
  return skore < PASMA[0].min ? PASMA[0].pasmo : PASMA[PASMA.length - 1].pasmo
}
