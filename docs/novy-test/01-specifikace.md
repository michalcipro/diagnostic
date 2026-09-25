# Specifikace testu

Pracovní název **ELITE Pro**. Tento dokument je závazné zadání pro psaní
položek a pro experty, kteří budou posuzovat obsahovou validitu. Co tu není
definované, do testu nepatří.

## 1. Zamýšlené použití

**Účel.** Rozvojový profil psychologických předpokladů výkonu sportovce pro
kouče, který s ním pracuje. Odpovídá na otázky: v čem se o sportovce opřít,
kde je rezerva, na co se v práci zaměřit a jak se profil mění v čase.

**Uživatel výsledků.** Kouč nebo sportovní psycholog. Sportovci se výsledky
nezobrazují (výjimkou je týmová větev, kde hráč vidí vlastní výsledek);
kouč s nimi pracuje v rozhovoru.

**Nepřípustná použití.** Musí stát v manuálu, v obchodních podmínkách
a v zápatí reportu:

- výběr, nominace, vyřazení z týmu, rozhodování o smlouvě nebo stipendiu,
- diagnostika duševní poruchy (screening je oddělený a jde jen ke
  zdravotníkovi, viz `02-screening.md`),
- srovnávání sportovců mezi sebou jako podklad pro personální rozhodnutí.

Důvod není jen etický. Validita pro výběr se dokládá jinými důkazy
(prediktivní validita pro konkrétní rozhodnutí, férovost vůči skupinám)
a nikdo ji zatím nedoložil. Tvrdit ji by bylo nepravdivé.

## 2. Populace

| | |
|---|---|
| věk | 14 až 40 let |
| úroveň | výkonnostní sport, juniorské reprezentace a akademie, profesionálové, TOP 100 světového žebříčku |
| sporty | kolektivní i individuální; položky jsou psané pro obojí |
| jazyky | čeština, slovenština, angličtina |

**Skupiny pro analýzu invariance** (test musí měřit totéž napříč nimi):

| skupina | hranice | cílové n v pilotu 2 |
|---|---|---|
| věk | 14–17, 18–24, 25–40 | ≥ 200 v každé |
| pohlaví | žena, muž | ≥ 200 v každém |
| typ sportu | kolektivní, individuální | ≥ 200 v každém |
| jazyk | čeština, slovenština, angličtina | cs a sk ≥ 200; en podle náboru, viz plán validace |
| úroveň | výkonnostní, junior a akademie, profesionál, TOP 100 | popisně; TOP 100 bude mít desítky lidí |

**TOP 100.** Skupina je pro test nejzajímavější a nejmenší. Počítá se s ní
jako se známou skupinou: očekávání (například nižší přeřízení a vyšší
sebeřízené učení než u výkonnostních sportovců) se předregistrují a ověřují
jako doklad validity. Vlastní normy pro ni nevzniknou, na to nebude dost lidí.

**Čtenost pro čtrnáctileté.** Každá položka:

- nejvýš 15 slov, jedna myšlenka, žádné „a zároveň“,
- přítomný čas a první osoba, bez rodu („Před důležitým zápasem mám
  sevřený žaludek.“); minulý čas se v češtině a slovenštině liší podle rodu,
  proto se nepoužívá,
- bez záporu v položce; obrácené položky mají opačný obsah, ne „ne“,
- bez odborných slov (aktivace, regulace, kognitivní), bez anglicismů, které
  čtrnáctiletý nemusí znát,
- ověřená v kognitivních rozhovorech i se čtrnácti a patnáctiletými.

**Souhlas.** Do 18 let souhlas zákonného zástupce a souhlas sportovce; od
16 let zvlášť souhlas se screeningem. Konkrétní věkové hranice pro souhlas
se zpracováním údajů posoudí právník (GDPR, zákon č. 110/2019 Sb.,
zdravotní údaje ve screeningu).

## 3. Časový rozpočet

Strop 45 minut. Cíl pro hotový test 35 až 40 minut, aby se pomalejší čtenář
vešel do stropu.

