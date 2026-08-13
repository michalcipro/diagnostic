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
  E1: { id: "E1", role: "external" },
  E2: { id: "E2", role: "external" },
}

// vyplnění a pozvánky; vlastník undefined = záznam z doby před externími kouči
const VYPLNENI = [
  { id: "v-stare", coachId: undefined },
  { id: "v-master", coachId: "M" },
  { id: "v-kouc", coachId: "K" },
  { id: "v-e1", coachId: "E1" },
  { id: "v-e2", coachId: "E2" },
]

/** convex/sessions.ts: filtrViditelnosti */
function filtrViditelnosti(me) {
  if (me.role === "external") return (vlastnik) => vlastnik === me.id
  const externi = new Set(
    Object.values(KOUCI).filter((c) => c.role === "external").map((c) => c.id),
  )
  return (vlastnik) => vlastnik === undefined || !externi.has(vlastnik)
}

const vyzadujMastera = (me) => {
  if (me.role !== "master") throw new Error("jen master")
}
const odmitniExterniho = (me) => {
  if (me.role === "external") throw new Error("externí sem nesmí")
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
  odmitniExterniho(me)
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

console.log("— seznam vyplnění —")
rekni(
  JSON.stringify(listForCoach(KOUCI.M)) === JSON.stringify(["v-stare", "v-master", "v-kouc"]),
  "master vidí naše a stará, ne externí",
)
rekni(
  JSON.stringify(listForCoach(KOUCI.K)) === JSON.stringify(["v-stare", "v-master", "v-kouc"]),
  "náš kouč vidí naše a stará, ne externí",
)
rekni(JSON.stringify(listForCoach(KOUCI.E1)) === JSON.stringify(["v-e1"]), "externí 1 vidí jen své")
rekni(JSON.stringify(listForCoach(KOUCI.E2)) === JSON.stringify(["v-e2"]), "externí 2 vidí jen své")

console.log("\n— detail na přímý dotaz (uhodnuté id) —")
rekni(getForCoach(KOUCI.E1, "v-master") === null, "externí nedostane naše vyplnění")
rekni(getForCoach(KOUCI.E1, "v-stare") === null, "externí nedostane ani stará vyplnění")
rekni(getForCoach(KOUCI.E1, "v-e2") === null, "externí nedostane vyplnění druhého externího")
rekni(getForCoach(KOUCI.E1, "v-e1") === "v-e1", "externí dostane své vlastní")
rekni(getForCoach(KOUCI.M, "v-e1") === null, "master nedostane vyplnění externího")
rekni(getForCoach(KOUCI.K, "v-e1") === null, "náš kouč nedostane vyplnění externího")

console.log("\n— mazání —")
rekni(hodi(() => removeForCoach(KOUCI.E1, "v-master")), "externí nesmaže naše vyplnění")
rekni(hodi(() => removeForCoach(KOUCI.M, "v-e1")), "master nesmaže vyplnění externího")
rekni(removeForCoach(KOUCI.E1, "v-e1") === "ok", "externí smaže své vlastní")

console.log("\n— normy a přehled větví —")
rekni(hodi(() => normStats(KOUCI.E1)), "externí nevidí na naše normy")
rekni(normStats(KOUCI.K) === "data norem", "náš kouč na normy vidí")
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

console.log("\n— budoucí vyplnění: pozvánka předá vlastníka —")
for (const [kdo, popis] of [
  ["M", "master"],
  ["K", "náš kouč"],
]) {
  const vyplneni = submitWithInvite(createInvite(KOUCI[kdo]))
  rekni(vyplneni.coachId === kdo, `pozvánka od ${popis} dá vyplnění vlastníka ${kdo}`)
  rekni(!filtrViditelnosti(KOUCI.E1)(vyplneni.coachId), `externí na ně nevidí (${popis})`)
  rekni(!filtrViditelnosti(KOUCI.E2)(vyplneni.coachId), `druhý externí na ně nevidí (${popis})`)
  rekni(filtrViditelnosti(KOUCI.M)(vyplneni.coachId), `master na ně vidí (${popis})`)
  rekni(filtrViditelnosti(KOUCI.K)(vyplneni.coachId), `náš kouč na ně vidí (${popis})`)
}

const odExterniho = submitWithInvite(createInvite(KOUCI.E1))
rekni(odExterniho.coachId === "E1", "pozvánka od externího dá vyplnění vlastníka E1")
rekni(filtrViditelnosti(KOUCI.E1)(odExterniho.coachId), "externí na své budoucí vyplnění vidí")
rekni(!filtrViditelnosti(KOUCI.M)(odExterniho.coachId), "master na jeho budoucí vyplnění nevidí")

console.log("\n— stará pozvánka bez vlastníka, vyplněná až teď —")
// Odkazy rozeslané před zavedením vlastnictví vlastníka nemají. Když je klient
// vyplní až po nasazení, vyplnění zůstane bez vlastníka, tedy naše.
const zeStarePozvanky = submitWithInvite({ coachId: undefined })
rekni(zeStarePozvanky.coachId === undefined, "vyplnění ze staré pozvánky nemá vlastníka")
rekni(filtrViditelnosti(KOUCI.M)(zeStarePozvanky.coachId), "master na ně vidí")
rekni(!filtrViditelnosti(KOUCI.E1)(zeStarePozvanky.coachId), "externí na ně nevidí")

console.log(chyb === 0 ? "\nizolace větví sedí" : `\nNALEZENO CHYB: ${chyb}`)
process.exit(chyb === 0 ? 0 : 1)
