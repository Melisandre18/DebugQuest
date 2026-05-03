import type { IncomingMessage, ServerResponse } from "http";
import prisma from "../lib/prisma.js";

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

  const {
    userId, challengeId, score, time, hintsUsed,
    bugType, correct, difficulty, language, performance, retriesCount,
  } = body;

  if (!userId || !challengeId || score == null || time == null) {
    return json(res, 400, { error: "Missing required fields: userId, challengeId, score, time" });
  }

  try {
    const attempt = await prisma.attempt.create({
      data: {
        user: {
          connectOrCreate: {
            where:  { id: userId as string },
            create: { id: userId as string, username: userId as string },
          },
        },
        challengeId:  challengeId  as string,
        score:        score        as number,
        time:         time         as number,
        hintsUsed:    (hintsUsed    as number)  ?? 0,
        bugType:      (bugType      as string)  ?? "unknown",
        correct:      (correct      as boolean) ?? true,
        difficulty:   (difficulty   as string)  ?? "easy",
        language:     (language     as string)  ?? null,
        performance:  (performance  as number)  ?? null,
        retriesCount: (retriesCount as number)  ?? 0,
      },
    });
    return json(res, 201, attempt);
  } catch (err) {
    console.error("[attempt]", err);
    return json(res, 500, { error: "Failed to log attempt" });
  }
}
