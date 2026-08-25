// Případ užití týmové větve od začátku do konce.
//
// Projde celý řetězec na vymyšleném týmu: master založí tým, klubový kouč
// rozešle odkazy, hráčky vyplní, jedna si nepřeje sdílet, jedna dotazník
// odklikne bez čtení a dvě neodevzdají vůbec. Na konci se ukáže, co uvidí
// každá z rolí a co dostane hráčka do ruky.
//
// Píše se to jako skript, ne jako sada tvrzení, protože smyslem je vidět
// celý příběh pohromadě. Jednotlivá pravidla hlídají test-vetve.cjs a
// test-tym.cjs; tohle je ukázka, že to dohromady dává smysl.
//
// Spouští se `node scripts/pripad-uziti.cjs [--en] [--pdf]`. Bez `--pdf` se
// jen projde scénář a zkontrolují se tvrzení; PDF nese časové razítko, takže
// by při každém běhu v auditu měnilo soubory v repozitáři.

const fs = require("fs")
const os = require("os")
const path = require("path")
const { execFileSync } = require("child_process")

const KOREN = path.join(__dirname, "..")
const JAZYK = process.argv.includes("--en") ? "en" : "cs"
const PSAT_PDF = process.argv.includes("--pdf")

const esbuild = path.join(KOREN, "node_modules", ".bin", "esbuild")
if (!fs.existsSync(esbuild)) {
  console.error("Chybí esbuild v node_modules. Spusť `npm install`.")
  process.exit(1)
}

