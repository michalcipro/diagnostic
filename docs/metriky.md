# Katalog metrik

Všechno, co bychom u sportovce a u týmu sledovali, na jednom místě.

U každé metriky je stav:

- **v aplikaci**: počítá se dnes,
- **specifikace**: rozpracované do položek a výpočtu v `docs/moduly`, připravené k implementaci,
- **návrh**: koncept s mechanismem a zdroji, bez položek.

Katalog je záměrně úplný, a proto dlouhý. **Trenér ale nemá vidět katalog.**
Má vidět titulní stranu s dvanácti čísly a zbytek jen tam, kde se ho týká.
Titulní strana je hned níž; zbytek dokumentu je pro nás.

---

## Titulní strana

### Jednotlivec

Co trenér uvidí jako první, v tomhle pořadí. Metrika se ukáže, jen když ji
sportovec vyplnil.

| # | metrika | otázka trenéra | zdroj | stav |
|---|---|---|---|---|
| 1 | **Spolehlivost odpovědí** | Můžu tomu věřit? | ELITE, všechny moduly | v aplikaci |
| 2 | **Profil sedmi oblastí** | Jaký je? | ELITE 200 | v aplikaci |
| 3 | **Varovné signály** | Je něco, co nesmím přehlédnout? | Tělo, Spánek, Změna | specifikace |
| 4 | **Selhání pod tlakem**: cesta a spouštěč | Proč to v rozhodující chvíli nevyjde? | modul Tlak | návrh |
| 5 | **Obnova po chybě**: doba návratu | Za jak dlouho je zpátky? | modul Tlak | návrh |
| 6 | **Váhání**: index a vzorec | Vezme si to na sebe? | Rozhodnost | specifikace |
| 7 | **Dno výkonu** | Jak hluboko spadne ve špatný den? | modul Tlak | návrh |
| 8 | **Kalibrace těla** | Čte své tělo správně? | Tělo | specifikace |
| 9 | **Spánkové zdraví a časový nesoulad** | Sedí jeho rytmus na náš rozvrh? | Spánek | specifikace |
| 10 | **Zátěžová rezerva** | Kdy to praskne? | Spánek a zátěž | návrh |
| 11 | **Koučovatelnost** | Dá se s ním pracovat? | ELITE a doplněk | návrh |
| 12 | **Změna od minulého měření** | Posouvá se to? | všechno | návrh |

Připravenost na změnu se na titulní stranu dostane jen u sportovce, kterého
změna čeká; jinak je v detailu.

### Tým

| # | metrika | otázka trenéra | zdroj | stav |
|---|---|---|---|---|
| 1 | **Mapa týmu**: úroveň a shoda sedmi oblastí | Kde je tým silný a kde se rozchází? | ELITE, týmová větev | v aplikaci |
| 2 | **Zlomové linie** | Kde se tým pod tlakem rozdělí? | ELITE, týmová větev | v aplikaci |
| 3 | **Skryté trhliny** | Co průměr schovává? | ELITE, týmová větev | v aplikaci |
| 4 | **Strukturální nálezy** | Co z kombinací plyne? | ELITE, týmová větev | v aplikaci |
| 5 | **Rozvrh proti kádru** | Pro koho trénujeme ve špatnou dobu? | Spánek | specifikace |
| 6 | **Koncentrace odpovědnosti** | Kolik lidí si v závěru vezme akci? | Rozhodnost | specifikace |
| 7 | **Klima chyb a kultura bolesti** | Neučíme je nezkoušet a hrát zranění? | Rozhodnost, Tělo | specifikace |
| 8 | **Nehlášené otřesy mozku** | Máme problém, o kterém nevíme? | Tělo | specifikace |

---

## Jak je to poskládané

Sedm vrstev. Každá odpovídá na jiný druh otázky, a proto se nesčítají.

