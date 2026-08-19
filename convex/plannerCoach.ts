import { ConvexError, v } from "convex/values"
import { mutation, query } from "./_generated/server"
import {
  filtrViditelnosti,
  requireCoach,
  requireCoachProZapis,
  zaznamenejPristup,
} from "./sessions"
import { makeToken } from "./nahoda"
import { overPristupKDenikum } from "./plannerPilot"

// Správa deníků z pohledu kouče: zakládání, přehled, blokování.
//
// ODSUD SE OBSAH DENÍKU NEVRACÍ. Ani na úrovni `vse`, ani masterovi. Jde
// získat jedině jméno, e-mail, jazyk, stav účtu, úroveň sdílení, počet
// založených dnů a čas poslední aktivity. Nic z toho neprozrazuje, co je
// uvnitř.
//
// Nahlížení do deníku má vlastní soubor, plannerCoachRead.ts, a vlastní
// pravidla. Je oddělené schválně: díky tomu jde o téhle části strojově
// tvrdit, že se přes ni obsah nedostane, a to tvrzení platí i po každé
// pozdější úpravě. Hlídá to scripts/audit-pristupu.cjs.

/** Jak dlouho platí nepoužitá pozvánka do deníku. */
const PLATNOST_POZVANKY_DNI = 30

const genderValidator = v.union(v.literal("male"), v.literal("female"))
const sdileniValidator = v.union(v.literal("nic"), v.literal("cisla"), v.literal("vse"))
const JAZYKY = new Set(["cs", "en", "sk"])

const MEZ = { jmeno: 120, email: 200 } as const

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

/** Založení deníku pro klienta. Vrátí odkaz, který kouč pošle dál. */
export const createPlannerInvite = mutation({
  args: {
    sessionToken: v.string(),
    name: v.string(),
    email: v.string(),
    gender: v.optional(genderValidator),
    lang: v.string(),
    sdileni: v.optional(sdileniValidator),
  },
  returns: v.object({ token: v.string() }),
  handler: async (ctx, args) => {
    const kouc = await requireCoachProZapis(ctx, args.sessionToken)
    overPristupKDenikum(kouc)
    const jmeno = args.name.trim()
    const email = normalizeEmail(args.email)
    if (jmeno.length < 2) throw new ConvexError("Zadej jméno klienta.")
    if (jmeno.length > MEZ.jmeno) throw new ConvexError("Jméno je příliš dlouhé.")
    if (!email.includes("@") || email.length > MEZ.email) {
      throw new ConvexError("Zadej platný e-mail.")
    }
    if (!JAZYKY.has(args.lang)) throw new ConvexError("Neznámý jazyk.")

    const existujici = await ctx.db
      .query("plannerClients")
      .withIndex("by_email", (q) => q.eq("email", email))
      .unique()
    if (existujici) throw new ConvexError("Deník s tímto e-mailem už existuje.")

    const token = makeToken()
    await ctx.db.insert("plannerInvites", {
      token,
      coachId: kouc._id,
      name: jmeno,
      email,
      gender: args.gender,
      lang: args.lang,
      sdileni: args.sdileni ?? "nic",
      createdAt: Date.now(),
      expiresAt: Date.now() + PLATNOST_POZVANKY_DNI * 24 * 60 * 60 * 1000,
    })
    await zaznamenejPristup(ctx, kouc._id, "vytvoreni-deniku")
    return { token }
  },
})

/**
 * Pozvánka tak, jak ji vidí klient na odkazu. Veřejné, bez přihlášení.
 *
 * Pilotní režim se sem nevztahuje schválně: kdo drží neuhodnutelný token,
 * dostal ho od mastera a musí si deník zvládnout založit. Kontrola role by
 * tu byla k ničemu, protože klient žádnou roli nemá.
 */
export const getPlannerInvite = query({
  args: { token: v.string() },
  returns: v.object({
    status: v.union(
      v.literal("ok"),
      v.literal("used"),
      v.literal("expired"),
      v.literal("notfound"),
    ),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    lang: v.optional(v.string()),
  }),
  handler: async (ctx, args) => {
    const p = await ctx.db
      .query("plannerInvites")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .unique()
    if (!p) return { status: "notfound" as const }
    if (p.usedAt) return { status: "used" as const }
    if (p.expiresAt < Date.now()) return { status: "expired" as const }
    // Jméno a e-mail se vracejí proto, aby klient viděl, na čí deník odkaz
    // patří, a nezaložil si ho omylem někdo jiný. Nic dalšího tu není.
    return { status: "ok" as const, name: p.name, email: p.email, lang: p.lang }
  },
})

