// Profil 360: čísla otázek, která zná dotazník i server. Nic z toho není klíč.

/** Otázky na stupnici IPIP (včetně kontrol) mají čísla 1 až 246. */
export const POCET_IPIP = 246
/** DASS-21, škála stresu: 501 až 507, stupnice 0 až 3. */
export const DASS = [501, 502, 503, 504, 505, 506, 507] as const

/** Spánek: časy v minutách od půlnoci a budík ve volné dny (1 ano, 2 ne). */
export const SPANEK = { casy: [4001, 4002, 4003, 4004] as const, budik: 4005 }

/** PHQ-4: 0 až 3; úzkost a skleslost, hranice 3 v kterékoli dvojici. */
export const POHODA_UZKOST = [2001, 2002] as const
export const POHODA_SKLESLOST = [2003, 2004] as const
export const POHODA = [...POHODA_UZKOST, ...POHODA_SKLESLOST] as const
export const POHODA_HRANICE = 3

/** Kolik odpovědí je potřeba na úplné vyplnění (bez dobrovolné pohody). */
export const VELIKOST = POCET_IPIP + DASS.length + SPANEK.casy.length + 1
