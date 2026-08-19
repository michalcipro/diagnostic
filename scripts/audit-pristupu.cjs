// Statická kontrola přístupových pravidel v Convexu.
//
// Hlídá dvě věci, na kterých se dá tiše prohrát:
//
// 1) Každá veřejná funkce musí mít stráž. Convex vystavuje query, mutation
//    i action na veřejném API, takže funkce bez kontroly relace je díra bez
//    ohledu na to, co dělá rozhraní v prohlížeči.
//
// 2) Každý validátor role musí znát všechny role. Convex ověřuje i návratovou
//    hodnotu; chybějící varianta se neprojeví při zápisu, ale až při čtení,
//    takže se účet založí a teprve přihlášení spadne. Přesně tohle se stalo
//    externím koučům.
//
// Spouští se `node scripts/audit-pristupu.cjs`.

const fs = require("fs")
const path = require("path")

const KOREN = path.join(__dirname, "..", "convex")

/** Funkce, které jsou veřejné záměrně, i s důvodem. */
const ZAMERNE_VEREJNE = {
  "eliteDiagnostic.getInvite":
    "respondent musí načíst svůj test podle tokenu z odkazu, který dostal",
  "eliteDiagnostic.submitWithInvite":
    "respondent odesílá dotazník bez účtu, oprávnění nese jednorázový token",
  "sessions.setupStatus": "zakládací stránka se ptá, jestli už master existuje; nevrací data",
  "auth.createMaster": "zakládá první účet, chrání ho zakládací token",
  "auth.login": "přihlášení samo o sobě",
  "sessions.logout":
    "maže relaci podle jejího vlastního tokenu; kdo token má, může se rovnou přihlásit, takže odhlášení nic nepřidává",
  "plannerAuth.login": "přihlášení do deníku samo o sobě",
  "plannerAuth.activate":
    "klient si zakládá deník na jednorázový odkaz od kouče; oprávnění nese token, účet ještě neexistuje",
  "plannerCoach.getPlannerInvite":
    "klient musí načíst svou pozvánku podle tokenu z odkazu, který dostal",
  "planner.logout": "totéž co sessions.logout, jen pro relaci deníku",
}

/**
 * Výrazy, které se považují za stráž.
 *
 * Deník má vlastní účty i vlastní relace, takže i vlastní stráž: klienta
 * pouští dovnitř requireClient, ne requireCoach. Kdyby tu requireClient
 * nebyl, hlásil by audit všechny funkce deníku jako díru a přestalo by se
 * na něj koukat, což je horší než kdyby nekontroloval nic.
 */
const STRAZE = [
  "requireCoach",
  "vyzadujMastera",
  "filtrViditelnosti",
  "whoAmI",
  "requireClient",
  "overPristup",
]

/**
 * Funkce, do kterých smí výhradně master.
 *
 * Kontrola „má nějakou stráž" tuhle skupinu nepodchytí: normStats dřív
 * odmítalo jen externího kouče, takže náš vlastní kouč viděl, jak velký je
 * normativní vzorek, a mohl si ho celý stáhnout. Stráž tam byla, jen slabší,
 * než se čekalo. Proto se u téhle skupiny ověřuje jmenovitě `vyzadujMastera`.
 *
 * Co sem patří: správa účtů, přístupový log, podklady k fakturaci a všechno
 * kolem normativního vzorku. To poslední je know-how; kdo ví, jak je vzorek
 * zatím malý, snadno usoudí, že testy nestojí za nic.
 */
const POUZE_MASTER = [
  "sessions.listCoaches",
  "sessions.setCoachActive",
  "sessions.pristupovyLog",
  "auth.addCoach",
  "eliteDiagnostic.normStats",
  "eliteDiagnostic.normExport",
  "eliteDiagnostic.externalUsage",
]

/** Funkce, u kterých se během průchodu potvrdilo, že mastera vyžadují. */
const nalezenoMaster = new Set()

const ROLE = ["master", "coach", "external"]

let chyb = 0
const rekni = (ok, text) => {
  if (!ok) chyb++
  console.log(`${ok ? "OK   " : "CHYBA"} ${text}`)
}

