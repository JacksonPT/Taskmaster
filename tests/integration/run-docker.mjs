import { spawnSync } from "node:child_process"

import { dockerTestDatabaseUrl } from "./environment.mjs"

function run(command, args, environment = process.env) {
  return spawnSync(command, args, {
    cwd: process.cwd(),
    env: environment,
    stdio: "inherit",
  })
}

const composeArgs = ["compose", "-f", "compose.test.yaml"]
const up = run("docker", [...composeArgs, "up", "-d", "--wait"])

if (up.status !== 0) {
  process.exit(up.status ?? 1)
}

let testStatus = 1

try {
  const tests = run("pnpm", ["test:integration"], {
    ...process.env,
    TEST_DATABASE_URL: dockerTestDatabaseUrl,
  })
  testStatus = tests.status ?? 1
} finally {
  const down = run("docker", [...composeArgs, "down", "-v"])

  if (down.status !== 0 && testStatus === 0) {
    testStatus = down.status ?? 1
  }
}

process.exit(testStatus)
