"""Sestaví dotazník Profil 360 z veřejných zdrojů a českého překladu.

Zdroje (anglické originály a klíče) jsou v zdroje/ a berou se odtamtud,
ne z paměti:

  ipip-neo-120-en.json          IPIP-NEO-120 (Johnson, 2014), 30 fazet po 4
                                položkách; z balíčku npm
                                @alheimsins/b5-johnson-120-ipip-neo-pi-r
  ipip-via-r-bisbas-dass21-en.json
                                IPIP-VIA-R (Bluemke a kol., 2021), IPIP BIS/BAS
                                a DASS-21; z balíčku npm psytools, který je
                                přepsal z ipip.ori.org a z oficiálních stránek

Licence: položky IPIP jsou volné dílo, smí se používat, upravovat
a překládat i komerčně bez svolení. DASS-21 je podle oficiálních stránek
volné dílo. Obojí ověřeno v SOURCES.md balíčku psytools a u IPIP i na
stránce ipip.ori.org/newPermission.htm (citovaná tamtéž).

Výstupy (generované, ručně needitovat):
  lib/profil360/data/dotaznik-cs.json   texty pro prohlížeč sportovce
  lib/profil360/klic.ts                 klíč: škály, obrácené položky, kontroly

Český překlad je pracovní, od jednoho překladatele. Pravidla ITC chtějí
dva nezávislé překlady a zpětný překlad; do té doby platí, že české
znění není ověřená adaptace a výsledky se čtou opatrněji.

Spuštění: python3 docs/profil360/sestav.py
"""

import json
import random
import re
import sys
from pathlib import Path

ZDE = Path(__file__).parent
KOREN = ZDE.parent.parent

# ---------------------------------------------------------------------------
# Český překlad. Klíčem je číslo položky ve zdroji.
# Rodové tvary jen ve značkách {mužský|ženský}, celá slova.
# ---------------------------------------------------------------------------

