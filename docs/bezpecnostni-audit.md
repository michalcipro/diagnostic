# Bezpečnostní audit aplikace

Stav ke dni 16. 8. 2026, revize `5563268`.

**Aktualizace téhož dne:** opravené jsou nálezy K1, V1 až V5, S1 až S5 a N1,
N2, N4. Viz sekci „Co už je hotové" níže. Otevřené zůstávají N3 (druhý faktor),
N5 a dokumenty ke GDPR, ke kterým je podklad v `docs/gdpr-podklady.md`.

Auditovaná aplikace: Performance Diagnostic ELITE (elitediagnostic.cz), Next.js
na Vercelu, Convex jako backend a databáze.

## Proč je laťka vysoko

Aplikace zpracovává výsledky psychologické diagnostiky: emocionálně-destruktivní
vzorce, výkonové bloky, archetypy osobnosti. To nejsou běžné osobní údaje.
Podle čl. 9 GDPR jde o zvláštní kategorii (údaje vypovídající o duševním zdraví),
u které je únik mnohem závažnější než u kontaktních údajů a u které zákon
vyžaduje přísnější režim. Zároveň je celý produkt postavený na slibu, že
výsledky vidí výhradně kouč. Bezpečnost tady není příloha, je to součást
podstaty služby.

Audit proto hodnotí i věci, které by u běžné firemní aplikace byly zbytečné.

## Metoda

Prošel jsem ručně celou serverovou vrstvu (`convex/`), klientské stránky
(`app/`), přístup k backendu (`lib/diagnostic/remote.ts`), konfiguraci
(`next.config.js`, `.gitignore`) a závislosti (`npm audit`). Zaměřil jsem se na
autentizaci, autorizaci, generování tajemství, validaci vstupů, únik dat
a soulad se zpracováním zvláštní kategorie údajů.

Nešlo o penetrační test proti běžícímu prostředí; nálezy vycházejí ze zdrojového
kódu a konfigurace.

---

## Co už je hotové

Následující nálezy byly opravené hned po auditu. Šlo o změny, které nemění
chování aplikace pro uživatele, takže je bylo možné nasadit bez přípravy.

| Nález | Co se změnilo |
|---|---|
| K1 | Tokeny pozvánek pocházejí z Web Crypto a mají 120 bitů entropie. Když by runtime Web Crypto neměl, vystavení pozvánky selže s hláškou; tiché sáhnutí po Math.random() je vyloučené. |
| V2 | Zabudovaný zakládací token je pryč, bere se výhradně ze `SETUP_TOKEN`. Bez proměnné se zakládání odmítne. Pořadí kontrol se změnilo tak, aby existující master vracel srozumitelnou hlášku. |
| V4 | Meze délky u jména, role, dat, odpovědí, poznámek, hesla a údajů účtu. Do `answers` se navíc ukládá až přeskládaná mapa po kontrole položku po položce, ne původní řetězec od klienta. |
| V5 | `npm audit` hlásí nula zranitelností (bylo 5, z toho 4 vysoké). |
| S4 | Přibylo HSTS a `X-Robots-Tag: noindex` pro `/t/`, `/kouc` a `/setup`. |
| S5 | Text vnitřní chyby už neputuje ke klientovi; jde do logu, ven jde obecná hláška. Ověřené hlášky zůstávají beze změny. |
| N1 | Rozpracované odpovědi se po úspěšném odeslání mažou z prohlížeče. Při neúspěchu zůstávají kvůli záloze. |

Druhá dávka, tentokrát se změnami, které je vidět v provozu:

| Nález | Co se změnilo |
|---|---|
| V1 | Po pěti neúspěších v patnácti minutách se účet zamkne (15 minut, pak hodina, pak čtyři). Neúspěch se počítá i u neexistujícího e-mailu, jinak by se přes zamykání dalo zjistit, které účty existují; hláška zůstává stejná. Přihlášení se zapisuje do logu. |
| V3 | CSP se nově skládá v `middleware.ts` a nese nonce pro každý požadavek zvlášť: `script-src 'self' 'nonce-…' 'strict-dynamic'` místo `'unsafe-inline' 'unsafe-eval'`. Vyžádalo si to přepnutí stránek na vykreslování při požadavku, protože do předgenerovaného HTML nonce vložit nejde. Platnost relace klesla z 30 dní na 7 a je klouzavá. |
| S1 | Vzorek má místo přesného roku narození pětileté pásmo a místo měsíce čtvrtletí. Přibyl párovací klíč, díky kterému smazání vyplnění smaže i jeho anonymní kopii; u záznamů pořízených dřív to nejde a nepůjde. |
| S2 | Otevření vyhodnocení, export vzorku, smazání, vystavení pozvánky a přihlášení se zapisují do `pristupovyLog`. Master ho vidí v záložce Přístupy. Kvůli tomu jsou `getForCoach` a `normExport` nově mutace: queries v Convexu zapisovat nesmějí. |
| S3 | Pozvánky platí 30 dní. Vypršelý odkaz respondentovi vysvětlí, co se stalo, a v přehledu kouče je označený. |
| N2 | Heslo neprojde, když obsahuje běžné slovo ze seznamu nebo část jména či e-mailu účtu. |
| N4 | Tlačítko „Odhlásit všude" ukončí relace na všech zařízeních. |
| navíc | Retenční úklid: `convex/uklid.ts` a noční cron mažou data za lhůtou (výsledky 3 roky, pozvánky 90 dní, log rok, pokusy 7 dní). |

