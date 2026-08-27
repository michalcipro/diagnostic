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
// Týmová větev: tým, který vede master sám
// ---------------------------------------------------------------------------
//
// Master smí u týmu dosadit sám sebe jako kouče, protože některé týmy vedeme
// my. Tím se ale nemění pravidlo, jen role: k vyhodnocení se dostane jako kouč
// toho týmu, ne jako master. Souhlas hráče na to sedí – hráč souhlasí se
// sdílením s koučem svého týmu, a tím je v tu chvíli on.
//
// Co se změnit nesmí: odmítnuté sdílení platí i proti němu, a do cizích týmů
// nevidí ani nadále.

console.log("\n– týmová větev: tým vede master sám –")

const TYMOVA_MASTERA = [
  { id: "tm-sdili", coachId: "M", teamId: "T2", sdilet: true },
  { id: "tm-nesdili", coachId: "M", teamId: "T2", sdilet: false },
]

const getZTymuMastera = (me, id) => {
  const d = TYMOVA_MASTERA.find((x) => x.id === id)
  if (!d) return null
  return filtrViditelnosti(me)(d.coachId) && sdileno(d) ? d.id : null
}

rekni(getZTymuMastera(KOUCI.M, "tm-sdili") === "tm-sdili", "u vlastního týmu master sdílené vyhodnocení dostane")
rekni(getZTymuMastera(KOUCI.M, "tm-nesdili") === null, "odmítnuté sdílení platí i proti masterovi")
rekni(getProKouce(KOUCI.M, "t-sdili") === null, "do cizího týmu master pořád nevidí")
rekni(getZTymuMastera(KOUCI.E1, "tm-sdili") === null, "externí kouč do týmu mastera nevidí")

/**
 * convex/teams.ts: createTeam a setTeamCoach
 *
 * Do čela týmu smí externí kouč, nebo master sám sebe. Nikdo jiný: náš interní
 * kouč do týmové větve nepatří a cizího mastera dosadit nejde.
 */
const smiVest = (me, kouc) => {
  vyzadujMastera(me)
  if (kouc.id === me.id) return true
  if (kouc.role !== "external") throw new Error("Tým může vést externí kouč, nebo ty sám.")
  return true
}

rekni(smiVest(KOUCI.M, KOUCI.E1) === true, "do čela týmu smí externí kouč")
rekni(smiVest(KOUCI.M, KOUCI.M) === true, "master smí dosadit sám sebe")
rekni(hodi(() => smiVest(KOUCI.M, KOUCI.K)), "náš interní kouč tým vést nemůže")
rekni(hodi(() => smiVest(KOUCI.E1, KOUCI.E1)), "externí kouč si tým sám nepřiřadí")

/**
 * convex/teams.ts: setTeamCoach
 *
 * Kouče lze měnit jen do prvního odevzdaného dotazníku. Potom už za sdílením
 * stojí souhlas hráče, který platil konkrétnímu kouči; vyměnit ho pod rukou by
 * z toho souhlasu udělalo prázdné slovo.
 */
const zmenKouce = (me, tym, kouc) => {
  smiVest(me, kouc)
  if (tym.odevzdano > 0) throw new Error("Kouče jde změnit jen do prvního odevzdaného dotazníku.")
  return { ...tym, coachId: kouc.id }
}

rekni(
  zmenKouce(KOUCI.M, { coachId: "E1", odevzdano: 0 }, KOUCI.M).coachId === "M",
  "dokud nikdo neodevzdal, jde tým převzít",
)
rekni(
  hodi(() => zmenKouce(KOUCI.M, { coachId: "E1", odevzdano: 1 }, KOUCI.M)),
  "po prvním odevzdání se kouč vyměnit nedá",
)

// ---------------------------------------------------------------------------
// Hotová diagnostika dopočítaná do týmu
// ---------------------------------------------------------------------------
//
// Hráči někdy diagnostiku vyplnili dřív, jako naši klienti, a tým vzniká až
// potom. Hotové vyplnění se proto dá do souhrnu týmu dopočítat. Hlídá se u toho
// trojí: dělá to jen master, jen s vyplněními ze své větve, a jen s elite200.
//
// Nejdůležitější ale je, co se tím NEotevře. Klient souhlasil s prací s námi,
// ne s cizím klubem. Do souhrnu vstoupí, na soupisku ne – a protože soupiska
// stojí na pozvánkách a tohle žádnou nemá, není to potřeba nikde vypínat.

console.log("\n– hotová diagnostika dopočítaná do týmu –")

/** convex/teams.ts: addExistingToTeam */
const smiDopocitat = (me, vyplneni) => {
  vyzadujMastera(me)
  if (!filtrViditelnosti(me)(vyplneni.coachId)) throw new Error("cizí větev")
  if (vyplneni.model !== "elite200") throw new Error("jen elite200")
  if (vyplneni.teamId !== undefined) throw new Error("už patří týmu")
  return { ...vyplneni, teamId: "T3" }
}

const NAS_KLIENT = { id: "d-nas", coachId: "K", model: "elite200", teamId: undefined }
const KRATKY = { id: "d-kratky", coachId: "K", model: "elite100", teamId: undefined }
const CIZI = { id: "d-cizi", coachId: "E1", model: "elite200", teamId: undefined }
const UZ_V_TYMU = { id: "d-zabrany", coachId: "K", model: "elite200", teamId: "T1" }

