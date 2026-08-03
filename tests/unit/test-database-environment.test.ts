import { describe, expect, it } from "vitest"

import {
  dockerTestDatabaseUrl,
  getTestDatabaseUrl,
} from "@/tests/integration/environment.mjs"

describe("integration database safety", () => {
  it("accepts only the selected local Docker database", () => {
    expect(
      getTestDatabaseUrl({ TEST_DATABASE_URL: dockerTestDatabaseUrl })
    ).toBe(dockerTestDatabaseUrl)
  })

  it("rejects missing configuration and application database reuse", () => {
    expect(() => getTestDatabaseUrl({})).toThrow("required")
    expect(() =>
      getTestDatabaseUrl({
        TEST_DATABASE_URL: dockerTestDatabaseUrl,
        DATABASE_URL: dockerTestDatabaseUrl,
      })
    ).toThrow("must not match")
  })

  it.each([
    "postgresql://taskmaster:taskmaster@example.com:55432/taskmaster_test",
    "postgresql://taskmaster:taskmaster@127.0.0.1:5432/taskmaster_test",
    "postgresql://taskmaster:taskmaster@127.0.0.1:55432/production",
  ])("rejects unsafe target %s", (value) => {
    expect(() => getTestDatabaseUrl({ TEST_DATABASE_URL: value })).toThrow(
      "selected local Docker"
    )
  })
})
