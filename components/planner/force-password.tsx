"use client"

import { useState } from "react"
import type { Gender, Lang } from "@/lib/diagnostic/types"
import { applyGender } from "@/lib/diagnostic/gender"
import { UI } from "@/lib/planner/i18n"
import { zkontrolujHeslo } from "@/lib/planner/heslo"

// Vynucená změna hesla po prvním přihlášení.
//
// Sem se dostane klient, kterému deník založil kouč a nadiktoval mu dočasné
// heslo. To heslo prošlo cizí schránkou, takže musí co nejdřív přestat
// platit: dokud si klient nezvolí vlastní, dál než na tuhle obrazovku se
// nedostane. Neschovává se za nastavení a nejde přeskočit, protože přeskočená
// změna hesla se neudělá nikdy.
//
// Server po změně ukončí všechny relace včetně téhle, proto se na konci
// klient přihlašuje znovu. Není to opomenutí: přesně to má změna hesla dělat.

export interface ForcePasswordProps {
  lang: Lang
  email: string
  jmeno: string
  gender: Gender
  onZmenit: (stavajici: string, nove: string) => Promise<void>
  onHotovo: () => void
  onOdhlasit: () => void
}

export function ForcePassword(props: ForcePasswordProps) {
  const { lang, email, jmeno, gender } = props
  const t = UI[lang]

  const [stavajici, setStavajici] = useState("")
  const [nove, setNove] = useState("")
  const [znovu, setZnovu] = useState("")
  const [chyba, setChyba] = useState<string | null>(null)
  const [hotovo, setHotovo] = useState(false)
  const [pracuji, setPracuji] = useState(false)

  const zmen = async () => {
    setChyba(null)
    if (nove !== znovu) {
      setChyba(t.hesloNesouhlasi)
      return
    }
    const problem = zkontrolujHeslo(nove, lang, email, jmeno)
    if (problem) {
      setChyba(problem)
      return
    }
    setPracuji(true)
    try {
      await props.onZmenit(stavajici, nove)
      setHotovo(true)
    } catch (e) {
      setChyba(e instanceof Error ? e.message : String(e))
    } finally {
      setPracuji(false)
    }
  }

  return (
    <div className="pl-root pl-prihlaseni">
      <div className="pl-prihlaseni-obal pl-anim">
        <div className="pl-znacka">WINNING MINDS</div>
        <h1 className="pl-prihlaseni-titul">{t.zmenHesloNadpis}</h1>
        <p className="pl-prihlaseni-pod">{applyGender(t.zmenHesloPopis, gender)}</p>

        {hotovo ? (
          <div className="pl-card pl-prihlaseni-karta">
            <p style={{ margin: 0, fontSize: 15, lineHeight: 1.55 }}>{t.zmenHesloHotovo}</p>
            <button
              type="button"
              className="pl-btn pl-btn-primary"
              style={{ marginTop: 14 }}
              onClick={props.onHotovo}
            >
              {t.prihlasit}
            </button>
          </div>
        ) : (
          <div className="pl-card pl-prihlaseni-karta">
            <label className="pl-label" htmlFor="zh-stav">
              {t.stavajiciHeslo}
            </label>
            <input
              id="zh-stav"
              className="pl-input"
              type="password"
              autoComplete="current-password"
              value={stavajici}
              onChange={(e) => setStavajici(e.target.value)}
            />

            <div style={{ marginTop: 12 }}>
              <label className="pl-label" htmlFor="zh-nove">
                {t.noveHeslo}
              </label>
              <input
                id="zh-nove"
                className="pl-input"
                type="password"
                autoComplete="new-password"
                value={nove}
                onChange={(e) => setNove(e.target.value)}
              />
            </div>

            <div style={{ marginTop: 12 }}>
              <label className="pl-label" htmlFor="zh-znovu">
                {t.noveHesloZnovu}
              </label>
              <input
                id="zh-znovu"
                className="pl-input"
                type="password"
                autoComplete="new-password"
                value={znovu}
                onChange={(e) => setZnovu(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") void zmen()
                }}
              />
            </div>

            {chyba && (
              <p className="pl-status" data-state="error" style={{ marginTop: 12 }}>
                {chyba}
              </p>
            )}

            <button
              type="button"
              className="pl-btn pl-btn-akcent"
              style={{ width: "100%", marginTop: 16, minHeight: 46 }}
              disabled={pracuji || !stavajici || !nove || !znovu}
              onClick={() => void zmen()}
            >
              {t.zmenaHesla}
            </button>
          </div>
        )}

        <button
          type="button"
          className="pl-btn pl-btn-quiet"
          style={{ marginTop: 14, alignSelf: "flex-start" }}
          onClick={props.onOdhlasit}
        >
          {t.odhlasit}
        </button>
      </div>
    </div>
  )
}
