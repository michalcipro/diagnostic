// Slovenské znenie popisov dvojíc. Zrkadlí dvojice.ts kľúč po kľúči.
//
// Kľúče sa nesmú rozísť: keď v češtine pribudne dvojica, musí pribudnúť aj tu,
// inak sa slovenské vyhodnotenie pri tejto kombinácii vráti k češtine. Kontrolu
// robí scripts/test-vzorce-sk.cjs.

export const DVOJICE_SK: Record<string, string> = {
  // ---- odpojenie medzi sebou ----
  "01-02": "Strach zo straty sa tu stretáva s očakávaním zrady, a to je kombinácia, ktorá vzťah drží v trvalom napätí. Blízkosť potrebuješ a zároveň jej neveríš, takže sa strieda primknutie s ostražitosťou. Druhý pritom dostáva protichodné signály a jeho zmätená reakcia potom oboje potvrdí.",
  "01-03": "Tu sa zišiel strach, že ťa opustia, s pocitom, že ťa aj tak nikto naozaj nenasýti. Vzťah preto nemôže uspieť ani vtedy, keď vydrží: kým trvá, chýba v ňom blízkosť, a keby skončil, potvrdí sa strata. Odtiaľ pramení výber partnerov, ktorí sú nedostupní práve tak akurát.",
  "01-07": "Strach z opustenia a hanba sa navzájom vysvetľujú. Ak vnútri veríš, že je v tebe niečo chybné, potom je odchod druhého logický dôsledok, nie náhoda. Vzťah sa tým mení na čakanie na rozsudok, a čím viac na ňom záleží, tým je čakanie horšie.",
  "02-07": "Ostražitosť tu chráni hanbu. Keď si nikoho nepustíš bližšie, nikto neuvidí to, čo považuješ za chybu. Nedôvera preto nie je len obranou pred druhými, ale hlavne pred odhalením, a práve preto sa nedá vyvrátiť tým, že sa niekto osvedčí.",
  "03-04": "Prázdno v blízkych vzťahoch sa tu spája s pocitom, že nepatríš do skupiny. Chýba teda oboje: hĺbka aj príslušnosť. Osamelosť potom nemá kde skončiť, pretože ani jedna z obvyklých ciest, blízky človek alebo partia, ju nezmenší.",
  "03-07": "Emočný hlad a hanba tvoria kruh. Blízkosť potrebuješ, ale nemyslíš si, že si ju zaslúžiš, a preto si o ňu nepovieš. Keď potom nepríde, potvrdí sa oboje naraz: že jej nie je dosť a že je to tebou.",
  "04-07": "Tieto dva vzorce sa pletú, ale nie sú to isté a spolu sú obzvlášť ťažké. Vylúčenie sa hlási v skupinách, hanba v blízkosti. Keď bežia oba, nezostáva bezpečné miesto: v spoločnosti stojíš mimo a v dôvernom vzťahu čakáš odhalenie.",

  // ---- autonómia medzi sebou ----
  "05-06": "Sesterská dvojica. Zraniteľnosť hovorí, že svet je nebezpečný, závislosť hovorí, že naň nestačíš. Dohromady vzniká svet, v ktorom sa nedá bezpečne konať {sám|sama}, a preto sa rozhodnutia buď odkladajú, alebo prenášajú na druhých.",
  "05-08": "Nedôvera vo vlastný úsudok sa tu stretáva s očakávaním neúspechu. Riziko sa preto nevyhodnocuje, ale vylučuje. Výsledkom býva život, ktorý je menší, než aký by si {vedel|vedela} viesť, a zdanlivý dôkaz, že tvoje obavy boli na mieste.",
  "06-08": "Katastrofické scenáre tu obsluhujú očakávaný neúspech. Skôr než do niečoho ideš, máš dopredu predstavu, ako to dopadne zle, a tá predstava je živšia než akákoľvek doterajšia skúsenosť. Príprava sa potom mení na obranu.",

  // ---- odpojenie + autonómia ----
  "01-05": "Strach zo straty a nedôvera vo vlastné sily sa navzájom držia. Keď neveríš, že to zvládneš {sám|sama}, je odchod druhého existenčnou hrozbou, nie bolesťou. Vzťah potom neudržiava náklonnosť, ale nutnosť, a to je pre obe strany ťažké bremeno.",
  "02-05": "Neveríš ľuďom a zároveň sa bez nich nezaobídeš. To je vnútorný rozpor, ktorý stojí obrovské množstvo energie: potrebuješ oporu, a pritom ju musíš strážiť. Bezpečie sa nedostaví ani tam, kde by mohlo.",
  "03-05": "Emočný hlad a závislosť sa ľahko zamenia za lásku. Vzťah drží preto, že bez neho to nejde, a nie preto, že je v ňom dobre. Odtiaľ pramení zotrvávanie vo vzťahoch, ktoré dávno nefungujú.",
  "04-08": "Pocit, že nepatríš, sa tu stretáva s pocitom, že nestačíš. Skupina sa tým stáva dvojnásobne nebezpečná: nielenže tam nezapadneš, navyše sa tam pozná, čo nevieš. Vyhýbanie potom vyzerá ako voľba, ale voľba to nie je.",
  "06-07": "Očakávanie ohrozenia a hanba spolu tvoria opatrnosť, ktorá vyzerá ako povaha. Riziko nehrozí len zvonku, hrozí aj odhalením, a preto sa vyhýbaš dvakrát: nebezpečnej situácii aj situácii, kde by mohlo byť vidieť, ako ti je.",

  // ---- zameranie na druhých a hranice ----
  "01-09": "Prispôsobenie tu slúži ako poistka proti strate. Ustupuješ, aby si druhého {udržal|udržala}, a čím viac ustúpiš, tým menej z teba vo vzťahu zostane. Nakoniec zostáva vzťah, v ktorom nie si, a strach z jeho straty napriek tomu neklesol.",
  "05-09": "Keď neveríš vlastnému úsudku, je logické nechať rozhodovať druhých, a keď rozhodujú druhí, nemáš ako si úsudok vyskúšať. Kruh sa uzatvára a s každým ďalším rokom je ťažšie z neho vystúpiť.",
  "07-09": "Hanba tu dáva prispôsobeniu zmysel. Keď si myslíš, že {sám|sama} o sebe nestačíš, musíš si miesto vo vzťahu zaslúžiť tým, čo urobíš pre druhých. Vlastná potreba sa potom nejaví ako právo, ale ako drzosť.",
  "09-11": "Dva protiľahlé póly hranice v jednom človeku. Väčšinu času ustupuješ, a potom príde chvíľa, keď sa to zlomí do nároku alebo výbuchu. Zvonku to pôsobí nevypočítateľne, vnútri je to prosté: hnev, ktorý sa dlho nesmel ozvať, si nakoniec cestu nájde.",
  "03-11": "Nárok a impulz tu zakrývajú prázdno. Veci, výnimky a okamžité potešenie majú zaplniť niečo, na čo nestačia, pretože chýba blízkosť, nie odmena. Preto úľava nikdy nevydrží dlho.",
  "07-11": "Výnimočnosť je tu najčastejšie obranou pred hanbou. Navonok nárok a istota, vnútri presvedčenie, že nestačíš. Práve preto reaguješ na spochybnenie tak prudko: nejde o spor, ide o obranu.",

  // ---- doplnené dvojice, ktoré sa v praxi objavujú najčastejšie ----
  "07-08": "Hanba a očakávanie neúspechu sa pletú, ale nie sú to isté. Menejcennosť hovorí, že je chybné to, čo si; zlyhanie hovorí, že nestačí to, čo dokážeš. Keď bežia obe, nie je kam uhnúť: úspech nezdvihne pocit vlastnej hodnoty, pretože ten na výkone nestojí, a neúspech ho okamžite potvrdí.",
  "02-03": "Túžiš po blízkosti a zároveň čakáš zradu. To je vnútorný rozpor, ktorý drží vzťahy v polovici cesty: dosť blízko, aby boleli, nie dosť blízko, aby nasýtili. Otvoriť sa by znamenalo dať druhému do ruky presne to, čoho sa bojíš.",
  "01-04": "Strach zo straty sa tu spája s pocitom, že nikam nepatríš. Blízke vzťahy preto nesú celú váhu: nemáš širšie zázemie, na ktoré by sa dalo prepnúť, a tým sa každá hrozba odchodu zväčší.",
  "01-06": "Očakávaš katastrofu a zároveň stratu, a oboje sa spočíta do stálej pohotovosti. Meškanie, neprijatý hovor alebo zmena plánu sa okamžite čítajú v najhoršej možnej verzii. Úľava po vysvetlení vydrží krátko, pretože pohotovosť sa nevypína.",
  "02-04": "Nedôvera a pocit odlišnosti spolu držia človeka mimo skupinu veľmi spoľahlivo. Nepatríš a zároveň nemáš dôvod veriť tomu, kto ťa pozýva. Každé pozvanie sa tak stáva otázkou, čo je za tým.",
  "04-05": "Pocit, že nepatríš, sa stretáva s nedôverou vo vlastné sily. Skupina preto nie je len nepríjemná, je aj nebezpečná: {sám|sama} to neustojíš a oprieť sa nemáš o koho. Odtiaľ pramení silná väzba na jedného človeka, ktorý robí prostredníka medzi tebou a svetom.",
  "04-09": "Prispôsobenie je tu vstupenkou do skupiny. Kto nepatrí, musí si miesto zaslúžiť tým, že nebude robiť problémy. Cena je vysoká: patríš, ale nie ako ty {sám|sama}, a preto ani prijatie, ktoré príde, nezmenší pocit odlišnosti.",
  "03-08": "Prázdno vo vzťahoch sa tu zišlo s pocitom, že nestačíš vo výkone. Nezostáva oblasť, z ktorej by sa dala čerpať hodnota: doma sa necítiš {nasýtený|nasýtená}, v práci nie {dosť dobrý|dosť dobrá}. To je vyčerpávajúca kombinácia, ktorá býva pod dlhodobou únavou.",
  "05-07": "Nedôvera vo vlastné sily a hanba sa navzájom potvrdzujú. Keď si o sebe myslíš, že si {chybný|chybná}, je logické, že to {sám|sama} nezvládneš, a keď to {sám|sama} nezvládneš, potvrdí sa, že si {chybný|chybná}. Pomoc, ktorú prijmeš, pritom kruh utiahne, nie uvoľní.",
  "06-09": "Úzkosť a prispôsobenie sa tu spájajú do veľkej opatrnosti voči ľuďom. Konflikt je nebezpečný nielen preto, že by mohol niečo pokaziť, ale preto, že si nie si {istý|istá}, že by si jeho následky {ustál|ustála}. Ustupuješ teda skôr, než sa vôbec ukáže, o čo ide.",
  "08-09": "Neveríš si vo výkone a zároveň nevieš odmietnuť. Berieš si preto úlohy, o ktorých dopredu vieš, že ťa prerastú, a potom ich ťaháš {sám|sama}, pretože povedať si o pomoc by potvrdilo to najhoršie. Vyhorenie tadiaľto chodí veľmi ticho.",

  // ---- perfekcionizmus a jeho okolie ----
  "07-10": "Klasická dvojica. Výkon je tu pokusom vyrovnať hanbu: keby som {bol dosť dobrý|bola dosť dobrá}, možno by to chybné nebolo vidieť. Lenže latka sa posúva spolu s tebou, takže žiadny výsledok nestačí. Odtiaľ pramení úspech, z ktorého nemáš nič.",
  "08-10": "Vyzerá to ako protiklad a je to protiklad, ktorý sa ľahko plete. Zlyhanie znamená očakávať od seba príliš málo v porovnaní s ostatnými, perfekcionizmus príliš veľa v porovnaní s nedosiahnuteľnou métou. Keď bežia oba, ocitáš sa medzi mlynskými kameňmi: nároky hore, dôvera dole, a odpočinok si nezaslúžiš ani po dobrom výkone.",
  "04-10": "Výkon tu slúži ako vstupenka. Keď nepatríš, dá sa miesto v skupine kúpiť tým, čo dokážeš. Funguje to a zároveň nefunguje: uznanie príde, prijatie nie, pretože nepatrí tebe, ale tvojmu výsledku.",
  "09-10": "Vysoké nároky sa tu stretávajú s neschopnosťou odmietnuť. Berieš si viac, než unesie ktokoľvek, a potom to musíš urobiť dokonale. To je najrýchlejšia cesta k vyčerpaniu, akú tento test vie ukázať, a obvykle sa pozná až na tele.",
  "06-10": "Perfekcionizmus tu obsluhuje úzkosť. Kontrola nad detailmi má nahradiť istotu, ktorú nemáš, takže čím väčšia neistota, tým vyššie nároky. Úľava však nepríde, pretože kontrolovať sa dá vždy ešte niečo.",
  "03-10": "Za výkonom je tu citová prázdnota. Dosahovanie má zaplniť miesto, kde chýba blízkosť, a preto ani ten najväčší úspech nenasýti. Najskôr to obvykle odnesie vzťah, teda presne to, čo by pomohlo.",
  "10-11": "Nároky a nárokovosť sa tu spájajú do veľmi tvrdého nastavenia. Od seba chceš maximum a od okolia ohľady, a keď sa to nezíde, príde hnev. Najviac to dopadá na ľudí, ktorí sú najbližšie.",
  "05-10": "Perfekcionizmus tu kryje nedôveru vo vlastné sily. Keď si neveríš, musíš byť {pripravený|pripravená} lepšie než ostatní, a príprava nikdy nekončí. Zvonku to vyzerá ako svedomitosť, zvnútra je to strach.",
  "01-10": "Výkon tu drží vzťah pohromade. Niekde vnútri je rovnica, že ťa neopustia, kým budeš {dosť dobrý|dosť dobrá}, a preto sa latka nedá spustiť ani doma. Paradox je, že práve tempo a nároky vzťah nakoniec vyčerpajú.",
  "02-10": "Vysoké nároky tu slúžia ostražitosti. Kto je bez chyby, toho nie je za čo chytiť. Perfekcionizmus sa tak stáva obranou pred zraniteľnosťou, a preto sa tak ťažko púšťa.",
}
