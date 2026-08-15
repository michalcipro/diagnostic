// Přidá doplňky k textům vyhodnocení.
//
// Rozšiřování textů se dělá připsáním, ne přepsáním: původní znění zůstane
// bajt po bajtu stejné a v diffu je vidět jenom to, co přibylo. Diff se tak
// dá poctivě přečíst, což u přepsaného souboru o třech tisících slovech
// neplatí.
//
//   node scripts/doplnit-text.cjs <soubor.json> <doplnky.json>
//
// Doplňky jsou mapa „cesta v souboru" -> { cs, en, sk }, například:
//
//   { "facets.A1.bands.priority.sport": { "cs": "...", "en": "..." } }
//
// Skript odmítne cestu, která v souboru není, i doplněk, který už je na konci
// textu (kdyby se skript pustil dvakrát).

const fs = require("fs")

const [, , souborPath, doplnkyPath] = process.argv
if (!souborPath || !doplnkyPath) {
  console.error("Použití: node scripts/doplnit-text.cjs <soubor.json> <doplnky.json>")
  process.exit(1)
}

const data = JSON.parse(fs.readFileSync(souborPath, "utf8"))
const doplnky = JSON.parse(fs.readFileSync(doplnkyPath, "utf8"))

const najdi = (cesta) => cesta.split(".").reduce((u, k) => (u === undefined ? u : u[k]), data)

let pridano = 0
let chyb = 0
for (const [cesta, texty] of Object.entries(doplnky)) {
  const uzel = najdi(cesta)
  if (!uzel || typeof uzel !== "object") {
    console.error(`CHYBA ${cesta}: v souboru není`)
    chyb++
    continue
  }
  for (const [jazyk, doplnek] of Object.entries(texty)) {
    const puvodni = uzel[jazyk]
    if (typeof puvodni !== "string") {
      console.error(`CHYBA ${cesta}.${jazyk}: text v souboru není`)
      chyb++
      continue
    }
    if (puvodni.endsWith(doplnek)) {
      console.error(`CHYBA ${cesta}.${jazyk}: doplněk už tam je`)
      chyb++
      continue
    }
    uzel[jazyk] = `${puvodni.trimEnd()} ${doplnek}`
    pridano++
  }
}

if (chyb) {
  console.error(`\nNic se nezapsalo, nejdřív oprav ${chyb} chyb.`)
  process.exit(1)
}

fs.writeFileSync(souborPath, JSON.stringify(data, null, 2) + "\n")
console.log(`${souborPath}: doplněno ${pridano} textů`)
