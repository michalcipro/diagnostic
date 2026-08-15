import { ConvexError, v } from "convex/values"
import { mutation, query } from "./_generated/server"
import { filtrViditelnosti, odmitniExterniho, requireCoach, vyzadujMastera } from "./sessions"

// ─────────────────────────────────────────────────────────────────────────────
// ELITE Performance Diagnostic – backend.
//
// PŘÍSTUP: dotazník lze otevřít i odeslat pouze s platnou pozvánkou. Kouč
// vygeneruje odkaz s neuhodnutelným tokenem pro jednoho klienta a jeden test;
// odesláním se pozvánka spotřebuje. Bez tokenu není kudy nic odeslat, takže
// nehrozí spam ani vyplňování testů, které klientovi nepatří.
//
// VÝSLEDKY: odpovědi ani vyhodnocení se NIKDY nevrací bez platné přihlášené
// relace kouče, která se ověřuje zde na serveru. Kdyby se kontrolovalo jen
// v prohlížeči, kdokoli by si data stáhl přes veřejné API.
// ─────────────────────────────────────────────────────────────────────────────

const JAZYKY = new Set(["cs", "en", "sk"])

const TEST_IDS = new Set([
  "elite200-sport",
  "elite200-business",
  "elite100-sport",
  "elite100-business",
  "vzorce",
  // původní nerozdělená sportovní verze; nové pozvánky se nevystavují,
  // ale rozeslané odkazy musí jít dokončit
  "vzorce-sport",
  "vzorce-sport-individual",
  "vzorce-sport-tym",
])

/**
 * Počet položek a rozsah škály podle testu.
 *
 * Emocionálně-destruktivní vzorce mají 110 položek a škálu 1-6, rodina ELITE
 * 100 nebo 200 položek a škálu 1-5. Kontroluje se to tady na serveru, protože
 * kontrola jen v prohlížeči by se dala obejít.
 */
function parametryTestu(testId: string): { pocet: number; maxHodnota: number } {
  if (testId.startsWith("vzorce")) return { pocet: 110, maxHodnota: 6 }
  return { pocet: testId.startsWith("elite200") ? 200 : 100, maxHodnota: 5 }
}

const personValidator = v.object({
  name: v.string(),
  birthDate: v.optional(v.string()),
  role: v.optional(v.string()),
  /** rod pro české vyhodnocení; u starších záznamů chybí */
  gender: v.optional(v.union(v.literal("male"), v.literal("female"))),
  fillDate: v.string(),
})

/**
 * Rok narození z data ve tvaru „YYYY-MM-DD".
 *
 * Do normativního vzorku se ukládá jen rok – celé datum narození je ve spojení
 * s povoláním prakticky identifikátor.
 */
function birthYearOnly(birthDate?: string): number | undefined {
  if (!birthDate) return undefined
  const rok = Number(birthDate.slice(0, 4))
  if (!Number.isInteger(rok)) return undefined
  const letos = new Date().getFullYear()
  return rok >= 1900 && rok <= letos ? rok : undefined
}

/** Povolání / disciplína, zkrácené – delší text bývá spíš vyprávění než údaj. */
function shortRole(role?: string): string | undefined {
  const t = role?.trim()
  return t ? t.slice(0, 120) : undefined
}

/** Měsíc pořízení, „2026-07". Přesný čas by šel spárovat s vyplněním. */
function collectedMonth(now: number): string {
  return new Date(now).toISOString().slice(0, 7)
}

/** Token do odkazu. Bez podobných znaků (0/O, 1/l), ať se dá případně přečíst. */
function makeToken(): string {
  const alphabet = "abcdefghijkmnpqrstuvwxyz23456789"
  let out = ""
  for (let i = 0; i < 16; i++) {
    out += alphabet[Math.floor(Math.random() * alphabet.length)]
  }
  return out
}

// ---------------------------------------------------------------------------
// Pozvánky
// ---------------------------------------------------------------------------

