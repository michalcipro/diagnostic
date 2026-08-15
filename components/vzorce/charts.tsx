"use client"

import {
  NAZVY_DOMEN,
  NAZVY_DOMEN_KRATCE,
  NAZVY_PASEM,
  NAZVY_PASEM_KRATCE,
  PASMA,
  VZORCE,
  vzorec,
} from "@/lib/vzorce/structure"
import { nazevVzorce } from "@/lib/vzorce/content"
import { UI_VZORCE } from "@/lib/vzorce/i18n"
import type { Lang } from "@/lib/diagnostic/types"
import type { Domena, Pasmo, Varianta, VzorecSkore } from "@/lib/vzorce/types"

// Grafy k profilu vzorců.
//
// Zvolená forma: vodorovné pruhy seřazené sestupně, s důrazem na tři
// nejaktivnější vzorce. Úkolem dat je porovnat velikost a vypíchnout tři
// z jedenácti, na což je pruhový graf s důrazem správná forma; pavučinový graf
// by plochou zkresloval a jedenáct os se nedá poctivě přečíst. Tři nejsilnější
// dostávají navíc prstenec, protože u nich nejde o srovnání mezi sebou, ale
// o jednu hodnotu na škále.
//
// Závažnost pásma NENESE barva, ale poloha na ose. Zelená a jantarová jsou pro
// protanopii prakticky totožné (ΔE 2,8), takže barevně kódovaná pásma by pro
// část lidí nesla nulovou informaci. Barva jen odděluje zvýrazněná data od
// ostatních, hranice pásem stojí jako značky pod osou a rozsahy v legendě.
//
// Přechod ve výplni je svislý, ne vodorovný: dělá hloubku, ale nepředstírá,
// že se hodnota podél pruhu mění.
//
// Rozvržení: nad 640 px jedna mřížka s pevnými šířkami sloupců, takže názvy,
// osa i skóre lícují na svislici napříč všemi řádky; stejnou mřížku dostane
// i tisk. Pod 640 px se stejná data vypisují ve svislém pořadí.

const OSA_MIN = 10
const OSA_MAX = 60

/** Podíl na ose 10 až 60, v procentech šířky plochy. */
const pozice = (skore: number) => ((skore - OSA_MIN) / (OSA_MAX - OSA_MIN)) * 100

/** Hranice pásem uvnitř osy: 20, 30, 40, 50. */
const HRANICE = PASMA.slice(1).map((p) => p.min)

/** Všechny popsané hodnoty na ose, od kraje ke kraji. */
const ZNACKY = [OSA_MIN, ...HRANICE, OSA_MAX]

/** Sloupce profilu: název | osa | skóre | odznak. */
const MRIZKA =
  "grid gap-x-3 grid-cols-[11rem_minmax(0,1fr)_2.75rem_1.5rem] lg:grid-cols-[13rem_minmax(0,1fr)_3rem_1.75rem]"

/** Oblasti mají delší názvy a žádný odznak, tak dostávají vlastní rozvrh. */
const MRIZKA_OBLASTI =
  "grid gap-x-3 grid-cols-[13rem_minmax(0,1fr)_2.75rem] lg:grid-cols-[15rem_minmax(0,1fr)_3rem]"

/** Výška jedné buňky. Pevná, aby řádky byly stejně vysoké. */
const RADEK = "h-11"

/** Světlý nádech přes plnou barvu: hloubka bez druhé barvy v datech. */
const LESK = "linear-gradient(180deg, rgba(255,255,255,0.34) 0%, rgba(255,255,255,0) 58%)"

const VYPLN_DURAZ = `${LESK}, var(--wm-blue)`
const VYPLN_KLID = `${LESK}, var(--wm-bar-muted)`

