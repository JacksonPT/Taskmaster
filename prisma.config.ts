// Prisma CLI reads this config when running commands like prisma generate or migrate.
// dotenv/config loads DATABASE_URL from .env for local development.
import "dotenv/config"
import { defineConfig } from "prisma/config"

export default defineConfig({
  // Keep the schema path explicit so Prisma knows where the data model lives.
  schema: "prisma/schema.prisma",
  migrations: {
    // Migrations are versioned database changes generated from schema.prisma.
    path: "prisma/migrations",
  },
  datasource: {
    // DATABASE_URL should point to Neon PostgreSQL. Keep the real value in .env only.
    url: process.env["DATABASE_URL"],
  },
})
