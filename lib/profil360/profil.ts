import { KONTROLNI, PARY, SKALY } from "./klic"
import { SPANEK } from "./spolecne"

// Profil 360: výpočet sportovního profilu z veřejných dotazníků.
//
// ZDROJE (všechny volné i pro komerční použití)
//   IPIP-NEO-120   osobnost, 5 oblastí a 29 fazet (liberalismus vynechán)
//   IPIP-VIA-R     24 silných stránek charakteru
//   IPIP BIS/BAS   co člověka brzdí (obava) a co ho pohání (tah na cíl)
//   DASS-21        jen škála stresu za poslední týden
//   MCTQ (metoda)  chronotyp a sociální jetlag z časů spánku
//
// CO JE NAŠE A CO PŘEVZATÉ
//   Škály a jejich skórování jsou převzaté. Sportovní oblasti, typ
//   sportovce, rizika a doporučení jsou naše interpretace: skládají se
//   z převzatých škál podle toho, co o nich říká výzkum, ale jako celek
//   nejsou ověřené. Tak se to má i číst a tak to říká report.
//
// NORMY
//   České normy zatím nejsou. Skóre 0 až 100 je průměr odpovědí převedený
//   na stupnici (1 = 0, 5 = 100), ne percentil. Pásma jsou proto hrubá
//   a report u nich nepíše „nadprůměrný“, jen „vysoko“ a „nízko“.
//
// Tenhle soubor sahá do klíče, takže ho stránka s dotazníkem nesmí
// importovat (scripts/audit-balicku.cjs). Počítá se u kouče.

export type Odpovedi = Record<string, number>

// ---------------------------------------------------------------------------
// Názvy
// ---------------------------------------------------------------------------

export const OBLASTI_OSOBNOSTI: { kod: "N" | "E" | "O" | "A" | "C"; nazev: string; popis: string }[] = [
  { kod: "N", nazev: "Emoční citlivost", popis: "jak snadno přicházejí obavy, vztek a sklíčenost" },
  { kod: "E", nazev: "Extraverze", popis: "energie z lidí, průbojnost a chuť do akce" },
  { kod: "O", nazev: "Otevřenost", popis: "zvídavost, představivost a chuť zkoušet nové" },
  { kod: "A", nazev: "Přívětivost", popis: "důvěra, férovost a ohled na druhé" },
  { kod: "C", nazev: "Svědomitost", popis: "disciplína, pracovitost a rozvaha" },
]

export const FAZETY: Record<string, string> = {
  N1: "úzkostnost",
  N2: "vznětlivost",
  N3: "sklíčenost",
  N4: "rozpačitost mezi lidmi",
  N5: "nestřídmost",
  N6: "zranitelnost vůči stresu",
  E1: "přátelskost",
  E2: "společenskost",
  E3: "průbojnost",
  E4: "aktivita",
  E5: "vyhledávání vzrušení",
  E6: "veselost",
  O1: "představivost",
  O2: "smysl pro umění",
  O3: "citovost",
  O4: "dobrodružnost",
  O5: "intelektuální zvídavost",
  A1: "důvěra",
  A2: "poctivost vůči druhým",
  A3: "ochota pomáhat",
  A4: "vstřícnost v konfliktu",
  A5: "skromnost",
  A6: "soucit",
  C1: "víra ve vlastní schopnosti",
  C2: "pořádnost",
  C3: "plnění povinností",
  C4: "cílevědomost",
  C5: "sebekázeň",
  C6: "rozvážnost",
}

export const SILNE_STRANKY: Record<string, string> = {
  "V.appreciation-of-beauty": "smysl pro krásu a mistrovství",
  "V.capacity-for-love": "blízké vztahy",
  "V.citizenship-teamwork": "týmovost",
  "V.curiosity": "zvídavost",
  "V.equity-fairness": "férovost",
  "V.forgiveness-mercy": "schopnost odpouštět",
  "V.gratitude": "vděčnost",
  "V.hope-optimism": "naděje a optimismus",
  "V.humor-playfulness": "humor",
  "V.perseverance": "vytrvalost",
  "V.integrity": "poctivost",
  "V.judgment": "úsudek",
  "V.kindness": "laskavost",
  "V.leadership": "vůdcovství",
  "V.love-of-learning": "radost z učení",
  "V.modesty-humility": "skromnost",
  "V.creativity": "tvořivost",
  "V.perspective": "nadhled",
  "V.prudence": "opatrnost",
  "V.self-regulation": "sebeovládání",
  "V.social-intelligence": "sociální inteligence",
  "V.spirituality": "smysl a spiritualita",
  "V.valor": "odvaha",
  "V.zest": "elán",
}