**Pozor při nasazení V2:** `SETUP_TOKEN` musí být nastavený v Convexu dřív, než
bude potřeba založit master účet. Na existující instalaci se nic nezmění, master
už existuje a zakládání je tak jako tak zavřené.

**Ověření V3:** CSP s nonce se nedá ověřit jen buildem, protože zablokované
skripty se projeví až v prohlížeči. Otestováno headless Chromiem proti
produkčnímu sestavení na úvodní stránce, v sekci kouče i na stránce dotazníku:
všechny se vykreslí, konzole nehlásí jediné porušení CSP.

---

## Co je udělané dobře

Než přijdou nálezy, patří se říct, co obstálo. Není to formalita: několik věcí
je vyřešeno lépe, než bývá v aplikacích téhle velikosti zvykem.

**Hesla.** PBKDF2-SHA256 se 210 000 iteracemi a náhodnou solí pro každý účet,
porovnání přes `timingSafeEqual`. To odpovídá aktuálnímu doporučení OWASP.
Hesla se nikde neukládají ani nelogují v čitelné podobě a reset hesla generuje
nové místo toho, aby se pokoušel obnovit staré.

**Nerozlišování chyb při přihlášení.** Neexistující účet i špatné heslo vracejí
stejnou hlášku, takže přes formulář nejde zjišťovat, které e-maily jsou
zaregistrované.

**Autorizace na serveru, ne v prohlížeči.** Každá funkce, která vrací data,
volá `requireCoach()`. Oddělení větví externích koučů (`filtrViditelnosti`)
se vyhodnocuje na serveru a platí i pro přímý dotaz na uhodnuté ID záznamu.

**Statická kontrola přístupových pravidel.** `scripts/audit-pristupu.cjs` hlídá,
že žádná nová veřejná funkce nezůstane bez stráže, a seznam záměrných výjimek
je vypsaný i s důvodem. Tohle je nadstandard a doporučuju ho udržet.

**Bezpečnostní hlavičky.** CSP, `X-Content-Type-Options`, `X-Frame-Options`,
`Referrer-Policy` a `Permissions-Policy` jsou nastavené v `next.config.js`.

**Oddělení normativního vzorku.** Vzorek pro tvorbu norem je vědomě bez jména,
bez celého data narození a bez odkazu na konkrétní vyplnění, s časem jen
v přesnosti na měsíc. Úvaha za tím je správná (viz ale nález S1).

**Zrušení relací při změně hesla a při vypnutí účtu.** Kdo byl přihlášený na
cizím zařízení, vypadne.

**Žádná tajemství v gitu.** V repozitáři je jen `.env.example`, skutečné
proměnné jsou mimo (viz ale nález V2).

---

## Nálezy

Závažnost hodnotím podle dopadu na data klientů a podle toho, jak snadno se dá
nález zneužít.

### KRITICKÉ

#### K1 – Tokeny pozvánek se generují nekryptografickým generátorem

> **Opraveno.** Viz sekci „Co už je hotové".

`convex/eliteDiagnostic.ts`, funkce `makeToken()`:

```js
out += alphabet[Math.floor(Math.random() * alphabet.length)]
```

**Proč to vadí.** Token v odkazu `/t/<token>` je jediná věc, která chrání
přístup k dotazníku, a přes `getInvite` vrací i jméno klienta. `Math.random()`
není kryptograficky bezpečný generátor: jde o obyčejný PRNG, jehož vnitřní stav
lze z pozorovaných výstupů rekonstruovat. Convex navíc uvnitř transakce
`Math.random()` nahrazuje deterministickým generátorem, aby šly funkce
opakovat, což je pro tvorbu tajemství přesně opačný požadavek, než jaký
potřebujeme.

Zbytek kódu to dělá správně: session tokeny i soli hesel používají
`crypto.randomBytes(32)`. Tohle je jediné místo, kde se na tajemství sáhlo
slabším nástrojem.

**Co může útočník získat.** Jméno klienta a možnost vyplnit test za něj, tedy
podstrčit kouči falešný profil. Kdyby se podařilo předpovědět token dřív, než
ho klient použije, útočník pozvánku spotřebuje a klient dostane hlášku, že odkaz
už byl použit.