| část | rozsah | odhad času |
|---|---|---|
| úvod a instrukce | 3 obrazovky | 2 min |
| kontext: sport, úroveň, pozice, zranění za poslední rok, fáze sezony | 10 otázek | 2 min |
| sebeposouzení | 144 položek (36 škál po 4) | 21 min při 7 položkách za minutu |
| situační úsudek | 12 vinět po 4 reakcích | 8 min při 40 s na vinětu |
| chronotyp (volné a pracovní dny, časy spánku) | 6 otázek | 1,5 min |
| kontrola spolehlivosti vyplnění | 5 položek | 0,5 min |
| screening (jen 16+, dobrovolný) | 10 položek | 1,5 min |
| **celkem** | | **36,5 min** |

Tempo 7 položek za minutu je střízlivý předpoklad pro krátké položky
s pěti body. Ověří se na skutečných časech z pilotu 1; kdyby medián překročil
40 minut, krátí se nejdřív počet položek u škál s nejvyšší reliabilitou.

**Vývojové verze.** Pilotní verze obsahují navíc kotvy. Aby se vešly do
45 minut, každý respondent dostane jen část kotev (plánovaně chybějící data,
viz `04-plan-validace.md`). Retest se spojuje s druhým blokem kotev.

## 4. Formáty

| formát | kde | odpovědi | proč |
|---|---|---|---|
| **souhlas** | rysové škály | 5 bodů, každý pojmenovaný: vůbec nesouhlasím, spíš nesouhlasím, ani tak ani tak, spíš souhlasím, úplně souhlasím | shodný s ELITE 200, známý z aplikace |
| **četnost** | chování a strategie (dovednosti, zotavení) | 5 bodů: téměř nikdy, zřídka, občas, často, téměř vždy | u chování je četnost jednoznačnější než souhlas |
| **situační úsudek** | tlak, rozhodování, návrat po chybě, komunikace | krátká situace, 4 možné reakce, u každé „jak pravděpodobně bys to udělal“ na 5 bodech | zachytí, co člověk udělá, ne jak se vidí; hodnotí se všechny reakce, ne jen jedna volba |
| **časy** | chronotyp | hodiny a minuty | výpočet středu spánku podle MCTQ, jak je popsaný v modulu Rytmus |

**Časový rámec.** Rysové škály bez časového rámce („obvykle“). Stavové škály
(vyčerpání, zotavení, spánek, screening) za posledních 4 týdnů, screening
podle originálu. Rámec je vždy v instrukci bloku, ne v každé položce.

**Situační úsudek: rod.** Viněty jsou ve druhé osobě a v přítomném čase
(„Je poslední minuta, prohráváte o gól a míč máš ty.“). Otázka „jak
pravděpodobně bys to udělal“ nese rod; v aplikaci se řeší stávajícím
mechanismem `{mužský|ženský}`, v bance položek je zapsaná s ním.

**Klíč vinět** vzniká dvakrát: odborný (shoda aspoň 6 z 8 expertů na tom,
která reakce je účinnější) a empirický (která reakce souvisí s hodnocením
trenéra v pilotu 2). Do hotového testu jdou jen reakce, kde se oba klíče
shodnou.

## 5. Škály

36 škál v pěti doménách, v hotovém testu po 4 položkách. Každá škála má
definici, vymezení vůči tomu, co není (pro diskriminační validitu), kotvu
a rámec. **Definice jsou závazné:** položka, která měří něco jiného než
definici, se vyřazuje, i když se statisticky chová dobře.

Značení: `P` souhlas, `Č` četnost, `rys` bez časového rámce, `4t` posledních
4 týdnů. Obrácené položky: v každé škále aspoň jedna ze čtyř, pokud to
obsah dovolí.

### Doména MO: Motivace a identita