export const MOTIVACE: Record<string, { nazev: string; popis: string }> = {
  "bis-anxiety": { nazev: "Brzda: obava", popis: "citlivost na hrozbu, kritiku a možnou chybu" },
  "bas-drive": { nazev: "Pohon: tah na cíl", popis: "chuť vyhrávat, vést a mít navrch" },
  "bas-fun-seeking": { nazev: "Pohon: hledání zážitků", popis: "spontánnost a chuť do nového a riskantního" },
  "bas-reward-responsiveness": { nazev: "Pohon: radost z odměny", popis: "jak silně člověka nabije úspěch a oslava" },
}

// ---------------------------------------------------------------------------
// Sportovní oblasti: naše interpretace složená z převzatých škál
// ---------------------------------------------------------------------------

export type OblastId =
  | "tlak"
  | "navrat"
  | "prace"
  | "hlad"
  | "ovladani"
  | "tym"
  | "vudce"
  | "ucenlivost"
  | "energie"

interface OblastDef {
  id: OblastId
  nazev: string
  popis: string
  /** kód škály a směr: +1 roste s oblastí, −1 proti ní */
  slozky: [string, 1 | -1][]
  /** co říct, když je oblast silná */
  silna: string
  /** co dělat, když je oblast slabší (pro kouče) */
  rozvoj: string[]
  /** první krok ve druhé osobě, do shrnutí pro sportovce */
  rozvojSportovci: string
}

