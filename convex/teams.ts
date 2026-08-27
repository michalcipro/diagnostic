import { ConvexError, v } from "convex/values"
import { mutation, query } from "./_generated/server"
import type { QueryCtx } from "./_generated/server"
import type { Id } from "./_generated/dataModel"
import {
  filtrViditelnosti,
  requireCoach,
  requireCoachProZapis,
  vyzadujMastera,
  zaznamenejPristup,
} from "./sessions"
import { MEZ, PLATNOST_POZVANKY_DNI, delka } from "./eliteDiagnostic"
import { makeToken } from "./nahoda"
import { evaluate } from "../lib/diagnostic/scoring"
import { getStructure } from "../lib/diagnostic/structure"
import { tymovyProfil } from "../lib/tym/agregace"

// ─────────────────────────────────────────────────────────────────────────────
// Týmy a kluby.
//
// Vedle koučování jednotlivců stojí druhá větev: klub dostane svého kouče, ten
// rozešle hráčům odkazy a pracuje s tím, co mu hráči dovolí vidět.
//
// KDO CO VIDÍ
//   hráč    – své vlastní vyhodnocení, hned po odeslání
//   kouč    – vyhodnocení hráčů, kteří sdílení povolili, a u všech štítků
//             stav vyplnění; navíc souhrnný profil týmu
//   master  – název týmu, počty a souhrnný profil týmu. Do vyplnění
//             jednotlivých hráčů nevidí, ani do sdílených.
//
// ŠTÍTKY. Kouč si hráče pojmenuje sám, třeba Player 1 až 24. Přiřazení štítku
// ke konkrétnímu člověku drží on, v aplikaci nikde není. Hráč si při vyplňování
// štítek buď nechá, nebo místo něj napíše svoje jméno; tím se rozhoduje, jestli
// ho kouč uvidí jmenovitě. Vůči nám je anonymní tak jako tak.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Jediný test, který se v týmové větvi zadává.
 *
 * Klub si nevybírá z nabídky: dostane Players Survey a nic jiného. Kdyby si
 * kouč mohl zvolit, dostali by hráči napříč kluby různé dotazníky a týmové
 * profily by se nedaly srovnávat.
 */
export const TEST_TYMU = "elite200-sport"

/** Slovenština se v týmové větvi nenabízí. */
const JAZYKY_TYMU = new Set(["cs", "en"])

const tymVerejny = v.object({
  id: v.id("teams"),
  nazev: v.string(),
  coachId: v.id("coaches"),
  coachName: v.string(),
  active: v.boolean(),
  note: v.optional(v.string()),
  createdAt: v.number(),
  pozvano: v.number(),
  odevzdano: v.number(),
  /** vede ho přihlášený master sám, takže u něj má práva kouče */
  veduJa: v.boolean(),
})

/**
 * Založení týmu.
 *
 * Obvykle ho vede externí kouč: klub je cizí organizace a jeho hráči nejsou
 * naši klienti. Master ale smí dosadit sám sebe, protože některé týmy vedeme
 * my. V tu chvíli je u toho týmu v roli kouče se vším, co k tomu patří:
 * vystavuje odkazy a vidí do sdílených vyhodnocení. Cizího mastera dosadit
 * nejde, jen sebe.
 */
export const createTeam = mutation({
  args: {
    sessionToken: v.string(),
    nazev: v.string(),
    coachId: v.id("coaches"),
    note: v.optional(v.string()),
  },
  returns: v.object({ id: v.id("teams") }),
  handler: async (ctx, args) => {
    const me = await requireCoachProZapis(ctx, args.sessionToken)
    vyzadujMastera(me)

    const nazev = args.nazev.trim()
    if (nazev.length < 2) throw new ConvexError("Zadej název týmu.")
    delka(nazev, MEZ.jmeno, "Název týmu")
    delka(args.note, MEZ.poznamka, "Poznámka")

    const kouc = await ctx.db.get(args.coachId)
    if (!kouc) throw new ConvexError("Takový kouč neexistuje.")
    if (String(args.coachId) !== String(me._id) && kouc.role !== "external") {
      throw new ConvexError("Tým může vést externí kouč, nebo ty sám.")
    }

    const id = await ctx.db.insert("teams", {
      nazev,
      coachId: args.coachId,
      note: args.note?.trim() || undefined,
      active: true,
      createdAt: Date.now(),
    })
    return { id }
  },
})

