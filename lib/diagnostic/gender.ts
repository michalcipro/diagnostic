import type { Gender } from "./types"

// Rozvinutí rodových tvarů.
//
// Stojí to ve vlastním souboru, ne v content.ts, kvůli tomu, co si import
// přitáhne s sebou. Dotazník potřebuje jen tuhle funkci, ale content.ts veze
// všech sedm oblastí výkladu ELITE ve třech jazycích. Když si ji stránka
// s dotazníkem brala odtamtud, stahoval si respondent spolu s otázkami
// i celý výklad, tedy to, co má vidět výhradně kouč.

/**
 * Rozvine rodové tvary zapsané jako `{mužský|ženský}`.
 *
 * Čeština rod oslovované osoby prozradí u příčestí minulých, krátkých tvarů
 * a přídavných jmen v přísudku. Nechat ženu číst text v mužském rodě je hrubá
 * chyba, proto se každé takové místo v obsahu označuje a tady se rozvíjí.
 *
 * Slovenština rod řeší stejně jako čeština, takže značka platí i tam.
 * Angličtina rod neřeší – značka se v anglických textech nevyskytuje, a kdyby
 * se tam omylem dostala, rozvine se stejným způsobem a nerozbije větu.
 */
export function applyGender(text: string, gender: Gender): string {
  if (!text.includes("{")) return text
  const zensky = gender === "female"
  return text.replace(/\{([^{}|]*)\|([^{}|]*)\}/g, (_, m: string, f: string) => (zensky ? f : m))
}
