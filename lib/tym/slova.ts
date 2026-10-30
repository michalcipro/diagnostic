import type { DimensionId } from "../diagnostic/types"
import type { TymLang } from "./obsah"
import { SD_ROZDILNE, SD_SHODA, TRHLINA_ROZDIL_SD, TRHLINA_ROZDIL_U, jeSilna, type UrovenTymu } from "./prahy"

// Jazyk mapy týmu.
//
// Report čte trenér, ne psycholog. Odborný název oblasti a číslo rozptylu mu
// samy o sobě neřeknou nic, podle čeho by se dalo v úterý rozhodnout. Tenhle
// soubor proto drží druhou vrstvu názvosloví: krátké názvy řečí kabiny, slova
// místo čísel a jednu větu ke každé oblasti.
//
// Odborné názvy nemizí. Zůstávají tam, kde patří, tedy v podrobném rozboru
// oblastí a v manuálu. Tady jsou od toho, aby se dal profil přečíst za minutu.

/** Krátký název oblasti tak, jak by ji pojmenoval trenér. */
export const KRATCE: Record<TymLang, Record<DimensionId, string>> = {
  cs: {
    A: "Proč vlastně hrajou",
    B: "Sebedůvěra a co si říkají po chybě",
    C: "Soustředění",
    D: "Zvládání tlaku",
    E: "Jak snášejí neúspěch",
    F: "Režim a odpočinek",
    G: "Atmosféra v kabině",
  },
  en: {
    A: "Why they play at all",
    B: "Confidence and self-talk after a mistake",
    C: "Focus",
    D: "Handling pressure",
    E: "How they take failure",
    F: "Routine and recovery",
    G: "The mood in the locker room",
  },
}

/** Názvy jednadvaceti částí. Klíče se drží identifikátorů ze skórování. */
export const CASTI: Record<TymLang, Record<string, string>> = {
  cs: {
    A1: "Ví, kdo jsou a co chtějí",
    A2: "Hrajou, protože chtějí",
    A3: "Hodnota nezávislá na výsledku",
    B1: "Věří si v zápase",
    B2: "Jak se sebou mluví",
    B3: "Co si řeknou po chybě",
    C1: "Udrží pozornost v ruchu",
    C2: "Umí se vrátit do hry",
    C3: "Hrajou to, co je teď",
    D1: "Poznají, co se s nimi děje",
    D2: "Umí se zklidnit",
    D3: "Berou zápas jako šanci",
    E1: "Věří, že se dá zlepšit",
    E2: "Vydrží dlouhou dřinu",
    E3: "Poučí se z prohry",
    F1: "Dělají, co mají",
    F2: "Spánek a odpočinek",
    F3: "Energie a životospráva",
    G1: "Řekne se nahlas, co vázne",
    G2: "Umí si říct o svoje",
    G3: "Mají se o koho opřít",
  },
  en: {
    A1: "They know who they are",
    A2: "They play because they want to",
    A3: "Worth that survives a loss",
    B1: "They back themselves in a match",
    B2: "How they talk to themselves",
    B3: "What they say after a mistake",
    C1: "They hold focus in noise",
    C2: "They can get back into it",
    C3: "They play the point in front of them",
    D1: "They notice what is happening to them",
    D2: "They can settle themselves down",
    D3: "They read a big match as a chance",
    E1: "They believe they can improve",
    E2: "They last through a long grind",
    E3: "They learn from a loss",
    F1: "They do what they are supposed to",
    F2: "Sleep and recovery",
    F3: "Energy and lifestyle",
    G1: "Things that bother them get said",
    G2: "They can ask for what they need",
    G3: "They have someone to lean on",
  },
}

/** Slovní popis úrovně. Hranice sedí na pásma vysvětlená v reportu. */
export function slovoUrovne(u: UrovenTymu, lang: TymLang): string {
  const cs: Record<UrovenTymu, string> = {
    "potrebuje-praci": "potřebuje práci",
    prumerne: "průměrné",
    silne: "silné",
    spicka: "špičkové",
  }
  const en: Record<UrovenTymu, string> = {
    "potrebuje-praci": "needs work",
    prumerne: "average",
    silne: "strong",
    spicka: "elite",
  }
  return lang === "cs" ? cs[u] : en[u]
}

/**
 * Jak moc se hráči liší, řečeno slovy.
 *
 * Trenér nečte směrodatnou odchylku a číslo mu neřekne, co s tím. Přitom
 * právě tahle informace rozhoduje o tom, jestli pomůže společné cvičení,
 * nebo jeden rozhovor, takže musí být čitelná na první pohled.
 */
