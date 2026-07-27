import { ConvexHttpClient } from "convex/browser"
import { makeFunctionReference } from "convex/server"
import type { AnswerMap, Lang, PersonInfo, StoredSession, TestId } from "./types"

// Napojení na Convex backend.
//
// Funguje pouze pokud je nastaveno NEXT_PUBLIC_CONVEX_URL — jinak se dotazník
// nikam neodešle a aplikace na to upozorní.
//
// Používáme ConvexHttpClient + makeFunctionReference záměrně: nevyžaduje
// React provider ani vygenerovaný `_generated/api`.

const convexUrl =
  typeof process !== "undefined" ? process.env.NEXT_PUBLIC_CONVEX_URL : undefined

export function isRemoteEnabled(): boolean {
  return !!convexUrl
}

const submitRef = makeFunctionReference<"mutation">("eliteDiagnostic:submitWithInvite")
const createInviteRef = makeFunctionReference<"mutation">("eliteDiagnostic:createInvite")
const getInviteRef = makeFunctionReference<"query">("eliteDiagnostic:getInvite")
const listInvitesRef = makeFunctionReference<"query">("eliteDiagnostic:listInvites")
const revokeInviteRef = makeFunctionReference<"mutation">("eliteDiagnostic:revokeInvite")
const listRef = makeFunctionReference<"query">("eliteDiagnostic:listForCoach")
const getRef = makeFunctionReference<"query">("eliteDiagnostic:getForCoach")
const checkRef = makeFunctionReference<"query">("eliteDiagnostic:checkPassword")
const removeRef = makeFunctionReference<"mutation">("eliteDiagnostic:removeForCoach")

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
  createdAt: number
}

/** Pozvánka tak, jak ji vidí respondent — jen co je nutné k zobrazení testu. */
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

/** Načte pozvánku podle tokenu z odkazu (veřejné). */
export async function fetchInvite(token: string): Promise<Invite> {
  const c = client()
  if (!c) throw new Error("not-configured")
  return (await c.query(getInviteRef, { token })) as Invite
}

/**
 * Odešle vyplněný dotazník proti pozvánce. Vrací true při úspěchu.
 * Respondent zpět nedostává žádná data — vyhodnocení vidí jen kouč.
 */
export async function submitWithInvite(token: string, session: StoredSession): Promise<boolean> {
  const c = client()
  if (!c) return false
  try {
    await c.mutation(submitRef, {
      token,
      person: session.person,
      answers: JSON.stringify(session.answers),
    })
    return true
  } catch (err) {
    console.error("[diagnostic] odeslání do Convexu selhalo", err)
    return false
  }
}

/** Vytvoří pozvánku na jedno použití (pouze s platným heslem). */
export async function createInvite(
  password: string,
  testId: TestId,
  lang: Lang,
  clientName?: string,
): Promise<string> {
  const c = client()
  if (!c) throw new Error("not-configured")
  const res = (await c.mutation(createInviteRef, {
    password,
    testId,
    lang,
    clientName: clientName || undefined,
  })) as { token: string }
  return res.token
}

/** Seznam pozvánek (pouze s platným heslem). */
export async function listInvites(password: string): Promise<InviteRow[]> {
  const c = client()
  if (!c) throw new Error("not-configured")
  return (await c.query(listInvitesRef, { password })) as InviteRow[]
}

/** Zruší pozvánku (pouze s platným heslem). */
export async function revokeInvite(password: string, id: string): Promise<void> {
  const c = client()
  if (!c) throw new Error("not-configured")
  await c.mutation(revokeInviteRef, { password, id })
}

/** Ověří heslo kouče. */
export async function checkCoachPassword(password: string): Promise<boolean> {
  const c = client()
  if (!c) throw new Error("not-configured")
  return (await c.query(checkRef, { password })) as boolean
}

/** Seznam všech vyplnění (pouze s platným heslem). */
export async function listResults(password: string): Promise<ResultSummary[]> {
  const c = client()
  if (!c) throw new Error("not-configured")
  return (await c.query(listRef, { password })) as ResultSummary[]
}

/** Jedno vyplnění včetně odpovědí (pouze s platným heslem). */
export async function getResult(password: string, id: string): Promise<ResultDetail | null> {
  const c = client()
  if (!c) throw new Error("not-configured")
  const doc = (await c.query(getRef, { password, id })) as
    | (Omit<ResultDetail, "answers"> & { answers: string })
    | null
  if (!doc) return null
  return { ...doc, answers: JSON.parse(doc.answers) as AnswerMap }
}

/** Smaže vyplnění (pouze s platným heslem). */
export async function removeResult(password: string, id: string): Promise<void> {
  const c = client()
  if (!c) throw new Error("not-configured")
  await c.mutation(removeRef, { password, id })
}
