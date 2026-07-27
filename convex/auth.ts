"use node"

import { v } from "convex/values"
import crypto from "node:crypto"
import { action } from "./_generated/server"
import { internal } from "./_generated/api"
import type { Id } from "./_generated/dataModel"

// Explicitní typy návratových hodnot. Bez nich TypeScript zacyklí odvozování,
// protože akce volají funkce přes `internal`, které se generují mimo jiné
// i z tohoto souboru (Convex chyby TS7022 / TS7023).
type Prihlaseni = { sessionToken: string; name: string; role: string }
type CoachZaznam = {
  id: Id<"coaches">
  email: string
  name: string
  passwordHash: string
  salt: string
  role: "master" | "coach"
  active: boolean
} | null
type Identita = {
  id: Id<"coaches">
  email: string
  name: string
  role: "master" | "coach"
} | null

// Přihlašování koučů. Běží v Node prostředí, aby šlo použít pořádnou
// kryptografii — hesla se nikdy neukládají v čitelné podobě.

const PBKDF2_ITERATIONS = 210_000
const SESSION_DAYS = 30

function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, PBKDF2_ITERATIONS, 32, "sha256").toString("hex")
}

/** Porovnání odolné vůči útoku na dobu vyhodnocení. */
function safeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a, "utf8")
  const bb = Buffer.from(b, "utf8")
  if (ba.length !== bb.length) return false
  return crypto.timingSafeEqual(ba, bb)
}

function newToken(): string {
  return crypto.randomBytes(32).toString("hex")
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

function validatePassword(password: string) {
  if (password.length < 10) {
    throw new Error("Heslo musí mít alespoň 10 znaků.")
  }
}

/**
 * Založení master účtu přes jednorázový odkaz.
 *
 * Projde pouze tehdy, když sedí SETUP_TOKEN a zároveň zatím neexistuje žádný
 * kouč. Jakmile master vznikne, odkaz je nadobro mrtvý — druhý účet už tudy
 * založit nejde.
 */
export const createMaster = action({
  args: {
    setupToken: v.string(),
    name: v.string(),
    email: v.string(),
    password: v.string(),
  },
  returns: v.object({ sessionToken: v.string(), name: v.string(), role: v.string() }),
  handler: async (ctx, args): Promise<Prihlaseni> => {
    const expected = process.env.SETUP_TOKEN
    if (!expected) {
      throw new Error("Na serveru není nastavený SETUP_TOKEN. Doplň ho v nastavení Convexu.")
    }
    if (!safeEqual(args.setupToken, expected)) {
      throw new Error("Neplatný zakládací odkaz.")
    }
    const exists: boolean = await ctx.runQuery(internal.authInternal.anyCoachExists, {})
    if (exists) {
      throw new Error("Master účet už existuje. Tento odkaz je neplatný.")
    }
    validatePassword(args.password)
    const email = normalizeEmail(args.email)
    if (!email.includes("@")) throw new Error("Zadej platný e-mail.")
    if (args.name.trim().length < 2) throw new Error("Zadej své jméno.")

    const salt = crypto.randomBytes(16).toString("hex")
    const coachId: Id<"coaches"> = await ctx.runMutation(internal.authInternal.insertCoach, {
      email,
      name: args.name.trim(),
      passwordHash: hashPassword(args.password, salt),
      salt,
      role: "master",
    })

    const sessionToken = newToken()
    await ctx.runMutation(internal.authInternal.openSession, {
      coachId,
      token: sessionToken,
      days: SESSION_DAYS,
    })
    return { sessionToken, name: args.name.trim(), role: "master" }
  },
})

/** Přihlášení e-mailem a heslem. */
export const login = action({
  args: { email: v.string(), password: v.string() },
  returns: v.object({ sessionToken: v.string(), name: v.string(), role: v.string() }),
  handler: async (ctx, args): Promise<Prihlaseni> => {
    const coach: CoachZaznam = await ctx.runQuery(internal.authInternal.findByEmail, {
      email: normalizeEmail(args.email),
    })
    // Stejná hláška pro neexistující účet i špatné heslo — ať nejde zjišťovat,
    // které e-maily jsou zaregistrované.
    const chyba = "Nesprávný e-mail nebo heslo."
    if (!coach || !coach.active) throw new Error(chyba)
    if (!safeEqual(hashPassword(args.password, coach.salt), coach.passwordHash)) {
      throw new Error(chyba)
    }
    const sessionToken = newToken()
    await ctx.runMutation(internal.authInternal.openSession, {
      coachId: coach.id,
      token: sessionToken,
      days: SESSION_DAYS,
    })
    return { sessionToken, name: coach.name, role: coach.role }
  },
})

/** Přidání dalšího kouče. Smí jen master. */
export const addCoach = action({
  args: {
    sessionToken: v.string(),
    name: v.string(),
    email: v.string(),
    password: v.string(),
  },
  returns: v.object({ ok: v.boolean() }),
  handler: async (ctx, args): Promise<{ ok: boolean }> => {
    const me: Identita = await ctx.runQuery(internal.sessions.whoAmI, {
      sessionToken: args.sessionToken,
    })
    if (!me || me.role !== "master") {
      throw new Error("Přidávat kouče může pouze master účet.")
    }
    validatePassword(args.password)
    const email = normalizeEmail(args.email)
    if (!email.includes("@")) throw new Error("Zadej platný e-mail.")

    const salt = crypto.randomBytes(16).toString("hex")
    await ctx.runMutation(internal.authInternal.insertCoach, {
      email,
      name: args.name.trim(),
      passwordHash: hashPassword(args.password, salt),
      salt,
      role: "coach",
    })
    return { ok: true }
  },
})

/** Změna vlastního hesla. */
export const changePassword = action({
  args: { sessionToken: v.string(), currentPassword: v.string(), newPassword: v.string() },
  returns: v.object({ ok: v.boolean() }),
  handler: async (ctx, args): Promise<{ ok: boolean }> => {
    const me: Identita = await ctx.runQuery(internal.sessions.whoAmI, {
      sessionToken: args.sessionToken,
    })
    if (!me) throw new Error("Přihlášení vypršelo.")
    const coach: CoachZaznam = await ctx.runQuery(internal.authInternal.findByEmail, {
      email: me.email,
    })
    if (!coach) throw new Error("Účet nenalezen.")
    if (!safeEqual(hashPassword(args.currentPassword, coach.salt), coach.passwordHash)) {
      throw new Error("Stávající heslo nesouhlasí.")
    }
    validatePassword(args.newPassword)
    const salt = crypto.randomBytes(16).toString("hex")
    await ctx.runMutation(internal.authInternal.setPassword, {
      coachId: coach.id,
      passwordHash: hashPassword(args.newPassword, salt),
      salt,
    })
    return { ok: true }
  },
})
