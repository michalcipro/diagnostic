// Co si respondent stáhne spolu s dotazníkem.
//
// Aplikace běží v prohlížeči, takže všechno, na co dosáhnou importy stránky
// /t/[token], se veze do prohlížeče respondenta a dá se přečíst ze zdroje.
// Kvůli jedinému importu tam jezdily vyhodnocovací klíče: čísla kontrol
// pozornosti, dvojice na konzistenci, obrácené položky a hranice pásem. Kdo je
// zná, projde kontrolami platnosti, jak se mu zachce, a vyjde mu profil, jaký
// si přeje. Vedle toho tam byl celý výklad ELITE a všech devět dotazníků.
//
// Kontroluje se strom statických importů, ne hotový balíček. Sbaluje sice
// i to, co by překladač možná vyhodil, ale právě to je záměr: jestli se něco
// odstraní, závisí na verzi Next.js a na tom, jak je soubor napsaný. Na
// ochranu know-how se to spoléhat nedá, tak platí tvrdší pravidlo, že se do
// těch souborů ze stránky s dotazníkem prostě nesahá.
//
// Dynamický import (`await import(...)`) se za sáhnutí nepovažuje: tak se
// načítá dotazník až podle toho, na který test pozvánka zní, a to je v pořádku.
//
// Spouští se `node scripts/audit-balicku.cjs`, build k tomu potřeba není.

const fs = require("fs")
const path = require("path")

const KOREN = path.join(__dirname, "..")
const VSTUP = path.join(KOREN, "app/t/[token]/page.tsx")

let chyb = 0
const rekni = (ok, text) => {
  if (!ok) chyb++
  console.log(`${ok ? "OK   " : "CHYBA"} ${text}`)
}

/** Soubory, na které stránka s dotazníkem nesmí dosáhnout, a proč. */
const ZAKAZANE = {
  "lib/diagnostic/structure.ts": "klíče ELITE: fazety, obrácené položky, kontroly platnosti, pásma",
  "lib/diagnostic/content.ts": "výklad všech sedmi oblastí ELITE",
  "lib/diagnostic/summary.ts": "shrnutí pro klienta",
  "lib/diagnostic/scoring.ts": "výpočet skóre a vyhodnocení platnosti",
  "lib/vzorce/structure.ts": "mapování položek na vzorce a pásma aktivace",
  "lib/vzorce/content.ts": "výklad vzorců",
  "lib/vzorce/scoring.ts": "výpočet vzorců",
  "lib/vzorce/vazby.ts": "výklad dvojic vzorců",
  "lib/archetypy/structure.ts": "mapování položek na archetypy",
  "lib/archetypy/content.ts": "výklad archetypů",
  "lib/archetypy/scoring.ts": "výpočet archetypů",
  "lib/archetypy/kombinace.ts": "výklad kombinací archetypů",
}

const PRIPONY = [".ts", ".tsx", ".json", "/index.ts", "/index.tsx"]

/** Cesta k souboru z toho, co je v importu; bare importy se přeskakují. */
function najdi(odkud, cil) {
  let zaklad
  if (cil.startsWith("@/")) zaklad = path.join(KOREN, cil.slice(2))
  else if (cil.startsWith(".")) zaklad = path.resolve(path.dirname(odkud), cil)
  else return null // react, convex a spol.
  if (fs.existsSync(zaklad) && fs.statSync(zaklad).isFile()) return zaklad
  for (const p of PRIPONY) {
    if (fs.existsSync(zaklad + p)) return zaklad + p
  }
  return null
}

/** Statické importy a reexporty. Dynamický `import(...)` sem schválně nepatří. */
function importy(zdroj) {
  const out = []
  const re = /(?:^|\n)\s*(?:import|export)\b[^;\n]*?from\s*["']([^"']+)["']/g
  let m
  while ((m = re.exec(zdroj))) out.push(m[1])
  const holy = /(?:^|\n)\s*import\s*["']([^"']+)["']/g
  while ((m = holy.exec(zdroj))) out.push(m[1])
  return out
}

