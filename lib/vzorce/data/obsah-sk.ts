import type { VzorecId, VzorecObsah } from "../types"

// Slovenské znenie textov vyhodnotenia jednotlivých vzorcov.
//
// Zrkadlí obsah.ts kus po kuse: rovnaké kľúče, rovnaké poradie, rovnaké
// rodové značky {mužský|ženský}, ktoré pri vykreslení rozvinie applyGender().
// Slovenčina rod oslovovanej osoby prezradí rovnako ako čeština, takže žena
// nesmie dostať text v mužskom rode.
//
// Preklad, nie prepis: vety sú preložené tak, aby zneli slovensky, ale
// odborný obsah aj poradie myšlienok zostávajú presne také, aké sú v češtine.

export const OBSAH_SK: Record<VzorecId, VzorecObsah> = {
  "01": {
    nazev: "Opustenie",
    tema: "Strach zo straty a emočnej nestability",
    motto: "Prosím ťa, neopúšťaj ma.",
    prozitek:
      "Niekde vnútri máš istotu, že ľudí, na ktorých ti záleží, nakoniec nestratíš náhodou, ale zákonite. Buď odídu, alebo ochorejú, alebo si nájdu niekoho iného. Aj keď vzťah práve funguje dobre, čakáš, kedy sa to zlomí. Táto istota nestojí na tom, čo sa práve deje, a preto sa nedá vyvrátiť tým, že ti niekto povie, že nikam nejde. Vzorec opustenia vzniká často skôr, než sa dieťa naučí hovoriť, a preto je pod ním cítiť niečo staré a naliehavé: krátke odlúčenie dokáže spustiť paniku, ktorá je na situáciu zjavne priveľká. Reakcia býva jedna z dvoch. Buď sa primkneš bližšie, kontroluješ, overuješ, žiadaš uistenie, a čím viac ho dostaneš, tým kratšie vydrží. Alebo si naopak držíš odstup, pretože čo si nepustíš k telu, to ťa nemôže opustiť. Zvonku to vyzerá odlišne, ale robí to isté: chráni ťa pred stratou a zároveň ti bráni v tom, aby vzťah zosilnel natoľko, že by stratu uniesol.",
    podTlakem:
      "Pod tlakom sa skracuje tvoja tolerancia k neistote. Neprijatá správa, zmenený tón hlasu alebo pár dní bez kontaktu sa okamžite čítajú ako začiatok konca. Rozhodnutia potom nerobíš podľa toho, čo chceš, ale podľa toho, čo udrží druhého na mieste.",
    puvod:
      "Za vzorcom stojí skúsenosť, že blízkosť je nespoľahlivá. Nemusí ísť o dramatickú stratu. Stačí rodič, ktorý bol raz vrelý a inokedy nedostupný, choroba v rodine, opakované sťahovanie a strata kamarátov, alebo dospelý, ktorého nálada sa nedala predvídať. Dieťa si z toho neodnesie myšlienku, ale telesnú skúsenosť: to, čo mám {rád|rada}, sa môže každú chvíľu stratiť. A pretože sa to naučilo skôr než slová, nedá sa to prepísať argumentom.",
    pasma: {
      "velmi-nizka":
        "Tento vzorec u teba prakticky nesvieti. Straty ťa zasahujú, ale nedefinujú tvoje vzťahy.",
      nizka:
        "Vzorec je prítomný len okrajovo. Objaví sa vo vypätých chvíľach a zase odíde.",
      stredni:
        "Vzorec je aktívny a v záťaži sa dá spoznať. V pokoji ho väčšinou prehlušíš, pod tlakom sa hlási.",
      vysoka:
        "Vzorec výrazne ovplyvňuje, ako vzťahy prežívaš a aké rozhodnutia v nich robíš.",
      dominantni:
        "Vzorec je dominantný. Strach zo straty je do veľkej miery tým, čo riadi tvoje vzťahové správanie.",
    },
  },

  "02": {
    nazev: "Nedôvera",
    tema: "Ostražitosť, nedôvera a očakávanie zrady",
    motto: "Nemôžem ti veriť.",
    prozitek:
      "Základné nastavenie znie, že ľudia skôr či neskôr využijú to, čo o tebe vedia. Nemusí ísť o vedomé podozrenie. Je to skôr trvalo zapnutá ostražitosť, ktorá beží aj tam, kde je zbytočná. Sleduješ nezrovnalosti, overuješ si, čo ti kto povedal, a hľadáš, čo je za tým. Keď niekto urobí niečo pekné, prvá otázka je, čo za to. Paradox je, že ostražitosť ťa nechráni, ale udržiava v stálom napätí, pretože nikdy nemáš dosť dôkazov. Ochranných stratégií býva niekoľko. Nepustíš nikoho bližšie, než kam dosiahne škoda. Alebo ublížiš prvý, aby ťa nepredbehli. Alebo si držíš dokonalý prehľad, pretože kto má informácie, ten nebude {prekvapený|prekvapená}. Najviac to bolí u ľudí, ktorí sú ti najbližšie. Práve u nich má zrada najväčšiu cenu, a preto sa u nich stráži najviac.",
    podTlakem:
      "Pod tlakom sa ostražitosť mení na obranu. Nesúhlas čítaš ako útok, otázku ako výsluch, spätnú väzbu ako pokus zhodiť ťa. Reakcia príde rýchlo a býva tvrdšia, než si situácia zaslúži, a to aj voči ľuďom, ktorí ti nič neurobili.",
    puvod:
      "Vzorec vzniká tam, kde chýbalo základné bezpečie. Niekedy ide o týranie, ponižovanie alebo zneužitie, inokedy o miernejšiu, ale opakovanú skúsenosť: dospelý, ktorý sľuboval a nedodržal, ktorý zosmiešnil zverené tajomstvo, ktorý sa správal nepredvídateľne. Dieťa si z toho urobí rozumný záver: bezpečne je len vtedy, keď som v strehu. V detstve to bola správna stratégia. V dospelosti bráni presne tomu, čo potrebuješ najviac.",
    pasma: {
      "velmi-nizka": "Vzorec je prakticky neaktívny. Dôveru dávaš podľa toho, čo sa naozaj stalo.",
      nizka: "Objavuje sa okrajovo, skôr ako opatrnosť než ako nedôvera.",
      stredni: "Vzorec je aktívny. V bezpečnom prostredí ustúpi, v záťaži sa ostražitosť vracia.",
      vysoka: "Vzorec výrazne ovplyvňuje, ako blízko si ľudí pustíš a ako čítaš ich zámery.",
      dominantni: "Vzorec je dominantný. Ostražitosť je základný režim, nie výnimka.",
    },
  },

  "03": {
    nazev: "Citová deprivácia",
    tema: "Emočný hlad a nenaplnená potreba blízkosti",
    motto: "Nikdy nezažijem lásku, po akej túžim.",
    prozitek:
      "Tento vzorec sa zle opisuje, pretože nemá tvar myšlienky. Je to skôr trvalý pocit prázdna a osamelosti, ktorý nezmizne, ani keď si medzi ľuďmi, ktorí ťa majú radi. Nikto ti celkom nerozumie. Nikto sa naozaj neopýta, ako ti je. Nikto tu nie je tak, ako by si potreboval. Často sa to pozná až podľa vzťahov, ktoré si vyberáš: priťahujú ťa ľudia, ktorí citovo nedosiahnu tam, kam potrebuješ, a tak sa prázdno potvrdí. Alebo vzťah začne sľubne a po čase príde sklamanie a nuda, pretože druhý nikdy nedá dosť. Zvonku to vyzerá ako náročnosť. Zvnútra je to hlad. Najťažšia časť býva, že si o blízkosť nevieš povedať. Buď preto, že to nepovažuješ za možné, alebo preto, že prijať starostlivosť znamená vydať sa všanc.",
    podTlakem:
      "Pod tlakom sa sťahuješ. Namiesto toho, aby si sa {oprel|oprela} o ľudí okolo, prestaneš zdieľať a ponesieš to {sám|sama}, pretože kdesi vnútri máš istotu, že aj tak nikto nepríde. Tým sa prázdno potvrdí a vzorec zosilnie.",
    puvod:
      "Chýbalo niečo, čo dieťa potrebuje rovnako ako jedlo: pozornosť, vrelosť, porozumenie a citlivé vedenie. Nemuselo ísť o zanedbanie. Rodičia mohli byť starostliví v tom, čo je vidieť, a nedostupní v tom, čo sa cíti. Boli zaneprázdnení, chladní, sami citovo prázdni, alebo jednoducho nevedeli byť s emóciou dieťaťa. Dieťa z toho neurobí sťažnosť, pretože inú skúsenosť nemá. Urobí z toho normu: takto to jednoducho je.",
    pasma: {
      "velmi-nizka": "Vzorec je prakticky neaktívny. Blízkosť vieš prijímať aj dávať.",
      nizka: "Objavuje sa len okrajovo, v obdobiach, keď si na kontakt chudobnejší.",
      stredni: "Vzorec je aktívny. Pocit nepochopenia sa vracia a ovplyvňuje, ako vzťahy hodnotíš.",
      vysoka: "Vzorec výrazne ovplyvňuje tvoje vzťahy aj to, koho si vyberáš.",
      dominantni: "Vzorec je dominantný. Emočný hlad je základný tón, na ktorom stoja ostatné témy.",
    },
  },

  "04": {
    nazev: "Spoločenské vylúčenie",
    tema: "Pocit odlišnosti a vylúčenia zo skupiny",
    motto: "Nepatrím nikam.",
    prozitek:
      "Základným pocitom je osamelosť v spoločnosti, nie o samote. V skupine stojíš mimo, aj keď ťa nikto nevylučuje. Existujú dve podoby a môžu sa prelínať. Prvá hovorí: nechcú ma. V spoločnosti sa cítiš {nedostatočný|nedostatočná}, nevieš, o čom hovoriť, ostatní ti pripadajú schopnejší, múdrejší alebo krajší, a celú akciu prečkávaš s úľavou, až budeš môcť odísť. Druhá hovorí: som iný. Nemusí v nej byť pocit menejcennosti, skôr trvalé vedomie, že do tejto skupiny nepatríš, pretože si z iného cesta. Dôležité je, že tento vzorec sa týka skupín, nie blízkych vzťahov. S jednotlivcami, ktorých poznáš, ti môže byť dobre. Len čo je ľudí viac a nie sú známi, spustí sa to znova.",
    podTlakem:
      "Pod tlakom sa vyhýbaš. Neprijmeš pozvanie, nevystúpiš na porade, neprihlásiš sa o slovo, nepresadíš svoj nápad v skupine. Každé vyhnutie krátkodobo uľaví a dlhodobo vzorec potvrdí, pretože skúsenosť, ktorá by ho vyvrátila, sa nemá kde stať.",
    puvod:
      "Na rozdiel od citovej deprivácie tento vzorec obvykle nevzniká doma, ale medzi rovesníkmi. Bolo to vylúčenie zo skupiny, posmech, rodina, ktorá sa niečím nápadne líšila, sťahovanie do prostredia, kam si {nezapadol|nezapadla}, alebo len dlhé obdobie, keď si {bol|bola} v kolektíve ten posledný. Niekedy stačí jediné dosť silné obdobie. Dieťa z toho odvodí pravidlo o sebe, nie o tej skupine.",
    pasma: {
      "velmi-nizka": "Vzorec je prakticky neaktívny. V skupine sa pohybuješ prirodzene.",
      nizka: "Objavuje sa okrajovo, v novom alebo veľmi formálnom prostredí.",
      stredni: "Vzorec je aktívny. V skupinách stojíš skôr bokom, než by si {chcel|chcela}.",
      vysoka: "Vzorec výrazne ovplyvňuje, kam chodíš, čo si dovolíš povedať a akú veľkú skupinu unesieš.",
      dominantni: "Vzorec je dominantný. Pocit, že nepatríš, je stály a riadi tvoje voľby.",
    },
  },

  "05": {
    nazev: "Závislosť",
    tema: "Neistota v samostatnosti a rozhodovaní",
    motto: "Ja {sám|sama} to nezvládnem.",
    prozitek:
      "Bežný život ti pripadá ako niečo, na čo nemáš dosť síl. Nejde o lenivosť ani o skutočnú neschopnosť, často zvládaš oveľa viac, než si pripúšťaš. Ide o pocit, že bez druhého to neustojíš. Nová situácia vyvolá úzkosť, rozhodnutia sa odkladajú, kým niekto neporadí, a aj po rozhodnutí zostáva pochybnosť, či to nebola chyba. Vlastnému úsudku neveríš, a tak si ho nechávaš potvrdzovať. Existuje aj obrátená podoba, ktorá vyzerá ako pravý opak: nezávislosť taká zásadová, že neprijmeš pomoc, ani keď ju naozaj potrebuješ. Nie je to sila, je to ten istý vzorec z druhej strany. Prijať pomoc by totiž znamenalo pripustiť, že {sám|sama} nestačíš, a to je neznesiteľné. Obe podoby stoja na tej istej vete: {sám|sama} na to nemám.",
    podTlakem:
      "Pod tlakom sa rozhodovanie zastaví. Hľadáš niekoho, kto to rozhodne za teba, alebo sa rozhodnutiu vyhneš tak dlho, až ho urobí čas. Zodpovednosť sa presúva inam a s ňou aj pocit, že máš na svoj život vplyv.",
    puvod:
      "Vzorec obvykle nevzniká z nedostatku starostlivosti, ale z jej prebytku. Rodič, ktorý robil veci za teba rýchlejšie a lepšie, ktorý ťa chránil pred chybou, ktorý dával najavo úzkosť, kedykoľvek si niečo {skúsil|skúsila} {sám|sama}. Dieťa z toho vyvodí, že svet je nebezpečnejší a ono samo menej schopné, než je pravda. Niekedy pôsobí aj opak: prostredie také nepredvídateľné, že sa samostatnosť nedala bezpečne vyskúšať.",
    pasma: {
      "velmi-nizka": "Vzorec je prakticky neaktívny. Rozhodnutia robíš {sám|sama} a stojíš si za nimi.",
      nizka: "Objavuje sa okrajovo, pri veľkých alebo neznámych rozhodnutiach.",
      stredni: "Vzorec je aktívny. Bez potvrdenia zvonku sa rozhoduje výrazne horšie.",
      vysoka: "Vzorec výrazne ovplyvňuje tvoju samostatnosť a mieru, do akej riadiš vlastný život.",
      dominantni: "Vzorec je dominantný. Otázka, či to zvládneš {sám|sama}, stojí pod väčšinou rozhodnutí.",
    },
  },

  "06": {
    nazev: "Zraniteľnosť",
    tema: "Katastrofizácia a očakávanie ohrozenia",
    motto: "Katastrofa je na spadnutie.",
    prozitek:
      "Očakávaš, že sa stane niečo zlé, a zároveň že tomu nedokážeš zabrániť. Vzorec pracuje v dvoch smeroch naraz: zväčšuje nebezpečenstvo a zmenšuje tvoju schopnosť čeliť mu. Preto nepomáha, keď si spočítaš, aké je niečo nepravdepodobné. Ohrozenie máva štyri obvyklé oblasti a nemusíš mať všetky. Zdravie a choroba, keď sleduješ telesné prejavy a hľadáš, čo znamenajú. Nebezpečenstvo zvonku, teda nehody, prepadnutie, lietanie, cestovanie. Peniaze, teda strach, že o všetko prídeš. A strata kontroly, teda obava, že sa pred ľuďmi neudržíš, zrútiš alebo zblázniš. Najnáročnejšie na tom býva, že úzkosť neubúda tým, že sa nič nestane. Každý deň bez katastrofy je len deň, keď zatiaľ neprišla.",
    podTlakem:
      "Pod tlakom sa zužuje výber. Rozhoduješ sa tak, aby si {minimalizoval|minimalizovala} riziko, nie aby si niečo {dosiahol|dosiahla}. Príležitosti sa odmietajú skôr, než sa stihnú zvážiť, a pozornosť sa drží pri tom, čo by sa mohlo pokaziť.",
    puvod:
      "Za vzorcom obvykle stojí dospelý, ktorý svet ukazoval ako nebezpečné miesto. Prehnane ochraňujúci rodič, ktorý varoval pred všetkým, sám žil v úzkosti a dával najavo, že vonku číha pohroma. Alebo naopak skutočné ohrozenie v detstve: vážna choroba v rodine, nehoda, chudoba, nestabilný domov. Dieťa si z toho odnesie dve presvedčenia naraz, že svet je nebezpečný a že ono naň nestačí.",
    pasma: {
      "velmi-nizka": "Vzorec je prakticky neaktívny. Riziko vnímaš vecne a primerane.",
      nizka: "Objavuje sa okrajovo, v obdobiach únavy alebo skutočnej neistoty.",
      stredni: "Vzorec je aktívny. Katastrofické scenáre sa vracajú a berú energiu.",
      vysoka: "Vzorec výrazne ovplyvňuje, do čoho ideš a čomu sa radšej vyhneš.",
      dominantni: "Vzorec je dominantný. Očakávanie ohrozenia je trvalé pozadie, na ktorom sa rozhoduješ.",
    },
  },

  "07": {
    nazev: "Menejcennosť",
    tema: "Hanba, vnútorná nedostatočnosť a strach z odhalenia",
    motto: "Kto ma pozná bližšie, nemôže ma mať {rád|rada}.",
    prozitek:
      "Hlavným pocitom je hanba. Nie vina za to, čo si {urobil|urobila}, ale hanba za to, čo si. Niekde vnútri máš presvedčenie, že je v tebe niečo chybné, a že keby to ľudia videli, odišli by. Preto sa to schováva. Časti seba neukazuješ ani najbližším, hlavne im nie. Vzniká rozdiel medzi tým, koho ľudia poznajú, a tým, kto si myslíš, že naozaj si. Na rozdiel od spoločenského vylúčenia, ktoré sa týka skupín, tento vzorec silnie práve s blízkosťou. Čím bližšie si niekoho pustíš, tým väčšie je riziko odhalenia. Správanie z toho plynie dvojaké a často sa strieda. Buď sa blízkosti vyhýbaš, alebo si vyberáš ľudí, ktorí ťa kritizujú a odmietajú, pretože ti sadnú do obrazu, ktorý o sebe máš. Pochvala sa pritom neudrží, skĺzne po povrchu. Kritika zapadne presne.",
    podTlakem:
      "Pod tlakom sa hanba zmení na sebakritiku, ktorá je tvrdšia než čokoľvek, čo by ti povedal druhý. Chybu si nesundáš z chrbta. Buď sa stiahneš, aby nebolo čo odhaliť, alebo predbehneš kritiku tým, že sa zhodíš {sám|sama}.",
    puvod:
      "Vzorec stavia opakovaná kritika od niekoho, na kom záležalo. Rodič, ktorý porovnával, ponižoval, dával najavo sklamanie alebo lásku podmieňoval. Nemuselo ísť o tvrdosť, stačí chlad a trvalá nespokojnosť. Dieťa nemá ako dôjsť k záveru, že problém je v dospelom. Dôjde k jedinému možnému vysvetleniu: je to mnou.",
    pasma: {
      "velmi-nizka": "Vzorec je prakticky neaktívny. Nedokonalosti unesú byť vidieť.",
      nizka: "Objavuje sa okrajovo, po nezdare alebo kritike.",
      stredni: "Vzorec je aktívny. Hanba sa vracia a ovplyvňuje, koľko zo seba ukážeš.",
      vysoka: "Vzorec výrazne ovplyvňuje tvoj vzťah k sebe aj to, ako blízko si ľudí pustíš.",
      dominantni: "Vzorec je dominantný. Hanba je základná vrstva, cez ktorú sa pozeráš na všetko ostatné.",
    },
  },

  "08": {
    nazev: "Zlyhanie",
    tema: "Očakávanie neúspechu a výkonová nedôvera v seba",
    motto: "Nie som {dosť dobrý|dosť dobrá} na to, aby som {uspel|uspela}.",
    prozitek:
      "V oblasti výkonu a dosahovania sa porovnávaš s ostatnými a vychádzaš z toho ako ten pod priemerom. Nejde o to, že by si sa {bál|bála} náročných úloh. Ide o istotu, že v porovnaní s rovesníkmi si {zaostal|zaostala}, aj keď fakty hovoria niečo iné. Odtiaľ pramenia dve podoby. Prvá je stiahnutie: nejdeš do vecí, ktoré by si najskôr {zvládol|zvládla}, pretože očakávaný neúspech sa nedá zniesť. Druhá je syndróm podvodníka: úspech máš, ale nepovažuješ ho za svoj a čakáš, kedy sa príde na to, že v skutočnosti nie si taký {schopný|schopná}. Vzorec pracuje ako sebanapĺňajúca predpoveď. Pretože do vecí nejdeš naplno alebo do nich nejdeš vôbec, výsledky tomu zodpovedajú, a to sa potom číta ako potvrdenie. Dôležité je rozlíšenie od perfekcionizmu: zlyhanie znamená očakávať od seba príliš málo v porovnaní s ostatnými, perfekcionizmus príliš veľa v porovnaní s nedosiahnuteľnou métou.",
    podTlakem:
      "Pod tlakom príde odklad alebo únik. Úloha sa odsunie, cieľ sa zníži, príležitosť sa pustí. Niekedy naopak príde prehnaná práca, ale bez radosti z výsledku, pretože žiadny výsledok nestačí na to, aby presvedčil.",
    puvod:
      "Býva za tým prostredie, kde sa výkon porovnával a porovnanie vychádzalo zle. Súrodenec, ktorého dávali za vzor, škola, v ktorej si {nestačil|nestačila}, rodič, ktorý dal najavo sklamanie alebo naopak nepomohol tam, kde si to {potreboval|potrebovala}. Niekedy je príčinou nerozpoznaná porucha učenia alebo odbor zvolený podľa želania rodičov, nie podľa schopností. Dieťa si záver o svojich možnostiach urobí skôr, než dostane šancu ho vyskúšať.",
    pasma: {
      "velmi-nizka": "Vzorec je prakticky neaktívny. Svojim schopnostiam veríš primerane.",
      nizka: "Objavuje sa okrajovo, po nezdare alebo v novom odbore.",
      stredni: "Vzorec je aktívny. Porovnávanie s ostatnými berie istotu a chuť ísť do rizika.",
      vysoka: "Vzorec výrazne ovplyvňuje, aké ciele si dovolíš a ako čítaš vlastné výsledky.",
      dominantni: "Vzorec je dominantný. Očakávanie neúspechu predchádza väčšine výkonových rozhodnutí.",
    },
  },

  "09": {
    nazev: "Podmanenie",
    tema: "Prispôsobenie, potlačenie seba a strata hraníc",
    motto: "Nakoniec vždy urobím to, čo chceš ty.",
    prozitek:
      "Žiješ podľa toho, čo chcú druhí, a vlastné potreby dávaš bokom tak samozrejme, že si to často ani nevšimneš. Konfliktu sa vyhýbaš, ustupuješ, kým to ide, a keď niekedy dáš prednosť sebe, príde vina. Vzniká z toho tichá nerovnováha: dávaš viac, než dostávaš, a hlavné rozhodnutia v tvojom živote akoby robil niekto iný. Sú dva varianty. Poddajnosť, keď sa prispôsobuješ zo strachu z hnevu, odvety alebo straty. A sebaobetovanie, keď sa prispôsobuješ preto, že cítiš bolesť druhých tak silno, že inak to nejde. Zvonku to vyzerá ako láskavosť a často to láskavosť aj je. Rozdiel je v tom, že tu si to nevyberáš. Pod povrchom sa pritom hromadí hnev, ktorý sa nemá kde vybiť, a preto vychádza nepriamo: pasivitou, otáľaním, únavou, telesnými ťažkosťami alebo nečakaným výbuchom.",
    podTlakem:
      "Pod tlakom povieš áno skôr, než si stihneš spočítať kapacitu. Vlastná hranica zmizne prvá a ako posledné sa prizná, že už to nejde. Vyčerpanie potom nepríde z práce, ale z toho, že sa v nej nikde nepočíta s tebou.",
    puvod:
      "Za vzorcom stojí dospelý, ktorého vôľu sa nedalo bezpečne odmietnuť. Rodič dominantný, nevyspytateľný, trestajúci, alebo naopak krehký a chorý, ktorého sa nedalo zaťažiť. V oboch prípadoch sa dieťa naučilo, že mať vlastnú potrebu je nebezpečné alebo sebecké. Vlastné chcenie sa preto radšej utlmilo skôr, než sa stihlo vysloviť.",
    pasma: {
      "velmi-nizka": "Vzorec je prakticky neaktívny. Svoje potreby vieš pomenovať aj presadiť.",
      nizka: "Objavuje sa okrajovo, voči autoritám alebo v blízkych vzťahoch.",
      stredni: "Vzorec je aktívny. Hranice sa držia horšie, než by si {chcel|chcela}, hlavne v konflikte.",
      vysoka: "Vzorec výrazne ovplyvňuje, koľko priestoru vo vlastnom živote máš.",
      dominantni: "Vzorec je dominantný. Prispôsobenie je základný režim a vlastné chcenie sa skoro neozve.",
    },
  },

  "10": {
    nazev: "Perfekcionizmus",
    tema: "Neúprosné nároky, tlak a výkonová identita",
    motto: "Nikdy nebudem {dosť dobrý|dosť dobrá}.",
    prozitek:
      "Základný pocit je tlak a nedostatok času. Niečo ťa stále ženie dopredu, takže nie je kde sa zastaviť, a aj odpočinok sa zmení na úlohu, ktorú treba zvládnuť dobre. Musíš byť najlepší vo všetkom, na čom ti záleží, druhé miesto sa nepočíta. Zvonku to vyzerá ako úspech, zvnútra ako nikdy nekončiaca nedostatočnosť, pretože latka sa posúva spolu s tebou. Rozoznávajú sa tri podoby a môžu sa prelínať. Kompulzívna, keď musí byť všetko v perfektnom poriadku a každá maličkosť dokáže rozhodiť. Zameraná na dosahovanie, teda workoholizmus, keď sa všetko vrátane koníčkov premení na prácu. A zameraná na postavenie, keď ide o uznanie, prestíž a obdiv, a ktorá býva kompenzáciou menejcennosti alebo spoločenského vylúčenia. Najskôr to obvykle odnesie vzťah a zdravie, pretože oboje sa dá odložiť a nič hneď nepovie.",
    podTlakem:
      "Pod tlakom nespomalíš, ale zrýchliš. Priberieš si ďalšiu zodpovednosť, akoby práve tá ďalšia vec konečne priniesla úľavu. Chyba sa netrestá nápravou, ale sebakritikou, a odpočinok sa odsúva ako prvý.",
    puvod:
      "Vzorec stavia podmienená láska. Ocenenie prichádzalo za výkon, nie za to, že si. Jeden alebo obaja rodičia mali nároky, ktoré sa nedali naplniť, boli sami perfekcionisti, dávali za vzor seba, alebo tvrdo reagovali, keď si ich očakávanie {nesplnil|nesplnila}. Pre dieťa sa dosahovanie stalo spôsobom, ako si zaistiť lásku a bezpečie. Preto je vzorec dodnes prepojený s pudom sebazáchovy a preto tak vzdoruje rozumným argumentom.",
    pasma: {
      "velmi-nizka": "Vzorec je prakticky neaktívny. Nároky na seba máš vysoké, ale znesiteľné.",
      nizka: "Objavuje sa okrajovo, vo výkonovo vypätých obdobiach.",
      stredni: "Vzorec je aktívny. Latka je vysoko a odpočinok sa odkladá častejšie, než je zdravé.",
      vysoka: "Vzorec výrazne ovplyvňuje tvoje tempo, vzťahy aj to, koľko si dovolíš odpočívať.",
      dominantni: "Vzorec je dominantný. Výkon je tvoja identita a zastavenie sa cíti ako ohrozenie.",
    },
  },

  "11": {
    nazev: "Výnimočnosť / veľikášstvo",
    tema: "Nárokovosť, impulz a problém s hranicou",
    motto: "Môžem si robiť a mať, čo chcem.",
    prozitek:
      "Máš pocit, že sa na teba bežné obmedzenia tak celkom nevzťahujú, a že tvoje potreby majú prednosť. Keď ti niekto odporuje alebo ti niečo prekazí, príde hnev, ktorý je na situáciu neprimeraný. Vzorec má tri podoby a môžu sa prekrývať. Rozmaznanosť, keď si nárokuješ výnimku a do druhých sa nevcítiš, pretože ťa to jednoducho nenapadne. Závislá podoba, keď sa výnimočnosť spája s očakávaním, že sa o teba niekto silnejší postará, pretože je to jeho povinnosť. A impulzívna podoba, keď je problém vydržať nepohodlie: ťažko sa odkladá potešenie, ťažko sa dokončuje cieľ, ktorý prestal baviť, a zle sa prestáva s tým, čo krátkodobo uľaví. Zvonku pôsobí tento vzorec sebaisto. Vnútri býva pod ním niečo celkom iné, najčastejšie hanba alebo prázdno, ktoré sa nárokovosťou prehlušuje.",
    podTlakem:
      "Pod tlakom klesá tolerancia k obmedzeniu. Pravidlá, čakanie a kompromis sa stanú neznesiteľnými, rozhodnutia sa robia rýchlo a impulzívne, a následky sa riešia až potom. Vzťahy to obvykle odnesú skôr než výsledky.",
    puvod:
      "Za vzorcom stojí buď absencia hraníc, keď dieťa dostalo všetko a nikto mu nepovedal nie, alebo naopak kompenzácia: prostredie, kde bolo dieťa ponižované alebo prehliadané, a výnimočnosť sa stala spôsobom, ako to prežiť. Niekedy je za tým aj rodič, ktorý dieťa vystavoval ako dôkaz vlastnej hodnoty. Vo všetkých variantoch chýbala skúsenosť, že hranica môže byť láskavá a pritom pevná.",
    pasma: {
      "velmi-nizka": "Vzorec je prakticky neaktívny. Hranice a pravidlá nesieš bez problému.",
      nizka: "Objavuje sa okrajovo, vo chvíľach únavy alebo frustrácie.",
      stredni: "Vzorec je aktívny. Obmedzenie a čakanie idú horšie, než by šli.",
      vysoka: "Vzorec výrazne ovplyvňuje tvoje reakcie na prekážky a dopadá na okolie.",
      dominantni: "Vzorec je dominantný. Nárok a impulz predbiehajú rozvahu vo väčšine situácií.",
    },
  },
}
