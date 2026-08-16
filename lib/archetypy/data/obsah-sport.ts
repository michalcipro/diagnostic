import type { ArchetypId, ArchetypObsah } from "../types"

// Sportovní znění textů archetypů.
//
// Stejná dvanáctka jako v byznysové verzi (Mark & Pearson: The Hero and the
// Outlaw, rozbor je v docs/archetypy-analyza.md), ale přeložená do soutěžní
// identity: odkud sportovec bere energii, jakou roli přirozeně zaujme, co ho
// pod tlakem sráží a jak s ním má trenér pracovat.
//
// Dvě věci se drží jinak než v byznysové verzi:
//
// 1) Příklady nejsou jména skutečných sportovců. Přisuzovat žijícím lidem
//    psychologický profil je spekulace, takže tu stojí typové portréty.
// 2) Text musí sedět individuálnímu i týmovému sportu. Kde je řeč o týmu,
//    myslí se i tréninková skupina a lidé kolem; sekce o roli mluví
//    o obojím zvlášť.
//
// Psáno sportovci přímo, tykáním; návod je psaný tak, aby ho unesl i trenér.
// Rodové tvary jsou označené {mužský|ženský} a rozvine je applyGender().

export const OBSAH_ARCHETYPU_SPORT: Record<ArchetypId, ArchetypObsah> = {
  nevinatko: {
    nazev: "Neviňátko",
    puvodni: "Innocent",
    prezdivka: "Radost ze hry",
    motto: "Dělám to, protože mě to baví.",
    touha: "dělat sport poctivě a s radostí, se kterou {jsem začínal|jsem začínala}",
    strach: "že se ze sportu stane špinavá a cynická práce",
    dar: "čistá motivace, důvěra a klid v hlavě",
    podstata:
      "Tvoje síla je v tom, že jsi ve sportu {zůstal|zůstala} u toho, proč jsi do něj {šel|šla}. Nepotřebuješ nenávidět soupeře, abys {podal|podala} výkon, a nepotřebuješ křivdu, abys {měl|měla} energii. Tam, kde ostatní táhne strach nebo vztek, tebe táhne radost z pohybu a víra, že poctivá práce se nakonec vyplatí. To je vzácnější, než se zdá: čistá motivace vydrží déle než motivace ze zlosti a nevyhoří tak rychle. Tvoje hlava je v soutěži klidnější, protože nenese balík křivd. Riziko je druhá strana téže mince. Prostředí vrcholového sportu není hezké: zákulisní politika, nominace, nespravedlivé rozhodnutí, soupeř, který podvádí. Tebe tohle vyčerpává víc než tvrdý trénink a máš sklon nevidět to, dokud to nebolí. Nejlepší verze tohohle typu neztratí radost, ale přestane být naivní: ví, jak to kolem chodí, a přesto se rozhodne hrát čistě. To není slabost, to je nejtěžší forma síly.",
    vPodnikani:
      "V tréninku jsi {vděčný|vděčná} a {bezproblémový|bezproblémová} {sportovec|sportovkyně}: zadání plníš, trenérovi věříš, nehádáš se o každou sérii. Dobře fungujete v prostředí, kde je jasno a kde se drží slovo. V soutěži tě nejvíc zvedá chuť si to užít, ne strach z ostudy; když se atmosféra změní v hon na výsledek, tvoje výkonnost klesá dřív než ostatním. Pozor na fázi, kdy sport přejde z koníčku do práce, tedy na přechod do vyšší kategorie, na první smlouvu, na první velká očekávání. To je moment, kdy tenhle typ buď dospěje a udrží si radost, nebo vyhoří a skončí, i když má na víc.",
    stin:
      "Stínem je popírání. Pod tlakem přestaneš vidět, co ti nejde, protože to nezapadá do tvého obrazu světa: zranění, které přecházíš, spoluhráč, který pracuje proti tobě, trenér, který ti nefandí. Odkládáš nepříjemné rozhovory a doufáš, že se to samo srovná. Druhá podoba stínu je křehkost: když ti někdo ublíží nebo zpochybní tvoje úmysly, zasáhne tě to hlouběji, než je zdravé, a místo věcné reakce se stáhneš do sebe. Třetí je pasivita: čekáš, až spravedlnost přijde sama, protože jsi přece {poctivý|poctivá}, a mezitím tě předběhne někdo, kdo si o svoje řekl.",
    pasti:
      "Nejčastější chyba je vzít tomuhle typu radost. Trenér, který věří, že motivace musí bolet, ho zlomí rychleji než soupeř. Druhá past je nechat ho bez ochrany v prostředí plném intrik; tenhle typ potřebuje férové pravidlo, jinak ztratí důvěru a s ní i výkon. Třetí past je zaměnit klid za lenost, protože tenhle sportovec nepůsobí zoufale hladově, ale to neznamená, že nechce vyhrát.",
    navod: [
      "Držte radost jako součást přípravy, ne jako odměnu: jeden blok v týdnu, který má být čistě zábavný, tenhle typ nabije víc než dva navíc odmakané.",
      "Zpětnou vazbu podávejte věcně a bez zesměšňování. Ironie a tvrdý humor sedí jiným typům; tady bere jistotu a spouští stažení.",
      "Nauč se pojmenovat nefér situaci nahlas a hned: co se stalo, co s tím chceš dělat. Poctivost neznamená mlčet.",
      "Jednou za měsíc si projděte jednu věc, kterou nechceš vidět: zdraví, formu, vztah v týmu. Ať se to řeší dřív, než to bouchne.",
      "Před vstupem do vyšší úrovně si dopředu řekněte, co všechno se změní a co zůstane. Tenhle typ nezlomí zátěž, ale ztráta smyslu.",
    ],
    priklady:
      "Sportovec, který po prohře gratuluje soupeři dřív, než zvedne hlavu; hráč, kterého baví trénink stejně jako zápas; ten, kdo v šatně nikdy nepomlouvá.",
    sekundarniRole:
      "Jako druhý v pořadí drží motivaci čistou: brzdí, aby se z primárního archetypu stala honba za výsledkem za každou cenu, a udržuje ve sportu radost i v nejtěžších obdobích.",
    role:
      "V týmu je to člověk, který nedělá problémy a spojuje: nikdo proti němu nic nemá. V individuálním sportu je to sportovec, který se drží plánu a nezpochybňuje ho. V obou případech ho nedávejte do role, kde se má tvrdě vymezovat nebo vyjednávat, protože ho to stojí víc energie než samotný výkon.",
    sTrenerem:
      "Tření vzniká, když trenér používá tlak, výhrůžky a srovnávání jako palivo. U tohohle typu to nefunguje: místo aby se nabudil, uzavře se a přestane mluvit o tom, co ho bolí. Druhé tření je opačné: trenér si zvykne, že tenhle sportovec nikdy nic nechce, a přestane mu věnovat pozornost. Oba omyly končí stejně, tichým odchodem.",
    znacka:
      "Navenek je tenhle typ důvěryhodný a čistý, což je pro partnery i pro mladé fanoušky nejcennější, co ve sportu je. Komunikuj jednoduše a pravdivě: co dělám, proč mě to baví, jak se připravuju. Nikdy nehraj tvrďáka, který ti nesedí; falešná póza je tady poznat na první pohled a bere ti přesně to, co tě odlišuje.",
  },

  objevitel: {
    nazev: "Objevitel",
    puvodni: "Explorer",
    prezdivka: "Hledač",
    motto: "Musí se to dát dělat i jinak.",
    touha: "svoboda dělat sport po svém a hledat vlastní cestu",
    strach: "zapadnout do systému, ve kterém se nedá dýchat",
    dar: "samostatnost, zvědavost a čich na to, co bude fungovat",
    podstata:
      "Tvůj motor je svoboda. Nesneseš, když ti někdo řekne, že se to dělá takhle, protože se to tak dělalo vždycky. Zkoušíš nové metody, sleduješ, co dělají jinde a v jiných sportech, a nebojíš se opustit postup, který všem ostatním vyhovuje. Díky tomu často najdeš věc, která ti sedne líp než univerzální plán, a bývá to o rok dřív, než se z toho stane trend. Nejsilnější jsi v období, kdy se hledá: po zranění, po změně kategorie, při stavbě nové techniky. Riziko je stejné jako síla. Když svoboda ztratí směr, mění se v neschopnost u něčeho vydržet. Nová metoda je vždycky lákavější než dotažení té stávající, a tak měníš tréninkové plány, trenéry i prostředí dřív, než stihnou zabrat. Ve sportu se přitom skoro všechno láme až v momentě, kdy to dlouho nudně opakuješ. Tvoje kariéra roste tehdy, když si na hledání vyhradíš prostor a zbytek necháš běžet ve stereotypu, i když tě nebaví.",
    vPodnikani:
      "V tréninku jsi {zvídavý|zvídavá} a {samostatný|samostatná}: hlídáš si data, čteš, zkoušíš doplňky přípravy, které nikdo v okolí nedělá. Když dostaneš plán bez vysvětlení, děláš ho hůř než plán, kterému rozumíš. V soutěži tě nabudí neznámé prostředí, nový soupeř, nezvyklé podmínky; naopak sedmý start ve stejné hale je pro tebe těžší než pro ostatní. Dlouhé, jednotvárné bloky přípravy jsou tvoje slabina, a přesně ty tě dělají {lepším|lepší}. Nejlíp funguješ, když má stereotyp jasně daný konec a když víš, k čemu vede.",
    stin:
      "Stínem je útěk. Když se objeví nuda nebo první opravdový odpor, začneš hledat důvod, proč jít jinam: jiný klub, jiný trenér, jiná disciplína. Zvenku to vypadá jako hledání sebe, zevnitř je to únik před fází, ve které se to teprve láme. Druhá podoba stínu je nedokončenost: rozdělané techniky, rozdělané změny, nic dotaženého do konce. Třetí je osamělost, protože kdo pořád odchází, nemá kolem sebe lidi, kteří ho znají dost dlouho na to, aby mu řekli pravdu.",
    pasti:
      "Nejhorší, co se tomuhle typu dá udělat, je zavřít ho do systému bez vysvětlení a bez prostoru. Odejde, i kdyby měl objektivně nejlepší podmínky. Druhá past je opačná: nechat ho měnit všechno, kdykoli se mu zachce, a divit se, že roky nejsou vidět. Třetí je posmívat se jeho nápadům, protože právě z nich občas vzejde věc, která posune celou skupinu.",
    navod: [
      "Rozdělte přípravu na jádro a hřiště: osmdesát procent je neměnný stereotyp, dvacet procent je prostor, kde smí zkoušet nové věci. Hranice se domlouvá dopředu, ne v afektu.",
      "Každou změnu vždycky vysvětlete: co, proč a jak dlouho. Tenhle typ udělá i nudnou práci, když jí rozumí, a odflákne i chytrou práci, když ji dostane jako rozkaz.",
      "Zaveďte pravidlo minimální doby: nový postup se nemění dřív než po dohodnutém počtu týdnů, ať se pozná, jestli funguje.",
      "Dej si každý rok jednu opravdovou výpravu: soustředění jinde, jiné prostředí, jiný sport jako doplněk. Tenhle typ potřebuje palivo zvenku, jinak si ho vyrobí odchodem.",
      "Než změníš klub nebo trenéra, napiš si, čemu utíkáš a co si tam poneseš s sebou. Půlka odchodů v tomhle typu řeší nudu, ne podmínky.",
    ],
    priklady:
      "Sportovec, který si sám hledá metody, o kterých trenér ještě neslyšel; ten, kdo miluje první tréninky v nové sezoně a nesnáší poslední týdny stereotypu; hráč, který každou zimu zkouší jiný doplňkový sport.",
    sekundarniRole:
      "Jako druhý v pořadí dodává profilu otevřenost a chuť zkoušet: brání tomu, aby primární archetyp zamrzl v jednom postupu, a přináší do přípravy věci zvenku dřív než ostatní.",
    role:
      "V týmu je to ten, kdo přinese nový nápad a rozproudí zaběhnutou skupinu, ale špatně snáší roli, kde se má jen podřídit. V individuálním sportu je to samostatný typ, který si velkou část přípravy odřídí sám a potřebuje trenéra spíš jako partnera do debaty než jako velitele. V obou případech mu dejte oblast, kterou skutečně vlastní.",
    sTrenerem:
      "Tření vzniká na autoritě. Trenér, který odpovídá „protože to říkám já“, u tohohle typu okamžitě ztrácí kredit, i když má pravdu. Druhé tření vzniká z tempa: trenér chce vydržet u jedné věci, sportovec chce další. Pomáhá dohoda o tom, kdo o čem rozhoduje, sepsaná dřív, než se pohádáte.",
    znacka:
      "Navenek je tenhle typ zajímavý tím, co zkouší a kde všude byl. Vyprávěj cestu, ne jen výsledky: zákulisí, omyly, objevy. Autenticita je tvoje měna a vyhlazená prezentace ti nesluší. Pozor jen na to, aby z tvojí komunikace nebyl seznam začátků bez jediného dokončeného příběhu.",
  },

  mudrc: {
    nazev: "Mudrc",
    puvodni: "Sage",
    prezdivka: "Stratég",
    motto: "Nejdřív tomu chci rozumět.",
    touha: "rozumět svému sportu do hloubky a rozhodovat se podle poznání",
    strach: "jednat naslepo a nechat se obelstít",
    dar: "chladná hlava, analýza a schopnost číst hru",
    podstata:
      "Ty sport nejen děláš, ty ho studuješ. Rozebíráš videa, sleduješ čísla, pozoruješ soupeře a hledáš vzorec. Tvoje výhoda není v tom, že bys {byl|byla} nejsilnější, ale v tom, že víš proč: proč ti minule došly síly, proč tenhle soupeř začíná rychle, proč tvoje technika selhává až ve třetí sérii. Když si rozumíš, nemusíš se spoléhat na náladu a formu. V hlavě máš klid, který ostatní hledají marně, protože ti dává jistotu příprava, ne pocit. Riziko je odstup. Analýza je i nejlepší úkryt: dokud rozebírám, nemusím riskovat. Ve chvíli rozhodnutí, kdy se má vystřelit, zaútočit nebo prostě jít naplno, můžeš být o půl vteřiny pozadu, protože ještě přemýšlíš. Druhé riziko je nedůvěra k intuici, kterou tělo často ví dřív než hlava. Nejlepší verze tohohle typu si připraví všechno předem a v soutěži hlavu vypne, protože práce už je hotová.",
    vPodnikani:
      "V tréninku jsi {přemýšlivý|přemýšlivá} a {technický|technická}: chceš znát smysl každého cvičení, {sám|sama} si vedeš záznamy, poznáš na sobě detail, kterého si nikdo nevšiml. V soutěži jsi {silný|silná} tam, kde se dá vyhrát taktikou, čtením hry a trpělivostí; slabší tam, kde se rozhoduje čistě instinktem v chaosu. Tvoje forma roste pomalu a stabilně, protože nestavíš na náladě. Nejlepší výkony podáváš tehdy, když máš dost času na přípravu a nikdo tě nenutí improvizovat na poslední chvíli.",
    stin:
      "Stínem je paralýza z přemýšlení. Pod tlakem se stáhneš do rozboru: ještě jedno video, ještě jedno vysvětlení, a rozhodnutí se odsune. V zápase to vypadá jako zaváhání, v kariéře jako věčné odkládání kroku nahoru. Druhá podoba stínu je povýšenost: tichý despekt k těm, kdo se rozhodují emocemi a přesto vyhrávají. Třetí je přeanalyzovaný výkon, kdy máš v hlavě tolik pokynů, že tělo nestíhá a jde to celé proti přirozenosti.",
    pasti:
      "Nejčastější chyba je dávat tomuhle typu pokyny bez zdůvodnění; udělá je, ale bez důvěry, a při první krizi se vrátí ke svému. Druhá past je zahltit ho instrukcemi těsně před startem, kdy potřebuje pravý opak: jednu větu a klid. Třetí je vysmívat se jeho potřebě rozumět jako přemýšlení místo makání.",
    navod: [
      "Rozdělte přípravu a soutěž: analýza patří do týdne, do závodu jde jedna jediná věta. Čím víc si toho projdete předem, tím míň toho potřebuje v akci.",
      "Vysvětlujte důvod: každé cvičení má mít smysl, který sportovec umí zopakovat vlastními slovy. Tenhle typ pak makat umí.",
      "Dej rozhodnutí termín: co nerozhodneš do stanoveného dne, rozhodni podle nejlepšího dostupného odhadu. Dokonalá informace ve sportu nikdy nepřijde.",
      "Trénujte rozhodování v chaosu: cvičení s nedostatkem času a informací, kde je horší nerozhodnout se než rozhodnout se špatně.",
      "Nauč se vypínat: rituál po analýze, který uzavře přemýšlení, aby ses v noci před startem {nevracel|nevracela} k číslům.",
    ],
    priklady:
      "Sportovec, který zná statistiky soupeřů zpaměti; ten, kdo si po zápase sám sedne k videu dřív, než ho o to někdo požádá; hráč, kterého ostatní chodí ptát na taktiku.",
    sekundarniRole:
      "Jako druhý v pořadí dodává profilu rozvahu a přesnost: podkládá tah primárního archetypu daty a brání rozhodnutím, která vznikla jen z nadšení nebo ze vzteku.",
    role:
      "V týmu je to přirozený taktický mozek: ten, kdo vidí souvislosti, radí ostatním a bývá prodlouženou rukou trenéra na hřišti. V individuálním sportu je to sportovec, který se podílí na stavbě vlastního plánu a potřebuje mu rozumět. V obou případech mu dejte prostor mluvit do taktiky, jinak přijdete o jeho nejcennější vlastnost.",
    sTrenerem:
      "Tření vzniká, když trenér vnímá otázky jako zpochybňování autority. Tenhle sportovec se neptá proto, aby oponoval, ale proto, aby to uměl použít. Druhé tření je časové: trenér chce rychlé rozhodnutí, sportovec chce ještě den. Pomáhá dohodnout, kdy se debatuje a kdy už se jen plní.",
    znacka:
      "Navenek je tenhle typ důvěryhodný jako nikdo jiný: vysvětluje, učí, rozebírá. Když chceš budovat jméno, stav ho na obsahu, který lidem něco dá, ne na sebeprezentaci. Tenhle typ má nejvíc ze všech nakročeno k roli trenéra, experta nebo komentátora po kariéře.",
  },

  hrdina: {
    nazev: "Hrdina",
    puvodni: "Hero",
    prezdivka: "Závodník",
    motto: "Ukaž mi, co mám porazit.",
    touha: "dokázat svou hodnotu výkonem, když jde do tuhého",
    strach: "selhat a působit {slabý|slabá}",
    dar: "bojovnost, disciplína a odvaha nést odpovědnost za výsledek",
    podstata:
      "Ty potřebuješ soupeře, laťku a jasný výsledek. Překážka tě probudí, tlak tě zostří a v momentě, kdy se rozhoduje, chceš být u toho: poslední střelu, poslední kolo, rozhodující pokus. Tam, kde ostatním tělo tvrdne, tobě se čistí hlava, protože konečně jde o něco. Disciplína ti nedělá problém, protože vidíš, k čemu vede, a dřina bez soupeře tě nudí. Tohle je archetyp, který ve sportu nejvíc oceňujeme, a taky ten, který nejčastěji dojede na svoje přednosti. Když totiž chybí závod, vyrobíš si ho: ze spoluhráče, z trenéra, ze sebe. Odpočinek vnímáš jako slabost, únavu jako výmluvu a bolest jako věc, kterou se prostě projde. Přesně tudy vede cesta k přetrénování, ke zranění a k tomu, že v momentě, kdy jde opravdu o hodně, není z čeho brát. Nejlepší verze tohohle typu je stejně tvrdá v regeneraci jako v tréninku, protože pochopila, že i odpočinek je součást boje.",
    vPodnikani:
      "V tréninku táhneš celou skupinu: zvedáš tempo, nechceš prohrát ani cvičnou hru, a když je skupina líná, štveš ji. V soutěži rosteš úměrně tomu, kolik je v sázce; malé starty tě nezajímají a odbudeš je. Tvoje čísla bývají nejlepší v tom nejtěžším období, protože pod tlakem se ti čistí hlava. Slabinou je monotónní práce bez měřitelného cíle a fáze, kdy se má vědomě ubrat: to bereš jako ústup, ne jako přípravu.",
    stin:
      "Stínem je válka se vším. Pod tlakem začneš vidět nepřátele i tam, kde nejsou: spoluhráč je konkurence, trenér brzda, kritika útok. Druhá podoba stínu je zákaz slabosti; o bolesti, únavě a strachu se nemluví, takže se o nich okolí dozví až ve chvíli, kdy je pozdě. Třetí je závislost na výsledku: po prohře nejsi {smutný|smutná}, ale {bezcenný|bezcenná}, a to je stav, ze kterého se nevrací výkon, ale zranění.",
    pasti:
      "Nejčastější chyba je tenhle typ ještě víc hecovat. Nepotřebuje palivo, potřebuje brzdu a směr. Druhá past je hodnotit ho jen podle výsledku, protože si to sám dělá dost. Třetí je nechat ho vyhrávat každý trénink; typ, který nikdy neprohrává v přípravě, si nevytvoří odolnost vůči prohře v soutěži.",
    navod: [
      "Dejte tvrdé práci hranici: regenerace a volno se plánují do tréninkového plánu jako jednotky, které se plní stejně přísně jako zátěž.",
      "Nastavte vedle výsledkových cílů i procesní: co dělám dobře bez ohledu na skóre. Tenhle typ potřebuje druhé měřítko pro dny, kdy výsledek nepřijde.",
      "Zaveďte pravidlo o hlášení: bolest, únava a strach se hlásí, i když nejsou vidět. Domluvte se na jednoduché stupnici, aby to nebylo o slabosti.",
      "Vybírejte závody, které mají váhu, a zbytek ať jede v tréninkovém režimu. Kdo bojuje o všechno, nemá sílu na to, o co opravdu jde.",
      "Po prohře udělejte rozbor do 48 hodin a pak ji zavřete. Tenhle typ ji jinak nese měsíce a odnese si ji do dalšího startu.",
    ],
    priklady:
      "Sportovec, který chce míč v poslední minutě; ten, kdo v přípravě zvedá tempo celé skupině; hráč, který po prohře nemluví a jde první na další trénink.",
    sekundarniRole:
      "Jako druhý v pořadí dodává profilu tah a disciplínu: přidává primárnímu archetypu ochotu jít do těžkých věcí a schopnost dotáhnout přípravu i tehdy, když nadšení dojde.",
    role:
      "V týmu je to tahoun a často kapitán, ale pozor: vede příkladem, ne trpělivostí, takže mu nedávejte pod křídla ty nejkřehčí. V individuálním sportu je to typ, který snese nejtvrdší přípravu, když ví, k jakému závodu vede. V obou případech potřebuje jasně danou metu, jinak si vyrobí vlastní, a ta bývá nezdravá.",
    sTrenerem:
      "Tření vzniká, když trenér ubírá. Sportovec to čte jako nedůvěru, i když jde o ochranu zdraví. Druhé tření vzniká z kritiky před ostatními: tenhle typ ji nese jako ponížení a odpoví buď vzdorem, nebo tichem. Pomáhá říkat nepříjemné věci mezi čtyřma očima a odůvodňovat ubírání výkonem, ne opatrností.",
    znacka:
      "Navenek jsi {čitelný|čitelná} a {přitažlivý|přitažlivá}: příběh výzvy a překonání funguje vždycky. Dávej ale pozor na dvě věci. Za prvé, hrdinou příběhu má být to, co jsi {překonal|překonala}, ne to, koho jsi {porazil|porazila}. Za druhé, ukaž jednou za čas i slabší chvíli; nepřemožitelnost je nudná a nikdo jí nevěří.",
  },

  rebel: {
    nazev: "Rebel",
    puvodni: "Outlaw",
    prezdivka: "Provokatér",
    motto: "Kdo řekl, že se to takhle musí?",
    touha: "dělat věci po svém a zbourat, co nedává smysl",
    strach: "bezmoc a splynutí s davem",
    dar: "odvaha jít proti proudu a schopnost změnit zaběhnutá pravidla",
    podstata:
      "Tvoje energie pochází z nesouhlasu. Vidíš, co je ve tvém sportu zkostnatělé: cvičení, která se dělají ze zvyku, autority, které nic nedokázaly, pravidla, která chrání systém, ne sportovce. A nemůžeš u toho zůstat potichu. Tvoje nejlepší výkony přicházejí tehdy, když ti někdo řekne, že to nejde, nebo když tě odepíše. Vzdor je pro tebe palivo, které jiní nemají, a právě proto dokážeš věci, které se podle papíru dokázat nedají. Riziko je zjevné: vzdor bez směru je jen konflikt. Když ti chybí skutečný soupeř, začneš bojovat s vlastním týmem, s trenérem a nakonec {sám|sama} se sebou. Boříš postupy dřív, než máš náhradu, a měníš prostředí, kdykoli tě někdo omezí. Nejlepší verze tohohle typu si vybírá, kde bude bojovat: venku proti tomu, co skutečně nefunguje, a uvnitř drží disciplínu, protože bez ní se z rebela stane jen {nespokojený|nespokojená} {sportovec|sportovkyně}.",
    vPodnikani:
      "V tréninku jsi {nepohodlný|nepohodlná} a {přímý|přímá}: ptáš se, proč se něco dělá, a když nedostaneš odpověď, děláš si to po svém. Standardní plán ti sedí hůř než plán ušitý na míru, i kdyby byl objektivně horší. V soutěži jsi nejnebezpečnější v roli outsidera, kterému nikdo nevěří, a naopak si neumíš sednout do role favorita, kde se má jen potvrdit očekávání. Rozhodnutí rozhodčích a nespravedlnost tě dokážou vykolejit víc než únava.",
    stin:
      "Stínem je destrukce. Pod tlakem se vzdor utrhne od smyslu: hádáš se, i když to škodí tobě, boříš i to, co funguje, jen protože to nevzniklo z tvé hlavy. Druhá podoba stínu je věčný odpor vůči jakékoli autoritě, kvůli kterému se s tebou nedá pracovat ani tam, kde by ti chtěli vyjít vstříc. Třetí je cynismus: přesvědčení, že celý systém je zkažený, které z tebe udělá člověka, co jen ubližuje a nikam nepatří.",
    pasti:
      "Nejhorší, co se dá udělat, je zlomit ho silou. Vyhraje s ním jen ten, kdo mu dá důvod, ne rozkaz. Druhá past je opačná: nechat mu všechno projít, protože je nadaný, a rozložit tím tým. Třetí je brát jeho námitky osobně; velká část z nich má věcné jádro, i když je řečená nevhodně.",
    navod: [
      "Dejte mu prostor oponovat v určený čas a formu, ve které se to nosí: pravidelný rozhovor, kde smí říct cokoli. Co se nesmí ven, se stejně dostane ven, jen hůř.",
      "Vysvětlujte důvody, nedávejte rozkazy. Tenhle typ udělá i tvrdou věc, když jí rozumí, a nikdy neudělá věc, kterou vnímá jako mocenskou hru.",
      "Najděte skutečného vnějšího soupeře: úroveň, tabulku, čas, papírového favorita. Když vzdor nemá kam ven, obrátí se dovnitř týmu.",
      "Domluvte pár neporušitelných pravidel, kterých je málo, ale platí bez výjimky. Rebel unese málo pravidel dobře, hodně pravidel vůbec.",
      "Než něco zbouráš, řekni, čím to nahradíš. Bez náhrady je to jen škoda a příště tě už nikdo neposlechne.",
    ],
    priklady:
      "Sportovec, který se hádá o smysl cvičení a pak ho odmaká líp než ostatní; hráč, kterého nespravedlivá nominace nabudí, místo aby ho zlomila; ten, kdo si prosadil vlastní přípravu proti všem a měl pravdu.",
    sekundarniRole:
      "Jako druhý v pořadí dodává profilu ostří a odvahu: přidává primárnímu archetypu schopnost jít proti očekávání a nebát se nepohodlné pravdy.",
    role:
      "V týmu je to hlas, který řekne nahlas, co si ostatní myslí, a to je cenné i nepohodlné. Kapitánskou pásku mu dávejte jen tehdy, když už umí odlišit vzdor od vedení. V individuálním sportu potřebuje trenéra, který snese diskuzi a nebere ji jako útok na sebe. V obou případech ho nedávejte do prostředí s mnoha formálními pravidly.",
    sTrenerem:
      "Tření vzniká hned na začátku, na otázce, kdo tady velí. Trenér, který na to odpoví silou, dostane vzpouru; trenér, který couvne, ztratí respekt celé skupiny. Funguje třetí cesta: jasně dané mantinely, uvnitř nich velká volnost a otevřená debata o důvodech.",
    znacka:
      "Navenek je tenhle typ nejzajímavější ze všech: má názor, nemluví v klišé a lidi se kolem něj rozdělí. To je síla, ale i zbraň proti tobě. Miř na praktiky a systém, nikdy na konkrétní lidi, a nikdy nekomentuj v afektu bezprostředně po zápase. Provokace, za kterou stojí výkon, je značka; provokace bez výkonu je jen hluk.",
  },

  mag: {
    nazev: "Mág",
    puvodni: "Magician",
    prezdivka: "Vizionář",
    motto: "Hlava dokáže víc, než si lidi připouštějí.",
    touha: "proměnit sebe i svůj výkon v něco, co se zdálo nemožné",
    strach: "že to celé zůstane jen v představách",
    dar: "vize, představivost a práce s hlavou",
    podstata:
      "Ty ve sportu hledáš proměnu. Nejde ti jen o čas nebo skóre, ale o to, kam až se dá posunout hranice toho, co je možné, a co to udělá s tebou jako s člověkem. Umíš si výkon představit tak živě, že si ho tělo pamatuje, a tuhle schopnost používáš dřív, než se o ní ve tvém okolí začalo mluvit. Věříš, že hlava rozhoduje víc než tělo, a máš pravdu častěji, než si tvoje okolí připouští. Dokážeš vytvořit atmosféru, ve které se nemožné začne zdát dosažitelné, a to je vlastnost, kterou se skoro nedá naučit. Riziko je vzdálenost mezi vizí a dodávkou. Představa běží rychleji než příprava: v hlavě už jsi na mistrovství, ale odtrénované týdny za tím zaostávají. Druhé riziko je útěk k metodám, které slibují zkratku, protože zkratky přitahují právě tenhle typ. Nejlepší verze Mága má vedle sebe někoho, kdo počítá kilometry a hlídá čísla, aby vize měla o co se opřít.",
    vPodnikani:
      "V tréninku pracuješ hodně s hlavou: vizualizace, dýchání, mentální příprava ti sedí a mají na tvůj výkon větší vliv než na kohokoli jiného ve skupině. V soutěži umíš vytáhnout výkon, který jsi podle přípravy {neměl|neměla} mít, a stejně tak umíš propadnout, když ztratíš víru; tvoje rozpětí je větší než u ostatních. Sedí ti dlouhodobé projekty se smyslem a velký cíl na horizontu; naopak tě ničí bezcílná sezona, ve které jde jen o body.",
    stin:
      "Stínem je odtržení od reality. Pod tlakem začneš věřit vlastní vizi víc než číslům: příprava zaostává, ale ty cítíš, že to vyjde, a překvapení pak bolí dvakrát. Druhá podoba stínu je manipulace, protože kdo umí lidi nadchnout, umí je i používat; ve sportu se to projeví hlavně v tom, jak zacházíš s okolím, když jde o tvůj cíl. Třetí je hledání zkratek: metody, doplňky a guru, kteří slibují proměnu bez odmakaných hodin.",
    pasti:
      "Nejčastější chyba je vysmívat se práci s hlavou jako esoterice. U tohohle typu je to hlavní zdroj výkonu, ne doplněk. Druhá past je nechat vizi bez plánu, protože sen bez čísel se rozpadne uprostřed sezony. Třetí je pořád ho stahovat dolů; realismus je potřeba, ale kdo tomuhle typu vezme velký cíl, vezme mu palivo.",
    navod: [
      "Zapište velký cíl a rozložte ho na čísla: co musí být hotové za měsíc, za kvartál, za rok. Vize se nemá krotit, má se podepřít.",
      "Držte mentální přípravu v plánu jako trénink: pevný čas, pevná forma, měřený efekt. Co je jen když se to hodí, přestane fungovat.",
      "Postavte vedle sebe realistu: trenéra, fyzia nebo parťáka, který má právo říct, že příprava neodpovídá cíli.",
      "Ověřuj metody dřív, než jim uvěříš: kdo to zkoumal, na kom to fungovalo, co to má dokázat. Tvoje síla je otevřenost, tvoje slabina důvěřivost.",
      "Po každém startu porovnej představu a realitu: co sedělo, co ne. Tenhle rituál z vize dělá nástroj, ne přání.",
    ],
    priklady:
      "Sportovec, který si závod přehraje v hlavě dřív, než na něj vyjede; ten, kdo umí do skupiny přinést pocit, že to letos dokážou; hráč, který se po zranění vrátí líp, než byl, protože změnil hlavu.",
    sekundarniRole:
      "Jako druhý v pořadí dodává profilu smysl a představivost: zvedá primární archetyp z odmakaných hodin k velkému cíli a dává přípravě směr, který přesahuje jednu sezonu.",
    role:
      "V týmu je to člověk, který umí zvednout náladu a nastavit ambici, ale nesmí zůstat sám s provozem: potřebuje vedle sebe pořádkumilovný typ. V individuálním sportu je to sportovec, který ze sebe vytáhne maximum, když má velký příběh, a hasne v sezoně bez cíle. V obou případech mu dejte cíl, který je o kousek za hranicí rozumného.",
    sTrenerem:
      "Tření vzniká, když trenér mluví jen v číslech a sportovec jen ve vizích; oba mají pravdu a míjejí se. Druhé tření přichází, když trenér tlumí velký cíl jako nerealistický. Pomáhá překládat mezi světy: každý velký cíl dostane sloupec čísel a každé číslo dostane větu o tom, k čemu vede.",
    znacka:
      "Navenek je tenhle typ přitažlivý, protože mluví o proměně, ne o výsledcích, a tomu lidé rozumějí. Buduj to na doložených věcech: co se opravdu změnilo a jak dlouho to trvalo. Slib bez důkazu je u tohohle typu největší riziko, protože veřejnost šarlatána ve sportu odhalí rychle a natrvalo.",
  },

  "jeden-z-nas": {
    nazev: "Jeden z nás",
    puvodni: "Regular Guy / Regular Gal",
    prezdivka: "Dříč bez ega",
    motto: "Nejsem nic víc než ostatní.",
    touha: "patřit do party a být {přijímán|přijímána} {takový|taková}, {jaký|jaká} jsem",
    strach: "vyčnívat, povyšovat se a být za to {odstrčený|odstrčená}",
    dar: "spolehlivost, pokora a schopnost držet partu pohromadě",
    podstata:
      "Tvoje síla je v tom, že se nepovyšuješ. Odvedeš svoje, nepotřebuješ za to potlesk, a když někdo kolem tebe uspěje, přeješ mu to bez postranních myšlenek. Právě proto ti lidé věří: nehraješ hry, nemluvíš za zády, nedáváš nikomu najevo, že jsi lepší. V týmu jsi tmel, v tréninkové skupině ten, s kým chce každý trénovat, a v šatně člověk, který drží slovo. Sport bez lidí by tě nebavil, protože polovina toho, proč to děláš, jsou právě oni. Riziko je neviditelnost. Kdo nikdy nevyčnívá, toho snadno přehlédnou při nominaci, při rozdělování rolí i při vyjednávání o podmínkách. Skromnost se navíc umí proměnit ve výmluvu: neřeknu si o svoje, protože bych {vypadal|vypadala} namyšleně. A pak je tu strach z vlastního úspěchu, protože ten by z tebe udělal někoho, kdo už není jeden z nás. Nejlepší verze tohohle typu zůstane skromná v chování a přestane být skromná v nárocích.",
    vPodnikani:
      "V tréninku jsi {spolehlivý|spolehlivá}: přijdeš, odmakáš, nekomplikuješ. Nepotřebuješ zvláštní zacházení a špatně snášíš, když ho někdo dostává. V soutěži jsi stabilní a málokdy propadneš, ale taky málokdy vystoupíš z řady: role hvězdy ti není příjemná, i když na ni máš. Nejlíp fungujete v prostředí, kde jsou jasné role a kde se nedělá rozdíl mezi hvězdami a ostatními. Když se atmosféra změní na každý sám za sebe, ztrácíš půdu pod nohama rychleji než ostatní.",
    stin:
      "Stínem je rozpuštění. Ze strachu vyčnívat obrušuješ všechno, čím se lišíš: názor radši neřekneš, o roli si neřekneš, výkon zbytečně nevypíchneš. Postupně se z tebe stane {použitelný|použitelná} {sportovec|sportovkyně} bez tváře, kterého si nikdo nevybaví. Druhá podoba stínu je nedůvěra k vlastnímu úspěchu: když se ti daří, cítíš vinu vůči těm, kterým se nedaří, a podvědomě brzdíš. Třetí je pasivní loajalita k prostředí, které ti už dávno nesvědčí.",
    pasti:
      "Nejčastější chyba je považovat skromnost za nedostatek ctižádosti a nedat mu šanci. Druhá past je nakládat mu víc práce, protože nikdy neprotestuje. Třetí je vytáhnout ho do role hvězdy bez přípravy: tenhle typ potřebuje k vyčnívání čas a podporu, jinak se stáhne ještě hlouběji.",
    navod: [
      "Nauč se říkat si o svoje: jednou za sezonu si dej rozhovor o roli, podmínkách a cílech, na který se dopředu připravíš písemně.",
      "Zvedněte mu jednu věc, ve které smí být nejlepší, a mluvte o ní nahlas. Tenhle typ potřebuje dovolení vyniknout.",
      "Trénujte vedení v malém: vést rozcvičku, vzít si na starost mladšího. Odpovědnost v bezpečné dávce ho posouvá líp než pásky a tituly.",
      "Trenéři, kontrolujte zatížení: tenhle typ řekne, že je v pohodě, i když není. Ptejte se konkrétně, ne obecně.",
      "Rozděl si loajalitu a setrvačnost: ptej se jednou ročně, jestli tě prostředí ještě posouvá, nebo v něm zůstáváš jen proto, že tam patříš.",
    ],
    priklady:
      "Sportovec, kterého by si do party vybrali všichni; ten, kdo odehraje sezonu ve stínu a nikdy si nestěžuje; hráč, který po vítězství mluví jen o týmu.",
    sekundarniRole:
      "Jako druhý v pořadí dodává profilu pokoru a spolehlivost: stahuje primární archetyp z výšin mezi lidi a hlídá, aby ambice nešla přes vztahy v týmu.",
    role:
      "V týmu je to nenahraditelný tmel a často nejlepší vicekapitán: má důvěru všech a nikoho neohrožuje. V individuálním sportu je to sportovec, který potřebuje tréninkovou skupinu a v izolaci vadne. V obou případech mu dejte jasnou roli a řekněte nahlas, že je důležitá; sám si o to neřekne.",
    sTrenerem:
      "Tření skoro nevzniká, a právě to je nebezpečné: tenhle typ konflikt neotevře, jen postupně ztrácí chuť. Trenér se problém dozví pozdě, obvykle až s oznámením o odchodu. Pomáhá pravidelný krátký rozhovor beze spouštěče, kde je otázka položená přímo a je čas na odpověď.",
    znacka:
      "Navenek je tenhle typ nejsympatičtější ze všech, protože působí jako člověk od vedle, a to je ve světě naleštěných profilů vzácnost. Nesnaž se to měnit na nafoukanou pózu. Mluv obyčejně, ukazuj práci a lidi kolem sebe. Jediné, co doplň, je odvaha přiznat vlastní ambici: skromnost není totéž co bezcílnost.",
  },

  milenec: {
    nazev: "Milenec",
    puvodni: "Lover",
    prezdivka: "Estét pohybu",
    motto: "Chci, aby to bylo i krásné.",
    touha: "prožít sport naplno, tělem i vztahy",
    strach: "chlad, odmítnutí a lhostejnost lidí, na kterých mi záleží",
    dar: "vášeň, cit pro pohyb a schopnost budovat blízké vztahy",
    podstata:
      "Ty sport prožíváš. Nejde ti jen o čísla, ale o to, jak se to dělá: čistě provedený pohyb ti dělá radost sám o sobě a odbytý výkon tě ruší, i když stačil na vítězství. Máš cit pro techniku, estetiku a atmosféru, které se nedají naučit z tabulky. Stejně silně prožíváš i vztahy: trenér pro tebe není funkce, ale člověk, a když je vztah v pořádku, dokážeš věci, které by sis {sám|sama} {netipoval|netipovala}. Právě to je i tvoje zranitelnost. Chlad, ironie nebo lhostejnost ze strany trenéra tě srazí víc než tvrdá kritika, protože ji čteš jako odmítnutí sebe, ne výkonu. Prostředí, ve kterém se cítíš nechtěně, ti bere výkon rychleji než únava. A protože chceš, aby tě lidé měli rádi, umíš dlouho mlčet o věcech, které by se měly říct nahlas. Nejlepší verze tohohle typu si vášeň udrží a přidá k ní hranice: dokáže mít lidi {rád|ráda} a přitom říct ne.",
    vPodnikani:
      "V tréninku tě žene požitek z dobře provedené věci: opakuješ techniku, dokud nesedí, a dáváš pozor na detaily, které jiní přehlížejí. Prostředí na tebe působí víc než na ostatní: hala, hudba, lidé, dokonce i vybavení. V soutěži jsi {silný|silná} tehdy, když se cítíš dobře a máš kolem sebe vztahy v pořádku; v napjaté atmosféře nebo po konfliktu jde výkon dolů dřív než u ostatních. Tvoje forma je citlivá na kontext a to není rozmar, to je způsob, jakým fungujete.",
    stin:
      "Stínem je ztráta sebe v touze být {přijímaný|přijímaná}. Pod tlakem se přizpůsobuješ tomu, co od tebe okolí čeká, snášíš zacházení, které bys {neměl|neměla}, a nepříjemné věci neřekneš, aby se vztah nepokazil. Druhá podoba stínu je závislost na přízni jednoho člověka, obvykle trenéra: když ochladne, ztrácíš půdu pod nohama. Třetí je forma nad obsahem, tedy soustředění na to, jak výkon vypadá, na úkor toho, jestli funguje.",
    pasti:
      "Nejčastější chyba je vést tenhle typ chladem a odstupem, protože prý změkčuje. Výsledkem není tvrdost, ale ztráta výkonu. Druhá past je ironie a shazování v šatně, které tenhle typ nese dlouho a tiše. Třetí je podceňovat prostředí; investice do atmosféry se tu vrací na výsledcích víc než u kohokoli jiného.",
    navod: [
      "Trenéři, oddělujte kritiku výkonu od vztahu: řekněte nahlas, že jde o věc, ne o člověka. U tohohle typu to musí zaznít, jinak si to přeloží jako odmítnutí.",
      "Nauč se říkat ne bez pocitu viny: napiš si dopředu, co pro tebe není v pořádku, a jednu takovou větu vyzkoušej v běžné situaci.",
      "Zabudujte do přípravy prostředí, které funguje: místo, lidi, rituál před startem. Není to rozmazlování, je to součást výkonu.",
      "Hlídej si závislost na jednom vztahu: měj kolem sebe víc lidí, kterým věříš, aby jeden chladný týden nesrazil celou sezonu.",
      "Jednou za měsíc si dej upřímný rozhovor o tom, co jsi {zamlčel|zamlčela}, aby byl klid. To, co se neřekne, se u tohohle typu ukládá.",
    ],
    priklady:
      "Sportovec, který opakuje techniku, dokud není hezká; ten, komu vadí odbytý výkon i po vítězství; hráč, který okamžitě pozná, že s trenérem něco není v pořádku.",
    sekundarniRole:
      "Jako druhý v pořadí dodává profilu cit a kvalitu provedení: přidává primárnímu archetypu smysl pro detail a schopnost budovat vztahy, na kterých se dá stavět v krizi.",
    role:
      "V týmu je to člověk, který drží atmosféru a vycítí, komu není dobře, dřív než to řekne nahlas. V individuálním sportu je to sportovec, jehož výkon stojí a padá s kvalitou vztahu s trenérem a s prostředím. V obou případech nepatří do skupiny, kde je normou tvrdý sarkasmus.",
    sTrenerem:
      "Tření vzniká na tónu, ne na obsahu. Věcná kritika řečená chladně dopadne jako odsudek; tatáž věta s vysvětlením a klidem funguje výborně. Druhé tření vzniká z toho, že tenhle sportovec problém dlouho neřekne a pak přijde s nahromaděnou křivdou. Pomáhá krátký pravidelný rozhovor, kde je prostor říct i drobnost.",
    znacka:
      "Navenek je tenhle typ přitažlivý přirozeně: má styl, prožitek a lidský rozměr, který se dobře vypráví. Buduj to na kvalitě a estetice, ne na kontroverzi. Pozor jen na to, aby ses {nezačal|nezačala} točit kolem obrazu sebe; pod krásnou formou musí zůstat vidět práce.",
  },

  sprymar: {
    nazev: "Šprýmař",
    puvodni: "Jester",
    prezdivka: "Bavič šatny",
    motto: "Když je to jen dřina, dělám to špatně.",
    touha: "užít si to tady a teď a bavit lidi kolem sebe",
    strach: "nuda, těžká atmosféra a bezvýznamnost",
    dar: "lehkost, nadhled a schopnost srazit napětí",
    podstata:
      "Tvoje zbraň je lehkost. Tam, kde jiní ztuhnou, ty vtipem shodíš napětí, a je to jedna z nejcennějších schopností ve sportu vůbec: rozhoduje se totiž v hlavách, které jsou buď volné, nebo svázané. Umíš přijít do šatny před nejtěžším zápasem a vrátit lidem dech. {Sám|Sama} se často nejlíp cítíš tehdy, když nejde o život, a paradoxně tehdy podáváš nejlepší výkony, protože ti tělo pracuje uvolněně. Riziko má dvě podoby. První je útěk: vtipem uhýbáš před rozhovory, které bolí, před rozborem prohry, před vlastním strachem. Druhá je pověst; okolí si tě zaškatulkuje jako toho vtipného a přestane s tebou počítat, když jde o vážnou věc. Nejlepší verze tohohle typu je pod lehkostí smrtelně vážný profesionál: v přípravě nekompromisní, v šatně vysvobozující. Právě ta kombinace dělá z baviče lídra.",
    vPodnikani:
      "V tréninku jsi motor nálady: odlehčuješ, přinášíš energii a lidé chodí radši. Monotónní dlouhé bloky bez lidí kolem tě ničí. V soutěži funguješ nejlíp v uvolnění: rituál, hudba, hláška, cokoli, co sundá tíhu. Tvoje slabina jsou momenty, kdy se má jít do vážného soustředění a udržet ho dlouho, protože přirozeně tíhneš k rozptýlení, když napětí roste.",
    stin:
      "Stínem je útěk před vážností. Pod tlakem obrátíš v žert i to, co žert není: špatný výsledek, vlastní únavu, konflikt v týmu. Rozbor se odloží další historkou a problém zůstane. Druhá podoba stínu je humor jako zbraň, tedy ironie, která zraňuje, a shazování, které si okolí nedovolí vrátit. Třetí je závislost na publiku: bez reakce ostatních ztrácíš energii a bereš ticho jako odmítnutí.",
    pasti:
      "Nejčastější chyba je humor zakázat. Tenhle typ pak ztratí svůj hlavní nástroj a jeho výkon spadne. Druhá past je opačná: nechat mu procházet vtipkování i ve chvílích, kdy tým potřebuje vážnost. Třetí je nesvěřit mu odpovědnost jen proto, že působí lehkovážně; často je pod tím ten nejvnímavější člověk ve skupině.",
    navod: [
      "Domluvte se, kdy se nežertuje: rozbor, poslední minuty před startem, bezpečnost, zdraví. Málo pravidel, ale bez výjimky.",
      "Dej vážným rozhovorům pevný čas a formu, ať se před nimi nedá utéct. Domluvte se se svým koučem na signálu, kterým vás oba zastaví ve chvíli, kdy vtipem uhýbáš.",
      "Trénujte dlouhé soustředění cíleně: bloky, kde je úkolem udržet pozornost bez rozptýlení, se stejnou vážností jako fyzická příprava.",
      "Používej humor směrem k sobě a k situaci, nikdy na účet spoluhráče, který nemá jak vrátit. Tenhle rozdíl rozhoduje, jestli jsi lídr, nebo problém.",
      "Ukaž jednou za čas vážnou tvář veřejně: rozbor, názor, poděkování bez pointy. Jinak tě okolí nebude brát vážně ani ve chvíli, kdy budeš chtít.",
    ],
    priklady:
      "Sportovec, který v šatně před finále rozesměje celý tým; ten, kdo se po prohře nejdřív zasměje a teprve za tři dny řekne, jak ho to sebralo; hráč, kterého by nikdo netipoval na dřinu, ale odmaká všechno.",
    sekundarniRole:
      "Jako druhý v pořadí dodává profilu odlehčení a nadhled: brání tomu, aby se z primárního archetypu stala zaťatá vážnost, a otevírá dveře tam, kde by samotný tlak narazil.",
    role:
      "V týmu je to nepostradatelný ventil, který drží atmosféru v dlouhé sezoně; do role, kde se má tvrdě vyžadovat disciplína, se nehodí. V individuálním sportu potřebuje kolem sebe lidi, protože v izolaci ztrácí energii. V obou případech mu dejte prostor bavit, ale jasně vymezte chvíle, kdy se to nenosí.",
    sTrenerem:
      "Tření vzniká, když trenér čte humor jako neúctu nebo jako nezájem. Ve skutečnosti je to způsob, jak si tenhle typ sundává tlak. Druhé tření je vážné: trenér nikdy nezjistí, co sportovce doopravdy trápí, protože všechno skončí vtipem. Pomáhá dohodnutý formát rozhovoru, kde se nežertuje, a trpělivost počkat si na odpověď.",
    znacka:
      "Navenek je tenhle typ zlato: sítě, rozhovory, kamera, všude funguje a lidé si ho pamatují. Pozor na dvě věci. Vtip musí nést tvoje jméno a tvůj sport, jinak baví trh a tobě nezůstane nic. A nikdy nekomentuj v afektu; co je vtipné v šatně, bývá venku katastrofa.",
  },

  pecovatel: {
    nazev: "Pečovatel",
    puvodni: "Caregiver",
    prezdivka: "Opora týmu",
    motto: "Nenechám tě v tom.",
    touha: "chránit lidi kolem sebe a být oporou",
    strach: "že někoho zklamu a nechám ho v tom {samotného|samotnou}",
    dar: "obětavost, vnímavost a spolehlivost, na kterou se dá vsadit",
    podstata:
      "Ty sport neděláš jen za sebe. Vždycky je v tom někdo další: parťáci, rodina, mladší, kteří se dívají. Vidíš, komu není dobře, dřív než to řekne, a nedokážeš jít dál, když někdo vedle tebe padá. Díky tomu jsi člověk, na kterého se všichni spolehnou, a v každé skupině jsi {ten|ta}, kdo drží ostatní pohromadě, když se nedaří. Tvoje motivace je pevná, protože nestojí jen na tobě: dřeš i ve dnech, kdy by sis {sám|sama} {dovolil|dovolila} polevit, protože bys {nechtěl|nechtěla} zklamat. Riziko je sebeobětování. Dáváš i to, co nemáš: energii, čas, pozornost, klid, a svoje potřeby odsouváš tak dlouho, až se ozvou přes tělo. Ve sportu se to projeví přesně tam, kde by nemělo: nepřiznaná únava, přecházené zranění, výkon, který jde dolů, protože se staráš o všechny kromě sebe. Nejlepší verze tohohle typu se naučí, že sytit ostatní jde jen z plné nádrže, a bere odpočinek jako povinnost vůči nim.",
    vPodnikani:
      "V tréninku jsi {obětavý|obětavá} a {spolehlivý|spolehlivá}: přijdeš dřív, pomůžeš, počkáš. Jsi ten, kdo podrží nováčka i toho, kdo zrovna prohrává. V soutěži tě zvedá vědomí, že to děláš i pro někoho dalšího; naopak tě sráží, když cítíš, že jsi někoho {zklamal|zklamala}. Snášíš velkou zátěž, ale špatně poznáš, kdy je jí moc, protože svoje potřeby zpracováváš až jako poslední.",
    stin:
      "Stínem je mučednictví. Dáváš, dokud nedojdeš, a pak potichu počítáš, kdo ti to nevrátil. Z péče se stane tichý nárok na vděčnost, a když nepřijde, přichází hořkost. Druhá podoba stínu je péče jako kontrola: rozhoduješ za ostatní, protože přece víš, co potřebují. Třetí je vlastní zdraví na posledním místě: únava a bolest se nehlásí, protože by to znamenalo být přítěží.",
    pasti:
      "Nejčastější chyba je zneužít spolehlivost: naložit tomuhle typu víc, protože nikdy neřekne ne. Druhá past je brát jeho péči jako samozřejmost a nikdy ji nepojmenovat nahlas. Třetí je nechat ho v roli, kde se stará o všechny a nikdo se nestará o něj; přesně tak vyhoří nejlepší lidé v týmu.",
    navod: [
      "Trenéři, ptejte se konkrétně na zatížení a bolest. Na obecné jak se máš odpoví tenhle typ vždycky dobře, i když dobře není.",
      "Naplánuj si vlastní regeneraci jako závazek vůči ostatním: bez nabité nádrže není z čeho dávat, a tuhle větu si zopakuj, kdykoli ji budeš chtít vynechat.",
      "Nauč se rozlišit pomoc a přebírání odpovědnosti: co je moje věc, co je jeho a co si má vyřešit sám. Napiš si to, když v tom není jasno.",
      "Pojmenujte jeho roli nahlas před ostatními. Tenhle typ si o uznání neřekne, ale bez něj pomalu vyhasíná.",
      "Jednou za čas si dovol být tím, kdo přijímá: nech si pomoct a poděkuj. Je to pro tenhle typ těžší než cokoli jiného a nejvíc léčivé.",
    ],
    priklady:
      "Sportovec, který zůstane po tréninku s tím, komu to nejde; ten, kdo si nikdy nestěžuje na vlastní bolest, ale hlídá cizí; hráč, který drží tým pohromadě v nejhorší sérii sezony.",
    sekundarniRole:
      "Jako druhý v pořadí dodává profilu spolehlivost a lidské teplo: přidává primárnímu archetypu ohled na ostatní a schopnost udržet vztahy i po konfliktu.",
    role:
      "V týmu je to nejcennější člověk pro soudržnost, ideální parťák pro mladé a přirozený kandidát na roli, která spojuje. V individuálním sportu potřebuje mít pro koho, jinak mu motivace splaskne. V obou případech mu hlídejte hranice, protože {sám|sama} si je nenastaví.",
    sTrenerem:
      "Tření vzniká málokdy a to je právě riziko: tenhle typ nese i to, co nést nemá, a trenér se nic nedozví. Druhé tření vzniká, když trenér tvrdě naloží někomu v týmu; pečovatel to prožívá, jako by šlo o něj, a může se postavit proti trenérovi ne kvůli sobě, ale kvůli druhým.",
    znacka:
      "Navenek je tenhle typ nejdůvěryhodnější tvář, jakou sport má: dobrovolnictví, práce s mládeží, podpora těch, kdo to nemají snadné. Buduj to na skutečných věcech, kterým se stejně věnuješ. Pozor jen na to, abys {nedával|nedávala} i tam, kde už to bere výkon; obětavost, která tě položí, nikomu nepomůže.",
  },

  tvurce: {
    nazev: "Tvůrce",
    puvodni: "Creator",
    prezdivka: "Technik",
    motto: "Chci to mít provedené dokonale.",
    touha: "vypilovat výkon do podoby, která nese můj rukopis",
    strach: "odbytost a průměrné provedení",
    dar: "technická preciznost, představivost a vlastní styl",
    podstata:
      "Ty nechceš jen vyhrát, ty to chceš mít správně provedené. Poznáš detail, který nikdo jiný nevidí, a nekvalitní pohyb tě fyzicky ruší, i když funguje. Tvoje výhoda je v tom, že tvoje technika drží i pod tlakem a v únavě, protože je postavená pořádně a ne narychlo. Máš vlastní styl, který se pozná, a přesně to bývá důvod, proč se ti daří tam, kde kopie druhých selhávají. Riziko je laťka. Tatáž náročnost, která ti postavila techniku, tě umí zastavit: odkládáš start, protože to ještě není ono, předěláváš věci, které už fungují, a v soutěži myslíš na provedení místo na výsledek. Sport ovšem neplatí za dokonalost v tréninku, platí za výkon v den D. Nejlepší verze tohohle typu má dvě laťky: mistrovskou pro přípravu a použitelnou pro závod, a umí mezi nimi přepnout.",
    vPodnikani:
      "V tréninku jsi {pečlivý|pečlivá} a {vytrvalý|vytrvalá}: opakuješ, pilníš, hledáš lepší provedení, a v technických blocích jsi nejlepší ve skupině. V soutěži jsi {silný|silná} tam, kde rozhoduje kvalita provedení, a {zranitelný|zranitelná} tam, kde jde o improvizaci a chaos. Nejhůř snášíš situace, kdy se má jít do závodu s tím, co je, protože na doladění nebyl čas. Připravená sezona ti sedí, uspěchaná tě rozhodí.",
    stin:
      "Stínem je perfekcionismus, který dusí. Pod tlakem přestaneš pouštět věci ven: nejsi {spokojený|spokojená}, tak to zkusíš znovu, a start se odkládá. Druhá podoba stínu je posedlost detailem v nesprávnou chvíli: v soutěži myslíš na techniku místo na soupeře. Třetí je osobní zranitelnost při kritice provedení, protože ho vnímáš jako součást sebe, ne jako věc, která se dá opravit.",
    pasti:
      "Nejčastější chyba je tenhle typ honit do kvantity a odbýt kvalitu; ztratí smysl a jeho hlavní přednost. Druhá past je opačná: nechat ho pilovat donekonečna a nikdy netlačit na start. Třetí je kritizovat provedení posměškem, což u tohohle typu nezraní ego, ale identitu.",
    navod: [
      "Zaveďte dvě laťky: mistrovskou pro trénink a použitelnou pro soutěž. Předem si řekněte, co je která, ať dokonalost neblokuje start.",
      "Dejte termínům stejnou váhu jako kvalitě: datum startu je součást přípravy, ne až výsledek toho, že to konečně sedí.",
      "V soutěži přepni z provedení na úkol: jedna jednoduchá věc, na kterou myslíš. Techniku máš odmakanou, v závodě už se nedoučí.",
      "Kritiku provedení oddělte od člověka: mluvte o pohybu, ne o sportovci. U tohohle typu to není zdvořilost, ale podmínka, aby to slyšel.",
      "Zapisuj si, co už je hotové a funguje. Tenhle typ vidí jen to nedodělané a bez záznamu ztrácí pocit, že se posouvá.",
    ],
    priklady:
      "Sportovec, který si po tréninku sám dopiluje jeden detail; ten, kdo pozná chybu v technice na videu za vteřinu; hráč, jehož styl poznáte i z dálky.",
    sekundarniRole:
      "Jako druhý v pořadí dodává profilu kvalitu provedení a vlastní rukopis: přidává primárnímu archetypu preciznost, díky které výkon drží i pod tlakem.",
    role:
      "V týmu je to specialista na provedení a přirozený vzor pro mladší, ale nehodí se do role, kde se má hlavně improvizovat a strhávat. V individuálním sportu je to typ, který si techniku odmakává sám a potřebuje trenéra jako oko zvenku. V obou případech mu dejte oblast, ve které smí být nejlepší.",
    sTrenerem:
      "Tření vzniká na tempu: trenér chce jít dál, sportovec chce doladit. Druhé tření vzniká, když se trenér technice dostatečně nevěnuje; tenhle typ pak ztrácí důvěru, protože v tom vidí lajdáctví. Pomáhá dohodnout, kdy končí pilování a začíná používání.",
    znacka:
      "Navenek máš k dispozici nejlepší materiál ze všech typů: vlastní styl a příběh vzniku. Ukazuj práci a detaily, které nikdo nevidí. Pozor jen na to, aby výsledná prezentace nebyla stejně odkládaná jako výkon; hotové a zveřejněné poráží dokonalé a schované.",
  },

  vladce: {
    nazev: "Vládce",
    puvodni: "Ruler",
    prezdivka: "Kapitán",
    motto: "Já to vezmu.",
    touha: "držet věci pod kontrolou a nést odpovědnost za celek",
    strach: "chaos a ztráta pozice",
    dar: "vůdcovství, řád a schopnost nést tlak za ostatní",
    podstata:
      "Ty přebíráš vedení, i když tě o to nikdo nepožádá. Když chybí řád, uděláš ho: rozdělíš role, nastavíš pravidla, zařídíš, co je potřeba. Máš vlastní systém přípravy, který drží, i když se na tebe nikdo nedívá, a odpovědnost tě netíží, spíš tě uklidňuje, protože pak víš, že je to na tobě. Právě proto ti ostatní věří: působíš jako pevný bod, o který se dá opřít, když je zle. Riziko je kontrola. Neumíš pustit z ruky ani to, co by jiní zvládli dost dobře, takže na sebe nabalíš víc, než se dá unést, a pak se divíš, že jsi {unavený|unavená} z věcí, které nejsou tvoje práce. Chaos snášíš špatně a improvizaci vnímáš jako ohrožení, i když je nutná. A protože si nemůžeš dovolit vypadat slabě, o problémech nemluvíš, dokud nejsou neřešitelné. Nejlepší verze tohohle typu buduje řád, který funguje i bez ní, a měří svoje vedení tím, jak si okolí poradí, když u toho zrovna není.",
    vPodnikani:
      "V tréninku jsi {samostatný|samostatná} a {zodpovědný|zodpovědná}: plán dodržíš, i když nikdo nekontroluje, a od ostatních čekáš totéž. V soutěži jsi {klidný|klidná} tam, kde je jasná struktura, a nejsilnější v roli, kde na tobě něco visí. Špatně snášíš zmatek v organizaci, změny na poslední chvíli a lidi, kteří nedodrží dohodu; to tě rozhodí víc než samotný soupeř. Dlouhodobě rosteš stabilně, protože stavíš systém, ne nadšení.",
    stin:
      "Stínem je tyranie a přetížení. Pod tlakem utahuješ kontrolu: chceš vidět do všeho, rozhoduješ za ostatní, a okolí se naučí mlčet, protože nesouhlas stojí energii. Druhá podoba stínu je zákaz slabosti u sebe: raději dotáhneš sezonu na doraz, než abys {přiznal|přiznala}, že to nejde. Třetí je tvrdost k těm, kdo fungují jinak než ty; ne každý potřebuje tvůj řád, aby podal výkon.",
    pasti:
      "Nejčastější chyba je vzít tomuhle typu odpovědnost a nedat mu žádnou roli; hned ztratí motivaci. Druhá past je naopak nechat na něm všechno, včetně věcí, které patří trenérovi nebo klubu. Třetí je zpochybňovat jeho autoritu před ostatními; věcná výhrada mezi čtyřma očima projde, veřejné podkopnutí ne.",
    navod: [
      "Vyjmenujte, co je jeho odpovědnost a co ne. Bez hranice si tenhle typ vezme i to, co mu nepatří, a pak z toho vyhoří.",
      "Deleguj po kouskách: vyber jednu věc za měsíc, kterou pustíš z ruky někomu jinému, a nekontroluj ji. Tréninkem se to učí líp než rozhodnutím.",
      "Domluvte si formát, kde smí přiznat slabost bez ztráty tváře: pravidelný rozhovor s trenérem jen mezi čtyřma očima.",
      "Trénujte chaos schválně: cvičení se změnou pravidel na poslední chvíli. Tenhle typ se potřebuje naučit, že improvizace není selhání řádu.",
      "Ptej se, jak si tým poradil, když jsi {chyběl|chyběla}. Dobré vedení se pozná podle toho, co funguje bez tebe, ne podle toho, co drží jen díky tobě.",
    ],
    priklady:
      "Sportovec, který si sám řídí přípravu a nepotřebuje dohled; ten, kdo v krizi převezme slovo v šatně; hráč, kterého trenér posílá vysvětlovat věci mladším.",
    sekundarniRole:
      "Jako druhý v pořadí dodává profilu řád a odpovědnost: přidává primárnímu archetypu systém, spolehlivost a schopnost unést tlak za ostatní.",
    role:
      "V týmu je to přirozený kapitán a nejlepší spojka mezi trenérem a kabinou. V individuálním sportu je to sportovec, který si vede přípravu do detailu sám a bere ji jako svůj projekt. V obou případech potřebuje jasně vymezenou oblast, kde velí, jinak si vezme i tu, kde velet nemá.",
    sTrenerem:
      "Tření vzniká o kompetence: kdo rozhoduje o čem. Trenér to čte jako podrývání autority, sportovec jako přebírání odpovědnosti. Druhé tření přichází, když trenér mění věci narychlo bez vysvětlení. Pomáhá napsat si role a rozhodovací hranice na začátku sezony, ne až v konfliktu.",
    znacka:
      "Navenek působíš přirozeně jako lídr, což je nejcennější pozice pro roli kapitána, mentora nebo tváře klubu. Komunikuj klidně a věcně, bez velkých gest; autorita se nekřičí, konstatuje se. Pozor na povýšenost: co je pro tebe jasný řád, může znít zvenku jako poučování.",
  },
}
