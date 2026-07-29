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
  // Pruh patří k řádku nad sebou, proto je nad ním míň místa než pod ním.
  // Když je mezera stejná, čte se pruh jako podtržení textu, který následuje.
  return (
    <div className={compact ? "pb-4 pt-1" : "pb-6 pt-2"}>
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <span
          className={
            compact
              ? "min-w-0 truncate text-[13.5px] text-[var(--wm-text-2)]"
              : "min-w-0 truncate text-[15px] font-semibold"
          }
          title={label}
        >
          {label}
        </span>
        <span className="flex shrink-0 items-center gap-2.5 whitespace-nowrap">
          <span
            className={`tabular-nums ${
              compact
                ? "text-[13px] font-medium text-[var(--wm-text-2)]"
                : "text-[14px] font-bold text-[var(--wm-text)]"
            }`}
          >
            {raw}
            <span className="font-normal text-[var(--wm-text-3)]">/{max}</span>
          </span>
          <BandChip band={band} lang={lang} />
        </span>
      </div>
      <ScoreBar percent={percent} band={band} />
    </div>
  )
}
