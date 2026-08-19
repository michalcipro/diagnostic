import { ConvexError, v } from "convex/values"
import { internalQuery, mutation, query } from "./_generated/server"
import type { MutationCtx, QueryCtx } from "./_generated/server"
import type { Doc, Id } from "./_generated/dataModel"

// ─────────────────────────────────────────────────────────────────────────────
// Týdenní plánovač – backend deníku.
//
// PŘÍSTUP: obsah deníku vrací server výhradně vlastníkovi, tedy proti platné
// přihlášené relaci klienta. Kouč, master ani nikdo jiný sem nevidí. Není to
// opomenutí v oprávněních, ale záměr: deník je osobní zápisník, ne dotazník,
// jehož výsledek se s koučem probírá. Kouč vidí jen to, že si klient deník
// vede a kdy naposledy něco zapsal – k tomu slouží funkce v plannerCoach.ts.
//
// STAVBA: pevná, podle papírové předlohy. Klient vyplňuje políčka, nepřidává
// sekce. Jediné, co si definuje sám, jsou návyky.
// ─────────────────────────────────────────────────────────────────────────────

export type PlannerClient = Doc<"plannerClients">

const genderValidator = v.union(v.literal("male"), v.literal("female"))
const JAZYKY = new Set(["cs", "en", "sk"])

// ---------------------------------------------------------------------------
// Meze vstupů
//
// Convex ověřuje typ, ne rozsah: `v.string()` propustí i řetězec o velikosti
// megabajtu. Hodnoty jsou velkoryse nad tím, co dává smysl napsat, aby nikoho
// neomezily, ale zároveň brání tomu, aby jedno volání zaplnilo databázi.
// ---------------------------------------------------------------------------

const MEZ = {
  blokRozvrhu: 200,
  poznamky: 4_000,
  reflexe: 1_000,
  nazevNavyku: 80,
  jmeno: 120,
  /** kolik neArchivovaných návyků smí tracker mít */
  navyku: 20,
} as const

const PRVNI_HODINA = 5
const POSLEDNI_HODINA = 22

/** Rozsahy denních ukazatelů. Spánek je v hodinách, zbytek na škále 1 až 10. */
const ROZSAH_UKAZATELU = {
  sleep: { min: 0, max: 14 },
  energy: { min: 1, max: 10 },
  focus: { min: 1, max: 10 },
  mood: { min: 1, max: 10 },
  productivity: { min: 1, max: 10 },
} as const

type UkazatelKlic = keyof typeof ROZSAH_UKAZATELU
type Ukazatele = Partial<Record<UkazatelKlic, number>>

/** Klíče denní reflexe. Pořadí odpovídá papírové předloze. */
const REFLEXE_KLICE = ["grateful", "win", "improve"] as const
type ReflexeKlic = (typeof REFLEXE_KLICE)[number]
type Reflexe = Partial<Record<ReflexeKlic, string>>

function delka(hodnota: string | undefined, mez: number, popis: string): void {
  if (hodnota !== undefined && hodnota.length > mez) {
    throw new ConvexError(`${popis} je příliš dlouhé (nejvýš ${mez} znaků).`)
  }
}

/**
 * Ověření data ve tvaru „YYYY-MM-DD".
 *
 * Kontrola zpětným převodem odchytí 31. února: Date.parse je u neexistujících
 * dnů shovívavý a přetekl by do dalšího měsíce. Neplatné datum by se v indexu
 * chovalo jako platné a den by se pak nedal najít ani smazat.
 */
function overDatum(datum: string): void {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(datum)) throw new ConvexError("Neplatné datum.")
  const t = Date.parse(`${datum}T00:00:00Z`)
  if (!Number.isFinite(t) || new Date(t).toISOString().slice(0, 10) !== datum) {
    throw new ConvexError("Neplatné datum.")
  }
  // Deník je zápisník, ne archiv století: rozsah drží data v mezích, ve
  // kterých dávají smysl, a zabraňuje zápisům do roku 9999.
  const rok = Number(datum.slice(0, 4))
  if (rok < 2020 || rok > 2100) throw new ConvexError("Datum je mimo rozsah plánovače.")
}

