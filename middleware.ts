import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Content Security Policy s nonce.
//
// Dřív stálo v hlavičkách `script-src 'self' 'unsafe-inline' 'unsafe-eval'`,
// což je nejpohodlnější a zároveň zahazuje většinu ochrany, kterou CSP proti
// XSS dává: povolený inline skript je přesně to, co útočník potřebuje. Relace
// kouče přitom leží v localStorage, takže jediné XSS by znamenalo přístup ke
// všem klientským profilům.
//
// Nonce se generuje pro každý požadavek zvlášť. Next.js ho čte z hlavičky CSP
// a sám ho doplní do svých inline skriptů, takže se nemusí nic označovat ručně.
// `strict-dynamic` pak dovolí skriptům, které Next načte, natáhnout další
// části aplikace, aniž by se musely vypisovat zdroje.
//
// Hlavičky, které nezávisí na požadavku (HSTS, X-Frame-Options a spol.),
// zůstávají v next.config.js.

export function middleware(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64")

  const csp = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https: 'unsafe-inline'`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self' data:",
    "connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests",
  ].join("; ")

  // Nonce se posílá i v požadavku, aby ho Next.js viděl při vykreslování.
  const hlavicky = new Headers(request.headers)
  hlavicky.set("x-nonce", nonce)
  hlavicky.set("Content-Security-Policy", csp)

  const odpoved = NextResponse.next({ request: { headers: hlavicky } })
  odpoved.headers.set("Content-Security-Policy", csp)
  return odpoved
}

export const config = {
  matcher: [
    /*
     * Všechny cesty kromě statických souborů a obrázků: ty CSP nepotřebují
     * a middleware by je jen zdržoval.
     */
    {
      source: "/((?!_next/static|_next/image|favicon.ico).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
}
