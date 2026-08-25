// Kontrola izolace větví: kdo na čí data vidí.
//
// Zrcadlí logiku handlerů z convex/eliteDiagnostic.ts a convex/sessions.ts.
// Je to simulace, ne volání ostrého backendu; smysl má proto, že drží pravidla
// na jednom místě a při změně chování upozorní dřív, než se to nasadí.
// Doplňuje ji scripts/audit-pristupu.cjs, který hlídá, že každý koncový bod
// nějakou stráž vůbec volá.
//
// Spouští se `node scripts/test-vetve.cjs`.

const KOUCI = {
  M: { id: "M", role: "master" },
  K: { id: "K", role: "coach" },
  K2: { id: "K2", role: "coach" },
  E1: { id: "E1", role: "external" },
  E2: { id: "E2", role: "external" },
}

// vyplnění a pozvánky; vlastník undefined = záznam z doby před externími kouči
const VYPLNENI = [
  { id: "v-stare", coachId: undefined },
  { id: "v-master", coachId: "M" },
  { id: "v-kouc", coachId: "K" },
  { id: "v-kouc2", coachId: "K2" },
  { id: "v-e1", coachId: "E1" },
  { id: "v-e2", coachId: "E2" },
]

/** convex/sessions.ts: filtrViditelnosti */
function filtrViditelnosti(me) {
  // Kouč vidí jen to, co sám založil. Externí i náš, pravidlo je stejné.
  if (me.role !== "master") return (vlastnik) => vlastnik === me.id
  // Master vidí celou naši větev včetně starých vyplnění bez vlastníka,
  // do větví externích koučů ale nevidí.
  const externi = new Set(
    Object.values(KOUCI).filter((c) => c.role === "external").map((c) => c.id),
  )
  return (vlastnik) => vlastnik === undefined || !externi.has(vlastnik)
}

const vyzadujMastera = (me) => {
  if (me.role !== "master") throw new Error("jen master")
}

// ---- koncové body ----
const listForCoach = (me) => VYPLNENI.filter((d) => filtrViditelnosti(me)(d.coachId)).map((d) => d.id)
const getForCoach = (me, id) => {
  const d = VYPLNENI.find((x) => x.id === id)
  if (!d) return null
  return filtrViditelnosti(me)(d.coachId) ? d.id : null
}
const removeForCoach = (me, id) => {
  const d = VYPLNENI.find((x) => x.id === id)
  if (!d) return "ok"
  if (!filtrViditelnosti(me)(d.coachId)) throw new Error("cizí větev")
  return "ok"
}
const normStats = (me) => {
  vyzadujMastera(me)
  return "data norem"
}
const externalUsage = (me) => {
  vyzadujMastera(me)
  return "přehled větví"
}

let chyb = 0
const rekni = (ok, text) => {
  if (!ok) chyb++
  console.log(`${ok ? "OK   " : "CHYBA"} ${text}`)
}
const hodi = (fn) => {
  try {
    fn()
    return false
  } catch {
    return true
  }
}

console.log("– seznam vyplnění –")
rekni(
  JSON.stringify(listForCoach(KOUCI.M)) === JSON.stringify(["v-stare", "v-master", "v-kouc", "v-kouc2"]),
  "master vidí celou naši větev včetně starých, ne externí",
)
rekni(JSON.stringify(listForCoach(KOUCI.K)) === JSON.stringify(["v-kouc"]), "náš kouč vidí jen své klienty")
rekni(JSON.stringify(listForCoach(KOUCI.K2)) === JSON.stringify(["v-kouc2"]), "druhý náš kouč vidí jen své klienty")
rekni(JSON.stringify(listForCoach(KOUCI.E1)) === JSON.stringify(["v-e1"]), "externí 1 vidí jen své")
rekni(JSON.stringify(listForCoach(KOUCI.E2)) === JSON.stringify(["v-e2"]), "externí 2 vidí jen své")

console.log("\n– detail na přímý dotaz (uhodnuté id) –")
rekni(getForCoach(KOUCI.E1, "v-master") === null, "externí nedostane naše vyplnění")
rekni(getForCoach(KOUCI.E1, "v-stare") === null, "externí nedostane ani stará vyplnění")
rekni(getForCoach(KOUCI.E1, "v-e2") === null, "externí nedostane vyplnění druhého externího")
rekni(getForCoach(KOUCI.E1, "v-e1") === "v-e1", "externí dostane své vlastní")
rekni(getForCoach(KOUCI.M, "v-e1") === null, "master nedostane vyplnění externího")
rekni(getForCoach(KOUCI.K, "v-e1") === null, "náš kouč nedostane vyplnění externího")
rekni(getForCoach(KOUCI.K, "v-kouc2") === null, "náš kouč nedostane klienta jiného našeho kouče")
rekni(getForCoach(KOUCI.K, "v-master") === null, "náš kouč nedostane klienta mastera")
rekni(getForCoach(KOUCI.K, "v-stare") === null, "náš kouč nedostane staré vyplnění bez vlastníka")
rekni(getForCoach(KOUCI.K, "v-kouc") === "v-kouc", "náš kouč dostane svého klienta")
rekni(getForCoach(KOUCI.M, "v-kouc2") === "v-kouc2", "master dostane klienta kteréhokoli našeho kouče")

