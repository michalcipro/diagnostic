import type { ArchetypId, ArchetypObsah } from "../types"

// Texty vyhodnocení archetypů značky.
//
// Vychází z Mark & Pearson: The Hero and the Outlaw (rozbor je
// v docs/archetypy-analyza.md). Psáno klientovi přímo, tykáním. Touha,
// strach a dar drží definice z knihy; podstata, podnikání, stín a návod
// jsou rozepsané pro majitele a lídry menších a středních firem, protože
// tam je archetyp lídra nejsilnějším vstupem archetypu značky.
//
// Rodové tvary jsou označené {mužský|ženský} a rozvine je applyGender().

export const OBSAH_ARCHETYPU: Record<ArchetypId, ArchetypObsah> = {
  nevinatko: {
    nazev: "Neviňátko",
    puvodni: "Innocent",
    motto: "Děláme věci správně a jednoduše.",
    touha: "zažít svět, který je dobrý a jednoduchý",
    strach: "udělat něco špatně a zasloužit si tím trest",
    dar: "důvěra, optimismus a čistota",
    podstata:
      "Tvoje síla je v tom, čemu věříš: že věci jdou dělat poctivě, jednoduše a s dobrým úmyslem, a že se to nakonec vyplatí. Nepotřebuješ triky, protože nemáš co skrývat. Lidé z tebe cítí klid a bezpečí, kterému se dnes skoro nedá věřit, a právě proto po něm touží. Neviňátko není naivita v pejorativním smyslu; je to vědomé rozhodnutí nehrát špinavou hru, i když se hraje všude kolem. Ve světě přesyceném klamavou reklamou a hvězdičkami pod čarou je značka, která myslí svůj slib doslova, osvěžení a úleva. Tvoje komunikace funguje, když je průzračná: krátké věty, jasné ceny, žádné chytáky. Zákazník od tebe nechce být ohromen, chce si oddechnout, že tady se nemusí mít na pozoru. To je vzácné zboží a dá se na něm stavět celá značka.",
    vPodnikani:
      "Ve firmě jsi {ten|ta}, kdo drží laťku slušnosti: férové smlouvy, sliby, které platí, ceny bez překvapení. Tvoje značka má působit jako čistý stůl, od produktu po reklamaci. Nejlíp ti sedí obory, kde zákazník potřebuje důvěru a jednoduchost: potraviny a věci denní potřeby, rodinné služby, cokoli, kde ostatní přehánějí a slibují nemožné. Tvůj marketing nemusí křičet; stačí, když je pravdivý a konzistentní, protože tvoje nejsilnější reklama je zkušenost, že to u tebe bylo přesně tak, jak jsi {řekl|řekla}.",
    stin:
      "Stínem Neviňátka je popírání. Pod tlakem máš sklon nevidět problémy, které nejdou s tvým obrazem světa dohromady: špatná čísla, nespolehlivého dodavatele, konflikt v týmu. Odkládáš nepříjemné rozhovory a doufáš, že se to spraví samo. Druhá podoba stínu je křehkost: když ti někdo křivdí nebo zpochybní tvůj dobrý úmysl, zasáhne tě to hlouběji, než je zdrávo, a místo věcné obrany se stáhneš.",
    pasti:
      "Největší pastí je sladkost bez obsahu: když značka slibuje ráj a dodá průměr, působí falešně hůř než cynická konkurence. Druhá past je nuda, protože čistota bez špetky osobnosti splyne s pozadím. A pozor na moralizování; Neviňátko, které poučuje ostatní o správnosti, ztrácí sympatie okamžitě.",
    navod: [
      "Zjednodušuj všechno, na co zákazník sáhne: nabídku, ceník, smlouvu, reklamaci. Každou položku, která potřebuje vysvětlivku, přepiš nebo zruš.",
      "Slibuj o stupeň míň, než dodáš. Tvoje značka stojí na tom, že slib platí doslova; jedna hvězdička pod čarou ti zboří víc než deset kampaní postaví.",
      "Mluv jazykem bez příkras: krátké věty, konkrétní čísla, žádné superlativy. Fotky a design volte světlé, čisté, bez efektů.",
      "Zaveď si měsíční rituál nepříjemné pravdy: jedno číslo nebo problém, který se ti nechce vidět, projdi s někým, kdo tě nešetří.",
      "Odlišuj se ctností, kterou konkurence nemá: například zveřejni, co jiní schovávají (složení, marže, původ), a udělej z toho svůj poznávací znak.",
    ],
    priklady: "Dove, Ivory, kojenecká a rodinná řada značek, poctivé lokální potraviny",
    sekundarniRole:
      "Jako druhý v pořadí dodává značce čistotu a důvěryhodnost: změkčuje tvrdší primární archetyp a hlídá, aby růst nešel přes čáru slušnosti.",
  },

  objevitel: {
    nazev: "Objevitel",
    puvodni: "Explorer",
    motto: "Nezůstávej v ohradě.",
    touha: "svoboda hledat {sám|sama} sebe objevováním světa",
    strach: "past, konformita a vnitřní prázdnota",
    dar: "autonomie, odvaha jít vlastní cestou a čich na nové",
    podstata:
      "Tvůj motor je svoboda. Nesneseš ohradu, ať má podobu korporátní kariéry, zajetého oboru nebo vlastního úspěšného, ale nudného produktu. První chodíš tam, kam se ostatní teprve chystají, a nejlépe ti je na začátku cesty, když je všechno otevřené. Zákazníkům nenabízíš věc, ale výpravu: pocit, že s tebou zažijí něco, co doma nedostanou, a že se přitom nemusejí vzdát sami sebe. Objevitel je archetyp autenticity; jeho značky nosí lidé, kteří chtějí říct, že nejsou jako ostatní. Tvoje riziko je stejné jako tvoje síla: tam, kde jiní vydrží u rozdělané věci roky, ty cítíš nutkání jít dál, a tak za sebou necháváš rozběhnuté projekty, které nikdo nedotáhl. Tvoje podnikání poroste tehdy, když si najdeš parťáky, kteří dotahují, a sobě necháš průzkum nových území.",
    vPodnikani:
      "Ve firmě jsi {průzkumník|průzkumnice} trhu: první testuješ nové kanály, produkty i země, a nejsilnější jsi ve fázi, kdy nikdo neví, kudy vede cesta. Tvoje značka má vyprávět o cestě, ne o cíli: skutečné příběhy z terénu, nedokonalé fotky, poctivé deníky z vývoje fungují líp než vyleštěná kampaň. Sedí ti obory spojené s pohybem, přírodou, cestováním a nezávislostí, ale i každý produkt, který zákazníkovi slibuje únik z každodennosti. Dej pozor, aby za tvým objevováním zůstávala sjízdná cesta pro ostatní: procesy, které fungují i bez tebe.",
    stin:
      "Stínem Objevitele je bloudění. Když svoboda přestane mít směr, mění se v neschopnost se rozhodnout a usadit: nový projekt je vždycky lákavější než dokončení starého, nový trh zajímavější než péče o ten, který tě živí. Pod tlakem máš sklon utéct doslova, tedy odjet, změnit téma, začít jinde. Druhá podoba stínu je osamělost: kdo pořád odchází, nemá kde zapustit kořeny, a to platí pro vztahy se zákazníky i s lidmi v týmu.",
    pasti:
      "Past číslo jedna je značka bez kontinuity: každý rok jiný obal, jiný tón, jiný produkt, takže si tě trh nestihne zapamatovat. Druhá past je romantika bez užitku, protože zákazník chce zážitek, ale produkt musí fungovat. Třetí je pohrdání obyčejnými zákazníky, kteří žádné dobrodružství nechtějí.",
    navod: [
      "Odděl průzkum od provozu: nové nápady dostanou vyhrazený čas a rozpočet (třeba pětinu), zbytek jede v režimu, který dotahuje někdo jiný než ty.",
      "Postav značku na příběhu cesty: ukazuj zákulisí, testy, omyly a objevy. Autenticita je tvoje měna, vyleštěnost ti nesluší.",
      "Dej zákazníkovi roli spoluobjevitele: předprodeje, beta verze, expedice, limitky. Kdo objevil značku dřív než ostatní, je tvůj nejvěrnější vyslanec.",
      "Každý nový projekt musí projít otázkou: kdo ho povede, až mě přestane bavit? Bez jména a plánu předání ho nezačínej.",
      "Jednou za kvartál se vrať k zákazníkům, které už máš. Objevitelé zapomínají, že věrní zákazníci jsou taky území, o které se musí pečovat.",
    ],
    priklady: "The North Face, Jeep, Starbucks v raných letech, GoPro",
    sekundarniRole:
      "Jako druhý v pořadí dodává značce neklid a čerstvý vítr: hlídá, aby primární archetyp nezkostnatěl, a přináší nové trhy a formáty dřív než konkurence.",
  },

  mudrc: {
    nazev: "Mudrc",
    puvodni: "Sage",
    motto: "Pravda osvobozuje.",
    touha: "objevit pravdu a porozumět světu",
    strach: "být oklamán a jednat z nevědomosti",
    dar: "moudrost, nadhled a schopnost vidět souvislosti",
    podstata:
      "Tvoje autorita stojí na poznání. Nepřesvědčuješ hlasitostí, ale tím, že věci chápeš hlouběji než ostatní a umíš je vysvětlit. Než se rozhodneš, chceš data; než něco doporučíš, chceš to mít ověřené, a právě proto má tvoje slovo váhu. Zákazníci k tobě nechodí nakupovat, chodí se radit, a to je pozice, kterou žádná sleva konkurence nepřebije. Mudrc buduje značku pomalu: článek po článku, přednáška po přednášce, spokojený klient po klientovi, ale to, co postaví, se těžko boří, protože důvěra v úsudek se nedá koupit. Tvoje riziko je odstup: svět analyzuješ, místo abys do něj {zasáhl|zasáhla}, a dokonalé porozumění se snadno stane výmluvou, proč ještě nejednat. Nejlepší verze Mudrce ví, že poznání má cenu teprve tehdy, když někomu změní rozhodnutí.",
    vPodnikani:
      "Ve firmě jsi {ten|ta}, kdo drží kvalitu úsudku: poslední instance před velkými rozhodnutími, {autor|autorka} metodik, {učitel|učitelka} týmu. Tvoje značka má vzdělávat: obsah, který skutečně něco naučí, je tvůj nejlevnější a nejtrvalejší marketing. Sedí ti poradenství, vzdělávání, finance, zdraví, technologie a každý obor, kde je zákazník zahlcen protichůdnými informacemi a hledá, komu věřit. Prodávej klidně: žádný tlak, žádné odpočty do konce nabídky. Tvůj zákazník se rozhoduje pomalu a tvoje trpělivost je součást služby.",
    stin:
      "Stínem Mudrce je věž ze slonoviny. Pod tlakem se stahuješ do analýzy: ještě jedna studie, ještě jeden názor, a rozhodnutí zase o týden později. Druhá podoba stínu je intelektuální povýšenost, tedy neschopnost snést, že zákazník nechce vysvětlení, ale řešení, a tichý despekt k lidem, kteří se rozhodují emocemi. A protože nejvíc se bojíš omylu, máš sklon neříkat nic, dokud to není jisté, jenže trh mezitím poslouchá ty, kdo mluví.",
    pasti:
      "Hlavní past je obsah bez byznysu: publikuješ, přednášíš a vzděláváš, ale nikde nezazní nabídka, takže z autority nikdy nebude objednávka. Druhá past je jazyk oboru, kterému zákazník nerozumí a stydí se zeptat. Třetí je nekonečné zpřesňování, kterým se odkládá uvedení na trh.",
    navod: [
      "Vyber si jedno téma, ve kterém budeš nejcitovanějším hlasem v zemi, a publikuj k němu pravidelně; šíře je nepřítel autority.",
      "Každý obsah zakonči krokem: co má čtenář udělat teď a co pro něj umíš udělat ty. Autorita bez nabídky je koníček, ne podnikání.",
      "Překládej: každou odbornou větu přepiš tak, aby jí rozuměl zákazník bez tvého vzdělání. Srozumitelnost autoritu zvyšuje, ne snižuje.",
      "Dej rozhodnutím termín: co nerozhodneš do stanoveného dne, rozhodni podle nejlepšího dostupného odhadu a napiš si, co ses tím dozvěděl.",
      "Ukazuj i závěry, které se ti nehodí. Nic nebuduje důvěru rychleji než značka, která přizná, kde její řešení není nejlepší volba.",
    ],
    priklady: "Harvard, McKinsey, National Geographic, kvalitní odborná média",
    sekundarniRole:
      "Jako druhý v pořadí dodává značce hloubku a důvěryhodnost: podkládá sliby primárního archetypu daty a chrání firmu před rozhodnutími z nadšení.",
  },

  hrdina: {
    nazev: "Hrdina",
    puvodni: "Hero",
    motto: "Kde je vůle, tam je cesta.",
    touha: "dokázat svou hodnotu odvážným a náročným činem",
    strach: "slabost, selhání a zbabělost",
    dar: "kompetence, odvaha a disciplína",
    podstata:
      "Tvůj svět má laťky a ty je {rád|ráda} zdoláváš. Překážka tě nabudí, konkurence tě probouzí a nejlíp pracuješ, když je jasné, co znamená vyhrát. Nejde ti o pohodlí ani o potlesk; jde ti o důkaz, že to jde, podaný výkonem, ne řečmi. Značky Hrdiny zvou zákazníka nahoru: nekupuješ botu, kupuješ vůli vstát v šest ráno. Tvoje komunikace má tah: mluví o výzvách, ne o vlastnostech produktu, a slibuje, že s tebou zákazník dokáže víc, než si o sobě myslí. Hrdina je nejčitelnější archetyp, protože jeho příběh zná každý: výzva, dřina, vítězství. Tvoje riziko je, že bez závodu neumíš žít; když chybí protivník, vyrobíš si ho, klidně ve vlastním týmu, a odpočinek cítíš jako slabost, dokud tě nezastaví tělo.",
    vPodnikani:
      "Ve firmě jsi motor: zvedáš cíle, jdeš první a měříš výsledky. Tvoje značka má vyzývat: kampaně stavěj na překonání, srovnání a měřitelném zlepšení, ne na pohodlí. Sedí ti sport, výkonové služby, B2B, kde se dá doložit výsledek číslem, a všechny trhy, kde zákazník chce být lepší verzí sebe. Pozor na tým: ne každý je Hrdina a lidé, kteří tvůj závod nesdílejí, nejsou lenoši. Firma jen z Hrdinů vyhoří; potřebuješ vedle sebe pečovatele a tvůrce, kteří drží zázemí.",
    stin:
      "Stínem Hrdiny je arogance a věčná válka. Pod tlakem začneš vidět nepřátele i tam, kde nejsou: konkurence je zlo, kritik je zrádce, pomalejší kolega je brzda. Druhá podoba stínu je neschopnost přiznat slabost; o problémech se nemluví, protože mluvit o nich znamená selhat, a tak se o nich dozvíš, až když bouchnou. Třetí je workoholismus předváděný jako ctnost, který vyčerpá tebe i tvůj tým.",
    pasti:
      "Hlavní past značky Hrdiny je křičící nadřazenost: samé nej a číslo jedna, kterému nikdo nevěří. Druhá past je zákazník jako divák, protože hrdinou příběhu má být on, ne ty. Třetí je poměřování se s konkurencí tak okaté, že jí děláš reklamu.",
    navod: [
      "Udělej hrdinou zákazníka: tvoje značka je trenér a výstroj, ne vítěz. Případové studie piš jako jeho příběh, sebe nech v roli průvodce.",
      "Postav komunikaci na měřitelné výzvě: konkrétní číslo, konkrétní termín, veřejný závazek. Nic neprodává Hrdinu líp než doložený výsledek.",
      "Přiznej porážky: jedna poctivě rozebraná prohra ročně udělá pro důvěryhodnost víc než deset vítězství.",
      "Nastav si protiváhu: člověka nebo rituál, který má právo říct dost, když ženeš sebe nebo tým přes hranu. Odpočinek plánuj jako trénink.",
      "Vybírej si závody: dvě tři bitvy ročně, které stojí za plnou sílu, a zbytek nech plavat. Hrdina, který bojuje se vším, nevyhraje nic.",
    ],
    priklady: "Nike, FedEx, Under Armour, armádní nábor",
    sekundarniRole:
      "Jako druhý v pořadí dodává značce tah a soutěživost: primárnímu archetypu přidává disciplínu, měřitelné cíle a ochotu jít do těžkých věcí.",
  },

  rebel: {
    nazev: "Rebel",
    puvodni: "Outlaw",
    motto: "Pravidla jsou na to, aby se porušovala.",
    touha: "revoluce: zbořit, co nefunguje",
    strach: "bezmoc a průměrnost",
    dar: "radikální svoboda a odvaha jít proti všem",
    podstata:
      "Tvoje energie pochází z nesouhlasu. Vidíš, co je v oboru shnilé, co si zákazníci nechávají líbit a co všichni mlčky tolerují, a nemůžeš u toho zůstat. Tam, kde se ostatní odlišují o pět procent, ty jdeš principiálně proti. Značky Rebela nevznikají pro všechny; vznikají pro lidi, kteří se v zavedeném světě necítí doma, a právě proto budují nejvěrnější kmeny na trhu. Kdo miluje Harley nebo raného Applea, nemiluje produkt, ale vzpouru, kterou s ním může nosit. Tvoje síla je i tvoje riziko: provokace bez pozitivního programu je jen hluk a bourání bez náhrady zanechá spoušť. Nejlepší Rebelové nejsou ti, kdo nejhlasitěji křičí, ale ti, kdo skutečně změnili pravidla trhu tak, že se už nikdy nevrátila zpátky.",
    vPodnikani:
      "Ve firmě jsi {ničitel|ničitelka} posvátných krav: zpochybňuješ ceníky, zvyklosti oboru i vlastní procesy. Tvoje značka má jasně říkat, proti čemu stojí; nepřítel (praktika, ne konkrétní firma) je tvůj nejsilnější marketingový nástroj. Sedí ti trhy s unavenými zákazníky a arogantními hráči: banky, telekomunikace, pojištění, všude tam působí přímý, drzý hlas jako zjevení. Vnitřně potřebuješ víc řádu, než připouštíš: revoluce venku vyžaduje disciplínu uvnitř, jinak se firma rozpadne dřív, než trh dobyje.",
    stin:
      "Stínem Rebela je destrukce pro destrukci. Pod tlakem se vzpoura utrhne od smyslu: provokuješ, i když to věci nepomáhá, a boříš i to, co funguje, jen proto, že to nevymyslel ty. Druhá podoba stínu je věčný odpor, tedy neschopnost přijmout jakoukoli autoritu včetně vlastních pravidel, kvůli které se firma nedá řídit. A pozor na cynismus: Rebel, který už nevěří, že jde něco změnit, umí jen ubližovat.",
    pasti:
      "Hlavní past je provokace jako samoúčel: šok, který nenese žádný postoj, publikum rychle prokoukne. Druhá past je vzpoura na povrchu a konformita uvnitř, tedy drzá kampaň nad úplně obyčejným produktem. Třetí je útok na konkrétní lidi místo na praktiky; tím se z rebela stává hulvát.",
    navod: [
      "Pojmenuj nepřítele přesně: praktiku, ne osobu. Sepiš manifest o tom, co v oboru odmítáš dělat, a zveřejni ho jako závazek, ne jako reklamu.",
      "Každou provokaci podlož změnou v produktu: co děláš skutečně jinak, ať jde vidět, změřit a vyzkoušet. Vzpoura musí být doložitelná.",
      "Buduj kmen, ne publikum: dej svým lidem jméno, znak a přístup dovnitř. Rebelové rostou skrz sounáležitost těch, kdo stojí proti témuž.",
      "Rozděl role: ty boříš venku, někdo pořádkumilovný staví uvnitř. Bez provozního řádu se revoluce zhroutí do chaosu.",
      "Jednou ročně si projdi vlastní pravidla otázkou: co z toho, proti čemu jsem {bojoval|bojovala}, teď {sám|sama} dělám? Rebel, který zestárl v establishment, je nejsmutnější konec.",
    ],
    priklady: "Harley-Davidson, Virgin, Liquid Death, raný Apple",
    sekundarniRole:
      "Jako druhý v pořadí dodává značce drzost a ostří: primárnímu archetypu propůjčuje odvahu jít proti oboru a přitahuje zákazníky unavené mainstreamem.",
  },

  mag: {
    nazev: "Mág",
    puvodni: "Magician",
    motto: "Nemožné je jen otázka postupu.",
    touha: "porozumět zákonům světa a proměnit vizi ve skutečnost",
    strach: "nezamýšlené následky vlastní moci",
    dar: "vize, intuice a schopnost proměňovat",
    podstata:
      "Tvoje řemeslo je proměna. Vidíš spojení, která ostatním unikají, a umíš vykreslit budoucnost tak přesvědčivě, že jí lidé začnou věřit dřív, než existuje. Neprodáváš produkt, ale jiný stav: zákazník k tobě přichází v jedné situaci a odchází v jiné, a přesně tak o své práci mluvíš. Mág je archetyp okamžiku, kdy se z nemožného stane samozřejmost: opravdu dobrá technologie, terapie, transformační program nebo služba, po které si zákazník řekne, jak jsem mohl žít bez tohohle. Tvoje síla stojí na důvěře, a proto je tvoje odpovědnost větší než u jiných archetypů: kdo umí proměňovat, umí i manipulovat, a hranice mezi vizí a slibem, který nejde splnit, je tenká. Nejlepší Mágové dodávají o kousek víc proměny, než slíbili, a nikdy naopak.",
    vPodnikani:
      "Ve firmě jsi {vizionář|vizionářka} a katalyzátor: spojuješ lidi, obory a nápady a z jejich průniku vzniká nové. Tvoje značka má prodávat proměnu, ne parametry: před a po, příběhy klientů, u kterých se něco skutečně zlomilo. Sedí ti technologie, vzdělávání, terapie a rozvoj, wellness, inovace: všude tam, kde zákazník chce jiný život, ne jen lepší nástroj. Tvoje riziko je dodávka: vize běží rychleji než realita, proto potřebuješ vedle sebe lidi, kteří počítají a dotahují.",
    stin:
      "Stínem Mága je manipulace. Pod tlakem začneš používat svou přesvědčivost k tomu, aby lidé dělali, co potřebuješ ty, a rozdíl mezi vedením a ovládáním se rozmaže. Druhá podoba stínu je odtržení od reality: sliby rostou, dodávka pokulhává a kolem značky se hromadí zklamaní, kteří uvěřili. Třetí je mesiášství, tedy pocit, že kdo nevidí tvou vizi, je slepý, a kritika je útok nechápajících.",
    pasti:
      "Hlavní past je slib bez důkazu: velká slova o proměně, pod kterými není jediný ověřitelný výsledek; na tom dnes trh pozná šarlatána za minutu. Druhá past je mlžení odborným nebo duchovním žargonem. Třetí je pohrdání drobnou, poctivou dodávkou, bez které se žádná vize nedožije rána.",
    navod: [
      "Dokumentuj proměny: měřitelné před a po, jmenovití klienti, ověřitelné výsledky. Každý slib, který nemá důkaz, přepiš na menší, nebo ho smaž.",
      "Slib méně, dodej víc: nastav očekávání o stupeň níž, než kam míříš. Překvapení navíc buduje pověst Mága, zklamání ji ničí trvale.",
      "Postav kolem sebe dodávku: provozního člověka s právem veta, čísla jednou týdně na stole. Vize bez počtů je hazard s cizí důvěrou.",
      "Uč zákazníka svému postupu: čím otevřeněji ukážeš, jak proměna funguje, tím míň působíš jako trik a tím dražší smíš být.",
      "Ošetři moc: pravidelně si polož otázku, jestli klient tvoje vedení ještě potřebuje, nebo už jen poslouchá. Cílem Mága je zákazník, který ho přeroste.",
    ],
    priklady: "Disney, Tesla v raných letech, Dyson, transformační vzdělávání",
    sekundarniRole:
      "Jako druhý v pořadí dodává značce vizi a příslib proměny: zvedá primární archetyp z řemesla k významu a dává firmě směr, který přesahuje ceník.",
  },

  "jeden-z-nas": {
    nazev: "Jeden z nás",
    puvodni: "Regular Guy / Regular Gal",
    motto: "Jsme stejní jako vy.",
    touha: "patřit mezi lidi a být {přijímán|přijímána} {takový|taková}, {jaký|jaká} jsem",
    strach: "vyčnívat, povyšovat se a být za to vyloučen",
    dar: "realismus, empatie a naprostá absence přetvářky",
    podstata:
      "Tvoje síla je v tom, že se nepovyšuješ. Mluvíš jazykem svých zákazníků, znáš jejich starosti z první ruky a nikdy jim nedáš pocit, že jsou hloupí nebo málo nóbl. Značky tohoto archetypu stojí na férovosti a selském rozumu: dobrá práce, poctivá cena, žádné pozlátko, žádné řeči. V době, kdy se každá druhá značka tváří prémiově, je obyčejnost paradoxně odlišnost: zákazník si u tebe oddechne, že nemusí nic předstírat ani dešifrovat. Buduješ vztah rovného s rovným, a proto ti lidé odpouštějí chyby, které by jinde neodpustili, pokud je přiznáš po lidsku. Tvoje riziko je neviditelnost: kdo nikdy nevyčnívá, toho si trh nevšimne, a skromnost se snadno stane výmluvou, proč nezvednout ceny ani hlas.",
    vPodnikani:
      "Ve firmě jsi tmel: {přístupný|přístupná} {šéf|šéfka}, {který|která} si nehraje na {ředitele|ředitelku}, a značka, která si nehraje na víc, než je. Komunikuj civilně: skuteční zákazníci, skutečné situace, žádní modelové s bělostným úsměvem. Sedí ti služby denní potřeby, řemesla, rodinné firmy, regionální značky a všechno, kde si zákazník vybírá podle důvěry, ne podle prestiže. Tvoje ceny mají být férové, ne nejnižší; obyčejnost není synonymum lácie a podbízení cenou tě připraví o marži i o hrdost.",
    stin:
      "Stínem tohoto archetypu je rozpuštění. Ze strachu vyčnívat obrušuješ všechno, čím se lišíš: názor radši neřekneš, cenu radši nezvedneš, novinku radši odložíš, až to udělají ostatní. Firma pak splyne s davem, kterému chtěla patřit. Druhá podoba stínu je nedůvěra k úspěchu: vlastní růst tě znejišťuje, protože z tebe dělá někoho, kdo už není jeden z nás, a tak ho podvědomě brzdíš.",
    pasti:
      "Hlavní past je zaměnitelnost: bez jediného výrazného rysu se staneš komoditou, kterou trh vybírá jen podle ceny. Druhá past je hraná lidovost, na kterou zákazník přijde okamžitě, zvlášť když ji dělá firma, která lidová není. Třetí je podceňování designu a formy, protože obyčejné neznamená odbyté.",
    navod: [
      "Najdi jednu věc, ve které si dovolíš vyčnívat, a drž ji: poznávací znak, službu navíc, názor. Jeden z nás s jednou zvláštností je nezapomenutelný.",
      "Postav marketing na skutečných zákaznících: jejich slova, fotky a příběhy s minimem úprav. Reference od souseda je tvoje nejsilnější médium.",
      "Piš, jak mluvíš: každou větu, kterou bys {neřekl|neřekla} zákazníkovi do očí u pultu, škrtni.",
      "Nastav férovou cenu a stůj za ní: vysvětli, co v ní je, a neslevuj ze strachu. Férovost znamená průhlednost, ne lácii.",
      "Přiznávej chyby po lidsku a rychle: co se stalo, co s tím děláš, co dostane zákazník. Právě tady se buduje věrnost, kterou prestiž nikdy nezíská.",
    ],
    priklady: "IKEA, Lidl v komunikaci s humorem, řemeslné a rodinné firmy, Baťa v lidové éře",
    sekundarniRole:
      "Jako druhý v pořadí dodává značce lidskost a přístupnost: stahuje primární archetyp z piedestalu k zákazníkovi a hlídá srozumitelnost komunikace.",
  },

  milenec: {
    nazev: "Milenec",
    puvodni: "Lover",
    motto: "Záleží mi na tobě.",
    touha: "blízkost, krása a smyslový prožitek",
    strach: "být nechtěný a nemilovaný",
    dar: "vášeň, vděčnost a cit pro krásu",
    podstata:
      "Tvoje značka je vztah. Nejde ti o transakce, ale o to, aby se zákazník cítil vybraný, hýčkaný a výjimečný, a aby všechno, na co u tebe sáhne, bylo krásné: produkt, obal, prostor, tón hlasu, i způsob, jakým řešíš reklamaci. Milenec dělá z nakupování zážitek a ze zákazníků oddané milovníky značky; tam, kde jiní počítají konverze, ty pěstuješ náklonnost. Máš cit pro atmosféru a detail, který se nedá naučit z příručky, a vášeň, která je nakažlivá: o tom, co děláš, mluvíš tak, že lidé chtějí být u toho. Tvoje riziko je závislost na přízni: lhostejnost nebo kritika tě zasahují osobně, a potřeba líbit se ti může brát schopnost říkat nepříjemné pravdy, účtovat si důstojné ceny a pouštět zákazníky, kteří ti škodí.",
    vPodnikani:
      "Ve firmě jsi {strážce|strážkyně} zážitku: nikdo nesmí ven nic, co není krásné a osobní. Tvoje značka má svádět: smyslové fotografie, pečlivý jazyk, obřadnost v maličkostech, jako je balení, vůně, ručně psaný lístek. Sedí ti gastronomie, móda, kosmetika, design, pohostinství, svatby a všechny trhy, kde si zákazník kupuje potěšení a vztah, ne užitek. Měř si věrnost a doporučení, ne jen prodej: tvoje ekonomika stojí na zákaznících, kteří se vracejí a přivádějí další, protože milovat tvou značku je součást jejich identity.",
    stin:
      "Stínem Milence je ztráta sebe v touze líbit se. Pod tlakem slibuješ všem všechno, snášíš klienty, kteří tě vysávají, a nedokážeš zvednout ceny, protože odmítnutí bolí jako osobní zrada. Druhá podoba stínu je žárlivost na vlastní tým a značku: všechno musí projít tebou, protože nikdo jiný to neudělá s láskou, a firma se zadře na tvé kapacitě. Třetí je forma nad obsahem, tedy krása, pod kterou chybí spolehlivost.",
    pasti:
      "Hlavní past je krása bez páteře: značka, která se chce líbit všem, ztrácí tvar i marži. Druhá past je přeslazenost, protože vášeň bez špetky soli působí jako kýč. Třetí je osobní vyčerpání: vztahová značka postavená jen na tobě neškáluje a její zakladatel vyhoří první.",
    navod: [
      "Definuj smyslový podpis značky: jak vypadá, zní, voní a jakým tónem mluví, a promítni ho do všeho od webu po fakturu. Konzistence je u krásy všechno.",
      "Ritualizuj péči: okamžik navíc, který zákazník nečeká (balení, vzkaz, pozornost k výročí), zabuduj do procesu, ať nezávisí na tvé náladě.",
      "Nauč se říkat ne: definuj zákazníka, kterého nechceš, a drž to. Vztah bez hranic není láska, ale sebezničení, v podnikání stejně jako v životě.",
      "Cenu postav na výjimečnosti zážitku a neomlouvej ji: kdo prodává lásku ke značce, nesoutěží s ceníkem supermarketu.",
      "Předej péči dál: sepiš, co dělá tvůj dotek tvým, a nauč to tým. Značka miluje zákazníka jako celek, ne jen skrz tebe.",
    ],
    priklady: "Chanel, Godiva, Häagen-Dazs, butiková pohostinnost",
    sekundarniRole:
      "Jako druhý v pořadí dodává značce vřelost a estetiku: primárnímu archetypu přidává péči o detail a vztah, díky kterému se zákazníci vracejí.",
  },

  sprymar: {
    nazev: "Šprýmař",
    puvodni: "Jester",
    motto: "Když to není zábava, děláme to špatně.",
    touha: "žít naplno tady a teď",
    strach: "nuda a bezvýznamnost",
    dar: "radost, lehkost a odzbrojující upřímnost",
    podstata:
      "Tvoje zbraň je lehkost. Umíš vzít vážnou věc a podat ji tak, že u ní lidé zůstanou; umíš prolomit formálnost, shodit napětí a říct pravdu, kterou by jiný neustál, protože ji říkáš s úsměvem. Šprýmař je archetyp dvorního blázna: jediného, kdo smí říkat králi pravdu. Značky tohoto archetypu si lidé pouštějí blíž, protože je baví, a zábava je nejrychlejší zkratka k zapamatování: vtipná kampaň se šíří sama, nudná potřebuje rozpočet. Tvoje riziko je dvojí: humor bez řemesla je trapnost, a humor jako útěk znamená, že vtipem uhýbáš před rozhodnutími, konflikty a čísly, která nejsou k smíchu. Nejlepší Šprýmaři jsou vzadu smrtelně vážní profesionálové; právě proto si tu lehkost venku mohou dovolit.",
    vPodnikani:
      "Ve firmě jsi zdroj energie: odlehčuješ porady, boříš zbytečnou formálnost a děláš z práce místo, kam lidé chodí rádi. Tvoje značka má bavit: hravý jazyk, kampaně s pointou, odvaha si vystřelit ze sebe i z oboru. Sedí ti trhy s nudnou nebo strojenou konkurencí, kde je vtip okamžitá odlišnost: nápoje, drogerie, telekomunikace, ale i pojištění nebo účetnictví, pokud uneseš kontrast. Humor si dopřej na povrchu, disciplínu drž uvnitř: sliby, termíny a čísla nesmí být k smíchu nikdy.",
    stin:
      "Stínem Šprýmaře je útěk. Pod tlakem obrátíš v žert i to, co žert není: špatná čísla, konflikt v týmu, vlastní únavu, a rozhodnutí, které bolí, odkládáš další historkou. Druhá podoba stínu je humor jako zbraň: ironie, která zraňuje, a shazování, které si okolí nedovolí vrátit. Třetí je závislost na publiku, tedy neschopnost fungovat bez potlesku a tichá panika, když se nikdo nesměje.",
    pasti:
      "Hlavní past je vtip bez značky: kampaň, kterou si všichni pamatují, ale nikdo neví, čí byla. Druhá past je humor na účet zákazníka; smát se s ním je zlato, smát se mu je konec. Třetí je nedůvěryhodnost: kdo jen baví, tomu se nesvěří vážná zakázka, takže vtip musí stát na viditelném řemesle.",
    navod: [
      "Ujasni si, čemu se u vás nikdo smát nesmí: kvalita, termíny, bezpečí, peníze zákazníka. Zbytek si užij naplno; hranice dělá humor bezpečným.",
      "Vtip vždycky zapoj do značky: pointa má nést tvoje jméno, tvůj produkt nebo tvůj postoj, jinak bavíš trh za vlastní peníze.",
      "Směj se nejdřív sobě: sebeironie odzbrojuje a dává ti právo dělat si legraci z oboru. Nikdy z konkrétního zákazníka.",
      "Postav vedle sebe vážného partnera pro čísla a konflikty a domluv si s ním signál pro chvíle, kdy vtipem utíkáš místo řešíš.",
      "Testuj humor na malém publiku dřív, než ho pustíš ven: co je smíchu na poradě, nemusí být smíchu na trhu, a smazaný příspěvek se maže hůř, než se zdá.",
    ],
    priklady: "M&M's, Old Spice, Fanta, Kofola v hravých kampaních",
    sekundarniRole:
      "Jako druhý v pořadí dodává značce šarm a zapamatovatelnost: odlehčuje vážnost primárního archetypu a otevírá dveře tam, kde by samotná vážnost narazila.",
  },

  pecovatel: {
    nazev: "Pečovatel",
    puvodni: "Caregiver",
    motto: "Postaráme se o vás.",
    touha: "chránit druhé a pomáhat jim",
    strach: "sobectví a nevděk; že se o někoho nepostará",
    dar: "soucit, štědrost a spolehlivost",
    podstata:
      "Tvoje podnikání je péče. Nepodnikáš, abys {vyhrál|vyhrála} nebo {zazářil|zazářila}, ale aby se lidé kolem tebe měli dobře: zákazníci, tým, rodina. Vidíš potřeby dřív, než je někdo vysloví, a služby stavíš tak, aby zákazníka nic nezaskočilo a nic ho nebolelo. Značky Pečovatele jsou přístav: volí se ve chvílích, kdy jde o hodně (zdraví, děti, peníze, bezpečí), protože vyzařují jistotu, že tady mě nenechají ve štychu. Důvěra, kterou budujete, je nejtrvalejší aktivum na trhu: neodchází se od ní kvůli pěti procentům slevy. Tvoje riziko je sebeobětování: dáváš víc, než je udržitelné, neumíš účtovat za všechnu tu péči navíc a hranice mezi službou a posluhováním se ti ztrácí. Vyčerpaný Pečovatel je pak hořký, a hořkost je pečující značce smrtelná.",
    vPodnikani:
      "Ve firmě jsi {ochránce|ochránkyně}: {šéf|šéfka}, za {kterým|kterou} se chodí s problémy, a značka, u které se zákazník nemusí bát. Komunikuj jistotou: garance, jasné postupy pro případ potíží, dostupná podpora s lidským hlasem. Sedí ti zdravotnictví a péče, finance a pojištění, vzdělávání dětí, služby pro domácnost, B2B servis: všude, kde si zákazník kupuje klid. Nauč se péči účtovat: pojmenuj ji v nabídce jako službu s cenou, protože co je zadarmo a neviditelné, to si zákazník neuvědomí a trh neocení.",
    stin:
      "Stínem Pečovatele je mučednictví. Pod tlakem dáváš dál i to, co nemáš: neúčtované hodiny, víkendy, vlastní zdraví, a začneš potichu počítat křivdy. Z péče se stane tichý nárok na vděčnost, a když nepřichází, přijde hořkost nebo vyčítání. Druhá podoba stínu je péče jako kontrola: rozhoduješ za zákazníky i za tým, protože ty přece víš nejlíp, co potřebují, a bereš jim tím dospělost.",
    pasti:
      "Hlavní past je neviditelná práce: služby navíc, které nikdo neobjednal, nikdo nezaplatil a nikdo si jich nevšiml. Druhá past je strach z ceny, tedy podceněné sazby ze studu účtovat si za pomoc. Třetí je vyčerpaný tým: pečující značka, jejíž lidé jsou na dně, je rozpor, který zákazník pozná.",
    navod: [
      "Sepiš všechno, co děláš nad rámec objednávky, a rozděl to: co je součást značky (pojmenuj a komunikuj), co je placená služba (naceň a nabízej), co rušíš.",
      "Komunikuj jistotu konkrétně: co garantuješ, jak rychle reaguješ, co se stane, když se něco pokazí. Klid se prodává detaily, ne slovem péče.",
      "Nastav hranice péče písemně: dostupnost, rozsah, cena mimořádností. Hranice nejsou zrada péče, jsou podmínka její udržitelnosti.",
      "Pečuj o tým stejně vážně jako o zákazníky a měř to: přetížený tým je u pečující značky první zdroj rozbité pověsti.",
      "Nauč se přijímat: vyžádej si reference a doporučení. Pečovatel, který neumí přijmout dík, připravuje značku o její nejsilnější důkazy.",
    ],
    priklady: "Volvo, Johnson & Johnson, pojišťovny, rodinné lékárny",
    sekundarniRole:
      "Jako druhý v pořadí dodává značce bezpečí a lidské teplo: primárnímu archetypu přidává spolehlivost a vztah, který vydrží i po chybě.",
  },

  tvurce: {
    nazev: "Tvůrce",
    puvodni: "Creator",
    motto: "Co si dovedeš představit, jde vytvořit.",
    touha: "vytvořit něco trvalé hodnoty",
    strach: "průměrná vize a průměrné provedení",
    dar: "představivost, řemeslo a smysl pro kvalitu",
    podstata:
      "Tvoje podnikání je dílna. Nepodnikáš primárně kvůli výhře ani kvůli lidem; podnikáš, protože musíš tvořit, a firma je tvoje médium. Poznáš kvalitu na první dotek, nekvalita tě fyzicky ruší a šablony tě urážejí: radši vytvoříš vlastní kategorii, než abys {soutěžil|soutěžila} v cizí. Značky Tvůrce se poznají beze slov: mají rukopis, který se pozná bez loga, a přitahují zákazníky, kteří sami tvoří nebo chtějí nosit projev dobrého vkusu. Tvoje laťka je tvoje bohatství i tvoje past: díky ní vzniká práce, která přežije trendy, ale táž laťka umí zablokovat vydání čehokoli, protože ono to ještě není ono. Trh přitom neplatí za dokonalost v šuplíku, platí za hotové věci, které směly ven.",
    vPodnikani:
      "Ve firmě jsi {autor|autorka} standardu: definuješ, jak vypadá dobře odvedená práce, a tvoje jméno je zárukou provedení. Značku stavěj na rukopisu: konzistentní estetika a řemeslné detaily napříč vším, co jde ven, a příběh vzniku jako součást produktu; lidé platí víc, když vidí, jak věc vzniká a proč právě takhle. Sedí ti design, architektura, řemesla, obsah, software s duší, gastronomie: každý trh, kde se dá vyhrát provedením. Tvoje čísla hlídej dvakrát: Tvůrci účtují materiál a zapomínají účtovat genialitu.",
    stin:
      "Stínem Tvůrce je perfekcionismus, který dusí. Pod tlakem přestaneš pouštět věci ven: všechno se přepracovává, termíny kloužou a tým se učí, že nic není dost dobré, takže přestane nosit nápady. Druhá podoba stínu je tvorba pro tvorbu: produkt krásný pro tebe, ale míjející zákazníka, a pohrdání vším komerčním, které z firmy dělá drahý koníček. Třetí je autorská ješitnost: kritika díla se rovná útoku na tebe.",
    pasti:
      "Hlavní past je nedodání: krásné věci, které svět neviděl, značku nestaví. Druhá past je nesrozumitelnost, tedy dílo, které mluví jazykem tvůrce, ne zákazníka. Třetí je podceněná cena: řemeslo prodávané za sazbu montáže, protože si neumíš naúčtovat myšlenku.",
    navod: [
      "Zaveď dvě laťky: mistrovskou pro vlajkové kusy a řemeslně poctivou pro běžnou produkci. Rozhoduj předem, co je co, ať dokonalost neblokuje provoz.",
      "Dej termínům stejnou váhu jako kvalitě: hotové a vydané poráží dokonalé a schované. Datum vydání je součást díla.",
      "Prodávej příběh vzniku: skici, materiály, rozhodnutí, zavržené verze. Zákazník platí za provedení víc, když rozumí, co v něm je.",
      "Naceň myšlenku, ne hodiny: cena má odrážet hodnotu rukopisu. Kdo účtuje jako montér, bude jako montér i vnímán.",
      "Odděl sebe od díla: kritiku produktu přijímej jako informaci o produktu. Pomáhá ritualizovat zpětnou vazbu dřív, než je dílo hotové.",
    ],
    priklady: "Lego, Apple v éře designu, Moleskine, řemeslné manufaktury",
    sekundarniRole:
      "Jako druhý v pořadí dodává značce rukopis a kvalitu provedení: primárnímu archetypu přidává estetiku a řemeslo, díky kterým je vidět a poznat.",
  },

  vladce: {
    nazev: "Vládce",
    puvodni: "Ruler",
    motto: "Kdo jiný než my.",
    touha: "kontrola a prosperita: vybudovat a udržet řád",
    strach: "chaos a ztráta pozice",
    dar: "odpovědnost, vůdcovství a schopnost budovat systémy",
    podstata:
      "Tvoje síla je řád. Tam, kde jiní improvizují, ty stavíš systém: pravidla, standardy a struktury, které fungují, i když zrovna nejsi u toho. Odpovědnost tě netíží, sedí ti; rozhoduješ se rychle a neseš následky, a lidé kolem tebe to cítí jako jistotu. Značky Vládce jsou první volba, ne alternativa: vyzařují autoritu, prvotřídnost a stabilitu, a zákazník si jimi kupuje klid, že sáhl po standardu oboru, za který se nemusí nikomu omlouvat. Vládce nestaví na novinkách, ale na pozici: být tím, podle koho se měří ostatní. Tvoje riziko je kontrola: neumíš pustit z ruky ani to, co by jiní udělali dost dobře, a chaos, který k růstu patří, snášíš tak špatně, že radši rosteš pomaleji, než abys ho {připustil|připustila}.",
    vPodnikani:
      "Ve firmě jsi {architekt|architektka} řádu: buduješ procesy, hierarchii a nástupnictví, a {měl|měla} bys je budovat tak, aby firma uměla žít bez tebe. Značka má vyzařovat suverenitu: prémiový vzhled bez výstřelků, klidný autoritativní tón, žádné podbízení a žádné slevové výprodeje, které pozici rozleptávají. Sedí ti B2B, finance, právo, nemovitosti, prémiové služby: trhy, kde zákazník platí za jistotu a status. Tvoje ceny mají stát nahoře a mají to unést: Vládce, který soutěží cenou, popírá sám sebe.",
    stin:
      "Stínem Vládce je tyranie. Pod tlakem utahuješ kontrolu: mikromanagement, rozhodnutí jen přes tvůj stůl, okolí, které se naučí mlčet, protože nesouhlas se trestá. Firma pak stojí a padá s tebou a informace k tobě přestávají téct. Druhá podoba stínu je status nad věcnost: image se udržuje, i když realita zaostává, a přiznat problém se rovná ohrožení trůnu. Třetí je pohrdání malými: zákazníky, konkurenty i nápady, které nepřicházejí shora.",
    pasti:
      "Hlavní past je arogance značky: komunikace, ze které zákazník cítí, že je poctěn, že smí nakoupit. Druhá past je strnulost, protože pozice se brání i tam, kde trh už odešel jinam. Třetí je závislost firmy na jedné hlavě: majestát bez nástupnictví je jen odložený pád.",
    navod: [
      "Deleguj podle pravidla rozhodnutí pod hranici: urči částku a typ rozhodnutí, které tým dělá bez tebe, a hranici každý kvartál zvedej.",
      "Komunikuj klidnou autoritou: méně superlativů, více důkazů pozice, tedy reference, čísla, historie. Vládce nekřičí, Vládce konstatuje.",
      "Chraň cenovou hladinu: místo slev přidávej hodnotu. Jediná výprodejová kampaň umí rozleptat pozici budovanou roky.",
      "Zabuduj si přísun nepohodlné pravdy: člověka nebo formát, kde ti tým smí beztrestně oponovat. Trůn bez zpětné vazby padá bez varování.",
      "Postav nástupnictví jako projekt: napiš, co všechno stojí jen na tobě, a každý rok z toho seznamu něco škrtni. Skutečný Vládce buduje říši, která ho přežije.",
    ],
    priklady: "Mercedes-Benz, Rolex, American Express, IBM v éře dominance",
    sekundarniRole:
      "Jako druhý v pořadí dodává značce autoritu a pevnou ruku: primárnímu archetypu přidává řád, standardy a pozici, o kterou se dá opřít růst.",
  },
}