//
// Hranice jsou tytéž, podle kterých report hlásí velký rozptyl a kreslí mapu
// (prahy.ts). Dřív tu byly vlastní (9, 15, 19) a oblast se tak jmenovala
// „velké rozdíly" a o řádek níž „v týmu podobná".
export function shodaDlouze(sd: number, lang: TymLang): string {
  const cs =
    sd < SD_SHODA ? "všichni na tom jsou podobně"
    : sd < SD_ROZDILNE ? "menší rozdíly mezi hráči"
    : "velké rozdíly mezi hráči"
  const en =
    sd < SD_SHODA ? "everyone is in a similar place"
    : sd < SD_ROZDILNE ? "smaller differences between players"
    : "large differences between players"
  return lang === "cs" ? cs : en
}

/** Totéž na dvě slova, do dlaždice a do seznamu. */
export function shodaKratce(sd: number, lang: TymLang): string {
  const cs = sd < SD_SHODA ? "jednotné" : sd < SD_ROZDILNE ? "menší rozdíly" : "velké rozdíly"
  const en = sd < SD_SHODA ? "united" : sd < SD_ROZDILNE ? "some differences" : "large differences"
  return lang === "cs" ? cs : en
}

/**
 * Jedna věta k oblasti.
 *
 * Větu řídí tvar rozdělení a úroveň, ne samotné číslo. Dvě skupiny, velké
 * rozdíly a rovnoměrná slabina vypadají v tabulce podobně a řeší se každá
 * jinak. Dřív větu řídil průměr s vlastními prahy (60 a 70), a oblast, kterou
 * report o kus výš vypsal mezi oporami, tu dostala „ani se o to zatím nedá
 * opřít". Teď se opora bere ze stejného seznamu jako v reportu.
 */
export function vetaOblasti(
  o: { uroven: UrovenTymu; rozkol: boolean; rozptyl: boolean; plosna: boolean },
  lang: TymLang,
  opora: boolean,
): string {
  const klic = o.rozkol
    ? "rozkol"
    : o.rozptyl
      ? "rozptyl"
      : o.plosna
        ? "plosna"
        : o.uroven === "potrebuje-praci"
          ? "slaba"
          : opora
            ? "opora"
            : jeSilna(o.uroven)
              ? "silnaBezOpory"
              : "prumerna"
  return VETY_OBLASTI[lang][klic]
}

const VETY_OBLASTI: Record<
  TymLang,
  Record<"rozkol" | "rozptyl" | "plosna" | "slaba" | "opora" | "silnaBezOpory" | "prumerna", string>
> = {
  cs: {
    rozkol:
      "Tým se dělí na dvě skupiny. Jedna část si poradí, druhá ne, a mezi nimi je velká mezera. Společné cvičení tady nepomůže, protože každé skupině pomáhá něco jiného.",
    rozptyl:
      "Hráči se tady hodně liší, ale na dvě skupiny se nedělí. Často za tím stojí jeden nebo dva lidé daleko od zbytku; pak je to věc rozhovoru s nimi, ne porady s celým mužstvem.",
    plosna:
      "Chybí to celému týmu podobně. Když je slabina rovnoměrná, není to o hráčích, ale o tom, co a jak se trénuje.",
    slaba:
      "Velká část kádru je tady pod silným pásmem. Tohle je místo, kde je práce potřeba nejvíc.",
    opora:
      "Silná stránka, na kterou se dá spolehnout i ve vypjatém zápase. Tady se dá stavět, když se pracuje jinde.",
    silnaBezOpory:
      "Oblast je jako celek silná, ale některá její část pokulhává. Než se o ni opřeš, podívej se níž, která to je.",
    prumerna:
      "Slušný stav bez velkých výkyvů. Nic tu nehoří, ale ani se o to zatím nedá opřít.",
  },
  en: {
    rozkol:
      "The squad splits into two groups. One part copes, the other does not, and there is a wide gap between them. A shared drill will not help here, because each group needs something different.",
    rozptyl:
      "Players differ a lot here, but they do not split into two groups. Often one or two people sit far from the rest; then it is a matter of talking with them, not of a squad meeting.",
    plosna:
      "The whole squad is missing it to a similar degree. An even weakness is not about the players; it is about what gets trained and how.",
    slaba:
      "A large part of the squad sits below the strong band here. This is where work is needed most.",
    opora:
      "A strength you can lean on even in a tight match. This is where you build from while you work on something harder.",
    silnaBezOpory:
      "The area is strong as a whole, but one of its parts lags. Before you lean on it, look further down to see which one.",
    prumerna:
      "A decent state without big swings. Nothing is on fire, but there is nothing to lean on yet either.",
  },
}

