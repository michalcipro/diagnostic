# Samostatné moduly ELITE

Čtyři samostatné diagnostiky, které se zadávají vedle ELITE 200, ne místo něj.
ELITE 200 je profil rysů: odpovídá na otázku „jaký ten sportovec je". Moduly
odpovídají na jinou otázku: **co se stane v konkrétní situaci a proč**. Proto
stojí zvlášť, mají vlastní položky a vlastní výpočet a dají se zadat i prodat
samostatně.

Tenhle adresář je specifikace, ne hotový kód. Obsahuje všechno, co je potřeba
k implementaci a k odbornému posouzení: teoretický základ, subškály, položky
česky a anglicky, klíčování, výpočet indexů, vzorce chování, výkladové texty,
varovné signály a plán validace.

| soubor | modul | pracovní název | na co odpovídá |
|---|---|---|---|
| [01-rozhodnost.md](01-rozhodnost.md) | Index váhání | ELITE Decide | Vezme si to na sebe, když na tom záleží? A když ne, proč? |
| [02-zmena.md](02-zmena.md) | Připravenost na změnu | ELITE Transition | Zvládne nového trenéra, novou roli, novou zemi? Kde se to zlomí? |
| [03-telo.md](03-telo.md) | Tělo, bolest a signály | ELITE Body | Čte své tělo správně, nebo ho přehlušuje či se ho bojí? |
| [04-rytmus.md](04-rytmus.md) | Spánek a biorytmus | ELITE Rhythm | Sedí jeho biologické hodiny na rozvrh, který mu dáváme? |

Názvy jsou pracovní. O značce rozhodne obchod, ne tahle specifikace.

## Přehled rozsahu

| modul | varianty | položek (bez validity) | kontext | validita | čas |
|---|---|---|---|---|---|
| Rozhodnost | T týmový sport, I individuální | 48 + 8 vinět | 5 | 7 | 14 min |
| Změna | Z zahraničí, D doma, T1 retest | 74 (Z) / 48–60 (D) + retest 12 | 11 | 7 | 18 / 12 min |
| Tělo | P prevence, N návrat po zranění | 48 (P) / 75 (N) | 9 | 7 | 11 / 17 min |
| Spánek | jedna, s blokem cestování volitelně | 57 + 18 číselných | 8 | 6 | 15 min |

---

## Společná metodika

### Formáty odpovědí

Moduly nepoužívají jen souhlasnou škálu. To je hlavní rozdíl proti běžným
dotazníkům a hlavní důvod, proč z nich jde predikovat chování, ne jen popsat
sebeobraz.

| kód | formát | kotvy | kdy |
|---|---|---|---|
| **L5** | souhlas | 1 vůbec nesouhlasím · 2 spíš nesouhlasím · 3 napůl · 4 spíš souhlasím · 5 zcela souhlasím | postoje, přesvědčení, obvyklé reakce |
| **F5** | četnost | 1 nikdy · 2 výjimečně · 3 občas · 4 často · 5 skoro vždy | chování; vždy s časovým rámcem „posledních 3 měsíců" |
| **F10** | počet z deseti | 0 až 10 | chování v zápasech; „v kolika z posledních 10 zápasů" |
| **P** | párová volba | A nebo B | tam, kde souhlasná škála svádí k sociálně žádoucí odpovědi |
| **V** | viněta | čtyři možnosti, každá kóduje jiný vzorec | situační úsudek; hůř se falšuje a lépe se čte |
| **N** | číselná | hodiny, minuty, počty, stupnice 0–10 | fakta: časy spánku, bolest, počty zranění |

Proč tolik formátů. Souhlasná škála měří, jak se člověk vidí. Četnost měří,
co si pamatuje, že dělá, a to je blíž chování. Párová volba nutí vybrat mezi
dvěma stejně přijatelnými možnostmi, takže se v ní hůř „vypadá dobře". Viněta
přenese otázku do konkrétní chvíle, kde se obecná sebedůvěra neuplatní.

### Označení

- **Položky** mají prefix modulu a dvoumístné číslo: `RZ01`, `ZM10`, `TB75`.
- **Subškály** mají prefix, tečku a číslo: `RZ.1`, `ZM.10`, `TB.12`. Tečka je
  tam proto, aby se subškála nikdy nepletla s položkou stejného čísla
  (`ZM.10` je kulturní inteligence, `ZM10` je jedna položka flexibility).
- **Kontext, kontrolní položky a retest** mají pomlčku a písmeno: `RZ-C4`,
  `TB-K1`, `ZM-T10`, `SR-N17`.
- **Viněty** modulu rozhodnosti: `RZV1n` (nízká sázka), `RZV1v` (vysoká).

