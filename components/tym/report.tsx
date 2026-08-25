"use client"

import { useState } from "react"
import { TYM, type TymLang } from "@/lib/tym/obsah"
import { RAMEC } from "@/lib/tym/ramec"
import { MapaTymu } from "./mapa"
import { VYKLAD } from "@/lib/tym/vyklad"
import {
  oblastiKOtazkam,
  oblastiSPraci,
  sestavPlan,
  sestavShrnuti,
  tvarKlic,
  urovenKlic,
} from "@/lib/tym/plan"
import type { NalezKod } from "@/lib/tym/typy"
import type { TeamReport } from "@/lib/diagnostic/remote"
import type { DimensionId } from "@/lib/diagnostic/types"

// Týmový report.
//
// Čte se jako podklad k rozhodování, ne jako výpis čísel, takže je stavěný
// odshora: nejdřív co z profilu plyne, potom čím je to podložené. Kouč, který
// dočte první stranu a dál se nedostane, má mít to podstatné.
//
// U každé oblasti se ukazuje úroveň i rozptyl. Rozptyl je tu záměrně stejně
// vidět jako úroveň: dva týmy se stejným průměrem se chovají úplně jinak podle
// toho, jestli jsou vyrovnané, nebo rozdělené, a report, který ukáže jen
// průměr, tenhle rozdíl zamlčí.

const POSLOUPNOST: DimensionId[] = ["A", "B", "C", "D", "E", "F", "G"]