export const OBLASTI: OblastDef[] = [
  {
    id: "tlak",
    nazev: "Výkon pod tlakem",
    popis: "jak málo {ho|ji} brzdí obavy a stres, když jde o hodně, a jak moc si věří",
    slozky: [["N1", -1], ["N6", -1], ["N4", -1], ["bis-anxiety", -1], ["C1", 1], ["V.valor", 1]],
    silna: "V rozhodujících chvílích se o {něj|ni} dá opřít. Dej {mu|jí} odpovědnost v závěrech a zátěžové situace do tréninku, ať je nezažívá jen v zápase.",
    rozvojSportovci: "Zařaď do tréninku situace s tlakem a vytvoř si krátkou rutinu před startem: nádech, klíčové slovo, první úkol.",
    rozvoj: [
      "Trénuj pod tlakem: body, trest, publikum, časový limit. Tlak se má v tréninku objevovat pravidelně, ne poprvé v zápase.",
      "Předstartovní rutina (dech, klíčové slovo, první úkol) {mu|jí} dá něco, na co se soustředit místo obav.",
      "Po zápase rozebírej, co pod tlakem {udělal|udělala} dobře, ne jen chyby. Sebedůvěra roste z důkazů.",
    ],
  },
  {
    id: "navrat",
    nazev: "Návrat po nezdaru",
    popis: "jak rychle se zvedne po chybě, prohře a horším období",
    slozky: [["N3", -1], ["N2", -1], ["V.hope-optimism", 1], ["V.perseverance", 1], ["DASS.stress", -1]],
    silna: "Chyba {ho|ji} nerozhodí na dlouho. Dá se na {něm|ní} stavět v sériích a při otočkách zápasu.",
    rozvojSportovci: "Domluv se s trenérem na krátkém restartu po chybě (nádech, gesto, další úkol) a trénuj ho jako techniku.",
    rozvoj: [
      "Naučte se spolu krátký restart po chybě (nádech, gesto, další úkol) a trénujte ho stejně jako techniku.",
      "Po prohře nech 24 hodin na emoce a teprve pak dělej rozbor; hned po zápase nálada převáží fakta.",
      "Hledejte spolu, co je pod {jeho|její} kontrolou. Pocit, že něco jde ovlivnit, je nejrychlejší cesta zpět.",
    ],
  },
  {
    id: "prace",
    nazev: "Pracovní morálka",
    popis: "disciplína, vytrvalost a to, jestli dotahuje, co začne",
    slozky: [["C4", 1], ["C5", 1], ["V.perseverance", 1], ["V.self-regulation", 1], ["C3", 1]],
    silna: "Na tréninku pracuje, i když se nikdo nedívá. Hlídej spíš přetížení než lenost.",
    rozvojSportovci: "Rozlož svůj cíl na krátké týdenní úkoly a odškrtávej si je; pokrok, který vidíš, drží motivaci.",
    rozvoj: [
      "Rozlož velký cíl na krátké, měřitelné úkoly s termínem. Vidět pokrok týden po týdnu drží motivaci líp než vzdálený cíl.",
      "Domluvte pevný rámec (čas, místo, plán) a málo výjimek. Sebekázeň je snazší, když se nemusí pořád rozhodovat.",
      "Chval úsilí a vytrvalost, nejen výsledek.",
    ],
  },
  {
    id: "hlad",
    nazev: "Hlad po úspěchu",
    popis: "chuť vyhrávat, mít navrch a jít si za výsledkem",
    slozky: [["bas-drive", 1], ["E3", 1], ["C4", 1], ["E4", 1]],
    silna: "Soutěživost {ho|ji} žene. Dej {mu|jí} jasné soupeře a měřitelné výzvy; nuda je pro {něj|ni} větší riziko než tlak.",
    rozvojSportovci: "Ujasni si, o co ti ve sportu opravdu jde, a dej si měřitelnou výzvu na nejbližší měsíc.",
    rozvoj: [
      "Najděte spolu, o co {mu|jí} ve sportu opravdu jde. Bez osobního důvodu se soutěživost nerozhoří.",
      "Soutěžní formy v tréninku (skóre, žebříčky, souboje) probouzejí chuť vyhrát i u klidnějších povah.",
    ],
  },
  {
    id: "ovladani",
    nazev: "Sebeovládání",
    popis: "rozvaha, kontrola impulzů a vzteku, odolání pokušení",
    slozky: [["C6", 1], ["V.self-regulation", 1], ["N5", -1], ["N2", -1], ["V.prudence", 1]],
    silna: "Drží se plánu a neudělá zbytečnou hloupost. Hodí se do rolí, kde rozhoduje disciplína a přesnost.",
    rozvojSportovci: "Domluv si s trenérem signál na zastavení, když se blíží výbuch nebo ukvapené rozhodnutí.",
    rozvoj: [
      "Domluvte signál na zastavení (slovo, gesto), když se blíží výbuch nebo ukvapené rozhodnutí.",
      "Mimo hřiště pomáhají jasná pravidla k jídlu, spánku a alkoholu, dohodnutá předem, ne v okamžiku pokušení.",
      "Rozbírejte konkrétní situace, kde {jednal|jednala} zbrkle: co předcházelo a co udělá příště jinak.",
    ],
  },
  {
    id: "tym",
    nazev: "Týmovost",
    popis: "loajalita, spolupráce, důvěra a férovost k ostatním",
    slozky: [["V.citizenship-teamwork", 1], ["A4", 1], ["A1", 1], ["E1", 1], ["V.equity-fairness", 1], ["V.kindness", 1]],
    silna: "Drží partu pohromadě. Může být mostem mezi trenérem a týmem i oporou pro nováčky.",
    rozvojSportovci: "Vezmi si v týmu konkrétní úkol, na kterém závisí ostatní, a všímej si, co dělají dobře.",
    rozvoj: [
      "Dej {mu|jí} v týmu konkrétní roli, která závisí na ostatních (spoluzodpovědnost za rozcvičení, dvojice na tréninku).",
      "Oceňuj veřejně asistence a pomoc druhým, nejen vlastní body.",
      "Individuální sportovec: jde o vztahy s realizačním týmem a tréninkovou skupinou; stejné principy platí.",
    ],
  },
  {
    id: "vudce",
    nazev: "Vůdcovství",
    popis: "ochota vést, ozvat se a strhnout ostatní",
    slozky: [["V.leadership", 1], ["E3", 1], ["V.valor", 1], ["V.social-intelligence", 1], ["C1", 1]],
    silna: "Přirozeně bere vedení. Dej {mu|jí} prostor, ale i zpětnou vazbu, jak vede; vůdce se také učí.",
    rozvojSportovci: "Zkus vést malé věci: rozcvičení, krátký pokyn, slovo v kabině. Vedení se dá trénovat.",
    rozvoj: [
      "Vedení se dá trénovat po malých krocích: vést rozcvičení, promluvit v kabině, předat pokyn.",
      "Ne každý musí být kapitán. Tichý příklad výkonem je také vedení a má se tak ocenit.",
    ],
  },
  {
    id: "ucenlivost",
    nazev: "Učenlivost",
    popis: "zvídavost, otevřenost novému a chuť se zlepšovat",
    slozky: [["V.love-of-learning", 1], ["O5", 1], ["V.curiosity", 1], ["O4", 1], ["A5", 1], ["V.judgment", 1]],
    silna: "Učí se {rád|ráda} a nové věci přijímá rychle. Vysvětluj proč, nejen co; ocení to.",
    rozvojSportovci: "Vyber si jednu věc, kterou se chceš naučit, a zeptej se trenéra, proč a jak na ni.",
    rozvoj: [
      "Novinky zaváděj po malých dávkách a s jasným důvodem. Odpor ke změně klesá, když je vidět smysl.",
      "Nech na {něm|ní}, ať {sám|sama} navrhne, co chce zlepšit; vlastní cíl se přijímá snáz než cizí.",
    ],
  },
  {
    id: "energie",
    nazev: "Energie a radost",
    popis: "elán, dobrá nálada a zátěž, kterou teď nese",
    slozky: [["V.zest", 1], ["E6", 1], ["E4", 1], ["V.humor-playfulness", 1], ["DASS.stress", -1]],
    silna: "Nabíjí sebe i okolí. Pozor jen, aby si {nepřibíral|nepřibírala} víc, než unese.",
    rozvojSportovci: "Zkontroluj spánek a zátěž mimo sport; nízká energie bývá signál přetížení, ne lenosti.",
    rozvoj: [
      "Zkontrolujte spánek, zotavení a zátěž mimo sport (škola, práce, vztahy). Nízká energie bývá signál přetížení, ne lenosti.",
      "Vraťte do tréninku hravost a radost; hra a soutěž s humorem obnovují chuť rychleji než další objem.",
    ],
  },
]

