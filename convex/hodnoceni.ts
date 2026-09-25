import { ConvexError, v } from "convex/values"
import { mutation, query } from "./_generated/server"
import {
  filtrViditelnosti,
  requireCoach,
  requireCoachProZapis,
  vyzadujMastera,
  zaznamenejPristup,
} from "./sessions"
import { sdileno } from "./eliteDiagnostic"
import {
  CASTOST_POZOROVANI,
  DELKA_VEDENI,
  HODNOTA_MAX,
  HODNOTA_MIN,
  POLOZKY_HODNOCENI,
  PREPIS_DNI,
  dostVyplneno,
  hodnotiSe,
  type PolozkaHodnoceni,
} from "../lib/diagnostic/hodnoceni-trenera"
import { sestavExportValidace } from "../lib/diagnostic/validace-export"

// Hodnocení sportovce trenérem.
//
// KDO CO SMÍ
//   kouč     – hodnotit a vidět vlastní hodnocení u vyplnění, na které vidí
//   master   – navíc stáhnout anonymní podklad pro ověření validity
//   nikdo    – vidět hodnocení jiného kouče; sportovec je nevidí vůbec
//
// Přístup k vyplnění se řídí stejným pravidlem jako čtení výsledku
// (filtrViditelnosti a sdílení). Kouč nemůže ohodnotit sportovce, jehož
// výsledek nesmí otevřít: hodnocení by jinak prozradilo, že ten výsledek
// existuje, a obešlo by volbu hráče v týmové větvi.

const DEN = 24 * 60 * 60 * 1000

const hodnotaValidator = v.object({ id: v.string(), hodnota: v.optional(v.number()) })

const hodnoceniValidator = v.object({
  id: v.id("hodnoceniTrenera"),
  hodnoty: v.array(hodnotaValidator),
  delkaVedeni: v.string(),
  castostPozorovani: v.string(),
  createdAt: v.number(),
})

/** Uloží hodnocení. Do 14 dní od posledního ho přepíše, jinak přidá nové. */
export const ohodnot = mutation({
  args: {
    sessionToken: v.string(),
    resultId: v.id("eliteDiagnosticResults"),
    hodnoty: v.array(hodnotaValidator),
    delkaVedeni: v.string(),
    castostPozorovani: v.string(),
  },
  returns: v.object({ id: v.id("hodnoceniTrenera"), prepsano: v.boolean() }),
  handler: async (ctx, args) => {
    const me = await requireCoachProZapis(ctx, args.sessionToken)
    const vysledek = await ctx.db.get(args.resultId)
    const vidi = await filtrViditelnosti(ctx, me)
    // Stejná odpověď pro neexistující i cizí vyplnění, ať se nedá zkoušet,
    // co v databázi je.
    if (!vysledek || !vidi(vysledek.coachId) || !sdileno(vysledek)) {
      throw new ConvexError("Tohle vyplnění ohodnotit nemůžeš.")
    }
    if (!hodnotiSe(vysledek.testId)) {
      throw new ConvexError("Hodnocení trenéra je jen u sportovních testů.")
    }

    if (!(DELKA_VEDENI as readonly string[]).includes(args.delkaVedeni)) {
      throw new ConvexError("Neplatná odpověď na délku vedení.")
    }
    if (!(CASTOST_POZOROVANI as readonly string[]).includes(args.castostPozorovani)) {
      throw new ConvexError("Neplatná odpověď na četnost pozorování.")
    }

    // Hodnoty: jen známé položky, každá nejvýš jednou, celá čísla 1 až 7.
    const hodnoty: { id: string; hodnota?: number }[] = []
    const mapa: Partial<Record<PolozkaHodnoceni, number>> = {}
    for (const p of POLOZKY_HODNOCENI) {
      const zaznamy = args.hodnoty.filter((h) => h.id === p)
      if (zaznamy.length > 1) throw new ConvexError("Položka je v hodnocení dvakrát.")
      const x = zaznamy[0]?.hodnota
      if (x !== undefined && (!Number.isInteger(x) || x < HODNOTA_MIN || x > HODNOTA_MAX)) {
        throw new ConvexError("Hodnota musí být celé číslo od 1 do 7.")
      }
      hodnoty.push(x === undefined ? { id: p } : { id: p, hodnota: x })
      if (x !== undefined) mapa[p] = x
    }
    if (args.hodnoty.some((h) => !(POLOZKY_HODNOCENI as readonly string[]).includes(h.id))) {
      throw new ConvexError("Neznámá položka hodnocení.")
    }
    if (!dostVyplneno(mapa)) {
      throw new ConvexError("Ohodnoť aspoň polovinu položek.")
    }

    const now = Date.now()
    const moje = (
      await ctx.db
        .query("hodnoceniTrenera")
        .withIndex("by_result", (q) => q.eq("resultId", args.resultId))
        .collect()
    )
      .filter((h) => String(h.coachId) === String(me._id))
      .sort((a, b) => b.createdAt - a.createdAt)

    const posledni = moje[0]
    if (posledni && now - posledni.createdAt < PREPIS_DNI * DEN) {
      await ctx.db.patch(posledni._id, {
        hodnoty,
        delkaVedeni: args.delkaVedeni,
        castostPozorovani: args.castostPozorovani,
        createdAt: now,
      })
      return { id: posledni._id, prepsano: true }
    }

    const id = await ctx.db.insert("hodnoceniTrenera", {
      resultId: args.resultId,
      coachId: me._id,
      hodnoty,
      delkaVedeni: args.delkaVedeni,
      castostPozorovani: args.castostPozorovani,
      createdAt: now,
    })
    return { id, prepsano: false }
  },
})

