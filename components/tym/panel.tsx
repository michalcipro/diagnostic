"use client"

import { useCallback, useEffect, useState } from "react"
import { TymReport } from "@/components/tym/report"
import {
  chybaText,
  createPlayerInvite,
  createTeam,
  listPlayers,
  listTeams,
  mojeTymy,
  setTeamActive,
  teamReport,
  type CoachRow,
  type MujTym,
  type PlayerRow,
  type TeamReport,
  type TeamRow,
} from "@/lib/diagnostic/remote"
import type { TymLang } from "@/lib/tym/obsah"
import { NAZEV_TYMOVEHO_TESTU } from "@/lib/diagnostic/nazvy"

// Správa týmů.
//
// Dvě strany téže věci. Master zakládá týmy, přiřazuje k nim externí kouče
// a čte souhrnné profily; do vyplnění jednotlivých hráčů nevidí, takže tady
// žádné jméno hráče nenajdeš. Klubový kouč spravuje soupisku, rozesílá odkazy
// a vidí vyhodnocení těch hráčů, kteří mu je zpřístupnili.

const odkazHrace = (token: string) =>
  typeof window === "undefined" ? "" : `${window.location.origin}/t/${token}`

function datum(ms: number): string {
  const d = new Date(ms)
  return `${d.getDate()}. ${d.getMonth() + 1}. ${d.getFullYear()}`
}

// ---------------------------------------------------------------------------
// Master
// ---------------------------------------------------------------------------

