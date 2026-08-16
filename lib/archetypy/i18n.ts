import type { Lang } from "../diagnostic/types"
import type { Varianta, Vyhraneni } from "./types"

// Texty rozhraní vyhodnocení archetypů.
//
// Obsah archetypů je v lib/archetypy/data, tady jsou popisky kolem něj:
// nadpisy sekcí, vysvětlivky pod grafy a věty skládané z čísel. Web i PDF
// čerpají ze stejné tabulky, aby se obě podoby nerozešly.
//
// Popisky, které mluví o značce nebo o sportu, jsou vedené po variantách.
// Zbytek je společný, protože stavba vyhodnocení je v obou stejná.
//
// Angličtinu obsah zatím nemá, takže na ni ukazuje česká tabulka.

export interface ArchetypyUI {
  podnadpis: Record<Varianta, string>
  respondent: string
  /** popisek druhého údaje v hlavičce */
  role: Record<Varianta, string>
  datum: string

  neuplnyTitulek: (zodpovezeno: number, celkem: number) => string
  neuplnyPopis: string

  profilTitulek: string
  profilPopisWeb: Record<Varianta, string>
  profilPopisPdf: Record<Varianta, string>

  motivaceTitulek: string
  motivacePopis: string
  motivacePatka: string

  primarniTitulek: string
  sekundarniTitulek: string
  potlacenyTitulek: string
  /** krátký štítek míry vyhranění do hlavičky výsledku */
  vyhraneniStitek: Record<Vyhraneni, string>

  z48: string
  bodyZ48: (skore: number) => string
  silneOdpovedi: (pocet: number, polozky: string) => string
  zodpovezenoZ: (zodpovezeno: number, celkem: number) => string
  nezarazuje: string

  vKnize: string
  touhaStitek: string
  strachStitek: string
  darStitek: Record<Varianta, string>

  podstataTitulek: string
  vPodnikaniTitulek: Record<Varianta, string>
  stinTitulek: string
  pastiTitulek: Record<Varianta, string>
  navodTitulek: Record<Varianta, string>
  prikladyStitek: Record<Varianta, string>
  sekundarniRoleStitek: string

  /** jen sportovní varianta */
  roleTitulek: string
  sTreneremTitulek: string
  znackaTitulek: string

  kombinaceTitulek: string
  kombinacePopis: Record<Varianta, string>

  souhrnTitulek: string
  souhrnPopis: Record<Varianta, string>
  kdeZacitStitek: string

  /** ve webu dva odstavce, v PDF jeden slitý */
  zaverWeb: Record<Varianta, string[]>
  zaverPdf: Record<Varianta, string>

  legendaTop: string
  legendaOstatni: string
  legendaOdznak: string
  odznakTitulek: (pocet: number) => string
  prumerSkupiny: (procenta: number) => string

  /** začátek názvu staženého PDF */
  nazevSouboru: Record<Varianta, string>
}

