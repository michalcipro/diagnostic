// Kontrola týdenního plánovače.
//
// Statistika deníku je čistá matematika nad daty a přesně proto se dá pokazit
// tiše: špatně spočítaná úspěšnost návyku pořád vypadá jako procento a špatně
// zvolená hranice týdne pořád vypadá jako týden. Klient si toho nevšimne,
// protože nemá s čím porovnávat. Skript proto nezkouší, jestli čísla „jsou",
// ale jestli sedí na příkladech, kde je odpověď známá předem.
//
// Co se hlídá:
//
// 1) Kalendář: pondělí týdne, čísla ISO týdnů přes přelom roku, rozsahy
//    měsíců včetně přestupného února, posuny přes přechod na letní čas.
// 2) Statistika: budoucí dny se nepočítají, návyk se počítá jen ode dne
//    vzniku a jen do archivace, série přežije hranici období, dnešek bez
//    odškrtnutí sérii nenuluje.
// 3) Souvislosti návyku a ukazatele se nevypisují pod prahem počtu dnů.
// 4) Shrnutí: vychází věty, rodové značky se rozvinou správně a ženská
//    varianta se liší od mužské.
// 5) Rozhraní má všechny klíče ve všech třech jazycích a slovenština není
//    zkopírovaná čeština.
// 6) Nikde není dlouhá pomlčka a čistička znaků pro PDF vyhodí to, co
//    vložené písmo neumí.
//
// Spouští se `node scripts/test-planner.cjs`.

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

function nactiModuly() {
  const esbuild = path.join(KOREN, "node_modules", ".bin", "esbuild")
  if (!fs.existsSync(esbuild)) {
    console.error("Chybí esbuild v node_modules. Spusť `npm install`.")
    process.exit(1)
  }
  const vstup = path.join(KOREN, "scripts", ".planner-vstup.ts")
  const vystup = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "planner-")), "data.cjs")
  fs.writeFileSync(
    vstup,
    `export * as datum from "../lib/planner/datum"
export * as stats from "../lib/planner/stats"
export * as shrnuti from "../lib/planner/shrnuti"
export * as i18n from "../lib/planner/i18n"
export * as typy from "../lib/planner/types"
export * as heslo from "../lib/planner/heslo"
export * as nahoda from "../convex/nahoda"
export { applyGender } from "../lib/diagnostic/gender"
`,
  )
  try {
    execFileSync(
      esbuild,
      [
        vstup,
        "--bundle",
        "--format=cjs",
        "--platform=node",
        `--tsconfig=${path.join(KOREN, "tsconfig.json")}`,
        `--outfile=${vystup}`,
      ],
      { stdio: ["ignore", "ignore", "inherit"] },
    )
    return require(vystup)
  } finally {
    fs.rmSync(vstup, { force: true })
  }
}

const M = nactiModuly()
const { datum: D, stats: S, shrnuti: SH, i18n: I, typy: T, heslo: H, nahoda: N, applyGender } = M

// ---------------------------------------------------------------------------
// 1) kalendář
// ---------------------------------------------------------------------------

console.log("– kalendář –")

rekni(D.pondeli("2026-08-19") === "2026-08-17", "středa 19. 8. patří do týdne od 17. 8.")
rekni(D.pondeli("2026-08-17") === "2026-08-17", "pondělí je samo sobě začátkem týdne")
rekni(D.pondeli("2026-08-23") === "2026-08-17", "neděle patří ještě do téhož týdne, ne do dalšího")
rekni(D.dnyTydne("2026-08-17").length === 7, "týden má sedm dnů")
rekni(D.dnyTydne("2026-08-17")[6] === "2026-08-23", "sedmý den týdne je neděle")

