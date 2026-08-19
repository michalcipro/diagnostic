"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { applyGender } from "@/lib/diagnostic/gender"
import type { Gender, Lang } from "@/lib/diagnostic/types"
import { NAZVY_METRIK, UI, cislo, zmenaText } from "@/lib/planner/i18n"
import { METRIKY, ROZSAH, type MetricKey, type PlannerDay, type PlannerHabit } from "@/lib/planner/types"
import {
  ZKRATKY_DNU,
  dnyTydne,
  kratkeDatum,
  mesiceRoku,
  pondeli,
  popisMesice,
  popisRozsahuTydne,
  posun,
  posunMesic,
  rozsahMesice,
  rozsahRoku,
} from "@/lib/planner/datum"
import { bodVyvoje, denniSkore, dnyRozsahu, mapaDnu, spocitejStatistiku, type Statistika } from "@/lib/planner/stats"
import { shrnuti, type Obdobi } from "@/lib/planner/shrnuti"
import { chybaText, getRange } from "@/lib/planner/remote"
import { CaraGraf, MapaRoku, Pruh, SloupceGraf, type Bod, type PoleDne } from "./charts"

// Statistiky deníku: týden, měsíc, rok.
//
// Data se načítají jedním rozsahovým dotazem a všechno ostatní se dopočítá
// tady v prohlížeči čistými funkcemi z lib/planner/stats.ts. Server tak
// nemusí umět pět různých agregací a čísla se dají ověřit na jednom místě.
//
// Rozsah se schválně načítá širší, než je zobrazené období: série návyků
// pokračují přes hranici měsíce a bez části minulosti by se každého prvního
// vynulovaly.

export interface StatsPanelProps {
  sessionToken: string
  lang: Lang
  gender: Gender
  dnesniDatum: string
}

interface Rozsah {
  /** co se načte ze serveru */
  nactiOd: string
  nactiDo: string
  /** hranice zobrazeného období */
  od: string
  do: string
  /** předchozí srovnatelné období */
  predchozi: { od: string; do: string }
  popis: string
}

/** Kolik dnů minulosti se přibírá kvůli sériím. */
const ZAHLAVI_DNU = 75

function spoctiRozsah(obdobi: Obdobi, kotva: string, lang: Lang): Rozsah {
  if (obdobi === "tyden") {
    const od = kotva
    const do_ = posun(kotva, 6)
    return {
      nactiOd: posun(od, -ZAHLAVI_DNU),
      nactiDo: do_,
      od,
      do: do_,
      predchozi: { od: posun(od, -7), do: posun(od, -1) },
      popis: popisRozsahuTydne(od, lang),
    }
  }
  if (obdobi === "mesic") {
    const { od, do: do_ } = rozsahMesice(kotva)
    const minuly = rozsahMesice(posunMesic(kotva, -1))
    return {
      nactiOd: posun(minuly.od, -ZAHLAVI_DNU),
      nactiDo: do_,
      od,
      do: do_,
      predchozi: { od: minuly.od, do: minuly.do },
      popis: popisMesice(kotva, lang),
    }
  }
  const { od, do: do_ } = rozsahRoku(kotva)
  const minuly = rozsahRoku(String(Number(kotva) - 1))
  return {
    // Dva roky jsou přesně na serverovém stropu, takže se sem načte loňsko
    // celé a série i srovnání s minulým rokem vycházejí z opravdových dat.
    nactiOd: minuly.od,
    nactiDo: do_,
    od,
    do: do_,
    predchozi: { od: minuly.od, do: minuly.do },
    popis: kotva,
  }
}

/** Posun kotvy o jedno období dopředu nebo dozadu. */
function posunKotvu(obdobi: Obdobi, kotva: string, smer: -1 | 1): string {
  if (obdobi === "tyden") return posun(kotva, smer * 7)
  if (obdobi === "mesic") return posunMesic(kotva, smer)
  return String(Number(kotva) + smer)
}

function Sipka({
  smer,
  onClick,
  popis,
}: {
  smer: "levo" | "pravo"
  onClick: () => void
  popis: string
}) {
  return (
    <button type="button" className="pl-btn" onClick={onClick} aria-label={popis} title={popis}>
      {smer === "levo" ? "‹" : "›"}
    </button>
  )
}

