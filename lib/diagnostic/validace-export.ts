import { POLOZKY_HODNOCENI } from "./hodnoceni-trenera"

// Podklad pro ověření validity: odpovědi z testu spárované s hodnocením
// trenéra, bez jmen a bez identifikátorů z databáze.
//
// Stojí to mimo Convex, aby se dala anonymizace otestovat bez běžícího
// backendu. Na tom, jestli je opravdu anonymní, záleží víc než na čemkoli
// jiném v exportu.
//
// CO V EXPORTU NENÍ, A PROČ
//   jméno, datum narození, id výsledku, id kouče – přímá identifikace
//   přesná data – spolu s rolí a pásmem věku by šla spárovat s člověkem
// CO V NĚM JE
//   pseudonym sportovce platný jen v rámci jednoho exportu; hodnocení téhož
//   sportovce mají stejný pseudonym, aby šla spočítat shoda v čase, ale
//   pseudonym z jednoho exportu nejde spojit s jiným exportem
//   pětileté pásmo narození, rod, role (disciplína a úroveň, nejvýš 120
//   znaků), jazyk, odpovědi, doba vyplňování, čtvrtletí vyplnění a hodnocení
//   a odstup ve dnech
//
// Čtvrtletí, ne měsíc, ze stejného důvodu jako u normativního vzorku:
// „pásmo narození + disciplína + měsíc“ je u malého vzorku skoro
// identifikátor. Odstup ve dnech je relativní a k datu ho bez dalšího
// údaje přiřadit nejde; pro ověření predikce je přitom nezbytný.

export interface VysledekProExport {
  id: string
  testId: string
  lang: string
  answers: string
  birthDate?: string
  gender?: string
  role?: string
  durationSec?: number
  createdAt: number
}

export interface HodnoceniProExport {
  resultId: string
  hodnoty: { id: string; hodnota?: number }[]
  delkaVedeni: string
  castostPozorovani: string
  createdAt: number
}

export interface RadekValidace {
  sportovec: string
  testId: string
  lang: string
  ageBand?: string
  gender?: string
  role?: string
  answers: string
  durationSec?: number
  vyplnenoCtvrtleti: string
  hodnocenoCtvrtleti: string
  odstupDni: number
  delkaVedeni: string
  castostPozorovani: string
  hodnoty: Record<string, number | null>
}

const DEN = 24 * 60 * 60 * 1000

/** Pětileté pásmo narození, stejně jako v normativním vzorku. */
export function pasmoNarozeni(birthDate?: string): string | undefined {
  const m = birthDate?.match(/^(\d{4})/)
  if (!m) return undefined
  const rok = Number(m[1])
  if (rok < 1900 || rok > 2100) return undefined
  const zacatek = Math.floor(rok / 5) * 5
  return `${zacatek}-${zacatek + 4}`
}

/** Čtvrtletí, „2026-Q3“. */
function ctvrtleti(ms: number): string {
  const d = new Date(ms)
  return `${d.getUTCFullYear()}-Q${Math.floor(d.getUTCMonth() / 3) + 1}`
}

/** Role zkrácená jako v normativním vzorku. */
function kratkaRole(role?: string): string | undefined {
  const t = role?.trim()
  return t ? t.slice(0, 120) : undefined
}

/**
 * Sestaví řádky exportu.
 *
 * Pořadí řádků i pseudonymů vychází z náhodného zamíchání, ne z pořadí
 * v databázi: jinak by pseudonym S001 byl vždycky nejstarší sportovec a
 * pořadí by samo něco prozrazovalo. Zdroj náhody jde podstrčit kvůli testům.
 */
export function sestavExportValidace(
  vysledky: VysledekProExport[],
  hodnoceni: HodnoceniProExport[],
  nahoda: () => number = Math.random,
): RadekValidace[] {
  const podleId = new Map(vysledky.map((v) => [v.id, v]))
  const pouzite = hodnoceni.filter((h) => podleId.has(h.resultId))

  // Pseudonymy po zamíchání sportovců.
  const idSportovcu = [...new Set(pouzite.map((h) => h.resultId))]
  for (let i = idSportovcu.length - 1; i > 0; i--) {
    const j = Math.floor(nahoda() * (i + 1))
    ;[idSportovcu[i], idSportovcu[j]] = [idSportovcu[j], idSportovcu[i]]
  }
  const sirka = Math.max(3, String(idSportovcu.length).length)
  const pseudonym = new Map(idSportovcu.map((id, i) => [id, `S${String(i + 1).padStart(sirka, "0")}`]))

  const radky = pouzite.map((h) => {
    const v = podleId.get(h.resultId)!
    const hodnoty: Record<string, number | null> = {}
    for (const p of POLOZKY_HODNOCENI) {
      const x = h.hodnoty.find((z) => z.id === p)?.hodnota
      hodnoty[p] = typeof x === "number" ? x : null
    }
    return {
      sportovec: pseudonym.get(h.resultId)!,
      testId: v.testId,
      lang: v.lang,
      ageBand: pasmoNarozeni(v.birthDate),
      gender: v.gender,
      role: kratkaRole(v.role),
      answers: v.answers,
      durationSec: v.durationSec,
      vyplnenoCtvrtleti: ctvrtleti(v.createdAt),
      hodnocenoCtvrtleti: ctvrtleti(h.createdAt),
      odstupDni: Math.round((h.createdAt - v.createdAt) / DEN),
      delkaVedeni: h.delkaVedeni,
      castostPozorovani: h.castostPozorovani,
      hodnoty,
    }
  })

  // Řádky seřazené podle pseudonymu a odstupu, ne podle pořadí v databázi.
  return radky.sort((a, b) =>
    a.sportovec === b.sportovec ? a.odstupDni - b.odstupDni : a.sportovec.localeCompare(b.sportovec),
  )
}
