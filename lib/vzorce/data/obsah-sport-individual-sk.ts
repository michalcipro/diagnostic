import type { VzorecId, VzorecObsah } from "../types"

// Slovenské znenie textov pre individuálnych športovcov. Zrkadlí
// obsah-sport-individual.ts kus po kuse; kontrolu robí
// scripts/test-vzorce-sk.cjs.

export const OBSAH_SPORT_INDIVIDUAL_SK: Record<VzorecId, VzorecObsah> = {
  "01": {
    nazev: "Strach z opustenia",
    tema: "Strata zázemia a istoty miesta",
    motto: "Keď prestanem podávať výkon, zostanem {sám|sama}.",
    prozitek:
      "Niekde vnútri máš istotu, že ľudí, ktorí ťa v športe držia, nakoniec nestratíš náhodou, ale zákonite. Tréner skončí, tréningová skupina sa rozpadne, zväz zmení plány, záujem opadne. Aj v období, keď sa darí, čakáš, kedy sa to zlomí. Táto istota nestojí na tom, čo sa práve deje, a preto ju nevyvráti ani nová zmluva, ani istá nominácia. Vzniká často skôr, než si to človek pamätá, a preto je pod ňou cítiť niečo staré a naliehavé: pár dní bez pozornosti trénera spustí paniku, ktorá je na situáciu zjavne priveľká. Reakcia býva jedna z dvoch. Buď sa primkneš bližšie, overuješ, pýtaš sa, žiadaš uistenie, a čím viac ho dostaneš, tým kratšie vydrží. Alebo si naopak držíš odstup, pretože čo si nepustíš k telu, to ťa nemôže opustiť. Oboje vyzerá zvonku inak, ale robí to isté: chráni ťa pred stratou a zároveň bráni tomu, aby vzťah s trénerom alebo zázemím zosilnel natoľko, že by stratu uniesol. Spoznáš to podľa nepomeru: sila reakcie nezodpovedá tomu, čo sa práve stalo.",
    podTlakem:
      "Pod tlakom sa skracuje tvoja tolerancia k neistote. Nezdvihnutý telefón, zmenený tón na tréningu alebo pár dní bez spätnej väzby sa okamžite čítajú ako začiatok konca. Rozhodnutia potom nerobíš podľa toho, čo je pre tvoju kariéru dobré, ale podľa toho, čo udrží druhého na mieste: prijmeš podmienky, ktoré ti nesadnú, alebo mlčíš tam, kde by si {mal|mala} hovoriť. V rozhodujúcej fáze pretekov sa to prejaví opatrnosťou, pretože chyba sa v tejto logike netrestá stratou bodu, ale stratou priazne.",
    puvod:
      "Za vzorcom stojí skúsenosť, že blízkosť je nespoľahlivá. Nemusí ísť o dramatickú stratu. Stačí rodič, ktorý bol raz vrelý a inokedy nedostupný, choroba v rodine, opakované sťahovanie a strata kamarátov, alebo tréner z detstva, ktorého nálada sa nedala predvídať. Dieťa si z toho neodnesie myšlienku, ale telesnú skúsenosť: to, čo mám {rád|rada}, sa môže každú chvíľu stratiť. A pretože sa to naučilo skôr než slová, nedá sa to prepísať argumentom. Vedieť, odkiaľ to je, vzorec nezruší; zmení sa však jedna vec, prestaneš to brať ako svoju chybu.",
    pasma: {
      "velmi-nizka":
        "Tento vzorec u teba prakticky nesvieti. Zmeny v zázemí ťa zasiahnu, ale nedefinujú, ako športuješ.",
      nizka: "Vzorec je prítomný len okrajovo. Objaví sa pri väčšej zmene a zase odíde.",
      stredni:
        "Vzorec je aktívny a v záťaži sa dá spoznať. V pokoji ho prehlušíš, pred koncom sezóny alebo pri zmene trénera sa hlási.",
      vysoka:
        "Vzorec výrazne ovplyvňuje, ako prežívaš vzťahy okolo športu a aké rozhodnutia o kariére robíš.",
      dominantni:
        "Vzorec je dominantný. Strach zo straty zázemia je do veľkej miery tým, čo riadi tvoje športové rozhodovanie. Bez práce s ním sa ostatné témy hýbu len málo.",
    },
  },

  "02": {
    nazev: "Nedôvera",
    tema: "Očakávanie zrady a stráženie vlastnej pozície",
    motto: "Nikomu tu nemôžem veriť naplno.",
    prozitek:
      "Základné nastavenie znie, že ľudia v tvojom okolí skôr či neskôr využijú to, čo o tebe vedia. Nemusí ísť o vedomé podozrenie. Je to skôr trvalo zapnutá ostražitosť, ktorá beží aj tam, kde je zbytočná: sleduješ, komu tréner nadŕža, overuješ si, čo ti kto povedal, a hľadáš, čo je za tým. Keď ťa niekto pochváli, prvá otázka je, čo za to. Šport tento vzorec živí prirodzene, pretože konkurencia je skutočná a o nomináciu aj podporu sa naozaj súperí. Rozdiel je v miere: ostražitosť ťa nechráni, ale drží v stálom napätí, pretože nikdy nemáš dosť dôkazov. Ochranných stratégií býva niekoľko. Nepustíš nikoho bližšie, než kam dosiahne škoda. Alebo ukážeš tvrdosť prvý, aby ťa nepredbehli. Alebo si držíš dokonalý prehľad, pretože kto má informácie, ten nebude {prekvapený|prekvapená}. Najviac to bolí u ľudí, ktorí sú ti najbližšie, pretože práve u nich má zrada najväčšiu cenu.",
    podTlakem:
      "Pod tlakom sa ostražitosť mení na obranu. Nesúhlas trénera čítaš ako útok, technickú poznámku ako spochybnenie, rozbor ako pokus zhodiť ťa. Reakcia príde rýchlo a býva tvrdšia, než si situácia zaslúži, a to aj voči ľuďom, ktorí ti nič neurobili. Cena sa pritom neplatí v konflikte, ale vo vzťahoch: okolie si postupne odvykne nosiť ti nepríjemné informácie, a tým zmizne práve to, čo by si na zlepšenie potreboval.",
    puvod:
      "Vzorec vzniká tam, kde chýbalo základné bezpečie. Niekedy ide o týranie, ponižovanie alebo zneužitie, inokedy o miernejšiu, ale opakovanú skúsenosť: dospelý, ktorý sľuboval a nedodržal, ktorý zosmiešnil zverené tajomstvo, tréner, ktorý pred ostatnými zhodil to, čo si mu {zveril|zverila}. Dieťa si z toho urobí rozumný záver: bezpečne je len vtedy, keď som v strehu. V detstve to bola správna stratégia. V dospelom športe bráni presne tomu, čo potrebuješ najviac, teda vzťahu, v ktorom sa dá pracovať na chybách nahlas.",
    pasma: {
      "velmi-nizka": "Vzorec je prakticky neaktívny. Dôveru dávaš podľa toho, čo sa naozaj stalo.",
      nizka: "Objavuje sa okrajovo, skôr ako opatrnosť než ako nedôvera.",
      stredni: "Vzorec je aktívny. V bezpečnom prostredí ustúpi, v boji o pozíciu sa ostražitosť vracia.",
      vysoka: "Vzorec výrazne ovplyvňuje, ako blízko si trénera aj ľudí zo zázemia púšťaš.",
      dominantni:
        "Vzorec je dominantný. Ostražitosť je základný režim, nie výnimka. Zmena sa začína pri jednom vzťahu, nie pri postoji k okoliu ako celku.",
    },
  },

  "03": {
    nazev: "Citová deprivácia",
    tema: "Emočný hlad a pocit, že nikto nevidí cenu výkonu",
    motto: "Nikto nevie, čo ma to stojí.",
    prozitek:
      "Tento vzorec sa zle opisuje, pretože nemá tvar myšlienky. Je to skôr trvalý pocit prázdna a osamelosti, ktorý nezmizne ani uprostred zázemia, ktoré funguje. Zaujíma ich výsledok, nie ty. Nikto sa nespýta, ako ti po pretekoch naozaj bolo. Nikto tu nie je tak, ako by si potreboval. V športe sa to ľahko schová, pretože prostredie odmeňuje samostatnosť a tichú drinu; tvoje okolie často ani netuší, že niečo chýba. Často sa to pozná až podľa toho, koho si vyberáš: priťahujú ťa ľudia, ktorí citovo nedosiahnu tam, kam potrebuješ, a tak sa prázdno potvrdí. Alebo vzťah, aj ten s trénerom, začne sľubne a po čase príde sklamanie, pretože druhý nikdy nedá dosť. Zvonku to vyzerá ako náročnosť. Zvnútra je to hlad. Najťažšia časť býva, že si o blízkosť nevieš povedať: buď to nepovažuješ za možné, alebo prijať starostlivosť znamená vydať sa všanc.",
    podTlakem:
      "Pod tlakom sa sťahuješ. Namiesto toho, aby si sa {oprel|oprela} o ľudí okolo, prestaneš zdieľať a ponesieš to {sám|sama}, pretože kdesi vnútri máš istotu, že aj tak nikto nepríde. Po zranení alebo v období bez formy je to najviac vidieť: mlčíš tam, kde by stačila jedna veta. Druhý pritom väčšinou nič netuší, pretože zvonku pôsobíš sebestačne a nemá dôvod sa pýtať.",
    puvod:
      "Chýbalo niečo, čo dieťa potrebuje rovnako ako jedlo: pozornosť, vrelosť, porozumenie a citlivé vedenie. Nemuselo ísť o zanedbanie. Rodičia mohli byť starostliví v tom, čo je vidieť, teda voziť na tréningy a platiť výstroj, a nedostupní v tom, čo sa cíti. Boli zaneprázdnení, chladní, sami citovo prázdni, alebo jednoducho nevedeli byť s emóciou dieťaťa. Dieťa z toho neurobí sťažnosť, pretože inú skúsenosť nemá; urobí z toho normu. Práve preto sa ten pocit tak ťažko opisuje: nechýba spomienka na niečo zlé, chýba spomienka na niečo, čo sa nikdy nestalo.",
    pasma: {
      "velmi-nizka": "Vzorec je prakticky neaktívny. Blízkosť vieš prijímať aj dávať.",
      nizka: "Objavuje sa len okrajovo, v obdobiach, keď si na kontakt chudobnejší.",
      stredni: "Vzorec je aktívny. Pocit nepochopenia sa vracia a ovplyvňuje, ako hodnotíš zázemie okolo seba.",
      vysoka: "Vzorec výrazne ovplyvňuje tvoje vzťahy okolo športu aj to, koho si k sebe púšťaš.",
      dominantni:
        "Vzorec je dominantný. Emočný hlad je základný tón, na ktorom stoja ostatné témy. Prvým krokom nie je viac blízkosti, ale schopnosť povedať si o ňu.",
    },
  },

  "04": {
    nazev: "Pocit vylúčenia",
    tema: "Pocit odlišnosti a nepatričnosti do skupiny",
    motto: "Medzi ostatných nepatrím.",
    prozitek:
      "Základným pocitom je osamelosť v skupine, nie o samote. V skupine stojíš mimo, aj keď ťa nikto nevylučuje. Existujú dve podoby a môžu sa prelínať. Prvá hovorí: nechcú ma. Medzi ostatnými pretekármi sa cítiš {nedostatočný|nedostatočná}, nevieš, o čom hovoriť, ostatní ti pripadajú uvoľnenejší, a celú spoločnú akciu prečkávaš s úľavou, až budeš môcť odísť. Druhá hovorí: som iný. Nemusí v nej byť pocit menejcennosti, skôr trvalé vedomie, že do tejto party nepatríš, pretože si z iného cesta. Dôležité je, že tento vzorec sa týka skupín, nie blízkych vzťahov. S jednotlivcami, ktorých poznáš, ti môže byť dobre; len čo je ľudí viac, na sústredení alebo na zraze, spustí sa to znova. Dobrá správa je, že má úzku pôsobnosť: keď sa skupina rozpadne na jednotlivé rozhovory, obvykle zmizne aj on.",
    podTlakem:
      "Pod tlakom sa vyhýbaš. Neprijmeš pozvanie, neprihlásiš sa o slovo na porade, nepresadíš svoj nápad pred ostatnými, na spoločnej akcii zostaneš na kraji. Každé vyhnutie krátkodobo uľaví a dlhodobo vzorec potvrdí, pretože skúsenosť, ktorá by ho vyvrátila, sa nemá kde stať. Navyše má vždy rozumné vysvetlenie: únava, regenerácia, iný program.",
    puvod:
      "Na rozdiel od emočného hladu tento vzorec obvykle nevzniká doma, ale medzi rovesníkmi. Bolo to vylúčenie z party, posmech, rodina, ktorá sa niečím nápadne líšila, prestup do oddielu, kam si {nezapadol|nezapadla}, alebo len dlhé obdobie, keď si {bol|bola} v kolektíve ten posledný. Niekedy stačí jediné dosť silné obdobie. Dieťa si z toho odvodí pravidlo o sebe, nie o tej skupine, a ten záver sa potom nikdy nepreskúma: parta, ktorá ťa vtedy neprijala, dávno neexistuje, pravidlo platí ďalej.",
    pasma: {
      "velmi-nizka": "Vzorec je prakticky neaktívny. V skupine sa pohybuješ prirodzene.",
      nizka: "Objavuje sa okrajovo, v novej tréningovej skupine alebo na zraze, kde nikoho nepoznáš.",
      stredni: "Vzorec je aktívny. V skupine stojíš skôr bokom, než by si {chcel|chcela}.",
      vysoka: "Vzorec výrazne ovplyvňuje, kam chodíš, čo si dovolíš povedať a akú veľkú skupinu unesieš.",
      dominantni:
        "Vzorec je dominantný. Pocit, že nepatríš, je stály a riadi tvoje voľby. Zmena nepríde z rozhodnutia, ale z opakovanej skúsenosti v skupine.",
    },
  },

  "05": {
    nazev: "Závislosť na vedení",
    tema: "Neistota v samostatnom rozhodovaní",
    motto: "{Sám|Sama} sa rozhodnúť neviem.",
    prozitek:
      "Samostatné rozhodovanie ti pripadá ako niečo, na čo nemáš dosť síl. Nejde o lenivosť ani o skutočnú neschopnosť, často zvládaš oveľa viac, než si pripúšťaš. Ide o pocit, že bez vedenia to neustojíš. Nová situácia v pretekoch vyvolá úzkosť, rozhodnutie sa odkladá, kým nepríde pokyn trénera, a aj po ňom zostáva pochybnosť, či to nebola chyba. Vlastnému úsudku neveríš, a tak si ho nechávaš potvrdzovať. Existuje aj obrátená podoba, ktorá vyzerá ako pravý opak: nezávislosť taká zásadová, že neprijmeš pomoc, ani keď ju naozaj potrebuješ, pretože prijať ju by znamenalo pripustiť, že {sám|sama} nestačíš. Obe podoby stoja na tej istej vete. Zradné je, že rozhodnutia, ktoré ti niekto potvrdí, ti istotu nepridajú; pridajú ju len tie, ktoré urobíš a ustojíš {sám|sama}.",
    podTlakem:
      "Pod tlakom sa rozhodovanie zastaví. Hľadáš očami trénera, čakáš na pokyn, alebo sa rozhodnutiu vyhneš tak dlho, až ho urobí čas a situácia sa zavrie sama. Zodpovednosť sa presúva inam a s ňou aj pocit, že máš na svoj výkon vplyv. Nejde pritom o veľké rozhodnutia; istota sa stavia na malých, ktorých je v pretekoch veľa.",
    puvod:
      "Vzorec obvykle nevzniká z nedostatku starostlivosti, ale z jej prebytku. Rodič alebo tréner, ktorý robil veci za teba rýchlejšie a lepšie, ktorý ťa chránil pred chybou, ktorý dával najavo úzkosť, kedykoľvek si niečo {skúsil|skúsila} {sám|sama}. Dieťa z toho vyvodí, že svet je nebezpečnejší a ono samo menej schopné, než je pravda. Niekedy pôsobí aj opak: prostredie také nepredvídateľné, že sa samostatnosť nedala bezpečne vyskúšať. Preto tento vzorec často nesie pocit viny, pretože rodič to myslel dobre a dieťa to vie.",
    pasma: {
      "velmi-nizka": "Vzorec je prakticky neaktívny. V pretekoch sa rozhoduješ {sám|sama} a stojíš si za tým.",
      nizka: "Objavuje sa okrajovo, pri veľkých alebo neznámych rozhodnutiach.",
      stredni: "Vzorec je aktívny. Bez potvrdenia zvonku sa rozhoduje výrazne horšie.",
      vysoka: "Vzorec výrazne ovplyvňuje tvoju samostatnosť v pretekoch aj v kariére.",
      dominantni:
        "Vzorec je dominantný. Otázka, či to zvládneš {sám|sama}, stojí pod väčšinou rozhodnutí. Každé rozhodnutie, ktoré urobíš {sám|sama}, uberá vzorcu kus sily.",
    },
  },

  "06": {
    nazev: "Strach z ohrozenia",
    tema: "Katastrofizácia, obavy zo zranenia a zo straty kontroly",
    motto: "Niečo sa stane a ja to neustojím.",
    prozitek:
      "Očakávaš, že sa stane niečo zlé, a zároveň že tomu nedokážeš zabrániť. Vzorec pracuje v dvoch smeroch naraz: zväčšuje nebezpečenstvo a zmenšuje tvoju schopnosť čeliť mu. Preto nepomáha, keď si spočítaš, aké je niečo nepravdepodobné. V športe má obvykle štyri podoby a nemusíš mať všetky. Telo a zranenie, keď sleduješ každý signál a hľadáš, čo znamená. Nebezpečenstvo zvonku, teda cestovanie, pády, konkrétne prvky alebo úseky trate. Existenčná rovina, teda strach, že o kariéru prídeš zo dňa na deň. A strata kontroly, teda obava, že sa v kľúčovej chvíli neudržíš alebo sa zosypeš pred ľuďmi. Najnáročnejšie na tom býva, že úzkosť neubúda tým, že sa nič nestane: každý deň bez katastrofy je len deň, keď zatiaľ neprišla. Úzkosť si totiž nemýli pravdepodobnosť s možnosťou náhodou; kým je niečo možné, telo to počíta ako hrozbu.",
    podTlakem:
      "Pod tlakom sa zužuje výber. Rozhoduješ sa tak, aby si {minimalizoval|minimalizovala} riziko, nie aby si niečo {dosiahol|dosiahla}. Prvky, úseky trate alebo riešenia, ktoré by sa vyplatili, obchádzaš skôr, než sa stihnú zvážiť, a pozornosť sa drží pri tom, čo by sa mohlo pokaziť. Po návrate zo zranenia sa to pozná najlepšie: pohyb je technicky v poriadku, len sa mu telo vyhýba.",
    puvod:
      "Za vzorcom obvykle stojí dospelý, ktorý svet ukazoval ako nebezpečné miesto. Prehnane ochraňujúci rodič, ktorý varoval pred všetkým, sám žil v úzkosti a dával najavo, že vonku číha pohroma. Alebo naopak skutočné ohrozenie v detstve: vážna choroba v rodine, úraz, chudoba, nestabilný domov. Dieťa si z toho odnesie dve presvedčenia naraz, že svet je nebezpečný a že ono naň nestačí. Nepamätá si pritom varovania, pamätá si tón, a práve preto na to nezaberajú čísla ani štatistiky.",
    pasma: {
      "velmi-nizka": "Vzorec je prakticky neaktívny. Riziko vnímaš vecne a primerane.",
      nizka: "Objavuje sa okrajovo, v období únavy alebo po zranení.",
      stredni: "Vzorec je aktívny. Katastrofické scenáre sa vracajú a berú energiu pred výkonom.",
      vysoka: "Vzorec výrazne ovplyvňuje, do čoho v pretekoch ideš a čomu sa radšej vyhneš.",
      dominantni:
        "Vzorec je dominantný. Očakávanie ohrozenia je trvalé pozadie, na ktorom sa rozhoduješ. Zmenšuje sa tým, že sa overí, nie tým, že sa vysvetlí.",
    },
  },

  "07": {
    nazev: "Menejcennosť",
    tema: "Hanba a obava, že sa pozná, kto naozaj som",
    motto: "Keby ma spoznali bližšie, prestali by si ma vážiť.",
    prozitek:
      "Hlavným pocitom je hanba. Nie vina za to, čo si {urobil|urobila}, ale hanba za to, čo si. Niekde vnútri máš presvedčenie, že je v tebe niečo chybné, a že keby to ľudia videli, odišli by. Preto sa to schováva: časti seba neukazuješ ani ľuďom, s ktorými trénuješ každý deň. Vzniká rozdiel medzi tým, koho okolie pozná, a tým, kto si myslíš, že naozaj si. Na rozdiel od pocitu, že nepatríš medzi ostatných, tento vzorec silnie práve s blízkosťou: čím bližšie si niekoho pustíš, tým väčšie je riziko odhalenia. Správanie z toho plynie dvojaké a často sa strieda. Buď sa blízkosti vyhýbaš, alebo si vyberáš ľudí, ktorí ťa kritizujú, pretože ti sadnú do obrazu, ktorý o sebe máš. Pochvala sa pritom neudrží, skĺzne po povrchu; kritika zapadne presne. Rozdiel oproti zdravej sebakritike je v tom, kde sa zastaví: sebakritika skončí pri chybe, hanba pokračuje k záveru o tom, kto si.",
    podTlakem:
      "Pod tlakom sa hanba zmení na sebakritiku, ktorá je tvrdšia než čokoľvek, čo by ti povedal tréner. Chybu si nesundáš z chrbta ani po dobrých pretekoch. Buď sa stiahneš, aby nebolo čo odhaliť, teda v rozhodujúcej chvíli uberieš, alebo predbehneš kritiku tým, že sa zhodíš {sám|sama}. Úľavu pritom prináša presne to, čo vzorec živí: schovať sa.",
    puvod:
      "Vzorec stavia opakovaná kritika od niekoho, na kom záležalo. Rodič alebo tréner, ktorý porovnával, ponižoval, dával najavo sklamanie alebo lásku podmieňoval výkonom. Nemuselo ísť o tvrdosť, stačí chlad a trvalá nespokojnosť. Dieťa nemá ako dôjsť k záveru, že problém je v dospelom; dôjde k jedinému možnému vysvetleniu, teda že je to ním. Preto sa tento vzorec nedá prebiť úspechom: výkon dokazuje, čo vieš, a hanba hovorí o tom, čo si.",
    pasma: {
      "velmi-nizka": "Vzorec je prakticky neaktívny. Nedokonalosti unesú byť vidieť.",
      nizka: "Objavuje sa okrajovo, po nezdare alebo tvrdej kritike.",
      stredni: "Vzorec je aktívny. Hanba sa vracia a ovplyvňuje, koľko zo seba pred okolím ukážeš.",
      vysoka: "Vzorec výrazne ovplyvňuje tvoj vzťah k sebe aj to, ako blízko si ľudí pustíš.",
      dominantni:
        "Vzorec je dominantný. Hanba je základná vrstva, cez ktorú sa pozeráš na všetko ostatné. Ustupuje jedine tam, kde ťa niekto uvidí a neodíde.",
    },
  },

  "08": {
    nazev: "Strach zo zlyhania",
    tema: "Výkonová nedôvera a syndróm podvodníka",
    motto: "Na túto úroveň nemám.",
    prozitek:
      "Vo výkone sa porovnávaš s ostatnými a vychádzaš z toho ako ten pod priemerom. Nejde o to, že by si sa {bál|bála} náročných úloh. Ide o istotu, že v porovnaní s rovesníkmi si {zaostal|zaostala}, aj keď čísla hovoria niečo iné. Odtiaľ pramenia dve podoby. Prvá je stiahnutie: nejdeš do situácií, ktoré by si najskôr {zvládol|zvládla}, pretože očakávaný neúspech sa nedá zniesť. Druhá je syndróm podvodníka: výsledky máš, ale nepovažuješ ich za svoje a čakáš, kedy sa príde na to, že na túto úroveň nepatríš. Vzorec pracuje ako sebanapĺňajúca predpoveď: pretože do vecí nejdeš naplno alebo do nich nejdeš vôbec, výsledky tomu zodpovedajú, a to sa potom číta ako potvrdenie. Dôležité je rozlíšenie od perfekcionizmu: strach zo zlyhania znamená očakávať od seba príliš málo v porovnaní s ostatnými, perfekcionizmus príliš veľa v porovnaní s nedosiahnuteľnou métou. Sleduj pritom, s kým sa porovnávaš; vzorec si vyberá meradlo tak, aby vyšlo.",
    podTlakem:
      "Pod tlakom príde odklad alebo únik. Do riskantného riešenia nejdeš, cieľ sa zníži, príležitosť sa pustí. Niekedy naopak príde prehnaná práca, ale bez radosti z výsledku, pretože žiadny výsledok nestačí na to, aby presvedčil. Nebezpečné je, že odklad sa tvári rozumne: vždy existuje dôvod, prečo práve teraz nie je vhodná chvíľa.",
    puvod:
      "Býva za tým prostredie, kde sa výkon porovnával a porovnanie vychádzalo zle. Súrodenec alebo iný pretekár, ktorého dávali za vzor, oddiel, v ktorom si {nestačil|nestačila}, rodič, ktorý dal najavo sklamanie alebo naopak nepomohol tam, kde si to {potreboval|potrebovala}. Niekedy je príčinou neskorší telesný vývoj než u rovesníkov alebo šport zvolený podľa želania rodičov. Záver o vlastných možnostiach sa pritom urobil v čase, keď si {nemal|nemala} takmer žiadne dáta, a odvtedy sa už len potvrdzoval.",
    pasma: {
      "velmi-nizka": "Vzorec je prakticky neaktívny. Svojim schopnostiam veríš primerane.",
      nizka: "Objavuje sa okrajovo, po nezdare alebo na novej úrovni súťaže.",
      stredni: "Vzorec je aktívny. Porovnávanie s ostatnými berie istotu a chuť ísť do rizika.",
      vysoka: "Vzorec výrazne ovplyvňuje, aké ciele si dovolíš a ako čítaš vlastné výsledky.",
      dominantni:
        "Vzorec je dominantný. Očakávanie neúspechu predchádza väčšine výkonových rozhodnutí. Ustúpi až po skúsenosti, ktorú si nepôjde vysvetliť ako náhodu.",
    },
  },

  "09": {
    nazev: "Podriadenie sa",
    tema: "Prispôsobenie, potlačenie seba a strata hraníc",
    motto: "Nakoniec urobím to, čo chcú ostatní.",
    prozitek:
      "Žiješ podľa toho, čo chcú druhí, a vlastné potreby dávaš bokom tak samozrejme, že si to často ani nevšimneš. Konfliktu sa vyhýbaš, ustupuješ, kým to ide, a keď niekedy dáš prednosť sebe, príde vina. V športe je to obzvlášť zradné, pretože prispôsobenie tu vyzerá ako profesionalita: trénuješ aj cez bolesť, mlčíš o únave, pristúpiš na objem, ktorý telo neunesie, a na spôsob prípravy, ktorý ti nesadne. Sú dva varianty. Poddajnosť, keď sa prispôsobuješ zo strachu z hnevu alebo straty miesta. A sebaobetovanie, keď sa prispôsobuješ preto, že cítiš potreby druhých tak silno, že inak to nejde. Zvonku to vyzerá ako pracovitosť a často to pracovitosť aj je; rozdiel je v tom, že tu si to nevyberáš. Pod povrchom sa pritom hromadí hnev, ktorý sa nemá kde vybiť, a preto vychádza nepriamo: pasivitou, otáľaním, únavou, telesnými ťažkosťami alebo nečakaným výbuchom.",
    podTlakem:
      "Pod tlakom povieš áno skôr, než si stihneš spočítať kapacitu. Vlastná hranica zmizne prvá a ako posledné sa prizná, že už to nejde. Vyčerpanie potom nepríde z tréningu, ale z toho, že sa v ňom nikde nepočíta s tebou. Pozná sa to podľa únavy, ktorá nedáva zmysel: sily dôjdu z bežného týždňa, pretože pod ním leží ustupovanie.",
    puvod:
      "Za vzorcom stojí dospelý, ktorého vôľu sa nedalo bezpečne odmietnuť. Rodič dominantný, nevyspytateľný, trestajúci, alebo naopak krehký a chorý, ktorého sa nedalo zaťažiť. Niekedy tréner, u ktorého sa nesúhlas trestal odstupom. V oboch prípadoch sa dieťa naučilo, že mať vlastnú potrebu je nebezpečné alebo sebecké. Vlastné chcenie sa preto radšej utlmilo skôr, než sa stihlo vysloviť, a dodnes sa nejaví ako potreba, ale ako sebectvo.",
    pasma: {
      "velmi-nizka": "Vzorec je prakticky neaktívny. Svoje potreby vieš pomenovať aj presadiť.",
      nizka: "Objavuje sa okrajovo, voči trénerovi alebo v blízkych vzťahoch.",
      stredni: "Vzorec je aktívny. Hranice sa držia horšie, než by si {chcel|chcela}, hlavne v konflikte.",
      vysoka: "Vzorec výrazne ovplyvňuje, koľko priestoru vo vlastnej kariére máš.",
      dominantni:
        "Vzorec je dominantný. Prispôsobenie je základný režim a vlastné chcenie sa skoro neozve. Prvý krok nie je konflikt, ale vyslovená potreba v bezpečnom vzťahu.",
    },
  },

  "10": {
    nazev: "Perfekcionizmus",
    tema: "Nikdy nekončiace nároky a výkonová identita",
    motto: "Nikdy to nestačí.",
    prozitek:
      "Základný pocit je tlak a nedostatok času. Niečo ťa stále ženie dopredu, takže nie je kde sa zastaviť, a aj regenerácia sa zmení na úlohu, ktorú treba zvládnuť dobre. Musíš byť najlepší vo všetkom, na čom ti záleží, druhé miesto sa nepočíta. Zvonku to vyzerá ako profesionalita, zvnútra ako nikdy nekončiaca nedostatočnosť, pretože latka sa posúva spolu s tebou. Rozoznávajú sa tri podoby a môžu sa prelínať. Kompulzívna, keď musí byť všetko v perfektnom poriadku, od výstroja po rituály, a každá maličkosť dokáže rozhodiť. Zameraná na dosahovanie, keď sa všetko vrátane voľného času premení na prípravu. A zameraná na postavenie, keď ide o uznanie, rebríčky a obdiv, a ktorá býva kompenzáciou hanby alebo pocitu, že nepatríš. Najskôr to obvykle odnesie vzťah a zdravie, pretože oboje sa dá odložiť a nič hneď nepovie. Najjednoduchšia kontrola znie: kedy si naposledy {mal|mala} pocit, že to stačilo?",
    podTlakem:
      "Pod tlakom nespomalíš, ale zrýchliš. Priberieš si ďalší tréning navyše, ďalšiu analýzu, ďalšiu povinnosť, akoby práve tá ďalšia vec konečne priniesla úľavu. Chyba sa netrestá nápravou, ale sebakritikou, a regenerácia sa odsunie ako prvá. Pridať si prácu je pritom úľava, nie riešenie: kým sa niečo robí, nie je čas cítiť, že to nestačí.",
    puvod:
      "Vzorec stavia podmienená láska. Ocenenie prichádzalo za výkon, nie za to, že si. Jeden alebo obaja rodičia mali nároky, ktoré sa nedali naplniť, boli sami perfekcionisti, dávali za vzor seba, alebo tvrdo reagovali, keď si ich očakávanie {nesplnil|nesplnila}. Pre dieťa sa dosahovanie stalo spôsobom, ako si zaistiť lásku a bezpečie. Preto je vzorec dodnes prepojený s pudom sebazáchovy a preto tak vzdoruje rozumným argumentom: spomaliť znamená pre telo riskovať lásku.",
    pasma: {
      "velmi-nizka": "Vzorec je prakticky neaktívny. Nároky na seba máš vysoké, ale znesiteľné.",
      nizka: "Objavuje sa okrajovo, vo výkonovo vypätých obdobiach sezóny.",
      stredni: "Vzorec je aktívny. Latka je vysoko a regenerácia sa odkladá častejšie, než je zdravé.",
      vysoka: "Vzorec výrazne ovplyvňuje tvoje tempo, vzťahy aj to, koľko si dovolíš odpočívať.",
      dominantni:
        "Vzorec je dominantný. Výkon je tvoja identita a zastavenie sa cíti ako ohrozenie. Spomalenie sa tu trénuje ako zručnosť, nie ako predsavzatie.",
    },
  },

  "11": {
    nazev: "Nárokovosť",
    tema: "Nárok na výnimku, impulzivita a problém s obmedzením",
    motto: "Na mňa bežné pravidlá neplatia.",
    prozitek:
      "Máš pocit, že sa na teba bežné obmedzenia tak celkom nevzťahujú, a že tvoje potreby majú prednosť. Keď ti tréner odporuje alebo ti niečo prekazí, príde hnev, ktorý je na situáciu neprimeraný. Vzorec má tri podoby a môžu sa prekrývať. Nárokovosť, keď si žiadaš výnimku z pravidiel, ktoré platia pre ostatných a do druhých sa nevcítiš, pretože ťa to jednoducho nenapadne. Závislá podoba, keď sa výnimočnosť spája s očakávaním, že sa o teba klub alebo tréner postará, pretože je to jeho povinnosť. A impulzívna podoba, keď je problém vydržať nepohodlie: ťažko sa odkladá potešenie, ťažko sa dokončuje nudná časť prípravy a zle sa prestáva s tým, čo krátkodobo uľaví. Zvonku pôsobí tento vzorec sebaisto a v talentovanom športovcovi ho okolie dlho toleruje. Vnútri býva pod ním niečo celkom iné, najčastejšie hanba alebo prázdno, ktoré sa nárokovosťou prehlušuje. Najspoľahlivejšia stopa je hnev na maličkosť.",
    podTlakem:
      "Pod tlakom klesá tolerancia k obmedzeniu. Pravidlá, čakanie a kompromis sa stanú neznesiteľnými, rozhodnutia sa robia rýchlo a impulzívne, a následky sa riešia až potom. Vzťahy v okolí to obvykle odnesú skôr než výsledky, a práve preto sa vzorec drží tak dlho: jeho cena sa platí inde než u teba.",
    puvod:
      "Za vzorcom stojí buď absencia hraníc, keď dieťa dostalo všetko a nikto mu nepovedal nie, pretože bolo talentované, alebo naopak kompenzácia: prostredie, kde bolo dieťa ponižované alebo prehliadané, a výnimočnosť sa stala spôsobom, ako to prežiť. Niekedy je za tým aj rodič, ktorý dieťa vystavoval ako dôkaz vlastnej hodnoty. Obe cesty vedú na to isté miesto: hranica nikdy nebola bezpečná skúsenosť. Buď chýbala úplne, alebo prišla ako poníženie.",
    pasma: {
      "velmi-nizka": "Vzorec je prakticky neaktívny. Hranice a pravidlá nesieš bez problému.",
      nizka: "Objavuje sa okrajovo, vo chvíľach únavy alebo frustrácie.",
      stredni: "Vzorec je aktívny. Obmedzenie a čakanie idú horšie, než by šli.",
      vysoka: "Vzorec výrazne ovplyvňuje tvoje reakcie na prekážky a dopadá na okolie.",
      dominantni:
        "Vzorec je dominantný. Nárok a impulz predbiehajú rozvahu vo väčšine situácií. Zmena sa začína tým, že si všimneš cenu, ktorú platí okolie.",
    },
  },
}