NEO_CS = {
    # N1 úzkostnost
    1: "Dělám si starosti.",
    31: "Bojím se nejhoršího.",
    61: "Bojím se mnoha věcí.",
    91: "Snadno se dostanu do stresu.",
    # N2 hněv
    6: "Snadno se rozzlobím.",
    36: "Snadno mě něco podráždí.",
    66: "Neudržím nervy.",
    96: "Jen tak něco mě nerozčílí.",
    # N3 skleslost
    11: "Často mám smutnou náladu.",
    41: "Nemám se {rád|ráda}.",
    71: "Často jsem psychicky na dně.",
    101: "Cítím se se sebou dobře.",
    # N4 rozpačitost
    16: "Je pro mě těžké oslovit druhé.",
    46: "Bojím se na sebe upozornit.",
    76: "Dobře se cítím jen mezi přáteli.",
    106: "Náročné společenské situace mi nevadí.",
    # N5 nestřídmost
    21: "Občas se v něčem utrhnu ze řetězu (jídlo, pití, utrácení).",
    51: "Málokdy to s něčím přeháním.",
    81: "Snadno odolám pokušení.",
    111: "Umím ovládnout své chutě.",
    # N6 zranitelnost vůči stresu
    26: "Snadno propadnu panici.",
    56: "Snadno mě zahltí to, co se kolem děje.",
    86: "Mám pocit, že věci nezvládám.",
    116: "Pod tlakem zůstávám v klidu.",
    # E1 přátelskost
    2: "Snadno si najdu přátele.",
    32: "Mezi lidmi se cítím dobře.",
    62: "Vyhýbám se kontaktu s ostatními.",
    92: "Držím si lidi od těla.",
    # E2 společenskost
    7: "Miluji velké oslavy a večírky.",
    37: "Na večírcích mluvím s mnoha různými lidmi.",
    67: "Raději trávím čas o samotě.",
    97: "Vyhýbám se davům.",
    # E3 průbojnost
    12: "Ujímám se vedení.",
    42: "Snažím se vést ostatní.",
    72: "Beru věci do svých rukou.",
    102: "Čekám, až cestu ukážou ostatní.",
    # E4 aktivita
    17: "Pořád mám co dělat.",
    47: "Pořád jsem v pohybu.",
    77: "Ve volném čase toho dělám hodně.",
    107: "Vyhovuje mi brát věci v klidu.",
    # E5 vyhledávání vzrušení
    22: "Miluji vzrušení.",
    52: "Vyhledávám dobrodružství.",
    82: "Baví mě jednat bezhlavě.",
    112: "Chovám se divoce a bláznivě.",
    # E6 veselost
    27: "Vyzařuje ze mě radost.",
    57: "Užívám si spoustu legrace.",
    87: "Miluji život.",
    117: "Dívám se na život z té lepší stránky.",
    # O1 představivost
    3: "Mám živou představivost.",
    33: "Baví mě nechat se unášet fantazií.",
    63: "Baví mě snít s otevřenýma očima.",
    93: "Baví mě ponořit se do myšlenek.",
    # O2 umělecké zájmy
    8: "Věřím, že umění je důležité.",
    38: "Vidím krásu ve věcech, kterých si ostatní nemusí všimnout.",
    68: "Poezie mě nebaví.",
    98: "Návštěvy galerií a muzeí umění mě nebaví.",
    # O3 citovost
    13: "Prožívám své emoce intenzivně.",
    43: "Cítím emoce druhých.",
    73: "Svých emočních reakcí si všímám jen zřídka.",
    103: "Nerozumím lidem, kteří se nechají unést emocemi.",
    # O4 dobrodružnost
    18: "Dávám přednost změně před rutinou.",
    48: "Raději se držím věcí, které znám.",
    78: "Změny mi nejsou příjemné.",
    108: "Lpím na zavedených způsobech.",
    # O5 intelekt
    23: "Baví mě číst náročné texty.",
    53: "Vyhýbám se filozofickým debatám.",
    83: "Abstraktní myšlenky chápu těžko.",
    113: "Teoretické debaty mě nezajímají.",
    # A1 důvěra
    4: "Věřím druhým.",
    34: "Věřím, že druzí mají dobré úmysly.",
    64: "Věřím tomu, co lidé říkají.",
    94: "Lidem nedůvěřuji.",
    # A2 morálka
    9: "Využívám druhé pro své cíle.",
    39: "Podvádím, když mi to pomůže dopředu.",
    69: "Využívám ostatních ve svůj prospěch.",
    99: "Kazím druhým plány.",
    # A3 altruismus
    14: "Pomáhat druhým mě těší.",
    44: "Záleží mi na druhých.",
    74: "Pocity druhých jsou mi lhostejné.",
    104: "Na druhé si neudělám čas.",
    # A4 spolupráce
    19: "Pořádná hádka mě baví.",
    49: "Křičím na lidi.",
    79: "Urážím lidi.",
    109: "Oplácím druhým, co mi udělali.",
    # A5 skromnost
    24: "Věřím, že jsem lepší než ostatní.",
    54: "Myslím si o sobě hodně.",
    84: "Mám o sobě vysoké mínění.",
    114: "Chlubím se svými přednostmi.",
    # A6 soucit
    29: "Soucítím s lidmi bez domova.",
    59: "Soucítím s těmi, kdo jsou na tom hůř než já.",
    89: "Problémy druhých mě nezajímají.",
    119: "Snažím se nemyslet na lidi v nouzi.",
    # C1 sebedůvěra ve schopnosti
    5: "Úkoly úspěšně dokončuji.",
    35: "V tom, co dělám, vynikám.",
    65: "Úkoly zvládám hladce.",
    95: "Vím, jak věci dotáhnout.",
    # C2 pořádnost
    10: "Mám {rád|ráda} kolem sebe uklizeno.",
    40: "Často zapomínám vracet věci na své místo.",
    70: "V pokoji nechávám nepořádek.",
    100: "Nechávám své věci povalovat.",
    # C3 plnění povinností
    15: "Dodržuji sliby.",
    45: "Mluvím pravdu.",
    75: "Porušuji pravidla.",
    105: "Porušuji sliby.",
    # C4 cílevědomost
    20: "Tvrdě pracuji.",
    50: "Dělám víc, než se ode mě čeká.",
    80: "Udělám jen nutné minimum.",
    110: "Do své práce vkládám málo času a úsilí.",
    # C5 sebekázeň
    25: "Vždycky mám všechno připravené.",
    55: "Své plány uskutečním.",
    85: "Promrhávám čas.",
    115: "Těžko se pouštím do úkolů.",
    # C6 rozvážnost
    30: "Pouštím se do věcí bez rozmyslu.",
    60: "Rozhoduji se ukvapeně.",
    90: "Vrhám se do věcí po hlavě.",
    120: "Jednám bez přemýšlení.",
}

