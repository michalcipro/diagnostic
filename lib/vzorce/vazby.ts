import { NAZVY_DOMEN, POTREBA_DOMENY, vzorec } from "./structure"
import { OBSAH } from "./data/obsah"
import type { Domena, VysledekVzorcu, VzorecId, VzorecSkore } from "./types"

// Souvislosti mezi vzorci.
//
// Tři aktivní vzorce nejsou tři oddělené popisy. Teprve to, jak spolu pracují,
// vysvětluje, proč se člověk chová způsobem, kterému sám nerozumí. Tenhle
// modul proto skládá propojené shrnutí ze tří vrstev: která oblast potřeb je
// zasažená, jak se konkrétní dvojice vzájemně živí, a kde se dá začít.

/** Klíč dvojice nezávislý na pořadí. */
function paruj(a: VzorecId, b: VzorecId): string {
  return a < b ? `${a}-${b}` : `${b}-${a}`
}

/**
 * Popis toho, co spolu dvojice vzorců dělá.
 *
 * Nejde o součet dvou popisů, ale o mechanismus, který vznikne teprve jejich
 * spojením. Dvojice, které nemají vlastní text, se v shrnutí popíšou přes
 * domény, ať se nikdy nestane, že by kombinace zůstala bez výkladu.
 */
const DVOJICE: Record<string, string> = {
  // ---- odpojení mezi sebou ----
  "01-02": "Strach ze ztráty se tu potkává s očekáváním zrady, a to je kombinace, která vztah drží v trvalém napětí. Blízkost potřebuješ a zároveň jí nevěříš, takže se střídá přimknutí s ostražitostí. Druhý přitom dostává protichůdné signály a jeho zmatená reakce pak obojí potvrdí.",
  "01-03": "Tady se sešel strach, že tě opustí, s pocitem, že tě stejně nikdo doopravdy nenasytí. Vztah proto nemůže uspět ani tehdy, když vydrží: dokud trvá, chybí v něm blízkost, a kdyby skončil, potvrdí se ztráta. Odtud pramení výběr partnerů, kteří jsou nedostupní právě tak akorát.",
  "01-07": "Strach z opuštění a stud se navzájem vysvětlují. Pokud uvnitř věříš, že je v tobě něco vadného, pak je odchod druhého logický důsledek, ne náhoda. Vztah se tím mění v čekání na rozsudek, a čím víc na něm záleží, tím je čekání horší.",
  "02-07": "Ostražitost tu chrání stud. Když si nikoho nepustíš blíž, nikdo neuvidí to, co považuješ za vadu. Nedůvěra proto není jen obranou před druhými, ale hlavně před odhalením, a právě proto se nedá vyvrátit tím, že se někdo osvědčí.",
  "03-04": "Prázdno v blízkých vztazích se tu spojuje s pocitem, že nepatříš do skupiny. Chybí tedy obojí: hloubka i příslušnost. Osamělost pak nemá kde skončit, protože ani jedna z obvyklých cest, blízký člověk nebo party, ji nezmenší.",
  "03-07": "Emoční hlad a stud tvoří kruh. Blízkost potřebuješ, ale nemyslíš si, že si ji zasloužíš, a proto si o ni neřekneš. Když pak nepřijde, potvrdí se obojí naráz: že jí není dost a že je to tebou.",
  "04-07": "Tyhle dva vzorce se pletou, ale nejsou totéž a spolu jsou obzvlášť těžké. Vyloučení se hlásí ve skupinách, stud v blízkosti. Když běží oba, nezbývá bezpečné místo: ve společnosti stojíš mimo a v důvěrném vztahu čekáš odhalení.",

  // ---- autonomie mezi sebou ----
  "05-06": "Sesterská dvojice. Zranitelnost říká, že svět je nebezpečný, závislost říká, že na něj nestačíš. Dohromady vzniká svět, ve kterém se nedá bezpečně jednat sám, a proto se rozhodnutí buď odkládají, nebo přenášejí na druhé.",
  "05-08": "Nedůvěra ve vlastní úsudek se tu potkává s očekáváním neúspěchu. Riziko se proto nevyhodnocuje, ale vylučuje. Výsledkem bývá život, který je menší, než jaký bys {uměl|uměla} vést, a zdánlivý důkaz, že tvoje obavy byly na místě.",
  "06-08": "Katastrofické scénáře tu obsluhují očekávaný neúspěch. Než do něčeho jdeš, máš dopředu představu, jak to dopadne špatně, a ta představa je živější než jakákoli dosavadní zkušenost. Příprava se pak mění v obranu.",

  // ---- odpojení + autonomie ----
  "01-05": "Strach ze ztráty a nedůvěra ve vlastní síly se navzájem drží. Když nevěříš, že to zvládneš sám, je odchod druhého existenční hrozbou, ne bolestí. Vztah pak neudržuje náklonnost, ale nutnost, a to je pro obě strany těžké břemeno.",
  "02-05": "Nevěříš lidem a zároveň se bez nich neobejdeš. To je vnitřní rozpor, který stojí obrovské množství energie: potřebuješ oporu, a přitom ji musíš hlídat. Bezpečí se nedostaví ani tam, kde by mohlo.",
  "03-05": "Emoční hlad a závislost se snadno zamění za lásku. Vztah drží proto, že bez něj to nejde, a ne proto, že v něm je dobře. Odtud pramení setrvání ve vztazích, které dávno nefungují.",
  "04-08": "Pocit, že nepatříš, se tu potkává s pocitem, že nestačíš. Skupina se tím stává dvojnásob nebezpečná: nejenže tam nezapadneš, navíc se tam pozná, co neumíš. Vyhýbání pak vypadá jako volba, ale volba to není.",
  "06-07": "Očekávání ohrožení a stud spolu tvoří opatrnost, která vypadá jako povaha. Riziko nehrozí jen zvenčí, hrozí i odhalením, a proto se vyhýbáš dvakrát: nebezpečné situaci i situaci, kde by mohlo být vidět, jak ti je.",

  // ---- zaměření na druhé a hranice ----
  "01-09": "Přizpůsobení tu slouží jako pojistka proti ztrátě. Ustupuješ, abys druhého udržel, a čím víc ustoupíš, tím míň z tebe ve vztahu zbude. Nakonec zůstává vztah, ve kterém nejsi, a strach z jeho ztráty přesto neklesl.",
  "05-09": "Když nevěříš vlastnímu úsudku, je logické nechat rozhodovat druhé, a když rozhodují druzí, nemáš jak si úsudek vyzkoušet. Kruh se uzavírá a s každým dalším rokem je těžší z něj vystoupit.",
  "07-09": "Stud tu dává přizpůsobení smysl. Když si myslíš, že {sám|sama} o sobě nestačíš, musíš si místo ve vztahu zasloužit tím, co uděláš pro druhé. Vlastní potřeba se pak nejeví jako právo, ale jako drzost.",
  "09-11": "Dva protilehlé póly hranice v jednom člověku. Většinu času ustupuješ, a pak přijde chvíle, kdy se to zlomí do nároku nebo výbuchu. Zvenčí to působí nevypočitatelně, uvnitř je to prosté: hněv, který se dlouho nesměl ozvat, si nakonec cestu najde.",
  "03-11": "Nárok a impulz tu zakrývají prázdno. Věci, výjimky a okamžité potěšení mají zaplnit něco, na co nestačí, protože chybí blízkost, ne odměna. Proto úleva nikdy nevydrží dlouho.",
  "07-11": "Výjimečnost je tu nejčastěji obranou před studem. Navenek nárok a jistota, uvnitř přesvědčení, že nestačíš. Právě proto reaguješ na zpochybnění tak prudce: nejde o spor, jde o obranu.",

  // ---- doplněné dvojice, které se v praxi objevují nejčastěji ----
  "07-08": "Stud a očekávání neúspěchu se pletou, ale nejsou totéž. Méněcennost říká, že je vadné to, co jsi; selhání říká, že nestačí to, co dokážeš. Když běží obojí, není kam uhnout: úspěch nezvedne pocit vlastní hodnoty, protože ten na výkonu nestojí, a neúspěch ho okamžitě potvrdí.",
  "02-03": "Toužíš po blízkosti a zároveň čekáš zradu. To je vnitřní rozpor, který drží vztahy v půli cesty: dost blízko, aby bolely, ne dost blízko, aby nasytily. Otevřít se by znamenalo dát druhému do ruky přesně to, čeho se bojíš.",
  "01-04": "Strach ze ztráty se tu pojí s pocitem, že nikam nepatříš. Blízké vztahy proto nesou celou váhu: nemáš širší zázemí, na které by se dalo přepnout, a tím se každá hrozba odchodu zvětší.",
  "01-06": "Očekáváš katastrofu a zároveň ztrátu, a obojí se sčítá do stálé pohotovosti. Zpoždění, nepřijatý hovor nebo změna plánu se okamžitě čtou v nejhorší možné verzi. Úleva po vysvětlení vydrží krátce, protože pohotovost se nevypíná.",
  "02-04": "Nedůvěra a pocit odlišnosti spolu drží člověka mimo skupinu velmi spolehlivě. Nepatříš a zároveň nemáš důvod tomu, kdo tě zve, věřit. Každé pozvání se tak stává otázkou, co za tím je.",
  "04-05": "Pocit, že nepatříš, se potkává s nedůvěrou ve vlastní síly. Skupina proto není jen nepříjemná, je i nebezpečná: sám to neustojíš a opřít se nemáš o koho. Odtud pramení silná vazba na jednoho člověka, který dělá prostředníka mezi tebou a světem.",
  "04-09": "Přizpůsobení je tu vstupenkou do skupiny. Kdo nepatří, musí si místo zasloužit tím, že nebude dělat problémy. Cena je vysoká: patříš, ale ne jako ty sám, a proto ani přijetí, které přijde, nezmenší pocit odlišnosti.",
  "03-08": "Prázdno ve vztazích se tu sešlo s pocitem, že nestačíš ve výkonu. Nezbývá oblast, ze které by šla čerpat hodnota: doma se necítíš nasycený, v práci ne dost dobrý. To je vyčerpávající kombinace, která bývá pod dlouhodobou únavou.",
  "05-07": "Nedůvěra ve vlastní síly a stud se navzájem potvrzují. Když si o sobě myslíš, že jsi {vadný|vadná}, je logické, že to sám nezvládneš, a když to sám nezvládneš, potvrdí se, že jsi {vadný|vadná}. Pomoc, kterou přijmeš, přitom kruh utáhne, ne uvolní.",
  "06-09": "Úzkost a přizpůsobení se tu spojují do velké opatrnosti vůči lidem. Konflikt je nebezpečný nejen proto, že by mohl něco zkazit, ale protože si nejsi jistý, že bys jeho následky ustál. Ustupuješ tedy dřív, než se vůbec ukáže, o co jde.",
  "08-09": "Nevěříš si ve výkonu a zároveň neumíš odmítnout. Bereš si proto úkoly, o kterých dopředu víš, že tě přerostou, a pak je táhneš sám, protože říct si o pomoc by potvrdilo to nejhorší. Vyhoření tudy chodí velmi tiše.",

  // ---- perfekcionismus a jeho okolí ----
  "07-10": "Klasická dvojice. Výkon je tu pokusem vyrovnat stud: kdybych {byl dost dobrý|byla dost dobrá}, možná by to vadné nebylo vidět. Jenže laťka se posouvá spolu s tebou, takže žádný výsledek nestačí. Odtud pramení úspěch, ze kterého nemáš nic.",
  "08-10": "Vypadá to jako protiklad a je to protiklad, který se snadno plete. Selhání znamená očekávat od sebe příliš málo ve srovnání s ostatními, perfekcionismus příliš mnoho ve srovnání s nedosažitelnou metou. Když běží oba, jsi mezi mlýnskými kameny: nároky nahoře, důvěra dole, a odpočinek si nezasloužíš ani po dobrém výkonu.",
  "04-10": "Výkon tu slouží jako vstupenka. Když nepatříš, dá se místo ve skupině koupit tím, co dokážeš. Funguje to a zároveň nefunguje: uznání přijde, přijetí ne, protože nepatří tobě, ale tvému výsledku.",
  "09-10": "Vysoké nároky se tu potkávají s neschopností odmítnout. Bereš si víc, než unese kdokoli, a pak to musíš udělat dokonale. To je nejrychlejší cesta k vyčerpání, jakou tenhle test umí ukázat, a obvykle se pozná až na těle.",
  "06-10": "Perfekcionismus tu obsluhuje úzkost. Kontrola nad detaily má nahradit jistotu, kterou nemáš, takže čím větší nejistota, tím vyšší nároky. Úleva ale nepřijde, protože kontrolovat se dá vždycky ještě něco.",
  "03-10": "Za výkonem je tu citová prázdnota. Dosahování má zaplnit místo, kde chybí blízkost, a proto ani ten největší úspěch nezasytí. Nejdřív to obvykle odnese vztah, tedy přesně to, co by pomohlo.",
  "10-11": "Nároky a nárokovost se tu spojují do velmi tvrdého nastavení. Od sebe chceš maximum a od okolí ohledy, a když se to nesejde, přijde vztek. Nejvíc to dopadá na lidi, kteří jsou nejblíž.",
  "05-10": "Perfekcionismus tu kryje nedůvěru ve vlastní síly. Když si nevěříš, musíš být připravený lépe než ostatní, a příprava nikdy nekončí. Zvenčí to vypadá jako svědomitost, zevnitř je to strach.",
  "01-10": "Výkon tu drží vztah pohromadě. Někde uvnitř je rovnice, že tě neopustí, dokud budeš {dost dobrý|dost dobrá}, a proto se laťka nedá spustit ani doma. Paradox je, že právě tempo a nároky vztah nakonec vyčerpají.",
  "02-10": "Vysoké nároky tu slouží ostražitosti. Kdo je bez chyby, toho není za co chytit. Perfekcionismus se tak stává obranou před zranitelností, a proto se tak těžko pouští.",
}

