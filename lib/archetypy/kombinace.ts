import type { Lang } from "../diagnostic/types"
import { obsahArchetypu } from "./content"
import { NAZVY_MOTIVACI, POPISY_MOTIVACI, archetyp } from "./structure"
import type { VysledekArchetypu } from "./types"

// Skládané věty vyhodnocení: vyhranění profilu, souhra primárního a
// sekundárního archetypu, potlačený archetyp a shrnutí pro klienta.
//
// Věty se skládají z čísel a názvů, proto jsou tady a ne v datech obsahu.
// Formulace se vyhýbají minulému času a přídavným jménům vztaženým
// k respondentovi, aby nepotřebovaly rodové tvary.

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

/** České a slovenské počítání bodů: 1 bod, 2 body, 5 bodů/bodov. */
function body(n: number, lang: Lang): string {
  if (n === 1) return "1 bod"
  if (n >= 2 && n <= 4) return `${n} body`
  return lang === "sk" ? `${n} bodov` : `${n} bodů`
}

export function spojArchetypy(v: VysledekArchetypu, lang: Lang): SpojeniArchetypu {
  const P = obsahArchetypu(v.primarni.id, lang)
  const S = obsahArchetypu(v.sekundarni.id, lang)
  const Z = obsahArchetypu(v.potlaceny.id, lang)
  const skupinaP = archetyp(v.primarni.id).motivace
  const skupinaS = archetyp(v.sekundarni.id).motivace
  const stejnaSkupina = skupinaP === skupinaS
  const nazvySkupin = NAZVY_MOTIVACI[lang]
  const popisySkupin = POPISY_MOTIVACI[lang]
  const odstup = body(v.odstup, lang)

  if (lang === "sk") {
    const vyhraneni =
      v.vyhraneni === "vyhraneny"
        ? `Profil je vyhranený: ${P.nazev} má pred druhým v poradí náskok ${odstup}. Identita značky je jednoznačná a dá sa na nej stavať bez veľkého vyjednávania.`
        : v.vyhraneni === "zretelny"
          ? `Profil je zreteľný: ${P.nazev} vedie o ${odstup}. Vedľa neho je počuť aj druhý hlas, ktorý identitu dopĺňa, ale neprekrikuje.`
          : `Prvé dva archetypy delí iba ${odstup}, preto ich čítaj ako dvojicu, ktorá vedie spoločne. O tom, ktorý z nich práve hovorí, rozhoduje situácia, nie poradie v tabuľke.`

    const kombinace = stejnaSkupina
      ? `${P.nazev} aj ${S.nazev} čerpajú z rovnakej motivácie, ktorú kniha volá ${nazvySkupin[skupinaP].toLowerCase()}: ${popisySkupin[skupinaP]}. Oba hlasy ťahajú rovnakým smerom, takže značka pôsobí konzistentne sama od seba; o to dôslednejšie stráž, aby jej neušiel zvyšok mapy.`
      : `${P.nazev} stojí na motivácii ${nazvySkupin[skupinaP].toLowerCase()} (${popisySkupin[skupinaP]}), ${S.nazev} pridáva motiváciu ${nazvySkupin[skupinaS].toLowerCase()} (${popisySkupin[skupinaS]}). Také spojenie má väčší rozsah, ale chce jasné roly: primárny archetyp určuje, o čom značka je, sekundárny iba to, ako sa to prejavuje. Keď sa role prehodia, značka hovorí dvoma hlasmi naraz a trh jej prestane rozumieť.`

    const potlaceny = `Najmenej rezonuje ${Z.nazev}: ${v.potlaceny.skore} bodov zo 48. To nie je chyba. Znamená to, že ${Z.dar} nie sú zdrojom, z ktorého prirodzene čerpáš. Počítaj s tým v situáciách, ktoré túto polohu vyžadujú: buď ju obslúž vedome, alebo si na ňu priber človeka, ktorému je vlastná.`

    const souhrn = `Tvojej značke je najprirodzenejší hlas archetypu ${P.nazev}. Jeho motto „${P.motto}“ nie je slogan na vyvesenie, ale skratka toho, čo ti zákazníci veria: ${P.dar}. Druhý hlas, ${S.nazev}, drž v úlohe korenia, nie druhého kuchára. A pamätaj na slepé miesto: poloha, ktorú kniha volá ${Z.nazev}, ti nie je vlastná, tak ju nepredstieraj a radšej si ju do firmy priber.`

    const kdeZacit = `Vyber si z návodu jeden krok, ktorý sa dá urobiť do týždňa, a urob ho. Archetyp sa nebuduje deklaráciou, ale opakovanou skúsenosťou, ktorú so značkou urobí zákazník.`

    return { vyhraneni, kombinace, potlaceny, souhrn, kdeZacit }
  }

  const vyhraneni =
    v.vyhraneni === "vyhraneny"
      ? `Profil je vyhraněný: ${P.nazev} má před druhým v pořadí náskok ${odstup}. Identita značky je jednoznačná a dá se na ní stavět bez velkého vyjednávání.`
      : v.vyhraneni === "zretelny"
        ? `Profil je zřetelný: ${P.nazev} vede o ${odstup}. Vedle něj je slyšet i druhý hlas, který identitu doplňuje, ale nepřekřikuje.`
        : `První dva archetypy dělí jen ${odstup}, proto je čti jako dvojici, která vede společně. O tom, který z nich právě mluví, rozhoduje situace, ne pořadí v tabulce.`

  const kombinace = stejnaSkupina
    ? `${P.nazev} i ${S.nazev} čerpají ze stejné motivace, které kniha říká ${nazvySkupin[skupinaP].toLowerCase()}: ${popisySkupin[skupinaP]}. Oba hlasy táhnou stejným směrem, takže značka působí konzistentně sama od sebe; o to důsledněji hlídej, aby jí neutekl zbytek mapy.`
    : `${P.nazev} stojí na motivaci ${nazvySkupin[skupinaP].toLowerCase()} (${popisySkupin[skupinaP]}), ${S.nazev} přidává motivaci ${nazvySkupin[skupinaS].toLowerCase()} (${popisySkupin[skupinaS]}). Takové spojení má větší rozpětí, ale chce jasné role: primární archetyp určuje, o čem značka je, sekundární jen to, jak se to projevuje. Když se role prohodí, značka mluví dvěma hlasy najednou a trh jí přestane rozumět.`

  const potlaceny = `Nejméně rezonuje ${Z.nazev}: ${v.potlaceny.skore} bodů ze 48. To není chyba. Znamená to, že ${Z.dar} nejsou zdrojem, ze kterého přirozeně čerpáš. Počítej s tím v situacích, které tuhle polohu vyžadují: buď ji obsluž vědomě, nebo si na ni přiber člověka, kterému je vlastní.`

  const souhrn = `Tvojí značce je nejpřirozenější hlas archetypu ${P.nazev}. Jeho motto „${P.motto}“ není slogan k vyvěšení, ale zkratka toho, co ti zákazníci věří: ${P.dar}. Druhý hlas, ${S.nazev}, drž v roli koření, ne druhého kuchaře. A pamatuj na slepé místo: poloha, které kniha říká ${Z.nazev}, ti není vlastní, tak ji nepředstírej a radši si ji do firmy přiber.`

  const kdeZacit = `Vyber si z návodu jeden krok, který jde udělat do týdne, a udělej ho. Archetyp se nebuduje deklarací, ale opakovanou zkušeností, kterou se značkou udělá zákazník.`

  return { vyhraneni, kombinace, potlaceny, souhrn, kdeZacit }
}
