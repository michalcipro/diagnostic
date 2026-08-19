import { ConvexError, v } from "convex/values"
import { internalMutation, internalQuery } from "./_generated/server"

// Vnitřní funkce klientských účtů plánovače. Volají je výhradně akce
// v convex/plannerAuth.ts, které umí pracovat s kryptografií – do veřejného
// API se odsud nic nedostane.

const genderValidator = v.union(v.literal("male"), v.literal("female"))

/**
 * Klíč pod kterým se u plánovače počítají neúspěšná přihlášení.
 *
 * Sdílí tabulku s kouči, ale s předponou. Bez ní by pokusy o klientský účet
 * zamykaly koučovský účet se stejným e-mailem, což je u kouče, který si sám
 * zkouší deník, docela pravděpodobné.
 */
function klicPokusu(email: string): string {
  return `planner:${email}`
}

export const findByEmail = internalQuery({
  args: { email: v.string() },
  returns: v.union(
    v.object({
      id: v.id("plannerClients"),
      email: v.string(),
      name: v.string(),
      passwordHash: v.string(),
      salt: v.string(),
      active: v.boolean(),
      lang: v.string(),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    const c = await ctx.db
      .query("plannerClients")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique()
    if (!c) return null
    return {
      id: c._id,
      email: c.email,
      name: c.name,
      passwordHash: c.passwordHash,
      salt: c.salt,
      active: c.active,
      lang: c.lang,
    }
  },
})

export const getById = internalQuery({
  args: { clientId: v.id("plannerClients") },
  returns: v.union(
    v.object({
      id: v.id("plannerClients"),
      email: v.string(),
      name: v.string(),
      passwordHash: v.string(),
      salt: v.string(),
      active: v.boolean(),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    const c = await ctx.db.get(args.clientId)
    if (!c) return null
    return {
      id: c._id,
      email: c.email,
      name: c.name,
      passwordHash: c.passwordHash,
      salt: c.salt,
      active: c.active,
    }
  },
})

/** Pozvánka tak, jak ji potřebuje aktivace: bez ničeho navíc. */
export const getInvite = internalQuery({
  args: { token: v.string() },
  returns: v.union(
    v.object({
      id: v.id("plannerInvites"),
      coachId: v.id("coaches"),
      name: v.string(),
      email: v.string(),
      gender: v.optional(genderValidator),
      lang: v.string(),
      expiresAt: v.number(),
      usedAt: v.optional(v.number()),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    const p = await ctx.db
      .query("plannerInvites")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .unique()
    if (!p) return null
    return {
      id: p._id,
      coachId: p.coachId,
      name: p.name,
      email: p.email,
      gender: p.gender,
      lang: p.lang,
      expiresAt: p.expiresAt,
      usedAt: p.usedAt,
    }
  },
})

/**
 * Založení účtu z pozvánky.
 *
 * Pozvánka se spotřebuje v téže transakci, ve které účet vzniká. Kdyby se
 * označovala zvlášť, dala by se dvěma souběžnými požadavky použít dvakrát.
 */
export const activateFromInvite = internalMutation({
  args: {
    inviteId: v.id("plannerInvites"),
    passwordHash: v.string(),
    salt: v.string(),
  },
  returns: v.id("plannerClients"),
  handler: async (ctx, args) => {
    const pozvanka = await ctx.db.get(args.inviteId)
    if (!pozvanka) throw new ConvexError("Pozvánka neexistuje.")
    if (pozvanka.usedAt) throw new ConvexError("Pozvánka už byla použitá.")
    if (pozvanka.expiresAt < Date.now()) throw new ConvexError("Pozvánka vypršela.")

    const existujici = await ctx.db
      .query("plannerClients")
      .withIndex("by_email", (q) => q.eq("email", pozvanka.email))
      .unique()
    if (existujici) throw new ConvexError("Deník s tímto e-mailem už existuje. Přihlas se.")

    const clientId = await ctx.db.insert("plannerClients", {
      email: pozvanka.email,
      name: pozvanka.name,
      passwordHash: args.passwordHash,
      salt: args.salt,
      gender: pozvanka.gender,
      lang: pozvanka.lang,
      coachId: pozvanka.coachId,
      active: true,
      createdAt: Date.now(),
    })
    await ctx.db.patch(args.inviteId, { usedAt: Date.now(), clientId })
    return clientId
  },
})

export const openSession = internalMutation({
  args: { clientId: v.id("plannerClients"), token: v.string(), days: v.number() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const now = Date.now()
    await ctx.db.insert("plannerSessions", {
      token: args.token,
      clientId: args.clientId,
      createdAt: now,
      expiresAt: now + args.days * 24 * 60 * 60 * 1000,
      lastSeenAt: now,
    })
    return null
  },
})

export const setPassword = internalMutation({
  args: { clientId: v.id("plannerClients"), passwordHash: v.string(), salt: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch(args.clientId, { passwordHash: args.passwordHash, salt: args.salt })
    // Změna hesla ukončí všechny relace: kdo byl přihlášený na cizím
    // zařízení, tím vypadne. To je u změny hesla ten hlavní důvod, proč se
    // dělá.
    const relace = await ctx.db
      .query("plannerSessions")
      .withIndex("by_client", (q) => q.eq("clientId", args.clientId))
      .collect()
    for (const r of relace) await ctx.db.delete(r._id)
    return null
  },
})

export const zaznamenejPrihlaseni = internalMutation({
  args: { clientId: v.id("plannerClients") },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch(args.clientId, { lastLoginAt: Date.now() })
    return null
  },
})

// ─────────────────────────────────────────────────────────────────────────────
// Strop na počet pokusů o přihlášení
//
// Convex vystavuje akce na veřejném API, takže bez stropu by šlo hesla zkoušet
// ve smyčce. Logika je stejná jako u koučů, jen s vlastním klíčem.
// ─────────────────────────────────────────────────────────────────────────────

const MAX_POKUSU = 5
const OKNO_MINUT = 15
const ZAMEK_MINUT = 15

export const jeZamceno = internalQuery({
  args: { email: v.string() },
  returns: v.boolean(),
  handler: async (ctx, args) => {
    const z = await ctx.db
      .query("loginAttempts")
      .withIndex("by_email", (q) => q.eq("email", klicPokusu(args.email)))
      .unique()
    return !!z?.lockedUntil && z.lockedUntil > Date.now()
  },
})

export const zaznamenejNeuspech = internalMutation({
  args: { email: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const now = Date.now()
    const klic = klicPokusu(args.email)
    const z = await ctx.db
      .query("loginAttempts")
      .withIndex("by_email", (q) => q.eq("email", klic))
      .unique()
    if (!z) {
      await ctx.db.insert("loginAttempts", {
        email: klic,
        failedCount: 1,
        firstFailedAt: now,
        lastFailedAt: now,
      })
      return null
    }
    // Po uplynutí okna se počítá nanovo, ať se pokusy nesčítají přes týdny.
    const vOkne = now - z.firstFailedAt < OKNO_MINUT * 60 * 1000
    const pocet = vOkne ? z.failedCount + 1 : 1
    await ctx.db.patch(z._id, {
      failedCount: pocet,
      firstFailedAt: vOkne ? z.firstFailedAt : now,
      lastFailedAt: now,
      lockedUntil: pocet >= MAX_POKUSU ? now + ZAMEK_MINUT * 60 * 1000 : undefined,
    })
    return null
  },
})

export const vynulujPokusy = internalMutation({
  args: { email: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const z = await ctx.db
      .query("loginAttempts")
      .withIndex("by_email", (q) => q.eq("email", klicPokusu(args.email)))
      .unique()
    if (z) await ctx.db.delete(z._id)
    return null
  },
})