| vrstva | otázka | co obsahuje | stav |
|---|---|---|---|
| 1. Profil | Jaký sportovec je? | ELITE 200, ELITE 100, vzorce, archetypy | v aplikaci |
| 2. Situační indexy | Co se stane, když…? | osm indexů pro rozhodující chvíle, zátěž a spolupráci | návrh |
| 3. Moduly | Jak je na tom v konkrétní oblasti? | rozhodnost, změna, tělo, spánek | specifikace |
| 4. Tým | Co platí pro skupinu? | mapa týmu, nálezy, týmové výstupy modulů | v aplikaci a specifikace |
| 5. Vývoj v čase | Posouvá se to? | změna mezi měřeními, spolehlivá změna | návrh |
| 6. Kvalita odpovědí | Dá se tomu věřit? | pozornost, konzistence, upřímnost, styl, tempo | v aplikaci |
| 7. Kritéria a kvalita nástroje | Funguje to? | co sbírat, abychom to věděli, a jak měřit sami sebe | návrh |

---

## 1. Profil

### ELITE 200 (v aplikaci)

Sedm oblastí, každá ze tří fazet po osmi položkách. Škála 1–5.

| oblast | fazety |
|---|---|
| A Identita a vnitřní motivace | A1 jasnost identity a hodnot · A2 vnitřní motivace a smysl · A3 sebehodnota nezávislá na výsledku |
| B Sebedůvěra a vnitřní dialog | B1 výkonová sebedůvěra · B2 kvalita vnitřního dialogu · B3 vztah k sobě po chybě |
| C Koncentrace a řízení pozornosti | C1 selektivní pozornost · C2 znovuzaměření a rutiny · C3 přítomný okamžik a proces |
| D Emoční regulace a výkon pod tlakem | D1 vnímání tělesných signálů · D2 regulace aktivace · D3 výzva vs. hrozba |
| E Odolnost a růstové nastavení | E1 růstové přesvědčení · E2 vytrvalost · E3 zpracování neúspěchu a zpětné vazby |
| F Disciplína, návyky a regenerace | F1 seberegulace a konzistence · F2 spánek a regenerace · F3 energie a životní styl |
| G Vztahy, komunikace a prostředí | G1 komunikace a psychologické bezpečí · G2 hranice a asertivita · G3 sociální opora |

| metrika | hodnota | poznámka |
|---|---|---|
| skóre oblasti a fazety | 0–100 % | vykazuje se od 75 % zodpovězených položek |
| pásmo | rozvojová priorita · stabilizace · silné · špičkové | hranice 31 / 61 / 82 % |
| heterogenita oblasti | ano / ne | rozpětí fazet nad prahem; oblast se pak čte po fazetách |
| nejsilnější a nejslabší fazety | tři a tři | |

### ELITE 100 (v aplikaci)

| metrika | hodnota |
|---|---|
| skóre sedmi oblastí | 0–100 %, pásmo |
| rozpětí oblastí | rozdíl nejvyšší a nejnižší |
| nevyvážený profil | ano / ne |

### Emocionálně-destruktivní vzorce (v aplikaci)

Jedenáct vzorců po deseti položkách, škála 1–6.

| doména | vzorce |
|---|---|
| odpojení a odmítnutí | opuštění · nedůvěra · citová deprivace · společenské vyloučení · méněcennost |
| narušená autonomie a výkon | závislost · zranitelnost · selhání |
| zaměření na druhé | podmanění |
| ostražitost | perfekcionismus |
| narušené hranice | výjimečnost a velikášství |

| metrika | hodnota |
|---|---|
| skóre vzorce | 10–60, pásmo velmi nízká · nízká · střední · vysoká · dominantní |
| silné odpovědi | počet odpovědí 5–6 u vzorce a jejich čísla |
| tři nejaktivnější vzorce | |
| vzorce se silnými odpověďmi mimo trojici | aspoň tři odpovědi 5–6 |
| vazby mezi vzorci | jak se aktivní vzorce navzájem živí |

### Archetypy (v aplikaci)

Dvanáct archetypů ve čtyřech motivacích; byznysová a sportovní varianta.

| motivace | archetypy |
|---|---|
| nezávislost a naplnění | neviňátko · objevitel · mudrc |
| riziko a mistrovství | hrdina · rebel · mág |
| sounáležitost a potěšení | jeden z nás · milenec · šprýmař |
| stabilita a kontrola | pečovatel · tvůrce · vládce |

