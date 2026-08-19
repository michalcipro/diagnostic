"use client"

import { useCallback, useLayoutEffect, useRef } from "react"

// Textové pole, které se roztáhne podle obsahu.
//
// Pevný počet řádků tady nefunguje. „Klidné ráno bez telefonu" se do dvou
// řádků vejde na širokém monitoru, ale ne na notebooku a už vůbec ne na
// telefonu, a co se nevejde, to prohlížeč prostě uřízne. Klient pak vidí
// vlastní větu bez konce a nemá jak poznat, že tam ještě něco je.
//
// V mřížce to má i druhý účinek: buňky jednoho řádku tabulky se vždycky
// srovnají na výšku té nejvyšší, takže se řádek roztáhne podle nejdelšího
// zápisu a všechny dny zůstanou zarovnané.

export interface AutoTextareaProps {
  value: string
  onChange: (v: string) => void
  onBlur?: () => void
  className?: string
  ariaLabel: string
  /** nejmenší výška v řádcích, aby prázdné pole nebylo proužek */
  minRows?: number
  style?: React.CSSProperties
  placeholder?: string
}

export function AutoTextarea({
  value,
  onChange,
  onBlur,
  className,
  ariaLabel,
  minRows = 2,
  style,
  placeholder,
}: AutoTextareaProps) {
  const ref = useRef<HTMLTextAreaElement | null>(null)

  const dorovnej = useCallback(() => {
    const el = ref.current
    if (!el) return
    // Nejdřív srazit na nulu, jinak by se výška uměla jen zvětšovat: scrollHeight
    // vrací výšku obsahu včetně už nastavené výšky pole.
    el.style.height = "auto"
    el.style.height = `${el.scrollHeight}px`
  }, [])

  // useLayoutEffect, ne useEffect: výška se musí srovnat ještě před vykreslením,
  // jinak by při každém přepnutí týdne poskočila.
  useLayoutEffect(() => {
    dorovnej()
  }, [dorovnej, value])

  // Změna šířky okna mění zalomení, a tedy i potřebnou výšku.
  useLayoutEffect(() => {
    const el = ref.current
    if (!el || typeof ResizeObserver === "undefined") return
    const pozorovatel = new ResizeObserver(() => dorovnej())
    pozorovatel.observe(el)
    return () => pozorovatel.disconnect()
  }, [dorovnej])

  return (
    <textarea
      ref={ref}
      className={className}
      rows={minRows}
      value={value}
      placeholder={placeholder}
      aria-label={ariaLabel}
      onChange={(e) => {
        onChange(e.target.value)
        dorovnej()
      }}
      onBlur={onBlur}
      style={{ overflow: "hidden", resize: "none", ...style }}
    />
  )
}