/** Seznam klientů s deníkem. Obsah deníku se odsud nedá dostat. */
export const listPlannerClients = query({
  args: { sessionToken: v.string() },
  returns: v.array(
    v.object({
      id: v.id("plannerClients"),
      name: v.string(),
      email: v.string(),
      gender: v.optional(genderValidator),
      lang: v.string(),
      active: v.boolean(),
      createdAt: v.number(),
      lastLoginAt: v.optional(v.number()),
      dnu: v.number(),
      lastActivityAt: v.optional(v.number()),
      /** chybějící hodnota u starších účtů znamená `nic`, viz schema.ts */
      sdileni: v.union(v.literal("nic"), v.literal("cisla"), v.literal("vse")),
      /** účet čeká na to, až si klient změní vygenerované heslo */
      cekaNaZmenuHesla: v.boolean(),
    }),
  ),
  handler: async (ctx, args) => {
    const kouc = await requireCoach(ctx, args.sessionToken)
    overPristupKDenikum(kouc)
    const viditelny = await filtrViditelnosti(ctx, kouc)
    const vse = await ctx.db.query("plannerClients").collect()
    return vse
      .filter((k) => viditelny(k.coachId))
      .sort((a, b) => b.createdAt - a.createdAt)
      .map((k) => ({
        id: k._id,
        name: k.name,
        email: k.email,
        gender: k.gender,
        lang: k.lang,
        active: k.active,
        createdAt: k.createdAt,
        lastLoginAt: k.lastLoginAt,
        dnu: k.dnu ?? 0,
        lastActivityAt: k.lastActivityAt,
        sdileni: k.sdileni ?? "nic",
        cekaNaZmenuHesla: k.mustChangePassword === true,
      }))
  },
})

/** Nepoužité a nedávné pozvánky do deníku. */
export const listPlannerInvites = query({
  args: { sessionToken: v.string() },
  returns: v.array(
    v.object({
      id: v.id("plannerInvites"),
      token: v.string(),
      name: v.string(),
      email: v.string(),
      lang: v.string(),
      createdAt: v.number(),
      expiresAt: v.number(),
      usedAt: v.optional(v.number()),
      sdileni: v.union(v.literal("nic"), v.literal("cisla"), v.literal("vse")),
    }),
  ),
  handler: async (ctx, args) => {
    const kouc = await requireCoach(ctx, args.sessionToken)
    overPristupKDenikum(kouc)
    const viditelny = await filtrViditelnosti(ctx, kouc)
    const vse = await ctx.db.query("plannerInvites").withIndex("by_created").order("desc").take(200)
    return vse
      .filter((p) => viditelny(p.coachId))
      .map((p) => ({
        id: p._id,
        token: p.token,
        name: p.name,
        email: p.email,
        lang: p.lang,
        createdAt: p.createdAt,
        expiresAt: p.expiresAt,
        usedAt: p.usedAt,
        sdileni: p.sdileni ?? "nic",
      }))
  },
})

/** Zrušení nepoužité pozvánky. Použitou už rušit nejde, účet z ní existuje. */
export const revokePlannerInvite = mutation({
  args: { sessionToken: v.string(), inviteId: v.id("plannerInvites") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const kouc = await requireCoachProZapis(ctx, args.sessionToken)
    overPristupKDenikum(kouc)
    const p = await ctx.db.get(args.inviteId)
    if (!p) return null
    const viditelny = await filtrViditelnosti(ctx, kouc)
    if (!viditelny(p.coachId)) throw new ConvexError("K téhle pozvánce nemáš přístup.")
    if (p.usedAt) throw new ConvexError("Použitou pozvánku zrušit nelze, deník už existuje.")
    await ctx.db.delete(p._id)
    return null
  },
})

/**
 * Zablokování a obnovení přístupu do deníku.
 *
 * Blokace přístup odepře a ukončí relace, ale zápisky nemaže. Mazat cizí
 * deník kouč nemůže vůbec: obsah mu nepatří a nikdy ho neviděl.
 */
export const setPlannerClientActive = mutation({
  args: { sessionToken: v.string(), clientId: v.id("plannerClients"), active: v.boolean() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const kouc = await requireCoachProZapis(ctx, args.sessionToken)
    overPristupKDenikum(kouc)
    const klient = await ctx.db.get(args.clientId)
    if (!klient) throw new ConvexError("Deník nenalezen.")
    const viditelny = await filtrViditelnosti(ctx, kouc)
    if (!viditelny(klient.coachId)) throw new ConvexError("K tomuhle deníku nemáš přístup.")

    await ctx.db.patch(args.clientId, { active: args.active })
    if (!args.active) {
      const relace = await ctx.db
        .query("plannerSessions")
        .withIndex("by_client", (q) => q.eq("clientId", args.clientId))
        .collect()
      for (const r of relace) await ctx.db.delete(r._id)
    }
    return null
  },
})
