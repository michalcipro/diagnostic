"use client"

import { use, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  VERZE_FRONTENDU,
  chybaText,
  createMaster,
  isRemoteEnabled,
  needsSetup,
} from "@/lib/diagnostic/remote"

const SESSION_KEY = "wm-diagnostic:session"

// Jednorázové založení master účtu.
//
// Odkaz projde jen tehdy, když sedí zakládací token A zároveň zatím neexistuje
// žádný kouč. Jakmile master vznikne, odkaz je nadobro mrtvý — druhý účet už
// tudy založit nejde.
export default function SetupPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params)
  const router = useRouter()

  const [state, setState] = useState<"checking" | "ready" | "done" | "unavailable">("checking")
  const [verzeBackendu, setVerzeBackendu] = useState("?")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [password2, setPassword2] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!isRemoteEnabled()) {
      setState("unavailable")
      return
    }
    let active = true
    needsSetup()
      .then((stav) => {
        if (!active) return
        setVerzeBackendu(stav.verze)
        setState(stav.needsSetup ? "ready" : "done")
      })
      .catch(() => active && setState("unavailable"))
    return () => {
      active = false
    }
  }, [])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (password !== password2) {
      setError("Hesla se neshodují.")
      return
    }
    if (password.length < 10) {
      setError("Heslo musí mít alespoň 10 znaků.")
      return
    }
    setBusy(true)
    try {
      const res = await createMaster(token, name, email, password)
      window.localStorage.setItem(SESSION_KEY, res.sessionToken)
      router.push("/kouc")
    } catch (err) {
      setError(
        chybaText(
          err,
          "Účet se nepodařilo založit a server neposlal důvod. Přesný text chyby najdeš v Convexu v záložce Logs u funkce auth:createMaster.",
        ),
      )
    } finally {
      setBusy(false)
    }
  }

  if (state === "checking") return null

  if (state !== "ready") {
    return (
      <div className="diag-container flex min-h-screen items-center justify-center py-20">
        <div className="diag-card max-w-md p-8 text-center">
          <p className="text-[12px] font-bold tracking-[0.18em] text-[var(--wm-text-3)]">WINNING MINDS</p>
          <h1 className="mt-3 text-[20px] font-bold tracking-tight">
            {state === "done" ? "Účet už je založený" : "Zakládání není dostupné"}
          </h1>
          <p className="mt-3 text-[15px] leading-relaxed text-[var(--wm-text-2)]">
            {state === "done"
              ? "Master účet už existuje, takže tento odkaz je nadobro neplatný. Přihlas se svým e-mailem a heslem."
              : "Nepodařilo se spojit se serverem. Zkontroluj nastavení Convexu."}
          </p>
          {state === "done" && (
            <a
              href="/kouc"
              className="diag-press mt-6 inline-flex h-11 items-center rounded-full bg-[var(--wm-brand)] px-6 text-[15px] font-semibold text-[var(--wm-brand-fg)] transition-opacity hover:opacity-85"
            >
              Přejít na přihlášení
            </a>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="diag-container flex min-h-screen flex-col items-center justify-center py-20">
      <form onSubmit={submit} className="diag-card w-full max-w-md p-8">
        <p className="text-[12px] font-bold tracking-[0.18em] text-[var(--wm-text-3)]">WINNING MINDS</p>
        <h1 className="mt-2 text-[24px] font-bold tracking-tight">Založení master účtu</h1>
        <p className="mt-2 text-[14px] leading-relaxed text-[var(--wm-text-2)]">
          Tímto odkazem vznikne jediný správcovský účet aplikace. Po odeslání formuláře odkaz
          nadobro přestane platit a další účty budeš moci přidat už jen ty sám z přehledu.
        </p>

        <div className="mt-6 flex flex-col gap-4">
          <label className="block">
            <span className="mb-1.5 block text-[13px] font-medium text-[var(--wm-text-2)]">Jméno a příjmení</span>
            <input
              className="diag-input"
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Michal Cipro"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[13px] font-medium text-[var(--wm-text-2)]">E-mail</span>
            <input
              type="email"
              className="diag-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="michal@winningminds.cz"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[13px] font-medium text-[var(--wm-text-2)]">
              Heslo <span className="font-normal text-[var(--wm-text-3)]">· nejméně 10 znaků</span>
            </span>
            <input
              type="password"
              className="diag-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[13px] font-medium text-[var(--wm-text-2)]">Heslo pro kontrolu</span>
            <input
              type="password"
              className="diag-input"
              value={password2}
              onChange={(e) => setPassword2(e.target.value)}
            />
          </label>
        </div>

        {error && (
          <p className="mt-4 rounded-xl bg-[var(--wm-red-light)] p-3 text-[13px] font-medium text-[var(--wm-invalid-fg)]">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={busy || !name.trim() || !email.trim() || !password || !password2}
          className="diag-press mt-6 inline-flex h-12 w-full items-center justify-center rounded-full bg-[var(--wm-brand)] text-[16px] font-semibold text-[var(--wm-brand-fg)] transition-opacity hover:opacity-85 disabled:opacity-40"
        >
          {busy ? "Zakládám…" : "Založit master účet"}
        </button>

        <p className="mt-4 text-[12px] leading-relaxed text-[var(--wm-text-3)]">
          Heslo se ukládá pouze v zašifrované podobě, ze které ho nelze zpětně přečíst — ani
          správce databáze ho neuvidí. Ulož si ho proto na bezpečné místo.
        </p>
      </form>

      <p className="mt-6 text-center text-[12px] text-[var(--wm-text-3)]">
        Winning Minds s.r.o. · Praha 6 · winningminds.cz · Důvěrný dokument
      </p>
      {/*
        Označení verze. Když se čísla liší, drží prohlížeč starou stránku nebo
        ještě neproběhlo nasazení — pak nemá smysl řešit samotnou chybu.
      */}
      <p className="mt-1.5 text-center font-mono text-[11px] text-[var(--wm-text-3)]">
        aplikace v{VERZE_FRONTENDU} · server v{verzeBackendu}
      </p>
    </div>
  )
}
