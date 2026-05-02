import React, { createContext, useCallback, useContext, useState } from "react";
import {
  type AttemptRecord,
  type Progress,
  loadProgress,
  recordAttempt,
  resetProgress as clearProgress,
} from "@/lib/progress";

interface ProgressContextType {
  progress: Progress;
  recordAttempt: (rec: AttemptRecord, puzzle: { id: string; difficulty: string }) => { newAchievements: string[] };
  resetProgress: () => void;
}

const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const [progress, setProgress] = useState<Progress>(() => loadProgress());

  const recordAttemptCtx = useCallback(
    (rec: AttemptRecord, puzzle: { id: string; difficulty: string }) => {
      const { progress: updated, newAchievements } = recordAttempt(rec, puzzle as any);
      setProgress(updated);
      return { newAchievements };
    },
    []
  );

  const resetProgressCtx = useCallback(() => {
    clearProgress();
    setProgress({ totalScore: 0, attempts: [], solved: [], achievements: [] });
  }, []);

  return (
    <ProgressContext.Provider
      value={{ progress, recordAttempt: recordAttemptCtx, resetProgress: resetProgressCtx }}
    >
      {children}
    </ProgressContext.Provider>
  );
}

export function useProgress() {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error("useProgress must be used within a ProgressProvider");
  return ctx;
}