/** Pruh na ose. Dráha je vždy `w-full`, aby měla procentní šířka z čeho počítat. */
function Pruh({ skore, duraz, popis }: { skore: number; duraz: boolean; popis: string }) {
  return (
    <div className={`flex w-full min-w-0 items-center ${RADEK}`}>
      <div
        className="relative h-3.5 w-full overflow-hidden rounded-full bg-[var(--wm-track)]"
        title={popis}
      >
        <div
          className="h-full rounded-full transition-[width] duration-700 ease-out"
          style={{
            width: `${Math.max(2, pozice(skore))}%`,
            minWidth: "14px",
            background: duraz ? VYPLN_DURAZ : VYPLN_KLID,
            boxShadow: duraz ? "0 1px 4px rgba(0, 122, 255, 0.32)" : "none",
          }}
        />
      </div>
    </div>
  )
}

/** Dráha pro vzorec, který se pro chybějící odpovědi nevykazuje. */
function PruhChybi({ popis }: { popis: string }) {
  return (
    <div className={`flex w-full min-w-0 items-center ${RADEK}`}>
      <div
        className="h-3.5 w-full rounded-full border border-dashed border-[var(--wm-border)]"
        title={popis}
      />
    </div>
  )
}

/** Značky hranic pásem a číselná stupnice. Stojí jednou, pod celým grafem. */
function Stupnice() {
  return (
    <div className="relative w-full min-w-0 pt-2">
      <div className="relative h-1.5">
        {ZNACKY.map((h) => (
          <span
            key={h}
            className="absolute top-0 h-1.5 w-px -translate-x-1/2 bg-[var(--wm-border)]"
            style={{ left: `${pozice(h)}%` }}
          />
        ))}
      </div>
      <div className="relative mt-1 h-3.5">
        {ZNACKY.map((h, i) => (
          <span
            key={h}
            className={`absolute top-0 text-[10.5px] font-medium leading-none tabular-nums text-[var(--wm-text-3)] ${
              i === 0 ? "" : i === ZNACKY.length - 1 ? "-translate-x-full" : "-translate-x-1/2"
            }`}
            style={{ left: `${pozice(h)}%` }}
          >
            {h}
          </span>
        ))}
      </div>
    </div>
  )
}

/** Kolečko s počtem tvrzení označených hodnotou 5 nebo 6. */
function Odznak({ pocet, lang }: { pocet: number; lang: Lang }) {
  return (
    <span
      className="inline-flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full bg-[var(--wm-track)] text-[11px] font-semibold leading-none tabular-nums text-[var(--wm-text-2)]"
      title={UI_VZORCE[lang].odznakTitulek(pocet)}
    >
      {pocet}
    </span>
  )
}

/** Klíč k pásmům. Stojí v patce grafu, takže se nemá s čím překrýt. */
function KlicPasem({ lang }: { lang: Lang }) {
  return (
    <span className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
      <span className="text-[10.5px] font-bold uppercase tracking-[0.1em]">
        {UI_VZORCE[lang].pasmaKlic}
      </span>
      {PASMA.map((p) => (
        <span
          key={p.pasmo}
          className="whitespace-nowrap rounded-full bg-[var(--wm-track)] px-2 py-[3px] text-[11px] font-medium tabular-nums text-[var(--wm-text-2)]"
        >
          {p.min}–{p.max} {NAZVY_PASEM_KRATCE[lang][p.pasmo]}
        </span>
      ))}
    </span>
  )
}

/** Vzorek v legendě: stejný tvar i výplň jako pruh v grafu. */
function Vzorek({ duraz }: { duraz: boolean }) {
  return (
    <span
      className="h-2.5 w-7 shrink-0 rounded-full"
      style={{ background: duraz ? VYPLN_DURAZ : VYPLN_KLID }}
    />
  )
}

/** Patka grafu. */
function Patka({ children }: { children: React.ReactNode }) {
  return (
    <figcaption className="mt-5 flex flex-col gap-2.5 border-t border-[var(--wm-border-light)] pt-4 text-[12px] leading-relaxed text-[var(--wm-text-3)]">
      {children}
    </figcaption>
  )
}

