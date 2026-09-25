# Plán validace bez akademického partnera

Plán sběru dat a analýzy pro psychometrika a pro předregistraci. Vychází ze Standards (AERA, APA, NCME, 2014), COSMIN,
pravidel ITC pro překlad a adaptaci testů (2017) a EFPA Test Review Model
(2025).

## Co partner obvykle dodá a čím se to nahradí

Nikoho nežádáme o svolení; všechno níže je buď vlastní práce, nebo placená
či přátelská pomoc z vaší sítě.

| co | s partnerem | bez partnera |
|---|---|---|
| srovnávací nástroje | licencované sportovní dotazníky | jen výslovně uvolněné nástroje (`03-kotvy-a-licence.md`) a vlastní kritéria |
| psychometrika | katedra | psychometrik na volné noze se zkušeností s konfirmační analýzou, IRT a invariancí; smlouva na celý projekt, ne na jednu analýzu |
| přístup ke sportovcům | fakultní kontakty | vlastní síť koučů a klubů, akademie; motivace pro kluby: týmový report ELITE 200 zdarma |
| posouzení obsahu | kolegové z oboru | 8 posuzovatelů z vaší sítě (složení níže) |
| důvěryhodnost | publikace se spoluautory z univerzity | předregistrace, veřejný technický manuál s daty o validitě |

### Etické posouzení

Pro koučovací použití ho podle mých informací zákon u dotazníkového
výzkumu bez zásahu do zdraví nevyžaduje; potvrdí právník spolu se souhlasy
nezletilých. Bez něj ale nejde publikovat v odborném časopise. Pokud
publikace někdy bude cílem, dá se posouzení objednat dodatečně před
pilotem 2 a pilot 1 brát jako předvýzkum.

Co platí vždy, s posouzením i bez něj: informovaný souhlas, u nezletilých
i zákonného zástupce, dobrovolnost, možnost kdykoli odstoupit a výmaz
na požádání.

### Předregistrace

Před pilotem 1 a znovu před pilotem 2 se na OSF (Open Science Framework)
zveřejní hypotézy, velikosti vzorků, pravidla vyřazení respondentů,
analytický postup a kritéria úspěchu. Bez partnera je to nejlevnější
a nejsilnější doklad, že se výsledky nepřizpůsobovaly datům.

## Fáze a vzorky

| fáze | co | vzorek | kritérium pro postup |
|---|---|---|---|
| 0 rámec | specifikace, texty souhlasů, předregistrace | – | souhlasy zkontrolované právníkem, předregistrace zveřejněná |
| 1 banka | 478 kandidátů ve třech jazycích | – | každý kandidát přiřazený ke škále a zkontrolovaný proti definici |
| 2 obsah | posouzení; kognitivní rozhovory | 8 posuzovatelů; 12 sportovců na jazyk, z toho aspoň 4 ve věku 14–15 | I-CVI ≥ 0,78; průměr škály ≥ 0,90; položka, kterou sportovci čtou jinak, se přepíše nebo vyřadí |
| 3 překlad | podle ITC, souběžně s fází 2 | 2 překladatelé na jazyk, zpětný překlad, komise | shoda komise, zápis rozhodnutí u každé položky |
| 4 pilot 1 | struktura a výběr položek | 600 | viz analýza, fáze 4 |
| 5 pilot 2 | potvrzení, invariance, srovnávací nástroje, matice metod | 850 | viz analýza, fáze 5 |
| 6 retest | stabilita + druhý blok kotev | ≥ 250 z pilotu 2, po 2 až 4 týdnech | ICC ≥ 0,70 u rysových škál |
| 7 predikce | jedna sezona s hodnocením trenéra | ≥ 300 sportovců s hodnocením na začátku a na konci | viz analýza, fáze 7 |
| 8 normy | průběžně z pilotu 2 a provozu | cílově 2 000+ | reprezentativnost podle EFPA |
| 9 manuál | technický manuál s daty o validitě; recenze nebo publikace, pokud o ně budete stát | – | – |

**Posuzovatelé obsahu (8), z vaší sítě:** 3 psychologové nebo kouči se
sportovní praxí, 3 trenéři s praxí na úrovni reprezentace nebo profesionální
soutěže, 1 odborník se zkušeností s dospívajícími (třeba někdo z odborníků,
na které odkazujete klienty), 1 psychometrik. Nikdo z nich nepíše položky.