// Přelom roku: 1. 1. 2027 je pátek a patří do 53. týdne roku 2026.
const t1 = D.isoTyden("2027-01-01")
rekni(t1.rok === 2026 && t1.tyden === 53, `1. 1. 2027 je týden 53/2026 (vyšlo ${t1.tyden}/${t1.rok})`)
const t2 = D.isoTyden("2026-01-01")
rekni(t2.rok === 2026 && t2.tyden === 1, `1. 1. 2026 je týden 1/2026 (vyšlo ${t2.tyden}/${t2.rok})`)

// Přechod na letní čas: poslední březnová neděle nesmí posun o den zkřivit.
rekni(D.posun("2026-03-28", 1) === "2026-03-29", "posun přes noc na letní čas dá další den")
rekni(D.posun("2026-03-29", 1) === "2026-03-30", "posun v den změny času dá další den")
rekni(D.rozdilDnu("2026-03-01", "2026-04-01") === 31, "březen má 31 dnů i s přechodem času")

rekni(D.rozsahMesice("2024-02").do === "2024-02-29", "přestupný únor končí 29.")
rekni(D.rozsahMesice("2026-02").do === "2026-02-28", "nepřestupný únor končí 28.")
rekni(D.rozsahMesice("2026-12").do === "2026-12-31", "prosinec končí 31.")
rekni(D.posunMesic("2026-01", -1) === "2025-12", "měsíc zpět z ledna je loňský prosinec")
rekni(D.mesiceRoku("2026").length === 12, "rok má dvanáct měsíců")
rekni(D.indexDne("2026-08-17") === 0, "pondělí má index 0")
rekni(D.indexDne("2026-08-23") === 6, "neděle má index 6")
rekni(!D.jeDatum("2026-02-30"), "31. února není platné datum")
rekni(D.jeDatum("2026-02-28"), "28. února platné je")

// ---------------------------------------------------------------------------
// 2) statistika
// ---------------------------------------------------------------------------

console.log("\n– statistika –")

const DEN = 24 * 60 * 60 * 1000
const cas = (iso) => Date.parse(`${iso}T00:00:00Z`)

const prazdny = (date) => ({ date, schedule: [], ratings: {}, reflection: {}, habits: [] })

/** Sestaví den se zadanými hodnotami. */
function den(date, { navyky = [], hodnoceni = {}, reflexe = {}, rozvrh = [] } = {}) {
  return { date, schedule: rozvrh, ratings: hodnoceni, reflection: reflexe, habits: navyky }
}

const NAVYK_A = { id: "a", name: "Ranní běh", order: 0, createdAt: cas("2026-08-01") }
const NAVYK_B = { id: "b", name: "Protahování", order: 1, createdAt: cas("2026-08-19") }
const NAVYK_C = {
  id: "c",
  name: "Studená sprcha",
  order: 2,
  createdAt: cas("2026-08-01"),
  archivedAt: cas("2026-08-19"),
}

// Týden 17. až 23. 8. 2026, „dnes" je středa 19. 8.
const DNES = "2026-08-19"
const tydenDny = [
  den("2026-08-17", { navyky: ["a", "c"], hodnoceni: { energy: 6, focus: 7, mood: 7, productivity: 6, sleep: 7 } }),
  den("2026-08-18", { navyky: ["a"], hodnoceni: { energy: 5, focus: 5, mood: 6, productivity: 5, sleep: 6 } }),
  den("2026-08-19", { navyky: [], hodnoceni: { energy: 8, focus: 8, mood: 8, productivity: 8, sleep: 8 } }),
  // Budoucí den se zápisem: nesmí se počítat do průměru ani do úspěšnosti.
  den("2026-08-22", { hodnoceni: { energy: 1, focus: 1, mood: 1, productivity: 1 } }),
]

const st = S.spocitejStatistiku({
  dny: tydenDny,
  navyky: [NAVYK_A, NAVYK_B, NAVYK_C],
  od: "2026-08-17",
  do: "2026-08-23",
  dnesniDatum: DNES,
})

