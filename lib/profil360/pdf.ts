import { applyGender } from "../diagnostic/gender"
import { TEST_NAMES, UI, fmtNum } from "../diagnostic/i18n"
import { vUvozovkach } from "../diagnostic/otazky"
import { datumLokalne } from "../diagnostic/pdf/sazba"
import {
  BARVY_PASEM,
  PAPIR,
  STYL,
  Sestava,
  type Blok,
  type Hlavicka,
  type MoznyBlok,
  type Polozka,
  type RadekProfilu,
  type Styl,
} from "../diagnostic/pdf/sestava"
import { TEXTY_SESTAVY } from "../diagnostic/pdf/sestava-texty"
import type { PersonInfo } from "../diagnostic/types"
import { popisKontextu } from "./kontext"
import { BEZ_TYPU, CHRONOTYP_SLOVO, OBLASTI, PASMO_SLOVO, STRES_SLOVO, shrnuti, vyhodnot, type Stav } from "./profil"

// Tisková sestava Sportovního profilu 360. Stejná kostra jako ELITE:
//
// 1 Přehled: spolehlivost, typ sportovce, devět oblastí, o co se opřít,
//   na co dát pozor a otázky do rozhovoru ke třem nejslabším oblastem.
// 2 Jak s ním (s ní) pracovat: doporučení ke třem oblastem a rizika.
// 3 Osobnost do hloubky: pět oblastí a 29 rysů.
// 4 Silné stránky charakteru a motivace.
// 5 Stres, spánek a spolehlivost vyplnění.
// 6 Strana pro sportovce, jen když ji kouč zaškrtne.
//
// Doporučení odborníka (screening pohody) se do PDF nedává. Je to údaj
// o zdraví a patří do aplikace, kde se s ním pracuje, ne na papír, který
// může zůstat ležet na stole.

export interface Profil360PdfVstup {
  person: PersonInfo
  answers: Record<string, number>
  durationSec?: number
  proKlienta?: boolean
}

const LANG = "cs"

