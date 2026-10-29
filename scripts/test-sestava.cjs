// Kontrola obsahu tiskové sestavy.
//
// Sazbu (okraje, překryvy, přetečení) hlídá test-sazba.cjs. Tady jde o to, co
// v sestavě je: otázky do rozhovoru ve všech jazycích, správný počet stran,
// strana pro sportovce jen tehdy, když ji kouč zaškrtne, a na ní žádná čísla.
// A rod: sportovkyně nesmí dostat text v mužském rodě.
//
// Spouští se `node scripts/test-sestava.cjs`.

const fs = require("fs")
const os = require("os")
const path = require("path")
const { execFileSync } = require("child_process")

const KOREN = path.join(__dirname, "..")

let chyb = 0
const rekni = (ok, text) => {
  if (!ok) chyb++
  console.log(`${ok ? "OK   " : "CHYBA"} ${text}`)
}

const esbuild = path.join(KOREN, "node_modules", ".bin", "esbuild")
if (!fs.existsSync(esbuild)) {
  console.error("Chybí esbuild v node_modules. Spusť `npm install`.")
  process.exit(1)
}

const vstup = path.join(KOREN, "scripts", ".sestava-vstup.ts")
const vystup = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "sestava-")), "sestava.cjs")
fs.writeFileSync(
  vstup,
  `export { buildReportPdf } from "../lib/diagnostic/pdf/report-pdf"
export { buildVzorcePdf } from "../lib/vzorce/pdf"
export { buildArchetypyPdf } from "../lib/archetypy/pdf"
export { buildProfil360Pdf } from "../lib/profil360/pdf"
export { OTAZKY_FAZET, OTAZKY_DIMENZI } from "../lib/diagnostic/otazky"
export { TEXTY_SESTAVY } from "../lib/diagnostic/pdf/sestava-texty"
export { getStructure, ELITE200_FACETS } from "../lib/diagnostic/structure"
export { evaluate } from "../lib/diagnostic/scoring"
export { buildSummary } from "../lib/diagnostic/summary"
export { getFacetContent } from "../lib/diagnostic/content"
export { applyGender } from "../lib/diagnostic/gender"
export { OBLASTI, TYPY } from "../lib/profil360/profil"
export { SKALY, KONTROLNI } from "../lib/profil360/klic"
export { popisKontextu } from "../lib/profil360/kontext"
`,
)
let M
try {
  execFileSync(esbuild, [vstup, "--bundle", "--format=cjs", "--platform=node", `--outfile=${vystup}`], {
    stdio: ["ignore", "ignore", "inherit"],
  })
  M = require(vystup)
} finally {
  fs.rmSync(vstup, { force: true })
}

