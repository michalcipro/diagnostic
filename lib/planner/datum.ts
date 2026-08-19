import type { Lang } from "@/lib/diagnostic/types"

// Práce s datem v plánovači.
//
// Všechno se počítá v UTC nad řetězci „YYYY-MM-DD". Důvod je praktický:
// kdyby se počítalo přes místní čas, posunul by se v noci na letní čas jeden
// den o hodinu a týden by pak měl šest nebo osm dnů. Deník žádný čas neřeší,
// jen datum, takže je UTC ta nejbezpečnější volba.

const DEN = 24 * 60 * 60 * 1000

/** Je řetězec platné datum ve tvaru „YYYY-MM-DD"? */
export function jeDatum(s: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false
  const t = Date.parse(`${s}T00:00:00Z`)
  if (!Number.isFinite(t)) return false
  // Kontrola zpětným převodem odchytí 31. února a spol.: Date.parse je
  // u neexistujících dnů shovívavý a přeteče do dalšího měsíce.
  return naISO(new Date(t)) === s
}

function naISO(d: Date): string {
  return d.toISOString().slice(0, 10)
}

function zISO(s: string): Date {
  return new Date(`${s}T00:00:00Z`)
}

/** Dnešní datum podle prohlížeče, ve tvaru „YYYY-MM-DD". */
export function dnes(): string {
  const t = new Date()
  // Datum se bere z místního kalendáře, ne z UTC: kdo v Praze zapisuje ve
  // 23:30, myslí tím dnešek, ne zítřek.
  const rok = t.getFullYear()
  const mesic = String(t.getMonth() + 1).padStart(2, "0")
  const den = String(t.getDate()).padStart(2, "0")
  return `${rok}-${mesic}-${den}`
}

/** Datum posunuté o n dnů. */
export function posun(datum: string, n: number): string {
  return naISO(new Date(zISO(datum).getTime() + n * DEN))
}

/** Počet dnů mezi dvěma daty (do minus od). */
export function rozdilDnu(od: string, do_: string): number {
  return Math.round((zISO(do_).getTime() - zISO(od).getTime()) / DEN)
}

/**
 * Pondělí týdne, do kterého datum spadá.
 *
 * Týden začíná pondělkem, jak to má papírová předloha i evropský zvyk.
 */
export function pondeli(datum: string): string {
  const d = zISO(datum)
  // getUTCDay(): neděle je 0, proto se převádí na 7, aby pondělí bylo 1.
  const denVTydnu = d.getUTCDay() === 0 ? 7 : d.getUTCDay()
  return posun(datum, 1 - denVTydnu)
}

/** Sedm dnů týdne od zadaného pondělí. */
export function dnyTydne(pondeliDatum: string): string[] {
  return Array.from({ length: 7 }, (_, i) => posun(pondeliDatum, i))
}

/**
 * Číslo týdne podle ISO 8601.
 *
 * Rok týdne se může lišit od roku data: 1. leden může patřit do posledního
 * týdne loňska. Bez toho by se u přelomu roku počítal týden 53 do nového roku
 * a statistika by měla o týden navíc.
 */
export function isoTyden(datum: string): { rok: number; tyden: number } {
  const d = zISO(datum)
  const denVTydnu = d.getUTCDay() === 0 ? 7 : d.getUTCDay()
  // Posun na čtvrtek téhož týdne: ISO týden patří do roku, ve kterém leží
  // jeho čtvrtek.
  const ctvrtek = new Date(d.getTime() + (4 - denVTydnu) * DEN)
  const rok = ctvrtek.getUTCFullYear()
  const prvniLeden = new Date(Date.UTC(rok, 0, 1))
  const tyden = Math.floor((ctvrtek.getTime() - prvniLeden.getTime()) / (7 * DEN)) + 1
  return { rok, tyden }
}

/** Popisek týdne, například „34/2026". */
export function popisTydne(pondeliDatum: string): string {
  const { rok, tyden } = isoTyden(pondeliDatum)
  return `${tyden}/${rok}`
}

/** Klíč měsíce, „2026-08". */
export function klicMesice(datum: string): string {
  return datum.slice(0, 7)
}

/** Klíč roku, „2026". */
export function klicRoku(datum: string): string {
  return datum.slice(0, 4)
}

/** První a poslední den měsíce zadaného jako „2026-08". */
export function rozsahMesice(mesic: string): { od: string; do: string } {
  const rok = Number(mesic.slice(0, 4))
  const m = Number(mesic.slice(5, 7))
  const od = `${mesic}-01`
  // Nultý den následujícího měsíce je poslední den toho současného.
  const posledni = new Date(Date.UTC(rok, m, 0))
  return { od, do: naISO(posledni) }
}

