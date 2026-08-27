"use client"

import { useState } from "react"
import { TYM, type TymLang } from "@/lib/tym/obsah"
import {
  CASTI,
  KRATCE,
  MAPA,
  shodaKratce,
  shodaDlouze,
  slovoUrovne,
  vetaOblasti,
} from "@/lib/tym/slova"
import {
  MAPA_ROZSAH,
  krokSkaly,
  podilX,
  podilY,
  rozestrkej,
  rozprostri,
  vyberUkazku,
  type Popisek,
} from "@/lib/tym/mapa-geometrie"
import type { TeamReport } from "@/lib/diagnostic/remote"
import type { DimensionId } from "@/lib/diagnostic/types"

// Mapa týmu na obrazovce.
//
// Tři pohledy na stejná data, provázané zaostřením: bodová mapa, seznam
// oblastí a mřížka částí. Najetí kamkoli na oblast ztlumí zbytek ve všech
// třech naráz. Bez toho by to byly tři grafy pod sebou; tohle z nich dělá
// jeden nástroj.
//
// Rozvržení bodů se počítá v mapa-geometrie.ts, protože stejné souřadnice
// potřebuje i PDF.

const POSLOUPNOST: DimensionId[] = ["A", "B", "C", "D", "E", "F", "G"]

/** Obrys v barvě podkladu. Text v ploše grafu jinak přejede přes značky. */
const HALO = {
  paintOrder: "stroke",
  stroke: "var(--wm-surface)",
  strokeWidth: "3.5px",
  strokeLinejoin: "round",
} as const

/** Plátno mapy. Poměr stran drží popiskům v rozích místo. */
const W = 760
const H = 500
const OKRAJ = { l: 118, r: 22, t: 44, b: 62 }

type Oblast = TeamReport["oblasti"][number]
type Cast = TeamReport["casti"][number]