### Klíčování a vyvážení

Každá subškála měřená souhlasem (L5) má aspoň čtvrtinu, většinou třetinu
položek obráceně klíčovaných. Četnostní škály příznaků a chování (F5), třeba
denní ospalost nebo užívání léků, jsou záměrně jednosměrné, stejně jako
jejich klinické předlohy (Epworth, PSQI); proti souhlasnému stylu odpovídání
je chrání formát četnosti a kontrolní položky. V tabulkách položek je klíč:

- `+` vyšší souhlas znamená vyšší skóre subškály,
- `−` obráceně; převádí se jako `6 − x` (u F10 jako `10 − x`).

Klíč se vztahuje ke konstruktu subškály, ne k tomu, jestli je to „dobře".
Jestli je vysoké skóre subškály dobrá zpráva, nebo riziko, určuje **polarita
subškály**, viz níž.

### Polarita subškál

| polarita | značka | výklad |
|---|---|---|
| vyšší je lépe | ↑ | zdroj, dovednost |
| vyšší je riziko | ↓ | zranitelnost, zátěž |
| obě strany jsou riziko | ↕ | optimum je uprostřed; typicky tělo a bolest |
| prostředí | ◇ | nepopisuje sportovce, ale prostředí kolem něj; nikdy se nesčítá do jeho indexu |

Subškály s polaritou ◇ jsou záměr. Když hráč váhá, protože trenér trestá každý
pokus, není to vlastnost hráče a report to nesmí vydávat za jeho problém.
Doporučení k nim míří na trenéra.

### Vrstva spolehlivosti

Každý modul má vlastní kontrolní položky ve stejné logice jako ELITE 200:

| kontrola | počet | pravidlo |
|---|---|---|
| pozornostní položky | 2 | „U této věty zvol …"; jedna chyba = opatrně, dvě = neplatné |
| infrekvenční položky | 2 | tvrzení, se kterým skoro nikdo nesouhlasí, nebo naopak |
| konzistenční páry | 3 | stejný obsah, opačné klíčování; průměrný rozdíl nad 1,5 = opatrně |
| tempo | – | pod 2 s na položku neplatné, pod 3 s opatrně (viněty a číselné položky se nepočítají) |
| nejdelší řada stejných odpovědí | – | nad 12 opatrně |

Specifické kontroly modulů (například rozpor mezi sebeobrazem a vinětami
v modulu rozhodnosti, nebo nemožné časy spánku v modulu rytmu) jsou popsané
u modulů. **Rozpor není vždy chyba.** U modulu rozhodnosti je rozdíl mezi tím,
jak se hráč popisuje, a tím, co volí ve vinětách, sám o sobě nález.

### Výpočet subškál

Souhlas a četnost:

```
procenta = (součet_po_klíčování − k) / (4 · k) · 100        k = počet položek
```

Počet z deseti: průměr po klíčování krát deset. Párová volba: podíl voleb
kódovaných pro subškálu krát sto. Viněty se počítají zvlášť, viz moduly.

Subškála se vykazuje, když je zodpovězeno aspoň 75 % jejích položek (stejně
jako `minCoverage` u ELITE 200).

### Pásma a prahy

**Všechny prahy v téhle specifikaci jsou předběžné.** Do chvíle, než existují
normy, se používají pevné hranice na procentech a report je u nich musí
označit jako předběžné:

| polarita | pásma |
|---|---|
| ↑ | pod 31 rozvojová priorita · 31–61 stabilizace · 61–82 silné · nad 82 špičkové (stejně jako ELITE 200) |
| ↓ | pod 40 nízké · 40–59 střední · 60–74 zvýšené · 75 a víc vysoké |
| ↕ | viz modul Tělo; počítá se vzdálenost od optima |

Po pilotu se riziková pásma přepočítají na percentily normy: **zvýšené =
horních 15 %, vysoké = horních 5 %** referenční skupiny podle sportu, věku
a úrovně. Tím se z odhadu stane měřítko. Pásma ↑ zůstávají svázaná s ELITE,
aby šly profily porovnávat.

### Index není průměr

Každý modul má jeden hlavní index a k němu **vzorce chování**: pojmenované
konfigurace subškál s pravidly přednosti. Důvod je stejný jako u týmového
vyhodnocení: dva sportovci se stejným číslem se mohou chovat úplně jinak
a potřebovat opačnou pomoc. Index říká „jak moc", vzorec říká „jak a proč".

Vzorce jsou pojmenované **podle chování, ne podle člověka**: „vzorec stažení",
ne „stahující se hráč". Má to dva důvody. Věcný: vzorec je hypotéza o tom, co
se děje v určité situaci, ne nálepka. Jazykový: podstatné jméno nemá rod,
takže odpadá riziko, že žena dostane text v mužském rodě.

