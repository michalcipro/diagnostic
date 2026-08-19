"use client"

import { useEffect, useState } from "react"
import { applyGender } from "@/lib/diagnostic/gender"
import type { Gender, Lang } from "@/lib/diagnostic/types"
import { NAZVY_METRIK, NAZVY_REFLEXE, UI, cislo } from "@/lib/planner/i18n"
import { denniSkore } from "@/lib/planner/stats"
import { RatingInput } from "./rating-input"
import { AutoTextarea } from "./auto-textarea"
import { Prstenec, barvaPasma, pasmoSkore, usePocitadlo } from "./score-ring"
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

// Denní pohled, hlavní obrazovka deníku.
//
// Nahoře prstence: skóre dne, návyky a spánek na jeden pohled, stejná
// hierarchie, jakou mají Whoop a Oura. Pod nimi vstupy v pořadí, v jakém se
// den vyplňuje: hodnocení, návyky, reflexe a nakonec rozvrh. Jsou to tatáž
// políčka jako v týdenním listu, jen jinak poskládaná; nic tu nepřibývá ani
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

/**
 * Škála 1 až 10 jako řada čipů. Vybraný čip nese barvu svého pásma, takže
 * hodnocení je čitelné z dálky: rubín dole, jantar uprostřed, akcent nahoře.
 */
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
    <div className="pl-skala" role="group" aria-label={popis}>
      {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => {
        const vybrano = hodnota === n
        return (
          <button
            key={n}
            type="button"
            aria-label={`${popis} ${n}`}
            aria-pressed={vybrano}
            data-pasmo={pasmoSkore(n)}
            onClick={() => onZmena(vybrano ? null : n)}
          >
            {n}
          </button>
        )
      })}
    </div>
  )
}

/** Prstenec skóre s dopočítávaným číslem. */
function PrstenecSkore({
  skore,
  popisek,
  lang,
}: {
  skore: number | undefined
  popisek: string
  lang: Lang
}) {
  const bezi = usePocitadlo(skore ?? 0)
  return (
    <Prstenec
      podil={typeof skore === "number" ? skore / 10 : 0}
      barva={barvaPasma(pasmoSkore(skore))}
      stred={typeof skore === "number" ? cislo(bezi, lang, 1) : "–"}
      popisek={popisek}
    />
  )
}

