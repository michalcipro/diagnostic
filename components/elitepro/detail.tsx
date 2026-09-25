"use client"

import { useEffect, useState } from "react"
import {
  chybaText,
  doporuceniOdbornika,
  zaznamenejKontakt,
  type ResultDetail,
  type StavDoporuceni,
} from "@/lib/diagnostic/remote"
import { KONTEXT_OTAZKY, SPANEK_OTAZKY } from "@/lib/elitepro/dotaznik"
import { SPANEK_BUDIK, VELIKOST_FORMY } from "@/lib/elitepro/spolecne"

// Pohled kouče na vyplnění ELITE Pro v pilotní verzi.
//
// Vyhodnocení tu záměrně není: škály ještě nejsou ověřené a číslo, které
// by vypadalo jako profil, by kouč vzal vážněji, než si zaslouží. Kouč vidí,
// kdo a jak vyplnil, kontext a spánek, a případně doporučení nabídnout
// kontakt na odborníka. Body ani odpovědi z otázek na pohodu neexistují ani
// v datech, takže je tu ukázat nejde.

const DEN = 24 * 60 * 60 * 1000

const cas = (min: unknown) =>
  typeof min === "number"
    ? `${String(Math.floor(min / 60)).padStart(2, "0")}:${String(min % 60).padStart(2, "0")}`
    : "–"

const datum = (ms: number) =>
  new Date(ms).toLocaleDateString("cs-CZ", { day: "numeric", month: "long", year: "numeric" })

