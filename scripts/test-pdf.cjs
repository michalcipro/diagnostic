// Kontrola hotových PDF: týmového reportu a manuálu pro kouče.
//
// Sazba se nedá ohlídat typovou kontrolou. Text může přetéct, dva prvky se
// mohou překrýt, oddíl může zmizet za okrajem a překlad se pozná až v ruce.
// Tenhle test proto PDF opravdu vyrobí, přečte ho zpátky přes pdf.js a ptá
// se na to, co by kouči vadilo: chybí oddíl, je to nečitelně dlouhé, nebo se
// do textu dostala výplň typu undefined.
//
// Spouští se `node scripts/test-pdf.cjs`.

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

const vstup = path.join(KOREN, "scripts", ".pdf-vstup.ts")
const vystup = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "pdf-")), "pdf.cjs")
fs.writeFileSync(
  vstup,
  `export { evaluate } from "../lib/diagnostic/scoring"
export { getStructure, ELITE200_FACETS, ELITE200_REVERSED } from "../lib/diagnostic/structure"
export { tymovyProfil } from "../lib/tym/agregace"
export { buildTymPdf } from "../lib/tym/pdf"
export { RAMEC } from "../lib/tym/ramec"
export { MAPA, KRATCE, CASTI } from "../lib/tym/slova"
export { TYM } from "../lib/tym/obsah"
export { buildManualPdf } from "../lib/diagnostic/manual-pdf"
export { MANUAL } from "../lib/diagnostic/manual"
export { SIRKA_DLAZDICE, velikostSlova } from "../lib/tym/pdf"
export { shodaKratce } from "../lib/tym/slova"
export { Sazba, novyDokument, A4, OKRAJ } from "../lib/diagnostic/pdf/sazba"
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

/** Hráč, který dotazník čte, takže projde kontrolami validity. */
function hrac(zaklad, uprava = {}) {
  const a = {}
  for (const f of M.ELITE200_FACETS) {
    const uroven = uprava[f.id] ?? uprava[f.dimension] ?? zaklad
    for (const i of f.items) a[i] = OBRACENE.has(i) ? 6 - uroven : uroven
  }
  for (let i = 1; i <= 200; i++) if (a[i] === undefined) a[i] = 3
  for (const [polozka, hodnota] of Object.entries(S200.validity.attention)) a[Number(polozka)] = hodnota
  if (S200.validity.infrequency) {
    for (const i of S200.validity.infrequency.expectAgree) a[i] = 4
    for (const i of S200.validity.infrequency.expectDisagree) a[i] = 2
  }
  for (const i of S200.validity.honesty.items) a[i] = 2
  return a
}

const opakuj = (n, f) => Array.from({ length: n }, f)

// Dva týmy. První je běžný případ ze sdílené sestavy, tedy přesně ten, který
// ukazuje simulace: pár silných míst, jedna zlomová linie, jeden člověk mimo.
// Na něm se hlídá rozsah, protože takhle report vypadá v praxi.
//
// Druhý je patologie: kádr rozdělený na dvě poloviny ve všech oblastech
// naráz. Ta se nehlídá na rozsah, ale na to, aby report nerostl bez omezení.
// Tým rozbitý všude si o stranu navíc oprávněně říká.
const { sestavTym } = require("./tym-fixture.cjs")

const BEZNY = { ...sestavTym(M).profil, nazev: sestavTym(M).nazev }

// Úrovně 4 a 2, ne 5 a 1: kdo odpoví na všechno krajně, neprojde kontrolou
// konzistence a do profilu se nedostane. Tenhle tým je rozdělený, a přitom
// jeho dotazníky jsou hodnověrné.
const rozbitiHraci = [...opakuj(4, () => hrac(4)), ...opakuj(4, () => hrac(2))]
const ROZBITY = {
  nazev: "Worst Case University",
  ...M.tymovyProfil(
    "Worst Case University",
    10,
    rozbitiHraci.length,
    rozbitiHraci.map((a) => M.evaluate(S200, a, { durationSec: 2400 })),
  ),
}

/** Nadpisy, které v reportu musí být. Když oddíl vypadne, test to řekne. */
function nadpisyOddilu(lang) {
  const r = M.RAMEC[lang]
  const t = M.TYM[lang]
  return [
    r.shrnutiTitul,
    r.jakCistTitul,
    t.oporyTitul,
    t.nalezyTitul,
    r.oblastiDetailTitul,
    r.planTitul,
    r.rozhovoryTitul,
    r.mantinelyTitul,
    M.MAPA[lang].cislaTitul,
    M.MAPA[lang].titul,
    M.MAPA[lang].castiTitul,
  ]
}

const VYPLN = [
  [/undefined/, "undefined"],
  [/NaN/, "NaN"],
  [/\[object /, "[object Object]"],
  [/\{[^}]*\|[^}]*\}/, "neroz­vinutá značka rodu"],
]

async function nacti(profil, lang) {
  const { getDocument } = await import("pdfjs-dist/legacy/build/pdf.mjs")
  const blob = M.buildTymPdf(profil, lang)
  const data = new Uint8Array(await blob.arrayBuffer())
  const doc = await getDocument({ data, useSystemFonts: true }).promise
  const strany = []
  const prekryvy = []
  const zaOkrajem = []
  for (let i = 1; i <= doc.numPages; i++) {
    const stranka = await doc.getPage(i)
    const obsah = await stranka.getTextContent()
    strany.push(obsah.items.map((x) => x.str).join(" "))
    prekryvy.push(...najdiPrekryvy(obsah.items, i))
    zaOkrajem.push(...najdiPreteceni(obsah.items, i))
  }
  return { pocetStran: doc.numPages, strany, prekryvy, zaOkrajem, vse: strany.join("\n") }
}

/**
 * Dva texty, které leží přes sebe.
 *
 * Mapa týmu sází popisky do volné plochy a překryv se pozná až v ruce; typová
 * kontrola o něm neví a rozvržení se mění s každým jiným týmem. Proto se hledá
 * strojově, na skutečných souřadnicích z hotového PDF.
 */
function najdiPrekryvy(polozky, strana) {
  const boxy = polozky
    .filter((x) => x.str.trim())
    .map((x) => ({ t: x.str, x: x.transform[4], y: x.transform[5], w: x.width, h: x.height }))
  const out = []
  for (let a = 0; a < boxy.length; a++) {
    for (let b = a + 1; b < boxy.length; b++) {
      const A = boxy[a]
      const B = boxy[b]
      const vodorovne = A.x < B.x + B.w - 0.5 && B.x < A.x + A.w - 0.5
      const svisle = Math.abs(A.y - B.y) < Math.min(A.h, B.h) * 0.55
      if (vodorovne && svisle) out.push(`strana ${strana}: „${A.t}" přes „${B.t}"`)
    }
  }
  return out
}

/**
 * Text, který skončil za okrajem strany.
 *
 * Překryv pozná jen srážku dvou textů. Slovo, které vyteče z dlaždice do
 * volného místa u kraje, se nesrazí s ničím, a přesto je to zjevná chyba
 * sazby: přesně to ukázala mřížka částí v angličtině. Souřadnice jsou
 * v bodech, sazba v milimetrech, proto ten převod.
 */
function najdiPreteceni(polozky, strana) {
  const NA_MM = 25.4 / 72
  const pravy = M.A4.sirka - M.OKRAJ.pravy
  const out = []
  for (const x of polozky) {
    if (!x.str.trim()) continue
    const konec = (x.transform[4] + x.width) * NA_MM
    const zacatek = x.transform[4] * NA_MM
    if (konec > pravy + 0.5 || zacatek < M.OKRAJ.levy - 0.5) {
      out.push(`strana ${strana}: „${x.str}" končí na ${konec.toFixed(1)} mm`)
    }
  }
  return out
}

