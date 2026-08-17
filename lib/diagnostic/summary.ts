import { getDimensionContent } from "./content"
import type { DiagnosticResult, DimensionScore, Gender, Lang } from "./types"

// Závěrečné shrnutí vyhodnocení.
//
// Píše se pro klienta, ne pro odborníka: běžnou řečí, bez čísel a bez
// odborných pojmů. Kouč ho může přečíst nahlas a klient mu rozumí napoprvé.
//
// Texty jsou v tabulce podle jazyka, ne ve větvení podle podmínky. Dřív tady
// stálo `lang === "cs" ? česky : anglicky`, což znamenalo, že Slovák dostal
// shrnutí anglicky. Tabulka tuhle chybu neumožňuje: typ `Record<Lang, Texty>`
// nedovolí jazyk vynechat, takže se na nový jazyk nedá zapomenout.

export interface Summary {
  /** dvě až tři věty o celkovém tvaru profilu */
  overall: string
  /** na čem stavět */
  strengths: string
  /** co řešit jako první */
  priorities: string
  /** poznámka k důvěryhodnosti odpovědí; prázdné, když je vše v pořádku */
  caveat: string
  /** doporučený nejbližší krok */
  nextStep: string
}

/** Sada textů shrnutí pro jeden jazyk. */
interface Texty {
  /** celkový tvar profilu podle toho, jak vyšel */
  overall: {
    /** vyplněno tak málo, že profil nejde sestavit */
    nevyplneno: string
    /** téměř všechny oblasti silné */
    vyrovnany: string
    /** rozdíl mezi nejlepší a nejhorší oblastí je 30 procentních bodů a víc */
    nevyrovnany: string
    /** žádná oblast nedosahuje horních dvou pásem */
    bezSilnych: string
    /** obvyklý tvar: něco drží, něco ne */
    vyvazeny: string
  }
  strengths: (oblasti: string) => string
  priorities: (oblasti: string) => string
  caveat: {
    /** kontrolní mechanismy vyplnění zamítly */
    neplatne: string
    /** kontrolní mechanismy doporučují opatrnost */
    opatrne: string
    /** dotazník není vyplněný celý */
    nedokoncene: string
  }
  nextStep: (oblast: string) => string
  heading: { title: string; intro: string }
}

