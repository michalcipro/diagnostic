import { SD_SHODA, hraniceSilne } from "./prahy"

// Rozvržení mapy týmu.
//
// Mapa se kreslí dvakrát: interaktivně na obrazovce a staticky do PDF. Kdyby
// si každá kreslila souřadnice po svém, rozešly by se při první úpravě a kouč
// by v ruce držel jiný obrázek, než viděl na monitoru. Proto je výpočet tady
// a obě sazby z něj berou podíly, ne pixely.

/**
 * Poloha oblasti nebo části na vodorovné ose: o kolik bodů škály je tým nad
 * hranicí silného pásma (kladně), nebo pod ní (záporně).
 *
 * Hranice silného pásma se čte z normy a každá oblast ji má jinde: medián
 * sportovců u Koncentrace leží kolem 60 bodů, u Odolnosti kolem 75. Kdyby
 * mapa kreslila hrubé číslo proti jedné společné čáře, ležela by Odolnost
 * vpravo i u týmu, který je v ní slabší než jiné týmy, a Koncentrace vlevo
 * i u silného týmu. Proto se kreslí vzdálenost od vlastní hranice.
 */
export function polohaX(id: string, prumer: number): number {
  return prumer - hraniceSilne(id)
}

/**
 * Výřez mapy a dělicí linie mezi kvadranty.
 *
 * Svislá dělicí čára je hranice silného pásma, tedy nula na ose polohy.
 * Vodorovná je hranice „hráči na tom jsou podobně", táž jako ve slovech
 * u oblasti (prahy.ts).
 */
export const MAPA_ROZSAH = {
  /** vodorovně: body pod a nad hranicí silného pásma */
  xMin: -16,
  xMax: 16,
  /** hranice silného pásma */
  xDel: 0,
  /** svisle: jak moc se hráči liší; 0 nahoře, největší rozdíly dole */
  yMax: 28,
  /** hranice mezi „hráči na tom jsou podobně" a „liší se"; táž jako ve slovech u oblasti */
  yDel: SD_SHODA,
} as const

/** Pomocné svislé čáry a jejich popisky. */
export const SVISLE_CARY = [-12, -8, -4, 4, 8, 12] as const

/** Popisek svislé čáry: „+8", „−4". */
export const popisCary = (v: number) => (v > 0 ? `+${v}` : `\u2212${Math.abs(v)}`)

const orez = (x: number) => Math.min(1, Math.max(0, x))

/** Podíl 0 až 1 zleva doprava. */
export function podilX(uroven: number): number {
  const { xMin, xMax } = MAPA_ROZSAH
  return orez((uroven - xMin) / (xMax - xMin))
}

/** Podíl 0 až 1 shora dolů. */
export function podilY(rozdily: number): number {
  return orez(rozdily / MAPA_ROZSAH.yMax)
}

export interface Popisek<T> {
  data: T
  /** poloha značky */
  x: number
  y: number
  /** poloha textu; liší se od y, když se popisek musel uhnout */
  ty: number
  sirka: number
  vpravo: boolean
  /**
   * Popisek se nevešel a vynechá se. Stane se to u týmu, kde má víc oblastí
   * stejná čísla: značky pak leží na jednom místě a sedm textů vedle sebe
   * není kam dát. Kroužek s písmenem zůstane a název je v seznamu u mapy,
   * takže se informace neztratí, jen se přesune.
   */
  skryt?: boolean
}

/**
 * Rozprostře značky, které padly na stejné místo.
 *
 * Když má víc oblastí stejné číslo i stejné rozdíly mezi hráči, leží jejich
 * kroužky přesně na sobě a v mapě je vidět jen ten poslední. Posun je malý
 * zlomek bodu, takže se poloha prakticky nemění, ale všechny oblasti jsou
 * vidět. Bez toho by mapa u vyrovnaného týmu tvrdila, že oblast je jedna.
 */
export function rozprostri<T>(popisky: Popisek<T>[], krok: number): Popisek<T>[] {
  const shluky = new Map<string, Popisek<T>[]>()
  for (const p of popisky) {
    const klic = `${Math.round(p.x / krok)}:${Math.round(p.y / krok)}`
    if (!shluky.has(klic)) shluky.set(klic, [])
    shluky.get(klic)!.push(p)
  }
  for (const skupina of shluky.values()) {
    if (skupina.length < 2) continue
    skupina.forEach((p, i) => {
      p.x += (i - (skupina.length - 1) / 2) * krok
    })
  }
  return popisky
}

/** Text, který v ploše drží místo a neuhýbá: popisky rohů mapy. */
export interface Prekazka {
  x: number
  y: number
  sirka: number
  vpravo: boolean
}

const prekryvaji = (
  a: { x: number; sirka: number; vpravo: boolean },
  b: { x: number; sirka: number; vpravo: boolean },
) => {
  const aOd = a.vpravo ? a.x : a.x - a.sirka
  const bOd = b.vpravo ? b.x : b.x - b.sirka
  return aOd < bOd + b.sirka && bOd < aOd + a.sirka
}

