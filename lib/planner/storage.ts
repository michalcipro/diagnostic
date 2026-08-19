import type { Lang } from "@/lib/diagnostic/types"
import { JAZYKY } from "@/lib/diagnostic/lang"

// Co si plánovač drží v prohlížeči.
//
// Jen relace a zvolený jazyk. Obsah deníku se lokálně neukládá schválně:
// zápisky jsou osobní a na sdíleném počítači by po odhlášení zůstaly v
// localStorage komukoli, kdo se k prohlížeči dostane. Autosave běží proti
// serveru, takže se stejně nic neztratí.

const SESSION_KEY = "wm-planner:session"
const LANG_KEY = "wm-planner:lang"

export function nactiRelaci(): string | null {
  if (typeof window === "undefined") return null
  try {
    return window.localStorage.getItem(SESSION_KEY)
  } catch {
    return null
  }
}

export function ulozRelaci(token: string): void {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(SESSION_KEY, token)
  } catch {
    // Soukromý režim může úložiště zakázat. Aplikace pak funguje do zavření
    // karty, což je pořád lepší než hláška, se kterou uživatel nic neudělá.
  }
}

export function zapomenRelaci(): void {
  if (typeof window === "undefined") return
  try {
    window.localStorage.removeItem(SESSION_KEY)
  } catch {
    // ignorovat
  }
}

export function nactiJazyk(): Lang | null {
  if (typeof window === "undefined") return null
  try {
    const j = window.localStorage.getItem(LANG_KEY)
    return j && (JAZYKY as string[]).includes(j) ? (j as Lang) : null
  } catch {
    return null
  }
}

export function ulozJazyk(lang: Lang): void {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(LANG_KEY, lang)
  } catch {
    // ignorovat
  }
}
