import type { Lang } from "./types"

// Hodnocení sportovce trenérem.
//
// Je to kritérium, ne diagnostika. Slouží k jedinému: ověřit, že testy
// předpovídají to, co trenér vidí v praxi. Bez něj se validita nedá doložit,
// jen tvrdit. Proto stojí v aplikaci dřív než nový test: sběr musí běžet
// měsíce, než bude co analyzovat.
//
// Položky pokrývají konstrukty, u kterých je trenér dobrý pozorovatel
// (výkon pod tlakem, rozhodnost, návrat po chybě, stálost, práce se zpětnou
// vazbou) a které zároveň měří testy. Každá má popsané oba konce stupnice
// konkrétním chováním, ne slovy „slabé“ a „silné“: hodnotitelé se pak méně
// liší v tom, co si pod čísly představují.
//
// Sportovec hodnocení nevidí a do jeho vyhodnocení se nepromítá.

export const POLOZKY_HODNOCENI = [
  "tlak",
  "rozhodnost",
  "navrat",
  "konzistence",
  "koucovatelnost",
  "seberizeni",
  "vytrvalost",
  "komunikace",
  "energie",
  "uroven",
] as const
export type PolozkaHodnoceni = (typeof POLOZKY_HODNOCENI)[number]

/** Jak dlouho trenér sportovce vede. Kvalita kritéria na tom závisí. */
export const DELKA_VEDENI = ["do3", "3-12", "nad12"] as const
export type DelkaVedeni = (typeof DELKA_VEDENI)[number]

/** Jak často ho vidí v soutěži. */
export const CASTOST_POZOROVANI = ["zridka", "obcas", "pravidelne"] as const
export type CastostPozorovani = (typeof CASTOST_POZOROVANI)[number]

/** Stupnice 1 až 7. Chybějící hodnota znamená „nemohu posoudit“. */
export const HODNOTA_MIN = 1
export const HODNOTA_MAX = 7

/**
 * Hodnocení mladší než tolik dní se přepisuje, starší se přidává nové.
 *
 * Kritérium se sbírá dvakrát za sezonu. Když trenér hodnocení opraví týž
 * den nebo týden, je to oprava, ne druhé měření, a do analýzy nesmí vstoupit
 * dvakrát.
 */
export const PREPIS_DNI = 14

/** Hodnotí se jen sportovní varianty; byznysové položky by nedávaly smysl. */
export function hodnotiSe(testId: string): boolean {
  return testId.includes("sport")
}

export interface PolozkaTexty {
  otazka: string
  nizko: string
  vysoko: string
}

export interface TextyHodnoceni {
  titul: string
  uvod: string
  soukromi: string
  obdobi: string
  delkaOtazka: string
  delka: Record<DelkaVedeni, string>
  castostOtazka: string
  castost: Record<CastostPozorovani, string>
  polozky: Record<PolozkaHodnoceni, PolozkaTexty>
  nemohu: string
  ulozit: string
  ukladam: string
  ulozeno: string
  posledni: (datum: string) => string
  chybiKontext: string
  chybiHodnoty: string
  exportTitul: string
  exportPopis: string
  exportTlacitko: string
  exportPripravuji: string
}