| metrika | hodnota |
|---|---|
| skóre archetypu | procenta, počet silných odpovědí |
| primární, sekundární, potlačený archetyp | |
| vyhranění a odstup | jak jasně vede primární archetyp |
| profil čtyř motivací | |

---

## 2. Situační indexy (návrh)

Profil říká, jaký sportovec je. Indexy říkají, **co se stane v konkrétní
chvíli**. Stojí na mechanismech z literatury a skládají se z fazet ELITE,
z modulů a z nových položek. U každého je napsáno, kam by patřil, aby
nevznikal patnáctý samostatný dotazník.

| index | otázka | výstup | z čeho | kam patří |
|---|---|---|---|---|
| **Selhání pod tlakem** | Proč to v rozhodující chvíli nevyjde? | **cesta**: přeřízení, zahlcení, obojí, žádná; **spouštěč**: která ze tří obav ze selhání; **výklad příznaků**: nabuzení, nebo rozpad; perfekcionistické obavy | D3 a nové: přeřízení, zahlcení, obavy ze selhání, výklad příznaků, perfekcionistické obavy | nový **modul Tlak** |
| **Obnova po chybě** | Za jak dlouho je zpátky? | **doba návratu**: do další akce · během pár akcí · do konce zápasu · do dalšího tréninku; převažující mechanismus | B3, C2, E3 a nové: dumání, sebesoucit, vyhýbání se prožitku | **modul Tlak** |
| **Kolísavost výkonu** | Jak hluboko spadne ve špatný den? | **dno, strop, rozpětí** | A3, F1 a nové: rozdělení posledních 10 zápasů, závislost na náladě a na vnějších podmínkách | **modul Tlak** |
| **Koučovatelnost** | Dá se s ním pracovat? | index a profil: přijetí zpětné vazby, orientace cílů, veřejná a soukromá korekce, rychlost důvěry, reakce na ztrátu místa | E3, G2, ZM.6, ZM.8 a nové: úkolová a egová orientace | odvodit z ELITE a Změny, doplnit **krátký blok** |
| **Zátěžová rezerva** | Kdy to praskne? | rovnováha zátěže a zotavení; **stadium vyhoření**: vyčerpání, pak pokles pocitu úspěchu, pak znehodnocení sportu; kvalita motivace | F2, F3, A2, index spánkového zdraví a nové: tři složky vyhoření, motivační regulace | **rozšíření modulu Spánek** na Spánek a zátěž |
| **Sebeřízené učení** | Jak daleko se posune? | index a tři fáze: příprava, sledování, vyhodnocení | nové; F1 jen okrajově | samostatný **modul Rozvoj** |
| **Emoční strategie** | Jak reguluje, ne jestli? | **dva indexy**: přerámování a potlačení | D2 a nové | **doplněk ELITE** k oblasti D |
| **Role v týmu** | Proč nehraje, co má? | tři složky: neví, co se čeká · nesouhlasí · protichůdné požadavky | nové | **týmová větev** |

Proč modul Tlak drží tři indexy pohromadě: selhání, obnova po chybě a dno
výkonu popisují tutéž chvíli zápasu z různých stran. Samostatně by se
navzájem opakovaly; spolu dávají úplný obraz rozhodujícího momentu. Váhání
patří do stejné rodiny, ale má samostatný modul, protože se měří vinětami
a týká se jen sportů s rozhodováním v akci.

---

## 3. Moduly (specifikace)

Podrobnosti v `docs/moduly`. Tady jen přehled toho, co každý modul měří.

### Rozhodnost v akci