Váhy v indexech jsou **předběžné a teoreticky odvozené**. Po pilotu se nahradí
vahami z konfirmační faktorové analýzy a z regrese na kritérium (hodnocení
trenéra, videoanalýza, zranění, podle modulu). Jaké kritérium, je u každého
modulu uvedeno.

### Výstup pro kouče

Každé vyhodnocení modulu má stejnou kostru:

1. **Karta**: index, vzorec, varovné signály, validita.
2. **Profil subškál** s pásmy; prostředí (◇) vždy zvlášť a odlišené.
3. **Výklad vzorce**: jak se pozná, co se děje uvnitř, s čím se plete, první
   krok, podle čeho poznat, že to zabírá. Stejná pětice jako v pravidlech
   objemu textu v `CLAUDE.md`.
4. **Vazba na ELITE 200**, pokud sportovec vyplnil i ten.
5. **Varovné signály a doporučení odborníka**, pokud jsou.
6. **Shrnutí** ve druhé osobě přímo sportovci, stejně jako u ELITE 200
   (`lib/diagnostic/summary.ts`): bez čísel a odborných pojmů, aby ho kouč
   mohl přečíst nahlas. Každý modul má šablonu.

Sportovec výsledky nevidí, stejně jako u ELITE 200. Výjimkou zůstává jen
týmová větev.

---

## Vazba na ELITE 200

Moduly fungují samostatně. Když sportovec vyplnil i ELITE 200, výklad se
zpřesní o konfigurace s jeho fazetami. Nejdůležitější vazby:

| modul | fazety ELITE 200 | co přidávají |
|---|---|---|
| Rozhodnost | B1, B3, D3, C3 | jestli váhání pramení z nízké sebedůvěry, z hrozby, nebo z tvrdosti k sobě |
| Změna | A1, A3, G2, G3 | jestli identita unese ztrátu role a jestli má síť, o kterou se opře |
| Tělo | D1, F2, A3 | jestli přehlušování souvisí se sebehodnotou vázanou na výkon |
| Spánek | F2, F3, D2 | jestli spánek selhává kvůli rytmu, nebo kvůli nabuzení |

Konfigurace jsou vypsané u každého modulu.

---

## Jazyky a rod

- Položky jsou česky a anglicky. **Slovenština se doplní při implementaci**
  podle `docs/slovnik-prekladu.md` a projde stejnou kontrolou jako ostatní
  slovenské texty (žádné ř, ě, ů; žádné české tvary).
