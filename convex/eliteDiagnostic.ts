import { ConvexError, v } from "convex/values"
import { mutation, query } from "./_generated/server"
import {
  filtrViditelnosti,
  requireCoach,
  requireCoachProZapis,
  vyzadujMastera,
  zaznamenejPristup,
} from "./sessions"

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
  "archetypy",
  "archetypy-sport",
])

/**
 * Počet položek a rozsah škály podle testu.
 *
 * Emocionálně-destruktivní vzorce mají 110 položek a škálu 1-6, archetypy
 * značky 96 položek a škálu 1-6, rodina ELITE 100 nebo 200 položek a škálu
 * 1-5. Kontroluje se to tady na serveru, protože kontrola jen v prohlížeči
 * by se dala obejít.
 */
function parametryTestu(testId: string): { pocet: number; maxHodnota: number } {
  if (testId.startsWith("archetypy")) return { pocet: 96, maxHodnota: 6 }
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

// ---------------------------------------------------------------------------
// Meze délky vstupů
//
// Convex ověřuje typ, ne rozsah: `v.string()` propustí i řetězec o velikosti
// megabajtu. Odesílat dotazník smí kdokoli s platnou pozvánkou, takže bez
// těchhle mezí by šlo databázi zaplnit jedním voláním. Hodnoty jsou velkoryse
// nad tím, co dává smysl vyplnit, aby nikoho neomezily.
// ---------------------------------------------------------------------------

/** Jak dlouho platí nepoužitá pozvánka. */
const PLATNOST_POZVANKY_DNI = 30

const MEZ = {
  jmeno: 120,
  role: 200,
  datum: 40,
  /** 200 položek jako {"200":5} se vejde s velkou rezervou */
  odpovedi: 8_000,
  poznamka: 2_000,
} as const

/** Zkontroluje délku textu; prázdný a nevyplněný vstup projde. */
function delka(hodnota: string | undefined, mez: number, popis: string): void {
  if (hodnota !== undefined && hodnota.length > mez) {
    throw new ConvexError(`${popis} je příliš dlouhé (nejvýš ${mez} znaků).`)
  }
}

function zkontrolujOsobu(person: {
  name: string
  birthDate?: string
  role?: string
  fillDate: string
}): void {
  delka(person.name, MEZ.jmeno, "Jméno")
  delka(person.role, MEZ.role, "Role")
  delka(person.birthDate, MEZ.datum, "Datum narození")
  delka(person.fillDate, MEZ.datum, "Datum vyplnění")
}

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

/**
 * Čtvrtletí pořízení, „2026-Q3".
 *
 * Hrubší než měsíc schválně. Kombinace „rok narození + disciplína + měsíc" je
 * u malého vzorku prakticky identifikátor: lidí, na které sedí, bývá jednotky.
 * Čtvrtletí spolu s pětiletým pásmem narození ten okruh podstatně rozšíří,
 * aniž by se ztratila hodnota pro tvorbu norem.
 */
function collectedQuarter(now: number): string {
  const d = new Date(now)
  return `${d.getUTCFullYear()}-Q${Math.floor(d.getUTCMonth() / 3) + 1}`
}

/** Pětileté pásmo narození, „1990-1994". Přesný rok se do vzorku neukládá. */
function ageBand(birthDate?: string): string | undefined {
  const rok = birthYearOnly(birthDate)
  if (rok === undefined) return undefined
  const zacatek = Math.floor(rok / 5) * 5
  return `${zacatek}-${zacatek + 4}`
}

/**
 * Náhodný klíč, který spojí vyplnění s jeho anonymní kopií ve vzorku.
 *
 * Sám o sobě neprozrazuje nic a nedá se z něj nic odvodit, ale umožní vzorek
 * smazat spolu s výsledkem. Bez něj by po uplatnění práva na výmaz zůstaly
 * odpovědi ve vzorku napořád: jiná vazba tu vědomě není, aby nešlo záznam
 * spárovat zpět s člověkem.
 */
function vymazovyKlic(): string {
  return Array.from(kryptoBajty(16), (b) => b.toString(16).padStart(2, "0")).join("")
}

/**
 * Token do odkazu. Bez podobných znaků (0/O, 1/l), ať se dá případně přečíst.
 *
 * Musí pocházet z kryptografického zdroje: token je jediné, co chrání přístup
 * k dotazníku. Math.random() se tu použít nesmí – jednak to není kryptografický
 * generátor, jednak ho Convex uvnitř transakce nahrazuje deterministickým, aby
 * šly funkce opakovat, což je pro tvorbu tajemství přesně obrácený požadavek.
 *
 * Dvacet čtyři znaků po pěti bitech dává 120 bitů entropie. Abeceda má 32
 * znaků, takže 256 hodnot bajtu se na ni dělí beze zbytku a modulo nezavádí
 * zkreslení ve prospěch části znaků.
 */
function makeToken(): string {
  const alphabet = "abcdefghijkmnpqrstuvwxyz23456789"
  return Array.from(kryptoBajty(24), (b) => alphabet[b % alphabet.length]).join("")
}

/**
 * Kryptograficky náhodné bajty z Web Crypto.
 *
 * Bere se, co runtime nabízí: primárně getRandomValues, jinak randomUUID
 * (verze 4 nese 122 bitů z kryptografického zdroje). Když není ani jedno,
 * funkce záměrně spadne. Tiché sáhnutí po Math.random() by vypadalo jako
 * fungující kód a přitom by vrátilo předvídatelné tajemství, což je horší
 * než viditelná chyba při vystavování pozvánky.
 */
function kryptoBajty(kolik: number): Uint8Array {
  const c: Crypto | undefined = globalThis.crypto
  if (typeof c?.getRandomValues === "function") {
    return c.getRandomValues(new Uint8Array(kolik))
  }
  if (typeof c?.randomUUID === "function") {
    const hex = Array.from({ length: Math.ceil(kolik / 16) }, () =>
      c.randomUUID().replace(/-/g, ""),
    ).join("")
    return Uint8Array.from({ length: kolik }, (_, i) => parseInt(hex.slice(i * 2, i * 2 + 2), 16))
  }
  throw new ConvexError(
    "Server nemá k dispozici Web Crypto, takže nejde bezpečně vygenerovat odkaz. Ozvi se prosím správci aplikace.",
  )
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
    const me = await requireCoachProZapis(ctx, args.sessionToken)
    if (!TEST_IDS.has(args.testId)) {
      throw new ConvexError(`Neznámý testId: ${args.testId}`)
    }
    delka(args.clientName, MEZ.jmeno, "Jméno klienta")
    delka(args.note, MEZ.poznamka, "Poznámka")
    const token = makeToken()
    const now = Date.now()
    await ctx.db.insert("invitations", {
      token,
      testId: args.testId,
      lang: JAZYKY.has(args.lang) ? args.lang : "cs",
      clientName: args.clientName,
      note: args.note,
      // Vlastník rozhoduje, do čí větve vyplnění spadne.
      coachId: me._id,
      createdAt: now,
      expiresAt: now + PLATNOST_POZVANKY_DNI * 24 * 60 * 60 * 1000,
    })
    await zaznamenejPristup(ctx, me._id, "vytvoreni-pozvanky")
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
    status: v.union(
      v.literal("ok"),
      v.literal("used"),
      v.literal("expired"),
      v.literal("notfound"),
    ),
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
    // Jazyk se vrací i u vyčerpané a vypršelé pozvánky, aby se hláška dala
    // ukázat v jazyce, ve kterém byl odkaz vystavený. Není to osobní údaj:
    // jde o volbu kouče, ne o nic, co by prozradilo respondenta.
    if (inv.usedAt) return { status: "used" as const, lang: inv.lang }
    // Pozvánky vystavené dřív než platnost existovala běží dál bez omezení.
    if (inv.expiresAt !== undefined && inv.expiresAt < Date.now()) {
      return { status: "expired" as const, lang: inv.lang }
    }
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
  expiresAt: v.optional(v.number()),
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
      expiresAt: d.expiresAt,
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
    if (inv.expiresAt !== undefined && inv.expiresAt < Date.now()) {
      throw new ConvexError("Platnost tohoto odkazu vypršela. Požádej kouče o nový.")
    }

    // Meze délky dřív než cokoli dalšího: co se sem dostane, to se ukládá.
    zkontrolujOsobu(args.person)
    delka(args.answers, MEZ.odpovedi, "Odpovědi")

    // Vzorce ani archetypy nemají variantu v tom smyslu jako ELITE (sport
    // nebo business), takže se pro ně doplní zástupná hodnota podle testu.
    const [model, variant] =
      inv.testId.startsWith("archetypy")
        ? ["archetypy", inv.testId === "archetypy-sport" ? "sport" : "business"]
        : inv.testId.startsWith("vzorce")
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
    // Ukládá se tahle přeskládaná mapa, ne původní řetězec od klienta: co
    // neprošlo kontrolou položku po položce, se do databáze nedostane. Bez
    // toho by šlo do `answers` přibalit cokoli navíc mimo očekávané klíče.
    const ciste: Record<string, number> = {}
    for (let i = 1; i <= itemCount; i++) {
      const value = parsed[String(i)]
      if (value !== undefined) {
        if (typeof value !== "number" || !Number.isInteger(value) || value < 1 || value > maxHodnota) {
          throw new ConvexError(`Neplatná odpověď u položky ${i}`)
        }
        ciste[String(i)] = value
        answeredCount++
      }
    }
    const answers = JSON.stringify(ciste)

    const now = Date.now()
    // Nesmyslné hodnoty (záporné, absurdně dlouhé) zahoď – index tempa se pak
    // prostě nepočítá, místo aby počítal s nesmyslem.
    const durationSec =
      typeof args.durationSec === "number" && args.durationSec > 0 && args.durationSec < 86400
        ? Math.round(args.durationSec)
        : undefined

    const klic = vymazovyKlic()
    const resultId = await ctx.db.insert("eliteDiagnosticResults", {
      testId: inv.testId,
      model,
      variant,
      lang: inv.lang,
      person: args.person,
      answers,
      answeredCount,
      complete: answeredCount === itemCount,
      durationSec,
      coachId: inv.coachId,
      vymazovyKlic: klic,
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
      // Místo přesného roku pětileté pásmo, místo měsíce čtvrtletí: vzorek
      // má sloužit normám, ne k dohledání konkrétního člověka.
      ageBand: ageBand(args.person.birthDate),
      gender: args.person.gender,
      role: shortRole(args.person.role),
      answers,
      answeredCount,
      complete: answeredCount === itemCount,
      durationSec,
      collectedMonth: collectedMonth(now),
      collectedQuarter: collectedQuarter(now),
      vymazovyKlic: klic,
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

/**
 * Detail vyplnění pro kouče.
 *
 * Je to mutace, přestože jen čte: otevření cizího psychologického profilu se
 * musí zapsat do přístupového logu a queries v Convexu zapisovat nesmějí.
 * Klient ji volá jednorázově, takže se tím nic neztrácí.
 */
export const getForCoach = mutation({
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
    const me = await requireCoachProZapis(ctx, args.sessionToken)
    const d = await ctx.db.get(args.id)
    if (!d) return null
    // Cizí větev se nevrací ani na přímý dotaz s uhodnutým id.
    const vidi = await filtrViditelnosti(ctx, me)
    if (!vidi(d.coachId)) return null
    await zaznamenejPristup(ctx, me._id, "otevreni-vysledku", d._id)
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
 * Vidí to výhradně master. Že se z vyplnění staví normativní vzorek a na čem
 * se počítají percentily a reliabilita, je naše know-how; kouč, který ví, že
 * vzorek je zatím malý, snadno usoudí, že testy nestojí za nic, a řekne to
 * dál. Proto sem nemá přístup ani náš vlastní kouč, nejen externí.
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
    vyzadujMastera(await requireCoach(ctx, args.sessionToken))
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
/**
 * Export vzorku k analýze. Mutace kvůli zápisu do přístupového logu: stáhnout
 * celý vzorek je akce, o které má být záznam.
 */
export const normExport = mutation({
  args: { sessionToken: v.string() },
  returns: v.array(
    v.object({
      testId: v.string(),
      model: v.string(),
      variant: v.string(),
      lang: v.string(),
      birthYear: v.optional(v.number()),
      ageBand: v.optional(v.string()),
      role: v.optional(v.string()),
      answers: v.string(),
      answeredCount: v.number(),
      complete: v.boolean(),
      durationSec: v.optional(v.number()),
      collectedMonth: v.string(),
      collectedQuarter: v.optional(v.string()),
    }),
  ),
  handler: async (ctx, args) => {
    const me = await requireCoachProZapis(ctx, args.sessionToken)
    vyzadujMastera(me)
    const vsechny = await ctx.db.query("normSamples").take(5000)
    await zaznamenejPristup(ctx, me._id, "export-vzorku")
    return vsechny.map((z) => ({
      testId: z.testId,
      model: z.model,
      variant: z.variant,
      lang: z.lang,
      // Starší záznamy mají přesný rok, nové pásmo; export vrací obojí, ať se
      // dá vzorek analyzovat vcelku.
      birthYear: z.birthYear,
      ageBand: z.ageBand,
      role: z.role,
      answers: z.answers,
      answeredCount: z.answeredCount,
      complete: z.complete,
      durationSec: z.durationSec,
      collectedMonth: z.collectedMonth,
      collectedQuarter: z.collectedQuarter,
    }))
  },
})

/**
 * Smazání vyplnění. Pouze pro kouče.
 *
 * Maže i anonymní kopii ve vzorku, pokud k ní vede párovací klíč. Bez toho by
 * po uplatnění práva na výmaz zůstaly odpovědi ve vzorku napořád. U záznamů
 * pořízených dřív než klíč existoval se maže jen vyplnění; ty ve vzorku
 * dohledat nejde a nikdy nepůjde.
 */
export const removeForCoach = mutation({
  args: { sessionToken: v.string(), id: v.id("eliteDiagnosticResults") },
  returns: v.object({ ok: v.boolean(), vzorekSmazan: v.boolean() }),
  handler: async (ctx, args) => {
    const me = await requireCoachProZapis(ctx, args.sessionToken)
    const doc = await ctx.db.get(args.id)
    if (!doc) return { ok: true, vzorekSmazan: false }
    const vidi = await filtrViditelnosti(ctx, me)
    if (!vidi(doc.coachId)) throw new ConvexError("Tohle vyplnění do tvé větve nepatří.")

    let vzorekSmazan = false
    if (doc.vymazovyKlic) {
      const vzorky = await ctx.db
        .query("normSamples")
        .withIndex("by_vymazovy_klic", (q) => q.eq("vymazovyKlic", doc.vymazovyKlic))
        .collect()
      for (const z of vzorky) {
        await ctx.db.delete(z._id)
        vzorekSmazan = true
      }
    }
    await zaznamenejPristup(ctx, me._id, "smazani-vysledku", doc._id)
    await ctx.db.delete(args.id)
    return { ok: true, vzorekSmazan }
  },
})

// ---------------------------------------------------------------------------
// Vytížení koučů (pouze master)
// ---------------------------------------------------------------------------

/**
 * Kolik testů který kouč vypustil. Podklad pro fakturaci.
 *
 * Uvádí se všichni kouči kromě mastera, tedy i naši vlastní: master má vidět
 * vytížení celé sítě na jednom místě, ne jen u těch, komu vystavuje fakturu.
 *
 * Záměrně BEZ jakéhokoli osobního údaje: vrací se jen typ testu, datum
 * a úplnost. Jméno klienta, datum narození ani odpovědi tudy neprojdou.
 * U externího kouče je to nutnost, protože do jeho větve klientů nevidíme;
 * u našeho je to tím, že na účtování nic víc není potřeba a přehled klientů
 * je stejně jinde.
 */
export const externalUsage = query({
  args: { sessionToken: v.string() },
  returns: v.array(
    v.object({
      coachId: v.id("coaches"),
      name: v.string(),
      email: v.string(),
      /**
       * Master se v přehledu neuvádí: sám sobě fakturu nevystavuje, proto tu
       * "master" schválně chybí.
       * audit-role-neuplny
       */
      role: v.union(v.literal("coach"), v.literal("external")),
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
    // Master sám sebe nefakturuje, ostatní role ano. Externí první, protože
    // právě jim se faktura vystavuje.
    const kouci = vsichni
      .filter((c) => c.role !== "master")
      .sort((a, b) => (a.role === b.role ? 0 : a.role === "external" ? -1 : 1))

    const out = []
    for (const c of kouci) {
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
        role: c.role as "coach" | "external",
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