export function TymReport({ data, lang }: { data: TeamReport; lang: TymLang }) {
  const t = TYM[lang]
  const r = RAMEC[lang]
  const v = VYKLAD[lang]
  const oblasti = new Map(data.oblasti.map((o) => [o.id, o]))
  const prvni = data.nalezy[0]
  const shrnuti = sestavShrnuti(data, lang)
  const plan = sestavPlan(data, lang)
  // Oblast, která má vlastní kroky v plánu, je nedostane znovu v přehledu
  // oblastí. Dvakrát totéž učí čtenáře, že se části reportu dají přeskakovat.
  const vPlanu = new Set<string>(plan.map((f) => f.oblast).filter((x): x is DimensionId => x !== null))
  const sPraci = oblastiSPraci(data, vPlanu)

  return (
    <div className="max-w-[62rem]">
      <header className="mb-8">
        <div className="h-[3px] w-[52px] rounded-full bg-[var(--wm-blue)]" />
        <h1 className="mt-4 text-[30px] font-bold leading-tight tracking-tight">{data.nazev}</h1>
        <p className="mt-1 text-[13px] font-semibold uppercase tracking-[0.14em] text-[var(--wm-text-3)]">
          {t.titul}
        </p>
        <p className="mt-3 max-w-[46rem] text-[15px] leading-relaxed text-[var(--wm-text-2)]">
          {t.podtitul}
        </p>
        <p className="mt-2 text-[13.5px] text-[var(--wm-text-3)]">
          {t.pocty(data.odevzdano, data.pozvano)}
        </p>
        <StahnoutPdf data={data} lang={lang} />
      </header>

      {data.maloDat && (
        <div className="diag-card mb-8 border-l-[3px] border-l-[var(--wm-orange)] p-5">
          <h2 className="text-[15px] font-bold tracking-tight">{t.maloDatTitul}</h2>
          <p className="mt-1.5 text-[14px] leading-relaxed text-[var(--wm-text-2)]">{t.maloDat}</p>
        </div>
      )}

      {data.odevzdano > data.zapocteno && (
        <div className="diag-card mb-8 border-l-[3px] border-l-[var(--wm-orange)] p-5">
          <h2 className="text-[15px] font-bold tracking-tight">{t.nezapoctenoTitul}</h2>
          <p className="mt-1.5 text-[14px] leading-relaxed text-[var(--wm-text-2)]">
            {t.nezapocteno(data.odevzdano - data.zapocteno, data.zapocteno)}
          </p>
        </div>
      )}

      {/* ---- shrnutí pro kouče ---- */}
      <section className="mb-10">
        <Nadpis>{r.shrnutiTitul}</Nadpis>
        <p className="mb-5 max-w-[46rem] text-[14.5px] leading-relaxed text-[var(--wm-text-2)]">
          {r.shrnutiUvod}
        </p>
        <div className="grid gap-5 lg:grid-cols-2">
          <ShrnutiBlok titul={r.drziTitul} barva="var(--wm-green)" radky={shrnuti.drzi} />
          <ShrnutiBlok titul={r.krehkeTitul} barva="var(--wm-orange)" radky={shrnuti.krehke} />
        </div>
        <div className="diag-card mt-5 border-l-[3px] border-l-[var(--wm-blue)] p-5">
          <h3 className="text-[15px] font-bold tracking-tight">{r.prvniKrokTitul}</h3>
          <p className="mt-1.5 text-[14px] leading-relaxed text-[var(--wm-text-2)]">
            {shrnuti.prvniKrok}
          </p>
        </div>
      </section>

      {/* ---- mapa týmu, části oblastí a skryté trhliny ---- */}
      <MapaTymu data={data} lang={lang} />

      {/* ---- jak report číst ---- */}
      <section className="mb-10">
        <Nadpis>{r.jakCistTitul}</Nadpis>
        <div className="max-w-[46rem] space-y-3">
          {r.jakCistOdstavce.map((odstavec) => (
            <p key={odstavec.slice(0, 24)} className="text-[14.5px] leading-relaxed text-[var(--wm-text-2)]">
              {odstavec}
            </p>
          ))}
        </div>
        <h3 className="mt-6 text-[11.5px] font-bold uppercase tracking-[0.12em] text-[var(--wm-text-3)]">
          {r.coToNeniTitul}
        </h3>
        <Odrazky polozky={r.coToNeni} />
      </section>

      {/* ---- co z toho plyne ---- */}
      <section className="mb-10">
        <Nadpis>{t.nalezyTitul}</Nadpis>
        <p className="mb-5 max-w-[46rem] text-[14.5px] leading-relaxed text-[var(--wm-text-2)]">
          {t.nalezyUvod}
        </p>

        {data.nalezy.length === 0 ? (
          <p className="text-[14.5px] text-[var(--wm-text-2)]">{t.bezNalezu}</p>
        ) : (
          <div className="space-y-5">
            {data.nalezy.map((n, i) => (
              <NalezKarta
                key={n.kod}
                kod={n.kod as NalezKod}
                sila={n.sila}
                oblasti={n.oblasti as DimensionId[]}
                lang={lang}
                prvni={i === 0 && prvni?.sila === "vysoka"}
              />
            ))}
          </div>
        )}
      </section>

      {/* ---- opory, priority, zlomy ---- */}
      <div className="mb-10 grid gap-5 lg:grid-cols-3">
        <Seznam
          titul={t.oporyTitul}
          uvod={t.oporyUvod}
          ids={data.opory as DimensionId[]}
          lang={lang}
          barva="var(--wm-green)"
          zadne={t.zadne}
        />
        <Seznam
          titul={t.prioritTitul}
          uvod={t.prioritUvod}
          ids={data.priority as DimensionId[]}
          lang={lang}
          barva="var(--wm-orange)"
          zadne={t.zadne}
          znacka={(id) => (oblasti.get(id)?.plosna ? t.plosna : undefined)}
        />
        <Seznam
          titul={t.zlomyTitul}
          uvod={t.zlomyUvod}
          ids={data.zlomy as DimensionId[]}
          lang={lang}
          barva="var(--wm-red)"
          zadne={t.zadne}
        />
      </div>

      {/* ---- profil oblastí ---- */}
      <section>
        <Nadpis>{t.oblastiTitul}</Nadpis>
        <p className="mb-5 max-w-[46rem] text-[14.5px] leading-relaxed text-[var(--wm-text-2)]">
          {t.oblastiUvod}
        </p>
        <div className="space-y-4">
          {POSLOUPNOST.map((id) => {
            const o = oblasti.get(id)
            if (!o) return null
            return (
              <OblastRadek
                key={id}
                o={o}
                nazev={t.oblasti[id]}
                t={t}
                r={r}
                vyklad={v[id]}
                sPraci={sPraci.has(id)}
              />
            )
          })}
        </div>
      </section>

      {/* ---- plán práce ---- */}
      <section className="mt-10">
        <Nadpis>{r.planTitul}</Nadpis>
        <p className="mb-5 max-w-[46rem] text-[14.5px] leading-relaxed text-[var(--wm-text-2)]">
          {r.planUvod}
        </p>
        <div className="space-y-5">
          {plan.map((faze) => (
            <div key={faze.poradi} className="diag-card p-5">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <span className="text-[11.5px] font-bold uppercase tracking-[0.12em] text-[var(--wm-blue)]">
                  {r.planTydny(faze.odTydne, faze.doTydne)}
                </span>
                <span className="text-[12.5px] font-semibold text-[var(--wm-text-3)]">
                  {faze.nazevOblasti}
                </span>
              </div>
              <h3 className="mt-1.5 text-[17px] font-bold tracking-tight">{faze.nazev}</h3>
              <Popisek>{r.planProc}</Popisek>
              <p className="text-[14px] leading-relaxed text-[var(--wm-text-2)]">{faze.duvod}</p>
              <Popisek>{r.planKroky}</Popisek>
              <Cislovane polozky={faze.kroky} />
              <Popisek>{r.planZnaky}</Popisek>
              <Odrazky polozky={faze.znaky} />
            </div>
          ))}
        </div>
        <p className="mt-4 rounded-xl bg-[var(--wm-surface-2)] p-4 text-[13.5px] leading-relaxed text-[var(--wm-text-2)]">
          {r.planPoznamka}
        </p>
      </section>

      {/* ---- individuální rozhovory ---- */}
      <section className="mt-10">
        <Nadpis>{r.rozhovoryTitul}</Nadpis>
        <p className="mb-4 max-w-[46rem] text-[14.5px] leading-relaxed text-[var(--wm-text-2)]">
          {r.rozhovoryUvod}
        </p>
        <Odrazky polozky={r.rozhovoryJak} />
        <h3 className="mt-6 text-[11.5px] font-bold uppercase tracking-[0.12em] text-[var(--wm-text-3)]">
          {r.rozhovoryOtazkyTitul}
        </h3>
        <div className="mt-3 grid gap-4 lg:grid-cols-2">
          {(oblastiKOtazkam(data) as DimensionId[]).map((id) => (
            <div key={id} className="diag-card p-4">
              <h4 className="text-[14px] font-bold tracking-tight">{t.oblasti[id]}</h4>
              <Odrazky polozky={v[id].otazky} />
            </div>
          ))}
        </div>
      </section>

      {/* ---- mantinely použití ---- */}
      <section className="mt-10">
        <Nadpis>{r.mantinelyTitul}</Nadpis>
        <p className="mb-4 max-w-[46rem] text-[14.5px] leading-relaxed text-[var(--wm-text-2)]">
          {r.mantinelyUvod}
        </p>
        <Odrazky polozky={r.mantinely} />
      </section>
    </div>
  )
}