/**
 * Prstenec pro jednu hodnotu na škále 10 až 60.
 *
 * U tří nejsilnějších vzorců nejde o srovnání mezi sebou, ale o to, kde na
 * škále vzorec stojí; prstenec tuhle jedinou hodnotu ukáže líp než pruh.
 * Vyplněná část odpovídá stejnému podílu jako délka pruhu v profilu.
 */
export function Prstenec({
  skore,
  pasmo,
  lang,
  velikost = 128,
}: {
  skore: number
  pasmo: Pasmo
  lang: Lang
  velikost?: number
}) {
  const polomer = 54
  const obvod = 2 * Math.PI * polomer
  const podil = Math.max(0, Math.min(1, (skore - OSA_MIN) / (OSA_MAX - OSA_MIN)))
  const id = `prsten-${pasmo}-${skore}`

  return (
    <div
      className="relative shrink-0"
      style={{ width: velikost, height: velikost }}
      title={UI_VZORCE[lang].bodyZ60(skore, NAZVY_PASEM[lang][pasmo].toLowerCase())}
    >
      <svg viewBox="0 0 128 128" className="h-full w-full -rotate-90">
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--wm-blue)" stopOpacity="0.55" />
            <stop offset="100%" stopColor="var(--wm-blue)" />
          </linearGradient>
        </defs>
        <circle cx="64" cy="64" r={polomer} fill="none" stroke="var(--wm-track)" strokeWidth="12" />
        <circle
          cx="64"
          cy="64"
          r={polomer}
          fill="none"
          stroke={`url(#${id})`}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={`${obvod * podil} ${obvod}`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[30px] font-bold leading-none tracking-tight tabular-nums">
          {skore}
        </span>
        <span className="mt-1 text-[11px] leading-none text-[var(--wm-text-3)]">
          {UI_VZORCE[lang].z60}
        </span>
      </div>
    </div>
  )
}

/** Tři prstence vedle sebe: rychlý obraz toho, kde vzorce stojí. */
export function TrojicePrstencu({
  top3,
  lang,
  varianta,
}: {
  top3: VzorecSkore[]
  lang: Lang
  varianta: Varianta
}) {
  if (!top3.length) return null
  const t = UI_VZORCE[lang]
  return (
    <div className="grid gap-7 sm:grid-cols-3">
      {top3.map((s, i) => (
        <div key={s.id} className="flex flex-col items-center text-center">
          <Prstenec skore={s.skore} pasmo={s.pasmo} lang={lang} />
          <p className="mt-3.5 text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--wm-text-3)]">
            {t.misto(i + 1)}
          </p>
          <p className="mt-1 text-[15.5px] font-semibold leading-tight">
            {nazevVzorce(s.id, lang, varianta)}
          </p>
          <p className="mt-1 text-[12.5px] text-[var(--wm-text-2)]">{NAZVY_PASEM[lang][s.pasmo]}</p>
        </div>
      ))}
    </div>
  )
}

