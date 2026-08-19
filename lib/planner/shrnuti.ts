import type { Gender, Lang } from "@/lib/diagnostic/types"
import { applyGender } from "@/lib/diagnostic/gender"
import { NAZVY_DNU } from "./datum"
import { NAZVY_METRIK, cislo } from "./i18n"
import { METRIKY_SKALA, type MetricKey } from "./types"
import type { Statistika } from "./stats"

// Shrnutí statistiky běžnou řečí.
//
// Tabulka průměrů řekne, co se stalo. Neřekne, co s tím. Tohle je ta druhá
// část: pár vět, kterým rozumí člověk bez čísel, a na konci jeden konkrétní
// krok. Píše se stejně jako vyhodnocení diagnostiky, tedy včetně rodových
// tvarů zapsaných značkou {mužský|ženský}.
//
// Zásada, na které to stojí: netvrdit nic, co v datech není. Každá věta má
// podmínku, za které se vůbec vypíše. Když je dat málo, vrátí se míň vět,
// ne vata.

export type Obdobi = "tyden" | "mesic" | "rok"

/** Kolik dnů musí být vyplněných, aby se o ukazatelích dalo mluvit. */
const PRAH_DNU: Record<Obdobi, number> = { tyden: 3, mesic: 8, rok: 30 }

interface Slova {
  obdobi: Record<Obdobi, string>
  malo: string
  vyplneno: (vyplnenych: number, celkem: number, obdobi: string) => string
  serie: (dnu: number) => string
  bezSerie: string
  navykyCelkem: (procent: number) => string
  navykNejlepsi: (nazev: string, splneno: number, moznych: number) => string
  navykNejhorsi: (nazev: string, splneno: number, moznych: number) => string
  navykySerie: (nazev: string, dnu: number) => string
  ukazatele: (nej: string, nejH: string, slab: string, slabH: string) => string
  zmenaNahoru: (o: string) => string
  zmenaDolu: (o: string) => string
  zmenaZadna: string
  spanek: (hodin: string) => string
  spanekMalo: (hodin: string) => string
  denSlaby: (den: string) => string
  vliv: (navyk: string, ukazatel: string, o: string) => string
  vlivZaporny: (navyk: string, ukazatel: string, o: string) => string
  krokNavyk: (nazev: string) => string
  krokZapis: string
  krokDrz: string
  reflexeMalo: string
}

