import { jsPDF } from "jspdf"
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
import { FONT_BOLD, FONT_REGULAR } from "./font"

// Generátor PDF s vyhodnocením.
//
// Proč se PDF skládá tady a nenechává se na tiskovém dialogu prohlížeče:
// na iPhonu z tiskového dialogu nejde soubor uložit ani odeslat. Takhle
// vznikne skutečný soubor, který jde přes systémové sdílení poslat klientovi
// nebo uložit do Souborů. Text zůstává textem, takže se v PDF dá vyhledávat
// a soubor váží desítky kilobajtů, ne megabajty.

const A4 = { sirka: 210, vyska: 297 }
const OKRAJ = { levy: 18, pravy: 18, horni: 20, dolni: 18 }
const SIRKA = A4.sirka - OKRAJ.levy - OKRAJ.pravy

const BARVA = {
  text: [28, 28, 30] as [number, number, number],
  slaba: [110, 110, 115] as [number, number, number],
  znacka: [0, 113, 227] as [number, number, number],
  linka: [214, 214, 218] as [number, number, number],
  podklad: [242, 242, 247] as [number, number, number],
}

const BARVA_PASMA: Record<BandKey, [number, number, number]> = {
  priority: [215, 0, 21],
  stabilization: [201, 52, 0],
  strong: [0, 113, 227],
  elite: [36, 138, 61],
}

/** Sazeč, který si hlídá pozici na stránce a sám zalamuje. */
class Sazba {
  doc: jsPDF
  y = OKRAJ.horni
  strana = 1

  constructor(doc: jsPDF) {
    this.doc = doc
  }

  /** Zalomí stránku, pokud se výška nevejde. */
  misto(vyska: number) {
    if (this.y + vyska <= A4.vyska - OKRAJ.dolni) return
    this.doc.addPage()
    this.strana++
    this.y = OKRAJ.horni
  }

  mezera(v: number) {
    this.y += v
  }

  /** Vynucené zalomení na novou stránku. */
  zalom() {
    this.doc.addPage()
    this.strana++
    this.y = OKRAJ.horni
  }

  /** Kolik místa na stránce ještě zbývá. */
  zbyva(): number {
    return A4.vyska - OKRAJ.dolni - this.y
  }

  /** Odstavec se zalomením mezi stránkami. Vrací spotřebovanou výšku. */
  text(
    obsah: string,
    opts: {
      velikost?: number
      tucne?: boolean
      barva?: [number, number, number]
      sirka?: number
      x?: number
      radek?: number
    } = {},
  ) {
    const velikost = opts.velikost ?? 10
    const sirka = opts.sirka ?? SIRKA
    const x = opts.x ?? OKRAJ.levy
    const radek = opts.radek ?? velikost * 0.48
    this.doc.setFont("Liberation", opts.tucne ? "bold" : "normal")
    this.doc.setFontSize(velikost)
    const b = opts.barva ?? BARVA.text
    this.doc.setTextColor(b[0], b[1], b[2])
    const radky = this.doc.splitTextToSize(obsah, sirka) as string[]
    for (const r of radky) {
      this.misto(radek)
      this.doc.text(r, x, this.y)
      this.y += radek
    }
  }

  linka() {
    this.misto(2)
    this.doc.setDrawColor(BARVA.linka[0], BARVA.linka[1], BARVA.linka[2])
    this.doc.setLineWidth(0.2)
    this.doc.line(OKRAJ.levy, this.y, A4.sirka - OKRAJ.pravy, this.y)
    this.y += 2
  }

  /** Proužek se skóre: název, hodnota, pásmo. */
  skore(nazev: string, hodnota: string, pasmo: BandKey, procenta: number, lang: Lang) {
    this.misto(11)
    this.doc.setFont("Liberation", "normal")
    this.doc.setFontSize(9.5)
    this.doc.setTextColor(BARVA.text[0], BARVA.text[1], BARVA.text[2])
    this.doc.text(nazev, OKRAJ.levy, this.y)

    const stitek = `${hodnota}   ${BAND_LABELS[lang][pasmo]}`
    this.doc.setFontSize(8.5)
    const b = BARVA_PASMA[pasmo]
    this.doc.setTextColor(b[0], b[1], b[2])
    this.doc.text(stitek, A4.sirka - OKRAJ.pravy, this.y, { align: "right" })
    this.y += 2.2

    // pruh
    this.doc.setFillColor(BARVA.podklad[0], BARVA.podklad[1], BARVA.podklad[2])
    this.doc.roundedRect(OKRAJ.levy, this.y, SIRKA, 1.8, 0.9, 0.9, "F")
    this.doc.setFillColor(b[0], b[1], b[2])
    const w = Math.max(2, (SIRKA * Math.min(100, Math.max(0, procenta))) / 100)
    this.doc.roundedRect(OKRAJ.levy, this.y, w, 1.8, 0.9, 0.9, "F")
    this.y += 5
  }

