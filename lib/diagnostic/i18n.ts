import type { BandKey, Lang, TestId, Variant } from "./types"

// UI texty diagnostiky — CZ/EN

export const SCALE_LABELS: Record<Lang, Record<1 | 2 | 3 | 4 | 5, string>> = {
  cs: {
    1: "Rozhodně nesouhlasím",
    2: "Spíše nesouhlasím",
    3: "Ani souhlas, ani nesouhlas",
    4: "Spíše souhlasím",
    5: "Rozhodně souhlasím",
  },
  en: {
    1: "Strongly disagree",
    2: "Somewhat disagree",
    3: "Neither agree nor disagree",
    4: "Somewhat agree",
    5: "Strongly agree",
  },
}

export const BAND_LABELS: Record<Lang, Record<BandKey, string>> = {
  cs: {
    priority: "Rozvojová priorita",
    stabilization: "Stabilizace",
    strong: "Silná oblast",
    elite: "Elitní úroveň",
  },
  en: {
    priority: "Development priority",
    stabilization: "Stabilisation",
    strong: "Strong area",
    elite: "Elite level",
  },
}

export const BAND_DESCRIPTIONS: Record<Lang, Record<BandKey, string>> = {
  cs: {
    priority: "Oblast systematicky limituje výkon — patří do rozvojového plánu jako první.",
    stabilization: "Dovednost existuje, ale pod tlakem není spolehlivá. Cílem je konzistence.",
    strong: "Funguje i pod tlakem. Udržuj a využívej jako opěrný bod profilu.",
    elite: "Konkurenční výhoda. Stavěj na ní identitu a strategii.",
  },
  en: {
    priority: "This area systematically limits performance — it belongs first in the development plan.",
    stabilization: "The skill exists but is not reliable under pressure. The goal is consistency.",
    strong: "Works even under pressure. Maintain it and use it as an anchor of your profile.",
    elite: "A competitive advantage. Build your identity and strategy on it.",
  },
}

export const TEST_NAMES: Record<TestId, Record<Lang, string>> = {
  "elite200-sport": {
    cs: "Performance Diagnostic ELITE 200™",
    en: "Performance Diagnostic ELITE 200™",
  },
  "elite200-business": {
    cs: "Performance Diagnostic ELITE 200™ · Business a Life",
    en: "Performance Diagnostic ELITE 200™ · Business & Life",
  },
  "elite100-sport": {
    cs: "Performance Diagnostic ELITE 100™",
    en: "Performance Diagnostic ELITE 100™",
  },
  "elite100-business": {
    cs: "Performance Diagnostic ELITE 100™ · Business a Life",
    en: "Performance Diagnostic ELITE 100™ · Business & Life",
  },
}

export const VARIANT_LABELS: Record<Variant, Record<Lang, string>> = {
  sport: { cs: "Sport", en: "Sport" },
  business: { cs: "Business a Life", en: "Business & Life" },
}

export interface UIStrings {
  brand: string
  confidential: string
  // výběr testu
  chooseTitle: string
  chooseSubtitle: string
  itemsCount: (n: number) => string
  duration200: string
  duration100: string
  facets200: string
  dims100: string
  start: string
  continueTest: string
  language: string
  // identifikace
  identityTitle: string
  nameLabel: string
  namePlaceholder: string
  birthLabel: string
  roleLabelSport: string
  roleLabelBusiness: string
  rolePlaceholderSport: string
  rolePlaceholderBusiness: string
  dateLabel: string
  // instrukce
  howToTitle: string
  howTo: string[]
  beginButton: string
  // vyplňování
  progressAnswered: (a: number, t: number) => string
  blockLabel: (from: number, to: number) => string
  next: string
  back: string
  finish: string
  missingAnswers: (n: number) => string
  jumpToFirstMissing: string
  autosaveNote: string
  // report
  reportTitle: string
  reportSubtitle: string
  profileOverview: string
  validityTitle: string
  validityOkNote: string
  validityCautionNote: string
  validityInvalidNote: string
  validityAttention: string
  validityInfrequency: string
  validityConsistency: string
  validityHonesty: string
  validityStyle: string
  validityStatusOk: string
  validityStatusCaution: string
  validityStatusInvalid: string
  strengthsTitle: string
  prioritiesTitle: string
  developmentTitle: string
  developmentIntro: string
  heterogeneityNote: string
  imbalanceNote: string
  dimensionsTitle: string
  facetProfile: string
  score: string
  band: string
  retestNote: string
  disclaimer: string
  printButton: string
  backToTest: string
  newTest: string
  personLabel: string
  filledLabel: string
  incompleteWarning: (a: number, t: number) => string
  notFound: string
  goHome: string
  // sdílení přímého odkazu na jeden konkrétní test
  copyLink: string
  copiedLink: string
  shareTitle: string
  shareHint: string
}

