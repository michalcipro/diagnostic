"use client"

import { use, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { JAZYKY, KOD_JAZYKA } from "@/lib/diagnostic/lang"
import type { Lang } from "@/lib/diagnostic/types"
import { UI } from "@/lib/planner/i18n"
import { zkontrolujHeslo } from "@/lib/planner/heslo"
import { activate, chybaText, fetchPlannerInvite, isRemoteEnabled, type PlannerInvite } from "@/lib/planner/remote"
import { nactiTema, ulozJazyk, ulozRelaci } from "@/lib/planner/storage"
import type { Tema } from "@/lib/planner/storage"

// Založení deníku z pozvánky.
//
// Klient přijde na odkaz od kouče a zvolí si heslo. Účet tím vznikne a
// pozvánka se spotřebuje, takže tudy nejde založit druhý deník ani se
// zaregistrovat bez pozvánky. Jméno a e-mail se ukazují jen proto, aby bylo
// vidět, komu odkaz patří; měnit se tu nedají.

export default function PlannerStartPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params)
  const router = useRouter()

  // Motiv se čte i tady, ať zakládání deníku vypadá stejně jako zbytek
  // aplikace. Načítá se v efektu, ne při prvním vykreslení, aby se výsledek
  // na serveru nerozešel s prohlížečem.
  const [tema, setTema] = useState<Tema>("svetle")
  const [pozvanka, setPozvanka] = useState<PlannerInvite | null>(null)
  const [lang, setLang] = useState<Lang>("cs")
  const [heslo, setHeslo] = useState("")
  const [znovu, setZnovu] = useState("")
  const [zakladam, setZakladam] = useState(false)
  const [chyba, setChyba] = useState<string | null>(null)

  useEffect(() => {
    const ulozeneTema = nactiTema()
    if (ulozeneTema) setTema(ulozeneTema)
    if (!isRemoteEnabled()) {
      setPozvanka({ status: "notfound" })
      return
    }
    let zive = true
    fetchPlannerInvite(token)
      .then((p) => {
        if (!zive) return
        setPozvanka(p)
        if (p.lang) setLang(p.lang)
      })
      .catch(() => zive && setPozvanka({ status: "notfound" }))
    return () => {
      zive = false
    }
  }, [token])

  const t = UI[lang]

  const zaloz = async () => {
    setChyba(null)
    if (heslo !== znovu) {
      setChyba(t.hesloNesouhlasi)
      return
    }
    const problem = zkontrolujHeslo(heslo, lang, pozvanka?.email, pozvanka?.name)
    if (problem) {
      setChyba(problem)
      return
    }
    setZakladam(true)
    try {
      const r = await activate(token, heslo)
      ulozRelaci(r.sessionToken)
      ulozJazyk(r.lang)
      router.push("/planner")
    } catch (e) {
      setChyba(chybaText(e, t.pozvankaNeplatna))
    } finally {
      setZakladam(false)
    }
  }

  if (pozvanka === null) {
    return (
      <div className="pl-root" data-tema={tema}>
        <div className="pl-wrap" style={{ paddingTop: 90, maxWidth: 420 }}>
          <p className="pl-note">{UI.cs.nacitam}</p>
        </div>
      </div>
    )
  }

  if (pozvanka.status !== "ok") {
    const hlaska =
      pozvanka.status === "used"
        ? t.pozvankaPouzita
        : pozvanka.status === "expired"
          ? t.pozvankaVyprsela
          : t.pozvankaNeplatna
    return (
      <div className="pl-root" data-tema={tema}>
        <div className="pl-wrap" style={{ paddingTop: 90, maxWidth: 420 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, margin: "0 0 8px" }}>{t.aktivaceNadpis}</h1>
          <p className="pl-note">{hlaska}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="pl-root" data-tema={tema}>
      <div className="pl-wrap" style={{ paddingTop: 80, maxWidth: 420 }}>
        <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.18em", margin: 0 }}>
          WINNING MINDS
        </p>
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: "10px 0 4px" }}>{t.aktivaceNadpis}</h1>
        <p className="pl-note" style={{ marginTop: 0 }}>
          {t.aktivacePodtitul}
        </p>

        <div className="pl-card" style={{ marginTop: 16 }}>
          <div className="pl-card-label">{pozvanka.name}</div>
          <div className="pl-card-note" style={{ marginTop: 2 }}>
            {pozvanka.email}
          </div>

          <div style={{ marginTop: 14 }}>
            <label className="pl-label" htmlFor="start-heslo">
              {t.noveHeslo}
            </label>
            <input
              id="start-heslo"
              className="pl-input"
              type="password"
              autoComplete="new-password"
              value={heslo}
              onChange={(e) => setHeslo(e.target.value)}
            />
          </div>
          <div style={{ marginTop: 12 }}>
            <label className="pl-label" htmlFor="start-heslo-znovu">
              {t.noveHesloZnovu}
            </label>
            <input
              id="start-heslo-znovu"
              className="pl-input"
              type="password"
              autoComplete="new-password"
              value={znovu}
              onChange={(e) => setZnovu(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && heslo && znovu) void zaloz()
              }}
            />
          </div>

          <button
            type="button"
            className="pl-btn pl-btn-primary"
            style={{ width: "100%", marginTop: 16, padding: "10px 14px" }}
            disabled={zakladam || !heslo || !znovu}
            onClick={() => void zaloz()}
          >
            {t.zalozitUcet}
          </button>

          {chyba && (
            <p className="pl-note" style={{ color: "var(--wm-red)", marginBottom: 0 }}>
              {chyba}
            </p>
          )}
        </div>

        <div className="pl-tabs" style={{ marginTop: 18 }}>
          {JAZYKY.map((j) => (
            <button key={j} type="button" data-active={lang === j} onClick={() => setLang(j)}>
              {KOD_JAZYKA[j]}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