const CS: ArchetypyUI = {
  podnadpis: {
    business:
      "Archetypální profil osobnosti v podnikání podle knihy The Hero and the Outlaw (Margaret Mark a Carol S. Pearson)",
    sport:
      "Archetypální profil soutěžní identity sportovce podle knihy The Hero and the Outlaw (Margaret Mark a Carol S. Pearson)",
  },
  respondent: "Respondent",
  role: {
    business: "Firma / značka / role",
    sport: "Sport, disciplína a úroveň",
  },
  datum: "Datum vyplnění",

  neuplnyTitulek: (zodpovezeno, celkem) => `Dotazník není kompletní (${zodpovezeno} z ${celkem}).`,
  neuplnyPopis:
    "U archetypů s chybějícími odpověďmi je skóre dopočítané z průměru zodpovězených položek. Archetypy, kde chybí víc než pětina odpovědí, se do pořadí nezařazují.",

  profilTitulek: "Profil všech dvanácti archetypů",
  profilPopisWeb: {
    business:
      "Skóre jednoho archetypu je součet osmi odpovědí, tedy 8 až 48 bodů. Nejde o dobré a špatné výsledky: profil říká, který hlas je značce nejpřirozenější. Číslo v kolečku ukazuje, kolik tvrzení respondent označil hodnotou 5 nebo 6, tedy kolik z nich ho vystihuje silně.",
    sport:
      "Skóre jednoho archetypu je součet osmi odpovědí, tedy 8 až 48 bodů. Nejde o dobré a špatné výsledky: profil říká, z čeho sportovec přirozeně čerpá, když jde o výkon. Číslo v kolečku ukazuje, kolik tvrzení označil hodnotou 5 nebo 6, tedy kolik z nich ho vystihuje silně.",
  },
  profilPopisPdf: {
    business:
      "Skóre jednoho archetypu je součet osmi odpovědí, tedy 8 až 48 bodů. Nejde o dobré a špatné výsledky: profil říká, který hlas je značce nejpřirozenější. Číslo v závorce ukazuje, kolik tvrzení respondent označil hodnotou 5 nebo 6, tedy kolik z nich ho vystihuje silně.",
    sport:
      "Skóre jednoho archetypu je součet osmi odpovědí, tedy 8 až 48 bodů. Nejde o dobré a špatné výsledky: profil říká, z čeho sportovec přirozeně čerpá, když jde o výkon. Číslo v závorce ukazuje, kolik tvrzení označil hodnotou 5 nebo 6, tedy kolik z nich ho vystihuje silně.",
  },

  motivaceTitulek: "Motivační mapa",
  motivacePopis:
    "Kniha řadí dvanáct archetypů do čtyř skupin podle dvou os: stabilita proti riziku a sounáležitost proti nezávislosti. Mapa ukazuje, ze které motivace profil čerpá, a čte se dřív než jednotlivé archetypy: dva archetypy ze stejné skupiny jsou jedno téma, ne dvě.",
  motivacePatka:
    "Hodnota skupiny je průměr tří jejích archetypů v procentech rozsahu skóre. Slouží k porovnání směrů, ne jako samostatný výsledek.",

  primarniTitulek: "Primární archetyp",
  sekundarniTitulek: "Sekundární archetyp",
  potlacenyTitulek: "Potlačený archetyp",
  vyhraneniStitek: {
    vyhraneny: "vyhraněný profil",
    zretelny: "zřetelný profil",
    tesny: "těsný profil",
  },

  z48: "ze 48",
  bodyZ48: (skore) => `${skore} bodů ze 48`,
  silneOdpovedi: (pocet, polozky) =>
    `Hodnotou 5 nebo 6 označeno ${pocet} z 8 tvrzení${polozky ? `, konkrétně ${polozky}` : ""}.`,
  zodpovezenoZ: (zodpovezeno, celkem) => `zodpovězeno ${zodpovezeno} z ${celkem} položek`,
  nezarazuje: "do pořadí se nezařazuje",

  vKnize: "V knize",
  touhaStitek: "Touha",
  strachStitek: "Strach",
  darStitek: {
    business: "Dar značce",
    sport: "Dar do sportu",
  },

  podstataTitulek: "Podstata archetypu",
  vPodnikaniTitulek: {
    business: "Jak se projevuje v podnikání",
    sport: "Jak se projevuje v tréninku a v soutěži",
  },
  stinTitulek: "Stín pod tlakem",
  pastiTitulek: {
    business: "Pasti v komunikaci",
    sport: "Čím se tenhle typ dá pokazit",
  },
  navodTitulek: {
    business: "Návod: co a jak udělat",
    sport: "Návod pro trenéra i sportovce",
  },
  prikladyStitek: {
    business: "Značky tohoto archetypu",
    sport: "Jak to vypadá v praxi",
  },
  sekundarniRoleStitek: "Co přidává jako druhý",

  roleTitulek: "Role v týmu a v individuální přípravě",
  sTreneremTitulek: "Kde to skřípe s trenérem",
  znackaTitulek: "Osobní značka a komunikace navenek",

  kombinaceTitulek: "Jak spolu hrají",
  kombinacePopis: {
    business:
      "Primární archetyp určuje, o čem značka je. Sekundární určuje, jak se to projevuje. Teprve dvojice dává značce tvář, kterou si trh zapamatuje.",
    sport:
      "Primární archetyp určuje, odkud sportovec bere energii. Sekundární určuje, jakou barvu tomu dá. Teprve dvojice vysvětluje chování, které z jednoho archetypu vypadá nelogicky.",
  },

  souhrnTitulek: "Shrnutí pro klienta",
  souhrnPopis: {
    business: "Nejkratší poctivá odpověď na otázku, jakým hlasem má značka mluvit.",
    sport: "Nejkratší poctivá odpověď na otázku, co tohoto sportovce žene a jak ho vést.",
  },
  kdeZacitStitek: "Kde začít",

  zaverWeb: {
    business: [
      "Tento profil není škatulka ani horoskop. Je to mapa: pojmenovává hlas, kterým respondent přirozeně mluví, aby ho značka mohla používat vědomě a konzistentně. Archetyp se nevybírá, archetyp se rozpoznává; a značka, která mluví v souladu s ním, nemusí přemýšlet nad každou kampaní zvlášť.",
      "Výsledek nenahrazuje marketingovou strategii ani psychologické vyšetření. Slouží jako podklad pro rozhovor s koučem a pro rozhodnutí o positioningu, tónu komunikace a vizuálním stylu značky.",
    ],
    sport: [
      "Tento profil není škatulka ani horoskop. Je to mapa: pojmenovává, odkud sportovec bere energii, jaká role mu sedí a co ho pod tlakem sráží. Archetyp se nevybírá, archetyp se rozpoznává; a trenér, který ho zná, nemusí zkoušet, jaký přístup zabere.",
      "Výsledek nenahrazuje sportovně-psychologické vyšetření ani tréninkový plán. Slouží jako podklad pro rozhovor kouče se sportovcem: o vedení, o roli v týmu a o tom, jak stavět cíle a zpětnou vazbu.",
    ],
  },
  zaverPdf: {
    business:
      "Tento profil není škatulka ani horoskop. Je to mapa: pojmenovává hlas, kterým respondent přirozeně mluví, aby ho značka mohla používat vědomě a konzistentně. Archetyp se nevybírá, archetyp se rozpoznává; a značka, která mluví v souladu s ním, nemusí přemýšlet nad každou kampaní zvlášť. Výsledek nenahrazuje marketingovou strategii ani psychologické vyšetření a slouží jako podklad pro rozhovor s koučem.",
    sport:
      "Tento profil není škatulka ani horoskop. Je to mapa: pojmenovává, odkud sportovec bere energii, jaká role mu sedí a co ho pod tlakem sráží. Archetyp se nevybírá, archetyp se rozpoznává; a trenér, který ho zná, nemusí zkoušet, jaký přístup zabere. Výsledek nenahrazuje sportovně-psychologické vyšetření ani tréninkový plán a slouží jako podklad pro rozhovor kouče se sportovcem.",
  },

  legendaTop: "primární a sekundární archetyp",
  legendaOstatni: "ostatní",
  legendaOdznak: "počet tvrzení s hodnotou 5 nebo 6",
  odznakTitulek: (pocet) => `${pocet} tvrzení označeno hodnotou 5 nebo 6`,
  prumerSkupiny: (procenta) => `průměr skupiny ${procenta} %`,

  nazevSouboru: {
    business: "Archetypy znacky",
    sport: "Archetypy sportovce",
  },
}

