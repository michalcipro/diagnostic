"use node"

import { ConvexError, v } from "convex/values"
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
  role: "master" | "coach" | "external"
  active: boolean
} | null
type Identita = {
  id: Id<"coaches">
  email: string
  name: string
  role: "master" | "coach" | "external"
} | null

// Přihlašování koučů. Běží v Node prostředí, aby šlo použít pořádnou
// kryptografii – hesla se nikdy neukládají v čitelné podobě.

const PBKDF2_ITERATIONS = 210_000
const SESSION_DAYS = 30

/**
 * Zakládací token pro master účet.
 *
 * Skutečnou pojistkou proti vzniku druhého účtu je podmínka „zatím neexistuje
 * žádný kouč" – ta platí vždy a token hned po prvním použití ztrácí jakoukoli
 * moc. Proto je zabudovaný přímo v kódu: aplikace se rozjede bez nastavování
 * serverových proměnných a nemůže se stát, že zakládací odkaz přestane platit
 * kvůli chybějící konfiguraci. Kdo chce vlastní hodnotu, nastaví SETUP_TOKEN –
 * ta se pak přijímá také.
 */
const ZAKLADACI_TOKEN = "9nnh1p1l1gup8tz0r10s69li0axdee0b8dxkfha6"

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

/**
 * Porovná token z odkazu se zabudovanou i se serverovou hodnotou.
 *
 * Oba konce se ořezávají – do proměnné nastavené přes dashboard se snadno
 * dostane mezera nebo konec řádku a odkaz by pak bez viditelného důvodu
 * přestal platit.
 */
function tokenSedi(zadany: string): boolean {
  const a = zadany.trim()
  return [ZAKLADACI_TOKEN, process.env.SETUP_TOKEN].some(
    (povoleny) => !!povoleny && safeEqual(a, povoleny.trim()),
  )
}

/**
 * Convex v produkci nahrazuje text obyčejné chyby hláškou „Server Error".
 * Tenhle obal proto každou chybu převede na ConvexError ještě uvnitř akce,
 * takže se skutečná příčina ke klientovi dostane.
 */
async function sConvexChybou<T>(jmeno: string, fn: () => Promise<T>): Promise<T> {
  try {
    return await fn()
  } catch (e) {
    if (e instanceof ConvexError) throw e
    const detail = e instanceof Error ? e.message : String(e)
    throw new ConvexError(`Chyba při volání ${jmeno}: ${detail}`)
  }
}

function validatePassword(password: string) {
  if (password.length < 10) {
    throw new ConvexError("Heslo musí mít alespoň 10 znaků.")
  }
}

/**
 * Založení master účtu přes jednorázový odkaz.
 *
 * Projde pouze tehdy, když sedí zakládací token a zároveň zatím neexistuje
 * žádný kouč. Jakmile master vznikne, odkaz je nadobro mrtvý – druhý účet už
 * tudy založit nejde.
 */
export const createMaster = action({
  args: {
    setupToken: v.string(),
    name: v.string(),
    email: v.string(),
    password: v.string(),
  },
  returns: v.object({ sessionToken: v.string(), name: v.string(), role: v.string() }),
  handler: async (ctx, args): Promise<Prihlaseni> =>
    sConvexChybou("createMaster", async () => {
      if (!tokenSedi(args.setupToken)) {
        throw new ConvexError(
          "Tenhle zakládací odkaz neplatí. Otevři přesně ten, který k aplikaci patří – na konci adresy musí být celý token.",
        )
      }
      const exists: boolean = await ctx.runQuery(internal.authInternal.anyCoachExists, {})
      if (exists) {
        throw new ConvexError("Master účet už existuje. Tento odkaz je neplatný.")
      }
      validatePassword(args.password)
      const email = normalizeEmail(args.email)
      if (!email.includes("@")) throw new ConvexError("Zadej platný e-mail.")
      if (args.name.trim().length < 2) throw new ConvexError("Zadej své jméno.")

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
    }),
})

