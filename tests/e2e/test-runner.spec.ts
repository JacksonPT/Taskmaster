import AxeBuilder from "@axe-core/playwright"
import { expect, test } from "@playwright/test"

test("renders the public landing page", async ({ page }) => {
  await page.goto("/")

  await expect(
    page.getByRole("heading", { level: 1, name: /task master/i })
  ).toBeVisible()
})

test("protects the task route before private rendering", async ({
  request,
}) => {
  const response = await request.get("/tasks", { maxRedirects: 0 })

  expect(response.status()).toBe(307)
  expect(response.headers()["x-clerk-auth-status"]).toBe("signed-out")
  expect(response.headers().location).toMatch(/accounts\.dev\/sign-in/)
  expect(response.headers().location).toContain("redirect_url=")
})

test("public layout reflows without horizontal overflow", async ({ page }) => {
  for (const viewport of [
    { width: 390, height: 844 },
    { width: 900, height: 900 },
    { width: 1440, height: 1000 },
  ]) {
    await page.setViewportSize(viewport)
    await page.goto("/")

    const hasHorizontalOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth
    )
    expect(hasHorizontalOverflow).toBe(false)
  }
})

test("keyboard and reduced-motion settings remain effective", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" })
  await page.goto("/")

  expect(
    await page.evaluate(
      () => window.matchMedia("(prefers-reduced-motion: reduce)").matches
    )
  ).toBe(true)

  await page.keyboard.press("Tab")
  await expect(page.locator(":focus")).toBeVisible()

  const themeClass = await page.locator("html").getAttribute("class")
  await page.keyboard.press("d")
  expect(await page.locator("html").getAttribute("class")).toBe(themeClass)
})

test("@a11y landing page has no serious automated violations", async ({
  page,
}) => {
  await page.goto("/")

  const results = await new AxeBuilder({ page }).analyze()
  const seriousViolations = results.violations.filter(
    ({ impact }) => impact === "serious" || impact === "critical"
  )

  expect(seriousViolations).toEqual([])
})

test("does not contact Gemini from credential-free browser paths", async ({
  page,
}) => {
  const providerRequests: string[] = []
  page.on("request", (request) => {
    if (/generativelanguage|googleapis/.test(request.url())) {
      providerRequests.push(request.url())
    }
  })

  await page.goto("/")

  expect(providerRequests).toEqual([])
})
