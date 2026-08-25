import type { DimensionId } from "../diagnostic/types"
import type { TymLang } from "./obsah"

// Výklad sedmi oblastí pro týmový report.
//
// Tohle je to, co dělá z čísel analýzu. Kouč sám z „58 %, rozptyl 20“
// nepozná, co má v úterý dělat jinak. Text se proto skládá ze tří vrstev:
// co oblast měří, jak na tom tým je (podle úrovně) a jaký má rozdělení tvar
// (vyrovnané, s někým mimo, rozdělené na dvě skupiny, plošně slabé). Teprve
// dohromady dávají větu, podle které se dá jednat.
//
// PROČ SE ÚROVEŇ A TVAR PÍŠOU ZVLÁŠŤ. Tým s průměrem 60 a rozptylem 5 a tým
// s průměrem 60 a rozptylem 22 mají v tabulce stejné číslo a v kabině nemají
// společného nic. První potřebuje posunout všechny, druhý potřebuje přestat
// dělat všem totéž. Kdyby se výklad psal jen k úrovni, tenhle rozdíl by
// v reportu zmizel, a je to ten nejdůležitější rozdíl, který v datech je.
//
// Prahy, podle kterých se vybírá varianta, jsou v agregaci a v reportu
// nefigurují. Kouč čte závěr, ne pravidlo, kterým vznikl.

/** Pásmo úrovně, podle kterého se vybírá odstavec o stavu týmu. */
export type UrovenKlic = "nizka" | "stredni" | "vysoka"

/** Tvar rozdělení hodnot v týmu. Říká zpravidla víc než samotná úroveň. */
export type TvarKlic = "vyrovnana" | "rozptyl" | "zlom" | "plosna"

export interface OblastVyklad {
  /** Co oblast pokrývá, řečeno tak, aby to dávalo smysl koučovi, ne psychologovi. */
  coMeri: string
  /** Proč na tom ve vrcholovém sportu záleží. Mechanismus, ne fráze. */
  procZalezi: string
  /** Stav týmu podle úrovně. */
  uroven: Record<UrovenKlic, string>
  /** Co znamená tvar rozdělení, a proto jak se k tomu chovat. */
  tvar: Record<TvarKlic, string>
  /** Konkrétní práce. Věci, které jdou zavést do týdenního plánu. */
  prace: string[]
  /** Podle čeho kouč pozná, že se to hýbe, aniž by čekal na další dotazník. */
  znaky: string[]
  /** Otázky do individuálního rozhovoru. Otevřené, ne návodné. */
  otazky: string[]
}

export type VykladOblasti = Record<DimensionId, OblastVyklad>

