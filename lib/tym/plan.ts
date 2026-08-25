import type { DimensionId } from "../diagnostic/types"
import { TYM, type TymLang } from "./obsah"
import { RAMEC } from "./ramec"
import { VYKLAD, type TvarKlic, type UrovenKlic } from "./vyklad"

// Z profilu se odvodí shrnutí a plán práce.
//
// Běží nad hotovým profilem, takže stejný kód poslouží obrazovce i PDF a oba
// ukážou totéž. Prahy jsou tady, ne v textech: text popisuje závěr, tahle
// vrstva rozhoduje, který závěr platí.

/** Tvar, který stačí ke složení reportu. Sedí na profil ze serveru i z agregace. */
export interface OblastProCteni {
  id: string
  prumer: number
  smodch: number
  min: number
  max: number
  pasma: { priority: number; stabilization: number; strong: number; elite: number }
  rozkol: boolean
  rozptyl: boolean
  plosna: boolean
}

/** Jedna část oblasti tak, jak ji vrací server. */
export interface CastProCteni {
  id: string
  oblast: string
  prumer: number
  smodch: number
  min: number
  max: number
  riziko: boolean
}

export interface ProfilProCteni {
  oblasti: OblastProCteni[]
  casti: CastProCteni[]
  trhliny: { oblast: string; cast: string }[]
  opory: string[]
  priority: string[]
  zlomy: string[]
  nalezy: { kod: string; sila: "vysoka" | "stredni"; oblasti: string[] }[]
  pozvano: number
  odevzdano: number
  zapocteno: number
  maloDat: boolean
}

/**
 * Pásmo úrovně. Hranice jsou schválně široké: rozdíl mezi 61 a 64 procenty
 * nic neznamená a report by o něm neměl psát jinak.
 */
export function urovenKlic(prumer: number): UrovenKlic {
  if (prumer < 50) return "nizka"
  if (prumer < 70) return "stredni"
  return "vysoka"
}

/**
 * Tvar rozdělení. Pořadí rozhoduje: plošná slabina je silnější zpráva než
 * cokoli o rozptylu, protože říká, že problém není v lidech.
 */
export function tvarKlic(o: OblastProCteni): TvarKlic {
  if (o.plosna) return "plosna"
  if (o.rozkol) return "zlom"
  if (o.rozptyl) return "rozptyl"
  return "vyrovnana"
}

export interface FazePlanu {
  poradi: 1 | 2 | 3
  odTydne: number
  doTydne: number
  nazev: string
  oblast: DimensionId | null
  nazevOblasti: string
  duvod: string
  kroky: string[]
  znaky: string[]
}

const jeOblast = (x: string): x is DimensionId => "ABCDEFG".includes(x) && x.length === 1

/**
 * Plán na dvanáct týdnů.
 *
 * Vybírá se to, co nejvíc omezuje všechno ostatní. Zlomová linie je první,
 * protože dokud tým drží dvě skupiny, nemá plošné opatření komu pomoct.
 * Potom plošná slabina, protože ta se mění nejrychleji. Teprve pak nejnižší
 * oblast. Poslední fáze nepřidává nic nového; ověřuje pod zátěží to, co se
 * postavilo, protože dovednost, která neprošla tlakem, v zápase není.
 */
export function sestavPlan(profil: ProfilProCteni, lang: TymLang): FazePlanu[] {
  const r = RAMEC[lang]
  const t = TYM[lang]
  const podleId = new Map(profil.oblasti.map((o) => [o.id, o]))
  const nazev = (id: string) => t.oblasti[id as DimensionId] ?? id

  const serazene = [...profil.oblasti].sort((a, b) => a.prumer - b.prumer)
  const pouzite = new Set<string>()

  const vezmi = (kandidati: (OblastProCteni | undefined)[]): OblastProCteni | null => {
    for (const k of kandidati) if (k && !pouzite.has(k.id)) return k
    return null
  }

  // ---- fáze 1 ----
  // Když se tým dělí ve víc oblastech, bere se ta nejníž položená. Pořadí
  // písmen je dané strukturou dotazníku a o naléhavosti neříká nic.
  const zlom = profil.zlomy
    .map((id) => podleId.get(id))
    .filter((o): o is OblastProCteni => o !== undefined)
    .sort((a, b) => a.prumer - b.prumer)[0]
  const plosna = serazene.find((o) => o.plosna)
  const prvni = vezmi([zlom, plosna, serazene[0]])
  if (prvni) pouzite.add(prvni.id)

  // ---- fáze 2 ----
  const druha = vezmi([
    ...profil.priority.map((id) => podleId.get(id)),
    ...serazene,
  ])
  if (druha) pouzite.add(druha.id)

  // ---- fáze 3 ----
  const oporaId = profil.opory[0]
  const opora = oporaId ? podleId.get(oporaId) : undefined
  const treti = druha ?? prvni

  const duvodPrvni = (o: OblastProCteni): string => {
    if (o.rozkol) return r.fazeDuvod.zlom(nazev(o.id))
    if (o.plosna) return r.fazeDuvod.plosna(nazev(o.id))
    return r.fazeDuvod.nejnizsi(nazev(o.id))
  }

  const faze: FazePlanu[] = []
  const pridej = (
    poradi: 1 | 2 | 3,
    odTydne: number,
    o: OblastProCteni | null,
    duvod: string,
  ) => {
    const id = o && jeOblast(o.id) ? o.id : null
    faze.push({
      poradi,
      odTydne,
      doTydne: odTydne + 3,
      nazev: r.fazeNazvy[poradi - 1],
      oblast: id,
      nazevOblasti: o ? nazev(o.id) : "",
      duvod,
      kroky: id ? VYKLAD[lang][id].prace : [],
      znaky: id ? VYKLAD[lang][id].znaky : [],
    })
  }

  if (prvni) pridej(1, 1, prvni, duvodPrvni(prvni))
  if (druha) {
    pridej(
      2,
      5,
      druha,
      druha.plosna ? r.fazeDuvod.plosna(nazev(druha.id)) : r.fazeDuvod.nejnizsi(nazev(druha.id)),
    )
  }
  if (treti) {
    const duvod =
      r.fazeDuvod.upevneni(nazev(treti.id)) + (opora ? ` ${r.fazeDuvod.opora(nazev(opora.id))}` : "")
    pridej(3, 9, treti, duvod)
  }
  return faze
}

