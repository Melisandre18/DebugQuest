// GET /api/puzzles?difficulty=easy|medium|hard&lang=en|ka
// Returns an array of serialized puzzles for the given difficulty.
import type { IncomingMessage, ServerResponse } from "http";
import { getPuzzlesByDifficulty } from "./_data/puzzles-source.js";
import type { UiLanguage } from "./_lib/types.js";

export default function handler(req: IncomingMessage, res: ServerResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Content-Type", "application/json");

  const url = new URL(req.url ?? "/", "http://localhost");
  const difficulty = url.searchParams.get("difficulty") as
    | "easy" | "medium" | "hard"
    | null;
  const lang = (url.searchParams.get("lang") ?? "en") as UiLanguage;

  if (!difficulty || !["easy", "medium", "hard"].includes(difficulty)) {
    res.writeHead(400);
    res.end(JSON.stringify({ error: "difficulty must be easy | medium | hard" }));
    return;
  }

  const puzzles = getPuzzlesByDifficulty(difficulty, lang);
  res.writeHead(200);
  res.end(JSON.stringify(puzzles));
}
