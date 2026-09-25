"""Sestaví banku položek ELITE Pro z jednoho zdroje.

Zdroj je tady v kódu, výstupy jsou dva: banka-cs.json (data pro aplikaci
a analýzu) a banka-cs.md (k posouzení). Obojí se generuje, ručně se needituje.

Spuštění: python3 docs/novy-test/banka/sestav.py

Skript zároveň hlídá pravidla ze specifikace: 12 kandidátů na škálu, aspoň
3 obrácené, aspoň 3 zaměřené na soutěž, nejvýš 15 slov, žádná dlouhá pomlčka
a žádné tvary, které v češtině prozrazují rod.
"""

import json
import re
import sys
from pathlib import Path

ZDE = Path(__file__).parent

# Formát odpovědí: P = souhlas, C = četnost. Rámec: rys, 4t = posledních 4 týdnů.
# Položka: (text, směr, soutěž). Směr "+" nebo "-"; soutěž "S" nebo "".

SKALY = [
    # ---------------- MO: Motivace a identita ----------------
    ("MO.1", "autonomní motivace", "P", "rys", [
        ("Sport dělám hlavně proto, že mě baví.", "+", ""),
        ("Cíle ve sportu jsou moje vlastní.", "+", ""),
        ("Sport odpovídá tomu, kdo jsem a co je pro mě důležité.", "+", ""),
        ("Na trénink se těším i bez pobízení.", "+", ""),
        ("I bez odměn a uznání by mě sport táhl.", "+", ""),
        ("V náročném tréninku vidím smysl, i když je nepříjemný.", "+", ""),
        ("V soutěži mě nejvíc baví samotný zápas nebo závod.", "+", "S"),
        ("Na soutěže se těším kvůli pocitu z vlastního výkonu.", "+", "S"),
        ("Sport je pro mě hlavně povinnost.", "-", ""),
        ("Trénink mě většinou nudí.", "-", ""),
        ("Občas přemýšlím, jestli má sport pro mě ještě smysl.", "-", ""),
        ("Po soutěži cítím spíš úlevu, že je konec, než radost ze hry.", "-", "S"),
    ]),
    ("MO.2", "kontrolovaná motivace", "P", "rys", [
        ("Sportuji hlavně kvůli tomu, co ode mě čekají druzí.", "+", ""),
        ("Při představě, že skončím, mám pocit viny.", "+", ""),
        ("Když vynechám trénink, stydím se.", "+", ""),
        ("Sportem si hlavně dokazuji, že za něco stojím.", "+", ""),
        ("Hlavní důvod, proč sportuji, jsou peníze, výhody nebo postavení.", "+", ""),
        ("Do soutěže jdu hlavně s myšlenkou na očekávání trenéra a rodiny.", "+", "S"),
        ("Po špatné soutěži cítím hlavně vinu vůči druhým.", "+", "S"),
        ("Výhra je pro mě důležitá hlavně kvůli tomu, jak mě pak vidí okolí.", "+", "S"),
        ("Ke sportu mě vede jen vlastní chuť.", "-", ""),
        ("Co si o mé kariéře myslí druzí, mě v rozhodování ovlivňuje málo.", "-", ""),
        ("Vinu nebo stud kvůli vynechanému tréninku zažívám zřídka.", "-", ""),
        ("V soutěži sportuji pro sebe, bez ohledu na očekávání okolí.", "-", "S"),
    ]),
    ("MO.3", "úkolová orientace", "P", "rys", [
        ("Úspěšně se cítím, když se naučím něco nového.", "+", ""),
        ("Nejvíc mě těší, když zvládnu dovednost, na které dlouho pracuji.", "+", ""),
        ("Dobrý trénink poznám podle toho, že jsem dnes lepší než včera.", "+", ""),
        ("Úspěch pro mě znamená podat svůj nejlepší možný výkon.", "+", ""),
        ("Po soutěži hodnotím hlavně, jak se povedly věci, na kterých pracuji.", "+", "S"),
        ("I prohraná soutěž může být úspěch, pokud se v ní zlepšuji.", "+", "S"),
        ("V soutěži sleduji hlavně vlastní úkoly, skóre až potom.", "+", "S"),
        ("Když se něco zlepší, mám radost bez ohledu na výsledek.", "+", ""),
        ("Zlepšování je pro mě vedlejší.", "-", ""),
        ("Nová dovednost mě přestane bavit, jakmile je těžká.", "-", ""),
        ("Rozbor vlastního výkonu po soutěži přeskakuji.", "-", "S"),
        ("Vlastní pokrok sleduji jen zřídka.", "-", ""),
    ]),
    ("MO.4", "egová orientace", "P", "rys", [
        ("Úspěšně se cítím, když jsem lepší než ostatní.", "+", ""),
        ("Nejvíc mě těší porazit soupeře, o kterém se říká, že je lepší.", "+", "S"),
        ("Dobrý trénink poznám podle toho, že jsem nejlepší ze skupiny.", "+", ""),
        ("Je pro mě důležité, aby ostatní viděli, že patřím mezi nejlepší.", "+", ""),
        ("Po soutěži mě nejdřív zajímá moje pořadí mezi ostatními.", "+", "S"),
        ("V soutěži mě žene hlavně touha být před ostatními.", "+", "S"),
        ("Úspěch cítím, když ostatní chybují víc než já.", "+", "S"),
        ("Srovnávám se s ostatními i v tréninku.", "+", ""),
        ("Pořadí mezi ostatními je pro mě vedlejší.", "-", ""),
        ("Srovnávání s ostatními mě v tréninku nechává v klidu.", "-", ""),
        ("Po soutěži mě výsledky ostatních zajímají jen málo.", "-", "S"),
        ("V soutěži sleduji hlavně sebe, výkony ostatních málo.", "-", "S"),
    ]),
    ("MO.5", "výlučnost sportovní identity", "P", "rys", [
        ("Kdo jsem, stojí hlavně na sportu.", "+", ""),
        ("Většina mých myšlenek se točí kolem sportu.", "+", ""),
        ("Bez sportu si sebe představit neumím.", "+", ""),
        ("Většina mých přátel je ze sportu.", "+", ""),
        ("Špatný výkon v soutěži mi pokazí náladu na celý týden.", "+", "S"),
        ("Když se ve sportu daří špatně, cítím se špatně ve všem.", "+", ""),
        ("Sport je nejdůležitější část mého života.", "+", ""),
        ("Po prohře se opírám i o věci mimo sport.", "-", "S"),
        ("Mám důležité zájmy a vztahy mimo sport.", "-", ""),
        ("Kromě sportu mám další oblast, ve které se cítím dobře.", "-", ""),
        ("Kdyby přišlo dlouhé zranění, mám se o co mimo sport opřít.", "-", ""),
        ("Svou hodnotu jako člověka oddělím od výsledků v soutěži.", "-", "S"),
    ]),

    # ---------------- TL: Tlak ----------------
    ("TL.1", "tělesné napětí", "P", "rys", [
        ("Před důležitou soutěží mám sevřený žaludek.", "+", "S"),
        ("Před startem cítím napětí ve svalech.", "+", "S"),
        ("Před soutěží se mi zrychluje dech i tep víc, než potřebuji.", "+", "S"),
        ("Pod tlakem se mi třesou ruce nebo nohy.", "+", "S"),
        ("Před důležitou soutěží špatně jím.", "+", ""),
        ("V rozhodujících chvílích cítím, jak mi tuhne tělo.", "+", "S"),
        ("Před soutěží se mi potí dlaně.", "+", "S"),
        ("Noc před důležitou soutěží špatně spím kvůli napětí.", "+", ""),
        ("Před startem je moje tělo uvolněné.", "-", "S"),
        ("V rozhodujících momentech se mi dobře dýchá.", "-", "S"),
        ("Před důležitou soutěží jím a spím jako obvykle.", "-", ""),
        ("Pod tlakem zůstávají moje pohyby volné.", "-", "S"),
    ]),
    ("TL.2", "starosti", "P", "rys", [
        ("Před soutěží se mi v hlavě honí, co všechno se může pokazit.", "+", ""),
        ("Bojím se, že v soutěži podám slabý výkon.", "+", ""),
        ("Dny před důležitou soutěží myslím na možnou prohru.", "+", ""),
        ("Během soutěže se mi vracejí obavy z chyby.", "+", "S"),
        ("Mám strach, že pod tlakem všechno pokazím.", "+", "S"),
        ("Myšlenky na výsledek mě před soutěží zaměstnávají víc, než chci.", "+", ""),
        ("Při rozcvičce přemýšlím, co když to dnes nepůjde.", "+", "S"),
        ("Obavy z důležité soutěže mi vydrží i několik dní.", "+", ""),
        ("Před soutěží myslím hlavně na to, co udělám, obavy nechávám stranou.", "-", ""),
        ("Na soutěž se těším bez starostí o výsledek.", "-", ""),
        ("Během soutěže mě obavy nechávají na pokoji.", "-", "S"),
        ("Myšlenky na prohru mě před startem ruší jen zřídka.", "-", "S"),
    ]),
    ("TL.3", "narušení soustředění", "P", "rys", [
        ("Pod tlakem mi pozornost utíká od úkolu.", "+", "S"),
        ("V důležitých chvílích myslím na to, co si o mně myslí ostatní.", "+", "S"),
        ("Když jde o hodně, těžko se soustředím na pokyny trenéra.", "+", "S"),
        ("Během soutěže mě rozhodí publikum nebo dění kolem.", "+", "S"),
        ("V napjaté chvíli zapomenu, co jsme si domluvili.", "+", "S"),
        ("Pod tlakem se mi myšlenky rozutečou.", "+", "S"),
        ("V rozhodujícím okamžiku myslím na výsledek místo na akci.", "+", "S"),
        ("Při důležité soutěži mi v hlavě běží víc věcí najednou.", "+", "S"),
        ("I pod velkým tlakem vnímám jen to, co mám udělat.", "-", "S"),
        ("V rozhodujících chvílích slyším jen to, co potřebuji.", "-", "S"),
        ("Pokyny trenéra si v napjatých chvílích pamatuji přesně.", "-", "S"),
        ("Čím víc jde o výsledek, tím víc se soustředím na úkol.", "-", "S"),
    ]),
    ("TL.4", "výklad napětí", "P", "rys", [
        ("Napětí před soutěží mi pomáhá podat lepší výkon.", "+", ""),
        ("Nervozita před startem mi říká, že se tělo chystá na výkon.", "+", "S"),
        ("Rychlejší tep před startem mě nabudí.", "+", "S"),
        ("Trocha strachu před soutěží mi dodá ostrost.", "+", ""),
        ("V napjatém momentu mi napětí dodá energii.", "+", "S"),
        ("Motýlky v břiše před soutěží beru jako dobré znamení.", "+", ""),
        ("Tlak v rozhodujících chvílích mě vybičuje k lepšímu výkonu.", "+", "S"),
        ("Napětí v těle před soutěží je pro mě palivo.", "+", ""),
        ("Nervozita před startem mi výkon kazí.", "-", "S"),
        ("Když cítím napětí, bojím se, že mi svazuje pohyb.", "-", ""),
        ("Rychlý tep a sevřený žaludek beru jako špatné znamení.", "-", ""),
        ("V rozhodujících chvílích mě napětí brzdí.", "-", "S"),
    ]),
    ("TL.5", "obava ze studu a zklamání", "P", "rys", [
        ("Když selžu, bojím se, že se ztrapním před ostatními.", "+", ""),
        ("Po chybě v soutěži mám strach, co si o mně pomyslí diváci.", "+", "S"),
        ("Bojím se, že neúspěchem zklamu rodinu.", "+", ""),
        ("Bojím se, že po špatném výkonu o mě trenér ztratí zájem.", "+", ""),
        ("Selhání pro mě znamená, že si mě lidé budou vážit méně.", "+", ""),
        ("Před důležitou soutěží myslím na to, jak by moje prohra vypadala očima druhých.", "+", "S"),
        ("Za chybu pod tlakem se stydím víc než za cokoli jiného.", "+", "S"),
        ("Bojím se, že po neúspěchu mi lidé přestanou věřit.", "+", ""),
        ("Blízcí mě mají rádi stejně po výhře i po prohře.", "-", ""),
        ("Chyby před publikem mě trápí jen chvíli.", "-", "S"),
        ("Co si o mé prohře myslí ostatní, řeším málo.", "-", ""),
        ("V důležité soutěži mi myšlenka na ostudu přijde na mysl zřídka.", "-", "S"),
    ]),
    ("TL.6", "přeřízení pohybu", "P", "rys", [
        ("Pod tlakem začnu hlídat, jak přesně provádím pohyb.", "+", "S"),
        ("V důležitých chvílích přemýšlím o technice víc než v tréninku.", "+", "S"),
        ("Když jde o hodně, snažím se pohyb vědomě řídit.", "+", "S"),
        ("Po chybě ještě během soutěže rozebírám, co tělo udělalo špatně.", "+", "S"),
        ("Pod tlakem se mi rozpadá pohyb, který jinak běží automaticky.", "+", "S"),
        ("Když mě někdo sleduje, víc hlídám, jak se hýbu.", "+", ""),
        ("Často přemýšlím o tom, jak se hýbu.", "+", ""),
        ("Pohyb, který umím nazpaměť, pod tlakem kontroluji krok po kroku.", "+", "S"),
        ("V soutěži nechávám pohyb plynout.", "-", "S"),
        ("V rozhodujících chvílích se spoléhám na natrénovaný pohyb bez přemýšlení.", "-", "S"),
        ("O technice přemýšlím v tréninku, v soutěži ji nechám být.", "-", "S"),
        ("Pod tlakem se hýbu stejně plynule jako v tréninku.", "-", "S"),
    ]),
    ("TL.7", "přeřízení rozhodování", "P", "rys", [
        ("Pod tlakem rozhodnutí příliš zvažuji a pak jednám pozdě.", "+", "S"),
        ("V důležitých chvílích se bojím udělat špatné rozhodnutí.", "+", "S"),
        ("Po soutěži se v hlavě dlouho vracím ke svým rozhodnutím.", "+", ""),
        ("Když zaváhám v jedné akci, váhám i v dalších.", "+", "S"),
        ("V rozhodující chvíli mi chybí jistota, co zvolit.", "+", "S"),
        ("Po chybném rozhodnutí o něm přemýšlím ještě dlouho během soutěže.", "+", "S"),
        ("Víc možností v akci mě spíš zdrží, než aby pomohlo.", "+", "S"),
        ("Pod tlakem přenechám rozhodnutí raději jiným.", "+", "S"),
        ("V důležitých chvílích se rozhoduji rychle a jistě.", "-", "S"),
        ("Po rozhodnutí se hned soustředím na další akci.", "-", "S"),
        ("Pod tlakem věřím prvnímu nápadu.", "-", "S"),
        ("Ke svým rozhodnutím ze soutěže se vracím jen při rozboru.", "-", ""),
    ]),
    ("TL.8", "perfekcionistické obavy", "P", "rys", [
        ("Když udělám chybu, cítím se jako horší člověk.", "+", ""),
        ("Bojím se chyb, protože by ukázaly moji slabost.", "+", ""),
        ("Rodiče nebo trenér ode mě čekají dokonalost.", "+", ""),
        ("Za chybu v soutěži se trestám ještě dlouho po ní.", "+", "S"),
        ("Výkon s chybami považuji za neúspěch.", "+", "S"),
        ("Kritiku od trenéra beru jako důkaz, že nestačím.", "+", ""),
        ("Během soutěže myslím víc na chyby, kterým se chci vyhnout, než na úspěch.", "+", "S"),
        ("Jedna chyba mi dokáže zkazit dojem z jinak dobrého výkonu.", "+", "S"),
        ("Chybu v soutěži beru jako informaci pro další trénink.", "-", "S"),
        ("Dobrý výkon s několika chybami mě těší.", "-", "S"),
        ("Kritiku od trenéra beru věcně.", "-", ""),
        ("Svou hodnotu měřím i jinak než počtem chyb.", "-", ""),
    ]),
    ("TL.9", "výzva, nebo hrozba", "P", "rys", [
        ("Důležitou soutěž beru jako příležitost ukázat, co umím.", "+", ""),
        ("Před velkou soutěží cítím, že na ni mám.", "+", ""),
        ("Náročného soupeře vnímám jako výzvu.", "+", "S"),
        ("Když jde o hodně, věřím, že si poradím.", "+", "S"),
        ("Před důležitou soutěží cítím, že moje schopnosti stačí na to, co přijde.", "+", ""),
        ("Tlak velkých soutěží mě láká.", "+", "S"),
        ("V rozhodujících momentech chci mít výsledek ve svých rukou.", "+", "S"),
        ("Na důležité soutěže se těším jako na šanci.", "+", ""),
        ("Důležitá soutěž mi připadá jako zkouška, ve které můžu hodně ztratit.", "-", ""),
        ("Před velkou soutěží pochybuji, že to zvládnu.", "-", ""),
        ("Silný soupeř ve mně vyvolá hlavně obavu.", "-", "S"),
        ("Když jde o hodně, chci mít soutěž co nejdřív za sebou.", "-", "S"),
    ]),

    # ---------------- DO: Dovednosti a seberegulace ----------------
    ("DO.1", "práce s cíli", "C", "rys", [
        ("Před tréninkem si stanovím, co chci zlepšit.", "+", ""),
        ("Na každou soutěž si určím konkrétní cíle pro vlastní výkon.", "+", "S"),
        ("Své cíle si zapisuji.", "+", ""),
        ("Dlouhodobé cíle si rozkládám na menší kroky.", "+", ""),
        ("Po soutěži porovnávám výkon se svými cíli.", "+", "S"),
        ("Cíle si nastavuji náročné, ale dosažitelné.", "+", ""),
        ("Během soutěže mám v hlavě jeden až dva jasné úkoly.", "+", "S"),
        ("Cíle upravuji podle toho, jak se vyvíjí sezona.", "+", ""),
        ("Trénuji bez konkrétního cíle.", "-", ""),
        ("Do soutěže jdu bez plánu, co chci předvést.", "-", "S"),
        ("Na své cíle během sezony zapomínám.", "-", ""),
        ("Po soutěži hodnotím jen výsledek.", "-", "S"),
    ]),
    ("DO.2", "představivost", "C", "rys", [
        ("Před soutěží si v představách přehrávám svůj výkon.", "+", "S"),
        ("V představách si zkouším obtížné situace ze soutěže.", "+", ""),
        ("Při představách vnímám i pocity v těle, nejen obraz.", "+", ""),
        ("Novou dovednost si nejdřív přehraji v hlavě.", "+", ""),
        ("Před startem si představím první akce.", "+", "S"),
        ("Po chybě si v hlavě přehraji správné provedení.", "+", "S"),
        ("Představy mi pomáhají naladit se na výkon.", "+", ""),
        ("V představách si přehrávám, jak zvládám tlak.", "+", ""),
        ("Do soutěže jdu bez mentální přípravy.", "-", "S"),
        ("Když si výkon představuji, obraz je rozmazaný a utíká mi.", "-", ""),
        ("V představách mi naskakují spíš chyby než správné provedení.", "-", ""),
        ("Přípravu v představách vynechám, protože mi přijde zbytečná.", "-", ""),
    ]),
    ("DO.3", "vnitřní řeč", "C", "rys", [
        ("V soutěži si říkám krátké pokyny, které mě vedou.", "+", "S"),
        ("Po chybě si řeknu větu, která mě vrátí do hry.", "+", "S"),
        ("Když docházejí síly, povzbuzuji se v duchu.", "+", "S"),
        ("Mám připravená slova, která mi pomáhají v těžkých chvílích.", "+", ""),
        ("V tréninku si vnitřní řečí připomínám, na co se soustředím.", "+", ""),
        ("Před startem si říkám věty, které mě nabudí.", "+", "S"),
        ("Mluvím k sobě podobně jako dobrý trenér.", "+", ""),
        ("Své myšlenky v soutěži vědomě usměrňuji.", "+", "S"),
        ("V soutěži si v duchu nadávám.", "-", "S"),
        ("Po chybě si v duchu říkám, jak to kazím.", "-", "S"),
        ("Myšlenky v soutěži nechávám běžet, jak chtějí.", "-", "S"),
        ("V těžkých chvílích mluvím k sobě hůř než ke komukoli jinému.", "-", ""),
    ]),
    ("DO.4", "řízení aktivace", "C", "rys", [
        ("Před soutěží se umím záměrně zklidnit.", "+", "S"),
        ("Když potřebuji víc energie, umím se nabudit.", "+", "S"),
        ("Ke zklidnění používám dech.", "+", ""),
        ("Mám rutinu, která mě dostane do ideálního naladění.", "+", ""),
        ("Když je nervozity moc, vím, co s tím udělat.", "+", "S"),
        ("Během přestávek v soutěži upravuji svou úroveň energie.", "+", "S"),
        ("Po rozrušující situaci se umím rychle uklidnit.", "+", "S"),
        ("Poznám, jaké naladění potřebuji pro nejlepší výkon.", "+", ""),
        ("Nervozitu před startem nechám, ať si dělá, co chce.", "-", "S"),
        ("V soutěži se mi energie vymkne z rukou.", "-", "S"),
        ("Techniky na uvolnění vynechávám.", "-", ""),
        ("Když mě soutěž rozhodí, trvá dlouho, než se srovnám.", "-", "S"),
    ]),
    ("DO.5", "návrat do přítomnosti", "C", "rys", [
        ("Po chybě se hned soustředím na další akci.", "+", "S"),
        ("Když mě rozhodí rozhodčí, rychle se vrátím k úkolu.", "+", "S"),
        ("Rušivý moment odložím a pokračuji naplno.", "+", "S"),
        ("Mám krátký rituál, kterým se po chybě vrátím do hry.", "+", "S"),
        ("Po nepovedeném úseku začnu další s čistou hlavou.", "+", "S"),
        ("Když mě vyruší publikum, vrátím pozornost během pár vteřin.", "+", "S"),
        ("Myšlenky na to, co už se stalo, v soutěži rychle pustím.", "+", "S"),
        ("I po sérii chyb umím začít znovu od další akce.", "+", "S"),
        ("Chyba mi v hlavě zůstane několik dalších akcí.", "-", "S"),
        ("Když mě něco rozhodí, zbytek soutěže je horší.", "-", "S"),
        ("Po chybě myslím na to, co se stalo, místo na to, co přijde.", "-", "S"),
        ("Po sporném rozhodnutí rozhodčího mi trvá dlouho, než se vrátím do hry.", "-", "S"),
    ]),
    ("DO.6", "přerámování", "C", "rys", [
        ("Když se něco nepovede, hledám, co se z toho dá naučit.", "+", ""),
        ("Na nepříjemnou situaci se zkusím podívat z jiného úhlu.", "+", ""),
        ("Když mě něco rozhodí, změním to, jak o tom přemýšlím.", "+", ""),
        ("V těžké chvíli si připomenu, co mám pod kontrolou.", "+", "S"),
        ("Nepříznivé skóre beru jako úkol, který jde řešit.", "+", "S"),
        ("Když se mi něco nelíbí, hledám pohled, který mi pomůže.", "+", ""),
        ("Po prohře hledám, co bylo dobré.", "+", "S"),
        ("Když cítím vztek, zkusím situaci pojmenovat jinak.", "+", ""),
        ("Na nepříjemných věcech ulpím a točím se v nich.", "-", ""),
        ("Nepříznivý průběh soutěže vidím jako konec.", "-", "S"),
        ("Nepříjemnou situaci vidím jen jedním způsobem.", "-", ""),
        ("Po prohře myslím jen na to, co bylo špatně.", "-", "S"),
    ]),
    ("DO.7", "potlačení", "C", "rys", [
        ("Emoce si nechávám pro sebe.", "+", ""),
        ("Když mě něco trápí, skrývám to před ostatními.", "+", ""),
        ("V soutěži své emoce schovávám za kamennou tvář.", "+", "S"),
        ("Po prohře dělám, že je všechno v pořádku.", "+", "S"),
        ("Nervozitu před ostatními zakrývám.", "+", "S"),
        ("Radost po úspěchu držím na uzdě.", "+", ""),
        ("Vztek v soutěži polykám.", "+", "S"),
        ("Emoce potlačuji, i když mě to stojí sílu.", "+", ""),
        ("Ostatní poznají, jak se cítím.", "-", ""),
        ("Emoce dávám najevo přiměřeně situaci.", "-", ""),
        ("Když mě něco trápí, řeknu to nahlas.", "-", ""),
        ("V soutěži nechávám emoce projevit, když mi to pomáhá.", "-", "S"),
    ]),
    ("DO.8", "sebeřízené učení", "C", "rys", [
        ("Po tréninku vyhodnotím, co se povedlo a co zlepšit.", "+", ""),
        ("Vím, proč dělám každé cvičení v tréninku.", "+", ""),
        ("Sleduji svůj pokrok v konkrétních dovednostech.", "+", ""),
        ("Když postup přestane fungovat, hledám jiný.", "+", ""),
        ("Po soutěži si rozeberu klíčové situace.", "+", "S"),
        ("Procházím videa nebo data ze svých výkonů.", "+", "S"),
        ("Mimo trénink si hledám informace, jak se zlepšit.", "+", ""),
        ("Z chyb v soutěži si odnesu konkrétní úkol do tréninku.", "+", "S"),
        ("Trénink pro mě končí odchodem ze sportoviště.", "-", ""),
        ("Na čem pracuji, určuje jen trenér.", "-", ""),
        ("Jak se zlepšuji, zjistím až od trenéra.", "-", ""),
        ("Po soutěži přejdu k dalšímu bez rozboru.", "-", "S"),
    ]),
    ("DO.9", "vysoké nároky", "P", "rys", [
        ("Stanovuji si náročné standardy.", "+", ""),
        ("Od sebe čekám víc než většina sportovců.", "+", ""),
        ("Chci ve svém sportu dosáhnout maxima svých možností.", "+", ""),
        ("Spokojím se jen s výkonem na hranici svých možností.", "+", "S"),
        ("Mám jasnou představu o vysoké úrovni, na které chci soutěžit.", "+", ""),
        ("V tréninku si dávám laťku výš, než je nutné.", "+", ""),
        ("V soutěži chci podat výkon, který splní moje vysoké nároky.", "+", "S"),
        ("Dobrý výkon mě žene k ještě lepšímu.", "+", "S"),
        ("Stačí mi průměrný výkon.", "-", ""),
        ("Nároky na sebe mám nízké.", "-", ""),
        ("V soutěži mi stačí, když výkon projde.", "-", "S"),
        ("Snadné cíle mi vyhovují víc než náročné.", "-", ""),
    ]),
    ("DO.10", "laskavost k sobě po chybě", "P", "rys", [
        ("Po chybě se k sobě chovám jako k dobrému příteli.", "+", ""),
        ("Když se v soutěži daří špatně, mluvím k sobě vlídně.", "+", "S"),
        ("Po prohře si připomenu, že chyby dělá každý sportovec.", "+", "S"),
        ("Se svými slabinami mám trpělivost.", "+", ""),
        ("Po chybě cítím k sobě porozumění.", "+", "S"),
        ("Když se mi něco nepovede, dopřeji si trochu péče.", "+", ""),
        ("V těžkém období k sobě přistupuji laskavě.", "+", ""),
        ("Chybu v soutěži vnímám jako něco, co zažívají i ostatní.", "+", "S"),
        ("Po chybě se sebou zacházím tvrdě.", "-", "S"),
        ("Na své nedostatky se zlobím.", "-", ""),
        ("Když selžu, cítím se v tom osamoceně.", "-", ""),
        ("Po chybě v soutěži se odsuzuji.", "-", "S"),
    ]),

    # ---------------- OD: Odolnost, zátěž a zotavení ----------------
    ("OD.1", "mentální odolnost", "P", "rys", [
        ("Výkon držím i v nepříznivých podmínkách.", "+", "S"),
        ("Když jde do tuhého, přidám.", "+", "S"),
        ("Obtíže mě v cestě za cílem spíš zocelí.", "+", ""),
        ("Pod tlakem podávám výkon, na který mám.", "+", "S"),
        ("V nepříjemných podmínkách podávám stabilní výkon.", "+", "S"),
        ("Věřím si i po sérii neúspěchů.", "+", ""),
        ("Soustředění vydržím do konce soutěže.", "+", "S"),
        ("Těžké chvíle vydržím lépe než většina soupeřů.", "+", "S"),
        ("Při nepříznivém skóre to vzdávám.", "-", "S"),
        ("Při potížích v tréninku polevím.", "-", ""),
        ("Když se něco pokazí, ztrácím víru v sebe.", "-", ""),
        ("V nepříjemných podmínkách podávám výrazně horší výkon.", "-", "S"),
    ]),
    ("OD.2", "zotavení ze stresu", "P", "rys", [
        ("Po náročném období se rychle vrátím do normálu.", "+", ""),
        ("Stresující události mě rozhodí jen nakrátko.", "+", ""),
        ("Po těžké prohře se druhý den vracím do pohody.", "+", "S"),
        ("Po nepříjemné události se rychle vzpamatuji.", "+", ""),
        ("Zátěž zvládám bez velkých výkyvů nálady.", "+", ""),
        ("Po zranění nebo nemoci se psychicky vracím rychle.", "+", ""),
        ("Po neúspěšné sezoně se rychle zvednu.", "+", "S"),
        ("Po konfliktu v týmu se brzy srovnám.", "+", ""),
        ("Po stresující události se dlouho vzpamatovávám.", "-", ""),
        ("Těžké období mě rozhodí na dlouho.", "-", ""),
        ("Po velké prohře mi trvá dny až týdny, než se srovnám.", "-", "S"),
        ("Náročné změny v životě zvládám jen velmi těžko.", "-", ""),
    ]),
    ("OD.3", "vyčerpání", "P", "4t", [
        ("Trénink mě vyčerpává víc, než stačím dobrat.", "+", ""),
        ("Cítím velkou fyzickou únavu.", "+", ""),
        ("Po tréninku mi chybí energie na cokoli dalšího.", "+", ""),
        ("Sport mi bere víc sil, než mi dává.", "+", ""),
        ("Na soutěže nastupuji s únavou.", "+", "S"),
        ("Ráno se mi těžko vstává na trénink.", "+", ""),
        ("Cítím psychickou únavu ze sportu.", "+", ""),
        ("V soutěži mi dřív docházejí síly.", "+", "S"),
        ("Mám dost energie na trénink i na život mimo sport.", "-", ""),
        ("Do tréninku jdu s energií.", "-", ""),
        ("Na soutěže nastupuji s energií.", "-", "S"),
        ("Zátěž zvládám bez vyčerpání.", "-", ""),
    ]),
    ("OD.4", "pokles pocitu úspěchu", "P", "4t", [
        ("Mám pocit, že stojím na místě.", "+", ""),
        ("Ve sportu mám pocit marnosti.", "+", ""),
        ("Moje výkony mi přijdou pod úrovní, na kterou mám.", "+", ""),
        ("Pochybuji o svém talentu.", "+", ""),
        ("V soutěžích se cítím horší než dřív.", "+", "S"),
        ("Úspěchy mi poslední dobou unikají.", "+", "S"),
        ("Práce v tréninku mi přijde bez výsledku.", "+", ""),
        ("Mám pocit, že dělám víc a přináší to méně.", "+", ""),
        ("Vidím, že se ve sportu posouvám.", "-", ""),
        ("Ve sportu dosahuji věcí, které jsou pro mě důležité.", "-", ""),
        ("Ze svých výkonů v soutěži mám dobrý pocit.", "-", "S"),
        ("Cítím, že tréninky přinášejí výsledky.", "-", ""),
    ]),
    ("OD.5", "ztráta vztahu ke sportu", "P", "4t", [
        ("Na sportu mi přestává záležet.", "+", ""),
        ("Je mi jedno, jak mi to jde.", "+", ""),
        ("Přemýšlím o konci se sportem.", "+", ""),
        ("Výsledky mi přijdou lhostejné.", "+", ""),
        ("Soutěže mě přestávají bavit.", "+", "S"),
        ("Sport mi přijde méně důležitý než dřív.", "+", ""),
        ("Do tréninku chodím ze setrvačnosti.", "+", ""),
        ("Před soutěží mi chybí chuť bojovat.", "+", "S"),
        ("Sport je pro mě pořád důležitý.", "-", ""),
        ("Na výsledcích mi záleží.", "-", ""),
        ("Na soutěže se těším.", "-", "S"),
        ("Chci ve sportu pokračovat co nejdéle.", "-", ""),
    ]),
    ("OD.6", "zotavení", "C", "4t", [
        ("Mám dost času na odpočinek mezi tréninky.", "+", ""),
        ("Po náročném tréninku se do dalšího dne zotavím.", "+", ""),
        ("Mimo sport dělám věci, které mě nabíjejí.", "+", ""),
        ("Mám čas na přátele a rodinu.", "+", ""),
        ("Po soutěži si dopřeji skutečný odpočinek.", "+", "S"),
        ("Cítím se odpočatě.", "+", ""),
        ("Mezi soutěžemi se stihnu fyzicky i psychicky dobít.", "+", "S"),
        ("Mám chvíle, kdy na sport vůbec nemyslím.", "+", ""),
        ("Z jednoho tréninku jdu do dalšího bez odpočinku.", "-", ""),
        ("Myšlenky na sport mě pronásledují i ve volnu.", "-", ""),
        ("Mezi soutěžemi mi chybí čas na zotavení.", "-", "S"),
        ("Škola, práce nebo cestování mi berou čas na odpočinek.", "-", ""),
    ]),
    ("OD.7", "spánek", "C", "4t", [
        ("Usínám do půl hodiny.", "+", ""),
        ("Spím aspoň osm hodin.", "+", ""),
        ("Ráno se cítím odpočatě.", "+", ""),
        ("Spím v noci bez probouzení.", "+", ""),
        ("Noc před soutěží spím dobře.", "+", "S"),
        ("Chodím spát v podobnou hodinu.", "+", ""),
        ("Po večerní soutěži se mi dobře usíná.", "+", "S"),
        ("Probouzím se bez potíží.", "+", ""),
        ("Večer dlouho ležím a nemohu usnout.", "-", ""),
        ("V noci se budím a těžko znovu usínám.", "-", ""),
        ("Po večerní soutěži usínám až dlouho po půlnoci.", "-", "S"),
        ("Přes den mě přepadá ospalost.", "-", ""),
    ]),

    # ---------------- VZ: Vztahy a tým ----------------
    ("VZ.1", "vztah s trenérem", "P", "rys", [
        ("Trenérovi věřím.", "+", ""),
        ("S trenérem si rozumíme.", "+", ""),
        ("Na trenéra se můžu spolehnout i v těžkých chvílích.", "+", ""),
        ("S trenérem táhneme za jeden provaz.", "+", ""),
        ("V soutěži cítím, že trenér stojí za mnou.", "+", "S"),
        ("Na spolupráci s trenérem mi záleží.", "+", ""),
        ("Po soutěži s trenérem otevřeně rozebereme, co se stalo.", "+", "S"),
        ("Trenér mě zná a ví, co potřebuji.", "+", ""),
        ("S trenérem se míjíme.", "-", ""),
        ("Svoje problémy si před trenérem nechávám.", "-", ""),
        ("V soutěži mám pocit, že trenér stojí proti mně.", "-", "S"),
        ("Spolupráce s trenérem je pro mě spíš povinnost.", "-", ""),
    ]),
    ("VZ.2", "koučovatelnost", "P", "rys", [
        ("O zpětnou vazbu si říkám z vlastní iniciativy.", "+", ""),
        ("Kritika od trenéra mi ukazuje, co zlepšit.", "+", ""),
        ("Nový pokyn zkouším hned v příštím tréninku.", "+", ""),
        ("Když trenér něco vysvětlí, zapracuji to rychle.", "+", ""),
        ("Pokyny během soutěže přijímám i v napjaté chvíli.", "+", "S"),
        ("Po soutěži chci vědět, co mám dělat jinak.", "+", "S"),
        ("Zpětnou vazbu přijímám i od spoluhráčů a kolegů.", "+", ""),
        ("Když s pokynem nesouhlasím, zeptám se proč a pak ho zkusím.", "+", ""),
        ("Kritiku beru osobně.", "-", ""),
        ("Pokyny od trenéra si upravuji podle sebe.", "-", ""),
        ("Pokyny během soutěže přecházím.", "-", "S"),
        ("Rozbor soutěže s trenérem odkládám.", "-", "S"),
    ]),
    ("VZ.3", "otevřenost", "P", "rys", [
        ("O problémech mluvím včas.", "+", ""),
        ("Když s něčím nesouhlasím, řeknu to přímo.", "+", ""),
        ("Trenérovi řeknu i nepříjemnou věc.", "+", ""),
        ("O bolesti nebo zranění dám vědět hned.", "+", ""),
        ("V soutěži řeknu spoluhráčům nebo trenérovi, co potřebuji.", "+", "S"),
        ("Když mě něco trápí, svěřím se někomu z týmu.", "+", ""),
        ("Po soutěži řeknu, co se podle mě nepovedlo.", "+", "S"),
        ("O tom, jak se cítím, dokážu mluvit.", "+", ""),
        ("O problémech mlčím, dokud nejsou velké.", "-", ""),
        ("Nesouhlas si nechám pro sebe.", "-", ""),
        ("Bolest před trenérem tajím.", "-", ""),
        ("V soutěži se bojím říct, co potřebuji.", "-", "S"),
    ]),
    ("VZ.4", "úkolová soudržnost", "P", "rys", [
        ("V týmu táhneme za jeden provaz.", "+", ""),
        ("Všichni v týmu chceme stejný výsledek.", "+", ""),
        ("Za cíle týmu cítíme společnou odpovědnost.", "+", ""),
        ("V soutěži si pomáháme, i když to nikdo nevidí.", "+", "S"),
        ("O tom, jak k výkonu dojít, se v týmu shodneme.", "+", ""),
        ("V těžkých chvílích soutěže držíme při sobě.", "+", "S"),
        ("Každý v týmu ví, co je jeho úkol.", "+", ""),
        ("Po prohře hledáme řešení společně.", "+", "S"),
        ("Každý v týmu jede hlavně za svým.", "-", ""),
        ("Cíle týmu jsou pro některé vedlejší.", "-", ""),
        ("V soutěži se hádáme, místo abychom si pomohli.", "-", "S"),
        ("Po prohře hledáme viníka mezi sebou.", "-", "S"),
    ]),
    ("VZ.5", "psychologické bezpečí", "P", "rys", [
        ("V týmu se dá přiznat chyba bez trestu.", "+", ""),
        ("Nesouhlas s trenérem se u nás dá říct nahlas.", "+", ""),
        ("V týmu můžu zkusit něco nového i s rizikem chyby.", "+", ""),
        ("V soutěži si troufnu riskovat, tým za mnou stojí.", "+", "S"),
        ("O pomoc si v týmu říkám bez obav.", "+", ""),
        ("Po chybě v soutěži mě spoluhráči podrží.", "+", "S"),
        ("V týmu se berou vážně názory všech.", "+", ""),
        ("Na poradě po soutěži se dá mluvit otevřeně.", "+", "S"),
        ("Za chybu se u nás platí posměchem nebo trestem.", "-", ""),
        ("Nesouhlas je v týmu lepší si nechat pro sebe.", "-", ""),
        ("Po chybě v soutěži cítím od týmu odsudek.", "-", "S"),
        ("Některé věci se u nás radši neříkají.", "-", ""),
    ]),
]

