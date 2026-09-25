"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { UI } from "@/lib/diagnostic/i18n"
import { applyGender } from "@/lib/diagnostic/gender"
import { odesliElitePro } from "@/lib/diagnostic/remote"
import type { Gender, PersonInfo } from "@/lib/diagnostic/types"
import {
  KONTEXT_OTAZKY,
  POHODA_OTAZKY,
  POHODA_STUPNICE,
  POMOC,
  PORADI_BLOKU,
  SPANEK_OTAZKY,
  STUPNICE,
  T,
  nactiDotaznik,
  type DataDotazniku,
} from "@/lib/elitepro/dotaznik"
import { SPANEK_BUDIK, VELIKOST_FORMY } from "@/lib/elitepro/spolecne"

// Dotazník ELITE Pro.
//
// Jiná stavba než ostatní testy: čtyři druhy otázek (tvrzení na souhlas
// a na četnost, situace se čtyřmi reakcemi, časy spánku) a na konci
// dobrovolné otázky na duševní pohodu. Proto vlastní komponenta, ne větev
// ve společném dotazníku.
//
// Které položky se ukážou, určuje server (forma podle tokenu). Tady se jen
// seřadí do bloků podle formátu a časového rámce, aby se stupnice neměnila
// u každé otázky.

const NA_STRANKU = 12

interface Relace {
  person: PersonInfo
  odpovedi: Record<number, number>
  /** dobrovolné otázky na pohodu: ano, nebo přeskočit */
  pohoda?: "ano" | "ne"
  krok: number
  startedAt: string
  finishedAt?: string
}

type Stranka =
  | { druh: "uvod" }
  | { druh: "kontext" }
  | { druh: "polozky"; blok: string; ids: number[]; od: number }
  | { druh: "vineta"; id: number; poradi: number }
  | { druh: "spanek" }
  | { druh: "pohoda" }
  | { druh: "odeslat" }

const klic = (token: string) => `wm-elitepro:t:${token}`

function nacti(token: string): Relace | null {
  try {
    const raw = window.localStorage.getItem(klic(token))
    if (!raw) return null
    const r = JSON.parse(raw) as Relace
    return r && typeof r === "object" && r.odpovedi ? r : null
  } catch {
    return null
  }
}

function uloz(token: string, r: Relace) {
  try {
    window.localStorage.setItem(klic(token), JSON.stringify(r))
  } catch {
    // plné nebo nedostupné úložiště: vyplňování jde dál bez zálohy
  }
}

function smaz(token: string) {
  try {
    window.localStorage.removeItem(klic(token))
  } catch {
    // nic
  }
}

const naMinuty = (hhmm: string): number | undefined => {
  const m = hhmm.match(/^(\d{2}):(\d{2})$/)
  if (!m) return undefined
  const x = Number(m[1]) * 60 + Number(m[2])
  return x >= 0 && x < 1440 ? x : undefined
}
const naCas = (min: number | undefined) =>
  min === undefined ? "" : `${String(Math.floor(min / 60)).padStart(2, "0")}:${String(min % 60).padStart(2, "0")}`

