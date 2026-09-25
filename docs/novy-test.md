# Nový test: základ

Pracovní název **ELITE Pro**. Úplně nový test, ne rozšíření ELITE 200 ani
přílepkové moduly. Cíl: nejvyšší doložitelná kvalita, postavená na
konstruktech a nástrojích, které mají ve světové literatuře nejsilnější
oporu.

Tenhle dokument je základ: co měřit, o co se opřít, jak to postavit a jak
doložit, že to funguje. Položky se píšou až po rozhodnutích na konci.

---

## Nejdřív dvě věci, na kterých stojí všechno ostatní

### 1. Validita se nepřenáší inspirací

Dosavadní návrhy (moduly v `docs/moduly`) mají vlastní položky „inspirované"
zavedenými nástroji. To je legitimní postup, ale **validita se tím
nepřenáší**. Validita nepatří konstruktu ani studii, ze které jsme se
inspirovali. Patří **konkrétnímu nástroji, použitému konkrétním způsobem, na
konkrétní populaci**. Když napíšeme vlastní položky podle SAS-2, máme nový
nástroj s nulovými doklady, dokud je nenasbíráme.

K validitě nejlepších studií se dá dostat jen dvěma způsoby: použít jejich
nástroje v originále (s licencí a s ověřeným překladem), nebo postavit vlastní
nástroj a doložit, že měří totéž jako ony a predikuje aspoň tak dobře. Níž
navrhuju kombinaci obojího.

### 2. Absolutní validita neexistuje. Existuje doložená validita

Podle *Standards for Educational and Psychological Testing* (AERA, APA, NCME,
2014), které jsou pro testování autoritativním rámcem, validita není
vlastnost testu, kterou test buď má, nebo nemá. Je to **míra, do jaké doklady
podporují konkrétní výklad skóre pro konkrétní použití**. Doklady jsou pěti
druhů:

| zdroj dokladu | otázka | jak se získá |
|---|---|---|
| obsah testu | Pokrývají položky konstrukt, a nic jiného? | definice konstruktů, posouzení experty |
| proces odpovídání | Rozumí respondenti položkám tak, jak mají? | kognitivní rozhovory |
| vnitřní struktura | Drží se škály pohromadě a oddělují se od sebe? | faktorová analýza, IRT, reliabilita, invariance |
| vztahy k jiným proměnným | Koreluje to s tím, s čím má, a nekoreluje s tím, s čím nemá? Predikuje to výkon? | srovnávací nástroje, hodnocení trenérů, výkonová data |
| důsledky použití | Pomáhá to rozhodovat lépe, a neškodí? | sledování, jak se výsledky používají |

**Nejvyšší dosažitelný stav** je: doklady ze všech pěti zdrojů, nezávislé
posouzení podle EFPA Test Review Model (verze 2025) a publikace v recenzovaném
časopise. To mají nejlepší nástroje na světě a to je realistický a
obhajitelný cíl. „Absolutní validitu" by mohl slibovat jen marketing a
odborník na americké univerzitě by ho za to shodil.

---

## Tři cesty

| cesta | co to je | validita | výhody | nevýhody |
|---|---|---|---|---|
| **A. Baterie originálů** | zavedené nástroje v originálním znění, přeložené podle mezinárodních pravidel | převzatá z literatury pro původní jazyk; překlad je potřeba ověřit zvlášť | nejrychlejší cesta k citovatelné validitě | licence pro komerční použití u každého nástroje zvlášť, některé nejsou k mání; 300 a víc položek; nejednotný formát; nevlastníte nic |
| **B. Vlastní nástroj** | nové položky na konstruktech nejlepších modelů, plný vývojový proces | musí se vybudovat od nuly | vlastníte celé duševní vlastnictví; jednotný formát; krátký | 18 až 24 měsíců; tisíce respondentů; nulová validita, dokud se nedoloží |
| **C. Kombinace** (doporučuju) | vlastní nástroj podle B, ale během vývoje se vedle něj zadávají originály z A jako **kotvy** | vlastní, ale doložená přímým srovnáním se zlatým standardem na stejných lidech | vlastníte ho; můžete doložit, že měří totéž co nejlepší nástroje a predikuje aspoň stejně; kotvy stačí licencovat pro výzkum, což bývá snazší než pro komerční použití | stejně náročné jako B, plus licence kotev |

