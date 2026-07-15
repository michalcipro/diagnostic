import type { AnswerMap, Lang, PersonInfo, StoredSession, TestId } from "./types"

// Ukládání rozpracovaného i dokončeného vyplnění do localStorage.

const key = (testId: TestId) => `wm-diagnostic:${testId}`

export function loadSession(testId: TestId): StoredSession | null {
  if (typeof window === "undefined") return null
  try {
    const raw = window.localStorage.getItem(key(testId))
    if (!raw) return null
    const parsed = JSON.parse(raw) as StoredSession
    if (!parsed || typeof parsed !== "object" || !parsed.answers) return null
    return parsed
  } catch {
    return null
  }
}

export function saveSession(session: StoredSession): void {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(key(session.testId), JSON.stringify(session))
  } catch {
    // úložiště plné / nedostupné — vyplňování může pokračovat bez ukládání
  }
}

export function clearSession(testId: TestId): void {
  if (typeof window === "undefined") return
  try {
    window.localStorage.removeItem(key(testId))
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