/** Pořadí zásahu podle domén: kde se dá začít s nejmenším odporem. */
const POradiPACE: Domena[] = ["ostrazitost", "zamereni", "autonomie", "hranice", "odpojeni"]

export interface Propojeni {
  /** které oblasti potřeb jsou zasažené */
  domeny: string
  /** jak spolu vzorce pracují, jedna až tři pasáže */
  mechanismy: string[]
  /** co to dělá dohromady */
  souhrn: string
  /** kde začít */
  kdeZacit: string
}

function nazevMaly(id: VzorecId): string {
  const n = OBSAH[id].nazev
  return n.charAt(0).toLowerCase() + n.slice(1)
}

/** Popis dvojice; když pro ni není vlastní text, složí se z domén. */
function popisDvojice(a: VzorecSkore, b: VzorecSkore): string {
  const vlastni = DVOJICE[paruj(a.id, b.id)]
  if (vlastni) return vlastni
  const da = vzorec(a.id).domena
  const db = vzorec(b.id).domena
  if (da === db) {
    return `Vzorce ${nazevMaly(a.id)} a ${nazevMaly(b.id)} vycházejí ze stejné oblasti. Chybí tu totéž: ${POTREBA_DOMENY[da]}. Proto se navzájem posilují, co spustí jeden, obvykle probudí i druhý, a rozlišit je zevnitř bývá těžké.`
  }
  return `Vzorce ${nazevMaly(a.id)} a ${nazevMaly(b.id)} pocházejí ze dvou různých oblastí. U prvního chybí ${POTREBA_DOMENY[da]}, u druhého ${POTREBA_DOMENY[db]}. Nespouštějí se proto vždy naráz, ale jakmile se potkají v jedné situaci, zesílí se navzájem.`
}

