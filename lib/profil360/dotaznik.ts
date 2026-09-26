// Profil 360: texty a data dotazníku pro prohlížeč sportovce.
//
// Jen to, co sportovec vidí. Klíč je v klic.ts a výklad v profil.ts; sem
// nesmí ani jedno (scripts/audit-balicku.cjs). Zatím jen česky.

export interface PolozkaDotazniku {
  t: string
  /** A = stupnice IPIP (1–5), D = DASS (0–3) */
  s: "A" | "D"
}

export interface DataDotazniku {
  verze: string
  polozky: Record<string, PolozkaDotazniku>
}

export async function nactiDotaznik(): Promise<DataDotazniku> {
  return (await import("./data/dotaznik-cs.json")).default as unknown as DataDotazniku
}

export const STUPNICE_IPIP = [
  "vůbec mě nevystihuje",
  "spíš mě nevystihuje",
  "ani ano, ani ne",
  "spíš mě vystihuje",
  "přesně mě vystihuje",
]

/** DASS: hodnoty 0 až 3. */
export const STUPNICE_DASS = ["vůbec", "trochu nebo občas", "dost nebo často", "hodně nebo většinu času"]

export const T = {
  nazev: "Sportovní profil 360",
  uvodTitul: "Než začneš",
  uvod: [
    "Profil skládá dohromady několik ověřených dotazníků: o osobnosti, silných stránkách, motivaci, stresu a spánku. Z nich vznikne tvůj sportovní profil.",
    "Zabere 35 až 40 minut. Odpovědi se průběžně ukládají v tomto zařízení, takže si můžeš dát pauzu a vrátit se později.",
    "Nejsou tu správné ani špatné odpovědi. Popisuj se {takového|takovou}, {jaký|jaká} jsi teď, ne {jaký|jaká} bys {chtěl|chtěla} být.",
    "Výsledek s tebou probere kouč.",
  ],
  osobaTitul: "O tobě",
  sportLabel: "Sport a disciplína nebo pozice",
  sportPlaceholder: "volejbal, smečař",
  kontextTitul: "Tvůj sport",
  kontextUvod: "Pár otázek, abychom věděli, v jakém prostředí se pohybuješ.",
  ipipUvod:
    "U každého tvrzení označ, jak přesně tě vystihuje. Popisuj se {takového|takovou}, {jaký|jaká} obecně jsi, " +
    "ve sportu i mimo něj, ve srovnání s lidmi stejného pohlaví a zhruba stejného věku.",
  blokNadpis: (od: number, doPolozky: number, celkem: number) => `Tvrzení ${od} až ${doPolozky} z ${celkem}`,
  dassTitul: "Poslední týden",
  dassUvod: "Jak moc se tě následující týkalo během posledního týdne?",
  spanekTitul: "Spánek",
  spanekUvod: "Jak obvykle spíš v posledních 4 týdnech. Stačí přibližný čas.",
  dataPoznamka:
    "Anonymní kopie odpovědí, bez jména a data narození, slouží ke zpřesnění profilu. Otázky na duševní pohodu se neukládají vůbec.",
  odeslanoText: "Kouč s tebou probere tvůj profil.",
}
