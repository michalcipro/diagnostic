import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"

// Samostatná aplikace ELITE Performance Diagnostic — vlastní Convex projekt.
// Jediná tabulka, anonymní výsledky sdílené neuhodnutelným odkazem (publicId).
export default defineSchema({
  eliteDiagnosticResults: defineTable({
    publicId: v.string(),
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
  })
    .index("by_public_id", ["publicId"])
    .index("by_created", ["createdAt"]),
})
