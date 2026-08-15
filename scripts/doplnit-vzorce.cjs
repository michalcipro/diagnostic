// Přidá doplňky k textům vyhodnocení vzorců.
//
// Totéž co scripts/doplnit-text.cjs, jen pro data v TypeScriptu. Přepisovat
// je přes esbuild by ztratilo komentáře i formátování, takže se sahá přímo do
// zdroje: najde se řetězec podle klíče a doplněk se připíše před uzavírací
// uvozovku. Texty vzorců uvozovky neobsahují (píšou se „takhle"), takže je
// hledání jednoznačné.
//
//   node scripts/doplnit-vzorce.cjs <doplnky.json>
//
// Doplňky jsou mapa klíčů na text v obou jazycích:
//
//   { "obsah.01.prozitek": { "cs": "...", "sk": "..." },
//     "dvojice.01-07":     { "cs": "...", "sk": "..." } }

const fs = require("fs")
const path = require("path")

const KOREN = path.join(__dirname, "..")
const SOUBORY = {
  "obsah.cs": "lib/vzorce/data/obsah.ts",
  "obsah.sk": "lib/vzorce/data/obsah-sk.ts",
  "dvojice.cs": "lib/vzorce/data/dvojice.ts",
  "dvojice.sk": "lib/vzorce/data/dvojice-sk.ts",
}

const [, , doplnkyPath] = process.argv
if (!doplnkyPath) {
  console.error("Použití: node scripts/doplnit-vzorce.cjs <doplnky.json>")
  process.exit(1)
}
const doplnky = JSON.parse(fs.readFileSync(doplnkyPath, "utf8"))

/** Zdroje se drží v paměti, ať se soubor zapíše až když projdou všechny doplňky. */
const zdroje = {}
for (const [klic, rel] of Object.entries(SOUBORY)) {
  zdroje[klic] = fs.readFileSync(path.join(KOREN, rel), "utf8")
}

let chyb = 0
let pridano = 0

/** Blok jednoho vzorce v obsahu, tedy od `"01": {` po jeho uzavření. */
function blokVzorce(zdroj, id) {
  const zacatek = zdroj.indexOf(`"${id}": {`)
  if (zacatek === -1) return null
  const konec = zdroj.indexOf("\n  },", zacatek)
  return konec === -1 ? null : [zacatek, konec]
}

for (const [klic, texty] of Object.entries(doplnky)) {
  const [druh, ...zbytek] = klic.split(".")
  for (const [jazyk, doplnek] of Object.entries(texty)) {
    const souborKlic = `${druh}.${jazyk}`
    const zdroj = zdroje[souborKlic]
    if (!zdroj) {
      console.error(`CHYBA ${klic}.${jazyk}: neznámý druh nebo jazyk`)
      chyb++
      continue
    }

    // Kde v souboru text leží.
    let hledej
    let od = 0
    let doKonce = zdroj.length
    if (druh === "obsah") {
      const [id, pole] = zbytek
      const rozsah = blokVzorce(zdroj, id)
      if (!rozsah) {
        console.error(`CHYBA ${klic}.${jazyk}: vzorec ${id} v souboru není`)
        chyb++
        continue
      }
      ;[od, doKonce] = rozsah
      hledej = new RegExp(`(\\b${pole}:\\s*\\n?\\s*")([^"]*)(")`)
    } else {
      hledej = new RegExp(`("${zbytek.join(".")}":\\s*")([^"]*)(")`)
    }

    const usek = zdroj.slice(od, doKonce)
    const m = hledej.exec(usek)
    if (!m) {
      console.error(`CHYBA ${klic}.${jazyk}: text se v souboru nenašel`)
      chyb++
      continue
    }
    if (m[2].trimEnd().endsWith(doplnek)) {
      console.error(`CHYBA ${klic}.${jazyk}: doplněk už tam je`)
      chyb++
      continue
    }
    const novy = `${m[1]}${m[2].trimEnd()} ${doplnek}${m[3]}`
    zdroje[souborKlic] =
      zdroj.slice(0, od) + usek.slice(0, m.index) + novy + usek.slice(m.index + m[0].length) + zdroj.slice(doKonce)
    pridano++
  }
}

if (chyb) {
  console.error(`\nNic se nezapsalo, nejdřív oprav ${chyb} chyb.`)
  process.exit(1)
}

for (const [klic, rel] of Object.entries(SOUBORY)) {
  fs.writeFileSync(path.join(KOREN, rel), zdroje[klic])
}
console.log(`doplněno ${pridano} textů`)