| metrika | typ | hodnota |
|---|---|---|
| RZ.1 až RZ.8: asymetrie lítosti, strach z viditelné chyby, přehodnocování, přesouvání odpovědnosti nebo vyčkávání, důvěra v rychlé čtení, unáhlenost, chuť po rozhodující akci | subškály | 0–100 |
| RZ.8 klima chyb | prostředí | 0–100; nikdy se nesčítá do indexu hráče |
| **index váhání** | index | 0–100 |
| index unáhlenosti | index | 0–100; druhý konec osy |
| **tlakový posun** | z vinět | −1 až +1; rozdíl mezi nízkou a vysokou sázkou |
| převzetí při vysoké sázce | z vinět | podíl |
| vzorec | 9 vzorců | rozhodnost, stažení, přehodnocování, strach z pohledu, lítost z činu, unáhlení, rozkolísání, situační váhání, smíšený obraz |
| příznaky | | prostředí trestá pokus · sebeobraz a situace se rozcházejí · málo dat ze závěrů |

### Připravenost na změnu

| metrika | typ | hodnota |
|---|---|---|
| ZM.1 až ZM.12: tolerance nejednoznačnosti, flexibilita zvládání, výlučnost sportovní identity, budování vztahů, ochota říct si o pomoc, důvěra k nové autoritě, praktická samostatnost, zvládání ztráty postavení, vazba na domov, kulturní inteligence, studium, jazyk | subškály | 0–100 |
| **oblasti 4S**: já, opora, strategie, situace | složená skóre | 0–100 |
| **index připravenosti na změnu** | index | 0–100 |
| slabé místo | | nejslabší oblast 4S |
| kulturní připravenost | index | 0–100 a čtyři složky |
| **index skutečné adaptace** (retest) | index | 0–100; porovnání s předpovědí |
| vzorec | 10 vzorců | tichý boj, předstírané porozumění, přetížení změnami, závislost na zázemí, uzavření do sportu, studijní ohrožení, rigidita, jazyková bariéra, připravenost, smíšený obraz |
| varovné signály | 4 | úvaha o předčasném odchodu; osamělost; jídlo a spánek; nálada (volitelné) |

### Tělo, bolest a signály

| metrika | typ | hodnota |
|---|---|---|
| TB.1 až TB.8: katastrofizace, přehlušování, vnímavost k tělu, rozlišení bolesti, hlášení potíží, tlak prostředí, léky, prevence | subškály | 0–100 |
| dílčí skóre katastrofizace: dumání, zveličování, bezmoc | | 0–100 |
| TB.9 až TB.12 po zranění: strach z pohybu, důvěra v návrat, dodržování rehabilitace, identita během zranění | subškály | 0–100 |
| riziko přehlušení, riziko katastrofizace, čtení těla | složená skóre | 0–100 |
| **index kalibrace těla** | index | 0–100; optimum uprostřed osy |
| **index připravenosti k návratu** | index | 0–100; doplňuje, nenahrazuje lékaře |
| vzorec | 11 vzorců | kalibrace, přehlušování, katastrofizace, smíšené čtení, nečitelné tělo, umlčené hlášení, smíšený obraz; po zranění tělo připravené a hlava ne, předčasný návrat, ztráta sebe, připravenost k návratu |
| varovné signály | 9 | otřes mozku dvakrát, opakované otřesy, léky před zápasem, dávkování, dlouhodobá bolest, katastrofizace s bezmocí, strach po povolení návratu, nálada během zranění |

### Spánek a biorytmus

| metrika | typ | hodnota |
|---|---|---|
| **chronotyp** (střed spánku ve volných dnech, opravený) | vypočteno z časů | čas a jedna z pěti kategorií |
| průměrná délka spánku | vypočteno | hodiny |
| **spánkový dluh** | vypočteno | hodiny za týden |
| **sociální jetlag** | vypočteno | hodiny |
| **časový nesoulad** s nejčasnějším tréninkem | vypočteno | hodiny |
| SR.1 až SR.7: preference, potíže se spánkem, denní ospalost, spánek před soutěží, předspánkové nabuzení, návyky, cestovní odolnost | subškály | 0–100 |
| **index spánkového zdraví** | index | 0–100 |
| index předsoutěžního spánku | index | 0–100 |
| vzorec | 9 vzorců | posunutý rytmus, časný rozvrh, chronický dluh, předsoutěžní nespavost, nabuzená hlava, rozházený režim, cestovní zranitelnost, sladěný rytmus, smíšený obraz |
| screening | 5 signálů | možná nespavost, možná apnoe, možné neklidné nohy, velmi krátký spánek, pravidelné prostředky na spaní |

