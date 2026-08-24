import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"

// Samostatná aplikace ELITE Performance Diagnostic – vlastní Convex projekt.
//
// Přístup k dotazníku je pouze na pozvánku: kouč vygeneruje odkaz s tokenem
// na jedno použití. Vyplněné výsledky vidí pouze kouč (ověření heslem na
// serveru, viz eliteDiagnostic.ts) – respondent po odeslání žádná data nedostává.
export default defineSchema({
  // Kouči. První založený účet je master – vzniká přes jednorázový zakládací
  // odkaz, který po jeho vytvoření nadobro přestane fungovat. Další kouče
  // může přidat výhradně master.
  coaches: defineTable({
    email: v.string(),
    name: v.string(),
    passwordHash: v.string(),
    salt: v.string(),
    /**
     * master  – zakládá kouče a vidí celou naši větev, tedy klienty všech
     *   našich koučů. Do větví externích koučů nevidí ani on.
     * coach   – náš kouč. Vidí výhradně klienty, které si sám pozval. Přístup
     *   k cizímu klientovi nemá být vedlejším účinkem toho, že člověk pracuje
     *   ve stejné firmě; u údajů o duševním zdraví to platí dvojnásob.
     * external – externí kouč: samostatná větev klientů. Vidí výhradně to, co
     *   sám založil, a nikdo z našich na jeho klienty nevidí. Master o jeho
     *   větvi zná jen počty, typy testů a data, aby mohl vystavit fakturu.
     */
    role: v.union(v.literal("master"), v.literal("coach"), v.literal("external")),
    /** telefon, ať má master kontakt na jednom místě s účtem */
    phone: v.optional(v.string()),
    /** interní poznámka mastera k účtu, například smluvní podmínky */
    note: v.optional(v.string()),
    active: v.boolean(),
    createdAt: v.number(),
    lastLoginAt: v.optional(v.number()),
  }).index("by_email", ["email"]),

  // Přihlášené relace. Token drží prohlížeč, platnost je omezená.
  coachSessions: defineTable({
    token: v.string(),
    coachId: v.id("coaches"),
    createdAt: v.number(),
    expiresAt: v.number(),
    /**
     * Poslední použití relace. Platnost je klouzavá: kdo aplikaci používá,
     * zůstává přihlášený, kdo ji nechá ležet, vypadne. U starších relací
     * chybí, tam se bere createdAt.
     */
    lastSeenAt: v.optional(v.number()),
  })
    .index("by_token", ["token"])
    .index("by_coach", ["coachId"]),

  // Pozvánka = jeden odkaz pro jednoho klienta na jeden konkrétní test.
  // Týmy a kluby.
  //
  // Vlastní větev vedle koučování jednotlivců. Klub dostane svého kouče, ten
  // rozešle hráčům odkazy a pracuje s jejich výsledky. Master do výsledků
  // jednotlivých hráčů nevidí; z týmu zná název a souhrnný profil, nic víc.
  //
  // Kdo tým vede, je vždycky externí kouč: klub je cizí organizace a jeho
  // hráči nejsou naši klienti.
  teams: defineTable({
    nazev: v.string(),
    coachId: v.id("coaches"),
    createdAt: v.number(),
    active: v.boolean(),
    /** interní poznámka mastera, například smluvní podmínky klubu */
    note: v.optional(v.string()),
  })
    .index("by_coach", ["coachId"])
    .index("by_created", ["createdAt"]),

  invitations: defineTable({
    token: v.string(), // neuhodnutelný token v odkazu /t/<token>
    testId: v.string(),
    lang: v.string(),
    clientName: v.optional(v.string()), // předvyplní se respondentovi
    note: v.optional(v.string()), // interní poznámka kouče
    /**
     * Kdo pozvánku vystavil. Řídí se tím, do čí větve vyplnění spadne.
     * U záznamů z doby před externími kouči chybí; ty patří nám.
     */
    coachId: v.optional(v.id("coaches")),
    /**
     * Tým, do kterého pozvánka patří. U pozvánek mimo týmovou větev chybí.
     *
     * `clientName` u týmové pozvánky nese štítek hráče, který si kouč zvolil,
     * třeba „Player 7". Přiřazení štítku ke jménu drží kouč u sebe, v aplikaci
     * nikde není. Hráč si při vyplňování může štítek nechat, nebo místo něj
     * napsat svoje jméno; tím se rozhoduje, jestli ho kouč uvidí jmenovitě.
     */
    teamId: v.optional(v.id("teams")),
    createdAt: v.number(),
    /**
     * Do kdy odkaz platí. Nepoužitá pozvánka se po uplynutí neotevře:
     * odkaz putuje e-mailem a chatem a zůstává v historii schránek, takže
     * neomezená platnost je zbytečně dlouhé okno. U pozvánek vystavených
     * dřív chybí; ty platí dál bez omezení.
     */
    expiresAt: v.optional(v.number()),
    usedAt: v.optional(v.number()), // vyplněno = pozvánka spotřebovaná
    resultId: v.optional(v.id("eliteDiagnosticResults")),
  })
    .index("by_token", ["token"])
    .index("by_coach", ["coachId"])
    .index("by_team", ["teamId"])
    .index("by_created", ["createdAt"]),

  // Anonymní vzorek pro tvorbu norem.
  //
  // Záměrně samostatná tabulka BEZ odkazu na vyplnění a bez jména. Kdyby tu byl
  // resultId nebo přesný čas pořízení, dal by se záznam triviálně spárovat zpět
  // s konkrétním člověkem a celá anonymizace by byla jen naoko. Proto je tu
  // z osobních údajů jen rok narození a povolání či disciplína, a čas pouze
  // v přesnosti na měsíc.
  normSamples: defineTable({
    testId: v.string(),
    model: v.string(),
    variant: v.string(),
    lang: v.string(),
    /**
     * Rok narození. U záznamů pořízených dřív; nově se ukládá ageBand,
     * protože přesný rok ve spojení s disciplínou zužuje okruh lidí až
     * na jednotlivce.
     */
    birthYear: v.optional(v.number()),
    /** pětileté pásmo narození, „1990-1994" */
    ageBand: v.optional(v.string()),
    /** rod – do norem patří, identifikující není */
    gender: v.optional(v.union(v.literal("male"), v.literal("female"))),
    /** povolání (business) nebo disciplína a úroveň (sport) */
    role: v.optional(v.string()),
    /** odpovědi – z nich se dopočítá reliabilita, faktorová struktura i normy */
    answers: v.string(),
    answeredCount: v.number(),
    complete: v.boolean(),
    durationSec: v.optional(v.number()),
    /** „2026-07" – na měsíc, ať nejde spárovat s časem vyplnění */
    collectedMonth: v.string(),
    /** „2026-Q3" – nově se plní tohle, měsíc zůstává kvůli starším záznamům */
    collectedQuarter: v.optional(v.string()),
    /**
     * Náhodný klíč sdílený s vyplněním, ze kterého vzorek vznikl.
     *
     * Sám o sobě neprozrazuje nic a nedá se z něj nic odvodit, ale umožňuje
     * smazat vzorek spolu s výsledkem. Bez něj by po uplatnění práva na výmaz
     * zůstaly odpovědi ve vzorku napořád, protože jiná vazba tu vědomě není.
     */
    vymazovyKlic: v.optional(v.string()),
  })
    .index("by_test", ["testId"])
    .index("by_month", ["collectedMonth"])
    .index("by_vymazovy_klic", ["vymazovyKlic"]),

  eliteDiagnosticResults: defineTable({
    testId: v.string(),
    model: v.string(),
    variant: v.string(),
    lang: v.string(),
    person: v.object({
      name: v.string(),
      birthDate: v.optional(v.string()),
      role: v.optional(v.string()),
      gender: v.optional(v.union(v.literal("male"), v.literal("female"))),
      fillDate: v.string(),
    }),
    answers: v.string(),
    answeredCount: v.number(),
    complete: v.boolean(),
    /**
     * Doba vyplňování v sekundách. Vstupuje do kontroly validity – příliš
     * rychlé vyplnění je silný ukazatel nedbalého odpovídání. U záznamů
     * pořízených dřív chybí, proto volitelné.
     */
    durationSec: v.optional(v.number()),
    /**
     * Kouč, do jehož větve vyplnění patří. Přebírá se z pozvánky. Chybí
     * u záznamů z doby před externími kouči; ty patří nám.
     */
    coachId: v.optional(v.id("coaches")),
    /** Tým, do jehož souhrnu vyplnění vstupuje. Mimo týmovou větev chybí. */
    teamId: v.optional(v.id("teams")),
    /** Štítek z pozvánky, třeba „Player 7". Drží se i když hráč vyplní jméno. */
    stitek: v.optional(v.string()),
    /**
     * Jestli hráč souhlasil, aby jeho vyhodnocení viděl kouč.
     *
     * Nesouhlas skryje vyhodnocení i odpovědi před koučem; do souhrnu týmu
     * vstupují tak jako tak, o čemž je hráč před odesláním zpraven. Chybí
     * u vyplnění mimo týmovou větev a u záznamů pořízených dřív; tam se
     * sdílení řeší tím, čí je to větev.
     */
    sdilet: v.optional(v.boolean()),
    /** párovací klíč k anonymnímu vzorku, viz normSamples.vymazovyKlic */
    vymazovyKlic: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_created", ["createdAt"])
    .index("by_coach", ["coachId"])
    .index("by_team", ["teamId"]),

  // Neúspěšná přihlášení. Bez stropu by šlo hesla zkoušet ve smyčce: Convex
  // vystavuje auth:login na veřejném API a PBKDF2 útok jen zpomalí.
  loginAttempts: defineTable({
    /** normalizovaný e-mail, na který se pokusy vážou */
    email: v.string(),
    failedCount: v.number(),
    firstFailedAt: v.number(),
    lastFailedAt: v.number(),
    /** do kdy je účet zamčený; chybí = není zamčený */
    lockedUntil: v.optional(v.number()),
  }).index("by_email", ["email"]),

  // Kdo se kdy podíval na výsledky.
  //
  // U zvláštní kategorie údajů je záznam o přístupu základní detekční
  // opatření: bez něj nejde zjistit, co se stalo, ani doložit, že se nestalo
  // nic. Hodnoty jsou bez osobních údajů, jen odkazy a čas.
  pristupovyLog: defineTable({
    coachId: v.id("coaches"),
    akce: v.union(
      v.literal("otevreni-vysledku"),
      v.literal("export-vzorku"),
      v.literal("smazani-vysledku"),
      v.literal("vytvoreni-pozvanky"),
      v.literal("vytvoreni-deniku"),
      v.literal("otevreni-deniku"),
      v.literal("zmena-sdileni-deniku"),
      v.literal("reset-hesla-deniku"),
      v.literal("prihlaseni"),
    ),
    resultId: v.optional(v.id("eliteDiagnosticResults")),
    at: v.number(),
  })
    .index("by_coach", ["coachId"])
    .index("by_at", ["at"]),

  // ───────────────────────────────────────────────────────────────────────────
  // Týdenní plánovač
  //
  // Elektronická podoba papírového Weekly Planneru. Stojí vedle diagnostiky,
  // ne uvnitř ní: diagnostika je jednorázový dotazník, jehož výsledek vidí
  // kouč, kdežto deník je osobní zápisník, který si klient vede sám. Jsou to
  // dva různé druhy dat s různým režimem, takže mají i vlastní účty, vlastní
  // relace a vlastní tabulky.
  //
  // Kolik z deníku vidí kouč, se řídí polem `sdileni` u klienta. Vždycky to
  // ví i klient sám, viz komentář u toho pole.
  // ───────────────────────────────────────────────────────────────────────────

  /**
   * Klientský účet plánovače.
   *
   * Vzniká výhradně od kouče, tudy se nikdo nezaregistruje sám. Buď z
   * pozvánky, kde si klient volí heslo sám, nebo rovnou s vygenerovaným
   * heslem, které si klient musí při prvním přihlášení změnit.
   */
  plannerClients: defineTable({
    email: v.string(),
    name: v.string(),
    passwordHash: v.string(),
    salt: v.string(),
    /**
     * Vynucená změna hesla při nejbližším přihlášení.
     *
     * Zapíná se u účtů založených s vygenerovaným heslem: to heslo prošlo
     * cizí schránkou, takže musí co nejdřív přestat platit. Dokud je příznak
     * nastavený, relace se sice založí, ale klient se dostane jen na
     * obrazovku se změnou hesla.
     */
    mustChangePassword: v.optional(v.boolean()),
    /**
     * Kolik z deníku vidí kouč.
     *
     * `nic` je stav, ve kterém plánovač vznikl: kouč vidí, že si klient deník
     * vede, ne co v něm je. `cisla` odemkne hodnocení, návyky a statistiky,
     * ale volné texty ne. `vse` odemkne i texty.
     *
     * Chybějící hodnota znamená `nic`, ne výchozí úroveň nových účtů. Je to
     * schválně: účty založené dřív vznikly za slibu, že do deníku nikdo
     * nevidí, a změna výchozí hodnoty ten slib nesmí zrušit zpětně.
     *
     * Ať je úroveň jakákoli, klient ji vidí na svém účtu běžnou větou.
     * Nepřiznaný dohled tahle aplikace nedělá.
     */
    sdileni: v.optional(
      v.union(v.literal("nic"), v.literal("cisla"), v.literal("vse")),
    ),
    /** rod kvůli českým a slovenským textům; angličtina ho neřeší */
    gender: v.optional(v.union(v.literal("male"), v.literal("female"))),
    lang: v.string(),
    /** kouč, který deník založil; jen on vidí, že klient deník má */
    coachId: v.id("coaches"),
    active: v.boolean(),
    createdAt: v.number(),
    lastLoginAt: v.optional(v.number()),
    /**
     * Kolik dnů deníku klient založil a kdy do něj naposledy sáhl.
     *
     * Odvozené hodnoty, které se udržují při zápisu. Jsou tu proto, aby kouč
     * viděl, že si klient deník vede, aniž by se kvůli tomu musel načítat
     * obsah: kdyby se počítalo dotazem přes dny, sahalo by se do zápisků
     * pokaždé, když se otevře přehled klientů.
     */
    dnu: v.optional(v.number()),
    lastActivityAt: v.optional(v.number()),
  })
    .index("by_email", ["email"])
    .index("by_coach", ["coachId"]),

  /** Přihlášené relace klientů. Oddělené od koučovských, ať se nemíchají role. */
  plannerSessions: defineTable({
    token: v.string(),
    clientId: v.id("plannerClients"),
    createdAt: v.number(),
    expiresAt: v.number(),
    lastSeenAt: v.optional(v.number()),
  })
    .index("by_token", ["token"])
    .index("by_client", ["clientId"]),

  /** Jednorázová pozvánka do plánovače. Klient si na ní nastaví heslo. */
  plannerInvites: defineTable({
    token: v.string(),
    coachId: v.id("coaches"),
    name: v.string(),
    email: v.string(),
    gender: v.optional(v.union(v.literal("male"), v.literal("female"))),
    lang: v.string(),
    /** úroveň, se kterou účet vznikne; chybějící hodnota znamená `nic` */
    sdileni: v.optional(
      v.union(v.literal("nic"), v.literal("cisla"), v.literal("vse")),
    ),
    createdAt: v.number(),
    expiresAt: v.number(),
    usedAt: v.optional(v.number()),
    clientId: v.optional(v.id("plannerClients")),
  })
    .index("by_token", ["token"])
    .index("by_coach", ["coachId"])
    .index("by_created", ["createdAt"]),

  /**
   * Návyk, který si klient definoval sám. Jediná měnitelná část plánovače.
   *
   * Archivace místo mazání je záměr: smazaný návyk by zpětně změnil čísla za
   * loňský rok, což je u statistiky, která má ukazovat postup, to nejhorší,
   * co se může stát. Smazat návyk jde, ale klient je předem upozorněn na to,
   * co se tím stane.
   */
  plannerHabits: defineTable({
    clientId: v.id("plannerClients"),
    name: v.string(),
    order: v.number(),
    /** kolik dnů v týdnu si klient dal za cíl; bez cíle se jen počítá */
    target: v.optional(v.number()),
    archivedAt: v.optional(v.number()),
    createdAt: v.number(),
  }).index("by_client", ["clientId"]),

  /**
   * Jeden den deníku.
   *
   * Všechno, co se k jednomu dni zapisuje, je v jednom dokumentu: rozvrh,
   * hodnocení, reflexe i odškrtnuté návyky. Odškrtnutí kolečka je tak jediný
   * zápis a odznačení totéž, což je přesně to chování, které plánovač slibuje.
   *
   * Index je složený z klienta a data, takže se týden, měsíc i rok načtou
   * jedním rozsahovým dotazem – řetězce „YYYY-MM-DD" se řadí jako kalendář.
   */
  plannerDays: defineTable({
    clientId: v.id("plannerClients"),
    date: v.string(),
    schedule: v.array(v.object({ hour: v.number(), text: v.string() })),
    ratings: v.object({
      /** v hodinách, ne na škále 1 až 10 */
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
    habits: v.array(v.id("plannerHabits")),
    updatedAt: v.number(),
  }).index("by_client_date", ["clientId", "date"]),

  /** Poznámky a nápady k týdnu. Klíčem je pondělí toho týdne. */
  plannerWeeks: defineTable({
    clientId: v.id("plannerClients"),
    monday: v.string(),
    notes: v.string(),
    updatedAt: v.number(),
  }).index("by_client_monday", ["clientId", "monday"]),
})
