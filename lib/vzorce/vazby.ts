import type { Lang } from "../diagnostic/types"
import { maVlastniPopis, nazevVzorce, popisDvojiceProJazyk } from "./content"
import { NAZVY_DOMEN, POTREBA_DOMENY, vzorec } from "./structure"
import type { Domena, Varianta, VysledekVzorcu, VzorecId, VzorecSkore } from "./types"

// Souvislosti mezi vzorci.
//
// Tři aktivní vzorce nejsou tři oddělené popisy. Teprve to, jak spolu pracují,
// vysvětluje, proč se člověk chová způsobem, kterému sám nerozumí. Tenhle
// modul proto skládá propojené shrnutí ze tří vrstev: která oblast potřeb je
// zasažená, jak se konkrétní dvojice vzájemně živí, a kde se dá začít.
//
// Věty se skládají za běhu z výsledků, takže se nedají přeložit jako řetězec
// v datovém souboru. Šablony proto stojí tady, pro každý jazyk jedna sada.
// Hotové texty dvojic a vzorců jsou v lib/vzorce/data.

/** Klíč dvojice nezávislý na pořadí. */
function paruj(a: VzorecId, b: VzorecId): string {
  return a < b ? `${a}-${b}` : `${b}-${a}`
}

/**
 * Šablony vět, které se skládají z výsledku.
 *
 * Všechny jsou psané tak, aby doplňovaný název stál v prvním pádě: proto
 * „do oblasti, kterou je X“ a ne „do oblasti X“. Vypadá to trochu opisně,
 * ale je to jediný způsob, jak větu poskládat bez skloňování, a platí to
 * v češtině i ve slovenštině stejně.
 */
interface Sablony {
  stejnaDomena: (a: string, b: string, potreba: string) => string
  ruzneDomeny: (a: string, b: string, potrebaA: string, potrebaB: string) => string
  domenyVsechny: (domena: string, potreba: string) => string
  domenyDve: (domena: string, potreba: string, druha: string) => string
  domenyProvazane: string
  domenyPestre: string
  souhrnTri: (nejsilnejsi: string) => string
  souhrnJeden: (nejsilnejsi: string) => string
  kdeZacitDostupny: (dostupny: string) => string
  kdeZacitJenNejsilnejsi: (nejsilnejsi: string) => string
}

const CS: Sablony = {
  stejnaDomena: (a, b, potreba) =>
    `Vzorce ${a} a ${b} vycházejí ze stejné oblasti. Chybí tu totéž: ${potreba}. Proto se navzájem posilují, co spustí jeden, obvykle probudí i druhý, a rozlišit je zevnitř bývá těžké.`,
  ruzneDomeny: (a, b, potrebaA, potrebaB) =>
    `Vzorce ${a} a ${b} pocházejí ze dvou různých oblastí. U prvního chybí ${potrebaA}, u druhého ${potrebaB}. Nespouštějí se proto vždy naráz, ale jakmile se potkají v jedné situaci, zesílí se navzájem.`,
  domenyVsechny: (domena, potreba) =>
    `Všechny tři nejaktivnější vzorce spadají do jedné oblasti, kterou je ${domena}. To je důležitá informace sama o sobě: neznamená to tři různé problémy, ale jedno téma ve třech podobách. Chybějícím kusem je tu ${potreba}.`,
  domenyDve: (domena, potreba, druha) =>
    `Dva ze tří nejaktivnějších vzorců spadají do oblasti, kterou je ${domena}, tedy k tématu, jímž je ${potreba}. Třetí přichází odjinud, z oblasti, kterou je ${druha}. Právě tenhle třetí bývá tím, co celek drží v chodu, protože nabízí zdánlivé řešení prvních dvou.`,
  domenyProvazane:
    "Tvoje tři nejaktivnější vzorce pocházejí ze tří různých oblastí potřeb, ale to neznamená tři oddělené problémy. Naopak: každá z těch tří dvojic tvoří známou a dobře popsanou kombinaci, takže spolu pracují jako jeden systém. Právě proto se profil zvenčí čte snadno, zatímco zevnitř bývá těžké rozeznat, kde končí jeden vzorec a začíná druhý.",
  domenyPestre:
    "Tvoje tři nejaktivnější vzorce pocházejí ze tří různých oblastí. Znamená to, že se nespouštějí naráz, ale každý v jiném typu situace. Profil je tím pestřejší a zároveň hůř čitelný: v jedné situaci se chováš jinak než v druhé, a zvenčí to působí nekonzistentně, i když uvnitř má každá reakce svou logiku.",
  souhrnTri: (nejsilnejsi) =>
    `Dohromady vzniká systém, který se sám udržuje. Nejsilněji se hlásí ${nejsilnejsi} a ostatní dva vzorce dodávají důvody právě tomuto vzorci. Právě proto se tenhle způsob fungování nedá přerušit rozhodnutím ani rozumným argumentem: každý z těch tří vysvětluje, proč jsou ty zbylé dva na místě. Nejde o slabost charakteru, ale o strategii, která kdysi fungovala a dodnes se spouští sama, i tam, kde už není potřeba.`,
  souhrnJeden: (nejsilnejsi) =>
    `Nejsilněji se hlásí ${nejsilnejsi}. Vzorec se spouští sám a nezávisle na tom, co si o něm myslíš, protože vznikl jako strategie, která kdysi dávala smysl.`,
  kdeZacitDostupny: (dostupny) =>
    `Začínat se nevyplácí u toho nejsilnějšího, ale u toho nejdostupnějšího, protože nejsilnější vzorec je zároveň nejlépe opevněný. Tady je nejschůdnější ${dostupny}: projevuje se v konkrétním chování, které jde pozorovat a měnit po malých krocích. Když povolí, uleví se i tomu nejsilnějšímu, protože ztratí jednu ze svých opor.`,
  kdeZacitJenNejsilnejsi: (nejsilnejsi) =>
    `Pracovat se dá jedině s tím nejsilnějším, tedy s tématem, které se jmenuje ${nejsilnejsi}. Platí, že jiný se v této míře neaktivuje. Postupuj po konkrétních situacích, ne po předsevzetích: vzorec se nedá přemluvit, dá se ale opakovaně zaskočit jiným chováním, než jaké čeká.`,
}

