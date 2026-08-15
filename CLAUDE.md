# Pokyny pro práci na tomto projektu

Platí pro všechny budoucí úkoly, testy i texty v této aplikaci.

## Typografie

**Nikdy nepoužívej dlouhou pomlčku** (em dash, U+2014). Ani ve vyhodnocení, ani
v kódu, ani v dokumentaci, ani v odpovědích v chatu. Místo ní patří čárka,
dvojtečka, středník, závorka, nebo se věta rozdělí. Krátká pomlčka U+2013
(en dash) se mezerami je v pořádku a používá se i pro rozsahy („8–40").

Kontrola (hledá se U+2014, ne U+2013):

```bash
grep -rnP "\x{2014}" --include="*.ts" --include="*.tsx" --include="*.css" \
  --include="*.cjs" --include="*.md" --include="*.json" . \
  | grep -v node_modules | grep -v "\.next"
```

nesmí vrátit nic.

## Rod respondenta

**České vyhodnocení musí být ve správném gramatickém rodě.** Když dotazník
vyplňuje žena, všechny tvary jsou v ženském rodě; když muž, v mužském. Nikdy
se nesmí stát, že žena dostane text v mužském rodě.

V obsahových textech se rodové tvary zapisují značkou `{mužský|ženský}`,
kterou při vykreslení rozvine `applyGender()` v `lib/diagnostic/content.ts`.
Píše se celé slovo do obou větví: správně `jsi {schopen|schopna}`,
špatně `jsi schopen{|a}`.

Angličtina rod neřeší, tam se značka nepoužívá.

U nového textu projdi všechna místa, kde se rod projeví: příčestí minulá
(`{byl|byla}`, `{dokázal|dokázala}`), krátké tvary (`{schopen|schopna}`,
`{sám|sama}`), přídavná jména v přísudku (`{unavený|unavená}`). Přítomný čas
druhé osoby („víš", „děláš") je rodově neutrální a značku nepotřebuje.

## Shrnutí na závěr

Každé vyhodnocení musí končit **srozumitelným shrnutím pro klienta**. Ne výčet
čísel, ale několik vět běžnou řečí: co z profilu plyne, na čem stavět a co
řešit jako první. Píše se tak, aby tomu rozuměl člověk bez psychologického
vzdělání.

## Objem textu ve vyhodnocení

**Texty vyhodnocení mají mít aspoň o čtvrtinu víc obsahu než původní verze.**
Platí to pro všechny testy (ELITE 200, ELITE 100, sport i business,
emocionálně-destruktivní vzorce) a pro všechny jazyky.

Výchozí stav je zapsaný v `scripts/objem-vychozi.json` a měří se proti němu:

```bash
node scripts/objem-textu.cjs
```

Čtvrtina navíc znamená víc obsahu, ne delší věty o tomtéž. Přidává se to, co
text posouvá od popisu k použitelnosti:

- jak se to projeví v konkrétní situaci, ne jen obecně,
- příklad, na kterém to klient pozná u sebe,
- co s tím udělat jako první krok a podle čeho pozná, že to zabírá,
- kde se ta vlastnost plete s jinou a jak je od sebe odlišit.

Nepřidává se vata, opakování už řečeného ani obecné povzbuzení. Když se text
nedá poctivě rozšířit, je to signál, že chybí obsah, ne že je pravidlo špatné.

Stavba zůstává: stejné klíče, stejné sekce, stejné rozdělení sport a business.
Rodové značky se v rozšířeném textu doplňují stejně jako jinde.

## Ověřování

Před commitem musí projít:

```bash
npx tsc --noEmit
npm run build
```

Na kontrolu textů slouží skripty popsané v README.
