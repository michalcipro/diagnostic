"use client"

import { BAND_LABELS } from "@/lib/diagnostic/i18n"
import type { BandKey, Lang } from "@/lib/diagnostic/types"

export function BandChip({ band, lang }: { band: BandKey; lang: Lang }) {
  return (
    <span className={`diag-band-${band}`}>
      <span className="diag-chip">{BAND_LABELS[lang][band]}</span>
    </span>
  )
}

export function ScoreBar({ percent, band }: { percent: number; band: BandKey }) {
  return (
    <div className={`diag-band-${band}`}>
      <div className="diag-bar-track">
        <div className="diag-bar-fill" style={{ width: `${Math.max(2, percent)}%` }} />
      </div>
    </div>
  )
}

export function ScoreRow({
  label,
  raw,
  min,
  max,
  percent,
  band,
  lang,
  compact,
}: {
  label: string
  raw: number
  min: number
  max: number
  percent: number
  band: BandKey
  lang: Lang
  compact?: boolean
}) {
  return (
    <div className={compact ? "py-2" : "py-3"}>
      <div className="mb-1.5 flex items-baseline justify-between gap-3">
        <span className={compact ? "text-[13px] text-[var(--wm-text-2)]" : "text-[15px] font-medium"}>{label}</span>
        <span className="flex items-center gap-2 whitespace-nowrap">
          <span className={compact ? "text-[12px] text-[var(--wm-text-3)]" : "text-[13px] text-[var(--wm-text-2)]"}>
            {raw} / {max}
          </span>
          <BandChip band={band} lang={lang} />
        </span>
      </div>
      <ScoreBar percent={percent} band={band} />
    </div>
  )
}
