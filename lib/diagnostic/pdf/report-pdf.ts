import { applyGender, getDimensionContent, getFacetContent, vt } from "../content"
import { BAND_LABELS, TEST_NAMES, UI, fmtNum } from "../i18n"
import { evaluate } from "../scoring"
import { getStructure, parseTestId } from "../structure"
import { buildSummary, summaryHeading } from "../summary"
import type {
  AnswerMap,
  BandKey,
  DiagnosticResult,
  DimensionId,
  Gender,
  Lang,
  PersonInfo,
  TestId,
} from "../types"
import {
  BARVA,
  OKRAJ,
  SIRKA,
  Sazba,
  datumLokalne,
  novyDokument,
  type BarvyStitku,
} from "./sazba"

// PDF s vyhodnocením ELITE. Sazbu a rozvržení řeší sdílený sazeč v ./sazba,
// tady zůstává jen obsah a barvy štítků pásem.

/** Štítek pásma: barva textu a podkladu. Text štítku nese význam vždy. */
const STITEK_PASMA: Record<BandKey, BarvyStitku> = {
  priority: { pismo: [192, 15, 45], podklad: [253, 236, 236] },
  stabilization: { pismo: [167, 82, 0], podklad: [253, 241, 227] },
  strong: { pismo: [10, 95, 189], podklad: [233, 242, 253] },
  elite: { pismo: [26, 127, 55], podklad: [230, 245, 234] },
}

export interface PdfVstup {
  testId: TestId
  person: PersonInfo
  answers: AnswerMap
  lang: Lang
  durationSec?: number
}

