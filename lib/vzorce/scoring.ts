import { MIN_POKRYTI, POCET_POLOZEK, SILNYCH_PRO_SITUACNI, VZORCE, pasmoProSkore } from "./structure"
import type { OdpovediMapa, VysledekVzorcu, VzorecSkore } from "./types"

// Skórování emocionálně-destruktivních vzorců.
//
// Žádné obrácené položky: všechna tvrzení míří stejným směrem, vyšší číslo
// znamená silnější aktivaci. Skóre vzorce je prostý součet deseti odpovědí.

/**
 * Skóre jednoho vzorce.
 *
 * Chybějící odpověď se nepočítá jako nula, ale dopočte se z průměru
 * zodpovězených, jinak by nula srazila skóre pod minimum škály. Když chybí
 * víc než pětina položek, skóre se nevykazuje vůbec.
 */
function skoreVzorce(polozky: number[], odpovedi: OdpovediMapa): Omit<VzorecSkore, "id"> {
  const hodnoty: number[] = []
  const silnePolozky: number[] = []
  for (const p of polozky) {
    const o = odpovedi[p]
    if (o === undefined) continue
    hodnoty.push(o)
    if (o >= 5) silnePolozky.push(p)
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
    pasmo: pasmoProSkore(skore),
    silnychOdpovedi: silnePolozky.length,
    silnePolozky,
    zodpovezeno,
    celkem,
    vykazuje: zodpovezeno / celkem >= MIN_POKRYTI,
  }
}

export function vyhodnot(odpovedi: OdpovediMapa, dobaSek?: number): VysledekVzorcu {
  const vsechny: VzorecSkore[] = VZORCE.map((v) => ({
    id: v.id,
    ...skoreVzorce(v.polozky, odpovedi),
  }))

  // Řazení: nejdřív skóre, při shodě rozhoduje počet silných odpovědí, pak
  // pořadí v dotazníku, ať je výsledek při stejných číslech vždy stejný.
  const serazene = [...vsechny].sort(
    (a, b) => b.skore - a.skore || b.silnychOdpovedi - a.silnychOdpovedi || a.id.localeCompare(b.id),
  )
  const vykazatelne = serazene.filter((v) => v.vykazuje)
  const top3 = vykazatelne.slice(0, 3)
  const vBoji = new Set(top3.map((v) => v.id))

  // Vzorce mimo trojici, kde přesto svítí jednotlivé silné odpovědi. Zdroj na
  // ně výslovně upozorňuje: říkají něco i tehdy, když součet vysoký není.
  const situacni = vykazatelne.filter(
    (v) => !vBoji.has(v.id) && v.silnychOdpovedi >= SILNYCH_PRO_SITUACNI,
  )

  const zodpovezeno = Array.from({ length: POCET_POLOZEK }, (_, i) => odpovedi[i + 1]).filter(
    (o) => o !== undefined,
  ).length

  return {
    vsechny: serazene,
    top3,
    situacni,
    zodpovezeno,
    kompletni: zodpovezeno === POCET_POLOZEK,
    dobaSek,
  }
}

/** Kontrola integrity: každá položka právě jednou, dohromady 110. */
export function kontrolaStruktury(): { ok: boolean; problemy: string[] } {
  const problemy: string[] = []
  const videno = new Set<number>()
  for (const v of VZORCE) {
    if (v.polozky.length !== 10) problemy.push(`Vzorec ${v.id} má ${v.polozky.length} položek místo 10`)
    for (const p of v.polozky) {
      if (videno.has(p)) problemy.push(`Položka ${p} je použitá víckrát`)
      videno.add(p)
    }
  }
  for (let i = 1; i <= POCET_POLOZEK; i++) if (!videno.has(i)) problemy.push(`Chybí položka ${i}`)
  return { ok: problemy.length === 0, problemy }
}