rekni(st.dnuCelkem === 3, `proběhly tři dny týdne, ne sedm (vyšlo ${st.dnuCelkem})`)
rekni(st.vyplnenychDnu === 3, `vyplněné jsou tři dny (vyšlo ${st.vyplnenychDnu})`)

const energie = st.metriky.find((m) => m.klic === "energy")
rekni(
  Math.abs(energie.prumer - (6 + 5 + 8) / 3) < 1e-9,
  `průměr energie počítá jen proběhlé dny (vyšlo ${energie.prumer})`,
)
rekni(energie.pocet === 3, `do průměru vstoupily tři hodnoty (vyšlo ${energie.pocet})`)
rekni(energie.rada.length === 7, "řada pokrývá celý týden, aby graf seděl s kalendářem")
rekni(energie.rada[5] === 1, "budoucí hodnota v řadě zůstává, jen se nepočítá do průměru")

const navA = st.navyky.find((n) => n.habitId === "a")
rekni(navA.moznych === 3 && navA.splneno === 2, `návyk A: 2 ze 3 (vyšlo ${navA.splneno} z ${navA.moznych})`)

const navB = st.navyky.find((n) => n.habitId === "b")
rekni(
  navB.moznych === 1,
  `návyk založený 19. 8. má za týden jediný možný den (vyšlo ${navB.moznych})`,
)

const navC = st.navyky.find((n) => n.habitId === "c")
rekni(
  navC.moznych === 3,
  `návyk archivovaný 19. 8. platil tři dny (vyšlo ${navC.moznych})`,
)

// Série: dnešek bez odškrtnutí ji nesmí vynulovat, běží tedy do včerejška.
rekni(navA.aktualniSerie === 2, `série návyku A je 2 (vyšlo ${navA.aktualniSerie})`)

// Série přes hranici měsíce.
const preleze = []
for (let i = 0; i < 10; i++) {
  const d = new Date(cas("2026-07-28") + i * DEN).toISOString().slice(0, 10)
  preleze.push(den(d, { navyky: ["a"] }))
}
const NAVYK_STARY = { id: "a", name: "Ranní běh", order: 0, createdAt: cas("2026-07-01") }
const stSrpen = S.spocitejStatistiku({
  dny: preleze,
  navyky: [NAVYK_STARY],
  od: "2026-08-01",
  do: "2026-08-31",
  dnesniDatum: "2026-08-06",
})
rekni(
  stSrpen.navyky[0].aktualniSerie === 10,
  `série pokračuje přes hranici měsíce (vyšlo ${stSrpen.navyky[0].aktualniSerie})`,
)

// Návyk, který v té době ještě neexistoval, sérii nezačíná dřív než sám.
const stMlady = S.spocitejStatistiku({
  dny: preleze,
  navyky: [NAVYK_A],
  od: "2026-08-01",
  do: "2026-08-31",
  dnesniDatum: "2026-08-06",
})
rekni(
  stMlady.navyky[0].aktualniSerie === 6,
  `série nezačne dřív, než návyk vznikl (vyšlo ${stMlady.navyky[0].aktualniSerie})`,
)

// Reflexe: tři políčka na den.
const stRef = S.spocitejStatistiku({
  dny: [den("2026-08-17", { reflexe: { grateful: "x", win: "y" } })],
  navyky: [],
  od: "2026-08-17",
  do: "2026-08-17",
  dnesniDatum: "2026-08-17",
})
rekni(stRef.reflexe.vyplneno === 2 && stRef.reflexe.moznych === 3, "reflexe se počítá po políčkách")

// Prázdný den se nepočítá jako vyplněný.
const stPrazdny = S.spocitejStatistiku({
  dny: [prazdny("2026-08-17")],
  navyky: [],
  od: "2026-08-17",
  do: "2026-08-17",
  dnesniDatum: "2026-08-17",
})
rekni(stPrazdny.vyplnenychDnu === 0, "den bez obsahu se nepočítá jako vyplněný")

