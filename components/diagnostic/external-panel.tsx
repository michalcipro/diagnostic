"use client"

import { useState } from "react"
import { TEST_NAMES } from "@/lib/diagnostic/i18n"
import type { ExternalUsage, PocetTestu } from "@/lib/diagnostic/remote"
import type { Lang, TestId } from "@/lib/diagnostic/types"

// Vytížení koučů. Vidí ho pouze master.
//
// Jsou tu všichni kouči kromě mastera, externí i naši. Panel NEZOBRAZUJE
// žádný osobní údaj: jen typ testu, datum a úplnost. U externího kouče je to
// nutnost, protože do jeho větve klientů nevidíme; u našeho proto, že na
// podklad k fakturaci nic víc není potřeba a klienty má master jinde.

const MESICE_CS = [
  "leden",
  "únor",
  "březen",
  "duben",
  "květen",
  "červen",
  "červenec",
  "srpen",
  "září",
  "říjen",
  "listopad",
  "prosinec",
]

/** „2026-07" na „červenec 2026". */
function mesicSlovy(mesic: string, lang: Lang): string {
  const m = /^(\d{4})-(\d{2})$/.exec(mesic)
  if (!m) return mesic
  if (lang === "en") return `${mesic}`
  return `${MESICE_CS[Number(m[2]) - 1]} ${m[1]}`
}

