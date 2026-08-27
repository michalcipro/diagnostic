import type { DimensionId } from "../diagnostic/types"
import type { TymLang } from "./obsah"
import type { UrovenTymu } from "./prahy"

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
export function shodaDlouze(sd: number, lang: TymLang): string {
  const cs =
    sd < 9 ? "všichni na tom jsou podobně"
    : sd < 15 ? "menší rozdíly mezi hráči"
    : sd < 19 ? "velké rozdíly mezi hráči"
    : "hráči jsou jeden od druhého úplně jinde"
  const en =
    sd < 9 ? "everyone is in a similar place"
    : sd < 15 ? "smaller differences between players"
    : sd < 19 ? "large differences between players"
    : "players are in completely different places"
  return lang === "cs" ? cs : en
}

/** Totéž na dvě slova, do dlaždice a do seznamu. */
export function shodaKratce(sd: number, lang: TymLang): string {
  const cs = sd < 9 ? "jednotné" : sd < 15 ? "menší rozdíly" : sd < 19 ? "velké rozdíly" : "velmi rozdílné"
  const en = sd < 9 ? "united" : sd < 15 ? "some differences" : sd < 19 ? "large differences" : "very mixed"
  return lang === "cs" ? cs : en
}

/**
 * Jedna věta k oblasti.
 *
 * Větu řídí tvar rozdělení, ne samotné číslo. Dvě skupiny, jeden člověk mimo
 * a rovnoměrná slabina vypadají v tabulce podobně a řeší se každá jinak;
 * kdyby větu řídil průměr, report by radil špatně.
 */
