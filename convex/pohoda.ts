import { v } from "convex/values"
import { mutation, query } from "./_generated/server"
import { filtrViditelnosti, jeKlubovy, requireCoach, requireCoachProZapis } from "./sessions"
import { sdileno } from "./eliteDiagnostic"

// Doporučení kontaktu na odborníka (ELITE Pro).
//
// KDO CO VIDÍ
//   kouč, který vyplnění vidí   – jestli je doporučení, a kdy nabídl kontakt
//   klubový kouč                – nic, ani to, že otázky existují
//   nikdo                       – body ani odpovědi; ty se neukládají
//
// Klubový kouč rozhoduje o sestavě a nominaci. Signál o duševním zdraví
// hráče do takového rozhodování nesmí vstoupit, proto ho nedostane vůbec.

const stavValidator = v.object({
  doporuceno: v.boolean(),
  kontaktNabidnut: v.optional(v.number()),
})

/** Je u vyplnění doporučení? Pro cizí nebo neexistující vyplnění prostě ne. */
export const doporuceni = query({
  args: { sessionToken: v.string(), resultId: v.id("eliteDiagnosticResults") },
  returns: stavValidator,
  handler: async (ctx, args) => {
    const me = await requireCoach(ctx, args.sessionToken)
    if (jeKlubovy(me)) return { doporuceno: false }
    const d = await ctx.db.get(args.resultId)
    const vidi = await filtrViditelnosti(ctx, me)
    if (!d || !vidi(d.coachId) || !sdileno(d)) return { doporuceno: false }
    const z = await ctx.db
      .query("doporuceniOdbornika")
      .withIndex("by_result", (q) => q.eq("resultId", args.resultId))
      .first()
    return z ? { doporuceno: true, kontaktNabidnut: z.kontaktNabidnut } : { doporuceno: false }
  },
})

/** Kouč si poznamená, že sportovci nabídl kontakt na odborníka. */
export const zaznamenejKontakt = mutation({
  args: { sessionToken: v.string(), resultId: v.id("eliteDiagnosticResults") },
  returns: stavValidator,
  handler: async (ctx, args) => {
    const me = await requireCoachProZapis(ctx, args.sessionToken)
    if (jeKlubovy(me)) return { doporuceno: false }
    const d = await ctx.db.get(args.resultId)
    const vidi = await filtrViditelnosti(ctx, me)
    if (!d || !vidi(d.coachId) || !sdileno(d)) return { doporuceno: false }
    const z = await ctx.db
      .query("doporuceniOdbornika")
      .withIndex("by_result", (q) => q.eq("resultId", args.resultId))
      .first()
    if (!z) return { doporuceno: false }
    const kdy = Date.now()
    await ctx.db.patch(z._id, { kontaktNabidnut: kdy })
    return { doporuceno: true, kontaktNabidnut: kdy }
  },
})
