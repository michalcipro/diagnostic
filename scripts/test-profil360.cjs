// Kontrola Profilu 360.
//
// Data: všechny škály mají správný počet položek, silné stránky jsou
// vyvážené (dvě kladné a dvě záporné položky), každá položka má český text
// a z dat pro prohlížeč se klíč vyčíst nedá. Výpočet: na modelových
// sportovcích se známým profilem musí vyjít to, co do nich bylo vloženo.
// Spolehlivost, chronotyp přes půlnoc a kontrola odeslání.
//
// Spouští se `node scripts/test-profil360.cjs`.

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

const vstup = path.join(KOREN, "scripts", ".profil360-vstup.ts")
const vystup = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "profil360-")), "profil360.cjs")
fs.writeFileSync(
  vstup,
  `export * from "../lib/profil360/klic"
export * from "../lib/profil360/spolecne"
export { vyhodnot, shrnuti, OBLASTI, TYPY } from "../lib/profil360/profil"
export { zpracujOdpovedi, ChybaOdeslani } from "../lib/profil360/odeslani"
export { T } from "../lib/profil360/dotaznik"
export { applyGender } from "../lib/diagnostic/gender"
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

const surova = fs.readFileSync(path.join(KOREN, "lib/profil360/data/dotaznik-cs.json"), "utf8")
const data = JSON.parse(surova)
const skala = (kod) => M.SKALY.find((s) => s.kod === kod)

// ---- 1) data ----

const fazety = M.SKALY.filter((s) => /^[NEOAC][1-6]$/.test(s.kod))
rekni(fazety.length === 29 && !skala("O6"), "29 fazet osobnosti, liberalismus (O6) vynechán")
rekni(fazety.every((s) => s.polozky.length === 4), "každá fazeta má 4 položky")
const via = M.SKALY.filter((s) => s.kod.startsWith("V."))
rekni(via.length === 24 && via.every((s) => s.polozky.length === 4), "24 silných stránek po 4 položkách")
rekni(via.every((s) => s.obracene.length === 2), "každá silná stránka má 2 kladné a 2 obrácené položky")
rekni(
  ["bis-anxiety", "bas-fun-seeking", "bas-drive", "bas-reward-responsiveness"].map((k) => skala(k)?.polozky.length).join() ===
    "10,10,10,6",
  "BIS/BAS: 10, 10, 10 a 6 položek",
)
rekni(skala("DASS.stress")?.polozky.length === 7 && skala("DASS.stress").obracene.length === 0, "DASS stres: 7 položek, žádná obrácená")

const vsechnaCisla = new Set([...M.SKALY.flatMap((s) => s.polozky), ...M.KONTROLNI.map((k) => k.id)])
rekni(
  [...vsechnaCisla].every((id) => data.polozky[id]) && Object.keys(data.polozky).length === vsechnaCisla.size,
  `prohlížeč má text ke každé otázce a nic navíc (${vsechnaCisla.size})`,
)
rekni(vsechnaCisla.size === M.POCET_IPIP + M.DASS.length, "počty otázek sedí se spolecne.ts")
rekni(!/"(obracene|ocekavano|kod|nastroj|druh)"/.test(surova), "data pro prohlížeč neobsahují klíč")
rekni(
  Object.entries(data.polozky).every(([id, p]) => p.t && p.t !== M.ORIGINAL_EN[id]),
  "každá otázka má český text, žádná nezůstala anglicky",
)
const znacky = (surova + JSON.stringify(M.T)).match(/\{[^{}"]*\}/g) ?? []
rekni(znacky.every((z) => /^\{[^|{}]+\|[^|{}]+\}$/.test(z)), "rodové značky jsou celá slova")
rekni(!surova.includes("\u2014"), "bez dlouhé pomlčky v otázkách")

// ---- 2) modelový sportovec ----

/** Odpovědi, kde má každá škála zadanou úroveň 1 až 5 (výchozí 3). */
function sportovec(urovne = {}, dass = 0) {
  const o = {}
  for (const s of M.SKALY) {
    if (s.kod === "DASS.stress") {
      for (const id of s.polozky) o[id] = dass
      continue
    }
    const u = urovne[s.kod] ?? 3
    for (const id of s.polozky) o[id] = s.obracene.includes(id) ? 6 - u : u
  }
  for (const k of M.KONTROLNI) o[k.id] = k.ocekavano[0]
  o[4001] = 23 * 60
  o[4002] = 7 * 60
  o[4003] = 0
  o[4004] = 9 * 60
  o[M.SPANEK.budik] = 2
  return o
}

// Klidný dříč: nízká úzkost a zranitelnost, vysoká svědomitost a vytrvalost.
const klidny = M.vyhodnot(
  sportovec({
    N1: 1, N2: 1, N3: 1, N4: 2, N5: 1, N6: 1, "bis-anxiety": 1,
    C1: 5, C3: 5, C4: 5, C5: 5, C6: 5,
    "V.perseverance": 5, "V.self-regulation": 5, "V.prudence": 5, "V.valor": 4, "V.hope-optimism": 5,
  }),
  2100,
)
const oblast = (p, id) => p.oblasti.find((o) => o.id === id).hodnota
rekni(oblast(klidny, "tlak") >= 80, `klidný sportovec: výkon pod tlakem vysoko (${oblast(klidny, "tlak")})`)
rekni(oblast(klidny, "prace") >= 90, `klidný sportovec: pracovní morálka vysoko (${oblast(klidny, "prace")})`)
rekni(["finiser", "dric"].includes(klidny.typ.hlavni.id), `klidný sportovec: typ ${klidny.typ.hlavni.nazev}`)
rekni(klidny.rizika.length === 0, "klidný sportovec: žádné riziko")
rekni(klidny.spolehlivost.celkem === "ok", "klidný sportovec: vyplnění spolehlivé")

// Úzkostný a vznětlivý, zbrklý, hledá vzrušení.
const uzkostny = M.vyhodnot(
  sportovec({ N1: 5, N6: 5, N2: 5, "bis-anxiety": 5, C6: 1, E5: 5, "bas-fun-seeking": 5, C5: 2 }, 3),
  2100,
)
rekni(oblast(uzkostny, "tlak") <= 30, `úzkostný sportovec: výkon pod tlakem nízko (${oblast(uzkostny, "tlak")})`)
const rizika = uzkostny.rizika.map((r) => r.id)
rekni(
  ["obavy", "vztek", "riskovani", "disciplina", "stres"].every((r) => rizika.includes(r)),
  `úzkostný sportovec: rizika ${rizika.join(", ")}`,
)
rekni(uzkostny.stres.pasmo === "vysoka", "DASS 3 u všech položek: vysoký stres")

// Lídr: průbojnost, vůdcovství, tah na cíl.
const lidr = M.vyhodnot(
  sportovec({ E3: 5, "V.leadership": 5, "bas-drive": 5, "V.valor": 5, "V.social-intelligence": 5, C1: 5, C4: 4, E4: 4, N1: 2, N6: 2 }),
  2100,
)
rekni(lidr.typ.hlavni.id === "lidr", `lídr: typ ${lidr.typ.hlavni.nazev}`)

// ---- 3) spolehlivost ----

const vse5 = {}
for (const id of vsechnaCisla) vse5[id] = 5
const spatne = M.vyhodnot(vse5, 2000)
rekni(spatne.spolehlivost.celkem === "neplatne", "všude 5: vyplnění nespolehlivé")
rekni(spatne.spolehlivost.souhlasnost.stav === "pozor", "všude 5: souhlasnost zachycená")
rekni(M.vyhodnot(sportovec(), 200).spolehlivost.tempo.stav === "neplatne", "příliš rychlé vyplnění je nespolehlivé")

// ---- 4) chronotyp ----

rekni(klidny.chronotyp.spankuPrace === 8 && klidny.chronotyp.spankuVolno === 9, "délka spánku přes půlnoc")
rekni(klidny.chronotyp.socialniJetlag === 1.5, `sociální jetlag: středy 3:00 a 4:30 dají 1,5 h (${klidny.chronotyp.socialniJetlag})`)
const sova = sportovec()
sova[4003] = 3 * 60
sova[4004] = 12 * 60
const pSova = M.vyhodnot(sova, 2100)
rekni(pSova.chronotyp.typ.startsWith("vecerni"), `usínání ve 3 a vstávání ve 12: ${pSova.chronotyp.typ}`)
rekni(pSova.chronotyp.stredVolno > 5 && pSova.chronotyp.stredVolno < 8, "střed spánku sovy je dopoledne, ne 30 h")

// ---- 5) shrnutí ----

const text = M.shrnuti(klidny).join(" ")
rekni(/Tvůj profil|Tvoje nejsilnější/.test(text), "shrnutí je ve druhé osobě")
rekni(!M.applyGender(text, "female").includes("{"), "shrnutí po dosazení rodu bez značek")
const vsechnyTexty = JSON.stringify([M.OBLASTI, M.TYPY])
rekni(!vsechnyTexty.includes("\u2014"), "výklad bez dlouhé pomlčky")
const zn = vsechnyTexty.match(/\{[^{}"]*\}/g) ?? []
rekni(zn.every((z) => /^\{[^|{}]+\|[^|{}]+\}$/.test(z)), "rodové značky ve výkladu jsou celá slova")

// ---- 6) odeslání ----

const plne = sportovec()
let z = M.zpracujOdpovedi(plne)
rekni(z.complete && z.answeredCount === M.VELIKOST, "úplné vyplnění je kompletní")
rekni(!z.doporuceni, "bez otázek na pohodu žádné doporučení")
z = M.zpracujOdpovedi({ ...plne, 2001: 2, 2002: 1, 3001: 1 })
rekni(z.doporuceni && !("2001" in z.ciste) && z.ciste["3001"] === 1, "pohoda: doporučení, odpovědi se neukládají, kontext ano")
const odmitne = (popis, o) => {
  let v = false
  try {
    M.zpracujOdpovedi(o)
  } catch (e) {
    v = e instanceof M.ChybaOdeslani
  }
  rekni(v, `odmítne ${popis}`)
}
odmitne("hodnotu 6", { ...plne, 1: 6 })
odmitne("DASS 4", { ...plne, [M.DASS[0]]: 4 })
odmitne("neznámou otázku", { ...plne, 999: 1 })
odmitne("čas 24:00", { ...plne, 4001: 1440 })

// ---- 7) čas ----

const minut = M.POCET_IPIP / 8 + 7 * 0.15 + 4
rekni(minut <= 60, `odhad času ${minut.toFixed(0)} min je do 60 minut`)

console.log(chyb === 0 ? "\nvše v pořádku" : `\nNALEZENO CHYB: ${chyb}`)
process.exit(chyb === 0 ? 0 : 1)
