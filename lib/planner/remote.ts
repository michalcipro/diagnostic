import { ConvexHttpClient } from "convex/browser"
import { makeFunctionReference } from "convex/server"
import type { Gender, Lang } from "@/lib/diagnostic/types"
import type {
  MetricKey,
  PlannerClientRow,
  PlannerDay,
  PlannerHabit,
  PlannerIdentity,
  PlannerInviteRow,
  ReflectionKey,
  ScheduleSlot,
  UrovenSdileni,
} from "./types"

// Napojení plánovače na Convex.
//
// Stejný přístup jako u diagnostiky: ConvexHttpClient a makeFunctionReference,
// takže není potřeba React provider ani vygenerovaný `_generated/api`. Deník
// se navíc ukládá průběžně po jednotlivých políčkách, kde je jednorázový
// požadavek přesně to, co chceme.

export { chybaText, isRemoteEnabled } from "@/lib/diagnostic/remote"

const convexUrl = typeof process !== "undefined" ? process.env.NEXT_PUBLIC_CONVEX_URL : undefined

function client(): ConvexHttpClient {
  if (!convexUrl) throw new Error("Chybí NEXT_PUBLIC_CONVEX_URL.")
  return new ConvexHttpClient(convexUrl)
}

// ── odkazy na serverové funkce ───────────────────────────────────────────────

const loginRef = makeFunctionReference<"action">("plannerAuth:login")
const activateRef = makeFunctionReference<"action">("plannerAuth:activate")
const changePasswordRef = makeFunctionReference<"action">("plannerAuth:changePassword")

const meRef = makeFunctionReference<"query">("planner:me")
const logoutRef = makeFunctionReference<"mutation">("planner:logout")
const logoutAllRef = makeFunctionReference<"mutation">("planner:logoutAll")
const updateProfileRef = makeFunctionReference<"mutation">("planner:updateProfile")

const getWeekRef = makeFunctionReference<"query">("planner:getWeek")
const getRangeRef = makeFunctionReference<"query">("planner:getRange")
const dostupnaObdobiRef = makeFunctionReference<"query">("planner:dostupnaObdobi")
const exportVseRef = makeFunctionReference<"query">("planner:exportVse")

const saveDayRef = makeFunctionReference<"mutation">("planner:saveDay")
const toggleHabitRef = makeFunctionReference<"mutation">("planner:toggleHabit")
const saveWeekNotesRef = makeFunctionReference<"mutation">("planner:saveWeekNotes")
const uklidPrazdnyDenRef = makeFunctionReference<"mutation">("planner:uklidPrazdnyDen")

const listHabitsRef = makeFunctionReference<"query">("planner:listHabits")
const addHabitRef = makeFunctionReference<"mutation">("planner:addHabit")
const updateHabitRef = makeFunctionReference<"mutation">("planner:updateHabit")
const moveHabitRef = makeFunctionReference<"mutation">("planner:moveHabit")
const setHabitArchivedRef = makeFunctionReference<"mutation">("planner:setHabitArchived")
const deleteHabitRef = makeFunctionReference<"mutation">("planner:deleteHabit")

const getInviteRef = makeFunctionReference<"query">("plannerCoach:getPlannerInvite")
const createInviteRef = makeFunctionReference<"mutation">("plannerCoach:createPlannerInvite")
const listClientsRef = makeFunctionReference<"query">("plannerCoach:listPlannerClients")
const listInvitesRef = makeFunctionReference<"query">("plannerCoach:listPlannerInvites")
const revokeInviteRef = makeFunctionReference<"mutation">("plannerCoach:revokePlannerInvite")
const setClientActiveRef = makeFunctionReference<"mutation">("plannerCoach:setPlannerClientActive")

const createClientWithPasswordRef = makeFunctionReference<"action">(
  "plannerAuth:createPlannerClientWithPassword",
)
const resetPasswordRef = makeFunctionReference<"action">("plannerAuth:resetPlannerPassword")
const clientDetailRef = makeFunctionReference<"mutation">(
  "plannerCoachRead:plannerClientDetail",
)
const setSdileniRef = makeFunctionReference<"mutation">("plannerCoachRead:setPlannerSdileni")

// ── přihlášení ───────────────────────────────────────────────────────────────

export interface Prihlaseni {
  sessionToken: string
  name: string
  lang: Lang
  /** true u účtu s dočasným heslem od kouče: nejdřív si zvolí vlastní */
  mustChangePassword: boolean
}

export async function login(email: string, password: string): Promise<Prihlaseni> {
  const r = (await client().action(loginRef, { email, password })) as {
    sessionToken: string
    name: string
    lang: string
    mustChangePassword: boolean
  }
  return { ...r, lang: r.lang as Lang }
}

export async function activate(token: string, password: string): Promise<Prihlaseni> {
  const r = (await client().action(activateRef, { token, password })) as {
    sessionToken: string
    name: string
    lang: string
    mustChangePassword: boolean
  }
  return { ...r, lang: r.lang as Lang }
}

export async function changePassword(
  sessionToken: string,
  currentPassword: string,
  newPassword: string,
): Promise<void> {
  await client().action(changePasswordRef, { sessionToken, currentPassword, newPassword })
}

