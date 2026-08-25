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
import { RAMEC } from "./ramec"
import { VYKLAD } from "./vyklad"
import {
  oblastiKOtazkam,
  oblastiSPraci,
  sestavPlan,
  sestavShrnuti,
  tvarKlic,
  urovenKlic,
  type ProfilProCteni,
} from "./plan"
import type { NalezKod } from "./typy"
import type { DimensionId } from "../diagnostic/types"

// PDF týmového reportu.
//
// Osm oddílů v pořadí, ve kterém je kouč potřebuje. Nejdřív shrnutí, které
// stojí samo o sobě, potom návod, jak report číst, pak podklad, a nakonec
// plán práce a mantinely. Kdo dočte první stranu, má to podstatné; kdo dočte
// všechno, ví i proč.
//
// Vstup je hotový profil ze serveru. Prahy, podle kterých nálezy vznikly,
// tady nejsou a nemají tu co dělat.

/** Profil, jak ho vrací server. Drží se tvaru z convex/teams.ts. */
export interface TymPdfVstup extends ProfilProCteni {
  nazev: string
}

const PORADI: DimensionId[] = ["A", "B", "C", "D", "E", "F", "G"]
const CERVENA: RGB = [255, 59, 48]
const ZELENA: RGB = [48, 209, 88]
const ORANZOVA: RGB = [255, 149, 0]

/** Malý prostrkaný popisek nad odstavcem. */
function popisek(s: Sazba, text: string, barva: RGB = BARVA.slaba, odsazeni = 0) {
  s.misto(5)
  s.pismo(7.2, true, barva)
  s.doc.text(text.toUpperCase(), OKRAJ.levy + odsazeni, s.y, { charSpace: 0.4 })
  s.mezera(4.2)
}

/** Odrážky. Puntík je čtvereček, aby nekolidoval s číslovanými kroky. */
function odrazky(s: Sazba, polozky: string[], velikost = 9.6) {
  for (const p of polozky) {
    s.misto(velikost * 0.5 + 2)
    const y = s.y
    s.doc.setFillColor(BARVA.tlumena[0], BARVA.tlumena[1], BARVA.tlumena[2])
    s.doc.roundedRect(OKRAJ.levy + 0.6, y - 1.6, 1.6, 1.6, 0.4, 0.4, "F")
    s.text(p, {
      velikost,
      barva: BARVA.text2,
      radek: velikost * 0.48,
      x: OKRAJ.levy + 6,
      sirka: SIRKA - 6,
    })
    s.mezera(1.8)
  }
}

/** Číslované kroky. Číslo je ve značkové barvě, text vedle něj. */
function cislovane(s: Sazba, polozky: string[], velikost = 9.6) {
  polozky.forEach((krok, k) => {
    s.misto(velikost * 0.5 + 2)
    const y = s.y
    s.pismo(8.6, true, BARVA.znacka)
    s.doc.text(String(k + 1), OKRAJ.levy, y)
    s.text(krok, {
      velikost,
      barva: BARVA.text2,
      radek: velikost * 0.48,
      x: OKRAJ.levy + 6,
      sirka: SIRKA - 6,
    })
    s.mezera(1.8)
  })
}

