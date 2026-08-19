import {
  BARVA,
  OKRAJ,
  PRAVY_KRAJ,
  SIRKA,
  STITEK_NEUTRALNI,
  Sazba,
  novyDokument,
  type BunkaTabulky,
  type RGB,
  type SloupecTabulky,
} from "@/lib/diagnostic/pdf/sazba"
import type { Gender, Lang } from "@/lib/diagnostic/types"
import { NAZVY_METRIK, UI, cislo, zmenaText } from "./i18n"
import { METRIKY_SKALA, type MetricKey } from "./types"
import { ZKRATKY_DNU, dlouheDatum } from "./datum"
import type { Statistika } from "./stats"
import { shrnuti, type Obdobi } from "./shrnuti"
import { ocisti } from "./pdf"

// Přehled deníku v PDF: týden, měsíc, rok.
//
// Sází se stejným sazečem jako vyhodnocení diagnostiky, takže oba dokumenty
// vypadají jako jedna řada, ne jako dva různé programy. Klient dostane od
// kouče report a k němu vlastní přehled, a na první pohled patří k sobě.
//
// Týdenní list má vlastní soubor (lib/planner/pdf.ts) a vlastní důvod: ten je
// věrnou kopií papírové předlohy na šířku, tohle je čtený dokument na výšku.

/** Barvy pro změnu proti minulému období. Zelená nahoru, červená dolů. */
const NAHORU: RGB = [26, 127, 55]
const DOLU: RGB = [192, 15, 45]

/**
 * Očistí texty všech buněk najednou.
 *
 * Do tabulky se dostanou jak názvy návyků, které píše klient, tak znaménka,
 * která skládá aplikace. Obojí může obsahovat znak, který vložené písmo nemá,
 * a takový znak se v PDF nevykreslí vůbec. U jména to je nepříjemné, u minus
 * u čísla to dokument obrátí naruby, takže se čistí na jednom místě všechno.
 */
function ocisteneRadky(radky: BunkaTabulky[][]): BunkaTabulky[][] {
  return radky.map((radek) =>
    radek.map((b) => {
      if (typeof b === "string") return ocisti(b)
      if (typeof b.text !== "string") return b
      return { ...b, text: ocisti(b.text) }
    }),
  )
}

/** Buňka se změnou, obarvená podle směru. Bez hodnoty zůstane prázdná. */
function bunkaZmeny(hodnota: number | undefined, lang: Lang): BunkaTabulky {
  if (hodnota === undefined) return { text: "–", barva: BARVA.slaba }
  if (Math.abs(hodnota) < 0.05) return { text: "0", barva: BARVA.slaba }
  return {
    text: zmenaText(hodnota, lang),
    tucne: true,
    barva: hodnota > 0 ? NAHORU : DOLU,
  }
}

export interface StatsPdfVstup {
  stat: Statistika
  obdobi: Obdobi
  /** popis období do hlavičky, například „srpen 2026" */
  popisObdobi: string
  jmeno: string
  lang: Lang
  gender: Gender
  /** body grafu vývoje: den v týdnu, týden v měsíci nebo měsíc v roce */
  vyvoj: { popisek: string; hodnota?: number }[]
  dnesniDatum: string
}

