import { describe, expect, it } from "vitest"

describe("integration test runner", () => {
  it("uses the isolated Node test project", () => {
    expect(process.env.NODE_ENV).toBe("test")
  })
})
