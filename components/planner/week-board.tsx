"use client"

import { applyGender } from "@/lib/diagnostic/gender"
import type { Gender, Lang } from "@/lib/diagnostic/types"
import { NAZVY_METRIK, NAZVY_REFLEXE, UI } from "@/lib/planner/i18n"
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
import {
  ZKRATKY_DNU,
  dnyTydne,
  kratkeDatum,
  popisRozsahuTydne,
  popisTydne,
} from "@/lib/planner/datum"

// Týdenní list plánovače – elektronická dvoustrana papírové předlohy.
//
// Rozvržení je záměrně totožné s tiskem: vlevo rozvrh a poznámky, vpravo
// tracker návyků a denní postup, dole přes celou šířku denní reflexe. Kdo zná
// papír, pozná list na první pohled a nemusí se nic učit.
//
// Všechny zápisy jdou přes callbacky nahoru. Komponenta si nedrží žádný stav:
// stačí jedno místo, kde se řeší ukládání, a tady se pak nemůže rozejít to,
// co je vidět, s tím, co je uložené.

export interface WeekBoardProps {
  lang: Lang
  gender: Gender
  /** pondělí zobrazeného týdne */
  monday: string
  dnesniDatum: string
  jmeno: string
  dny: Map<string, PlannerDay>
  poznamky: string
  navyky: PlannerHabit[]
  onRozvrh: (datum: string, hodina: number, text: string) => void
  onHodnoceni: (datum: string, metrika: MetricKey, hodnota: number | null) => void
  onReflexe: (datum: string, klic: ReflectionKey, text: string) => void
  onNavyk: (datum: string, habitId: string, splneno: boolean) => void
  onPoznamky: (text: string) => void
  /** vynutí odeslání rozepsaného textu, například při přepnutí týdne */
  onFlush: () => void
}

/** Text bloku rozvrhu pro danou hodinu. */
function blok(den: PlannerDay | undefined, hodina: number): string {
  return den?.schedule.find((s) => s.hour === hodina)?.text ?? ""
}

/** Popisek hodiny, „05:00". */
function popisHodiny(h: number): string {
  return `${String(h).padStart(2, "0")}:00`
}

