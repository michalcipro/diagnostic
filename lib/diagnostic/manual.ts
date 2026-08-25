import type { Lang, TestId } from "./types"

// Manuál pro kouče: co která diagnostika sleduje, komu ji zadat a co je
// v jejím vyhodnocení.
//
// Texty jsou tady, ne v komponentě, protože musí být ve všech třech jazycích
// a Record<Lang, …> je jediný zápis, u kterého překladač nedovolí jazyk
// vynechat. Přesně na tomhle se dřív rozbíjela angličtina.
//
// Co se dá vzít z dat aplikace, se tu nepíše znovu: názvy testů, dimenzí,
// vzorců i archetypů si komponenta bere z knihoven, takže manuál nemůže
// tvrdit něco jiného než samotný test.
//
// Manuál oslovuje kouče, jehož rod neznáme, takže tu nejsou rodové značky
// {mužský|ženský} ani minulý čas ve druhé osobě. Rod se zadává u klienta.

/** Karta jednoho testu. */
export interface ManualTest {
  /** upřesnění pod názvem, například „Sportovní varianta“ */
  podtitul: string
  proKoho: string
  /** odhad doby vyplnění; počet položek se dopočítá z testMeta */
  doba: string
  kCemuJe: string
}

/** Odrážka: tučný začátek a věta za ním. */
export interface ManualPolozka {
  lbl: string
  text: string
}

export interface ManualKapitola {
  kicker: string
  title: string
  standfirst: string
}

export interface ManualTexty {
  title: string
  lede: string
  obsah: string
  pdf: string
  /** jednotka za počtem položek; ve všech třech jazycích nesklonná */
  tvrzeni: string
  popiskyKaret: { proKoho: string; rozsah: string; jazyky: string }
  jazykyHodnota: string
  kCemuJe: string

  kapitoly: ManualKapitola[]

  postup: ManualPolozka[]
  vysledkyNote: string
  ch1Bloky: ManualPolozka[]

  rodinyHlavicka: [string, string, string]
  rodiny: { nazev: string; otazka: string; kdy: string }[]
  volbaTitle: string
  volba: { q: string; a: string }[]
  volbaFootnote: string

  oblastiTitle: string
  oblasti: Record<"A" | "B" | "C" | "D" | "E" | "F" | "G", string>
  oblastiFootnote: string
  eliteEvalTitle: string
  eliteEvalLede: string
  eliteEval: ManualPolozka[]

  vzorceTitle: string
  oblastiVzorcuTitle: string
  oblastiVzorcuIntro: string
  oblastiVzorcuFootnote: string
  chybi: string
  vzorceEvalTitle: string
  vzorceEvalLede: string
  vzorceEval: ManualPolozka[]
  vzorceNote: string

  archetypyTitle: string
  archetypyHlavicka: [string, string, string]
  archetypyFootnote: string
  archEvalTitle: string
  archEvalLede: string
  archEval: ManualPolozka[]
  archSportTitle: string
  archSport: ManualPolozka[]
  archNote: string

  tymBloky: ManualPolozka[]
  tymRoleTitle: string
  tymRole: ManualPolozka[]
  tymNote: string

  praktickeBloky: { title: string; polozky: ManualPolozka[] }[]
  zachazeniTitle: string
  zachazeni: string[]

  prehledTitle: string
  prehledLede: string
  prehledHlavicka: [string, string, string]
  prostredi: { sport: string; byznys: string }

  testy: Record<Exclude<TestId, "vzorce-sport">, ManualTest>
}

