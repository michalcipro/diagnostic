"use client"

import { useEffect, useState } from "react"
import {
  CASTOST_POZOROVANI,
  DELKA_VEDENI,
  HODNOCENI_TEXTY,
  HODNOTA_MAX,
  HODNOTA_MIN,
  POLOZKY_HODNOCENI,
  dostVyplneno,
  type CastostPozorovani,
  type DelkaVedeni,
  type PolozkaHodnoceni,
} from "@/lib/diagnostic/hodnoceni-trenera"
import { chybaText, mojeHodnoceni, ohodnot } from "@/lib/diagnostic/remote"
import type { Lang } from "@/lib/diagnostic/types"

// Formulář hodnocení sportovce trenérem pod vyhodnocením v detailu.
//
// Stojí mimo report i mimo PDF (diag-no-print): je to kritérium pro ověření
// diagnostiky, ne součást výstupu pro sportovce. Předvyplní se posledním
// vlastním hodnocením, aby oprava v následujících dnech nezačínala od nuly.

const STUPNE = Array.from({ length: HODNOTA_MAX - HODNOTA_MIN + 1 }, (_, i) => HODNOTA_MIN + i)

/** Hodnota položky: číslo, „nemohu posoudit“ (null), nebo zatím nic. */
type Volba = number | null | undefined

