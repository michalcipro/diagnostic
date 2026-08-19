"use client"

import { useEffect, useId, useRef, useState } from "react"

// Grafy statistik.
//
// Všechno je ruční SVG, žádná grafová knihovna. Důvod je střízlivý: potřebné
// tvary jsou tři, knihovna by přinesla stovky kilobajtů a vlastní paletu,
// kterou by bylo stejně nutné celou přebít, aby seděla s tmavým tématem.
//
// SOUŘADNICE: kreslí se rovnou v pixelech podle skutečné šířky karty, ne do
// pružného plátna. Obě obvyklé zkratky totiž selhaly: `preserveAspectRatio`
// s hodnotou `none` roztáhl osu X a udělal z bodů elipsy, a pevné plátno se
// škálováním měnilo s šířkou karty velikost písma. Změřená šířka obojí řeší
// a stojí jeden ResizeObserver.
//
// Barvy se berou z proměnných tématu, takže nikde není natvrdo psaný odstín
// a graf drží s tmavou aplikací i se světlou koučovskou sekcí.

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

interface XY {
  x: number
  y: number
}

/**
 * Hladká křivka body, Catmullův a Romův tah převedený na Bézierovy úseky.
 *
 * Napětí je nízké a řídicí body se svírají do svislých mezí plochy grafu:
 * u dvou sousedních bodů na extrému by jinak tečna vystřelila křivku pod
 * základní linii do popisků osy a graf by kreslil vrchol, který v datech
 * není. U dvou bodů zůstává rovná čára.
 */
function hladkaCesta(body: XY[], minY: number, maxY: number): string {
  if (body.length < 2) return ""
  if (body.length === 2) {
    return `M${body[0].x.toFixed(1)},${body[0].y.toFixed(1)} L${body[1].x.toFixed(1)},${body[1].y.toFixed(1)}`
  }
  const t = 0.18
  const sevri = (y: number) => Math.max(minY, Math.min(maxY, y))
  let d = `M${body[0].x.toFixed(1)},${body[0].y.toFixed(1)}`
  for (let i = 0; i < body.length - 1; i++) {
    const p0 = body[i - 1] ?? body[i]
    const p1 = body[i]
    const p2 = body[i + 1]
    const p3 = body[i + 2] ?? p2
    const c1x = p1.x + (p2.x - p0.x) * t
    const c1y = sevri(p1.y + (p2.y - p0.y) * t)
    const c2x = p2.x - (p3.x - p1.x) * t
    const c2y = sevri(p2.y - (p3.y - p1.y) * t)
    d += ` C${c1x.toFixed(1)},${c1y.toFixed(1)} ${c2x.toFixed(1)},${c2y.toFixed(1)} ${p2.x.toFixed(1)},${p2.y.toFixed(1)}`
  }
  return d
}