const SK: Sablony = {
  stejnaDomena: (a, b, potreba) =>
    `Vzorce ${a} a ${b} vychádzajú z tej istej oblasti. Chýba tu to isté: ${potreba}. Preto sa navzájom posilňujú, čo spustí jeden, obvykle prebudí aj druhý, a rozlíšiť ich zvnútra býva ťažké.`,
  ruzneDomeny: (a, b, potrebaA, potrebaB) =>
    `Vzorce ${a} a ${b} pochádzajú z dvoch rôznych oblastí. Pri prvom chýba ${potrebaA}, pri druhom ${potrebaB}. Nespúšťajú sa preto vždy naraz, ale len čo sa stretnú v jednej situácii, zosilnia sa navzájom.`,
  domenyVsechny: (domena, potreba) =>
    `Všetky tri najaktívnejšie vzorce spadajú do jednej oblasti, ktorou je ${domena}. To je dôležitá informácia sama o sebe: neznamená to tri rôzne problémy, ale jednu tému v troch podobách. Chýbajúcim kusom je tu ${potreba}.`,
  domenyDve: (domena, potreba, druha) =>
    `Dva z troch najaktívnejších vzorcov spadajú do oblasti, ktorou je ${domena}, teda k téme, ktorou je ${potreba}. Tretí prichádza odinakiaľ, z oblasti, ktorou je ${druha}. Práve tento tretí býva tým, čo celok drží v chode, pretože ponúka zdanlivé riešenie prvých dvoch.`,
  domenyProvazane:
    "Tvoje tri najaktívnejšie vzorce pochádzajú z troch rôznych oblastí potrieb, ale to neznamená tri oddelené problémy. Naopak: každá z tých troch dvojíc tvorí známu a dobre opísanú kombináciu, takže spolu pracujú ako jeden systém. Práve preto sa profil zvonku číta ľahko, zatiaľ čo zvnútra býva ťažké rozoznať, kde končí jeden vzorec a začína druhý.",
  domenyPestre:
    "Tvoje tri najaktívnejšie vzorce pochádzajú z troch rôznych oblastí. Znamená to, že sa nespúšťajú naraz, ale každý v inom type situácie. Profil je tým pestrejší a zároveň horšie čitateľný: v jednej situácii sa správaš inak než v druhej, a zvonku to pôsobí nekonzistentne, aj keď vnútri má každá reakcia svoju logiku.",
  souhrnTri: (nejsilnejsi) =>
    `Dohromady vzniká systém, ktorý sa sám udržiava. Najsilnejšie sa hlási ${nejsilnejsi} a ostatné dva vzorce dodávajú dôvody práve tomuto vzorcu. Práve preto sa tento spôsob fungovania nedá prerušiť rozhodnutím ani rozumným argumentom: každý z tých troch vysvetľuje, prečo sú tie zvyšné dva na mieste. Nejde o slabosť charakteru, ale o stratégiu, ktorá kedysi fungovala a dodnes sa spúšťa sama, aj tam, kde už nie je potrebná.`,
  souhrnJeden: (nejsilnejsi) =>
    `Najsilnejšie sa hlási ${nejsilnejsi}. Vzorec sa spúšťa sám a nezávisle od toho, čo si o ňom myslíš, pretože vznikol ako stratégia, ktorá kedysi dávala zmysel.`,
  kdeZacitDostupny: (dostupny) =>
    `Začínať sa neoplatí pri tom najsilnejšom, ale pri tom najdostupnejšom, pretože najsilnejší vzorec je zároveň najlepšie opevnený. Najschodnejšie je tu začať pri vzorci, ktorý sa volá ${dostupny}: prejavuje sa v konkrétnom správaní, ktoré sa dá pozorovať a meniť po malých krokoch. Keď povolí, uľaví sa aj tomu najsilnejšiemu, pretože stratí jednu zo svojich opôr.`,
  kdeZacitJenNejsilnejsi: (nejsilnejsi) =>
    `Pracovať sa dá jedine s tým najsilnejším, teda s témou, ktorá sa volá ${nejsilnejsi}. Platí, že iný sa v tejto miere neaktivuje. Postupuj po konkrétnych situáciách, nie po predsavzatiach: vzorec sa nedá prehovoriť, dá sa však opakovane zaskočiť iným správaním, než aké čaká.`,
}