| kód | škála | definice | není | kotva | formát |
|---|---|---|---|---|---|
| MO.1 | autonomní motivace | sport dělám, protože mě baví a protože jeho cíle považuji za svoje | spokojenost s výsledky; nadšení z konkrétní sezony | SMS-II: vnitřní, integrovaná, identifikovaná regulace | P, rys |
| MO.2 | kontrolovaná motivace | sport dělám kvůli tlaku zvenku (odměny, očekávání druhých) nebo zevnitř (vina, stud, potřeba si něco dokazovat) | vysoké nároky na sebe (to je DO.9) | SMS-II: introjekovaná a vnější regulace | P, rys |
| MO.3 | úkolová orientace | úspěch poznávám podle toho, že se zlepšuji a zvládám úkol | radost ze sportu (MO.1) | TEOSQ: úkolová | P, rys |
| MO.4 | egová orientace | úspěch poznávám podle toho, že jsem lepší než druzí | soutěživost jako chuť vyhrát v zápase | TEOSQ: egová | P, rys |
| MO.5 | výlučnost sportovní identity | kdo jsem, stojí téměř jen na sportu | nasazení a čas věnovaný sportu | AIMS | P, rys |

Poznámka: zatímco MO.3 a MO.4 se v literatuře chovají jako nezávislé, MO.1
a MO.2 bývají mírně záporně korelované. Obě dvojice se ověřují zvlášť, ne
jako jeden bipolární rozměr.

### Doména TL: Tlak

Jádro testu a místo, kde se test může nejvíc odlišit.

| kód | škála | definice | není | kotva | formát |
|---|---|---|---|---|---|
| TL.1 | tělesné napětí | před soutěží a v ní se ozývá tělo: svalové napětí, žaludek, dech, srdce | fyzická únava | SAS-2: somatická úzkost | P, rys |
| TL.2 | starosti | před soutěží a v ní se opakovaně vracejí myšlenky, že to nedopadne | analytická příprava na soupeře | SAS-2: starosti | P, rys |
| TL.3 | narušení soustředění | pod tlakem pozornost utíká od úkolu k obavám a k tomu, co si myslí druzí | obecná roztěkanost mimo soutěž | SAS-2: narušení koncentrace | P, rys |
| TL.4 | výklad napětí | napětí před výkonem beru jako užitečné a nabuzující | nízké napětí (to je TL.1); škála se čte spolu s TL.1 | škála směru (Jones a Swain) | P, rys |
| TL.5 | obava ze studu a zklamání | selhání znamená, že se ztrapním nebo zklamu lidi, na kterých mi záleží | obecná úzkost (TL.2) | PFAI: stud a zklamání blízkých | P, rys |
| TL.6 | přeřízení pohybu | pod tlakem začnu vědomě hlídat a řídit pohyb, který jinak jde sám | pečlivá technická práce v tréninku | MSRS: vědomé řízení pohybu | P, rys |
| TL.7 | přeřízení rozhodování | pod tlakem rozhodnutí rozebírám a zdržuji a po chybě se k nim v hlavě vracím | pečlivá příprava taktiky před zápasem | DSRS | P, rys |
| TL.8 | perfekcionistické obavy | chyba je pro mě měřítko vlastní hodnoty a bojím se, jak ji přijmou druzí | vysoké nároky (DO.9) | Sport-MPS-2: obavy z chyb, vnímaný tlak rodičů a trenéra | P, rys |
| TL.9 | výzva, nebo hrozba | důležitou soutěž vnímám spíš jako příležitost, na kterou mám, než jako ohrožení | sebevědomí obecně | teorie výzvy a hrozby (Jones, Meijen, McCarthy, Sheffield) | P, rys |

Viněty tlaku (TL.V, 4 viněty): rozhodující moment, výkon před důležitými
lidmi, vedení, které se ztrácí, penalta nebo obdobná situace jeden na jednoho.

### Doména DO: Dovednosti a seberegulace

