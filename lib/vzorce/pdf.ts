import { applyGender } from "../diagnostic/content"
import {
  BARVA,
  OKRAJ,
  PRAVY_KRAJ,
  SIRKA,
  STITEK_NEUTRALNI,
  Sazba,
  datumLokalne,
  novyDokument,
} from "../diagnostic/pdf/sazba"
import type { Gender, PersonInfo } from "../diagnostic/types"
import { OBSAH } from "./data/obsah"
import { vyhodnot } from "./scoring"
import {
  NAZVY_DOMEN,
  NAZVY_DOMEN_KRATCE,
  NAZVY_PASEM,
  POCET_POLOZEK,
  vzorec,
} from "./structure"
import type { Domena, OdpovediMapa, VzorecSkore } from "./types"
import { propoj } from "./vazby"

// PDF s vyhodnocením emocionálně-destruktivních vzorců.
//
// Drží stejnou sazbu jako vyhodnocení ELITE, aby oba dokumenty vypadaly jako
// jedna řada: sdílený sazeč, stejné pruhy, stejné štítky, stejná patička.
// Navíc má prstence pro tři nejaktivnější vzorce, protože u nich nejde
// o srovnání mezi sebou, ale o jednu hodnotu na škále.

const OSA_MIN = 10
const OSA_MAX = 60

/** Podíl na ose 10 až 60, v procentech. */
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
  doc.text("z 60", stred.x, stred.y + 6, { align: "center" })
}

/** Tři prstence vedle sebe s popiskem pod nimi. Vrací spotřebovanou výšku. */
function trojicePrstencu(s: Sazba, top3: VzorecSkore[], g: (t: string) => string) {
  const polomer = 13
  const vyskaBloku = 2 * polomer + 22
  s.misto(vyskaBloku + 4)
  const horni = s.y
  const sloupec = SIRKA / top3.length
  top3.forEach((v, i) => {
    const stredX = OKRAJ.levy + sloupec * (i + 0.5)
    prstenec(s, { x: stredX, y: horni + polomer }, polomer, (v.skore - OSA_MIN) / 50, v.skore)
    const zakladPopisku = horni + 2 * polomer + 6
    s.pismo(6.8, true, BARVA.slaba)
    s.doc.text(`${i + 1}. MÍSTO`, stredX, zakladPopisku, { align: "center", charSpace: 0.35 })
    s.pismo(9.6, true, BARVA.text)
    const nazev = s.doc.splitTextToSize(g(OBSAH[v.id].nazev), sloupec - 6) as string[]
    nazev.forEach((r, k) => s.doc.text(r, stredX, zakladPopisku + 5 + k * 4.6, { align: "center" }))
    s.pismo(8, false, BARVA.text2)
    s.doc.text(NAZVY_PASEM[v.pasmo], stredX, zakladPopisku + 5 + nazev.length * 4.6 + 3.4, {
      align: "center",
    })
  })
  s.y = horni + vyskaBloku + 8
}

export interface VzorcePdfVstup {
  person: PersonInfo
  answers: OdpovediMapa
  durationSec?: number
}

