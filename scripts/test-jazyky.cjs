// Kontrola jazyků napříč všemi typy testu.
//
// Slovenština se dá pokazit tiše. Chybějící překlad spadne podle
// lib/diagnostic/lang.ts na češtinu a nikdo si toho nevšimne, protože Slovák
// češtině rozumí – jenže klient si zaplatil slovenské vyhodnocení a dostal
// české. Přesně takhle měly čtyři testy ELITE roky slovenský dotazník
// a české vyhodnocení.
//
// Skript proto nekontroluje, jestli text „nějaký" je, ale jestli je opravdu
// slovenský a opravdu vlastní:
//
// 1) Dotazníky: každá položka každého testu má slovenské znění, které se liší
//    od českého a neobsahuje ř, ě ani ů.
// 2) Vyhodnocení ELITE: všech sedm dimenzí má slovensky název, podtitul, čtyři
//    pásma a u každé ze tří faset pásma i rozvoj, pro sport i business.
// 3) Rodových značek {mužský|ženský} nesmí být ve slovenštině méně než
//    v češtině. Kde chybí, dostane žena mužský tvar. Víc jich být smí:
//    slovenština skloňuje i tam, kde čeština vystačí s jedním tvarem
//    („jsi stabilní" versus „si stabilný/stabilná").
// 4) Značky musí být celé: obě větve neprázdné a navzájem různé.
// 5) Shrnutí pro klienta a rozhraní mají slovenskou větev, ne anglickou.
//
// Spouští se `node scripts/test-jazyky.cjs`.

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

/** Slovenština nemá ř, ě ani ů. Jediný výskyt znamená, že tam zůstala čeština. */
const CESKA_PISMENA = /[řěůŘĚŮ]/

/**
 * Česká slova, která se do slovenštiny protáhnou bez ř, ě a ů.
 *
 * Kontrola písmen sama nestačí. „Mnohem", „nabízí" nebo „strategie" projdou,
 * protože žádné z těch tří písmen neobsahují – a přesto je to čeština, které
 * si Slovák okamžitě všimne. Seznam vznikl z chyb, které se při překladu
 * skutečně staly, a patří do něj jen tvary, které ve slovenštině neexistují
 * nebo v ní znamenají něco jiného.
 */
/**
 * Písmena, která tvoří slovo.
 *
 * `\b` se tady použít nedá: v JavaScriptu se do třídy znaků slova počítá jen
 * ASCII, takže mezi „á" a „v" ve slově „vypadávajú" vidí hranici slova a vzor
 * „\bvypadá\b" chybně sedí. Hranice se proto skládají ručně z tohoto seznamu.
 */
const PISMENO = "a-zA-ZáäčďéěíĺľňóôöŕřšťúůýžÁÄČĎÉĚÍĹĽŇÓÔÖŔŘŠŤÚŮÝŽ"
/** Vzor, který sedí jen na celé slovo (respektuje diakritiku). */
const cele = (vzor) => new RegExp(`(?<![${PISMENO}])(?:${vzor})(?![${PISMENO}])`, "i")
/** Vzor, který sedí na začátek slova; koncovky se neřeší. */
const zacatek = (vzor) => new RegExp(`(?<![${PISMENO}])(?:${vzor})`, "i")

const CESKA_SLOVA = [
  [cele("mnohem"), "mnohem → podstatne, o mnoho"],
  [zacatek("nabíz"), "nabízí → ponúka"],
  [zacatek("slyš"), "slyšet → počuť"],
  [zacatek("zklidn"), "zklidnit → upokojiť"],
  [zacatek("vzpom"), "vzpomínka → spomienka"],
  [cele("pozde|pozdě"), "pozdě → neskoro"],
  [zacatek("najpozdej"), "najpozdejšie → najneskôr"],
  [zacatek("ztaž|ztíž"), "ztížený → sťažený"],
  [zacatek("neztrác"), "neztrácať → nestrácať"],
  [zacatek("zbytk"), "zbytky → zvyšky"],
  // „vypadávajú" je slovenské (vypadnúť ze hry), české je jen „vypadá" ve
  // významu vyzerá – proto celé slovo, ne začátek.
  [cele("vypadá|vypadat"), "vypadá → vyzerá"],
  // Slovenština má é jen v podstatném jméně: stratégia, ale strategický.
  [zacatek("strategi[aeiuí]"), "strategie → stratégia"],
  [zacatek("stratégick"), "stratégický → strategický (é jen v podstatném jméně)"],
  [cele("start|startom|starte|startu|startov"), "start → štart"],
  [zacatek("predstartov"), "předstartovní → predštartová"],
  [zacatek("hlíd"), "hlídat → dávať pozor, strážiť"],
  [zacatek("nadstandard"), "nadstandard → nadštandard"],
  [zacatek("rozjížd|rozjíd"), "rozjíždění → rozbiehanie"],
  [cele("beriaš"), "beriaš → berieš"],
  [zacatek("srovná"), "srovnat se → spamätať sa, vyrovnať sa"],
  [zacatek("stahuj"), "stahovat → stiahnuť"],
  // Pozor: „ostatní sa boja urobiť chybu" je správně (báť sa). Česky zůstalo
  // jen spojení „boja sami so sebou", kde má být „bojujú".
  [zacatek("boja\\s+sam"), "bojují sami se sebou → bojujú sami so sebou"],
  [cele("tiše"), "tiše → potichu"],
  [zacatek("hrútia|hroutí"), "hroutí se → rúcajú sa"],
  // „sadzba" je slovenské slovo, ale znamená tarifu. Sázka je stávka, a jen
  // v tomhle významu se tady o penězích a rizicích mluví.
  [zacatek("sadzb"), "sázka → stávka (sadzba je tarifa)"],
  [zacatek("složit"), "složitý → zložitý"],
]

