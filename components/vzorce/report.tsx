"use client"

import { useMemo } from "react"
import { applyGender } from "@/lib/diagnostic/content"
import type { Gender, PersonInfo } from "@/lib/diagnostic/types"
import { OBSAH } from "@/lib/vzorce/data/obsah"
import { vyhodnot } from "@/lib/vzorce/scoring"
import { NAZVY_DOMEN, NAZVY_PASEM, POCET_POLOZEK, vzorec } from "@/lib/vzorce/structure"
import type { OdpovediMapa, Pasmo, VzorecSkore } from "@/lib/vzorce/types"
import { propoj } from "@/lib/vzorce/vazby"

// Vyhodnocení emocionálně-destruktivních vzorců.
//
// Stavba sleduje zadání: profil všech jedenácti pro orientaci, pak podrobné
// vysvětlení tří nejaktivnějších vzorců a nakonec shrnutí, které je propojuje
// do jednoho obrazu. Vidí ho pouze kouč.

const BARVA_PASMA: Record<Pasmo, string> = {
  "velmi-nizka": "var(--wm-ok-fg, #248a3d)",
  nizka: "var(--wm-ok-fg, #248a3d)",
  stredni: "var(--wm-caution-fg, #c93400)",
  vysoka: "var(--wm-caution-fg, #c93400)",
  dominantni: "var(--wm-invalid-fg, #d70015)",
}

