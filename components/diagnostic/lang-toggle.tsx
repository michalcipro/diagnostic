"use client"

import { JAZYKY } from "@/lib/diagnostic/lang"
import type { Lang } from "@/lib/diagnostic/types"

/** Krátké názvy, ať se přepínač vejde i vedle ostatních tlačítek. */
const NAZVY: Record<Lang, string> = { cs: "Čeština", en: "English", sk: "Slovenčina" }

export function LangToggle({
  lang,
  onChange,
  className,
}: {
  lang: Lang
  onChange: (lang: Lang) => void
  className?: string
}) {
  return (
    <div className={`diag-segment ${className ?? ""}`} role="tablist" aria-label="Language">
      {JAZYKY.map((l) => (
        <button
          key={l}
          type="button"
          role="tab"
          aria-selected={lang === l}
          data-active={lang === l}
          onClick={() => onChange(l)}
        >
          {NAZVY[l]}
        </button>
      ))}
    </div>
  )
}