export function EliteProDotaznik({
  token,
  forma,
  clientName,
}: {
  token: string
  forma: { polozky: number[]; vinety: number[] }
  clientName: string
}) {
  const t = UI.cs
  const [data, setData] = useState<DataDotazniku | null>(null)
  const [relace, setRelace] = useState<Relace | null>(null)
  const [stav, setStav] = useState<"vyplnovani" | "odesilam" | "odeslano" | "selhalo">("vyplnovani")
  const [ukazChybejici, setUkazChybejici] = useState(false)
  const nahore = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let aktivni = true
    void nactiDotaznik().then((d) => aktivni && setData(d))
    return () => {
      aktivni = false
    }
  }, [])

  useEffect(() => {
    const ulozena = nacti(token)
    setRelace(
      ulozena ?? {
        person: { name: clientName, fillDate: new Date().toISOString().slice(0, 10) },
        odpovedi: {},
        krok: 0,
        startedAt: new Date().toISOString(),
      },
    )
  }, [token, clientName])

  useEffect(() => {
    if (relace && stav === "vyplnovani") uloz(token, relace)
  }, [token, relace, stav])

  const stranky = useMemo<Stranka[]>(() => {
    if (!data) return []
    const out: Stranka[] = [{ druh: "uvod" }, { druh: "kontext" }]
    let od = 1
    for (const b of PORADI_BLOKU) {
      const ids = forma.polozky.filter((id) => data.polozky[id]?.f === b.f && data.polozky[id]?.r === b.r)
      for (let i = 0; i < ids.length; i += NA_STRANKU) {
        const cast = ids.slice(i, i + NA_STRANKU)
        out.push({ druh: "polozky", blok: `${b.r}-${b.f}`, ids: cast, od })
        od += cast.length
      }
    }
    forma.vinety.forEach((id, i) => out.push({ druh: "vineta", id, poradi: i + 1 }))
    out.push({ druh: "spanek" }, { druh: "pohoda" }, { druh: "odeslat" })
    return out
  }, [data, forma])

  if (!data || !relace || stranky.length === 0) return null

  const pohlavi: Gender = relace.person.gender ?? "male"
  const g = (text: string) => applyGender(text, pohlavi)
  const krok = Math.min(relace.krok, stranky.length - 1)
  const stranka = stranky[krok]
  const odp = relace.odpovedi
  const celkemPolozek = forma.polozky.length

  const reakceFormy = forma.vinety.flatMap((v) => data.vinety[v]?.r.map(([id]) => id) ?? [])
  const zodpovezeno = [...forma.polozky, ...reakceFormy].filter((id) => odp[id] !== undefined).length

  const nastav = (id: number, x: number | undefined) => {
    const odpovedi = { ...relace.odpovedi }
    if (x === undefined) delete odpovedi[id]
    else odpovedi[id] = x
    setRelace({ ...relace, odpovedi })
  }
  const nastavOsobu = (p: Partial<PersonInfo>) => setRelace({ ...relace, person: { ...relace.person, ...p } })

  /** Čísla odpovědí, které na stránce chybí; prázdné = dá se pokračovat. */
  const chybi = (s: Stranka): number[] => {
    switch (s.druh) {
      case "uvod":
        return relace.person.name.trim() && relace.person.gender ? [] : [0]
      case "kontext":
        return KONTEXT_OTAZKY.map((o) => o.id).filter((id) => odp[id] === undefined)
      case "polozky":
        return s.ids.filter((id) => odp[id] === undefined)
      case "vineta":
        return (data.vinety[s.id]?.r ?? []).map(([id]) => id).filter((id) => odp[id] === undefined)
      case "spanek":
        return [...SPANEK_OTAZKY.map((o) => o.id), SPANEK_BUDIK].filter((id) => odp[id] === undefined)
      case "pohoda":
        if (!relace.pohoda) return [0]
        return relace.pohoda === "ano" ? POHODA_OTAZKY.map((o) => o.id).filter((id) => odp[id] === undefined) : []
      default:
        return []
    }
  }
  const chybiTady = chybi(stranka)

  const jdi = (novy: number) => {
    setUkazChybejici(false)
    setRelace({ ...relace, krok: Math.max(0, Math.min(stranky.length - 1, novy)) })
    requestAnimationFrame(() => nahore.current?.scrollIntoView({ behavior: "smooth" }))
  }
  const dal = () => {
    if (chybiTady.length > 0) {
      setUkazChybejici(true)
      return
    }
    jdi(krok + 1)
  }

  const odesli = async () => {
    const hotovo: Relace = { ...relace, finishedAt: new Date().toISOString() }
    setRelace(hotovo)
    uloz(token, hotovo)
    setStav("odesilam")
    // Otázky na pohodu jdou jen tehdy, když na ně sportovec chtěl odpovědět.
    // Server je stejně neukládá, ale co nemá odejít, nemá odejít vůbec.
    const odpovedi = { ...hotovo.odpovedi }
    if (hotovo.pohoda !== "ano") for (const o of POHODA_OTAZKY) delete odpovedi[o.id]
    const od = Date.parse(hotovo.startedAt)
    const doKonce = Date.parse(hotovo.finishedAt ?? "")
    const sec = Number.isFinite(od) && Number.isFinite(doKonce) ? Math.round((doKonce - od) / 1000) : undefined
    const ok = await odesliElitePro(token, hotovo.person, odpovedi, sec && sec > 0 && sec < 86400 ? sec : undefined)
    if (ok) smaz(token)
    setStav(ok ? "odeslano" : "selhalo")
    requestAnimationFrame(() => nahore.current?.scrollIntoView({ behavior: "smooth" }))
  }

  const zaloha = () => {
    const blob = new Blob([JSON.stringify(relace, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `elitepro-${relace.person.name.replace(/\s+/g, "-") || "odpovedi"}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const tlacitko = (
    children: React.ReactNode,
    onClick: () => void,
    { hlavni, disabled }: { hlavni?: boolean; disabled?: boolean } = {},
  ) => (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={
        hlavni
          ? "diag-press inline-flex h-11 items-center rounded-full bg-[var(--wm-brand)] px-8 text-[15px] font-semibold text-[var(--wm-brand-fg)] transition-opacity hover:opacity-85 disabled:opacity-40"
          : "diag-press inline-flex h-11 items-center rounded-full border border-[var(--wm-border)] bg-[var(--wm-surface)] px-6 text-[15px] font-semibold text-[var(--wm-text)] transition-colors hover:bg-[var(--wm-fill-4)]"
      }
    >
      {children}
    </button>
  )

  const pomoc = () => (
    <section className="diag-card p-6">
      <h2 className="text-[16px] font-semibold">{T.pomocTitul}</h2>
      <p className="mt-2 text-[14px] leading-relaxed text-[var(--wm-text-2)]">{g(T.pomocText)}</p>
      <ul className="mt-4 flex flex-col divide-y divide-[var(--wm-border-light)]">
        {POMOC.map((p) => (
          <li key={p.nazev} className="flex flex-wrap items-baseline justify-between gap-2 py-2.5 text-[14px]">
            <span className="text-[var(--wm-text-2)]">{p.nazev}</span>
            <span className="font-semibold tabular-nums">{p.kontakt}</span>
          </li>
        ))}
      </ul>
    </section>
  )

  // ---------- po odeslání ----------
  if (stav === "odeslano") {
    return (
      <div ref={nahore} className="diag-container flex flex-col gap-5 pb-24 pt-10">
        <section className="diag-card p-8 text-center">
          <p className="text-[12px] font-bold tracking-[0.18em] text-[var(--wm-text-3)]">{t.brand}</p>
          <h1 className="mt-3 text-[22px] font-bold tracking-tight">{T.odeslanoTitul}</h1>
          <p className="mt-3 text-[15px] leading-relaxed text-[var(--wm-text-2)]">{T.odeslanoText}</p>
        </section>
        {pomoc()}
      </div>
    )
  }

  const stupnice = (id: number, popisky: string[], nazev: string) => {
    const x = odp[id]
    return (
      <div className="mt-4">
        <div className="diag-scale-row" role="radiogroup" aria-label={nazev}>
          {popisky.map((p, i) => (
            <button
              key={i}
              type="button"
              className="diag-scale-btn"
              data-selected={x === i + 1}
              role="radio"
              aria-checked={x === i + 1}
              aria-label={`${i + 1} – ${p}`}
              onClick={() => nastav(id, i + 1)}
            >
              {i + 1}
            </button>
          ))}
        </div>
        <p className="diag-scale-caption" data-selected={x !== undefined}>
          {x !== undefined ? popisky[x - 1] : `1 · ${popisky[0]}   –   5 · ${popisky[4]}`}
        </p>
      </div>
    )
  }

  const volba = (id: number, moznosti: string[], nazev: string, od = 1, mrizka = false) => (
    <div
      className={mrizka ? "mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4" : "mt-3 flex flex-wrap gap-2"}
      role="radiogroup"
      aria-label={nazev}
    >
      {moznosti.map((m, i) => {
        const hodnota = i + od
        const vybrano = odp[id] === hodnota
        return (
          <button
            key={m}
            type="button"
            role="radio"
            aria-checked={vybrano}
            onClick={() => nastav(id, hodnota)}
            className={`diag-press min-h-10 rounded-xl border px-4 py-2 text-left text-[14px] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--wm-blue)] ${
              vybrano
                ? "border-[var(--wm-brand)] bg-[var(--wm-brand)] text-[var(--wm-brand-fg)]"
                : "border-[var(--wm-border)] bg-[var(--wm-surface)] text-[var(--wm-text)] hover:bg-[var(--wm-fill-4)]"
            }`}
          >
            {m}
          </button>
        )
      })}
    </div>
  )

  const oznaceni = (id: number) =>
    ukazChybejici && chybiTady.includes(id) ? { borderColor: "var(--wm-red)" } : undefined

  return (
    <div ref={nahore}>
      <div className="sticky top-0 z-10 border-b border-[var(--wm-border-light)] bg-[var(--wm-glass)] backdrop-blur-xl">
        <div className="diag-container flex h-14 items-center justify-between gap-4">
          <span className="shrink-0 whitespace-nowrap text-[12px] font-bold tracking-[0.18em] text-[var(--wm-text)]">
            {t.brand}
          </span>
          {krok > 0 && (
            <div className="min-w-0 max-w-xs flex-1">
              <div className="mb-1 text-center text-[11px] font-medium tabular-nums text-[var(--wm-text-3)]">
                {t.progressAnswered(zodpovezeno, VELIKOST_FORMY)}
              </div>
              <div className="diag-bar-track" style={{ height: 4 }}>
                <div
                  className="diag-bar-fill"
                  style={{ width: `${(zodpovezeno / VELIKOST_FORMY) * 100}%`, background: "var(--wm-brand)" }}
                />
              </div>
            </div>
          )}
          <span className="hidden w-24 sm:block" aria-hidden />
        </div>
      </div>

      <div className="diag-container pb-24 pt-8">
        <h1 className="text-[22px] font-bold tracking-tight">
          {T.nazev} <span className="font-medium text-[var(--wm-text-3)]">· {T.podtitul}</span>
        </h1>

        <div className="mt-6 flex flex-col gap-4">
          {stranka.druh === "uvod" && (
            <>
              <section className="diag-card p-6">
                <h2 className="mb-3 text-[16px] font-semibold">{T.uvodTitul}</h2>
                <ul className="flex flex-col gap-2.5">
                  {T.uvod.map((u) => (
                    <li key={u} className="text-[14.5px] leading-relaxed text-[var(--wm-text-2)]">
                      {u}
                    </li>
                  ))}
                </ul>
              </section>
              <section className="diag-card p-6" style={oznaceni(0)}>
                <h2 className="mb-4 text-[16px] font-semibold">{T.osobaTitul}</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-1.5 block text-[13px] font-medium text-[var(--wm-text-2)]">{t.nameLabel} *</span>
                    <input
                      className="diag-input"
                      value={relace.person.name}
                      placeholder={t.namePlaceholder}
                      onChange={(e) => nastavOsobu({ name: e.target.value })}
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1.5 block text-[13px] font-medium text-[var(--wm-text-2)]">{t.birthLabel}</span>
                    <input
                      type="date"
                      className="diag-input"
                      value={relace.person.birthDate ?? ""}
                      onChange={(e) => nastavOsobu({ birthDate: e.target.value })}
                    />
                  </label>
                  <div className="block">
                    <span className="mb-1.5 block text-[13px] font-medium text-[var(--wm-text-2)]">{t.genderLabel} *</span>
                    <div className="diag-segment">
                      {(["female", "male"] as const).map((x) => (
                        <button
                          key={x}
                          type="button"
                          data-active={relace.person.gender === x}
                          onClick={() => nastavOsobu({ gender: x })}
                        >
                          {x === "female" ? t.genderFemale : t.genderMale}
                        </button>
                      ))}
                    </div>
                  </div>
                  <label className="block">
                    <span className="mb-1.5 block text-[13px] font-medium text-[var(--wm-text-2)]">{T.sportLabel}</span>
                    <input
                      className="diag-input"
                      value={relace.person.role ?? ""}
                      placeholder={T.sportPlaceholder}
                      onChange={(e) => nastavOsobu({ role: e.target.value })}
                    />
                  </label>
                </div>
                <p className="mt-5 rounded-xl bg-[var(--wm-surface-2)] p-4 text-[13px] leading-relaxed text-[var(--wm-text-2)]">
                  {T.dataPoznamka}
                </p>
              </section>
            </>
          )}

          {stranka.druh === "kontext" && (
            <section className="diag-card p-6">
              <h2 className="text-[16px] font-semibold">{T.kontextTitul}</h2>
              <p className="mt-1 text-[14px] text-[var(--wm-text-2)]">{T.kontextUvod}</p>
              <div className="mt-2 flex flex-col divide-y divide-[var(--wm-border-light)]">
                {KONTEXT_OTAZKY.map((o) => (
                  <div key={o.id} className="py-4" style={oznaceni(o.id)}>
                    <p className="text-[15px] font-medium">{o.otazka}</p>
                    {volba(o.id, o.moznosti, o.otazka)}
                  </div>
                ))}
              </div>
            </section>
          )}

          {stranka.druh === "polozky" && (
            <>
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="text-[13px] font-semibold uppercase tracking-[0.1em] text-[var(--wm-text-3)]">
                  {T.blokNadpis(stranka.od, stranka.od + stranka.ids.length - 1, celkemPolozek)}
                </h2>
                <span className="text-[12px] text-[var(--wm-text-3)]">{T.ulozeno}</span>
              </div>
              <p className="rounded-2xl bg-[var(--wm-surface-2)] p-4 text-[14px] leading-relaxed text-[var(--wm-text-2)]">
                {T.bloky[stranka.blok]}
              </p>
              {stranka.ids.map((id, i) => {
                const p = data.polozky[id]
                return (
                  <div
                    key={id}
                    className="diag-card diag-item diag-enter p-5 sm:p-6"
                    data-answered={odp[id] !== undefined}
                    style={{ ...oznaceni(id), animationDelay: `${Math.min(i * 30, 240)}ms` }}
                  >
                    <p className="text-[15px] leading-relaxed">{g(p.t)}</p>
                    {stupnice(id, STUPNICE[p.f], p.t)}
                  </div>
                )
              })}
            </>
          )}

          {stranka.druh === "vineta" && (
            <>
              <h2 className="text-[13px] font-semibold uppercase tracking-[0.1em] text-[var(--wm-text-3)]">
                {T.vinetaNadpis(stranka.poradi, forma.vinety.length)}
              </h2>
              {stranka.poradi === 1 && (
                <p className="rounded-2xl bg-[var(--wm-surface-2)] p-4 text-[14px] leading-relaxed text-[var(--wm-text-2)]">
                  {g(T.vinetyUvod)}
                </p>
              )}
              <section className="diag-card p-6">
                <p className="text-[16px] font-medium leading-relaxed">{g(data.vinety[stranka.id].s)}</p>
                <p className="mt-2 text-[13px] text-[var(--wm-text-3)]">{g(data.otazkaVinet)}</p>
              </section>
              {data.vinety[stranka.id].r.map(([id, text]) => (
                <div key={id} className="diag-card diag-item p-5 sm:p-6" data-answered={odp[id] !== undefined} style={oznaceni(id)}>
                  <p className="text-[15px] leading-relaxed">{g(text)}</p>
                  {stupnice(id, STUPNICE.V, text)}
                </div>
              ))}
            </>
          )}

          {stranka.druh === "spanek" && (
            <section className="diag-card p-6">
              <h2 className="text-[16px] font-semibold">{T.spanekTitul}</h2>
              <p className="mt-1 text-[14px] text-[var(--wm-text-2)]">{T.spanekUvod}</p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {SPANEK_OTAZKY.map((o) => (
                  <label key={o.id} className="block" style={oznaceni(o.id)}>
                    <span className="mb-1.5 block text-[13px] font-medium text-[var(--wm-text-2)]">{o.otazka}</span>
                    <input
                      type="time"
                      className="diag-input"
                      value={naCas(odp[o.id])}
                      onChange={(e) => nastav(o.id, naMinuty(e.target.value))}
                    />
                  </label>
                ))}
              </div>
              <div className="mt-5" style={oznaceni(SPANEK_BUDIK)}>
                <p className="text-[15px] font-medium">{T.budik}</p>
                {volba(SPANEK_BUDIK, [T.ano, T.ne], T.budik)}
              </div>
            </section>
          )}

          {stranka.druh === "pohoda" && (
            <section className="diag-card p-6" style={oznaceni(0)}>
              <h2 className="text-[16px] font-semibold">{T.pohodaTitul}</h2>
              {T.pohodaUvod.map((u) => (
                <p key={u} className="mt-2 text-[14px] leading-relaxed text-[var(--wm-text-2)]">
                  {g(u)}
                </p>
              ))}
              <div className="mt-4 diag-segment">
                {(["ano", "ne"] as const).map((v) => (
                  <button
                    key={v}
                    type="button"
                    data-active={relace.pohoda === v}
                    onClick={() => setRelace({ ...relace, pohoda: v })}
                  >
                    {v === "ano" ? T.pohodaAno : T.pohodaNe}
                  </button>
                ))}
              </div>
              {relace.pohoda === "ano" && (
                <div className="mt-5">
                  <p className="text-[15px] font-medium">{T.pohodaOtazka}</p>
                  <div className="mt-1 flex flex-col divide-y divide-[var(--wm-border-light)]">
                    {POHODA_OTAZKY.map((o) => (
                      <div key={o.id} className="py-4" style={oznaceni(o.id)}>
                        <p className="text-[14.5px]">{o.text}</p>
                        {volba(o.id, POHODA_STUPNICE, o.text, 0, true)}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>
          )}

          {stranka.druh === "odeslat" && stav !== "selhalo" && (
            <section className="diag-card p-6 text-center">
              <h2 className="text-[18px] font-semibold">{T.odeslatTitul}</h2>
              <p className="mt-2 text-[14px] text-[var(--wm-text-2)]">{T.odeslatText}</p>
              <div className="mt-5">
                {tlacitko(stav === "odesilam" ? T.odesilam : T.odeslat, () => void odesli(), {
                  hlavni: true,
                  disabled: stav === "odesilam" || zodpovezeno < VELIKOST_FORMY,
                })}
              </div>
              {zodpovezeno < VELIKOST_FORMY && (
                <p className="mt-3 text-[13px] text-[var(--wm-red)]">{T.chybi(VELIKOST_FORMY - zodpovezeno)}</p>
              )}
            </section>
          )}

          {stav === "selhalo" && (
            <section className="diag-card border-[var(--wm-red)] p-6">
              <h2 className="text-[16px] font-semibold text-[var(--wm-red)]">{T.selhaloTitul}</h2>
              <p className="mt-2 text-[14px] leading-relaxed text-[var(--wm-text-2)]">{T.selhaloText}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {tlacitko(T.znovu, () => void odesli(), { hlavni: true })}
                {tlacitko(T.zaloha, zaloha)}
              </div>
            </section>
          )}

          {(stranka.druh === "odeslat" || stranka.druh === "pohoda") && pomoc()}

          {ukazChybejici && chybiTady.length > 0 && (
            <p className="rounded-2xl border border-[var(--wm-red)] bg-[var(--wm-red-light)] p-4 text-[14px] font-medium text-[var(--wm-red)]">
              {stranka.druh === "uvod"
                ? T.chybiOsoba
                : stranka.druh === "pohoda" && !relace.pohoda
                  ? T.chybiVolba
                  : T.chybi(chybiTady.length)}
            </p>
          )}
        </div>

        {stranka.druh !== "odeslat" && (
          <div className="mt-8 flex items-center justify-between gap-3">
            {krok > 0 ? tlacitko(T.zpet, () => jdi(krok - 1)) : <span />}
            {tlacitko(krok === 0 ? (zodpovezeno > 0 ? T.pokracovat : T.zacit) : T.dal, dal, { hlavni: true })}
          </div>
        )}
        {stranka.druh === "odeslat" && stav !== "odesilam" && (
          <div className="mt-8">
            {tlacitko(T.zpet, () => jdi(krok - 1))}
          </div>
        )}
      </div>
    </div>
  )
}
