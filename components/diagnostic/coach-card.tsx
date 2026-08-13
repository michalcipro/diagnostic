"use client"

import { useState } from "react"
import type { CoachRow } from "@/lib/diagnostic/remote"

// Karta jednoho účtu v přehledu master účtu.
//
// Umí úpravu jména a kontaktů, vystavení nového hesla a zablokování přístupu.
// Nové heslo se ukazuje jen jednou hned po vystavení: v databázi je uložený
// pouze hash, takže znovu ho vypsat nejde a je potřeba ho rovnou předat.

const STITEK_ROLE: Record<CoachRow["role"], string | null> = {
  master: "master",
  coach: null,
  external: "externí",
}

export function CoachCard({
  coach,
  jaSam,
  onSave,
  onReset,
  onToggleActive,
}: {
  coach: CoachRow
  /** vlastní účet: heslo si master mění jinudy, přes stávající heslo */
  jaSam: boolean
  onSave: (data: { name: string; email: string; phone?: string; note?: string }) => Promise<void>
  onReset: () => Promise<string>
  onToggleActive: () => Promise<void>
}) {
  const [upravuji, setUpravuji] = useState(false)
  const [uklada, setUklada] = useState(false)
  const [name, setName] = useState(coach.name)
  const [email, setEmail] = useState(coach.email)
  const [phone, setPhone] = useState(coach.phone ?? "")
  const [note, setNote] = useState(coach.note ?? "")
  const [noveHeslo, setNoveHeslo] = useState<string | null>(null)
  const [zkopirovano, setZkopirovano] = useState(false)
  const [resetuji, setResetuji] = useState(false)

  const stitek = STITEK_ROLE[coach.role]

  const uloz = async () => {
    setUklada(true)
    try {
      await onSave({ name, email, phone, note })
      setUpravuji(false)
    } finally {
      setUklada(false)
    }
  }

  const zrus = () => {
    setName(coach.name)
    setEmail(coach.email)
    setPhone(coach.phone ?? "")
    setNote(coach.note ?? "")
    setUpravuji(false)
  }

  const vystavHeslo = async () => {
    if (
      !window.confirm(
        `Vystavit nové heslo pro účet ${coach.name}?\n\nStávající heslo přestane platit a kouč bude odhlášený na všech zařízeních. Nové heslo se zobrazí jen jednou, hned teď.`,
      )
    ) {
      return
    }
    setResetuji(true)
    try {
      setNoveHeslo(await onReset())
      setZkopirovano(false)
    } finally {
      setResetuji(false)
    }
  }

  const kopiruj = async () => {
    if (!noveHeslo) return
    try {
      await navigator.clipboard.writeText(noveHeslo)
      setZkopirovano(true)
      window.setTimeout(() => setZkopirovano(false), 2000)
    } catch {
      window.prompt("Zkopíruj heslo:", noveHeslo)
    }
  }

  return (
    <article className="diag-card p-5">
      {!upravuji ? (
        <div className="flex flex-wrap items-start gap-4">
          <div className="min-w-[200px] flex-1">
            <h3 className="flex flex-wrap items-center gap-2 text-[16px] font-semibold tracking-tight">
              {coach.name}
              {stitek && (
                <span className="rounded-full bg-[var(--wm-fill-4)] px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-[var(--wm-text-2)]">
                  {stitek}
                </span>
              )}
              {!coach.active && (
                <span className="rounded-full bg-[var(--wm-red-light)] px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-[var(--wm-invalid-fg)]">
                  zablokován
                </span>
              )}
            </h3>
            <p className="mt-0.5 text-[13px] text-[var(--wm-text-2)]">
              {coach.email}
              {coach.phone && <span className="text-[var(--wm-text-3)]"> · {coach.phone}</span>}
            </p>
            {coach.note && (
              <p className="mt-1 text-[12.5px] leading-relaxed text-[var(--wm-text-3)]">
                {coach.note}
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setUpravuji(true)}
              className="diag-press inline-flex h-10 items-center rounded-full border border-[var(--wm-border)] bg-[var(--wm-surface)] px-4 text-[13px] font-semibold text-[var(--wm-text)] transition-colors hover:bg-[var(--wm-fill-4)]"
            >
              Upravit
            </button>
            {!jaSam && (
              <button
                type="button"
                disabled={resetuji}
                onClick={() => void vystavHeslo()}
                className="diag-press inline-flex h-10 items-center rounded-full border border-[var(--wm-border)] bg-[var(--wm-surface)] px-4 text-[13px] font-semibold text-[var(--wm-text)] transition-colors hover:bg-[var(--wm-fill-4)] disabled:opacity-50"
              >
                {resetuji ? "Vystavuji…" : "Nové heslo"}
              </button>
            )}
            {coach.role !== "master" && (
              <button
                type="button"
                onClick={() => void onToggleActive()}
                className="diag-press inline-flex h-10 items-center rounded-full border border-[var(--wm-border)] bg-[var(--wm-surface)] px-4 text-[13px] font-semibold text-[var(--wm-text)] transition-colors hover:bg-[var(--wm-fill-4)]"
              >
                {coach.active ? "Zablokovat" : "Obnovit přístup"}
              </button>
            )}
          </div>
        </div>
      ) : (
        <div>
          <h3 className="text-[16px] font-semibold tracking-tight">Upravit účet</h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-[13px] font-medium text-[var(--wm-text-2)]">
                Jméno
              </span>
              <input className="diag-input" value={name} onChange={(e) => setName(e.target.value)} />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-[13px] font-medium text-[var(--wm-text-2)]">
                E-mail (zároveň přihlašovací jméno)
              </span>
              <input
                type="email"
                className="diag-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-[13px] font-medium text-[var(--wm-text-2)]">
                Telefon
              </span>
              <input
                className="diag-input"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="nepovinné"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-[13px] font-medium text-[var(--wm-text-2)]">
                Poznámka
              </span>
              <input className="diag-input" value={note} onChange={(e) => setNote(e.target.value)} />
            </label>
          </div>
          <div className="mt-5 flex items-center gap-3">
            <button
              type="button"
              disabled={uklada || name.trim().length < 2 || !email.includes("@")}
              onClick={() => void uloz()}
              className="diag-press inline-flex h-10 items-center rounded-full bg-[var(--wm-brand)] px-5 text-[14px] font-semibold text-[var(--wm-brand-fg)] transition-opacity hover:opacity-85 disabled:opacity-40"
            >
              {uklada ? "Ukládám…" : "Uložit"}
            </button>
            <button
              type="button"
              onClick={zrus}
              className="text-[14px] font-semibold text-[var(--wm-text-2)] hover:text-[var(--wm-text)]"
            >
              Zrušit
            </button>
          </div>
        </div>
      )}

      {noveHeslo && (
        <div className="mt-4 rounded-xl border border-[var(--wm-orange)] bg-[var(--wm-orange-light)] p-4">
          <p className="text-[13px] font-semibold text-[var(--wm-caution-fg)]">
            Nové heslo pro {coach.name}. Zobrazí se jen teď, uložené je pouze zašifrované.
          </p>
          <div className="mt-2.5 flex flex-wrap items-center gap-3">
            <code className="select-all rounded-lg bg-[var(--wm-surface)] px-3 py-2 text-[16px] font-semibold tracking-wide">
              {noveHeslo}
            </code>
            <button
              type="button"
              onClick={() => void kopiruj()}
              className="diag-press inline-flex h-9 items-center rounded-full border border-[var(--wm-border)] bg-[var(--wm-surface)] px-4 text-[13px] font-semibold text-[var(--wm-text)]"
            >
              {zkopirovano ? "Zkopírováno ✓" : "Kopírovat"}
            </button>
            <button
              type="button"
              onClick={() => setNoveHeslo(null)}
              className="text-[13px] font-semibold text-[var(--wm-text-2)] hover:text-[var(--wm-text)]"
            >
              Skrýt
            </button>
          </div>
          <p className="mt-2.5 text-[12.5px] leading-relaxed text-[var(--wm-caution-fg)] opacity-90">
            Kouč byl odhlášený na všech zařízeních. Předej mu heslo bezpečnou cestou a řekni mu, ať
            si ho po přihlášení změní.
          </p>
        </div>
      )}
    </article>
  )
}