# Situační úsudek. Klíč je hypotéza pro posuzovatele, ne hotový klíč:
# ++ nejúčinnější, + účinná, - méně účinná, -- škodlivá.
OTAZKA_VINET = "Jak pravděpodobně bys to {udělal|udělala}?"

VINETY = [
    # ---------------- TL.V: tlak a rozhodnost ----------------
    ("TL.V", "Je rozhodující moment soutěže a výsledek závisí na tvé další akci. Dívají se lidé, na jejichž názoru ti záleží.", [
        ("Soustředím se na první krok své rutiny.", "++"),
        ("Myslím na to, co bude, když to nevyjde.", "--"),
        ("Hlídám každý detail pohybu.", "-"),
        ("Zhluboka se nadechnu a jdu do toho naplno.", "+"),
    ]),
    ("TL.V", "Trenér ti před soutěží řekne, že dnes dostaneš roli, která je pro tebe nová.", [
        ("Zeptám se, co přesně ode mě trenér v té roli čeká.", "++"),
        ("Zvolím co nejopatrnější výkon, ať nic nezkazím.", "-"),
        ("Beru to jako příležitost ukázat se.", "+"),
        ("Celou dobu přemýšlím, proč to trenér udělal.", "--"),
    ]),
    ("TL.V", "Vedeš, soupeř začíná dotahovat a ty cítíš, jak ti tuhne tělo.", [
        ("Stáhnu se a jdu na jistotu.", "-"),
        ("Vrátím se k tomu, co fungovalo na začátku.", "++"),
        ("Pořád kontroluji skóre a počítám, kolik zbývá.", "--"),
        ("Uvolním ramena, nadechnu se a vrátím se k úkolu.", "+"),
    ]),
    ("TL.V", "V rozhodující chvíli máš dvě možnosti: jistou volbu s malým účinkem, nebo odvážnější, která může rozhodnout. Na rozhodnutí máš vteřinu.", [
        ("Zvolím tu, kterou máme natrénovanou pro tuhle situaci.", "++"),
        ("Zaváhám tak dlouho, že šance zmizí.", "--"),
        ("Vyberu jistou volbu, ať nemůžu nic pokazit.", "-"),
        ("Věřím prvnímu instinktu a jdu do toho.", "+"),
    ]),
    ("TL.V", "Těsně před klíčovou akcí rozhodne rozhodčí podle tebe nespravedlivě.", [
        ("Nechám to být a soustředím se na další akci.", "++"),
        ("Hádám se s rozhodčím.", "--"),
        ("V hlavě si to přehrávám ještě během akce.", "-"),
        ("Krátce si řeknu svůj klíčový pokyn a pokračuji.", "+"),
    ]),
    ("TL.V", "Před důležitou soutěží zjistíš, že se na tebe přijdou podívat skauti nebo reprezentační trenér.", [
        ("Připravím se stejně jako na každou jinou soutěž.", "++"),
        ("Snažím se předvést něco výjimečného.", "-"),
        ("Celou dobu myslím na to, co vidí.", "--"),
        ("Beru to jako šanci a těším se na to.", "+"),
    ]),
    ("TL.V", "Po první polovině soutěže prohráváš a víš, že máš na víc.", [
        ("S trenérem si stanovím jeden až dva konkrétní úkoly na zbytek.", "++"),
        ("Začnu riskovat všechno najednou.", "-"),
        ("Rezignuji, dnes to není můj den.", "--"),
        ("Připomenu si, co funguje, a začnu od další akce.", "+"),
    ]),
    ("TL.V", "Jde o rozhodující pokus. Minule ti ve stejné situaci nevyšel.", [
        ("Myslím na minulý nezdar.", "--"),
        ("Projdu svou rutinu stejně jako v tréninku.", "++"),
        ("Pohyb provádím opatrněji než obvykle.", "-"),
        ("Představím si, jak ho provádím správně.", "+"),
    ]),
    ("TL.V", "Soupeř nebo někdo z okolí tě před startem slovně provokuje.", [
        ("Vrátím se ke své přípravě.", "++"),
        ("Odpovím stejně.", "--"),
        ("Zlost využiji jako energii, ale dál sleduji svůj plán.", "+"),
        ("Celou soutěž chci tomu člověku něco dokázat.", "-"),
    ]),
    ("TL.V", "Na poslední chvíli se změní podmínky: čas startu, místo nebo počasí.", [
        ("Upravím rozcvičení a soustředím se na to, co mám v moci.", "++"),
        ("Rozčiluje mě to a myslím na to i během soutěže.", "--"),
        ("Beru to jako věc, kterou mají všichni stejně.", "+"),
        ("Začnu pochybovat o celé přípravě.", "-"),
    ]),
    ("TL.V", "V závěru zbývá jedna rozhodující akce a trenér se tě zeptá, jestli ji chceš vzít na sebe.", [
        ("Vezmu ji.", "++"),
        ("Přenechám ji někomu, komu to dnes jde lépe.", "-"),
        ("Vezmu ji, i když cítím nervozitu, a soustředím se na rutinu.", "+"),
        ("Dělám, že otázku neslyším.", "--"),
    ]),
    ("TL.V", "Soupeř je výrazně výš v žebříčku a všichni čekají, že prohraješ.", [
        ("Nemám co ztratit a jdu do toho naplno.", "++"),
        ("Soustředím se hlavně na to, ať prohra není vysoká.", "-"),
        ("Držím se vlastního plánu, jméno soupeře nechám stranou.", "+"),
        ("Už před začátkem se smiřuji s porážkou.", "--"),
    ]),

    # ---------------- DO.V: návrat po chybě ----------------
    ("DO.V", "V úvodu soutěže uděláš hrubou chybu, která stojí bod nebo čas.", [
        ("Řeknu si svůj pokyn a soustředím se na další akci.", "++"),
        ("Po zbytek soutěže se snažím chybu vynahradit za každou cenu.", "-"),
        ("V hlavě si ji přehrávám dál.", "--"),
        ("Krátce si ji pojmenuji a pustím ji.", "+"),
    ]),
    ("DO.V", "Uděláš chybu a trenér na tebe před ostatními křičí.", [
        ("Vezmu si z toho věcnou informaci a pokračuji.", "++"),
        ("Stáhnu se a riskuji co nejméně.", "-"),
        ("Odmlouvám.", "--"),
        ("Promluvím si s ním po soutěži.", "+"),
    ]),
    ("DO.V", "Tři chyby za sebou. Cítíš, že se ti soutěž vymyká.", [
        ("Zjednoduším si úkol na něco, co určitě zvládnu.", "++"),
        ("Myslím na to, že dnes je všechno špatně.", "--"),
        ("Použiji svůj rituál pro restart.", "+"),
        ("Zrychlím, ať se to rychle zlomí.", "-"),
    ]),
    ("DO.V", "Po prohrané soutěži si na sociálních sítích přečteš ostrou kritiku svého výkonu.", [
        ("Kritiku od lidí mimo tým pouštím z hlavy.", "+"),
        ("Čtu komentáře dál a dál.", "--"),
        ("Výkon rozeberu s trenérem a zbytek pustím.", "++"),
        ("Odpovídám na komentáře.", "-"),
    ]),
    ("DO.V", "Tvoje chyba rozhodla o prohře týmu nebo o ztrátě medaile.", [
        ("Uznám ji a řeknu, co si z ní beru.", "++"),
        ("Vyhýbám se ostatním.", "-"),
        ("Dny si ji vyčítám.", "--"),
        ("Dovolím si smutek a pak se vrátím k tréninku.", "+"),
    ]),
    ("DO.V", "V tréninku ti opakovaně nejde nová dovednost a ostatní ji už umí.", [
        ("Požádám trenéra o jiný způsob vysvětlení.", "++"),
        ("Vzdám to a vrátím se k tomu, co umím.", "--"),
        ("Trénuji ji navíc mimo trénink.", "+"),
        ("Začnu si myslet, že na to nemám.", "-"),
    ]),
    ("DO.V", "Na začátku důležité soutěže chybuješ a slyšíš, jak publikum reaguje.", [
        ("Zaměřím pozornost na svůj další úkol.", "++"),
        ("Myslím na to, co si o mně lidé myslí.", "--"),
        ("Další akci zvolím co nejjistěji.", "-"),
        ("Nadechnu se a zopakuji svou rutinu.", "+"),
    ]),
    ("DO.V", "Po špatném výkonu tě trenér na příští soutěž nenominuje nebo posadí na lavičku.", [
        ("Zeptám se, co konkrétně mám zlepšit.", "++"),
        ("Trénuji s menší chutí.", "--"),
        ("Beru to jako motivaci a pracuji dál.", "+"),
        ("Stěžuji si ostatním.", "-"),
    ]),
    ("DO.V", "Zranění tě vyřadí na šest týdnů těsně před vrcholem sezony.", [
        ("Se zdravotníky a trenérem si udělám plán návratu.", "++"),
        ("Myslím hlavně na to, co mi uteče.", "-"),
        ("Stahuji se od týmu.", "--"),
        ("Využiji čas na práci, na kterou jindy nemám prostor.", "+"),
    ]),
    ("DO.V", "Uděláš chybu, soupeř ji okamžitě potrestá a ještě tě provokuje.", [
        ("Vrátím se k plánu na další akci.", "++"),
        ("Chci mu to hned vrátit.", "-"),
        ("Ztratím hlavu.", "--"),
        ("Krátce se nadechnu a řeknu si pokyn.", "+"),
    ]),
    ("DO.V", "V tréninku podáváš dlouhodobě dobré výkony, ale v soutěži se ti opakovaně nedaří.", [
        ("S trenérem hledám, čím se soutěž liší od tréninku.", "++"),
        ("Začnu pochybovat, jestli na to mám.", "--"),
        ("Do tréninku přidám situace, které soutěž napodobují.", "+"),
        ("Před soutěžemi se snažím na to nemyslet.", "-"),
    ]),
    ("DO.V", "Po vítězné soutěži ti trenér ukáže video, na kterém opakovaně děláš stejnou chybu.", [
        ("Poděkuji a zeptám se, jak na ni.", "++"),
        ("Vadí mi, že to řeší zrovna po výhře.", "-"),
        ("Chybu vezmu jako úkol do dalšího tréninku.", "+"),
        ("Považuji to za zbytečné, vždyť se vyhrálo.", "--"),
    ]),

    # ---------------- VZ.V: komunikace ----------------
    ("VZ.V", "Nesouhlasíš s rolí, kterou ti trenér přidělil.", [
        ("Požádám ho o rozhovor mezi čtyřma očima.", "++"),
        ("Mlčím a roli plním bez chuti.", "-"),
        ("Stěžuji si ostatním.", "--"),
        ("Zeptám se, co musím zlepšit pro jinou roli.", "+"),
    ]),
    ("VZ.V", "Spoluhráč nebo tréninkový partner opakovaně chybuje a kazí ti tím výkon.", [
        ("Řeknu mu věcně, co potřebuji.", "++"),
        ("Před ostatními ho okřiknu.", "--"),
        ("Řeknu to trenérovi, ať to řeší on.", "-"),
        ("Zeptám se ho, jestli mu můžu nějak pomoct.", "+"),
    ]),
    ("VZ.V", "Cítíš bolest, o které trenér neví, a blíží se důležitá soutěž.", [
        ("Hned to řeknu trenérovi a zdravotníkovi.", "++"),
        ("Mlčím, ať nepřijdu o místo.", "--"),
        ("Řeknu to až po soutěži.", "-"),
        ("Zeptám se fyzioterapeuta, co s tím.", "+"),
    ]),
    ("VZ.V", "V kabině nebo ve skupině vznikne ostrý spor mezi dvěma lidmi.", [
        ("Navrhnu, ať si to vyříkají v klidu.", "++"),
        ("Přidám se na jednu stranu.", "-"),
        ("Nechám to být, mě se to netýká.", "--"),
        ("Upozorním na to kapitána nebo trenéra.", "+"),
    ]),
    ("VZ.V", "Trenér ti dává pokyn, který podle tebe v soutěži nefunguje.", [
        ("Po soutěži mu řeknu, co vidím, a zeptám se na jeho důvody.", "++"),
        ("Pokyn potichu ignoruji.", "--"),
        ("Pokyn splním a nic neřeknu.", "-"),
        ("V přestávce se krátce zeptám, jestli můžu zkusit jinou variantu.", "+"),
    ]),
    ("VZ.V", "Máš za sebou těžké týdny mimo sport (škola, rodina, vztah) a projevuje se to v tréninku.", [
        ("Trenérovi řeknu, že teď procházím těžším obdobím.", "++"),
        ("Nic neříkám a doufám, že to přejde.", "--"),
        ("Svěřím se někomu blízkému z týmu.", "+"),
        ("Trénuji ještě víc, ať to nikdo nepozná.", "-"),
    ]),
    ("VZ.V", "Po prohře je v týmu ticho a nikdo nechce mluvit o tom, co se stalo.", [
        ("Navrhnu krátký rozbor, co udělat jinak.", "++"),
        ("Mlčím taky.", "-"),
        ("Začnu hledat, kdo to zavinil.", "--"),
        ("Začnu tím, co se nepovedlo mně.", "+"),
    ]),
    ("VZ.V", "Trenér ti dá zpětnou vazbu, se kterou nesouhlasíš.", [
        ("Poslechnu si ji a pak řeknu, jak to vidím já.", "++"),
        ("Hned se ohradím a odejdu.", "--"),
        ("Kývnu a dál to neřeším.", "-"),
        ("Poprosím o konkrétní příklad.", "+"),
    ]),
    ("VZ.V", "Nový člen týmu se drží stranou a ostatní ho přehlížejí.", [
        ("Zapojím ho do rozhovoru nebo cvičení.", "++"),
        ("Nechám to na trenérovi.", "-"),
        ("Přidám se k ostatním.", "--"),
        ("Zeptám se ho, jak se mu v týmu daří.", "+"),
    ]),
    ("VZ.V", "Během soutěže potřebuješ od trenéra jinou informaci, než kterou ti dává.", [
        ("Krátce a jasně řeknu, co potřebuji.", "++"),
        ("Nic neřeknu a improvizuji.", "-"),
        ("Rozčílím se na něj.", "--"),
        ("Po soutěži se domluvím, jak si příště předávat informace.", "+"),
    ]),
    ("VZ.V", "Někdo z týmu ti svěří, že má psychické potíže, a nechce, aby to někdo další věděl.", [
        ("Vyslechnu ho a doporučím mu obrátit se na odborníka.", "++"),
        ("Řeknu to hned celému týmu.", "--"),
        ("Řeknu mu, ať to nepřehání.", "-"),
        ("Zeptám se, jak mu můžu pomoct.", "+"),
    ]),
    ("VZ.V", "Po soutěži tě novinář nebo rodič tlačí ke kritice spoluhráče nebo trenéra.", [
        ("Mluvím o vlastním výkonu a ostatní nechám stranou.", "++"),
        ("Řeknu, co si o ostatních opravdu myslím.", "-"),
        ("Veřejně obviním ostatní.", "--"),
        ("Slušně odmítnu a téma převedu.", "+"),
    ]),
]