VIA_CS = {
    1: "Je pro mě důležité žít ve světě plném krásy.",
    2: "Když vidím krásné věci, prožívám hluboké emoce.",
    3: "Přírodních krás kolem sebe si všímám jen zřídka.",
    4: "Krásy si všimnu, až když na ni upozorní ostatní.",
    5: "Vím, že mám v životě lidi, kterým na mně záleží stejně jako na nich samých.",
    6: "Dokážu druhému projevit lásku.",
    7: "Své city druhým snadno neukazuji.",
    8: "Je pro mě těžké přijmout od kohokoli lásku.",
    9: "Jsem velmi loajální člověk.",
    10: "Podporuji své spoluhráče a členy skupiny.",
    11: "Práce ve skupině mi nejde.",
    12: "Všechno raději dělám bez ostatních.",
    13: "Nadchne mě spousta různých činností.",
    14: "V každé situaci najdu něco zajímavého.",
    15: "Svět mě nijak zvlášť nezajímá.",
    16: "Mám málo zájmů.",
    17: "Jednám se všemi lidmi stejně.",
    18: "Věřím, že práva každého člověka jsou stejně důležitá.",
    # 19 je shodná s IPIP-NEO 69
    20: "S lidmi, kteří mi nejsou sympatičtí, jednám jinak.",
    21: "Když se ke mně někdo zachová špatně, snažím se reagovat s pochopením.",
    22: "Dávám druhým šanci začít znovu.",
    23: "Chovám k lidem zášť.",
    24: "Je pro mě těžké druhým odpustit.",
    25: "Děkuji těm, kterým na mně záleží.",
    26: "Jsem velmi vděčný člověk.",
    27: "Necítím k druhým vděčnost.",
    28: "Ve svém životě vidím málo důvodů k vděčnosti.",
    29: "Dokážu najít pozitivní stránku i v tom, co druzí vidí negativně.",
    30: "I přes obtíže si zachovávám naději.",
    31: "Čekám to nejhorší.",
    32: "Často myslím na možné špatné konce, které pravděpodobně nenastanou.",
    33: "Smíchem zpříjemňuji druhým dny.",
    34: "Smysl pro humor si udržím i v ponurých situacích.",
    35: "Nejsem {známý|známá} svým smyslem pro humor.",
    36: "Se mnou není legrace.",
    37: "Úkol nevzdám, dokud není hotový.",
    38: "Věci dokončím i přes překážky.",
    39: "Nedokončuji, co začnu.",
    40: "Snadno to vzdávám.",
    41: "Lidé mi věří, že udržím tajemství.",
    # 42 je shodná s IPIP-NEO 15
    43: "Když mám problém, vylžu se z něj.",
    44: "Zrazuji lidi, kteří mi důvěřovali.",
    45: "Vážím všechna pro a proti.",
    46: "Přátelé si cení mého dobrého úsudku.",
    47: "Věci obvykle kriticky nepromýšlím.",
    48: "Při rozhodování nezvažuji různé možnosti.",
    49: "Na pomoc kamarádovi mám vždycky čas.",
    50: "Snažím se povzbudit lidi, kteří vypadají smutně.",
    51: "Ztrácím trpělivost, když mi druzí vyprávějí o svých problémech.",
    52: "Laskavost oplácím jen těm, kdo byli laskaví ke mně.",
    53: "Umím pomoct lidem, aby spolu dobře spolupracovali.",
    54: "Lidé o mně říkají, že vedu pevně, ale férově.",
    55: "Je pro mě těžké přimět ostatní ke spolupráci.",
    56: "Vést skupinu mi nejde.",
    57: "Učení mě provází celý život.",
    58: "Nadchne mě, když se naučím něco nového.",
    59: "Učit se nové věci mě nebaví.",
    60: "Naučné knihy pro radost nečtu.",
    61: "Nechlubím se svými úspěchy.",
    62: "Nikdo by mě nenazval {arogantním|arogantní}.",
    63: "Baví mě vyčnívat z davu.",
    64: "Baví mě mluvit o sobě.",
    65: "Vymýšlím nové způsoby, jak věci dělat.",
    66: "Myslím originálně.",
    67: "Lidé mě nepovažují za někoho s novými a neobvyklými nápady.",
    68: "Nemám zvláštní potřebu dělat něco originálního.",
    69: "Na život mám zralý pohled.",
    70: "Lidé mě považují za moudrého člověka.",
    71: "Těžko poznávám, na čem opravdu záleží.",
    72: "Druzí se na mě pro radu obracejí jen zřídka.",
    73: "Věřím, že je vždycky lepší jít na jistotu než potom litovat.",
    74: "Rozhoduji se uvážlivě.",
    75: "Jednám dřív, než domyslím důsledky.",
    76: "Baví mě riskovat.",
    77: "Jsem velmi disciplinovaný člověk.",
    78: "Vzdám se věcí, které mi dlouhodobě škodí, i když mi krátkodobě dělají dobře.",
    79: "Nechám se unést nutkáním utrácet nebo se přejídat.",
    80: "Podléhám svým nutkáním.",
    81: "Dobře vycítím, co druzí prožívají.",
    82: "Vím, co říct, aby se lidé cítili dobře.",
    83: "V nové společenské situaci nevím, jak se chovat.",
    84: "Těžko odhaduji, jak budou druzí reagovat.",
    85: "Jsem duchovně založený člověk.",
    86: "Věřím, že každý člověk má v životě nějaký smysl.",
    87: "Mám pocit, že život nemá smysl.",
    88: "Nevěřím v žádnou vyšší moc ani v Boha.",
    89: "Často se stavím proti silnému odporu.",
    90: "Neváhám vyslovit nepopulární názor.",
    91: "Za svým přesvědčením si nestojím.",
    92: "Když by to mohlo mít nepříjemné následky, neříkám otevřeně, co si myslím.",
    93: "Ráno se probouzím s nadšením z toho, co den přinese.",
    94: "Těším se na každý nový den.",
    95: "Lidé o mně říkají, že jsem {nevrlý|nevrlá}.",
    96: "Nemám moc energie.",
}

