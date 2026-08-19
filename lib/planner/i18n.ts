import type { Lang } from "@/lib/diagnostic/types"
import type { MetricKey, ReflectionKey } from "./types"

// Texty plánovače ve třech jazycích.
//
// Rodové tvary se zapisují značkou {mužský|ženský} a rozvíjí je applyGender().
// Angličtina rod neřeší, tam značka nikde není. Přítomný čas druhé osoby
// („zapisuješ", „máš") je rodově neutrální a značku nepotřebuje, proto je
// jich tu málo: většina textů je záměrně psaná tak, aby rod vůbec nevyvstal.

/** Desetinné číslo se správným oddělovačem, stejně jako v diagnostice. */
export function cislo(hodnota: number, lang: Lang, desetin = 1): string {
  const s = hodnota.toFixed(desetin)
  return lang === "en" ? s : s.replace(".", ",")
}

/**
 * Přečte číslo, které člověk napsal.
 *
 * Přijímá desetinnou čárku i tečku: Čech píše „7,5", česká klávesnice na
 * numerickém bloku dává čárku a prohlížeč by u pole typu number čárku zahodil.
 * Vrací null pro prázdný i nesmyslný vstup, aby volající rozlišil „smazáno"
 * od „napsal jsem něco divného".
 */
export function parsujCislo(raw: string): number | null {
  const t = raw.trim().replace(",", ".")
  if (!t) return null
  const n = Number(t)
  return Number.isFinite(n) ? n : null
}

/** Číslo se znaménkem, pro změny proti minulému období. */
export function zmenaText(hodnota: number, lang: Lang, desetin = 1): string {
  const s = cislo(Math.abs(hodnota), lang, desetin)
  if (Math.abs(hodnota) < 0.05) return "0"
  return `${hodnota > 0 ? "+" : "−"}${s}`
}

export const NAZVY_METRIK: Record<Lang, Record<MetricKey, string>> = {
  cs: {
    sleep: "Spánek (h)",
    energy: "Energie",
    focus: "Soustředění",
    mood: "Nálada",
    productivity: "Produktivita",
  },
  en: {
    sleep: "Sleep (h)",
    energy: "Energy",
    focus: "Focus",
    mood: "Mood",
    productivity: "Productivity",
  },
  sk: {
    sleep: "Spánok (h)",
    energy: "Energia",
    focus: "Sústredenie",
    mood: "Nálada",
    productivity: "Produktivita",
  },
}

export const NAZVY_REFLEXE: Record<Lang, Record<ReflectionKey, string>> = {
  cs: {
    grateful: "Za co jsem {vděčný|vděčná}",
    win: "Dnešní vítězství",
    improve: "Co zlepšit",
  },
  en: {
    grateful: "Grateful for",
    win: "Today's win",
    improve: "To improve",
  },
  sk: {
    grateful: "Za čo som {vďačný|vďačná}",
    win: "Dnešné víťazstvo",
    improve: "Čo zlepšiť",
  },
}

export interface PlannerUI {
  // Názvy sekcí se drží v přirozeném tvaru, ne verzálkami. Na obrazovce
  // je zvětší CSS, v PDF se sázejí tak, jak jsou, a sedí pak s nadpisy
  // přehledu i vyhodnocení diagnostiky.
  // hlavička
  appName: string
  weeklyPlan: string
  habitsProgress: string
  weekOf: string
  motto: string

  // sekce papírové předlohy
  weeklySchedule: string
  notesIdeas: string
  habitTracker: string
  dailyProgress: string
  dailyProgressHint: string
  dailyReflection: string

  // navigace
  tabTyden: string
  tabDen: string
  tabStatistiky: string
  tabNavyky: string
  tabUcet: string
  dnes: string
  predchozi: string
  dalsi: string
  tisk: string
  pdf: string
  tahniDoStrany: string

  // přihlášení
  prihlaseni: string
  email: string
  heslo: string
  prihlasit: string
  odhlasit: string
  prihlasuji: string
  chybnePrihlaseni: string
  bezPripojeni: string
  uvodniText: string

  // aktivace účtu
  aktivaceNadpis: string
  aktivacePodtitul: string
  noveHeslo: string
  noveHesloZnovu: string
  hesloNesouhlasi: string
  zalozitUcet: string
  aktivaceHotovo: string
  pozvankaNeplatna: string
  pozvankaPouzita: string
  pozvankaVyprsela: string

