import type { BandKey, TestModel } from "./types"

// Normy ELITE: s kým se klient srovnává.
//
// Do října 2026 se pásma četla z pevných hranic na škále (silné od průměrné
// odpovědi 3,46). Typický klient ale odpovídá kolem 3,7, takže silných vyšly
// dvě třetiny všech oblastí a třetina klientů neměla v reportu nic, na čem
// pracovat. Pásma proto teď říkají, kde klient stojí mezi sportovci, kteří
// ELITE vyplnili:
//
//   rozvojová priorita   spodních 20 %
//   stabilizace          20 až 50 %
//   silné                50 až 85 %, tedy nad mediánem
//   špičkové             horních 15 %
//
// ODKUD. Anonymní vzorek z aplikace (normSamples), 47 úplných vyplnění
// ELITE 200 z července až října 2026: 36 sportovní verze, 11 byznysové.
// Platných bylo všech 47. Pro každou oblast a fazetu je tu průměr
// a směrodatná odchylka průměrné odpovědi na položku po otočení obrácených
// položek (škála 1 až 5).
//
// JAK. Percentil se počítá z normálního rozdělení s tímto průměrem
// a odchylkou, ne z pořadí ve vzorku. U 47 lidí by se krajní percentily
// z pořadí hýbaly s každým dalším vyplněním; průměr a odchylka jsou stabilní.
// Spolehlivost oblastí (Cronbachova alfa) je ve vzorku 0,82 až 0,87, u fazet
// 0,48 až 0,83, takže pásma fazet jsou hrubší a v reportu se tak i čtou.
//
// ELITE 100 vlastní normy nemá (ve vzorku 5 vyplnění). Bere normy oblastí
// ELITE 200 na jednu položku: oblasti měří totéž a průměrná odpověď je na
// délce škály nezávislá.
//
// PŘEPOČET. Normy jsou zmrazené, aby se starému reportu nezměnilo pásmo pod
// rukama. Přepočítat při zhruba 150 vyplněních ELITE 200 z exportu vzorku
// (Kouč → normativní vzorek) a změnit `VERZE`.

export const VERZE_NOREM = "2026-10 (n = 47)"

/** Hranice pásem v percentilech, společné pro všechny škály. */
export const PERCENTILY_PASEM = { stabilization: 20, strong: 50, elite: 85 } as const

/** [průměr, směrodatná odchylka] průměrné odpovědi na položku */
type Norma = readonly [number, number]

const OBLASTI: Record<string, Norma> = {
  A: [3.93, 0.48],
  B: [3.46, 0.56],
  C: [3.41, 0.5],
  D: [3.46, 0.52],
  E: [4.0, 0.42],
  F: [3.71, 0.53],
  G: [3.79, 0.5],
}

const FAZETY: Record<string, Norma> = {
  A1: [4.01, 0.56],
  A2: [4.1, 0.49],
  A3: [3.69, 0.68],
  B1: [3.79, 0.67],
  B2: [3.08, 0.65],
  B3: [3.51, 0.65],
  C1: [3.51, 0.54],
  C2: [3.33, 0.62],
  C3: [3.39, 0.59],
  D1: [3.54, 0.61],
  D2: [3.2, 0.73],
  D3: [3.64, 0.6],
  E1: [4.1, 0.43],
  E2: [3.93, 0.62],
  E3: [3.99, 0.51],
  F1: [3.66, 0.49],
  F2: [3.69, 0.77],
  F3: [3.79, 0.67],
  G1: [3.81, 0.59],
  G2: [3.68, 0.6],
  G3: [3.86, 0.54],
}

/** Norma škály; oblasti mají jednopísmenné id, fazety dvoupísmenné. */
export function normaSkaly(model: TestModel, id: string): Norma | undefined {
  if (id.length === 1) return OBLASTI[id]
  return model === "elite200" ? FAZETY[id] : undefined
}

/** Distribuční funkce normovaného normálního rozdělení (Abramowitz a Stegun 7.1.26). */
function phi(z: number): number {
  const t = 1 / (1 + 0.3275911 * (Math.abs(z) / Math.SQRT2))
  const y =
    1 -
    ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) *
      t *
      Math.exp(-(z * z) / 2)
  return z >= 0 ? (1 + y) / 2 : (1 - y) / 2
}

/** Kvantil normovaného normálního rozdělení pro hranice pásem. */
const Z_PASEM = { stabilization: -0.8416, strong: 0, elite: 1.0364 } as const

/**
 * Percentil skóre ve srovnání s normou, 0 až 100 s desetinami.
 * `prumerNaPolozku` je průměrná odpověď po otočení obrácených položek.
 */
export function percentilZNormy(norma: Norma, prumerNaPolozku: number): number {
  const [m, s] = norma
  return Math.round(phi((prumerNaPolozku - m) / s) * 1000) / 10
}

/** Pásmo podle percentilu. */
export function pasmoZPercentilu(p: number): BandKey {
  if (p < PERCENTILY_PASEM.stabilization) return "priority"
  if (p < PERCENTILY_PASEM.strong) return "stabilization"
  if (p < PERCENTILY_PASEM.elite) return "strong"
  return "elite"
}

/**
 * Hranice pásem škály v procentech jejího rozsahu (0 = samé jedničky,
 * 100 = samé pětky). Potřebuje je týmová mapa a týmové nálezy, které počítají
 * s procenty, ne s percentily: rozptyl a mezery mezi hráči se tam měří
 * v bodech škály.
 */
export function hraniceVProcentech(
  model: TestModel,
  id: string,
): { priorita: number; silne: number; spicka: number } | undefined {
  const n = normaSkaly(model, id)
  if (!n) return undefined
  const [m, s] = n
  const pr = (z: number) => Math.round(((m + z * s - 1) / 4) * 1000) / 10
  return { priorita: pr(Z_PASEM.stabilization), silne: pr(Z_PASEM.strong), spicka: pr(Z_PASEM.elite) }
}