BISBAS_CS = {
    1: "Dělám si starosti s tím, co si o mně lidé myslí.",
    2: "Pořád mám z něčeho obavy.",
    3: "Často se trápím věcmi, které se nakonec ukážou jako nedůležité.",
    4: "Bojím se, že udělám něco špatně.",
    5: "Snadno se mě něco dotkne.",
    6: "Když hrozí nebezpečí, začínám panikařit.",
    # 7 je shodná s IPIP-NEO 56, 8 s IPIP-NEO 91
    9: "Starosti si dělám jen málokdy.",
    10: "Jen tak něco mě neuvede do rozpaků.",
    11: "Baví mě jednat spontánně.",
    12: "Umím druhé přemluvit k něčemu opravdu odvážnému nebo bláznivému.",
    13: "Zkusím cokoli aspoň jednou.",
    14: "Baví mě jednat podle momentální chuti.",
    15: "Dávám přednost kamarádům, kteří jsou vzrušujícím způsobem nepředvídatelní.",
    16: "Dělám bláznivé věci.",
    # 17 je shodná s IPIP-NEO 82
    18: "Paragliding ani bungee jumping nejsou nic pro mě.",
    19: "Blbnutí mě málokdy baví.",
    20: "Vyhýbám se nebezpečným situacím.",
    21: "Chci velet.",
    22: "Snažím se překonat výkony druhých.",
    23: "Baví mě předvádět své tělo.",
    24: "Vím, jak obejít pravidla.",
    25: "Mám silnou potřebu moci.",
    # 26 je shodná s IPIP-NEO 12
    27: "Tvrdě se ženu za úspěchem.",
    28: "Nemám moc silnou motivaci uspět.",
    29: "Nejsem nijak výjimečný člověk.",
    30: "Nesnáším být středem pozornosti.",
    31: "Cítím nadšení nebo radost bez zjevného důvodu.",
    32: "Když ostatní slaví, strhne mě to.",
    33: "Chci utěšit každého, koho něco zranilo.",
    34: "Mívám tolik radosti a energie, že se skoro nemůžu udržet.",
    35: "Nadšení mě strhne jen málokdy.",
    36: "Věci mě nijak nenadchnou.",
}

