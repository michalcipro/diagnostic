import type { BandKey, DimensionId, Lang, ValidityStatus, Variant } from "../types"

// Texty tiskové sestavy, které nejsou ve vyhodnocení na obrazovce: záhlaví,
// popisky údajů, nadpisy oddílů a pracovní list pro sportovce.

export interface TextySestavy {
  /** pravá strana záhlaví první strany */
  proKouce: string
  /** pravá strana záhlaví strany pro sportovce nebo klienta; se značkou rodu */
  proKlienta: Record<Variant, string>
  vyplneno: (datum: string) => string
  minut: (n: number) => string
  vyplneni: string
  pozornost: string
  uprimnost: string
  tempo: string
  konzistence: string
  /** jak o sobě vypovídá: index upřímnosti slovy */
  stylizace: Record<ValidityStatus, string>
  tempoHodnota: (sekund: string) => string
  stupnice: (min: number, max: number) => string
  /** popis osy profilu, když pruh ukazuje pozici vůči normě */
  osaNorem: string
  /** krátké popisky pásem na ose pod profilem */
  pasmaOsy: Record<BandKey, string>
  vsechnyFazety: (pocet: number, min: number, max: number) => string
  naCemStavet: string
  doRozhovoru: (pocet: number) => string
  oblastiDoHloubky: string
  coToZnamena: string
  otazkaDoRozhovoru: string
  heterogenni: string
  dilciOblasti: (min: number, max: number) => string
  /** „ze 120“; předložka se v češtině i slovenštině řídí číslem, a pro 40, 60 a 120 je stejná */
  zeMax: (max: number) => string
  poznamkyZRozhovoru: string
  planTitul: string
  planHlavicka: string
  planUvod: (pocet: number, fazety: boolean) => string
  poznamkyADohody: string
  naCemStavis: string
  prostorKRustu: string
  mojeJednaVec: string
  podleCehoPoznam: string
  kdoMiPomuze: string
  kouc: string
  /** se značkou rodu */
  klient: Record<Variant, string>
  datumRozhovoru: string
  patickaProKlienta: Record<Variant, string>
  /** krátký název oblasti do mapy dílčích oblastí */
  kratce: Record<DimensionId, string>
  /** strana pro klienta u vzorců: nadpis a podnadpis */
  shrnuti: string
  shrnutiUvod: string
  kdeZacit: string
  /** vzorce: vnitřní věty tří nejaktivnějších vzorců jako otázky do rozhovoru */
  vetyDoRozhovoru: string
  vetyDoRozhovoruPopis: string
  vzorceProKlienta: string
}

const CISLOVKY: Record<Lang, string[]> = {
  cs: ["", "Jedna", "Dvě", "Tři"],
  sk: ["", "Jedna", "Dve", "Tri"],
  en: ["", "One", "Two", "Three"],
}

