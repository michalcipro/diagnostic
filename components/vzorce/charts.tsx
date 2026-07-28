"use client"

import { NAZVY_DOMEN, NAZVY_PASEM, PASMA, VZORCE, vzorec } from "@/lib/vzorce/structure"
import { OBSAH } from "@/lib/vzorce/data/obsah"
import type { Domena, VzorecSkore } from "@/lib/vzorce/types"

// Grafy k profilu vzorců.
//
// Zvolená forma: vodorovné pruhy seřazené sestupně, s důrazem na tři
// nejaktivnější vzorce. Úkolem dat je porovnat velikost a vypíchnout tři
// z jedenácti, na což je pruhový graf s důrazem správná forma; pavučinový graf
// by plochou zkresloval a jedenáct os se nedá poctivě přečíst.
//
// Závažnost pásma NENESE barva, ale poloha na ose. Zelená a jantarová jsou pro
// protanopii prakticky totožné (ΔE 2,8), takže barevně kódovaná pásma by pro
// část lidí nesla nulovou informaci. Hranice pásem jsou proto svislé linky
// přes celý graf, jejich rozsahy stojí v legendě pod grafem a název pásma je
// u každého řádku napsaný slovy.
//
// Rozvržení: nad 640 px jedna mřížka s pevnými šířkami sloupců, takže názvy,
// osa i skóre lícují na svislici napříč všemi řádky; stejnou mřížku dostane
// i tisk. Pod 640 px se stejná data vypisují ve svislém pořadí, protože čtyři
// sloupce se na telefon poctivě nevejdou.

const OSA_MIN = 10
const OSA_MAX = 60

/** Podíl na ose 10 až 60, v procentech šířky plochy. */
const pozice = (skore: number) => ((skore - OSA_MIN) / (OSA_MAX - OSA_MIN)) * 100

/**
 * Sloupce mřížky: název | osa | skóre | odznak. Na jednom místě, ať patka
 * lícuje s řádky. Pásmo tu vlastní sloupec nemá, protože se čte z polohy na
 * ose a jeho rozsahy stojí v legendě; na šířku vyhodnocení by se pátý sloupec
 * vešel jen za cenu useknuté osy.
 */
const MRIZKA =
  "grid gap-x-3 grid-cols-[10.5rem_minmax(0,1fr)_2.5rem_1.5rem] lg:grid-cols-[13rem_minmax(0,1fr)_2.75rem_1.75rem]"

/** Výška jedné buňky. Pevná, aby řádky byly stejně vysoké a nic neposkakovalo. */
const RADEK = "h-9"

/** Hranice pásem bez levého kraje: 20, 30, 40, 50 a pravý konec osy. */
const HRANICE = [...PASMA.slice(1).map((p) => p.min), OSA_MAX]

/** Podklad osy: svislé linky na hranicích pásem, přes celou výšku řádku. */
function Mrizka() {
  return (
    <div className="pointer-events-none absolute inset-0">
      {HRANICE.map((h) => (
        <div
          key={h}
          className="absolute inset-y-0 w-px bg-[var(--wm-border-light)]"
          style={{ left: `${pozice(h)}%` }}
        />
      ))}
    </div>
  )
}

/**
 * Jeden pruh na ose. Plocha je vždy `w-full`, aby procentní šířka pruhu měla
 * z čeho počítat; bez toho se pruh v pružném řádku smrskne na nulu.
 */
function Pruh({ skore, duraz }: { skore: number; duraz: boolean }) {
  return (
    <div className={`relative flex w-full min-w-0 items-center ${RADEK}`}>
      <Mrizka />
      <div
        className="relative h-2.5 rounded-l-[3px] rounded-r-full transition-[width] duration-700"
        style={{
          width: `${Math.max(2, pozice(skore))}%`,
          background: duraz ? "var(--wm-blue)" : "var(--wm-text-3)",
        }}
      />
    </div>
  )
}

/** Plocha pro vzorec, který se pro chybějící odpovědi nevykazuje. */
function PruhChybi({ popis }: { popis: string }) {
  return (
    <div className={`relative flex w-full min-w-0 items-center ${RADEK}`}>
      <Mrizka />
      <span className="relative truncate text-[12px] italic text-[var(--wm-text-3)]">{popis}</span>
    </div>
  )
}

/** Všechny popsané hodnoty na ose, od kraje ke kraji. */
const ZNACKY = [OSA_MIN, ...HRANICE]

