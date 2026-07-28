import type { VzorecId, VzorecObsah } from "../types"

// Texty vyhodnocení jednotlivých vzorců.
//
// Vychází z rozšířených profilů Winning Minds. Psáno klientovi přímo, tykáním,
// bez odborného žargonu. Rodové tvary jsou označené {mužský|ženský} a rozvine
// je applyGender() při vykreslení, protože čeština rod oslovované osoby
// prozradí a žena nesmí dostat text v mužském rodě.

export const OBSAH: Record<VzorecId, VzorecObsah> = {
  "01": {
    nazev: "Opuštění",
    tema: "Strach ze ztráty a emoční nestability",
    motto: "Prosím tě, neopouštěj mě.",
    prozitek:
      "Někde uvnitř máš jistotu, že lidi, na kterých ti záleží, nakonec neztratíš náhodou, ale zákonitě. Buď odejdou, nebo onemocní, nebo si najdou někoho jiného. I když vztah zrovna funguje dobře, čekáš, kdy se to zlomí. Tahle jistota nestojí na tom, co se právě děje, a proto ji nejde vyvrátit tím, že ti někdo řekne, že nikam nejde. Vzorec opuštění vzniká často dřív, než se dítě naučí mluvit, a proto je pod ním cítit něco starého a naléhavého: krátké odloučení dokáže spustit paniku, která je na situaci zjevně příliš velká. Reakce bývá jedna ze dvou. Buď se přimkneš blíž, kontroluješ, ověřuješ, žádáš ujištění, a čím víc ho dostaneš, tím kratší dobu vydrží. Nebo si naopak držíš odstup, protože co si nepustíš k tělu, to tě nemůže opustit. Obojí vypadá zvenčí jinak, ale dělá totéž: chrání tě před ztrátou a zároveň ti brání v tom, aby vztah zesílil natolik, že by ztrátu unesl.",
    podTlakem:
      "Pod tlakem se zkracuje tvoje tolerance k nejistotě. Nepřijatá zpráva, změněný tón hlasu nebo pár dní bez kontaktu se okamžitě čtou jako začátek konce. Rozhodnutí pak neděláš podle toho, co chceš, ale podle toho, co udrží druhého na místě.",
    puvod:
      "Za vzorcem stojí zkušenost, že blízkost je nespolehlivá. Nemusí jít o dramatickou ztrátu. Stačí rodič, který byl jednou vřelý a podruhé nedostupný, nemoc v rodině, opakované stěhování a ztráta kamarádů, nebo dospělý, jehož nálada se nedala předvídat. Dítě si z toho neodnese myšlenku, ale tělesnou zkušenost: to, co mám rád, se může každou chvíli ztratit. A protože se to naučilo dřív než slova, nedá se to přepsat argumentem.",
    pasma: {
      "velmi-nizka":
        "Tenhle vzorec u tebe prakticky nesvítí. Ztráty tě zasahují, ale nedefinují tvoje vztahy.",
      nizka:
        "Vzorec je přítomný jen okrajově. Objeví se ve vypjatých chvílích a zase odejde.",
      stredni:
        "Vzorec je aktivní a v zátěži se dá poznat. V klidu ho většinou přehlušíš, pod tlakem se hlásí.",
      vysoka:
        "Vzorec výrazně ovlivňuje, jak vztahy prožíváš a jaká rozhodnutí v nich děláš.",
      dominantni:
        "Vzorec je dominantní. Strach ze ztráty je do velké míry tím, co řídí tvoje vztahové chování.",
    },
  },

  "02": {
    nazev: "Nedůvěra",
    tema: "Ostražitost, nedůvěra a očekávání zrady",
    motto: "Nemůžu ti věřit.",
    prozitek:
      "Základní nastavení zní, že lidé dřív nebo později využijí toho, co o tobě vědí. Nemusí jít o vědomé podezření. Je to spíš trvale zapnutá ostražitost, která běží i tam, kde je zbytečná. Sleduješ nesrovnalosti, ověřuješ si, co ti kdo řekl, a hledáš, co je za tím. Když někdo udělá něco hezkého, první otázka je, co za to. Paradox je, že ostražitost tě nechrání, ale udržuje ve stálém napětí, protože nikdy nemáš dost důkazů. Ochranných strategií bývá několik. Nepustíš nikoho blíž, než kam dosáhne škoda. Nebo ubližuješ první, aby tě nepředběhli. Nebo si držíš dokonalý přehled, protože kdo má informace, ten nebude {překvapen|překvapena}. Nejvíc to bolí u lidí, kteří ti jsou nejblíž. Právě u nich má zrada největší cenu, a proto se u nich hlídá nejvíc.",
    podTlakem:
      "Pod tlakem se ostražitost mění v obranu. Nesouhlas čteš jako útok, otázku jako výslech, zpětnou vazbu jako pokus tě shodit. Reakce přijde rychle a bývá tvrdší, než situace zaslouží, a to i vůči lidem, kteří ti nic neudělali.",
    puvod:
      "Vzorec vzniká tam, kde chybělo základní bezpečí. Někdy jde o týrání, ponižování nebo zneužití, jindy o mírnější, ale opakovanou zkušenost: dospělý, který sliboval a nedodržel, který zesměšnil svěřené tajemství, který se choval nepředvídatelně. Dítě si z toho udělá rozumný závěr: bezpečně je jen tehdy, když jsem ve střehu. V dětství to byla správná strategie. V dospělosti brání přesně tomu, co potřebuješ nejvíc.",
    pasma: {
      "velmi-nizka": "Vzorec je prakticky neaktivní. Důvěru dáváš podle toho, co se opravdu stalo.",
      nizka: "Objevuje se okrajově, spíš jako opatrnost než jako nedůvěra.",
      stredni: "Vzorec je aktivní. V bezpečném prostředí ustoupí, v zátěži se vrací ostražitost.",
      vysoka: "Vzorec výrazně ovlivňuje, jak blízko si lidi pouštíš a jak čteš jejich záměry.",
      dominantni: "Vzorec je dominantní. Ostražitost je základní režim, ne výjimka.",
    },
  },

  "03": {
    nazev: "Citová deprivace",
    tema: "Emoční hlad a nenaplněná potřeba blízkosti",
    motto: "Nikdy nezažiju lásku, po jaké toužím.",
    prozitek:
      "Tenhle vzorec se špatně popisuje, protože nemá tvar myšlenky. Je to spíš trvalý pocit prázdna a osamělosti, který nezmizí, ani když jsi mezi lidmi, kteří tě mají rádi. Nikdo ti úplně nerozumí. Nikdo se doopravdy nezeptá, jak ti je. Nikdo tu není tak, jak bys potřeboval. Často se to pozná až podle vztahů, které si vybíráš: přitahují tě lidé, kteří citově nedosáhnou tam, kam potřebuješ, a tak se prázdno potvrdí. Nebo vztah začne nadějně a po čase přijde zklamání a nuda, protože druhý nikdy nedá dost. Zvenčí to vypadá jako náročnost. Zevnitř je to hlad. Nejtěžší část bývá, že si o blízkost neumíš říct. Buď proto, že to nepovažuješ za možné, nebo proto, že přijmout péči znamená vydat se všanc.",
    podTlakem:
      "Pod tlakem se stahuješ. Místo aby ses {opřel|opřela} o lidi kolem, přestaneš sdílet a poneseš to {sám|sama}, protože kdesi vevnitř máš jistotu, že stejně nikdo nepřijde. Tím se prázdno potvrdí a vzorec zesílí.",
    puvod:
      "Chybělo něco, co dítě potřebuje stejně jako jídlo: pozornost, vřelost, porozumění a citlivé vedení. Nemuselo jít o zanedbání. Rodiče mohli být pečliví v tom, co je vidět, a nedostupní v tom, co se cítí. Byli zaneprázdnění, chladní, sami citově prázdní, nebo prostě neuměli být s emocí dítěte. Dítě z toho neudělá stížnost, protože jinou zkušenost nemá. Udělá z toho normu: takhle to prostě je.",
    pasma: {
      "velmi-nizka": "Vzorec je prakticky neaktivní. Blízkost umíš přijímat i dávat.",
      nizka: "Objevuje se jen okrajově, v obdobích, kdy jsi na kontakt chudší.",
      stredni: "Vzorec je aktivní. Pocit nepochopení se vrací a ovlivňuje, jak vztahy hodnotíš.",
      vysoka: "Vzorec výrazně ovlivňuje tvoje vztahy i to, koho si vybíráš.",
      dominantni: "Vzorec je dominantní. Emoční hlad je základní tón, na kterém stojí ostatní témata.",
    },
  },

  "04": {
    nazev: "Společenské vyloučení",
    tema: "Pocit odlišnosti a vyloučení ze skupiny",
    motto: "Nepatřím nikam.",
    prozitek:
      "Základním pocitem je osamělost ve společnosti, ne o samotě. Ve skupině stojíš mimo, i když tě nikdo nevylučuje. Existují dvě podoby a mohou se prolínat. První říká: nechtějí mě. Ve společnosti se cítíš {nedostatečný|nedostatečná}, nevíš, o čem mluvit, ostatní ti připadají schopnější, chytřejší nebo hezčí, a celou akci přečkáváš s úlevou, až budeš moct odejít. Druhá říká: jsem jiný. Nemusí v ní být pocit méněcennosti, spíš trvalé vědomí, že do téhle skupiny nepatříš, protože jsi z jiného těsta. Důležité je, že tenhle vzorec se týká skupin, ne blízkých vztahů. S jednotlivci, které znáš, ti může být dobře. Jakmile je lidí víc a nejsou známí, spustí se to znovu.",
    podTlakem:
      "Pod tlakem se vyhýbáš. Nepřijmeš pozvání, nevystoupíš na poradě, nepřihlásíš se o slovo, neprosadíš svůj nápad ve skupině. Každé vyhnutí krátkodobě uleví a dlouhodobě vzorec potvrdí, protože zkušenost, která by ho vyvrátila, se nemá kde stát.",
    puvod:
      "Na rozdíl od citové deprivace tenhle vzorec obvykle nevzniká doma, ale mezi vrstevníky. Bylo to vyloučení ze skupiny, posmívání, rodina, která se něčím nápadně lišila, stěhování do prostředí, kam jsi {nezapadl|nezapadla}, nebo jen dlouhé období, kdy jsi {byl|byla} v kolektivu ten poslední. Někdy stačí jediné dost silné období. Dítě z toho odvodí pravidlo o sobě, ne o té skupině.",
    pasma: {
      "velmi-nizka": "Vzorec je prakticky neaktivní. Ve skupině se pohybuješ přirozeně.",
      nizka: "Objevuje se okrajově, v novém nebo hodně formálním prostředí.",
      stredni: "Vzorec je aktivní. Ve skupinách stojíš spíš stranou, než bys chtěl.",
      vysoka: "Vzorec výrazně ovlivňuje, kam chodíš, co si dovolíš říct a jak velkou skupinu uneseš.",
      dominantni: "Vzorec je dominantní. Pocit, že nepatříš, je stálý a řídí tvoje volby.",
    },
  },

  "05": {
    nazev: "Závislost",
    tema: "Nejistota v samostatnosti a rozhodování",
    motto: "Já {sám|sama} to nezvládnu.",
    prozitek:
      "Běžný život ti připadá jako něco, na co nemáš dost sil. Nejde o lenost ani o skutečnou neschopnost, často zvládáš mnohem víc, než si připouštíš. Jde o pocit, že bez druhého to neustojíš. Nová situace vyvolá úzkost, rozhodnutí se odkládají, dokud někdo neporadí, a i po rozhodnutí zůstává pochybnost, jestli to nebyla chyba. Vlastnímu úsudku nevěříš, a tak si ho necháváš potvrzovat. Existuje i obrácená podoba, která vypadá jako pravý opak: nezávislost tak zásadová, že nepřijmeš pomoc, ani když ji opravdu potřebuješ. Není to síla, je to stejný vzorec z druhé strany. Přijmout pomoc by totiž znamenalo připustit, že sám nestačíš, a to je nesnesitelné. Obě podoby stojí na stejné větě: sám na to nemám.",
    podTlakem:
      "Pod tlakem se rozhodování zastaví. Hledáš někoho, kdo to rozhodne za tebe, nebo se rozhodnutí vyhneš tak dlouho, až ho udělá čas. Odpovědnost se přesouvá jinam a s ní i pocit, že máš na svůj život vliv.",
    puvod:
      "Vzorec obvykle nevzniká z nedostatku péče, ale z jejího přebytku. Rodič, který dělal věci za tebe rychleji a lépe, který tě chránil před chybou, který dával najevo úzkost, kdykoli jsi něco {zkusil|zkusila} {sám|sama}. Dítě z toho vyvodí, že svět je nebezpečnější a ono samo méně schopné, než je pravda. Někdy působí i opak: prostředí tak nepředvídatelné, že se samostatnost nedala bezpečně vyzkoušet.",
    pasma: {
      "velmi-nizka": "Vzorec je prakticky neaktivní. Rozhodnutí děláš sám a stojíš si za nimi.",
      nizka: "Objevuje se okrajově, u velkých nebo neznámých rozhodnutí.",
      stredni: "Vzorec je aktivní. Bez potvrzení zvenčí se rozhoduje výrazně hůř.",
      vysoka: "Vzorec výrazně ovlivňuje tvoji samostatnost a míru, do jaké řídíš vlastní život.",
      dominantni: "Vzorec je dominantní. Otázka, jestli to zvládneš sám, stojí pod většinou rozhodnutí.",
    },
  },

  "06": {
    nazev: "Zranitelnost",
    tema: "Katastrofizace a očekávání ohrožení",
    motto: "Katastrofa je na spadnutí.",
    prozitek:
      "Očekáváš, že se stane něco zlého, a zároveň že tomu nedokážeš zabránit. Vzorec pracuje ve dvou směrech najednou: zvětšuje nebezpečí a zmenšuje tvoji schopnost mu čelit. Proto nepomáhá, když si spočítáš, jak je něco nepravděpodobné. Ohrožení mívá čtyři obvyklé oblasti a nemusíš mít všechny. Zdraví a nemoc, kdy sleduješ tělesné projevy a hledáš, co znamenají. Nebezpečí zvenčí, tedy nehody, přepadení, létání, cestování. Peníze, tedy strach, že o všechno přijdeš. A ztráta kontroly, tedy obava, že se před lidmi neudržíš, zhroutíš nebo se zblázníš. Nejnáročnější na tom bývá, že úzkost neubývá tím, že se nic nestane. Každý den bez katastrofy je jen den, kdy zatím nepřišla.",
    podTlakem:
      "Pod tlakem se zužuje výběr. Rozhoduješ se tak, abys minimalizoval riziko, ne abys něčeho dosáhl. Příležitosti se odmítají dřív, než se stihnou zvážit, a pozornost se drží u toho, co by se mohlo pokazit.",
    puvod:
      "Za vzorcem obvykle stojí dospělý, který svět ukazoval jako nebezpečné místo. Přehnaně ochraňující rodič, který varoval před vším, sám žil v úzkosti a dával najevo, že venku číhá pohroma. Nebo naopak skutečné ohrožení v dětství: vážná nemoc v rodině, nehoda, chudoba, nestabilní domov. Dítě si z toho odnese dvě přesvědčení najednou, že svět je nebezpečný a že ono na něj nestačí.",
    pasma: {
      "velmi-nizka": "Vzorec je prakticky neaktivní. Riziko vnímáš věcně a přiměřeně.",
      nizka: "Objevuje se okrajově, v obdobích únavy nebo skutečné nejistoty.",
      stredni: "Vzorec je aktivní. Katastrofické scénáře se vracejí a berou energii.",
      vysoka: "Vzorec výrazně ovlivňuje, do čeho jdeš a čemu se raději vyhneš.",
      dominantni: "Vzorec je dominantní. Očekávání ohrožení je trvalé pozadí, na kterém se rozhoduješ.",
    },
  },

  "07": {
    nazev: "Méněcennost",
    tema: "Stud, vnitřní nedostatečnost a strach z odhalení",
    motto: "Kdo mě pozná blíž, nemůže mě mít {rád|ráda}.",
    prozitek:
      "Hlavním pocitem je stud. Ne vina za to, co jsi {udělal|udělala}, ale stud za to, co jsi. Někde uvnitř máš přesvědčení, že je v tobě něco vadného, a že kdyby to lidé viděli, odešli by. Proto se to schovává. Části sebe se neukazují ani nejbližším, hlavně jim ne. Vzniká rozdíl mezi tím, koho lidé znají, a tím, kdo si myslíš, že doopravdy jsi. Na rozdíl od společenského vyloučení, které se týká skupin, tenhle vzorec sílí právě s blízkostí. Čím blíž si někoho pustíš, tím větší je riziko odhalení. Chování z toho plyne dvojí a často se střídá. Buď se blízkosti vyhýbáš, nebo si vybíráš lidi, kteří tě kritizují a odmítají, protože ti sedí do obrazu, který o sobě máš. Pochvala se přitom neudrží, sklouzne po povrchu. Kritika zapadne přesně.",
    podTlakem:
      "Pod tlakem se stud změní v sebekritiku, která je tvrdší než cokoli, co by ti řekl druhý. Chybu si nesundáš ze zad. Buď se stáhneš, aby nebylo co odhalit, nebo předběhneš kritiku tím, že se shodíš {sám|sama}.",
    puvod:
      "Vzorec staví opakovaná kritika od někoho, na kom záleželo. Rodič, který srovnával, ponižoval, dával najevo zklamání nebo lásku podmiňoval. Nemuselo jít o tvrdost, stačí chlad a trvalá nespokojenost. Dítě nemá jak dojít k závěru, že problém je v dospělém. Dojde k jedinému možnému vysvětlení: je to mnou.",
    pasma: {
      "velmi-nizka": "Vzorec je prakticky neaktivní. Nedokonalosti unesou být vidět.",
      nizka: "Objevuje se okrajově, po nezdaru nebo kritice.",
      stredni: "Vzorec je aktivní. Stud se vrací a ovlivňuje, kolik ze sebe ukážeš.",
      vysoka: "Vzorec výrazně ovlivňuje tvůj vztah k sobě i to, jak blízko si lidi pustíš.",
      dominantni: "Vzorec je dominantní. Stud je základní vrstva, přes kterou se dívá na všechno ostatní.",
    },
  },

  "08": {
    nazev: "Selhání",
    tema: "Očekávání neúspěchu a výkonová nedůvěra v sebe",
    motto: "Nejsem {dost dobrý|dost dobrá} na to, abych {uspěl|uspěla}.",
    prozitek:
      "V oblasti výkonu a dosahování se srovnáváš s ostatními a vycházíš z toho jako ten pod průměrem. Nejde o to, že by ses {bál|bála} náročných úkolů. Jde o jistotu, že v porovnání s vrstevníky jsi {zaostal|zaostala}, i když fakta říkají něco jiného. Odtud pramení dvě podoby. První je stažení: nejdeš do věcí, které bys nejspíš {zvládl|zvládla}, protože se očekávaný neúspěch nedá snést. Druhá je syndrom podvodníka: úspěch máš, ale nepovažuješ ho za svůj a čekáš, kdy se přijde na to, že ve skutečnosti nejsi tak {schopný|schopná}. Vzorec pracuje jako sebenaplňující předpověď. Protože do věcí nejdeš naplno nebo do nich nejdeš vůbec, výsledky tomu odpovídají, a to se pak čte jako potvrzení. Důležité je rozlišení od perfekcionismu: selhání znamená očekávat od sebe příliš málo ve srovnání s ostatními, perfekcionismus příliš mnoho ve srovnání s nedosažitelnou metou.",
    podTlakem:
      "Pod tlakem přijde odklad nebo únik. Úkol se odsune, cíl se sníží, příležitost se pustí. Někdy naopak přijde přehnaná práce, ale bez radosti z výsledku, protože žádný výsledek nestačí na to, aby přesvědčil.",
    puvod:
      "Bývá za tím prostředí, kde se výkon srovnával a srovnání vycházelo špatně. Sourozenec, kterého dávali za vzor, škola, ve které jsi {nestačil|nestačila}, rodič, který dal najevo zklamání nebo naopak nepomohl tam, kde jsi to {potřeboval|potřebovala}. Někdy je příčinou nerozpoznaná porucha učení nebo obor zvolený podle přání rodičů, ne podle schopností. Dítě si závěr o svých možnostech udělá dřív, než dostane šanci ho vyzkoušet.",
    pasma: {
      "velmi-nizka": "Vzorec je prakticky neaktivní. Svým schopnostem věříš přiměřeně.",
      nizka: "Objevuje se okrajově, po nezdaru nebo v novém oboru.",
      stredni: "Vzorec je aktivní. Srovnávání s ostatními bere jistotu a chuť jít do rizika.",
      vysoka: "Vzorec výrazně ovlivňuje, jaké cíle si dovolíš a jak čteš vlastní výsledky.",
      dominantni: "Vzorec je dominantní. Očekávání neúspěchu předchází většině výkonových rozhodnutí.",
    },
  },

  "09": {
    nazev: "Podmanění",
    tema: "Přizpůsobení, potlačení sebe a ztráta hranic",
    motto: "Nakonec vždycky udělám, co chceš ty.",
    prozitek:
      "Žiješ podle toho, co chtějí druzí, a vlastní potřeby dáváš stranou tak samozřejmě, že si toho často ani nevšimneš. Konfliktu se vyhýbáš, ustupuješ, dokud to jde, a když někdy dáš přednost sobě, přijde vina. Vzniká z toho tichá nerovnováha: dáváš víc, než dostáváš, a hlavní rozhodnutí ve tvém životě jako by dělal někdo jiný. Jsou dvě varianty. Poddajnost, kdy se přizpůsobuješ ze strachu z hněvu, odvety nebo ztráty. A sebeobětování, kdy se přizpůsobuješ proto, že cítíš bolest druhých tak silně, že jinak nejde. Zvenčí to vypadá jako laskavost a často to laskavost i je. Rozdíl je v tom, že tady si to nevybíráš. Pod povrchem se přitom hromadí hněv, který se nemá kam vybít, a proto vychází nepřímo: pasivitou, otálením, únavou, tělesnými potížemi nebo nečekaným výbuchem.",
    podTlakem:
      "Pod tlakem řekneš ano dřív, než si stihneš spočítat kapacitu. Vlastní hranice zmizí první a jako poslední se přizná, že už to nejde. Vyčerpání pak nepřijde z práce, ale z toho, že se v ní nikde nepočítá s tebou.",
    puvod:
      "Za vzorcem stojí dospělý, jehož vůle nešlo bezpečně odmítnout. Rodič dominantní, nevyzpytatelný, trestající, nebo naopak křehký a nemocný, kterého nešlo zatížit. V obou případech se dítě naučilo, že mít vlastní potřebu je nebezpečné nebo sobecké. Vlastní chtění se proto raději utlumilo dřív, než se stihlo vyslovit.",
    pasma: {
      "velmi-nizka": "Vzorec je prakticky neaktivní. Své potřeby umíš pojmenovat i prosadit.",
      nizka: "Objevuje se okrajově, vůči autoritám nebo v blízkých vztazích.",
      stredni: "Vzorec je aktivní. Hranice se drží hůř, než bys {chtěl|chtěla}, hlavně v konfliktu.",
      vysoka: "Vzorec výrazně ovlivňuje, kolik prostoru ve vlastním životě máš.",
      dominantni: "Vzorec je dominantní. Přizpůsobení je základní režim a vlastní chtění se skoro neozve.",
    },
  },

  "10": {
    nazev: "Perfekcionismus",
    tema: "Neúprosné nároky, tlak a výkonová identita",
    motto: "Nikdy nebudu {dost dobrý|dost dobrá}.",
    prozitek:
      "Základní pocit je tlak a nedostatek času. Něco tě pořád žene dopředu, takže není kde se zastavit, a i odpočinek se změní v úkol, který je potřeba zvládnout dobře. Musíš být nejlepší ve všem, na čem ti záleží, druhé místo se nepočítá. Zvenčí to vypadá jako úspěch, zevnitř jako nikdy nekončící nedostatečnost, protože laťka se posouvá spolu s tebou. Rozeznávají se tři podoby a mohou se prolínat. Kompulzivní, kdy musí být všechno v perfektním pořádku a každá maličkost dokáže rozhodit. Zaměřená na dosahování, tedy workoholismus, kdy se všechno včetně koníčků promění v práci. A zaměřená na postavení, kdy jde o uznání, prestiž a obdiv, a která bývá kompenzací méněcennosti nebo společenského vyloučení. Nejdřív to obvykle odnese vztah a zdraví, protože obojí se dá odložit a nic hned neřekne.",
    podTlakem:
      "Pod tlakem nezvolníš, ale zrychlíš. Přibereš si další odpovědnost, jako by právě ta příští věc konečně přinesla úlevu. Chyba se netrestá nápravou, ale sebekritikou, a odpočinek se odsune jako první.",
    puvod:
      "Vzorec staví podmíněná láska. Ocenění přicházelo za výkon, ne za to, že jsi. Jeden nebo oba rodiče měli nároky, které nešlo naplnit, byli sami perfekcionisté, dávali za vzor sebe, nebo tvrdě reagovali, když jsi jejich očekávání {nesplnil|nesplnila}. Pro dítě se dosahování stalo způsobem, jak si zajistit lásku a bezpečí. Proto je vzorec dodnes propojený s pudem sebezáchovy a proto tak vzdoruje rozumným argumentům.",
    pasma: {
      "velmi-nizka": "Vzorec je prakticky neaktivní. Nároky na sebe máš vysoké, ale unesitelné.",
      nizka: "Objevuje se okrajově, ve výkonově vypjatých obdobích.",
      stredni: "Vzorec je aktivní. Laťka je vysoko a odpočinek se odkládá častěji, než je zdrávo.",
      vysoka: "Vzorec výrazně ovlivňuje tvoje tempo, vztahy i to, kolik si dovolíš odpočívat.",
      dominantni: "Vzorec je dominantní. Výkon je tvoje identita a zastavení se cítí jako ohrožení.",
    },
  },

  "11": {
    nazev: "Výjimečnost / velikášství",
    tema: "Nárokovost, impulz a problém s hranicí",
    motto: "Můžu si dělat a mít, co chci.",
    prozitek:
      "Máš pocit, že se na tebe běžná omezení tak úplně nevztahují, a že tvoje potřeby mají přednost. Když ti někdo odporuje nebo ti něco překazí, přijde vztek, který je na situaci nepřiměřený. Vzorec má tři podoby a mohou se překrývat. Rozmazlenost, kdy si nárokuješ výjimku a do druhých se nevcítíš, protože tě to prostě nenapadne. Závislá podoba, kdy se výjimečnost pojí s očekáváním, že se o tebe někdo silnější postará, protože je to jeho povinnost. A impulzivní podoba, kdy je problém vydržet nepohodlí: těžko se odkládá potěšení, těžko se dokončuje cíl, který přestal bavit, a špatně se přestává s tím, co krátkodobě uleví. Zvenčí působí tenhle vzorec sebejistě. Uvnitř bývá pod ním něco docela jiného, nejčastěji stud nebo prázdno, které se nárokovostí přehlušuje.",
    podTlakem:
      "Pod tlakem klesá tolerance k omezení. Pravidla, čekání a kompromis se stanou nesnesitelnými, rozhodnutí se dělají rychle a impulzivně, a následky se řeší až potom. Vztahy to obvykle odnesou dřív než výsledky.",
    puvod:
      "Za vzorcem stojí buď absence hranic, kdy dítě dostalo všechno a nikdo mu neřekl ne, nebo naopak kompenzace: prostředí, kde bylo dítě ponižované nebo přehlížené, a výjimečnost se stala způsobem, jak to přežít. Někdy je za tím i rodič, který dítě vystavoval jako důkaz vlastní hodnoty. Ve všech variantách chyběla zkušenost, že hranice může být laskavá a přitom pevná.",
    pasma: {
      "velmi-nizka": "Vzorec je prakticky neaktivní. Hranice a pravidla neseš bez problému.",
      nizka: "Objevuje se okrajově, ve chvílích únavy nebo frustrace.",
      stredni: "Vzorec je aktivní. Omezení a čekání jdou hůř, než by šly.",
      vysoka: "Vzorec výrazně ovlivňuje tvoje reakce na překážky a dopadá na okolí.",
      dominantni: "Vzorec je dominantní. Nárok a impulz předbíhají rozvahu ve většině situací.",
    },
  },
}