const CS: ManualTexty = {
  title: "Manuál pro kouče",
  lede:
    "Devět diagnostik ve třech rodinách. Ke každé je tady, komu ji zadat, " +
    "co v člověku sleduje a co najdeš v jejím vyhodnocení. Na konci týmová " +
    "větev pro celé kluby.",
  obsah: "Obsah",
  pdf: "Stáhnout jako PDF",
  tvrzeni: "tvrzení",
  popiskyKaret: { proKoho: "Pro koho", rozsah: "Rozsah", jazyky: "Jazyky" },
  jazykyHodnota: "Čeština, slovenština, angličtina",
  kCemuJe: "K čemu je",

  kapitoly: [
    {
      kicker: "Kapitola 1",
      title: "Jak diagnostika probíhá",
      standfirst:
        "Průběh je u všech devíti testů stejný. Liší se jen to, co se klienta " +
        "ptáme a co z toho vyjde.",
    },
    {
      kicker: "Kapitola 2",
      title: "Kterou diagnostiku vybrat",
      standfirst:
        "Tři rodiny odpovídají na tři různé otázky. Nejsou to stupně téhož: " +
        "nejde o to, která je podrobnější, ale o to, na co se ptáš.",
    },
    {
      kicker: "Kapitola 3 · Rodina první",
      title: "Performance Diagnostic ELITE",
      standfirst:
        "Široká mapa výkonové psychiky. Ukazuje, o co se dá u klienta opřít, " +
        "co ho brzdí a kudy vede nejbližší krok. Čtyři testy: dvě délky, dvě prostředí.",
    },
    {
      kicker: "Kapitola 4 · Rodina druhá",
      title: "Emocionálně-destruktivní vzorce",
      standfirst:
        "Jedenáct vzorců, které se zapínají pod tlakem, obvykle mimo vůli " +
        "a mimo rozum. Vysvětlují, proč klient dělá znovu to, o čem sám ví, " +
        "že mu škodí. Tři testy podle prostředí.",
    },
    {
      kicker: "Kapitola 5 · Rodina třetí",
      title: "Archetypy",
      standfirst:
        "Dvanáct typů osobnosti ve čtyřech motivačních skupinách. Neříkají, " +
        "jak je člověk silný, ale jaký je: co ho táhne, jak působí na ostatní " +
        "a kde se pod tlakem obrací proti sobě.",
    },
    {
      kicker: "Kapitola 6 · Týmy a kluby",
      title: "Players Survey",
      standfirst:
        "Větev pro celé týmy. Hráč vyplní dotazník a své vyhodnocení vidí jen " +
        "on; kouč dostane profil celého mužstva. Je to jediné místo v aplikaci, " +
        "kde výsledek uvidí i ten, kdo test vyplnil.",
    },
    {
      kicker: "Kapitola 7",
      title: "Praktické poznámky",
      standfirst: "Drobnosti, které se vyplatí vědět dřív, než na ně narazíš u klienta.",
    },
  ],

  postup: [
    {
      lbl: "Vystavíš pozvánku.",
      text:
        "V přehledu kouče vybereš test, jazyk a oslovení klienta. Aplikace vygeneruje " +
        "odkaz, který pošleš klientovi. Odkaz vede rovnou do dotazníku, klient si nic " +
        "nezakládá a nikam se nepřihlašuje.",
    },
    {
      lbl: "Klient vyplní dotazník.",
      text:
        "Odpovědi se průběžně ukládají v jeho zařízení, takže si může dát pauzu " +
        "a vrátit se později. Jazyk si může kdykoli během vyplňování přepnout.",
    },
    {
      lbl: "Odkaz se uzavře.",
      text:
        "Pozvánka je na jedno použití. Po odeslání přestane fungovat, takže tentýž " +
        "člověk nemůže tentýž test vyplnit dvakrát. Nevyužitá pozvánka platí 30 dní.",
    },
    {
      lbl: "Vyhodnocení se objeví u tebe.",
      text:
        "Klient po odeslání žádné výsledky nedostává, ani je nevidí. Otevřou se " +
        "výhradně tobě v přehledu kouče.",
    },
    {
      lbl: "Předáš výklad.",
      text:
        "Vyhodnocení si můžeš přečíst v aplikaci nebo stáhnout jako PDF. Každé končí " +
        "shrnutím psaným přímo klientovi, takže máš po ruce text, který se dá poslat " +
        "nebo přečíst nahlas na sezení.",
    },
  ],
  vysledkyNote:
    "Výsledky vidí jenom kouč. Není to nastavení, které by se dalo přepnout. Celý " +
    "produkt stojí na tom, že výklad se dostane ke klientovi přes rozhovor s tebou, " +
    "ne jako soubor, který si otevře sám v autobuse.",
  ch1Bloky: [
    {
      lbl: "Tři jazyky",
      text:
        "Každý test i každé vyhodnocení existuje v češtině, slovenštině a angličtině. " +
        "Nejde o strojový překlad rámování nad českým textem: dotazníky jsou pro každý " +
        "jazyk psané celé, včetně výkladu. Jazyk vybíráš při vystavení pozvánky a klient " +
        "si ho může během vyplňování přepnout. Vyhodnocení si pak umíš zobrazit i stáhnout " +
        "v kterémkoli z těch tří jazyků, nezávisle na tom, v jakém klient odpovídal.",
    },
    {
      lbl: "Oslovení",
      text:
        "Při vystavení pozvánky zadáváš, jestli je klient muž, nebo žena. Čeština " +
        "a slovenština skloňují podle rodu, takže se podle toho napíše celé vyhodnocení. " +
        "V anglické verzi se nic takového neřeší.",
    },
    {
      lbl: "Nedokončený dotazník",
      text:
        "Když klient dotazník neodešle celý, vyhodnocení se přesto sestaví a nahoře je " +
        "poznámka, kolik tvrzení zůstalo bez odpovědi. Ber ho pak jako podklad " +
        "k rozhovoru, ne jako hotový obrázek.",
    },
  ],

  rodinyHlavicka: ["Rodina", "Odpovídá na otázku", "Kdy po ní sáhnout"],
  rodiny: [
    {
      nazev: "Performance Diagnostic ELITE",
      otazka: "Jak dnes funguje jeho hlava ve výkonu?",
      kdy:
        "Na začátku spolupráce, když potřebuješ širokou mapu a chceš vědět, " +
        "o co se dá opřít a co brzdí.",
    },
    {
      nazev: "Emocionálně-destruktivní vzorce",
      otazka: "Co se v něm zapíná pod tlakem a odkud to je?",
      kdy:
        "Když klient opakovaně naráží na totéž, i když přesně ví, co by měl dělat. " +
        "Rozumové řešení tam nezabírá.",
    },
    {
      nazev: "Archetypy",
      otazka: "Jaký typ to je a jak působí na ostatní?",
      kdy:
        "Když řešíš roli v týmu, komunikaci, vedení, osobní značku nebo to, " +
        "proč si s někým nesedne.",
    },
  ],
  volbaTitle: "Rychlé rozhodnutí",
  volba: [
    {
      q: "Klient je sportovec.",
      a:
        "U všech tří rodin vybírej sportovní variantu. Není to přeformulovaná byznysová " +
        "verze: ptá se na kabinu, trenéra, sestavu a závod, tedy na situace, které klient " +
        "skutečně zná.",
    },
    {
      q: "Klient je manažer, podnikatel nebo jde o osobní život.",
      a:
        "Vybírej Business a Life, u archetypů Archetypy značky a u vzorců obecnou variantu.",
    },
    {
      q: "Sportovec z týmového sportu.",
      a: "U vzorců zvol Týmový sport. Řeší místo v sestavě, šatnu a poměřování se spoluhráči.",
    },
    {
      q: "Sportovec z individuálního sportu.",
      a:
        "U vzorců zvol Individuální sport. Řeší samotu v přípravě, vztah s trenérem " +
        "a to, že za výsledek nikdo jiný nestojí.",
    },
    {
      q: "Málo času, nebo chceš měřit opakovaně.",
      a:
        "Vezmi ELITE 100 místo ELITE 200. Pokrývá stejných sedm oblastí, jen bez " +
        "podrobnějšího členění uvnitř nich.",
    },
    {
      q: "Dlouhodobá spolupráce, chceš to vzít pořádně.",
      a:
        "Začni ELITE 200. Vzorce nebo archetypy pak přidej podle toho, na co se " +
        "v profilu narazí.",
    },
  ],
  volbaFootnote:
    "Rodiny se nevylučují a dají se kombinovat. Obvyklá dvojice je ELITE jako mapa " +
    "a vzorce jako vysvětlení, proč se něco v té mapě opakovaně nedaří posunout.",

  oblastiTitle: "Sedm oblastí, které ELITE sleduje",
  oblasti: {
    A: "Ví, kdo je a proč to dělá. Stojí jeho hodnota na výsledku, nebo na něčem pevnějším?",
    B: "Jak si mluví do hlavy, hlavně poté, co udělá chybu.",
    C: "Udrží pozornost tam, kde má být, a vrátí ji, když ji ztratí?",
    D: "Co s ním dělá tlak a jestli s tím umí zacházet.",
    E: "Jak zpracuje neúspěch a zpětnou vazbu a jak dlouho vydrží.",
    F: "Spánek, energie, konzistence. Jestli se o sebe stará, nebo to jen vydrží.",
    G: "Hranice, opora kolem sebe, bezpečí říct nahlas, co si myslí.",
  },
  oblastiFootnote:
    "Sport i Business a Life sledují týchž sedm oblastí. Liší se tím, na jaké situace " +
    "se ptají a jakým jazykem je vykládají.",
  eliteEvalTitle: "Co je ve vyhodnocení ELITE",
  eliteEvalLede:
    "Stejná stavba u všech čtyř testů. ELITE 200 je podrobnější uvnitř jednotlivých " +
    "oblastí, jinak čteš totéž.",
  eliteEval: [
    {
      lbl: "Profil v přehledu.",
      text: "Všech sedm oblastí vedle sebe, aby bylo na jeden pohled vidět, kde je člověk doma a kde ne.",
    },
    {
      lbl: "Opěrné body profilu.",
      text: "To nejsilnější, co má. Materiál, se kterým se dá pracovat, ne jen pochvala.",
    },
    {
      lbl: "Rozvojové priority.",
      text: "Kde je práce nejpotřebnější a co se stane, když se do toho pustíte.",
    },
    {
      lbl: "Dimenze profilu.",
      text:
        "Výklad ke každé ze sedmi oblastí zvlášť: co znamená, jak se u tohohle klienta " +
        "projevuje a jak s ní zacházet. U ELITE 200 je navíc rozpad na užší témata uvnitř " +
        "každé oblasti.",
    },
    {
      lbl: "Doporučení pro rozvoj na 8 až 12 týdnů.",
      text: "Konkrétní kroky, ne obecné rady. Použitelné jako osnova nejbližších sezení.",
    },
    {
      lbl: "Shrnutí pro klienta.",
      text: "Závěr psaný přímo jemu, v jeho rodě. Tohle je text, který mu můžeš předat nebo přečíst.",
    },
  ],

  vzorceTitle: "Jedenáct vzorců",
  oblastiVzorcuTitle: "Pět oblastí, do kterých se vzorce skládají",
  oblastiVzorcuIntro:
    "Vzorce nestojí samostatně. Vyhodnocení je seskupuje podle toho, co v člověku " +
    "zůstalo nenaplněné, a mluví pak o oblasti místo o třech jednotlivostech.",
  oblastiVzorcuFootnote:
    "Ve sportovních variantách se tytéž oblasti jmenují jazykem kabiny.",
  chybi: "Chybí",
  vzorceEvalTitle: "Co je ve vyhodnocení vzorců",
  vzorceEvalLede:
    "Stejná stavba u všech tří variant. Liší se jazyk výkladu a situace, o kterých mluví.",
  vzorceEval: [
    { lbl: "Profil všech vzorců.", text: "Jedenáct vzorců vedle sebe, od nejsilnějšího po nejslabší." },
    {
      lbl: "Zatížení oblastí.",
      text:
        "Kde se to sbíhá. Často je čitelnější než jednotlivé vzorce, protože ukáže " +
        "jednu potřebu za třemi projevy.",
    },
    {
      lbl: "Tři nejsilnější vzorce s výkladem.",
      text: "U každého tři pohledy: jak to vypadá zevnitř, co to dělá pod tlakem a odkud se to vzalo.",
    },
    {
      lbl: "Situačně aktivované vzorce.",
      text:
        "Vzorce, které v součtu nevyčnívají, ale klient u nich označil několik tvrzení " +
        "hodně silně. Bývají to přesně ty spouštěče, o kterých se pak dobře mluví.",
    },
    {
      lbl: "Jak to funguje dohromady.",
      text:
        "Co spolu dvojice nejsilnějších vzorců dělá. Dva vzorce vedle sebe se často " +
        "chovají jinak než každý zvlášť.",
    },
    { lbl: "Shrnutí pro klienta.", text: "Závěr psaný přímo jemu, v jeho rodě." },
  ],
  vzorceNote:
    "Výsledek není diagnóza ani nálepka. Tak je to napsané i v instrukcích, které klient " +
    "vidí před vyplňováním. Vysoký vzorec neříká, že je něco v nepořádku, říká, kde je " +
    "člověk citlivý a co ho pod tlakem přebírá.",

  archetypyTitle: "Dvanáct archetypů ve čtyřech skupinách",
  archetypyHlavicka: ["Motivační skupina", "Archetypy", "O co jde"],
  archetypyFootnote:
    "Ve sportovní variantě nesou archetypy navíc přezdívku z prostředí sportu.",
  archEvalTitle: "Co je ve vyhodnocení archetypů",
  archEvalLede:
    "Stejná stavba u obou variant. Sportovní má navíc tři části o týmu, trenérovi " +
    "a vystupování navenek.",
  archEval: [
    {
      lbl: "Profil všech dvanácti archetypů.",
      text: "Celé pole vedle sebe, aby bylo vidět, jak vyhraněný ten člověk je.",
    },
    {
      lbl: "Motivační mapa.",
      text: "Čtyři skupiny a to, kam se váha sype. Často řekne víc než jediný nejsilnější typ.",
    },
    {
      lbl: "Primární archetyp.",
      text:
        "Kdo to hlavně je. Podrobný výklad: podstata, jak se to projeví v podnikání nebo " +
        "ve sportu, stín pod tlakem, typické pasti a návod, co s tím dělat.",
    },
    {
      lbl: "Sekundární archetyp.",
      text: "Druhá barva, která primární typ mění. Tentýž Hrdina vypadá jinak s Mudrcem za zády než se Šprýmařem.",
    },
    {
      lbl: "Potlačený archetyp.",
      text: "To, co v sobě člověk nemá rád nebo si to nedovolí. Bývá to nejcennější místo celého vyhodnocení.",
    },
    {
      lbl: "Jak spolu hrají.",
      text:
        "Souhra primárního, sekundárního a potlačeného. Ne tři popisy vedle sebe, " +
        "ale jeden výklad té konkrétní kombinace.",
    },
    { lbl: "Shrnutí pro klienta.", text: "Závěr psaný přímo jemu, v jeho rodě." },
  ],
  archSportTitle: "Co má navíc sportovní varianta",
  archSport: [
    {
      lbl: "Role v týmu a v individuální přípravě.",
      text: "Kde tenhle typ v sestavě sedí a kde ho to bude dřít.",
    },
    { lbl: "Kde to skřípe s trenérem.", text: "Předvídatelná místa střetu a čím se dají obejít." },
    {
      lbl: "Osobní značka a komunikace navenek.",
      text: "Jak vystupovat na veřejnosti, aby to sedělo tomu, kým člověk je.",
    },
  ],
  archNote:
    "Archetyp není hodnocení. Žádný z dvanácti není lepší. Vyhodnocení proto neříká, " +
    "který mít, ale co s tím, který klient má, a co ho stojí ten, který mu chybí.",

  tymBloky: [
    {
      lbl: "Co to je",
      text:
        "Players Survey je Performance Diagnostic ELITE 200 ve sportovní variantě " +
        "pod jiným názvem. Vůči hráči ani klubovému kouči se slovo diagnostika " +
        "nepoužívá; mluví se o dotazníku a o profilu týmu.",
    },
    {
      lbl: "Kdo tým zakládá",
      text:
        "Tým zakládá master a přiřadí ho konkrétnímu externímu kouči. Ten pak " +
        "v rámci svého týmu vystavuje odkazy pro hráče, nic víc. Na ostatní testy " +
        "se nedostane, dokud mu master nepovolí plný přístup.",
    },
    {
      lbl: "Štítky místo jmen",
      text:
        "Označení hráčů si volí kouč sám. Může to být jméno, může to být Player 1. " +
        "Hráč si před odesláním může štítek nechat, nebo napsat svoje jméno. " +
        "Nás v obou případech nezajímá, kdo za štítkem je.",
    },
    {
      lbl: "Volba hráče",
      text:
        "Před odesláním si hráč vybere, jestli chce vyhodnocení sdílet s koučem. " +
        "Když nechce, kouč uvidí jen to, že je odevzdáno. Odpovědi se do profilu " +
        "týmu i do norem započítají tak jako tak, anonymně.",
    },
    {
      lbl: "Co dostane hráč",
      text:
        "Vlastní vyhodnocení hned po odeslání, ke stažení v PDF. Je to jediné " +
        "místo v aplikaci, kde vyplňující vidí svůj výsledek.",
    },
    {
      lbl: "Co dostane kouč",
      text:
        "Profil týmu na šest až osm stran: shrnutí, sedm oblastí s výkladem, " +
        "strukturální nálezy, plán práce na dvanáct týdnů, otázky do rozhovorů " +
        "a mantinely použití. Jednotlivé hráče v něm nenajde.",
    },
    {
      lbl: "Jazyky",
      text: "Jen čeština a angličtina. Slovenština se v téhle větvi nenabízí.",
    },
    {
      lbl: "Malý tým",
      text:
        "Pod pěti odevzdanými dotazníky se profil blíží profilu jednotlivce " +
        "a dá se z něj usuzovat na konkrétní hráče. Report na to kouče sám " +
        "upozorní a řekne, jak s tím zacházet.",
    },
  ],
  tymRoleTitle: "Kdo co vidí",
  tymRole: [
    { lbl: "Hráč", text: "Své vlastní vyhodnocení, vždy. Nic dalšího." },
    {
      lbl: "Klubový kouč",
      text: "Profil svého týmu a ta vyplnění, která mu hráči sdíleli. Cizí týmy ne.",
    },
    { lbl: "Náš interní kouč", text: "Z týmové větve nic." },
    {
      lbl: "Master",
      text: "Název týmu a jeho profil. Žádné jednotlivé vyplnění, ani sdílené.",
    },
  ],
  tymNote:
    "Klubový kouč tenhle manuál nevidí a nepotřebuje ho. Rozhraní má zúžené " +
    "na jedinou věc: vystavit odkaz pro hráče a přečíst si profil týmu.",

  praktickeBloky: [
    {
      title: "Než pozvánku pošleš",
      polozky: [
        {
          lbl: "Zkontroluj variantu.",
          text:
            "Sport nebo byznys, u vzorců navíc individuální nebo týmový. Špatná varianta " +
            "se pozná až z odpovědí a odkaz už podruhé nepoužiješ.",
        },
        {
          lbl: "Zkontroluj jazyk a oslovení.",
          text: "Jazyk si klient přepnout umí, oslovení ne. To zadáváš ty.",
        },
        {
          lbl: "Řekni klientovi, kolik to zabere.",
          text: "ELITE 200 je skoro hodina. Kdo si na to nesedne pořádně, vyplní ho zbrkle.",
        },
      ],
    },
    {
      title: "Co říct klientovi předem",
      polozky: [
        {
          lbl: "",
          text:
            "Ať odpovídá rychle a podle toho, co se v něm skutečně děje, ne podle toho, " +
            "jaký by chtěl být.",
        },
        {
          lbl: "",
          text:
            "Ať to nevyplňuje po hádce ani hodinu po zápase. Zajímá nás, jak to má obvykle, " +
            "ne jak se cítí právě teď.",
        },
        {
          lbl: "",
          text:
            "Že výsledky uvidíš ty a projdete je spolu. Klient je po odeslání nedostane " +
            "a je lepší, když to ví předem, než aby na ně čekal.",
        },
      ],
    },
    {
      title: "Když se něco pokazí",
      polozky: [
        {
          lbl: "Odkaz nefunguje.",
          text:
            "Buď byl už použitý, nebo mu vypršela platnost, nebo byla zrušená. Klient uvidí " +
            "hlášku ve svém jazyce. Vystav novou pozvánku.",
        },
        {
          lbl: "Klient si dotazník rozdělal a nedokončil.",
          text:
            "Rozepsané odpovědi má uložené ve svém zařízení, takže může pokračovat na témže " +
            "odkazu ve stejném prohlížeči. Na jiném zařízení začíná znovu.",
        },
        {
          lbl: "Pozvánka je na špatný test.",
          text: "Zruš ji, dokud ji klient neotevřel, a vystav novou.",
        },
      ],
    },
  ],
  zachazeniTitle: "Jak s vyhodnocením zacházet",
  zachazeni: [
    "Vyhodnocení je podklad k rozhovoru, ne verdikt. Nejsilnější část bývá ta, kterou " +
      "klient nečeká: potlačený archetyp, oblast, kam se sbíhají tři vzorce, nebo rozvojová " +
      "priorita v oblasti, o které si myslel, že ji má vyřešenou. Shrnutí na konci je psané " +
      "tak, aby se dalo předat beze změny.",
    "Diagnostika neurčuje, co s člověkem je. Ukazuje, kde se dá zabrat, aby se hnul dál.",
  ],

  prehledTitle: "Přehled všech devíti diagnostik",
  prehledLede:
    "Rejstřík k celému manuálu. Číslo u testu odpovídá pořadí, v jakém je popsaný výše.",
  prehledHlavicka: ["Test", "Rozsah", "Prostředí"],
  prostredi: { sport: "Sport", byznys: "Byznys a život" },

  testy: {
    "elite200-sport": {
      podtitul: "Sportovní varianta",
      proKoho: "Sportovci, hloubková vstupní diagnostika",
      doba: "45–60 minut",
      kCemuJe:
        "Nejpodrobnější, co máme. Sáhni po ní, když spolupráce začíná a má trvat měsíce: " +
        "chceš celý obrázek a jednu solidní výchozí čáru, ke které se pak budeš vracet. " +
        "Uvnitř každé ze sedmi oblastí rozlišuje ještě tři užší témata, takže neřekne jen " +
        "„koncentrace vázne“, ale ukáže, jestli je problém v rušení zvenčí, v návratu " +
        "pozornosti po chybě, nebo v tom, že klient hlavou žije ve výsledku místo v procesu.",
    },
    "elite200-business": {
      podtitul: "Byznysová a životní varianta",
      proKoho: "Manažeři, podnikatelé, osobní rozvoj",
      doba: "45–60 minut",
      kCemuJe:
        "Totéž pro člověka, jehož hřištěm je porada, jednání a rodina. Ptá se na " +
        "rozhodování pod tlakem, na energii napříč týdnem, na hranice v práci a na to, " +
        "jestli se sebehodnota drží jinde než ve výsledcích čtvrtletí.",
    },
    "elite100-sport": {
      podtitul: "Sportovní varianta",
      proKoho: "Sportovci, rychlejší vstup nebo opakované měření",
      doba: "20–30 minut",
      kCemuJe:
        "Poloviční délka, stejných sedm oblastí. Vhodná, když klient nemá hodinu, když " +
        "chceš mít profil rychle před prvním sezením, nebo když měříš znovu po nějaké době " +
        "a zajímá tě posun v celých oblastech. Nerozpadá je na užší témata, takže řekne, " +
        "kde to vázne, ne už tak přesně proč.",
    },
    "elite100-business": {
      podtitul: "Byznysová a životní varianta",
      proKoho: "Manažeři, podnikatelé, osobní rozvoj",
      doba: "20–30 minut",
      kCemuJe:
        "Kratší byznysová verze. Osvědčí se ve firmách, kde se diagnostika zadává více " +
        "lidem najednou a delší dotazník by část z nich odradil.",
    },
    vzorce: {
      podtitul: "Obecná varianta",
      proKoho: "Manažeři, podnikatelé, osobní život",
      doba: "přibližně 25 minut",
      kCemuJe:
        "Ptá se na vztahy, práci a na sebe sama, bez sportovního rámce. Nasaď ji, když " +
        "klient v koučinku opakovaně narazí na tutéž zeď: ví, co má dělat, umí to popsat, " +
        "a stejně to neudělá. Vzorce ukážou, co tomu stojí v cestě a proč to není otázka vůle.",
    },
    "vzorce-sport-individual": {
      podtitul: "Sportovní varianta, individuální sporty",
      proKoho: "Atleti, tenisté, plavci, jezdci, bojová umění",
      doba: "přibližně 25 minut",
      kCemuJe:
        "Vlastní dotazník, ne přeformulovaná obecná verze. Ptá se na samotu v přípravě, " +
        "na vztah s trenérem, na to, že za výsledek nikdo jiný nestojí, a na hlavu ve " +
        "startovním bloku. Vzorec se u individuálního sportovce projeví jinak než v kabině " +
        "a jinak než v kanceláři, takže i výklad mluví o jeho situacích.",
    },
    "vzorce-sport-tym": {
      podtitul: "Sportovní varianta, týmové sporty",
      proKoho: "Fotbal, hokej, basketbal, volejbal a podobné",
      doba: "přibližně 25 minut",
      kCemuJe:
        "Také vlastní dotazník. Točí se kolem místa v sestavě, šatny, poměřování se " +
        "spoluhráči, změny trenéra a toho, jaké je sedět na lavičce. Pro hráče, u kterého " +
        "se výkon láme podle toho, jak se cítí ve skupině.",
    },
    archetypy: {
      podtitul: "Byznysová varianta",
      proKoho: "Podnikatelé, manažeři, lidé budující značku",
      doba: "přibližně 20 minut",
      kCemuJe:
        "Pro práci s rolí, vedením, komunikací a osobní značkou. Odpovídá na to, proč " +
        "někdo za člověkem jde a jiný ne, jaký typ vedení mu sedí a čím odpuzuje, aniž by " +
        "to tušil. Dobře se hodí i tam, kde se řeší nástupnictví nebo skladba vedení: " +
        "dva Vládci vedle sebe fungují jinak než Vládce s Pečovatelem.",
    },
    "archetypy-sport": {
      podtitul: "Sportovní varianta",
      proKoho: "Sportovci, individuální i týmoví",
      doba: "přibližně 20 minut",
      kCemuJe:
        "Vlastní dotazník, ne přeložený byznysový. Archetyp je týž, ale ptát se majitele " +
        "firmy a sportovce stejnými slovy nejde. Sáhni po něm, když řešíš roli v týmu, " +
        "vztah s trenérem, vystupování navenek nebo to, proč hráč nesedí do role, do které " +
        "ho někdo posadil.",
    },
  },
}