/** Vytvoří pozvánku na jedno použití. Pouze pro kouče. */
export const createInvite = mutation({
  args: {
    sessionToken: v.string(),
    testId: v.string(),
    lang: v.string(),
    clientName: v.optional(v.string()),
    note: v.optional(v.string()),
  },
  returns: v.object({ token: v.string() }),
  handler: async (ctx, args) => {
    const me = await requireCoach(ctx, args.sessionToken)
    if (!TEST_IDS.has(args.testId)) {
      throw new ConvexError(`Neznámý testId: ${args.testId}`)
    }
    const token = makeToken()
    await ctx.db.insert("invitations", {
      token,
      testId: args.testId,
      lang: JAZYKY.has(args.lang) ? args.lang : "cs",
      clientName: args.clientName,
      note: args.note,
      // Vlastník rozhoduje, do čí větve vyplnění spadne.
      coachId: me._id,
      createdAt: Date.now(),
    })
    return { token }
  },
})

/**
 * Veřejné načtení pozvánky podle tokenu – potřebuje ho respondent, aby se mu
 * otevřel správný test. Vrací pouze to, co je k zobrazení dotazníku nutné;
 * žádné odpovědi ani vyhodnocení.
 */
export const getInvite = query({
  args: { token: v.string() },
  returns: v.object({
    status: v.union(v.literal("ok"), v.literal("used"), v.literal("notfound")),
    testId: v.optional(v.string()),
    lang: v.optional(v.string()),
    clientName: v.optional(v.string()),
  }),
  handler: async (ctx, args) => {
    const inv = await ctx.db
      .query("invitations")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .unique()
    if (!inv) return { status: "notfound" as const }
    if (inv.usedAt) return { status: "used" as const }
    return {
      status: "ok" as const,
      testId: inv.testId,
      lang: inv.lang,
      clientName: inv.clientName,
    }
  },
})

/** Souhrn pozvánky pro přehled kouče. */
const inviteValidator = v.object({
  id: v.id("invitations"),
  token: v.string(),
  testId: v.string(),
  lang: v.string(),
  clientName: v.optional(v.string()),
  note: v.optional(v.string()),
  createdAt: v.number(),
  usedAt: v.optional(v.number()),
  resultId: v.optional(v.id("eliteDiagnosticResults")),
})

/** Seznam pozvánek. Pouze pro kouče. */
export const listInvites = query({
  args: { sessionToken: v.string() },
  returns: v.array(inviteValidator),
  handler: async (ctx, args) => {
    const me = await requireCoach(ctx, args.sessionToken)
    const vidi = await filtrViditelnosti(ctx, me)
    const vsechny = await ctx.db.query("invitations").withIndex("by_created").order("desc").take(500)
    const docs = vsechny.filter((d) => vidi(d.coachId))
    return docs.map((d) => ({
      id: d._id,
      token: d.token,
      testId: d.testId,
      lang: d.lang,
      clientName: d.clientName,
      note: d.note,
      createdAt: d.createdAt,
      usedAt: d.usedAt,
      resultId: d.resultId,
    }))
  },
})

/** Zruší (smaže) pozvánku. Pouze pro kouče. */
export const revokeInvite = mutation({
  args: { sessionToken: v.string(), id: v.id("invitations") },
  returns: v.object({ ok: v.boolean() }),
  handler: async (ctx, args) => {
    const me = await requireCoach(ctx, args.sessionToken)
    const doc = await ctx.db.get(args.id)
    if (!doc) return { ok: true }
    const vidi = await filtrViditelnosti(ctx, me)
    if (!vidi(doc.coachId)) throw new ConvexError("Tahle pozvánka do tvé větve nepatří.")
    await ctx.db.delete(args.id)
    return { ok: true }
  },
})

// ---------------------------------------------------------------------------
// Odeslání vyplněného dotazníku
// ---------------------------------------------------------------------------

/**
 * Odeslání dotazníku proti pozvánce. Vrací jen potvrzení – respondent
 * záměrně nedostává žádné výsledky ani odkaz na ně.
 */
