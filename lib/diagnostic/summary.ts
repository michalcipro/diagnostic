import { getDimensionContent } from "./content"
import type { DiagnosticResult, DimensionScore, Gender, Lang } from "./types"

// Závěrečné shrnutí vyhodnocení.
//
// Píše se pro klienta, ne pro odborníka: běžnou řečí, bez čísel a bez
// odborných pojmů. Kouč ho může přečíst nahlas a klient mu rozumí napoprvé.

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

  const cs = lang === "cs"

  // ---- celkový tvar profilu ----
  let overall: string
  const rozpeti = dims.length ? serazene[0].percent - serazene[serazene.length - 1].percent : 0
  if (!dims.length) {
    overall = cs
      ? "Dotazník nebyl vyplněn v rozsahu, ze kterého by šlo profil sestavit."
      : "The questionnaire was not completed enough for a profile to be built."
  } else if (silne.length >= dims.length - 1) {
    overall = cs
      ? "Celkově jde o velmi vyrovnaný a silný profil. Většina oblastí funguje spolehlivě i tehdy, když je pod tlakem, a mezi nimi nejsou propady, které by výkon srážely."
      : "Overall this is a very even and strong profile. Most areas hold up reliably even under pressure, and there are no gaps pulling performance down."
  } else if (rozpeti >= 30) {
    overall = cs
      ? "Profil je výrazně nevyrovnaný. Některé oblasti patří k tvým jasným přednostem, jiné za nimi zaostávají natolik, že výsledný výkon táhnou dolů. Právě tenhle rozdíl je zajímavější než jakékoli jednotlivé číslo."
      : "The profile is markedly uneven. Some areas are clear strengths, while others lag far enough behind to drag the overall result down. That gap matters more than any single number."
  } else if (silne.length === 0) {
    overall = cs
      ? "Profil ukazuje, že základ je položený, ale zatím nikde nedrží tak, aby vydržel tlak. Není to slabost, je to fáze: dovednosti existují, chybí jim spolehlivost."
      : "The profile shows a foundation that is in place but not yet solid enough to hold under pressure. That is not weakness, it is a stage: the skills exist, what they lack is reliability."
  } else {
    overall = cs
      ? "Profil je vyvážený. Máš oblasti, o které se dá bezpečně opřít, a vedle nich pár míst, kde se výkon pod tlakem drolí. To je běžný a dobře zvládnutelný tvar."
      : "The profile is balanced. There are areas you can safely lean on, alongside a few places where performance crumbles under pressure. That is a common and very workable shape."
  }

  // ---- na čem stavět ----
  const strengths = !nejsilnejsi.length
    ? ""
    : cs
      ? `Nejpevněji stojíš tady: ${spoj(nejsilnejsi.map((d) => nazev(d, lang)))}. Tohle je tvoje zázemí. Když se něco jiného rozkolísá, odsud se dá vyjít. Stojí za to o tyhle oblasti vědomě pečovat, ne je brát jako samozřejmost.`
      : `Your firmest ground is here: ${spoj(nejsilnejsi.map((d) => nazev(d, lang)))}. This is your base. When something else wobbles, this is where you start from. It is worth tending these areas deliberately rather than taking them for granted.`

  // ---- co řešit jako první ----
  const priorities = !nejslabsi.length
    ? ""
    : cs
      ? `Největší prostor ke zlepšení je tady: ${spoj(nejslabsi.map((d) => nazev(d, lang)))}. Neznamená to, že tam něco nefunguje, ale že to zatím není spolehlivé v okamžiku, kdy jde o hodně. Sem se vyplatí dát energii jako první, protože se to promítne i do ostatních oblastí.`
      : `The most room for improvement is here: ${spoj(nejslabsi.map((d) => nazev(d, lang)))}. It does not mean something is broken there, only that it is not yet dependable when the stakes are high. This is where energy pays off first, because it carries over into the other areas.`

  // ---- poznámka k důvěryhodnosti ----
  let caveat = ""
  if (result.validity.overall === "invalid") {
    caveat = cs
      ? "Jedna věc je ale potřeba říct na rovinu: kontrolní mechanismy ukazují, že tohle vyplnění pravděpodobně neodráží skutečnost. Ber proto celý profil jako orientační a dotazník si v klidu zopakuj."
      : "One thing needs saying plainly: the control checks suggest this session probably does not reflect reality. Treat the whole profile as indicative only and take the questionnaire again when you have the calm for it."
  } else if (result.validity.overall === "caution") {
    caveat = cs
      ? "Malá poznámka na okraj: některé kontrolní ukazatele doporučují opatrnost. Nic to neruší, jen si u každého závěru ověř, jestli sedí na konkrétní situace z posledních týdnů."
      : "A small note: some control indicators suggest caution. Nothing here is invalid, just check each conclusion against concrete situations from the past few weeks."
  } else if (!result.complete) {
    caveat = cs
      ? "Dotazník nebyl vyplněn celý, takže část profilu stojí na menším počtu odpovědí, než by bylo ideální."
      : "The questionnaire was not fully completed, so part of the profile rests on fewer answers than would be ideal."
  }

  // ---- nejbližší krok ----
  const cil = nejslabsi[0]
  const nextStep = !cil
    ? ""
    : cs
      ? `Nejbližší krok: v oblasti „${nazev(cil, lang)}“ si vyber jednu jedinou věc a drž ji osm až dvanáct týdnů. Ne tři, jednu. Změna v téhle oblasti se pozná dřív na tom, jak se cítíš v náročných situacích, než na výsledcích.`
      : `Your next step: pick one single thing from ${nazev(cil, lang)} and hold it for eight to twelve weeks. Not three things, one. Change here shows up in how you feel in demanding situations well before it shows up in results.`

  return { overall, strengths, priorities, caveat, nextStep }
}

/** Nadpis a úvodní věta sekce. */
export function summaryHeading(lang: Lang, gender: Gender): { title: string; intro: string } {
  void gender
  return lang === "cs"
    ? {
        title: "Shrnutí",
        intro: "Co z celého vyhodnocení plyne, bez čísel a odborných pojmů.",
      }
    : {
        title: "Summary",
        intro: "What the whole evaluation adds up to, without numbers or jargon.",
      }
}