/**
 * Číselná stupnice pod osou. Popisky visí přesně na hranicích pásem, krajní
 * dva zarovnané dovnitř, aby graf nikde nepřetékal.
 */
function Stupnice() {
  return (
    <div className="relative h-3 w-full min-w-0">
      {ZNACKY.map((h, i) => (
        <span
          key={h}
          className={`absolute top-0 text-[10px] leading-none tabular-nums text-[var(--wm-text-3)] ${
            i === 0 ? "" : i === ZNACKY.length - 1 ? "-translate-x-full" : "-translate-x-1/2"
          }`}
          style={{ left: `${pozice(h)}%` }}
        >
          {h}
        </span>
      ))}
    </div>
  )
}

/** Kolečko s počtem tvrzení označených hodnotou 5 nebo 6. */
function Odznak({ pocet }: { pocet: number }) {
  return (
    <span
      className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-[var(--wm-border-light)] bg-[var(--wm-surface-2)] text-[11px] font-semibold leading-none tabular-nums text-[var(--wm-text-2)]"
      title={`${pocet} tvrzení označeno hodnotou 5 nebo 6`}
    >
      {pocet}
    </span>
  )
}

/** Klíč k pásmům. Stojí v patce grafu, takže se nemá s čím překrýt. */
function KlicPasem() {
  return (
    <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
      <span className="font-semibold uppercase tracking-[0.08em]">Pásma</span>
      {PASMA.map((p) => (
        <span key={p.pasmo} className="whitespace-nowrap tabular-nums">
          {p.min}–{p.max} {NAZVY_PASEM[p.pasmo].replace(" aktivace", "").toLowerCase()}
        </span>
      ))}
    </span>
  )
}

/** Patka grafu: dva řádky, oba zarovnané na levý okraj figury. */
function Patka({ children }: { children: React.ReactNode }) {
  return (
    <figcaption className="mt-4 flex flex-col gap-2 border-t border-[var(--wm-border-light)] pt-3 text-[12px] leading-relaxed text-[var(--wm-text-3)]">
      {children}
    </figcaption>
  )
}

/**
 * Profil všech jedenácti vzorců.
 */
