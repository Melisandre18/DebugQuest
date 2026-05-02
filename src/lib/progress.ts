// Lightweight progress + adaptive logic stored in localStorage.
import type { Difficulty, Language, Puzzle } from "./puzzle-engine";

const KEY = "debugquest.progress.v1";

export interface AttemptRecord {
  puzzleId: string;
  correct: boolean;
  timeMs: number;
  hintsUsed: number;
  attempts: number;
  score: number;
  at: number;
  language?: Language;
  difficulty?: string;
  puzzleTitle?: string;
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

// ─── Formal Scoring Model ────────────────────────────────────────────────────
//
//   score = base × performance
//   performance = 1 − time_deduction − hint_deduction − retry_deduction
//
// All deductions are fractional so every weight is comparable across difficulties.
// `performance` (0–1) is also the signal consumed by the adaptive puzzle selector.

export const SCORING_CONFIG = {
  // Base points for a correct solve — all penalties deduct from this
  base: { easy: 100, medium: 200, hard: 350 } as const,

  time: {
    // Seconds at which penalty starts (solving within par = no time cost)
    par:  { easy: 60,  medium: 90,  hard: 120 } as const,
    // Seconds at which the full time weight is applied (linear ramp par → cap)
    cap:  { easy: 150, medium: 210, hard: 300 } as const,
    // Maximum fraction of base that can be lost to slow solving
    weight: 0.40,
  },

  hints: {
    // Fraction of base lost per hint used
    penalty: 0.15,
    // Hints beyond this have no additional cost (difficulty already limits hints shown)
    maxPenalized: 3,
  },

  retries: {
    // Fraction of base lost per wrong attempt (first attempt is always free)
    penalty: 0.10,
    // Retries beyond this have no additional cost
    maxPenalized: 5,
  },

  // Minimum performance ratio — guarantees at least floor × base points for any correct solve
  floor: 0.10,
} as const;

export interface PerformanceBreakdown {
  /** Overall performance ratio in [floor, 1]. Adaptive system primary signal. */
  performance: number;
  /** Fraction lost to slow solving (0–time.weight) */
  timePenalty: number;
  /** Fraction lost to hints (0–hints.maxPenalized × hints.penalty) */
  hintPenalty: number;
  /** Fraction lost to retries (0–retries.maxPenalized × retries.penalty) */
  retryPenalty: number;
}

export function computePerformance(opts: {
  difficulty: Exclude<Difficulty, "adaptive">;
  timeMs: number;
  hintsUsed: number;
  attempts: number;
}): PerformanceBreakdown {
  const cfg = SCORING_CONFIG;
  const { difficulty, timeMs, hintsUsed, attempts } = opts;

  const timeSec  = timeMs / 1000;
  const par      = cfg.time.par[difficulty];
  const cap      = cfg.time.cap[difficulty];
  const overtime = Math.max(0, timeSec - par);
  const timePenalty  = Math.min(overtime / (cap - par), 1) * cfg.time.weight;

  const hintPenalty  = Math.min(hintsUsed, cfg.hints.maxPenalized) * cfg.hints.penalty;
  const retryPenalty = Math.min(Math.max(0, attempts - 1), cfg.retries.maxPenalized) * cfg.retries.penalty;

  const performance = Math.max(cfg.floor, 1 - timePenalty - hintPenalty - retryPenalty);
  return { performance, timePenalty, hintPenalty, retryPenalty };
}

export function computeScore(opts: {
  difficulty: Exclude<Difficulty, "adaptive">;
  timeMs: number;
  hintsUsed: number;
  attempts: number;
}): number {
  const base = SCORING_CONFIG.base[opts.difficulty];
  const { performance } = computePerformance(opts);
  return Math.round(base * performance);
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
