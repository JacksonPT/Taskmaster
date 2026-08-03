// @vitest-environment jsdom

import { render } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { TaskmasterMark } from "@/components/taskmaster-mark"

describe("component test runner", () => {
  it("renders React components with Testing Library", () => {
    const { container } = render(<TaskmasterMark className="size-10" />)

    expect(container.querySelector("svg")).toHaveAttribute(
      "aria-hidden",
      "true"
    )
  })
})