function ShrnutiBlok({
  titul,
  barva,
  radky,
}: {
  titul: string
  barva: string
  radky: string[]
}) {
  return (
    <div className="diag-card p-5">
      <div className="h-[3px] w-[28px] rounded-full" style={{ background: barva }} />
      <h3 className="mt-3 text-[15px] font-bold tracking-tight">{titul}</h3>
      <Odrazky polozky={radky} />
    </div>
  )
}

function Popisek({ children }: { children: React.ReactNode }) {
  return (
    <h4 className="mt-4 mb-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--wm-text-3)]">
      {children}
    </h4>
  )
}

function Odrazky({ polozky }: { polozky: string[] }) {
  if (!polozky.length) return null
  return (
    <ul className="mt-2 space-y-1.5">
      {polozky.map((p) => (
        <li key={p.slice(0, 28)} className="flex gap-2.5 text-[14px] leading-relaxed text-[var(--wm-text-2)]">
          <span className="mt-[8px] h-[4px] w-[4px] shrink-0 rounded-[1px] bg-[var(--wm-text-3)]" />
          <span>{p}</span>
        </li>
      ))}
    </ul>
  )
}

function Cislovane({ polozky }: { polozky: string[] }) {
  if (!polozky.length) return null
  return (
    <ol className="mt-2 space-y-1.5">
      {polozky.map((p, i) => (
        <li key={p.slice(0, 28)} className="flex gap-2.5 text-[14px] leading-relaxed text-[var(--wm-text-2)]">
          <span className="shrink-0 text-[13px] font-bold text-[var(--wm-blue)]">{i + 1}</span>
          <span>{p}</span>
        </li>
      ))}
    </ol>
  )
}

