"use client"

import { useMemo } from "react"
import { applyGender } from "@/lib/diagnostic/content"
import { TEST_NAMES, UI } from "@/lib/diagnostic/i18n"
import type { Gender, Lang, PersonInfo } from "@/lib/diagnostic/types"
import { obsahVzorce } from "@/lib/vzorce/content"
import { UI_VZORCE } from "@/lib/vzorce/i18n"
import { vyhodnot } from "@/lib/vzorce/scoring"
import { NAZVY_DOMEN, NAZVY_PASEM, POCET_POLOZEK, vzorec } from "@/lib/vzorce/structure"
import type { OdpovediMapa } from "@/lib/vzorce/types"
import { propoj } from "@/lib/vzorce/vazby"
import { DomenyGraf, ProfilGraf, TrojicePrstencu } from "@/components/vzorce/charts"

// Vyhodnocení emocionálně-destruktivních vzorců.
//
// Stavba sleduje zadání: profil všech jedenácti pro orientaci, pak podrobné
// vysvětlení tří nejaktivnějších vzorců a nakonec shrnutí, které je propojuje
// do jednoho obrazu. Vidí ho pouze kouč.

/** Datum v místním tvaru. Vstup je ISO, ať se dá řadit. Čeština i slovenština
 * píšou den. měsíc. rok, takže stačí jeden tvar. */
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

