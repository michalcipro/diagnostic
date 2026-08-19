"use client"

import { useCallback, useEffect, useState } from "react"
import { JAZYKY, KOD_JAZYKA } from "@/lib/diagnostic/lang"
import type { Gender, Lang } from "@/lib/diagnostic/types"
import { UI } from "@/lib/planner/i18n"
import type { PlannerClientRow, PlannerInviteRow, UrovenSdileni } from "@/lib/planner/types"
import * as api from "@/lib/planner/remote"
import { CoachClientDetail } from "./coach-client-detail"

// Deníky klientů v sekci kouče.
//
// Kolik z deníku kouč uvidí, se nastavuje u každého klienta zvlášť a klient
// tutéž informaci vidí na svém účtu. Obrazovka to říká nahlas na obou
// stranách schválně: dohled, o kterém člověk neví, by z deníku udělal
// hlášení a lidé by si do něj přestali psát pravdu.
//
// Server nic z toho nespoléhá na tuhle obrazovku. Úroveň vyhodnocuje
// convex/plannerCoachRead.ts a texty na nižší úrovni vůbec neopustí databázi.

export interface CoachPlannerPanelProps {
  sessionToken: string
  lang: Lang
  /** základ odkazu pro klienta, tedy origin aplikace */
  origin: string
}

const UROVNE: { klic: UrovenSdileni; nazev: string; popis: string }[] = [
  {
    klic: "nic",
    nazev: "Nic z obsahu",
    popis: "Uvidíš jen to, že si klient deník vede.",
  },
  {
    klic: "cisla",
    nazev: "Čísla bez slov",
    popis: "Hodnocení, návyky a statistiky. Volné texty ne.",
  },
  {
    klic: "vse",
    nazev: "Celý deník",
    popis: "Včetně rozvrhu, reflexe a poznámek.",
  },
]

const NAZEV_UROVNE: Record<UrovenSdileni, string> = {
  nic: "nic z obsahu",
  cisla: "čísla",
  vse: "celý deník",
}

function datumCasu(ms: number, lang: Lang): string {
  const d = new Date(ms)
  const den = d.getDate()
  const mesic = d.getMonth() + 1
  const rok = d.getFullYear()
  return lang === "en"
    ? `${rok}-${String(mesic).padStart(2, "0")}-${String(den).padStart(2, "0")}`
    : `${den}. ${mesic}. ${rok}`
}

/** Přihlašovací údaje, které kouč jednou uvidí a předá klientovi. */
interface Pristup {
  email: string
  heslo: string
  jmeno: string
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
  const [sdileni, setSdileni] = useState<UrovenSdileni>("cisla")
  const [novyOdkaz, setNovyOdkaz] = useState<string | null>(null)
  const [pristup, setPristup] = useState<Pristup | null>(null)
  const [zkopirovano, setZkopirovano] = useState(false)
  const [otevreny, setOtevreny] = useState<string | null>(null)

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

  const vycistitFormular = () => {
    setJmeno("")
    setEmail("")
    setGender(undefined)
    setZkopirovano(false)
  }

  const zalozOdkazem = async () => {
    setZaneprazdneno(true)
    setChyba(null)
    try {
      const token = await api.createPlannerInvite(
        sessionToken,
        jmeno.trim(),
        email.trim(),
        gender,
        jazyk,
        sdileni,
      )
      setPristup(null)
      setNovyOdkaz(`${origin}/planner/start/${token}`)
      vycistitFormular()
      await nacti()
    } catch (e) {
      setChyba(api.chybaText(e, "Deník se nepodařilo založit."))
    } finally {
      setZaneprazdneno(false)
    }
  }

  const zalozSHeslem = async () => {
    setZaneprazdneno(true)
    setChyba(null)
    try {
      const heslo = await api.createPlannerClientWithPassword(
        sessionToken,
        jmeno.trim(),
        email.trim(),
        gender,
        jazyk,
        sdileni,
      )
      setNovyOdkaz(null)
      setPristup({ email: email.trim().toLowerCase(), heslo, jmeno: jmeno.trim() })
      vycistitFormular()
      await nacti()
    } catch (e) {
      setChyba(api.chybaText(e, "Deník se nepodařilo založit."))
    } finally {
      setZaneprazdneno(false)
    }
  }