function overPondeli(datum: string): void {
  overDatum(datum)
  const d = new Date(`${datum}T00:00:00Z`).getUTCDay()
  if (d !== 1) throw new ConvexError("Týden musí začínat pondělkem.")
}

// ─────────────────────────────────────────────────────────────────────────────
// Relace
// ─────────────────────────────────────────────────────────────────────────────

/** Vrátí přihlášeného klienta, nebo vyhodí chybu. */
export async function requireClient(
  ctx: QueryCtx,
  sessionToken: string,
): Promise<PlannerClient> {
  const session = await ctx.db
    .query("plannerSessions")
    .withIndex("by_token", (q) => q.eq("token", sessionToken))
    .unique()
  if (!session) throw new ConvexError("Nejsi přihlášený.")
  if (session.expiresAt < Date.now()) {
    throw new ConvexError("Přihlášení vypršelo, přihlas se prosím znovu.")
  }
  const klient = await ctx.db.get(session.clientId)
  if (!klient || !klient.active) throw new ConvexError("Účet není aktivní.")
  return klient
}

/**
 * Totéž pro zápis, navíc s posunutím platnosti relace.
 *
 * Platnost je klouzavá: kdo si deník vede, zůstává přihlášený, kdo ho nechá
 * ležet, po měsíci vypadne. Posouvá se až ve druhé polovině platnosti, ať se
 * nezapisuje při každém odškrtnutí kolečka.
 */
async function requireClientProZapis(
  ctx: MutationCtx,
  sessionToken: string,
): Promise<PlannerClient> {
  const session = await ctx.db
    .query("plannerSessions")
    .withIndex("by_token", (q) => q.eq("token", sessionToken))
    .unique()
  if (!session) throw new ConvexError("Nejsi přihlášený.")
  const now = Date.now()
  if (session.expiresAt < now) {
    throw new ConvexError("Přihlášení vypršelo, přihlas se prosím znovu.")
  }
  const klient = await ctx.db.get(session.clientId)
  if (!klient || !klient.active) throw new ConvexError("Účet není aktivní.")

  const platnost = session.expiresAt - session.createdAt
  if (session.expiresAt - now < platnost / 2) {
    await ctx.db.patch(session._id, { expiresAt: now + platnost, lastSeenAt: now })
  } else if (!session.lastSeenAt || now - session.lastSeenAt > 60 * 60 * 1000) {
    await ctx.db.patch(session._id, { lastSeenAt: now })
  }

  // Stopa o aktivitě pro přehled kouče. Nejvýš jednou za hodinu: autosave
  // zapisuje po každé pauze v psaní a přepisovat kvůli tomu účet při každém
  // stisku klávesy by z něj udělalo horké místo databáze.
  if (!klient.lastActivityAt || now - klient.lastActivityAt > 60 * 60 * 1000) {
    await ctx.db.patch(klient._id, { lastActivityAt: now })
  }
  return klient
}

/** Identita pro akce v plannerAuth.ts. Vrací null místo chyby. */
export const whoAmIId = internalQuery({
  args: { sessionToken: v.string() },
  returns: v.union(v.id("plannerClients"), v.null()),
  handler: async (ctx, args) => {
    try {
      return (await requireClient(ctx, args.sessionToken))._id
    } catch {
      return null
    }
  },
})

