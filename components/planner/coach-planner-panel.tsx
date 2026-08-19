"use client"

import { useCallback, useEffect, useState } from "react"
import { JAZYKY, KOD_JAZYKA } from "@/lib/diagnostic/lang"
import type { Gender, Lang } from "@/lib/diagnostic/types"
import { UI } from "@/lib/planner/i18n"
import type { PlannerClientRow, PlannerInviteRow } from "@/lib/planner/types"
import * as api from "@/lib/planner/remote"

// Deníky klientů v sekci kouče.
//
// Kouč tu deník zakládá a vidí, že si ho klient vede. DO OBSAHU NEVIDÍ, a to
// ani master: deník je osobní zápisník, ne dotazník, jehož výsledek se s
// koučem probírá. Kdyby do něj kouč viděl, přestal by být tím, čím má být,
// a lidé by si do něj přestali psát pravdu. Server to hlídá sám, tohle je
// jen obrazovka.

export interface CoachPlannerPanelProps {
  sessionToken: string
  lang: Lang
  /** základ odkazu pro klienta, tedy origin aplikace */
  origin: string
}

function datumCasu(ms: number, lang: Lang): string {
  const d = new Date(ms)
  const den = d.getDate()
  const mesic = d.getMonth() + 1
  const rok = d.getFullYear()
  return lang === "en" ? `${rok}-${String(mesic).padStart(2, "0")}-${String(den).padStart(2, "0")}` : `${den}. ${mesic}. ${rok}`
}

