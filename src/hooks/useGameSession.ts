import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  type Difficulty, type FixOption, type Language, type Program, type Puzzle, type RunResult,
  matchesExpected, run,
} from "@/lib/puzzle-engine";
import { getLesson } from "@/lib/lessons";
import { ACHIEVEMENTS, computeScore, computePerformance } from "@/lib/progress";
import { logAttempt as logAttemptToServer } from "@/lib/api";
import { getUserId } from "@/lib/user";
import { DIFFICULTY_META } from "@/components/DifficultyMeta";
import { useProgress } from "@/contexts/ProgressContext";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  getNextPuzzle, toRuntimePuzzle,
  type AnyPuzzle, type AstPickFixPuzzle,
} from "@/lib/puzzle-service";
import { toast } from "sonner";

export type View = "blocks" | "code";
export type Tab  = "learn" | "play" | "run";

export function maxHints(total: number, d: Difficulty): number {
  if (d === "easy") return total;
  if (d === "medium") return Math.min(total, 2);
  if (d === "hard") return Math.min(total, 1);
  return total;
}

export function useGameSession(d: Difficulty, initialProgLang: Language) {
  const navigate = useNavigate();
  const { t, language: uiLang } = useLanguage();
  const { progress, recordAttempt: saveAttempt } = useProgress();

  // ── session state ─────────────────────────────────────────────────────────
  const [anyPuzzle, setAnyPuzzle]         = useState<AnyPuzzle | null>(null);
  const [loading, setLoading]             = useState(true);
  const [loadError, setLoadError]         = useState<string | null>(null);
  const [tab, setTab]                     = useState<Tab>("learn");
  const [progLang, setProgLang]           = useState<Language>(initialProgLang);
  const progLangRef                       = useRef<Language>(initialProgLang);
  const [sessionSolved, setSessionSolved] = useState(0);
  // Incremented on language change to force-remount text/reorder components
  const [resetKey, setResetKey]           = useState(0);

  // ── ast pick-fix state ────────────────────────────────────────────────────
  const [view, setView]                 = useState<View>(initialProgLang !== "python" && d !== "easy" ? "code" : "blocks");
  const [program, setProgram]           = useState<Program>([]);
  const [hintsRevealed, setHintsRevealed] = useState(0);
  const [attempts, setAttempts]         = useState(0);
  const [solved, setSolved]             = useState(false);
  const [revealedBug, setRevealedBug]   = useState(false);
  const [feedback, setFeedback]         = useState<{ option: FixOption; correct: boolean; result: RunResult } | null>(null);
  const startedAt = useRef(performance.now());

  // ── execution state ───────────────────────────────────────────────────────
  const [stepIdx, setStepIdx]           = useState(0);
  const [autoRunning, setAutoRunning]   = useState(false);
  const autoTimer = useRef<number | null>(null);

  // ── derived ───────────────────────────────────────────────────────────────
  const astPuzzle: Puzzle | null = useMemo(() => {
    if (!anyPuzzle || anyPuzzle.format !== "ast" || anyPuzzle.interaction !== "pick-fix") return null;
    return toRuntimePuzzle(anyPuzzle as AstPickFixPuzzle);
  }, [anyPuzzle]);

  const runResult = useMemo(() => (program.length ? run(program) : null), [program]);

  const meta          = DIFFICULTY_META[d];
  const showCodeToggle = d !== "easy";
  const currentStep   = runResult?.steps[stepIdx];
  const lesson        = anyPuzzle ? getLesson(anyPuzzle.bugType as Parameters<typeof getLesson>[0]) : null;
  const hints         = anyPuzzle?.hints ?? [];
  const maxHintsCount = maxHints(hints.length, d);

  const isAstPickFix    = !!anyPuzzle && anyPuzzle.format === "ast"  && anyPuzzle.interaction === "pick-fix";
  const isAstReorder    = !!anyPuzzle && anyPuzzle.format === "ast"  && anyPuzzle.interaction === "reorder";
  const isTextPickFix   = !!anyPuzzle && anyPuzzle.format === "text" && anyPuzzle.interaction === "pick-fix";
  const isTextFillBlank = !!anyPuzzle && anyPuzzle.format === "text" && anyPuzzle.interaction === "fill-blank";

  // ── actions ───────────────────────────────────────────────────────────────
  const loadNewPuzzle = useCallback(async () => {
    setLoading(true); setLoadError(null);
    try {
      const next = await getNextPuzzle({
        difficulty: d, lang: uiLang, progLang: progLangRef.current,
        solved: progress.solved,
        recent: progress.attempts.slice(-5).map(a => ({
          puzzleId: a.puzzleId, correct: a.correct, hintsUsed: a.hintsUsed, attempts: a.attempts,
        })),
      });
      setAnyPuzzle(next);
      if (next.format === "ast" && next.interaction === "pick-fix") {
        setProgram(toRuntimePuzzle(next as AstPickFixPuzzle).program);
      }
      setHintsRevealed(0); setAttempts(0); setSolved(false); setRevealedBug(false);
      setFeedback(null); setStepIdx(0); setTab("learn");
      startedAt.current = performance.now();
    } catch {
      setLoadError(t.game.loadError);
    } finally {
      setLoading(false);
    }
  // progress is intentionally excluded: we only want to reload on difficulty/lang changes
  // progLang is accessed via ref so language changes don't trigger a puzzle reload
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [d, uiLang]);

  useEffect(() => { loadNewPuzzle(); }, [loadNewPuzzle]);
  useEffect(() => { setStepIdx(0); stopAuto(); }, [program]);
  useEffect(() => { window.scrollTo({ top: 0, behavior: "smooth" }); }, [d, initialProgLang]);

  function stopAuto() {
    if (autoTimer.current) { window.clearInterval(autoTimer.current); autoTimer.current = null; }
    setAutoRunning(false);
  }

  function step() {
    if (!runResult) return;
    setStepIdx(i => Math.min(i + 1, runResult.steps.length - 1));
  }

  function startAuto() {
    if (!runResult) return;
    if (autoRunning) { stopAuto(); return; }
    setAutoRunning(true);
    autoTimer.current = window.setInterval(() => {
      setStepIdx(i => {
        const next = i + 1;
        if (!runResult || next >= runResult.steps.length) {
          stopAuto();
          return runResult ? runResult.steps.length - 1 : 0;
        }
        return next;
      });
    }, 450);
  }

  function resetExecution() { setStepIdx(0); stopAuto(); }

  function handleSolve(puzzle: { id: string; difficulty: string; title?: string; bugType?: string }, att: number) {
    const elapsed = performance.now() - startedAt.current;
    setSolved(true);
    const diffForScore = (d === "adaptive" ? puzzle.difficulty : d) as Exclude<Difficulty, "adaptive">;
    const score = computeScore({ difficulty: diffForScore, timeMs: elapsed, hintsUsed: hintsRevealed, attempts: att });
    const { performance: perf } = computePerformance({ difficulty: diffForScore, timeMs: elapsed, hintsUsed: hintsRevealed, attempts: att });
    const { newAchievements } = saveAttempt(
      {
        puzzleId: puzzle.id, correct: true, timeMs: elapsed,
        hintsUsed: hintsRevealed, attempts: att, score,
        at: Date.now(), language: progLang, difficulty: puzzle.difficulty, puzzleTitle: puzzle.title,
      },
      puzzle,
    );
    toast.success(`+${score} ${t.messages.points}`, { description: t.messages.correct });
    setSessionSolved(s => s + 1);
    newAchievements.forEach(code => {
      const a = ACHIEVEMENTS[code];
      toast(`🏆 ${a.title}`, { description: a.desc });
    });
    // Persist to backend (fire-and-forget — game works offline if server is down)
    logAttemptToServer({
      userId:       getUserId(),
      challengeId:  puzzle.id,
      score,
      time:         elapsed / 1000,
      hintsUsed:    hintsRevealed,
      bugType:      puzzle.bugType ?? "unknown",
      correct:      true,
      difficulty:   puzzle.difficulty,
      language:     progLang,
      performance:  perf,
      retriesCount: att - 1,
    });
  }

  function tryFix(option: FixOption) {
    if (!astPuzzle) return;
    const next = option.apply(program);
    const result = run(next);
    const correct = option.correct && matchesExpected(result, astPuzzle.expected);
    const newAttempts = attempts + 1;
    setAttempts(newAttempts); setProgram(next); setFeedback({ option, correct, result }); setStepIdx(0);
    if (correct && !solved) {
      setSolved(true); setRevealedBug(true);
      handleSolve(astPuzzle, newAttempts);
    } else if (!correct) {
      toast.error(t.messages.incorrect);
    }
  }

  function revealHint() {
    if (!anyPuzzle || hintsRevealed >= maxHintsCount) return;
    setHintsRevealed(h => h + 1);
  }

  function handleProgLangChange(lang: Language) {
    setProgLang(lang);
    progLangRef.current = lang;
    navigate(`/play/${d}/${lang}`, { replace: true });

    // Switch to code view so the new language syntax is immediately visible
    setView("code");

    // Reset to fresh unsolved state so the player sees the same puzzle from scratch
    // in the new language — no API reload needed.
    setHintsRevealed(0);
    setAttempts(0);
    setSolved(false);
    setRevealedBug(false);
    setFeedback(null);
    setStepIdx(0);
    setTab("learn");
    stopAuto();
    startedAt.current = performance.now();
    // Force-remount text/reorder components (they hold their own solved state)
    setResetKey(k => k + 1);

    // For AST pick-fix: restore the original buggy program so it renders fresh in the new syntax
    if (anyPuzzle && anyPuzzle.format === "ast" && anyPuzzle.interaction === "pick-fix") {
      setProgram(toRuntimePuzzle(anyPuzzle as AstPickFixPuzzle).program);
    }
  }

  return {
    // loading
    loading, loadError,
    // puzzle
    anyPuzzle, astPuzzle, runResult, currentStep, lesson, hints, maxHintsCount,
    isAstPickFix, isAstReorder, isTextPickFix, isTextFillBlank,
    // session
    sessionSolved, progLang, tab, setTab, resetKey,
    // ast / execution
    view, setView, program, setProgram,
    hintsRevealed, attempts, solved, revealedBug, feedback, setFeedback,
    stepIdx, autoRunning,
    // ui meta
    meta, showCodeToggle,
    // actions
    loadNewPuzzle, tryFix, handleSolve, revealHint, handleProgLangChange,
    step, startAuto, resetExecution,
    // translations
    t,
  };
}
