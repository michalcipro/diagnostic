"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { JAZYKY, KOD_JAZYKA } from "@/lib/diagnostic/lang"
import type { Gender, Lang } from "@/lib/diagnostic/types"
import { UI } from "@/lib/planner/i18n"
import { dlouheDatum, dnes, indexDne, pondeli, popisRozsahuTydne, posun, NAZVY_DNU } from "@/lib/planner/datum"
import type {
  MetricKey,
  PlannerDay,
  PlannerHabit,
  PlannerIdentity,
  ReflectionKey,
} from "@/lib/planner/types"
import * as api from "@/lib/planner/remote"
import { WeekBoard } from "@/components/planner/week-board"
import { DayBoard } from "@/components/planner/day-board"
import { StatsPanel } from "@/components/planner/stats-panel"
import { HabitsPanel } from "@/components/planner/habits-panel"
import { AccountPanel } from "@/components/planner/account-panel"
import { ForcePassword } from "@/components/planner/force-password"
import { nactiJazyk, nactiRelaci, ulozJazyk, ulozRelaci, zapomenRelaci } from "@/lib/planner/storage"
import { nazevSouboru, sestavTydenniPdf } from "@/lib/planner/pdf"

// Týdenní plánovač – klientská část.
//
// Jedna obrazovka drží veškerý stav: přihlášení, zobrazený den, načtený týden
// a frontu neuložených změn. Podřízené komponenty jsou bez stavu a jen hlásí,
// co uživatel udělal. Díky tomu nemůže nastat, že by se to, co je vidět,
// rozešlo s tím, co je uložené, protože obojí vychází z jednoho místa.
//
// UKLÁDÁNÍ: psaný text se odesílá se zpožděním po dopsání a navíc při opuštění
// políčka; kliknutí (kolečko návyku, hodnocení) se ukládá hned. Deník se píše
// v útržcích mezi jinou prací, takže tlačítko „uložit", na které se dá
// zapomenout, sem nepatří.

type Zalozka = "tyden" | "den" | "statistiky" | "navyky" | "ucet"
type StavUlozeni = "klid" | "uklada" | "ulozeno" | "chyba"

/** Jak dlouho se čeká po dopsání, než se text odešle. */
const PRODLEVA_MS = 900

function prazdnyDen(datum: string): PlannerDay {
  return { date: datum, schedule: [], ratings: {}, reflection: {}, habits: [] }
}

/** Je den prázdný? Podle toho se uklízí skořápka po smazání obsahu. */
function jeDenPrazdny(d: PlannerDay): boolean {
  return (
    !d.habits.length &&
    !d.schedule.some((s) => s.text.trim()) &&
    !Object.values(d.ratings).some((v) => typeof v === "number") &&
    !Object.values(d.reflection).some((v) => (v ?? "").trim())
  )
}

