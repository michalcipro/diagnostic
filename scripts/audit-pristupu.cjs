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
}

/** Výrazy, které se považují za stráž. */
const STRAZE = ["requireCoach", "vyzadujMastera", "odmitniExterniho", "filtrViditelnosti", "whoAmI"]

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

console.log(chyb === 0 ? "\nvše v pořádku" : `\nNALEZENO CHYB: ${chyb}`)
process.exit(chyb === 0 ? 0 : 1)