// ---------------------------------------------------------------------------

/** Stažení reportu. Generátor se načítá až při kliknutí, ne s celou stránkou. */
function StahnoutPdf({ data, lang }: { data: TeamReport; lang: TymLang }) {
  const [stahuje, setStahuje] = useState(false)
  return (
    <button
      type="button"
      disabled={stahuje}
      onClick={async () => {
        setStahuje(true)
        try {
          const { buildTymPdf, tymPdfFileName } = await import("@/lib/tym/pdf")
          const url = URL.createObjectURL(buildTymPdf(data, lang))
          const a = document.createElement("a")
          a.href = url
          a.download = tymPdfFileName(data.nazev, lang)
          a.click()
          window.setTimeout(() => URL.revokeObjectURL(url), 10_000)
        } finally {
          setStahuje(false)
        }
      }}
      className="diag-press mt-5 rounded-full bg-[var(--wm-brand)] px-5 py-2 text-[13px] font-semibold text-[var(--wm-brand-fg)] disabled:opacity-50"
    >
      {stahuje ? "…" : lang === "en" ? "Download as PDF" : "Stáhnout jako PDF"}
    </button>
  )
}

function Nadpis({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-2 border-t-2 border-[var(--wm-brand)] pt-4 text-[22px] font-bold tracking-tight">
      {children}
    </h2>
  )
}

