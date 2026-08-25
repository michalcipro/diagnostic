"use client"

import { useState } from "react"
import { HRAC, type HracVyhodnoceni } from "@/lib/tym/hrac"
import type { BandKey } from "@/lib/diagnostic/types"

// Vyhodnocení, které si hráč přečte hned po odeslání.
//
// Je psané jemu, ne kouči: bez odborných slov a bez úkolů. Hráč, který se
// rozhodl výsledky nesdílet, u toho žádného kouče nemá, takže by seznam
// doporučení neměl komu předat a jen by z toho měl špatný pocit. Cílem je,
// aby si odnesl obrázek.
//
// Text sestavil server. Tady se jen vykresluje; klíče, kterými se z odpovědí
// stal, v prohlížeči nejsou.

const BARVA: Record<BandKey, string> = {
  priority: "var(--wm-orange)",
  stabilization: "var(--wm-gray)",
  strong: "var(--wm-blue)",
  elite: "var(--wm-green)",
}

export function HracReport({
  data,
  lang,
  sdileno,
}: {
  data: HracVyhodnoceni
  lang: "cs" | "en"
  sdileno: boolean
}) {
  const t = HRAC[lang]
  const [stahuje, setStahuje] = useState(false)
  const podleId = new Map(data.oblasti.map((o) => [o.id, o]))

  const stahni = async () => {
    setStahuje(true)
    try {
      const { buildHracPdf, hracPdfFileName } = await import("@/lib/tym/pdf-hrace")
      const blob = buildHracPdf(data, lang)
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = hracPdfFileName(data, lang)
      a.click()
      window.setTimeout(() => URL.revokeObjectURL(url), 10_000)
    } finally {
      setStahuje(false)
    }
  }

  return (
    <div className="mt-8">
      <section className="diag-card p-6 text-center sm:p-8">
        <div
          className="mx-auto flex h-14 w-14 items-center justify-center rounded-full"
          style={{ background: "var(--wm-green-light)" }}
          aria-hidden="true"
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--wm-green)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </div>
        <h2 className="mt-5 text-[22px] font-bold tracking-tight">{t.hotovo}</h2>
        <p className="mx-auto mt-3 max-w-lg text-[15px] leading-relaxed text-[var(--wm-text-2)]">
          {sdileno ? t.hotovoPopis : t.nesdilenoPopis}
        </p>
        <button
          type="button"
          onClick={() => void stahni()}
          disabled={stahuje}
          className="diag-press mt-6 inline-flex h-11 items-center rounded-full bg-[var(--wm-brand)] px-7 text-[15px] font-semibold text-[var(--wm-brand-fg)] disabled:opacity-50"
        >
          {stahuje ? "…" : t.stahnout}
        </button>
      </section>

      <header className="mt-10">
        <div className="h-[3px] w-[52px] rounded-full bg-[var(--wm-blue)]" />
        <h1 className="mt-4 text-[28px] font-bold leading-tight tracking-tight">{t.titul}</h1>
        <p className="mt-3 max-w-[44rem] text-[15px] leading-relaxed text-[var(--wm-text-2)]">
          {t.podtitul}
        </p>
      </header>

      {data.varovani && (
        <p className="mt-5 rounded-2xl border-l-[3px] border-[var(--wm-orange)] bg-[var(--wm-orange-light)] p-4 text-[14px] leading-relaxed text-[var(--wm-caution-fg)]">
          {data.varovani}
        </p>
      )}

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Vypich titul={t.nejsilnejsiTitul} ids={data.nejsilnejsi} podleId={podleId} barva="var(--wm-green)" />
        <Vypich titul={t.kProciTitul} ids={data.kProci} podleId={podleId} barva="var(--wm-orange)" />
      </div>

      <section className="mt-10">
        <h2 className="mb-4 border-t-2 border-[var(--wm-brand)] pt-4 text-[20px] font-bold tracking-tight">
          {t.oblastiTitul}
        </h2>
        <div className="space-y-4">
          {data.oblasti.map((o) => (
            <article key={o.id} className="diag-card p-5">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="text-[16px] font-bold tracking-tight">{o.nazev}</h3>
                <span
                  className="rounded-full px-2.5 py-0.5 text-[11.5px] font-bold uppercase tracking-wider"
                  style={{ background: "var(--wm-fill-4)", color: BARVA[o.band] }}
                >
                  {t.pasma[o.band]}
                </span>
              </div>
              <div className="mt-3 h-[6px] w-full overflow-hidden rounded-full bg-[var(--wm-track)]">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${Math.max(2, Math.min(100, o.percent))}%`, background: BARVA[o.band] }}
                />
              </div>
              <p className="mt-3 text-[13.5px] leading-relaxed text-[var(--wm-text-3)]">{o.uvod}</p>
              <p className="mt-2.5 text-[14.5px] leading-relaxed text-[var(--wm-text-2)]">{o.vyklad}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="mb-4 border-t-2 border-[var(--wm-brand)] pt-4 text-[20px] font-bold tracking-tight">
          {t.shrnutiTitul}
        </h2>
        <div className="diag-card p-6 sm:p-7">
          {data.shrnuti.map((odstavec, i) => (
            <p key={i} className="mb-3 text-[15px] leading-relaxed last:mb-0">
              {odstavec}
            </p>
          ))}
        </div>
      </section>
    </div>
  )
}

function Vypich({
  titul,
  ids,
  podleId,
  barva,
}: {
  titul: string
  ids: string[]
  podleId: Map<string, HracVyhodnoceni["oblasti"][number]>
  barva: string
}) {
  return (
    <div className="diag-card p-5">
      <div className="h-[3px] w-9 rounded-full" style={{ background: barva }} />
      <h3 className="mt-3 text-[15px] font-bold tracking-tight">{titul}</h3>
      <ul className="mt-3 space-y-1.5">
        {ids.map((id) => (
          <li key={id} className="text-[14.5px] font-semibold leading-snug">
            {podleId.get(id)?.nazev ?? id}
          </li>
        ))}
      </ul>
    </div>
  )
}
