# Performance Diagnostic ELITE™ — samostatná aplikace

Online administrace a automatické vyhodnocení mentální výkonové diagnostiky
Winning Minds. Zcela nezávislá Next.js aplikace s vlastním Convex backendem —
nesdílí kód ani data s koučovací platformou.

- **4 testy:** ELITE 200 a ELITE 100, varianta **Sport** a **Business & Life**
- **Dvojjazyčně:** čeština / angličtina, přepínatelné i na hotovém vyhodnocení
- **Skórování dle klíčů:** kontrola validity (pozornost, infrekvence, konzistence,
  upřímnost, odpověďový styl), rekódování obrácených položek, fazety/dimenze,
  pásma, opěrné body a rozvojové priority
- **Výsledky vidí pouze kouč** v chráněné sekci `/kouc`; respondent po odeslání
  dostane jen potvrzení, vyhodnocení s ním kouč prochází osobně
- **Design:** Apple HIG, světlý i tmavý režim, export do PDF / tisk

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS · Convex

## Struktura

```
app/                     # / (info), /t/[token] (dotazník na pozvánku),
                         # /kouc (chráněná sekce), /setup/[token] (založení master účtu)
components/diagnostic/   # sdílené UI (přepínač jazyka, grafy skóre, ReportView)
lib/diagnostic/          # logika: structure, scoring, i18n, items, content, remote
convex/                  # backend: schema + eliteDiagnostic (submit, listForCoach, getForCoach)
```

## Kdo co vidí

| Role | Přístup |
| --- | --- |
| Respondent | vyplní dotazník na přímém odkazu, po odeslání vidí **pouze potvrzení** |
| Kouč | `/kouc` — po přihlášení seznam vyplnění, kompletní vyhodnocení, tisk do PDF, tvorba pozvánek |
| Master | navíc správa účtů koučů |

Odpovědi ani vyhodnocení se z backendu nikdy nevrací bez platné přihlášené relace,
která se ověřuje **serverově** v Convexu. Kontrola jen v prohlížeči by nestačila —
data by šla stáhnout přímo přes veřejné API.

## Kontrola validity — jak funguje a co ještě neumí

Indexy jsou rozdělené na **tvrdé** a **měkké**. Tvrdé (pozornost, infrekvence,
konzistence, tempo vyplňování) odpovídají na otázku, jestli odpovědi vůbec měří
to, co měly — ty určují celkový verdikt. Měkké (upřímnost, odpověďový styl)
popisují, *jak* o sobě respondent vypovídá; samy o sobě vyhodnocení neruší
a mohou verdikt zvednout nejvýš na „opatrně".

Prahy jsou zkalibrované simulací, ne odhadem. Návrhový bod je šum na úrovni
položky σ = 0,8 (korelace mezi dvěma položkami měřícími totéž ≈ 0,52), což je
vůči skutečnosti konzervativní — párové položky jsou parafráze a korelují výš.

| Respondent | Nějaký příznak | Označen jako neplatný |
| --- | --- | --- |
| Poctivý, přesný | 8,5 % | 0,2 % |
| Poctivý, šumivý | 12,6 % | 0,3 % |
| Z poloviny nedbalý | 82,3 % | 26,0 % |
| Zcela náhodný | 100 % | 98,3 % |

**Chybějící odpovědi.** Nezodpovězená položka se nepočítá jako nula — skóre se
dopočte z průměru zodpovězených. Škála, kde chybí víc než čtvrtina odpovědí, se
nevykazuje vůbec a nezobrazí se u ní ani pásmo, ani jeho výklad. Pár konzistence
s chybějící odpovědí se do průměru nepočítá.

### Anonymní vzorek pro normy

Z každého odeslaného dotazníku se ukládá anonymní kopie do samostatné tabulky
`normSamples`. Slouží k výpočtu percentilů, reliability a faktorové struktury —
tedy přesně k tomu, co instrumentu zatím chybí.

| Ve vzorku je | Ve vzorku NENÍ |
| --- | --- |
| odpovědi, doba vyplňování | jméno |
| rok narození | celé datum narození |
| povolání / disciplína (max 120 znaků) | odkaz na konkrétní vyplnění |
| test, varianta, jazyk | přesný čas pořízení (jen měsíc) |

Chybějící `resultId` a přesný čas jsou záměr, ne opomenutí: s kterýmkoli z nich
by šel záznam spárovat zpět s konkrétním člověkem a anonymizace by byla jen
naoko. Že záznam nemůže obsahovat nic navíc, hlídá typová kontrola — vkládaný
objekt se kontroluje proti schématu tabulky, takže přidané pole neprojde buildem.

Stav vzorku a jeho export najdeš v `/kouc` → záložka **Normy**. Respondent je
o ukládání informován na úvodní obrazovce dotazníku.

**Zbytkové riziko:** pole „povolání / disciplína" je volný text. Když do něj
někdo napíše „brankář FC X, U19", je to ve spojení s rokem narození potenciálně
identifikující. Pokud by měl vzorek opustit tvůj okruh, stojí za to text nejdřív
převést na hrubší kategorie.

### Co instrument zatím nemá

Tohle není výčet chyb, ale hranic, uvnitř kterých se výsledky smí vykládat:

