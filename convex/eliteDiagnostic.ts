import { v } from "convex/values"
import { mutation, query } from "./_generated/server"

// ─────────────────────────────────────────────────────────────────────────────
// ELITE Performance Diagnostic — backend.
//
// BEZPEČNOSTNÍ PRAVIDLO: odpovědi ani vyhodnocení se NIKDY nevrací bez
// platného hesla kouče. Respondent po odeslání nedostane zpět nic než
// potvrzení — vyhodnocení s ním prochází kouč osobně.
//
// Heslo se ověřuje zde na serveru proti proměnné prostředí COACH_PASSWORD.
// Kdyby se kontrolovalo jen v prohlížeči, kdokoli by si data stáhl přímo
// přes veřejné Convex API.
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

/**
 * Odeslání vyplněného dotazníku. Vrací pouze potvrzení — respondent
 * záměrně nedostává žádný odkaz na vyhodnocení.
 */
export const submit = mutation({
  args: {
    testId: v.string(),
    lang: v.string(),
    person: personValidator,
    answers: v.string(), // JSON { "1": 4, … }
  },
  returns: v.object({ ok: v.boolean() }),
  handler: async (ctx, args) => {
    if (!TEST_IDS.has(args.testId)) {
      throw new Error(`Neznámý testId: ${args.testId}`)
    }
    const [model, variant] = args.testId.split("-")

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

    await ctx.db.insert("eliteDiagnosticResults", {
      testId: args.testId,
      model,
      variant,
      lang: args.lang === "en" ? "en" : "cs",
      person: args.person,
      answers: args.answers,
      answeredCount,
      complete: answeredCount === itemCount,
      createdAt: Date.now(),
    })
    return { ok: true }
  },
})

/** Souhrn jednoho vyplnění pro seznam v přehledu kouče (bez odpovědí). */
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

/** Seznam všech vyplnění — pouze pro kouče. */
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

/** Kompletní vyplnění včetně odpovědí — pouze pro kouče. */
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

/** Smazání vyplnění — pouze pro kouče. */
export const removeForCoach = mutation({
  args: { password: v.string(), id: v.id("eliteDiagnosticResults") },
  returns: v.object({ ok: v.boolean() }),
  handler: async (ctx, args) => {
    assertCoach(args.password)
    await ctx.db.delete(args.id)
    return { ok: true }
  },
})
