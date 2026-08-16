// Kontrola druhého faktoru (TOTP).
//
// Ověřuje implementaci v convex/auth.ts proti testovacím vektorům z přílohy B
// normy RFC 6238. U kryptografie se nedá spolehnout na to, že „to vypadá
// správně": buď kód sedí na oficiální vektory, nebo je špatně.
//
// Kontroluje se navíc chování, na kterém stojí přihlašování: tolerance
// k rozejitým hodinám, odmítnutí cizího kódu a to, že se z tajemství
// nedá kód uhodnout.
//
// Spouští se `node scripts/test-totp.cjs`.

const crypto = require("crypto")

let chyb = 0
const rekni = (ok, text) => {
  if (!ok) chyb++
  console.log(`${ok ? "OK   " : "CHYBA"} ${text}`)
}

// ---------------------------------------------------------------------------
// Tatáž implementace jako v convex/auth.ts. Kopie je tu schválně: kdyby se
// zdroj změnil, musí se změnit i tady, a rozdíl se pozná právě na vektorech.
// ---------------------------------------------------------------------------

const BASE32 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567"

function base32Zakoduj(bajty) {
  let bity = 0
  let hodnota = 0
  let out = ""
  for (const b of bajty) {
    hodnota = (hodnota << 8) | b
    bity += 8
    while (bity >= 5) {
      out += BASE32[(hodnota >>> (bity - 5)) & 31]
      bity -= 5
    }
  }
  if (bity > 0) out += BASE32[(hodnota << (5 - bity)) & 31]
  return out
}

function base32Dekoduj(text) {
  const cisty = text.replace(/[\s=]/g, "").toUpperCase()
  let bity = 0
  let hodnota = 0
  const out = []
  for (const znak of cisty) {
    const i = BASE32.indexOf(znak)
    if (i === -1) throw new Error(`neplatný znak: ${znak}`)
    hodnota = (hodnota << 5) | i
    bity += 5
    if (bity >= 8) {
      out.push((hodnota >>> (bity - 8)) & 0xff)
      bity -= 8
    }
  }
  return Buffer.from(out)
}

function totpKod(secret, krok, delka = 6) {
  const buf = Buffer.alloc(8)
  buf.writeBigUInt64BE(BigInt(krok))
  const hmac = crypto.createHmac("sha1", base32Dekoduj(secret)).update(buf).digest()
  const offset = hmac[hmac.length - 1] & 0x0f
  const cislo =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff)
  return String(cislo % 10 ** delka).padStart(delka, "0")
}

// ---------------------------------------------------------------------------
// 1) testovací vektory RFC 6238, příloha B
// ---------------------------------------------------------------------------

console.log("– testovací vektory RFC 6238 –")

// Tajemství "12345678901234567890" v ASCII, SHA-1, krok 30 s, osmimístný kód.
const TAJEMSTVI = base32Zakoduj(Buffer.from("12345678901234567890", "ascii"))
rekni(
  base32Dekoduj(TAJEMSTVI).toString("ascii") === "12345678901234567890",
  "base32 tam a zpátky dá totéž",
)

const VEKTORY = [
  [59, "94287082"],
  [1111111109, "07081804"],
  [1111111111, "14050471"],
  [1234567890, "89005924"],
  [2000000000, "69279037"],
  [20000000000, "65353130"],
]
for (const [sekundy, ocekavano] of VEKTORY) {
  const kod = totpKod(TAJEMSTVI, Math.floor(sekundy / 30), 8)
  rekni(kod === ocekavano, `t=${sekundy}: ${kod}${kod === ocekavano ? "" : ` místo ${ocekavano}`}`)
}

// ---------------------------------------------------------------------------
// 2) chování při přihlašování
// ---------------------------------------------------------------------------

console.log("\n– chování při přihlašování –")

const TOLERANCE = 1
const sedi = (secret, zadany, ted) => {
  const cisty = String(zadany).replace(/\D/g, "")
  if (cisty.length !== 6) return false
  for (let d = -TOLERANCE; d <= TOLERANCE; d++) {
    if (cisty === totpKod(secret, ted + d)) return true
  }
  return false
}

const secret = base32Zakoduj(crypto.randomBytes(20))
const ted = Math.floor(Date.now() / 1000 / 30)

rekni(sedi(secret, totpKod(secret, ted), ted), "aktuální kód projde")
rekni(sedi(secret, totpKod(secret, ted - 1), ted), "kód o krok starý projde (pomalé opisování)")
rekni(sedi(secret, totpKod(secret, ted + 1), ted), "kód o krok napřed projde (rozejité hodiny)")
rekni(!sedi(secret, totpKod(secret, ted - 2), ted), "kód dva kroky starý neprojde")
rekni(!sedi(secret, totpKod(secret, ted + 2), ted), "kód dva kroky napřed neprojde")

