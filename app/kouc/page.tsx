"use client"

import { useCallback, useEffect, useState } from "react"
import { LangToggle } from "@/components/diagnostic/lang-toggle"
import { ReportView } from "@/components/diagnostic/report-view"
import { TEST_NAMES, UI } from "@/lib/diagnostic/i18n"
import { getStructure, parseTestId } from "@/lib/diagnostic/structure"
import {
  checkCoachPassword,
  getResult,
  isRemoteEnabled,
  listResults,
  removeResult,
  type ResultDetail,
  type ResultSummary,
} from "@/lib/diagnostic/remote"
import type { Lang } from "@/lib/diagnostic/types"

// Chráněná sekce pro kouče. Heslo se ověřuje na serveru (Convex) — v prohlížeči
// se drží jen po dobu relace, aby se nemuselo psát u každého kliknutí.

const PWD_KEY = "wm-diagnostic:coach"
const LANG_KEY = "wm-diagnostic:lang"

export default function CoachPage() {
  const [lang, setLang] = useState<Lang>("cs")
  const [password, setPassword] = useState("")
  const [authed, setAuthed] = useState(false)
  const [checking, setChecking] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [rows, setRows] = useState<ResultSummary[] | null>(null)
  const [detail, setDetail] = useState<ResultDetail | null>(null)
  const [detailLang, setDetailLang] = useState<Lang>("cs")

  const t = UI[lang]

  const load = useCallback(async (pwd: string) => {
    try {
      const list = await listResults(pwd)
      setRows(list)
    } catch (e) {
      setRows([])
      setError(String(e))
    }
  }, [])

  useEffect(() => {
    const savedLang = window.localStorage.getItem(LANG_KEY)
    if (savedLang === "en" || savedLang === "cs") setLang(savedLang)
    const saved = window.sessionStorage.getItem(PWD_KEY)
    if (saved) {
      setPassword(saved)
      setAuthed(true)
      void load(saved)
    }
  }, [load])

  const signIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!isRemoteEnabled()) {
      setError(t.coachNotConfigured)
      return
    }
    setChecking(true)
    try {
      const ok = await checkCoachPassword(password)
      if (!ok) {
        setError(t.coachWrongPassword)
        return
      }
      window.sessionStorage.setItem(PWD_KEY, password)
      setAuthed(true)
      await load(password)
    } catch {
      setError(t.coachNotConfigured)
    } finally {
      setChecking(false)
    }
  }

  const signOut = () => {
    window.sessionStorage.removeItem(PWD_KEY)
    setAuthed(false)
    setPassword("")
    setRows(null)
    setDetail(null)
  }

  const open = async (id: string) => {
    const d = await getResult(password, id)
    if (d) {
      setDetail(d)
      setDetailLang(d.lang)
      window.scrollTo({ top: 0 })
    }
  }

  const remove = async (id: string) => {
    if (!window.confirm(t.coachDeleteConfirm)) return
    await removeResult(password, id)
    await load(password)
  }

  // ---------- přihlášení ----------
  if (!authed) {
    return (
      <div className="diag-container flex min-h-screen flex-col items-center justify-center pb-20">
        <form onSubmit={signIn} className="diag-card w-full max-w-sm p-7">
          <p className="text-[12px] font-bold tracking-[0.18em] text-[var(--wm-text-3)]">{t.brand}</p>
          <h1 className="mt-2 text-[22px] font-bold tracking-tight">{t.coachTitle}</h1>
          <p className="mt-1 text-[14px] text-[var(--wm-text-2)]">{t.coachSubtitle}</p>
          <label className="mt-6 block">
            <span className="mb-1.5 block text-[13px] font-medium text-[var(--wm-text-2)]">{t.coachPassword}</span>
            <input
              type="password"
              autoFocus
              className="diag-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          {error && <p className="mt-3 text-[13px] font-medium text-[var(--wm-invalid-fg)]">{error}</p>}
          <button
            type="submit"
            disabled={checking || password.length === 0}
            className="mt-5 inline-flex h-11 w-full items-center justify-center rounded-full bg-[var(--wm-brand)] text-[15px] font-semibold text-[var(--wm-brand-fg)] transition-opacity hover:opacity-85 disabled:opacity-40"
          >
            {checking ? "…" : t.coachEnter}
          </button>
        </form>
        <p className="mt-6 text-center text-[12px] text-[var(--wm-text-3)]">{t.confidential}</p>
      </div>
    )
  }

  // ---------- detail vyhodnocení ----------
  if (detail) {
    return (
      <div className="diag-container pb-20 pt-8">
        <div className="diag-no-print mb-6 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setDetail(null)}
            className="inline-flex h-9 items-center rounded-full border border-[var(--wm-border)] bg-[var(--wm-surface)] px-4 text-[13px] font-semibold text-[var(--wm-text)] transition-colors hover:bg-[var(--wm-fill-4)]"
          >
            ← {t.coachBack}
          </button>
          <div className="flex items-center gap-2">
            <LangToggle lang={detailLang} onChange={setDetailLang} />
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex h-9 items-center rounded-full bg-[var(--wm-brand)] px-4 text-[13px] font-semibold text-[var(--wm-brand-fg)] transition-opacity hover:opacity-85"
            >
              {t.printButton}
            </button>
          </div>
        </div>
        <ReportView
          testId={detail.testId}
          person={detail.person}
          answers={detail.answers}
          lang={detailLang}
        />
      </div>
    )
  }

  // ---------- seznam ----------
  return (
    <div className="diag-container pb-20 pt-10">
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-[12px] font-bold tracking-[0.18em] text-[var(--wm-text-3)]">{t.brand}</p>
          <h1 className="mt-1 text-[28px] font-bold tracking-tight">{t.coachTitle}</h1>
          {rows && <p className="mt-1 text-[14px] text-[var(--wm-text-2)]">{t.coachCount(rows.length)}</p>}
        </div>
        <div className="flex items-center gap-2">
          <LangToggle lang={lang} onChange={setLang} />
          <button
            type="button"
            onClick={signOut}
            className="inline-flex h-9 items-center rounded-full border border-[var(--wm-border)] bg-[var(--wm-surface)] px-4 text-[13px] font-semibold text-[var(--wm-text)] transition-colors hover:bg-[var(--wm-fill-4)]"
          >
            {t.coachLogout}
          </button>
        </div>
      </header>

      {error && (
        <p className="mb-4 rounded-2xl bg-[var(--wm-red-light)] p-4 text-[14px] font-medium text-[var(--wm-invalid-fg)]">
          {error}
        </p>
      )}

      {rows === null ? (
        <p className="text-[15px] text-[var(--wm-text-2)]">{t.coachLoading}</p>
      ) : rows.length === 0 ? (
        <div className="diag-card p-8 text-center">
          <p className="text-[15px] text-[var(--wm-text-2)]">{t.coachEmpty}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {rows.map((r) => {
            const structure = getStructure(parseTestId(r.testId)!.model)
            return (
              <article key={r.id} className="diag-card flex flex-wrap items-center gap-4 p-5">
                <div className="min-w-[180px] flex-1">
                  <h2 className="text-[17px] font-semibold tracking-tight">{r.personName || "—"}</h2>
                  <p className="mt-0.5 text-[13px] text-[var(--wm-text-2)]">
                    {TEST_NAMES[r.testId][lang]}
                    {r.personRole ? ` · ${r.personRole}` : ""}
                  </p>
                  <p className="mt-0.5 text-[12px] text-[var(--wm-text-3)]">
                    {t.colDate}: {r.fillDate}
                    {!r.complete && ` · ${r.answeredCount}/${structure.itemCount}`}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => open(r.id)}
                    className="inline-flex h-10 items-center rounded-full bg-[var(--wm-brand)] px-5 text-[14px] font-semibold text-[var(--wm-brand-fg)] transition-opacity hover:opacity-85"
                  >
                    {t.coachOpen}
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(r.id)}
                    title={t.coachDelete}
                    aria-label={t.coachDelete}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--wm-border)] bg-[var(--wm-surface)] text-[var(--wm-text-3)] transition-colors hover:bg-[var(--wm-fill-4)] hover:text-[var(--wm-red)]"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14" />
                    </svg>
                  </button>
                </div>
              </article>
            )
          })}
        </div>
      )}

      <footer className="mt-14 border-t border-[var(--wm-border-light)] pt-6 text-center text-[12px] text-[var(--wm-text-3)]">
        {t.confidential}
      </footer>
    </div>
  )
}
