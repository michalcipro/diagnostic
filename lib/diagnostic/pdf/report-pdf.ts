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
//
// Sazba stojí na jednom svislém rytmu: každý blok si nejdřív řekne o místo,
// pak se vykreslí. Pruh skóre má vždy dráhu přes celou šířku sazby a nad
// i pod sebou vzduch, aby nesplýval s textem pod ním.
//
// Barva pruhu je jedna pro všechna pásma. Pásmo nese štítek se slovem, ne
// odstín: červená a oranžová jsou pro protanopii prakticky totožné, takže
// čtyři barevně kódovaná pásma by pro část lidí nesla nulovou informaci.
// Štítek má text vždy, takže barva je jen doprovod.

const A4 = { sirka: 210, vyska: 297 }
const OKRAJ = { levy: 18, pravy: 18, horni: 20, dolni: 22 }
const SIRKA = A4.sirka - OKRAJ.levy - OKRAJ.pravy
const PRAVY_KRAJ = A4.sirka - OKRAJ.pravy

type RGB = [number, number, number]

const BARVA = {
  text: [28, 28, 30] as RGB,
  text2: [90, 90, 95] as RGB,
  slaba: [142, 142, 147] as RGB,
  linka: [226, 226, 231] as RGB,
  podklad: [244, 244, 247] as RGB,
  drazka: [230, 230, 236] as RGB,
  znacka: [0, 113, 227] as RGB,
}

/** Štítek pásma: barva textu a podkladu. Text štítku nese význam vždy. */
const STITEK_PASMA: Record<BandKey, { pismo: RGB; podklad: RGB }> = {
  priority: { pismo: [192, 15, 45], podklad: [253, 236, 236] },
  stabilization: { pismo: [167, 82, 0], podklad: [253, 241, 227] },
  strong: { pismo: [10, 95, 189], podklad: [233, 242, 253] },
  elite: { pismo: [26, 127, 55], podklad: [230, 245, 234] },
}

/** Datum v českém tvaru. Vstup je ISO, ať se dá řadit. */
function datumCesky(iso: string | undefined, lang: Lang): string {
  if (!iso) return ""
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso)
  if (!m) return iso
  if (lang === "en") return `${Number(m[3])} ${["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][Number(m[2]) - 1]} ${m[1]}`
  return `${Number(m[3])}. ${Number(m[2])}. ${m[1]}`
}

/** Sazeč, který si hlídá pozici na stránce a sám zalamuje. */
class Sazba {
  doc: jsPDF
  y = OKRAJ.horni

  constructor(doc: jsPDF) {
    this.doc = doc
  }

  /** Zalomí stránku, pokud se výška nevejde. */
  misto(vyska: number) {
    if (this.y + vyska <= A4.vyska - OKRAJ.dolni) return
    this.zalom()
  }

  mezera(v: number) {
    this.y += v
  }

  /** Vynucené zalomení na novou stránku. */
  zalom() {
    this.doc.addPage()
    this.y = OKRAJ.horni
  }

  /** Kolik místa na stránce ještě zbývá. */
  zbyva(): number {
    return A4.vyska - OKRAJ.dolni - this.y
  }

  private pismo(velikost: number, tucne = false, barva: RGB = BARVA.text) {
    this.doc.setFont("Liberation", tucne ? "bold" : "normal")
    this.doc.setFontSize(velikost)
    this.doc.setTextColor(barva[0], barva[1], barva[2])
  }

  /** Šířka textu v aktuálním písmu. */
  private sirkaTextu(t: string, velikost: number, tucne = false): number {
    this.pismo(velikost, tucne)
    return this.doc.getTextWidth(t)
  }

  /** Odstavec se zalomením mezi stránkami. */
  text(
    obsah: string,
    opts: {
      velikost?: number
      tucne?: boolean
      barva?: RGB
      sirka?: number
      x?: number
      radek?: number
      prostrkani?: number
    } = {},
  ) {
    if (!obsah) return
    const velikost = opts.velikost ?? 9.6
    const sirka = opts.sirka ?? SIRKA
    const x = opts.x ?? OKRAJ.levy
    const radek = opts.radek ?? velikost * 0.5
    this.pismo(velikost, opts.tucne, opts.barva)
    const radky = this.doc.splitTextToSize(obsah, sirka) as string[]
    for (const r of radky) {
      this.misto(radek)
      this.pismo(velikost, opts.tucne, opts.barva)
      this.doc.text(r, x, this.y, opts.prostrkani ? { charSpace: opts.prostrkani } : undefined)
      this.y += radek
    }
  }

  /** Vodorovná linka přes celou sazbu. */
  linka(barva: RGB = BARVA.linka) {
    this.misto(1)
    this.doc.setDrawColor(barva[0], barva[1], barva[2])
    this.doc.setLineWidth(0.2)
    this.doc.line(OKRAJ.levy, this.y, PRAVY_KRAJ, this.y)
  }

