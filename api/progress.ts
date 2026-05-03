import type { IncomingMessage, ServerResponse } from "http";
import { URL } from "url";
import prisma from "../lib/prisma.js";

function json(res: ServerResponse, status: number, body: unknown) {
  res.setHeader("Content-Type", "application/json");
  res.writeHead(status);
  res.end(JSON.stringify(body));
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  const url = new URL(req.url ?? "/", `http://${req.headers.host}`);
  const userId = url.searchParams.get("userId");

  if (!userId) return json(res, 400, { error: "userId required" });

  if (req.method === "GET") {
    try {
      const attempts = await prisma.attempt.findMany({
        where: { userId },
        orderBy: { createdAt: "asc" },
      });
      return json(res, 200, attempts);
    } catch (err) {
      console.error("[progress GET]", err);
      return json(res, 500, { error: "Failed to fetch progress" });
    }
  }

  if (req.method === "DELETE") {
    try {
      await prisma.attempt.deleteMany({ where: { userId } });
      return json(res, 200, { success: true });
    } catch (err) {
      console.error("[progress DELETE]", err);
      return json(res, 500, { error: "Failed to reset progress" });
    }
  }

  return json(res, 405, { error: "Method not allowed" });
}
