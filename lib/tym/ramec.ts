import type { TymLang } from "./obsah"

// Rámec týmového reportu: všechno kolem samotných dat.
//
// Report má osm oddílů a čtenářem je kouč, ne psycholog. Pořadí je zvolené
// tak, aby dávalo smysl i tomu, kdo dočte dvě strany: nejdřív závěr, pak
// návod, jak ho číst, pak podklad, a teprve nakonec plán práce. Kdo dočte
// jen první stranu, má to podstatné; kdo dočte všechno, ví i proč.
//
// Texty jsou tady, a ne v pdf.ts, aby se sazba dala měnit bez sahání do
// obsahu a obsah bez sahání do sazby.

export interface RamecTexty {
  // ---- oddíl 1: shrnutí ----
  shrnutiTitul: string
  shrnutiUvod: string
  drziTitul: string
  krehkeTitul: string
  prvniKrokTitul: string
  nicDrzi: string
  nicKrehke: string

  // ---- oddíl 2: jak report číst ----
  jakCistTitul: string
  jakCistOdstavce: string[]
  coToNeniTitul: string
  coToNeni: string[]

  // ---- oddíl 3: oblasti ----
  oblastiDetailTitul: string
  oblastiDetailUvod: string
  popiskyVykladu: {
    coMeri: string
    stav: string
    tvar: string
    prace: string
    znaky: string
  }
  rozsahTymu: (min: number, max: number) => string
  rozlozeni: string
  /** názvy pásem pro řádek s rozložením kádru */
  pasma: { priority: string; stabilization: string; strong: string; elite: string }

  // ---- oddíl 6: plán ----
  planTitul: string
  planUvod: string
  planTydny: (od: number, do_: number) => string
  planProc: string
  planKroky: string
  planZnaky: string
  fazeNazvy: [string, string, string]
  fazeDuvod: {
    zlom: (oblast: string) => string
    plosna: (oblast: string) => string
    nejnizsi: (oblast: string) => string
    upevneni: (oblast: string) => string
    opora: (oblast: string) => string
  }
  planPoznamka: string

  // ---- oddíl 7: rozhovory ----
  rozhovoryTitul: string
  rozhovoryUvod: string
  rozhovoryJak: string[]
  rozhovoryOtazkyTitul: string

  // ---- oddíl 8: mantinely ----
  mantinelyTitul: string
  mantinelyUvod: string
  mantinely: string[]

  paticka: string
}