/**
 * Mřížka částí měřená přímo, ne přes hotové PDF.
 *
 * Do dlaždice jde číslo, slovo o shodě a případně vlaječka rizika. Angličtina
 * má „large differences" tam, kde čeština má „velké rozdíly", takže se to
 * musí ověřit pro všech jednadvacet částí v obou jazycích, ne jen pro tým,
 * který zrovna vyšel v simulaci.
 */
function zkontrolujMrizku() {
  const merac = new M.Sazba(M.novyDokument())
  // Nejširší možný obsah: trojmístné číslo a nejdelší slovo o shodě, které
  // pro danou směrodatnou odchylku může padnout.
  const ODCHYLKY = [0, 3, 5, 7, 9, 12, 20]
  for (const lang of ["cs", "en"]) {
    const tesne = []
    for (const sd of ODCHYLKY) {
      const slovo = M.shodaKratce(sd, lang)
      const velikost = M.velikostSlova(merac, "100", slovo)
      if (velikost < 6.8) tesne.push(`${slovo} (${velikost.toFixed(1)} pt)`)
    }
    rekni(!tesne.length, `mřížka ${lang}: slovo o shodě se vejde v plné velikosti${tesne.length ? ` (${tesne.join(", ")})` : ""}`)

    // Název části se láme na dvě řádky do místa, které zbude vedle vlaječky.
    const misto = M.SIRKA_DLAZDICE - 6 - 5
    const siroke = []
    for (const [id, nazev] of Object.entries(M.CASTI[lang])) {
      const radky = merac.doc.splitTextToSize(nazev, misto)
      if (radky.length > 2) siroke.push(`${id}: ${nazev} (${radky.length} řádky)`)
      for (const r of radky) {
        if (merac.sirkaTextu(r, 7, true) > misto + 0.2) siroke.push(`${id}: „${r}" je širší než dlaždice`)
      }
    }
    rekni(!siroke.length, `mřížka ${lang}: názvy všech částí se vejdou do dlaždice${siroke.length ? ` (${siroke.slice(0, 3).join("; ")})` : ""}`)
  }
}