export const submitWithInvite = mutation({
  args: {
    token: v.string(),
    person: personValidator,
    answers: v.string(), // JSON { "1": 4, … }
    /** doba vyplňování v sekundách; vstupuje do kontroly validity */
    durationSec: v.optional(v.number()),
  },
  returns: v.object({ ok: v.boolean() }),
  handler: async (ctx, args) => {
    const inv = await ctx.db
      .query("invitations")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .unique()
    if (!inv) throw new ConvexError("Neplatný odkaz.")
    if (inv.usedAt) throw new ConvexError("Tento odkaz už byl použit.")

    // Vzorce nemají variantu v tom smyslu jako ELITE (sport nebo business),
    // takže se pro ně doplní zástupná hodnota podle testu.
    const [model, variant] = inv.testId.startsWith("vzorce")
      ? [
          "vzorce",
          inv.testId === "vzorce"
            ? "obecna"
            : inv.testId === "vzorce-sport-individual"
              ? "sport-individual"
              : "sport-tym",
        ]
      : inv.testId.split("-")

    let parsed: Record<string, number>
    try {
      parsed = JSON.parse(args.answers) as Record<string, number>
    } catch {
      throw new ConvexError("answers není validní JSON")
    }
    const { pocet: itemCount, maxHodnota } = parametryTestu(inv.testId)
    let answeredCount = 0
    for (let i = 1; i <= itemCount; i++) {
      const value = parsed[String(i)]
      if (value !== undefined) {
        if (typeof value !== "number" || !Number.isInteger(value) || value < 1 || value > maxHodnota) {
          throw new ConvexError(`Neplatná odpověď u položky ${i}`)
        }
        answeredCount++
      }
    }

    const now = Date.now()
    // Nesmyslné hodnoty (záporné, absurdně dlouhé) zahoď – index tempa se pak
    // prostě nepočítá, místo aby počítal s nesmyslem.
    const durationSec =
      typeof args.durationSec === "number" && args.durationSec > 0 && args.durationSec < 86400
        ? Math.round(args.durationSec)
        : undefined

    const resultId = await ctx.db.insert("eliteDiagnosticResults", {
      testId: inv.testId,
      model,
      variant,
      lang: inv.lang,
      person: args.person,
      answers: args.answers,
      answeredCount,
      complete: answeredCount === itemCount,
      durationSec,
      coachId: inv.coachId,
      createdAt: now,
    })
    // Anonymní kopie do normativního vzorku.
    //
    // Vědomě se NEUKLÁDÁ jméno, celé datum narození ani odkaz na vyplnění výše –
    // jinak by šel záznam spárovat zpět s člověkem a anonymizace by byla jen
    // naoko. Vzorek slouží k výpočtu norem, reliability a faktorové struktury,
    // k čemuž stačí odpovědi, rok narození a povolání.
    await ctx.db.insert("normSamples", {
      testId: inv.testId,
      model,
      variant,
      lang: inv.lang,
      birthYear: birthYearOnly(args.person.birthDate),
      gender: args.person.gender,
      role: shortRole(args.person.role),
      answers: args.answers,
      answeredCount,
      complete: answeredCount === itemCount,
      durationSec,
      collectedMonth: collectedMonth(now),
    })

    // Pozvánku spotřebuj – odkaz už podruhé nepustí.
    await ctx.db.patch(inv._id, { usedAt: now, resultId })
    return { ok: true }
  },
})

// ---------------------------------------------------------------------------
// Výsledky (pouze kouč)
// ---------------------------------------------------------------------------

const summaryValidator = v.object({
  id: v.id("eliteDiagnosticResults"),
  testId: v.string(),
  model: v.string(),
  variant: v.string(),
  lang: v.string(),
  personName: v.string(),
  personRole: v.optional(v.string()),
  fillDate: v.string(),
  answeredCount: v.number(),
  complete: v.boolean(),
  createdAt: v.number(),
})

export const listForCoach = query({
  args: { sessionToken: v.string() },
  returns: v.array(summaryValidator),
  handler: async (ctx, args) => {
    const me = await requireCoach(ctx, args.sessionToken)
    const vidi = await filtrViditelnosti(ctx, me)
    const vsechna = await ctx.db
      .query("eliteDiagnosticResults")
      .withIndex("by_created")
      .order("desc")
      .take(500)
    const docs = vsechna.filter((d) => vidi(d.coachId))
    return docs.map((d) => ({
      id: d._id,
      testId: d.testId,
      model: d.model,
      variant: d.variant,
      lang: d.lang,
      personName: d.person.name,
      personRole: d.person.role,
      fillDate: d.person.fillDate,
      answeredCount: d.answeredCount,
      complete: d.complete,
      createdAt: d.createdAt,
    }))
  },
})