function Pruh({ v }: { v: VzorecSkore }) {
  const barva = BARVA_PASMA[v.pasmo]
  return (
    <div className="py-2.5">
      <div className="mb-1.5 flex items-baseline justify-between gap-3">
        <span className="text-[14px] font-medium">{OBSAH[v.id].nazev}</span>
        <span className="flex items-center gap-2 whitespace-nowrap text-[12.5px]">
          {v.silnychOdpovedi > 0 && (
            <span className="text-[var(--wm-text-3)]">{v.silnychOdpovedi}× 5–6</span>
          )}
          <span className="tabular-nums text-[var(--wm-text-2)]">{v.skore}/60</span>
          <span className="font-semibold" style={{ color: barva }}>
            {NAZVY_PASEM[v.pasmo]}
          </span>
        </span>
      </div>
      <div className="diag-bar-track" style={{ height: 6 }}>
        <div
          className="diag-bar-fill"
          style={{ width: `${Math.max(2, v.procenta)}%`, background: barva }}
        />
      </div>
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
        <div className="mt-5 grid gap-x-8 gap-y-2 border-t border-[var(--wm-border-light)] pt-4 text-[14px] sm:grid-cols-2">
          <div className="flex justify-between gap-4 sm:justify-start">
            <span className="text-[var(--wm-text-3)]">Respondent</span>
            <span className="font-semibold">{person.name || "–"}</span>
          </div>
          <div className="flex justify-between gap-4 sm:justify-start">
            <span className="text-[var(--wm-text-3)]">Datum vyplnění</span>
            <span className="font-semibold">{person.fillDate}</span>
          </div>
          {person.role && (
            <div className="flex justify-between gap-4 sm:justify-start">
              <span className="text-[var(--wm-text-3)]">Role / oblast</span>
              <span className="font-semibold">{person.role}</span>
            </div>
          )}
        </div>
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
        <p className="mt-1 text-[13px] leading-relaxed text-[var(--wm-text-3)]">
          Skóre jednoho vzorce je součet deseti odpovědí, tedy 10 až 60 bodů. Sloupec 5–6 ukazuje,
          kolik jednotlivých tvrzení respondent označil nejvyššími hodnotami; ta jsou významná
          i tehdy, když celkové skóre vysoké není.
        </p>
        <div className="mt-4 divide-y divide-[var(--wm-border-light)]">
          {v.vsechny.map((s) =>
            s.vykazuje ? (
              <Pruh key={s.id} v={s} />
            ) : (
              <div key={s.id} className="flex items-center justify-between gap-3 py-3">
                <span className="text-[14px] font-medium text-[var(--wm-text-3)]">
                  {OBSAH[s.id].nazev}
                </span>
                <span className="text-[12.5px] italic text-[var(--wm-text-3)]">
                  nevykazuje se · {s.zodpovezeno} z {s.celkem} položek
                </span>
              </div>
            ),
          )}
        </div>
      </section>

      {/* tři nejaktivnější */}
      <section className="diag-print-break mt-8">
        <h2 className="mb-1 text-[22px] font-bold tracking-tight">Tři nejaktivnější vzorce</h2>
        <p className="mb-4 text-[13.5px] leading-relaxed text-[var(--wm-text-2)]">
          Tohle jsou vzorce, které se u respondenta aktivují nejsilněji. Nejsou to nálepky ani
          diagnóza. Je to popis mechanismu, který se spouští pod tlakem.
        </p>
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
                  <div className="shrink-0 text-right">
                    <div className="text-[22px] font-bold tabular-nums">{s.skore}</div>
                    <div className="text-[12px] text-[var(--wm-text-3)]">z 60</div>
                  </div>
                </div>

                <p className="mt-4 border-l-2 border-[var(--wm-brand)] pl-4 text-[15px] font-semibold italic">
                  „{g(o.motto)}“
                </p>

                <p className="mt-4 text-[13.5px] font-medium" style={{ color: BARVA_PASMA[s.pasmo] }}>
                  {NAZVY_PASEM[s.pasmo]} · {g(o.pasma[s.pasmo])}
                  {s.silnychOdpovedi > 0 && (
                    <span className="font-normal text-[var(--wm-text-3)]">
                      {" "}
                      Nejvyššími hodnotami označeno {s.silnychOdpovedi} z 10 tvrzení
                      {s.silnePolozky.length > 0 && ` (položky ${s.silnePolozky.join(", ")})`}.
                    </span>
                  )}
                </p>

                <h4 className="mt-5 text-[12px] font-bold uppercase tracking-[0.1em] text-[var(--wm-text-3)]">
                  Jak to vypadá zevnitř
                </h4>
                <p className="mt-1.5 text-[14.5px] leading-relaxed">{g(o.prozitek)}</p>

                <h4 className="mt-4 text-[12px] font-bold uppercase tracking-[0.1em] text-[var(--wm-text-3)]">
                  Co dělá pod tlakem
                </h4>
                <p className="mt-1.5 text-[14.5px] leading-relaxed">{g(o.podTlakem)}</p>

                <h4 className="mt-4 text-[12px] font-bold uppercase tracking-[0.1em] text-[var(--wm-text-3)]">
                  Odkud se to vzalo
                </h4>
                <p className="mt-1.5 text-[14.5px] leading-relaxed text-[var(--wm-text-2)]">
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
          <h2 className="text-[16px] font-bold tracking-tight">Situačně aktivované vzorce</h2>
          <p className="mt-1.5 text-[13.5px] leading-relaxed text-[var(--wm-text-2)]">
            Tyhle vzorce se nedostaly do první trojice, ale mají tři a více tvrzení označených
            nejvyššími hodnotami. To znamená, že se neaktivují trvale, zato v konkrétních situacích
            silně. Stojí za to se na ně v rozhovoru zeptat.
          </p>
          <div className="mt-3 flex flex-col gap-2">
            {v.situacni.map((s) => (
              <div key={s.id} className="flex items-baseline justify-between gap-3 text-[14px]">
                <span className="font-medium">{OBSAH[s.id].nazev}</span>
                <span className="text-[12.5px] text-[var(--wm-text-3)]">
                  {s.skore}/60 · {s.silnychOdpovedi}× 5–6 (položky {s.silnePolozky.join(", ")})
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* propojené shrnutí */}
      {spojeni && (
        <section className="diag-card diag-print-break mt-8 border-2 border-[var(--wm-brand)] p-7">
          <h2 className="text-[20px] font-bold tracking-tight">Jak to funguje dohromady</h2>
          <p className="mt-1 text-[13px] text-[var(--wm-text-3)]">
            Tři vzorce nejsou tři oddělené problémy. Teprve jejich spojení vysvětluje chování,
            kterému člověk sám nerozumí.
          </p>

          <p className="mt-4 text-[15px] leading-relaxed">{g(spojeni.domeny)}</p>

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

          <p className="mt-5 text-[15px] leading-relaxed">{g(spojeni.souhrn)}</p>

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