export const TEXTY_SESTAVY: Record<Lang, TextySestavy> = {
  cs: {
    proKouce: "Důvěrné · pro kouče",
    proKlienta: { sport: "Pro {sportovce|sportovkyni}", business: "Pro {klienta|klientku}" },
    vyplneno: (d) => `vyplněno ${d}`,
    minut: (n) => `${n} ${n === 1 ? "minuta" : n >= 2 && n <= 4 ? "minuty" : "minut"}`,
    vyplneni: "Vyplnění",
    pozornost: "Pozornost",
    uprimnost: "Upřímnost",
    tempo: "Tempo",
    konzistence: "Konzistence",
    stylizace: { ok: "bez stylizace", caution: "mírná stylizace", invalid: "výrazná stylizace" },
    tempoHodnota: (s) => `${s} s na otázku`,
    stupnice: (min, max) => `stupnice ${min} až ${max}`,
    osaNorem: "pruh ukazuje pozici mezi sportovci, kteří test vyplnili",
    pasmaOsy: { priority: "priorita", stabilization: "stabilizace", strong: "silná", elite: "elitní" },
    vsechnyFazety: (n, min, max) => `Všech ${n} dílčích oblastí · ${min} až ${max}`,
    naCemStavet: "Na čem stavět",
    doRozhovoru: (n) => (n === 1 ? "Jedna věc do rozhovoru" : `${CISLOVKY.cs[n] ?? n} věci do rozhovoru`),
    oblastiDoHloubky: "Oblasti do hloubky",
    coToZnamena: "Co to znamená",
    otazkaDoRozhovoru: "Otázka do rozhovoru",
    heterogenni: "Dílčí oblasti se výrazně liší: čti je jednotlivě.",
    dilciOblasti: (min, max) => `dílčí oblasti ${min} až ${max}`,
    zeMax: (max) => `ze ${max}`,
    poznamkyZRozhovoru: "Poznámky z rozhovoru",
    planTitul: "Plán rozvoje na 12 týdnů",
    planHlavicka: "Plán rozvoje",
    planUvod: (n, fazety) =>
      `${n === 1 ? "Nejslabší" : `${CISLOVKY.cs[n] ?? n} nejslabší`} ${fazety ? (n === 1 ? "dílčí oblast" : "dílčí oblasti") : n === 1 ? "oblast" : "oblasti"} profilu a ${fazety ? "plán na 8 až 12 týdnů" : "doporučení"}${n === 1 ? "" : " ke každé z nich"}. Odškrtávejte týdny, kdy se na ${n === 1 ? "ní" : "nich"} opravdu pracovalo.`,
    poznamkyADohody: "Poznámky a dohody",
    naCemStavis: "Na čem stavíš",
    prostorKRustu: "Kde máš prostor k růstu",
    mojeJednaVec: "Moje jedna věc na příštích 12 týdnů",
    podleCehoPoznam: "Podle čeho poznám, že se to daří",
    kdoMiPomuze: "Kdo mi s tím pomůže",
    kouc: "Kouč",
    klient: { sport: "{Sportovec|Sportovkyně}", business: "{Klient|Klientka}" },
    datumRozhovoru: "Datum rozhovoru",
    patickaProKlienta: {
      sport: "Tuto stranu může kouč předat {sportovci|sportovkyni}. Neobsahuje čísla.",
      business: "Tuto stranu může kouč předat {klientovi|klientce}. Neobsahuje čísla.",
    },
    kratce: {
      A: "Identita",
      B: "Sebedůvěra",
      C: "Koncentrace",
      D: "Emoce a tlak",
      E: "Odolnost",
      F: "Disciplína",
      G: "Vztahy",
    },
    shrnuti: "Shrnutí",
    shrnutiUvod: "Co z vyhodnocení plyne, bez čísel a odborných pojmů.",
    kdeZacit: "Kde začít",
    vetyDoRozhovoru: "Věty do rozhovoru",
    vetyDoRozhovoruPopis: "Vnitřní věty tří nejaktivnějších vzorců. Zeptejte se, v jakých situacích je slyší.",
    vzorceProKlienta: "Vzorce, které se u tebe ozývají nejvíc",
  },
  sk: {
    proKouce: "Dôverné · pre kouča",
    proKlienta: { sport: "Pre {športovca|športovkyňu}", business: "Pre {klienta|klientku}" },
    vyplneno: (d) => `vyplnené ${d}`,
    minut: (n) => `${n} ${n === 1 ? "minúta" : n >= 2 && n <= 4 ? "minúty" : "minút"}`,
    vyplneni: "Vyplnenie",
    pozornost: "Pozornosť",
    uprimnost: "Úprimnosť",
    tempo: "Tempo",
    konzistence: "Konzistencia",
    stylizace: { ok: "bez štylizácie", caution: "mierna štylizácia", invalid: "výrazná štylizácia" },
    tempoHodnota: (s) => `${s} s na otázku`,
    stupnice: (min, max) => `stupnica ${min} až ${max}`,
    osaNorem: "pruh ukazuje pozíciu medzi športovcami, ktorí test vyplnili",
    pasmaOsy: { priority: "priorita", stabilization: "stabilizácia", strong: "silná", elite: "elitná" },
    vsechnyFazety: (n, min, max) => `Všetkých ${n} čiastkových oblastí · ${min} až ${max}`,
    naCemStavet: "Na čom stavať",
    doRozhovoru: (n) => (n === 1 ? "Jedna vec do rozhovoru" : `${CISLOVKY.sk[n] ?? n} veci do rozhovoru`),
    oblastiDoHloubky: "Oblasti do hĺbky",
    coToZnamena: "Čo to znamená",
    otazkaDoRozhovoru: "Otázka do rozhovoru",
    heterogenni: "Čiastkové oblasti sa výrazne líšia: čítaj ich jednotlivo.",
    dilciOblasti: (min, max) => `čiastkové oblasti ${min} až ${max}`,
    zeMax: (max) => `zo ${max}`,
    poznamkyZRozhovoru: "Poznámky z rozhovoru",
    planTitul: "Plán rozvoja na 12 týždňov",
    planHlavicka: "Plán rozvoja",
    planUvod: (n, fazety) =>
      `${n === 1 ? "Najslabšia" : `${CISLOVKY.sk[n] ?? n} najslabšie`} ${fazety ? (n === 1 ? "čiastková oblasť" : "čiastkové oblasti") : n === 1 ? "oblasť" : "oblasti"} profilu a ${fazety ? "plán na 8 až 12 týždňov" : "odporúčania"}${n === 1 ? "" : " ku každej z nich"}. Odškrtávajte týždne, keď sa na ${n === 1 ? "nej" : "nich"} naozaj pracovalo.`,
    poznamkyADohody: "Poznámky a dohody",
    naCemStavis: "Na čom staviaš",
    prostorKRustu: "Kde máš priestor na rast",
    mojeJednaVec: "Moja jedna vec na nasledujúcich 12 týždňov",
    podleCehoPoznam: "Podľa čoho spoznám, že sa to darí",
    kdoMiPomuze: "Kto mi s tým pomôže",
    kouc: "Kouč",
    klient: { sport: "{Športovec|Športovkyňa}", business: "{Klient|Klientka}" },
    datumRozhovoru: "Dátum rozhovoru",
    patickaProKlienta: {
      sport: "Túto stranu môže kouč odovzdať {športovcovi|športovkyni}. Neobsahuje čísla.",
      business: "Túto stranu môže kouč odovzdať {klientovi|klientke}. Neobsahuje čísla.",
    },
    kratce: {
      A: "Identita",
      B: "Sebadôvera",
      C: "Koncentrácia",
      D: "Emócie a tlak",
      E: "Odolnosť",
      F: "Disciplína",
      G: "Vzťahy",
    },
    shrnuti: "Zhrnutie",
    shrnutiUvod: "Čo z vyhodnotenia vyplýva, bez čísel a odborných pojmov.",
    kdeZacit: "Kde začať",
    vetyDoRozhovoru: "Vety do rozhovoru",
    vetyDoRozhovoruPopis: "Vnútorné vety troch najaktívnejších vzorcov. Opýtajte sa, v akých situáciách ich počuje.",
    vzorceProKlienta: "Vzorce, ktoré sa u teba ozývajú najviac",
  },
  en: {
    proKouce: "Confidential · for the coach",
    proKlienta: { sport: "For the athlete", business: "For the client" },
    vyplneno: (d) => `completed ${d}`,
    minut: (n) => `${n} ${n === 1 ? "minute" : "minutes"}`,
    vyplneni: "Completion",
    pozornost: "Attention",
    uprimnost: "Honesty",
    tempo: "Pace",
    konzistence: "Consistency",
    stylizace: { ok: "no idealisation", caution: "slight idealisation", invalid: "strong idealisation" },
    tempoHodnota: (s) => `${s} s per item`,
    stupnice: (min, max) => `scale ${min} to ${max}`,
    osaNorem: "the bar shows the position among athletes who took the test",
    pasmaOsy: { priority: "priority", stabilization: "stabilisation", strong: "strong", elite: "elite" },
    vsechnyFazety: (n, min, max) => `All ${n} facets · ${min} to ${max}`,
    naCemStavet: "What to build on",
    doRozhovoru: (n) => (n === 1 ? "One thing to discuss" : `${CISLOVKY.en[n] ?? n} things to discuss`),
    oblastiDoHloubky: "Areas in depth",
    coToZnamena: "What it means",
    otazkaDoRozhovoru: "A question to ask",
    heterogenni: "The facets differ markedly: read them one by one.",
    dilciOblasti: (min, max) => `facets ${min} to ${max}`,
    zeMax: (max) => `out of ${max}`,
    poznamkyZRozhovoru: "Conversation notes",
    planTitul: "12-week development plan",
    planHlavicka: "Development plan",
    planUvod: (n, fazety) =>
      `${n === 1 ? "The weakest" : `The ${(CISLOVKY.en[n] ?? String(n)).toLowerCase()} weakest`} ${fazety ? (n === 1 ? "facet" : "facets") : n === 1 ? "area" : "areas"} in the profile, ${n === 1 ? "with" : "each with"} ${fazety ? "an 8 to 12-week plan" : "recommendations"}. Tick the weeks in which the work actually happened.`,
    poznamkyADohody: "Notes and agreements",
    naCemStavis: "What you build on",
    prostorKRustu: "Where you have room to grow",
    mojeJednaVec: "My one thing for the next 12 weeks",
    podleCehoPoznam: "How I will know it is working",
    kdoMiPomuze: "Who will help me",
    kouc: "Coach",
    klient: { sport: "Athlete", business: "Client" },
    datumRozhovoru: "Date of conversation",
    patickaProKlienta: {
      sport: "The coach may hand this page to the athlete. It contains no numbers.",
      business: "The coach may hand this page to the client. It contains no numbers.",
    },
    kratce: {
      A: "Identity",
      B: "Confidence",
      C: "Concentration",
      D: "Emotion and pressure",
      E: "Resilience",
      F: "Discipline",
      G: "Relationships",
    },
    shrnuti: "Summary",
    shrnutiUvod: "What the evaluation shows, without numbers or jargon.",
    kdeZacit: "Where to start",
    vetyDoRozhovoru: "Sentences to discuss",
    vetyDoRozhovoruPopis:
      "The inner sentences of the three most active patterns. Ask in which situations they come up.",
    vzorceProKlienta: "The patterns that speak up most in you",
  },
}