/** Název souboru: přehled, období, jméno. */
export function nazevStatistikPdf(v: StatsPdfVstup): string {
  const druh = v.obdobi === "tyden" ? "tyden" : v.obdobi === "mesic" ? "mesic" : "rok"
  return `prehled-deniku-${druh}-${v.popisObdobi}-${v.jmeno}`
    .replace(/[/\\?%*:|"<>]/g, "-")
    .replace(/\s+/g, "-")
    .toLowerCase()
    .slice(0, 120)
    .concat(".pdf")
}

export function sestavStatistikyPdf(v: StatsPdfVstup): Blob {
  const { stat, obdobi, popisObdobi, jmeno, lang, gender, vyvoj, dnesniDatum } = v
  const t = UI[lang]
  const doc = novyDokument()
  const s = new Sazba(doc)

  const nadpisObdobi =
    obdobi === "tyden" ? t.statTyden : obdobi === "mesic" ? t.statMesic : t.statRok

  // ── hlavička ────────────────────────────────────────────────────────────
  s.text("WINNING MINDS", { velikost: 7.6, tucne: true, barva: BARVA.slaba, prostrkani: 1.1 })
  s.mezera(3)
  s.text(`${t.appName} · ${nadpisObdobi}`, { velikost: 19, tucne: true, radek: 8 })
  s.mezera(1)
  s.text(popisObdobi, { velikost: 12.5, barva: BARVA.text2, radek: 6 })
  s.mezera(6)
  s.linka()
  s.mezera(7)

  s.mrizkaUdaju(
    [
      { popis: t.jmeno, hodnota: ocisti(jmeno) || "–" },
      { popis: t.statPrehled, hodnota: `${stat.od} – ${stat.do}` },
      { popis: lang === "en" ? "Generated" : "Vystaveno", hodnota: dlouheDatum(dnesniDatum, lang) },
    ],
    3,
  )
  s.mezera(8)

  // ── klíčová čísla ───────────────────────────────────────────────────────
  const cisla: { popis: string; hodnota: string }[] = [
    {
      popis: t.statDenniSkore,
      hodnota: stat.skore !== undefined ? `${cislo(stat.skore, lang, 1)} / 10` : "–",
    },
    { popis: t.statVyplnenychDnu, hodnota: `${stat.vyplnenychDnu} / ${stat.dnuCelkem}` },
    { popis: t.statSerie, hodnota: `${stat.serieVedeni} ${t.dnu}` },
    {
      popis: t.statNavyky,
      hodnota:
        stat.navykyCelkem.uspesnost !== undefined
          ? `${Math.round(stat.navykyCelkem.uspesnost * 100)} %`
          : "–",
    },
    {
      popis: t.statReflexe,
      hodnota: `${Math.round((stat.reflexe.podil ?? 0) * 100)} %`,
    },
    { popis: t.statNaplanovanychHodin, hodnota: `${stat.rozvrh.hodin}` },
  ]
  s.mrizkaUdaju(cisla, 3, 12)
  s.mezera(4)

  // Změna proti minulému období se vypíše jen tehdy, když se dá spočítat.
  if (stat.skoreZmena !== undefined || stat.navykyCelkem.zmena !== undefined) {
    const casti: string[] = []
    if (stat.skoreZmena !== undefined) {
      casti.push(`${t.statDenniSkore} ${zmenaText(stat.skoreZmena, lang)}`)
    }
    if (stat.navykyCelkem.zmena !== undefined) {
      casti.push(`${t.statNavyky} ${zmenaText(stat.navykyCelkem.zmena, lang, 0)} b.`)
    }
    s.text(`${t.statProtiMinulemu}: ${casti.join(" · ")}`, {
      velikost: 9,
      barva: BARVA.text2,
      radek: 4.6,
    })
    s.mezera(6)
  }

  // ── návyky ──────────────────────────────────────────────────────────────
  const hodnotitelne = stat.navyky.filter((n) => n.moznych > 0 || n.splneno > 0)
  if (hodnotitelne.length) {
    s.nadpis(t.statNavyky)
    const sloupce: SloupecTabulky[] = [
      { popis: t.nazevNavyku, podil: 0.3 },
      { popis: t.statSplneno, podil: 0.12, vpravo: true },
      { popis: t.statUspesnost, podil: 0.22 },
      { popis: "%", podil: 0.08, vpravo: true },
      { popis: t.statSerieKratce, podil: 0.14, vpravo: true },
      { popis: t.statZmena, podil: 0.14, vpravo: true },
    ]
    const radky: BunkaTabulky[][] = hodnotitelne.map((n) => [
      {
        text: ocisti(n.archivovany ? `${n.name} (${t.archivovane.toLowerCase()})` : n.name),
        tucne: true,
      },
      { text: `${n.splneno} / ${n.moznych}` },
      { pruh: (n.uspesnost ?? 0) * 100 },
      { text: n.uspesnost !== undefined ? `${Math.round(n.uspesnost * 100)}` : "–" },
      { text: `${n.aktualniSerie} / ${n.nejdelsiSerie}` },
      bunkaZmeny(n.zmena, lang),
    ])
    s.tabulka(sloupce, ocisteneRadky(radky))
    s.mezera(4)
  }

  // ── denní ukazatele ─────────────────────────────────────────────────────
  s.nadpis(t.statUkazatele)
  const sloupceU: SloupecTabulky[] = [
    { popis: t.statUkazatel, podil: 0.32 },
    { popis: t.statPrumer, podil: 0.13, vpravo: true },
    { popis: "", podil: 0.24 },
    { popis: t.statRozsah, podil: 0.16, vpravo: true },
    { popis: t.dnu, podil: 0.07, vpravo: true },
    { popis: t.statZmena, podil: 0.08, vpravo: true },
  ]
  const radkyU: BunkaTabulky[][] = stat.metriky.map((m) => {
    const desetin = m.klic === "sleep" ? 1 : 0
    // Spánek se normuje proti devíti hodinám, ostatní proti desítce: hodiny
    // nemají strop, proti kterému by procenta dávala smysl.
    const podil =
      m.prumer === undefined ? 0 : m.klic === "sleep" ? Math.min(1, m.prumer / 9) : m.prumer / 10
    return [
      { text: NAZVY_METRIK[lang][m.klic], tucne: true },
      { text: m.prumer !== undefined ? cislo(m.prumer, lang, 1) : "–", tucne: true },
      { pruh: podil * 100 },
      {
        text:
          m.min !== undefined && m.max !== undefined
            ? `${cislo(m.min, lang, desetin)} – ${cislo(m.max, lang, desetin)}`
            : "–",
      },
      { text: `${m.pocet}` },
      bunkaZmeny(m.zmena, lang),
    ]
  })
  s.tabulka(sloupceU, ocisteneRadky(radkyU))
  s.mezera(4)
  s.text(t.statDenniSkoreVysvetleni, { velikost: 8.4, barva: BARVA.slaba, radek: 4.2 })
  s.mezera(6)

  // ── vývoj ───────────────────────────────────────────────────────────────
  if (vyvoj.some((b) => typeof b.hodnota === "number")) {
    s.nadpis(`${t.statVyvoj} · ${t.statDenniSkore}`)
    s.graf(vyvoj, 10, { popisHodnoty: (x) => cislo(x, lang, 1) })
    s.mezera(4)
  }

  // ── podle dnů v týdnu ───────────────────────────────────────────────────
  if (obdobi !== "tyden") {
    const dny = stat.podleDnuVTydnu
    if (dny.some((d) => d.skore !== undefined)) {
      s.nadpis(t.statPodleDnu)
      s.graf(
        dny.map((d) => ({ popisek: ZKRATKY_DNU[lang][d.index], hodnota: d.skore })),
        10,
        { popisHodnoty: (x) => cislo(x, lang, 1) },
      )
      s.mezera(3)
      s.text(t.statPodleDnuVysvetleni, { velikost: 8.4, barva: BARVA.slaba, radek: 4.2 })
      s.mezera(6)
    }
  }

  // ── souvislosti ─────────────────────────────────────────────────────────
  if (obdobi !== "tyden" && stat.vlivNavyku.length) {
    s.nadpis(t.statVliv)
    const sloupceV: SloupecTabulky[] = [
      { popis: t.nazevNavyku, podil: 0.27 },
      { popis: t.statUkazatel, podil: 0.21 },
      { popis: t.statSNavykem, podil: 0.15, vpravo: true },
      { popis: t.statBezNavyku, podil: 0.15, vpravo: true },
      { popis: t.statZmena, podil: 0.1, vpravo: true },
      { popis: t.dnu, podil: 0.12, vpravo: true },
    ]
    const radkyV: BunkaTabulky[][] = stat.vlivNavyku.slice(0, 6).map((x) => [
      { text: ocisti(x.name), tucne: true },
      { text: NAZVY_METRIK[lang][x.metrika] },
      { text: cislo(x.sNavykem, lang, 1) },
      { text: cislo(x.bezNavyku, lang, 1) },
      bunkaZmeny(x.rozdil, lang),
      { text: `${x.dnuS} / ${x.dnuBez}` },
    ])
    s.tabulka(sloupceV, ocisteneRadky(radkyV))
    s.mezera(4)
    s.text(t.statVlivVysvetleni, { velikost: 8.4, barva: BARVA.slaba, radek: 4.2 })
    s.mezera(6)
  }

  // ── shrnutí ─────────────────────────────────────────────────────────────
  //
  // Dokument končí souvislým textem, ne tabulkou. Kdo si přehled vytiskne
  // a nechá ho ležet na stole, přečte si nejspíš právě tohle.
  //
  // Vlastní stránka je záměr, ne plýtvání papírem: shrnutí je pro klienta to
  // nejdůležitější a nemá se lámat přes dvě strany. Stejně je na tom
  // vyhodnocení diagnostiky, takže oba dokumenty končí stejně.
  const vety = shrnuti(stat, obdobi, lang, gender)
  s.zalom()
  s.text(t.statShrnuti, { velikost: 16, tucne: true, barva: BARVA.znacka, radek: 7.5 })
  s.mezera(1.5)
  s.text(t.statShrnutiUvod, { velikost: 9, barva: BARVA.slaba })
  s.mezera(3)
  s.linka()
  s.mezera(7)
  // Poslední věta je konkrétní krok, ne popis. Dostane rámeček a tučný řez,
  // aby se dala najít i letmým pohledem.
  const krok = vety[vety.length - 1]
  for (const veta of vety.slice(0, -1)) {
    s.text(ocisti(veta), { velikost: 10.4, radek: 5.2 })
    s.mezera(3.2)
  }
  if (krok) {
    s.mezera(3)
    s.ramecek(ocisti(krok), { velikost: 10.2, tucne: true })
  }

  s.paticka(`${t.appName} · ${ocisti(jmeno)} · ${popisObdobi}`)
  return doc.output("blob")
}

/** Ukazatele, které vstupují do denního skóre. Vypisuje se pod grafem. */
export function popisSkore(lang: Lang): string {
  return METRIKY_SKALA.map((m: MetricKey) => NAZVY_METRIK[lang][m]).join(", ")
}

/** Pomocné konstanty znovu vyvezené, ať je sazba dostupná i mimo tento soubor. */
export { OKRAJ, PRAVY_KRAJ, SIRKA, STITEK_NEUTRALNI }