const CS: VykladOblasti = {
  A: {
    coMeri:
      "Jestli hráč ví, proč tenhle sport dělá, a jestli jeho hodnota v jeho vlastních " +
      "očích stojí na něčem jiném než na posledním výsledku.",
    procZalezi:
      "Identita rozhoduje o tom, co se stane po prohře. Kdo staví hodnotu na výsledku, " +
      "prohrou neztrácí zápas, ale kus sebe, a další týden trénuje proto, aby se " +
      "uklidnil, ne aby se zlepšil. Ve dvouleté sezoně to je rozdíl mezi hráčem, " +
      "který po neúspěchu zrychlí, a hráčem, který se začne bát chyby.",
    uroven: {
      nizka:
        "Tým hraje, ale neví přesně proč. Motivace přichází zvenčí: z výsledkové " +
        "listiny, z očekávání okolí, ze strachu ze ztráty místa v sestavě. Taková " +
        "motivace funguje, dokud se daří, a v krizi zmizí právě ve chvíli, kdy je " +
        "potřeba nejvíc. Je to nejvážnější zjištění z celého profilu, protože všechno " +
        "ostatní na něm stojí.",
      stredni:
        "Většina týmu má důvod, proč hraje, ale nedrží ho pořád. V dobrém období je " +
        "vidět, v horším ho přebije výsledek. Prakticky to znamená, že tým zvládne " +
        "jednu prohru, ale série tří ho začne měnit.",
      vysoka:
        "Tým ví, proč hraje, a ta znalost drží i tehdy, když se nedaří. To je nejlepší " +
        "možný základ, protože každá další práce na něm stojí. Prohra je pro tenhle " +
        "tým informace, ne rozsudek.",
    },
    tvar: {
      vyrovnana:
        "Vztah k vlastní hře má tým podobný napříč kádrem. Dá se o něm mluvit " +
        "společně a společně na něm pracovat.",
      rozptyl:
        "Jeden nebo dva hráči mají k vlastní hře výrazně jiný vztah než zbytek. " +
        "Není to věc týmové porady; je to věc rozhovoru s nimi.",
      zlom:
        "Kádr se dělí na dvě skupiny: jedna hraje z vlastního důvodu, druhá kvůli " +
        "očekávání okolí. Ty dvě skupiny slyší stejnou předzápasovou řeč úplně jinak. " +
        "Věta „tohle je naše šance“ jednu nabudí a druhou zatíží.",
      plosna:
        "Chybí to celému týmu naráz, a to už není součet individuálních příběhů. " +
        "Takhle vypadá prostředí, kde se dlouhodobě mluví o výsledcích a nemluví " +
        "o důvodech. Řeší se to změnou toho, o čem se v týmu mluví, ne prací " +
        "s jednotlivci.",
    },
    prace: [
      "Zaveď na začátku sezony individuální rozhovor o důvodu, ne o cíli. Cíl je " +
        "„top 4 v konferenci“; důvod je to, co zbude, když se cíl nepovede.",
      "Po prohře oddělte hodnocení výkonu od hodnocení člověka, a to nahlas a pokaždé " +
        "stejně. Ne „byli jste špatní“, ale „tohle konkrétně nefungovalo“.",
      "Do týdenního rytmu dej jednu věc, která se nehodnotí výsledkem. Pravidelnost je " +
        "důležitější než obsah.",
    ],
    znaky: [
      "Po prohře se v šatně mluví o hře, ne o sobě.",
      "Hráči dokážou popsat dobrý výkon i v zápase, který prohráli.",
    ],
    otazky: [
      "Co by ti na tomhle sportu chybělo, kdyby to zítra skončilo?",
      "Kdy naposledy ti hra udělala radost bez ohledu na výsledek?",
    ],
  },

  B: {
    coMeri:
      "Jak si hráč věří ve svou hru a jak se sebou mluví, když se nedaří. Jsou to dvě " +
      "různé věci a v týmu se často rozcházejí.",
    procZalezi:
      "Sebedůvěra rozhoduje o tom, jestli hráč v klíčové výměně zahraje svou hru, nebo " +
      "hru bezpečnou. Vnitřní dialog rozhoduje o tom, jak dlouho trvá návrat po chybě. " +
      "Hráč, který se po chybě sepsuje, ztrácí následující dva až tři míče, i když " +
      "technicky umí všechno.",
    uroven: {
      nizka:
        "Tým do zápasů nastupuje s pochybností. Projevuje se to hrou na jistotu, ne " +
        "strachem: hráči volí řešení, které nemůže selhat viditelně, místo řešení, " +
        "které může vyhrát. Ve statistice to vypadá jako málo nevynucených chyb a " +
        "málo vítězných úderů zároveň.",
      stredni:
        "Sebedůvěra v týmu je, ale je navázaná na formu. Po dobrém týdnu je jí dost, " +
        "po špatném zmizí. Tým tak hraje v amplitudě: dvě kola nad možnosti, dvě pod ně.",
      vysoka:
        "Tým si věří a věří si i po chybě, což je vzácnější kombinace. Na tuhle oblast " +
        "se dá stavět, když se pracuje na něčem těžším jinde.",
    },
    tvar: {
      vyrovnana:
        "Sebedůvěra je v týmu rozložená rovnoměrně, takže společná příprava dává smysl.",
      rozptyl:
        "Někdo v týmu je se sebou výrazně tvrdší než zbytek. Bývá to hráč, na kterého " +
        "je zvenčí vidět největší nasazení, a proto si toho nikdo nevšimne včas.",
      zlom:
        "Tým má dvě skupiny: jedna po chybě pokračuje, druhá se zasekne. Pokud stojí " +
        "na hřišti vedle sebe, přenáší se to během jediné výměny.",
      plosna:
        "Nízká sebedůvěra napříč kádrem obvykle není o hráčích, ale o tom, jak se " +
        "v týmu mluví o chybě. Podívej se, co se stane během tří vteřin po chybě " +
        "na tréninku; tam ta odpověď leží.",
    },
    prace: [
      "Zaveď pevnou reakci na chybu, kterou má celý tým stejnou a nacvičenou: krátký " +
        "fyzický signál, jedno slovo, návrat k rutině. Cílem není chybu potlačit, " +
        "ale zkrátit dobu návratu.",
      "Nech hráče před zápasem pojmenovat tři věci, které umí, ne tři věci, na které " +
        "si mají dát pozor. Pozornost jde tam, kam ji pošleš.",
      "Sleduj, po kolika míčích se hráč vrátí do hry po chybě, a měř to. Je to " +
        "trénovatelné a je to vidět dřív než v jakémkoli dotazníku.",
    ],
    znaky: [
      "Doba návratu po chybě se zkracuje a je vidět i v zápase, ne jen na tréninku.",
      "Hráči v klíčových momentech volí aktivní řešení, ne to nejbezpečnější.",
    ],
    otazky: [
      "Co si říkáš hned po tom, co uděláš chybu?",
      "Jak často se ti v důležitém momentě povede zahrát přesně to, co chceš?",
    ],
  },

  C: {
    coMeri:
      "Schopnost udržet pozornost tam, kde má být, a hlavně ji vrátit zpátky, když " +
      "uteče. Ne soustředění jako vlastnost, ale znovuzaměření jako dovednost.",
    procZalezi:
      "Pozornost se ztrácí každému a pořád. Rozdíl mezi hráči není v tom, jestli jim " +
      "myšlenky utečou, ale za jak dlouho si toho všimnou a co udělají pak. Právě " +
      "tenhle interval odděluje jednu ztracenou výměnu od ztraceného setu.",
    uroven: {
      nizka:
        "Tým ztrácí nit a nemá čím ji chytit. Nejde o nedostatek snahy; chybí postup, " +
        "kterým se pozornost vrací. Bez něj se hráč snaží soustředit víc, což pozornost " +
        "zužuje na vlastní hlavu a problém prohlubuje.",
      stredni:
        "Pozornost tým udrží, dokud jde všechno podle plánu. Jakmile přijde nečekaná " +
        "věc, výpadek proudu, dlouhá pauza, hlasitý protivník, trvá návrat příliš " +
        "dlouho.",
      vysoka:
        "Tým se umí vracet do hry rychle a má na to postup, ne jen vůli. To je " +
        "dovednost, která drží i ve chvíli, kdy sebedůvěra kolísá.",
    },
    tvar: {
      vyrovnana:
        "Práce s pozorností je v týmu podobná, takže se dá trénovat společně.",
      rozptyl:
        "Jednomu hráči pozornost utíká výrazně víc než ostatním. Než z toho uděláš " +
        "otázku přístupu, zkontroluj spánek, studijní zátěž a zdravotní stav.",
      zlom:
        "Půlka týmu má rutiny a půlka žádné. Rozdíl se ukáže v druhé polovině zápasů " +
        "a při dlouhých turnajích, ne na tréninku.",
      plosna:
        "Chybí to celému týmu, což znamená, že se to nikdy systematicky netrénovalo. " +
        "Je to současně nejrychleji napravitelná oblast z celého profilu.",
    },
    prace: [
      "Zaveď jednu pevnou rutinu mezi body nebo mezi úseky hry a nacvič ji do " +
        "automatismu. Rutina není pověra; je to spouštěč, který nahrazuje rozhodování " +
        "ve chvíli, kdy na rozhodování není kapacita.",
      "Trénuj s rušením záměrně: hluk, publikum, komentář zvenčí, změněné podmínky. " +
        "Pozornost natrénovaná v tichu v hluku nefunguje.",
      "Uč hráče pojmenovat, kam pozornost utekla, jedním slovem. Pojmenování zkracuje " +
        "návrat víc než snaha na to nemyslet.",
    ],
    znaky: [
      "Zkracují se série ztracených výměn po jedné chybě.",
      "Hráči drží úroveň i ve druhé polovině zápasu a druhý den turnaje.",
    ],
    otazky: [
      "Kam ti myšlenky utečou nejčastěji, když jde o hodně?",
      "Co konkrétně děláš mezi body?",
    ],
  },

  D: {
    coMeri:
      "Co se s hráčem děje pod tlakem: jestli pozná, co se s ním děje v těle, jestli " +
      "s tím umí něco udělat, a jestli velký zápas vnímá jako příležitost, nebo jako " +
      "ohrožení.",
    procZalezi:
      "Tělo reaguje na tlak dřív, než si toho hlava všimne. Kdo signály nepozná, " +
      "vysvětlí si zrychlený tep jako strach a začne hrát tak, aby to skončilo. " +
      "Kdo je pozná, má z nich informaci a čas zasáhnout. Tohle je oblast, ve které " +
      "se rozhodují vyrovnané zápasy.",
    uroven: {
      nizka:
        "Tlak tým rozhodí a chybí nástroje, jak s tím naložit. Velké zápasy se hrají " +
        "jinak než tréninky, a to je ten nejdražší rozdíl, jaký v profilu může být, " +
        "protože se projeví přesně tehdy, když na tom nejvíc záleží.",
      stredni:
        "Tým tlak zvládá do určité hranice. Nad ní se hra zjednodušuje a rozhodování " +
        "zpomaluje. Hranice se dá posunout, ale jen tréninkem pod skutečným tlakem, " +
        "ne mluvením o něm.",
      vysoka:
        "Tým pod tlakem funguje a v důležitých zápasech se nezmenšuje. Je to " +
        "konkurenční výhoda a stojí za to ji chránit tím, že se tlak trénuje dál.",
    },
    tvar: {
      vyrovnana:
        "Tým reaguje na tlak podobně, takže společná předzápasová příprava dává smysl.",
      rozptyl:
        "Jeden hráč reaguje na tlak výrazně jinak než zbytek. V individuálním sportu " +
        "to stačí k tomu, aby se rozhodl mezistátní zápas.",
      zlom:
        "Tohle je nejvážnější tvar, jaký v týmu může být. Dokud se hraje v klidu, " +
        "není vidět; jakmile jde o hodně, mužstvo se rozdělí a první polovina místo " +
        "hraní začne řešit druhou. Tým tak ztrácí dvakrát.",
      plosna:
        "Práce s tlakem chybí celému kádru rovnoměrně. Znamená to, že se tlak nikdy " +
        "netrénoval, jen se v něm hrálo a doufalo.",
    },
    prace: [
      "Trénuj pod tlakem, ne s tlakem na výsledek. Časový limit, publikum, důsledek " +
        "za chybu, nerovný start. Bez toho se hranice neposune.",
      "Nauč hráče jednu dechovou techniku tak, aby ji uměli použít bez přemýšlení. " +
        "Jedna zvládnutá je lepší než pět známých.",
      "Před klíčovým zápasem převeď cíl z výsledku na proces: dvě až tři konkrétní " +
        "věci, které má hráč udělat. Hrozba se tím mění ve výzvu, což je měřitelný " +
        "rozdíl ve fyziologii, ne rétorická figura.",
    ],
    znaky: [
      "Rozdíl mezi výkonem na tréninku a v důležitém zápase se zmenšuje.",
      "Hráči po zápase dokážou popsat, co cítili, ne jen jak dopadli.",
    ],
    otazky: [
      "Podle čeho poznáš, že na tebe jde tlak, ještě než začne zápas?",
      "Co ti v takové chvíli pomáhá a co naopak nefunguje?",
    ],
  },

  E: {
    coMeri:
      "Jestli hráč věří, že se dá zlepšit, a co udělá po neúspěchu: jestli přidá, " +
      "nebo se stáhne.",
    procZalezi:
      "Přesvědčení o vlastní zlepšitelnosti rozhoduje o tom, co hráč udělá s těžkým " +
      "tréninkem. Kdo věří, že se schopnosti dají rozvíjet, bere obtížnost jako " +
      "cestu; kdo ne, bere ji jako důkaz, že na to nemá, a začne se vyhýbat " +
      "situacím, kde by to mohlo být vidět.",
    uroven: {
      nizka:
        "Tým vnímá schopnosti jako danou věc. Prakticky to znamená, že se hráči " +
        "vyhýbají tomu, v čem jsou slabí, a trénink se tiše zužuje na to, co už umí. " +
        "Zvenčí to vypadá jako pilnost.",
      stredni:
        "Růstové nastavení tým má, ale drží ho jen do určité míry neúspěchu. Jedna " +
        "prohra ho neohrozí, delší série ano.",
      vysoka:
        "Tým bere obtížnost jako součást práce. Snese náročný trénink a nepotřebuje " +
        "průběžné potvrzování, že to jde.",
    },
    tvar: {
      vyrovnana: "Přístup k obtížnosti je v týmu podobný, dá se na něm stavět společně.",
      rozptyl:
        "Někdo v týmu snáší neúspěch výrazně hůř než ostatní a v náročném období " +
        "spadne dřív než zbytek.",
      zlom:
        "Půlka týmu roste na obtížnosti, druhá se jí vyhýbá. Stejně náročný trénink " +
        "tak jednu polovinu posouvá a druhou vyčerpává.",
      plosna:
        "Vyhýbání se obtížnosti napříč kádrem bývá odpovědí na prostředí, kde chyba " +
        "něco stojí. Podívej se, co se v týmu stane po nepovedeném pokusu.",
    },
    prace: [
      "Zadávej úkoly, u kterých je neúspěch očekávaný a bez následku. Hráč se musí " +
        "opakovaně setkat s tím, že to nešlo, a nic se nestalo.",
      "Oceňuj volbu obtížnosti, ne výsledek pokusu. Odměna za snadné vítězství učí " +
        "tým vybírat si snadná vítězství.",
      "Ukazuj vlastní vývojové křivky hráčů v čase. Data o zlepšení jsou proti " +
        "přesvědčení „na to nemám“ silnější než povzbuzení.",
    ],
    znaky: [
      "Hráči si sami vybírají těžší variantu cvičení, když mají volbu.",
      "Po nepovedeném tréninku přijdou další den připravení, ne opatrní.",
    ],
    otazky: [
      "Co je poslední věc, kterou se ti povedlo zlepšit, a jak dlouho to trvalo?",
      "Co děláš, když ti něco nejde třetí týden po sobě?",
    ],
  },

  F: {
    coMeri:
      "Jestli tým dělá to, co má, i když se mu nechce, a jestli si dopřává " +
      "regeneraci. Návyky a odpočinek dohromady, protože jedno bez druhého nedává " +
      "smysl.",
    procZalezi:
      "Disciplína bez regenerace není přednost, je to trajektorie ke zranění a " +
      "k propadu ve druhé polovině sezony. V univerzitním sportu, kde se ke " +
      "sportovní zátěži přidává studijní, je nedostatek spánku nejčastější " +
      "jednotlivou příčinou poklesu výkonu, na kterou se přitom nikdy neukáže.",
    uroven: {
      nizka:
        "Návyky v týmu nedrží. Trénink probíhá, ale to, co je kolem něj, se dělá " +
        "podle nálady. Výsledek je nevyrovnaný výkon, který nikdo neumí vysvětlit, " +
        "protože příčina leží mimo hřiště.",
      stredni:
        "Základní návyky tým má, ale v zátěžovém období je pouští jako první. " +
        "Přesně tehdy, kdy je potřebuje nejvíc.",
      vysoka:
        "Tým má návyky pod kontrolou. Je to oblast, o kterou se dá opřít, když se " +
        "pracuje na něčem těžším jinde.",
    },
    tvar: {
      vyrovnana:
        "Návyky má tým srovnané podobně, takže společná pravidla fungují.",
      rozptyl:
        "Jeden nebo dva hráči mají režim výrazně jinde než zbytek. U regenerace to " +
        "bývá ten nejpilnější člověk v týmu.",
      zlom:
        "Tým se dělí na ty, kdo režim drží, a ty, kdo ne. Společná pravidla pak " +
        "jednu skupinu zbytečně svazují a druhou stejně neudrží.",
      plosna:
        "Chybí to všem naráz, což z toho dělá věc plánu, ne kázně. Podívej se na " +
        "rozvrh, cestování a studijní zátěž dřív, než začneš mluvit o přístupu.",
    },
    prace: [
      "Zaveď měření spánku na dva týdny bez jakéhokoli hodnocení. Samotné měření " +
        "obvykle změní chování dřív než pravidlo.",
      "Napiš regeneraci do plánu jako trénink, se stejnou závazností. Co není " +
        "v plánu, to v zátěžovém týdnu vypadne první.",
      "Nastav minimální standardy pro nejnáročnější období dopředu, ne až v něm. " +
        "V únavě se dobrá rozhodnutí nedělají.",
    ],
    znaky: [
      "Výkon ve druhé polovině sezony neklesá tak jako dřív.",
      "Ubývá drobných zranění z přetížení a nemocí v zátěžových týdnech.",
    ],
    otazky: [
      "Kolik hodin spánku máš tenhle týden za sebou?",
      "Co ti první vypadne z režimu, když máš zkouškové?",
    ],
  },

  G: {
    coMeri:
      "Jaké je v týmu prostředí: jestli se dá nahlas říct nepříjemná věc, jestli si " +
      "hráči umí říct o pomoc a jestli mají o koho se opřít.",
    procZalezi:
      "Prostředí rozhoduje o tom, jestli se problém řeší v den, kdy vznikne, nebo " +
      "za tři týdny, kdy je z něj něco jiného. Tým, ve kterém se nepříjemná věc " +
      "neřekne, se v posledních minutách nepřeskupí, protože to nikdo nezačne. " +
      "Zvenčí přitom vypadá klidně a soudržně.",
    uroven: {
      nizka:
        "V týmu chybí bezpečí říct nepříjemnou věc. Neznamená to, že jsou hráči " +
        "tiší nebo že si nerozumí; znamená to, že se problémy neřeší v okamžiku, " +
        "kdy jsou malé. Ve výsledku se všechno objeví najednou a pozdě.",
      stredni:
        "Komunikace v týmu funguje, dokud se daří. Ve chvíli, kdy je napětí, se " +
        "ztiší, a to je přesně obráceně, než by potřebovala.",
      vysoka:
        "Tým má prostředí, ve kterém se dá mluvit. Je to nejsilnější věc, jakou " +
        "může mít, protože zrychluje řešení všeho ostatního.",
    },
    tvar: {
      vyrovnana:
        "Prostředí vnímá tým podobně, což bývá dobrá zpráva o kultuře.",
      rozptyl:
        "Jeden hráč zažívá tým výrazně jinak než ostatní. U přestupů, prváků a " +
        "hráčů vracejících se po zranění je to obvyklé a samo to nepřejde. Není to " +
        "věc týmové porady, je to věc jednoho rozhovoru, který uděláš ty.",
      zlom:
        "V týmu jsou dvě skupiny s velmi odlišnou zkušeností. Bývá to jádro a " +
        "okraj sestavy, nebo starší a mladší ročník. Kdo je uvnitř, nevidí, že " +
        "nějaký okraj existuje.",
      plosna:
        "Chybějící bezpečí napříč kádrem je věc vedení, ne hráčů. Rozhoduje se " +
        "o něm tím, co se stane, když někdo přinese špatnou zprávu.",
    },
    prace: [
      "Zaveď krátký pravidelný formát, kde se mluví o tom, co nefunguje, a odděl " +
        "ho od hodnocení výkonu. Bez odděleného místa se nepříjemná věc neřekne.",
      "Reaguj na první špatnou zprávu tak, aby to viděli ostatní. Kultura se " +
        "nastavuje tímhle jedním okamžikem, ne prohlášením.",
      "U nových hráčů, hráčů po zranění a hráčů mimo sestavu si domluv rozhovor " +
        "sám, nečekej, až přijdou. Ti, kdo pomoc potřebují nejvíc, si o ni řeknou " +
        "nejmíň.",
    ],
    znaky: [
      "Problémy přicházejí dřív a menší, než jsi zvyklý.",
      "Ozve se i někdo, kdo obvykle mlčí, a nic se mu nestane.",
    ],
    otazky: [
      "Kdyby ti něco nesedělo, za kým s tím jdeš? A jdeš vůbec?",
      "Co v týmu nikdo neřekne nahlas, i když to všichni vědí?",
    ],
  },
}


