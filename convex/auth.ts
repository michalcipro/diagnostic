"use node"

import { ConvexError, v } from "convex/values"
import crypto from "node:crypto"
import { action } from "./_generated/server"
import { internal } from "./_generated/api"
import type { Id } from "./_generated/dataModel"

// Explicitní typy návratových hodnot. Bez nich TypeScript zacyklí odvozování,
// protože akce volají funkce přes `internal`, které se generují mimo jiné
// i z tohoto souboru (Convex chyby TS7022 / TS7023).
type Prihlaseni = { sessionToken: string; name: string; role: string }
/**
 * Výsledek přihlášení. Když má účet zapnutý druhý faktor a kód nepřišel,
 * vrací se „potreba-kod" místo relace: přihlašovací obrazovka pak doptá kód
 * a zavolá se znovu. Chybová hláška se na to nehodí, protože tohle není chyba.
 */
type VysledekPrihlaseni =
  | ({ stav: "ok" } & Prihlaseni)
  | { stav: "potreba-kod" }
type TotpStav = {
  totpSecret?: string
  totpAktivni?: boolean
  totpZalozniKody?: string[]
} | null
type CoachZaznam = {
  id: Id<"coaches">
  email: string
  name: string
  passwordHash: string
  salt: string
  role: "master" | "coach" | "external"
  active: boolean
} | null
type Identita = {
  id: Id<"coaches">
  email: string
  name: string
  role: "master" | "coach" | "external"
} | null

// Přihlašování koučů. Běží v Node prostředí, aby šlo použít pořádnou
// kryptografii – hesla se nikdy neukládají v čitelné podobě.

const PBKDF2_ITERATIONS = 210_000
/**
 * Platnost relace. Klouzavá: každé použití ji posune, takže kdo aplikaci
 * používá, zůstává přihlášený, a kdo ji nechá ležet, vypadne. Třicet dní
 * bylo na relaci, která leží v localStorage a odemyká cizí psychologické
 * profily, zbytečně dlouho.
 */
const SESSION_DAYS = 7

/**
 * Zakládací token pro master účet.
 *
 * Bere se výhradně z proměnné prostředí SETUP_TOKEN. Dřív tu stála zabudovaná
 * hodnota, aby se aplikace rozjela bez konfigurace; jenže tajemství ve zdrojovém
 * kódu vidí každý, kdo uvidí repozitář, a zůstane v historii gitu navždy.
 * U funkce, která vytváří nejvyšší oprávnění, se to nevyplatí.
 *
 * Druhou pojistkou zůstává podmínka „zatím neexistuje žádný kouč": jakmile
 * master vznikne, token ztrácí jakoukoli moc. Když proměnná není nastavená,
 * zakládání se odmítne – raději nefunkční odkaz než odkaz, který zná kdokoli.
 */
function zakladaciToken(): string | undefined {
  const t = process.env.SETUP_TOKEN?.trim()
  return t && t.length >= 20 ? t : undefined
}

function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, PBKDF2_ITERATIONS, 32, "sha256").toString("hex")
}

/** Porovnání odolné vůči útoku na dobu vyhodnocení. */
function safeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a, "utf8")
  const bb = Buffer.from(b, "utf8")
  if (ba.length !== bb.length) return false
  return crypto.timingSafeEqual(ba, bb)
}

