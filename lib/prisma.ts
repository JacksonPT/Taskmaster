import { PrismaPg } from "@prisma/adapter-pg"

import { PrismaClient } from "./generated/prisma/client"

// Prisma Client manages database queries for us.
// In development, Next.js can reload files often, so we store one client on
// globalThis to avoid creating too many PostgreSQL connections.
const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient
}

// Prisma 7 uses a driver adapter. The pg adapter knows how to talk to
// PostgreSQL using the Neon DATABASE_URL from .env.
function createPrismaClient() {
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
  })

  return new PrismaClient({ adapter })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

// Only cache the client during development. Production/serverless deployments
// should create clients according to their runtime lifecycle.
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma
}