/** Název souboru: test, klient, datum. */
export function vzorcePdfFileName(vstup: VzorcePdfVstup): string {
  return (
    ["Emocionalne-destruktivni vzorce", vstup.person.name, vstup.person.fillDate]
      .filter(Boolean)
      .join(" - ")
      .replace(/[/\\?%*:|"<>]/g, "-")
      .slice(0, 120) + ".pdf"
  )
}

export function buildVzorcePdf(vstup: VzorcePdfVstup): Blob {
  const { person, answers, durationSec } = vstup
  const gender: Gender = person.gender ?? "male"
  const g = (t: string) => applyGender(t, gender)
  const v = vyhodnot(answers, durationSec)
  const spojeni = propoj(v)

  const doc = novyDokument()
  const s = new Sazba(doc)

  // ---------- hlavička ----------
  s.text("WINNING MINDS", {
    velikost: 7.6,
    tucne: true,
    barva: BARVA.slaba,
    prostrkani: 0.6,
  })
  s.mezera(2.5)
  s.text("Emocionálně-destruktivní vzorce · Vyhodnocení", {
    velikost: 18,
    tucne: true,
    radek: 8,
  })
  s.mezera(1.5)
  s.text("Diagnostický profil automatických emočních reakcí, vztahových strategií a výkonových bloků", {
    velikost: 10,
    barva: BARVA.text2,
    radek: 5,
  })
  s.mezera(6)
  s.linka()
  s.mezera(7)

  s.mrizkaUdaju([
    { popis: "Respondent", hodnota: person.name || "–" },
    { popis: "Role / oblast", hodnota: person.role || "–" },
    { popis: "Datum vyplnění", hodnota: datumLokalne(person.fillDate, "cs") },
  ])
  s.mezera(6)

  if (!v.kompletni) {
    s.ramecek(
      `Dotazník není kompletní (${v.zodpovezeno} ze ${POCET_POLOZEK}). U vzorců s chybějícími odpověďmi je skóre dopočítané z průměru zodpovězených položek. Vzorce, kde chybí víc než pětina odpovědí, se do pořadí nezařazují.`,
      { velikost: 9 },
    )
    s.mezera(3)
  }

  // ---------- profil všech vzorců ----------
  s.nadpis("Profil všech vzorců")
  s.text(
    "Skóre jednoho vzorce je součet deseti odpovědí, tedy 10 až 60 bodů. Číslo v závorce ukazuje, kolik tvrzení respondent označil hodnotou 5 nebo 6; ta jsou významná i tehdy, když celkové skóre vysoké není.",
    { velikost: 9, barva: BARVA.text2, radek: 4.4 },
  )
  s.mezera(5)

  const vBoji = new Set(v.top3.map((x) => x.id))
  for (const x of v.vsechny) {
    const nazev = OBSAH[x.id].nazev
    if (!x.vykazuje) {
      s.radekChybi(nazev, `zodpovězeno ${x.zodpovezeno} z ${x.celkem} položek`)
      continue
    }
    const duraz = vBoji.has(x.id)
    const hodnota = x.silnychOdpovedi > 0 ? `${x.skore} (${x.silnychOdpovedi})` : String(x.skore)
    s.radekSkore(nazev, hodnota, NAZVY_PASEM[x.pasmo], STITEK_NEUTRALNI, procenta(x.skore), {
      tucne: duraz,
      mezeraPo: 7,
      barvaPruhu: duraz ? BARVA.znacka : BARVA.tlumena,
    })
  }
  s.mezera(3)

  // ---------- zatížení oblastí ----------
  const podleDomen = new Map<Domena, VzorecSkore[]>()
  for (const x of v.vsechny) {
    if (!x.vykazuje) continue
    const d = vzorec(x.id).domena
    podleDomen.set(d, [...(podleDomen.get(d) ?? []), x])
  }
  const oblasti = [...podleDomen.entries()]
    .map(([d, vs]) => ({
      domena: d,
      prumer: Math.round(vs.reduce((a, b) => a + b.skore, 0) / vs.length),
      pocet: vs.length,
    }))
    .sort((a, b) => b.prumer - a.prumer)

  if (oblasti.length) {
    if (s.zbyva() < 70) s.zalom()
    s.nadpis("Zatížení oblastí")
    s.text(
      "Tentýž profil po oblastech, ze kterých vzorce pocházejí. Když je zatížená jedna oblast, nejde o několik problémů, ale o jedno téma ve více podobách. V závorce je počet vzorců, ze kterých se průměr počítá.",
      { velikost: 9, barva: BARVA.text2, radek: 4.4 },
    )
    s.mezera(5)
    const nejvic = oblasti[0].prumer
    for (const o of oblasti) {
      s.radekSkore(
        `${NAZVY_DOMEN_KRATCE[o.domena]} (${o.pocet})`,
        String(o.prumer),
        "",
        STITEK_NEUTRALNI,
        procenta(o.prumer),
        {
          tucne: o.prumer === nejvic,
          mezeraPo: 7,
          barvaPruhu: o.prumer === nejvic ? BARVA.znacka : BARVA.tlumena,
        },
      )
    }
    s.mezera(3)
  }

  // ---------- tři nejaktivnější ----------
  if (v.top3.length) {
    s.zalom()
    s.nadpis("Tři nejaktivnější vzorce", 15)
    s.text(
      "Tohle jsou vzorce, které se u respondenta aktivují nejsilněji. Nejsou to nálepky ani diagnóza. Je to popis mechanismu, který se spouští pod tlakem.",
      { velikost: 9.4, barva: BARVA.text2, radek: 4.5 },
    )
    s.mezera(6)
    trojicePrstencu(s, v.top3, g)

    v.top3.forEach((x, i) => {
      const o = OBSAH[x.id]
      const d = vzorec(x.id).domena
      s.misto(60)
      s.mezera(2)
      s.linka()
      s.mezera(7)
      s.text(`${i + 1}. MÍSTO · ${NAZVY_DOMEN[d].toUpperCase()}`, {
        velikost: 7,
        tucne: true,
        barva: BARVA.slaba,
        prostrkani: 0.4,
        radek: 4,
      })
      s.mezera(1.5)
      s.text(o.nazev, { velikost: 13, tucne: true, radek: 6 })
      s.mezera(1)
      s.text(o.tema, { velikost: 8.8, barva: BARVA.slaba, radek: 4.1 })
      s.mezera(4)

      s.radekSkore("", `${x.skore}/60`, NAZVY_PASEM[x.pasmo], STITEK_NEUTRALNI, procenta(x.skore), {
        tucne: true,
        mezeraPo: 6.5,
      })

      s.text(`„${g(o.motto)}“`, { velikost: 11, tucne: true, radek: 5.4 })
      s.mezera(4)

      const silne =
        x.silnychOdpovedi > 0
          ? ` Hodnotou 5 nebo 6 označeno ${x.silnychOdpovedi} z 10 tvrzení, konkrétně ${x.silnePolozky.join(", ")}.`
          : ""
      s.ramecek(`${NAZVY_PASEM[x.pasmo]}. ${g(o.pasma[x.pasmo])}${silne}`, { velikost: 9.2 })
      s.mezera(4)

      for (const [titulek, obsah, tlumeny] of [
        ["Jak to vypadá zevnitř", o.prozitek, false],
        ["Co dělá pod tlakem", o.podTlakem, false],
        ["Odkud se to vzalo", o.puvod, true],
      ] as [string, string, boolean][]) {
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
    })
  }

  // ---------- situačně aktivované ----------
  if (v.situacni.length) {
    if (s.zbyva() < 60) s.zalom()
    s.mezera(2)
    s.nadpis("Situačně aktivované vzorce")
    s.text(
      "Tyhle vzorce se nedostaly do první trojice, ale mají tři a více tvrzení označených nejvyššími hodnotami. To znamená, že se neaktivují trvale, zato v konkrétních situacích silně. Stojí za to se na ně v rozhovoru zeptat.",
      { velikost: 9.4, barva: BARVA.text2, radek: 4.5 },
    )
    s.mezera(5)
    for (const x of v.situacni) {
      s.misto(12)
      const zaklad = s.y
      s.pismo(9.8, true, BARVA.text)
      s.doc.text(OBSAH[x.id].nazev, OKRAJ.levy, zaklad)
      s.pismo(9.4, true, BARVA.text)
      s.doc.text(`${x.skore}/60`, PRAVY_KRAJ, zaklad, { align: "right" })
      s.y = zaklad + 4.4
      s.text(
        `${x.silnychOdpovedi}× hodnota 5 nebo 6 · položky ${x.silnePolozky.join(", ")}`,
        { velikost: 8.6, barva: BARVA.slaba, radek: 4.2 },
      )
      s.mezera(3.5)
    }
    s.mezera(3)
  }

  // ---------- propojené shrnutí ----------
  if (spojeni) {
    // Shrnutí je pro klienta to nejdůležitější a musí držet pohromadě.
    s.zalom()
    s.text("Jak to funguje dohromady", {
      velikost: 16,
      tucne: true,
      barva: BARVA.znacka,
      radek: 7.5,
    })
    s.mezera(1.5)
    s.text(
      "Tři vzorce nejsou tři oddělené problémy. Teprve jejich spojení vysvětluje chování, kterému člověk sám nerozumí.",
      { velikost: 9, barva: BARVA.slaba, radek: 4.4 },
    )
    s.mezera(3)
    s.linka()
    s.mezera(7)

    s.text(g(spojeni.domeny), { velikost: 10.2, radek: 5.1 })
    s.mezera(6)

    s.text("KDE SE NAVZÁJEM ŽIVÍ", {
      velikost: 7,
      tucne: true,
      barva: BARVA.slaba,
      prostrkani: 0.4,
      radek: 4,
    })
    s.mezera(3)
    for (const m of spojeni.mechanismy) {
      s.ramecek(g(m), { velikost: 9.4 })
      s.mezera(2.5)
    }
    s.mezera(3)

    s.text(g(spojeni.souhrn), { velikost: 10.2, radek: 5.1 })
    s.mezera(6)
    s.ramecek(g(spojeni.kdeZacit), { velikost: 10.2, tucne: true })
  }

  // ---------- poznámka na závěr ----------
  s.mezera(6)
  s.text(
    "Tento profil není nálepka ani diagnóza. Je to mapa. Smyslem není člověka ve vzorci zafixovat, ale pojmenovat mechanismus, který se aktivuje pod tlakem, a vytvořit prostor pro přesnější práci. Výsledek nenahrazuje psychologické ani lékařské vyšetření a slouží jako podklad pro rozhovor s koučem.",
    { velikost: 8.6, barva: BARVA.slaba, radek: 4.2 },
  )

  s.paticka("Winning Minds s.r.o. · Praha 6 · winningminds.cz · Důvěrný dokument")

  return doc.output("blob")
}
