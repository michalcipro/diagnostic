// Emocionálně-destruktivní vzorce – typy.
//
// Záměrně samostatný modul, ne rozšíření ELITE. Tenhle test má jinou škálu
// (1-6 místo 1-5), jinou stavbu (11 rovnocenných vzorců bez fazet), jiná pásma
// (pět místo čtyř) a hlavně jinou logiku vyhodnocení: nehledá se profil všech
// škál, ale tři nejaktivnější vzorce a jejich vzájemné souvislosti.

/**
 * Podoba testu. Všechny mají stejnou stavbu, stejné skórování i stejná pásma;
 * liší se dotazník a texty vyhodnocení. Sport je rozdělený na individuální
 * a týmový, protože se vzorec projevuje jinak v kabině a jinak na okruhu:
 * týmová verze mluví o sestavě a spoluhráčích, individuální o nominaci,
 * koučovi a závodech.
 */
export type Varianta = "obecna" | "sport-individual" | "sport-tym"

/** Odpověď na šestibodové škále. Šestka je záměrná: nemá střed, nutí se přiklonit. */
export type Odpoved = 1 | 2 | 3 | 4 | 5 | 6

export type OdpovediMapa = Record<number, Odpoved>

/** Identifikátor vzorce, „01" až „11". */
export type VzorecId =
  | "01" | "02" | "03" | "04" | "05" | "06" | "07" | "08" | "09" | "10" | "11"

/** Pásmo aktivace vzorce podle celkového skóre. */
export type Pasmo = "velmi-nizka" | "nizka" | "stredni" | "vysoka" | "dominantni"

/**
 * Doména podle původního rozdělení schémat.
 *
 * Vzorce nestojí vedle sebe náhodně; sdružují se podle toho, která dětská
 * potřeba zůstala nenaplněná. Doména je to, co dovoluje ze tří vzorců udělat
 * jeden příběh místo tří oddělených popisů.
 */
export type Domena =
  | "odpojeni"      // odpojení a odmítnutí
  | "autonomie"     // narušená autonomie a výkon
  | "hranice"       // narušené hranice
  | "zamereni"      // zaměření na druhé
  | "ostrazitost"   // přehnaná ostražitost a inhibice

export interface VzorecDef {
  id: VzorecId
  nazev: string
  tema: string
  domena: Domena
  /** globální čísla položek, 10 na vzorec */
  polozky: number[]
}

export interface PasmoRozsah {
  min: number
  max: number
  pasmo: Pasmo
}

/** Skóre jednoho vzorce. */
export interface VzorecSkore {
  id: VzorecId
  /** součet odpovědí, 10 až 60 */
  skore: number
  min: number
  max: number
  /** 0-100, pro vykreslení pruhu */
  procenta: number
  pasmo: Pasmo
  /** kolik položek dostalo 5 nebo 6 */
  silnychOdpovedi: number
  /** čísla těch položek, ať je kouč umí najít */
  silnePolozky: number[]
  zodpovezeno: number
  celkem: number
  /** false = zodpovězeno málo položek, skóre se nevykazuje */
  vykazuje: boolean
}

export interface VysledekVzorcu {
  /** všech 11 vzorců seřazených podle skóre sestupně */
  vsechny: VzorecSkore[]
  /** tři nejaktivnější; méně jen tehdy, když se tolik vzorců nevykazuje */
  top3: VzorecSkore[]
  /**
   * Vzorce mimo první trojici, které mají aspoň tři odpovědi 5-6.
   * Zdroj na to výslovně upozorňuje: jednotlivé silné odpovědi jsou významné
   * i tehdy, když celkové skóre vysoké není.
   */
  situacni: VzorecSkore[]
  zodpovezeno: number
  kompletni: boolean
  dobaSek?: number
}

/** Obsah jednoho vzorce pro vyhodnocení. */
export interface VzorecObsah {
  nazev: string
  tema: string
  motto: string
  /** jak to vypadá zevnitř, 200-350 slov */
  prozitek: string
  /** co vzorec dělá, když přijde tlak */
  podTlakem: string
  /** odkud se to vzalo */
  puvod: string
  /** krátký rámec podle pásma aktivace */
  pasma: Record<Pasmo, string>
}
