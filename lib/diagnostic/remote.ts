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
const getRef = makeFunctionReference<"mutation">("eliteDiagnostic:getForCoach")
const setupStatusRef = makeFunctionReference<"query">("sessions:setupStatus")
const createMasterRef = makeFunctionReference<"action">("auth:createMaster")
const loginRef = makeFunctionReference<"action">("auth:login")
const meRef = makeFunctionReference<"query">("sessions:me")
const logoutRef = makeFunctionReference<"mutation">("sessions:logout")
const logoutAllRef = makeFunctionReference<"mutation">("sessions:logoutAll")
const listCoachesRef = makeFunctionReference<"query">("sessions:listCoaches")
const addCoachRef = makeFunctionReference<"action">("auth:addCoach")
const setCoachActiveRef = makeFunctionReference<"mutation">("sessions:setCoachActive")
const setCoachPouzeTymyRef = makeFunctionReference<"mutation">("sessions:setCoachPouzeTymy")
const changePasswordRef = makeFunctionReference<"action">("auth:changePassword")
const resetCoachPasswordRef = makeFunctionReference<"action">("auth:resetCoachPassword")
const updateCoachRef = makeFunctionReference<"action">("auth:updateCoach")
const removeRef = makeFunctionReference<"mutation">("eliteDiagnostic:removeForCoach")
const normStatsRef = makeFunctionReference<"query">("eliteDiagnostic:normStats")
const normExportRef = makeFunctionReference<"mutation">("eliteDiagnostic:normExport")
const externalUsageRef = makeFunctionReference<"query">("eliteDiagnostic:externalUsage")
const pristupovyLogRef = makeFunctionReference<"query">("sessions:pristupovyLog")

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
  status: "ok" | "used" | "expired" | "notfound"
  testId?: TestId
  lang?: Lang
  clientName?: string
  /** název týmu; jen u týmové pozvánky. Podle něj dotazník pozná větev. */
  tym?: string
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
  expiresAt?: number
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
export async function submitWithInvite(
  token: string,
  session: StoredSession,
  /** jen u týmové pozvánky: souhlas hráče se sdílením vyhodnocení s koučem */
  sdilet?: boolean,
): Promise<boolean> {
  const c = client()
  if (!c) return false
  try {
    await c.mutation(submitRef, {
      token,
      person: session.person,
      answers: JSON.stringify(session.answers),
      durationSec: sessionDurationSec(session),
      sdilet,
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

export type CoachRole = "master" | "coach" | "external"

export interface CoachIdentity {
  name: string
  email: string
  role: CoachRole
  /**
   * Klubový kouč: vystavuje odkazy jen svým hráčům a jen Players Survey.
   * Vynucuje to server, tohle je jen pro rozhraní, ať nenabízí, co stejně
   * neprojde.
   */
  pouzeTymy: boolean
}

export interface CoachRow extends CoachIdentity {
  id: string
  phone?: string
  /** interní poznámka mastera, například smluvní podmínky */
  note?: string
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
  role: "coach" | "external" = "coach",
  note?: string,
  phone?: string,
  /** klubový kouč: jen týmové odkazy a jen Players Survey */
  pouzeTymy?: boolean,
): Promise<void> {
  const c = client()
  if (!c) throw new Error("not-configured")
  await c.action(addCoachRef, {
    sessionToken,
    name,
    email,
    password,
    role,
    note,
    phone,
    pouzeTymy,
  })
}

/** Zúžení práv klubového kouče na týmové odkazy. Pouze master. */
export async function setCoachPouzeTymy(
  sessionToken: string,
  coachId: string,
  pouzeTymy: boolean,
): Promise<void> {
  const c = client()
  if (!c) throw new Error("not-configured")
  await c.mutation(setCoachPouzeTymyRef, { sessionToken, coachId, pouzeTymy })
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

/**
 * Odhlášení ze všech zařízení. Ruší i tu relaci, ze které se volá, takže
 * po ní následuje přihlášení znovu.
 */
export async function logoutAll(sessionToken: string): Promise<number> {
  const c = client()
  if (!c) throw new Error("not-configured")
  const r = (await c.mutation(logoutAllRef, { sessionToken })) as { ukonceno: number }
  return r.ukonceno
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
  const doc = (await c.mutation(getRef, { sessionToken, id })) as
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
  return (await c.mutation(normExportRef, { sessionToken })) as unknown[]
}

// ── Větve externích koučů ──────────────────────────────────────────

/** Jeden počet u jednoho testu. */
export interface PocetTestu {
  testId: string
  pocet: number
}

/**
 * Podklad pro fakturaci externímu kouči.
 *
 * Bez jakéhokoli osobního údaje: jen typ testu, datum a úplnost. Do klientů
 * externího kouče nevidíme, na účtování to ale stačí.
 */
export interface ExternalUsage {
  coachId: string
  name: string
  email: string
  role: "coach" | "external"
  note?: string
  active: boolean
  createdAt: number
  celkem: number
  podleTestu: PocetTestu[]
  podleMesice: { mesic: string; pocet: number; podleTestu: PocetTestu[] }[]
  zaznamy: {
    testId: string
    lang: string
    createdAt: number
    complete: boolean
    answeredCount: number
  }[]
}

/** Vytížení koučů, podklad pro fakturaci. Vidí ho pouze master. */
export async function externalUsage(sessionToken: string): Promise<ExternalUsage[]> {
  const c = client()
  if (!c) throw new Error("not-configured")
  return (await c.query(externalUsageRef, { sessionToken })) as ExternalUsage[]
}

/**
 * Vystaví kouči nové heslo. Smí jen master.
 *
 * Vrací ho v čitelné podobě, protože uložené je jen jako hash a jinde se už
 * nikdy nezobrazí. Předej ho kouči a nikam si ho neukládej.
 */
export async function resetCoachPassword(
  sessionToken: string,
  coachId: string,
): Promise<{ password: string; name: string; email: string }> {
  const c = client()
  if (!c) throw new Error("not-configured")
  return (await c.action(resetCoachPasswordRef, { sessionToken, coachId })) as {
    password: string
    name: string
    email: string
  }
}

/** Úprava jména a kontaktních údajů kouče. Smí jen master. */
export async function updateCoach(
  sessionToken: string,
  coachId: string,
  data: { name: string; email: string; phone?: string; note?: string },
): Promise<void> {
  const c = client()
  if (!c) throw new Error("not-configured")
  await c.action(updateCoachRef, { sessionToken, coachId, ...data })
}

/** Jeden záznam přístupového logu. */
export interface PristupZaznam {
  coachName: string
  akce: string
  at: number
}

/** Kdo se kdy díval na výsledky. Pouze pro mastera. */
export async function pristupovyLog(sessionToken: string): Promise<PristupZaznam[]> {
  const c = client()
  if (!c) throw new Error("not-configured")
  return (await c.query(pristupovyLogRef, { sessionToken })) as PristupZaznam[]
}

// ─────────────────────────────────────────────────────────────────────────────
// Týmy a kluby
// ─────────────────────────────────────────────────────────────────────────────

const createTeamRef = makeFunctionReference<"mutation">("teams:createTeam")
const setTeamActiveRef = makeFunctionReference<"mutation">("teams:setTeamActive")
const listTeamsRef = makeFunctionReference<"query">("teams:listTeams")
const mojeTymyRef = makeFunctionReference<"query">("teams:mojeTymy")
const createPlayerInviteRef = makeFunctionReference<"mutation">("teams:createPlayerInvite")
const listPlayersRef = makeFunctionReference<"query">("teams:listPlayers")
const teamReportRef = makeFunctionReference<"query">("teams:teamReport")

/** Tým v přehledu mastera. */
export interface TeamRow {
  id: string
  nazev: string
  coachId: string
  coachName: string
  active: boolean
  note?: string
  createdAt: number
  pozvano: number
  odevzdano: number
}

/** Tým očima kouče, který ho vede. */
export interface MujTym {
  id: string
  nazev: string
  active: boolean
  pozvano: number
  odevzdano: number
}

/** Řádek soupisky: jeden štítek hráče. */
export interface PlayerRow {
  inviteId: string
  token: string
  stitek: string
  lang: string
  createdAt: number
  expiresAt?: number
  odevzdanoAt?: number
  sdileno: boolean
  jmeno?: string
  resultId?: string
}

/** Souhrnný profil týmu tak, jak ho spočítal server. */
export interface TeamReport {
  nazev: string
  pozvano: number
  odevzdano: number
  zapocteno: number
  oblasti: {
    id: string
    prumer: number
    smodch: number
    min: number
    max: number
    pasma: { priority: number; stabilization: number; strong: number; elite: number }
    rozkol: boolean
    plosna: boolean
  }[]
  opory: string[]
  priority: string[]
  zlomy: string[]
  nalezy: { kod: string; sila: "vysoka" | "stredni"; oblasti: string[] }[]
  maloDat: boolean
}

export async function createTeam(
  sessionToken: string,
  nazev: string,
  coachId: string,
  note?: string,
): Promise<{ id: string }> {
  const c = client()
  if (!c) throw new Error("not-configured")
  try {
    return (await c.mutation(createTeamRef, { sessionToken, nazev, coachId, note })) as { id: string }
  } catch (e) {
    throw new Error(chybaText(e, "Tým se nepodařilo založit."))
  }
}

export async function setTeamActive(
  sessionToken: string,
  teamId: string,
  active: boolean,
): Promise<void> {
  const c = client()
  if (!c) throw new Error("not-configured")
  await c.mutation(setTeamActiveRef, { sessionToken, teamId, active })
}

export async function listTeams(sessionToken: string): Promise<TeamRow[]> {
  const c = client()
  if (!c) throw new Error("not-configured")
  return (await c.query(listTeamsRef, { sessionToken })) as TeamRow[]
}

export async function mojeTymy(sessionToken: string): Promise<MujTym[]> {
  const c = client()
  if (!c) throw new Error("not-configured")
  return (await c.query(mojeTymyRef, { sessionToken })) as MujTym[]
}

export async function createPlayerInvite(
  sessionToken: string,
  teamId: string,
  stitek: string,
  lang: string,
): Promise<{ token: string }> {
  const c = client()
  if (!c) throw new Error("not-configured")
  try {
    return (await c.mutation(createPlayerInviteRef, { sessionToken, teamId, stitek, lang })) as {
      token: string
    }
  } catch (e) {
    throw new Error(chybaText(e, "Odkaz se nepodařilo vystavit."))
  }
}

export async function listPlayers(sessionToken: string, teamId: string): Promise<PlayerRow[]> {
  const c = client()
  if (!c) throw new Error("not-configured")
  return (await c.query(listPlayersRef, { sessionToken, teamId })) as PlayerRow[]
}

export async function teamReport(
  sessionToken: string,
  teamId: string,
): Promise<TeamReport | null> {
  const c = client()
  if (!c) throw new Error("not-configured")
  return (await c.query(teamReportRef, { sessionToken, teamId })) as TeamReport | null
}
