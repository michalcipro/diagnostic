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


/**
 * Volba sdílení na konci dotazníku.
 *
 * Znění je schválně opatrné v tom, co slibuje. Kouč rozdával štítky, takže ví,
 * že Player 7 je konkrétní člověk, a když od něj vyhodnocení nedorazí, dovtípí
 * se to. Slíbit hráči, že se kouč nic nedozví, by byl slib, který neudržíme;
 * proto se říká přesně to, co platí: kouč uvidí, že jsi vyplnil, ne co ti vyšlo.
 *
 * Věta o týmovém profilu tam patří taky. Odpovědi do něj vstupují i při
 * odmítnutí sdílení, a kdyby to hráč zjistil až potom, byl by to skrytý sběr.
 */
export const SOUHLAS: Record<"cs" | "en", {
  nadpis: string
  volba: string
  vysvetleni: string
  jmenoNadpis: string
  jmenoPopis: string
}> = {
  cs: {
    nadpis: "Než odešleš",
    volba: "Nechci své vyhodnocení sdílet s koučem",
    vysvetleni:
      "Kouč uvidí, že jsi dotazník vyplnil{|a}, ale neuvidí tvoje odpovědi ani " +
      "vyhodnocení. Tvoje odpovědi se anonymně započítají do profilu celého týmu " +
      "tak jako tak. Své vyhodnocení uvidíš hned po odeslání a můžeš si ho stáhnout.",
    jmenoNadpis: "Jak tě má kouč vidět",
    jmenoPopis:
      "Můžeš nechat označení, které ti kouč dal, nebo místo něj napsat svoje jméno. " +
      "Nás v obou případech nezajímá, kdo jsi.",
  },
  en: {
    nadpis: "Before you submit",
    volba: "I do not want to share my results with my coach",
    vysvetleni:
      "Your coach will see that you completed the survey, but not your answers or " +
      "your results. Your answers count towards the profile of the whole team either " +
      "way. You will see your own results right after submitting and can download them.",
    jmenoNadpis: "How your coach sees you",
    jmenoPopis:
      "You can keep the label your coach gave you, or write your own name instead. " +
      "Either way, we do not need to know who you are.",
  },
}