const JAZYKY = ["cs", "sk", "en"]
const ZNACKA = /\{[^{}"]*\}/g
const MA_ZNACKU = /\{[^{}"]*\}/
const celaSlova = (t) => (t.match(ZNACKA) ?? []).every((z) => /^\{[^|{}]+\|[^|{}]+\}$/.test(z))

// ---- 1) otázky do rozhovoru ----

const fazety = M.ELITE200_FACETS.map((f) => f.id)
const chybiFazety = fazety.filter((id) => JAZYKY.some((l) => !M.OTAZKY_FAZET[id]?.[l]?.trim()))
rekni(
  !chybiFazety.length,
  `otázka ke každé z ${fazety.length} dílčích oblastí ve všech jazycích${chybiFazety.length ? ` (chybí ${chybiFazety.join(", ")})` : ""}`,
)
const dimenze = ["A", "B", "C", "D", "E", "F", "G"]
rekni(
  dimenze.every((d) => JAZYKY.every((l) => M.OTAZKY_DIMENZI[d]?.[l]?.trim())),
  "otázka ke každé ze 7 oblastí (ELITE 100) ve všech jazycích",
)
const vsechnyOtazky = [...Object.values(M.OTAZKY_FAZET), ...Object.values(M.OTAZKY_DIMENZI)]
rekni(
  vsechnyOtazky.every((o) => JAZYKY.every((l) => o[l].trim().endsWith("?"))),
  "každá otázka končí otazníkem",
)
rekni(
  vsechnyOtazky.every((o) => celaSlova(o.cs) && celaSlova(o.sk) && !MA_ZNACKU.test(o.en)),
  "rodové značky jen česky a slovensky, celá slova",
)
rekni(!JSON.stringify(vsechnyOtazky).includes("\u2014"), "otázky bez dlouhé pomlčky")
rekni(
  M.OBLASTI.every((o) => o.otazka?.trim().endsWith("?") && celaSlova(o.otazka)),
  "Profil 360: otázka ke každé z 9 oblastí",
)
const textySestavy = JSON.stringify(M.TEXTY_SESTAVY)
rekni(!textySestavy.includes("\u2014"), "texty sestavy bez dlouhé pomlčky")
rekni(
  JAZYKY.every((l) => celaSlova(JSON.stringify(M.TEXTY_SESTAVY[l]))) &&
    !MA_ZNACKU.test(JSON.stringify(M.TEXTY_SESTAVY.en)),
  "texty sestavy: značky rodu celá slova, angličtina bez značek",
)
rekni(
  M.TYPY.every((t) => celaSlova(t.nazev)) &&
    M.applyGender(M.TYPY.find((t) => t.id === "bojovnik").nazev, "female") === "Bojovnice",
  "Profil 360: názvy typů v rodě sportovce (Bojovnice)",
)
rekni(
  M.popisKontextu({ 3003: 3, 3004: 2, 3006: 3 }).join(" · ") ===
    "soutěží 6 až 10 let · jedno vážnější zranění za poslední rok · trénuje 11 až 15 hodin týdně",
  "Profil 360: kontext sportovce čitelnými frázemi",
)

// ---- 2) hotová PDF ----

const VYPLN = [
  [/undefined/, "undefined"],
  [/NaN/, "NaN"],
  [/\[object /, "[object Object]"],
  [/\{[^}]*\|[^}]*\}/, "nerozvinutá značka rodu"],
  [/\u2014/, "dlouhá pomlčka"],
]

async function strany(blob) {
  const { getDocument } = await import("pdfjs-dist/legacy/build/pdf.mjs")
  const doc = await getDocument({ data: new Uint8Array(await blob.arrayBuffer()), useSystemFonts: true }).promise
  const out = []
  for (let i = 1; i <= doc.numPages; i++) {
    const s = await doc.getPage(i)
    out.push((await s.getTextContent()).items.map((x) => x.str).join(" "))
  }
  return out
}
// Prostrkané nadpisy se do textové vrstvy dostanou po písmenech; porovnává se bez mezer.
const bez = (t) => t.replace(/\s+/g, "").toLowerCase()
const obsahuje = (strana, text) => bez(strana).includes(bez(text))

function vyplnVPdf(popis, stranky) {
  const vse = stranky.join("\n")
  const nalez = VYPLN.filter(([v]) => v.test(vse)).map(([, p]) => p)
  rekni(!nalez.length, `${popis}: v textu není výplň${nalez.length ? ` (${nalez.join(", ")})` : ""}`)
}

/**
 * Vzor pro text, který může být v PDF prostrkaný: mezi každými dvěma znaky
 * smí být mezera. „12. 10. 2026“ v drobném nadpisu přijde jako „1 2 . 1 0 …“.
 */
const volne = (text) =>
  new RegExp(
    text
      .replace(/\s+/g, "")
      .split("")
      .map((z) => z.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
      .join("\\s*"),
    "giu",
  )

/** Strana pro sportovce nesmí obsahovat čísla, kromě data, čísla strany a „12 týdnů“. */
function bezCisel(popis, strana, datum) {
  const zbytek = strana
    .replace(volne(datum), "")
    .replace(/\d+\s*\/\s*\d+\s*$/, "")
    .replace(volne("12 týdnů"), "")
    .replace(volne("12 týždňov"), "")
    .replace(volne("12 weeks"), "")
  const cisla = zbytek.match(/\d+/g)
  rekni(!cisla, `${popis}: strana pro sportovce je bez čísel${cisla ? ` (našlo ${cisla.slice(0, 5).join(", ")})` : ""}`)
}

/** ELITE: vyplnění s rozdíly mezi oblastmi, které projde kontrolami validity. */
function elite(model, posun = 0) {
  const s = M.getStructure(model)
  const a = {}
  const obracene = new Set(s.reversedItems)
  s.dimensions.forEach((d, i) => {
    const uroven = [4, 2, 5, 3, 4, 2, 3][(i + posun) % 7]
    const polozky = d.items ?? M.ELITE200_FACETS.filter((f) => f.dimension === d.id).flatMap((f) => f.items)
    for (const p of polozky) a[p] = obracene.has(p) ? 6 - uroven : uroven
  })
  for (let i = 1; i <= s.itemCount; i++) if (a[i] === undefined) a[i] = 3
  for (const [p, h] of Object.entries(s.validity.attention)) a[Number(p)] = h
  if (s.validity.infrequency) {
    for (const i of s.validity.infrequency.expectAgree) a[i] = 4
    for (const i of s.validity.infrequency.expectDisagree) a[i] = 2
  }
  for (const i of s.validity.honesty.items) a[i] = 2
  return a
}

const sestibodove = (pocet, posun) => {
  const a = {}
  for (let i = 1; i <= pocet; i++) a[i] = [5, 3, 6, 2, 4, 1][(i + posun) % 6]
  return a
}

function profil360(uroven) {
  const a = {}
  for (const s of M.SKALY) {
    for (const id of s.polozky) a[id] = s.kod === "DASS.stress" ? 1 : s.obracene.includes(id) ? 6 - uroven : uroven
  }
  for (const k of M.KONTROLNI) a[k.id] = k.ocekavano[0]
  Object.assign(a, { 4001: 23 * 60, 4002: 7 * 60, 4003: 0, 4004: 9 * 60, 4005: 2, 3001: 1, 3002: 2 })
  return a
}

const OSOBA = {
  cs: { name: "Tereza Malá", role: "volejbal", gender: "female", fillDate: "2026-10-12" },
  sk: { name: "Tereza Malá", role: "volejbal", gender: "female", fillDate: "2026-10-12" },
  en: { name: "Tereza Mala", role: "volleyball", gender: "female", fillDate: "2026-10-12" },
}
const DATUM = { cs: "12. 10. 2026", sk: "12. 10. 2026", en: "12 Oct 2026" }

;(async () => {
  console.log("\n– ELITE 200 –")
  for (const lang of JAZYKY) {
    const answers = elite("elite200")
    const zaklad = { testId: "elite200-sport", person: OSOBA[lang], answers, lang, durationSec: 2400 }
    const bezKlienta = await strany(M.buildReportPdf(zaklad))
    const sKlientem = await strany(M.buildReportPdf({ ...zaklad, proKlienta: true }))
    rekni(bezKlienta.length === 6, `${lang}: bez strany pro sportovce 6 stran (má ${bezKlienta.length})`)
    rekni(sKlientem.length === 7, `${lang}: se stranou pro sportovce 7 stran (má ${sKlientem.length})`)
    vyplnVPdf(`ELITE 200 ${lang}`, sKlientem)

    const r = M.evaluate(M.getStructure("elite200"), answers, { durationSec: 2400 })
    const t = M.TEXTY_SESTAVY[lang]
    const prvni = sKlientem[0]
    const chybi = r.weakest.filter(
      (w) =>
        !obsahuje(prvni, M.getFacetContent(w.id).name[lang]) ||
        !obsahuje(prvni, M.applyGender(M.OTAZKY_FAZET[w.id][lang], "female")),
    )
    rekni(
      !chybi.length,
      `${lang}: na přehledu jsou tři nejslabší dílčí oblasti i s otázkami${chybi.length ? ` (chybí ${chybi.map((w) => w.id).join(", ")})` : ""}`,
    )
    rekni(
      obsahuje(prvni, t.naCemStavet) && obsahuje(prvni, t.doRozhovoru(3)),
      `${lang}: přehled má na čem stavět a věci do rozhovoru`,
    )
    const plan = sKlientem[5]
    rekni(
      obsahuje(plan, t.planTitul) && r.weakest.every((w) => obsahuje(plan, M.getFacetContent(w.id).name[lang])),
      `${lang}: plán rozvoje se třemi nejslabšími oblastmi`,
    )
    const klient = sKlientem[6]
    const summary = M.buildSummary(r, lang)
    rekni(
      obsahuje(klient, M.applyGender(summary.overall, "female").slice(0, 40)),
      `${lang}: strana pro sportovce má shrnutí z aplikace`,
    )
    bezCisel(`${lang}`, klient, DATUM[lang])
    if (lang !== "en") {
      rekni(
        obsahuje(klient, lang === "cs" ? "Pro sportovkyni" : "Pre športovkyňu") &&
          obsahuje(klient, lang === "cs" ? "Sportovkyně" : "Športovkyňa"),
        `${lang}: strana pro sportovkyni je v ženském rodě`,
      )
    }
    rekni(
      !bezKlienta.some((s) => obsahuje(s, t.mojeJednaVec)),
      `${lang}: bez zaškrtnutí žádný pracovní list pro sportovce`,
    )
  }

  console.log("\n– ELITE 100 a byznys –")
  for (const testId of ["elite100-sport", "elite200-business"]) {
    const model = testId.startsWith("elite200") ? "elite200" : "elite100"
    const s = await strany(
      M.buildReportPdf({
        testId,
        person: OSOBA.cs,
        answers: elite(model, 2),
        lang: "cs",
        durationSec: 1800,
        proKlienta: true,
      }),
    )
    rekni(s.length === 7, `${testId}: 7 stran se stranou pro klienta (má ${s.length})`)
    vyplnVPdf(testId, s)
    if (testId.includes("business")) rekni(obsahuje(s[6], "Pro klientku"), `${testId}: strana pro klientku`)
  }

  console.log("\n– vzorce, archetypy, Profil 360 –")
  const dalsi = [
    [
      "vzorce",
      (p) =>
        M.buildVzorcePdf({
          testId: "vzorce",
          person: OSOBA.cs,
          answers: sestibodove(110, 0),
          lang: "cs",
          durationSec: 1500,
          proKlienta: p,
        }),
      [4, 6],
    ],
    [
      "vzorce sport",
      (p) =>
        M.buildVzorcePdf({
          testId: "vzorce-sport-tym",
          person: OSOBA.en,
          answers: sestibodove(110, 2),
          lang: "en",
          durationSec: 1500,
          proKlienta: p,
        }),
      [4, 6],
    ],
    [
      "archetypy",
      (p) =>
        M.buildArchetypyPdf({
          testId: "archetypy",
          person: OSOBA.sk,
          answers: sestibodove(96, 1),
          lang: "sk",
          durationSec: 1200,
          proKlienta: p,
        }),
      [3, 5],
    ],
    [
      "Profil 360",
      (p) => M.buildProfil360Pdf({ person: OSOBA.cs, answers: profil360(3), durationSec: 2100, proKlienta: p }),
      [5, 5],
    ],
  ]
  for (const [popis, sestav, [od, po]] of dalsi) {
    const bezKlienta = await strany(sestav(false))
    const sKlientem = await strany(sestav(true))
    rekni(
      bezKlienta.length >= od && bezKlienta.length <= po && sKlientem.length === bezKlienta.length + 1,
      `${popis}: ${bezKlienta.length} stran, se stranou pro klienta o jednu víc (${sKlientem.length})`,
    )
    vyplnVPdf(popis, sKlientem)
    const posledni = sKlientem[sKlientem.length - 1]
    bezCisel(popis, posledni, popis === "vzorce sport" ? DATUM.en : DATUM.cs)
  }

  console.log(chyb === 0 ? "\nsestava v pořádku" : `\nNALEZENO CHYB: ${chyb}`)
  process.exit(chyb === 0 ? 0 : 1)
})()