const SLOVA: Record<Lang, Slova> = {
  cs: {
    obdobi: { tyden: "tenhle týden", mesic: "tenhle měsíc", rok: "tenhle rok" },
    malo: "Zatím je zapsaných málo dnů na to, aby čísla něco znamenala. Nejde o chybu, jen o to, že statistika potřebuje pár týdnů dat.",
    vyplneno: (v, c, o) => `Za ${o} máš vyplněných ${v} z ${c} dnů.`,
    serie: (d) =>
      d === 1
        ? "Deník máš zapsaný i dneska."
        : `Deník si {vedl|vedla} ${d} ${d < 5 ? "dny" : "dnů"} v řadě.`,
    bezSerie:
      "Sérii jsi {přerušil|přerušila}, poslední dny zůstaly prázdné. Nic tím není ztracené, jen se začíná znovu.",
    navykyCelkem: (p) => `Návyky ti vyšly na ${p} %.`,
    navykNejlepsi: (n, s, m) => `Nejlíp drží „${n}" (${s} z ${m}).`,
    navykNejhorsi: (n, s, m) => `Nejhůř dopadl „${n}" (${s} z ${m}).`,
    navykySerie: (n, d) => `U návyku „${n}" jedeš ${d} ${d < 5 ? "dny" : "dnů"} v kuse.`,
    ukazatele: (nej, nejH, slab, slabH) =>
      `Nejsilnější je ${nej} (${nejH}), nejslabší ${slab} (${slabH}).`,
    zmenaNahoru: (o) => `Proti minulému období jsi {šel|šla} nahoru o ${o}.`,
    zmenaDolu: (o) => `Proti minulému období jsi {šel|šla} dolů o ${o}.`,
    zmenaZadna: "Proti minulému období je to prakticky stejné.",
    spanek: (h) => `Spíš v průměru ${h} hodiny.`,
    spanekMalo: (h) =>
      `Spíš v průměru ${h} hodiny, což je pod hranicí, od které jde výkon dolů, aniž si toho člověk všimne.`,
    denSlaby: (d) =>
      `Nejslabší den v týdnu je ${d}. Když se propad opakuje na stejném dni, nejde o náladu, ale o stavbu týdne.`,
    vliv: (n, u, o) =>
      `Ve dnech, kdy máš odškrtnutý návyk „${n}", je ${u} vyšší o ${o}. Neznamená to samo o sobě, že jedno způsobuje druhé, ale stojí to za pozornost.`,
    vlivZaporny: (n, u, o) =>
      `Ve dnech s návykem „${n}" je ${u} naopak nižší o ${o}. Nejspíš si ho odškrtáváš zrovna v náročných dnech, ne že by ti škodil.`,
    krokNavyk: (n) =>
      `Na příští týden si vyber jedinou věc: „${n}". Ostatní nech běžet, jak běží, a sleduj jen tenhle jeden řádek.`,
    krokZapis:
      "První krok je zapisovat každý den, ne zapisovat dokonale. Tři čísla a jedna věta stačí, zbytek se dá doplnit.",
    krokDrz:
      "Držíš to. Nepřidávej nic nového, dokud tohle nepojede tři týdny v kuse bez přemýšlení.",
    reflexeMalo:
      "Reflexi vyplňuješ zřídka. Právě ta ale z deníku dělá deník: čísla ukážou, že byl den slabý, ale ne proč.",
  },
  en: {
    obdobi: { tyden: "this week", mesic: "this month", rok: "this year" },
    malo: "There are still too few days recorded for the numbers to mean anything. That is not a fault, statistics simply need a few weeks of data.",
    vyplneno: (v, c, o) => `You have filled in ${v} of ${c} days ${o}.`,
    serie: (d) => (d === 1 ? "Today is written down as well." : `You have kept the journal ${d} days in a row.`),
    bezSerie: "The streak is broken, the last few days are empty. Nothing is lost, it simply starts again.",
    navykyCelkem: (p) => `Your habits came out at ${p} %.`,
    navykNejlepsi: (n, s, m) => `The strongest one is "${n}" (${s} of ${m}).`,
    navykNejhorsi: (n, s, m) => `The weakest one is "${n}" (${s} of ${m}).`,
    navykySerie: (n, d) => `"${n}" is running ${d} days in a row.`,
    ukazatele: (nej, nejH, slab, slabH) =>
      `The strongest rating is ${nej} (${nejH}), the weakest ${slab} (${slabH}).`,
    zmenaNahoru: (o) => `Against the previous period you are ${o} up.`,
    zmenaDolu: (o) => `Against the previous period you are ${o} down.`,
    zmenaZadna: "Against the previous period it is practically the same.",
    spanek: (h) => `You sleep ${h} hours on average.`,
    spanekMalo: (h) =>
      `You sleep ${h} hours on average, below the line where performance drops without anyone noticing.`,
    denSlaby: (d) =>
      `The weakest weekday is ${d}. When the dip keeps landing on the same day, it is not mood, it is how the week is built.`,
    vliv: (n, u, o) =>
      `On days when "${n}" is ticked, your ${u} is higher by ${o}. That alone is not proof that one causes the other, but it is worth watching.`,
    vlivZaporny: (n, u, o) =>
      `On days with "${n}" your ${u} is lower by ${o}. Most likely you tick it precisely on demanding days, rather than it doing you harm.`,
    krokNavyk: (n) =>
      `For next week pick a single thing: "${n}". Leave the rest running as it is and watch only that one row.`,
    krokZapis:
      "The first step is writing every day, not writing perfectly. Three numbers and one sentence are enough, the rest can be filled in later.",
    krokDrz:
      "This is holding. Add nothing new until it runs three weeks in a row without you thinking about it.",
    reflexeMalo:
      "You rarely fill in the reflection. Yet that is what makes a journal a journal: numbers show that a day was weak, not why.",
  },
  sk: {
    obdobi: { tyden: "tento týždeň", mesic: "tento mesiac", rok: "tento rok" },
    malo: "Zatiaľ je zapísaných málo dní na to, aby čísla niečo znamenali. Nejde o chybu, len o to, že štatistika potrebuje pár týždňov dát.",
    vyplneno: (v, c, o) => `Za ${o} máš vyplnených ${v} zo ${c} dní.`,
    serie: (d) =>
      d === 1
        ? "Denník máš zapísaný aj dnes."
        : `Denník si {viedol|viedla} ${d} ${d < 5 ? "dni" : "dní"} v rade.`,
    bezSerie:
      "Sériu si {prerušil|prerušila}, posledné dni zostali prázdne. Nič tým nie je stratené, len sa začína znova.",
    navykyCelkem: (p) => `Návyky ti vyšli na ${p} %.`,
    navykNejlepsi: (n, s, m) => `Najlepšie drží „${n}" (${s} z ${m}).`,
    navykNejhorsi: (n, s, m) => `Najhoršie dopadol „${n}" (${s} z ${m}).`,
    navykySerie: (n, d) => `Pri návyku „${n}" ideš ${d} ${d < 5 ? "dni" : "dní"} v kuse.`,
    ukazatele: (nej, nejH, slab, slabH) =>
      `Najsilnejší je ${nej} (${nejH}), najslabší ${slab} (${slabH}).`,
    zmenaNahoru: (o) => `Oproti minulému obdobiu si {išiel|išla} nahor o ${o}.`,
    zmenaDolu: (o) => `Oproti minulému obdobiu si {išiel|išla} nadol o ${o}.`,
    zmenaZadna: "Oproti minulému obdobiu je to prakticky rovnaké.",
    spanek: (h) => `Spíš v priemere ${h} hodiny.`,
    spanekMalo: (h) =>
      `Spíš v priemere ${h} hodiny, čo je pod hranicou, od ktorej ide výkon dole bez toho, aby si to človek všimol.`,
    denSlaby: (d) =>
      `Najslabší deň v týždni je ${d}. Keď sa prepad opakuje na tom istom dni, nejde o náladu, ale o stavbu týždňa.`,
    vliv: (n, u, o) =>
      `V dňoch, keď máš odškrtnutý návyk „${n}", je ${u} vyššia o ${o}. Neznamená to samo o sebe, že jedno spôsobuje druhé, ale stojí to za pozornosť.`,
    vlivZaporny: (n, u, o) =>
      `V dňoch s návykom „${n}" je ${u} naopak nižšia o ${o}. Najskôr si ho odškrtávaš práve v náročných dňoch, nie že by ti škodil.`,
    krokNavyk: (n) =>
      `Na budúci týždeň si vyber jedinú vec: „${n}". Ostatné nechaj bežať, ako beží, a sleduj len tento jeden riadok.`,
    krokZapis:
      "Prvý krok je zapisovať každý deň, nie zapisovať dokonale. Tri čísla a jedna veta stačia, zvyšok sa dá doplniť.",
    krokDrz:
      "Držíš to. Nepridávaj nič nové, kým toto nepobeží tri týždne v kuse bez rozmýšľania.",
    reflexeMalo:
      "Reflexiu vypĺňaš zriedka. Práve tá však z denníka robí denník: čísla ukážu, že bol deň slabý, ale nie prečo.",
  },
}

