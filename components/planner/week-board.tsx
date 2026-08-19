"use client"

import { applyGender } from "@/lib/diagnostic/gender"
import type { Gender, Lang } from "@/lib/diagnostic/types"
import { NAZVY_METRIK, NAZVY_REFLEXE, UI } from "@/lib/planner/i18n"
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
import { ZKRATKY_DNU, dnyTydne, kratkeDatum, popisRozsahuTydne } from "@/lib/planner/datum"

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
      {/* Hlavička: dva černé pruhy jako na papíře. */}
      <div className="pl-spread" style={{ gap: 12 }}>
        <div className="pl-band">{t.weeklyPlan}</div>
        <div className="pl-band">{t.habitsProgress}</div>
      </div>

      <div
        className="pl-spread"
        style={{ gap: 12, marginTop: 8, alignItems: "baseline" }}
      >
        <div style={{ fontSize: 11.5, fontWeight: 600, letterSpacing: "0.06em" }}>
          {t.weekOf}: {popisRozsahuTydne(monday, lang)}
        </div>
        <div
          style={{
            fontSize: 11.5,
            fontWeight: 600,
            letterSpacing: "0.06em",
            textAlign: "right",
          }}
        >
          {lang === "en" ? "FOR" : "PRO"}: {jmeno.toUpperCase()}
        </div>
      </div>

      <div className="pl-spread" style={{ marginTop: 4 }}>
        {/* ── levý sloupec ─────────────────────────────────────────────── */}
        <div>
          <div className="pl-section-title pl-only-wide">{t.weeklySchedule}</div>
          <p className="pl-hint-narrow pl-note" style={{ margin: "12px 0" }}>
            {lang === "en"
              ? "The weekly grid needs a wider screen. Use the Day tab on a phone."
              : lang === "sk"
                ? "Týždenná mriežka potrebuje širšiu obrazovku. Na telefóne použi záložku Deň."
                : "Týdenní mřížka potřebuje širší obrazovku. Na telefonu použij záložku Den."}
          </p>

          <div className="pl-box pl-only-wide">
            <table className="pl-grid">
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
                        <input
                          className="pl-cell"
                          value={blok(dny.get(d), h)}
                          onChange={(e) => props.onRozvrh(d, h, e.target.value)}
                          onBlur={props.onFlush}
                          aria-label={`${popisHodiny(h)} ${d}`}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pl-section-title">{t.notesIdeas}</div>
          <div className="pl-box">
            <textarea
              className="pl-cell"
              rows={5}
              value={poznamky}
              onChange={(e) => props.onPoznamky(e.target.value)}
              onBlur={props.onFlush}
              aria-label={t.notesIdeas}
              style={{ fontSize: 12.5, padding: "8px 10px" }}
            />
          </div>
        </div>

        {/* ── pravý sloupec ────────────────────────────────────────────── */}
        <div>
          <div className="pl-section-title">{t.habitTracker}</div>
          <div className="pl-box">
            <table className="pl-grid">
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
            <table className="pl-grid">
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
                            <input
                              className="pl-score"
                              type="number"
                              inputMode="decimal"
                              min={r.min}
                              max={r.max}
                              step={r.krok}
                              value={typeof v === "number" ? String(v) : ""}
                              onChange={(e) => {
                                const raw = e.target.value
                                if (raw === "") {
                                  props.onHodnoceni(d, m, null)
                                  return
                                }
                                const n = Number(raw)
                                if (!Number.isFinite(n)) return
                                // Mimo rozsah se hodnota nezapíše vůbec:
                                // ořezání na kraj by tiše přepsalo překlep
                                // na číslo, které klient nenapsal.
                                if (n < r.min || n > r.max) return
                                props.onHodnoceni(d, m, n)
                              }}
                              onFocus={(e) => e.currentTarget.select()}
                              onBlur={props.onFlush}
                              aria-label={`${NAZVY_METRIK[lang][m]} ${d}`}
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
        </div>
      </div>

      {/* ── denní reflexe přes celou šířku ───────────────────────────────── */}
      <div className="pl-section-title">{t.dailyReflection}</div>
      <div className="pl-box">
        <table className="pl-grid">
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
                    <textarea
                      className="pl-cell"
                      rows={2}
                      value={dny.get(d)?.reflection[klic] ?? ""}
                      onChange={(e) => props.onReflexe(d, klic, e.target.value)}
                      onBlur={props.onFlush}
                      aria-label={`${applyGender(NAZVY_REFLEXE[lang][klic], gender)} ${d}`}
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