/**
 * Proč se skrytá trhlina hlásí: část je výrazně níž než oblast, výrazně
 * rozkolísanější, nebo obojí. Dřív věta tvrdila vždycky obojí a u části,
 * která byla jen rozkolísaná, psala „o -3 body míň".
 *
 * Server posílá zaokrouhlená čísla, takže se tu počítá s rezervou jednoho
 * bodu. Kdyby zaokrouhlení na hranici shodilo obě podmínky, platí aspoň ta,
 * která odpovídá směru rozdílu; trhlina se hlásí, takže jedna platit musí.
 */
export function duvodTrhliny(
  o: { prumer: number; smodch: number },
  c: { prumer: number; smodch: number },
): { nizsi: boolean; rozkolisana: boolean } {
  const nizsi = o.prumer - c.prumer >= TRHLINA_ROZDIL_U - 1
  const rozkolisana = c.smodch - o.smodch >= TRHLINA_ROZDIL_SD - 1
  if (!nizsi && !rozkolisana) return { nizsi: o.prumer > c.prumer, rozkolisana: o.prumer <= c.prumer }
  return { nizsi, rozkolisana }
}

export interface MapaTexty {
  titul: string
  kicker: string
  navodTitul: string
  navodUvod: string
  navod: string[]
  osaX: string
  osaXVlevo: string
  osaXVpravo: string
  osaYNahore: string
  osaYDole: string
  rohy: { titul: string; popis: string }[]
  prikladTitul: string
  prikladVeta: (oblast: string, cast: string) => string
  legenda: [string, string, string]
  seznamTitul: string
  seznamNapoveda: string
  stitky: { zlom: string; rozptyl: string; opora: string }

  cislaKicker: string
  cislaTitul: string
  cislaUvod: string
  pasma: { rozsah: string; popis: string }[]
  cislaPoznamka: string

  trhlinyKicker: string
  trhlinyTitul: string
  trhlinyUvod: string
  /** `duvod` říká, proč se trhlina hlásí: nižší průměr, větší rozptyl, nebo obojí */
  trhlinaVeta: (celek: number, cast: number, rozdil: number, duvod: { nizsi: boolean; rozkolisana: boolean }) => string
  bezTrhlin: string

  castiKicker: string
  castiTitul: string
  castiUvod: string
  castiZahlavi: [string, string, string, string]
  celkem: (u: number) => string
  potrebujePozornost: string
  nizsi: string
  vyssi: string
}