const EN: Sablony = {
  stejnaDomena: (a, b, potreba) =>
    `The ${a} and ${b} patterns come from the same area. The same thing is missing in both: ${potreba}. That is why they reinforce each other: whatever sets off one usually wakes the other, and from the inside they are hard to tell apart.`,
  ruzneDomeny: (a, b, potrebaA, potrebaB) =>
    `The ${a} and ${b} patterns come from two different areas. The first is missing ${potrebaA}, the second ${potrebaB}. They therefore do not always fire together, but once they meet in a single situation they amplify each other.`,
  domenyVsechny: (domena, potreba) =>
    `All three of the most active patterns fall into one area: ${domena}. That is important information in itself: it does not mean three different problems, but one theme in three guises. The missing piece here is ${potreba}.`,
  domenyDve: (domena, potreba, druha) =>
    `Two of the three most active patterns fall into the area of ${domena}, that is, the theme of ${potreba}. The third comes from elsewhere, from the area of ${druha}. It is usually that third one that keeps the whole thing running, because it offers an apparent solution to the first two.`,
  domenyProvazane:
    "Your three most active patterns come from three different areas of need, but that does not mean three separate problems. Quite the opposite: each of those three pairs forms a known and well-described combination, so they work together as one system. That is why the profile reads easily from the outside, while from the inside it is hard to tell where one pattern ends and the next begins.",
  domenyPestre:
    "Your three most active patterns come from three different areas. It means they do not fire together, but each in a different kind of situation. That makes the profile more varied and at the same time harder to read: you behave one way in one situation and differently in another, and from the outside it looks inconsistent, even though every reaction has its own logic on the inside.",
  souhrnTri: (nejsilnejsi) =>
    `Together they form a system that sustains itself. The loudest of them is ${nejsilnejsi}, and the other two supply the reasons for exactly that pattern. That is why this way of functioning cannot be interrupted by a decision or a reasonable argument: each of the three explains why the other two belong. This is not weakness of character, but a strategy that once worked and still fires on its own, even where it is no longer needed.`,
  souhrnJeden: (nejsilnejsi) =>
    `The loudest of them is ${nejsilnejsi}. The pattern fires by itself and regardless of what you think about it, because it grew as a strategy that once made sense.`,
  kdeZacitDostupny: (dostupny) =>
    `It does not pay to start with the strongest pattern, but with the most reachable one, because the strongest is also the best fortified. The most workable place here is ${dostupny}: it shows up in concrete behaviour that can be observed and changed in small steps. When it loosens, the strongest one eases too, because it loses one of its supports.`,
  kdeZacitJenNejsilnejsi: (nejsilnejsi) =>
    `The only one worth working with is the strongest, that is, the theme called ${nejsilnejsi}. No other one activates to this degree. Work through concrete situations rather than resolutions: a pattern cannot be talked out of, but it can repeatedly be caught out by behaviour it does not expect.`,
}