/**
 * Čárový graf vývoje s plochou pod křivkou.
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
  barva = "var(--el-akcent)",
  popis,
}: {
  body: Bod[]
  min: number
  max: number
  popisHodnoty?: (v: number) => string
  barva?: string
  /** popis grafu pro čtečky obrazovky; role img bez jména je němá */
  popis?: string
}) {
  const [ref, sirkaPrvku] = useSirka<HTMLDivElement>()
  const idPrechodu = useId()
  const vyska = 190
  const okraj = { top: 24, right: 14, bottom: 22, left: 14 }
  const plocha = vyska - okraj.top - okraj.bottom
  const rozsah = max - min || 1
  const sirkaPlochy = Math.max(0, sirkaPrvku - okraj.left - okraj.right)
  const krok = body.length > 1 ? sirkaPlochy / (body.length - 1) : 0

  const x = (i: number) => okraj.left + (body.length > 1 ? i * krok : sirkaPlochy / 2)
  const y = (v: number) => okraj.top + plocha * (1 - (v - min) / rozsah)
  const formatuj = (v: number) => (popisHodnoty ? popisHodnoty(v) : v.toFixed(1))
  const dnoY = okraj.top + plocha

  // Křivka se skládá po souvislých úsecích, mezera zůstane mezerou.
  const useky: XY[][] = []
  let ted: XY[] = []
  body.forEach((b, i) => {
    if (typeof b.hodnota !== "number") {
      if (ted.length) useky.push(ted)
      ted = []
      return
    }
    ted.push({ x: x(i), y: y(b.hodnota) })
  })
  if (ted.length) useky.push(ted)

  const jsouData = body.some((b) => typeof b.hodnota === "number")
  const posledniIndex = body.reduce((p, b, i) => (typeof b.hodnota === "number" ? i : p), -1)
  // Popisky u všech bodů jen tehdy, když je jich málo; jinak jen u posledního,
  // ať týden zůstane čitelný a rok nezaroste čísly.
  const popiskyVsude = body.filter((b) => typeof b.hodnota === "number").length <= 8
  const hustota = Math.max(1, Math.ceil(body.length / Math.max(2, Math.floor(sirkaPrvku / 54))))

  return (
    <div ref={ref} style={{ width: "100%", minHeight: vyska }}>
      {sirkaPrvku > 0 && (
        <svg
          width={sirkaPrvku}
          height={vyska}
          role="img"
          aria-label={popis}
          style={{ display: "block" }}
          className="pl-graf-nastup"
        >
          <defs>
            <linearGradient id={idPrechodu} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={barva} stopOpacity={0.26} />
              <stop offset="100%" stopColor={barva} stopOpacity={0} />
            </linearGradient>
          </defs>

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

          {useky.map((usek, i) => {
            const cara = hladkaCesta(usek, okraj.top, dnoY)
            const vypln =
              usek.length > 1
                ? `${cara} L${usek[usek.length - 1].x.toFixed(1)},${dnoY} L${usek[0].x.toFixed(1)},${dnoY} Z`
                : ""
            return (
              <g key={i}>
                {vypln && <path d={vypln} fill={`url(#${idPrechodu})`} stroke="none" />}
                {cara && (
                  <path
                    d={cara}
                    fill="none"
                    stroke={barva}
                    strokeWidth={2.4}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}
              </g>
            )
          })}

          {body.map((b, i) => {
            if (typeof b.hodnota !== "number") return null
            const posledni = i === posledniIndex
            return (
              <g key={b.klic}>
                {posledni && (
                  <circle className="pl-puls" cx={x(i)} cy={y(b.hodnota)} r={9} fill={barva} />
                )}
                <circle
                  cx={x(i)}
                  cy={y(b.hodnota)}
                  r={posledni ? 4.4 : 3.2}
                  fill="var(--wm-surface)"
                  stroke={barva}
                  strokeWidth={2.2}
                />
                {(popiskyVsude || posledni) && (
                  <text
                    x={x(i)}
                    y={y(b.hodnota) - 10}
                    textAnchor="middle"
                    fill={posledni ? "var(--wm-text)" : "var(--wm-text-2)"}
                    style={{
                      fontSize: PISMO.hodnota,
                      fontWeight: posledni ? 700 : 600,
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {formatuj(b.hodnota)}
                  </text>
                )}
                <title>
                  {b.popisek ?? b.klic}: {formatuj(b.hodnota)}
                </title>
              </g>
            )
          })}

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
                style={{ fontSize: PISMO.osa, fontVariantNumeric: "tabular-nums" }}
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
  barva = "var(--el-akcent)",
  popis,
}: {
  body: Bod[]
  max: number
  popisHodnoty?: (v: number) => string
  barva?: string
  popis?: string
}) {
  const [ref, sirkaPrvku] = useSirka<HTMLDivElement>()
  const idPrechodu = useId()
  const vyska = 170
  const okraj = { top: 22, bottom: 22 }
  const plocha = vyska - okraj.top - okraj.bottom
  const rozestup = body.length ? sirkaPrvku / body.length : 0
  const sirkaSloupce = Math.min(rozestup * 0.52, 44)
  const formatuj = (v: number) => (popisHodnoty ? popisHodnoty(v) : v.toFixed(1))

  return (
    <div ref={ref} style={{ width: "100%", minHeight: vyska }}>
      {sirkaPrvku > 0 && (
        <svg
          width={sirkaPrvku}
          height={vyska}
          role="img"
          aria-label={popis}
          style={{ display: "block" }}
          className="pl-graf-nastup"
        >
          <defs>
            <linearGradient id={idPrechodu} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={barva} stopOpacity={0.95} />
              <stop offset="100%" stopColor={barva} stopOpacity={0.45} />
            </linearGradient>
          </defs>
          <line
            x1={0}
            x2={sirkaPrvku}
            y1={okraj.top + plocha}
            y2={okraj.top + plocha}
            stroke="var(--wm-border-light)"
            strokeWidth={1}
          />
          {body.map((b, i) => {
            const stred = rozestup * (i + 0.5)
            const podil =
              typeof b.hodnota === "number" ? Math.max(0, Math.min(1, b.hodnota / max)) : 0
            const h = plocha * podil
            return (
              <g key={b.klic}>
                {typeof b.hodnota === "number" ? (
                  <>
                    <rect
                      x={stred - sirkaSloupce / 2}
                      y={okraj.top + plocha - h}
                      width={sirkaSloupce}
                      height={Math.max(4, h)}
                      rx={6}
                      fill={`url(#${idPrechodu})`}
                    />
                    <text
                      x={stred}
                      y={okraj.top + plocha - h - 7}
                      textAnchor="middle"
                      fill="var(--wm-text-2)"
                      style={{
                        fontSize: PISMO.hodnota,
                        fontWeight: 600,
                        fontVariantNumeric: "tabular-nums",
                      }}
                    >
                      {formatuj(b.hodnota)}
                    </text>
                  </>
                ) : (
                  <rect
                    x={stred - sirkaSloupce / 2}
                    y={okraj.top + plocha - 4}
                    width={sirkaSloupce}
                    height={4}
                    rx={2}
                    fill="var(--el-mlha)"
                  />
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
                  {b.popisek ?? b.klic}: {typeof b.hodnota === "number" ? formatuj(b.hodnota) : "–"}
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
export function MapaRoku({
  dny,
  zkratkyDnu,
  popis,
}: {
  dny: PoleDne[]
  zkratkyDnu: string[]
  popis?: string
}) {
  if (!dny.length) return null
  const bunka = 12
  const mezera = 3
  const levyOkraj = 26
  const horniOkraj = 4

  const prvni = new Date(`${dny[0].datum}T00:00:00Z`)
  const denPrvniho = prvni.getUTCDay() === 0 ? 6 : prvni.getUTCDay() - 1

  const sloupcu = Math.ceil((dny.length + denPrvniho) / 7)
  const sirka = levyOkraj + sloupcu * (bunka + mezera)
  const vyska = horniOkraj + 7 * (bunka + mezera)

  return (
    <div style={{ overflowX: "auto" }}>
      <svg width={sirka} height={vyska} role="img" aria-label={popis} style={{ display: "block" }}>
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
              fill={d.uroven === undefined ? "var(--el-mlha)" : "var(--el-akcent)"}
              fillOpacity={d.uroven === undefined ? 0.6 : 0.25 + d.uroven * 0.75}
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
