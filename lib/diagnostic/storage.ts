import type { AnswerMap, Lang, PersonInfo, StoredSession, TestId } from "./types"

// Ukládání rozpracovaného vyplnění do localStorage.
//
// Klíčem je token pozvánky, ne test – každá pozvánka má vlastní rozpracované
// odpovědi a nic se nemíchá dohromady.

const key = (token: string) => `wm-diagnostic:t:${token}`

export function loadSession(token: string): StoredSession | null {
  if (typeof window === "undefined") return null
  try {
    const raw = window.localStorage.getItem(key(token))
    if (!raw) return null
    const parsed = JSON.parse(raw) as StoredSession
    if (!parsed || typeof parsed !== "object" || !parsed.answers) return null
    return parsed
  } catch {
    return null
  }
}

export function saveSession(token: string, session: StoredSession): void {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(key(token), JSON.stringify(session))
  } catch {
    // úložiště plné / nedostupné – vyplňování může pokračovat bez ukládání
  }
}

export function clearSession(token: string): void {
  if (typeof window === "undefined") return
  try {
    window.localStorage.removeItem(key(token))
  } catch {
    // ignorovat
  }
}

export function newSession(testId: TestId, lang: Lang): StoredSession {
  return {
    testId,
    lang,
    person: { name: "", fillDate: new Date().toISOString().slice(0, 10) },
    answers: {} as AnswerMap,
    startedAt: new Date().toISOString(),
  }
}

export function answeredCount(answers: AnswerMap): number {
  return Object.keys(answers).length
}

export function updatePerson(session: StoredSession, person: Partial<PersonInfo>): StoredSession {
  return { ...session, person: { ...session.person, ...person } }
}
