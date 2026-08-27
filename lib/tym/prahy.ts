import type { BandKey } from "../diagnostic/types"

// Prahy týmového vyhodnocení.
//
// Stojí to zvlášť, protože do téhle chvíle měl každý kus reportu vlastní čísla
// a navzájem si odporovala. Oblast s číslem 63 se v jednom místě jmenovala
// „průměrná", jinde dostala výklad pro střední úroveň a v nálezech se počítala
// jako vysoká. Trenér tak v jednom dokumentu četl o téže věci tři různé věty.
//
// ODKUD SE ČÍSLA BEROU. Ne z odhadu, ale z testu. Elite200 má u oblastí rozsah
// 24 až 120 bodů a pásma 24–54 / 55–82 / 83–102 / 103–120; přepočteno na
// procenta to dělá hranice 31,2, 61,5 a 82,3. U částí je rozsah 8 až 40 bodů
// a pásma 8–18 / 19–27 / 28–34 / 35–40, tedy 31,2, 62,5 a 84,4. Že to sedí,
// hlídá scripts/test-tym.cjs proti skutečné struktuře testu; kdyby někdo
// pásma v testu posunul a zapomněl na tuhle tabulku, test spadne.
//
// PROČ SE TÝM NEHODNOTÍ PODLE PRŮMĚRU. Průměr je jedno číslo za skupinu a umí
// zakrýt, že polovina kádru je v rozvojové prioritě. Test měří jednotlivce,
// takže se úroveň týmu čte z toho, kolik hráčů je v kterém pásmu. Tým je
// silný tehdy, když je silná většina a zároveň nikdo nepropadá, ne když
// mu vyjde hezký průměr.

/** Hranice pásem oblasti v procentech, odvozené z elite200. */
export const PASMO_OBLASTI = { priorita: 31.2, silne: 61.5, spicka: 82.3 }

/** Hranice pásem části v procentech, odvozené z elite200. */
export const PASMO_CASTI = { priorita: 31.2, silne: 62.5, spicka: 84.4 }

/**
 * Úroveň oblasti v týmu.
 *
 * Čtyři stupně jako pásma testu, jen řečené o skupině. Používá je report,
 * mapa, plán i seznamy opor a priorit, takže se nemají jak rozejít.
 */
export type UrovenTymu = "spicka" | "silne" | "prumerne" | "potrebuje-praci"

/** Podíly kádru v jednotlivých pásmech. Na nich stojí všechno ostatní. */
export interface Podily {
  /** silné a špičkové dohromady */
  silni: number
  /** v rozvojové prioritě, tedy v nejnižším pásmu testu */
  priority: number
  /** cokoli pod pásmem „silné" */
  podPrahem: number
}

export function podily(pasma: Record<BandKey, number>): Podily {
  const n = Math.max(1, pasma.priority + pasma.stabilization + pasma.strong + pasma.elite)
  return {
    silni: (pasma.strong + pasma.elite) / n,
    priority: pasma.priority / n,
    podPrahem: (pasma.priority + pasma.stabilization) / n,
  }
}

/**
 * Úroveň oblasti z rozdělení kádru po pásmech.
 *
 * Je to přísnější než dřívější prahy na průměru, a schválně. Aby se oblast
 * jmenovala silnou, musí být v silném pásmu aspoň šest hráčů z deseti a zároveň
 * v ní skoro nikdo nepropadat. Jeden hráč v rozvojové prioritě u desetičlenného
 * týmu ještě projde, dva už ne: dva slabé články v jedné oblasti nejsou
 * výjimka, to je stav. Půl na půl silní a stabilizace je průměr, ne opora –
 * o něco, kde je polovina kádru „drží to v klidu, pod tlakem ne", se nelze
 * opřít zrovna ve chvíli, kdy je zle.
 */
export function urovenTymu(pasma: Record<BandKey, number>): UrovenTymu {
  const p = podily(pasma)
  // Pořadí rozhoduje: propadlíci mají přednost před vším ostatním. Šest
  // silných hráčů neudělá ze slabé oblasti silnou, když jsou pod nimi dva,
  // kteří ji v zápase stejně otevřou.
  if (p.priority >= 0.2 || p.podPrahem >= 0.7) return "potrebuje-praci"
  if (p.silni >= 0.8 && p.priority === 0) return "spicka"
  if (p.silni >= 0.6 && p.priority <= 0.1) return "silne"
  return "prumerne"
}

/** Pořadí od nejhoršího k nejlepšímu. Používá se k řazení, ne k počítání. */
export const PORADI_UROVNI: UrovenTymu[] = ["potrebuje-praci", "prumerne", "silne", "spicka"]

export const jeSilna = (u: UrovenTymu) => u === "silne" || u === "spicka"
export const jeSlaba = (u: UrovenTymu) => u === "potrebuje-praci"
