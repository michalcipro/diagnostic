"use client"

import { use, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { LangToggle } from "@/components/diagnostic/lang-toggle"
import { BandChip, ScoreRow } from "@/components/diagnostic/score-visuals"
import { getDimensionContent, getFacetContent, vt } from "@/lib/diagnostic/content"
import { BAND_DESCRIPTIONS, TEST_NAMES, UI } from "@/lib/diagnostic/i18n"
import { evaluate } from "@/lib/diagnostic/scoring"
import { getStructure, parseTestId } from "@/lib/diagnostic/structure"
import { loadSession } from "@/lib/diagnostic/storage"
import { fetchFromRemote, isRemoteEnabled } from "@/lib/diagnostic/remote"
import type {
  DiagnosticResult,
  DimensionScore,
  Lang,
  StoredSession,
  TestId,
  ValidityStatus,
  Variant,
} from "@/lib/diagnostic/types"

export default function ReportPage({ params }: { params: Promise<{ testId: string }> }) {
  const { testId } = use(params)
  const parsed = parseTestId(testId)
  if (!parsed) return <Missing lang="cs" />
  return <Report testId={testId as TestId} variant={parsed.variant} />
}

function Missing({ lang }: { lang: Lang }) {
  const t = UI[lang]
  return (
    <div className="diag-container py-24 text-center">
      <p className="text-[17px] text-[var(--wm-text-2)]">{t.notFound}</p>
      <Link href="/" className="mt-4 inline-block text-[15px] font-semibold text-[var(--wm-blue)]">
        {t.goHome}
      </Link>
    </div>
  )
}

const STATUS_STYLE: Record<ValidityStatus, { color: string; bg: string }> = {
  ok: { color: "#248a3d", bg: "var(--wm-green-light, #E8F9ED)" },
  caution: { color: "#c93400", bg: "var(--wm-orange-light, #FFF5E6)" },
  invalid: { color: "#d70015", bg: "var(--wm-red-light, #FFF1F0)" },
}

function StatusChip({ status, lang }: { status: ValidityStatus; lang: Lang }) {
  const t = UI[lang]
  const label =
    status === "ok" ? t.validityStatusOk : status === "caution" ? t.validityStatusCaution : t.validityStatusInvalid
  const s = STATUS_STYLE[status]
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[12px] font-semibold"
      style={{ color: s.color, background: s.bg }}
    >
      {label}
    </span>
  )
}

