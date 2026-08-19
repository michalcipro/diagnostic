import { ConvexError } from "convex/values"

// Kryptograficky náhodné hodnoty pro tokeny v odkazech.
//
// Stojí to ve vlastním modulu, protože tokeny vystavuje víc částí aplikace:
// pozvánky k diagnostice i pozvánky do deníku. Kdyby si každá psala vlastní
// generátor, dřív nebo později se v jednom z nich objeví Math.random(), který
// tady být nesmí, a nikdo si toho nevšimne, protože výsledek vypadá stejně.

/**
 * Kryptograficky náhodné bajty z Web Crypto.
 *
 * Bere se, co runtime nabízí: primárně getRandomValues, jinak randomUUID
 * (verze 4 nese 122 bitů z kryptografického zdroje). Když není ani jedno,
 * funkce záměrně spadne. Tiché sáhnutí po Math.random() by vypadalo jako
 * fungující kód a přitom by vrátilo předvídatelné tajemství, což je horší
 * než viditelná chyba při vystavování pozvánky.
 */
export function kryptoBajty(kolik: number): Uint8Array {
  const c: Crypto | undefined = globalThis.crypto
  if (typeof c?.getRandomValues === "function") {
    return c.getRandomValues(new Uint8Array(kolik))
  }
  if (typeof c?.randomUUID === "function") {
    const hex = Array.from({ length: Math.ceil(kolik / 16) }, () =>
      c.randomUUID().replace(/-/g, ""),
    ).join("")
    return Uint8Array.from({ length: kolik }, (_, i) => parseInt(hex.slice(i * 2, i * 2 + 2), 16))
  }
  throw new ConvexError(
    "Server nemá k dispozici Web Crypto, takže nejde bezpečně vygenerovat odkaz. Ozvi se prosím správci aplikace.",
  )
}

/**
 * Token do odkazu. Bez podobných znaků (0/O, 1/l), ať se dá případně přečíst.
 *
 * Musí pocházet z kryptografického zdroje: token je jediné, co chrání přístup
 * k dotazníku i k založení deníku. Math.random() se tu použít nesmí – jednak
 * to není kryptografický generátor, jednak ho Convex uvnitř transakce
 * nahrazuje deterministickým, aby šly funkce opakovat, což je pro tvorbu
 * tajemství přesně obrácený požadavek.
 *
 * Dvacet čtyři znaků po pěti bitech dává 120 bitů entropie. Abeceda má 32
 * znaků, takže 256 hodnot bajtu se na ni dělí beze zbytku a modulo nezavádí
 * zkreslení ve prospěch části znaků.
 */
export function makeToken(): string {
  const alphabet = "abcdefghijkmnpqrstuvwxyz23456789"
  return Array.from(kryptoBajty(24), (b) => alphabet[b % alphabet.length]).join("")
}