function newToken(): string {
  return crypto.randomBytes(32).toString("hex")
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

// ---------------------------------------------------------------------------
// Druhý faktor: TOTP podle RFC 6238
//
// Šestimístný kód, SHA-1, krok 30 sekund, tedy to, co umí Google
// Authenticator, 1Password, Authy i Bitwarden. Implementace je pár řádků
// a nepotřebuje závislost navíc; ověřená je proti testovacím vektorům
// z přílohy B normy (viz scripts/test-totp.cjs).
// ---------------------------------------------------------------------------

const BASE32 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567"
const TOTP_KROK_S = 30
const TOTP_DELKA = 6
/**
 * Kolik kroků dozadu i dopředu se ještě uzná.
 *
 * Hodiny v telefonu se běžně rozejdou o pár vteřin a kód se opisuje ručně,
 * takže bez tolerance by se lidé nepřihlásili. Jeden krok na každou stranu je
 * doporučení normy: okno 90 sekund je pořád krátké.
 */
const TOTP_TOLERANCE = 1

function base32Zakoduj(bajty: Buffer): string {
  let bity = 0
  let hodnota = 0
  let out = ""
  for (const b of bajty) {
    hodnota = (hodnota << 8) | b
    bity += 8
    while (bity >= 5) {
      out += BASE32[(hodnota >>> (bity - 5)) & 31]
      bity -= 5
    }
  }
  if (bity > 0) out += BASE32[(hodnota << (5 - bity)) & 31]
  return out
}

function base32Dekoduj(text: string): Buffer {
  const cisty = text.replace(/[\s=]/g, "").toUpperCase()
  let bity = 0
  let hodnota = 0
  const out: number[] = []
  for (const znak of cisty) {
    const i = BASE32.indexOf(znak)
    if (i === -1) throw new ConvexError("Tajemství druhého faktoru je poškozené.")
    hodnota = (hodnota << 5) | i
    bity += 5
    if (bity >= 8) {
      out.push((hodnota >>> (bity - 8)) & 0xff)
      bity -= 8
    }
  }
  return Buffer.from(out)
}

/** Kód pro daný časový krok. */
function totpKod(secret: string, krok: number): string {
  const buf = Buffer.alloc(8)
  buf.writeBigUInt64BE(BigInt(krok))
  const hmac = crypto.createHmac("sha1", base32Dekoduj(secret)).update(buf).digest()
  const offset = hmac[hmac.length - 1] & 0x0f
  const cislo =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff)
  return String(cislo % 10 ** TOTP_DELKA).padStart(TOTP_DELKA, "0")
}

/** Sedí zadaný kód v povoleném okně? */
function totpSedi(secret: string, zadany: string): boolean {
  const cisty = zadany.replace(/\D/g, "")
  if (cisty.length !== TOTP_DELKA) return false
  const ted = Math.floor(Date.now() / 1000 / TOTP_KROK_S)
  for (let d = -TOTP_TOLERANCE; d <= TOTP_TOLERANCE; d++) {
    if (safeEqual(cisty, totpKod(secret, ted + d))) return true
  }
  return false
}

/** Nové tajemství: 20 bajtů, jak doporučuje norma. */
function noveTajemstvi(): string {
  return base32Zakoduj(crypto.randomBytes(20))
}

/**
 * Záložní kódy pro případ ztráty telefonu.
 *
 * Deset kódů po deseti znacích; v databázi leží jen otisky, takže se z ní
 * nedají přečíst. Otisk stačí SHA-256 bez zpomalení: kód má dost entropie
 * na to, aby se nedal uhodnout hrubou silou, na rozdíl od hesla.
 */
function noveZalozniKody(): { kody: string[]; otisky: string[] } {
  const abeceda = "abcdefghijkmnpqrstuvwxyz23456789"
  const kody = Array.from({ length: 10 }, () => {
    const b = crypto.randomBytes(10)
    const znaky = [...b].map((x) => abeceda[x % abeceda.length]).join("")
    return `${znaky.slice(0, 5)}-${znaky.slice(5)}`
  })
  return { kody, otisky: kody.map(otiskKodu) }
}

function otiskKodu(kod: string): string {
  return crypto.createHash("sha256").update(kod.trim().toLowerCase()).digest("hex")
}

/**
 * Porovná token z odkazu se serverovou hodnotou.
 *
 * Oba konce se ořezávají – do proměnné nastavené přes dashboard se snadno
 * dostane mezera nebo konec řádku a odkaz by pak bez viditelného důvodu
 * přestal platit.
 */
function tokenSedi(zadany: string): boolean {
  const povoleny = zakladaciToken()
  if (!povoleny) return false
  return safeEqual(zadany.trim(), povoleny)
}

