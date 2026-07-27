import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"

// Samostatná aplikace ELITE Performance Diagnostic — vlastní Convex projekt.
// Vyplněné dotazníky jsou přístupné pouze kouči (heslo se ověřuje na serveru,
// viz eliteDiagnostic.ts). Respondent po odeslání žádná data nedostává.
export default defineSchema({
  eliteDiagnosticResults: defineTable({
    testId: v.string(),
    model: v.string(),
    variant: v.string(),
    lang: v.string(),
    person: v.object({
      name: v.string(),
      birthDate: v.optional(v.string()),
      role: v.optional(v.string()),
      fillDate: v.string(),
    }),
    answers: v.string(),
    answeredCount: v.number(),
    complete: v.boolean(),
    createdAt: v.number(),
  }).index("by_created", ["createdAt"]),
})
