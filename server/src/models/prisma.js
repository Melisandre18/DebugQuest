import { PrismaClient } from "../generated/prisma/index.js";

// Single PrismaClient instance for the whole server process.
// Re-importing this file always returns the same instance.
const prisma = new PrismaClient();

export default prisma;