const CS: TextyHodnoceni = {
  titul: "Hodnocení trenéra",
  uvod:
    "Pomáhá ověřit, že diagnostika předpovídá to, co vidíš v praxi. Sportovec ho neuvidí " +
    "a do jeho vyhodnocení se nepromítne.",
  soukromi:
    "Hodnocení vidíš jen ty. Do podkladu pro ověření diagnostiky se ukládá bez jména " +
    "a bez vazby na konkrétního člověka.",
  obdobi: "Hodnoť posledních osm týdnů, ne dojem z posledního zápasu.",
  delkaOtazka: "Jak dlouho sportovce vedeš?",
  delka: { do3: "méně než 3 měsíce", "3-12": "3 až 12 měsíců", nad12: "déle než rok" },
  castostOtazka: "Jak často ho vidíš v soutěži?",
  castost: { zridka: "zřídka", obcas: "občas", pravidelne: "pravidelně" },
  polozky: {
    tlak: {
      otazka: "Výkon v důležitých momentech",
      nizko: "v důležitých chvílích podává výrazně horší výkon než jindy",
      vysoko: "v důležitých chvílích hraje na hranici svých možností",
    },
    rozhodnost: {
      otazka: "Rozhodnost v závěrech",
      nizko: "v rozhodujících chvílích se stahuje a nechává akci jiným",
      vysoko: "v rozhodujících chvílích si akci bere na sebe",
    },
    navrat: {
      otazka: "Návrat po chybě",
      nizko: "po chybě se dlouho nevrátí do hry",
      vysoko: "po chybě je v další akci zpátky",
    },
    konzistence: {
      otazka: "Stálost výkonu",
      nizko: "dobré a špatné dny jsou od sebe hodně daleko",
      vysoko: "i špatný den je blízko běžné úrovně",
    },
    koucovatelnost: {
      otazka: "Práce se zpětnou vazbou",
      nizko: "zpětnou vazbu odmítá nebo ji nezapracuje",
      vysoko: "zpětnou vazbu přijme a rychle zapracuje",
    },
    seberizeni: {
      otazka: "Cílený trénink",
      nizko: "trénuje podle pokynů, bez vlastního cíle",
      vysoko: "ví, co chce na tréninku zlepšit, a vyhodnocuje to",
    },
    vytrvalost: {
      otazka: "Vytrvalost bez výsledků",
      nizko: "když se nedaří, polevuje v práci",
      vysoko: "pracuje stejně i v obdobích bez výsledků",
    },
    komunikace: {
      otazka: "Otevřenost v komunikaci",
      nizko: "o problémech mlčí, dokud nejsou velké",
      vysoko: "otevřeně mluví i o nepříjemných věcech",
    },
    energie: {
      otazka: "Energie a zotavení",
      nizko: "působí dlouhodobě unaveně a vyčerpaně",
      vysoko: "působí odpočatě a má energii",
    },
    uroven: {
      otazka: "Celková výkonnost",
      nizko: "výrazně pod úrovní srovnatelných sportovců ve své soutěži",
      vysoko: "mezi nejlepšími ve své soutěži",
    },
  },
  nemohu: "nemohu posoudit",
  ulozit: "Uložit hodnocení",
  ukladam: "Ukládám…",
  ulozeno: "Uloženo",
  posledni: (d) => `Naposledy hodnoceno ${d}. Nové hodnocení do 14 dní opraví to poslední.`,
  chybiKontext: "Vyber, jak dlouho sportovce vedeš a jak často ho vidíš v soutěži.",
  chybiHodnoty: "Ohodnoť aspoň polovinu položek; u ostatních můžeš zvolit „nemohu posoudit“.",
  exportTitul: "Hodnocení trenérů",
  exportPopis:
    "Odpovědi z testu spárované s hodnocením trenéra, podklad pro ověření validity. Bez jmen, " +
    "data narození a identifikátorů; sportovci mají pseudonym platný jen v jednom souboru.",
  exportTlacitko: "Stáhnout podklad",
  exportPripravuji: "Připravuji…",
}

const SK: TextyHodnoceni = {
  titul: "Hodnotenie trénera",
  uvod:
    "Pomáha overiť, že diagnostika predpovedá to, čo vidíš v praxi. Športovec ho neuvidí " +
    "a do jeho vyhodnotenia sa nepremietne.",
  soukromi:
    "Hodnotenie vidíš len ty. Do podkladu na overenie diagnostiky sa ukladá bez mena " +
    "a bez väzby na konkrétneho človeka.",
  obdobi: "Hodnoť posledných osem týždňov, nie dojem z posledného zápasu.",
  delkaOtazka: "Ako dlho športovca vedieš?",
  delka: { do3: "menej ako 3 mesiace", "3-12": "3 až 12 mesiacov", nad12: "dlhšie ako rok" },
  castostOtazka: "Ako často ho vidíš v súťaži?",
  castost: { zridka: "zriedka", obcas: "občas", pravidelne: "pravidelne" },
  polozky: {
    tlak: {
      otazka: "Výkon v dôležitých momentoch",
      nizko: "v dôležitých chvíľach podáva výrazne horší výkon ako inokedy",
      vysoko: "v dôležitých chvíľach hrá na hranici svojich možností",
    },
    rozhodnost: {
      otazka: "Rozhodnosť v záveroch",
      nizko: "v rozhodujúcich chvíľach sa sťahuje a necháva akciu iným",
      vysoko: "v rozhodujúcich chvíľach si akciu berie na seba",
    },
    navrat: {
      otazka: "Návrat po chybe",
      nizko: "po chybe sa dlho nevráti do hry",
      vysoko: "po chybe je v ďalšej akcii späť",
    },
    konzistence: {
      otazka: "Stálosť výkonu",
      nizko: "dobré a zlé dni sú od seba veľmi ďaleko",
      vysoko: "aj zlý deň je blízko bežnej úrovne",
    },
    koucovatelnost: {
      otazka: "Práca so spätnou väzbou",
      nizko: "spätnú väzbu odmieta alebo ju nezapracuje",
      vysoko: "spätnú väzbu prijme a rýchlo zapracuje",
    },
    seberizeni: {
      otazka: "Cielený tréning",
      nizko: "trénuje podľa pokynov, bez vlastného cieľa",
      vysoko: "vie, čo chce na tréningu zlepšiť, a vyhodnocuje to",
    },
    vytrvalost: {
      otazka: "Vytrvalosť bez výsledkov",
      nizko: "keď sa nedarí, poľavuje v práci",
      vysoko: "pracuje rovnako aj v obdobiach bez výsledkov",
    },
    komunikace: {
      otazka: "Otvorenosť v komunikácii",
      nizko: "o problémoch mlčí, kým nie sú veľké",
      vysoko: "otvorene hovorí aj o nepríjemných veciach",
    },
    energie: {
      otazka: "Energia a zotavenie",
      nizko: "pôsobí dlhodobo unavene a vyčerpane",
      vysoko: "pôsobí oddýchnuto a má energiu",
    },
    uroven: {
      otazka: "Celková výkonnosť",
      nizko: "výrazne pod úrovňou porovnateľných športovcov vo svojej súťaži",
      vysoko: "medzi najlepšími vo svojej súťaži",
    },
  },
  nemohu: "neviem posúdiť",
  ulozit: "Uložiť hodnotenie",
  ukladam: "Ukladám…",
  ulozeno: "Uložené",
  posledni: (d) => `Naposledy hodnotené ${d}. Nové hodnotenie do 14 dní opraví to posledné.`,
  chybiKontext: "Vyber, ako dlho športovca vedieš a ako často ho vidíš v súťaži.",
  chybiHodnoty: "Ohodnoť aspoň polovicu položiek; pri ostatných môžeš zvoliť „neviem posúdiť“.",
  exportTitul: "Hodnotenia trénerov",
  exportPopis:
    "Odpovede z testu spárované s hodnotením trénera, podklad na overenie validity. Bez mien, " +
    "dátumu narodenia a identifikátorov; športovci majú pseudonym platný len v jednom súbore.",
  exportTlacitko: "Stiahnuť podklad",
  exportPripravuji: "Pripravujem…",
}

