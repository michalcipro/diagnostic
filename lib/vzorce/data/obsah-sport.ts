import type { VzorecId, VzorecObsah } from "../types"

// Texty vyhodnocení emocionálně-destruktivních vzorců, sportovní verze.
//
// Jádro je stejné jako v obsah.ts: jedenáct schémat, stejné domény, stejná
// pásma. Liší se všechno ostatní. Vzorec se u sportovce neprojevuje obecně,
// ale v konkrétních situacích, které jeho život tvoří: v koncovce, po chybě,
// při změně trenéra, po zranění, v boji o sestavu, na konci sezóny. Právě
// tyhle situace jsou tady popsané, protože podle nich klient vzorec pozná
// a kouč s ním umí pracovat.
//
// Psáno klientovi přímo, tykáním, bez odborného žargonu. Rodové tvary jsou
// označené {mužský|ženský} a rozvine je applyGender() při vykreslení.
//
// Diagnostická poznámka: názvy jsou sportovní, ale nejsou to nálepky. Každý
// z jedenácti vzorců odpovídá popsanému schématu, takže se výsledek dá číst
// společně s obecnou verzí i s odbornou literaturou.

export const OBSAH_SPORT: Record<VzorecId, VzorecObsah> = {
  "01": {
    nazev: "Strach z opuštění",
    tema: "Ztráta zázemí a jistoty místa",
    motto: "Až přestanu podávat výkon, zůstanu {sám|sama}.",
    prozitek:
      "Někde uvnitř máš jistotu, že lidi, kteří tě ve sportu drží, nakonec neztratíš náhodou, ale zákonitě. Trenér odejde, spoluhráč přestoupí, klub změní plány, zájem opadne. I v období, kdy se daří, čekáš, kdy se to zlomí. Tahle jistota nestojí na tom, co se právě děje, a proto ji nevyvrátí ani nová smlouva, ani jistá pozice v sestavě. Vzniká často dřív, než si člověk pamatuje, a proto je pod ní cítit něco starého a naléhavého: pár dní bez pozornosti trenéra spustí paniku, která je na situaci zjevně příliš velká. Reakce bývá jedna ze dvou. Buď se přimkneš blíž, ověřuješ, ptáš se, žádáš ujištění, a čím víc ho dostaneš, tím kratší dobu vydrží. Nebo si naopak držíš odstup, protože co si nepustíš k tělu, to tě nemůže opustit. Obojí vypadá zvenčí jinak, ale dělá totéž: chrání tě před ztrátou a zároveň brání tomu, aby vztah s trenérem nebo týmem zesílil natolik, že by ztrátu unesl. Poznáš to podle nepoměru: síla reakce neodpovídá tomu, co se právě stalo.",
    podTlakem:
      "Pod tlakem se zkracuje tvoje tolerance k nejistotě. Nezvednutý telefon, změněný tón na tréninku nebo pár dní bez zpětné vazby se okamžitě čtou jako začátek konce. Rozhodnutí pak neděláš podle toho, co je pro tvou kariéru dobré, ale podle toho, co udrží druhého na místě: přijmeš roli, která ti nesedí, nebo mlčíš tam, kde bys {měl|měla} mluvit. V koncovce se to projeví opatrností, protože chyba se v téhle logice netrestá ztrátou bodu, ale ztrátou přízně.",
    puvod:
      "Za vzorcem stojí zkušenost, že blízkost je nespolehlivá. Nemusí jít o dramatickou ztrátu. Stačí rodič, který byl jednou vřelý a podruhé nedostupný, nemoc v rodině, opakované stěhování a ztráta kamarádů, nebo trenér z dětství, jehož nálada se nedala předvídat. Dítě si z toho neodnese myšlenku, ale tělesnou zkušenost: to, co mám {rád|ráda}, se může každou chvíli ztratit. A protože se to naučilo dřív než slova, nedá se to přepsat argumentem. Vědět, odkud to je, vzorec nezruší; změní se ale jedna věc, přestaneš to brát jako svoji vadu.",
    pasma: {
      "velmi-nizka":
        "Tenhle vzorec u tebe prakticky nesvítí. Změny v týmu tě zasáhnou, ale nedefinují, jak sportuješ.",
      nizka:
        "Vzorec je přítomný jen okrajově. Objeví se při větší změně a zase odejde.",
      stredni:
        "Vzorec je aktivní a v zátěži se dá poznat. V klidu ho přehlušíš, před koncem sezóny nebo při změně trenéra se hlásí.",
      vysoka:
        "Vzorec výrazně ovlivňuje, jak prožíváš vztahy v týmu a jaká rozhodnutí o kariéře děláš.",
      dominantni:
        "Vzorec je dominantní. Strach ze ztráty zázemí je do velké míry tím, co řídí tvoje sportovní rozhodování. Bez práce s ním se ostatní témata hýbou jen málo.",
    },
  },

  "02": {
    nazev: "Nedůvěra",
    tema: "Očekávání zrady a hlídání vlastní pozice",
    motto: "Nikomu tady nemůžu věřit naplno.",
    prozitek:
      "Základní nastavení zní, že lidé v tvém okolí dřív nebo později využijí to, co o tobě vědí. Nemusí jít o vědomé podezření. Je to spíš trvale zapnutá ostražitost, která běží i tam, kde je zbytečná: sleduješ, komu trenér nadržuje, ověřuješ si, co ti kdo řekl, a hledáš, co je za tím. Když tě někdo pochválí, první otázka je, co za to. Sport tenhle vzorec živí přirozeně, protože konkurence uvnitř týmu je skutečná a o místo v sestavě se opravdu soupeří. Rozdíl je v míře: ostražitost tě nechrání, ale drží ve stálém napětí, protože nikdy nemáš dost důkazů. Ochranných strategií bývá několik. Nepustíš nikoho blíž, než kam dosáhne škoda. Nebo ukážeš tvrdost první, aby tě nepředběhli. Nebo si držíš dokonalý přehled, protože kdo má informace, ten nebude {překvapen|překvapena}. Nejvíc to bolí u lidí, kteří ti jsou nejblíž, protože právě u nich má zrada největší cenu.",
    podTlakem:
      "Pod tlakem se ostražitost mění v obranu. Nesouhlas trenéra čteš jako útok, technickou poznámku jako zpochybnění, rozbor jako pokus tě shodit. Reakce přijde rychle a bývá tvrdší, než situace zaslouží, a to i vůči lidem, kteří ti nic neudělali. Cena se přitom neplatí v konfliktu, ale ve vztazích: okolí si postupně odvykne přinášet ti nepříjemné informace, a tím zmizí právě to, co bys ke zlepšení potřeboval.",
    puvod:
      "Vzorec vzniká tam, kde chybělo základní bezpečí. Někdy jde o týrání, ponižování nebo zneužití, jindy o mírnější, ale opakovanou zkušenost: dospělý, který sliboval a nedodržel, který zesměšnil svěřené tajemství, trenér, který před ostatními shodil to, co jsi mu {svěřil|svěřila}. Dítě si z toho udělá rozumný závěr: bezpečně je jen tehdy, když jsem ve střehu. V dětství to byla správná strategie. V dospělém sportu brání přesně tomu, co potřebuješ nejvíc, tedy vztahu, ve kterém se dá pracovat na chybách nahlas.",
    pasma: {
      "velmi-nizka": "Vzorec je prakticky neaktivní. Důvěru dáváš podle toho, co se opravdu stalo.",
      nizka: "Objevuje se okrajově, spíš jako opatrnost než jako nedůvěra.",
      stredni: "Vzorec je aktivní. V bezpečném prostředí ustoupí, v boji o pozici se ostražitost vrací.",
      vysoka: "Vzorec výrazně ovlivňuje, jak blízko si spoluhráče i trenéra pouštíš.",
      dominantni:
        "Vzorec je dominantní. Ostražitost je základní režim, ne výjimka. Změna začíná u jednoho vztahu, ne u postoje k týmu jako celku.",
    },
  },

  "03": {
    nazev: "Citová deprivace",
    tema: "Emoční hlad a pocit, že nikdo nevidí cenu výkonu",
    motto: "Nikdo neví, co mě to stojí.",
    prozitek:
      "Tenhle vzorec se špatně popisuje, protože nemá tvar myšlenky. Je to spíš trvalý pocit prázdna a osamělosti, který nezmizí ani uprostřed týmu, který funguje. Zajímá je výsledek, ne ty. Nikdo se nezeptá, jak ti po zápase doopravdy bylo. Nikdo tu není tak, jak bys potřeboval. Ve sportu se to snadno schová, protože prostředí odměňuje samostatnost a tichou dřinu; tvoje okolí často ani netuší, že něco chybí. Často se to pozná až podle toho, koho si vybíráš: přitahují tě lidé, kteří citově nedosáhnou tam, kam potřebuješ, a tak se prázdno potvrdí. Nebo vztah, i ten s trenérem, začne nadějně a po čase přijde zklamání, protože druhý nikdy nedá dost. Zvenčí to vypadá jako náročnost. Zevnitř je to hlad. Nejtěžší část bývá, že si o blízkost neumíš říct: buď to nepovažuješ za možné, nebo přijmout péči znamená vydat se všanc.",
    podTlakem:
      "Pod tlakem se stahuješ. Místo aby ses {opřel|opřela} o lidi kolem, přestaneš sdílet a poneseš to {sám|sama}, protože kdesi vevnitř máš jistotu, že stejně nikdo nepřijde. Po zranění nebo v období bez formy je to nejvíc vidět: mlčíš tam, kde by stačila jedna věta. Druhý přitom obvykle nic netuší, protože zvenčí působíš soběstačně a nemá důvod se ptát.",
    puvod:
      "Chybělo něco, co dítě potřebuje stejně jako jídlo: pozornost, vřelost, porozumění a citlivé vedení. Nemuselo jít o zanedbání. Rodiče mohli být pečliví v tom, co je vidět, tedy vozit na tréninky a platit vybavení, a nedostupní v tom, co se cítí. Byli zaneprázdnění, chladní, sami citově prázdní, nebo prostě neuměli být s emocí dítěte. Dítě z toho neudělá stížnost, protože jinou zkušenost nemá; udělá z toho normu. Právě proto se ten pocit tak špatně popisuje: nechybí vzpomínka na něco zlého, chybí vzpomínka na něco, co se nikdy nestalo.",
    pasma: {
      "velmi-nizka": "Vzorec je prakticky neaktivní. Blízkost umíš přijímat i dávat.",
      nizka: "Objevuje se jen okrajově, v obdobích, kdy jsi na kontakt chudší.",
      stredni: "Vzorec je aktivní. Pocit nepochopení se vrací a ovlivňuje, jak hodnotíš zázemí kolem sebe.",
      vysoka: "Vzorec výrazně ovlivňuje tvoje vztahy v týmu i to, koho si k sobě pouštíš.",
      dominantni:
        "Vzorec je dominantní. Emoční hlad je základní tón, na kterém stojí ostatní témata. Prvním krokem není víc blízkosti, ale schopnost si o ni říct.",
    },
  },

  "04": {
    nazev: "Pocit vyloučení",
    tema: "Pocit odlišnosti a nepatření do skupiny",
    motto: "Do téhle kabiny nepatřím.",
    prozitek:
      "Základním pocitem je osamělost ve skupině, ne o samotě. V kabině stojíš mimo, i když tě nikdo nevylučuje. Existují dvě podoby a mohou se prolínat. První říká: nechtějí mě. Mezi spoluhráči se cítíš {nedostatečný|nedostatečná}, nevíš, o čem mluvit, ostatní ti připadají uvolněnější, a celou společnou akci přečkáváš s úlevou, až budeš moct odejít. Druhá říká: jsem jiný. Nemusí v ní být pocit méněcennosti, spíš trvalé vědomí, že do téhle party nepatříš, protože jsi z jiného těsta. Důležité je, že tenhle vzorec se týká skupin, ne blízkých vztahů. S jednotlivci, které znáš, ti může být dobře; jakmile je lidí víc, na soustředění nebo na srazu, spustí se to znovu. Dobrá zpráva je, že má úzkou působnost: když se skupina rozpadne na jednotlivé rozhovory, obvykle zmizí i on.",
    podTlakem:
      "Pod tlakem se vyhýbáš. Nepřijmeš pozvání, nepřihlásíš se o slovo na poradě, neprosadíš svůj nápad před ostatními, na společné akci zůstaneš na kraji. Každé vyhnutí krátkodobě uleví a dlouhodobě vzorec potvrdí, protože zkušenost, která by ho vyvrátila, se nemá kde stát. Navíc má vždycky rozumné vysvětlení: únava, regenerace, jiný program.",
    puvod:
      "Na rozdíl od emočního hladu tenhle vzorec obvykle nevzniká doma, ale mezi vrstevníky. Bylo to vyloučení z party, posmívání, rodina, která se něčím nápadně lišila, přestup do oddílu, kam jsi {nezapadl|nezapadla}, nebo jen dlouhé období, kdy jsi {byl|byla} v kolektivu ten poslední. Někdy stačí jediné dost silné období. Dítě si z toho odvodí pravidlo o sobě, ne o té skupině, a ten závěr se pak nikdy nepřezkoumá: parta, která tě tehdy nepřijala, dávno neexistuje, pravidlo platí dál.",
    pasma: {
      "velmi-nizka": "Vzorec je prakticky neaktivní. Ve skupině se pohybuješ přirozeně.",
      nizka: "Objevuje se okrajově, v novém týmu nebo na srazu, kde nikoho neznáš.",
      stredni: "Vzorec je aktivní. V kabině stojíš spíš stranou, než bys {chtěl|chtěla}.",
      vysoka: "Vzorec výrazně ovlivňuje, kam chodíš, co si dovolíš říct a jak velkou skupinu uneseš.",
      dominantni:
        "Vzorec je dominantní. Pocit, že nepatříš, je stálý a řídí tvoje volby. Změna nepřijde z rozhodnutí, ale z opakované zkušenosti ve skupině.",
    },
  },

  "05": {
    nazev: "Závislost na vedení",
    tema: "Nejistota v samostatném rozhodování",
    motto: "{Sám|Sama} se rozhodnout neumím.",
    prozitek:
      "Samostatné rozhodování ti připadá jako něco, na co nemáš dost sil. Nejde o lenost ani o skutečnou neschopnost, často zvládáš mnohem víc, než si připouštíš. Jde o pocit, že bez vedení to neustojíš. Nová situace ve hře vyvolá úzkost, rozhodnutí se odkládá, dokud nepřijde pokyn z lavičky, a i po něm zůstává pochybnost, jestli to nebyla chyba. Vlastnímu úsudku nevěříš, a tak si ho necháváš potvrzovat. Existuje i obrácená podoba, která vypadá jako pravý opak: nezávislost tak zásadová, že nepřijmeš pomoc, ani když ji opravdu potřebuješ, protože přijmout ji by znamenalo připustit, že {sám|sama} nestačíš. Obě podoby stojí na stejné větě. Zrádné je, že rozhodnutí, která ti někdo potvrdí, ti jistotu nepřidají; přidají ji jen ta, která uděláš a ustojíš {sám|sama}.",
    podTlakem:
      "Pod tlakem se rozhodování zastaví. Hledáš očima lavičku, čekáš na pokyn, nebo se rozhodnutí vyhneš tak dlouho, až ho udělá čas a situace se zavře sama. Odpovědnost se přesouvá jinam a s ní i pocit, že máš na svůj výkon vliv. Nejde přitom o velká rozhodnutí; jistota se staví na malých, kterých je ve hře hodně.",
    puvod:
      "Vzorec obvykle nevzniká z nedostatku péče, ale z jejího přebytku. Rodič nebo trenér, který dělal věci za tebe rychleji a lépe, který tě chránil před chybou, který dával najevo úzkost, kdykoli jsi něco {zkusil|zkusila} {sám|sama}. Dítě z toho vyvodí, že svět je nebezpečnější a ono samo méně schopné, než je pravda. Někdy působí i opak: prostředí tak nepředvídatelné, že se samostatnost nedala bezpečně vyzkoušet. Proto tenhle vzorec často nese pocit viny, protože rodič to myslel dobře a dítě to ví.",
    pasma: {
      "velmi-nizka": "Vzorec je prakticky neaktivní. Ve hře se rozhoduješ {sám|sama} a stojíš si za tím.",
      nizka: "Objevuje se okrajově, u velkých nebo neznámých rozhodnutí.",
      stredni: "Vzorec je aktivní. Bez potvrzení zvenčí se rozhoduje výrazně hůř.",
      vysoka: "Vzorec výrazně ovlivňuje tvoji samostatnost ve hře i v kariéře.",
      dominantni:
        "Vzorec je dominantní. Otázka, jestli to zvládneš {sám|sama}, stojí pod většinou rozhodnutí. Každé rozhodnutí, které uděláš {sám|sama}, ubírá vzorci kus síly.",
    },
  },

  "06": {
    nazev: "Strach z ohrožení",
    tema: "Katastrofizace, obavy ze zranění a ze ztráty kontroly",
    motto: "Něco se stane a já to neustojím.",
    prozitek:
      "Očekáváš, že se stane něco zlého, a zároveň že tomu nedokážeš zabránit. Vzorec pracuje ve dvou směrech najednou: zvětšuje nebezpečí a zmenšuje tvoji schopnost mu čelit. Proto nepomáhá, když si spočítáš, jak je něco nepravděpodobné. Ve sportu má obvykle čtyři podoby a nemusíš mít všechny. Tělo a zranění, kdy sleduješ každý signál a hledáš, co znamená. Nebezpečí zvenčí, tedy cestování, souboje, konkrétní prvky nebo úseky trati. Existenční rovina, tedy strach, že o kariéru přijdeš ze dne na den. A ztráta kontroly, tedy obava, že se v klíčové chvíli neudržíš nebo se sesypeš před lidmi. Nejnáročnější na tom bývá, že úzkost neubývá tím, že se nic nestane: každý den bez katastrofy je jen den, kdy zatím nepřišla. Úzkost si totiž neplete pravděpodobnost s možností náhodou; dokud je něco možné, tělo to počítá jako hrozbu.",
    podTlakem:
      "Pod tlakem se zužuje výběr. Rozhoduješ se tak, abys {minimalizoval|minimalizovala} riziko, ne abys něčeho {dosáhl|dosáhla}. Souboje, prvky nebo řešení, která by se vyplatila, obcházíš dřív, než se stihnou zvážit, a pozornost se drží u toho, co by se mohlo pokazit. Po návratu ze zranění se to pozná nejlíp: pohyb je technicky v pořádku, jen se mu tělo vyhýbá.",
    puvod:
      "Za vzorcem obvykle stojí dospělý, který svět ukazoval jako nebezpečné místo. Přehnaně ochraňující rodič, který varoval před vším, sám žil v úzkosti a dával najevo, že venku číhá pohroma. Nebo naopak skutečné ohrožení v dětství: vážná nemoc v rodině, úraz, chudoba, nestabilní domov. Dítě si z toho odnese dvě přesvědčení najednou, že svět je nebezpečný a že ono na něj nestačí. Nepamatuje si přitom varování, pamatuje si tón, a právě proto na to nezabírají čísla ani statistiky.",
    pasma: {
      "velmi-nizka": "Vzorec je prakticky neaktivní. Riziko vnímáš věcně a přiměřeně.",
      nizka: "Objevuje se okrajově, v období únavy nebo po zranění.",
      stredni: "Vzorec je aktivní. Katastrofické scénáře se vracejí a berou energii před výkonem.",
      vysoka: "Vzorec výrazně ovlivňuje, do čeho ve hře jdeš a čemu se raději vyhneš.",
      dominantni:
        "Vzorec je dominantní. Očekávání ohrožení je trvalé pozadí, na kterém se rozhoduješ. Zmenšuje se tím, že se ověří, ne tím, že se vysvětlí.",
    },
  },

  "07": {
    nazev: "Méněcennost",
    tema: "Stud a obava, že se pozná, kdo doopravdy jsem",
    motto: "Kdyby mě poznali blíž, přestali by si mě vážit.",
    prozitek:
      "Hlavním pocitem je stud. Ne vina za to, co jsi {udělal|udělala}, ale stud za to, co jsi. Někde uvnitř máš přesvědčení, že je v tobě něco vadného, a že kdyby to lidé viděli, odešli by. Proto se to schovává: části sebe neukazuješ ani spoluhráčům, se kterými trávíš víc času než s rodinou. Vzniká rozdíl mezi tím, koho tým zná, a tím, kdo si myslíš, že doopravdy jsi. Na rozdíl od pocitu, že nepatříš do kabiny, tenhle vzorec sílí právě s blízkostí: čím blíž si někoho pustíš, tím větší je riziko odhalení. Chování z toho plyne dvojí a často se střídá. Buď se blízkosti vyhýbáš, nebo si vybíráš lidi, kteří tě kritizují, protože ti sedí do obrazu, který o sobě máš. Pochvala se přitom neudrží, sklouzne po povrchu; kritika zapadne přesně. Rozdíl proti zdravé sebekritice je v tom, kde se zastaví: sebekritika skončí u chyby, stud pokračuje k závěru o tom, kdo jsi.",
    podTlakem:
      "Pod tlakem se stud změní v sebekritiku, která je tvrdší než cokoli, co by ti řekl trenér. Chybu si nesundáš ze zad ani po dobrém zápase. Buď se stáhneš, aby nebylo co odhalit, tedy nebudeš chtít míč v rozhodující chvíli, nebo předběhneš kritiku tím, že se shodíš {sám|sama}. Úlevu přitom přináší přesně to, co vzorec živí: schovat se.",
    puvod:
      "Vzorec staví opakovaná kritika od někoho, na kom záleželo. Rodič nebo trenér, který srovnával, ponižoval, dával najevo zklamání nebo lásku podmiňoval výkonem. Nemuselo jít o tvrdost, stačí chlad a trvalá nespokojenost. Dítě nemá jak dojít k závěru, že problém je v dospělém; dojde k jedinému možnému vysvětlení, tedy že je to jím. Proto se tenhle vzorec nedá přebít úspěchem: výkon dokazuje, co umíš, a stud mluví o tom, co jsi.",
    pasma: {
      "velmi-nizka": "Vzorec je prakticky neaktivní. Nedokonalosti unesou být vidět.",
      nizka: "Objevuje se okrajově, po nezdaru nebo tvrdé kritice.",
      stredni: "Vzorec je aktivní. Stud se vrací a ovlivňuje, kolik ze sebe v týmu ukážeš.",
      vysoka: "Vzorec výrazně ovlivňuje tvůj vztah k sobě i to, jak blízko si lidi pustíš.",
      dominantni:
        "Vzorec je dominantní. Stud je základní vrstva, přes kterou se díváš na všechno ostatní. Ustupuje jedině tam, kde tě někdo uvidí a neodejde.",
    },
  },

  "08": {
    nazev: "Strach ze selhání",
    tema: "Výkonová nedůvěra a syndrom podvodníka",
    motto: "Na tuhle úroveň nemám.",
    prozitek:
      "Ve výkonu se srovnáváš s ostatními a vycházíš z toho jako ten pod průměrem. Nejde o to, že by ses {bál|bála} náročných úkolů. Jde o jistotu, že v porovnání s vrstevníky jsi {zaostal|zaostala}, i když čísla říkají něco jiného. Odtud pramení dvě podoby. První je stažení: nejdeš do situací, které bys nejspíš {zvládl|zvládla}, protože očekávaný neúspěch se nedá snést. Druhá je syndrom podvodníka: výsledky máš, ale nepovažuješ je za svoje a čekáš, kdy se přijde na to, že na tuhle úroveň nepatříš. Vzorec pracuje jako sebenaplňující předpověď: protože do věcí nejdeš naplno nebo do nich nejdeš vůbec, výsledky tomu odpovídají, a to se pak čte jako potvrzení. Důležité je rozlišení od perfekcionismu: strach ze selhání znamená očekávat od sebe příliš málo ve srovnání s ostatními, perfekcionismus příliš mnoho ve srovnání s nedosažitelnou metou. Sleduj přitom, s kým se srovnáváš; vzorec si vybírá měřítko tak, aby vyšlo.",
    podTlakem:
      "Pod tlakem přijde odklad nebo únik. Do souboje se nepřidáš, řešení se přenechá jinému, cíl se sníží, příležitost se pustí. Někdy naopak přijde přehnaná práce, ale bez radosti z výsledku, protože žádný výsledek nestačí na to, aby přesvědčil. Nebezpečné je, že odklad se tváří rozumně: vždycky existuje důvod, proč zrovna teď není vhodná chvíle.",
    puvod:
      "Bývá za tím prostředí, kde se výkon srovnával a srovnání vycházelo špatně. Sourozenec nebo spoluhráč, kterého dávali za vzor, oddíl, ve kterém jsi {nestačil|nestačila}, rodič, který dal najevo zklamání nebo naopak nepomohl tam, kde jsi to {potřeboval|potřebovala}. Někdy je příčinou pozdější tělesný vývoj než u vrstevníků nebo sport zvolený podle přání rodičů. Závěr o vlastních možnostech se přitom udělal v době, kdy jsi {neměl|neměla} skoro žádná data, a od té doby se už jen potvrzoval.",
    pasma: {
      "velmi-nizka": "Vzorec je prakticky neaktivní. Svým schopnostem věříš přiměřeně.",
      nizka: "Objevuje se okrajově, po nezdaru nebo na nové úrovni soutěže.",
      stredni: "Vzorec je aktivní. Srovnávání s ostatními bere jistotu a chuť jít do rizika.",
      vysoka: "Vzorec výrazně ovlivňuje, jaké cíle si dovolíš a jak čteš vlastní výsledky.",
      dominantni:
        "Vzorec je dominantní. Očekávání neúspěchu předchází většině výkonových rozhodnutí. Ustoupí až po zkušenosti, kterou si nepůjde vysvětlit jako náhodu.",
    },
  },

  "09": {
    nazev: "Podřízení se",
    tema: "Přizpůsobení, potlačení sebe a ztráta hranic",
    motto: "Nakonec udělám, co chtějí ostatní.",
    prozitek:
      "Žiješ podle toho, co chtějí druzí, a vlastní potřeby dáváš stranou tak samozřejmě, že si toho často ani nevšimneš. Konfliktu se vyhýbáš, ustupuješ, dokud to jde, a když někdy dáš přednost sobě, přijde vina. Ve sportu je to obzvlášť zrádné, protože přizpůsobení tady vypadá jako profesionalita: trénuješ i přes bolest, mlčíš o únavě, přijmeš roli, která ti nesedí, přizpůsobíš se stylu hry, který ti nevyhovuje. Jsou dvě varianty. Poddajnost, kdy se přizpůsobuješ ze strachu z hněvu nebo ztráty místa. A sebeobětování, kdy se přizpůsobuješ proto, že cítíš potřeby druhých tak silně, že jinak to nejde. Zvenčí to vypadá jako týmovost a často to týmovost i je; rozdíl je v tom, že tady si to nevybíráš. Pod povrchem se přitom hromadí hněv, který se nemá kde vybít, a proto vychází nepřímo: pasivitou, otálením, únavou, tělesnými potížemi nebo nečekaným výbuchem.",
    podTlakem:
      "Pod tlakem řekneš ano dřív, než si stihneš spočítat kapacitu. Vlastní hranice zmizí první a jako poslední se přizná, že už to nejde. Vyčerpání pak nepřijde z tréninku, ale z toho, že se v něm nikde nepočítá s tebou. Pozná se to podle únavy, která nedává smysl: síly dojdou z běžného týdne, protože pod ním leží ustupování.",
    puvod:
      "Za vzorcem stojí dospělý, jehož vůli nešlo bezpečně odmítnout. Rodič dominantní, nevyzpytatelný, trestající, nebo naopak křehký a nemocný, kterého nešlo zatížit. Někdy trenér, u kterého se nesouhlas trestal lavičkou. V obou případech se dítě naučilo, že mít vlastní potřebu je nebezpečné nebo sobecké. Vlastní chtění se proto raději utlumilo dřív, než se stihlo vyslovit, a dodnes se nejeví jako potřeba, ale jako sobectví.",
    pasma: {
      "velmi-nizka": "Vzorec je prakticky neaktivní. Své potřeby umíš pojmenovat i prosadit.",
      nizka: "Objevuje se okrajově, vůči trenérovi nebo v blízkých vztazích.",
      stredni: "Vzorec je aktivní. Hranice se drží hůř, než bys {chtěl|chtěla}, hlavně v konfliktu.",
      vysoka: "Vzorec výrazně ovlivňuje, kolik prostoru ve vlastní kariéře máš.",
      dominantni:
        "Vzorec je dominantní. Přizpůsobení je základní režim a vlastní chtění se skoro neozve. První krok není konflikt, ale vyslovená potřeba v bezpečném vztahu.",
    },
  },

  "10": {
    nazev: "Perfekcionismus",
    tema: "Nikdy nekončící nároky a výkonová identita",
    motto: "Nikdy to nestačí.",
    prozitek:
      "Základní pocit je tlak a nedostatek času. Něco tě pořád žene dopředu, takže není kde se zastavit, a i regenerace se změní v úkol, který je potřeba zvládnout dobře. Musíš být nejlepší ve všem, na čem ti záleží, druhé místo se nepočítá. Zvenčí to vypadá jako profesionalita, zevnitř jako nikdy nekončící nedostatečnost, protože laťka se posouvá spolu s tebou. Rozeznávají se tři podoby a mohou se prolínat. Kompulzivní, kdy musí být všechno v perfektním pořádku, od vybavení po rituály, a každá maličkost dokáže rozhodit. Zaměřená na dosahování, kdy se všechno včetně volného času promění v přípravu. A zaměřená na postavení, kdy jde o uznání, žebříčky a obdiv, a která bývá kompenzací studu nebo pocitu, že nepatříš. Nejdřív to obvykle odnese vztah a zdraví, protože obojí se dá odložit a nic hned neřekne. Nejjednodušší kontrola zní: kdy jsi naposledy {měl|měla} pocit, že to stačilo?",
    podTlakem:
      "Pod tlakem nezvolníš, ale zrychlíš. Přibereš si další trénink navíc, další analýzu, další povinnost, jako by právě ta příští věc konečně přinesla úlevu. Chyba se netrestá nápravou, ale sebekritikou, a regenerace se odsune jako první. Přidat si práci je přitom úleva, ne řešení: dokud se něco dělá, není čas cítit, že to nestačí.",
    puvod:
      "Vzorec staví podmíněná láska. Ocenění přicházelo za výkon, ne za to, že jsi. Jeden nebo oba rodiče měli nároky, které nešlo naplnit, byli sami perfekcionisté, dávali za vzor sebe, nebo tvrdě reagovali, když jsi jejich očekávání {nesplnil|nesplnila}. Pro dítě se dosahování stalo způsobem, jak si zajistit lásku a bezpečí. Proto je vzorec dodnes propojený s pudem sebezáchovy a proto tak vzdoruje rozumným argumentům: zpomalit znamená pro tělo riskovat lásku.",
    pasma: {
      "velmi-nizka": "Vzorec je prakticky neaktivní. Nároky na sebe máš vysoké, ale unesitelné.",
      nizka: "Objevuje se okrajově, ve výkonově vypjatých obdobích sezóny.",
      stredni: "Vzorec je aktivní. Laťka je vysoko a regenerace se odkládá častěji, než je zdrávo.",
      vysoka: "Vzorec výrazně ovlivňuje tvoje tempo, vztahy i to, kolik si dovolíš odpočívat.",
      dominantni:
        "Vzorec je dominantní. Výkon je tvoje identita a zastavení se cítí jako ohrožení. Zpomalení se tady trénuje jako dovednost, ne jako předsevzetí.",
    },
  },

  "11": {
    nazev: "Nárokovost",
    tema: "Nárok na výjimku, impulzivita a problém s omezením",
    motto: "Na mě běžná pravidla neplatí.",
    prozitek:
      "Máš pocit, že se na tebe běžná omezení tak úplně nevztahují, a že tvoje potřeby mají přednost. Když ti trenér odporuje nebo ti něco překazí, přijde vztek, který je na situaci nepřiměřený. Vzorec má tři podoby a mohou se překrývat. Nárokovost, kdy si žádáš výjimku z týmových pravidel a do druhých se nevcítíš, protože tě to prostě nenapadne. Závislá podoba, kdy se výjimečnost pojí s očekáváním, že se o tebe klub nebo trenér postará, protože je to jeho povinnost. A impulzivní podoba, kdy je problém vydržet nepohodlí: těžko se odkládá potěšení, těžko se dokončuje nudná část přípravy a špatně se přestává s tím, co krátkodobě uleví. Zvenčí působí tenhle vzorec sebejistě a v talentovaném sportovci ho okolí dlouho toleruje. Uvnitř bývá pod ním něco docela jiného, nejčastěji stud nebo prázdno, které se nárokovostí přehlušuje. Nejspolehlivější stopa je vztek na maličkost.",
    podTlakem:
      "Pod tlakem klesá tolerance k omezení. Pravidla, čekání a kompromis se stanou nesnesitelnými, rozhodnutí se dělají rychle a impulzivně, a následky se řeší až potom. Vztahy v týmu to obvykle odnesou dřív než výsledky, a právě proto se vzorec drží tak dlouho: jeho cena se platí jinde než u tebe.",
    puvod:
      "Za vzorcem stojí buď absence hranic, kdy dítě dostalo všechno a nikdo mu neřekl ne, protože bylo talentované, nebo naopak kompenzace: prostředí, kde bylo dítě ponižované nebo přehlížené, a výjimečnost se stala způsobem, jak to přežít. Někdy je za tím i rodič, který dítě vystavoval jako důkaz vlastní hodnoty. Obě cesty vedou na stejné místo: hranice nikdy nebyla bezpečná zkušenost. Buď chyběla úplně, nebo přišla jako ponížení.",
    pasma: {
      "velmi-nizka": "Vzorec je prakticky neaktivní. Hranice a pravidla neseš bez problému.",
      nizka: "Objevuje se okrajově, ve chvílích únavy nebo frustrace.",
      stredni: "Vzorec je aktivní. Omezení a čekání jdou hůř, než by šly.",
      vysoka: "Vzorec výrazně ovlivňuje tvoje reakce na překážky a dopadá na tým.",
      dominantni:
        "Vzorec je dominantní. Nárok a impulz předbíhají rozvahu ve většině situací. Změna začíná tím, že si všimneš ceny, kterou platí okolí.",
    },
  },
}