function Zmena({ hodnota, lang, jednotka }: { hodnota?: number; lang: Lang; jednotka?: string }) {
  if (hodnota === undefined) return null
  const dir = Math.abs(hodnota) < 0.05 ? "flat" : hodnota > 0 ? "up" : "down"
  return (
    <span className="pl-delta" data-dir={dir}>
      {zmenaText(hodnota, lang)}
      {jednotka ? ` ${jednotka}` : ""}
    </span>
  )
}

export function StatsPanel({ sessionToken, lang, gender, dnesniDatum }: StatsPanelProps) {
  const t = UI[lang]
  const [obdobi, setObdobi] = useState<Obdobi>("tyden")
  const [kotva, setKotva] = useState<string>(() => pondeli(dnesniDatum))
  const [dny, setDny] = useState<PlannerDay[] | null>(null)
  const [navyky, setNavyky] = useState<PlannerHabit[]>([])
  const [chyba, setChyba] = useState<string | null>(null)
  const [nacitam, setNacitam] = useState(true)
  const [grafMetrika, setGrafMetrika] = useState<"skore" | MetricKey>("skore")

  const rozsah = useMemo(() => spoctiRozsah(obdobi, kotva, lang), [obdobi, kotva, lang])

  /** Přepnutí období přenese kotvu na odpovídající úsek téhož dne. */
  const prepniObdobi = useCallback(
    (nove: Obdobi) => {
      const den = obdobi === "tyden" ? kotva : obdobi === "mesic" ? `${kotva}-01` : `${kotva}-01-01`
      setObdobi(nove)
      setKotva(nove === "tyden" ? pondeli(den) : nove === "mesic" ? den.slice(0, 7) : den.slice(0, 4))
    },
    [obdobi, kotva],
  )

  useEffect(() => {
    let zruseno = false
    setNacitam(true)
    setChyba(null)
    getRange(sessionToken, rozsah.nactiOd, rozsah.nactiDo)
      .then((r) => {
        if (zruseno) return
        setDny(r.days)
        setNavyky(r.habits)
      })
      .catch((e) => {
        if (zruseno) return
        setChyba(chybaText(e, t.chybaUlozeni))
        setDny([])
      })
      .finally(() => {
        if (!zruseno) setNacitam(false)
      })
    return () => {
      zruseno = true
    }
  }, [sessionToken, rozsah.nactiOd, rozsah.nactiDo, t.chybaUlozeni])

  const stat: Statistika | null = useMemo(() => {
    if (!dny) return null
    return spocitejStatistiku({
      dny,
      navyky,
      od: rozsah.od,
      do: rozsah.do,
      predchozi: rozsah.predchozi,
      dnesniDatum,
    })
  }, [dny, navyky, rozsah, dnesniDatum])

  // ── body grafu vývoje ─────────────────────────────────────────────────────
  const vyvoj: Bod[] = useMemo(() => {
    if (!dny) return []
    const hodnota = (b: ReturnType<typeof bodVyvoje>) =>
      grafMetrika === "skore" ? b.skore : b.metriky[grafMetrika]

    if (obdobi === "tyden") {
      const mapa = mapaDnu(dny)
      return dnyTydne(rozsah.od).map((d, i) => {
        const den = mapa.get(d)
        const v =
          grafMetrika === "skore" ? (den ? denniSkore(den) : undefined) : den?.ratings[grafMetrika]
        return { klic: d, hodnota: d <= dnesniDatum ? v : undefined, popisek: ZKRATKY_DNU[lang][i] }
      })
    }
    if (obdobi === "mesic") {
      // Body měsíce jsou týdny, ořezané na hranice měsíce, ať se první a
      // poslední týden nepočítají z dnů, které do měsíce nepatří.
      const tydny: Bod[] = []
      let m = pondeli(rozsah.od)
      while (m <= rozsah.do) {
        const od = m < rozsah.od ? rozsah.od : m
        const konec = posun(m, 6)
        const do_ = konec > rozsah.do ? rozsah.do : konec
        const b = bodVyvoje(m, dny, navyky, od, do_, dnesniDatum)
        tydny.push({ klic: m, hodnota: hodnota(b), popisek: kratkeDatum(od, lang) })
        m = posun(m, 7)
      }
      return tydny
    }
    return mesiceRoku(rozsah.od.slice(0, 4)).map((mes) => {
      const { od, do: do_ } = rozsahMesice(mes)
      const b = bodVyvoje(mes, dny, navyky, od, do_, dnesniDatum)
      return { klic: mes, hodnota: hodnota(b), popisek: String(Number(mes.slice(5, 7))) }
    })
  }, [dny, navyky, obdobi, rozsah, grafMetrika, lang, dnesniDatum])

  const grafRozsah = useMemo(() => {
    if (grafMetrika === "skore") return { min: 1, max: 10 }
    const r = ROZSAH[grafMetrika]
    return { min: r.min, max: r.max }
  }, [grafMetrika])

  // ── mapa roku ─────────────────────────────────────────────────────────────
  const mapaRoku: PoleDne[] = useMemo(() => {
    if (obdobi !== "rok" || !dny) return []
    const mapa = mapaDnu(dny)
    return dnyRozsahu(rozsah.od, rozsah.do).map((d) => {
      const den = mapa.get(d)
      const s = den ? denniSkore(den) : undefined
      return {
        datum: d,
        uroven: typeof s === "number" ? Math.max(0, Math.min(1, (s - 1) / 9)) : undefined,
        popisek: `${d}: ${typeof s === "number" ? cislo(s, lang, 1) : "–"}`,
      }
    })
  }, [obdobi, dny, rozsah, lang])

  const vety = useMemo(
    () => (stat ? shrnuti(stat, obdobi, lang, gender) : []),
    [stat, obdobi, lang, gender],
  )

  const prazdno = stat !== null && stat.vyplnenychDnu === 0

  return (
    <div style={{ marginTop: 16 }}>
      {/* ── ovládání období ──────────────────────────────────────────────── */}
      <div
        className="pl-noprint"
        style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}
      >
        <div className="pl-tabs">
          {(["tyden", "mesic", "rok"] as Obdobi[]).map((o) => (
            <button
              key={o}
              type="button"
              data-active={obdobi === o}
              onClick={() => prepniObdobi(o)}
            >
              {o === "tyden" ? t.statTyden : o === "mesic" ? t.statMesic : t.statRok}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <Sipka smer="levo" popis={t.predchozi} onClick={() => setKotva(posunKotvu(obdobi, kotva, -1))} />
          <span style={{ minWidth: 168, textAlign: "center", fontSize: 14, fontWeight: 600 }}>
            {rozsah.popis}
          </span>
          <Sipka smer="pravo" popis={t.dalsi} onClick={() => setKotva(posunKotvu(obdobi, kotva, 1))} />
        </div>
        <button
          type="button"
          className="pl-btn"
          onClick={() =>
            setKotva(
              obdobi === "tyden"
                ? pondeli(dnesniDatum)
                : obdobi === "mesic"
                  ? dnesniDatum.slice(0, 7)
                  : dnesniDatum.slice(0, 4),
            )
          }
        >
          {t.dnes}
        </button>
        {nacitam && <span className="pl-status">{t.nacitam}</span>}
      </div>

      {chyba && (
        <p className="pl-note" style={{ color: "var(--wm-red)", marginTop: 12 }}>
          {chyba}
        </p>
      )}

      {stat && prazdno && (
        <p className="pl-note" style={{ marginTop: 20 }}>
          {t.statZadnaData}
        </p>
      )}

      {stat && !prazdno && (
        <>
          {/* ── přehledové karty ──────────────────────────────────────────── */}
          <div className="pl-cards">
            <div className="pl-card">
              <div className="pl-card-label">{t.statDenniSkore}</div>
              <div className="pl-card-value">
                {stat.skore !== undefined ? cislo(stat.skore, lang, 1) : "–"}
                <span style={{ fontSize: 15, color: "var(--wm-text-3)", fontWeight: 600 }}> / 10</span>
              </div>
              <div className="pl-card-note">
                <Zmena hodnota={stat.skoreZmena} lang={lang} /> {stat.skoreZmena !== undefined ? t.statProtiMinulemu : ""}
              </div>
            </div>

            <div className="pl-card">
              <div className="pl-card-label">{t.statVyplnenychDnu}</div>
              <div className="pl-card-value">
                {stat.vyplnenychDnu}
                <span style={{ fontSize: 15, color: "var(--wm-text-3)", fontWeight: 600 }}>
                  {" "}
                  / {stat.dnuCelkem}
                </span>
              </div>
              <div className="pl-card-note">
                {t.statReflexe}: {Math.round((stat.reflexe.podil ?? 0) * 100)} %
              </div>
            </div>

            <div className="pl-card">
              <div className="pl-card-label">{t.statSerie}</div>
              <div className="pl-card-value">{stat.serieVedeni}</div>
              <div className="pl-card-note">
                {t.statNejdelsiSerie}: {stat.nejdelsiSerieVedeni} {t.dnu}
              </div>
            </div>

            <div className="pl-card">
              <div className="pl-card-label">{t.statNavyky}</div>
              <div className="pl-card-value">
                {stat.navykyCelkem.uspesnost !== undefined
                  ? `${Math.round(stat.navykyCelkem.uspesnost * 100)} %`
                  : "–"}
              </div>
              <div className="pl-card-note">
                {stat.navykyCelkem.splneno} / {stat.navykyCelkem.moznych}{" "}
                <Zmena hodnota={stat.navykyCelkem.zmena} lang={lang} jednotka="b." />
              </div>
            </div>

            <div className="pl-card">
              <div className="pl-card-label">{t.statNaplanovanychHodin}</div>
              <div className="pl-card-value">{stat.rozvrh.hodin}</div>
              <div className="pl-card-note">
                {stat.rozvrh.dnuSPlanem} {t.dnu}
              </div>
            </div>
          </div>

          {/* ── vývoj ────────────────────────────────────────────────────── */}
          <div className="pl-card" style={{ marginTop: 14 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 10,
                flexWrap: "wrap",
              }}
            >
              <div className="pl-card-label">{t.statVyvoj}</div>
              <select
                className="pl-input pl-noprint"
                style={{ width: "auto", padding: "5px 10px", fontSize: 13 }}
                value={grafMetrika}
                onChange={(e) => setGrafMetrika(e.target.value as "skore" | MetricKey)}
                aria-label={t.statVyvoj}
              >
                <option value="skore">{t.statDenniSkore}</option>
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
                min={grafRozsah.min}
                max={grafRozsah.max}
                popisHodnoty={(v) => cislo(v, lang, 1)}
              />
            </div>
          </div>

          {/* ── návyky ───────────────────────────────────────────────────── */}
          {stat.navyky.length > 0 && (
            <div className="pl-card" style={{ marginTop: 14 }}>
              <div className="pl-card-label">{t.statNavyky}</div>
              <table className="pl-table" style={{ marginTop: 8 }}>
                <thead>
                  <tr>
                    <th>{t.nazevNavyku}</th>
                    <th className="pl-num">{t.statSplneno}</th>
                    <th style={{ width: "26%" }}>{t.statUspesnost}</th>
                    <th className="pl-num">{t.statSerie}</th>
                    <th className="pl-num">{t.statZmena}</th>
                  </tr>
                </thead>
                <tbody>
                  {stat.navyky
                    .filter((n) => n.moznych > 0 || n.splneno > 0)
                    .map((n) => (
                      <tr key={n.habitId}>
                        <td>
                          {n.name}
                          {n.archivovany && (
                            <span style={{ color: "var(--wm-text-3)", fontSize: 12 }}>
                              {" "}
                              · {t.archivovane.toLowerCase()}
                            </span>
                          )}
                        </td>
                        <td className="pl-num">
                          {n.splneno} / {n.moznych}
                        </td>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <div style={{ flex: 1 }}>
                              <Pruh podil={n.uspesnost ?? 0} />
                            </div>
                            <span
                              className="pl-num"
                              style={{ minWidth: 38, fontSize: 12, color: "var(--wm-text-2)" }}
                            >
                              {n.uspesnost !== undefined ? `${Math.round(n.uspesnost * 100)} %` : "–"}
                            </span>
                          </div>
                        </td>
                        <td className="pl-num">
                          {n.aktualniSerie}
                          <span style={{ color: "var(--wm-text-3)" }}> / {n.nejdelsiSerie}</span>
                        </td>
                        <td className="pl-num">
                          <Zmena hodnota={n.zmena} lang={lang} jednotka="b." />
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ── ukazatele ────────────────────────────────────────────────── */}
          <div className="pl-card" style={{ marginTop: 14 }}>
            <div className="pl-card-label">{t.statUkazatele}</div>
            <table className="pl-table" style={{ marginTop: 8 }}>
              <thead>
                <tr>
                  <th>{t.statPrehled}</th>
                  <th className="pl-num">{t.statPrumer}</th>
                  <th className="pl-num">{t.statRozsah}</th>
                  <th className="pl-num">{t.dnu}</th>
                  <th className="pl-num">{t.statZmena}</th>
                </tr>
              </thead>
              <tbody>
                {stat.metriky.map((m) => (
                  <tr key={m.klic}>
                    <td>{NAZVY_METRIK[lang][m.klic]}</td>
                    <td className="pl-num" style={{ fontWeight: 600 }}>
                      {m.prumer !== undefined ? cislo(m.prumer, lang, 1) : "–"}
                    </td>
                    <td className="pl-num" style={{ color: "var(--wm-text-2)" }}>
                      {m.min !== undefined && m.max !== undefined
                        ? `${cislo(m.min, lang, m.klic === "sleep" ? 1 : 0)} – ${cislo(m.max, lang, m.klic === "sleep" ? 1 : 0)}`
                        : "–"}
                    </td>
                    <td className="pl-num" style={{ color: "var(--wm-text-2)" }}>
                      {m.pocet}
                    </td>
                    <td className="pl-num">
                      <Zmena hodnota={m.zmena} lang={lang} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="pl-note" style={{ marginTop: 10 }}>
              {t.statDenniSkoreVysvetleni}
            </p>
          </div>

          {/* ── podle dnů v týdnu ────────────────────────────────────────── */}
          {obdobi !== "tyden" && (
            <div className="pl-card" style={{ marginTop: 14 }}>
              <div className="pl-card-label">{t.statPodleDnu}</div>
              <div style={{ marginTop: 10 }}>
                <SloupceGraf
                  body={stat.podleDnuVTydnu.map((d) => ({
                    klic: String(d.index),
                    hodnota: d.skore,
                    popisek: ZKRATKY_DNU[lang][d.index],
                  }))}
                  max={10}
                  popisHodnoty={(v) => cislo(v, lang, 1)}
                />
              </div>
              <p className="pl-note" style={{ marginTop: 8 }}>
                {t.statPodleDnuVysvetleni}
              </p>
            </div>
          )}

          {/* ── mapa roku ────────────────────────────────────────────────── */}
          {obdobi === "rok" && mapaRoku.length > 0 && (
            <div className="pl-card" style={{ marginTop: 14 }}>
              <div className="pl-card-label">
                {t.statDenniSkore} · {rozsah.popis}
              </div>
              <div style={{ marginTop: 10 }}>
                <MapaRoku dny={mapaRoku} zkratkyDnu={ZKRATKY_DNU[lang]} />
              </div>
            </div>
          )}

          {/* ── souvislosti ──────────────────────────────────────────────── */}
          {obdobi !== "tyden" && (
            <div className="pl-card" style={{ marginTop: 14 }}>
              <div className="pl-card-label">{t.statVliv}</div>
              {stat.vlivNavyku.length === 0 ? (
                <p className="pl-note" style={{ marginTop: 8 }}>
                  {t.statMaloDat}
                </p>
              ) : (
                <table className="pl-table" style={{ marginTop: 8 }}>
                  <tbody>
                    {stat.vlivNavyku.slice(0, 6).map((v) => (
                      <tr key={`${v.habitId}-${v.metrika}`}>
                        <td>
                          {v.name} · {NAZVY_METRIK[lang][v.metrika]}
                        </td>
                        <td className="pl-num">
                          {cislo(v.sNavykem, lang, 1)} {t.statVlivRadek}
                        </td>
                        <td className="pl-num" style={{ color: "var(--wm-text-2)" }}>
                          {cislo(v.bezNavyku, lang, 1)}
                        </td>
                        <td className="pl-num">
                          <Zmena hodnota={v.rozdil} lang={lang} />
                        </td>
                        <td className="pl-num" style={{ color: "var(--wm-text-3)", fontSize: 12 }}>
                          {v.dnuS} / {v.dnuBez} {t.dnu}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              <p className="pl-note" style={{ marginTop: 10 }}>
                {t.statVlivVysvetleni}
              </p>
            </div>
          )}

          {/* ── shrnutí ──────────────────────────────────────────────────── */}
          <div className="pl-card" style={{ marginTop: 14 }}>
            <div className="pl-card-label">{t.statShrnuti}</div>
            <div style={{ marginTop: 8 }}>
              {vety.map((v, i) => (
                <p
                  key={i}
                  className="pl-note"
                  style={{ margin: "0 0 8px", fontSize: 14, color: "var(--wm-text)" }}
                >
                  {applyGender(v, gender)}
                </p>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
