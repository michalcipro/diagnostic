// Jak se hotové PDF dostane z prohlížeče k uživateli: stažením, sdílením,
// nebo rovnou na tiskárnu.
//
// Tlačítko Tisk dřív tisklo obrazovku. Teď tiskne stejné PDF, jaké dává
// tlačítko PDF, takže papír a soubor jsou jeden a tentýž dokument.

/** Předá hotové PDF uživateli: na iOS přes systémové sdílení, jinde stažením. */
export async function stahni(blob: Blob, nazev: string): Promise<void> {
  const soubor = new File([blob], nazev, { type: "application/pdf" })

  // iPhone i iPad: systémové sdílení se souborem.
  if (typeof navigator.canShare === "function" && navigator.canShare({ files: [soubor] })) {
    try {
      await navigator.share({ files: [soubor], title: nazev })
      return
    } catch (e) {
      // Uživatel sdílení zavřel – pak už nic dalšího nedělej.
      if (e instanceof DOMException && e.name === "AbortError") return
    }
  }

  // Ostatní prohlížeče: stažení souboru.
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = nazev
  a.click()
  // Odvolání až po chvíli, jinak stahování v Safari nestihne začít.
  window.setTimeout(() => URL.revokeObjectURL(url), 10_000)
}

export type ZpusobTisku = "ram" | "okno" | "sdileni"

/**
 * Jak v tomhle prohlížeči vytisknout PDF.
 *
 * Chrome a Edge vytisknou PDF ze skrytého rámu a tiskový dialog se otevře
 * rovnou nad stránkou. Safari a Firefox to spolehlivě neumějí, takže se jim
 * PDF otevře v nové kartě a tiskne se odtamtud. Telefon a tablet tisk
 * z prohlížeče nemají; tam vede cesta přes systémové sdílení, kde je Tisk
 * i Uložit do souborů.
 */
export function zpusobTisku(): ZpusobTisku {
  const ua = navigator.userAgent
  const dotykovyMac = navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1
  if (/iPad|iPhone|iPod|Android/i.test(ua) || dotykovyMac) return "sdileni"
  const chromium = /Chrome\/|Chromium\/|Edg\//.test(ua) && !/Firefox\//.test(ua)
  return chromium ? "ram" : "okno"
}

/**
 * Prázdná karta pro tisk v Safari a Firefoxu.
 *
 * Musí se otevřít hned při kliknutí. PDF se skládá až potom a karta otevřená
 * o chvíli později by narazila na blokování vyskakovacích oken.
 */
export function otevriKartuProTisk(zpusob: ZpusobTisku): Window | null {
  if (zpusob !== "okno") return null
  const okno = window.open("", "_blank")
  if (okno) {
    okno.document.title = "PDF"
    okno.document.body.style.font = "15px -apple-system, system-ui, sans-serif"
    okno.document.body.style.padding = "24px"
    okno.document.body.textContent = "Připravuji PDF…"
  }
  return okno
}

/** Vytiskne hotové PDF způsobem, který daný prohlížeč zvládá. */
export async function vytiskni(blob: Blob, nazev: string, zpusob: ZpusobTisku, okno: Window | null): Promise<void> {
  if (zpusob === "sdileni") return stahni(blob, nazev)

  const url = URL.createObjectURL(blob)
  const uklid = (co?: () => void) =>
    window.setTimeout(() => {
      co?.()
      URL.revokeObjectURL(url)
    }, 5 * 60_000)

  if (zpusob === "okno") {
    if (okno && !okno.closed) {
      okno.location.href = url
      uklid()
      return
    }
    // Karta se neotevřela (blokování oken): aspoň stáhnout.
    URL.revokeObjectURL(url)
    return stahni(blob, nazev)
  }

  const ram = document.createElement("iframe")
  ram.setAttribute("aria-hidden", "true")
  ram.tabIndex = -1
  ram.style.cssText = "position:fixed;right:0;bottom:0;width:1px;height:1px;border:0;opacity:0;pointer-events:none"
  ram.onload = () => {
    // Prohlížeč PDF v rámu potřebuje chvilku, než je připravený k tisku.
    window.setTimeout(() => {
      try {
        ram.contentWindow?.focus()
        ram.contentWindow?.print()
      } catch {
        window.open(url, "_blank")
      }
    }, 100)
  }
  ram.src = url
  document.body.appendChild(ram)
  uklid(() => ram.remove())
}