// ---------------------------------------------------------------------------
// 3) souvislosti návyku a ukazatele
// ---------------------------------------------------------------------------

console.log("\n– souvislosti –")

// Pod prahem pěti dnů v každé skupině se nesmí vypsat nic.
const maloDat = []
for (let i = 0; i < 8; i++) {
  const d = new Date(cas("2026-08-01") + i * DEN).toISOString().slice(0, 10)
  maloDat.push(den(d, { navyky: i < 4 ? ["a"] : [], hodnoceni: { energy: i < 4 ? 9 : 4 } }))
}
const stMalo = S.spocitejStatistiku({
  dny: maloDat,
  navyky: [NAVYK_A],
  od: "2026-08-01",
  do: "2026-08-31",
  dnesniDatum: "2026-08-31",
})
rekni(stMalo.vlivNavyku.length === 0, "pod prahem se souvislost nevypisuje")

const dostDat = []
for (let i = 0; i < 20; i++) {
  const d = new Date(cas("2026-08-01") + i * DEN).toISOString().slice(0, 10)
  dostDat.push(den(d, { navyky: i % 2 === 0 ? ["a"] : [], hodnoceni: { energy: i % 2 === 0 ? 8 : 5 } }))
}
const stDost = S.spocitejStatistiku({
  dny: dostDat,
  navyky: [NAVYK_A],
  od: "2026-08-01",
  do: "2026-08-31",
  dnesniDatum: "2026-08-31",
})
const vliv = stDost.vlivNavyku.find((v) => v.metrika === "energy")
rekni(!!vliv, "nad prahem se souvislost vypíše")
rekni(vliv && Math.abs(vliv.rozdil - 3) < 1e-9, `rozdíl je 3 body (vyšlo ${vliv && vliv.rozdil})`)

// ---------------------------------------------------------------------------
// 4) shrnutí
// ---------------------------------------------------------------------------

console.log("\n– shrnutí –")

for (const lang of ["cs", "en", "sk"]) {
  const vetyM = SH.shrnuti(stDost, "mesic", lang, "male").map((v) => applyGender(v, "male"))
  const vetyZ = SH.shrnuti(stDost, "mesic", lang, "female").map((v) => applyGender(v, "female"))
  rekni(vetyM.length >= 4, `${lang}: shrnutí má aspoň čtyři věty (vyšlo ${vetyM.length})`)
  rekni(
    !vetyM.join(" ").includes("{") && !vetyZ.join(" ").includes("{"),
    `${lang}: ve shrnutí nezůstala nerozvinutá rodová značka`,
  )
  if (lang !== "en") {
    rekni(vetyM.join(" ") !== vetyZ.join(" "), `${lang}: ženská varianta se liší od mužské`)
  }
}

// Málo dat: shrnutí to má přiznat, ne dopočítávat.
const stChude = S.spocitejStatistiku({
  dny: [den("2026-08-17", { hodnoceni: { energy: 5 } })],
  navyky: [NAVYK_A],
  od: "2026-08-01",
  do: "2026-08-31",
  dnesniDatum: "2026-08-31",
})
const chude = SH.shrnuti(stChude, "mesic", "cs", "male")
rekni(chude.length <= 5, `při málu dat je shrnutí krátké (vyšlo ${chude.length} vět)`)
rekni(
  chude.some((v) => v.includes("málo dnů")),
  "při málu dat to shrnutí řekne nahlas",
)

// ---------------------------------------------------------------------------
// 5) rozhraní ve třech jazycích
// ---------------------------------------------------------------------------

console.log("\n– jazyky rozhraní –")

