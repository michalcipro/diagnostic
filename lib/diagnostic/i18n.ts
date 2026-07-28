import type { BandKey, Lang, TestId, Variant } from "./types"

// UI texty diagnostiky — CZ/EN

/**
 * Desetinné číslo se správným oddělovačem — česky čárka, anglicky tečka.
 * Nepoužíváme toLocaleString: chceme, aby report vypadal stejně na serveru
 * i v prohlížeči a nezáviselo to na nastavení systému.
 */
export function fmtNum(value: number, lang: Lang, decimals = 1): string {
  const s = value.toFixed(decimals)
  return lang === "cs" ? s.replace(".", ",") : s
}

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
  validityPace: string
  validityStatusOk: string
  validityStatusCaution: string
  validityStatusInvalid: string
  /** dvě skupiny indexů: co ruší vyhodnocení a co jen barví interpretaci */
  validityHardTitle: string
  validitySoftTitle: string
  validitySoftNote: string
  /** index nelze spočítat kvůli chybějícím odpovědím */
  validityUnavailable: string
  paceValue: (secPerItem: number, totalMin: number) => string
  /** škála se nevykazuje, protože chybí příliš mnoho odpovědí */
  scaleNotReported: string
  scaleCoverage: (answered: number, total: number) => string
  proratedNote: string
  /** pořadí škál není srovnání s populací */
  normativeCaveat: string
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
  // obrazovka po odeslání (respondent výsledky nevidí)
  sentTitle: string
  sentBody: string
  sentSaveFailedTitle: string
  sentSaveFailedBody: string
  downloadBackup: string
  // chráněná sekce pro kouče
  coachTitle: string
  coachSubtitle: string
  coachPassword: string
  coachEnter: string
  coachWrongPassword: string
  coachNotConfigured: string
  coachLoading: string
  coachEmpty: string
  coachCount: (n: number) => string
  coachOpen: string
  coachBack: string
  coachLogout: string
  coachDelete: string
  coachDeleteConfirm: string
  colName: string
  colTest: string
  colDate: string
  colValidity: string
  // pozvánky
  invitesTitle: string
  newInvite: string
  inviteTest: string
  inviteLang: string
  inviteClient: string
  inviteClientPlaceholder: string
  inviteCreate: string
  inviteCreated: string
  inviteCopy: string
  inviteCopied: string
  invitePending: string
  inviteUsed: string
  inviteRevoke: string
  inviteRevokeConfirm: string
  invitesEmpty: string
  tabResults: string
  tabInvites: string
  // anonymní normativní vzorek
  tabNorms: string
  loading: string
  normsTitle: string
  normsIntro: string
  normsCount: (count: number, target: number) => string
  normsPrivacy: string
  normsExport: string
  normsExporting: string
  /** informace pro respondenta, co se s odpověďmi děje */
  dataNote: string
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
    validityPace: "Tempo vyplňování",
    validityStatusOk: "v pořádku",
    validityStatusCaution: "opatrně",
    validityStatusInvalid: "neplatné",
    validityHardTitle: "Zda odpovědi měří to, co měly",
    validitySoftTitle: "Jak o sobě respondent vypovídá",
    validitySoftNote:
      "Tyhle dva ukazatele vyhodnocení neruší — popisují, jakým způsobem člověk o sobě mluví. Ber je jako kontext k rozhovoru, ne jako chybu.",
    validityUnavailable: "nelze určit",
    paceValue: (s, min) => `${fmtNum(s, "cs")} s/položku · celkem ${min} min`,
    scaleNotReported: "nevykazuje se",
    scaleCoverage: (a, t) => `${a} z ${t} položek`,
    proratedNote:
      "U škál s chybějícími odpověďmi je skóre dopočítané z průměru zodpovězených položek. Škály, kde chybí víc než čtvrtina odpovědí, se nevykazují vůbec.",
    normativeCaveat:
      "Pořadí škál vychází z hrubých skóre, ne ze srovnání s populací — normy zatím nejsou k dispozici. Čti je jako „s těmito výroky souhlasil nejvíc“, ne jako „v tomhle je nadprůměrný“.",
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
    sentTitle: "Děkujeme, dotazník je odeslaný.",
    sentBody:
      "Tvoje odpovědi jsme v pořádku přijali. Vyhodnocení zpracuje certifikovaný kouč Winning Minds a projde ho s tebou osobně — výsledky se záměrně nezobrazují automaticky, protože jejich smysl dává až společná interpretace. Tuhle stránku teď můžeš zavřít.",
    sentSaveFailedTitle: "Odpovědi se nepodařilo odeslat",
    sentSaveFailedBody:
      "Zkontroluj připojení a zkus to prosím znovu. Aby se tvoje práce neztratila, ulož si prosím zálohu odpovědí tlačítkem níže a pošli soubor svému kouči.",
    downloadBackup: "Stáhnout zálohu odpovědí",
    coachTitle: "Přehled diagnostik",
    coachSubtitle: "Chráněná sekce pro certifikovaného kouče.",
    coachPassword: "Heslo",
    coachEnter: "Přihlásit se",
    coachWrongPassword: "Nesprávné heslo.",
    coachNotConfigured:
      "Ukládání výsledků zatím není nastavené. Doplň proměnnou NEXT_PUBLIC_CONVEX_URL a heslo COACH_PASSWORD.",
    coachLoading: "Načítám…",
    coachEmpty: "Zatím nikdo dotazník nevyplnil.",
    coachCount: (n) => `${n} ${n === 1 ? "vyplnění" : n <= 4 ? "vyplnění" : "vyplnění"}`,
    coachOpen: "Otevřít vyhodnocení",
    coachBack: "Zpět na přehled",
    coachLogout: "Odhlásit",
    coachDelete: "Smazat",
    coachDeleteConfirm: "Opravdu smazat toto vyplnění? Nelze vzít zpět.",
    colName: "Jméno",
    colTest: "Test",
    colDate: "Vyplněno",
    colValidity: "Validita",
    invitesTitle: "Pozvánky",
    newInvite: "Nová pozvánka",
    inviteTest: "Test",
    inviteLang: "Jazyk dotazníku",
    inviteClient: "Jméno klienta",
    inviteClientPlaceholder: "nepovinné — předvyplní se klientovi",
    inviteCreate: "Vytvořit odkaz",
    inviteCreated: "Odkaz je připravený — pošli ho klientovi:",
    inviteCopy: "Kopírovat odkaz",
    inviteCopied: "Zkopírováno ✓",
    invitePending: "Čeká na vyplnění",
    inviteUsed: "Vyplněno",
    inviteRevoke: "Zrušit",
    inviteRevokeConfirm: "Opravdu zrušit tuto pozvánku? Odkaz přestane fungovat.",
    invitesEmpty: "Zatím žádné pozvánky.",
    tabResults: "Vyplněné diagnostiky",
    tabInvites: "Pozvánky",
    tabNorms: "Normy",
    loading: "Načítám…",
    normsTitle: "Anonymní vzorek pro normy",
    normsIntro:
      "Z každého vyplnění se ukládá anonymní kopie odpovědí. Až se jich nasbírá dost, půjde spočítat percentily a reliabilitu — teprve pak bude možné říct, jestli je někdo nadprůměrný, a ne jen s čím souhlasil nejvíc.",
    normsCount: (c, cil) => `${c} z ${cil}`,
    normsPrivacy:
      "Ve vzorku není jméno, celé datum narození ani odkaz na konkrétní vyplnění — jen odpovědi, rok narození, povolání či disciplína a měsíc pořízení. Zpět ke konkrétnímu člověku se z něj dostat nedá.",
    normsExport: "Stáhnout data",
    normsExporting: "Připravuji…",
    dataNote:
      "Z tvých odpovědí se ukládá anonymní kopie, která slouží k dalšímu rozvoji metody. Není v ní tvoje jméno ani datum narození — pouze rok narození a obor či disciplína, takže tě z ní nelze identifikovat.",
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
    validityPace: "Completion pace",
    validityStatusOk: "OK",
    validityStatusCaution: "caution",
    validityStatusInvalid: "invalid",
    validityHardTitle: "Whether the answers measured what they should",
    validitySoftTitle: "How the respondent describes themselves",
    validitySoftNote:
      "These two indicators do not invalidate the evaluation — they describe the way the person talks about themselves. Treat them as context for the conversation, not as an error.",
    validityUnavailable: "cannot be determined",
    paceValue: (s, min) => `${fmtNum(s, "en")} s/item · ${min} min total`,
    scaleNotReported: "not reported",
    scaleCoverage: (a, t) => `${a} of ${t} items`,
    proratedNote:
      "For scales with missing answers the score is estimated from the mean of the answered items. Scales missing more than a quarter of their answers are not reported at all.",
    normativeCaveat:
      "The ranking of scales comes from raw scores, not from a comparison with a population — norms are not available yet. Read it as “agreed with these statements most”, not as “is above average in this”.",
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
    sentTitle: "Thank you — your questionnaire has been submitted.",
    sentBody:
      "We have received your answers. A certified Winning Minds coach will process the evaluation and go through it with you in person — results are deliberately not shown automatically, because they only make sense with a proper interpretation. You can close this page now.",
    sentSaveFailedTitle: "Your answers could not be submitted",
    sentSaveFailedBody:
      "Please check your connection and try again. So your work isn't lost, save a backup of your answers with the button below and send the file to your coach.",
    downloadBackup: "Download a backup of my answers",
    coachTitle: "Diagnostics overview",
    coachSubtitle: "Protected area for the certified coach.",
    coachPassword: "Password",
    coachEnter: "Sign in",
    coachWrongPassword: "Incorrect password.",
    coachNotConfigured:
      "Result storage is not configured yet. Set NEXT_PUBLIC_CONVEX_URL and the COACH_PASSWORD variable.",
    coachLoading: "Loading…",
    coachEmpty: "Nobody has completed a questionnaire yet.",
    coachCount: (n) => `${n} submission${n === 1 ? "" : "s"}`,
    coachOpen: "Open evaluation",
    coachBack: "Back to overview",
    coachLogout: "Sign out",
    coachDelete: "Delete",
    coachDeleteConfirm: "Really delete this submission? This cannot be undone.",
    colName: "Name",
    colTest: "Test",
    colDate: "Completed",
    colValidity: "Validity",
    invitesTitle: "Invitations",
    newInvite: "New invitation",
    inviteTest: "Test",
    inviteLang: "Questionnaire language",
    inviteClient: "Client name",
    inviteClientPlaceholder: "optional — pre-filled for the client",
    inviteCreate: "Create link",
    inviteCreated: "The link is ready — send it to your client:",
    inviteCopy: "Copy link",
    inviteCopied: "Copied ✓",
    invitePending: "Awaiting completion",
    inviteUsed: "Completed",
    inviteRevoke: "Revoke",
    inviteRevokeConfirm: "Really revoke this invitation? The link will stop working.",
    invitesEmpty: "No invitations yet.",
    tabResults: "Completed diagnostics",
    tabInvites: "Invitations",
    tabNorms: "Norms",
    loading: "Loading…",
    normsTitle: "Anonymous sample for norms",
    normsIntro:
      "An anonymous copy of the answers is stored for every completed questionnaire. Once enough have accumulated, percentiles and reliability can be computed — only then will it be possible to say that someone is above average, rather than only what they agreed with most.",
    normsCount: (c, cil) => `${c} of ${cil}`,
    normsPrivacy:
      "The sample contains no name, no full date of birth and no link to a specific submission — only the answers, year of birth, occupation or discipline, and the month of collection. It cannot be traced back to an individual.",
    normsExport: "Download data",
    normsExporting: "Preparing…",
    dataNote:
      "An anonymous copy of your answers is stored and used to develop the method further. It contains neither your name nor your date of birth — only your year of birth and your field or discipline, so you cannot be identified from it.",
  },
}
