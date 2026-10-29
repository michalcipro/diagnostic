import type { Lang } from "../diagnostic/types"
import { obsahArchetypu } from "./content"
import { NAZVY_MOTIVACI, POPISY_MOTIVACI, archetyp } from "./structure"
import type { ArchetypObsah, Motivace, Varianta, VysledekArchetypu, Vyhraneni } from "./types"

// Skládané věty vyhodnocení: vyhranění profilu, souhra primárního a
// sekundárního archetypu, potlačený archetyp a shrnutí pro klienta.
//
// Věty se skládají z čísel a názvů, proto jsou tady a ne v datech obsahu.
// Formulace se vyhýbají minulému času a přídavným jménům vztaženým
// k respondentovi, aby nepotřebovaly rodové tvary.
//
// Každý jazyk má vlastní sadu vět v tabulce `VETY`. Dřív tady stálo větvení
// `if (lang === "sk")` a všechno ostatní spadlo do češtiny, takže anglický
// klient dostal české shrnutí. Typ `Record<Lang, SadaVet>` jazyk vynechat
// nedovolí.

export interface SpojeniArchetypu {
  /** co znamená odstup prvních dvou */
  vyhraneni: string
  /** primární a sekundární dohromady: stejná, nebo různá motivace */
  kombinace: string
  /** nejslabší archetyp jako slepé místo */
  potlaceny: string
  /** shrnutí pro klienta */
  souhrn: string
  /** poslední krok: jak s návodem naložit */
  kdeZacit: string
}

/** Vše, co skládané věty potřebují; sestaví se jednou a předá každé z nich. */
interface Kontext {
  P: ArchetypObsah
  S: ArchetypObsah
  Z: ArchetypObsah
  /** odstup prvních dvou už jako hotový text („3 body“) */
  odstup: string
  odstupN: number
  /** rozdíl nejvyššího a nejnižšího archetypu jako hotový text */
  rozpeti: string
  rozpetiN: number
  /** archetypy se stejným skóre jako primární, včetně něj */
  naCele: ArchetypObsah[]
  /** archetypy se stejným skóre jako potlačený, včetně něj */
  naKonci: ArchetypObsah[]
  /** sportovní varianta se od byznysové liší ve všech pěti větách */
  sport: boolean
  vyhraneni: Vyhraneni
  skorePotlaceneho: number
  stejnaSkupina: boolean
  skupinaP: Motivace
  skupinaS: Motivace
  nazvySkupin: Record<Motivace, string>
  popisySkupin: Record<Motivace, string>
}

interface SadaVet {
  /** počítání bodů; čeština a slovenština skloňují, angličtina ne */
  body: (n: number) => string
  vyhraneni: (k: Kontext) => string
  kombinace: (k: Kontext) => string
  potlaceny: (k: Kontext) => string
  /** shrnutí bez slepého místa: identita a druhý hlas */
  souhrnUvod: (k: Kontext) => string
  /** věta o jednom slepém místě, připojí se ke shrnutí */
  slepeMisto: (k: Kontext) => string
  kdeZacit: (k: Kontext) => string
}

/**
 * Věty pro shody a plochý profil.
 *
 * Řazení při shodě skóre rozhoduje počet silných odpovědí a pak pořadí
 * v registru, ať je výsledek stabilní. Věty ale nesmějí tvrdit, že jeden
 * archetyp vede nebo nejméně rezonuje, když má stejné skóre jako jiný. Dřív
 * dostal respondent se všemi odpověďmi 4 primární Neviňátko a potlačeného
 * Vládce, přestože všech dvanáct mělo 32 bodů.
 */
interface SadaShod {
  /** výčet názvů: „A a B“, „A, B a C“ */
  jmena: (nazvy: string[]) => string
  vyhraneniPlochy: (k: Kontext) => string
  /** první dva (nebo víc) se stejným skóre */
  vyhraneniShoda: (k: Kontext) => string
  kombinacePlocha: (k: Kontext) => string
  /** dva nebo tři archetypy se stejným nejnižším skóre */
  potlacenyVic: (k: Kontext) => string
  /** čtyři a víc archetypů se stejným nejnižším skóre */
  potlacenyMnoho: (k: Kontext) => string
  potlacenyPlochy: (k: Kontext) => string
  souhrnVedeVic: (k: Kontext) => string
  slepaMista: (k: Kontext) => string
  souhrnPlochy: (k: Kontext) => string
  kdeZacitPlochy: (k: Kontext) => string
}