rekni(smiDopocitat(KOUCI.M, NAS_KLIENT).teamId === "T3", "vyplnění z naší větve jde do týmu dopočítat")
rekni(hodi(() => smiDopocitat(KOUCI.M, KRATKY)), "elite100 se dopočítat nedá, nemá jednadvacet částí")
rekni(hodi(() => smiDopocitat(KOUCI.M, CIZI)), "vyplnění externího kouče master do týmu nepřetáhne")
rekni(hodi(() => smiDopocitat(KOUCI.M, UZ_V_TYMU)), "hráče jinému týmu vzít nejde")
rekni(hodi(() => smiDopocitat(KOUCI.K, NAS_KLIENT)), "náš kouč dopočítávat nesmí")
rekni(hodi(() => smiDopocitat(KOUCI.E1, NAS_KLIENT)), "klubový kouč si naše klienty do týmu nenatáhne")

/**
 * convex/teams.ts: listPlayers staví soupisku z pozvánek.
 *
 * Dopočítané vyplnění žádnou pozvánku nemá, takže se na soupisku nedostane.
 * Tím je zaručeno, že se k němu klubový kouč nedostane ani jako vlastník týmu.
 */
const soupiska = (pozvanky) => pozvanky.map((p) => p.resultId)
const POZVANKY_T3 = [{ resultId: "t-sdili" }]
rekni(!soupiska(POZVANKY_T3).includes("d-nas"), "dopočítané vyplnění není na soupisce")

/**
 * convex/teams.ts: pocty a teamReport
 *
 * Do „odevzdáno z rozeslaných" se dopočítaní musí připočíst na obou stranách.
 * Jinak by tým složený jen z hotových diagnostik hlásil „odevzdáno deset
 * z nuly rozeslaných".
 */
const pocty = (pozvanky, vTymu) => {
  const zPozvanek = new Set(pozvanky.filter((p) => p.resultId).map((p) => p.resultId))
  const dopocitanych = vTymu.filter((id) => !zPozvanek.has(id)).length
  return {
    pozvano: pozvanky.length + dopocitanych,
    odevzdano: pozvanky.filter((p) => p.usedAt !== undefined).length + dopocitanych,
  }
}

const bezPozvanek = pocty([], ["d-1", "d-2", "d-3"])
rekni(
  bezPozvanek.pozvano === 3 && bezPozvanek.odevzdano === 3,
  "tým jen z hotových diagnostik hlásí tři ze tří",
)
const smisene = pocty([{ resultId: "t-sdili", usedAt: 1 }, { usedAt: undefined }], ["t-sdili", "d-1"])
rekni(
  smisene.pozvano === 3 && smisene.odevzdano === 2,
  "u smíšeného týmu se dopočítaní přičtou, pozvánka bez odevzdání ne",
)

// ---------------------------------------------------------------------------
// Klubový kouč: jen týmové odkazy a jen Players Survey
// ---------------------------------------------------------------------------
//
// Zúžení se hlídá na serveru, ne schovaným tlačítkem. Kdyby stačilo skrýt
// záložku, dala by se funkce zavolat přímo a kouč by si vystavil pozvánku
// na kterýkoli test.

console.log("\n– klubový kouč –")

/** convex/sessions.ts: jeKlubovy – chybějící hodnota znamená klubový. */
const jeKlubovy = (c) => c.role === "external" && c.pouzeTymy !== false

const KLUBOVY = { id: "E3", role: "external", pouzeTymy: true }
const BEZ_NASTAVENI = { id: "E4", role: "external" }
const PLNY = { id: "E1", role: "external", pouzeTymy: false }
const NAS = { id: "K", role: "coach" }

/** convex/eliteDiagnostic.ts: createInvite se zvoleným testem */
const obecnaPozvanka = (me, testId) => {
  if (jeKlubovy(me)) throw new Error("jen týmové odkazy")
  if (!["elite200-sport", "vzorce", "archetypy"].includes(testId)) throw new Error("neznámý test")
  return { coachId: me.id, testId }
}

/** convex/teams.ts: createPlayerInvite – test se nezadává, je vždycky týž. */
const createPlayerInvite = (me) => ({ coachId: me.id, testId: "elite200-sport" })

rekni(hodi(() => obecnaPozvanka(KLUBOVY, "vzorce")), "klubový kouč nevystaví obecnou pozvánku")
rekni(hodi(() => obecnaPozvanka(KLUBOVY, "elite200-sport")), "nevystaví ji ani na Players Survey")
rekni(createPlayerInvite(KLUBOVY).testId === "elite200-sport", "hráči vystaví odkaz na Players Survey")
rekni(obecnaPozvanka(PLNY, "vzorce").testId === "vzorce", "externí kouč s plným přístupem vybírá dál")
rekni(hodi(() => obecnaPozvanka(BEZ_NASTAVENI, "vzorce")), "externí účet bez nastavení je klubový, ne plný")
rekni(obecnaPozvanka(NAS, "vzorce").testId === "vzorce", "našeho kouče se omezení netýká")

console.log(chyb === 0 ? "\nizolace větví sedí" : `\nNALEZENO CHYB: ${chyb}`)
process.exit(chyb === 0 ? 0 : 1)
