// Rod respondenta v položkách dotazníků (čeština a slovenština).
//
// Dotazník se vyplňuje v první osobě, takže každé příčestí („neřekl jsem"),
// krátký tvar („jsem schopen"), přídavné jméno v přísudku („cítím se
// unavený") nebo podstatné jméno pro respondenta („jako sportovec") prozradí
// rod. Bez značky {mužský|ženský} dostane žena mužský tvar a applyGender()
// v lib/diagnostic/gender.ts na tom nic nezmění, protože nemá co rozvinout.
// V hotovém textu se taková chyba nepozná, jen ve zdroji, proto tahle kontrola.
//
// Kontroluje se:
// 1) Značky jsou celé: obě větve neprázdné a různé, po rozvinutí pro muže
//    i pro ženu nezůstane v textu „{", „}" ani „|".
// 2) Text bez značek neobsahuje typické mužské tvary první osoby:
//    příčestí na -l u „jsem/bych/som/by som", přídavné jméno na -ý v přísudku
//    („jsem/cítím se/zůstat … unavený"), krátké tvary, „sám", „rád",
//    podstatná jména pro respondenta a staré zápisy typu „byl(a)".
// 3) Ženské rozvinutí neobsahuje mužské slovo ze značky téhož textu
//    ani žádný z tvarů podle bodu 2.
//
// Spouští se `node scripts/test-rod-polozek.cjs`. Jiný kořen s daty (třeba
// kopie starší verze z gitu) se zadá `--koren <adresář>` nebo proměnnou
// ROD_KOREN; čte se z něj jen 14 souborů s položkami níže. Přepínač `--vse`
// vypíše všechny nálezy, ne jen prvních šest u každého souboru.

const fs = require("fs")
const path = require("path")

const argKoren = process.argv.indexOf("--koren")
const KOREN = path.resolve(
  argKoren > 0 ? process.argv[argKoren + 1] : process.env.ROD_KOREN || path.join(__dirname, ".."),
)

let chyb = 0
const rekni = (ok, text) => {
  if (!ok) chyb++
  console.log(`${ok ? "OK   " : "CHYBA"} ${text}`)
}

/** Soubory s položkami. ELITE má jazyky v jednom souboru, ostatní testy zvlášť. */
const SOUBORY = [
  ["lib/diagnostic/data/items/elite200-sport.json", "elite"],
  ["lib/diagnostic/data/items/elite200-business.json", "elite"],
  ["lib/diagnostic/data/items/elite100-sport.json", "elite"],
  ["lib/diagnostic/data/items/elite100-business.json", "elite"],
  ["lib/archetypy/data/polozky.json", "cs"],
  ["lib/archetypy/data/polozky-sk.json", "sk"],
  ["lib/archetypy/data/polozky-sport.json", "cs"],
  ["lib/archetypy/data/polozky-sport-sk.json", "sk"],
  ["lib/vzorce/data/polozky.json", "cs"],
  ["lib/vzorce/data/polozky-sk.json", "sk"],
  ["lib/vzorce/data/polozky-sport-individual.json", "cs"],
  ["lib/vzorce/data/polozky-sport-individual-sk.json", "sk"],
  ["lib/vzorce/data/polozky-sport-tym.json", "cs"],
  ["lib/vzorce/data/polozky-sport-tym-sk.json", "sk"],
]

/** Stejný vzor jako applyGender() v lib/diagnostic/gender.ts. */
const ZNACKA = /\{([^{}|]*)\|([^{}|]*)\}/g
const rozvin = (text, zena) => text.replace(ZNACKA, (_, m, f) => (zena ? f : m))
/** Text bez značek: značka se nahradí znakem, který není písmeno. */
const bezZnacek = (text) => text.replace(ZNACKA, "◊")

// `\b` v JavaScriptu nezná diakritiku, hranice slova se skládají ručně.
const P = "\\p{L}"
const KONEC = `(?!${P})`
const ZACATEK = `(?<!${P})`
/** Slova v rámci jedné věty, bez interpunkce. */
const SLOVA = (min, max) => `(?:\\s+[^\\s,.;:!?()]+){${min},${max}}?`
const re = (vzor) => new RegExp(vzor, "giu")

/**
 * Podstatná jména na -l, která nejsou příčestí. Bez nich by pravidlo
 * o příčestí hlásilo „jsem … cíl" nebo „som … zmysel".
 */