| kód | škála | definice | není | kotva | formát |
|---|---|---|---|---|---|
| DO.1 | práce s cíli | stanovuji si konkrétní cíle na trénink i soutěž a vyhodnocuji je | ambice (MO.1, DO.9) | TOPS 2: cíle | Č, rys |
| DO.2 | představivost | výkon si předem přehrávám v představách, včetně obtížných situací | denní snění | TOPS 2: představivost | Č, rys |
| DO.3 | vnitřní řeč | záměrně si říkám věty, které mě vedou a nabudí | kritické myšlenky (ty jsou v TL.2, TL.8) | TOPS 2: vnitřní řeč | Č, rys |
| DO.4 | řízení aktivace | umím se před výkonem záměrně zklidnit i nabudit podle potřeby | nízké napětí; jen relaxace | TOPS 2: aktivace a relaxace | Č, rys |
| DO.5 | návrat do přítomnosti | po rušivém momentu (chyba, rozhodčí, publikum) vracím pozornost k další akci | dlouhodobá soustředěnost | TOPS 2: pozornost | Č, rys |
| DO.6 | přerámování | na nepříjemnou situaci se umím podívat jinak, aby mě méně brzdila | pozitivní naladění obecně | ERQ: přehodnocení | Č, rys |
| DO.7 | potlačení | emoce skrývám a nedávám najevo, co se ve mně děje | klid (chybějící emoce) | ERQ: potlačení | Č, rys |
| DO.8 | sebeřízené učení | plánuji, co chci zlepšit, sleduji to a po tréninku vyhodnocuji | poslušnost vůči trenérovi | SRL-SRS: plánování, sebereflexe, hodnocení | Č, rys |
| DO.9 | vysoké nároky | stanovuji si náročné standardy a jdu za nimi | obava z chyb (TL.8) | Sport-MPS-2: osobní standardy | P, rys |
| DO.10 | laskavost k sobě po chybě | po chybě se k sobě chovám věcně a vlídně, ne sebetrestajícím způsobem | snížené nároky; výmluvy | SCS-SF: laskavost k sobě, sebeodsuzování (obráceně) | P, rys |

Viněty návratu po chybě (DO.V, 4 viněty): vlastní chyba s následkem
(inkasovaný gól, pád), chyba v úvodu, série chyb, veřejná kritika po chybě.

### Doména OD: Odolnost, zátěž a zotavení

| kód | škála | definice | není | kotva | formát |
|---|---|---|---|---|---|
| OD.1 | mentální odolnost | výkon a nasazení držím i v nepříznivých podmínkách a pod tlakem | fyzická zdatnost; sebevědomí | MTI | P, rys |
| OD.2 | zotavení ze stresu | po náročném období se rychle vrátím do normálu | nepřítomnost stresu | BRS | P, rys |
| OD.3 | vyčerpání | tréninky a soutěže mě vyčerpávají víc, než stačím dobrat | krátkodobá únava po výkonu | ABQ: vyčerpání | P, 4t |
| OD.4 | pokles pocitu úspěchu | mám pocit, že se nezlepšuji a nic nedokážu | objektivní výsledky | ABQ: snížený pocit úspěchu | P, 4t |
| OD.5 | ztráta vztahu ke sportu | na sportu mi přestává záležet | vztah k trenérovi (VZ.1) | ABQ: znehodnocení sportu | P, 4t |
| OD.6 | zotavení | mám dost spánku, odpočinku a času mimo sport, abych se dobil | kvalita spánku samotná (OD.7) | SRSS/ARSS: zotavení | Č, 4t |
| OD.7 | spánek | usínám bez potíží, spím dost a ráno se cítím odpočatě | chronotyp (ten se neboduje, počítá) | ASSQ; chronotyp MCTQ | Č, 4t |

### Doména VZ: Vztahy a tým

| kód | škála | definice | není | kotva | formát |
|---|---|---|---|---|---|
| VZ.1 | vztah s trenérem | s trenérem si věříme, jsme zavázaní spolupráci a doplňujeme se | spokojenost s výsledky | CART-Q | P, rys |
| VZ.2 | koučovatelnost | zpětnou vazbu vyhledávám, přijímám a převádím do práce | poslušnost; souhlas se vším | vlastní konstrukt; kritérium hodnocení trenéra (koucovatelnost) | P, rys |
| VZ.3 | otevřenost | o problémech a nepříjemných věcech mluvím včas a přímo | společenskost | vlastní konstrukt; kritérium hodnocení trenéra (komunikace) | P, rys |
| VZ.4 | úkolová soudržnost | v týmu (nebo v realizačním týmu) táhneme za jeden provaz k výkonu | přátelství mimo sport | GEQ: úkolová soudržnost | P, rys |
| VZ.5 | psychologické bezpečí | v týmu se dá riskovat, přiznat chybu a nesouhlasit bez trestu | celková spokojenost v týmu | Edmondson; sportovní adaptace ověřit | P, rys |

