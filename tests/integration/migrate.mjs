import { spawnSync } from "node:child_process"

import { getTestDatabaseUrl } from "./environment.mjs"

const testDatabaseUrl = getTestDatabaseUrl()
const result = spawnSync("pnpm", ["exec", "prisma", "migrate", "deploy"], {
  cwd: process.cwd(),
  env: {
    ...process.env,
    DATABASE_URL: testDatabaseUrl,
  },
  stdio: "inherit",
})

if (result.status !== 0) {
  process.exit(result.status ?? 1)
}
