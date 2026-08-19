import { jsPDF } from "jspdf"
import { FONT_BOLD, FONT_REGULAR } from "@/lib/diagnostic/pdf/font"
import { applyGender } from "@/lib/diagnostic/gender"
import type { Gender, Lang } from "@/lib/diagnostic/types"
import { NAZVY_METRIK, NAZVY_REFLEXE, UI, cislo } from "./i18n"
import {
  HODINY,
  METRIKY,
  POSLEDNI_HODINA,
  PRVNI_HODINA,
  REFLEXE,
  ROZSAH,
  type PlannerDay,
  type PlannerHabit,
} from "./types"
import { ZKRATKY_DNU, dnyTydne, popisRozsahuTydne } from "./datum"

// Export týdenního listu do PDF.
//
// Proč se PDF skládá tady a nenechává se na tiskovém dialogu prohlížeče: na
// iPhonu z tiskového dialogu nejde soubor uložit ani odeslat. Takhle vznikne
// skutečný soubor, který jde přes systémové sdílení poslat dál nebo uložit
// do Souborů. Je to stejný důvod jako u vyhodnocení diagnostiky, jen pro
// jiný obsah, takže se sdílí i vložené písmo.
//
// SOUŘADNICE: rozvržení se drží tištěné předlohy, a to doslova. Konstanty
// níž jsou původní hodnoty z papírového plánovače v bodech, se souřadnicí
// zdola nahoru, jak je má PDF. Funkce X() a Y() je převedou na milimetry a
// na počátek vlevo nahoře, se kterým počítá jsPDF. Díky tomu se dá kód
// porovnat s předlohou řádek po řádku a nikdo nemusí přepočítávat v hlavě.

const BOD = 2.834646 // bodů na milimetr
const STRANA = { sirka: 297, vyska: 210 }

/** Vodorovná souřadnice z bodů předlohy na milimetry. */
const X = (pt: number) => pt / BOD
/** Svislá souřadnice z bodů předlohy (zdola) na milimetry (shora). */
const Y = (pt: number) => STRANA.vyska - pt / BOD
/** Rozměr z bodů na milimetry. */
const D = (pt: number) => pt / BOD

type RGB = [number, number, number]

const BARVA = {
  papir: [249, 247, 242] as RGB,
  ram: [184, 180, 170] as RGB,
  linka: [226, 222, 212] as RGB,
  linkaSlaba: [236, 232, 223] as RGB,
  pruh: [20, 20, 20] as RGB,
  pruhText: [255, 255, 255] as RGB,
  text: [31, 31, 31] as RGB,
  text2: [92, 88, 80] as RGB,
  text3: [139, 135, 126] as RGB,
}

/**
 * Znaky, které vložené písmo umí.
 *
 * Je osekané jen na to, co aplikace potřebuje, takže cokoli mimo by se
 * vytisklo jako prázdné místo. Text z deníku píše člověk, ne aplikace, takže
 * se sem dostane i emotikon nebo cizí abeceda. Místo prázdna se z takového
 * znaku sundá diakritika, a když ani to nepomůže, vypustí se: nečitelný
 * čtvereček v tisku vypadá jako chyba programu, chybějící emotikon ne.
 */
const PODPOROVANE =
  // Rozsahy jdou po řadě: ASCII, latinka se západní diakritikou, česká
  // a slovenská písmena, typografická interpunkce, značky a šipky.
  // Pomlčky a uvozovky se píšou kódem, ne znakem: dlouhá pomlčka se
  // v tomhle projektu nikde nepoužívá a ve zdrojáku by se hledala jako
  // chyba, i když je tu jen jako povolený vstup z klientova textu.
  /[ -~\u00A3\u00A7\u00A9\u00AB\u00AE\u00B0\u00B1\u00B7\u00BB\u00C0-\u00C2\u00C4\u00C7-\u00CB\u00CD\u00D3\u00D4\u00D6-\u00D8\u00DA\u00DC\u00DD\u00DF-\u00E2\u00E4\u00E7-\u00EB\u00ED\u00F3\u00F4\u00F6\u00FA\u00FC\u00FD\u010C-\u010F\u011A\u011B\u0139\u013A\u013D\u013E\u0147\u0148\u0154\u0155\u0158\u0159\u0160\u0161\u0164\u0165\u016E\u016F\u017D\u017E\u2013\u2014\u2018-\u201A\u201C-\u201E\u2022\u2026\u20AC\u2122\u2190-\u2193\u2264\u2265]/

