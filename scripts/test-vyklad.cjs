// Kontrola výkladu: aby text ve vyhodnocení neodporoval číslům vedle něj.
//
// Výpočty skóre hlídají jiné skripty. Tady jde o vrstvu nad nimi, která
// z čísel skládá věty: shrnutí ELITE, situační vzorce, shody u archetypů,
// typ v profilu 360 a týmový report. Každý případ odpovídá chybě, kterou
// našel audit vyhodnocení, a selhal by na kódu před opravou.
//
// Spouští se `node scripts/test-vyklad.cjs`.

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
const sekce = (nazev) => console.log(`\n– ${nazev} –`)

const esbuild = path.join(KOREN, "node_modules", ".bin", "esbuild")
if (!fs.existsSync(esbuild)) {
  console.error("Chybí esbuild v node_modules. Spusť `npm install`.")
  process.exit(1)
}

const vstup = path.join(KOREN, "scripts", ".vyklad-vstup.ts")
const vystup = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "vyklad-")), "vyklad.cjs")
fs.writeFileSync(
  vstup,
  `export { buildSummary } from "../lib/diagnostic/summary"
export { vyhodnot as vyhodnotVzorce } from "../lib/vzorce/scoring"
export { propoj } from "../lib/vzorce/vazby"
export { VZORCE } from "../lib/vzorce/structure"
export { buildVzorcePdf } from "../lib/vzorce/pdf"
export { vyhodnotArchetypy } from "../lib/archetypy/scoring"
export { spojArchetypy } from "../lib/archetypy/kombinace"
export { ARCHETYPY } from "../lib/archetypy/structure"
export { obsahArchetypu } from "../lib/archetypy/content"
export { vyhodnot as vyhodnotProfil360, BEZ_TYPU } from "../lib/profil360/profil"
export { SKALY as SKALY_360 } from "../lib/profil360/klic"
export { buildProfil360Pdf } from "../lib/profil360/pdf"
export { vyhodnoceniHrace } from "../convex/vyhodnoceniHrace"
export { HRAC } from "../lib/tym/hrac"
export { getStructure } from "../lib/diagnostic/structure"
export { evaluate } from "../lib/diagnostic/scoring"
export { profilProKouce } from "../lib/tym/soukromi"
export { tymovyProfil } from "../lib/tym/agregace"
export { sestavPlan, potrebujePraci } from "../lib/tym/plan"
export { urovenTymu, SD_ROZDILNE } from "../lib/tym/prahy"
export { vetaOblasti, shodaKratce, duvodTrhliny, MAPA } from "../lib/tym/slova"
export { RAMEC } from "../lib/tym/ramec"
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

// ---------------------------------------------------------------------------
// ELITE: shrnutí profilu
// ---------------------------------------------------------------------------

sekce("ELITE shrnutí")

const PASMO = (p) => (p < 31.25 ? "priority" : p < 61.5 ? "stabilization" : p < 82.3 ? "strong" : "elite")
const vysledek = (procenta) => ({
  dimensions: Object.entries(procenta).map(([id, percent]) => ({
    id,
    reported: percent !== null,
    percent: percent ?? 0,
    band: percent === null ? "priority" : PASMO(percent),
  })),
  validity: { overall: "ok" },
  complete: true,
})
const shrnuti = (procenta, lang = "cs") => M.buildSummary(vysledek(procenta), lang)

{
  // Šest silných dimenzí a jedna v rozvojové prioritě: dřív „nejsou propady".
  const s = shrnuti({ A: 75, B: 75, C: 75, D: 75, E: 75, F: 25, G: 75 })
  rekni(s.overall.startsWith("Profil je výrazně nevyrovnaný"), "šest silných a jedna priorita je nevyrovnaný profil")
  rekni(!s.overall.includes("nejsou propady"), "u dimenze v prioritě shrnutí netvrdí, že nejsou propady")
}
{
  // Žádná silná dimenze, velké rozpětí: dřív „jasné přednosti".
  const s = shrnuti({ A: 25, B: 25, C: 25, D: 58, E: 58, F: 58, G: 58 })
  rekni(s.overall.startsWith("Profil je výrazně nevyrovnaný"), "velké rozpětí bez silných je nevyrovnaný profil")
  rekni(!s.overall.includes("přednost"), "bez silné dimenze shrnutí nemluví o přednostech")
  for (const lang of ["sk", "en"]) {
    const t = shrnuti({ A: 25, B: 25, C: 25, D: 58, E: 58, F: 58, G: 58 }, lang).overall
    rekni(!/prednost|clear strengths/.test(t), `totéž v jazyce ${lang}`)
  }
}
{
  const s = shrnuti({ A: 75, B: 75, C: 75, D: 75, E: 75, F: 55, G: 75 })
  rekni(s.overall.startsWith("Celkově jde o velmi vyrovnaný"), "šest silných a jedna stabilizace je vyrovnaný profil")
}
{
  const s = shrnuti({ A: 70, B: 50, C: 50, D: 45, E: 50, F: 55, G: 60 })
  rekni(s.overall.startsWith("Profil je vyvážený"), "běžný profil je vyvážený")
}
{
  const s = shrnuti({ A: 50, B: 45, C: 40, D: 45, E: 50, F: 55, G: 50 })
  rekni(s.overall.startsWith("Profil ukazuje, že základ"), "bez silných a s malým rozpětím je to základ bez spolehlivosti")
}
{
  // Jedna vykázaná dimenze: dřív „velmi vyrovnaný a silný" a táž dimenze
  // zároveň jako silná i slabá stránka.
  const s = shrnuti({ A: 75, B: null, C: null, D: null, E: null, F: null, G: null })
  rekni(s.overall.startsWith("Dotazník nebyl vyplněn"), "z jedné dimenze se tvar profilu nepopisuje")
  rekni(s.strengths === "" && s.priorities === "", "z jedné dimenze nejsou silné ani slabé stránky")
}

// ---------------------------------------------------------------------------
// Vzorce: situačně aktivované a propojení
// ---------------------------------------------------------------------------

sekce("vzorce")

/** Odpovědi, kde má každý vzorec svých deset hodnot; chybějící vzorec se nevyplní. */
const odpovediVzorcu = (hodnotyPodleVzorce) => {
  const o = {}
  for (const v of M.VZORCE) {
    const h = hodnotyPodleVzorce[v.id]
    if (h === undefined) continue
    v.polozky.forEach((p, i) => (o[p] = Array.isArray(h) ? h[i] : h))
  }
  return o
}
const vsechnyVzorce = (vychozi, zmeny = {}) =>
  Object.fromEntries(M.VZORCE.map((v) => [v.id, zmeny[v.id] ?? vychozi]))

{
  // Tři dominantní vzorce a čtvrtý na 55 z 60 se sedmi silnými odpověďmi:
  // dřív se objevil mezi situačními s textem, že se neaktivuje trvale.
  const ids = M.VZORCE.map((v) => v.id)
  const v = M.vyhodnotVzorce(
    odpovediVzorcu(
      vsechnyVzorce(2, {
        [ids[0]]: 6,
        [ids[1]]: 6,
        [ids[2]]: 6,
        [ids[3]]: [6, 6, 6, 6, 6, 5, 5, 5, 5, 5],
        [ids[4]]: [5, 5, 5, 2, 2, 2, 2, 2, 2, 2],
      }),
    ),
  )
  const ctvrty = v.vsechny.find((x) => x.id === ids[3])
  rekni(ctvrty.pasmo === "dominantni", "čtvrtý vzorec je dominantní")
  rekni(!v.situacni.some((x) => x.id === ids[3]), "dominantní vzorec mimo trojici není mezi situačními")
  rekni(v.situacni.some((x) => x.id === ids[4]), "nízký vzorec se třemi silnými odpověďmi mezi situačními zůstává")
  rekni(
    v.situacni.every((x) => x.pasmo !== "vysoka" && x.pasmo !== "dominantni"),
    "mezi situačními není žádný vysoký ani dominantní vzorec",
  )
  const vse6 = M.vyhodnotVzorce(odpovediVzorcu(vsechnyVzorce(6)))
  rekni(vse6.situacni.length === 0, "když jsou všechny vzorce dominantní, situační seznam je prázdný")
}
{
  // Jen dva vykazatelné vzorce ze stejné oblasti: dřív pád propoj() i PDF.
  const prvni = M.VZORCE[0]
  const druhy = M.VZORCE.find((v) => v.id !== prvni.id && v.domena === prvni.domena)
  const odp = odpovediVzorcu({ [prvni.id]: 5, [druhy.id]: 5 })
  const v = M.vyhodnotVzorce(odp)
  let sp = null
  let chyba = null
  try {
    sp = M.propoj(v, "cs", "obecna")
  } catch (e) {
    chyba = e
  }
  rekni(!chyba && sp !== null, "dva vzorce z jedné oblasti propojení nespadnou")
  rekni(sp && sp.domeny === "", "u dvou vzorců se nepíše věta o trojici oblastí")
  let pdfChyba = null
  try {
    M.buildVzorcePdf({
      testId: "vzorce",
      person: { name: "Test", fillDate: "2026-01-01", gender: "female" },
      answers: odp,
      lang: "cs",
      proKlienta: true,
    })
  } catch (e) {
    pdfChyba = e
  }
  rekni(!pdfChyba, `PDF dvou vzorců z jedné oblasti nespadne${pdfChyba ? ` (${pdfChyba.message})` : ""}`)
  const jeden = M.vyhodnotVzorce(odpovediVzorcu({ [prvni.id]: 5 }))
  const sp1 = M.propoj(jeden, "cs", "obecna")
  rekni(sp1 && !/tři|tří/.test(sp1.domeny), "u jednoho vzorce se nepíše o třech vzorcích")
}

// ---------------------------------------------------------------------------
// Archetypy: shody a plochý profil
// ---------------------------------------------------------------------------

sekce("archetypy")

/** Odpovědi podle archetypu: číslo pro všech osm položek, nebo pole osmi. */
const odpovediArchetypu = (podleId, vychozi) => {
  const o = {}
  for (const a of M.ARCHETYPY) {
    const h = podleId[a.id] ?? vychozi
    if (h === undefined) continue
    a.polozky.forEach((p, i) => (o[p] = Array.isArray(h) ? h[i] : h))
  }
  return o
}
const nazevA = (id, lang = "cs") => M.obsahArchetypu(id, lang, "sport").nazev
const ARCH = M.ARCHETYPY.map((a) => a.id)

{
  // Všechny odpovědi 4: dřív primární Neviňátko a potlačený Vládce.
  const v = M.vyhodnotArchetypy(odpovediArchetypu({}, 4))
  rekni(v.vyhraneni === "plochy", "všude stejná odpověď dá plochý profil")
  for (const lang of ["cs", "sk", "en"])
    for (const varianta of ["sport", "business"]) {
      const sp = M.spojArchetypy(v, lang, varianta)
      const prvni = M.obsahArchetypu(v.primarni.id, lang, varianta).nazev
      const posledni = M.obsahArchetypu(v.potlaceny.id, lang, varianta).nazev
      rekni(
        !sp.souhrn.includes(prvni) && !sp.potlaceny.includes(posledni),
        `plochý profil nejmenuje první ani poslední archetyp (${lang}, ${varianta})`,
      )
    }
}
{
  // Tři archetypy se shodně nejnižším skóre, jinak zřetelný profil.
  const v = M.vyhodnotArchetypy(
    odpovediArchetypu({ [ARCH[0]]: 6, [ARCH[1]]: 5, [ARCH[9]]: 2, [ARCH[10]]: 2, [ARCH[11]]: 2 }, 4),
  )
  const sp = M.spojArchetypy(v, "cs", "sport")
  rekni(v.naKonci.length === 3, "tři archetypy se shodně nejnižším skóre se nesou dál")
  rekni(
    [ARCH[9], ARCH[10], ARCH[11]].every((id) => sp.potlaceny.includes(nazevA(id))),
    "text o slepém místě jmenuje všechny tři shodné archetypy",
  )
  rekni(sp.souhrn.includes("slepými místy"), "shrnutí mluví o slepých místech v množném čísle")
}
{
  // Pět archetypů na posledním místě: žádné jedno slepé místo.
  const v = M.vyhodnotArchetypy(
    odpovediArchetypu({ [ARCH[0]]: 6, [ARCH[1]]: 5, [ARCH[2]]: 5, [ARCH[3]]: 5 }, 3),
  )
  const sp = M.spojArchetypy(v, "cs", "business")
  rekni(v.naKonci.length >= 4, "víc archetypů na konci se nese dál")
  rekni(sp.potlaceny.includes("Jedno slepé místo z toho určit nejde"), "u mnoha shodných se slepé místo nejmenuje")
  rekni(!sp.souhrn.includes("slep"), "shrnutí pak slepé místo nezmiňuje")
}
{
  // Dva archetypy se shodně nejvyšším skóre.
  const v = M.vyhodnotArchetypy(odpovediArchetypu({ [ARCH[4]]: 6, [ARCH[7]]: 6, [ARCH[11]]: 1 }, 3))
  const sp = M.spojArchetypy(v, "cs", "sport")
  rekni(v.naCele.length === 2 && v.odstup === 0, "dva archetypy se shodně nejvyšším skóre")
  rekni(!sp.vyhraneni.includes("0 bod") && sp.vyhraneni.includes("stejné skóre"), "shoda na čele se popisuje jako stejné skóre")
  rekni(
    sp.souhrn.includes(nazevA(ARCH[4])) && sp.souhrn.includes(nazevA(ARCH[7])) && !sp.souhrn.includes("nejblíž k archetypu"),
    "shrnutí jmenuje oba vedoucí archetypy a netvrdí, že jeden je blíž",
  )
  const en = M.spojArchetypy(v, "en", "sport")
  rekni(!en.vyhraneni.includes("0 points"), "anglicky shoda také bez „0 points“")
}
{
  // Odstup jednoho bodu: v angličtině „separates".
  const odp = odpovediArchetypu({ [ARCH[4]]: 6, [ARCH[7]]: [6, 6, 6, 6, 6, 6, 6, 5], [ARCH[11]]: 1 }, 3)
  const v = M.vyhodnotArchetypy(odp)
  rekni(v.odstup === 1, "odstup prvních dvou je jeden bod")
  rekni(M.spojArchetypy(v, "en", "business").vyhraneni.startsWith("Only 1 point separates"), "anglicky „1 point separates“")
  rekni(M.spojArchetypy(v, "cs", "business").vyhraneni.includes("jen 1 bod,"), "česky „jen 1 bod“")
}
{
  // Nevykázaný archetyp nesmí srazit průměr motivační skupiny.
  const odp = odpovediArchetypu({}, 5)
  const vladce = M.ARCHETYPY.find((a) => a.id === "vladce") ?? M.ARCHETYPY[M.ARCHETYPY.length - 1]
  for (const p of vladce.polozky) delete odp[p]
  const v = M.vyhodnotArchetypy(odp)
  const skupina = vladce.motivace
  rekni(v.motivace[skupina] === 80, `skupina bez nevykázaného archetypu má 80 %, ne ${v.motivace[skupina]}`)
}

// ---------------------------------------------------------------------------
// Profil 360: stres mimo oblasti a typ sportovce
// ---------------------------------------------------------------------------

sekce("profil 360")

/**
 * Odpovědi s danou hodnotou škál 0–100 (krok 25). Výchozí hodnota platí pro
 * všechny škály IPIP, `skaly` ji pro jednotlivé škály přepíše. DASS se
 * zadává zvlášť 0–3.
 */
const odpovedi360 = (vychozi, skaly = {}, dass = 0) => {
  const naOdpoved = (cil, obracena) => {
    const x = 1 + cil / 25
    return obracena ? 6 - x : x
  }
  const o = {}
  for (const s of M.SKALY_360) {
    if (s.kod === "DASS.stress") {
      for (const p of s.polozky) o[p] = dass
      continue
    }
    const cil = skaly[s.kod] ?? vychozi
    for (const p of s.polozky) o[p] = naOdpoved(cil, s.obracene.includes(p))
  }
  // kontrolní položky odpovídají správně
  o[62] = 4
  o[56] = 1
  o[197] = 1
  o[54] = 1
  return o
}
const oblast = (p, id) => p.oblasti.find((o) => o.id === id).hodnota

{
  // Stres za poslední týden nesmí hýbat oblastmi návrat a energie.
  const klid = M.vyhodnotProfil360(odpovedi360(50, {}, 0))
  const zatez = M.vyhodnotProfil360(odpovedi360(50, {}, 3))
  rekni(
    oblast(klid, "navrat") === oblast(zatez, "navrat") && oblast(klid, "energie") === oblast(zatez, "energie"),
    "stres nemění oblasti návrat po nezdaru a energie",
  )
  rekni(oblast(klid, "navrat") === 50 && oblast(klid, "energie") === 50, "neutrální sportovec má návrat i energii na středu")
}
{
  // Neutrální sportovec s nízkou spoluprací: dřív „Týmový tmel" a „Samotář".
  const p = M.vyhodnotProfil360(odpovedi360(50, { "V.citizenship-teamwork": 25 }))
  rekni(p.rizika.some((r) => r.id === "samotar"), "nízká spolupráce hlásí riziko Samotář")
  rekni(!p.typ || p.typ.hlavni.id !== "tmel", "Samotář nedostane typ Týmový tmel")
  rekni(p.typ === null, "neutrální profil typ nepojmenovává")
}
{
  // Sportovec silný v týmových oblastech, ale s nízkou spoluprací.
  const vysoko = {}
  for (const s of M.SKALY_360) if (s.kod !== "DASS.stress") vysoko[s.kod] = 75
  for (const k of ["N1", "N2", "N3", "N4", "N5", "N6", "bis-anxiety"]) vysoko[k] = 25
  const silny = M.vyhodnotProfil360(odpovedi360(75, vysoko))
  rekni(silny.typ !== null, "silný profil typ má")
  const bezTymu = M.vyhodnotProfil360(odpovedi360(75, { ...vysoko, "V.citizenship-teamwork": 25 }))
  rekni(bezTymu.rizika.some((r) => r.id === "samotar"), "silný profil s nízkou spoluprací hlásí Samotáře")
  rekni(!bezTymu.typ || bezTymu.typ.hlavni.id !== "tmel", "ani silný profil se Samotářem není Týmový tmel")
  rekni(
    !bezTymu.typ || !bezTymu.typ.vedlejsi || bezTymu.typ.vedlejsi.id !== "tmel",
    "Týmový tmel není ani vedlejší typ",
  )
}
{
  // Nízký profil všude: typ se nejmenuje a PDF se postaví s náhradní větou.
  const nizko = {}
  for (const s of M.SKALY_360) if (s.kod !== "DASS.stress") nizko[s.kod] = 25
  for (const k of ["N1", "N2", "N3", "N4", "N5", "N6", "bis-anxiety"]) nizko[k] = 75
  const odp = odpovedi360(25, nizko, 1)
  const p = M.vyhodnotProfil360(odp)
  rekni(p.typ === null, "nízký profil typ nepojmenovává")
  let chybaPdf = null
  try {
    M.buildProfil360Pdf({ person: { name: "Test", fillDate: "2026-01-01", gender: "female" }, answers: odp, proKlienta: true })
  } catch (e) {
    chybaPdf = e
  }
  rekni(!chybaPdf, `PDF bez typu se postaví${chybaPdf ? ` (${chybaPdf.message})` : ""}`)
}

// ---------------------------------------------------------------------------
// Hráč v týmové větvi: vlastní vyhodnocení
// ---------------------------------------------------------------------------

sekce("hráč v týmu")

/**
 * Odpovědi ELITE 200 s cílovou hodnotou po rekódování pro každou dimenzi.
 * Kontrolní položky odpovídají tak, jak mají.
 */
const odpovediElite = (cilPodleDimenze, vychozi = 4) => {
  const st = M.getStructure("elite200")
  const o = {}
  // Cíl může být i neceločíselný (3,5 = půlka položek 3, půlka 4); rozkládá se
  // postupně, aby průměr dimenze seděl.
  const soucet = {}
  for (const f of st.facets) {
    const cil = cilPodleDimenze[f.dimension] ?? vychozi
    for (const p of f.items) {
      const pred = soucet[f.dimension] ?? 0
      soucet[f.dimension] = pred + cil
      const h = Math.round(soucet[f.dimension]) - Math.round(pred)
      o[p] = st.reversedItems.includes(p) ? 6 - h : h
    }
  }
  for (const [p, h] of Object.entries(st.validity.attention)) o[p] = h
  for (const p of st.validity.infrequency?.expectAgree ?? []) o[p] = 4
  for (const p of st.validity.infrequency?.expectDisagree ?? []) o[p] = 2
  for (const p of st.validity.honesty.items) o[p] = 3
  for (const par of st.validity.consistency.pairs) {
    if (o[par.b] !== undefined) continue
    o[par.b] = par.type === "agree" ? o[par.a] ?? 3 : 6 - (o[par.a] ?? 3)
  }
  for (let i = 1; i <= st.itemCount; i++) if (o[i] === undefined) o[i] = 3
  return o
}

{
  const odp = odpovediElite({ D: 1, A: 3 })
  const h = M.vyhodnoceniHrace(odp, { lang: "cs", tym: "Test", jmeno: "Hráčka", gender: "female", datum: "2026-01-01" })
  const d = h.oblasti.find((x) => x.id === "D")
  rekni(d.percent === 0, "dimenze se všemi odpověďmi na nejhorším konci má 0 %")
  rekni(h.kProci[0] === "D", "oblast s 0 % je první v tom, kde je prostor")
  const text = JSON.stringify(h)
  rekni(!text.includes("jakýá") && text.includes("jaká jsi"), "hráčka čte „jaká jsi“, ne „jakýá“")
  rekni(!/[{}|]/.test(h.shrnuti.join(" ")), "ve shrnutí hráče nezůstala značka rodu")
  const muz = M.vyhodnoceniHrace(odp, { lang: "cs", tym: "Test", jmeno: "Hráč", gender: "male", datum: "2026-01-01" })
  rekni(muz.shrnuti.join(" ").includes("jaký jsi"), "hráč čte „jaký jsi“")
  rekni(!h.shrnuti[1].includes(" je v "), "shrnutí neskloňuje název oblasti chybně („je v koncentrace“)")
}
for (const lang of ["cs", "en"]) {
  rekni(!/[{}|]/.test(M.HRAC[lang].hotovoPopis), `obrazovka po odeslání nemá nerozvinutou značku rodu (${lang})`)
}

// ---------------------------------------------------------------------------
// ELITE: pásma podle norem a relativní slabiny
// ---------------------------------------------------------------------------

sekce("ELITE normy")

{
  const S = M.getStructure("elite200")
  // Typický klient odpovídá v průměru kolem 3,7. S pevnými hranicemi (silné od
  // 3,46) vyšel silně ve všech sedmi oblastech; vůči normě ne.
  const typicky = M.evaluate(S, odpovediElite({}, 3.7), { durationSec: 2400 })
  rekni(typicky.dimensions.every((d) => d.percent >= 61.5), "typický klient by s pevnými hranicemi byl všude silný")
  const pod = typicky.dimensions.filter((d) => d.band === "priority" || d.band === "stabilization")
  rekni(pod.length >= 2, `vůči normě má typický klient oblasti k práci (${pod.map((d) => d.id).join(", ")})`)
  rekni(typicky.dimensions.every((d) => typeof d.percentil === "number"), "každá oblast má percentil")

  // Kdo všude „spíše souhlasí", je nad mediánem všude. I tak dostane dvě
  // relativní slabiny a shrnutí je pojmenuje.
  const souhlasi = M.evaluate(S, odpovediElite({}, 4), { durationSec: 2400 })
  rekni(
    souhlasi.dimensions.every((d) => d.band === "strong" || d.band === "elite"),
    "kdo všude spíše souhlasí, je nad mediánem všude",
  )
  rekni(souhlasi.relativeWeaknesses.length === 2, "i silný profil má dvě relativní slabiny")
  const sh = M.buildSummary(souhlasi, "cs")
  rekni(sh.priorities.startsWith("Žádná oblast nevyšla pod polovinou"), "shrnutí silného profilu mluví o relativních slabinách")
  rekni(sh.nextStep.length > 0, "silný profil má nejbližší krok")
  // Nejslabší fazety se řadí podle normy: u plochého profilu to nesmějí být
  // pořád ty nejtěžší (vnitřní dialog B2, regulace aktivace D2).
  rekni(
    !souhlasi.weakest.some((f) => f.id === "B2" || f.id === "D2"),
    `nejslabší fazety plochého profilu nejsou automaticky ty nejtěžší (${souhlasi.weakest.map((f) => f.id).join(", ")})`,
  )

  // Výrazná stylizace: shrnutí řekne, že čísla budou nadsazená.
  const odp = odpovediElite({}, 4)
  S.validity.honesty.items.forEach((p, i) => (odp[p] = i < 10 ? 4 : 3))
  const stylizuje = M.evaluate(S, odp, { durationSec: 2400 })
  rekni(stylizuje.validity.honesty.score === 46 && stylizuje.validity.honesty.status === "invalid", "index 46 je výrazná stylizace")
  rekni(M.buildSummary(stylizuje, "cs").caveat.includes("v dobrém světle"), "shrnutí u výrazné stylizace upozorní na nadsazená čísla")
  S.validity.honesty.items.forEach((p, i) => (odp[p] = i < 3 ? 4 : 3))
  const bezne = M.evaluate(S, odp, { durationSec: 2400 })
  rekni(bezne.validity.honesty.score === 39 && bezne.validity.honesty.status === "ok", "index 39 je ještě bez stylizace")
}

// ---------------------------------------------------------------------------
// Týmový report: soukromí, plán a jednotné prahy
// ---------------------------------------------------------------------------

sekce("tým: soukromí")

const S200 = M.getStructure("elite200")
const hrac = (cile, vychozi = 4) => M.evaluate(S200, odpovediElite(cile, vychozi), { durationSec: 2400 })
const vyplneni = (vysledek, viditelne, odevzdano) => ({ vysledek, viditelne, odevzdano })

{
  // Osm hráčů, sedm sdílí, jeden ne: dřív šel dopočítat odečtením.
  const sdileji = Array.from({ length: 7 }, (_, i) => vyplneni(hrac({ A: 3 + (i % 3) }), true, i))
  const skryty = vyplneni(hrac({ A: 1, B: 1 }), false, 100)
  const p = M.profilProKouce("Tým", 8, 8, [...sdileji, skryty])
  rekni(p.zapocteno === 7 && p.vynechano === 1, "jediný nesdílející hráč do profilu zatím nevstupuje")
  const jenSdileji = M.tymovyProfil("Tým", 8, 7, sdileji.map((v) => v.vysledek))
  const a = p.oblasti.find((o) => o.id === "A")
  const aSdileji = jenSdileji.oblasti.find((o) => o.id === "A")
  rekni(a.prumer === Math.round(aSdileji.prumer), "profil se pak počítá jen ze sdílejících, takže nic neprozradí")
  rekni(p.oblasti.every((o) => o.min === undefined && o.max === undefined), "oblasti nemají minimum ani maximum")
  rekni(p.casti.every((c) => c.min === undefined && c.max === undefined), "části nemají minimum ani maximum")
  rekni(
    p.oblasti.every((o) => Number.isInteger(o.prumer) && Number.isInteger(o.smodch)),
    "průměr a odchylka jsou zaokrouhlené",
  )
}
{
  // Tři nesdílející: vstoupí jako trojice, čtvrtý počká.
  const sdileji = Array.from({ length: 4 }, (_, i) => vyplneni(hrac({}), true, i))
  const skryti = Array.from({ length: 4 }, (_, i) => vyplneni(hrac({ D: 2 }), false, 10 + i))
  const p = M.profilProKouce("Tým", 8, 8, [...sdileji, ...skryti])
  rekni(p.zapocteno === 7 && p.vynechano === 1, "nesdílející vstupují po trojicích, čtvrtý čeká")
}
{
  // Master nevidí nikoho jednotlivě: ze sedmi vstoupí šest.
  const vsichni = Array.from({ length: 7 }, (_, i) => vyplneni(hrac({}), false, i))
  const p = M.profilProKouce("Tým", 7, 7, vsichni)
  rekni(p.zapocteno === 6 && !p.zamceno, "masterovi se profil skládá po trojicích")
}
{
  // Pod pěti započtenými se profil nevrací.
  const ctyri = Array.from({ length: 4 }, (_, i) => vyplneni(hrac({}), true, i))
  const p = M.profilProKouce("Tým", 6, 4, ctyri)
  rekni(p.zamceno && p.oblasti.length === 0 && p.casti.length === 0, "čtyři vyplnění profil neukážou")
  rekni(p.zapocteno === 4, "zamčený profil říká, kolik by se započítalo")
}
{
  // Neplatné vyplnění trojici nerozbije: vyřadí se dřív, než se trojice skládají.
  const nedbaly = M.evaluate(S200, Object.fromEntries(Array.from({ length: 200 }, (_, i) => [i + 1, 3])), {
    durationSec: 200,
  })
  rekni(nedbaly.validity.overall === "invalid", "nedbalé vyplnění je neplatné")
  const sdileji = Array.from({ length: 5 }, (_, i) => vyplneni(hrac({}), true, i))
  const skryti = [vyplneni(hrac({}), false, 10), vyplneni(hrac({}), false, 11), vyplneni(nedbaly, false, 12)]
  const p = M.profilProKouce("Tým", 8, 8, [...sdileji, ...skryti])
  rekni(p.zapocteno === 5 && p.vynechano === 2, "neplatné se nepočítá do trojice")
}

sekce("tým: úroveň a prahy")

{
  rekni(M.urovenTymu({ priority: 0, stabilization: 0, strong: 10, elite: 0 }) === "silne", "deset silných a nikdo ve špičce není špička")
  rekni(M.urovenTymu({ priority: 0, stabilization: 0, strong: 6, elite: 4 }) === "spicka", "šest silných a čtyři ve špičce je špička")
}
{
  const tym = [
    ...Array.from({ length: 3 }, () => hrac({ D: 5, C: 5 })),
    ...Array.from({ length: 3 }, () => hrac({ D: 1, C: 2 })),
    ...Array.from({ length: 4 }, () => hrac({ D: 2, C: 3 })),
  ]
  const p = M.tymovyProfil("Tým", 10, 10, tym)
  rekni(p.oblasti.every((o) => !(o.plosna && o.rozkol)), "oblast není zároveň plošně slabá a rozdělená")
  for (const o of p.oblasti) {
    const velke = M.shodaKratce(o.smodch, "cs") === "velké rozdíly"
    if (o.rozptyl && !velke) rekni(false, `oblast ${o.id} s velkým rozptylem má slovo „velké rozdíly“`)
    if (!o.rozptyl && !o.rozkol && velke) rekni(false, `oblast ${o.id} bez rozptylu nemá slovo „velké rozdíly“`)
  }
  rekni(true, "slovo o rozdílech sedí s příznakem velkého rozptylu")
  const opory = new Set(p.opory)
  rekni(
    p.oblasti.every((o) => (M.vetaOblasti(o, "cs", opory.has(o.id)).startsWith("Silná stránka")) === opory.has(o.id)),
    "věta „silná stránka“ patří právě oporám",
  )
  const sVlajeckou = new Set(p.casti.filter((c) => c.riziko).map((c) => c.oblast))
  rekni(p.opory.every((id) => !sVlajeckou.has(id)), "opora nemá žádnou část s vlaječkou")
}
{
  // Trhlina jen kvůli rozptylu nesmí psát „o -3 body míň".
  const veta = M.MAPA.cs.trhlinaVeta(72, 75, -3, M.duvodTrhliny({ prumer: 72, smodch: 6 }, { prumer: 75, smodch: 16 }))
  rekni(!veta.includes("-3") && !veta.includes("míň") && veta.includes("liší"), "trhlina z rozptylu mluví o rozdílech, ne o bodech míň")
  const nizsi = M.MAPA.cs.trhlinaVeta(72, 62, 10, M.duvodTrhliny({ prumer: 72, smodch: 8 }, { prumer: 62, smodch: 9 }))
  rekni(nizsi.includes("o 10 bodů míň") && !nizsi.includes("liší"), "trhlina z nižšího průměru netvrdí velké rozdíly")
}

sekce("tým: plán")

{
  // A je silná (šest z deseti silných), ale s nejnižším průměrem; D potřebuje
  // práci (dva propadlíci), i když průměr má vysoký. Dřív plán začal u A
  // a nazval ji „nejnižší oblastí, která drží zpátky".
  // Pásma se čtou z normy: u A je silné od průměrné odpovědi 3,93,
  // stabilizace od 3,53.
  const tym = [
    ...Array.from({ length: 6 }, () => hrac({ A: 4, D: 5 }, 5)),
    ...Array.from({ length: 2 }, () => hrac({ A: 3.6, D: 5 }, 5)),
    hrac({ A: 3.6, D: 1 }, 5),
    hrac({ A: 3.3, D: 1 }, 5),
  ]
  const p = M.tymovyProfil("Tým", 10, 10, tym)
  const a = p.oblasti.find((o) => o.id === "A")
  const d = p.oblasti.find((o) => o.id === "D")
  rekni(a.uroven === "silne" && d.uroven === "potrebuje-praci", "A je silná, D potřebuje práci")
  rekni(a.prumer < d.prumer, "A má přitom nižší průměr než D")
  const plan = M.sestavPlan(p, "cs")
  rekni(plan[0].oblast === "D", `plán začne u oblasti, která potřebuje práci (začal u ${plan[0].oblast})`)
  rekni(!plan[0].duvod.includes("nejnižší"), "D se nenazývá nejnižší oblastí, když není")
  rekni(plan.every((f) => !f.duvod.includes("nejnižší") || f.oblast === p.oblasti.slice().sort((x, y) => x.prumer - y.prumer)[0].id), "„nejnižší“ jen u oblasti s nejnižším průměrem")
}
{
  // Všechno silné a vyrovnané: udržovací plán, žádné „drží zpátky".
  const tym = Array.from({ length: 8 }, (_, i) => hrac({}, i % 2 ? 4 : 4.25))
  const p = M.tymovyProfil("Tým", 8, 8, tym)
  const plan = M.sestavPlan(p, "cs")
  rekni(p.oblasti.every((o) => !M.potrebujePraci(o)), "v silném týmu nic nepotřebuje práci")
  rekni(plan.length === 3 && plan.every((f) => f.udrzba), "plán je udržovací a má tři fáze")
  rekni(plan.every((f) => !f.duvod.includes("drží zpátky") && !f.duvod.includes("nejnižší")), "udržovací plán netvrdí, že něco drží zpátky")
  rekni(plan[0].oblast !== plan[1].oblast, "první dvě fáze řeší různé oblasti")
}

// ---------------------------------------------------------------------------

console.log(chyb ? `\n${chyb} chyb` : "\nvše v pořádku")
process.exit(chyb ? 1 : 0)
