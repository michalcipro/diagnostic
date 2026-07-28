import { ConvexError, v } from "convex/values"
import { internalQuery, mutation, query } from "./_generated/server"
import type { QueryCtx } from "./_generated/server"
import type { Doc } from "./_generated/dataModel"

// Ověřování přihlášené relace. Sdílí ho všechny funkce, které pracují
// s daty koučů – bez platné relace nevrátí žádná data.

export type Coach = Doc<"coaches">

/**
 * Vrátí přihlášeného kouče, nebo vyhodí chybu. Používá se všude, kde se
 * pracuje s výsledky a pozvánkami.
 */
export async function requireCoach(ctx: QueryCtx, sessionToken: string): Promise<Coach> {
  const session = await ctx.db
    .query("coachSessions")
    .withIndex("by_token", (q) => q.eq("token", sessionToken))
    .unique()
  if (!session) throw new ConvexError("Nejsi přihlášený.")
  if (session.expiresAt < Date.now()) throw new ConvexError("Přihlášení vypršelo, přihlas se prosím znovu.")
  const coach = await ctx.db.get(session.coachId)
  if (!coach || !coach.active) throw new ConvexError("Účet není aktivní.")
  return coach
}

/** Interní varianta pro akce – vrací null místo chyby. */
export const whoAmI = internalQuery({
  args: { sessionToken: v.string() },
  returns: v.union(
    v.object({
      id: v.id("coaches"),
      email: v.string(),
      name: v.string(),
      role: v.union(v.literal("master"), v.literal("coach")),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    try {
      const coach = await requireCoach(ctx, args.sessionToken)
      return { id: coach._id, email: coach.email, name: coach.name, role: coach.role }
    } catch {
      return null
    }
  },
})

/**
 * Označení verze backendu. Zvyš ho pokaždé, když se mění chování zakládání
 * účtu – zakládací stránka ho zobrazuje, takže je na první pohled vidět, jestli
 * je nasazená nová verze, nebo prohlížeč drží starou. Bez toho se „pořád stejná
 * chyba" nedá odlišit od „oprava ještě nedojela".
 */
const VERZE_BACKENDU = "3"

/**
 * Zjistí, jestli je potřeba založit master účet (veřejné, bez dat).
 */
export const setupStatus = query({
  args: {},
  returns: v.object({ needsSetup: v.boolean(), verze: v.string() }),
  handler: async (ctx) => {
    const first = await ctx.db.query("coaches").first()
    return { needsSetup: first === null, verze: VERZE_BACKENDU }
  },
})

/** Informace o přihlášeném kouči pro hlavičku aplikace. */
export const me = query({
  args: { sessionToken: v.string() },
  returns: v.union(
    v.object({
      name: v.string(),
      email: v.string(),
      role: v.union(v.literal("master"), v.literal("coach")),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    try {
      const coach = await requireCoach(ctx, args.sessionToken)
      return { name: coach.name, email: coach.email, role: coach.role }
    } catch {
      return null
    }
  },
})

/** Odhlášení – zruší relaci na serveru. */
export const logout = mutation({
  args: { sessionToken: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("coachSessions")
      .withIndex("by_token", (q) => q.eq("token", args.sessionToken))
      .unique()
    if (session) await ctx.db.delete(session._id)
    return null
  },
})

/** Seznam koučů. Vidí ho pouze master. */
export const listCoaches = query({
  args: { sessionToken: v.string() },
  returns: v.array(
    v.object({
      id: v.id("coaches"),
      name: v.string(),
      email: v.string(),
      role: v.union(v.literal("master"), v.literal("coach")),
      active: v.boolean(),
      createdAt: v.number(),
      lastLoginAt: v.optional(v.number()),
    }),
  ),
  handler: async (ctx, args) => {
    const me = await requireCoach(ctx, args.sessionToken)
    if (me.role !== "master") throw new ConvexError("Přístup má pouze master účet.")
    const all = await ctx.db.query("coaches").collect()
    return all.map((c) => ({
      id: c._id,
      name: c.name,
      email: c.email,
      role: c.role,
      active: c.active,
      createdAt: c.createdAt,
      lastLoginAt: c.lastLoginAt,
    }))
  },
})

/** Zapnutí/vypnutí přístupu kouče. Smí jen master, sám sebe vypnout nemůže. */
export const setCoachActive = mutation({
  args: { sessionToken: v.string(), coachId: v.id("coaches"), active: v.boolean() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const me = await requireCoach(ctx, args.sessionToken)
    if (me.role !== "master") throw new ConvexError("Přístup má pouze master účet.")
    if (me._id === args.coachId) throw new ConvexError("Vlastní účet vypnout nelze.")
    await ctx.db.patch(args.coachId, { active: args.active })
    if (!args.active) {
      const sessions = await ctx.db
        .query("coachSessions")
        .withIndex("by_coach", (q) => q.eq("coachId", args.coachId))
        .collect()
      for (const s of sessions) await ctx.db.delete(s._id)
    }
    return null
  },
})