  const zmenUroven = (klientId: string, uroven: UrovenSdileni) => {
    setZaneprazdneno(true)
    api
      .setPlannerSdileni(sessionToken, klientId, uroven)
      .then(nacti)
      .catch((e) => setChyba(api.chybaText(e, "Změna se nepovedla.")))
      .finally(() => setZaneprazdneno(false))
  }

  const noveHeslo = async (klient: PlannerClientRow) => {
    setZaneprazdneno(true)
    setChyba(null)
    try {
      const r = await api.resetPlannerPassword(sessionToken, klient.id)
      setNovyOdkaz(null)
      setPristup({ email: r.email, heslo: r.password, jmeno: r.name })
      setZkopirovano(false)
      await nacti()
    } catch (e) {
      setChyba(api.chybaText(e, "Heslo se nepodařilo vygenerovat."))
    } finally {
      setZaneprazdneno(false)
    }
  }

  const nepouzite = (pozvanky ?? []).filter((p) => !p.usedAt && p.expiresAt > Date.now())
  const platny = jmeno.trim().length >= 2 && email.includes("@")

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

      <p className="pl-note" style={{ marginTop: 8, maxWidth: 640 }}>
        {t.koucSoukromi}
      </p>

      {chyba && (
        <p className="pl-note" style={{ color: "var(--wm-red)" }}>
          {chyba}
        </p>
      )}

      {/* ── nový deník ───────────────────────────────────────────────────── */}
      {formOtevren && (
        <div className="pl-card" style={{ marginTop: 14, maxWidth: 640 }}>
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
                  <button
                    key={j}
                    type="button"
                    data-active={jazyk === j}
                    onClick={() => setJazyk(j)}
                  >
                    {KOD_JAZYKA[j]}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div style={{ marginTop: 18 }}>
            <span className="pl-label">Co z deníku uvidíš</span>
            <div className="pl-volby">
              {UROVNE.map((u) => (
                <button
                  key={u.klic}
                  type="button"
                  className="pl-volba"
                  data-active={sdileni === u.klic}
                  onClick={() => setSdileni(u.klic)}
                >
                  <span className="pl-volba-n">{u.nazev}</span>
                  <span className="pl-volba-p">{u.popis}</span>
                </button>
              ))}
            </div>
            <p className="pl-note" style={{ marginTop: 8 }}>
              Klient uvidí tuhle volbu na svém účtu, ať zvolíš cokoli.
            </p>
          </div>

          <div style={{ display: "flex", gap: 10, marginTop: 18, flexWrap: "wrap" }}>
            <button
              type="button"
              className="pl-btn pl-btn-primary"
              disabled={zaneprazdneno || !platny}
              onClick={() => void zalozSHeslem()}
            >
              Založit s heslem
            </button>
            <button
              type="button"
              className="pl-btn"
              disabled={zaneprazdneno || !platny}
              onClick={() => void zalozOdkazem()}
            >
              Založit odkazem
            </button>
          </div>
          <p className="pl-note" style={{ marginTop: 8, marginBottom: 0 }}>
            S heslem: dostaneš přihlašovací údaje a předáš je klientovi sám. Odkazem: pošleš
            jednorázový odkaz a heslo si zvolí klient, takže ho nikdo jiný nezná.
          </p>
        </div>
      )}

