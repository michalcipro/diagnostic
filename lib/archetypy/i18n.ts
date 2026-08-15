import type { Lang } from "../diagnostic/types"
import type { Vyhraneni } from "./types"

// Texty rozhraní vyhodnocení archetypů značky.
//
// Obsah archetypů je v lib/archetypy/data, tady jsou popisky kolem něj:
// nadpisy sekcí, vysvětlivky pod grafy a věty skládané z čísel. Web i PDF
// čerpají ze stejné tabulky, aby se obě podoby nerozešly.
//
// Angličtinu obsah zatím nemá, takže na ni ukazuje česká tabulka.

export interface ArchetypyUI {
  podnadpis: string
  respondent: string
  role: string
  datum: string

  neuplnyTitulek: (zodpovezeno: number, celkem: number) => string
  neuplnyPopis: string

  profilTitulek: string
  profilPopisWeb: string
  profilPopisPdf: string

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
  darStitek: string

  podstataTitulek: string
  vPodnikaniTitulek: string
  stinTitulek: string
  pastiTitulek: string
  navodTitulek: string
  prikladyStitek: string
  sekundarniRoleStitek: string

  kombinaceTitulek: string
  kombinacePopis: string

  souhrnTitulek: string
  souhrnPopis: string
  kdeZacitStitek: string

  /** ve webu dva odstavce, v PDF jeden slitý */
  zaverWeb: string[]
  zaverPdf: string

  legendaTop: string
  legendaOstatni: string
  legendaOdznak: string
  odznakTitulek: (pocet: number) => string
  prumerSkupiny: (procenta: number) => string

  /** začátek názvu staženého PDF */
  nazevSouboru: string
}

const CS: ArchetypyUI = {
  podnadpis:
    "Archetypální profil osobnosti v podnikání podle knihy The Hero and the Outlaw (Margaret Mark a Carol S. Pearson)",
  respondent: "Respondent",
  role: "Firma / značka / role",
  datum: "Datum vyplnění",

  neuplnyTitulek: (zodpovezeno, celkem) => `Dotazník není kompletní (${zodpovezeno} z ${celkem}).`,
  neuplnyPopis:
    "U archetypů s chybějícími odpověďmi je skóre dopočítané z průměru zodpovězených položek. Archetypy, kde chybí víc než pětina odpovědí, se do pořadí nezařazují.",

  profilTitulek: "Profil všech dvanácti archetypů",
  profilPopisWeb:
    "Skóre jednoho archetypu je součet osmi odpovědí, tedy 8 až 48 bodů. Nejde o dobré a špatné výsledky: profil říká, který hlas je značce nejpřirozenější. Číslo v kolečku ukazuje, kolik tvrzení respondent označil hodnotou 5 nebo 6, tedy kolik z nich ho vystihuje silně.",
  profilPopisPdf:
    "Skóre jednoho archetypu je součet osmi odpovědí, tedy 8 až 48 bodů. Nejde o dobré a špatné výsledky: profil říká, který hlas je značce nejpřirozenější. Číslo v závorce ukazuje, kolik tvrzení respondent označil hodnotou 5 nebo 6, tedy kolik z nich ho vystihuje silně.",

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
  darStitek: "Dar značce",

  podstataTitulek: "Podstata archetypu",
  vPodnikaniTitulek: "Jak se projevuje v podnikání",
  stinTitulek: "Stín pod tlakem",
  pastiTitulek: "Pasti v komunikaci",
  navodTitulek: "Návod: co a jak udělat",
  prikladyStitek: "Značky tohoto archetypu",
  sekundarniRoleStitek: "Co přidává jako druhý",

  kombinaceTitulek: "Jak spolu hrají",
  kombinacePopis:
    "Primární archetyp určuje, o čem značka je. Sekundární určuje, jak se to projevuje. Teprve dvojice dává značce tvář, kterou si trh zapamatuje.",

  souhrnTitulek: "Shrnutí pro klienta",
  souhrnPopis: "Nejkratší poctivá odpověď na otázku, jakým hlasem má značka mluvit.",
  kdeZacitStitek: "Kde začít",

  zaverWeb: [
    "Tento profil není škatulka ani horoskop. Je to mapa: pojmenovává hlas, kterým respondent přirozeně mluví, aby ho značka mohla používat vědomě a konzistentně. Archetyp se nevybírá, archetyp se rozpoznává; a značka, která mluví v souladu s ním, nemusí přemýšlet nad každou kampaní zvlášť.",
    "Výsledek nenahrazuje marketingovou strategii ani psychologické vyšetření. Slouží jako podklad pro rozhovor s koučem a pro rozhodnutí o positioningu, tónu komunikace a vizuálním stylu značky.",
  ],
  zaverPdf:
    "Tento profil není škatulka ani horoskop. Je to mapa: pojmenovává hlas, kterým respondent přirozeně mluví, aby ho značka mohla používat vědomě a konzistentně. Archetyp se nevybírá, archetyp se rozpoznává; a značka, která mluví v souladu s ním, nemusí přemýšlet nad každou kampaní zvlášť. Výsledek nenahrazuje marketingovou strategii ani psychologické vyšetření a slouží jako podklad pro rozhovor s koučem.",

  legendaTop: "primární a sekundární archetyp",
  legendaOstatni: "ostatní",
  legendaOdznak: "počet tvrzení s hodnotou 5 nebo 6",
  odznakTitulek: (pocet) => `${pocet} tvrzení označeno hodnotou 5 nebo 6`,
  prumerSkupiny: (procenta) => `průměr skupiny ${procenta} %`,

  nazevSouboru: "Archetypy znacky",
}

