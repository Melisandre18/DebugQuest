import type { IncomingMessage, ServerResponse } from "http";
import bcrypt from "bcryptjs";
import prisma from "../../lib/prisma.js";

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => (data += chunk));
    req.on("end", () => resolve(data));
    req.on("error", reject);
  });
}

function json(res: ServerResponse, status: number, body: unknown) {
  res.setHeader("Content-Type", "application/json");
  res.writeHead(status);
  res.end(JSON.stringify(body));
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  if (req.method !== "POST") return json(res, 405, { error: "Method not allowed" });

  let body: Record<string, unknown>;
  try {
    body = JSON.parse(await readBody(req));
  } catch {
    return json(res, 400, { error: "Invalid JSON" });
  }

  const { username, password } = body as { username?: string; password?: string };
  if (!username || !password) return json(res, 400, { error: "Username and password are required" });

  try {
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user || !user.passwordHash) return json(res, 401, { error: "Invalid username or password" });

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return json(res, 401, { error: "Invalid username or password" });

    return json(res, 200, { id: user.id, username: user.username });
  } catch (err) {
    console.error("[login]", err);
    return json(res, 500, { error: "Login failed" });
  }
}
