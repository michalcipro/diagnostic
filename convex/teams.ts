import { ConvexError, v } from "convex/values"
import { mutation, query } from "./_generated/server"
import type { QueryCtx } from "./_generated/server"
import type { Id } from "./_generated/dataModel"
import { requireCoach, requireCoachProZapis, vyzadujMastera, zaznamenejPristup } from "./sessions"
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
})

/** Založení týmu. Vede ho vždy externí kouč, klub je cizí organizace. */
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
    if (kouc.role !== "external") {
      throw new ConvexError("Tým může vést pouze externí kouč.")
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
    vyzadujMastera(await requireCoach(ctx, args.sessionToken))
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
        ...(await pocty(ctx, t._id)),
      })
    }
    return out
  },
})

/** Kolik štítků je rozeslaných a kolik jich má odevzdáno. */
async function pocty(ctx: QueryCtx, teamId: Id<"teams">): Promise<{ pozvano: number; odevzdano: number }> {
  const pozvanky = await ctx.db
    .query("invitations")
    .withIndex("by_team", (q) => q.eq("teamId", teamId))
    .collect()
  return {
    pozvano: pozvanky.length,
    odevzdano: pozvanky.filter((p) => p.usedAt !== undefined).length,
  }
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

    return tymovyProfil(tym.nazev, pozvanky.length, vyplneni.length, vysledky)
  },
})