async function zkontroluj(profil, lang, rozsah) {
  const { pocetStran, strany, prekryvy, zaOkrajem, vse } = await nacti(profil, lang)
  const [nejmin, nejvic] = rozsah
  rekni(
    pocetStran >= nejmin && pocetStran <= nejvic,
    `${profil.nazev} ${lang}: ${nejmin} až ${nejvic} stran (má ${pocetStran})`,
  )

  // Prostrkané popisky se do textové vrstvy dostanou po znacích, takže se
  // před porovnáním mezery zahodí. Jinak by „S H R N U T Í" nikdy nesedělo.
  const bezMezer = vse.replace(/\s+/g, "").toLowerCase()
  const chybejici = nadpisyOddilu(lang).filter(
    (n) => !bezMezer.includes(n.replace(/\s+/g, "").toLowerCase()),
  )
  rekni(!chybejici.length, `${profil.nazev} ${lang}: všech osm oddílů je v PDF${chybejici.length ? ` (chybí ${chybejici.join(", ")})` : ""}`)

  const nalezenaVypln = VYPLN.filter(([vzor]) => vzor.test(vse)).map(([, popis]) => popis)
  rekni(!nalezenaVypln.length, `${profil.nazev} ${lang}: v textu není výplň${nalezenaVypln.length ? ` (${nalezenaVypln.join(", ")})` : ""}`)

  const prazdne = strany.map((x, i) => [i + 1, x.trim().length]).filter(([, d]) => d < 200)
  rekni(!prazdne.length, `${profil.nazev} ${lang}: žádná strana není poloprázdná${prazdne.length ? ` (strany ${prazdne.map(([i]) => i).join(", ")})` : ""}`)

  rekni(
    !prekryvy.length,
    `${profil.nazev} ${lang}: žádné dva texty neleží přes sebe${prekryvy.length ? ` (${prekryvy.slice(0, 2).join("; ")})` : ""}`,
  )

  rekni(
    !zaOkrajem.length,
    `${profil.nazev} ${lang}: žádný text nepřetéká za okraj strany${zaOkrajem.length ? ` (${zaOkrajem.slice(0, 3).join("; ")})` : ""}`,
  )

  // Mapa se kreslí ručně do souřadnic, takže se z ní dá snadno něco vytratit,
  // aniž by o tom překladač věděl.
  const m = M.MAPA[lang]
  const prvkyMapy = [
    ...m.rohy.map((r) => r.titul),
    m.osaX,
    m.osaYNahore,
    m.osaYDole,
    ...m.legenda,
    ...m.pasma.map((p) => p.rozsah),
  ]
  const bezMezerVse = vse.replace(/\s+/g, "").toLowerCase()
  const chybiMapa = prvkyMapy.filter((x) => !bezMezerVse.includes(x.replace(/\s+/g, "").toLowerCase()))
  rekni(!chybiMapa.length, `${profil.nazev} ${lang}: mapa má všechny popisky${chybiMapa.length ? ` (chybí ${chybiMapa.join(", ")})` : ""}`)

  // Názvy částí se berou z jiného souboru než názvy oblastí; kdyby se rozešly,
  // mřížka by ukazovala identifikátory typu F2.
  const nazvyCasti = profil.casti.map((c) => M.CASTI[lang][c.id]).filter(Boolean)
  const chybiCasti = nazvyCasti.filter((x) => !bezMezerVse.includes(x.replace(/\s+/g, "").toLowerCase()))
  rekni(
    nazvyCasti.length === profil.casti.length && !chybiCasti.length,
    `${profil.nazev} ${lang}: všech ${profil.casti.length} částí má název v PDF${chybiCasti.length ? ` (chybí ${chybiCasti.slice(0, 3).join(", ")})` : ""}`,
  )

  rekni(vse.length > 12000, `${profil.nazev} ${lang}: report je opravdu podrobný (${vse.length} znaků)`)
}