export function buildTymPdf(data: TymPdfVstup, lang: TymLang): Blob {
  const t = TYM[lang]
  const r = RAMEC[lang]
  const v = VYKLAD[lang]
  const doc = novyDokument()
  const s = new Sazba(doc)
  const podleId = new Map(data.oblasti.map((o) => [o.id, o]))
  const nazevOblasti = (id: string) => t.oblasti[id as DimensionId] ?? id

  // =========================================================================
  // 1. Hlavička a shrnutí pro kouče
  // =========================================================================
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
  if (data.odevzdano > data.zapocteno) {
    const kolik = data.odevzdano - data.zapocteno
    s.ramecek(`${t.nezapoctenoTitul}. ${t.nezapocteno(kolik, data.zapocteno)}`, { velikost: 9.4 })
    s.mezera(4)
  }

  const plan = sestavPlan(data, lang)
  // Oblasti, které dostanou vlastní kroky v plánu, je nemají mít znovu
  // v přehledu oblastí. Dvakrát totéž čtenáře učí, že se části reportu dají
  // přeskakovat.
  const vPlanu = new Set<string>(plan.map((f) => f.oblast).filter((x): x is DimensionId => x !== null))
  const sPraci = oblastiSPraci(data, vPlanu)
  const shrnuti = sestavShrnuti(data, lang)
  s.nadpis(r.shrnutiTitul)
  s.text(r.shrnutiUvod, { velikost: 9.6, barva: BARVA.text2, radek: 4.6 })
  s.mezera(5)

  const shrnutiBlok = (titul: string, barva: RGB, radky: string[]) => {
    s.misto(20)
    s.doc.setFillColor(barva[0], barva[1], barva[2])
    s.doc.roundedRect(OKRAJ.levy, s.y - 1.4, 9, 1.4, 0.7, 0.7, "F")
    s.mezera(5)
    s.text(titul, { velikost: 11.6, tucne: true, radek: 5 })
    s.mezera(1.6)
    odrazky(s, radky, 9.6)
    s.mezera(4)
  }
  shrnutiBlok(r.drziTitul, ZELENA, shrnuti.drzi)
  shrnutiBlok(r.krehkeTitul, ORANZOVA, shrnuti.krehke)

  s.misto(24)
  s.doc.setFillColor(BARVA.znacka[0], BARVA.znacka[1], BARVA.znacka[2])
  s.doc.roundedRect(OKRAJ.levy, s.y - 1.4, 9, 1.4, 0.7, 0.7, "F")
  s.mezera(5)
  s.text(r.prvniKrokTitul, { velikost: 11.6, tucne: true, radek: 5 })
  s.mezera(1.6)
  s.text(shrnuti.prvniKrok, { velikost: 9.8, barva: BARVA.text2, radek: 4.7 })

  // =========================================================================
  // 2. Jak report číst
  // =========================================================================
  s.mezera(6)
  s.misto(70)
  s.nadpis(r.jakCistTitul)
  for (const odstavec of r.jakCistOdstavce) {
    s.text(odstavec, { velikost: 9.4, barva: BARVA.text2, radek: 4.5 })
    s.mezera(2.8)
  }
  s.mezera(3)
  popisek(s, r.coToNeniTitul)
  odrazky(s, r.coToNeni, 9.6)
  s.mezera(6)

  // =========================================================================
  // 3. Struktura týmu: opory, priority, zlomové linie
  // =========================================================================
  s.mezera(4)
  // Tři sloupce vedle sebe. Na výšku pod sebou by tenhle přehled zabral půl
  // strany a přitom nese jen tři krátké seznamy; vedle sebe se navíc čtou
  // jako jeden obrázek stavu týmu, což je přesně to, co jsou.
  const MEZISLOUPI = 6
  const sirkaSloupce = (SIRKA - 2 * MEZISLOUPI) / 3
  const sloupce: [string, string, string[], RGB][] = [
    [t.oporyTitul, t.oporyUvod, data.opory, ZELENA],
    [t.prioritTitul, t.prioritUvod, data.priority, ORANZOVA],
    [t.zlomyTitul, t.zlomyUvod, data.zlomy, CERVENA],
  ]

  s.misto(64)
  const zacatekSloupcu = s.y
  let konecSloupcu = s.y
  sloupce.forEach(([titul, uvod, ids, barva], i) => {
    const x = OKRAJ.levy + i * (sirkaSloupce + MEZISLOUPI)
    s.y = zacatekSloupcu
    s.doc.setFillColor(barva[0], barva[1], barva[2])
    s.doc.roundedRect(x, s.y, 9, 1.4, 0.7, 0.7, "F")
    s.y += 6
    s.text(titul, { velikost: 11, tucne: true, radek: 4.8, x, sirka: sirkaSloupce })
    s.mezera(1.2)
    s.text(uvod, { velikost: 8.2, barva: BARVA.slaba, radek: 3.9, x, sirka: sirkaSloupce })
    s.mezera(2)
    if (!ids.length) {
      s.text(t.zadne, { velikost: 9, barva: BARVA.text2, radek: 4.3, x, sirka: sirkaSloupce })
    } else {
      for (const id of ids) {
        const o = podleId.get(id)
        const znacky = [o?.plosna ? t.plosna : null, o?.rozptyl ? t.velkyRozptyl : null]
          .filter(Boolean)
          .join(", ")
        s.text(`${nazevOblasti(id)}${znacky ? ` (${znacky})` : ""}`, {
          velikost: 9,
          tucne: true,
          radek: 4.3,
          x,
          sirka: sirkaSloupce,
        })
        s.mezera(0.8)
      }
    }
    konecSloupcu = Math.max(konecSloupcu, s.y)
  })
  s.y = konecSloupcu
  s.mezera(6)

  // =========================================================================
  // 4. Co z toho plyne: strukturální nálezy
  // =========================================================================
  s.mezera(3)
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
      popisek(s, popis)
      s.text(obsah, { velikost: 9.6, barva: BARVA.text2, radek: 4.6 })
      s.mezera(3)
    }

    popisek(s, t.stitkyNalezu.coSTim)
    cislovane(s, text.coSTim)
    s.mezera(2)

    const zacatekVaru = s.y
    popisek(s, t.stitkyNalezu.coNedelat, CERVENA, 5)
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

  // =========================================================================
  // 5. Sedm oblastí podrobně
  // =========================================================================
  s.mezera(4)
  s.misto(80)
  s.nadpis(r.oblastiDetailTitul)
  s.text(r.oblastiDetailUvod, { velikost: 9.6, barva: BARVA.text2, radek: 4.6 })
  s.mezera(5)

  for (const id of PORADI) {
    const o = podleId.get(id)
    if (!o) continue
    const vy = v[id]

    // Hlavička oblasti se nesmí odtrhnout od grafiky pod sebou.
    s.misto(40)
    s.mezera(2)
    const zaklad = s.y
    s.pismo(12.6, true, BARVA.text)
    s.doc.text(nazevOblasti(id), OKRAJ.levy, zaklad)
    s.pismo(8.4, false, BARVA.slaba)
    s.doc.text(
      `${t.legendaUroven} ${Math.round(o.prumer)}   ${t.legendaRozptyl} ±${Math.round(o.smodch)}`,
      PRAVY_KRAJ,
      zaklad,
      { align: "right" },
    )

    s.y = zaklad + 3.4
    s.pruh(s.y, Math.max(2, Math.min(100, o.prumer)), { vyska: 2.6 })
    s.y += 4.6

    // Rozpětí od nejslabšího po nejsilnějšího hráče.
    const x = OKRAJ.levy + (SIRKA * Math.max(0, o.min)) / 100
    const w = Math.max(1, (SIRKA * (o.max - o.min)) / 100)
    s.doc.setFillColor(BARVA.drazka[0], BARVA.drazka[1], BARVA.drazka[2])
    s.doc.roundedRect(OKRAJ.levy, s.y, SIRKA, 1, 0.5, 0.5, "F")
    const barvaRozpeti = o.rozkol ? CERVENA : o.rozptyl ? ORANZOVA : BARVA.tlumena
    s.doc.setFillColor(barvaRozpeti[0], barvaRozpeti[1], barvaRozpeti[2])
    s.doc.roundedRect(x, s.y - 0.4, w, 1.8, 0.9, 0.9, "F")
    s.y += 4.4

    const stitky = [
      o.rozkol ? t.rozkol : null,
      o.rozptyl ? t.velkyRozptyl : null,
      o.plosna ? t.plosna : null,
    ].filter(Boolean)
    s.pismo(8, true, o.rozkol ? CERVENA : o.rozptyl ? ORANZOVA : BARVA.slaba)
    s.doc.text(
      [stitky.join("  ·  "), r.rozsahTymu(Math.round(o.min), Math.round(o.max))]
        .filter(Boolean)
        .join("      "),
      OKRAJ.levy,
      s.y,
    )
    s.y += 3.2

    // Rozložení kádru do pásem. Ukazuje se jen to, co není nula, aby řádek
    // nesl informaci a ne čtyři nuly.
    const pasma: [string, number][] = [
      [r.pasma.priority, o.pasma.priority],
      [r.pasma.stabilization, o.pasma.stabilization],
      [r.pasma.strong, o.pasma.strong],
      [r.pasma.elite, o.pasma.elite],
    ]
    const neprazdna = pasma.filter(([, kolik]) => kolik > 0)
    if (neprazdna.length) {
      s.pismo(8, false, BARVA.slaba)
      s.doc.text(
        `${r.rozlozeni}: ${neprazdna.map(([n, k]) => `${n} ${k}`).join("   ")}`,
        OKRAJ.levy,
        s.y,
      )
      s.y += 4.6
    }
    s.mezera(1)

    popisek(s, r.popiskyVykladu.coMeri)
    s.text(`${vy.coMeri} ${vy.procZalezi}`, { velikost: 9, barva: BARVA.text2, radek: 4.3 })
    s.mezera(2.6)

    popisek(s, r.popiskyVykladu.stav)
    s.text(vy.uroven[urovenKlic(o.prumer)], { velikost: 9, barva: BARVA.text2, radek: 4.3 })
    s.mezera(1.8)
    s.text(vy.tvar[tvarKlic(o)], { velikost: 9, barva: BARVA.text2, radek: 4.3 })
    s.mezera(2.6)

    // Práci a znaky posunu jen u oblastí, které ji potřebují. U zdravé oblasti
    // by tři kroky a dva ukazatele byly jen výplň a odvedly by pozornost od
    // toho, kde je práce opravdu potřeba.
    if (sPraci.has(id)) {
      popisek(s, r.popiskyVykladu.prace)
      cislovane(s, vy.prace, 9)
      s.mezera(2)
      popisek(s, r.popiskyVykladu.znaky)
      odrazky(s, vy.znaky, 9)
    }
    s.mezera(4)
    s.linka(BARVA.linka)
    s.mezera(3.6)
  }

  // =========================================================================
  // 6. Plán práce na dvanáct týdnů
  // =========================================================================
  s.mezera(3)
  s.nadpis(r.planTitul)
  s.text(r.planUvod, { velikost: 9.8, barva: BARVA.text2, radek: 4.8 })
  s.mezera(6)

  for (const faze of plan) {
    s.misto(52)
    const zaklad = s.y
    s.pismo(7.4, true, BARVA.znacka)
    s.doc.text(r.planTydny(faze.odTydne, faze.doTydne).toUpperCase(), OKRAJ.levy, zaklad, {
      charSpace: 0.5,
    })
    // Název oblasti se sází na účaří popisku týdnů, ne k nadpisu fáze. Nadpis
    // je velký a dlouhý název oblasti by do něj vjel; popisek týdnů je krátký
    // a vedle něj zbývá místo.
    if (faze.nazevOblasti) {
      s.pismo(7.4, true, BARVA.slaba)
      s.doc.text(faze.nazevOblasti.toUpperCase(), PRAVY_KRAJ, zaklad, {
        align: "right",
        charSpace: 0.4,
      })
    }
    s.mezera(5)
    s.text(faze.nazev, { velikost: 13, tucne: true, radek: 5.6 })
    s.mezera(2.4)

    popisek(s, r.planProc)
    s.text(faze.duvod, { velikost: 9.4, barva: BARVA.text2, radek: 4.5 })
    s.mezera(3)

    popisek(s, r.planKroky)
    cislovane(s, faze.kroky, 9.4)
    s.mezera(2.4)

    popisek(s, r.planZnaky)
    odrazky(s, faze.znaky, 9.4)
    s.mezera(5.5)
  }
  s.ramecek(r.planPoznamka, { velikost: 9.2 })

  // =========================================================================
  // 7. Individuální rozhovory
  // =========================================================================
  s.mezera(3)
  s.nadpis(r.rozhovoryTitul)
  s.text(r.rozhovoryUvod, { velikost: 9.4, barva: BARVA.text2, radek: 4.5 })
  s.mezera(4)
  odrazky(s, r.rozhovoryJak, 9.2)
  s.mezera(5)

  popisek(s, r.rozhovoryOtazkyTitul)
  s.mezera(1)
  for (const id of PORADI) {
    if (!podleId.has(id)) continue
    s.misto(16)
    s.text(nazevOblasti(id), { velikost: 9.6, tucne: true, radek: 4.4 })
    s.mezera(0.8)
    odrazky(s, v[id].otazky, 9)
    s.mezera(2.4)
  }

  // =========================================================================
  // 8. Mantinely použití
  // =========================================================================
  s.mezera(3)
  s.nadpis(r.mantinelyTitul)
  s.text(r.mantinelyUvod, { velikost: 9.8, barva: BARVA.text2, radek: 4.8 })
  s.mezera(5)
  odrazky(s, r.mantinely, 9.8)

  s.paticka(`${data.nazev} · ${r.paticka}`)
  return doc.output("blob")
}

export function tymPdfFileName(nazev: string, lang: TymLang): string {
  const kdo = nazev.replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-|-$/g, "")
  return `${kdo || (lang === "en" ? "Team" : "Tym")}-${lang === "en" ? "team-profile" : "profil-tymu"}.pdf`
}
