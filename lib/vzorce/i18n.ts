import type { Lang } from "../diagnostic/types"
import type { Varianta } from "./types"

// Texty rozhraní vyhodnocení emocionálně-destruktivních vzorců.
//
// Obsah vzorců je v lib/vzorce/data, tady jsou popisky kolem něj: nadpisy
// sekcí, vysvětlivky pod grafy, popisky os a věty, které se skládají z čísel.
// Web i PDF čerpají ze stejné tabulky, aby se obě podoby nerozešly.
//
// Angličtinu obsah vzorců zatím nemá, takže na ni ukazuje česká tabulka.
// Přeložit jen rámování a nechat uvnitř český výklad by bylo horší než
// poctivá čeština v celém dokumentu.

export interface VzorceUI {
  /** podnadpis pod názvem testu; sportovní verze má vlastní */
  podnadpis: Record<Varianta, string>
  respondent: string
  /** popisek druhého údaje v hlavičce; sport se ptá na disciplínu */
  role: Record<Varianta, string>
  datum: string

  neuplnyTitulek: (zodpovezeno: number, celkem: number) => string
  neuplnyPopis: string

  profilTitulek: string
  /** ve webu je počet silných odpovědí v kolečku, v PDF v závorce */
  profilPopisWeb: string
  profilPopisPdf: string

  oblastiTitulek: string
  oblastiPopisWeb: string
  oblastiPopisPdf: string
  oblastiPatka: string

  top3Titulek: string
  top3Popis: string
  misto: (poradi: number) => string
  z60: string
  bodyZ60: (skore: number, pasmo: string) => string
  silneOdpovedi: (pocet: number, polozky: string) => string
  zodpovezenoZ: (zodpovezeno: number, celkem: number) => string
  nezarazuje: string

  jakVypada: string
  podTlakem: string
  odkud: string

  situacniTitulek: string
  situacniPopis: string
  situacniRadek: (pocet: number, polozky: string) => string

  spojeniTitulek: string
  spojeniPopis: string
  kdeSeZivi: string

  /** ve webu dva odstavce, v PDF jeden slitý */
  zaverWeb: string[]
  zaverPdf: string

  pasmaKlic: string
  legendaTop3: string
  legendaOstatni: string
  legendaOdznak: string
  odznakTitulek: (pocet: number) => string
  prumerZ: (prumer: number, vzorcu: string) => string
  pocetVzorcu: (n: number) => string

  /** začátek názvu staženého PDF */
  nazevSouboru: Record<Varianta, string>
}

