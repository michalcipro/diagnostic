// Typová kontrola Convex backendu bez nasazení.
//
// Proč to není součástí `npx tsc --noEmit`: složka convex je v tsconfig.json
// vyloučená, protože se opírá o soubory v convex/_generated, které vyrábí až
// `npx convex dev` nebo `npx convex deploy`. Bez nasazeného projektu tedy
// backend nikdo nezkontroluje a chyba se pozná až při nasazování, což je
// u serverového kódu ta nejdražší chvíle.
//
// Skript proto na dobu kontroly doplní tytéž tři soubory, jaké generuje
// Convex, spustí nad složkou tsc a po sobě uklidí. Když už opravdové
// _generated existuje, nesahá na něj a použije ho.
//
// Spouští se `node scripts/typy-convex.cjs`.

const fs = require("fs")
const os = require("os")
const path = require("path")
const { execFileSync, spawnSync } = require("child_process")

const KOREN = path.join(__dirname, "..")
const GEN = path.join(KOREN, "convex", "_generated")
const HLAVICKA =
  "// Dočasný soubor pro místní typovou kontrolu (scripts/typy-convex.cjs).\n" +
  "// Skutečný generuje `npx convex dev`. Tenhle po kontrole zmizí.\n"

/** Moduly backendu, ze kterých Convex skládá api a internal. */
function moduly() {
  return fs
    .readdirSync(path.join(KOREN, "convex"))
    .filter((f) => f.endsWith(".ts"))
    .map((f) => f.replace(/\.ts$/, ""))
    .filter((m) => m !== "schema")
    .sort()
}

function napisStuby() {
  const m = moduly()
  fs.mkdirSync(GEN, { recursive: true })

  fs.writeFileSync(
    path.join(GEN, "dataModel.d.ts"),
    `${HLAVICKA}import type {
  DataModelFromSchemaDefinition,
  DocumentByName,
  TableNamesInDataModel,
} from "convex/server"
import type { GenericId } from "convex/values"
import schema from "../schema"

export type DataModel = DataModelFromSchemaDefinition<typeof schema>
export type TableNames = TableNamesInDataModel<DataModel>
export type Doc<TableName extends TableNames> = DocumentByName<DataModel, TableName>
export type Id<TableName extends TableNames> = GenericId<TableName>
`,
  )

  fs.writeFileSync(
    path.join(GEN, "server.d.ts"),
    `${HLAVICKA}import type {
  ActionBuilder,
  GenericActionCtx,
  GenericMutationCtx,
  GenericQueryCtx,
  MutationBuilder,
  QueryBuilder,
} from "convex/server"
import type { DataModel } from "./dataModel"

export declare const query: QueryBuilder<DataModel, "public">
export declare const internalQuery: QueryBuilder<DataModel, "internal">
export declare const mutation: MutationBuilder<DataModel, "public">
export declare const internalMutation: MutationBuilder<DataModel, "internal">
export declare const action: ActionBuilder<DataModel, "public">
export declare const internalAction: ActionBuilder<DataModel, "internal">

export type QueryCtx = GenericQueryCtx<DataModel>
export type MutationCtx = GenericMutationCtx<DataModel>
export type ActionCtx = GenericActionCtx<DataModel>
`,
  )

  fs.writeFileSync(
    path.join(GEN, "api.d.ts"),
    `${HLAVICKA}import type { ApiFromModules, FilterApi, FunctionReference } from "convex/server"
${m.map((x) => `import type * as ${x} from "../${x}"`).join("\n")}

declare const fullApi: ApiFromModules<{
${m.map((x) => `  ${x}: typeof ${x}`).join("\n")}
}>

export declare const api: FilterApi<typeof fullApi, FunctionReference<any, "public">>
export declare const internal: FilterApi<typeof fullApi, FunctionReference<any, "internal">>
`,
  )
}

const jizExistuje = fs.existsSync(GEN)
if (!jizExistuje) napisStuby()

const konfig = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "convex-typy-")), "tsconfig.json")
fs.writeFileSync(
  konfig,
  JSON.stringify(
    {
      extends: path.join(KOREN, "tsconfig.json"),
      compilerOptions: {
        noEmit: true,
        // Cesty musí být absolutní: konfigurace leží v dočasné složce,
        // takže relativní odkazy by mířily mimo projekt.
        typeRoots: [path.join(KOREN, "node_modules", "@types")],
        types: ["node"],
        baseUrl: KOREN,
        paths: { "@/*": ["./*"] },
      },
      include: [path.join(KOREN, "convex", "**", "*.ts")],
      exclude: [path.join(KOREN, "node_modules")],
    },
    null,
    2,
  ),
)

const tsc = path.join(KOREN, "node_modules", ".bin", "tsc")
if (!fs.existsSync(tsc)) {
  console.error("Chybí TypeScript v node_modules. Spusť `npm install`.")
  process.exit(1)
}

const beh = spawnSync(tsc, ["-p", konfig], { cwd: KOREN, encoding: "utf8" })
const vystup = `${beh.stdout ?? ""}${beh.stderr ?? ""}`.trim()

if (!jizExistuje) fs.rmSync(GEN, { recursive: true, force: true })
fs.rmSync(path.dirname(konfig), { recursive: true, force: true })

if (beh.status === 0) {
  console.log(`OK    Convex backend je typově v pořádku (${moduly().length} modulů).`)
  process.exit(0)
}
console.log(vystup || "tsc skončil chybou bez výpisu.")
console.log("\nCHYBA Convex backend má typové chyby.")
process.exit(1)