const VETY: Record<Lang, SadaVet> = {
  cs: {
    body: (n) => (n === 1 ? "1 bod" : n >= 2 && n <= 4 ? `${n} body` : `${n} bodů`),

    vyhraneni: ({ P, odstup, sport, vyhraneni }) =>
      vyhraneni === "vyhraneny"
        ? sport
          ? `Profil je vyhraněný: ${P.nazev} má před druhým v pořadí náskok ${odstup}. Víš, co tě žene, a to se dá v přípravě i v závodě využít naplno.`
          : `Profil je vyhraněný: ${P.nazev} má před druhým v pořadí náskok ${odstup}. Identita značky je jednoznačná a dá se na ní stavět bez velkého vyjednávání.`
        : vyhraneni === "zretelny"
          ? sport
            ? `Profil je zřetelný: ${P.nazev} vede o ${odstup}. Vedle něj je slyšet i druhý hlas, který ho doplňuje, ale nepřekřikuje.`
            : `Profil je zřetelný: ${P.nazev} vede o ${odstup}. Vedle něj je slyšet i druhý hlas, který identitu doplňuje, ale nepřekřikuje.`
          : sport
            ? `První dva archetypy dělí jen ${odstup}, proto je čti jako dvojici, která vede společně. O tom, který z nich se právě ozve, rozhoduje situace: trénink, zápas nebo krize umí zapnout jinou polohu.`
            : `První dva archetypy dělí jen ${odstup}, proto je čti jako dvojici, která vede společně. O tom, který z nich právě mluví, rozhoduje situace, ne pořadí v tabulce.`,

    kombinace: ({ P, S, sport, stejnaSkupina, skupinaP, skupinaS, nazvySkupin, popisySkupin }) =>
      stejnaSkupina
        ? sport
          ? `${P.nazev} i ${S.nazev} čerpají ze stejné motivace, které kniha říká ${nazvySkupin[skupinaP].toLowerCase()}: ${popisySkupin[skupinaP]}. Oba hlasy táhnou stejným směrem, takže výkon má jasnou barvu; o to důsledněji hlídej, co v profilu chybí, protože tam bude i slepá strana.`
          : `${P.nazev} i ${S.nazev} čerpají ze stejné motivace, které kniha říká ${nazvySkupin[skupinaP].toLowerCase()}: ${popisySkupin[skupinaP]}. Oba hlasy táhnou stejným směrem, takže značka působí konzistentně sama od sebe; o to důsledněji hlídej, aby jí neutekl zbytek mapy.`
        : sport
          ? `${P.nazev} stojí na motivaci ${nazvySkupin[skupinaP].toLowerCase()} (${popisySkupin[skupinaP]}), ${S.nazev} přidává motivaci ${nazvySkupin[skupinaS].toLowerCase()} (${popisySkupin[skupinaS]}). Takové spojení dává větší rozpětí, ale i vnitřní napětí: v těžkých chvílích tě každý z těch hlasů posílá jinam. Pojmenujte dopředu, který má v den soutěže přednost.`
          : `${P.nazev} stojí na motivaci ${nazvySkupin[skupinaP].toLowerCase()} (${popisySkupin[skupinaP]}), ${S.nazev} přidává motivaci ${nazvySkupin[skupinaS].toLowerCase()} (${popisySkupin[skupinaS]}). Takové spojení má větší rozpětí, ale chce jasné role: primární archetyp určuje, o čem značka je, sekundární jen to, jak se to projevuje. Když se role prohodí, značka mluví dvěma hlasy najednou a trh jí přestane rozumět.`,

    potlaceny: ({ Z, sport, skorePotlaceneho }) =>
      sport
        ? `Nejméně rezonuje ${Z.nazev}: ${skorePotlaceneho} bodů ze 48. To není chyba. Znamená to, že ${Z.dar} nejsou zdrojem, ze kterého přirozeně čerpáš. Počítej s tím v situacích, které tuhle polohu vyžadují: buď ji obsluž vědomě, nebo se v ní opři o lidi kolem sebe.`
        : `Nejméně rezonuje ${Z.nazev}: ${skorePotlaceneho} bodů ze 48. To není chyba. Znamená to, že ${Z.dar} nejsou zdrojem, ze kterého přirozeně čerpáš. Počítej s tím v situacích, které tuhle polohu vyžadují: buď ji obsluž vědomě, nebo si na ni přiber člověka, kterému je vlastní.`,

    slepeMisto: ({ Z, sport }) =>
      sport
        ? `A počítej se slepým místem: poloha, které kniha říká ${Z.nazev}, ti není vlastní, tak ji netlač silou a radši se v ní opři o lidi kolem sebe.`
        : `A pamatuj na slepé místo: poloha, které kniha říká ${Z.nazev}, ti není vlastní, tak ji nepředstírej a radši si ji do firmy přiber.`,

    souhrnUvod: ({ P, S, sport }) =>
      sport
        ? `Tvoje soutěžní identita má nejblíž k archetypu ${P.nazev}. Jeho motto „${P.motto}“ není heslo na zeď, ale zkratka toho, odkud ti jde energie: ${P.dar}. Druhý hlas, ${S.nazev}, tomu dává barvu a ozve se hlavně tehdy, když je situace nejistá.`
        : `Tvojí značce je nejpřirozenější hlas archetypu ${P.nazev}. Jeho motto „${P.motto}“ není slogan k vyvěšení, ale zkratka toho, co ti zákazníci věří: ${P.dar}. Druhý hlas, ${S.nazev}, drž v roli koření, ne druhého kuchaře.`,

    kdeZacit: ({ sport }) =>
      sport
        ? `Vyberte si z návodu jeden krok, který jde zkusit v nejbližším tréninkovém cyklu, a domluvte se, podle čeho poznáte, že zabral. Archetyp se nemění, mění se to, jak se s ním pracuje.`
        : `Vyber si z návodu jeden krok, který jde udělat do týdne, a udělej ho. Archetyp se nebuduje deklarací, ale opakovanou zkušeností, kterou se značkou udělá zákazník.`,
  },

  sk: {
    body: (n) => (n === 1 ? "1 bod" : n >= 2 && n <= 4 ? `${n} body` : `${n} bodov`),

    vyhraneni: ({ P, odstup, sport, vyhraneni }) =>
      vyhraneni === "vyhraneny"
        ? sport
          ? `Profil je vyhranený: ${P.nazev} má pred druhým v poradí náskok ${odstup}. Vieš, čo ťa ženie, a to sa dá v príprave aj v pretekoch využiť naplno.`
          : `Profil je vyhranený: ${P.nazev} má pred druhým v poradí náskok ${odstup}. Identita značky je jednoznačná a dá sa na nej stavať bez veľkého vyjednávania.`
        : vyhraneni === "zretelny"
          ? sport
            ? `Profil je zreteľný: ${P.nazev} vedie o ${odstup}. Vedľa neho je počuť aj druhý hlas, ktorý ho dopĺňa, ale neprekrikuje.`
            : `Profil je zreteľný: ${P.nazev} vedie o ${odstup}. Vedľa neho je počuť aj druhý hlas, ktorý identitu dopĺňa, ale neprekrikuje.`
          : sport
            ? `Prvé dva archetypy delí iba ${odstup}, preto ich čítaj ako dvojicu, ktorá vedie spoločne. O tom, ktorý z nich sa práve ozve, rozhoduje situácia: tréning, zápas alebo kríza môžu zapnúť rôzne polohy.`
            : `Prvé dva archetypy delí iba ${odstup}, preto ich čítaj ako dvojicu, ktorá vedie spoločne. O tom, ktorý z nich práve hovorí, rozhoduje situácia, nie poradie v tabuľke.`,

    kombinace: ({ P, S, sport, stejnaSkupina, skupinaP, skupinaS, nazvySkupin, popisySkupin }) =>
      stejnaSkupina
        ? sport
          ? `${P.nazev} aj ${S.nazev} čerpajú z rovnakej motivácie, ktorú kniha volá ${nazvySkupin[skupinaP].toLowerCase()}: ${popisySkupin[skupinaP]}. Oba hlasy ťahajú rovnakým smerom, takže výkon má jasnú farbu; o to dôslednejšie stráž, čo v profile chýba, lebo tam bude aj tvoja slepá strana.`
          : `${P.nazev} aj ${S.nazev} čerpajú z rovnakej motivácie, ktorú kniha volá ${nazvySkupin[skupinaP].toLowerCase()}: ${popisySkupin[skupinaP]}. Oba hlasy ťahajú rovnakým smerom, takže značka pôsobí konzistentne sama od seba; o to dôslednejšie stráž, aby jej neušiel zvyšok mapy.`
        : sport
          ? `${P.nazev} stojí na motivácii ${nazvySkupin[skupinaP].toLowerCase()} (${popisySkupin[skupinaP]}), ${S.nazev} pridáva motiváciu ${nazvySkupin[skupinaS].toLowerCase()} (${popisySkupin[skupinaS]}). Také spojenie dáva väčší rozsah, ale aj vnútorné napätie: v ťažkých chvíľach ťa každý z tých hlasov posiela inam. Pomenuj vopred, ktorý má v deň súťaže prednosť.`
          : `${P.nazev} stojí na motivácii ${nazvySkupin[skupinaP].toLowerCase()} (${popisySkupin[skupinaP]}), ${S.nazev} pridáva motiváciu ${nazvySkupin[skupinaS].toLowerCase()} (${popisySkupin[skupinaS]}). Také spojenie má väčší rozsah, ale chce jasné roly: primárny archetyp určuje, o čom značka je, sekundárny iba to, ako sa to prejavuje. Keď sa role prehodia, značka hovorí dvoma hlasmi naraz a trh jej prestane rozumieť.`,

    potlaceny: ({ Z, sport, skorePotlaceneho }) =>
      sport
        ? `Najmenej rezonuje ${Z.nazev}: ${skorePotlaceneho} bodov zo 48. To nie je chyba. Znamená to, že ${Z.dar} nie sú zdrojom, z ktorého prirodzene čerpáš. Počítaj s tým v situáciách, ktoré túto polohu vyžadujú: buď ju obslúž vedome, alebo sa v nej opri o ľudí okolo seba.`
        : `Najmenej rezonuje ${Z.nazev}: ${skorePotlaceneho} bodov zo 48. To nie je chyba. Znamená to, že ${Z.dar} nie sú zdrojom, z ktorého prirodzene čerpáš. Počítaj s tým v situáciách, ktoré túto polohu vyžadujú: buď ju obslúž vedome, alebo si na ňu priber človeka, ktorému je vlastná.`,

    slepeMisto: ({ Z, sport }) =>
      sport
        ? `A rátaj so slepým miestom: poloha, ktorú kniha volá ${Z.nazev}, ti nie je vlastná, takže ju netlač silou a radšej sa v nej opri o ľudí okolo seba.`
        : `A pamätaj na slepé miesto: poloha, ktorú kniha volá ${Z.nazev}, ti nie je vlastná, tak ju nepredstieraj a radšej si ju do firmy priber.`,

    souhrnUvod: ({ P, S, sport }) =>
      sport
        ? `Tvoja súťažná identita má najbližšie k archetypu ${P.nazev}. Jeho motto „${P.motto}“ nie je heslo na stenu, ale skratka toho, odkiaľ ti ide energia: ${P.dar}. Druhý hlas, ${S.nazev}, ju farbí a ukazuje sa najmä vtedy, keď je situácia neistá.`
        : `Tvojej značke je najprirodzenejší hlas archetypu ${P.nazev}. Jeho motto „${P.motto}“ nie je slogan na vyvesenie, ale skratka toho, čo ti zákazníci veria: ${P.dar}. Druhý hlas, ${S.nazev}, drž v úlohe korenia, nie druhého kuchára.`,

    kdeZacit: ({ sport }) =>
      sport
        ? `Vyberte si z návodu jeden krok, ktorý sa dá skúsiť v najbližšom tréningovom cykle, a dohodnite sa, podľa čoho spoznáte, že zabral. Archetyp sa nemení, mení sa to, ako sa s ním pracuje.`
        : `Vyber si z návodu jeden krok, ktorý sa dá urobiť do týždňa, a urob ho. Archetyp sa nebuduje deklaráciou, ale opakovanou skúsenosťou, ktorú so značkou urobí zákazník.`,
  },

  en: {
    body: (n) => (n === 1 ? "1 point" : `${n} points`),

    vyhraneni: ({ P, odstup, odstupN, sport, vyhraneni }) =>
      vyhraneni === "vyhraneny"
        ? sport
          ? `The profile is sharply defined: ${P.nazev} leads the runner-up by ${odstup}. You know what drives you, and that can be used to the full in training and on the day.`
          : `The profile is sharply defined: ${P.nazev} leads the runner-up by ${odstup}. The brand's identity is unambiguous and can be built on without much negotiation.`
        : vyhraneni === "zretelny"
          ? sport
            ? `The profile is clearly defined: ${P.nazev} leads by ${odstup}. A second voice is audible beside it, one that complements it rather than shouting it down.`
            : `The profile is clearly defined: ${P.nazev} leads by ${odstup}. A second voice is audible beside it, one that complements the identity rather than shouting it down.`
          : sport
            ? `Only ${odstup} ${odstupN === 1 ? "separates" : "separate"} the first two archetypes, so read them as a pair that leads together. Which of them speaks up at any moment is decided by the situation: training, competition and crisis can switch on different sides of you.`
            : `Only ${odstup} ${odstupN === 1 ? "separates" : "separate"} the first two archetypes, so read them as a pair that leads together. Which of them is speaking is decided by the situation, not by the order in the table.`,

    kombinace: ({ P, S, sport, stejnaSkupina, skupinaP, skupinaS, nazvySkupin, popisySkupin }) =>
      stejnaSkupina
        ? sport
          ? `${P.nazev} and ${S.nazev} both draw on the same motivation, which the book calls ${nazvySkupin[skupinaP].toLowerCase()}: ${popisySkupin[skupinaP]}. Both voices pull the same way, so your performance has a clear colour; all the more reason to watch what is missing from the profile, because that is where your blind side will be.`
          : `${P.nazev} and ${S.nazev} both draw on the same motivation, which the book calls ${nazvySkupin[skupinaP].toLowerCase()}: ${popisySkupin[skupinaP]}. Both voices pull the same way, so the brand comes across as consistent without effort; all the more reason to make sure the rest of the map does not escape it.`
        : sport
          ? `${P.nazev} rests on the motivation of ${nazvySkupin[skupinaP].toLowerCase()} (${popisySkupin[skupinaP]}), while ${S.nazev} adds the motivation of ${nazvySkupin[skupinaS].toLowerCase()} (${popisySkupin[skupinaS]}). That combination gives you greater range, but also inner tension: in hard moments each of those voices sends you somewhere else. Agree in advance which one takes priority on competition day.`
          : `${P.nazev} rests on the motivation of ${nazvySkupin[skupinaP].toLowerCase()} (${popisySkupin[skupinaP]}), while ${S.nazev} adds the motivation of ${nazvySkupin[skupinaS].toLowerCase()} (${popisySkupin[skupinaS]}). That combination has greater range, but it needs clear roles: the primary archetype decides what the brand is about, the secondary only how that shows. Swap the roles and the brand speaks in two voices at once, and the market stops understanding it.`,

    potlaceny: ({ Z, sport, skorePotlaceneho }) =>
      sport
        ? `${Z.nazev} resonates least: ${skorePotlaceneho} points of 48. That is not a fault. It means ${Z.dar} are not a source you naturally draw on. Allow for it in situations that call for that side: either serve it deliberately, or lean on the people around you there.`
        : `${Z.nazev} resonates least: ${skorePotlaceneho} points of 48. That is not a fault. It means ${Z.dar} are not a source you naturally draw on. Allow for it in situations that call for that side: either serve it deliberately, or bring in someone for whom it comes naturally.`,

    slepeMisto: ({ Z, sport }) =>
      sport
        ? `And allow for the blind spot: the side the book calls ${Z.nazev} does not come naturally to you, so do not force it and lean on the people around you instead.`
        : `And remember the blind spot: the side the book calls ${Z.nazev} does not come naturally to you, so do not fake it and bring it into the company instead.`,

    souhrnUvod: ({ P, S, sport }) =>
      sport
        ? `Your competitive identity is closest to the ${P.nazev} archetype. Its motto, “${P.motto}”, is not a slogan for the wall but shorthand for where your energy comes from: ${P.dar}. The second voice, ${S.nazev}, gives it colour and speaks up mainly when the situation is uncertain.`
        : `The voice that comes most naturally to your brand is the ${P.nazev} archetype. Its motto, “${P.motto}”, is not a slogan to hang on the wall but shorthand for what your customers believe of you: ${P.dar}. Keep the second voice, ${S.nazev}, in the role of seasoning, not second chef.`,

    kdeZacit: ({ sport }) =>
      sport
        ? `Pick one step from the guidance that can be tried in the next training cycle, and agree how you will know it worked. The archetype does not change; what changes is how you work with it.`
        : `Pick one step from the guidance that can be done within a week, and do it. An archetype is not built by declaration but by the repeated experience a customer has with the brand.`,
  },
}