const SK: ArchetypyUI = {
  podnadpis: {
    business:
      "Archetypálny profil osobnosti v podnikaní podľa knihy The Hero and the Outlaw (Margaret Mark a Carol S. Pearson)",
    sport:
      "Archetypálny profil súťažnej identity športovca podľa knihy The Hero and the Outlaw (Margaret Mark a Carol S. Pearson)",
  },
  respondent: "Respondent",
  role: {
    business: "Firma / značka / rola",
    sport: "Šport, disciplína a úroveň",
  },
  datum: "Dátum vyplnenia",

  neuplnyTitulek: (zodpovezeno, celkem) => `Dotazník nie je kompletný (${zodpovezeno} z ${celkem}).`,
  neuplnyPopis:
    "Pri archetypoch s chýbajúcimi odpoveďami je skóre dopočítané z priemeru zodpovedaných položiek. Archetypy, kde chýba viac než pätina odpovedí, sa do poradia nezaraďujú.",

  profilTitulek: "Profil všetkých dvanástich archetypov",
  profilPopisWeb: {
    business:
      "Skóre jedného archetypu je súčet ôsmich odpovedí, teda 8 až 48 bodov. Nejde o dobré a zlé výsledky: profil hovorí, ktorý hlas je značke najprirodzenejší. Číslo v koliesku ukazuje, koľko tvrdení respondent označil hodnotou 5 alebo 6, teda koľko z nich ho vystihuje silno.",
    sport:
      "Skóre jedného archetypu je súčet ôsmich odpovedí, teda 8 až 48 bodov. Nejde o dobré a zlé výsledky: profil hovorí, z čoho športovec prirodzene čerpá, keď ide o výkon. Číslo v koliesku ukazuje, koľko tvrdení označil hodnotou 5 alebo 6, teda koľko z nich ho vystihuje silno.",
  },
  profilPopisPdf: {
    business:
      "Skóre jedného archetypu je súčet ôsmich odpovedí, teda 8 až 48 bodov. Nejde o dobré a zlé výsledky: profil hovorí, ktorý hlas je značke najprirodzenejší. Číslo v zátvorke ukazuje, koľko tvrdení respondent označil hodnotou 5 alebo 6, teda koľko z nich ho vystihuje silno.",
    sport:
      "Skóre jedného archetypu je súčet ôsmich odpovedí, teda 8 až 48 bodov. Nejde o dobré a zlé výsledky: profil hovorí, z čoho športovec prirodzene čerpá, keď ide o výkon. Číslo v zátvorke ukazuje, koľko tvrdení označil hodnotou 5 alebo 6, teda koľko z nich ho vystihuje silno.",
  },

  motivaceTitulek: "Motivačná mapa",
  motivacePopis:
    "Kniha radí dvanásť archetypov do štyroch skupín podľa dvoch osí: stabilita proti riziku a spolupatričnosť proti nezávislosti. Mapa ukazuje, z ktorej motivácie profil čerpá, a číta sa skôr než jednotlivé archetypy: dva archetypy z rovnakej skupiny sú jedna téma, nie dve.",
  motivacePatka:
    "Hodnota skupiny je priemer troch jej archetypov v percentách rozsahu skóre. Slúži na porovnanie smerov, nie ako samostatný výsledok.",

  primarniTitulek: "Primárny archetyp",
  sekundarniTitulek: "Sekundárny archetyp",
  potlacenyTitulek: "Potlačený archetyp",
  vyhraneniStitek: {
    vyhraneny: "vyhranený profil",
    zretelny: "zreteľný profil",
    tesny: "tesný profil",
  },

  z48: "zo 48",
  bodyZ48: (skore) => `${skore} bodov zo 48`,
  silneOdpovedi: (pocet, polozky) =>
    `Hodnotou 5 alebo 6 označených ${pocet} z 8 tvrdení${polozky ? `, konkrétne ${polozky}` : ""}.`,
  zodpovezenoZ: (zodpovezeno, celkem) => `zodpovedaných ${zodpovezeno} z ${celkem} položiek`,
  nezarazuje: "do poradia sa nezaraďuje",

  vKnize: "V knihe",
  touhaStitek: "Túžba",
  strachStitek: "Strach",
  darStitek: {
    business: "Dar značke",
    sport: "Dar do športu",
  },

  podstataTitulek: "Podstata archetypu",
  vPodnikaniTitulek: {
    business: "Ako sa prejavuje v podnikaní",
    sport: "Ako sa prejavuje v tréningu a v súťaži",
  },
  stinTitulek: "Tieň pod tlakom",
  pastiTitulek: {
    business: "Pasce v komunikácii",
    sport: "Čím sa tento typ dá pokaziť",
  },
  navodTitulek: {
    business: "Návod: čo a ako urobiť",
    sport: "Návod pre trénera aj športovca",
  },
  prikladyStitek: {
    business: "Značky tohto archetypu",
    sport: "Ako to vyzerá v praxi",
  },
  sekundarniRoleStitek: "Čo pridáva ako druhý",

  roleTitulek: "Rola v tíme a v individuálnej príprave",
  sTreneremTitulek: "Kde to škrípe s trénerom",
  znackaTitulek: "Osobná značka a komunikácia navonok",

  kombinaceTitulek: "Ako spolu hrajú",
  kombinacePopis: {
    business:
      "Primárny archetyp určuje, o čom značka je. Sekundárny určuje, ako sa to prejavuje. Až dvojica dáva značke tvár, ktorú si trh zapamätá.",
    sport:
      "Primárny archetyp určuje, odkiaľ športovec berie energiu. Sekundárny určuje, akú farbu tomu dá. Až dvojica vysvetľuje správanie, ktoré z jedného archetypu vyzerá nelogicky.",
  },

  souhrnTitulek: "Zhrnutie pre klienta",
  souhrnPopis: {
    business: "Najkratšia poctivá odpoveď na otázku, akým hlasom má značka hovoriť.",
    sport: "Najkratšia poctivá odpoveď na otázku, čo tohto športovca ženie a ako ho viesť.",
  },
  kdeZacitStitek: "Kde začať",

  zaverWeb: {
    business: [
      "Tento profil nie je škatuľka ani horoskop. Je to mapa: pomenúva hlas, ktorým respondent prirodzene hovorí, aby ho značka mohla používať vedome a konzistentne. Archetyp sa nevyberá, archetyp sa rozpoznáva; a značka, ktorá hovorí v súlade s ním, nemusí premýšľať nad každou kampaňou zvlášť.",
      "Výsledok nenahrádza marketingovú stratégiu ani psychologické vyšetrenie. Slúži ako podklad pre rozhovor s koučom a pre rozhodnutia o positioningu, tóne komunikácie a vizuálnom štýle značky.",
    ],
    sport: [
      "Tento profil nie je škatuľka ani horoskop. Je to mapa: pomenúva, odkiaľ športovec berie energiu, aká rola mu sadne a čo ho pod tlakom zráža. Archetyp sa nevyberá, archetyp sa rozpoznáva; a tréner, ktorý ho pozná, nemusí skúšať, aký prístup zaberie.",
      "Výsledok nenahrádza športovo-psychologické vyšetrenie ani tréningový plán. Slúži ako podklad pre rozhovor kouča so športovcom: o vedení, o role v tíme a o tom, ako stavať ciele a spätnú väzbu.",
    ],
  },
  zaverPdf: {
    business:
      "Tento profil nie je škatuľka ani horoskop. Je to mapa: pomenúva hlas, ktorým respondent prirodzene hovorí, aby ho značka mohla používať vedome a konzistentne. Archetyp sa nevyberá, archetyp sa rozpoznáva; a značka, ktorá hovorí v súlade s ním, nemusí premýšľať nad každou kampaňou zvlášť. Výsledok nenahrádza marketingovú stratégiu ani psychologické vyšetrenie a slúži ako podklad pre rozhovor s koučom.",
    sport:
      "Tento profil nie je škatuľka ani horoskop. Je to mapa: pomenúva, odkiaľ športovec berie energiu, aká rola mu sadne a čo ho pod tlakom zráža. Archetyp sa nevyberá, archetyp sa rozpoznáva; a tréner, ktorý ho pozná, nemusí skúšať, aký prístup zaberie. Výsledok nenahrádza športovo-psychologické vyšetrenie ani tréningový plán a slúži ako podklad pre rozhovor kouča so športovcom.",
  },

  legendaTop: "primárny a sekundárny archetyp",
  legendaOstatni: "ostatné",
  legendaOdznak: "počet tvrdení s hodnotou 5 alebo 6",
  odznakTitulek: (pocet) => `${pocet} tvrdení označených hodnotou 5 alebo 6`,
  prumerSkupiny: (procenta) => `priemer skupiny ${procenta} %`,

  nazevSouboru: {
    business: "Archetypy znacky",
    sport: "Archetypy sportovca",
  },
}