const SABLONY: Record<Lang, Sablony> = { cs: CS, sk: SK, en: EN }

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

/** Název vzorce s malým počátečním písmenem, aby seděl doprostřed věty. */
function nazevMaly(id: VzorecId, lang: Lang, varianta: Varianta): string {
  const n = nazevVzorce(id, lang, varianta)
  return n.charAt(0).toLowerCase() + n.slice(1)
}

/** Popis dvojice; když pro ni není vlastní text, složí se z domén. */
function popisDvojice(a: VzorecSkore, b: VzorecSkore, lang: Lang, varianta: Varianta): string {
  const vlastni = popisDvojiceProJazyk(paruj(a.id, b.id), lang, varianta)
  if (vlastni) return vlastni
  const s = SABLONY[lang]
  const potreba = POTREBA_DOMENY[lang]
  const da = vzorec(a.id).domena
  const db = vzorec(b.id).domena
  if (da === db) {
    return s.stejnaDomena(nazevMaly(a.id, lang, varianta), nazevMaly(b.id, lang, varianta), potreba[da])
  }
  return s.ruzneDomeny(
    nazevMaly(a.id, lang, varianta),
    nazevMaly(b.id, lang, varianta),
    potreba[da],
    potreba[db],
  )
}

export function propoj(
  vysledek: VysledekVzorcu,
  lang: Lang = "cs",
  varianta: Varianta = "obecna",
): Propojeni | null {
  const top = vysledek.top3
  if (top.length === 0) return null

  const s = SABLONY[lang]
  const nazvyDomen = NAZVY_DOMEN[varianta][lang]
  const potreba = POTREBA_DOMENY[lang]

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
      ? top.flatMap((a, i) =>
          top.slice(i + 1).map((b) => (maVlastniPopis(paruj(a.id, b.id), varianta) ? 1 : 0)),
        )
          .reduce((x: number, y: number) => x + y, 0)
      : 0
  const vsechnyDvojicePopsane = top.length >= 3 && dvojicVlastnich >= 2

  let domeny: string
  if (vzorceDomeny.length === 3) {
    domeny = s.domenyVsechny(nazvyDomen[hlavniDomena].toLowerCase(), potreba[hlavniDomena])
  } else if (vzorceDomeny.length === 2) {
    const zbytek = serazeneDomeny[1][0]
    domeny = s.domenyDve(
      nazvyDomen[hlavniDomena].toLowerCase(),
      potreba[hlavniDomena],
      nazvyDomen[zbytek].toLowerCase(),
    )
  } else if (vsechnyDvojicePopsane) {
    domeny = s.domenyProvazane
  } else {
    domeny = s.domenyPestre
  }

  // ---- jak spolu pracují ----
  const mechanismy: string[] = []
  for (let i = 0; i < top.length; i++) {
    for (let j = i + 1; j < top.length; j++) {
      mechanismy.push(popisDvojice(top[i], top[j], lang, varianta))
    }
  }

  // ---- co to dělá dohromady ----
  const nejsilnejsi = top[0]
  const souhrn =
    top.length >= 3
      ? s.souhrnTri(nazevMaly(nejsilnejsi.id, lang, varianta))
      : s.souhrnJeden(nazevMaly(nejsilnejsi.id, lang, varianta))

  // ---- kde začít ----
  // Nejdostupnější je ten, který se nejvíc projevuje v konkrétním chování.
  // Nejsilnější vzorec se z výběru vyřazuje: jít rovnou po něm obvykle skončí
  // jen potvrzením, že to nejde. Když ale jiná možnost není, řekne se to rovnou.
  const podleDostupnosti = (a: VzorecSkore, b: VzorecSkore) =>
    POradiPACE.indexOf(vzorec(a.id).domena) - POradiPACE.indexOf(vzorec(b.id).domena)
  const kandidati = top.filter((v) => v.id !== nejsilnejsi.id).sort(podleDostupnosti)
  const dostupny = kandidati[0]

  const kdeZacit = dostupny
    ? s.kdeZacitDostupny(nazevMaly(dostupny.id, lang, varianta))
    : s.kdeZacitJenNejsilnejsi(nazevMaly(nejsilnejsi.id, lang, varianta))

  return { domeny, mechanismy, souhrn, kdeZacit }
}
