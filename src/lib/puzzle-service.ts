// Frontend API client for DebugQuest puzzles.
// Converts serialized wire types into runtime objects the Game component can use.
import { useQuery } from "@tanstack/react-query";
import type { Difficulty, FixOption, Language, Program, Puzzle } from "./puzzle-engine";

// ─── Wire types (as sent by the API) ──────────────────────────────────────

export interface SerializedFix {
  id: string; correct: boolean; label: string; explanation: string; appliedProgram: Program;
}

export interface AstPickFixPuzzle {
  format: "ast"; interaction: "pick-fix";
  id: string; difficulty: Exclude<Difficulty,"adaptive">; bugType: string;
  programmingLanguage: string; concept: string; title: string; story: string; task: string;
  bugStmtId: string; program: Program;
  expected: { output?: string[]; returned?: number | string };
  fixes: SerializedFix[]; hints: string[];
}

export interface AstReorderPuzzle {
  format: "ast"; interaction: "reorder";
  id: string; difficulty: Exclude<Difficulty,"adaptive">; bugType: string;
  programmingLanguage: string; concept: string; title: string; story: string; task: string;
  scrambledProgram: Program; correctOrder: string[]; explanation: string; hints: string[];
}

export interface TextFix { id: string; correct: boolean; label: string; explanation: string; }

export interface TextPickFixPuzzle {
  format: "text"; interaction: "pick-fix";
  id: string; difficulty: Exclude<Difficulty,"adaptive">; bugType: string;
  programmingLanguage: string; concept: string; title: string; story: string; task: string;
  code: string; bugLine?: number; fixes: TextFix[]; hints: string[];
  correctedCode?: string;
}

export interface BlankOption { id: string; value: string; correct: boolean; explanation: string; }

export interface TextFillBlankPuzzle {
  format: "text"; interaction: "fill-blank";
  id: string; difficulty: Exclude<Difficulty,"adaptive">; bugType: string;
  programmingLanguage: string; concept: string; title: string; story: string; task: string;
  codeBefore: string; codeAfter: string; options: BlankOption[]; hints: string[];
  correctedCode?: string;
}

export type AnyPuzzle = AstPickFixPuzzle | AstReorderPuzzle | TextPickFixPuzzle | TextFillBlankPuzzle;

// ─── Hydration (wire → runtime) ───────────────────────────────────────────

// For AST pick-fix, rebuild the apply() function from the pre-computed appliedProgram
function hydrateAstPickFix(dto: AstPickFixPuzzle): Puzzle {
  return {
    id: dto.id, difficulty: dto.difficulty, bugType: dto.bugType as Puzzle["bugType"],
    bugStmtId: dto.bugStmtId, concept: dto.concept, title: dto.title, story: dto.story,
    task: dto.task, program: dto.program, expected: dto.expected, hints: dto.hints,
    fixes: dto.fixes.map((f): FixOption => ({
      id: f.id, correct: f.correct, label: f.label, explanation: f.explanation,
      apply: () => f.appliedProgram,
    })),
  };
}

// ─── Fetch helpers ────────────────────────────────────────────────────────

interface NextPuzzleRequest {
  difficulty: Difficulty;
  lang?: string;
  progLang?: string;
  solved?: string[];
  recent?: { puzzleId: string; correct: boolean; hintsUsed: number }[];
}

async function fetchNextPuzzle(req: NextPuzzleRequest): Promise<AnyPuzzle> {
  const resp = await fetch("/api/next-puzzle", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req),
  });
  if (!resp.ok) throw new Error(`API error ${resp.status}`);
  return resp.json();
}

export async function fetchPuzzleById(id: string, lang = "en", progLang?: string): Promise<AnyPuzzle> {
  let url = `/api/puzzle?id=${encodeURIComponent(id)}&lang=${lang}`;
  if (progLang) url += `&progLang=${encodeURIComponent(progLang)}`;
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`API error ${resp.status}`);
  return resp.json();
}

// ─── Public API ───────────────────────────────────────────────────────────

export async function getNextPuzzle(req: NextPuzzleRequest): Promise<AnyPuzzle> {
  return fetchNextPuzzle(req);
}

/** Convert an AstPickFixPuzzle (wire) to the runtime Puzzle type used by the debugger. */
export function toRuntimePuzzle(p: AstPickFixPuzzle): Puzzle {
  return hydrateAstPickFix(p);
}

// ─── React Query hooks ────────────────────────────────────────────────────

export function usePuzzle(id: string, lang: Language, progLang?: Language) {
  return useQuery({
    queryKey: ["puzzle", id, lang, progLang ?? "any"],
    queryFn: () => fetchPuzzleById(id, lang, progLang),
    staleTime: Infinity,
  });
}

export function usePuzzleCounts(progLang?: Language) {
  return useQuery({
    queryKey: ["puzzle-counts", progLang ?? "any"],
    queryFn: async () => {
      const url = progLang ? `/api/puzzle-counts?progLang=${progLang}` : "/api/puzzle-counts";
      const resp = await fetch(url);
      if (!resp.ok) throw new Error("counts error");
      return resp.json() as Promise<Record<string, number>>;
    },
    staleTime: 5 * 60 * 1000,
  });
}