KONTROLNI = [
    ("instruovaná", "U této položky zvol „spíš nesouhlasím“.", "P", "spíš nesouhlasím"),
    ("instruovaná", "U této položky zvol „úplně souhlasím“.", "P", "úplně souhlasím"),
    ("instruovaná", "U této položky zvol „často“.", "C", "často"),
    ("nepravděpodobná", "Každou noc spím přes čtrnáct hodin.", "C", "zřídka nebo téměř nikdy"),
    ("nepravděpodobná", "Vyhrávám každou soutěž, do které nastoupím.", "P", "nesouhlas"),
    ("nepravděpodobná", "Trénuji každý den dvacet hodin.", "C", "zřídka nebo téměř nikdy"),
    ("nepravděpodobná", "Osobně znám všechny sportovce na světě.", "P", "nesouhlas"),
    ("nepravděpodobná", "Za celý život mě nikdy nic nebolelo.", "P", "nesouhlas"),
    ("nepravděpodobná", "Každý týden soutěžím na jiném kontinentu.", "C", "zřídka nebo téměř nikdy"),
    ("nepravděpodobná", "Umím všechny sporty na olympijské úrovni.", "P", "nesouhlas"),
]

DOMENY = {
    "MO": "Motivace a identita",
    "TL": "Tlak",
    "DO": "Dovednosti a seberegulace",
    "OD": "Odolnost, zátěž a zotavení",
    "VZ": "Vztahy a tým",
}