export function propoj(vysledek: VysledekVzorcu): Propojeni | null {
  const top = vysledek.top3
  if (top.length === 0) return null

  // ---- které oblasti potřeb jsou zasažené ----
  const pocty = new Map<Domena, VzorecSkore[]>()
  for (const v of top) {
    const d = vzorec(v.id).domena
    pocty.set(d, [...(pocty.get(d) ?? []), v])
  }
  const serazeneDomeny = [...pocty.entries()].sort((a, b) => b[1].length - a[1].length)
  const [hlavniDomena, vzorceDomeny] = serazeneDomeny[0]

  // Kolik dvojic z trojice má popsaný vlastní mechanismus. Tohle je lepší
  // ukazatel provázanosti než samotná doména: klasická výkonová trojice
  // (perfekcionismus, selhání, méněcennost) leží ve třech různých oblastech,
  // a přesto tvoří jeden pevně spojený systém.
  const dvojicVlastnich =
    top.length >= 2
      ? top.flatMap((a, i) => top.slice(i + 1).map((b) => (DVOJICE[paruj(a.id, b.id)] ? 1 : 0)))
          .reduce((x: number, y: number) => x + y, 0)
      : 0
  const vsechnyDvojicePopsane = top.length >= 3 && dvojicVlastnich >= 2

  let domeny: string
  if (vzorceDomeny.length === 3) {
    domeny = `Všechny tři nejaktivnější vzorce spadají do jedné oblasti, kterou je ${NAZVY_DOMEN[hlavniDomena].toLowerCase()}. To je důležitá informace sama o sobě: neznamená to tři různé problémy, ale jedno téma ve třech podobách. Chybějícím kusem je tu ${POTREBA_DOMENY[hlavniDomena]}.`
  } else if (vzorceDomeny.length === 2) {
    const zbytek = serazeneDomeny[1][0]
    domeny = `Dva ze tří nejaktivnějších vzorců spadají do oblasti, kterou je ${NAZVY_DOMEN[hlavniDomena].toLowerCase()}, tedy k tématu, jímž je ${POTREBA_DOMENY[hlavniDomena]}. Třetí přichází odjinud, z oblasti, kterou je ${NAZVY_DOMEN[zbytek].toLowerCase()}. Právě tenhle třetí bývá tím, co celek drží v chodu, protože nabízí zdánlivé řešení prvních dvou.`
  } else if (vsechnyDvojicePopsane) {
    domeny = `Tvoje tři nejaktivnější vzorce pocházejí ze tří různých oblastí potřeb, ale to neznamená tři oddělené problémy. Naopak: každá z těch tří dvojic tvoří známou a dobře popsanou kombinaci, takže spolu pracují jako jeden systém. Právě proto se profil zvenčí čte snadno, zatímco zevnitř bývá těžké rozeznat, kde končí jeden vzorec a začíná druhý.`
  } else {
    domeny = `Tvoje tři nejaktivnější vzorce pocházejí ze tří různých oblastí. Znamená to, že se nespouštějí naráz, ale každý v jiném typu situace. Profil je tím pestřejší a zároveň hůř čitelný: v jedné situaci se chováš jinak než v druhé, a zvenčí to působí nekonzistentně, i když uvnitř má každá reakce svou logiku.`
  }

  // ---- jak spolu pracují ----
  const mechanismy: string[] = []
  for (let i = 0; i < top.length; i++) {
    for (let j = i + 1; j < top.length; j++) {
      mechanismy.push(popisDvojice(top[i], top[j]))
    }
  }

  // ---- co to dělá dohromady ----
  const nejsilnejsi = top[0]
  const souhrn =
    top.length >= 3
      ? `Dohromady vzniká systém, který se sám udržuje. Nejsilněji se hlásí ${nazevMaly(nejsilnejsi.id)} a ostatní dva vzorce mu dodávají důvody. Právě proto se tenhle způsob fungování nedá přerušit rozhodnutím ani rozumným argumentem: každý z těch tří vysvětluje, proč jsou ty zbylé dva na místě. Nejde o slabost charakteru, ale o strategii, která kdysi fungovala a dodnes se spouští sama, i tam, kde už není potřeba.`
      : `Nejsilněji se hlásí ${nazevMaly(nejsilnejsi.id)}. Vzorec se spouští sám a nezávisle na tom, co si o něm myslíš, protože vznikl jako strategie, která kdysi dávala smysl.`

  // ---- kde začít ----
  // Nejdostupnější je ten, který se nejvíc projevuje v konkrétním chování.
  // Nejsilnější vzorec se z výběru vyřazuje: jít rovnou po něm obvykle skončí
  // jen potvrzením, že to nejde. Když ale jiná možnost není, řekne se to rovnou.
  const podleDostupnosti = (a: VzorecSkore, b: VzorecSkore) =>
    POradiPACE.indexOf(vzorec(a.id).domena) - POradiPACE.indexOf(vzorec(b.id).domena)
  const kandidati = top.filter((v) => v.id !== nejsilnejsi.id).sort(podleDostupnosti)
  const dostupny = kandidati[0]

  const kdeZacit = dostupny
    ? `Začínat se nevyplácí u toho nejsilnějšího, ale u toho nejdostupnějšího, protože nejsilnější vzorec je zároveň nejlépe opevněný. Tady je nejschůdnější ${nazevMaly(dostupny.id)}: projevuje se v konkrétním chování, které jde pozorovat a měnit po malých krocích. Když povolí, uleví se i tomu nejsilnějšímu, protože ztratí jednu ze svých opor.`
    : `Pracovat se dá jedině s tím nejsilnějším, tedy s tématem, které se jmenuje ${nazevMaly(nejsilnejsi.id)}. Platí, že jiný se v této míře neaktivuje. Postupuj po konkrétních situacích, ne po předsevzetích: vzorec se nedá přemluvit, dá se ale opakovaně zaskočit jiným chováním, než jaké čeká.`

  return { domeny, mechanismy, souhrn, kdeZacit }
}