console.log("\n– mazání –")
rekni(hodi(() => removeForCoach(KOUCI.E1, "v-master")), "externí nesmaže naše vyplnění")
rekni(hodi(() => removeForCoach(KOUCI.M, "v-e1")), "master nesmaže vyplnění externího")
rekni(removeForCoach(KOUCI.E1, "v-e1") === "ok", "externí smaže své vlastní")
rekni(hodi(() => removeForCoach(KOUCI.K, "v-kouc2")), "náš kouč nesmaže klienta jiného kouče")
rekni(removeForCoach(KOUCI.K, "v-kouc") === "ok", "náš kouč smaže svého klienta")
rekni(removeForCoach(KOUCI.M, "v-kouc2") === "ok", "master smaže klienta kteréhokoli našeho kouče")

console.log("\n– normy a přehled větví –")
rekni(hodi(() => normStats(KOUCI.E1)), "externí nevidí na normy")
rekni(hodi(() => normStats(KOUCI.K)), "náš kouč nevidí na normy")
rekni(normStats(KOUCI.M) === "data norem", "master na normy vidí")
rekni(hodi(() => externalUsage(KOUCI.K)), "náš kouč nevidí přehled větví")
rekni(hodi(() => externalUsage(KOUCI.E1)), "externí nevidí přehled větví")
rekni(externalUsage(KOUCI.M) === "přehled větví", "master přehled větví vidí")

// ---------------------------------------------------------------------------
// Životní cyklus: pozvánka → vyplnění → viditelnost.
//
// Filtr výš pracuje s hotovými daty. Tady jde o to, jestli vlastník vůbec
// vzniká správně, protože to rozhoduje o všech BUDOUCÍCH vyplněních.
// ---------------------------------------------------------------------------

/** convex/eliteDiagnostic.ts: createInvite */
const createInvite = (me) => ({ coachId: me.id })

/** convex/eliteDiagnostic.ts: submitWithInvite – vyplnění dědí vlastníka. */
const submitWithInvite = (pozvanka) => ({ coachId: pozvanka.coachId })

console.log("\n– budoucí vyplnění: pozvánka předá vlastníka –")
for (const [kdo, popis] of [
  ["M", "master"],
  ["K", "náš kouč"],
]) {
  const vyplneni = submitWithInvite(createInvite(KOUCI[kdo]))
  rekni(vyplneni.coachId === kdo, `pozvánka od ${popis} dá vyplnění vlastníka ${kdo}`)
  rekni(!filtrViditelnosti(KOUCI.E1)(vyplneni.coachId), `externí na ně nevidí (${popis})`)
  rekni(!filtrViditelnosti(KOUCI.E2)(vyplneni.coachId), `druhý externí na ně nevidí (${popis})`)
  rekni(filtrViditelnosti(KOUCI.M)(vyplneni.coachId), `master na ně vidí (${popis})`)
  rekni(
    filtrViditelnosti(KOUCI.K)(vyplneni.coachId) === (kdo === "K"),
    `náš kouč na ně vidí jen když jsou jeho (${popis})`,
  )
}

const odExterniho = submitWithInvite(createInvite(KOUCI.E1))
rekni(odExterniho.coachId === "E1", "pozvánka od externího dá vyplnění vlastníka E1")
rekni(filtrViditelnosti(KOUCI.E1)(odExterniho.coachId), "externí na své budoucí vyplnění vidí")
rekni(!filtrViditelnosti(KOUCI.M)(odExterniho.coachId), "master na jeho budoucí vyplnění nevidí")

console.log("\n– stará pozvánka bez vlastníka, vyplněná až teď –")
// Odkazy rozeslané před zavedením vlastnictví vlastníka nemají. Když je klient
// vyplní až po nasazení, vyplnění zůstane bez vlastníka, tedy naše.
const zeStarePozvanky = submitWithInvite({ coachId: undefined })
rekni(zeStarePozvanky.coachId === undefined, "vyplnění ze staré pozvánky nemá vlastníka")
rekni(filtrViditelnosti(KOUCI.M)(zeStarePozvanky.coachId), "master na ně vidí")
rekni(!filtrViditelnosti(KOUCI.E1)(zeStarePozvanky.coachId), "externí na ně nevidí")
rekni(!filtrViditelnosti(KOUCI.K)(zeStarePozvanky.coachId), "náš kouč na ně nevidí, vlastníka nemají")

