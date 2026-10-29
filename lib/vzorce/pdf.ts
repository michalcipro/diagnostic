import { applyGender } from "../diagnostic/content"
import { TEST_NAMES, UI } from "../diagnostic/i18n"
import { vUvozovkach } from "../diagnostic/otazky"
import { datumLokalne } from "../diagnostic/pdf/sazba"
import {
  PAPIR,
  STYL,
  Sestava,
  hranicePasem,
  sedaOsa,
  type Blok,
  type Hlavicka,
  type MoznyBlok,
  type RadekProfilu,
  type Styl,
} from "../diagnostic/pdf/sestava"
import { TEXTY_SESTAVY } from "../diagnostic/pdf/sestava-texty"
import { variantaVzorcu } from "../diagnostic/structure"
import type { Gender, Lang, PersonInfo, TestId, Variant } from "../diagnostic/types"
import { nazevVzorce, obsahVzorce } from "./content"
import { UI_VZORCE } from "./i18n"
import { vyhodnot } from "./scoring"
import {
  NAZVY_DOMEN,
  NAZVY_DOMEN_KRATCE,
  NAZVY_PASEM,
  NAZVY_PASEM_KRATCE,
  PASMA,
  POCET_POLOZEK,
  vzorec,
} from "./structure"
import type { Domena, OdpovediMapa, VzorecSkore } from "./types"
import { propoj } from "./vazby"

// Tisková sestava emocionálně-destruktivních vzorců. Stejná kostra jako ELITE:
//
// 1 Přehled: profil všech vzorců, zatížení oblastí, vnitřní věty tří
//   nejaktivnějších vzorců jako otázky do rozhovoru a kde začít.
// 2–4 Tři nejaktivnější vzorce, každý na vlastní straně s místem na poznámky.
// 5 Jak to funguje dohromady a situačně aktivované vzorce.
// 6 Strana pro klienta, jen když ji kouč zaškrtne. Je bez čísel.
//
// Vyšší skóre tu znamená silnější vzorec, ne lepší výsledek. Proto se pásma
// nekreslí barvami ELITE (zelená by tu lhala), ale stupni šedi a slovem.

const OSA_MIN = 10
const OSA_MAX = 60

export interface VzorcePdfVstup {
  /** rozhoduje o variantě textů i o názvu souboru */
  testId: TestId
  person: PersonInfo
  answers: OdpovediMapa
  lang: Lang
  durationSec?: number
  /** přidat stranu pro klienta; kouč ji zaškrtává před tiskem */
  proKlienta?: boolean
}

