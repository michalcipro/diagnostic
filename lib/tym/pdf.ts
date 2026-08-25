import {
  BARVA,
  OKRAJ,
  PRAVY_KRAJ,
  SIRKA,
  Sazba,
  novyDokument,
  type RGB,
} from "../diagnostic/pdf/sazba"
import { TYM, type TymLang } from "./obsah"
import type { NalezKod } from "./typy"
import type { DimensionId } from "../diagnostic/types"

// PDF týmového reportu.
//
// Stejný obsah i pořadí jako na obrazovce: nejdřív co z profilu plyne, potom
// čím je to podložené. Kouč, který dočte první stranu a dál se nedostane, má
// mít to podstatné.
//
// Vstup je hotový profil ze serveru. Prahy, podle kterých nálezy vznikly,
// tady nejsou a nemají tu co dělat.

/** Profil, jak ho vrací server. Drží se tvaru z convex/teams.ts. */
export interface TymPdfVstup {
  nazev: string
  pozvano: number
  odevzdano: number
  zapocteno: number
  oblasti: {
    id: string
    prumer: number
    smodch: number
    min: number
    max: number
    pasma: { priority: number; stabilization: number; strong: number; elite: number }
    rozkol: boolean
    plosna: boolean
  }[]
  opory: string[]
  priority: string[]
  zlomy: string[]
  nalezy: { kod: string; sila: "vysoka" | "stredni"; oblasti: string[] }[]
  maloDat: boolean
}

const PORADI: DimensionId[] = ["A", "B", "C", "D", "E", "F", "G"]
const CERVENA: RGB = [255, 59, 48]
const ZELENA: RGB = [48, 209, 88]
const ORANZOVA: RGB = [255, 149, 0]

