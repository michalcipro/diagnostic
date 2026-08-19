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

const ZALOZKY: Zalozka[] = ["tyden", "den", "statistiky", "navyky", "ucet"]

/**
 * Ikony spodní navigace. Ručně kreslené SVG na mřížce 24 bodů, tah 1.8:
 * ikonová sada by přinesla stovky tvarů kvůli pěti a vlastní paletu k tomu.
 */
function IkonaZalozky({ z }: { z: Zalozka }) {
  const spolecne = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  }
  if (z === "tyden") {
    return (
      <svg {...spolecne}>
        <rect x="3" y="5" width="18" height="16" rx="3" />
        <path d="M3 10h18M8 3v4M16 3v4" />
      </svg>
    )
  }
  if (z === "den") {
    return (
      <svg {...spolecne}>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2.5v2.6M12 18.9v2.6M2.5 12h2.6M18.9 12h2.6M5.3 5.3l1.8 1.8M16.9 16.9l1.8 1.8M18.7 5.3l-1.8 1.8M7.1 16.9l-1.8 1.8" />
      </svg>
    )
  }
  if (z === "statistiky") {
    return (
      <svg {...spolecne}>
        <path d="M4 20.5h16" />
        <path d="M6.5 16.5v-5M12 16.5V7M17.5 16.5v-8" />
      </svg>
    )
  }
  if (z === "navyky") {
    return (
      <svg {...spolecne}>
        <circle cx="12" cy="12" r="8.5" />
        <path d="M8.4 12.3l2.4 2.4 4.8-5" />
      </svg>
    )
  }
  return (
    <svg {...spolecne}>
      <circle cx="12" cy="8.2" r="3.7" />
      <path d="M4.8 20.5c1.1-3.4 3.9-5.2 7.2-5.2s6.1 1.8 7.2 5.2" />
    </svg>
  )
}

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
    /** Vrátí neodeslané položky do fronty, aby je zopakoval další pokus. */
    const vratDoFronty = () => {
      const f = cekaRef.current
      for (const d of ceka.rozvrh) f.rozvrh.add(d)
      for (const d of ceka.reflexe) f.reflexe.add(d)
      f.poznamky = f.poznamky || ceka.poznamky
    }

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
      // Neodeslané se vrací do fronty: další uložení čehokoli je vezme
      // s sebou. Bez toho by jediný výpadek sítě text tiše ztratil, a stav
      // „Uloženo" po příštím úspěchu by tvrdil, že je všechno na serveru.
      vratDoFronty()
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
    // Telefon otevírá dnešek: týdenní dvoustrana je pracovna velké obrazovky,
    // na výšku drženém displeji se den vyplňuje rovnou, bez posouvání mřížky.
    if (window.innerWidth < 721) setZalozka("den")
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
      const puvodniHodnota = stavRef.current.dny.get(datumDne)?.ratings[metrika]
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
          // Vrací se jen tohle jedno číslo, ne snímek celého dne: během letu
          // požadavku mohl klient stihnout napsat text nebo uložit jinou
          // hodnotu a snímek by mu je z obrazovky smazal.
          upravDen(datumDne, (d) => ({
            ...d,
            ratings: { ...d.ratings, [metrika]: puvodniHodnota },
          }))
          setStav("chyba")
          setChyba(api.chybaText(e, t.chybaUlozeni))
        })
    },
    [upravDen, t.chybaUlozeni],
  )

  const onNavyk = useCallback(
    (datumDne: string, habitId: string, splneno: boolean) => {
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
          // Vrací se jen tohle jedno kolečko, ne snímek celého dne, ze
          // stejného důvodu jako u hodnocení.
          upravDen(datumDne, (d) => ({
            ...d,
            habits: splneno ? d.habits.filter((h) => h !== habitId) : [...d.habits, habitId],
          }))
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
      <div className="pl-root pl-prihlaseni">
        <div className="pl-prihlaseni-obal">
          <p className="pl-note">{t.nacitam}</p>
        </div>
      </div>
    )
  }

  if (!api.isRemoteEnabled()) {
    return (
      <div className="pl-root pl-prihlaseni">
        <div className="pl-prihlaseni-obal">
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
      <div className="pl-root pl-prihlaseni">
        <div className="pl-prihlaseni-obal pl-anim">
          <div className="pl-znacka">WINNING MINDS</div>
          <h1 className="pl-prihlaseni-titul">{t.appName}</h1>
          <p className="pl-prihlaseni-pod">{t.uvodniText}</p>

          <div className="pl-card pl-prihlaseni-karta">
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
              className="pl-btn pl-btn-akcent"
              style={{ width: "100%", marginTop: 16, minHeight: 46 }}
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

          <div
            style={{
              marginTop: 20,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
            }}
          >
            <div className="pl-tabs">
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
              style={{ fontSize: 13, color: "var(--wm-text-3)", textDecoration: "none" }}
            >
              Winning Minds
            </Link>
          </div>
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

  const nazevZalozky = (z: Zalozka) =>
    z === "tyden"
      ? t.tabTyden
      : z === "den"
        ? t.tabDen
        : z === "statistiky"
          ? t.tabStatistiky
          : z === "navyky"
            ? t.tabNavyky
            : t.tabUcet

  const prepni = (z: Zalozka) => {
    void odesli()
    setZalozka(z)
  }

  const naDnesku = zalozka === "tyden" ? monday === pondeli(dnesniDatum) : datum === dnesniDatum

  return (
    <div className="pl-root">
      <header className="pl-topbar pl-noprint">
        <div className="pl-topbar-inner">
          <span className="pl-brand pl-top-brand">WINNING MINDS</span>
          <div className="pl-tabs pl-top-tabs">
            {ZALOZKY.map((z) => (
              <button
                key={z}
                type="button"
                data-active={zalozka === z}
                aria-pressed={zalozka === z}
                onClick={() => prepni(z)}
              >
                {nazevZalozky(z)}
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
                aria-pressed={lang === j}
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
          <div className="pl-perioda pl-noprint">
            <div className="pl-perioda-nav">
              <button
                type="button"
                className="pl-btn pl-krok"
                aria-label={t.predchozi}
                onClick={() => void jdiNa(posun(datum, zalozka === "tyden" ? -7 : -1))}
              >
                ‹
              </button>
              <span className="pl-perioda-nazev">
                {zalozka === "tyden"
                  ? popisRozsahuTydne(monday, lang)
                  : `${NAZVY_DNU[lang][indexDne(datum)]} · ${dlouheDatum(datum, lang)}`}
              </span>
              <button
                type="button"
                className="pl-btn pl-krok"
                aria-label={t.dalsi}
                onClick={() => void jdiNa(posun(datum, zalozka === "tyden" ? 7 : 1))}
              >
                ›
              </button>
              {!naDnesku && (
                <button type="button" className="pl-chip" onClick={() => void jdiNa(dnesniDatum)}>
                  {t.dnes}
                </button>
              )}
            </div>
            <div className="pl-perioda-akce">
              <button type="button" className="pl-btn pl-btn-quiet" onClick={() => window.print()}>
                {t.tisk}
              </button>
              <button type="button" className="pl-btn" onClick={() => void exportPdf()}>
                {t.pdf}
              </button>
              {nacitam && <span className="pl-status">{t.nacitam}</span>}
            </div>
          </div>
        )}

        {chyba && (
          <p className="pl-note pl-noprint" style={{ color: "var(--wm-red)" }}>
            {chyba}
          </p>
        )}

        {/* Klíč podle záložky: obsah při přepnutí nastoupí zespodu. Při psaní
            uvnitř záložky se klíč nemění, takže se nic neopakuje. */}
        <div key={zalozka} className="pl-anim">
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

      {/* Spodní navigace telefonu. Na širokých obrazovkách ji CSS skryje,
          tam záložky sedí nahoře; palec na telefonu ale dosáhne dolů. */}
      <nav className="pl-dolninav pl-noprint" aria-label={t.appName}>
        {ZALOZKY.map((z) => (
          <button
            key={z}
            type="button"
            data-active={zalozka === z}
            aria-pressed={zalozka === z}
            onClick={() => prepni(z)}
          >
            <IkonaZalozky z={z} />
            <span>{nazevZalozky(z)}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}
