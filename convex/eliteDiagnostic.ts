import { v } from "convex/values"
import { mutation, query } from "./_generated/server"

// ─────────────────────────────────────────────────────────────────────────────
// ELITE Performance Diagnostic — samostatný, izolovaný Convex modul.
//
// ZÁMĚRNĚ bez autentizace a bez jakékoli vazby na koučovací platformu
// (users / clients / coaches). Respondenti jsou anonymní, výsledek se sdílí
// neuhodnutelným tokenem `publicId`. Tento soubor nesmí importovat ani číst
// žádné jiné tabulky než `eliteDiagnosticResults`.
// ─────────────────────────────────────────────────────────────────────────────

const TEST_IDS = new Set([
  "elite200-sport",
  "elite200-business",
  "elite100-sport",
  "elite100-business",
])

/** Neuhodnutelný token pro sdílecí odkaz. */
function makePublicId(): string {
  const alphabet = "abcdefghijklmnopqrstuvwxyz0123456789"
  let out = ""
  for (let i = 0; i < 22; i++) {
    out += alphabet[Math.floor(Math.random() * alphabet.length)]
  }
  return out
}

const personValidator = v.object({
  name: v.string(),
  birthDate: v.optional(v.string()),
  role: v.optional(v.string()),
  fillDate: v.string(),
})

/** Uloží dokončené (nebo rozpracované) vyplnění a vrátí sdílecí publicId. */
export const submit = mutation({
  args: {
    testId: v.string(),
    lang: v.string(),
    person: personValidator,
    answers: v.string(), // JSON { "1": 4, … }
  },
  returns: v.object({ publicId: v.string() }),
  handler: async (ctx, args) => {
    if (!TEST_IDS.has(args.testId)) {
      throw new Error(`Neznámý testId: ${args.testId}`)
    }
    const [model, variant] = args.testId.split("-")

    // Ověř, že answers je validní JSON mapy číslo→1..5 a spočítej metadata.
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

    const publicId = makePublicId()
    await ctx.db.insert("eliteDiagnosticResults", {
      publicId,
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
    return { publicId }
  },
})

const resultValidator = v.object({
  publicId: v.string(),
  testId: v.string(),
  model: v.string(),
  variant: v.string(),
  lang: v.string(),
  person: personValidator,
  answers: v.string(),
  answeredCount: v.number(),
  complete: v.boolean(),
  createdAt: v.number(),
})

/** Načte výsledek podle sdílecího tokenu. Veřejné — bez autentizace. */
export const getByPublicId = query({
  args: { publicId: v.string() },
  returns: v.union(resultValidator, v.null()),
  handler: async (ctx, args) => {
    const doc = await ctx.db
      .query("eliteDiagnosticResults")
      .withIndex("by_public_id", (q) => q.eq("publicId", args.publicId))
      .unique()
    if (!doc) return null
    return {
      publicId: doc.publicId,
      testId: doc.testId,
      model: doc.model,
      variant: doc.variant,
      lang: doc.lang,
      person: doc.person,
      answers: doc.answers,
      answeredCount: doc.answeredCount,
      complete: doc.complete,
      createdAt: doc.createdAt,
    }
  },
})
