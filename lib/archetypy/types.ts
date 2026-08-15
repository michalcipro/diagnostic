// Archetypy značky podle Mark & Pearson: The Hero and the Outlaw – typy.
//
// Samostatný modul vedle ELITE a vzorců, protože test má jinou logiku
// vyhodnocení: nehledá se profil silných a slabých míst, ale identita.
// Výsledkem je pořadí dvanácti archetypů, primární a sekundární archetyp
// a míra vyhranění profilu.

/** Odpověď na šestibodové škále. Bez středu, u identity se musí přiklonit. */
export type Odpoved = 1 | 2 | 3 | 4 | 5 | 6

export type OdpovediMapa = Record<number, Odpoved>

export type ArchetypId =
  | "nevinatko"
  | "objevitel"
  | "mudrc"
  | "hrdina"
  | "rebel"
  | "mag"
  | "jeden-z-nas"
  | "milenec"
  | "sprymar"
  | "pecovatel"
  | "tvurce"
  | "vladce"

/**
 * Motivační skupina podle knihy: dvě osy (stabilita proti riziku,
 * sounáležitost proti nezávislosti) dávají čtyři skupiny po třech.
 */
export type Motivace = "nezavislost" | "mistrovstvi" | "sounalezitost" | "rad"

export interface ArchetypDef {
  id: ArchetypId
  motivace: Motivace
  /** globální čísla položek, 8 na archetyp */
  polozky: number[]
}

/** Skóre jednoho archetypu. */
export interface ArchetypSkore {
  id: ArchetypId
  /** součet odpovědí, 8 až 48 */
  skore: number
  min: number
  max: number
  /** 0-100, pro vykreslení pruhu */
  procenta: number
  /** kolik položek dostalo 5 nebo 6 */
  silnychOdpovedi: number
  zodpovezeno: number
  celkem: number
  /** false = zodpovězeno málo položek, skóre se nevykazuje */
  vykazuje: boolean
}

/** Jak vyhraněný profil je; řídí tón interpretace. */
export type Vyhraneni = "vyhraneny" | "zretelny" | "tesny"

export interface VysledekArchetypu {
  /** všech dvanáct seřazených podle skóre sestupně */
  vsechny: ArchetypSkore[]
  primarni: ArchetypSkore
  sekundarni: ArchetypSkore
  /** nejnižší skóre: slepé místo profilu */
  potlaceny: ArchetypSkore
  /** odstup primárního od sekundárního v bodech */
  odstup: number
  vyhraneni: Vyhraneni
  /** průměrná procenta tří archetypů každé motivační skupiny */
  motivace: Record<Motivace, number>
  zodpovezeno: number
  kompletni: boolean
  dobaSek?: number
}

/** Obsah jednoho archetypu pro vyhodnocení. */
export interface ArchetypObsah {
  nazev: string
  /** anglický název z knihy, pro dohledání v literatuře */
  puvodni: string
  motto: string
  touha: string
  strach: string
  dar: string
  /** kdo ten archetyp je, 150-250 slov */
  podstata: string
  /** jak se projevuje ve firmě, značce a vedení lidí */
  vPodnikani: string
  /** do čeho sklouzne pod tlakem nebo při přehnání */
  stin: string
  /** nejčastější chyby při komunikaci značky s tímto archetypem */
  pasti: string
  /** konkrétní kroky: hlas značky, co dělat a co ne */
  navod: string[]
  /** známé značky z knihy a praxe, pro rychlé ukotvení */
  priklady: string
  /** co archetyp přidává, když je druhý v pořadí */
  sekundarniRole: string
}
