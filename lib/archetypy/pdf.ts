import { applyGender } from "../diagnostic/content"
import { TEST_NAMES, UI } from "../diagnostic/i18n"
import { vUvozovkach } from "../diagnostic/otazky"
import { datumLokalne } from "../diagnostic/pdf/sazba"
import {
  PAPIR,
  STYL,
  Sestava,
  type Blok,
  type Hlavicka,
  type MoznyBlok,
  type RadekProfilu,
  type Styl,
} from "../diagnostic/pdf/sestava"
import { TEXTY_SESTAVY } from "../diagnostic/pdf/sestava-texty"
import { variantaArchetypu } from "../diagnostic/structure"
import type { Gender, Lang, PersonInfo, TestId } from "../diagnostic/types"
import { nazevArchetypu, obsahArchetypu } from "./content"
import { UI_ARCHETYPY } from "./i18n"
import { spojArchetypy } from "./kombinace"
import { vyhodnotArchetypy } from "./scoring"
import { NAZVY_MOTIVACI, POCET_POLOZEK, archetyp } from "./structure"
import type { ArchetypSkore, Motivace, OdpovediMapa } from "./types"

// Tisková sestava archetypů značky. Stejná kostra jako ELITE:
//
// 1 Přehled: profil všech dvanácti, motivační mapa, primární a sekundární
//   archetyp s mottem a kde začít.
// 2 Primární archetyp do hloubky, s návodem a místem na poznámky.
// 3 Sekundární archetyp a jak spolu hrají.
// 4 Strana pro klienta, jen když ji kouč zaškrtne. Je bez čísel.
//
// Archetypy nemají pásma: neměří, co je dobře nebo špatně, ale identitu.
// Pruhy proto nemají rysky ani štítky, jen zvýrazněnou dvojici, se kterou
// se dál pracuje.

const OSA_MIN = 8
const OSA_MAX = 48

export interface ArchetypyPdfVstup {
  testId: TestId
  person: PersonInfo
  answers: OdpovediMapa
  lang: Lang
  durationSec?: number
  /** přidat stranu pro klienta; kouč ji zaškrtává před tiskem */
  proKlienta?: boolean
}

