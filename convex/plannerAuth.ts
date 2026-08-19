"use node"

import { ConvexError, v } from "convex/values"
import crypto from "node:crypto"
import { action } from "./_generated/server"
import { internal } from "./_generated/api"
import type { Id } from "./_generated/dataModel"

// Přihlašování klientů do týdenního plánovače.
//
// Běží v Node prostředí, aby šlo použít pořádnou kryptografii: hesla se
// nikdy neukládají v čitelné podobě. Postup je stejný jako u koučovských
// účtů v convex/auth.ts, jen nad vlastními tabulkami – deník je jiný druh
// dat než diagnostika a nemá s ní sdílet ani účty, ani relace.
//
// Účet nevzniká registrací, ale aktivací pozvánky od kouče. Heslo si volí
// klient sám při aktivaci, takže ho nikdo jiný nikdy nezná.

// Explicitní typy návratových hodnot. Bez nich TypeScript zacyklí odvozování,
// protože akce volají funkce přes `internal`, které se generují mimo jiné
// i z tohoto souboru (Convex chyby TS7022 / TS7023).
type Prihlaseni = { sessionToken: string; name: string; lang: string }
type KlientZaznam = {
  id: Id<"plannerClients">
  email: string
  name: string
  passwordHash: string
  salt: string
  active: boolean
  lang: string
} | null
type KlientPodleId = {
  id: Id<"plannerClients">
  email: string
  name: string
  passwordHash: string
  salt: string
  active: boolean
} | null
type Pozvanka = {
  id: Id<"plannerInvites">
  coachId: Id<"coaches">
  name: string
  email: string
  gender?: "male" | "female"
  lang: string
  expiresAt: number
  usedAt?: number
} | null

const PBKDF2_ITERATIONS = 210_000

/**
 * Platnost relace deníku.
 *
 * Delší než u koučů: deník je zápisník, do kterého se sahá každý den, a
 * odhlašovat se z něj po týdnu by lidi od psaní odradilo. Riziko je zároveň
 * menší, protože relace odemyká výhradně vlastní zápisky, ne cizí
 * psychologické profily. Platnost je klouzavá, takže kdo píše, zůstává
 * přihlášený, a kdo přestane, po měsíci vypadne.
 */
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

/**
 * Kontrola hesla na serveru.
 *
 * Hlášky jsou česky, i když plánovač mluví třemi jazyky. Není to opomenutí:
 * tatáž pravidla hlídá i prohlížeč (lib/planner/heslo.ts) a tam jsou hlášky
 * přeložené. Sem se text dostane jen tehdy, když někdo obejde formulář a
 * zavolá akci přímo, což není situace, kterou by mělo cenu překládat.
 */
const CASTA_HESLA = [
  "heslo",
  "password",
  "qwertz",
  "qwerty",
  "12345",
  "abcdef",
  "admin",
  "winning",
  "planner",
  "denik",
]

function validatePassword(password: string, email?: string, name?: string) {
  if (password.length < 10) throw new ConvexError("Heslo musí mít alespoň 10 znaků.")
  const male = password.toLowerCase()
  if (CASTA_HESLA.some((h) => male.includes(h))) {
    throw new ConvexError(
      "Heslo obsahuje příliš obvyklé slovo. Zvol něco, co se nedá uhodnout ze slovníku.",
    )
  }
  const zakazane = [email?.split("@")[0], name].filter((x): x is string => !!x && x.length >= 3)
  if (zakazane.some((x) => male.includes(x.toLowerCase()))) {
    throw new ConvexError("Heslo nesmí obsahovat tvoje jméno ani část e-mailu.")
  }
  // Horní mez: PBKDF2 počítá z celého vstupu, takže bez ní by šlo voláním
  // s obřím heslem vytížit server.
  if (password.length > 200) throw new ConvexError("Heslo je příliš dlouhé (nejvýš 200 znaků).")
}

/**
 * Ošetření neočekávané chyby uvnitř akce. Ověřené hlášky jdou ven beze změny,
 * cokoli jiného jen obecně a podrobnost míří do logu.
 */
async function sConvexChybou<T>(jmeno: string, fn: () => Promise<T>): Promise<T> {
  try {
    return await fn()
  } catch (e) {
    if (e instanceof ConvexError) throw e
    console.error(`Chyba při volání ${jmeno}:`, e)
    throw new ConvexError(
      `Operace ${jmeno} selhala z technických důvodů. Podrobnost je v Convexu v záložce Logs.`,
    )
  }
}

/**
 * Aktivace deníku z pozvánky.
 *
 * Klient přijde na odkaz od kouče, zvolí si heslo a tím účet vznikne.
 * Pozvánka se spotřebuje v téže transakci, takže ji nejde použít dvakrát.
 */
