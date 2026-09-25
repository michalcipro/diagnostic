# Screening duševního zdraví

Rozhodnutí: screening ano. Tento dokument popisuje, jak ho udělat tak, aby
sportovci pomohl a nikomu neublížil. **V aplikaci se nespustí, dokud není
podepsaná smlouva se zdravotníkem** (níže), protože screening bez někoho,
kdo na pozitivní výsledek odpoví, je horší než žádný.

## Co je ověřené

- **SMHAT-1** (2021) je nástroj Mezinárodního olympijského výboru pro
  sportovce od 16 let. Krok 1 je triáž dotazníkem **APSQ** (10 položek,
  skóre 17 a víc je pozitivní triáž, ne diagnóza). Krok 2 jsou dotazníky
  na konkrétní obtíže: úzkost (GAD-7), deprese (PHQ-9), spánek (ASSQ),
  alkohol (AUDIT-C), návykové látky (CAGE-AID), příjem potravy (BEDA-Q).
  Krok 3 je klinické vyšetření.
- **SMHAT2** (2026) je aktualizace. Triáž APSQ v ní už není: krok 1 je
  plošný screening pěti dotazníky na konkrétní obtíže a dvěma samostatnými
  otázkami, krok 2 podmíněný screening dalšími dvěma dotazníky, krok 3
  klinické posouzení, které provádí lékař sportovní medicíny nebo
  registrovaný odborník na duševní zdraví. V sadě jsou mimo jiné PHQ-9,
  GAD-7, ASSQ, AUDIT, CAGE, EDE-QS a PC-PTSD-5.
- Oba nástroje jsou určené pro **lékaře sportovní medicíny a registrované
  zdravotníky**, ne pro trenéry a ne pro komerční aplikaci bez zdravotníka.
- **APSQ** je samostatně validovaný: vývoj na 1 007 australských
  profesionálních sportovcích (muži), později ověřený i u elitních
  sportovkyň; existuje řada jazykových verzí a přehledová studie
  mezinárodní validity. Česká ani slovenská verze se nenašla.

## Návrh

**V testu jen APSQ, všechno ostatní u zdravotníka.**

| krok | kde | kdo vidí výsledek |
|---|---|---|
| APSQ, 10 položek, dobrovolně, od 16 let | v aplikaci, na konci testu, s vlastním souhlasem | nikdo v aplikaci; server skóre spočítá a uloží odděleně |
| skóre ≥ 17 | aplikace upozorní smluvního zdravotníka | zdravotník |
| SMHAT2 a klinické posouzení | u zdravotníka, mimo aplikaci | zdravotník a sportovec |

Proč jen APSQ:

- **PHQ-9 obsahuje otázku na myšlenky na smrt a sebepoškození.** Kdyby byla
  v aplikaci, musel by existovat okamžitý bezpečnostní postup pro každou
  kladnou odpověď, každý den v roce. To bez nepřetržité služby zajistit
  nejde. APSQ takovou otázku nemá.
- Plná sada SMHAT2 má několik desítek položek; spolu s testem by se do 45 minut nevešla.
- Zdravotník si SMHAT2 zadá ve svém prostředí, se svou odpovědností
  a dokumentací. Aplikace mu jen pošle, že má sportovce kontaktovat.

**Mladší 16 let:** APSQ ani SMHAT pro ně ověřené nejsou. Screening se jim
nenabízí. Na konci testu dostanou stejně jako všichni ostatní kontakty na
pomoc (níže). Zda existuje nástroj ověřený u sportovců 14 až 15 let, je
otázka pro smluvního zdravotníka; dokud ho nedoporučí, nic se nepřidává.

## Pravidla

1. **Kouč výsledek nevidí nikdy**, ani jako informaci, že byl screening
   vyplněn, ani v týmovém profilu, ani v PDF. Sportovec, který se bojí, že se
   to trenér dozví, odpoví nepravdivě a screening ztratí smysl.
2. **Samostatný souhlas** podle čl. 9 odst. 2 písm. a) GDPR (zdravotní
   údaje), oddělený od souhlasu s testem. Odmítnutí screeningu nemá žádný
   vliv na test.