/** Malým písmenem, ať název ukazatele sedí doprostřed věty. */
function nazevMetriky(m: MetricKey, lang: Lang): string {
  const n = NAZVY_METRIK[lang][m].replace(" (h)", "")
  return n.charAt(0).toLowerCase() + n.slice(1)
}

/**
 * Několik vět, kterými statistika končí.
 *
 * Pořadí je záměrné: nejdřív jestli si klient deník vede, pak návyky, pak
 * ukazatele, pak souvislosti, a nakonec jeden krok. Kdo přečte jen první
 * a poslední větu, dostane to podstatné.
 */
export function shrnuti(
  s: Statistika,
  obdobi: Obdobi,
  lang: Lang,
  gender: Gender,
): string[] {
  const w = SLOVA[lang]
  const vety: string[] = []
  // Rodové tvary se rozvinou najednou až na konci. Kdyby se to dělalo
  // u každé věty zvlášť, stačilo by u jedné zapomenout a klientce by se
  // ve shrnutí objevila složená závorka.
  const rod = (t: string) => applyGender(t, gender)

  // 1. Vedení deníku
  vety.push(w.vyplneno(s.vyplnenychDnu, s.dnuCelkem, w.obdobi[obdobi]))
  if (s.serieVedeni >= 2) vety.push(w.serie(s.serieVedeni))
  else if (s.vyplnenychDnu > 0 && s.serieVedeni === 0) vety.push(w.bezSerie)

  // Pod prahem se dál nepokračuje: průměr ze dvou dnů není průměr.
  if (s.vyplnenychDnu < PRAH_DNU[obdobi]) {
    vety.push(w.malo)
    vety.push(w.krokZapis)
    return vety.map(rod)
  }

  // 2. Návyky
  const hodnotitelne = s.navyky.filter((n) => n.moznych > 0)
  if (s.navykyCelkem.uspesnost !== undefined) {
    vety.push(w.navykyCelkem(Math.round(s.navykyCelkem.uspesnost * 100)))
  }
  if (hodnotitelne.length >= 2) {
    const serazene = [...hodnotitelne].sort(
      (a, b) => (b.uspesnost ?? 0) - (a.uspesnost ?? 0),
    )
    const nej = serazene[0]
    const slab = serazene[serazene.length - 1]
    // Vyplatí se to říct jen tehdy, když se ty dva od sebe opravdu liší.
    if ((nej.uspesnost ?? 0) - (slab.uspesnost ?? 0) > 0.2) {
      vety.push(w.navykNejlepsi(nej.name, nej.splneno, nej.moznych))
      vety.push(w.navykNejhorsi(slab.name, slab.splneno, slab.moznych))
    }
  }
  const dlouhaSerie = [...s.navyky].sort((a, b) => b.aktualniSerie - a.aktualniSerie)[0]
  if (dlouhaSerie && dlouhaSerie.aktualniSerie >= 7) {
    vety.push(w.navykySerie(dlouhaSerie.name, dlouhaSerie.aktualniSerie))
  }

  // 3. Ukazatele
  const skalove = s.metriky.filter(
    (m) => METRIKY_SKALA.includes(m.klic) && m.prumer !== undefined && m.pocet >= 3,
  )
  if (skalove.length >= 2) {
    const serazene = [...skalove].sort((a, b) => (b.prumer ?? 0) - (a.prumer ?? 0))
    const nej = serazene[0]
    const slab = serazene[serazene.length - 1]
    vety.push(
      w.ukazatele(
        nazevMetriky(nej.klic, lang),
        cislo(nej.prumer ?? 0, lang, 1),
        nazevMetriky(slab.klic, lang),
        cislo(slab.prumer ?? 0, lang, 1),
      ),
    )
  }
  if (s.skoreZmena !== undefined) {
    const o = `${cislo(Math.abs(s.skoreZmena), lang, 1)} ${lang === "en" ? "points" : "bodu"}`
    if (s.skoreZmena > 0.3) vety.push(w.zmenaNahoru(o))
    else if (s.skoreZmena < -0.3) vety.push(w.zmenaDolu(o))
    else vety.push(w.zmenaZadna)
  }

  const spanek = s.metriky.find((m) => m.klic === "sleep")
  if (spanek?.prumer !== undefined && spanek.pocet >= 3) {
    const h = cislo(spanek.prumer, lang, 1)
    // Sedm hodin je hranice, pod kterou se výkonový propad běžně objevuje.
    vety.push(spanek.prumer < 7 ? w.spanekMalo(h) : w.spanek(h))
  }

  // 4. Den v týdnu. U týdenního pohledu nedává smysl, tam je každý den jednou.
  if (obdobi !== "tyden") {
    const dny = s.podleDnuVTydnu.filter((d) => d.skore !== undefined && d.pocet >= 2)
    if (dny.length >= 5) {
      const serazene = [...dny].sort((a, b) => (a.skore ?? 0) - (b.skore ?? 0))
      const nejslabsi = serazene[0]
      const nejsilnejsi = serazene[serazene.length - 1]
      if ((nejsilnejsi.skore ?? 0) - (nejslabsi.skore ?? 0) > 0.8) {
        vety.push(w.denSlaby(NAZVY_DNU[lang][nejslabsi.index]))
      }
    }
  }

  // 5. Souvislost návyku a ukazatele
  const vliv = s.vlivNavyku.find((v) => Math.abs(v.rozdil) >= 1)
  if (vliv) {
    const o = `${cislo(Math.abs(vliv.rozdil), lang, 1)} ${
      vliv.metrika === "sleep" ? (lang === "en" ? "hours" : "hodiny") : lang === "en" ? "points" : "bodu"
    }`
    const u = nazevMetriky(vliv.metrika, lang)
    vety.push(vliv.rozdil > 0 ? w.vliv(vliv.name, u, o) : w.vlivZaporny(vliv.name, u, o))
  }

  // 6. Reflexe
  if (s.reflexe.podil !== undefined && s.reflexe.podil < 0.25 && s.vyplnenychDnu >= 5) {
    vety.push(w.reflexeMalo)
  }

  // 7. Jeden krok na konec
  const slaby = hodnotitelne
    .filter((n) => (n.uspesnost ?? 1) < 0.6)
    .sort((a, b) => (a.uspesnost ?? 0) - (b.uspesnost ?? 0))[0]
  if (slaby) vety.push(w.krokNavyk(slaby.name))
  else if (s.vyplnenychDnu < s.dnuCelkem * 0.7) vety.push(w.krokZapis)
  else vety.push(w.krokDrz)

  return vety.map(rod)
}
