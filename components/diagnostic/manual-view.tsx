"use client"

import { TEST_NAMES } from "@/lib/diagnostic/i18n"
import { MANUAL, type ManualPolozka } from "@/lib/diagnostic/manual"
import {
  PORADI_TESTU,
  oblastiElite,
  oblastiVzorcu,
  oblastiVzorcuSport,
  prehledTestu,
  prezdivkySport,
  rozsahTestu,
  skupinyArchetypu,
  vzorceRadky,
} from "@/lib/diagnostic/manual-data"
import type { Lang } from "@/lib/diagnostic/types"

// Manuál pro kouče v aplikaci.
//
// Je to čtená stránka, ne přehled dat, takže se sází na jeden sloupec
// s omezenou šířkou řádku. Karty testů drží stejný tvar jako zbytek
// aplikace, aby to nepůsobilo jako přilepený dokument.

const SIRKA = "max-w-[62rem]"

export function ManualView({ lang, onPdf }: { lang: Lang; onPdf?: () => void }) {
  const t = MANUAL[lang]
  const kap = t.kapitoly

  return (
    <div className={SIRKA}>
      <header className="mb-9">
        <div className="h-[3px] w-[52px] rounded-full bg-[var(--wm-blue)]" />
        <h1 className="mt-4 text-[30px] font-bold leading-tight tracking-tight">{t.title}</h1>
        <p className="mt-3 max-w-[46rem] text-[15px] leading-relaxed text-[var(--wm-text-2)]">
          {t.lede}
        </p>
        {onPdf && (
          <button
            type="button"
            onClick={onPdf}
            className="diag-press mt-5 rounded-full bg-[var(--wm-brand)] px-5 py-2 text-[13px] font-semibold text-[var(--wm-brand-fg)]"
          >
            {t.pdf}
          </button>
        )}
      </header>

      {/* ---------------- 1. Jak to probíhá ---------------- */}
      <Kapitola k={kap[0]}>
        <ol className="mb-7 space-y-4">
          {t.postup.map((p, i) => (
            <li key={i} className="flex gap-4">
              <span className="mt-[2px] w-5 shrink-0 text-[13px] font-bold tabular-nums text-[var(--wm-blue)]">
                {i + 1}
              </span>
              <p className="text-[14.5px] leading-relaxed">
                <b className="font-semibold">{p.lbl}</b> {p.text}
              </p>
            </li>
          ))}
        </ol>

        <Poznamka text={t.vysledkyNote} />

        <div className="mt-7 space-y-6">
          {t.ch1Bloky.map((b) => (
            <div key={b.lbl}>
              <Nadpisek>{b.lbl}</Nadpisek>
              <p className="text-[14.5px] leading-relaxed text-[var(--wm-text-2)]">{b.text}</p>
            </div>
          ))}
        </div>
      </Kapitola>

      {/* ---------------- 2. Kterou vybrat ---------------- */}
      <Kapitola k={kap[1]}>
        <Tabulka hlavicka={t.rodinyHlavicka} sirky={["30%", "28%", "42%"]}>
          {t.rodiny.map((r) => (
            <tr key={r.nazev} className="border-t border-[var(--wm-border-light)]">
              <Bunka><b className="font-semibold">{r.nazev}</b></Bunka>
              <Bunka tlumene>{r.otazka}</Bunka>
              <Bunka tlumene>{r.kdy}</Bunka>
            </tr>
          ))}
        </Tabulka>

        <Nadpisek className="mt-8">{t.volbaTitle}</Nadpisek>
        <div className="overflow-hidden rounded-2xl border border-[var(--wm-border-light)]">
          {t.volba.map((v, i) => (
            <div
              key={v.q}
              className="grid gap-x-6 gap-y-1 border-b border-[var(--wm-border-light)] px-5 py-4 last:border-b-0 sm:grid-cols-[15rem_1fr]"
              style={i % 2 === 0 ? { background: "var(--wm-surface-2)" } : undefined}
            >
              <p className="text-[14px] font-semibold leading-snug">{v.q}</p>
              <p className="text-[14px] leading-relaxed text-[var(--wm-text-2)]">{v.a}</p>
            </div>
          ))}
        </div>
        <Patka>{t.volbaFootnote}</Patka>
      </Kapitola>

      {/* ---------------- 3. ELITE ---------------- */}
      <Kapitola k={kap[2]}>
        <Nadpisek>{t.oblastiTitle}</Nadpisek>
        <Tabulka sirky={["3rem", "34%", "auto"]}>
          {oblastiElite(lang).map((o) => (
            <tr key={o.id} className="border-t border-[var(--wm-border-light)]">
              <Bunka><span className="font-bold text-[var(--wm-blue)]">{o.id}</span></Bunka>
              <Bunka><b className="font-semibold">{o.nazev}</b></Bunka>
              <Bunka tlumene>{o.popis}</Bunka>
            </tr>
          ))}
        </Tabulka>
        <Patka>{t.oblastiFootnote}</Patka>

        <div className="mt-8 space-y-5">
          {PORADI_TESTU.slice(0, 4).map((id, i) => (
            <KartaTestu key={id} id={id} poradi={i + 1} lang={lang} />
          ))}
        </div>

        <Panel title={t.eliteEvalTitle} lede={t.eliteEvalLede} polozky={t.eliteEval} />
      </Kapitola>

      {/* ---------------- 4. Vzorce ---------------- */}
      <Kapitola k={kap[3]}>
        <Nadpisek>{t.vzorceTitle}</Nadpisek>
        <Tabulka sirky={["3rem", "34%", "auto"]}>
          {vzorceRadky(lang).map((v) => (
            <tr key={v.id} className="border-t border-[var(--wm-border-light)]">
              <Bunka><span className="font-bold tabular-nums text-[var(--wm-blue)]">{v.id}</span></Bunka>
              <Bunka><b className="font-semibold">{v.nazev}</b></Bunka>
              <Bunka tlumene>{v.tema}</Bunka>
            </tr>
          ))}
        </Tabulka>

        <Nadpisek className="mt-8">{t.oblastiVzorcuTitle}</Nadpisek>
        <p className="mb-3 text-[14.5px] leading-relaxed text-[var(--wm-text-2)]">
          {t.oblastiVzorcuIntro}
        </p>
        <Tabulka sirky={["42%", "auto"]}>
          {oblastiVzorcu(lang).map((o) => (
            <tr key={o.nazev} className="border-t border-[var(--wm-border-light)]">
              <Bunka><b className="font-semibold">{o.nazev}</b></Bunka>
              <Bunka tlumene>
                {t.chybi} {o.potreba}
              </Bunka>
            </tr>
          ))}
        </Tabulka>
        <Patka>
          {t.oblastiVzorcuFootnote} {oblastiVzorcuSport(lang)}.
        </Patka>

        <div className="mt-8 space-y-5">
          {PORADI_TESTU.slice(4, 7).map((id, i) => (
            <KartaTestu key={id} id={id} poradi={i + 5} lang={lang} />
          ))}
        </div>

        <Panel title={t.vzorceEvalTitle} lede={t.vzorceEvalLede} polozky={t.vzorceEval} />
        <Poznamka text={t.vzorceNote} />
      </Kapitola>

      {/* ---------------- 5. Archetypy ---------------- */}
      <Kapitola k={kap[4]}>
        <Nadpisek>{t.archetypyTitle}</Nadpisek>
        <Tabulka hlavicka={t.archetypyHlavicka} sirky={["27%", "31%", "42%"]}>
          {skupinyArchetypu(lang).map((s) => (
            <tr key={s.nazev} className="border-t border-[var(--wm-border-light)]">
              <Bunka><b className="font-semibold">{s.nazev}</b></Bunka>
              <Bunka>{s.archetypy}</Bunka>
              <Bunka tlumene>{s.popis}</Bunka>
            </tr>
          ))}
        </Tabulka>
        <Patka>
          {t.archetypyFootnote} {prezdivkySport(lang)}.
        </Patka>

        <div className="mt-8 space-y-5">
          {PORADI_TESTU.slice(7).map((id, i) => (
            <KartaTestu key={id} id={id} poradi={i + 8} lang={lang} />
          ))}
        </div>

        <Panel title={t.archEvalTitle} lede={t.archEvalLede} polozky={t.archEval}>
          <div className="mt-6 border-t border-[var(--wm-border-light)] pt-5">
            <Nadpisek>{t.archSportTitle}</Nadpisek>
            <Odrazky polozky={t.archSport} />
          </div>
        </Panel>
        <Poznamka text={t.archNote} />
      </Kapitola>

      {/* ---------------- 6. Praktické poznámky ---------------- */}
      <Kapitola k={kap[5]}>
        <div className="space-y-7">
          {t.praktickeBloky.map((b) => (
            <div key={b.title}>
              <Nadpisek>{b.title}</Nadpisek>
              <Odrazky polozky={b.polozky} />
            </div>
          ))}
          <div>
            <Nadpisek>{t.zachazeniTitle}</Nadpisek>
            {t.zachazeni.map((o, i) => (
              <p key={i} className="mb-3 text-[14.5px] leading-relaxed text-[var(--wm-text-2)] last:mb-0">
                {o}
              </p>
            ))}
          </div>
        </div>

        <div className="diag-card mt-9 p-6 sm:p-7">
          <h3 className="text-[17px] font-bold tracking-tight">{t.prehledTitle}</h3>
          <p className="mt-1 mb-4 text-[13.5px] leading-relaxed text-[var(--wm-text-2)]">
            {t.prehledLede}
          </p>
          <Tabulka hlavicka={["", ...t.prehledHlavicka] as string[]} sirky={["2.6rem", "auto", "22%", "20%"]}>
            {prehledTestu(lang).map((r) => (
              <tr key={r.cislo} className="border-t border-[var(--wm-border-light)]">
                <Bunka><span className="font-bold tabular-nums text-[var(--wm-blue)]">{r.cislo}</span></Bunka>
                <Bunka><b className="font-semibold">{r.nazev}</b></Bunka>
                <Bunka tlumene>{r.rozsah}</Bunka>
                <Bunka tlumene>{r.prostredi}</Bunka>
              </tr>
            ))}
          </Tabulka>
        </div>
      </Kapitola>
    </div>
  )
}