for (const soubor of fs.readdirSync(KOREN).filter((f) => f.endsWith(".ts"))) {
  const modul = soubor.replace(/\.ts$/, "")
  const zdroj = fs.readFileSync(path.join(KOREN, soubor), "utf8")

  // ---- 1) stráže u veřejných funkcí ----
  const re = /export const (\w+) = (query|mutation|action|internalQuery|internalMutation|internalAction)\(/g
  let m
  while ((m = re.exec(zdroj))) {
    const [, jmeno, druh] = m
    if (druh.startsWith("internal")) continue
    const klic = `${modul}.${jmeno}`

    // tělo funkce: od místa nálezu po další export nebo konec souboru
    const dalsi = zdroj.indexOf("\nexport const ", re.lastIndex)
    const telo = zdroj.slice(m.index, dalsi === -1 ? zdroj.length : dalsi)

    const maStraz = STRAZE.some((s) => telo.includes(s))
    if (POUZE_MASTER.includes(klic)) {
      const jenMaster = telo.includes("vyzadujMastera") || telo.includes('role !== "master"')
      rekni(jenMaster, `${klic} pouští dovnitř jen mastera`)
      if (jenMaster) nalezenoMaster.add(klic)
    }
    if (ZAMERNE_VEREJNE[klic]) {
      rekni(!maStraz || klic === "auth.login", `${klic} je veřejná záměrně (${ZAMERNE_VEREJNE[klic]})`)
    } else {
      rekni(maStraz, `${klic} má kontrolu přihlášení`)
    }
  }

  // ---- 2) úplnost validátorů role ----
  const reRole = /v\.union\(\s*((?:v\.literal\("(?:master|coach|external)"\),?\s*)+)\)/g
  let r
  let poradi = 0
  while ((r = reRole.exec(zdroj))) {
    poradi++
    // Některé validátory jsou neúplné schválně, třeba argument addCoach, který
    // nesmí pustit "master". Označí se komentářem v předchozích řádcích.
    const pred = zdroj.slice(Math.max(0, r.index - 260), r.index)
    if (pred.includes("audit-role-neuplny")) {
      console.log(`OK    ${modul}: validátor role #${poradi} je neúplný záměrně`)
      continue
    }
    const uvnitr = r[1]
    const chybi = ROLE.filter((role) => !uvnitr.includes(`"${role}"`))
    rekni(
      chybi.length === 0,
      `${modul}: validátor role #${poradi} zná všechny role${chibiText(chybi)}`,
    )
  }
}

function chibiText(chybi) {
  return chybi.length ? ` (chybí: ${chybi.join(", ")})` : ""
}

// ---------------------------------------------------------------------------
// Druhý master nesmí vzniknout přes addCoach
// ---------------------------------------------------------------------------
//
// Kdo zakládá kouče, mohl by si založit i druhého mastera a tím obejít
// všechno ostatní. Validátor argumentu proto "master" neobsahuje a tahle
// kontrola hlídá, že to tak zůstane.
{
  const auth = fs.readFileSync(path.join(KOREN, "auth.ts"), "utf8")
  const zac = auth.indexOf("export const addCoach")
  const telo = auth.slice(zac, auth.indexOf("\nexport const ", zac + 10))
  const roleArg = /role:\s*v\.optional\(\s*v\.union\(([^)]*(?:\)[^)]*)*?)\)\s*\)/.exec(telo)
  rekni(!!roleArg, "auth.addCoach má validátor role")
  rekni(!!roleArg && !roleArg[1].includes('v.literal("master")'), "auth.addCoach neumí založit dalšího mastera")
}

// ---------------------------------------------------------------------------
// Do normativního vzorku padá každé odeslané vyplnění
// ---------------------------------------------------------------------------
//
// Kdyby se zápis dostal do podmínky, přestala by část vyplnění do vzorku
// chodit a nikdo by si toho nevšiml: normy by se počítaly z toho, co zbylo.
// Kontroluje se, že zápis stojí přímo v těle funkce, ne uvnitř bloku.
{
  const elite = fs.readFileSync(path.join(KOREN, "eliteDiagnostic.ts"), "utf8")
  const zac = elite.indexOf("export const submitWithInvite")
  const telo = elite.slice(zac, elite.indexOf("\nexport const ", zac + 10))
  const zapis = /^(\s*)await ctx\.db\.insert\("normSamples"/m.exec(telo)
  rekni(!!zapis, "submitWithInvite ukládá anonymní kopii do normSamples")
  rekni(!!zapis && zapis[1].length === 4, "zápis do normSamples není schovaný v podmínce")
}

// ---------------------------------------------------------------------------
// Deník: koučovské funkce projdou pilotní bránou
// ---------------------------------------------------------------------------
//
// Dokud je plánovač v pilotním provozu, smí s deníky pracovat jen master.
// Hlídá se, že brána stojí u každé koučovské funkce a že opravdu vyžaduje
// mastera. Až se pilot vypne, zůstane brána na místě a změní se jen to, co
// dělá uvnitř; kontrola proto míří na volání, ne na roli.
{
  const zdroj = fs.readFileSync(path.join(KOREN, "plannerCoach.ts"), "utf8")
  rekni(
    /function overPristup[\s\S]{0,200}vyzadujMastera/.test(zdroj),
    "pilotní brána deníku vyžaduje mastera",
  )
  const re = /export const (\w+) = (query|mutation|action)\(/g
  let m
  while ((m = re.exec(zdroj))) {
    const jmeno = m[1]
    // Pozvánku načítá klient bez účtu, ten žádnou roli nemá.
    if (jmeno === "getPlannerInvite") continue
    const dalsi = zdroj.indexOf("\nexport const ", re.lastIndex)
    const telo = zdroj.slice(m.index, dalsi === -1 ? zdroj.length : dalsi)
    rekni(telo.includes("overPristup(kouc)"), `plannerCoach.${jmeno} projde pilotní bránou`)
  }
}

// ---------------------------------------------------------------------------
// Deník: kouč do obsahu nevidí
// ---------------------------------------------------------------------------
//
// Nejde o oprávnění, ale o povahu věci. Deník je osobní zápisník, ne dotazník,
// jehož výsledek se s koučem probírá. Kdyby do něj kouč viděl, přestal by být
// tím, čím má být, a lidé by si do něj přestali psát pravdu. Proto se hlídá,
// že koučovská část se tabulek se zápisky vůbec nedotkne.
{
  const zdroj = fs.readFileSync(path.join(KOREN, "plannerCoach.ts"), "utf8")
  for (const tabulka of ["plannerDays", "plannerWeeks", "plannerHabits"]) {
    rekni(!zdroj.includes(tabulka), `plannerCoach nesahá na tabulku ${tabulka}`)
  }
}

const neprosle = POUZE_MASTER.filter((k) => !nalezenoMaster.has(k))
rekni(
  !neprosle.length,
  `seznam funkcí jen pro mastera je aktuální${chibiText(neprosle)}`,
)

console.log(chyb === 0 ? "\nvše v pořádku" : `\nNALEZENO CHYB: ${chyb}`)
process.exit(chyb === 0 ? 0 : 1)
