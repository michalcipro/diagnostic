// Simulace týmového vyhodnocení na vymyšleném týmu.
//
// Šest hráček univerzitního tenisu v USA, každá s jiným profilem. Slouží
// k tomu, aby se dal týmový report přečíst celý na skutečně vypadajících
// datech dřív, než ho uvidí kouč. Nic se nikam neukládá, běží to lokálně.
//
// Spouští se `node scripts/simulace-tym.cjs`.

const fs = require("fs")
const os = require("os")
const path = require("path")
const { execFileSync } = require("child_process")

const KOREN = path.join(__dirname, "..")
const JAZYK = process.argv.includes("--en") ? "en" : "cs"

const esbuild = path.join(KOREN, "node_modules", ".bin", "esbuild")
if (!fs.existsSync(esbuild)) {
  console.error("Chybí esbuild v node_modules. Spusť `npm install`.")
  process.exit(1)
}

const vstup = path.join(KOREN, "scripts", ".simulace-vstup.ts")
const vystup = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "sim-")), "sim.cjs")
fs.writeFileSync(
  vstup,
  `export { evaluate } from "../lib/diagnostic/scoring"
export { getStructure, ELITE200_FACETS, ELITE200_REVERSED, ELITE200_DIMENSIONS } from "../lib/diagnostic/structure"
export { tymovyProfil } from "../lib/tym/agregace"
export { TYM } from "../lib/tym/obsah"
export { buildTymPdf, tymPdfFileName } from "../lib/tym/pdf"
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

const S200 = M.getStructure("elite200")
const OBRACENE = new Set(M.ELITE200_REVERSED)

const { HRACKY, NAZEV, POZVANO, sestavTym } = require("./tym-fixture.cjs")

const { vysledky, profil } = sestavTym(M)
const t = M.TYM[JAZYK]
const nazevOblasti = (id) => t.oblasti[id]

// ---------------------------------------------------------------------------
// Výpis
// ---------------------------------------------------------------------------

const cara = (z = "=") => console.log(z.repeat(78))
const zaokrouhli = (x) => Math.round(x)

cara()
console.log(`  ${t.titul.toUpperCase()}: ${NAZEV}`)
cara()
console.log(t.pocty(profil.odevzdano, profil.pozvano))
console.log(`Započteno do profilu: ${profil.zapocteno}`)
console.log()

console.log("– kdo tým tvoří (jen pro tenhle výpis, kouč tohle v reportu nevidí) –")
for (const [i, h] of HRACKY.entries()) {
  const v = vysledky[i]
  const prehled = v.dimensions.map((d) => `${d.id}:${zaokrouhli(d.percent)}`).join("  ")
  const val = v.validity
  const rozpad =
    `pozornost ${val.attention.status}(${val.attention.errors}/${val.attention.total})` +
    (val.infrequency ? `  infrekvence ${val.infrequency.status}(${val.infrequency.signals})` : "") +
    `  konzistence ${val.consistency.status}(prum. rozdil ${val.consistency.meanDiff}, paru nad 3: ${val.consistency.pairsOver3})` +
    (val.pace ? `  tempo ${val.pace.status}` : "") +
    `\n  ${" ".repeat(9)} upřímnost ${val.honesty.status}(${val.honesty.score} z ${val.honesty.min} az ${val.honesty.max})` +
    `  styl ${val.responseStyle.status}(souhlas ${val.responseStyle.agreePct} %, nesouhlas ${val.responseStyle.disagreePct} %, ` +
    `extrem ${val.responseStyle.extremePct} %, serie ${val.responseStyle.longestRun}, priznaky: ${val.responseStyle.flags.join(",") || "zadne"})`
  console.log(`  ${h.stitek.padEnd(9)} ${prehled}   validita: ${val.overall}`)
  console.log(`  ${" ".repeat(9)} ${rozpad}`)
  console.log(`  ${" ".repeat(9)} ${h.popis}`)
}
console.log()

if (profil.maloDat) {
  console.log(`!! ${t.maloDatTitul}`)
  console.log(`   ${t.maloDat}`)
  console.log()
}

cara("-")
console.log(t.oblastiTitul)
cara("-")
console.log(t.oblastiUvod)
console.log()
for (const o of profil.oblasti) {
  const znacky = [
    o.plosna ? t.plosna : null,
    o.rozkol ? t.rozkol : null,
    o.rozptyl ? t.velkyRozptyl : null,
  ].filter(Boolean)
  console.log(
    `  ${o.id}  ${nazevOblasti(o.id).padEnd(52)} ` +
      `${String(zaokrouhli(o.prumer)).padStart(3)} %   ` +
      `rozptyl ${String(zaokrouhli(o.smodch)).padStart(2)}   ` +
      `rozsah ${zaokrouhli(o.min)} až ${zaokrouhli(o.max)}`,
  )
  console.log(
    `     pásma  priorita ${o.pasma.priority}  stabilizace ${o.pasma.stabilization}  ` +
      `silná ${o.pasma.strong}  elitní ${o.pasma.elite}` +
      (znacky.length ? `   [${znacky.join(" | ")}]` : ""),
  )
}
console.log()

const seznam = (ids) => (ids.length ? ids.map((id) => `${id} ${nazevOblasti(id)}`).join("\n     ") : t.zadne)
console.log(`${t.oporyTitul}\n     ${seznam(profil.opory)}\n`)
console.log(`${t.prioritTitul}\n     ${seznam(profil.priority)}\n`)
console.log(`${t.zlomyTitul}\n     ${seznam(profil.zlomy)}\n`)

cara("-")
console.log(`${t.nalezyTitul} (${profil.nalezy.length})`)
cara("-")
console.log(t.nalezyUvod)
console.log()
if (!profil.nalezy.length) console.log(t.bezNalezu)
for (const [i, n] of profil.nalezy.entries()) {
  const nt = t.nalezy[n.kod]
  const stitek = n.sila === "vysoka" ? `  [${t.silaVysoka}]` : ""
  console.log(`${i + 1}. ${nt.nadpis}${stitek}`)
  console.log(`   oblasti: ${n.oblasti.map((id) => `${id} ${nazevOblasti(id)}`).join(", ")}`)
  console.log(`   ${t.stitkyNalezu.coJeVidet}: ${nt.coJeVidet}`)
  console.log(`   ${t.stitkyNalezu.coToDela}: ${nt.coToDela}`)
  console.log(`   ${t.stitkyNalezu.coSTim}:`)
  for (const k of nt.coSTim) console.log(`      - ${k}`)
  console.log(`   ${t.stitkyNalezu.coNedelat}: ${nt.coNedelat}`)
  console.log()
}

// ---------------------------------------------------------------------------
// PDF, aby se dal report vidět tak, jak ho dostane kouč
// ---------------------------------------------------------------------------

const kamPdf = path.join(KOREN, "docs", "ukazka-tym-" + JAZYK + ".pdf")
;(async () => {
  const blob = M.buildTymPdf(profil, JAZYK)
  fs.writeFileSync(kamPdf, Buffer.from(await blob.arrayBuffer()))
  console.log(`PDF: ${path.relative(KOREN, kamPdf)}  (${(fs.statSync(kamPdf).size / 1024).toFixed(0)} kB)`)
})()