/**
 * Změna kouče u už založeného týmu.
 *
 * Jde jen do prvního odevzdaného dotazníku. Hráč před odesláním souhlasí
 * s tím, že do jeho vyhodnocení uvidí kouč jeho týmu; vyměnit toho kouče až
 * potom by z toho souhlasu udělalo prázdné slovo. Do té doby je to jen oprava
 * překlepu při zakládání, protože zatím není co ukázat.
 */
export const setTeamCoach = mutation({
  args: { sessionToken: v.string(), teamId: v.id("teams"), coachId: v.id("coaches") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const me = await requireCoachProZapis(ctx, args.sessionToken)
    vyzadujMastera(me)

    const tym = await ctx.db.get(args.teamId)
    if (!tym) throw new ConvexError("Takový tým neexistuje.")

    const kouc = await ctx.db.get(args.coachId)
    if (!kouc) throw new ConvexError("Takový kouč neexistuje.")
    if (String(args.coachId) !== String(me._id) && kouc.role !== "external") {
      throw new ConvexError("Tým může vést externí kouč, nebo ty sám.")
    }

    if (String(tym.coachId) === String(args.coachId)) return null

    const { odevzdano } = await pocty(ctx, args.teamId)
    if (odevzdano > 0) {
      throw new ConvexError(
        "Kouče jde změnit jen do prvního odevzdaného dotazníku. Hráči už sdílení potvrdili tomuhle kouči.",
      )
    }

    await ctx.db.patch(args.teamId, { coachId: args.coachId })

    // Rozeslané odkazy si nesou vlastníka, a ten se propíše do odevzdaného
    // vyplnění. Kdyby zůstal starý kouč, viděl by do výsledků týmu, který už
    // nevede, a nový kouč by je naopak neotevřel. Odevzdáno zatím nic není,
    // takže se dají všechny přepsat.
    const pozvanky = await ctx.db
      .query("invitations")
      .withIndex("by_team", (q) => q.eq("teamId", args.teamId))
      .collect()
    for (const p of pozvanky) await ctx.db.patch(p._id, { coachId: args.coachId })

    return null
  },
})

/** Zapnutí a vypnutí týmu. Vypnutý tým nepřijímá nové pozvánky. */
export const setTeamActive = mutation({
  args: { sessionToken: v.string(), teamId: v.id("teams"), active: v.boolean() },
  returns: v.null(),
  handler: async (ctx, args) => {
    vyzadujMastera(await requireCoachProZapis(ctx, args.sessionToken))
    await ctx.db.patch(args.teamId, { active: args.active })
    return null
  },
})

/**
 * Přehled týmů pro mastera.
 *
 * Vrací název, kouče a počty. Žádný štítek hráče, žádné jméno ani vyhodnocení:
 * do vyplnění jednotlivých hráčů master nevidí a tenhle seznam na tom nic
 * nemění.
 */
export const listTeams = query({
  args: { sessionToken: v.string() },
  returns: v.array(tymVerejny),
  handler: async (ctx, args) => {
    const me = await requireCoach(ctx, args.sessionToken)
    vyzadujMastera(me)
    const tymy = await ctx.db.query("teams").withIndex("by_created").order("desc").collect()
    const jmena = new Map<string, string>()
    for (const c of await ctx.db.query("coaches").collect()) jmena.set(String(c._id), c.name)

    const out = []
    for (const t of tymy) {
      out.push({
        id: t._id,
        nazev: t.nazev,
        coachId: t.coachId,
        coachName: jmena.get(String(t.coachId)) ?? "neznámý účet",
        active: t.active,
        note: t.note,
        createdAt: t.createdAt,
        veduJa: String(t.coachId) === String(me._id),
        ...(await pocty(ctx, t._id)),
      })
    }
    return out
  },
})

/**
 * Kolik štítků je rozeslaných a kolik jich má odevzdáno.
 *
 * Do obou čísel se počítají i vyplnění dopočítaná z hotových diagnostik. Ta
 * pozvánku nemají, ale v profilu týmu jsou, takže by bez nich hlavička hlásila
 * „odevzdáno 0 z 0" u týmu, který má profil z deseti lidí.
 */
async function pocty(ctx: QueryCtx, teamId: Id<"teams">): Promise<{ pozvano: number; odevzdano: number }> {
  const pozvanky = await ctx.db
    .query("invitations")
    .withIndex("by_team", (q) => q.eq("teamId", teamId))
    .collect()
  const dopocitane = await pocetDopocitanych(ctx, teamId, pozvanky)
  return {
    pozvano: pozvanky.length + dopocitane,
    odevzdano: pozvanky.filter((p) => p.usedAt !== undefined).length + dopocitane,
  }
}