// ---------------------------------------------------------------------------
// Typy sportovců: pojmenování nejsilnější kombinace oblastí
// ---------------------------------------------------------------------------

interface TypDef {
  id: string
  nazev: string
  oblasti: OblastId[]
  popis: string
  potrebuje: string
  pozor: string
}

export const TYPY: TypDef[] = [
  {
    id: "finiser",
    nazev: "Chladnokrevný finišer",
    oblasti: ["tlak", "ovladani", "navrat"],
    popis: "Nejlépe funguje, když jde o hodně. Drží hlavu v klidu a chybu rychle pustí.",
    potrebuje: "Odpovědnost v rozhodujících chvílích a důvěru, že ji dostane i po chybě.",
    pozor: "Klid navenek neznamená, že nic neprožívá. Ptej se, jak se má.",
  },
  {
    id: "dric",
    nazev: "Dříč",
    oblasti: ["prace", "navrat", "ovladani"],
    popis: "Výkon staví na poctivé práci a vytrvalosti. Dotahuje, co začne.",
    potrebuje: "Jasný plán, měřitelný pokrok a uznání za úsilí.",
    pozor: "Sklon přetrénovat a nepřiznat únavu. Hlídej zotavení.",
  },
  {
    id: "lidr",
    nazev: "Lídr",
    oblasti: ["vudce", "hlad", "tlak"],
    popis: "Bere vedení, strhne ostatní a nebojí se odpovědnosti.",
    potrebuje: "Prostor vést a partnera v trenérovi, ne jen nadřízeného.",
    pozor: "Dominance může přehlušit ostatní. Dávej zpětnou vazbu i k tomu, jak vede.",
  },
  {
    id: "tmel",
    nazev: "Týmový tmel",
    oblasti: ["tym", "energie", "navrat"],
    popis: "Drží partu pohromadě, dodává energii a pomáhá druhým.",
    potrebuje: "Dobré vztahy v týmu a pocit, že {jeho|její} přínos je vidět.",
    pozor: "Může upozadit vlastní výkon a potřeby. Ptej se i na {jeho|její} cíle.",
  },
  {
    id: "bojovnik",
    nazev: "Bojovník",
    oblasti: ["hlad", "energie", "prace"],
    popis: "{Soutěživý|Soutěživá}, {energický|energická}, chce vyhrávat a jde do toho naplno.",
    potrebuje: "Výzvy, soupeře a měřitelné cíle; nudu snáší hůř než tlak.",
    pozor: "Vztek a zbrklost po neúspěchu. Pracujte na restartu po chybě.",
  },
  {
    id: "strateg",
    nazev: "Stratég",
    oblasti: ["ucenlivost", "ovladani", "prace"],
    popis: "Přemýšlí, učí se a hledá lepší řešení. Rozhoduje s rozvahou.",
    potrebuje: "Vysvětlení proč, prostor pro otázky a zapojení do plánování.",
    pozor: "Přemýšlení v akci může zdržet rozhodnutí. Trénujte i rychlé volby.",
  },
]

// ---------------------------------------------------------------------------
// Výpočet
// ---------------------------------------------------------------------------

export interface Skore {
  kod: string
  /** 0–100; null, když je zodpovězeno málo položek */
  hodnota: number | null
  zodpovezeno: number
  celkem: number
}

export type Pasmo = "priority" | "stabilization" | "strong" | "elite"

export const PASMO_SLOVO: Record<Pasmo, string> = {
  priority: "nízko",
  stabilization: "středně",
  strong: "vysoko",
  elite: "velmi vysoko",
}

export function pasmo(x: number): Pasmo {
  if (x < 40) return "priority"
  if (x < 60) return "stabilization"
  if (x < 80) return "strong"
  return "elite"
}

const DASS_KOD = "DASS.stress"

function skoreSkaly(kod: string, polozky: number[], obracene: number[], odp: Odpovedi): Skore {
  const hodnoty: number[] = []
  for (const id of polozky) {
    const x = odp[String(id)]
    if (typeof x !== "number") continue
    hodnoty.push(obracene.includes(id) ? 6 - x : x)
  }
  const celkem = polozky.length
  if (hodnoty.length / celkem < 0.75) return { kod, hodnota: null, zodpovezeno: hodnoty.length, celkem }
  const prumer = hodnoty.reduce((a, b) => a + b, 0) / hodnoty.length
  if (kod === DASS_KOD) {
    // DASS: 0 až 3 na položku; 0–100 z průměru.
    return { kod, hodnota: Math.round((prumer / 3) * 100), zodpovezeno: hodnoty.length, celkem }
  }
  return { kod, hodnota: Math.round(((prumer - 1) / 4) * 100), zodpovezeno: hodnoty.length, celkem }
}