const SK: ArchetypyUI = {
  podnadpis:
    "Archetypálny profil osobnosti v podnikaní podľa knihy The Hero and the Outlaw (Margaret Mark a Carol S. Pearson)",
  respondent: "Respondent",
  role: "Firma / značka / rola",
  datum: "Dátum vyplnenia",

  neuplnyTitulek: (zodpovezeno, celkem) => `Dotazník nie je kompletný (${zodpovezeno} z ${celkem}).`,
  neuplnyPopis:
    "Pri archetypoch s chýbajúcimi odpoveďami je skóre dopočítané z priemeru zodpovedaných položiek. Archetypy, kde chýba viac než pätina odpovedí, sa do poradia nezaraďujú.",

  profilTitulek: "Profil všetkých dvanástich archetypov",
  profilPopisWeb:
    "Skóre jedného archetypu je súčet ôsmich odpovedí, teda 8 až 48 bodov. Nejde o dobré a zlé výsledky: profil hovorí, ktorý hlas je značke najprirodzenejší. Číslo v koliesku ukazuje, koľko tvrdení respondent označil hodnotou 5 alebo 6, teda koľko z nich ho vystihuje silno.",
  profilPopisPdf:
    "Skóre jedného archetypu je súčet ôsmich odpovedí, teda 8 až 48 bodov. Nejde o dobré a zlé výsledky: profil hovorí, ktorý hlas je značke najprirodzenejší. Číslo v zátvorke ukazuje, koľko tvrdení respondent označil hodnotou 5 alebo 6, teda koľko z nich ho vystihuje silno.",

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
  darStitek: "Dar značke",

  podstataTitulek: "Podstata archetypu",
  vPodnikaniTitulek: "Ako sa prejavuje v podnikaní",
  stinTitulek: "Tieň pod tlakom",
  pastiTitulek: "Pasce v komunikácii",
  navodTitulek: "Návod: čo a ako urobiť",
  prikladyStitek: "Značky tohto archetypu",
  sekundarniRoleStitek: "Čo pridáva ako druhý",

  kombinaceTitulek: "Ako spolu hrajú",
  kombinacePopis:
    "Primárny archetyp určuje, o čom značka je. Sekundárny určuje, ako sa to prejavuje. Až dvojica dáva značke tvár, ktorú si trh zapamätá.",

  souhrnTitulek: "Zhrnutie pre klienta",
  souhrnPopis: "Najkratšia poctivá odpoveď na otázku, akým hlasom má značka hovoriť.",
  kdeZacitStitek: "Kde začať",

  zaverWeb: [
    "Tento profil nie je škatuľka ani horoskop. Je to mapa: pomenúva hlas, ktorým respondent prirodzene hovorí, aby ho značka mohla používať vedome a konzistentne. Archetyp sa nevyberá, archetyp sa rozpoznáva; a značka, ktorá hovorí v súlade s ním, nemusí premýšľať nad každou kampaňou zvlášť.",
    "Výsledok nenahrádza marketingovú stratégiu ani psychologické vyšetrenie. Slúži ako podklad pre rozhovor s koučom a pre rozhodnutia o positioningu, tóne komunikácie a vizuálnom štýle značky.",
  ],
  zaverPdf:
    "Tento profil nie je škatuľka ani horoskop. Je to mapa: pomenúva hlas, ktorým respondent prirodzene hovorí, aby ho značka mohla používať vedome a konzistentne. Archetyp sa nevyberá, archetyp sa rozpoznáva; a značka, ktorá hovorí v súlade s ním, nemusí premýšľať nad každou kampaňou zvlášť. Výsledok nenahrádza marketingovú stratégiu ani psychologické vyšetrenie a slúži ako podklad pre rozhovor s koučom.",

  legendaTop: "primárny a sekundárny archetyp",
  legendaOstatni: "ostatné",
  legendaOdznak: "počet tvrdení s hodnotou 5 alebo 6",
  odznakTitulek: (pocet) => `${pocet} tvrdení označených hodnotou 5 alebo 6`,
  prumerSkupiny: (procenta) => `priemer skupiny ${procenta} %`,

  nazevSouboru: "Archetypy znacky",
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

export const INSTRUKCE_ARCHETYPY: Record<Lang, string[]> = {
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
