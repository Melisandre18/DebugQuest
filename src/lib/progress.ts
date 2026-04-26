// Lightweight progress + adaptive logic stored in localStorage.
import type { Difficulty, Puzzle } from "./puzzle-engine";

const KEY = "debugquest.progress.v1";

export interface AttemptRecord {
  puzzleId: string;
  correct: boolean;
  timeMs: number;
  hintsUsed: number;
  attempts: number;
  score: number;
  at: number;
}

export interface Progress {
  totalScore: number;
  attempts: AttemptRecord[];
  solved: string[];           // puzzle ids solved at least once
  achievements: string[];     // codes
}

const empty = (): Progress => ({ totalScore: 0, attempts: [], solved: [], achievements: [] });

export function loadProgress(): Progress {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return empty();
    return { ...empty(), ...JSON.parse(raw) };
  } catch { return empty(); }
}

export function saveProgress(p: Progress) {
  localStorage.setItem(KEY, JSON.stringify(p));
}

export function resetProgress() {
  localStorage.removeItem(KEY);
}

export const ACHIEVEMENTS: Record<string, { title: string; desc: string }> = {
  "first-fix":     { title: "First Fix",        desc: "Solve your first puzzle." },
  "no-hints":      { title: "Pure Insight",     desc: "Solve a puzzle without using any hints." },
  "speed-demon":   { title: "Speed Demon",      desc: "Solve a puzzle in under 30 seconds." },
  "hard-mode":     { title: "Bug Hunter",       desc: "Solve a Hard puzzle." },
  "streak-3":      { title: "On a Roll",        desc: "Solve 3 puzzles in a row first try." },
};

export function computeScore(opts: { difficulty: Exclude<Difficulty,"adaptive">; timeMs: number; hintsUsed: number; attempts: number; }): number {
  const base = { easy: 100, medium: 200, hard: 350 }[opts.difficulty];
  const timeBonus = Math.max(0, 60_000 - opts.timeMs) / 600; // up to +100
  const hintPenalty = opts.hintsUsed * 25;
  const attemptPenalty = (opts.attempts - 1) * 30;
  return Math.max(10, Math.round(base + timeBonus - hintPenalty - attemptPenalty));
}

export function recordAttempt(rec: AttemptRecord, puzzle: Puzzle): { progress: Progress; newAchievements: string[] } {
  const p = loadProgress();
  p.attempts.push(rec);
  const newly: string[] = [];
  if (rec.correct) {
    p.totalScore += rec.score;
    if (!p.solved.includes(rec.puzzleId)) p.solved.push(rec.puzzleId);
    if (!p.achievements.includes("first-fix")) { p.achievements.push("first-fix"); newly.push("first-fix"); }
    if (rec.hintsUsed === 0 && !p.achievements.includes("no-hints")) { p.achievements.push("no-hints"); newly.push("no-hints"); }
    if (rec.timeMs < 30_000 && !p.achievements.includes("speed-demon")) { p.achievements.push("speed-demon"); newly.push("speed-demon"); }
    if (puzzle.difficulty === "hard" && !p.achievements.includes("hard-mode")) { p.achievements.push("hard-mode"); newly.push("hard-mode"); }
    const lastThree = p.attempts.slice(-3);
    if (lastThree.length === 3 && lastThree.every(a => a.correct && a.attempts === 1) && !p.achievements.includes("streak-3")) {
      p.achievements.push("streak-3"); newly.push("streak-3");
    }
  }
  saveProgress(p);
  return { progress: p, newAchievements: newly };
}

// Puzzle selection logic has moved to the backend (api/_data/puzzles-source.ts).
// Use getNextPuzzle() from puzzle-service.ts instead.
