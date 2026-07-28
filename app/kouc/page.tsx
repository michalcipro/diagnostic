"use client"

import { useCallback, useEffect, useState } from "react"
import { LangToggle } from "@/components/diagnostic/lang-toggle"
import { ReportView } from "@/components/diagnostic/report-view"
import { TEST_NAMES, UI } from "@/lib/diagnostic/i18n"
import { getStructure, parseTestId } from "@/lib/diagnostic/structure"
import {
  addCoach,
  chybaText,
  createInvite,
  listCoaches,
  login as doLogin,
  logout as doLogout,
  setCoachActive,
  whoAmI,
  type CoachIdentity,
  type CoachRow,
  getResult,
  isRemoteEnabled,
  listInvites,
  listResults,
  normExport,
  normStats,
  removeResult,
  revokeInvite,
  type InviteRow,
  type NormStats,
  type ResultDetail,
  type ResultSummary,
} from "@/lib/diagnostic/remote"
import { TEST_IDS } from "@/lib/diagnostic/structure"
import type { Lang, TestId } from "@/lib/diagnostic/types"

// Chráněná sekce pro kouče. Heslo se ověřuje na serveru (Convex) – v prohlížeči
// se drží jen po dobu relace, aby se nemuselo psát u každého kliknutí.

const SESSION_KEY = "wm-diagnostic:session"
const LANG_KEY = "wm-diagnostic:lang"