export function ocisti(text: string): string {
  let out = ""
  for (const znak of text) {
    if (PODPOROVANE.test(znak)) {
      out += znak
      continue
    }
    // Druhý pokus bez diakritiky: „ñ" projde jako „n", což je pořád čitelné.
    const bez = znak.normalize("NFD").replace(/[\u0300-\u036F]/g, "")
    if (bez && [...bez].every((z) => PODPOROVANE.test(z))) out += bez
  }
  return out
}

interface Sazec {
  doc: jsPDF
  text: (t: string, x: number, y: number, velikost: number, tucne?: boolean, barva?: RGB) => void
  textNaStred: (t: string, x: number, y: number, velikost: number, tucne?: boolean, barva?: RGB) => void
  textVpravo: (t: string, x: number, y: number, velikost: number, tucne?: boolean, barva?: RGB) => void
  linka: (x1: number, y1: number, x2: number, y2: number, barva: RGB, tloustka: number) => void
  ramecek: (x: number, y: number, w: number, h: number, barva: RGB, tloustka: number) => void
}

function sazec(doc: jsPDF): Sazec {
  const nastav = (velikost: number, tucne: boolean, barva: RGB) => {
    doc.setFont("Liberation", tucne ? "bold" : "normal")
    doc.setFontSize(velikost)
    doc.setTextColor(barva[0], barva[1], barva[2])
  }
  return {
    doc,
    text: (t, x, y, velikost, tucne = false, barva = BARVA.text) => {
      nastav(velikost, tucne, barva)
      doc.text(ocisti(t), x, y)
    },
    textNaStred: (t, x, y, velikost, tucne = false, barva = BARVA.text) => {
      nastav(velikost, tucne, barva)
      doc.text(ocisti(t), x, y, { align: "center" })
    },
    textVpravo: (t, x, y, velikost, tucne = false, barva = BARVA.text) => {
      nastav(velikost, tucne, barva)
      doc.text(ocisti(t), x, y, { align: "right" })
    },
    linka: (x1, y1, x2, y2, barva, tloustka) => {
      doc.setDrawColor(barva[0], barva[1], barva[2])
      doc.setLineWidth(tloustka)
      doc.line(x1, y1, x2, y2)
    },
    ramecek: (x, y, w, h, barva, tloustka) => {
      doc.setDrawColor(barva[0], barva[1], barva[2])
      doc.setLineWidth(tloustka)
      doc.rect(x, y, w, h)
    },
  }
}

/** Text zkrácený tak, aby se vešel do dané šířky. */
function vejdiSe(doc: jsPDF, text: string, sirka: number, velikost: number): string {
  const cisty = ocisti(text)
  doc.setFontSize(velikost)
  if (doc.getTextWidth(cisty) <= sirka) return cisty
  let s = cisty
  while (s.length > 1 && doc.getTextWidth(`${s}…`) > sirka) s = s.slice(0, -1)
  return `${s}…`
}

export interface PdfVstupTydne {
  monday: string
  dny: Map<string, PlannerDay>
  poznamky: string
  navyky: PlannerHabit[]
  jmeno: string
  lang: Lang
  gender: Gender
}

