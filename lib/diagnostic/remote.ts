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

const submitRef = makeFunctionReference<"mutation">("eliteDiagnostic:submit")
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

/**
 * Odešle vyplněný dotazník. Vrací true při úspěchu.
 * Respondent zpět nedostává žádná data ani odkaz — vyhodnocení vidí jen kouč.
 */
export async function submitToRemote(session: StoredSession): Promise<boolean> {
  const c = client()
  if (!c) return false
  try {
    await c.mutation(submitRef, {
      testId: session.testId,
      lang: session.lang,
      person: session.person,
      answers: JSON.stringify(session.answers),
    })
    return true
  } catch (err) {
    console.error("[diagnostic] odeslání do Convexu selhalo", err)
    return false
  }
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