export type StresPasmo = "bezna" | "mirne" | "zvysena" | "vysoka"

export const STRES_SLOVO: Record<StresPasmo, string> = {
  bezna: "běžná",
  mirne: "mírně zvýšená",
  zvysena: "zvýšená",
  vysoka: "vysoká",
}

/** Pásma DASS-21 pro stres (součet × 2): 0–14, 15–18, 19–25, 26+. */
function stresPasmo(odp: Odpovedi): { pasmo: StresPasmo; body: number } | null {
  const s = SKALY.find((x) => x.kod === DASS_KOD)!
  const hodnoty = s.polozky.map((id) => odp[String(id)]).filter((x): x is number => typeof x === "number")
  if (hodnoty.length < 6) return null
  const soucet = (hodnoty.reduce((a, b) => a + b, 0) * s.polozky.length) / hodnoty.length
  const body = Math.round(soucet * 2)
  const p: StresPasmo = body <= 14 ? "bezna" : body <= 18 ? "mirne" : body <= 25 ? "zvysena" : "vysoka"
  return { pasmo: p, body }
}

// ---------- chronotyp ----------

export interface Chronotyp {
  /** střed spánku ve volné dny, opravený o dospávání (hodiny 0–24) */
  stredVolno: number
  stredPrace: number
  /** rozdíl středů spánku v hodinách */
  socialniJetlag: number
  spankuPrace: number
  spankuVolno: number
  typ: "ranni-vyrazny" | "ranni" | "stredni" | "vecerni" | "vecerni-vyrazny"
  /** volné dny s budíkem: střed spánku se nedá opravit, typ je orientační */
  budik: boolean
}

export const CHRONOTYP_SLOVO: Record<Chronotyp["typ"], string> = {
  "ranni-vyrazny": "výrazný skřivan",
  ranni: "spíš skřivan",
  stredni: "střední typ",
  vecerni: "spíš sova",
  "vecerni-vyrazny": "výrazná sova",
}

/** Rozdíl časů v hodinách přes půlnoc: vždy −12 až +12. */
const rozdil = (a: number, b: number) => ((((a - b + 12) % 24) + 24) % 24) - 12
const hod = (min: number) => min / 60
const normuj = (h: number) => ((h % 24) + 24) % 24

function chronotyp(odp: Odpovedi): Chronotyp | null {
  const [u1, v1, u2, v2] = SPANEK.casy.map((id) => odp[String(id)])
  if ([u1, v1, u2, v2].some((x) => typeof x !== "number")) return null
  const spankuPrace = normuj(hod(v1) - hod(u1))
  const spankuVolno = normuj(hod(v2) - hod(u2))
  const stredPrace = normuj(hod(u1) + spankuPrace / 2)
  const stredVolnoSurovy = normuj(hod(u2) + spankuVolno / 2)
  // Oprava o dospávání (Roenneberg): když se ve volnu spí déle než v průměru
  // týdne, posune se střed o polovinu přebytku zpět.
  const tyden = (5 * spankuPrace + 2 * spankuVolno) / 7
  const stredVolno = spankuVolno > spankuPrace ? normuj(stredVolnoSurovy - (spankuVolno - tyden) / 2) : stredVolnoSurovy
  const socialniJetlag = Math.abs(rozdil(stredVolnoSurovy, stredPrace))
  // Hranice jsou orientační, v hodinách po půlnoci; střed kolem 2 až 7.
  const s = rozdil(stredVolno, 0)
  const typ: Chronotyp["typ"] =
    s < 2.5 ? "ranni-vyrazny" : s < 3.5 ? "ranni" : s < 5 ? "stredni" : s < 6 ? "vecerni" : "vecerni-vyrazny"
  return {
    stredVolno,
    stredPrace,
    socialniJetlag: Math.round(socialniJetlag * 10) / 10,
    spankuPrace: Math.round(spankuPrace * 10) / 10,
    spankuVolno: Math.round(spankuVolno * 10) / 10,
    typ,
    budik: odp[String(SPANEK.budik)] === 1,
  }
}

// ---------- spolehlivost vyplnění ----------

export type Stav = "ok" | "pozor" | "neplatne"

export interface Spolehlivost {
  celkem: Stav
  pozornost: { chyb: number; z: number }
  nepravdepodobne: { signalu: number; z: number }
  konzistence: { prumer: number | null; stav: Stav }
  souhlasnost: { prumer: number | null; stav: Stav }
  nejdelsiRada: number
  tempo: { sekundNaOtazku: number | null; stav: Stav }
  poznamky: string[]
}