const CS: RamecTexty = {
  shrnutiTitul: "Shrnutí pro kouče",
  shrnutiUvod:
    "Tenhle oddíl je napsaný tak, aby stačil sám o sobě. Zbytek reportu ho " +
    "rozvádí a dokládá.",
  drziTitul: "O co se dá opřít",
  krehkeTitul: "Kde je to křehké",
  prvniKrokTitul: "Čím začít",
  nicDrzi:
    "Zatím žádná oblast není natolik silná a zároveň natolik vyrovnaná, aby se dala " +
    "označit za oporu. Neznamená to, že je tým slabý; znamená to, že se zatím nedá " +
    "spolehnout na to, že vydrží pod tlakem.",
  nicKrehke:
    "Žádná oblast nevyšla jako přednostní. To je dobrá zpráva, kterou stojí za to " +
    "udržet: vyrovnaný profil se rozpadá pomalu a nenápadně.",

  jakCistTitul: "Jak tenhle report číst",
  jakCistOdstavce: [
    "U každé oblasti najdeš dvě čísla. Úroveň říká, jak vysoko tým v té oblasti je. " +
      "Rozptyl říká, jak daleko od sebe hráči jsou. Zpravidla platí, že rozptyl " +
      "prozradí víc: dva týmy se stejnou úrovní se pod tlakem chovají úplně jinak " +
      "podle toho, jestli jsou vyrovnané, nebo rozdělené.",
    "Rozlišujeme tři tvary rozdělení a každý se řeší jinak. Vyrovnaná oblast se dá " +
      "posouvat společně. Oblast, kde někdo vyčnívá, znamená jednoho nebo dva hráče " +
      "daleko od zbytku; to je věc rozhovoru s nimi, ne týmové porady. Rozdělená " +
      "oblast znamená dvě skupiny s mezerou mezi sebou; tam společné řešení nefunguje, " +
      "protože co jedné skupině pomůže, druhé uškodí.",
    "Report nikde neuvádí, kdo je kdo. Ani jméno, ani štítek, ani pořadí. Je to " +
      "záměr: hráčům jsme slíbili, že jejich odpovědi neuvidíš, a bez toho slibu by " +
      "odpovídali jinak a data by za nic nestála.",
    "Čísla jsou momentka, ne rozsudek. Popisují, jak tým odpovídal v jednom týdnu " +
      "sezony. Oblasti, které vyjdou nízko, jsou dovednosti, a dovednosti se trénují.",
  ],
  coToNeniTitul: "K čemu tenhle report neslouží",
  coToNeni: [
    "Není to nástroj pro výběr sestavy. Nic z toho, co je tady, nepředpovídá výkon " +
      "jednotlivce v konkrétním zápase.",
    "Není to diagnóza. Nízká úroveň v jakékoli oblasti nepopisuje poruchu ani nemoc " +
      "a nepatří do žádné zdravotní dokumentace.",
    "Není to podklad k tomu, dohledávat, kdo jak odpovídal. Kdyby se to v týmu jednou " +
      "stalo, příští dotazník už nikdo nevyplní pravdivě.",
    "Není to náhrada za rozhovor. Report ti řekne, kde se zeptat; odpověď má hráč.",
  ],

  oblastiDetailTitul: "Sedm oblastí podrobně",
  oblastiDetailUvod:
    "Ke každé oblasti je uvedeno, co měří, jak na tom tým je, co znamená tvar " +
    "rozdělení a co se s tím dá dělat. Pořadí je dané strukturou dotazníku, ne " +
    "důležitostí.",
  popiskyVykladu: {
    coMeri: "Co oblast měří",
    stav: "Jak na tom tým je",
    tvar: "Co znamená tvar rozdělení",
    prace: "Co s tím",
    znaky: "Podle čeho poznáš, že se to hýbe",
  },
  rozsahTymu: (min, max) => `Nejnižší hráč ${min}, nejvyšší ${max}.`,
  rozlozeni: "Rozložení kádru",
  pasma: {
    priority: "priorita",
    stabilization: "stabilizace",
    strong: "silná",
    elite: "elitní",
  },

  planTitul: "Plán práce na dvanáct týdnů",
  planUvod:
    "Tři fáze po čtyřech týdnech. Pořadí není libovolné: začíná se tím, co nejvíc " +
    "omezuje všechno ostatní, a končí se upevněním. Dělat všechno naráz nefunguje, " +
    "protože tým nedokáže měnit víc než jednu věc v jednom období.",
  planTydny: (od, do_) => `Týdny ${od} až ${do_}`,
  planProc: "Proč právě tohle",
  planKroky: "Co dělat",
  planZnaky: "Jak poznáš, že to funguje",
  fazeNazvy: ["Odstranit to, co brzdí", "Postavit dovednost", "Upevnit a zatížit"],
  fazeDuvod: {
    zlom: (oblast) =>
      `Tým se v oblasti ${oblast} dělí na dvě skupiny. Dokud to trvá, nemá smysl ` +
      "zavádět cokoli plošně, protože každá skupina potřebuje něco jiného. Tohle " +
      "je proto první.",
    plosna: (oblast) =>
      `Oblast ${oblast} chybí rovnoměrně celému kádru. To je věc prostředí a plánu, ` +
      "ne jednotlivců, a řeší se rychleji než cokoli individuálního, protože se mění " +
      "jedna věc pro všechny.",
    nejnizsi: (oblast) =>
      `${oblast} je nejnižší oblast profilu. Dokud je takhle nízko, drží zpátky ` +
      "i oblasti, které vypadají dobře.",
    upevneni: (oblast) =>
      `Poslední čtyři týdny patří zátěži: to, co se postavilo, se ověří v ostrém ` +
      `provozu. U oblasti ${oblast} to znamená vědomě přidat tlak, ne ubrat.`,
    opora: (oblast) =>
      `Oblast ${oblast} je nejsilnější věc, kterou tým má. Ve třetí fázi se o ni ` +
      "opři: dovednost postavená ve druhé fázi se udrží tam, kde už něco funguje.",
  },
  planPoznamka:
    "Plán je odvozený z profilu, ne z konkrétní sezony. Srovnej ho s kalendářem: " +
    "pokud čtvrtý týden připadá na vrchol sezony nebo na zkouškové, posuň fáze " +
    "a nekomprimuj je.",

  rozhovoryTitul: "Individuální rozhovory",
  rozhovoryUvod:
    "Report ukazuje, kde se ptát. Odpověď má hráč a bez rozhovoru se k ní nedostaneš. " +
    "Níž jsou otázky ke každé oblasti; ber je jako začátek, ne jako dotazník.",
  rozhovoryJak: [
    "Neptej se na výsledky dotazníku a neříkej, že z něj vycházíš. Hráči je nesdíleli " +
      "s tebou a zmínka o nich rozhovor zavře.",
    "Ptej se otevřeně a nech ticho být. První odpověď bývá zdvořilá, druhá pravdivá.",
    "Jeden rozhovor, jedna oblast. Kdo dostane čtyři otázky ze čtyř oblastí, odpoví " +
      "na žádnou.",
    "Rozhovor veď ty, ne asistent a ne kapitán. To, že si na něj uděláš čas, je " +
      "polovina jeho účinku.",
    "Konči domluvou na jedné konkrétní věci do příště. Rozhovor bez závěru se " +
      "za měsíc opakuje stejný.",
  ],
  rozhovoryOtazkyTitul: "Otázky podle oblasti",

  mantinelyTitul: "Mantinely použití",
  mantinelyUvod:
    "Tenhle report vznikl z odpovědí, které ti hráči dali s tím, že je neuvidíš. " +
    "Následující pravidla nejsou formalita; jsou to podmínky, za kterých data " +
    "zůstanou pravdivá i příště.",
  mantinely: [
    "Report neposílej dál mimo realizační tým a nezakládej ho do složek hráčů.",
    "Nedohledávej, kdo jak odpovídal, a nedávej najevo, že bys mohl.",
    "O výsledcích mluv s týmem jako o týmu. Nikdy ne ve tvaru „někdo z vás“.",
    "Když je odevzdaných dotazníků málo, ber profil jako orientační a podle toho " +
      "o něm mluv.",
    "Opakuj měření nejdřív po třech měsících. Dřív se změní jen to, co si tým " +
      "pamatuje z minula.",
  ],
  paticka: "Profil týmu",
}