/**
 * Rozestrká popisky, které by se překrývaly.
 *
 * Dvě oblasti se stejným rozptylem mají stejnou svislou polohu a jejich texty
 * by ležely přes sebe. Posune se ten spodnější; svislice ke značce pak drží
 * vazbu, aby se nedalo splést, který text patří ke které.
 *
 * Popisky rohů se předávají jako překážky. Ty se neposouvají, protože rohy
 * vysvětlují, co která část plochy znamená, a bez nich je mapa hádanka. Uhnout
 * musí popisek oblasti.
 */
export function rozestrkej<T>(
  popisky: Popisek<T>[],
  vyskaRadku: number,
  prekazky: Prekazka[] = [],
): Popisek<T>[] {
  const serazene = [...popisky].sort((a, b) => a.y - b.y)

  // Posun kvůli překážce umí popisek vrátit na řádek souseda a naopak, takže
  // jeden průchod nestačí. Opakuje se, dokud se rozvržení neustálí; strop je
  // pojistka proti dvojici, která by si místo předávala donekonečna.
  for (let kolo = 0; kolo < 12; kolo++) {
    let hnulo = false
    for (let i = 0; i < serazene.length; i++) {
      const b = serazene[i]
      if (b.skryt) continue
      for (let j = 0; j < i; j++) {
        const a = serazene[j]
        if (a.skryt) continue
        if (prekryvaji(a, b) && Math.abs(a.ty - b.ty) < vyskaRadku) {
          b.ty = a.ty + vyskaRadku
          hnulo = true
        }
      }
      for (const p of prekazky) {
        if (prekryvaji(p, b) && Math.abs(p.y - b.ty) < vyskaRadku) {
          b.ty = b.ty <= p.y ? p.y - vyskaRadku : p.y + vyskaRadku
          hnulo = true
        }
      }
    }
    if (!hnulo) break
  }

  // Co se ani po dvanácti kolech neuklidilo, se radši vynechá. Popisek přes
  // popisek je horší než popisek žádný: čtenář by nevěděl, ke které značce
  // který text patří, a přestal by věřit i těm, které sedí.
  for (let i = 0; i < serazene.length; i++) {
    const b = serazene[i]
    if (b.skryt) continue
    const kolize =
      serazene.some(
        (a, j) => j !== i && !a.skryt && prekryvaji(a, b) && Math.abs(a.ty - b.ty) < vyskaRadku,
      ) || prekazky.some((p) => prekryvaji(p, b) && Math.abs(p.y - b.ty) < vyskaRadku)
    if (kolize) b.skryt = true
  }
  return serazene
}

/**
 * Vybere případ pro ukázku čtení mapy.
 *
 * Popisek u ukázky tvrdí, že oblast leží vpravo nahoře a jedna její část
 * utekla dolů. Musí to tedy být pravda: bere se jen oblast, která opravdu je
 * v pravém horním kvadrantu, a z ní ta nejhorší část. Když takový případ
 * v týmu není, ukázka se nekreslí. Radši žádná než nepravdivá.
 */
export function vyberUkazku<
  O extends { id: string; prumer: number; smodch: number },
  C extends { oblast: string; prumer: number; smodch: number; riziko: boolean },
>(oblasti: O[], casti: C[], nejmensiRozdil = 6): { oblast: O; cast: C } | null {
  const { xDel, yDel } = MAPA_ROZSAH
  const kandidati = oblasti
    .filter((o) => polohaX(o.id, o.prumer) >= xDel && o.smodch < yDel)
    .map((o) => ({
      oblast: o,
      cast: casti
        .filter((c) => c.oblast === o.id && c.riziko && o.prumer - c.prumer >= nejmensiRozdil)
        .sort((a, b) => a.prumer - b.prumer)[0],
    }))
    .filter((x): x is { oblast: O; cast: C } => x.cast !== undefined)
  // Nejnázornější je ta, která leží v pravém horním rohu nejhlouběji. Oblast
  // těsně na hranici by popisku „vpravo nahoře" odpovídala jen formálně a
  // čtenář by hledal, o čem je řeč.
  const hloubka = (o: O) => polohaX(o.id, o.prumer) - xDel + (yDel - o.smodch)
  return (
    kandidati.sort(
      (a, b) =>
        hloubka(b.oblast) - hloubka(a.oblast) ||
        b.oblast.prumer - b.cast.prumer - (a.oblast.prumer - a.cast.prumer),
    )[0] ?? null
  )
}

/**
 * Krok pětistupňové škály pro polohu vůči hranici silného pásma
 * (`polohaX`). Třetí krok začíná o 7,5 bodu pod hranicí, čtvrtý 1,5 bodu nad
 * ní; dřív totéž platilo pro hrubé číslo proti společné hranici 61,5.
 */
export function krokSkaly(poloha: number): 1 | 2 | 3 | 4 | 5 {
  const i = Math.min(4, Math.max(0, Math.floor((poloha + 16.5) / 9)))
  return (i + 1) as 1 | 2 | 3 | 4 | 5
}
