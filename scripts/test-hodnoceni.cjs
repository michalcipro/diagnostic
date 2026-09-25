// Kontrola hodnocení trenéra a anonymního podkladu pro ověření validity.
//
// Za prvé úplnost textů: formulář jede česky, slovensky a anglicky a chybějící
// text by kouči ukázal prázdné místo u položky, kterou má hodnotit.
//
// Za druhé anonymizace exportu. Podklad odchází z aplikace k analýze, takže
// se tu ověřuje, že v něm nezůstalo jméno, datum narození ani identifikátor
// z databáze, že téhož sportovce drží pohromadě jeden pseudonym a že pořadí
// pseudonymů nekopíruje pořadí v databázi.
//
// Spouští se `node scripts/test-hodnoceni.cjs`.

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

const vstup = path.join(KOREN, "scripts", ".hodnoceni-vstup.ts")
const vystup = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "hodnoceni-")), "hodnoceni.cjs")
fs.writeFileSync(
  vstup,
  `export * from "../lib/diagnostic/hodnoceni-trenera"
export { sestavExportValidace, pasmoNarozeni } from "../lib/diagnostic/validace-export"
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

// ---- 1) texty ----

const JAZYKY = ["cs", "sk", "en"]
const textyJazyka = (t) => {
  const vse = []
  const projdi = (x) => {
    if (typeof x === "string") vse.push(x)
    else if (typeof x === "function") vse.push(x("1. ledna 2026"))
    else if (x && typeof x === "object") Object.values(x).forEach(projdi)
  }
  projdi(t)
  return vse
}

for (const l of JAZYKY) {
  const t = M.HODNOCENI_TEXTY[l]
  rekni(!!t, `${l}: texty existují`)
  if (!t) continue
  const chybi = M.POLOZKY_HODNOCENI.filter((p) => !t.polozky[p]?.otazka || !t.polozky[p]?.nizko || !t.polozky[p]?.vysoko)
  rekni(chybi.length === 0, `${l}: všechny položky mají otázku a oba konce stupnice${chybi.length ? ` (chybí ${chybi.join(", ")})` : ""}`)
  rekni(M.DELKA_VEDENI.every((k) => t.delka[k]), `${l}: všechny délky vedení mají popis`)
  rekni(M.CASTOST_POZOROVANI.every((k) => t.castost[k]), `${l}: všechny četnosti mají popis`)
  const vse = textyJazyka(t)
  rekni(vse.every((s) => s.trim().length > 0), `${l}: žádný text není prázdný`)
  rekni(!vse.some((s) => s.includes("\u2014")), `${l}: bez dlouhé pomlčky`)
  rekni(!vse.some((s) => /[{}]/.test(s)), `${l}: bez rodových značek (texty jsou pro kouče)`)
}
const sk = textyJazyka(M.HODNOCENI_TEXTY.sk).join(" ")
rekni(!/[řěů]/i.test(sk), "sk: žádná česká písmena ř, ě, ů")
for (const p of M.POLOZKY_HODNOCENI) {
  rekni(
    M.HODNOCENI_TEXTY.cs.polozky[p].otazka !== M.HODNOCENI_TEXTY.en.polozky[p].otazka,
    `en: položka ${p} je přeložená, ne zkopírovaná`,
  )
}

// ---- 2) pravidla ----

rekni(M.hodnotiSe("elite200-sport") && !M.hodnotiSe("elite200-business"), "hodnotí se jen sportovní varianty")
const pul = Object.fromEntries(M.POLOZKY_HODNOCENI.slice(0, 5).map((p) => [p, 4]))
const malo = Object.fromEntries(M.POLOZKY_HODNOCENI.slice(0, 4).map((p) => [p, 4]))
rekni(M.dostVyplneno(pul) && !M.dostVyplneno(malo), "stačí polovina položek, méně ne")
rekni(M.pasmoNarozeni("2007-03-14") === "2005-2009", "pásmo narození je pětileté")
rekni(M.pasmoNarozeni(undefined) === undefined && M.pasmoNarozeni("neznámo") === undefined, "bez data narození není pásmo")

// ---- 3) anonymizace exportu ----

const DEN = 24 * 60 * 60 * 1000
const t0 = Date.UTC(2026, 2, 10)
const vysledky = [
  { id: "k57abcDEFresult1", testId: "elite200-sport", lang: "cs", answers: '{"1":4}', birthDate: "2006-05-02", gender: "m", role: "volejbal, extraliga", durationSec: 1500, createdAt: t0 },
  { id: "k57abcDEFresult2", testId: "elite200-sport", lang: "en", answers: '{"1":2}', birthDate: "1999-11-30", gender: "f", role: "tennis", createdAt: t0 + DEN },
  { id: "k57abcDEFresult3", testId: "elite200-sport", lang: "cs", answers: '{"1":5}', createdAt: t0 + 2 * DEN },
]
const hodnoceni = [
  { resultId: "k57abcDEFresult1", hodnoty: [{ id: "tlak", hodnota: 6 }, { id: "navrat" }], delkaVedeni: "nad12", castostPozorovani: "pravidelne", createdAt: t0 + 10 * DEN },
  { resultId: "k57abcDEFresult1", hodnoty: [{ id: "tlak", hodnota: 5 }], delkaVedeni: "nad12", castostPozorovani: "pravidelne", createdAt: t0 + 120 * DEN },
  { resultId: "k57abcDEFresult2", hodnoty: [{ id: "uroven", hodnota: 7 }], delkaVedeni: "3-12", castostPozorovani: "obcas", createdAt: t0 + 5 * DEN },
  // hodnocení vyplnění, které export nesmí obsahovat (není mezi viditelnými)
  { resultId: "cizi-vysledek", hodnoty: [{ id: "tlak", hodnota: 1 }], delkaVedeni: "do3", castostPozorovani: "zridka", createdAt: t0 },
]

const radky = M.sestavExportValidace(vysledky, hodnoceni, () => 0.5)
const json = JSON.stringify(radky)
rekni(radky.length === 3, "export obsahuje jen hodnocení viditelných vyplnění")
rekni(!json.includes("k57abcDEF") && !json.includes("cizi-vysledek"), "export neobsahuje identifikátory z databáze")
rekni(!json.includes("2006-05-02") && !json.includes("1999-11-30"), "export neobsahuje datum narození")
rekni(radky.every((r) => /^S\d{3,}$/.test(r.sportovec)), "sportovci mají pseudonym S001…")
rekni(
  radky.every((r) => /^\d{4}-Q[1-4]$/.test(r.vyplnenoCtvrtleti) && /^\d{4}-Q[1-4]$/.test(r.hodnocenoCtvrtleti)),
  "data jsou zkrácená na čtvrtletí",
)
rekni(!/"20\d\d-\d\d(-\d\d)?"/.test(json), "v exportu není žádné přesné datum ani měsíc")
const dlouha = M.sestavExportValidace(
  [{ ...vysledky[0], role: "x".repeat(300) }],
  [hodnoceni[0]],
)
rekni(dlouha[0].role.length === 120, "role je zkrácená na 120 znaků jako v normativním vzorku")
const prvni = radky.filter((r) => r.lang === "cs" && r.answers === '{"1":4}')
rekni(prvni.length === 2 && prvni[0].sportovec === prvni[1].sportovec, "dvě hodnocení téhož sportovce mají stejný pseudonym")
rekni(new Set(radky.map((r) => r.sportovec)).size === 2, "různí sportovci mají různé pseudonymy")
rekni(prvni[0].hodnoty.navrat === null && prvni[0].hodnoty.tlak === 6, "„nemohu posoudit“ je null, hodnota zůstává")
rekni(M.POLOZKY_HODNOCENI.every((p) => p in radky[0].hodnoty), "každý řádek má všechny položky")
rekni(prvni.some((r) => r.odstupDni === 10) && prvni.some((r) => r.odstupDni === 120), "odstup hodnocení od vyplnění je ve dnech")
rekni(prvni[0].ageBand === "2005-2009", "věk je jen pětileté pásmo")

// Pořadí pseudonymů nesmí kopírovat pořadí v databázi: s jiným zdrojem
// náhody musí aspoň jednou vyjít jinak.
const prirazeni = (nahoda) => {
  const r = M.sestavExportValidace(vysledky, hodnoceni, nahoda)
  return r.find((x) => x.answers === '{"1":4}').sportovec
}
rekni(prirazeni(() => 0) !== prirazeni(() => 0.99), "pseudonymy závisí na zamíchání, ne na pořadí v databázi")

// Export v Convexu je jen pro mastera a zapisuje se do přístupového logu.
const convex = fs.readFileSync(path.join(KOREN, "convex", "hodnoceni.ts"), "utf8")
const exportTelo = convex.slice(convex.indexOf("export const exportValidace"))
rekni(exportTelo.includes("vyzadujMastera"), "export pouští jen mastera")
rekni(exportTelo.includes('zaznamenejPristup(ctx, me._id, "export-validace")'), "export se zapisuje do přístupového logu")
rekni(/!vidi\(d\.coachId\) \|\| !sdileno\(d\)/.test(exportTelo), "export obsahuje jen viditelná a sdílená vyplnění")

// Smazání vyplnění smaže i hodnocení (právo na výmaz).
const elite = fs.readFileSync(path.join(KOREN, "convex", "eliteDiagnostic.ts"), "utf8")
const uklid = fs.readFileSync(path.join(KOREN, "convex", "uklid.ts"), "utf8")
rekni(elite.includes('"hodnoceniTrenera"'), "smazání vyplnění maže i hodnocení trenéra")
rekni(uklid.includes('"hodnoceniTrenera"'), "úklid po lhůtě maže i hodnocení trenéra")

console.log(chyb === 0 ? "\nvše v pořádku" : `\nNALEZENO CHYB: ${chyb}`)
process.exit(chyb === 0 ? 0 : 1)