---

## 4. Tým

### Z ELITE 200 (v aplikaci)

| metrika | hodnota |
|---|---|
| pozváno, odevzdáno, započteno | počty; nespolehlivá vyplnění se nezapočítají |
| úroveň oblasti | z rozdělení kádru po pásmech: potřebuje práci · průměrné · silné · špičkové |
| průměr, směrodatná odchylka, minimum, maximum oblasti | |
| rozdělení kádru po pásmech | počet hráčů v každém pásmu |
| zlomová linie | dvě skupiny s mezerou mezi sebou |
| rozptyl | jeden nebo dva lidé daleko od zbytku |
| plošná slabina | slabé skoro všichni a podobně |
| riziko části | čtvrtina kádru v nejnižším pásmu, nebo velký rozchod |
| skryté trhliny | klidná oblast se slabou částí uvnitř |
| opory, priority, zlomy | seznamy oblastí |
| strukturální nálezy | 11 kódů: sebejistá a tichá kabina · trajektorie vyhoření · nálada podle výsledku · pár nese náklad · zlom pod tlakem · zlom v pozornosti · pozornost mizí pod tlakem · tvrdí na sebe · bez opory · křehká identita · vyrovnaný základ |
| málo dat | pod pět započtených vyplnění |

### Z modulů (specifikace)

| metrika | modul | hodnota |
|---|---|---|
| **rozvrh proti kádru** | Spánek | podíl hráčů, pro které je daný čas tréninku biologickou nocí |
| rozložení chronotypů | Spánek | |
| spánkový dluh a sociální jetlag týmu | Spánek | průměry |
| předsoutěžní spánek týmu | Spánek | podíl se špatným spánkem před zápasem |
| **koncentrace odpovědnosti** | Rozhodnost | kolik hráčů bere rozhodující akce |
| klima chyb v týmu | Rozhodnost | průměr a rozptyl |
| tlakový posun týmu | Rozhodnost | průměr |
| **kultura hraní přes bolest** | Tělo | průměr a rozptyl tlaku prostředí |
| **nehlášené otřesy** | Tělo | počet hráčů, nikdy kdo; hlásí se už od jednoho |
| podíl přehlušování | Tělo | |
| screeningové signály | Spánek, Tělo | jen počet, nikdy kdo |

### Návrh

| metrika | zdroj |
|---|---|
| jasnost rolí v týmu | role v týmu (vrstva 2) |
| srovnání mapy týmu mezi sezonami | vrstva 5 |

---

## 5. Vývoj v čase (návrh)

Dnes aplikace neumí porovnat dvě měření téhož člověka. Prahy pro
významnou změnu přitom ve struktuře ELITE 200 jsou (8 bodů hrubého skóre
u oblasti, 4 u fazety), jen se nikde nepoužívají.

| metrika | co říká | poznámka |
|---|---|---|
| změna skóre oblasti a fazety | posun mezi dvěma měřeními | prahy ve struktuře už jsou |
| **spolehlivá změna** | je posun skutečný, nebo šum? | Jacobsonův a Truaxův index spolehlivé změny; potřebuje test-retest reliabilitu z pilotu |
| trend | zlepšuje se, stojí, zhoršuje se | od tří měření |
| změna vzorce | přešel z jednoho vzorce do jiného | u modulů; například ze stažení do rozhodnosti |
| předpověď proti skutečnosti | index připravenosti proti skutečné adaptaci | modul Změna; data zároveň validují modul |
| změna mapy týmu | posun oblastí mezi sezonami | |

Bez téhle vrstvy nemá trenér jak ukázat, že práce zabírá, a my nemáme jak
to prodat.

---

## 6. Kvalita odpovědí (v aplikaci)

