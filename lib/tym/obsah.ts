import type { DimensionId } from "../diagnostic/types"
import type { NalezKod } from "./typy"

// Texty týmového reportu.
//
// Píše se koučovi, ne hráči: je to podklad pro rozhodování o tréninku, sestavě
// a o tom, co se říká v kabině. Proto u každého nálezu stojí, co je v datech
// vidět, co to se skupinou dělá pod tlakem, co s tím dělat a co naopak nedělat.
//
// Poslední bod je tam schválně. Většina zásahů, které kouč u daného profilu
// zvolí intuitivně, ho zhorší: na tým, který se pod tlakem dělí, se nedává
// společná předzápasová řeč, a týmu, který dře a neregeneruje, se nepřidává
// zátěž. Bez téhle části je report popis, ne nástroj.
//
// Názvy oblastí jsou tu opsané schválně, ne brané ze structure.ts: tam jsou
// vedle nich vyhodnocovací klíče a ty do prohlížeče klubového kouče nepatří.
//
// Týmová větev jede jen česky a anglicky, slovenština se v ní nenabízí.

export type TymLang = "cs" | "en"

export interface NalezText {
  nadpis: string
  coJeVidet: string
  coToDela: string
  coSTim: string[]
  coNedelat: string
}

export interface TymTexty {
  titul: string
  podtitul: string
  pocty: (odevzdano: number, pozvano: number) => string
  maloDatTitul: string
  maloDat: string

  oblastiTitul: string
  oblastiUvod: string
  legendaUroven: string
  legendaRozptyl: string
  plosna: string
  rozkol: string

  oporyTitul: string
  oporyUvod: string
  prioritTitul: string
  prioritUvod: string
  zlomyTitul: string
  zlomyUvod: string
  zadne: string

  nalezyTitul: string
  nalezyUvod: string
  prvniPraskne: string
  stitkyNalezu: { coJeVidet: string; coToDela: string; coSTim: string; coNedelat: string }
  bezNalezu: string

  oblasti: Record<DimensionId, string>
  nalezy: Record<NalezKod, NalezText>
}

