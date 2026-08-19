"use client"

import { useEffect, useRef, useState } from "react"

// Grafy statistik.
//
// Všechno je ruční SVG, žádná grafová knihovna. Důvod je střízlivý: potřebné
// tvary jsou tři, knihovna by přinesla stovky kilobajtů a hlavně vlastní
// paletu, kterou by bylo stejně nutné celou přebít, aby seděla se světlým
// i tmavým režimem.
//
// SOUŘADNICE: kreslí se rovnou v pixelech podle skutečné šířky karty, ne do
// pružného plátna. Obě obvyklé zkratky totiž selhaly: `preserveAspectRatio`
// s hodnotou `none` roztáhl osu X a udělal z bodů elipsy a z popisků
// rozvleklé písmo, a pevné plátno se škálováním sice nedeformuje, ale mění
// s šířkou karty velikost písma, takže popisky grafu byly na širokém monitoru
// větší než nadpisy kolem. Změřená šířka obojí řeší a stojí jeden
// ResizeObserver.
//
// Barvy se berou z proměnných tématu, takže se převracejí spolu se zbytkem
// aplikace a nikde není natvrdo psaný odstín.

/**
 * Šířka prvku, do kterého se graf kreslí.
 *
 * Vrací nulu, dokud se prvek nezměří; graf se do té doby nevykresluje, aby
 * se na okamžik neobjevil v nesmyslné velikosti.
 */
function useSirka<T extends HTMLElement>() {
  const ref = useRef<T | null>(null)
  const [sirka, setSirka] = useState(0)
  useEffect(() => {
    const prvek = ref.current
    if (!prvek) return
    setSirka(prvek.clientWidth)
    if (typeof ResizeObserver === "undefined") return
    const pozorovatel = new ResizeObserver((zaznamy) => {
      const s = zaznamy[0]?.contentRect.width
      if (typeof s === "number") setSirka(s)
    })
    pozorovatel.observe(prvek)
    return () => pozorovatel.disconnect()
  }, [])
  return [ref, sirka] as const
}

/** Velikost popisků. Nezávisí na šířce, protože graf se kreslí v pixelech. */
const PISMO = { hodnota: 11.5, osa: 11 }

export interface Bod {
  klic: string
  /** chybějící hodnota se v čáře přeruší, nedokresluje se nulou */
  hodnota?: number
  popisek?: string
}

/**
 * Čárový graf vývoje.
 *
 * Chybějící hodnoty čáru přerušují. Spojovat je přímkou přes prázdno by
 * tvrdilo něco, co v datech není: mezi dubnem a červnem nemusel být vývoj
 * plynulý, když v květnu není nic.
 */