const klice = Object.keys(I.UI.cs)
for (const lang of ["en", "sk"]) {
  const chybi = klice.filter((k) => !(k in I.UI[lang]) || !I.UI[lang][k])
  rekni(chybi.length === 0, `${lang}: rozhraní má všechny klíče${chybi.length ? ` (chybí ${chybi.join(", ")})` : ""}`)
}
// Slovenština nesmí být kopie češtiny. Prahem se to hlídat nedá: řada slov je
// v obou jazycích shodou okolností stejná („Heslo", „Jazyk", „Klienti") a
// překládat je na sílu by bylo horší než je nechat. Proto výslovný seznam:
// co je na něm, je ověřeně stejné, a cokoli nového, co se shoduje, znamená
// zapomenutý překlad.
const STEJNE_V_OBOU = new Set([
  "habitsProgress",
  "notesIdeas",
  "tabNavyky",
  "tabUcet",
  "dnes",
  "heslo",
  "noveHeslo",
  "navykyNadpis",
  "novyNavyk",
  "archivovane",
  "statRok",
  "statNavyky",
  "statRozsah",
  "statVyvoj",
  "ucetNadpis",
  // „Tmavý" se česky i slovensky píše stejně; „Světlý" a „Svetlý" už ne.
  "temaTmave",
  "rodMuz",
  "rodZena",
  "jazyk",
  "koucKlienti",
  "koucPozvanky",
  "statBezNavyku",
])
const shodneSCestinou = klice.filter(
  (k) => I.UI.sk[k] === I.UI.cs[k] && I.UI.cs[k] !== I.UI.en[k] && !STEJNE_V_OBOU.has(k),
)
rekni(
  shodneSCestinou.length === 0,
  `slovenština není opsaná čeština${shodneSCestinou.length ? ` (nepřeloženo: ${shodneSCestinou.join(", ")})` : ""}`,
)

for (const lang of ["cs", "en", "sk"]) {
  const m = Object.keys(I.NAZVY_METRIK[lang])
  rekni(m.length === T.METRIKY.length, `${lang}: názvy všech ukazatelů`)
  const r = Object.keys(I.NAZVY_REFLEXE[lang])
  rekni(r.length === T.REFLEXE.length, `${lang}: názvy všech otázek reflexe`)
}

// Rodová značka musí mít obě větve neprázdné a různé.
const znacka = /\{([^{}|]*)\|([^{}|]*)\}/g
let spatnaZnacka = 0
const projdi = (o) => {
  if (typeof o === "string") {
    for (const m of o.matchAll(znacka)) {
      if (!m[1].trim() || !m[2].trim() || m[1] === m[2]) spatnaZnacka++
    }
    return
  }
  if (o && typeof o === "object") for (const v of Object.values(o)) projdi(v)
}
projdi(I.UI)
projdi(I.NAZVY_METRIK)
projdi(I.NAZVY_REFLEXE)
rekni(spatnaZnacka === 0, `rodové značky mají obě větve celé (vadných: ${spatnaZnacka})`)

// ---------------------------------------------------------------------------
// 6) typografie a čistička znaků pro PDF
// ---------------------------------------------------------------------------

console.log("\n– typografie –")

const SOUBORY = []
const projdiSlozku = (p) => {
  for (const z of fs.readdirSync(p, { withFileTypes: true })) {
    const cela = path.join(p, z.name)
    if (z.isDirectory()) {
      if (z.name === "node_modules" || z.name.startsWith(".")) continue
      projdiSlozku(cela)
    } else if (/\.(ts|tsx|css)$/.test(z.name)) {
      SOUBORY.push(cela)
    }
  }
}
for (const slozka of ["lib/planner", "components/planner", "convex"]) {
  projdiSlozku(path.join(KOREN, slozka))
}
SOUBORY.push(path.join(KOREN, "app", "planner.css"))
SOUBORY.push(path.join(KOREN, "app", "planner", "page.tsx"))
SOUBORY.push(path.join(KOREN, "app", "planner", "start", "[token]", "page.tsx"))