/**
 * Ošetření neočekávané chyby uvnitř akce.
 *
 * Ověřené hlášky (ConvexError vyhozené naším kódem) jdou ven beze změny, ty
 * jsou psané klientovi. Cokoli jiného se ven posílá jen obecně a podrobnost
 * míří do logu: text vnitřní chyby prozrazuje o chodu serveru víc, než je
 * zdrávo, a útočníkovi usnadňuje mapování. V Convexu je vidět v Logs.
 */
async function sConvexChybou<T>(jmeno: string, fn: () => Promise<T>): Promise<T> {
  try {
    return await fn()
  } catch (e) {
    if (e instanceof ConvexError) throw e
    console.error(`Chyba při volání ${jmeno}:`, e)
    throw new ConvexError(
      `Operace ${jmeno} selhala z technických důvodů. Podrobnost je v Convexu v záložce Logs.`,
    )
  }
}

/**
 * Hesla, která projdou délkou, ale nedají útočníkovi žádnou práci. Seznam je
 * krátký schválně: nemá nahradit správce hesel, jen zachytit ta nejlínější.
 */
const CASTA_HESLA = [
  "heslo",
  "password",
  "qwertz",
  "qwerty",
  "12345",
  "abcdef",
  "admin",
  "winning",
  "diagnostic",
  "elite",
]

function validatePassword(password: string, email?: string, name?: string) {
  if (password.length < 10) {
    throw new ConvexError("Heslo musí mít alespoň 10 znaků.")
  }
  const male = password.toLowerCase()
  if (CASTA_HESLA.some((h) => male.includes(h))) {
    throw new ConvexError(
      "Heslo obsahuje příliš obvyklé slovo. Zvol něco, co se nedá uhodnout ze slovníku.",
    )
  }
  // Heslo odvozené z e-mailu nebo jména je první, co útočník zkusí.
  const zakazane = [email?.split("@")[0], name].filter((x): x is string => !!x && x.length >= 3)
  if (zakazane.some((x) => male.includes(x.toLowerCase()))) {
    throw new ConvexError("Heslo nesmí obsahovat tvoje jméno ani část e-mailu.")
  }
  // Horní mez: PBKDF2 počítá z celého vstupu, takže bez ní by šlo voláním
  // s obřím heslem vytížit server.
  if (password.length > 200) {
    throw new ConvexError("Heslo je příliš dlouhé (nejvýš 200 znaků).")
  }
}

/** Meze délky textových údajů účtu. Convex ověřuje typ, ne rozsah. */
function validateProfil(name: string, email: string, phone?: string, note?: string) {
  if (name.length > 120) throw new ConvexError("Jméno je příliš dlouhé (nejvýš 120 znaků).")
  if (email.length > 200) throw new ConvexError("E-mail je příliš dlouhý (nejvýš 200 znaků).")
  if ((phone?.length ?? 0) > 40) throw new ConvexError("Telefon je příliš dlouhý (nejvýš 40 znaků).")
  if ((note?.length ?? 0) > 2000) throw new ConvexError("Poznámka je příliš dlouhá (nejvýš 2000 znaků).")
}

/**
 * Založení master účtu přes jednorázový odkaz.
 *
 * Projde pouze tehdy, když sedí zakládací token a zároveň zatím neexistuje
 * žádný kouč. Jakmile master vznikne, odkaz je nadobro mrtvý – druhý účet už
 * tudy založit nejde.
 */