  /** Nadpis oddílu: text a pod ním tenká linka. */
  nadpis(text: string, velikost = 13.5) {
    this.misto(velikost * 0.6 + 14)
    this.text(text, { velikost, tucne: true, radek: velikost * 0.34 })
    this.mezera(3)
    this.linka()
    this.mezera(6)
  }

  /**
   * Štítek pásma. Kreslí se doprava od `konec`, vrací svoji šířku, aby se
   * vedle něj dalo zarovnat skóre.
   */
  stitek(popis: string, pasmo: BandKey, konec: number, stred: number): number {
    const velikost = 7.4
    const sirka = this.sirkaTextu(popis, velikost, true) + 5.4
    const vyska = 4.6
    const b = STITEK_PASMA[pasmo]
    this.doc.setFillColor(b.podklad[0], b.podklad[1], b.podklad[2])
    this.doc.roundedRect(konec - sirka, stred - vyska / 2, sirka, vyska, 2.3, 2.3, "F")
    this.pismo(velikost, true, b.pismo)
    this.doc.text(popis, konec - sirka / 2, stred + 1.15, { align: "center" })
    return sirka
  }

  /** Dráha s výplní. Kreslí se na dané y, nemění pozici sazby. */
  pruh(y: number, procenta: number, opts: { vyska?: number; x?: number; sirka?: number } = {}) {
    const vyska = opts.vyska ?? 2.6
    const x = opts.x ?? OKRAJ.levy
    const sirka = opts.sirka ?? SIRKA
    const r = vyska / 2
    this.doc.setFillColor(BARVA.drazka[0], BARVA.drazka[1], BARVA.drazka[2])
    this.doc.roundedRect(x, y, sirka, vyska, r, r, "F")
    const w = Math.max(vyska, (sirka * Math.min(100, Math.max(0, procenta))) / 100)
    this.doc.setFillColor(BARVA.znacka[0], BARVA.znacka[1], BARVA.znacka[2])
    this.doc.roundedRect(x, y, w, vyska, r, r, "F")
  }

  /**
   * Řádek se skóre: název vlevo, hodnota a štítek vpravo, pod tím pruh.
   * Odsazení `uroven` odlišuje fazety od dimenzí.
   */
  radekSkore(
    nazev: string,
    hodnota: string,
    pasmo: BandKey,
    procenta: number,
    lang: Lang,
    opts: { odsazeni?: number; velikost?: number; tucne?: boolean; mezeraPo?: number } = {},
  ) {
    const odsazeni = opts.odsazeni ?? 0
    const velikost = opts.velikost ?? 9.8
    const x = OKRAJ.levy + odsazeni
    const sirka = SIRKA - odsazeni

    this.misto(11)
    const zaklad = this.y

    const sirkaStitku = this.stitek(BAND_LABELS[lang][pasmo], pasmo, PRAVY_KRAJ, zaklad - 1)

    this.pismo(9.4, true, BARVA.text)
    const konecHodnoty = PRAVY_KRAJ - sirkaStitku - 3
    this.doc.text(hodnota, konecHodnoty, zaklad, { align: "right" })
    const sirkaHodnoty = this.doc.getTextWidth(hodnota)

    // Název se ořízne tak, aby nikdy nevlezl pod hodnotu.
    const mistoNaNazev = sirka - sirkaStitku - sirkaHodnoty - 8
    this.pismo(velikost, opts.tucne ?? false, opts.tucne ? BARVA.text : BARVA.text2)
    const [prvniRadek] = this.doc.splitTextToSize(nazev, mistoNaNazev) as string[]
    this.doc.text(prvniRadek ?? nazev, x, zaklad)

    // Pruh patří k řádku nad sebou, proto je nad ním míň místa než pod ním.
    this.y = zaklad + 3
    const vyskaPruhu = odsazeni ? 2.2 : 2.8
    this.pruh(this.y, procenta, { x, sirka, vyska: vyskaPruhu })
    this.y += vyskaPruhu + (opts.mezeraPo ?? 7)
  }

  /** Řádek pro škálu, která se pro chybějící odpovědi nevykazuje. */
  radekChybi(nazev: string, popis: string, odsazeni = 0) {
    this.misto(9)
    const zaklad = this.y
    const x = OKRAJ.levy + odsazeni
    this.pismo(9.4, false, BARVA.text2)
    this.doc.text(nazev, x, zaklad)
    this.pismo(8.4, false, BARVA.slaba)
    this.doc.text(popis, PRAVY_KRAJ, zaklad, { align: "right" })
    this.y = zaklad + 3.2
    this.doc.setDrawColor(BARVA.linka[0], BARVA.linka[1], BARVA.linka[2])
    this.doc.setLineWidth(0.4)
    this.doc.setLineDashPattern([1, 1.2], 0)
    this.doc.line(x, this.y + 1.2, x + SIRKA - odsazeni, this.y + 1.2)
    this.doc.setLineDashPattern([], 0)
    this.y += 6.4
  }