export function HodnoceniTrenera({
  sessionToken,
  resultId,
  lang,
}: {
  sessionToken: string
  resultId: string
  lang: Lang
}) {
  const t = HODNOCENI_TEXTY[lang]
  const [delka, setDelka] = useState<DelkaVedeni | "">("")
  const [castost, setCastost] = useState<CastostPozorovani | "">("")
  const [volby, setVolby] = useState<Partial<Record<PolozkaHodnoceni, Volba>>>({})
  const [posledni, setPosledni] = useState<number | null>(null)
  const [ukladam, setUkladam] = useState(false)
  const [stav, setStav] = useState<{ chyba: boolean; text: string } | null>(null)

  useEffect(() => {
    let zruseno = false
    mojeHodnoceni(sessionToken, resultId)
      .then((seznam) => {
        if (zruseno || seznam.length === 0) return
        const h = seznam[0]
        setDelka((DELKA_VEDENI as readonly string[]).includes(h.delkaVedeni) ? (h.delkaVedeni as DelkaVedeni) : "")
        setCastost(
          (CASTOST_POZOROVANI as readonly string[]).includes(h.castostPozorovani)
            ? (h.castostPozorovani as CastostPozorovani)
            : "",
        )
        const nove: Partial<Record<PolozkaHodnoceni, Volba>> = {}
        for (const p of POLOZKY_HODNOCENI) {
          const z = h.hodnoty.find((x) => x.id === p)
          // Uložená položka bez čísla je vědomé „nemohu posoudit“.
          nove[p] = z ? (typeof z.hodnota === "number" ? z.hodnota : null) : undefined
        }
        setVolby(nove)
        setPosledni(h.createdAt)
      })
      .catch(() => {
        // Bez předvyplnění se dá hodnotit dál; chyba se ukáže až při uložení.
      })
    return () => {
      zruseno = true
    }
  }, [sessionToken, resultId])

  const nastav = (p: PolozkaHodnoceni, v: Volba) => {
    setVolby((prev) => ({ ...prev, [p]: v }))
    setStav(null)
  }

  const uloz = async () => {
    if (!delka || !castost) {
      setStav({ chyba: true, text: t.chybiKontext })
      return
    }
    const cisla: Partial<Record<PolozkaHodnoceni, number>> = {}
    for (const p of POLOZKY_HODNOCENI) {
      const v = volby[p]
      if (typeof v === "number") cisla[p] = v
    }
    if (!dostVyplneno(cisla)) {
      setStav({ chyba: true, text: t.chybiHodnoty })
      return
    }
    setUkladam(true)
    setStav(null)
    try {
      await ohodnot(
        sessionToken,
        resultId,
        POLOZKY_HODNOCENI.map((p) => (typeof cisla[p] === "number" ? { id: p, hodnota: cisla[p] } : { id: p })),
        delka,
        castost,
      )
      setPosledni(Date.now())
      setStav({ chyba: false, text: t.ulozeno })
    } catch (e) {
      setStav({ chyba: true, text: chybaText(e, t.chybiKontext) })
    } finally {
      setUkladam(false)
    }
  }

  const datum = (ms: number) =>
    new Date(ms).toLocaleDateString(lang === "en" ? "en-GB" : lang === "sk" ? "sk-SK" : "cs-CZ", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })

  return (
    <section className="diag-no-print mt-10">
      <div className="diag-card p-6">
        <h2 className="text-[17px] font-bold tracking-tight">{t.titul}</h2>
        <p className="mt-1 text-[13.5px] leading-relaxed text-[var(--wm-text-2)]">{t.uvod}</p>
        <p className="mt-2 text-[13.5px] font-medium leading-relaxed text-[var(--wm-text)]">{t.obdobi}</p>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <Vyber
            otazka={t.delkaOtazka}
            moznosti={DELKA_VEDENI.map((k) => ({ k, popis: t.delka[k] }))}
            hodnota={delka}
            onChange={(k) => {
              setDelka(k as DelkaVedeni)
              setStav(null)
            }}
          />
          <Vyber
            otazka={t.castostOtazka}
            moznosti={CASTOST_POZOROVANI.map((k) => ({ k, popis: t.castost[k] }))}
            hodnota={castost}
            onChange={(k) => {
              setCastost(k as CastostPozorovani)
              setStav(null)
            }}
          />
        </div>

        <div className="mt-6 flex flex-col divide-y divide-[var(--wm-border-light)]">
          {POLOZKY_HODNOCENI.map((p) => {
            const pt = t.polozky[p]
            const v = volby[p]
            return (
              <div key={p} className="py-4 first:pt-0" role="radiogroup" aria-label={pt.otazka}>
                <p className="text-[14.5px] font-semibold">{pt.otazka}</p>
                <div className="mt-1.5 grid grid-cols-2 gap-4 text-[12.5px] leading-snug text-[var(--wm-text-3)]">
                  <span>
                    <span className="font-semibold tabular-nums text-[var(--wm-text-2)]">{HODNOTA_MIN}</span> {pt.nizko}
                  </span>
                  <span className="text-right">
                    {pt.vysoko} <span className="font-semibold tabular-nums text-[var(--wm-text-2)]">{HODNOTA_MAX}</span>
                  </span>
                </div>
                <div className="mt-2.5 flex flex-wrap items-center gap-2">
                  <div className="flex min-w-[15rem] flex-1 gap-1.5">
                    {STUPNE.map((n) => (
                      <button
                        key={n}
                        type="button"
                        role="radio"
                        aria-checked={v === n}
                        aria-label={String(n)}
                        onClick={() => nastav(p, v === n ? undefined : n)}
                        className={`diag-press h-9 min-w-0 flex-1 rounded-lg border text-[14px] font-semibold tabular-nums transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--wm-blue)] ${
                          v === n
                            ? "border-[var(--wm-brand)] bg-[var(--wm-brand)] text-[var(--wm-brand-fg)]"
                            : "border-[var(--wm-border)] bg-[var(--wm-surface)] text-[var(--wm-text-2)] hover:bg-[var(--wm-fill-4)]"
                        }`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    role="radio"
                    aria-checked={v === null}
                    onClick={() => nastav(p, v === null ? undefined : null)}
                    className={`diag-press h-9 shrink-0 rounded-lg border px-3 text-[12.5px] font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--wm-blue)] ${
                      v === null
                        ? "border-[var(--wm-text-2)] bg-[var(--wm-fill-4)] text-[var(--wm-text)]"
                        : "border-[var(--wm-border)] bg-[var(--wm-surface)] text-[var(--wm-text-3)] hover:bg-[var(--wm-fill-4)]"
                    }`}
                  >
                    {t.nemohu}
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => void uloz()}
            disabled={ukladam}
            className="diag-press inline-flex h-9 items-center rounded-full bg-[var(--wm-brand)] px-4 text-[13px] font-semibold text-[var(--wm-brand-fg)] transition-opacity hover:opacity-85 disabled:opacity-40"
          >
            {ukladam ? t.ukladam : t.ulozit}
          </button>
          {stav && (
            <span
              role="status"
              className={`text-[13px] ${stav.chyba ? "text-[var(--wm-red)]" : "text-[var(--wm-green)]"}`}
            >
              {stav.text}
            </span>
          )}
        </div>
        {posledni !== null && (
          <p className="mt-3 text-[12.5px] text-[var(--wm-text-3)]">{t.posledni(datum(posledni))}</p>
        )}

        <p className="mt-5 rounded-xl bg-[var(--wm-surface-2)] p-4 text-[13px] leading-relaxed text-[var(--wm-text-2)]">
          {t.soukromi}
        </p>
      </div>
    </section>
  )
}

function Vyber({
  otazka,
  moznosti,
  hodnota,
  onChange,
}: {
  otazka: string
  moznosti: { k: string; popis: string }[]
  hodnota: string
  onChange: (k: string) => void
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[13px] font-medium text-[var(--wm-text-2)]">{otazka}</span>
      <select className="diag-input w-full" value={hodnota} onChange={(e) => onChange(e.target.value)}>
        <option value="" disabled>
          –
        </option>
        {moznosti.map((m) => (
          <option key={m.k} value={m.k}>
            {m.popis}
          </option>
        ))}
      </select>
    </label>
  )
}
