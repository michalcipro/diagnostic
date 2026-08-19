"use client"

import { useState } from "react"
import { applyGender } from "@/lib/diagnostic/gender"
import type { Gender, Lang } from "@/lib/diagnostic/types"
import { UI } from "@/lib/planner/i18n"
import type { PlannerHabit } from "@/lib/planner/types"

// Správa návyků – jediná část plánovače, kterou si klient definuje sám.
//
// Nic tu není nevratné, kromě jediné akce, která nevratná být musí. Návyk jde
// přejmenovat, posunout, archivovat i vrátit z archivu. Smazat se dá taky, ale
// až po potvrzení a s upozorněním, co to udělá s minulými statistikami:
// archivace je ta správná odpověď na „už to nedělám", mazání na „tohle sem
// nikdy nemělo patřit".

export interface HabitsPanelProps {
  lang: Lang
  gender: Gender
  navyky: PlannerHabit[]
  zaneprazdneno: boolean
  onPridat: (nazev: string, cil?: number) => void
  onUpravit: (habitId: string, nazev: string, cil: number | null) => void
  onPosunout: (habitId: string, smer: -1 | 1) => void
  onArchivovat: (habitId: string, archivovat: boolean) => void
  onSmazat: (habitId: string) => void
}

function VyberCile({
  hodnota,
  onZmena,
  lang,
}: {
  hodnota: number | null
  onZmena: (v: number | null) => void
  lang: Lang
}) {
  const t = UI[lang]
  return (
    <select
      className="pl-input"
      style={{ width: "auto", padding: "8px 10px", fontSize: 13 }}
      value={hodnota === null ? "" : String(hodnota)}
      onChange={(e) => onZmena(e.target.value === "" ? null : Number(e.target.value))}
      aria-label={t.cilTydne}
    >
      <option value="">{t.bezCile}</option>
      {[1, 2, 3, 4, 5, 6, 7].map((n) => (
        <option key={n} value={n}>
          {n}× {lang === "en" ? "/ week" : lang === "sk" ? "/ týždeň" : "/ týden"}
        </option>
      ))}
    </select>
  )
}