  /**
   * Mřížka údajů: nad hodnotou drobný popisek. Sloupce mají stejnou šířku,
   * takže hlavička lícuje bez ohledu na délku hodnot.
   */
  mrizkaUdaju(polozky: { popis: string; hodnota: string }[], sloupcu = 3, velikost = 9.8) {
    if (!polozky.length) return
    // Čtyři údaje ve třech sloupcích nechají poslední osamocený; dva sloupce
    // je rozdělí na dvě plné řady.
    if (polozky.length === 4 && sloupcu === 3) sloupcu = 2
    const sirkaSloupce = SIRKA / sloupcu
    for (let i = 0; i < polozky.length; i += sloupcu) {
      const rada = polozky.slice(i, i + sloupcu)
      // nejvyšší buňka v řadě určuje výšku
      let radku = 1
      for (const p of rada) {
        this.pismo(velikost, true)
        radku = Math.max(radku, (this.doc.splitTextToSize(p.hodnota, sirkaSloupce - 6) as string[]).length)
      }
      const vyska = 3.4 + radku * (velikost * 0.5) + 3
      this.misto(vyska)
      const zaklad = this.y
      rada.forEach((p, j) => {
        const x = OKRAJ.levy + j * sirkaSloupce
        this.pismo(6.8, true, BARVA.slaba)
        this.doc.text(p.popis.toUpperCase(), x, zaklad, { charSpace: 0.35 })
        this.pismo(velikost, true, BARVA.text)
        const radky = this.doc.splitTextToSize(p.hodnota, sirkaSloupce - 6) as string[]
        radky.forEach((r, k) => this.doc.text(r, x, zaklad + 4.2 + k * (velikost * 0.5)))
      })
      this.y = zaklad + vyska
    }
  }

  /** Odstavec na barevném podkladu. */
  ramecek(obsah: string, opts: { velikost?: number; tucne?: boolean; barva?: RGB } = {}) {
    const velikost = opts.velikost ?? 9.6
    const radek = velikost * 0.52
    this.pismo(velikost, opts.tucne)
    const radky = this.doc.splitTextToSize(obsah, SIRKA - 12) as string[]
    const vyska = radky.length * radek + 9
    this.misto(vyska + 2)
    const podklad = opts.barva ?? BARVA.podklad
    this.doc.setFillColor(podklad[0], podklad[1], podklad[2])
    this.doc.roundedRect(OKRAJ.levy, this.y, SIRKA, vyska, 3, 3, "F")
    this.y += 6
    for (const r of radky) {
      this.pismo(velikost, opts.tucne, BARVA.text)
      this.doc.text(r, OKRAJ.levy + 6, this.y)
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
    { popis: t.filledLabel, hodnota: datumCesky(person.fillDate, lang) },
  ]
  if (person.birthDate) {
    udaje.push({ popis: t.birthLabel, hodnota: datumCesky(person.birthDate, lang) })
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
      s.radekSkore(nazev, `${d.raw}/${d.max}`, d.band, d.percent, lang, {
        tucne: true,
        mezeraPo: 8,
      })
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
    s.radekSkore("", `${d.raw}/${d.max}`, d.band, d.percent, lang, {
      tucne: true,
      mezeraPo: 6.5,
    })
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
        s.radekSkore(fc.name[lang], `${f.raw}/${f.max}`, f.band, f.percent, lang, {
          odsazeni: 6,
          velikost: 9.4,
          mezeraPo: 5.5,
        })
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

  // ---------- patička na každé straně ----------
  const stran = doc.getNumberOfPages()
  for (let i = 1; i <= stran; i++) {
    doc.setPage(i)
    doc.setDrawColor(BARVA.linka[0], BARVA.linka[1], BARVA.linka[2])
    doc.setLineWidth(0.2)
    doc.line(OKRAJ.levy, A4.vyska - 14, PRAVY_KRAJ, A4.vyska - 14)
    doc.setFont("Liberation", "normal")
    doc.setFontSize(7.4)
    doc.setTextColor(BARVA.slaba[0], BARVA.slaba[1], BARVA.slaba[2])
    doc.text(t.confidential, OKRAJ.levy, A4.vyska - 9.5)
    doc.text(`${i}/${stran}`, PRAVY_KRAJ, A4.vyska - 9.5, { align: "right" })
  }

  return doc.output("blob")
}
