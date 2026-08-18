/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // `next dev` jinak dopisuje do CLAUDE.md vlastní blok s dlouhou pomlčkou,
  // kterou v textech projektu nepoužíváme, a dělá to při každém spuštění
  // znovu. CLAUDE.md si píšeme sami.
  agentRules: false,
  async headers() {
    // Bezpečnostní hlavičky, které nezávisí na požadavku. Content-Security-Policy
    // mezi ně nepatří: potřebuje nonce pro každý požadavek zvlášť a nastavuje
    // ji middleware.ts.
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          // Prohlížeč si zapamatuje, že sem chodí výhradně přes HTTPS, takže
          // ani první požadavek nejde nešifrovaně.
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
      },
      {
        // Odkaz na dotazník i sekce kouče nemají co dělat ve vyhledávačích.
        // Token v adrese se do indexu dostat nesmí.
        source: "/(t|kouc|setup)/:cesta*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" }],
      },
    ]
  },
}

module.exports = nextConfig