// Znak se skládá z kódu: kdyby tu stál napsaný, našel by ho projektový
// grep a hlásil by chybu v kontrole, která žádnou chybu nehlásí.
const DLOUHA_POMLCKA = String.fromCharCode(0x2014)
const sDlouhouPomlckou = SOUBORY.filter((f) =>
  fs.readFileSync(f, "utf8").includes(DLOUHA_POMLCKA),
)
rekni(
  sDlouhouPomlckou.length === 0,
  `nikde není dlouhá pomlčka${sDlouhouPomlckou.length ? ` (${sDlouhouPomlckou.map((f) => path.relative(KOREN, f)).join(", ")})` : ""}`,
)

// ---------------------------------------------------------------------------
// 7) heslo
// ---------------------------------------------------------------------------

console.log("\n– heslo –")

rekni(!!H.zkontrolujHeslo("krátké", "cs"), "krátké heslo neprojde")
rekni(!!H.zkontrolujHeslo("mojeheslo123", "cs"), "heslo se slovníkovým slovem neprojde")
rekni(
  !!H.zkontrolujHeslo("novakovaNovak1", "cs", "novak@example.com"),
  "heslo obsahující část e-mailu neprojde",
)
rekni(!H.zkontrolujHeslo("Kotva-Rybnik-42x", "cs"), "rozumné heslo projde")
for (const lang of ["cs", "en", "sk"]) {
  rekni(typeof H.zkontrolujHeslo("abc", lang) === "string", `${lang}: hláška o hesle existuje`)
}

// ---------------------------------------------------------------------------
// 8) dočasné heslo od kouče
// ---------------------------------------------------------------------------
//
// Heslo se diktuje do telefonu a píše na mobilu, takže na něm záleží dvojí:
// aby v něm nebylo nic, co se dá přeslechnout nebo přepsat, a aby výběr slov
// nebyl zkreslený. Seznam má proto přesně 64 položek: 256 hodnot bajtu se na
// něj dělí beze zbytku, takže žádné slovo nevychází častěji než jiné.

console.log("\n– dočasné heslo –")

{
  const vzorek = Array.from({ length: 400 }, () => N.makeHeslo())
  const slova = new Set()
  let spatny = 0
  for (const h of vzorek) {
    const casti = h.split("-")
    if (casti.length !== 4) spatny++
    for (const c of casti) {
      if (!/^[a-z]{3,6}$/.test(c)) spatny++
      slova.add(c)
    }
  }
  rekni(spatny === 0, `heslo je čtyři krátká slova bez diakritiky (vadných: ${spatny})`)
  rekni(
    slova.size === 64,
    `ve vzorku se objeví všech 64 slov seznamu (objevilo se ${slova.size})`,
  )
  rekni(new Set(vzorek).size > 390, "hesla se ve vzorku neopakují")

  // Dočasné heslo musí projít vlastní kontrolou hesel: kdyby ji neprošlo,
  // klient by dostal heslo, které si sám nastavit nesmí.
  const problem = vzorek.filter((h) => H.zkontrolujHeslo(h, "cs"))
  rekni(problem.length === 0, `vygenerované heslo projde kontrolou hesel (vadných: ${problem.length})`)

  rekni(N.makeToken().length === 24, "token do odkazu má pořád 24 znaků")
  rekni(/^[a-km-np-z2-9]+$/.test(N.makeToken()), "token nemá znaky, které se pletou")
}

// ---------------------------------------------------------------------------
// 9) motivy deníku
// ---------------------------------------------------------------------------
//
// Deník má světlý a tmavý motiv postavený na týchž tokenech. Pokazit se to dá
// tiše dvěma způsoby a oba se v praxi staly:
//
// 1. Token se použije v pravidle, ale chybí v jednom motivu. Neznámá proměnná
//    není chyba, jen neplatná deklarace, takže druhý motiv prostě přijde
//    o stín nebo o pozadí a nikdo si toho nevšimne, dokud ho nezapne.
// 2. Do pravidla se napíše barva natvrdo. Vypadá dobře v tom motivu, ve
//    kterém ji člověk psal, a rozbije ten druhý. Přesně tak se do vybraného
//    tlačítka škály dostala bílá, která na jantarovém podkladu není vidět.
//
// Tokeny musí být navíc i na globálním :root, protože tytéž třídy kreslí
// i koučovská sekce, která obal .pl-root nemá.

