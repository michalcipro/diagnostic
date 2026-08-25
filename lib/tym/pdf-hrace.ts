import {
  BARVA,
  OKRAJ,
  PRAVY_KRAJ,
  SIRKA,
  Sazba,
  novyDokument,
  type RGB,
} from "../diagnostic/pdf/sazba"
import { HRAC, type HracVyhodnoceni } from "./hrac"
import type { BandKey } from "../diagnostic/types"

// PDF s vyhodnocením pro hráče.
//
// Sází se ze stejného textu, jaký hráč vidí na obrazovce, a stejným sazečem
// jako ostatní vyhodnocení. Klíče, kterými z odpovědí vzniklo, tu nejsou:
// text přišel hotový ze serveru.

const PASMO_BARVA: Record<BandKey, RGB> = {
  priority: [255, 149, 0],
  stabilization: [142, 142, 147],
  strong: [0, 113, 227],
  elite: [48, 209, 88],
}

/** Podíl na ose pro pruh; skóre je v procentech, jen se ošetří kraje. */
const podil = (percent: number) => Math.max(2, Math.min(100, percent))

export function buildHracPdf(data: HracVyhodnoceni, lang: "cs" | "en"): Blob {
  const t = HRAC[lang]
  const doc = novyDokument()
  const s = new Sazba(doc)

  // ---- hlavička ----
  s.doc.setFillColor(BARVA.znacka[0], BARVA.znacka[1], BARVA.znacka[2])
  s.doc.roundedRect(OKRAJ.levy, s.y, 32, 1.4, 0.7, 0.7, "F")
  s.mezera(9)
  s.text(t.titul, { velikost: 24, tucne: true, radek: 10 })
  s.mezera(3)
  s.text(t.podtitul, { velikost: 10.4, barva: BARVA.text2, radek: 5, sirka: SIRKA * 0.82 })
  s.mezera(5)

  const hlavicka = [data.jmeno, data.tym, data.datum].filter(Boolean).join("  ·  ")
  s.text(hlavicka, { velikost: 9, barva: BARVA.slaba, radek: 4.4 })
  s.mezera(6)

  if (data.varovani) {
    s.ramecek(data.varovani, { velikost: 9.4 })
    s.mezera(4)
  }

  // ---- výpichy ----
  const sloupec = (SIRKA - 6) / 2
  const vypich = (x: number, titul: string, ids: string[]) => {
    s.pismo(7.4, true, BARVA.slaba)
    s.doc.text(titul.toUpperCase(), x, s.y, { charSpace: 0.4 })
    let y = s.y + 5.4
    for (const id of ids) {
      const o = data.oblasti.find((z) => z.id === id)
      if (!o) continue
      s.pismo(10, true, BARVA.text)
      for (const r of s.doc.splitTextToSize(o.nazev, sloupec - 2) as string[]) {
        s.doc.text(r, x, y)
        y += 4.8
      }
      y += 1
    }
    return y
  }
  s.misto(30)
  const zacatek = s.y
  const konecA = vypich(OKRAJ.levy, t.nejsilnejsiTitul, data.nejsilnejsi)
  s.y = zacatek
  const konecB = vypich(OKRAJ.levy + sloupec + 6, t.kProciTitul, data.kProci)
  s.y = Math.max(konecA, konecB) + 4

  // ---- oblasti ----
  s.nadpis(t.oblastiTitul)
  for (const o of data.oblasti) {
    // Oblast se nesmí rozlomit v půlce, jinak zůstane nadpis na patě strany.
    s.pismo(10, false, BARVA.text2)
    const radkyUvod = s.doc.splitTextToSize(o.uvod, SIRKA) as string[]
    const radkyVyklad = s.doc.splitTextToSize(o.vyklad, SIRKA) as string[]
    const vyska = 13 + (radkyUvod.length + radkyVyklad.length) * 4.7
    if (s.zbyva() < vyska) s.zalom()

    const zaklad = s.y
    s.pismo(11.4, true, BARVA.text)
    s.doc.text(o.nazev, OKRAJ.levy, zaklad)
    s.pismo(7.6, true, PASMO_BARVA[o.band])
    s.doc.text(t.pasma[o.band].toUpperCase(), PRAVY_KRAJ, zaklad, { align: "right", charSpace: 0.3 })

    s.y = zaklad + 2.6
    s.pruh(s.y, podil(o.percent), { vyska: 2.4, barva: PASMO_BARVA[o.band] })
    s.y += 6.4

    s.text(o.uvod, { velikost: 9, barva: BARVA.slaba, radek: 4.4 })
    s.mezera(1.4)
    s.text(o.vyklad, { velikost: 9.8, barva: BARVA.text2, radek: 4.7 })
    s.mezera(6)
  }

  // ---- shrnutí ----
  s.nadpis(t.shrnutiTitul)
  for (const odstavec of data.shrnuti) {
    s.text(odstavec, { velikost: 10.2, radek: 5 })
    s.mezera(3)
  }

  s.paticka(t.titul)
  return doc.output("blob")
}

export function hracPdfFileName(data: HracVyhodnoceni, lang: "cs" | "en"): string {
  const zaklad = lang === "en" ? "Players-Survey" : "Players-Survey"
  const kdo = data.jmeno.replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-|-$/g, "")
  return `${zaklad}${kdo ? `-${kdo}` : ""}.pdf`
}