  // návyky
  navykyNadpis: string
  navykyPodtitul: string
  novyNavyk: string
  nazevNavyku: string
  cilTydne: string
  bezCile: string
  pridat: string
  ulozit: string
  zrusit: string
  prejmenovat: string
  archivovat: string
  obnovit: string
  smazat: string
  smazatPotvrzeni: string
  archivovane: string
  zadneNavyky: string
  navykuMaximum: string
  posunoutNahoru: string
  posunoutDolu: string

  // statistiky
  statTyden: string
  statMesic: string
  statRok: string
  statPrehled: string
  statDenniSkore: string
  statDenniSkoreVysvetleni: string
  statVyplnenychDnu: string
  statSerie: string
  statNejdelsiSerie: string
  statNavyky: string
  statUspesnost: string
  statSplneno: string
  statUkazatele: string
  statUkazatel: string
  statSerieKratce: string
  statSNavykem: string
  statBezNavyku: string
  statDnuSBez: string
  statPrumer: string
  statRozsah: string
  statZmena: string
  statProtiMinulemu: string
  statReflexe: string
  statNaplanovanychHodin: string
  statPodleDnu: string
  statPodleDnuVysvetleni: string
  statVyvoj: string
  statVliv: string
  statVlivVysvetleni: string
  statVlivRadek: string
  statMaloDat: string
  statZadnaData: string
  statNejlepsiDen: string
  statNejhorsiDen: string
  statShrnuti: string
  statShrnutiUvod: string
  dnu: string
  bodu: string
  hodin: string

  // účet
  ucetNadpis: string
  jmeno: string
  rod: string
  rodMuz: string
  rodZena: string
  jazyk: string
  zmenaHesla: string
  stavajiciHeslo: string
  ulozeno: string

  // co z deníku vidí kouč
  sdileniNadpis: string
  sdileniNic: string
  sdileniCisla: string
  sdileniVse: string
  sdileniNicPopis: string
  sdileniCislaPopis: string
  sdileniVsePopis: string
  sdileniKdo: string

  // dočasné heslo od kouče
  zmenHesloNadpis: string
  zmenHesloPopis: string
  zmenHesloHotovo: string

  // stav
  ukladam: string
  ulozenoAuto: string
  chybaUlozeni: string
  nacitam: string

  // kouč
  koucNadpis: string
  koucNovyKlient: string
  koucOdkaz: string
  koucZkopirovat: string
  koucZkopirovano: string
  koucKlienti: string
  koucPozvanky: string
  koucBezKlientu: string
  koucSoukromi: string
  koucPosledniZapis: string
  koucZablokovat: string
  koucOdblokovat: string
  koucCekaNaAktivaci: string
}

