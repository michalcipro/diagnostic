# Weekly Planner

Elektronická podoba papírového týdenního plánovače Winning Minds. Klient si
pod vlastním přihlášením vede deník, aplikace z něj počítá týdenní, měsíční
a roční statistiky. Stojí vedle diagnostiky, ne uvnitř ní.

**Zatím běží v pilotním provozu a pracovat s ním smí výhradně master.**
Ostatní kouči záložku „Deníky" v přehledu nevidí a serverové funkce je odmítnou,
takže se k plánovači nedostanou ani přímým voláním API. Vypíná se to na jednom
místě, viz [Pilotní provoz](#pilotní-provoz).

## Co je pevné a co si klient určuje sám

Stavba listu je pevná a odpovídá tištěné předloze. Klient vyplňuje políčka,
nepřidává sekce:

| Sekce | Obsah |
| --- | --- |
| Týdenní rozvrh | 7 dnů × hodiny 05:00 až 22:00 |
| Poznámky a nápady | volný text k celému týdnu |
| Tracker návyků | vlastní návyky × 7 dnů, klikací kolečka |
| Denní postup | spánek v hodinách, energie, soustředění, nálada, produktivita (1 až 10) |
| Denní reflexe | za co jsem vděčný, dnešní vítězství, co zlepšit |

**Jediné, co si klient definuje sám, jsou návyky.** Může je přidávat,
přejmenovávat, řadit, archivovat i mazat. Nic z toho není jednosměrné:
odškrtnuté kolečko jde odškrtnout zpět, číslo přepsat i vymazat, archivovaný
návyk vrátit.

Rozsah hodin ani začátek týdne se nastavit nedají schválně. Kdyby si každý
zvolil vlastní, přestaly by být týdny mezi sebou i s papírem porovnatelné
a statistika „naplánovaných hodin" by ztratila smysl.

### Archivace versus mazání

Archivovaný návyk zmizí z trackeru, ale zůstane v historii i ve statistikách za
období, kdy platil. Je to výchozí způsob, jak s návykem skončit, protože čísla
za minulé měsíce se tím nezmění.

Smazání je nevratné a promítne se zpětně do všech období. Aplikace to nabízí až
za archivací a s výslovným upozorněním, co to udělá.

## Kdo co vidí

| Role | Přístup |
| --- | --- |
| Klient | vlastní deník, statistiky, export dat, tisk i PDF |
| Master | zakládá deníky, vidí jméno, e-mail, počet dnů a čas poslední aktivity, plus tolik z obsahu, kolik má u klienta nastavenou úroveň |
| Kouč | v pilotním provozu nic |

## Co z deníku vidí kouč

Řídí to pole `sdileni` u klienta a nastavuje ho kouč při zakládání deníku.
Úrovně jsou tři:

| Úroveň | Co projde ke kouči |
| --- | --- |
| `nic` | vůbec nic z obsahu; kouč ví jen, že si klient deník vede |
| `cisla` | hodnocení, odškrtnuté návyky, série a statistiky |
| `vse` | celý deník včetně rozvrhu, reflexe a poznámek k týdnu |

Výchozí úroveň nových deníků je `cisla`. **Účet, který úroveň nemá vyplněnou,
se čte jako `nic`**: deníky založené dřív vznikly za slibu, že do nich nikdo
nevidí, a zavedení sdílení ten slib nesmí zrušit zpětně.

Platí u toho jedno pravidlo bez výjimky: **klient vždycky vidí, co vidí kouč**,
běžnou větou na svém účtu. Dohled, o kterém člověk neví, by z deníku udělal
hlášení a lidé by si do něj přestali psát pravdu; přiznaný dohled nestojí nic.

Hlídají to statické kontroly v `scripts/audit-pristupu.cjs`:

- `convex/plannerCoach.ts`, tedy správa klientů, se tabulek `plannerDays`,
  `plannerWeeks` ani `plannerHabits` vůbec nedotkne,
- v `convex/plannerCoachRead.ts` projde každé čtení volného textu podmínkou
  `sTexty` a ta smí vzniknout jedině z úrovně `vse`,
- na úrovni `nic` se nenačte ani jeden den, takže není co pustit ven,
- výstup dne i týdne má přesně očekávané klíče, takže nově přidané pole
  neproteče tiše,
- `planner.me` vrací úroveň i klientovi a účet klienta ji zobrazuje.

Každé nahlédnutí kouče do deníku se zapisuje do přístupového logu jako
`otevreni-deniku`, stejně jako otevření výsledku diagnostiky.

## Účty

Deník nevzniká registrací, vždycky ho zakládá kouč. Master v přehledu →
záložka **Deníky** zadá jméno, e-mail, oslovení, jazyk a úroveň sdílení
a vybere si jednu ze dvou cest:

**Odkazem.** Dostane jednorázový odkaz `/planner/start/<token>` s platností
30 dnů. Klient si na něm zvolí heslo a tím účet vznikne; heslo od té chvíle
nezná nikdo jiný. Nejbezpečnější cesta, protože heslo nikam neputuje.

**S heslem.** Účet vznikne rovnou a kouč jednou uvidí přihlašovací údaje
i s vygenerovaným heslem tvaru `vlna-klid-most-sova`. Předá je klientovi sám.
Účet je založený s příznakem `mustChangePassword`, takže se klient při prvním
přihlášení dostane jedině na obrazovku se změnou hesla: dočasné heslo prošlo
cizí schránkou a musí co nejdřív přestat platit. Uložený je jen otisk, takže
heslo nejde zobrazit podruhé, jen vygenerovat nové tlačítkem **Nové heslo**.

Heslo generuje `makeHeslo()` v `convex/nahoda.ts`: čtyři slova ze seznamu
o 64 položkách, tedy 24 bitů. Na trvalé heslo by to bylo málo, na dočasné
stačí, protože platí do prvního přihlášení a hádání navíc omezuje strop na
neúspěšná přihlášení. Seznam má přesně 64 položek proto, aby se 256 hodnot
bajtu dělilo beze zbytku a výběr slova nebyl zkreslený.

Aplikace **neposílá e-maily**. Odkaz i přihlašovací údaje předává kouč sám.
Kvůli tomu neexistuje samoobslužné „zapomenuté heslo" a jedinou cestou zpátky
je tlačítko **Nové heslo** u kouče.

- Odkaz platí 30 dnů a použít se dá jednou.
- Hesla se ukládají hashovaná (PBKDF2-SHA256, 210 000 iterací, vlastní sůl).
- Relace platí 30 dnů a je klouzavá: kdo si deník vede, zůstává přihlášený.
- Po pěti neúspěšných pokusech se účet na čtvrt hodiny zamkne.
- Změna hesla ukončí všechny relace včetně té současné.

Klientské účty jsou v samostatných tabulkách (`plannerClients`,
`plannerSessions`) a s koučovskými nesdílejí nic. Jsou to dva různé druhy dat
s různým režimem.

Přístup do deníku může master zablokovat a zase obnovit. Zápisky se tím nemažou;
mazat cizí deník nemůže vůbec, obsah mu nepatří a nikdy ho neviděl.

## Statistiky

Načtou se jedním rozsahovým dotazem a všechno ostatní se dopočítá v prohlížeči
čistými funkcemi v `lib/planner/stats.ts`. Server tak nemusí umět pět různých
agregací a čísla se dají ověřit na jednom místě.

Dvě zásady, na kterých čísla stojí:

1. **Budoucí dny se nepočítají.** Kdo se ve středu podívá na statistiku týdne,
   vidí „3 ze 3", ne „3 ze 7".
2. **Návyk se počítá jen ode dne vzniku a jen do archivace.** Návyk založený
   dvacátého v měsíci nemá za ten měsíc třicet možných dnů.

Co se vypisuje:

- denní skóre, tedy průměr energie, soustředění, nálady a produktivity;
  spánek do něj nepatří, protože je v hodinách,
- vyplněné dny, série vedení deníku a nejdelší série,
- u každého návyku splněno z možných, úspěšnost, aktuální i nejdelší série
  a změna proti minulému období,
- průměry, rozsahy a změny všech pěti ukazatelů,
- vývoj v čase: po dnech v týdnu, po týdnech v měsíci, po měsících v roce,
- rozdíly podle dne v týdnu a kalendářová mapa roku,
- souvislosti mezi návykem a ukazateli,
- shrnutí několika větami běžnou řečí, zakončené jedním konkrétním krokem.

### Souvislosti nejsou příčiny

Porovnání dnů se splněným návykem a bez něj se vypíše až od pěti dnů v každé
skupině. Pod tím je rozdíl dvou průměrů náhoda, kterou by bylo nezodpovědné
ukazovat jako zjištění. Aplikace u výpisu zároveň říká, že vztah může vést
oběma směry: v dobrý den se návyk plní snáz.

## Tisk a PDF

Dva různé dokumenty pro dvě různé věci:

| Dokument | Formát | Odkud |
| --- | --- | --- |
| **Týdenní list** | A4 na šířku, věrná kopie papírové předlohy | tlačítko na týdenním i denním pohledu |
| **Přehled deníku** | A4 na výšku, čtený report za týden, měsíc nebo rok | tlačítko ve statistikách |

Obojí vzniká jako **skutečný soubor** přímo v prohlížeči, ne přes tiskový
dialog. Je to samostatná cesta proto, že na iPhonu z tiskového dialogu soubor
uložit ani odeslat nejde. Text zůstává textem, takže se v PDF dá vyhledávat.
Tisk přes dialog prohlížeče funguje taky, sazbu řídí `@media print`
v `app/planner.css`.

**Týdenní list** (`lib/planner/pdf.ts`) drží stavbu papírové předlohy, tedy co
je kde, ale ne její grafiku: sází se stejným sazečem a stejnou typografií jako
přehled i vyhodnocení. Původně to byla věrná kopie i s černými pruhy a plnou
mřížkou a vedle ostatních dokumentů to působilo jako výstup jiného programu.

Všechny výšky se počítají dopředu z místa, které na stránce zbývá, a teprve
pak se kreslí. Díky tomu list vždycky vyjde na jednu stranu, oba sloupce končí
ve stejné výšce a denní reflexe začíná pokaždé na stejném místě, ať má klient
návyky tři nebo dvacet. Kdyby se sázelo shora dolů a doufalo se, že to vyjde,
přetekla by při plném trackeru reflexe na druhou stranu.

**Přehled deníku** (`lib/planner/stats-pdf.ts`) sází tentýž sazeč, jakým se
skládá vyhodnocení diagnostiky (`lib/diagnostic/pdf/sazba.ts`), takže oba
dokumenty vypadají jako jedna řada. Obsahuje klíčová čísla, tabulku návyků
s pruhy úspěšnosti, tabulku ukazatelů, grafy vývoje a rozdílů podle dnů,
souvislosti a na vlastní stránce shrnutí běžnou řečí zakončené jedním
konkrétním krokem. Vlastní stránka pro shrnutí je záměr, stejně jako
u diagnostiky: je to pro klienta to nejdůležitější a nemá se lámat přes dvě
strany.

Do obou se vkládá tentýž osekaný řez Liberation Sans jako u vyhodnocení
diagnostiky. Umí češtinu, slovenštinu i angličtinu; znak, který v něm není,
se nahradí zřejmým protějškem, jinak se zbaví diakritiky, a když ani to
nepomůže, vypustí se. Nečitelný čtvereček v tisku vypadá jako chyba programu,
chybějící emotikon ne.

**Pozor na znaménka.** Matematické minus (U+2212) ve vloženém písmu není.
Dokud se nenahrazovalo, mizelo beze stopy a ze záporné změny „−1,5" se v PDF
stalo „1,5" v červené barvě, tedy pravý opak toho, co se stalo. Proto se
všechny buňky tabulek čistí na jednom místě a náhradní tabulka v
`lib/planner/pdf.ts` tenhle znak převádí na obyčejný spojovník.

Klient si navíc může celý deník stáhnout jako JSON (Účet → Stáhnout deník).
Osobní zápisky mají jít vzít s sebou; bez exportu by byl deník past.

## Vzhled

Klientský deník je samostatný vizuální okruh, ne jen jiná stránka diagnostiky.
Stojí na velkých číslech, prstencích a grafech, protože se do něj kouká denně
a musí být čitelný na jeden pohled z telefonu.

### Dva motivy

Deník má **světlý** a **tmavý** motiv. Výchozí je světlý, protože se do deníku
píše i za bílého dne v kanceláři a tam je bílý list čitelnější. Tmavý se
zapíná ikonou v horní liště a volba se pamatuje v prohlížeči
(`lib/planner/storage.ts`, klíč `wm-planner:tema`).

Systémové nastavení se schválně nečte: kdyby se motiv řídil systémem, dostala
by polovina lidí tmavý deník, aniž by o to stála, a druhá by nevěděla, že
tmavý existuje.

Obojí stojí na týchž tokenech. Světlá paleta je na `.pl-root`, tmavá na
`.pl-root[data-tema="tmave"]`, žádný motiv nemá vlastní pravidla. Kdyby je
měl, opravila by se chyba jen v jednom a v druhém by zůstala, protože si jí
nikdo nevšimne dřív, než ho někdo zapne.

Tokeny `--pl-*` (plochy, linky, stíny, záře) a `--el-*` (akcenty) jsou navíc
i na globálním `:root`. Tytéž třídy totiž kreslí i koučovská sekce, která obal
`.pl-root` nemá, a bez nich by tam karty přišly o stín a vstupy o pozadí:
neznámá proměnná není chyba, jen neplatná deklarace, které si nikdo nevšimne.

Barva pásma má **dvě podoby**, viz `components/planner/score-ring.tsx`.
`barvaPasma()` vrací sytější odstín pro grafiku, kde norma žádá kontrast 3:1
(obrys prstence, čára grafu). `barvaPasmaText()` vrací tmavší odstín pro text,
kde je hranice 4,5:1. Zelená, která na bílé drží na obrysu prstence, by jako
drobné číslo nestačila. Ze stejného důvodu má text na barevné výplni škály
vlastní token pro každou barvu (`--el-na-akcentu`, `--el-na-jantaru`,
`--el-na-rubinu`): bílá na jantarovém podkladu má kontrast 1,8:1.

Hlídá to `scripts/test-planner.cjs`, oddíl „motivy": každý použitý token musí
být ve světlém motivu, v tmavém i na globálním `:root`, v pravidlech nesmí být
barva natvrdo a tiskový blok musí přebít i tmavou větev (ta má vyšší
specificitu, takže bez toho by se z tmavého motivu tiskl neon na papír).

Kontrast se neodhaduje. Skript v prohlížeči čte skutečně vykreslené barvy
včetně průhledných vrstev nad kartou a v obou motivech na mobilu i na počítači
musí vyjít nula textů pod hranicí WCAG AA.

### Denní pohled

Hlavní obrazovka telefonu. Nahoře tři prstence: skóre dne, návyky a spánek.
Oblouk se po otevření dotáhne na hodnotu a číslo uvnitř k ní dopočítá; obojí
se vypíná, když si člověk v systému vyžádá omezený pohyb. Pod nimi vstupy
v pořadí, v jakém se den vyplňuje: hodnocení, návyky, reflexe, rozvrh.

Hodnocení je řada čipů 1 až 10, ne číselník. Vybraný čip nese barvu svého
pásma, takže se stav dá přečíst z dálky bez čtení číslic. Na telefonu se řada
láme na dva řádky po pěti, ať se dá trefit palcem.

Záložky drží spodní navigace s ikonami, protože palec dosáhne dolů, ne nahoru.
Na širokých obrazovkách ji CSS skryje a záložky sedí v horní liště.

### Papír a mřížka

Papírová podoba předlohy se drží tam, kde na ni dojde: v tisku a v PDF. Tisk
je světlý v obou motivech, tmavé téma by na papíře vypilo toner a nepřineslo
nic.

Ovládací prvky mají jednotnou výšku (`--pl-ovladani`), odstupy drží
čtyřpixelovou mřížku a krajní sloupce tabulek lícují s okrajem karty. Bez toho
začínal text tabulky o dvanáct pixelů jinde než popisek nad ní.

Obsah mřížky je na střed, vodorovně i svisle, stejně jako popisky dnů nad ním.
Jde to jen díky tomu, že se **text v buňce zalomí místo oříznutí**: kdyby se
ořezával, zmizel by u vystředěného textu začátek i konec a nezbylo by nic,
podle čeho by se dal záznam poznat. Políčka rozvrhu i reflexe proto rostou
podle obsahu (`components/planner/auto-textarea.tsx`) a řádek mřížky se srovná
podle nejvyšší buňky, takže všechny dny zůstanou zarovnané.

Popisky řádků jsou na střed a tučně, stejně jako popisky dnů nad mřížkou.
Celá mřížka je pak souměrná a čte se jako jeden celek, ne jako sloupec textu
s přilepenou tabulkou.

Na telefonu se to dělí podle toho, co se vejít může. **Tracker a denní postup
ano**: kolečko i jednociferné číslo zaberou málo, takže se zúží popisek řádku
a mřížka se vejde celá, bez posouvání. **Rozvrh a reflexe ne**, sedm sloupců
textu se na tři sta padesát pixelů nevejde a smrsknout je znamená je zahodit.
Ty se posouvají do strany, ale pořádně: sloupec je dost široký na to, aby se
v něm dalo psát, první sloupec zůstává přilepený se stínem a pod nadpisem je
vidět, že se má táhnout. Useknutá tabulka bez vysvětlení vypadá jako chyba,
tohle jako ovládání.

Mřížka se nesmršťuje pod čitelnou míru. Když se na obrazovku nevejde, posune se
vodorovně a **první sloupec zůstane přilepený**, takže je pořád vidět, o který
den nebo návyk jde. Dřív se místo toho sloupce zužovaly, až se text ořízl, a na
užší obrazovce se list rozpadl. Kvůli přilepenému sloupci má tabulka
`border-collapse: separate`: s `collapse` patří linky tabulce, ne buňce, a
přilepenému sloupci by zmizely.

Grafy jsou ruční SVG bez knihovny a kreslí se **v pixelech podle změřené
šířky karty**. Obě obvyklé zkratky totiž selhaly a stojí za zapamatování:

- `preserveAspectRatio="none"` s úzkým plátnem roztáhne osu X, takže se z bodů
  stanou elipsy a z popisků rozvleklé písmo;
- pevné plátno se škálováním se sice nedeformuje, ale mění se šířkou karty
  velikost písma, takže popisky grafu byly na širokém monitoru větší než
  nadpisy kolem nich.

## Jazyky a rod

Rozhraní i shrnutí mluví česky, anglicky a slovensky. České a slovenské texty
mají rodové tvary zapsané značkou `{mužský|ženský}`, kterou při vykreslení
rozvine `applyGender()`. Rod si klient nastaví v účtu, master ho může předvyplnit
už v pozvánce.

## Pilotní provoz

Vypíná se jedinou konstantou v `convex/plannerCoach.ts`:

```ts
const PILOTNI_REZIM = true
```

Dokud je `true`, projde ke koučovským funkcím deníku pouze master. Po přepnutí
na `false` začnou deníky fungovat pro všechny naše kouče se stejnou
viditelností, jakou mají u diagnostiky: kouč vidí své klienty, master celou naši
větev, do větví externích koučů nevidí nikdo.

Záložka „Deníky" v `/kouc` se řídí toutéž rolí; skrytí je jen pohodlí, závazná
je serverová kontrola.

## Retence

Deníky se neuklízejí vůbec. Patří klientovi, ne nám, a mazat mu je po lhůtě by
bylo totéž jako vyhodit někomu zápisník ze stolu. Úklid v `convex/uklid.ts` se
dotýká jen nepoužitých pozvánek po vypršení platnosti (90 dnů) a vypršelých
relací (30 dnů po vypršení).

## Kontrola

```bash
node scripts/test-planner.cjs   # kalendář, statistika, shrnutí, jazyky, hesla
node scripts/typy-convex.cjs    # typová kontrola backendu bez nasazení
npm run audit                   # obojí a k tomu zbytek projektu
```

`scripts/typy-convex.cjs` si na dobu kontroly doplní tytéž soubory, jaké jinak
generuje `npx convex dev`, a po sobě uklidí. Bez něj by se backend zkontroloval
až při nasazování, což je u serverového kódu ta nejdražší chvíle.