**Náprava.** Použít kryptografický zdroj a zvětšit token. Convex runtime
podporuje Web Crypto:

```ts
/** Token do odkazu. Kryptograficky náhodný, bez podobných znaků (0/O, 1/l). */
function makeToken(): string {
  const alphabet = "abcdefghijkmnpqrstuvwxyz23456789"
  const bytes = new Uint8Array(24)
  crypto.getRandomValues(bytes)
  // 24 znaků po 5 bitech = 120 bitů entropie
  return Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("")
}
```

Modulo z 256 na 32 hodnot je beze zbytku, takže nevzniká zkreslení. Staré
tokeny zůstanou platné, změna se týká jen nově vydávaných pozvánek.

---

### VYSOKÉ

#### V1 – Přihlašování nemá žádné omezení počtu pokusů

> **Opraveno.** Viz sekci „Co už je hotové".

`convex/auth.ts`, funkce `login`.

**Proč to vadí.** Convex vystavuje `auth:login` na veřejném API. Nic nebrání
tomu, zkoušet hesla ve smyčce. PBKDF2 s 210 000 iteracemi útok zpomaluje
(řádově jednotky pokusů za sekundu na jádro), ale nezastaví ho: proti slabšímu
heslu nebo proti seznamu hesel uniklých odjinud je to za týden běhu reálné.
Účet kouče přitom vidí na všechny klienty ve své větvi.

**Náprava.** Zavést počítadlo neúspěšných pokusů. Návrh tabulky:

```ts
loginAttempts: defineTable({
  email: v.string(),        // normalizovaný
  failedCount: v.number(),
  firstFailedAt: v.number(),
  lockedUntil: v.optional(v.number()),
}).index("by_email", ["email"]),
```

Pravidlo: po 5 neúspěších v okně 15 minut zamknout účet na 15 minut,
po dalších 5 na hodinu. Úspěšné přihlášení počítadlo nuluje. Zámek se váže na
e-mail, ne na IP, protože IP se dá měnit. Hláška zůstane stejná jako u špatného
hesla, aby zámek neprozrazoval existenci účtu; master ať v přehledu koučů vidí,
že je účet zamčený.

Doporučuju rovnou zaznamenávat i úspěšná přihlášení s časem a hrubým původem,
ať je poznat neobvyklý přístup.

#### V2 – Zakládací token master účtu je natvrdo v kódu

> **Opraveno.** Viz sekci „Co už je hotové".

`convex/auth.ts`:

```ts
const ZAKLADACI_TOKEN = "9nnh1p1l1gup8tz0r10s69li0axdee0b8dxkfha6"
```

**Proč to vadí.** Tajemství uložené ve zdrojovém kódu se dostane každému, kdo
uvidí repozitář, a zůstane v historii gitu navždy. Druhou pojistkou je podmínka
„zatím neexistuje žádný kouč", která dnes drží. Riziko je v okamžiku, kdy tahle
podmínka na chvíli neplatí: nové Convex prostředí, obnova databáze ze zálohy,
testovací deployment. Kdokoli se znalostí tokenu si v tu chvíli založí master
účet, tedy nejvyšší oprávnění v aplikaci.

**Náprava.** Ve dvou krocích:

1. Token přesunout výhradně do proměnné prostředí `SETUP_TOKEN` a zabudovanou
   hodnotu smazat. Když proměnná chybí, zakládání ať se odmítne s jasnou
   hláškou. Aplikace se tím sice bez konfigurace nerozjede, ale to je u funkce,
   která vytváří nejvyšší oprávnění, správné chování.
2. Až bude master založený, funkci `createMaster` zakomentovat nebo smazat
   úplně. Znovu se nasadí jen ve chvíli, kdy bude potřeba (zakládá se jednou za
   život aplikace).

Zároveň považujte stávající hodnotu za kompromitovanou a při přechodu ji
nepoužívejte znovu.

#### V3 – Relace kouče v localStorage v kombinaci s povolujícím CSP

> **Opraveno.** Viz sekci „Co už je hotové".

`app/kouc/page.tsx` ukládá `sessionToken` do `localStorage`. CSP v
`next.config.js` má `script-src 'self' 'unsafe-inline' 'unsafe-eval'`.

**Proč to vadí.** `localStorage` je čitelný z libovolného skriptu na stránce.
Jediná XSS zranitelnost tak nevede k drobnému problému, ale rovnou k odcizení
relace kouče a s ní ke všem klientským profilům v jeho větvi. `'unsafe-inline'`
a `'unsafe-eval'` v CSP přitom zahazují největší část ochrany, kterou CSP
proti XSS dává.

**Náprava** (podle náročnosti, dá se dělat postupně):