const CS: VzorceUI = {
  podnadpis: {
    obecna:
      "Diagnostický profil automatických emočních reakcí, vztahových strategií a výkonových bloků",
    "sport-individual":
      "Diagnostický profil automatických emočních reakcí, vztahových strategií a výkonových bloků v individuálním sportu",
    "sport-tym":
      "Diagnostický profil automatických emočních reakcí, vztahových strategií a výkonových bloků v týmovém sportu",
  },
  respondent: "Respondent",
  role: {
    obecna: "Role / oblast",
    "sport-individual": "Sportovní disciplína a úroveň",
    "sport-tym": "Sportovní disciplína a úroveň",
  },
  datum: "Datum vyplnění",

  neuplnyTitulek: (zodpovezeno, celkem) => `Dotazník není kompletní (${zodpovezeno} ze ${celkem}).`,
  neuplnyPopis:
    "U vzorců s chybějícími odpověďmi je skóre dopočítané z průměru zodpovězených položek. Vzorce, kde chybí víc než pětina odpovědí, se do pořadí nezařazují.",

  profilTitulek: "Profil všech vzorců",
  profilPopisWeb:
    "Skóre jednoho vzorce je součet deseti odpovědí, tedy 10 až 60 bodů. Pásmo se čte z polohy na ose, ne z barvy. Číslo v kolečku ukazuje, kolik tvrzení respondent označil hodnotou 5 nebo 6; ta jsou významná i tehdy, když celkové skóre vysoké není.",
  profilPopisPdf:
    "Skóre jednoho vzorce je součet deseti odpovědí, tedy 10 až 60 bodů. Číslo v závorce ukazuje, kolik tvrzení respondent označil hodnotou 5 nebo 6; ta jsou významná i tehdy, když celkové skóre vysoké není.",

  oblastiTitulek: "Zatížení oblastí",
  oblastiPopisWeb:
    "Tentýž profil po oblastech, ze kterých vzorce pocházejí. Když je zatížená jedna oblast, nejde o několik problémů, ale o jedno téma ve více podobách.",
  oblastiPopisPdf:
    "Tentýž profil po oblastech, ze kterých vzorce pocházejí. Když je zatížená jedna oblast, nejde o několik problémů, ale o jedno téma ve více podobách. V závorce je počet vzorců, ze kterých se průměr počítá.",
  oblastiPatka:
    "Průměrné skóre vzorců v dané oblasti; v závorce je počet vzorců, ze kterých se počítá. Vzorce se sdružují podle toho, která dětská potřeba zůstala nenaplněná, takže zatížená oblast říká víc než jednotlivé skóre.",

  top3Titulek: "Tři nejaktivnější vzorce",
  top3Popis:
    "Tohle jsou vzorce, které se u respondenta aktivují nejsilněji. Nejsou to nálepky ani diagnóza. Je to popis mechanismu, který se spouští pod tlakem.",
  misto: (poradi) => `${poradi}. místo`,
  z60: "z 60",
  bodyZ60: (skore, pasmo) => `${skore} bodů z 60, ${pasmo}`,
  silneOdpovedi: (pocet, polozky) =>
    `Hodnotou 5 nebo 6 označeno ${pocet} z 10 tvrzení${polozky ? `, konkrétně ${polozky}` : ""}.`,
  zodpovezenoZ: (zodpovezeno, celkem) => `zodpovězeno ${zodpovezeno} z ${celkem} položek`,
  nezarazuje: "do pořadí se nezařazuje",

  jakVypada: "Jak to vypadá zevnitř",
  podTlakem: "Co dělá pod tlakem",
  odkud: "Odkud se to vzalo",

  situacniTitulek: "Situačně aktivované vzorce",
  situacniPopis:
    "Tyhle vzorce se nedostaly do první trojice, ale mají tři a více tvrzení označených nejvyššími hodnotami. To znamená, že se neaktivují trvale, zato v konkrétních situacích silně. Stojí za to se na ně v rozhovoru zeptat.",
  situacniRadek: (pocet, polozky) => `${pocet}× hodnota 5 nebo 6 · položky ${polozky}`,

  spojeniTitulek: "Jak to funguje dohromady",
  spojeniPopis:
    "Tři vzorce nejsou tři oddělené problémy. Teprve jejich spojení vysvětluje chování, kterému člověk sám nerozumí.",
  kdeSeZivi: "Kde se navzájem živí",

  zaverWeb: [
    "Tento profil není nálepka ani diagnóza. Je to mapa. Smyslem není člověka ve vzorci zafixovat, ale pojmenovat mechanismus, který se aktivuje pod tlakem, a vytvořit prostor pro přesnější práci.",
    "Výsledek nenahrazuje psychologické ani lékařské vyšetření. Slouží jako podklad pro rozhovor s koučem.",
  ],
  zaverPdf:
    "Tento profil není nálepka ani diagnóza. Je to mapa. Smyslem není člověka ve vzorci zafixovat, ale pojmenovat mechanismus, který se aktivuje pod tlakem, a vytvořit prostor pro přesnější práci. Výsledek nenahrazuje psychologické ani lékařské vyšetření a slouží jako podklad pro rozhovor s koučem.",

  pasmaKlic: "Pásma",
  legendaTop3: "tři nejaktivnější vzorce",
  legendaOstatni: "ostatní",
  legendaOdznak: "počet tvrzení s hodnotou 5 nebo 6",
  odznakTitulek: (pocet) => `${pocet} tvrzení označeno hodnotou 5 nebo 6`,
  prumerZ: (prumer, vzorcu) => `průměr ${prumer} bodů z ${vzorcu}`,
  pocetVzorcu: (n) => (n === 1 ? "1 vzorec" : n < 5 ? `${n} vzorce` : `${n} vzorců`),

  nazevSouboru: {
    obecna: "Emocionalne-destruktivni vzorce",
    "sport-individual": "Emocionalne-destruktivni vzorce - Individualni sport",
    "sport-tym": "Emocionalne-destruktivni vzorce - Tymovy sport",
  },
}