export const createMaster = action({
  args: {
    setupToken: v.string(),
    name: v.string(),
    email: v.string(),
    password: v.string(),
  },
  returns: v.object({ sessionToken: v.string(), name: v.string(), role: v.string() }),
  handler: async (ctx, args): Promise<Prihlaseni> =>
    sConvexChybou("createMaster", async () => {
      // Pořadí kontrol: existence mastera první. Je to nejsrozumitelnější
      // hláška a nic tím neuniká – totéž vrací veřejná sessions.setupStatus.
      const exists: boolean = await ctx.runQuery(internal.authInternal.anyCoachExists, {})
      if (exists) {
        throw new ConvexError("Master účet už existuje. Tento odkaz je neplatný.")
      }
      if (!zakladaciToken()) {
        throw new ConvexError(
          "Zakládání účtu není povolené: na serveru chybí proměnná SETUP_TOKEN. Nastav ji v Convexu (Settings → Environment Variables) na náhodnou hodnotu delší než 20 znaků a odkaz otevři s ní.",
        )
      }
      if (!tokenSedi(args.setupToken)) {
        throw new ConvexError(
          "Tenhle zakládací odkaz neplatí. Otevři přesně ten, který k aplikaci patří – na konci adresy musí být celý token.",
        )
      }
      const email = normalizeEmail(args.email)
      validatePassword(args.password, email, args.name)
      if (!email.includes("@")) throw new ConvexError("Zadej platný e-mail.")
      if (args.name.trim().length < 2) throw new ConvexError("Zadej své jméno.")
      validateProfil(args.name, email)

      const salt = crypto.randomBytes(16).toString("hex")
      const coachId: Id<"coaches"> = await ctx.runMutation(internal.authInternal.insertCoach, {
        email,
        name: args.name.trim(),
        passwordHash: hashPassword(args.password, salt),
        salt,
        role: "master",
      })

      const sessionToken = newToken()
      await ctx.runMutation(internal.authInternal.openSession, {
        coachId,
        token: sessionToken,
        days: SESSION_DAYS,
      })
      return { sessionToken, name: args.name.trim(), role: "master" }
    }),
})

/**
 * Přihlášení e-mailem a heslem, případně s kódem druhého faktoru.
 *
 * Po pěti neúspěších v patnácti minutách se účet na čas zamkne, aby nešlo
 * hesla zkoušet ve smyčce. Zamčení se navenek neprojeví jinou hláškou:
 * kdyby ano, dalo by se přes ně zjišťovat, které e-maily existují.
 *
 * Když má účet zapnutý druhý faktor, vrátí se po správném heslu stav
 * „potreba-kod" a klient se doptá. Kód se posílá až v druhém volání spolu
 * s heslem, takže se na serveru nedrží žádný mezistav.
 */
export const login = action({
  args: { email: v.string(), password: v.string(), kod: v.optional(v.string()) },
  returns: v.union(
    v.object({
      stav: v.literal("ok"),
      sessionToken: v.string(),
      name: v.string(),
      role: v.string(),
    }),
    v.object({ stav: v.literal("potreba-kod") }),
  ),
  handler: async (ctx, args): Promise<VysledekPrihlaseni> => {
    const email = normalizeEmail(args.email)
    // Stejná hláška pro neexistující účet, špatné heslo i zamčený účet – ať
    // nejde zjišťovat, které e-maily jsou zaregistrované.
    const chyba = "Nesprávný e-mail nebo heslo."

    const zamceno: boolean = await ctx.runQuery(internal.authInternal.jeZamceno, { email })
    if (zamceno) throw new ConvexError(chyba)

    const coach: CoachZaznam = await ctx.runQuery(internal.authInternal.findByEmail, { email })
    // Neexistující účet se počítá taky: jinak by šlo podle toho, jestli se
    // zamyká, poznat, které e-maily v databázi jsou.
    if (!coach || !coach.active) {
      await ctx.runMutation(internal.authInternal.zaznamenejNeuspech, { email })
      throw new ConvexError(chyba)
    }
    if (!safeEqual(hashPassword(args.password, coach.salt), coach.passwordHash)) {
      await ctx.runMutation(internal.authInternal.zaznamenejNeuspech, { email })
      throw new ConvexError(chyba)
    }

    // ---- druhý faktor ----
    const totp: TotpStav = await ctx.runQuery(internal.authInternal.najdiTotp, {
      coachId: coach.id,
    })
    if (totp?.totpAktivni && totp.totpSecret) {
      const zadany = args.kod?.trim() ?? ""
      if (!zadany) return { stav: "potreba-kod" }

      const otisk = otiskKodu(zadany)
      const jeZalozni = (totp.totpZalozniKody ?? []).includes(otisk)
      if (!jeZalozni && !totpSedi(totp.totpSecret, zadany)) {
        // Špatný kód se počítá do stropu stejně jako špatné heslo, jinak by
        // se dal šestimístný kód zkoušet donekonečna.
        await ctx.runMutation(internal.authInternal.zaznamenejNeuspech, { email })
        throw new ConvexError("Kód nesouhlasí. Zkontroluj čas v telefonu a zkus další kód.")
      }
      // Záložní kód platí jednou; po použití zmizí.
      if (jeZalozni) {
        await ctx.runMutation(internal.authInternal.spotrebujZalozniKod, {
          coachId: coach.id,
          otisk,
        })
      }
    }

    await ctx.runMutation(internal.authInternal.vynulujPokusy, { email })
    const sessionToken = newToken()
    await ctx.runMutation(internal.authInternal.openSession, {
      coachId: coach.id,
      token: sessionToken,
      days: SESSION_DAYS,
    })
    await ctx.runMutation(internal.authInternal.zaznamenejPrihlaseni, { coachId: coach.id })
    return { stav: "ok", sessionToken, name: coach.name, role: coach.role }
  },
})