- **Žádné normy.** Pásma jsou absolutní hranice, ne percentily. Pořadí škál je
  proto ipsativní — říká, se kterými výroky respondent souhlasil nejvíc, ne v čem
  je nadprůměrný. Report to u pořadí explicitně přiznává.
- **Žádná doložená reliabilita** (α/ω) ani ověřená faktorová struktura. Model
  7 dimenzí × 3 fazety je teoretický předpoklad.
- **Pásmo „priorita" je prakticky nedosažitelné** — i respondent odpovídající
  vesměs neutrálně (průměr 3,0) do něj spadne v 1 % případů. Hranice pocházejí
  z původního klíče a záměrně se neměnily; překalibrovat je má smysl až na datech.
- **Rovnocennost forem** (Sport vs. Business, CZ vs. EN) není doložená měřicí
  invariancí.
- **Prahy pro retest** (±4 fazeta, ±8 dimenze) nejsou odvozené z chyby měření.

Pro koučovací práci, kde výsledek procházíš s klientem osobně, je to obhajitelné.
Pro rozhodnutí o výběru do týmu nebo o kariéře ne.

## Nastavení Convexu

Bez Convexu se dotazník nemá kam odeslat a aplikace na to upozorní.

```bash
npx convex login
npx convex dev        # založí projekt, zapíše .env.local; pak Ctrl+C
```

Žádné další proměnné nastavovat nemusíš — aplikace se rozjede rovnou.
Nepovinně jde v dashboardu Convexu → **Settings → Environment Variables** přidat:

| Proměnná | Význam |
| --- | --- |
| `SETUP_TOKEN` | vlastní zakládací token navíc; přijímá se vedle toho zabudovaného v `convex/auth.ts` |

## Účty koučů

Aplikace nemá sdílené heslo — každý kouč má vlastní účet.

**Master účet** se zakládá jednou přes odkaz `/setup/<token>`, kde token je
konstanta `ZAKLADACI_TOKEN` v `convex/auth.ts`. Odkaz projde pouze tehdy, když
sedí token **a zároveň zatím neexistuje žádný kouč**. Jakmile master vznikne,
odkaz je nadobro mrtvý — druhý účet už tudy založit nejde.

Že je token v repozitáři, nevadí: jeho jediná pravomoc je založit vůbec první
účet, a ta zaniká v okamžiku, kdy účet vznikne. Kdo chce hodnotu držet mimo kód,
nastaví `SETUP_TOKEN` a použije ten.

Další kouče může přidat **výhradně master** v přehledu → záložka **Kouči**.
Master může jejich přístup kdykoli zablokovat a obnovit; sám sebe zablokovat nemůže.

Hesla se ukládají hashovaná (PBKDF2-SHA256, 210 000 iterací, unikátní sůl) —
z databáze je nelze zpětně přečíst. Přihlášení vytvoří relaci s platností 30 dní;
změna hesla všechny existující relace ukončí.

**Ztráta hesla:** v dashboardu Convexu smaž záznam v tabulce `coaches`. Tím se
zakládací odkaz znovu aktivuje a master účet založíš nanovo.

Na Vercelu nastav proměnnou `CONVEX_DEPLOY_KEY` (produkční deploy key z Convexu)
a build command na `npx convex deploy --cmd 'npm run build'` — ten při každém
nasazení nahraje Convex funkce a sám doplní `NEXT_PUBLIC_CONVEX_URL`.

## Odkazy pro klienty

Produkční doména: **elitediagnostic.cz**

Klientovi se posílá přímý odkaz na jeden konkrétní test. Otevře se rovnou
dotazník — bez nabídky ostatních diagnostik a bez cesty zpět do menu.

| Odkaz | Co klient dostane |
| --- | --- |
| `elitediagnostic.cz/elite200-sport` | ELITE 200 Sport, česky |
| `elitediagnostic.cz/elite200-sport?lang=en` | ELITE 200 Sport, anglicky |
| `elitediagnostic.cz/elite100-sport` | ELITE 100 Sport |
| `elitediagnostic.cz/elite200-business` | ELITE 200 Business a Life |
| `elitediagnostic.cz/elite100-business` | ELITE 100 Business a Life |

Parametr `?lang=cs` / `?lang=en` nastaví jazyk dotazníku i vyhodnocení.
Odkaz lze zkopírovat tlačítkem **Kopírovat odkaz** na úvodní stránce
(kořen domény), kde je i přehled všech testů pro kouče.

## Lokální vývoj

```bash
npm install
npx convex dev      # 1. terminál: přihlásí, vytvoří dev projekt, zapíše .env.local
npm run dev         # 2. terminál: http://localhost:3000
```

## Nasazení na Vercel — přesný postup

Viz kroky níže / v odpovědi. Ve zkratce:

1. `cd elite-diagnostic && npx convex login && npx convex deploy`
   → vypíše produkční `NEXT_PUBLIC_CONVEX_URL`.
2. Na Vercelu **Add New → Project**, Root Directory = `elite-diagnostic`.
3. Env proměnná `NEXT_PUBLIC_CONVEX_URL` = hodnota z kroku 1 (Production).
4. **Deploy**. Volitelně napojit vlastní doménu (např. `diagnostika.winningminds.cz`).
