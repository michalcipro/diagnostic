# Performance Diagnostic ELITE™ — samostatná aplikace

Online administrace a automatické vyhodnocení mentální výkonové diagnostiky
Winning Minds. Zcela nezávislá Next.js aplikace s vlastním Convex backendem —
nesdílí kód ani data s koučovací platformou.

- **4 testy:** ELITE 200 a ELITE 100, varianta **Sport** a **Business & Life**
- **Dvojjazyčně:** čeština / angličtina, přepínatelné i na hotovém vyhodnocení
- **Skórování dle klíčů:** kontrola validity (pozornost, infrekvence, konzistence,
  upřímnost, odpověďový styl), rekódování obrácených položek, fazety/dimenze,
  pásma, opěrné body a rozvojové priority
- **Výsledky anonymní**, sdílené neuhodnutelným odkazem (`/<test>/report?r=…`)
- **Design:** Apple HIG, světlý i tmavý režim, export do PDF / tisk

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS · Convex

## Struktura

```
app/                     # / (výběr), /[testId] (dotazník), /[testId]/report
components/diagnostic/   # sdílené UI (přepínač jazyka, grafy skóre)
lib/diagnostic/          # logika: structure, scoring, i18n, items, content, remote
convex/                  # izolovaný backend: schema + eliteDiagnostic (submit/getByPublicId)
```

Diagnostika funguje i **bez** Convexu (běží lokálně přes `localStorage`).
Convex přidává trvalé uložení a sdílecí odkazy — aktivuje se, jakmile je
nastaveno `NEXT_PUBLIC_CONVEX_URL`.

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