const CS: TymTexty = {
  titul: "Profil týmu",
  podtitul:
    "Co dotazníky říkají o skupině jako celku. Nejde o součet jednotlivců: " +
    "tým se pod tlakem chová jinak, než jak by se choval každý hráč sám.",
  pocty: (odevzdano, pozvano) =>
    `Vychází z ${odevzdano} odevzdaných dotazníků z ${pozvano} rozeslaných.`,
  maloDatTitul: "Málo odevzdaných dotazníků",
  maloDat:
    "Při tomhle počtu se profil týmu blíží profilu jednotlivce a dá se z něj " +
    "usuzovat na konkrétní hráče. Hráčům, kteří si nepřáli sdílet své vyhodnocení, " +
    "jsme slíbili opak, tak s tím podle toho zacházej. Vypovídací hodnota roste " +
    "výrazně zhruba od osmi odevzdaných dotazníků.",

  oblastiTitul: "Sedm oblastí napříč týmem",
  oblastiUvod:
    "U každé oblasti je úroveň i rozptyl. Rozptyl říká zpravidla víc: dva týmy " +
    "se stejnou úrovní se chovají úplně jinak podle toho, jestli jsou vyrovnané, " +
    "nebo rozdělené.",
  legendaUroven: "úroveň",
  legendaRozptyl: "rozptyl",
  plosna: "napříč celým kádrem",
  rozkol: "tým se dělí",

  oporyTitul: "O co se dá opřít",
  oporyUvod:
    "Oblasti, které má většina týmu silné a zároveň se v nich mužstvo nerozchází. " +
    "Vysoká úroveň s velkým rozptylem oporou není, protože pod tlakem se rozpadne.",
  prioritTitul: "Kde je práce nejpotřebnější",
  prioritUvod:
    "U každé z nich je vedle úrovně důležité, jestli je slabina rovnoměrná přes " +
    "celý kádr, nebo soustředěná do několika hráčů. Rovnoměrná slabina je věc " +
    "kultury a vedení, soustředěná je práce s jednotlivci.",
  zlomyTitul: "Kde se tým pod tlakem rozdělí",
  zlomyUvod:
    "V těchto oblastech nejde o obvyklý rozptyl, ale o dvě skupiny s mezerou mezi " +
    "sebou. Přijde tlak a mužstvo se rozpadne na ty, kdo si poradí, a ty, kdo ne.",
  zadne: "Nic takového se v profilu nenašlo.",

  nalezyTitul: "Co z toho plyne",
  nalezyUvod:
    "Hodnota není v jednotlivých oblastech, ale v jejich kombinacích. Vysoká " +
    "sebedůvěra sama o sobě je dobrá zpráva; vysoká sebedůvěra vedle chybějícího " +
    "bezpečí v komunikaci je něco úplně jiného.",
  prvniPraskne: "Tohle praskne první",
  stitkyNalezu: {
    coJeVidet: "Co je v datech vidět",
    coToDela: "Co to se skupinou dělá",
    coSTim: "Co s tím",
    coNedelat: "Co nedělat",
  },
  bezNalezu:
    "Žádná z kombinací, které sledujeme, se v tomhle profilu neprojevila. " +
    "Pracuj s oblastmi výš.",

  oblasti: {
    A: "Identita a vnitřní motivace",
    B: "Sebedůvěra a vnitřní dialog",
    C: "Koncentrace a řízení pozornosti",
    D: "Emoční regulace a výkon pod tlakem",
    E: "Odolnost a růstové nastavení mysli",
    F: "Disciplína, návyky a regenerace",
    G: "Vztahy, komunikace a prostředí",
  },

  nalezy: {
    "sebejista-ticha-satna": {
      nadpis: "Sebejistá kabina, která nemluví",
      coJeVidet:
        "Hráči si věří, sebedůvěra patří k nejsilnějším částem profilu. Zároveň je " +
        "nízko schopnost říct ve skupině nahlas nepříjemnou věc: pochybnost, chybu, " +
        "nesouhlas s tím, co se právě děje na hřišti.",
      coToDela:
        "Zvenčí to vypadá jako silný tým a ve vedení zápasu jím opravdu je. Problém " +
        "přijde ve chvíli, kdy se plán rozpadne a mužstvo se potřebuje přeskupit za " +
        "běhu. To vyžaduje, aby někdo řekl, že to nefunguje. Tady to neřekne nikdo, " +
        "protože každý spoléhá, že to zvládne sám. Výsledkem je tým, který dohraje " +
        "vyrovnaný zápas podle plánu, jenž už dávno neplatí.",
      coSTim: [
        "Zaveď v tréninku situaci, kdy plán schválně nefunguje, a vyžaduj, aby ho nahlas změnil hráč, ne trenér.",
        "Po zápase se ptej nejdřív na to, co nefungovalo, a ptej se konkrétního hráče. Otázka do vzduchu zůstane v téhle kabině bez odpovědi.",
        "Urči jednoho až dva hráče, jejichž rolí je pojmenovat, když se hra láme. Dej jim to jako úkol, ne jako možnost.",
      ],
      coNedelat:
        "Nevyzývej kabinu obecně k větší otevřenosti. Tenhle typ skupiny to slyší " +
        "jako výtku a odpoví ještě menší ochotou mluvit. Otevřenost nevznikne " +
        "prohlášením, ale tím, že se konkrétní člověk ozve a nic zlého se mu nestane.",
    },
    "trajektorie-vyhoreni": {
      nadpis: "Dře a nedoplňuje",
      coJeVidet:
        "Odolnost a nasazení jsou vysoko, spánek a regenerace nízko. Tým je zvyklý " +
        "přidat, když je zle, a není zvyklý ubrat, když je dobře.",
      coToDela:
        "Tohle je jediný nález v celém profilu, který se dá předpovědět v čase. " +
        "Skupina vydrží přípravu i první část sezony a výkon se láme zhruba ve chvíli, " +
        "kdy se nasčítá únava, na kterou nikdo nereagoval. Nepřijde to jako propad " +
        "jednotlivce, ale jako plošný pokles: pomalejší rozhodování, víc chyb ve " +
        "druhých poločasech, drobná zranění.",
      coSTim: [
        "Dej regeneraci do plánu se stejnou vážností jako zátěž. Dokud je volitelná, tenhle tým ji vynechá.",
        "Sleduj spánek, ne pocit. Skupina s tímhle profilem subjektivní únavu podceňuje.",
        "Naplánuj odlehčení dřív, než přijde propad, ne až jako reakci na něj.",
      ],
      coNedelat:
        "Nezvyšuj zátěž jako odpověď na pokles formy. U tohohle profilu to výkon " +
        "srazí dál, protože příčinou není nedostatek práce.",
    },
    "nalada-podle-vysledku": {
      nadpis: "Nálada visí na výsledku",
      coJeVidet:
        "Sebehodnota hráčů stojí na tom, jak se právě daří. Když se vyhrává, je " +
        "profil skupiny jiný než po dvou porážkách.",
      coToDela:
        "Tým je funkční, dokud se daří, a v sérii nezdarů se propadá rychleji, než " +
        "odpovídá herní realitě. Porážka nezůstane porážkou, stane se z ní tvrzení " +
        "o hráčích. Nejvíc je to znát na tom, jak dlouho trvá návrat po prohraném zápase.",
      coSTim: [
        "Hodnoť proces, ne výsledek, a dělej to i po výhře. Když se chválí jen vítězství, potvrzuješ přesně tu vazbu, kterou chceš rozvolnit.",
        "Dej týmu měřítka, která nejsou skóre: dokončené akce, návrat do obrany, přeskupení po ztrátě.",
        "Po porážce se vrať k práci dřív. Dlouhé ticho si tenhle typ skupiny vyplní vlastním výkladem.",
      ],
      coNedelat:
        "Nezvedej sebevědomí připomínáním minulých úspěchů. Posílí to stejnou vazbu, " +
        "jen z druhé strany.",
    },
    "par-nese-naklad": {
      nadpis: "Náklad nese pár lidí",
      coJeVidet:
        "V hranicích a schopnosti říct ne se tým hodně rozchází. Část hráčů si " +
        "svoje ohlídá, část na sebe bere všechno.",
      coToDela:
        "Skupina navenek funguje, protože pár lidí zaplní každou mezeru. Ti lidé " +
        "ale vyhoří dřív než zbytek a ve chvíli, kdy vypadnou, se teprve ukáže, " +
        "kolik toho drželi. Zároveň to brzdí ostatní: kdo ví, že to za něj někdo " +
        "dodělá, přestane se snažit dřív.",
      coSTim: [
        "Pojmenuj role a odpovědnosti tak, aby se nedaly tiše přesunout. Co není přidělené, skončí u těch, kdo neumějí odmítnout.",
        "Sleduj, kdo zůstává po tréninku, kdo řeší věci navíc a kdo mluví s realizačním týmem. Bude to pár stejných jmen.",
        "Ulož těm lidem, aby část předali. Sami to neudělají.",
      ],
      coNedelat:
        "Neodměňuj viditelně to, že si někdo bere práci navíc. Ostatní si z toho " +
        "vezmou, že se to od nich nečeká.",
    },
    "zlom-pod-tlakem": {
      nadpis: "Zlomová linie pod tlakem",
      coJeVidet:
        "V práci s tlakem se tým dělí na dvě skupiny s výraznou mezerou mezi nimi. " +
        "Není to rozptyl, jaký má každé mužstvo; jsou to dvě různé skupiny.",
      coToDela:
        "Dokud se hraje v klidu, není to vidět. Jakmile jde o hodně, mužstvo se " +
        "rozdělí: jedna část hraje dál, druhá se zadrhne. A protože jsou to " +
        "spoluhráči, první část přestane hrát svoji hru a začne řešit druhou. Tým " +
        "tak ztrácí dvakrát.",
      coSTim: [
        "Trénuj pod tlakem, ne jen s tlakem na výsledek: časový limit, publikum, důsledek za chybu. Jinak se linie neprojeví a nedá se s ní pracovat.",
        "Ve vypjatých pasážích zjednoduš úkol té části týmu, která se zadrhává. Ne míň odpovědnosti, ale míň rozhodování.",
        "Skládej dvojice na hřišti tak, aby vedle sebe nestáli dva hráči ze stejné strany linie.",
      ],
      coNedelat:
        "Nedávej celému týmu stejnou předzápasovou přípravu. Co jednu polovinu " +
        "naladí, druhou zablokuje.",
    },
    "pozornost-mizi-pod-tlakem": {
      nadpis: "Pod tlakem se rozpadá hra, ne jen nervy",
      coJeVidet:
        "Nízko je zároveň řízení pozornosti a práce s tlakem. Tyhle dvě věci se " +
        "navzájem posilují.",
      coToDela:
        "Tým pod tlakem nedělá chyby z nervozity, ale z toho, že přestane vidět " +
        "hřiště. Projeví se to jako špatná rozhodnutí, ne jako roztřesené ruce. " +
        "Zvenčí to vypadá na taktickou chybu a řeší se videem, jenže příčina je jinde.",
      coSTim: [
        "Zaveď krátkou rutinu na návrat pozornosti po ztrátě nebo po chybě a trénuj ji, dokud není automatická.",
        "Zjednoduš pokyny do druhého poločasu. Kapacita, na kterou se v klidu spoléháš, tam nebude.",
        "Rozeber konkrétní situaci a ptej se, co v tu chvíli viděli. Ne co měli udělat.",
      ],
      coNedelat:
        "Neřeš to přidáním taktických pokynů. Přetížíš tím právě to, co pod tlakem " +
        "selhává.",
    },
    "tvrdi-na-sebe": {
      nadpis: "Tvrdí na sebe po chybě",
      coJeVidet:
        "Vztah k sobě po chybě je jedna z nejslabších částí profilu. Nasazení tím " +
        "netrpí, návrat do hry ano.",
      coToDela:
        "Zvenčí to vypadá jako profesionální nastavení a trenéři si toho často cení. " +
        "Cena je, že po chybě hráč několik minut nehraje, protože je zaneprázdněný " +
        "sám sebou. V týmu se to přenáší: skupina, která je tvrdá na sebe, je tvrdá " +
        "i na spoluhráče.",
      coSTim: [
        "Nastav, co se dělá bezprostředně po chybě, a vyžaduj to. Bez daného postupu si tenhle typ hráče tu chvíli vyplní výčitkou.",
        "Chval návrat do hry po chybě stejně viditelně jako povedenou akci.",
        "Když chybu rozebíráš, dej jasně najevo, kdy je téma uzavřené.",
      ],
      coNedelat:
        "Nepřidávej k chybě důraz. Tenhle tým si ho přidal sám a víc jen prodlouží " +
        "výpadek.",
    },
    "bez-opory": {
      nadpis: "Chybí opora v okolí",
      coJeVidet:
        "Hráči nemají kolem sebe dost lidí, o které se dá opřít, nebo o té možnosti " +
        "nevědí.",
      coToDela:
        "V dobrém období se to neprojeví. Ve špatném zůstává každý s tím sám a řeší " +
        "to po svém: jeden přidá práci, druhý se stáhne, třetí to hodí na spoluhráče. " +
        "Tým se nerozpadne najednou, ale rozdrolí.",
      coSTim: [
        "Zaveď pravidelný krátký rozhovor s každým hráčem, který není o výkonu. Průběžně, ne jednou za sezonu.",
        "Řekni nahlas, na koho se v klubu obrátit s čím. Skupina s tímhle profilem to sama nehledá.",
        "Dej hráčům stálé dvojice nebo malé skupiny, ne jen dělení podle postu.",
      ],
      coNedelat:
        "Nespoléhej na to, že se hráči otevřou na společné akci. Tenhle profil " +
        "potřebuje jednoho konkrétního člověka, ne skupinovou atmosféru.",
    },
    "krehka-identita": {
      nadpis: "Nejasné, proč to dělají",
      coJeVidet:
        "Identita a vnitřní motivace jsou nízko. Hráči nemají jasno v tom, kým chtějí " +
        "ve sportu být a proč ho dělají.",
      coToDela:
        "Krátkodobě to nevadí, tým se dá řídit zvenčí. Vydrží to ale jen tak dlouho, " +
        "dokud je co vyhrávat. Jakmile přijde delší období bez úspěchu nebo změna " +
        "trenéra, chybí to, co drží úsilí pohromadě, a mužstvo se rozjede podle " +
        "jednotlivců.",
      coSTim: [
        "Nech tým pojmenovat, čím chce být, a mluv o tom i tehdy, když se zrovna nevyhrává.",
        "Spoj tréninkovou práci s tím, kým chce hráč být, ne jen s nejbližším zápasem.",
        "U mladších hráčů dej najevo, že cesta má víc podob než výsledek.",
      ],
      coNedelat:
        "Nedávej týmu hotovou identitu ve formě hesla. Přijmou ji navenek a nic to " +
        "nezmění.",
    },
    "vyrovnany-zaklad": {
      nadpis: "Vyrovnaný základ",
      coJeVidet:
        "V žádné z oblastí nemá tým propad a nikde se výrazně nerozchází. To je " +
        "vzácnější, než se zdá.",
      coToDela:
        "Vyrovnaná skupina snese víc: dá se s ní pracovat na herních věcech, protože " +
        "nemusíš současně opravovat mentální základ. Pod tlakem se nerozdělí na dva " +
        "tábory, takže neztrácíš čas držením mužstva pohromadě.",
      coSTim: [
        "Využij to na náročnější herní úkoly, ne na přidání zátěže.",
        "Postav na tom kulturu, kterou udrží i noví hráči. Vyrovnaný tým se dá pokazit rychleji, než se vybudoval.",
        "Zopakuj měření po sezoně. Tenhle stav se udržuje, nezískává natrvalo.",
      ],
      coNedelat:
        "Neber to jako důvod nechat mentální práci být. Přesně takhle se vyrovnaný " +
        "základ ztratí.",
    },
  },
}

