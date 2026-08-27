"use client"

import { useCallback, useEffect, useState } from "react"
import { TymReport } from "@/components/tym/report"
import {
  addExistingToTeam,
  chybaText,
  createPlayerInvite,
  createTeam,
  listDopocitane,
  listPlayers,
  listPridatelne,
  listTeams,
  mojeTymy,
  removeFromTeam,
  setTeamActive,
  setTeamCoach,
  teamReport,
  type CoachRow,
  type Kandidat,
  type MujTym,
  type PlayerRow,
  type TeamReport,
  type TeamRow,
} from "@/lib/diagnostic/remote"
import type { TymLang } from "@/lib/tym/obsah"
import { NAZEV_TYMOVEHO_TESTU } from "@/lib/diagnostic/nazvy"

// Správa týmů.
//
// Dvě strany téže věci. Master zakládá týmy, přiřazuje k nim kouče a čte
// souhrnné profily; do vyplnění hráčů v cizích týmech nevidí. Kouč spravuje
// soupisku, rozesílá odkazy a vidí vyhodnocení těch hráčů, kteří mu je
// zpřístupnili.
//
// Ty dvě role se můžou potkat v jednom účtu: master smí u týmu dosadit sám
// sebe jako kouče, protože některé týmy vedeme my. U takového týmu má práva
// kouče včetně soupisky – ne proto, že je master, ale proto, že je jeho kouč.
// Souhlas hráče na to sedí: hráč souhlasí se sdílením s koučem svého týmu.

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
  jaId,
  lang,
}: {
  sessionToken: string
  /** účty, ze kterých jde vybrat vedoucího týmu: externí kouči a já sám */
  kouci: CoachRow[]
  /** id přihlášeného mastera, aby šlo dosadit sebe jako kouče týmu */
  jaId: string
  lang: TymLang
}) {
  const [tymy, setTymy] = useState<TeamRow[] | null>(null)
  const [chyba, setChyba] = useState<string | null>(null)
  const [otevreny, setOtevreny] = useState<string | null>(null)
  const [soupiska, setSoupiska] = useState<string | null>(null)
  const [slozeni, setSlozeni] = useState<string | null>(null)
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

  // Já stojím v nabídce první: „vedu si to sám" je běžnější volba než hledat
  // konkrétního externího kouče, a bez ní se tým nedal založit, dokud žádný
  // externí účet neexistoval.
  const ja = kouci.find((c) => c.id === jaId)
  const naVyber: { id: string; popis: string }[] = [
    ...(jaId ? [{ id: jaId, popis: ja ? `Já – ${ja.name}` : "Já (master)" }] : []),
    ...kouci
      .filter((c) => c.role === "external" && c.active)
      .map((c) => ({ id: c.id, popis: `${c.name} · ${c.email}` })),
  ]

  /**
   * Nabídka pro jeden tým. Současný kouč v ní musí být vždycky, i když je jeho
   * účet mezitím vypnutý: jinak by se v poli ukázal někdo jiný a nechtěné
   * kliknutí by tým převedlo.
   */
  const vyberProTym = (t: TeamRow) =>
    naVyber.some((c) => c.id === t.coachId)
      ? naVyber
      : [{ id: t.coachId, popis: `${t.coachName} (neaktivní účet)` }, ...naVyber]

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

  const skladany = tymy?.find((t) => t.id === slozeni)
  if (skladany) {
    return (
      <SlozeniTymu
        sessionToken={sessionToken}
        tym={skladany}
        zpet={() => {
          setSlozeni(null)
          void nacti()
        }}
      />
    )
  }

  const vedenyMnou = tymy?.find((t) => t.id === soupiska)
  if (vedenyMnou) {
    return (
      <div className="max-w-[62rem]">
        <SoupiskaTymu
          sessionToken={sessionToken}
          tym={vedenyMnou}
          lang={lang}
          zpet={() => {
            setSoupiska(null)
            void nacti()
          }}
        />
      </div>
    )
  }

  return (
    <div className="max-w-[62rem]">
      {chyba && <Chyba text={chyba} />}

      {naVyber.length === 0 ? (
        <div className="diag-card p-6">
          <h2 className="text-[16px] font-bold tracking-tight">Není koho postavit do čela</h2>
          <p className="mt-2 max-w-[68ch] text-[13.5px] leading-relaxed text-[var(--wm-text-2)]">
            Načti stránku znovu, ať se tvůj účet dotáhne. Pak půjde tým vést buď tobě, nebo
            externímu kouči, kterého založíš v záložce Kouči.
          </p>
        </div>
      ) : !formular ? (
        <button
          type="button"
          onClick={() => {
            setFormular(true)
            setCoachId(naVyber[0].id)
          }}
          className="diag-press mb-5 rounded-full bg-[var(--wm-brand)] px-5 py-2 text-[13px] font-semibold text-[var(--wm-brand-fg)]"
        >
          + Založit tým
        </button>
      ) : (
        <form onSubmit={zaloz} className="diag-card mb-6 p-6">
          <h2 className="text-[16px] font-semibold">Nový tým</h2>
          <p className="mt-1 max-w-[68ch] text-[13px] leading-relaxed text-[var(--wm-text-2)]">
            Kouč pak hráčům rozešle odkazy pod označením, které si sám zvolí. U týmu, který vede
            někdo jiný, uvidíš název, počty a souhrnný profil, do vyplnění jednotlivých hráčů ne.
            Když jako kouče dosadíš sebe, vedeš tým ty: rozesíláš odkazy a vidíš do vyhodnocení
            těch hráčů, kteří sdílení povolili.
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
              {naVyber.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.popis}
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
                    {t.veduJa ? "vedu já" : t.coachName} · založen {datum(t.createdAt)}
                  </p>
                  {/* Kouč jde vyměnit jen do prvního odevzdaného dotazníku: potom
                      už je za sdílením souhlas hráče, který platil tomuhle kouči. */}
                  {t.odevzdano === 0 ? (
                    <label className="mt-2 flex flex-wrap items-center gap-2 text-[12.5px] text-[var(--wm-text-3)]">
                      Kouč týmu
                      <select
                        className="diag-input py-1 text-[12.5px]"
                        value={t.coachId}
                        onChange={async (e) => {
                          try {
                            await setTeamCoach(sessionToken, t.id, e.target.value)
                            await nacti()
                          } catch (err) {
                            setChyba(chybaText(err, "Kouče se nepodařilo změnit."))
                          }
                        }}
                      >
                        {vyberProTym(t).map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.popis}
                          </option>
                        ))}
                      </select>
                    </label>
                  ) : (
                    !t.veduJa && (
                      <p className="mt-1 text-[12px] text-[var(--wm-text-3)]">
                        Kouče už měnit nelze, hráči odevzdávají.
                      </p>
                    )
                  )}
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
                {t.veduJa && (
                  <button
                    type="button"
                    onClick={() => setSoupiska(t.id)}
                    className="rounded-full border border-[var(--wm-border)] px-4 py-1.5 text-[12.5px] font-semibold text-[var(--wm-text-2)]"
                  >
                    Soupiska
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setSlozeni(t.id)}
                  className="rounded-full border border-[var(--wm-border)] px-4 py-1.5 text-[12.5px] font-semibold text-[var(--wm-text-2)]"
                >
                  Přidat z hotových
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

/** Tým tak, jak ho potřebuje soupiska. Master i kouč ho mají v jiném tvaru. */
interface TymProSoupisku {
  id: string
  nazev: string
  active: boolean
  pozvano: number
  odevzdano: number
}

/**
 * Soupiska jednoho týmu: přidání hráče, odkazy a stav odevzdání.
 *
 * Stojí zvlášť, protože ji potřebují dvě různé obrazovky: klubový kouč u svých
 * týmů a master u týmu, který vede sám. Kdyby existovala dvakrát, rozejde se.
 */
function SoupiskaTymu({
  sessionToken,
  tym,
  lang,
  zpet,
}: {
  sessionToken: string
  tym: TymProSoupisku
  lang: TymLang
  /** když je zadané, nabídne se návrat na seznam týmů */
  zpet?: () => void
}) {
  const [hraci, setHraci] = useState<PlayerRow[] | null>(null)
  const [chyba, setChyba] = useState<string | null>(null)
  const [stitek, setStitek] = useState("")
  const [jazyk, setJazyk] = useState("en")
  const [pridava, setPridava] = useState(false)
  const [poslednOdkaz, setPosledniOdkaz] = useState<string | null>(null)
  const [zobrazReport, setZobrazReport] = useState(false)

  const nactiHrace = useCallback(async () => {
    try {
      setHraci(await listPlayers(sessionToken, tym.id))
    } catch (e) {
      setChyba(chybaText(e, "Soupisku se nepodařilo načíst."))
    }
  }, [sessionToken, tym.id])

  useEffect(() => {
    void nactiHrace()
  }, [nactiHrace])

  if (zobrazReport) {
    return (
      <ReportTymu sessionToken={sessionToken} teamId={tym.id} lang={lang} zpet={() => setZobrazReport(false)} />
    )
  }

  // Počty se berou ze soupisky, ne z týmu v nadřazeném seznamu. Ten se načetl
  // jednou; po vystavení odkazu by v hlavičce zůstalo staré číslo.
  const pozvano = hraci?.length ?? tym.pozvano
  const odevzdano = hraci ? hraci.filter((h) => h.odevzdanoAt).length : tym.odevzdano

  const pridej = async (e: React.FormEvent) => {
    e.preventDefault()
    setPridava(true)
    try {
      const { token } = await createPlayerInvite(sessionToken, tym.id, stitek, jazyk)
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
    <>
      {chyba && <Chyba text={chyba} />}
      {zpet && (
        <button type="button" onClick={zpet} className="mb-5 text-[13px] font-semibold text-[var(--wm-text-2)]">
          ← Zpět na týmy
        </button>
      )}

      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-[22px] font-bold tracking-tight">{tym.nazev}</h2>
          <p className="mt-1 text-[13.5px] text-[var(--wm-text-2)]">
            Odevzdáno {odevzdano} z {pozvano} rozeslaných.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setZobrazReport(true)}
          disabled={!odevzdano}
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
            disabled={pridava || !tym.active}
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
    </>
  )
}

export function TymKouce({ sessionToken, lang }: { sessionToken: string; lang: TymLang }) {
  const [tymy, setTymy] = useState<MujTym[] | null>(null)
  const [vybrany, setVybrany] = useState<string | null>(null)
  const [chyba, setChyba] = useState<string | null>(null)

  useEffect(() => {
    mojeTymy(sessionToken)
      .then((t) => {
        setTymy(t)
        if (t.length && !vybrany) setVybrany(t[0].id)
      })
      .catch((e) => setChyba(chybaText(e, "Týmy se nepodařilo načíst.")))
    // vybrany schválně mimo závislosti: první tým se volí jen při načtení
  }, [sessionToken]) // eslint-disable-line react-hooks/exhaustive-deps

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

  const tym = tymy.find((t) => t.id === vybrany) ?? tymy[0]

  return (
    <div className="max-w-[62rem]">
      {tymy.length > 1 && (
        <div className="diag-segment mb-5">
          {tymy.map((t) => (
            <button key={t.id} type="button" data-active={t.id === tym.id} onClick={() => setVybrany(t.id)}>
              {t.nazev}
            </button>
          ))}
        </div>
      )}
      <SoupiskaTymu key={tym.id} sessionToken={sessionToken} tym={tym} lang={lang} />
    </div>
  )
}


// ---------------------------------------------------------------------------

/**
 * Složení týmu z hotových diagnostik.
 *
 * Běžná cesta je pozvánka. Tahle obrazovka řeší druhý případ: hráči vyplnili
 * dřív, jako naši klienti, a tým vzniká až teď. Posílat jim dotazník znovu
 * nedává smysl, tak se hotové vyplnění do souhrnu dopočítá.
 *
 * Na soupisku se takový hráč nedostane a klubový kouč se k jeho vyhodnocení
 * nedostane taky. Do profilu týmu ale vstoupí, což je celé, oč jde.
 */
function SlozeniTymu({
  sessionToken,
  tym,
  zpet,
}: {
  sessionToken: string
  tym: TeamRow
  zpet: () => void
}) {
  const [vTymu, setVTymu] = useState<Kandidat[] | null>(null)
  const [nabidka, setNabidka] = useState<Kandidat[] | null>(null)
  const [hledat, setHledat] = useState("")
  const [chyba, setChyba] = useState<string | null>(null)
  const [pracuje, setPracuje] = useState<string | null>(null)

  const nacti = useCallback(async () => {
    try {
      const [a, b] = await Promise.all([
        listDopocitane(sessionToken, tym.id),
        listPridatelne(sessionToken),
      ])
      setVTymu(a)
      setNabidka(b)
    } catch (e) {
      setChyba(chybaText(e, "Seznam se nepodařilo načíst."))
    }
  }, [sessionToken, tym.id])

  useEffect(() => {
    void nacti()
  }, [nacti])

  const uprav = async (co: () => Promise<void>, id: string) => {
    setPracuje(id)
    setChyba(null)
    try {
      await co()
      await nacti()
    } catch (e) {
      setChyba(chybaText(e, "Nepodařilo se to."))
    } finally {
      setPracuje(null)
    }
  }

  // Hledá se v obojím: ve jméně i v roli, protože u hráčů bývá v roli sport
  // a úroveň, a podle toho se v dlouhém seznamu orientuje líp než podle data.
  const dotaz = hledat.trim().toLowerCase()
  const nalezene = (nabidka ?? []).filter(
    (k) =>
      !dotaz ||
      k.jmeno.toLowerCase().includes(dotaz) ||
      (k.role ?? "").toLowerCase().includes(dotaz),
  )

  return (
    <div className="max-w-[62rem]">
      <button type="button" onClick={zpet} className="mb-5 text-[13px] font-semibold text-[var(--wm-text-2)]">
        ← Zpět na týmy
      </button>
      {chyba && <Chyba text={chyba} />}

      <h2 className="text-[22px] font-bold tracking-tight">{tym.nazev}</h2>
      <p className="mt-1 max-w-[72ch] text-[13.5px] leading-relaxed text-[var(--wm-text-2)]">
        Kdo diagnostiku vyplnil dřív, nemusí ji vyplňovat znovu. Přidej jeho hotové vyplnění sem
        a započítá se do profilu týmu. Na soupisku se nedostane a kouč klubu jeho vyhodnocení
        neuvidí; klient souhlasil s prací s námi, ne s cizím klubem.
      </p>

      <h3 className="mt-7 text-[15px] font-bold tracking-tight">
        V týmu z hotových diagnostik
        {vTymu && vTymu.length > 0 && (
          <span className="ml-2 font-normal text-[var(--wm-text-3)]">{vTymu.length}</span>
        )}
      </h3>
      {vTymu === null ? (
        <p className="mt-2 text-[14px] text-[var(--wm-text-3)]">Načítám…</p>
      ) : vTymu.length === 0 ? (
        <p className="mt-2 text-[14px] text-[var(--wm-text-2)]">Zatím nikdo.</p>
      ) : (
        <div className="diag-card mt-3 overflow-hidden">
          {vTymu.map((k) => (
            <div
              key={k.id}
              className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--wm-border-light)] px-5 py-3 last:border-b-0"
            >
              <div className="min-w-0">
                <p className="text-[14.5px] font-semibold">{k.jmeno}</p>
                <p className="mt-0.5 text-[12.5px] text-[var(--wm-text-3)]">
                  {[k.role, `vyplněno ${k.datum}`].filter(Boolean).join(" · ")}
                </p>
              </div>
              <button
                type="button"
                disabled={pracuje === k.id}
                onClick={() => void uprav(() => removeFromTeam(sessionToken, tym.id, k.id), k.id)}
                className="rounded-full border border-[var(--wm-border)] px-3.5 py-1.5 text-[12.5px] font-semibold text-[var(--wm-text-2)] disabled:opacity-50"
              >
                {pracuje === k.id ? "Vyjímám…" : "Vyjmout"}
              </button>
            </div>
          ))}
        </div>
      )}

      <h3 className="mt-8 text-[15px] font-bold tracking-tight">Hotové diagnostiky</h3>
      <p className="mt-1 max-w-[72ch] text-[13px] leading-relaxed text-[var(--wm-text-2)]">
        Nabízí se ELITE 200 z naší větve, které zatím nepatří žádnému týmu. Kratší verze tady
        nenajdeš: profil týmu z nich spočítat nejde, protože nemají jednadvacet částí.
      </p>
      <input
        className="diag-input mt-3 w-full max-w-[24rem]"
        value={hledat}
        onChange={(e) => setHledat(e.target.value)}
        placeholder="Hledat podle jména nebo role"
      />

      {nabidka === null ? (
        <p className="mt-3 text-[14px] text-[var(--wm-text-3)]">Načítám…</p>
      ) : nalezene.length === 0 ? (
        <p className="mt-3 text-[14px] text-[var(--wm-text-2)]">
          {nabidka.length === 0 ? "Žádná volná hotová diagnostika." : "Nic takového tu není."}
        </p>
      ) : (
        <div className="diag-card mt-3 overflow-hidden">
          {nalezene.map((k) => (
            <div
              key={k.id}
              className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--wm-border-light)] px-5 py-3 last:border-b-0"
            >
              <div className="min-w-0">
                <p className="text-[14.5px] font-semibold">{k.jmeno}</p>
                <p className="mt-0.5 text-[12.5px] text-[var(--wm-text-3)]">
                  {[k.role, `vyplněno ${k.datum}`].filter(Boolean).join(" · ")}
                </p>
              </div>
              <button
                type="button"
                disabled={pracuje === k.id}
                onClick={() => void uprav(() => addExistingToTeam(sessionToken, tym.id, k.id), k.id)}
                className="diag-press rounded-full bg-[var(--wm-brand)] px-4 py-1.5 text-[12.5px] font-semibold text-[var(--wm-brand-fg)] disabled:opacity-50"
              >
                {pracuje === k.id ? "Přidávám…" : "Přidat do týmu"}
              </button>
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
