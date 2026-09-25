import type { Format, Ramec } from "./typy"

// ELITE Pro: texty a data dotazníku pro prohlížeč sportovce.
//
// Jen to, co sportovec vidí. Klíč ke škálám je v klic.ts a sem nesmí; hlídá
// to scripts/audit-balicku.cjs. Pilotní verze je jen česky: banka otázek
// zatím existuje jen v češtině a překlad přijde až po posouzení obsahu.

export interface PolozkaDotazniku {
  /** text */
  t: string
  /** formát odpovědí: souhlas, nebo četnost */
  f: Format
  /** časový rámec: obvykle, nebo posledních 4 týdnů */
  r: Ramec
}

export interface VinetaDotazniku {
  /** situace */
  s: string
  /** reakce: [číslo, text] */
  r: [number, string][]
}

export interface DataDotazniku {
  verze: string
  otazkaVinet: string
  polozky: Record<string, PolozkaDotazniku>
  vinety: Record<string, VinetaDotazniku>
}

/** Načte otázky až pro pozvánku na ELITE Pro; jiným respondentům nepatří. */
export async function nactiDotaznik(): Promise<DataDotazniku> {
  return (await import("./data/dotaznik-cs.json")).default as unknown as DataDotazniku
}

/** Pořadí bloků: nejdřív rysy, pak posledních 4 týdnů; v každém souhlas, pak četnost. */
export const PORADI_BLOKU: { r: Ramec; f: Format }[] = [
  { r: "rys", f: "P" },
  { r: "rys", f: "C" },
  { r: "4t", f: "P" },
  { r: "4t", f: "C" },
]

export const STUPNICE: Record<Format | "V", string[]> = {
  P: ["vůbec nesouhlasím", "spíš nesouhlasím", "ani tak, ani tak", "spíš souhlasím", "úplně souhlasím"],
  C: ["téměř nikdy", "zřídka", "občas", "často", "téměř vždy"],
  V: ["velmi nepravděpodobně", "spíš nepravděpodobně", "možná", "spíš pravděpodobně", "velmi pravděpodobně"],
}

export interface OtazkaKontextu {
  id: number
  otazka: string
  moznosti: string[]
}

export const KONTEXT_OTAZKY: OtazkaKontextu[] = [
  { id: 3001, otazka: "Jaký sport děláš?", moznosti: ["kolektivní", "individuální"] },
  {
    id: 3002,
    otazka: "Na jaké úrovni soutěžíš?",
    moznosti: [
      "výkonnostní sport (krajské a národní soutěže)",
      "juniorská reprezentace nebo sportovní akademie",
      "profesionální sport",
      "TOP 100 světového žebříčku",
    ],
  },
  {
    id: 3003,
    otazka: "Jak dlouho soutěžně sportuješ?",
    moznosti: ["méně než 3 roky", "3 až 5 let", "6 až 10 let", "víc než 10 let"],
  },
  {
    id: 3004,
    otazka: "Kolikrát tě za posledních 12 měsíců vyřadilo zranění na víc než 2 týdny?",
    moznosti: ["ani jednou", "jednou", "dvakrát", "třikrát a víc"],
  },
  {
    id: 3005,
    otazka: "V jaké části sezony teď jsi?",
    moznosti: ["přípravné období", "soutěžní období", "přechodné období nebo volno", "mimo kvůli zranění"],
  },
  {
    id: 3006,
    otazka: "Kolik hodin týdně trénuješ?",
    moznosti: ["do 5", "6 až 10", "11 až 15", "16 až 20", "víc než 20"],
  },
]

export const SPANEK_OTAZKY: { id: number; otazka: string }[] = [
  { id: 4001, otazka: "Ve dny s tréninkem, školou nebo prací: v kolik obvykle usínáš?" },
  { id: 4002, otazka: "Ve dny s tréninkem, školou nebo prací: v kolik obvykle vstáváš?" },
  { id: 4003, otazka: "Ve volné dny: v kolik obvykle usínáš?" },
  { id: 4004, otazka: "Ve volné dny: v kolik se obvykle probouzíš?" },
]

/**
 * PHQ-4, pracovní český překlad. Formuláře PHQ smí kdokoli kopírovat
 * a překládat bez svolení. Před ostrým použitím porovnat s oficiální českou
 * verzí na phqscreeners.com, pokud existuje.
 */
export const POHODA_OTAZKY: { id: number; text: string }[] = [
  { id: 2001, text: "Nervozita, úzkost nebo pocit napětí" },
  { id: 2002, text: "Nemožnost zastavit starosti nebo je mít pod kontrolou" },
  { id: 2003, text: "Malý zájem o věci nebo malá radost z nich" },
  { id: 2004, text: "Pocit skleslosti, sklíčenosti nebo beznaděje" },
]

export const POHODA_STUPNICE = ["vůbec ne", "několik dní", "víc než polovinu dní", "skoro každý den"]

/** Kontakty na okamžitou pomoc. Ověřit před spuštěním a pak jednou ročně. */
export const POMOC: { nazev: string; kontakt: string }[] = [
  { nazev: "Linka první psychické pomoci", kontakt: "116 123" },
  { nazev: "Linka bezpečí (děti a studenti)", kontakt: "116 111" },
  { nazev: "V ohrožení života", kontakt: "155 nebo 112" },
  { nazev: "Slovensko: Linka dôvery Nezábudka", kontakt: "0800 800 566" },
]

