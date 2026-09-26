"use client"

import { useMemo } from "react"
import { applyGender } from "@/lib/diagnostic/gender"
import { DoporuceniOdbornika } from "@/components/diagnostic/doporuceni-odbornika"
import type { ResultDetail } from "@/lib/diagnostic/remote"
import { KONTEXT_OTAZKY } from "@/lib/elitepro/dotaznik"
import {
  CHRONOTYP_SLOVO,
  OBLASTI,
  PASMO_SLOVO,
  STRES_SLOVO,
  pasmo,
  shrnuti,
  vyhodnot,
  type Pasmo,
} from "@/lib/profil360/profil"

// Report Profilu 360 pro kouče.
//
// Pořadí je od toho, co kouč potřebuje hned (typ, sportovní profil, silné
// stránky a rizika, doporučení), k podkladům (osobnost po fazetách, 24
// silných stránek, motivace, stres a spánek). Na konci shrnutí pro
// sportovce ve druhé osobě, které se dá předat, jak je.

const CAS = (h: number) => {
  const m = Math.round(h * 60) % 1440
  return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`
}

function Pruh({ hodnota, barva }: { hodnota: number | null; barva?: Pasmo }) {
  return (
    <div className={barva ? `diag-band-${barva}` : undefined}>
      <div className="diag-bar-track">
        <div
          className="diag-bar-fill"
          style={{
            width: `${Math.max(2, hodnota ?? 0)}%`,
            ...(barva ? {} : { background: "var(--wm-text-3)" }),
          }}
        />
      </div>
    </div>
  )
}

function Radek({
  nazev,
  popis,
  hodnota,
  barva,
  slovo,
  maly,
}: {
  nazev: string
  popis?: string
  hodnota: number | null
  barva?: Pasmo
  slovo?: string
  maly?: boolean
}) {
  return (
    <div className={maly ? "py-2" : "py-3"}>
      <div className="mb-1.5 flex items-baseline justify-between gap-3">
        <span className={maly ? "min-w-0 text-[13.5px] text-[var(--wm-text-2)]" : "min-w-0 text-[15px] font-semibold"}>
          {nazev}
        </span>
        <span className="flex shrink-0 items-baseline gap-2 whitespace-nowrap">
          {slovo &&
            (barva && !maly ? (
              <span className={`diag-band-${barva}`}>
                <span className="diag-chip">{slovo}</span>
              </span>
            ) : (
              <span className="text-[12px] text-[var(--wm-text-3)]">{slovo}</span>
            ))}
          <span className={`tabular-nums ${maly ? "text-[13px]" : "text-[15px] font-semibold"}`}>
            {hodnota === null ? "–" : hodnota}
          </span>
        </span>
      </div>
      <Pruh hodnota={hodnota} barva={barva} />
      {popis && <p className="mt-1.5 text-[12.5px] leading-snug text-[var(--wm-text-3)]">{popis}</p>}
    </div>
  )
}

const Karta = ({ titul, podtitul, children }: { titul: string; podtitul?: string; children: React.ReactNode }) => (
  <section className="diag-card p-6">
    <h2 className="text-[18px] font-bold tracking-tight">{titul}</h2>
    {podtitul && <p className="mt-1 text-[13.5px] leading-relaxed text-[var(--wm-text-2)]">{podtitul}</p>}
    <div className="mt-4">{children}</div>
  </section>
)

const slovoOsobnosti = (x: number | null) => (x === null ? undefined : x < 40 ? "nízko" : x < 60 ? "středně" : "vysoko")

export function Profil360Report({ sessionToken, detail }: { sessionToken: string; detail: ResultDetail }) {
  const odp = detail.answers as unknown as Record<string, number>
  const p = useMemo(() => vyhodnot(odp, detail.durationSec), [odp, detail.durationSec])
  const g = (t: string) => applyGender(t, detail.person.gender ?? "male")

  const serazene = p.oblasti.filter((o) => o.hodnota !== null).sort((a, b) => b.hodnota! - a.hodnota!)
  const nejsilnejsi = serazene.slice(0, 3)
  const nejslabsi = serazene.slice(-3).reverse()
  const minut = detail.durationSec ? Math.round(detail.durationSec / 60) : null
  const kontext = KONTEXT_OTAZKY.map((o) => ({ o, x: odp[String(o.id)] })).filter((k) => typeof k.x === "number")

  const spolehlivostText =
    p.spolehlivost.celkem === "ok"
      ? "Vyplnění je spolehlivé."
      : p.spolehlivost.celkem === "pozor"
        ? "Vyplnění má drobné nesrovnalosti; výsledky čti s rezervou."
        : "Vyplnění je nespolehlivé; profil neber jako podklad pro závěry a domluv nové vyplnění."

  return (
    <div className="flex flex-col gap-5">
      {/* hlavička */}
      <section className="diag-card p-6">
        <p className="text-[12px] font-bold tracking-[0.18em] text-[var(--wm-text-3)]">SPORTOVNÍ PROFIL 360</p>
        <h1 className="mt-2 text-[28px] font-bold tracking-tight">{detail.person.name || "–"}</h1>
        <p className="mt-1 text-[14px] text-[var(--wm-text-2)]">
          {[detail.person.role, detail.person.fillDate, minut !== null ? `${minut} min` : null].filter(Boolean).join(" · ")}
        </p>
        {kontext.length > 0 && (
          <p className="mt-1 text-[13px] text-[var(--wm-text-3)]">
            {kontext.map(({ o, x }) => o.moznosti[x - 1]).join(" · ")}
          </p>
        )}
        <p
          className="mt-4 rounded-xl p-3 text-[13.5px] font-medium"
          style={{
            background: p.spolehlivost.celkem === "ok" ? "var(--wm-surface-2)" : "var(--wm-red-light)",
            color: p.spolehlivost.celkem === "ok" ? "var(--wm-text-2)" : "var(--wm-red)",
          }}
        >
          {spolehlivostText}
          {p.spolehlivost.poznamky.length > 0 && (
            <span className="mt-1 block font-normal">{p.spolehlivost.poznamky.join(" ")}</span>
          )}
        </p>
      </section>

      <DoporuceniOdbornika sessionToken={sessionToken} resultId={detail.id} />

      {/* typ */}
      {p.typ && (
        <section className="diag-card p-6">
          <p className="text-[12px] font-bold tracking-[0.18em] text-[var(--wm-text-3)]">TYP SPORTOVCE</p>
          <h2 className="mt-2 text-[26px] font-bold tracking-tight">{p.typ.hlavni.nazev}</h2>
          <p className="mt-1 text-[14px] text-[var(--wm-text-2)]">s rysy typu {p.typ.vedlejsi.nazev.toLowerCase()}</p>
          <p className="mt-4 text-[15px] leading-relaxed">{g(p.typ.hlavni.popis)}</p>
          <dl className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl bg-[var(--wm-surface-2)] p-4">
              <dt className="text-[12px] font-semibold uppercase tracking-wider text-[var(--wm-text-3)]">Co potřebuje</dt>
              <dd className="mt-1.5 text-[14px] leading-relaxed">{g(p.typ.hlavni.potrebuje)}</dd>
            </div>
            <div className="rounded-xl bg-[var(--wm-surface-2)] p-4">
              <dt className="text-[12px] font-semibold uppercase tracking-wider text-[var(--wm-text-3)]">Na co dát pozor</dt>
              <dd className="mt-1.5 text-[14px] leading-relaxed">{g(p.typ.hlavni.pozor)}</dd>
            </div>
          </dl>
        </section>
      )}

      {/* sportovní profil */}
      <Karta
        titul="Sportovní profil"
        podtitul="Devět oblastí, které rozhodují o výkonu. Skládají se z ověřených dotazníků; 0 až 100, víc je lépe."
      >
        <div className="flex flex-col">
          {p.oblasti.map((o) => (
            <Radek
              key={o.id}
              nazev={o.nazev}
              popis={g(o.popis)}
              hodnota={o.hodnota}
              barva={o.pasmo ?? undefined}
              slovo={o.pasmo ? PASMO_SLOVO[o.pasmo] : undefined}
            />
          ))}
        </div>
      </Karta>

      {/* silné stránky a rizika */}
      <div className="grid gap-5 lg:grid-cols-2">
        <Karta titul="O co se opřít">
          <ul className="flex flex-col gap-2.5">
            {nejsilnejsi.map((o) => (
              <li key={o.id} className="text-[14px] leading-relaxed">
                <span className="font-semibold">{o.nazev}.</span>{" "}
                <span className="text-[var(--wm-text-2)]">{g(OBLASTI.find((x) => x.id === o.id)!.silna)}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-[12px] font-semibold uppercase tracking-wider text-[var(--wm-text-3)]">
            Nejsilnější stránky charakteru
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {p.silneStranky.slice(0, 5).map((s) => (
              <span key={s.kod} className="rounded-full bg-[var(--wm-fill-4)] px-3 py-1 text-[13px] font-medium">
                {s.nazev}
              </span>
            ))}
          </div>
        </Karta>
        <Karta titul="Na co dát pozor">
          {p.rizika.length === 0 ? (
            <p className="text-[14px] text-[var(--wm-text-2)]">Žádné výrazné riziko se v odpovědích neukázalo.</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {p.rizika.map((r) => (
                <li key={r.id} className="text-[14px] leading-relaxed">
                  <span className="font-semibold">{r.nazev}.</span>{" "}
                  <span className="text-[var(--wm-text-2)]">{g(r.text)}</span>
                </li>
              ))}
            </ul>
          )}
        </Karta>
      </div>

      {/* doporučení */}
      <Karta titul={g("Jak s {ním|ní} pracovat")} podtitul="Pro tři oblasti s největší rezervou.">
        <div className="flex flex-col gap-5">
          {nejslabsi.map((o) => {
            const def = OBLASTI.find((x) => x.id === o.id)!
            return (
              <div key={o.id}>
                <p className="text-[15px] font-semibold">
                  {o.nazev} <span className="font-normal text-[var(--wm-text-3)]">· {o.hodnota}</span>
                </p>
                <ul className="mt-1.5 flex list-disc flex-col gap-1.5 pl-5 text-[14px] leading-relaxed text-[var(--wm-text-2)]">
                  {def.rozvoj.map((r) => (
                    <li key={r}>{g(r)}</li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>
      </Karta>

      {/* osobnost */}
      <Karta
        titul="Osobnost do hloubky"
        podtitul="Pět oblastí osobnosti a jejich dílčí rysy (IPIP-NEO-120). Tady není lepší ani horší konec; jde o to, jak člověk funguje."
      >
        <div className="grid gap-6 lg:grid-cols-2">
          {p.osobnost.map((d) => (
            <div key={d.kod}>
              <Radek nazev={d.nazev} popis={d.popis} hodnota={d.hodnota} slovo={slovoOsobnosti(d.hodnota)} />
              <div className="border-l-2 border-[var(--wm-border-light)] pl-4">
                {d.fazety.map((f) => (
                  <Radek key={f.kod} nazev={f.nazev} hodnota={f.hodnota} slovo={slovoOsobnosti(f.hodnota)} maly />
                ))}
              </div>
            </div>
          ))}
        </div>
      </Karta>

      {/* silné stránky */}
      <Karta
        titul="Silné stránky charakteru"
        podtitul="24 silných stránek (IPIP-VIA-R) seřazených od nejsilnější. Čte se hlavně pořadí: horních pět je to, čím člověk nejvíc je."
      >
        <div className="grid gap-x-8 sm:grid-cols-2">
          {p.silneStranky.map((s, i) => (
            <Radek
              key={s.kod}
              nazev={`${i + 1}. ${s.nazev}`}
              hodnota={s.hodnota}
              barva={i < 5 ? "strong" : undefined}
              maly
            />
          ))}
        </div>
      </Karta>

      {/* motivace */}
      <Karta
        titul={g("Co {ho|ji} pohání a co brzdí")}
        podtitul="Motivace k odměně a citlivost na hrozbu (IPIP BIS/BAS)."
      >
        {p.motivace.map((m) => (
          <Radek key={m.kod} nazev={m.nazev} popis={m.popis} hodnota={m.hodnota} slovo={slovoOsobnosti(m.hodnota)} />
        ))}
        {p.vzruseni !== null && (
          <Radek
            nazev="Chuť riskovat"
            popis="vyhledávání vzrušení a ochota jít do rizika; ve sportech s rizikem zranění stojí za pozornost"
            hodnota={p.vzruseni}
            slovo={slovoOsobnosti(p.vzruseni)}
          />
        )}
      </Karta>

      {/* stres a spánek */}
      <div className="grid gap-5 lg:grid-cols-2">
        <Karta titul="Stres za poslední týden" podtitul="DASS-21, škála stresu.">
          {p.stres ? (
            <>
              <p className="text-[24px] font-bold tracking-tight">{STRES_SLOVO[p.stres.pasmo]}</p>
              <p className="mt-1 text-[13px] text-[var(--wm-text-3)]">{p.stres.body} bodů z 42</p>
              <p className="mt-3 text-[14px] leading-relaxed text-[var(--wm-text-2)]">
                {p.stres.pasmo === "bezna"
                  ? "Zátěž odpovídá běžnému životu sportovce."
                  : "Zátěž je vyšší než obvykle. Zjisti, co se teď děje, a zvaž úpravu tréninkové zátěže."}
              </p>
            </>
          ) : (
            <p className="text-[14px] text-[var(--wm-text-2)]">Nezodpovězeno.</p>
          )}
        </Karta>
        <Karta titul="Spánek a rytmus" podtitul="Chronotyp podle středu spánku ve volné dny (metoda MCTQ).">
          {p.chronotyp ? (
            <>
              <p className="text-[24px] font-bold tracking-tight">{CHRONOTYP_SLOVO[p.chronotyp.typ]}</p>
              <dl className="mt-3 flex flex-col divide-y divide-[var(--wm-border-light)] text-[14px]">
                <div className="flex justify-between gap-3 py-2">
                  <dt className="text-[var(--wm-text-2)]">střed spánku ve volné dny</dt>
                  <dd className="font-medium tabular-nums">{CAS(p.chronotyp.stredVolno)}</dd>
                </div>
                <div className="flex justify-between gap-3 py-2">
                  <dt className="text-[var(--wm-text-2)]">spánek v pracovní dny</dt>
                  <dd className="font-medium tabular-nums">{p.chronotyp.spankuPrace.toLocaleString("cs-CZ")} h</dd>
                </div>
                <div className="flex justify-between gap-3 py-2">
                  <dt className="text-[var(--wm-text-2)]">sociální jetlag</dt>
                  <dd className="font-medium tabular-nums">{p.chronotyp.socialniJetlag.toLocaleString("cs-CZ")} h</dd>
                </div>
              </dl>
              <p className="mt-3 text-[13.5px] leading-relaxed text-[var(--wm-text-2)]">
                {p.chronotyp.spankuPrace < 8
                  ? "Ve dny s tréninkem spí méně než 8 hodin; u mladých sportovců to souvisí s vyšším rizikem zranění. "
                  : ""}
                {p.chronotyp.socialniJetlag >= 2
                  ? "Velký rozdíl mezi všedními a volnými dny rozhazuje vnitřní hodiny. "
                  : ""}
                {p.chronotyp.typ.startsWith("vecerni")
                  ? g("Ranní tréninky a zápasy {mu|jí} budou sedět hůř; náročné věci dávej spíš odpoledne.")
                  : p.chronotyp.typ.startsWith("ranni")
                    ? "Nejlíp funguje dopoledne; pozdní večerní zápasy mohou být náročnější."
                    : ""}
                {p.chronotyp.budik ? g(" Ve volné dny {ho|ji} budí budík, typ je proto jen orientační.") : ""}
              </p>
            </>
          ) : (
            <p className="text-[14px] text-[var(--wm-text-2)]">Nezodpovězeno.</p>
          )}
        </Karta>
      </div>

      {/* shrnutí */}
      <section className="diag-card p-6" style={{ background: "var(--wm-surface-2)" }}>
        <p className="text-[12px] font-bold tracking-[0.18em] text-[var(--wm-text-3)]">SHRNUTÍ PRO SPORTOVCE</p>
        <div className="mt-3 flex flex-col gap-3">
          {shrnuti(p).map((o) => (
            <p key={o} className="text-[15px] leading-relaxed">
              {g(o)}
            </p>
          ))}
        </div>
      </section>

      <p className="px-1 text-[12px] leading-relaxed text-[var(--wm-text-3)]">
        Zdroje: IPIP-NEO-120 (Johnson, 2014), IPIP-VIA-R (Bluemke a kol., 2021), IPIP BIS/BAS (Goldberg a kol.,
        2006), DASS-21 (Lovibond a Lovibond, 1995), MCTQ (Roenneberg a kol., 2003). Škály jsou převzaté, sportovní
        oblasti, typy, rizika a doporučení jsou výklad Winning Minds. Český překlad je pracovní a české normy zatím
        nejsou: skóre 0 až 100 je převedený průměr odpovědí, ne percentil.
      </p>
    </div>
  )
}