/** Kolik vyplnění v týmu nevzniklo z pozvánky, ale dopočítáním. */
async function pocetDopocitanych(
  ctx: QueryCtx,
  teamId: Id<"teams">,
  pozvanky: { resultId?: Id<"eliteDiagnosticResults"> }[],
): Promise<number> {
  const zPozvanek = new Set(pozvanky.filter((p) => p.resultId).map((p) => String(p.resultId)))
  const vyplneni = await ctx.db
    .query("eliteDiagnosticResults")
    .withIndex("by_team", (q) => q.eq("teamId", teamId))
    .collect()
  return vyplneni.filter((d) => !zPozvanek.has(String(d._id))).length
}

/** Týmy, které vede přihlášený kouč. */
export const mojeTymy = query({
  args: { sessionToken: v.string() },
  returns: v.array(
    v.object({
      id: v.id("teams"),
      nazev: v.string(),
      active: v.boolean(),
      pozvano: v.number(),
      odevzdano: v.number(),
    }),
  ),
  handler: async (ctx, args) => {
    const me = await requireCoach(ctx, args.sessionToken)
    const tymy = await ctx.db
      .query("teams")
      .withIndex("by_coach", (q) => q.eq("coachId", me._id))
      .collect()
    const out = []
    for (const t of tymy) {
      out.push({ id: t._id, nazev: t.nazev, active: t.active, ...(await pocty(ctx, t._id)) })
    }
    return out
  },
})

/**
 * Odkaz pro jednoho hráče.
 *
 * Test se nezadává, je vždycky týž. Štítek je to, co si kouč zvolil; hráči se
 * předvyplní do pole se jménem, takže si ho může nechat, nebo přepsat.
 */
export const createPlayerInvite = mutation({
  args: {
    sessionToken: v.string(),
    teamId: v.id("teams"),
    stitek: v.string(),
    lang: v.string(),
  },
  returns: v.object({ token: v.string() }),
  handler: async (ctx, args) => {
    const me = await requireCoachProZapis(ctx, args.sessionToken)
    const tym = await ctx.db.get(args.teamId)
    if (!tym) throw new ConvexError("Takový tým neexistuje.")
    if (String(tym.coachId) !== String(me._id)) {
      throw new ConvexError("Tenhle tým nevedeš.")
    }
    if (!tym.active) throw new ConvexError("Tým je vypnutý, nové odkazy vystavit nejdou.")

    const stitek = args.stitek.trim()
    if (!stitek) throw new ConvexError("Zadej označení hráče.")
    delka(stitek, MEZ.jmeno, "Označení hráče")

    const token = makeToken()
    const now = Date.now()
    await ctx.db.insert("invitations", {
      token,
      testId: TEST_TYMU,
      lang: JAZYKY_TYMU.has(args.lang) ? args.lang : "en",
      clientName: stitek,
      coachId: me._id,
      teamId: args.teamId,
      createdAt: now,
      expiresAt: now + PLATNOST_POZVANKY_DNI * 24 * 60 * 60 * 1000,
    })
    await zaznamenejPristup(ctx, me._id, "vytvoreni-pozvanky")
    return { token }
  },
})

// ─────────────────────────────────────────────────────────────────────────────
// Hotová diagnostika, kterou chceme dopočítat do týmu
// ─────────────────────────────────────────────────────────────────────────────
//
// Běžná cesta je pozvánka: kouč vystaví odkaz, hráč vyplní, vyplnění se rovnou
// váže na tým. Někdy ale hráči diagnostiku vyplnili dřív, jako naši klienti,
// a tým vzniká až potom. Přeposílat jim dotazník znovu je nesmysl, takže se
// hotové vyplnění dá do týmu dopočítat.
//
// Co to znamená a co ne:
//
//   – Do souhrnu týmu vyplnění vstoupí. To je celé, oč tu jde.
//   – Na soupisku se nedostane. Soupiska se skládá z pozvánek a tohle žádnou
//     nemá; klubový kouč se tak k vyhodnocení našeho klienta nedostane, což
//     je správně: klient souhlasil s prací s námi, ne s cizím klubem.
//   – Dělá to jen master a jen s vyplněními ze své větve. Kouč klubu by si
//     jinak mohl do týmu natáhnout cizí klienty.
//   – Musí to být elite200, protože z něj se počítá sedm oblastí i jednadvacet
//     částí. Kratší verze by profil tiše zkreslila.