export const UI: Record<Lang, PlannerUI> = {
  cs: {
    appName: "Weekly Planner",
    weeklyPlan: "Týdenní plán",
    habitsProgress: "Návyky a postup",
    weekOf: "Týden",
    motto: "DISCIPLÍNA DNES, SVOBODA ZÍTRA.",

    weeklySchedule: "Týdenní rozvrh",
    notesIdeas: "Poznámky a nápady",
    habitTracker: "Tracker návyků",
    dailyProgress: "Denní postup",
    dailyProgressHint: "(hodnocení 1 až 10)",
    dailyReflection: "Denní reflexe",

    tabTyden: "Týden",
    tabDen: "Den",
    tabStatistiky: "Statistiky",
    tabNavyky: "Návyky",
    tabUcet: "Účet",
    dnes: "Dnes",
    predchozi: "Předchozí",
    dalsi: "Další",
    tisk: "Tisk",
    pdf: "Uložit PDF",
    tahniDoStrany: "táhni do strany",

    prihlaseni: "Přihlášení do deníku",
    email: "E-mail",
    heslo: "Heslo",
    prihlasit: "Přihlásit",
    odhlasit: "Odhlásit",
    prihlasuji: "Přihlašuji…",
    chybnePrihlaseni: "Nesprávný e-mail nebo heslo.",
    bezPripojeni: "Aplikace není připojená k serveru. Chybí NEXT_PUBLIC_CONVEX_URL.",
    uvodniText:
      "Týdenní plánovač Winning Minds. Přístup dostaneš od svého kouče, deník vidíš jen ty.",

    aktivaceNadpis: "Založení deníku",
    aktivacePodtitul: "Zvol si heslo, kterým se budeš do deníku přihlašovat.",
    noveHeslo: "Nové heslo",
    noveHesloZnovu: "Heslo znovu",
    hesloNesouhlasi: "Hesla se neshodují.",
    zalozitUcet: "Založit deník",
    aktivaceHotovo: "Hotovo. Přihlas se svým e-mailem a novým heslem.",
    pozvankaNeplatna: "Tenhle odkaz neplatí. Požádej kouče o nový.",
    pozvankaPouzita: "Odkaz už byl použitý. Přihlas se na /planner.",
    pozvankaVyprsela: "Odkaz vypršel. Požádej kouče o nový.",

    navykyNadpis: "Moje návyky",
    navykyPodtitul:
      "Návyky jsou jediná část plánovače, kterou si určuješ {sám|sama}. Zbytek deníku má pevnou stavbu.",
    novyNavyk: "Nový návyk",
    nazevNavyku: "Název návyku",
    cilTydne: "Cíl za týden",
    bezCile: "bez cíle",
    pridat: "Přidat",
    ulozit: "Uložit",
    zrusit: "Zrušit",
    prejmenovat: "Přejmenovat",
    archivovat: "Archivovat",
    obnovit: "Obnovit",
    smazat: "Smazat",
    smazatPotvrzeni:
      "Smazat návyk i se všemi odškrtnutými dny? Statistiky za minulá období se tím změní. Archivace historii zachová.",
    archivovane: "Archivované",
    zadneNavyky: "Zatím nemáš žádný návyk. Přidej si první.",
    navykuMaximum: "Víc než dvacet návyků najednou tracker neuhlídá.",
    posunoutNahoru: "Posunout nahoru",
    posunoutDolu: "Posunout dolů",

    statTyden: "Týden",
    statMesic: "Měsíc",
    statRok: "Rok",
    statPrehled: "Přehled",
    statDenniSkore: "Denní skóre",
    statDenniSkoreVysvetleni:
      "Průměr energie, soustředění, nálady a produktivity. Spánek se do něj nepočítá, protože je v hodinách.",
    statVyplnenychDnu: "Vyplněných dnů",
    statSerie: "Série v řadě",
    statNejdelsiSerie: "Nejdelší série",
    statNavyky: "Návyky",
    statUspesnost: "Úspěšnost",
    statSplneno: "Splněno",
    statUkazatele: "Denní ukazatele",
    statUkazatel: "Ukazatel",
    statSerieKratce: "Série",
    statSNavykem: "S návykem",
    statBezNavyku: "Bez návyku",
    statDnuSBez: "Dnů s / bez",
    statPrumer: "Průměr",
    statRozsah: "Rozsah",
    statZmena: "Změna",
    statProtiMinulemu: "proti minulému období",
    statReflexe: "Vyplněná reflexe",
    statNaplanovanychHodin: "Naplánovaných hodin",
    statPodleDnu: "Podle dnů v týdnu",
    statPodleDnuVysvetleni:
      "Kde se opakovaně propadáš, tam nejde o náhodu, ale o stavbu týdne.",
    statVyvoj: "Vývoj",
    statVliv: "Souvislosti",
    statVlivVysvetleni:
      "Porovnání dnů, kdy návyk splněný byl, se dny, kdy splněný nebyl. Není to důkaz příčiny: vztah může vést i obráceně, protože v dobrý den se návyk plní snáz.",
    statVlivRadek: "ve dnech s návykem",
    statMaloDat: "Na výpočet je zatím málo dnů.",
    statZadnaData: "Za tohle období nemáš nic zapsané.",
    statNejlepsiDen: "Nejsilnější den",
    statNejhorsiDen: "Nejslabší den",
    statShrnuti: "Co z toho plyne",
    statShrnutiUvod:
      "Několik vět k tomu, co za čísly výš stojí, na čem stavět a co řešit jako první.",
    dnu: "dnů",
    bodu: "bodů",
    hodin: "hodin",

    ucetNadpis: "Účet",
    jmeno: "Jméno",
    rod: "Oslovení",
    rodMuz: "mužský rod",
    rodZena: "ženský rod",
    jazyk: "Jazyk",
    zmenaHesla: "Změna hesla",
    stavajiciHeslo: "Stávající heslo",
    ulozeno: "Uloženo.",
    sdileniNadpis: "Co z deníku vidí tvůj kouč",
    sdileniNic: "Nic z obsahu",
    sdileniCisla: "Hodnocení a návyky",
    sdileniVse: "Celý deník",
    sdileniNicPopis:
      "Kouč vidí jen to, že si deník vedeš, a kdy jsi do něj naposledy {psal|psala}. Co je uvnitř, nevidí.",
    sdileniCislaPopis:
      "Kouč vidí tvoje hodnocení, odškrtnuté návyky a statistiky. Rozvrh dne, reflexi ani poznámky nevidí, ty zůstávají jenom tvoje.",
    sdileniVsePopis:
      "Kouč vidí celý deník včetně rozvrhu, reflexe a poznámek. Kdykoli se s ním můžeš domluvit na užším rozsahu.",
    sdileniKdo: "Nastavuje to kouč, ale vidíš to tady vždycky. Když ti to nesedí, řekni mu to.",

    zmenHesloNadpis: "Zvol si vlastní heslo",
    zmenHesloPopis:
      "{Přihlásil|Přihlásila} ses heslem, které ti dal kouč. Než začneš psát, nastav si vlastní, které zná jenom tvoje hlava.",
    zmenHesloHotovo: "Heslo je změněné. Přihlas se prosím znovu, už tím novým.",

    ukladam: "Ukládám…",
    ulozenoAuto: "Uloženo",
    chybaUlozeni: "Uložení se nepovedlo. Zkus to znovu.",
    nacitam: "Načítám…",

    koucNadpis: "Deníky klientů",
    koucNovyKlient: "Nový deník",
    koucOdkaz: "Odkaz pro klienta",
    koucZkopirovat: "Kopírovat odkaz",
    koucZkopirovano: "Zkopírováno",
    koucKlienti: "Klienti",
    koucPozvanky: "Pozvánky",
    koucBezKlientu: "Zatím tu není žádný deník.",
    koucSoukromi:
      "Kolik z deníku uvidíš, určuje úroveň sdílení u každého klienta zvlášť. Klient ji vidí taky, na svém účtu. Nepřiznaný dohled tady nejde nastavit.",
    koucPosledniZapis: "Poslední zápis",
    koucZablokovat: "Zablokovat",
    koucOdblokovat: "Obnovit přístup",
    koucCekaNaAktivaci: "čeká na aktivaci",
  },

  en: {
    appName: "Weekly Planner",
    weeklyPlan: "Weekly plan",
    habitsProgress: "Habits and progress",
    weekOf: "Week of",
    motto: "DISCIPLINE TODAY, FREEDOM TOMORROW.",

    weeklySchedule: "Weekly schedule",
    notesIdeas: "Notes and ideas",
    habitTracker: "Habit tracker",
    dailyProgress: "Daily progress",
    dailyProgressHint: "(ratings 1 to 10)",
    dailyReflection: "Daily reflection",

    tabTyden: "Week",
    tabDen: "Day",
    tabStatistiky: "Statistics",
    tabNavyky: "Habits",
    tabUcet: "Account",
    dnes: "Today",
    predchozi: "Previous",
    dalsi: "Next",
    tisk: "Print",
    pdf: "Save PDF",
    tahniDoStrany: "swipe sideways",

    prihlaseni: "Sign in to your planner",
    email: "E-mail",
    heslo: "Password",
    prihlasit: "Sign in",
    odhlasit: "Sign out",
    prihlasuji: "Signing in…",
    chybnePrihlaseni: "Incorrect e-mail or password.",
    bezPripojeni: "The app is not connected to the server. NEXT_PUBLIC_CONVEX_URL is missing.",
    uvodniText:
      "The Winning Minds weekly planner. Your coach gives you access; only you can see what you write.",

    aktivaceNadpis: "Set up your planner",
    aktivacePodtitul: "Choose the password you will sign in with.",
    noveHeslo: "New password",
    noveHesloZnovu: "Repeat password",
    hesloNesouhlasi: "The passwords do not match.",
    zalozitUcet: "Create planner",
    aktivaceHotovo: "Done. Sign in with your e-mail and new password.",
    pozvankaNeplatna: "This link is not valid. Ask your coach for a new one.",
    pozvankaPouzita: "This link has already been used. Sign in at /planner.",
    pozvankaVyprsela: "This link has expired. Ask your coach for a new one.",

    navykyNadpis: "My habits",
    navykyPodtitul:
      "Habits are the only part of the planner you define yourself. Everything else has a fixed structure.",
    novyNavyk: "New habit",
    nazevNavyku: "Habit name",
    cilTydne: "Weekly goal",
    bezCile: "no goal",
    pridat: "Add",
    ulozit: "Save",
    zrusit: "Cancel",
    prejmenovat: "Rename",
    archivovat: "Archive",
    obnovit: "Restore",
    smazat: "Delete",
    smazatPotvrzeni:
      "Delete the habit and every day you ticked it? Past statistics will change. Archiving keeps the history.",
    archivovane: "Archived",
    zadneNavyky: "No habits yet. Add your first one.",
    navykuMaximum: "The tracker cannot hold more than twenty habits at once.",
    posunoutNahoru: "Move up",
    posunoutDolu: "Move down",

    statTyden: "Week",
    statMesic: "Month",
    statRok: "Year",
    statPrehled: "Overview",
    statDenniSkore: "Daily score",
    statDenniSkoreVysvetleni:
      "The average of energy, focus, mood and productivity. Sleep stays out of it, because it is measured in hours.",
    statVyplnenychDnu: "Days filled in",
    statSerie: "Current streak",
    statNejdelsiSerie: "Longest streak",
    statNavyky: "Habits",
    statUspesnost: "Completion",
    statSplneno: "Done",
    statUkazatele: "Daily ratings",
    statUkazatel: "Rating",
    statSerieKratce: "Streak",
    statSNavykem: "With habit",
    statBezNavyku: "Without",
    statDnuSBez: "Days with / without",
    statPrumer: "Average",
    statRozsah: "Range",
    statZmena: "Change",
    statProtiMinulemu: "vs previous period",
    statReflexe: "Reflection filled in",
    statNaplanovanychHodin: "Hours planned",
    statPodleDnu: "By day of week",
    statPodleDnuVysvetleni:
      "A dip that keeps landing on the same weekday is not chance, it is how the week is built.",
    statVyvoj: "Trend",
    statVliv: "Connections",
    statVlivVysvetleni:
      "Days when the habit was done compared with days when it was not. This is not proof of cause: the link can run the other way, because a good day makes the habit easier to keep.",
    statVlivRadek: "on days with the habit",
    statMaloDat: "Not enough days yet for this calculation.",
    statZadnaData: "Nothing recorded for this period.",
    statNejlepsiDen: "Strongest day",
    statNejhorsiDen: "Weakest day",
    statShrnuti: "What this means",
    statShrnutiUvod:
      "A few sentences on what stands behind the numbers above, what to build on and what to tackle first.",
    dnu: "days",
    bodu: "points",
    hodin: "hours",

    ucetNadpis: "Account",
    jmeno: "Name",
    rod: "Form of address",
    rodMuz: "masculine",
    rodZena: "feminine",
    jazyk: "Language",
    zmenaHesla: "Change password",
    stavajiciHeslo: "Current password",
    ulozeno: "Saved.",
    sdileniNadpis: "What your coach sees",
    sdileniNic: "Nothing from the content",
    sdileniCisla: "Ratings and habits",
    sdileniVse: "The whole journal",
    sdileniNicPopis:
      "Your coach only sees that you keep a journal and when you last wrote in it. Not what is inside.",
    sdileniCislaPopis:
      "Your coach sees your ratings, ticked habits and statistics. The daily schedule, reflection and notes stay yours alone.",
    sdileniVsePopis:
      "Your coach sees the whole journal, including the schedule, reflection and notes. You can agree on a narrower range at any time.",
    sdileniKdo: "Your coach sets this, but you always see it here. If it does not sit right with you, say so.",

    zmenHesloNadpis: "Choose your own password",
    zmenHesloPopis:
      "You signed in with the password your coach gave you. Before you start writing, set one that only you know.",
    zmenHesloHotovo: "Password changed. Please sign in again with the new one.",

    ukladam: "Saving…",
    ulozenoAuto: "Saved",
    chybaUlozeni: "Saving failed. Please try again.",
    nacitam: "Loading…",

    koucNadpis: "Client planners",
    koucNovyKlient: "New planner",
    koucOdkaz: "Link for the client",
    koucZkopirovat: "Copy link",
    koucZkopirovano: "Copied",
    koucKlienti: "Clients",
    koucPozvanky: "Invitations",
    koucBezKlientu: "No planners here yet.",
    koucSoukromi:
      "How much of the journal you see is set per client. The client sees the same setting on their account. Watching without telling them is not possible here.",
    koucPosledniZapis: "Last entry",
    koucZablokovat: "Block",
    koucOdblokovat: "Restore access",
    koucCekaNaAktivaci: "awaiting activation",
  },

  sk: {
    appName: "Weekly Planner",
    weeklyPlan: "Týždenný plán",
    habitsProgress: "Návyky a postup",
    weekOf: "Týždeň",
    motto: "DISCIPLÍNA DNES, SLOBODA ZAJTRA.",

    weeklySchedule: "Týždenný rozvrh",
    notesIdeas: "Poznámky a nápady",
    habitTracker: "Tracker návykov",
    dailyProgress: "Denný postup",
    dailyProgressHint: "(hodnotenie 1 až 10)",
    dailyReflection: "Denná reflexia",

    tabTyden: "Týždeň",
    tabDen: "Deň",
    tabStatistiky: "Štatistiky",
    tabNavyky: "Návyky",
    tabUcet: "Účet",
    dnes: "Dnes",
    predchozi: "Predchádzajúci",
    dalsi: "Ďalší",
    tisk: "Tlač",
    pdf: "Uložiť PDF",
    tahniDoStrany: "ťahaj do strany",

    prihlaseni: "Prihlásenie do denníka",
    email: "E-mail",
    heslo: "Heslo",
    prihlasit: "Prihlásiť",
    odhlasit: "Odhlásiť",
    prihlasuji: "Prihlasujem…",
    chybnePrihlaseni: "Nesprávny e-mail alebo heslo.",
    bezPripojeni: "Aplikácia nie je pripojená k serveru. Chýba NEXT_PUBLIC_CONVEX_URL.",
    uvodniText:
      "Týždenný plánovač Winning Minds. Prístup dostaneš od svojho kouča, denník vidíš len ty.",

    aktivaceNadpis: "Založenie denníka",
    aktivacePodtitul: "Zvoľ si heslo, ktorým sa budeš do denníka prihlasovať.",
    noveHeslo: "Nové heslo",
    noveHesloZnovu: "Heslo znova",
    hesloNesouhlasi: "Heslá sa nezhodujú.",
    zalozitUcet: "Založiť denník",
    aktivaceHotovo: "Hotovo. Prihlás sa svojím e-mailom a novým heslom.",
    pozvankaNeplatna: "Tento odkaz neplatí. Požiadaj kouča o nový.",
    pozvankaPouzita: "Odkaz už bol použitý. Prihlás sa na /planner.",
    pozvankaVyprsela: "Odkaz vypršal. Požiadaj kouča o nový.",

    navykyNadpis: "Moje návyky",
    navykyPodtitul:
      "Návyky sú jediná časť plánovača, ktorú si určuješ {sám|sama}. Zvyšok denníka má pevnú stavbu.",
    novyNavyk: "Nový návyk",
    nazevNavyku: "Názov návyku",
    cilTydne: "Cieľ za týždeň",
    bezCile: "bez cieľa",
    pridat: "Pridať",
    ulozit: "Uložiť",
    zrusit: "Zrušiť",
    prejmenovat: "Premenovať",
    archivovat: "Archivovať",
    obnovit: "Obnoviť",
    smazat: "Zmazať",
    smazatPotvrzeni:
      "Zmazať návyk aj so všetkými odškrtnutými dňami? Štatistiky za minulé obdobia sa tým zmenia. Archivácia históriu zachová.",
    archivovane: "Archivované",
    zadneNavyky: "Zatiaľ nemáš žiadny návyk. Pridaj si prvý.",
    navykuMaximum: "Viac než dvadsať návykov naraz tracker neustráži.",
    posunoutNahoru: "Posunúť nahor",
    posunoutDolu: "Posunúť nadol",

    statTyden: "Týždeň",
    statMesic: "Mesiac",
    statRok: "Rok",
    statPrehled: "Prehľad",
    statDenniSkore: "Denné skóre",
    statDenniSkoreVysvetleni:
      "Priemer energie, sústredenia, nálady a produktivity. Spánok sa doň nepočíta, pretože je v hodinách.",
    statVyplnenychDnu: "Vyplnených dní",
    statSerie: "Séria v rade",
    statNejdelsiSerie: "Najdlhšia séria",
    statNavyky: "Návyky",
    statUspesnost: "Úspešnosť",
    statSplneno: "Splnené",
    statUkazatele: "Denné ukazovatele",
    statUkazatel: "Ukazovateľ",
    statSerieKratce: "Séria",
    statSNavykem: "S návykom",
    statBezNavyku: "Bez návyku",
    statDnuSBez: "Dní s / bez",
    statPrumer: "Priemer",
    statRozsah: "Rozsah",
    statZmena: "Zmena",
    statProtiMinulemu: "oproti minulému obdobiu",
    statReflexe: "Vyplnená reflexia",
    statNaplanovanychHodin: "Naplánovaných hodín",
    statPodleDnu: "Podľa dní v týždni",
    statPodleDnuVysvetleni:
      "Kde sa opakovane prepadáš, tam nejde o náhodu, ale o stavbu týždňa.",
    statVyvoj: "Vývoj",
    statVliv: "Súvislosti",
    statVlivVysvetleni:
      "Porovnanie dní, keď návyk splnený bol, so dňami, keď splnený nebol. Nie je to dôkaz príčiny: vzťah môže viesť aj opačne, pretože v dobrý deň sa návyk plní ľahšie.",
    statVlivRadek: "v dňoch s návykom",
    statMaloDat: "Na výpočet je zatiaľ málo dní.",
    statZadnaData: "Za toto obdobie nemáš nič zapísané.",
    statNejlepsiDen: "Najsilnejší deň",
    statNejhorsiDen: "Najslabší deň",
    statShrnuti: "Čo z toho plynie",
    statShrnutiUvod:
      "Niekoľko viet k tomu, čo za číslami vyššie stojí, na čom stavať a čo riešiť ako prvé.",
    dnu: "dní",
    bodu: "bodov",
    hodin: "hodín",

    ucetNadpis: "Účet",
    jmeno: "Meno",
    rod: "Oslovenie",
    rodMuz: "mužský rod",
    rodZena: "ženský rod",
    jazyk: "Jazyk",
    zmenaHesla: "Zmena hesla",
    stavajiciHeslo: "Súčasné heslo",
    ulozeno: "Uložené.",
    sdileniNadpis: "Čo z denníka vidí tvoj kouč",
    sdileniNic: "Nič z obsahu",
    sdileniCisla: "Hodnotenia a návyky",
    sdileniVse: "Celý denník",
    sdileniNicPopis:
      "Kouč vidí len to, že si denník vedieš, a kedy si doň naposledy {písal|písala}. Čo je vnútri, nevidí.",
    sdileniCislaPopis:
      "Kouč vidí tvoje hodnotenia, odškrtnuté návyky a štatistiky. Rozvrh dňa, reflexiu ani poznámky nevidí, tie zostávajú iba tvoje.",
    sdileniVsePopis:
      "Kouč vidí celý denník vrátane rozvrhu, reflexie a poznámok. Kedykoľvek sa s ním môžeš dohodnúť na užšom rozsahu.",
    sdileniKdo: "Nastavuje to kouč, ale vidíš to tu vždy. Keď ti to nesedí, povedz mu to.",

    zmenHesloNadpis: "Zvoľ si vlastné heslo",
    zmenHesloPopis:
      "{Prihlásil|Prihlásila} si sa heslom, ktoré ti dal kouč. Než začneš písať, nastav si vlastné, ktoré pozná len tvoja hlava.",
    zmenHesloHotovo: "Heslo je zmenené. Prihlás sa prosím znova, už tým novým.",

    ukladam: "Ukladám…",
    ulozenoAuto: "Uložené",
    chybaUlozeni: "Uloženie sa nepodarilo. Skús to znova.",
    nacitam: "Načítavam…",

    koucNadpis: "Denníky klientov",
    koucNovyKlient: "Nový denník",
    koucOdkaz: "Odkaz pre klienta",
    koucZkopirovat: "Kopírovať odkaz",
    koucZkopirovano: "Skopírované",
    koucKlienti: "Klienti",
    koucPozvanky: "Pozvánky",
    koucBezKlientu: "Zatiaľ tu nie je žiadny denník.",
    koucSoukromi:
      "Koľko z denníka uvidíš, určuje úroveň zdieľania u každého klienta zvlášť. Klient ju vidí tiež, na svojom účte. Nepriznaný dohľad sa tu nastaviť nedá.",
    koucPosledniZapis: "Posledný zápis",
    koucZablokovat: "Zablokovať",
    koucOdblokovat: "Obnoviť prístup",
    koucCekaNaAktivaci: "čaká na aktiváciu",
  },
}
