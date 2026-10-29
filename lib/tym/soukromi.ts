import type { DiagnosticResult } from "../diagnostic/types"
import { tymovyProfil } from "./agregace"
import { MIN_V_PROFILU, SKUPINA_SKRYTYCH } from "./prahy"
import type { CastProfil, OblastProfil, TymovyProfil } from "./typy"

// Týmový profil tak, aby z něj nešel dopočítat jednotlivec.
//
// Hráč, který výsledky nesdílí, má slíbeno, že je kouč neuvidí a do profilu
// týmu vstoupí anonymně. Přesný průměr ale anonymní není: kouč zná výsledky
// hráčů, kteří sdílejí, odečte je od součtu a zbude mu ten jeden, kdo
// nesdílel, na desetinu bodu přesně. Stejně funguje porovnání profilu před
// jedním odevzdáním a po něm. Minimum a maximum oblasti prozradí rovnou celé
// skóre jednoho hráče.
//
// Proto platí tři pravidla:
//
//   1) Vyplnění, která prohlížející nevidí jednotlivě, vstupují do profilu po
//      trojicích, od nejstarších. Odečtením se pak dá zjistit nanejvýš součet
//      tří lidí, nikdy jeden člověk. Ani srovnání dvou snímků profilu nic
//      nového neprozradí, protože se profil mění vždy o celou trojici.
//   2) Pod pěti započtenými vyplněními se profil nevrací vůbec.
//   3) Ven jdou zaokrouhlená čísla a bez minima a maxima.
//
// Kdo je „viditelný", rozhoduje server podle toho, kdo se dívá: kouči týmu
// hráči, kteří sdílení povolili; masterovi nikdo, protože do vyplnění hráčů
// nevidí ani u těch, kteří sdílejí.

export { MIN_V_PROFILU, SKUPINA_SKRYTYCH }

export interface VyplneniProProfil {
  vysledek: DiagnosticResult
  /** prohlížející toto vyplnění vidí jednotlivě, takže z profilu nic nového nezjistí */
  viditelne: boolean
  /** čas odevzdání; trojice se skládají od nejstarších, ať je výběr stálý */
  odevzdano: number
}

/** Oblast bez minima a maxima, se zaokrouhlenými čísly. */
export type OblastProKouce = Omit<OblastProfil, "min" | "max">
export type CastProKouce = Omit<CastProfil, "min" | "max">

export interface ProfilProKouce extends Omit<TymovyProfil, "oblasti" | "casti"> {
  oblasti: OblastProKouce[]
  casti: CastProKouce[]
  /** platných vyplnění, která čekají na doplnění trojice */
  vynechano: number
  /**
   * Započtených je méně než MIN_V_PROFILU a profil je prázdný. `zapocteno`
   * pak říká, kolik by se jich započítalo, aby kouč věděl, kolik chybí.
   */
  zamceno: boolean
}

/** Které platné vyplnění do profilu vstoupí a kolik jich zatím čeká. */
export function vyberDoProfilu(platna: VyplneniProProfil[]): { zahrnuta: DiagnosticResult[]; vynechano: number } {
  const viditelna = platna.filter((v) => v.viditelne)
  const skryta = platna.filter((v) => !v.viditelne).sort((a, b) => a.odevzdano - b.odevzdano)
  const kolik = Math.floor(skryta.length / SKUPINA_SKRYTYCH) * SKUPINA_SKRYTYCH
  return {
    zahrnuta: [...viditelna, ...skryta.slice(0, kolik)].map((v) => v.vysledek),
    vynechano: skryta.length - kolik,
  }
}

const cele = (x: number) => Math.round(x)

/**
 * Profil týmu pro kouče nebo mastera.
 *
 * Neplatná vyplnění se vyřadí dřív, než se skládají trojice. Kdyby se
 * vyřazovala až potom, rozpadla by se trojice na dvojici a pravidlo by
 * neplatilo.
 */
export function profilProKouce(
  nazev: string,
  pozvano: number,
  odevzdano: number,
  vsechna: VyplneniProProfil[],
): ProfilProKouce {
  const platna = vsechna.filter((v) => v.vysledek.validity.overall !== "invalid")
  const { zahrnuta, vynechano } = vyberDoProfilu(platna)
  const zamceno = zahrnuta.length < MIN_V_PROFILU
  const p = tymovyProfil(nazev, pozvano, odevzdano, zamceno ? [] : zahrnuta)
  return {
    ...p,
    zapocteno: zahrnuta.length,
    oblasti: p.oblasti.map(({ min: _min, max: _max, ...o }) => ({
      ...o,
      prumer: cele(o.prumer),
      smodch: cele(o.smodch),
    })),
    casti: p.casti.map(({ min: _min, max: _max, ...c }) => ({
      ...c,
      prumer: cele(c.prumer),
      smodch: cele(c.smodch),
    })),
    vynechano,
    zamceno,
  }
}