/** První a poslední den roku zadaného jako „2026". */
export function rozsahRoku(rok: string): { od: string; do: string } {
  return { od: `${rok}-01-01`, do: `${rok}-12-31` }
}

/** Měsíc posunutý o n měsíců, ze „2026-08" na „2026-07". */
export function posunMesic(mesic: string, n: number): string {
  const rok = Number(mesic.slice(0, 4))
  const m = Number(mesic.slice(5, 7))
  const d = new Date(Date.UTC(rok, m - 1 + n, 1))
  return naISO(d).slice(0, 7)
}

/** Všech dvanáct měsíců roku jako klíče. */
export function mesiceRoku(rok: string): string[] {
  return Array.from({ length: 12 }, (_, i) => `${rok}-${String(i + 1).padStart(2, "0")}`)
}

// ─────────────────────────────────────────────────────────────────────────────
// Popisky
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Zkratky dnů v týdnu od pondělí.
 *
 * Vypisují se ručně, ne přes toLocaleDateString: ten závisí na tom, jaká
 * jazyková data má prohlížeč po ruce, takže by se plánovač na dvou zařízeních
 * vykreslil různě. U mřížky, kde se šířka sloupce počítá na pixely, je to
 * zbytečné riziko.
 */
export const ZKRATKY_DNU: Record<Lang, string[]> = {
  cs: ["PO", "ÚT", "ST", "ČT", "PÁ", "SO", "NE"],
  en: ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"],
  sk: ["PO", "UT", "ST", "ŠT", "PI", "SO", "NE"],
}

/** Plné názvy dnů v týdnu od pondělí. */
export const NAZVY_DNU: Record<Lang, string[]> = {
  cs: ["pondělí", "úterý", "středa", "čtvrtek", "pátek", "sobota", "neděle"],
  en: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
  sk: ["pondelok", "utorok", "streda", "štvrtok", "piatok", "sobota", "nedeľa"],
}

export const NAZVY_MESICU: Record<Lang, string[]> = {
  cs: [
    "leden", "únor", "březen", "duben", "květen", "červen",
    "červenec", "srpen", "září", "říjen", "listopad", "prosinec",
  ],
  en: [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ],
  sk: [
    "január", "február", "marec", "apríl", "máj", "jún",
    "júl", "august", "september", "október", "november", "december",
  ],
}

/** Datum jako „19. 8." (cs, sk) nebo „Aug 19" (en). */
export function kratkeDatum(datum: string, lang: Lang): string {
  const den = Number(datum.slice(8, 10))
  const mesic = Number(datum.slice(5, 7))
  if (lang === "en") return `${NAZVY_MESICU.en[mesic - 1].slice(0, 3)} ${den}`
  return `${den}. ${mesic}.`
}

/** Datum jako „19. srpna 2026" nebo „19 August 2026". */
export function dlouheDatum(datum: string, lang: Lang): string {
  const den = Number(datum.slice(8, 10))
  const mesic = Number(datum.slice(5, 7))
  const rok = datum.slice(0, 4)
  if (lang === "en") return `${den} ${NAZVY_MESICU.en[mesic - 1]} ${rok}`
  // Čeština i slovenština chtějí u data druhý pád: „19. srpna", ne „19. srpen".
  const druhyPad: Record<"cs" | "sk", string[]> = {
    cs: [
      "ledna", "února", "března", "dubna", "května", "června",
      "července", "srpna", "září", "října", "listopadu", "prosince",
    ],
    sk: [
      "januára", "februára", "marca", "apríla", "mája", "júna",
      "júla", "augusta", "septembra", "októbra", "novembra", "decembra",
    ],
  }
  return `${den}. ${druhyPad[lang][mesic - 1]} ${rok}`
}

/** Rozsah týdne, „17. 8. – 23. 8. 2026". */
export function popisRozsahuTydne(pondeliDatum: string, lang: Lang): string {
  const nedele = posun(pondeliDatum, 6)
  const rok = nedele.slice(0, 4)
  return `${kratkeDatum(pondeliDatum, lang)} – ${kratkeDatum(nedele, lang)} ${rok}`
}

/** Název měsíce s rokem, „srpen 2026". */
export function popisMesice(mesic: string, lang: Lang): string {
  const m = Number(mesic.slice(5, 7))
  return `${NAZVY_MESICU[lang][m - 1]} ${mesic.slice(0, 4)}`
}

/** Index dne v týdnu od pondělí, tedy 0 až 6. */
export function indexDne(datum: string): number {
  const d = zISO(datum).getUTCDay()
  return d === 0 ? 6 : d - 1
}

/** Je datum v budoucnosti proti zadanému dnešku? */
export function jeBudoucnost(datum: string, dnesniDatum: string): boolean {
  return datum > dnesniDatum
}
