"use client"

import { use, useEffect, useMemo, useRef, useState } from "react"
import { LangToggle } from "@/components/diagnostic/lang-toggle"
import { SCALE_LABELS, TEST_NAMES, UI } from "@/lib/diagnostic/i18n"
import { getItems, itemText } from "@/lib/diagnostic/items"
import { getStructure, parseTestId } from "@/lib/diagnostic/structure"
import { loadSession, newSession, saveSession } from "@/lib/diagnostic/storage"
import { fetchInvite, isRemoteEnabled, submitWithInvite, type Invite } from "@/lib/diagnostic/remote"
import type { Answer, Lang, StoredSession, TestId } from "@/lib/diagnostic/types"

const BLOCK_SIZE = 20

// Dotazník se otevře pouze na platnou pozvánku od kouče. Token v odkazu určuje,
// který test se zobrazí — klient se tak nedostane k jiným diagnostikám ani nemůže
// vyplnit tentýž test dvakrát.
export default function InvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params)
  const [invite, setInvite] = useState<Invite | null | "error">(null)

  useEffect(() => {
    if (!isRemoteEnabled()) {
      setInvite("error")
      return
    }
    let active = true
    fetchInvite(token)
      .then((i) => active && setInvite(i))
      .catch(() => active && setInvite("error"))
    return () => {
      active = false
    }
  }, [token])

  if (invite === null) return null
  if (invite === "error" || invite.status === "notfound") return <InviteProblem kind="invalid" />
  if (invite.status === "used") return <InviteProblem kind="used" />

  return (
    <Questionnaire
      token={token}
      testId={invite.testId as TestId}
      inviteLang={(invite.lang as Lang) ?? "cs"}
      clientName={invite.clientName ?? ""}
    />
  )
}

/** Neplatný nebo už použitý odkaz — srozumitelně, dvojjazyčně. */
function InviteProblem({ kind }: { kind: "invalid" | "used" }) {
  return (
    <div className="diag-container flex min-h-screen items-center justify-center py-20">
      <div className="diag-card max-w-md p-8 text-center">
        <p className="text-[12px] font-bold tracking-[0.18em] text-[var(--wm-text-3)]">WINNING MINDS</p>
        <h1 className="mt-3 text-[20px] font-bold tracking-tight">
          {kind === "used" ? "Tento odkaz už byl použit" : "Odkaz není platný"}
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-[var(--wm-text-2)]">
          {kind === "used"
            ? "Dotazník z tohoto odkazu už byl vyplněn a odeslán. Pokud potřebuješ vyplnit další, požádej svého kouče o nový odkaz."
            : "Odkaz je neplatný nebo byl zrušen. Požádej prosím svého kouče o nový."}
        </p>
        <p className="mt-4 border-t border-[var(--wm-border-light)] pt-4 text-[13px] leading-relaxed text-[var(--wm-text-3)]">
          {kind === "used"
            ? "This link has already been used. Please ask your coach for a new one."
            : "This link is not valid or has been revoked. Please ask your coach for a new one."}
        </p>
      </div>
    </div>
  )
}

