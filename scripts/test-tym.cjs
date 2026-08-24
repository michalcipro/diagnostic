// Kontrola týmového vyhodnocení.
//
// Dvě věci naráz. Za prvé, jestli rozpoznávání vzorců opravdu najde to, co má:
// na uměle složených týmech se známou vlastností se ověřuje, že se ozve právě
// ten nález, který tam je, a neozve se nález, který tam není. Bez toho by se
// prahy daly nastavit tak, že se hlásí všechno nebo nic, a nikdo by si toho
// nevšiml, protože profil vždycky nějak vypadá.
//
// Za druhé úplnost textů. Týmová větev jede česky a anglicky; chybějící nebo
// jen zkopírovaný text by kouči vrátil prázdné místo tam, kde má být výklad.
//
// Spouští se `node scripts/test-tym.cjs`.

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

const vstup = path.join(KOREN, "scripts", ".tym-vstup.ts")
const vystup = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "tym-")), "tym.cjs")
fs.writeFileSync(
  vstup,
  `export { evaluate } from "../lib/diagnostic/scoring"
export { getStructure, ELITE200_FACETS, ELITE200_REVERSED } from "../lib/diagnostic/structure"
export { tymovyProfil } from "../lib/tym/agregace"
export { TYM } from "../lib/tym/obsah"
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

/** Hráč, u kterého mají vybrané oblasti či fazety zadanou úroveň 1 až 5. */
function hrac(zaklad, uprava = {}) {
  const a = {}
  for (const f of M.ELITE200_FACETS) {
    const uroven = uprava[f.id] ?? uprava[f.dimension] ?? zaklad
    for (const i of f.items) a[i] = OBRACENE.has(i) ? 6 - uroven : uroven
  }
  for (let i = 1; i <= 200; i++) if (a[i] === undefined) a[i] = 3
  return a
}

const profil = (hraci) =>
  M.tymovyProfil("Zkouška", hraci.length, hraci.length, hraci.map((a) => M.evaluate(S200, a, { durationSec: 2400 })))

const kody = (p) => p.nalezy.map((n) => n.kod)

console.log("– rozpoznávání vzorců –")

const opakuj = (n, f) => Array.from({ length: n }, f)

{
  const p = profil(opakuj(12, () => hrac(4)))
  rekni(kody(p).includes("vyrovnany-zaklad"), "vyrovnaný silný tým se pozná jako vyrovnaný základ")
  rekni(kody(p).length === 1, "u vyrovnaného týmu se nehlásí nic dalšího")
  rekni(p.opory.length > 0 && p.priority.length === 0, "vyrovnaný tým má opory a žádné priority")
}
{
  const p = profil(opakuj(12, () => hrac(3, { B: 5, G1: 1 })))
  rekni(kody(p).includes("sebejista-ticha-satna"), "sebejistá a tichá kabina se pozná")
  rekni(!kody(p).includes("vyrovnany-zaklad"), "tichá kabina se nehlásí jako vyrovnaný základ")
}
{
  const p = profil([...opakuj(6, () => hrac(3, { D: 5 })), ...opakuj(6, () => hrac(3, { D: 1 }))])
  rekni(kody(p).includes("zlom-pod-tlakem"), "rozdělený tým se pozná jako zlomová linie")
  rekni(p.zlomy.includes("D"), "zlom je vidět v oblasti práce s tlakem")
}
{
  const p = profil(opakuj(12, () => hrac(3, { E: 5, F2: 1 })))
  rekni(kody(p).includes("trajektorie-vyhoreni"), "dřina bez regenerace se pozná")
}
{
  const p = profil(opakuj(12, () => hrac(2)))
  rekni(kody(p).length >= 3, "plošně slabý tým má víc nálezů")
  rekni(!kody(p).includes("vyrovnany-zaklad"), "plošně slabý tým není vyrovnaný základ")
  rekni(p.oblasti.every((o) => o.plosna), "u plošně slabého týmu je slabina označená jako plošná")
}
{
  const p = profil(opakuj(3, () => hrac(4)))
  rekni(p.maloDat, "u tří hráčů se hlásí, že je málo dat")
  const velky = profil(opakuj(12, () => hrac(4)))
  rekni(!velky.maloDat, "u dvanácti hráčů se to nehlásí")
}
{
  // Vysoká úroveň s velkým rozptylem nesmí projít jako opora: pod tlakem se
  // rozpadne a kouč by se opíral o něco, co ho neudrží.
  const p = profil([...opakuj(6, () => hrac(3, { A: 5 })), ...opakuj(6, () => hrac(3, { A: 1 }))])
  rekni(!p.opory.includes("A"), "rozkolísaná oblast se nevydává za oporu")
}

console.log("\n– texty česky a anglicky –")

const KODY = [
  "sebejista-ticha-satna", "trajektorie-vyhoreni", "nalada-podle-vysledku",
  "par-nese-naklad", "zlom-pod-tlakem", "pozornost-mizi-pod-tlakem",
  "tvrdi-na-sebe", "bez-opory", "krehka-identita", "vyrovnany-zaklad",
]
const OBLASTI = ["A", "B", "C", "D", "E", "F", "G"]
const CESKA_PISMENA = /[řěůŘĚŮ]/

for (const jazyk of ["cs", "en"]) {
  const t = M.TYM[jazyk]
  const chybi = KODY.filter((k) => !t.nalezy[k])
  rekni(!chybi.length, `${jazyk}: všech ${KODY.length} nálezů má text${chybi.length ? ` (chybí ${chybi.join(", ")})` : ""}`)
  const kratke = KODY.filter((k) => {
    const n = t.nalezy[k]
    return !n || n.coJeVidet.length < 80 || n.coToDela.length < 120 || n.coSTim.length < 3 || n.coNedelat.length < 60
  })
  rekni(!kratke.length, `${jazyk}: výklad není odbytý${kratke.length ? ` (${kratke.join(", ")})` : ""}`)
  rekni(OBLASTI.every((o) => t.oblasti[o]), `${jazyk}: všech sedm oblastí má název`)
}

{
  const shodne = KODY.filter((k) => M.TYM.cs.nalezy[k].nadpis === M.TYM.en.nalezy[k].nadpis)
  rekni(!shodne.length, `angličtina není opsaná čeština${shodne.length ? ` (${shodne.join(", ")})` : ""}`)
  const ceske = KODY.filter((k) => {
    const n = M.TYM.en.nalezy[k]
    return CESKA_PISMENA.test([n.nadpis, n.coJeVidet, n.coToDela, n.coNedelat, ...n.coSTim].join(" "))
  })
  rekni(!ceske.length, `anglické texty jsou bez ř, ě a ů${ceske.length ? ` (${ceske.join(", ")})` : ""}`)
}

console.log(chyb === 0 ? "\ntýmové vyhodnocení sedí" : `\nNALEZENO CHYB: ${chyb}`)
process.exit(chyb === 0 ? 0 : 1)
