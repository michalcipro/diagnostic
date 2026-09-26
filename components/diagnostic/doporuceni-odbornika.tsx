"use client"

import { useEffect, useState } from "react"
import { chybaText, doporuceniOdbornika, zaznamenejKontakt, type StavDoporuceni } from "@/lib/diagnostic/remote"

// Karta „Doporučení: nabídni kontakt na odborníka“.
//
// Ukazuje se jen tehdy, když z dobrovolných otázek na duševní pohodu (PHQ-4)
// vyšlo doporučení. Body ani odpovědi neexistují ani v datech; kouč dostane
// signál k rozhovoru a vodítko, jak ho vést. Klubovému kouči server
// doporučení nevrací vůbec (convex/pohoda.ts). Do tisku ani PDF nepatří.

const DEN = 24 * 60 * 60 * 1000

const datum = (ms: number) =>
  new Date(ms).toLocaleDateString("cs-CZ", { day: "numeric", month: "long", year: "numeric" })

export function DoporuceniOdbornika({ sessionToken, resultId }: { sessionToken: string; resultId: string }) {
  const [stav, setStav] = useState<StavDoporuceni | null>(null)
  const [ukladam, setUkladam] = useState(false)
  const [chyba, setChyba] = useState<string | null>(null)

  useEffect(() => {
    let aktivni = true
    doporuceniOdbornika(sessionToken, resultId)
      .then((s) => aktivni && setStav(s))
      .catch(() => aktivni && setStav({ doporuceno: false }))
    return () => {
      aktivni = false
    }
  }, [sessionToken, resultId])

  const zaznamenej = async () => {
    setUkladam(true)
    setChyba(null)
    try {
      setStav(await zaznamenejKontakt(sessionToken, resultId))
    } catch (e) {
      setChyba(chybaText(e, "Záznam se nepodařilo uložit."))
    } finally {
      setUkladam(false)
    }
  }

  if (!stav?.doporuceno) return null

  return (
    <section className="diag-card diag-no-print p-6" style={{ borderColor: "var(--wm-orange)" }}>
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
  )
}
