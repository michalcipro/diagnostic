import type { Metadata } from "next"
import "./globals.css"
import "./diagnostic.css"

export const metadata: Metadata = {
  title: {
    default: "Performance Diagnostic ELITE™",
    template: "%s | Winning Minds",
  },
  description: "Komplexní psychodiagnostika mentálního výkonového profilu – Winning Minds.",
  robots: { index: false },
}

/**
 * Stránky se vykreslují na každý požadavek, ne dopředu do statického HTML.
 *
 * Vynucuje si to Content-Security-Policy s nonce (viz middleware.ts): nonce je
 * pro každý požadavek jiný a do předgenerovaného HTML ho vložit nelze. Bez
 * toho by CSP s `strict-dynamic` zablokovala vlastní skripty aplikace.
 * Aplikace je celá klientská a data si stahuje z Convexu, takže se tím
 * nepřenáší žádná práce navíc, jen se HTML skládá až při požadavku.
 */
export const dynamic = "force-dynamic"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="cs">
      <body suppressHydrationWarning>
        <div className="diag-root">{children}</div>
      </body>
    </html>
  )
}