const NE_PRICESTI = new Set(
  [
    "cíl", "smysl", "úmysl", "styl", "materiál", "rozdíl", "úkol", "dál", "nóbl", "signál",
    "ideál", "potenciál", "model", "detail", "level", "fotbal", "mail", "kapitál",
    "zmysel", "úmysel", "štýl", "rozdiel", "cieľ", "ďalej", "futbal", "e-mail",
  ].map((s) => s.toLowerCase()),
)

/** Spona a slovesa, po kterých přídavné jméno popisuje respondenta. */
const SPONA = {
  cs: "jsem|nejsem|být|zůstat|zůstávám|zůstanu|cítím|necítím|připadám|stát",
  sk: "som|byť|zostať|zostávam|zostanem|cítim|necítim|pripadám|stať",
}
/** Pomocná slovesa minulého času a podmiňovacího způsobu v první osobě. */
const POMOCNE = {
  cs: "jsem|bych|abych|kdybych",
  sk: "som",
}
/** Přídavná jména na -ý, která nikdy nepopisují respondenta (zájmena a podobně). */
const NE_PRIDAVNE = new Set(["každý", "který", "žádný", "nějaký", "ktorý", "žiadny", "nejaký", "aby", "akoby"])

/**
 * Tvary, které v položkách patří vždy respondentovi, a proto smí stát jen
 * ve značce. Vznikly ze všech míst, která se opravovala, ať se nevrátí.
 * Výjimky (stejné slovo o někom jiném) jsou v POVOLENE.
 */
const ZAKAZANE = {
  cs: [
    "sám", "samému", "samým", "rád", "schopen", "připraven", "nucen", "ochoten", "přesvědčen",
    "spokojen", "rozhodnut", "přitahován", "týrán", "zneužit",
    "unavený", "vlažný", "disciplinovaný", "méněcenný", "férový", "laskavý", "pokorný",
    "zaměřený", "osamocený", "ohrožený", "zaměnitelný", "posedlý", "obezřelý", "propojený",
    "osamělý", "nejistý", "nesvůj", "hloupý", "nudný", "tlustý", "hubený", "dlouhý", "malý",
    "ošklivý", "jiný", "vyloučený", "dospělý", "nemožný", "vadný", "sebekritický", "schopný",
    "neschopný", "ctižádostivý", "výjimečný", "silný", "navázaný", "hodnotný", "dobrý", "jaký",
    "druhý", "sportovec", "sportovcem", "profesionál", "samotář", "pozorovatel", "hráč",
    "bezdomovcem",
  ],
  sk: [
    "sám", "samému", "samým", "rád", "pripravený", "unavený", "vlažný", "disciplinovaný",
    "menejcenný", "férový", "láskavý", "pokorný", "zameraný", "osamotený", "ohrozený",
    "zameniteľný", "kontroverzný", "posadnutý", "obozretný", "prepojený", "osamelý", "nesvoj",
    "hlúpy", "nudný", "tučný", "chudý", "vysoký", "malý", "škaredý", "iný", "vylúčený", "dospelý",
    "nemožný", "chybný", "sebakritický", "schopný", "neschopný", "schopnejší", "ctižiadostivý",
    "výnimočný", "silný", "naviazaný", "hodnotný", "dobrý", "aký", "taký", "atraktívny",
    "inteligentný", "druhý", "najlepší", "horší", "prvý", "športovec", "športovcom",
    "profesionál", "samotár", "pozorovateľ", "hráč", "bezdomovcom",
  ],
}

/**
 * Místa, kde mužský tvar patří někomu nebo něčemu jinému než respondentovi.
 * Každá výjimka je celá fráze, ne jen slovo, aby nepropustila nic dalšího.
 */
const POVOLENE = [
  // druzí lidé
  "kdo mě má rád", "kto ma má rád", "Nikdo mě nemůže mít rád", "Nikto ma nemôže mať rád",
  "aby se zákazník u nás cítil výjimečný", "aby sa zákazník u nás cítil výnimočný",
  "chladný(á) partner(ka)",
  // věci a abstrakta
  "dialog v náročných situacích je převážně konstruktivní a zaměřený",
  "dialog během výkonu je převážně konstruktivní a zaměřený",
  "dialóg v náročných situáciách je prevažne konštruktívny a zameraný",
  "dialóg počas výkonu je prevažne konštruktívny a zameraný",
  "jiný stav", "iný stav", "dobrý úmysl", "dobrý úmysel", "Nudný trénink", "Nudný tréning",
  "najlepší výkon", "na prvý pohľad",
  "jaký typ", "aký typ", "jaký styl", "aký štýl", "jaký způsob", "aký spôsob",
  "jaký režim", "aký režim",
  // přídavné jméno u podstatného jména, ne v přísudku
  "nezmyselný štandard", "osvedčený.",
  // „člověk" je mužského rodu i u ženy
  "byť normálny človek", "Nie som zlý človek", "Nejsem špatný člověk",
]

