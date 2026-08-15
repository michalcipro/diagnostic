import type { ArchetypId, ArchetypObsah } from "../types"

// Slovenské znenie textov archetypov. Zrkadlí obsah.ts kus po kuse: rovnaké
// kľúče, rovnaké poradie, rovnaké rodové značky. Kontrolu robí
// scripts/test-archetypy.cjs.

export const OBSAH_ARCHETYPU_SK: Record<ArchetypId, ArchetypObsah> = {
  nevinatko: {
    nazev: "Neviniatko",
    puvodni: "Innocent",
    motto: "Robíme veci správne a jednoducho.",
    touha: "zažiť svet, ktorý je dobrý a jednoduchý",
    strach: "urobiť niečo zle a zaslúžiť si tým trest",
    dar: "dôvera, optimizmus a čistota",
    podstata:
      "Tvoja sila je v tom, čomu veríš: že veci sa dajú robiť poctivo, jednoducho a s dobrým úmyslom, a že sa to nakoniec vyplatí. Nepotrebuješ triky, pretože nemáš čo skrývať. Ľudia z teba cítia pokoj a bezpečie, ktorému sa dnes takmer nedá veriť, a práve preto po ňom túžia. Neviniatko nie je naivita v hanlivom zmysle; je to vedomé rozhodnutie nehrať špinavú hru, aj keď sa hrá všade okolo. Vo svete presýtenom klamlivou reklamou a hviezdičkami pod čiarou je značka, ktorá myslí svoj sľub doslova, osvieženie a úľava. Tvoja komunikácia funguje, keď je priezračná: krátke vety, jasné ceny, žiadne chytáky. Zákazník od teba nechce byť ohromený, chce si vydýchnuť, že tu sa nemusí mať na pozore. To je vzácny tovar a dá sa na ňom postaviť celá značka.",
    vPodnikani:
      "Vo firme si {ten|tá}, kto drží latku slušnosti: férové zmluvy, sľuby, ktoré platia, ceny bez prekvapení. Tvoja značka má pôsobiť ako čistý stôl, od produktu po reklamáciu. Najlepšie ti sadnú odbory, kde zákazník potrebuje dôveru a jednoduchosť: potraviny a veci dennej potreby, rodinné služby, čokoľvek, kde ostatní preháňajú a sľubujú nemožné. Tvoj marketing nemusí kričať; stačí, keď je pravdivý a konzistentný, pretože tvoja najsilnejšia reklama je skúsenosť, že to u teba bolo presne tak, ako si {povedal|povedala}.",
    stin:
      "Tieňom Neviniatka je popieranie. Pod tlakom máš sklon nevidieť problémy, ktoré nejdú s tvojím obrazom sveta dohromady: zlé čísla, nespoľahlivého dodávateľa, konflikt v tíme. Odkladáš nepríjemné rozhovory a dúfaš, že sa to napraví samo. Druhá podoba tieňa je krehkosť: keď ti niekto krivdí alebo spochybní tvoj dobrý úmysel, zasiahne ťa to hlbšie, než je zdravé, a namiesto vecnej obrany sa stiahneš.",
    pasti:
      "Najväčšou pascou je sladkosť bez obsahu: keď značka sľubuje raj a dodá priemer, pôsobí falošne horšie než cynická konkurencia. Druhá pasca je nuda, pretože čistota bez štipky osobnosti splynie s pozadím. A pozor na moralizovanie; Neviniatko, ktoré poúča ostatných o správnosti, stráca sympatie okamžite.",
    navod: [
      "Zjednodušuj všetko, na čo zákazník siahne: ponuku, cenník, zmluvu, reklamáciu. Každú položku, ktorá potrebuje vysvetlivku, prepíš alebo zruš.",
      "Sľubuj o stupeň menej, než dodáš. Tvoja značka stojí na tom, že sľub platí doslova; jedna hviezdička pod čiarou ti zborí viac než desať kampaní postaví.",
      "Hovor jazykom bez príkras: krátke vety, konkrétne čísla, žiadne superlatívy. Fotky a dizajn voľte svetlé, čisté, bez efektov.",
      "Zaveď si mesačný rituál nepríjemnej pravdy: jedno číslo alebo problém, ktorý sa ti nechce vidieť, prejdi s niekým, kto ťa nešetrí.",
      "Odlišuj sa cnosťou, ktorú konkurencia nemá: napríklad zverejni, čo iní schovávajú (zloženie, marže, pôvod), a urob z toho svoj poznávací znak.",
    ],
    priklady: "Dove, Ivory, dojčenské a rodinné rady značiek, poctivé lokálne potraviny",
    sekundarniRole:
      "Ako druhý v poradí dodáva značke čistotu a dôveryhodnosť: zmäkčuje tvrdší primárny archetyp a stráži, aby rast nešiel cez čiaru slušnosti.",
  },

  objevitel: {
    nazev: "Objaviteľ",
    puvodni: "Explorer",
    motto: "Nezostávaj v ohrade.",
    touha: "sloboda hľadať {sám|sama} seba objavovaním sveta",
    strach: "pasca, konformita a vnútorná prázdnota",
    dar: "autonómia, odvaha ísť vlastnou cestou a čuch na nové",
    podstata:
      "Tvoj motor je sloboda. Neznesieš ohradu, či má podobu korporátnej kariéry, zabehnutého odboru alebo vlastného úspešného, ale nudného produktu. Chodíš tam, kam sa ostatní ešte len chystajú, a najlepšie ti je na začiatku cesty, keď je všetko otvorené. Zákazníkom neponúkaš vec, ale výpravu: pocit, že s tebou zažijú niečo, čo doma nedostanú, a že sa pritom nemusia vzdať samých seba. Objaviteľ je archetyp autenticity; jeho značky nosia ľudia, ktorí chcú povedať, že nie sú ako ostatní. Tvoje riziko je rovnaké ako tvoja sila: tam, kde iní vydržia pri rozrobenej veci roky, ty cítiš nutkanie ísť ďalej, a tak za sebou nechávaš rozbehnuté projekty, ktoré nikto nedotiahol. Tvoje podnikanie porastie vtedy, keď si nájdeš parťákov, ktorí doťahujú, a sebe necháš prieskum nových území.",
    vPodnikani:
      "Vo firme si {prieskumník|prieskumníčka} trhu: nové kanály, produkty aj krajiny testuješ skôr než ostatní, a najsilnejšie ti je vo fáze, keď nikto nevie, kadiaľ vedie cesta. Tvoja značka má rozprávať o ceste, nie o cieli: skutočné príbehy z terénu, nedokonalé fotky, poctivé denníky z vývoja fungujú lepšie než vyleštená kampaň. Sadnú ti odbory spojené s pohybom, prírodou, cestovaním a nezávislosťou, ale aj každý produkt, ktorý zákazníkovi sľubuje únik z každodennosti. Daj pozor, aby za tvojím objavovaním zostávala zjazdná cesta pre ostatných: procesy, ktoré fungujú aj bez teba.",
    stin:
      "Tieňom Objaviteľa je blúdenie. Keď sloboda prestane mať smer, mení sa na neschopnosť rozhodnúť sa a usadiť: nový projekt je vždy lákavejší než dokončenie starého, nový trh zaujímavejší než starostlivosť o ten, ktorý ťa živí. Pod tlakom máš sklon utiecť doslova, teda odísť, zmeniť tému, začať inde. Druhá podoba tieňa je osamelosť: kto stále odchádza, nemá kde zapustiť korene, a to platí pre vzťahy so zákazníkmi aj s ľuďmi v tíme.",
    pasti:
      "Pasca číslo jeden je značka bez kontinuity: každý rok iný obal, iný tón, iný produkt, takže si ťa trh nestihne zapamätať. Druhá pasca je romantika bez úžitku, pretože zákazník chce zážitok, ale produkt musí fungovať. Tretia je pohŕdanie obyčajnými zákazníkmi, ktorí žiadne dobrodružstvo nechcú.",
    navod: [
      "Oddeľ prieskum od prevádzky: nové nápady dostanú vyhradený čas a rozpočet (napríklad pätinu), zvyšok ide v režime, ktorý doťahuje niekto iný než ty.",
      "Postav značku na príbehu cesty: ukazuj zákulisie, testy, omyly a objavy. Autenticita je tvoja mena, vyleštenosť ti nesvedčí.",
      "Daj zákazníkovi rolu spoluobjaviteľa: predpredaje, beta verzie, expedície, limitky. Kto objavil značku skôr než ostatní, je tvoj najvernejší vyslanec.",
      "Každý nový projekt musí prejsť otázkou: kto ho povedie, keď ma prestane baviť? Bez mena a plánu odovzdania ho nezačínaj.",
      "Raz za kvartál sa vráť k zákazníkom, ktorých už máš. Objavitelia zabúdajú, že verní zákazníci sú tiež územie, o ktoré sa treba starať.",
    ],
    priklady: "The North Face, Jeep, Starbucks v raných rokoch, GoPro",
    sekundarniRole:
      "Ako druhý v poradí dodáva značke nepokoj a čerstvý vietor: stráži, aby primárny archetyp neskostnatel, a prináša nové trhy a formáty skôr než konkurencia.",
  },

  mudrc: {
    nazev: "Mudrc",
    puvodni: "Sage",
    motto: "Pravda oslobodzuje.",
    touha: "objaviť pravdu a porozumieť svetu",
    strach: "byť oklamaný a konať z nevedomosti",
    dar: "múdrosť, nadhľad a schopnosť vidieť súvislosti",
    podstata:
      "Tvoja autorita stojí na poznaní. Nepresviedčaš hlasitosťou, ale tým, že veci chápeš hlbšie než ostatní a vieš ich vysvetliť. Skôr než sa rozhodneš, chceš dáta; skôr než niečo odporučíš, chceš to mať overené, a práve preto má tvoje slovo váhu. Zákazníci k tebe nechodia nakupovať, chodia sa radiť, a to je pozícia, ktorú žiadna zľava konkurencie neprebije. Mudrc buduje značku pomaly: článok po článku, prednáška po prednáške, spokojný klient po klientovi, ale to, čo postaví, sa ťažko búra, pretože dôvera v úsudok sa nedá kúpiť. Tvoje riziko je odstup: svet analyzuješ, namiesto aby si doň {zasiahol|zasiahla}, a dokonalé porozumenie sa ľahko stane výhovorkou, prečo ešte nekonať. Najlepšia verzia Mudrca vie, že poznanie má cenu až vtedy, keď niekomu zmení rozhodnutie.",
    vPodnikani:
      "Vo firme si {ten|tá}, kto drží kvalitu úsudku: posledná inštancia pred veľkými rozhodnutiami, {autor|autorka} metodík, {učiteľ|učiteľka} tímu. Tvoja značka má vzdelávať: obsah, ktorý skutočne niečo naučí, je tvoj najlacnejší a najtrvalejší marketing. Sadne ti poradenstvo, vzdelávanie, financie, zdravie, technológie a každý odbor, kde je zákazník zahltený protichodnými informáciami a hľadá, komu veriť. Predávaj pokojne: žiadny tlak, žiadne odpočty do konca ponuky. Tvoj zákazník sa rozhoduje pomaly a tvoja trpezlivosť je súčasť služby.",
    stin:
      "Tieňom Mudrca je veža zo slonoviny. Pod tlakom sa sťahuješ do analýzy: ešte jedna štúdia, ešte jeden názor, a rozhodnutie zase o týždeň neskôr. Druhá podoba tieňa je intelektuálna povýšenosť, teda neschopnosť zniesť, že zákazník nechce vysvetlenie, ale riešenie, a tichý despekt k ľuďom, ktorí sa rozhodujú emóciami. A pretože najviac sa bojíš omylu, máš sklon nehovoriť nič, kým to nie je isté, lenže trh medzitým počúva tých, ktorí hovoria.",
    pasti:
      "Hlavná pasca je obsah bez biznisu: publikuješ, prednášaš a vzdelávaš, ale nikde nezaznie ponuka, takže z autority nikdy nebude objednávka. Druhá pasca je jazyk odboru, ktorému zákazník nerozumie a hanbí sa opýtať. Tretia je nekonečné spresňovanie, ktorým sa odkladá uvedenie na trh.",
    navod: [
      "Vyber si jednu tému, v ktorej budeš najcitovanejším hlasom v krajine, a publikuj k nej pravidelne; šírka je nepriateľ autority.",
      "Každý obsah zakonči krokom: čo má čitateľ urobiť teraz a čo preňho vieš urobiť ty. Autorita bez ponuky je koníček, nie podnikanie.",
      "Prekladaj: každú odbornú vetu prepíš tak, aby jej rozumel zákazník bez tvojho vzdelania. Zrozumiteľnosť autoritu zvyšuje, nie znižuje.",
      "Daj rozhodnutiam termín: čo nerozhodneš do stanoveného dňa, rozhodni podľa najlepšieho dostupného odhadu a napíš si, čo si sa tým dozvedel.",
      "Ukazuj aj závery, ktoré sa ti nehodia. Nič nebuduje dôveru rýchlejšie než značka, ktorá prizná, kde jej riešenie nie je najlepšia voľba.",
    ],
    priklady: "Harvard, McKinsey, National Geographic, kvalitné odborné médiá",
    sekundarniRole:
      "Ako druhý v poradí dodáva značke hĺbku a dôveryhodnosť: podkladá sľuby primárneho archetypu dátami a chráni firmu pred rozhodnutiami z nadšenia.",
  },

  hrdina: {
    nazev: "Hrdina",
    puvodni: "Hero",
    motto: "Kde je vôľa, tam je cesta.",
    touha: "dokázať svoju hodnotu odvážnym a náročným činom",
    strach: "slabosť, zlyhanie a zbabelosť",
    dar: "kompetencia, odvaha a disciplína",
    podstata:
      "Tvoj svet má latky a ty ich {rád|rada} zdolávaš. Prekážka ťa nabudí, konkurencia ťa prebúdza a najlepšie pracuješ, keď je jasné, čo znamená vyhrať. Nejde ti o pohodlie ani o potlesk; ide ti o dôkaz, že sa to dá, podaný výkonom, nie rečami. Značky Hrdinu pozývajú zákazníka hore: nekupuješ topánku, kupuješ vôľu vstať o šiestej ráno. Tvoja komunikácia má ťah: hovorí o výzvach, nie o vlastnostiach produktu, a sľubuje, že s tebou zákazník dokáže viac, než si o sebe myslí. Hrdina je najčitateľnejší archetyp, pretože jeho príbeh pozná každý: výzva, drina, víťazstvo. Tvoje riziko je, že bez pretekov nevieš žiť; keď chýba protivník, vyrobíš si ho, pokojne vo vlastnom tíme, a odpočinok cítiš ako slabosť, kým ťa nezastaví telo.",
    vPodnikani:
      "Vo firme si motor: dvíhaš ciele, ideš vpredu a meriaš výsledky. Tvoja značka má vyzývať: kampane stavaj na prekonaní, porovnaní a merateľnom zlepšení, nie na pohodlí. Sadne ti šport, výkonové služby, B2B, kde sa dá doložiť výsledok číslom, a všetky trhy, kde zákazník chce byť lepšou verziou seba. Pozor na tím: nie každý je Hrdina a ľudia, ktorí tvoje preteky nezdieľajú, nie sú leniví. Firma len z Hrdinov vyhorí; potrebuješ vedľa seba opatrovateľov a tvorcov, ktorí držia zázemie.",
    stin:
      "Tieňom Hrdinu je arogancia a večná vojna. Pod tlakom začneš vidieť nepriateľov aj tam, kde nie sú: konkurencia je zlo, kritik je zradca, pomalší kolega je brzda. Druhá podoba tieňa je neschopnosť priznať slabosť; o problémoch sa nehovorí, pretože hovoriť o nich znamená zlyhať, a tak sa o nich dozvieš, až keď buchnú. Tretia je workoholizmus predvádzaný ako cnosť, ktorý vyčerpá teba aj tvoj tím.",
    pasti:
      "Hlavná pasca značky Hrdinu je kričiaca nadradenosť: samé naj a číslo jeden, ktorému nikto neverí. Druhá pasca je zákazník ako divák, pretože hrdinom príbehu má byť on, nie ty. Tretia je porovnávanie sa s konkurenciou také okaté, že jej robíš reklamu.",
    navod: [
      "Urob hrdinom zákazníka: tvoja značka je tréner a výstroj, nie víťaz. Prípadové štúdie píš ako jeho príbeh, seba nechaj v role sprievodcu.",
      "Postav komunikáciu na merateľnej výzve: konkrétne číslo, konkrétny termín, verejný záväzok. Nič nepredáva Hrdinu lepšie než doložený výsledok.",
      "Priznaj prehry: jedna poctivo rozobraná prehra ročne urobí pre dôveryhodnosť viac než desať víťazstiev.",
      "Nastav si protiváhu: človeka alebo rituál, ktorý má právo povedať dosť, keď ženieš seba alebo tím cez hranu. Odpočinok plánuj ako tréning.",
      "Vyberaj si preteky: dve tri bitky ročne, ktoré stoja za plnú silu, a zvyšok nechaj plávať. Hrdina, ktorý bojuje so všetkým, nevyhrá nič.",
    ],
    priklady: "Nike, FedEx, Under Armour, armádny nábor",
    sekundarniRole:
      "Ako druhý v poradí dodáva značke ťah a súťaživosť: primárnemu archetypu pridáva disciplínu, merateľné ciele a ochotu ísť do ťažkých vecí.",
  },

  rebel: {
    nazev: "Rebel",
    puvodni: "Outlaw",
    motto: "Pravidlá sú na to, aby sa porušovali.",
    touha: "revolúcia: zbúrať, čo nefunguje",
    strach: "bezmocnosť a priemernosť",
    dar: "radikálna sloboda a odvaha ísť proti všetkým",
    podstata:
      "Tvoja energia pochádza z nesúhlasu. Vidíš, čo je v odbore zhnité, čo si zákazníci nechávajú páčiť a čo všetci mlčky tolerujú, a nemôžeš pri tom zostať. Tam, kde sa ostatní odlišujú o päť percent, ty ideš principiálne proti. Značky Rebela nevznikajú pre všetkých; vznikajú pre ľudí, ktorí sa v zavedenom svete necítia doma, a práve preto budujú najvernejšie kmene na trhu. Kto miluje Harley alebo raný Apple, nemiluje produkt, ale vzburu, ktorú s ním môže nosiť. Tvoja sila je aj tvoje riziko: provokácia bez pozitívneho programu je len hluk a búranie bez náhrady zanechá spúšť. Najlepší Rebeli nie sú tí, ktorí najhlasnejšie kričia, ale tí, ktorí skutočne zmenili pravidlá trhu tak, že sa už nikdy nevrátili späť.",
    vPodnikani:
      "Vo firme si {ničiteľ|ničiteľka} posvätných kráv: spochybňuješ cenníky, zvyklosti odboru aj vlastné procesy. Tvoja značka má jasne hovoriť, proti čomu stojí; nepriateľ (praktika, nie konkrétna firma) je tvoj najsilnejší marketingový nástroj. Sadnú ti trhy s unavenými zákazníkmi a arogantnými hráčmi: banky, telekomunikácie, poistenie, všade tam pôsobí priamy, drzý hlas ako zjavenie. Vnútorne potrebuješ viac poriadku, než pripúšťaš: revolúcia vonku vyžaduje disciplínu vnútri, inak sa firma rozpadne skôr, než trh dobyje.",
    stin:
      "Tieňom Rebela je deštrukcia pre deštrukciu. Pod tlakom sa vzbura odtrhne od zmyslu: provokuješ, aj keď to veci nepomáha, a búraš aj to, čo funguje, len preto, že si to nevymyslel ty. Druhá podoba tieňa je večný odpor, teda neschopnosť prijať akúkoľvek autoritu vrátane vlastných pravidiel, kvôli ktorej sa firma nedá riadiť. A pozor na cynizmus: Rebel, ktorý už neverí, že sa dá niečo zmeniť, vie len ubližovať.",
    pasti:
      "Hlavná pasca je provokácia ako samoúčel: šok, ktorý nenesie žiadny postoj, publikum rýchlo prekukne. Druhá pasca je vzbura na povrchu a konformita vnútri, teda drzá kampaň nad úplne obyčajným produktom. Tretia je útok na konkrétnych ľudí namiesto praktík; tým sa z rebela stáva grobian.",
    navod: [
      "Pomenuj nepriateľa presne: praktiku, nie osobu. Spíš manifest o tom, čo v odbore odmietaš robiť, a zverejni ho ako záväzok, nie ako reklamu.",
      "Každú provokáciu podlož zmenou v produkte: čo robíš skutočne inak, nech to vidno, dá sa zmerať a vyskúšať. Vzbura musí byť doložiteľná.",
      "Buduj kmeň, nie publikum: daj svojim ľuďom meno, znak a prístup dovnútra. Rebeli rastú cez spolupatričnosť tých, ktorí stoja proti tomu istému.",
      "Rozdeľ role: ty búraš vonku, niekto poriadkumilovný stavia vnútri. Bez prevádzkového poriadku sa revolúcia zrúti do chaosu.",
      "Raz ročne si prejdi vlastné pravidlá otázkou: čo z toho, proti čomu som {bojoval|bojovala}, teraz {sám|sama} robím? Rebel, ktorý zostarol v establišment, je najsmutnejší koniec.",
    ],
    priklady: "Harley-Davidson, Virgin, Liquid Death, raný Apple",
    sekundarniRole:
      "Ako druhý v poradí dodáva značke drzosť a ostrie: primárnemu archetypu prepožičiava odvahu ísť proti odboru a priťahuje zákazníkov unavených mainstreamom.",
  },

  mag: {
    nazev: "Mág",
    puvodni: "Magician",
    motto: "Nemožné je len otázka postupu.",
    touha: "porozumieť zákonom sveta a premeniť víziu na skutočnosť",
    strach: "nezamýšľané následky vlastnej moci",
    dar: "vízia, intuícia a schopnosť premieňať",
    podstata:
      "Tvoje remeslo je premena. Vidíš spojenia, ktoré ostatným unikajú, a vieš vykresliť budúcnosť tak presvedčivo, že jej ľudia začnú veriť skôr, než existuje. Nepredávaš produkt, ale iný stav: zákazník k tebe prichádza v jednej situácii a odchádza v inej, a presne tak o svojej práci hovoríš. Mág je archetyp okamihu, keď sa z nemožného stane samozrejmosť: naozaj dobrá technológia, terapia, transformačný program alebo služba, po ktorej si zákazník povie, ako som mohol žiť bez tohto. Tvoja sila stojí na dôvere, a preto je tvoja zodpovednosť väčšia než pri iných archetypoch: kto vie premieňať, vie aj manipulovať, a hranica medzi víziou a sľubom, ktorý sa nedá splniť, je tenká. Najlepší Mágovia dodávajú o kúsok viac premeny, než sľúbili, a nikdy naopak.",
    vPodnikani:
      "Vo firme si {vizionár|vizionárka} a katalyzátor: spájaš ľudí, odbory a nápady a z ich prieniku vzniká nové. Tvoja značka má predávať premenu, nie parametre: pred a po, príbehy klientov, u ktorých sa niečo skutočne zlomilo. Sadnú ti technológie, vzdelávanie, terapia a rozvoj, wellness, inovácie: všade tam, kde zákazník chce iný život, nie len lepší nástroj. Tvoje riziko je dodávka: vízia beží rýchlejšie než realita, preto potrebuješ vedľa seba ľudí, ktorí počítajú a doťahujú.",
    stin:
      "Tieňom Mága je manipulácia. Pod tlakom začneš používať svoju presvedčivosť na to, aby ľudia robili, čo potrebuješ ty, a rozdiel medzi vedením a ovládaním sa rozmaže. Druhá podoba tieňa je odtrhnutie od reality: sľuby rastú, dodávka pokrivkáva a okolo značky sa hromadia sklamaní, ktorí uverili. Tretia je mesiášstvo, teda pocit, že kto nevidí tvoju víziu, je slepý, a kritika je útok nechápajúcich.",
    pasti:
      "Hlavná pasca je sľub bez dôkazu: veľké slová o premene, pod ktorými nie je jediný overiteľný výsledok; na tom dnes trh spozná šarlatána za minútu. Druhá pasca je hmlenie odborným alebo duchovným žargónom. Tretia je pohŕdanie drobnou, poctivou dodávkou, bez ktorej sa žiadna vízia nedožije rána.",
    navod: [
      "Dokumentuj premeny: merateľné pred a po, menovití klienti, overiteľné výsledky. Každý sľub, ktorý nemá dôkaz, prepíš na menší, alebo ho zmaž.",
      "Sľúb menej, dodaj viac: nastav očakávania o stupeň nižšie, než kam mieriš. Prekvapenie navyše buduje povesť Mága, sklamanie ju ničí trvalo.",
      "Postav okolo seba dodávku: prevádzkového človeka s právom veta, čísla raz týždenne na stole. Vízia bez počtov je hazard s cudzou dôverou.",
      "Uč zákazníka svojmu postupu: čím otvorenejšie ukážeš, ako premena funguje, tým menej pôsobíš ako trik a tým vyššiu cenu si smieš pýtať.",
      "Ošetri moc: pravidelne si polož otázku, či klient tvoje vedenie ešte potrebuje, alebo už len poslúcha. Cieľom Mága je zákazník, ktorý ho prerastie.",
    ],
    priklady: "Disney, Tesla v raných rokoch, Dyson, transformačné vzdelávanie",
    sekundarniRole:
      "Ako druhý v poradí dodáva značke víziu a prísľub premeny: dvíha primárny archetyp z remesla k významu a dáva firme smer, ktorý presahuje cenník.",
  },

  "jeden-z-nas": {
    nazev: "Jeden z nás",
    puvodni: "Regular Guy / Regular Gal",
    motto: "Sme rovnakí ako vy.",
    touha: "patriť medzi ľudí a byť {prijímaný|prijímaná} {taký|taká}, {aký|aká} som",
    strach: "vyčnievať, povyšovať sa a byť za to vylúčený",
    dar: "realizmus, empatia a úplná absencia pretvárky",
    podstata:
      "Tvoja sila je v tom, že sa nepovyšuješ. Hovoríš jazykom svojich zákazníkov, poznáš ich starosti z prvej ruky a nikdy im nedáš pocit, že sú hlúpi alebo málo nóbl. Značky tohto archetypu stoja na férovosti a sedliackom rozume: dobrá práca, poctivá cena, žiadne pozlátko, žiadne reči. V dobe, keď sa každá druhá značka tvári prémiovo, je obyčajnosť paradoxne odlišnosť: zákazník si u teba vydýchne, že nemusí nič predstierať ani dešifrovať. Buduješ vzťah rovného s rovným, a preto ti ľudia odpúšťajú chyby, ktoré by inde neodpustili, ak ich priznáš po ľudsky. Tvoje riziko je neviditeľnosť: kto nikdy nevyčnieva, toho si trh nevšimne, a skromnosť sa ľahko stane výhovorkou, prečo nezdvihnúť ceny ani hlas.",
    vPodnikani:
      "Vo firme si tmel: {prístupný|prístupná} {šéf|šéfka}, {ktorý|ktorá} sa nehrá na {riaditeľa|riaditeľku}, a značka, ktorá sa nehrá na viac, než je. Komunikuj civilne: skutoční zákazníci, skutočné situácie, žiadni modeli s belostným úsmevom. Sadnú ti služby dennej potreby, remeslá, rodinné firmy, regionálne značky a všetko, kde si zákazník vyberá podľa dôvery, nie podľa prestíže. Tvoje ceny majú byť férové, nie najnižšie; obyčajnosť nie je synonymum lacnoty a podliezanie cenou ťa pripraví o maržu aj o hrdosť.",
    stin:
      "Tieňom tohto archetypu je rozpustenie. Zo strachu vyčnievať obrusuješ všetko, čím sa líšiš: názor radšej nepovieš, cenu radšej nezdvihneš, novinku radšej odložíš, kým to urobia ostatní. Firma potom splynie s davom, ku ktorému chcela patriť. Druhá podoba tieňa je nedôvera k úspechu: vlastný rast ťa znepokojuje, pretože z teba robí niekoho, kto už nie je jeden z nás, a tak ho podvedome brzdíš.",
    pasti:
      "Hlavná pasca je zameniteľnosť: bez jediného výrazného rysu sa staneš komoditou, ktorú trh vyberá len podľa ceny. Druhá pasca je hraná ľudovosť, na ktorú zákazník príde okamžite, zvlášť keď ju robí firma, ktorá ľudová nie je. Tretia je podceňovanie dizajnu a formy, pretože obyčajné neznamená odbité.",
    navod: [
      "Nájdi jednu vec, v ktorej si dovolíš vyčnievať, a drž ju: poznávací znak, službu navyše, názor. Jeden z nás s jednou zvláštnosťou je nezabudnuteľný.",
      "Postav marketing na skutočných zákazníkoch: ich slová, fotky a príbehy s minimom úprav. Referencia od suseda je tvoje najsilnejšie médium.",
      "Píš, ako hovoríš: každú vetu, ktorú by si {nepovedal|nepovedala} zákazníkovi do očí pri pulte, škrtni.",
      "Nastav férovú cenu a stoj za ňou: vysvetli, čo v nej je, a nezľavuj zo strachu. Férovosť znamená priehľadnosť, nie lacnotu.",
      "Priznávaj chyby po ľudsky a rýchlo: čo sa stalo, čo s tým robíš, čo dostane zákazník. Práve tu sa buduje vernosť, ktorú prestíž nikdy nezíska.",
    ],
    priklady: "IKEA, Lidl v komunikácii s humorom, remeselné a rodinné firmy, Baťa v ľudovej ére",
    sekundarniRole:
      "Ako druhý v poradí dodáva značke ľudskosť a prístupnosť: sťahuje primárny archetyp z piedestálu k zákazníkovi a stráži zrozumiteľnosť komunikácie.",
  },

  milenec: {
    nazev: "Milenec",
    puvodni: "Lover",
    motto: "Záleží mi na tebe.",
    touha: "blízkosť, krása a zmyslový zážitok",
    strach: "byť nechcený a nemilovaný",
    dar: "vášeň, vďačnosť a cit pre krásu",
    podstata:
      "Tvoja značka je vzťah. Nejde ti o transakcie, ale o to, aby sa zákazník cítil vybraný, hýčkaný a výnimočný, a aby všetko, na čo u teba siahne, bolo krásne: produkt, obal, priestor, tón hlasu, aj spôsob, akým riešiš reklamáciu. Milenec robí z nakupovania zážitok a zo zákazníkov oddaných milovníkov značky; tam, kde iní počítajú konverzie, ty pestuješ náklonnosť. Máš cit pre atmosféru a detail, ktorý sa nedá naučiť z príručky, a vášeň, ktorá je nákazlivá: o tom, čo robíš, hovoríš tak, že ľudia chcú byť pri tom. Tvoje riziko je závislosť od priazne: ľahostajnosť alebo kritika ťa zasahujú osobne, a potreba páčiť sa ti môže brať schopnosť hovoriť nepríjemné pravdy, účtovať si dôstojné ceny a púšťať zákazníkov, ktorí ti škodia.",
    vPodnikani:
      "Vo firme si {strážca|strážkyňa} zážitku: nikto nesmie von nič, čo nie je krásne a osobné. Tvoja značka má zvádzať: zmyslové fotografie, starostlivý jazyk, obradnosť v maličkostiach, ako je balenie, vôňa, ručne písaný lístok. Sadne ti gastronómia, móda, kozmetika, dizajn, pohostinstvo, svadby a všetky trhy, kde si zákazník kupuje potešenie a vzťah, nie úžitok. Meraj si vernosť a odporúčania, nie len predaj: tvoja ekonomika stojí na zákazníkoch, ktorí sa vracajú a privádzajú ďalších, pretože milovať tvoju značku je súčasť ich identity.",
    stin:
      "Tieňom Milenca je strata seba v túžbe páčiť sa. Pod tlakom sľubuješ všetkým všetko, znášaš klientov, ktorí ťa vysávajú, a nedokážeš zdvihnúť ceny, pretože odmietnutie bolí ako osobná zrada. Druhá podoba tieňa je žiarlivosť na vlastný tím a značku: všetko musí prejsť tebou, pretože nikto iný to neurobí s láskou, a firma sa zadrie na tvojej kapacite. Tretia je forma nad obsahom, teda krása, pod ktorou chýba spoľahlivosť.",
    pasti:
      "Hlavná pasca je krása bez chrbtice: značka, ktorá sa chce páčiť všetkým, stráca tvar aj maržu. Druhá pasca je presladenosť, pretože vášeň bez štipky soli pôsobí ako gýč. Tretia je osobné vyčerpanie: vzťahová značka postavená len na tebe neškáluje a jej zakladateľ vyhorí prvý.",
    navod: [
      "Definuj zmyslový podpis značky: ako vyzerá, znie, vonia a akým tónom hovorí, a premietni ho do všetkého od webu po faktúru. Konzistencia je pri kráse všetko.",
      "Ritualizuj starostlivosť: okamih navyše, ktorý zákazník nečaká (balenie, odkaz, pozornosť k výročiu), zabuduj do procesu, nech nezávisí od tvojej nálady.",
      "Nauč sa hovoriť nie: definuj zákazníka, ktorého nechceš, a drž to. Vzťah bez hraníc nie je láska, ale sebazničenie, v podnikaní rovnako ako v živote.",
      "Cenu postav na výnimočnosti zážitku a neospravedlňuj ju: kto predáva lásku k značke, nesúťaží s cenníkom supermarketu.",
      "Odovzdaj starostlivosť ďalej: spíš, čo robí tvoj dotyk tvojím, a nauč to tím. Značka miluje zákazníka ako celok, nie len cez teba.",
    ],
    priklady: "Chanel, Godiva, Häagen-Dazs, butiková pohostinnosť",
    sekundarniRole:
      "Ako druhý v poradí dodáva značke vrelosť a estetiku: primárnemu archetypu pridáva starostlivosť o detail a vzťah, vďaka ktorému sa zákazníci vracajú.",
  },

  sprymar: {
    nazev: "Šprýmar",
    puvodni: "Jester",
    motto: "Keď to nie je zábava, robíme to zle.",
    touha: "žiť naplno tu a teraz",
    strach: "nuda a bezvýznamnosť",
    dar: "radosť, ľahkosť a odzbrojujúca úprimnosť",
    podstata:
      "Tvoja zbraň je ľahkosť. Vieš vziať vážnu vec a podať ju tak, že pri nej ľudia zostanú; vieš prelomiť formálnosť, zhodiť napätie a povedať pravdu, ktorú by iný neustál, pretože ju hovoríš s úsmevom. Šprýmar je archetyp dvorného blázna: jediného, kto smie hovoriť kráľovi pravdu. Značky tohto archetypu si ľudia púšťajú bližšie, pretože ich bavia, a zábava je najrýchlejšia skratka k zapamätaniu: vtipná kampaň sa šíri sama, nudná potrebuje rozpočet. Tvoje riziko je dvojaké: humor bez remesla je trápnosť, a humor ako útek znamená, že vtipom uhýbaš pred rozhodnutiami, konfliktmi a číslami, ktoré nie sú na smiech. Najlepší Šprýmari sú vzadu smrteľne vážni profesionáli; práve preto si tú ľahkosť vonku môžu dovoliť.",
    vPodnikani:
      "Vo firme si zdroj energie: odľahčuješ porady, búraš zbytočnú formálnosť a robíš z práce miesto, kam ľudia chodia radi. Tvoja značka má baviť: hravý jazyk, kampane s pointou, odvaha vystreliť si zo seba aj z odboru. Sadnú ti trhy s nudnou alebo strojenou konkurenciou, kde je vtip okamžitá odlišnosť: nápoje, drogéria, telekomunikácie, ale aj poistenie alebo účtovníctvo, ak unesieš kontrast. Humor si dopraj na povrchu, disciplínu drž vnútri: sľuby, termíny a čísla nesmú byť na smiech nikdy.",
    stin:
      "Tieňom Šprýmara je útek. Pod tlakom obrátiš na žart aj to, čo žart nie je: zlé čísla, konflikt v tíme, vlastnú únavu, a rozhodnutie, ktoré bolí, odkladáš ďalšou historkou. Druhá podoba tieňa je humor ako zbraň: irónia, ktorá zraňuje, a zhadzovanie, ktoré si okolie nedovolí vrátiť. Tretia je závislosť od publika, teda neschopnosť fungovať bez potlesku a tichá panika, keď sa nikto nesmeje.",
    pasti:
      "Hlavná pasca je vtip bez značky: kampaň, ktorú si všetci pamätajú, ale nikto nevie, čia bola. Druhá pasca je humor na účet zákazníka; smiať sa s ním je zlato, smiať sa mu je koniec. Tretia je nedôveryhodnosť: kto len zabáva, tomu sa nezverí vážna zákazka, takže vtip musí stáť na viditeľnom remesle.",
    navod: [
      "Ujasni si, čomu sa u vás nikto smiať nesmie: kvalita, termíny, bezpečie, peniaze zákazníka. Zvyšok si užívaj naplno; hranica robí humor bezpečným.",
      "Vtip vždy zapoj do značky: pointa má niesť tvoje meno, tvoj produkt alebo tvoj postoj, inak zabávaš trh za vlastné peniaze.",
      "Smej sa najprv sebe: sebairónia odzbrojuje a dáva ti právo robiť si žarty z odboru. Nikdy z konkrétneho zákazníka.",
      "Postav vedľa seba vážneho partnera pre čísla a konflikty a dohodni si s ním signál pre chvíle, keď vtipom utekáš namiesto riešiš.",
      "Testuj humor na malom publiku skôr, než ho pustíš von: čo je na smiech na porade, nemusí byť na smiech na trhu, a zmazaný príspevok sa maže ťažšie, než sa zdá.",
    ],
    priklady: "M&M's, Old Spice, Fanta, Kofola v hravých kampaniach",
    sekundarniRole:
      "Ako druhý v poradí dodáva značke šarm a zapamätateľnosť: odľahčuje vážnosť primárneho archetypu a otvára dvere tam, kde by samotná vážnosť narazila.",
  },

  pecovatel: {
    nazev: "Opatrovateľ",
    puvodni: "Caregiver",
    motto: "Postaráme sa o vás.",
    touha: "chrániť druhých a pomáhať im",
    strach: "sebectvo a nevďak; že sa o niekoho nepostará",
    dar: "súcit, štedrosť a spoľahlivosť",
    podstata:
      "Tvoje podnikanie je starostlivosť. Nepodnikáš, aby si {vyhral|vyhrala} alebo {zažiaril|zažiarila}, ale aby sa ľudia okolo teba mali dobre: zákazníci, tím, rodina. Vidíš potreby skôr, než ich niekto vysloví, a služby staviaš tak, aby zákazníka nič nezaskočilo a nič ho nebolelo. Značky Opatrovateľa sú prístav: volia sa vo chvíľach, keď ide o veľa (zdravie, deti, peniaze, bezpečie), pretože vyžarujú istotu, že tu ma nenechajú v štichu. Dôvera, ktorú budujete, je najtrvalejšie aktívum na trhu: neodchádza sa od nej kvôli piatim percentám zľavy. Tvoje riziko je sebaobetovanie: dávaš viac, než je udržateľné, nevieš účtovať za všetku tú starostlivosť navyše a hranica medzi službou a posluhovaním sa ti stráca. Vyčerpaný Opatrovateľ je potom horký, a horkosť je opatrujúcej značke smrteľná.",
    vPodnikani:
      "Vo firme si {ochranca|ochrankyňa}: {šéf|šéfka}, za {ktorým|ktorou} sa chodí s problémami, a značka, pri ktorej sa zákazník nemusí báť. Komunikuj istotou: garancie, jasné postupy pre prípad ťažkostí, dostupná podpora s ľudským hlasom. Sadne ti zdravotníctvo a starostlivosť, financie a poistenie, vzdelávanie detí, služby pre domácnosť, B2B servis: všade, kde si zákazník kupuje pokoj. Nauč sa starostlivosť účtovať: pomenuj ju v ponuke ako službu s cenou, pretože čo je zadarmo a neviditeľné, to si zákazník neuvedomí a trh neocení.",
    stin:
      "Tieňom Opatrovateľa je mučeníctvo. Pod tlakom dávaš ďalej aj to, čo nemáš: neúčtované hodiny, víkendy, vlastné zdravie, a začneš potichu počítať krivdy. Zo starostlivosti sa stane tichý nárok na vďačnosť, a keď neprichádza, príde horkosť alebo vyčítanie. Druhá podoba tieňa je starostlivosť ako kontrola: rozhoduješ za zákazníkov aj za tím, pretože ty predsa vieš najlepšie, čo potrebujú, a berieš im tým dospelosť.",
    pasti:
      "Hlavná pasca je neviditeľná práca: služby navyše, ktoré nikto neobjednal, nikto nezaplatil a nikto si ich nevšimol. Druhá pasca je strach z ceny, teda podcenené sadzby z hanby účtovať si za pomoc. Tretia je vyčerpaný tím: opatrujúca značka, ktorej ľudia sú na dne, je rozpor, ktorý zákazník spozná.",
    navod: [
      "Spíš všetko, čo robíš nad rámec objednávky, a rozdeľ to: čo je súčasť značky (pomenuj a komunikuj), čo je platená služba (naceň a ponúkaj), čo rušíš.",
      "Komunikuj istotu konkrétne: čo garantuješ, ako rýchlo reaguješ, čo sa stane, keď sa niečo pokazí. Pokoj sa predáva detailmi, nie slovom starostlivosť.",
      "Nastav hranice starostlivosti písomne: dostupnosť, rozsah, cenu mimoriadností. Hranice nie sú zrada starostlivosti, sú podmienka jej udržateľnosti.",
      "Staraj sa o tím rovnako vážne ako o zákazníkov a meraj to: preťažený tím je pri opatrujúcej značke prvý zdroj rozbitej povesti.",
      "Nauč sa prijímať: vyžiadaj si referencie a odporúčania. Opatrovateľ, ktorý nevie prijať vďaku, pripravuje značku o jej najsilnejšie dôkazy.",
    ],
    priklady: "Volvo, Johnson & Johnson, poisťovne, rodinné lekárne",
    sekundarniRole:
      "Ako druhý v poradí dodáva značke bezpečie a ľudské teplo: primárnemu archetypu pridáva spoľahlivosť a vzťah, ktorý vydrží aj po chybe.",
  },

  tvurce: {
    nazev: "Tvorca",
    puvodni: "Creator",
    motto: "Čo si dokážeš predstaviť, dá sa vytvoriť.",
    touha: "vytvoriť niečo trvalej hodnoty",
    strach: "priemerná vízia a priemerné prevedenie",
    dar: "predstavivosť, remeslo a zmysel pre kvalitu",
    podstata:
      "Tvoje podnikanie je dielňa. Nepodnikáš primárne kvôli výhre ani kvôli ľuďom; podnikáš, pretože musíš tvoriť, a firma je tvoje médium. Spoznáš kvalitu na prvý dotyk, nekvalita ťa fyzicky ruší a šablóny ťa urážajú: radšej vytvoríš vlastnú kategóriu, než aby si {súťažil|súťažila} v cudzej. Značky Tvorcu sa spoznajú bez slov: majú rukopis, ktorý sa pozná bez loga, a priťahujú zákazníkov, ktorí sami tvoria alebo chcú nosiť prejav dobrého vkusu. Tvoja latka je tvoje bohatstvo aj tvoja pasca: vďaka nej vzniká práca, ktorá prežije trendy, ale tá istá latka vie zablokovať vydanie čohokoľvek, pretože ono to ešte nie je ono. Trh pritom neplatí za dokonalosť v šuplíku, platí za hotové veci, ktoré smeli von.",
    vPodnikani:
      "Vo firme si {autor|autorka} štandardu: definuješ, ako vyzerá dobre odvedená práca, a tvoje meno je zárukou prevedenia. Značku stavaj na rukopise: konzistentná estetika a remeselné detaily naprieč všetkým, čo ide von, a príbeh vzniku ako súčasť produktu; ľudia platia viac, keď vidia, ako vec vzniká a prečo práve takto. Sadne ti dizajn, architektúra, remeslá, obsah, softvér s dušou, gastronómia: každý trh, kde sa dá vyhrať prevedením. Tvoje čísla stráž dvakrát: Tvorcovia účtujú materiál a zabúdajú účtovať genialitu.",
    stin:
      "Tieňom Tvorcu je perfekcionizmus, ktorý dusí. Pod tlakom prestaneš púšťať veci von: všetko sa prepracováva, termíny kĺžu a tím sa učí, že nič nie je dosť dobré, takže prestane nosiť nápady. Druhá podoba tieňa je tvorba pre tvorbu: produkt krásny pre teba, ale míňajúci zákazníka, a pohŕdanie všetkým komerčným, ktoré z firmy robí drahý koníček. Tretia je autorská ješitnosť: kritika diela sa rovná útoku na teba.",
    pasti:
      "Hlavná pasca je nedodanie: krásne veci, ktoré svet nevidel, značku nestavajú. Druhá pasca je nezrozumiteľnosť, teda dielo, ktoré hovorí jazykom tvorcu, nie zákazníka. Tretia je podcenená cena: remeslo predávané za sadzbu montáže, pretože si nevieš naúčtovať myšlienku.",
    navod: [
      "Zaveď dve latky: majstrovskú pre vlajkové kusy a remeselne poctivú pre bežnú produkciu. Rozhoduj vopred, čo je čo, nech dokonalosť neblokuje prevádzku.",
      "Daj termínom rovnakú váhu ako kvalite: hotové a vydané poráža dokonalé a schované. Dátum vydania je súčasť diela.",
      "Predávaj príbeh vzniku: skice, materiály, rozhodnutia, zavrhnuté verzie. Zákazník platí za prevedenie viac, keď rozumie, čo v ňom je.",
      "Naceň myšlienku, nie hodiny: cena má odrážať hodnotu rukopisu. Kto účtuje ako montér, bude ako montér aj vnímaný.",
      "Oddeľ seba od diela: kritiku produktu prijímaj ako informáciu o produkte. Pomáha ritualizovať spätnú väzbu skôr, než je dielo hotové.",
    ],
    priklady: "Lego, Apple v ére dizajnu, Moleskine, remeselné manufaktúry",
    sekundarniRole:
      "Ako druhý v poradí dodáva značke rukopis a kvalitu prevedenia: primárnemu archetypu pridáva estetiku a remeslo, vďaka ktorým je vidieť a spoznať.",
  },

  vladce: {
    nazev: "Vládca",
    puvodni: "Ruler",
    motto: "Kto iný než my.",
    touha: "kontrola a prosperita: vybudovať a udržať poriadok",
    strach: "chaos a strata pozície",
    dar: "zodpovednosť, vodcovstvo a schopnosť budovať systémy",
    podstata:
      "Tvoja sila je poriadok. Tam, kde iní improvizujú, ty staviaš systém: pravidlá, štandardy a štruktúry, ktoré fungujú, aj keď práve nie si pri tom. Zodpovednosť ťa neťaží, sadne ti; rozhoduješ sa rýchlo a nesieš následky, a ľudia okolo teba to cítia ako istotu. Značky Vládcu sú prvá voľba, nie alternatíva: vyžarujú autoritu, prvotriednosť a stabilitu, a zákazník si nimi kupuje pokoj, že siahol po štandarde odboru, za ktorý sa nemusí nikomu ospravedlňovať. Vládca nestavia na novinkách, ale na pozícii: byť tým, podľa koho sa merajú ostatní. Tvoje riziko je kontrola: nevieš pustiť z ruky ani to, čo by iní urobili dosť dobre, a chaos, ktorý k rastu patrí, znášaš tak zle, že radšej rastieš pomalšie, než aby si ho {pripustil|pripustila}.",
    vPodnikani:
      "Vo firme si {architekt|architektka} poriadku: buduješ procesy, hierarchiu a nástupníctvo, a {mal|mala} by si ich budovať tak, aby firma vedela žiť bez teba. Značka má vyžarovať suverenitu: prémiový vzhľad bez výstrelkov, pokojný autoritatívny tón, žiadne podliezanie a žiadne zľavové výpredaje, ktoré pozíciu rozleptávajú. Sadne ti B2B, financie, právo, nehnuteľnosti, prémiové služby: trhy, kde zákazník platí za istotu a status. Tvoje ceny majú stáť hore a majú to uniesť: Vládca, ktorý súťaží cenou, popiera sám seba.",
    stin:
      "Tieňom Vládcu je tyrania. Pod tlakom uťahuješ kontrolu: mikromanažment, rozhodnutia len cez tvoj stôl, okolie, ktoré sa naučí mlčať, pretože nesúhlas sa trestá. Firma potom stojí a padá s tebou a informácie k tebe prestávajú tiecť. Druhá podoba tieňa je status nad vecnosť: imidž sa udržiava, aj keď realita zaostáva, a priznať problém sa rovná ohrozeniu trónu. Tretia je pohŕdanie malými: zákazníkmi, konkurentmi aj nápadmi, ktoré neprichádzajú zhora.",
    pasti:
      "Hlavná pasca je arogancia značky: komunikácia, z ktorej zákazník cíti, že je poctený, že smie nakúpiť. Druhá pasca je strnulosť, pretože pozícia sa bráni aj tam, kde trh už odišiel inam. Tretia je závislosť firmy od jednej hlavy: majestát bez nástupníctva je len odložený pád.",
    navod: [
      "Deleguj podľa pravidla rozhodnutia pod hranicu: urči sumu a typ rozhodnutí, ktoré tím robí bez teba, a hranicu každý kvartál zdvíhaj.",
      "Komunikuj pokojnou autoritou: menej superlatívov, viac dôkazov pozície, teda referencie, čísla, história. Vládca nekričí, Vládca konštatuje.",
      "Chráň cenovú hladinu: namiesto zliav pridávaj hodnotu. Jediná výpredajová kampaň vie rozleptať pozíciu budovanú roky.",
      "Zabuduj si prísun nepohodlnej pravdy: človeka alebo formát, kde ti tím smie beztrestne oponovať. Trón bez spätnej väzby padá bez varovania.",
      "Postav nástupníctvo ako projekt: napíš, čo všetko stojí len na tebe, a každý rok z toho zoznamu niečo škrtni. Skutočný Vládca buduje ríšu, ktorá ho prežije.",
    ],
    priklady: "Mercedes-Benz, Rolex, American Express, IBM v ére dominancie",
    sekundarniRole:
      "Ako druhý v poradí dodáva značke autoritu a pevnú ruku: primárnemu archetypu pridáva poriadok, štandardy a pozíciu, o ktorú sa dá oprieť rast.",
  },
}
