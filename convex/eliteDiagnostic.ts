import { v } from "convex/values"
import { mutation, query } from "./_generated/server"

// ─────────────────────────────────────────────────────────────────────────────
// ELITE Performance Diagnostic — backend.
//
// PŘÍSTUP: dotazník lze otevřít i odeslat pouze s platnou pozvánkou. Kouč
// vygeneruje odkaz s neuhodnutelným tokenem pro jednoho klienta a jeden test;
// odesláním se pozvánka spotřebuje. Bez tokenu není kudy nic odeslat, takže
// nehrozí spam ani vyplňování testů, které klientovi nepatří.
//
// VÝSLEDKY: odpovědi ani vyhodnocení se NIKDY nevrací bez hesla kouče, které
// se ověřuje zde na serveru proti proměnné COACH_PASSWORD. Kdyby se
// kontrolovalo jen v prohlížeči, kdokoli by si data stáhl přes veřejné API.
// ─────────────────────────────────────────────────────────────────────────────

const TEST_IDS = new Set([
  "elite200-sport",
  "elite200-business",
  "elite100-sport",
  "elite100-business",
])

const personValidator = v.object({
  name: v.string(),
  birthDate: v.optional(v.string()),
  role: v.optional(v.string()),
  fillDate: v.string(),
})

/** Ověří heslo kouče. Vyhodí chybu, pokud nesedí nebo není nastavené. */
function assertCoach(password: string) {
  const expected = process.env.COACH_PASSWORD
  if (!expected) {
    throw new Error(
      "Na serveru není nastavené heslo kouče (COACH_PASSWORD). Doplň ho v nastavení Convexu.",
    )
  }
  if (password !== expected) {
    throw new Error("Nesprávné heslo.")
  }
}

/** Token do odkazu. Bez podobných znaků (0/O, 1/l), ať se dá případně přečíst. */
function makeToken(): string {
  const alphabet = "abcdefghijkmnpqrstuvwxyz23456789"
  let out = ""
  for (let i = 0; i < 16; i++) {
    out += alphabet[Math.floor(Math.random() * alphabet.length)]
  }
  return out
}

// ---------------------------------------------------------------------------
// Pozvánky
// ---------------------------------------------------------------------------

/** Vytvoří pozvánku na jedno použití. Pouze pro kouče. */
export const createInvite = mutation({
  args: {
    password: v.string(),
    testId: v.string(),
    lang: v.string(),
    clientName: v.optional(v.string()),
    note: v.optional(v.string()),
  },
  returns: v.object({ token: v.string() }),
  handler: async (ctx, args) => {
    assertCoach(args.password)
    if (!TEST_IDS.has(args.testId)) {
      throw new Error(`Neznámý testId: ${args.testId}`)
    }
    const token = makeToken()
    await ctx.db.insert("invitations", {
      token,
      testId: args.testId,
      lang: args.lang === "en" ? "en" : "cs",
      clientName: args.clientName,
      note: args.note,
      createdAt: Date.now(),
    })
    return { token }
  },
})

/**
 * Veřejné načtení pozvánky podle tokenu — potřebuje ho respondent, aby se mu
 * otevřel správný test. Vrací pouze to, co je k zobrazení dotazníku nutné;
 * žádné odpovědi ani vyhodnocení.
 */
export const getInvite = query({
  args: { token: v.string() },
  returns: v.object({
    status: v.union(v.literal("ok"), v.literal("used"), v.literal("notfound")),
    testId: v.optional(v.string()),
    lang: v.optional(v.string()),
    clientName: v.optional(v.string()),
  }),
  handler: async (ctx, args) => {
    const inv = await ctx.db
      .query("invitations")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .unique()
    if (!inv) return { status: "notfound" as const }
    if (inv.usedAt) return { status: "used" as const }
    return {
      status: "ok" as const,
      testId: inv.testId,
      lang: inv.lang,
      clientName: inv.clientName,
    }
  },
})

/** Souhrn pozvánky pro přehled kouče. */
const inviteValidator = v.object({
  id: v.id("invitations"),
  token: v.string(),
  testId: v.string(),
  lang: v.string(),
  clientName: v.optional(v.string()),
  note: v.optional(v.string()),
  createdAt: v.number(),
  usedAt: v.optional(v.number()),
  resultId: v.optional(v.id("eliteDiagnosticResults")),
})

/** Seznam pozvánek. Pouze pro kouče. */
export const listInvites = query({
  args: { password: v.string() },
  returns: v.array(inviteValidator),
  handler: async (ctx, args) => {
    assertCoach(args.password)
    const docs = await ctx.db.query("invitations").withIndex("by_created").order("desc").take(500)
    return docs.map((d) => ({
      id: d._id,
      token: d.token,
      testId: d.testId,
      lang: d.lang,
      clientName: d.clientName,
      note: d.note,
      createdAt: d.createdAt,
      usedAt: d.usedAt,
      resultId: d.resultId,
    }))
  },
})