const SK: ManualTexty = {
  title: "Manuál pre koučov",
  lede:
    "Deväť diagnostík v troch rodinách. Ku každej je tu, komu ju zadať, " +
    "čo v človeku sleduje a čo nájdeš v jej vyhodnotení. Na konci tímová " +
    "vetva pre celé kluby.",
  obsah: "Obsah",
  pdf: "Stiahnuť ako PDF",
  tvrzeni: "tvrdení",
  popiskyKaret: { proKoho: "Pre koho", rozsah: "Rozsah", jazyky: "Jazyky" },
  jazykyHodnota: "Čeština, slovenčina, angličtina",
  kCemuJe: "Na čo je",

  kapitoly: [
    {
      kicker: "Kapitola 1",
      title: "Ako diagnostika prebieha",
      standfirst:
        "Priebeh je pri všetkých deviatich testoch rovnaký. Líši sa len to, čo sa " +
        "klienta pýtame a čo z toho vyjde.",
    },
    {
      kicker: "Kapitola 2",
      title: "Ktorú diagnostiku vybrať",
      standfirst:
        "Tri rodiny odpovedajú na tri rôzne otázky. Nie sú to stupne toho istého: " +
        "nejde o to, ktorá je podrobnejšia, ale o to, na čo sa pýtaš.",
    },
    {
      kicker: "Kapitola 3 · Rodina prvá",
      title: "Performance Diagnostic ELITE",
      standfirst:
        "Široká mapa výkonovej psychiky. Ukazuje, o čo sa dá u klienta oprieť, čo ho " +
        "brzdí a kadiaľ vedie najbližší krok. Štyri testy: dve dĺžky, dve prostredia.",
    },
    {
      kicker: "Kapitola 4 · Rodina druhá",
      title: "Emocionálne-deštruktívne vzorce",
      standfirst:
        "Jedenásť vzorcov, ktoré sa zapínajú pod tlakom, obvykle mimo vôle a mimo " +
        "rozumu. Vysvetľujú, prečo klient robí znovu to, o čom sám vie, že mu škodí. " +
        "Tri testy podľa prostredia.",
    },
    {
      kicker: "Kapitola 5 · Rodina tretia",
      title: "Archetypy",
      standfirst:
        "Dvanásť typov osobnosti v štyroch motivačných skupinách. Nehovoria, aký je " +
        "človek silný, ale aký je: čo ho ťahá, ako pôsobí na ostatných a kde sa pod " +
        "tlakom obracia proti sebe.",
    },
    {
      kicker: "Kapitola 6 · Tímy a kluby",
      title: "Players Survey",
      standfirst:
        "Vetva pre celé tímy. Hráč vyplní dotazník a svoje vyhodnotenie vidí len " +
        "on; kouč dostane profil celého mužstva. Je to jediné miesto v aplikácii, " +
        "kde výsledok uvidí aj ten, kto test vypĺňal.",
    },
    {
      kicker: "Kapitola 7",
      title: "Praktické poznámky",
      standfirst: "Drobnosti, ktoré sa oplatí vedieť skôr, než na ne narazíš u klienta.",
    },
  ],

  postup: [
    {
      lbl: "Vystavíš pozvánku.",
      text:
        "V prehľade kouča vyberieš test, jazyk a oslovenie klienta. Aplikácia vygeneruje " +
        "odkaz, ktorý pošleš klientovi. Odkaz vedie rovno do dotazníka, klient si nič " +
        "nezakladá a nikam sa neprihlasuje.",
    },
    {
      lbl: "Klient vyplní dotazník.",
      text:
        "Odpovede sa priebežne ukladajú v jeho zariadení, takže si môže dať pauzu " +
        "a vrátiť sa neskôr. Jazyk si môže kedykoľvek počas vypĺňania prepnúť.",
    },
    {
      lbl: "Odkaz sa uzavrie.",
      text:
        "Pozvánka je na jedno použitie. Po odoslaní prestane fungovať, takže ten istý " +
        "človek nemôže ten istý test vyplniť dvakrát. Nevyužitá pozvánka platí 30 dní.",
    },
    {
      lbl: "Vyhodnotenie sa objaví u teba.",
      text:
        "Klient po odoslaní žiadne výsledky nedostáva, ani ich nevidí. Otvoria sa " +
        "výhradne tebe v prehľade kouča.",
    },
    {
      lbl: "Odovzdáš výklad.",
      text:
        "Vyhodnotenie si môžeš prečítať v aplikácii alebo stiahnuť ako PDF. Každé končí " +
        "zhrnutím písaným priamo klientovi, takže máš poruke text, ktorý sa dá poslať " +
        "alebo prečítať nahlas na sedení.",
    },
  ],
  vysledkyNote:
    "Výsledky vidí iba kouč. Nie je to nastavenie, ktoré by sa dalo prepnúť. Celý " +
    "produkt stojí na tom, že výklad sa dostane ku klientovi cez rozhovor s tebou, " +
    "nie ako súbor, ktorý si otvorí sám v autobuse.",
  ch1Bloky: [
    {
      lbl: "Tri jazyky",
      text:
        "Každý test aj každé vyhodnotenie existuje v češtine, slovenčine a angličtine. " +
        "Nejde o strojový preklad rámovania nad českým textom: dotazníky sú pre každý " +
        "jazyk písané celé, vrátane výkladu. Jazyk vyberáš pri vystavení pozvánky a klient " +
        "si ho môže počas vypĺňania prepnúť. Vyhodnotenie si potom vieš zobraziť aj " +
        "stiahnuť v ktoromkoľvek z tých troch jazykov, nezávisle od toho, v akom klient " +
        "odpovedal.",
    },
    {
      lbl: "Oslovenie",
      text:
        "Pri vystavení pozvánky zadávaš, či je klient muž, alebo žena. Čeština " +
        "a slovenčina skloňujú podľa rodu, takže sa podľa toho napíše celé vyhodnotenie. " +
        "V anglickej verzii sa nič také nerieši.",
    },
    {
      lbl: "Nedokončený dotazník",
      text:
        "Keď klient dotazník neodošle celý, vyhodnotenie sa napriek tomu zostaví a hore " +
        "je poznámka, koľko tvrdení zostalo bez odpovede. Ber ho potom ako podklad " +
        "k rozhovoru, nie ako hotový obraz.",
    },
  ],

  rodinyHlavicka: ["Rodina", "Odpovedá na otázku", "Kedy po nej siahnuť"],
  rodiny: [
    {
      nazev: "Performance Diagnostic ELITE",
      otazka: "Ako dnes funguje jeho hlava vo výkone?",
      kdy:
        "Na začiatku spolupráce, keď potrebuješ širokú mapu a chceš vedieť, o čo sa dá " +
        "oprieť a čo brzdí.",
    },
    {
      nazev: "Emocionálne-deštruktívne vzorce",
      otazka: "Čo sa v ňom zapína pod tlakom a odkiaľ to je?",
      kdy:
        "Keď klient opakovane naráža na to isté, aj keď presne vie, čo by mal robiť. " +
        "Rozumové riešenie tam nezaberá.",
    },
    {
      nazev: "Archetypy",
      otazka: "Aký typ to je a ako pôsobí na ostatných?",
      kdy:
        "Keď riešiš rolu v tíme, komunikáciu, vedenie, osobnú značku alebo to, " +
        "prečo si s niekým nesadne.",
    },
  ],
  volbaTitle: "Rýchle rozhodnutie",
  volba: [
    {
      q: "Klient je športovec.",
      a:
        "Pri všetkých troch rodinách vyberaj športovú variantu. Nie je to preformulovaná " +
        "biznisová verzia: pýta sa na kabínu, trénera, zostavu a preteky, teda na situácie, " +
        "ktoré klient naozaj pozná.",
    },
    {
      q: "Klient je manažér, podnikateľ alebo ide o osobný život.",
      a:
        "Vyberaj Business a Life, pri archetypoch Archetypy značky a pri vzorcoch " +
        "všeobecnú variantu.",
    },
    {
      q: "Športovec z tímového športu.",
      a:
        "Pri vzorcoch zvoľ Tímový šport. Rieši miesto v zostave, šatňu a porovnávanie " +
        "so spoluhráčmi.",
    },
    {
      q: "Športovec z individuálneho športu.",
      a:
        "Pri vzorcoch zvoľ Individuálny šport. Rieši samotu v príprave, vzťah s trénerom " +
        "a to, že za výsledok nikto iný nestojí.",
    },
    {
      q: "Málo času, alebo chceš merať opakovane.",
      a:
        "Vezmi ELITE 100 namiesto ELITE 200. Pokrýva rovnakých sedem oblastí, len bez " +
        "podrobnejšieho členenia vnútri nich.",
    },
    {
      q: "Dlhodobá spolupráca, chceš to vziať poriadne.",
      a:
        "Začni ELITE 200. Vzorce alebo archetypy potom pridaj podľa toho, na čo sa " +
        "v profile narazí.",
    },
  ],
  volbaFootnote:
    "Rodiny sa nevylučujú a dajú sa kombinovať. Obvyklá dvojica je ELITE ako mapa " +
    "a vzorce ako vysvetlenie, prečo sa niečo v tej mape opakovane nedarí pohnúť.",

  oblastiTitle: "Sedem oblastí, ktoré ELITE sleduje",
  oblasti: {
    A: "Vie, kto je a prečo to robí. Stojí jeho hodnota na výsledku, alebo na niečom pevnejšom?",
    B: "Ako si hovorí do hlavy, hlavne potom, čo urobí chybu.",
    C: "Udrží pozornosť tam, kde má byť, a vráti ju, keď ju stratí?",
    D: "Čo s ním robí tlak a či s tým vie zaobchádzať.",
    E: "Ako spracuje neúspech a spätnú väzbu a ako dlho vydrží.",
    F: "Spánok, energia, konzistencia. Či sa o seba stará, alebo to len vydrží.",
    G: "Hranice, opora okolo seba, bezpečie povedať nahlas, čo si myslí.",
  },
  oblastiFootnote:
    "Šport aj Business a Life sledujú tých istých sedem oblastí. Líšia sa tým, na aké " +
    "situácie sa pýtajú a akým jazykom ich vykladajú.",
  eliteEvalTitle: "Čo je vo vyhodnotení ELITE",
  eliteEvalLede:
    "Rovnaká stavba pri všetkých štyroch testoch. ELITE 200 je podrobnejší vnútri " +
    "jednotlivých oblastí, inak čítaš to isté.",
  eliteEval: [
    {
      lbl: "Profil v prehľade.",
      text: "Všetkých sedem oblastí vedľa seba, aby bolo na jeden pohľad vidieť, kde je človek doma a kde nie.",
    },
    {
      lbl: "Oporné body profilu.",
      text: "To najsilnejšie, čo má. Materiál, s ktorým sa dá pracovať, nie len pochvala.",
    },
    {
      lbl: "Rozvojové priority.",
      text: "Kde je práca najpotrebnejšia a čo sa stane, keď sa do toho pustíte.",
    },
    {
      lbl: "Dimenzie profilu.",
      text:
        "Výklad ku každej zo siedmich oblastí zvlášť: čo znamená, ako sa u tohto klienta " +
        "prejavuje a ako s ňou zaobchádzať. Pri ELITE 200 je navyše rozpad na užšie témy " +
        "vnútri každej oblasti.",
    },
    {
      lbl: "Odporúčania pre rozvoj na 8 až 12 týždňov.",
      text: "Konkrétne kroky, nie všeobecné rady. Použiteľné ako osnova najbližších sedení.",
    },
    {
      lbl: "Zhrnutie pre klienta.",
      text: "Záver písaný priamo jemu, v jeho rode. Toto je text, ktorý mu môžeš odovzdať alebo prečítať.",
    },
  ],

  vzorceTitle: "Jedenásť vzorcov",
  oblastiVzorcuTitle: "Päť oblastí, do ktorých sa vzorce skladajú",
  oblastiVzorcuIntro:
    "Vzorce nestoja samostatne. Vyhodnotenie ich zoskupuje podľa toho, čo v človeku " +
    "zostalo nenaplnené, a hovorí potom o oblasti namiesto o troch jednotlivostiach.",
  oblastiVzorcuFootnote:
    "V športových variantách sa tie isté oblasti volajú jazykom kabíny.",
  chybi: "Chýba",
  vzorceEvalTitle: "Čo je vo vyhodnotení vzorcov",
  vzorceEvalLede:
    "Rovnaká stavba pri všetkých troch variantách. Líši sa jazyk výkladu a situácie, " +
    "o ktorých hovoria.",
  vzorceEval: [
    { lbl: "Profil všetkých vzorcov.", text: "Jedenásť vzorcov vedľa seba, od najsilnejšieho po najslabší." },
    {
      lbl: "Zaťaženie oblastí.",
      text:
        "Kde sa to zbieha. Často je čitateľnejšie než jednotlivé vzorce, pretože ukáže " +
        "jednu potrebu za tromi prejavmi.",
    },
    {
      lbl: "Tri najsilnejšie vzorce s výkladom.",
      text: "Pri každom tri pohľady: ako to vyzerá zvnútra, čo to robí pod tlakom a odkiaľ sa to vzalo.",
    },
    {
      lbl: "Situačne aktivované vzorce.",
      text:
        "Vzorce, ktoré v súčte nevyčnievajú, ale klient pri nich označil niekoľko tvrdení " +
        "veľmi silno. Bývajú to presne tie spúšťače, o ktorých sa potom dobre hovorí.",
    },
    {
      lbl: "Ako to funguje dohromady.",
      text:
        "Čo spolu dvojica najsilnejších vzorcov robí. Dva vzorce vedľa seba sa často " +
        "správajú inak než každý zvlášť.",
    },
    { lbl: "Zhrnutie pre klienta.", text: "Záver písaný priamo jemu, v jeho rode." },
  ],
  vzorceNote:
    "Výsledok nie je diagnóza ani nálepka. Tak je to napísané aj v inštrukciách, ktoré " +
    "klient vidí pred vypĺňaním. Vysoký vzorec nehovorí, že je niečo v neporiadku, hovorí, " +
    "kde je človek citlivý a čo ho pod tlakom preberá.",

  archetypyTitle: "Dvanásť archetypov v štyroch skupinách",
  archetypyHlavicka: ["Motivačná skupina", "Archetypy", "O čo ide"],
  archetypyFootnote:
    "V športovej variante nesú archetypy navyše prezývku z prostredia športu.",
  archEvalTitle: "Čo je vo vyhodnotení archetypov",
  archEvalLede:
    "Rovnaká stavba pri oboch variantách. Športová má navyše tri časti o tíme, trénerovi " +
    "a vystupovaní navonok.",
  archEval: [
    {
      lbl: "Profil všetkých dvanástich archetypov.",
      text: "Celé pole vedľa seba, aby bolo vidieť, aký vyhranený ten človek je.",
    },
    {
      lbl: "Motivačná mapa.",
      text: "Štyri skupiny a to, kam sa váha sype. Často povie viac než jediný najsilnejší typ.",
    },
    {
      lbl: "Primárny archetyp.",
      text:
        "Kto to hlavne je. Podrobný výklad: podstata, ako sa to prejaví v podnikaní alebo " +
        "v športe, tieň pod tlakom, typické pasce a návod, čo s tým robiť.",
    },
    {
      lbl: "Sekundárny archetyp.",
      text: "Druhá farba, ktorá primárny typ mení. Ten istý Hrdina vyzerá inak s Mudrcom za chrbtom než so Šprýmarom.",
    },
    {
      lbl: "Potlačený archetyp.",
      text: "To, čo v sebe človek nemá rád alebo si to nedovolí. Býva to najcennejšie miesto celého vyhodnotenia.",
    },
    {
      lbl: "Ako spolu hrajú.",
      text:
        "Súhra primárneho, sekundárneho a potlačeného. Nie tri opisy vedľa seba, " +
        "ale jeden výklad tej konkrétnej kombinácie.",
    },
    { lbl: "Zhrnutie pre klienta.", text: "Záver písaný priamo jemu, v jeho rode." },
  ],
  archSportTitle: "Čo má navyše športová varianta",
  archSport: [
    {
      lbl: "Rola v tíme a v individuálnej príprave.",
      text: "Kde tento typ v zostave sedí a kde ho to bude drieť.",
    },
    { lbl: "Kde to škrípe s trénerom.", text: "Predvídateľné miesta stretu a čím sa dajú obísť." },
    {
      lbl: "Osobná značka a komunikácia navonok.",
      text: "Ako vystupovať na verejnosti, aby to sedelo tomu, kým človek je.",
    },
  ],
  archNote:
    "Archetyp nie je hodnotenie. Žiadny z dvanástich nie je lepší. Vyhodnotenie preto " +
    "nehovorí, ktorý mať, ale čo s tým, ktorý klient má, a čo ho stojí ten, ktorý mu chýba.",

  tymBloky: [
    {
      lbl: "Čo to je",
      text:
        "Players Survey je Performance Diagnostic ELITE 200 v športovej variante " +
        "pod iným názvom. Voči hráčovi ani klubovému koučovi sa slovo diagnostika " +
        "nepoužíva; hovorí sa o dotazníku a o profile tímu.",
    },
    {
      lbl: "Kto tím zakladá",
      text:
        "Tím zakladá master a priradí ho konkrétnemu externému koučovi. Ten potom " +
        "v rámci svojho tímu vystavuje odkazy pre hráčov, nič viac. Na ostatné " +
        "testy sa nedostane, kým mu master nepovolí plný prístup.",
    },
    {
      lbl: "Štítky namiesto mien",
      text:
        "Označenie hráčov si volí kouč sám. Môže to byť meno, môže to byť " +
        "Player 1. Hráč si pred odoslaním môže štítok nechať, alebo napísať svoje " +
        "meno. Nás v oboch prípadoch nezaujíma, kto za štítkom je.",
    },
    {
      lbl: "Voľba hráča",
      text:
        "Pred odoslaním si hráč vyberie, či chce vyhodnotenie zdieľať s koučom. " +
        "Keď nechce, kouč uvidí len to, že je odovzdané. Odpovede sa do profilu " +
        "tímu aj do noriem započítajú tak či tak, anonymne.",
    },
    {
      lbl: "Čo dostane hráč",
      text:
        "Vlastné vyhodnotenie hneď po odoslaní, na stiahnutie v PDF. Je to jediné " +
        "miesto v aplikácii, kde vypĺňajúci vidí svoj výsledok.",
    },
    {
      lbl: "Čo dostane kouč",
      text:
        "Profil tímu na šesť až osem strán: zhrnutie, sedem oblastí s výkladom, " +
        "štrukturálne nálezy, plán práce na dvanásť týždňov, otázky do rozhovorov " +
        "a mantinely použitia. Jednotlivých hráčov v ňom nenájde.",
    },
    {
      lbl: "Jazyky",
      text: "Len čeština a angličtina. Slovenčina sa v tejto vetve neponúka.",
    },
    {
      lbl: "Malý tím",
      text:
        "Pod piatimi odovzdanými dotazníkmi sa profil blíži profilu jednotlivca " +
        "a dá sa z neho usudzovať na konkrétnych hráčov. Report na to kouča sám " +
        "upozorní a povie, ako s tým zaobchádzať.",
    },
  ],
  tymRoleTitle: "Kto čo vidí",
  tymRole: [
    { lbl: "Hráč", text: "Svoje vlastné vyhodnotenie, vždy. Nič ďalšie." },
    {
      lbl: "Klubový kouč",
      text: "Profil svojho tímu a tie vyplnenia, ktoré mu hráči zdieľali. Cudzie tímy nie.",
    },
    { lbl: "Náš interný kouč", text: "Z tímovej vetvy nič." },
    {
      lbl: "Master",
      text: "Názov tímu a jeho profil. Žiadne jednotlivé vyplnenie, ani zdieľané.",
    },
  ],
  tymNote:
    "Klubový kouč tento manuál nevidí a nepotrebuje ho. Rozhranie má zúžené " +
    "na jedinú vec: vystaviť odkaz pre hráča a prečítať si profil tímu.",

  praktickeBloky: [
    {
      title: "Než pozvánku pošleš",
      polozky: [
        {
          lbl: "Skontroluj variantu.",
          text:
            "Šport alebo biznis, pri vzorcoch navyše individuálny alebo tímový. Zlá " +
            "varianta sa pozná až z odpovedí a odkaz už druhýkrát nepoužiješ.",
        },
        {
          lbl: "Skontroluj jazyk a oslovenie.",
          text: "Jazyk si klient prepnúť vie, oslovenie nie. To zadávaš ty.",
        },
        {
          lbl: "Povedz klientovi, koľko to zaberie.",
          text: "ELITE 200 je skoro hodina. Kto si na to nesadne poriadne, vyplní ho zbrklo.",
        },
      ],
    },
    {
      title: "Čo povedať klientovi vopred",
      polozky: [
        {
          lbl: "",
          text:
            "Nech odpovedá rýchlo a podľa toho, čo sa v ňom naozaj deje, nie podľa toho, " +
            "aký by chcel byť.",
        },
        {
          lbl: "",
          text:
            "Nech to nevypĺňa po hádke ani hodinu po zápase. Zaujíma nás, ako to má obvykle, " +
            "nie ako sa cíti práve teraz.",
        },
        {
          lbl: "",
          text:
            "Že výsledky uvidíš ty a prejdete ich spolu. Klient ich po odoslaní nedostane " +
            "a je lepšie, keď to vie vopred, než aby na ne čakal.",
        },
      ],
    },
    {
      title: "Keď sa niečo pokazí",
      polozky: [
        {
          lbl: "Odkaz nefunguje.",
          text:
            "Buď bol už použitý, alebo mu vypršala platnosť, alebo bola zrušená. Klient " +
            "uvidí hlášku vo svojom jazyku. Vystav novú pozvánku.",
        },
        {
          lbl: "Klient si dotazník rozrobil a nedokončil.",
          text:
            "Rozpísané odpovede má uložené vo svojom zariadení, takže môže pokračovať na " +
            "tom istom odkaze v rovnakom prehliadači. Na inom zariadení začína znovu.",
        },
        {
          lbl: "Pozvánka je na zlý test.",
          text: "Zruš ju, kým ju klient neotvoril, a vystav novú.",
        },
      ],
    },
  ],
  zachazeniTitle: "Ako s vyhodnotením zaobchádzať",
  zachazeni: [
    "Vyhodnotenie je podklad k rozhovoru, nie verdikt. Najsilnejšia časť býva tá, ktorú " +
      "klient nečaká: potlačený archetyp, oblasť, kam sa zbiehajú tri vzorce, alebo rozvojová " +
      "priorita v oblasti, o ktorej si myslel, že ju má vyriešenú. Zhrnutie na konci je " +
      "písané tak, aby sa dalo odovzdať bez zmeny.",
    "Diagnostika neurčuje, čo s človekom je. Ukazuje, kde sa dá zabrať, aby sa pohol ďalej.",
  ],

  prehledTitle: "Prehľad všetkých deviatich diagnostík",
  prehledLede:
    "Register k celému manuálu. Číslo pri teste zodpovedá poradiu, v akom je opísaný vyššie.",
  prehledHlavicka: ["Test", "Rozsah", "Prostredie"],
  prostredi: { sport: "Šport", byznys: "Biznis a život" },

  testy: {
    "elite200-sport": {
      podtitul: "Športová varianta",
      proKoho: "Športovci, hĺbková vstupná diagnostika",
      doba: "45–60 minút",
      kCemuJe:
        "Najpodrobnejšia, čo máme. Siahni po nej, keď spolupráca začína a má trvať mesiace: " +
        "chceš celý obraz a jednu solídnu východiskovú čiaru, ku ktorej sa budeš vracať. " +
        "Vnútri každej zo siedmich oblastí rozlišuje ešte tri užšie témy, takže nepovie len " +
        "„koncentrácia viazne“, ale ukáže, či je problém v rušení zvonka, v návrate " +
        "pozornosti po chybe, alebo v tom, že klient hlavou žije vo výsledku namiesto v procese.",
    },
    "elite200-business": {
      podtitul: "Biznisová a životná varianta",
      proKoho: "Manažéri, podnikatelia, osobný rozvoj",
      doba: "45–60 minút",
      kCemuJe:
        "To isté pre človeka, ktorého ihriskom je porada, rokovanie a rodina. Pýta sa na " +
        "rozhodovanie pod tlakom, na energiu naprieč týždňom, na hranice v práci a na to, " +
        "či sa sebahodnota drží inde než vo výsledkoch štvrťroka.",
    },
    "elite100-sport": {
      podtitul: "Športová varianta",
      proKoho: "Športovci, rýchlejší vstup alebo opakované meranie",
      doba: "20–30 minút",
      kCemuJe:
        "Polovičná dĺžka, rovnakých sedem oblastí. Vhodná, keď klient nemá hodinu, keď " +
        "chceš mať profil rýchlo pred prvým sedením, alebo keď meriaš znovu po nejakom čase " +
        "a zaujíma ťa posun v celých oblastiach. Nerozpadá ich na užšie témy, takže povie, " +
        "kde to viazne, nie už tak presne prečo.",
    },
    "elite100-business": {
      podtitul: "Biznisová a životná varianta",
      proKoho: "Manažéri, podnikatelia, osobný rozvoj",
      doba: "20–30 minút",
      kCemuJe:
        "Kratšia biznisová verzia. Osvedčí sa vo firmách, kde sa diagnostika zadáva viacerým " +
        "ľuďom naraz a dlhší dotazník by časť z nich odradil.",
    },
    vzorce: {
      podtitul: "Všeobecná varianta",
      proKoho: "Manažéri, podnikatelia, osobný život",
      doba: "približne 25 minút",
      kCemuJe:
        "Pýta sa na vzťahy, prácu a na seba samého, bez športového rámca. Nasaď ju, keď " +
        "klient v koučingu opakovane narazí na tú istú stenu: vie, čo má robiť, vie to opísať, " +
        "a aj tak to neurobí. Vzorce ukážu, čo tomu stojí v ceste a prečo to nie je otázka vôle.",
    },
    "vzorce-sport-individual": {
      podtitul: "Športová varianta, individuálne športy",
      proKoho: "Atléti, tenisti, plavci, jazdci, bojové umenia",
      doba: "približne 25 minút",
      kCemuJe:
        "Vlastný dotazník, nie preformulovaná všeobecná verzia. Pýta sa na samotu v príprave, " +
        "na vzťah s trénerom, na to, že za výsledok nikto iný nestojí, a na hlavu v štartovom " +
        "bloku. Vzorec sa u individuálneho športovca prejaví inak než v kabíne a inak než " +
        "v kancelárii, takže aj výklad hovorí o jeho situáciách.",
    },
    "vzorce-sport-tym": {
      podtitul: "Športová varianta, tímové športy",
      proKoho: "Futbal, hokej, basketbal, volejbal a podobné",
      doba: "približne 25 minút",
      kCemuJe:
        "Tiež vlastný dotazník. Točí sa okolo miesta v zostave, šatne, porovnávania so " +
        "spoluhráčmi, zmeny trénera a toho, aké je sedieť na lavičke. Pre hráča, u ktorého " +
        "sa výkon láme podľa toho, ako sa cíti v skupine.",
    },
    archetypy: {
      podtitul: "Biznisová varianta",
      proKoho: "Podnikatelia, manažéri, ľudia budujúci značku",
      doba: "približne 20 minút",
      kCemuJe:
        "Pre prácu s rolou, vedením, komunikáciou a osobnou značkou. Odpovedá na to, prečo " +
        "niekto za človekom ide a iný nie, aký typ vedenia mu sedí a čím odpudzuje, bez toho " +
        "aby to tušil. Dobre sa hodí aj tam, kde sa rieši nástupníctvo alebo skladba vedenia: " +
        "dvaja Vládcovia vedľa seba fungujú inak než Vládca s Opatrovateľom.",
    },
    "archetypy-sport": {
      podtitul: "Športová varianta",
      proKoho: "Športovci, individuálni aj tímoví",
      doba: "približne 20 minút",
      kCemuJe:
        "Vlastný dotazník, nie preložený biznisový. Archetyp je ten istý, ale pýtať sa " +
        "majiteľa firmy a športovca rovnakými slovami nejde. Siahni poň, keď riešiš rolu " +
        "v tíme, vzťah s trénerom, vystupovanie navonok alebo to, prečo hráč nesedí do roly, " +
        "do ktorej ho niekto posadil.",
    },
  },
}

