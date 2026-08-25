// Kontrola sazby všech exportů, které aplikace vydává klientovi z ruky.
//
// Typová kontrola o rozvržení nic neví. Text může vytéct za okraj strany, dva
// popisky se mohou překrýt a do dokumentu se může dostat výplň typu undefined.
// Pozná se to až v ruce – a ELITE report, vzorce, archetypy, manuál i obě
// týmová PDF si nikdo prohlížet po každé změně nebude.
//
// Tenhle test proto každý export opravdu vyrobí, přečte ho zpátky přes pdf.js
// a ptá se na tři věci naráz: nic není za okrajem sazby, žádné dva texty
// neleží přes sebe a v textu není výplň. Obsah jednotlivých reportů hlídají
// vlastní testy; tady jde jen o rozvržení.
//
// Spouští se `node scripts/test-sazba.cjs`.

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

const vstup = path.join(KOREN, "scripts", ".sazba-vstup.ts")
const vystup = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "sazba-")), "sazba.cjs")
fs.writeFileSync(
  vstup,
  `export { buildReportPdf } from "../lib/diagnostic/pdf/report-pdf"
export { buildVzorcePdf } from "../lib/vzorce/pdf"
export { buildArchetypyPdf } from "../lib/archetypy/pdf"
export { buildManualPdf } from "../lib/diagnostic/manual-pdf"
export { buildTymPdf } from "../lib/tym/pdf"
export { buildHracPdf } from "../lib/tym/pdf-hrace"
export { A4, OKRAJ } from "../lib/diagnostic/pdf/sazba"
export { getStructure, ELITE200_FACETS, ELITE200_REVERSED } from "../lib/diagnostic/structure"\nexport { evaluate } from "../lib/diagnostic/scoring"
export { tymovyProfil } from "../lib/tym/agregace"
export { vyhodnoceniHrace } from "../convex/vyhodnoceniHrace"
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

// ---------------------------------------------------------------------------
// Měření hotového PDF
// ---------------------------------------------------------------------------

const NA_MM = 25.4 / 72
const PRAVY_KRAJ = M.A4.sirka - M.OKRAJ.pravy

const VYPLN = [
  [/undefined/, "undefined"],
  [/NaN/, "NaN"],
  [/\[object /, "[object Object]"],
  [/\{[^}]*\|[^}]*\}/, "nerozvinutá značka rodu"],
]

/**
 * Sazba na šířku má jiné okraje než sazba na výšku. Kontrola okraje se proto
 * řídí skutečnou šířkou stránky, ne konstantou pro A4 na výšku.
 */
function okrajeStrany(sirkaMm) {
  const naSirku = sirkaMm > M.A4.sirka + 1
  return naSirku
    ? { levy: M.OKRAJ.horni, pravy: sirkaMm - M.OKRAJ.horni }
    : { levy: M.OKRAJ.levy, pravy: PRAVY_KRAJ }
}

async function zmer(blob) {
  const { getDocument } = await import("pdfjs-dist/legacy/build/pdf.mjs")
  const data = new Uint8Array(await blob.arrayBuffer())
  const doc = await getDocument({ data, useSystemFonts: true }).promise
  const zaOkrajem = []
  const prekryvy = []
  const strany = []
  for (let i = 1; i <= doc.numPages; i++) {
    const stranka = await doc.getPage(i)
    const sirkaMm = stranka.view[2] * NA_MM
    const kraj = okrajeStrany(sirkaMm)
    const polozky = (await stranka.getTextContent()).items.filter((x) => x.str.trim())
    strany.push(polozky.map((x) => x.str).join(" "))

    for (const x of polozky) {
      const zacatek = x.transform[4] * NA_MM
      const konec = zacatek + x.width * NA_MM
      if (konec > kraj.pravy + 0.5 || zacatek < kraj.levy - 0.5) {
        zaOkrajem.push(`strana ${i}: „${x.str.slice(0, 40)}" ${zacatek.toFixed(1)}–${konec.toFixed(1)} mm`)
      }
    }

    const boxy = polozky.map((x) => ({
      t: x.str,
      x: x.transform[4] * NA_MM,
      y: x.transform[5] * NA_MM,
      w: x.width * NA_MM,
      h: x.height * NA_MM,
    }))
    for (let a = 0; a < boxy.length; a++) {
      for (let b = a + 1; b < boxy.length; b++) {
        const A = boxy[a]
        const B = boxy[b]
        const vodorovne = A.x < B.x + B.w - 0.2 && B.x < A.x + A.w - 0.2
        const svisle = Math.abs(A.y - B.y) < Math.min(A.h, B.h) * 0.55
        if (vodorovne && svisle) prekryvy.push(`strana ${i}: „${A.t}" přes „${B.t}"`)
      }
    }
  }
  return { pocetStran: doc.numPages, zaOkrajem, prekryvy, vse: strany.join("\n") }
}

