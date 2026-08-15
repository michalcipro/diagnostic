// Objem textu ve vyhodnoceních.
//
// Platí pravidlo, že texty vyhodnocení mají mít oproti původní verzi aspoň
// o čtvrtinu víc obsahu, a to ve všech testech i jazycích. Aby to bylo číslo
// a ne dojem, leží v scripts/objem-vychozi.json počty slov před rozšířením
// a tenhle skript proti nim měří současný stav.
//
// Měří se slova, ne znaky: znaky by odměnily delší slova místo většího obsahu.
// Rodové značky {mužský|ženský} se počítají jako jedno slovo, jinak by text
// „narostl" pouhým doplněním ženského tvaru.
//
//   node scripts/objem-textu.cjs           přehled a kontrola proti cíli
//   node scripts/objem-textu.cjs --zapis   uloží současný stav jako výchozí
//
// Zápis výchozího stavu se dělá jednou, před rozšiřováním. Podruhé už by cíl
// posunul sám sebe a kontrola by nic neznamenala.

const { execFileSync } = require("child_process")
const fs = require("fs")
const os = require("os")
const path = require("path")

const KOREN = path.join(__dirname, "..")
const VYCHOZI = path.join(__dirname, "objem-vychozi.json")

/** O kolik má být textu víc. */
const CIL = 1.25

/** Jednotlivý text smí zaostat, když celek cíl splní; tohle je jeho dno. */
const DNO_JEDNOHO = 1.15

/**
 * Pole, která se do objemu nepočítají.
 *
 * Název fazety je popisek do grafu, motto je citát na jeden řádek a téma je
 * podtitulek. Roztahovat je by zhoršilo čitelnost a cíl by se plnil na místech,
 * kde o obsah vůbec nejde.
 */
const NEMERI_SE = ["name", "tema", "motto"]
const meri = (cesta) => !NEMERI_SE.includes(cesta.split(".").pop())

const slova = (t) =>
  String(t)
    // rodová značka je jedno slovo, ne dvě
    .replace(/\{([^{}|]*)\|([^{}|]*)\}/g, "$1")
    .split(/\s+/)
    .filter(Boolean).length

// ---------------------------------------------------------------------------
// sběr textů
// ---------------------------------------------------------------------------

/** Vyhodnocení ELITE: JSON soubory s listy { cs, en, sk }. */
function texty_elite() {
  const dir = path.join(KOREN, "lib", "diagnostic", "data", "content")
  const out = {}
  for (const soubor of fs.readdirSync(dir).filter((f) => f.endsWith(".json"))) {
    const data = JSON.parse(fs.readFileSync(path.join(dir, soubor), "utf8"))
    const id = soubor.replace(/\.json$/, "")
    const projdi = (uzel, cesta) => {
      if (typeof uzel !== "object" || uzel === null) return
      const klice = Object.keys(uzel)
      if (klice.length && klice.every((k) => k === "cs" || k === "en" || k === "sk")) {
        if (!meri(cesta)) return
        for (const l of klice) if (uzel[l]) out[`${id}.${cesta}|${l}`] = slova(uzel[l])
        return
      }
      for (const k of klice) projdi(uzel[k], cesta ? `${cesta}.${k}` : k)
    }
    projdi(data, "")
  }
  return out
}

