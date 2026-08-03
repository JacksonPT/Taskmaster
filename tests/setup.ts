import "@testing-library/jest-dom/vitest"

import { cleanup } from "@testing-library/react"
import { afterEach, vi } from "vitest"

// Unit tests can import server-owned modules only after replacing this marker;
// production builds still enforce the real `server-only` package boundary.
vi.mock("server-only", () => ({}))

afterEach(() => {
  if (typeof document !== "undefined") {
    cleanup()
  }
})