/** Pole [od, do) všech výskytů povolených frází v textu. */
function povoleneUseky(text) {
  const useky = []
  for (const fraze of POVOLENE) {
    let i = text.indexOf(fraze)
    while (i >= 0) {
      useky.push([i, i + fraze.length])
      i = text.indexOf(fraze, i + 1)
    }
  }
  return useky
}

/** Najde mužské tvary první osoby v textu (čeština nebo slovenština). */
function muzskeTvary(text, jazyk) {
  const nalez = []
  const povolene = povoleneUseky(text)
  /** Hlásí nález, pokud slovo na pozici `index` neleží v povolené frázi. */
  const pridej = (index, delka, co) => {
    if (povolene.some(([od, do_]) => index >= od && index + delka <= do_)) return
    nalez.push(co)
  }
  /** Pozice zachyceného slova, které stojí na konci shody. */
  const naKonci = (m) => m.index + m[0].length - m[1].length

  // příčestí na -l za pomocným slovesem nebo těsně před ním
  const pom = POMOCNE[jazyk]
  const prichestiZa = re(`${ZACATEK}(?:${pom}|by\\s+som)${KONEC}${SLOVA(0, 6)}\\s+(${P}{2,}l)${KONEC}`)
  const prichestiPred = re(`${ZACATEK}(${P}{2,}l)\\s+(?:${pom}|by\\s+som)${KONEC}`)
  for (const m of text.matchAll(prichestiZa)) {
    if (NE_PRICESTI.has(m[1].toLowerCase())) continue
    pridej(naKonci(m), m[1].length, `příčestí „${m[1]}" (${m[0].trim()})`)
  }
  for (const m of text.matchAll(prichestiPred)) {
    if (NE_PRICESTI.has(m[1].toLowerCase())) continue
    pridej(m.index, m[1].length, `příčestí „${m[1]}" (${m[0].trim()})`)
  }

  // přídavné jméno na -ý v přísudku; slovensky i -ší („horší") a -y po dlouhé
  // slabice („hlúpy", „atraktívny"), ne ale příslovce „vtedy", „nikdy", „vždy"
  const pridavneJmeno =
    jazyk === "sk"
      ? `${P}{2,}(?:ý|ší)|${P}*(?:[áéíóúýô]|i[aeu])[bcčdďfghjklĺľmnňprŕsštťvzž]+y`
      : `${P}{2,}ý`
  const pridavne = re(`${ZACATEK}(?:${SPONA[jazyk]})${KONEC}${SLOVA(0, 3)}\\s+(${pridavneJmeno})${KONEC}`)
  for (const m of text.matchAll(pridavne)) {
    if (NE_PRIDAVNE.has(m[1].toLowerCase())) continue
    pridej(naKonci(m), m[1].length, `přídavné jméno „${m[1]}" (${m[0].trim()})`)
  }

  // tvary, které v položkách patří vždy respondentovi
  const zakazane = re(`${ZACATEK}(${ZAKAZANE[jazyk].join("|")})${KONEC}`)
  for (const m of text.matchAll(zakazane)) pridej(m.index, m[1].length, `„${m[1]}"`)

  // starý zápis obou rodů naráz: „byl(a)", „posedlý(á)", „odešel (odešla)"
  const zavorky = re(`${P}+\\((?:a|á|la|ia|schopna|schopná|svá)\\)|${P}+l \\(${P}+la\\)`)
  for (const m of text.matchAll(zavorky)) pridej(m.index, m[0].length, `zápis „${m[0]}"`)

  return nalez
}

/** Slova mužské větve, která v ženské větvi nejsou. Zájmena se nekontrolují. */
const ZAJMENA = new Set(["ten", "ta", "tá", "toho", "tu", "tú"])
function muzskaSlovaZnacek(text) {
  const slova = []
  for (const [, m, f] of text.matchAll(ZNACKA)) {
    const zenska = new Set(f.toLowerCase().split(/\s+/))
    for (const s of m.toLowerCase().split(/\s+/)) {
      if (s.length >= 3 && !zenska.has(s) && !ZAJMENA.has(s)) slova.push(s)
    }
  }
  return slova
}

