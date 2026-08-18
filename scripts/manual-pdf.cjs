// Vysází manuál pro kouče do docs/ ve všech třech jazycích.
//
// Texty jsou v lib/diagnostic/manual.ts, tedy tam, odkud je bere i záložka
// v aplikaci. Kdo upraví manuál, spustí tohle a PDF v docs/ se srovná;
// nic se nikde neopisuje podruhé.
//
// Kouč si stejné PDF stáhne přímo z aplikace, tyhle soubory jsou k ruce
// pro poslání e-mailem, aniž by se člověk musel přihlašovat.
//
// Spouští se `node scripts/manual-pdf.cjs`.

const fs = require("fs")
const os = require("os")
const path = require("path")
const { execFileSync } = require("child_process")

const KOREN = path.join(__dirname, "..")
const CIL = path.join(KOREN, "docs")

const esbuild = path.join(KOREN, "node_modules", ".bin", "esbuild")
if (!fs.existsSync(esbuild)) {
  console.error("Chybí esbuild v node_modules. Spusť `npm install`.")
  process.exit(1)
}

const vstup = path.join(KOREN, "scripts", ".manual-vstup.ts")
const vystup = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "manual-")), "manual.cjs")
fs.writeFileSync(
  vstup,
  `export { buildManualPdf, manualPdfFileName } from "../lib/diagnostic/manual-pdf"
export { JAZYKY } from "../lib/diagnostic/lang"
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

;(async () => {
  for (const lang of M.JAZYKY) {
    const blob = M.buildManualPdf(lang)
    const soubor = path.join(CIL, M.manualPdfFileName(lang))
    fs.writeFileSync(soubor, Buffer.from(await blob.arrayBuffer()))
    console.log(`${lang}: ${path.relative(KOREN, soubor)}`)
  }
  console.log("Hotovo.")
})()