Cesta C je způsob, jakým vznikají profesionální komerční testy. Výsledek je
test, který je váš, a přitom se o každé jeho škále dá říct něco jako
(čísla jsou jen pro ilustraci): „Na 800 sportovcích koreluje se SAS-2
r = 0,78 a predikuje výkon pod tlakem lépe než on."

---

## Konstrukční matice

Co nový test měří, proč, a o jaký nejsilnější nástroj se každý konstrukt
opírá. Sloupec **licence** a **česká verze** jsou ověřené jen tam, kde je to
výslovně uvedené; zbytek je potřeba prověřit u autorů a v českých databázích
(ideálně s akademickým partnerem, viz rozhodnutí).

### Doména 1: Motivace a identita

| konstrukt | proč predikuje výkon | kotva | poznámka k dokladům | licence | česká verze |
|---|---|---|---|---|---|
| kvalita motivace (kontinuum regulace) | vnitřní a identifikovaná regulace chrání před vyhořením a odchodem ze sportu; vnější a introjekovaná je zvyšují | **SMS-II** (Pelletier a kol., 2013), 18 položek | teorie sebedeterminace patří k nejlépe doloženým motivačním teoriím | ověřit | ověřit |
| orientace cílů | úkolová orientace souvisí s vytrvalostí a zvládáním neúspěchu; egová s nízkou vnímanou kompetencí s úzkostí | **TEOSQ** (Duda a Nicholls, 1992), 13 položek | jeden z nejcitovanějších motivačních dotazníků ve sportu | ověřit | nedohledána (existuje polská) |
| sportovní identita | výlučná sportovní identita zhoršuje zvládání zranění, ztráty role a konce kariéry | **AIMS** (Brewer, Van Raalte a Linder, 1993), 7 položek | široce používaná | ověřit | ověřit |
| motivační klima (prostředí) | prostředí trestající chyby vyrábí úzkost a vyhýbání | **PMCSQ-2** (Newton, Duda a Yin, 2000) nebo **EDMCQ-C** (Appleton a kol., 2016) | měří prostředí, ne sportovce | ověřit | ověřit |

### Doména 2: Tlak

Jádro testu. Tady je literatura nejsilnější a tady se nový test může nejvíc
odlišit.

| konstrukt | proč predikuje výkon | kotva | poznámka k dokladům | licence | česká verze |
|---|---|---|---|---|---|
| sportovní úzkost jako rys: somatická, starosti, narušení koncentrace | tři složky mají různé dopady a různou léčbu | **SAS-2** (Smith, Smoll, Cumming a Grossbard, 2006), 15 položek | **ověřeno:** faktorová struktura replikovaná ve všech věkových skupinách od 9 let, predikuje stav před soutěží, citlivá na intervence | ověřit | nedohledána (existuje polská) |
| výklad úzkosti | stejná intenzita úzkosti pomáhá, nebo škodí podle toho, jak ji sportovec vykládá | škála směru (Jones a Swain, 1992) připojená k SAS-2 | směr predikuje výkon lépe než samotná intenzita | ověřit | ověřit |
| obavy ze selhání | pět obav (stud, znehodnocení sebe, nejistá budoucnost, ztráta zájmu blízkých, zklamání blízkých) se liší spouštěčem | **PFAI** (Conroy, Willow a Metzler, 2002), 25 položek, krátká verze 5 | hierarchická struktura, dobře doložená | ověřit | ověřit |
| **přeřízení pohybu** (cesta A selhání) | pod tlakem vědomé řízení zautomatizovaného pohybu rozbije provedení | **MSRS** (Masters, Eves a Maxwell, 2005), 10 položek | **ověřeno:** doložená prediktivní validita v terénu, vyšší skóre souvisí s horším výkonem pod tlakem | ověřit | ověřit |
| **přeřízení rozhodování** (cesta B selhání a váhání) | dumání nad rozhodnutími zhoršuje rozhodování pod tlakem | **DSRS** (Kinrade, Jackson, Ashford a Bishop, 2010) | navazuje na MSRS, méně replikací | ověřit | ověřit |
| perfekcionismus: nároky a obavy | obavy (ne nároky) predikují úzkost a selhání pod tlakem | **Sport-MPS-2** (Gotwals a Dunn, 2009) | rozlišení nároků a obav je jedno z nejlépe doložených zjištění v oboru | ověřit | ověřit |
| výzva, nebo hrozba | poměr vnímaných zdrojů a nároků predikuje výkon i fyziologickou reakci | hodnocení nároků a zdrojů v tradici Tomaky a Blascovicha; teorie výzvy a hrozby u sportovců (Jones, Meijen, McCarthy a Sheffield, 2009) | měří se spíš jako stav před konkrétní soutěží | volné | vlastní překlad |

