import type { IncomingMessage, ServerResponse } from "http";
import bcrypt from "bcryptjs";
import prisma from "../../lib/prisma.js";

const USERNAME_RE = /^[a-zA-Z0-9_]{3,20}$/;

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

  const { username, password } = body;

  if (!username || typeof username !== "string") return json(res, 400, { error: "Username is required" });
  if (username.length < 3)  return json(res, 400, { error: "Username must be at least 3 characters" });
  if (username.length > 20) return json(res, 400, { error: "Username must be at most 20 characters" });
  if (!USERNAME_RE.test(username)) return json(res, 400, { error: "Only letters, numbers, and underscores allowed" });
  if (!password || typeof password !== "string" || password.length < 6) {
    return json(res, 400, { error: "Password must be at least 6 characters" });
  }

  try {
    const existing = await prisma.user.findUnique({ where: { username } });
    if (existing) return json(res, 409, { error: "Username already taken" });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({ data: { username, passwordHash } });
    return json(res, 201, { id: user.id, username: user.username });
  } catch (err) {
    console.error("[register]", err);
    return json(res, 500, { error: "Registration failed" });
  }
}