U individuálních sportů se VZ.4 a VZ.5 vztahují k realizačnímu týmu
(trenér, kondiční trenér, fyzioterapeut, tréninková skupina). Instrukce bloku
to vysvětluje; invariance mezi kolektivními a individuálními sporty se u
těchto dvou škál ověřuje zvlášť pečlivě.

Viněty komunikace (VZ.V, 4 viněty): nesouhlas s rolí, spoluhráč opakovaně
chybuje, bolest, o které trenér neví, konflikt v kabině nebo ve skupině.

### Kontrola spolehlivosti vyplnění

| prvek | počet | co zachytí |
|---|---|---|
| instruované položky („u této položky zvol ‚spíš nesouhlasím‘“) | 2 | nečtení |
| nepravděpodobné položky („Každou noc spím přes 14 hodin.“) | 3 | náhodné odpovídání |
| čas na položku | – | medián pod 2 s |
| dlouhé řady stejné odpovědi | – | výplň bez čtení |
| dvojice s opačným obsahem | – | nekonzistence |

Pravidla vyřazení se předregistrují před pilotem 1 a jsou stejná jako
v ELITE 200, kde to jde.

## 6. Rozpočet položek

| | škál | ve finále | v bance | násobek |
|---|---|---|---|---|
| sebeposouzení | 36 | 144 | 432 (12 na škálu) | 3 |
| viněty | 3 skupiny | 12 | 36 (12 na skupinu) | 3 |
| kontrola vyplnění | | 5 | 10 | 2 |
| **celkem** | | **161** | **478** | |

12 kandidátů na škálu: aspoň 3 obrácené, aspoň 3 zaměřené na chování
v soutěži (ne jen na postoje). Banka vzniká souběžně ve třech jazycích podle
pravidel ITC (`04-plan-validace.md`), ne překladem hotové české verze.

## 7. Indexy

Uživatel původně chtěl indexy typu „selhání pod tlakem“ a „obnova po chybě“.
V testu budou, ale až jako výsledek analýzy, ne předem:

| index | z čeho se skládá (hypotéza) | jak se ověří |
|---|---|---|
| výkon pod tlakem | TL.1 až TL.9, DO.4, DO.5, viněty tlaku | druhořadý faktor v konfirmační analýze; predikce položky „výkon v důležitých momentech“ z hodnocení trenéra |
| návrat po chybě | DO.5, DO.10, TL.7, TL.8, viněty návratu | predikce položky „návrat po chybě“ z hodnocení trenéra |
| rozhodnost | TL.7, TL.9, viněty tlaku | predikce položky „rozhodnost v závěrech“ |
| riziko přetížení | OD.3 až OD.7 | predikce zranění a nemocí za sezonu, změna v čase |
| koučovatelnost | VZ.2, VZ.3, DO.8 | predikce položky „práce se zpětnou vazbou“ |

Váhy indexů se nestanoví odhadem. Buď vyjdou ze struktury (druhořadý faktor),
nebo se odhadnou na kritériu v pilotu 2 a **ověří na nezávislém vzorku**.
Index, který neprojde, se v reportu neobjeví.

Samostatné moduly (Rozhodnost, Změna, Tělo, Rytmus v `../moduly/`) zůstávají
samostatné. Jejich položky vstupují do banky jako kandidáti pro odpovídající
škály (TL.7, OD.6, OD.7), ne jako hotové škály.

## 8. Report

- **Kouči:** profil 36 škál ve srovnání s normou (po fázi 8; do té doby
  poctivě bez percentilů), indexy, které prošly, silné stránky, rezervy,
  doporučení pro práci a shrnutí pro sportovce ve druhé osobě, stejně jako
  u stávajících testů.
- **Změna v čase:** index spolehlivé změny (Jacobson a Truax), aby kouč
  nevykládal šum jako zlepšení.
- **Nejistota:** u každé škály interval podle reliability, ne jen bod.
- **Screening v reportu kouče není** v žádné podobě, ani jako informace, že
  byl vyplněn.
