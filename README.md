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

## Nastavení Convexu

Bez Convexu se dotazník nemá kam odeslat a aplikace na to upozorní.

```bash
npx convex login
npx convex dev        # založí projekt, zapíše .env.local; pak Ctrl+C
```

V dashboardu Convexu → **Settings → Environment Variables** přidej:

| Proměnná | Význam |
| --- | --- |
| `SETUP_TOKEN` | jednorázový token pro založení master účtu (nastav v dev i production) |

## Účty koučů

Aplikace nemá sdílené heslo — každý kouč má vlastní účet.

**Master účet** se zakládá jednou přes odkaz `/setup/<SETUP_TOKEN>`. Ten projde
pouze tehdy, když sedí token **a zároveň zatím neexistuje žádný kouč**. Jakmile
master vznikne, odkaz je nadobro mrtvý — druhý účet už tudy založit nejde.

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