// ---------------------------------------------------------------------------
// Správa druhého faktoru
//
// Zapíná se ve dvou krocích: nejdřív se vydá tajemství, pak se ověří první
// kód z aplikace a teprve potom se faktor zapne. Bez toho by stačil překlep
// při opisování k tomu, aby se člověk ke svému účtu už nedostal.
// ---------------------------------------------------------------------------

/** Krok 1: vydá tajemství k opsání do aplikace. Nic zatím nezapíná. */
export const zacniNastaveniTotp = action({
  args: { sessionToken: v.string() },
  returns: v.object({ secret: v.string(), uri: v.string() }),
  handler: async (ctx, args): Promise<{ secret: string; uri: string }> => {
    const me: Identita = await ctx.runQuery(internal.sessions.whoAmI, {
      sessionToken: args.sessionToken,
    })
    if (!me) throw new ConvexError("Přihlášení vypršelo.")
    const secret = noveTajemstvi()
    // otpauth URI umí načíst všechny běžné aplikace; kdo nemá čtečku kódů,
    // opíše samotné tajemství ručně.
    const popis = encodeURIComponent(`Winning Minds (${me.email})`)
    const uri = `otpauth://totp/${popis}?secret=${secret}&issuer=Winning%20Minds&algorithm=SHA1&digits=6&period=30`
    return { secret, uri }
  },
})

/**
 * Krok 2: ověří první kód a zapne druhý faktor.
 *
 * Vrací záložní kódy. Ukazují se jednou a v databázi po nich zůstane jen
 * otisk, takže je nedokáže přečíst ani master.
 */
export const potvrdTotp = action({
  args: { sessionToken: v.string(), secret: v.string(), kod: v.string() },
  returns: v.object({ zalozniKody: v.array(v.string()) }),
  handler: async (ctx, args): Promise<{ zalozniKody: string[] }> => {
    const me: Identita = await ctx.runQuery(internal.sessions.whoAmI, {
      sessionToken: args.sessionToken,
    })
    if (!me) throw new ConvexError("Přihlášení vypršelo.")
    if (!totpSedi(args.secret, args.kod)) {
      throw new ConvexError(
        "Kód nesouhlasí. Zkontroluj, že jsi tajemství opsal celé a že má telefon správný čas.",
      )
    }
    const { kody, otisky } = noveZalozniKody()
    await ctx.runMutation(internal.authInternal.zapniTotp, {
      coachId: me.id,
      secret: args.secret,
      zalozniKody: otisky,
    })
    return { zalozniKody: kody }
  },
})

