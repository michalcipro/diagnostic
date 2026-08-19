import { ConvexError, v } from "convex/values"
import { mutation } from "./_generated/server"
import type { MutationCtx } from "./_generated/server"
import type { Doc, Id } from "./_generated/dataModel"
import { filtrViditelnosti, requireCoachProZapis, zaznamenejPristup } from "./sessions"
import type { Coach } from "./sessions"
import { overPristupKDenikum } from "./plannerPilot"

// Nahlížení kouče do klientského deníku.
//
// Tenhle soubor je jediná cesta, kterou se obsah deníku dostane ke kouči.
// Stojí zvlášť schválně: kdyby byl přimíchaný ke správě klientů v
// plannerCoach.ts, nešlo by strojově ověřit, že se volné texty nevracejí
// omylem i tam, kde se vracet nemají.
//
// Pravidlo, na kterém to celé stojí:
//
//   Rozvrh dne, reflexe a poznámky k týdnu procházejí jedinou funkcí,
//   `naVystup`, a jedinou podmínkou, `sTexty`. Nikde jinde v tomhle souboru
//   se z deníku nečte text. Hlídá to skript scripts/audit-pristupu.cjs.
//
// Kolik kouč uvidí, se řídí polem `sdileni` u klienta:
//
//   nic    kouč se do deníku nedostane vůbec, jen ví, že si ho klient vede
//   cisla  hodnocení, návyky a statistiky; volné texty ne
//   vse    celý deník včetně textů
//
// Klient svou úroveň vidí na svém účtu. Nepřiznaný dohled tady není možný:
// úroveň mění kouč, ale změna se klientovi ukáže hned, jak si deník otevře.

/** Nejdelší rozsah, který jde načíst najednou. Stejný strop jako u klienta. */
const MAX_DNU = 800

const sdileniValidator = v.union(v.literal("nic"), v.literal("cisla"), v.literal("vse"))

type Uroven = "nic" | "cisla" | "vse"

/**
 * Úroveň sdílení u účtu, který ji nemá vyplněnou.
 *
 * Chybějící hodnota znamená `nic`. Účty založené dřív vznikly za slibu, že do
 * deníku nikdo nevidí, a zavedení sdílení ten slib nesmí zrušit zpětně.
 */
export function urovenKlienta(klient: Doc<"plannerClients">): Uroven {
  return klient.sdileni ?? "nic"
}

/**
 * Jeden den deníku tak, jak ho uvidí kouč.
 *
 * `sTexty` je jediné místo, kde se rozhoduje o volných textech. Když je
 * `false`, rozvrh a reflexe se nahradí prázdnou hodnotou ještě před tím, než
 * data opustí databázovou vrstvu, takže se ven nedostanou ani omylem.
 */
function naVystup(d: Doc<"plannerDays">, sTexty: boolean) {
  return {
    date: d.date,
    schedule: sTexty ? d.schedule : [],
    reflection: sTexty ? d.reflection : {},
    ratings: d.ratings,
    habits: d.habits.map((h) => String(h)),
    updatedAt: d.updatedAt,
  }
}

/** Poznámky k týdnu jsou taky volný text a řídí se stejnou podmínkou. */
function tydenNaVystup(t: Doc<"plannerWeeks">, sTexty: boolean) {
  return {
    monday: t.monday,
    notes: sTexty ? t.notes : "",
  }
}

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

const habitValidator = v.object({
  id: v.id("plannerHabits"),
  name: v.string(),
  order: v.number(),
  target: v.optional(v.number()),
  archivedAt: v.optional(v.number()),
  createdAt: v.number(),
})

/** Klient, na kterého kouč vidí, nebo chyba. */
async function dostupnyKlient(
  ctx: MutationCtx,
  kouc: Coach,
  clientId: Id<"plannerClients">,
): Promise<Doc<"plannerClients">> {
  const klient = await ctx.db.get(clientId)
  if (!klient) throw new ConvexError("Deník nenalezen.")
  const viditelny = await filtrViditelnosti(ctx, kouc)
  if (!viditelny(klient.coachId)) throw new ConvexError("K tomuhle deníku nemáš přístup.")
  return klient
}

function overDatum(datum: string): void {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(datum)) throw new ConvexError("Neplatné datum.")
}

/**
 * Deník klienta v zadaném rozsahu.
 *
 * Je to mutace, ne dotaz, přestože jen čte: každé nahlédnutí se zapisuje do
 * přístupového logu. Stejně to má diagnostika u otevření výsledku a ze
 * stejného důvodu. Bez záznamu nejde doložit, kdo se kdy do deníku podíval,
 * a u dat tohohle druhu je to první věc, na kterou se ptá každý, komu se
 * něco nezdá.
 */