// ---------------------------------------------------------------------------
// stavební kameny
// ---------------------------------------------------------------------------

function Kapitola({
  k,
  children,
}: {
  k: { kicker: string; title: string; standfirst: string }
  children: React.ReactNode
}) {
  return (
    <section className="mb-14">
      <div className="mb-6 border-t-2 border-[var(--wm-brand)] pt-4">
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--wm-text-3)]">
          {k.kicker}
        </p>
        <h2 className="mt-2 text-[24px] font-bold leading-tight tracking-tight">{k.title}</h2>
        <p className="mt-2 max-w-[44rem] text-[15px] leading-relaxed text-[var(--wm-text-2)]">
          {k.standfirst}
        </p>
      </div>
      {children}
    </section>
  )
}

function Nadpisek({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <p
      className={`mb-2.5 text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--wm-text-3)] ${className}`}
    >
      {children}
    </p>
  )
}

function Patka({ children }: { children: React.ReactNode }) {
  return <p className="mt-3 text-[13px] leading-relaxed text-[var(--wm-text-3)]">{children}</p>
}

function Poznamka({ text }: { text: string }) {
  return (
    <p className="mt-6 border-l-[3px] border-[var(--wm-blue)] pl-4 text-[14.5px] leading-relaxed text-[var(--wm-text-2)]">
      {text}
    </p>
  )
}