| metrika | hodnota | vliv na verdikt |
|---|---|---|
| pozornost | chyby z kontrolních položek | tvrdý |
| infrekvence | počet signálů | tvrdý |
| konzistence | průměrný rozdíl v párech, páry nad 3 | tvrdý |
| tempo | sekundy na položku | tvrdý |
| upřímnost | skóre proti prahům | měkký; nejvýš „opatrně" |
| odpověďový styl | podíl souhlasů, nesouhlasů, krajních odpovědí; nejdelší řada | měkký |
| **verdikt** | v pořádku · opatrně · neplatné | |

Moduly přidávají: rozpor sebeobrazu a vinět (Rozhodnost), věrohodnost časů
spánku (Spánek), rozpor mezi bolestí a hlášeným zraněním (Tělo). Rozpor
není vždy chyba; u Rozhodnosti je to sám o sobě nález.

---

## 7. Kritéria a kvalita nástroje (návrh)

Tahle vrstva není pro trenéra. Je to to, co odlišuje elitní nástroj od
chytře napsaného dotazníku: **měříme, jestli naše metriky předpovídají to,
co tvrdí**. Bez ní zůstanou všechny indexy dobře odůvodněnými hypotézami.

### Co sbírat

| kritérium | co ověřuje | kdo dodá | jak často |
|---|---|---|---|
| hodnocení trenéra: rozhodnost v závěrech, adaptace, koučovatelnost, zvládání tlaku | index váhání, připravenost na změnu, koučovatelnost, selhání pod tlakem | trenér, formulář v aplikaci | dvakrát za sezonu |
| videoanalýza rozhodujících momentů | index váhání | analytik | 10 zápasů |
| minutáž a statistiky v závěrech zápasů | index váhání, dno výkonu | statistiky | průběžně |
| zranění s vynecháním, doba do nahlášení, znovuzranění | kalibrace těla, připravenost k návratu | zdravotní personál | průběžně |
| setrvání v týmu a na univerzitě, studijní způsobilost | připravenost na změnu | trenér nebo agent | semestr |
| data z náramku: délka a načasování spánku | spánkový modul | sportovec | 7 až 14 dní |

**Nejlevnější a nejcennější krok z celého katalogu je formulář hodnocení
trenéra v aplikaci.** Pět otázek, dvakrát za sezonu. Validace potřebuje
čas, takže sbírat se má začít dřív, než jsou moduly hotové.

### Jak měřit sami sebe

| metrika | cíl | dnes |
|---|---|---|
| velikost normativního vzorku podle testu, sportu, věku a pohlaví | aspoň 200 na skupinu | počet celkem se sbírá |
| podíl neplatných a „opatrně" | sledovat trend; nárůst znamená problém s dotazníkem | počítá se u každého vyplnění, nesleduje se souhrnně |
| reliabilita škál (ω) | ≥ 0,70 | nesleduje se |
| test-retest stabilita (ICC) | ≥ 0,70 u rysových škál | nesleduje se |
| prediktivní validita | korelace s kritériem aspoň 0,30 a přínos nad ELITE 200 | nesleduje se |
| invariance napříč jazyky a pohlavím | aspoň metrická | nesleduje se |
| dokončenost a doba vyplnění | | měří se u každého vyplnění |
| přeskakované položky | položka, kterou lidé vynechávají, je špatně napsaná | nesleduje se |

---

## Co z toho plyne pro stavbu

1. **Formulář hodnocení trenéra.** Malá práce, a bez něj se nic z vrstev 2
   a 3 nedá ověřit.
2. **Modul Spánek.** Specifikace je hotová, výstupy se počítají z časů,
   týmový výstup je nejsilnější obchodní argument.
3. **Srovnání v čase** pro ELITE 200. Prahy už jsou, chybí jen obrazovka.
4. **Modul Rozhodnost.**
5. **Specifikace modulu Tlak** (selhání, obnova, dno výkonu). Je to hlavní
   příběh značky, ale potřebuje nové položky a validaci.
6. Moduly Změna a Tělo, podle toho, jak se rozhodne o zdravotních údajích.
7. Doplňky ELITE (emoční strategie, koučovatelnost), modul Rozvoj a role
   v týmu.
