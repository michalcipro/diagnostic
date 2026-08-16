import type { ArchetypId, ArchetypObsah } from "../types"

// Slovenské znenie športových textov archetypov. Zrkadlí obsah-sport.ts kus
// po kuse: rovnaké kľúče, rovnaké poradie, rovnaké rodové značky. Kontrolu
// robí scripts/test-archetypy.cjs.

export const OBSAH_ARCHETYPU_SPORT_SK: Record<ArchetypId, ArchetypObsah> = {
  nevinatko: {
    nazev: "Neviniatko",
    puvodni: "Innocent",
    prezdivka: "Radosť z hry",
    motto: "Robím to, pretože ma to baví.",
    touha: "robiť šport poctivo a s radosťou, s ktorou {som začínal|som začínala}",
    strach: "že sa zo športu stane špinavá a cynická práca",
    dar: "čistá motivácia, dôvera a pokoj v hlave",
    podstata:
      "Tvoja sila je v tom, že si v športe {zostal|zostala} pri tom, prečo si doň {išiel|išla}. Nepotrebuješ nenávidieť súpera, aby si {podal|podala} výkon, a nepotrebuješ krivdu, aby si {mal|mala} energiu. Tam, kde ostatných ťahá strach alebo hnev, teba ťahá radosť z pohybu a viera, že poctivá práca sa nakoniec vyplatí. To je vzácnejšie, než sa zdá: čistá motivácia vydrží dlhšie než motivácia zo zlosti a nevyhorí tak rýchlo. Tvoja hlava je v súťaži pokojnejšia, pretože nenesie batoh krívd. Riziko je druhá strana tej istej mince. Prostredie vrcholového športu nie je pekné: zákulisná politika, nominácie, nespravodlivé rozhodnutie, súper, ktorý podvádza. Teba toto vyčerpáva viac než tvrdý tréning a máš sklon nevidieť to, kým to nezabolí. Najlepšia verzia tohto typu nestratí radosť, ale prestane byť naivná: vie, ako to okolo chodí, a napriek tomu sa rozhodne hrať čisto. To nie je slabosť, to je najťažšia forma sily.",
    vPodnikani:
      "V tréningu si {vďačný|vďačná} a {bezproblémový|bezproblémová} {športovec|športovkyňa}: zadanie plníš, trénerovi veríš, nehádaš sa o každú sériu. Dobre fungujete v prostredí, kde je jasno a kde sa drží slovo. V súťaži ťa najviac dvíha chuť si to užiť, nie strach z hanby; keď sa atmosféra zmení na hon za výsledkom, tvoja výkonnosť klesá skôr než ostatným. Pozor na fázu, keď šport prejde z koníčka do práce, teda na prechod do vyššej kategórie, na prvú zmluvu, na prvé veľké očakávania. To je moment, keď tento typ buď dospeje a udrží si radosť, alebo vyhorí a skončí, aj keď má na viac.",
    stin:
      "Tieňom je popieranie. Pod tlakom prestaneš vidieť, čo ti nejde, pretože to nezapadá do tvojho obrazu sveta: zranenie, ktoré prechádzaš, spoluhráč, ktorý pracuje proti tebe, tréner, ktorý ti nefandí. Odkladáš nepríjemné rozhovory a dúfaš, že sa to samo urovná. Druhá podoba tieňa je krehkosť: keď ti niekto ublíži alebo spochybní tvoje úmysly, zasiahne ťa to hlbšie, než je zdravé, a namiesto vecnej reakcie sa stiahneš do seba. Tretia je pasivita: čakáš, kým spravodlivosť príde sama, pretože si predsa {poctivý|poctivá}, a medzitým ťa predbehne niekto, kto si o svoje povedal.",
    pasti:
      "Najčastejšia chyba je vziať tomuto typu radosť. Tréner, ktorý verí, že motivácia musí bolieť, ho zlomí rýchlejšie než súper. Druhá pasca je nechať ho bez ochrany v prostredí plnom intríg; tento typ potrebuje férové pravidlo, inak stratí dôveru a s ňou aj výkon. Tretia pasca je zameniť pokoj za lenivosť, pretože tento športovec nepôsobí zúfalo hladne, ale to neznamená, že nechce vyhrať.",
    navod: [
      "Držte radosť ako súčasť prípravy, nie ako odmenu: jeden blok v týždni, ktorý má byť čisto zábavný, tento typ nabije viac než dva navyše odmakané.",
      "Spätnú väzbu podávajte vecne a bez zosmiešňovania. Irónia a tvrdý humor sadnú iným typom; tu berú istotu a spúšťajú stiahnutie.",
      "Nauč sa pomenovať neférovú situáciu nahlas a hneď: čo sa stalo, čo s tým chceš robiť. Poctivosť neznamená mlčať.",
      "Raz za mesiac si prejdite jednu vec, ktorú nechceš vidieť: zdravie, formu, vzťah v tíme. Nech sa to rieši skôr, než to buchne.",
      "Pred vstupom do vyššej úrovne si dopredu povedzte, čo všetko sa zmení a čo zostane. Tento typ nezlomí záťaž, ale strata zmyslu.",
    ],
    priklady:
      "Športovec, ktorý po prehre gratuluje súperovi skôr, než zdvihne hlavu; hráč, ktorého baví tréning rovnako ako zápas; ten, kto v šatni nikdy neohovára.",
    sekundarniRole:
      "Ako druhý v poradí drží motiváciu čistú: brzdí, aby sa z primárneho archetypu stala honba za výsledkom za každú cenu, a udržuje v športe radosť aj v najťažších obdobiach.",
    role:
      "V tíme je to človek, ktorý nerobí problémy a spája: nikto proti nemu nič nemá. V individuálnom športe je to športovec, ktorý sa drží plánu a nespochybňuje ho. V oboch prípadoch ho nedávajte do roly, kde sa má tvrdo vymedzovať alebo vyjednávať, pretože ho to stojí viac energie než samotný výkon.",
    sTrenerem:
      "Trenie vzniká, keď tréner používa tlak, hrozby a porovnávanie ako palivo. Pri tomto type to nefunguje: namiesto toho, aby sa nabudil, uzavrie sa a prestane hovoriť o tom, čo ho bolí. Druhé trenie je opačné: tréner si zvykne, že tento športovec nikdy nič nechce, a prestane mu venovať pozornosť. Oba omyly končia rovnako, tichým odchodom.",
    znacka:
      "Navonok je tento typ dôveryhodný a čistý, čo je pre partnerov aj pre mladých fanúšikov najcennejšie, čo v športe je. Komunikuj jednoducho a pravdivo: čo robím, prečo ma to baví, ako sa pripravujem. Nikdy nehraj tvrdiaka, ktorý ti nesadne; falošná póza je tu vidieť na prvý pohľad a berie ti presne to, čo ťa odlišuje.",
  },

  objevitel: {
    nazev: "Objaviteľ",
    puvodni: "Explorer",
    prezdivka: "Hľadač",
    motto: "Musí sa to dať robiť aj inak.",
    touha: "sloboda robiť šport po svojom a hľadať vlastnú cestu",
    strach: "zapadnúť do systému, v ktorom sa nedá dýchať",
    dar: "samostatnosť, zvedavosť a čuch na to, čo bude fungovať",
    podstata:
      "Tvoj motor je sloboda. Neznesieš, keď ti niekto povie, že sa to robí takto, pretože sa to tak robilo vždy. Skúšaš nové metódy, sleduješ, čo robia inde a v iných športoch, a nebojíš sa opustiť postup, ktorý všetkým ostatným vyhovuje. Vďaka tomu často nájdeš vec, ktorá ti sadne lepšie než univerzálny plán, a býva to o rok skôr, než sa z toho stane trend. Najsilnejší si v období, keď sa hľadá: po zranení, po zmene kategórie, pri stavbe novej techniky. Riziko je rovnaké ako sila. Keď sloboda stratí smer, mení sa na neschopnosť pri niečom vydržať. Nová metóda je vždy lákavejšia než dotiahnutie tej súčasnej, a tak meníš tréningové plány, trénerov aj prostredie skôr, než stihnú zabrať. V športe sa pritom takmer všetko láme až v momente, keď to dlho nudne opakuješ. Tvoja kariéra rastie vtedy, keď si na hľadanie vyhradíš priestor a zvyšok necháš bežať v stereotype, aj keď ťa nebaví.",
    vPodnikani:
      "V tréningu si {zvedavý|zvedavá} a {samostatný|samostatná}: strážiš si dáta, čítaš, skúšaš doplnky prípravy, ktoré nikto v okolí nerobí. Keď dostaneš plán bez vysvetlenia, robíš ho horšie než plán, ktorému rozumieš. V súťaži ťa nabudí neznáme prostredie, nový súper, nezvyklé podmienky; naopak siedmy štart v tej istej hale je pre teba ťažší než pre ostatných. Dlhé, jednotvárne bloky prípravy sú tvoja slabina, a presne tie ťa robia {lepším|lepšou}. Najlepšie funguješ, keď má stereotyp jasne daný koniec a keď vieš, k čomu vedie.",
    stin:
      "Tieňom je útek. Keď sa objaví nuda alebo prvý naozajstný odpor, začneš hľadať dôvod, prečo ísť inam: iný klub, iný tréner, iná disciplína. Zvonku to vyzerá ako hľadanie seba, zvnútra je to únik pred fázou, v ktorej sa to práve láme. Druhá podoba tieňa je nedokončenosť: rozrobené techniky, rozrobené zmeny, nič dotiahnuté do konca. Tretia je osamelosť, pretože kto stále odchádza, nemá okolo seba ľudí, ktorí ho poznajú dosť dlho na to, aby mu povedali pravdu.",
    pasti:
      "Najhoršie, čo sa tomuto typu dá urobiť, je zavrieť ho do systému bez vysvetlenia a bez priestoru. Odíde, aj keby mal objektívne najlepšie podmienky. Druhá pasca je opačná: nechať ho meniť všetko, kedykoľvek sa mu zachce, a čudovať sa, že roky nie sú vidieť. Tretia je posmievať sa jeho nápadom, pretože práve z nich občas vzíde vec, ktorá posunie celú skupinu.",
    navod: [
      "Rozdeľte prípravu na jadro a ihrisko: osemdesiat percent je nemenný stereotyp, dvadsať percent je priestor, kde smie skúšať nové veci. Hranica sa dohaduje dopredu, nie v afekte.",
      "Každú zmenu vždy vysvetlite: čo, prečo a ako dlho. Tento typ urobí aj nudnú prácu, keď jej rozumie, a odflákne aj múdru prácu, keď ju dostane ako rozkaz.",
      "Zaveďte pravidlo minimálnej doby: nový postup sa nemení skôr než po dohodnutom počte týždňov, nech sa pozná, či funguje.",
      "Daj si každý rok jednu naozajstnú výpravu: sústredenie inde, iné prostredie, iný šport ako doplnok. Tento typ potrebuje palivo zvonku, inak si ho vyrobí odchodom.",
      "Než zmeníš klub alebo trénera, napíš si, čomu utekáš a čo si tam ponesieš so sebou. Polovica odchodov v tomto type rieši nudu, nie podmienky.",
    ],
    priklady:
      "Športovec, ktorý si sám hľadá metódy, o ktorých tréner ešte nepočul; ten, kto miluje prvé tréningy v novej sezóne a neznáša posledné týždne stereotypu; hráč, ktorý každú zimu skúša iný doplnkový šport.",
    sekundarniRole:
      "Ako druhý v poradí dodáva profilu otvorenosť a chuť skúšať: bráni tomu, aby primárny archetyp zamrzol v jednom postupe, a prináša do prípravy veci zvonku skôr než ostatní.",
    role:
      "V tíme je to ten, kto prinesie nový nápad a rozprúdi zabehnutú skupinu, ale zle znáša rolu, kde sa má len podriadiť. V individuálnom športe je to samostatný typ, ktorý si veľkú časť prípravy odriadi sám a potrebuje trénera skôr ako partnera do debaty než ako veliteľa. V oboch prípadoch mu dajte oblasť, ktorú skutočne vlastní.",
    sTrenerem:
      "Trenie vzniká na autorite. Tréner, ktorý odpovedá „pretože to hovorím ja“, pri tomto type okamžite stráca kredit, aj keď má pravdu. Druhé trenie vzniká z tempa: tréner chce vydržať pri jednej veci, športovec chce ďalšiu. Pomáha dohoda o tom, kto o čom rozhoduje, spísaná skôr, než sa pohádate.",
    znacka:
      "Navonok je tento typ zaujímavý tým, čo skúša a kde všade bol. Rozprávaj cestu, nie len výsledky: zákulisie, omyly, objavy. Autenticita je tvoja mena a vyhladená prezentácia ti nesvedčí. Pozor len na to, aby z tvojej komunikácie nebol zoznam začiatkov bez jediného dokončeného príbehu.",
  },

  mudrc: {
    nazev: "Mudrc",
    puvodni: "Sage",
    prezdivka: "Stratég",
    motto: "Najprv tomu chcem rozumieť.",
    touha: "rozumieť svojmu športu do hĺbky a rozhodovať sa podľa poznania",
    strach: "konať naslepo a nechať sa oklamať",
    dar: "chladná hlava, analýza a schopnosť čítať hru",
    podstata:
      "Ty šport nielen robíš, ty ho študuješ. Rozoberáš videá, sleduješ čísla, pozoruješ súperov a hľadáš vzorec. Tvoja výhoda nie je v tom, že by si {bol|bola} najsilnejší, ale v tom, že vieš prečo: prečo ti minule došli sily, prečo tento súper začína rýchlo, prečo tvoja technika zlyháva až v tretej sérii. Keď si rozumieš, nemusíš sa spoliehať na náladu a formu. V hlave máš pokoj, ktorý ostatní hľadajú márne, pretože ti dáva istotu príprava, nie pocit. Riziko je odstup. Analýza je aj najlepší úkryt: kým rozoberám, nemusím riskovať. Vo chvíli rozhodnutia, keď sa má vystreliť, zaútočiť alebo jednoducho ísť naplno, môžeš byť o pol sekundy pozadu, pretože ešte premýšľaš. Druhé riziko je nedôvera k intuícii, ktorú telo často vie skôr než hlava. Najlepšia verzia tohto typu si pripraví všetko vopred a v súťaži hlavu vypne, pretože práca je už hotová.",
    vPodnikani:
      "V tréningu si {premýšľavý|premýšľavá} a {technický|technická}: chceš poznať zmysel každého cvičenia, {sám|sama} si vedieš záznamy, spoznáš na sebe detail, ktorého si nikto nevšimol. V súťaži si {silný|silná} tam, kde sa dá vyhrať taktikou, čítaním hry a trpezlivosťou; slabší tam, kde sa rozhoduje čisto inštinktom v chaose. Tvoja forma rastie pomaly a stabilne, pretože nestaviaš na nálade. Najlepšie výkony podávaš vtedy, keď máš dosť času na prípravu a nikto ťa nenúti improvizovať na poslednú chvíľu.",
    stin:
      "Tieňom je paralýza z premýšľania. Pod tlakom sa stiahneš do rozboru: ešte jedno video, ešte jedno vysvetlenie, a rozhodnutie sa odsunie. V zápase to vyzerá ako zaváhanie, v kariére ako večné odkladanie kroku nahor. Druhá podoba tieňa je povýšenosť: tichý despekt k tým, ktorí sa rozhodujú emóciami a napriek tomu vyhrávajú. Tretia je preanalyzovaný výkon, keď máš v hlave toľko pokynov, že telo nestíha a ide to celé proti prirodzenosti.",
    pasti:
      "Najčastejšia chyba je dávať tomuto typu pokyny bez zdôvodnenia; urobí ich, ale bez dôvery, a pri prvej kríze sa vráti k svojmu. Druhá pasca je zahltiť ho inštrukciami tesne pred štartom, keď potrebuje pravý opak: jednu vetu a pokoj. Tretia je vysmievať sa jeho potrebe rozumieť ako premýšľaniu namiesto makania.",
    navod: [
      "Rozdeľte prípravu a súťaž: analýza patrí do týždňa, do pretekov ide jedna jediná veta. Čím viac si toho prejdete vopred, tým menej toho potrebuje v akcii.",
      "Vysvetľujte dôvod: každé cvičenie má mať zmysel, ktorý športovec vie zopakovať vlastnými slovami. Tento typ potom makať vie.",
      "Daj rozhodnutiu termín: čo nerozhodneš do stanoveného dňa, rozhodni podľa najlepšieho dostupného odhadu. Dokonalá informácia v športe nikdy nepríde.",
      "Trénujte rozhodovanie v chaose: cvičenia s nedostatkom času a informácií, kde je horšie nerozhodnúť sa než rozhodnúť sa zle.",
      "Nauč sa vypínať: rituál po analýze, ktorý uzavrie premýšľanie, aby si sa v noci pred štartom {nevracal|nevracala} k číslam.",
    ],
    priklady:
      "Športovec, ktorý pozná štatistiky súperov naspamäť; ten, kto si po zápase sám sadne k videu skôr, než ho o to niekto požiada; hráč, ktorého ostatní chodia pýtať sa na taktiku.",
    sekundarniRole:
      "Ako druhý v poradí dodáva profilu rozvahu a presnosť: podkladá ťah primárneho archetypu dátami a bráni rozhodnutiam, ktoré vznikli len z nadšenia alebo zo zlosti.",
    role:
      "V tíme je to prirodzený taktický mozog: ten, kto vidí súvislosti, radí ostatným a býva predĺženou rukou trénera na ihrisku. V individuálnom športe je to športovec, ktorý sa podieľa na stavbe vlastného plánu a potrebuje mu rozumieť. V oboch prípadoch mu dajte priestor hovoriť do taktiky, inak prídete o jeho najcennejšiu vlastnosť.",
    sTrenerem:
      "Trenie vzniká, keď tréner vníma otázky ako spochybňovanie autority. Tento športovec sa nepýta preto, aby oponoval, ale preto, aby to vedel použiť. Druhé trenie je časové: tréner chce rýchle rozhodnutie, športovec chce ešte deň. Pomáha dohodnúť, kedy sa debatuje a kedy sa už len plní.",
    znacka:
      "Navonok je tento typ dôveryhodný ako nikto iný: vysvetľuje, učí, rozoberá. Keď chceš budovať meno, stav ho na obsahu, ktorý ľuďom niečo dá, nie na sebaprezentácii. Tento typ má najviac zo všetkých nakročené k role trénera, experta alebo komentátora po kariére.",
  },

  hrdina: {
    nazev: "Hrdina",
    puvodni: "Hero",
    prezdivka: "Pretekár",
    motto: "Ukáž mi, čo mám poraziť.",
    touha: "dokázať svoju hodnotu výkonom, keď ide do tuhého",
    strach: "zlyhať a pôsobiť {slabý|slabá}",
    dar: "bojovnosť, disciplína a odvaha niesť zodpovednosť za výsledok",
    podstata:
      "Ty potrebuješ súpera, latku a jasný výsledok. Prekážka ťa prebudí, tlak ťa zostrí a v momente, keď sa rozhoduje, chceš byť pri tom: posledná strela, posledné kolo, rozhodujúci pokus. Tam, kde ostatným telo tvrdne, tebe sa čistí hlava, pretože konečne ide o niečo. Disciplína ti nerobí problém, pretože vidíš, k čomu vedie, a drina bez súpera ťa nudí. Toto je archetyp, ktorý v športe najviac oceňujeme, a tiež ten, ktorý najčastejšie dojde na svoje prednosti. Keď totiž chýbajú preteky, vyrobíš si ich: zo spoluhráča, z trénera, zo seba. Odpočinok vnímaš ako slabosť, únavu ako výhovorku a bolesť ako vec, ktorou sa jednoducho prejde. Presne tadiaľ vedie cesta k pretrénovaniu, k zraneniu a k tomu, že v momente, keď ide naozaj o veľa, nie je z čoho brať. Najlepšia verzia tohto typu je rovnako tvrdá v regenerácii ako v tréningu, pretože pochopila, že aj odpočinok je súčasť boja.",
    vPodnikani:
      "V tréningu ťaháš celú skupinu: dvíhaš tempo, nechceš prehrať ani cvičnú hru, a keď je skupina lenivá, štveš ju. V súťaži rastieš úmerne tomu, koľko je v stávke; malé štarty ťa nezaujímajú a odbavíš ich. Tvoje čísla bývajú najlepšie v tom najťažšom období, pretože pod tlakom sa ti čistí hlava. Slabinou je monotónna práca bez merateľného cieľa a fáza, keď sa má vedome ubrať: to berieš ako ústup, nie ako prípravu.",
    stin:
      "Tieňom je vojna so všetkým. Pod tlakom začneš vidieť nepriateľov aj tam, kde nie sú: spoluhráč je konkurencia, tréner brzda, kritika útok. Druhá podoba tieňa je zákaz slabosti; o bolesti, únave a strachu sa nehovorí, takže sa o nich okolie dozvie až vo chvíli, keď je neskoro. Tretia je závislosť od výsledku: po prehre nie si {smutný|smutná}, ale {bezcenný|bezcenná}, a to je stav, z ktorého sa nevracia výkon, ale zranenie.",
    pasti:
      "Najčastejšia chyba je tento typ ešte viac hecovať. Nepotrebuje palivo, potrebuje brzdu a smer. Druhá pasca je hodnotiť ho len podľa výsledku, pretože si to sám robí dosť. Tretia je nechať ho vyhrávať každý tréning; typ, ktorý nikdy neprehráva v príprave, si nevytvorí odolnosť voči prehre v súťaži.",
    navod: [
      "Dajte tvrdej práci hranicu: regenerácia a voľno sa plánujú do tréningového plánu ako jednotky, ktoré sa plnia rovnako prísne ako záťaž.",
      "Nastavte popri výsledkových cieľoch aj procesné: čo robím dobre bez ohľadu na skóre. Tento typ potrebuje druhé meradlo pre dni, keď výsledok nepríde.",
      "Zaveďte pravidlo o hlásení: bolesť, únava a strach sa hlásia, aj keď nie sú vidieť. Dohodnite sa na jednoduchej stupnici, aby to nebolo o slabosti.",
      "Vyberajte preteky, ktoré majú váhu, a zvyšok nech ide v tréningovom režime. Kto bojuje o všetko, nemá silu na to, o čo naozaj ide.",
      "Po prehre urobte rozbor do 48 hodín a potom ju zavrite. Tento typ ju inak nesie mesiace a odnesie si ju do ďalšieho štartu.",
    ],
    priklady:
      "Športovec, ktorý chce loptu v poslednej minúte; ten, kto v príprave dvíha tempo celej skupine; hráč, ktorý po prehre nehovorí a ide prvý na ďalší tréning.",
    sekundarniRole:
      "Ako druhý v poradí dodáva profilu ťah a disciplínu: pridáva primárnemu archetypu ochotu ísť do ťažkých vecí a schopnosť dotiahnuť prípravu aj vtedy, keď nadšenie dôjde.",
    role:
      "V tíme je to ťahúň a často kapitán, ale pozor: vedie príkladom, nie trpezlivosťou, takže mu nedávajte pod krídla tých najkrehkejších. V individuálnom športe je to typ, ktorý znesie najtvrdšiu prípravu, keď vie, k akým pretekom vedie. V oboch prípadoch potrebuje jasne danú métu, inak si vyrobí vlastnú, a tá býva nezdravá.",
    sTrenerem:
      "Trenie vzniká, keď tréner uberá. Športovec to číta ako nedôveru, aj keď ide o ochranu zdravia. Druhé trenie vzniká z kritiky pred ostatnými: tento typ ju nesie ako poníženie a odpovie buď vzdorom, alebo tichom. Pomáha hovoriť nepríjemné veci medzi štyrmi očami a odôvodňovať uberanie výkonom, nie opatrnosťou.",
    znacka:
      "Navonok si {čitateľný|čitateľná} a {príťažlivý|príťažlivá}: príbeh výzvy a prekonania funguje vždy. Dávaj si však pozor na dve veci. Po prvé, hrdinom príbehu má byť to, čo si {prekonal|prekonala}, nie to, koho si {porazil|porazila}. Po druhé, ukáž raz za čas aj slabšiu chvíľu; nepremožiteľnosť je nudná a nikto jej neverí.",
  },

  rebel: {
    nazev: "Rebel",
    puvodni: "Outlaw",
    prezdivka: "Provokatér",
    motto: "Kto povedal, že sa to takto musí?",
    touha: "robiť veci po svojom a zbúrať, čo nedáva zmysel",
    strach: "bezmocnosť a splynutie s davom",
    dar: "odvaha ísť proti prúdu a schopnosť zmeniť zabehnuté pravidlá",
    podstata:
      "Tvoja energia pochádza z nesúhlasu. Vidíš, čo je v tvojom športe skostnatené: cvičenia, ktoré sa robia zo zvyku, autority, ktoré nič nedokázali, pravidlá, ktoré chránia systém, nie športovca. A nemôžeš pri tom zostať ticho. Tvoje najlepšie výkony prichádzajú vtedy, keď ti niekto povie, že to nejde, alebo keď ťa odpíše. Vzdor je pre teba palivo, ktoré iní nemajú, a práve preto dokážeš veci, ktoré sa podľa papiera dokázať nedajú. Riziko je zjavné: vzdor bez smeru je len konflikt. Keď ti chýba skutočný súper, začneš bojovať s vlastným tímom, s trénerom a nakoniec {sám|sama} so sebou. Búraš postupy skôr, než máš náhradu, a meníš prostredie, kedykoľvek ťa niekto obmedzí. Najlepšia verzia tohto typu si vyberá, kde bude bojovať: vonku proti tomu, čo skutočne nefunguje, a vnútri drží disciplínu, pretože bez nej sa z rebela stane len {nespokojný|nespokojná} {športovec|športovkyňa}.",
    vPodnikani:
      "V tréningu si {nepohodlný|nepohodlná} a {priamy|priama}: pýtaš sa, prečo sa niečo robí, a keď nedostaneš odpoveď, robíš si to po svojom. Štandardný plán ti sadne horšie než plán ušitý na mieru, aj keby bol objektívne horší. V súťaži si najnebezpečnejší v role outsidera, ktorému nikto neverí, a naopak si nevieš sadnúť do roly favorita, kde sa má len potvrdiť očakávanie. Rozhodnutia rozhodcov a nespravodlivosť ťa dokážu vykoľajiť viac než únava.",
    stin:
      "Tieňom je deštrukcia. Pod tlakom sa vzdor odtrhne od zmyslu: hádaš sa, aj keď to škodí tebe, búraš aj to, čo funguje, len preto, že to nevzniklo z tvojej hlavy. Druhá podoba tieňa je večný odpor voči akejkoľvek autorite, kvôli ktorému sa s tebou nedá pracovať ani tam, kde by ti chceli vyjsť v ústrety. Tretia je cynizmus: presvedčenie, že celý systém je pokazený, ktoré z teba urobí človeka, čo len ubližuje a nikam nepatrí.",
    pasti:
      "Najhoršie, čo sa dá urobiť, je zlomiť ho silou. Vyhrá s ním len ten, kto mu dá dôvod, nie rozkaz. Druhá pasca je opačná: nechať mu všetko prejsť, pretože je nadaný, a rozložiť tým tím. Tretia je brať jeho námietky osobne; veľká časť z nich má vecné jadro, aj keď je povedaná nevhodne.",
    navod: [
      "Dajte mu priestor oponovať v určený čas a formu, v ktorej sa to nosí: pravidelný rozhovor, kde smie povedať čokoľvek. Čo sa nesmie von, sa aj tak dostane von, len horšie.",
      "Vysvetľujte dôvody, nedávajte rozkazy. Tento typ urobí aj tvrdú vec, keď jej rozumie, a nikdy neurobí vec, ktorú vníma ako mocenskú hru.",
      "Nájdite skutočného vonkajšieho súpera: úroveň, tabuľku, čas, papierového favorita. Keď vzdor nemá kam von, obráti sa dovnútra tímu.",
      "Dohodnite pár neporušiteľných pravidiel, ktorých je málo, ale platia bez výnimky. Rebel unesie málo pravidiel dobre, veľa pravidiel vôbec.",
      "Než niečo zbúraš, povedz, čím to nahradíš. Bez náhrady je to len škoda a nabudúce ťa už nikto neposlúchne.",
    ],
    priklady:
      "Športovec, ktorý sa háda o zmysel cvičenia a potom ho odmaká lepšie než ostatní; hráč, ktorého nespravodlivá nominácia nabudí, namiesto toho aby ho zlomila; ten, kto si presadil vlastnú prípravu proti všetkým a mal pravdu.",
    sekundarniRole:
      "Ako druhý v poradí dodáva profilu ostrie a odvahu: pridáva primárnemu archetypu schopnosť ísť proti očakávaniu a nebáť sa nepohodlnej pravdy.",
    role:
      "V tíme je to hlas, ktorý povie nahlas, čo si ostatní myslia, a to je cenné aj nepohodlné. Kapitánsku pásku mu dávajte len vtedy, keď už vie odlíšiť vzdor od vedenia. V individuálnom športe potrebuje trénera, ktorý znesie diskusiu a neberie ju ako útok na seba. V oboch prípadoch ho nedávajte do prostredia s mnohými formálnymi pravidlami.",
    sTrenerem:
      "Trenie vzniká hneď na začiatku, na otázke, kto tu velí. Tréner, ktorý na to odpovie silou, dostane vzburu; tréner, ktorý cúvne, stratí rešpekt celej skupiny. Funguje tretia cesta: jasne dané mantinely, vnútri nich veľká voľnosť a otvorená debata o dôvodoch.",
    znacka:
      "Navonok je tento typ najzaujímavejší zo všetkých: má názor, nehovorí v klišé a ľudia sa okolo neho rozdelia. To je sila, ale aj zbraň proti tebe. Mier na praktiky a systém, nikdy na konkrétnych ľudí, a nikdy nekomentuj v afekte bezprostredne po zápase. Provokácia, za ktorou stojí výkon, je značka; provokácia bez výkonu je len hluk.",
  },

  mag: {
    nazev: "Mág",
    puvodni: "Magician",
    prezdivka: "Vizionár",
    motto: "Hlava dokáže viac, než si ľudia pripúšťajú.",
    touha: "premeniť seba aj svoj výkon na niečo, čo sa zdalo nemožné",
    strach: "že to celé zostane len v predstavách",
    dar: "vízia, predstavivosť a práca s hlavou",
    podstata:
      "Ty v športe hľadáš premenu. Nejde ti len o čas alebo skóre, ale o to, kam až sa dá posunúť hranica toho, čo je možné, a čo to urobí s tebou ako s človekom. Vieš si výkon predstaviť tak živo, že si ho telo pamätá, a túto schopnosť používaš skôr, než sa o nej v tvojom okolí začalo hovoriť. Veríš, že hlava rozhoduje viac než telo, a máš pravdu častejšie, než si tvoje okolie pripúšťa. Dokážeš vytvoriť atmosféru, v ktorej sa nemožné začne zdať dosiahnuteľné, a to je vlastnosť, ktorú sa takmer nedá naučiť. Riziko je vzdialenosť medzi víziou a dodávkou. Predstava beží rýchlejšie než príprava: v hlave už si na majstrovstvách, ale odtrénované týždne za tým zaostávajú. Druhé riziko je útek k metódam, ktoré sľubujú skratku, pretože skratky priťahujú práve tento typ. Najlepšia verzia Mága má vedľa seba niekoho, kto počíta kilometre a stráži čísla, aby vízia mala o čo sa oprieť.",
    vPodnikani:
      "V tréningu pracuješ veľa s hlavou: vizualizácia, dýchanie, mentálna príprava ti sadnú a majú na tvoj výkon väčší vplyv než na kohokoľvek iného v skupine. V súťaži vieš vytiahnuť výkon, ktorý si podľa prípravy {nemal|nemala} mať, a rovnako tak vieš prepadnúť, keď stratíš vieru; tvoje rozpätie je väčšie než u ostatných. Sadnú ti dlhodobé projekty so zmyslom a veľký cieľ na horizonte; naopak ťa ničí bezcieľna sezóna, v ktorej ide len o body.",
    stin:
      "Tieňom je odtrhnutie od reality. Pod tlakom začneš veriť vlastnej vízii viac než číslam: príprava zaostáva, ale ty cítiš, že to vyjde, a prekvapenie potom bolí dvakrát. Druhá podoba tieňa je manipulácia, pretože kto vie ľudí nadchnúť, vie ich aj používať; v športe sa to prejaví hlavne v tom, ako zaobchádzaš s okolím, keď ide o tvoj cieľ. Tretia je hľadanie skratiek: metódy, doplnky a guru, ktorí sľubujú premenu bez odmakaných hodín.",
    pasti:
      "Najčastejšia chyba je vysmievať sa práci s hlavou ako ezoterike. Pri tomto type je to hlavný zdroj výkonu, nie doplnok. Druhá pasca je nechať víziu bez plánu, pretože sen bez čísel sa rozpadne uprostred sezóny. Tretia je stále ho sťahovať dole; realizmus je potrebný, ale kto tomuto typu vezme veľký cieľ, vezme mu palivo.",
    navod: [
      "Zapíšte veľký cieľ a rozložte ho na čísla: čo musí byť hotové za mesiac, za kvartál, za rok. Vízia sa nemá krotiť, má sa podoprieť.",
      "Držte mentálnu prípravu v pláne ako tréning: pevný čas, pevná forma, meraný efekt. Čo je len keď sa to hodí, prestane fungovať.",
      "Postavte vedľa seba realistu: trénera, fyzia alebo parťáka, ktorý má právo povedať, že príprava nezodpovedá cieľu.",
      "Overuj metódy skôr, než im uveríš: kto to skúmal, na kom to fungovalo, čo to má dokázať. Tvoja sila je otvorenosť, tvoja slabina dôverčivosť.",
      "Po každom štarte porovnaj predstavu a realitu: čo sedelo, čo nie. Tento rituál z vízie robí nástroj, nie prianie.",
    ],
    priklady:
      "Športovec, ktorý si preteky prehrá v hlave skôr, než na ne vyrazí; ten, kto vie do skupiny priniesť pocit, že to tento rok dokážu; hráč, ktorý sa po zranení vráti lepší, než bol, pretože zmenil hlavu.",
    sekundarniRole:
      "Ako druhý v poradí dodáva profilu zmysel a predstavivosť: dvíha primárny archetyp z odmakaných hodín k veľkému cieľu a dáva príprave smer, ktorý presahuje jednu sezónu.",
    role:
      "V tíme je to človek, ktorý vie zdvihnúť náladu a nastaviť ambíciu, ale nesmie zostať sám s prevádzkou: potrebuje vedľa seba poriadkumilovný typ. V individuálnom športe je to športovec, ktorý zo seba vytiahne maximum, keď má veľký príbeh, a hasne v sezóne bez cieľa. V oboch prípadoch mu dajte cieľ, ktorý je o kúsok za hranicou rozumného.",
    sTrenerem:
      "Trenie vzniká, keď tréner hovorí len v číslach a športovec len vo víziách; obaja majú pravdu a míňajú sa. Druhé trenie prichádza, keď tréner tlmí veľký cieľ ako nereálny. Pomáha prekladať medzi svetmi: každý veľký cieľ dostane stĺpec čísel a každé číslo dostane vetu o tom, k čomu vedie.",
    znacka:
      "Navonok je tento typ príťažlivý, pretože hovorí o premene, nie o výsledkoch, a tomu ľudia rozumejú. Buduj to na doložených veciach: čo sa naozaj zmenilo a ako dlho to trvalo. Sľub bez dôkazu je pri tomto type najväčšie riziko, pretože verejnosť šarlatána v športe odhalí rýchlo a natrvalo.",
  },

  "jeden-z-nas": {
    nazev: "Jeden z nás",
    puvodni: "Regular Guy / Regular Gal",
    prezdivka: "Drieč bez ega",
    motto: "Nie som nič viac než ostatní.",
    touha: "patriť do party a byť {prijímaný|prijímaná} {taký|taká}, {aký|aká} som",
    strach: "vyčnievať, povyšovať sa a byť za to {odstrčený|odstrčená}",
    dar: "spoľahlivosť, pokora a schopnosť držať partu pohromade",
    podstata:
      "Tvoja sila je v tom, že sa nepovyšuješ. Odvedieš svoje, nepotrebuješ za to potlesk, a keď niekto okolo teba uspeje, praješ mu to bez postranných myšlienok. Práve preto ti ľudia veria: nehráš hry, nehovoríš za chrbtom, nedávaš nikomu najavo, že si lepší. V tíme si tmel, v tréningovej skupine ten, s kým chce každý trénovať, a v šatni človek, ktorý drží slovo. Šport bez ľudí by ťa nebavil, pretože polovica toho, prečo to robíš, sú práve oni. Riziko je neviditeľnosť. Kto nikdy nevyčnieva, toho ľahko prehliadnu pri nominácii, pri rozdeľovaní rolí aj pri vyjednávaní o podmienkach. Skromnosť sa navyše vie premeniť na výhovorku: nepoviem si o svoje, pretože by som {vyzeral|vyzerala} namyslene. A potom je tu strach z vlastného úspechu, pretože ten by z teba urobil niekoho, kto už nie je jeden z nás. Najlepšia verzia tohto typu zostane skromná v správaní a prestane byť skromná v nárokoch.",
    vPodnikani:
      "V tréningu si {spoľahlivý|spoľahlivá}: prídeš, odmakáš, nekomplikuješ. Nepotrebuješ zvláštne zaobchádzanie a zle znášaš, keď ho niekto dostáva. V súťaži si stabilný a málokedy prepadneš, ale tiež málokedy vystúpiš z radu: rola hviezdy ti nie je príjemná, aj keď na ňu máš. Najlepšie fungujete v prostredí, kde sú jasné roly a kde sa nerobí rozdiel medzi hviezdami a ostatnými. Keď sa atmosféra zmení na každý sám za seba, strácaš pôdu pod nohami rýchlejšie než ostatní.",
    stin:
      "Tieňom je rozpustenie. Zo strachu vyčnievať obrusuješ všetko, čím sa líšiš: názor radšej nepovieš, o rolu si nepovieš, výkon zbytočne nevypichneš. Postupne sa z teba stane {použiteľný|použiteľná} {športovec|športovkyňa} bez tváre, ktorého si nikto nevybaví. Druhá podoba tieňa je nedôvera k vlastnému úspechu: keď sa ti darí, cítiš vinu voči tým, ktorým sa nedarí, a podvedome brzdíš. Tretia je pasívna lojalita k prostrediu, ktoré ti už dávno nesvedčí.",
    pasti:
      "Najčastejšia chyba je považovať skromnosť za nedostatok ctižiadosti a nedať mu šancu. Druhá pasca je nakladať mu viac práce, pretože nikdy neprotestuje. Tretia je vytiahnuť ho do roly hviezdy bez prípravy: tento typ potrebuje na vyčnievanie čas a podporu, inak sa stiahne ešte hlbšie.",
    navod: [
      "Nauč sa pýtať si svoje: raz za sezónu si daj rozhovor o role, podmienkach a cieľoch, na ktorý sa dopredu pripravíš písomne.",
      "Zdvihnite mu jednu vec, v ktorej smie byť najlepší, a hovorte o nej nahlas. Tento typ potrebuje dovolenie vyniknúť.",
      "Trénujte vedenie v malom: viesť rozcvičku, vziať si na starosť mladšieho. Zodpovednosť v bezpečnej dávke ho posúva lepšie než pásky a tituly.",
      "Tréneri, kontrolujte zaťaženie: tento typ povie, že je v pohode, aj keď nie je. Pýtajte sa konkrétne, nie všeobecne.",
      "Rozlíš si lojalitu a zotrvačnosť: pýtaj sa raz ročne, či ťa prostredie ešte posúva, alebo v ňom zostávaš len preto, že tam patríš.",
    ],
    priklady:
      "Športovec, ktorého by si do party vybrali všetci; ten, kto odohrá sezónu v tieni a nikdy sa nesťažuje; hráč, ktorý po víťazstve hovorí len o tíme.",
    sekundarniRole:
      "Ako druhý v poradí dodáva profilu pokoru a spoľahlivosť: sťahuje primárny archetyp z výšin medzi ľudí a stráži, aby ambícia nešla cez vzťahy v tíme.",
    role:
      "V tíme je to nenahraditeľný tmel a často najlepší vicekapitán: má dôveru všetkých a nikoho neohrozuje. V individuálnom športe je to športovec, ktorý potrebuje tréningovú skupinu a v izolácii vädne. V oboch prípadoch mu dajte jasnú rolu a povedzte nahlas, že je dôležitá; sám si o to nepovie.",
    sTrenerem:
      "Trenie takmer nevzniká, a práve to je nebezpečné: tento typ konflikt neotvorí, len postupne stráca chuť. Tréner sa problém dozvie neskoro, obvykle až s oznámením o odchode. Pomáha pravidelný krátky rozhovor bez spúšťača, kde je otázka položená priamo a je čas na odpoveď.",
    znacka:
      "Navonok je tento typ najsympatickejší zo všetkých, pretože pôsobí ako človek od vedľa, a to je vo svete vyleštených profilov vzácnosť. Nesnaž sa to meniť na nafúkanú pózu. Hovor obyčajne, ukazuj prácu a ľudí okolo seba. Jediné, čo doplň, je odvaha priznať vlastnú ambíciu: skromnosť nie je to isté čo bezcieľnosť.",
  },

  milenec: {
    nazev: "Milenec",
    puvodni: "Lover",
    prezdivka: "Estét pohybu",
    motto: "Chcem, aby to bolo aj krásne.",
    touha: "prežiť šport naplno, telom aj vzťahmi",
    strach: "chlad, odmietnutie a ľahostajnosť ľudí, na ktorých mi záleží",
    dar: "vášeň, cit pre pohyb a schopnosť budovať blízke vzťahy",
    podstata:
      "Ty šport prežívaš. Nejde ti len o čísla, ale o to, ako sa to robí: čisto prevedený pohyb ti robí radosť sám o sebe a odbytý výkon ťa ruší, aj keď stačil na víťazstvo. Máš cit pre techniku, estetiku a atmosféru, ktoré sa nedajú naučiť z tabuľky. Rovnako silno prežívaš aj vzťahy: tréner pre teba nie je funkcia, ale človek, a keď je vzťah v poriadku, dokážeš veci, ktoré by si si {sám|sama} {netipoval|netipovala}. Práve to je aj tvoja zraniteľnosť. Chlad, irónia alebo ľahostajnosť zo strany trénera ťa zrazí viac než tvrdá kritika, pretože ju čítaš ako odmietnutie seba, nie výkonu. Prostredie, v ktorom sa cítiš nechcene, ti berie výkon rýchlejšie než únava. A pretože chceš, aby ťa ľudia mali radi, vieš dlho mlčať o veciach, ktoré by sa mali povedať nahlas. Najlepšia verzia tohto typu si vášeň udrží a pridá k nej hranice: dokáže mať ľudí {rád|rada} a pritom povedať nie.",
    vPodnikani:
      "V tréningu ťa ženie pôžitok z dobre prevedenej veci: opakuješ techniku, kým nesedí, a dávaš pozor na detaily, ktoré iní prehliadajú. Prostredie na teba pôsobí viac než na ostatných: hala, hudba, ľudia, dokonca aj vybavenie. V súťaži si {silný|silná} vtedy, keď sa cítiš dobre a máš okolo seba vzťahy v poriadku; v napätej atmosfére alebo po konflikte ide výkon dole skôr než u ostatných. Tvoja forma je citlivá na kontext a to nie je rozmar, to je spôsob, akým fungujete.",
    stin:
      "Tieňom je strata seba v túžbe byť {prijímaný|prijímaná}. Pod tlakom sa prispôsobuješ tomu, čo od teba okolie čaká, znášaš zaobchádzanie, ktoré by si {nemal|nemala}, a nepríjemné veci nepovieš, aby sa vzťah nepokazil. Druhá podoba tieňa je závislosť od priazne jedného človeka, obvykle trénera: keď ochladne, strácaš pôdu pod nohami. Tretia je forma nad obsahom, teda sústredenie na to, ako výkon vyzerá, na úkor toho, či funguje.",
    pasti:
      "Najčastejšia chyba je viesť tento typ chladom a odstupom, lebo vraj zmäkčuje. Výsledkom nie je tvrdosť, ale strata výkonu. Druhá pasca je irónia a zhadzovanie v šatni, ktoré tento typ nesie dlho a ticho. Tretia je podceňovať prostredie; investícia do atmosféry sa tu vracia na výsledkoch viac než u kohokoľvek iného.",
    navod: [
      "Tréneri, oddeľujte kritiku výkonu od vzťahu: povedzte nahlas, že ide o vec, nie o človeka. Pri tomto type to musí zaznieť, inak si to preloží ako odmietnutie.",
      "Nauč sa hovoriť nie bez pocitu viny: napíš si dopredu, čo pre teba nie je v poriadku, a jednu takú vetu vyskúšaj v bežnej situácii.",
      "Zabudujte do prípravy prostredie, ktoré funguje: miesto, ľudí, rituál pred štartom. Nie je to rozmaznávanie, je to súčasť výkonu.",
      "Stráž si závislosť od jedného vzťahu: maj okolo seba viac ľudí, ktorým veríš, aby jeden chladný týždeň nezrazil celú sezónu.",
      "Raz za mesiac si daj úprimný rozhovor o tom, čo si {zamlčal|zamlčala}, aby bol pokoj. To, čo sa nepovie, sa pri tomto type ukladá.",
    ],
    priklady:
      "Športovec, ktorý opakuje techniku, kým nie je pekná; ten, komu prekáža odbytý výkon aj po víťazstve; hráč, ktorý okamžite spozná, že s trénerom niečo nie je v poriadku.",
    sekundarniRole:
      "Ako druhý v poradí dodáva profilu cit a kvalitu prevedenia: pridáva primárnemu archetypu zmysel pre detail a schopnosť budovať vzťahy, na ktorých sa dá stavať v kríze.",
    role:
      "V tíme je to človek, ktorý drží atmosféru a vycíti, komu nie je dobre, skôr než to povie nahlas. V individuálnom športe je to športovec, ktorého výkon stojí a padá s kvalitou vzťahu s trénerom a s prostredím. V oboch prípadoch nepatrí do skupiny, kde je normou tvrdý sarkazmus.",
    sTrenerem:
      "Trenie vzniká na tóne, nie na obsahu. Vecná kritika povedaná chladne dopadne ako odsúdenie; tá istá veta s vysvetlením a pokojom funguje výborne. Druhé trenie vzniká z toho, že tento športovec problém dlho nepovie a potom príde s nahromadenou krivdou. Pomáha krátky pravidelný rozhovor, kde je priestor povedať aj drobnosť.",
    znacka:
      "Navonok je tento typ príťažlivý prirodzene: má štýl, prežitok a ľudský rozmer, ktorý sa dobre rozpráva. Buduj to na kvalite a estetike, nie na kontroverzii. Pozor len na to, aby si sa {nezačal|nezačala} točiť okolo obrazu seba; pod krásnou formou musí zostať vidieť prácu.",
  },

  sprymar: {
    nazev: "Šprýmar",
    puvodni: "Jester",
    prezdivka: "Bavič šatne",
    motto: "Keď je to len drina, robím to zle.",
    touha: "užiť si to tu a teraz a baviť ľudí okolo seba",
    strach: "nuda, ťažká atmosféra a bezvýznamnosť",
    dar: "ľahkosť, nadhľad a schopnosť zraziť napätie",
    podstata:
      "Tvoja zbraň je ľahkosť. Tam, kde iní stuhnú, ty vtipom zhodíš napätie, a je to jedna z najcennejších schopností v športe vôbec: rozhoduje sa totiž v hlavách, ktoré sú buď voľné, alebo zviazané. Vieš prísť do šatne pred najťažším zápasom a vrátiť ľuďom dych. {Sám|Sama} sa často najlepšie cítiš vtedy, keď nejde o život, a paradoxne vtedy podávaš najlepšie výkony, pretože ti telo pracuje uvoľnene. Riziko má dve podoby. Prvá je útek: vtipom uhýbaš pred rozhovormi, ktoré bolia, pred rozborom prehry, pred vlastným strachom. Druhá je povesť; okolie si ťa zaškatuľkuje ako toho vtipného a prestane s tebou počítať, keď ide o vážnu vec. Najlepšia verzia tohto typu je pod ľahkosťou smrteľne vážny profesionál: v príprave nekompromisný, v šatni vyslobodzujúci. Práve tá kombinácia robí z baviča lídra.",
    vPodnikani:
      "V tréningu si motor nálady: odľahčuješ, prinášaš energiu a ľudia chodia radšej. Monotónne dlhé bloky bez ľudí okolo ťa ničia. V súťaži funguješ najlepšie v uvoľnení: rituál, hudba, hláška, čokoľvek, čo sundá ťarchu. Tvoja slabina sú momenty, keď sa má ísť do vážneho sústredenia a udržať ho dlho, pretože prirodzene tiahneš k rozptýleniu, keď napätie rastie.",
    stin:
      "Tieňom je útek pred vážnosťou. Pod tlakom obrátiš na žart aj to, čo žart nie je: zlý výsledok, vlastnú únavu, konflikt v tíme. Rozbor sa odloží ďalšou historkou a problém zostane. Druhá podoba tieňa je humor ako zbraň, teda irónia, ktorá zraňuje, a zhadzovanie, ktoré si okolie nedovolí vrátiť. Tretia je závislosť od publika: bez reakcie ostatných strácaš energiu a berieš ticho ako odmietnutie.",
    pasti:
      "Najčastejšia chyba je humor zakázať. Tento typ potom stratí svoj hlavný nástroj a jeho výkon spadne. Druhá pasca je opačná: nechať mu prechádzať vtipkovanie aj vo chvíľach, keď tím potrebuje vážnosť. Tretia je nezveriť mu zodpovednosť len preto, že pôsobí ľahkovážne; často je pod tým ten najvnímavejší človek v skupine.",
    navod: [
      "Dohodnite sa, kedy sa nežartuje: rozbor, posledné minúty pred štartom, bezpečnosť, zdravie. Málo pravidiel, ale bez výnimky.",
      "Daj vážnym rozhovorom pevný čas a formu, nech sa pred nimi nedá utiecť. Dohodnite sa so svojím koučom na signáli, ktorým vás obidvoch zastaví vo chvíli, keď vtipom uhýbaš.",
      "Trénujte dlhé sústredenie cielene: bloky, kde je úlohou udržať pozornosť bez rozptýlenia, s rovnakou vážnosťou ako fyzická príprava.",
      "Používaj humor smerom k sebe a k situácii, nikdy na účet spoluhráča, ktorý nemá ako vrátiť. Tento rozdiel rozhoduje, či si líder, alebo problém.",
      "Ukáž raz za čas vážnu tvár verejne: rozbor, názor, poďakovanie bez pointy. Inak ťa okolie nebude brať vážne ani vo chvíli, keď budeš chcieť.",
    ],
    priklady:
      "Športovec, ktorý v šatni pred finále rozosmeje celý tím; ten, kto sa po prehre najprv zasmeje a až o tri dni povie, ako ho to vzalo; hráč, ktorého by nikto netipoval na drinu, ale odmaká všetko.",
    sekundarniRole:
      "Ako druhý v poradí dodáva profilu odľahčenie a nadhľad: bráni tomu, aby sa z primárneho archetypu stala zaťatá vážnosť, a otvára dvere tam, kde by samotný tlak narazil.",
    role:
      "V tíme je to nepostrádateľný ventil, ktorý drží atmosféru v dlhej sezóne; do roly, kde sa má tvrdo vyžadovať disciplína, sa nehodí. V individuálnom športe potrebuje okolo seba ľudí, pretože v izolácii stráca energiu. V oboch prípadoch mu dajte priestor baviť, ale jasne vymedzte chvíle, keď sa to nenosí.",
    sTrenerem:
      "Trenie vzniká, keď tréner číta humor ako neúctu alebo ako nezáujem. V skutočnosti je to spôsob, akým si tento typ sundáva tlak. Druhé trenie je vážne: tréner sa nikdy nedozvie, čo športovca naozaj trápi, pretože všetko skončí vtipom. Pomáha dohodnutý formát rozhovoru, kde sa nežartuje, a trpezlivosť počkať si na odpoveď.",
    znacka:
      "Navonok je tento typ zlato: siete, rozhovory, kamera, všade funguje a ľudia si ho pamätajú. Pozor na dve veci. Vtip musí niesť tvoje meno a tvoj šport, inak baví trh a tebe nezostane nič. A nikdy nekomentuj v afekte; čo je vtipné v šatni, býva vonku katastrofa.",
  },

  pecovatel: {
    nazev: "Opatrovateľ",
    puvodni: "Caregiver",
    prezdivka: "Opora tímu",
    motto: "Nenechám ťa v tom.",
    touha: "chrániť ľudí okolo seba a byť oporou",
    strach: "že niekoho sklamem a nechám ho v tom {samotného|samotnú}",
    dar: "obetavosť, vnímavosť a spoľahlivosť, na ktorú sa dá vsadiť",
    podstata:
      "Ty šport nerobíš len za seba. Vždy je v tom niekto ďalší: parťáci, rodina, mladší, ktorí sa pozerajú. Vidíš, komu nie je dobre, skôr než to povie, a nedokážeš ísť ďalej, keď niekto vedľa teba padá. Vďaka tomu si človek, na ktorého sa všetci spoľahnú, a v každej skupine si {ten|tá}, kto drží ostatných pohromade, keď sa nedarí. Tvoja motivácia je pevná, pretože nestojí len na tebe: drieš aj v dňoch, keď by sis {sám|sama} {dovolil|dovolila} poľaviť, pretože by si {nechcel|nechcela} sklamať. Riziko je sebaobetovanie. Dávaš aj to, čo nemáš: energiu, čas, pozornosť, pokoj, a svoje potreby odsúvaš tak dlho, až sa ozvú cez telo. V športe sa to prejaví presne tam, kde by nemalo: nepriznaná únava, prechádzané zranenie, výkon, ktorý ide dole, pretože sa staráš o všetkých okrem seba. Najlepšia verzia tohto typu sa naučí, že sýtiť ostatných sa dá len z plnej nádrže, a berie odpočinok ako povinnosť voči nim.",
    vPodnikani:
      "V tréningu si {obetavý|obetavá} a {spoľahlivý|spoľahlivá}: prídeš skôr, pomôžeš, počkáš. Si ten, kto podrží nováčika aj toho, kto práve prehráva. V súťaži ťa dvíha vedomie, že to robíš aj pre niekoho ďalšieho; naopak ťa zráža, keď cítiš, že si niekoho {sklamal|sklamala}. Znášaš veľkú záťaž, ale zle spoznáš, kedy je jej priveľa, pretože svoje potreby spracúvaš až ako posledné.",
    stin:
      "Tieňom je mučeníctvo. Dávaš, kým nedôjdeš, a potom potichu počítaš, kto ti to nevrátil. Zo starostlivosti sa stane tichý nárok na vďačnosť, a keď nepríde, prichádza horkosť. Druhá podoba tieňa je starostlivosť ako kontrola: rozhoduješ za ostatných, pretože predsa vieš, čo potrebujú. Tretia je vlastné zdravie na poslednom mieste: únava a bolesť sa nehlásia, pretože by to znamenalo byť príťažou.",
    pasti:
      "Najčastejšia chyba je zneužiť spoľahlivosť: naložiť tomuto typu viac, pretože nikdy nepovie nie. Druhá pasca je brať jeho starostlivosť ako samozrejmosť a nikdy ju nepomenovať nahlas. Tretia je nechať ho v role, kde sa stará o všetkých a nikto sa nestará o neho; presne tak vyhoria najlepší ľudia v tíme.",
    navod: [
      "Tréneri, pýtajte sa konkrétne na zaťaženie a bolesť. Na všeobecné ako sa máš odpovie tento typ vždy dobre, aj keď dobre nie je.",
      "Naplánuj si vlastnú regeneráciu ako záväzok voči ostatným: bez nabitej nádrže nie je z čoho dávať, a túto vetu si zopakuj, kedykoľvek ju budeš chcieť vynechať.",
      "Nauč sa rozlíšiť pomoc a preberanie zodpovednosti: čo je moja vec, čo je jeho a čo si má vyriešiť sám. Napíš si to, keď v tom nie je jasno.",
      "Pomenujte jeho rolu nahlas pred ostatnými. Tento typ si o uznanie nepovie, ale bez neho pomaly vyhasína.",
      "Raz za čas si dovoľ byť tým, kto prijíma: nechaj si pomôcť a poďakuj. Je to pre tento typ ťažšie než čokoľvek iné a najviac liečivé.",
    ],
    priklady:
      "Športovec, ktorý zostane po tréningu s tým, komu to nejde; ten, kto sa nikdy nesťažuje na vlastnú bolesť, ale stráži cudziu; hráč, ktorý drží tím pohromade v najhoršej sérii sezóny.",
    sekundarniRole:
      "Ako druhý v poradí dodáva profilu spoľahlivosť a ľudské teplo: pridáva primárnemu archetypu ohľad na ostatných a schopnosť udržať vzťahy aj po konflikte.",
    role:
      "V tíme je to najcennejší človek pre súdržnosť, ideálny parťák pre mladých a prirodzený kandidát na rolu, ktorá spája. V individuálnom športe potrebuje mať pre koho, inak mu motivácia splasne. V oboch prípadoch mu strážte hranice, pretože {sám|sama} si ich nenastaví.",
    sTrenerem:
      "Trenie vzniká málokedy a to je práve riziko: tento typ nesie aj to, čo niesť nemá, a tréner sa nič nedozvie. Druhé trenie vzniká, keď tréner tvrdo naloží niekomu v tíme; opatrovateľ to prežíva, akoby šlo o neho, a môže sa postaviť proti trénerovi nie kvôli sebe, ale kvôli druhým.",
    znacka:
      "Navonok je tento typ najdôveryhodnejšia tvár, akú šport má: dobrovoľníctvo, práca s mládežou, podpora tých, ktorí to nemajú ľahké. Buduj to na skutočných veciach, ktorým sa aj tak venuješ. Pozor len na to, aby si {nedával|nedávala} aj tam, kde to už berie výkon; obetavosť, ktorá ťa položí, nikomu nepomôže.",
  },

  tvurce: {
    nazev: "Tvorca",
    puvodni: "Creator",
    prezdivka: "Technik",
    motto: "Chcem to mať prevedené dokonale.",
    touha: "vypilovať výkon do podoby, ktorá nesie môj rukopis",
    strach: "odbytosť a priemerné prevedenie",
    dar: "technická precíznosť, predstavivosť a vlastný štýl",
    podstata:
      "Ty nechceš len vyhrať, ty to chceš mať správne prevedené. Spoznáš detail, ktorý nikto iný nevidí, a nekvalitný pohyb ťa fyzicky ruší, aj keď funguje. Tvoja výhoda je v tom, že tvoja technika drží aj pod tlakom a v únave, pretože je postavená poriadne a nie narýchlo. Máš vlastný štýl, ktorý sa pozná, a presne to býva dôvod, prečo sa ti darí tam, kde kópie druhých zlyhávajú. Riziko je latka. Tá istá náročnosť, ktorá ti postavila techniku, ťa vie zastaviť: odkladáš štart, pretože to ešte nie je ono, prerábaš veci, ktoré už fungujú, a v súťaži myslíš na prevedenie namiesto na výsledok. Šport však neplatí za dokonalosť v tréningu, platí za výkon v deň D. Najlepšia verzia tohto typu má dve latky: majstrovskú pre prípravu a použiteľnú pre preteky, a vie medzi nimi prepnúť.",
    vPodnikani:
      "V tréningu si {precízny|precízna} a {vytrvalý|vytrvalá}: opakuješ, pilníš, hľadáš lepšie prevedenie, a v technických blokoch si najlepší v skupine. V súťaži si {silný|silná} tam, kde rozhoduje kvalita prevedenia, a {zraniteľný|zraniteľná} tam, kde ide o improvizáciu a chaos. Najhoršie znášaš situácie, keď sa má ísť do pretekov s tým, čo je, pretože na doladenie nebol čas. Pripravená sezóna ti sadne, uponáhľaná ťa rozhodí.",
    stin:
      "Tieňom je perfekcionizmus, ktorý dusí. Pod tlakom prestaneš púšťať veci von: nie si {spokojný|spokojná}, tak to skúsiš znovu, a štart sa odkladá. Druhá podoba tieňa je posadnutosť detailom v nesprávnu chvíľu: v súťaži myslíš na techniku namiesto na súpera. Tretia je osobná zraniteľnosť pri kritike prevedenia, pretože ho vnímaš ako súčasť seba, nie ako vec, ktorá sa dá opraviť.",
    pasti:
      "Najčastejšia chyba je tento typ hnať do kvantity a odbaviť kvalitu; stratí zmysel a svoju hlavnú prednosť. Druhá pasca je opačná: nechať ho pilovať donekonečna a nikdy netlačiť na štart. Tretia je kritizovať prevedenie posmeškom, čo pri tomto type nezraní ego, ale identitu.",
    navod: [
      "Zaveďte dve latky: majstrovskú pre tréning a použiteľnú pre súťaž. Vopred si povedzte, čo je ktorá, nech dokonalosť neblokuje štart.",
      "Dajte termínom rovnakú váhu ako kvalite: dátum štartu je súčasť prípravy, nie až výsledok toho, že to konečne sedí.",
      "V súťaži prepni z prevedenia na úlohu: jedna jednoduchá vec, na ktorú myslíš. Techniku máš odmakanú, v pretekoch sa už nedoučí.",
      "Kritiku prevedenia oddeľte od človeka: hovorte o pohybe, nie o športovcovi. Pri tomto type to nie je zdvorilosť, ale podmienka, aby to počul.",
      "Zapisuj si, čo už je hotové a funguje. Tento typ vidí len to nedorobené a bez záznamu stráca pocit, že sa posúva.",
    ],
    priklady:
      "Športovec, ktorý si po tréningu sám dopilí jeden detail; ten, kto spozná chybu v technike na videu za sekundu; hráč, ktorého štýl spoznáte aj z diaľky.",
    sekundarniRole:
      "Ako druhý v poradí dodáva profilu kvalitu prevedenia a vlastný rukopis: pridáva primárnemu archetypu precíznosť, vďaka ktorej výkon drží aj pod tlakom.",
    role:
      "V tíme je to špecialista na prevedenie a prirodzený vzor pre mladších, ale nehodí sa do roly, kde sa má hlavne improvizovať a strhávať. V individuálnom športe je to typ, ktorý si techniku odmakáva sám a potrebuje trénera ako oko zvonku. V oboch prípadoch mu dajte oblasť, v ktorej smie byť najlepší.",
    sTrenerem:
      "Trenie vzniká na tempe: tréner chce ísť ďalej, športovec chce doladiť. Druhé trenie vzniká, keď sa tréner technike dostatočne nevenuje; tento typ potom stráca dôveru, pretože v tom vidí ľahostajnosť. Pomáha dohodnúť, kedy končí pilovanie a začína používanie.",
    znacka:
      "Navonok máš k dispozícii najlepší materiál zo všetkých typov: vlastný štýl a príbeh vzniku. Ukazuj prácu a detaily, ktoré nikto nevidí. Pozor len na to, aby výsledná prezentácia nebola rovnako odkladaná ako výkon; hotové a zverejnené poráža dokonalé a schované.",
  },

  vladce: {
    nazev: "Vládca",
    puvodni: "Ruler",
    prezdivka: "Kapitán",
    motto: "Ja to vezmem.",
    touha: "držať veci pod kontrolou a niesť zodpovednosť za celok",
    strach: "chaos a strata pozície",
    dar: "vodcovstvo, poriadok a schopnosť niesť tlak za ostatných",
    podstata:
      "Ty preberáš vedenie, aj keď ťa o to nikto nepožiada. Keď chýba poriadok, urobíš ho: rozdelíš roly, nastavíš pravidlá, zariadiš, čo treba. Máš vlastný systém prípravy, ktorý drží, aj keď sa na teba nikto nepozerá, a zodpovednosť ťa neťaží, skôr ťa upokojuje, pretože potom vieš, že je to na tebe. Práve preto ti ostatní veria: pôsobíš ako pevný bod, o ktorý sa dá oprieť, keď je zle. Riziko je kontrola. Nevieš pustiť z ruky ani to, čo by iní zvládli dosť dobre, takže na seba nabalíš viac, než sa dá uniesť, a potom sa čuduješ, že si {unavený|unavená} z vecí, ktoré nie sú tvoja práca. Chaos znášaš zle a improvizáciu vnímaš ako ohrozenie, aj keď je nutná. A pretože si nemôžeš dovoliť vyzerať slabo, o problémoch nehovoríš, kým nie sú neriešiteľné. Najlepšia verzia tohto typu buduje poriadok, ktorý funguje aj bez nej, a meria svoje vedenie tým, ako si okolie poradí, keď pri tom práve nie je.",
    vPodnikani:
      "V tréningu si {samostatný|samostatná} a {zodpovedný|zodpovedná}: plán dodržíš, aj keď nikto nekontroluje, a od ostatných čakáš to isté. V súťaži si {pokojný|pokojná} tam, kde je jasná štruktúra, a najsilnejší v role, kde na tebe niečo visí. Zle znášaš zmätok v organizácii, zmeny na poslednú chvíľu a ľudí, ktorí nedodržia dohodu; to ťa rozhodí viac než samotný súper. Dlhodobo rastieš stabilne, pretože staviaš systém, nie nadšenie.",
    stin:
      "Tieňom je tyrania a preťaženie. Pod tlakom uťahuješ kontrolu: chceš vidieť do všetkého, rozhoduješ za ostatných, a okolie sa naučí mlčať, pretože nesúhlas stojí energiu. Druhá podoba tieňa je zákaz slabosti u seba: radšej dotiahneš sezónu na doraz, než by si {priznal|priznala}, že to nejde. Tretia je tvrdosť k tým, ktorí fungujú inak než ty; nie každý potrebuje tvoj poriadok, aby podal výkon.",
    pasti:
      "Najčastejšia chyba je vziať tomuto typu zodpovednosť a nedať mu žiadnu rolu; hneď stratí motiváciu. Druhá pasca je naopak nechať na ňom všetko vrátane vecí, ktoré patria trénerovi alebo klubu. Tretia je spochybňovať jeho autoritu pred ostatnými; vecná výhrada medzi štyrmi očami prejde, verejné podkopnutie nie.",
    navod: [
      "Vymenujte, čo je jeho zodpovednosť a čo nie. Bez hranice si tento typ vezme aj to, čo mu nepatrí, a potom z toho vyhorí.",
      "Deleguj po kúskoch: vyber jednu vec za mesiac, ktorú pustíš z ruky niekomu inému, a nekontroluj ju. Tréningom sa to učí lepšie než rozhodnutím.",
      "Dohodnite si formát, kde smie priznať slabosť bez straty tváre: pravidelný rozhovor s trénerom len medzi štyrmi očami.",
      "Trénujte chaos zámerne: cvičenia so zmenou pravidiel na poslednú chvíľu. Tento typ sa potrebuje naučiť, že improvizácia nie je zlyhanie poriadku.",
      "Pýtaj sa, ako si tím poradil, keď si {chýbal|chýbala}. Dobré vedenie sa pozná podľa toho, čo funguje bez teba, nie podľa toho, čo drží len vďaka tebe.",
    ],
    priklady:
      "Športovec, ktorý si sám riadi prípravu a nepotrebuje dozor; ten, kto v kríze prevezme slovo v šatni; hráč, ktorého tréner posiela vysvetľovať veci mladším.",
    sekundarniRole:
      "Ako druhý v poradí dodáva profilu poriadok a zodpovednosť: pridáva primárnemu archetypu systém, spoľahlivosť a schopnosť uniesť tlak za ostatných.",
    role:
      "V tíme je to prirodzený kapitán a najlepšia spojka medzi trénerom a kabínou. V individuálnom športe je to športovec, ktorý si vedie prípravu do detailu sám a berie ju ako svoj projekt. V oboch prípadoch potrebuje jasne vymedzenú oblasť, kde velí, inak si vezme aj tú, kde veliť nemá.",
    sTrenerem:
      "Trenie vzniká o kompetencie: kto rozhoduje o čom. Tréner to číta ako podrývanie autority, športovec ako preberanie zodpovednosti. Druhé trenie prichádza, keď tréner mení veci narýchlo bez vysvetlenia. Pomáha napísať si roly a rozhodovacie hranice na začiatku sezóny, nie až v konflikte.",
    znacka:
      "Navonok pôsobíš prirodzene ako líder, čo je najcennejšia pozícia pre rolu kapitána, mentora alebo tváre klubu. Komunikuj pokojne a vecne, bez veľkých gest; autorita sa nekričí, konštatuje sa. Pozor na povýšenosť: čo je pre teba jasný poriadok, môže znieť zvonku ako poučovanie.",
  },
}
