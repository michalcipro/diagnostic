# Sportovní profil 360

Test pro sportovce, který skládá veřejně dostupné, ověřené dotazníky do
jednoho sportovního profilu. Výsledek vidí jen kouč. Zatím jen česky.

## Z čeho se skládá

| nástroj | co měří | otázek | licence |
|---|---|---|---|
| IPIP-NEO-120 (Johnson, 2014) | osobnost: 5 oblastí, 29 dílčích rysů (liberalismus vynechán, ptá se na politiku) | 116 | volné dílo IPIP, i komerčně |
| IPIP-VIA-R (Bluemke a kol., 2021) | 24 silných stránek charakteru | 96 | volné dílo IPIP |
| IPIP BIS/BAS (Goldberg a kol., 2006) | brzda (obava) a pohon (tah na cíl, zážitky, odměna) | 36 | volné dílo IPIP |
| DASS-21, škála stresu (Lovibond a Lovibond, 1995) | stres za poslední týden | 7 | volné dílo |
| PHQ-4 (Kroenke a kol., 2009) | duševní pohoda, jen doporučení odborníka | 4 | bez svolení |
| MCTQ, metoda (Roenneberg a kol., 2003) | chronotyp a sociální jetlag | 5 | metoda, ne chráněný text |

Šest otázek se mezi nástroji opakuje; sportovec je dostane jednou a
započítají se do obou. Kontrolní otázky: 2 s pokynem, 2 nepravděpodobné.
Celkem 258 odpovědí a 6 otázek o sportu, 35 až 40 minut.

Nepoužité, protože nejsou volné pro komerční použití: SWLS, WHO-5, LOT-R,
Brief COPE, GSE, ERQ, BRS, Rosenbergova škála sebehodnocení, APSQ.
Sebesoucit (SCS-SF) je volný, ale jeho zdroj je z tohoto prostředí
zablokovaný; doplní se později.

## Co je převzaté a co naše

Škály a jejich skórování jsou převzaté. **Sportovní oblasti** (9), **typ
sportovce** (6 typů), **rizika** a **doporučení** jsou výklad Winning
Minds: skládají se z převzatých škál podle toho, co o nich říká výzkum, ale
jako celek ověřené nejsou. Report to říká.

## Omezení

- Český překlad je pracovní, od jednoho překladatele. Pravidla ITC chtějí
  dva nezávislé překlady a zpětný překlad.
- České normy nejsou. Skóre 0 až 100 je převedený průměr odpovědí
  (1 = 0, 5 = 100), ne percentil; pásma jsou proto hrubá.
- Normy vzniknou z anonymního vzorku, který se sbírá s každým vyplněním.

## Soubory

| soubor | co |
|---|---|
| `sestav.py` | překlad a sestavení z anglických zdrojů v `zdroje/`; generuje data a klíč |
| `lib/profil360/data/dotaznik-cs.json` | texty pro prohlížeč sportovce |
| `lib/profil360/klic.ts` | klíč: škály, obrácené položky, kontroly (jen kouč a server) |
| `lib/profil360/profil.ts` | výpočet profilu, oblasti, typy, rizika, doporučení, shrnutí |
| `lib/profil360/odeslani.ts` | serverová kontrola odeslání a doporučení odborníka |
| `components/profil360/` | dotazník a report kouče |
| `scripts/test-profil360.cjs` | test dat, výpočtu na modelových sportovcích a odeslání |
