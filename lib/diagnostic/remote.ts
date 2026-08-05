import { ConvexHttpClient } from "convex/browser"
import { makeFunctionReference } from "convex/server"
import type { AnswerMap, Lang, PersonInfo, StoredSession, TestId } from "./types"

// Napojení na Convex backend.
//
// Funguje pouze pokud je nastaveno NEXT_PUBLIC_CONVEX_URL – jinak se dotazník
// nikam neodešle a aplikace na to upozorní.
//
// Používáme ConvexHttpClient + makeFunctionReference záměrně: nevyžaduje
// React provider ani vygenerovaný `_generated/api`.

const convexUrl =
  typeof process !== "undefined" ? process.env.NEXT_PUBLIC_CONVEX_URL : undefined

export function isRemoteEnabled(): boolean {
  return !!convexUrl
}

/**
 * Vytáhne srozumitelnou hlášku z chyby Convexu.
 *
 * Convex v produkci běžné chyby skrývá a klientovi pošle jen „Server Error";
 * text projde pouze u ConvexError, kde dorazí v poli `data`.
 */
export function chybaText(err: unknown, nahradni: string): string {
  // Začerněnou hlášku Convex posílá jako ConvexError s daty „Server Error".
  // Uživateli to nic neřekne, takže v takovém případě sáhneme po náhradě.
  const uklid = (s: string) =>
    s
      .replace(/\[Request ID:[^\]]*\]/gi, "")
      .replace(/\[CONVEX[^\]]*\]/gi, "")
      .replace(/^(Convex)?Error:\s*/i, "")
      .trim()

  const kandidati = [(err as { data?: unknown })?.data, (err as { message?: unknown })?.message, err]
  for (const k of kandidati) {
    if (typeof k !== "string" && !(k instanceof Error)) continue
    const text = uklid(typeof k === "string" ? k : k.message)
    if (text && !/^server error\.?$/i.test(text)) return text
  }
  return nahradni
}

const submitRef = makeFunctionReference<"mutation">("eliteDiagnostic:submitWithInvite")
const createInviteRef = makeFunctionReference<"mutation">("eliteDiagnostic:createInvite")
const getInviteRef = makeFunctionReference<"query">("eliteDiagnostic:getInvite")
const listInvitesRef = makeFunctionReference<"query">("eliteDiagnostic:listInvites")
const revokeInviteRef = makeFunctionReference<"mutation">("eliteDiagnostic:revokeInvite")
const listRef = makeFunctionReference<"query">("eliteDiagnostic:listForCoach")
const getRef = makeFunctionReference<"query">("eliteDiagnostic:getForCoach")
const setupStatusRef = makeFunctionReference<"query">("sessions:setupStatus")
const createMasterRef = makeFunctionReference<"action">("auth:createMaster")
const loginRef = makeFunctionReference<"action">("auth:login")
const meRef = makeFunctionReference<"query">("sessions:me")
const logoutRef = makeFunctionReference<"mutation">("sessions:logout")
const listCoachesRef = makeFunctionReference<"query">("sessions:listCoaches")
const addCoachRef = makeFunctionReference<"action">("auth:addCoach")
const setCoachActiveRef = makeFunctionReference<"mutation">("sessions:setCoachActive")
const changePasswordRef = makeFunctionReference<"action">("auth:changePassword")
const removeRef = makeFunctionReference<"mutation">("eliteDiagnostic:removeForCoach")
const changeTestRef = makeFunctionReference<"mutation">("eliteDiagnostic:changeTestForCoach")
const normStatsRef = makeFunctionReference<"query">("eliteDiagnostic:normStats")
const normExportRef = makeFunctionReference<"query">("eliteDiagnostic:normExport")

function client(): ConvexHttpClient | null {
  if (!convexUrl) return null
  return new ConvexHttpClient(convexUrl)
}

/** Zkrácený souhrn vyplnění pro seznam v přehledu kouče. */
export interface ResultSummary {
  id: string
  testId: TestId
  model: string
  variant: string
  lang: Lang
  personName: string
  personRole?: string
  fillDate: string
  answeredCount: number
  complete: boolean
  createdAt: number
}

/** Kompletní vyplnění včetně odpovědí. */
export interface ResultDetail {
  id: string
  testId: TestId
  lang: Lang
  person: PersonInfo
  answers: AnswerMap
  answeredCount: number
  complete: boolean
  /** chybí u vyplnění pořízených dřív, než se čas začal měřit */
  durationSec?: number
  createdAt: number
}