const CS: MapaTexty = {
  titul: "Mapa týmu",
  kicker: "Celý tým na jednom obrázku",
  navodTitul: "Jak se v obrázku vyznat.",
  navodUvod:
    "Každá oblast je kroužek s písmenem. Kolem něj jsou tři menší značky: části, " +
    "ze kterých se ta oblast skládá. Čárky mezi nimi ukazují, jak daleko od sebe ty části jsou.",
  navod: [
    "Zleva doprava: čím víc vpravo, tím je tým v té věci silnější.",
    "Shora dolů: nahoře jsou hráči na tom podobně, dole se hodně liší.",
    "Levý dolní roh je nejhorší kombinace: slabé a k tomu rozdělené.",
  ],
  osaX: "body nad hranicí silného pásma, nebo pod ní",
  osaXVlevo: "slabší",
  osaXVpravo: "silnější",
  osaYNahore: "hráči stejně",
  osaYDole: "hráči rozdílně",
  // Rohy popisují polohu, ne verdikt. Úroveň oblasti se čte z rozdělení
  // kádru po pásmech a s průměrem na vodorovné ose se může rozejít; verdikt
  // v rohu by pak odporoval slovu u oblasti.
  rohy: [
    { titul: "níž a podobně", popis: "pracuje se s celým týmem" },
    { titul: "výš a podobně", popis: "tady je na čem stavět" },
    { titul: "níž a rozdílně", popis: "nejvíc práce, každý potřebuje něco jiného" },
    { titul: "výš, ale rozdílně", popis: "průměr táhne část hráčů" },
  ],
  prikladTitul: "Příklad čtení",
  prikladVeta: (oblast, cast) =>
    `${oblast} leží vpravo nahoře, tedy silné a jednotné. Oranžová čárka ale vede ` +
    `dolů k části ${cast.toLowerCase()}, která od zbytku oblasti utekla. Právě tohle ` +
    "průměr oblasti schová.",
  legenda: ["celá oblast", "část oblasti, v pořádku", "část, která potřebuje pozornost"],
  seznamTitul: "Sedm oblastí",
  seznamNapoveda: "Najeď na řádek a ukáže se, co to znamená.",
  stitky: { zlom: "dělí se na dvě skupiny", rozptyl: "velké rozdíly", opora: "opora" },

  cislaKicker: "Nejdřív jedna věc",
  cislaTitul: "Co znamenají čísla",
  cislaUvod:
    "Každá oblast má jedno číslo od 0 do 100. Není to procento úspěšnosti ani známka. " +
    "Je to poloha na škále dotazníku (0 jsou samé nejhorší odpovědi, 100 samé nejlepší), " +
    "takže se dá porovnávat mezi sezonami i mezi mužstvy. Pásmo hráče se ale určuje " +
    "podle toho, kde stojí mezi sportovci, kteří test vyplnili:",
  pasma: [
    { rozsah: "Spodních 20 %", popis: "Rozvojová priorita. Chybí základ, na kterém se dá stavět." },
    { rozsah: "20 až 50 %", popis: "Stabilizace. V klidu to drží, pod tlakem ne." },
    { rozsah: "50 až 85 %", popis: "Silné. Nad polovinou sportovců, dá se na tom stavět." },
    { rozsah: "Horních 15 %", popis: "Špičkové. Konkurenční výhoda." },
  ],
  cislaPoznamka:
    "Oblasti nejsou stejně těžké: medián sportovců leží u soustředění kolem 60 bodů, " +
    "u zvládání neúspěchu kolem 75. Mapa proto ukazuje, o kolik bodů je tým nad hranicí silného " +
    "pásma dané oblasti, nebo pod ní. Slovo u oblasti se nečte z průměru: oblast se " +
    "jmenuje silnou tehdy, když je v silném nebo špičkovém pásmu aspoň šest hráčů z deseti " +
    "a v rozvojové prioritě nanejvýš jeden. Špičkovou, když je tam aspoň osm z deseti, " +
    "nikdo dole a aspoň tři ve špičkovém pásmu. Průměr sám totiž umí zakrýt, že půlka " +
    "týmu je dole. Vedle čísla je proto vždycky ještě druhá informace: jestli jsou na tom " +
    "hráči podobně, nebo úplně jinak.",

  trhlinyKicker: "To, co by v průměru zapadlo",
  trhlinyTitul: "Kde se problém schoval",
  trhlinyUvod:
    "Oblast může mít slušné číslo a přitom v ní jedna konkrétní věc silně pokulhává. " +
    "Průměr to zamaskuje. Tady jsou takové případy vypsané.",
  trhlinaVeta: (celek, cast, rozdil, duvod) => {
    const body = rozdil === 1 ? "bod" : rozdil >= 2 && rozdil <= 4 ? "body" : "bodů"
    const zacatek = `Celá oblast má ${celek} bodů a vypadá klidně. `
    if (duvod.nizsi && duvod.rozkolisana) {
      return (
        zacatek +
        `Tahle jedna věc uvnitř má ale jen ${cast}, tedy o ${rozdil} ${body} míň, ` +
        "a navíc se v ní hráči hodně liší. Průměr celé oblasti to schová."
      )
    }
    if (duvod.nizsi) {
      return zacatek + `Tahle jedna věc uvnitř má ale jen ${cast}, tedy o ${rozdil} ${body} míň. Průměr celé oblasti to schová.`
    }
    return (
      zacatek +
      `Tahle jedna věc uvnitř má ${cast} bodů, ale hráči se v ní liší mnohem víc než ve zbytku ` +
      "oblasti: někomu jde výborně, někomu vůbec. Průměr celé oblasti to schová."
    )
  },
  bezTrhlin: "Žádná oblast neschovává uvnitř věc, která by výrazně pokulhávala.",

  castiKicker: "Rozpad na konkrétní věci",
  castiTitul: "Z čeho se oblasti skládají",
  castiUvod:
    "Každá oblast má tři části. Tmavší dlaždice znamená vyšší číslo. Vedle čísla je " +
    "vždycky napsané, jestli jsou na tom hráči podobně, nebo se liší.",
  castiZahlavi: ["Oblast", "První část", "Druhá část", "Třetí část"],
  celkem: (u) => `celkem ${u} bodů`,
  potrebujePozornost: "potřebuje pozornost",
  nizsi: "nižší číslo",
  vyssi: "vyšší číslo",
}