// ---------------------------------------------------------------------------
// Týmová větev: hráč rozhoduje, jestli kouč na jeho vyhodnocení uvidí.
// ---------------------------------------------------------------------------
//
// Klub vede externí kouč, takže do jeho větve nevidí nikdo od nás. Uvnitř
// větve je ale ještě druhé síto: hráč si při odesílání volí, jestli kouč smí
// k jeho vyhodnocení. Odmítnutí musí platit i proti tomu, kdo pozvánku
// vystavil, jinak by ta volba byla na oko.

console.log("\n– týmová větev: souhlas hráče –")

/** convex/eliteDiagnostic.ts: sdileno() */
const sdileno = (d) => d.sdilet !== false

const TYMOVA = [
  { id: "t-sdili", coachId: "E1", teamId: "T1", sdilet: true },
  { id: "t-nesdili", coachId: "E1", teamId: "T1", sdilet: false },
]

const listProKouce = (me) =>
  TYMOVA.filter((d) => filtrViditelnosti(me)(d.coachId) && sdileno(d)).map((d) => d.id)
const getProKouce = (me, id) => {
  const d = TYMOVA.find((x) => x.id === id)
  if (!d) return null
  return filtrViditelnosti(me)(d.coachId) && sdileno(d) ? d.id : null
}

rekni(JSON.stringify(listProKouce(KOUCI.E1)) === JSON.stringify(["t-sdili"]), "kouč týmu vidí jen sdílená vyhodnocení")
rekni(getProKouce(KOUCI.E1, "t-nesdili") === null, "kouč nedostane nesdílené ani na přímý dotaz")
rekni(getProKouce(KOUCI.E1, "t-sdili") === "t-sdili", "kouč dostane sdílené")
rekni(getProKouce(KOUCI.M, "t-sdili") === null, "master nedostane ani sdílené vyplnění hráče")
rekni(getProKouce(KOUCI.M, "t-nesdili") === null, "master nedostane nesdílené vyplnění hráče")
rekni(getProKouce(KOUCI.K, "t-sdili") === null, "náš kouč do klubu nevidí")

// Do souhrnu týmu vstupují obě vyplnění; na tom právě stojí, že se dá tým
// vyhodnotit, i když se část hráčů kouči neotevře.
const doSouhrnu = TYMOVA.filter((d) => d.teamId === "T1").length
rekni(doSouhrnu === 2, "do souhrnu týmu jde i vyplnění, které hráč nesdílel")

// ---------------------------------------------------------------------------
// Klubový kouč: jen týmové odkazy a jen Players Survey
// ---------------------------------------------------------------------------
//
// Zúžení se hlídá na serveru, ne schovaným tlačítkem. Kdyby stačilo skrýt
// záložku, dala by se funkce zavolat přímo a kouč by si vystavil pozvánku
// na kterýkoli test.

console.log("\n– klubový kouč –")

const KLUBOVY = { id: "E3", role: "external", pouzeTymy: true }
const PLNY = { id: "E1", role: "external" }

/** convex/eliteDiagnostic.ts: createInvite se zvoleným testem */
const obecnaPozvanka = (me, testId) => {
  if (me.pouzeTymy === true) throw new Error("jen týmové odkazy")
  if (!["elite200-sport", "vzorce", "archetypy"].includes(testId)) throw new Error("neznámý test")
  return { coachId: me.id, testId }
}

/** convex/teams.ts: createPlayerInvite – test se nezadává, je vždycky týž. */
const createPlayerInvite = (me) => ({ coachId: me.id, testId: "elite200-sport" })

rekni(hodi(() => obecnaPozvanka(KLUBOVY, "vzorce")), "klubový kouč nevystaví obecnou pozvánku")
rekni(hodi(() => obecnaPozvanka(KLUBOVY, "elite200-sport")), "nevystaví ji ani na Players Survey")
rekni(createPlayerInvite(KLUBOVY).testId === "elite200-sport", "hráči vystaví odkaz na Players Survey")
rekni(obecnaPozvanka(PLNY, "vzorce").testId === "vzorce", "externí kouč s plným přístupem vybírá dál")

console.log(chyb === 0 ? "\nizolace větví sedí" : `\nNALEZENO CHYB: ${chyb}`)
process.exit(chyb === 0 ? 0 : 1)