/** Vlastní hodnocení u jednoho vyplnění, nejnovější první. */
export const mojeHodnoceni = query({
  args: { sessionToken: v.string(), resultId: v.id("eliteDiagnosticResults") },
  returns: v.array(hodnoceniValidator),
  handler: async (ctx, args) => {
    const me = await requireCoach(ctx, args.sessionToken)
    const vysledek = await ctx.db.get(args.resultId)
    const vidi = await filtrViditelnosti(ctx, me)
    if (!vysledek || !vidi(vysledek.coachId) || !sdileno(vysledek)) return []
    const vsechna = await ctx.db
      .query("hodnoceniTrenera")
      .withIndex("by_result", (q) => q.eq("resultId", args.resultId))
      .collect()
    return vsechna
      .filter((h) => String(h.coachId) === String(me._id))
      .sort((a, b) => b.createdAt - a.createdAt)
      .map((h) => ({
        id: h._id,
        hodnoty: h.hodnoty,
        delkaVedeni: h.delkaVedeni,
        castostPozorovani: h.castostPozorovani,
        createdAt: h.createdAt,
      }))
  },
})

/**
 * Anonymní podklad pro ověření validity. Jen pro mastera.
 *
 * Mutace, ne query, protože se zapisuje do přístupového logu. Obsahuje jen
 * vyplnění z naší větve (filtrViditelnosti) a jen sdílená; do větví
 * externích koučů nevidí ani tenhle export.
 */
export const exportValidace = mutation({
  args: { sessionToken: v.string() },
  returns: v.array(
    v.object({
      sportovec: v.string(),
      testId: v.string(),
      lang: v.string(),
      ageBand: v.optional(v.string()),
      gender: v.optional(v.string()),
      role: v.optional(v.string()),
      answers: v.string(),
      durationSec: v.optional(v.number()),
      vyplnenoCtvrtleti: v.string(),
      hodnocenoCtvrtleti: v.string(),
      odstupDni: v.number(),
      delkaVedeni: v.string(),
      castostPozorovani: v.string(),
      hodnoty: v.record(v.string(), v.union(v.number(), v.null())),
    }),
  ),
  handler: async (ctx, args) => {
    const me = await requireCoachProZapis(ctx, args.sessionToken)
    vyzadujMastera(me)
    const vidi = await filtrViditelnosti(ctx, me)

    const hodnoceni = await ctx.db.query("hodnoceniTrenera").take(5000)
    const vysledky = []
    for (const id of new Set(hodnoceni.map((h) => h.resultId))) {
      const d = await ctx.db.get(id)
      if (!d || !vidi(d.coachId) || !sdileno(d)) continue
      vysledky.push({
        id: String(d._id),
        testId: d.testId,
        lang: d.lang,
        answers: d.answers,
        birthDate: d.person.birthDate,
        gender: d.person.gender,
        role: d.person.role,
        durationSec: d.durationSec,
        createdAt: d.createdAt,
      })
    }

    await zaznamenejPristup(ctx, me._id, "export-validace")
    return sestavExportValidace(
      vysledky,
      hodnoceni.map((h) => ({
        resultId: String(h.resultId),
        hodnoty: h.hodnoty,
        delkaVedeni: h.delkaVedeni,
        castostPozorovani: h.castostPozorovani,
        createdAt: h.createdAt,
      })),
    )
  },
})