export function buildTymPdf(data: TymPdfVstup, lang: TymLang): Blob {
  const t = TYM[lang]
  const doc = novyDokument()
  const s = new Sazba(doc)
  const podleId = new Map(data.oblasti.map((o) => [o.id, o]))

  // ---- hlavička ----
  s.doc.setFillColor(BARVA.znacka[0], BARVA.znacka[1], BARVA.znacka[2])
  s.doc.roundedRect(OKRAJ.levy, s.y, 32, 1.4, 0.7, 0.7, "F")
  s.mezera(9)
  s.text(data.nazev, { velikost: 24, tucne: true, radek: 10 })
  s.mezera(1)
  s.text(t.titul.toUpperCase(), {
    velikost: 7.6,
    tucne: true,
    barva: BARVA.slaba,
    radek: 4.4,
    prostrkani: 0.5,
  })
  s.mezera(3)
  s.text(t.podtitul, { velikost: 10.2, barva: BARVA.text2, radek: 5, sirka: SIRKA * 0.84 })
  s.mezera(2)
  s.text(t.pocty(data.odevzdano, data.pozvano), { velikost: 9, barva: BARVA.slaba, radek: 4.4 })
  s.mezera(6)

  if (data.maloDat) {
    s.ramecek(`${t.maloDatTitul}. ${t.maloDat}`, { velikost: 9.4 })
    s.mezera(4)
  }

  // ---- co z toho plyne ----
  s.nadpis(t.nalezyTitul)
  s.text(t.nalezyUvod, { velikost: 9.8, barva: BARVA.text2, radek: 4.7 })
  s.mezera(5)

  if (!data.nalezy.length) {
    s.text(t.bezNalezu, { velikost: 10, barva: BARVA.text2, radek: 4.8 })
    s.mezera(4)
  }

  data.nalezy.forEach((n, i) => {
    const text = t.nalezy[n.kod as NalezKod]
    if (!text) return
    s.misto(46)
    s.mezera(2)

    if (i === 0 && n.sila === "vysoka") {
      s.pismo(7.4, true, CERVENA)
      s.doc.text(t.prvniPraskne.toUpperCase(), OKRAJ.levy, s.y, { charSpace: 0.5 })
      s.mezera(5)
    }

    const zaklad = s.y
    s.text(text.nadpis, { velikost: 13, tucne: true, radek: 5.6, sirka: SIRKA - 26 })
    const oblastiText = n.oblasti.join(" · ")
    if (oblastiText) {
      s.pismo(8.4, true, BARVA.slaba)
      s.doc.text(oblastiText, PRAVY_KRAJ, zaklad, { align: "right" })
    }
    s.mezera(2.4)

    for (const [popis, obsah] of [
      [t.stitkyNalezu.coJeVidet, text.coJeVidet],
      [t.stitkyNalezu.coToDela, text.coToDela],
    ] as const) {
      s.pismo(7.2, true, BARVA.slaba)
      s.misto(5)
      s.doc.text(popis.toUpperCase(), OKRAJ.levy, s.y, { charSpace: 0.4 })
      s.mezera(4.2)
      s.text(obsah, { velikost: 9.6, barva: BARVA.text2, radek: 4.6 })
      s.mezera(3)
    }

    // co s tím
    s.pismo(7.2, true, BARVA.slaba)
    s.misto(5)
    s.doc.text(t.stitkyNalezu.coSTim.toUpperCase(), OKRAJ.levy, s.y, { charSpace: 0.4 })
    s.mezera(4.2)
    text.coSTim.forEach((krok, k) => {
      s.misto(6)
      const y = s.y
      s.pismo(8.6, true, BARVA.znacka)
      s.doc.text(String(k + 1), OKRAJ.levy, y)
      s.text(krok, { velikost: 9.6, barva: BARVA.text2, radek: 4.6, x: OKRAJ.levy + 6, sirka: SIRKA - 6 })
      s.mezera(1.6)
    })
    s.mezera(2)

    // co nedělat
    const zacatekVaru = s.y
    s.pismo(7.2, true, CERVENA)
    s.misto(5)
    s.doc.text(t.stitkyNalezu.coNedelat.toUpperCase(), OKRAJ.levy + 5, s.y, { charSpace: 0.4 })
    s.mezera(4.2)
    s.text(text.coNedelat, {
      velikost: 9.6,
      barva: BARVA.text2,
      radek: 4.6,
      x: OKRAJ.levy + 5,
      sirka: SIRKA - 5,
    })
    s.doc.setDrawColor(CERVENA[0], CERVENA[1], CERVENA[2])
    s.doc.setLineWidth(0.8)
    s.doc.line(OKRAJ.levy, zacatekVaru - 3.4, OKRAJ.levy, s.y - 2)
    s.mezera(7)
  })

  // ---- opory, priority, zlomy ----
  s.zalom()
  const seznam = (titul: string, uvod: string, ids: string[], barva: RGB) => {
    s.misto(26)
    s.doc.setFillColor(barva[0], barva[1], barva[2])
    s.doc.roundedRect(OKRAJ.levy, s.y - 1.4, 9, 1.4, 0.7, 0.7, "F")
    s.mezera(5)
    s.text(titul, { velikost: 12.4, tucne: true, radek: 5.4 })
    s.mezera(1.4)
    s.text(uvod, { velikost: 9, barva: BARVA.slaba, radek: 4.4 })
    s.mezera(2.4)
    if (!ids.length) {
      s.text(t.zadne, { velikost: 9.8, barva: BARVA.text2, radek: 4.6 })
    } else {
      for (const id of ids) {
        const o = podleId.get(id)
        const znacka = o?.plosna ? `  (${t.plosna})` : ""
        s.text(`${t.oblasti[id as DimensionId]}${znacka}`, {
          velikost: 9.8,
          tucne: true,
          radek: 4.8,
        })
      }
    }
    s.mezera(6)
  }
  seznam(t.oporyTitul, t.oporyUvod, data.opory, ZELENA)
  seznam(t.prioritTitul, t.prioritUvod, data.priority, ORANZOVA)
  seznam(t.zlomyTitul, t.zlomyUvod, data.zlomy, CERVENA)

  // ---- profil oblastí ----
  s.nadpis(t.oblastiTitul)
  s.text(t.oblastiUvod, { velikost: 9.6, barva: BARVA.text2, radek: 4.6 })
  s.mezera(5)

  for (const id of PORADI) {
    const o = podleId.get(id)
    if (!o) continue
    s.misto(18)
    const zaklad = s.y
    s.pismo(10.6, true, BARVA.text)
    s.doc.text(t.oblasti[id], OKRAJ.levy, zaklad)

    const popisky = [
      `${t.legendaUroven} ${Math.round(o.prumer)}`,
      `${t.legendaRozptyl} ±${Math.round(o.smodch)}`,
    ].join("   ")
    s.pismo(8.4, false, BARVA.slaba)
    s.doc.text(popisky, PRAVY_KRAJ, zaklad, { align: "right" })

    s.y = zaklad + 2.8
    s.pruh(s.y, Math.max(2, Math.min(100, o.prumer)), { vyska: 2.6 })
    s.y += 4.6

    // rozpětí od nejslabšího po nejsilnějšího hráče
    const x = OKRAJ.levy + (SIRKA * Math.max(0, o.min)) / 100
    const w = Math.max(1, (SIRKA * (o.max - o.min)) / 100)
    const barvaRozpeti = o.rozkol ? CERVENA : BARVA.tlumena
    s.doc.setFillColor(BARVA.drazka[0], BARVA.drazka[1], BARVA.drazka[2])
    s.doc.roundedRect(OKRAJ.levy, s.y, SIRKA, 1, 0.5, 0.5, "F")
    s.doc.setFillColor(barvaRozpeti[0], barvaRozpeti[1], barvaRozpeti[2])
    s.doc.roundedRect(x, s.y - 0.4, w, 1.8, 0.9, 0.9, "F")
    s.y += 4

    if (o.rozkol || o.plosna) {
      const znacky = [o.rozkol ? t.rozkol : null, o.plosna ? t.plosna : null].filter(Boolean).join("  ·  ")
      s.pismo(8, true, o.rozkol ? CERVENA : BARVA.slaba)
      s.doc.text(znacky, OKRAJ.levy, s.y)
      s.y += 4
    }
    s.mezera(3)
  }

  s.paticka(`${data.nazev} · ${t.titul}`)
  return doc.output("blob")
}

export function tymPdfFileName(nazev: string, lang: TymLang): string {
  const kdo = nazev.replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-|-$/g, "")
  return `${kdo || (lang === "en" ? "Team" : "Tym")}-${lang === "en" ? "team-profile" : "profil-tymu"}.pdf`
}
