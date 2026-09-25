import { reakceFormy, type Forma } from "./forma"
import {
  KONTEXT,
  POHODA,
  POHODA_HRANICE,
  POHODA_SKLESLOST,
  POHODA_UZKOST,
  SPANEK_BUDIK,
  SPANEK_CASY,
} from "./spolecne"

// Kontrola a úprava odpovědí ELITE Pro před uložením. Jen pro server.
//
// Stojí mimo Convex, aby se dala otestovat bez backendu. Do databáze jde
// jen to, co tady projde položku po položce.
//
// Duševní pohoda se NEUKLÁDÁ. Z odpovědí se spočítá jediná věc, jestli
// doporučit kontakt na odborníka, a samotné odpovědi se zahodí. Kouč tak
// nemůže vidět body ani odpovědi, ani kdyby si otevřel surová data.

export class ChybaOdeslani extends Error {}

export interface ZpracovaneOdpovedi {
  /** odpovědi k uložení, bez duševní pohody */
  ciste: Record<string, number>
  /** zodpovězené položky, kontroly a reakce formy */
  answeredCount: number
  /** zodpovězeno všechno z formy */
  complete: boolean
  /** doporučit kontakt na odborníka */
  doporuceni: boolean
}

function hodnota(x: unknown, min: number, max: number, id: number): number {
  if (typeof x !== "number" || !Number.isInteger(x) || x < min || x > max) {
    throw new ChybaOdeslani(`Neplatná odpověď u otázky ${id}.`)
  }
  return x
}

export function zpracujOdpovedi(forma: Forma, vstup: Record<string, unknown>): ZpracovaneOdpovedi {
  const vFormy = new Set([...forma.polozky, ...reakceFormy(forma)])
  const ciste: Record<string, number> = {}
  const pohoda: Record<number, number> = {}
  let answeredCount = 0

  for (const [klic, x] of Object.entries(vstup)) {
    const id = Number(klic)
    if (!Number.isInteger(id) || String(id) !== klic) throw new ChybaOdeslani("Neplatné číslo otázky.")
    if (vFormy.has(id)) {
      ciste[klic] = hodnota(x, 1, 5, id)
      answeredCount++
    } else if ((POHODA as readonly number[]).includes(id)) {
      pohoda[id] = hodnota(x, 0, 3, id)
    } else if (KONTEXT[id] !== undefined) {
      ciste[klic] = hodnota(x, 1, KONTEXT[id], id)
    } else if ((SPANEK_CASY as readonly number[]).includes(id)) {
      ciste[klic] = hodnota(x, 0, 1439, id)
    } else if (id === SPANEK_BUDIK) {
      ciste[klic] = hodnota(x, 1, 2, id)
    } else {
      // Otázka, kterou sportovec nedostal. Nejde o překlep v datech, ale
      // o pokus poslat něco jiného, než co forma obsahuje.
      throw new ChybaOdeslani(`Otázka ${id} do tohoto dotazníku nepatří.`)
    }
  }

  // Chybějící odpověď ve dvojici se počítá jako nula. Doporučení tak
  // vyjde i z neúplné dvojice, když už to, co sportovec vyplnil, dosáhne
  // hranice. U doporučení odborníka je planý poplach menší chyba než mlčení.
  const soucet = (ids: readonly number[]) => ids.reduce((a, i) => a + (pohoda[i] ?? 0), 0)
  const doporuceni =
    soucet(POHODA_UZKOST) >= POHODA_HRANICE || soucet(POHODA_SKLESLOST) >= POHODA_HRANICE

  return { ciste, answeredCount, complete: answeredCount === vFormy.size, doporuceni }
}
