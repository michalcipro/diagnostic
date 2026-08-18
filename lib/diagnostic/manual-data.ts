import { DIMENSIONS } from "./structure"
import { TEST_NAMES } from "./i18n"
import { testMeta } from "./test-meta"
import { MANUAL } from "./manual"
import type { DimensionId, Lang, TestId } from "./types"
import { obsahVzorce } from "../vzorce/content"
import { NAZVY_DOMEN, VZORCE, POTREBA_DOMENY } from "../vzorce/structure"
import type { Domena } from "../vzorce/types"
import { obsahArchetypu } from "../archetypy/content"
import { ARCHETYPY, NAZVY_MOTIVACI, POPISY_MOTIVACI } from "../archetypy/structure"
import type { Motivace } from "../archetypy/types"

// Řádky manuálu, které se dají odvodit z dat aplikace.
//
// Názvy dimenzí, vzorců, oblastí a archetypů se tu nepíšou znovu: kdyby se
// opsaly, manuál by po první úpravě testu tvrdil něco jiného než sám test.
// Ručně psaná je jen ta část, kterou z dat vytáhnout nejde, tedy výklad
// pro kouče; ten je v manual.ts.
//
// Čte z toho jak záložka v aplikaci, tak generátor PDF, aby se nerozešly.

/** Pořadí testů v manuálu. Legacy `vzorce-sport` se neuvádí, je jen pro staré odkazy. */
export const PORADI_TESTU = [
  "elite200-sport",
  "elite200-business",
  "elite100-sport",
  "elite100-business",
  "vzorce",
  "vzorce-sport-individual",
  "vzorce-sport-tym",
  "archetypy",
  "archetypy-sport",
] as const

export type ManualTestId = (typeof PORADI_TESTU)[number]

const DOMENY: Domena[] = ["odpojeni", "autonomie", "hranice", "zamereni", "ostrazitost"]
const SKUPINY: Motivace[] = ["nezavislost", "mistrovstvi", "sounalezitost", "rad"]

/** Rozsah testu jednou větou: „200 tvrzení · 45–60 minut“. */
export function rozsahTestu(id: ManualTestId, lang: Lang): string {
  const t = MANUAL[lang]
  return `${testMeta(id).pocetPolozek} ${t.tvrzeni} · ${t.testy[id].doba}`
}

/** Sedm oblastí ELITE: písmeno, název z dat, výklad pro kouče z manuálu. */
export function oblastiElite(lang: Lang): { id: DimensionId; nazev: string; popis: string }[] {
  return DIMENSIONS.map((d) => ({
    id: d.id,
    nazev: d.name[lang],
    popis: MANUAL[lang].oblasti[d.id as "A"],
  }))
}

/** Jedenáct vzorců i s tématem; bere se obecná varianta. */
export function vzorceRadky(lang: Lang): { id: string; nazev: string; tema: string }[] {
  return VZORCE.map((v) => {
    const o = obsahVzorce(v.id, lang, "obecna")
    return { id: v.id, nazev: o.nazev, tema: o.tema }
  })
}

/** Pět oblastí vzorců a potřeba, která za nimi stojí. */
export function oblastiVzorcu(lang: Lang): { nazev: string; potreba: string }[] {
  return DOMENY.map((d) => ({
    nazev: NAZVY_DOMEN.obecna[lang][d],
    potreba: POTREBA_DOMENY[lang][d],
  }))
}

/** Tytéž oblasti, jak se jmenují ve sportovních variantách. */
export function oblastiVzorcuSport(lang: Lang): string {
  return DOMENY.map((d) => NAZVY_DOMEN["sport-tym"][lang][d]).join(", ")
}

/** Čtyři motivační skupiny, každá se svými třemi archetypy. */
export function skupinyArchetypu(
  lang: Lang,
): { nazev: string; archetypy: string; popis: string }[] {
  return SKUPINY.map((m) => ({
    nazev: NAZVY_MOTIVACI[lang][m],
    archetypy: ARCHETYPY.filter((a) => a.motivace === m)
      .map((a) => obsahArchetypu(a.id, lang, "business").nazev)
      .join(" · "),
    popis: POPISY_MOTIVACI.business[lang][m],
  }))
}

/** Sportovní přezdívky archetypů do poznámky pod tabulkou. */
export function prezdivkySport(lang: Lang): string {
  return ARCHETYPY.map((a) => obsahArchetypu(a.id, lang, "sport").prezdivka)
    .filter(Boolean)
    .join(", ")
}

/** Závěrečný rejstřík: pořadí, název, rozsah, prostředí. */
export function prehledTestu(
  lang: Lang,
): { cislo: string; nazev: string; rozsah: string; prostredi: string }[] {
  const t = MANUAL[lang]
  return PORADI_TESTU.map((id, i) => ({
    cislo: String(i + 1).padStart(2, "0"),
    nazev: TEST_NAMES[id as TestId][lang],
    rozsah: `${testMeta(id).pocetPolozek} ${t.tvrzeni}`,
    prostredi: jeSport(id) ? t.prostredi.sport : t.prostredi.byznys,
  }))
}

function jeSport(id: ManualTestId): boolean {
  return id.includes("sport") && id !== "vzorce"
}