- Všechny položky jsou **rodově neutrální**: přítomný čas, první osoba. Stávající
  banka ELITE nemá v položkách jedinou rodovou značku a nové moduly to drží.
  Kde by minulý čas vnesl rod („jsem se rozhodl"), je věta přeformulovaná
  („moje volba"). Kontrolní skript při implementaci hledá příčestí minulá po
  „jsem", „jsi" a „bych".
- Výkladové texty rod řeší značkou `{mužský|ženský}` jako všude jinde.
- Angličtina značky nemá.

## Ochrana know-how

Stejné pravidlo jako u ELITE 200: klíče, váhy, prahy a pravidla vzorců nesmí
do balíčku, který dostane respondent. Dotazník dostane jen texty položek
a formáty. Výpočet běží na serveru, klient dostane hotové výsledky. Kontrola
`scripts/audit-balicku.cjs` se při implementaci rozšíří o nové moduly.

---

## Etika, GDPR a předávání odborníkovi

Tady se moduly od ELITE 200 liší a je potřeba to rozhodnout vědomě.

**Modul Tělo a část modulu Spánek sbírají údaje o zdraví výslovně**: bolest,
zranění, otřesy mozku, léky, příznaky poruch spánku. Diagnostika duševního
rozpoložení už teď spadá pod čl. 9 GDPR (viz `docs/gdpr-podklady.md`), ale tyhle
moduly se ptají přímo na zdravotní stav. Z toho plyne:

- **výslovný souhlas** se zpracováním údajů o zdraví, oddělený od souhlasu
  s diagnostikou,
- **minimalizace**: žádné diagnózy, jen hrubé kategorie (oblast těla, ne
  diagnóza; počet otřesů, ne lékařské zprávy),
- **kdo to uvidí**: kouč, nebo jen zdravotní personál klubu; rozhodnutí patří
  do souhlasu,
- **nezletilí**: u zdravotních údajů doporučuju souhlas zákonného zástupce
  u každého sportovce pod 18 let; hranice 15 let ze zákona č. 110/2019 Sb. se
  týká služeb informační společnosti a na údaje o zdraví bych se o ni neopíral,
- **posouzení vlivu (DPIA)** se tím stává prakticky nutným.

**Moduly nediagnostikují.** Kde odpovědi naznačují něco, co patří lékaři nebo
psychologovi, report to řekne jako doporučení konzultace s konkrétním typem
odborníka a s důvodem. Nikdy jako diagnózu. Každý modul má vypsané varovné
signály, prahy a znění doporučení.

**Dvě rozhodnutí, která nejsou psychometrická a patří vám:**

1. **Klinický screening.** Modul Změna může mít volitelně dvě položky
   o náladě (obdoba PHQ-2), modul Spánek má screening nespavosti a spánkové
   apnoe. Obojí má velkou hodnotu, ale mění charakter produktu z výkonnostní
   diagnostiky na screening a vyžaduje připravenou cestu k odborníkovi.
   Specifikace je obsahuje s označením „volitelné".
2. **Kdo vidí zdravotní část.** Buď kouč, nebo jen zdravotní personál. Druhá
   možnost je čistší, ale znamená nový typ účtu.

---

## Validace

Pro každý modul platí stejný postup. Konkrétní srovnávací nástroje a kritéria
jsou u modulů.

| krok | co | minimum |
|---|---|---|
| 1. odborné posouzení | dva sportovní psychologové posoudí položky proti definicím subškál | shoda na zařazení aspoň 80 % |
| 2. kognitivní rozhovory | 8 až 12 sportovců přemýšlí nahlas nad položkami | přeformulovat vše, co se čte jinak, než má |
| 3. pilot | struktura a spolehlivost | n ≥ 200 na modul; CFA, ω ≥ 0,70 na subškálu |
| 4. test-retest | stabilita | 2 až 4 týdny, n ≥ 60, ICC ≥ 0,70 (u rysových subškál) |
| 5. konvergentní validita | srovnání se zavedenými nástroji | uvedeno u modulů |
| 6. kriteriální validita | predikce skutečného chování | uvedeno u modulů; **jediný krok, který z indexu udělá měřidlo** |
| 7. normy | referenční skupiny | podle sportu, věku, úrovně; percentilová pásma |
| 8. invariance | stejné měření napříč jazyky a pohlavím | multigroup CFA, aspoň metrická invariance |

Anonymní vzorek do norem se sbírá stejně jako u ELITE 200 (`normSamples`), bez
jména a s rokem narození místo data.

## Co moduly neumí

- **Sebeposouzení není chování.** Moduly předpovídají, nepozorují. Formulace
  v reportu musí být predikční („je pravděpodobné, že…"), nikdy „určuje".
- **Paměť je nepřesná.** Četnost chování za tři měsíce je odhad. Proto se
  u rozhodnosti kombinuje s vinětami a u spánku s čísly, která se dají ověřit
  náramkem nebo spánkovým deníkem.
- **Účinky jsou střední, ne velké.** Jednotlivé konstrukty v literatuře
  korelují s výkonnostními kritérii typicky kolem r = 0,2 až 0,4. Kompozity
  jsou lepší, ne dramaticky. Patří to do manuálu.
- **Prahy jsou předběžné**, dokud nejsou normy.

---

## Implementace

Pořadí podle poměru hodnoty a pracnosti:

| pořadí | modul | proč právě tak |
|---|---|---|
| 1 | Spánek | nejméně položek s nejvyšší okamžitou užitečností; spousta výstupů se počítá z čísel, ne z odhadů; týmová agregace („trénujete v čase, který sedí jen třetině kádru") je silný obchodní argument |
| 2 | Rozhodnost | nejsilnější příběh; viněty jsou nová technika, kterou se vyplatí odladit na jednom modulu |
| 3 | Změna | nejvíc položek; hodnota roste s retestem, takže potřebuje plánované zadání po 6 až 8 týdnech |
| 4 | Tělo | nejvyšší hodnota péče, ale vyžaduje vyřešený souhlas se zdravotními údaji a rozhodnutí, kdo výsledky vidí |

Co to v kódu znamená pro každý modul:

- nový `TestId` a záznam v `test-meta.ts`,
- banka položek jako JSON ve stejném tvaru jako `lib/diagnostic/data/items`
  (cs, en, sk),
- struktura modulu (subškály, klíče, formáty) mimo balíček respondenta,
- výpočet na serveru a validace,
- obrazovka vyplňování pro nové formáty: párová volba, viněta, číselné časy,
- report v aplikaci a v PDF ve stejné kostře jako ostatní,
- manuál: kapitola pro každý modul,
- testy do `npm run audit`: úplnost položek ve třech jazycích, klíčování,
  rod, výpočet na umělých profilech, kontrola balíčku, sazba PDF.
