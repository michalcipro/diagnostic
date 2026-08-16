"use client"

import { nazevArchetypu, obsahArchetypu } from "@/lib/archetypy/content"
import { UI_ARCHETYPY } from "@/lib/archetypy/i18n"
import { NAZVY_MOTIVACI, POPISY_MOTIVACI } from "@/lib/archetypy/structure"
import type { ArchetypSkore, Motivace, Varianta } from "@/lib/archetypy/types"
import type { Lang } from "@/lib/diagnostic/types"

// Grafy k profilu archetypů.
//
// Stejná řeč forem jako u vzorců: vodorovné pruhy seřazené sestupně, důraz
// nese barva a váha písma, ne poloha v jiné soustavě. U archetypů nejsou
// pásma závažnosti, protože nejde o problém, ale o identitu; osa je prostá
// stupnice 8 až 48 a jediné vyzdvižení patří primárnímu a sekundárnímu
// archetypu, tedy dvojici, se kterou se dál pracuje.
//
// Přechod ve výplni je svislý, ne vodorovný: dělá hloubku, ale nepředstírá,
// že se hodnota podél pruhu mění.

const OSA_MIN = 8
const OSA_MAX = 48

/** Podíl na ose 8 až 48, v procentech šířky plochy. */
const pozice = (skore: number) => ((skore - OSA_MIN) / (OSA_MAX - OSA_MIN)) * 100

/** Popsané hodnoty na ose, od kraje ke kraji po deseti bodech. */
const ZNACKY = [8, 18, 28, 38, 48]

/** Sloupce profilu: název | osa | skóre | odznak. */
const MRIZKA =
  "grid gap-x-3 grid-cols-[10rem_minmax(0,1fr)_2.75rem_1.5rem] lg:grid-cols-[12rem_minmax(0,1fr)_3rem_1.75rem]"

/** Motivační mapa: název | osa | procenta. */
const MRIZKA_MOTIVACE =
  "grid gap-x-3 grid-cols-[10rem_minmax(0,1fr)_3.25rem] lg:grid-cols-[13rem_minmax(0,1fr)_3.5rem]"

/** Výška jedné buňky. Pevná, aby řádky byly stejně vysoké. */
const RADEK = "h-11"

/** Světlý nádech přes plnou barvu: hloubka bez druhé barvy v datech. */
const LESK = "linear-gradient(180deg, rgba(255,255,255,0.34) 0%, rgba(255,255,255,0) 58%)"

const VYPLN_DURAZ = `${LESK}, var(--wm-blue)`
const VYPLN_KLID = `${LESK}, var(--wm-bar-muted)`

/** Pruh na ose. Dráha je vždy `w-full`, aby měla procentní šířka z čeho počítat. */
function Pruh({ podil, duraz, popis }: { podil: number; duraz: boolean; popis: string }) {
  return (
    <div className={`flex w-full min-w-0 items-center ${RADEK}`}>
      <div
        className="relative h-3.5 w-full overflow-hidden rounded-full bg-[var(--wm-track)]"
        title={popis}
      >
        <div
          className="h-full rounded-full transition-[width] duration-700 ease-out"
          style={{
            width: `${Math.max(2, podil)}%`,
            minWidth: "14px",
            background: duraz ? VYPLN_DURAZ : VYPLN_KLID,
            boxShadow: duraz ? "0 1px 4px rgba(0, 122, 255, 0.32)" : "none",
          }}
        />
      </div>
    </div>
  )
}

/** Dráha pro archetyp, který se pro chybějící odpovědi nevykazuje. */
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

