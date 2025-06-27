import { PrismaClient } from "@prisma/client";
import { dbQueryDurationSeconds } from "../metrics";

const globalForPrisma = global as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({ log: ["query", "info", "warn", "error"] });

prisma.$use(async (params, next) => {
  const start = process.hrtime();
  const result = await next(params);
  const [sec, nano] = process.hrtime(start);
  dbQueryDurationSeconds.observe(
    { model: params.model || "raw", action: params.action },
    sec + nano / 1e9,
  );
  return result;
});

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