/** Vypnutí druhého faktoru. Vyžaduje heslo, ať nestačí odemčený prohlížeč. */
export const vypniTotp = action({
  args: { sessionToken: v.string(), heslo: v.string() },
  returns: v.object({ ok: v.boolean() }),
  handler: async (ctx, args): Promise<{ ok: boolean }> => {
    const me: Identita = await ctx.runQuery(internal.sessions.whoAmI, {
      sessionToken: args.sessionToken,
    })
    if (!me) throw new ConvexError("Přihlášení vypršelo.")
    const coach: CoachZaznam = await ctx.runQuery(internal.authInternal.findByEmail, {
      email: me.email,
    })
    if (!coach) throw new ConvexError("Účet nenalezen.")
    if (!safeEqual(hashPassword(args.heslo, coach.salt), coach.passwordHash)) {
      throw new ConvexError("Heslo nesouhlasí.")
    }
    await ctx.runMutation(internal.authInternal.vypniTotpInterne, { coachId: coach.id })
    return { ok: true }
  },
})

/** Přidání dalšího kouče. Smí jen master. */
export const addCoach = action({
  args: {
    sessionToken: v.string(),
    name: v.string(),
    email: v.string(),
    password: v.string(),
    /**
     * Externí kouč dostane vlastní větev klientů, na kterou my nevidíme.
     * Druhý master tudy vzniknout nesmí, proto tu "master" schválně chybí.
     * audit-role-neuplny
     */
    role: v.optional(v.union(v.literal("coach"), v.literal("external"))),
    phone: v.optional(v.string()),
    note: v.optional(v.string()),
  },
  returns: v.object({ ok: v.boolean() }),
  handler: async (ctx, args): Promise<{ ok: boolean }> => {
    const me: Identita = await ctx.runQuery(internal.sessions.whoAmI, {
      sessionToken: args.sessionToken,
    })
    if (!me || me.role !== "master") {
      throw new ConvexError("Přidávat kouče může pouze master účet.")
    }
    const email = normalizeEmail(args.email)
    validatePassword(args.password, email, args.name)
    if (!email.includes("@")) throw new ConvexError("Zadej platný e-mail.")
    validateProfil(args.name, email, args.phone, args.note)

    const salt = crypto.randomBytes(16).toString("hex")
    await ctx.runMutation(internal.authInternal.insertCoach, {
      email,
      name: args.name.trim(),
      passwordHash: hashPassword(args.password, salt),
      salt,
      role: args.role ?? "coach",
      phone: args.phone?.trim() || undefined,
      note: args.note?.trim() || undefined,
    })
    return { ok: true }
  },
})

/** Změna vlastního hesla. */
export const changePassword = action({
  args: { sessionToken: v.string(), currentPassword: v.string(), newPassword: v.string() },
  returns: v.object({ ok: v.boolean() }),
  handler: async (ctx, args): Promise<{ ok: boolean }> => {
    const me: Identita = await ctx.runQuery(internal.sessions.whoAmI, {
      sessionToken: args.sessionToken,
    })
    if (!me) throw new ConvexError("Přihlášení vypršelo.")
    const coach: CoachZaznam = await ctx.runQuery(internal.authInternal.findByEmail, {
      email: me.email,
    })
    if (!coach) throw new ConvexError("Účet nenalezen.")
    if (!safeEqual(hashPassword(args.currentPassword, coach.salt), coach.passwordHash)) {
      throw new ConvexError("Stávající heslo nesouhlasí.")
    }
    validatePassword(args.newPassword, me.email, me.name)
    const salt = crypto.randomBytes(16).toString("hex")
    await ctx.runMutation(internal.authInternal.setPassword, {
      coachId: coach.id,
      passwordHash: hashPassword(args.newPassword, salt),
      salt,
    })
    return { ok: true }
  },
})