/** Vyplnění, které jde dopočítat do týmu. */
const kandidatValidator = v.object({
  id: v.id("eliteDiagnosticResults"),
  jmeno: v.string(),
  role: v.optional(v.string()),
  testId: v.string(),
  datum: v.string(),
  createdAt: v.number(),
})

/**
 * Hotová vyplnění, která se dají dopočítat do týmu.
 *
 * Nabízí se jen to, co je v naší větvi, je z elite200 a zatím k žádnému týmu
 * nepatří. Cizí tým se nepřebírá: kdyby šlo hráče stáhnout jinému týmu,
 * rozpadl by se profil, který už někdo četl.
 */
export const listPridatelne = query({
  args: { sessionToken: v.string() },
  returns: v.array(kandidatValidator),
  handler: async (ctx, args) => {
    const me = await requireCoach(ctx, args.sessionToken)
    vyzadujMastera(me)
    const vidi = await filtrViditelnosti(ctx, me)

    const vsechna = await ctx.db
      .query("eliteDiagnosticResults")
      .withIndex("by_created")
      .order("desc")
      .take(500)

    return vsechna
      .filter((d) => d.teamId === undefined && d.model === "elite200" && vidi(d.coachId))
      .map((d) => ({
        id: d._id,
        jmeno: d.person.name,
        role: d.person.role,
        testId: d.testId,
        datum: d.person.fillDate,
        createdAt: d.createdAt,
      }))
  },
})

/**
 * Kdo je v týmu dopočítaný, tedy bez pozvánky.
 *
 * Master to potřebuje vidět, aby poznal, z čeho se profil skládá, a mohl
 * někoho zase vyjmout. Klubovému kouči se nevrací nic: k našim klientům
 * v profilu se dostat nemá, a proto se ani neobjeví na soupisce.
 */
export const listDopocitane = query({
  args: { sessionToken: v.string(), teamId: v.id("teams") },
  returns: v.array(kandidatValidator),
  handler: async (ctx, args) => {
    const me = await requireCoach(ctx, args.sessionToken)
    vyzadujMastera(me)
    const vidi = await filtrViditelnosti(ctx, me)

    const pozvanky = await ctx.db
      .query("invitations")
      .withIndex("by_team", (q) => q.eq("teamId", args.teamId))
      .collect()
    const zPozvanek = new Set(pozvanky.filter((p) => p.resultId).map((p) => String(p.resultId)))

    const vyplneni = await ctx.db
      .query("eliteDiagnosticResults")
      .withIndex("by_team", (q) => q.eq("teamId", args.teamId))
      .collect()

    return vyplneni
      .filter((d) => !zPozvanek.has(String(d._id)) && vidi(d.coachId))
      .sort((a, b) => a.createdAt - b.createdAt)
      .map((d) => ({
        id: d._id,
        jmeno: d.person.name,
        role: d.person.role,
        testId: d.testId,
        datum: d.person.fillDate,
        createdAt: d.createdAt,
      }))
  },
})

/**
 * Dopočítá hotové vyplnění do týmu.
 *
 * Mění se jediné pole: `teamId`. Vlastník ani volba sdílení se nesahá – kdyby
 * se přepsal vlastník, ztratil by k vyplnění přístup kouč, který klienta vede,
 * a kdyby se dosadilo sdílení, tvrdili bychom za klienta něco, co neřekl.
 */