export function DayBoard(props: DayBoardProps) {
  const { lang, gender, datum, dnesniDatum, den, navyky } = props
  const t = UI[lang]
  const budoucnost = datum > dnesniDatum
  const dnesek = datum === dnesniDatum

  const viditelneNavyky = navyky.filter(
    (h) => !h.archivedAt || (den?.habits.includes(h.id) ?? false),
  )
  const hotovo = viditelneNavyky.filter((h) => den?.habits.includes(h.id)).length

  const skore = den ? denniSkore(den) : undefined
  const spanek = den?.ratings.sleep

  // Zvýraznění řádku s právě běžící hodinou. Počítá se až po připojení,
  // protože server aktuální hodinu prohlížeče nezná a nesouhlasil by otisk.
  const [hodinaTed, setHodinaTed] = useState<number | null>(null)
  useEffect(() => {
    if (!dnesek) {
      setHodinaTed(null)
      return
    }
    const obnov = () => setHodinaTed(new Date().getHours())
    obnov()
    const id = window.setInterval(obnov, 60_000)
    return () => window.clearInterval(id)
  }, [dnesek])

  // Spánkové pásmo se hodnotí proti osmi hodinám, ne na desetibodové škále.
  const spanekPasmo =
    typeof spanek !== "number" ? "zadne" : spanek >= 7 ? "vysoko" : spanek >= 6 ? "stred" : "nizko"

  return (
    <div>
      {/* ── hero: datum a prstence ─────────────────────────────────────── */}
      <section className="pl-hero">
        <div className="pl-hero-datum">
          <div className="pl-sheet-eyebrow">{NAZVY_DNU[lang][indexDne(datum)]}</div>
          <h2>{dlouheDatum(datum, lang)}</h2>
          {dnesek && <span className="pl-chip pl-chip-akcent">{t.dnes}</span>}
        </div>
        <div className="pl-prstence">
          <PrstenecSkore skore={skore} popisek={t.statDenniSkore} lang={lang} />
          <Prstenec
            podil={viditelneNavyky.length ? hotovo / viditelneNavyky.length : 0}
            barva={viditelneNavyky.length ? "var(--el-akcent)" : "var(--el-mlha)"}
            stred={viditelneNavyky.length ? `${hotovo}/${viditelneNavyky.length}` : "–"}
            popisek={t.statNavyky}
          />
          <Prstenec
            podil={typeof spanek === "number" ? Math.min(1, spanek / 8) : 0}
            barva={spanekPasmo === "zadne" ? "var(--el-mlha)" : "var(--el-modra)"}
            stred={typeof spanek === "number" ? cislo(spanek, lang, 1) : "–"}
            jednotka={typeof spanek === "number" ? " h" : undefined}
            popisek={NAZVY_METRIK[lang].sleep}
          />
        </div>
      </section>

      {/* ── hodnocení ──────────────────────────────────────────────────── */}
      <div className="pl-section-title">
        {t.dailyProgress}
        <span className="pl-section-hint">{t.dailyProgressHint}</span>
      </div>
      <div className="pl-card" style={{ paddingTop: 8, paddingBottom: 8 }}>
        <div className="pl-metrika">
          <div className="pl-metrika-hlava">
            <span className="pl-metrika-nazev">{NAZVY_METRIK[lang].sleep}</span>
            <span className="pl-metrika-hodnota">
              {typeof spanek === "number" ? `${cislo(spanek, lang, 1)} h` : "–"}
            </span>
          </div>
          <div className="pl-spanek">
            <RatingInput
              hodnota={spanek}
              rozsah={ROZSAH.sleep}
              lang={lang}
              popis={NAZVY_METRIK[lang].sleep}
              trida="pl-input"
              placeholder={`${ROZSAH.sleep.min} – ${ROZSAH.sleep.max}`}
              onZmena={(x) => props.onHodnoceni(datum, "sleep", x)}
              onFlush={props.onFlush}
            />
            <span className="pl-spanek-jednotka">h</span>
          </div>
        </div>

        {METRIKY.filter((m) => m !== "sleep").map((m) => {
          const v = den?.ratings[m]
          return (
            <div key={m} className="pl-metrika">
              <div className="pl-metrika-hlava">
                <span className="pl-metrika-nazev">{NAZVY_METRIK[lang][m]}</span>
                <span
                  className="pl-metrika-hodnota"
                  style={
                    typeof v === "number" ? { color: barvaPasma(pasmoSkore(v)) } : undefined
                  }
                >
                  {typeof v === "number" ? cislo(v, lang, 0) : "–"}
                </span>
              </div>
              <Skala
                hodnota={v}
                popis={NAZVY_METRIK[lang][m]}
                onZmena={(x) => props.onHodnoceni(datum, m, x)}
              />
            </div>
          )
        })}
      </div>

      {/* ── návyky ─────────────────────────────────────────────────────── */}
      <div className="pl-section-title">{t.habitTracker}</div>
      <div className="pl-box">
        {viditelneNavyky.length === 0 && (
          <p className="pl-note" style={{ padding: "12px 14px", margin: 0 }}>
            {t.zadneNavyky}
          </p>
        )}
        {viditelneNavyky.map((h) => {
          const splneno = den?.habits.includes(h.id) ?? false
          return (
            <button
              key={h.id}
              type="button"
              className="pl-navyk-radek"
              disabled={budoucnost}
              onClick={() => props.onNavyk(datum, h.id, !splneno)}
              aria-pressed={splneno}
            >
              <span className="pl-dot" data-done={splneno} aria-hidden />
              <span className="pl-navyk-nazev">{h.name}</span>
              {h.target ? (
                <span className="pl-navyk-cil">
                  {h.target}×{" "}
                  {lang === "en" ? "/ week" : lang === "sk" ? "/ týždeň" : "/ týden"}
                </span>
              ) : null}
            </button>
          )
        })}
      </div>

      {/* ── reflexe ────────────────────────────────────────────────────── */}
      <div className="pl-section-title">{t.dailyReflection}</div>
      <div className="pl-card" style={{ display: "grid", gap: 14 }}>
        {REFLEXE.map((klic) => (
          <div key={klic}>
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

      {/* ── rozvrh ─────────────────────────────────────────────────────── */}
      <div className="pl-section-title">{t.weeklySchedule}</div>
      <div className="pl-box">
        {HODINY.map((h) => (
          <div key={h} className="pl-cas-radek" data-ted={hodinaTed === h}>
            <span className="pl-cas-hodina">{popisHodiny(h)}</span>
            <input
              className="pl-cell"
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