function NalezKarta({
  kod,
  sila,
  oblasti,
  lang,
  prvni,
}: {
  kod: NalezKod
  sila: "vysoka" | "stredni"
  oblasti: DimensionId[]
  lang: TymLang
  prvni: boolean
}) {
  const t = TYM[lang]
  const n = t.nalezy[kod]
  if (!n) return null
  const s = t.stitkyNalezu

  return (
    <article className="diag-card overflow-hidden">
      {prvni && (
        <div className="bg-[var(--wm-brand)] px-6 py-2 text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--wm-brand-fg)]">
          {t.prvniPraskne}
        </div>
      )}
      <div className="p-6 sm:p-7">
        <div className="flex flex-wrap items-baseline gap-3">
          <h3 className="text-[19px] font-bold tracking-tight">{n.nadpis}</h3>
          <div className="flex gap-1.5">
            {oblasti.map((id) => (
              <span
                key={id}
                className="rounded-full bg-[var(--wm-track)] px-2 py-0.5 text-[11px] font-bold text-[var(--wm-text-2)]"
                title={t.oblasti[id]}
              >
                {id}
              </span>
            ))}
            {sila === "vysoka" && (
              <span className="rounded-full bg-[var(--wm-red-light)] px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-[var(--wm-invalid-fg)]">
                {t.silaVysoka}
              </span>
            )}
          </div>
        </div>

        <Blok titul={s.coJeVidet}>{n.coJeVidet}</Blok>
        <Blok titul={s.coToDela}>{n.coToDela}</Blok>

        <div className="mt-5 rounded-2xl bg-[var(--wm-surface-2)] p-5">
          <Stitek>{s.coSTim}</Stitek>
          <ol className="mt-2 space-y-2">
            {n.coSTim.map((krok, i) => (
              <li key={i} className="flex gap-3 text-[14.5px] leading-relaxed">
                <span className="mt-[1px] w-4 shrink-0 text-[13px] font-bold tabular-nums text-[var(--wm-blue)]">
                  {i + 1}
                </span>
                <span>{krok}</span>
              </li>
            ))}
          </ol>
        </div>

        <div className="mt-4 border-l-[3px] border-[var(--wm-red)] pl-4">
          <Stitek>{s.coNedelat}</Stitek>
          <p className="mt-1 text-[14.5px] leading-relaxed text-[var(--wm-text-2)]">{n.coNedelat}</p>
        </div>
      </div>
    </article>
  )
}

function Blok({ titul, children }: { titul: string; children: React.ReactNode }) {
  return (
    <div className="mt-4">
      <Stitek>{titul}</Stitek>
      <p className="mt-1 text-[14.5px] leading-relaxed text-[var(--wm-text-2)]">{children}</p>
    </div>
  )
}

function Stitek({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--wm-text-3)]">
      {children}
    </span>
  )
}

