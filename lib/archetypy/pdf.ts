import { applyGender } from "../diagnostic/content"
import {
  BARVA,
  OKRAJ,
  SIRKA,
  STITEK_NEUTRALNI,
  Sazba,
  datumLokalne,
  novyDokument,
} from "../diagnostic/pdf/sazba"
import { TEST_NAMES, UI } from "../diagnostic/i18n"
import type { Gender, Lang, PersonInfo, TestId } from "../diagnostic/types"
import { nazevArchetypu, obsahArchetypu } from "./content"
import { UI_ARCHETYPY } from "./i18n"
import { spojArchetypy } from "./kombinace"
import { vyhodnotArchetypy } from "./scoring"
import { NAZVY_MOTIVACI, POCET_POLOZEK, archetyp } from "./structure"
import type { ArchetypSkore, Motivace, OdpovediMapa } from "./types"

// PDF s vyhodnocením archetypů značky.
//
// Drží stejnou sazbu jako ostatní vyhodnocení: sdílený sazeč, stejné pruhy,
// stejné štítky, stejná patička. Prstence dostává primární a sekundární
// archetyp, tedy dvojice, se kterou se dál pracuje.

const OSA_MIN = 8
const OSA_MAX = 48

/** Podíl na ose 8 až 48, v procentech. */
const procenta = (skore: number) => ((skore - OSA_MIN) / (OSA_MAX - OSA_MIN)) * 100

/**
 * Prstenec s jednou hodnotou. jsPDF neumí oblouk, takže se kreslí jako
 * lomená čára s kulatými konci; při šedesáti krocích na celý kruh je
 * lom pod rozlišením tisku.
 */
function prstenec(
  s: Sazba,
  stred: { x: number; y: number },
  polomer: number,
  podil: number,
  skore: number,
  popisSkaly: string,
) {
  const doc = s.doc
  const tloustka = 3.4
  doc.setLineCap("round")
  doc.setLineJoin("round")
  doc.setLineWidth(tloustka)

  // dráha
  doc.setDrawColor(BARVA.drazka[0], BARVA.drazka[1], BARVA.drazka[2])
  doc.circle(stred.x, stred.y, polomer, "S")

  // vyplněná část, od dvanácti hodin po směru hodinových ručiček
  const kroku = Math.max(2, Math.round(60 * Math.max(0.02, podil)))
  const bod = (k: number) => {
    const uhel = -Math.PI / 2 + 2 * Math.PI * podil * (k / kroku)
    return { x: stred.x + polomer * Math.cos(uhel), y: stred.y + polomer * Math.sin(uhel) }
  }
  const zacatek = bod(0)
  const useky: [number, number][] = []
  let predchozi = zacatek
  for (let k = 1; k <= kroku; k++) {
    const b = bod(k)
    useky.push([b.x - predchozi.x, b.y - predchozi.y])
    predchozi = b
  }
  doc.setDrawColor(BARVA.znacka[0], BARVA.znacka[1], BARVA.znacka[2])
  doc.lines(useky, zacatek.x, zacatek.y, [1, 1], "S", false)

  doc.setLineWidth(0.2)
  doc.setLineCap("butt")

  s.pismo(19, true, BARVA.text)
  doc.text(String(skore), stred.x, stred.y + 1.4, { align: "center" })
  s.pismo(7, false, BARVA.slaba)
  doc.text(popisSkaly, stred.x, stred.y + 6, { align: "center" })
}

/** Dva prstence vedle sebe: primární a sekundární archetyp. */
function dvojicePrstencu(s: Sazba, dvojice: ArchetypSkore[], lang: Lang) {
  const t = UI_ARCHETYPY[lang]
  const popisy = [t.primarniTitulek, t.sekundarniTitulek]
  const polomer = 13
  const vyskaBloku = 2 * polomer + 22
  s.misto(vyskaBloku + 4)
  const horni = s.y
  const sloupec = SIRKA / dvojice.length
  dvojice.forEach((v, i) => {
    const stredX = OKRAJ.levy + sloupec * (i + 0.5)
    prstenec(
      s,
      { x: stredX, y: horni + polomer },
      polomer,
      (v.skore - OSA_MIN) / (OSA_MAX - OSA_MIN),
      v.skore,
      t.z48,
    )
    const zakladPopisku = horni + 2 * polomer + 6
    s.pismo(6.8, true, BARVA.slaba)
    s.doc.text(popisy[i].toUpperCase(), stredX, zakladPopisku, {
      align: "center",
      charSpace: 0.35,
    })
    s.pismo(9.6, true, BARVA.text)
    const nazev = s.doc.splitTextToSize(nazevArchetypu(v.id, lang), sloupec - 6) as string[]
    nazev.forEach((r, k) => s.doc.text(r, stredX, zakladPopisku + 5 + k * 4.6, { align: "center" }))
  })
  s.y = horni + vyskaBloku + 8
}

export interface ArchetypyPdfVstup {
  testId: TestId
  person: PersonInfo
  answers: OdpovediMapa
  lang: Lang
  durationSec?: number
}

