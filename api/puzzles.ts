// GET /api/puzzles?difficulty=easy|medium|hard&lang=en|ka&progLang=python|javascript|cpp|java
import type { IncomingMessage, ServerResponse } from "http";
import { getAllPuzzles } from "./_data/index.js";
import type { UiLanguage, ProgrammingLanguage } from "./_lib/types.js";

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Content-Type", "application/json");

  const url = new URL(req.url ?? "/", "http://localhost");
  const difficulty = url.searchParams.get("difficulty") as "easy" | "medium" | "hard" | null;
  const lang = (url.searchParams.get("lang") ?? "en") as UiLanguage;
  const progLang = url.searchParams.get("progLang") as ProgrammingLanguage | null;

  if (!difficulty || !["easy", "medium", "hard"].includes(difficulty)) {
    res.writeHead(400);
    res.end(JSON.stringify({ error: "difficulty must be easy | medium | hard" }));
    return;
  }

  const puzzles = await getAllPuzzles(difficulty, lang, progLang ?? undefined);
  res.writeHead(200);
  res.end(JSON.stringify(puzzles));
}