SKUPINY_VINET = {
    "TL.V": "Tlak a rozhodnost",
    "DO.V": "Návrat po chybě",
    "VZ.V": "Komunikace",
}

FORMAT = {"P": "souhlas", "C": "četnost"}
RAMEC = {"rys": "obvykle", "4t": "posledních 4 týdnů"}

# Tvary, které v češtině prozrazují rod mluvčího: minulý čas a přídavná
# jména v první osobě. Hrubé síto; co projde, četl ještě člověk.
ROD = re.compile(
    r"\b(jsem\s+\w+[ýá]|\w+l\s+jsem|byl[a]?|sám|sama|rád|ráda|\w+l[a]?\s+bych|bych\s+\w+l[a]?)\b",
    re.IGNORECASE,
)


def kontrola() -> list[str]:
    chyby = []
    ids = set()
    for kod, nazev, fmt, ramec, polozky in SKALY:
        if kod in ids:
            chyby.append(f"{kod}: duplicitní kód")
        ids.add(kod)
        if len(polozky) != 12:
            chyby.append(f"{kod}: {len(polozky)} položek místo 12")
        if sum(1 for _, s, _ in polozky if s == "-") < 3:
            chyby.append(f"{kod}: méně než 3 obrácené")
        if sum(1 for _, _, z in polozky if z == "S") < 3:
            chyby.append(f"{kod}: méně než 3 soutěžní")
        for text, smer, _ in polozky:
            if smer not in "+-":
                chyby.append(f"{kod}: neplatný směr u „{text}“")
            if len(text.split()) > 15:
                chyby.append(f"{kod}: víc než 15 slov: „{text}“")
            if ROD.search(text):
                chyby.append(f"{kod}: možný rodový tvar: „{text}“")
    for skupina, situace, reakce in VINETY:
        if len(reakce) != 4:
            chyby.append(f"{skupina}: viněta nemá 4 reakce: „{situace[:40]}“")
        if sorted(k for _, k in reakce) != sorted(["++", "+", "-", "--"]):
            chyby.append(f"{skupina}: klíč není ++, +, -, --: „{situace[:40]}“")
        for text, _ in reakce:
            if ROD.search(text):
                chyby.append(f"{skupina}: možný rodový tvar: „{text}“")
    for skupina in SKUPINY_VINET:
        n = sum(1 for s, _, _ in VINETY if s == skupina)
        if n != 12:
            chyby.append(f"{skupina}: {n} vinět místo 12")
    vse = json.dumps([SKALY, VINETY, KONTROLNI], ensure_ascii=False)
    if "\u2014" in vse:
        chyby.append("dlouhá pomlčka v textu")
    texty = [t for *_, p in SKALY for t, _, _ in p]
    for t in {t for t in texty if texty.count(t) > 1}:
        chyby.append(f"stejná položka dvakrát: „{t}“")
    return chyby