const EN: TymTexty = {
  titul: "Team profile",
  podtitul:
    "What the surveys say about the group as a whole. This is not the sum of " +
    "individuals: a team under pressure behaves differently than each player would alone.",
  pocty: (odevzdano, pozvano) =>
    `Based on ${odevzdano} completed surveys out of ${pozvano} sent.`,
  maloDatTitul: "Few surveys completed",
  maloDat:
    "At this number the team profile comes close to an individual profile and can " +
    "be read back to particular players. Players who chose not to share their own " +
    "results were promised the opposite, so handle it accordingly. The profile " +
    "becomes meaningfully robust from roughly eight completed surveys.",

  oblastiTitul: "The seven areas across the team",
  oblastiUvod:
    "Each area shows a level and a spread. The spread usually says more: two teams " +
    "with the same level behave completely differently depending on whether they " +
    "are even or split.",
  legendaUroven: "level",
  legendaRozptyl: "spread",
  plosna: "across the whole squad",
  rozkol: "the team splits",

  oporyTitul: "What you can build on",
  oporyUvod:
    "Areas most of the team is strong in and where the squad does not diverge. " +
    "A high level with a wide spread is not something to build on, because it " +
    "falls apart under pressure.",
  prioritTitul: "Where the work is needed most",
  prioritUvod:
    "Alongside the level, what matters is whether the weakness runs evenly across " +
    "the squad or is concentrated in a few players. An even weakness is a matter of " +
    "culture and leadership; a concentrated one is individual work.",
  zlomyTitul: "Where the team splits under pressure",
  zlomyUvod:
    "In these areas it is not the usual spread but two groups with a gap between " +
    "them. Pressure arrives and the squad breaks into those who cope and those who " +
    "do not.",
  zadne: "Nothing of the kind showed up in this profile.",

  nalezyTitul: "What follows from it",
  nalezyUvod:
    "The value is not in single areas but in their combinations. High confidence on " +
    "its own is good news; high confidence next to missing safety in communication " +
    "is something else entirely.",
  prvniPraskne: "This breaks first",
  stitkyNalezu: {
    coJeVidet: "What the data shows",
    coToDela: "What it does to the group",
    coSTim: "What to do",
    coNedelat: "What not to do",
  },
  bezNalezu:
    "None of the combinations we look for showed up in this profile. Work from the " +
    "areas above.",

  oblasti: {
    A: "Identity and inner motivation",
    B: "Confidence and inner dialogue",
    C: "Concentration and attention control",
    D: "Emotion regulation and performance under pressure",
    E: "Resilience and growth mindset",
    F: "Discipline, habits and recovery",
    G: "Relationships, communication and environment",
  },

  nalezy: {
    "sebejista-ticha-satna": {
      nadpis: "A confident dressing room that does not speak",
      coJeVidet:
        "The players believe in themselves; confidence is among the strongest parts " +
        "of the profile. At the same time, the ability to say an uncomfortable thing " +
        "out loud in the group is low: a doubt, a mistake, a disagreement with what " +
        "is happening on the pitch.",
      coToDela:
        "From the outside it looks like a strong team, and while the game is going " +
        "their way it genuinely is one. The trouble comes when the plan falls apart " +
        "and the squad needs to reorganise on the move. That requires somebody to say " +
        "it is not working. Here nobody does, because everyone assumes they will " +
        "handle it themselves. The result is a team that plays out a close game to a " +
        "plan that stopped being valid long ago.",
      coSTim: [
        "Build a training situation where the plan deliberately fails, and require a player, not the coach, to change it out loud.",
        "After a match ask first what did not work, and ask a named player. A question thrown into the room stays unanswered in this dressing room.",
        "Appoint one or two players whose role is to name it when the game is turning. Give it to them as a duty, not an option.",
      ],
      coNedelat:
        "Do not call on the dressing room in general to be more open. This kind of " +
        "group hears it as criticism and answers with even less willingness to speak. " +
        "Openness does not come from an announcement; it comes from one person " +
        "speaking up and nothing bad happening to them.",
    },
    "trajektorie-vyhoreni": {
      nadpis: "Works hard, does not refill",
      coJeVidet:
        "Resilience and effort are high, sleep and recovery are low. The team is used " +
        "to adding more when things go badly and not used to easing off when they go well.",
      coToDela:
        "This is the one finding in the whole profile that can be predicted in time. " +
        "The group gets through pre-season and the first part of the season, and the " +
        "performance breaks roughly when the fatigue nobody responded to has added up. " +
        "It does not arrive as one player losing form but as a squad-wide dip: slower " +
        "decisions, more mistakes in second halves, minor injuries.",
      coSTim: [
        "Put recovery in the plan with the same weight as load. While it stays optional, this team will skip it.",
        "Track sleep, not how they feel. A group with this profile underrates its own fatigue.",
        "Schedule the lighter period before the dip, not as a response to it.",
      ],
      coNedelat:
        "Do not raise the load in response to a drop in form. With this profile it " +
        "pushes performance down further, because the cause is not a shortage of work.",
    },
    "nalada-podle-vysledku": {
      nadpis: "The mood hangs on the result",
      coJeVidet:
        "The players' sense of worth rests on how things are going right now. When " +
        "they are winning, the group profile is different than after two defeats.",
      coToDela:
        "The team works while things go well, and in a losing run it drops faster than " +
        "the football justifies. A defeat does not stay a defeat; it turns into a " +
        "statement about the players. It shows most in how long the return takes after " +
        "a lost match.",
      coSTim: [
        "Judge the process, not the result, and do it after wins too. Praising only victories confirms exactly the link you are trying to loosen.",
        "Give the team measures that are not the scoreline: completed actions, recovery runs, reorganising after a turnover.",
        "Get back to work sooner after a defeat. A long silence gets filled with this group's own interpretation.",
      ],
      coNedelat:
        "Do not lift confidence by recalling past successes. It reinforces the same " +
        "link from the other side.",
    },
    "par-nese-naklad": {
      nadpis: "A few people carry the load",
      coJeVidet:
        "The team diverges widely on boundaries and the ability to say no. Some players " +
        "guard their own space; others take on everything.",
      coToDela:
        "The group works from the outside because a few people fill every gap. Those " +
        "people burn out before the rest, and only when they drop out does it become " +
        "clear how much they were holding. It also holds the others back: anyone who " +
        "knows somebody will finish it for them stops trying sooner.",
      coSTim: [
        "Name roles and responsibilities so they cannot be quietly passed on. Whatever is unassigned ends up with those who cannot refuse.",
        "Watch who stays after training, who deals with the extra things and who talks to the support team. It will be a few of the same names.",
        "Instruct those people to hand part of it over. They will not do it on their own.",
      ],
      coNedelat:
        "Do not visibly reward taking on extra work. The others will read it as not " +
        "being expected of them.",
    },
    "zlom-pod-tlakem": {
      nadpis: "A fault line under pressure",
      coJeVidet:
        "On handling pressure the team divides into two groups with a marked gap " +
        "between them. This is not the spread every squad has; these are two different " +
        "groups.",
      coToDela:
        "While the game is calm it is invisible. As soon as it matters, the squad " +
        "splits: one part plays on, the other seizes up. And because they are team " +
        "mates, the first part stops playing its own game and starts managing the " +
        "second. The team loses twice over.",
      coSTim: [
        "Train under pressure, not just with pressure on the result: a time limit, an audience, a consequence for a mistake. Otherwise the line never shows and cannot be worked with.",
        "In tense passages simplify the task for the part of the team that seizes up. Not less responsibility, but fewer decisions.",
        "Pair players on the pitch so that two from the same side of the line are not next to each other.",
      ],
      coNedelat:
        "Do not give the whole team the same pre-match routine. What tunes one half " +
        "up shuts the other half down.",
    },
    "pozornost-mizi-pod-tlakem": {
      nadpis: "Under pressure the play falls apart, not just the nerves",
      coJeVidet:
        "Attention control and handling pressure are both low. These two reinforce " +
        "each other.",
      coToDela:
        "Under pressure this team does not make mistakes out of nerves; it makes them " +
        "because it stops seeing the pitch. It shows up as poor decisions, not shaking " +
        "hands. From the outside it looks like a tactical error and gets addressed with " +
        "video, but the cause is elsewhere.",
      coSTim: [
        "Introduce a short routine for bringing attention back after a turnover or a mistake, and train it until it is automatic.",
        "Simplify the instructions for the second half. The capacity you rely on when things are calm will not be there.",
        "Go through a specific situation and ask what they saw at that moment. Not what they should have done.",
      ],
      coNedelat:
        "Do not address it by adding tactical instructions. That overloads exactly what " +
        "is failing under pressure.",
    },
    "tvrdi-na-sebe": {
      nadpis: "Hard on themselves after a mistake",
      coJeVidet:
        "How players treat themselves after a mistake is one of the weakest parts of " +
        "the profile. Effort does not suffer from it; the return to the game does.",
      coToDela:
        "From the outside it looks like a professional attitude and coaches often value " +
        "it. The price is that after a mistake the player is out of the game for several " +
        "minutes because they are busy with themselves. It spreads through the squad: a " +
        "group that is hard on itself is hard on team mates too.",
      coSTim: [
        "Set what happens immediately after a mistake and require it. Without a set routine this kind of player fills that moment with self-reproach.",
        "Praise the return to the game after a mistake as visibly as a good piece of play.",
        "When you go through a mistake, make it clear when the subject is closed.",
      ],
      coNedelat:
        "Do not add emphasis to the mistake. This team has already added its own, and " +
        "more only lengthens the blackout.",
    },
    "bez-opory": {
      nadpis: "No support around them",
      coJeVidet:
        "The players do not have enough people around them to lean on, or do not know " +
        "that the option exists.",
      coToDela:
        "In a good spell it does not show. In a bad one everyone is left with it alone " +
        "and deals with it their own way: one adds work, another withdraws, a third puts " +
        "it on a team mate. The team does not collapse at once; it crumbles.",
      coSTim: [
        "Set up a regular short conversation with every player that is not about performance. Continuously, not once a season.",
        "Say out loud who at the club to go to with what. A group with this profile will not look for it on its own.",
        "Give players steady pairs or small groups, not just a split by position.",
      ],
      coNedelat:
        "Do not count on players opening up at a team event. This profile needs one " +
        "particular person, not a group atmosphere.",
    },
    "krehka-identita": {
      nadpis: "Unclear why they do it",
      coJeVidet:
        "Identity and inner motivation are low. The players are not clear about who they " +
        "want to be in their sport or why they play it.",
      coToDela:
        "In the short term it does not matter; the team can be driven from outside. That " +
        "lasts only as long as there is something to win. Once a longer spell without " +
        "success or a change of coach arrives, what held the effort together is missing " +
        "and the squad scatters into individuals.",
      coSTim: [
        "Let the team name what it wants to be, and talk about it in the weeks when they are not winning.",
        "Connect the training work to who the player wants to become, not only to the next match.",
        "With younger players make it clear that the path has more forms than the result.",
      ],
      coNedelat:
        "Do not hand the team a ready-made identity in the form of a slogan. They will " +
        "accept it outwardly and nothing will change.",
    },
    "vyrovnany-zaklad": {
      nadpis: "An even foundation",
      coJeVidet:
        "The team has no collapse in any area and does not diverge markedly anywhere. " +
        "That is rarer than it sounds.",
      coToDela:
        "An even group takes more: you can work with it on the football, because you are " +
        "not repairing the mental foundation at the same time. Under pressure it does not " +
        "split into two camps, so you do not spend the game holding the squad together.",
      coSTim: [
        "Spend it on harder football tasks, not on more load.",
        "Build a culture on it that new players will keep. An even team can be spoilt faster than it was built.",
        "Measure again after the season. This state is maintained, not acquired for good.",
      ],
      coNedelat:
        "Do not take it as a reason to leave the mental work alone. That is exactly how " +
        "an even foundation gets lost.",
    },
  },
}

/** Týmová větev jede jen česky a anglicky. */
export const TYM: Record<TymLang, TymTexty> = { cs: CS, en: EN }