const EN: ManualTexty = {
  title: "Coach handbook",
  lede:
    "Nine diagnostics in three families. For each one: who to send it to, " +
    "what it looks at in a person, and what you will find in its evaluation. " +
    "At the end, the team branch for whole clubs.",
  obsah: "Contents",
  pdf: "Download as PDF",
  tvrzeni: "statements",
  popiskyKaret: { proKoho: "Who it is for", rozsah: "Length", jazyky: "Languages" },
  jazykyHodnota: "Czech, Slovak, English",
  kCemuJe: "What it is for",

  kapitoly: [
    {
      kicker: "Chapter 1",
      title: "How a diagnostic runs",
      standfirst:
        "The process is the same for all nine tests. What differs is what we ask " +
        "the client and what comes out of it.",
    },
    {
      kicker: "Chapter 2",
      title: "Which diagnostic to choose",
      standfirst:
        "The three families answer three different questions. They are not degrees " +
        "of the same thing: the point is not which one goes deeper, but what you are asking.",
    },
    {
      kicker: "Chapter 3 · First family",
      title: "Performance Diagnostic ELITE",
      standfirst:
        "A broad map of performance psychology. It shows what you can build on with " +
        "a client, what holds them back and where the next step lies. Four tests: " +
        "two lengths, two settings.",
    },
    {
      kicker: "Chapter 4 · Second family",
      title: "Emotionally destructive patterns",
      standfirst:
        "Eleven patterns that switch on under pressure, usually beyond will and beyond " +
        "reason. They explain why a client keeps doing the very thing they know is " +
        "hurting them. Three tests, one per setting.",
    },
    {
      kicker: "Chapter 5 · Third family",
      title: "Archetypes",
      standfirst:
        "Twelve personality types in four motivational groups. They do not say how " +
        "strong a person is, but what kind of person they are: what drives them, how " +
        "they come across, and where they turn against themselves under pressure.",
    },
    {
      kicker: "Chapter 6 · Teams and clubs",
      title: "Players Survey",
      standfirst:
        "A branch for whole squads. The player completes the survey and only they " +
        "see their own results; the coach gets a profile of the whole team. It is " +
        "the only place in the application where the respondent sees a result.",
    },
    {
      kicker: "Chapter 7",
      title: "Practical notes",
      standfirst: "Small things worth knowing before you run into them with a client.",
    },
  ],

  postup: [
    {
      lbl: "You issue an invitation.",
      text:
        "In the coach overview you pick the test, the language and the client's form of " +
        "address. The app generates a link that you send to the client. The link leads " +
        "straight into the questionnaire; the client creates no account and signs in nowhere.",
    },
    {
      lbl: "The client fills the questionnaire in.",
      text:
        "Answers are saved on their device as they go, so they can take a break and come " +
        "back later. They can switch language at any point while filling it in.",
    },
    {
      lbl: "The link closes.",
      text:
        "An invitation is single use. Once submitted it stops working, so the same person " +
        "cannot take the same test twice. An unused invitation is valid for 30 days.",
    },
    {
      lbl: "The evaluation appears on your side.",
      text:
        "The client receives no results after submitting and never sees them. They open " +
        "for you alone in the coach overview.",
    },
    {
      lbl: "You deliver the reading.",
      text:
        "You can read the evaluation in the app or download it as a PDF. Every one ends " +
        "with a summary written directly to the client, so you have text at hand that can " +
        "be sent or read out loud in a session.",
    },
  ],
  vysledkyNote:
    "Only the coach sees results. This is not a setting that can be switched. The whole " +
    "product rests on the reading reaching the client through a conversation with you, " +
    "not as a file they open alone on the bus.",
  ch1Bloky: [
    {
      lbl: "Three languages",
      text:
        "Every test and every evaluation exists in Czech, Slovak and English. This is not " +
        "a machine translation of the framing on top of Czech text: the questionnaires are " +
        "written in full for each language, the reading included. You choose the language " +
        "when issuing the invitation and the client can switch it while filling in. You can " +
        "then view and download the evaluation in any of the three, regardless of which one " +
        "the client answered in.",
    },
    {
      lbl: "Form of address",
      text:
        "When issuing an invitation you set whether the client is a man or a woman. Czech " +
        "and Slovak inflect for gender, so the whole evaluation is written accordingly. " +
        "The English version has nothing of the sort to resolve.",
    },
    {
      lbl: "An unfinished questionnaire",
      text:
        "If the client does not submit the questionnaire in full, the evaluation is still " +
        "assembled and carries a note at the top saying how many statements were left " +
        "unanswered. Treat it as material for a conversation, not as a finished picture.",
    },
  ],

  rodinyHlavicka: ["Family", "Answers the question", "When to reach for it"],
  rodiny: [
    {
      nazev: "Performance Diagnostic ELITE",
      otazka: "How does their head work in performance today?",
      kdy:
        "At the start of the work, when you need a broad map and want to know what can " +
        "be built on and what is holding things back.",
    },
    {
      nazev: "Emotionally destructive patterns",
      otazka: "What switches on in them under pressure, and where is it from?",
      kdy:
        "When a client keeps hitting the same wall even though they know exactly what " +
        "they should do. A rational solution does not work there.",
    },
    {
      nazev: "Archetypes",
      otazka: "What kind of person is this and how do they come across?",
      kdy:
        "When you are working on a role in the team, communication, leadership, personal " +
        "brand, or why they do not get on with someone.",
    },
  ],
  volbaTitle: "Quick decisions",
  volba: [
    {
      q: "The client is an athlete.",
      a:
        "Pick the sport variant in all three families. It is not a reworded business " +
        "version: it asks about the dressing room, the coach, the line-up and the race, " +
        "that is, situations the client actually knows.",
    },
    {
      q: "The client is a manager or an entrepreneur, or this is about personal life.",
      a:
        "Pick Business & Life, Brand Archetypes among the archetypes, and the general " +
        "variant among the patterns.",
    },
    {
      q: "An athlete from a team sport.",
      a:
        "Choose Team sport among the patterns. It deals with a place in the line-up, " +
        "the dressing room and measuring yourself against team mates.",
    },
    {
      q: "An athlete from an individual sport.",
      a:
        "Choose Individual sport among the patterns. It deals with solitude in training, " +
        "the relationship with the coach, and the fact that nobody else stands behind the result.",
    },
    {
      q: "Little time, or you want to measure repeatedly.",
      a:
        "Take ELITE 100 instead of ELITE 200. It covers the same seven areas, only without " +
        "the finer breakdown inside them.",
    },
    {
      q: "Long-term work, and you want to do it properly.",
      a:
        "Start with ELITE 200. Add patterns or archetypes afterwards, depending on what " +
        "the profile runs into.",
    },
  ],
  volbaFootnote:
    "The families do not exclude one another and can be combined. The usual pair is ELITE " +
    "as the map and patterns as the explanation of why something on that map keeps refusing " +
    "to move.",

  oblastiTitle: "The seven areas ELITE looks at",
  oblasti: {
    A: "They know who they are and why they do it. Does their worth rest on results, or on something firmer?",
    B: "How they talk to themselves, above all after making a mistake.",
    C: "Do they hold attention where it belongs, and bring it back when they lose it?",
    D: "What pressure does to them and whether they can handle it.",
    E: "How they process setbacks and feedback, and how long they last.",
    F: "Sleep, energy, consistency. Whether they look after themselves or merely endure.",
    G: "Boundaries, the support around them, the safety to say out loud what they think.",
  },
  oblastiFootnote:
    "Sport and Business & Life look at the same seven areas. They differ in the situations " +
    "they ask about and the language they use to read them.",
  eliteEvalTitle: "What is in an ELITE evaluation",
  eliteEvalLede:
    "The same structure across all four tests. ELITE 200 goes deeper inside each area; " +
    "otherwise you are reading the same thing.",
  eliteEval: [
    {
      lbl: "Profile at a glance.",
      text: "All seven areas side by side, so it is clear in one look where the person is at home and where not.",
    },
    {
      lbl: "Anchors of the profile.",
      text: "The strongest things they have. Material to work with, not just praise.",
    },
    {
      lbl: "Development priorities.",
      text: "Where the work is needed most and what happens once you start on it.",
    },
    {
      lbl: "Profile dimensions.",
      text:
        "A reading of each of the seven areas on its own: what it means, how it shows up " +
        "in this client and how to handle it. ELITE 200 adds a breakdown into narrower " +
        "themes inside each area.",
    },
    {
      lbl: "Development recommendations for 8 to 12 weeks.",
      text: "Concrete steps, not general advice. Usable as an outline for the coming sessions.",
    },
    {
      lbl: "Summary for the client.",
      text: "A closing written straight to them. This is the text you can hand over or read out.",
    },
  ],

  vzorceTitle: "The eleven patterns",
  oblastiVzorcuTitle: "The five areas the patterns fall into",
  oblastiVzorcuIntro:
    "Patterns do not stand alone. The evaluation groups them by what went unmet in the " +
    "person, and then speaks about an area instead of three separate items.",
  oblastiVzorcuFootnote:
    "In the sport variants the same areas are named in the language of the dressing room.",
  chybi: "What is missing",
  vzorceEvalTitle: "What is in a patterns evaluation",
  vzorceEvalLede:
    "The same structure across all three variants. What differs is the language of the " +
    "reading and the situations it speaks about.",
  vzorceEval: [
    { lbl: "Profile of all patterns.", text: "Eleven patterns side by side, from strongest to weakest." },
    {
      lbl: "Load on the areas.",
      text:
        "Where it converges. Often easier to read than individual patterns, because it " +
        "shows one need behind three expressions.",
    },
    {
      lbl: "The three strongest patterns with a reading.",
      text: "Three views of each: how it looks from inside, what it does under pressure, and where it came from.",
    },
    {
      lbl: "Situationally activated patterns.",
      text:
        "Patterns that do not stand out in the total, but where the client marked several " +
        "statements very strongly. These are usually exactly the triggers that are worth talking about.",
    },
    {
      lbl: "How it works together.",
      text:
        "What the pair of strongest patterns does in combination. Two patterns side by side " +
        "often behave differently than either one alone.",
    },
    { lbl: "Summary for the client.", text: "A closing written straight to them." },
  ],
  vzorceNote:
    "The result is not a diagnosis or a label. That is how it is put in the instructions " +
    "the client sees before filling in, too. A high pattern does not say something is wrong; " +
    "it says where the person is sensitive and what takes them over under pressure.",

  archetypyTitle: "Twelve archetypes in four groups",
  archetypyHlavicka: ["Motivational group", "Archetypes", "What it is about"],
  archetypyFootnote:
    "In the sport variant the archetypes also carry a nickname from the world of sport.",
  archEvalTitle: "What is in an archetypes evaluation",
  archEvalLede:
    "The same structure in both variants. The sport one adds three parts about the team, " +
    "the coach and how the athlete comes across in public.",
  archEval: [
    {
      lbl: "Profile of all twelve archetypes.",
      text: "The whole field side by side, so it is clear how pronounced the person is.",
    },
    {
      lbl: "Motivational map.",
      text: "The four groups and where the weight falls. Often says more than the single strongest type.",
    },
    {
      lbl: "Primary archetype.",
      text:
        "Who they mainly are. A detailed reading: the essence, how it shows in business or " +
        "in sport, the shadow under pressure, the typical traps and what to do about it.",
    },
    {
      lbl: "Secondary archetype.",
      text: "The second colour that changes the primary type. The same Hero looks different with a Sage behind them than with a Jester.",
    },
    {
      lbl: "Suppressed archetype.",
      text: "What the person dislikes in themselves or will not allow. Usually the most valuable place in the whole evaluation.",
    },
    {
      lbl: "How they play together.",
      text:
        "The interplay of primary, secondary and suppressed. Not three descriptions side " +
        "by side, but one reading of that particular combination.",
    },
    { lbl: "Summary for the client.", text: "A closing written straight to them." },
  ],
  archSportTitle: "What the sport variant adds",
  archSport: [
    {
      lbl: "Role in the team and in individual training.",
      text: "Where this type sits in the line-up and where it will wear them down.",
    },
    { lbl: "Where it grates with the coach.", text: "Predictable points of friction and how to work around them." },
    {
      lbl: "Personal brand and public communication.",
      text: "How to appear in public so that it fits who the person actually is.",
    },
  ],
  archNote:
    "An archetype is not a grade. None of the twelve is better. The evaluation therefore " +
    "does not say which one to have, but what to do with the one the client has, and what " +
    "the missing one is costing them.",

  tymBloky: [
    {
      lbl: "What it is",
      text:
        "Players Survey is Performance Diagnostic ELITE 200, sport variant, under " +
        "a different name. The word diagnostic is never used towards a player or " +
        "a club coach; we speak of a survey and of a team profile.",
    },
    {
      lbl: "Who creates the team",
      text:
        "The master creates the team and assigns it to a particular external coach. " +
        "That coach then issues player links within their own team, and nothing " +
        "else. Other tests stay out of reach until the master grants full access.",
    },
    {
      lbl: "Labels instead of names",
      text:
        "The coach chooses how players are labelled. It can be a name, it can be " +
        "Player 1. Before submitting, a player may keep the label or write their " +
        "own name instead. Either way we do not need to know who is behind it.",
    },
    {
      lbl: "The player's choice",
      text:
        "Before submitting, the player chooses whether to share their results with " +
        "the coach. If they decline, the coach sees only that the survey is in. " +
        "The answers count towards the team profile and the norms either way, " +
        "anonymously.",
    },
    {
      lbl: "What the player gets",
      text:
        "Their own results immediately after submitting, downloadable as a PDF. " +
        "It is the only place in the application where a respondent sees their " +
        "own result.",
    },
    {
      lbl: "What the coach gets",
      text:
        "A six to eight page team profile: a summary, the seven areas with " +
        "interpretation, structural findings, a twelve-week plan, questions for " +
        "individual conversations and boundaries of use. No individual players.",
    },
    {
      lbl: "Languages",
      text: "Czech and English only. Slovak is not offered in this branch.",
    },
    {
      lbl: "Small squads",
      text:
        "Below five completed surveys the profile comes close to an individual " +
        "profile and can be read back to particular players. The report says so " +
        "to the coach and explains how to handle it.",
    },
  ],
  tymRoleTitle: "Who sees what",
  tymRole: [
    { lbl: "Player", text: "Their own results, always. Nothing else." },
    {
      lbl: "Club coach",
      text: "Their own team's profile and the results players chose to share. No other teams.",
    },
    { lbl: "Our internal coach", text: "Nothing from the team branch." },
    {
      lbl: "Master",
      text: "The team name and its profile. No individual results, not even shared ones.",
    },
  ],
  tymNote:
    "The club coach does not see this handbook and does not need it. Their " +
    "interface is narrowed to one thing: issue a player link and read the team " +
    "profile.",

  praktickeBloky: [
    {
      title: "Before you send the invitation",
      polozky: [
        {
          lbl: "Check the variant.",
          text:
            "Sport or business, and for the patterns individual or team on top of that. " +
            "The wrong variant only shows up in the answers, and the link cannot be used twice.",
        },
        {
          lbl: "Check the language and the form of address.",
          text: "The client can switch the language; the form of address they cannot. That one is yours to set.",
        },
        {
          lbl: "Tell the client how long it takes.",
          text: "ELITE 200 is close to an hour. Anyone who does not sit down for it properly will rush it.",
        },
      ],
    },
    {
      title: "What to tell the client beforehand",
      polozky: [
        {
          lbl: "",
          text: "To answer quickly and by what actually happens in them, not by the person they would like to be.",
        },
        {
          lbl: "",
          text:
            "Not to fill it in after an argument or an hour after a match. We want how it " +
            "usually is, not how they feel right now.",
        },
        {
          lbl: "",
          text:
            "That you will see the results and go through them together. The client does not " +
            "get them after submitting, and it is better they know that in advance than sit waiting.",
        },
      ],
    },
    {
      title: "When something goes wrong",
      polozky: [
        {
          lbl: "The link does not work.",
          text:
            "Either it has been used, or it has expired, or it was revoked. The client sees " +
            "a message in their own language. Issue a new invitation.",
        },
        {
          lbl: "The client started the questionnaire and did not finish.",
          text:
            "Their part-written answers are stored on their device, so they can carry on at " +
            "the same link in the same browser. On another device they start over.",
        },
        {
          lbl: "The invitation is for the wrong test.",
          text: "Revoke it before the client opens it and issue a new one.",
        },
      ],
    },
  ],
  zachazeniTitle: "How to handle an evaluation",
  zachazeni: [
    "An evaluation is material for a conversation, not a verdict. The strongest part is " +
      "usually the one the client does not expect: the suppressed archetype, the area where " +
      "three patterns converge, or a development priority in an area they thought they had " +
      "sorted. The closing summary is written so that it can be handed over unchanged.",
    "A diagnostic does not determine what is wrong with a person. It shows where to push " +
      "so that they move on.",
  ],

  prehledTitle: "All nine diagnostics at a glance",
  prehledLede:
    "An index to the whole handbook. The number beside a test matches the order in which " +
    "it is described above.",
  prehledHlavicka: ["Test", "Length", "Setting"],
  prostredi: { sport: "Sport", byznys: "Business and life" },

  testy: {
    "elite200-sport": {
      podtitul: "Sport variant",
      proKoho: "Athletes, in-depth entry diagnostic",
      doba: "45–60 minutes",
      kCemuJe:
        "The most detailed thing we have. Reach for it when the work is beginning and is " +
        "meant to last months: you want the whole picture and one solid baseline to come " +
        "back to. Inside each of the seven areas it distinguishes three narrower themes, so " +
        "it does not merely say “concentration is slipping” but shows whether the trouble is " +
        "outside distraction, getting attention back after a mistake, or the client living " +
        "in the result instead of the process.",
    },
    "elite200-business": {
      podtitul: "Business and life variant",
      proKoho: "Managers, entrepreneurs, personal development",
      doba: "45–60 minutes",
      kCemuJe:
        "The same for someone whose playing field is the meeting, the negotiation and the " +
        "family. It asks about decisions under pressure, energy across the week, boundaries " +
        "at work, and whether self-worth holds anywhere other than in the quarter's results.",
    },
    "elite100-sport": {
      podtitul: "Sport variant",
      proKoho: "Athletes, a faster entry or a repeat measurement",
      doba: "20–30 minutes",
      kCemuJe:
        "Half the length, the same seven areas. Suitable when the client does not have an " +
        "hour, when you want a profile quickly before the first session, or when you are " +
        "measuring again after some time and care about movement across whole areas. It does " +
        "not break them into narrower themes, so it says where things are stuck, not quite so " +
        "precisely why.",
    },
    "elite100-business": {
      podtitul: "Business and life variant",
      proKoho: "Managers, entrepreneurs, personal development",
      doba: "20–30 minutes",
      kCemuJe:
        "The shorter business version. It proves itself in companies where the diagnostic " +
        "goes out to several people at once and a longer questionnaire would put some of them off.",
    },
    vzorce: {
      podtitul: "General variant",
      proKoho: "Managers, entrepreneurs, personal life",
      doba: "roughly 25 minutes",
      kCemuJe:
        "It asks about relationships, work and the self, without a sporting frame. Bring it " +
        "in when a client keeps hitting the same wall in coaching: they know what to do, they " +
        "can describe it, and still they do not do it. The patterns show what stands in the " +
        "way and why it is not a question of will.",
    },
    "vzorce-sport-individual": {
      podtitul: "Sport variant, individual sports",
      proKoho: "Athletics, tennis, swimming, riding, martial arts",
      doba: "roughly 25 minutes",
      kCemuJe:
        "Its own questionnaire, not a reworded general version. It asks about solitude in " +
        "training, the relationship with the coach, the fact that nobody else stands behind " +
        "the result, and the head in the starting blocks. A pattern shows up differently in " +
        "an individual athlete than in a dressing room and differently again than in an " +
        "office, so the reading speaks about their situations too.",
    },
    "vzorce-sport-tym": {
      podtitul: "Sport variant, team sports",
      proKoho: "Football, ice hockey, basketball, volleyball and the like",
      doba: "roughly 25 minutes",
      kCemuJe:
        "Also its own questionnaire. It turns around a place in the line-up, the dressing " +
        "room, measuring yourself against team mates, a change of coach, and what it is like " +
        "to sit on the bench. For a player whose performance breaks according to how they " +
        "feel in the group.",
    },
    archetypy: {
      podtitul: "Business variant",
      proKoho: "Entrepreneurs, managers, people building a brand",
      doba: "roughly 20 minutes",
      kCemuJe:
        "For work on role, leadership, communication and personal brand. It answers why one " +
        "person follows them and another does not, what kind of leadership fits them, and what " +
        "repels people without their having any idea. It also serves well where succession or " +
        "the make-up of a leadership team is at stake: two Rulers side by side work differently " +
        "than a Ruler with a Caregiver.",
    },
    "archetypy-sport": {
      podtitul: "Sport variant",
      proKoho: "Athletes, individual and team alike",
      doba: "roughly 20 minutes",
      kCemuJe:
        "Its own questionnaire, not a translated business one. The archetype is the same, but " +
        "asking a company owner and an athlete in the same words does not work. Reach for it " +
        "when you are working on a role in the team, the relationship with the coach, public " +
        "presence, or why a player does not fit the role somebody put them in.",
    },
  },
}

export const MANUAL: Record<Lang, ManualTexty> = { cs: CS, sk: SK, en: EN }