/**
 * Nové heslo pro cizí účet. Smí jen master. Vypíná i druhý faktor.
 *
 * Hesla jsou uložená hashovaná, takže se stávající heslo nedá přečíst ani
 * poslat znovu. Místo toho se vygeneruje nové, jednou se zobrazí masterovi
 * a ten ho předá kouči. Změna hesla ukončí všechny relace daného účtu, takže
 * kdo byl přihlášený na cizím zařízení, vypadne.
 *
 * Vlastní heslo si tudy master změnit nemůže: na to slouží changePassword,
 * který vyžaduje znalost stávajícího hesla. Jinak by stačil ukradený
 * přihlášený prohlížeč k tomu, aby se účet dal nadobro převzít.
 */
export const resetCoachPassword = action({
  args: { sessionToken: v.string(), coachId: v.id("coaches") },
  returns: v.object({ password: v.string(), name: v.string(), email: v.string() }),
  handler: async (ctx, args): Promise<{ password: string; name: string; email: string }> => {
    const me: Identita = await ctx.runQuery(internal.sessions.whoAmI, {
      sessionToken: args.sessionToken,
    })
    if (!me || me.role !== "master") {
      throw new ConvexError("Nové heslo může vystavit pouze master účet.")
    }
    if (me.id === args.coachId) {
      throw new ConvexError(
        "Vlastní heslo si tudy změnit nelze. Použij změnu hesla, která se ptá na to stávající.",
      )
    }
    const coach = await ctx.runQuery(internal.authInternal.getCoachById, { coachId: args.coachId })
    if (!coach) throw new ConvexError("Účet nenalezen.")

    const heslo = generujHeslo()
    const salt = crypto.randomBytes(16).toString("hex")
    await ctx.runMutation(internal.authInternal.setPassword, {
      coachId: args.coachId,
      passwordHash: hashPassword(heslo, salt),
      salt,
    })
    // Reset vypne i druhý faktor. Je to jediná záchrana pro kouče, který
    // ztratil telefon i záložní kódy; master za ni ručí tím, že heslo předává
    // osobně. Kouč si druhý faktor po přihlášení zapne znovu.
    await ctx.runMutation(internal.authInternal.vypniTotpInterne, { coachId: args.coachId })
    return { password: heslo, name: coach.name, email: coach.email }
  },
})

/**
 * Nové heslo ve tvaru čtyř skupin po čtyřech znacích.
 *
 * Bez podobných znaků (0/O, 1/l), aby se dalo bez chyby nadiktovat do
 * telefonu. Devatenáct znaků z dvaatřicetiznakové abecedy dává kolem osmdesáti
 * bitů entropie, což je na dočasné heslo víc než dost.
 */
function generujHeslo(): string {
  const abeceda = "abcdefghijkmnpqrstuvwxyz23456789"
  const bajty = crypto.randomBytes(16)
  const znaky = [...bajty].map((b) => abeceda[b % abeceda.length])
  return [0, 4, 8, 12].map((i) => znaky.slice(i, i + 4).join("")).join("-")
}

/** Úprava jména a kontaktních údajů kouče. Smí jen master. */
export const updateCoach = action({
  args: {
    sessionToken: v.string(),
    coachId: v.id("coaches"),
    name: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    note: v.optional(v.string()),
  },
  returns: v.object({ ok: v.boolean() }),
  handler: async (ctx, args): Promise<{ ok: boolean }> => {
    const me: Identita = await ctx.runQuery(internal.sessions.whoAmI, {
      sessionToken: args.sessionToken,
    })
    if (!me || me.role !== "master") {
      throw new ConvexError("Upravovat účty může pouze master účet.")
    }
    const jmeno = args.name.trim()
    if (jmeno.length < 2) throw new ConvexError("Zadej jméno.")
    const email = normalizeEmail(args.email)
    if (!email.includes("@")) throw new ConvexError("Zadej platný e-mail.")
    validateProfil(jmeno, email, args.phone, args.note)

    await ctx.runMutation(internal.authInternal.updateCoachProfile, {
      coachId: args.coachId,
      name: jmeno,
      email,
      phone: args.phone?.trim() || undefined,
      note: args.note?.trim() || undefined,
    })
    return { ok: true }
  },
})