/** Číselná stupnice pod grafem. */
function Stupnice({ znacky, poloha }: { znacky: number[]; poloha: (h: number) => number }) {
  return (
    <div className="relative w-full min-w-0 pt-2">
      <div className="relative h-1.5">
        {znacky.map((h) => (
          <span
            key={h}
            className="absolute top-0 h-1.5 w-px -translate-x-1/2 bg-[var(--wm-border)]"
            style={{ left: `${poloha(h)}%` }}
          />
        ))}
      </div>
      <div className="relative mt-1 h-3.5">
        {znacky.map((h, i) => (
          <span
            key={h}
            className={`absolute top-0 text-[10.5px] font-medium leading-none tabular-nums text-[var(--wm-text-3)] ${
              i === 0 ? "" : i === znacky.length - 1 ? "-translate-x-full" : "-translate-x-1/2"
            }`}
            style={{ left: `${poloha(h)}%` }}
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
      title={UI_ARCHETYPY[lang].odznakTitulek(pocet)}
    >
      {pocet}
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
 * Prstenec pro jednu hodnotu na škále 8 až 48. U primárního a sekundárního
 * archetypu nejde o srovnání mezi sebou, ale o to, jak silně na škále stojí.
 */
export function PrstenecArchetypu({
  skore,
  lang,
  velikost = 128,
}: {
  skore: number
  lang: Lang
  velikost?: number
}) {
  const polomer = 54
  const obvod = 2 * Math.PI * polomer
  const podil = Math.max(0, Math.min(1, (skore - OSA_MIN) / (OSA_MAX - OSA_MIN)))
  const id = `prsten-archetyp-${skore}`

  return (
    <div
      className="relative shrink-0"
      style={{ width: velikost, height: velikost }}
      title={UI_ARCHETYPY[lang].bodyZ48(skore)}
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
          {UI_ARCHETYPY[lang].z48}
        </span>
      </div>
    </div>
  )
}

/** Dvojice prstenců: primární a sekundární archetyp vedle sebe. */
export function DvojicePrstencu({
  primarni,
  sekundarni,
  lang,
  varianta,
}: {
  primarni: ArchetypSkore
  sekundarni: ArchetypSkore
  lang: Lang
  varianta: Varianta
}) {
  const t = UI_ARCHETYPY[lang]
  const dvojice = [
    { skore: primarni, popis: t.primarniTitulek },
    { skore: sekundarni, popis: t.sekundarniTitulek },
  ]
  return (
    <div className="grid gap-7 sm:grid-cols-2">
      {dvojice.map(({ skore, popis }) => (
        <div key={skore.id} className="flex flex-col items-center text-center">
          <PrstenecArchetypu skore={skore.skore} lang={lang} />
          <p className="mt-3.5 text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--wm-text-3)]">
            {popis}
          </p>
          <p className="mt-1 text-[15.5px] font-semibold leading-tight">
            {nazevArchetypu(skore.id, lang, varianta)}
          </p>
          <p className="mt-1 text-[12.5px] text-[var(--wm-text-2)]">
            „{obsahArchetypu(skore.id, lang, varianta).motto}“
          </p>
        </div>
      ))}
    </div>
  )
}

/** Profil všech dvanácti archetypů, seřazený sestupně. */
export function ProfilArchetypuGraf({
  vsechny,
  primarni,
  sekundarni,
  lang,
  varianta,
}: {
  vsechny: ArchetypSkore[]
  primarni: ArchetypSkore
  sekundarni: ArchetypSkore
  lang: Lang
  varianta: Varianta
}) {
  const vyzdvizene = new Set([primarni.id, sekundarni.id])
  const t = UI_ARCHETYPY[lang]

  return (
    <figure className="m-0">
      {/* široký displej: jedna mřížka, všechno lícuje na svislici */}
      <div className="hidden sm:block">
        <div className={MRIZKA}>
          {vsechny.map((v) => {
            const duraz = vyzdvizene.has(v.id)
            const nazev = nazevArchetypu(v.id, lang, varianta)
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
                    podil={pozice(v.skore)}
                    duraz={duraz}
                    popis={`${nazev}: ${t.bodyZ48(v.skore)}`}
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
          <Stupnice znacky={ZNACKY} poloha={pozice} />
          <div />
          <div />
        </div>
      </div>

      {/* úzký displej: stejná data ve svislém pořadí */}
      <div className="flex flex-col gap-4 sm:hidden">
        {vsechny.map((v) => {
          const duraz = vyzdvizene.has(v.id)
          const nazev = nazevArchetypu(v.id, lang, varianta)
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
                <Pruh podil={pozice(v.skore)} duraz={duraz} popis={nazev} />
              ) : (
                <PruhChybi popis={nazev} />
              )}
            </div>
          )
        })}
        <Stupnice znacky={ZNACKY} poloha={pozice} />
      </div>

      <Patka>
        <span className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <span className="flex items-center gap-2">
            <Vzorek duraz />
            {t.legendaTop}
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
      </Patka>
    </figure>
  )
}

/**
 * Motivační mapa: čtyři skupiny podle dvou os knihy. Druhý pohled na tatáž
 * data; rozhoduje o tom, jestli profil čerpá z jednoho směru, nebo se pne
 * mezi dvěma.
 */
export function MotivaceGraf({
  motivace,
  lang,
  varianta,
}: {
  motivace: Record<Motivace, number>
  lang: Lang
  varianta: Varianta
}) {
  const t = UI_ARCHETYPY[lang]
  const radky = (Object.entries(motivace) as [Motivace, number][])
    .map(([m, procenta]) => ({ m, procenta }))
    .sort((a, b) => b.procenta - a.procenta)
  const nejvic = radky[0].procenta

  return (
    <figure className="m-0">
      <div className="hidden sm:block">
        <div className={MRIZKA_MOTIVACE}>
          {radky.map((r) => {
            const duraz = r.procenta === nejvic
            const nazev = NAZVY_MOTIVACI[lang][r.m]
            return (
              <div key={r.m} className="contents">
                <div className={`flex min-w-0 items-center ${RADEK}`}>
                  <span
                    className={`truncate text-[14px] ${
                      duraz ? "font-semibold text-[var(--wm-text)]" : "text-[var(--wm-text-2)]"
                    }`}
                    title={`${nazev}: ${POPISY_MOTIVACI[varianta][lang][r.m]}`}
                  >
                    {nazev}
                  </span>
                </div>

                <Pruh
                  podil={r.procenta}
                  duraz={duraz}
                  popis={`${nazev}: ${t.prumerSkupiny(r.procenta)}`}
                />

                <div className={`flex items-center justify-end ${RADEK}`}>
                  <span
                    className={`tabular-nums ${
                      duraz
                        ? "text-[16px] font-bold text-[var(--wm-text)]"
                        : "text-[15px] font-medium text-[var(--wm-text-2)]"
                    }`}
                  >
                    {r.procenta}&thinsp;%
                  </span>
                </div>
              </div>
            )
          })}

          <div />
          <Stupnice znacky={[0, 25, 50, 75, 100]} poloha={(h) => h} />
          <div />
        </div>
      </div>

      <div className="flex flex-col gap-4 sm:hidden">
        {radky.map((r) => {
          const duraz = r.procenta === nejvic
          const nazev = NAZVY_MOTIVACI[lang][r.m]
          return (
            <div key={r.m}>
              <div className="flex items-baseline justify-between gap-3">
                <span
                  className={`min-w-0 truncate text-[14.5px] ${
                    duraz ? "font-semibold text-[var(--wm-text)]" : "text-[var(--wm-text-2)]"
                  }`}
                >
                  {nazev}
                </span>
                <span className="shrink-0 text-[15px] font-medium tabular-nums text-[var(--wm-text-2)]">
                  {r.procenta}&thinsp;%
                </span>
              </div>
              <Pruh podil={r.procenta} duraz={duraz} popis={nazev} />
              <p className="text-[12px] leading-relaxed text-[var(--wm-text-3)]">
                {POPISY_MOTIVACI[varianta][lang][r.m]}
              </p>
            </div>
          )
        })}
        <Stupnice znacky={[0, 25, 50, 75, 100]} poloha={(h) => h} />
      </div>

      <Patka>
        <span>{t.motivacePatka}</span>
      </Patka>
    </figure>
  )
}
