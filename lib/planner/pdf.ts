import {
  BARVA,
  NA_SIRKU,
  Sazba,
  novyDokument,
  type BunkaTabulky,
  type SloupecTabulky,
} from "@/lib/diagnostic/pdf/sazba"
import { applyGender } from "@/lib/diagnostic/gender"
import type { Gender, Lang } from "@/lib/diagnostic/types"
import { NAZVY_METRIK, NAZVY_REFLEXE, UI, cislo } from "./i18n"
import {
  HODINY,
  METRIKY,
  POSLEDNI_HODINA,
  PRVNI_HODINA,
  REFLEXE,
  ROZSAH,
  type PlannerDay,
  type PlannerHabit,
} from "./types"
import { ZKRATKY_DNU, dnyTydne, popisRozsahuTydne, popisTydne } from "./datum"

// Export týdenního listu do PDF.
//
// Proč se PDF skládá tady a nenechává se na tiskovém dialogu prohlížeče: na
// iPhonu z tiskového dialogu nejde soubor uložit ani odeslat. Takhle vznikne
// skutečný soubor, který jde přes systémové sdílení poslat dál nebo uložit
// do Souborů.
//
// SAZBA: stejná jako u přehledu deníku i u vyhodnocení diagnostiky, jen na
// šířku, protože sedm dnů vedle sebe se na výšku nevejde. Dřív to byla věrná
// kopie papírové předlohy i s černými pruhy a plnou mřížkou; vedle ostatních
// dokumentů to působilo jako výstup jiného programu. Zůstala z ní stavba,
// tedy co je kde, ne její grafika.
//
// Všechny míry se počítají ze šířky sazby, nikde není natvrdo psaná
// souřadnice. Dvoustrana tak drží zarovnání i kdyby se změnily okraje.

/**
 * Znaky, které vložené písmo umí.
 *
 * Je osekané jen na to, co aplikace potřebuje, takže cokoli mimo by se
 * vytisklo jako prázdné místo. Text z deníku píše člověk, ne aplikace, takže
 * se sem dostane i emotikon nebo cizí abeceda. Místo prázdna se z takového
 * znaku sundá diakritika, a když ani to nepomůže, vypustí se: nečitelný
 * čtvereček v tisku vypadá jako chyba programu, chybějící emotikon ne.
 */
const PODPOROVANE =
  // Rozsahy jdou po řadě: ASCII, latinka se západní diakritikou, česká
  // a slovenská písmena, typografická interpunkce, značky a šipky.
  // Pomlčky a uvozovky se píšou kódem, ne znakem: dlouhá pomlčka se
  // v tomhle projektu nikde nepoužívá a ve zdrojáku by se hledala jako
  // chyba, i když je tu jen jako povolený vstup z klientova textu.
  /[ -~\u00A3\u00A7\u00A9\u00AB\u00AE\u00B0\u00B1\u00B7\u00BB\u00C0-\u00C2\u00C4\u00C7-\u00CB\u00CD\u00D3\u00D4\u00D6-\u00D8\u00DA\u00DC\u00DD\u00DF-\u00E2\u00E4\u00E7-\u00EB\u00ED\u00F3\u00F4\u00F6\u00FA\u00FC\u00FD\u010C-\u010F\u011A\u011B\u0139\u013A\u013D\u013E\u0147\u0148\u0154\u0155\u0158\u0159\u0160\u0161\u0164\u0165\u016E\u016F\u017D\u017E\u2013\u2014\u2018-\u201A\u201C-\u201E\u2022\u2026\u20AC\u2122\u2190-\u2193\u2264\u2265]/

/**
 * Znaky, které písmo nemá, ale mají zřejmou náhradu.
 *
 * Matematické minus je tu ten důležitý. Píše se jím záporná změna a v písmu
 * chybí, takže se beze stopy ztratilo a z „−1,5" se v PDF stalo „1,5".
 * Číslo přitom zůstalo červené, takže dokument tvrdil pravý opak toho, co
 * se stalo. Odstranění neznámého znaku je u textu klienta správná odpověď,
 * u znaménka je to chyba, kterou nikdo nepozná.
 */
const NAHRADY: Record<string, string> = {
  "\u2212": "-", // matematické minus
  "\u2010": "-", // spojovník
  "\u2011": "-", // nezlomitelný spojovník
  "\u00A0": " ", // nezlomitelná mezera
  "\u202F": " ", // úzká nezlomitelná mezera
  "\u2009": " ", // úzká mezera
  "\u200B": "", // nulová mezera
}