const TEXTY: Record<Lang, Texty> = {
  cs: {
    overall: {
      nevyplneno: "Dotazník nebyl vyplněn v rozsahu, ze kterého by šlo profil sestavit.",
      vyrovnany:
        "Celkově jde o velmi vyrovnaný a silný profil. Většina oblastí funguje spolehlivě i tehdy, když je pod tlakem, a mezi nimi nejsou propady, které by výkon srážely.",
      nevyrovnany:
        "Profil je výrazně nevyrovnaný. Některé oblasti patří k tvým jasným přednostem, jiné za nimi zaostávají natolik, že výsledný výkon táhnou dolů. Právě tenhle rozdíl je zajímavější než jakékoli jednotlivé číslo.",
      bezSilnych:
        "Profil ukazuje, že základ je položený, ale zatím nikde nedrží tak, aby vydržel tlak. Není to slabost, je to fáze: dovednosti existují, chybí jim spolehlivost.",
      vyvazeny:
        "Profil je vyvážený. Máš oblasti, o které se dá bezpečně opřít, a vedle nich pár míst, kde se výkon pod tlakem drolí. To je běžný a dobře zvládnutelný tvar.",
    },
    strengths: (oblasti) =>
      `Nejpevněji stojíš tady: ${oblasti}. Tohle je tvoje zázemí. Když se něco jiného rozkolísá, odsud se dá vyjít. Stojí za to o tyhle oblasti vědomě pečovat, ne je brát jako samozřejmost.`,
    priorities: (oblasti) =>
      `Největší prostor ke zlepšení je tady: ${oblasti}. Neznamená to, že tam něco nefunguje, ale že to zatím není spolehlivé v okamžiku, kdy jde o hodně. Sem se vyplatí dát energii jako první, protože se to promítne i do ostatních oblastí.`,
    caveat: {
      neplatne:
        "Jedna věc je ale potřeba říct na rovinu: kontrolní mechanismy ukazují, že tohle vyplnění pravděpodobně neodráží skutečnost. Ber proto celý profil jako orientační a dotazník si v klidu zopakuj.",
      opatrne:
        "Malá poznámka na okraj: některé kontrolní ukazatele doporučují opatrnost. Nic to neruší, jen si u každého závěru ověř, jestli sedí na konkrétní situace z posledních týdnů.",
      nedokoncene:
        "Dotazník nebyl vyplněn celý, takže část profilu stojí na menším počtu odpovědí, než by bylo ideální.",
    },
    nextStep: (oblast) =>
      `Nejbližší krok: v oblasti „${oblast}“ si vyber jednu jedinou věc a drž ji osm až dvanáct týdnů. Ne tři, jednu. Změna v téhle oblasti se pozná dřív na tom, jak se cítíš v náročných situacích, než na výsledcích.`,
    heading: {
      title: "Shrnutí",
      intro: "Co z celého vyhodnocení plyne, bez čísel a odborných pojmů.",
    },
  },

  sk: {
    overall: {
      nevyplneno: "Dotazník nebol vyplnený v rozsahu, z ktorého by sa dal profil zostaviť.",
      vyrovnany:
        "Celkovo ide o veľmi vyrovnaný a silný profil. Väčšina oblastí funguje spoľahlivo aj vtedy, keď je pod tlakom, a medzi nimi nie sú prepady, ktoré by výkon zrážali.",
      nevyrovnany:
        "Profil je výrazne nevyrovnaný. Niektoré oblasti patria k tvojim jasným prednostiam, iné za nimi zaostávajú natoľko, že výsledný výkon ťahajú dole. Práve tento rozdiel je zaujímavejší než akékoľvek jednotlivé číslo.",
      bezSilnych:
        "Profil ukazuje, že základ je položený, ale zatiaľ nikde nedrží tak, aby vydržal tlak. Nie je to slabosť, je to fáza: schopnosti existujú, chýba im spoľahlivosť.",
      vyvazeny:
        "Profil je vyvážený. Máš oblasti, o ktoré sa dá bezpečne oprieť, a vedľa nich pár miest, kde sa výkon pod tlakom drobí. To je bežný a dobre zvládnuteľný tvar.",
    },
    strengths: (oblasti) =>
      `Najpevnejšie stojíš tu: ${oblasti}. Toto je tvoje zázemie. Keď sa niečo iné rozkolíše, odtiaľto sa dá vyjsť. Stojí za to o tieto oblasti vedome dbať, nie ich brať ako samozrejmosť.`,
    priorities: (oblasti) =>
      `Najväčší priestor na zlepšenie je tu: ${oblasti}. Neznamená to, že tam niečo nefunguje, ale že to zatiaľ nie je spoľahlivé v okamihu, keď ide o veľa. Sem sa vyplatí dať energiu ako prvú, pretože sa to prenesie aj do ostatných oblastí.`,
    caveat: {
      neplatne:
        "Jednu vec je však potrebné povedať na rovinu: kontrolné mechanizmy ukazujú, že toto vyplnenie pravdepodobne neodráža skutočnosť. Ber preto celý profil ako orientačný a dotazník si v pokoji zopakuj.",
      opatrne:
        "Malá poznámka na okraj: niektoré kontrolné ukazovatele odporúčajú opatrnosť. Nič to neruší, len si pri každom závere over, či sedí na konkrétne situácie z posledných týždňov.",
      nedokoncene:
        "Dotazník nebol vyplnený celý, takže časť profilu stojí na menšom počte odpovedí, než by bolo ideálne.",
    },
    nextStep: (oblast) =>
      `Najbližší krok: v oblasti „${oblast}“ si vyber jednu jedinú vec a drž ju osem až dvanásť týždňov. Nie tri, jednu. Zmena v tejto oblasti sa pozná skôr na tom, ako sa cítiš v náročných situáciách, než na výsledkoch.`,
    heading: {
      title: "Zhrnutie",
      intro: "Čo z celého vyhodnotenia vyplýva, bez čísel a odborných pojmov.",
    },
  },

  en: {
    overall: {
      nevyplneno: "The questionnaire was not completed enough for a profile to be built.",
      vyrovnany:
        "Overall this is a very even and strong profile. Most areas hold up reliably even under pressure, and there are no gaps pulling performance down.",
      nevyrovnany:
        "The profile is markedly uneven. Some areas are clear strengths, while others lag far enough behind to drag the overall result down. That gap matters more than any single number.",
      bezSilnych:
        "The profile shows a foundation that is in place but not yet solid enough to hold under pressure. That is not weakness, it is a stage: the skills exist, what they lack is reliability.",
      vyvazeny:
        "The profile is balanced. There are areas you can safely lean on, alongside a few places where performance crumbles under pressure. That is a common and very workable shape.",
    },
    strengths: (oblasti) =>
      `Your firmest ground is here: ${oblasti}. This is your base. When something else wobbles, this is where you start from. It is worth tending these areas deliberately rather than taking them for granted.`,
    priorities: (oblasti) =>
      `The most room for improvement is here: ${oblasti}. It does not mean something is broken there, only that it is not yet dependable when the stakes are high. This is where energy pays off first, because it carries over into the other areas.`,
    caveat: {
      neplatne:
        "One thing needs saying plainly: the control checks suggest this session probably does not reflect reality. Treat the whole profile as indicative only and take the questionnaire again when you have the calm for it.",
      opatrne:
        "A small note: some control indicators suggest caution. Nothing here is invalid, just check each conclusion against concrete situations from the past few weeks.",
      nedokoncene:
        "The questionnaire was not fully completed, so part of the profile rests on fewer answers than would be ideal.",
    },
    nextStep: (oblast) =>
      `Your next step: pick one single thing from ${oblast} and hold it for eight to twelve weeks. Not three things, one. Change here shows up in how you feel in demanding situations well before it shows up in results.`,
    heading: {
      title: "Summary",
      intro: "What the whole evaluation adds up to, without numbers or jargon.",
    },
  },
}