# Položky, které jsou ve dvou nástrojích stejné. Sportovec je dostane jednou
# a započítají se do obou škál. (nástroj, číslo) -> (nástroj, číslo) první výskyt.
SHODNE = {
    ("via", 19): ("neo", 69),
    ("via", 42): ("neo", 15),
    ("bisbas", 7): ("neo", 56),
    ("bisbas", 8): ("neo", 91),
    ("bisbas", 17): ("neo", 82),
    ("bisbas", 26): ("neo", 12),
}

DASS_CS = {
    1: "Těžko se mi zklidňovalo.",
    6: "Moje reakce na situace byly přehnané.",
    8: "Připadalo mi, že spotřebovávám hodně nervové energie.",
    11: "Snadno mě něco rozrušilo.",
    12: "Těžko se mi odpočívalo.",
    14: "Vadilo mi všechno, co mě zdržovalo od toho, co jsem {potřeboval|potřebovala} udělat.",
    18: "Snadno se mě něco dotklo.",
}

# Kontrola spolehlivosti vyplnění. Stejná stupnice jako IPIP.
KONTROLNI = [
    ("instruovana", "U této otázky zvol „spíš mě vystihuje“.", [4]),
    ("instruovana", "U této otázky zvol „vůbec mě nevystihuje“.", [1]),
    ("nepravdepodobna", "Každou noc spím přes čtrnáct hodin.", [1, 2]),
    ("nepravdepodobna", "Osobně znám všechny sportovce na světě.", [1, 2]),
]

# Dvojice s opačným obsahem pro kontrolu konzistence: (nástroj, číslo) × 2.
# Konzistentní odpověď: a ≈ 6 − b.
PARY = [
    (("neo", 15), ("neo", 105)),   # dodržuji sliby / porušuji sliby
    (("neo", 116), ("neo", 26)),   # v klidu pod tlakem / snadno panika
    (("neo", 2), ("neo", 62)),     # snadno přátelé / vyhýbám se kontaktu
    (("neo", 18), ("neo", 48)),    # změna / držím se známého
    (("neo", 17), ("neo", 107)),   # pořád co dělat / brát v klidu
    (("via", 37), ("via", 40)),    # nevzdám / snadno vzdávám
    (("neo", 1), ("bisbas", 9)),   # starosti / málokdy starosti
    (("via", 94), ("via", 96)),    # těším se na den / nemám energii
]

NEO_NAZVY = {
    ("N", 1): "N1", ("N", 2): "N2", ("N", 3): "N3", ("N", 4): "N4", ("N", 5): "N5", ("N", 6): "N6",
    ("E", 1): "E1", ("E", 2): "E2", ("E", 3): "E3", ("E", 4): "E4", ("E", 5): "E5", ("E", 6): "E6",
    ("O", 1): "O1", ("O", 2): "O2", ("O", 3): "O3", ("O", 4): "O4", ("O", 5): "O5", ("O", 6): "O6",
    ("A", 1): "A1", ("A", 2): "A2", ("A", 3): "A3", ("A", 4): "A4", ("A", 5): "A5", ("A", 6): "A6",
    ("C", 1): "C1", ("C", 2): "C2", ("C", 3): "C3", ("C", 4): "C4", ("C", 5): "C5", ("C", 6): "C6",
}
# Liberalismus (O6) se nezadává: jeho položky se ptají na volby a politiku.
VYNECHANE_FAZETY = {"O6"}

SEMINKO = 36020260926

ROD = re.compile(r"\b(\w+l\s+jsem|jsem\s+\w+[ýá]\b|byl[a]?|sám|sama|rád|ráda)\b", re.IGNORECASE)


def nacti():
    neo = json.loads((ZDE / "zdroje" / "ipip-neo-120-en.json").read_text(encoding="utf-8"))
    ostatni = json.loads((ZDE / "zdroje" / "ipip-via-r-bisbas-dass21-en.json").read_text(encoding="utf-8"))
    return neo, ostatni