/**
 * Kolik oblastí dostane v přehledu vlastní kroky navíc k plánu.
 *
 * Bez stropu by tým, který se rozchází ve všech sedmi oblastech, dostal
 * jedenadvacet doporučení a kouč by nezačal ani u jednoho. Report má
 * upřednostňovat; to je jeho práce, ne práce čtenáře.
 */
const NEJVIC_S_PRACI = 3

/** Kolik položek nejvíc unese shrnutí na první straně, než přestane shrnovat. */
const NEJVIC_VE_SHRNUTI = 3

/** Nejnaléhavější oblasti mimo plán, kterým se v přehledu ukážou i kroky. */
export function oblastiSPraci(profil: ProfilProCteni, vPlanu: Set<string>): Set<string> {
  const kandidati = profil.oblasti
    .filter((o) => !vPlanu.has(o.id) && potrebujePraci(o))
    .sort((a, b) => a.prumer - b.prumer)
    .slice(0, NEJVIC_S_PRACI)
  return new Set(kandidati.map((o) => o.id))
}

/**
 * Oblast, u které má smysl předepisovat práci: je nízko, nebo se v ní tým
 * rozchází. Vyrovnaná oblast na dobré úrovni intervenci nepotřebuje a report
 * by ji neměl vymýšlet.
 */
export function potrebujePraci(o: OblastProCteni): boolean {
  return o.plosna || o.rozkol || o.rozptyl || o.prumer < 65
}

/** Kolik oblastí nabídne otázky do rozhovoru. Víc než čtyři nikdo neodpracuje. */
const NEJVIC_OTAZEK = 4

/** Oblasti, ke kterým se nabízejí otázky do individuálního rozhovoru. */
export function oblastiKOtazkam(profil: ProfilProCteni): string[] {
  const potrebne = profil.oblasti
    .filter(potrebujePraci)
    .sort((a, b) => a.prumer - b.prumer)
    .slice(0, NEJVIC_OTAZEK)
  const vybrane = potrebne.length ? potrebne : profil.oblasti.slice(0, NEJVIC_OTAZEK)
  // Zpátky do pořadí dotazníku, ať report nečte jako žebříček nejhorších.
  const vybraneId = new Set(vybrane.map((o) => o.id))
  return profil.oblasti.filter((o) => vybraneId.has(o.id)).map((o) => o.id)
}

export interface Shrnuti {
  /** oblasti, o které se dá opřít, i s důvodem proč */
  drzi: string[]
  /** co je křehké a proč právě to */
  krehke: string[]
  /** jedna věta o tom, čím začít */
  prvniKrok: string
}

/** Shrnutí na první stranu. Skládá se ze stejných dat jako zbytek reportu. */
export function sestavShrnuti(profil: ProfilProCteni, lang: TymLang): Shrnuti {
  const r = RAMEC[lang]
  const t = TYM[lang]
  const podleId = new Map(profil.oblasti.map((o) => [o.id, o]))
  const nazev = (id: string) => t.oblasti[id as DimensionId] ?? id

  const drzi = profil.opory.slice(0, NEJVIC_VE_SHRNUTI).map((id) => {
    const o = podleId.get(id)
    const u = o ? VYKLAD[lang][id as DimensionId].uroven[urovenKlic(o.prumer)] : ""
    return `${nazev(id)}. ${u}`
  })

  // Křehké je to, co je nízko, a k tomu všechno, kde se tým dělí. Rozdělená
  // oblast patří do shrnutí i tehdy, když je průměr v pořádku: průměr o ní
  // totiž nic neřekne a pod tlakem je právě ona to první, co povolí.
  // Shrnutí, které vyjmenuje všechno, není shrnutí. Když se tým rozchází ve
  // víc oblastech, dostanou se sem ty nejnaléhavější a zbytek je o kus dál
  // v přehledu oblastí.
  const prumery = new Map(profil.oblasti.map((o) => [o.id, o.prumer]))
  const krehkeIds = [...new Set([...profil.priority, ...profil.zlomy])]
    .sort((a, b) => (prumery.get(a) ?? 100) - (prumery.get(b) ?? 100))
    .slice(0, NEJVIC_VE_SHRNUTI)
  const krehke = krehkeIds.map((id) => {
    const o = podleId.get(id)
    if (!o) return nazev(id)
    const v = VYKLAD[lang][id as DimensionId]
    const tvar = tvarKlic(o)
    const doplnek = tvar === "vyrovnana" ? v.uroven[urovenKlic(o.prumer)] : v.tvar[tvar]
    return `${nazev(id)}. ${doplnek}`
  })

  const plan = sestavPlan(profil, lang)
  const prvniKrok = plan.length
    ? `${plan[0].duvod} ${plan[0].kroky[0] ?? ""}`.trim()
    : r.nicKrehke

  return {
    drzi: drzi.length ? drzi : [r.nicDrzi],
    krehke: krehke.length ? krehke : [r.nicKrehke],
    prvniKrok,
  }
}