/** Tabulka se vodorovně posouvá, aby na telefonu nerozjela celou stránku. */
function Tabulka({
  hlavicka,
  sirky,
  children,
}: {
  hlavicka?: string[]
  sirky: string[]
  children: React.ReactNode
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[34rem] border-collapse text-[14px]">
        <colgroup>
          {sirky.map((s, i) => (
            <col key={i} style={{ width: s }} />
          ))}
        </colgroup>
        {hlavicka && (
          <thead>
            <tr>
              {hlavicka.map((h, i) => (
                <th
                  key={i}
                  className="border-b border-[var(--wm-border)] pb-2 pr-5 text-left text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--wm-text-3)] last:pr-0"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
        )}
        <tbody>{children}</tbody>
      </table>
    </div>
  )
}

function Bunka({ children, tlumene }: { children: React.ReactNode; tlumene?: boolean }) {
  return (
    <td
      className={`py-2.5 pr-5 align-top leading-snug last:pr-0 ${tlumene ? "text-[var(--wm-text-2)]" : ""}`}
    >
      {children}
    </td>
  )
}

function Odrazky({ polozky }: { polozky: ManualPolozka[] }) {
  return (
    <ul className="space-y-2">
      {polozky.map((p, i) => (
        <li key={i} className="relative pl-5 text-[14.5px] leading-relaxed">
          <span className="absolute left-0 top-[9px] h-[5px] w-[5px] rounded-full bg-[var(--wm-border)]" />
          {p.lbl && <b className="font-semibold">{p.lbl} </b>}
          <span className={p.lbl ? "text-[var(--wm-text-2)]" : "text-[var(--wm-text-2)]"}>
            {p.text}
          </span>
        </li>
      ))}
    </ul>
  )
}

/** Rámeček „co je ve vyhodnocení“; jeden na každou rodinu testů. */
function Panel({
  title,
  lede,
  polozky,
  children,
}: {
  title: string
  lede: string
  polozky: ManualPolozka[]
  children?: React.ReactNode
}) {
  return (
    <div className="diag-card mt-8 p-6 sm:p-7">
      <h3 className="text-[18px] font-bold tracking-tight">{title}</h3>
      <p className="mt-1.5 max-w-[44rem] border-b border-[var(--wm-border-light)] pb-4 text-[13.5px] leading-relaxed text-[var(--wm-text-2)]">
        {lede}
      </p>
      <div className="pt-4">
        <Odrazky polozky={polozky} />
      </div>
      {children}
    </div>
  )
}

function KartaTestu({
  id,
  poradi,
  lang,
}: {
  id: (typeof PORADI_TESTU)[number]
  poradi: number
  lang: Lang
}) {
  const t = MANUAL[lang]
  const karta = t.testy[id]
  return (
    <article className="border-t border-[var(--wm-brand)] pt-4">
      <div className="flex gap-4">
        <span className="mt-[3px] w-6 shrink-0 text-[13px] font-bold tabular-nums text-[var(--wm-blue)]">
          {String(poradi).padStart(2, "0")}
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-[17px] font-bold leading-snug tracking-tight">
            {TEST_NAMES[id][lang]}
          </h3>
          <p className="mt-0.5 text-[13.5px] text-[var(--wm-text-3)]">{karta.podtitul}</p>

          <dl className="mt-4 grid overflow-hidden rounded-xl border border-[var(--wm-border-light)] bg-[var(--wm-surface-2)] sm:grid-cols-3">
            <Fakt popis={t.popiskyKaret.proKoho} hodnota={karta.proKoho} />
            <Fakt popis={t.popiskyKaret.rozsah} hodnota={rozsahTestu(id, lang)} />
            <Fakt popis={t.popiskyKaret.jazyky} hodnota={t.jazykyHodnota} posledni />
          </dl>

          <Nadpisek className="mt-4">{t.kCemuJe}</Nadpisek>
          <p className="text-[14.5px] leading-relaxed text-[var(--wm-text-2)]">{karta.kCemuJe}</p>
        </div>
      </div>
    </article>
  )
}

function Fakt({
  popis,
  hodnota,
  posledni,
}: {
  popis: string
  hodnota: string
  posledni?: boolean
}) {
  return (
    <div
      className={`px-4 py-3 ${posledni ? "" : "border-b border-[var(--wm-border-light)] sm:border-b-0 sm:border-r"}`}
    >
      <dt className="text-[10.5px] font-bold uppercase tracking-[0.13em] text-[var(--wm-text-3)]">
        {popis}
      </dt>
      <dd className="mt-1 text-[13.5px] leading-snug">{hodnota}</dd>
    </div>
  )
}