3. **Oddělená data.** Vlastní tabulka, vlastní role „zdravotník“, žádný
   koncový bod pro kouče ani mastera, který by skóre vracel. Kontrola
   v `scripts/audit-pristupu.cjs` jako u ostatních rolí.
4. **Screening není v normativním vzorku** a nepoužívá se k vývoji testu,
   pokud k tomu sportovec nedá výslovný souhlas zvlášť.
5. **Sportovci se skóre nezobrazuje.** Při pozitivní triáži uvidí zprávu, že
   ho kontaktuje zdravotník a v jaké lhůtě, a kontakty na okamžitou pomoc.
   Je to jediné místo, kde se sportovci něco z vyhodnocení ukáže, a to
   záměrně: screening, o kterém se sportovec nedozví, že vedl k doporučení,
   by byl neetický.
6. **Kontakty na pomoc vidí každý** na konci screeningu i na konci testu,
   bez ohledu na skóre a věk:
   - Česko: Linka první psychické pomoci 116 123, Linka bezpečí 116 111
     (děti a studenti), v ohrožení života 155 nebo 112,
   - Slovensko: Linka dôvery Nezábudka 0800 800 566, IPčko (ipcko.sk),
     v ohrožení života 112,
   - ostatní: místní tísňové číslo.

   Čísla ověřit před spuštěním a pak jednou ročně.
7. **Aplikace nic neslibuje okamžitě.** Zpráva uvádí lhůtu ze smlouvy se
   zdravotníkem (například 5 pracovních dnů) a že v akutní situaci patří
   na linku pomoci nebo na tísňové číslo, ne do aplikace.
8. **Kratší retence** než u testu; lhůtu určí zdravotník podle své
   dokumentační povinnosti.

## Smluvní zdravotník

Klinický psycholog, psychiatr nebo lékař se zkušeností ze sportovní
medicíny, ideálně s praxí v Česku i na Slovensku. Smlouva musí určit:

- lhůtu kontaktu po pozitivní triáži a zástup po dobu nepřítomnosti,
- kdo je správcem údajů u kroku 2 a 3 (pravděpodobně zdravotník sám jako
  samostatný správce; posoudí právník),
- postup u nezletilých 16 a 17 let (zákonný zástupce, mlčenlivost),
- co smí zdravotník sdělit kouči: nic bez výslovného souhlasu sportovce,
- práh: převzít 17 z validace APSQ, nebo ho pro české a slovenské
  sportovce ověřit; do ověření platí původní,
- jak se ověří česká a slovenská verze APSQ (překlad podle ITC, kognitivní
  rozhovory; licence je podle dostupných informací volná, potvrdit u autorů).

## Co to znamená pro aplikaci

Nic se nestaví, dokud není smlouva. Potom:

| co | kde |
|---|---|
| role „zdravotník“ a jeho přihlášení | `convex/sessions.ts`, oddělené od koučů |
| tabulka screeningu a výpočet APSQ na serveru | nový modul, klíč a práh jen na serveru |
| souhlas a blok APSQ na konci testu, jen od 16 let | vyplňování testu |
| upozornění zdravotníkovi | e-mail bez zdravotních údajů, jen „máte nový případ“ a odkaz |
| kontakty na pomoc | konec každého testu, ve všech jazycích |
| kontrola, že skóre nikde nevrací koučovský koncový bod | audit přístupů |

## Zdroje

- [IOC SMHAT2: vývoj, obsahová validita a proveditelnost (2026)](https://pmc.ncbi.nlm.nih.gov/articles/PMC13479680/)
- [SMHAT-1 pro sportovce, Athlete365](https://www.olympics.com/athlete365/app/uploads/2021/06/BJSM-SMHAT-1-Athlete365-2020-102411.pdf)
- [APSQ, předběžná validace u mužů, elitní sportovci](https://www.tandfonline.com/doi/full/10.1080/1612197X.2019.1611900)
- [APSQ, přehled mezinárodní validity](https://pmc.ncbi.nlm.nih.gov/articles/PMC12896643/)
- [APSQ, stránka autora](https://drsimonrice.com/apsq/)
- [SMHAT-1 u ruských fotbalistů, kroky a práh](https://www.frontiersin.org/journals/sports-and-active-living/articles/10.3389/fspor.2026.1888491/full)
