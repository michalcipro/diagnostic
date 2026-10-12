import type { DimensionId, Lang } from "./types"

// Otázky do rozhovoru pro tiskovou sestavu.
//
// Kouč se ptá přímo sportovce nebo klienta, proto druhá osoba. Otázka je
// otevřená a míří na konkrétní situaci, ne na hodnocení („Kdy naposledy…“
// místo „Proč ti nejde…“): na konkrétní situaci se odpovídá líp a odpověď
// se dá dál rozvíjet.
//
// Otázky platí pro sport i byznys, takže nemluví o zápase ani o šéfovi, ale
// o důležité chvíli, o výkonu a o tom, když se nedaří. Rod se řeší značkami
// {mužský|ženský} stejně jako ve výkladu. Uvozovky doplňuje sazba podle
// jazyka, tady nejsou.

/** Ke každé dílčí oblasti ELITE 200 jedna otázka. */
export const OTAZKY_FAZET: Record<string, Record<Lang, string>> = {
  A1: {
    cs: "Podle jakých hodnot se rozhoduješ, když jde o hodně, a kdy od nich nejčastěji uhneš?",
    sk: "Podľa akých hodnôt sa rozhoduješ, keď ide o veľa, a kedy od nich najčastejšie uhneš?",
    en: "Which values guide your decisions when the stakes are high, and when do you drift from them?",
  },
  A2: {
    cs: "Proč to děláš, když tě nikdo nechválí a výsledky nepřicházejí?",
    sk: "Prečo to robíš, keď ťa nikto nechváli a výsledky neprichádzajú?",
    en: "Why do you keep going when nobody praises you and the results don't come?",
  },
  A3: {
    cs: "Na čem stojí tvoje hodnota v týdnu, kdy se nedaří?",
    sk: "Na čom stojí tvoja hodnota v týždni, keď sa nedarí?",
    en: "What is your worth built on in a week when nothing goes right?",
  },
  B1: {
    cs: "Kdy naposledy sis v důležité chvíli opravdu {věřil|věřila} a co tomu předcházelo?",
    sk: "Kedy si si naposledy v dôležitej chvíli naozaj {veril|verila} a čo tomu predchádzalo?",
    en: "When did you last truly trust yourself in an important moment, and what came before it?",
  },
  B2: {
    cs: "Co si v duchu říkáš hned po chybě? {Řekl|Řekla} bys to i kamarádovi?",
    sk: "Čo si v duchu hovoríš hneď po chybe? {Povedal|Povedala} by si to aj kamarátovi?",
    en: "What do you tell yourself right after a mistake? Would you say that to a friend?",
  },
  B3: {
    cs: "Jak dlouho v tobě chyba zůstává a co ti pomáhá ji pustit?",
    sk: "Ako dlho v tebe chyba zostáva a čo ti pomáha ju pustiť?",
    en: "How long does a mistake stay with you, and what helps you let it go?",
  },
  C1: {
    cs: "Co tě v důležité chvíli nejčastěji vytrhne ze soustředění?",
    sk: "Čo ťa v dôležitej chvíli najčastejšie vytrhne zo sústredenia?",
    en: "What most often pulls your focus away in an important moment?",
  },
  C2: {
    cs: "Co přesně děláš, abys pozornost po vyrušení {vrátil|vrátila} zpátky?",
    sk: "Čo presne robíš, aby si pozornosť po vyrušení {vrátil|vrátila} späť?",
    en: "What exactly do you do to bring your attention back after a distraction?",
  },
  C3: {
    cs: "Kdy se ti daří být jen u toho, co právě děláš, a co tě odtud odvádí?",
    sk: "Kedy sa ti darí byť len pri tom, čo práve robíš, a čo ťa odtiaľ odvádza?",
    en: "When do you manage to stay with what you are doing right now, and what pulls you away?",
  },
  D1: {
    cs: "Podle čeho na těle poznáš, že napětí stoupá, ještě než ti to dojde?",
    sk: "Podľa čoho na tele spoznáš, že napätie stúpa, ešte skôr než ti to dôjde?",
    en: "How does your body tell you that tension is rising before your mind notices?",
  },
  D2: {
    cs: "Co děláš, když jsi před výkonem moc {nabuzený|nabuzená}, nebo naopak bez energie?",
    sk: "Čo robíš, keď si pred výkonom príliš {nabudený|nabudená}, alebo naopak bez energie?",
    en: "What do you do when you are too wound up before a performance, or flat?",
  },
  D3: {
    cs: "Když jde o hodně, bereš to spíš jako výzvu, nebo jako hrozbu? Podle čeho to poznáš?",
    sk: "Keď ide o veľa, berieš to skôr ako výzvu, alebo ako hrozbu? Podľa čoho to spoznáš?",
    en: "When the stakes are high, does it feel more like a challenge or a threat? How can you tell?",
  },
  E1: {
    cs: "Co ses {naučil|naučila}, i když sis zpočátku {myslel|myslela}, že na to nemáš?",
    sk: "Čo si sa {naučil|naučila}, hoci si si spočiatku {myslel|myslela}, že na to nemáš?",
    en: "What have you learned even though at first you thought you were not up to it?",
  },
  E2: {
    cs: "Kdy jsi naposledy u něčeho {vydržel|vydržela}, i když to dlouho nešlo, a co tě drželo?",
    sk: "Kedy si naposledy pri niečom {vydržal|vydržala}, hoci to dlho nešlo, a čo ťa držalo?",
    en: "When did you last stick with something that was not working for a long time, and what kept you going?",
  },
  E3: {
    cs: "Jak vypadá tvůj restart po neúspěchu nebo po kritice, která zabolí?",
    sk: "Ako vyzerá tvoj reštart po neúspechu alebo po kritike, ktorá zabolí?",
    en: "What does your reset look like after a setback, or after criticism that stings?",
  },
  F1: {
    cs: "Co ti nejčastěji rozbije dobrý režim a jak se do něj vracíš?",
    sk: "Čo ti najčastejšie rozbije dobrý režim a ako sa doň vraciaš?",
    en: "What most often breaks your good routine, and how do you get back into it?",
  },
  F2: {
    cs: "Jak spíš před důležitým dnem a co děláš večer předtím?",
    sk: "Ako spíš pred dôležitým dňom a čo robíš večer predtým?",
    en: "How do you sleep before an important day, and what do you do the evening before?",
  },
  F3: {
    cs: "Kdy během týdne máš nejméně energie a čím to je?",
    sk: "Kedy počas týždňa máš najmenej energie a čím to je?",
    en: "When during the week is your energy lowest, and why?",
  },
  G1: {
    cs: "Komu ve svém okolí můžeš říct, že něco nezvládáš, aniž by ses {bál|bála} následků?",
    sk: "Komu vo svojom okolí môžeš povedať, že niečo nezvládaš, bez toho, aby si sa {bál|bála} následkov?",
    en: "Who around you can you tell that you are struggling, without fearing the consequences?",
  },
  G2: {
    cs: "Kdy jsi naposledy {řekl|řekla} ne, i když to bylo nepříjemné?",
    sk: "Kedy si naposledy {povedal|povedala} nie, hoci to bolo nepríjemné?",
    en: "When did you last say no, even though it was uncomfortable?",
  },
  G3: {
    cs: "Na koho se obracíš, když se nedaří, a kdo ti energii naopak bere?",
    sk: "Na koho sa obraciaš, keď sa nedarí, a kto ti energiu naopak berie?",
    en: "Who do you turn to when things go wrong, and who drains your energy?",
  },
}