export async function whoAmI(sessionToken: string): Promise<PlannerIdentity | null> {
  const r = (await client().query(meRef, { sessionToken })) as
    | {
        name: string
        email: string
        gender?: Gender
        lang: string
        createdAt: number
        sdileni: UrovenSdileni
        mustChangePassword: boolean
      }
    | null
  if (!r) return null
  return { ...r, lang: r.lang as Lang }
}

export async function logout(sessionToken: string): Promise<void> {
  await client().mutation(logoutRef, { sessionToken })
}

export async function logoutAll(sessionToken: string): Promise<number> {
  const r = (await client().mutation(logoutAllRef, { sessionToken })) as { ukonceno: number }
  return r.ukonceno
}

export async function updateProfile(
  sessionToken: string,
  name: string,
  gender: Gender | undefined,
  lang: Lang,
): Promise<void> {
  await client().mutation(updateProfileRef, { sessionToken, name, gender, lang })
}

// ── deník ────────────────────────────────────────────────────────────────────

export interface TydenData {
  monday: string
  days: PlannerDay[]
  notes: string
  habits: PlannerHabit[]
}

export async function getWeek(sessionToken: string, monday: string): Promise<TydenData> {
  return (await client().query(getWeekRef, { sessionToken, monday })) as TydenData
}

export interface RozsahData {
  days: PlannerDay[]
  habits: PlannerHabit[]
  weeks: { monday: string; notes: string }[]
}

export async function getRange(
  sessionToken: string,
  od: string,
  do_: string,
): Promise<RozsahData> {
  return (await client().query(getRangeRef, { sessionToken, od, do: do_ })) as RozsahData
}

export interface DostupnaObdobi {
  prvni: string | null
  posledni: string | null
  mesice: string[]
}

export async function dostupnaObdobi(sessionToken: string): Promise<DostupnaObdobi> {
  return (await client().query(dostupnaObdobiRef, { sessionToken })) as DostupnaObdobi
}

export interface ExportDeniku {
  klient: { name: string; email: string; createdAt: number }
  habits: PlannerHabit[]
  days: PlannerDay[]
  weeks: { monday: string; notes: string }[]
}

export async function exportVse(sessionToken: string): Promise<ExportDeniku> {
  return (await client().query(exportVseRef, { sessionToken })) as ExportDeniku
}

/**
 * Zápis do dne. Části, které se neposílají, zůstávají beze změny.
 *
 * U hodnocení znamená `null` vymazání hodnoty. Kdyby se místo toho posílalo
 * `undefined`, server by pole jen přeskočil a jednou zapsané číslo by nešlo
 * odstranit, jen přepsat.
 */
export async function saveDay(
  sessionToken: string,
  date: string,
  zmena: {
    schedule?: ScheduleSlot[]
    ratings?: Partial<Record<MetricKey, number | null>>
    reflection?: Partial<Record<ReflectionKey, string>>
  },
): Promise<void> {
  await client().mutation(saveDayRef, { sessionToken, date, ...zmena })
}

export async function toggleHabit(
  sessionToken: string,
  date: string,
  habitId: string,
  done: boolean,
): Promise<void> {
  await client().mutation(toggleHabitRef, { sessionToken, date, habitId, done })
}

export async function saveWeekNotes(
  sessionToken: string,
  monday: string,
  notes: string,
): Promise<void> {
  await client().mutation(saveWeekNotesRef, { sessionToken, monday, notes })
}

export async function uklidPrazdnyDen(sessionToken: string, date: string): Promise<boolean> {
  const r = (await client().mutation(uklidPrazdnyDenRef, { sessionToken, date })) as {
    smazano: boolean
  }
  return r.smazano
}

// ── návyky ───────────────────────────────────────────────────────────────────

export async function listHabits(sessionToken: string): Promise<PlannerHabit[]> {
  return (await client().query(listHabitsRef, { sessionToken })) as PlannerHabit[]
}

export async function addHabit(
  sessionToken: string,
  name: string,
  target?: number,
): Promise<string> {
  return (await client().mutation(addHabitRef, { sessionToken, name, target })) as string
}

export async function updateHabit(
  sessionToken: string,
  habitId: string,
  name: string,
  target: number | null,
): Promise<void> {
  await client().mutation(updateHabitRef, { sessionToken, habitId, name, target })
}

export async function moveHabit(
  sessionToken: string,
  habitId: string,
  smer: -1 | 1,
): Promise<void> {
  await client().mutation(moveHabitRef, { sessionToken, habitId, smer })
}

export async function setHabitArchived(
  sessionToken: string,
  habitId: string,
  archived: boolean,
): Promise<void> {
  await client().mutation(setHabitArchivedRef, { sessionToken, habitId, archived })
}

/**
 * Smazání návyku i s historií.
 *
 * Server maže po dávkách, aby se vešel do jedné transakce, a vrací
 * `hotovo: false`, když zbývá další. Opakuje se tady, ať se o to nemusí
 * starat obrazovka.
 */
