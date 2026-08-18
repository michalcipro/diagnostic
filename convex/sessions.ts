import { ConvexError, v } from "convex/values"
import { internalQuery, mutation, query } from "./_generated/server"
import type { MutationCtx, QueryCtx } from "./_generated/server"
import type { Doc, Id } from "./_generated/dataModel"

// Ověřování přihlášené relace. Sdílí ho všechny funkce, které pracují
// s daty koučů – bez platné relace nevrátí žádná data.

export type Coach = Doc<"coaches">

/**
 * Kdo na čí vyplnění vidí.
 *
 * Externí kouč je samostatná větev: vidí výhradně to, co sám založil, a nikdo
 * z našich na jeho klienty nevidí. Uvnitř firmy zůstává přehled společný,
 * jak byl dosud, takže master i náš kouč vidí na všechna naše vyplnění.
 *
 * Vrací funkci, ne pole, aby se seznam externích účtů načetl jednou za dotaz;
 * tabulka koučů je malá, ale volat ji na každý řádek by bylo zbytečné.
 */
export async function filtrViditelnosti(
  ctx: QueryCtx,
  me: Coach,
): Promise<(vlastnik: Id<"coaches"> | undefined) => boolean> {
  // Kouč vidí výhradně klienty, které si sám pozval. Platí to pro externího
  // i pro našeho: u údajů o duševním zdraví nemá být přístup k cizímu klientovi
  // vedlejším účinkem toho, že člověk pracuje ve stejné firmě.
  if (me.role !== "master") {
    const mujId = me._id
    return (vlastnik) => vlastnik === mujId
  }

  // Master vidí celou naši větev, tedy i klienty ostatních našich koučů
  // a stará vyplnění bez vlastníka, která vznikla dřív, než se vlastnictví
  // začalo evidovat.
  //
  // Do větví externích koučů nevidí ani on. Na tom stojí jejich spolupráce
  // s námi: mají vlastní klienty, my jim do nich nevidíme a oni k nám taky ne.
  // Z jejich větve známe jen počty testů, aby šlo vystavit fakturu.
  const vsichni = await ctx.db.query("coaches").collect()
  const externi = new Set(vsichni.filter((c) => c.role === "external").map((c) => String(c._id)))
  return (vlastnik) => vlastnik === undefined || !externi.has(String(vlastnik))
}

/** Vyhodí chybu, pokud přihlášený není master. */
export function vyzadujMastera(me: Coach): void {
  if (me.role !== "master") throw new ConvexError("Přístup má pouze master účet.")
}

/**
 * Vrátí přihlášeného kouče, nebo vyhodí chybu. Používá se všude, kde se
 * pracuje s výsledky a pozvánkami.
 */
export async function requireCoach(ctx: QueryCtx, sessionToken: string): Promise<Coach> {
  const session = await ctx.db
    .query("coachSessions")
    .withIndex("by_token", (q) => q.eq("token", sessionToken))
    .unique()
  if (!session) throw new ConvexError("Nejsi přihlášený.")
  if (session.expiresAt < Date.now()) throw new ConvexError("Přihlášení vypršelo, přihlas se prosím znovu.")
  const coach = await ctx.db.get(session.coachId)
  if (!coach || !coach.active) throw new ConvexError("Účet není aktivní.")
  return coach
}

/**
 * Totéž pro mutace, navíc s posunutím platnosti relace a s možností zapsat
 * do přístupového logu.
 *
 * Platnost je klouzavá: kdo aplikaci používá, zůstává přihlášený, kdo ji nechá
 * ležet, vypadne. Posouvá se až ve druhé polovině platnosti, ať se nezapisuje
 * při každém kliknutí.
 */
export async function requireCoachProZapis(
  ctx: MutationCtx,
  sessionToken: string,
): Promise<Coach> {
  const session = await ctx.db
    .query("coachSessions")
    .withIndex("by_token", (q) => q.eq("token", sessionToken))
    .unique()
  if (!session) throw new ConvexError("Nejsi přihlášený.")
  const now = Date.now()
  if (session.expiresAt < now) throw new ConvexError("Přihlášení vypršelo, přihlas se prosím znovu.")
  const coach = await ctx.db.get(session.coachId)
  if (!coach || !coach.active) throw new ConvexError("Účet není aktivní.")

  const platnost = session.expiresAt - session.createdAt
  if (session.expiresAt - now < platnost / 2) {
    await ctx.db.patch(session._id, { expiresAt: now + platnost, lastSeenAt: now })
  } else if (!session.lastSeenAt || now - session.lastSeenAt > 60 * 60 * 1000) {
    await ctx.db.patch(session._id, { lastSeenAt: now })
  }
  return coach
}

/**
 * Zápis do přístupového logu.
 *
 * U zvláštní kategorie údajů je záznam o přístupu základní detekční opatření:
 * bez něj nejde zjistit, co se stalo, ani doložit, že se nestalo nic. Ukládá
 * se jen kdo, co a kdy, žádné osobní údaje v hodnotách.
 */
export async function zaznamenejPristup(
  ctx: MutationCtx,
  coachId: Id<"coaches">,
  akce: "otevreni-vysledku" | "export-vzorku" | "smazani-vysledku" | "vytvoreni-pozvanky",
  resultId?: Id<"eliteDiagnosticResults">,
): Promise<void> {
  await ctx.db.insert("pristupovyLog", { coachId, akce, resultId, at: Date.now() })
}

/** Ukončí všechny relace daného kouče. Používá se při „odhlásit všude". */
export async function ukonciRelace(ctx: MutationCtx, coachId: Id<"coaches">): Promise<number> {
  const relace = await ctx.db
    .query("coachSessions")
    .withIndex("by_coach", (q) => q.eq("coachId", coachId))
    .collect()
  for (const r of relace) await ctx.db.delete(r._id)
  return relace.length
}