export function CoachPlannerPanel({ sessionToken, lang, origin }: CoachPlannerPanelProps) {
  const t = UI[lang]
  const [klienti, setKlienti] = useState<PlannerClientRow[] | null>(null)
  const [pozvanky, setPozvanky] = useState<PlannerInviteRow[] | null>(null)
  const [chyba, setChyba] = useState<string | null>(null)
  const [zaneprazdneno, setZaneprazdneno] = useState(false)

  const [formOtevren, setFormOtevren] = useState(false)
  const [jmeno, setJmeno] = useState("")
  const [email, setEmail] = useState("")
  const [gender, setGender] = useState<Gender | undefined>(undefined)
  const [jazyk, setJazyk] = useState<Lang>("cs")
  const [novyOdkaz, setNovyOdkaz] = useState<string | null>(null)
  const [zkopirovano, setZkopirovano] = useState(false)

  const nacti = useCallback(async () => {
    try {
      const [k, p] = await Promise.all([
        api.listPlannerClients(sessionToken),
        api.listPlannerInvites(sessionToken),
      ])
      setKlienti(k)
      setPozvanky(p)
      setChyba(null)
    } catch (e) {
      setKlienti([])
      setPozvanky([])
      setChyba(api.chybaText(e, "Data se nepodařilo načíst."))
    }
  }, [sessionToken])

  useEffect(() => {
    void nacti()
  }, [nacti])

  const zaloz = async () => {
    setZaneprazdneno(true)
    setChyba(null)
    try {
      const token = await api.createPlannerInvite(
        sessionToken,
        jmeno.trim(),
        email.trim(),
        gender,
        jazyk,
      )
      setNovyOdkaz(`${origin}/planner/start/${token}`)
      setJmeno("")
      setEmail("")
      setGender(undefined)
      setZkopirovano(false)
      await nacti()
    } catch (e) {
      setChyba(api.chybaText(e, "Deník se nepodařilo založit."))
    } finally {
      setZaneprazdneno(false)
    }
  }

  const nepouzite = (pozvanky ?? []).filter((p) => !p.usedAt && p.expiresAt > Date.now())

  return (
    <div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 12, flexWrap: "wrap" }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>{t.koucNadpis}</h2>
        <button
          type="button"
          className="pl-btn pl-btn-primary"
          onClick={() => setFormOtevren((x) => !x)}
        >
          {t.koucNovyKlient}
        </button>
      </div>

      <p className="pl-note" style={{ marginTop: 8, maxWidth: 620 }}>
        {t.koucSoukromi}
      </p>

      {chyba && (
        <p className="pl-note" style={{ color: "var(--wm-red)" }}>
          {chyba}
        </p>
      )}

      {/* ── nový deník ───────────────────────────────────────────────────── */}
      {formOtevren && (
        <div className="pl-card" style={{ marginTop: 14, maxWidth: 620 }}>
          <div style={{ display: "grid", gap: 12, gridTemplateColumns: "1fr 1fr" }}>
            <div>
              <label className="pl-label" htmlFor="dnk-jmeno">
                Jméno klienta
              </label>
              <input
                id="dnk-jmeno"
                className="pl-input"
                value={jmeno}
                maxLength={120}
                onChange={(e) => setJmeno(e.target.value)}
              />
            </div>
            <div>
              <label className="pl-label" htmlFor="dnk-email">
                E-mail
              </label>
              <input
                id="dnk-email"
                className="pl-input"
                type="email"
                value={email}
                maxLength={200}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: "flex", gap: 18, marginTop: 14, flexWrap: "wrap" }}>
            <div>
              <span className="pl-label">Oslovení</span>
              <div style={{ display: "flex", gap: 8 }}>
                {(["male", "female"] as Gender[]).map((g) => (
                  <button
                    key={g}
                    type="button"
                    className="pl-btn"
                    onClick={() => setGender(gender === g ? undefined : g)}
                    style={{
                      background: gender === g ? "var(--wm-brand)" : "var(--wm-surface)",
                      color: gender === g ? "var(--wm-brand-fg)" : "var(--wm-text-2)",
                      borderColor: gender === g ? "var(--wm-brand)" : "var(--wm-border-light)",
                    }}
                  >
                    {g === "male" ? "muž" : "žena"}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <span className="pl-label">Jazyk</span>
              <div className="pl-tabs">
                {JAZYKY.map((j) => (
                  <button key={j} type="button" data-active={jazyk === j} onClick={() => setJazyk(j)}>
                    {KOD_JAZYKA[j]}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            type="button"
            className="pl-btn pl-btn-primary"
            style={{ marginTop: 16 }}
            disabled={zaneprazdneno || jmeno.trim().length < 2 || !email.includes("@")}
            onClick={() => void zaloz()}
          >
            {t.koucNovyKlient}
          </button>
        </div>
      )}

      {/* ── vytvořený odkaz ──────────────────────────────────────────────── */}
      {novyOdkaz && (
        <div className="pl-card" style={{ marginTop: 14, maxWidth: 620 }}>
          <div className="pl-card-label">{t.koucOdkaz}</div>
          <div
            style={{
              marginTop: 8,
              padding: "10px 12px",
              borderRadius: 10,
              background: "var(--wm-fill-4)",
              fontSize: 13,
              wordBreak: "break-all",
            }}
          >
            {novyOdkaz}
          </div>
          <button
            type="button"
            className="pl-btn"
            style={{ marginTop: 10 }}
            onClick={() => {
              void navigator.clipboard.writeText(novyOdkaz)
              setZkopirovano(true)
            }}
          >
            {zkopirovano ? t.koucZkopirovano : t.koucZkopirovat}
          </button>
          <p className="pl-note" style={{ marginTop: 10 }}>
            Odkaz je jednorázový a platí 30 dnů. Klient si na něm zvolí heslo, které pak nikdo
            jiný nezná.
          </p>
        </div>
      )}

      {/* ── klienti ──────────────────────────────────────────────────────── */}
      <div className="pl-card" style={{ marginTop: 18 }}>
        <div className="pl-card-label">{t.koucKlienti}</div>
        {klienti === null && <p className="pl-note">{t.nacitam}</p>}
        {klienti !== null && klienti.length === 0 && (
          <p className="pl-note" style={{ marginBottom: 0 }}>
            {t.koucBezKlientu}
          </p>
        )}
        {klienti !== null && klienti.length > 0 && (
          <table className="pl-table" style={{ marginTop: 8 }}>
            <thead>
              <tr>
                <th>Klient</th>
                <th>E-mail</th>
                <th className="pl-num">Dnů</th>
                <th className="pl-num">{t.koucPosledniZapis}</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {klienti.map((k) => (
                <tr key={k.id} style={{ opacity: k.active ? 1 : 0.5 }}>
                  <td>
                    {k.name}
                    <span style={{ color: "var(--wm-text-3)", fontSize: 12 }}>
                      {" "}
                      · {KOD_JAZYKA[k.lang]}
                    </span>
                  </td>
                  <td style={{ color: "var(--wm-text-2)" }}>{k.email}</td>
                  <td className="pl-num">{k.dnu}</td>
                  <td className="pl-num" style={{ color: "var(--wm-text-2)" }}>
                    {k.posledniZapis ?? "–"}
                  </td>
                  <td className="pl-num">
                    <button
                      type="button"
                      className="pl-btn pl-btn-quiet"
                      disabled={zaneprazdneno}
                      onClick={() => {
                        setZaneprazdneno(true)
                        api
                          .setPlannerClientActive(sessionToken, k.id, !k.active)
                          .then(nacti)
                          .catch((e) => setChyba(api.chybaText(e, "Změna se nepovedla.")))
                          .finally(() => setZaneprazdneno(false))
                      }}
                    >
                      {k.active ? t.koucZablokovat : t.koucOdblokovat}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ── nepoužité pozvánky ───────────────────────────────────────────── */}
      {nepouzite.length > 0 && (
        <div className="pl-card" style={{ marginTop: 14 }}>
          <div className="pl-card-label">{t.koucPozvanky}</div>
          <table className="pl-table" style={{ marginTop: 8 }}>
            <tbody>
              {nepouzite.map((p) => (
                <tr key={p.id}>
                  <td>
                    {p.name}
                    <span style={{ color: "var(--wm-text-3)", fontSize: 12 }}>
                      {" "}
                      · {t.koucCekaNaAktivaci}
                    </span>
                  </td>
                  <td style={{ color: "var(--wm-text-2)" }}>{p.email}</td>
                  <td className="pl-num" style={{ color: "var(--wm-text-3)", fontSize: 12 }}>
                    do {datumCasu(p.expiresAt, lang)}
                  </td>
                  <td className="pl-num">
                    <button
                      type="button"
                      className="pl-btn pl-btn-quiet"
                      onClick={() => {
                        void navigator.clipboard.writeText(`${origin}/planner/start/${p.token}`)
                      }}
                    >
                      {t.koucZkopirovat}
                    </button>
                  </td>
                  <td className="pl-num">
                    <button
                      type="button"
                      className="pl-btn pl-btn-danger"
                      disabled={zaneprazdneno}
                      onClick={() => {
                        setZaneprazdneno(true)
                        api
                          .revokePlannerInvite(sessionToken, p.id)
                          .then(nacti)
                          .catch((e) => setChyba(api.chybaText(e, "Zrušení se nepovedlo.")))
                          .finally(() => setZaneprazdneno(false))
                      }}
                    >
                      Zrušit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
