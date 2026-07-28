"use client"

import { useMemo } from "react"
import { applyGender } from "@/lib/diagnostic/content"
import type { Gender, PersonInfo } from "@/lib/diagnostic/types"
import { OBSAH } from "@/lib/vzorce/data/obsah"
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

/** Datum v českém tvaru. Vstup je ISO, ať se dá řadit. */
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
  durationSec,
}: {
  person: PersonInfo
  answers: OdpovediMapa
  durationSec?: number
}) {
  const gender: Gender = person.gender ?? "male"
  const v = useMemo(() => vyhodnot(answers, durationSec), [answers, durationSec])
  const spojeni = useMemo(() => propoj(v), [v])
  const g = (t: string) => applyGender(t, gender)

  return (
    <>
      <header className="diag-card p-7">
        <p className="text-[12px] font-bold tracking-[0.18em] text-[var(--wm-text-3)]">WINNING MINDS</p>
        <h1 className="mt-2 text-[28px] font-bold leading-tight tracking-tight">
          Emocionálně-destruktivní vzorce · Vyhodnocení
        </h1>
        <p className="mt-1 text-[15px] text-[var(--wm-text-2)]">
          Diagnostický profil automatických emočních reakcí, vztahových strategií a výkonových bloků
        </p>
        <dl className="mt-6 grid gap-x-8 gap-y-4 border-t border-[var(--wm-border-light)] pt-5 sm:grid-cols-3">
          <Udaj popis="Respondent" hodnota={person.name || "–"} />
          <Udaj popis="Role / oblast" hodnota={person.role || "–"} />
          <Udaj popis="Datum vyplnění" hodnota={datum(person.fillDate)} />
        </dl>
      </header>

      {!v.kompletni && (
        <div className="mt-4 rounded-2xl border border-[var(--wm-orange)] bg-[var(--wm-orange-light)] p-4 text-[14px] text-[var(--wm-caution-fg)]">
          <p className="font-medium">
            Dotazník není kompletní ({v.zodpovezeno} ze {POCET_POLOZEK}).
          </p>
          <p className="mt-1.5 text-[13px] leading-relaxed opacity-90">
            U vzorců s chybějícími odpověďmi je skóre dopočítané z průměru zodpovězených položek.
            Vzorce, kde chybí víc než pětina odpovědí, se do pořadí nezařazují.
          </p>
        </div>
      )}

      {/* profil všech jedenácti */}
      <section className="diag-card mt-5 p-7">
        <h2 className="text-[18px] font-bold tracking-tight">Profil všech vzorců</h2>
        <p className="mt-1 mb-5 max-w-2xl text-[13px] leading-relaxed text-[var(--wm-text-3)]">
          Skóre jednoho vzorce je součet deseti odpovědí, tedy 10 až 60 bodů. Pásmo se čte z polohy
          na ose, ne z barvy. Číslo v kolečku ukazuje, kolik tvrzení respondent označil hodnotou
          5 nebo 6; ta jsou významná i tehdy, když celkové skóre vysoké není.
        </p>
        <ProfilGraf vsechny={v.vsechny} top3={v.top3} />
      </section>

      {/* zatížení oblastí */}
      <section className="diag-card mt-5 p-7">
        <h2 className="text-[18px] font-bold tracking-tight">Zatížení oblastí</h2>
        <p className="mt-1 mb-5 max-w-2xl text-[13px] leading-relaxed text-[var(--wm-text-3)]">
          Tentýž profil po oblastech, ze kterých vzorce pocházejí. Když je zatížená jedna oblast,
          nejde o několik problémů, ale o jedno téma ve více podobách.
        </p>
        <DomenyGraf vsechny={v.vsechny} />
      </section>

      {/* tři nejaktivnější */}
      <section className="diag-print-break mt-8">
        <h2 className="mb-1 text-[22px] font-bold tracking-tight">Tři nejaktivnější vzorce</h2>
        <p className="mb-5 max-w-[74ch] text-[13.5px] leading-relaxed text-[var(--wm-text-2)]">
          Tohle jsou vzorce, které se u respondenta aktivují nejsilněji. Nejsou to nálepky ani
          diagnóza. Je to popis mechanismu, který se spouští pod tlakem.
        </p>

        <div className="diag-card mb-5 px-7 py-8">
          <TrojicePrstencu top3={v.top3} />
        </div>

        <div className="flex flex-col gap-5">
          {v.top3.map((s, i) => {
            const o = OBSAH[s.id]
            const d = vzorec(s.id).domena
            return (
              <article key={s.id} className="diag-card p-7">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="text-[12px] font-bold uppercase tracking-[0.12em] text-[var(--wm-text-3)]">
                      {i + 1}. místo · {NAZVY_DOMEN[d]}
                    </p>
                    <h3 className="mt-1 text-[20px] font-bold tracking-tight">{o.nazev}</h3>
                    <p className="mt-1 text-[13px] text-[var(--wm-text-2)]">{o.tema}</p>
                  </div>
                  <div className="flex w-[76px] shrink-0 flex-col items-center rounded-2xl bg-[var(--wm-track)] px-2 py-3">
                    <span className="text-[26px] font-bold leading-none tracking-tight tabular-nums">
                      {s.skore}
                    </span>
                    <span className="mt-1.5 text-[11px] leading-none text-[var(--wm-text-3)]">
                      z 60
                    </span>
                  </div>
                </div>

                <p className="mt-4 max-w-[74ch] border-l-2 border-[var(--wm-brand)] pl-4 text-[15px] font-semibold italic">
                  „{g(o.motto)}“
                </p>

                <div className="mt-4 rounded-xl bg-[var(--wm-surface-2)] p-4">
                  <p className="text-[13.5px] leading-relaxed">
                    <span className="font-semibold">{NAZVY_PASEM[s.pasmo]}</span>{" "}
                    {g(o.pasma[s.pasmo])}
                  </p>
                  {s.silnychOdpovedi > 0 && (
                    <p className="mt-1.5 text-[12.5px] leading-relaxed text-[var(--wm-text-3)]">
                      Hodnotou 5 nebo 6 označeno {s.silnychOdpovedi} z 10 tvrzení
                      {s.silnePolozky.length > 0 && `, konkrétně ${s.silnePolozky.join(", ")}`}.
                    </p>
                  )}
                </div>

                <h4 className="mt-5 text-[12px] font-bold uppercase tracking-[0.1em] text-[var(--wm-text-3)]">
                  Jak to vypadá zevnitř
                </h4>
                <p className="mt-1.5 max-w-[74ch] text-[14.5px] leading-relaxed">{g(o.prozitek)}</p>

                <h4 className="mt-4 text-[12px] font-bold uppercase tracking-[0.1em] text-[var(--wm-text-3)]">
                  Co dělá pod tlakem
                </h4>
                <p className="mt-1.5 max-w-[74ch] text-[14.5px] leading-relaxed">{g(o.podTlakem)}</p>

                <h4 className="mt-4 text-[12px] font-bold uppercase tracking-[0.1em] text-[var(--wm-text-3)]">
                  Odkud se to vzalo
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
          <h2 className="text-[18px] font-bold tracking-tight">Situačně aktivované vzorce</h2>
          <p className="mt-1.5 max-w-[74ch] text-[13.5px] leading-relaxed text-[var(--wm-text-2)]">
            Tyhle vzorce se nedostaly do první trojice, ale mají tři a více tvrzení označených
            nejvyššími hodnotami. To znamená, že se neaktivují trvale, zato v konkrétních situacích
            silně. Stojí za to se na ně v rozhovoru zeptat.
          </p>
          <div className="mt-4 flex flex-col divide-y divide-[var(--wm-border-light)] border-t border-[var(--wm-border-light)]">
            {v.situacni.map((s) => (
              <div
                key={s.id}
                className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-4 gap-y-1 py-2.5 md:grid-cols-[14rem_3.25rem_minmax(0,1fr)]"
              >
                <span className="truncate text-[14px] font-medium" title={OBSAH[s.id].nazev}>
                  {OBSAH[s.id].nazev}
                </span>
                <span className="text-right text-[14px] font-semibold tabular-nums">
                  {s.skore}
                  <span className="font-normal text-[var(--wm-text-3)]">/60</span>
                </span>
                <span className="col-span-2 text-[12.5px] leading-relaxed text-[var(--wm-text-3)] md:col-span-1">
                  {s.silnychOdpovedi}× hodnota 5 nebo 6 · položky {s.silnePolozky.join(", ")}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* propojené shrnutí */}
      {spojeni && (
        <section className="diag-card diag-print-break mt-8 border-2 border-[var(--wm-brand)] p-7">
          <h2 className="text-[22px] font-bold tracking-tight">Jak to funguje dohromady</h2>
          <p className="mt-1 max-w-[74ch] text-[13px] text-[var(--wm-text-3)]">
            Tři vzorce nejsou tři oddělené problémy. Teprve jejich spojení vysvětluje chování,
            kterému člověk sám nerozumí.
          </p>

          <p className="mt-4 max-w-[74ch] text-[15px] leading-relaxed">{g(spojeni.domeny)}</p>

          <h4 className="mt-5 text-[12px] font-bold uppercase tracking-[0.1em] text-[var(--wm-text-3)]">
            Kde se navzájem živí
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
        <p>
          Tento profil není nálepka ani diagnóza. Je to mapa. Smyslem není člověka ve vzorci
          zafixovat, ale pojmenovat mechanismus, který se aktivuje pod tlakem, a vytvořit prostor
          pro přesnější práci.
        </p>
        <p>
          Výsledek nenahrazuje psychologické ani lékařské vyšetření. Slouží jako podklad pro
          rozhovor s koučem.
        </p>
      </section>

      <footer className="mt-10 border-t border-[var(--wm-border-light)] pt-6 text-center text-[12px] text-[var(--wm-text-3)]">
        Winning Minds s.r.o. · Praha 6 · winningminds.cz · Důvěrný dokument
      </footer>
    </>
  )
}