const EN: RamecTexty = {
  shrnutiTitul: "Summary for the coach",
  shrnutiUvod:
    "This section is written to stand on its own. The rest of the report expands and " +
    "evidences it.",
  drziTitul: "What you can lean on",
  krehkeTitul: "Where it is fragile",
  prvniKrokTitul: "Where to start",
  nicDrzi:
    "No area is yet both strong enough and even enough to count as an anchor. That does " +
    "not mean the team is weak; it means nothing here can yet be relied on to hold under " +
    "pressure.",
  nicKrehke:
    "No area came out as a priority. That is good news worth protecting: an even profile " +
    "erodes slowly and quietly.",

  jakCistTitul: "How to read this report",
  jakCistOdstavce: [
    "Each area carries two numbers. The level says how high the team sits. The spread " +
      "says how far apart the players are. As a rule the spread tells you more: two teams " +
      "at the same level behave completely differently under pressure depending on " +
      "whether they are even or divided.",
    "We distinguish three shapes of distribution and each is handled differently. An even " +
      "area can be moved collectively. An area where someone stands apart means one or two " +
      "players far from the rest; that is a conversation with them, not a team meeting. A " +
      "divided area means two groups with a gap between them; there a shared solution does " +
      "not work, because what helps one group hurts the other.",
    "The report never identifies anyone. No names, no labels, no ranking. That is " +
      "deliberate: the players were promised you would not see their answers, and without " +
      "that promise they would have answered differently and the data would be worthless.",
    "The numbers are a snapshot, not a verdict. They describe how the squad answered in " +
      "one week of a season. Areas that come out low are skills, and skills are trained.",
  ],
  coToNeniTitul: "What this report is not for",
  coToNeni: [
    "It is not a selection tool. Nothing here predicts an individual's performance in a " +
      "particular match.",
    "It is not a diagnosis. A low level in any area describes no disorder or illness and " +
      "belongs in no medical record.",
    "It is not grounds for working out who answered what. If that ever happens in a team, " +
      "nobody fills in the next survey honestly.",
    "It is not a substitute for a conversation. The report tells you where to ask; the " +
      "answer belongs to the player.",
  ],

  oblastiDetailTitul: "The seven areas in detail",
  oblastiDetailUvod:
    "For each area you get what it measures, where the team stands, what the shape of the " +
    "distribution means and what can be done about it. The order follows the structure of " +
    "the survey, not importance.",
  popiskyVykladu: {
    coMeri: "What this area measures",
    stav: "Where the team stands",
    tvar: "What the shape of the distribution means",
    prace: "What to do about it",
    znaky: "How you will know it is moving",
  },
  rozsahTymu: (min, max) => `Lowest player ${min}, highest ${max}.`,
  rozlozeni: "Distribution across the squad",
  pasma: {
    priority: "priority",
    stabilization: "stabilising",
    strong: "strong",
    elite: "elite",
  },

  planTitul: "A twelve-week plan",
  planUvod:
    "Three phases of four weeks. The order is not arbitrary: it starts with whatever most " +
    "constrains everything else and ends with consolidation. Doing it all at once does not " +
    "work, because a team cannot change more than one thing in one block.",
  planTydny: (od, do_) => `Weeks ${od} to ${do_}`,
  planProc: "Why this first",
  planKroky: "What to do",
  planZnaky: "How you will know it is working",
  fazeNazvy: ["Remove what blocks", "Build the skill", "Consolidate under load"],
  fazeDuvod: {
    zlom: (oblast) =>
      `The team divides into two groups in ${oblast}. While that lasts there is no point ` +
      "introducing anything squad-wide, because each group needs something different. " +
      "That is why this comes first.",
    plosna: (oblast) =>
      `${oblast} is missing evenly across the whole roster. That is a matter of ` +
      "environment and scheduling rather than individuals, and it moves faster than " +
      "anything individual, because one thing changes for everyone.",
    nejnizsi: (oblast) =>
      `${oblast} is the lowest area in the profile. While it sits this low it holds back ` +
      "areas that look healthy.",
    upevneni: (oblast) =>
      "The last four weeks belong to load: what was built gets tested in live conditions. " +
      `For ${oblast} that means deliberately adding pressure, not easing it.`,
    opora: (oblast) =>
      `${oblast} is the strongest thing this team has. In the third phase, lean on it: a ` +
      "skill built in phase two holds where something already works.",
  },
  planPoznamka:
    "The plan derives from the profile, not from your season. Check it against the " +
    "calendar: if week four lands on the peak of the season or on exams, move the phases " +
    "rather than compressing them.",

  rozhovoryTitul: "Individual conversations",
  rozhovoryUvod:
    "The report shows you where to ask. The answer belongs to the player and you will not " +
    "reach it without a conversation. Below are questions for each area; treat them as an " +
    "opening, not a questionnaire.",
  rozhovoryJak: [
    "Do not ask about survey results and do not say that is where this comes from. The " +
      "players did not share them with you, and mentioning them closes the conversation.",
    "Ask openly and let the silence sit. The first answer tends to be polite, the second " +
      "true.",
    "One conversation, one area. Someone given four questions from four areas answers none " +
      "of them.",
    "Run the conversation yourself, not through an assistant or a captain. Making the time " +
      "for it is half of its effect.",
    "Finish by agreeing on one concrete thing before next time. A conversation without a " +
      "conclusion repeats itself a month later unchanged.",
  ],
  rozhovoryOtazkyTitul: "Questions by area",

  mantinelyTitul: "Boundaries of use",
  mantinelyUvod:
    "This report came out of answers the players gave you on the understanding that you " +
    "would not see them. The rules below are not a formality; they are the conditions " +
    "under which the data stays truthful next time.",
  mantinely: [
    "Do not pass this report outside the coaching staff and do not file it in player " +
      "records.",
    "Do not try to work out who answered what, and do not signal that you could.",
    "Talk to the team about the team. Never in the form “one of you”.",
    "When few surveys have come back, treat the profile as indicative and say so when you " +
      "talk about it.",
    "Repeat the measurement after three months at the earliest. Sooner than that, all you " +
      "change is what the squad remembers answering.",
  ],
  paticka: "Team profile",
}

export const RAMEC: Record<TymLang, RamecTexty> = { cs: CS, en: EN }
