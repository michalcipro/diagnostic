# Duševní pohoda: doporučení odborníka

Postup Winning Minds: když se objeví signál, že sportovci není dobře, kouč
mu nabídne kontakt na odborníka. Sportovec si vybere, jestli chce doporučení
od nás (máme v okolí několik odborníků), nebo si odborníka najde sám.

Test v tom má jedinou roli: **včas dát kouči signál**. Nic nediagnostikuje,
nikoho nikam neposílá a nepotřebuje smluvního zdravotníka.

## Proč ne nástroje olympijského výboru

| nástroj | proč ne |
|---|---|
| SMHAT-1, SMHAT2 (MOV) | určené pro lékaře sportovní medicíny a registrované zdravotníky; SMHAT2 obsahuje i otázku na sebepoškození, na kterou musí okamžitě reagovat zdravotník |
| APSQ | volně jen pro nekomerční použití a podle dostupných zdrojů pro dospělé; pro komerční koučování by bylo potřeba žádat autory |

## Co místo nich: PHQ-4

Čtyři otázky za posledních 14 dní: dvě na skleslost (PHQ-2), dvě na úzkost
(GAD-2). Zabere 30 sekund.

- **Bez žádosti o svolení.** Formuláře PHQ nesou výslovné ustanovení, že
  k jejich kopírování, překladu, zobrazení a šíření není potřeba svolení.
- **Ověřený.** Původní validace na 2 149 pacientech praktických lékařů,
  později normy pro běžnou populaci. Hranice: 3 a víc v kterékoli dvojici
  otázek je pravděpodobná skleslost nebo úzkost, 6 a víc celkem ukazuje na
  zvýšenou zátěž.
- **Bez otázky na sebepoškození.** Ta je v delším PHQ-9, ne v PHQ-4. Proto
  aplikace nepotřebuje nepřetržitou krizovou službu.
- **Omezení, která se musí říkat nahlas:** validace je pro dospělé (18+),
  ne speciálně pro sportovce. U 14 až 17 let slouží výsledek jen jako důvod
  k rozhovoru. Doporučuji požádat některého z odborníků, se kterými
  spolupracujete, aby se na znění a na postup podíval. Není to podmínka,
  je to pojistka.
- **Překlad:** zkontrolovat, jestli jsou na phqscreeners.com oficiální
  česká a slovenská verze. Když ne, přeložit podle stejného postupu jako
  zbytek testu (svolení k překladu není potřeba).

## Jak to funguje

| krok | co se děje | kdo co vidí |
|---|---|---|
| 1 | na konci testu 4 otázky; dobrovolné, se samostatným souhlasem | sportovec vidí jen otázky |
| 2 | server spočítá body | body nevidí nikdo, nikde se nezobrazují |
| 3 | nad hranicí: v detailu vyplnění se kouči ukáže karta **„Doporučení: nabídni kontakt na odborníka“** a krátké vodítko k rozhovoru | kouč, který sportovce vede (interní i externí), jen v aplikaci |
| 4 | kouč nabídne volbu: odborník z našeho seznamu, nebo vlastní | sportovec rozhoduje |
| 5 | kouč si v aplikaci poznamená, že kontakt nabídl (datum) | kouč |

**Kontakty na okamžitou pomoc vidí každý** na konci testu, bez ohledu na
výsledek a věk:

- Česko: Linka první psychické pomoci 116 123, Linka bezpečí 116 111 (děti
  a studenti), v ohrožení života 155 nebo 112,
- Slovensko: Linka dôvery Nezábudka 0800 800 566, IPčko (ipcko.sk),
  v ohrožení života 112,
- ostatní: místní tísňové číslo.

Čísla ověřit před spuštěním a pak jednou ročně.

## Pravidla

1. **Kouč nevidí body ani odpovědi**, jen doporučení. Signál má vést
   k rozhovoru, ne k vykládání čísel, na která kouč není vyškolený.
2. **Karta není v PDF.** PDF se přeposílá; doporučení k odborníkovi do
   dokumentu, který může skončit u klubu nebo rodiče, nepatří.
3. **Týmová větev:** klubový kouč kartu nevidí nikdy, ani u hráčů, kteří mu
   výsledky sdílejí; nesmí to ovlivnit sestavu ani nominaci. Hráč místo
   toho uvidí u svého výsledku vlídnou zprávu s kontakty a nabídkou
   doporučení od Winning Minds.
4. **Nikam dál:** ne do týmového profilu, ne do normativního vzorku, ne do
   podkladu pro validaci, pokud k tomu sportovec nedá zvlášť souhlas.
5. **Souhlas:** jde o zdravotní údaje (čl. 9 GDPR), proto samostatný
   výslovný souhlas; odmítnutí nemá vliv na test. U nezletilých posoudí
   právník, jak zapojit zákonného zástupce.
6. **Výmaz:** smaže se spolu s vyplněním, stejně jako hodnocení trenéra.
7. **Aplikace nic neslibuje.** Text nikdy neříká „ozveme se“; říká, že kouč
   nabídne kontakt a že v akutní situaci patří člověk na linku pomoci nebo
   na tísňové číslo.

## Co to znamená pro aplikaci

Dá se postavit hned a funguje i pro stávající ELITE 200, nemusí se čekat na
nový test.

| co | kde |
|---|---|
| 4 otázky a souhlas na konci testu | vyplňování testu, všechny jazyky |
| výpočet a hranice jen na serveru | Convex; body se nevracejí žádným koncovým bodem |
| karta s doporučením a vodítkem k rozhovoru | detail vyplnění u kouče, mimo tisk a PDF |
| záznam „kontakt nabídnut“ | detail vyplnění |
| kontakty na pomoc | konec každého testu |
| vlídná zpráva hráči v týmové větvi | výsledek hráče |
| kontrola, že body nikde neunikají a klubový kouč kartu nevidí | `scripts/audit-pristupu.cjs`, test |

## Zdroje

- [PHQ-4, validace (Kroenke a kol., 2009)](https://www.sciencedirect.com/science/article/pii/S0033318209708643)
- [PHQ-4, normy v běžné populaci](https://www.sciencedirect.com/science/article/abs/pii/S016503270900278X)
- [PHQ formuláře a překlady](https://www.phqscreeners.com/)
- [IOC SMHAT2 (2026)](https://pmc.ncbi.nlm.nih.gov/articles/PMC13479680/)
- [APSQ, podmínky použití](https://novopsych.com/assessments/sport-assessments/athlete-psychological-strain-questionnaire/)
