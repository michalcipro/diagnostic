import { SCALE_LABELS, SCALE_LABELS_6 } from "./i18n"
import { POCET_POLOZEK, jeArchetypy, jeVzorce, variantaArchetypu } from "./test-id"
import { INSTRUKCE_ARCHETYPY, SKALA_ARCHETYPY } from "../archetypy/i18n"
import type { Answer, Lang, TestId } from "./types"

// Společné údaje o testu na jednom místě.
//
// Aplikace obsluhuje dvě rodiny testů s různým počtem položek i různou škálou.
// Aby se to nemuselo větvit v každé komponentě, ptají se všechny sem.
//
// Čte se odsud i při vyplňování, takže se tu nesmí sáhnout do structure.ts
// ani do scoring.ts: s nimi by si respondent stáhl i vyhodnocovací klíče.

export interface TestMeta {
  /** kolik má test položek */
  pocetPolozek: number
  /** nejvyšší hodnota na škále: ELITE 5, vzorce 6 */
  maxOdpoved: 5 | 6
  /** popisky škály pro daný jazyk */
  popiskySkaly: (lang: Lang) => Record<number, string>
  /** hodnoty škály v pořadí, jak se vykreslují */
  hodnoty: Answer[]
  /** vlastní instrukce k vyplnění; ELITE je nemá a použije se výchozí text */
  instrukceProJazyk?: (lang: Lang) => string[]
}

const INSTRUKCE_VZORCE: Record<Lang, string[]> = {
  cs: [
    "U každého tvrzení označ číslo od 1 do 6 podle toho, do jaké míry pro tebe dané tvrzení platí.",
    "Vyplňuj rychle a pravdivě, bez potřeby působit lépe, silněji nebo vyrovnaněji.",
    "Neodpovídej podle toho, {jaký|jaká} bys {chtěl|chtěla} být. Odpovídej podle toho, co se v tobě skutečně děje, když jsi pod tlakem.",
    "Škála nemá střed. To je záměr: u každého tvrzení se přikloň na jednu stranu.",
    "Odpovědi se průběžně ukládají v tomto zařízení. Můžeš si dát pauzu a vrátit se později.",
    "Výsledek není diagnóza ani nálepka. Je to mapa pro rozhovor s koučem.",
  ],
  en: [
    "For each statement pick a number from 1 to 6 according to how far it applies to you.",
    "Answer quickly and truthfully, without needing to look better, stronger or more settled.",
    "Do not answer as the person you would like to be. Answer according to what actually happens inside you under pressure.",
    "The scale has no midpoint. That is deliberate: on every statement, lean one way or the other.",
    "Your answers are saved on this device as you go. You can take a break and come back later.",
    "The result is not a diagnosis or a label. It is a map for the conversation with your coach.",
  ],
  sk: [
    "Pri každom tvrdení označ číslo od 1 do 6 podľa toho, do akej miery pre teba dané tvrdenie platí.",
    "Vypĺňaj rýchlo a pravdivo, bez potreby pôsobiť lepšie, silnejšie alebo vyrovnanejšie.",
    "Neodpovedaj podľa toho, {aký|aká} by si {chcel|chcela} byť. Odpovedaj podľa toho, čo sa v tebe naozaj deje, keď si pod tlakom.",
    "Škála nemá stred. Je to zámer: pri každom tvrdení sa prikloň na jednu stranu.",
    "Odpovede sa priebežne ukladajú v tomto zariadení. Môžeš si dať pauzu a vrátiť sa neskôr.",
    "Výsledok nie je diagnóza ani nálepka. Je to mapa pre rozhovor s koučom.",
  ],
}

export function testMeta(testId: TestId): TestMeta {
  if (jeArchetypy(testId)) {
    return {
      pocetPolozek: POCET_POLOZEK[testId],
      maxOdpoved: 6,
      popiskySkaly: (lang) => SKALA_ARCHETYPY[lang],
      hodnoty: [1, 2, 3, 4, 5, 6],
      instrukceProJazyk: (lang: Lang) => INSTRUKCE_ARCHETYPY[variantaArchetypu(testId)][lang],
    }
  }
  if (jeVzorce(testId)) {
    return {
      pocetPolozek: POCET_POLOZEK[testId],
      maxOdpoved: 6,
      popiskySkaly: (lang) => SCALE_LABELS_6[lang],
      hodnoty: [1, 2, 3, 4, 5, 6],
      instrukceProJazyk: (lang: Lang) => INSTRUKCE_VZORCE[lang],
    }
  }
  return {
    pocetPolozek: POCET_POLOZEK[testId],
    maxOdpoved: 5,
    popiskySkaly: (lang) => SCALE_LABELS[lang],
    hodnoty: [1, 2, 3, 4, 5],
  }
}
