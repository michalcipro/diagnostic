"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { LangToggle } from "@/components/diagnostic/lang-toggle"
import { TEST_NAMES, UI, VARIANT_LABELS } from "@/lib/diagnostic/i18n"
import { loadSession } from "@/lib/diagnostic/storage"
import type { Lang, TestId, Variant } from "@/lib/diagnostic/types"

const LANG_KEY = "wm-diagnostic:lang"

interface CardDef {
  testId: TestId
  variant: Variant
  items: number
}

const CARDS: CardDef[] = [
  { testId: "elite200-sport", variant: "sport", items: 200 },
  { testId: "elite100-sport", variant: "sport", items: 100 },
  { testId: "elite200-business", variant: "business", items: 200 },
  { testId: "elite100-business", variant: "business", items: 100 },
]

export default function DiagnosticHome() {
  const [lang, setLang] = useState<Lang>("cs")
  const [inProgress, setInProgress] = useState<Record<string, boolean>>({})

  useEffect(() => {
    const saved = window.localStorage.getItem(LANG_KEY)
    if (saved === "en" || saved === "cs") setLang(saved)
    const progress: Record<string, boolean> = {}
    for (const c of CARDS) {
      const s = loadSession(c.testId)
      progress[c.testId] = !!s && Object.keys(s.answers).length > 0 && !s.finishedAt
    }
    setInProgress(progress)
  }, [])

  const changeLang = (l: Lang) => {
    setLang(l)
    window.localStorage.setItem(LANG_KEY, l)
  }

  const t = UI[lang]

  return (
    <div className="diag-container pb-20 pt-10">
      <header className="mb-10 flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <span className="text-[13px] font-bold tracking-[0.18em] text-[var(--wm-text)]">{t.brand}</span>
          <LangToggle lang={lang} onChange={changeLang} />
        </div>
        <div>
          <h1 className="text-[34px] font-bold leading-tight tracking-tight">{t.chooseTitle}</h1>
          <p className="mt-2 max-w-xl text-[17px] leading-relaxed text-[var(--wm-text-2)]">{t.chooseSubtitle}</p>
        </div>
      </header>

      {(["sport", "business"] as Variant[]).map((variant) => (
        <section key={variant} className="mb-10">
          <h2 className="mb-4 text-[13px] font-semibold uppercase tracking-[0.1em] text-[var(--wm-text-3)]">
            {VARIANT_LABELS[variant][lang]}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {CARDS.filter((c) => c.variant === variant).map((c) => (
              <div key={c.testId} className="diag-card flex flex-col p-6">
                <h3 className="text-[19px] font-semibold leading-snug tracking-tight">
                  {TEST_NAMES[c.testId][lang]}
                </h3>
                <p className="mt-2 text-[14px] leading-relaxed text-[var(--wm-text-2)]">
                  {c.items === 200 ? t.facets200 : t.dims100}
                </p>
                <p className="mt-1 text-[13px] text-[var(--wm-text-3)]">
                  {t.itemsCount(c.items)} · {c.items === 200 ? t.duration200 : t.duration100}
                </p>
                <div className="mt-5 flex-1" />
                <Link
                  href={`/${c.testId}`}
                  className="inline-flex h-11 items-center justify-center rounded-full bg-[var(--wm-brand)] px-6 text-[15px] font-semibold text-white transition-opacity hover:opacity-85"
                >
                  {inProgress[c.testId] ? t.continueTest : t.start}
                </Link>
              </div>
            ))}
          </div>
        </section>
      ))}

      <footer className="mt-14 border-t border-[var(--wm-border-light)] pt-6 text-center text-[12px] text-[var(--wm-text-3)]">
        {t.confidential}
      </footer>
    </div>
  )
}
