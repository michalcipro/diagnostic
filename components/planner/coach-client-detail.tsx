"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import type { Lang } from "@/lib/diagnostic/types"
import { cislo, NAZVY_METRIK, UI, zmenaText } from "@/lib/planner/i18n"
import { METRIKY, ROZSAH } from "@/lib/planner/types"
import type { MetricKey } from "@/lib/planner/types"
import { dnes, kratkeDatum, pondeli, posun, posunMesic, rozsahMesice } from "@/lib/planner/datum"
import { bodVyvoje, spocitejStatistiku } from "@/lib/planner/stats"
import type { Statistika } from "@/lib/planner/stats"
import * as api from "@/lib/planner/remote"
import type { DenikKlienta } from "@/lib/planner/remote"
import { CaraGraf } from "./charts"
import type { Bod } from "./charts"

// Deník klienta z pohledu kouče.
//
// Co se sem dostane, rozhoduje server podle úrovně sdílení. Obrazovka sama
// nefiltruje nic: kdyby filtrovala, byla by jedinou ochranou textů a dala by
// se obejít otevřením síťové karty v prohlížeči. Tady se jen ukazuje, co
// přišlo, a dopisuje se, co nepřišlo a proč.
//
// Čísla se nepočítají na serveru, ale tady, stejnými funkcemi ze
// lib/planner/stats.ts, jakými si je počítá klient. Kouč tak vidí přesně ta
// čísla, která vidí klient, ne druhou verzi pravdy.

export interface CoachClientDetailProps {
  sessionToken: string
  clientId: string
  lang: Lang
  onZavrit: () => void
}

type Obdobi = "mesic" | "kvartal" | "rok"

const MESICU: Record<Obdobi, number> = { mesic: 1, kvartal: 3, rok: 12 }

const NAZEV_OBDOBI: Record<Lang, Record<Obdobi, string>> = {
  cs: { mesic: "Měsíc", kvartal: "Čtvrtletí", rok: "Rok" },
  en: { mesic: "Month", kvartal: "Quarter", rok: "Year" },
  sk: { mesic: "Mesiac", kvartal: "Štvrťrok", rok: "Rok" },
}

/** Zobrazené období a stejně dlouhé období před ním, kvůli změnám. */
function spoctiRozsah(obdobi: Obdobi, dnesniDatum: string) {
  const pocet = MESICU[obdobi]
  const posledni = dnesniDatum.slice(0, 7)
  const prvni = posunMesic(posledni, -(pocet - 1))
  return {
    od: rozsahMesice(prvni).od,
    do: rozsahMesice(posledni).do,
    predchozi: {
      od: rozsahMesice(posunMesic(prvni, -pocet)).od,
      do: rozsahMesice(posunMesic(prvni, -1)).do,
    },
  }
}

function datum(ms: number | undefined, lang: Lang): string {
  if (!ms) return "–"
  const d = new Date(ms)
  return lang === "en"
    ? d.toISOString().slice(0, 10)
    : `${d.getDate()}. ${d.getMonth() + 1}. ${d.getFullYear()}`
}

