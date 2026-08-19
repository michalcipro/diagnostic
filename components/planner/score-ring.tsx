"use client"

import { useEffect, useRef, useState } from "react"

// Prstenec s hodnotou, základní obrazec deníku.
//
// Ukazuje jedno číslo a jeho podíl z cíle: denní skóre z deseti, splněné
// návyky ze všech, spánek z osmi hodin. Oblouk se po načtení plynule dotáhne
// na svou hodnotu a číslo uvnitř k ní dopočítá; obojí se vypíná, když si
// člověk v systému vyžádá omezený pohyb.
//
// Barva oblouku nese totéž co číslo: vysoko akcent, střed jantar, nízko
// rubín. Není to dekorace, díky ní se dá stav přečíst z dálky bez čtení
// číslic, což je přesně to, k čemu prstenec je.

/** Pásmo hodnoty na desetibodové škále, pro barvy i pro čipy škál. */
export function pasmoSkore(v: number | undefined): "nizko" | "stred" | "vysoko" | "zadne" {
  if (typeof v !== "number") return "zadne"
  if (v >= 7) return "vysoko"
  if (v >= 4) return "stred"
  return "nizko"
}

/** Barva pro dané pásmo. Vrací CSS proměnnou, ať se drží tématu. */
export function barvaPasma(pasmo: ReturnType<typeof pasmoSkore>): string {
  if (pasmo === "vysoko") return "var(--el-akcent)"
  if (pasmo === "stred") return "var(--el-jantar)"
  if (pasmo === "nizko") return "var(--el-rubin)"
  return "var(--el-mlha)"
}

function omezenyPohyb(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  )
}

/**
 * Číslo, které se dopočítá k cílové hodnotě.
 *
 * Počítá od předchozí hodnoty, ne od nuly: když se skóre změní kliknutím na
 * škálu, číslo se posune o kousek, místo aby se pokaždé rozjíždělo od nuly
 * jako výherní automat.
 */
export function usePocitadlo(cil: number, trvaniMs = 750): number {
  const [hodnota, setHodnota] = useState(cil)
  const predchoziRef = useRef(cil)

  useEffect(() => {
    const od = predchoziRef.current
    predchoziRef.current = cil
    if (od === cil || omezenyPohyb()) {
      setHodnota(cil)
      return
    }
    let bezi = true
    const zacatek = performance.now()
    const krok = (ted: number) => {
      if (!bezi) return
      const t = Math.min(1, (ted - zacatek) / trvaniMs)
      // doběh s ubýváním, ať konec nepůsobí useknutě
      const prubeh = 1 - Math.pow(1 - t, 3)
      setHodnota(od + (cil - od) * prubeh)
      if (t < 1) requestAnimationFrame(krok)
    }
    requestAnimationFrame(krok)
    return () => {
      bezi = false
    }
  }, [cil, trvaniMs])

  return hodnota
}

export interface PrstenecProps {
  /** 0 až 1, kolik oblouku se vyplní */
  podil: number
  /** barva oblouku; typicky výstup barvaPasma() */
  barva: string
  /** text uprostřed; u čísel už zformátovaný podle jazyka */
  stred: string
  /** menší dovětek za středem, třeba „/10" nebo „h" */
  jednotka?: string
  popisek: string
  velikost?: number
}

/**
 * Prstenec. Čistě prezentační: hodnotu, podíl i barvu dostává hotové,
 * takže počítání zůstává tam, kde se počítají i statistiky.
 */
export function Prstenec({
  podil,
  barva,
  stred,
  jednotka,
  popisek,
  velikost = 112,
}: PrstenecProps) {
  const tah = Math.round(velikost * 0.085)
  const r = (velikost - tah) / 2
  const obvod = 2 * Math.PI * r
  const ciste = Math.max(0, Math.min(1, podil))

  // Oblouk startuje prázdný a CSS přechod ho dotáhne. Dvojí vykreslení přes
  // stav: kdyby se cílová hodnota nastavila rovnou, neměl by přechod odkud
  // vyjet a prstenec by jen skočil.
  const [vykresleny, setVykresleny] = useState(0)
  useEffect(() => {
    if (omezenyPohyb()) {
      setVykresleny(ciste)
      return
    }
    const id = requestAnimationFrame(() => setVykresleny(ciste))
    return () => cancelAnimationFrame(id)
  }, [ciste])

  const stredVelikost = velikost * (stred.length > 4 ? 0.2 : 0.25)

  return (
    <div className="pl-prstenec" style={{ maxWidth: velikost }}>
      <svg
        viewBox={`0 0 ${velikost} ${velikost}`}
        style={{ width: "100%", height: "auto" }}
        role="img"
        aria-label={`${popisek}: ${stred}${jednotka ?? ""}`}
      >
        <circle
          className="pl-prstenec-drah"
          cx={velikost / 2}
          cy={velikost / 2}
          r={r}
          fill="none"
          strokeWidth={tah}
        />
        <circle
          className="pl-prstenec-oblouk"
          cx={velikost / 2}
          cy={velikost / 2}
          r={r}
          fill="none"
          stroke={barva}
          strokeWidth={tah}
          strokeLinecap="round"
          strokeDasharray={obvod}
          strokeDashoffset={obvod * (1 - vykresleny)}
          transform={`rotate(-90 ${velikost / 2} ${velikost / 2})`}
        />
        <text
          className="pl-prstenec-stred"
          x="50%"
          y="50%"
          textAnchor="middle"
          dominantBaseline="central"
          style={{ fontSize: stredVelikost }}
        >
          {stred}
          {jednotka ? (
            <tspan className="pl-prstenec-jednotka" style={{ fontSize: stredVelikost * 0.52 }}>
              {jednotka}
            </tspan>
          ) : null}
        </text>
      </svg>
      <div className="pl-prstenec-popisek">{popisek}</div>
    </div>
  )
}
