import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

import { PrismaClient } from "@/generated/prisma";
import { env } from "@/lib/env";

declare global {
  var prisma: PrismaClient | undefined;
  var prismaPool: Pool | undefined;
}

const pool =
  globalThis.prismaPool ??
  new Pool({
    connectionString: env.DATABASE_URL,
  });

const adapter = new PrismaPg(pool);

export const prisma =
  globalThis.prisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = prisma;
  globalThis.prismaPool = pool;
}