def sestav():
    neo, ostatni = nacti()
    chyby = []
    polozky = {}  # (nástroj, číslo) -> {cs, en, stupnice}
    skaly = []  # {kod, nastroj, polozky: [(nástroj, číslo)], obracene: [...]}

    # IPIP-NEO-120
    fazety = {}
    for i, q in enumerate(neo, 1):
        kod = NEO_NAZVY[(q["domain"], q["facet"])]
        if kod in VYNECHANE_FAZETY:
            continue
        if i not in NEO_CS:
            chyby.append(f"IPIP-NEO {i} nemá překlad: {q['text']}")
            continue
        polozky[("neo", i)] = {"cs": NEO_CS[i], "en": q["text"], "stupnice": "A"}
        f = fazety.setdefault(kod, {"kod": kod, "nastroj": "IPIP-NEO-120", "polozky": [], "obracene": []})
        f["polozky"].append(("neo", i))
        if q["keyed"] == "minus":
            f["obracene"].append(("neo", i))
    for d in "NEOAC":
        for n in range(1, 7):
            kod = f"{d}{n}"
            if kod in fazety:
                skaly.append(fazety[kod])

    def pridej(nastroj_id, nastroj_nazev, preklad, jen_skaly=None, predpona="", stupnice="A"):
        inv = ostatni[nastroj_id]
        otazky = {q["id"]: q for q in inv["questions"]}
        for s in inv["subscales"]:
            if jen_skaly and s["id"] not in jen_skaly:
                continue
            skala = {"kod": predpona + s["id"], "nastroj": nastroj_nazev, "polozky": [], "obracene": []}
            for qid in s["questionIds"]:
                cislo = int(qid.split("-")[-1])
                klic = ("bisbas" if nastroj_id == "bis-bas" else "via" if nastroj_id == "ipip-via-r" else "dass", cislo)
                cil = SHODNE.get(klic, klic)
                if cil == klic:
                    if cislo not in preklad:
                        chyby.append(f"{nastroj_nazev} {cislo} nemá překlad: {otazky[qid]['en']}")
                        continue
                    polozky[klic] = {"cs": preklad[cislo], "en": otazky[qid]["en"], "stupnice": stupnice}
                skala["polozky"].append(cil)
                if otazky[qid]["rev"]:
                    skala["obracene"].append(cil)
            skaly.append(skala)

    pridej("ipip-via-r", "IPIP-VIA-R", VIA_CS, predpona="V.")
    pridej("bis-bas", "IPIP BIS/BAS", BISBAS_CS)
    pridej("dass21", "DASS-21", DASS_CS, jen_skaly={"stress"}, predpona="DASS.", stupnice="D")

    # Shodné položky: v obou nástrojích stejný směr, jinak by šlo o chybu v párování.
    for (a, b) in SHODNE.items():
        smery = set()
        for s in skaly:
            if b in s["polozky"]:
                smery.add(b in s["obracene"])
        if len(smery) != 1:
            chyby.append(f"shodná položka {a} = {b} má v nástrojích různý směr")

    for k, p in polozky.items():
        if "\u2014" in p["cs"]:
            chyby.append(f"{k}: dlouhá pomlčka")
        bez_znacek = re.sub(r"\{[^{}]*\}", "", p["cs"])
        if ROD.search(bez_znacek):
            chyby.append(f"{k}: možný rodový tvar mimo značku: {p['cs']}")
        for z in re.findall(r"\{[^{}]*\}", p["cs"]):
            if not re.fullmatch(r"\{[^|{}]+\|[^|{}]+\}", z):
                chyby.append(f"{k}: značka rodu musí mít dvě celá slova: {z}")
    return polozky, skaly, chyby