export const addExistingToTeam = mutation({
  args: {
    sessionToken: v.string(),
    teamId: v.id("teams"),
    resultId: v.id("eliteDiagnosticResults"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const me = await requireCoachProZapis(ctx, args.sessionToken)
    vyzadujMastera(me)

    const tym = await ctx.db.get(args.teamId)
    if (!tym) throw new ConvexError("Takový tým neexistuje.")

    const vyplneni = await ctx.db.get(args.resultId)
    if (!vyplneni) throw new ConvexError("Takové vyplnění neexistuje.")

    const vidi = await filtrViditelnosti(ctx, me)
    if (!vidi(vyplneni.coachId)) {
      throw new ConvexError("Tohle vyplnění do tvé větve nepatří.")
    }
    if (vyplneni.model !== "elite200") {
      throw new ConvexError("Do týmu jde dopočítat jen vyplnění ELITE 200; kratší verze profil zkreslí.")
    }
    if (vyplneni.teamId !== undefined) {
      if (String(vyplneni.teamId) === String(args.teamId)) return null
      throw new ConvexError("Tohle vyplnění už patří jinému týmu. Nejdřív ho z něj vyjmi.")
    }

    await ctx.db.patch(args.resultId, { teamId: args.teamId })
    await zaznamenejPristup(ctx, me._id, "pridani-do-tymu", args.resultId)
    return null
  },
})

/**
 * Vyjme dopočítané vyplnění z týmu.
 *
 * Jen ta, která do týmu přišla dopočítáním. Hráče, který vyplňoval na pozvánku,
 * z týmu vyjmout nejde: vyplňoval ho jako člen týmu a vytáhnout ho zpátky by
 * znamenalo přepsat, co se stalo.
 */
export const removeFromTeam = mutation({
  args: {
    sessionToken: v.string(),
    teamId: v.id("teams"),
    resultId: v.id("eliteDiagnosticResults"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const me = await requireCoachProZapis(ctx, args.sessionToken)
    vyzadujMastera(me)

    const vyplneni = await ctx.db.get(args.resultId)
    if (!vyplneni) return null
    if (String(vyplneni.teamId) !== String(args.teamId)) {
      throw new ConvexError("Tohle vyplnění k tomuhle týmu nepatří.")
    }

    const vidi = await filtrViditelnosti(ctx, me)
    if (!vidi(vyplneni.coachId)) throw new ConvexError("Tohle vyplnění do tvé větve nepatří.")

    const zPozvanky = await ctx.db
      .query("invitations")
      .withIndex("by_team", (q) => q.eq("teamId", args.teamId))
      .collect()
    if (zPozvanky.some((p) => String(p.resultId) === String(args.resultId))) {
      throw new ConvexError("Tenhle hráč vyplňoval na pozvánku pro tým, z týmu ho vyjmout nelze.")
    }

    await ctx.db.patch(args.resultId, { teamId: undefined })
    return null
  },
})

/**
 * Soupiska pro kouče: štítky, stav a co smí vidět.
 *
 * `sdileno` říká, jestli hráč dovolil kouči nahlédnout do vyhodnocení.
 * U odmítnutého sdílení se vrací jen to, že je odevzdáno; ani jméno, ani
 * odkaz na výsledek. Kouč tím pádem pozná, kdo sdílet nechtěl, což mu ale
 * nikdo netají: hráč je na to před odesláním upozorněný.
 */
export const listPlayers = query({
  args: { sessionToken: v.string(), teamId: v.id("teams") },
  returns: v.array(
    v.object({
      inviteId: v.id("invitations"),
      token: v.string(),
      stitek: v.string(),
      lang: v.string(),
      createdAt: v.number(),
      expiresAt: v.optional(v.number()),
      odevzdanoAt: v.optional(v.number()),
      sdileno: v.boolean(),
      /** jméno, které si hráč vyplnil sám; chybí, když zůstal u štítku */
      jmeno: v.optional(v.string()),
      resultId: v.optional(v.id("eliteDiagnosticResults")),
    }),
  ),
  handler: async (ctx, args) => {
    const me = await requireCoach(ctx, args.sessionToken)
    const tym = await ctx.db.get(args.teamId)
    if (!tym) return []
    // Do soupisky vidí kouč týmu a master. Master ji potřebuje kvůli podpoře,
    // ale jména ani výsledky mu nevrací, viz níž.
    const jeKouc = String(tym.coachId) === String(me._id)
    if (!jeKouc && me.role !== "master") {
      throw new ConvexError("Tenhle tým nevedeš.")
    }

    const pozvanky = await ctx.db
      .query("invitations")
      .withIndex("by_team", (q) => q.eq("teamId", args.teamId))
      .collect()
    pozvanky.sort((a, b) => a.createdAt - b.createdAt)

    const out = []
    for (const p of pozvanky) {
      const vysledek = p.resultId ? await ctx.db.get(p.resultId) : null
      const sdileno = vysledek?.sdilet !== false
      // Masterovi se jméno ani odkaz na vyhodnocení nevrací nikdy: do vyplnění
      // hráčů nevidí, a to ani u těch, kteří sdílení povolili.
      const proKouce = jeKouc && sdileno && vysledek !== null
      out.push({
        inviteId: p._id,
        token: p.token,
        stitek: p.clientName ?? "",
        lang: p.lang,
        createdAt: p.createdAt,
        expiresAt: p.expiresAt,
        odevzdanoAt: p.usedAt,
        sdileno,
        jmeno: proKouce ? vysledek.person.name : undefined,
        resultId: proKouce ? vysledek._id : undefined,
      })
    }
    return out
  },
})

// ─────────────────────────────────────────────────────────────────────────────
// Souhrnný profil týmu
// ─────────────────────────────────────────────────────────────────────────────
//
// Počítá se tady na serveru, ne v prohlížeči. Dva důvody, oba důležité:
//
// 1) Kdyby server vrátil odpovědi jednotlivých hráčů a souhrn se skládal až
//    v prohlížeči, master by si z nich poskládal individuální profily. Slíbili
//    jsme, že do nich nevidí, a slib má držet kód, ne dobrá vůle.
// 2) Skórování potřebuje vyhodnocovací klíče. Ty do prohlížeče nepatří ani
//    koučovi, natož hráči; viz scripts/audit-balicku.cjs.
//
// Do souhrnu vstupují všechna odevzdaná vyplnění včetně těch, u kterých hráč
// odmítl sdílení s koučem. Hráč o tom před odesláním ví.

const oblastProfilValidator = v.object({
  id: v.string(),
  prumer: v.number(),
  smodch: v.number(),
  min: v.number(),
  max: v.number(),
  pasma: v.object({
    priority: v.number(),
    stabilization: v.number(),
    strong: v.number(),
    elite: v.number(),
  }),
  rozkol: v.boolean(),
  rozptyl: v.boolean(),
  plosna: v.boolean(),
})

const castProfilValidator = v.object({
  id: v.string(),
  oblast: v.string(),
  prumer: v.number(),
  smodch: v.number(),
  min: v.number(),
  max: v.number(),
  riziko: v.boolean(),
})

export const teamReport = query({
  args: { sessionToken: v.string(), teamId: v.id("teams") },
  returns: v.union(
    v.null(),
    v.object({
      nazev: v.string(),
      pozvano: v.number(),
      odevzdano: v.number(),
      zapocteno: v.number(),
      oblasti: v.array(oblastProfilValidator),
      casti: v.array(castProfilValidator),
      trhliny: v.array(v.object({ oblast: v.string(), cast: v.string() })),
      opory: v.array(v.string()),
      priority: v.array(v.string()),
      zlomy: v.array(v.string()),
      nalezy: v.array(
        v.object({
          kod: v.string(),
          sila: v.union(v.literal("vysoka"), v.literal("stredni")),
          oblasti: v.array(v.string()),
        }),
      ),
      maloDat: v.boolean(),
    }),
  ),
  handler: async (ctx, args) => {
    const me = await requireCoach(ctx, args.sessionToken)
    const tym = await ctx.db.get(args.teamId)
    if (!tym) return null
    if (String(tym.coachId) !== String(me._id) && me.role !== "master") {
      throw new ConvexError("Tenhle tým nevedeš.")
    }

    const vyplneni = await ctx.db
      .query("eliteDiagnosticResults")
      .withIndex("by_team", (q) => q.eq("teamId", args.teamId))
      .collect()

    const struktura = getStructure("elite200")
    const vysledky = []
    for (const d of vyplneni) {
      let odpovedi: Record<string, number>
      try {
        odpovedi = JSON.parse(d.answers) as Record<string, number>
      } catch {
        continue // rozbitý záznam se do profilu nepočítá, ale nesmí ho shodit
      }
      const mapa: Record<number, 1 | 2 | 3 | 4 | 5> = {}
      for (const [k, val] of Object.entries(odpovedi)) {
        mapa[Number(k)] = val as 1 | 2 | 3 | 4 | 5
      }
      // Neplatná vyplnění se z profilu vyřadí až v tymovyProfil, aby to
      // pravidlo platilo pro každého, kdo profil počítá, a dalo se testovat.
      vysledky.push(evaluate(struktura, mapa, { durationSec: d.durationSec }))
    }

    const pozvanky = await ctx.db
      .query("invitations")
      .withIndex("by_team", (q) => q.eq("teamId", args.teamId))
      .collect()

    // Dopočítaní hráči pozvánku nemají, ale odevzdáno za ně je. Bez nich by
    // report hlásil „odevzdáno deset z nuly rozeslaných".
    const zPozvanek = new Set(pozvanky.filter((p) => p.resultId).map((p) => String(p.resultId)))
    const dopocitanych = vyplneni.filter((d) => !zPozvanek.has(String(d._id))).length

    return tymovyProfil(tym.nazev, pozvanky.length + dopocitanych, vyplneni.length, vysledky)
  },
})