export function EliteProDetail({ sessionToken, detail }: { sessionToken: string; detail: ResultDetail }) {
  const [stav, setStav] = useState<StavDoporuceni | null>(null)
  const [ukladam, setUkladam] = useState(false)
  const [chyba, setChyba] = useState<string | null>(null)

  useEffect(() => {
    let aktivni = true
    doporuceniOdbornika(sessionToken, detail.id)
      .then((s) => aktivni && setStav(s))
      .catch(() => aktivni && setStav({ doporuceno: false }))
    return () => {
      aktivni = false
    }
  }, [sessionToken, detail.id])

  const odp = detail.answers as unknown as Record<string, number>
  const odpoved = (id: number) => odp[String(id)]

  const zaznamenej = async () => {
    setUkladam(true)
    setChyba(null)
    try {
      setStav(await zaznamenejKontakt(sessionToken, detail.id))
    } catch (e) {
      setChyba(chybaText(e, "Záznam se nepodařilo uložit."))
    } finally {
      setUkladam(false)
    }
  }

  const minut = detail.durationSec ? Math.round(detail.durationSec / 60) : null

  return (
    <div className="flex flex-col gap-5">
      <section className="diag-card p-6">
        <p className="text-[12px] font-bold tracking-[0.18em] text-[var(--wm-text-3)]">ELITE PRO · PILOTNÍ VERZE</p>
        <h1 className="mt-2 text-[26px] font-bold tracking-tight">{detail.person.name || "–"}</h1>
        <p className="mt-1 text-[14px] text-[var(--wm-text-2)]">
          {[detail.person.role, detail.person.fillDate].filter(Boolean).join(" · ")}
        </p>
        <dl className="mt-5 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl bg-[var(--wm-surface-2)] p-4">
            <dt className="text-[12px] text-[var(--wm-text-3)]">Zodpovězeno</dt>
            <dd className="mt-1 text-[20px] font-semibold tabular-nums">
              {detail.answeredCount} <span className="text-[14px] font-normal text-[var(--wm-text-3)]">z {VELIKOST_FORMY}</span>
            </dd>
          </div>
          <div className="rounded-xl bg-[var(--wm-surface-2)] p-4">
            <dt className="text-[12px] text-[var(--wm-text-3)]">Doba vyplňování</dt>
            <dd className="mt-1 text-[20px] font-semibold tabular-nums">{minut !== null ? `${minut} min` : "–"}</dd>
          </div>
          <div className="rounded-xl bg-[var(--wm-surface-2)] p-4">
            <dt className="text-[12px] text-[var(--wm-text-3)]">Odesláno</dt>
            <dd className="mt-1 text-[16px] font-semibold">{datum(detail.createdAt)}</dd>
          </div>
        </dl>
        <p className="mt-5 text-[14px] leading-relaxed text-[var(--wm-text-2)]">
          Z pilotní verze se vyhodnocení nepočítá. Každý sportovec dostal náhodnou polovinu otázek z každé
          oblasti; z odpovědí všech se vyberou ty nejlepší a teprve hotový test bude mít profil. Se sportovcem
          můžeš probrat kontext a spánek níže.
        </p>
      </section>

      {stav?.doporuceno && (
        <section className="diag-card p-6" style={{ borderColor: "var(--wm-orange)" }}>
          <h2 className="text-[17px] font-bold tracking-tight">Doporučení: nabídni kontakt na odborníka</h2>
          <p className="mt-2 text-[14px] leading-relaxed text-[var(--wm-text-2)]">
            Z dobrovolných otázek na duševní pohodu vyšlo, že by sportovci mohl pomoct rozhovor s odborníkem.
            Není to diagnóza a body ani odpovědi nevidíš záměrně.
          </p>
          <ul className="mt-3 flex list-disc flex-col gap-1.5 pl-5 text-[14px] leading-relaxed text-[var(--wm-text-2)]">
            <li>Promluv si v klidu a mezi čtyřma očima, ne před týmem ani těsně před soutěží.</li>
            <li>Začni tím, co vidíš a co tě zajímá: „Jak se teď máš mimo trénink?“ Neptej se na odpovědi v testu.</li>
            <li>Nabídni volbu: odborníka, kterého doporučíme, nebo si sportovec najde vlastního.</li>
            <li>U nezletilých domluv další postup i se zákonným zástupcem.</li>
            <li>V akutní situaci patří člověk na linku 116 123, na 155 nebo 112, ne do dalšího tréninku.</li>
          </ul>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            {stav.kontaktNabidnut ? (
              <span className="text-[13px] font-medium text-[var(--wm-green)]">
                Kontakt nabídnut {datum(stav.kontaktNabidnut)}
                {Date.now() - stav.kontaktNabidnut > 30 * DEN ? " · zeptej se, jak to dopadlo" : ""}
              </span>
            ) : (
              <button
                type="button"
                onClick={() => void zaznamenej()}
                disabled={ukladam}
                className="diag-press inline-flex h-9 items-center rounded-full bg-[var(--wm-brand)] px-4 text-[13px] font-semibold text-[var(--wm-brand-fg)] transition-opacity hover:opacity-85 disabled:opacity-40"
              >
                Označit: kontakt nabídnut
              </button>
            )}
            {chyba && <span className="text-[13px] text-[var(--wm-red)]">{chyba}</span>}
          </div>
        </section>
      )}

      <section className="diag-card p-6">
        <h2 className="text-[17px] font-bold tracking-tight">Kontext</h2>
        <dl className="mt-3 flex flex-col divide-y divide-[var(--wm-border-light)]">
          {KONTEXT_OTAZKY.map((o) => {
            const x = odpoved(o.id)
            return (
              <div key={o.id} className="flex flex-wrap justify-between gap-2 py-2.5 text-[14px]">
                <dt className="text-[var(--wm-text-2)]">{o.otazka}</dt>
                <dd className="font-medium">{typeof x === "number" ? o.moznosti[x - 1] : "–"}</dd>
              </div>
            )
          })}
        </dl>
      </section>

      <section className="diag-card p-6">
        <h2 className="text-[17px] font-bold tracking-tight">Spánek</h2>
        <dl className="mt-3 flex flex-col divide-y divide-[var(--wm-border-light)]">
          {SPANEK_OTAZKY.map((o) => (
            <div key={o.id} className="flex flex-wrap justify-between gap-2 py-2.5 text-[14px]">
              <dt className="text-[var(--wm-text-2)]">{o.otazka}</dt>
              <dd className="font-medium tabular-nums">{cas(odpoved(o.id))}</dd>
            </div>
          ))}
          <div className="flex flex-wrap justify-between gap-2 py-2.5 text-[14px]">
            <dt className="text-[var(--wm-text-2)]">Ve volné dny budí budík</dt>
            <dd className="font-medium">{odpoved(SPANEK_BUDIK) === 1 ? "ano" : odpoved(SPANEK_BUDIK) === 2 ? "ne" : "–"}</dd>
          </div>
        </dl>
      </section>
    </div>
  )
}
