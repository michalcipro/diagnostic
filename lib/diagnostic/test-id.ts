import type { TestId, TestModel, Variant } from "./types"
import type { Varianta as VariantaVzorcu } from "../vzorce/types"
import type { Varianta as VariantaArchetypu } from "../archetypy/types"

// Rozpoznání testu podle jeho id a počty položek.
//
// Vlastní soubor, ne součást structure.ts, kvůli tomu, co si import přitáhne.
// Dotazník potřebuje vědět jen tohle: který test to je, kolik má položek
// a jakou škálu. Ve structure.ts jsou vedle toho vyhodnocovací klíče, tedy
// mapování položek na fazety, obrácené položky, čísla kontrol pozornosti,
// dvojice na konzistenci a hranice pásem. To všechno si respondent stahoval
// spolu s dotazníkem a stačilo otevřít zdroj stránky. Kdo zná čísla kontrol
// a dvojic, projde kontrolami platnosti, jak se mu zachce.
//
// Odtud se proto nesmí sáhnout do structure.ts ani do scoring.ts. Hlídá to
// scripts/audit-balicku.cjs.

export const TEST_IDS: TestId[] = [
  "elite200-sport",
  "elite200-business",
  "elite100-sport",
  "elite100-business",
  "vzorce",
  "vzorce-sport-individual",
  "vzorce-sport-tym",
  "archetypy",
  "archetypy-sport",
]

export function jeVzorce(testId: string): boolean {
  return testId.startsWith("vzorce")
}

export function jeArchetypy(testId: string): boolean {
  return testId.startsWith("archetypy")
}

export function variantaArchetypu(testId: string): VariantaArchetypu {
  return testId === "archetypy-sport" ? "sport" : "business"
}

export function variantaVzorcu(testId: string): VariantaVzorcu {
  if (testId === "vzorce-sport-individual") return "sport-individual"
  if (testId === "vzorce-sport" || testId === "vzorce-sport-tym") return "sport-tym"
  return "obecna"
}

export function parseTestId(testId: string): { model: TestModel; variant: Variant } | null {
  const m = testId.match(/^(elite200|elite100)-(sport|business)$/)
  if (!m) return null
  return { model: m[1] as TestModel, variant: m[2] as Variant }
}

/**
 * Kolik má který test položek.
 *
 * Opsané číslo se může rozejít se skutečností, proto se shoda s klíči ověřuje
 * v scripts/audit-balicku.cjs. Lepší jedna kontrola navíc než celý klíč
 * v prohlížeči respondenta.
 */
export const POCET_POLOZEK: Record<TestId, number> = {
  "elite200-sport": 200,
  "elite200-business": 200,
  "elite100-sport": 100,
  "elite100-business": 100,
  vzorce: 110,
  "vzorce-sport": 110,
  "vzorce-sport-individual": 110,
  "vzorce-sport-tym": 110,
  archetypy: 96,
  "archetypy-sport": 96,
}
