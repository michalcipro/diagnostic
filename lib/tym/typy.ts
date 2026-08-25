import type { BandKey, DimensionId } from "../diagnostic/types"

// Týmový profil: co se dá říct o skupině, když známe profily jednotlivců.
//
// Skládá se na serveru, aby se individuální profily nedostaly ven. Klient
// dostane čísla a kódy nálezů; texty si k nim dohledá sám v obsah.ts.
// Prahy a pravidla, podle kterých nálezy vznikají, tím zůstávají na serveru.

/**
 * Co se v týmu našlo.
 *
 * Kódy jsou stavy skupiny, ne vlastnosti jednotlivců. „Tichá kabina" neříká,
 * že hráči jsou tiší; říká, že ve skupině chybí bezpečí říct nepříjemnou věc
 * nahlas, což je něco jiného a řeší se to jinde.
 */
export type NalezKod =
  | "sebejista-ticha-satna"
  | "trajektorie-vyhoreni"
  | "nalada-podle-vysledku"
  | "par-nese-naklad"
  | "zlom-pod-tlakem"
  | "zlom-v-pozornosti"
  | "pozornost-mizi-pod-tlakem"
  | "tvrdi-na-sebe"
  | "bez-opory"
  | "krehka-identita"
  | "vyrovnany-zaklad"

/** Jak silný nález je. Řídí pořadí v reportu i to, co se hlásí jako první riziko. */
export type Sila = "vysoka" | "stredni"

export interface Nalez {
  kod: NalezKod
  sila: Sila
  /** oblasti, ze kterých nález vychází; report je u něj ukáže */
  oblasti: DimensionId[]
}

/** Jedna oblast napříč týmem. */
export interface OblastProfil {
  id: DimensionId
  /** průměr procentního skóre oblasti, 0 až 100 */
  prumer: number
  /** směrodatná odchylka; u týmu říká víc než průměr */
  smodch: number
  min: number
  max: number
  /** kolik hráčů spadlo do kterého pásma */
  pasma: Record<BandKey, number>
  /**
   * Zlomová linie: tým se v téhle oblasti dělí na dvě skupiny s mezerou mezi
   * nimi. Pod tlakem se právě tady mužstvo rozpadne na ty, kdo si poradí,
   * a ty, kdo ne.
   *
   * Je to něco jiného než velký rozptyl, viz níž, a report to nesmí plést.
   * Dvě skupiny se řeší skládáním sestavy a rozdílnou přípravou; jeden člověk
   * mimo se řeší rozhovorem s ním.
   */
  rozkol: boolean
  /**
   * Velké rozdíly bez zřetelné mezery. Typicky jeden nebo dva lidé daleko od
   * zbytku. Tým se tady nedělí na party, jen má někoho, kdo vyčnívá.
   */
  rozptyl: boolean
  /**
   * Slabina rovnoměrně přes celý kádr. Pak to není součet problémů
   * jednotlivců, ale věc kultury a vedení, a řeší se jinak.
   */
  plosna: boolean
}

/**
 * Jedna část oblasti napříč týmem.
 *
 * Každá ze sedmi oblastí stojí na třech konkrétnějších věcech. Průměr oblasti
 * je umí schovat: oblast může mít slušné číslo a přitom v ní jedna část silně
 * pokulhává. Právě proto se počítají zvlášť.
 */
export interface CastProfil {
  id: string
  /** oblast, do které část patří */
  oblast: DimensionId
  prumer: number
  smodch: number
  min: number
  max: number
  /**
   * Část je nízko, nebo se v ní tým výrazně rozchází. Počítá se tady, aby
   * prahy zůstaly na serveru; klient dostane hotový závěr.
   */
  riziko: boolean
}

export interface TymovyProfil {
  nazev: string
  pozvano: number
  odevzdano: number
  /** kolik vyplnění mělo použitelné skóre; neúplná se do profilu nepočítají */
  zapocteno: number
  oblasti: OblastProfil[]
  /** tři části pod každou oblastí, v pořadí dotazníku */
  casti: CastProfil[]
  /**
   * Skrytá trhlina: oblast, která vypadá klidně, a přitom v ní leží část
   * výrazně mimo. Právě tohle průměr oblasti schová, takže se to hlásí zvlášť.
   */
  trhliny: { oblast: DimensionId; cast: string }[]
  /** o co se tým může opřít, když je zle */
  opory: DimensionId[]
  /** kde je práce nejpotřebnější */
  priority: DimensionId[]
  /** kde se tým pod tlakem rozdělí */
  zlomy: DimensionId[]
  nalezy: Nalez[]
  /**
   * Málo odevzdaných dotazníků. Profil se pak blíží profilu jednotlivce
   * a hráč, který si nepřál sdílet, je z něj čitelný. Report to musí říct
   * nahlas, protože jsme mu slíbili opak.
   */
  maloDat: boolean
}
