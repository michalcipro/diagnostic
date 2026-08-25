import { applyGender } from "../lib/diagnostic/gender"
import { evaluate } from "../lib/diagnostic/scoring"
import { getStructure } from "../lib/diagnostic/structure"
import { OBSAH_HRACE, type HracLang } from "../lib/tym/obsah-hrace"
import { HRAC, type HracVyhodnoceni } from "../lib/tym/hrac"
import type { BandKey, DimensionId, Gender } from "../lib/diagnostic/types"

// Sestavení vyhodnocení pro hráče v klubové větvi.
//
// Běží na serveru schválně. Kdyby se text skládal v prohlížeči, musely by tam
// být vyhodnocovací klíče, tedy mapování položek na oblasti, obrácené položky
// a hranice pásem. To je přesně to, co se ke hráči dostat nesmí: kdo je zná,
// projde kontrolami platnosti podle libosti. Do prohlížeče proto jde hotový
// text, ne data plus návod, jak z nich text udělat.

const PORADI: DimensionId[] = ["A", "B", "C", "D", "E", "F", "G"]

/** Kolik oblastí se vypíchne jako nejsilnější a kolik jako prostor k práci. */
const KOLIK = 2

/**
 * Shrnutí na závěr.
 *
 * Mluví se ke hráči přímo a bez odborných slov. Záměrně nepojmenovává, co má
 * dělat: to je práce kouče, a hráč, který si výsledky nechal pro sebe, žádného
 * kouče u toho nemá. Cílem je, aby si odnesl obrázek, ne úkoly.
 */
function shrnuti(
  lang: HracLang,
  nejsilnejsi: DimensionId[],
  kProci: DimensionId[],
  gender: Gender,
): string[] {
  const o = OBSAH_HRACE[lang]
  const jmena = (ids: DimensionId[]) => ids.map((id) => o[id].nazev.toLowerCase()).join(lang === "cs" ? " a " : " and ")
  if (lang === "en") {
    return [
      `Your profile holds up best in ${jmena(nejsilnejsi)}. That is what you can lean on when things get hard, and it is worth knowing that about yourself before you need it.`,
      `There is the most room in ${jmena(kProci)}. It is not a verdict; these are the parts that move fastest once somebody works on them deliberately.`,
      "Everything here describes how you are set up right now, not what you are like. Answering the same survey after a season of work usually looks different.",
    ]
  }
  return [
    `Nejlíp ti drží ${jmena(nejsilnejsi)}. O tohle se dá opřít, když je zle, a vyplatí se to o sobě vědět dřív, než to budeš potřebovat.`,
    `Nejvíc prostoru je v ${jmena(kProci)}. Není to ortel: zrovna tyhle části se hýbou nejrychleji, jakmile na nich někdo cíleně pracuje.`,
    applyGender(
      "Všechno tady popisuje, jak to máš nastavené teď, ne jaký{|á} jsi. Když stejný dotazník vyplníš po sezoně práce, vypadá to obvykle jinak.",
      gender,
    ),
  ]
}

/** Poskládá hráči jeho vyhodnocení z odpovědí. */
export function vyhodnoceniHrace(
  odpovedi: Record<number, 1 | 2 | 3 | 4 | 5>,
  opts: {
    lang: string
    tym: string
    jmeno: string
    gender: Gender
    durationSec?: number
    datum: string
  },
): HracVyhodnoceni {
  const lang: HracLang = opts.lang === "en" ? "en" : "cs"
  const t = HRAC[lang]
  const o = OBSAH_HRACE[lang]
  const vysledek = evaluate(getStructure("elite200"), odpovedi, { durationSec: opts.durationSec })

  const oblasti = PORADI.map((id) => {
    const d = vysledek.dimensions.find((x) => x.id === id)
    const band: BandKey = d?.band ?? "stabilization"
    return {
      id,
      nazev: o[id].nazev,
      uvod: applyGender(o[id].uvod, opts.gender),
      band,
      percent: d?.reported ? d.percent : 0,
      vyklad: applyGender(o[id].pasma[band], opts.gender),
    }
  })

  const podleSily = [...oblasti].filter((x) => x.percent > 0).sort((a, b) => b.percent - a.percent)
  const nejsilnejsi = podleSily.slice(0, KOLIK).map((x) => x.id)
  const kProci = podleSily.slice(-KOLIK).reverse().map((x) => x.id)

  return {
    tym: opts.tym,
    jmeno: opts.jmeno,
    datum: opts.datum,
    oblasti,
    nejsilnejsi,
    kProci,
    shrnuti: shrnuti(lang, nejsilnejsi, kProci, opts.gender),
    // Neplatné vyplnění se hráči neschovává. Dozvědět se, že to vyšlo divně,
    // je pro něj užitečnější než dostat obrázek, kterému se dá věřit jen zdánlivě.
    varovani: vysledek.validity?.overall === "invalid" ? t.varovani : undefined,
  }
}
