"use client"

import { applyGender } from "@/lib/diagnostic/gender"
import type { Gender, Lang } from "@/lib/diagnostic/types"
import { NAZVY_METRIK, NAZVY_REFLEXE, UI, cislo } from "@/lib/planner/i18n"
import { RatingInput } from "./rating-input"
import { AutoTextarea } from "./auto-textarea"
import {
  HODINY,
  METRIKY,
  REFLEXE,
  ROZSAH,
  type MetricKey,
  type PlannerDay,
  type PlannerHabit,
  type ReflectionKey,
} from "@/lib/planner/types"
import { NAZVY_DNU, dlouheDatum, indexDne } from "@/lib/planner/datum"

// Denní pohled.
//
// Týdenní mřížka je věrná papíru, ale na telefonu se do sedmi sloupců
// textových polí psát nedá. Tohle je tentýž obsah pro jeden den pod sebou:
// stejná políčka, stejná data, jen jinak poskládaná. Nic tu nepřibývá ani
// nechybí, takže se list a den nemůžou rozejít.

export interface DayBoardProps {
  lang: Lang
  gender: Gender
  datum: string
  dnesniDatum: string
  den: PlannerDay | undefined
  navyky: PlannerHabit[]
  onRozvrh: (datum: string, hodina: number, text: string) => void
  onHodnoceni: (datum: string, metrika: MetricKey, hodnota: number | null) => void
  onReflexe: (datum: string, klic: ReflectionKey, text: string) => void
  onNavyk: (datum: string, habitId: string, splneno: boolean) => void
  onFlush: () => void
}

function popisHodiny(h: number): string {
  return `${String(h).padStart(2, "0")}:00`
}

/** Řada tlačítek 1 až 10. Na dotykovém displeji se trefí líp než číselník. */
function Skala({
  hodnota,
  onZmena,
  popis,
}: {
  hodnota: number | undefined
  onZmena: (v: number | null) => void
  popis: string
}) {
  return (
    <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
      {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => {
        const vybrano = hodnota === n
        return (
          <button
            key={n}
            type="button"
            className="pl-btn"
            aria-label={`${popis} ${n}`}
            aria-pressed={vybrano}
            onClick={() => onZmena(vybrano ? null : n)}
            style={{
              minWidth: 34,
              padding: "6px 0",
              textAlign: "center",
              fontVariantNumeric: "tabular-nums",
              background: vybrano ? "var(--wm-brand)" : "var(--wm-surface)",
              color: vybrano ? "var(--wm-brand-fg)" : "var(--wm-text-2)",
              borderColor: vybrano ? "var(--wm-brand)" : "var(--wm-border-light)",
            }}
          >
            {n}
          </button>
        )
      })}
    </div>
  )
}