/** Název souboru: test, sportovec, datum. */
export function profil360PdfFileName(vstup: Profil360PdfVstup): string {
  return (
    [TEST_NAMES.profil360.cs, vstup.person.name, vstup.person.fillDate]
      .filter(Boolean)
      .join(" - ")
      .replace(/[/\\?%*:|"<>]/g, "-")
      .slice(0, 120) + ".pdf"
  )
}

const cislo = (x: number) => fmtNum(x, LANG)

/** Slovo k rysu osobnosti. Tady není lepší ani horší konec, proto bez barev. */
const slovoOsobnosti = (x: number | null) => (x === null ? "–" : x < 40 ? "nízko" : x < 60 ? "středně" : "vysoko")

const CAS = (h: number) => {
  const m = Math.round(h * 60) % 1440
  return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`
}

export function sestavProfil360Pdf(vstup: Profil360PdfVstup): Sestava {
  const { person, answers, durationSec } = vstup
  const ts = TEXTY_SESTAVY.cs
  const t = UI.cs
  const gender = person.gender ?? "male"
  const g = (x: string) => applyGender(x, gender)
  const p = vyhodnot(answers, durationSec)
  const ss = new Sestava(LANG)
  const datum = datumLokalne(person.fillDate, LANG)
  const vnitrni = (sekce: string): Hlavicka => ({
    vlevo: [person.name || "–", "Profil 360", datum].filter(Boolean).join(" · "),
    vpravo: sekce,
  })

  const serazene = p.oblasti.filter((o) => o.hodnota !== null).sort((a, b) => b.hodnota! - a.hodnota!)
  const nejsilnejsi = serazene.slice(0, 3)
  const nejslabsi = serazene.slice(-3).reverse()
  const definice = (id: string) => OBLASTI.find((o) => o.id === id)!
  const minut = durationSec ? Math.round(durationSec / 60) : 0
  const kontext = popisKontextu(answers)

  // ---------- 1 Přehled ----------
  const sp = p.spolehlivost
  const vyplneni: Record<Stav, string> = { ok: "spolehlivé", pozor: "! s výhradou", neplatne: "! nespolehlivé" }
  const barvaStavu: Record<Stav, typeof PAPIR.inkoust> = {
    ok: BARVY_PASEM.elite.pismo,
    pozor: BARVY_PASEM.stabilization.pismo,
    neplatne: BARVY_PASEM.priority.pismo,
  }
  const stavSlovem: Record<Stav, string> = { ok: "v pořádku", pozor: "pozor", neplatne: "nespolehlivé" }
  const info: Polozka[] = [
    { popis: ts.vyplneni, hodnota: vyplneni[sp.celkem], barva: barvaStavu[sp.celkem] },
    { popis: ts.pozornost, hodnota: `${sp.pozornost.z - sp.pozornost.chyb} / ${sp.pozornost.z}` },
    { popis: "Souhlasnost", hodnota: stavSlovem[sp.souhlasnost.stav], barva: barvaStavu[sp.souhlasnost.stav] },
    {
      popis: ts.tempo,
      hodnota: sp.tempo.sekundNaOtazku === null ? "–" : ts.tempoHodnota(cislo(sp.tempo.sekundNaOtazku)),
    },
  ]

  const typ = !p.typ
    ? ss.skupina([ss.h3("Typ sportovce"), ss.mezera(1), ss.text(BEZ_TYPU)])
    : ss.box(
      ss.sloupce(
        [
          {
            podil: 1,
            blok: ss.skupina([
              ss.h3("Typ sportovce"),
              ss.mezera(1),
              ss.text(g(p.typ.hlavni.nazev), { pt: 20, tucne: true, proklad: 1.1 }),
              p.typ.vedlejsi && ss.mezera(1),
              p.typ.vedlejsi && ss.text(`s rysy typu ${g(p.typ.vedlejsi.nazev).toLowerCase()}`),
            ]),
          },
          {
            podil: 1.4,
            blok: ss.skupina([
              ss.text(g(p.typ.hlavni.popis), STYL.textTmavy),
              ss.mezera(1.8),
              ss.h3("Co potřebuje"),
              ss.mezera(0.5),
              ss.text(g(p.typ.hlavni.potrebuje)),
              ss.mezera(1.8),
              ss.h3("Na co dát pozor"),
              ss.mezera(0.5),
              ss.text(g(p.typ.hlavni.pozor)),
            ]),
          },
        ],
        6,
      ),
      { svisle: 3.6, vodorovne: 4 },
    )

  const profil = (mezera: number) =>
    ss.profil(
      p.oblasti.map((o): RadekProfilu => ({
        nazev: o.nazev,
        hodnota: o.hodnota === null ? null : String(o.hodnota),
        procenta: o.hodnota ?? 0,
        pasmo: o.pasmo,
        stitek: o.pasmo ? PASMO_SLOVO[o.pasmo] : t.scaleNotReported,
      })),
      {
        popis: "stupnice 0 až 100",
        hranice: [40, 60, 80],
        popisky: [PASMO_SLOVO.priority, PASMO_SLOVO.stabilization, PASMO_SLOVO.strong, PASMO_SLOVO.elite],
      },
      { mezera },
    )

  const oprit = (sCharakterem: boolean) =>
    ss.skupina([
      ss.h3("O co se opřít"),
      ss.mezera(1.8),
      ss.cipy(nejsilnejsi.map((o) => `${o.nazev} · ${o.hodnota}`)),
      sCharakterem && ss.mezera(3),
      sCharakterem && ss.h3("Nejsilnější stránky charakteru"),
      sCharakterem && ss.mezera(1.8),
      sCharakterem && ss.cipy(p.silneStranky.slice(0, 5).map((s) => s.nazev)),
    ])
  const stRiziko: Styl = { pt: 9.4, tucne: true, barva: PAPIR.inkoust, proklad: 1.35 }
  // Na přehled se vejdou tři rizika; celý seznam s vysvětlením je na druhé straně.
  const NA_PREHLED = 3
  const dalsich = p.rizika.length - NA_PREHLED
  const pozor = ss.skupina([
    ss.h3("Na co dát pozor"),
    ss.mezera(1.8),
    p.rizika.length
      ? ss.seznam(
          p.rizika.slice(0, NA_PREHLED).map((r) => g(r.nazev)),
          stRiziko,
          { cisla: false, mezera: 1 },
        )
      : ss.text("Žádné výrazné riziko se v odpovědích neukázalo."),
    dalsich > 0 && ss.mezera(1.2),
    dalsich > 0 && ss.text(`Další rizika (${dalsich}) jsou rozepsaná na druhé straně.`, STYL.mala),
  ])
  const stresASpanek = ss.sloupce(
    [
      {
        blok: ss.skupina([
          ss.h3("Míra stresu za poslední týden"),
          ss.mezera(0.8),
          ss.text(p.stres ? STRES_SLOVO[p.stres.pasmo] : "nezodpovězeno", STYL.h2),
          p.stres && ss.text(`${p.stres.body} bodů z 42 · DASS-21`, STYL.mala),
        ]),
      },
      {
        blok: ss.skupina([
          ss.h3("Chronotyp"),
          ss.mezera(0.8),
          ss.text(p.chronotyp ? CHRONOTYP_SLOVO[p.chronotyp.typ] : "nezodpovězeno", STYL.h2),
          p.chronotyp && ss.text(`sociální jetlag ${cislo(p.chronotyp.socialniJetlag)} h`, STYL.mala),
        ]),
      },
    ],
    8,
  )
  const otazky = ss.box(
    ss.skupina([
      ss.h3(ts.doRozhovoru(nejslabsi.length)),
      ss.mezera(2),
      ss.body(
        nejslabsi.map((o) => ({
          titulek: `${o.nazev} · ${o.hodnota}`,
          text: vUvozovkach(g(definice(o.id).otazka), LANG),
        })),
      ),
    ]),
  )

  const prehled = (mezeraProfilu: number, sStresem: boolean, sCharakterem: boolean): MoznyBlok[] => [
    ss.uvod(TEST_NAMES.profil360.cs, person.name, [
      [person.role, ts.vyplneno(datum), minut ? ts.minut(minut) : ""].filter(Boolean).join(" · "),
      kontext.join(" · "),
    ]),
    ss.infoPruh(info),
    sp.poznamky.length > 0 && ss.upozorneni(sp.poznamky.join(" ")),
    typ,
    ss.skupina([ss.text("Sportovní profil", STYL.h1), ss.mezera(3.6), profil(mezeraProfilu)]),
    ss.sloupce([{ blok: oprit(sCharakterem) }, { blok: pozor }], 8),
    sStresem && stresASpanek,
    nejslabsi.length > 0 && otazky,
  ]
  // Od nejvzdušnějšího rozvržení. Když se přehled nevejde ani s menšími
  // mezerami, ustoupí nejdřív stres a spánek (rozepsané na páté straně)
  // a pak silné stránky charakteru (celé pořadí na čtvrté straně).
  const ROZVRZENI = [
    { strana: 5.8, profil: 3.7, stres: true, charakter: true },
    { strana: 5, profil: 3.2, stres: true, charakter: true },
    { strana: 4.4, profil: 2.8, stres: true, charakter: true },
    { strana: 4.4, profil: 2.8, stres: false, charakter: true },
    { strana: 4.4, profil: 2.6, stres: false, charakter: false },
    { strana: 3.8, profil: 2.3, stres: false, charakter: false },
  ]
  ss.stranaVeVariantach(
    { vlevo: t.brand, vpravo: ts.proKouce, znacka: true },
    ROZVRZENI.map((x) => ({ bloky: prehled(x.profil, x.stres, x.charakter), mezera: x.strana })),
  )

  // ---------- 2 Jak s ním pracovat ----------
  const nadpisPrace = g("Jak s {ním|ní} pracovat")
  ss.strana(vnitrni(nadpisPrace), [
    ss.skupina([
      ss.text(nadpisPrace, STYL.h1),
      ss.mezera(1.2),
      ss.text("Tři oblasti s největší rezervou a co s nimi dělat. Doporučení jsou pro kouče."),
    ]),
    ...nejslabsi.map((o) => {
      const def = definice(o.id)
      const stitek = o.pasmo ? PASMO_SLOVO[o.pasmo] : ""
      return ss.oddil(
        ss.skupina(
          [
            ss.sloupce(
              [
                { blok: ss.text(`${o.nazev} · ${o.hodnota}`, STYL.h2) },
                ...(o.pasmo
                  ? [{ sirka: ss.sirkaStitku(stitek), blok: ss.stitekBlok(stitek, o.pasmo, ss.radek(STYL.h2)) }]
                  : []),
              ],
              3,
            ),
            ss.text(g(o.popis), STYL.mala),
            ss.seznam(def.rozvoj.map(g), STYL.text, { cisla: false, mezera: 1 }),
          ],
          1.8,
        ),
        3,
      )
    }),
    ss.skupina([
      ss.text("Na co dát pozor", STYL.h2),
      ss.mezera(2.4),
      p.rizika.length
        ? ss.body(
            p.rizika.map((x) => ({ titulek: g(x.nazev), text: g(x.text) })),
            { odrazky: true },
          )
        : ss.text("Žádné výrazné riziko se v odpovědích neukázalo."),
    ]),
    ss.zapis(ts.poznamkyZRozhovoru, 2),
  ])

  // ---------- 3 Osobnost do hloubky ----------
  const radkyOsobnosti: RadekProfilu[] = p.osobnost.flatMap((d) => [
    {
      nazev: d.nazev,
      hodnota: d.hodnota === null ? null : String(d.hodnota),
      procenta: d.hodnota ?? 0,
      pasmo: null,
      stitek: slovoOsobnosti(d.hodnota),
    },
    ...d.fazety.map((f): RadekProfilu => ({
      nazev: f.nazev.charAt(0).toLocaleUpperCase("cs") + f.nazev.slice(1),
      hodnota: f.hodnota === null ? null : String(f.hodnota),
      procenta: f.hodnota ?? 0,
      pasmo: null,
      stitek: slovoOsobnosti(f.hodnota),
      podrizeny: true,
      tlumeny: true,
    })),
  ])
  ss.strana(vnitrni("Osobnost do hloubky"), [
    ss.skupina([
      ss.text("Osobnost do hloubky", STYL.h1),
      ss.mezera(1.2),
      ss.text(
        "Pět oblastí osobnosti a jejich dílčí rysy (IPIP-NEO-120). Tady není lepší ani horší konec; jde o to, jak člověk funguje.",
      ),
    ]),
    ss.profil(radkyOsobnosti, null, { mezera: 1.9 }),
  ])

  // ---------- 4 Silné stránky a motivace ----------
  const radkySilnych = p.silneStranky.map((s, i): RadekProfilu => ({
    nazev: `${i + 1}. ${s.nazev}`,
    hodnota: s.hodnota === null ? null : String(s.hodnota),
    procenta: s.hodnota ?? 0,
    pasmo: null,
    stitek: "",
    duraz: i < 5,
    tlumeny: i >= 5,
  }))
  const pulka = Math.ceil(radkySilnych.length / 2)
  const radkyMotivace: RadekProfilu[] = [
    ...p.motivace.map((m) => ({
      nazev: m.nazev,
      hodnota: m.hodnota === null ? null : String(m.hodnota),
      procenta: m.hodnota ?? 0,
      pasmo: null,
      stitek: slovoOsobnosti(m.hodnota),
    })),
    ...(p.vzruseni !== null
      ? [
          {
            nazev: "Chuť riskovat",
            hodnota: String(p.vzruseni),
            procenta: p.vzruseni,
            pasmo: null,
            stitek: slovoOsobnosti(p.vzruseni),
          },
        ]
      : []),
  ]
  ss.strana(vnitrni("Silné stránky a motivace"), [
    ss.skupina([
      ss.text("Silné stránky charakteru", STYL.h1),
      ss.mezera(1.2),
      ss.text(
        "24 silných stránek (IPIP-VIA-R) od nejsilnější. Čte se hlavně pořadí: horních pět je to, čím člověk nejvíc je.",
      ),
    ]),
    ss.sloupce(
      [
        { blok: ss.profil(radkySilnych.slice(0, pulka), null, { mezera: 2.2, sirkaNazvu: 0.55 }) },
        { blok: ss.profil(radkySilnych.slice(pulka), null, { mezera: 2.2, sirkaNazvu: 0.55 }) },
      ],
      8,
    ),
    ss.skupina([
      ss.text(g("Co {ho|ji} pohání a co brzdí"), STYL.h1),
      ss.mezera(1.2),
      ss.text(
        "Motivace k odměně a citlivost na hrozbu (IPIP BIS/BAS). Chuť riskovat stojí za pozornost hlavně ve sportech s rizikem zranění.",
      ),
      ss.mezera(3.6),
      ss.profil(radkyMotivace, null),
    ]),
    ss.zapis(ts.poznamkyZRozhovoru, 2),
  ])

  // ---------- 5 Stres, spánek a spolehlivost ----------
  const ch = p.chronotyp
  const poznamkySpanku = ch
    ? [
        ch.spankuPrace < 8
          ? "Ve dny s tréninkem spí méně než 8 hodin; u mladých sportovců to souvisí s vyšším rizikem zranění."
          : "",
        ch.socialniJetlag >= 2 ? "Velký rozdíl mezi všedními a volnými dny rozhazuje vnitřní hodiny." : "",
        ch.typ.startsWith("vecerni")
          ? g("Ranní tréninky a zápasy {mu|jí} budou sedět hůř; náročné věci dávej spíš odpoledne.")
          : ch.typ.startsWith("ranni")
            ? "Nejlíp funguje dopoledne; pozdní večerní zápasy mohou být náročnější."
            : "",
        ch.budik ? g("Ve volné dny {ho|ji} budí budík, typ je proto jen orientační.") : "",
      ]
        .filter(Boolean)
        .join(" ")
    : ""
  const stres = ss.skupina([
    ss.h3("Míra stresu za poslední týden"),
    ss.mezera(0.8),
    ss.text(p.stres ? STRES_SLOVO[p.stres.pasmo] : "nezodpovězeno", { ...STYL.h1, pt: 15 }),
    p.stres && ss.text(`${p.stres.body} bodů z 42 · DASS-21, škála stresu`, STYL.mala),
    p.stres && ss.mezera(2),
    p.stres &&
      ss.text(
        p.stres.pasmo === "bezna"
          ? "Zátěž odpovídá běžnému životu sportovce."
          : "Zátěž je vyšší než obvykle. Zjisti, co se teď děje, a zvaž úpravu tréninkové zátěže.",
      ),
  ])
  const spanek = ss.skupina([
    ss.h3("Spánek a rytmus"),
    ss.mezera(0.8),
    ss.text(ch ? CHRONOTYP_SLOVO[ch.typ] : "nezodpovězeno", { ...STYL.h1, pt: 15 }),
    ch && ss.text("chronotyp podle středu spánku ve volné dny (MCTQ)", STYL.mala),
    ch && ss.mezera(2),
    ch &&
      ss.udaje([
        { popis: "střed spánku ve volné dny", hodnota: CAS(ch.stredVolno) },
        { popis: "spánek v pracovní dny", hodnota: `${cislo(ch.spankuPrace)} h` },
        { popis: "sociální jetlag", hodnota: `${cislo(ch.socialniJetlag)} h` },
      ]),
    poznamkySpanku && ss.mezera(2),
    poznamkySpanku && ss.text(poznamkySpanku),
  ])
  const spolehlivost = ss.skupina([
    ss.text("Spolehlivost vyplnění", STYL.h2),
    ss.mezera(2),
    ss.udaje([
      {
        popis: "Kontrolní otázky na pozornost",
        hodnota: `${sp.pozornost.z - sp.pozornost.chyb} / ${sp.pozornost.z} správně`,
      },
      { popis: "Nepravděpodobné odpovědi", hodnota: `${sp.nepravdepodobne.signalu} / ${sp.nepravdepodobne.z}` },
      {
        popis: "Konzistence dvojic podobných otázek",
        hodnota: `${sp.konzistence.prumer === null ? "–" : cislo(sp.konzistence.prumer)} · ${stavSlovem[sp.konzistence.stav]}`,
        barva: barvaStavu[sp.konzistence.stav],
      },
      {
        popis: "Sklon souhlasit se vším",
        hodnota: `${sp.souhlasnost.prumer === null ? "–" : cislo(sp.souhlasnost.prumer)} · ${stavSlovem[sp.souhlasnost.stav]}`,
        barva: barvaStavu[sp.souhlasnost.stav],
      },
      { popis: "Nejdelší řada stejných odpovědí", hodnota: String(sp.nejdelsiRada) },
      {
        popis: "Tempo",
        hodnota:
          sp.tempo.sekundNaOtazku === null
            ? "–"
            : `${ts.tempoHodnota(cislo(sp.tempo.sekundNaOtazku))} · ${stavSlovem[sp.tempo.stav]}`,
        barva: barvaStavu[sp.tempo.stav],
      },
    ]),
    sp.poznamky.length > 0 && ss.mezera(2),
    sp.poznamky.length > 0 && ss.text(sp.poznamky.join(" ")),
  ])
  ss.strana(vnitrni("Stres, spánek a spolehlivost"), [
    ss.text("Stres a spánek", STYL.h1),
    ss.sloupce([{ blok: stres }, { blok: spanek }], 8),
    spolehlivost,
    ss.text(
      "Zdroje: IPIP-NEO-120 (Johnson, 2014), IPIP-VIA-R (Bluemke a kol., 2021), IPIP BIS/BAS (Goldberg a kol., 2006), DASS-21 (Lovibond a Lovibond, 1995), MCTQ (Roenneberg a kol., 2003). Škály jsou převzaté, sportovní oblasti, typy, rizika a doporučení jsou výklad Winning Minds. Český překlad je pracovní a české normy zatím nejsou: skóre 0 až 100 je převedený průměr odpovědí, ne percentil.",
      STYL.mala,
    ),
    ss.zapis(ts.poznamkyZRozhovoru, 2),
  ])

  // ---------- 6 Pro sportovce ----------
  if (vstup.proKlienta) {
    const odstavce = shrnuti(p).map(g)
    const [prvni, ...dalsi] = odstavce
    const stOdstavec: Styl = { pt: 10.4, barva: PAPIR.inkoust, proklad: 1.5 }
    ss.stranaVeVariantach(
      { vlevo: t.brand, vpravo: g(ts.proKlienta.sport), znacka: true },
      [5.8, 4.6, 3.8].map((mezera) => ({
        mezera,
        bloky: [
          ss.uvod(`Shrnutí · ${datum}`, person.name, ["Co z profilu plyne, bez čísel a odborných pojmů."], 22),
          prvni && ss.text(prvni, { pt: 12, barva: PAPIR.inkoust, proklad: 1.5 }),
          dalsi.length > 0 &&
            ss.box(
              ss.skupina(
                dalsi.map((x) => ss.text(x, stOdstavec)),
                2.4,
              ),
            ),
          ss.zapis(ts.mojeJednaVec, 2, 4),
          ss.zapis(ts.podleCehoPoznam, 1, 3),
          ss.zapis(ts.kdoMiPomuze, 1, 2),
          ss.podpisy([ts.kouc, g(ts.klient.sport), ts.datumRozhovoru]),
        ],
      })),
      { paticka: g(ts.patickaProKlienta.sport) },
    )
  }

  return ss
}

export function buildProfil360Pdf(vstup: Profil360PdfVstup): Blob {
  return sestavProfil360Pdf(vstup).dokonci(UI.cs.confidential)
}
