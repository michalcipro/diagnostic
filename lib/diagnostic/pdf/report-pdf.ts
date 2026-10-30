import { applyGender, getDimensionContent, getFacetContent, vt } from "../content"
import { BAND_LABELS, TEST_NAMES, UI, fmtNum } from "../i18n"
import { OTAZKY_DIMENZI, OTAZKY_FAZET, vUvozovkach } from "../otazky"
import { PERCENTILY_PASEM } from "../normy"
import { evaluate } from "../scoring"
import { getStructure, parseTestId } from "../structure"
import { buildSummary, summaryHeading } from "../summary"
import type {
  AnswerMap,
  DiagnosticResult,
  DimensionId,
  DimensionScore,
  Gender,
  Lang,
  PersonInfo,
  TestId,
} from "../types"
import { datumLokalne } from "./sazba"
import {
  BARVY_PASEM,
  PAPIR,
  PORADI_PASEM,
  STYL,
  Sestava,
  hranicePasem,
  type Blok,
  type Hlavicka,
  type MoznyBlok,
  type Polozka,
  type Styl,
} from "./sestava"
import { TEXTY_SESTAVY } from "./sestava-texty"

// Tisková sestava ELITE 200 a ELITE 100.
//
// 1 Přehled: spolehlivost vyplnění, profil, mapa dílčích oblastí, na čem
//   stavět a otázky do rozhovoru k nejslabším místům.
// 2–5 Oblasti do hloubky, dvě na stranu: vlevo čísla, vpravo výklad, otázka
//   do rozhovoru a dole místo na poznámky.
// 6 Plán rozvoje na 12 týdnů s políčky na odškrtávání.
// 7 Strana pro sportovce nebo klienta, jen když ji kouč zaškrtne. Je bez
//   čísel, takže se dá předat z ruky do ruky.
//
// Výklad je tentýž, který kouč vidí v aplikaci; nové jsou jen otázky do
// rozhovoru (lib/diagnostic/otazky.ts).

export interface PdfVstup {
  testId: TestId
  person: PersonInfo
  answers: AnswerMap
  lang: Lang
  durationSec?: number
  /** přidat stranu pro sportovce nebo klienta; kouč ji zaškrtává před tiskem */
  proKlienta?: boolean
}