const EN: MapaTexty = {
  titul: "Team map",
  kicker: "The whole squad in one picture",
  navodTitul: "How to read this picture.",
  navodUvod:
    "Each area is a ring with a letter. Around it sit three smaller marks: the parts " +
    "that area is made of. The hairlines show how far apart those parts are.",
  navod: [
    "Left to right: the further right, the stronger the squad is at it.",
    "Top to bottom: at the top players are in a similar place, at the bottom they differ a lot.",
    "The bottom left corner is the worst combination: weak and divided on top of it.",
  ],
  osaX: "points above or below the strong-band line",
  osaXVlevo: "weaker",
  osaXVpravo: "stronger",
  osaYNahore: "players alike",
  osaYDole: "players differ",
  rohy: [
    { titul: "lower and alike", popis: "work with the whole squad" },
    { titul: "higher and alike", popis: "something to build on" },
    { titul: "lower and divided", popis: "most work, everyone needs something else" },
    { titul: "higher, but divided", popis: "part of the squad carries the average" },
  ],
  prikladTitul: "Worked example",
  prikladVeta: (oblast, cast) =>
    `${oblast} sits top right, meaning strong and united. The orange line, though, runs ` +
    `down to ${cast.toLowerCase()}, a part that has run away from the rest of the area. ` +
    "This is exactly what an area average hides.",
  legenda: ["whole area", "part of an area, fine", "part that needs attention"],
  seznamTitul: "The seven areas",
  seznamNapoveda: "Hover a row to see what it means.",
  stitky: { zlom: "splits into two groups", rozptyl: "large differences", opora: "anchor" },

  cislaKicker: "One thing first",
  cislaTitul: "What the numbers mean",
  cislaUvod:
    "Each area carries one number from 0 to 100. It is not a success rate and not a grade. " +
    "It is a position on the questionnaire's scale (0 means all the lowest answers, 100 all " +
    "the highest), so it can be compared across seasons and across teams. A player's band, " +
    "though, is set by where they stand among the athletes who have taken the test:",
  pasma: [
    { rozsah: "Bottom 20 %", popis: "Development priority. The base to build on is missing." },
    { rozsah: "20 to 50 %", popis: "Stabilisation. Holds when calm, not under pressure." },
    { rozsah: "50 to 85 %", popis: "Strong. Above half of the athletes, something to build on." },
    { rozsah: "Top 15 %", popis: "Elite. A competitive advantage." },
  ],
  cislaPoznamka:
    "The areas are not equally hard: the athletes' median sits around 60 points for focus " +
    "and around 75 for how players take failure. The map therefore shows how many points the team sits above " +
    "or below the strong-band line of each area. The word next to an area is not read off the " +
    "average: an area counts as strong when at least six players in ten sit in the strong or " +
    "elite band and at most one is a development priority; as elite when at least eight in ten " +
    "do, nobody is at the bottom and at least three are in the elite band. An average on its " +
    "own can hide that half the team is down there. That is why the number always comes with " +
    "a second piece of information: whether players are in a similar place or somewhere else " +
    "entirely.",

  trhlinyKicker: "What an average would swallow",
  trhlinyTitul: "Where the problem hid",
  trhlinyUvod:
    "An area can carry a decent number while one specific thing inside it lags badly. " +
    "The average masks it. Those cases are listed here.",
  trhlinaVeta: (celek, cast, rozdil, duvod) => {
    const body = rozdil === 1 ? "point" : "points"
    const zacatek = `The area as a whole sits at ${celek} points and looks calm. `
    if (duvod.nizsi && duvod.rozkolisana) {
      return (
        zacatek +
        `This one thing inside it is at only ${cast}, that is ${rozdil} ${body} lower, and on ` +
        "top of that players differ a lot in it. The area average hides it."
      )
    }
    if (duvod.nizsi) {
      return zacatek + `This one thing inside it is at only ${cast}, that is ${rozdil} ${body} lower. The area average hides it.`
    }
    return (
      zacatek +
      `This one thing inside it is at ${cast} points, but players differ in it far more than ` +
      "in the rest of the area: some do very well, some not at all. The area average hides it."
    )
  },
  bezTrhlin: "No area is hiding a part that lags badly behind it.",

  castiKicker: "Broken down into concrete things",
  castiTitul: "What the areas are made of",
  castiUvod:
    "Each area has three parts. A darker tile means a higher number. Next to the number it " +
    "always says whether players are in a similar place or differ.",
  castiZahlavi: ["Area", "First part", "Second part", "Third part"],
  celkem: (u) => `${u} points overall`,
  potrebujePozornost: "needs attention",
  nizsi: "lower number",
  vyssi: "higher number",
}

export const MAPA: Record<TymLang, MapaTexty> = { cs: CS, en: EN }