### Doména 3: Dovednosti a seberegulace

| konstrukt | proč predikuje výkon | kotva | poznámka k dokladům | licence | česká verze |
|---|---|---|---|---|---|
| psychologické strategie v tréninku a v soutěži: cíle, představivost, vnitřní řeč, aktivace, relaxace, pozornost, emoce, automatičnost, negativní myšlení | nejširší ověřená mapa dovedností, které se dají trénovat | **TOPS 2** (Hardy, Roberts, Thomas a Murphy, 2010), 64 položek, existuje krátká verze | **ověřeno:** struktura zpřesněná konfirmační faktorovou analýzou | **ověřit u autorů** | ověřit |
| sebeřízené učení | odlišuje elitní mládež od neelitní při srovnatelných dovednostech | **SRL-SRS** (Toering a kol., 2012) | ověřeno na elitní fotbalové mládeži | ověřit | ověřit |
| emoční regulace: přerámování a potlačení | přerámování je levné a funguje; potlačení stojí kapacitu a zhoršuje výkon | **ERQ** (Gross a John, 2003), 10 položek | jeden z nejpoužívanějších nástrojů emoční regulace | pro výzkum volně; komerčně ověřit | ověřit |
| sebesoucit | rychlejší návrat po chybě bez snížení nároků | **SCS-SF** (Raes a kol., 2011), 12 položek | struktura celkového skóre je sporná; používat složky | ověřit | ověřit |
| souhrnné psychologické charakteristiky rozvoje talentu | predikují, kdo z talentů se dostane dál | **PCDEQ2** (Hill, MacNamara, Collins a Rodgers, 2019), 88 položek, 7 faktorů | **ověřeno:** vyvinutý na 512 sportovcích akademií, správně zařadil 72,9 % podle úrovně; americká verze má 8 faktorů | ověřit | ověřit |

### Doména 4: Odolnost, zátěž a zotavení

| konstrukt | proč predikuje výkon | kotva | poznámka k dokladům | licence | česká verze |
|---|---|---|---|---|---|
| mentální odolnost | souvisí s výkonem, postupem k cílům a prosperitou pod stresem | **MTI** (Gucciardi, Hanton, Gordon, Mallett a Temby, 2015), 8 položek, jednodimenzionální | **ověřeno:** vznikl jako odpověď na to, že struktura MTQ48 se nepotvrdila | ověřit | ověřit |
| odolnost (zotavení ze stresu) | schopnost vrátit se po zátěži | **BRS** (Smith a kol., 2008), 6 položek | krátký, široce používaný | ověřit | ověřit |
| vyhoření: vyčerpání, pokles pocitu úspěchu, znehodnocení sportu | pořadí složek umožňuje zachytit vyhoření včas | **ABQ** (Raedeke a Smith, 2001), 15 položek | standard pro sportovce | ověřit | ověřit |
| zátěž a zotavení | nerovnováha předchází přetížení a nemoci | **SRSS / ARSS** (Kellmann a Kölling) | krátké verze tradice RESTQ-Sport | ověřit | ověřit |
| spánek | spánek pod 8 hodin souvisí u mladých sportovců se zraněními | **ASSQ** (Samuels a kol., 2016) a chronotyp podle **MCTQ** (Roenneberg a kol., 2003) | ASSQ je screening vyvinutý pro sportovce | ověřit | ověřit |