const SK: VzorceUI = {
  podnadpis: {
    obecna:
      "Diagnostický profil automatických emočných reakcií, vzťahových stratégií a výkonových blokov",
    "sport-individual":
      "Diagnostický profil automatických emočných reakcií, vzťahových stratégií a výkonových blokov v individuálnom športe",
    "sport-tym":
      "Diagnostický profil automatických emočných reakcií, vzťahových stratégií a výkonových blokov v tímovom športe",
  },
  respondent: "Respondent",
  role: {
    obecna: "Rola / oblasť",
    "sport-individual": "Športová disciplína a úroveň",
    "sport-tym": "Športová disciplína a úroveň",
  },
  datum: "Dátum vyplnenia",

  neuplnyTitulek: (zodpovezeno, celkem) => `Dotazník nie je kompletný (${zodpovezeno} zo ${celkem}).`,
  neuplnyPopis:
    "Pri vzorcoch s chýbajúcimi odpoveďami je skóre dopočítané z priemeru zodpovedaných položiek. Vzorce, kde chýba viac než pätina odpovedí, sa do poradia nezaraďujú.",

  profilTitulek: "Profil všetkých vzorcov",
  profilPopisWeb:
    "Skóre jedného vzorca je súčet desiatich odpovedí, teda 10 až 60 bodov. Pásmo sa číta z polohy na osi, nie z farby. Číslo v koliesku ukazuje, koľko tvrdení respondent označil hodnotou 5 alebo 6; tie sú významné aj vtedy, keď celkové skóre vysoké nie je.",
  profilPopisPdf:
    "Skóre jedného vzorca je súčet desiatich odpovedí, teda 10 až 60 bodov. Číslo v zátvorke ukazuje, koľko tvrdení respondent označil hodnotou 5 alebo 6; tie sú významné aj vtedy, keď celkové skóre vysoké nie je.",

  oblastiTitulek: "Zaťaženie oblastí",
  oblastiPopisWeb:
    "Ten istý profil po oblastiach, z ktorých vzorce pochádzajú. Keď je zaťažená jedna oblasť, nejde o niekoľko problémov, ale o jednu tému vo viacerých podobách.",
  oblastiPopisPdf:
    "Ten istý profil po oblastiach, z ktorých vzorce pochádzajú. Keď je zaťažená jedna oblasť, nejde o niekoľko problémov, ale o jednu tému vo viacerých podobách. V zátvorke je počet vzorcov, z ktorých sa priemer počíta.",
  oblastiPatka:
    "Priemerné skóre vzorcov v danej oblasti; v zátvorke je počet vzorcov, z ktorých sa počíta. Vzorce sa združujú podľa toho, ktorá detská potreba zostala nenaplnená, takže zaťažená oblasť hovorí viac než jednotlivé skóre.",

  top3Titulek: "Tri najaktívnejšie vzorce",
  top3Popis:
    "Toto sú vzorce, ktoré sa u respondenta aktivujú najsilnejšie. Nie sú to nálepky ani diagnóza. Je to opis mechanizmu, ktorý sa spúšťa pod tlakom.",
  misto: (poradi) => `${poradi}. miesto`,
  z60: "zo 60",
  bodyZ60: (skore, pasmo) => `${skore} bodov zo 60, ${pasmo}`,
  silneOdpovedi: (pocet, polozky) =>
    `Hodnotou 5 alebo 6 označených ${pocet} z 10 tvrdení${polozky ? `, konkrétne ${polozky}` : ""}.`,
  zodpovezenoZ: (zodpovezeno, celkem) => `zodpovedaných ${zodpovezeno} z ${celkem} položiek`,
  nezarazuje: "do poradia sa nezaraďuje",

  jakVypada: "Ako to vyzerá zvnútra",
  podTlakem: "Čo robí pod tlakom",
  odkud: "Odkiaľ sa to vzalo",

  situacniTitulek: "Situačne aktivované vzorce",
  situacniPopis:
    "Tieto vzorce sa nedostali do prvej trojice, ale majú tri a viac tvrdení označených najvyššími hodnotami. To znamená, že sa neaktivujú trvalo, zato v konkrétnych situáciách silno. Stojí za to sa na ne v rozhovore opýtať.",
  situacniRadek: (pocet, polozky) => `${pocet}× hodnota 5 alebo 6 · položky ${polozky}`,

  spojeniTitulek: "Ako to funguje dohromady",
  spojeniPopis:
    "Tri vzorce nie sú tri oddelené problémy. Až ich spojenie vysvetľuje správanie, ktorému človek sám nerozumie.",
  kdeSeZivi: "Kde sa navzájom živia",

  zaverWeb: [
    "Tento profil nie je nálepka ani diagnóza. Je to mapa. Zmyslom nie je človeka vo vzorci zafixovať, ale pomenovať mechanizmus, ktorý sa aktivuje pod tlakom, a vytvoriť priestor pre presnejšiu prácu.",
    "Výsledok nenahrádza psychologické ani lekárske vyšetrenie. Slúži ako podklad pre rozhovor s koučom.",
  ],
  zaverPdf:
    "Tento profil nie je nálepka ani diagnóza. Je to mapa. Zmyslom nie je človeka vo vzorci zafixovať, ale pomenovať mechanizmus, ktorý sa aktivuje pod tlakom, a vytvoriť priestor pre presnejšiu prácu. Výsledok nenahrádza psychologické ani lekárske vyšetrenie a slúži ako podklad pre rozhovor s koučom.",

  pasmaKlic: "Pásma",
  legendaTop3: "tri najaktívnejšie vzorce",
  legendaOstatni: "ostatné",
  legendaOdznak: "počet tvrdení s hodnotou 5 alebo 6",
  odznakTitulek: (pocet) => `${pocet} tvrdení označených hodnotou 5 alebo 6`,
  prumerZ: (prumer, vzorcu) => `priemer ${prumer} bodov z ${vzorcu}`,
  pocetVzorcu: (n) => (n === 1 ? "1 vzorec" : n < 5 ? `${n} vzorce` : `${n} vzorcov`),

  nazevSouboru: {
    obecna: "Emocionalne-destruktivne vzorce",
    "sport-individual": "Emocionalne-destruktivne vzorce - Individualny sport",
    "sport-tym": "Emocionalne-destruktivne vzorce - Timovy sport",
  },
}

export const UI_VZORCE: Record<Lang, VzorceUI> = { cs: CS, sk: SK, en: CS }