/** Profil všech jedenácti vzorců. */
export function ProfilGraf({
  vsechny,
  top3,
  lang,
  varianta,
}: {
  vsechny: VzorecSkore[]
  top3: VzorecSkore[]
  lang: Lang
  varianta: Varianta
}) {
  const vBoji = new Set(top3.map((v) => v.id))
  const t = UI_VZORCE[lang]

  return (
    <figure className="m-0">
      {/* široký displej: jedna mřížka, všechno lícuje na svislici */}
      <div className="hidden sm:block">
        <div className={MRIZKA}>
          {vsechny.map((v) => {
            const duraz = vBoji.has(v.id)
            const nazev = nazevVzorce(v.id, lang, varianta)
            return (
              <div key={v.id} className="contents">
                <div className={`flex min-w-0 items-center ${RADEK}`}>
                  <span
                    className={`truncate text-[14px] ${
                      duraz ? "font-semibold text-[var(--wm-text)]" : "text-[var(--wm-text-2)]"
                    }`}
                    title={nazev}
                  >
                    {nazev}
                  </span>
                </div>

                {v.vykazuje ? (
                  <Pruh
                    skore={v.skore}
                    duraz={duraz}
                    popis={`${nazev}: ${t.bodyZ60(v.skore, NAZVY_PASEM[lang][v.pasmo].toLowerCase())}`}
                  />
                ) : (
                  <PruhChybi
                    popis={`${nazev}: ${t.zodpovezenoZ(v.zodpovezeno, v.celkem)}, ${t.nezarazuje}`}
                  />
                )}

                <div className={`flex items-center justify-end ${RADEK}`}>
                  <span
                    className={`tabular-nums ${
                      duraz
                        ? "text-[16px] font-bold text-[var(--wm-text)]"
                        : "text-[15px] font-medium text-[var(--wm-text-2)]"
                    }`}
                  >
                    {v.vykazuje ? v.skore : "–"}
                  </span>
                </div>

                <div className={`flex items-center justify-center ${RADEK}`}>
                  {v.silnychOdpovedi > 0 && <Odznak pocet={v.silnychOdpovedi} lang={lang} />}
                </div>
              </div>
            )
          })}

          <div />
          <Stupnice />
          <div />
          <div />
        </div>
      </div>

      {/* úzký displej: stejná data ve svislém pořadí */}
      <div className="flex flex-col gap-4 sm:hidden">
        {vsechny.map((v) => {
          const duraz = vBoji.has(v.id)
          const nazev = nazevVzorce(v.id, lang, varianta)
          return (
            <div key={v.id}>
              <div className="flex items-baseline justify-between gap-3">
                <span
                  className={`min-w-0 truncate text-[14.5px] ${
                    duraz ? "font-semibold text-[var(--wm-text)]" : "text-[var(--wm-text-2)]"
                  }`}
                >
                  {nazev}
                </span>
                <span className="flex shrink-0 items-center gap-2">
                  {v.silnychOdpovedi > 0 && <Odznak pocet={v.silnychOdpovedi} lang={lang} />}
                  <span
                    className={`tabular-nums ${
                      duraz
                        ? "text-[16px] font-bold text-[var(--wm-text)]"
                        : "text-[15px] font-medium text-[var(--wm-text-2)]"
                    }`}
                  >
                    {v.vykazuje ? v.skore : "–"}
                  </span>
                </span>
              </div>
              {v.vykazuje ? (
                <Pruh skore={v.skore} duraz={duraz} popis={nazev} />
              ) : (
                <PruhChybi popis={nazev} />
              )}
              <p className="text-[12px] leading-none text-[var(--wm-text-3)]">
                {v.vykazuje
                  ? NAZVY_PASEM[lang][v.pasmo]
                  : t.zodpovezenoZ(v.zodpovezeno, v.celkem)}
              </p>
            </div>
          )
        })}
        <Stupnice />
      </div>

      <Patka>
        <span className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <span className="flex items-center gap-2">
            <Vzorek duraz />
            {t.legendaTop3}
          </span>
          <span className="flex items-center gap-2">
            <Vzorek duraz={false} />
            {t.legendaOstatni}
          </span>
          <span className="flex items-center gap-2">
            <Odznak pocet={5} lang={lang} />
            {t.legendaOdznak}
          </span>
        </span>
        <KlicPasem lang={lang} />
      </Patka>
    </figure>
  )
}

/**
 * Zatížení pěti oblastí potřeb.
 *
 * Druhý pohled na tatáž data: ne po jednotlivých vzorcích, ale po oblastech,
 * ze kterých pocházejí. Právě tohle rozhoduje o tom, jestli jde o jedno téma
 * ve třech podobách, nebo o tři nezávislé věci.
 */
