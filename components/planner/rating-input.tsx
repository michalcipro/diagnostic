"use client"

import { useState } from "react"
import type { Lang } from "@/lib/diagnostic/types"
import { cislo, parsujCislo } from "@/lib/planner/i18n"
import type { RozsahMetriky } from "@/lib/planner/types"

// Pole pro jedno denní hodnocení.
//
// Vypadá to na jeden input, ale jsou v něm tři věci, na kterých se dá
// pohodlné vyplňování pokazit:
//
// 1. Není to `type="number"`. Kolečko myši nad zaostřeným číselníkem mění
//    hodnotu, a protože se týdenní mřížkou pořád roluje, přepisovala by se
//    čísla omylem. Číselník navíc zahodí desetinnou čárku, kterou Čech píše.
//
// 2. Rozepsaný text si pole drží samo. Kdyby se zobrazovala jen uložená
//    hodnota, po napsání „7" by se z ní hned stalo „7,0" a „7,5" by nešlo
//    dopsat.
//
// 3. Hodnota mimo rozsah se neuloží ani neořízne. Oříznutí na kraj by tiše
//    přepsalo překlep na číslo, které klient nenapsal; takhle zůstane
//    v poli, dokud ho neopraví, a po opuštění se vrátí poslední platná.

export interface RatingInputProps {
  hodnota: number | undefined
  rozsah: RozsahMetriky
  lang: Lang
  popis: string
  /** null znamená smazání hodnoty */
  onZmena: (v: number | null) => void
  onFlush: () => void
  trida: string
  placeholder?: string
}

export function RatingInput({
  hodnota,
  rozsah,
  lang,
  popis,
  onZmena,
  onFlush,
  trida,
  placeholder,
}: RatingInputProps) {
  const [koncept, setKoncept] = useState<string | null>(null)
  const desetin = rozsah.hodiny ? 1 : 0
  const ulozene = typeof hodnota === "number" ? cislo(hodnota, lang, desetin) : ""

  return (
    <input
      className={trida}
      type="text"
      inputMode="decimal"
      autoComplete="off"
      placeholder={placeholder}
      value={koncept ?? ulozene}
      onChange={(e) => {
        const raw = e.target.value
        setKoncept(raw)
        if (!raw.trim()) {
          onZmena(null)
          return
        }
        const n = parsujCislo(raw)
        if (n === null || n < rozsah.min || n > rozsah.max) return
        onZmena(n)
      }}
      onFocus={(e) => e.currentTarget.select()}
      onBlur={() => {
        // Po opuštění se pole srovná do jednotného tvaru a nedopsaný nesmysl
        // zmizí ve prospěch poslední uložené hodnoty.
        setKoncept(null)
        onFlush()
      }}
      aria-label={popis}
    />
  )
}