/** Název souboru: test, klient, datum. Bez diakritiky, ať projde kdekoli. */
export function archetypyPdfFileName(vstup: ArchetypyPdfVstup): string {
  return (
    [UI_ARCHETYPY[vstup.lang].nazevSouboru, vstup.person.name, vstup.person.fillDate]
      .filter(Boolean)
      .join(" - ")
      .replace(/[/\\?%*:|"<>]/g, "-")
      .slice(0, 120) + ".pdf"
  )
}

export function buildArchetypyPdf(vstup: ArchetypyPdfVstup): Blob {
  const { testId, person, answers, lang, durationSec } = vstup
  const gender: Gender = person.gender ?? "male"
  const g = (x: string) => applyGender(x, gender)
  const v = vyhodnotArchetypy(answers, durationSec)
  const spojeni = spojArchetypy(v, lang)
  const t = UI_ARCHETYPY[lang]

  const doc = novyDokument()
  const s = new Sazba(doc)

  // ---------- hlavička ----------
  s.text(UI[lang].brand, {
    velikost: 7.6,
    tucne: true,
    barva: BARVA.slaba,
    prostrkani: 0.6,
  })
  s.mezera(2.5)
  s.text(`${TEST_NAMES[testId][lang]} · ${UI[lang].reportTitle}`, {
    velikost: 18,
    tucne: true,
    radek: 8,
  })
  s.mezera(1.5)
  s.text(t.podnadpis, {
    velikost: 10,
    barva: BARVA.text2,
    radek: 5,
  })
  s.mezera(6)
  s.linka()
  s.mezera(7)

  s.mrizkaUdaju([
    { popis: t.respondent, hodnota: person.name || "–" },
    { popis: t.role, hodnota: person.role || "–" },
    { popis: t.datum, hodnota: datumLokalne(person.fillDate, lang) },
  ])
  s.mezera(6)

  if (!v.kompletni) {
    s.ramecek(`${t.neuplnyTitulek(v.zodpovezeno, POCET_POLOZEK)} ${t.neuplnyPopis}`, {
      velikost: 9,
    })
    s.mezera(3)
  }

  // ---------- profil všech dvanácti ----------
  s.nadpis(t.profilTitulek)
  s.text(t.profilPopisPdf, { velikost: 9, barva: BARVA.text2, radek: 4.4 })
  s.mezera(5)

  const vyzdvizene = new Set([v.primarni.id, v.sekundarni.id])
  for (const x of v.vsechny) {
    const nazev = nazevArchetypu(x.id, lang)
    if (!x.vykazuje) {
      s.radekChybi(nazev, t.zodpovezenoZ(x.zodpovezeno, x.celkem))
      continue
    }
    const duraz = vyzdvizene.has(x.id)
    const hodnota = x.silnychOdpovedi > 0 ? `${x.skore} (${x.silnychOdpovedi})` : String(x.skore)
    s.radekSkore(nazev, hodnota, "", STITEK_NEUTRALNI, procenta(x.skore), {
      tucne: duraz,
      mezeraPo: 7,
      barvaPruhu: duraz ? BARVA.znacka : BARVA.tlumena,
    })
  }
  s.mezera(3)

  // ---------- motivační mapa ----------
  if (s.zbyva() < 60) s.zalom()
  s.nadpis(t.motivaceTitulek)
  s.text(t.motivacePopis, { velikost: 9, barva: BARVA.text2, radek: 4.4 })
  s.mezera(5)
  const skupiny = (Object.entries(v.motivace) as [Motivace, number][])
    .map(([m, p]) => ({ m, p }))
    .sort((a, b) => b.p - a.p)
  const nejvic = skupiny[0].p
  for (const r of skupiny) {
    s.radekSkore(NAZVY_MOTIVACI[lang][r.m], `${Math.round(r.p)} %`, "", STITEK_NEUTRALNI, r.p, {
      tucne: r.p === nejvic,
      mezeraPo: 7,
      barvaPruhu: r.p === nejvic ? BARVA.znacka : BARVA.tlumena,
    })
  }
  s.pismo(7.6, false, BARVA.slaba)
  s.text(t.motivacePatka, { velikost: 7.6, barva: BARVA.slaba, radek: 3.8 })
  s.mezera(3)

  // ---------- primární a sekundární ----------
  s.zalom()
  s.nadpis(`${t.primarniTitulek}: ${obsahArchetypu(v.primarni.id, lang).nazev}`, 15)
  s.text(`${t.vyhraneniStitek[v.vyhraneni]} · ${g(spojeni.vyhraneni)}`, {
    velikost: 9.4,
    barva: BARVA.text2,
    radek: 4.5,
  })
  s.mezera(6)
  dvojicePrstencu(s, [v.primarni, v.sekundarni], lang)

  const clanky: { skore: ArchetypSkore; stitek: string; plny: boolean }[] = [
    { skore: v.primarni, stitek: t.primarniTitulek, plny: true },
    { skore: v.sekundarni, stitek: t.sekundarniTitulek, plny: false },
  ]

  for (const { skore, stitek, plny } of clanky) {
    const o = obsahArchetypu(skore.id, lang)
    const skupina = NAZVY_MOTIVACI[lang][archetyp(skore.id).motivace]
    s.misto(60)
    s.mezera(2)
    s.linka()
    s.mezera(7)
    s.text(`${stitek.toUpperCase()} · ${skupina.toUpperCase()}`, {
      velikost: 7,
      tucne: true,
      barva: BARVA.slaba,
      prostrkani: 0.4,
      radek: 4,
    })
    s.mezera(1.5)
    s.text(o.nazev, { velikost: 13, tucne: true, radek: 6 })
    s.mezera(1)
    s.text(`${t.vKnize}: ${o.puvodni}`, { velikost: 8.8, barva: BARVA.slaba, radek: 4.1 })
    s.mezera(4)

    s.radekSkore("", `${skore.skore}/48`, "", STITEK_NEUTRALNI, procenta(skore.skore), {
      tucne: true,
      mezeraPo: 6.5,
    })

    s.text(`„${g(o.motto)}“`, { velikost: 11, tucne: true, radek: 5.4 })
    s.mezera(4)

    s.ramecek(
      `${t.touhaStitek}: ${g(o.touha)}. ${t.strachStitek}: ${g(o.strach)}. ${t.darStitek}: ${g(o.dar)}.`,
      { velikost: 9.2 },
    )
    s.mezera(4)

    const oddily: [string, string, boolean][] = plny
      ? [
          [t.podstataTitulek, o.podstata, false],
          [t.vPodnikaniTitulek, o.vPodnikani, false],
          [t.stinTitulek, o.stin, false],
          [t.pastiTitulek, o.pasti, true],
        ]
      : [
          [t.sekundarniRoleStitek, o.sekundarniRole, false],
          [t.stinTitulek, o.stin, true],
        ]

    for (const [titulek, obsah, tlumeny] of oddily) {
      s.misto(20)
      s.text(titulek.toUpperCase(), {
        velikost: 7,
        tucne: true,
        barva: BARVA.slaba,
        prostrkani: 0.4,
        radek: 4,
      })
      s.mezera(1.5)
      s.text(g(obsah), {
        velikost: 9.6,
        radek: 4.8,
        barva: tlumeny ? BARVA.text2 : BARVA.text,
      })
      s.mezera(4.5)
    }

    if (plny) {
      s.misto(24)
      s.text(t.navodTitulek.toUpperCase(), {
        velikost: 7,
        tucne: true,
        barva: BARVA.slaba,
        prostrkani: 0.4,
        radek: 4,
      })
      s.mezera(2.5)
      o.navod.forEach((krok, i) => {
        s.ramecek(`${i + 1}. ${g(krok)}`, { velikost: 9.2 })
        s.mezera(2.5)
      })
      s.mezera(2)
      s.text(`${t.prikladyStitek}: ${o.priklady}`, {
        velikost: 8.6,
        barva: BARVA.slaba,
        radek: 4.2,
      })
      s.mezera(2)
    }
  }

  // ---------- jak spolu hrají ----------
  if (s.zbyva() < 60) s.zalom()
  s.mezera(2)
  s.nadpis(t.kombinaceTitulek)
  s.text(t.kombinacePopis, { velikost: 9.4, barva: BARVA.text2, radek: 4.5 })
  s.mezera(5)
  s.text(g(spojeni.kombinace), { velikost: 9.6, radek: 4.8 })
  s.mezera(5)
  s.text(t.potlacenyTitulek.toUpperCase(), {
    velikost: 7,
    tucne: true,
    barva: BARVA.slaba,
    prostrkani: 0.4,
    radek: 4,
  })
  s.mezera(2.5)
  s.ramecek(g(spojeni.potlaceny), { velikost: 9.4 })
  s.mezera(3)

  // ---------- shrnutí pro klienta ----------
  // Shrnutí je pro klienta to nejdůležitější a musí držet pohromadě.
  s.zalom()
  s.text(t.souhrnTitulek, {
    velikost: 16,
    tucne: true,
    barva: BARVA.znacka,
    radek: 7.5,
  })
  s.mezera(1.5)
  s.text(t.souhrnPopis, { velikost: 9, barva: BARVA.slaba, radek: 4.4 })
  s.mezera(3)
  s.linka()
  s.mezera(7)

  s.text(g(spojeni.souhrn), { velikost: 10.2, radek: 5.1 })
  s.mezera(6)

  s.text(t.kdeZacitStitek.toUpperCase(), {
    velikost: 7,
    tucne: true,
    barva: BARVA.slaba,
    prostrkani: 0.4,
    radek: 4,
  })
  s.mezera(3)
  s.ramecek(g(spojeni.kdeZacit), { velikost: 10.2, tucne: true })

  // ---------- poznámka na závěr ----------
  s.mezera(6)
  s.text(t.zaverPdf, { velikost: 8.6, barva: BARVA.slaba, radek: 4.2 })

  s.paticka(UI[lang].confidential)

  return doc.output("blob")
}
