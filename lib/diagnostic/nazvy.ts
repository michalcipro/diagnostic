import { TEST_NAMES } from "./i18n"
import type { Lang, TestId } from "./types"

// Jak se test jmenuje podle toho, kdo se dívá.
//
// V týmové větvi se ELITE 200 jmenuje Players Survey a slovo diagnostika ani
// diagnostic se hráči a klubovému kouči nikde neukáže. Není to kosmetika:
// v klubovém prostředí zní „diagnostika" jako něco, co se dělá s pacientem,
// a hráč, který má dojem, že ho někdo vyšetřuje, odpovídá jinak než hráč,
// který vyplňuje dotazník o sobě. Zkreslilo by to výsledek, ne jen dojem.
//
// Název je stejný česky i anglicky, protože je to název produktu, ne popis.

/** Jak se v týmové větvi jmenuje jediný test, který se tam zadává. */
export const NAZEV_TYMOVEHO_TESTU = "Players Survey"

/**
 * Název testu pro danou stranu.
 *
 * `tymova` zapne klubové názvosloví. Mimo týmovou větev se nic nemění,
 * ELITE si své jméno nechává.
 */
export function nazevTestu(testId: TestId, lang: Lang, tymova = false): string {
  if (tymova) return NAZEV_TYMOVEHO_TESTU
  return TEST_NAMES[testId][lang]
}

/** Jazyky, ze kterých si hráč v týmové větvi vybírá. Slovenština se nenabízí. */
export const JAZYKY_TYMU: Lang[] = ["cs", "en"]