/** ELITE 100 nemá dílčí oblasti, proto jedna otázka na celou oblast. */
export const OTAZKY_DIMENZI: Record<DimensionId, Record<Lang, string>> = {
  A: {
    cs: "Proč to děláš a na čem stojí tvoje hodnota, když se nedaří?",
    sk: "Prečo to robíš a na čom stojí tvoja hodnota, keď sa nedarí?",
    en: "Why do you do this, and what is your worth built on when things go wrong?",
  },
  B: {
    cs: "Co si v duchu říkáš, když jde o hodně, a co hned po chybě?",
    sk: "Čo si v duchu hovoríš, keď ide o veľa, a čo hneď po chybe?",
    en: "What do you tell yourself when the stakes are high, and right after a mistake?",
  },
  C: {
    cs: "Co tě nejčastěji vytrhne ze soustředění a jak se vracíš zpátky?",
    sk: "Čo ťa najčastejšie vytrhne zo sústredenia a ako sa vraciaš späť?",
    en: "What most often breaks your focus, and how do you get back?",
  },
  D: {
    cs: "Když jde o hodně, bereš to spíš jako výzvu, nebo jako hrozbu? Co s tím děláš?",
    sk: "Keď ide o veľa, berieš to skôr ako výzvu, alebo ako hrozbu? Čo s tým robíš?",
    en: "When the stakes are high, does it feel like a challenge or a threat? What do you do about it?",
  },
  E: {
    cs: "Jak vypadá tvůj restart po neúspěchu a co tě drží, když to dlouho nejde?",
    sk: "Ako vyzerá tvoj reštart po neúspechu a čo ťa drží, keď to dlho nejde?",
    en: "What does your reset look like after a setback, and what keeps you going when progress stalls?",
  },
  F: {
    cs: "Co ti nejčastěji rozbije dobrý režim, spánek nebo energii?",
    sk: "Čo ti najčastejšie rozbije dobrý režim, spánok alebo energiu?",
    en: "What most often breaks your routine, your sleep or your energy?",
  },
  G: {
    cs: "Na koho se obracíš, když se nedaří, a komu můžeš říct, že něco nezvládáš?",
    sk: "Na koho sa obraciaš, keď sa nedarí, a komu môžeš povedať, že niečo nezvládaš?",
    en: "Who do you turn to when things go wrong, and who can you tell that you are struggling?",
  },
}

/** Otázka v uvozovkách daného jazyka. */
export function vUvozovkach(text: string, lang: Lang): string {
  return lang === "en" ? `“${text}”` : `„${text}“`
}
