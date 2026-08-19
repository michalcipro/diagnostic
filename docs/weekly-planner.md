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
| Master | zakládá deníky, vidí jméno, e-mail, počet dnů a čas poslední aktivity |
| Kouč | v pilotním provozu nic |

**Do obsahu deníku nevidí nikdo kromě klienta, ani master.** Není to opomenutí
v oprávněních, ale povaha věci: deník je osobní zápisník, ne dotazník, jehož
výsledek se s koučem probírá. Kdyby do něj kouč viděl, přestal by být tím, čím
má být, a lidé by si do něj přestali psát pravdu.

Hlídá to statická kontrola: `scripts/audit-pristupu.cjs` ověřuje, že se
`convex/plannerCoach.ts` tabulek `plannerDays`, `plannerWeeks` ani
`plannerHabits` vůbec nedotkne. Kdyby to někdo v budoucnu zkusil obejít,
neprojde audit.

## Účty

Deník nevzniká registrací, ale pozvánkou. Master v přehledu → záložka **Deníky**
zadá jméno, e-mail, oslovení a jazyk a dostane jednorázový odkaz
`/planner/start/<token>`, který klientovi pošle. Klient si na něm zvolí heslo
a tím účet vznikne; heslo od té chvíle nezná nikdo jiný.

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

Plánovač používá tytéž tokeny `--wm-*`, tytéž karty a tutéž typografii jako
vyhodnocení diagnostiky. Otevírají se ze stejné domény a mají vypadat jako
jeden produkt, ne jako dva programy vedle sebe. Papírová podoba předlohy se
drží tam, kde na ni dojde: v tisku a v PDF.

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