export function DomenyGraf({
  vsechny,
  lang,
  varianta,
}: {
  vsechny: VzorecSkore[]
  lang: Lang
  varianta: Varianta
}) {
  const t = UI_VZORCE[lang]
  const podleDomen = new Map<Domena, VzorecSkore[]>()
  for (const v of vsechny) {
    if (!v.vykazuje) continue
    const d = vzorec(v.id).domena
    podleDomen.set(d, [...(podleDomen.get(d) ?? []), v])
  }

  const radky = [...podleDomen.entries()]
    .map(([d, vs]) => ({
      domena: d,
      prumer: Math.round(vs.reduce((a, b) => a + b.skore, 0) / vs.length),
      pocet: vs.length,
    }))
    .sort((a, b) => b.prumer - a.prumer)

  if (!radky.length) return null
  const nejvic = radky[0].prumer
  const pocetSlovy = t.pocetVzorcu

  return (
    <figure className="m-0">
      <div className="hidden sm:block">
        <div className={MRIZKA_OBLASTI}>
          {radky.map((r) => {
            const duraz = r.prumer === nejvic
            const nazev = NAZVY_DOMEN[varianta][lang][r.domena]
            return (
              <div key={r.domena} className="contents">
                <div className={`flex min-w-0 items-center ${RADEK}`}>
                  <span
                    className={`truncate text-[14px] ${
                      duraz ? "font-semibold text-[var(--wm-text)]" : "text-[var(--wm-text-2)]"
                    }`}
                    title={`${nazev}, ${pocetSlovy(r.pocet)}`}
                  >
                    {NAZVY_DOMEN_KRATCE[varianta][lang][r.domena]}{" "}
                    <span className="font-normal text-[var(--wm-text-3)]">({r.pocet})</span>
                  </span>
                </div>

                <Pruh
                  skore={r.prumer}
                  duraz={duraz}
                  popis={`${nazev}: ${t.prumerZ(r.prumer, pocetSlovy(r.pocet))}`}
                />

                <div className={`flex items-center justify-end ${RADEK}`}>
                  <span
                    className={`tabular-nums ${
                      duraz
                        ? "text-[16px] font-bold text-[var(--wm-text)]"
                        : "text-[15px] font-medium text-[var(--wm-text-2)]"
                    }`}
                  >
                    {r.prumer}
                  </span>
                </div>

              </div>
            )
          })}

          <div />
          <Stupnice />
          <div />
        </div>
      </div>

      <div className="flex flex-col gap-4 sm:hidden">
        {radky.map((r) => {
          const duraz = r.prumer === nejvic
          return (
            <div key={r.domena}>
              <div className="flex items-baseline justify-between gap-3">
                <span
                  className={`min-w-0 truncate text-[14.5px] ${
                    duraz ? "font-semibold text-[var(--wm-text)]" : "text-[var(--wm-text-2)]"
                  }`}
                >
                  {NAZVY_DOMEN[varianta][lang][r.domena]}
                </span>
                <span className="shrink-0 text-[15px] font-medium tabular-nums text-[var(--wm-text-2)]">
                  {r.prumer}
                </span>
              </div>
              <Pruh skore={r.prumer} duraz={duraz} popis={NAZVY_DOMEN[varianta][lang][r.domena]} />
              <p className="text-[12px] leading-none text-[var(--wm-text-3)]">
                {pocetSlovy(r.pocet)}
              </p>
            </div>
          )
        })}
        <Stupnice />
      </div>

      <Patka>
        <span>{t.oblastiPatka}</span>
        <KlicPasem lang={lang} />
      </Patka>
    </figure>
  )
}

/** Kolik vzorců z jedenácti spadá do které domény. Používá se v legendě. */
export function pocetVDomene(): Record<Domena, number> {
  const out = {} as Record<Domena, number>
  for (const v of VZORCE) out[v.domena] = (out[v.domena] ?? 0) + 1
  return out
}