// Průchod do šířky, ať je nalezená cesta ta nejkratší a dá se podle ní zasáhnout.
const videno = new Set([VSTUP])
const fronta = [[VSTUP, [path.relative(KOREN, VSTUP)]]]
const nalezy = []
let souboru = 0

while (fronta.length) {
  const [soubor, cesta] = fronta.shift()
  souboru++
  const zdroj = fs.readFileSync(soubor, "utf8")
  for (const spec of importy(zdroj)) {
    const cil = najdi(soubor, spec)
    if (!cil || videno.has(cil)) continue
    videno.add(cil)
    const rel = path.relative(KOREN, cil)
    const dalsi = [...cesta, rel]
    if (ZAKAZANE[rel]) {
      nalezy.push({ rel, cesta: dalsi })
      continue // dál se nechodí, hlásí se rovnou tenhle soubor
    }
    fronta.push([cil, dalsi])
  }
}

console.log(`stránka s dotazníkem staticky dosáhne na ${souboru} souborů\n`)

for (const [rel, duvod] of Object.entries(ZAKAZANE)) {
  const nalez = nalezy.find((n) => n.rel === rel)
  rekni(!nalez, `${rel} zůstává mimo dotazník (${duvod})${nalez ? `\n      přes: ${nalez.cesta.join(" → ")}` : ""}`)
}

// Kdyby se soubor přejmenoval, kontrola by tiše přestala platit.
const chybejici = Object.keys(ZAKAZANE).filter((f) => !fs.existsSync(path.join(KOREN, f)))
rekni(!chybejici.length, `seznam hlídaných souborů je aktuální${chybejici.length ? ` (neexistuje: ${chybejici.join(", ")})` : ""}`)

// ---------------------------------------------------------------------------
// Počty položek se nesmějí rozejít s klíči
// ---------------------------------------------------------------------------
//
// Aby si dotazník nemusel brát structure.ts, má počty položek opsané
// v test-id.ts. Opsané číslo se může rozejít se skutečností a poznalo by se to
// až tak, že by se klientovi nezobrazila část otázek, proto se to porovnává.

const os = require("os")
const { execFileSync } = require("child_process")

const esbuild = path.join(KOREN, "node_modules", ".bin", "esbuild")
if (fs.existsSync(esbuild)) {
  const vstup = path.join(KOREN, "scripts", ".balicek-vstup.ts")
  const vystup = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "balicek-")), "data.cjs")
  fs.writeFileSync(
    vstup,
    `export { POCET_POLOZEK, TEST_IDS } from "../lib/diagnostic/test-id"
export { getStructure } from "../lib/diagnostic/structure"
export { POCET_POLOZEK as VZORCE } from "../lib/vzorce/structure"
export { POCET_POLOZEK as ARCHETYPY } from "../lib/archetypy/structure"
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

  const rozdily = []
  for (const id of M.TEST_IDS) {
    const opsano = M.POCET_POLOZEK[id]
    let skutecne
    if (id.startsWith("vzorce")) skutecne = M.VZORCE
    else if (id.startsWith("archetypy")) skutecne = M.ARCHETYPY
    else skutecne = M.getStructure(id.startsWith("elite200") ? "elite200" : "elite100").itemCount
    if (opsano !== skutecne) rozdily.push(`${id}: uvedeno ${opsano}, klíč má ${skutecne}`)
  }
  rekni(!rozdily.length, `počty položek souhlasí s klíči${rozdily.length ? ` (${rozdily.join("; ")})` : ""}`)
} else {
  console.log("(esbuild chybí, počty položek se neověřily; spusť `npm install`)")
}

console.log(chyb === 0 ? "\nz dotazníku neuniká know-how" : `\nNALEZENO CHYB: ${chyb}`)
process.exit(chyb === 0 ? 0 : 1)