1. **Utáhnout CSP.** Next.js umí nonce: middleware vygeneruje náhodný nonce pro
   každý požadavek, CSP pak zní `script-src 'self' 'nonce-<hodnota>'
   'strict-dynamic'`. Tím `'unsafe-inline'` odpadá. `'unsafe-eval'` v produkčním
   buildu Next už zpravidla není potřeba, doporučuju ho zkusit odebrat
   a otestovat.
2. **Zkrátit životnost relace** z 30 dní na 8 hodin nečinnosti s prodloužením
   při aktivitě. Ukradený token pak má krátkou použitelnost.
3. **Cílový stav: relace v cookie** s příznaky `HttpOnly`, `Secure`,
   `SameSite=Strict`. Skript ji nepřečte. U Convexu to znamená volat citlivé
   funkce přes vlastní HTTP endpoint (`convex/http.ts`), který cookie čte
   serverově; je to větší zásah, ale u zdravotních dat stojí za zvážení.

#### V4 – Vstupy od respondenta nemají omezenou délku

> **Opraveno.** Viz sekci „Co už je hotové".

`convex/eliteDiagnostic.ts`, `personValidator` a `submitWithInvite`: `name`,
`role`, `answers` i `note` jsou `v.string()` bez horní hranice.

**Proč to vadí.** Kdokoli s platnou pozvánkou (a při K1 potenciálně i bez ní)
může poslat jméno o délce stovek kilobajtů nebo `answers` jako obří řetězec.
Hodnoty odpovědí se sice validují, ale samotný řetězec se ukládá celý,
a to i do normativního vzorku. Následkem je růst databáze, náklady a zhoršená
odezva; opakováním se z toho stane laciné odstavení služby.

**Náprava.** Přidat kontroly hned na začátku `submitWithInvite`:

```ts
const MAX_JMENO = 120
const MAX_ROLE = 200
const MAX_ODPOVEDI = 8_000   // 96-200 položek jako JSON se vejde s rezervou

if (args.person.name.length > MAX_JMENO) throw new ConvexError("Jméno je příliš dlouhé.")
if ((args.person.role?.length ?? 0) > MAX_ROLE) throw new ConvexError("Role je příliš dlouhá.")
if (args.answers.length > MAX_ODPOVEDI) throw new ConvexError("Odpovědi jsou příliš dlouhé.")
```

Stejné omezení patří na `clientName` a `note` v `createInvite` a na `name`,
`email`, `phone` a `note` v účtech koučů. Zároveň doporučuju ukládat do
`answers` až přeparsovaná a znovu serializovaná data, ne původní řetězec od
klienta, ať se do databáze nedostane nic navíc.

#### V5 – Zranitelné závislosti v produkčním sestavení

> **Opraveno.** Viz sekci „Co už je hotové".

`npm audit --omit=dev` hlásí 5 zranitelností (4 vysoké, 1 střední):

- `sharp < 0.35.0`: zděděné zranitelnosti libvips (CVE-2026-33327, -33328,
  -35590, -35591), vysoká závažnost.
- `postcss` uvnitř `next`: path traversal přes `sourceMappingURL`.

**Náprava.** Spustit `npm audit fix`, ověřit `npm run build`, a hlavně zavést
pravidelnou kontrolu: povolit Dependabot na GitHubu, nebo přidat `npm audit`
do `npm run audit`, aby se na to nezapomínalo.

---

### STŘEDNÍ

#### S1 – Normativní vzorek není plně anonymní a nejde smazat

> **Opraveno.** Viz sekci „Co už je hotové".

`normSamples` obsahuje rok narození, rod, povolání či disciplínu a úroveň,
kompletní odpovědi a měsíc pořízení.

**Proč to vadí.** Kombinace „rok narození + disciplína a úroveň + měsíc" je
u malého vzorku kvazi-identifikátor. U textu jako „hokej, extraliga, brankář,
1997" je počet lidí, na které sedí, velmi malý. To znamená, že vzorek není
anonymní ve smyslu GDPR (bod odůvodnění 26), ale pouze pseudonymizovaný,
a vztahují se na něj práva subjektu údajů. Přitom `removeForCoach` maže jen
`eliteDiagnosticResults`; záznam v `normSamples` po výmazu zůstane a nedá se
dohledat, protože vazba na vyplnění vědomě neexistuje.

Ta chybějící vazba je jinak správné rozhodnutí, ale má právě tenhle vedlejší
účinek: nelze vyhovět žádosti o výmaz.

**Náprava**, jedna z těchto cest:

1. **Zhrubit údaje** tak, aby vzorek byl skutečně anonymní: místo roku narození
   věkové pásmo po pěti letech, místo volného textu role vybraná kategorie ze
   seznamu, místo měsíce čtvrtletí. Pak jde argumentovat anonymitou a právo na
   výmaz se neuplatní.
2. **Ponechat vazbu, ale šifrovanou**: uložit do `normSamples` neveřejný
   identifikátor odvozený z ID vyplnění, který umožní výmaz, ale sám o sobě
   nic neprozradí.