export const activate = action({
  args: { token: v.string(), password: v.string() },
  returns: v.object({ sessionToken: v.string(), name: v.string(), lang: v.string() }),
  handler: async (ctx, args): Promise<Prihlaseni> =>
    sConvexChybou("activate", async () => {
      const pozvanka: Pozvanka = await ctx.runQuery(internal.plannerAuthInternal.getInvite, {
        token: args.token,
      })
      if (!pozvanka) throw new ConvexError("Tenhle odkaz neplatí.")
      if (pozvanka.usedAt) throw new ConvexError("Odkaz už byl použitý. Přihlas se svým heslem.")
      if (pozvanka.expiresAt < Date.now()) {
        throw new ConvexError("Odkaz vypršel. Požádej kouče o nový.")
      }

      validatePassword(args.password, pozvanka.email, pozvanka.name)

      const salt = crypto.randomBytes(16).toString("hex")
      const clientId: Id<"plannerClients"> = await ctx.runMutation(
        internal.plannerAuthInternal.activateFromInvite,
        {
          inviteId: pozvanka.id,
          passwordHash: hashPassword(args.password, salt),
          salt,
        },
      )

      const sessionToken = newToken()
      await ctx.runMutation(internal.plannerAuthInternal.openSession, {
        clientId,
        token: sessionToken,
        days: SESSION_DAYS,
      })
      return { sessionToken, name: pozvanka.name, lang: pozvanka.lang }
    }),
})

/**
 * Přihlášení e-mailem a heslem.
 *
 * Po pěti neúspěších v patnácti minutách se účet na čas zamkne. Zamčení se
 * navenek neprojeví jinou hláškou: kdyby ano, dalo by se přes ně zjišťovat,
 * které e-maily v aplikaci existují.
 */
export const login = action({
  args: { email: v.string(), password: v.string() },
  returns: v.object({ sessionToken: v.string(), name: v.string(), lang: v.string() }),
  handler: async (ctx, args): Promise<Prihlaseni> => {
    const email = normalizeEmail(args.email)
    const chyba = "Nesprávný e-mail nebo heslo."

    const zamceno: boolean = await ctx.runQuery(internal.plannerAuthInternal.jeZamceno, { email })
    if (zamceno) throw new ConvexError(chyba)

    const klient: KlientZaznam = await ctx.runQuery(internal.plannerAuthInternal.findByEmail, {
      email,
    })
    // Neexistující účet se počítá taky: jinak by šlo podle toho, jestli se
    // zamyká, poznat, které e-maily v databázi jsou.
    if (!klient || !klient.active) {
      await ctx.runMutation(internal.plannerAuthInternal.zaznamenejNeuspech, { email })
      throw new ConvexError(chyba)
    }
    if (!safeEqual(hashPassword(args.password, klient.salt), klient.passwordHash)) {
      await ctx.runMutation(internal.plannerAuthInternal.zaznamenejNeuspech, { email })
      throw new ConvexError(chyba)
    }

    await ctx.runMutation(internal.plannerAuthInternal.vynulujPokusy, { email })
    const sessionToken = newToken()
    await ctx.runMutation(internal.plannerAuthInternal.openSession, {
      clientId: klient.id,
      token: sessionToken,
      days: SESSION_DAYS,
    })
    await ctx.runMutation(internal.plannerAuthInternal.zaznamenejPrihlaseni, {
      clientId: klient.id,
    })
    return { sessionToken, name: klient.name, lang: klient.lang }
  },
})

/** Změna vlastního hesla. Ukončí všechny relace včetně té současné. */
export const changePassword = action({
  args: { sessionToken: v.string(), currentPassword: v.string(), newPassword: v.string() },
  returns: v.object({ ok: v.boolean() }),
  handler: async (ctx, args): Promise<{ ok: boolean }> => {
    const id: Id<"plannerClients"> | null = await ctx.runQuery(internal.planner.whoAmIId, {
      sessionToken: args.sessionToken,
    })
    if (!id) throw new ConvexError("Přihlášení vypršelo.")
    const klient: KlientPodleId = await ctx.runQuery(internal.plannerAuthInternal.getById, {
      clientId: id,
    })
    if (!klient) throw new ConvexError("Účet nenalezen.")
    if (!safeEqual(hashPassword(args.currentPassword, klient.salt), klient.passwordHash)) {
      throw new ConvexError("Stávající heslo nesouhlasí.")
    }
    validatePassword(args.newPassword, klient.email, klient.name)
    const salt = crypto.randomBytes(16).toString("hex")
    await ctx.runMutation(internal.plannerAuthInternal.setPassword, {
      clientId: klient.id,
      passwordHash: hashPassword(args.newPassword, salt),
      salt,
    })
    return { ok: true }
  },
})
