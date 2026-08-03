# Taskmaster Test Layers

Module 15 assigns each risk to the narrowest layer that can prove it:

- `tests/unit`: deterministic UTC, metrics, ordering, runtime schemas, semantic AI validation, and authenticated service/action boundaries. These tests use controlled dependencies and no external service.
- `tests/component`: React behavior through roles, labels, keyboard input, focus, pending state, and announced feedback in jsdom.
- `tests/integration`: PostgreSQL constraints, ownership, transactions, quota leases, concurrency, and rollback. Database tests will require an explicit disposable `TEST_DATABASE_URL` and must never fall back to application data.
- `tests/e2e`: production-like Next.js routes, signed-out protection, supported Clerk test flows, responsive reflow, keyboard behavior, reduced motion, and axe checks in a real browser.

Ordinary tests never read a live Gemini key or spend provider quota. Provider success and failure are supplied through controlled test boundaries. Generated browser reports, traces, screenshots, coverage, and authentication state are ignored because they can contain local environment details.

Use `pnpm test` while iterating. The isolated integration and browser commands are intentionally separate because they have explicit resource prerequisites and run more slowly. `pnpm test:all` is the aggregate local workflow after those resources are configured.

## Local PostgreSQL integration tests

The selected integration resource is the disposable PostgreSQL service in `compose.test.yaml`. Run the complete database suite with `pnpm test:integration:docker`; the runner starts the healthy container, sets the dedicated local test URL, applies existing migrations, executes serial integration tests, and removes the container data even when a test fails.

For database debugging, run `pnpm test:db:up`, set `TEST_DATABASE_URL` to `postgresql://taskmaster:taskmaster@127.0.0.1:55432/taskmaster_test`, and then run `pnpm test:integration`. Stop and erase the resource with `pnpm test:db:down`.

The integration guard intentionally rejects a missing variable, `DATABASE_URL` reuse, remote hosts, other ports, and non-test database names. Never weaken that guard to make a production or shared database convenient for tests.

## Credential-free browser baseline

The selected Playwright strategy does not store or automate a Clerk user account. Browser tests verify the landing page, signed-out `/tasks` redirect, keyboard focus, reduced-motion preference, axe results, and narrow/intermediate/wide overflow against a production-like server. They also assert these credential-free paths make no Gemini request.

Authenticated CRUD and AI browser flows are intentionally omitted until a dedicated Clerk test instance and isolated test users exist. Authentication-before-I/O and cross-user behavior are instead proven at Server Action boundaries, while database ownership and transaction behavior use disposable PostgreSQL integration tests. Manual workspace review covers real authenticated focus, reflow, contrast, reduced motion, and announcements. This separation avoids committing session state or using personal credentials while preserving risk-based coverage.
