// Popisy toho, co spolu dvojice vzorců dělá u sportovce.
//
// Stejná logika jako v dvojice.ts, jen v situacích, které tvoří sportovní
// život: sestava, koncovka, zranění, konec sezóny, kabina, trenér. Klíč je
// dvojice id seřazená vzestupně, tedy „01-07".
//
// Klíče se nesmí rozejít s dvojice.ts. Když v obecné verzi dvojice přibude
// a tady chybí, sportovní vyhodnocení se u ní vrátí k obecnému popisu.
// Rodové tvary jsou označené {mužský|ženský}.

export const DVOJICE_SPORT: Record<string, string> = {
  // ---- bezpečí ve vztazích mezi sebou ----
  "01-02": "Strach ze ztráty se tu potkává s očekáváním zrady, a to je kombinace, která drží vztah s trenérem i týmem v trvalém napětí. Potřebuješ jistotu a zároveň jí nevěříš, takže se střídá přimknutí s ostražitostí. Druhý dostává protichůdné signály a jeho zmatená reakce pak obojí potvrdí.",
  "01-03": "Sešel se tu strach, že o zázemí přijdeš, s pocitem, že tě stejně nikdo doopravdy nevidí. Vztah proto nemůže uspět ani tehdy, když vydrží: dokud trvá, chybí v něm pochopení, a kdyby skončil, potvrdí se ztráta. Odtud pramení vazba na lidi, kteří jsou dostupní právě tak akorát.",
  "01-07": "Strach ze ztráty a stud se navzájem vysvětlují. Pokud uvnitř věříš, že je v tobě něco vadného, pak je odchod trenéra nebo ztráta místa logický důsledek, ne shoda okolností. Sezóna se tím mění v čekání na rozsudek, a čím víc ti na místě záleží, tím je čekání horší.",
  "02-07": "Ostražitost tu chrání stud. Když si nikoho v kabině nepustíš blíž, nikdo neuvidí to, co považuješ za vadu. Nedůvěra proto není jen obranou před konkurencí, ale hlavně před odhalením, a právě proto se nedá vyvrátit tím, že se někdo osvědčí.",
  "03-04": "Prázdno v blízkých vztazích se tu spojuje s pocitem, že do kabiny nepatříš. Chybí tedy obojí: hloubka i příslušnost. Osamělost pak nemá kde skončit, protože ani jedna z obvyklých cest, blízký člověk nebo parta, ji nezmenší.",
  "03-07": "Emoční hlad a stud tvoří kruh. Pochopení potřebuješ, ale nemyslíš si, že si ho zasloužíš, a proto si o ně neřekneš. Když pak nepřijde, potvrdí se obojí naráz: že ho není dost a že je to tebou.",
  "04-07": "Tyhle dva vzorce se pletou, ale nejsou totéž a spolu jsou obzvlášť těžké. Pocit, že nepatříš, se hlásí ve skupině, stud v blízkosti. Když běží oba, nezbývá bezpečné místo: v kabině stojíš mimo a v důvěrném vztahu čekáš odhalení.",

  // ---- samostatnost mezi sebou ----
  "05-06": "Sesterská dvojice. Očekávané ohrožení říká, že hra je nebezpečná, závislost na vedení říká, že na ni {sám|sama} nestačíš. Dohromady vzniká prostředí, ve kterém se nedá bezpečně rozhodnout bez pokynu, a proto se rozhodnutí buď odkládají, nebo přenášejí na lavičku.",
  "05-08": "Nedůvěra ve vlastní úsudek se tu potkává s očekáváním neúspechu. Riziko se proto nevyhodnocuje, ale vylučuje. Výsledkem bývá kariéra, která je menší, než jakou bys {uměl|uměla} mít, a zdánlivý důkaz, že tvoje obavy byly na místě.",
  "06-08": "Katastrofické scénáře tu obsluhují očekávaný neúspěch. Než do zápasu vstoupíš, máš dopředu představu, jak to dopadne špatně, a ta představa je živější než jakákoli dosavadní zkušenost. Příprava se pak mění v obranu místo v ladění.",

  // ---- bezpečí a samostatnost dohromady ----
  "01-05": "Strach ze ztráty a nedůvěra ve vlastní síly se navzájem drží. Když nevěříš, že to zvládneš {sám|sama}, je odchod trenéra existenční hrozbou, ne bolestí. Vztah pak neudržuje důvěra, ale nutnost, a to je pro obě strany těžké břemeno.",
  "02-05": "Nevěříš lidem a zároveň se bez jejich vedení neobejdeš. To je vnitřní rozpor, který stojí obrovské množství energie: potřebuješ oporu, a přitom ji musíš hlídat. Bezpečí se nedostaví ani tam, kde by mohlo.",
  "03-05": "Emoční hlad a závislost na vedení se snadno zamění za dobrý vztah s trenérem. Vazba drží proto, že bez ní to nejde, a ne proto, že v ní je dobře. Odtud pramení setrvání v prostředí, které dávno nefunguje.",
  "04-08": "Pocit, že nepatříš, se tu potkává s pocitem, že nestačíš. Tým se tím stává dvojnásob nebezpečný: nejenže tam nezapadneš, navíc se tam pozná, co neumíš. Vyhýbání se pak tváří jako volba, ale volba to není.",
  "06-07": "Očekávání ohrožení a stud spolu tvoří opatrnost, která vypadá jako povaha. Riziko nehrozí jen ze hry, hrozí i odhalením, a proto se vyhýbáš dvakrát: nebezpečné situaci i situaci, kde by mohlo být vidět, jak ti je.",

  // ---- zaměření na druhé a hranice ----
  "01-09": "Přizpůsobení tu slouží jako pojistka proti ztrátě. Ustupuješ, abys místo {udržel|udržela}, a čím víc ustoupíš, tím míň z tebe v týmu zbude. Nakonec zůstává role, ve které nejsi ty, a strach z její ztráty přesto neklesl.",
  "05-09": "Když nevěříš vlastnímu úsudku, je logické nechat rozhodovat trenéra, a když rozhoduje trenér, nemáš jak si úsudek vyzkoušet. Kruh se uzavírá a s každou další sezónou je těžší z něj vystoupit.",
  "07-09": "Stud tu dává přizpůsobení smysl. Když si myslíš, že {sám|sama} o sobě nestačíš, musíš si místo v týmu zasloužit tím, co uděláš pro ostatní. Vlastní potřeba se pak nejeví jako právo, ale jako drzost.",
  "09-11": "Dva protilehlé póly hranice v jednom sportovci. Většinu času ustupuješ, a pak přijde chvíle, kdy se to zlomí do nároku nebo výbuchu, často na rozhodčího nebo spoluhráče. Zvenčí to působí nevypočitatelně, uvnitř je to prosté: hněv, který se dlouho nesměl ozvat, si najde cestu.",
  "03-11": "Nárok a impulz tu zakrývají prázdno. Výjimky, úlevy a okamžité potěšení mají zaplnit něco, na co nestačí, protože chybí pochopení, ne odměna. Proto úleva nikdy nevydrží dlouho.",
  "07-11": "Nárok na výjimku je tu nejčastěji obranou před studem. Navenek jistota a požadavky, uvnitř přesvědčení, že nestačíš. Právě proto reaguješ na zpochybnění tak prudce: nejde o spor o pravidlo, jde o obranu.",

  // ---- kombinace, které se v praxi objevují nejčastěji ----
  "07-08": "Stud a očekávání neúspěchu se pletou, ale nejsou totéž. Skrytá nedostatečnost říká, že je vadné to, co jsi; očekávané selhání říká, že nestačí to, co dokážeš. Když běží obojí, není kam uhnout: výsledek nezvedne pocit vlastní hodnoty a neúspěch ho okamžitě potvrdí.",
  "02-03": "Toužíš po pochopení a zároveň čekáš zradu. To je vnitřní rozpor, který drží vztahy v týmu v půli cesty: dost blízko, aby bolely, ne dost blízko, aby pomohly. Otevřít se by znamenalo dát druhému do ruky přesně to, čeho se bojíš.",
  "01-04": "Strach ze ztráty se tu pojí s pocitem, že nikam nepatříš. Jeden vztah proto nese celou váhu: nemáš širší zázemí, na které by se dalo přepnout, a tím se každá hrozba odchodu zvětší.",
  "01-06": "Očekáváš katastrofu a zároveň ztrátu, a obojí se sčítá do stálé pohotovosti. Zpoždění, nepřijatý hovor nebo změna programu se okamžitě čtou v nejhorší možné verzi. Úleva po vysvětlení vydrží krátce, protože pohotovost se nevypíná.",
  "02-04": "Nedůvěra a pocit odlišnosti spolu drží člověka mimo kabinu velmi spolehlivě. Nepatříš a zároveň nemáš důvod věřit tomu, kdo tě zve. Každé pozvání se tak stává otázkou, co za tím je.",
  "04-05": "Pocit, že nepatříš, se potkává s nedůvěrou ve vlastní síly. Tým proto není jen nepříjemný, je i nebezpečný: {sám|sama} to neustojíš a opřít se nemáš o koho. Odtud pramení silná vazba na jednoho člověka, který dělá prostředníka mezi tebou a zbytkem kabiny.",
  "04-09": "Přizpůsobení je tu vstupenkou do party. Kdo nepatří, musí si místo zasloužit tím, že nebude dělat problémy. Cena je vysoká: patříš, ale ne jako ty {sám|sama}, a proto ani přijetí, které přijde, nezmenší pocit odlišnosti.",
  "03-08": "Prázdno ve vztazích se tu sešlo s pocitem, že nestačíš ve výkonu. Nezbývá oblast, ze které by šla čerpat hodnota: v kabině se necítíš {viděný|viděná}, na hřišti ne dost {dobrý|dobrá}. To je vyčerpávající kombinace, která bývá pod dlouhodobou únavou.",
  "05-07": "Nedůvěra ve vlastní síly a stud se navzájem potvrzují. Když si o sobě myslíš, že jsi {vadný|vadná}, je logické, že to {sám|sama} nezvládneš, a když to {sám|sama} nezvládneš, potvrdí se, že jsi {vadný|vadná}. Pomoc, kterou přijmeš, přitom kruh utáhne, ne uvolní.",
  "06-09": "Úzkost a přizpůsobení se tu spojují do velké opatrnosti vůči lidem. Konflikt s trenérem je nebezpečný nejen proto, že by mohl něco zkazit, ale protože si nejsi {jistý|jistá}, že bys jeho následky {ustál|ustála}. Ustupuješ tedy dřív, než se vůbec ukáže, o co jde.",
  "08-09": "Nevěříš si ve výkonu a zároveň neumíš odmítnout. Bereš na sebe roli, o které dopředu víš, že tě přeroste, a pak ji táhneš {sám|sama}, protože říct si o pomoc by potvrdilo to nejhorší. Vyhoření i přetrénování tudy chodí velmi tiše.",

  // ---- neúprosná laťka a její okolí ----
  "07-10": "Klasická dvojice. Výkon je tu pokusem vyrovnat stud: kdybych {byl dost dobrý|byla dost dobrá}, možná by to vadné nebylo vidět. Jenže laťka se posouvá spolu s tebou, takže žádný výsledek nestačí. Odtud pramení kariéra, ze které nemáš radost.",
  "08-10": "Vypadá to jako protiklad a je to protiklad, který se snadno plete. Očekávané selhání znamená čekat od sebe příliš málo ve srovnání s ostatními, neúprosná laťka příliš mnoho ve srovnání s nedosažitelnou metou. Když běží oba, jsi mezi mlýnskými kameny: nároky nahoře, důvěra dole, a odpočinek si nezasloužíš ani po vítězství.",
  "04-10": "Výkon tu slouží jako vstupenka. Když nepatříš, dá se místo v kabině koupit tím, co dokážeš. Funguje to a zároveň nefunguje: uznání přijde, přijetí ne, protože nepatří tobě, ale tvému výsledku.",
  "09-10": "Vysoké nároky se tu potkávají s neschopností odmítnout. Bereš si víc zátěže, než unese kdokoli, a pak ji musíš odvést dokonale. To je nejrychlejší cesta k přetrénování, jakou tenhle test umí ukázat, a obvykle se pozná až na těle.",
  "06-10": "Neúprosná laťka tu obsluhuje úzkost. Kontrola nad detailem má nahradit jistotu, kterou nemáš, takže čím větší nejistota, tím přesnější rituály. Úleva ale nepřijde, protože kontrolovat se dá vždycky ještě něco.",
  "03-10": "Za výkonem je tu citová prázdnota. Dosahování má zaplnit místo, kde chybí blízkost, a proto ani ten největší úspěch nenasytí. Nejdřív to obvykle odnese vztah, tedy přesně to, co by pomohlo.",
  "10-11": "Nároky a nárokovost se tu spojují do velmi tvrdého nastavení. Od sebe chceš maximum a od týmu ohledy, a když se to nesejde, přijde vztek. Nejvíc to dopadá na lidi, kteří jsou nejblíž, tedy na spoluhráče a rodinu.",
  "05-10": "Neúprosná laťka tu kryje nedůvěru ve vlastní síly. Když si nevěříš, musíš být {připravený|připravená} lépe než ostatní, a příprava nikdy nekončí. Zvenčí to vypadá jako svědomitost, zevnitř je to strach.",
  "01-10": "Výkon tu drží vztahy pohromadě. Někde uvnitř je rovnice, že tě nepustí, dokud budeš {dost dobrý|dost dobrá}, a proto se laťka nedá spustit ani v přípravě. Paradox je, že právě tempo a nároky nakonec vyčerpají i vztahy, o které jde.",
  "02-10": "Vysoké nároky tu slouží ostražitosti. Kdo je bez chyby, toho není za co chytit a nikdo mu nesebere místo. Neúprosná laťka se tak stává obranou před zranitelností, a proto se tak těžko pouští.",
}