export function ocisti(text: string): string {
  let out = ""
  for (const znak of text) {
    if (PODPOROVANE.test(znak)) {
      out += znak
      continue
    }
    const nahrada = NAHRADY[znak]
    if (nahrada !== undefined) {
      out += nahrada
      continue
    }
    // Druhý pokus bez diakritiky: „ñ" projde jako „n", což je pořád čitelné.
    const bez = znak.normalize("NFD").replace(/[\u0300-\u036F]/g, "")
    if (bez && [...bez].every((z) => PODPOROVANE.test(z))) out += bez
  }
  return out
}


export interface PdfVstupTydne {
  monday: string
  dny: Map<string, PlannerDay>
  poznamky: string
  navyky: PlannerHabit[]
  jmeno: string
  lang: Lang
  gender: Gender
}

/** Název souboru: týden a jméno. */
export function nazevSouboru(v: PdfVstupTydne): string {
  return `tydenni-plan-${v.monday}-${v.jmeno}`
    .replace(/[/\\?%*:|"<>]/g, "-")
    .replace(/\s+/g, "-")
    .toLowerCase()
    .slice(0, 120)
    .concat(".pdf")
}

/** Popisek hodiny, „05:00". */
function popisHodiny(h: number): string {
  return `${String(h).padStart(2, "0")}:00`
}

/**
 * Rozvržení dvoustrany.
 *
 * Levý sloupec je širší, protože nese rozvrh se sedmi dny a hodinami; pravý
 * stačí užší, tam jsou jen kolečka a jednociferná čísla.
 *
 * Všechny výšky se počítají dopředu z místa, které na stránce zbývá, a teprve
 * pak se kreslí. Díky tomu list vždycky vyjde na jednu stranu, oba sloupce
 * končí ve stejné výšce a denní reflexe začíná pokaždé na stejném místě, ať
 * má klient návyky tři nebo dvacet. Kdyby se sázelo shora dolů a doufalo se,
 * že to vyjde, přetekla by při plném trackeru reflexe na druhou stranu.
 */
const POMER_LEVEHO = 0.587
const MEZERA_SLOUPCU = 7
const MEZERA_BLOKU = 4.5

/** Výška nadpisu oddílu i s linkou pod ním. */
const VYSKA_NADPISU = 8.4
/** Výška řádku s popisky sloupců v tabulce. */
const VYSKA_HLAVICKY = 5.6
/** Co si tabulka přidá pod poslední řádek. */
const DOBEH_TABULKY = 2

/** Meze výšky řádku, aby zůstal čitelný a zároveň se vešel. */
const mez = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v))