export const T = {
  nazev: "ELITE Pro",
  podtitul: "pilotní verze",
  uvodTitul: "Než začneš",
  uvod: [
    "Tohle je nový test, který vyvíjíme. Tvoje odpovědi nám pomohou vybrat otázky, které nejlíp vystihují, co ve sportu rozhoduje o výkonu.",
    "Zabere přibližně 40 minut. Odpovědi se průběžně ukládají v tomto zařízení, takže si můžeš dát pauzu a vrátit se později.",
    "Nejsou tu správné ani špatné odpovědi. Odpovídej podle toho, jak to u tebe opravdu je, ne jak by to mělo být.",
    "Z pilotní verze se zatím žádné vyhodnocení nepočítá. Kouč s tebou probere, co dál.",
  ],
  osobaTitul: "O tobě",
  sportLabel: "Sport a disciplína nebo pozice",
  sportPlaceholder: "volejbal, smečař",
  kontextTitul: "Tvůj sport",
  kontextUvod: "Pár otázek, abychom věděli, v jakém prostředí se pohybuješ.",
  bloky: {
    "rys-P":
      "Jak moc s tvrzením souhlasíš? Odpovídej podle toho, jak to u tebe obvykle je. Kde se mluví o týmu, " +
      "mysli u individuálního sportu na lidi, se kterými pracuješ: trenéra, kondičního trenéra, fyzioterapeuta " +
      "a tréninkovou skupinu.",
    "rys-C": "Jak často to děláš? Odpovídej podle toho, jak to u tebe obvykle je.",
    "4t-P": "Jak moc to platilo za posledních 4 týdnů?",
    "4t-C": "Jak často se to stávalo za posledních 4 týdnů?",
  } as Record<string, string>,
  blokNadpis: (od: number, doPolozky: number, celkem: number) => `Tvrzení ${od} až ${doPolozky} z ${celkem}`,
  vinetyTitul: "Situace",
  vinetyUvod:
    "Přečti si situaci a u každé reakce označ, jak pravděpodobně bys ji {udělal|udělala}. Nejde o to, co je " +
    "správně, ale co bys opravdu {udělal|udělala}.",
  vinetaNadpis: (i: number, n: number) => `Situace ${i} z ${n}`,
  spanekTitul: "Spánek",
  spanekUvod: "Jak obvykle spíš v posledních 4 týdnech. Stačí přibližný čas.",
  budik: "Ve volné dny tě budí budík?",
  ano: "ano",
  ne: "ne",
  pohodaTitul: "Jak se v poslední době cítíš",
  pohodaUvod: [
    "Poslední čtyři otázky jsou dobrovolné. Tvoje odpovědi neuvidí nikdo, ani kouč, a nikde se neukládají.",
    "Když z nich vyjde, že by ti mohl pomoct rozhovor s odborníkem, kouč dostane jen doporučení nabídnout ti " +
      "kontakt. Vybrat si pak můžeš {sám|sama}: odborníka, kterého doporučíme, nebo úplně jiného.",
  ],
  pohodaAno: "Chci odpovědět",
  pohodaNe: "Přeskočit",
  pohodaOtazka: "Jak často tě za poslední 2 týdny trápilo následující?",
  odeslatTitul: "Hotovo, zbývá odeslat",
  odeslatText: "Zkontroluj, že máš všechno, a odešli odpovědi kouči.",
  odeslat: "Odeslat",
  odesilam: "Odesílám…",
  zpet: "Zpět",
  dal: "Pokračovat",
  zacit: "Začít",
  pokracovat: "Pokračovat ve vyplňování",
  chybiOsoba: "Vyplň jméno a oslovení.",
  chybiVolba: "Vyber, jestli chceš odpovědět, nebo otázky přeskočit.",
  chybi: (n: number) => (n === 1 ? "Chybí 1 odpověď." : n < 5 ? `Chybí ${n} odpovědi.` : `Chybí ${n} odpovědí.`),
  odeslanoTitul: "Děkujeme, odpovědi jsou odeslané",
  odeslanoText: "Pomáhají vyladit nový test. Kouč s tebou probere, co dál.",
  pomocTitul: "Kdyby ti nebylo dobře",
  pomocText: "Když je toho moc, nemusíš na to být {sám|sama}. Tyhle linky pomáhají zdarma, anonymně a nonstop:",
  selhaloTitul: "Odeslání se nepodařilo",
  selhaloText:
    "Odpovědi zůstaly uložené v tomto zařízení. Zkus to za chvíli znovu, nebo si stáhni zálohu a pošli ji kouči.",
  znovu: "Zkusit znovu",
  zaloha: "Stáhnout zálohu",
  ulozeno: "Odpovědi se ukládají automaticky.",
  dataPoznamka:
    "Anonymní kopie odpovědí, bez jména a data narození, slouží k vývoji a ověření testu. Otázky na duševní " +
    "pohodu se neukládají vůbec.",
}
