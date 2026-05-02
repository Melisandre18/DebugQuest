import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import {
  type AttemptRecord,
  type Progress,
  loadProgress,
  recordAttempt,
  resetProgress as clearProgress,
} from "@/lib/progress";
import type { Language } from "@/lib/puzzle-engine";
import { useAuth } from "@/contexts/AuthContext";
import { fetchUserProgress, deleteUserProgress, type DbAttempt } from "@/lib/api";

// ─── Pure helpers (no localStorage side-effects) ─────────────────────────────

function buildProgressFromDb(rows: DbAttempt[]): Progress {
  const attempts: AttemptRecord[] = rows.map(a => ({
    puzzleId:    a.challengeId,
    correct:     a.correct,
    timeMs:      a.time * 1000,
    hintsUsed:   a.hintsUsed,
    attempts:    a.retriesCount + 1,
    score:       a.score,
    at:          new Date(a.createdAt).getTime(),
    language:    (a.language ?? undefined) as Language | undefined,
    difficulty:  a.difficulty,
    puzzleTitle: undefined,
  }));

  const correct = attempts.filter(a => a.correct);
  const totalScore = correct.reduce((s, a) => s + a.score, 0);
  const solved = [...new Set(correct.map(a => a.puzzleId))];

  const achievements: string[] = [];
  if (correct.length > 0)                                  achievements.push("first-fix");
  if (correct.some(a => a.hintsUsed === 0))                achievements.push("no-hints");
  if (correct.some(a => a.timeMs < 30_000))                achievements.push("speed-demon");
  if (rows.some(a => a.correct && a.difficulty === "hard")) achievements.push("hard-mode");

  let best = 0, cur = 0;
  for (const a of attempts) {
    if (a.correct && a.attempts === 1) { cur++; best = Math.max(best, cur); }
    else cur = 0;
  }
  if (best >= 3) achievements.push("streak-3");

  return { attempts, totalScore, solved, achievements };
}

// Mirrors the logic in lib/progress.ts but with no localStorage writes.
// Used when the user is logged in so the anonymous cache is never touched.
function applyAttempt(
  prev: Progress,
  rec: AttemptRecord,
  puzzle: { id: string; difficulty: string },
): { progress: Progress; newAchievements: string[] } {
  const p: Progress = {
    attempts:     [...prev.attempts, rec],
    totalScore:   prev.totalScore,
    solved:       [...prev.solved],
    achievements: [...prev.achievements],
  };
  const newly: string[] = [];

  if (rec.correct) {
    p.totalScore += rec.score;
    if (!p.solved.includes(rec.puzzleId)) p.solved.push(rec.puzzleId);

    const push = (code: string) => {
      if (!p.achievements.includes(code)) { p.achievements.push(code); newly.push(code); }
    };
    push("first-fix");
    if (rec.hintsUsed === 0)        push("no-hints");
    if (rec.timeMs < 30_000)        push("speed-demon");
    if (puzzle.difficulty === "hard") push("hard-mode");

    const last3 = p.attempts.slice(-3);
    if (last3.length === 3 && last3.every(a => a.correct && a.attempts === 1)) push("streak-3");
  }

  return { progress: p, newAchievements: newly };
}

// ─── Context ──────────────────────────────────────────────────────────────────

interface ProgressContextType {
  progress: Progress;
  loadingProgress: boolean;
  recordAttempt: (rec: AttemptRecord, puzzle: { id: string; difficulty: string }) => { newAchievements: string[] };
  resetProgress: () => void;
}

const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const userRef = useRef(user);
  useEffect(() => { userRef.current = user; }, [user]);

  const [progress, setProgress]             = useState<Progress>(() => loadProgress());
  const [loadingProgress, setLoadingProgress] = useState(false);

  useEffect(() => {
    if (user) {
      // Logged in → load from DB into memory only.
      // We deliberately do NOT call saveProgress() here so the anonymous
      // localStorage cache stays clean and is ready to restore on logout.
      setLoadingProgress(true);
      fetchUserProgress(user.id)
        .then(rows => setProgress(buildProgressFromDb(rows)))
        .catch(() => { /* server unreachable — keep current state */ })
        .finally(() => setLoadingProgress(false));
    } else {
      // Logged out → restore the untouched anonymous localStorage progress.
      setProgress(loadProgress());
    }
  }, [user?.id]);

  const recordAttemptCtx = useCallback(
    (rec: AttemptRecord, puzzle: { id: string; difficulty: string }) => {
      if (userRef.current) {
        // Logged in: pure in-memory update, localStorage cache is never touched.
        let result = { newAchievements: [] as string[] };
        setProgress(prev => {
          const out = applyAttempt(prev, rec, puzzle);
          result = { newAchievements: out.newAchievements };
          return out.progress;
        });
        return result;
      }
      // Anonymous: use the lib function which also saves to localStorage.
      const { progress: updated, newAchievements } = recordAttempt(rec, puzzle as any);
      setProgress(updated);
      return { newAchievements };
    },
    [],
  );

  const resetProgressCtx = useCallback(() => {
    clearProgress();
    setProgress({ totalScore: 0, attempts: [], solved: [], achievements: [] });
    const u = userRef.current;
    if (u) deleteUserProgress(u.id).catch(() => {});
  }, []);

  return (
    <ProgressContext.Provider value={{ progress, loadingProgress, recordAttempt: recordAttemptCtx, resetProgress: resetProgressCtx }}>
      {children}
    </ProgressContext.Provider>
  );
}

export function useProgress() {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error("useProgress must be used within a ProgressProvider");
  return ctx;
}
