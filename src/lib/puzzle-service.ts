// Frontend API client for DebugQuest puzzles.
// Fetches puzzle data from /api/* (Vite dev plugin in dev, Vercel functions in prod).
// Converts SerializedFix.appliedProgram back into a callable FixOption.apply function.

import { useQuery, useMutation } from "@tanstack/react-query";
import type { Difficulty, FixOption, Language, Program, Puzzle } from "./puzzle-engine";

interface SerializedFix {
  id: string;
  correct: boolean;
  label: string;
  explanation: string;
  appliedProgram: Program;
}

interface SerializedPuzzle {
  id: string;
  difficulty: Exclude<Difficulty, "adaptive">;
  bugType: string;
  bugStmtId: string;
  concept: string;
  title: string;
  story: string;
  task: string;
  program: Program;
  expected: { output?: string[]; returned?: number | string };
  fixes: SerializedFix[];
  hints: string[];
}

interface NextPuzzleRequest {
  difficulty: Difficulty;
  lang?: string;
  solved?: string[];
  recent?: { puzzleId: string; correct: boolean; hintsUsed: number }[];
}

// Rebuild a runtime Puzzle from the serialized DTO
function hydratePuzzle(dto: SerializedPuzzle): Puzzle {
  return {
    id: dto.id,
    difficulty: dto.difficulty,
    bugType: dto.bugType as Puzzle["bugType"],
    bugStmtId: dto.bugStmtId,
    concept: dto.concept,
    title: dto.title,
    story: dto.story,
    task: dto.task,
    program: dto.program,
    expected: dto.expected,
    hints: dto.hints,
    fixes: dto.fixes.map((f): FixOption => ({
      id: f.id,
      correct: f.correct,
      label: f.label,
      explanation: f.explanation,
      apply: () => f.appliedProgram,
    })),
  };
}

async function fetchNextPuzzle(req: NextPuzzleRequest): Promise<Puzzle> {
  const resp = await fetch("/api/next-puzzle", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req),
  });
  if (!resp.ok) throw new Error(`API error ${resp.status}`);
  const dto: SerializedPuzzle = await resp.json();
  return hydratePuzzle(dto);
}

async function fetchPuzzleById(id: string, lang = "en"): Promise<Puzzle> {
  const resp = await fetch(`/api/puzzle?id=${encodeURIComponent(id)}&lang=${lang}`);
  if (!resp.ok) throw new Error(`API error ${resp.status}`);
  const dto: SerializedPuzzle = await resp.json();
  return hydratePuzzle(dto);
}

async function fetchPuzzlesByDifficulty(
  difficulty: Exclude<Difficulty, "adaptive">,
  lang = "en"
): Promise<Puzzle[]> {
  const resp = await fetch(`/api/puzzles?difficulty=${difficulty}&lang=${lang}`);
  if (!resp.ok) throw new Error(`API error ${resp.status}`);
  const dtos: SerializedPuzzle[] = await resp.json();
  return dtos.map(hydratePuzzle);
}

// ─── React Query hooks ────────────────────────────────────────────────────────

export function usePuzzle(id: string, lang: Language) {
  return useQuery({
    queryKey: ["puzzle", id, lang],
    queryFn: () => fetchPuzzleById(id, lang),
    staleTime: Infinity,
  });
}

export function usePuzzlesByDifficulty(
  difficulty: Exclude<Difficulty, "adaptive">,
  lang: Language
) {
  return useQuery({
    queryKey: ["puzzles", difficulty, lang],
    queryFn: () => fetchPuzzlesByDifficulty(difficulty, lang),
    staleTime: Infinity,
  });
}

export function useNextPuzzleMutation() {
  return useMutation({
    mutationFn: fetchNextPuzzle,
  });
}

// ─── Standalone imperative fetch (for initial load in Game) ──────────────────

export async function getNextPuzzle(req: NextPuzzleRequest): Promise<Puzzle> {
  return fetchNextPuzzle(req);
}
