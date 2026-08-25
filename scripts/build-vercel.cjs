#!/usr/bin/env node
// Sestavení pro Vercel.
//
// Když je nastavená proměnná CONVEX_DEPLOY_KEY, nasadí se před sestavením
// i backend v Convexu a Convex sám doplní NEXT_PUBLIC_CONVEX_URL.
// Když nastavená není, sestaví se jen web, přesně jako dosud. Chybějící klíč
// tedy nikdy neshodí nasazení, jen se backend nenasadí automaticky.

const { spawnSync } = require("node:child_process")

function spust(prikaz, argumenty) {
  const vysledek = spawnSync(prikaz, argumenty, { stdio: "inherit", shell: false })
  if (vysledek.error) {
    console.error(`Nepodařilo se spustit ${prikaz}: ${vysledek.error.message}`)
    process.exit(1)
  }
  if (vysledek.status !== 0) process.exit(vysledek.status ?? 1)
}

const klic = (process.env.CONVEX_DEPLOY_KEY ?? "").trim()

if (klic === "") {
  console.log("[build] CONVEX_DEPLOY_KEY není nastavený, sestavuji jen web.")
  spust("npm", ["run", "build"])
} else {
  console.log("[build] CONVEX_DEPLOY_KEY nalezen, nasazuji Convex a sestavuji web.")
  spust("npx", ["convex", "deploy", "--cmd", "npm run build"])
}
