import { ConvexHttpClient } from "convex/browser"
import { makeFunctionReference } from "convex/server"
import type { AnswerMap, Lang, PersonInfo, StoredSession, TestId } from "./types"

// Napojení na izolovaný Convex modul `eliteDiagnostic`.
// Funguje pouze pokud je nastaveno NEXT_PUBLIC_CONVEX_URL — jinak celá
// diagnostika běží čistě lokálně (localStorage) a tyto funkce se přeskočí.
//
// Používáme ConvexHttpClient + makeFunctionReference záměrně: nevyžaduje
// React provider ani vygenerovaný `_generated/api`, takže modul zůstává
// nezávislý na zbytku aplikace a funguje i bez přihlášení.

const convexUrl =
  typeof process !== "undefined" ? process.env.NEXT_PUBLIC_CONVEX_URL : undefined

export function isRemoteEnabled(): boolean {
  return !!convexUrl
}

const submitRef = makeFunctionReference<"mutation">("eliteDiagnostic:submit")
const getByPublicIdRef = makeFunctionReference<"query">("eliteDiagnostic:getByPublicId")

function client(): ConvexHttpClient | null {
  if (!convexUrl) return null
  return new ConvexHttpClient(convexUrl)
}

export interface RemoteResult {
  publicId: string
  testId: TestId
  lang: Lang
  person: PersonInfo
  answers: AnswerMap
  answeredCount: number
  complete: boolean
  createdAt: number
}

/** Uloží vyplnění do Convexu a vrátí sdílecí publicId (nebo null při chybě/vypnutí). */
export async function submitToRemote(session: StoredSession): Promise<string | null> {
  const c = client()
  if (!c) return null
  try {
    const res = (await c.mutation(submitRef, {
      testId: session.testId,
      lang: session.lang,
      person: session.person,
      answers: JSON.stringify(session.answers),
    })) as { publicId: string }
    return res.publicId
  } catch (err) {
    console.error("[diagnostic] uložení do Convexu selhalo", err)
    return null
  }
}

/** Načte výsledek podle sdílecího odkazu. Null pokud neexistuje / je vypnuto. */
export async function fetchFromRemote(publicId: string): Promise<RemoteResult | null> {
  const c = client()
  if (!c) return null
  try {
    const doc = (await c.query(getByPublicIdRef, { publicId })) as {
      publicId: string
      testId: string
      lang: string
      person: PersonInfo
      answers: string
      answeredCount: number
      complete: boolean
      createdAt: number
    } | null
    if (!doc) return null
    return {
      publicId: doc.publicId,
      testId: doc.testId as TestId,
      lang: doc.lang === "en" ? "en" : "cs",
      person: doc.person,
      answers: JSON.parse(doc.answers) as AnswerMap,
      answeredCount: doc.answeredCount,
      complete: doc.complete,
      createdAt: doc.createdAt,
    }
  } catch (err) {
    console.error("[diagnostic] načtení z Convexu selhalo", err)
    return null
  }
}