export const getForCoach = query({
  args: { sessionToken: v.string(), id: v.id("eliteDiagnosticResults") },
  returns: v.union(
    v.object({
      id: v.id("eliteDiagnosticResults"),
      testId: v.string(),
      lang: v.string(),
      person: personValidator,
      answers: v.string(),
      answeredCount: v.number(),
      complete: v.boolean(),
      durationSec: v.optional(v.number()),
      createdAt: v.number(),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    const me = await requireCoach(ctx, args.sessionToken)
    const d = await ctx.db.get(args.id)
    if (!d) return null
    // Cizí větev se nevrací ani na přímý dotaz s uhodnutým id.
    const vidi = await filtrViditelnosti(ctx, me)
    if (!vidi(d.coachId)) return null
    return {
      id: d._id,
      testId: d.testId,
      lang: d.lang,
      person: d.person,
      answers: d.answers,
      answeredCount: d.answeredCount,
      complete: d.complete,
      durationSec: d.durationSec,
      createdAt: d.createdAt,
    }
  },
})

// ---------------------------------------------------------------------------
// Normativní vzorek (pouze kouč)
// ---------------------------------------------------------------------------

/**
 * Kolik anonymních záznamů se zatím nasbíralo, po testech.
 *
 * Orientační milníky: od ~100 záznamů na variantu dávají smysl percentily
 * a reliabilita (α/ω), od ~250 konfirmační faktorová analýza.
 */
export const normStats = query({
  args: { sessionToken: v.string() },
  returns: v.object({
    total: v.number(),
    byTest: v.array(v.object({ testId: v.string(), count: v.number(), complete: v.number() })),
    months: v.array(v.string()),
  }),
  handler: async (ctx, args) => {
    odmitniExterniho(await requireCoach(ctx, args.sessionToken))
    const vsechny = await ctx.db.query("normSamples").collect()
    const mapa = new Map<string, { count: number; complete: number }>()
    for (const id of TEST_IDS) mapa.set(id, { count: 0, complete: 0 })
    const mesice = new Set<string>()
    for (const z of vsechny) {
      const m = mapa.get(z.testId) ?? { count: 0, complete: 0 }
      m.count++
      if (z.complete) m.complete++
      mapa.set(z.testId, m)
      mesice.add(z.collectedMonth)
    }
    return {
      total: vsechny.length,
      byTest: [...mapa].map(([testId, m]) => ({ testId, ...m })),
      months: [...mesice].sort(),
    }
  },
})

/**
 * Export vzorku k analýze. Vrací přesně to, co je v tabulce – tedy bez jmen,
 * bez celých dat narození a bez vazby na konkrétní vyplnění.
 */
export const normExport = query({
  args: { sessionToken: v.string() },
  returns: v.array(
    v.object({
      testId: v.string(),
      model: v.string(),
      variant: v.string(),
      lang: v.string(),
      birthYear: v.optional(v.number()),
      role: v.optional(v.string()),
      answers: v.string(),
      answeredCount: v.number(),
      complete: v.boolean(),
      durationSec: v.optional(v.number()),
      collectedMonth: v.string(),
    }),
  ),
  handler: async (ctx, args) => {
    odmitniExterniho(await requireCoach(ctx, args.sessionToken))
    const vsechny = await ctx.db.query("normSamples").take(5000)
    return vsechny.map((z) => ({
      testId: z.testId,
      model: z.model,
      variant: z.variant,
      lang: z.lang,
      birthYear: z.birthYear,
      role: z.role,
      answers: z.answers,
      answeredCount: z.answeredCount,
      complete: z.complete,
      durationSec: z.durationSec,
      collectedMonth: z.collectedMonth,
    }))
  },
})

/** Smazání vyplnění. Pouze pro kouče. */
export const removeForCoach = mutation({
  args: { sessionToken: v.string(), id: v.id("eliteDiagnosticResults") },
  returns: v.object({ ok: v.boolean() }),
  handler: async (ctx, args) => {
    const me = await requireCoach(ctx, args.sessionToken)
    const doc = await ctx.db.get(args.id)
    if (!doc) return { ok: true }
    const vidi = await filtrViditelnosti(ctx, me)
    if (!vidi(doc.coachId)) throw new ConvexError("Tohle vyplnění do tvé větve nepatří.")
    await ctx.db.delete(args.id)
    return { ok: true }
  },
})

// ---------------------------------------------------------------------------
// Přehled větví externích koučů (pouze master)
// ---------------------------------------------------------------------------

/**
 * Podklad pro fakturaci externímu kouči.
 *
 * Záměrně BEZ jakéhokoli osobního údaje: vrací se jen typ testu, datum
 * a úplnost. Jméno, datum narození ani odpovědi tudy neprojdou, protože
 * externí kouč má vlastní větev klientů a my do ní nevidíme. Na účtování
 * stačí vědět, kolik testů kterého typu a kdy proběhlo.
 */
export const externalUsage = query({
  args: { sessionToken: v.string() },
  returns: v.array(
    v.object({
      coachId: v.id("coaches"),
      name: v.string(),
      email: v.string(),
      note: v.optional(v.string()),
      active: v.boolean(),
      createdAt: v.number(),
      celkem: v.number(),
      podleTestu: v.array(v.object({ testId: v.string(), pocet: v.number() })),
      podleMesice: v.array(
        v.object({
          mesic: v.string(),
          pocet: v.number(),
          podleTestu: v.array(v.object({ testId: v.string(), pocet: v.number() })),
        }),
      ),
      zaznamy: v.array(
        v.object({
          testId: v.string(),
          lang: v.string(),
          createdAt: v.number(),
          complete: v.boolean(),
          answeredCount: v.number(),
        }),
      ),
    }),
  ),
  handler: async (ctx, args) => {
    vyzadujMastera(await requireCoach(ctx, args.sessionToken))

    const vsichni = await ctx.db.query("coaches").collect()
    const externi = vsichni.filter((c) => c.role === "external")

    const out = []
    for (const c of externi) {
      const vyplneni = await ctx.db
        .query("eliteDiagnosticResults")
        .withIndex("by_coach", (q) => q.eq("coachId", c._id))
        .collect()

      const podleTestu = new Map<string, number>()
      const podleMesice = new Map<string, Map<string, number>>()
      for (const d of vyplneni) {
        podleTestu.set(d.testId, (podleTestu.get(d.testId) ?? 0) + 1)
        const mesic = collectedMonth(d.createdAt)
        const vMesici = podleMesice.get(mesic) ?? new Map<string, number>()
        vMesici.set(d.testId, (vMesici.get(d.testId) ?? 0) + 1)
        podleMesice.set(mesic, vMesici)
      }

      out.push({
        coachId: c._id,
        name: c.name,
        email: c.email,
        note: c.note,
        active: c.active,
        createdAt: c.createdAt,
        celkem: vyplneni.length,
        podleTestu: [...podleTestu.entries()]
          .map(([testId, pocet]) => ({ testId, pocet }))
          .sort((a, b) => b.pocet - a.pocet),
        podleMesice: [...podleMesice.entries()]
          .sort((a, b) => b[0].localeCompare(a[0]))
          .map(([mesic, testy]) => ({
            mesic,
            pocet: [...testy.values()].reduce((a, b) => a + b, 0),
            podleTestu: [...testy.entries()]
              .map(([testId, pocet]) => ({ testId, pocet }))
              .sort((a, b) => b.pocet - a.pocet),
          })),
        zaznamy: vyplneni
          .sort((a, b) => b.createdAt - a.createdAt)
          .map((d) => ({
            testId: d.testId,
            lang: d.lang,
            createdAt: d.createdAt,
            complete: d.complete,
            answeredCount: d.answeredCount,
          })),
      })
    }
    return out.sort((a, b) => b.celkem - a.celkem)
  },
})
