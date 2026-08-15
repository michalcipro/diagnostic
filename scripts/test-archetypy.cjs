// Kontrola testu archetypů značky.
//
// Hlídá to, co se okem nepohlídá:
//
// 1) Stavba: každá z 96 položek patří právě jednomu archetypu.
// 2) Dotazníky: oba jazyky mají položky 1 až 96 a slovenská verze je opravdu
//    slovenská (bez ř, ě a ů, žádná položka nezůstala česky).
// 3) Obsah: všech dvanáct archetypů má v obou jazycích všechna pole, návod
//    o pěti krocích a stejný počet rodových značek {mužský|ženský}.
// 4) Skládané věty: vyhranění, kombinace, potlačený archetyp i shrnutí
//    vznikají v obou jazycích, liší se mezi sebou a slovenština je čistá.
// 5) Rozhraní: slovenské UI má všechny klíče a nezůstalo české.
//
// Spouští se `node scripts/test-archetypy.cjs`.

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
// Data z modulů, přeložená esbuildem stejně jako u vzorců.
// ---------------------------------------------------------------------------

function nactiModuly() {
  const esbuild = path.join(KOREN, "node_modules", ".bin", "esbuild")
  if (!fs.existsSync(esbuild)) {
    console.error("Chybí esbuild v node_modules. Spusť `npm install`.")
    process.exit(1)
  }
  const vstup = path.join(KOREN, "scripts", ".archetypy-vstup.ts")
  const vystup = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "archetypy-")), "data.cjs")
  fs.writeFileSync(
    vstup,
    `export { OBSAH_ARCHETYPU } from "../lib/archetypy/data/obsah"
export { OBSAH_ARCHETYPU_SK } from "../lib/archetypy/data/obsah-sk"
export { ARCHETYPY, NAZVY_MOTIVACI, POPISY_MOTIVACI, POCET_POLOZEK } from "../lib/archetypy/structure"
export { UI_ARCHETYPY, SKALA_ARCHETYPY, INSTRUKCE_ARCHETYPY } from "../lib/archetypy/i18n"
export { vyhodnotArchetypy, kontrolaStruktury } from "../lib/archetypy/scoring"
export { spojArchetypy } from "../lib/archetypy/kombinace"
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

const CESKA_PISMENA = /[řěůŘĚŮ]/

/** Projde rekurzivně cokoli a vrátí dvojice [cesta, řetězec]. */
function retezce(uzel, cesta = "") {
  if (typeof uzel === "string") return [[cesta, uzel]]
  if (typeof uzel === "function") return []
  if (uzel === null || typeof uzel !== "object") return []
  return Object.entries(uzel).flatMap(([k, v]) => retezce(v, cesta ? `${cesta}.${k}` : k))
}

// ---------------------------------------------------------------------------
// 1) stavba
// ---------------------------------------------------------------------------

console.log("– stavba –")
const stavba = M.kontrolaStruktury()
rekni(stavba.ok, `každá položka patří právě jednomu archetypu${stavba.ok ? "" : ` (${stavba.problemy.join("; ")})`}`)
rekni(M.ARCHETYPY.length === 12, `archetypů je 12 (${M.ARCHETYPY.length})`)

// ---------------------------------------------------------------------------
// 2) dotazníky
// ---------------------------------------------------------------------------

console.log("\n– dotazníky –")
const polozkyCs = JSON.parse(fs.readFileSync(path.join(KOREN, "lib", "archetypy", "data", "polozky.json"), "utf8"))
const polozkySk = JSON.parse(fs.readFileSync(path.join(KOREN, "lib", "archetypy", "data", "polozky-sk.json"), "utf8"))

for (const [jmeno, data] of [
  ["polozky.json", polozkyCs],
  ["polozky-sk.json", polozkySk],
]) {
  const klice = Object.keys(data).map(Number).sort((a, b) => a - b)
  const uplne = klice.length === M.POCET_POLOZEK && klice.every((k, i) => k === i + 1)
  rekni(uplne, `${jmeno}: položky 1 až ${M.POCET_POLOZEK}`)
  const prazdne = Object.entries(data).filter(([, t]) => !String(t).trim())
  rekni(prazdne.length === 0, `${jmeno}: žádná položka není prázdná`)
}

const ceskeVSk = Object.entries(polozkySk).filter(([, t]) => CESKA_PISMENA.test(t))
rekni(
  ceskeVSk.length === 0,
  `polozky-sk.json: bez ř, ě a ů${ceskeVSk.length ? ` (${ceskeVSk.slice(0, 3).map(([k]) => k).join(", ")})` : ""}`,
)
const shodne = Object.keys(polozkyCs).filter((k) => polozkyCs[k] === polozkySk[k])
rekni(shodne.length === 0, `žádná položka nezůstala česky${shodne.length ? ` (${shodne.join(", ")})` : ""}`)

// ---------------------------------------------------------------------------
// 3) obsah
// ---------------------------------------------------------------------------

console.log("\n– obsah –")
const POLE = [
  "nazev",
  "puvodni",
  "motto",
  "touha",
  "strach",
  "dar",
  "podstata",
  "vPodnikani",
  "stin",
  "pasti",
  "priklady",
  "sekundarniRole",
]

// Pole, kde smí být slovenský text shodný s českým: anglický název z knihy,
// jména značek a názvy, které jsou v obou jazycích stejné slovo.
const SMI_BYT_SHODNA = new Set(["puvodni", "priklady", "nazev", "motto"])

const ZNACKA = /\{([^{}|]*)\|([^{}|]*)\}/g
const pocetZnacek = (t) => (String(t).match(ZNACKA) || []).length

for (const a of M.ARCHETYPY) {
  const cs = M.OBSAH_ARCHETYPU[a.id]
  const sk = M.OBSAH_ARCHETYPU_SK[a.id]
  if (!cs || !sk) {
    rekni(false, `archetyp ${a.id} chybí v ${!cs ? "češtině" : "slovenštině"}`)
    continue
  }
  const chybi = [
    ...POLE.filter((p) => !cs[p] || !String(cs[p]).trim()),
    ...POLE.filter((p) => !sk[p] || !String(sk[p]).trim()).map((p) => `sk.${p}`),
  ]
  rekni(
    chybi.length === 0 && cs.navod.length === 5 && sk.navod.length === 5,
    `${a.id} (${cs.nazev}): všechna pole a návod o 5 krocích v obou jazycích${chybi.length ? ` (${chybi.join(", ")})` : ""}`,
  )
  const nepreloz = POLE.filter(
    (p) => !SMI_BYT_SHODNA.has(p) && sk[p] === cs[p] && String(cs[p]).split(" ").length > 3,
  )
  const nepredolozNavod = cs.navod.filter((krok, i) => sk.navod[i] === krok)
  rekni(
    nepreloz.length === 0 && nepredolozNavod.length === 0,
    `${a.id}: žádné delší pole nezůstalo české${nepreloz.length ? ` (${nepreloz.join(", ")})` : ""}`,
  )
  const neshodaZnacek = [
    ...POLE.filter((p) => pocetZnacek(cs[p]) !== pocetZnacek(sk[p])),
    ...cs.navod.map((krok, i) => (pocetZnacek(krok) !== pocetZnacek(sk.navod[i]) ? `navod.${i + 1}` : null)).filter(Boolean),
  ]
  rekni(
    neshodaZnacek.length === 0,
    `${a.id}: stejný počet rodových značek v obou jazycích${neshodaZnacek.length ? ` (${neshodaZnacek.join(", ")})` : ""}`,
  )
}

const ceskeVObsahu = retezce(M.OBSAH_ARCHETYPU_SK).filter(([, t]) => CESKA_PISMENA.test(t))
rekni(
  ceskeVObsahu.length === 0,
  `obsah-sk: bez ř, ě a ů${ceskeVObsahu.length ? ` (${ceskeVObsahu.slice(0, 3).map(([c]) => c).join(", ")})` : ""}`,
)

const prazdneVetve = []
for (const [cesta, text] of [
  ...retezce(M.OBSAH_ARCHETYPU, "cs"),
  ...retezce(M.OBSAH_ARCHETYPU_SK, "sk"),
]) {
  for (const m of String(text).matchAll(ZNACKA)) {
    if (!m[1].trim() || !m[2].trim()) prazdneVetve.push(cesta)
  }
}
rekni(prazdneVetve.length === 0, `žádná značka nemá prázdnou větev${prazdneVetve.length ? ` (${prazdneVetve.join(", ")})` : ""}`)

// ---------------------------------------------------------------------------
// 4) skládané věty
// ---------------------------------------------------------------------------

console.log("\n– skládané věty –")

// Případy pokrývají tři míry vyhranění a obě větve kombinace: stejná
// motivační skupina (hrdina a rebel) i různé skupiny.
const PRIPADY = [
  { popis: "vyhraněný, různé skupiny", mapa: { 4: 6 }, primarni: "hrdina", vyhraneni: "vyhraneny" },
  { popis: "těsný, stejná skupina", mapa: { 4: 6, 5: [6, 6, 6, 6, 6, 6, 6, 4] }, primarni: "hrdina", vyhraneni: "tesny" },
  { popis: "zřetelný, různé skupiny", mapa: { 4: 6, 10: [6, 6, 6, 6, 6, 6, 4, 4] }, primarni: "hrdina", vyhraneni: "zretelny" },
]

const texty = ["vyhraneni", "kombinace", "potlaceny", "souhrn", "kdeZacit"]
const kombinaceCs = []
for (const p of PRIPADY) {
  // Odpovědi: archetyp z mapy dostane svou hodnotu (číslo, nebo osm hodnot
  // po položkách), všechny ostatní položky dvojku.
  const odp = {}
  for (let i = 1; i <= M.POCET_POLOZEK; i++) {
    const archetyp = Math.floor((i - 1) / 8) + 1
    const uvnitr = (i - 1) % 8
    const h = p.mapa[archetyp]
    odp[i] = h === undefined ? 2 : Array.isArray(h) ? h[uvnitr] : h
  }
  const v = M.vyhodnotArchetypy(odp)
  rekni(v.primarni.id === p.primarni, `${p.popis}: primární je ${p.primarni} (${v.primarni.id})`)
  rekni(v.vyhraneni === p.vyhraneni, `${p.popis}: vyhranění je ${p.vyhraneni} (${v.vyhraneni})`)
  const cs = M.spojArchetypy(v, "cs")
  const sk = M.spojArchetypy(v, "sk")
  const prazdna = texty.filter((k) => !cs[k].trim() || !sk[k].trim())
  rekni(prazdna.length === 0, `${p.popis}: všechny věty vznikly v obou jazycích`)
  const stejna = texty.filter((k) => cs[k] === sk[k])
  rekni(stejna.length === 0, `${p.popis}: české a slovenské znění se liší${stejna.length ? ` (${stejna.join(", ")})` : ""}`)
  const ceska = texty.filter((k) => CESKA_PISMENA.test(sk[k]))
  rekni(ceska.length === 0, `${p.popis}: slovenské znění bez ř, ě a ů${ceska.length ? ` (${ceska.join(", ")})` : ""}`)
  kombinaceCs.push(cs.kombinace)
}
rekni(
  kombinaceCs[0] !== kombinaceCs[1],
  "kombinace pro stejnou a různou skupinu se liší",
)

// ---------------------------------------------------------------------------
// 5) rozhraní
// ---------------------------------------------------------------------------

console.log("\n– rozhraní –")

// Popisky, které jsou v obou jazycích shodou okolností stejné („strach",
// „podstata archetypu" i „potlačený archetyp" se řeknou stejně), plus název
// souboru, který je schválně bez diakritiky a společný.
const SHODNE_ZAMERNE = new Set([
  "respondent",
  "nazevSouboru",
  "strachStitek",
  "podstataTitulek",
  "potlacenyTitulek",
])

const cs = M.UI_ARCHETYPY.cs
const sk = M.UI_ARCHETYPY.sk
const chybejici = Object.keys(cs).filter((k) => sk[k] === undefined)
rekni(chybejici.length === 0, `slovenské rozhraní má všechny klíče${chybejici.length ? ` (${chybejici.join(", ")})` : ""}`)

const VSTUPY = [
  [1, "1"],
  [3, "1, 2, 3"],
  [5, "1, 2, 3, 4, 5"],
  [96, "7"],
]
const nepreloz = Object.keys(cs).filter((k) => {
  if (SHODNE_ZAMERNE.has(k)) return false
  if (typeof cs[k] === "function") {
    return VSTUPY.every(([a, b]) => cs[k](a, b) === sk[k](a, b))
  }
  if (Array.isArray(cs[k])) return JSON.stringify(cs[k]) === JSON.stringify(sk[k])
  if (typeof cs[k] === "object") return JSON.stringify(cs[k]) === JSON.stringify(sk[k])
  return cs[k] === sk[k]
})
rekni(nepreloz.length === 0, `žádný popisek nezůstal český${nepreloz.length ? ` (${nepreloz.join(", ")})` : ""}`)

const ceskeVUi = retezce(sk).filter(([, t]) => CESKA_PISMENA.test(t))
rekni(ceskeVUi.length === 0, `slovenské rozhraní bez ř, ě a ů${ceskeVUi.length ? ` (${ceskeVUi.slice(0, 3).map(([c]) => c).join(", ")})` : ""}`)

rekni(M.UI_ARCHETYPY.en === cs, "angličtina zatím sahá po češtině, jak je zamýšleno")

// škála a instrukce
for (const jazyk of ["cs", "sk", "en"]) {
  const labels = M.SKALA_ARCHETYPY[jazyk]
  rekni(
    [1, 2, 3, 4, 5, 6].every((n) => labels[n] && labels[n].trim()),
    `škála ${jazyk}: šest popisků`,
  )
}
rekni(
  retezce(M.SKALA_ARCHETYPY.sk).every(([, t]) => !CESKA_PISMENA.test(t)),
  "slovenská škála bez ř, ě a ů",
)
rekni(
  M.INSTRUKCE_ARCHETYPY.cs.length === M.INSTRUKCE_ARCHETYPY.sk.length &&
    M.INSTRUKCE_ARCHETYPY.cs.length === M.INSTRUKCE_ARCHETYPY.en.length,
  `instrukce mají ve všech jazycích stejný počet vět (${M.INSTRUKCE_ARCHETYPY.cs.length})`,
)
rekni(
  M.INSTRUKCE_ARCHETYPY.cs.every((v, i) => pocetZnacek(v) === pocetZnacek(M.INSTRUKCE_ARCHETYPY.sk[i])),
  "instrukce mají v češtině a slovenštině stejný počet rodových značek",
)
rekni(
  M.INSTRUKCE_ARCHETYPY.en.every((v) => pocetZnacek(v) === 0),
  "anglické instrukce nemají rodové značky",
)
rekni(
  retezce(M.NAZVY_MOTIVACI.sk).every(([, t]) => !CESKA_PISMENA.test(t)) &&
    retezce(M.POPISY_MOTIVACI.sk).every(([, t]) => !CESKA_PISMENA.test(t)),
  "slovenské názvy a popisy motivací bez ř, ě a ů",
)

// ---------------------------------------------------------------------------
// 6) mužské tvary, které zůstaly bez rodové značky
//
// Texty oslovují čtenáře tykáním, takže druhá osoba s tvrdým mužským tvarem
// („jsi autor", „jak jsi řekl", „aby si vyhral") potřebuje značku. Pozná se
// to jedině ve zdroji: po applyGender() už v textu nic nápadného není.
// ---------------------------------------------------------------------------

console.log("\n– rodové tvary bez značky –")

const VZORY_TVARU = [
  /\b(jsi|si) (ten|tá|sám|sama|rád|prvý|první|jediný|jistý|istý|autor|architekt|ochranca|ochránce|strážce|strážca|vizionář|vizionár|ničitel|ničiteľ|průzkumník|prieskumník|ťahúň|tahoun|učitel|učiteľ)\b/g,
  /\b(abys|aby si|bys|by si|jak jsi|ako si) [a-záäčďéěíĺľňóôřšťúůýž]+l\b/g,
  /\b(mal by si|měl bys|smieš byť|prijímaný|přijímán)\b/g,
]

// Věty, kde mužský tvar patří někomu jinému než čtenáři: citace zákazníka,
// třetí osoba o archetypu.
const NEJDE_O_CTENARE = [
  "zákazník řekne",
  "zákazník povie",
  "popírá sám sebe",
  "popiera sám seba",
]

for (const soubor of ["obsah.ts", "obsah-sk.ts"]) {
  const zdroj = fs
    .readFileSync(path.join(KOREN, "lib", "archetypy", "data", soubor), "utf8")
    // vymaskuj jen rodové značky, ne celé objekty
    .replace(/\{[^{}|\n]*\|[^{}|\n]*\}/g, "«»")
  const nalez = []
  for (const vzor of VZORY_TVARU) {
    for (const m of zdroj.matchAll(vzor)) {
      const okoli = zdroj.slice(Math.max(0, m.index - 60), m.index + m[0].length + 10)
      if (NEJDE_O_CTENARE.some((v) => okoli.includes(v))) continue
      nalez.push(`„…${okoli.slice(-50).replace(/\s+/g, " ")}“`)
    }
  }
  rekni(nalez.length === 0, `${soubor}: každý mužský tvar má rodovou značku${nalez.length ? ` – ${nalez.join("; ")}` : ""}`)
}

console.log(chyb === 0 ? "\narchetypy sedí" : `\nNALEZENO CHYB: ${chyb}`)
process.exit(chyb === 0 ? 0 : 1)