export function MapaTymu({ data, lang }: { data: TeamReport; lang: TymLang }) {
  const [zaostreno, setZaostreno] = useState<DimensionId | null>(null)
  const t = MAPA[lang]
  // Nasazení webu a Convexu jsou dva kroky. Mezi nimi může nový web mluvit se
  // starým serverem, který části oblastí ještě nevrací; bez téhle pojistky by
  // se koučovi místo reportu ukázala prázdná stránka.
  const casti = data.casti ?? []
  const trhliny = data.trhliny ?? []
  if (!casti.length) return null
  const oblasti = POSLOUPNOST.map((id) => data.oblasti.find((o) => o.id === id)).filter(
    (o): o is Oblast => o !== undefined,
  )
  const castiOblasti = (id: string) => casti.filter((c) => c.oblast === id)
  const nazev = (id: string) => KRATCE[lang][id as DimensionId] ?? id
  const nazevCasti = (id: string) => CASTI[lang][id] ?? id

  const ukazka = vyberUkazku(oblasti, casti)

  const zaostri = (id: DimensionId | null) => setZaostreno(id)
  const vazba = (id: DimensionId) => ({
    onMouseEnter: () => zaostri(id),
    onMouseLeave: () => zaostri(null),
    onFocus: () => zaostri(id),
    onBlur: () => zaostri(null),
  })

  return (
    <>
      {/* ---------------- co znamenají čísla ---------------- */}
      <section className="mt-10">
        <Hlavicka kicker={t.cislaKicker} titul={t.cislaTitul} uvod={t.cislaUvod} />
        <div className="flex flex-col overflow-hidden rounded-xl border border-[var(--wm-border)] sm:flex-row">
          {t.pasma.map((p, i) => (
            <div
              key={p.rozsah}
              className="flex-1 border-t border-[var(--wm-border)] p-3 first:border-t-0 sm:border-l sm:border-t-0 sm:first:border-l-0"
              style={{ background: PODKLAD_PASMA[i] }}
            >
              <b className="text-[13.5px]">{p.rozsah}</b>
              <p className="mt-0.5 text-[12px] leading-snug text-[var(--wm-text-2)]">{p.popis}</p>
            </div>
          ))}
        </div>
        <p className="mt-3 max-w-[62ch] text-[13.5px] leading-relaxed text-[var(--wm-text-2)]">
          {t.cislaPoznamka}
        </p>
      </section>

      {/* ---------------- mapa ---------------- */}
      <section className="mt-10">
        <Hlavicka kicker={t.kicker} titul={t.titul} />
        <div className="mb-4 rounded-xl bg-[var(--wm-tint-blue)] p-4 text-[14px] leading-relaxed text-[var(--wm-text-2)]">
          <b className="text-[var(--wm-text)]">{t.navodTitul}</b> {t.navodUvod}
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {t.navod.map((r) => (
              <li key={r.slice(0, 20)}>{r}</li>
            ))}
          </ul>
        </div>

        <div className="diag-card overflow-hidden p-0">
          <div className="grid lg:grid-cols-[minmax(0,1fr)_300px]">
            {/* Mapa má pevný poměr stran, lišta vpravo je vyšší. Bez vystředění
                by celé volné místo zůstalo pod obrázkem a vypadalo by to jako
                chyba; takhle je nahoře i dole stejně. */}
            <div className="flex min-w-0 items-center p-4 sm:p-5">
              <Plocha
                oblasti={oblasti}
                casti={casti}
                nazev={nazev}
                nazevCasti={nazevCasti}
                t={t}
                lang={lang}
                zaostreno={zaostreno}
                vazba={vazba}
              />
            </div>
            <div className="border-t border-[var(--wm-border-light)] p-5 lg:border-l lg:border-t-0">
              <h3 className="text-[15px] font-bold tracking-tight">{t.seznamTitul}</h3>
              <p className="mb-2 mt-0.5 text-[12.5px] text-[var(--wm-text-3)]">{t.seznamNapoveda}</p>
              {oblasti.map((o) => (
                <button
                  key={o.id}
                  type="button"
                  {...vazba(o.id as DimensionId)}
                  title={vetaOblasti(o, lang)}
                  // Proužek vlevo se kreslí vnitřním stínem, ne rámečkem:
                  // rámeček by řádek posunul a lišta by při najíždění poskakovala.
                  className={`grid w-full grid-cols-[1fr_auto] items-start gap-2 rounded-lg border-t border-[var(--wm-border-light)] p-2 pl-3 text-left transition-colors first:border-t-0 ${
                    zaostreno === o.id ? "bg-[var(--wm-surface-2)]" : ""
                  }`}
                  style={
                    zaostreno === o.id ? { boxShadow: "inset 3px 0 0 var(--wm-blue)" } : undefined
                  }
                >
                  <span>
                    <span className="block text-[13.5px] font-semibold leading-tight">
                      {nazev(o.id)}
                    </span>
                    <span className="mt-1 block text-[12.5px] leading-snug text-[var(--wm-text-2)]">
                      {slovoUrovne(o.uroven, lang)}, {shodaKratce(o.smodch, lang)}
                    </span>
                  </span>
                  <span className="flex flex-col items-end gap-1.5">
                    <b className="text-[17px] tabular-nums">{Math.round(o.prumer)}</b>
                    <Stitek o={o} t={t} />
                  </span>
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-[var(--wm-border-light)] px-5 py-3 text-[12.5px] text-[var(--wm-text-2)]">
            <Znacka tvar="prstenec" popis={t.legenda[0]} />
            <Znacka tvar="tecka" popis={t.legenda[1]} />
            <Znacka tvar="kosoctverec" popis={t.legenda[2]} />
          </div>
          {ukazka && (
            <div className="border-t border-[var(--wm-border-light)] px-5 py-3 text-[13px] leading-relaxed text-[var(--wm-text-2)]">
              <b className="text-[var(--wm-caution-fg)]">{t.prikladTitul}.</b>{" "}
              {t.prikladVeta(nazev(ukazka.oblast.id), nazevCasti(ukazka.cast.id))}
            </div>
          )}
        </div>
      </section>

      {/* ---------------- kde se problém schoval ---------------- */}
      <section className="mt-10">
        <Hlavicka kicker={t.trhlinyKicker} titul={t.trhlinyTitul} uvod={t.trhlinyUvod} />
        {trhliny.length === 0 ? (
          <p className="text-[14.5px] text-[var(--wm-text-2)]">{t.bezTrhlin}</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {trhliny.map((tr) => {
              const o = data.oblasti.find((x) => x.id === tr.oblast)
              const c = casti.find((x) => x.id === tr.cast)
              if (!o || !c) return null
              const rozdil = Math.round(o.prumer) - Math.round(c.prumer)
              return (
                <div
                  key={tr.cast}
                  className="diag-card border-l-[3px] border-l-[var(--wm-orange)] p-5"
                >
                  <div className="flex items-baseline justify-between gap-3">
                    <h3 className="text-[15px] font-bold tracking-tight">{nazevCasti(c.id)}</h3>
                    <span className="shrink-0 rounded-full bg-[var(--wm-orange-light)] px-2 py-0.5 text-[11px] font-bold text-[var(--wm-caution-fg)]">
                      {nazev(o.id)}
                    </span>
                  </div>
                  <p className="mt-2 text-[14px] leading-relaxed text-[var(--wm-text-2)]">
                    {t.trhlinaVeta(Math.round(o.prumer), Math.round(c.prumer), rozdil)}
                  </p>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* ---------------- z čeho se oblasti skládají ---------------- */}
      <section className="mt-10">
        <Hlavicka kicker={t.castiKicker} titul={t.castiTitul} uvod={t.castiUvod} />
        <div className="diag-card p-5">
          <div className="overflow-x-auto">
            <div className="grid min-w-[640px] grid-cols-[176px_repeat(3,1fr)] gap-1.5">
              {t.castiZahlavi.map((h) => (
                <div
                  key={h}
                  className="self-end pb-1.5 text-[10.5px] font-bold uppercase tracking-[0.09em] text-[var(--wm-text-3)]"
                >
                  {h}
                </div>
              ))}
              {oblasti.map((o) => {
                const tlumit = zaostreno !== null && zaostreno !== o.id
                return (
                  <div key={o.id} className="contents">
                    <div
                      {...vazba(o.id as DimensionId)}
                      className="flex flex-col justify-center pr-2 transition-opacity"
                      style={{ opacity: tlumit ? 0.28 : 1 }}
                    >
                      <b className="text-[13.5px] leading-tight">{nazev(o.id)}</b>
                      <span className="text-[12px] text-[var(--wm-text-3)]">
                        {t.celkem(Math.round(o.prumer))}
                      </span>
                    </div>
                    {castiOblasti(o.id).map((c) => {
                      const k = krokSkaly(c.prumer)
                      return (
                        <button
                          key={c.id}
                          type="button"
                          {...vazba(o.id as DimensionId)}
                          className="relative flex min-h-[74px] flex-col justify-between gap-0.5 rounded-[10px] p-3 text-left transition-opacity"
                          style={{
                            background: `var(--wm-d${k})`,
                            color: `var(--wm-on${k})`,
                            opacity: tlumit ? 0.28 : 1,
                          }}
                          aria-label={`${nazevCasti(c.id)}: ${Math.round(c.prumer)}, ${shodaDlouze(
                            c.smodch,
                            lang,
                          )}${c.riziko ? `, ${t.potrebujePozornost}` : ""}`}
                        >
                          {/* Kosočtverec rizika sedí v pravém horním rohu, takže
                              mu název musí uhnout, jinak se schová pod značku. */}
                          <span
                            className={`text-[11.5px] font-semibold leading-tight opacity-95${
                              c.riziko ? " pr-5" : ""
                            }`}
                          >
                            {nazevCasti(c.id)}
                          </span>
                          {/* Slovo o shodě drží pravý kraj dlaždice a smí se zalomit:
                              angličtina má „large differences" tam, kde čeština má
                              „velké rozdíly", a na jeden řádek se to nevejde. */}
                          <span className="flex items-baseline justify-between gap-2">
                            <span className="text-[23px] font-semibold leading-none tabular-nums">
                              {Math.round(c.prumer)}
                            </span>
                            <span className="text-right text-[11.5px] font-semibold leading-tight opacity-95">
                              {shodaKratce(c.smodch, lang)}
                            </span>
                          </span>
                          {c.riziko && (
                            <svg
                              viewBox="0 0 12 12"
                              className="absolute right-2.5 top-2.5 h-[9px] w-[9px]"
                              aria-hidden="true"
                            >
                              <rect
                                x="2.5"
                                y="2.5"
                                width="7"
                                height="7"
                                rx="1"
                                transform="rotate(45 6 6)"
                                fill="currentColor"
                                opacity="0.92"
                              />
                            </svg>
                          )}
                        </button>
                      )
                    })}
                  </div>
                )
              })}
            </div>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3 text-[12.5px] text-[var(--wm-text-2)]">
            <span>{t.nizsi}</span>
            <span className="flex overflow-hidden rounded" aria-hidden="true">
              {[1, 2, 3, 4, 5].map((k) => (
                <i key={k} className="block h-[9px] w-[26px]" style={{ background: `var(--wm-d${k})` }} />
              ))}
            </span>
            <span>{t.vyssi}</span>
            <span className="ml-auto inline-flex items-center gap-2">
              <Znacka tvar="kosoctverec" popis={t.potrebujePozornost} />
            </span>
          </div>
        </div>
      </section>
    </>
  )
}

// ---------------------------------------------------------------------------

const PODKLAD_PASMA = [
  "var(--wm-red-light)",
  "var(--wm-orange-light)",
  "var(--wm-surface-2)",
  "var(--wm-green-light)",
]

function Hlavicka({ kicker, titul, uvod }: { kicker: string; titul: string; uvod?: string }) {
  return (
    <div className="mb-4">
      <span className="text-[10.5px] font-bold uppercase tracking-[0.13em] text-[var(--wm-text-3)]">
        {kicker}
      </span>
      <h2 className="mt-1.5 text-[22px] font-bold tracking-tight">{titul}</h2>
      {uvod && (
        <p className="mt-2 max-w-[62ch] text-[14.5px] leading-relaxed text-[var(--wm-text-2)]">
          {uvod}
        </p>
      )}
    </div>
  )
}

function Stitek({ o, t }: { o: Oblast; t: (typeof MAPA)[TymLang] }) {
  if (o.rozkol) {
    return (
      <span className="rounded-full bg-[var(--wm-red-light)] px-2 py-0.5 text-[11px] font-bold text-[var(--wm-invalid-fg)]">
        {t.stitky.zlom}
      </span>
    )
  }
  if (o.rozptyl) {
    return (
      <span className="rounded-full bg-[var(--wm-orange-light)] px-2 py-0.5 text-[11px] font-bold text-[var(--wm-caution-fg)]">
        {t.stitky.rozptyl}
      </span>
    )
  }
  if (o.prumer >= 70 && o.smodch < 12) {
    return (
      <span className="rounded-full bg-[var(--wm-green-light)] px-2 py-0.5 text-[11px] font-bold text-[var(--wm-ok-fg)]">
        {t.stitky.opora}
      </span>
    )
  }
  return null
}

function Znacka({ tvar, popis }: { tvar: "prstenec" | "tecka" | "kosoctverec"; popis: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <svg viewBox="0 0 13 13" className="h-[13px] w-[13px] shrink-0" aria-hidden="true">
        {tvar === "prstenec" && (
          <circle cx="6.5" cy="6.5" r="5.2" fill="none" stroke="var(--wm-text-2)" strokeWidth="2" />
        )}
        {tvar === "tecka" && <circle cx="6.5" cy="6.5" r="4.2" fill="var(--wm-d4)" />}
        {tvar === "kosoctverec" && (
          <rect
            x="2.3"
            y="2.3"
            width="8.4"
            height="8.4"
            rx="1.4"
            transform="rotate(45 6.5 6.5)"
            fill="var(--wm-red)"
          />
        )}
      </svg>
      {popis}
    </span>
  )
}

// ---------------------------------------------------------------------------

function Plocha({
  oblasti,
  casti,
  nazev,
  nazevCasti,
  t,
  lang,
  zaostreno,
  vazba,
}: {
  oblasti: Oblast[]
  casti: Cast[]
  nazev: (id: string) => string
  nazevCasti: (id: string) => string
  t: (typeof MAPA)[TymLang]
  lang: TymLang
  zaostreno: DimensionId | null
  vazba: (id: DimensionId) => Record<string, () => void>
}) {
  const X = (u: number) => OKRAJ.l + podilX(u) * (W - OKRAJ.l - OKRAJ.r)
  const Y = (sd: number) => OKRAJ.t + podilY(sd) * (H - OKRAJ.t - OKRAJ.b)
  const { xMin, xMax, xDel, yMax, yDel } = MAPA_ROZSAH

  const svisleCary = [55, 60, 65, 70, 75, 80]
  const rohy: [number, number, "start" | "end", { titul: string; popis: string }][] = [
    [X(xMin) + 8, OKRAJ.t + 15, "start", t.rohy[0]],
    [X(xMax) - 8, OKRAJ.t + 15, "end", t.rohy[1]],
    [X(xMin) + 8, H - OKRAJ.b - 20, "start", t.rohy[2]],
    [X(xMax) - 8, H - OKRAJ.b - 20, "end", t.rohy[3]],
  ]

  // Popisky rohů drží místo; uhnout musí popisek oblasti, ne vysvětlivka.
  const prekazky = rohy.flatMap(([rx, ry, kotva, r]) => [
    { x: rx, y: ry, sirka: r.titul.length * 5.5, vpravo: kotva === "start" },
    { x: rx, y: ry + 13, sirka: r.popis.length * 5.2, vpravo: kotva === "start" },
  ])

  const znacky = rozprostri<Oblast>(
    oblasti.map((o) => {
      const x = X(o.prumer)
      const sirka = nazev(o.id).length * 5.7
      return { data: o, x, y: Y(o.smodch), ty: Y(o.smodch), sirka, vpravo: x + 16 + sirka < W - OKRAJ.r }
    }),
    24,
  )
  // Kroužky oblastí jsou překážka taky: popisek jedné oblasti nesmí přejet
  // přes písmeno druhé. Vlastnímu kroužku se popisek vyhne sám, protože
  // začíná až za jeho okrajem.
  const krouzky = znacky.map((p) => ({ x: p.x - 10, y: p.y, sirka: 20, vpravo: true }))
  const popisky = rozestrkej<Oblast>(znacky, 15, [...prekazky, ...krouzky])

  // Ukázka čtení se váže na skutečný případ, ne na vymyšlený bod.
  const ukazka = vyberUkazku(oblasti, casti)

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="block h-auto w-full"
      role="img"
      aria-label={`${t.titul}. ${oblasti
        .map((o) => `${nazev(o.id)}: ${slovoUrovne(o.uroven, lang)}, ${shodaKratce(o.smodch, lang)}`)
        .join(". ")}`}
    >
      <rect
        x={X(xMin)}
        y={Y(yDel)}
        width={X(xDel) - X(xMin)}
        height={Y(yMax) - Y(yDel)}
        fill="var(--wm-red-light)"
      />
      <rect
        x={X(xDel)}
        y={Y(0)}
        width={X(xMax) - X(xDel)}
        height={Y(yDel) - Y(0)}
        fill="var(--wm-green-light)"
      />

      {svisleCary.map((v) => (
        <g key={v}>
          <line x1={X(v)} y1={OKRAJ.t} x2={X(v)} y2={H - OKRAJ.b} stroke="var(--wm-border-light)" />
          <text
            x={X(v)}
            y={H - OKRAJ.b + 16}
            fill="var(--wm-text-3)"
            fontSize="10.5"
            textAnchor="middle"
          >
            {v}
          </text>
        </g>
      ))}
      <line
        x1={X(xDel)}
        y1={OKRAJ.t}
        x2={X(xDel)}
        y2={H - OKRAJ.b}
        stroke="var(--wm-text-3)"
        strokeDasharray="3 4"
      />
      <line
        x1={OKRAJ.l}
        y1={Y(yDel)}
        x2={W - OKRAJ.r}
        y2={Y(yDel)}
        stroke="var(--wm-text-3)"
        strokeDasharray="3 4"
      />

      <text x={OKRAJ.l} y={H - OKRAJ.b + 38} fill="var(--wm-text-2)" fontSize="12" fontWeight="600">
        {t.osaXVlevo}
      </text>
      <text
        x={W - OKRAJ.r}
        y={H - OKRAJ.b + 38}
        fill="var(--wm-text-2)"
        fontSize="12"
        fontWeight="600"
        textAnchor="end"
      >
        {t.osaXVpravo}
      </text>
      <text
        x={(OKRAJ.l + W - OKRAJ.r) / 2}
        y={H - OKRAJ.b + 38}
        fill="var(--wm-text-3)"
        fontSize="11.5"
        textAnchor="middle"
      >
        {t.osaX}
      </text>
      <text x={OKRAJ.l - 14} y={Y(1)} fill="var(--wm-text-2)" fontSize="12" fontWeight="600" textAnchor="end">
        {t.osaYNahore}
      </text>
      <text
        x={OKRAJ.l - 14}
        y={Y(yMax - 1)}
        fill="var(--wm-text-2)"
        fontSize="12"
        fontWeight="600"
        textAnchor="end"
      >
        {t.osaYDole}
      </text>

      {rohy.map(([cx, cy, kotva, r]) => (
        <g key={r.titul}>
          <text x={cx} y={cy} fill="var(--wm-text-2)" fontSize="11" fontWeight="700" textAnchor={kotva}>
            {r.titul}
          </text>
          <text x={cx} y={cy + 13} fill="var(--wm-text-3)" fontSize="10.5" textAnchor={kotva}>
            {r.popis}
          </text>
        </g>
      ))}

      {popisky.map((p) => {
        const o = p.data
        const tlumit = zaostreno !== null && zaostreno !== o.id
        const zvyraznit = zaostreno === o.id
        return (
          <g
            key={o.id}
            {...vazba(o.id as DimensionId)}
            style={{ opacity: tlumit ? 0.1 : 1, transition: "opacity .18s ease", cursor: "pointer" }}
          >
            {casti
              .filter((c) => c.oblast === o.id)
              .map((c) => (
                <line
                  key={c.id}
                  x1={p.x}
                  y1={p.y}
                  x2={X(c.prumer)}
                  y2={Y(c.smodch)}
                  stroke={zvyraznit ? "var(--wm-blue)" : "var(--wm-text-3)"}
                  strokeWidth="1"
                  opacity={zvyraznit ? 0.8 : 0.2}
                />
              ))}
            {casti
              .filter((c) => c.oblast === o.id)
              .map((c) => {
                const fx = X(c.prumer)
                const fy = Y(c.smodch)
                return (
                  <g key={c.id}>
                    <title>{`${nazevCasti(c.id)}: ${Math.round(c.prumer)}, ${shodaDlouze(c.smodch, lang)}`}</title>
                    {c.riziko ? (
                      <rect
                        x={fx - 4.6}
                        y={fy - 4.6}
                        width="9.2"
                        height="9.2"
                        rx="1.4"
                        transform={`rotate(45 ${fx} ${fy})`}
                        fill="var(--wm-red)"
                        stroke="var(--wm-surface)"
                        strokeWidth="1.6"
                      />
                    ) : (
                      <circle
                        cx={fx}
                        cy={fy}
                        r="4.6"
                        fill="var(--wm-d4)"
                        stroke="var(--wm-surface)"
                        strokeWidth="1.6"
                      />
                    )}
                  </g>
                )
              })}
            <circle cx={p.x} cy={p.y} r="10" fill="var(--wm-surface)" stroke="var(--wm-text)" strokeWidth="2" />
            <text x={p.x} y={p.y + 4} fill="var(--wm-text)" fontSize="11" fontWeight="700" textAnchor="middle">
              {o.id}
            </text>
            {!p.skryt && Math.abs(p.ty - p.y) > 1 && (
              <path
                d={`M ${p.vpravo ? p.x + 12 : p.x - 12} ${p.y} L ${p.vpravo ? p.x + 16 : p.x - 16} ${p.ty - 4}`}
                stroke="var(--wm-text-3)"
                fill="none"
              />
            )}
            <text
              display={p.skryt ? "none" : undefined}
              x={p.vpravo ? p.x + 16 : p.x - 16}
              y={p.ty + 4}
              fontSize="11.5"
              fontWeight="600"
              fill="var(--wm-text)"
              textAnchor={p.vpravo ? "start" : "end"}
              style={HALO}
            >
              {nazev(o.id)}
            </text>
          </g>
        )
      })}

      {ukazka && (
        // Čárka vede od kroužku oblasti k té části, která od ní utekla.
        // Vysvětlení stojí pod grafem, kde je vždycky čitelné a jmenuje obojí.
        <line
          x1={X(ukazka.oblast.prumer)}
          y1={Y(ukazka.oblast.smodch) + 11}
          x2={X(ukazka.cast.prumer)}
          y2={Y(ukazka.cast.smodch) - 7}
          stroke="var(--wm-orange)"
          strokeWidth="1.4"
          strokeDasharray="3 3"
          style={{ pointerEvents: "none" }}
        />
      )}
    </svg>
  )
}

/** Sedm oblastí dlouhými názvy, aby se odborné názvosloví z reportu neztratilo. */
export function dlouhyNazev(id: string, lang: TymLang): string {
  return TYM[lang].oblasti[id as DimensionId] ?? id
}

export type { Popisek }
