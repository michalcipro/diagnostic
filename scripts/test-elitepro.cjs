// Kontrola ELITE Pro v pilotní verzi.
//
// Tři věci. Za prvé, že data pro prohlížeč a klíč pro server sedí na sebe
// a z dat pro prohlížeč se klíč vyčíst nedá. Za druhé forma: každý dostane
// z každé škály polovinu kandidátů, dvě viněty z každé skupiny a pět kontrol,
// stejný token vždy stejnou formu a celé se to vejde do 45 minut. Za třetí
// odeslání: server vezme jen otázky z formy v povoleném rozsahu, otázky na
// duševní pohodu neuloží a doporučení odborníka spočítá podle hranice PHQ-4.
//
// Spouští se `node scripts/test-elitepro.cjs`.

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

const vstup = path.join(KOREN, "scripts", ".elitepro-vstup.ts")
const vystup = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "elitepro-")), "elitepro.cjs")
fs.writeFileSync(
  vstup,
  `export * from "../lib/elitepro/klic"
export * from "../lib/elitepro/spolecne"
export { sestavFormu, reakceFormy } from "../lib/elitepro/forma"
export { zpracujOdpovedi, ChybaOdeslani } from "../lib/elitepro/odeslani"
export { T, KONTEXT_OTAZKY, SPANEK_OTAZKY, POHODA_OTAZKY } from "../lib/elitepro/dotaznik"
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

const data = JSON.parse(fs.readFileSync(path.join(KOREN, "lib/elitepro/data/dotaznik-cs.json"), "utf8"))
const banka = JSON.parse(fs.readFileSync(path.join(KOREN, "docs/novy-test/banka/banka-cs.json"), "utf8"))

// ---- 1) data a klíč ----

rekni(M.SKALY.length === M.POCET_SKAL, `klíč má ${M.POCET_SKAL} škál`)
rekni(M.SKALY.every((s) => s.polozky.length === 12), "každá škála má 12 kandidátů")
rekni(M.SKALY.every((s) => s.obracene.every((o) => s.polozky.includes(o))), "obrácené položky patří do své škály")
const vsechnaCisla = [...M.SKALY.flatMap((s) => s.polozky), ...M.KONTROLNI.map((k) => k.id)]
rekni(new Set(vsechnaCisla).size === vsechnaCisla.length, "žádné číslo položky se neopakuje")
rekni(
  vsechnaCisla.every((id) => data.polozky[id]) && Object.keys(data.polozky).length === vsechnaCisla.length,
  "prohlížeč má text ke každé položce a nic navíc",
)
rekni(
  M.VINETY.length === 36 && M.VINETY.every((v) => v.reakce.length === 4 && data.vinety[v.id]?.r.length === 4),
  "36 vinět po 4 reakcích, v klíči i v prohlížeči",
)
rekni(
  M.VINETY.every((v) => v.reakce.every((r) => data.vinety[v.id].r.some(([id]) => id === r.id))),
  "čísla reakcí v klíči a v prohlížeči sedí",
)

// Z dat pro prohlížeč se klíč vyčíst nesmí.
const surova = fs.readFileSync(path.join(KOREN, "lib/elitepro/data/dotaznik-cs.json"), "utf8")
rekni(!/"(smer|klic|skala|kod|ocekavano|druh)"/.test(surova), "data pro prohlížeč neobsahují klíč")
rekni(!/"[A-Z]{2}\.\d+-\d{2}"/.test(surova), "data pro prohlížeč neobsahují označení z banky")
// Texty sedí s bankou.
const textyBanky = new Set(banka.skaly.flatMap((s) => s.polozky.map((p) => p.text)))
const textySkal = M.SKALY.flatMap((s) => s.polozky.map((id) => data.polozky[id].t))
rekni(textySkal.every((t) => textyBanky.has(t)), "texty položek jsou z banky")
rekni(
  M.SKALY.every((s) => s.polozky.every((id) => data.polozky[id].f === s.format && data.polozky[id].r === s.ramec)),
  "formát a rámec položky odpovídají škále",
)

// ---- 2) forma ----

const f1 = M.sestavFormu("token-a")
const f1b = M.sestavFormu("token-a")
const f2 = M.sestavFormu("token-b")
rekni(JSON.stringify(f1) === JSON.stringify(f1b), "stejný token dá stejnou formu")
rekni(JSON.stringify(f1) !== JSON.stringify(f2), "jiný token dá jinou formu")
rekni(
  M.SKALY.every((s) => f1.polozky.filter((id) => s.polozky.includes(id)).length === M.POLOZEK_NA_SKALU),
  `z každé škály přesně ${M.POLOZEK_NA_SKALU} položek`,
)
const kontroly = M.KONTROLNI.filter((k) => f1.polozky.includes(k.id))
rekni(
  kontroly.length === 5 &&
    kontroly.filter((k) => k.druh === "instruovana").length === 2 &&
    new Set(kontroly.filter((k) => k.druh === "instruovana").map((k) => k.format)).size === 2,
  "pět kontrol: instruovaná na souhlas, na četnost a tři nepravděpodobné",
)
const skupiny = {}
for (const vid of f1.vinety) {
  const s = M.VINETY.find((v) => v.id === vid).skupina
  skupiny[s] = (skupiny[s] ?? 0) + 1
}
rekni(Object.values(skupiny).length === 3 && Object.values(skupiny).every((n) => n === 2), "dvě viněty z každé skupiny")
rekni(f1.polozky.length + M.reakceFormy(f1).length === M.VELIKOST_FORMY, `forma má ${M.VELIKOST_FORMY} odpovědí`)

// Rovnoměrnost: přes 400 tokenů má každá položka vyjít zhruba v polovině.
const cetnost = new Map()
for (let i = 0; i < 400; i++) for (const id of M.sestavFormu(`t${i}`).polozky) cetnost.set(id, (cetnost.get(id) ?? 0) + 1)
const podily = M.SKALY.flatMap((s) => s.polozky).map((id) => (cetnost.get(id) ?? 0) / 400)
rekni(Math.min(...podily) > 0.35 && Math.max(...podily) < 0.65, "každá položka se objeví zhruba v polovině forem")

// Čas: 7 tvrzení za minutu, 40 s na vinětu, 4 minuty na úvod, kontext, spánek a pohodu.
const minut = f1.polozky.length / 7 + (f1.vinety.length * 40) / 60 + 4
rekni(minut <= 45, `odhad času ${minut.toFixed(1)} min je do 45 minut`)

// ---- 3) odeslání ----

const plne = () => {
  const o = {}
  for (const id of [...f1.polozky, ...M.reakceFormy(f1)]) o[id] = 3
  for (const [id, n] of Object.entries(M.KONTEXT)) o[id] = n
  for (const id of M.SPANEK_CASY) o[id] = 23 * 60 + 30
  o[M.SPANEK_BUDIK] = 2
  return o
}
const pohoda = (a, b, c, d) => ({ 2001: a, 2002: b, 2003: c, 2004: d })

let z = M.zpracujOdpovedi(f1, plne())
rekni(z.complete && z.answeredCount === M.VELIKOST_FORMY, "úplně vyplněná forma je kompletní")
rekni(!z.doporuceni, "bez otázek na pohodu žádné doporučení")

z = M.zpracujOdpovedi(f1, { ...plne(), ...pohoda(3, 3, 3, 3) })
rekni(z.doporuceni, "vysoké odpovědi na pohodu vedou k doporučení")
rekni(!Object.keys(z.ciste).some((k) => Number(k) >= 2001 && Number(k) <= 2004), "odpovědi na pohodu se neukládají")

rekni(!M.zpracujOdpovedi(f1, { ...plne(), ...pohoda(1, 1, 1, 1) }).doporuceni, "součty 2 a 2: bez doporučení")
rekni(M.zpracujOdpovedi(f1, { ...plne(), ...pohoda(2, 1, 0, 0) }).doporuceni, "úzkost 3: doporučení")
rekni(M.zpracujOdpovedi(f1, { ...plne(), ...pohoda(0, 0, 1, 2) }).doporuceni, "skleslost 3: doporučení")
rekni(M.zpracujOdpovedi(f1, { ...plne(), 2001: 3 }).doporuceni, "neúplná dvojice, která hranici dosáhne: doporučení")

const odmitne = (popis, odpovedi) => {
  let vyhozeno = false
  try {
    M.zpracujOdpovedi(f1, odpovedi)
  } catch (e) {
    vyhozeno = e instanceof M.ChybaOdeslani
  }
  rekni(vyhozeno, `odmítne ${popis}`)
}
const mimoFormu = M.SKALY.flatMap((s) => s.polozky).find((id) => !f1.polozky.includes(id))
odmitne("položku, kterou sportovec nedostal", { ...plne(), [mimoFormu]: 3 })
odmitne("hodnotu 6 u tvrzení", { ...plne(), [f1.polozky[0]]: 6 })
odmitne("hodnotu 0 u tvrzení", { ...plne(), [f1.polozky[0]]: 0 })
odmitne("desetinné číslo", { ...plne(), [f1.polozky[0]]: 2.5 })
odmitne("pohodu mimo 0 až 3", { ...plne(), 2001: 4 })
odmitne("kontext mimo možnosti", { ...plne(), 3001: 3 })
odmitne("čas spánku 24:00", { ...plne(), 4001: 1440 })
odmitne("neznámé číslo otázky", { ...plne(), 999999: 1 })
odmitne("nečíselný klíč", { ...plne(), abc: 1 })

const neuplna = plne()
delete neuplna[f1.polozky[0]]
z = M.zpracujOdpovedi(f1, neuplna)
rekni(!z.complete && z.answeredCount === M.VELIKOST_FORMY - 1, "chybějící odpověď: nekompletní, počet sedí")

// ---- 4) texty ----

const texty = [
  ...Object.values(M.T).flatMap((x) => (typeof x === "string" ? [x] : Array.isArray(x) ? x : typeof x === "object" ? Object.values(x) : [])),
  data.otazkaVinet,
]
const znacky = texty.join(" ").match(/\{[^{}]*\}/g) ?? []
rekni(znacky.every((z) => /^\{[^|{}]+\|[^|{}]+\}$/.test(z)), "rodové značky jsou celá slova, bez prázdné větve")
rekni(
  texty.every((t) => !M.applyGender(t, "female").includes("{") && !M.applyGender(t, "male").includes("{")),
  "po dosazení rodu nezůstane žádná značka",
)
const soubory = [
  "lib/elitepro/dotaznik.ts",
  "lib/elitepro/spolecne.ts",
  "lib/elitepro/forma.ts",
  "lib/elitepro/odeslani.ts",
  "lib/elitepro/klic.ts",
  "lib/elitepro/data/dotaznik-cs.json",
  "components/elitepro/dotaznik.tsx",
  "components/elitepro/detail.tsx",
  "convex/pohoda.ts",
]
rekni(
  soubory.every((s) => !fs.readFileSync(path.join(KOREN, s), "utf8").includes("\u2014")),
  "bez dlouhé pomlčky",
)

// ---- 5) pravidla přístupu ----

const pohodaTs = fs.readFileSync(path.join(KOREN, "convex/pohoda.ts"), "utf8")
rekni((pohodaTs.match(/jeKlubovy\(me\)/g) ?? []).length === 2, "klubový kouč doporučení nevidí ani nezapíše")
rekni((pohodaTs.match(/!vidi\(d\.coachId\) \|\| !sdileno\(d\)/g) ?? []).length === 2, "doporučení jen u viditelného vyplnění")
const elite = fs.readFileSync(path.join(KOREN, "convex/eliteDiagnostic.ts"), "utf8")
const uklid = fs.readFileSync(path.join(KOREN, "convex/uklid.ts"), "utf8")
rekni(elite.includes('"doporuceniOdbornika"') && uklid.includes('"doporuceniOdbornika"'), "doporučení se maže s vyplněním")
rekni(/elitepro[\s\S]{0,80}args\.lang !== "cs"/.test(elite), "pozvánka na ELITE Pro jen česky")

console.log(chyb === 0 ? "\nvše v pořádku" : `\nNALEZENO CHYB: ${chyb}`)
process.exit(chyb === 0 ? 0 : 1)