/** Název souboru: týden a jméno. */
export function nazevSouboru(v: PdfVstupTydne): string {
  return `weekly-planner-${v.monday}-${v.jmeno}`
    .replace(/[/\\?%*:|"<>]/g, "-")
    .replace(/\s+/g, "-")
    .slice(0, 120)
    .concat(".pdf")
}

export function sestavTydenniPdf(v: PdfVstupTydne): Blob {
  const { monday, dny, poznamky, navyky, jmeno, lang, gender } = v
  const t = UI[lang]
  const data = dnyTydne(monday)
  const zkratky = ZKRATKY_DNU[lang]

  const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "landscape", compress: true })
  doc.addFileToVFS("Liberation-Regular.ttf", FONT_REGULAR)
  doc.addFont("Liberation-Regular.ttf", "Liberation", "normal")
  doc.addFileToVFS("Liberation-Bold.ttf", FONT_BOLD)
  doc.addFont("Liberation-Bold.ttf", "Liberation", "bold")
  const s = sazec(doc)

  // ── podklad a vnější rámeček ────────────────────────────────────────────
  doc.setFillColor(BARVA.papir[0], BARVA.papir[1], BARVA.papir[2])
  doc.rect(0, 0, STRANA.sirka, STRANA.vyska, "F")
  doc.setDrawColor(BARVA.ram[0], BARVA.ram[1], BARVA.ram[2])
  doc.setLineWidth(0.35)
  doc.roundedRect(X(28), Y(567.28), D(785.89), D(539.28), 3.5, 3.5)

  // ── černé pruhy v hlavičce ──────────────────────────────────────────────
  doc.setFillColor(BARVA.pruh[0], BARVA.pruh[1], BARVA.pruh[2])
  doc.rect(X(34), Y(561.28), D(426), D(26), "F")
  doc.rect(X(476), Y(561.28), D(331.89), D(26), "F")
  s.textNaStred(t.weeklyPlan, X(34 + 426 / 2), Y(544.5), 9, true, BARVA.pruhText)
  s.textNaStred(t.habitsProgress, X(476 + 331.89 / 2), Y(544.5), 9, true, BARVA.pruhText)

  // ── řádek s obdobím a jménem ────────────────────────────────────────────
  s.text(`${t.weekOf.toUpperCase()}:  ${popisRozsahuTydne(monday, lang)}`, X(34), Y(521.28), 7.5, false)
  s.textVpravo(
    `${lang === "en" ? "FOR" : "PRO"}:  ${jmeno.toUpperCase()}`,
    X(460),
    Y(521.28),
    7.5,
    true,
  )

  // ── týdenní rozvrh ──────────────────────────────────────────────────────
  s.text(t.weeklySchedule, X(34), Y(503.28), 8, true)
  s.ramecek(X(34), Y(495.28), D(426), D(243.28), BARVA.ram, 0.32)
  s.linka(X(34), Y(480.28), X(460), Y(480.28), BARVA.ram, 0.32)
  s.linka(X(68), Y(495.28), X(68), Y(252), BARVA.ram, 0.32)

  const sirkaDne = 56 // bodů, sedm sloupců od x = 68
  data.forEach((_, i) => {
    s.textNaStred(zkratky[i], X(68 + sirkaDne * (i + 0.5)), Y(484.4), 6.4, true)
    if (i > 0) s.linka(X(68 + sirkaDne * i), Y(480.28), X(68 + sirkaDne * i), Y(252), BARVA.linkaSlaba, 0.18)
  })

  const vyskaRadku = (480.28 - 252) / HODINY.length
  HODINY.forEach((h, i) => {
    const horni = 480.28 - vyskaRadku * i
    const dolni = horni - vyskaRadku
    s.linka(X(34), Y(dolni), X(460), Y(dolni), BARVA.linkaSlaba, 0.16)
    s.textVpravo(`${String(h).padStart(2, "0")}:00`, X(66), Y(dolni + 3.4), 6, false, BARVA.text3)
    data.forEach((datum, j) => {
      const text = dny.get(datum)?.schedule.find((b) => b.hour === h)?.text
      if (!text) return
      s.text(
        vejdiSe(doc, text, D(sirkaDne - 4), 5.6),
        X(68 + sirkaDne * j + 2),
        Y(dolni + 3.2),
        5.6,
        false,
        BARVA.text,
      )
    })
  })

  // ── poznámky a nápady ───────────────────────────────────────────────────
  s.text(t.notesIdeas, X(34), Y(240), 8, true)
  s.ramecek(X(34), Y(234), D(426), D(60), BARVA.ram, 0.32)
  for (const y of [218, 202, 186]) s.linka(X(40), Y(y), X(454), Y(y), BARVA.linkaSlaba, 0.16)
  if (poznamky.trim()) {
    doc.setFont("Liberation", "normal")
    doc.setFontSize(6.6)
    const radky = doc.splitTextToSize(ocisti(poznamky), D(414)) as string[]
    radky.slice(0, 4).forEach((r, i) => {
      s.text(r, X(40), Y(221 - i * 16), 6.6, false, BARVA.text)
    })
  }

  // ── tracker návyků ──────────────────────────────────────────────────────
  s.text(t.habitTracker, X(476), Y(521.28), 8, true)

  // Sloupce trackeru i denního postupu sedí na sobě, proto stejná rozteč.
  const prvniSloupec = 629.7
  const roztec = 27.41
  data.forEach((_, i) => {
    s.textNaStred(zkratky[i].slice(0, 2), X(prvniSloupec + roztec * i), Y(521.28), 6.4, true)
  })

  const viditelne = navyky.filter(
    (h) => !h.archivedAt || data.some((d) => dny.get(d)?.habits.includes(h.id)),
  )
  const prostor = 495.28 - 345 // bodů mezi hlavičkou trackeru a denním postupem
  // Rozteč se přizpůsobí počtu návyků. Dolní mez drží kolečka od sebe i při
  // plném trackeru; strop nechá pěti návykům stejnou sazbu jako na papíře.
  const roztecRadku = Math.max(
    7.6,
    Math.min(28.93, viditelne.length ? prostor / viditelne.length : 28.93),
  )
  const polomer = Math.min(1.55, D(roztecRadku) * 0.28)
  const velikostNazvu = roztecRadku >= 20 ? 7 : roztecRadku >= 12 ? 6 : 5

  viditelne.forEach((h, i) => {
    const y = 492.41 - roztecRadku * i
    const nazev = h.target ? `${h.name} (${h.target}x)` : h.name
    s.text(vejdiSe(doc, nazev, D(prvniSloupec - 480 - 8), velikostNazvu), X(480), Y(y), velikostNazvu)
    data.forEach((datum, j) => {
      const stred = { x: X(prvniSloupec + roztec * j), y: Y(y + 2.4) }
      const splneno = dny.get(datum)?.habits.includes(h.id) ?? false
      doc.setDrawColor(BARVA.text[0], BARVA.text[1], BARVA.text[2])
      doc.setLineWidth(0.32)
      if (splneno) {
        doc.setFillColor(BARVA.text[0], BARVA.text[1], BARVA.text[2])
        doc.circle(stred.x, stred.y, polomer, "FD")
      } else {
        doc.circle(stred.x, stred.y, polomer, "S")
      }
    })
  })

  // ── denní postup ────────────────────────────────────────────────────────
  s.text(t.dailyProgress, X(476), Y(340.64), 8, true)
  s.text(t.dailyProgressHint, X(476 + 96), Y(340.64), 6, false, BARVA.text3)
  s.ramecek(X(476), Y(332.64), D(331.89), D(158.64), BARVA.ram, 0.32)
  s.linka(X(476), Y(318.64), X(807.89), Y(318.64), BARVA.ram, 0.32)
  s.linka(X(616), Y(332.64), X(616), Y(174), BARVA.ram, 0.32)
  data.forEach((_, i) => {
    s.textNaStred(zkratky[i].slice(0, 2), X(prvniSloupec + roztec * i), Y(322.2), 6.2, true)
    if (i > 0)
      s.linka(
        X(616 + roztec * i),
        Y(318.64),
        X(616 + roztec * i),
        Y(174),
        BARVA.linkaSlaba,
        0.18,
      )
  })

  const vyskaUkazatele = (318.64 - 174) / METRIKY.length
  METRIKY.forEach((m, i) => {
    const horni = 318.64 - vyskaUkazatele * i
    const dolni = horni - vyskaUkazatele
    if (i > 0) s.linka(X(476), Y(horni), X(807.89), Y(horni), BARVA.linkaSlaba, 0.16)
    s.text(
      vejdiSe(doc, NAZVY_METRIK[lang][m].toUpperCase(), D(132), 6.2),
      X(482),
      Y(dolni + vyskaUkazatele / 2 - 2),
      6.2,
      false,
      BARVA.text2,
    )
    data.forEach((datum, j) => {
      const v = dny.get(datum)?.ratings[m]
      if (typeof v !== "number") return
      s.textNaStred(
        cislo(v, lang, ROZSAH[m].hodiny ? 1 : 0),
        X(prvniSloupec + roztec * j),
        Y(dolni + vyskaUkazatele / 2 - 2),
        7,
        true,
      )
    })
  })

  // ── denní reflexe ───────────────────────────────────────────────────────
  s.text(t.dailyReflection, X(34), Y(164), 7.5, true)
  s.ramecek(X(34), Y(158), D(773.89), D(86), BARVA.ram, 0.32)
  s.linka(X(34), Y(143), X(807.89), Y(143), BARVA.ram, 0.32)
  s.linka(X(118), Y(158), X(118), Y(72), BARVA.ram, 0.32)

  const sirkaReflexe = (807.89 - 118) / 7
  data.forEach((_, i) => {
    s.textNaStred(zkratky[i], X(118 + sirkaReflexe * (i + 0.5)), Y(147.4), 6.4, true)
    if (i > 0)
      s.linka(
        X(118 + sirkaReflexe * i),
        Y(143),
        X(118 + sirkaReflexe * i),
        Y(72),
        BARVA.linkaSlaba,
        0.18,
      )
  })

  const vyskaReflexe = (143 - 72) / REFLEXE.length
  REFLEXE.forEach((klic, i) => {
    const horni = 143 - vyskaReflexe * i
    const dolni = horni - vyskaReflexe
    if (i > 0) s.linka(X(34), Y(horni), X(807.89), Y(horni), BARVA.linkaSlaba, 0.16)
    s.text(
      vejdiSe(doc, applyGender(NAZVY_REFLEXE[lang][klic], gender).toUpperCase(), D(78), 6.2),
      X(40),
      Y(dolni + vyskaReflexe / 2 - 1.5),
      6.2,
      false,
      BARVA.text2,
    )
    data.forEach((datum, j) => {
      const text = dny.get(datum)?.reflection[klic]
      if (!text) return
      doc.setFont("Liberation", "normal")
      doc.setFontSize(5.6)
      const radky = doc.splitTextToSize(ocisti(text), D(sirkaReflexe - 6)) as string[]
      radky.slice(0, 3).forEach((r, k) => {
        s.text(r, X(118 + sirkaReflexe * j + 3), Y(horni - 6 - k * 6.4), 5.6, false, BARVA.text)
      })
    })
  })

  // ── patička ─────────────────────────────────────────────────────────────
  s.textNaStred(t.motto, X(841.89 / 2), Y(45), 7.5, false, BARVA.text2)
  s.text("Winning Minds", X(34), Y(45), 7, true, BARVA.text3)

  return doc.output("blob")
}

/** Kontrola, že se rozvrh vejde do rozsahu hodin, se kterým počítá sazba. */
export function rozsahHodinSedi(): boolean {
  return HODINY[0] === PRVNI_HODINA && HODINY[HODINY.length - 1] === POSLEDNI_HODINA
}