/** Vrátí popisy českých slov nalezených v textu. */
function ceskaSlova(text) {
  const t = String(text)
  return CESKA_SLOVA.filter(([re]) => re.test(t)).map(([, popis]) => popis)
}
const ZNACKA = /\{([^{}|]*)\|([^{}|]*)\}/g
const pocetZnacek = (t) => (String(t).match(ZNACKA) || []).length

/**
 * Místa, kde je slovenština shodná s češtinou schválně.
 *
 * Existují věty, které se v obou jazycích píšou úplně stejně. Kdyby se kvůli
 * kontrole přeložily jinak, byla by to horší slovenština, ne lepší. Seznam je
 * krátký a nový přírůstek do něj patří jen po ověření slovníkem, ne proto,
 * že skript hlásí chybu.
 */
const SHODNE_ZAMERNE = new Set([
  // „Nikdy nemám pocit, že to stačilo." – všechna slova se píšou v obou jazycích stejně
  "vzorce-sport-individual/99",
  "vzorce-sport-tym/99",
  // „Hranice a asertivita" – obojí slovo je v obou jazycích totožné
  "G/facets/G2/name",
])

/** Projde rekurzivně strukturu a vrátí dvojice [cesta, přeložený řetězec]. */
function prelozene(uzel, cesta = "") {
  if (uzel === null || typeof uzel !== "object") return []
  const klice = Object.keys(uzel)
  if (klice.length && klice.every((k) => k === "cs" || k === "en" || k === "sk")) {
    return [[cesta, uzel]]
  }
  return Object.entries(uzel).flatMap(([k, v]) => prelozene(v, `${cesta}/${k}`))
}

// ---------------------------------------------------------------------------
// 1) dotazníky všech testů
// ---------------------------------------------------------------------------

console.log("– dotazníky –")

const ELITE = ["elite200-sport", "elite200-business", "elite100-sport", "elite100-business"]

for (const test of ELITE) {
  const soubor = path.join(KOREN, "lib/diagnostic/data/items", `${test}.json`)
  const d = JSON.parse(fs.readFileSync(soubor, "utf8"))
  const polozky = Object.entries(d)
  const bezSk = polozky.filter(([, v]) => !v.sk)
  const shodne = polozky.filter(([, v]) => v.sk && v.sk === v.cs)
  const ceske = polozky.filter(([, v]) => v.sk && CESKA_PISMENA.test(v.sk))
  rekni(polozky.length > 0, `${test}: ${polozky.length} položek`)
  rekni(!bezSk.length, `${test}: každá položka má slovenské znění${bezSk.length ? ` (chybí ${bezSk.length})` : ""}`)
  rekni(
    !shodne.length,
    `${test}: slovenština se liší od češtiny${shodne.length ? ` (shodných ${shodne.length}: ${shodne.slice(0, 3).map(([k]) => k).join(", ")})` : ""}`,
  )
  rekni(
    !ceske.length,
    `${test}: bez ř, ě a ů${ceske.length ? ` (${ceske.slice(0, 3).map(([k]) => k).join(", ")})` : ""}`,
  )
}

// Dotazníky vzorců a archetypů leží ve vlastních souborech pro každý jazyk,
// takže se kontroluje párování: stejné klíče a jiné znění.
const PAROVANE = [
  ["vzorce", "lib/vzorce/data/polozky.json", "lib/vzorce/data/polozky-sk.json"],
  [
    "vzorce-sport-individual",
    "lib/vzorce/data/polozky-sport-individual.json",
    "lib/vzorce/data/polozky-sport-individual-sk.json",
  ],
  ["vzorce-sport-tym", "lib/vzorce/data/polozky-sport-tym.json", "lib/vzorce/data/polozky-sport-tym-sk.json"],
  ["archetypy", "lib/archetypy/data/polozky.json", "lib/archetypy/data/polozky-sk.json"],
  ["archetypy-sport", "lib/archetypy/data/polozky-sport.json", "lib/archetypy/data/polozky-sport-sk.json"],
]