/**
 * Spojí názvy oblastí do výčtu.
 *
 * Odděluje se středníkem, ne spojkou „a": názvy samy obsahují „a" i čárky
 * („odolnost a růstové nastavení mysli"), takže spojka by výčet slila
 * do nesrozumitelné věty.
 */
function spoj(items: string[]): string {
  return items.join("; ")
}

/** Název dimenze malým písmenem, ať se dá vložit doprostřed věty. */
function nazev(d: DimensionScore, lang: Lang): string {
  const n = getDimensionContent(d.id).name[lang]
  return n.charAt(0).toLowerCase() + n.slice(1)
}

export function buildSummary(result: DiagnosticResult, lang: Lang): Summary {
  const dims = result.dimensions.filter((d) => d.reported)
  const serazene = [...dims].sort((a, b) => b.percent - a.percent)
  const silne = serazene.filter((d) => d.band === "elite" || d.band === "strong")
  const slabe = serazene.filter((d) => d.band === "priority" || d.band === "stabilization").reverse()

  const nejsilnejsi = serazene.slice(0, 2)
  const nejslabsi = slabe.slice(0, 2).length ? slabe.slice(0, 2) : serazene.slice(-2).reverse()

  const txt = TEXTY[lang]

  // ---- celkový tvar profilu ----
  let overall: string
  const rozpeti = dims.length ? serazene[0].percent - serazene[serazene.length - 1].percent : 0
  if (!dims.length) {
    overall = txt.overall.nevyplneno
  } else if (silne.length >= dims.length - 1) {
    overall = txt.overall.vyrovnany
  } else if (rozpeti >= 30) {
    overall = txt.overall.nevyrovnany
  } else if (silne.length === 0) {
    overall = txt.overall.bezSilnych
  } else {
    overall = txt.overall.vyvazeny
  }

  // ---- na čem stavět ----
  const strengths = !nejsilnejsi.length
    ? ""
    : txt.strengths(spoj(nejsilnejsi.map((d) => nazev(d, lang))))

  // ---- co řešit jako první ----
  const priorities = !nejslabsi.length
    ? ""
    : txt.priorities(spoj(nejslabsi.map((d) => nazev(d, lang))))

  // ---- poznámka k důvěryhodnosti ----
  let caveat = ""
  if (result.validity.overall === "invalid") {
    caveat = txt.caveat.neplatne
  } else if (result.validity.overall === "caution") {
    caveat = txt.caveat.opatrne
  } else if (!result.complete) {
    caveat = txt.caveat.nedokoncene
  }

  // ---- nejbližší krok ----
  const cil = nejslabsi[0]
  const nextStep = !cil ? "" : txt.nextStep(nazev(cil, lang))

  return { overall, strengths, priorities, caveat, nextStep }
}

/** Nadpis a úvodní věta sekce. */
export function summaryHeading(lang: Lang, gender: Gender): { title: string; intro: string } {
  void gender
  return TEXTY[lang].heading
}