export const UI_ARCHETYPY: Record<Lang, ArchetypyUI> = { cs: CS, sk: SK, en: CS }

// ---------------------------------------------------------------------------
// Škála a instrukce dotazníku. Vzorce se ptají na míru problému, archetypy na
// míru rezonance, takže potřebují vlastní popisky.
// ---------------------------------------------------------------------------

export const SKALA_ARCHETYPY: Record<Lang, Record<1 | 2 | 3 | 4 | 5 | 6, string>> = {
  cs: {
    1: "Vůbec mě to nevystihuje",
    2: "Většinou mě to nevystihuje",
    3: "Spíš mě to nevystihuje",
    4: "Spíš mě to vystihuje",
    5: "Většinou mě to vystihuje",
    6: "Naprosto mě to vystihuje",
  },
  en: {
    1: "Does not describe me at all",
    2: "Mostly does not describe me",
    3: "Rather does not describe me",
    4: "Rather describes me",
    5: "Mostly describes me",
    6: "Describes me completely",
  },
  sk: {
    1: "Vôbec ma to nevystihuje",
    2: "Väčšinou ma to nevystihuje",
    3: "Skôr ma to nevystihuje",
    4: "Skôr ma to vystihuje",
    5: "Väčšinou ma to vystihuje",
    6: "Úplne ma to vystihuje",
  },
}

