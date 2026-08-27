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
 *
 * Poslední dvě položky jsou zvláštní případ. Koučovské akce nad hesly
 * klientů běží v Node prostředí, kde na databázi nedosáhnou, takže kouče
 * ověřit samy nemůžou: dělá to za ně vnitřní mutace, kterou zavolají. Volání
 * té mutace se proto počítá jako stráž a že ta mutace opravdu ověřuje kouče
 * i pilotní bránu, se kontroluje zvlášť níž. Bez obojího by tahle výjimka
 * byla jen dírou s komentářem.
 */
const STRAZE = [
  "requireCoach",
  "vyzadujMastera",
  "filtrViditelnosti",
  "whoAmI",
  "requireClient",
  "overPristupKDenikum",
  "plannerAuthInternal.zalozKlientaSHeslem",
  "plannerAuthInternal.pripravResetHesla",
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
  "sessions.setCoachPouzeTymy",
  "sessions.pristupovyLog",
  "auth.addCoach",
  "eliteDiagnostic.normStats",
  "eliteDiagnostic.normExport",
  "eliteDiagnostic.externalUsage",
  "teams.createTeam",
  "teams.setTeamCoach",
  "teams.setTeamActive",
  "teams.listTeams",
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
//
// Brána je jedna jediná, v plannerPilot.ts. Kdyby si každý soubor držel
// vlastní kopii, přepnula by se jednou jedna a na druhou by se zapomnělo.
{
  const pilot = fs.readFileSync(path.join(KOREN, "plannerPilot.ts"), "utf8")
  rekni(
    /function overPristupKDenikum[\s\S]{0,200}vyzadujMastera/.test(pilot),
    "pilotní brána deníku vyžaduje mastera",
  )

  for (const soubor of ["plannerCoach.ts", "plannerCoachRead.ts"]) {
    const zdroj = fs.readFileSync(path.join(KOREN, soubor), "utf8")
    rekni(
      !/const PILOTNI_REZIM/.test(zdroj),
      `${soubor} nemá vlastní kopii pilotní konstanty`,
    )
    const re = /export const (\w+) = (query|mutation|action)\(/g
    let m
    while ((m = re.exec(zdroj))) {
      const jmeno = m[1]
      // Pozvánku načítá klient bez účtu, ten žádnou roli nemá.
      if (jmeno === "getPlannerInvite") continue
      const dalsi = zdroj.indexOf("\nexport const ", re.lastIndex)
      const telo = zdroj.slice(m.index, dalsi === -1 ? zdroj.length : dalsi)
      rekni(
        telo.includes("overPristupKDenikum(kouc)"),
        `${soubor.replace(".ts", "")}.${jmeno} projde pilotní bránou`,
      )
    }
  }

  // Koučovské akce nad hesly klientů běží v Node a stráž mají uvnitř
  // vnitřních mutací, protože akce na databázi nedosáhne.
  const vnitrni = fs.readFileSync(path.join(KOREN, "plannerAuthInternal.ts"), "utf8")
  for (const jmeno of ["zalozKlientaSHeslem", "pripravResetHesla"]) {
    const od = vnitrni.indexOf(`export const ${jmeno} =`)
    rekni(od !== -1, `plannerAuthInternal.${jmeno} existuje`)
    if (od === -1) continue
    const dalsi = vnitrni.indexOf("\nexport const ", od + 10)
    const telo = vnitrni.slice(od, dalsi === -1 ? vnitrni.length : dalsi)
    rekni(
      telo.includes("requireCoachProZapis") && telo.includes("overPristupKDenikum(kouc)"),
      `plannerAuthInternal.${jmeno} ověří kouče i pilotní bránu`,
    )
  }
}

// ---------------------------------------------------------------------------
// Deník: volné texty jdou ke kouči jedinou cestou
// ---------------------------------------------------------------------------
//
// Kolik z deníku kouč uvidí, se řídí úrovní sdílení u klienta. Čísla a návyky
// se pouštějí na úrovni `cisla`, volné texty teprve na `vse`. Tohle je to
// místo, kde se to dá pokazit tiše: stačí přidat pole do návratové hodnoty
// a texty vytečou o úroveň níž, aniž by to někdo poznal.
//
// Proto se hlídá dvojí. Za prvé, že správa klientů v plannerCoach.ts se
// deníkových tabulek nedotkne vůbec. Za druhé, že v plannerCoachRead.ts
// projde každé čtení textu podmínkou `sTexty`.
{
  const sprava = fs.readFileSync(path.join(KOREN, "plannerCoach.ts"), "utf8")
  for (const tabulka of ["plannerDays", "plannerWeeks", "plannerHabits"]) {
    rekni(!sprava.includes(tabulka), `plannerCoach nesahá na tabulku ${tabulka}`)
  }

  const cteni = fs.readFileSync(path.join(KOREN, "plannerCoachRead.ts"), "utf8")

  // Pole s volným textem. `notes` je poznámka k týdnu, `schedule` rozvrh dne
  // a `reflection` tři otázky na konci dne.
  const TEXTOVA_POLE = ["schedule", "reflection", "notes"]
  for (const pole of TEXTOVA_POLE) {
    // Čtení textu z dokumentu: `d.schedule`, `t.notes` a podobně.
    const re = new RegExp(`\\b[a-z]\\.${pole}\\b`, "g")
    const radky = cteni.split("\n")
    let nalezeno = 0
    let hlidano = 0
    for (const radek of radky) {
      const zasahy = radek.match(re)
      if (!zasahy) continue
      nalezeno += zasahy.length
      if (radek.includes("sTexty ?")) hlidano += zasahy.length
    }
    rekni(nalezeno > 0, `plannerCoachRead vrací pole ${pole}`)
    rekni(
      nalezeno === hlidano,
      `plannerCoachRead čte ${pole} jedině pod podmínkou sTexty (nehlídaných: ${nalezeno - hlidano})`,
    )
  }

  // Seznam hlídaných polí je psaný ručně, takže by o nově přidaném textu
  // nevěděl. Proti tomu stojí kontrola úplnosti: výstup dne i týdne smí mít
  // přesně tyhle klíče. Kdo přidá další, musí sem sáhnout a rozhodnout, jestli
  // je to text, nebo číslo. Bez toho by nové pole tiše proteklo na nižší
  // úroveň a všechno ostatní by dál svítilo zeleně.
  const klice = (jmeno) => {
    const od = cteni.indexOf(`function ${jmeno}(`)
    if (od === -1) return null
    const konec = cteni.indexOf("\n}", od)
    const telo = cteni.slice(od, konec === -1 ? cteni.length : konec)
    return (telo.match(/^\s{4}(\w+):/gm) ?? []).map((x) => x.trim().replace(":", ""))
  }
  const denKlice = klice("naVystup")
  const tydenKlice = klice("tydenNaVystup")
  rekni(
    denKlice !== null &&
      denKlice.join(",") === "date,schedule,reflection,ratings,habits,updatedAt",
    `výstup dne pro kouče má očekávané klíče (má: ${denKlice?.join(",")})`,
  )
  rekni(
    tydenKlice !== null && tydenKlice.join(",") === "monday,notes",
    `výstup týdne pro kouče má očekávané klíče (má: ${tydenKlice?.join(",")})`,
  )

  // Podmínka smí vzniknout jediným způsobem, a to z úrovně `vse`.
  const prirazeni = cteni.match(/const sTexty = [^\n]*/g) ?? []
  rekni(prirazeni.length === 1, "plannerCoachRead určuje sTexty na jednom místě")
  rekni(
    prirazeni.length === 1 && prirazeni[0].includes('uroven === "vse"'),
    "plannerCoachRead pouští texty jen na úrovni vse",
  )

  // Úroveň `nic` nesmí načíst ani jeden den: co se nenačte, nemůže uniknout.
  const detail = cteni.slice(cteni.indexOf("export const plannerClientDetail"))
  const konecVetve = detail.indexOf("await zaznamenejPristup")
  const predVetvi = detail.slice(0, konecVetve === -1 ? detail.length : konecVetve)
  rekni(
    !predVetvi.includes('.query("plannerDays"'),
    "plannerCoachRead na úrovni nic vůbec nenačte dny",
  )
  rekni(
    /if \(uroven === "nic"\)/.test(predVetvi),
    "plannerCoachRead končí u úrovně nic dřív, než se čte deník",
  )

  // Nahlédnutí do deníku musí nechat stopu, stejně jako otevření výsledku.
  rekni(
    cteni.includes('zaznamenejPristup(ctx, kouc._id, "otevreni-deniku")'),
    "plannerCoachRead zapisuje nahlédnutí do přístupového logu",
  )
}

// ---------------------------------------------------------------------------
// Deník: klient ví, co z něj kouč vidí
// ---------------------------------------------------------------------------
//
// Dohled, o kterém člověk neví, by z deníku udělal hlášení. Úroveň sdílení
// proto musí chodit i klientovi, ne jen kouči, a rozhraní ji musí ukázat.
{
  const klient = fs.readFileSync(path.join(KOREN, "planner.ts"), "utf8")
  const me = klient.slice(klient.indexOf("export const me = query"))
  const konec = me.indexOf("\nexport const ")
  const telo = konec === -1 ? me : me.slice(0, konec)
  rekni(telo.includes("sdileni:"), "planner.me vrací klientovi úroveň sdílení")

  const ucet = fs.readFileSync(
    path.join(KOREN, "..", "components", "planner", "account-panel.tsx"),
    "utf8",
  )
  rekni(ucet.includes("sdileniNadpis"), "účet klienta ukazuje, co z deníku vidí kouč")
}

const neprosle = POUZE_MASTER.filter((k) => !nalezenoMaster.has(k))
rekni(
  !neprosle.length,
  `seznam funkcí jen pro mastera je aktuální${chibiText(neprosle)}`,
)

console.log(chyb === 0 ? "\nvše v pořádku" : `\nNALEZENO CHYB: ${chyb}`)
process.exit(chyb === 0 ? 0 : 1)
