// GET /api/puzzle-counts?progLang=python|javascript|cpp|java
import type { IncomingMessage, ServerResponse } from "http";
import { getPuzzleCounts } from "./_data/index.js";
import type { ProgrammingLanguage } from "./_lib/types.js";

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Content-Type", "application/json");
  const url = new URL(req.url ?? "/", "http://localhost");
  const progLang = url.searchParams.get("progLang") as ProgrammingLanguage | null;
  const counts = await getPuzzleCounts(progLang ?? undefined);
  res.writeHead(200);
  res.end(JSON.stringify(counts));
}