### Doména 5: Vztahy a tým

| konstrukt | proč predikuje výkon | kotva | poznámka k dokladům | licence | česká verze |
|---|---|---|---|---|---|
| vztah s trenérem: blízkost, závazek, doplňování | predikuje spokojenost, motivaci a výkon | **CART-Q** (Jowett a Ntoumanis, 2004), 11 položek | standard pro vztah trenér–sportovec | ověřit | ověřit |
| soudržnost týmu | úkolová soudržnost souvisí s výkonem týmu | **GEQ** (Carron, Widmeyer a Brawley, 1985), 18 položek | široce používaný, struktura se ne vždy replikuje | ověřit | ověřit |
| kolektivní účinnost | víra týmu, že to zvládne, predikuje týmový výkon | **CEQS** (Short, Sullivan a Feltz, 2005) | | ověřit | ověřit |
| psychologické bezpečí v týmu | bez něj se nepříjemné věci neříkají nahlas | Edmondson (1999); sportovní adaptace ověřit | původně z pracovních týmů | ověřit | ověřit |

### Doména 6: Duševní zdraví (volitelný screening)

| konstrukt | kotva | poznámka | licence |
|---|---|---|---|
| psychická zátěž sportovce | **APSQ**, 10 položek, první krok **IOC SMHAT-1** (Gouttebarge a kol., 2021) | **ověřeno:** oficiální nástroj Mezinárodního olympijského výboru; skóre 17 a víc vede k druhému kroku screeningu | **ověřeno:** volně dostupný |

Tím se test řadí vedle světového standardu péče o elitní sportovce. Zároveň
se tím stává zdravotním screeningem se vším, co k tomu patří (souhlas,
předání odborníkovi, odpovědnost).

### Kontrolní kotvy pro diskriminační validitu

| kotva | proč | licence |
|---|---|---|
| **IPIP** (Goldberg), položky pěti velkých faktorů osobnosti | musíme doložit, že naše škály nejsou jen neuroticismus nebo svědomitost jiným jazykem; přesně na tomhle neobstál grit | **veřejně dostupné (public domain)** |

### Co do testu záměrně nedávám

| nástroj | proč ne |
|---|---|
| **MTQ48** (mentální odolnost) | **ověřeno:** čtyř- ani šestifaktorová struktura se na 686 sportovcích a 639 zaměstnancích nepotvrdila (Gucciardi, Hanton a Mallett, 2012); místo něj MTI |
| **Grit-S** | metaanalýza (Credé a kol., 2017): z velké části překrývá svědomitost a málo přidává |
| **TAIS** (Nideffer) | faktorová struktura dlouhodobě neobstojí |
| **CD-RISC** | **ověřeno:** proprietární, vyžaduje licenční smlouvu; stejný konstrukt pokryje BRS a MTI |

---

## Matice metod

Tohle je „matice" v přesném odborném smyslu a pro validitu nejdůležitější
nástroj, který existuje: **matice více rysů a více metod** (Campbell a Fiske,
1959). Každý klíčový konstrukt se měří aspoň třemi různými metodami. Když
škála opravdu měří to, co tvrdí, pak:

1. **stejný rys různými metodami** koreluje vysoko (konvergentní validita),
2. a to víc než **různé rysy stejnou metodou** (kdyby ne, měříme jen styl
   odpovídání),
3. a nejmíň koreluje **různý rys různou metodou**.

Metody pro nový test:

| metoda | co zachytí | kde |
|---|---|---|
| **sebeposouzení** | jak se sportovec vidí | všechny konstrukty |
| **situační úsudek** (viněty) | co udělá v konkrétní chvíli | tlak, rozhodování, obnova po chybě |
| **hodnocení trenéra** | jak ho vidí ten, kdo ho vede | tlak, koučovatelnost, rozhodnost, odolnost |
| **objektivní data** | co se skutečně stalo | spánek z náramku, zranění, minutáž, statistiky v závěrech |

