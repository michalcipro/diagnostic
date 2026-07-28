import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"

// Samostatná aplikace ELITE Performance Diagnostic — vlastní Convex projekt.
//
// Přístup k dotazníku je pouze na pozvánku: kouč vygeneruje odkaz s tokenem
// na jedno použití. Vyplněné výsledky vidí pouze kouč (ověření heslem na
// serveru, viz eliteDiagnostic.ts) — respondent po odeslání žádná data nedostává.
export default defineSchema({
  // Kouči. První založený účet je master — vzniká přes jednorázový zakládací
  // odkaz, který po jeho vytvoření nadobro přestane fungovat. Další kouče
  // může přidat výhradně master.
  coaches: defineTable({
    email: v.string(),
    name: v.string(),
    passwordHash: v.string(),
    salt: v.string(),
    role: v.union(v.literal("master"), v.literal("coach")),
    active: v.boolean(),
    createdAt: v.number(),
    lastLoginAt: v.optional(v.number()),
  }).index("by_email", ["email"]),

  // Přihlášené relace. Token drží prohlížeč, platnost je omezená.
  coachSessions: defineTable({
    token: v.string(),
    coachId: v.id("coaches"),
    createdAt: v.number(),
    expiresAt: v.number(),
  })
    .index("by_token", ["token"])
    .index("by_coach", ["coachId"]),

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

  // Anonymní vzorek pro tvorbu norem.
  //
  // Záměrně samostatná tabulka BEZ odkazu na vyplnění a bez jména. Kdyby tu byl
  // resultId nebo přesný čas pořízení, dal by se záznam triviálně spárovat zpět
  // s konkrétním člověkem a celá anonymizace by byla jen naoko. Proto je tu
  // z osobních údajů jen rok narození a povolání či disciplína, a čas pouze
  // v přesnosti na měsíc.
  normSamples: defineTable({
    testId: v.string(),
    model: v.string(),
    variant: v.string(),
    lang: v.string(),
    /** rok narození, nikdy celé datum */
    birthYear: v.optional(v.number()),
    /** rod — do norem patří, identifikující není */
    gender: v.optional(v.union(v.literal("male"), v.literal("female"))),
    /** povolání (business) nebo disciplína a úroveň (sport) */
    role: v.optional(v.string()),
    /** odpovědi — z nich se dopočítá reliabilita, faktorová struktura i normy */
    answers: v.string(),
    answeredCount: v.number(),
    complete: v.boolean(),
    durationSec: v.optional(v.number()),
    /** „2026-07" — na měsíc, ať nejde spárovat s časem vyplnění */
    collectedMonth: v.string(),
  })
    .index("by_test", ["testId"])
    .index("by_month", ["collectedMonth"]),

  eliteDiagnosticResults: defineTable({
    testId: v.string(),
    model: v.string(),
    variant: v.string(),
    lang: v.string(),
    person: v.object({
      name: v.string(),
      birthDate: v.optional(v.string()),
      role: v.optional(v.string()),
      gender: v.optional(v.union(v.literal("male"), v.literal("female"))),
      fillDate: v.string(),
    }),
    answers: v.string(),
    answeredCount: v.number(),
    complete: v.boolean(),
    /**
     * Doba vyplňování v sekundách. Vstupuje do kontroly validity — příliš
     * rychlé vyplnění je silný ukazatel nedbalého odpovídání. U záznamů
     * pořízených dřív chybí, proto volitelné.
     */
    durationSec: v.optional(v.number()),
    createdAt: v.number(),
  }).index("by_created", ["createdAt"]),
})
