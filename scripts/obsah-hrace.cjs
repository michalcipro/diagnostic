// Vyrobí výřez výkladu pro vyhodnocení hráče v klubové větvi.
//
// Hráč po odeslání vidí svoje vyhodnocení. Počítá a sestavuje ho server, aby
// se vyhodnocovací klíče nedostaly do prohlížeče; server proto potřebuje mít
// texty u sebe. Celý výklad má 664 kB a do funkce se rozumně nevejde.
//
// Z toho, co je v datech, se bere jen sportovní varianta česky a anglicky
// a jen úroveň dimenzí, tedy zhruba 44 kB. Fazety a byznysová varianta se
// v klubu nepoužijí a slovenština se tam nenabízí.
//
// Výsledek je odvozený soubor, ne zdroj. Nesahej do něj ručně: spusť tenhle
// skript. Že se nerozešel s originálem, hlídá scripts/test-tym.cjs.
//
// Spouští se `node scripts/obsah-hrace.cjs`.

const fs = require("fs")
const path = require("path")

const KOREN = path.join(__dirname, "..")
const DIMENZE = ["A", "B", "C", "D", "E", "F", "G"]
const PASMA = ["priority", "stabilization", "strong", "elite"]
const JAZYKY = ["cs", "en"]
const CIL = path.join(KOREN, "lib/tym/obsah-hrace.ts")

/** Načte z dat jen to, co vyhodnocení hráče potřebuje. */
function vyrez() {
  const out = {}
  for (const lang of JAZYKY) {
    out[lang] = {}
    for (const id of DIMENZE) {
      const j = JSON.parse(
        fs.readFileSync(path.join(KOREN, "lib/diagnostic/data/content", `${id}.json`), "utf8"),
      )
      const pasma = {}
      for (const p of PASMA) pasma[p] = j.bands[p].sport[lang]
      out[lang][id] = { nazev: j.name[lang], uvod: j.tagline.sport[lang], pasma }
    }
  }
  return out
}

const ts = (s) => JSON.stringify(s)

function zapis(data) {
  const r = [
    'import type { BandKey, DimensionId } from "../diagnostic/types"',
    "",
    "// ODVOZENÝ SOUBOR. Nesahej do něj ručně, přepíše ho scripts/obsah-hrace.cjs.",
    "//",
    "// Výřez výkladu pro vyhodnocení hráče v klubové větvi: sportovní varianta,",
    "// česky a anglicky, jen úroveň dimenzí. Sedí u serveru, protože vyhodnocení",
    "// hráče se počítá tam, aby se klíče nedostaly do prohlížeče.",
    "//",
    "// Rodové značky {mužský|ženský} se rozvinou až při sestavení textu.",
    "",
    "export type HracLang = \"cs\" | \"en\"",
    "",
    "export interface OblastText {",
    "  nazev: string",
    "  uvod: string",
    "  pasma: Record<BandKey, string>",
    "}",
    "",
    "export const OBSAH_HRACE: Record<HracLang, Record<DimensionId, OblastText>> = {",
  ]
  for (const lang of JAZYKY) {
    r.push(`  ${lang}: {`)
    for (const id of DIMENZE) {
      const o = data[lang][id]
      r.push(`    ${id}: {`)
      r.push(`      nazev: ${ts(o.nazev)},`)
      r.push(`      uvod: ${ts(o.uvod)},`)
      r.push("      pasma: {")
      for (const p of PASMA) r.push(`        ${p}: ${ts(o.pasma[p])},`)
      r.push("      },")
      r.push("    },")
    }
    r.push("  },")
  }
  r.push("}")
  fs.writeFileSync(CIL, r.join("\n") + "\n")
}

const data = vyrez()
zapis(data)
const kb = Math.round(fs.statSync(CIL).size / 1024)
console.log(`${path.relative(KOREN, CIL)}: ${DIMENZE.length} oblastí × ${JAZYKY.length} jazyky, ${kb} kB`)