/** Název souboru: test, klient, datum. Bez diakritiky, ať projde kdekoli. */
export function vzorcePdfFileName(vstup: VzorcePdfVstup): string {
  return (
    [UI_VZORCE[vstup.lang].nazevSouboru[variantaVzorcu(vstup.testId)], vstup.person.name, vstup.person.fillDate]
      .filter(Boolean)
      .join(" - ")
      .replace(/[/\\?%*:|"<>]/g, "-")
      .slice(0, 120) + ".pdf"
  )
}

export function sestavVzorcePdf(vstup: VzorcePdfVstup): Sestava {
  const { testId, person, answers, lang, durationSec } = vstup
  const varianta = variantaVzorcu(testId)
  const gender: Gender = person.gender ?? "male"
  const g = (x: string) => applyGender(x, gender)
  const v = vyhodnot(answers, durationSec)
  const spojeni = propoj(v, lang, varianta)
  const t = UI_VZORCE[lang]
  const ui = UI[lang]
  const ts = TEXTY_SESTAVY[lang]
  const ss = new Sestava(lang)
  const datum = datumLokalne(person.fillDate, lang)
  const klient: Variant = varianta === "obecna" ? "business" : "sport"
  const vnitrni = (sekce: string): Hlavicka => ({
    vlevo: [person.name || "–", TEST_NAMES[testId][lang], datum].filter(Boolean).join(" · "),
    vpravo: sekce,
  })
  const nazev = (x: VzorecSkore) => nazevVzorce(x.id, lang, varianta)
  const zeMax = ts.zeMax(OSA_MAX)
  const naOse = (skore: number) => ((skore - OSA_MIN) / (OSA_MAX - OSA_MIN)) * 100

  // ---------- 1 Přehled ----------
  const minut = durationSec ? Math.round(durationSec / 60) : 0
  const vBoji = new Set(v.top3.map((x) => x.id))
  const profil = (mezera: number) =>
    ss.profil(
      v.vsechny.map((x): RadekProfilu => ({
        nazev: nazev(x),
        hodnota: x.vykazuje ? (x.silnychOdpovedi > 0 ? `${x.skore} (${x.silnychOdpovedi})` : String(x.skore)) : null,
        procenta: naOse(x.skore),
        pasmo: null,
        stitek: x.vykazuje ? NAZVY_PASEM_KRATCE[lang][x.pasmo] : ui.scaleNotReported,
        duraz: vBoji.has(x.id),
        tlumeny: !vBoji.has(x.id),
      })),
      {
        popis: ts.stupnice(OSA_MIN, OSA_MAX),
        hranice: hranicePasem(PASMA, OSA_MIN, OSA_MAX),
        popisky: PASMA.map((p) => NAZVY_PASEM_KRATCE[lang][p.pasmo]),
        barvy: sedaOsa(PASMA.length),
      },
      { mezera },
    )

  const podleDomen = new Map<Domena, VzorecSkore[]>()
  for (const x of v.vsechny) {
    if (!x.vykazuje) continue
    const d = vzorec(x.id).domena
    podleDomen.set(d, [...(podleDomen.get(d) ?? []), x])
  }
  const oblasti = [...podleDomen.entries()]
    .map(([domena, vs]) => ({
      domena,
      prumer: Math.round(vs.reduce((a, b) => a + b.skore, 0) / vs.length),
      pocet: vs.length,
    }))
    .sort((a, b) => b.prumer - a.prumer)
  const nejvic = oblasti[0]?.prumer
  const zatizeni = (mezera: number) =>
    oblasti.length > 0 &&
    ss.skupina([
      ss.text(t.oblastiTitulek, STYL.h2),
      ss.mezera(3),
      ss.profil(
        oblasti.map((o) => ({
          nazev: `${NAZVY_DOMEN_KRATCE[varianta][lang][o.domena]} (${o.pocet})`,
          hodnota: String(o.prumer),
          procenta: naOse(o.prumer),
          pasmo: null,
          stitek: "",
          duraz: o.prumer === nejvic,
          tlumeny: o.prumer !== nejvic,
        })),
        null,
        { mezera },
      ),
    ])

  const motto = (x: VzorecSkore) => vUvozovkach(g(obsahVzorce(x.id, lang, varianta).motto), lang)
  const vety =
    v.top3.length > 0 &&
    ss.box(
      ss.skupina([
        ss.h3(ts.vetyDoRozhovoru),
        ss.mezera(1),
        ss.text(ts.vetyDoRozhovoruPopis, STYL.mala),
        ss.mezera(2),
        ss.body(v.top3.map((x) => ({ titulek: `${nazev(x)} · ${x.skore}`, text: motto(x) }))),
      ]),
    )
  const stKdeZacit: Styl = { pt: 10.2, tucne: true, barva: PAPIR.inkoust, proklad: 1.45 }
  const kdeZacit =
    spojeni && ss.box(ss.skupina([ss.h3(ts.kdeZacit), ss.mezera(1.6), ss.text(g(spojeni.kdeZacit), stKdeZacit)]))

  const prehled = (mezeraProfilu: number): MoznyBlok[] => [
    ss.uvod(TEST_NAMES[testId][lang], person.name, [
      [person.role, ts.vyplneno(datum), minut ? ts.minut(minut) : ""].filter(Boolean).join(" · "),
    ]),
    !v.kompletni && ss.upozorneni(`${t.neuplnyTitulek(v.zodpovezeno, POCET_POLOZEK)} ${t.neuplnyPopis}`),
    ss.skupina([
      ss.text(t.profilTitulek, STYL.h1),
      ss.mezera(1.2),
      ss.text(t.profilPopisPdf, STYL.mala),
      ss.mezera(3.6),
      profil(mezeraProfilu),
    ]),
    zatizeni(mezeraProfilu * 0.8),
    vety,
    kdeZacit,
  ]
  const ROZVRZENI = [
    { strana: 5.8, profil: 3.4 },
    { strana: 5, profil: 2.9 },
    { strana: 4.2, profil: 2.4 },
  ]
  ss.stranaVeVariantach(
    { vlevo: ui.brand, vpravo: ts.proKouce, znacka: true },
    ROZVRZENI.map((x) => ({ bloky: prehled(x.profil), mezera: x.strana })),
  )

  // ---------- 2–4 Tři nejaktivnější vzorce ----------
  v.top3.forEach((x, i) => {
    const o = obsahVzorce(x.id, lang, varianta)
    const domena = NAZVY_DOMEN[varianta][lang][vzorec(x.id).domena]
    const cast = (titulek: string, obsah: string, st: Styl = STYL.textTmavy) =>
      ss.skupina([ss.h3(titulek), ss.mezera(1.2), ss.text(g(obsah), st)])
    ss.tok(
      vnitrni(t.top3Titulek),
      [
        ss.skupina([
          ss.h3(`${t.misto(i + 1)} · ${domena}`, STYL.eyebrow),
          ss.mezera(1),
          ss.text(o.nazev, STYL.h1),
          ss.mezera(0.8),
          ss.text(o.tema, STYL.meta),
        ]),
        ss.oddil(
          ss.sloupce(
            [
              {
                sirka: 60,
                blok: ss.skupina([
                  ss.skore(String(x.skore), zeMax),
                  ss.mezera(1),
                  ss.text(NAZVY_PASEM[lang][x.pasmo], { pt: 9.4, tucne: true, barva: PAPIR.inkoust }),
                  x.silnychOdpovedi > 0 && ss.mezera(1.6),
                  x.silnychOdpovedi > 0 &&
                    ss.text(t.silneOdpovedi(x.silnychOdpovedi, x.silnePolozky.join(", ")), STYL.mala),
                ]),
              },
              {
                blok: ss.skupina([
                  ss.text(motto(x), { pt: 12, tucne: true, proklad: 1.35 }),
                  ss.mezera(2),
                  ss.text(g(o.pasma[x.pasmo])),
                ]),
              },
            ],
            6,
          ),
          3.4,
        ),
        cast(t.jakVypada, o.prozitek),
        cast(t.podTlakem, o.podTlakem),
        cast(t.odkud, o.puvod, STYL.text),
      ],
      { poznamky: ss.zapis(ts.poznamkyZRozhovoru, 2) },
    )
  })

  // ---------- 5 Jak to funguje dohromady ----------
  const situacni =
    v.situacni.length > 0 &&
    ss.skupina([
      ss.text(t.situacniTitulek, STYL.h2),
      ss.mezera(1.2),
      ss.text(t.situacniPopis),
      ss.mezera(2.4),
      ss.udaje(
        v.situacni.map((x) => ({
          popis: nazev(x),
          hodnota: `${x.skore} ${zeMax} · ${t.situacniRadek(x.silnychOdpovedi, x.silnePolozky.join(", "))}`,
        })),
      ),
    ])
  ss.tok(
    vnitrni(t.spojeniTitulek),
    [
      spojeni &&
        ss.skupina([
          ss.text(t.spojeniTitulek, STYL.h1),
          ss.mezera(1.2),
          ss.text(t.spojeniPopis),
          ss.mezera(3),
          spojeni.domeny && ss.text(g(spojeni.domeny), STYL.textTmavy),
        ]),
      spojeni &&
        spojeni.mechanismy.length > 0 &&
        ss.skupina([
          ss.h3(t.kdeSeZivi),
          ss.mezera(2),
          ss.skupina(
            spojeni.mechanismy.map((m) => ss.box(ss.text(g(m), STYL.textTmavy))),
            2.4,
          ),
        ]),
      // Kde začít stojí na první straně, tady by se jen opakovalo.
      spojeni && ss.text(g(spojeni.souhrn), STYL.textTmavy),
      situacni,
      ss.text(t.zaverPdf, STYL.mala),
    ],
    { poznamky: ss.zapis(ts.poznamkyZRozhovoru, 2) },
  )

  // ---------- 6 Pro klienta ----------
  if (vstup.proKlienta) {
    const stOdstavec: Styl = { pt: 10.6, barva: PAPIR.inkoust, proklad: 1.5 }
    ss.stranaVeVariantach(
      { vlevo: ui.brand, vpravo: g(ts.proKlienta[klient]), znacka: true },
      [5.8, 4.6, 3.8].map((mezera) => ({
        mezera,
        bloky: [
          ss.uvod(`${ts.shrnuti} · ${datum}`, person.name, [ts.shrnutiUvod], 22),
          v.top3.length > 0 &&
            ss.skupina([
              ss.h3(ts.vzorceProKlienta),
              ss.mezera(2),
              ss.body(
                v.top3.map((x) => ({ titulek: nazev(x), text: motto(x) })),
                { odrazky: true, mezera: 1.6 },
              ),
            ]),
          spojeni && ss.text(g(spojeni.souhrn), stOdstavec),
          spojeni && ss.box(ss.skupina([ss.h3(ts.kdeZacit), ss.mezera(1.6), ss.text(g(spojeni.kdeZacit), stOdstavec)])),
          ss.text(t.zaverPdf, STYL.mala),
          ss.zapis(ts.mojeJednaVec, 1, 4),
          ss.zapis(ts.podleCehoPoznam, 1, 3),
          ss.zapis(ts.kdoMiPomuze, 1, 2),
          ss.podpisy([ts.kouc, g(ts.klient[klient]), ts.datumRozhovoru]),
        ],
      })),
      { paticka: g(ts.patickaProKlienta[klient]) },
    )
  }

  return ss
}

export function buildVzorcePdf(vstup: VzorcePdfVstup): Blob {
  return sestavVzorcePdf(vstup).dokonci(UI[vstup.lang].confidential)
}