export function sestavTydenniPdf(v: PdfVstupTydne): Blob {
  const { monday, dny, poznamky, navyky, jmeno, lang, gender } = v
  const t = UI[lang]
  const data = dnyTydne(monday)
  const zkratky = ZKRATKY_DNU[lang]

  const doc = novyDokument("landscape")
  const s = new Sazba(doc, NA_SIRKU)

  const sirkaLeva = (s.sirka - MEZERA_SLOUPCU) * POMER_LEVEHO
  const sirkaPrava = s.sirka - MEZERA_SLOUPCU - sirkaLeva
  const xLevy = s.levyKraj
  const xPravy = s.levyKraj + sirkaLeva + MEZERA_SLOUPCU
  const dno = s.g.vyskaStrany - s.g.okraj.dolni

  // ── hlavička ────────────────────────────────────────────────────────────
  //
  // Stejná stavba jako u přehledu deníku: značka drobně, název velký, pod ním
  // linka. Jen sevřenější, protože list pod ní potřebuje každý milimetr.
  const zaklad = s.y
  s.pismo(7.4, true, BARVA.slaba)
  doc.text("WINNING MINDS", xLevy, zaklad + 2.6, { charSpace: 1.1 })
  doc.text(ocisti(jmeno.toUpperCase()), s.pravyKraj, zaklad + 2.6, {
    align: "right",
    charSpace: 0.6,
  })

  s.pismo(15.5, true, BARVA.text)
  doc.text(ocisti(`${t.appName} · ${t.tabTyden}`), xLevy, zaklad + 11)
  s.pismo(10, false, BARVA.text2)
  doc.text(
    `${popisRozsahuTydne(monday, lang)}  ·  ${t.weekOf} ${popisTydne(monday)}`,
    s.pravyKraj,
    zaklad + 11,
    { align: "right" },
  )
  s.y = zaklad + 13.6
  s.linka()
  s.mezera(5)

  const zacatekSloupcu = s.y

  // ── rozpočet výšek ──────────────────────────────────────────────────────
  const viditelne = navyky.filter(
    (h) => !h.archivedAt || data.some((d) => dny.get(d)?.habits.includes(h.id)),
  )
  const RADKU_POZNAMEK = 3
  const vyskaRadkuReflexe = 6.6
  const vyskaReflexe =
    VYSKA_NADPISU + VYSKA_HLAVICKY + REFLEXE.length * vyskaRadkuReflexe + DOBEH_TABULKY
  const vyskaSloupcu = dno - zacatekSloupcu - vyskaReflexe - MEZERA_BLOKU

  // Levý sloupec nese jen rozvrh, takže mu zbyde na osmnáct hodin nejvíc
  // místa a záznamy se nemusí ořezávat hned u druhého slova.
  const mistoNaRozvrh = vyskaSloupcu - VYSKA_NADPISU - VYSKA_HLAVICKY - DOBEH_TABULKY
  const vyskaRadkuRozvrhu = mez(mistoNaRozvrh / HODINY.length, 3.4, 6.4)

  // Pravý sloupec: tracker, denní postup a pod nimi poznámky. Poznámky mají
  // pevnou výšku řádku, ať se na ně dá psát rukou; tracker a postup si dělí
  // zbytek podle počtu řádků, takže sloupec vždycky přesně dojde tam, kam
  // levý, a nezůstane v něm díra.
  const vyskaRadkuPoznamek = 5.8
  const vyskaPoznamek = VYSKA_NADPISU + RADKU_POZNAMEK * vyskaRadkuPoznamek + DOBEH_TABULKY
  const radkuVpravo = viditelne.length + METRIKY.length
  const mistoNaRadkyVpravo =
    vyskaSloupcu -
    2 * MEZERA_BLOKU -
    vyskaPoznamek -
    2 * (VYSKA_NADPISU + VYSKA_HLAVICKY + DOBEH_TABULKY)
  const vyskaRadkuVpravo = mez(radkuVpravo ? mistoNaRadkyVpravo / radkuVpravo : 6.4, 3.4, 9)

  const podilNazvu = 0.34
  /** Popisek řádku je na střed a tučně, stejně jako v aplikaci. */
  const sloupecPopisku = { popis: "", podil: podilNazvu, stred: true }
  const podilDnePrava = (1 - podilNazvu) / 7
  const sloupceDnu = zkratky.map((z) => ({ popis: z, podil: podilDnePrava, stred: true }))

  // ── levý sloupec ────────────────────────────────────────────────────────
  s.nadpis(t.weeklySchedule, 9.5, { x: xLevy, sirka: sirkaLeva, mezeraPo: 2 })

  const sirkaHodin = 12
  const podilHodin = sirkaHodin / sirkaLeva
  const podilDne = (1 - podilHodin) / 7
  s.tabulka(
    [
      { popis: "", podil: podilHodin, stred: true },
      // Na střed jako popisky dnů nad tím. Ořezává se zprava a s třemi
      // tečkami, takže i u vystředěného textu zůstane začátek.
      ...zkratky.map((z) => ({ popis: z, podil: podilDne, stred: true })),
    ],
    HODINY.map((h) => [
      { text: popisHodiny(h), barva: BARVA.slaba },
      ...data.map((datum) => ({
        text: dny.get(datum)?.schedule.find((b) => b.hour === h)?.text ?? "",
      })),
    ]),
    {
      x: xLevy,
      sirka: sirkaLeva,
      velikost: 6.2,
      vyskaRadku: vyskaRadkuRozvrhu,
      svisleLinky: true,
    },
  )

  // ── pravý sloupec ───────────────────────────────────────────────────────
  s.y = zacatekSloupcu
  s.nadpis(t.habitTracker, 9.5, { x: xPravy, sirka: sirkaPrava, mezeraPo: 2 })
  if (viditelne.length) {
    s.tabulka(
      [sloupecPopisku, ...sloupceDnu],
      viditelne.map((h) => [
        { text: ocisti(h.target ? `${h.name}  ${h.target}\u00D7` : h.name), tucne: true },
        ...data.map((datum) => ({
          kolecko: (dny.get(datum)?.habits.includes(h.id) ? "plne" : "prazdne") as
            | "plne"
            | "prazdne",
        })),
      ]),
      {
        x: xPravy,
        sirka: sirkaPrava,
        velikost: vyskaRadkuVpravo >= 5.6 ? 7.4 : 6.6,
        vyskaRadku: vyskaRadkuVpravo,
      },
    )
  } else {
    s.text(t.zadneNavyky, { x: xPravy, sirka: sirkaPrava, velikost: 7.2, barva: BARVA.slaba })
  }

  s.mezera(MEZERA_BLOKU)
  s.nadpis(t.dailyProgress, 9.5, {
    x: xPravy,
    sirka: sirkaPrava,
    mezeraPo: 2,
    vpravo: t.dailyProgressHint,
  })
  s.tabulka(
    [sloupecPopisku, ...sloupceDnu],
    METRIKY.map((m) => [
      { text: NAZVY_METRIK[lang][m], tucne: true },
      ...data.map((datum) => {
        const hodnota = dny.get(datum)?.ratings[m]
        return {
          text: typeof hodnota === "number" ? cislo(hodnota, lang, ROZSAH[m].hodiny ? 1 : 0) : "",
          tucne: true,
          stred: true,
        }
      }),
    ]),
    {
      x: xPravy,
      sirka: sirkaPrava,
      velikost: vyskaRadkuVpravo >= 5.6 ? 7.4 : 6.6,
      vyskaRadku: vyskaRadkuVpravo,
    },
  )

  s.mezera(MEZERA_BLOKU)
  s.nadpis(t.notesIdeas, 9.5, { x: xPravy, sirka: sirkaPrava, mezeraPo: 2 })
  const radkyPoznamek = poznamky.trim()
    ? (doc.splitTextToSize(ocisti(poznamky), sirkaPrava - 4) as string[]).slice(0, RADKU_POZNAMEK)
    : []
  while (radkyPoznamek.length < RADKU_POZNAMEK) radkyPoznamek.push("")
  s.tabulka(
    [{ popis: "", podil: 1 }],
    radkyPoznamek.map((r) => [{ text: r }]),
    {
      x: xPravy,
      sirka: sirkaPrava,
      velikost: 7.2,
      vyskaRadku: vyskaRadkuPoznamek,
      bezHlavicky: true,
    },
  )

  // ── denní reflexe přes celou šířku ──────────────────────────────────────
  //
  // Začíná na pevné výšce, ne za delším ze sloupců: pak vypadá list pokaždé
  // stejně, ať má klient návyků kolik chce.
  s.y = zacatekSloupcu + vyskaSloupcu + MEZERA_BLOKU
  s.nadpis(t.dailyReflection, 9.5, { mezeraPo: 2 })

  const podilPopisku = 0.13
  const podilDneDole = (1 - podilPopisku) / 7
  s.tabulka(
    [
      { popis: "", podil: podilPopisku, stred: true },
      ...zkratky.map((z) => ({ popis: z, podil: podilDneDole, stred: true })),
    ],
    REFLEXE.map((klic) => [
      { text: ocisti(applyGender(NAZVY_REFLEXE[lang][klic], gender)), tucne: true },
      ...data.map((datum) => ({ text: ocisti(dny.get(datum)?.reflection[klic] ?? "") })),
    ]),
    // Menší řez než jinde schválně: do sloupce se tak vejde celá věta,
    // a právě u reflexe je věta to jediné, co má cenu číst.
    { velikost: 5.9, vyskaRadku: vyskaRadkuReflexe, svisleLinky: true },
  )

  // ── patička ─────────────────────────────────────────────────────────────
  //
  // Tři části na jednom účaří: vlevo komu list patří, uprostřed motto, vpravo
  // číslo strany. Motto pod tabulkou vypadalo jako utržený řádek, tady je
  // součástí paty a drží ji vyváženou.
  s.paticka(`Winning Minds  ·  ${ocisti(jmeno)}  ·  ${popisRozsahuTydne(monday, lang)}`)
  s.pismo(7.2, true, BARVA.slaba)
  doc.text(ocisti(t.motto), s.g.sirkaStrany / 2, s.g.vyskaStrany - 9.5, {
    align: "center",
    charSpace: 0.9,
  })
  return doc.output("blob")
}

/** Kontrola, že se rozvrh vejde do rozsahu hodin, se kterým počítá sazba. */
export function rozsahHodinSedi(): boolean {
  return HODINY[0] === PRVNI_HODINA && HODINY[HODINY.length - 1] === POSLEDNI_HODINA
}