export function HabitsPanel(props: HabitsPanelProps) {
  const { lang, gender, navyky, zaneprazdneno } = props
  const t = UI[lang]

  const [novyNazev, setNovyNazev] = useState("")
  const [novyCil, setNovyCil] = useState<number | null>(null)
  const [upravovany, setUpravovany] = useState<string | null>(null)
  const [upravNazev, setUpravNazev] = useState("")
  const [upravCil, setUpravCil] = useState<number | null>(null)
  const [mazany, setMazany] = useState<string | null>(null)

  const aktivni = navyky.filter((h) => !h.archivedAt)
  const archivovane = navyky.filter((h) => h.archivedAt)

  const pridat = () => {
    const n = novyNazev.trim()
    if (!n) return
    props.onPridat(n, novyCil ?? undefined)
    setNovyNazev("")
    setNovyCil(null)
  }

  const zacniUpravu = (h: PlannerHabit) => {
    setUpravovany(h.id)
    setUpravNazev(h.name)
    setUpravCil(h.target ?? null)
  }

  return (
    <div style={{ marginTop: 16, maxWidth: 720 }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, margin: "0 0 6px" }}>{t.navykyNadpis}</h2>
      <p className="pl-note" style={{ marginTop: 0 }}>
        {applyGender(t.navykyPodtitul, gender)}
      </p>

      {/* ── přidání ──────────────────────────────────────────────────────── */}
      <div className="pl-card" style={{ marginTop: 14 }}>
        <div className="pl-card-label">{t.novyNavyk}</div>
        <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
          <input
            className="pl-input"
            style={{ flex: "1 1 220px" }}
            placeholder={t.nazevNavyku}
            value={novyNazev}
            maxLength={80}
            onChange={(e) => setNovyNazev(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") pridat()
            }}
          />
          <VyberCile hodnota={novyCil} onZmena={setNovyCil} lang={lang} />
          <button
            type="button"
            className="pl-btn pl-btn-primary"
            disabled={!novyNazev.trim() || zaneprazdneno || aktivni.length >= 20}
            onClick={pridat}
          >
            {t.pridat}
          </button>
        </div>
        {aktivni.length >= 20 && (
          <p className="pl-note" style={{ marginTop: 8, color: "var(--wm-red)" }}>
            {t.navykuMaximum}
          </p>
        )}
      </div>

      {/* ── aktivní návyky ───────────────────────────────────────────────── */}
      <div className="pl-card" style={{ marginTop: 14 }}>
        {aktivni.length === 0 && <p className="pl-note" style={{ margin: 0 }}>{t.zadneNavyky}</p>}

        {aktivni.map((h, i) => {
          const upravuje = upravovany === h.id
          const maze = mazany === h.id
          return (
            <div
              key={h.id}
              style={{
                padding: "12px 0",
                borderBottom: i < aktivni.length - 1 ? "1px solid var(--wm-border-light)" : "none",
              }}
            >
              {upravuje ? (
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                  <input
                    className="pl-input"
                    style={{ flex: "1 1 200px" }}
                    value={upravNazev}
                    maxLength={80}
                    onChange={(e) => setUpravNazev(e.target.value)}
                    autoFocus
                  />
                  <VyberCile hodnota={upravCil} onZmena={setUpravCil} lang={lang} />
                  <button
                    type="button"
                    className="pl-btn pl-btn-primary"
                    disabled={!upravNazev.trim() || zaneprazdneno}
                    onClick={() => {
                      props.onUpravit(h.id, upravNazev.trim(), upravCil)
                      setUpravovany(null)
                    }}
                  >
                    {t.ulozit}
                  </button>
                  <button
                    type="button"
                    className="pl-btn pl-btn-quiet"
                    onClick={() => setUpravovany(null)}
                  >
                    {t.zrusit}
                  </button>
                </div>
              ) : (
                <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                  <span className="pl-dot" style={{ margin: 0, flex: "none" }} aria-hidden />
                  <div style={{ flex: "1 1 160px", minWidth: 0 }}>
                    <div style={{ fontSize: 15, fontWeight: 600 }}>{h.name}</div>
                    {h.target ? (
                      <div style={{ fontSize: 12, color: "var(--wm-text-3)" }}>
                        {t.cilTydne}: {h.target}×
                      </div>
                    ) : null}
                  </div>
                  <button
                    type="button"
                    className="pl-btn pl-btn-quiet"
                    aria-label={t.posunoutNahoru}
                    title={t.posunoutNahoru}
                    disabled={i === 0 || zaneprazdneno}
                    onClick={() => props.onPosunout(h.id, -1)}
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    className="pl-btn pl-btn-quiet"
                    aria-label={t.posunoutDolu}
                    title={t.posunoutDolu}
                    disabled={i === aktivni.length - 1 || zaneprazdneno}
                    onClick={() => props.onPosunout(h.id, 1)}
                  >
                    ↓
                  </button>
                  <button type="button" className="pl-btn" onClick={() => zacniUpravu(h)}>
                    {t.prejmenovat}
                  </button>
                  <button
                    type="button"
                    className="pl-btn"
                    disabled={zaneprazdneno}
                    onClick={() => props.onArchivovat(h.id, true)}
                  >
                    {t.archivovat}
                  </button>
                  <button
                    type="button"
                    className="pl-btn pl-btn-danger"
                    onClick={() => setMazany(maze ? null : h.id)}
                  >
                    {t.smazat}
                  </button>
                </div>
              )}

              {maze && (
                <div
                  style={{
                    marginTop: 10,
                    padding: 12,
                    borderRadius: 10,
                    background: "var(--wm-red-light)",
                  }}
                >
                  <p className="pl-note" style={{ margin: "0 0 10px", color: "var(--wm-text)" }}>
                    {t.smazatPotvrzeni}
                  </p>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      type="button"
                      className="pl-btn pl-btn-danger"
                      disabled={zaneprazdneno}
                      onClick={() => {
                        props.onSmazat(h.id)
                        setMazany(null)
                      }}
                    >
                      {t.smazat}
                    </button>
                    <button
                      type="button"
                      className="pl-btn pl-btn-quiet"
                      onClick={() => setMazany(null)}
                    >
                      {t.zrusit}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* ── archiv ───────────────────────────────────────────────────────── */}
      {archivovane.length > 0 && (
        <div className="pl-card" style={{ marginTop: 14 }}>
          <div className="pl-card-label">{t.archivovane}</div>
          {archivovane.map((h) => (
            <div
              key={h.id}
              style={{
                display: "flex",
                gap: 8,
                alignItems: "center",
                flexWrap: "wrap",
                padding: "10px 0",
              }}
            >
              <div style={{ flex: "1 1 160px", fontSize: 14, color: "var(--wm-text-2)" }}>
                {h.name}
              </div>
              <button
                type="button"
                className="pl-btn"
                disabled={zaneprazdneno || aktivni.length >= 20}
                onClick={() => props.onArchivovat(h.id, false)}
              >
                {t.obnovit}
              </button>
              <button
                type="button"
                className="pl-btn pl-btn-danger"
                onClick={() => setMazany(mazany === h.id ? null : h.id)}
              >
                {t.smazat}
              </button>
              {mazany === h.id && (
                <div
                  style={{
                    flexBasis: "100%",
                    marginTop: 6,
                    padding: 12,
                    borderRadius: 10,
                    background: "var(--wm-red-light)",
                  }}
                >
                  <p className="pl-note" style={{ margin: "0 0 10px", color: "var(--wm-text)" }}>
                    {t.smazatPotvrzeni}
                  </p>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      type="button"
                      className="pl-btn pl-btn-danger"
                      disabled={zaneprazdneno}
                      onClick={() => {
                        props.onSmazat(h.id)
                        setMazany(null)
                      }}
                    >
                      {t.smazat}
                    </button>
                    <button
                      type="button"
                      className="pl-btn pl-btn-quiet"
                      onClick={() => setMazany(null)}
                    >
                      {t.zrusit}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