def sestav() -> tuple[dict, str]:
    data = {
        "verze": "cs-0.1",
        "skaly": [],
        "vinety": [],
        "kontrolni": [],
        "otazkaVinet": OTAZKA_VINET,
    }
    md = [
        "# Banka položek ELITE Pro: čeština",
        "",
        "Kandidáti pro posouzení obsahu (fáze 2). **Generováno** z `sestav.py`;",
        "opravy se dělají tam, ne tady. Ve finále zůstanou 4 položky na škálu",
        "a 12 vinět z 36.",
        "",
        "Značky: `+` položka měří škálu přímo, `−` obráceně; `S` položka se týká",
        "chování v soutěži.",
        "",
        "## Jak posuzovat",
        "",
        "U každé položky dvě otázky, odpověď 1 až 4:",
        "",
        "1. **Jak dobře položka odpovídá definici škály?** 1 vůbec, 2 málo,",
        "   3 dobře, 4 přesně.",
        "2. **Bude jí rozumět čtrnáctiletý sportovec?** 1 vůbec, 2 s obtížemi,",
        "   3 ano, 4 bez zaváhání.",
        "",
        "U vinět navíc: souhlasíte s hypotézou klíče (`++` nejúčinnější, `+`",
        "účinná, `−` méně účinná, `−−` škodlivá)? Pokud ne, napište své pořadí.",
        "",
    ]
    cislo = 0
    domena = None
    for kod, nazev, fmt, ramec, polozky in SKALY:
        d = kod.split(".")[0]
        if d != domena:
            domena = d
            md += [f"## {d}: {DOMENY[d]}", ""]
        md += [
            f"### {kod} {nazev}",
            "",
            f"Formát: {FORMAT[fmt]}; rámec: {RAMEC[ramec]}.",
            "",
            "| id | položka | směr | soutěž |",
            "|---|---|---|---|",
        ]
        skala = {"kod": kod, "nazev": nazev, "format": fmt, "ramec": ramec, "polozky": []}
        for i, (text, smer, sout) in enumerate(polozky, 1):
            cislo += 1
            pid = f"{kod}-{i:02d}"
            skala["polozky"].append(
                {"id": pid, "text": text, "smer": smer, "soutez": sout == "S"}
            )
            md.append(f"| {pid} | {text} | {'+' if smer == '+' else '−'} | {'S' if sout else ''} |")
        md.append("")
        data["skaly"].append(skala)

    md += [
        "## Situační úsudek",
        "",
        f"Otázka u každé reakce: „{OTAZKA_VINET.replace('{udělal|udělala}', 'udělal/a')}“",
        "Odpověď 1 až 5: velmi nepravděpodobně až velmi pravděpodobně.",
        "",
    ]
    znacka = {"++": "++", "+": "+", "-": "−", "--": "−−"}
    skupina = None
    poradi = {}
    for sk, situace, reakce in VINETY:
        if sk != skupina:
            skupina = sk
            md += [f"### {sk} {SKUPINY_VINET[sk]}", ""]
        poradi[sk] = poradi.get(sk, 0) + 1
        vid = f"{sk}-{poradi[sk]:02d}"
        md += [f"**{vid}.** {situace}", ""]
        md += ["| reakce | text | klíč (hypotéza) |", "|---|---|---|"]
        vin = {"id": vid, "skupina": sk, "situace": situace, "reakce": []}
        for pismeno, (text, klic) in zip("ABCD", reakce):
            vin["reakce"].append({"id": f"{vid}{pismeno}", "text": text, "klic": klic})
            md.append(f"| {pismeno} | {text} | {znacka[klic]} |")
        md.append("")
        data["vinety"].append(vin)

    md += [
        "## Kontrola spolehlivosti vyplnění",
        "",
        "| id | druh | položka | formát | očekávaná odpověď |",
        "|---|---|---|---|---|",
    ]
    for i, (druh, text, fmt, ocek) in enumerate(KONTROLNI, 1):
        kid = f"KV-{i:02d}"
        data["kontrolni"].append(
            {"id": kid, "druh": druh, "text": text, "format": fmt, "ocekavano": ocek}
        )
        md.append(f"| {kid} | {druh} | {text} | {FORMAT[fmt]} | {ocek} |")
    md.append("")

    polozek = sum(len(s["polozky"]) for s in data["skaly"])
    md[6:6] = [
        f"Celkem {polozek} položek v {len(data['skaly'])} škálách, "
        f"{len(data['vinety'])} vinět po 4 reakcích a {len(data['kontrolni'])} kontrolních položek.",
        "",
    ]
    return data, "\n".join(md)


if __name__ == "__main__":
    chyby = kontrola()
    for c in chyby:
        print("CHYBA", c)
    if chyby:
        sys.exit(1)
    data, md = sestav()
    (ZDE / "banka-cs.json").write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    (ZDE / "banka-cs.md").write_text(md, encoding="utf-8")
    print(f"OK: {sum(len(s['polozky']) for s in data['skaly'])} položek, {len(data['vinety'])} vinět")