async function zkontroluj(popis, blob) {
  const { pocetStran, zaOkrajem, prekryvy, vse } = await zmer(blob)
  const vypln = VYPLN.filter(([vzor]) => vzor.test(vse)).map(([, p]) => p)
  const potize = []
  if (zaOkrajem.length) potize.push(`za okrajem: ${zaOkrajem.slice(0, 2).join("; ")}`)
  if (prekryvy.length) potize.push(`překryv: ${prekryvy.slice(0, 2).join("; ")}`)
  if (vypln.length) potize.push(`výplň: ${vypln.join(", ")}`)
  rekni(!potize.length, `${popis}: sazba drží (${pocetStran} stran)${potize.length ? ` – ${potize.join(" | ")}` : ""}`)
}

// ---------------------------------------------------------------------------
// Vyplnění dotazníků
// ---------------------------------------------------------------------------

const S200 = M.getStructure("elite200")
const OBRACENE = new Set(M.ELITE200_REVERSED)

/** ELITE: vyplnění, které projde kontrolami validity a má rozdíly mezi oblastmi. */
function elite(model, posun = 0) {
  const s = M.getStructure(model)
  const a = {}
  // elite100 nese položky přímo na dimenzi, elite200 až na fazetách.
  const obracene = new Set(s.reversedItems)
  s.dimensions.forEach((d, i) => {
    const uroven = [4, 2, 5, 3, 4, 2, 3][(i + posun) % 7]
    const polozky = d.items ?? M.ELITE200_FACETS.filter((f) => f.dimension === d.id).flatMap((f) => f.items)
    for (const polozka of polozky) a[polozka] = obracene.has(polozka) ? 6 - uroven : uroven
  })
  for (let i = 1; i <= s.itemCount; i++) if (a[i] === undefined) a[i] = 3
  for (const [polozka, hodnota] of Object.entries(s.validity.attention)) a[Number(polozka)] = hodnota
  if (s.validity.infrequency) {
    for (const i of s.validity.infrequency.expectAgree) a[i] = 4
    for (const i of s.validity.infrequency.expectDisagree) a[i] = 2
  }
  for (const i of s.validity.honesty.items) a[i] = 2
  return a
}

/** Vzorce i archetypy: šestibodová škála, střídavě, ať vyjdou různá pásma. */
function sestibodove(pocet, posun) {
  const a = {}
  for (let i = 1; i <= pocet; i++) a[i] = [5, 3, 6, 2, 4, 1][(i + posun) % 6]
  return a
}

const OSOBA = {
  cs: { name: "Testovací Klientka", role: "tenis, univerzitní úroveň", gender: "female", fillDate: "2026-08-25" },
  sk: { name: "Testovacia Klientka", role: "tenis, univerzitná úroveň", gender: "female", fillDate: "2026-08-25" },
  en: { name: "Test Client", role: "tennis, collegiate level", gender: "female", fillDate: "2026-08-25" },
}

const JAZYKY = ["cs", "sk", "en"]

;(async () => {
  console.log("– ELITE report –")
  for (const testId of ["elite200-sport", "elite200-business", "elite100-sport", "elite100-business"]) {
    const model = testId.startsWith("elite200") ? "elite200" : "elite100"
    for (const lang of JAZYKY) {
      const answers = elite(model, testId.includes("business") ? 3 : 0)
      await zkontroluj(
        `${testId} ${lang}`,
        M.buildReportPdf({ testId, person: OSOBA[lang], answers, lang, durationSec: 2400 }),
      )
    }
  }

  console.log("\n– emocionálně-destruktivní vzorce –")
  for (const testId of ["vzorce", "vzorce-sport-individual", "vzorce-sport-tym"]) {
    for (const lang of JAZYKY) {
      await zkontroluj(
        `${testId} ${lang}`,
        M.buildVzorcePdf({
          testId,
          person: OSOBA[lang],
          answers: sestibodove(110, testId === "vzorce" ? 0 : 2),
          lang,
          durationSec: 1500,
        }),
      )
    }
  }

  console.log("\n– archetypy –")
  for (const testId of ["archetypy", "archetypy-sport"]) {
    for (const lang of JAZYKY) {
      await zkontroluj(
        `${testId} ${lang}`,
        M.buildArchetypyPdf({
          testId,
          person: OSOBA[lang],
          answers: sestibodove(96, testId === "archetypy" ? 1 : 4),
          lang,
          durationSec: 1200,
        }),
      )
    }
  }

  console.log("\n– manuál pro kouče –")
  for (const lang of JAZYKY) await zkontroluj(`manuál ${lang}`, M.buildManualPdf(lang))

  console.log("\n– týmová větev –")
  const { sestavTym, HRACKY } = require("./tym-fixture.cjs")
  const { profil, nazev, odpovedi } = sestavTym(M)
  for (const lang of ["cs", "en"]) {
    await zkontroluj(`týmový report ${lang}`, M.buildTymPdf({ nazev, ...profil }, lang))
    const hracka = M.vyhodnoceniHrace(odpovedi[0], {
      lang,
      tym: nazev,
      jmeno: HRACKY[0].stitek,
      gender: "zena",
      datum: "2026-08-25",
    })
    await zkontroluj(`vyhodnocení hráčky ${lang}`, M.buildHracPdf(hracka, lang))
  }

  console.log(chyb === 0 ? "\nSazba drží ve všech exportech" : `\nNALEZENO CHYB: ${chyb}`)
  process.exit(chyb === 0 ? 0 : 1)
})()