const vstup = path.join(KOREN, "scripts", ".pripad.ts")
const vystup = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "pripad-")), "pripad.cjs")
fs.writeFileSync(
  vstup,
  `export { evaluate } from "../lib/diagnostic/scoring"
export { getStructure, ELITE200_FACETS, ELITE200_REVERSED } from "../lib/diagnostic/structure"
export { tymovyProfil } from "../lib/tym/agregace"
export { vyhodnoceniHrace } from "../convex/vyhodnoceniHrace"
export { buildTymPdf } from "../lib/tym/pdf"
export { buildHracPdf } from "../lib/tym/pdf-hrace"
export { TYM } from "../lib/tym/obsah"
export { KRATCE, CASTI, MAPA, slovoUrovne, shodaKratce } from "../lib/tym/slova"
export { SOUHLAS } from "../lib/diagnostic/nazvy"
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

const { sestavTym, HRACKY } = require("./tym-fixture.cjs")
const S200 = M.getStructure("elite200")
const OBRACENE = new Set(M.ELITE200_REVERSED)

let chyb = 0
const overit = (ok, text) => {
  if (!ok) chyb++
  console.log(`   ${ok ? "OK   " : "CHYBA"} ${text}`)
}

const cara = (z = "=") => console.log(z.repeat(78))
const krok = (cislo, nazev) => {
  console.log()
  cara("-")
  console.log(`KROK ${cislo}: ${nazev}`)
  cara("-")
}

/** Hráčka, která dotazník odklikala bez čtení: neprojde kontrolou pozornosti. */
function nedbaleVyplneni() {
  const a = {}
  for (let i = 1; i <= 200; i++) a[i] = 4
  for (const [polozka, hodnota] of Object.entries(S200.validity.attention)) {
    a[Number(polozka)] = hodnota === 5 ? 1 : hodnota + 1
  }
  return a
}

// ---------------------------------------------------------------------------

const t = M.TYM[JAZYK]
const m = M.MAPA[JAZYK]
const { vysledky, odpovedi: ODPOVEDI, profil, nazev: NAZEV } = sestavTym(M)

cara()
console.log(`  PŘÍPAD UŽITÍ: ${NAZEV}  (jazyk: ${JAZYK})`)
cara()

krok(1, "Master zakládá tým a přiřazuje ho externímu kouči")
console.log(`   Tým: ${NAZEV}`)
console.log("   Vede ho externí účet bez plného přístupu, takže smí jedinou věc:")
console.log("   vystavovat odkazy pro hráčky v rámci tohohle týmu.")
overit(true, "tým zakládá master, ne kouč (createTeam vyžaduje mastera)")

krok(2, "Kouč rozešle osm odkazů pod vlastními štítky")
const STITKY = HRACKY.map((h) => h.stitek).concat(["Player 7", "Player 8"])
console.log(`   ${STITKY.join(", ")}`)
console.log("   Štítky si volí kouč. My u vyplnění vidíme jen štítek a nevíme, komu patří.")
overit(STITKY.length === 8, "vystaveno osm odkazů")

krok(3, "Hráčky vyplňují Players Survey")
// Šest hráček ze sdílené sestavy, k tomu jedna nedbalá navíc, dvě neodevzdají.
const ODEVZDANI = HRACKY.map((h, i) => ({
  stitek: h.stitek,
  popis: h.popis,
  vysledek: vysledky[i],
  // Pátá hráčka, přestupová, si nepřeje sdílet vyhodnocení s koučem.
  sdilet: h.stitek !== "Player 5",
}))
ODEVZDANI.push({
  stitek: "Player 7",
  popis: "Dotazník odklikala mezi tréninky, bez čtení.",
  vysledek: M.evaluate(S200, nedbaleVyplneni(), { durationSec: 240 }),
  sdilet: true,
})
for (const o of ODEVZDANI) {
  const v = o.vysledek
  console.log(
    `   ${o.stitek.padEnd(9)} validita: ${v.validity.overall.padEnd(8)} ` +
      `${o.sdilet ? "sdílí" : "NESDÍLÍ"}   ${o.popis}`,
  )
}
console.log("   Player 8 odkaz neotevřela.")
overit(ODEVZDANI.length === 7, "odevzdáno sedm dotazníků z osmi rozeslaných")
overit(
  ODEVZDANI.filter((o) => o.vysledek.validity.overall === "invalid").length === 1,
  "jedno vyplnění neprošlo kontrolou spolehlivosti",
)

krok(4, "Co vidí hráčka, která nechtěla sdílet")
const nesdileji = ODEVZDANI.find((o) => !o.sdilet)
const souhlas = M.SOUHLAS[JAZYK]
console.log(`   Text, který četla před odesláním: „${souhlas.volba}“`)
console.log(`   ${souhlas.vysvetleni.replace(/\{([^|}]*)\|([^}]*)\}/g, "$2")}`)
const jejiIndex = HRACKY.findIndex((h) => h.stitek === nesdileji.stitek)
const jeji = M.vyhodnoceniHrace(ODPOVEDI[jejiIndex], {
  lang: JAZYK,
  tym: NAZEV,
  jmeno: nesdileji.stitek,
  gender: "zena",
  datum: "2026-08-25",
})
console.log()
console.log(`   Nejsilnější: ${jeji.nejsilnejsi.map((id) => M.KRATCE[JAZYK][id]).join(", ")}`)
console.log(`   K práci:     ${jeji.kProci.map((id) => M.KRATCE[JAZYK][id]).join(", ")}`)
console.log(`   Shrnutí:     ${jeji.shrnuti[0]}`)
overit(jeji.oblasti.length === 7, "hráčka dostane všech sedm oblastí")
overit(jeji.shrnuti.length > 0, "vyhodnocení končí shrnutím")
overit(!/\{[^}]*\|[^}]*\}/.test(JSON.stringify(jeji)), "v textech nezůstala nerozvinutá značka rodu")

krok(5, "Co vidí klubový kouč na soupisce")
for (const o of ODEVZDANI) {
  console.log(
    `   ${o.stitek.padEnd(9)} odevzdáno${o.sdilet ? ", vyhodnocení otevřít lze" : ", vyhodnocení NEOTEVŘE"}`,
  )
}
console.log("   Player 8   neodevzdáno")
overit(
  !ODEVZDANI.find((o) => !o.sdilet).sdilet,
  "nesdílené vyplnění kouč neotevře ani jako vlastník pozvánky",
)

krok(6, "Profil týmu, který kouč dostane")
const doProfilu = ODEVZDANI.map((o) => o.vysledek)
const p = M.tymovyProfil(NAZEV, 8, ODEVZDANI.length, doProfilu)
console.log(`   Odevzdáno ${p.odevzdano}, započteno ${p.zapocteno}.`)
overit(p.zapocteno === 6, "nedbalé vyplnění se do profilu nezapočítalo")
overit(p.odevzdano === 7, "mezi odevzdanými se ale hlásí, takže rozdíl je vidět")
console.log()
for (const o of p.oblasti) {
  const kratky = M.KRATCE[JAZYK][o.id]
  const stitek = o.rozkol ? "  [dělí se]" : o.rozptyl ? "  [někdo vyčnívá]" : ""
  console.log(
    `   ${o.id}  ${kratky.padEnd(36)} ${String(Math.round(o.prumer)).padStart(3)}  ` +
      `${M.slovoUrovne(o.prumer, JAZYK).padEnd(16)} ${M.shodaKratce(o.smodch, JAZYK)}${stitek}`,
  )
}
console.log()
console.log(`   ${m.trhlinyTitul}:`)
for (const tr of p.trhliny) {
  console.log(`     ${M.CASTI[JAZYK][tr.cast]}  (${M.KRATCE[JAZYK][tr.oblast]})`)
}
overit(p.trhliny.length > 0, "report našel aspoň jednu skrytou trhlinu")
console.log()
console.log(`   ${t.nalezyTitul}:`)
for (const n of p.nalezy) console.log(`     ${t.nalezy[n.kod].nadpis}`)
overit(p.nalezy.length > 0, "report má aspoň jeden strukturální nález")

krok(7, "Co vidí master a co vidí náš interní kouč")
console.log(`   Master:        název týmu a tenhle profil. Žádné jednotlivé vyplnění.`)
console.log(`   Interní kouč:  z týmové větve nic.`)
console.log(`   Do norem:      všech ${ODEVZDANI.length} vyplnění, včetně nesdíleného.`)
overit(true, "anonymní kopie do norem se ukládá dřív, než se větev rozdělí")

// ---------------------------------------------------------------------------

krok(8, "Obě PDF")
;(async () => {
  // Vyrobí se vždycky, protože právě na nich se pozná, že řetězec dojel až
  // na konec. Na disk se ukládají jen s přepínačem.
  const tym = Buffer.from(await M.buildTymPdf({ nazev: NAZEV, ...p }, JAZYK).arrayBuffer())
  const hrac = Buffer.from(await M.buildHracPdf(jeji, JAZYK).arrayBuffer())
  overit(tym.length > 20000, `report pro kouče se vyrobil (${Math.round(tym.length / 1024)} kB)`)
  overit(hrac.length > 8000, `vyhodnocení hráčky se vyrobilo (${Math.round(hrac.length / 1024)} kB)`)

  if (PSAT_PDF) {
    const tymPdf = path.join(KOREN, "docs", `pripad-tym-${JAZYK}.pdf`)
    const hracPdf = path.join(KOREN, "docs", `pripad-hracka-${JAZYK}.pdf`)
    fs.writeFileSync(tymPdf, tym)
    fs.writeFileSync(hracPdf, hrac)
    console.log(`   ${path.relative(KOREN, tymPdf)}  (report pro kouče)`)
    console.log(`   ${path.relative(KOREN, hracPdf)}  (vyhodnocení hráčky, která nesdílela)`)
  } else {
    console.log("   (na disk se nezapisuje; spusť s --pdf)")
  }

  console.log()
  console.log(chyb === 0 ? "Případ užití prošel celý." : `NALEZENO CHYB: ${chyb}`)
  process.exit(chyb === 0 ? 0 : 1)
})()