const EN: VykladOblasti = {
  A: {
    coMeri:
      "Whether the player knows why they play this sport, and whether their sense of " +
      "worth rests on something other than the most recent result.",
    procZalezi:
      "Identity decides what happens after a loss. A player whose worth rides on results " +
      "does not lose a match, they lose a piece of themselves, and the following week " +
      "they train to feel better rather than to get better. Across a two-year cycle this " +
      "is the difference between a player who accelerates after failure and one who " +
      "starts playing not to make mistakes.",
    uroven: {
      nizka:
        "The team plays without knowing quite why. Motivation arrives from outside: the " +
        "rankings, other people's expectations, the fear of losing a spot in the lineup. " +
        "That kind of motivation works while things go well and disappears exactly when " +
        "it is needed most. This is the most serious finding in the whole profile, " +
        "because everything else stands on it.",
      stredni:
        "Most of the squad has a reason to play, but does not hold it consistently. It is " +
        "visible in a good stretch and gets overwritten by results in a bad one. In " +
        "practice the team absorbs one loss but a run of three starts to change it.",
      vysoka:
        "The team knows why it plays and that knowledge holds when results do not. This " +
        "is the best possible foundation, because every other piece of work rests on it. " +
        "For this team a loss is information, not a verdict.",
    },
    tvar: {
      vyrovnana:
        "The squad relates to its own game in much the same way across the roster. It can " +
        "be addressed collectively and worked on collectively.",
      rozptyl:
        "One or two players relate to their own game very differently from the rest. This " +
        "is not a team-meeting matter; it is a conversation with them.",
      zlom:
        "The roster splits in two: one group plays for its own reasons, the other for " +
        "other people's expectations. Those two groups hear the same pre-match speech in " +
        "completely different ways. The line “this is our shot” lifts one and loads the " +
        "other.",
      plosna:
        "The whole team lacks it at once, and that is no longer a set of individual " +
        "stories. This is what an environment looks like when results get talked about " +
        "for years and reasons do not. It is fixed by changing what the team talks about, " +
        "not by working with individuals.",
    },
    prace: [
      "Open the season with an individual conversation about the reason, not the goal. " +
        "The goal is “top four in the conference”; the reason is what remains when the " +
        "goal does not happen.",
      "After a loss, separate the judgement of the performance from the judgement of the " +
        "person, out loud and the same way every time. Not “you were bad”, but “this " +
        "specific thing did not work”.",
      "Put one thing into the weekly rhythm that is never judged on outcome. Doing it " +
        "consistently matters more than what it is.",
    ],
    znaky: [
      "After a loss the locker room talks about the game, not about themselves.",
      "Players can describe a good performance inside a match they lost.",
    ],
    otazky: [
      "What would you miss about this sport if you stopped tomorrow?",
      "When did you last enjoy playing regardless of the result?",
    ],
  },

  B: {
    coMeri:
      "How much the player trusts their own game, and how they speak to themselves when " +
      "it goes wrong. These are two different things and in a squad they often diverge.",
    procZalezi:
      "Confidence decides whether a player plays their own game in a decisive rally or " +
      "the safe one. Inner dialogue decides how long the return takes after an error. A " +
      "player who berates themselves after a mistake loses the next two or three points " +
      "as well, no matter how complete their technique is.",
    uroven: {
      nizka:
        "The team walks into matches carrying doubt. It shows up as safe play rather than " +
        "visible fear: players pick the option that cannot fail conspicuously instead of " +
        "the one that could win. In the statistics it looks like few unforced errors and " +
        "few winners at the same time.",
      stredni:
        "Confidence is there but it is tied to form. After a good week there is plenty, " +
        "after a bad one it is gone. The team plays in an amplitude: two rounds above its " +
        "level, two below it.",
      vysoka:
        "The team trusts itself and keeps trusting itself after a mistake, which is the " +
        "rarer combination. This is an area to lean on while harder work goes on " +
        "elsewhere.",
    },
    tvar: {
      vyrovnana:
        "Confidence is spread evenly across the squad, so shared preparation makes sense.",
      rozptyl:
        "Someone in this team is markedly harder on themselves than the rest. It tends to " +
        "be the player who visibly works hardest, which is why nobody catches it in time.",
      zlom:
        "The team has two groups: one plays on after an error, the other locks up. If " +
        "they stand next to each other on court, it transfers within a single rally.",
      plosna:
        "Low confidence across a roster is usually not about the players but about how " +
        "the team talks about mistakes. Watch what happens in the three seconds after an " +
        "error in practice; the answer is there.",
    },
    prace: [
      "Install one fixed, rehearsed response to a mistake that the whole team shares: a " +
        "short physical signal, one word, back to the routine. The aim is not to suppress " +
        "the error but to shorten the return.",
      "Before a match have players name three things they can do, not three things to " +
        "watch out for. Attention goes where you send it.",
      "Track how many points it takes a player to get back into the match after an error. " +
        "It is trainable and it shows up long before any questionnaire does.",
    ],
    znaky: [
      "Recovery time after an error shortens, and it shows in matches, not only in practice.",
      "In decisive moments players choose the active option rather than the safest one.",
    ],
    otazky: [
      "What do you say to yourself immediately after a mistake?",
      "When did you last play the shot you actually wanted in a big moment?",
    ],
  },

  C: {
    coMeri:
      "The ability to hold attention where it belongs and, above all, to bring it back " +
      "when it wanders. Not concentration as a trait, but refocusing as a skill.",
    procZalezi:
      "Attention drifts for everyone, constantly. What separates players is not whether " +
      "their mind wanders but how quickly they notice and what they do next. That " +
      "interval is what separates one lost rally from a lost set.",
    uroven: {
      nizka:
        "The team loses the thread and has nothing to catch it with. This is not a lack " +
        "of effort; there is no procedure for bringing attention back. Without one, a " +
        "player tries to concentrate harder, which narrows attention onto their own head " +
        "and deepens the problem.",
      stredni:
        "The team holds attention as long as everything goes to plan. As soon as " +
        "something unexpected arrives, a rain delay, a long break, a loud opponent, the " +
        "return takes too long.",
      vysoka:
        "The team gets back into the match quickly and has a procedure for it, not just " +
        "willpower. This skill holds even when confidence wobbles.",
    },
    tvar: {
      vyrovnana: "Attention work is similar across the squad, so it can be trained together.",
      rozptyl:
        "One player's attention drifts far more than the others'. Before you make it a " +
        "question of attitude, check sleep, academic load and health.",
      zlom:
        "Half the team has routines and half has none. The gap shows in the second half " +
        "of matches and on the later days of a tournament, not in practice.",
      plosna:
        "The whole squad lacks it, which means it has never been trained systematically. " +
        "It is also the fastest area in this profile to improve.",
    },
    prace: [
      "Install one fixed routine between points or between passages of play and rehearse " +
        "it to automaticity. A routine is not superstition; it is a trigger that replaces " +
        "decision-making at the moment when there is no capacity to decide.",
      "Train with deliberate interference: noise, spectators, comments from outside, " +
        "changed conditions. Attention trained in silence does not survive noise.",
      "Teach players to name where their attention went in a single word. Naming shortens " +
        "the return far more than trying not to think about it.",
    ],
    znaky: [
      "Runs of lost points following a single error get shorter.",
      "Players hold their level into the second half of matches and the second day of an event.",
    ],
    otazky: [
      "Where does your mind go most often when it matters?",
      "What exactly do you do between points?",
    ],
  },

  D: {
    coMeri:
      "What happens to a player under pressure: whether they notice what their body is " +
      "doing, whether they can do anything about it, and whether they read a big match " +
      "as an opportunity or a threat.",
    procZalezi:
      "The body responds to pressure before the mind notices. A player who cannot read " +
      "the signals interprets a raised heart rate as fear and starts playing to make it " +
      "end. A player who can read them gets information and time to act. This is the area " +
      "where close matches are decided.",
    uroven: {
      nizka:
        "Pressure derails this team and there are no tools to handle it. Big matches are " +
        "played differently from practice, and that is the most expensive gap a profile " +
        "can contain, because it appears exactly when it costs the most.",
      stredni:
        "The team handles pressure up to a point. Past it, the game simplifies and " +
        "decisions slow down. That threshold can be moved, but only by training under " +
        "real pressure, not by talking about it.",
      vysoka:
        "The team functions under pressure and does not shrink in matches that matter. " +
        "This is a competitive advantage and it is worth protecting by continuing to " +
        "train pressure.",
    },
    tvar: {
      vyrovnana:
        "The squad responds to pressure in similar ways, so shared pre-match preparation " +
        "makes sense.",
      rozptyl:
        "One player responds to pressure very differently from the rest. In an individual " +
        "sport that alone is enough to decide a dual match.",
      zlom:
        "This is the most serious shape a team can have. While the match is calm it is " +
        "invisible; as soon as it matters, the squad divides and the first half stops " +
        "playing and starts managing the second. The team loses twice.",
      plosna:
        "Pressure work is missing evenly across the roster. It means pressure has never " +
        "been trained, only endured and hoped through.",
    },
    prace: [
      "Train under pressure, not with pressure on the result. Time limits, an audience, " +
        "a consequence for an error, an uneven start. Without that the threshold does not " +
        "move.",
      "Teach one breathing technique until it can be used without thinking. One mastered " +
        "beats five known.",
      "Before a key match convert the goal from outcome to process: two or three concrete " +
        "things to do. That shifts threat into challenge, which is a measurable difference " +
        "in physiology, not a figure of speech.",
    ],
    znaky: [
      "The gap between practice level and big-match level narrows.",
      "After a match players can describe what they felt, not only how it finished.",
    ],
    otazky: [
      "How do you know pressure is coming before the match even starts?",
      "What helps you in those moments, and what have you tried that does not?",
    ],
  },

  E: {
    coMeri:
      "Whether the player believes ability can be developed, and what they do after " +
      "failure: push harder or withdraw.",
    procZalezi:
      "Beliefs about improvability decide what a player does with a hard session. Someone " +
      "who believes ability grows treats difficulty as the route; someone who does not " +
      "treats it as proof they lack the talent, and starts avoiding situations where that " +
      "would be visible.",
    uroven: {
      nizka:
        "The team treats ability as fixed. In practice that means players avoid what they " +
        "are weak at, and training quietly narrows to what they already do well. From the " +
        "outside it looks like diligence.",
      stredni:
        "The growth stance is there but holds only up to a point of failure. One loss does " +
        "not threaten it, a longer run does.",
      vysoka:
        "The team treats difficulty as part of the job. It can absorb demanding training " +
        "without needing constant reassurance that it is working.",
    },
    tvar: {
      vyrovnana: "The squad approaches difficulty similarly, so it can be built on collectively.",
      rozptyl:
        "Someone in the team takes failure much harder than the others and will drop " +
        "earlier in a demanding stretch.",
      zlom:
        "Half the team grows on difficulty and half avoids it. The same demanding session " +
        "therefore develops one half and drains the other.",
      plosna:
        "Avoidance of difficulty across a roster is usually an answer to an environment " +
        "where mistakes cost something. Look at what happens after a failed attempt.",
    },
    prace: [
      "Set tasks where failure is expected and carries no consequence. Players need " +
        "repeated experience of it not working and nothing happening.",
      "Reward the choice of difficulty, not the outcome of the attempt. Rewarding easy " +
        "wins teaches a squad to pick easy wins.",
      "Show players their own development curves over time. Data about improvement beats " +
        "encouragement when the belief being argued with is “I do not have it”.",
    ],
    znaky: [
      "Given a choice, players pick the harder version of a drill.",
      "After a poor session they arrive the next day prepared rather than cautious.",
    ],
    otazky: [
      "What is the last thing you got better at, and how long did it take?",
      "What do you do when something has not worked for three weeks running?",
    ],
  },

  F: {
    coMeri:
      "Whether the team does what it is supposed to do when it does not feel like it, and " +
      "whether it allows itself to recover. Habits and rest together, because neither " +
      "makes sense without the other.",
    procZalezi:
      "Discipline without recovery is not a virtue, it is a trajectory towards injury and " +
      "a drop in the second half of the season. In college sport, where academic load " +
      "stacks on top of training load, insufficient sleep is the single most common cause " +
      "of performance decline, and the one that never shows up on the stat sheet.",
    uroven: {
      nizka:
        "Habits do not hold in this team. Training happens, but everything around it is " +
        "done by mood. The result is inconsistent performance nobody can explain, because " +
        "the cause sits off the court.",
      stredni:
        "Basic habits exist but are the first thing dropped in a heavy stretch. Precisely " +
        "when they are needed most.",
      vysoka:
        "The team has its habits under control. This is an area to lean on while harder " +
        "work goes on elsewhere.",
    },
    tvar: {
      vyrovnana: "Habits sit at a similar level across the squad, so shared rules work.",
      rozptyl:
        "One or two players run a very different routine from the rest. Where recovery is " +
        "concerned it is usually the hardest-working person on the roster.",
      zlom:
        "The team divides into those who keep a routine and those who do not. Shared rules " +
        "then constrain one group unnecessarily and fail to hold the other anyway.",
      plosna:
        "It is missing for everyone at once, which makes it a scheduling problem rather " +
        "than a discipline problem. Look at the timetable, the travel and the academic " +
        "load before you talk about attitude.",
    },
    prace: [
      "Measure sleep for two weeks with no judgement attached. The measurement alone " +
        "usually changes behaviour faster than a rule does.",
      "Write recovery into the plan as a session, with the same standing. Whatever is not " +
        "in the plan is the first thing to disappear in a heavy week.",
      "Set minimum standards for the hardest stretch in advance, not once you are in it. " +
        "Good decisions do not get made inside fatigue.",
    ],
    znaky: [
      "Performance in the second half of the season holds up better than it used to.",
      "Fewer small overload injuries and illnesses during heavy weeks.",
    ],
    otazky: [
      "How many hours did you actually sleep this week?",
      "What is the first thing to fall out of your routine during exams?",
    ],
  },

  G: {
    coMeri:
      "What the environment is like: whether an uncomfortable thing can be said out loud, " +
      "whether players can ask for help, and whether they have someone to lean on.",
    procZalezi:
      "The environment decides whether a problem gets addressed on the day it appears or " +
      "three weeks later when it has turned into something else. A team where the " +
      "uncomfortable thing goes unsaid will not regroup in the closing minutes, because " +
      "nobody starts. From the outside it looks calm and united.",
    uroven: {
      nizka:
        "There is no safety in this team to say an uncomfortable thing. It does not mean " +
        "the players are quiet or that they dislike each other; it means problems do not " +
        "get handled while they are small. Everything then surfaces at once and late.",
      stredni:
        "Communication works while things go well. Under tension it goes quiet, which is " +
        "precisely the opposite of what it needs to do.",
      vysoka:
        "This team has an environment where things can be said. It is the strongest asset " +
        "a squad can hold, because it speeds up the resolution of everything else.",
    },
    tvar: {
      vyrovnana: "The squad experiences the environment similarly, which is usually good news about the culture.",
      rozptyl:
        "One player experiences this team very differently from everyone else. With " +
        "transfers, freshmen and players returning from injury this is common and it does " +
        "not resolve on its own. It is not a team-meeting matter; it is one conversation, " +
        "and you are the one who starts it.",
      zlom:
        "There are two groups with very different experiences of the same team. It is " +
        "usually the core and the edge of the lineup, or older and younger classes. " +
        "Whoever is inside cannot see that an edge exists.",
      plosna:
        "Missing safety across a roster is a leadership matter, not a player matter. It is " +
        "decided by what happens when somebody brings bad news.",
    },
    prace: [
      "Install a short regular format for talking about what is not working, and keep it " +
        "separate from performance review. Without a separate place, the uncomfortable " +
        "thing never gets said.",
      "Respond to the first piece of bad news in a way the others can see. Culture is set " +
        "by that single moment, not by a statement.",
      "With new players, players returning from injury and players out of the lineup, book " +
        "the conversation yourself instead of waiting for them. The people who need help " +
        "most ask for it least.",
    ],
    znaky: [
      "Problems arrive earlier and smaller than you are used to.",
      "Someone who normally stays quiet speaks up, and nothing bad happens to them.",
    ],
    otazky: [
      "Who would you go to if something was wrong, and would you actually go?",
      "What does nobody in this team say out loud even though everyone knows it?",
    ],
  },
}

export const VYKLAD: Record<TymLang, VykladOblasti> = { cs: CS, en: EN }