export default function CoachPage() {
  const [lang, setLang] = useState<Lang>("cs")
  const [session, setSession] = useState<string>("")
  const [meInfo, setMeInfo] = useState<CoachIdentity | null>(null)
  const [booting, setBooting] = useState(true)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [checking, setChecking] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [coaches, setCoaches] = useState<CoachRow[] | null>(null)
  const [coachFormOpen, setCoachFormOpen] = useState(false)
  const [cName, setCName] = useState("")
  const [cEmail, setCEmail] = useState("")
  const [cPassword, setCPassword] = useState("")

  const [rows, setRows] = useState<ResultSummary[] | null>(null)
  const [detail, setDetail] = useState<ResultDetail | null>(null)
  const [detailLang, setDetailLang] = useState<Lang>("cs")

  const [tab, setTab] = useState<"results" | "invites" | "coaches" | "norms">("results")
  const [norms, setNorms] = useState<NormStats | null>(null)
  const [exporting, setExporting] = useState(false)
  const [invites, setInvites] = useState<InviteRow[] | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [fTest, setFTest] = useState<TestId>("elite200-sport")
  const [fLang, setFLang] = useState<Lang>("cs")
  const [fName, setFName] = useState("")
  const [creating, setCreating] = useState(false)
  const [newLink, setNewLink] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const t = UI[lang]

  const load = useCallback(async (pwd: string) => {
    try {
      const [list, inv] = await Promise.all([listResults(pwd), listInvites(pwd)])
      setRows(list)
      setInvites(inv)
    } catch (e) {
      setRows([])
      setInvites([])
      setError(chybaText(e, "Data se nepodařilo načíst."))
    }
  }, [])

  useEffect(() => {
    const savedLang = window.localStorage.getItem(LANG_KEY)
    if (savedLang === "en" || savedLang === "cs") setLang(savedLang)
    const saved = window.localStorage.getItem(SESSION_KEY)
    if (!saved || !isRemoteEnabled()) {
      setBooting(false)
      return
    }
    // Relace může mezitím vypršet – ověř ji u serveru, ne jen v prohlížeči.
    whoAmI(saved)
      .then((who) => {
        if (who) {
          setSession(saved)
          setMeInfo(who)
          void load(saved)
        } else {
          window.localStorage.removeItem(SESSION_KEY)
        }
      })
      .catch(() => window.localStorage.removeItem(SESSION_KEY))
      .finally(() => setBooting(false))
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
      const res = await doLogin(email, password)
      window.localStorage.setItem(SESSION_KEY, res.sessionToken)
      setSession(res.sessionToken)
      setMeInfo({ name: res.name, email, role: res.role as "master" | "coach" })
      setPassword("")
      await load(res.sessionToken)
    } catch (err) {
      setError(chybaText(err, t.coachWrongPassword))
    } finally {
      setChecking(false)
    }
  }

  const signOut = async () => {
    if (session) await doLogout(session)
    window.localStorage.removeItem(SESSION_KEY)
    setSession("")
    setMeInfo(null)
    setRows(null)
    setInvites(null)
    setCoaches(null)
    setDetail(null)
  }

  const loadCoaches = async () => {
    try {
      setCoaches(await listCoaches(session))
    } catch (e) {
      setError(chybaText(e, "Seznam koučů se nepodařilo načíst."))
    }
  }

  const loadNorms = async () => {
    try {
      setNorms(await normStats(session))
    } catch (e) {
      setError(chybaText(e, "Přehled vzorku se nepodařilo načíst."))
    }
  }

  /** Stáhne anonymní vzorek jako JSON – bez jmen a bez vazby na vyplnění. */
  const exportNorms = async () => {
    setExporting(true)
    try {
      const data = await normExport(session)
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `elite-normativni-vzorek-${new Date().toISOString().slice(0, 10)}.json`
      a.click()
      URL.revokeObjectURL(url)
    } catch (e) {
      setError(chybaText(e, "Export se nepodařil."))
    } finally {
      setExporting(false)
    }
  }

  const submitCoach = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    try {
      await addCoach(session, cName, cEmail, cPassword)
      setCName("")
      setCEmail("")
      setCPassword("")
      setCoachFormOpen(false)
      await loadCoaches()
    } catch (err) {
      setError(chybaText(err, "Kouče se nepodařilo přidat."))
    }
  }

  const open = async (id: string) => {
    const d = await getResult(session, id)
    if (d) {
      setDetail(d)
      setDetailLang(d.lang)
      window.scrollTo({ top: 0 })
    }
  }

  const remove = async (id: string) => {
    if (!window.confirm(t.coachDeleteConfirm)) return
    await removeResult(session, id)
    await load(session)
  }

  const inviteUrl = (token: string) => `${window.location.origin}/t/${token}`

  const submitInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreating(true)
    try {
      const token = await createInvite(session, fTest, fLang, fName.trim())
      setNewLink(inviteUrl(token))
      setCopied(false)
      setFName("")
      await load(session)
    } catch (err) {
      setError(chybaText(err, "Pozvánku se nepodařilo vytvořit."))
    } finally {
      setCreating(false)
    }
  }

  const copy = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      window.prompt(t.inviteCopy, url)
    }
  }

  const revoke = async (id: string) => {
    if (!window.confirm(t.inviteRevokeConfirm)) return
    await revokeInvite(session, id)
    await load(session)
  }

  // ---------- přihlášení ----------
  if (booting) return null
  if (!meInfo) {
    return (
      <div className="diag-container flex min-h-screen flex-col items-center justify-center pb-20">
        <form onSubmit={signIn} className="diag-card w-full max-w-sm p-7">
          <p className="text-[12px] font-bold tracking-[0.18em] text-[var(--wm-text-3)]">{t.brand}</p>
          <h1 className="mt-2 text-[22px] font-bold tracking-tight">{t.coachTitle}</h1>
          <p className="mt-1 text-[14px] text-[var(--wm-text-2)]">{t.coachSubtitle}</p>
          <label className="mt-6 block">
            <span className="mb-1.5 block text-[13px] font-medium text-[var(--wm-text-2)]">E-mail</span>
            <input
              type="email"
              autoFocus
              className="diag-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <label className="mt-4 block">
            <span className="mb-1.5 block text-[13px] font-medium text-[var(--wm-text-2)]">{t.coachPassword}</span>
            <input
              type="password"
              className="diag-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          {error && <p className="mt-3 text-[13px] font-medium text-[var(--wm-invalid-fg)]">{error}</p>}
          <button
            type="submit"
            disabled={checking || password.length === 0 || email.length === 0}
            className="diag-press mt-5 inline-flex h-11 w-full items-center justify-center rounded-full bg-[var(--wm-brand)] text-[15px] font-semibold text-[var(--wm-brand-fg)] transition-opacity hover:opacity-85 disabled:opacity-40"
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
            className="diag-press inline-flex h-9 items-center rounded-full border border-[var(--wm-border)] bg-[var(--wm-surface)] px-4 text-[13px] font-semibold text-[var(--wm-text)] transition-colors hover:bg-[var(--wm-fill-4)]"
          >
            ← {t.coachBack}
          </button>
          <div className="flex items-center gap-2">
            <LangToggle lang={detailLang} onChange={setDetailLang} />
            <button
              type="button"
              onClick={() => window.print()}
              className="diag-press inline-flex h-9 items-center rounded-full bg-[var(--wm-brand)] px-4 text-[13px] font-semibold text-[var(--wm-brand-fg)] transition-opacity hover:opacity-85"
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
          durationSec={detail.durationSec}
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
          <p className="mt-1 text-[14px] text-[var(--wm-text-2)]">
            {meInfo.name}
            {meInfo.role === "master" && (
              <span className="ml-2 rounded-full bg-[var(--wm-fill-4)] px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-[var(--wm-text-2)]">
                master
              </span>
            )}
            {rows && <span className="ml-2 text-[var(--wm-text-3)]">· {t.coachCount(rows.length)}</span>}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <LangToggle lang={lang} onChange={setLang} />
          <button
            type="button"
            onClick={signOut}
            className="diag-press inline-flex h-9 items-center rounded-full border border-[var(--wm-border)] bg-[var(--wm-surface)] px-4 text-[13px] font-semibold text-[var(--wm-text)] transition-colors hover:bg-[var(--wm-fill-4)]"
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

      {/* záložky */}
      <div className="diag-segment mb-5">
        <button type="button" data-active={tab === "results"} onClick={() => setTab("results")}>
          {t.tabResults}
        </button>
        <button type="button" data-active={tab === "invites"} onClick={() => setTab("invites")}>
          {t.tabInvites}
        </button>
        <button
          type="button"
          data-active={tab === "norms"}
          onClick={() => {
            setTab("norms")
            if (norms === null) void loadNorms()
          }}
        >
          {t.tabNorms}
        </button>
        {meInfo.role === "master" && (
          <button
            type="button"
            data-active={tab === "coaches"}
            onClick={() => {
              setTab("coaches")
              if (coaches === null) void loadCoaches()
            }}
          >
            Kouči
          </button>
        )}
      </div>

      {tab === "norms" && (
        <NormsPanel
          stats={norms}
          lang={lang}
          exporting={exporting}
          onExport={() => void exportNorms()}
        />
      )}

      {tab === "coaches" && meInfo.role === "master" && (
        <div className="mb-8">
          {!coachFormOpen ? (
            <button
              type="button"
              onClick={() => setCoachFormOpen(true)}
              className="diag-press inline-flex h-11 items-center rounded-full bg-[var(--wm-brand)] px-6 text-[15px] font-semibold text-[var(--wm-brand-fg)] transition-opacity hover:opacity-85"
            >
              + Přidat kouče
            </button>
          ) : (
            <form onSubmit={submitCoach} className="diag-card p-6">
              <h2 className="text-[16px] font-semibold">Přidat kouče</h2>
              <p className="mt-1 text-[13px] text-[var(--wm-text-2)]">
                Nový kouč uvidí vyplněné diagnostiky a bude moci vytvářet pozvánky. Spravovat účty
                může dál pouze master.
              </p>
              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                <label className="block">
                  <span className="mb-1.5 block text-[13px] font-medium text-[var(--wm-text-2)]">Jméno</span>
                  <input className="diag-input" value={cName} onChange={(e) => setCName(e.target.value)} />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-[13px] font-medium text-[var(--wm-text-2)]">E-mail</span>
                  <input type="email" className="diag-input" value={cEmail} onChange={(e) => setCEmail(e.target.value)} />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-[13px] font-medium text-[var(--wm-text-2)]">Heslo</span>
                  <input type="password" className="diag-input" value={cPassword} onChange={(e) => setCPassword(e.target.value)} />
                </label>
              </div>
              <div className="mt-5 flex items-center gap-3">
                <button
                  type="submit"
                  disabled={!cName.trim() || !cEmail.trim() || cPassword.length < 10}
                  className="diag-press inline-flex h-11 items-center rounded-full bg-[var(--wm-brand)] px-6 text-[15px] font-semibold text-[var(--wm-brand-fg)] transition-opacity hover:opacity-85 disabled:opacity-40"
                >
                  Vytvořit účet
                </button>
                <button
                  type="button"
                  onClick={() => setCoachFormOpen(false)}
                  className="text-[14px] font-semibold text-[var(--wm-text-2)] hover:text-[var(--wm-text)]"
                >
                  {t.back}
                </button>
              </div>
            </form>
          )}

          <div className="mt-5 flex flex-col gap-3">
            {(coaches ?? []).map((c) => (
              <article key={c.id} className="diag-card diag-card-hover flex flex-wrap items-center gap-4 p-5">
                <div className="min-w-[180px] flex-1">
                  <h3 className="text-[16px] font-semibold tracking-tight">
                    {c.name}
                    {c.role === "master" && (
                      <span className="ml-2 rounded-full bg-[var(--wm-fill-4)] px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-[var(--wm-text-2)]">
                        master
                      </span>
                    )}
                  </h3>
                  <p className="mt-0.5 text-[13px] text-[var(--wm-text-2)]">{c.email}</p>
                </div>
                {c.role !== "master" && (
                  <button
                    type="button"
                    onClick={async () => {
                      await setCoachActive(session, c.id, !c.active)
                      await loadCoaches()
                    }}
                    className="diag-press inline-flex h-10 items-center rounded-full border border-[var(--wm-border)] bg-[var(--wm-surface)] px-4 text-[13px] font-semibold text-[var(--wm-text)] transition-colors hover:bg-[var(--wm-fill-4)]"
                  >
                    {c.active ? "Zablokovat" : "Obnovit přístup"}
                  </button>
                )}
              </article>
            ))}
          </div>
        </div>
      )}

      {tab === "invites" && (
        <div className="mb-8">
          {!formOpen ? (
            <button
              type="button"
              onClick={() => {
                setFormOpen(true)
                setNewLink(null)
              }}
              className="diag-press inline-flex h-11 items-center rounded-full bg-[var(--wm-brand)] px-6 text-[15px] font-semibold text-[var(--wm-brand-fg)] transition-opacity hover:opacity-85"
            >
              + {t.newInvite}
            </button>
          ) : (
            <form onSubmit={submitInvite} className="diag-card p-6">
              <h2 className="text-[16px] font-semibold">{t.newInvite}</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1.5 block text-[13px] font-medium text-[var(--wm-text-2)]">{t.inviteTest}</span>
                  <select
                    className="diag-input"
                    value={fTest}
                    onChange={(e) => setFTest(e.target.value as TestId)}
                  >
                    {TEST_IDS.map((id) => (
                      <option key={id} value={id}>
                        {TEST_NAMES[id][lang]}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-[13px] font-medium text-[var(--wm-text-2)]">{t.inviteLang}</span>
                  <select className="diag-input" value={fLang} onChange={(e) => setFLang(e.target.value as Lang)}>
                    <option value="cs">Čeština</option>
                    <option value="en">English</option>
                  </select>
                </label>
                <label className="block sm:col-span-2">
                  <span className="mb-1.5 block text-[13px] font-medium text-[var(--wm-text-2)]">{t.inviteClient}</span>
                  <input
                    className="diag-input"
                    value={fName}
                    placeholder={t.inviteClientPlaceholder}
                    onChange={(e) => setFName(e.target.value)}
                  />
                </label>
              </div>
              <div className="mt-5 flex items-center gap-3">
                <button
                  type="submit"
                  disabled={creating}
                  className="diag-press inline-flex h-11 items-center rounded-full bg-[var(--wm-brand)] px-6 text-[15px] font-semibold text-[var(--wm-brand-fg)] transition-opacity hover:opacity-85 disabled:opacity-40"
                >
                  {creating ? "…" : t.inviteCreate}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFormOpen(false)
                    setNewLink(null)
                  }}
                  className="text-[14px] font-semibold text-[var(--wm-text-2)] hover:text-[var(--wm-text)]"
                >
                  {t.back}
                </button>
              </div>

              {newLink && (
                <div className="mt-5 rounded-2xl bg-[var(--wm-surface-2)] p-4">
                  <p className="text-[13px] font-medium text-[var(--wm-text-2)]">{t.inviteCreated}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-3">
                    <code className="min-w-0 flex-1 break-all text-[14px] font-semibold">{newLink}</code>
                    <button
                      type="button"
                      onClick={() => copy(newLink)}
                      className="diag-press inline-flex h-10 shrink-0 items-center rounded-full bg-[var(--wm-blue)] px-5 text-[14px] font-semibold text-white transition-opacity hover:opacity-85"
                    >
                      {copied ? t.inviteCopied : t.inviteCopy}
                    </button>
                  </div>
                </div>
              )}
            </form>
          )}

          <div className="mt-5 flex flex-col gap-3">
            {invites === null ? (
              <p className="text-[15px] text-[var(--wm-text-2)]">{t.coachLoading}</p>
            ) : invites.length === 0 ? (
              <div className="diag-card p-8 text-center">
                <p className="text-[15px] text-[var(--wm-text-2)]">{t.invitesEmpty}</p>
              </div>
            ) : (
              invites.map((iv) => (
                <article key={iv.id} className="diag-card diag-card-hover flex flex-wrap items-center gap-4 p-5">
                  <div className="min-w-[180px] flex-1">
                    <h3 className="text-[16px] font-semibold tracking-tight">
                      {iv.clientName || "–"}
                    </h3>
                    <p className="mt-0.5 text-[13px] text-[var(--wm-text-2)]">
                      {TEST_NAMES[iv.testId][lang]} · {iv.lang.toUpperCase()}
                    </p>
                    <p className="mt-0.5 break-all text-[12px] text-[var(--wm-text-3)]">/t/{iv.token}</p>
                  </div>
                  <span
                    className="inline-flex items-center rounded-full px-3 py-1 text-[12px] font-semibold"
                    style={
                      iv.usedAt
                        ? { color: "var(--wm-ok-fg)", background: "var(--wm-green-light)" }
                        : { color: "var(--wm-caution-fg)", background: "var(--wm-orange-light)" }
                    }
                  >
                    {iv.usedAt ? t.inviteUsed : t.invitePending}
                  </span>
                  {!iv.usedAt && (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => copy(inviteUrl(iv.token))}
                        className="diag-press inline-flex h-10 items-center rounded-full border border-[var(--wm-border)] bg-[var(--wm-surface)] px-4 text-[13px] font-semibold text-[var(--wm-text)] transition-colors hover:bg-[var(--wm-fill-4)]"
                      >
                        {t.inviteCopy}
                      </button>
                      <button
                        type="button"
                        onClick={() => revoke(iv.id)}
                        className="diag-press inline-flex h-10 items-center rounded-full border border-[var(--wm-border)] bg-[var(--wm-surface)] px-4 text-[13px] font-semibold text-[var(--wm-text-2)] transition-colors hover:bg-[var(--wm-fill-4)] hover:text-[var(--wm-red)]"
                      >
                        {t.inviteRevoke}
                      </button>
                    </div>
                  )}
                </article>
              ))
            )}
          </div>
        </div>
      )}

      {tab === "results" && (rows === null ? (
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
              <article key={r.id} className="diag-card diag-card-hover flex flex-wrap items-center gap-4 p-5">
                <div className="min-w-[180px] flex-1">
                  <h2 className="text-[17px] font-semibold tracking-tight">{r.personName || "–"}</h2>
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
                    className="diag-press inline-flex h-10 items-center rounded-full bg-[var(--wm-brand)] px-5 text-[14px] font-semibold text-[var(--wm-brand-fg)] transition-opacity hover:opacity-85"
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
      ))}

      <footer className="mt-14 border-t border-[var(--wm-border-light)] pt-6 text-center text-[12px] text-[var(--wm-text-3)]">
        {t.confidential}
      </footer>
    </div>
  )
}