const jmenaSpojkou = (spojka: string) => (nazvy: string[]) =>
  nazvy.length <= 1 ? (nazvy[0] ?? "") : `${nazvy.slice(0, -1).join(", ")} ${spojka} ${nazvy[nazvy.length - 1]}`

const nazvy = (xs: ArchetypObsah[]) => xs.map((x) => x.nazev)
/** „Mág (proměna…), Hrdina (odvaha…)“: dar v závorce zůstává v 1. pádě. */
const sDary = (xs: ArchetypObsah[]) => xs.map((x) => `${x.nazev} (${x.dar})`)

const VETY_SHOD: Record<Lang, SadaShod> = {
  cs: {
    jmena: jmenaSpojkou("a"),
    vyhraneniPlochy: ({ rozpeti, rozpetiN }) =>
      rozpetiN === 0
        ? "Profil je plochý: všech dvanáct archetypů má stejné skóre. Žádný hlas nad ostatními nevystupuje, takže pořadí v tabulce tady nic neříká. Stojí za to probrat s koučem, jak se ti odpovídalo: když dostane většina tvrzení stejnou hodnotu, bývá za tím spíš opatrnost nebo únava než skutečný profil."
        : `Profil je plochý: nejvyšší a nejnižší archetyp dělí jen ${rozpeti}. Žádný hlas nad ostatními nevystupuje, takže pořadí v tabulce tady nic neříká. Stojí za to probrat s koučem, jak se ti odpovídalo: když dostane většina tvrzení podobnou hodnotu, bývá za tím spíš opatrnost nebo únava než skutečný profil.`,
    vyhraneniShoda: ({ naCele, sport }) =>
      `${VETY_SHOD.cs.jmena(nazvy(naCele))} mají stejné skóre, proto je čti jako ${naCele.length === 2 ? "dvojici" : "skupinu"}, která vede společně. ` +
      (sport
        ? "O tom, který z nich se právě ozve, rozhoduje situace: trénink, zápas nebo krize umí zapnout jinou polohu."
        : "O tom, který z nich právě mluví, rozhoduje situace, ne pořadí v tabulce."),
    kombinacePlocha: () =>
      "Když mají všechny archetypy skoro stejné skóre, nedá se říct, které dva spolu vedou, a tím ani to, jak spolu ladí. Souhru archetypů z tohoto vyplnění vyčíst nejde.",
    potlacenyVic: ({ naKonci, skorePotlaceneho, sport }) =>
      `Nejméně rezonují ${VETY_SHOD.cs.jmena(nazvy(naKonci))}, shodně ${skorePotlaceneho} bodů ze 48. To není chyba. Znamená to, že tyhle zdroje nejsou ty, ze kterých přirozeně čerpáš: ${VETY_SHOD.cs.jmena(sDary(naKonci))}. ` +
      (sport
        ? "Počítej s tím v situacích, které tyhle polohy vyžadují: buď je obsluž vědomě, nebo se v nich opři o lidi kolem sebe."
        : "Počítej s tím v situacích, které tyhle polohy vyžadují: buď je obsluž vědomě, nebo si na ně přiber lidi, kterým jsou vlastní."),
    potlacenyMnoho: ({ naKonci, skorePotlaceneho, sport }) =>
      `Nejnižší skóre, shodně ${skorePotlaceneho} bodů ze 48, má víc archetypů najednou: ${VETY_SHOD.cs.jmena(nazvy(naKonci))}. Jedno slepé místo z toho určit nejde a pořadí mezi nimi nic neznamená. Všímej si spíš toho, jak daleko jsou od archetypů na čele: ${sport ? "to jsou polohy, které v zápase samy nenaskočí." : "to jsou polohy, které značka sama od sebe neukáže."}`,
    potlacenyPlochy: ({ rozpetiN, sport }) =>
      `Slepé místo se z plochého profilu určit nedá: nejnižší archetyp má ${rozpetiN === 0 ? "stejné" : "skoro stejné"} skóre jako nejvyšší. ${sport ? "Nejdřív je potřeba zjistit, co tě v soutěži opravdu žene." : "Nejdřív je potřeba zjistit, co má značka opravdu říkat."}`,
    souhrnVedeVic: ({ naCele, sport }) =>
      sport
        ? `Tvoje soutěžní identita má stejně blízko k archetypům ${VETY_SHOD.cs.jmena(nazvy(naCele))}. Žádný z nich nevede, proto je čti jako ${naCele.length === 2 ? "dvojici" : "skupinu"}, ve které o slovo rozhoduje situace: trénink, zápas nebo krize umí zapnout jinou polohu. Energie ti jde z každého z nich: ${VETY_SHOD.cs.jmena(sDary(naCele))}.`
        : `Tvojí značce jsou stejně přirozené hlasy archetypů ${VETY_SHOD.cs.jmena(nazvy(naCele))}. Žádný z nich nevede, proto se vědomě rozhodni, který bude značku nést navenek, a ostatní drž v roli koření; jinak značka mluví víc hlasy najednou a trh jí přestane rozumět. Co ti zákazníci věří: ${VETY_SHOD.cs.jmena(sDary(naCele))}.`,
    slepaMista: ({ naKonci, sport }) =>
      sport
        ? `A počítej se slepými místy: polohy, kterým kniha říká ${VETY_SHOD.cs.jmena(nazvy(naKonci))}, ti nejsou vlastní, tak je netlač silou a radši se v nich opři o lidi kolem sebe.`
        : `A pamatuj na slepá místa: polohy, kterým kniha říká ${VETY_SHOD.cs.jmena(nazvy(naKonci))}, ti nejsou vlastní, tak je nepředstírej a radši si je do firmy přiber.`,
    souhrnPlochy: ({ rozpetiN, sport }) =>
      `Z odpovědí nevystupuje žádný archetyp nad ostatní, všech dvanáct má ${rozpetiN === 0 ? "stejné" : "skoro stejné"} skóre. Výsledek proto nejde číst jako ${sport ? "soutěžní identitu" : "hlas značky"}. Užitečnější je probrat s koučem, jak se ti odpovídalo, a případně dotazník zopakovat v klidu a bez spěchu.`,
    kdeZacitPlochy: () =>
      "Návod k archetypu na prvním místě ber u plochého profilu jen jako inspiraci, ne jako plán: pořadí tu stojí na rozdílech, které nic neznamenají. Nejdřív si s koučem ověř, co z výsledku opravdu sedí.",
  },

  sk: {
    jmena: jmenaSpojkou("a"),
    vyhraneniPlochy: ({ rozpeti, rozpetiN }) =>
      rozpetiN === 0
        ? "Profil je plochý: všetkých dvanásť archetypov má rovnaké skóre. Žiadny hlas nad ostatnými nevystupuje, takže poradie v tabuľke tu nič nehovorí. Oplatí sa prebrať s koučom, ako sa ti odpovedalo: keď dostane väčšina tvrdení rovnakú hodnotu, býva za tým skôr opatrnosť alebo únava než skutočný profil."
        : `Profil je plochý: najvyšší a najnižší archetyp delí iba ${rozpeti}. Žiadny hlas nad ostatnými nevystupuje, takže poradie v tabuľke tu nič nehovorí. Oplatí sa prebrať s koučom, ako sa ti odpovedalo: keď dostane väčšina tvrdení podobnú hodnotu, býva za tým skôr opatrnosť alebo únava než skutočný profil.`,
    vyhraneniShoda: ({ naCele, sport }) =>
      `${VETY_SHOD.sk.jmena(nazvy(naCele))} majú rovnaké skóre, preto ich čítaj ako ${naCele.length === 2 ? "dvojicu" : "skupinu"}, ktorá vedie spoločne. ` +
      (sport
        ? "O tom, ktorý z nich sa práve ozve, rozhoduje situácia: tréning, zápas alebo kríza môžu zapnúť rôzne polohy."
        : "O tom, ktorý z nich práve hovorí, rozhoduje situácia, nie poradie v tabuľke."),
    kombinacePlocha: () =>
      "Keď majú všetky archetypy skoro rovnaké skóre, nedá sa povedať, ktoré dva spolu vedú, a tým ani to, ako spolu ladia. Súhru archetypov z tohto vyplnenia vyčítať nejde.",
    potlacenyVic: ({ naKonci, skorePotlaceneho, sport }) =>
      `Najmenej rezonujú ${VETY_SHOD.sk.jmena(nazvy(naKonci))}, zhodne ${skorePotlaceneho} bodov zo 48. To nie je chyba. Znamená to, že tieto zdroje nie sú tie, z ktorých prirodzene čerpáš: ${VETY_SHOD.sk.jmena(sDary(naKonci))}. ` +
      (sport
        ? "Počítaj s tým v situáciách, ktoré tieto polohy vyžadujú: buď ich obslúž vedome, alebo sa v nich opri o ľudí okolo seba."
        : "Počítaj s tým v situáciách, ktoré tieto polohy vyžadujú: buď ich obslúž vedome, alebo si na ne priber ľudí, ktorým sú vlastné."),
    potlacenyMnoho: ({ naKonci, skorePotlaceneho, sport }) =>
      `Najnižšie skóre, zhodne ${skorePotlaceneho} bodov zo 48, má viac archetypov naraz: ${VETY_SHOD.sk.jmena(nazvy(naKonci))}. Jedno slepé miesto sa z toho určiť nedá a poradie medzi nimi nič neznamená. Všímaj si skôr toho, ako ďaleko sú od archetypov na čele: ${sport ? "to sú polohy, ktoré v zápase samy nenaskočia." : "to sú polohy, ktoré značka sama od seba neukáže."}`,
    potlacenyPlochy: ({ rozpetiN, sport }) =>
      `Slepé miesto sa z plochého profilu určiť nedá: najnižší archetyp má ${rozpetiN === 0 ? "rovnaké" : "skoro rovnaké"} skóre ako najvyšší. ${sport ? "Najprv treba zistiť, čo ťa v súťaži naozaj ženie." : "Najprv treba zistiť, čo má značka naozaj hovoriť."}`,
    souhrnVedeVic: ({ naCele, sport }) =>
      sport
        ? `Tvoja súťažná identita má rovnako blízko k archetypom ${VETY_SHOD.sk.jmena(nazvy(naCele))}. Žiadny z nich nevedie, preto ich čítaj ako ${naCele.length === 2 ? "dvojicu" : "skupinu"}, v ktorej o slovo rozhoduje situácia: tréning, zápas alebo kríza môžu zapnúť rôzne polohy. Energia ti ide z každého z nich: ${VETY_SHOD.sk.jmena(sDary(naCele))}.`
        : `Tvojej značke sú rovnako prirodzené hlasy archetypov ${VETY_SHOD.sk.jmena(nazvy(naCele))}. Žiadny z nich nevedie, preto sa vedome rozhodni, ktorý bude značku niesť navonok, a ostatné drž v úlohe korenia; inak značka hovorí viacerými hlasmi naraz a trh jej prestane rozumieť. Čo ti zákazníci veria: ${VETY_SHOD.sk.jmena(sDary(naCele))}.`,
    slepaMista: ({ naKonci, sport }) =>
      sport
        ? `A rátaj so slepými miestami: polohy, ktoré kniha volá ${VETY_SHOD.sk.jmena(nazvy(naKonci))}, ti nie sú vlastné, takže ich netlač silou a radšej sa v nich opri o ľudí okolo seba.`
        : `A pamätaj na slepé miesta: polohy, ktoré kniha volá ${VETY_SHOD.sk.jmena(nazvy(naKonci))}, ti nie sú vlastné, tak ich nepredstieraj a radšej si ich do firmy priber.`,
    souhrnPlochy: ({ rozpetiN, sport }) =>
      `Z odpovedí nevystupuje žiadny archetyp nad ostatné, všetkých dvanásť má ${rozpetiN === 0 ? "rovnaké" : "skoro rovnaké"} skóre. Výsledok preto nejde čítať ako ${sport ? "súťažnú identitu" : "hlas značky"}. Užitočnejšie je prebrať s koučom, ako sa ti odpovedalo, a prípadne dotazník zopakovať v pokoji a bez zhonu.`,
    kdeZacitPlochy: () =>
      "Návod k archetypu na prvom mieste ber pri plochom profile len ako inšpiráciu, nie ako plán: poradie tu stojí na rozdieloch, ktoré nič neznamenajú. Najprv si s koučom over, čo z výsledku naozaj sedí.",
  },

  en: {
    jmena: jmenaSpojkou("and"),
    vyhraneniPlochy: ({ rozpeti, rozpetiN }) =>
      rozpetiN === 0
        ? "The profile is flat: all twelve archetypes have the same score. No voice stands out above the others, so the order in the table says nothing here. It is worth talking through with your coach how answering felt: when most statements get the same value, caution or fatigue is usually behind it rather than a real profile."
        : `The profile is flat: only ${rozpeti} ${rozpetiN === 1 ? "separates" : "separate"} the highest and the lowest archetype. No voice stands out above the others, so the order in the table says nothing here. It is worth talking through with your coach how answering felt: when most statements get a similar value, caution or fatigue is usually behind it rather than a real profile.`,
    vyhraneniShoda: ({ naCele, sport }) =>
      `${VETY_SHOD.en.jmena(nazvy(naCele))} have the same score, so read them as ${naCele.length === 2 ? "a pair" : "a group"} that leads together. ` +
      (sport
        ? "Which of them speaks up at any moment is decided by the situation: training, competition and crisis can switch on different sides of you."
        : "Which of them is speaking is decided by the situation, not by the order in the table."),
    kombinacePlocha: () =>
      "When all the archetypes have almost the same score, there is no telling which two lead together, and so no telling how they fit. The interplay of archetypes cannot be read from this response.",
    potlacenyVic: ({ naKonci, skorePotlaceneho, sport }) =>
      `${VETY_SHOD.en.jmena(nazvy(naKonci))} resonate least, each with ${skorePotlaceneho} points of 48. That is not a fault. It means these are not the sources you naturally draw on: ${VETY_SHOD.en.jmena(sDary(naKonci))}. ` +
      (sport
        ? "Allow for it in situations that call for those sides: either serve them deliberately, or lean on the people around you there."
        : "Allow for it in situations that call for those sides: either serve them deliberately, or bring in people for whom they come naturally."),
    potlacenyMnoho: ({ naKonci, skorePotlaceneho, sport }) =>
      `Several archetypes share the lowest score of ${skorePotlaceneho} points of 48: ${VETY_SHOD.en.jmena(nazvy(naKonci))}. No single blind spot can be named, and the order among them means nothing. Notice instead how far they sit from the archetypes at the top: ${sport ? "those are the sides that will not switch on by themselves in a match." : "those are the sides the brand will not show of its own accord."}`,
    potlacenyPlochy: ({ rozpetiN, sport }) =>
      `A blind spot cannot be named from a flat profile: the lowest archetype has ${rozpetiN === 0 ? "the same" : "almost the same"} score as the highest. ${sport ? "The first thing is to find out what really drives you in competition." : "The first thing is to find out what the brand really needs to say."}`,
    souhrnVedeVic: ({ naCele, sport }) =>
      sport
        ? `Your competitive identity is equally close to the ${VETY_SHOD.en.jmena(nazvy(naCele))} archetypes. None of them leads, so read them as ${naCele.length === 2 ? "a pair" : "a group"} in which the situation decides who speaks: training, competition and crisis can switch on different sides of you. Your energy comes from each of them: ${VETY_SHOD.en.jmena(sDary(naCele))}.`
        : `The ${VETY_SHOD.en.jmena(nazvy(naCele))} archetypes come equally naturally to your brand. None of them leads, so decide deliberately which one carries the brand outwardly and keep the others in the role of seasoning; otherwise the brand speaks in several voices at once and the market stops understanding it. What your customers believe of you: ${VETY_SHOD.en.jmena(sDary(naCele))}.`,
    slepaMista: ({ naKonci, sport }) =>
      sport
        ? `And allow for the blind spots: the sides the book calls ${VETY_SHOD.en.jmena(nazvy(naKonci))} do not come naturally to you, so do not force them and lean on the people around you instead.`
        : `And remember the blind spots: the sides the book calls ${VETY_SHOD.en.jmena(nazvy(naKonci))} do not come naturally to you, so do not fake them and bring them into the company instead.`,
    souhrnPlochy: ({ rozpetiN, sport }) =>
      `No archetype stands out from your answers; all twelve have ${rozpetiN === 0 ? "the same" : "almost the same"} score. The result therefore cannot be read as ${sport ? "a competitive identity" : "the voice of a brand"}. It is more useful to talk through with your coach how answering felt, and possibly to repeat the questionnaire calmly and without hurry.`,
    kdeZacitPlochy: () =>
      "With a flat profile, treat the guidance for the top archetype as inspiration, not a plan: the order here rests on differences that mean nothing. First check with your coach what in the result really fits.",
  },
}