/** Název souboru: test, klient, datum. Bez diakritiky, ať projde kdekoli. */
export function archetypyPdfFileName(vstup: ArchetypyPdfVstup): string {
  return (
    [UI_ARCHETYPY[vstup.lang].nazevSouboru[variantaArchetypu(vstup.testId)], vstup.person.name, vstup.person.fillDate]
      .filter(Boolean)
      .join(" - ")
      .replace(/[/\\?%*:|"<>]/g, "-")
      .slice(0, 120) + ".pdf"
  )
}

export function sestavArchetypyPdf(vstup: ArchetypyPdfVstup): Sestava {
  const { testId, person, answers, lang, durationSec } = vstup
  const varianta = variantaArchetypu(testId)
  const gender: Gender = person.gender ?? "male"
  const g = (x: string) => applyGender(x, gender)
  const v = vyhodnotArchetypy(answers, durationSec)
  const spojeni = spojArchetypy(v, lang, varianta)
  const t = UI_ARCHETYPY[lang]
  const ui = UI[lang]
  const ts = TEXTY_SESTAVY[lang]
  const ss = new Sestava(lang)
  const datum = datumLokalne(person.fillDate, lang)
  const vnitrni = (sekce: string): Hlavicka => ({
    vlevo: [person.name || "–", TEST_NAMES[testId][lang], datum].filter(Boolean).join(" · "),
    vpravo: sekce,
  })
  const naOse = (skore: number) => ((skore - OSA_MIN) / (OSA_MAX - OSA_MIN)) * 100
  const motto = (x: ArchetypSkore) => vUvozovkach(g(obsahArchetypu(x.id, lang, varianta).motto), lang)
  const cast = (titulek: string, obsah: string, st: Styl = STYL.textTmavy) =>
    obsah.trim() ? ss.skupina([ss.h3(titulek), ss.mezera(1.2), ss.text(g(obsah), st)]) : null

  // ---------- 1 Přehled ----------
  const minut = durationSec ? Math.round(durationSec / 60) : 0
  const vyzdvizene = new Set([v.primarni.id, v.sekundarni.id])
  const profil = (mezera: number) =>
    ss.profil(
      v.vsechny.map((x): RadekProfilu => ({
        nazev: nazevArchetypu(x.id, lang, varianta),
        hodnota: x.vykazuje ? (x.silnychOdpovedi > 0 ? `${x.skore} (${x.silnychOdpovedi})` : String(x.skore)) : null,
        procenta: naOse(x.skore),
        pasmo: null,
        stitek: x.vykazuje ? "" : ui.scaleNotReported,
        duraz: vyzdvizene.has(x.id),
        tlumeny: !vyzdvizene.has(x.id),
      })),
      null,
      { mezera },
    )
  const skupiny = (Object.entries(v.motivace) as [Motivace, number][])
    .map(([m, p]) => ({ m, p }))
    .sort((a, b) => b.p - a.p)
  const nejvic = skupiny[0]?.p
  const motivace = (mezera: number) =>
    ss.skupina([
      ss.text(t.motivaceTitulek, STYL.h2),
      ss.mezera(1.2),
      ss.text(t.motivacePopis, STYL.mala),
      ss.mezera(3),
      ss.profil(
        skupiny.map((r) => ({
          nazev: NAZVY_MOTIVACI[lang][r.m],
          hodnota: `${Math.round(r.p)} %`,
          procenta: r.p,
          pasmo: null,
          stitek: "",
          duraz: r.p === nejvic,
          tlumeny: r.p !== nejvic,
        })),
        null,
        { mezera },
      ),
    ])
  const archetypVBoxu = (x: ArchetypSkore, titulek: string) =>
    ss.skupina([
      ss.h3(titulek),
      ss.mezera(1),
      ss.text(`${nazevArchetypu(x.id, lang, varianta)} · ${x.skore}`, STYL.h2),
      ss.mezera(0.8),
      ss.text(motto(x)),
    ])
  const dvojice = ss.box(
    ss.skupina([
      ss.sloupce(
        [
          { blok: archetypVBoxu(v.primarni, t.primarniTitulek) },
          { blok: archetypVBoxu(v.sekundarni, t.sekundarniTitulek) },
        ],
        6,
      ),
      ss.mezera(2.4),
      ss.text(`${t.vyhraneniStitek[v.vyhraneni]} · ${g(spojeni.vyhraneni)}`, STYL.mala),
    ]),
  )
  const stKdeZacit: Styl = { pt: 10.2, tucne: true, barva: PAPIR.inkoust, proklad: 1.45 }
  const kdeZacit = ss.box(
    ss.skupina([ss.h3(t.kdeZacitStitek), ss.mezera(1.6), ss.text(g(spojeni.kdeZacit), stKdeZacit)]),
  )

  const prehled = (mezeraProfilu: number): MoznyBlok[] => [
    ss.uvod(TEST_NAMES[testId][lang], person.name, [
      [person.role, ts.vyplneno(datum), minut ? ts.minut(minut) : ""].filter(Boolean).join(" · "),
    ]),
    !v.kompletni && ss.upozorneni(`${t.neuplnyTitulek(v.zodpovezeno, POCET_POLOZEK)} ${t.neuplnyPopis}`),
    ss.skupina([
      ss.text(t.profilTitulek, STYL.h1),
      ss.mezera(1.2),
      ss.text(t.profilPopisPdf[varianta], STYL.mala),
      ss.mezera(3.6),
      profil(mezeraProfilu),
    ]),
    motivace(mezeraProfilu * 0.8),
    dvojice,
    kdeZacit,
  ]
  const ROZVRZENI = [
    { strana: 5.8, profil: 3.2 },
    { strana: 5, profil: 2.7 },
    { strana: 4.2, profil: 2.2 },
  ]
  ss.stranaVeVariantach(
    { vlevo: ui.brand, vpravo: ts.proKouce, znacka: true },
    ROZVRZENI.map((x) => ({ bloky: prehled(x.profil), mezera: x.strana })),
  )

  // ---------- 2 a 3 Primární a sekundární archetyp ----------
  const hlavaArchetypu = (x: ArchetypSkore, stitek: string, pravy: Blok, priklady = false) => {
    const o = obsahArchetypu(x.id, lang, varianta)
    const skupina = NAZVY_MOTIVACI[lang][archetyp(x.id).motivace]
    return [
      ss.skupina([
        ss.h3(`${stitek} · ${skupina}`, STYL.eyebrow),
        ss.mezera(1),
        ss.text(o.nazev, STYL.h1),
        ss.mezera(0.8),
        ss.text(`${t.vKnize}: ${o.puvodni}`, STYL.meta),
        priklady && o.priklady.trim() && ss.text(`${t.prikladyStitek[varianta]}: ${o.priklady}`, STYL.mala),
      ]),
      ss.oddil(
        ss.sloupce(
          [
            {
              sirka: 60,
              blok: ss.skore(String(x.skore), ts.zeMax(OSA_MAX)),
            },
            { blok: pravy },
          ],
          6,
        ),
        3.4,
      ),
    ]
  }

  const p = obsahArchetypu(v.primarni.id, lang, varianta)
  const trojice = (o: typeof p) =>
    ss.sloupce(
      [
        { blok: ss.skupina([ss.h3(t.touhaStitek), ss.mezera(0.8), ss.text(g(o.touha))]) },
        { blok: ss.skupina([ss.h3(t.strachStitek), ss.mezera(0.8), ss.text(g(o.strach))]) },
        { blok: ss.skupina([ss.h3(t.darStitek[varianta]), ss.mezera(0.8), ss.text(g(o.dar))]) },
      ],
      5,
    )
  ss.tok(
    vnitrni(t.primarniTitulek),
    [
      ...hlavaArchetypu(
        v.primarni,
        t.primarniTitulek,
        ss.skupina([ss.text(motto(v.primarni), { pt: 12, tucne: true, proklad: 1.35 }), ss.mezera(2.4), trojice(p)]),
        true,
      ),
      cast(t.podstataTitulek, p.podstata),
      cast(t.vPodnikaniTitulek[varianta], p.vPodnikani),
      cast(t.roleTitulek, p.role ?? ""),
      cast(t.stinTitulek, p.stin),
      cast(t.sTreneremTitulek, p.sTrenerem ?? ""),
      cast(t.pastiTitulek[varianta], p.pasti, STYL.text),
      ss.skupina([
        ss.h3(t.navodTitulek[varianta]),
        ss.mezera(1.6),
        ss.seznam(p.navod.map(g), STYL.textTmavy, { mezera: 1.4 }),
      ]),
      cast(t.znackaTitulek, p.znacka ?? "", STYL.text),
    ],
    { poznamky: ss.zapis(ts.poznamkyZRozhovoru, 2) },
  )

  const s = obsahArchetypu(v.sekundarni.id, lang, varianta)
  ss.tok(
    vnitrni(t.sekundarniTitulek),
    [
      ...hlavaArchetypu(
        v.sekundarni,
        t.sekundarniTitulek,
        ss.skupina([
          ss.text(motto(v.sekundarni), { pt: 12, tucne: true, proklad: 1.35 }),
          ss.mezera(2.4),
          ss.h3(t.sekundarniRoleStitek),
          ss.mezera(0.8),
          ss.text(g(s.sekundarniRole)),
        ]),
      ),
      cast(t.roleTitulek, s.role ?? ""),
      cast(t.stinTitulek, s.stin, STYL.text),
      ss.skupina([
        ss.text(t.kombinaceTitulek, STYL.h2),
        ss.mezera(1.2),
        ss.text(t.kombinacePopis[varianta], STYL.mala),
        ss.mezera(2.4),
        ss.text(g(spojeni.kombinace), STYL.textTmavy),
      ]),
      ss.skupina([ss.h3(t.potlacenyTitulek), ss.mezera(1.6), ss.box(ss.text(g(spojeni.potlaceny), STYL.textTmavy))]),
      ss.text(t.zaverPdf[varianta], STYL.mala),
    ],
    { poznamky: ss.zapis(ts.poznamkyZRozhovoru, 2) },
  )

  // ---------- 4 Pro klienta ----------
  if (vstup.proKlienta) {
    const stOdstavec: Styl = { pt: 10.6, barva: PAPIR.inkoust, proklad: 1.5 }
    ss.stranaVeVariantach(
      { vlevo: ui.brand, vpravo: g(ts.proKlienta[varianta]), znacka: true },
      [5.8, 4.6, 3.8].map((mezera) => ({
        mezera,
        bloky: [
          ss.uvod(`${ts.shrnuti} · ${datum}`, person.name, [ts.shrnutiUvod], 22),
          ss.body(
            [
              {
                titulek: `${t.primarniTitulek}: ${nazevArchetypu(v.primarni.id, lang, varianta)}`,
                text: motto(v.primarni),
              },
              {
                titulek: `${t.sekundarniTitulek}: ${nazevArchetypu(v.sekundarni.id, lang, varianta)}`,
                text: motto(v.sekundarni),
              },
            ],
            { odrazky: true, mezera: 1.6 },
          ),
          ss.text(g(spojeni.souhrn), stOdstavec),
          ss.box(ss.skupina([ss.h3(t.kdeZacitStitek), ss.mezera(1.6), ss.text(g(spojeni.kdeZacit), stOdstavec)])),
          ss.zapis(ts.mojeJednaVec, 2, 4),
          ss.zapis(ts.podleCehoPoznam, 1, 3),
          ss.zapis(ts.kdoMiPomuze, 1, 2),
          ss.podpisy([ts.kouc, g(ts.klient[varianta]), ts.datumRozhovoru]),
        ],
      })),
      { paticka: g(ts.patickaProKlienta[varianta]) },
    )
  }

  return ss
}

export function buildArchetypyPdf(vstup: ArchetypyPdfVstup): Blob {
  return sestavArchetypyPdf(vstup).dokonci(UI[vstup.lang].confidential)
}
