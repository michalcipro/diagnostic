import { cronJobs } from "convex/server"
import { internal } from "./_generated/api"

// Plánované úlohy.
//
// Zatím jediná: noční úklid dat za retenční lhůtou. Podrobnosti a lhůty jsou
// v convex/uklid.ts, důvody v docs/gdpr-podklady.md.

const crons = cronJobs()

crons.daily(
  "uklid dat za retencni lhutou",
  { hourUTC: 2, minuteUTC: 30 },
  internal.uklid.probehni,
  {},
)

export default crons