  /** Odstavec na barevném podkladu. */
  ramecek(obsah: string, opts: { velikost?: number; tucne?: boolean } = {}) {
    const velikost = opts.velikost ?? 10
    const radek = velikost * 0.5
    this.doc.setFont("Liberation", opts.tucne ? "bold" : "normal")
    this.doc.setFontSize(velikost)
    const radky = this.doc.splitTextToSize(obsah, SIRKA - 8) as string[]
    const vyska = radky.length * radek + 7
    this.misto(vyska)
    this.doc.setFillColor(BARVA.podklad[0], BARVA.podklad[1], BARVA.podklad[2])
    this.doc.roundedRect(OKRAJ.levy, this.y - 4, SIRKA, vyska, 2, 2, "F")
    this.doc.setTextColor(BARVA.text[0], BARVA.text[1], BARVA.text[2])
    for (const r of radky) {
      this.doc.text(r, OKRAJ.levy + 4, this.y)
      this.y += radek
    }
    this.y += 3
  }
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

  const doc = new jsPDF({ unit: "mm", format: "a4", compress: true })
  doc.addFileToVFS("Liberation-Regular.ttf", FONT_REGULAR)
  doc.addFont("Liberation-Regular.ttf", "Liberation", "normal")
  doc.addFileToVFS("Liberation-Bold.ttf", FONT_BOLD)
  doc.addFont("Liberation-Bold.ttf", "Liberation", "bold")

  const s = new Sazba(doc)

  // ---------- hlavička ----------
  s.text(t.brand, { velikost: 8, tucne: true, barva: BARVA.slaba })
  s.mezera(1)
  s.text(`${TEST_NAMES[testId][lang]} · ${t.reportTitle}`, { velikost: 17, tucne: true, radek: 7.5 })
  s.mezera(1)
  s.text(t.reportSubtitle, { velikost: 9.5, barva: BARVA.slaba })
  s.mezera(3)
  s.linka()
  s.mezera(2)

  const udaje: string[] = [`${t.personLabel}: ${person.name || "?"}`, `${t.filledLabel}: ${person.fillDate}`]
  if (person.role) udaje.push(`${variant === "sport" ? t.roleLabelSport : t.roleLabelBusiness}: ${person.role}`)
  if (person.birthDate) udaje.push(`${t.birthLabel}: ${person.birthDate}`)
  s.text(udaje.join("    "), { velikost: 9, barva: BARVA.slaba })
  s.mezera(5)

  if (!result.complete) {
    s.ramecek(`${t.incompleteWarning(result.answeredCount, structure.itemCount)} ${t.proratedNote}`, {
      velikost: 9,
    })
    s.mezera(2)
  }

  // ---------- validita ----------
  const v = result.validity
  s.text(t.validityTitle, { velikost: 13, tucne: true })
  s.mezera(2)
  s.text(
    v.overall === "ok" ? t.validityOkNote : v.overall === "caution" ? t.validityCautionNote : t.validityInvalidNote,
    { velikost: 9.5, radek: 4.6 },
  )
  s.mezera(3)

  const radkyValidity: string[] = [
    `${t.validityAttention}: ${v.attention.total - v.attention.errors}/${v.attention.total}`,
  ]
  if (v.infrequency) radkyValidity.push(`${t.validityInfrequency}: ${v.infrequency.signals}`)
  radkyValidity.push(
    `${t.validityConsistency}: ${
      v.consistency.available
        ? `${fmtNum(v.consistency.meanDiff, lang, 2)} (${v.consistency.pairsUsed}/${v.consistency.pairsTotal})`
        : t.validityUnavailable
    }`,
  )
  if (v.pace) radkyValidity.push(`${t.validityPace}: ${t.paceValue(v.pace.secPerItem, Math.round(v.pace.totalSec / 60))}`)
  radkyValidity.push(`${t.validityHonesty}: ${v.honesty.score} (${v.honesty.min}-${v.honesty.max})`)
  s.text(radkyValidity.join("     "), { velikost: 9, barva: BARVA.slaba, radek: 4.4 })
  s.mezera(6)

  // ---------- přehled profilu ----------
  s.text(t.profileOverview, { velikost: 13, tucne: true })
  s.mezera(3)
  for (const d of result.dimensions) {
    const nazev = getDimensionContent(d.id).name[lang]
    if (d.reported) {
      s.skore(nazev, `${d.raw}/${d.max}`, d.band, d.percent, lang)
    } else {
      s.text(`${nazev} · ${t.scaleNotReported} (${t.scaleCoverage(d.answered, d.total)})`, {
        velikost: 9.5,
        barva: BARVA.slaba,
      })
      s.mezera(2)
    }
  }
  s.mezera(4)