export function CoachClientDetail({
  sessionToken,
  clientId,
  lang,
  onZavrit,
}: CoachClientDetailProps) {
  const t = UI[lang]
  // Jednou při otevření: kdyby se datum počítalo při každém překreslení,
  // změnilo by se uprostřed práce o půlnoci a čísla by uskočila.
  const [dnesniDatum] = useState(() => dnes())
  const [obdobi, setObdobi] = useState<Obdobi>("mesic")
  const [grafMetrika, setGrafMetrika] = useState<MetricKey>("energy")
  const [data, setData] = useState<DenikKlienta | null>(null)
  const [chyba, setChyba] = useState<string | null>(null)
  const [nacita, setNacita] = useState(true)

  const rozsah = useMemo(() => spoctiRozsah(obdobi, dnesniDatum), [obdobi, dnesniDatum])

  const nacti = useCallback(async () => {
    setNacita(true)
    try {
      // Načítá se i předchozí období, jinak by nešly spočítat změny.
      const d = await api.plannerClientDetail(
        sessionToken,
        clientId,
        rozsah.predchozi.od,
        rozsah.do,
      )
      setData(d)
      setChyba(null)
    } catch (e) {
      setChyba(api.chybaText(e, "Deník se nepodařilo načíst."))
    } finally {
      setNacita(false)
    }
  }, [sessionToken, clientId, rozsah])

  useEffect(() => {
    void nacti()
  }, [nacti])

  const stat: Statistika | null = useMemo(() => {
    if (!data) return null
    return spocitejStatistiku({
      dny: data.days,
      navyky: data.habits,
      od: rozsah.od,
      do: rozsah.do,
      predchozi: rozsah.predchozi,
      dnesniDatum,
    })
  }, [data, rozsah, dnesniDatum])

  /** Body grafu: u měsíce týdny, u delších období měsíce. */
  const vyvoj: Bod[] = useMemo(() => {
    if (!data) return []
    if (obdobi === "mesic") {
      const body: Bod[] = []
      let m = pondeli(rozsah.od)
      while (m <= rozsah.do) {
        const od = m < rozsah.od ? rozsah.od : m
        const konec = posun(m, 6)
        const do_ = konec > rozsah.do ? rozsah.do : konec
        const b = bodVyvoje(m, data.days, data.habits, od, do_, dnesniDatum)
        body.push({ klic: m, hodnota: b.metriky[grafMetrika], popisek: kratkeDatum(od, lang) })
        m = posun(m, 7)
      }
      return body
    }
    const body: Bod[] = []
    let mes = rozsah.od.slice(0, 7)
    const posledni = rozsah.do.slice(0, 7)
    while (mes <= posledni) {
      const { od, do: do_ } = rozsahMesice(mes)
      const b = bodVyvoje(mes, data.days, data.habits, od, do_, dnesniDatum)
      body.push({
        klic: mes,
        hodnota: b.metriky[grafMetrika],
        popisek: String(Number(mes.slice(5, 7))),
      })
      mes = posunMesic(mes, 1)
    }
    return body
  }, [data, obdobi, rozsah, grafMetrika, dnesniDatum, lang])

  return (
    <div className="pl-card" style={{ marginTop: 14 }}>
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          gap: 14,
          flexWrap: "wrap",
          justifyContent: "space-between",
        }}
      >
        <div>
          <h3 style={{ margin: 0, fontSize: 19, fontWeight: 700, letterSpacing: "-0.015em" }}>
            {data?.name ?? t.nacitam}
          </h3>
          {data && (
            <p className="pl-card-note" style={{ marginTop: 4 }}>
              {data.email} · deník od {datum(data.createdAt, lang)}
            </p>
          )}
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <div className="pl-tabs">
            {(["mesic", "kvartal", "rok"] as Obdobi[]).map((o) => (
              <button key={o} type="button" data-active={obdobi === o} onClick={() => setObdobi(o)}>
                {NAZEV_OBDOBI[lang][o]}
              </button>
            ))}
          </div>
          <button type="button" className="pl-btn pl-btn-quiet" onClick={onZavrit}>
            Zavřít
          </button>
        </div>
      </div>

      {chyba && (
        <p className="pl-note" style={{ color: "var(--wm-red)" }}>
          {chyba}
        </p>
      )}
      {nacita && !data && <p className="pl-note">{t.nacitam}</p>}

      {data && data.sdileni === "nic" && (
        <p className="pl-zamek">
          Tenhle klient ti obsah deníku nesdílí. Vidíš jen to, že si ho vede: {data.dnu} dnů,
          naposledy {datum(data.lastActivityAt, lang)}. Úroveň změníš v seznamu klientů, ale
          domluv se na tom s ním. Uvidí to na svém účtu.
        </p>
      )}

      {data && stat && data.sdileni !== "nic" && (
        <>
          <div className="pl-cards">
            <div className="pl-card">
              <div className="pl-card-label">Vyplněno</div>
              <div className="pl-card-value">{stat.vyplnenychDnu}</div>
              <div className="pl-card-note">z {stat.dnuCelkem} dnů období</div>
            </div>
            <div className="pl-card">
              <div className="pl-card-label">Série</div>
              <div className="pl-card-value">{stat.serieVedeni}</div>
              <div className="pl-card-note">nejdelší {stat.nejdelsiSerieVedeni} dnů</div>
            </div>
            <div className="pl-card">
              <div className="pl-card-label">Návyky</div>
              <div className="pl-card-value">
                {stat.navykyCelkem.uspesnost === undefined
                  ? "–"
                  : `${Math.round(stat.navykyCelkem.uspesnost * 100)} %`}
              </div>
              <div className="pl-card-note">
                {stat.navykyCelkem.splneno} z {stat.navykyCelkem.moznych} možných
              </div>
            </div>
            <div className="pl-card">
              <div className="pl-card-label">Naposledy psal</div>
              <div className="pl-card-value" style={{ fontSize: 22 }}>
                {datum(data.lastActivityAt, lang)}
              </div>
              <div className="pl-card-note">přihlášení {datum(data.lastLoginAt, lang)}</div>
            </div>
          </div>

          {/* ── ukazatele ─────────────────────────────────────────────── */}
          <div className="pl-card" style={{ marginTop: 16 }}>
            <div className="pl-card-label">Ukazatele</div>
            <table className="pl-table" style={{ marginTop: 8 }}>
              <thead>
                <tr>
                  <th>Ukazatel</th>
                  <th className="pl-num">Průměr</th>
                  <th className="pl-num">Změna</th>
                  <th className="pl-num">Dnů</th>
                </tr>
              </thead>
              <tbody>
                {METRIKY.map((klic) => {
                  const m = stat.metriky.find((x) => x.klic === klic)
                  return (
                    <tr key={klic}>
                      <td>{NAZVY_METRIK[lang][klic]}</td>
                      <td className="pl-num">
                        {m?.prumer === undefined ? "–" : cislo(m.prumer, lang)}
                      </td>
                      <td
                        className="pl-num"
                        style={{
                          color:
                            m?.zmena === undefined || Math.abs(m.zmena) < 0.05
                              ? "var(--wm-text-3)"
                              : m.zmena > 0
                                ? "var(--wm-ok-fg)"
                                : "var(--wm-caution-fg)",
                        }}
                      >
                        {m?.zmena === undefined ? "–" : zmenaText(m.zmena, lang)}
                      </td>
                      <td className="pl-num" style={{ color: "var(--wm-text-3)" }}>
                        {m?.pocet ?? 0}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginTop: 18,
                flexWrap: "wrap",
              }}
            >
              <span className="pl-card-label">Vývoj</span>
              <select
                className="pl-input"
                style={{ width: "auto", padding: "6px 10px" }}
                value={grafMetrika}
                onChange={(e) => setGrafMetrika(e.target.value as MetricKey)}
                aria-label="Ukazatel v grafu"
              >
                {METRIKY.map((m) => (
                  <option key={m} value={m}>
                    {NAZVY_METRIK[lang][m]}
                  </option>
                ))}
              </select>
            </div>
            <div style={{ marginTop: 10 }}>
              <CaraGraf
                body={vyvoj}
                min={ROZSAH[grafMetrika].min}
                max={ROZSAH[grafMetrika].max}
                popisHodnoty={(v) => cislo(v, lang, 1)}
              />
            </div>
          </div>

          {/* ── návyky ────────────────────────────────────────────────── */}
          {stat.navyky.length > 0 && (
            <div className="pl-card" style={{ marginTop: 16 }}>
              <div className="pl-card-label">Návyky</div>
              <table className="pl-table" style={{ marginTop: 8 }}>
                <thead>
                  <tr>
                    <th>Návyk</th>
                    <th className="pl-num">Splněno</th>
                    <th className="pl-num">Úspěšnost</th>
                    <th className="pl-num">Série</th>
                    <th className="pl-num">Nejdelší</th>
                  </tr>
                </thead>
                <tbody>
                  {stat.navyky.map((n) => (
                    <tr key={n.habitId} style={{ opacity: n.archivovany ? 0.55 : 1 }}>
                      <td>{n.name}</td>
                      <td className="pl-num">
                        {n.splneno} / {n.moznych}
                      </td>
                      <td className="pl-num">
                        {n.uspesnost === undefined ? "–" : `${Math.round(n.uspesnost * 100)} %`}
                      </td>
                      <td className="pl-num">{n.aktualniSerie}</td>
                      <td className="pl-num">{n.nejdelsiSerie}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ── vliv návyku ───────────────────────────────────────────── */}
          {stat.vlivNavyku.length > 0 && (
            <div className="pl-card" style={{ marginTop: 16 }}>
              <div className="pl-card-label">Vliv návyku</div>
              <ul
                style={{
                  margin: "10px 0 0",
                  paddingLeft: 18,
                  display: "grid",
                  gap: 8,
                  fontSize: 14.5,
                  lineHeight: 1.5,
                }}
              >
                {stat.vlivNavyku.slice(0, 5).map((v) => (
                  <li key={`${v.habitId}-${v.metrika}`}>
                    Ve dnech s návykem <strong>{v.name}</strong> má{" "}
                    {NAZVY_METRIK[lang][v.metrika].toLowerCase()} {v.rozdil > 0 ? "vyšší" : "nižší"}{" "}
                    o <strong>{cislo(Math.abs(v.rozdil), lang)}</strong>
                    <span style={{ color: "var(--wm-text-3)" }}>
                      {" "}
                      ({v.dnuS} dnů s návykem, {v.dnuBez} bez)
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {!data.texty && (
            <p className="pl-zamek">
              Rozvrh dne, reflexe a poznámky se nezobrazují. Klient o tom ví: na svém účtu vidí,
              že mu čteš čísla a texty ne.
            </p>
          )}
        </>
      )}
    </div>
  )
}