/** Zruší (smaže) pozvánku. Pouze pro kouče. */
export const revokeInvite = mutation({
  args: { password: v.string(), id: v.id("invitations") },
  returns: v.object({ ok: v.boolean() }),
  handler: async (ctx, args) => {
    assertCoach(args.password)
    await ctx.db.delete(args.id)
    return { ok: true }
  },
})

// ---------------------------------------------------------------------------
// Odeslání vyplněného dotazníku
// ---------------------------------------------------------------------------

/**
 * Odeslání dotazníku proti pozvánce. Vrací jen potvrzení — respondent
 * záměrně nedostává žádné výsledky ani odkaz na ně.
 */
export const submitWithInvite = mutation({
  args: {
    token: v.string(),
    person: personValidator,
    answers: v.string(), // JSON { "1": 4, … }
  },
  returns: v.object({ ok: v.boolean() }),
  handler: async (ctx, args) => {
    const inv = await ctx.db
      .query("invitations")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .unique()
    if (!inv) throw new Error("Neplatný odkaz.")
    if (inv.usedAt) throw new Error("Tento odkaz už byl použit.")

    const [model, variant] = inv.testId.split("-")

    let parsed: Record<string, number>
    try {
      parsed = JSON.parse(args.answers) as Record<string, number>
    } catch {
      throw new Error("answers není validní JSON")
    }
    const itemCount = model === "elite200" ? 200 : 100
    let answeredCount = 0
    for (let i = 1; i <= itemCount; i++) {
      const value = parsed[String(i)]
      if (value !== undefined) {
        if (typeof value !== "number" || value < 1 || value > 5) {
          throw new Error(`Neplatná odpověď u položky ${i}`)
        }
        answeredCount++
      }
    }

    const resultId = await ctx.db.insert("eliteDiagnosticResults", {
      testId: inv.testId,
      model,
      variant,
      lang: inv.lang,
      person: args.person,
      answers: args.answers,
      answeredCount,
      complete: answeredCount === itemCount,
      createdAt: Date.now(),
    })
    // Pozvánku spotřebuj — odkaz už podruhé nepustí.
    await ctx.db.patch(inv._id, { usedAt: Date.now(), resultId })
    return { ok: true }
  },
})

// ---------------------------------------------------------------------------
// Výsledky (pouze kouč)
// ---------------------------------------------------------------------------

const summaryValidator = v.object({
  id: v.id("eliteDiagnosticResults"),
  testId: v.string(),
  model: v.string(),
  variant: v.string(),
  lang: v.string(),
  personName: v.string(),
  personRole: v.optional(v.string()),
  fillDate: v.string(),
  answeredCount: v.number(),
  complete: v.boolean(),
  createdAt: v.number(),
})

export const listForCoach = query({
  args: { password: v.string() },
  returns: v.array(summaryValidator),
  handler: async (ctx, args) => {
    assertCoach(args.password)
    const docs = await ctx.db
      .query("eliteDiagnosticResults")
      .withIndex("by_created")
      .order("desc")
      .take(500)
    return docs.map((d) => ({
      id: d._id,
      testId: d.testId,
      model: d.model,
      variant: d.variant,
      lang: d.lang,
      personName: d.person.name,
      personRole: d.person.role,
      fillDate: d.person.fillDate,
      answeredCount: d.answeredCount,
      complete: d.complete,
      createdAt: d.createdAt,
    }))
  },
})

export const getForCoach = query({
  args: { password: v.string(), id: v.id("eliteDiagnosticResults") },
  returns: v.union(
    v.object({
      id: v.id("eliteDiagnosticResults"),
      testId: v.string(),
      lang: v.string(),
      person: personValidator,
      answers: v.string(),
      answeredCount: v.number(),
      complete: v.boolean(),
      createdAt: v.number(),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    assertCoach(args.password)
    const d = await ctx.db.get(args.id)
    if (!d) return null
    return {
      id: d._id,
      testId: d.testId,
      lang: d.lang,
      person: d.person,
      answers: d.answers,
      answeredCount: d.answeredCount,
      complete: d.complete,
      createdAt: d.createdAt,
    }
  },
})

/** Ověření hesla pro přihlašovací obrazovku přehledu. */
export const checkPassword = query({
  args: { password: v.string() },
  returns: v.boolean(),
  handler: async (_ctx, args) => {
    const expected = process.env.COACH_PASSWORD
    if (!expected) {
      throw new Error(
        "Na serveru není nastavené heslo kouče (COACH_PASSWORD). Doplň ho v nastavení Convexu.",
      )
    }
    return args.password === expected
  },
})

/** Smazání vyplnění. Pouze pro kouče. */
export const removeForCoach = mutation({
  args: { password: v.string(), id: v.id("eliteDiagnosticResults") },
  returns: v.object({ ok: v.boolean() }),
  handler: async (ctx, args) => {
    assertCoach(args.password)
    await ctx.db.delete(args.id)
    return { ok: true }
  },
})