console.log("\n– motivy –")

{
  const css = fs.readFileSync(path.join(KOREN, "app", "planner.css"), "utf8")

  /** Tělo pravidla se zadaným selektorem, hledané párováním závorek. */
  const blok = (selektor) => {
    const od = css.indexOf(selektor + " {")
    if (od === -1) return null
    let hloubka = 0
    for (let i = css.indexOf("{", od); i < css.length; i++) {
      if (css[i] === "{") hloubka++
      else if (css[i] === "}" && --hloubka === 0) return css.slice(od, i)
    }
    return null
  }

  const svetly = blok(".pl-root")
  const tmavy = blok('.pl-root[data-tema="tmave"]')
  const globalni = blok(":root")
  rekni(!!svetly && !!tmavy && !!globalni, "planner.css má oba motivy i globální tokeny")

  if (svetly && tmavy && globalni) {
    // `--pl-v` se předává inline z komponenty, `--pl-ovladani` je rozměr
    // ve vlastním bloku; barvy to nejsou a do motivů nepatří.
    const MIMO = new Set(["--pl-v", "--pl-ovladani"])
    const pouzite = [...new Set([...css.matchAll(/var\((--(?:pl|el)-[a-z0-9-]+)/g)].map((m) => m[1]))]
      .filter((t) => !MIMO.has(t))
      .sort()

    for (const [jmeno, telo] of [
      ["světlém motivu", svetly],
      ["tmavém motivu", tmavy],
      ["globálním :root", globalni],
    ]) {
      const chybejici = pouzite.filter((t) => !telo.includes(`${t}:`))
      rekni(
        chybejici.length === 0,
        `všechny tokeny jsou v ${jmeno}${chybejici.length ? ` (chybí: ${chybejici.join(", ")})` : ` (${pouzite.length})`}`,
      )
    }

    // Barvy natvrdo v pravidlech. Definice tokenů se vynechávají, protože
    // právě ty barvu obsahovat mají; hledá se barva v běžné vlastnosti, tedy
    // tam, kde se váže na jeden motiv. Tisk je výjimka: tam se sází na papír
    // a odstíny na motivu nezávisí.
    const tisk = css.indexOf("@media print {")
    const telo = css
      .slice(0, tisk === -1 ? css.length : tisk)
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .split("\n")
      // Podklad dokumentu je jediné místo, kde barva přes token jít nemůže:
      // `body` stojí nad kořenem motivu, takže jeho proměnné ještě nezná.
      .filter((r) => !/^\s*--[a-z0-9-]+\s*:/.test(r) && !r.includes("body:has("))
      .join("\n")
    const barvy = [
      ...telo.matchAll(/(?:^|[\s:,(])(#[0-9a-fA-F]{3,8})\b/g),
      ...telo.matchAll(/(rgba?\([^)]*\))/g),
    ].map((m) => m[1])
    rekni(
      barvy.length === 0,
      `v pravidlech není barva natvrdo${barvy.length ? ` (${[...new Set(barvy)].slice(0, 6).join(", ")})` : ""}`,
    )

    // Tisk musí přebít i tmavou větev, ta má vyšší specificitu.
    rekni(
      /@media print \{[\s\S]{0,400}\.pl-root,\s*\n?\s*\.pl-root\[data-tema="tmave"\]/.test(css),
      "tiskový blok přebíjí i tmavý motiv",
    )
  }
}

// ---------------------------------------------------------------------------

console.log(`\n${chyb === 0 ? "Vše v pořádku." : `Chyb: ${chyb}`}`)
process.exit(chyb === 0 ? 0 : 1)
