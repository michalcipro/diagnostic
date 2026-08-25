// Sdílený vymyšlený tým pro simulaci i pro kontrolu PDF.
//
// Šest hráček univerzitního tenisu v USA, každá s jiným profilem. Je to
// běžný případ, ne extrém: pár silných míst, jedna zlomová linie, jeden
// člověk mimo. Na něm se hlídá rozsah reportu, protože takhle vypadá
// v praxi.
//
// Bydlí to tady, aby simulace i test pracovaly se stejným týmem. Kdyby měl
// každý svůj, ukazovala by simulace něco jiného, než co test hlídá.

/**
 * Vlastní generátor náhody, aby tým vycházel pokaždé stejný a dalo se o něm
 * mluvit. Math.random by pokaždé vyrobil jiný.
 */
function nahoda(seminko) {
  let s = seminko >>> 0
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 4294967296
  }
}

const HRACKY = [
  {
    stitek: "Player 1",
    popis: "Kapitánka, senior. Ví, proč hraje, drží kabinu, po chybě se nesype.",
    zaklad: 4,
    uprava: { A: 5, G: 5, E: 4.5, B: 4, F2: 2.5 },
    dojem: 0.35,
  },
  {
    stitek: "Player 2",
    popis: "Freshman, velký talent. Na tréninku suverénní, v zápase se zlomí.",
    zaklad: 3.5,
    uprava: { B1: 4.5, B3: 1.5, A3: 1.5, D: 2, C: 3 },
  },
  {
    stitek: "Player 3",
    popis: "Dře nejvíc z týmu, perfekcionistka. Na sebe nejtvrdší, neodpočívá.",
    zaklad: 3.5,
    uprava: { F1: 5, F3: 4.5, F2: 1.5, B3: 1.5, A3: 2, E: 4 },
    dojem: 0.5,
  },
  {
    stitek: "Player 4",
    popis: "Stabilní střed sestavy. Nikde nevyčnívá, nikde nepropadá.",
    zaklad: 3.5,
    uprava: { G: 4 },
  },
  {
    stitek: "Player 5",
    popis: "Přestup z jiné univerzity, půl roku v týmu. Do kabiny nepatří.",
    zaklad: 3.5,
    uprava: { G: 1.5, A2: 2.5, E: 3, D: 3 },
  },
  {
    stitek: "Player 6",
    popis: "Vrací se po zranění kolene. Tělo drží, hlava zatím ne.",
    zaklad: 3,
    uprava: { B1: 1.5, C: 2, D: 2.5, A3: 2.5, F: 4, G: 4 },
  },
]

const NAZEV = "Wildcats Women's Tennis"
const POZVANO = 8

/**
 * Odpovědi jedné hráčky. Úroveň se zadává po fazetách nebo oblastech,
 * jednotlivé položky kolem ní kolísají, takže profil nevyjde nepřirozeně
 * hladký a kontrola validity ho nevyhodnotí jako mechanické vyplňování.
 *
 * Kontrolní položky se vyplňují tak, jak je vyplní člověk, který dotazník
 * čte. Bez toho by vznikly neplatné dotazníky a profil týmu by nevznikl.
 */
function odpovedi(M, S200, obracene, zaklad, uprava, seminko, dojem = 0) {
  const r = nahoda(seminko)
  const a = {}
  for (const f of M.ELITE200_FACETS) {
    const cil = uprava[f.id] ?? uprava[f.dimension] ?? zaklad
    for (const i of f.items) {
      const posun = r() < 0.55 ? 0 : r() < 0.5 ? -1 : 1
      const uroven = Math.min(5, Math.max(1, Math.round(cil) + posun))
      a[i] = obracene.has(i) ? 6 - uroven : uroven
    }
  }
  for (let i = 1; i <= 200; i++) if (a[i] === undefined) a[i] = 3

  for (const [polozka, hodnota] of Object.entries(S200.validity.attention)) {
    a[Number(polozka)] = hodnota
  }
  if (S200.validity.infrequency) {
    for (const i of S200.validity.infrequency.expectAgree) a[i] = r() < 0.5 ? 4 : 5
    for (const i of S200.validity.infrequency.expectDisagree) a[i] = r() < 0.5 ? 1 : 2
  }
  // Položky upřímnosti popisují chování, které o sobě nikdo pravdivě netvrdí
  // pořád. Kdo je odklikne uprostřed škály, vyjde jako člověk, který se
  // ukazuje v lepším světle. Parametr dojem říká, nakolik to daná hráčka
  // dělá; nula je běžná otevřenost.
  for (const i of S200.validity.honesty.items) {
    const x = r() - dojem * 0.35
    a[i] = x < 0.25 ? 1 : x < 0.6 ? 2 : x < 0.88 ? 3 : r() < 0.6 ? 4 : 5
  }
  return a
}

/**
 * Vyhodnocení všech šesti hráček a hotový profil týmu.
 *
 * Vrací i samotné odpovědi, protože případ užití z nich staví vyhodnocení
 * jedné hráčky. Bez nich by se musely generovat podruhé a mohly by se
 * rozejít s tím, co je v profilu.
 */
function sestavTym(M) {
  const S200 = M.getStructure("elite200")
  const obracene = new Set(M.ELITE200_REVERSED)
  const odpovediHracek = HRACKY.map((h, i) =>
    odpovedi(M, S200, obracene, h.zaklad, h.uprava, 20260825 + i * 7919, h.dojem ?? 0),
  )
  const vysledky = odpovediHracek.map((a, i) =>
    M.evaluate(S200, a, { durationSec: 2100 + i * 180 }),
  )
  return {
    nazev: NAZEV,
    odpovedi: odpovediHracek,
    vysledky,
    profil: M.tymovyProfil(NAZEV, POZVANO, HRACKY.length, vysledky),
  }
}

module.exports = { HRACKY, NAZEV, POZVANO, sestavTym }
