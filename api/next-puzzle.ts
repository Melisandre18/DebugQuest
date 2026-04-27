// POST /api/next-puzzle
// Body: { difficulty, lang?, progLang?, solved?: string[], recent?: AttemptSummary[] }
import type { IncomingMessage, ServerResponse } from "http";
import { pickNext } from "./_data/index.js";
import type { NextPuzzleRequest, UiLanguage, ProgrammingLanguage } from "./_lib/types.js";

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
    res.writeHead(204); res.end(); return;
  }

  if (req.method !== "POST") {
    res.writeHead(405); res.end(JSON.stringify({ error: "method not allowed" })); return;
  }

  let body: NextPuzzleRequest;
  try {
    body = JSON.parse(await readBody(req));
  } catch {
    res.writeHead(400); res.end(JSON.stringify({ error: "invalid JSON body" })); return;
  }

  const { difficulty, lang = "en", progLang, solved = [], recent = [] } = body;
  if (!["easy","medium","hard","adaptive"].includes(difficulty ?? "")) {
    res.writeHead(400); res.end(JSON.stringify({ error: "invalid difficulty" })); return;
  }

  const puzzle = await pickNext({
    difficulty,
    lang: lang as UiLanguage,
    progLang: progLang as ProgrammingLanguage | undefined,
    solved,
    recent,
  });

  res.writeHead(200);
  res.end(JSON.stringify(puzzle));
}