function spolehlivost(odp: Odpovedi, durationSec: number | undefined, poradi: number[]): Spolehlivost {
  const poznamky: string[] = []
  const instr = KONTROLNI.filter((k) => k.druh === "instruovana")
  const nepr = KONTROLNI.filter((k) => k.druh === "nepravdepodobna")
  const chyb = instr.filter((k) => !k.ocekavano.includes(odp[String(k.id)])).length
  const signalu = nepr.filter((k) => typeof odp[String(k.id)] === "number" && !k.ocekavano.includes(odp[String(k.id)])).length

  const rozdily = PARY.map(([a, b]) => {
    const x = odp[String(a)]
    const y = odp[String(b)]
    return typeof x === "number" && typeof y === "number" ? Math.abs(x - (6 - y)) : null
  }).filter((x): x is number => x !== null)
  const konzPrumer = rozdily.length >= 5 ? rozdily.reduce((a, b) => a + b, 0) / rozdily.length : null
  const konzStav: Stav = konzPrumer === null ? "ok" : konzPrumer > 2.2 ? "neplatne" : konzPrumer > 1.5 ? "pozor" : "ok"

  // Souhlasnost: VIA-R má v každé škále dvě kladné a dvě záporné položky.
  // Průměr surových odpovědí na všech VIA položkách by měl být kolem 3; kdo
  // souhlasí se vším, má ho vysoko bez ohledu na obsah.
  const via = SKALY.filter((s) => s.kod.startsWith("V."))
  const surove = via.flatMap((s) => s.polozky.map((id) => odp[String(id)])).filter((x): x is number => typeof x === "number")
  const souhlasnost = surove.length > 40 ? surove.reduce((a, b) => a + b, 0) / surove.length : null
  const souhlStav: Stav = souhlasnost === null ? "ok" : souhlasnost > 3.9 || souhlasnost < 2.1 ? "pozor" : "ok"

  let nejdelsi = 0
  let beh = 0
  let posledni: number | undefined
  for (const id of poradi) {
    const x = odp[String(id)]
    if (typeof x !== "number") {
      beh = 0
      posledni = undefined
      continue
    }
    beh = x === posledni ? beh + 1 : 1
    posledni = x
    nejdelsi = Math.max(nejdelsi, beh)
  }

  const zodpovezeno = Object.keys(odp).length
  const sekund = durationSec && zodpovezeno > 0 ? durationSec / zodpovezeno : null
  const tempoStav: Stav = sekund === null ? "ok" : sekund < 2 ? "neplatne" : sekund < 3 ? "pozor" : "ok"

  const stavPozornost: Stav = chyb >= 2 ? "neplatne" : chyb === 1 ? "pozor" : "ok"
  const stavNepr: Stav = signalu >= 2 ? "neplatne" : signalu === 1 ? "pozor" : "ok"
  const stavRada: Stav = nejdelsi >= 35 ? "neplatne" : nejdelsi >= 20 ? "pozor" : "ok"

  if (stavPozornost !== "ok") poznamky.push(`Kontrolní otázky se zadaným pokynem: ${chyb} z ${instr.length} chybně.`)
  if (stavNepr !== "ok") poznamky.push(`Nepravděpodobná tvrzení označená jako pravdivá: ${signalu} z ${nepr.length}.`)
  if (konzStav !== "ok") poznamky.push("Odpovědi na dvojice opačných tvrzení si protiřečí víc, než je obvyklé.")
  if (souhlStav !== "ok") poznamky.push("Odpovědi se drží jednoho konce stupnice bez ohledu na obsah otázky.")
  if (stavRada !== "ok") poznamky.push(`Stejná odpověď ${nejdelsi}krát za sebou.`)
  if (tempoStav !== "ok") poznamky.push("Vyplnění bylo tak rychlé, že otázky nejspíš nešlo číst.")

  const stavy = [stavPozornost, stavNepr, konzStav, stavRada, tempoStav]
  const celkem: Stav = stavy.includes("neplatne")
    ? "neplatne"
    : stavy.includes("pozor") || souhlStav === "pozor"
      ? "pozor"
      : "ok"
  return {
    celkem,
    pozornost: { chyb, z: instr.length },
    nepravdepodobne: { signalu, z: nepr.length },
    konzistence: { prumer: konzPrumer === null ? null : Math.round(konzPrumer * 100) / 100, stav: konzStav },
    souhlasnost: { prumer: souhlasnost === null ? null : Math.round(souhlasnost * 100) / 100, stav: souhlStav },
    nejdelsiRada: nejdelsi,
    tempo: { sekundNaOtazku: sekund === null ? null : Math.round(sekund * 10) / 10, stav: tempoStav },
    poznamky,
  }
}

// ---------- rizika ----------

export interface Riziko {
  id: string
  nazev: string
  text: string
}

// ---------- celý profil ----------