**Pilot 1: kdo co vyplní.** Banka má 432 položek sebeposouzení v pěti
doménách. Každý respondent dostane náhodně tři domény z pěti (průměrně 260
položek, 37 minut), 6 vinět z 36 (4 minuty) a kontext (2 minuty), celkem do
45 minut. Každou doménu tak vyplní zhruba 360 lidí, každou dvojici domén
zhruba 180, každou vinětu kolem 100. U vinět to stačí na vyřazení
nesrozumitelných a těch, kde se odpovědi neliší; empirický klíč se stanoví
až v pilotu 2 na dvanácti vybraných.

**Pilot 2: kdo co vyplní.** Hotové jádro (35,5 minuty), Mini-IPIP (2,5 minuty) a jeden ze dvou bloků
srovnávacích nástrojů (`03-kotvy-a-licence.md`). Kdo přijde na retest, dostane druhý blok.

**Hodnocení trenéra** (formulář už je v aplikaci): při vyplnění testu a na
konci sezony. U 60 sportovců hodnotí dva trenéři nezávisle (hlavní
a asistent), aby šla odhadnout spolehlivost samotného kritéria. Kritérium
s nízkou spolehlivostí stlačuje každou korelaci s testem a bez tohoto odhadu
by nešlo říct, jestli je slabá predikce vinou testu, nebo trenérů.

**Angličtina.** Bez mezinárodního partnera bude anglických respondentů
nejmíň. Pod 200 se anglická verze ověří jen strukturou (konfigurální
invariance) a v manuálu bude uvedená jako „ve vývoji“. Tvrzení o rovnocennosti
s českou verzí se nepíše, dokud ho data neunesou.

**Výzkum a koučování.** Sportovci v pilotech nedostávají výsledky ELITE Pro,
protože test ještě není ověřený. Jako protislužbu může kouč dostat výsledky
ELITE 200. Účast je dobrovolná a trenér se nedozví, kdo odmítl.

## Analýza

Vše v R, kód verzovaný a zveřejněný s manuálem.

| balík | k čemu |
|---|---|
| `psych` | explorační faktorová analýza, paralelní analýza, položkové statistiky |
| `lavaan` | konfirmační analýza (odhad WLSMV pro pořadové odpovědi), matice metod |
| `semTools` | invariance, ω pro pořadové odpovědi |
| `mirt` | IRT (model postupných odpovědí), informační funkce, odlišné fungování položek |
| `lme4` | prediktivní modely se sportovci vnořenými do trenérů a týmů |
| `cNORM` | spojité normy podle věku |

### Fáze 4: struktura a výběr položek

1. vyřazení respondentů podle předregistrovaných pravidel (kontrolní
   položky, čas, dlouhé řady),
2. po doménách: paralelní analýza pro počet faktorů, explorační analýza
   (oblimin); položka zůstává, když má hlavní náboj ≥ 0,50, vedlejší
   < 0,30 a rozdíl ≥ 0,20,
3. model postupných odpovědí po škálách; přednost mají položky, které
   dávají informaci v celém rozsahu, nejen u průměru (u elitních sportovců
   je důležitý horní konec),
4. odlišné fungování položek podle věkové skupiny a pohlaví,
5. výběr 4 položek na škálu: statistika + obsah; každá škála musí pokrýt
   definici, ne jen čtyři varianty jedné věty,
6. viněty: odborný a empirický klíč, ponechat reakce, kde se shodnou.

### Fáze 5: potvrzení

