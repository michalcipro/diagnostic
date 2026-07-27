import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"

// Samostatná aplikace ELITE Performance Diagnostic — vlastní Convex projekt.
//
// Přístup k dotazníku je pouze na pozvánku: kouč vygeneruje odkaz s tokenem
// na jedno použití. Vyplněné výsledky vidí pouze kouč (ověření heslem na
// serveru, viz eliteDiagnostic.ts) — respondent po odeslání žádná data nedostává.
export default defineSchema({
  // Pozvánka = jeden odkaz pro jednoho klienta na jeden konkrétní test.
  invitations: defineTable({
    token: v.string(), // neuhodnutelný token v odkazu /t/<token>
    testId: v.string(),
    lang: v.string(),
    clientName: v.optional(v.string()), // předvyplní se respondentovi
    note: v.optional(v.string()), // interní poznámka kouče
    createdAt: v.number(),
    usedAt: v.optional(v.number()), // vyplněno = pozvánka spotřebovaná
    resultId: v.optional(v.id("eliteDiagnosticResults")),
  })
    .index("by_token", ["token"])
    .index("by_created", ["createdAt"]),

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
