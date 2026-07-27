"use client"

import { use, useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { LangToggle } from "@/components/diagnostic/lang-toggle"
import { SCALE_LABELS, TEST_NAMES, UI } from "@/lib/diagnostic/i18n"
import { getItems, itemText } from "@/lib/diagnostic/items"
import { getStructure, parseTestId } from "@/lib/diagnostic/structure"
import { clearSession, loadSession, newSession, saveSession } from "@/lib/diagnostic/storage"
import { isRemoteEnabled, submitToRemote } from "@/lib/diagnostic/remote"
import type { Answer, Lang, StoredSession, TestId } from "@/lib/diagnostic/types"

const BLOCK_SIZE = 20
const LANG_KEY = "wm-diagnostic:lang"

export default function QuestionnairePage({ params }: { params: Promise<{ testId: string }> }) {
  const { testId } = use(params)
  const parsed = parseTestId(testId)
  if (!parsed) return <NotFound />
  return <Questionnaire testId={testId as TestId} />
}

function NotFound() {
  return (
    <div className="diag-container py-24 text-center">
      <p className="text-[17px] text-[var(--wm-text-2)]">404</p>
      <Link href="/" className="mt-4 inline-block text-[15px] font-semibold text-[var(--wm-blue)]">
        Performance Diagnostic ELITE™
      </Link>
    </div>
  )
}

function Questionnaire({ testId }: { testId: TestId }) {
  const router = useRouter()
  const { model, variant } = parseTestId(testId)!
  const structure = useMemo(() => getStructure(model), [model])
  const items = useMemo(() => getItems(testId), [testId])

  const [session, setSession] = useState<StoredSession | null>(null)
  const [stage, setStage] = useState<"intro" | "items">("intro")
  const [block, setBlock] = useState(0)
  const [showMissing, setShowMissing] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const topRef = useRef<HTMLDivElement>(null)

  // načtení / založení session
  useEffect(() => {
    // Jazyk z přímého odkazu (?lang=cs|en) má přednost — odkaz pro klienta
    // tak otevře dotazník rovnou ve správném jazyce.
    const urlLang = new URLSearchParams(window.location.search).get("lang")
    const linkLang: Lang | null = urlLang === "en" ? "en" : urlLang === "cs" ? "cs" : null

    const existing = loadSession(testId)
    if (existing && !existing.finishedAt) {
      setSession(linkLang ? { ...existing, lang: linkLang } : existing)
      return
    }
    const savedLang = window.localStorage.getItem(LANG_KEY)
    const lang: Lang = linkLang ?? (savedLang === "en" ? "en" : "cs")
    setSession(existing ? { ...existing, lang } : newSession(testId, lang))
  }, [testId])

  // autosave
  useEffect(() => {
    if (session) saveSession(session)
  }, [session])

  if (!session) return null

  const lang = session.lang
  const t = UI[lang]
  const scale = SCALE_LABELS[lang]
  const total = structure.itemCount
  const answered = Object.keys(session.answers).length
  const blocks = Math.ceil(total / BLOCK_SIZE)
  const blockItems = items.slice(block * BLOCK_SIZE, (block + 1) * BLOCK_SIZE)
  const missing = items.filter((i) => session.answers[i.id] === undefined).map((i) => i.id)

  const setLang = (l: Lang) => {
    window.localStorage.setItem(LANG_KEY, l)
    setSession({ ...session, lang: l })
  }

  const setAnswer = (id: number, value: Answer) => {
    setSession({ ...session, answers: { ...session.answers, [id]: value } })
  }

  const goToBlock = (b: number) => {
    setBlock(b)
    setShowMissing(false)
    requestAnimationFrame(() => topRef.current?.scrollIntoView({ behavior: "smooth" }))
  }

  const startItems = () => {
    // pokračuj od bloku s první nezodpovězenou položkou
    const first = missing.length > 0 ? missing[0] : 1
    setStage("items")
    goToBlock(Math.floor((first - 1) / BLOCK_SIZE))
  }

  const finish = async () => {
    if (missing.length > 0) {
      setShowMissing(true)
      return
    }
    const done: StoredSession = { ...session, finishedAt: new Date().toISOString() }
    saveSession(done)

    // Uložení do Convexu (pokud je nakonfigurován) → sdílecí odkaz.
    if (isRemoteEnabled()) {
      setSubmitting(true)
      const publicId = await submitToRemote(done)
      setSubmitting(false)
      if (publicId) {
        router.push(`/${testId}/report?r=${publicId}`)
        return
      }
    }
    // Fallback: report z lokálního uložení.
    router.push(`/${testId}/report`)
  }

  return (
    <div ref={topRef}>
      {/* horní lišta */}
      <div className="sticky top-0 z-10 border-b border-[var(--wm-border-light)] bg-[rgba(242,242,247,0.85)] backdrop-blur-xl">
        <div className="diag-container flex h-14 items-center justify-between gap-4">
          {/* Značka záměrně není odkaz — klient s přímým odkazem má vidět
              pouze svůj test, ne nabídku ostatních diagnostik. */}
          <span className="text-[12px] font-bold tracking-[0.18em] text-[var(--wm-text)]">{t.brand}</span>
          <div className="flex min-w-0 flex-1 items-center justify-center px-2">
            {stage === "items" && (
              <div className="w-full max-w-xs">
                <div className="mb-1 text-center text-[11px] font-medium text-[var(--wm-text-3)]">
                  {t.progressAnswered(answered, total)}
                </div>
                <div className="diag-bar-track" style={{ height: 4 }}>
                  <div
                    className="diag-bar-fill"
                    style={{ width: `${(answered / total) * 100}%`, background: "var(--wm-brand)" }}
                  />
                </div>
              </div>
            )}
          </div>
          <LangToggle lang={lang} onChange={setLang} />
        </div>
      </div>

      <div className="diag-container pb-24 pt-8">
        <h1 className="text-[22px] font-bold tracking-tight">{TEST_NAMES[testId][lang]}</h1>

        {stage === "intro" && (
          <div className="mt-6 flex flex-col gap-5">
            {/* identifikace */}
            <section className="diag-card p-6">
              <h2 className="mb-4 text-[16px] font-semibold">{t.identityTitle}</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1.5 block text-[13px] font-medium text-[var(--wm-text-2)]">{t.nameLabel} *</span>
                  <input
                    className="diag-input"
                    value={session.person.name}
                    placeholder={t.namePlaceholder}
                    onChange={(e) => setSession({ ...session, person: { ...session.person, name: e.target.value } })}
                  />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-[13px] font-medium text-[var(--wm-text-2)]">{t.birthLabel}</span>
                  <input
                    type="date"
                    className="diag-input"
                    value={session.person.birthDate ?? ""}
                    onChange={(e) =>
                      setSession({ ...session, person: { ...session.person, birthDate: e.target.value } })
                    }
                  />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-[13px] font-medium text-[var(--wm-text-2)]">
                    {variant === "sport" ? t.roleLabelSport : t.roleLabelBusiness}
                  </span>
                  <input
                    className="diag-input"
                    value={session.person.role ?? ""}
                    placeholder={variant === "sport" ? t.rolePlaceholderSport : t.rolePlaceholderBusiness}
                    onChange={(e) => setSession({ ...session, person: { ...session.person, role: e.target.value } })}
                  />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-[13px] font-medium text-[var(--wm-text-2)]">{t.dateLabel}</span>
                  <input
                    type="date"
                    className="diag-input"
                    value={session.person.fillDate}
                    onChange={(e) =>
                      setSession({ ...session, person: { ...session.person, fillDate: e.target.value } })
                    }
                  />
                </label>
              </div>
            </section>

            {/* instrukce */}
            <section className="diag-card p-6">
              <h2 className="mb-4 text-[16px] font-semibold">{t.howToTitle}</h2>
              <ol className="flex flex-col gap-3">
                {t.howTo.map((line, i) => (
                  <li key={i} className="flex gap-3 text-[14px] leading-relaxed text-[var(--wm-text-2)]">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--wm-fill-4)] text-[11px] font-bold text-[var(--wm-text)]">
                      {i + 1}
                    </span>
                    {line}
                  </li>
                ))}
              </ol>
              <div className="mt-5 grid grid-cols-1 gap-2 rounded-xl bg-[var(--wm-surface-2)] p-4 sm:grid-cols-5">
                {([1, 2, 3, 4, 5] as Answer[]).map((v) => (
                  <div key={v} className="flex items-center gap-2 text-[12px] text-[var(--wm-text-2)] sm:flex-col sm:text-center">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[var(--wm-border)] text-[12px] font-semibold text-[var(--wm-text)]">
                      {v}
                    </span>
                    {scale[v]}
                  </div>
                ))}
              </div>
            </section>

            <button
              type="button"
              disabled={session.person.name.trim().length === 0}
              onClick={startItems}
              className="mx-auto inline-flex h-12 items-center justify-center rounded-full bg-[var(--wm-brand)] px-10 text-[16px] font-semibold text-white transition-opacity hover:opacity-85 disabled:opacity-35"
            >
              {answered > 0 ? t.continueTest : t.beginButton}
            </button>
          </div>
        )}

        {stage === "items" && (
          <div className="mt-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-[13px] font-semibold uppercase tracking-[0.1em] text-[var(--wm-text-3)]">
                {t.blockLabel(block * BLOCK_SIZE + 1, Math.min((block + 1) * BLOCK_SIZE, total))}
              </h2>
              <span className="text-[12px] text-[var(--wm-text-3)]">{t.autosaveNote}</span>
            </div>

            <div className="flex flex-col gap-3">
              {blockItems.map((item) => {
                const value = session.answers[item.id]
                const missed = showMissing && value === undefined
                return (
                  <div
                    key={item.id}
                    id={`item-${item.id}`}
                    className="diag-card p-5"
                    style={missed ? { borderColor: "var(--wm-red)" } : undefined}
                  >
                    <p className="text-[15px] leading-relaxed">
                      <span className="mr-2 font-semibold text-[var(--wm-text-3)]">{item.id}</span>
                      {itemText(item, lang)}
                    </p>
                    <div className="mt-4 flex items-center justify-between gap-2">
                      <span className="hidden w-24 text-[11px] leading-tight text-[var(--wm-text-3)] sm:block">
                        {scale[1]}
                      </span>
                      <div className="flex flex-1 items-center justify-center gap-2 sm:gap-3">
                        {([1, 2, 3, 4, 5] as Answer[]).map((v) => (
                          <button
                            key={v}
                            type="button"
                            className="diag-scale-btn"
                            data-selected={value === v}
                            aria-pressed={value === v}
                            aria-label={`${v} — ${scale[v]}`}
                            title={scale[v]}
                            onClick={() => setAnswer(item.id, v)}
                          >
                            {v}
                          </button>
                        ))}
                      </div>
                      <span className="hidden w-24 text-right text-[11px] leading-tight text-[var(--wm-text-3)] sm:block">
                        {scale[5]}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>

            {showMissing && missing.length > 0 && (
              <div className="mt-5 rounded-2xl border border-[var(--wm-red)] bg-[var(--wm-red-light)] p-4 text-[14px]">
                <p className="font-medium text-[var(--wm-red)]">{t.missingAnswers(missing.length)}</p>
                <button
                  type="button"
                  className="mt-1 font-semibold text-[var(--wm-blue)]"
                  onClick={() => {
                    const b = Math.floor((missing[0] - 1) / BLOCK_SIZE)
                    goToBlock(b)
                    setShowMissing(true)
                    requestAnimationFrame(() =>
                      document.getElementById(`item-${missing[0]}`)?.scrollIntoView({ behavior: "smooth", block: "center" }),
                    )
                  }}
                >
                  {t.jumpToFirstMissing}
                </button>
              </div>
            )}

            <div className="mt-8 flex items-center justify-between">
              <button
                type="button"
                onClick={() => (block === 0 ? setStage("intro") : goToBlock(block - 1))}
                className="inline-flex h-11 items-center rounded-full border border-[var(--wm-border)] bg-white px-6 text-[15px] font-semibold text-[var(--wm-text)] transition-colors hover:bg-[var(--wm-fill-4)]"
              >
                {t.back}
              </button>
              {block < blocks - 1 ? (
                <button
                  type="button"
                  onClick={() => goToBlock(block + 1)}
                  className="inline-flex h-11 items-center rounded-full bg-[var(--wm-brand)] px-8 text-[15px] font-semibold text-white transition-opacity hover:opacity-85"
                >
                  {t.next}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={finish}
                  disabled={submitting}
                  className="inline-flex h-11 items-center rounded-full bg-[var(--wm-blue)] px-8 text-[15px] font-semibold text-white transition-opacity hover:opacity-85 disabled:opacity-50"
                >
                  {submitting ? "…" : t.finish}
                </button>
              )}
            </div>
          </div>
        )}

        <footer className="mt-14 border-t border-[var(--wm-border-light)] pt-6 text-center text-[12px] text-[var(--wm-text-3)]">
          {t.confidential}
        </footer>
      </div>
    </div>
  )
}
