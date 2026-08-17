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
  souhrn: (k: Kontext) => string
  kdeZacit: (k: Kontext) => string
}

const VETY: Record<Lang, SadaVet> = {
  cs: {
    body: (n) => (n === 1 ? "1 bod" : n <= 4 ? `${n} body` : `${n} bodů`),

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

    souhrn: ({ P, S, Z, sport }) =>
      sport
        ? `Tvoje soutěžní identita má nejblíž k archetypu ${P.nazev}. Jeho motto „${P.motto}“ není heslo na zeď, ale zkratka toho, odkud ti jde energie: ${P.dar}. Druhý hlas, ${S.nazev}, tomu dává barvu a ozve se hlavně tehdy, když je situace nejistá. A počítej se slepým místem: poloha, které kniha říká ${Z.nazev}, ti není vlastní, tak ji netlač silou a radši se v ní opři o lidi kolem sebe.`
        : `Tvojí značce je nejpřirozenější hlas archetypu ${P.nazev}. Jeho motto „${P.motto}“ není slogan k vyvěšení, ale zkratka toho, co ti zákazníci věří: ${P.dar}. Druhý hlas, ${S.nazev}, drž v roli koření, ne druhého kuchaře. A pamatuj na slepé místo: poloha, které kniha říká ${Z.nazev}, ti není vlastní, tak ji nepředstírej a radši si ji do firmy přiber.`,

    kdeZacit: ({ sport }) =>
      sport
        ? `Vyberte si z návodu jeden krok, který jde zkusit v nejbližším tréninkovém cyklu, a domluvte se, podle čeho poznáte, že zabral. Archetyp se nemění, mění se to, jak se s ním pracuje.`
        : `Vyber si z návodu jeden krok, který jde udělat do týdne, a udělej ho. Archetyp se nebuduje deklarací, ale opakovanou zkušeností, kterou se značkou udělá zákazník.`,
  },

  sk: {
    body: (n) => (n === 1 ? "1 bod" : n <= 4 ? `${n} body` : `${n} bodov`),

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

    souhrn: ({ P, S, Z, sport }) =>
      sport
        ? `Tvoja súťažná identita má najbližšie k archetypu ${P.nazev}. Jeho motto „${P.motto}“ nie je heslo na stenu, ale skratka toho, odkiaľ ti ide energia: ${P.dar}. Druhý hlas, ${S.nazev}, ju farbí a ukazuje sa najmä vtedy, keď je situácia neistá. A rátaj so slepým miestom: poloha, ktorú kniha volá ${Z.nazev}, ti nie je vlastná, takže ju netlač silou a radšej sa v nej opri o ľudí okolo seba.`
        : `Tvojej značke je najprirodzenejší hlas archetypu ${P.nazev}. Jeho motto „${P.motto}“ nie je slogan na vyvesenie, ale skratka toho, čo ti zákazníci veria: ${P.dar}. Druhý hlas, ${S.nazev}, drž v úlohe korenia, nie druhého kuchára. A pamätaj na slepé miesto: poloha, ktorú kniha volá ${Z.nazev}, ti nie je vlastná, tak ju nepredstieraj a radšej si ju do firmy priber.`,

    kdeZacit: ({ sport }) =>
      sport
        ? `Vyberte si z návodu jeden krok, ktorý sa dá skúsiť v najbližšom tréningovom cykle, a dohodnite sa, podľa čoho spoznáte, že zabral. Archetyp sa nemení, mení sa to, ako sa s ním pracuje.`
        : `Vyber si z návodu jeden krok, ktorý sa dá urobiť do týždňa, a urob ho. Archetyp sa nebuduje deklaráciou, ale opakovanou skúsenosťou, ktorú so značkou urobí zákazník.`,
  },

  en: {
    body: (n) => (n === 1 ? "1 point" : `${n} points`),

    vyhraneni: ({ P, odstup, sport, vyhraneni }) =>
      vyhraneni === "vyhraneny"
        ? sport
          ? `The profile is sharply defined: ${P.nazev} leads the runner-up by ${odstup}. You know what drives you, and that can be used to the full in training and on the day.`
          : `The profile is sharply defined: ${P.nazev} leads the runner-up by ${odstup}. The brand's identity is unambiguous and can be built on without much negotiation.`
        : vyhraneni === "zretelny"
          ? sport
            ? `The profile is clearly defined: ${P.nazev} leads by ${odstup}. A second voice is audible beside it, one that complements it rather than shouting it down.`
            : `The profile is clearly defined: ${P.nazev} leads by ${odstup}. A second voice is audible beside it, one that complements the identity rather than shouting it down.`
          : sport
            ? `Only ${odstup} separate the first two archetypes, so read them as a pair that leads together. Which of them speaks up at any moment is decided by the situation: training, competition and crisis can switch on different sides of you.`
            : `Only ${odstup} separate the first two archetypes, so read them as a pair that leads together. Which of them is speaking is decided by the situation, not by the order in the table.`,

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

    souhrn: ({ P, S, Z, sport }) =>
      sport
        ? `Your competitive identity is closest to the ${P.nazev} archetype. Its motto, “${P.motto}”, is not a slogan for the wall but shorthand for where your energy comes from: ${P.dar}. The second voice, ${S.nazev}, gives it colour and speaks up mainly when the situation is uncertain. And allow for the blind spot: the side the book calls ${Z.nazev} does not come naturally to you, so do not force it and lean on the people around you instead.`
        : `The voice that comes most naturally to your brand is the ${P.nazev} archetype. Its motto, “${P.motto}”, is not a slogan to hang on the wall but shorthand for what your customers believe of you: ${P.dar}. Keep the second voice, ${S.nazev}, in the role of seasoning, not second chef. And remember the blind spot: the side the book calls ${Z.nazev} does not come naturally to you, so do not fake it and bring it into the company instead.`,

    kdeZacit: ({ sport }) =>
      sport
        ? `Pick one step from the guidance that can be tried in the next training cycle, and agree how you will know it worked. The archetype does not change; what changes is how you work with it.`
        : `Pick one step from the guidance that can be done within a week, and do it. An archetype is not built by declaration but by the repeated experience a customer has with the brand.`,
  },
}

export function spojArchetypy(
  v: VysledekArchetypu,
  lang: Lang,
  varianta: Varianta = "business",
): SpojeniArchetypu {
  const vety = VETY[lang]
  const k: Kontext = {
    P: obsahArchetypu(v.primarni.id, lang, varianta),
    S: obsahArchetypu(v.sekundarni.id, lang, varianta),
    Z: obsahArchetypu(v.potlaceny.id, lang, varianta),
    odstup: vety.body(v.odstup),
    sport: varianta === "sport",
    vyhraneni: v.vyhraneni,
    skorePotlaceneho: v.potlaceny.skore,
    stejnaSkupina: archetyp(v.primarni.id).motivace === archetyp(v.sekundarni.id).motivace,
    skupinaP: archetyp(v.primarni.id).motivace,
    skupinaS: archetyp(v.sekundarni.id).motivace,
    nazvySkupin: NAZVY_MOTIVACI[lang],
    popisySkupin: POPISY_MOTIVACI[varianta][lang],
  }

  return {
    vyhraneni: vety.vyhraneni(k),
    kombinace: vety.kombinace(k),
    potlaceny: vety.potlaceny(k),
    souhrn: vety.souhrn(k),
    kdeZacit: vety.kdeZacit(k),
  }
}
