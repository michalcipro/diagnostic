"use client"

import { useState } from "react"
import type { Gender, Lang } from "@/lib/diagnostic/types"
import { JAZYKY, KOD_JAZYKA } from "@/lib/diagnostic/lang"
import { UI } from "@/lib/planner/i18n"
import { zkontrolujHeslo } from "@/lib/planner/heslo"
import type { PlannerIdentity } from "@/lib/planner/types"

// Účet klienta: jméno, rod, jazyk, heslo a odnesení dat.
//
// E-mail se tudy měnit nedá – drží účet a měnit ho smí kouč, který deník
// založil. Rod tu je proto, že na něm stojí správné české a slovenské tvary
// ve shrnutí statistik; kdo si ho přepne, změní se text okamžitě.

export interface AccountPanelProps {
  lang: Lang
  ja: PlannerIdentity
  zaneprazdneno: boolean
  onUlozit: (jmeno: string, gender: Gender | undefined, lang: Lang) => Promise<void>
  onZmenaHesla: (stavajici: string, nove: string) => Promise<void>
  onOdhlasitVsude: () => Promise<void>
  onExport: () => Promise<void>
  onOdhlasit: () => void
}

export function AccountPanel(props: AccountPanelProps) {
  const { lang, ja, zaneprazdneno } = props
  const t = UI[lang]

  const [jmeno, setJmeno] = useState(ja.name)
  const [gender, setGender] = useState<Gender | undefined>(ja.gender)
  const [jazyk, setJazyk] = useState<Lang>(lang)
  const [ulozeno, setUlozeno] = useState(false)
  const [chyba, setChyba] = useState<string | null>(null)

  const [stavajici, setStavajici] = useState("")
  const [nove, setNove] = useState("")
  const [znovu, setZnovu] = useState("")
  const [hesloHotovo, setHesloHotovo] = useState(false)
  const [hesloChyba, setHesloChyba] = useState<string | null>(null)

  const ulozProfil = async () => {
    setChyba(null)
    setUlozeno(false)
    try {
      await props.onUlozit(jmeno.trim(), gender, jazyk)
      setUlozeno(true)
    } catch (e) {
      setChyba(e instanceof Error ? e.message : String(e))
    }
  }

  const zmenHeslo = async () => {
    setHesloChyba(null)
    setHesloHotovo(false)
    if (nove !== znovu) {
      setHesloChyba(t.hesloNesouhlasi)
      return
    }
    const problem = zkontrolujHeslo(nove, lang, ja.email, ja.name)
    if (problem) {
      setHesloChyba(problem)
      return
    }
    try {
      await props.onZmenaHesla(stavajici, nove)
      setHesloHotovo(true)
      setStavajici("")
      setNove("")
      setZnovu("")
    } catch (e) {
      setHesloChyba(e instanceof Error ? e.message : String(e))
    }
  }

  return (
    <div style={{ marginTop: 16, maxWidth: 560 }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, margin: "0 0 14px" }}>{t.ucetNadpis}</h2>

      <div className="pl-card">
        <label className="pl-label" htmlFor="ucet-jmeno">
          {t.jmeno}
        </label>
        <input
          id="ucet-jmeno"
          className="pl-input"
          value={jmeno}
          maxLength={120}
          onChange={(e) => setJmeno(e.target.value)}
        />

        <div style={{ marginTop: 14 }}>
          <span className="pl-label">{t.rod}</span>
          <div style={{ display: "flex", gap: 8 }}>
            {(["male", "female"] as Gender[]).map((g) => (
              <button
                key={g}
                type="button"
                className="pl-btn"
                aria-pressed={gender === g}
                onClick={() => setGender(gender === g ? undefined : g)}
                style={{
                  background: gender === g ? "var(--wm-brand)" : "var(--wm-surface)",
                  color: gender === g ? "var(--wm-brand-fg)" : "var(--wm-text-2)",
                  borderColor: gender === g ? "var(--wm-brand)" : "var(--wm-border-light)",
                }}
              >
                {g === "male" ? t.rodMuz : t.rodZena}
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginTop: 14 }}>
          <span className="pl-label">{t.jazyk}</span>
          <div className="pl-tabs">
            {JAZYKY.map((j) => (
              <button key={j} type="button" data-active={jazyk === j} onClick={() => setJazyk(j)}>
                {KOD_JAZYKA[j]}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 16 }}>
          <button
            type="button"
            className="pl-btn pl-btn-primary"
            disabled={zaneprazdneno || jmeno.trim().length < 2}
            onClick={ulozProfil}
          >
            {t.ulozit}
          </button>
          {ulozeno && <span className="pl-status">{t.ulozeno}</span>}
          {chyba && (
            <span className="pl-status" data-state="error">
              {chyba}
            </span>
          )}
        </div>
      </div>

      {/* ── heslo ────────────────────────────────────────────────────────── */}
      <div className="pl-card" style={{ marginTop: 14 }}>
        <div className="pl-card-label">{t.zmenaHesla}</div>
        <div style={{ marginTop: 10 }}>
          <label className="pl-label" htmlFor="ucet-heslo-stare">
            {t.stavajiciHeslo}
          </label>
          <input
            id="ucet-heslo-stare"
            className="pl-input"
            type="password"
            autoComplete="current-password"
            value={stavajici}
            onChange={(e) => setStavajici(e.target.value)}
          />
        </div>
        <div style={{ marginTop: 10 }}>
          <label className="pl-label" htmlFor="ucet-heslo-nove">
            {t.noveHeslo}
          </label>
          <input
            id="ucet-heslo-nove"
            className="pl-input"
            type="password"
            autoComplete="new-password"
            value={nove}
            onChange={(e) => setNove(e.target.value)}
          />
        </div>
        <div style={{ marginTop: 10 }}>
          <label className="pl-label" htmlFor="ucet-heslo-znovu">
            {t.noveHesloZnovu}
          </label>
          <input
            id="ucet-heslo-znovu"
            className="pl-input"
            type="password"
            autoComplete="new-password"
            value={znovu}
            onChange={(e) => setZnovu(e.target.value)}
          />
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 14 }}>
          <button
            type="button"
            className="pl-btn"
            disabled={zaneprazdneno || !stavajici || !nove}
            onClick={zmenHeslo}
          >
            {t.zmenaHesla}
          </button>
          {hesloHotovo && <span className="pl-status">{t.ulozeno}</span>}
          {hesloChyba && (
            <span className="pl-status" data-state="error" style={{ minWidth: 0 }}>
              {hesloChyba}
            </span>
          )}
        </div>
        <p className="pl-note" style={{ marginTop: 10 }}>
          {lang === "en"
            ? "Changing the password signs you out everywhere, including this device."
            : lang === "sk"
              ? "Zmena hesla ťa odhlási všade vrátane tohto zariadenia."
              : "Změna hesla tě odhlásí všude včetně tohohle zařízení."}
        </p>
      </div>

      {/* ── data a odhlášení ─────────────────────────────────────────────── */}
      <div className="pl-card" style={{ marginTop: 14 }}>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button type="button" className="pl-btn" disabled={zaneprazdneno} onClick={props.onExport}>
            {lang === "en" ? "Download my journal" : lang === "sk" ? "Stiahnuť denník" : "Stáhnout deník"}
          </button>
          <button
            type="button"
            className="pl-btn"
            disabled={zaneprazdneno}
            onClick={props.onOdhlasitVsude}
          >
            {lang === "en"
              ? "Sign out everywhere"
              : lang === "sk"
                ? "Odhlásiť všade"
                : "Odhlásit všude"}
          </button>
          <button type="button" className="pl-btn pl-btn-quiet" onClick={props.onOdhlasit}>
            {t.odhlasit}
          </button>
        </div>
        <p className="pl-note" style={{ marginTop: 10 }}>
          {lang === "en"
            ? "The download contains everything you have written, as a JSON file."
            : lang === "sk"
              ? "Stiahnutý súbor obsahuje všetko, čo je v denníku napísané, vo formáte JSON."
              : "Stažený soubor obsahuje všechno, co je v deníku napsané, ve formátu JSON."}
        </p>
      </div>
    </div>
  )
}
