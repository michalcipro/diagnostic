"use client"

import type { Lang } from "@/lib/diagnostic/types"

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
      {(["cs", "en"] as Lang[]).map((l) => (
        <button
          key={l}
          type="button"
          role="tab"
          aria-selected={lang === l}
          data-active={lang === l}
          onClick={() => onChange(l)}
        >
          {l === "cs" ? "Čeština" : "English"}
        </button>
      ))}
    </div>
  )
}
