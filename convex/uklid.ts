import { v } from "convex/values"
import { internalMutation } from "./_generated/server"

// Pravidelný úklid dat.
//
// Uchovávat osobní údaje déle, než je potřeba, je u zvláštní kategorie
// zbytečné riziko: co v databázi není, to nemůže uniknout. Lhůty jsou
// nastavené střídmě a dají se změnit tady na jednom místě.
//
// Spouští to plán v convex/crons.ts, jednou denně v noci. Ručně se to dá
// pustit v Convex dashboardu (Functions → uklid:probehni → Run).

/** Jak dlouho se data drží, ve dnech. */
export const LHUTY = {
  /** vyplnění a výsledky; klient je může nechat smazat dřív */
  vysledky: 3 * 365,
  /** nepoužité pozvánky po vypršení platnosti */
  pozvanky: 90,
  /** záznamy o přístupu k datům */
  pristupovyLog: 365,
  /** neúspěšné pokusy o přihlášení */
  pokusy: 7,
  /** vypršelé relace */
  relace: 30,
  /** nepoužité pozvánky do deníku po vypršení platnosti */
  pozvankyDenik: 90,
} as const

const den = 24 * 60 * 60 * 1000

/**
 * Smaže, co je za lhůtou.
 *
 * Maže po dávkách: Convex má strop na počet dokumentů v jedné transakci
 * a úklid, který spadne v půlce, by po sobě nechal nepořádek. Když zbývá
 * víc, doklidí se to při dalším běhu.
 */
export const probehni = internalMutation({
  args: {},
  returns: v.object({
    vysledky: v.number(),
    vzorky: v.number(),
    pozvanky: v.number(),
    log: v.number(),
    pokusy: v.number(),
    relace: v.number(),
    pozvankyDenik: v.number(),
    relaceDenik: v.number(),
  }),
  handler: async (ctx) => {
    const now = Date.now()
    const DAVKA = 200
    let vysledky = 0
    let vzorky = 0

    // Výsledky za lhůtou, i s anonymní kopií ve vzorku.
    const stareVysledky = await ctx.db
      .query("eliteDiagnosticResults")
      .withIndex("by_created", (q) => q.lt("createdAt", now - LHUTY.vysledky * den))
      .take(DAVKA)
    for (const d of stareVysledky) {
      if (d.vymazovyKlic) {
        const kopie = await ctx.db
          .query("normSamples")
          .withIndex("by_vymazovy_klic", (q) => q.eq("vymazovyKlic", d.vymazovyKlic))
          .collect()
        for (const z of kopie) {
          await ctx.db.delete(z._id)
          vzorky++
        }
      }
      await ctx.db.delete(d._id)
      vysledky++
    }

    // Pozvánky: nepoužité po vypršení platnosti a použité po lhůtě výsledků.
    const starePozvanky = await ctx.db
      .query("invitations")
      .withIndex("by_created", (q) => q.lt("createdAt", now - LHUTY.pozvanky * den))
      .take(DAVKA)
    let pozvanky = 0
    for (const p of starePozvanky) {
      const vyprsela = p.expiresAt !== undefined && p.expiresAt < now - LHUTY.pozvanky * den
      const pouzitaDavno = p.usedAt !== undefined && p.usedAt < now - LHUTY.vysledky * den
      if (vyprsela || pouzitaDavno) {
        await ctx.db.delete(p._id)
        pozvanky++
      }
    }

    // Přístupový log.
    const staryLog = await ctx.db
      .query("pristupovyLog")
      .withIndex("by_at", (q) => q.lt("at", now - LHUTY.pristupovyLog * den))
      .take(DAVKA)
    for (const z of staryLog) await ctx.db.delete(z._id)

    // Pokusy o přihlášení: po týdnu už nemají co hlídat.
    const starePokusy = await ctx.db.query("loginAttempts").take(DAVKA)
    let pokusy = 0
    for (const z of starePokusy) {
      const zamekVyprsel = !z.lockedUntil || z.lockedUntil < now
      if (zamekVyprsel && z.lastFailedAt < now - LHUTY.pokusy * den) {
        await ctx.db.delete(z._id)
        pokusy++
      }
    }

    // Vypršelé relace. Ty se uklízejí i při přihlášení, tohle je pojistka
    // pro účty, které se dlouho nepřihlásily.
    const stareRelace = await ctx.db.query("coachSessions").take(DAVKA)
    let relace = 0
    for (const r of stareRelace) {
      if (r.expiresAt < now - LHUTY.relace * den) {
        await ctx.db.delete(r._id)
        relace++
      }
    }

    // Pozvánky do deníku. Použité se nemažou: váže se na ně účet klienta,
    // takže by po nich zůstal deník bez stopy, odkud vznikl.
    const starePozvankyDenik = await ctx.db
      .query("plannerInvites")
      .withIndex("by_created", (q) => q.lt("createdAt", now - LHUTY.pozvankyDenik * den))
      .take(DAVKA)
    let pozvankyDenik = 0
    for (const p of starePozvankyDenik) {
      if (p.usedAt) continue
      if (p.expiresAt < now - LHUTY.pozvankyDenik * den) {
        await ctx.db.delete(p._id)
        pozvankyDenik++
      }
    }

    // Vypršelé relace deníku. Zápisky samotné se neuklízejí vůbec: patří
    // klientovi, ne nám, a mazat mu je po lhůtě by bylo totéž jako vyhodit
    // někomu zápisník ze stolu.
    const stareRelaceDenik = await ctx.db.query("plannerSessions").take(DAVKA)
    let relaceDenik = 0
    for (const r of stareRelaceDenik) {
      if (r.expiresAt < now - LHUTY.relace * den) {
        await ctx.db.delete(r._id)
        relaceDenik++
      }
    }

    return {
      vysledky,
      vzorky,
      pozvanky,
      log: staryLog.length,
      pokusy,
      relace,
      pozvankyDenik,
      relaceDenik,
    }
  },
})