function Seznam({
  titul,
  uvod,
  ids,
  lang,
  barva,
  zadne,
  znacka,
}: {
  titul: string
  uvod: string
  ids: DimensionId[]
  lang: TymLang
  barva: string
  zadne: string
  znacka?: (id: DimensionId) => string | undefined
}) {
  const t = TYM[lang]
  return (
    <div className="diag-card p-5">
      <div className="h-[3px] w-9 rounded-full" style={{ background: barva }} />
      <h3 className="mt-3 text-[16px] font-bold tracking-tight">{titul}</h3>
      <p className="mt-1.5 text-[13px] leading-relaxed text-[var(--wm-text-3)]">{uvod}</p>
      {ids.length === 0 ? (
        <p className="mt-3 text-[14px] text-[var(--wm-text-2)]">{zadne}</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {ids.map((id) => (
            <li key={id} className="text-[14.5px] leading-snug">
              <span className="font-semibold">{t.oblasti[id]}</span>
              {znacka?.(id) && (
                <span className="ml-2 rounded-full bg-[var(--wm-track)] px-2 py-0.5 text-[11px] font-semibold text-[var(--wm-text-2)]">
                  {znacka(id)}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

/**
 * Řádek oblasti: úroveň jako pruh, rozptyl jako rozpětí pod ním.
 *
 * Rozpětí se kreslí schválně přes celou šířku od nejnižšího po nejvyššího
 * hráče. Kouč tak vidí, jestli je za průměrem vyrovnaná skupina, nebo dva
 * tábory, což je informace, kterou samotný průměr zamlčí.
 */
function OblastRadek({
  o,
  nazev,
  t,
  r,
  vyklad,
  sPraci,
}: {
  o: TeamReport["oblasti"][number]
  nazev: string
  t: (typeof TYM)[TymLang]
  r: (typeof RAMEC)[TymLang]
  vyklad: (typeof VYKLAD)[TymLang][DimensionId]
  sPraci: boolean
}) {
  const celkem = o.pasma.priority + o.pasma.stabilization + o.pasma.strong + o.pasma.elite
  return (
    <div className="diag-card p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-[15.5px] font-bold tracking-tight">{nazev}</h3>
        <div className="flex items-center gap-2 text-[12px] text-[var(--wm-text-3)]">
          {o.plosna && (
            <span className="rounded-full bg-[var(--wm-track)] px-2 py-0.5 font-semibold text-[var(--wm-text-2)]">
              {t.plosna}
            </span>
          )}
          {o.rozptyl && (
            <span className="rounded-full bg-[var(--wm-orange-light)] px-2 py-0.5 font-semibold text-[var(--wm-caution-fg)]">
              {t.velkyRozptyl}
            </span>
          )}
          {o.rozkol && (
            <span className="rounded-full bg-[var(--wm-red-light)] px-2 py-0.5 font-semibold text-[var(--wm-invalid-fg)]">
              {t.rozkol}
            </span>
          )}
          <span className="tabular-nums">
            {t.legendaUroven} <b className="text-[var(--wm-text)]">{Math.round(o.prumer)}</b>
          </span>
          <span className="tabular-nums">
            {t.legendaRozptyl} <b className="text-[var(--wm-text)]">±{Math.round(o.smodch)}</b>
          </span>
        </div>
      </div>

      {/* úroveň */}
      <div className="mt-3 h-[6px] w-full overflow-hidden rounded-full bg-[var(--wm-track)]">
        <div
          className="h-full rounded-full bg-[var(--wm-brand)]"
          style={{ width: `${Math.max(2, Math.min(100, o.prumer))}%` }}
        />
      </div>

      {/* rozpětí od nejslabšího po nejsilnějšího hráče */}
      <div className="relative mt-2 h-[10px] w-full">
        <div className="absolute inset-x-0 top-[4px] h-[2px] rounded-full bg-[var(--wm-border-light)]" />
        <div
          className="absolute top-[3px] h-[4px] rounded-full"
          style={{
            left: `${Math.max(0, o.min)}%`,
            width: `${Math.max(1, o.max - o.min)}%`,
            background: o.rozkol ? "var(--wm-red)" : "var(--wm-bar-muted)",
          }}
        />
      </div>

      {celkem > 0 && (
        <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11.5px] text-[var(--wm-text-3)]">
          <span className="flex gap-1.5">
            <Pasmo n={o.pasma.priority} barva="var(--wm-red)" />
            <Pasmo n={o.pasma.stabilization} barva="var(--wm-orange)" />
            <Pasmo n={o.pasma.strong} barva="var(--wm-blue)" />
            <Pasmo n={o.pasma.elite} barva="var(--wm-green)" />
          </span>
          <span>{r.rozsahTymu(Math.round(o.min), Math.round(o.max))}</span>
        </div>
      )}

      <Popisek>{r.popiskyVykladu.coMeri}</Popisek>
      <p className="text-[14px] leading-relaxed text-[var(--wm-text-2)]">
        {vyklad.coMeri} {vyklad.procZalezi}
      </p>

      <Popisek>{r.popiskyVykladu.stav}</Popisek>
      <p className="text-[14px] leading-relaxed text-[var(--wm-text-2)]">
        {vyklad.uroven[urovenKlic(o.prumer)]}
      </p>
      <p className="mt-2 text-[14px] leading-relaxed text-[var(--wm-text-2)]">
        {vyklad.tvar[tvarKlic(o)]}
      </p>

      {sPraci && (
        <>
          <Popisek>{r.popiskyVykladu.prace}</Popisek>
          <Cislovane polozky={vyklad.prace} />
          <Popisek>{r.popiskyVykladu.znaky}</Popisek>
          <Odrazky polozky={vyklad.znaky} />
        </>
      )}
    </div>
  )
}

/** Kolik hráčů spadlo do pásma. Nula se nekreslí, ať řádek nešumí. */
function Pasmo({ n, barva }: { n: number; barva: string }) {
  if (!n) return null
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="h-[7px] w-[7px] rounded-full" style={{ background: barva }} />
      <span className="tabular-nums">{n}</span>
    </span>
  )
}
