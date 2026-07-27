import { ConvexError, v } from "convex/values"
import { internalMutation, internalQuery } from "./_generated/server"

// Vnitřní funkce účtů. Volají je výhradně akce v convex/auth.ts, které umí
// pracovat s kryptografií — do veřejného API se tyhle funkce nedostanou.

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
      role: v.union(v.literal("master"), v.literal("coach")),
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
    role: v.union(v.literal("master"), v.literal("coach")),
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