/** Všechny české a slovenské texty položek: [soubor, číslo, jazyk, text]. */
function nactiTexty() {
  const texty = []
  for (const [soubor, druh] of SOUBORY) {
    const cesta = path.join(KOREN, soubor)
    const data = JSON.parse(fs.readFileSync(cesta, "utf8"))
    for (const [cislo, hodnota] of Object.entries(data)) {
      if (druh === "elite") {
        texty.push([soubor, cislo, "cs", hodnota.cs])
        texty.push([soubor, cislo, "sk", hodnota.sk])
      } else texty.push([soubor, cislo, druh, hodnota])
    }
  }
  return texty
}

console.log(`– rod respondenta v položkách (${path.relative(process.cwd(), KOREN) || "."}) –`)

const texty = nactiTexty()
/** `--vse` vypíše všechny nálezy, jinak jen prvních šest. */
const VSE = process.argv.includes("--vse")
const ukaz = (seznam) => {
  if (!seznam.length) return ""
  if (VSE) return `:\n      ${seznam.join("\n      ")}`
  return `: ${seznam.slice(0, 6).join("; ")}${seznam.length > 6 ? ` … a dalších ${seznam.length - 6}` : ""}`
}

for (const [soubor] of SOUBORY) {
  const moje = texty.filter(([s]) => s === soubor)
  // „archetypy/polozky.json" a „vzorce/polozky.json" se jmenují stejně
  const kratce = soubor.replace(/^lib\/(?:diagnostic\/data\/items\/)?/, "").replace("/data/", "/")
  const rozbite = []
  const bezZnacky = []
  const zenaMuzsky = []
  for (const [, cislo, jazyk, text] of moje) {
    const kde = `${cislo}${moje.some(([, , j]) => j !== jazyk) ? ` ${jazyk}` : ""}`

    // 1) celistvost značek; do obou větví patří celé slovo, ne jen koncovka
    for (const z of String(text).matchAll(ZNACKA)) {
      const [cela, m, f] = z
      if (!m.trim() || !f.trim()) rozbite.push(`${kde} prázdná větev ${cela}`)
      else if (m === f) rozbite.push(`${kde} shodné větve ${cela}`)
      const pred = text.slice(Math.max(0, z.index - 1), z.index)
      const za = text.slice(z.index + cela.length, z.index + cela.length + 1)
      if (/\p{L}/u.test(pred + za)) rozbite.push(`${kde} značka uvnitř slova ${pred}${cela}${za}`)
    }
    for (const zena of [false, true]) {
      if (/[{}|]/.test(rozvin(text, zena))) rozbite.push(`${kde} po rozvinutí pro ${zena ? "ženu" : "muže"} zbyla závorka nebo „|"`)
    }

    // 2) mužské tvary mimo značky
    for (const n of muzskeTvary(bezZnacek(text), jazyk)) bezZnacky.push(`${kde} ${n}`)

    // 3) ženské rozvinutí
    const zensky = rozvin(text, true)
    for (const n of muzskeTvary(zensky, jazyk)) zenaMuzsky.push(`${kde} ${n}`)
    for (const s of muzskaSlovaZnacek(text)) {
      if (re(`${ZACATEK}${s}${KONEC}`).test(zensky)) zenaMuzsky.push(`${kde} mužské „${s}" i v ženském znění`)
    }
  }
  rekni(!rozbite.length, `${kratce}: značky jsou celé a rozvinou se čistě${ukaz(rozbite)}`)
  rekni(!bezZnacky.length, `${kratce}: žádný mužský tvar první osoby bez značky${ukaz(bezZnacky)}`)
  // Mužský tvar mimo značku je vidět i v ženském znění, hlásí se proto jen
  // to, co přidá bod 3 navíc (třeba ženská větev se špatným tvarem).
  const klic = (nalez) => `${nalez.split(" ")[0]} ${nalez.split(" ")[1]} ${(nalez.match(/„[^"]*"/) || [""])[0]}`
  const uzHlasene = new Set(bezZnacky.map(klic))
  const navic = zenaMuzsky.filter((z) => !uzHlasene.has(klic(z)))
  rekni(!navic.length, `${kratce}: ženské znění je celé v ženském rodě${ukaz(navic)}`)
}

console.log(chyb === 0 ? "\nrod v položkách sedí" : `\nNALEZENO CHYB: ${chyb}`)
process.exit(chyb === 0 ? 0 : 1)