function datumCasem(ms: number, lang: Lang): string {
  const d = new Date(ms)
  const den = `${d.getDate()}. ${d.getMonth() + 1}. ${d.getFullYear()}`
  const cas = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`
  return lang === "en" ? d.toISOString().slice(0, 16).replace("T", " ") : `${den} ${cas}`
}

/** Český tvar podle počtu: 1 test, 2 až 4 testy, 5 a víc testů. */
function pocetTestu(n: number): string {
  if (n === 1) return "test"
  if (n >= 2 && n <= 4) return "testy"
  return "testů"
}

function nazevTestu(testId: string, lang: Lang): string {
  return TEST_NAMES[testId as TestId]?.[lang] ?? testId
}

/** Počty po testech jako štítky. */
function StitkyTestu({ polozky, lang }: { polozky: PocetTestu[]; lang: Lang }) {
  return (
    <div className="flex flex-wrap gap-2">
      {polozky.map((p) => (
        <span
          key={p.testId}
          className="inline-flex items-center gap-2 rounded-full bg-[var(--wm-track)] px-3 py-1 text-[12.5px] text-[var(--wm-text-2)]"
        >
          {nazevTestu(p.testId, lang)}
          <span className="font-bold tabular-nums text-[var(--wm-text)]">{p.pocet}</span>
        </span>
      ))}
    </div>
  )
}

function Vetev({ u, lang }: { u: ExternalUsage; lang: Lang }) {
  const [rozbaleno, setRozbaleno] = useState(false)

  return (
    <article className="diag-card p-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="flex flex-wrap items-center gap-2 text-[17px] font-bold tracking-tight">
            {u.name}
            <span className="rounded-full bg-[var(--wm-track)] px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-[var(--wm-text-2)]">
              {u.role === "external" ? "externí" : "náš kouč"}
            </span>
            {!u.active && (
              <span className="rounded-full bg-[var(--wm-red-light)] px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-[var(--wm-invalid-fg)]">
                zablokován
              </span>
            )}
          </h3>
          <p className="mt-0.5 text-[13px] text-[var(--wm-text-2)]">{u.email}</p>
        </div>
        <div className="text-right">
          <div className="text-[28px] font-bold leading-none tabular-nums">{u.celkem}</div>
          <div className="mt-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--wm-text-3)]">
            {pocetTestu(u.celkem)} celkem
          </div>
        </div>
      </header>

      {u.note && (
        <p className="mt-4 rounded-xl bg-[var(--wm-surface-2)] p-4 text-[13.5px] leading-relaxed text-[var(--wm-text-2)]">
          {u.note}
        </p>
      )}

      {u.celkem === 0 ? (
        <p className="mt-5 text-[13.5px] text-[var(--wm-text-3)]">
          Zatím žádné vyplnění. Až jeho klienti začnou vyplňovat, objeví se tu počty i data.
        </p>
      ) : (
        <>
          <div className="mt-5">
            <StitkyTestu polozky={u.podleTestu} lang={lang} />
          </div>

          <h4 className="mt-6 text-[11px] font-bold uppercase tracking-[0.1em] text-[var(--wm-text-3)]">
            Po měsících
          </h4>
          <div className="mt-2 flex flex-col divide-y divide-[var(--wm-border-light)] border-t border-[var(--wm-border-light)]">
            {u.podleMesice.map((m) => (
              <div key={m.mesic} className="flex flex-wrap items-baseline gap-x-4 gap-y-1.5 py-3">
                <span className="w-[8.5rem] shrink-0 text-[14px] font-semibold">
                  {mesicSlovy(m.mesic, lang)}
                </span>
                <span className="w-10 shrink-0 text-[15px] font-bold tabular-nums">{m.pocet}</span>
                <span className="min-w-0 flex-1 text-[12.5px] text-[var(--wm-text-3)]">
                  {m.podleTestu.map((p) => `${nazevTestu(p.testId, lang)} ${p.pocet}×`).join(" · ")}
                </span>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setRozbaleno((r) => !r)}
            className="mt-4 text-[13.5px] font-semibold text-[var(--wm-blue)] hover:underline"
          >
            {rozbaleno ? "Skrýt jednotlivá vyplnění" : `Zobrazit jednotlivá vyplnění (${u.celkem})`}
          </button>

          {rozbaleno && (
            <div className="mt-3 flex flex-col divide-y divide-[var(--wm-border-light)] border-t border-[var(--wm-border-light)]">
              {u.zaznamy.map((z, i) => (
                <div
                  key={`${z.createdAt}-${i}`}
                  className="flex flex-wrap items-baseline gap-x-4 gap-y-1 py-2.5"
                >
                  <span className="w-[9.5rem] shrink-0 text-[13.5px] tabular-nums">
                    {datumCasem(z.createdAt, lang)}
                  </span>
                  <span className="min-w-0 flex-1 text-[13.5px] text-[var(--wm-text-2)]">
                    {nazevTestu(z.testId, lang)}
                  </span>
                  {!z.complete && (
                    <span className="shrink-0 text-[12px] text-[var(--wm-caution-fg)]">
                      neúplné ({z.answeredCount})
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </article>
  )
}

export function ExternalPanel({ data, lang }: { data: ExternalUsage[] | null; lang: Lang }) {
  if (data === null) {
    return <p className="text-[14px] text-[var(--wm-text-3)]">Načítám…</p>
  }
  if (!data.length) {
    return (
      <div className="diag-card p-6">
        <h2 className="text-[16px] font-bold tracking-tight">Zatím žádný další kouč</h2>
        <p className="mt-2 max-w-[68ch] text-[13.5px] leading-relaxed text-[var(--wm-text-2)]">
          Kouče přidáš v záložce Kouči. Jakmile začnou vystavovat pozvánky, objeví se tady počty
          testů, jejich typ a data, aby šlo vystavit fakturu. Osobní údaje jejich klientů tudy
          neprocházejí. Externí kouč navíc dostane vlastní větev klientů: uvidí jen to, co sám
          založí, a do našich klientů nevidí, stejně jako my do jeho.
        </p>
      </div>
    )
  }

  const celkem = data.reduce((a, b) => a + b.celkem, 0)

  return (
    <div className="flex flex-col gap-5">
      <p className="max-w-[74ch] text-[13.5px] leading-relaxed text-[var(--wm-text-2)]">
        Podklad pro fakturaci. Osobní údaje klientů externích koučů se sem záměrně nepřenášejí,
        vidíš jen typ testu, datum a úplnost. Všechna tahle vyplnění přitom stavějí naše normy.
        Celkem je to {celkem} {pocetTestu(celkem)}.
      </p>
      {data.map((u) => (
        <Vetev key={u.coachId} u={u} lang={lang} />
      ))}
    </div>
  )
}
