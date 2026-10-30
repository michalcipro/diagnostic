import { hraniceVProcentech } from "../diagnostic/normy"
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

/**
 * Pevné hranice pásem oblasti v procentech, odvozené z elite200.
 *
 * Od norem (lib/diagnostic/normy.ts) se pásmo hráče čte z toho, kde stojí
 * mezi sportovci, a hranice má každá oblast i část jinou. Tyhle pevné
 * hranice zůstávají jen jako záloha pro škálu bez normy; ve výpočtech se
 * bere `hraniceSilne`.
 */
export const PASMO_OBLASTI = { priorita: 31.2, silne: 61.5, spicka: 82.3 }

/** Pevné hranice pásem části v procentech, odvozené z elite200; záloha jako výš. */
export const PASMO_CASTI = { priorita: 31.2, silne: 62.5, spicka: 84.4 }

/**
 * Hranice silného pásma oblasti nebo části v procentech škály: medián
 * sportovců podle normy. Oblasti nejsou stejně těžké, takže u Koncentrace
 * leží kolem 60 a u Odolnosti kolem 75.
 */
export function hraniceSilne(id: string): number {
  return hraniceVProcentech("elite200", id)?.silne ?? (id.length === 1 ? PASMO_OBLASTI.silne : PASMO_CASTI.silne)
}

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
  /** jen špičkové pásmo testu */
  elite: number
}

export function podily(pasma: Record<BandKey, number>): Podily {
  const n = Math.max(1, pasma.priority + pasma.stabilization + pasma.strong + pasma.elite)
  return {
    silni: (pasma.strong + pasma.elite) / n,
    priority: pasma.priority / n,
    podPrahem: (pasma.priority + pasma.stabilization) / n,
    elite: pasma.elite / n,
  }
}

/**
 * Kolik kádru musí být ve špičkovém pásmu testu, aby se oblast jmenovala
 * špičkovou. Dřív stačilo osm silných z deseti, takže deset hráčů v silném
 * pásmu a nikdo ve špičkovém vyšlo jako „špičkové" hned pod legendou, která
 * špičku kreslí nad 82 body.
 */
export const PODIL_SPICKA = 0.3

// ---------------------------------------------------------------------------
// Rozptyl: jedna stupnice pro celý report
//
// Slova u oblasti („jednotné", „velké rozdíly"), mapa, plošná slabina i velký
// rozptyl dřív počítaly každé s vlastními hranicemi (9, 12, 15, 18, 19), a tak
// o téže oblasti stálo „silné, velké rozdíly" a o řádek níž „v týmu podobné".
// Teď jsou hranice dvě a čtou je všichni.
// ---------------------------------------------------------------------------

/** Směrodatná odchylka v bodech, pod kterou jsou na tom hráči podobně. */
export const SD_SHODA = 12

/** Od téhle odchylky se hráči liší výrazně: velký rozptyl oblasti, rozchod v části. */
export const SD_ROZDILNE = 18

/** O kolik bodů musí být část pod svojí oblastí, aby to byla skrytá trhlina. */
export const TRHLINA_ROZDIL_U = 6

/** Nebo o kolik bodů odchylky musí být rozkolísanější než oblast. */
export const TRHLINA_ROZDIL_SD = 8

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
  if (p.silni >= 0.8 && p.priority === 0 && p.elite >= PODIL_SPICKA) return "spicka"
  if (p.silni >= 0.6 && p.priority <= 0.1) return "silne"
  return "prumerne"
}

/** Pořadí od nejhoršího k nejlepšímu. Používá se k řazení, ne k počítání. */
export const PORADI_UROVNI: UrovenTymu[] = ["potrebuje-praci", "prumerne", "silne", "spicka"]

export const jeSilna = (u: UrovenTymu) => u === "silne" || u === "spicka"
export const jeSlaba = (u: UrovenTymu) => u === "potrebuje-praci"

/**
 * Pod tolik započtenými vyplněními se profil týmu neukazuje. Proč, viz
 * lib/tym/soukromi.ts; tady je kvůli obrazovce, která to kouči vysvětluje
 * a do souboru s agregací sahat nemá.
 */
export const MIN_V_PROFILU = 5

/** Po kolika vstupují do profilu vyplnění, která prohlížející nevidí jednotlivě. */
export const SKUPINA_SKRYTYCH = 3
