export const dockerTestDatabaseUrl =
  "postgresql://taskmaster:taskmaster@127.0.0.1:55432/taskmaster_test"

/** @param {Record<string, string | undefined>} environment */
export function getTestDatabaseUrl(environment = process.env) {
  const value = environment.TEST_DATABASE_URL

  if (!value) {
    throw new Error("TEST_DATABASE_URL is required for integration tests.")
  }

  if (value === environment.DATABASE_URL) {
    throw new Error("TEST_DATABASE_URL must not match DATABASE_URL.")
  }

  const url = new URL(value)
  const isLocalHost =
    url.hostname === "127.0.0.1" || url.hostname === "localhost"

  if (
    url.protocol !== "postgresql:" ||
    !isLocalHost ||
    url.port !== "55432" ||
    url.pathname !== "/taskmaster_test"
  ) {
    throw new Error(
      "TEST_DATABASE_URL must point to the selected local Docker taskmaster_test database."
    )
  }

  return value
}