3. **Získat samostatný souhlas** se zařazením do výzkumného vzorku, s možností
   ho odvolat, a evidovat ho.

Doporučuju variantu 1 doplněnou o 3: je nejčistší a nejméně omezuje analýzu.

#### S2 – Chybí záznam o přístupu k výsledkům

> **Opraveno.** Viz sekci „Co už je hotové".

Nikde se neeviduje, který kouč kdy otevřel který profil nebo exportoval vzorek.

**Proč to vadí.** U zvláštní kategorie údajů je záznam o přístupu základní
detekční opatření. Bez něj se nedá zjistit, co se stalo, ani prokázat, že se
nestalo nic. Při podezření na zneužití nebo při kontrole nemáte čím doložit
rozsah.

**Náprava.** Lehká tabulka bez osobních údajů v hodnotách:

```ts
pristupovyLog: defineTable({
  coachId: v.id("coaches"),
  akce: v.union(
    v.literal("otevreni-vysledku"),
    v.literal("export-vzorku"),
    v.literal("smazani-vysledku"),
    v.literal("vytvoreni-pozvanky"),
  ),
  resultId: v.optional(v.id("eliteDiagnosticResults")),
  at: v.number(),
}).index("by_coach", ["coachId"]).index("by_at", ["at"]),
```

Zapisovat v `getForCoach`, `normExport` a `removeForCoach`. Log ať vidí jen
master a ať se po roce automaticky maže.

#### S3 – Pozvánky nemají platnost

> **Opraveno.** Viz sekci „Co už je hotové".

`invitations` má `createdAt` a `usedAt`, ale ne expiraci. Nepoužitý odkaz platí
navždy.

**Proč to vadí.** Odkaz putuje e-mailem, WhatsAppem, přes SMS. Zůstává
v historii schránek a v prohlížečích. Pozvánka, kterou kouč vystavil před dvěma
lety a klient ji nepoužil, je pořád funkční vstup do systému.

**Náprava.** Přidat `expiresAt` (výchozí 30 dní), kontrolovat ho v `getInvite`
i v `submitWithInvite` a v přehledu kouče prošlé pozvánky odlišit. Ať jde
platnost při vystavení nastavit, kdyby bylo potřeba delší okno.

#### S4 – Chybí HSTS

> **Opraveno.** Viz sekci „Co už je hotové".

`next.config.js` nastavuje pět hlaviček, ale ne `Strict-Transport-Security`.

**Náprava.** Přidat:

```js
{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" }
```

Doporučuju také `X-Robots-Tag: noindex, nofollow` pro cesty `/t/` a `/kouc`,
aby se odkazy nedostaly do vyhledávačů.

#### S5 – Text vnitřních chyb se posílá klientovi

> **Opraveno.** Viz sekci „Co už je hotové".

`convex/auth.ts`, obal `sConvexChybou` převádí libovolnou chybu na `ConvexError`
s jejím původním textem.

**Proč to vadí.** Vzniklo to kvůli ladění zakládání účtu a je to pochopitelné,
ale ven se tak mohou dostat detaily o vnitřním chodu (názvy funkcí, stav
databáze). Útočníkovi to usnadňuje mapování.

**Náprava.** Klientovi vracet obecnou hlášku s identifikátorem chyby, podrobnost
psát do `console.error`, kde ji uvidíte v Convex Logs. Ověřené hlášky
(`ConvexError` vyhozené vaším kódem) posílat beze změny.

#### S6 – Všichni interní kouči vidí na všechny klienty

`filtrViditelnosti` odděluje jen externí kouče. Master a všichni interní kouči
sdílejí kompletní přehled.

**Proč to vadí.** U zvláštní kategorie údajů platí zásada minimalizace: přístup
má mít ten, kdo ho potřebuje. Dnešní nastavení je vědomé rozhodnutí a při dvou
lidech v týmu dává smysl. S rostoucím počtem koučů roste i plocha pro únik:
kompromitace kteréhokoli účtu odkryje celou databázi.

**Náprava.** Až budou interní kouči víc než dva, doporučuju přepnout na
„vidím svoje, master vidí vše" a sdílení řešit výslovným přiřazením klienta.
Zatím stačí vědět, že to tak je, a mít to pokryté smluvně.

---

### NÍZKÉ

- **N1 – Rozpracované odpovědi zůstávají v prohlížeči.** *(Opraveno.)* `lib/diagnostic/storage.ts`
  ukládá průběžné vyplnění do `localStorage` a po odeslání ho nemaže. Na
  sdíleném počítači si je přečte další uživatel. Náprava: po úspěšném odeslání
  záznam smazat.
- **N2 – Slabá hesla.** *(Opraveno.)* Podmínkou je 10 znaků. `Heslo12345` projde. Náprava:
  odmítat hesla ze seznamu nejčastějších a hesla obsahující jméno nebo e-mail
  účtu.