export interface OblastSkore {
  id: OblastId
  nazev: string
  popis: string
  hodnota: number | null
  pasmo: Pasmo | null
}

export interface Profil360 {
  skaly: Record<string, Skore>
  oblasti: OblastSkore[]
  osobnost: { kod: string; nazev: string; popis: string; hodnota: number | null; fazety: { kod: string; nazev: string; hodnota: number | null }[] }[]
  silneStranky: { kod: string; nazev: string; hodnota: number | null }[]
  motivace: { kod: string; nazev: string; popis: string; hodnota: number | null }[]
  vzruseni: number | null
  typ: { hlavni: TypDef; vedlejsi: TypDef } | null
  rizika: Riziko[]
  stres: { pasmo: StresPasmo; body: number } | null
  chronotyp: Chronotyp | null
  spolehlivost: Spolehlivost
}

const prumerNeNull = (xs: (number | null)[]) => {
  const h = xs.filter((x): x is number => x !== null)
  return h.length ? h.reduce((a, b) => a + b, 0) / h.length : null
}

export function vyhodnot(odp: Odpovedi, durationSec?: number, poradiIpip: number[] = []): Profil360 {
  const skaly: Record<string, Skore> = {}
  for (const s of SKALY) skaly[s.kod] = skoreSkaly(s.kod, s.polozky, s.obracene, odp)
  const h = (kod: string) => skaly[kod]?.hodnota ?? null

  const oblasti: OblastSkore[] = OBLASTI.map((o) => {
    const hodnoty = o.slozky.map(([kod, smer]) => {
      const x = h(kod)
      return x === null ? null : smer === 1 ? x : 100 - x
    })
    // Oblast se počítá, jen když chybí nejvýš jedna složka.
    const chybi = hodnoty.filter((x) => x === null).length
    const x = chybi <= 1 ? prumerNeNull(hodnoty) : null
    const hodnota = x === null ? null : Math.round(x)
    return { id: o.id, nazev: o.nazev, popis: o.popis, hodnota, pasmo: hodnota === null ? null : pasmo(hodnota) }
  })

  const osobnost = OBLASTI_OSOBNOSTI.map((d) => {
    const fazety = Object.keys(FAZETY)
      .filter((k) => k.startsWith(d.kod))
      .map((k) => ({ kod: k, nazev: FAZETY[k], hodnota: h(k) }))
    const x = prumerNeNull(fazety.map((f) => f.hodnota))
    return { kod: d.kod, nazev: d.nazev, popis: d.popis, hodnota: x === null ? null : Math.round(x), fazety }
  })

  const silneStranky = Object.keys(SILNE_STRANKY)
    .map((k) => ({ kod: k, nazev: SILNE_STRANKY[k], hodnota: h(k) }))
    .sort((a, b) => (b.hodnota ?? -1) - (a.hodnota ?? -1))

  const motivace = Object.keys(MOTIVACE).map((k) => ({ kod: k, ...MOTIVACE[k], hodnota: h(k) }))

  const vzruseni = prumerNeNull([h("E5"), h("bas-fun-seeking"), h("V.prudence") === null ? null : 100 - h("V.prudence")!])

  // Typ: průměr jeho oblastí; hlavní je nejvyšší, vedlejší druhý.
  const oblastH = (id: OblastId) => oblasti.find((o) => o.id === id)?.hodnota ?? null
  const typySkore = TYPY.map((t) => ({ t, x: prumerNeNull(t.oblasti.map(oblastH)) }))
    .filter((x): x is { t: TypDef; x: number } => x.x !== null)
    .sort((a, b) => b.x - a.x)
  const typ = typySkore.length >= 2 ? { hlavni: typySkore[0].t, vedlejsi: typySkore[1].t } : null

  const stres = stresPasmo(odp)
  const rizika: Riziko[] = []
  const vyssi = (kod: string, hranice: number) => (h(kod) ?? -1) >= hranice
  const nizsi = (kod: string, hranice: number) => (h(kod) ?? 101) <= hranice
  if (vyssi("N1", 70) || vyssi("N6", 70) || vyssi("bis-anxiety", 75)) {
    rizika.push({
      id: "obavy",
      nazev: "Obavy pod tlakem",
      text: "Silné obavy a citlivost na stres. Pod tlakem může výkon padat víc, než odpovídá schopnostem.",
    })
  }
  if (vyssi("N2", 65) || nizsi("A4", 40)) {
    rizika.push({
      id: "vztek",
      nazev: "Vznětlivost",
      text: "Snadno vzplane. Riziko zbytečných faulů, trestů, sporů s rozhodčím i konfliktů v týmu.",
    })
  }
  if (vyssi("N5", 65) || nizsi("V.self-regulation", 40)) {
    rizika.push({
      id: "nutkani",
      nazev: "Nutkání a nestřídmost",
      text: "Hůř odolává pokušení (jídlo, alkohol, utrácení, telefon). Ohrožuje to regeneraci a životosprávu.",
    })
  }
  if (nizsi("C6", 35) && (vyssi("E5", 65) || vyssi("bas-fun-seeking", 65))) {
    rizika.push({
      id: "riskovani",
      nazev: "Riskování bez rozmyslu",
      text: "Hledá vzrušení a jedná zbrkle. Vyšší riziko zranění a nepromyšlených rozhodnutí na hřišti i mimo něj.",
    })
  }
  if (nizsi("C5", 40)) {
    rizika.push({
      id: "disciplina",
      nazev: "Kolísající sebekázeň",
      text: "Věci odkládá a hůř se nutí do práce, která nebaví. Potřebuje pevný rámec a krátké termíny.",
    })
  }
  if (vyssi("N3", 60) || nizsi("V.hope-optimism", 40)) {
    rizika.push({
      id: "pesimismus",
      nazev: "Pesimismus a sklíčenost",
      text: "Sklon vidět spíš to horší a hůř zvedat hlavu. Stojí za to se ptát, jak se má i mimo sport.",
    })
  }
  if (stres && (stres.pasmo === "zvysena" || stres.pasmo === "vysoka")) {
    rizika.push({
      id: "stres",
      nazev: "Vysoká zátěž",
      text: `Stres za poslední týden je ${STRES_SLOVO[stres.pasmo]}. Zjisti, co ho teď zatěžuje, a zvaž úpravu tréninkové zátěže.`,
    })
  }
  if (nizsi("V.citizenship-teamwork", 40)) {
    rizika.push({
      id: "samotar",
      nazev: "Samotář",
      text: "Raději spoléhá sám na sebe. V týmu může působit odtažitě; u individuálního sportu hůř přijímá pomoc.",
    })
  }
  if (nizsi("A5", 30) && vyssi("bas-drive", 70)) {
    rizika.push({
      id: "ego",
      nazev: "Silné ego",
      text: "Vysoké mínění o sobě a silná potřeba mít navrch. Hůř přijímá kritiku a může se střetávat s autoritou.",
    })
  }
  if (nizsi("A2", 45)) {
    rizika.push({
      id: "fairplay",
      nazev: "Ohýbání pravidel",
      text: "Připouští, že si umí pomoct i nefér cestou. Stojí za otevřený rozhovor o hodnotách týmu a fair play.",
    })
  }

  const poradi = poradiIpip.length ? poradiIpip : Object.keys(odp).map(Number).filter((id) => id < 500).sort((a, b) => a - b)

  return {
    skaly,
    oblasti,
    osobnost,
    silneStranky,
    motivace,
    vzruseni: vzruseni === null ? null : Math.round(vzruseni),
    typ,
    rizika,
    stres,
    chronotyp: chronotyp(odp),
    spolehlivost: spolehlivost(odp, durationSec, poradi),
  }
}

