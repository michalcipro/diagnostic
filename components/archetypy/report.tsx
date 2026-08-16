"use client"

import { useMemo } from "react"
import { applyGender } from "@/lib/diagnostic/content"
import { TEST_NAMES as NAZVY_TESTU, UI } from "@/lib/diagnostic/i18n"
import type { Gender, Lang, PersonInfo, TestId } from "@/lib/diagnostic/types"
import { obsahArchetypu } from "@/lib/archetypy/content"
import { UI_ARCHETYPY } from "@/lib/archetypy/i18n"
import { spojArchetypy } from "@/lib/archetypy/kombinace"
import { vyhodnotArchetypy } from "@/lib/archetypy/scoring"
import { NAZVY_MOTIVACI, POCET_POLOZEK, archetyp } from "@/lib/archetypy/structure"
import type { ArchetypId, ArchetypSkore, OdpovediMapa, Varianta } from "@/lib/archetypy/types"
import { variantaArchetypu } from "@/lib/diagnostic/structure"
import {
  DvojicePrstencu,
  MotivaceGraf,
  ProfilArchetypuGraf,
} from "@/components/archetypy/charts"

// Vyhodnocení archetypů značky.
//
// Stavba: profil všech dvanácti pro orientaci, motivační mapa, pak podrobný
// výklad primárního archetypu s návodem, kratší výklad sekundárního a
// propojení obou včetně potlačeného archetypu. Končí shrnutím pro klienta.
// Vidí ho pouze kouč.

/** Datum v místním tvaru. Vstup je ISO, ať se dá řadit. */
function datum(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso ?? "")
  if (!m) return iso || "–"
  return `${Number(m[3])}. ${Number(m[2])}. ${m[1]}`
}

/** Popisek nad údajem v hlavičce. */
function Udaj({ popis, hodnota }: { popis: string; hodnota: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-[11px] font-bold uppercase tracking-[0.1em] text-[var(--wm-text-3)]">
        {popis}
      </dt>
      <dd className="mt-1 truncate text-[15px] font-semibold" title={hodnota}>
        {hodnota}
      </dd>
    </div>
  )
}

/** Mezititulek sekce uvnitř článku archetypu. */
function Mezititulek({ text }: { text: string }) {
  return (
    <h4 className="mt-5 text-[12px] font-bold uppercase tracking-[0.1em] text-[var(--wm-text-3)]">
      {text}
    </h4>
  )
}

/** Trojice touha / strach / dar: rychlé ukotvení archetypu podle knihy. */
function Jadro({
  o,
  lang,
  varianta,
  g,
}: {
  o: ReturnType<typeof obsahArchetypu>
  lang: Lang
  varianta: Varianta
  g: (t: string) => string
}) {
  const t = UI_ARCHETYPY[lang]
  const radky = [
    { popis: t.touhaStitek, hodnota: o.touha },
    { popis: t.strachStitek, hodnota: o.strach },
    { popis: t.darStitek[varianta], hodnota: o.dar },
  ]
  return (
    <div className="mt-4 grid gap-3 rounded-xl bg-[var(--wm-surface-2)] p-4 sm:grid-cols-3">
      {radky.map((r) => (
        <div key={r.popis} className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-[var(--wm-text-3)]">
            {r.popis}
          </p>
          <p className="mt-1 text-[13.5px] leading-snug">{g(r.hodnota)}</p>
        </div>
      ))}
    </div>
  )
}

/** Skóre v rohu článku. */
function SkoreBox({ s, lang }: { s: ArchetypSkore; lang: Lang }) {
  return (
    <div className="flex w-[76px] shrink-0 flex-col items-center rounded-2xl bg-[var(--wm-track)] px-2 py-3">
      <span className="text-[26px] font-bold leading-none tracking-tight tabular-nums">
        {s.skore}
      </span>
      <span className="mt-1.5 text-[11px] leading-none text-[var(--wm-text-3)]">
        {UI_ARCHETYPY[lang].z48}
      </span>
    </div>
  )
}

