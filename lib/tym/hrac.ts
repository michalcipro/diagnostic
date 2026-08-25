import type { BandKey, DimensionId } from "../diagnostic/types"

// Vyhodnocení pro hráče v klubové větvi.
//
// Hráč je poprvé v celé aplikaci ten, kdo své výsledky vidí. U koučování
// jednotlivců to tak není a nebude: tam výklad předává kouč osobně. V klubu
// je to jinak, protože hráč se rozhoduje, jestli ho kouči vůbec ukáže, a to
// rozhodnutí nemá smysl dělat naslepo.
//
// Text sestavuje server. Do prohlížeče jde hotový, ne data plus klíč, jakým
// se z nich text skládá.

export interface HracOblast {
  id: DimensionId
  nazev: string
  uvod: string
  band: BandKey
  /** 0 až 100; kde v pásmu oblast leží */
  percent: number
  vyklad: string
}

export interface HracVyhodnoceni {
  /** název týmu, ať hráč pozná, odkud odkaz byl */
  tym: string
  /** jak se hráč označil; štítek od kouče nebo vlastní jméno */
  jmeno: string
  datum: string
  oblasti: HracOblast[]
  nejsilnejsi: DimensionId[]
  kProci: DimensionId[]
  shrnuti: string[]
  /** upozornění, když kontrola platnosti hlásí, že vyplnění nebylo spolehlivé */
  varovani?: string
}

export interface HracTexty {
  titul: string
  podtitul: string
  hotovo: string
  hotovoPopis: string
  nesdilenoPopis: string
  stahnout: string
  nejsilnejsiTitul: string
  kProciTitul: string
  oblastiTitul: string
  shrnutiTitul: string
  pasma: Record<BandKey, string>
  varovani: string
}

export const HRAC: Record<"cs" | "en", HracTexty> = {
  cs: {
    titul: "Tvoje výsledky",
    podtitul:
      "Sedm oblastí, které dotazník sleduje. Není to známka ani nálepka: je to " +
      "obrázek toho, jak to máš teď nastavené, a ten se dá měnit.",
    hotovo: "Odesláno",
    hotovoPopis: "Výsledky jsi sdílel{|a} se svým koučem.",
    nesdilenoPopis:
      "Kouč tvoje výsledky neuvidí. Do profilu celého týmu se tvoje odpovědi " +
      "započítaly anonymně, jak jsme psali před odesláním.",
    stahnout: "Stáhnout jako PDF",
    nejsilnejsiTitul: "Kde jsi nejsilnější",
    kProciTitul: "Kde je prostor",
    oblastiTitul: "Všech sedm oblastí",
    shrnutiTitul: "Co si z toho vzít",
    pasma: {
      priority: "prostor k práci",
      stabilization: "nestálé pod tlakem",
      strong: "silná stránka",
      elite: "výjimečně silné",
    },
    varovani:
      "Odpovědi vypadají na rychlé nebo nesoustředěné vyplnění, takže ber " +
      "výsledky s rezervou. Když to zkusíš v klidu znovu, dostaneš přesnější obrázek.",
  },
  en: {
    titul: "Your results",
    podtitul:
      "The seven areas the survey looks at. This is not a grade or a label: it is " +
      "a picture of how you are set up right now, and that can change.",
    hotovo: "Submitted",
    hotovoPopis: "You shared your results with your coach.",
    nesdilenoPopis:
      "Your coach will not see your results. Your answers were counted anonymously " +
      "towards the profile of the whole team, as we said before you submitted.",
    stahnout: "Download as PDF",
    nejsilnejsiTitul: "Where you are strongest",
    kProciTitul: "Where there is room",
    oblastiTitul: "All seven areas",
    shrnutiTitul: "What to take from this",
    pasma: {
      priority: "room to work",
      stabilization: "unsteady under pressure",
      strong: "a strength",
      elite: "exceptionally strong",
    },
    varovani:
      "The answers look like a fast or distracted run through, so treat the results " +
      "with caution. Trying again in a calmer moment will give you a clearer picture.",
  },
}