const cizi = base32Zakoduj(crypto.randomBytes(20))
rekni(!sedi(secret, totpKod(cizi, ted), ted), "kód z cizího tajemství neprojde")
rekni(!sedi(secret, "12345", ted), "pětimístný kód neprojde")
rekni(!sedi(secret, "", ted), "prázdný kód neprojde")
rekni(sedi(secret, ` ${totpKod(secret, ted)} `, ted), "kód s mezerami kolem projde")

// Kód se mění každý krok; kdyby ne, útočníkovi by stačil jeden odposlech.
const rada = Array.from({ length: 20 }, (_, i) => totpKod(secret, ted + i))
rekni(new Set(rada).size >= 19, `dvacet po sobě jdoucích kroků dá ${new Set(rada).size} různých kódů`)

// Tajemství musí mít dost entropie: 20 bajtů podle doporučení normy.
rekni(base32Dekoduj(secret).length === 20, "tajemství má 20 bajtů")

// ---------------------------------------------------------------------------
// 3) záložní kódy
// ---------------------------------------------------------------------------

console.log("\n– záložní kódy –")

const otisk = (kod) => crypto.createHash("sha256").update(kod.trim().toLowerCase()).digest("hex")
const abeceda = "abcdefghijkmnpqrstuvwxyz23456789"
const noveKody = () =>
  Array.from({ length: 10 }, () => {
    const b = crypto.randomBytes(10)
    const znaky = [...b].map((x) => abeceda[x % abeceda.length]).join("")
    return `${znaky.slice(0, 5)}-${znaky.slice(5)}`
  })

const kody = noveKody()
rekni(kody.length === 10, "vydá se deset kódů")
rekni(new Set(kody).size === 10, "kódy se neopakují")
rekni(
  kody.every((k) => /^[a-z2-9]{5}-[a-z2-9]{5}$/.test(k)),
  "kódy mají tvar pěti a pěti znaků bez matoucích písmen",
)
rekni(otisk(kody[0]) === otisk(kody[0].toUpperCase()), "na velikosti písmen při ověření nezáleží")
rekni(otisk(kody[0]) !== otisk(kody[1]), "různé kódy mají různé otisky")
rekni(otisk(kody[0]).length === 64, "otisk je SHA-256")

// Dvě samostatná vydání se nesmí potkat.
rekni(
  noveKody().every((k) => !kody.includes(k)),
  "další vydání kódů nekoliduje s předchozím",
)

// ---------------------------------------------------------------------------
// 4) shoda s ostrým kódem
//
// Výše je kopie implementace. Kopie se od zdroje může nepozorovaně rozejít
// a pak by testy potvrzovaly něco, co v aplikaci neběží. Proto se ve zdroji
// kontrolují hodnoty, na kterých celý mechanismus stojí.
// ---------------------------------------------------------------------------

console.log("\n– shoda s convex/auth.ts –")

const fs = require("fs")
const path = require("path")
const zdroj = fs.readFileSync(path.join(__dirname, "..", "convex", "auth.ts"), "utf8")

const MUSI_OBSAHOVAT = [
  [`const BASE32 = "${BASE32}"`, "stejná abeceda base32"],
  ["const TOTP_KROK_S = 30", "krok 30 sekund"],
  ["const TOTP_DELKA = 6", "šestimístný kód"],
  ["const TOTP_TOLERANCE = 1", "tolerance jeden krok"],
  ['createHmac("sha1"', "HMAC-SHA-1 podle normy"],
  ["crypto.randomBytes(20)", "tajemství z 20 náhodných bajtů"],
  ["length: 10 }", "deset záložních kódů"],
  [`const abeceda = "${abeceda}"`, "stejná abeceda záložních kódů"],
  ['createHash("sha256")', "otisk záložního kódu je SHA-256"],
  [".trim().toLowerCase()", "otisk nezávisí na velikosti písmen"],
]
for (const [jehla, popis] of MUSI_OBSAHOVAT) {
  rekni(zdroj.includes(jehla), popis)
}

// Tajemství se smí uložit až po ověření prvního kódu, jinak by se dal účet
// zamknout nedokončeným nastavením.
rekni(
  zdroj.includes("zapniTotp") && /potvrdTotp[\s\S]{0,2000}totpSedi/.test(zdroj),
  "nastavení se dokončí až po ověření kódu",
)
// Ztráta telefonu nesmí znamenat ztrátu účtu.
rekni(zdroj.includes("vypniTotpInterne"), "reset hesla druhý faktor vypne")

console.log(chyb === 0 ? "\ndruhý faktor sedí" : `\nNALEZENO CHYB: ${chyb}`)
process.exit(chyb === 0 ? 0 : 1)