export function ArchetypyReport({
  testId,
  person,
  answers,
  lang,
  durationSec,
}: {
  testId: TestId
  person: PersonInfo
  answers: OdpovediMapa
  lang: Lang
  durationSec?: number
}) {
  const varianta: Varianta = variantaArchetypu(testId)
  const gender: Gender = person.gender ?? "male"
  const v = useMemo(() => vyhodnotArchetypy(answers, durationSec), [answers, durationSec])
  const spojeni = useMemo(() => spojArchetypy(v, lang, varianta), [v, lang, varianta])
  const g = (t: string) => applyGender(t, gender)
  const t = UI_ARCHETYPY[lang]

  const oP = obsahArchetypu(v.primarni.id, lang, varianta)
  const oS = obsahArchetypu(v.sekundarni.id, lang, varianta)
  /** čísla položek archetypu označená hodnotou 5 nebo 6, pro rozhovor s koučem */
  const silnePolozky = (id: ArchetypId) =>
    archetyp(id)
      .polozky.filter((p) => (answers[p] ?? 0) >= 5)
      .join(", ")
  const skupinaP = NAZVY_MOTIVACI[lang][archetyp(v.primarni.id).motivace]
  const skupinaS = NAZVY_MOTIVACI[lang][archetyp(v.sekundarni.id).motivace]

  return (
    <>
      <header className="diag-card p-7">
        <p className="text-[12px] font-bold tracking-[0.18em] text-[var(--wm-text-3)]">
          {UI[lang].brand}
        </p>
        <h1 className="mt-2 text-[28px] font-bold leading-tight tracking-tight">
          {NAZVY_TESTU[testId][lang]} · {UI[lang].reportTitle}
        </h1>
        <p className="mt-1 text-[15px] text-[var(--wm-text-2)]">{t.podnadpis[varianta]}</p>
        <dl className="mt-6 grid gap-x-8 gap-y-4 border-t border-[var(--wm-border-light)] pt-5 sm:grid-cols-3">
          <Udaj popis={t.respondent} hodnota={person.name || "–"} />
          <Udaj popis={t.role[varianta]} hodnota={person.role || "–"} />
          <Udaj popis={t.datum} hodnota={datum(person.fillDate)} />
        </dl>
      </header>

      {!v.kompletni && (
        <div className="mt-4 rounded-2xl border border-[var(--wm-orange)] bg-[var(--wm-orange-light)] p-4 text-[14px] text-[var(--wm-caution-fg)]">
          <p className="font-medium">{t.neuplnyTitulek(v.zodpovezeno, POCET_POLOZEK)}</p>
          <p className="mt-1.5 text-[13px] leading-relaxed opacity-90">{t.neuplnyPopis}</p>
        </div>
      )}

      {/* profil všech dvanácti */}
      <section className="diag-card mt-5 p-7">
        <h2 className="text-[18px] font-bold tracking-tight">{t.profilTitulek}</h2>
        <p className="mt-1 mb-5 max-w-2xl text-[13px] leading-relaxed text-[var(--wm-text-3)]">
          {t.profilPopisWeb[varianta]}
        </p>
        <ProfilArchetypuGraf
          vsechny={v.vsechny}
          primarni={v.primarni}
          sekundarni={v.sekundarni}
          lang={lang}
          varianta={varianta}
        />
      </section>

      {/* motivační mapa */}
      <section className="diag-card mt-5 p-7">
        <h2 className="text-[18px] font-bold tracking-tight">{t.motivaceTitulek}</h2>
        <p className="mt-1 mb-5 max-w-2xl text-[13px] leading-relaxed text-[var(--wm-text-3)]">
          {t.motivacePopis}
        </p>
        <MotivaceGraf motivace={v.motivace} lang={lang} varianta={varianta} />
      </section>

      {/* dvojice, se kterou se pracuje */}
      <section className="diag-print-break mt-8">
        <div className="mb-5 flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <h2 className="text-[22px] font-bold tracking-tight">
            {t.primarniTitulek}: {oP.nazev}
          </h2>
          <span className="rounded-full bg-[var(--wm-track)] px-2.5 py-[3px] text-[12px] font-medium text-[var(--wm-text-2)]">
            {t.vyhraneniStitek[v.vyhraneni]}
          </span>
        </div>

        <div className="diag-card mb-5 px-7 py-8">
          <DvojicePrstencu
            primarni={v.primarni}
            sekundarni={v.sekundarni}
            lang={lang}
            varianta={varianta}
          />
          <p className="mx-auto mt-6 max-w-[74ch] text-center text-[13.5px] leading-relaxed text-[var(--wm-text-2)]">
            {g(spojeni.vyhraneni)}
          </p>
        </div>

        {/* primární archetyp */}
        <article className="diag-card p-7">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <p className="text-[12px] font-bold uppercase tracking-[0.12em] text-[var(--wm-text-3)]">
                {t.primarniTitulek} · {skupinaP}
              </p>
              <h3 className="mt-1 text-[20px] font-bold tracking-tight">{oP.nazev}</h3>
              <p className="mt-1 text-[13px] text-[var(--wm-text-2)]">
                {t.vKnize}: {oP.puvodni}
              </p>
            </div>
            <SkoreBox s={v.primarni} lang={lang} />
          </div>

          <p className="mt-4 max-w-[74ch] border-l-2 border-[var(--wm-brand)] pl-4 text-[15px] font-semibold italic">
            „{g(oP.motto)}“
          </p>

          <Jadro o={oP} lang={lang} varianta={varianta} g={g} />

          {v.primarni.silnychOdpovedi > 0 && (
            <p className="mt-3 text-[12.5px] leading-relaxed text-[var(--wm-text-3)]">
              {t.silneOdpovedi(v.primarni.silnychOdpovedi, silnePolozky(v.primarni.id))}
            </p>
          )}

          <Mezititulek text={t.podstataTitulek} />
          <p className="mt-1.5 max-w-[74ch] text-[14.5px] leading-relaxed">{g(oP.podstata)}</p>

          <Mezititulek text={t.vPodnikaniTitulek[varianta]} />
          <p className="mt-1.5 max-w-[74ch] text-[14.5px] leading-relaxed">{g(oP.vPodnikani)}</p>

          {/* sportovní verze má navíc roli a vztah s trenérem */}
          {oP.role && (
            <>
              <Mezititulek text={t.roleTitulek} />
              <p className="mt-1.5 max-w-[74ch] text-[14.5px] leading-relaxed">{g(oP.role)}</p>
            </>
          )}

          <Mezititulek text={t.stinTitulek} />
          <p className="mt-1.5 max-w-[74ch] text-[14.5px] leading-relaxed">{g(oP.stin)}</p>

          {oP.sTrenerem && (
            <>
              <Mezititulek text={t.sTreneremTitulek} />
              <p className="mt-1.5 max-w-[74ch] text-[14.5px] leading-relaxed">{g(oP.sTrenerem)}</p>
            </>
          )}

          <Mezititulek text={t.pastiTitulek[varianta]} />
          <p className="mt-1.5 max-w-[74ch] text-[14.5px] leading-relaxed">{g(oP.pasti)}</p>

          <Mezititulek text={t.navodTitulek[varianta]} />
          <ol className="mt-2 flex max-w-[74ch] flex-col gap-2.5">
            {oP.navod.map((krok, i) => (
              <li
                key={i}
                className="flex gap-3 rounded-xl bg-[var(--wm-surface-2)] p-4 text-[14px] leading-relaxed"
              >
                <span className="shrink-0 font-bold tabular-nums text-[var(--wm-brand)]">
                  {i + 1}.
                </span>
                <span>{g(krok)}</span>
              </li>
            ))}
          </ol>

          {oP.znacka && (
            <>
              <Mezititulek text={t.znackaTitulek} />
              <p className="mt-1.5 max-w-[74ch] text-[14.5px] leading-relaxed text-[var(--wm-text-2)]">
                {g(oP.znacka)}
              </p>
            </>
          )}

          <p className="mt-4 text-[12.5px] leading-relaxed text-[var(--wm-text-3)]">
            {t.prikladyStitek[varianta]}: {oP.priklady}
          </p>
        </article>

        {/* sekundární archetyp */}
        <article className="diag-card mt-5 p-7">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <p className="text-[12px] font-bold uppercase tracking-[0.12em] text-[var(--wm-text-3)]">
                {t.sekundarniTitulek} · {skupinaS}
              </p>
              <h3 className="mt-1 text-[20px] font-bold tracking-tight">{oS.nazev}</h3>
              <p className="mt-1 text-[13px] text-[var(--wm-text-2)]">
                {t.vKnize}: {oS.puvodni}
              </p>
            </div>
            <SkoreBox s={v.sekundarni} lang={lang} />
          </div>

          <p className="mt-4 max-w-[74ch] border-l-2 border-[var(--wm-brand)] pl-4 text-[15px] font-semibold italic">
            „{g(oS.motto)}“
          </p>

          <Jadro o={oS} lang={lang} varianta={varianta} g={g} />

          <Mezititulek text={t.sekundarniRoleStitek} />
          <p className="mt-1.5 max-w-[74ch] text-[14.5px] leading-relaxed">{g(oS.sekundarniRole)}</p>

          {oS.role && (
            <>
              <Mezititulek text={t.roleTitulek} />
              <p className="mt-1.5 max-w-[74ch] text-[14.5px] leading-relaxed">{g(oS.role)}</p>
            </>
          )}

          <Mezititulek text={t.stinTitulek} />
          <p className="mt-1.5 max-w-[74ch] text-[14.5px] leading-relaxed text-[var(--wm-text-2)]">
            {g(oS.stin)}
          </p>
        </article>
      </section>

      {/* jak spolu hrají */}
      <section className="diag-card mt-8 p-7">
        <h2 className="text-[18px] font-bold tracking-tight">{t.kombinaceTitulek}</h2>
        <p className="mt-1 max-w-[74ch] text-[13px] text-[var(--wm-text-3)]">{t.kombinacePopis[varianta]}</p>

        <p className="mt-4 max-w-[74ch] text-[14.5px] leading-relaxed">{g(spojeni.kombinace)}</p>

        <h4 className="mt-5 text-[12px] font-bold uppercase tracking-[0.1em] text-[var(--wm-text-3)]">
          {t.potlacenyTitulek}
        </h4>
        <p className="mt-2 max-w-[74ch] rounded-xl bg-[var(--wm-surface-2)] p-4 text-[14.5px] leading-relaxed">
          {g(spojeni.potlaceny)}
        </p>
      </section>

      {/* shrnutí pro klienta */}
      <section className="diag-card diag-print-break mt-8 border-2 border-[var(--wm-brand)] p-7">
        <h2 className="text-[22px] font-bold tracking-tight">{t.souhrnTitulek}</h2>
        <p className="mt-1 max-w-[74ch] text-[13px] text-[var(--wm-text-3)]">{t.souhrnPopis[varianta]}</p>

        <p className="mt-4 max-w-[74ch] text-[15px] leading-relaxed">{g(spojeni.souhrn)}</p>

        <h4 className="mt-5 text-[12px] font-bold uppercase tracking-[0.1em] text-[var(--wm-text-3)]">
          {t.kdeZacitStitek}
        </h4>
        <p className="mt-2 max-w-[74ch] rounded-xl bg-[var(--wm-surface-2)] p-4 text-[15px] font-medium leading-relaxed">
          {g(spojeni.kdeZacit)}
        </p>
      </section>

      <section className="mt-6 flex flex-col gap-3 text-[13px] leading-relaxed text-[var(--wm-text-2)]">
        {t.zaverWeb[varianta].map((odstavec, i) => (
          <p key={i}>{odstavec}</p>
        ))}
      </section>

      <footer className="mt-10 border-t border-[var(--wm-border-light)] pt-6 text-center text-[12px] text-[var(--wm-text-3)]">
        {UI[lang].confidential}
      </footer>
    </>
  )
}