Ukázka očekávaného vzoru pro tři rysy z domény tlaku:

| | úzkost · sebe | přeřízení · sebe | obavy · sebe | úzkost · trenér | přeřízení · viněty |
|---|---|---|---|---|---|
| úzkost · sebe | reliabilita | střední | střední | **vysoká** | nízká |
| přeřízení · sebe | | reliabilita | střední | nízká | **vysoká** |

Tučné jsou buňky, které rozhodují: stejný rys jinou metodou. Když nevyjdou,
škála neprojde, bez ohledu na to, jak hezky vypadá její reliabilita.

---

## Postup vývoje a validace

Podle Standards (AERA, APA, NCME, 2014), metodiky COSMIN, pravidel ITC pro
překlad a adaptaci testů (2017) a EFPA Test Review Model (2025).

| fáze | co | vzorek | kritérium pro postup | orientačně |
|---|---|---|---|---|
| **0. Rámec** | přesné definice konstruktů, zamýšlené použití, specifikace testu; licence kotev; schválení etickou komisí | – | definice schválené dvěma nezávislými experty | 2 měsíce |
| **1. Banka položek** | 3 až 4krát víc položek, než bude ve finále; formáty podle metody | – | každá položka zařazená ke konstruktu | 2 měsíce |
| **2. Obsahová validita** | posouzení experty (index obsahové validity), kognitivní rozhovory v každém jazyce | 6 až 8 expertů; 10 až 15 sportovců na jazyk | index obsahové validity položky ≥ 0,78; vyřadit, co se čte jinak | 2 měsíce |
| **3. Překlady** | čeština, slovenština, angličtina podle ITC: dva nezávislé překlady, zpětný překlad, komise, předtest | – | shoda komise | souběžně s 2 |
| **4. Pilot 1: struktura** | explorační faktorová analýza, analýza položek, IRT; položky v blocích, aby dotazník nebyl dlouhý | 500 až 600 | jasná struktura, vyřazení slabých položek | 3 měsíce |
| **5. Pilot 2: potvrzení** | konfirmační analýza na nezávislém vzorku; reliabilita; invariance mezi jazyky, pohlavími a typy sportu; kotvy a matice metod | **≥ 7× počet položek a aspoň 100** podle COSMIN, pro test o 120 položkách zhruba 850 | reliabilita ω ≥ 0,80 pro profil, ≥ 0,90 pro rozhodnutí o jednotlivci; aspoň metrická invariance; konvergence s kotvami | 4 měsíce |
| **6. Stabilita** | test-retest po 2 až 4 týdnech | ≥ 100 | stabilita rysových škál (ICC) ≥ 0,70 | souběžně s 5 |
| **7. Prediktivní validita** | prospektivně jednu sezonu: hodnocení trenéra, výkon pod tlakem, zranění, setrvání, vyhoření | 300 a víc s daty od trenérů | predikce kritéria a **přínos nad kotvami a nad osobností** | 6 až 9 měsíců |
| **8. Normy a prahy** | stratifikované normy podle věku, pohlaví, úrovně a sportu; prahy navázané na kritéria, ne odhadnuté | průběžně | reprezentativnost podle EFPA | průběžně |
| **9. Nezávislé posouzení** | recenze podle EFPA, publikace v recenzovaném časopise, manuál | – | – | po fázi 7 |

**Celkem 18 až 24 měsíců a zhruba 1500 až 2000 sportovců**, z toho aspoň
300 s hodnocením od trenérů a daty za celou sezonu. Tohle je cena validity.
Zkrátit se dá jen tím, že se sníží nárok, a pak to má být vidět v tom, co se
o testu tvrdí.

Hlavní náklady: licence kotev pro výzkumnou fázi, odměny expertům
a překladatelům, sběr dat (přístup k týmům a akademiím), statistická analýza
(konfirmační analýza, IRT a invariance nejsou práce pro začátečníka), etická
komise.

---

## Co s tím, co už máme