for (const [test, csPath, skPath] of PAROVANE) {
  const cs = JSON.parse(fs.readFileSync(path.join(KOREN, csPath), "utf8"))
  const sk = JSON.parse(fs.readFileSync(path.join(KOREN, skPath), "utf8"))
  const chybi = Object.keys(cs).filter((k) => !sk[k])
  const shodne = Object.keys(cs).filter((k) => sk[k] === cs[k] && !SHODNE_ZAMERNE.has(`${test}/${k}`))
  const ceske = Object.entries(sk).filter(([, v]) => CESKA_PISMENA.test(String(v)))
  const rozdilneZnacky = Object.keys(cs).filter(
    (k) => sk[k] && pocetZnacek(sk[k]) < pocetZnacek(cs[k]),
  )
  rekni(
    Object.keys(cs).length === Object.keys(sk).length && !chybi.length,
    `${test}: slovenský dotazník má všech ${Object.keys(cs).length} položek${chybi.length ? ` (chybí ${chybi.slice(0, 3).join(", ")})` : ""}`,
  )
  rekni(!shodne.length, `${test}: žádná položka nezůstala česky${shodne.length ? ` (${shodne.slice(0, 3).join(", ")})` : ""}`)
  rekni(!ceske.length, `${test}: bez ř, ě a ů${ceske.length ? ` (${ceske.slice(0, 3).map(([k]) => k).join(", ")})` : ""}`)
  rekni(
    !rozdilneZnacky.length,
    `${test}: rodových značek není méně než česky${rozdilneZnacky.length ? ` (${rozdilneZnacky.slice(0, 3).join(", ")})` : ""}`,
  )
}

// ---------------------------------------------------------------------------
// 2) vyhodnocení ELITE
// ---------------------------------------------------------------------------

console.log("\n– vyhodnocení ELITE –")

const DIMENZE = ["A", "B", "C", "D", "E", "F", "G"]
/** Kolik přeložených řetězců má mít soubor dimenze: viz komentář v hlavičce. */
const RETEZCU_V_DIMENZI = 44

for (const id of DIMENZE) {
  const d = JSON.parse(fs.readFileSync(path.join(KOREN, "lib/diagnostic/data/content", `${id}.json`), "utf8"))
  const r = prelozene(d)
  const bezSk = r.filter(([, o]) => !o.sk)
  const shodne = r.filter(([p, o]) => o.sk && o.sk === o.cs && !SHODNE_ZAMERNE.has(`${id}${p}`))
  const ceske = r.filter(([, o]) => o.sk && CESKA_PISMENA.test(o.sk))
  const jineZnacky = r.filter(([, o]) => o.sk && pocetZnacek(o.sk) < pocetZnacek(o.cs))

  rekni(r.length === RETEZCU_V_DIMENZI, `${id}: ${r.length} přeložených řetězců (čekáno ${RETEZCU_V_DIMENZI})`)
  rekni(
    !bezSk.length,
    `${id}: všechno má slovensky${bezSk.length ? ` (chybí ${bezSk.length}: ${bezSk.slice(0, 2).map(([p]) => p).join(", ")})` : ""}`,
  )
  rekni(
    !shodne.length,
    `${id}: slovenština není opsaná čeština${shodne.length ? ` (${shodne.slice(0, 2).map(([p]) => p).join(", ")})` : ""}`,
  )
  rekni(
    !ceske.length,
    `${id}: bez ř, ě a ů${ceske.length ? ` (${ceske.slice(0, 3).map(([p]) => p).join(", ")})` : ""}`,
  )
  rekni(
    !jineZnacky.length,
    `${id}: rodových značek není méně než česky${jineZnacky.length ? ` (${jineZnacky.slice(0, 3).map(([p]) => p).join(", ")})` : ""}`,
  )
  const cizi = r.flatMap(([p, o]) => ceskaSlova(o.sk ?? "").map((s) => `${p}: ${s}`))
  rekni(!cizi.length, `${id}: bez českých slov${cizi.length ? ` (${cizi.slice(0, 4).join("; ")})` : ""}`)

  // Každá dimenze musí mít podtitul i pásma pro obě varianty a tři fasety.
  const cesty = new Set(r.map(([p]) => p))
  const chybejici = []
  for (const v of ["sport", "business"]) {
    if (!cesty.has(`/tagline/${v}`)) chybejici.push(`/tagline/${v}`)
    for (const pasmo of ["priority", "stabilization", "strong", "elite"]) {
      if (!cesty.has(`/bands/${pasmo}/${v}`)) chybejici.push(`/bands/${pasmo}/${v}`)
    }
    for (const f of [1, 2, 3]) {
      if (!cesty.has(`/facets/${id}${f}/development/${v}`)) chybejici.push(`/facets/${id}${f}/development/${v}`)
      for (const pasmo of ["priority", "stabilization", "strong", "elite"]) {
        if (!cesty.has(`/facets/${id}${f}/bands/${pasmo}/${v}`)) {
          chybejici.push(`/facets/${id}${f}/bands/${pasmo}/${v}`)
        }
      }
    }
  }
  rekni(!chybejici.length, `${id}: stavba je celá${chybejici.length ? ` (chybí ${chybejici.slice(0, 3).join(", ")})` : ""}`)
}

