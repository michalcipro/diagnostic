import { ConvexError, v } from "convex/values"
import { internalMutation, internalQuery } from "./_generated/server"
import { filtrViditelnosti, requireCoachProZapis, zaznamenejPristup } from "./sessions"
import { overPristupKDenikum } from "./plannerPilot"

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
      mustChangePassword: v.boolean(),
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
      mustChangePassword: c.mustChangePassword === true,
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
      mustChangePassword: v.boolean(),
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
      mustChangePassword: c.mustChangePassword === true,
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
      // Úroveň sdílení určil kouč při zakládání pozvánky. Klient ji uvidí
      // hned po přihlášení na svém účtu.
      sdileni: pozvanka.sdileni ?? "nic",
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
    await ctx.db.patch(args.clientId, {
      passwordHash: args.passwordHash,
      salt: args.salt,
      // Vlastní heslo ruší vynucenou změnu: účet dostal heslo, které zná
      // jenom klient, a přesně o to při vynucené změně šlo.
      mustChangePassword: false,
    })
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

/**
 * Založení deníku rovnou, s heslem, které vygeneroval server.
 *
 * Druhá cesta vedle pozvánky. Kouč tu dostane do ruky heslo a předá ho
 * klientovi sám, takže heslo projde cizí schránkou. Proto účet vzniká rovnou
 * s vynucenou změnou: dočasné heslo přestane platit prvním přihlášením a
 * dál už zná heslo jenom klient.
 *
 * Kontrola kouče je uvnitř téhle mutace, ne v akci, která ji volá: akce na
 * databázi nedosáhne, takže jinde než tady se ověřit nedá.
 */
export const zalozKlientaSHeslem = internalMutation({
  args: {
    coachSessionToken: v.string(),
    name: v.string(),
    email: v.string(),
    gender: v.optional(genderValidator),
    lang: v.string(),
    sdileni: v.union(v.literal("nic"), v.literal("cisla"), v.literal("vse")),
    passwordHash: v.string(),
    salt: v.string(),
  },
  returns: v.id("plannerClients"),
  handler: async (ctx, args) => {
    const kouc = await requireCoachProZapis(ctx, args.coachSessionToken)
    overPristupKDenikum(kouc)

    const jmeno = args.name.trim()
    const email = args.email.trim().toLowerCase()
    if (jmeno.length < 2) throw new ConvexError("Zadej jméno klienta.")
    if (jmeno.length > 120) throw new ConvexError("Jméno je příliš dlouhé.")
    if (!email.includes("@") || email.length > 200) throw new ConvexError("Zadej platný e-mail.")
    if (!["cs", "en", "sk"].includes(args.lang)) throw new ConvexError("Neznámý jazyk.")

    const existujici = await ctx.db
      .query("plannerClients")
      .withIndex("by_email", (q) => q.eq("email", email))
      .unique()
    if (existujici) throw new ConvexError("Deník s tímto e-mailem už existuje.")

    const clientId = await ctx.db.insert("plannerClients", {
      email,
      name: jmeno,
      passwordHash: args.passwordHash,
      salt: args.salt,
      gender: args.gender,
      lang: args.lang,
      coachId: kouc._id,
      active: true,
      sdileni: args.sdileni,
      mustChangePassword: true,
      createdAt: Date.now(),
    })
    await zaznamenejPristup(ctx, kouc._id, "vytvoreni-deniku")
    return clientId
  },
})

/**
 * Nové dočasné heslo pro klienta, který se nemůže dostat dovnitř.
 *
 * Bez odesílání e-mailů nemá klient jak si heslo obnovit sám, takže tohle je
 * jediná cesta zpátky. Ukončí všechny relace a znovu zapne vynucenou změnu:
 * heslo, které kouč nadiktuje do telefonu, nemá zůstat v platnosti.
 */
export const pripravResetHesla = internalMutation({
  args: {
    coachSessionToken: v.string(),
    clientId: v.id("plannerClients"),
    passwordHash: v.string(),
    salt: v.string(),
  },
  returns: v.object({ name: v.string(), email: v.string() }),
  handler: async (ctx, args) => {
    const kouc = await requireCoachProZapis(ctx, args.coachSessionToken)
    overPristupKDenikum(kouc)

    const klient = await ctx.db.get(args.clientId)
    if (!klient) throw new ConvexError("Deník nenalezen.")
    const viditelny = await filtrViditelnosti(ctx, kouc)
    if (!viditelny(klient.coachId)) throw new ConvexError("K tomuhle deníku nemáš přístup.")

    await ctx.db.patch(klient._id, {
      passwordHash: args.passwordHash,
      salt: args.salt,
      mustChangePassword: true,
    })
    const relace = await ctx.db
      .query("plannerSessions")
      .withIndex("by_client", (q) => q.eq("clientId", klient._id))
      .collect()
    for (const r of relace) await ctx.db.delete(r._id)

    await zaznamenejPristup(ctx, kouc._id, "reset-hesla-deniku")
    return { name: klient.name, email: klient.email }
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