const INSTRUKCE_BUSINESS: Record<Lang, string[]> = {
  cs: [
    "U každého tvrzení označ číslo od 1 do 6 podle toho, jak silně tě vystihuje.",
    "Odpovídej za sebe jako za člověka, který značku vede, ne za to, jak se firma prezentuje navenek.",
    "Neodpovídej podle toho, {jaký|jaká} bys {chtěl|chtěla} být. Žádný archetyp není lepší než jiný; test hledá ten, který je ti přirozený.",
    "Škála nemá střed. To je záměr: u každého tvrzení se přikloň na jednu stranu.",
    "Odpovědi se průběžně ukládají v tomto zařízení. Můžeš si dát pauzu a vrátit se později.",
    "Výsledek není škatulka. Je to mapa pro rozhovor s koučem o hlasu tvojí značky.",
  ],
  en: [
    "For each statement pick a number from 1 to 6 according to how strongly it describes you.",
    "Answer for yourself as the person leading the brand, not for how the company presents itself.",
    "Do not answer as the person you would like to be. No archetype is better than another; the test looks for the one that comes naturally to you.",
    "The scale has no midpoint. That is deliberate: on every statement, lean one way or the other.",
    "Your answers are saved on this device as you go. You can take a break and come back later.",
    "The result is not a box. It is a map for the conversation with your coach about your brand's voice.",
  ],
  sk: [
    "Pri každom tvrdení označ číslo od 1 do 6 podľa toho, ako silno ťa vystihuje.",
    "Odpovedaj za seba ako za človeka, ktorý značku vedie, nie za to, ako sa firma prezentuje navonok.",
    "Neodpovedaj podľa toho, {aký|aká} by si {chcel|chcela} byť. Žiadny archetyp nie je lepší než iný; test hľadá ten, ktorý je ti prirodzený.",
    "Škála nemá stred. Je to zámer: pri každom tvrdení sa prikloň na jednu stranu.",
    "Odpovede sa priebežne ukladajú v tomto zariadení. Môžeš si dať pauzu a vrátiť sa neskôr.",
    "Výsledok nie je škatuľka. Je to mapa pre rozhovor s koučom o hlase tvojej značky.",
  ],
}