const EN: TextyHodnoceni = {
  titul: "Coach rating",
  uvod:
    "It helps verify that the diagnostic predicts what you see in practice. The athlete " +
    "never sees it and it does not affect their evaluation.",
  soukromi:
    "Only you can see this rating. It is stored for validating the diagnostic without a " +
    "name and without any link to the individual.",
  obdobi: "Rate the last eight weeks, not your impression of the last game.",
  delkaOtazka: "How long have you been coaching this athlete?",
  delka: { do3: "less than 3 months", "3-12": "3 to 12 months", nad12: "more than a year" },
  castostOtazka: "How often do you see them compete?",
  castost: { zridka: "rarely", obcas: "sometimes", pravidelne: "regularly" },
  polozky: {
    tlak: {
      otazka: "Performance in important moments",
      nizko: "performs clearly worse in important moments than at other times",
      vysoko: "performs at the limit of their ability in important moments",
    },
    rozhodnost: {
      otazka: "Decisiveness at the end of games",
      nizko: "pulls back in decisive moments and leaves the play to others",
      vysoko: "takes the play on in decisive moments",
    },
    navrat: {
      otazka: "Recovery after a mistake",
      nizko: "takes a long time to get back into the game after a mistake",
      vysoko: "is back in the very next play after a mistake",
    },
    konzistence: {
      otazka: "Consistency of performance",
      nizko: "good and bad days are very far apart",
      vysoko: "even a bad day is close to their usual level",
    },
    koucovatelnost: {
      otazka: "Working with feedback",
      nizko: "rejects feedback or does not act on it",
      vysoko: "accepts feedback and acts on it quickly",
    },
    seberizeni: {
      otazka: "Purposeful training",
      nizko: "trains as instructed, without their own goal",
      vysoko: "knows what they want to improve in practice and reviews it",
    },
    vytrvalost: {
      otazka: "Persistence without results",
      nizko: "eases off when things are not going well",
      vysoko: "works just as hard through periods without results",
    },
    komunikace: {
      otazka: "Openness in communication",
      nizko: "stays quiet about problems until they are big",
      vysoko: "talks openly even about uncomfortable things",
    },
    energie: {
      otazka: "Energy and recovery",
      nizko: "seems tired and drained for long periods",
      vysoko: "seems rested and has energy",
    },
    uroven: {
      otazka: "Overall performance level",
      nizko: "clearly below comparable athletes in their competition",
      vysoko: "among the best in their competition",
    },
  },
  nemohu: "cannot judge",
  ulozit: "Save rating",
  ukladam: "Saving…",
  ulozeno: "Saved",
  posledni: (d) => `Last rated ${d}. A new rating within 14 days replaces the last one.`,
  chybiKontext: "Choose how long you have coached the athlete and how often you see them compete.",
  chybiHodnoty: "Rate at least half of the items; for the rest you can choose \"cannot judge\".",
  exportTitul: "Coach ratings",
  exportPopis:
    "Test answers paired with coach ratings, for validating the diagnostic. No names, dates " +
    "of birth or identifiers; athletes get a pseudonym that holds within one file only.",
  exportTlacitko: "Download data",
  exportPripravuji: "Preparing…",
}

export const HODNOCENI_TEXTY: Record<Lang, TextyHodnoceni> = { cs: CS, sk: SK, en: EN }

/**
 * Aspoň polovina položek musí mít hodnotu.
 *
 * „Nemohu posoudit“ je legitimní odpověď a v analýze je lepší než odhad.
 * Hodnocení, kde je posouditelné méně než pět věcí, ale o sportovci nic
 * spolehlivého neříká.
 */
export function dostVyplneno(hodnoty: Partial<Record<PolozkaHodnoceni, number>>): boolean {
  const vyplnenych = POLOZKY_HODNOCENI.filter((p) => typeof hodnoty[p] === "number").length
  return vyplnenych * 2 >= POLOZKY_HODNOCENI.length
}
