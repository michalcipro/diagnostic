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
export { VYKLAD } from "../lib/tym/vyklad"
export { RAMEC } from "../lib/tym/ramec"
export { sestavPlan, sestavShrnuti } from "../lib/tym/plan"
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
  const p = profil([...opakuj(6, () => hrac(4, { C: 5 })), ...opakuj(6, () => hrac(4, { C: 1 }))])
  rekni(kody(p).includes("zlom-v-pozornosti"), "rozdělená pozornost se pozná jako vlastní nález")
  rekni(p.zlomy.includes("C"), "zlom je vidět v oblasti pozornosti")
  rekni(!kody(p).includes("zlom-pod-tlakem"), "zlom v pozornosti se nehlásí jako zlom pod tlakem")
}
{
  // Když se tým dělí v pozornosti i pod tlakem, jde tlak první: bez něj se
  // rutiny pozornosti stejně nepoužijí.
  const p = profil([
    ...opakuj(6, () => hrac(4, { C: 5, D: 5 })),
    ...opakuj(6, () => hrac(4, { C: 1, D: 1 })),
  ])
  const k = kody(p)
  rekni(
    k.includes("zlom-pod-tlakem") && k.includes("zlom-v-pozornosti"),
    "při obou zlomech se hlásí oba nálezy",
  )
  rekni(
    k.indexOf("zlom-pod-tlakem") < k.indexOf("zlom-v-pozornosti"),
    "zlom pod tlakem je uvedený dřív než zlom v pozornosti",
  )
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
  "par-nese-naklad", "zlom-pod-tlakem", "zlom-v-pozornosti",
  "pozornost-mizi-pod-tlakem", "tvrdi-na-sebe", "bez-opory", "krehka-identita",
  "vyrovnany-zaklad",
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

console.log("\n– výklad oblastí –")

const UROVNE = ["nizka", "stredni", "vysoka"]
const TVARY = ["vyrovnana", "rozptyl", "zlom", "plosna"]
const ZNACKA_RODU = /\{[^{}]*\|[^{}]*\}/

for (const jazyk of ["cs", "en"]) {
  const v = M.VYKLAD[jazyk]
  const chybi = OBLASTI.filter((id) => !v[id])
  rekni(!chybi.length, `${jazyk}: všech sedm oblastí má výklad${chybi.length ? ` (chybí ${chybi.join(", ")})` : ""}`)

  const neuplne = OBLASTI.filter((id) => {
    const o = v[id]
    if (!o) return true
    if (!UROVNE.every((u) => o.uroven[u] && o.uroven[u].length > 80)) return true
    if (!TVARY.every((t2) => o.tvar[t2] && o.tvar[t2].length > 60)) return true
    return (
      o.coMeri.length < 60 ||
      o.procZalezi.length < 120 ||
      o.prace.length < 3 ||
      o.znaky.length < 2 ||
      o.otazky.length < 2
    )
  })
  rekni(!neuplne.length, `${jazyk}: výklad je úplný a není odbytý${neuplne.length ? ` (${neuplne.join(", ")})` : ""}`)

  // Týmový report se nepouští přes applyGender, protože kouč u otázky do
  // rozhovoru dopředu nezná pohlaví hráče. Značka by se vytiskla doslova.
  const sRodem = OBLASTI.filter((id) => {
    const o = v[id]
    if (!o) return false
    const vse = [o.coMeri, o.procZalezi, ...Object.values(o.uroven), ...Object.values(o.tvar), ...o.prace, ...o.znaky, ...o.otazky]
    return vse.some((x) => ZNACKA_RODU.test(x))
  })
  rekni(!sRodem.length, `${jazyk}: výklad je bez značek rodu${sRodem.length ? ` (${sRodem.join(", ")})` : ""}`)
}

{
  const opsane = OBLASTI.filter((id) => M.VYKLAD.cs[id].coMeri === M.VYKLAD.en[id].coMeri)
  rekni(!opsane.length, `anglický výklad není opsaná čeština${opsane.length ? ` (${opsane.join(", ")})` : ""}`)
  const ceske = OBLASTI.filter((id) => {
    const o = M.VYKLAD.en[id]
    const vse = [o.coMeri, o.procZalezi, ...Object.values(o.uroven), ...Object.values(o.tvar), ...o.prace, ...o.znaky, ...o.otazky]
    return vse.some((x) => CESKA_PISMENA.test(x))
  })
  rekni(!ceske.length, `anglický výklad je bez ř, ě a ů${ceske.length ? ` (${ceske.join(", ")})` : ""}`)
}

console.log("\n– rámec reportu –")

for (const jazyk of ["cs", "en"]) {
  const r = M.RAMEC[jazyk]
  const seznamy = { jakCistOdstavce: 3, coToNeni: 3, rozhovoryJak: 3, mantinely: 4 }
  const kratke = Object.entries(seznamy).filter(([klic, kolik]) => (r[klic] ?? []).length < kolik)
  rekni(!kratke.length, `${jazyk}: rámec má všechny seznamy${kratke.length ? ` (${kratke.map(([k]) => k).join(", ")})` : ""}`)
  rekni(r.fazeNazvy.length === 3 && r.fazeNazvy.every(Boolean), `${jazyk}: tři fáze plánu mají název`)
  rekni(Object.values(r.pasma).every((x) => x && x.length > 2), `${jazyk}: pásma mají název`)
  if (jazyk === "en") {
    const vse = [...r.jakCistOdstavce, ...r.coToNeni, ...r.rozhovoryJak, ...r.mantinely, ...r.fazeNazvy]
    rekni(!vse.some((x) => CESKA_PISMENA.test(x)), "en: rámec je bez ř, ě a ů")
  }
}
rekni(M.RAMEC.cs.shrnutiTitul !== M.RAMEC.en.shrnutiTitul, "rámec není v obou jazycích stejný")

console.log("\n– plán a shrnutí –")

{
  const p = profil([...opakuj(3, () => hrac(4, { D: 5 })), ...opakuj(3, () => hrac(4, { D: 1 }))])
  for (const jazyk of ["cs", "en"]) {
    const plan = M.sestavPlan(p, jazyk)
    rekni(plan.length === 3, `${jazyk}: plán má tři fáze (má ${plan.length})`)
    rekni(
      plan.every((f) => f.duvod && f.kroky.length >= 3 && f.znaky.length >= 2),
      `${jazyk}: každá fáze má důvod, kroky i ukazatele`,
    )
    rekni(plan[0].oblast === "D", `${jazyk}: první fáze řeší zlomovou linii (řeší ${plan[0].oblast})`)
    rekni(plan[1].oblast !== "D", `${jazyk}: druhá fáze už řeší něco jiného`)
    rekni(
      plan[0].odTydne === 1 && plan[2].doTydne === 12,
      `${jazyk}: plán pokrývá dvanáct týdnů`,
    )
    const shrnuti = M.sestavShrnuti(p, jazyk)
    rekni(shrnuti.krehke.length > 0 && shrnuti.prvniKrok.length > 40, `${jazyk}: shrnutí není prázdné`)
  }
}
{
  // Když se tým dělí ve dvou oblastech, plán začne u té nižší, ne u té,
  // která je dřív v abecedě.
  const p = profil([
    ...opakuj(3, () => hrac(4, { C: 5, D: 4 })),
    ...opakuj(3, () => hrac(4, { C: 3, D: 1 })),
  ])
  const plan = M.sestavPlan(p, "cs")
  const prumery = new Map(p.oblasti.map((o) => [o.id, o.prumer]))
  const nejnizsiZlom = [...p.zlomy].sort((a, b) => prumery.get(a) - prumery.get(b))[0]
  rekni(p.zlomy.length >= 2, `v testu jsou aspoň dva zlomy (je ${p.zlomy.length})`)
  rekni(
    plan[0].oblast === nejnizsiZlom,
    `plán začne u nejnižšího zlomu (${nejnizsiZlom}, začal u ${plan[0].oblast})`,
  )
}
{
  // Vyrovnaný tým nemá zlom ani plošnou slabinu; plán se přesto musí sestavit.
  const p = profil(opakuj(8, () => hrac(4)))
  const plan = M.sestavPlan(p, "cs")
  rekni(plan.length === 3, "i u vyrovnaného týmu se plán sestaví")
  rekni(plan[0].oblast !== plan[1].oblast, "první dvě fáze neřeší tutéž oblast")
  const shrnuti = M.sestavShrnuti(p, "cs")
  rekni(shrnuti.drzi.length > 0, "vyrovnaný tým má v shrnutí o co se opřít")
}
{
  // Prázdný profil nesmí shodit plán ani shrnutí.
  const p = M.tymovyProfil("Prázdný", 3, 3, [])
  rekni(M.sestavPlan(p, "cs").length === 0, "prázdný profil nevyrobí plán")
  const shrnuti = M.sestavShrnuti(p, "cs")
  rekni(shrnuti.drzi.length === 1 && shrnuti.krehke.length === 1, "prázdný profil má náhradní texty")
}

console.log(chyb === 0 ? "\ntýmové vyhodnocení sedí" : `\nNALEZENO CHYB: ${chyb}`)
process.exit(chyb === 0 ? 0 : 1)