const INSTRUKCE_SPORT: Record<Lang, string[]> = {
  cs: [
    "U každého tvrzení označ číslo od 1 do 6 podle toho, jak silně tě vystihuje.",
    "Odpovídej za sebe jako za sportovce: jak to máš v tréninku, v přípravě a v soutěži, ne jak by to mělo vypadat.",
    "Neodpovídej podle toho, {jaký|jaká} bys {chtěl|chtěla} být. Žádný archetyp není lepší než jiný; test hledá ten, který je ti přirozený.",
    "Kde se mluví o týmu, mysli tím i tréninkovou skupinu nebo lidi kolem sebe, pokud sportuješ {sám|sama}.",
    "Škála nemá střed. To je záměr: u každého tvrzení se přikloň na jednu stranu.",
    "Odpovědi se průběžně ukládají v tomto zařízení. Můžeš si dát pauzu a vrátit se později.",
    "Výsledek není škatulka. Je to mapa pro rozhovor s koučem o tom, jak s tebou pracovat.",
  ],
  en: [
    "For each statement pick a number from 1 to 6 according to how strongly it describes you.",
    "Answer for yourself as an athlete: how it really is in training and in competition, not how it should look.",
    "Do not answer as the person you would like to be. No archetype is better than another; the test looks for the one that comes naturally to you.",
    "Where the statements mention a team, read it as your training group or the people around you if you compete alone.",
    "The scale has no midpoint. That is deliberate: on every statement, lean one way or the other.",
    "Your answers are saved on this device as you go. You can take a break and come back later.",
    "The result is not a box. It is a map for the conversation with your coach about how to work with you.",
  ],
  sk: [
    "Pri každom tvrdení označ číslo od 1 do 6 podľa toho, ako silno ťa vystihuje.",
    "Odpovedaj za seba ako za športovca: ako to máš v tréningu, v príprave a v súťaži, nie ako by to malo vyzerať.",
    "Neodpovedaj podľa toho, {aký|aká} by si {chcel|chcela} byť. Žiadny archetyp nie je lepší než iný; test hľadá ten, ktorý je ti prirodzený.",
    "Kde sa hovorí o tíme, mysli tým aj tréningovú skupinu alebo ľudí okolo seba, ak športuješ {sám|sama}.",
    "Škála nemá stred. Je to zámer: pri každom tvrdení sa prikloň na jednu stranu.",
    "Odpovede sa priebežne ukladajú v tomto zariadení. Môžeš si dať pauzu a vrátiť sa neskôr.",
    "Výsledok nie je škatuľka. Je to mapa pre rozhovor s koučom o tom, ako s tebou pracovať.",
  ],
}

export const INSTRUKCE_ARCHETYPY: Record<Varianta, Record<Lang, string[]>> = {
  business: INSTRUKCE_BUSINESS,
  sport: INSTRUKCE_SPORT,
}