      {/* ── vygenerované přihlášení ──────────────────────────────────────── */}
      {pristup && (
        <div className="pl-card pl-heslo" style={{ marginTop: 14, maxWidth: 640 }}>
          <div className="pl-card-label">Přihlášení pro klienta {pristup.jmeno}</div>
          <dl className="pl-udaje">
            <dt>Adresa</dt>
            <dd>{origin}/planner</dd>
            <dt>E-mail</dt>
            <dd>{pristup.email}</dd>
            <dt>Heslo</dt>
            <dd className="pl-heslo-v">{pristup.heslo}</dd>
          </dl>
          <div style={{ display: "flex", gap: 10, marginTop: 12, flexWrap: "wrap" }}>
            <button
              type="button"
              className="pl-btn"
              onClick={() => {
                void navigator.clipboard.writeText(
                  `Přihlášení do deníku\nAdresa: ${origin}/planner\nE-mail: ${pristup.email}\nHeslo: ${pristup.heslo}\n\nPři prvním přihlášení si nastav vlastní heslo.`,
                )
                setZkopirovano(true)
              }}
            >
              {zkopirovano ? t.koucZkopirovano : "Zkopírovat celé"}
            </button>
            <button type="button" className="pl-btn pl-btn-quiet" onClick={() => setPristup(null)}>
              Skrýt
            </button>
          </div>
          <p className="pl-note" style={{ marginTop: 10, marginBottom: 0 }}>
            Heslo se ukládá jen jako otisk, takže ho tu podruhé nezobrazíš, jen vygeneruješ nové.
            Klient si při prvním přihlášení musí nastavit vlastní, tímhle se dovnitř dostane jen
            jednou.
          </p>
        </div>
      )}

      {/* ── vytvořený odkaz ──────────────────────────────────────────────── */}
      {novyOdkaz && (
        <div className="pl-card" style={{ marginTop: 14, maxWidth: 640 }}>
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
          <div className="pl-scroll">
            <table className="pl-table" style={{ marginTop: 8, minWidth: 720 }}>
              <thead>
                <tr>
                  <th>Klient</th>
                  <th className="pl-num">Dnů</th>
                  <th className="pl-num">{t.koucPosledniZapis}</th>
                  <th>Vidíš</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {klienti.map((k) => (
                  <tr key={k.id} style={{ opacity: k.active ? 1 : 0.5 }}>
                    <td>
                      <div>{k.name}</div>
                      <div style={{ color: "var(--wm-text-3)", fontSize: 12 }}>
                        {k.email} · {KOD_JAZYKA[k.lang]}
                        {k.cekaNaZmenuHesla && " · čeká na vlastní heslo"}
                      </div>
                    </td>
                    <td className="pl-num">{k.dnu}</td>
                    <td className="pl-num" style={{ color: "var(--wm-text-2)" }}>
                      {k.posledniZapis ?? "–"}
                    </td>
                    <td>
                      <select
                        className="pl-input"
                        style={{ width: "auto", padding: "5px 8px", fontSize: 13 }}
                        value={k.sdileni}
                        disabled={zaneprazdneno}
                        aria-label={`Co vidíš z deníku klienta ${k.name}`}
                        onChange={(e) => zmenUroven(k.id, e.target.value as UrovenSdileni)}
                      >
                        {UROVNE.map((u) => (
                          <option key={u.klic} value={u.klic}>
                            {NAZEV_UROVNE[u.klic]}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="pl-num">
                      <div
                        style={{
                          display: "flex",
                          gap: 6,
                          justifyContent: "flex-end",
                          flexWrap: "wrap",
                        }}
                      >
                        <button
                          type="button"
                          className="pl-btn pl-btn-quiet"
                          disabled={k.sdileni === "nic"}
                          title={
                            k.sdileni === "nic"
                              ? "Tenhle klient ti obsah deníku nesdílí."
                              : undefined
                          }
                          onClick={() => setOtevreny(otevreny === k.id ? null : k.id)}
                        >
                          {otevreny === k.id ? "Zavřít" : "Otevřít"}
                        </button>
                        <button
                          type="button"
                          className="pl-btn pl-btn-quiet"
                          disabled={zaneprazdneno}
                          onClick={() => void noveHeslo(k)}
                        >
                          Nové heslo
                        </button>
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
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {otevreny && (
        <CoachClientDetail
          key={otevreny}
          sessionToken={sessionToken}
          clientId={otevreny}
          lang={lang}
          onZavrit={() => setOtevreny(null)}
        />
      )}

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
                      · {t.koucCekaNaAktivaci} · uvidíš {NAZEV_UROVNE[p.sdileni]}
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