  // ---------- narativ po dimenzích ----------
  // Zalomit jen tehdy, když by nadpis zůstal osamocený na patě stránky.
  if (s.zbyva() < 70) s.zalom()
  s.text(t.dimensionsTitle, { velikost: 15, tucne: true })
  s.mezera(4)

  for (const d of result.dimensions) {
    const content = getDimensionContent(d.id)
    s.misto(30)
    s.text(content.name[lang], { velikost: 12.5, tucne: true })
    s.mezera(1)
    s.text(vt(content.tagline, variant, lang, gender), { velikost: 8.8, barva: BARVA.slaba, radek: 4 })
    s.mezera(2)

    if (!d.reported) {
      s.text(`${t.scaleNotReported} · ${t.scaleCoverage(d.answered, d.total)}`, {
        velikost: 9,
        barva: BARVA.slaba,
      })
      s.mezera(5)
      continue
    }

    s.skore(BAND_LABELS[lang][d.band], `${d.raw}/${d.max}`, d.band, d.percent, lang)
    s.text(vt(content.bands[d.band], variant, lang, gender), { velikost: 9.5, radek: 4.6 })
    s.mezera(3)

    if (d.facets) {
      for (const f of d.facets) {
        const fc = getFacetContent(f.id)
        if (!fc) continue
        if (!f.reported) {
          s.text(`${fc.name[lang]} · ${t.scaleNotReported} (${t.scaleCoverage(f.answered, f.total)})`, {
            velikost: 8.8,
            barva: BARVA.slaba,
          })
          s.mezera(2)
          continue
        }
        s.skore(fc.name[lang], `${f.raw}/${f.max}`, f.band, f.percent, lang)
        s.text(vt(fc.bands[f.band], variant, lang, gender), {
          velikost: 8.8,
          barva: BARVA.slaba,
          radek: 4.2,
        })
        s.mezera(3)
      }
    }
    s.mezera(3)
    s.linka()
    s.mezera(3)
  }

  // ---------- rozvojová doporučení ----------
  if (result.weakest.length) {
    s.misto(40)
    s.mezera(2)
    s.text(t.developmentTitle, { velikost: 15, tucne: true })
    s.mezera(1)
    s.text(t.developmentIntro, { velikost: 9, barva: BARVA.slaba, radek: 4.2 })
    s.mezera(3)
    result.weakest.forEach((w, i) => {
      const jeDim = w.id.length === 1
      const nazev = jeDim
        ? getDimensionContent(w.id as DimensionId).name[lang]
        : getFacetContent(w.id)?.name[lang] ?? w.id
      const rozvoj = jeDim ? undefined : getFacetContent(w.id)?.development
      const nahrada = jeDim ? getDimensionContent(w.id as DimensionId).bands[w.band] : undefined
      s.misto(22)
      s.text(`${i + 1}. ${nazev}`, { velikost: 10.5, tucne: true })
      s.mezera(1)
      s.text(
        rozvoj ? vt(rozvoj, variant, lang, gender) : nahrada ? vt(nahrada, variant, lang, gender) : "",
        { velikost: 9.3, radek: 4.5 },
      )
      s.mezera(4)
    })
  }

  // ---------- shrnutí ----------
  const summary = buildSummary(result, lang)
  const heading = summaryHeading(lang, gender)
  // Shrnutí je pro klienta to nejdůležitější a musí držet pohromadě, proto
  // dostává vlastní stránku místo toho, aby se lámalo přes dvě.
  s.zalom()
  s.text(heading.title, { velikost: 15, tucne: true, barva: BARVA.znacka })
  s.mezera(1)
  s.text(heading.intro, { velikost: 9, barva: BARVA.slaba })
  s.mezera(4)
  for (const cast of [summary.overall, summary.strengths, summary.priorities]) {
    if (!cast) continue
    s.text(applyGender(cast, gender), { velikost: 10.5, radek: 5 })
    s.mezera(3)
  }
  if (summary.caveat) {
    s.ramecek(applyGender(summary.caveat, gender), { velikost: 9.8 })
    s.mezera(1)
  }
  if (summary.nextStep) {
    s.ramecek(applyGender(summary.nextStep, gender), { velikost: 10.2, tucne: true })
  }

  // ---------- patička na každé straně ----------
  const stran = doc.getNumberOfPages()
  for (let i = 1; i <= stran; i++) {
    doc.setPage(i)
    doc.setFont("Liberation", "normal")
    doc.setFontSize(7.5)
    doc.setTextColor(BARVA.slaba[0], BARVA.slaba[1], BARVA.slaba[2])
    doc.text(t.confidential, OKRAJ.levy, A4.vyska - 10)
    doc.text(`${i}/${stran}`, A4.sirka - OKRAJ.pravy, A4.vyska - 10, { align: "right" })
  }

  return doc.output("blob")
}
