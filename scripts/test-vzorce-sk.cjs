// Kontrola slovenské verze emocionálně-destruktivních vzorců.
//
// Překlad se dá pokazit tiše: chybějící klíč spadne na češtinu a nikdo si toho
// nevšimne, protože Slovák češtině rozumí. Tenhle skript hlídá to, co se okem
// nepohlídá:
//
// 1) Slovenština nemá písmena ř, ě ani ů. Jediný jejich výskyt ve slovenském
//    textu znamená, že tam zůstalo české slovo.
// 2) Klíče musí sedět. Když dvojice vzorců chybí ve slovenském souboru,
//    vyhodnocení se u ní přepne do češtiny uprostřed odstavce.
// 3) Rodových značek {mužský|ženský} musí být v obou jazycích stejně, jinak
//    dostane žena někde mužský tvar.
// 4) Skládané věty v lib/vzorce/vazby.ts se musí ve slovenštině opravdu lišit,
//    tedy nesmí zůstat na české šabloně.
//
// Spouští se `node scripts/test-vzorce-sk.cjs`.

const { execFileSync } = require("child_process")
const fs = require("fs")
const os = require("os")
const path = require("path")

const KOREN = path.join(__dirname, "..")

let chyb = 0
const rekni = (ok, text) => {
  if (!ok) chyb++
  console.log(`${ok ? "OK   " : "CHYBA"} ${text}`)
}

// ---------------------------------------------------------------------------
// Data z modulů. Jsou to TypeScript soubory, takže se přeloží esbuildem
// (chodí s convexem) do jednoho CJS souboru a ten se načte.
// ---------------------------------------------------------------------------