/** Vyhodnocení vzorců: TypeScript, takže přes esbuild. */
function texty_vzorce() {
  const esbuild = path.join(KOREN, "node_modules", ".bin", "esbuild")
  if (!fs.existsSync(esbuild)) {
    console.error("Chybí esbuild v node_modules. Spusť `npm install`.")
    process.exit(1)
  }
  const vstup = path.join(KOREN, "scripts", ".objem-vstup.ts")
  const vystup = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "objem-")), "data.cjs")
  fs.writeFileSync(
    vstup,
    `export { OBSAH } from "../lib/vzorce/data/obsah"
export { OBSAH_SK } from "../lib/vzorce/data/obsah-sk"
export { OBSAH_SPORT_INDIVIDUAL } from "../lib/vzorce/data/obsah-sport-individual"
export { OBSAH_SPORT_INDIVIDUAL_SK } from "../lib/vzorce/data/obsah-sport-individual-sk"
export { OBSAH_SPORT_TYM } from "../lib/vzorce/data/obsah-sport-tym"
export { OBSAH_SPORT_TYM_SK } from "../lib/vzorce/data/obsah-sport-tym-sk"
export { DVOJICE } from "../lib/vzorce/data/dvojice"
export { DVOJICE_SK } from "../lib/vzorce/data/dvojice-sk"
export { DVOJICE_SPORT_INDIVIDUAL } from "../lib/vzorce/data/dvojice-sport-individual"
export { DVOJICE_SPORT_INDIVIDUAL_SK } from "../lib/vzorce/data/dvojice-sport-individual-sk"
export { DVOJICE_SPORT_TYM } from "../lib/vzorce/data/dvojice-sport-tym"
export { DVOJICE_SPORT_TYM_SK } from "../lib/vzorce/data/dvojice-sport-tym-sk"
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

  // Sportovní verze má vlastní klíče (vzorce-sport, dvojice-sport). Do výchozího
  // stavu se nedostane, protože vznikla až po něm; měří se, aby byl přehled úplný.
  const out = {}
  for (const [skupina, jazyk, obsah, dvojice] of [
    ["vzorce", "cs", M.OBSAH, M.DVOJICE],
    ["vzorce", "sk", M.OBSAH_SK, M.DVOJICE_SK],
    ["vzorce-sport-individual", "cs", M.OBSAH_SPORT_INDIVIDUAL, M.DVOJICE_SPORT_INDIVIDUAL],
    ["vzorce-sport-individual", "sk", M.OBSAH_SPORT_INDIVIDUAL_SK, M.DVOJICE_SPORT_INDIVIDUAL_SK],
    ["vzorce-sport-tym", "cs", M.OBSAH_SPORT_TYM, M.DVOJICE_SPORT_TYM],
    ["vzorce-sport-tym", "sk", M.OBSAH_SPORT_TYM_SK, M.DVOJICE_SPORT_TYM_SK],
  ]) {
    const dvojiceKlic = skupina === "vzorce" ? "dvojice" : `dvojice-${skupina.slice(7)}`
    for (const [id, o] of Object.entries(obsah)) {
      for (const pole of ["prozitek", "podTlakem", "puvod"]) {
        out[`${skupina}.${id}.${pole}|${jazyk}`] = slova(o[pole])
      }
      for (const [pasmo, text] of Object.entries(o.pasma)) {
        out[`${skupina}.${id}.pasma.${pasmo}|${jazyk}`] = slova(text)
      }
    }
    for (const [klic, text] of Object.entries(dvojice)) {
      out[`${dvojiceKlic}.${klic}|${jazyk}`] = slova(text)
    }
  }
  return out
}

const soucasne = { ...texty_elite(), ...texty_vzorce() }

// ---------------------------------------------------------------------------
// zápis výchozího stavu
// ---------------------------------------------------------------------------

if (process.argv.includes("--zapis")) {
  if (fs.existsSync(VYCHOZI) && !process.argv.includes("--prepis")) {
    console.error(
      "Výchozí stav už existuje. Přepsat ho by posunulo cíl sám sobě.\n" +
        "Když to opravdu chceš, přidej --prepis.",
    )
    process.exit(1)
  }
  fs.writeFileSync(VYCHOZI, JSON.stringify(soucasne, null, 0) + "\n")
  console.log(`Uloženo ${Object.keys(soucasne).length} textů do ${path.relative(KOREN, VYCHOZI)}.`)
  process.exit(0)
}

if (!fs.existsSync(VYCHOZI)) {
  console.error("Chybí scripts/objem-vychozi.json. Nejdřív `node scripts/objem-textu.cjs --zapis`.")
  process.exit(1)
}

// ---------------------------------------------------------------------------
// srovnání
// ---------------------------------------------------------------------------

const vychozi = JSON.parse(fs.readFileSync(VYCHOZI, "utf8"))

/** Skupina = soubor a jazyk, tedy „A|cs“. Podle ní se počítá celkový poměr. */
const skupina = (klic) => {
  const [cesta, jazyk] = klic.split("|")
  return `${cesta.split(".")[0]}|${jazyk}`
}

const soucty = new Map()
for (const [klic, pocet] of Object.entries(vychozi)) {
  const s = skupina(klic)
  const z = soucty.get(s) ?? { vychozi: 0, ted: 0, chybi: [], slabe: [] }
  z.vychozi += pocet
  z.ted += soucasne[klic] ?? 0
  if (soucasne[klic] === undefined) z.chybi.push(klic)
  else if (pocet > 0 && soucasne[klic] / pocet < DNO_JEDNOHO) z.slabe.push(klic)
  soucty.set(s, z)
}

let chyb = 0
let hotovo = 0
const radky = [...soucty.entries()].sort((a, b) => a[0].localeCompare(b[0]))

console.log("skupina      výchozí     nyní   poměr   stav")
for (const [s, z] of radky) {
  const pomer = z.vychozi ? z.ted / z.vychozi : 1
  const splneno = pomer >= CIL
  if (splneno) hotovo++
  const stav = splneno ? "splněno" : `chybí ${Math.max(0, Math.ceil(z.vychozi * CIL - z.ted))} slov`
  console.log(
    `${s.padEnd(12)} ${String(z.vychozi).padStart(7)} ${String(z.ted).padStart(8)}   ${pomer.toFixed(2)}   ${stav}`,
  )
  if (z.chybi.length) {
    chyb++
    console.log(`             CHYBÍ TEXTY: ${z.chybi.slice(0, 5).join(", ")}`)
  }
  if (splneno && z.slabe.length) {
    console.log(`             pod ${DNO_JEDNOHO}× zůstalo: ${z.slabe.slice(0, 5).join(", ")}`)
  }
}

const celkemV = [...soucty.values()].reduce((a, z) => a + z.vychozi, 0)
const celkemT = [...soucty.values()].reduce((a, z) => a + z.ted, 0)
console.log(
  `\ncelkem ${celkemV} → ${celkemT} slov (${(celkemT / celkemV).toFixed(2)}×), ` +
    `hotových skupin ${hotovo} z ${radky.length}`,
)

// Chybějící text je vždycky chyba: buď se ztratil, nebo se přejmenoval klíč.
// Nesplněný cíl je stav rozpracovanosti, ne chyba, takže se jen vypíše.
process.exit(chyb === 0 ? 0 : 1)