export function TymyMaster({
  sessionToken,
  kouci,
  lang,
}: {
  sessionToken: string
  /** účty, ze kterých jde vybrat vedoucího týmu; tým vede vždy externí kouč */
  kouci: CoachRow[]
  lang: TymLang
}) {
  const [tymy, setTymy] = useState<TeamRow[] | null>(null)
  const [chyba, setChyba] = useState<string | null>(null)
  const [otevreny, setOtevreny] = useState<string | null>(null)
  const [formular, setFormular] = useState(false)
  const [nazev, setNazev] = useState("")
  const [coachId, setCoachId] = useState("")
  const [note, setNote] = useState("")
  const [zaklada, setZaklada] = useState(false)

  const nacti = useCallback(async () => {
    try {
      setTymy(await listTeams(sessionToken))
    } catch (e) {
      setChyba(chybaText(e, "Týmy se nepodařilo načíst."))
    }
  }, [sessionToken])

  useEffect(() => {
    void nacti()
  }, [nacti])

  const externi = kouci.filter((c) => c.role === "external" && c.active)

  const zaloz = async (e: React.FormEvent) => {
    e.preventDefault()
    setZaklada(true)
    setChyba(null)
    try {
      await createTeam(sessionToken, nazev, coachId, note || undefined)
      setNazev("")
      setNote("")
      setFormular(false)
      await nacti()
    } catch (err) {
      setChyba(chybaText(err, "Tým se nepodařilo založit."))
    } finally {
      setZaklada(false)
    }
  }

  if (otevreny) {
    return <ReportTymu sessionToken={sessionToken} teamId={otevreny} lang={lang} zpet={() => setOtevreny(null)} />
  }

  return (
    <div className="max-w-[62rem]">
      {chyba && <Chyba text={chyba} />}

      {externi.length === 0 ? (
        <div className="diag-card p-6">
          <h2 className="text-[16px] font-bold tracking-tight">Nejdřív externí kouč</h2>
          <p className="mt-2 max-w-[68ch] text-[13.5px] leading-relaxed text-[var(--wm-text-2)]">
            Tým vede vždy externí kouč: klub je cizí organizace a jeho hráči nejsou naši klienti.
            Založ ho v záložce Kouči a vrať se sem.
          </p>
        </div>
      ) : !formular ? (
        <button
          type="button"
          onClick={() => {
            setFormular(true)
            setCoachId(externi[0].id)
          }}
          className="diag-press mb-5 rounded-full bg-[var(--wm-brand)] px-5 py-2 text-[13px] font-semibold text-[var(--wm-brand-fg)]"
        >
          + Založit tým
        </button>
      ) : (
        <form onSubmit={zaloz} className="diag-card mb-6 p-6">
          <h2 className="text-[16px] font-semibold">Nový tým</h2>
          <p className="mt-1 max-w-[68ch] text-[13px] leading-relaxed text-[var(--wm-text-2)]">
            Kouč pak hráčům rozešle odkazy pod označením, které si sám zvolí. Do vyplnění
            jednotlivých hráčů neuvidíš ani ty; z týmu uvidíš název, počty a souhrnný profil.
          </p>

          <label className="mt-4 block">
            <span className="mb-1.5 block text-[13px] font-medium text-[var(--wm-text-2)]">Název týmu</span>
            <input
              className="diag-input w-full"
              value={nazev}
              onChange={(e) => setNazev(e.target.value)}
              placeholder="FC Rangers U19"
              required
            />
          </label>

          <label className="mt-3 block">
            <span className="mb-1.5 block text-[13px] font-medium text-[var(--wm-text-2)]">Kouč týmu</span>
            <select className="diag-input w-full" value={coachId} onChange={(e) => setCoachId(e.target.value)}>
              {externi.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} · {c.email}
                </option>
              ))}
            </select>
          </label>

          <label className="mt-3 block">
            <span className="mb-1.5 block text-[13px] font-medium text-[var(--wm-text-2)]">Poznámka</span>
            <input
              className="diag-input w-full"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="smluvní podmínky, kontakt"
            />
          </label>

          <div className="mt-4 flex gap-2">
            <button
              type="submit"
              disabled={zaklada}
              className="diag-press rounded-full bg-[var(--wm-brand)] px-5 py-2 text-[13px] font-semibold text-[var(--wm-brand-fg)] disabled:opacity-50"
            >
              {zaklada ? "Zakládám…" : "Založit"}
            </button>
            <button
              type="button"
              onClick={() => setFormular(false)}
              className="rounded-full px-5 py-2 text-[13px] font-semibold text-[var(--wm-text-2)]"
            >
              Zrušit
            </button>
          </div>
        </form>
      )}

      {tymy === null ? (
        <p className="text-[14px] text-[var(--wm-text-3)]">Načítám…</p>
      ) : tymy.length === 0 ? (
        <p className="text-[14px] text-[var(--wm-text-2)]">Zatím žádný tým.</p>
      ) : (
        <div className="space-y-3">
          {tymy.map((t) => (
            <article key={t.id} className="diag-card p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <h3 className="flex flex-wrap items-center gap-2 text-[17px] font-bold tracking-tight">
                    {t.nazev}
                    {!t.active && (
                      <span className="rounded-full bg-[var(--wm-red-light)] px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-[var(--wm-invalid-fg)]">
                        vypnutý
                      </span>
                    )}
                  </h3>
                  <p className="mt-0.5 text-[13px] text-[var(--wm-text-2)]">
                    {t.coachName} · založen {datum(t.createdAt)}
                  </p>
                  {t.note && <p className="mt-2 text-[13px] text-[var(--wm-text-3)]">{t.note}</p>}
                </div>
                <div className="text-right">
                  <div className="text-[24px] font-bold leading-none tabular-nums">
                    {t.odevzdano}
                    <span className="text-[15px] font-semibold text-[var(--wm-text-3)]">/{t.pozvano}</span>
                  </div>
                  <div className="mt-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--wm-text-3)]">
                    odevzdáno
                  </div>
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  onClick={() => setOtevreny(t.id)}
                  disabled={t.odevzdano === 0}
                  className="diag-press rounded-full bg-[var(--wm-brand)] px-4 py-1.5 text-[12.5px] font-semibold text-[var(--wm-brand-fg)] disabled:opacity-40"
                >
                  Profil týmu
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    await setTeamActive(sessionToken, t.id, !t.active)
                    await nacti()
                  }}
                  className="rounded-full border border-[var(--wm-border)] px-4 py-1.5 text-[12.5px] font-semibold text-[var(--wm-text-2)]"
                >
                  {t.active ? "Vypnout" : "Zapnout"}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Klubový kouč
// ---------------------------------------------------------------------------

export function TymKouce({ sessionToken, lang }: { sessionToken: string; lang: TymLang }) {
  const [tymy, setTymy] = useState<MujTym[] | null>(null)
  const [vybrany, setVybrany] = useState<string | null>(null)
  const [hraci, setHraci] = useState<PlayerRow[] | null>(null)
  const [chyba, setChyba] = useState<string | null>(null)
  const [stitek, setStitek] = useState("")
  const [jazyk, setJazyk] = useState("en")
  const [pridava, setPridava] = useState(false)
  const [poslednOdkaz, setPosledniOdkaz] = useState<string | null>(null)
  const [zobrazReport, setZobrazReport] = useState(false)

  useEffect(() => {
    mojeTymy(sessionToken)
      .then((t) => {
        setTymy(t)
        if (t.length && !vybrany) setVybrany(t[0].id)
      })
      .catch((e) => setChyba(chybaText(e, "Týmy se nepodařilo načíst.")))
    // vybrany schválně mimo závislosti: první tým se volí jen při načtení
  }, [sessionToken]) // eslint-disable-line react-hooks/exhaustive-deps

  const nactiHrace = useCallback(async () => {
    if (!vybrany) return
    try {
      setHraci(await listPlayers(sessionToken, vybrany))
    } catch (e) {
      setChyba(chybaText(e, "Soupisku se nepodařilo načíst."))
    }
  }, [sessionToken, vybrany])

  useEffect(() => {
    void nactiHrace()
  }, [nactiHrace])

  if (chyba) return <Chyba text={chyba} />
  if (tymy === null) return <p className="text-[14px] text-[var(--wm-text-3)]">Načítám…</p>
  if (!tymy.length) {
    return (
      <div className="diag-card p-6">
        <h2 className="text-[16px] font-bold tracking-tight">Zatím nevedeš žádný tým</h2>
        <p className="mt-2 max-w-[68ch] text-[13.5px] leading-relaxed text-[var(--wm-text-2)]">
          Tým ti musí založit správce. Jakmile ho budeš mít, rozešleš hráčům odkazy.
        </p>
      </div>
    )
  }

  const tym = tymy.find((t) => t.id === vybrany)

  if (zobrazReport && vybrany) {
    return <ReportTymu sessionToken={sessionToken} teamId={vybrany} lang={lang} zpet={() => setZobrazReport(false)} />
  }

  const pridej = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!vybrany) return
    setPridava(true)
    try {
      const { token } = await createPlayerInvite(sessionToken, vybrany, stitek, jazyk)
      setPosledniOdkaz(odkazHrace(token))
      setStitek("")
      await nactiHrace()
    } catch (err) {
      setChyba(chybaText(err, "Odkaz se nepodařilo vystavit."))
    } finally {
      setPridava(false)
    }
  }

  return (
    <div className="max-w-[62rem]">
      {tymy.length > 1 && (
        <div className="diag-segment mb-5">
          {tymy.map((t) => (
            <button key={t.id} type="button" data-active={t.id === vybrany} onClick={() => setVybrany(t.id)}>
              {t.nazev}
            </button>
          ))}
        </div>
      )}

      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-[22px] font-bold tracking-tight">{tym?.nazev}</h2>
          <p className="mt-1 text-[13.5px] text-[var(--wm-text-2)]">
            Odevzdáno {tym?.odevzdano} z {tym?.pozvano} rozeslaných.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setZobrazReport(true)}
          disabled={!tym?.odevzdano}
          className="diag-press rounded-full bg-[var(--wm-brand)] px-5 py-2 text-[13px] font-semibold text-[var(--wm-brand-fg)] disabled:opacity-40"
        >
          Profil týmu
        </button>
      </header>

      <form onSubmit={pridej} className="diag-card mb-5 p-5">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-[15px] font-semibold">Přidat hráče</h3>
          <span className="rounded-full bg-[var(--wm-tint-blue)] px-2.5 py-0.5 text-[11.5px] font-bold text-[var(--wm-blue-dark)]">
            {NAZEV_TYMOVEHO_TESTU}
          </span>
        </div>
        <p className="mt-1 max-w-[68ch] text-[13px] leading-relaxed text-[var(--wm-text-2)]">
          Test se nevybírá, je vždycky týž. Označení si volíš sám, třeba Player 1 nebo číslo dresu.
          Kdo je kdo, víš jenom ty; v aplikaci to nikde není. Hráč si pak sám rozhodne, jestli
          k označení připojí svoje jméno.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <input
            className="diag-input min-w-[12rem] flex-1"
            value={stitek}
            onChange={(e) => setStitek(e.target.value)}
            placeholder="Player 1"
            required
          />
          <select className="diag-input" value={jazyk} onChange={(e) => setJazyk(e.target.value)}>
            <option value="en">English</option>
            <option value="cs">Čeština</option>
          </select>
          <button
            type="submit"
            disabled={pridava || !tym?.active}
            className="diag-press rounded-full bg-[var(--wm-brand)] px-5 py-2 text-[13px] font-semibold text-[var(--wm-brand-fg)] disabled:opacity-50"
          >
            {pridava ? "Vystavuji…" : "Vystavit odkaz"}
          </button>
        </div>
        {poslednOdkaz && <Odkaz url={poslednOdkaz} />}
      </form>

      {hraci === null ? (
        <p className="text-[14px] text-[var(--wm-text-3)]">Načítám…</p>
      ) : hraci.length === 0 ? (
        <p className="text-[14px] text-[var(--wm-text-2)]">Zatím žádný hráč.</p>
      ) : (
        <div className="diag-card overflow-hidden">
          {hraci.map((h) => (
            <div
              key={h.inviteId}
              className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--wm-border-light)] px-5 py-3.5 last:border-b-0"
            >
              <div className="min-w-0">
                <p className="text-[14.5px] font-semibold">
                  {h.stitek}
                  {h.jmeno && h.jmeno !== h.stitek && (
                    <span className="ml-2 font-normal text-[var(--wm-text-2)]">{h.jmeno}</span>
                  )}
                </p>
                <p className="mt-0.5 text-[12.5px] text-[var(--wm-text-3)]">
                  {h.odevzdanoAt ? `odevzdáno ${datum(h.odevzdanoAt)}` : `vystaveno ${datum(h.createdAt)}`}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {!h.odevzdanoAt ? (
                  <button
                    type="button"
                    onClick={() => void navigator.clipboard?.writeText(odkazHrace(h.token))}
                    className="rounded-full border border-[var(--wm-border)] px-3.5 py-1.5 text-[12.5px] font-semibold text-[var(--wm-text-2)]"
                  >
                    Kopírovat odkaz
                  </button>
                ) : h.sdileno ? (
                  <span className="rounded-full bg-[var(--wm-green-light)] px-3 py-1 text-[12px] font-semibold text-[var(--wm-ok-fg)]">
                    sdíleno
                  </span>
                ) : (
                  <span
                    className="rounded-full bg-[var(--wm-track)] px-3 py-1 text-[12px] font-semibold text-[var(--wm-text-2)]"
                    title="Hráč si nepřál sdílet vyhodnocení. Do profilu týmu se započítalo."
                  >
                    nesdíleno
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------

function ReportTymu({
  sessionToken,
  teamId,
  lang,
  zpet,
}: {
  sessionToken: string
  teamId: string
  lang: TymLang
  zpet: () => void
}) {
  const [data, setData] = useState<TeamReport | null | "chyba">(null)

  useEffect(() => {
    teamReport(sessionToken, teamId)
      .then((d) => setData(d))
      .catch(() => setData("chyba"))
  }, [sessionToken, teamId])

  return (
    <div>
      <button
        type="button"
        onClick={zpet}
        className="mb-5 text-[13px] font-semibold text-[var(--wm-text-2)]"
      >
        ← Zpět
      </button>
      {data === null ? (
        <p className="text-[14px] text-[var(--wm-text-3)]">Počítám profil…</p>
      ) : data === "chyba" || data === undefined ? (
        <Chyba text="Profil týmu se nepodařilo načíst." />
      ) : (
        <TymReport data={data} lang={lang} />
      )}
    </div>
  )
}

function Chyba({ text }: { text: string }) {
  return (
    <p className="mb-4 rounded-2xl bg-[var(--wm-red-light)] p-4 text-[14px] font-medium text-[var(--wm-invalid-fg)]">
      {text}
    </p>
  )
}

function Odkaz({ url }: { url: string }) {
  const [zkopirovano, setZkopirovano] = useState(false)
  return (
    <div className="mt-3 flex flex-wrap items-center gap-2 rounded-xl bg-[var(--wm-surface-2)] p-3">
      <code className="min-w-0 flex-1 truncate text-[12.5px] text-[var(--wm-text-2)]">{url}</code>
      <button
        type="button"
        onClick={() => {
          void navigator.clipboard?.writeText(url)
          setZkopirovano(true)
          window.setTimeout(() => setZkopirovano(false), 2000)
        }}
        className="rounded-full bg-[var(--wm-brand)] px-3.5 py-1.5 text-[12.5px] font-semibold text-[var(--wm-brand-fg)]"
      >
        {zkopirovano ? "Zkopírováno" : "Kopírovat"}
      </button>
    </div>
  )
}
