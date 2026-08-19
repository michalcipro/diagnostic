"use client"

// Grafy statistik.
//
// Všechno je ruční SVG, žádná grafová knihovna. Důvod je střízlivý: potřebné
// tvary jsou tři, knihovna by přinesla stovky kilobajtů a hlavně vlastní
// paletu, kterou by bylo stejně nutné celou přebít, aby seděla se světlým
// i tmavým režimem.
//
// Barvy se berou z proměnných tématu přes `currentColor` a `var(--...)`, takže
// se převracejí spolu se zbytkem aplikace a nikde není natvrdo psaný odstín.

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
  vyska = 132,
  popisHodnoty,
}: {
  body: Bod[]
  min: number
  max: number
  vyska?: number
  popisHodnoty?: (v: number) => string
}) {
  const sirka = 100
  const okraj = { top: 6, right: 2, bottom: 16, left: 2 }
  const plochaV = vyska - okraj.top - okraj.bottom
  const rozsah = max - min || 1
  const krok = body.length > 1 ? (sirka - okraj.left - okraj.right) / (body.length - 1) : 0

  const x = (i: number) => okraj.left + i * krok
  const y = (v: number) => okraj.top + plochaV * (1 - (v - min) / rozsah)

  // Čára se skládá po souvislých úsecích, mezera zůstane mezerou.
  const useky: string[] = []
  let ted: string[] = []
  body.forEach((b, i) => {
    if (typeof b.hodnota !== "number") {
      if (ted.length > 1) useky.push(ted.join(" "))
      ted = []
      return
    }
    ted.push(`${ted.length ? "L" : "M"}${x(i).toFixed(2)},${y(b.hodnota).toFixed(2)}`)
  })
  if (ted.length > 1) useky.push(ted.join(" "))

  const jsouData = body.some((b) => typeof b.hodnota === "number")

  return (
    <svg
      viewBox={`0 0 ${sirka} ${vyska}`}
      preserveAspectRatio="none"
      style={{ width: "100%", height: vyska, display: "block", overflow: "visible" }}
      role="img"
    >
      {/* vodicí linky po třetinách rozsahu */}
      {[0, 0.5, 1].map((p) => (
        <line
          key={p}
          x1={okraj.left}
          x2={sirka - okraj.right}
          y1={okraj.top + plochaV * p}
          y2={okraj.top + plochaV * p}
          stroke="var(--wm-border-light)"
          strokeWidth={0.4}
          vectorEffect="non-scaling-stroke"
        />
      ))}

      {useky.map((d, i) => (
        <path
          key={i}
          d={d}
          fill="none"
          stroke="var(--wm-brand)"
          strokeWidth={1.8}
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      ))}

      {body.map((b, i) =>
        typeof b.hodnota === "number" ? (
          <g key={b.klic}>
            <circle
              cx={x(i)}
              cy={y(b.hodnota)}
              r={2.2}
              fill="var(--wm-surface)"
              stroke="var(--wm-brand)"
              strokeWidth={1.4}
              vectorEffect="non-scaling-stroke"
            />
            <title>
              {b.popisek ?? b.klic}: {popisHodnoty ? popisHodnoty(b.hodnota) : b.hodnota.toFixed(1)}
            </title>
          </g>
        ) : null,
      )}

      {/* popisky osy: jen krajní a prostřední, aby se nepřekrývaly */}
      {body.map((b, i) => {
        const ukaz = body.length <= 12 || i === 0 || i === body.length - 1 || i % Math.ceil(body.length / 6) === 0
        if (!ukaz) return null
        return (
          <text
            key={`p-${b.klic}`}
            x={x(i)}
            y={vyska - 4}
            textAnchor={i === 0 ? "start" : i === body.length - 1 ? "end" : "middle"}
            fill="var(--wm-text-3)"
            style={{ fontSize: 6 }}
          >
            {b.popisek ?? b.klic}
          </text>
        )
      })}

      {!jsouData && (
        <text
          x={sirka / 2}
          y={okraj.top + plochaV / 2}
          textAnchor="middle"
          fill="var(--wm-text-3)"
          style={{ fontSize: 7 }}
        >
          –
        </text>
      )}
    </svg>
  )
}

/** Sloupcový graf. Používá se pro srovnání dnů v týdnu. */
export function SloupceGraf({
  body,
  max,
  vyska = 116,
  popisHodnoty,
}: {
  body: Bod[]
  max: number
  vyska?: number
  popisHodnoty?: (v: number) => string
}) {
  const sirka = 100
  const okraj = { top: 4, bottom: 14 }
  const plochaV = vyska - okraj.top - okraj.bottom
  const sirkaSloupce = (sirka / body.length) * 0.6
  const rozestup = sirka / body.length

  return (
    <svg
      viewBox={`0 0 ${sirka} ${vyska}`}
      preserveAspectRatio="none"
      style={{ width: "100%", height: vyska, display: "block", overflow: "visible" }}
      role="img"
    >
      {body.map((b, i) => {
        const stred = rozestup * (i + 0.5)
        const v = typeof b.hodnota === "number" ? Math.max(0, Math.min(1, b.hodnota / max)) : 0
        const h = plochaV * v
        return (
          <g key={b.klic}>
            <rect
              x={stred - sirkaSloupce / 2}
              y={okraj.top}
              width={sirkaSloupce}
              height={plochaV}
              rx={1}
              fill="var(--wm-track)"
            />
            {typeof b.hodnota === "number" && (
              <rect
                x={stred - sirkaSloupce / 2}
                y={okraj.top + plochaV - h}
                width={sirkaSloupce}
                height={h}
                rx={1}
                fill="var(--wm-brand)"
              />
            )}
            <text
              x={stred}
              y={vyska - 3}
              textAnchor="middle"
              fill="var(--wm-text-3)"
              style={{ fontSize: 6 }}
            >
              {b.popisek ?? b.klic}
            </text>
            <title>
              {b.popisek ?? b.klic}:{" "}
              {typeof b.hodnota === "number"
                ? popisHodnoty
                  ? popisHodnoty(b.hodnota)
                  : b.hodnota.toFixed(1)
                : "–"}
            </title>
          </g>
        )
      })}
    </svg>
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
  const bunka = 11
  const mezera = 2
  const levyOkraj = 20
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
              style={{ fontSize: 7 }}
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
              rx={2}
              fill={d.uroven === undefined ? "var(--wm-track)" : "var(--wm-brand)"}
              fillOpacity={d.uroven === undefined ? 1 : 0.25 + d.uroven * 0.75}
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
      <div className="pl-bar-fill" style={{ width: `${Math.round(Math.max(0, Math.min(1, podil)) * 100)}%` }} />
    </div>
  )
}