export function vetaOblasti(
  o: { prumer: number; smodch: number; rozkol: boolean; rozptyl: boolean; plosna: boolean },
  lang: TymLang,
): string {
  const cs = o.rozkol
    ? "Tým se dělí na dvě skupiny. Jedna část si poradí, druhá ne, a mezi nimi je velká mezera. Společné cvičení tady nepomůže, protože každé skupině pomáhá něco jiného."
    : o.rozptyl
      ? "Jeden hráč je úplně jinde než zbytek týmu. Není to věc porady s celým mužstvem, je to věc jednoho rozhovoru."
      : o.plosna || o.prumer < 60
        ? "Chybí to celému týmu podobně. Když je slabina rovnoměrná, není to o hráčích, ale o tom, co a jak se trénuje."
        : o.prumer >= 70 && o.smodch < 12
          ? "Silná stránka, na kterou se dá spolehnout i ve vypjatém zápase. Tady se dá stavět, když se pracuje jinde."
          : "Slušný průměr bez velkých výkyvů. Nic tu nehoří, ale ani se o to zatím nedá opřít."
  const en = o.rozkol
    ? "The squad splits into two groups. One part copes, the other does not, and there is a wide gap between them. A shared drill will not help here, because each group needs something different."
    : o.rozptyl
      ? "One player is in a completely different place from the rest. This is not a team meeting matter; it is one conversation."
      : o.plosna || o.prumer < 60
        ? "The whole squad is missing it to a similar degree. An even weakness is not about the players; it is about what gets trained and how."
        : o.prumer >= 70 && o.smodch < 12
          ? "A strength you can lean on even in a tight match. This is where you build from while you work on something harder."
          : "A decent average without big swings. Nothing is on fire, but there is nothing to lean on yet either."
  return lang === "cs" ? cs : en
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
  trhlinaVeta: (celek: number, cast: number, rozdil: number) => string
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
  osaX: "jak je na tom tým",
  osaXVlevo: "slabší",
  osaXVpravo: "silnější",
  osaYNahore: "hráči stejně",
  osaYDole: "hráči rozdílně",
  rohy: [
    { titul: "chybí to všem", popis: "řeší se tréninkem pro celý tým" },
    { titul: "na tohle se dá spolehnout", popis: "drží to i pod tlakem" },
    { titul: "nejnaléhavější", popis: "slabé a k tomu rozdělené" },
    { titul: "vypadá dobře, ale nedrží", popis: "průměr táhne pár hráčů" },
  ],
  prikladTitul: "Příklad čtení",
  prikladVeta: (oblast, cast) =>
    `${oblast} leží vpravo nahoře, tedy silné a jednotné. Oranžová čárka ale vede ` +
    `dolů k části ${cast.toLowerCase()}, která od zbytku oblasti utekla. Právě tohle ` +
    "průměr oblasti schová.",
  legenda: ["celá oblast", "část oblasti, v pořádku", "část, která potřebuje pozornost"],
  seznamTitul: "Sedm oblastí",
  seznamNapoveda: "Najeď na řádek a ukáže se, co to znamená.",
  stitky: { zlom: "dělí se na dvě skupiny", rozptyl: "jeden hráč mimo", opora: "opora" },

  cislaKicker: "Nejdřív jedna věc",
  cislaTitul: "Co znamenají čísla",
  cislaUvod:
    "Každá oblast má jedno číslo od 0 do 100. Není to procento úspěšnosti ani známka. " +
    "Je to poloha na škále, kterou používáme u všech týmů, takže se dá porovnávat mezi " +
    "sezonami i mezi mužstvy.",
  pasma: [
    { rozsah: "Pod 31", popis: "Rozvojová priorita. Chybí základ, na kterém se dá stavět." },
    { rozsah: "31 až 61", popis: "Stabilizace. V klidu to drží, pod tlakem ne." },
    { rozsah: "61 až 82", popis: "Silné. Dá se na tom stavět." },
    { rozsah: "Nad 82", popis: "Špičkové. Konkurenční výhoda." },
  ],
  cislaPoznamka:
    "Tohle jsou pásma testu a platí pro jednoho hráče. Slovo u oblasti se ale nečte " +
    "z průměru: oblast se jmenuje silnou tehdy, když je v silném pásmu aspoň polovina " +
    "kádru a zároveň skoro nikdo nepropadá. Průměr sám totiž umí zakrýt, že půlka týmu " +
    "je dole. Vedle čísla je proto vždycky ještě druhá informace: jestli jsou na tom " +
    "hráči podobně, nebo úplně jinak.",

  trhlinyKicker: "To, co by v průměru zapadlo",
  trhlinyTitul: "Kde se problém schoval",
  trhlinyUvod:
    "Oblast může mít slušné číslo a přitom v ní jedna konkrétní věc silně pokulhává. " +
    "Průměr to zamaskuje. Tady jsou takové případy vypsané.",
  trhlinaVeta: (celek, cast, rozdil) =>
    `Celá oblast má ${celek} bodů a vypadá klidně. Tahle jedna věc uvnitř má ale jen ` +
    `${cast}, tedy o ${rozdil} ${rozdil === 1 ? "bod" : rozdil < 5 ? "body" : "bodů"} míň, ` +
    "a navíc se v ní hráči hodně liší. Průměr celé oblasti to schová.",
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
  osaX: "where the squad stands",
  osaXVlevo: "weaker",
  osaXVpravo: "stronger",
  osaYNahore: "players alike",
  osaYDole: "players differ",
  rohy: [
    { titul: "everyone is missing it", popis: "fixed by training the whole squad" },
    { titul: "you can rely on this", popis: "it holds under pressure too" },
    { titul: "most urgent", popis: "weak and divided on top of it" },
    { titul: "looks fine, will not hold", popis: "a few players carry the average" },
  ],
  prikladTitul: "Worked example",
  prikladVeta: (oblast, cast) =>
    `${oblast} sits top right, meaning strong and united. The orange line, though, runs ` +
    `down to ${cast.toLowerCase()}, a part that has run away from the rest of the area. ` +
    "This is exactly what an area average hides.",
  legenda: ["whole area", "part of an area, fine", "part that needs attention"],
  seznamTitul: "The seven areas",
  seznamNapoveda: "Hover a row to see what it means.",
  stitky: { zlom: "splits into two groups", rozptyl: "one player apart", opora: "anchor" },

  cislaKicker: "One thing first",
  cislaTitul: "What the numbers mean",
  cislaUvod:
    "Each area carries one number from 0 to 100. It is not a success rate and not a grade. " +
    "It is a position on a scale we use with every squad, so it can be compared across " +
    "seasons and across teams.",
  pasma: [
    { rozsah: "Below 31", popis: "Development priority. The base to build on is missing." },
    { rozsah: "31 to 61", popis: "Stabilisation. Holds when calm, not under pressure." },
    { rozsah: "61 to 82", popis: "Strong. Something to build on." },
    { rozsah: "Above 82", popis: "Elite. A competitive advantage." },
  ],
  cislaPoznamka:
    "These are the bands of the test and they describe one player. The word next to an area " +
    "is not read off the average, though: an area counts as strong when at least half the " +
    "squad sits in the strong band and almost nobody is falling behind. An average on its own " +
    "can hide that half the team is down there. That is why the number always comes with a " +
    "second piece of information: whether players are in a similar place or somewhere else " +
    "entirely.",

  trhlinyKicker: "What an average would swallow",
  trhlinyTitul: "Where the problem hid",
  trhlinyUvod:
    "An area can carry a decent number while one specific thing inside it lags badly. " +
    "The average masks it. Those cases are listed here.",
  trhlinaVeta: (celek, cast, rozdil) =>
    `The area as a whole sits at ${celek} points and looks calm. This one thing inside it ` +
    `is at only ${cast}, that is ${rozdil} ${rozdil === 1 ? "point" : "points"} lower, and on ` +
    "top of that players differ a lot in it. The area average hides it.",
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