/** Název souboru: test, klient, datum. */
export function pdfFileName(vstup: PdfVstup): string {
  const cistyNazev = TEST_NAMES[vstup.testId][vstup.lang].replace(/[™·]/g, "").replace(/\s+/g, " ").trim()
  return (
    [cistyNazev, vstup.person.name, vstup.person.fillDate]
      .filter(Boolean)
      .join(" - ")
      .replace(/[/\\?%*:|"<>]/g, "-")
      .slice(0, 120) + ".pdf"
  )
}

/** Sestava i se seznamem stran, které se nevešly. Používá test sazby. */
export function sestavReportPdf(vstup: PdfVstup): Sestava {
  const { testId, person, answers, lang, durationSec } = vstup
  const { model, variant } = parseTestId(testId)!
  const gender: Gender = person.gender ?? "male"
  const g = (x: string) => applyGender(x, gender)
  const structure = getStructure(model)
  const result: DiagnosticResult = evaluate(structure, answers, { durationSec })
  const t = UI[lang]
  const ts = TEXTY_SESTAVY[lang]
  const ss = new Sestava(lang)
  const datum = datumLokalne(person.fillDate, lang)
  const jeDvestovka = model === "elite200"
  const kratkyNazev = jeDvestovka ? "ELITE 200" : "ELITE 100"
  const vnitrni = (sekce: string): Hlavicka => ({
    vlevo: [person.name || "–", kratkyNazev, datum].filter(Boolean).join(" · "),
    vpravo: sekce,
  })

  const pasmaDimenzi = structure.scoring.dimensionBands
  const minDim = pasmaDimenzi[0].min
  const maxDim = pasmaDimenzi[pasmaDimenzi.length - 1].max
  const jeNormovano = result.dimensions.every((d) => d.percentil !== undefined)
  const pasmaFazet = structure.scoring.facetBands
  const minFazety = pasmaFazet?.[0].min ?? 0
  const maxFazety = pasmaFazet?.[pasmaFazet.length - 1].max ?? 0

  const nazevSkaly = (id: string) =>
    id.length === 1 ? getDimensionContent(id as DimensionId).name[lang] : (getFacetContent(id)?.name[lang] ?? id)
  const otazka = (id: string) =>
    g(id.length === 1 ? OTAZKY_DIMENZI[id as DimensionId][lang] : (OTAZKY_FAZET[id]?.[lang] ?? ""))

  // ---------- 1 Přehled ----------
  const v = result.validity
  const minut = durationSec ? Math.round(durationSec / 60) : v.pace ? Math.round(v.pace.totalSec / 60) : 0
  const meta = [person.role, ts.vyplneno(datum), minut ? ts.minut(minut) : ""].filter(Boolean).join(" · ")
  const stavSlovem = {
    ok: t.validityStatusOk,
    caution: `! ${t.validityStatusCaution}`,
    invalid: `! ${t.validityStatusInvalid}`,
  }
  const barvaStavu = {
    ok: BARVY_PASEM.elite.pismo,
    caution: BARVY_PASEM.stabilization.pismo,
    invalid: BARVY_PASEM.priority.pismo,
  }
  const info: Polozka[] = [
    { popis: ts.vyplneni, hodnota: stavSlovem[v.overall], barva: barvaStavu[v.overall] },
    { popis: ts.pozornost, hodnota: `${v.attention.total - v.attention.errors} / ${v.attention.total}` },
    { popis: ts.uprimnost, hodnota: ts.stylizace[v.honesty.status] },
    v.pace
      ? { popis: ts.tempo, hodnota: ts.tempoHodnota(fmtNum(v.pace.secPerItem, lang)) }
      : {
          popis: ts.konzistence,
          hodnota: v.consistency.available ? fmtNum(v.consistency.meanDiff, lang, 2) : t.validityUnavailable,
        },
  ]

  const profil = (mezera: number) =>
    ss.profil(
      result.dimensions.map((d) => ({
        nazev: getDimensionContent(d.id).name[lang],
        hodnota: d.reported ? String(d.raw) : null,
        procenta: d.percentil ?? d.percent,
        pasmo: d.reported ? d.band : null,
        stitek: d.reported ? BAND_LABELS[lang][d.band] : t.scaleNotReported,
      })),
      {
        // Pruh ukazuje percentil vůči normě a hranice pásem jsou proto pro
        // všechny oblasti stejné. Hrubé skóre zůstává číslem u řádku.
        popis: jeNormovano ? ts.osaNorem : ts.stupnice(minDim, maxDim),
        hranice: jeNormovano
          ? [PERCENTILY_PASEM.stabilization, PERCENTILY_PASEM.strong, PERCENTILY_PASEM.elite]
          : hranicePasem(pasmaDimenzi, minDim, maxDim),
        popisky: PORADI_PASEM.map((p) => ts.pasmaOsy[p]),
      },
      { mezera },
    )

  const mapa = (mezera: number) =>
    jeDvestovka &&
    ss.skupina([
      ss.h3(ts.vsechnyFazety(result.facets?.length ?? 0, minFazety, maxFazety)),
      ss.mezera(2.2),
      ss.mapa(
        result.dimensions.map((d) => ({
          skupina: ts.kratce[d.id],
          bunky: (d.facets ?? []).map((f) => ({
            nazev: nazevSkaly(f.id),
            hodnota: f.reported ? String(f.raw) : "–",
            pasmo: f.reported ? f.band : null,
          })),
        })),
        { mezera },
      ),
    ])

  const silne = result.strongest.map((x) => `${nazevSkaly(x.id)} · ${x.raw}`)
  const slabe = result.weakest

  const prehled = (mezeraProfilu: number, mezeraMapy: number): MoznyBlok[] => [
    ss.uvod(TEST_NAMES[testId][lang], person.name, [meta]),
    !result.complete &&
      ss.upozorneni(`${t.incompleteWarning(result.answeredCount, structure.itemCount)} ${t.proratedNote}`),
    ss.infoPruh(info),
    ss.skupina([ss.text(t.profileOverview, STYL.h1), ss.mezera(3.6), profil(mezeraProfilu)]),
    mapa(mezeraMapy),
    !jeDvestovka && result.imbalanced && ss.upozorneni(t.imbalanceNote),
    silne.length > 0 && ss.skupina([ss.h3(ts.naCemStavet), ss.mezera(1.8), ss.cipy(silne)]),
    slabe.length > 0 &&
      ss.box(
        ss.skupina([
          ss.h3(ts.doRozhovoru(slabe.length)),
          ss.mezera(2),
          ss.body(
            slabe.map((w) => ({ titulek: `${nazevSkaly(w.id)} · ${w.raw}`, text: vUvozovkach(otazka(w.id), lang) })),
          ),
        ]),
      ),
    // ELITE 100 nemá mapu dílčích oblastí, takže mu zbude místo na poznámky.
    !jeDvestovka && ss.zapis(ts.poznamkyZRozhovoru, 2),
  ]
  // Přehled se musí vejít na jednu stranu i v angličtině, kde se delší názvy
  // oblastí lámou na dva řádky. Proto se zkouší od nejvzdušnějšího rozvržení.
  const ROZVRZENI = [
    { strana: 5.8, profil: 3.7, mapa: 1.5 },
    { strana: 5, profil: 3.2, mapa: 1.3 },
    { strana: 4.4, profil: 2.8, mapa: 1.1 },
    { strana: 3.8, profil: 2.4, mapa: 1 },
  ]
  ss.stranaVeVariantach(
    { vlevo: t.brand, vpravo: ts.proKouce, znacka: true },
    ROZVRZENI.map((r) => ({ bloky: prehled(r.profil, r.mapa), mezera: r.strana })),
  )

  // ---------- 2–5 Oblasti do hloubky ----------
  const stOtazka: Styl = { pt: 9.8, barva: PAPIR.inkoust, proklad: 1.45 }
  const blokOblasti = (d: DimensionScore): Blok => {
    const c = getDimensionContent(d.id)
    const fazety = (d.facets ?? []).map((f) =>
      ss.fazeta(
        nazevSkaly(f.id),
        f.reported ? String(f.raw) : "–",
        f.reported ? (f.percentil ?? f.percent) : 0,
        f.reported ? f.band : null,
      ),
    )
    const levy = ss.skupina([
      ss.text(c.name[lang], STYL.h2),
      ss.mezera(1.6),
      d.reported
        ? ss.skore(String(d.raw), ts.zeMax(d.max))
        : ss.text(`${t.scaleNotReported} · ${t.scaleCoverage(d.answered, d.total)}`, STYL.mala),
      d.reported && ss.mezera(1.4),
      d.reported && ss.stitekBlok(BAND_LABELS[lang][d.band], d.band),
      fazety.length > 0 && ss.mezera(3.4),
      fazety.length > 0 && ss.skupina(fazety, 2.2),
      fazety.length > 0 && ss.mezera(2),
      fazety.length > 0 && ss.text(ts.dilciOblasti(minFazety, maxFazety), STYL.mala),
    ])
    // Otázka míří na nejslabší dílčí oblast, protože tam rozhovor nejvíc pomůže.
    const nejslabsi = (d.facets ?? []).filter((f) => f.reported).sort((a, b) => a.raw - b.raw)[0]
    const pravy = ss.skupina(
      [
        ss.h3(ts.coToZnamena),
        d.reported && ss.text(vt(c.bands[d.band], variant, lang, gender)),
        !d.reported && ss.text(t.proratedNote, STYL.mala),
        d.heterogeneous && ss.upozorneni(ts.heterogenni),
        ss.h3(ts.otazkaDoRozhovoru),
        ss.text(vUvozovkach(otazka(nejslabsi ? nejslabsi.id : d.id), lang), stOtazka),
      ],
      2.4,
    )
    return ss.oddil(ss.sloupce([{ sirka: 60, blok: levy }, { blok: pravy }], 6), 3.4)
  }

  const poznamky = () => ss.zapis(ts.poznamkyZRozhovoru, 2)
  const nadpisOblasti = ss.text(ts.oblastiDoHloubky, STYL.h1)
  const zbyle = [...result.dimensions]
  let prvni = true
  while (zbyle.length) {
    const naStrane: Blok[] = prvni ? [nadpisOblasti] : []
    // Dvě oblasti na stranu, když se vejdou i s místem na poznámky; jinak jedna.
    naStrane.push(blokOblasti(zbyle.shift()!))
    if (zbyle.length) {
      const zkusmo = [...naStrane, blokOblasti(zbyle[0]), poznamky()]
      if (ss.zmer(zkusmo) <= ss.vyskaPlochy) naStrane.push(blokOblasti(zbyle.shift()!))
    }
    naStrane.push(poznamky())
    ss.strana(vnitrni(ts.oblastiDoHloubky), naStrane)
    prvni = false
  }

  // ---------- 6 Plán rozvoje ----------
  if (slabe.length) {
    const kroky = slabe.map((w) => {
      const jeDimenze = w.id.length === 1
      const text = jeDimenze
        ? vt(getDimensionContent(w.id as DimensionId).bands[w.band], variant, lang, gender)
        : vt(getFacetContent(w.id)!.development, variant, lang, gender)
      const stitek = BAND_LABELS[lang][w.band]
      return ss.oddil(
        ss.skupina(
          [
            ss.sloupce(
              [
                { blok: ss.text(nazevSkaly(w.id), STYL.h2) },
                { sirka: ss.sirkaStitku(stitek), blok: ss.stitekBlok(stitek, w.band, ss.radek(STYL.h2)) },
              ],
              3,
            ),
            ss.text(text),
            ss.tydny(),
          ],
          2,
        ),
        3,
      )
    })
    ss.strana(vnitrni(ts.planHlavicka), [
      ss.skupina([ss.text(ts.planTitul, STYL.h1), ss.mezera(1.2), ss.text(ts.planUvod(slabe.length, jeDvestovka))]),
      ...kroky,
      ss.zapis(ts.poznamkyADohody, 2),
    ])
  }

  // ---------- 7 Pro sportovce nebo klienta ----------
  if (vstup.proKlienta) {
    const summary = buildSummary(result, lang)
    const heading = summaryHeading(lang, gender)
    const stBox: Styl = { pt: 10.4, barva: PAPIR.inkoust, proklad: 1.5 }
    const ramecek = (nadpis: string, obsah: string) =>
      ss.box(ss.skupina([ss.h3(nadpis), ss.mezera(1.6), ss.text(g(obsah), stBox)]))
    ss.stranaVeVariantach(
      { vlevo: t.brand, vpravo: g(ts.proKlienta[variant]), znacka: true },
      [5.8, 4.6, 3.8].map((mezera) => ({
        mezera,
        bloky: [
          ss.uvod(`${heading.title} · ${datum}`, person.name, [heading.intro], 22),
          ss.text(g(summary.overall), { pt: 12, barva: PAPIR.inkoust, proklad: 1.5 }),
          ss.sloupce(
            [
              { blok: ramecek(ts.naCemStavis, summary.strengths) },
              { blok: ramecek(ts.prostorKRustu, summary.priorities) },
            ],
            5,
            { vyrovnat: true },
          ),
          summary.caveat && ss.text(g(summary.caveat), STYL.mala),
          summary.nextStep && ss.box(ss.text(g(summary.nextStep), stBox)),
          ss.zapis(ts.mojeJednaVec, 2, 4),
          ss.zapis(ts.podleCehoPoznam, 1, 3),
          ss.zapis(ts.kdoMiPomuze, 1, 2),
          ss.podpisy([ts.kouc, g(ts.klient[variant]), ts.datumRozhovoru]),
        ],
      })),
      { paticka: g(ts.patickaProKlienta[variant]) },
    )
  }

  return ss
}

export function buildReportPdf(vstup: PdfVstup): Blob {
  const ss = sestavReportPdf(vstup)
  return ss.dokonci(UI[vstup.lang].confidential)
}
