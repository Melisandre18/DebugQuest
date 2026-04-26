// POST /api/next-puzzle
// Body: { difficulty, lang?, solved?: string[], recent?: AttemptSummary[] }
// Runs adaptive selection on the server and returns the next SerializedPuzzle.
import type { IncomingMessage, ServerResponse } from "http";
import { pickNextPuzzle } from "./_data/puzzles-source.js";
import type { NextPuzzleRequest, UiLanguage } from "./_lib/types.js";

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => (data += chunk));
    req.on("end", () => resolve(data));
    req.on("error", reject);
  });
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Content-Type", "application/json");

  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method !== "POST") {
    res.writeHead(405);
    res.end(JSON.stringify({ error: "method not allowed" }));
    return;
  }

  let body: NextPuzzleRequest;
  try {
    const raw = await readBody(req);
    body = JSON.parse(raw);
  } catch {
    res.writeHead(400);
    res.end(JSON.stringify({ error: "invalid JSON body" }));
    return;
  }

  const { difficulty, lang = "en", solved = [], recent = [] } = body;
  if (!["easy", "medium", "hard", "adaptive"].includes(difficulty ?? "")) {
    res.writeHead(400);
    res.end(JSON.stringify({ error: "difficulty must be easy | medium | hard | adaptive" }));
    return;
  }

  const puzzle = pickNextPuzzle({
    difficulty,
    lang: lang as UiLanguage,
    solved,
    recent,
  });

  res.writeHead(200);
  res.end(JSON.stringify(puzzle));
}