export function DayBoard(props: DayBoardProps) {
  const { lang, gender, datum, dnesniDatum, den, navyky } = props
  const t = UI[lang]
  const budoucnost = datum > dnesniDatum
  const viditelneNavyky = navyky.filter(
    (h) => !h.archivedAt || (den?.habits.includes(h.id) ?? false),
  )

  return (
    <div className="pl-sheet">
      <div className="pl-sheet-head">
        <div>
          <div className="pl-sheet-eyebrow">{NAZVY_DNU[lang][indexDne(datum)]}</div>
          <h2 className="pl-sheet-title">{dlouheDatum(datum, lang)}</h2>
        </div>
        {datum === dnesniDatum && (
          <div className="pl-delta" data-dir="flat" style={{ color: "var(--wm-blue)" }}>
            {t.dnes}
          </div>
        )}
      </div>

      {/* Návyky */}
      <div className="pl-section-title">{t.habitTracker}</div>
      <div className="pl-box" style={{ padding: "4px 0" }}>
        {viditelneNavyky.length === 0 && (
          <p className="pl-note" style={{ padding: "10px 12px", margin: 0 }}>
            {t.zadneNavyky}
          </p>
        )}
        {viditelneNavyky.map((h) => {
          const splneno = den?.habits.includes(h.id) ?? false
          return (
            <button
              key={h.id}
              type="button"
              disabled={budoucnost}
              onClick={() => props.onNavyk(datum, h.id, !splneno)}
              aria-pressed={splneno}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                width: "100%",
                padding: "10px 12px",
                border: "none",
                borderBottom: "1px solid var(--wm-border-light)",
                background: "transparent",
                color: "var(--wm-text)",
                font: "inherit",
                fontSize: 14,
                textAlign: "left",
                cursor: budoucnost ? "default" : "pointer",
                opacity: budoucnost ? 0.45 : 1,
              }}
            >
              <span className="pl-dot" data-done={splneno} style={{ margin: 0, flex: "none" }} />
              <span style={{ flex: 1 }}>{h.name}</span>
              {h.target ? (
                <span style={{ fontSize: 12, color: "var(--wm-text-3)" }}>{h.target}× / {lang === "en" ? "week" : "týden"}</span>
              ) : null}
            </button>
          )
        })}
      </div>

      {/* Denní postup */}
      <div className="pl-section-title">
        {t.dailyProgress}
        <span className="pl-section-hint">{t.dailyProgressHint}</span>
      </div>
      <div className="pl-box" style={{ padding: "10px 12px" }}>
        {METRIKY.map((m) => {
          const r = ROZSAH[m]
          const v = den?.ratings[m]
          return (
            <div key={m} style={{ marginBottom: 14 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                  marginBottom: 6,
                }}
              >
                <span style={{ fontSize: 13, fontWeight: 600 }}>{NAZVY_METRIK[lang][m]}</span>
                <span
                  style={{
                    fontSize: 13,
                    fontVariantNumeric: "tabular-nums",
                    color: "var(--wm-text-3)",
                  }}
                >
                  {typeof v === "number" ? cislo(v, lang, r.hodiny ? 1 : 0) : "–"}
                </span>
              </div>
              {r.hodiny ? (
                <RatingInput
                  hodnota={v}
                  rozsah={r}
                  lang={lang}
                  popis={NAZVY_METRIK[lang][m]}
                  trida="pl-input"
                  placeholder={`${r.min} \u2013 ${r.max}`}
                  onZmena={(x) => props.onHodnoceni(datum, m, x)}
                  onFlush={props.onFlush}
                />
              ) : (
                <Skala
                  hodnota={v}
                  popis={NAZVY_METRIK[lang][m]}
                  onZmena={(x) => props.onHodnoceni(datum, m, x)}
                />
              )}
            </div>
          )
        })}
      </div>

      {/* Reflexe */}
      <div className="pl-section-title">{t.dailyReflection}</div>
      <div className="pl-box" style={{ padding: "10px 12px" }}>
        {REFLEXE.map((klic) => (
          <div key={klic} style={{ marginBottom: 12 }}>
            <span className="pl-label">{applyGender(NAZVY_REFLEXE[lang][klic], gender)}</span>
            <AutoTextarea
              className="pl-input"
              minRows={2}
              value={den?.reflection[klic] ?? ""}
              onChange={(text) => props.onReflexe(datum, klic, text)}
              onBlur={props.onFlush}
              ariaLabel={applyGender(NAZVY_REFLEXE[lang][klic], gender)}
            />
          </div>
        ))}
      </div>

      {/* Rozvrh */}
      <div className="pl-section-title">{t.weeklySchedule}</div>
      <div className="pl-box">
        {HODINY.map((h) => (
          <div
            key={h}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              borderBottom: "1px solid var(--wm-border-light)",
            }}
          >
            <span
              style={{
                width: 56,
                flex: "none",
                padding: "0 8px",
                fontSize: 11.5,
                fontVariantNumeric: "tabular-nums",
                color: "var(--wm-text-3)",
              }}
            >
              {popisHodiny(h)}
            </span>
            <input
              className="pl-cell"
              style={{ fontSize: 14, padding: "10px 6px" }}
              value={den?.schedule.find((s) => s.hour === h)?.text ?? ""}
              onChange={(e) => props.onRozvrh(datum, h, e.target.value)}
              onBlur={props.onFlush}
              aria-label={popisHodiny(h)}
            />
          </div>
        ))}
      </div>

      <div className="pl-footer-motto">{t.motto}</div>
    </div>
  )
}