// ---------------------------------------------------------------------------
// 3) celistvost rodových značek ve všech datech
// ---------------------------------------------------------------------------

console.log("\n– rodové značky –")

/** Nalezne značky, které jsou rozbité: prázdná větev nebo obě větve stejné. */
function rozbiteZnacky(text) {
  const spatne = []
  for (const m of String(text).matchAll(ZNACKA)) {
    const [cele, muz, zena] = m
    if (!muz.trim() || !zena.trim()) spatne.push(`prázdná větev ${cele}`)
    else if (muz === zena) spatne.push(`shodné větve ${cele}`)
  }
  return spatne
}

let rozbite = []
for (const id of DIMENZE) {
  const d = JSON.parse(fs.readFileSync(path.join(KOREN, "lib/diagnostic/data/content", `${id}.json`), "utf8"))
  for (const [cesta, o] of prelozene(d)) {
    for (const jazyk of ["cs", "sk"]) {
      for (const s of rozbiteZnacky(o[jazyk] ?? "")) rozbite.push(`${id}${cesta} [${jazyk}]: ${s}`)
    }
  }
}
rekni(
  !rozbite.length,
  `vyhodnocení ELITE: všechny značky celé${rozbite.length ? ` (${rozbite.slice(0, 3).join("; ")})` : ""}`,
)

rozbite = []
for (const test of ELITE) {
  const d = JSON.parse(fs.readFileSync(path.join(KOREN, "lib/diagnostic/data/items", `${test}.json`), "utf8"))
  for (const [cislo, o] of Object.entries(d)) {
    for (const jazyk of ["cs", "sk"]) {
      for (const s of rozbiteZnacky(o[jazyk] ?? "")) rozbite.push(`${test} ${cislo} [${jazyk}]: ${s}`)
    }
  }
}
rekni(
  !rozbite.length,
  `dotazníky ELITE: všechny značky celé${rozbite.length ? ` (${rozbite.slice(0, 3).join("; ")})` : ""}`,
)

// Angličtina rod neřeší, takže tam značka nemá co dělat: zůstala by v textu.
let anglickeZnacky = []
for (const id of DIMENZE) {
  const d = JSON.parse(fs.readFileSync(path.join(KOREN, "lib/diagnostic/data/content", `${id}.json`), "utf8"))
  for (const [cesta, o] of prelozene(d)) {
    if (pocetZnacek(o.en ?? "")) anglickeZnacky.push(`${id}${cesta}`)
  }
}
rekni(
  !anglickeZnacky.length,
  `angličtina je bez rodových značek${anglickeZnacky.length ? ` (${anglickeZnacky.slice(0, 3).join(", ")})` : ""}`,
)

// ---------------------------------------------------------------------------
// 4) shrnutí pro klienta a rozhraní
// ---------------------------------------------------------------------------

console.log("\n– shrnutí a rozhraní –")

