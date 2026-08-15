import { ARCHETYPY, POCET_POLOZEK } from "./structure"
import type {
  ArchetypSkore,
  Motivace,
  OdpovediMapa,
  Vyhraneni,
  VysledekArchetypu,
} from "./types"

// Skórování archetypů.
//
// Žádné obrácené položky: všechna tvrzení míří stejným směrem, vyšší číslo
// znamená silnější rezonanci. Skóre archetypu je prostý součet osmi odpovědí.
// Stejná pravidla pro chybějící odpovědi jako u vzorců: dopočet z průměru
// zodpovězených, pod 80 % pokrytí se archetyp nevykazuje.

/** Minimální podíl zodpovězených položek, aby se skóre archetypu vykázalo. */
export const MIN_POKRYTI = 0.8

/**
 * Hranice vyhranění v bodech odstupu prvního od druhého.
 *
 * Na škále 8-48 znamená šest bodů zhruba tři čtvrtě stupně odpovědi na
 * každé položce, to už je jednoznačná identita. Do dvou bodů jde o dvojici,
 * kterou nemá smysl násilně rozsekávat na první a druhé místo.
 */
const ODSTUP_VYHRANENY = 6
const ODSTUP_TESNY = 2

function skoreArchetypu(polozky: number[], odpovedi: OdpovediMapa): Omit<ArchetypSkore, "id"> {
  const hodnoty: number[] = []
  let silnych = 0
  for (const p of polozky) {
    const o = odpovedi[p]
    if (o === undefined) continue
    hodnoty.push(o)
    if (o >= 5) silnych++
  }
  const celkem = polozky.length
  const zodpovezeno = hodnoty.length
  const min = celkem
  const max = celkem * 6
  const skore =
    zodpovezeno === 0 ? min : Math.round((hodnoty.reduce((a, b) => a + b, 0) / zodpovezeno) * celkem)
  return {
    skore,
    min,
    max,
    procenta: Math.round(((skore - min) / (max - min)) * 1000) / 10,
    silnychOdpovedi: silnych,
    zodpovezeno,
    celkem,
    vykazuje: zodpovezeno / celkem >= MIN_POKRYTI,
  }
}

export function vyhodnotArchetypy(odpovedi: OdpovediMapa, dobaSek?: number): VysledekArchetypu {
  const vsechny: ArchetypSkore[] = ARCHETYPY.map((a) => ({
    id: a.id,
    ...skoreArchetypu(a.polozky, odpovedi),
  }))

  // Řazení: skóre, při shodě počet silných odpovědí, pak pořadí v registru,
  // ať je výsledek při stejných číslech vždy stejný.
  const poradi = new Map(ARCHETYPY.map((a, i) => [a.id, i]))
  const serazene = [...vsechny].sort(
    (a, b) =>
      b.skore - a.skore ||
      b.silnychOdpovedi - a.silnychOdpovedi ||
      poradi.get(a.id)! - poradi.get(b.id)!,
  )
  const vykazatelne = serazene.filter((a) => a.vykazuje)
  const pouzitelne = vykazatelne.length >= 2 ? vykazatelne : serazene

  const primarni = pouzitelne[0]
  const sekundarni = pouzitelne[1]
  const potlaceny = pouzitelne[pouzitelne.length - 1]
  const odstup = primarni.skore - sekundarni.skore
  const vyhraneni: Vyhraneni =
    odstup >= ODSTUP_VYHRANENY ? "vyhraneny" : odstup <= ODSTUP_TESNY ? "tesny" : "zretelny"

  const motivace = {} as Record<Motivace, number>
  for (const m of ["nezavislost", "mistrovstvi", "sounalezitost", "rad"] as Motivace[]) {
    const clenove = vsechny.filter((s) => ARCHETYPY.find((a) => a.id === s.id)!.motivace === m)
    motivace[m] = Math.round((clenove.reduce((a, b) => a + b.procenta, 0) / clenove.length) * 10) / 10
  }

  const zodpovezeno = Array.from({ length: POCET_POLOZEK }, (_, i) => odpovedi[i + 1]).filter(
    (o) => o !== undefined,
  ).length

  return {
    vsechny: serazene,
    primarni,
    sekundarni,
    potlaceny,
    odstup,
    vyhraneni,
    motivace,
    zodpovezeno,
    kompletni: zodpovezeno === POCET_POLOZEK,
    dobaSek,
  }
}

/** Kontrola integrity: každá položka právě jednou, dohromady 96. */
export function kontrolaStruktury(): { ok: boolean; problemy: string[] } {
  const problemy: string[] = []
  const videno = new Set<number>()
  for (const a of ARCHETYPY) {
    if (a.polozky.length !== 8) problemy.push(`Archetyp ${a.id} má ${a.polozky.length} položek místo 8`)
    for (const p of a.polozky) {
      if (videno.has(p)) problemy.push(`Položka ${p} je použitá víckrát`)
      videno.add(p)
    }
  }
  for (let i = 1; i <= POCET_POLOZEK; i++) if (!videno.has(i)) problemy.push(`Chybí položka ${i}`)
  return { ok: problemy.length === 0, problemy }
}