/** Milníky, od kterých má analýza smysl (na jednu variantu testu). */
const NORM_MILNIKY = { normy: 100, cfa: 250 }

/**
 * Stav anonymního normativního vzorku.
 *
 * Ukazuje, kolik dat se nasbíralo a jak daleko je to k tomu, aby šly spočítat
 * percentily a reliabilita. Do té doby report u pořadí škál poctivě přiznává,
 * že srovnání s populací zatím nemá o co opřít.
 */
function NormsPanel({
  stats,
  lang,
  exporting,
  onExport,
}: {
  stats: NormStats | null
  lang: Lang
  exporting: boolean
  onExport: () => void
}) {
  const t = UI[lang]
  if (stats === null) {
    return <p className="mb-8 text-[14px] text-[var(--wm-text-3)]">{t.loading}</p>
  }
  return (
    <div className="mb-8">
      <div className="diag-card p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-[17px] font-bold tracking-tight">{t.normsTitle}</h2>
            <p className="mt-1 text-[13.5px] leading-relaxed text-[var(--wm-text-2)]">{t.normsIntro}</p>
          </div>
          <button
            type="button"
            onClick={onExport}
            disabled={exporting || stats.total === 0}
            className="diag-press inline-flex h-9 shrink-0 items-center rounded-full bg-[var(--wm-brand)] px-4 text-[13px] font-semibold text-[var(--wm-brand-fg)] transition-opacity hover:opacity-85 disabled:opacity-40"
          >
            {exporting ? t.normsExporting : t.normsExport}
          </button>
        </div>

        <div className="mt-5 flex flex-col gap-3">
          {stats.byTest.map((r) => {
            const podil = Math.min(100, Math.round((r.count / NORM_MILNIKY.normy) * 100))
            return (
              <div key={r.testId}>
                <div className="mb-1.5 flex items-baseline justify-between gap-3">
                  <span className="text-[14px] font-medium">{TEST_NAMES[r.testId as TestId][lang]}</span>
                  <span className="text-[13px] tabular-nums text-[var(--wm-text-3)]">
                    {t.normsCount(r.count, NORM_MILNIKY.normy)}
                  </span>
                </div>
                <div className="diag-bar">
                  <div className="diag-bar-fill" style={{ width: `${Math.max(2, podil)}%` }} />
                </div>
              </div>
            )
          })}
        </div>

        <p className="mt-5 rounded-xl bg-[var(--wm-surface-2)] p-4 text-[13px] leading-relaxed text-[var(--wm-text-2)]">
          {t.normsPrivacy}
        </p>
      </div>
    </div>
  )
}