function nactiModuly() {
  const esbuild = path.join(KOREN, "node_modules", ".bin", "esbuild")
  if (!fs.existsSync(esbuild)) {
    console.error("Chybí esbuild v node_modules. Spusť `npm install`.")
    process.exit(1)
  }
  // Vstupní soubor musí ležet v repozitáři, jinak esbuild neví, odkud řešit cesty.
  const vstup = path.join(KOREN, "scripts", ".vzorce-sk-vstup.ts")
  const vystup = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "vzorce-sk-")), "data.cjs")
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
export {
  NAZVY_DOMEN,
  NAZVY_DOMEN_KRATCE,
  NAZVY_PASEM,
  NAZVY_PASEM_KRATCE,
  POTREBA_DOMENY,
  VZORCE,
} from "../lib/vzorce/structure"
export { UI_VZORCE } from "../lib/vzorce/i18n"
export { vyhodnot } from "../lib/vzorce/scoring"
export { propoj } from "../lib/vzorce/vazby"
`,
  )
  try {
    execFileSync(esbuild, [vstup, "--bundle", "--format=cjs", "--platform=node", `--outfile=${vystup}`], {
      stdio: ["ignore", "ignore", "inherit"],
    })
    return require(vystup)
  } finally {
    fs.rmSync(vstup, { force: true })
  }
}

const M = nactiModuly()

// ---------------------------------------------------------------------------
// 1) žádná česká písmena ve slovenském textu
// ---------------------------------------------------------------------------

const CESKA_PISMENA = /[řěůŘĚŮ]/

/** Projde rekurzivně cokoli a vrátí dvojice [cesta, řetězec]. */
function retezce(uzel, cesta = "") {
  if (typeof uzel === "string") return [[cesta, uzel]]
  if (typeof uzel === "function") return []
  if (uzel === null || typeof uzel !== "object") return []
  return Object.entries(uzel).flatMap(([k, v]) => retezce(v, cesta ? `${cesta}.${k}` : k))
}

/** Co všechno se kontroluje: obecná i sportovní podoba vzorců. */
const VARIANTY = [
  { jmeno: "obecná", obsah: "OBSAH", obsahSk: "OBSAH_SK", dvojice: "DVOJICE", dvojiceSk: "DVOJICE_SK" },
  {
    jmeno: "individuální sport",
    obsah: "OBSAH_SPORT_INDIVIDUAL",
    obsahSk: "OBSAH_SPORT_INDIVIDUAL_SK",
    dvojice: "DVOJICE_SPORT_INDIVIDUAL",
    dvojiceSk: "DVOJICE_SPORT_INDIVIDUAL_SK",
  },
  {
    jmeno: "týmový sport",
    obsah: "OBSAH_SPORT_TYM",
    obsahSk: "OBSAH_SPORT_TYM_SK",
    dvojice: "DVOJICE_SPORT_TYM",
    dvojiceSk: "DVOJICE_SPORT_TYM_SK",
  },
]

console.log("– slovenština bez českých písmen –")
for (const [jmeno, data] of [
  ["obsah-sk", M.OBSAH_SK],
  ["obsah-sport-individual-sk", M.OBSAH_SPORT_INDIVIDUAL_SK],
  ["obsah-sport-tym-sk", M.OBSAH_SPORT_TYM_SK],
  ["dvojice-sk", M.DVOJICE_SK],
  ["dvojice-sport-individual-sk", M.DVOJICE_SPORT_INDIVIDUAL_SK],
  ["dvojice-sport-tym-sk", M.DVOJICE_SPORT_TYM_SK],
  ["pásma", M.NAZVY_PASEM.sk],
  ["pásma zkráceně", M.NAZVY_PASEM_KRATCE.sk],
  ["oblasti", M.NAZVY_DOMEN.sk],
  ["oblasti zkráceně", M.NAZVY_DOMEN_KRATCE.sk],
  ["potřeby oblastí", M.POTREBA_DOMENY.sk],
  ["rozhraní", M.UI_VZORCE.sk],
]) {
  const spatne = retezce(data).filter(([, t]) => CESKA_PISMENA.test(t))
  rekni(
    spatne.length === 0,
    `${jmeno}: bez ř, ě a ů${spatne.length ? ` (${spatne.slice(0, 3).map(([c]) => c).join(", ")})` : ""}`,
  )
}

// ---------------------------------------------------------------------------
// 2) úplnost a shoda klíčů
// ---------------------------------------------------------------------------

// Místa, kde je slovenský text shodou okolností stejný jako český. Stojí tu
// vypsaná, ať se pozná rozdíl mezi „stejné schválně“ a „zapomenutý překlad“.
const SHODNE_JAZYKY = new Set([
  "10.tema", // „Neúprosné nároky, tlak a výkonová identita“ je stejná věta v obou jazycích
])

console.log("\n– úplnost obsahu –")
const POLE = ["nazev", "tema", "motto", "prozitek", "podTlakem", "puvod"]
const PASMA = ["velmi-nizka", "nizka", "stredni", "vysoka", "dominantni"]

for (const varianta of VARIANTY) {
for (const v of M.VZORCE) {
  const cs = M[varianta.obsah][v.id]
  const sk = M[varianta.obsahSk][v.id]
  if (!sk) {
    rekni(false, `${varianta.jmeno}: vzorec ${v.id} nemá slovenský obsah`)
    continue
  }
  const chybi = POLE.filter((p) => !sk[p] || !sk[p].trim())
  const chybiPasma = PASMA.filter((p) => !sk.pasma?.[p] || !sk.pasma[p].trim())
  rekni(
    chybi.length === 0 && chybiPasma.length === 0,
    `${varianta.jmeno}: vzorec ${v.id} (${sk.nazev || "?"}) má všech ${POLE.length} polí i ${PASMA.length} pásem`,
  )
  // Delší text, který zůstal doslova český, je skoro jistě nepřeložený.
  // Výjimky jsou věty, které v obou jazycích znějí opravdu stejně.
  const dlouhe = POLE.filter(
    (p) => sk[p] === cs[p] && String(cs[p]).split(" ").length > 3 && !SHODNE_JAZYKY.has(`${v.id}.${p}`),
  )
  rekni(
    dlouhe.length === 0,
    `${varianta.jmeno}: vzorec ${v.id} nemá žádné delší pole české${dlouhe.length ? ` (${dlouhe.join(", ")})` : ""}`,
  )
}
}

console.log("\n– dvojice vzorců –")
const klicCs = Object.keys(M.DVOJICE).sort()
for (const varianta of VARIANTY) {
  const klice = Object.keys(M[varianta.dvojice]).sort()
  const kliceSk = Object.keys(M[varianta.dvojiceSk]).sort()
  rekni(
    JSON.stringify(klice) === JSON.stringify(kliceSk),
    `${varianta.jmeno}: stejné klíče v obou jazycích (${klice.length})`,
  )
  // Varianty se nesmí rozejít mezi sebou: chybějící dvojice ve sportovní
  // verzi by znamenala, že se u téhle kombinace složí obecný popis z domén.
  rekni(
    JSON.stringify(klice) === JSON.stringify(klicCs),
    `${varianta.jmeno}: stejné klíče jako obecná verze`,
  )
  const stejne = klice.filter((k) => M[varianta.dvojiceSk][k] === M[varianta.dvojice][k])
  rekni(
    stejne.length === 0,
    `${varianta.jmeno}: žádná dvojice nezůstala česká${stejne.length ? ` (${stejne.join(", ")})` : ""}`,
  )
}

// ---------------------------------------------------------------------------
// 3) rodové značky
// ---------------------------------------------------------------------------

console.log("\n– rodové tvary –")
const ZNACKA = /\{([^{}|]*)\|([^{}|]*)\}/g
const pocetZnacek = (t) => (String(t).match(ZNACKA) || []).length

let neshodaZnacek = []
for (const varianta of VARIANTY) {
for (const v of M.VZORCE) {
  const cs = M[varianta.obsah][v.id]
  const sk = M[varianta.obsahSk][v.id]
  if (!sk) continue
  for (const p of POLE) {
    if (pocetZnacek(cs[p]) !== pocetZnacek(sk[p])) neshodaZnacek.push(`${varianta.jmeno} ${v.id}.${p}`)
  }
  for (const p of PASMA) {
    if (pocetZnacek(cs.pasma[p]) !== pocetZnacek(sk.pasma[p])) {
      neshodaZnacek.push(`${varianta.jmeno} ${v.id}.pasma.${p}`)
    }
  }
}
}
rekni(
  neshodaZnacek.length === 0,
  `obsah má v obou jazycích stejný počet značek${neshodaZnacek.length ? ` (${neshodaZnacek.join(", ")})` : ""}`,
)

const neshodaDvojic = VARIANTY.flatMap((varianta) =>
  Object.keys(M[varianta.dvojice])
    .filter((k) => pocetZnacek(M[varianta.dvojice][k]) !== pocetZnacek(M[varianta.dvojiceSk][k]))
    .map((k) => `${varianta.jmeno} ${k}`),
)
rekni(
  neshodaDvojic.length === 0,
  `dvojice mají v obou jazycích stejný počet značek${neshodaDvojic.length ? ` (${neshodaDvojic.join(", ")})` : ""}`,
)

// Obě větve značky musí být neprázdné, jinak text v jednom rodě zeje.
const prazdneVetve = []
for (const [cesta, text] of [
  ...retezce(M.OBSAH_SK, "obsah"),
  ...retezce(M.OBSAH_SPORT_SK, "obsah-sport"),
  ...retezce(M.DVOJICE_SK, "dvojice"),
  ...retezce(M.DVOJICE_SPORT_SK, "dvojice-sport"),
]) {
  for (const m of String(text).matchAll(ZNACKA)) {
    if (!m[1].trim() || !m[2].trim()) prazdneVetve.push(cesta)
  }
}
rekni(prazdneVetve.length === 0, `žádná značka nemá prázdnou větev${prazdneVetve.length ? ` (${prazdneVetve.join(", ")})` : ""}`)

// ---------------------------------------------------------------------------
// 4) skládané věty ve vyhodnocení
// ---------------------------------------------------------------------------

console.log("\n– propojené shrnutí –")

/** Odpovědi, které dané vzorce vyženou nahoru a zbytek nechají dole. */
function odpovedi(silne) {
  const out = {}
  for (let i = 1; i <= 110; i++) {
    const vzorec = Math.floor((i - 1) / 10) + 1
    out[i] = silne.includes(vzorec) ? 6 : 2
  }
  return out
}

// Tři případy, které vedou na tři různé větve textu o oblastech: všechny
// vzorce z jedné oblasti, dva z jedné, a tři z různých.
const PRIPADY = [
  { popis: "tři vzorce z jedné oblasti", silne: [1, 2, 3] },
  { popis: "dva z jedné oblasti a jeden odjinud", silne: [1, 2, 10] },
  { popis: "tři z různých oblastí", silne: [7, 8, 10] },
]

for (const varianta of ["obecna", "sport-individual", "sport-tym"]) {
  for (const p of PRIPADY) {
    const v = M.vyhodnot(odpovedi(p.silne))
    const cs = M.propoj(v, "cs", varianta)
    const sk = M.propoj(v, "sk", varianta)
    const kde = `${varianta} / ${p.popis}`
    rekni(!!cs && !!sk, `${kde}: shrnutí vzniklo v obou jazycích`)
    if (!cs || !sk) continue
    const stejnaPole = ["domeny", "souhrn", "kdeZacit"].filter((k) => cs[k] === sk[k])
    rekni(
      stejnaPole.length === 0,
      `${kde}: české a slovenské znění se liší${stejnaPole.length ? ` (${stejnaPole.join(", ")})` : ""}`,
    )
    rekni(
      cs.mechanismy.length === sk.mechanismy.length,
      `${kde}: stejný počet mechanismů (${cs.mechanismy.length})`,
    )
    const ceske = [sk.domeny, sk.souhrn, sk.kdeZacit, ...sk.mechanismy].filter((t) =>
      CESKA_PISMENA.test(t),
    )
    rekni(ceske.length === 0, `${kde}: slovenské znění neobsahuje ř, ě ani ů`)
  }
}

// ---------------------------------------------------------------------------
// 5) rozhraní vyhodnocení
// ---------------------------------------------------------------------------

console.log("\n– rozhraní –")

// Popisky, které jsou v obou jazycích shodou okolností stejné. Vypisují se
// vědomě, ať se na ně nezapomene, kdyby se český text změnil.
const SHODNE_ZAMERNE = new Set(["respondent", "pasmaKlic"])

const cs = M.UI_VZORCE.cs
const sk = M.UI_VZORCE.sk
const chybejiciKlice = Object.keys(cs).filter((k) => sk[k] === undefined)
rekni(chybejiciKlice.length === 0, `slovenské rozhraní má všechny klíče${chybejiciKlice.length ? ` (${chybejiciKlice.join(", ")})` : ""}`)

// Funkce se zkoušejí na víc vstupech: jednotné, množné i počítané tvary se
// v češtině a slovenštině liší jinde, takže jediný vzorek nic nedokazuje.
const VSTUPY = [
  [1, "1"],
  [3, "1, 2, 3"],
  [5, "1, 2, 3, 4, 5"],
  [110, "7"],
]
const nepreloz = Object.keys(cs).filter((k) => {
  if (SHODNE_ZAMERNE.has(k)) return false
  if (typeof cs[k] === "function") {
    return VSTUPY.every(([a, b]) => cs[k](a, b) === sk[k](a, b))
  }
  if (Array.isArray(cs[k])) return JSON.stringify(cs[k]) === JSON.stringify(sk[k])
  return cs[k] === sk[k]
})
rekni(nepreloz.length === 0, `žádný popisek nezůstal český${nepreloz.length ? ` (${nepreloz.join(", ")})` : ""}`)

// Angličtina má od února vlastní sadu. Kdyby se někdy vrátila na `en: CS`,
// dostal by anglický klient české vyhodnocení, aniž by to build ohlásil.
{
  const en = M.UI_VZORCE.en
  // „Respondent" se česky i anglicky píše stejně; přeložit to jinak by bylo
  // horší, ne lepší.
  const shodneZamerne = new Set(["respondent"])
  const shodne = retezce(cs).filter(([c, t]) => {
    if (shodneZamerne.has(c)) return false
    const v = c.split(".").reduce((o, k) => (o ? o[k] : undefined), en)
    return typeof v === "string" && v === t
  })
  rekni(en !== cs, "angličtina není jen odkaz na češtinu")
  rekni(
    shodne.length === 0,
    `žádný anglický popisek nezůstal český${shodne.length ? ` (${shodne.slice(0, 3).map(([c]) => c).join(", ")})` : ""}`,
  )
}

// ---------------------------------------------------------------------------
// 6) mužské tvary, které zůstaly bez rodové značky
//
// Tohle se pozná jedině ve zdroji: v hotovém textu applyGender() nic nenajde
// a žena prostě dostane „rozhodnutí děláš sám“. Kontroluje se seznam tvarů,
// které se v textu psaném klientovi objevují nejčastěji.
// ---------------------------------------------------------------------------

console.log("\n– rodové tvary bez značky –")

const TVARY = [
  "sám",
  "mám rád",
  "jistý",
  "si istý",
  "připravený",
  "pripravený",
  "nasycený",
  "nasýtený",
  "dost dobrý",
  "dosť dobrý",
  "schopný",
  "vadný",
  "chybný",
  "nedostatečný",
  "nedostatočný",
]

// Věty, kde mužský tvar patří někomu jinému než čtenáři, typicky rodiči.
const NEJDE_O_CTENARE = ["sám žil v úzkosti", "ten istý vzorec", "tej istej vete"]

for (const soubor of [
  "obsah.ts",
  "obsah-sk.ts",
  "obsah-sport-individual.ts",
  "obsah-sport-individual-sk.ts",
  "obsah-sport-tym.ts",
  "obsah-sport-tym-sk.ts",
  "dvojice.ts",
  "dvojice-sk.ts",
  "dvojice-sport-individual.ts",
  "dvojice-sport-individual-sk.ts",
  "dvojice-sport-tym.ts",
  "dvojice-sport-tym-sk.ts",
]) {
  const zdroj = fs
    .readFileSync(path.join(KOREN, "lib", "vzorce", "data", soubor), "utf8")
    // vymaskuj jen rodové značky, ne celé objekty
    .replace(/\{[^{}|\n]*\|[^{}|\n]*\}/g, "«»")
  const nalez = []
  for (const tvar of TVARY) {
    const re = new RegExp(`(.{0,60})\\b${tvar}\\b`, "g")
    for (const m of zdroj.matchAll(re)) {
      const okoli = m[0]
      if (NEJDE_O_CTENARE.some((v) => okoli.includes(v) || zdroj.slice(m.index, m.index + 90).includes(v))) continue
      nalez.push(`${tvar} („…${okoli.slice(-40)}“)`)
    }
  }
  rekni(nalez.length === 0, `${soubor}: každý mužský tvar má rodovou značku${nalez.length ? ` – ${nalez.join("; ")}` : ""}`)
}

console.log(chyb === 0 ? "\nslovenština vzorců sedí" : `\nNALEZENO CHYB: ${chyb}`)
process.exit(chyb === 0 ? 0 : 1)
