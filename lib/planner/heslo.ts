import type { Lang } from "@/lib/diagnostic/types"

// Kontrola hesla v prohlížeči.
//
// Táž pravidla hlídá i server (convex/plannerAuth.ts) a ta kontrola je ta
// závazná: prohlížeči se u hesel věřit nedá. Tahle je tu kvůli hlášce.
// Serverové chyby chodí česky, což je u anglicky mluvícího klienta k ničemu,
// a hlavně je lepší říct, co je s heslem špatně, ještě než ho odešle.

const CASTA_HESLA = [
  "heslo",
  "password",
  "qwertz",
  "qwerty",
  "12345",
  "abcdef",
  "admin",
  "winning",
  "planner",
  "denik",
]

type Duvod = "kratke" | "obvykle" | "osobni" | "dlouhe"

const HLASKY: Record<Lang, Record<Duvod, string>> = {
  cs: {
    kratke: "Heslo musí mít alespoň 10 znaků.",
    obvykle: "Heslo obsahuje příliš obvyklé slovo. Zvol něco, co se nedá uhodnout ze slovníku.",
    osobni: "Heslo nesmí obsahovat tvoje jméno ani část e-mailu.",
    dlouhe: "Heslo je příliš dlouhé (nejvýš 200 znaků).",
  },
  en: {
    kratke: "The password must be at least 10 characters long.",
    obvykle: "The password contains a very common word. Choose something a dictionary will not guess.",
    osobni: "The password must not contain your name or part of your e-mail.",
    dlouhe: "The password is too long (200 characters at most).",
  },
  sk: {
    kratke: "Heslo musí mať aspoň 10 znakov.",
    obvykle: "Heslo obsahuje príliš obvyklé slovo. Zvoľ niečo, čo sa nedá uhádnuť zo slovníka.",
    osobni: "Heslo nesmie obsahovať tvoje meno ani časť e-mailu.",
    dlouhe: "Heslo je príliš dlhé (najviac 200 znakov).",
  },
}

/** Vrátí hlášku, pokud heslo neprojde, jinak nic. */
export function zkontrolujHeslo(
  heslo: string,
  lang: Lang,
  email?: string,
  jmeno?: string,
): string | undefined {
  const h = HLASKY[lang]
  if (heslo.length < 10) return h.kratke
  if (heslo.length > 200) return h.dlouhe
  const male = heslo.toLowerCase()
  if (CASTA_HESLA.some((x) => male.includes(x))) return h.obvykle
  const zakazane = [email?.split("@")[0], jmeno].filter(
    (x): x is string => !!x && x.length >= 3,
  )
  if (zakazane.some((x) => male.includes(x.toLowerCase()))) return h.osobni
  return undefined
}