function nactiModuly() {
  const esbuild = path.join(KOREN, "node_modules", ".bin", "esbuild")
  if (!fs.existsSync(esbuild)) {
    console.error("Chybí esbuild v node_modules. Spusť `npm install`.")
    process.exit(1)
  }
  const vstup = path.join(KOREN, "scripts", ".slovenstina-vstup.ts")
  const vystup = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "slovenstina-")), "data.cjs")
  fs.writeFileSync(
    vstup,
    `export { buildSummary, summaryHeading } from "../lib/diagnostic/summary"
export { UI, TEST_NAMES } from "../lib/diagnostic/i18n"
export { TEST_IDS } from "../lib/diagnostic/structure"
export { JAZYKY } from "../lib/diagnostic/lang"
export { obsahVzorce, popisDvojiceProJazyk } from "../lib/vzorce/content"
export { obsahArchetypu } from "../lib/archetypy/content"
export { MANUAL } from "../lib/diagnostic/manual"
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

// Nadpis shrnutí: slovenština nesmí spadnout na angličtinu ani na češtinu.
const nadpisy = Object.fromEntries(M.JAZYKY.map((l) => [l, M.summaryHeading(l, "male")]))
rekni(nadpisy.sk.title !== nadpisy.en.title, `nadpis shrnutí není anglicky (${nadpisy.sk.title})`)
rekni(nadpisy.sk.title !== nadpisy.cs.title, "nadpis shrnutí není česky")
rekni(!CESKA_PISMENA.test(nadpisy.sk.intro), "úvodní věta shrnutí je slovenská")

// Celé shrnutí na vymyšleném výsledku: musí být slovensky ve všech částech.
const vysledek = {
  complete: true,
  validity: { overall: "caution" },
  dimensions: [
    { id: "A", percent: 82, band: "elite", reported: true },
    { id: "B", percent: 71, band: "strong", reported: true },
    { id: "C", percent: 44, band: "stabilization", reported: true },
    { id: "D", percent: 31, band: "priority", reported: true },
  ],
}
const shrnutiSk = M.buildSummary(vysledek, "sk")
const shrnutiEn = M.buildSummary(vysledek, "en")
const shrnutiCs = M.buildSummary(vysledek, "cs")
for (const cast of ["overall", "strengths", "priorities", "caveat", "nextStep"]) {
  rekni(
    shrnutiSk[cast] && shrnutiSk[cast] !== shrnutiEn[cast] && shrnutiSk[cast] !== shrnutiCs[cast],
    `shrnutí – ${cast}: slovensky, ne anglicky ani česky`,
  )
  rekni(!CESKA_PISMENA.test(shrnutiSk[cast]), `shrnutí – ${cast}: bez ř, ě a ů`)
}

// Rozhraní: slovenština má všechny klíče jako čeština a nezůstala česká.
const klice = Object.keys(M.UI.cs)
const chybejiciKlice = klice.filter((k) => !(k in M.UI.sk))
rekni(!chybejiciKlice.length, `rozhraní: slovenština má všech ${klice.length} klíčů${chybejiciKlice.length ? ` (chybí ${chybejiciKlice.slice(0, 3).join(", ")})` : ""}`)
const ceskeUi = klice.filter((k) => typeof M.UI.sk[k] === "string" && CESKA_PISMENA.test(M.UI.sk[k]))
rekni(!ceskeUi.length, `rozhraní: bez ř, ě a ů${ceskeUi.length ? ` (${ceskeUi.slice(0, 3).join(", ")})` : ""}`)

// Čeština a slovenština si jsou blízké, takže shodných popisků je hodně
// a všechny jsou v pořádku: „Jazyk", „Heslo", „Pásmo", „Žena" se opravdu
// píšou stejně. Seznam je tu proto, aby nový popisek, který se přeložit
// zapomene, mezi nimi nezapadl.
const SHODNE_UI_SK = new Set([
  "brand", "chooseTitle", "language", "validityAttention", "validityStatusInvalid",
  "prioritiesTitle", "facetProfile", "band", "newTest", "personLabel",
  "coachPassword", "colTest", "colValidity", "invitesTitle", "newInvite",
  "inviteTest", "tabInvites", "genderFemale", "genderMale", "tabNorms", "tabManual",
])
const shodneUiSk = klice.filter(
  (k) => !SHODNE_UI_SK.has(k) && typeof M.UI.sk[k] === "string" && M.UI.sk[k] === M.UI.cs[k],
)
rekni(
  !shodneUiSk.length,
  `rozhraní: slovenština nezůstala česky${shodneUiSk.length ? ` (${shodneUiSk.slice(0, 5).join(", ")})` : ""}`,
)

// Rozhraní anglicky: stejný rozsah jako slovenské. Klient s anglickým
// odkazem vidí tyhle popisky u každé otázky, takže tichý pád na češtinu
// by se projevil přesně tak, jak to reklamoval klient.
const chybejiciEn = klice.filter((k) => !(k in M.UI.en))
rekni(!chybejiciEn.length, `rozhraní anglicky: má všech ${klice.length} klíčů${chybejiciEn.length ? ` (chybí ${chybejiciEn.slice(0, 3).join(", ")})` : ""}`)
const ceskeUiEn = klice.filter((k) => typeof M.UI.en[k] === "string" && CESKA_PISMENA.test(M.UI.en[k]))
rekni(!ceskeUiEn.length, `rozhraní anglicky: bez ř, ě a ů${ceskeUiEn.length ? ` (${ceskeUiEn.slice(0, 3).join(", ")})` : ""}`)
// Popisky, které se v obou jazycích píšou stejně: značka, název produktu
// a slova, která angličtina převzala beze změny. Jinde by shoda znamenala,
// že se anglický popisek nikdy nenapsal.
const SHODNE_UI_EN = new Set(["brand", "chooseTitle", "personLabel", "colTest", "inviteTest"])
const shodneUiEn = klice.filter(
  (k) =>
    !SHODNE_UI_EN.has(k) &&
    typeof M.UI.en[k] === "string" &&
    M.UI.en[k] === M.UI.cs[k],
)
rekni(
  !shodneUiEn.length,
  `rozhraní anglicky: nezůstalo česky${shodneUiEn.length ? ` (${shodneUiEn.slice(0, 5).join(", ")})` : ""}`,
)

// Názvy testů: každý test má slovenský název.
const bezNazvu = M.TEST_IDS.filter((t) => !M.TEST_NAMES[t]?.sk)
rekni(!bezNazvu.length, `názvy testů: všech ${M.TEST_IDS.length} má slovenský název${bezNazvu.length ? ` (chybí ${bezNazvu.join(", ")})` : ""}`)


// ---------------------------------------------------------------------------
// 5) angličtina
//
// Angličtina je od února hotová u všech devíti testů. Kontrola je tu proto,
// aby se nedala tiše ztratit: kdyby se některý anglický text vrátil na
// češtinu, klient by dostal dokument, kterému nerozumí, a build by mlčel.
// ---------------------------------------------------------------------------

console.log("\n– angličtina –")

// Dotazníky anglicky být musí všechny: bez nich se test nedá ani vyplnit.
for (const [test, csPath] of [
  ["vzorce", "lib/vzorce/data/polozky.json"],
  ["vzorce-sport-individual", "lib/vzorce/data/polozky-sport-individual.json"],
  ["vzorce-sport-tym", "lib/vzorce/data/polozky-sport-tym.json"],
  ["archetypy", "lib/archetypy/data/polozky.json"],
  ["archetypy-sport", "lib/archetypy/data/polozky-sport.json"],
]) {
  const cs = JSON.parse(fs.readFileSync(path.join(KOREN, csPath), "utf8"))
  const enPath = csPath.replace(/\.json$/, "-en.json")
  const en = JSON.parse(fs.readFileSync(path.join(KOREN, enPath), "utf8"))
  const chybi = Object.keys(cs).filter((k) => !en[k])
  const shodne = Object.keys(cs).filter((k) => en[k] === cs[k])
  // Rodová značka v angličtině by se vypsala i s závorkami: rod se tam neřeší.
  const seZnackou = Object.entries(en).filter(([, v]) => pocetZnacek(v) > 0)
  rekni(
    !chybi.length,
    `${test}: anglický dotazník má všech ${Object.keys(cs).length} položek${chybi.length ? ` (chybí ${chybi.slice(0, 3).join(", ")})` : ""}`,
  )
  rekni(!shodne.length, `${test}: žádná anglická položka nezůstala česky${shodne.length ? ` (${shodne.slice(0, 3).join(", ")})` : ""}`)
  rekni(
    !seZnackou.length,
    `${test}: angličtina bez rodových značek${seZnackou.length ? ` (${seZnackou.slice(0, 3).map(([k]) => k).join(", ")})` : ""}`,
  )
}

// Položky ELITE mají angličtinu ve stejném souboru jako češtinu.
for (const test of ELITE) {
  const d = JSON.parse(fs.readFileSync(path.join(KOREN, "lib/diagnostic/data/items", `${test}.json`), "utf8"))
  const bezEn = Object.entries(d).filter(([, v]) => !v.en)
  const shodne = Object.entries(d).filter(([, v]) => v.en && v.en === v.cs)
  rekni(!bezEn.length, `${test}: každá položka má anglické znění${bezEn.length ? ` (chybí ${bezEn.length})` : ""}`)
  rekni(!shodne.length, `${test}: anglické znění se liší od českého${shodne.length ? ` (${shodne.length})` : ""}`)
}

// Vyhodnocení ELITE anglicky.
for (const id of DIMENZE) {
  const d = JSON.parse(fs.readFileSync(path.join(KOREN, "lib/diagnostic/data/content", `${id}.json`), "utf8"))
  const r = prelozene(d)
  const bezEn = r.filter(([, o]) => !o.en)
  rekni(!bezEn.length, `${id}: vyhodnocení má anglicky všechno${bezEn.length ? ` (chybí ${bezEn.length})` : ""}`)
}

// Shrnutí pro klienta anglicky.
const shrnutiEnKontrola = M.buildSummary(vysledek, "en")
for (const cast of ["overall", "strengths", "priorities", "caveat", "nextStep"]) {
  rekni(
    shrnutiEnKontrola[cast] && shrnutiEnKontrola[cast] !== shrnutiCs[cast],
    `shrnutí – ${cast}: anglicky, ne česky`,
  )
}

// Výklad vzorců: všechny tři varianty, všech jedenáct vzorců, všechna pole.
const POLE_VZORCE = ["nazev", "tema", "motto", "prozitek", "podTlakem", "puvod"]
for (const varianta of ["obecna", "sport-individual", "sport-tym"]) {
  const shodne = []
  const ceske = []
  for (let i = 1; i <= 11; i++) {
    const id = String(i).padStart(2, "0")
    const en = M.obsahVzorce(id, "en", varianta)
    const cs = M.obsahVzorce(id, "cs", varianta)
    for (const pole of POLE_VZORCE) {
      if (en[pole] === cs[pole]) shodne.push(`${id}.${pole}`)
      if (CESKA_PISMENA.test(en[pole])) ceske.push(`${id}.${pole}`)
    }
    for (const pasmo of ["velmi-nizka", "nizka", "stredni", "vysoka", "dominantni"]) {
      if (en.pasma[pasmo] === cs.pasma[pasmo]) shodne.push(`${id}.pasma.${pasmo}`)
      if (CESKA_PISMENA.test(en.pasma[pasmo])) ceske.push(`${id}.pasma.${pasmo}`)
    }
  }
  rekni(!shodne.length, `vzorce ${varianta}: výklad je anglicky${shodne.length ? ` (česky zůstalo ${shodne.slice(0, 3).join(", ")})` : ""}`)
  rekni(!ceske.length, `vzorce ${varianta}: bez ř, ě a ů${ceske.length ? ` (${ceske.slice(0, 3).join(", ")})` : ""}`)
}

// Popisy dvojic: klíče se mezi jazyky nesmí rozejít, jinak zůstane kombinace
// bez výkladu a spadne na obecný popis přes domény.
const KLICE_DVOJIC = Object.keys(
  JSON.parse(
    JSON.stringify(
      require("fs")
        .readFileSync(path.join(KOREN, "lib/vzorce/data/dvojice.ts"), "utf8")
        .match(/^  "(\d\d-\d\d)":/gm)
        .reduce((o, r) => ((o[r.match(/\d\d-\d\d/)[0]] = 1), o), {}),
    ),
  ),
)
for (const varianta of ["obecna", "sport-individual", "sport-tym"]) {
  const chybi = KLICE_DVOJIC.filter((k) => !M.popisDvojiceProJazyk(k, "en", varianta))
  const shodne = KLICE_DVOJIC.filter(
    (k) => M.popisDvojiceProJazyk(k, "en", varianta) === M.popisDvojiceProJazyk(k, "cs", varianta),
  )
  rekni(
    !chybi.length,
    `dvojice ${varianta}: anglicky má všech ${KLICE_DVOJIC.length} dvojic${chybi.length ? ` (chybí ${chybi.slice(0, 3).join(", ")})` : ""}`,
  )
  rekni(!shodne.length, `dvojice ${varianta}: žádná nezůstala česky${shodne.length ? ` (${shodne.slice(0, 3).join(", ")})` : ""}`)
}

// Archetypy: obě varianty, všech dvanáct, včetně sportovních polí navíc.
const ARCHETYPY = ["nevinatko", "objevitel", "mudrc", "hrdina", "rebel", "mag",
  "jeden-z-nas", "milenec", "sprymar", "pecovatel", "tvurce", "vladce"]
const POLE_ARCH = ["motto", "touha", "strach", "dar", "podstata", "vPodnikani",
  "stin", "pasti", "priklady", "sekundarniRole"]
for (const varianta of ["business", "sport"]) {
  const shodne = []
  const ceske = []
  const chybi = []
  for (const id of ARCHETYPY) {
    const en = M.obsahArchetypu(id, "en", varianta)
    const cs = M.obsahArchetypu(id, "cs", varianta)
    if (!en) { chybi.push(id); continue }
    for (const pole of POLE_ARCH) {
      if (en[pole] === cs[pole]) shodne.push(`${id}.${pole}`)
      // Značky se nepřekládají, takže u příkladů se hlídá jen rodová značka.
      if (pole !== "priklady" && CESKA_PISMENA.test(en[pole] ?? "")) ceske.push(`${id}.${pole}`)
    }
    if (en.navod.length !== cs.navod.length) chybi.push(`${id}.navod (${en.navod.length} vs ${cs.navod.length})`)
    if (varianta === "sport") {
      for (const pole of ["prezdivka", "role", "sTrenerem", "znacka"]) {
        if (!en[pole]) chybi.push(`${id}.${pole}`)
        else if (en[pole] === cs[pole]) shodne.push(`${id}.${pole}`)
      }
    }
  }
  rekni(!chybi.length, `archetypy ${varianta}: anglicky mají všechna pole${chybi.length ? ` (chybí ${chybi.slice(0, 3).join(", ")})` : ""}`)
  rekni(!shodne.length, `archetypy ${varianta}: výklad je anglicky${shodne.length ? ` (česky zůstalo ${shodne.slice(0, 3).join(", ")})` : ""}`)
  rekni(!ceske.length, `archetypy ${varianta}: bez ř, ě a ů${ceske.length ? ` (${ceske.slice(0, 3).join(", ")})` : ""}`)
}

// ---------------------------------------------------------------------------
// 5) manuál pro kouče
// ---------------------------------------------------------------------------
//
// Manuál je nejmladší text v aplikaci a nejsnáz se zapomene. Prochází se celý
// strom textů, ne vyjmenovaná pole, takže nově přidaná věta spadne do kontroly
// sama a nedá se propašovat bez překladu.

console.log("\n– manuál pro kouče –")

/** Všechny řetězce ve stromu i s cestou, ať je v hlášce vidět, kde chybí. */
function retezce(uzel, cesta = "") {
  if (typeof uzel === "string") return [[cesta, uzel]]
  if (Array.isArray(uzel)) return uzel.flatMap((v, i) => retezce(v, `${cesta}[${i}]`))
  if (uzel && typeof uzel === "object") {
    return Object.entries(uzel).flatMap(([k, v]) => retezce(v, cesta ? `${cesta}.${k}` : k))
  }
  return []
}

// Shody, které jsou v pořádku: názvy produktu a slova, která se ve dvou
// jazycích píšou stejně. Cokoli mimo tenhle seznam znamená zapomenutý překlad.
const MANUAL_SHODNE = new Set([
  // názvy produktu a rolí
  "kapitoly[2].title", "kapitoly[5].title", "rodiny[0].nazev",
  // slova, která čeština a slovenština píšou stejně
  "obsah", "popiskyKaret.rozsah", "popiskyKaret.jazyky",
  "kapitoly[0].kicker", "kapitoly[1].kicker", "kapitoly[3].kicker",
  "kapitoly[4].title", "kapitoly[6].kicker", "kapitoly[6].title",
  "postup[0].lbl", "postup[1].lbl", "ch1Bloky[2].lbl",
  "rodinyHlavicka[0]", "rodiny[2].nazev", "eliteEval[2].lbl",
  "archetypyHlavicka[1]", "archEval[4].lbl",
  "tymBloky[6].lbl", "tymRole[0].lbl", "tymRole[1].lbl",
  "praktickeBloky[0].title", "praktickeBloky[2].polozky[0].lbl",
  "prehledHlavicka[0]", "prehledHlavicka[1]",
  // stejná i v angličtině
  "prostredi.sport",
])
const manualCs = retezce(M.MANUAL.cs)

// Mrtvá položka v seznamu je horší než chybějící: tiše propustí text, který
// se přeložit zapomnělo. Indexy se navíc posouvají, kdykoli do manuálu
// přibude kapitola nebo odrážka, takže se to stane snadno.
{
  const shodneKdekoli = new Set()
  for (const jazyk of ["sk", "en"]) {
    const jine = Object.fromEntries(retezce(M.MANUAL[jazyk]))
    for (const [cesta, cs] of manualCs) {
      if (jine[cesta] === cs && cs.trim() !== "") shodneKdekoli.add(cesta)
    }
  }
  const mrtve = [...MANUAL_SHODNE].filter((c) => !shodneKdekoli.has(c))
  rekni(!mrtve.length, `seznam povolených shod v manuálu je aktuální${mrtve.length ? ` (mrtvé: ${mrtve.join(", ")})` : ""}`)
}
for (const jazyk of ["sk", "en"]) {
  const jine = Object.fromEntries(retezce(M.MANUAL[jazyk]))
  const shodne = []
  const chybejici = []
  const ceske = []
  const znacky = []
  for (const [cesta, cs] of manualCs) {
    const text = jine[cesta]
    if (text === undefined) { chybejici.push(cesta); continue }
    if (text === cs && cs.trim() !== "" && !MANUAL_SHODNE.has(cesta)) shodne.push(cesta)
    if (CESKA_PISMENA.test(text)) ceske.push(cesta)
    if (jazyk === "en" && pocetZnacek(text)) znacky.push(cesta)
  }
  rekni(!chybejici.length, `manuál ${jazyk}: má všechny texty${chybejici.length ? ` (chybí ${chybejici.slice(0, 3).join(", ")})` : ""}`)
  rekni(!shodne.length, `manuál ${jazyk}: nezůstal česky${shodne.length ? ` (${shodne.slice(0, 4).join(", ")})` : ""}`)
  rekni(!ceske.length, `manuál ${jazyk}: bez ř, ě a ů${ceske.length ? ` (${ceske.slice(0, 3).join(", ")})` : ""}`)
  if (jazyk === "en") {
    rekni(!znacky.length, `manuál en: bez rodových značek${znacky.length ? ` (${znacky.slice(0, 3).join(", ")})` : ""}`)
  }
}

// Manuál oslovuje kouče, jehož rod aplikace nezná: rod se zadává u klienta.
// Minulý čas ve druhé osobě („poslal jsi") by kouče otypoval, takže tam nesmí
// být. Kontroluje se čeština, kde je „jsi" jednoznačné; slovenské „si" je
// zároveň zvratné zájmeno a od zájmena se auxiliár nerozezná. Oba jazyky se
// píšou společně, takže česká kontrola podchytí obojí.
{
  const rodove = retezce(M.MANUAL.cs)
    .filter(([, v]) => /\bjsi\s+\p{Ll}+l[aiy]?\b/u.test(v) || /\b\p{Ll}+l[aiy]?\s+jsi\b/u.test(v))
    .map(([c]) => c)
  rekni(!rodove.length, `manuál cs: neoslovuje kouče v rodě${rodove.length ? ` (${rodove.slice(0, 3).join(", ")})` : ""}`)
}

console.log(chyb === 0 ? "\njazyky sedí ve všech testech" : `\nNALEZENO CHYB: ${chyb}`)
process.exit(chyb === 0 ? 0 : 1)
