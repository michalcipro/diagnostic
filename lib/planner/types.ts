import type { Gender, Lang } from "@/lib/diagnostic/types"

// Datové typy týdenního plánovače.
//
// Plánovač je elektronická podoba papírového Weekly Planneru Winning Minds.
// Stavba je proto pevná a odpovídá tištěné předloze: rozvrh 05:00 až 22:00,
// poznámky k týdnu, tracker návyků, pět denních ukazatelů a tři otázky denní
// reflexe. Jediné, co si klient definuje sám, jsou návyky – všechno ostatní
// se jen vyplňuje.

export type { Gender, Lang }

// ─────────────────────────────────────────────────────────────────────────────
// Rozvrh dne
// ─────────────────────────────────────────────────────────────────────────────

/**
 * První a poslední hodina denního rozvrhu.
 *
 * Papírová předloha má řádky 05:00 až 22:00 a mřížka se nikde neposouvá.
 * Držíme se toho: kdyby si každý nastavoval vlastní rozsah, přestaly by být
 * týdny mezi sebou i s papírem porovnatelné a statistika „naplánovaných
 * hodin" by ztratila smysl.
 */
export const PRVNI_HODINA = 5
export const POSLEDNI_HODINA = 22

/** Hodiny rozvrhu, tedy 5, 6, ... 22. */
export const HODINY: number[] = Array.from(
  { length: POSLEDNI_HODINA - PRVNI_HODINA + 1 },
  (_, i) => PRVNI_HODINA + i,
)

/** Jeden zapsaný blok v rozvrhu. Prázdné hodiny se neukládají. */
export interface ScheduleSlot {
  hour: number
  text: string
}

// ─────────────────────────────────────────────────────────────────────────────
// Denní ukazatele
// ─────────────────────────────────────────────────────────────────────────────

/** Klíče denních ukazatelů v pořadí, v jakém stojí na papíře. */
export const METRIKY = ["sleep", "energy", "focus", "mood", "productivity"] as const
export type MetricKey = (typeof METRIKY)[number]

/**
 * Čtyři ukazatele na škále 1 až 10. Spánek mezi ně nepatří.
 *
 * Spánek se zapisuje v hodinách, protože je to jediná tvrdá veličina, kterou
 * deník sbírá: hodiny jdou porovnat s doporučením i mezi lidmi, „spánek za 7
 * z 10" nejde s ničím. Průměr přes všechny ukazatele se proto počítá jen
 * z těchto čtyř, jinak by se sčítaly hodiny s body.
 */
export const METRIKY_SKALA: MetricKey[] = ["energy", "focus", "mood", "productivity"]

export interface RozsahMetriky {
  min: number
  max: number
  krok: number
  /** hodnota je v hodinách, ne na škále 1 až 10 */
  hodiny: boolean
}

export const ROZSAH: Record<MetricKey, RozsahMetriky> = {
  // Horní mez 14 hodin je velkorysá: víc už není údaj o spánku, ale překlep.
  sleep: { min: 0, max: 14, krok: 0.5, hodiny: true },
  energy: { min: 1, max: 10, krok: 1, hodiny: false },
  focus: { min: 1, max: 10, krok: 1, hodiny: false },
  mood: { min: 1, max: 10, krok: 1, hodiny: false },
  productivity: { min: 1, max: 10, krok: 1, hodiny: false },
}

export type DayRatings = Partial<Record<MetricKey, number>>

// ─────────────────────────────────────────────────────────────────────────────
// Denní reflexe
// ─────────────────────────────────────────────────────────────────────────────

/** Tři otázky denní reflexe, opět v pořadí z papírové předlohy. */
export const REFLEXE = ["grateful", "win", "improve"] as const
export type ReflectionKey = (typeof REFLEXE)[number]

export type DayReflection = Partial<Record<ReflectionKey, string>>

// ─────────────────────────────────────────────────────────────────────────────
// Záznamy
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Jeden den deníku.
 *
 * Splněné návyky se drží jako seznam identifikátorů přímo u dne. Odškrtnutí
 * kolečka je tak jediný zápis do jednoho dokumentu a odznačení totéž,
 * což je přesně to chování, které plánovač slibuje: cokoli jde kdykoli vzít
 * zpět.
 */
export interface PlannerDay {
  /** „YYYY-MM-DD" */
  date: string
  schedule: ScheduleSlot[]
  ratings: DayRatings
  reflection: DayReflection
  /** identifikátory návyků splněných toho dne */
  habits: string[]
  updatedAt?: number
}

/** Návyk, který si klient definoval sám. */
export interface PlannerHabit {
  id: string
  name: string
  /** pořadí v trackeru; nižší číslo je výš */
  order: number
  /**
   * Kolik dnů v týdnu si klient dal za cíl. Nepovinné: návyk bez cíle se
   * jen počítá, nic nevyčítá.
   */
  target?: number
  /**
   * Archivovaný návyk zmizí z trackeru, ale zůstane v historii i ve
   * statistikách. Bez archivace by se dalo minulost měnit tím, že si člověk
   * návyk smaže, a čísla za loňský rok by se pod rukama měnila.
   */
  archivedAt?: number
  createdAt: number
}

/** Poznámky a nápady k jednomu týdnu. */
export interface PlannerWeek {
  /** pondělí toho týdne, „YYYY-MM-DD" */
  monday: string
  notes: string
  updatedAt?: number
}

/** Přihlášený klient tak, jak ho vidí aplikace. */
export interface PlannerIdentity {
  name: string
  email: string
  gender?: Gender
  lang: Lang
  createdAt: number
}

/** Klient v přehledu kouče. */
export interface PlannerClientRow {
  id: string
  name: string
  email: string
  gender?: Gender
  lang: Lang
  active: boolean
  createdAt: number
  lastLoginAt?: number
  /** kolik dnů má klient vyplněných; kouč do obsahu deníku nevidí */
  dnu: number
  /** poslední den, ke kterému něco zapsal */
  posledniZapis?: string
}

/** Pozvánka do plánovače v přehledu kouče. */
export interface PlannerInviteRow {
  id: string
  token: string
  name: string
  email: string
  lang: Lang
  createdAt: number
  expiresAt: number
  usedAt?: number
}