export default function PlannerPage() {
  const [lang, setLang] = useState<Lang>("cs")
  const [session, setSession] = useState("")
  const [ja, setJa] = useState<PlannerIdentity | null>(null)
  const [booting, setBooting] = useState(true)

  const [email, setEmail] = useState("")
  const [heslo, setHeslo] = useState("")
  const [prihlasuji, setPrihlasuji] = useState(false)
  const [chybaPrihlaseni, setChybaPrihlaseni] = useState<string | null>(null)

  const [zalozka, setZalozka] = useState<Zalozka>("tyden")
  const [datum, setDatum] = useState(() => dnes())
  const dnesniDatum = useMemo(() => dnes(), [])
  const monday = useMemo(() => pondeli(datum), [datum])

  const [dny, setDny] = useState<Map<string, PlannerDay>>(new Map())
  const [poznamky, setPoznamky] = useState("")
  const [navyky, setNavyky] = useState<PlannerHabit[]>([])
  const [nacitam, setNacitam] = useState(false)
  const [stav, setStav] = useState<StavUlozeni>("klid")
  const [chyba, setChyba] = useState<string | null>(null)
  const [zaneprazdneno, setZaneprazdneno] = useState(false)

  const t = UI[lang]
  const gender: Gender = ja?.gender ?? "male"

  // ── nejnovější stav pro odesílání ─────────────────────────────────────────
  //
  // Odeslání běží se zpožděním, takže se nesmí opírat o hodnoty zavřené
  // v uzávěru: mezitím se stihne napsat další písmeno a to by se ztratilo.
  const stavRef = useRef({ dny, poznamky, monday, session })
  useEffect(() => {
    stavRef.current = { dny, poznamky, monday, session }
  }, [dny, poznamky, monday, session])

  const cekaRef = useRef<{ rozvrh: Set<string>; reflexe: Set<string>; poznamky: boolean }>({
    rozvrh: new Set(),
    reflexe: new Set(),
    poznamky: false,
  })
  const casovacRef = useRef<number | null>(null)

  const odesli = useCallback(async () => {
    if (casovacRef.current !== null) {
      window.clearTimeout(casovacRef.current)
      casovacRef.current = null
    }
    const ceka = cekaRef.current
    if (!ceka.rozvrh.size && !ceka.reflexe.size && !ceka.poznamky) return
    cekaRef.current = { rozvrh: new Set(), reflexe: new Set(), poznamky: false }

    const { dny: aktualni, poznamky: pozn, monday: pondeliDatum, session: token } = stavRef.current
    if (!token) return
    setStav("uklada")
    try {
      const dotcene = new Set([...ceka.rozvrh, ...ceka.reflexe])
      for (const d of dotcene) {
        const den = aktualni.get(d) ?? prazdnyDen(d)
        await api.saveDay(token, d, {
          schedule: ceka.rozvrh.has(d) ? den.schedule : undefined,
          // Posílají se všechna tři políčka najednou, aby šlo text i smazat.
          // Kdyby se poslalo jen to změněné, prázdný řetězec by se sice
          // uložil, ale zbylá dvě by se musela dohledávat zvlášť.
          reflection: ceka.reflexe.has(d)
            ? {
                grateful: den.reflection.grateful ?? "",
                win: den.reflection.win ?? "",
                improve: den.reflection.improve ?? "",
              }
            : undefined,
        })
        if (jeDenPrazdny(den)) await api.uklidPrazdnyDen(token, d)
      }
      if (ceka.poznamky) await api.saveWeekNotes(token, pondeliDatum, pozn)
      setStav("ulozeno")
      setChyba(null)
    } catch (e) {
      setStav("chyba")
      setChyba(api.chybaText(e, t.chybaUlozeni))
    }
  }, [t.chybaUlozeni])

  const naplanujOdeslani = useCallback(() => {
    if (casovacRef.current !== null) window.clearTimeout(casovacRef.current)
    casovacRef.current = window.setTimeout(() => void odesli(), PRODLEVA_MS)
  }, [odesli])

  // Neuložený text se odešle i při zavření karty. Bez toho by se ztratila
  // poslední věta, kterou člověk dopsal a hned zavřel prohlížeč.
  useEffect(() => {
    const pri = () => void odesli()
    window.addEventListener("beforeunload", pri)
    window.addEventListener("pagehide", pri)
    return () => {
      window.removeEventListener("beforeunload", pri)
      window.removeEventListener("pagehide", pri)
    }
  }, [odesli])

  // ── přihlášení ────────────────────────────────────────────────────────────

  useEffect(() => {
    const ulozenyJazyk = nactiJazyk()
    if (ulozenyJazyk) setLang(ulozenyJazyk)
    const ulozena = nactiRelaci()
    if (!ulozena || !api.isRemoteEnabled()) {
      setBooting(false)
      return
    }
    api
      .whoAmI(ulozena)
      .then((kdo) => {
        if (kdo) {
          setSession(ulozena)
          setJa(kdo)
          if (!ulozenyJazyk) setLang(kdo.lang)
        } else {
          zapomenRelaci()
        }
      })
      .catch(() => zapomenRelaci())
      .finally(() => setBooting(false))
  }, [])

  const prihlas = async () => {
    setPrihlasuji(true)
    setChybaPrihlaseni(null)
    try {
      const r = await api.login(email.trim(), heslo)
      ulozRelaci(r.sessionToken)
      setSession(r.sessionToken)
      const kdo = await api.whoAmI(r.sessionToken)
      setJa(kdo)
      if (!nactiJazyk()) setLang(r.lang)
      setHeslo("")
    } catch (e) {
      setChybaPrihlaseni(api.chybaText(e, t.chybnePrihlaseni))
    } finally {
      setPrihlasuji(false)
    }
  }

  const odhlas = useCallback(async () => {
    await odesli()
    if (session) {
      try {
        await api.logout(session)
      } catch {
        // Relace na serveru už mohla vypršet; z prohlížeče se maže tak jako tak.
      }
    }
    zapomenRelaci()
    setSession("")
    setJa(null)
    setDny(new Map())
    setNavyky([])
  }, [odesli, session])

  // ── načtení týdne ─────────────────────────────────────────────────────────

  const nactiTyden = useCallback(
    async (token: string, pondeliDatum: string) => {
      setNacitam(true)
      try {
        const r = await api.getWeek(token, pondeliDatum)
        const m = new Map<string, PlannerDay>()
        for (const d of r.days) m.set(d.date, d)
        setDny(m)
        setPoznamky(r.notes)
        setNavyky(r.habits)
        setChyba(null)
      } catch (e) {
        setChyba(api.chybaText(e, t.chybaUlozeni))
      } finally {
        setNacitam(false)
      }
    },
    [t.chybaUlozeni],
  )

  useEffect(() => {
    if (!session) return
    void nactiTyden(session, monday)
  }, [session, monday, nactiTyden])

  /** Přechod na jiný den; rozepsaný text se nejdřív odešle. */
  const jdiNa = useCallback(
    async (novyDatum: string) => {
      await odesli()
      setDatum(novyDatum)
    },
    [odesli],
  )

  // ── úpravy ────────────────────────────────────────────────────────────────

  const upravDen = useCallback((datumDne: string, uprav: (d: PlannerDay) => PlannerDay) => {
    setDny((stare) => {
      const nove = new Map(stare)
      nove.set(datumDne, uprav(stare.get(datumDne) ?? prazdnyDen(datumDne)))
      return nove
    })
  }, [])

  const onRozvrh = useCallback(
    (datumDne: string, hodina: number, text: string) => {
      upravDen(datumDne, (d) => {
        const bez = d.schedule.filter((s) => s.hour !== hodina)
        const novy = text.trim() ? [...bez, { hour: hodina, text }] : bez
        return { ...d, schedule: novy.sort((a, b) => a.hour - b.hour) }
      })
      cekaRef.current.rozvrh.add(datumDne)
      naplanujOdeslani()
    },
    [upravDen, naplanujOdeslani],
  )

  const onReflexe = useCallback(
    (datumDne: string, klic: ReflectionKey, text: string) => {
      upravDen(datumDne, (d) => ({ ...d, reflection: { ...d.reflection, [klic]: text } }))
      cekaRef.current.reflexe.add(datumDne)
      naplanujOdeslani()
    },
    [upravDen, naplanujOdeslani],
  )

  const onPoznamky = useCallback(
    (text: string) => {
      setPoznamky(text)
      cekaRef.current.poznamky = true
      naplanujOdeslani()
    },
    [naplanujOdeslani],
  )

  /**
   * Hodnocení se ukládá hned. Je to jedno kliknutí, ne psaní, takže není na
   * co čekat, a okamžitá odezva dává jistotu, že se číslo zapsalo.
   */
  const onHodnoceni = useCallback(
    (datumDne: string, metrika: MetricKey, hodnota: number | null) => {
      const puvodni = stavRef.current.dny.get(datumDne)
      upravDen(datumDne, (d) => ({
        ...d,
        ratings: { ...d.ratings, [metrika]: hodnota ?? undefined },
      }))
      const token = stavRef.current.session
      if (!token) return
      setStav("uklada")
      api
        .saveDay(token, datumDne, { ratings: { [metrika]: hodnota } })
        .then(async () => {
          setStav("ulozeno")
          setChyba(null)
          const po = stavRef.current.dny.get(datumDne)
          if (po && jeDenPrazdny(po)) await api.uklidPrazdnyDen(token, datumDne)
        })
        .catch((e) => {
          // Neuložená změna se vrátí zpět, ať na obrazovce nezůstane číslo,
          // které v databázi není.
          setDny((stare) => {
            const nove = new Map(stare)
            if (puvodni) nove.set(datumDne, puvodni)
            else nove.delete(datumDne)
            return nove
          })
          setStav("chyba")
          setChyba(api.chybaText(e, t.chybaUlozeni))
        })
    },
    [upravDen, t.chybaUlozeni],
  )

  const onNavyk = useCallback(
    (datumDne: string, habitId: string, splneno: boolean) => {
      const puvodni = stavRef.current.dny.get(datumDne)
      upravDen(datumDne, (d) => ({
        ...d,
        habits: splneno ? [...d.habits, habitId] : d.habits.filter((h) => h !== habitId),
      }))
      const token = stavRef.current.session
      if (!token) return
      setStav("uklada")
      api
        .toggleHabit(token, datumDne, habitId, splneno)
        .then(async () => {
          setStav("ulozeno")
          setChyba(null)
          const po = stavRef.current.dny.get(datumDne)
          if (po && jeDenPrazdny(po)) await api.uklidPrazdnyDen(token, datumDne)
        })
        .catch((e) => {
          setDny((stare) => {
            const nove = new Map(stare)
            if (puvodni) nove.set(datumDne, puvodni)
            else nove.delete(datumDne)
            return nove
          })
          setStav("chyba")
          setChyba(api.chybaText(e, t.chybaUlozeni))
        })
    },
    [upravDen, t.chybaUlozeni],
  )

  // ── návyky ────────────────────────────────────────────────────────────────

  const seZaneprazdnenim = useCallback(
    async (akce: () => Promise<void>) => {
      setZaneprazdneno(true)
      try {
        await akce()
        setNavyky(await api.listHabits(stavRef.current.session))
        setChyba(null)
      } catch (e) {
        setChyba(api.chybaText(e, t.chybaUlozeni))
      } finally {
        setZaneprazdneno(false)
      }
    },
    [t.chybaUlozeni],
  )

  /**
   * Uložení týdenního listu jako PDF.
   *
   * Vlastní soubor, ne tiskový dialog: z tiskového dialogu na iPhonu nejde
   * výsledek uložit ani odeslat. Rozepsaný text se před sestavením odešle,
   * ať v souboru není o větu míň, než je na obrazovce.
   */
  const exportPdf = useCallback(async () => {
    await odesli()
    if (!ja) return
    const { dny: aktualni, poznamky: pozn, monday: pondeliDatum } = stavRef.current
    const vstup = {
      monday: pondeliDatum,
      dny: aktualni,
      poznamky: pozn,
      navyky,
      jmeno: ja.name,
      lang,
      gender,
    }
    const blob = sestavTydenniPdf(vstup)
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = nazevSouboru(vstup)
    a.click()
    // Uvolnění až po kliknutí: Safari si adresu přečte asynchronně a při
    // okamžitém uvolnění by stáhlo prázdný soubor.
    window.setTimeout(() => URL.revokeObjectURL(url), 4000)
  }, [odesli, ja, navyky, lang, gender])

  // ── vykreslení ────────────────────────────────────────────────────────────

  if (booting) {
    return (
      <div className="pl-root">
        <div className="pl-wrap" style={{ paddingTop: 80 }}>
          <p className="pl-note">{t.nacitam}</p>
        </div>
      </div>
    )
  }

  if (!api.isRemoteEnabled()) {
    return (
      <div className="pl-root">
        <div className="pl-wrap" style={{ paddingTop: 80, maxWidth: 480 }}>
          <p className="pl-note">{t.bezPripojeni}</p>
        </div>
      </div>
    )
  }

  // Účet s dočasným heslem od kouče se dál nedostane. Kdyby šlo změnu
  // odložit, neudělal by ji nikdo a heslo, které zná i někdo další, by
  // v deníku zůstalo napořád.
  if (session && ja && ja.mustChangePassword) {
    return (
      <ForcePassword
        lang={lang}
        email={ja.email}
        jmeno={ja.name}
        gender={gender}
        onZmenit={async (stavajici, nove) => {
          await api.changePassword(session, stavajici, nove)
        }}
        onHotovo={() => {
          // Server při změně hesla ukončil i tuhle relaci, takže se
          // z prohlížeče musí zahodit taky, jinak by se klient díval na
          // přihlášené rozhraní, které při prvním dotazu spadne.
          zapomenRelaci()
          setSession("")
          setJa(null)
        }}
        onOdhlasit={() => {
          zapomenRelaci()
          setSession("")
          setJa(null)
        }}
      />
    )
  }

  if (!session || !ja) {
    return (
      <div className="pl-root">
        <div
          className="pl-wrap"
          style={{ maxWidth: 400, paddingTop: 90, display: "flex", flexDirection: "column" }}
        >
          <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.18em", margin: 0 }}>
            WINNING MINDS
          </p>
          <h1 style={{ fontSize: 26, fontWeight: 700, margin: "10px 0 6px" }}>{t.appName}</h1>
          <p className="pl-note" style={{ marginTop: 0 }}>
            {t.uvodniText}
          </p>

          <div className="pl-card" style={{ marginTop: 18 }}>
            <label className="pl-label" htmlFor="pl-email">
              {t.email}
            </label>
            <input
              id="pl-email"
              className="pl-input"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <div style={{ marginTop: 12 }}>
              <label className="pl-label" htmlFor="pl-heslo">
                {t.heslo}
              </label>
              <input
                id="pl-heslo"
                className="pl-input"
                type="password"
                autoComplete="current-password"
                value={heslo}
                onChange={(e) => setHeslo(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && email && heslo) void prihlas()
                }}
              />
            </div>
            <button
              type="button"
              className="pl-btn pl-btn-primary"
              style={{ width: "100%", marginTop: 16, padding: "10px 14px" }}
              disabled={prihlasuji || !email || !heslo}
              onClick={() => void prihlas()}
            >
              {prihlasuji ? t.prihlasuji : t.prihlasit}
            </button>
            {chybaPrihlaseni && (
              <p className="pl-note" style={{ color: "var(--wm-red)", marginBottom: 0 }}>
                {chybaPrihlaseni}
              </p>
            )}
          </div>

          <div className="pl-tabs" style={{ marginTop: 18, alignSelf: "flex-start" }}>
            {JAZYKY.map((j) => (
              <button
                key={j}
                type="button"
                data-active={lang === j}
                onClick={() => {
                  setLang(j)
                  ulozJazyk(j)
                }}
              >
                {KOD_JAZYKA[j]}
              </button>
            ))}
          </div>

          <Link
            href="/"
            style={{
              marginTop: 26,
              fontSize: 13,
              color: "var(--wm-text-3)",
              textDecoration: "none",
            }}
          >
            Winning Minds
          </Link>
        </div>
      </div>
    )
  }

  const stavText =
    stav === "uklada"
      ? t.ukladam
      : stav === "ulozeno"
        ? t.ulozenoAuto
        : stav === "chyba"
          ? t.chybaUlozeni
          : ""

  return (
    <div className="pl-root">
      <header className="pl-topbar pl-noprint">
        <div className="pl-topbar-inner">
          <span className="pl-brand pl-top-brand">WINNING MINDS</span>
          <div className="pl-tabs pl-top-tabs">
            {(["tyden", "den", "statistiky", "navyky", "ucet"] as Zalozka[]).map((z) => (
              <button
                key={z}
                type="button"
                data-active={zalozka === z}
                onClick={() => {
                  void odesli()
                  setZalozka(z)
                }}
              >
                {z === "tyden"
                  ? t.tabTyden
                  : z === "den"
                    ? t.tabDen
                    : z === "statistiky"
                      ? t.tabStatistiky
                      : z === "navyky"
                        ? t.tabNavyky
                        : t.tabUcet}
              </button>
            ))}
          </div>
          <div className="pl-top-mezera" />
          <span
            className="pl-status pl-top-status"
            data-state={stav === "chyba" ? "error" : undefined}
          >
            {stavText}
          </span>
          <div className="pl-tabs pl-top-lang">
            {JAZYKY.map((j) => (
              <button
                key={j}
                type="button"
                data-active={lang === j}
                onClick={() => {
                  setLang(j)
                  ulozJazyk(j)
                }}
              >
                {KOD_JAZYKA[j]}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="pl-wrap">
        {(zalozka === "tyden" || zalozka === "den") && (
          <div
            className="pl-noprint"
            style={{
              display: "flex",
              gap: 8,
              alignItems: "center",
              flexWrap: "wrap",
              paddingTop: 14,
            }}
          >
            <button
              type="button"
              className="pl-btn"
              onClick={() => void jdiNa(posun(datum, zalozka === "tyden" ? -7 : -1))}
            >
              ‹ {t.predchozi}
            </button>
            <span style={{ fontSize: 14, fontWeight: 600, minWidth: 200, textAlign: "center" }}>
              {zalozka === "tyden"
                ? popisRozsahuTydne(monday, lang)
                : `${NAZVY_DNU[lang][indexDne(datum)]} · ${dlouheDatum(datum, lang)}`}
            </span>
            <button
              type="button"
              className="pl-btn"
              onClick={() => void jdiNa(posun(datum, zalozka === "tyden" ? 7 : 1))}
            >
              {t.dalsi} ›
            </button>
            <button type="button" className="pl-btn" onClick={() => void jdiNa(dnesniDatum)}>
              {t.dnes}
            </button>
            <div style={{ flex: 1 }} />
            <button type="button" className="pl-btn" onClick={() => window.print()}>
              {t.tisk}
            </button>
            <button type="button" className="pl-btn" onClick={() => void exportPdf()}>
              {t.pdf}
            </button>
            {nacitam && <span className="pl-status">{t.nacitam}</span>}
          </div>
        )}

        {chyba && (
          <p className="pl-note pl-noprint" style={{ color: "var(--wm-red)" }}>
            {chyba}
          </p>
        )}

        {zalozka === "tyden" && (
          <WeekBoard
            lang={lang}
            gender={gender}
            monday={monday}
            dnesniDatum={dnesniDatum}
            jmeno={ja.name}
            dny={dny}
            poznamky={poznamky}
            navyky={navyky}
            onRozvrh={onRozvrh}
            onHodnoceni={onHodnoceni}
            onReflexe={onReflexe}
            onNavyk={onNavyk}
            onPoznamky={onPoznamky}
            onFlush={() => void odesli()}
          />
        )}

        {zalozka === "den" && (
          <DayBoard
            lang={lang}
            gender={gender}
            datum={datum}
            dnesniDatum={dnesniDatum}
            den={dny.get(datum)}
            navyky={navyky}
            onRozvrh={onRozvrh}
            onHodnoceni={onHodnoceni}
            onReflexe={onReflexe}
            onNavyk={onNavyk}
            onFlush={() => void odesli()}
          />
        )}

        {zalozka === "statistiky" && (
          <StatsPanel
            sessionToken={session}
            lang={lang}
            gender={gender}
            jmeno={ja.name}
            dnesniDatum={dnesniDatum}
          />
        )}

        {zalozka === "navyky" && (
          <HabitsPanel
            lang={lang}
            gender={gender}
            navyky={navyky}
            zaneprazdneno={zaneprazdneno}
            onPridat={(nazev, cil) =>
              void seZaneprazdnenim(async () => {
                await api.addHabit(stavRef.current.session, nazev, cil)
              })
            }
            onUpravit={(id, nazev, cil) =>
              void seZaneprazdnenim(async () => {
                await api.updateHabit(stavRef.current.session, id, nazev, cil)
              })
            }
            onPosunout={(id, smer) =>
              void seZaneprazdnenim(async () => {
                await api.moveHabit(stavRef.current.session, id, smer)
              })
            }
            onArchivovat={(id, archivovat) =>
              void seZaneprazdnenim(async () => {
                await api.setHabitArchived(stavRef.current.session, id, archivovat)
              })
            }
            onSmazat={(id) =>
              void seZaneprazdnenim(async () => {
                await api.deleteHabit(stavRef.current.session, id)
                // Odškrtnutí zmizela i ze zobrazeného týdne, ať se list
                // nerozejde s tím, co je uložené.
                await nactiTyden(stavRef.current.session, stavRef.current.monday)
              })
            }
          />
        )}

        {zalozka === "ucet" && (
          <AccountPanel
            lang={lang}
            ja={ja}
            zaneprazdneno={zaneprazdneno}
            onUlozit={async (jmeno, g, j) => {
              await api.updateProfile(session, jmeno, g, j)
              setJa({ ...ja, name: jmeno, gender: g, lang: j })
              setLang(j)
              ulozJazyk(j)
            }}
            onZmenaHesla={async (stare, novee) => {
              await api.changePassword(session, stare, novee)
              zapomenRelaci()
              setSession("")
              setJa(null)
            }}
            onOdhlasitVsude={async () => {
              await api.logoutAll(session)
              zapomenRelaci()
              setSession("")
              setJa(null)
            }}
            onExport={async () => {
              const data = await api.exportVse(session)
              const blob = new Blob([JSON.stringify(data, null, 2)], {
                type: "application/json",
              })
              const url = URL.createObjectURL(blob)
              const a = document.createElement("a")
              a.href = url
              a.download = `weekly-planner-${dnesniDatum}.json`
              a.click()
              URL.revokeObjectURL(url)
            }}
            onOdhlasit={() => void odhlas()}
          />
        )}
      </div>
    </div>
  )
}