| co | role v novém testu |
|---|---|
| **ELITE 200** | zůstává v provozu. Jeho data a normativní vzorek jsou cenné: ELITE 200 se ve vývoji zadá jako další srovnávací nástroj a nový test ho po doložení validity může nahradit |
| **specifikace modulů** | jejich konstrukty jsou v matici (spánek, tělo, změna, rozhodování); jejich položky vstupují do banky jako kandidáti, ne jako hotové škály |
| **aplikace** | vyplňování, validita, reporty a týmová větev se dají použít beze změny architektury; nový test je jen další test v systému |
| **formulář hodnocení trenéra** | z katalogu metrik se stává nutnost: bez něj nejde fáze 5 ani 7 |

---

## Rozhodnutí, bez kterých se nedá pokračovat

1. **K čemu se výsledky budou používat.** Tohle je nejdůležitější otázka,
   protože validita se dokládá pro konkrétní použití. **Rozvoj a koučování**
   je jedna úroveň nároků. **Výběr** (nábor na univerzitu, nominace, stipendia)
   je výrazně vyšší úroveň: vyžaduje doloženou prediktivní validitu, analýzu
   férovosti vůči skupinám a má právní a etické důsledky. Doporučuju začít
   rozvojem a výběr připustit až po fázi 7.
2. **Cesta**: A, B, nebo C. Doporučuju C.
3. **Akademický partner.** Fakulta tělesné výchovy a sportu UK nebo Fakulta
   sportovních studií MU: přístup ke sportovcům, etická komise, statistická
   kapacita a spoluautorství publikace, která je pro americké univerzity
   nejsilnějším argumentem. Bez partnera jsou fáze 5 až 9 velmi těžko
   proveditelné.
4. **Populace**: věkové rozpětí (od 13? od 16?), sporty, úrovně, jazyky.
5. **Rozpočet a časový rámec**: 18 až 24 měsíců je realita, ne odhad do
   nabídky.
6. **Screening duševního zdraví** (APSQ): ano, nebo ne.

## Co udělám hned po rozhodnutí

- přesné definice všech konstruktů a specifikaci testu (fáze 0),
- žádosti o licence ke kotvám, připravené k odeslání autorům,
- banku položek (fáze 1) ve formátech podle matice metod,
- plán sběru dat a statistické analýzy pro etickou komisi a partnera,
- v aplikaci formulář hodnocení trenéra, aby sběr kritérií začal hned.

## Zdroje ověřené při sepisování

- [IOC SMHAT-1 a SMHRT-1, BJSM 2021](https://pure.amsterdamumc.nl/ws/files/136801848/International-olympic-committee-ioc-sport-mental-health-assessment-tool-1-smhat-1-and-sport-ment.pdf)
- [PCDEQ2, European Journal of Sport Science 2019](https://pubmed.ncbi.nlm.nih.gov/30362895/)
- [COSMIN Risk of Bias checklist](https://www.cosmin.nl/wp-content/uploads/COSMIN-RoB-checklist-V2-0-v17_rev3.pdf)
- [EFPA Test Review Model, verze 2025](https://www.efpa.eu/resource/efpa-test-review-model-version-2025/)
- [SAS-2, Journal of Sport and Exercise Psychology 2006](https://journals.humankinetics.com/downloadpdf/journals/jsep/28/4/article-p479.xml)
- [SAS-2, polská validace](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC9296646/)
- [TOPS 2, Hardy a kol. 2010](https://ipep.bangor.ac.uk/docs/Hardy%20et%20al%202010.pdf)
- [MSRS, prediktivní validita v terénu](https://www.researchgate.net/publication/269108681_Individual_propensity_for_reinvestment_Field-based_evidence_for_predictive_validity_of_three_scales)
- [DSRS, vývoj a validace](https://www.researchgate.net/publication/45506392_Development_and_validation_of_the_Decision-Specific_Reinvestment_Scale)
- [MTQ48, faktorová validita](https://www.sciencedirect.com/science/article/abs/pii/S0191886912005624)
- [CD-RISC, licence](https://www.connordavidson-resiliencescale.com/faq.php)
- [TEOSQ, polská validace](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC7277153/)