/** Interní varianta pro akce – vrací null místo chyby. */
export const whoAmI = internalQuery({
  args: { sessionToken: v.string() },
  returns: v.union(
    v.object({
      id: v.id("coaches"),
      email: v.string(),
      name: v.string(),
      role: v.union(v.literal("master"), v.literal("coach"), v.literal("external")),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    try {
      const coach = await requireCoach(ctx, args.sessionToken)
      return { id: coach._id, email: coach.email, name: coach.name, role: coach.role }
    } catch {
      return null
    }
  },
})

/**
 * Označení verze backendu. Zvyš ho pokaždé, když se mění chování zakládání
 * účtu – zakládací stránka ho zobrazuje, takže je na první pohled vidět, jestli
 * je nasazená nová verze, nebo prohlížeč drží starou. Bez toho se „pořád stejná
 * chyba" nedá odlišit od „oprava ještě nedojela".
 */
const VERZE_BACKENDU = "3"

/**
 * Zjistí, jestli je potřeba založit master účet (veřejné, bez dat).
 */
export const setupStatus = query({
  args: {},
  returns: v.object({ needsSetup: v.boolean(), verze: v.string() }),
  handler: async (ctx) => {
    const first = await ctx.db.query("coaches").first()
    return { needsSetup: first === null, verze: VERZE_BACKENDU }
  },
})

/** Informace o přihlášeném kouči pro hlavičku aplikace. */
export const me = query({
  args: { sessionToken: v.string() },
  returns: v.union(
    v.object({
      name: v.string(),
      email: v.string(),
      role: v.union(v.literal("master"), v.literal("coach"), v.literal("external")),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    try {
      const coach = await requireCoach(ctx, args.sessionToken)
      return { name: coach.name, email: coach.email, role: coach.role }
    } catch {
      return null
    }
  },
})

/** Odhlášení – zruší relaci na serveru. */
export const logout = mutation({
  args: { sessionToken: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("coachSessions")
      .withIndex("by_token", (q) => q.eq("token", args.sessionToken))
      .unique()
    if (session) await ctx.db.delete(session._id)
    return null
  },
})

/** Seznam koučů. Vidí ho pouze master. */
export const listCoaches = query({
  args: { sessionToken: v.string() },
  returns: v.array(
    v.object({
      id: v.id("coaches"),
      name: v.string(),
      email: v.string(),
      role: v.union(v.literal("master"), v.literal("coach"), v.literal("external")),
      phone: v.optional(v.string()),
      note: v.optional(v.string()),
      active: v.boolean(),
      createdAt: v.number(),
      lastLoginAt: v.optional(v.number()),
    }),
  ),
  handler: async (ctx, args) => {
    const me = await requireCoach(ctx, args.sessionToken)
    vyzadujMastera(me)
    const all = await ctx.db.query("coaches").collect()
    return all.map((c) => ({
      id: c._id,
      name: c.name,
      email: c.email,
      role: c.role,
      phone: c.phone,
      note: c.note,
      active: c.active,
      createdAt: c.createdAt,
      lastLoginAt: c.lastLoginAt,
    }))
  },
})

/** Zapnutí/vypnutí přístupu kouče. Smí jen master, sám sebe vypnout nemůže. */
export const setCoachActive = mutation({
  args: { sessionToken: v.string(), coachId: v.id("coaches"), active: v.boolean() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const me = await requireCoach(ctx, args.sessionToken)
    vyzadujMastera(me)
    if (me._id === args.coachId) throw new ConvexError("Vlastní účet vypnout nelze.")
    await ctx.db.patch(args.coachId, { active: args.active })
    if (!args.active) {
      const sessions = await ctx.db
        .query("coachSessions")
        .withIndex("by_coach", (q) => q.eq("coachId", args.coachId))
        .collect()
      for (const s of sessions) await ctx.db.delete(s._id)
    }
    return null
  },
})

/**
 * Odhlášení ze všech zařízení.
 *
 * Kdo má podezření, že mu někdo kouká do účtu, tím ukončí i relaci, ke které
 * se sám nedostane. Ruší i tu vlastní, takže se po ní přihlašuje znovu.
 */
export const logoutAll = mutation({
  args: { sessionToken: v.string() },
  returns: v.object({ ukonceno: v.number() }),
  handler: async (ctx, args) => {
    const me = await requireCoach(ctx, args.sessionToken)
    const ukonceno = await ukonciRelace(ctx, me._id)
    return { ukonceno }
  },
})

/**
 * Přehled přístupů k výsledkům. Vidí ho pouze master.
 *
 * Slouží ke kontrole, kdo se kdy díval na klientské profily. Vrací posledních
 * 500 záznamů, novější první.
 */
export const pristupovyLog = query({
  args: { sessionToken: v.string() },
  returns: v.array(
    v.object({
      coachName: v.string(),
      akce: v.string(),
      at: v.number(),
    }),
  ),
  handler: async (ctx, args) => {
    vyzadujMastera(await requireCoach(ctx, args.sessionToken))
    const zaznamy = await ctx.db.query("pristupovyLog").withIndex("by_at").order("desc").take(500)
    const jmena = new Map<string, string>()
    for (const c of await ctx.db.query("coaches").collect()) jmena.set(String(c._id), c.name)
    return zaznamy.map((z) => ({
      coachName: jmena.get(String(z.coachId)) ?? "neznámý účet",
      akce: z.akce,
      at: z.at,
    }))
  },
})
