# Podklady ke GDPR

Doprovodný dokument k `docs/bezpecnostni-audit.md`. Shrnuje, co aplikace
zpracovává, co už je ošetřené technicky a co je potřeba doplnit papírově.

**Tohle není právní stanovisko.** Je to inventura připravená vývojářem: co se
kde ukládá, jak dlouho a komu se to posílá. Než z toho vzniknou dokumenty
s razítkem, projděte je s někým, kdo dělá ochranu osobních údajů. Zvláštní
kategorie údajů se v Česku kontroluje přísně a chyba v papírech je stejně
drahá jako chyba v kódu.

## Proč je režim přísnější

Výsledky diagnostiky vypovídají o duševním rozpoložení: emocionálně-destruktivní
vzorce, výkonové bloky, stín archetypu. To spadá pod čl. 9 GDPR, tedy zvláštní
kategorii osobních údajů (údaje o zdraví). Z toho plyne, že:

- nestačí oprávněný zájem ani smlouva, potřebujete **výslovný souhlas**
  (čl. 9 odst. 2 písm. a),
- **záznamy o činnostech zpracování** jsou povinné bez ohledu na velikost
  firmy (čl. 30 odst. 5 výjimku pro zvláštní kategorii ruší),
- **posouzení vlivu (DPIA)** je u rozsáhlého zpracování těchto údajů
  předpokládané (čl. 35 odst. 3 písm. b),
- lhůta pro ohlášení porušení zabezpečení je **72 hodin** (čl. 33).

## Co se kde ukládá

| Kde | Co | Jak dlouho |
|---|---|---|
| `eliteDiagnosticResults` | jméno, datum narození, role, rod, odpovědi, doba vyplňování | zatím bez omezení |
| `normSamples` | pásmo narození, rod, role, odpovědi, čtvrtletí pořízení, párovací klíč | zatím bez omezení |
| `invitations` | jméno klienta, poznámka kouče, token | zatím bez omezení |
| `coaches` | jméno, e-mail, telefon, poznámka, otisk hesla | po dobu spolupráce |
| `coachSessions` | token relace | 7 dní od posledního použití |
| `loginAttempts` | e-mail a počet neúspěchů | do úspěšného přihlášení |
| `pristupovyLog` | kdo, co, kdy | zatím bez omezení |
| prohlížeč respondenta | rozpracované odpovědi | do odeslání dotazníku |
| prohlížeč kouče | token relace | do odhlášení nebo vypršení |

Vyhodnocení v PDF vzniká **v prohlížeči kouče**, na server se neposílá a nikde
se neukládá. To je dobře: dokument s profilem existuje jen tam, kam si ho kouč
uloží. Zároveň to znamená, že za jeho další osud odpovídá kouč.

## Zpracovatelé a předání mimo EU

| Služba | Role | Co u ní leží | Kde |
|---|---|---|---|
| Convex | zpracovatel | celá databáze | USA |
| Vercel | zpracovatel | provoz aplikace, logy požadavků | USA / EU dle regionu |

**Co je potřeba zařídit:** uzavřít s oběma smlouvu o zpracování (DPA) a ověřit,
na jakém právním základu stojí předání do USA (standardní smluvní doložky,
případně účast v rámci EU-US Data Privacy Framework). Obě služby DPA nabízejí,
ale samo se to neuzavře. Do záznamů o činnostech pak patří jmenovitě.

Za zvážení stojí, jestli jde Convex provozovat v EU regionu; u zvláštní
kategorie údajů to zjednodušuje argumentaci.

## Co už je ošetřené technicky

- Výsledky se nevracejí bez ověřené relace kouče, kontrola je na serveru.
- Externí kouči mají oddělenou větev, do které nikdo jiný nevidí.
- Anonymní vzorek nemá jméno ani celé datum narození; nově je i hrubší
  (pětileté pásmo narození, čtvrtletí místo měsíce).
- Právo na výmaz sahá i do vzorku: smazání vyplnění maže i jeho anonymní kopii
  přes párovací klíč (u záznamů pořízených před touto změnou to nejde).
- Přístupy k vyhodnocení se zaznamenávají a master je vidí v přehledu.
- Hesla jsou hashovaná (PBKDF2, 210 000 iterací), přihlašování má strop na
  počet pokusů.
- Odkazy na dotazník mají neuhodnutelný token a platnost 30 dní.

## Co zbývá dodělat

### 1. Souhlas se zpracováním

Potřebuje být **výslovný** a **oddělený** pro dva účely:

1. provedení diagnostiky a předání výsledků kouči,
2. zařazení odpovědí do anonymního vzorku pro tvorbu norem.

Druhý souhlas musí jít odmítnout, aniž by to bránilo prvnímu. Text by měl
srozumitelně říct: co se měří, kdo výsledek uvidí, jak dlouho se uchovává,
že se odpovědi mohou použít k tvorbě norem, komu jsou data předána (Convex,
Vercel) a jak souhlas odvolat.

**V aplikaci to zatím není.** Nejjednodušší cesta: zaškrtávací pole na úvodní
stránce dotazníku, bez kterého nejde pokračovat, a uložení času a znění
souhlasu k vyplnění. Rád to doplním, až bude text hotový.

### 2. Retenční lhůty

Dnes se nemaže nic. Doporučuju stanovit a zautomatizovat:

- vyplnění a výsledky: 3 roky od pořízení (nebo dřív na žádost klienta),
- nepoužité pozvánky: 90 dní po vypršení,
- přístupový log: 12 měsíců,
- anonymní vzorek: bez omezení, pokud zůstane skutečně anonymní.

Convex umí plánované funkce (cron), takže úklid může běžet sám. Až budou lhůty
odsouhlasené, naprogramuju to.

### 3. Dokumenty

- **Záznamy o činnostech zpracování** (čl. 30): účel, kategorie subjektů
  a údajů, příjemci, lhůty, popis zabezpečení. Tenhle dokument je z velké části
  předvyplňuje.
- **DPIA** (čl. 35): popis zpracování, nezbytnost a přiměřenost, rizika pro
  subjekty údajů a opatření. Audit slouží jako podklad k části o rizicích.
- **Informace pro subjekty údajů** (čl. 13): co dostane klient před vyplněním.
- **Postup při porušení zabezpečení**: kdo rozhoduje, jak se posoudí závažnost,
  kdy se hlásí ÚOOÚ (do 72 hodin) a kdy se informují klienti.
- **Poučení koučů**: kam se smí ukládat stažené PDF, že se výsledky neposílají
  nešifrovaně, že přístup se nepředává dál, co dělat při ztrátě zařízení.

### 4. Provozní návyky

- Nastavit `SETUP_TOKEN` v Convexu a nikdy nevracet zpět hodnotu z historie gitu.
- Při odchodu kouče účet vypnout (relace se tím ukončí samy).
- Jednou za čtvrtletí projít přístupový log a seznam účtů.
- Zálohy databáze mají stejný režim jako databáze; když je někam stáhnete,
  patří na šifrovaný disk.

## Kdy se vrátit k auditu

Bezpečnostní audit doporučuju zopakovat vždy, když přibude nový typ testu
s jinými daty, změní se okruh lidí s přístupem, nebo se sáhne na přihlašování.
Statické kontroly (`npm run audit`) hlídají přístupová pravidla průběžně, ale
nenahradí pohled na celek.
