import { ConvexError, v } from "convex/values"
import { internalMutation, internalQuery } from "./_generated/server"

// Vnitřní funkce účtů. Volají je výhradně akce v convex/auth.ts, které umí
// pracovat s kryptografií – do veřejného API se tyhle funkce nedostanou.

export const anyCoachExists = internalQuery({
  args: {},
  returns: v.boolean(),
  handler: async (ctx) => {
    const first = await ctx.db.query("coaches").first()
    return first !== null
  },
})

export const findByEmail = internalQuery({
  args: { email: v.string() },
  returns: v.union(
    v.object({
      id: v.id("coaches"),
      email: v.string(),
      name: v.string(),
      passwordHash: v.string(),
      salt: v.string(),
      // Musí obsahovat všechny role. Convex ověřuje i návratovou hodnotu,
      // takže chybějící varianta neshodí zápis, ale až čtení: účet se založí
      // v pořádku a teprve přihlášení spadne dřív, než se vůbec ověří heslo.
      role: v.union(v.literal("master"), v.literal("coach"), v.literal("external")),
      active: v.boolean(),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    const c = await ctx.db
      .query("coaches")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique()
    if (!c) return null
    return {
      id: c._id,
      email: c.email,
      name: c.name,
      passwordHash: c.passwordHash,
      salt: c.salt,
      role: c.role,
      active: c.active,
    }
  },
})

export const insertCoach = internalMutation({
  args: {
    email: v.string(),
    name: v.string(),
    passwordHash: v.string(),
    salt: v.string(),
    role: v.union(v.literal("master"), v.literal("coach"), v.literal("external")),
    phone: v.optional(v.string()),
    note: v.optional(v.string()),
  },
  returns: v.id("coaches"),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("coaches")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique()
    if (existing) throw new ConvexError("Účet s tímto e-mailem už existuje.")
    return await ctx.db.insert("coaches", {
      email: args.email,
      name: args.name,
      passwordHash: args.passwordHash,
      salt: args.salt,
      role: args.role,
      phone: args.phone,
      note: args.note,
      active: true,
      createdAt: Date.now(),
    })
  },
})

export const openSession = internalMutation({
  args: { coachId: v.id("coaches"), token: v.string(), days: v.number() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const now = Date.now()
    await ctx.db.insert("coachSessions", {
      token: args.token,
      coachId: args.coachId,
      createdAt: now,
      expiresAt: now + args.days * 24 * 60 * 60 * 1000,
    })
    await ctx.db.patch(args.coachId, { lastLoginAt: now })
    // Úklid vypršelých relací, ať tabulka nebobtná.
    const stale = await ctx.db
      .query("coachSessions")
      .withIndex("by_coach", (q) => q.eq("coachId", args.coachId))
      .collect()
    for (const s of stale) {
      if (s.expiresAt < now) await ctx.db.delete(s._id)
    }
    return null
  },
})

/**
 * Úprava profilu kouče. Volá ji master.
 *
 * E-mail je zároveň přihlašovací jméno, takže se hlídá jeho jedinečnost;
 * bez toho by se dva účty přebily a jeden by přestal jít přihlásit.
 */
export const updateCoachProfile = internalMutation({
  args: {
    coachId: v.id("coaches"),
    name: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    note: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const coach = await ctx.db.get(args.coachId)
    if (!coach) throw new ConvexError("Účet nenalezen.")
    if (args.email !== coach.email) {
      const kolize = await ctx.db
        .query("coaches")
        .withIndex("by_email", (q) => q.eq("email", args.email))
        .unique()
      if (kolize) throw new ConvexError("Účet s tímto e-mailem už existuje.")
    }
    await ctx.db.patch(args.coachId, {
      name: args.name,
      email: args.email,
      phone: args.phone,
      note: args.note,
    })
    return null
  },
})

/** Účet podle id. Master si jím ověří, koho vlastně mění. */
export const getCoachById = internalQuery({
  args: { coachId: v.id("coaches") },
  returns: v.union(
    v.object({
      id: v.id("coaches"),
      email: v.string(),
      name: v.string(),
      role: v.union(v.literal("master"), v.literal("coach"), v.literal("external")),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    const c = await ctx.db.get(args.coachId)
    return c ? { id: c._id, email: c.email, name: c.name, role: c.role } : null
  },
})

export const setPassword = internalMutation({
  args: { coachId: v.id("coaches"), passwordHash: v.string(), salt: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch(args.coachId, { passwordHash: args.passwordHash, salt: args.salt })
    // Změna hesla ukončí všechny existující relace.
    const sessions = await ctx.db
      .query("coachSessions")
      .withIndex("by_coach", (q) => q.eq("coachId", args.coachId))
      .collect()
    for (const s of sessions) await ctx.db.delete(s._id)
    return null
  },
})