/** Název souboru: test, klient, datum. */
export function pdfFileName(vstup: PdfVstup): string {
  const cistyNazev = TEST_NAMES[vstup.testId][vstup.lang]
    .replace(/[™·]/g, "")
    .replace(/\s+/g, " ")
    .trim()
  return (
    [cistyNazev, vstup.person.name, vstup.person.fillDate]
      .filter(Boolean)
      .join(" - ")
      .replace(/[/\\?%*:|"<>]/g, "-")
      .slice(0, 120) + ".pdf"
  )
}

export function buildReportPdf(vstup: PdfVstup): Blob {
  const { testId, person, answers, lang, durationSec } = vstup
  const { model, variant } = parseTestId(testId)!
  const gender: Gender = person.gender ?? "male"
  const structure = getStructure(model)
  const result: DiagnosticResult = evaluate(structure, answers, { durationSec })
  const t = UI[lang]

  const doc = novyDokument()
  const s = new Sazba(doc)

  // ---------- hlavička ----------
  s.text(t.brand, { velikost: 7.6, tucne: true, barva: BARVA.slaba, prostrkani: 0.6 })
  s.mezera(2.5)
  s.text(`${TEST_NAMES[testId][lang]} · ${t.reportTitle}`, {
    velikost: 18,
    tucne: true,
    radek: 8,
  })
  s.mezera(1.5)
  s.text(t.reportSubtitle, { velikost: 10, barva: BARVA.text2 })
  s.mezera(6)
  s.linka()
  s.mezera(7)

  const udaje = [
    { popis: t.personLabel, hodnota: person.name || "?" },
    {
      popis: variant === "sport" ? t.roleLabelSport : t.roleLabelBusiness,
      hodnota: person.role || "–",
    },
    { popis: t.filledLabel, hodnota: datumLokalne(person.fillDate, lang) },
  ]
  if (person.birthDate) {
    udaje.push({ popis: t.birthLabel, hodnota: datumLokalne(person.birthDate, lang) })
  }
  s.mrizkaUdaju(udaje)
  s.mezera(6)

  if (!result.complete) {
    s.ramecek(`${t.incompleteWarning(result.answeredCount, structure.itemCount)} ${t.proratedNote}`, {
      velikost: 9,
    })
    s.mezera(3)
  }

  // ---------- validita ----------
  const v = result.validity
  s.nadpis(t.validityTitle)
  s.text(
    v.overall === "ok"
      ? t.validityOkNote
      : v.overall === "caution"
        ? t.validityCautionNote
        : t.validityInvalidNote,
    { velikost: 9.6, radek: 4.8, barva: BARVA.text2 },
  )
  s.mezera(5)

  const ukazatele: { popis: string; hodnota: string }[] = [
    {
      popis: t.validityAttention,
      hodnota: `${v.attention.total - v.attention.errors} / ${v.attention.total}`,
    },
  ]
  if (v.infrequency) {
    ukazatele.push({ popis: t.validityInfrequency, hodnota: String(v.infrequency.signals) })
  }
  ukazatele.push({
    popis: t.validityConsistency,
    hodnota: v.consistency.available
      ? `${fmtNum(v.consistency.meanDiff, lang, 2)} (${v.consistency.pairsUsed}/${v.consistency.pairsTotal})`
      : t.validityUnavailable,
  })
  if (v.pace) {
    ukazatele.push({
      popis: t.validityPace,
      hodnota: t.paceValue(v.pace.secPerItem, Math.round(v.pace.totalSec / 60)),
    })
  }
  ukazatele.push({
    popis: t.validityHonesty,
    hodnota: `${v.honesty.score} (${v.honesty.min}–${v.honesty.max})`,
  })
  s.mrizkaUdaju(ukazatele, 3, 9)
  s.mezera(8)

  // ---------- přehled profilu ----------
  if (s.zbyva() < 60) s.zalom()
  s.nadpis(t.profileOverview)
  for (const d of result.dimensions) {
    const nazev = getDimensionContent(d.id).name[lang]
    if (d.reported) {
      s.radekSkore(
        nazev,
        `${d.raw}/${d.max}`,
        BAND_LABELS[lang][d.band],
        STITEK_PASMA[d.band],
        d.percent,
        { tucne: true, mezeraPo: 8 },
      )
    } else {
      s.radekChybi(nazev, `${t.scaleNotReported} · ${t.scaleCoverage(d.answered, d.total)}`)
    }
  }
  s.mezera(4)

  // ---------- narativ po dimenzích ----------
  // Zalomit jen tehdy, když by nadpis zůstal osamocený na patě stránky.
  if (s.zbyva() < 80) s.zalom()
  s.nadpis(t.dimensionsTitle, 15)

  result.dimensions.forEach((d, i) => {
    const content = getDimensionContent(d.id)
    if (i > 0) {
      s.misto(46)
      s.mezera(2)
    }
    s.misto(46)
    s.text(content.name[lang], { velikost: 12.5, tucne: true, radek: 6 })
    s.mezera(1)
    s.text(vt(content.tagline, variant, lang, gender), {
      velikost: 8.8,
      barva: BARVA.slaba,
      radek: 4.1,
    })
    s.mezera(4)

    if (!d.reported) {
      s.radekChybi(content.name[lang], `${t.scaleNotReported} · ${t.scaleCoverage(d.answered, d.total)}`)
      s.mezera(4)
      return
    }

    // Název řádku je záměrně prázdný: pásmo i hodnota stojí vpravo a název
    // dimenze je o dva řádky výš, opakovat ho by byl šum.
    s.radekSkore(
      "",
      `${d.raw}/${d.max}`,
      BAND_LABELS[lang][d.band],
      STITEK_PASMA[d.band],
      d.percent,
      { tucne: true, mezeraPo: 6.5 },
    )
    s.text(vt(content.bands[d.band], variant, lang, gender), { velikost: 9.6, radek: 4.8 })
    s.mezera(6)

    if (d.facets) {
      for (const f of d.facets) {
        const fc = getFacetContent(f.id)
        if (!fc) continue
        if (!f.reported) {
          s.radekChybi(
            fc.name[lang],
            `${t.scaleNotReported} · ${t.scaleCoverage(f.answered, f.total)}`,
            6,
          )
          continue
        }
        s.misto(28)
        s.radekSkore(
          fc.name[lang],
          `${f.raw}/${f.max}`,
          BAND_LABELS[lang][f.band],
          STITEK_PASMA[f.band],
          f.percent,
          { odsazeni: 6, velikost: 9.4, mezeraPo: 5.5 },
        )
        s.text(vt(fc.bands[f.band], variant, lang, gender), {
          velikost: 8.9,
          barva: BARVA.text2,
          radek: 4.3,
          x: OKRAJ.levy + 6,
          sirka: SIRKA - 6,
        })
        s.mezera(4.5)
      }
    }
    s.mezera(2)
    s.linka()
    s.mezera(7)
  })

  // ---------- rozvojová doporučení ----------
  if (result.weakest.length) {
    if (s.zbyva() < 70) s.zalom()
    s.nadpis(t.developmentTitle, 15)
    s.text(t.developmentIntro, { velikost: 9, barva: BARVA.slaba, radek: 4.3 })
    s.mezera(5)
    result.weakest.forEach((w, i) => {
      const jeDim = w.id.length === 1
      const nazev = jeDim
        ? getDimensionContent(w.id as DimensionId).name[lang]
        : (getFacetContent(w.id)?.name[lang] ?? w.id)
      const rozvoj = jeDim ? undefined : getFacetContent(w.id)?.development
      const nahrada = jeDim ? getDimensionContent(w.id as DimensionId).bands[w.band] : undefined
      s.misto(26)
      const zaklad = s.y
      // pořadové číslo v kolečku, ať je krok vidět na první pohled
      doc.setFillColor(BARVA.znacka[0], BARVA.znacka[1], BARVA.znacka[2])
      doc.circle(OKRAJ.levy + 3, zaklad - 1.2, 3.1, "F")
      doc.setFont("Liberation", "bold")
      doc.setFontSize(8.4)
      doc.setTextColor(255, 255, 255)
      doc.text(String(i + 1), OKRAJ.levy + 3, zaklad + 0.6, { align: "center" })
      s.text(nazev, { velikost: 10.5, tucne: true, x: OKRAJ.levy + 9, sirka: SIRKA - 9, radek: 5 })
      s.mezera(1.5)
      s.text(
        rozvoj ? vt(rozvoj, variant, lang, gender) : nahrada ? vt(nahrada, variant, lang, gender) : "",
        { velikost: 9.4, radek: 4.6, x: OKRAJ.levy + 9, sirka: SIRKA - 9, barva: BARVA.text2 },
      )
      s.mezera(6)
    })
  }

  // ---------- shrnutí ----------
  const summary = buildSummary(result, lang)
  const heading = summaryHeading(lang, gender)
  // Shrnutí je pro klienta to nejdůležitější a musí držet pohromadě, proto
  // dostává vlastní stránku místo toho, aby se lámalo přes dvě.
  s.zalom()
  s.text(heading.title, { velikost: 16, tucne: true, barva: BARVA.znacka, radek: 7.5 })
  s.mezera(1.5)
  s.text(heading.intro, { velikost: 9, barva: BARVA.slaba })
  s.mezera(3)
  s.linka()
  s.mezera(7)
  for (const cast of [summary.overall, summary.strengths, summary.priorities]) {
    if (!cast) continue
    s.text(applyGender(cast, gender), { velikost: 10.4, radek: 5.2 })
    s.mezera(4.5)
  }
  if (summary.caveat) {
    s.ramecek(applyGender(summary.caveat, gender), { velikost: 9.6 })
    s.mezera(3)
  }
  if (summary.nextStep) {
    s.ramecek(applyGender(summary.nextStep, gender), { velikost: 10.2, tucne: true })
  }

  s.paticka(t.confidential)

  return doc.output("blob")
}