export function CaraGraf({
  body,
  min,
  max,
  popisHodnoty,
}: {
  body: Bod[]
  min: number
  max: number
  popisHodnoty?: (v: number) => string
}) {
  const [ref, sirkaPrvku] = useSirka<HTMLDivElement>()
  const vyska = 190
  const okraj = { top: 22, right: 14, bottom: 22, left: 14 }
  const plocha = vyska - okraj.top - okraj.bottom
  const rozsah = max - min || 1
  const sirkaPlochy = Math.max(0, sirkaPrvku - okraj.left - okraj.right)
  const krok = body.length > 1 ? sirkaPlochy / (body.length - 1) : 0

  const x = (i: number) => okraj.left + (body.length > 1 ? i * krok : sirkaPlochy / 2)
  const y = (v: number) => okraj.top + plocha * (1 - (v - min) / rozsah)
  const popis = (v: number) => (popisHodnoty ? popisHodnoty(v) : v.toFixed(1))

  // Čára se skládá po souvislých úsecích, mezera zůstane mezerou. Spojit je
  // přímkou přes prázdno by tvrdilo něco, co v datech není.
  const useky: string[] = []
  let ted: string[] = []
  body.forEach((b, i) => {
    if (typeof b.hodnota !== "number") {
      if (ted.length > 1) useky.push(ted.join(" "))
      ted = []
      return
    }
    ted.push(`${ted.length ? "L" : "M"}${x(i).toFixed(1)},${y(b.hodnota).toFixed(1)}`)
  })
  if (ted.length > 1) useky.push(ted.join(" "))

  const jsouData = body.some((b) => typeof b.hodnota === "number")
  // Kolik popisků osy se vejde vedle sebe, aby se nepřekrývaly.
  const hustota = Math.max(1, Math.ceil(body.length / Math.max(2, Math.floor(sirkaPrvku / 54))))

  return (
    <div ref={ref} style={{ width: "100%", minHeight: vyska }}>
      {sirkaPrvku > 0 && (
        <svg width={sirkaPrvku} height={vyska} role="img" style={{ display: "block" }}>
          {[0, 0.5, 1].map((p) => (
            <line
              key={p}
              x1={okraj.left}
              x2={sirkaPrvku - okraj.right}
              y1={okraj.top + plocha * p}
              y2={okraj.top + plocha * p}
              stroke="var(--wm-border-light)"
              strokeWidth={1}
            />
          ))}

          {useky.map((d, i) => (
            <path
              key={i}
              d={d}
              fill="none"
              stroke="var(--wm-brand)"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}

          {body.map((b, i) =>
            typeof b.hodnota === "number" ? (
              <g key={b.klic}>
                <circle
                  cx={x(i)}
                  cy={y(b.hodnota)}
                  r={3.4}
                  fill="var(--wm-surface)"
                  stroke="var(--wm-brand)"
                  strokeWidth={2}
                />
                <text
                  x={x(i)}
                  y={y(b.hodnota) - 9}
                  textAnchor="middle"
                  fill="var(--wm-text-2)"
                  style={{ fontSize: PISMO.hodnota, fontWeight: 600 }}
                >
                  {popis(b.hodnota)}
                </text>
                <title>
                  {b.popisek ?? b.klic}: {popis(b.hodnota)}
                </title>
              </g>
            ) : null,
          )}

          {body.map((b, i) => {
            const ukaz = i === 0 || i === body.length - 1 || i % hustota === 0
            if (!ukaz) return null
            return (
              <text
                key={`p-${b.klic}`}
                x={x(i)}
                y={vyska - 6}
                textAnchor={i === 0 ? "start" : i === body.length - 1 ? "end" : "middle"}
                fill="var(--wm-text-3)"
                style={{ fontSize: PISMO.osa }}
              >
                {b.popisek ?? b.klic}
              </text>
            )
          })}

          {!jsouData && (
            <text
              x={sirkaPrvku / 2}
              y={okraj.top + plocha / 2}
              textAnchor="middle"
              fill="var(--wm-text-3)"
              style={{ fontSize: 13 }}
            >
              –
            </text>
          )}
        </svg>
      )}
    </div>
  )
}

/** Sloupcový graf. Používá se pro srovnání dnů v týdnu. */
export function SloupceGraf({
  body,
  max,
  popisHodnoty,
}: {
  body: Bod[]
  max: number
  popisHodnoty?: (v: number) => string
}) {
  const [ref, sirkaPrvku] = useSirka<HTMLDivElement>()
  const vyska = 170
  const okraj = { top: 20, bottom: 22 }
  const plocha = vyska - okraj.top - okraj.bottom
  const rozestup = body.length ? sirkaPrvku / body.length : 0
  const sirkaSloupce = Math.min(rozestup * 0.5, 42)
  const popis = (v: number) => (popisHodnoty ? popisHodnoty(v) : v.toFixed(1))

  return (
    <div ref={ref} style={{ width: "100%", minHeight: vyska }}>
      {sirkaPrvku > 0 && (
        <svg width={sirkaPrvku} height={vyska} role="img" style={{ display: "block" }}>
          {body.map((b, i) => {
            const stred = rozestup * (i + 0.5)
            const podil =
              typeof b.hodnota === "number" ? Math.max(0, Math.min(1, b.hodnota / max)) : 0
            const h = plocha * podil
            return (
              <g key={b.klic}>
                <rect
                  x={stred - sirkaSloupce / 2}
                  y={okraj.top}
                  width={sirkaSloupce}
                  height={plocha}
                  rx={4}
                  fill="var(--wm-track)"
                />
                {typeof b.hodnota === "number" && (
                  <>
                    <rect
                      x={stred - sirkaSloupce / 2}
                      y={okraj.top + plocha - h}
                      width={sirkaSloupce}
                      height={Math.max(3, h)}
                      rx={4}
                      fill="var(--wm-brand)"
                    />
                    <text
                      x={stred}
                      y={okraj.top - 6}
                      textAnchor="middle"
                      fill="var(--wm-text-2)"
                      style={{ fontSize: PISMO.hodnota, fontWeight: 600 }}
                    >
                      {popis(b.hodnota)}
                    </text>
                  </>
                )}
                <text
                  x={stred}
                  y={vyska - 6}
                  textAnchor="middle"
                  fill="var(--wm-text-3)"
                  style={{ fontSize: PISMO.osa }}
                >
                  {b.popisek ?? b.klic}
                </text>
                <title>
                  {b.popisek ?? b.klic}: {typeof b.hodnota === "number" ? popis(b.hodnota) : "–"}
                </title>
              </g>
            )
          })}
        </svg>
      )}
    </div>
  )
}

export interface PoleDne {
  datum: string
  /** 0 až 1; chybějící hodnota znamená den bez zápisu */
  uroven?: number
  popisek: string
}

/**
 * Kalendářová mapa roku.
 *
 * Sloupec je týden, řádek den v týdnu, odstín síla hodnoty. Na jednom
 * obrázku je vidět, kde má rok díry a kde běží v řadě, což je přesně to,
 * co roční pohled má ukázat a co z tabulky průměrů nikdy nevyleze.
 */
export function MapaRoku({ dny, zkratkyDnu }: { dny: PoleDne[]; zkratkyDnu: string[] }) {
  if (!dny.length) return null
  const bunka = 12
  const mezera = 3
  const levyOkraj = 26
  const horniOkraj = 4

  // Sloupec = týden. První sloupec začíná pondělkem prvního týdne, takže se
  // úvodní dny roku odsadí podle toho, na jaký den v týdnu vyšel 1. leden.
  const prvni = new Date(`${dny[0].datum}T00:00:00Z`)
  const denPrvniho = prvni.getUTCDay() === 0 ? 6 : prvni.getUTCDay() - 1

  const sloupcu = Math.ceil((dny.length + denPrvniho) / 7)
  const sirka = levyOkraj + sloupcu * (bunka + mezera)
  const vyska = horniOkraj + 7 * (bunka + mezera)

  return (
    <div style={{ overflowX: "auto" }}>
      <svg width={sirka} height={vyska} role="img" style={{ display: "block" }}>
        {zkratkyDnu.map((z, i) =>
          i % 2 === 0 ? (
            <text
              key={z + i}
              x={0}
              y={horniOkraj + i * (bunka + mezera) + bunka - 2}
              fill="var(--wm-text-3)"
              style={{ fontSize: 8 }}
            >
              {z}
            </text>
          ) : null,
        )}
        {dny.map((d, i) => {
          const poradi = i + denPrvniho
          const sloupec = Math.floor(poradi / 7)
          const radek = poradi % 7
          return (
            <rect
              key={d.datum}
              x={levyOkraj + sloupec * (bunka + mezera)}
              y={horniOkraj + radek * (bunka + mezera)}
              width={bunka}
              height={bunka}
              rx={3}
              fill={d.uroven === undefined ? "var(--wm-track)" : "var(--wm-brand)"}
              fillOpacity={d.uroven === undefined ? 1 : 0.22 + d.uroven * 0.78}
            >
              <title>{d.popisek}</title>
            </rect>
          )
        })}
      </svg>
    </div>
  )
}

/** Vodorovný pruh s podílem, pro úspěšnost návyku. */
export function Pruh({ podil }: { podil: number }) {
  return (
    <div className="pl-bar-track">
      <div
        className="pl-bar-fill"
        style={{ width: `${Math.round(Math.max(0, Math.min(1, podil)) * 100)}%` }}
      />
    </div>
  )
}
