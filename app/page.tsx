import Link from "next/link"

// Veřejná úvodní stránka. Záměrně nevypisuje žádné testy ani na ně neodkazuje —
// dotazník se otevírá jen na pozvánku od kouče (/t/<token>). Přehled testů
// a tvorba pozvánek jsou v chráněné sekci /kouc.
export default function Home() {
  return (
    <div className="diag-container flex min-h-screen flex-col items-center justify-center py-20 text-center">
      <p className="text-[13px] font-bold tracking-[0.18em] text-[var(--wm-text)]">WINNING MINDS</p>
      <h1 className="mt-4 text-[32px] font-bold leading-tight tracking-tight">
        Performance Diagnostic ELITE™
      </h1>
      <p className="mt-3 max-w-md text-[16px] leading-relaxed text-[var(--wm-text-2)]">
        Komplexní psychodiagnostika mentálního výkonového profilu. Diagnostika probíhá na základě
        pozvánky — odkaz na svůj dotazník dostaneš od svého kouče.
      </p>
      <p className="mt-4 max-w-md border-t border-[var(--wm-border-light)] pt-4 text-[14px] leading-relaxed text-[var(--wm-text-3)]">
        Assessment is by invitation only. You will receive a personal link to your questionnaire
        from your coach.
      </p>

      <Link
        href="/kouc"
        className="mt-10 text-[13px] font-semibold text-[var(--wm-text-3)] transition-colors hover:text-[var(--wm-text)]"
      >
        Přihlášení pro kouče
      </Link>

      <footer className="mt-16 text-[12px] text-[var(--wm-text-3)]">
        Winning Minds s.r.o. · Praha 6 · winningminds.cz · Důvěrný dokument
      </footer>
    </div>
  )
}