/** Od kolika archetypů se stejným nejnižším skóre se slepé místo nejmenuje. */
const MNOHO_NA_KONCI = 4

export function spojArchetypy(
  v: VysledekArchetypu,
  lang: Lang,
  varianta: Varianta = "business",
): SpojeniArchetypu {
  const vety = VETY[lang]
  const shody = VETY_SHOD[lang]
  // Starší uložené výsledky se vyhodnocují znovu, ale kdyby se sem dostal
  // objekt bez shod, chová se jako bez shody.
  const naCele = v.naCele?.length ? v.naCele : [v.primarni]
  const naKonci = v.naKonci?.length ? v.naKonci : [v.potlaceny]
  const rozpetiN = v.rozpeti ?? v.primarni.skore - v.potlaceny.skore
  const k: Kontext = {
    P: obsahArchetypu(v.primarni.id, lang, varianta),
    S: obsahArchetypu(v.sekundarni.id, lang, varianta),
    Z: obsahArchetypu(v.potlaceny.id, lang, varianta),
    odstup: vety.body(v.odstup),
    odstupN: v.odstup,
    rozpeti: vety.body(rozpetiN),
    rozpetiN,
    naCele: naCele.map((a) => obsahArchetypu(a.id, lang, varianta)),
    naKonci: naKonci.map((a) => obsahArchetypu(a.id, lang, varianta)),
    sport: varianta === "sport",
    vyhraneni: v.vyhraneni,
    skorePotlaceneho: v.potlaceny.skore,
    stejnaSkupina: archetyp(v.primarni.id).motivace === archetyp(v.sekundarni.id).motivace,
    skupinaP: archetyp(v.primarni.id).motivace,
    skupinaS: archetyp(v.sekundarni.id).motivace,
    nazvySkupin: NAZVY_MOTIVACI[lang],
    popisySkupin: POPISY_MOTIVACI[varianta][lang],
  }

  if (v.vyhraneni === "plochy") {
    return {
      vyhraneni: shody.vyhraneniPlochy(k),
      kombinace: shody.kombinacePlocha(k),
      potlaceny: shody.potlacenyPlochy(k),
      souhrn: shody.souhrnPlochy(k),
      kdeZacit: shody.kdeZacitPlochy(k),
    }
  }

  const slepe =
    naKonci.length >= MNOHO_NA_KONCI ? "" : naKonci.length > 1 ? shody.slepaMista(k) : vety.slepeMisto(k)
  const uvod = naCele.length > 1 ? shody.souhrnVedeVic(k) : vety.souhrnUvod(k)

  return {
    vyhraneni: naCele.length > 1 ? shody.vyhraneniShoda(k) : vety.vyhraneni(k),
    kombinace: vety.kombinace(k),
    potlaceny:
      naKonci.length >= MNOHO_NA_KONCI
        ? shody.potlacenyMnoho(k)
        : naKonci.length > 1
          ? shody.potlacenyVic(k)
          : vety.potlaceny(k),
    souhrn: slepe ? `${uvod} ${slepe}` : uvod,
    kdeZacit: vety.kdeZacit(k),
  }
}
