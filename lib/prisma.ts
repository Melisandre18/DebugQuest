import { PrismaClient } from "@prisma/client";

const g = global as typeof global & { _prisma?: PrismaClient };
const prisma = g._prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== "production") g._prisma = prisma;

export default prisma;