def vystup(polozky, skaly):
    nahoda = random.Random(SEMINKO)
    ipip = [k for k, p in polozky.items() if p["stupnice"] == "A"]
    dass = [k for k, p in polozky.items() if p["stupnice"] == "D"]
    kontrolni = [("kontrola", i) for i in range(len(KONTROLNI))]
    poradi_ipip = ipip + kontrolni
    nahoda.shuffle(poradi_ipip)
    # Čísla: IPIP a kontroly 1..n v pořadí zobrazení, DASS 501.., stejné pro všechny.
    cislo = {k: i + 1 for i, k in enumerate(poradi_ipip)}
    for j, k in enumerate(sorted(dass, key=lambda x: x[1])):
        cislo[k] = 501 + j

    klient = {"verze": "cs-1.0", "polozky": {}}
    for k in poradi_ipip:
        if k[0] == "kontrola":
            klient["polozky"][str(cislo[k])] = {"t": KONTROLNI[k[1]][1], "s": "A"}
        else:
            klient["polozky"][str(cislo[k])] = {"t": polozky[k]["cs"], "s": "A"}
    for k in sorted(dass, key=lambda x: cislo[x]):
        klient["polozky"][str(cislo[k])] = {"t": polozky[k]["cs"], "s": "D"}

    skaly_ts = [
        {
            "kod": s["kod"],
            "nastroj": s["nastroj"],
            "polozky": sorted(cislo[x] for x in s["polozky"]),
            "obracene": sorted(cislo[x] for x in s["obracene"]),
        }
        for s in skaly
    ]
    kontrolni_ts = [
        {"id": cislo[("kontrola", i)], "druh": d, "ocekavano": o} for i, (d, _t, o) in enumerate(KONTROLNI)
    ]
    pary_ts = [[cislo[a], cislo[b]] for a, b in PARY]
    zdroj = {str(cislo[k]): f"{k[0]}-{k[1]}" for k in cislo if k[0] != "kontrola"}
    anglicky = {str(cislo[k]): polozky[k]["en"] for k in cislo if k[0] != "kontrola"}

    j = lambda x: json.dumps(x, ensure_ascii=False)
    ts = "\n".join([
        "// Klíč Profilu 360. GENEROVÁNO z docs/profil360/sestav.py, ručně needitovat.",
        "//",
        "// Stránka s dotazníkem sem nesmí sáhnout (scripts/audit-balicku.cjs): kdo",
        "// zná obrácené položky a očekávané odpovědi kontrol, projde kontrolami",
        "// platnosti, jak se mu zachce. Používá ho výpočet profilu u kouče a server.",
        "",
        "export interface SkalaKlic {",
        "  /** N1..C6 fazety IPIP-NEO, V.* silné stránky, BIS/BAS, DASS.stress */",
        "  kod: string",
        "  nastroj: string",
        "  polozky: number[]",
        "  /** podmnožina polozky, které se obracejí (6 − x) */",
        "  obracene: number[]",
        "}",
        "",
        f"export const SKALY: SkalaKlic[] = {j(skaly_ts)}",
        "",
        "export const KONTROLNI: { id: number; druh: string; ocekavano: number[] }[] = " + j(kontrolni_ts),
        "",
        "/** dvojice s opačným obsahem; konzistentní odpověď je a ≈ 6 − b */",
        f"export const PARY: [number, number][] = {j(pary_ts)}",
        "",
        "/** číslo v dotazníku → původ (nástroj-číslo ve zdroji) */",
        f"export const ZDROJ: Record<string, string> = {j(zdroj)}",
        "",
        "/** anglický originál, pro kontrolu překladu a pro anglickou verzi */",
        f"export const ORIGINAL_EN: Record<string, string> = {j(anglicky)}",
        "",
    ])
    return klient, ts, cislo


if __name__ == "__main__":
    polozky, skaly, chyby = sestav()
    for c in chyby:
        print("CHYBA", c)
    if chyby:
        sys.exit(1)
    klient, ts, cislo = vystup(polozky, skaly)
    cil = KOREN / "lib" / "profil360"
    (cil / "data").mkdir(parents=True, exist_ok=True)
    (cil / "data" / "dotaznik-cs.json").write_text(json.dumps(klient, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    (cil / "klic.ts").write_text(ts, encoding="utf-8")
    pocet_a = sum(1 for p in klient["polozky"].values() if p["s"] == "A")
    pocet_d = sum(1 for p in klient["polozky"].values() if p["s"] == "D")
    print(f"OK: {len(skaly)} škál, {pocet_a} otázek na stupnici IPIP (včetně kontrol), {pocet_d} DASS")
