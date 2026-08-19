import { vyzadujMastera } from "./sessions"
import type { Coach } from "./sessions"

/**
 * Pilotní režim plánovače.
 *
 * Dokud je zapnutý, smí s deníky pracovat výhradně master účet. Ostatní kouči
 * o plánovači nevědí: záložka se jim v přehledu nezobrazí a serverové funkce
 * je odmítnou, takže se k nim nedostanou ani přímým voláním API.
 *
 * Je to jediné místo, kde se to vypíná, a je jediné schválně. Kdyby si každý
 * soubor držel vlastní konstantu, dřív nebo později se přepne jedna a na
 * druhou se zapomene, a plánovač se pootevře jen napůl. Až bude schválený,
 * přepne se tahle konstanta na `false` a deníky začnou fungovat pro všechny
 * naše kouče se stejnou viditelností, jakou mají u diagnostiky: kouč vidí své
 * klienty, master celou naši větev, do větví externích koučů nevidí nikdo.
 */
export const PILOTNI_REZIM = true

/** Zkontroluje, jestli kouč smí v pilotním režimu s deníky pracovat. */
export function overPristupKDenikum(kouc: Coach): void {
  if (PILOTNI_REZIM) vyzadujMastera(kouc)
}