/** Informace o přihlášeném klientovi pro hlavičku aplikace. */
export const me = query({
  args: { sessionToken: v.string() },
  returns: v.union(
    v.object({
      name: v.string(),
      email: v.string(),
      gender: v.optional(genderValidator),
      lang: v.string(),
      createdAt: v.number(),
      /**
       * Co z deníku vidí kouč.
       *
       * Vrací se klientovi schválně a vždycky: úroveň nastavuje kouč, ale
       * klient o ní musí vědět. Deník, o kterém člověk netuší, že do něj
       * někdo vidí, je horší než deník, do kterého se nedá psát.
       */
      sdileni: v.union(v.literal("nic"), v.literal("cisla"), v.literal("vse")),
      /** účet běží na dočasném heslu od kouče a čeká na vlastní */
      mustChangePassword: v.boolean(),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    try {
      const k = await requireClient(ctx, args.sessionToken)
      return {
        name: k.name,
        email: k.email,
        gender: k.gender,
        lang: k.lang,
        createdAt: k.createdAt,
        sdileni: k.sdileni ?? "nic",
        mustChangePassword: k.mustChangePassword === true,
      }
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
    const s = await ctx.db
      .query("plannerSessions")
      .withIndex("by_token", (q) => q.eq("token", args.sessionToken))
      .unique()
    if (s) await ctx.db.delete(s._id)
    return null
  },
})

/** Odhlášení ze všech zařízení. */
export const logoutAll = mutation({
  args: { sessionToken: v.string() },
  returns: v.object({ ukonceno: v.number() }),
  handler: async (ctx, args) => {
    const klient = await requireClientProZapis(ctx, args.sessionToken)
    const relace = await ctx.db
      .query("plannerSessions")
      .withIndex("by_client", (q) => q.eq("clientId", klient._id))
      .collect()
    for (const r of relace) await ctx.db.delete(r._id)
    return { ukonceno: relace.length }
  },
})

/** Úprava jména, rodu a jazyka. E-mail se tudy měnit nedá, ten drží účet. */
export const updateProfile = mutation({
  args: {
    sessionToken: v.string(),
    name: v.string(),
    gender: v.optional(genderValidator),
    lang: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const klient = await requireClientProZapis(ctx, args.sessionToken)
    const jmeno = args.name.trim()
    if (jmeno.length < 2) throw new ConvexError("Zadej své jméno.")
    delka(jmeno, MEZ.jmeno, "Jméno")
    if (!JAZYKY.has(args.lang)) throw new ConvexError("Neznámý jazyk.")
    await ctx.db.patch(klient._id, { name: jmeno, gender: args.gender, lang: args.lang })
    return null
  },
})

// ─────────────────────────────────────────────────────────────────────────────
// Návyky
// ─────────────────────────────────────────────────────────────────────────────

const habitValidator = v.object({
  id: v.id("plannerHabits"),
  name: v.string(),
  order: v.number(),
  target: v.optional(v.number()),
  archivedAt: v.optional(v.number()),
  createdAt: v.number(),
})

async function nactiNavyky(ctx: QueryCtx, clientId: Id<"plannerClients">) {
  const vse = await ctx.db
    .query("plannerHabits")
    .withIndex("by_client", (q) => q.eq("clientId", clientId))
    .collect()
  return vse
    .sort((a, b) => a.order - b.order || a.createdAt - b.createdAt)
    .map((h) => ({
      id: h._id,
      name: h.name,
      order: h.order,
      target: h.target,
      archivedAt: h.archivedAt,
      createdAt: h.createdAt,
    }))
}

/** Návyk patřící přihlášenému klientovi, nebo chyba. */
async function mujNavyk(
  ctx: MutationCtx,
  clientId: Id<"plannerClients">,
  habitId: Id<"plannerHabits">,
): Promise<Doc<"plannerHabits">> {
  const h = await ctx.db.get(habitId)
  // Kontrola vlastnictví je tu podstatná: identifikátor přichází z prohlížeče
  // a bez ní by šlo cizím návykem manipulovat jen tím, že se uhodne.
  if (!h || h.clientId !== clientId) throw new ConvexError("Návyk nenalezen.")
  return h
}

export const listHabits = query({
  args: { sessionToken: v.string() },
  returns: v.array(habitValidator),
  handler: async (ctx, args) => {
    const klient = await requireClient(ctx, args.sessionToken)
    return await nactiNavyky(ctx, klient._id)
  },
})

export const addHabit = mutation({
  args: { sessionToken: v.string(), name: v.string(), target: v.optional(v.number()) },
  returns: v.id("plannerHabits"),
  handler: async (ctx, args) => {
    const klient = await requireClientProZapis(ctx, args.sessionToken)
    const nazev = args.name.trim()
    if (!nazev) throw new ConvexError("Zadej název návyku.")
    delka(nazev, MEZ.nazevNavyku, "Název návyku")
    if (args.target !== undefined && (args.target < 1 || args.target > 7)) {
      throw new ConvexError("Cíl musí být 1 až 7 dnů v týdnu.")
    }

    const vse = await ctx.db
      .query("plannerHabits")
      .withIndex("by_client", (q) => q.eq("clientId", klient._id))
      .collect()
    const aktivni = vse.filter((h) => !h.archivedAt)
    if (aktivni.length >= MEZ.navyku) {
      throw new ConvexError(
        `Víc než ${MEZ.navyku} návyků najednou tracker neuhlídá. Něco nejdřív archivuj.`,
      )
    }
    const order = aktivni.length ? Math.max(...aktivni.map((h) => h.order)) + 1 : 0
    return await ctx.db.insert("plannerHabits", {
      clientId: klient._id,
      name: nazev,
      order,
      target: args.target,
      createdAt: Date.now(),
    })
  },
})

/** Přejmenování a změna cíle. Historie odškrtnutých dnů zůstává. */
export const updateHabit = mutation({
  args: {
    sessionToken: v.string(),
    habitId: v.id("plannerHabits"),
    name: v.string(),
    /** null cíl zruší, undefined ho nechá být */
    target: v.optional(v.union(v.number(), v.null())),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const klient = await requireClientProZapis(ctx, args.sessionToken)
    const h = await mujNavyk(ctx, klient._id, args.habitId)
    const nazev = args.name.trim()
    if (!nazev) throw new ConvexError("Zadej název návyku.")
    delka(nazev, MEZ.nazevNavyku, "Název návyku")
    if (typeof args.target === "number" && (args.target < 1 || args.target > 7)) {
      throw new ConvexError("Cíl musí být 1 až 7 dnů v týdnu.")
    }
    await ctx.db.patch(h._id, {
      name: nazev,
      target: args.target === null ? undefined : args.target ?? h.target,
    })
    return null
  },
})

/** Posun návyku v trackeru nahoru nebo dolů. */
export const moveHabit = mutation({
  args: { sessionToken: v.string(), habitId: v.id("plannerHabits"), smer: v.union(v.literal(-1), v.literal(1)) },
  returns: v.null(),
  handler: async (ctx, args) => {
    const klient = await requireClientProZapis(ctx, args.sessionToken)
    const h = await mujNavyk(ctx, klient._id, args.habitId)
    if (h.archivedAt) throw new ConvexError("Archivovaný návyk se v trackeru nezobrazuje.")

    const aktivni = (
      await ctx.db
        .query("plannerHabits")
        .withIndex("by_client", (q) => q.eq("clientId", klient._id))
        .collect()
    )
      .filter((x) => !x.archivedAt)
      .sort((a, b) => a.order - b.order || a.createdAt - b.createdAt)

    const i = aktivni.findIndex((x) => x._id === h._id)
    const j = i + args.smer
    if (i < 0 || j < 0 || j >= aktivni.length) return null

    // Pořadí se přepíše celé odshora. Prohození dvou hodnot by u záznamů se
    // shodným `order` (starší data, souběžné přidání) nic neudělalo.
    const nove = [...aktivni]
    ;[nove[i], nove[j]] = [nove[j], nove[i]]
    for (let k = 0; k < nove.length; k++) {
      if (nove[k].order !== k) await ctx.db.patch(nove[k]._id, { order: k })
    }
    return null
  },
})

/**
 * Archivace a její zrušení.
 *
 * Archivovaný návyk zmizí z trackeru, ale zůstává v historii i ve
 * statistikách za období, kdy platil. Je to výchozí způsob, jak s návykem
 * skončit: čísla za minulé měsíce se tím nezmění.
 */
export const setHabitArchived = mutation({
  args: { sessionToken: v.string(), habitId: v.id("plannerHabits"), archived: v.boolean() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const klient = await requireClientProZapis(ctx, args.sessionToken)
    const h = await mujNavyk(ctx, klient._id, args.habitId)
    if (args.archived) {
      await ctx.db.patch(h._id, { archivedAt: Date.now() })
      return null
    }
    const aktivni = (
      await ctx.db
        .query("plannerHabits")
        .withIndex("by_client", (q) => q.eq("clientId", klient._id))
        .collect()
    ).filter((x) => !x.archivedAt)
    if (aktivni.length >= MEZ.navyku) {
      throw new ConvexError(`Tracker je plný, nejvýš ${MEZ.navyku} návyků najednou.`)
    }
    const order = aktivni.length ? Math.max(...aktivni.map((x) => x.order)) + 1 : 0
    await ctx.db.patch(h._id, { archivedAt: undefined, order })
    return null
  },
})

/**
 * Nevratné smazání návyku i se všemi odškrtnutými dny.
 *
 * Mění to minulost, proto to aplikace nabízí až za archivací a s výslovným
 * upozorněním. Dny se čistí po dávkách: Convex má strop na počet dokumentů
 * v jedné transakci a klient s několikaletým deníkem by ho přesáhl. Vrací
 * `hotovo: false`, když zbývá další dávka, a prohlížeč volání zopakuje.
 */
export const deleteHabit = mutation({
  args: { sessionToken: v.string(), habitId: v.id("plannerHabits") },
  returns: v.object({ hotovo: v.boolean() }),
  handler: async (ctx, args) => {
    const klient = await requireClientProZapis(ctx, args.sessionToken)
    const h = await mujNavyk(ctx, klient._id, args.habitId)

    const DAVKA = 300
    const dny = await ctx.db
      .query("plannerDays")
      .withIndex("by_client_date", (q) => q.eq("clientId", klient._id))
      .collect()
    let zmeneno = 0
    for (const d of dny) {
      if (!d.habits.includes(h._id)) continue
      if (zmeneno >= DAVKA) return { hotovo: false }
      await ctx.db.patch(d._id, {
        habits: d.habits.filter((x) => x !== h._id),
        updatedAt: Date.now(),
      })
      zmeneno++
    }
    await ctx.db.delete(h._id)
    return { hotovo: true }
  },
})

// ─────────────────────────────────────────────────────────────────────────────
// Dny a týdny
// ─────────────────────────────────────────────────────────────────────────────

const dayValidator = v.object({
  date: v.string(),
  schedule: v.array(v.object({ hour: v.number(), text: v.string() })),
  ratings: v.object({
    sleep: v.optional(v.number()),
    energy: v.optional(v.number()),
    focus: v.optional(v.number()),
    mood: v.optional(v.number()),
    productivity: v.optional(v.number()),
  }),
  reflection: v.object({
    grateful: v.optional(v.string()),
    win: v.optional(v.string()),
    improve: v.optional(v.string()),
  }),
  habits: v.array(v.string()),
  updatedAt: v.number(),
})

function naVystup(d: Doc<"plannerDays">) {
  return {
    date: d.date,
    schedule: d.schedule,
    ratings: d.ratings,
    reflection: d.reflection,
    habits: d.habits.map((h) => String(h)),
    updatedAt: d.updatedAt,
  }
}

async function nactiDny(
  ctx: QueryCtx,
  clientId: Id<"plannerClients">,
  od: string,
  do_: string,
) {
  const dny = await ctx.db
    .query("plannerDays")
    .withIndex("by_client_date", (q) => q.eq("clientId", clientId).gte("date", od).lte("date", do_))
    .collect()
  return dny.map(naVystup)
}

/**
 * Jeden týden: sedm dnů, poznámky a seznam návyků.
 *
 * Vrací se jedním dotazem, protože plánovač se otevírá jako celá dvoustrana
 * a načítat ji po částech by znamenalo, že se stránka skládá před očima.
 */
export const getWeek = query({
  args: { sessionToken: v.string(), monday: v.string() },
  returns: v.object({
    monday: v.string(),
    days: v.array(dayValidator),
    notes: v.string(),
    habits: v.array(habitValidator),
  }),
  handler: async (ctx, args) => {
    const klient = await requireClient(ctx, args.sessionToken)
    overPondeli(args.monday)
    const nedele = new Date(`${args.monday}T00:00:00Z`)
    nedele.setUTCDate(nedele.getUTCDate() + 6)
    const do_ = nedele.toISOString().slice(0, 10)

    const tyden = await ctx.db
      .query("plannerWeeks")
      .withIndex("by_client_monday", (q) => q.eq("clientId", klient._id).eq("monday", args.monday))
      .unique()

    return {
      monday: args.monday,
      days: await nactiDny(ctx, klient._id, args.monday, do_),
      notes: tyden?.notes ?? "",
      habits: await nactiNavyky(ctx, klient._id),
    }
  },
})

/**
 * Libovolný rozsah dnů pro statistiky.
 *
 * Rozsah je omezený na dva roky. Bez stropu by šlo jedním dotazem vytáhnout
 * celou historii a zdržet tím databázi; dva roky pokryjí i roční statistiku
 * se srovnáním s předchozím rokem.
 */
export const getRange = query({
  args: { sessionToken: v.string(), od: v.string(), do: v.string() },
  returns: v.object({
    days: v.array(dayValidator),
    habits: v.array(habitValidator),
    weeks: v.array(v.object({ monday: v.string(), notes: v.string() })),
  }),
  handler: async (ctx, args) => {
    const klient = await requireClient(ctx, args.sessionToken)
    overDatum(args.od)
    overDatum(args.do)
    if (args.od > args.do) throw new ConvexError("Rozsah je obráceně.")
    const dnu =
      (Date.parse(`${args.do}T00:00:00Z`) - Date.parse(`${args.od}T00:00:00Z`)) /
      (24 * 60 * 60 * 1000)
    if (dnu > 800) throw new ConvexError("Najednou lze načíst nejvýš dva roky.")

    const tydny = await ctx.db
      .query("plannerWeeks")
      .withIndex("by_client_monday", (q) =>
        q.eq("clientId", klient._id).gte("monday", args.od).lte("monday", args.do),
      )
      .collect()

    return {
      days: await nactiDny(ctx, klient._id, args.od, args.do),
      habits: await nactiNavyky(ctx, klient._id),
      weeks: tydny.map((t) => ({ monday: t.monday, notes: t.notes })),
    }
  },
})

/** Prázdný den, který se zakládá při prvním zápisu. */
function prazdnyDen(clientId: Id<"plannerClients">, date: string) {
  return {
    clientId,
    date,
    schedule: [] as { hour: number; text: string }[],
    ratings: {},
    reflection: {},
    habits: [] as Id<"plannerHabits">[],
    updatedAt: Date.now(),
  }
}

async function najdiNeboZaloz(
  ctx: MutationCtx,
  clientId: Id<"plannerClients">,
  date: string,
): Promise<Doc<"plannerDays">> {
  const existujici = await ctx.db
    .query("plannerDays")
    .withIndex("by_client_date", (q) => q.eq("clientId", clientId).eq("date", date))
    .unique()
  if (existujici) return existujici
  const id = await ctx.db.insert("plannerDays", prazdnyDen(clientId, date))
  // Počítadlo dnů se udržuje tady, kde den vzniká. Kouč tak vidí, že si klient
  // deník vede, aniž by se musely načítat samotné zápisky.
  const klient = await ctx.db.get(clientId)
  if (klient) await ctx.db.patch(clientId, { dnu: (klient.dnu ?? 0) + 1 })
  const novy = await ctx.db.get(id)
  if (!novy) throw new ConvexError("Den se nepodařilo založit.")
  return novy
}

/**
 * Zápis do jednoho dne.
 *
 * Všechny části jsou nepovinné, takže uložení jednoho políčka nesmaže
 * ostatní. U hodnocení znamená `null` vymazání hodnoty: bez něj by se
 * jednou zapsané číslo nedalo odstranit, jen přepsat, a plánovač slibuje,
 * že cokoli jde vzít zpět.
 */
export const saveDay = mutation({
  args: {
    sessionToken: v.string(),
    date: v.string(),
    schedule: v.optional(v.array(v.object({ hour: v.number(), text: v.string() }))),
    ratings: v.optional(
      v.object({
        sleep: v.optional(v.union(v.number(), v.null())),
        energy: v.optional(v.union(v.number(), v.null())),
        focus: v.optional(v.union(v.number(), v.null())),
        mood: v.optional(v.union(v.number(), v.null())),
        productivity: v.optional(v.union(v.number(), v.null())),
      }),
    ),
    reflection: v.optional(
      v.object({
        grateful: v.optional(v.string()),
        win: v.optional(v.string()),
        improve: v.optional(v.string()),
      }),
    ),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const klient = await requireClientProZapis(ctx, args.sessionToken)
    overDatum(args.date)
    const den = await najdiNeboZaloz(ctx, klient._id, args.date)

    // Vlastní tvar místo Partial<Doc<...>>: patch systémová pole nepřijímá,
    // takže by typ z dokumentu propustil `_id` a chyba by vylezla až za běhu.
    type ZmenaDne = {
      updatedAt: number
      schedule?: { hour: number; text: string }[]
      ratings?: Ukazatele
      reflection?: Reflexe
    }
    const zmena: ZmenaDne = { updatedAt: Date.now() }

    if (args.schedule) {
      const bloky = args.schedule
        .filter((s) => s.text.trim())
        .map((s) => {
          if (!Number.isInteger(s.hour) || s.hour < PRVNI_HODINA || s.hour > POSLEDNI_HODINA) {
            throw new ConvexError("Hodina je mimo rozvrh.")
          }
          delka(s.text, MEZ.blokRozvrhu, "Text v rozvrhu")
          return { hour: s.hour, text: s.text.trim() }
        })
        .sort((a, b) => a.hour - b.hour)
      // Dvě hodnoty pro tutéž hodinu by se v mřížce překreslovaly přes sebe.
      const hodiny = new Set(bloky.map((b) => b.hour))
      if (hodiny.size !== bloky.length) throw new ConvexError("Hodina se v rozvrhu opakuje.")
      zmena.schedule = bloky
    }

    if (args.ratings) {
      const nove: Ukazatele = { ...den.ratings }
      for (const klic of Object.keys(ROZSAH_UKAZATELU) as UkazatelKlic[]) {
        const hodnota = args.ratings[klic]
        if (hodnota === undefined) continue
        if (hodnota === null) {
          nove[klic] = undefined
          continue
        }
        const rozsah = ROZSAH_UKAZATELU[klic]
        if (!Number.isFinite(hodnota) || hodnota < rozsah.min || hodnota > rozsah.max) {
          throw new ConvexError("Hodnota je mimo rozsah.")
        }
        // Půlhodiny u spánku, celá čísla u škál. Zaokrouhlení tady zabrání
        // tomu, aby se do statistiky dostalo 7,3333 z ručně poslaného volání.
        nove[klic] = klic === "sleep" ? Math.round(hodnota * 2) / 2 : Math.round(hodnota)
      }
      zmena.ratings = nove
    }

    if (args.reflection) {
      const nova: Reflexe = { ...den.reflection }
      for (const klic of REFLEXE_KLICE) {
        const text = args.reflection[klic]
        if (text === undefined) continue
        delka(text, MEZ.reflexe, "Text reflexe")
        // Prázdný text hodnotu maže, ať po smazání nezůstane prázdný řetězec.
        nova[klic] = text.trim() ? text : undefined
      }
      zmena.reflection = nova
    }

    await ctx.db.patch(den._id, zmena)
    return null
  },
})

/**
 * Odškrtnutí návyku v konkrétním dni.
 *
 * Zvlášť od saveDay schválně: je to nejčastější úkon v celé aplikaci a má
 * být jedním kliknutím a jedním zápisem. Odznačení dělá totéž s `done: false`,
 * takže se nic nedá odškrtnout „nadobro".
 */
export const toggleHabit = mutation({
  args: {
    sessionToken: v.string(),
    date: v.string(),
    habitId: v.id("plannerHabits"),
    done: v.boolean(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const klient = await requireClientProZapis(ctx, args.sessionToken)
    overDatum(args.date)
    await mujNavyk(ctx, klient._id, args.habitId)
    const den = await najdiNeboZaloz(ctx, klient._id, args.date)

    const ma = den.habits.includes(args.habitId)
    if (ma === args.done) return null
    await ctx.db.patch(den._id, {
      habits: args.done
        ? [...den.habits, args.habitId]
        : den.habits.filter((h) => h !== args.habitId),
      updatedAt: Date.now(),
    })
    return null
  },
})

/** Poznámky a nápady k týdnu. */
export const saveWeekNotes = mutation({
  args: { sessionToken: v.string(), monday: v.string(), notes: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const klient = await requireClientProZapis(ctx, args.sessionToken)
    overPondeli(args.monday)
    delka(args.notes, MEZ.poznamky, "Poznámky")

    const existujici = await ctx.db
      .query("plannerWeeks")
      .withIndex("by_client_monday", (q) => q.eq("clientId", klient._id).eq("monday", args.monday))
      .unique()
    if (existujici) {
      await ctx.db.patch(existujici._id, { notes: args.notes, updatedAt: Date.now() })
      return null
    }
    // Prázdné poznámky nemá cenu zakládat, jen by zabíraly řádek v databázi.
    if (!args.notes.trim()) return null
    await ctx.db.insert("plannerWeeks", {
      clientId: klient._id,
      monday: args.monday,
      notes: args.notes,
      updatedAt: Date.now(),
    })
    return null
  },
})

/**
 * Které roky a měsíce už mají zápis.
 *
 * Statistika se tím dá nabídnout jen za období, kde vůbec něco je, místo aby
 * uživatel klikal do prázdna. Vrací se jen data, žádný obsah.
 */
export const dostupnaObdobi = query({
  args: { sessionToken: v.string() },
  returns: v.object({
    prvni: v.union(v.string(), v.null()),
    posledni: v.union(v.string(), v.null()),
    mesice: v.array(v.string()),
  }),
  handler: async (ctx, args) => {
    const klient = await requireClient(ctx, args.sessionToken)
    const dny = await ctx.db
      .query("plannerDays")
      .withIndex("by_client_date", (q) => q.eq("clientId", klient._id))
      .collect()
    if (!dny.length) return { prvni: null, posledni: null, mesice: [] }
    const data = dny.map((d) => d.date).sort()
    const mesice = [...new Set(data.map((d) => d.slice(0, 7)))].sort()
    return { prvni: data[0], posledni: data[data.length - 1], mesice }
  },
})

/**
 * Úklid prázdného dne.
 *
 * Den vzniká při prvním zápisu, takže po smazání posledního políčka zůstane
 * prázdná skořápka. Volá se po vymazání obsahu, aby počet dnů v přehledu
 * odpovídal tomu, co je skutečně napsané.
 */
export const uklidPrazdnyDen = mutation({
  args: { sessionToken: v.string(), date: v.string() },
  returns: v.object({ smazano: v.boolean() }),
  handler: async (ctx, args) => {
    const klient = await requireClientProZapis(ctx, args.sessionToken)
    overDatum(args.date)
    const den = await ctx.db
      .query("plannerDays")
      .withIndex("by_client_date", (q) => q.eq("clientId", klient._id).eq("date", args.date))
      .unique()
    if (!den) return { smazano: false }
    const prazdny =
      !den.habits.length &&
      !den.schedule.some((s) => s.text.trim()) &&
      !Object.values(den.ratings).some((v) => typeof v === "number") &&
      !Object.values(den.reflection).some((v) => (v ?? "").trim())
    if (!prazdny) return { smazano: false }
    await ctx.db.delete(den._id)
    await ctx.db.patch(klient._id, { dnu: Math.max(0, (klient.dnu ?? 1) - 1) })
    return { smazano: true }
  },
})

/**
 * Export celého deníku.
 *
 * Osobní zápisky mají jít vzít s sebou; bez exportu by byl deník past. Vrací
 * výhradně vlastní data přihlášeného klienta a nic navíc.
 */
export const exportVse = query({
  args: { sessionToken: v.string() },
  returns: v.object({
    klient: v.object({ name: v.string(), email: v.string(), createdAt: v.number() }),
    habits: v.array(habitValidator),
    days: v.array(dayValidator),
    weeks: v.array(v.object({ monday: v.string(), notes: v.string() })),
  }),
  handler: async (ctx, args) => {
    const klient = await requireClient(ctx, args.sessionToken)
    const dny = await ctx.db
      .query("plannerDays")
      .withIndex("by_client_date", (q) => q.eq("clientId", klient._id))
      .collect()
    const tydny = await ctx.db
      .query("plannerWeeks")
      .withIndex("by_client_monday", (q) => q.eq("clientId", klient._id))
      .collect()
    return {
      klient: { name: klient.name, email: klient.email, createdAt: klient.createdAt },
      habits: await nactiNavyky(ctx, klient._id),
      days: dny.sort((a, b) => a.date.localeCompare(b.date)).map(naVystup),
      weeks: tydny
        .sort((a, b) => a.monday.localeCompare(b.monday))
        .map((t) => ({ monday: t.monday, notes: t.notes })),
    }
  },
})
