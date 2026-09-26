import {
  DASS,
  POCET_IPIP,
  POHODA,
  POHODA_HRANICE,
  POHODA_SKLESLOST,
  POHODA_UZKOST,
  SPANEK,
  VELIKOST,
} from "./spolecne"
import { KONTEXT } from "../elitepro/spolecne"

// Kontrola odpovědí Profilu 360 před uložením. Jen pro server.
//
// Do databáze jde jen to, co projde otázku po otázce. Odpovědi na duševní
// pohodu (PHQ-4) se neukládají: spočítá se z nich jediný příznak, jestli
// doporučit kontakt na odborníka, a zahodí se.

export class ChybaOdeslani extends Error {}

export interface Zpracovano {
  ciste: Record<string, number>
  answeredCount: number
  complete: boolean
  doporuceni: boolean
}

function hodnota(x: unknown, min: number, max: number, id: number): number {
  if (typeof x !== "number" || !Number.isInteger(x) || x < min || x > max) {
    throw new ChybaOdeslani(`Neplatná odpověď u otázky ${id}.`)
  }
  return x
}

export function zpracujOdpovedi(vstup: Record<string, unknown>): Zpracovano {
  const ciste: Record<string, number> = {}
  const pohoda: Record<number, number> = {}
  let answeredCount = 0
  for (const [klic, x] of Object.entries(vstup)) {
    const id = Number(klic)
    if (!Number.isInteger(id) || String(id) !== klic) throw new ChybaOdeslani("Neplatné číslo otázky.")
    if (id >= 1 && id <= POCET_IPIP) {
      ciste[klic] = hodnota(x, 1, 5, id)
      answeredCount++
    } else if ((DASS as readonly number[]).includes(id)) {
      ciste[klic] = hodnota(x, 0, 3, id)
      answeredCount++
    } else if ((SPANEK.casy as readonly number[]).includes(id)) {
      ciste[klic] = hodnota(x, 0, 1439, id)
      answeredCount++
    } else if (id === SPANEK.budik) {
      ciste[klic] = hodnota(x, 1, 2, id)
      answeredCount++
    } else if (KONTEXT[id] !== undefined) {
      // Kontext o sportu: do úplnosti se nepočítá, slouží normám a výkladu.
      ciste[klic] = hodnota(x, 1, KONTEXT[id], id)
    } else if ((POHODA as readonly number[]).includes(id)) {
      pohoda[id] = hodnota(x, 0, 3, id)
    } else {
      throw new ChybaOdeslani(`Otázka ${id} do tohoto dotazníku nepatří.`)
    }
  }
  // Chybějící odpověď ve dvojici se počítá jako nula: u doporučení odborníka
  // je planý poplach menší chyba než mlčení.
  const soucet = (ids: readonly number[]) => ids.reduce((a, i) => a + (pohoda[i] ?? 0), 0)
  const doporuceni = soucet(POHODA_UZKOST) >= POHODA_HRANICE || soucet(POHODA_SKLESLOST) >= POHODA_HRANICE
  return { ciste, answeredCount, complete: answeredCount === VELIKOST, doporuceni }
}