/** Pozvánka tak, jak ji vidí respondent – jen co je nutné k zobrazení testu. */
export interface Invite {
  status: "ok" | "used" | "notfound"
  testId?: TestId
  lang?: Lang
  clientName?: string
}

/** Pozvánka v přehledu kouče. */
export interface InviteRow {
  id: string
  token: string
  testId: TestId
  lang: Lang
  clientName?: string
  note?: string
  createdAt: number
  usedAt?: number
  resultId?: string
}

/**
 * Doba vyplňování v sekundách. Vrací undefined, pokud čas nedává smysl –
 * index tempa se pak nepočítá vůbec, což je lepší než počítat s nesmyslem.
 */
function sessionDurationSec(session: StoredSession): number | undefined {
  if (!session.finishedAt) return undefined
  const od = Date.parse(session.startedAt)
  const do_ = Date.parse(session.finishedAt)
  if (!Number.isFinite(od) || !Number.isFinite(do_)) return undefined
  const sec = Math.round((do_ - od) / 1000)
  return sec > 0 && sec < 86400 ? sec : undefined
}

/** Načte pozvánku podle tokenu z odkazu (veřejné). */
export async function fetchInvite(token: string): Promise<Invite> {
  const c = client()
  if (!c) throw new Error("not-configured")
  return (await c.query(getInviteRef, { token })) as Invite
}

/**
 * Odešle vyplněný dotazník proti pozvánce. Vrací true při úspěchu.
 * Respondent zpět nedostává žádná data – vyhodnocení vidí jen kouč.
 */
export async function submitWithInvite(token: string, session: StoredSession): Promise<boolean> {
  const c = client()
  if (!c) return false
  try {
    await c.mutation(submitRef, {
      token,
      person: session.person,
      answers: JSON.stringify(session.answers),
      durationSec: sessionDurationSec(session),
    })
    return true
  } catch (err) {
    console.error("[diagnostic] odeslání do Convexu selhalo", err)
    return false
  }
}

/** Vytvoří pozvánku na jedno použití (pouze s platným heslem). */
export async function createInvite(
  sessionToken: string,
  testId: TestId,
  lang: Lang,
  clientName?: string,
): Promise<string> {
  const c = client()
  if (!c) throw new Error("not-configured")
  const res = (await c.mutation(createInviteRef, {
    sessionToken,
    testId,
    lang,
    clientName: clientName || undefined,
  })) as { token: string }
  return res.token
}

/** Seznam pozvánek (pouze s platným heslem). */
export async function listInvites(sessionToken: string): Promise<InviteRow[]> {
  const c = client()
  if (!c) throw new Error("not-configured")
  return (await c.query(listInvitesRef, { sessionToken })) as InviteRow[]
}

/** Zruší pozvánku (pouze s platným heslem). */
export async function revokeInvite(sessionToken: string, id: string): Promise<void> {
  const c = client()
  if (!c) throw new Error("not-configured")
  await c.mutation(revokeInviteRef, { sessionToken, id })
}

// ── Účty a přihlášení ────────────────────────────────────────────

export interface CoachIdentity {
  name: string
  email: string
  role: "master" | "coach"
}

export interface CoachRow extends CoachIdentity {
  id: string
  active: boolean
  createdAt: number
  lastLoginAt?: number
}

/** Označení verze frontendu – drží krok s VERZE_BACKENDU v convex/sessions.ts. */
export const VERZE_FRONTENDU = "3"

/** Je potřeba teprve založit master účet? Vrací i verzi nasazeného backendu. */
export async function needsSetup(): Promise<{ needsSetup: boolean; verze: string }> {
  const c = client()
  if (!c) throw new Error("not-configured")
  const res = (await c.query(setupStatusRef, {})) as { needsSetup: boolean; verze?: string }
  // Starší nasazení backendu verzi ještě neposílá – pak to nepředstíráme.
  return { needsSetup: res.needsSetup, verze: res.verze ?? "≤2" }
}

/** Založí master účet přes jednorázový zakládací odkaz. */
export async function createMaster(
  setupToken: string,
  name: string,
  email: string,
  password: string,
): Promise<{ sessionToken: string; name: string; role: string }> {
  const c = client()
  if (!c) throw new Error("not-configured")
  return (await c.action(createMasterRef, { setupToken, name, email, password })) as {
    sessionToken: string
    name: string
    role: string
  }
}