/**
 * Manuál pro kouče. Hlídá se, že v PDF opravdu jsou všechny kapitoly: obsah
 * se generuje ze stejného pole, takže chybějící vykreslení kapitoly by se
 * v obsahu neprojevilo a v dokumentu by prostě nebyla.
 */
async function zkontrolujManual(lang) {
  const { getDocument } = await import("pdfjs-dist/legacy/build/pdf.mjs")
  const blob = M.buildManualPdf(lang)
  const doc = await getDocument({
    data: new Uint8Array(await blob.arrayBuffer()),
    useSystemFonts: true,
  }).promise
  const strany = []
  for (let i = 1; i <= doc.numPages; i++) {
    const stranka = await doc.getPage(i)
    strany.push((await stranka.getTextContent()).items.map((x) => x.str).join(" "))
  }
  const vse = strany.join("\n")
  const bezMezer = vse.replace(/\s+/g, "").toLowerCase()

  const t = M.MANUAL[lang]
  const chybejici = t.kapitoly
    .map((k) => k.title)
    .filter((n) => !bezMezer.includes(n.replace(/\s+/g, "").toLowerCase()))
  rekni(
    !chybejici.length,
    `manuál ${lang}: všech ${t.kapitoly.length} kapitol je v PDF${chybejici.length ? ` (chybí ${chybejici.join(", ")})` : ""}`,
  )

  // Týmová kapitola se kontroluje zvlášť: vykresluje se jinými poli než
  // ostatní a chybějící řádek v sazbě by kapitolu nechal prázdnou.
  const tymove = [t.tymRoleTitle, ...t.tymRole.map((x) => x.lbl), ...t.tymBloky.map((x) => x.lbl)]
  const chybiTym = tymove.filter((n) => !bezMezer.includes(n.replace(/\s+/g, "").toLowerCase()))
  rekni(
    !chybiTym.length,
    `manuál ${lang}: týmová kapitola je celá${chybiTym.length ? ` (chybí ${chybiTym.join(", ")})` : ""}`,
  )

  const nalezenaVypln = VYPLN.filter(([vzor]) => vzor.test(vse)).map(([, popis]) => popis)
  rekni(!nalezenaVypln.length, `manuál ${lang}: v textu není výplň${nalezenaVypln.length ? ` (${nalezenaVypln.join(", ")})` : ""}`)

  const prazdne = strany.map((x, i) => [i + 1, x.trim().length]).filter(([, d]) => d < 200)
  rekni(!prazdne.length, `manuál ${lang}: žádná strana není poloprázdná${prazdne.length ? ` (strany ${prazdne.map(([i]) => i).join(", ")})` : ""}`)
}

;(async () => {
  console.log("– PDF týmového reportu –")
  const slozeni = (p) =>
    `${p.nalezy.length} nálezů, zlomy ${p.zlomy.join(",") || "žádné"},` +
    ` priority ${p.priority.join(",") || "žádné"},` +
    ` oblastí pod 65: ${p.oblasti.filter((o) => o.prumer < 65).length}`
  console.log(`  ${BEZNY.nazev}: ${slozeni(BEZNY)}`)
  console.log(`  ${ROZBITY.nazev}: ${slozeni(ROZBITY)}`)
  // Rozsah povyrostl dvakrát. Poprvé, když do reportu přibyla mapa týmu,
  // vysvětlení čísel, skryté trhliny a mřížka jednadvaceti částí. Podruhé,
  // když se úroveň oblasti přestala číst z průměru a začala se číst z toho,
  // kolik hráčů je v kterém pásmu testu: přísnější posouzení pošle do plánu
  // a do rozhovorů víc oblastí, protože jich víc opravdu potřebuje práci.
  // Je to obsah navíc, ne nafouknutí – kontrola poloprázdných stran níž hlídá,
  // že se strany nepřidávají jen tak.
  for (const lang of ["cs", "en"]) await zkontroluj(BEZNY, lang, [8, 12])
  console.log("\n– patologický případ: tým rozdělený na dvě poloviny –")
  for (const lang of ["cs", "en"]) await zkontroluj(ROZBITY, lang, [8, 14])
  console.log("\n– mřížka částí, měřeno přímo –")
  zkontrolujMrizku()
  console.log("\n– manuál pro kouče –")
  for (const lang of ["cs", "sk", "en"]) await zkontrolujManual(lang)
  console.log(chyb === 0 ? "\nPDF sedí" : `\nNALEZENO CHYB: ${chyb}`)
  process.exit(chyb === 0 ? 0 : 1)
})()