function Report({ testId, variant }: { testId: TestId; variant: Variant }) {
  const [session, setSession] = useState<StoredSession | null | undefined>(undefined)
  const [lang, setLang] = useState<Lang>("cs")
  const [publicId, setPublicId] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const r = new URLSearchParams(window.location.search).get("r")
    if (r && isRemoteEnabled()) {
      let active = true
      fetchFromRemote(r).then((res) => {
        if (!active) return
        if (res) {
          setPublicId(res.publicId)
          const iso = new Date(res.createdAt).toISOString()
          setSession({
            testId: res.testId,
            lang: res.lang,
            person: res.person,
            answers: res.answers,
            startedAt: iso,
            finishedAt: iso,
          })
          setLang(res.lang)
        } else {
          const local = loadSession(testId)
          setSession(local)
          if (local) setLang(local.lang)
        }
      })
      return () => {
        active = false
      }
    }
    const s = loadSession(testId)
    setSession(s)
    if (s) setLang(s.lang)
  }, [testId])

  const copyShareLink = () => {
    if (!publicId) return
    const url = `${window.location.origin}/${testId}/report?r=${publicId}`
    void navigator.clipboard?.writeText(url).then(() => {
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    })
  }

  const structure = useMemo(() => getStructure(parseTestId(testId)!.model), [testId])
  const result: DiagnosticResult | null = useMemo(
    () => (session && Object.keys(session.answers).length > 0 ? evaluate(structure, session.answers) : null),
    [session, structure],
  )

  if (session === undefined) return null
  if (!session || !result) return <Missing lang={lang} />

  const t = UI[lang]
  const v = result.validity

  const exportJson = () => {
    const blob = new Blob([JSON.stringify({ session, result }, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${testId}-${session.person.name.replace(/\s+/g, "-") || "report"}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="diag-container pb-20 pt-8">
      {/* ovládání (netiskne se) */}
      <div className="diag-no-print mb-6 flex flex-wrap items-center justify-between gap-3">
        {/* Značka záměrně není odkaz — klient vidí jen své vyhodnocení. */}
        <span className="text-[12px] font-bold tracking-[0.18em] text-[var(--wm-text)]">{t.brand}</span>
        <div className="flex items-center gap-2">
          <LangToggle lang={lang} onChange={setLang} />
          {publicId && (
            <button
              type="button"
              onClick={copyShareLink}
              className="inline-flex h-9 items-center rounded-full border border-[var(--wm-border)] bg-white px-4 text-[13px] font-semibold transition-colors hover:bg-[var(--wm-fill-4)]"
            >
              {copied ? (lang === "cs" ? "Zkopírováno ✓" : "Copied ✓") : lang === "cs" ? "Kopírovat odkaz" : "Copy link"}
            </button>
          )}
          <button
            type="button"
            onClick={exportJson}
            className="inline-flex h-9 items-center rounded-full border border-[var(--wm-border)] bg-white px-4 text-[13px] font-semibold transition-colors hover:bg-[var(--wm-fill-4)]"
          >
            JSON
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex h-9 items-center rounded-full bg-[var(--wm-brand)] px-4 text-[13px] font-semibold text-white transition-opacity hover:opacity-85"
          >
            {t.printButton}
          </button>
        </div>
      </div>

      {/* hlavička reportu */}
      <header className="diag-card p-7">
        <p className="text-[12px] font-bold tracking-[0.18em] text-[var(--wm-text-3)]">{t.brand}</p>
        <h1 className="mt-2 text-[28px] font-bold leading-tight tracking-tight">
          {TEST_NAMES[testId][lang]} · {t.reportTitle}
        </h1>
        <p className="mt-1 text-[15px] text-[var(--wm-text-2)]">{t.reportSubtitle}</p>
        <div className="mt-5 grid gap-x-8 gap-y-2 border-t border-[var(--wm-border-light)] pt-4 text-[14px] sm:grid-cols-2">
          <div className="flex justify-between gap-4 sm:justify-start">
            <span className="text-[var(--wm-text-3)]">{t.personLabel}</span>
            <span className="font-semibold">{session.person.name || "—"}</span>
          </div>
          <div className="flex justify-between gap-4 sm:justify-start">
            <span className="text-[var(--wm-text-3)]">{t.filledLabel}</span>
            <span className="font-semibold">{session.person.fillDate}</span>
          </div>
          {session.person.role && (
            <div className="flex justify-between gap-4 sm:justify-start">
              <span className="text-[var(--wm-text-3)]">
                {variant === "sport" ? t.roleLabelSport : t.roleLabelBusiness}
              </span>
              <span className="font-semibold">{session.person.role}</span>
            </div>
          )}
          {session.person.birthDate && (
            <div className="flex justify-between gap-4 sm:justify-start">
              <span className="text-[var(--wm-text-3)]">{t.birthLabel}</span>
              <span className="font-semibold">{session.person.birthDate}</span>
            </div>
          )}
        </div>
      </header>

      {!result.complete && (
        <div className="mt-4 rounded-2xl border border-[var(--wm-orange)] bg-[var(--wm-orange-light)] p-4 text-[14px] font-medium text-[#c93400]">
          {t.incompleteWarning(result.answeredCount, structure.itemCount)}
        </div>
      )}

      {/* validita */}
      <section className="diag-card mt-5 p-7">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-[18px] font-bold tracking-tight">{t.validityTitle}</h2>
          <StatusChip status={v.overall} lang={lang} />
        </div>
        <p
          className="mt-3 rounded-xl p-4 text-[14px] leading-relaxed"
          style={{ background: STATUS_STYLE[v.overall].bg, color: STATUS_STYLE[v.overall].color }}
        >
          {v.overall === "ok" ? t.validityOkNote : v.overall === "caution" ? t.validityCautionNote : t.validityInvalidNote}
        </p>
        <div className="mt-4 grid gap-2 text-[14px]">
          <div className="flex items-center justify-between gap-3 border-b border-[var(--wm-border-light)] pb-2">
            <span>
              {t.validityAttention}
              <span className="ml-2 text-[13px] text-[var(--wm-text-3)]">
                {v.attention.total - v.attention.errors}/{v.attention.total}
              </span>
            </span>
            <StatusChip status={v.attention.status} lang={lang} />
          </div>
          {v.infrequency && (
            <div className="flex items-center justify-between gap-3 border-b border-[var(--wm-border-light)] pb-2">
              <span>
                {t.validityInfrequency}
                <span className="ml-2 text-[13px] text-[var(--wm-text-3)]">{v.infrequency.signals} ×</span>
              </span>
              <StatusChip status={v.infrequency.status} lang={lang} />
            </div>
          )}
          <div className="flex items-center justify-between gap-3 border-b border-[var(--wm-border-light)] pb-2">
            <span>
              {t.validityConsistency}
              <span className="ml-2 text-[13px] text-[var(--wm-text-3)]">Ø {v.consistency.meanDiff.toFixed(2)}</span>
            </span>
            <StatusChip status={v.consistency.status} lang={lang} />
          </div>
          <div className="flex items-center justify-between gap-3 border-b border-[var(--wm-border-light)] pb-2">
            <span>
              {t.validityHonesty}
              <span className="ml-2 text-[13px] text-[var(--wm-text-3)]">
                {v.honesty.score} ({v.honesty.min}–{v.honesty.max})
              </span>
            </span>
            <StatusChip status={v.honesty.status} lang={lang} />
          </div>
          <div className="flex items-center justify-between gap-3">
            <span>
              {t.validityStyle}
              <span className="ml-2 text-[13px] text-[var(--wm-text-3)]">
                4–5: {v.responseStyle.agreePct} % · 1–2: {v.responseStyle.disagreePct} % · 1/5: {v.responseStyle.extremePct} %
              </span>
            </span>
            <StatusChip status={v.responseStyle.status} lang={lang} />
          </div>
        </div>
      </section>

      {/* přehled profilu */}
      <section className="diag-card mt-5 p-7">
        <h2 className="text-[18px] font-bold tracking-tight">{t.profileOverview}</h2>
        <div className="mt-3 divide-y divide-[var(--wm-border-light)]">
          {result.dimensions.map((d) => (
            <ScoreRow
              key={d.id}
              label={getDimensionContent(d.id).name[lang]}
              raw={d.raw}
              min={d.min}
              max={d.max}
              percent={d.percent}
              band={d.band}
              lang={lang}
            />
          ))}
        </div>
        {result.imbalanced && (
          <p className="mt-3 rounded-xl bg-[var(--wm-orange-light)] p-3 text-[13px] font-medium text-[#c93400]">
            {t.imbalanceNote}
          </p>
        )}
      </section>

      {/* opěrné body a priority */}
      <section className="mt-5 grid gap-5 sm:grid-cols-2">
        <div className="diag-card p-6">
          <h3 className="text-[16px] font-bold tracking-tight">{t.strengthsTitle}</h3>
          <div className="mt-3 flex flex-col gap-3">
            {result.strongest.map((s) => (
              <div key={s.id} className="flex items-center justify-between gap-3">
                <span className="text-[14px] font-medium">
                  {s.id.length === 1
                    ? getDimensionContent(s.id as DimensionScore["id"]).name[lang]
                    : getFacetContent(s.id)?.name[lang] ?? s.id}
                </span>
                <span className="flex items-center gap-2">
                  <span className="text-[13px] text-[var(--wm-text-3)]">{s.raw}/{s.max}</span>
                  <BandChip band={s.band} lang={lang} />
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="diag-card p-6">
          <h3 className="text-[16px] font-bold tracking-tight">{t.prioritiesTitle}</h3>
          <div className="mt-3 flex flex-col gap-3">
            {result.weakest.map((s) => (
              <div key={s.id} className="flex items-center justify-between gap-3">
                <span className="text-[14px] font-medium">
                  {s.id.length === 1
                    ? getDimensionContent(s.id as DimensionScore["id"]).name[lang]
                    : getFacetContent(s.id)?.name[lang] ?? s.id}
                </span>
                <span className="flex items-center gap-2">
                  <span className="text-[13px] text-[var(--wm-text-3)]">{s.raw}/{s.max}</span>
                  <BandChip band={s.band} lang={lang} />
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* narativ po dimenzích */}
      <section className="mt-8 diag-print-break">
        <h2 className="mb-4 text-[22px] font-bold tracking-tight">{t.dimensionsTitle}</h2>
        <div className="flex flex-col gap-5">
          {result.dimensions.map((d) => {
            const content = getDimensionContent(d.id)
            return (
              <article key={d.id} className="diag-card p-7">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="text-[19px] font-bold tracking-tight">{content.name[lang]}</h3>
                    <p className="mt-1 text-[13px] text-[var(--wm-text-2)]">{vt(content.tagline, variant, lang)}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-[22px] font-bold tabular-nums">{d.raw}</div>
                    <div className="text-[12px] text-[var(--wm-text-3)]">
                      {d.min}–{d.max} · {d.percent} %
                    </div>
                  </div>
                </div>
                <div className="mt-3">
                  <ScoreRow
                    label={BAND_DESCRIPTIONS[lang][d.band]}
                    raw={d.raw}
                    min={d.min}
                    max={d.max}
                    percent={d.percent}
                    band={d.band}
                    lang={lang}
                    compact
                  />
                </div>
                <p className="mt-3 text-[14.5px] leading-relaxed text-[var(--wm-text)]">
                  {vt(content.bands[d.band], variant, lang)}
                </p>

                {d.heterogeneous && (
                  <p className="mt-3 rounded-xl bg-[var(--wm-orange-light)] p-3 text-[13px] font-medium text-[#c93400]">
                    {t.heterogeneityNote}
                  </p>
                )}

                {d.facets && (
                  <div className="mt-5 border-t border-[var(--wm-border-light)] pt-4">
                    <h4 className="mb-1 text-[12px] font-semibold uppercase tracking-[0.1em] text-[var(--wm-text-3)]">
                      {t.facetProfile}
                    </h4>
                    {d.facets.map((f) => {
                      const fc = getFacetContent(f.id)
                      if (!fc) return null
                      return (
                        <div key={f.id} className="border-b border-[var(--wm-border-light)] py-3 last:border-b-0">
                          <ScoreRow
                            label={fc.name[lang]}
                            raw={f.raw}
                            min={f.min}
                            max={f.max}
                            percent={f.percent}
                            band={f.band}
                            lang={lang}
                            compact
                          />
                          <p className="mt-1.5 text-[13.5px] leading-relaxed text-[var(--wm-text-2)]">
                            {vt(fc.bands[f.band], variant, lang)}
                          </p>
                        </div>
                      )
                    })}
                  </div>
                )}
              </article>
            )
          })}
        </div>
      </section>

      {/* rozvojová doporučení */}
      <section className="diag-card mt-8 p-7 diag-print-break">
        <h2 className="text-[18px] font-bold tracking-tight">{t.developmentTitle}</h2>
        <p className="mt-2 text-[14px] leading-relaxed text-[var(--wm-text-2)]">{t.developmentIntro}</p>
        <div className="mt-4 flex flex-col gap-5">
          {result.weakest.map((s, i) => {
            const isDim = s.id.length === 1
            const name = isDim
              ? getDimensionContent(s.id as DimensionScore["id"]).name[lang]
              : getFacetContent(s.id)?.name[lang] ?? s.id
            const development = isDim
              ? undefined
              : getFacetContent(s.id)?.development
            const fallbackBand = isDim
              ? getDimensionContent(s.id as DimensionScore["id"]).bands[s.band]
              : undefined
            return (
              <div key={s.id} className="rounded-2xl bg-[var(--wm-surface-2)] p-5">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-[15px] font-semibold">
                    {i + 1}. {name}
                  </h3>
                  <BandChip band={s.band} lang={lang} />
                </div>
                <p className="mt-2 text-[14px] leading-relaxed text-[var(--wm-text)]">
                  {development ? vt(development, variant, lang) : fallbackBand ? vt(fallbackBand, variant, lang) : ""}
                </p>
              </div>
            )
          })}
        </div>
      </section>

      {/* závěr */}
      <section className="mt-6 flex flex-col gap-3 text-[13px] leading-relaxed text-[var(--wm-text-2)]">
        <p>{t.retestNote}</p>
        <p>{t.disclaimer}</p>
      </section>

      <footer className="mt-10 border-t border-[var(--wm-border-light)] pt-6 text-center text-[12px] text-[var(--wm-text-3)]">
        {t.confidential}
      </footer>
    </div>
  )
}
