import { describe, expect, it } from "vitest"

import { getUtcDateKey } from "@/lib/daily-plan"

describe("unit test runner", () => {
  it("resolves project aliases and runs deterministic TypeScript", () => {
    expect(getUtcDateKey(new Date("2026-08-02T23:59:59.000Z"))).toBe(
      "2026-08-02"
    )
  })
})