// ---------------------------------------------------------------------------
// Shrnutí pro sportovce ve druhé osobě
// ---------------------------------------------------------------------------

export function shrnuti(p: Profil360): string[] {
  const odstavce: string[] = []
  const serazene = p.oblasti.filter((o) => o.hodnota !== null).sort((a, b) => b.hodnota! - a.hodnota!)
  if (p.typ) {
    odstavce.push(
      `Tvůj profil nejvíc odpovídá typu „${p.typ.hlavni.nazev}“, s rysy typu „${p.typ.vedlejsi.nazev}“.`,
    )
  }
  if (serazene.length >= 2) {
    const silne = serazene.slice(0, 2).map((o) => o.nazev.toLowerCase())
    const top = p.silneStranky.slice(0, 3).map((s) => s.nazev)
    odstavce.push(
      `Tvoje nejsilnější oblasti jsou ${silne.join(" a ")}. Mezi tvými nejsilnějšími stránkami charakteru jsou ${top.join(", ")}.`,
    )
    const slabsi = serazene[serazene.length - 1]
    const def = OBLASTI.find((o) => o.id === slabsi.id)!
    odstavce.push(
      `Největší prostor pro růst máš v oblasti „${slabsi.nazev}“. Pro začátek: ${def.rozvojSportovci.charAt(0).toLowerCase()}${def.rozvojSportovci.slice(1)}`,
    )
  }
  if (p.chronotyp) {
    odstavce.push(
      `Podle spánku jsi ${CHRONOTYP_SLOVO[p.chronotyp.typ]}. ${
        p.chronotyp.socialniJetlag >= 2
          ? "Rozdíl mezi spánkem ve všední a volné dny je velký; pravidelnější režim ti pomůže s regenerací."
          : "Tvůj spánkový režim je během týdne poměrně pravidelný."
      }`,
    )
  }
  odstavce.push("Profil není známka ani verdikt. Je to mapa, se kterou budeme dál pracovat.")
  return odstavce
}
