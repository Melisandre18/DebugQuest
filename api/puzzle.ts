// GET /api/puzzle?id=<puzzleId>&lang=en|ka&progLang=python|javascript|cpp|java
// Returns a single serialized puzzle by ID.
import type { IncomingMessage, ServerResponse } from "http";
import { getPuzzleById } from "./_data/index.js";
import type { UiLanguage, ProgrammingLanguage } from "./_lib/types.js";

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Content-Type", "application/json");

  const url = new URL(req.url ?? "/", "http://localhost");
  const id = url.searchParams.get("id");
  const lang = (url.searchParams.get("lang") ?? "en") as UiLanguage;
  const progLangParam = url.searchParams.get("progLang");
  const progLang = progLangParam as ProgrammingLanguage | undefined;

  if (!id) {
    res.writeHead(400);
    res.end(JSON.stringify({ error: "id is required" }));
    return;
  }

  const puzzle = await getPuzzleById(id, lang, progLang ?? undefined);
  if (!puzzle) {
    res.writeHead(404);
    res.end(JSON.stringify({ error: "puzzle not found" }));
    return;
  }

  res.writeHead(200);
  res.end(JSON.stringify(puzzle));
}