/** Přihlášení e-mailem a heslem. */
export const login = action({
  args: { email: v.string(), password: v.string() },
  returns: v.object({ sessionToken: v.string(), name: v.string(), role: v.string() }),
  handler: async (ctx, args): Promise<Prihlaseni> => {
    const coach: CoachZaznam = await ctx.runQuery(internal.authInternal.findByEmail, {
      email: normalizeEmail(args.email),
    })
    // Stejná hláška pro neexistující účet i špatné heslo – ať nejde zjišťovat,
    // které e-maily jsou zaregistrované.
    const chyba = "Nesprávný e-mail nebo heslo."
    if (!coach || !coach.active) throw new ConvexError(chyba)
    if (!safeEqual(hashPassword(args.password, coach.salt), coach.passwordHash)) {
      throw new ConvexError(chyba)
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
    /** externí kouč dostane vlastní větev klientů, na kterou my nevidíme */
    role: v.optional(v.union(v.literal("coach"), v.literal("external"))),
    phone: v.optional(v.string()),
    note: v.optional(v.string()),
  },
  returns: v.object({ ok: v.boolean() }),
  handler: async (ctx, args): Promise<{ ok: boolean }> => {
    const me: Identita = await ctx.runQuery(internal.sessions.whoAmI, {
      sessionToken: args.sessionToken,
    })
    if (!me || me.role !== "master") {
      throw new ConvexError("Přidávat kouče může pouze master účet.")
    }
    validatePassword(args.password)
    const email = normalizeEmail(args.email)
    if (!email.includes("@")) throw new ConvexError("Zadej platný e-mail.")

    const salt = crypto.randomBytes(16).toString("hex")
    await ctx.runMutation(internal.authInternal.insertCoach, {
      email,
      name: args.name.trim(),
      passwordHash: hashPassword(args.password, salt),
      salt,
      role: args.role ?? "coach",
      phone: args.phone?.trim() || undefined,
      note: args.note?.trim() || undefined,
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
    if (!me) throw new ConvexError("Přihlášení vypršelo.")
    const coach: CoachZaznam = await ctx.runQuery(internal.authInternal.findByEmail, {
      email: me.email,
    })
    if (!coach) throw new ConvexError("Účet nenalezen.")
    if (!safeEqual(hashPassword(args.currentPassword, coach.salt), coach.passwordHash)) {
      throw new ConvexError("Stávající heslo nesouhlasí.")
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

/**
 * Nové heslo pro cizí účet. Smí jen master.
 *
 * Hesla jsou uložená hashovaná, takže se stávající heslo nedá přečíst ani
 * poslat znovu. Místo toho se vygeneruje nové, jednou se zobrazí masterovi
 * a ten ho předá kouči. Změna hesla ukončí všechny relace daného účtu, takže
 * kdo byl přihlášený na cizím zařízení, vypadne.
 *
 * Vlastní heslo si tudy master změnit nemůže: na to slouží changePassword,
 * který vyžaduje znalost stávajícího hesla. Jinak by stačil ukradený
 * přihlášený prohlížeč k tomu, aby se účet dal nadobro převzít.
 */
export const resetCoachPassword = action({
  args: { sessionToken: v.string(), coachId: v.id("coaches") },
  returns: v.object({ password: v.string(), name: v.string(), email: v.string() }),
  handler: async (ctx, args): Promise<{ password: string; name: string; email: string }> => {
    const me: Identita = await ctx.runQuery(internal.sessions.whoAmI, {
      sessionToken: args.sessionToken,
    })
    if (!me || me.role !== "master") {
      throw new ConvexError("Nové heslo může vystavit pouze master účet.")
    }
    if (me.id === args.coachId) {
      throw new ConvexError(
        "Vlastní heslo si tudy změnit nelze. Použij změnu hesla, která se ptá na to stávající.",
      )
    }
    const coach = await ctx.runQuery(internal.authInternal.getCoachById, { coachId: args.coachId })
    if (!coach) throw new ConvexError("Účet nenalezen.")

    const heslo = generujHeslo()
    const salt = crypto.randomBytes(16).toString("hex")
    await ctx.runMutation(internal.authInternal.setPassword, {
      coachId: args.coachId,
      passwordHash: hashPassword(heslo, salt),
      salt,
    })
    return { password: heslo, name: coach.name, email: coach.email }
  },
})

/**
 * Nové heslo ve tvaru čtyř skupin po čtyřech znacích.
 *
 * Bez podobných znaků (0/O, 1/l), aby se dalo bez chyby nadiktovat do
 * telefonu. Devatenáct znaků z dvaatřicetiznakové abecedy dává kolem osmdesáti
 * bitů entropie, což je na dočasné heslo víc než dost.
 */
function generujHeslo(): string {
  const abeceda = "abcdefghijkmnpqrstuvwxyz23456789"
  const bajty = crypto.randomBytes(16)
  const znaky = [...bajty].map((b) => abeceda[b % abeceda.length])
  return [0, 4, 8, 12].map((i) => znaky.slice(i, i + 4).join("")).join("-")
}

/** Úprava jména a kontaktních údajů kouče. Smí jen master. */
export const updateCoach = action({
  args: {
    sessionToken: v.string(),
    coachId: v.id("coaches"),
    name: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    note: v.optional(v.string()),
  },
  returns: v.object({ ok: v.boolean() }),
  handler: async (ctx, args): Promise<{ ok: boolean }> => {
    const me: Identita = await ctx.runQuery(internal.sessions.whoAmI, {
      sessionToken: args.sessionToken,
    })
    if (!me || me.role !== "master") {
      throw new ConvexError("Upravovat účty může pouze master účet.")
    }
    const jmeno = args.name.trim()
    if (jmeno.length < 2) throw new ConvexError("Zadej jméno.")
    const email = normalizeEmail(args.email)
    if (!email.includes("@")) throw new ConvexError("Zadej platný e-mail.")

    await ctx.runMutation(internal.authInternal.updateCoachProfile, {
      coachId: args.coachId,
      name: jmeno,
      email,
      phone: args.phone?.trim() || undefined,
      note: args.note?.trim() || undefined,
    })
    return { ok: true }
  },
})