export function VzorceReport({
  person,
  answers,
  lang,
  durationSec,
}: {
  person: PersonInfo
  answers: OdpovediMapa
  lang: Lang
  durationSec?: number
}) {
  const gender: Gender = person.gender ?? "male"
  const v = useMemo(() => vyhodnot(answers, durationSec), [answers, durationSec])
  const spojeni = useMemo(() => propoj(v, lang), [v, lang])
  const g = (t: string) => applyGender(t, gender)
  const t = UI_VZORCE[lang]

  return (
    <>
      <header className="diag-card p-7">
        <p className="text-[12px] font-bold tracking-[0.18em] text-[var(--wm-text-3)]">
          {UI[lang].brand}
        </p>
        <h1 className="mt-2 text-[28px] font-bold leading-tight tracking-tight">
          {TEST_NAMES.vzorce[lang]} · {UI[lang].reportTitle}
        </h1>
        <p className="mt-1 text-[15px] text-[var(--wm-text-2)]">{t.podnadpis}</p>
        <dl className="mt-6 grid gap-x-8 gap-y-4 border-t border-[var(--wm-border-light)] pt-5 sm:grid-cols-3">
          <Udaj popis={t.respondent} hodnota={person.name || "–"} />
          <Udaj popis={t.role} hodnota={person.role || "–"} />
          <Udaj popis={t.datum} hodnota={datum(person.fillDate)} />
        </dl>
      </header>

      {!v.kompletni && (
        <div className="mt-4 rounded-2xl border border-[var(--wm-orange)] bg-[var(--wm-orange-light)] p-4 text-[14px] text-[var(--wm-caution-fg)]">
          <p className="font-medium">{t.neuplnyTitulek(v.zodpovezeno, POCET_POLOZEK)}</p>
          <p className="mt-1.5 text-[13px] leading-relaxed opacity-90">{t.neuplnyPopis}</p>
        </div>
      )}

      {/* profil všech jedenácti */}
      <section className="diag-card mt-5 p-7">
        <h2 className="text-[18px] font-bold tracking-tight">{t.profilTitulek}</h2>
        <p className="mt-1 mb-5 max-w-2xl text-[13px] leading-relaxed text-[var(--wm-text-3)]">
          {t.profilPopisWeb}
        </p>
        <ProfilGraf vsechny={v.vsechny} top3={v.top3} lang={lang} />
      </section>

      {/* zatížení oblastí */}
      <section className="diag-card mt-5 p-7">
        <h2 className="text-[18px] font-bold tracking-tight">{t.oblastiTitulek}</h2>
        <p className="mt-1 mb-5 max-w-2xl text-[13px] leading-relaxed text-[var(--wm-text-3)]">
          {t.oblastiPopisWeb}
        </p>
        <DomenyGraf vsechny={v.vsechny} lang={lang} />
      </section>

      {/* tři nejaktivnější */}
      <section className="diag-print-break mt-8">
        <h2 className="mb-1 text-[22px] font-bold tracking-tight">{t.top3Titulek}</h2>
        <p className="mb-5 max-w-[74ch] text-[13.5px] leading-relaxed text-[var(--wm-text-2)]">
          {t.top3Popis}
        </p>

        <div className="diag-card mb-5 px-7 py-8">
          <TrojicePrstencu top3={v.top3} lang={lang} />
        </div>

        <div className="flex flex-col gap-5">
          {v.top3.map((s, i) => {
            const o = obsahVzorce(s.id, lang)
            const d = vzorec(s.id).domena
            return (
              <article key={s.id} className="diag-card p-7">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="text-[12px] font-bold uppercase tracking-[0.12em] text-[var(--wm-text-3)]">
                      {t.misto(i + 1)} · {NAZVY_DOMEN[lang][d]}
                    </p>
                    <h3 className="mt-1 text-[20px] font-bold tracking-tight">{o.nazev}</h3>
                    <p className="mt-1 text-[13px] text-[var(--wm-text-2)]">{o.tema}</p>
                  </div>
                  <div className="flex w-[76px] shrink-0 flex-col items-center rounded-2xl bg-[var(--wm-track)] px-2 py-3">
                    <span className="text-[26px] font-bold leading-none tracking-tight tabular-nums">
                      {s.skore}
                    </span>
                    <span className="mt-1.5 text-[11px] leading-none text-[var(--wm-text-3)]">
                      {t.z60}
                    </span>
                  </div>
                </div>

                <p className="mt-4 max-w-[74ch] border-l-2 border-[var(--wm-brand)] pl-4 text-[15px] font-semibold italic">
                  „{g(o.motto)}“
                </p>

                <div className="mt-4 rounded-xl bg-[var(--wm-surface-2)] p-4">
                  <p className="text-[13.5px] leading-relaxed">
                    <span className="font-semibold">{NAZVY_PASEM[lang][s.pasmo]}</span>{" "}
                    {g(o.pasma[s.pasmo])}
                  </p>
                  {s.silnychOdpovedi > 0 && (
                    <p className="mt-1.5 text-[12.5px] leading-relaxed text-[var(--wm-text-3)]">
                      {t.silneOdpovedi(s.silnychOdpovedi, s.silnePolozky.join(", "))}
                    </p>
                  )}
                </div>

                <h4 className="mt-5 text-[12px] font-bold uppercase tracking-[0.1em] text-[var(--wm-text-3)]">
                  {t.jakVypada}
                </h4>
                <p className="mt-1.5 max-w-[74ch] text-[14.5px] leading-relaxed">{g(o.prozitek)}</p>

                <h4 className="mt-4 text-[12px] font-bold uppercase tracking-[0.1em] text-[var(--wm-text-3)]">
                  {t.podTlakem}
                </h4>
                <p className="mt-1.5 max-w-[74ch] text-[14.5px] leading-relaxed">{g(o.podTlakem)}</p>

                <h4 className="mt-4 text-[12px] font-bold uppercase tracking-[0.1em] text-[var(--wm-text-3)]">
                  {t.odkud}
                </h4>
                <p className="mt-1.5 max-w-[74ch] text-[14.5px] leading-relaxed text-[var(--wm-text-2)]">
                  {g(o.puvod)}
                </p>
              </article>
            )
          })}
        </div>
      </section>

      {/* situačně aktivované vzorce */}
      {v.situacni.length > 0 && (
        <section className="diag-card mt-5 p-7">
          <h2 className="text-[18px] font-bold tracking-tight">{t.situacniTitulek}</h2>
          <p className="mt-1.5 max-w-[74ch] text-[13.5px] leading-relaxed text-[var(--wm-text-2)]">
            {t.situacniPopis}
          </p>
          <div className="mt-4 flex flex-col divide-y divide-[var(--wm-border-light)] border-t border-[var(--wm-border-light)]">
            {v.situacni.map((s) => (
              <div
                key={s.id}
                className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-4 gap-y-1 py-2.5 md:grid-cols-[14rem_3.25rem_minmax(0,1fr)]"
              >
                <span
                  className="truncate text-[14px] font-medium"
                  title={obsahVzorce(s.id, lang).nazev}
                >
                  {obsahVzorce(s.id, lang).nazev}
                </span>
                <span className="text-right text-[14px] font-semibold tabular-nums">
                  {s.skore}
                  <span className="font-normal text-[var(--wm-text-3)]">/60</span>
                </span>
                <span className="col-span-2 text-[12.5px] leading-relaxed text-[var(--wm-text-3)] md:col-span-1">
                  {t.situacniRadek(s.silnychOdpovedi, s.silnePolozky.join(", "))}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* propojené shrnutí */}
      {spojeni && (
        <section className="diag-card diag-print-break mt-8 border-2 border-[var(--wm-brand)] p-7">
          <h2 className="text-[22px] font-bold tracking-tight">{t.spojeniTitulek}</h2>
          <p className="mt-1 max-w-[74ch] text-[13px] text-[var(--wm-text-3)]">{t.spojeniPopis}</p>

          <p className="mt-4 max-w-[74ch] text-[15px] leading-relaxed">{g(spojeni.domeny)}</p>

          <h4 className="mt-5 text-[12px] font-bold uppercase tracking-[0.1em] text-[var(--wm-text-3)]">
            {t.kdeSeZivi}
          </h4>
          <div className="mt-2 flex flex-col gap-3">
            {spojeni.mechanismy.map((m, i) => (
              <p key={i} className="rounded-xl bg-[var(--wm-surface-2)] p-4 text-[14.5px] leading-relaxed">
                {g(m)}
              </p>
            ))}
          </div>

          <p className="mt-5 max-w-[74ch] text-[15px] leading-relaxed">{g(spojeni.souhrn)}</p>

          <p className="mt-4 rounded-xl bg-[var(--wm-surface-2)] p-4 text-[15px] font-medium leading-relaxed">
            {g(spojeni.kdeZacit)}
          </p>
        </section>
      )}

      <section className="mt-6 flex flex-col gap-3 text-[13px] leading-relaxed text-[var(--wm-text-2)]">
        {t.zaverWeb.map((odstavec, i) => (
          <p key={i}>{odstavec}</p>
        ))}
      </section>

      <footer className="mt-10 border-t border-[var(--wm-border-light)] pt-6 text-center text-[12px] text-[var(--wm-text-3)]">
        {UI[lang].confidential}
      </footer>
    </>
  )
}
