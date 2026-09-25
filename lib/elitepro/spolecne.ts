// ELITE Pro: čísla otázek, která zná dotazník i server.
//
// Nic z toho není klíč. Kontext, spánek a duševní pohoda se nepočítají do
// škál, takže jejich čísla smí být v prohlížeči. Klíč ke škálám je
// v klic.ts a sem se z něj nic nepřenáší.

/** Pilotní verze: z každé škály polovina kandidátů. */
export const POLOZEK_NA_SKALU = 6
/** Pilotní verze: z každé skupiny vinět dvě. */
export const VINET_NA_SKUPINU = 2
/** Kontrolní položky ve formě: 2 instruované a 3 nepravděpodobné. */
export const KONTROLNICH_VE_FORME = 5
/** Počet škál a skupin vinět v bance. */
export const POCET_SKAL = 36
export const POCET_SKUPIN_VINET = 3
export const REAKCI_NA_VINETU = 4

/** Kolik odpovědí má jedna forma: položky, kontroly a reakce na viněty. */
export const VELIKOST_FORMY =
  POCET_SKAL * POLOZEK_NA_SKALU + KONTROLNICH_VE_FORME + POCET_SKUPIN_VINET * VINET_NA_SKUPINU * REAKCI_NA_VINETU

/** Duševní pohoda, PHQ-4: 0 až 3. Úzkost (GAD-2) a skleslost (PHQ-2). */
export const POHODA_UZKOST = [2001, 2002] as const
export const POHODA_SKLESLOST = [2003, 2004] as const
export const POHODA = [...POHODA_UZKOST, ...POHODA_SKLESLOST] as const
/** Hranice z validace PHQ-4: 3 a víc v kterékoli dvojici. */
export const POHODA_HRANICE = 3

/** Kontext: číslo otázky → počet možností (odpověď 1 až n). */
export const KONTEXT: Record<number, number> = {
  3001: 2, // typ sportu
  3002: 4, // úroveň
  3003: 4, // roky soutěžního sportu
  3004: 4, // zranění za 12 měsíců
  3005: 4, // fáze sezony
  3006: 5, // hodiny tréninku týdně
}

/** Spánek podle MCTQ: minuty od půlnoci, 0 až 1439. */
export const SPANEK_CASY = [4001, 4002, 4003, 4004] as const
/** Budík ve volné dny: 1 ano, 2 ne. */
export const SPANEK_BUDIK = 4005

/** Je to číslo reakce na vinětu? Reakce mají 1000 + 10 × viněta + pořadí. */
export function jeReakce(id: number): boolean {
  return id > 1000 && id < 2000
}