function Questionnaire({
  token,
  testId,
  inviteLang,
  clientName,
}: {
  token: string
  testId: TestId
  inviteLang: Lang
  clientName: string
}) {
  const { model, variant } = parseTestId(testId)!
  const structure = useMemo(() => getStructure(model), [model])
  const items = useMemo(() => getItems(testId), [testId])

  const [session, setSession] = useState<StoredSession | null>(null)
  const [stage, setStage] = useState<"intro" | "items" | "sent" | "sendFailed">("intro")
  const [block, setBlock] = useState(0)
  const [showMissing, setShowMissing] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const topRef = useRef<HTMLDivElement>(null)

  // Rozpracované odpovědi se drží pod tokenem — klient si může dát pauzu
  // a vrátit se ke stejnému odkazu.
  useEffect(() => {
    const existing = loadSession(token)
    if (existing) {
      setSession({ ...existing, lang: inviteLang })
      return
    }
    const fresh = newSession(testId, inviteLang)
    setSession({ ...fresh, person: { ...fresh.person, name: clientName } })
  }, [token, testId, inviteLang, clientName])

  // autosave
  useEffect(() => {
    if (session) saveSession(token, session)
  }, [token, session])

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
    saveSession(token, done)

    // Odeslání kouči proti pozvánce. Respondent výsledky nevidí — projde je
    // s ním kouč osobně, proto se po odeslání zobrazuje jen potvrzení.
    setSubmitting(true)
    const ok = isRemoteEnabled() ? await submitWithInvite(token, done) : false
    setSubmitting(false)
    setStage(ok ? "sent" : "sendFailed")
    requestAnimationFrame(() => topRef.current?.scrollIntoView({ behavior: "smooth" }))
  }

  /** Záloha odpovědí pro případ, že se odeslání nepodaří. */
  const downloadBackup = () => {
    const blob = new Blob([JSON.stringify(session, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${testId}-${session.person.name.replace(/\s+/g, "-") || "odpovedi"}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div ref={topRef}>
      {/* horní lišta */}
      <div className="sticky top-0 z-10 border-b border-[var(--wm-border-light)] bg-[var(--wm-glass)] backdrop-blur-xl">
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
              {/*
                Respondent má vědět, že se z jeho odpovědí ukládá anonymní kopie
                pro rozvoj metody. Bez toho by to byl skrytý sběr dat, i když se
                záznam zpět k člověku dohledat nedá.
              */}
              <p className="mt-5 rounded-xl bg-[var(--wm-surface-2)] p-4 text-[13px] leading-relaxed text-[var(--wm-text-2)]">
                {t.dataNote}
              </p>
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
              className="diag-press mx-auto inline-flex h-12 items-center justify-center rounded-full bg-[var(--wm-brand)] px-10 text-[16px] font-semibold text-[var(--wm-brand-fg)] transition-opacity hover:opacity-85 disabled:opacity-35"
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
              {blockItems.map((item, i) => {
                const value = session.answers[item.id]
                const missed = showMissing && value === undefined
                return (
                  <div
                    key={item.id}
                    id={`item-${item.id}`}
                    className="diag-card diag-item diag-enter p-5 sm:p-6"
                    data-answered={value !== undefined}
                    style={{
                      ...(missed ? { borderColor: "var(--wm-red)" } : {}),
                      animationDelay: `${Math.min(i * 30, 240)}ms`,
                    }}
                  >
                    <p className="text-[15px] leading-relaxed">
                      <span className="mr-2 font-semibold tabular-nums text-[var(--wm-text-3)]">{item.id}</span>
                      {itemText(item, lang)}
                    </p>

                    <div className="mt-5">
                      <div className="diag-scale-row" role="radiogroup" aria-label={itemText(item, lang)}>
                        {([1, 2, 3, 4, 5] as Answer[]).map((v) => (
                          <button
                            key={v}
                            type="button"
                            className="diag-scale-btn"
                            data-selected={value === v}
                            role="radio"
                            aria-checked={value === v}
                            aria-label={`${v} — ${scale[v]}`}
                            onClick={() => setAnswer(item.id, v)}
                          >
                            {v}
                          </button>
                        ))}
                      </div>
                      {/* Popisek se mění podle výběru — drží řádek symetrický
                          a zároveň dává okamžitou zpětnou vazbu. */}
                      <p className="diag-scale-caption" data-selected={value !== undefined}>
                        {value !== undefined ? scale[value] : `1 · ${scale[1]}   —   5 · ${scale[5]}`}
                      </p>
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
                className="diag-press inline-flex h-11 items-center rounded-full border border-[var(--wm-border)] bg-[var(--wm-surface)] px-6 text-[15px] font-semibold text-[var(--wm-text)] transition-colors hover:bg-[var(--wm-fill-4)]"
              >
                {t.back}
              </button>
              {block < blocks - 1 ? (
                <button
                  type="button"
                  onClick={() => goToBlock(block + 1)}
                  className="diag-press inline-flex h-11 items-center rounded-full bg-[var(--wm-brand)] px-8 text-[15px] font-semibold text-[var(--wm-brand-fg)] transition-opacity hover:opacity-85"
                >
                  {t.next}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={finish}
                  disabled={submitting}
                  className="diag-press inline-flex h-11 items-center rounded-full bg-[var(--wm-blue)] px-8 text-[15px] font-semibold text-white transition-opacity hover:opacity-85 disabled:opacity-50"
                >
                  {submitting ? "…" : t.finish}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Odesláno. Respondent zde záměrně nevidí žádné výsledky — vyhodnocení
            s ním prochází kouč osobně. */}
        {stage === "sent" && (
          <section className="diag-card mt-8 p-8 text-center">
            <div
              className="mx-auto flex h-14 w-14 items-center justify-center rounded-full"
              style={{ background: "var(--wm-green-light)" }}
              aria-hidden="true"
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--wm-green)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6 9 17l-5-5" />
              </svg>
            </div>
            <h2 className="mt-5 text-[22px] font-bold tracking-tight">{t.sentTitle}</h2>
            <p className="mx-auto mt-3 max-w-lg text-[15px] leading-relaxed text-[var(--wm-text-2)]">{t.sentBody}</p>
          </section>
        )}

        {/* Odeslání selhalo — ať respondent nepřijde o hodinu práce. */}
        {stage === "sendFailed" && (
          <section className="diag-card mt-8 p-8 text-center" style={{ borderColor: "var(--wm-orange)" }}>
            <h2 className="text-[20px] font-bold tracking-tight text-[var(--wm-caution-fg)]">
              {t.sentSaveFailedTitle}
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-[15px] leading-relaxed text-[var(--wm-text-2)]">
              {t.sentSaveFailedBody}
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={finish}
                disabled={submitting}
                className="diag-press inline-flex h-11 items-center rounded-full bg-[var(--wm-brand)] px-8 text-[15px] font-semibold text-[var(--wm-brand-fg)] transition-opacity hover:opacity-85 disabled:opacity-50"
              >
                {submitting ? "…" : t.finish}
              </button>
              <button
                type="button"
                onClick={downloadBackup}
                className="diag-press inline-flex h-11 items-center rounded-full border border-[var(--wm-border)] bg-[var(--wm-surface)] px-6 text-[15px] font-semibold text-[var(--wm-text)] transition-colors hover:bg-[var(--wm-fill-4)]"
              >
                {t.downloadBackup}
              </button>
            </div>
          </section>
        )}

        <footer className="mt-14 border-t border-[var(--wm-border-light)] pt-6 text-center text-[12px] text-[var(--wm-text-3)]">
          {t.confidential}
        </footer>
      </div>
    </div>
  )
}