- **N3 – Bez druhého faktoru.** U master účtu, který zakládá kouče a vidí vše,
  by TOTP dával smysl. *(Naprogramováno v `ee6b410` a na tvoje rozhodnutí zase
  odstraněno; zatím se používat nebude. Kdyby se to mělo vrátit, stačí ten
  commit vrátit zpátky, kód i test zůstávají v historii.)*
- **N4 – Bez omezení počtu souběžných relací.** *(Opraveno tlačítkem „Odhlásit všude".)* Kouč nevidí, kde všude je
  přihlášený, a nemůže vzdáleně odhlásit ostatní zařízení.
- **N5 – Nezvaný přístup ke jménu klienta.** `getInvite` je veřejná a vrací
  `clientName`. Po nápravě K1 je uhodnutí tokenu prakticky vyloučené; přesto
  doporučuju jméno nevracet, pokud není nutné, a předvyplnit ho až po zahájení.

---

## GDPR a organizační opatření

Technická opatření jsou jen polovina. U zvláštní kategorie údajů se rovnocenně
posuzuje i to, co je sepsané.

**Co doporučuju mít hotové:**

1. **Souhlas se zpracováním** ve výslovné podobě, odděleně pro (a) samotnou
   diagnostiku a (b) zařazení do anonymního výzkumného vzorku. Klient musí
   vědět, že výsledky uvidí kouč a že jeho odpovědi mohou sloužit k tvorbě
   norem. Souhlas evidovat s časem.
2. **Záznamy o činnostech zpracování** podle čl. 30. U zvláštní kategorie je
   povinný bez ohledu na velikost firmy.
3. **Posouzení vlivu (DPIA)** podle čl. 35. Rozsáhlé zpracování údajů
   o duševním zdraví je typický případ, kdy je DPIA vyžadována.
4. **Smlouvy o zpracování** s Convex a Vercel a ošetření předání do USA
   (standardní smluvní doložky). Obě služby DPA nabízejí; je potřeba je
   uzavřít, ne jen používat.
5. **Retenční lhůty.** Dnes se nemaže nic. Doporučuju stanovit dobu uchování
   (například 3 roky od vyplnění) a mazání automatizovat plánovanou funkcí.
6. **Postup při porušení zabezpečení**: kdo co udělá, do 72 hodin hlášení ÚOOÚ,
   kdy se informují klienti. Napsané dopředu, ne až v krizi.
7. **Poučení koučů**: výsledky se nestahují do soukromých zařízení bez
   zabezpečení, PDF se neposílají nešifrovaně, přístup se neposkytuje dál.

---

## Doporučené pořadí prací

| Pořadí | Nález | Práce | Stav |
|---|---|---|---|
| 1 | K1 tokeny pozvánek | asi hodina | hotovo |
| 2 | V5 závislosti | asi hodina | hotovo |
| 3 | V4 limity vstupů | asi 2 hodiny | hotovo |
| 4 | V2 zakládací token | asi hodina | hotovo |
| 5 | S4 HSTS a noindex | pár minut | hotovo |
| 6 | S5 chybové hlášky, N1 úklid prohlížeče | pár minut | hotovo |
| 7 | V1 omezení pokusů o přihlášení | asi půl dne | hotovo |
| 8 | S3 platnost pozvánek | asi 2 hodiny | hotovo |
| 9 | V3 CSP s nonce, kratší relace | asi den | hotovo |
| 10 | S2 záznam přístupů | asi půl dne | hotovo |
| 11 | S1 anonymita vzorku | asi den | hotovo |
| 12 | N2 slabá hesla, N4 odhlášení všude | pár hodin | hotovo |
| 13 | retenční úklid dat | asi 3 hodiny | hotovo |
| 14 | GDPR dokumenty | mimo vývoj | podklad v `docs/gdpr-podklady.md` |
| 15 | N3 druhý faktor | asi den | odloženo rozhodnutím |
| 16 | N5 jméno klienta ve veřejné pozvánce | pár minut | ponecháno vědomě |

Z technických nálezů zbývá jediný: **N3, druhý faktor u master účtu.** Nedělal
jsem ho vědomě. Zásah do přihlašování se nedá ověřit odsud, protože k tomu je
potřeba běžící Convex a skutečná aplikace v telefonu, a chyba v něm znamená
ztrátu přístupu k účtu, který jako jediný spravuje ostatní. Stojí za to ho
udělat, ale s tebou u toho a s vyzkoušenými záložními kódy.

**N5 zůstává vědomě.** `getInvite` vrací jméno klienta, aby se respondentovi
předvyplnilo. Po opravě K1 je token neuhodnutelný, takže jediný, kdo jméno
uvidí, je ten, komu odkaz patří. Zrušit předvyplnění by zhoršilo použití
a bezpečnosti by to prakticky nepřidalo.

## Doplněk: srpen 2026

Kontrola oprávnění a toho, co si respondent stáhne spolu s dotazníkem.

**Klíče v prohlížeči respondenta.** Stránka s dotazníkem si kvůli importu
jediné funkce tahala `structure.ts`, tedy čísla kontrolních položek pozornosti,
neobvyklé položky, dvojice na konzistenci s prahy, obrácené položky a hranice
pásem. Stačilo otevřít zdroj stránky. Kdo tyhle údaje zná, projde kontrolami
platnosti podle libosti, takže mechanismus na odhalení nepoctivého vyplnění byl
čitelný právě pro toho, koho má odhalit. Stejnou cestou se vezl celý výklad
ELITE a všech devět dotazníků najednou. Opraveno rozdělením souborů podle toho,
co která strana potřebuje; hlídá to `scripts/audit-balicku.cjs`.

**Normativní vzorek.** `normStats` a `normExport` odmítaly jen externího kouče,
takže náš vlastní kouč viděl velikost vzorku a mohl si ho celý stáhnout. Nově
vyžadují mastera.

**Viditelnost klientů.** Náš kouč dřív viděl klienty všech ostatních našich
koučů. Nově vidí výhradně ty, které si sám pozval; celou naši větev vidí jen
master. Do větví externích koučů nevidí nikdo od nás, to zůstává.

**Ověřeno bez nálezu:** cizí záznam přes uhodnuté ID (všechny koncové body si
dotáhnou dokument a teprve pak ověří větev), vlastník pozvánky se bere z relace
a nedá se podvrhnout, výmaz vyplnění bere s sebou i anonymní kopii ve vzorku,
zakládat kouče smí pouze master a druhý master tudy vzniknout nemůže.

## Doplněk: týmová větev (Team / Club)

Týmová větev je jediné místo v aplikaci, kde vyhodnocení vidí i vyplňující.
Kvůli tomu má vlastní pravidla a stojí za to je sepsat celé, protože slib
daný hráči je tady součástí produktu, ne jen formulace v souhlasu.

**Jak to funguje.** Tým zakládá master a přiřadí ho konkrétnímu externímu
účtu, nebo sám sobě; `createTeam` vyžaduje mastera a odmítne přiřadit tým
našemu internímu kouči i cizímu masterovi. Klubový kouč, tedy externí účet
bez plného přístupu, pak v rámci
svého týmu vystavuje odkazy pod štítky, které si volí sám. Může to být jméno,
může to být Player 1. Obecnou pozvánku na jiný test vystavit nemůže,
`createInvite` ho odmítne podle `jeKlubovy()`. Hráč vyplní Players Survey
a na konci si vybere, jestli chce své vyhodnocení sdílet s koučem. Ať vybere
cokoli, jeho odpovědi anonymně vstoupí do týmového profilu i do normativního
vzorku.

**Co kdo vidí.**

| | vyplnění hráče | týmový profil | ostatní týmy |
|---|---|---|---|
| hráč | své, vždy | ne | ne |
| klubový kouč | jen sdílená, svého týmu | ano, svého týmu | ne |
| náš interní kouč | ne | ne | ne |
| master u cizího týmu | ne | ano | ano |
| master u týmu, který vede sám | jen sdílená | ano | ano |

U týmu, který vede někdo jiný, tedy master vidí, že tým existuje, jak se
jmenuje a jaký má profil, a nevidí jediné konkrétní vyplnění. Do větví
externích koučů nevidí nikdo od nás; to platí i tady a nebylo to změkčeno.

**Master jako kouč vlastního týmu.** Některé týmy vedeme my, ne klub, a pak
by bylo nesmyslné, aby si na ně vlastník aplikace musel zakládat druhý účet.
Master proto smí u týmu dosadit sám sebe. Tím se nemění pravidlo, jen role:
k vyhodnocením se dostane jako kouč toho týmu, ne jako master, a platí na něj
všechno, co na kouče. Odmítnuté sdílení platí i proti němu a do cizích týmů
nevidí dál. Souhlas hráče na to sedí bez úprav, protože slibuje sdílení
s koučem jeho týmu, a tím je v tu chvíli on. Cizího mastera dosadit nejde,
jen sebe; jinak by se dala práva rozdávat mimo vědomí dotčeného účtu.

**Hotová diagnostika dopočítaná do týmu.** Hráči někdy vyplnili dřív, jako
naši klienti, a tým vzniká až potom. Posílat jim dotazník znovu je nesmysl,
takže `addExistingToTeam` hotové vyplnění do souhrnu dopočítá. Smí to jen
master, jen s vyplněními ze své větve (kontroluje `filtrViditelnosti`) a jen
s elite200; kratší verze nemá jednadvacet částí a profil by tiše zkreslila.
Vyplnění, které už patří jinému týmu, se nepřebírá – rozpadl by se profil,
který už někdo četl.

Co se tím **neotevře**, je podstatnější než co se otevře. Klient souhlasil
s prací s námi, ne s cizím klubem, takže se klubový kouč k jeho vyhodnocení
dostat nesmí. Není to řešené zvláštní podmínkou, ale stavbou: soupiska se
v `listPlayers` skládá z pozvánek a dopočítané vyplnění žádnou nemá, takže se
na ni nedostane. `listForCoach` a `getForCoach` ho klubovému kouči nevrátí
taky, protože vlastníkem zůstává náš kouč – vlastník se při dopočítání
záměrně nepřepisuje. Mění se jediné pole, `teamId`. Volba sdílení se nesahá
také záměrně: dosadit ji by znamenalo tvrdit za klienta něco, co neřekl.

**Výměna kouče u založeného týmu** (`setTeamCoach`) jde jen do prvního
odevzdaného dotazníku. Potom už za sdílením stojí souhlas, který hráč dal
konkrétnímu kouči, a vyměnit ho pod rukou by z toho souhlasu udělalo prázdné
slovo. Do té doby je to prostá oprava překlepu ze zakládání, protože není co
ukázat. Při výměně se přepíše vlastník i u rozeslaných odkazů: nese se do
odevzdaného vyplnění, takže bez toho by starý kouč viděl do týmu, který už
nevede, a nový by výsledky naopak neotevřel.

**Kde je slib doopravdy zaručený.** Nesdílené vyplnění se odfiltruje
v `sdileno()` v `convex/eliteDiagnostic.ts` a filtr je ve všech třech
koncových bodech, kterými se kouč k vyplněním dostane, tedy `listForCoach`,
`getForCoach` i `removeForCoach`. Vlastník pozvánky na tom nic nemění: ani
kouč, který odkaz vytvořil, nesdílené vyplnění neuvidí.

**Kde slib zaručený není a proč to říkáme nahlas.** Kouč na soupisce vidí
u každého štítku, jestli hráč sdílení povolil; `listPlayers` to vrací jako
`sdileno`. Není to únik, je to důsledek toho, že odkazy rozesílá on a mapování
štítek na člověka drží on. Skrývat to by nepomohlo: kdo nic nesdílel, byl by
poznat stejně, jen by o tom nevěděl. Text souhlasu proto slibuje přesně to, co
platí, a nic navíc: „Kouč uvidí, že jsi dotazník vyplnil, ale neuvidí tvoje
odpovědi ani vyhodnocení. Tvoje odpovědi se anonymně započítají do profilu
celého týmu tak jako tak.“ Hráč se tedy rozhoduje se znalostí věci.

**Malý tým.** Pod pěti odevzdanými dotazníky se profil blíží profilu
jednotlivce a dá se z něj usuzovat na konkrétní hráče. Report to hlásí
nahlas a říká, jak s tím zacházet. Není to technické opatření, je to jediné
poctivé řešení, protože skrýt profil úplně by službu znehodnotilo.

**Co se cestou opravilo.** Do týmového profilu vstupovalo i vyplnění, které
neprošlo kontrolou spolehlivosti. Takové skóre neměří to, co měřit mělo, ale
do průměru i do rozptylu mluvilo stejnou vahou jako poctivé vyplnění a umělo
vyrobit zlomovou linii, která v týmu není. Vyřazuje se v `tymovyProfil`,
takže pravidlo platí pro každého, kdo profil počítá, a rozdíl mezi
odevzdanými a započtenými report pojmenuje.

**Ověřeno bez nálezu:** cizí tým přes uhodnuté ID (`teamReport` si dotáhne
tým a teprve pak ověří vlastnictví, `createPlayerInvite` a `listPlayers`
stejně), klubový kouč nevystaví pozvánku mimo Players Survey ani mimo svůj
tým, `createTeam`, `setTeamCoach`, `setTeamActive`, `listTeams`,
`listPridatelne`, `listDopocitane`, `addExistingToTeam` a `removeFromTeam`
smí jen master, a zápis do
`normSamples` v `submitWithInvite` předchází větvení podle `teamId`, takže
odhlášení ze sdílení normativní vzorek neochudí.

## Závěr

Aplikace je na svoji velikost postavená nadprůměrně obezřetně: autorizace je
konzistentně na serveru, hesla jsou uložená správně, oddělení větví koučů drží
i proti přímému dotazu a existuje statická kontrola, která hlídá nové funkce.

Kritická je jediná věc, generování tokenů pozvánek nekryptografickým
generátorem. Zbytek nálezů jsou buď chybějící vrstvy obrany (omezení pokusů
o přihlášení, limity vstupů, tvrdší CSP), nebo body, které vyplývají z toho, že
aplikace pracuje se zvláštní kategorií údajů a laťka je tam výš než jinde.