/** Přihlášení e-mailem a heslem. */
export async function login(
  email: string,
  password: string,
): Promise<{ sessionToken: string; name: string; role: string }> {
  const c = client()
  if (!c) throw new Error("not-configured")
  return (await c.action(loginRef, { email, password })) as {
    sessionToken: string
    name: string
    role: string
  }
}

/** Ověří relaci a vrátí přihlášeného kouče (null, pokud vypršela). */
export async function whoAmI(sessionToken: string): Promise<CoachIdentity | null> {
  const c = client()
  if (!c) throw new Error("not-configured")
  return (await c.query(meRef, { sessionToken })) as CoachIdentity | null
}

export async function logout(sessionToken: string): Promise<void> {
  const c = client()
  if (!c) return
  try {
    await c.mutation(logoutRef, { sessionToken })
  } catch {
    // odhlášení v prohlížeči proběhne tak jako tak
  }
}

/** Seznam koučů – pouze master. */
export async function listCoaches(sessionToken: string): Promise<CoachRow[]> {
  const c = client()
  if (!c) throw new Error("not-configured")
  return (await c.query(listCoachesRef, { sessionToken })) as CoachRow[]
}

/** Přidání dalšího kouče – pouze master. */
export async function addCoach(
  sessionToken: string,
  name: string,
  email: string,
  password: string,
): Promise<void> {
  const c = client()
  if (!c) throw new Error("not-configured")
  await c.action(addCoachRef, { sessionToken, name, email, password })
}

/** Zapnutí/vypnutí přístupu kouče – pouze master. */
export async function setCoachActive(
  sessionToken: string,
  coachId: string,
  active: boolean,
): Promise<void> {
  const c = client()
  if (!c) throw new Error("not-configured")
  await c.mutation(setCoachActiveRef, { sessionToken, coachId, active })
}

/** Změna vlastního hesla. */
export async function changePassword(
  sessionToken: string,
  currentPassword: string,
  newPassword: string,
): Promise<void> {
  const c = client()
  if (!c) throw new Error("not-configured")
  await c.action(changePasswordRef, { sessionToken, currentPassword, newPassword })
}

/** Seznam všech vyplnění (pouze s platným heslem). */
export async function listResults(sessionToken: string): Promise<ResultSummary[]> {
  const c = client()
  if (!c) throw new Error("not-configured")
  return (await c.query(listRef, { sessionToken })) as ResultSummary[]
}

/** Jedno vyplnění včetně odpovědí (pouze s platným heslem). */
export async function getResult(sessionToken: string, id: string): Promise<ResultDetail | null> {
  const c = client()
  if (!c) throw new Error("not-configured")
  const doc = (await c.query(getRef, { sessionToken, id })) as
    | (Omit<ResultDetail, "answers"> & { answers: string })
    | null
  if (!doc) return null
  return { ...doc, answers: JSON.parse(doc.answers) as AnswerMap }
}

/** Smaže vyplnění (pouze s platným heslem). */
export async function removeResult(sessionToken: string, id: string): Promise<void> {
  const c = client()
  if (!c) throw new Error("not-configured")
  await c.mutation(removeRef, { sessionToken, id })
}

/**
 * Přeřadí vyplnění pod jinou variantu téhož testu. Server pustí jen záměnu
 * sport za business u stejného modelu; jiný počet položek odmítne.
 */
export async function changeResultTest(
  sessionToken: string,
  id: string,
  testId: TestId,
): Promise<void> {
  const c = client()
  if (!c) throw new Error("not-configured")
  await c.mutation(changeTestRef, { sessionToken, id, testId })
}

// ── Normativní vzorek ──────────────────────────────────────────────

export interface NormStats {
  total: number
  byTest: { testId: string; count: number; complete: number }[]
  months: string[]
}

/** Kolik anonymních záznamů se zatím nasbíralo. */
export async function normStats(sessionToken: string): Promise<NormStats> {
  const c = client()
  if (!c) throw new Error("not-configured")
  return (await c.query(normStatsRef, { sessionToken })) as NormStats
}

/** Export anonymního vzorku k analýze (bez jmen a bez vazby na vyplnění). */
export async function normExport(sessionToken: string): Promise<unknown[]> {
  const c = client()
  if (!c) throw new Error("not-configured")
  return (await c.query(normExportRef, { sessionToken })) as unknown[]
}