| co | kritérium |
|---|---|
| konfirmační analýza po doménách | CFI ≥ 0,95, RMSEA ≤ 0,06, SRMR ≤ 0,08 jako orientace, ne jako automat; vždy s modifikačními indexy a obsahovým posouzením |
| reliabilita | ω ≥ 0,80 na škálu (profil pro rozvoj); škála pod 0,70 se v reportu neukazuje |
| invariance podle věku, pohlaví, typu sportu, jazyka | konfigurální → metrická → skalární; změna CFI ≤ 0,01 mezi kroky (Chen, 2007); bez skalární invariance se skupiny nesrovnávají průměry |
| konvergence | u škál, které mají volný srovnávací nástroj: latentní korelace ≥ 0,50 se „svým“ nástrojem; u ostatních rozhoduje hodnocení trenéra a viněty (matice metod) |
| diskriminace | korelace se svým nástrojem vyšší než s ostatními; žádná škála nekoreluje s faktorem Mini-IPIP nad 0,70 |
| matice metod | stejný rys jinou metodou (sebe, viněty, trenér) koreluje výš než různé rysy stejnou metodou; model CT-C(M−1) |
| známé skupiny | předregistrované rozdíly mezi úrovněmi (například TOP 100 a profesionálové vs. výkonnostní: nižší TL.6 a TL.7, vyšší DO.8) |

### Fáze 7: predikce

- výstup: položky hodnocení trenéra na konci sezony (výkon v důležitých
  momentech, návrat po chybě, rozhodnost, koučovatelnost, celková
  výkonnost); zranění a nemoci; setrvání ve sportu,
- model: víceúrovňová regrese, sportovci vnoření do trenérů; kontrola
  úrovně na začátku sezony (hodnocení trenéra při vyplnění),
- **přírůstková validita:** ELITE Pro musí predikovat nad Mini-IPIP
  a nad ELITE 200 (rozdíl vysvětleného rozptylu s intervalem spolehlivosti);
  bez toho nemá smysl ho vyvíjet místo převzetí kotev,
- korekce na mnohonásobné testování (Benjamini a Hochberg),
- váhy indexů: odhad na dvou třetinách vzorku, ověření na zbylé třetině.

### Fáze 8: normy

Spojité normy podle věku (cNORM) místo skokových pásem; oddělené podle
pohlaví, pokud to invariance a rozdíly vyžadují. Normy se zveřejní
s popisem vzorku (věk, úroveň, sporty, jazyk), aby bylo vidět, na koho
platí. TOP 100 se popisuje, ale normou se nestává.

## Kdy projekt zastavit nebo změnit

| situace | co udělat |
|---|---|
| doména se v pilotu 1 nerozloží na předpokládané škály | přepsat definice podle dat a zopakovat pilot 1 pro danou doménu, nebo škály sloučit |
| škála nekonverguje se svým srovnávacím nástrojem (< 0,40) | škála měří něco jiného, než tvrdí; přejmenovat podle toho, co měří, nebo vyřadit |
| ELITE Pro nepredikuje nad Mini-IPIP a ELITE 200 | nevyvíjet dál a zůstat u ELITE 200; vývoj by nepřinesl nic navíc |
| invariance podle věku neprojde | normy a výklad zvlášť pro 14–17; v reportu nesrovnávat napříč |
| kritérium od trenérů má nízkou spolehlivost (ICC < 0,50) | posílit pokyny pro trenéry, přidat druhého hodnotitele, predikci vykládat opatrně |

## Harmonogram

24 měsíců. Bez žádostí o licence odpadá čekání na autory.

| měsíc | co |
|---|---|
| 1–3 | fáze 0: souhlasy, předregistrace, domluva s psychometrikem a posuzovateli |
| 2–4 | fáze 1: banka položek |
| 4–6 | fáze 2 a 3: posouzení obsahu, kognitivní rozhovory, překlady |
| 7–9 | fáze 4: pilot 1 a analýza |
| 10–14 | fáze 5 a 6: pilot 2, retest, analýza |
| 10–21 | fáze 7: sezona s hodnocením trenéra (začíná s pilotem 2) |
| 15–24 | fáze 8 a 9: normy, manuál, recenze, publikace |

Hodnocení trenéra se sbírá už teď u ELITE 200. Tato data neslouží
k validaci ELITE Pro, ale ukážou, jak spolehlivé kritérium trenéři dávají,
a umožní ho vyladit dřív, než na něm bude záviset nový test.

## Náklady

Licence ani smluvní zdravotník nejsou potřeba. Zbývá:

- psychometrik na celý projekt (největší položka),
- posuzovatelé obsahu, pokud to nebude přátelská služba,
- překladatelé pro slovenštinu a angličtinu (2 + zpětný překlad na jazyk),
- protislužby pro kluby a akademie (týmové reporty ELITE 200),
- volitelně: etické posouzení a publikace, jen pokud o ně budete stát.
