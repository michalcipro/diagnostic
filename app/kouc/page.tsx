"use client"

import { useCallback, useEffect, useState } from "react"
import { LangToggle } from "@/components/diagnostic/lang-toggle"
import { CoachCard } from "@/components/diagnostic/coach-card"
import { ExternalPanel } from "@/components/diagnostic/external-panel"
import { ReportView } from "@/components/diagnostic/report-view"
import { VzorceReport } from "@/components/vzorce/report"
import { ArchetypyReport } from "@/components/archetypy/report"
import { TEST_NAMES, UI } from "@/lib/diagnostic/i18n"
import { JAZYKY } from "@/lib/diagnostic/lang"
import { jeArchetypy, jeVzorce } from "@/lib/diagnostic/structure"
import { testMeta } from "@/lib/diagnostic/test-meta"
import {
  addCoach,
  chybaText,
  resetCoachPassword,
  updateCoach,
  externalUsage,
  type ExternalUsage,
  pristupovyLog,
  type PristupZaznam,
  createInvite,
  listCoaches,
  login as doLogin,
  logout as doLogout,
  logoutAll,
  zacniNastaveniTotp,
  potvrdTotp,
  vypniTotp,
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
import type { OdpovediMapa } from "@/lib/vzorce/types"

// Chráněná sekce pro kouče. Heslo se ověřuje na serveru (Convex) – v prohlížeči
// se drží jen po dobu relace, aby se nemuselo psát u každého kliknutí.

const SESSION_KEY = "wm-diagnostic:session"

/** Nepoužitá pozvánka po uplynutí platnosti; starší pozvánky ji nemají. */
const jeVyprsela = (iv: InviteRow): boolean =>
  !iv.usedAt && iv.expiresAt !== undefined && iv.expiresAt < Date.now()
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
  const [cRole, setCRole] = useState<"coach" | "external">("coach")
  const [cNote, setCNote] = useState("")
  const [cPhone, setCPhone] = useState("")

  const [rows, setRows] = useState<ResultSummary[] | null>(null)
  const [detail, setDetail] = useState<ResultDetail | null>(null)
  const [detailLang, setDetailLang] = useState<Lang>("cs")

  const [tab, setTab] = useState<
    "results" | "invites" | "coaches" | "norms" | "externi" | "pristupy" | "ucet"
  >("results")
  const [externi, setExterni] = useState<ExternalUsage[] | null>(null)
  const [pristupy, setPristupy] = useState<PristupZaznam[] | null>(null)
  /** účet má druhý faktor a čeká se na kód */
  const [potrebaKod, setPotrebaKod] = useState(false)
  const [kod, setKod] = useState("")
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
    if (savedLang && (JAZYKY as string[]).includes(savedLang)) setLang(savedLang as Lang)
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
      const res = await doLogin(email, password, kod || undefined)
      // Účet s druhým faktorem: doptáme se na kód a zavoláme znovu. Heslo
      // zůstává ve stavu formuláře, na serveru se žádný mezistav nedrží.
      if (res.stav === "potreba-kod") {
        setPotrebaKod(true)
        setError(null)
        return
      }
      window.localStorage.setItem(SESSION_KEY, res.sessionToken)
      setSession(res.sessionToken)
      setMeInfo({ name: res.name, email, role: res.role as CoachIdentity["role"] })
      setPassword("")
      setKod("")
      setPotrebaKod(false)
      await load(res.sessionToken)
    } catch (err) {
      setError(chybaText(err, t.coachWrongPassword))
    } finally {
      setChecking(false)
    }
  }

  const signOut = async () => {
    if (session) await doLogout(session)
    zapomenRelaci()
  }

  /**
   * Odhlášení ze všech zařízení. Hodí se, když je podezření, že se někdo
   * dostal k přihlášenému prohlížeči: ukončí i relace, ke kterým se odsud
   * nedá dostat. Ruší i tu vlastní, proto se pak přihlašuje znovu.
   */
  const signOutEverywhere = async () => {
    if (!session) return
    if (!window.confirm("Odhlásit ze všech zařízení? Budeš se muset přihlásit znovu.")) return
    try {
      const ukonceno = await logoutAll(session)
      zapomenRelaci()
      setError(`Ukončeno ${ukonceno} přihlášení. Přihlas se prosím znovu.`)
    } catch (e) {
      setError(chybaText(e, "Odhlášení ze všech zařízení se nepodařilo."))
    }
  }

  const zapomenRelaci = () => {
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

  const loadPristupy = async () => {
    try {
      setPristupy(await pristupovyLog(session))
    } catch (e) {
      setError(chybaText(e, "Přehled přístupů se nepodařilo načíst."))
    }
  }

  const loadExterni = async () => {
    try {
      setExterni(await externalUsage(session))
    } catch (e) {
      setError(chybaText(e, "Přehled externích koučů se nepodařilo načíst."))
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
      await addCoach(session, cName, cEmail, cPassword, cRole, cNote, cPhone)
      setCName("")
      setCEmail("")
      setCPassword("")
      setCNote("")
      setCPhone("")
      setCRole("coach")
      setCoachFormOpen(false)
      await loadCoaches()
      if (externi !== null) await loadExterni()
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
          {potrebaKod && (
            <label className="mt-4 block">
              <span className="mb-1.5 block text-[13px] font-medium text-[var(--wm-text-2)]">
                Kód z aplikace
              </span>
              <input
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                autoFocus
                placeholder="123456"
                className="diag-input tracking-[0.3em]"
                value={kod}
                onChange={(e) => setKod(e.target.value)}
              />
              <span className="mt-1.5 block text-[12px] leading-relaxed text-[var(--wm-text-3)]">
                Šestimístný kód z autentizační aplikace. Bez telefonu po ruce
                zadej místo něj jeden ze záložních kódů.
              </span>
            </label>
          )}
          {error && <p className="mt-3 text-[13px] font-medium text-[var(--wm-invalid-fg)]">{error}</p>}
          <button
            type="submit"
            disabled={
              checking ||
              password.length === 0 ||
              email.length === 0 ||
              (potrebaKod && kod.trim().length < 6)
            }
            className="diag-press mt-5 inline-flex h-11 w-full items-center justify-center rounded-full bg-[var(--wm-brand)] text-[15px] font-semibold text-[var(--wm-brand-fg)] transition-opacity hover:opacity-85 disabled:opacity-40"
          >
            {checking ? "…" : potrebaKod ? "Ověřit a přihlásit" : t.coachEnter}
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
              className="diag-press inline-flex h-9 items-center rounded-full border border-[var(--wm-border)] bg-[var(--wm-surface)] px-4 text-[13px] font-semibold text-[var(--wm-text)] transition-colors hover:bg-[var(--wm-fill-4)]"
            >
              {t.printButton}
            </button>
            <button
              type="button"
              onClick={() => void exportPdf(detail, detailLang)}
              className="diag-press inline-flex h-9 items-center rounded-full bg-[var(--wm-brand)] px-4 text-[13px] font-semibold text-[var(--wm-brand-fg)] transition-opacity hover:opacity-85"
            >
              {t.pdfButton}
            </button>
          </div>
        </div>
        {jeArchetypy(detail.testId) ? (
          <ArchetypyReport
            testId={detail.testId}
            person={detail.person}
            answers={detail.answers}
            lang={detailLang}
            durationSec={detail.durationSec}
          />
        ) : jeVzorce(detail.testId) ? (
          <VzorceReport
            testId={detail.testId}
            person={detail.person}
            answers={detail.answers}
            lang={detailLang}
            durationSec={detail.durationSec}
          />
        ) : (
          <ReportView
            testId={detail.testId}
            person={detail.person}
            answers={detail.answers}
            lang={detailLang}
            durationSec={detail.durationSec}
          />
        )}
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
            onClick={signOutEverywhere}
            title="Ukončí přihlášení na všech zařízeních, i tam, kam se odsud nedostaneš."
            className="diag-press inline-flex h-9 items-center rounded-full border border-[var(--wm-border)] bg-[var(--wm-surface)] px-4 text-[13px] font-semibold text-[var(--wm-text-2)] transition-colors hover:bg-[var(--wm-fill-4)]"
          >
            Odhlásit všude
          </button>
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
        {meInfo.role !== "external" && (
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
        )}
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
        {meInfo.role === "master" && (
          <button
            type="button"
            data-active={tab === "externi"}
            onClick={() => {
              setTab("externi")
              if (externi === null) void loadExterni()
            }}
          >
            Externí kouči
          </button>
        )}
        <button
          type="button"
          data-active={tab === "ucet"}
          onClick={() => setTab("ucet")}
        >
          Můj účet
        </button>
        {meInfo.role === "master" && (
          <button
            type="button"
            data-active={tab === "pristupy"}
            onClick={() => {
              setTab("pristupy")
              if (pristupy === null) void loadPristupy()
            }}
          >
            Přístupy
          </button>
        )}
      </div>

      {tab === "pristupy" && meInfo.role === "master" && (
        <div className="mb-8">
          <PristupyPanel zaznamy={pristupy} />
        </div>
      )}

      {tab === "ucet" && (
        <div className="mb-8">
          <DruhyFaktorPanel
            session={session}
            aktivni={meInfo.totpAktivni === true}
            zbyvaKodu={meInfo.zbyvaZalozníchKodu ?? 0}
            onZmena={async () => {
              const kdoJsem = await whoAmI(session)
              if (kdoJsem) setMeInfo(kdoJsem)
            }}
          />
        </div>
      )}

      {tab === "externi" && meInfo.role === "master" && (
        <div className="mb-8">
          <ExternalPanel data={externi} lang={lang} />
        </div>
      )}

      {tab === "norms" && meInfo.role !== "external" && (
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
              <p className="mt-1 max-w-[74ch] text-[13px] leading-relaxed text-[var(--wm-text-2)]">
                Náš kouč sdílí přehled klientů s tebou. Externí kouč dostane vlastní větev: uvidí
                jen to, co sám založí, a do našich klientů nevidí. Ty na jeho klienty také ne,
                v záložce Externí kouči uvidíš jen počty testů, jejich typ a data. Spravovat účty
                může dál pouze master.
              </p>

              <div className="mt-4">
                <span className="mb-1.5 block text-[13px] font-medium text-[var(--wm-text-2)]">
                  Druh účtu
                </span>
                <div className="diag-segment">
                  <button
                    type="button"
                    data-active={cRole === "coach"}
                    onClick={() => setCRole("coach")}
                  >
                    Náš kouč
                  </button>
                  <button
                    type="button"
                    data-active={cRole === "external"}
                    onClick={() => setCRole("external")}
                  >
                    Externí kouč
                  </button>
                </div>
              </div>

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
              <label className="mt-4 block">
                <span className="mb-1.5 block text-[13px] font-medium text-[var(--wm-text-2)]">
                  Telefon (nepovinný)
                </span>
                <input className="diag-input" value={cPhone} onChange={(e) => setCPhone(e.target.value)} />
              </label>
              <label className="mt-4 block">
                <span className="mb-1.5 block text-[13px] font-medium text-[var(--wm-text-2)]">
                  Poznámka {cRole === "external" ? "(např. sazba za test, smluvní podmínky)" : "(nepovinná)"}
                </span>
                <input
                  className="diag-input"
                  value={cNote}
                  onChange={(e) => setCNote(e.target.value)}
                  placeholder={cRole === "external" ? "Např. 900 Kč za vyhodnocení, fakturace měsíčně" : ""}
                />
              </label>
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
              <CoachCard
                key={c.id}
                coach={c}
                jaSam={c.email === meInfo.email}
                onSave={async (data) => {
                  await updateCoach(session, c.id, data)
                  await loadCoaches()
                  if (externi !== null) await loadExterni()
                }}
                onReset={async () => (await resetCoachPassword(session, c.id)).password}
                onToggleActive={async () => {
                  await setCoachActive(session, c.id, !c.active)
                  await loadCoaches()
                }}
              />
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
                    <option value="sk">Slovenčina</option>
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
                        : jeVyprsela(iv)
                          ? { color: "var(--wm-text-3)", background: "var(--wm-track)" }
                          : { color: "var(--wm-caution-fg)", background: "var(--wm-orange-light)" }
                    }
                    title={
                      iv.expiresAt && !iv.usedAt
                        ? `${jeVyprsela(iv) ? "Vypršela" : "Platí do"} ${new Date(iv.expiresAt).toLocaleDateString("cs-CZ")}`
                        : undefined
                    }
                  >
                    {iv.usedAt ? t.inviteUsed : jeVyprsela(iv) ? "Vypršela" : t.invitePending}
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
            const pocetPolozek = testMeta(r.testId).pocetPolozek
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
                    {!r.complete && ` · ${r.answeredCount}/${pocetPolozek}`}
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
 * Které testy se ve stavu vzorku vypisují.
 *
 * Server počítá i testy, které se už nenabízejí (původní nerozdělené sportovní
 * vzorce), protože jejich hotová vyplnění do vzorku patří. V přehledu ale nemá
 * smysl ukazovat prázdný řádek testu, ke kterému už nikdo pozvánku nedostane.
 */
const jeVeSberu = (r: { testId: string; count: number }) =>
  r.count > 0 || TEST_IDS.includes(r.testId as TestId)

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
          {stats.byTest.filter(jeVeSberu).map((r) => {
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

/**
 * Vyrobí skutečný soubor PDF a nabídne ho k uložení nebo odeslání.
 *
 * Tiskový dialog prohlížeče tudy nevede: na iPhonu z něj soubor uložit ani
 * poslat nejde. Proto se PDF skládá přímo v prohlížeči a pak se předá
 * systémovému sdílení, kde je „Uložit do souborů", Mail i WhatsApp. Kde
 * sdílení souborů není (běžný desktop), soubor se prostě stáhne.
 *
 * Knihovna se načítá až při kliknutí, aby nezdržovala první zobrazení stránky.
 */
async function exportPdf(detail: ResultDetail, lang: Lang): Promise<void> {
  // Kazda rodina testu ma vlastni generator, ale stejnou sazbu.
  let blob: Blob
  let nazev: string
  if (jeArchetypy(detail.testId)) {
    const { buildArchetypyPdf, archetypyPdfFileName } = await import("@/lib/archetypy/pdf")
    const vstup = {
      testId: detail.testId,
      person: detail.person,
      // Škála archetypů má šest stupňů; uložené odpovědi jsou čísla, typ se
      // liší jen rozsahem.
      answers: detail.answers as unknown as OdpovediMapa,
      lang,
      durationSec: detail.durationSec,
    }
    blob = buildArchetypyPdf(vstup)
    nazev = archetypyPdfFileName(vstup)
  } else if (jeVzorce(detail.testId)) {
    const { buildVzorcePdf, vzorcePdfFileName } = await import("@/lib/vzorce/pdf")
    const vstup = {
      testId: detail.testId,
      person: detail.person,
      // Škála vzorců má šest stupňů, ELITE pět; uložené odpovědi jsou v obou
      // případech čísla, typ se liší jen rozsahem.
      answers: detail.answers as unknown as OdpovediMapa,
      lang,
      durationSec: detail.durationSec,
    }
    blob = buildVzorcePdf(vstup)
    nazev = vzorcePdfFileName(vstup)
  } else {
    const { buildReportPdf, pdfFileName } = await import("@/lib/diagnostic/pdf/report-pdf")
    const vstup = {
      testId: detail.testId,
      person: detail.person,
      answers: detail.answers,
      lang,
      durationSec: detail.durationSec,
    }
    blob = buildReportPdf(vstup)
    nazev = pdfFileName(vstup)
  }
  const soubor = new File([blob], nazev, { type: "application/pdf" })

  // iPhone i iPad: systémové sdílení se souborem.
  if (typeof navigator.canShare === "function" && navigator.canShare({ files: [soubor] })) {
    try {
      await navigator.share({ files: [soubor], title: nazev })
      return
    } catch (e) {
      // Uživatel sdílení zavřel – pak už nic dalšího nedělej.
      if (e instanceof DOMException && e.name === "AbortError") return
    }
  }

  // Ostatní prohlížeče: stažení souboru.
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = nazev
  a.click()
  // Odvolání až po chvíli, jinak stahování v Safari nestihne začít.
  window.setTimeout(() => URL.revokeObjectURL(url), 10_000)
}

/**
 * Přehled přístupů k výsledkům. Vidí ho pouze master.
 *
 * U psychologických dat je záznam o tom, kdo se kdy díval, základní kontrola:
 * bez něj nejde zjistit, co se stalo, ani doložit, že se nestalo nic.
 */
function PristupyPanel({ zaznamy }: { zaznamy: PristupZaznam[] | null }) {
  const POPIS: Record<string, string> = {
    "otevreni-vysledku": "otevřel vyhodnocení",
    "export-vzorku": "stáhl anonymní vzorek",
    "smazani-vysledku": "smazal vyhodnocení",
    "vytvoreni-pozvanky": "vystavil pozvánku",
    prihlaseni: "přihlásil se",
  }

  if (zaznamy === null) {
    return <p className="text-[14px] text-[var(--wm-text-3)]">Načítám…</p>
  }

  return (
    <div className="diag-card p-6">
      <h2 className="text-[17px] font-bold tracking-tight">Přístupy k datům</h2>
      <p className="mt-1 text-[13.5px] leading-relaxed text-[var(--wm-text-2)]">
        Kdo se kdy díval na vyhodnocení, stahoval vzorek nebo vystavoval pozvánky.
        Posledních 500 záznamů, novější první. Slouží ke kontrole; u údajů
        o duševním zdraví je taková evidence namístě.
      </p>

      {zaznamy.length === 0 ? (
        <p className="mt-5 text-[14px] text-[var(--wm-text-3)]">Zatím žádné záznamy.</p>
      ) : (
        <div className="mt-5 flex flex-col divide-y divide-[var(--wm-border-light)] border-t border-[var(--wm-border-light)]">
          {zaznamy.map((z, i) => (
            <div key={i} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 py-2.5">
              <span className="text-[14px]">
                <span className="font-medium">{z.coachName}</span>{" "}
                <span className="text-[var(--wm-text-2)]">{POPIS[z.akce] ?? z.akce}</span>
              </span>
              <span className="text-[12.5px] tabular-nums text-[var(--wm-text-3)]">
                {new Date(z.at).toLocaleString("cs-CZ")}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/**
 * Nastavení druhého faktoru.
 *
 * Zapíná se ve dvou krocích: nejdřív se vydá tajemství k opsání do aplikace,
 * pak se ověří první kód a teprve potom se faktor zapne. Bez toho by stačil
 * překlep k tomu, aby se člověk ke svému účtu už nedostal.
 *
 * Záložní kódy se ukazují jednou; v databázi po nich zůstává jen otisk,
 * takže je nedokáže přečíst ani master.
 */
function DruhyFaktorPanel({
  session,
  aktivni,
  zbyvaKodu,
  onZmena,
}: {
  session: string
  aktivni: boolean
  zbyvaKodu: number
  onZmena: () => Promise<void>
}) {
  const [faze, setFaze] = useState<"prehled" | "nastavuji" | "kody">("prehled")
  const [secret, setSecret] = useState("")
  const [uri, setUri] = useState("")
  const [kod, setKod] = useState("")
  const [heslo, setHeslo] = useState("")
  const [zalozni, setZalozni] = useState<string[]>([])
  const [chyba, setChyba] = useState<string | null>(null)
  const [pracuje, setPracuje] = useState(false)

  const zacni = async () => {
    setChyba(null)
    setPracuje(true)
    try {
      const r = await zacniNastaveniTotp(session)
      setSecret(r.secret)
      setUri(r.uri)
      setFaze("nastavuji")
    } catch (e) {
      setChyba(chybaText(e, "Nastavení se nepodařilo zahájit."))
    } finally {
      setPracuje(false)
    }
  }

  const potvrd = async () => {
    setChyba(null)
    setPracuje(true)
    try {
      setZalozni(await potvrdTotp(session, secret, kod))
      setKod("")
      setFaze("kody")
      await onZmena()
    } catch (e) {
      setChyba(chybaText(e, "Kód se nepodařilo ověřit."))
    } finally {
      setPracuje(false)
    }
  }

  const vypni = async () => {
    setChyba(null)
    setPracuje(true)
    try {
      await vypniTotp(session, heslo)
      setHeslo("")
      await onZmena()
    } catch (e) {
      setChyba(chybaText(e, "Druhý faktor se nepodařilo vypnout."))
    } finally {
      setPracuje(false)
    }
  }

  return (
    <div className="diag-card p-6">
      <h2 className="text-[17px] font-bold tracking-tight">Druhý faktor při přihlášení</h2>
      <p className="mt-1 max-w-[70ch] text-[13.5px] leading-relaxed text-[var(--wm-text-2)]">
        K heslu se přidá šestimístný kód z aplikace v telefonu. Kdo získá heslo,
        se bez telefonu nepřihlásí. Funguje s Google Authenticatorem, 1Password,
        Authy i Bitwardenem.
      </p>

      {chyba && (
        <p className="mt-4 rounded-xl bg-[var(--wm-red-light)] p-3 text-[13.5px] font-medium text-[var(--wm-invalid-fg)]">
          {chyba}
        </p>
      )}

      {/* ---- hotové záložní kódy ---- */}
      {faze === "kody" && (
        <div className="mt-5 rounded-xl border-2 border-[var(--wm-brand)] p-5">
          <h3 className="text-[15px] font-bold">Ulož si záložní kódy</h3>
          <p className="mt-1 text-[13.5px] leading-relaxed text-[var(--wm-text-2)]">
            Tohle je jediná chvíle, kdy je vidíš. Každý platí jednou a slouží pro
            případ, že přijdeš o telefon. Ulož si je někam mimo tento počítač.
          </p>
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-5">
            {zalozni.map((k) => (
              <code
                key={k}
                className="rounded-lg bg-[var(--wm-surface-2)] px-2 py-2 text-center text-[13px] tracking-wide"
              >
                {k}
              </code>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void navigator.clipboard.writeText(zalozni.join("\n"))}
              className="diag-press inline-flex h-10 items-center rounded-full border border-[var(--wm-border)] bg-[var(--wm-surface)] px-4 text-[13px] font-semibold"
            >
              Zkopírovat
            </button>
            <button
              type="button"
              onClick={() => setFaze("prehled")}
              className="diag-press inline-flex h-10 items-center rounded-full bg-[var(--wm-brand)] px-4 text-[13px] font-semibold text-[var(--wm-brand-fg)]"
            >
              Mám je uložené
            </button>
          </div>
        </div>
      )}

      {/* ---- probíhající nastavení ---- */}
      {faze === "nastavuji" && (
        <div className="mt-5 rounded-xl bg-[var(--wm-surface-2)] p-5">
          <h3 className="text-[15px] font-bold">1. Přidej účet do aplikace</h3>
          <p className="mt-1 text-[13.5px] leading-relaxed text-[var(--wm-text-2)]">
            V autentizační aplikaci zvol přidání účtu ručním zadáním klíče
            a opiš tenhle řetězec. Typ je časový (TOTP), šest číslic, 30 sekund.
          </p>
          <code className="mt-3 block break-all rounded-lg bg-[var(--wm-surface)] p-3 text-[14px] tracking-wider">
            {secret}
          </code>
          <button
            type="button"
            onClick={() => void navigator.clipboard.writeText(secret)}
            className="diag-press mt-2 inline-flex h-9 items-center rounded-full border border-[var(--wm-border)] bg-[var(--wm-surface)] px-4 text-[13px] font-semibold"
          >
            Zkopírovat klíč
          </button>
          <p className="mt-2 break-all text-[11.5px] leading-relaxed text-[var(--wm-text-3)]">
            Kdo umí načíst odkaz otpauth, může použít i tenhle: {uri}
          </p>

          <h3 className="mt-5 text-[15px] font-bold">2. Opiš první kód</h3>
          <p className="mt-1 text-[13.5px] leading-relaxed text-[var(--wm-text-2)]">
            Tím se ověří, že aplikace i server počítají stejně. Dokud kód
            nesedí, zůstává přihlašování beze změny.
          </p>
          <div className="mt-3 flex flex-wrap items-end gap-3">
            <label className="block">
              <span className="mb-1.5 block text-[13px] font-medium text-[var(--wm-text-2)]">
                Kód z aplikace
              </span>
              <input
                className="diag-input tracking-[0.3em]"
                inputMode="numeric"
                placeholder="123456"
                value={kod}
                onChange={(e) => setKod(e.target.value)}
              />
            </label>
            <button
              type="button"
              disabled={pracuje || kod.trim().length < 6}
              onClick={() => void potvrd()}
              className="diag-press inline-flex h-11 items-center rounded-full bg-[var(--wm-brand)] px-5 text-[14px] font-semibold text-[var(--wm-brand-fg)] disabled:opacity-40"
            >
              Ověřit a zapnout
            </button>
            <button
              type="button"
              onClick={() => setFaze("prehled")}
              className="text-[13.5px] font-semibold text-[var(--wm-text-2)] hover:text-[var(--wm-text)]"
            >
              Zrušit
            </button>
          </div>
        </div>
      )}

      {/* ---- přehled ---- */}
      {faze === "prehled" &&
        (aktivni ? (
          <div className="mt-5">
            <p className="text-[14px] font-semibold text-[var(--wm-ok-fg)]">
              Druhý faktor je zapnutý.
            </p>
            <p className="mt-1 text-[13.5px] text-[var(--wm-text-2)]">
              {zbyvaKodu === 1
                ? "Zbývá jeden nepoužitý záložní kód."
                : zbyvaKodu >= 2 && zbyvaKodu <= 4
                  ? `Zbývají ${zbyvaKodu} nepoužité záložní kódy.`
                  : `Zbývá ${zbyvaKodu} nepoužitých záložních kódů.`}{" "}
              Když dojdou nebo se ztratí, vypni druhý faktor a zapni ho znovu;
              dostaneš nové.
            </p>
            <div className="mt-4 flex flex-wrap items-end gap-3">
              <label className="block">
                <span className="mb-1.5 block text-[13px] font-medium text-[var(--wm-text-2)]">
                  Heslo pro vypnutí
                </span>
                <input
                  type="password"
                  className="diag-input"
                  value={heslo}
                  onChange={(e) => setHeslo(e.target.value)}
                />
              </label>
              <button
                type="button"
                disabled={pracuje || heslo.length === 0}
                onClick={() => void vypni()}
                className="diag-press inline-flex h-11 items-center rounded-full border border-[var(--wm-border)] bg-[var(--wm-surface)] px-5 text-[14px] font-semibold text-[var(--wm-text-2)] hover:text-[var(--wm-red)] disabled:opacity-40"
              >
                Vypnout druhý faktor
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-5">
            <p className="text-[14px] text-[var(--wm-text-2)]">
              Zatím je vypnutý. U účtu, který vidí psychologické profily klientů,
              stojí za to ho mít.
            </p>
            <button
              type="button"
              disabled={pracuje}
              onClick={() => void zacni()}
              className="diag-press mt-4 inline-flex h-11 items-center rounded-full bg-[var(--wm-brand)] px-5 text-[14px] font-semibold text-[var(--wm-brand-fg)] disabled:opacity-40"
            >
              Zapnout druhý faktor
            </button>
          </div>
        ))}

      <p className="mt-5 border-t border-[var(--wm-border-light)] pt-4 text-[12.5px] leading-relaxed text-[var(--wm-text-3)]">
        Když přijdeš o telefon i o záložní kódy, požádej mastera o nové heslo:
        reset hesla druhý faktor vypne a můžeš si ho nastavit znovu.
      </p>
    </div>
  )
}