export function WeekBoard(props: WeekBoardProps) {
  const { lang, gender, monday, dnesniDatum, jmeno, dny, poznamky, navyky } = props
  const t = UI[lang]
  const data = dnyTydne(monday)
  const zkratky = ZKRATKY_DNU[lang]

  /**
   * Návyky, které se v tomhle týdnu ukazují.
   *
   * Aktivní vždycky. Archivovaný jen tehdy, když v tomto týdnu má odškrtnutý
   * den: jinak by z listu zmizela historie, kterou tam klient sám napsal.
   */
  const viditelneNavyky = navyky.filter(
    (h) => !h.archivedAt || data.some((d) => dny.get(d)?.habits.includes(h.id)),
  )

  return (
    <div className="pl-sheet">
      {/* Hlavička listu. Na papíře tuhle roli plní dva černé pruhy, na
          obrazovce stačí hierarchie písma; pruhy se vrací v tisku a v PDF. */}
      <div className="pl-sheet-head">
        <div>
          <div className="pl-sheet-eyebrow">{t.weeklyPlan}</div>
          <h2 className="pl-sheet-title">{popisRozsahuTydne(monday, lang)}</h2>
        </div>
        <div className="pl-sheet-who">
          <div>
            {lang === "en" ? "For" : lang === "sk" ? "Pre" : "Pro"} <strong>{jmeno}</strong>
          </div>
          <div style={{ fontSize: 11.5, color: "var(--wm-text-3)" }}>
            {t.weekOf} {popisTydne(monday)}
          </div>
        </div>
      </div>

      <div className="pl-spread" style={{ marginTop: 4 }}>
        {/* ── levý sloupec ─────────────────────────────────────────────── */}
        <div>
          <div className="pl-section-title">
            {t.weeklySchedule}
            <span className="pl-tahni">{t.tahniDoStrany}</span>
          </div>
          {/* Mřížka se na úzké obrazovce posouvá vodorovně a první
              sloupec zůstává přilepený, takže se nic neschovává. */}

          <div className="pl-box pl-scroll">
            <table className="pl-grid pl-grid-rozvrh">
              <thead>
                <tr>
                  <th className="pl-hour" />
                  {data.map((d, i) => (
                    <th key={d} data-today={d === dnesniDatum}>
                      {zkratky[i]}
                      <div style={{ fontWeight: 500, opacity: 0.6, fontSize: 8.5 }}>
                        {kratkeDatum(d, lang)}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {HODINY.map((h) => (
                  <tr key={h}>
                    <td className="pl-hour">{popisHodiny(h)}</td>
                    {data.map((d) => (
                      <td key={d} data-today={d === dnesniDatum}>
                        {/* Pole, které se zalomí, ne jednořádkový vstup:
                            delší zápis se tak nikde neořízne a řádek mřížky
                            povyroste podle nejdelší buňky. */}
                        <AutoTextarea
                          className="pl-cell"
                          minRows={1}
                          value={blok(dny.get(d), h)}
                          onChange={(text) => props.onRozvrh(d, h, text)}
                          onBlur={props.onFlush}
                          ariaLabel={`${popisHodiny(h)} ${d}`}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>

        {/* ── pravý sloupec ────────────────────────────────────────────── */}
        <div>
          <div className="pl-section-title">{t.habitTracker}</div>
          <div className="pl-box">
            <table className="pl-grid pl-grid-tracker">
              <thead>
                <tr>
                  <th className="pl-rowhead" />
                  {data.map((d, i) => (
                    <th key={d} data-today={d === dnesniDatum}>
                      {zkratky[i]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {viditelneNavyky.length === 0 && (
                  <tr>
                    <td colSpan={8} style={{ padding: "14px 10px" }}>
                      <span className="pl-note">{t.zadneNavyky}</span>
                    </td>
                  </tr>
                )}
                {viditelneNavyky.map((h) => (
                  <tr key={h.id}>
                    <td className="pl-rowhead" title={h.name}>
                      {h.name}
                      {h.target ? (
                        <span style={{ opacity: 0.55, fontWeight: 500 }}> · {h.target}×</span>
                      ) : null}
                    </td>
                    {data.map((d) => {
                      const splneno = dny.get(d)?.habits.includes(h.id) ?? false
                      // Odškrtnout se dá jen to, co už proběhlo. Budoucí den
                      // by se do statistiky započítal jako splněný dřív, než
                      // vůbec nastal.
                      const budoucnost = d > dnesniDatum
                      return (
                        <td key={d} data-today={d === dnesniDatum}>
                          <button
                            type="button"
                            className="pl-dot"
                            data-done={splneno}
                            disabled={budoucnost}
                            onClick={() => props.onNavyk(d, h.id, !splneno)}
                            aria-pressed={splneno}
                            aria-label={`${h.name} – ${d}`}
                            title={budoucnost ? "" : h.name}
                          />
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pl-section-title">
            {t.dailyProgress}
            <span className="pl-section-hint">{t.dailyProgressHint}</span>
          </div>
          <div className="pl-box">
            <table className="pl-grid pl-grid-tracker">
              <thead>
                <tr>
                  <th className="pl-rowhead" />
                  {data.map((d, i) => (
                    <th key={d} data-today={d === dnesniDatum}>
                      {zkratky[i]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {METRIKY.map((m) => {
                  const r = ROZSAH[m]
                  return (
                    <tr key={m}>
                      <td className="pl-rowhead">{NAZVY_METRIK[lang][m]}</td>
                      {data.map((d) => {
                        const v = dny.get(d)?.ratings[m]
                        // Podklad buňky ukazuje výši hodnoty, ať je vidět
                        // průběh týdne bez čtení čísel. Spánek se normuje
                        // proti osmi hodinám, protože nemá horní strop desítky.
                        const uroven =
                          typeof v === "number"
                            ? r.hodiny
                              ? Math.min(1, v / 9)
                              : (v - r.min) / (r.max - r.min)
                            : 0
                        return (
                          <td
                            key={d}
                            className="pl-heat"
                            data-today={d === dnesniDatum}
                            style={{ ["--pl-v" as string]: uroven }}
                          >
                            <RatingInput
                              hodnota={v}
                              rozsah={r}
                              lang={lang}
                              popis={`${NAZVY_METRIK[lang][m]} ${d}`}
                              trida="pl-score"
                              onZmena={(x) => props.onHodnoceni(d, m, x)}
                              onFlush={props.onFlush}
                            />
                          </td>
                        )
                      })}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Poznámky patří do pravého sloupce, ne pod rozvrh: rozvrh je
              vysoký a pravý sloupec by pod trackerem zůstal poloprázdný.
              Stejně je poskládaný i list v PDF. */}
          <div className="pl-section-title">{t.notesIdeas}</div>
          <div className="pl-box">
            <AutoTextarea
              className="pl-cell pl-poznamky"
              minRows={6}
              value={poznamky}
              onChange={props.onPoznamky}
              onBlur={props.onFlush}
              ariaLabel={t.notesIdeas}
              style={{ fontSize: 13.5, padding: "12px 14px", lineHeight: 1.55 }}
            />
          </div>
        </div>
      </div>

      {/* ── denní reflexe přes celou šířku ───────────────────────────────── */}
      <div className="pl-section-title">
        {t.dailyReflection}
        <span className="pl-tahni">{t.tahniDoStrany}</span>
      </div>
      <div className="pl-box">
        <table className="pl-grid pl-grid-reflexe">
          <thead>
            <tr>
              <th className="pl-rowhead" />
              {data.map((d, i) => (
                <th key={d} data-today={d === dnesniDatum}>
                  {zkratky[i]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {REFLEXE.map((klic) => (
              <tr key={klic}>
                <td className="pl-rowhead">
                  {applyGender(NAZVY_REFLEXE[lang][klic], gender)}
                </td>
                {data.map((d) => (
                  <td key={d} data-today={d === dnesniDatum}>
                    <AutoTextarea
                      className="pl-cell"
                      minRows={2}
                      value={dny.get(d)?.reflection[klic] ?? ""}
                      onChange={(text) => props.onReflexe(d, klic, text)}
                      onBlur={props.onFlush}
                      ariaLabel={`${applyGender(NAZVY_REFLEXE[lang][klic], gender)} ${d}`}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="pl-footer-motto">{t.motto}</div>
    </div>
  )
}