export function ProfilGraf({ vsechny, top3 }: { vsechny: VzorecSkore[]; top3: VzorecSkore[] }) {
  const vBoji = new Set(top3.map((v) => v.id))

  return (
    <figure className="m-0">
      {/* široký displej: jedna mřížka, všechno lícuje na svislici */}
      <div className="hidden sm:block">
        <div className={MRIZKA}>
          {vsechny.map((v) => {
            const duraz = vBoji.has(v.id)
            return (
              <div key={v.id} className="contents">
                <div className={`flex min-w-0 items-center ${RADEK}`}>
                  <span
                    className={`truncate text-[13.5px] ${
                      duraz ? "font-semibold text-[var(--wm-text)]" : "text-[var(--wm-text-2)]"
                    }`}
                    title={OBSAH[v.id].nazev}
                  >
                    {OBSAH[v.id].nazev}
                  </span>
                </div>

                {v.vykazuje ? (
                  <Pruh skore={v.skore} duraz={duraz} />
                ) : (
                  <PruhChybi popis={`zodpovězeno ${v.zodpovezeno} z ${v.celkem} položek`} />
                )}

                <div className={`flex items-center justify-end ${RADEK}`}>
                  <span
                    className={`text-[13.5px] tabular-nums ${
                      duraz ? "font-semibold text-[var(--wm-text)]" : "text-[var(--wm-text-2)]"
                    }`}
                  >
                    {v.vykazuje ? v.skore : "–"}
                  </span>
                </div>

                <div className={`flex items-center justify-center ${RADEK}`}>
                  {v.silnychOdpovedi > 0 && <Odznak pocet={v.silnychOdpovedi} />}
                </div>
              </div>
            )
          })}

          <div />
          <div className="pt-1.5">
            <Stupnice />
          </div>
          <div />
          <div />
        </div>
      </div>

      {/* úzký displej: stejná data ve svislém pořadí */}
      <div className="flex flex-col gap-4 sm:hidden">
        {vsechny.map((v) => {
          const duraz = vBoji.has(v.id)
          return (
            <div key={v.id}>
              <div className="flex items-baseline justify-between gap-3">
                <span
                  className={`min-w-0 truncate text-[14px] ${
                    duraz ? "font-semibold text-[var(--wm-text)]" : "text-[var(--wm-text-2)]"
                  }`}
                >
                  {OBSAH[v.id].nazev}
                </span>
                <span className="flex shrink-0 items-center gap-2">
                  {v.silnychOdpovedi > 0 && <Odznak pocet={v.silnychOdpovedi} />}
                  <span
                    className={`text-[13.5px] tabular-nums ${
                      duraz ? "font-semibold text-[var(--wm-text)]" : "text-[var(--wm-text-2)]"
                    }`}
                  >
                    {v.vykazuje ? v.skore : "–"}
                  </span>
                </span>
              </div>
              {v.vykazuje ? (
                <Pruh skore={v.skore} duraz={duraz} />
              ) : (
                <PruhChybi popis={`zodpovězeno ${v.zodpovezeno} z ${v.celkem} položek`} />
              )}
              <p className="text-[12px] leading-none text-[var(--wm-text-3)]">
                {v.vykazuje ? NAZVY_PASEM[v.pasmo] : "do pořadí se nezařazuje"}
              </p>
            </div>
          )
        })}
        <Stupnice />
      </div>

      <Patka>
        <span className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <span className="flex items-center gap-2">
            <span className="h-2.5 w-6 rounded-full" style={{ background: "var(--wm-blue)" }} />
            tři nejaktivnější vzorce
          </span>
          <span className="flex items-center gap-2">
            <span className="h-2.5 w-6 rounded-full" style={{ background: "var(--wm-text-3)" }} />
            ostatní
          </span>
          <span className="flex items-center gap-2">
            <Odznak pocet={5} />
            počet tvrzení s hodnotou 5 nebo 6
          </span>
        </span>
        <KlicPasem />
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
export function DomenyGraf({ vsechny }: { vsechny: VzorecSkore[] }) {
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

  const pocetSlovy = (n: number) => (n === 1 ? "1 vzorec" : n < 5 ? `${n} vzorce` : `${n} vzorců`)

  return (
    <figure className="m-0">
      <div className="hidden sm:block">
        <div className={MRIZKA}>
          {radky.map((r) => {
            const duraz = r.prumer === nejvic
            return (
              <div key={r.domena} className="contents">
                <div className={`flex min-w-0 items-center ${RADEK}`}>
                  <span
                    className={`truncate text-[13.5px] ${
                      duraz ? "font-semibold text-[var(--wm-text)]" : "text-[var(--wm-text-2)]"
                    }`}
                    title={`${NAZVY_DOMEN[r.domena]}, ${pocetSlovy(r.pocet)}`}
                  >
                    {NAZVY_DOMEN[r.domena]}{" "}
                    <span className="font-normal text-[var(--wm-text-3)]">({r.pocet})</span>
                  </span>
                </div>

                <Pruh skore={r.prumer} duraz={duraz} />

                <div className={`flex items-center justify-end ${RADEK}`}>
                  <span
                    className={`text-[13.5px] tabular-nums ${
                      duraz ? "font-semibold text-[var(--wm-text)]" : "text-[var(--wm-text-2)]"
                    }`}
                  >
                    {r.prumer}
                  </span>
                </div>

                <div className={RADEK} />
              </div>
            )
          })}

          <div />
          <div className="pt-1.5">
            <Stupnice />
          </div>
          <div />
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
                  className={`min-w-0 truncate text-[14px] ${
                    duraz ? "font-semibold text-[var(--wm-text)]" : "text-[var(--wm-text-2)]"
                  }`}
                >
                  {NAZVY_DOMEN[r.domena]}
                </span>
                <span className="shrink-0 text-[13.5px] tabular-nums text-[var(--wm-text-2)]">
                  {r.prumer}
                </span>
              </div>
              <Pruh skore={r.prumer} duraz={duraz} />
              <p className="text-[12px] leading-none text-[var(--wm-text-3)]">
                {pocetSlovy(r.pocet)}
              </p>
            </div>
          )
        })}
        <Stupnice />
      </div>

      <Patka>
        <span>
          Průměrné skóre vzorců v dané oblasti; v závorce je počet vzorců, ze kterých se počítá.
          Vzorce se sdružují podle toho, která dětská potřeba zůstala nenaplněná, takže zatížená
          oblast říká víc než jednotlivé skóre.
        </span>
        <KlicPasem />
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