export async function deleteHabit(sessionToken: string, habitId: string): Promise<void> {
  for (let i = 0; i < 40; i++) {
    const r = (await client().mutation(deleteHabitRef, { sessionToken, habitId })) as {
      hotovo: boolean
    }
    if (r.hotovo) return
  }
  throw new Error("Mazání návyku se nepodařilo dokončit. Zkus to prosím znovu.")
}

// ── pozvánka a sekce kouče ───────────────────────────────────────────────────

export interface PlannerInvite {
  status: "ok" | "used" | "expired" | "notfound"
  name?: string
  email?: string
  lang?: Lang
}

export async function fetchPlannerInvite(token: string): Promise<PlannerInvite> {
  if (!convexUrl) return { status: "notfound" }
  try {
    const r = (await client().query(getInviteRef, { token })) as PlannerInvite
    return r
  } catch {
    return { status: "notfound" }
  }
}

export async function createPlannerInvite(
  sessionToken: string,
  name: string,
  email: string,
  gender: Gender | undefined,
  lang: Lang,
  sdileni: UrovenSdileni,
): Promise<string> {
  const r = (await client().mutation(createInviteRef, {
    sessionToken,
    name,
    email,
    gender,
    lang,
    sdileni,
  })) as { token: string }
  return r.token
}

/** Založení deníku rovnou, s dočasným heslem. Heslo se vrátí jen tenhle jednou. */
export async function createPlannerClientWithPassword(
  sessionToken: string,
  name: string,
  email: string,
  gender: Gender | undefined,
  lang: Lang,
  sdileni: UrovenSdileni,
): Promise<string> {
  const r = (await client().action(createClientWithPasswordRef, {
    sessionToken,
    name,
    email,
    gender,
    lang,
    sdileni,
  })) as { clientId: string; password: string }
  return r.password
}

/** Nové dočasné heslo pro klienta, který se nemůže přihlásit. */
export async function resetPlannerPassword(
  sessionToken: string,
  clientId: string,
): Promise<{ name: string; email: string; password: string }> {
  return (await client().action(resetPasswordRef, { sessionToken, clientId })) as {
    name: string
    email: string
    password: string
  }
}

export async function listPlannerClients(sessionToken: string): Promise<PlannerClientRow[]> {
  const r = (await client().query(listClientsRef, { sessionToken })) as {
    id: string
    name: string
    email: string
    gender?: Gender
    lang: string
    active: boolean
    createdAt: number
    lastLoginAt?: number
    dnu: number
    lastActivityAt?: number
    sdileni: UrovenSdileni
    cekaNaZmenuHesla: boolean
  }[]
  return r.map((k) => ({
    id: k.id,
    name: k.name,
    email: k.email,
    gender: k.gender,
    lang: k.lang as Lang,
    active: k.active,
    createdAt: k.createdAt,
    lastLoginAt: k.lastLoginAt,
    dnu: k.dnu,
    posledniZapis: k.lastActivityAt
      ? new Date(k.lastActivityAt).toISOString().slice(0, 10)
      : undefined,
    sdileni: k.sdileni,
    cekaNaZmenuHesla: k.cekaNaZmenuHesla,
  }))
}

export async function listPlannerInvites(sessionToken: string): Promise<PlannerInviteRow[]> {
  const r = (await client().query(listInvitesRef, { sessionToken })) as {
    id: string
    token: string
    name: string
    email: string
    lang: string
    createdAt: number
    expiresAt: number
    usedAt?: number
    sdileni: UrovenSdileni
  }[]
  return r.map((p) => ({ ...p, lang: p.lang as Lang }))
}

export async function revokePlannerInvite(
  sessionToken: string,
  inviteId: string,
): Promise<void> {
  await client().mutation(revokeInviteRef, { sessionToken, inviteId })
}

export async function setPlannerClientActive(
  sessionToken: string,
  clientId: string,
  active: boolean,
): Promise<void> {
  await client().mutation(setClientActiveRef, { sessionToken, clientId, active })
}

/**
 * Deník klienta tak, jak ho smí vidět kouč.
 *
 * Je to mutace, ne dotaz: každé nahlédnutí server zapisuje do přístupového
 * logu. `texty` říká, jestli přišly i volné texty, nebo jen čísla.
 */
export interface DenikKlienta {
  name: string
  email: string
  gender?: Gender
  lang: Lang
  active: boolean
  createdAt: number
  lastLoginAt?: number
  lastActivityAt?: number
  dnu: number
  sdileni: UrovenSdileni
  texty: boolean
  days: PlannerDay[]
  habits: PlannerHabit[]
  weeks: { monday: string; notes: string }[]
}

export async function plannerClientDetail(
  sessionToken: string,
  clientId: string,
  od: string,
  do_: string,
): Promise<DenikKlienta> {
  const r = (await client().mutation(clientDetailRef, {
    sessionToken,
    clientId,
    od,
    do: do_,
  })) as DenikKlienta & { lang: string }
  return { ...r, lang: r.lang as Lang }
}

export async function setPlannerSdileni(
  sessionToken: string,
  clientId: string,
  sdileni: UrovenSdileni,
): Promise<void> {
  await client().mutation(setSdileniRef, { sessionToken, clientId, sdileni })
}