export const plannerClientDetail = mutation({
  args: {
    sessionToken: v.string(),
    clientId: v.id("plannerClients"),
    od: v.string(),
    do: v.string(),
  },
  returns: v.object({
    name: v.string(),
    email: v.string(),
    gender: v.optional(v.union(v.literal("male"), v.literal("female"))),
    lang: v.string(),
    active: v.boolean(),
    createdAt: v.number(),
    lastLoginAt: v.optional(v.number()),
    lastActivityAt: v.optional(v.number()),
    dnu: v.number(),
    sdileni: sdileniValidator,
    /** true jen na úrovni `vse`; rozhraní podle toho popíše, co chybí */
    texty: v.boolean(),
    days: v.array(dayValidator),
    habits: v.array(habitValidator),
    weeks: v.array(v.object({ monday: v.string(), notes: v.string() })),
  }),
  handler: async (ctx, args) => {
    const kouc = await requireCoachProZapis(ctx, args.sessionToken)
    overPristupKDenikum(kouc)
    const klient = await dostupnyKlient(ctx, kouc, args.clientId)
    const uroven = urovenKlienta(klient)

    overDatum(args.od)
    overDatum(args.do)
    if (args.od > args.do) throw new ConvexError("Rozsah je obráceně.")
    const dnuVRozsahu =
      (Date.parse(`${args.do}T00:00:00Z`) - Date.parse(`${args.od}T00:00:00Z`)) /
      (24 * 60 * 60 * 1000)
    if (dnuVRozsahu > MAX_DNU) throw new ConvexError("Najednou lze načíst nejvýš dva roky.")

    const hlavicka = {
      name: klient.name,
      email: klient.email,
      gender: klient.gender,
      lang: klient.lang,
      active: klient.active,
      createdAt: klient.createdAt,
      lastLoginAt: klient.lastLoginAt,
      lastActivityAt: klient.lastActivityAt,
      dnu: klient.dnu ?? 0,
      sdileni: uroven,
    }

    // Úroveň `nic` končí tady. Nenačítá se ani jeden den: kdyby se načetly a
    // teprve pak zahodily, stačila by jedna chyba v dalším řádku k tomu, aby
    // se objevily na výstupu.
    if (uroven === "nic") {
      return { ...hlavicka, texty: false, days: [], habits: [], weeks: [] }
    }

    await zaznamenejPristup(ctx, kouc._id, "otevreni-deniku")

    const sTexty = uroven === "vse"

    const dny = await ctx.db
      .query("plannerDays")
      .withIndex("by_client_date", (q) =>
        q.eq("clientId", klient._id).gte("date", args.od).lte("date", args.do),
      )
      .collect()

    const tydny = await ctx.db
      .query("plannerWeeks")
      .withIndex("by_client_monday", (q) =>
        q.eq("clientId", klient._id).gte("monday", args.od).lte("monday", args.do),
      )
      .collect()

    const navyky = await ctx.db
      .query("plannerHabits")
      .withIndex("by_client", (q) => q.eq("clientId", klient._id))
      .collect()

    return {
      ...hlavicka,
      texty: sTexty,
      days: dny.map((d) => naVystup(d, sTexty)),
      weeks: tydny.map((t) => tydenNaVystup(t, sTexty)),
      habits: navyky
        .sort((a, b) => a.order - b.order || a.createdAt - b.createdAt)
        .map((h) => ({
          id: h._id,
          name: h.name,
          order: h.order,
          target: h.target,
          archivedAt: h.archivedAt,
          createdAt: h.createdAt,
        })),
    }
  },
})

/**
 * Změna úrovně sdílení u existujícího klienta.
 *
 * Mění ji kouč, protože je to součást dohody o spolupráci, ne nastavení
 * aplikace. Klient změnu uvidí na svém účtu, jakmile si deník otevře.
 */
export const setPlannerSdileni = mutation({
  args: {
    sessionToken: v.string(),
    clientId: v.id("plannerClients"),
    sdileni: sdileniValidator,
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const kouc = await requireCoachProZapis(ctx, args.sessionToken)
    overPristupKDenikum(kouc)
    const klient = await dostupnyKlient(ctx, kouc, args.clientId)
    await ctx.db.patch(klient._id, { sdileni: args.sdileni })
    await zaznamenejPristup(ctx, kouc._id, "zmena-sdileni-deniku")
    return null
  },
})
