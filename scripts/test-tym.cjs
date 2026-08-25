// Kontrola týmového vyhodnocení.
//
// Dvě věci naráz. Za prvé, jestli rozpoznávání vzorců opravdu najde to, co má:
// na uměle složených týmech se známou vlastností se ověřuje, že se ozve právě
// ten nález, který tam je, a neozve se nález, který tam není. Bez toho by se
// prahy daly nastavit tak, že se hlásí všechno nebo nic, a nikdo by si toho
// nevšiml, protože profil vždycky nějak vypadá.
//
// Za druhé úplnost textů. Týmová větev jede česky a anglicky; chybějící nebo
// jen zkopírovaný text by kouči vrátil prázdné místo tam, kde má být výklad.
//
// Spouští se `node scripts/test-tym.cjs`.

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

const vstup = path.join(KOREN, "scripts", ".tym-vstup.ts")
const vystup = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "tym-")), "tym.cjs")
fs.writeFileSync(
  vstup,
  `export { evaluate } from "../lib/diagnostic/scoring"
export { getStructure, ELITE200_FACETS, ELITE200_REVERSED } from "../lib/diagnostic/structure"
export { tymovyProfil } from "../lib/tym/agregace"
export { TYM } from "../lib/tym/obsah"
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

const S200 = M.getStructure("elite200")
const OBRACENE = new Set(M.ELITE200_REVERSED)

/**
 * Hráč, u kterého mají vybrané oblasti či fazety zadanou úroveň 1 až 5.
 *
 * Vyplňuje i položky validity tak, jak je vyplní člověk, který dotazník čte.
 * Bez toho by vznikl neplatný dotazník, ten se do profilu nezapočítá a testy
 * níž by měřily prázdný tým místo toho, co měřit mají.
 */
function hrac(zaklad, uprava = {}) {
  const a = {}
  for (const f of M.ELITE200_FACETS) {
    const uroven = uprava[f.id] ?? uprava[f.dimension] ?? zaklad
    for (const i of f.items) a[i] = OBRACENE.has(i) ? 6 - uroven : uroven
  }
  for (let i = 1; i <= 200; i++) if (a[i] === undefined) a[i] = 3
  return sPlatnouValiditou(a)
}

/** Doplní kontrolní položky tak, aby dotazník prošel kontrolou spolehlivosti. */
function sPlatnouValiditou(a) {
  for (const [polozka, hodnota] of Object.entries(S200.validity.attention)) {
    a[Number(polozka)] = hodnota
  }
  if (S200.validity.infrequency) {
    for (const i of S200.validity.infrequency.expectAgree) a[i] = 4
    for (const i of S200.validity.infrequency.expectDisagree) a[i] = 2
  }
  for (const i of S200.validity.honesty.items) a[i] = 2
  return a
}

/** Hráč, který dotazník odklikal bez čtení: neprojde kontrolou pozornosti. */
function nedbalyHrac(zaklad = 3) {
  const a = {}
  for (let i = 1; i <= 200; i++) a[i] = zaklad
  for (const [polozka, hodnota] of Object.entries(S200.validity.attention)) {
    a[Number(polozka)] = hodnota === 5 ? 1 : hodnota + 1
  }
  return a
}

const profil = (hraci) =>
  M.tymovyProfil("Zkouška", hraci.length, hraci.length, hraci.map((a) => M.evaluate(S200, a, { durationSec: 2400 })))

const kody = (p) => p.nalezy.map((n) => n.kod)

console.log("– rozpoznávání vzorců –")

const opakuj = (n, f) => Array.from({ length: n }, f)

{
  const p = profil(opakuj(12, () => hrac(4)))
  rekni(kody(p).includes("vyrovnany-zaklad"), "vyrovnaný silný tým se pozná jako vyrovnaný základ")
  rekni(kody(p).length === 1, "u vyrovnaného týmu se nehlásí nic dalšího")
  rekni(p.opory.length > 0 && p.priority.length === 0, "vyrovnaný tým má opory a žádné priority")
}
{
  const p = profil(opakuj(12, () => hrac(3, { B: 5, G1: 1 })))
  rekni(kody(p).includes("sebejista-ticha-satna"), "sebejistá a tichá kabina se pozná")
  rekni(!kody(p).includes("vyrovnany-zaklad"), "tichá kabina se nehlásí jako vyrovnaný základ")
}
{
  const p = profil([...opakuj(6, () => hrac(3, { D: 5 })), ...opakuj(6, () => hrac(3, { D: 1 }))])
  rekni(kody(p).includes("zlom-pod-tlakem"), "rozdělený tým se pozná jako zlomová linie")
  rekni(p.zlomy.includes("D"), "zlom je vidět v oblasti práce s tlakem")
}
{
  const p = profil(opakuj(12, () => hrac(3, { E: 5, F2: 1 })))
  rekni(kody(p).includes("trajektorie-vyhoreni"), "dřina bez regenerace se pozná")
}
{
  const p = profil(opakuj(12, () => hrac(2)))
  rekni(kody(p).length >= 3, "plošně slabý tým má víc nálezů")
  rekni(!kody(p).includes("vyrovnany-zaklad"), "plošně slabý tým není vyrovnaný základ")
  rekni(p.oblasti.every((o) => o.plosna), "u plošně slabého týmu je slabina označená jako plošná")
}
{
  const p = profil(opakuj(3, () => hrac(4)))
  rekni(p.maloDat, "u tří hráčů se hlásí, že je málo dat")
  const velky = profil(opakuj(12, () => hrac(4)))
  rekni(!velky.maloDat, "u dvanácti hráčů se to nehlásí")
}
{
  // Vysoká úroveň s velkým rozptylem nesmí projít jako opora: pod tlakem se
  // rozpadne a kouč by se opíral o něco, co ho neudrží.
  const p = profil([...opakuj(6, () => hrac(3, { A: 5 })), ...opakuj(6, () => hrac(3, { A: 1 }))])
  rekni(!p.opory.includes("A"), "rozkolísaná oblast se nevydává za oporu")
}

{
  // Jeden člověk daleko od zbytku není zlomová linie. Report u zlomů tvrdí,
  // že nejde o obvyklý rozptyl, ale o dvě skupiny s mezerou mezi sebou;
  // kdyby se sem dostal osamělý hráč, bylo by to tvrzení nepravdivé a kouč
  // by hledal dvě party tam, kde je jeden člověk, se kterým je třeba mluvit.
  const p = profil([...opakuj(5, () => hrac(3, { A: 5 })), hrac(3, { A: 1 })])
  const a = p.oblasti.find((x) => x.id === "A")
  rekni(a.rozptyl && !a.rozkol, "jeden hráč mimo se hlásí jako rozptyl, ne jako zlom")
  rekni(!p.zlomy.includes("A"), "osamělý hráč se nedostane mezi zlomové linie")
  rekni(!p.opory.includes("A"), "oblast s osamělým hráčem není opora")

  const deleny = profil([...opakuj(3, () => hrac(3, { A: 5 })), ...opakuj(3, () => hrac(3, { A: 1 }))])
  const da = deleny.oblasti.find((x) => x.id === "A")
  rekni(da.rozkol && !da.rozptyl, "skutečné dvě skupiny se hlásí jako zlom, ne jako rozptyl")
  rekni(deleny.zlomy.includes("A"), "skutečný zlom se dostane mezi zlomové linie")
}
{
  const p = profil([...opakuj(5, () => hrac(4)), hrac(4, { G: 1 })])
  rekni(
    !kody(p).includes("vyrovnany-zaklad"),
    "tým s jedním člověkem úplně mimo není vyrovnaný základ",
  )
}
{
  // Neplatné vyplnění se do profilu nepočítá. Kdyby se počítalo, stačilo by
  // pár lidí, kteří dotazník odklikali bez čtení, a kouč by dostal zlomovou
  // linii, která v týmu není, nebo by mu naopak skutečná zmizela v průměru.
  const platni = opakuj(12, () => hrac(4))
  const nedbali = opakuj(3, () => nedbalyHrac(1))
  const p = M.tymovyProfil(
    "Zkouška",
    15,
    15,
    [...platni, ...nedbali].map((a) => M.evaluate(S200, a, { durationSec: 2400 })),
  )
  rekni(p.zapocteno === 12, `neplatná vyplnění se nezapočítávají (započteno ${p.zapocteno} z 15)`)
  rekni(p.odevzdano === 15, "odevzdaná se hlásí všechna, aby byl rozdíl vidět")

  const cisty = profil(platni)
  const stejne = p.oblasti.every((o) => {
    const c = cisty.oblasti.find((x) => x.id === o.id)
    return c && Math.abs(o.prumer - c.prumer) < 0.001
  })
  rekni(stejne, "profil vyjde stejně, jako by nedbalá vyplnění vůbec nepřišla")
  rekni(!p.zlomy.length, "nedbalá vyplnění nevyrobí zlomovou linii")
}
{
  const p = M.tymovyProfil("Zkouška", 6, 6, opakuj(6, () => nedbalyHrac(3)).map((a) => M.evaluate(S200, a, { durationSec: 2400 })))
  rekni(p.zapocteno === 0, "tým samých neplatných vyplnění nemá co započítat")
  rekni(p.oblasti.length === 0 && p.nalezy.length === 0, "prázdný profil nevymyslí nálezy")
  rekni(p.maloDat, "prázdný profil hlásí, že je málo dat")
}

console.log("\n– texty česky a anglicky –")

const KODY = [
  "sebejista-ticha-satna", "trajektorie-vyhoreni", "nalada-podle-vysledku",
  "par-nese-naklad", "zlom-pod-tlakem", "pozornost-mizi-pod-tlakem",
  "tvrdi-na-sebe", "bez-opory", "krehka-identita", "vyrovnany-zaklad",
]
const OBLASTI = ["A", "B", "C", "D", "E", "F", "G"]
const CESKA_PISMENA = /[řěůŘĚŮ]/

for (const jazyk of ["cs", "en"]) {
  const t = M.TYM[jazyk]
  const chybi = KODY.filter((k) => !t.nalezy[k])
  rekni(!chybi.length, `${jazyk}: všech ${KODY.length} nálezů má text${chybi.length ? ` (chybí ${chybi.join(", ")})` : ""}`)
  const kratke = KODY.filter((k) => {
    const n = t.nalezy[k]
    return !n || n.coJeVidet.length < 80 || n.coToDela.length < 120 || n.coSTim.length < 3 || n.coNedelat.length < 60
  })
  rekni(!kratke.length, `${jazyk}: výklad není odbytý${kratke.length ? ` (${kratke.join(", ")})` : ""}`)
  rekni(OBLASTI.every((o) => t.oblasti[o]), `${jazyk}: všech sedm oblastí má název`)
}

{
  const shodne = KODY.filter((k) => M.TYM.cs.nalezy[k].nadpis === M.TYM.en.nalezy[k].nadpis)
  rekni(!shodne.length, `angličtina není opsaná čeština${shodne.length ? ` (${shodne.join(", ")})` : ""}`)
  const ceske = KODY.filter((k) => {
    const n = M.TYM.en.nalezy[k]
    return CESKA_PISMENA.test([n.nadpis, n.coJeVidet, n.coToDela, n.coNedelat, ...n.coSTim].join(" "))
  })
  rekni(!ceske.length, `anglické texty jsou bez ř, ě a ů${ceske.length ? ` (${ceske.join(", ")})` : ""}`)
}

{
  // Hláška o nezapočtených dotaznících se skládá z čísel, takže se v ní dá
  // snadno pokazit skloňování. Kouč by pak hned viděl, že text psal stroj.
  const cs = M.TYM.cs.nezapocteno
  rekni(cs(1, 11).includes("Jeden odevzdaný dotazník neprošel"), "cs: jeden nezapočtený dotazník se skloňuje")
  rekni(cs(3, 9).includes("3 odevzdané dotazníky neprošly"), "cs: dva až čtyři se skloňují")
  rekni(cs(7, 5).includes("7 odevzdaných dotazníků neprošlo"), "cs: pět a víc se skloňuje")
  rekni(cs(2, 1).includes("jednom dotazníku"), "cs: profil na jednom dotazníku se skloňuje")
  rekni(cs(2, 6).includes("6 dotaznících"), "cs: profil na více dotaznících se skloňuje")

  const en = M.TYM.en.nezapocteno
  rekni(en(1, 11).includes("One completed survey did not pass"), "en: jednotné číslo sedí")
  rekni(en(4, 11).includes("4 completed surveys did not pass"), "en: množné číslo sedí")
  rekni(!CESKA_PISMENA.test(en(3, 9)), "en: hláška je bez ř, ě a ů")
  rekni(M.TYM.cs.nezapoctenoTitul !== M.TYM.en.nezapoctenoTitul, "nadpis není v obou jazycích stejný")
}

console.log(chyb === 0 ? "\ntýmové vyhodnocení sedí" : `\nNALEZENO CHYB: ${chyb}`)
process.exit(chyb === 0 ? 0 : 1)