export const UI: Record<Lang, UIStrings> = {
  cs: {
    brand: "WINNING MINDS",
    confidential: "Winning Minds s.r.o. · Praha 6 · winningminds.cz · Důvěrný dokument",
    chooseTitle: "Performance Diagnostic ELITE™",
    chooseSubtitle: "Komplexní psychodiagnostika mentálního výkonového profilu.",
    itemsCount: (n) => `${n} položek`,
    duration200: "45–60 minut",
    duration100: "20–30 minut",
    facets200: "7 dimenzí · 21 fazet · čtyřvrstvá kontrola validity",
    dims100: "7 dimenzí · kontrola validity odpovědí",
    start: "Spustit diagnostiku",
    continueTest: "Pokračovat ve vyplňování",
    language: "Jazyk",
    identityTitle: "Identifikační údaje",
    nameLabel: "Jméno a příjmení",
    namePlaceholder: "Jan Novák",
    birthLabel: "Datum narození",
    roleLabelSport: "Sportovní disciplína a úroveň",
    roleLabelBusiness: "Role / oblast působení",
    rolePlaceholderSport: "např. tenis, extraliga juniorů",
    rolePlaceholderBusiness: "např. jednatel, technologická firma",
    dateLabel: "Datum vyplnění",
    howToTitle: "Jak odpovídat",
    howTo: [
      "U každého tvrzení zvol jedno číslo od 1 do 5 podle toho, jak přesně tě tvrzení vystihuje v posledních třech měsících.",
      "Odpovídej podle toho, jaký skutečně jsi, ne podle toho, jaký bys chtěl být. Neexistují správné ani špatné odpovědi — dotazník obsahuje kontrolní mechanismy, které rozpoznají stylizaci i nepozorné čtení.",
      "Odpovídej svižně. První reakce bývá nejpřesnější, u žádné položky se nezdržuj déle než 20 sekund.",
      "Některá tvrzení se mohou zdát podobná — to je záměr, odpovídej na každé samostatně.",
      "Odpovědi se průběžně ukládají v tomto zařízení. Můžeš si dát pauzu a vrátit se později.",
      "Výsledky jsou důvěrné a slouží výhradně pro tvůj rozvoj v rámci spolupráce s Winning Minds.",
    ],
    beginButton: "Začít vyplňovat",
    progressAnswered: (a, t) => `Zodpovězeno ${a} z ${t}`,
    blockLabel: (from, to) => `Položky ${from}–${to}`,
    next: "Pokračovat",
    back: "Zpět",
    finish: "Dokončit a vyhodnotit",
    missingAnswers: (n) => `Zbývá zodpovědět ${n} ${n === 1 ? "položku" : n <= 4 ? "položky" : "položek"}.`,
    jumpToFirstMissing: "Přejít na první nezodpovězenou",
    autosaveNote: "Odpovědi se ukládají automaticky.",
    reportTitle: "Vyhodnocení",
    reportSubtitle: "Individuální mentální výkonový profil",
    profileOverview: "Profil v přehledu",
    validityTitle: "Kontrola validity odpovědí",
    validityOkNote: "Všechny kontrolní mechanismy proběhly v pořádku. Profil lze interpretovat standardně.",
    validityCautionNote:
      "Některé kontrolní ukazatele doporučují opatrnost při interpretaci. Projdi výsledky s koučem a ověř je na konkrétních situacích.",
    validityInvalidNote:
      "Kontrola validity ukazuje, že administrace pravděpodobně není spolehlivá. Profil neinterpretuj jako diagnostiku — doporučujeme dotazník po čase zopakovat v klidnějším rozpoložení.",
    validityAttention: "Kontrola pozornosti",
    validityInfrequency: "Index infrekvence",
    validityConsistency: "Index konzistence",
    validityHonesty: "Index upřímnosti",
    validityStyle: "Odpověďový styl",
    validityStatusOk: "v pořádku",
    validityStatusCaution: "opatrně",
    validityStatusInvalid: "neplatné",
    strengthsTitle: "Opěrné body profilu",
    prioritiesTitle: "Rozvojové priority",
    developmentTitle: "Doporučení pro rozvoj (8–12 týdnů)",
    developmentIntro:
      "Rozvojový plán stavíme na nejslabších oblastech profilu. Než začneš, ověř si každou oblast na konkrétních situacích z posledních týdnů.",
    heterogeneityNote:
      "Fazety této dimenze se výrazně liší — dimenzi nelze číst jako celek, pracuj s jednotlivými fazetami.",
    imbalanceNote: "Rozdíl mezi nejsilnější a nejslabší dimenzí je výrazný — profil je nevyvážený.",
    dimensionsTitle: "Dimenze profilu",
    facetProfile: "Fazetový profil",
    score: "Skór",
    band: "Pásmo",
    retestNote:
      "Retest doporučujeme po 12–16 týdnech cílené práce. Prakticky významná změna je 4 a více bodů na fazetě a 8 a více bodů na dimenzi (ELITE 200), resp. 5 a více bodů na dimenzi (ELITE 100).",
    disclaimer:
      "Toto vyhodnocení je podkladem pro rozvojovou práci s certifikovaným koučem Winning Minds. Není klinickou ani zdravotnickou diagnózou.",
    printButton: "Uložit jako PDF / tisk",
    backToTest: "Zpět na dotazník",
    newTest: "Nová diagnostika",
    personLabel: "Respondent",
    filledLabel: "Datum vyplnění",
    incompleteWarning: (a, t) => `Dotazník není kompletní (${a} z ${t}). Vyhodnocení je pouze orientační.`,
    notFound: "Vyhodnocení nebylo nalezeno. Nejdřív vyplň dotazník.",
    goHome: "Na úvodní stránku",
    copyLink: "Kopírovat odkaz",
    copiedLink: "Zkopírováno ✓",
    shareTitle: "Odkaz pro klienta",
    shareHint:
      "Zkopírovaný odkaz vede přímo na tento test ve zvoleném jazyce. Klient uvidí jen tento dotazník, žádnou nabídku dalších testů.",
  },
  en: {
    brand: "WINNING MINDS",
    confidential: "Winning Minds s.r.o. · Prague 6 · winningminds.cz · Confidential document",
    chooseTitle: "Performance Diagnostic ELITE™",
    chooseSubtitle: "Comprehensive psychodiagnostics of the mental performance profile.",
    itemsCount: (n) => `${n} items`,
    duration200: "45–60 minutes",
    duration100: "20–30 minutes",
    facets200: "7 dimensions · 21 facets · four-layer validity control",
    dims100: "7 dimensions · response validity control",
    start: "Start the diagnostic",
    continueTest: "Continue filling in",
    language: "Language",
    identityTitle: "Identification",
    nameLabel: "Full name",
    namePlaceholder: "Jane Smith",
    birthLabel: "Date of birth",
    roleLabelSport: "Sport discipline and level",
    roleLabelBusiness: "Role / field of work",
    rolePlaceholderSport: "e.g. tennis, junior national league",
    rolePlaceholderBusiness: "e.g. CEO, technology company",
    dateLabel: "Date of completion",
    howToTitle: "How to answer",
    howTo: [
      "For each statement choose one number from 1 to 5 according to how accurately it describes you over the last three months.",
      "Answer as you really are, not as you would like to be. There are no right or wrong answers — the questionnaire contains control mechanisms that detect idealised or careless responding.",
      "Answer briskly. Your first reaction is usually the most accurate; don't spend more than 20 seconds on any item.",
      "Some statements may feel similar — that is intentional. Answer each one independently.",
      "Your answers are saved automatically on this device. You can take a break and come back later.",
      "Results are confidential and serve exclusively your development within your work with Winning Minds.",
    ],
    beginButton: "Begin",
    progressAnswered: (a, t) => `Answered ${a} of ${t}`,
    blockLabel: (from, to) => `Items ${from}–${to}`,
    next: "Continue",
    back: "Back",
    finish: "Finish and evaluate",
    missingAnswers: (n) => `${n} item${n === 1 ? "" : "s"} left to answer.`,
    jumpToFirstMissing: "Jump to the first unanswered item",
    autosaveNote: "Answers are saved automatically.",
    reportTitle: "Evaluation",
    reportSubtitle: "Individual mental performance profile",
    profileOverview: "Profile at a glance",
    validityTitle: "Response validity control",
    validityOkNote: "All control mechanisms passed. The profile can be interpreted in the standard way.",
    validityCautionNote:
      "Some control indicators recommend caution. Go through the results with your coach and verify them against concrete situations.",
    validityInvalidNote:
      "Validity control shows the administration is probably not reliable. Do not interpret the profile as a diagnostic — we recommend repeating the questionnaire later in a calmer state.",
    validityAttention: "Attention check",
    validityInfrequency: "Infrequency index",
    validityConsistency: "Consistency index",
    validityHonesty: "Honesty index",
    validityStyle: "Response style",
    validityStatusOk: "OK",
    validityStatusCaution: "caution",
    validityStatusInvalid: "invalid",
    strengthsTitle: "Anchors of the profile",
    prioritiesTitle: "Development priorities",
    developmentTitle: "Development recommendations (8–12 weeks)",
    developmentIntro:
      "The development plan is built on the weakest areas of the profile. Before you start, verify each area against concrete situations from recent weeks.",
    heterogeneityNote:
      "The facets of this dimension differ substantially — do not read the dimension as a whole; work with the individual facets.",
    imbalanceNote: "The gap between the strongest and weakest dimension is substantial — the profile is unbalanced.",
    dimensionsTitle: "Profile dimensions",
    facetProfile: "Facet profile",
    score: "Score",
    band: "Band",
    retestNote:
      "We recommend a retest after 12–16 weeks of focused work. A practically meaningful change is 4+ points on a facet and 8+ points on a dimension (ELITE 200), or 5+ points on a dimension (ELITE 100).",
    disclaimer:
      "This evaluation is a basis for development work with a certified Winning Minds coach. It is not a clinical or medical diagnosis.",
    printButton: "Save as PDF / print",
    backToTest: "Back to the questionnaire",
    newTest: "New diagnostic",
    personLabel: "Respondent",
    filledLabel: "Completed on",
    incompleteWarning: (a, t) => `The questionnaire is incomplete (${a} of ${t}). The evaluation is indicative only.`,
    notFound: "No evaluation found. Please fill in the questionnaire first.",
    goHome: "Go to the start page",
    copyLink: "Copy link",
    copiedLink: "Copied ✓",
    shareTitle: "Link for the client",
    shareHint:
      "The copied link leads straight to this test in the chosen language. The client sees only this questionnaire — no menu of other tests.",
  },
}
