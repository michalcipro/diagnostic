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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="cs">
      <body suppressHydrationWarning>
        <div className="diag-root">{children}</div>
      </body>
    </html>
  )
}
