import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play, StepForward, RotateCcw, Lightbulb, CheckCircle2, XCircle,
  Code2, Blocks, ChevronRight, Sparkles, Target, BookOpen, GraduationCap,
  MessageSquare, Globe, Loader2,
} from "lucide-react";
import TopNav, { notifyProgressChanged } from "@/components/TopNav";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CodeView from "@/components/CodeView";
import BlockView from "@/components/BlockView";
import ExecutionPanel from "@/components/ExecutionPanel";
import LessonPanel from "@/components/LessonPanel";
import FeedbackDialog from "@/components/FeedbackDialog";
import { DIFFICULTY_META, DifficultyBadge } from "@/components/DifficultyMeta";
import {
  Difficulty, FixOption, LANGUAGES, Language, Program, Puzzle, RunResult,
  matchesExpected, run,
} from "@/lib/puzzle-engine";
import { getLesson } from "@/lib/lessons";
import { ACHIEVEMENTS, computeScore, loadProgress, recordAttempt } from "@/lib/progress";
import { getNextPuzzle } from "@/lib/puzzle-service";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";

type View = "blocks" | "code";
type Tab  = "learn" | "debug";

const PROG_LANGUAGE_LABELS: Record<Language, string> = {
  python:     "Python",
  javascript: "JavaScript",
  cpp:        "C++",
  java:       "Java",
};

export default function Game() {
  const { difficulty, language: urlLanguage } = useParams<{ difficulty: Difficulty; language?: Language }>();
  const navigate = useNavigate();
  const { t, language: uiLang } = useLanguage();

  const d = (["easy","medium","hard","adaptive"].includes(difficulty ?? "")
    ? difficulty : "easy") as Difficulty;

  const initialProgLang = (["python","javascript","cpp","java"].includes(urlLanguage ?? "")
    ? urlLanguage : "python") as Language;

  // ── puzzle state ──────────────────────────────────────────────────────────
  const [puzzle, setPuzzle]       = useState<Puzzle | null>(null);
  const [loading, setLoading]     = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // ── interaction state ─────────────────────────────────────────────────────
  const [tab, setTab]               = useState<Tab>("learn");
  const [progLang, setProgLang]     = useState<Language>(initialProgLang);
  const [view, setView]             = useState<View>(
    initialProgLang !== "python" && d !== "easy" ? "code" : "blocks"
  );
  const [program, setProgram]       = useState<Program>([]);
  const [hintsRevealed, setHintsRevealed] = useState(0);
  const [attempts, setAttempts]     = useState(0);
  const [solved, setSolved]         = useState(false);
  const [revealedBug, setRevealedBug] = useState(false);
  const [feedback, setFeedback]     = useState<{
    option: FixOption; correct: boolean; result: RunResult;
  } | null>(null);
  const startedAt = useRef(performance.now());

  // ── execution state ───────────────────────────────────────────────────────
  const runResult = useMemo(() => (program.length ? run(program) : null), [program]);
  const [stepIdx, setStepIdx]       = useState(0);
  const [autoRunning, setAutoRunning] = useState(false);
  const autoTimer = useRef<number | null>(null);

  useEffect(() => { setStepIdx(0); stopAuto(); }, [program]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [d, initialProgLang]);

  // ── load first puzzle ─────────────────────────────────────────────────────
  useEffect(() => {
    loadNewPuzzle();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [d, uiLang]);

  const loadNewPuzzle = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const progress = loadProgress();
      const next = await getNextPuzzle({
        difficulty: d,
        lang: uiLang,
        solved: progress.solved,
        recent: progress.attempts.slice(-5).map(a => ({
          puzzleId: a.puzzleId,
          correct: a.correct,
          hintsUsed: a.hintsUsed,
        })),
      });
      resetForPuzzle(next);
    } catch (err) {
      setLoadError(t.game.loadError ?? "Failed to load puzzle. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [d, uiLang]);

  function resetForPuzzle(p: Puzzle) {
    setPuzzle(p);
    setProgram(p.program);
    setHintsRevealed(0);
    setAttempts(0);
    setSolved(false);
    setRevealedBug(false);
    setFeedback(null);
    setStepIdx(0);
    setTab("learn");
    startedAt.current = performance.now();
  }

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
        if (!runResult || next >= runResult.steps.length) { stopAuto(); return runResult ? runResult.steps.length - 1 : 0; }
        return next;
      });
    }, 450);
  }

  function resetExecution() { setStepIdx(0); stopAuto(); }

  function tryFix(option: FixOption) {
    if (!puzzle) return;
    const next = option.apply(program);
    const result = run(next);
    const correct = option.correct && matchesExpected(result, puzzle.expected);
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);
    setProgram(next);
    setFeedback({ option, correct, result });
    setStepIdx(0);

    if (correct && !solved) {
      setSolved(true);
      setRevealedBug(true);
      const elapsed = performance.now() - startedAt.current;
      const diffForScore = (d === "adaptive" ? puzzle.difficulty : d) as Exclude<Difficulty,"adaptive">;
      const score = computeScore({ difficulty: diffForScore, timeMs: elapsed, hintsUsed: hintsRevealed, attempts: newAttempts });
      const { newAchievements } = recordAttempt(
        { puzzleId: puzzle.id, correct: true, timeMs: elapsed, hintsUsed: hintsRevealed, attempts: newAttempts, score, at: Date.now() },
        puzzle
      );
      toast.success(`+${score} ${t.messages.points}`, { description: t.messages.correct });
      notifyProgressChanged();
      newAchievements.forEach(code => {
        const a = ACHIEVEMENTS[code];
        toast(`🏆 ${a.title}`, { description: a.desc });
      });
    } else if (!correct) {
      toast.error(t.messages.incorrect);
    }
  }

  function revealHint() {
    if (!puzzle) return;
    if (hintsRevealed >= maxHints(puzzle, d)) return;
    setHintsRevealed(h => h + 1);
  }

  function handleProgLangChange(lang: Language) {
    setProgLang(lang);
    navigate(`/play/${d}/${lang}`, { replace: true });
  }

  // ── derived ───────────────────────────────────────────────────────────────
  const meta = DIFFICULTY_META[d];
  const showCodeToggle = d !== "easy";
  const currentStep = runResult?.steps[stepIdx];
  const lesson = puzzle ? getLesson(puzzle.bugType) : null;

  // ── loading / error screens ───────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <TopNav
          center={<DifficultyBadge d={d} />}
          backTo={{ to: "/modes", label: t.nav.modes }}
        />
        <main className="container flex-1 flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-4 text-muted-foreground">
            <Loader2 className="w-10 h-10 animate-spin text-primary-glow" />
            <p className="text-sm">{t.game.loadingPuzzle}</p>
          </div>
        </main>
      </div>
    );
  }

  if (loadError || !puzzle || !runResult || !lesson) {
    return (
      <div className="min-h-screen flex flex-col">
        <TopNav center={<DifficultyBadge d={d} />} backTo={{ to: "/modes", label: t.nav.modes }} />
        <main className="container flex-1 flex items-center justify-center py-20">
          <div className="card-surface rounded-2xl p-8 max-w-md w-full text-center space-y-4">
            <XCircle className="w-10 h-10 text-destructive mx-auto" />
            <p className="text-muted-foreground text-sm">{loadError}</p>
            <Button variant="hero" onClick={loadNewPuzzle}>{t.game.retry}</Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <TopNav
        center={
          <>
            <span className="text-muted-foreground/40 hidden sm:inline">/</span>
            <DifficultyBadge d={d} />
          </>
        }
        backTo={{ to: "/modes", label: t.nav.modes }}
      />

      <main className="container py-6 md:py-8 flex-1">
        {/* Puzzle header */}
        <div className="card-surface rounded-2xl p-5 md:p-6 mb-5 relative overflow-hidden">
          <div className={cn("absolute -right-10 -top-10 w-40 h-40 rounded-full blur-3xl opacity-20", meta.color.replace("text-", "bg-"))} />
          <div className="relative flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                <Target className="w-3.5 h-3.5" /> {puzzle.concept}
              </div>
              <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight">{puzzle.title}</h1>
              <p className="text-muted-foreground mt-1.5">{puzzle.story}</p>
              <div className="mt-3 inline-flex items-start gap-2 text-sm bg-primary/5 border border-primary/30 rounded-lg px-3 py-2 text-foreground/90">
                <Sparkles className="w-4 h-4 text-primary-glow mt-0.5 shrink-0" />
                <span><b className="text-primary-glow">{t.game.goal}</b> {puzzle.task}</span>
              </div>
            </div>

            {/* Controls row: language selector + skip + feedback */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Programming language dropdown — always visible */}
              <div className="flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-muted-foreground shrink-0" />
                <Select value={progLang} onValueChange={(v) => handleProgLangChange(v as Language)}>
                  <SelectTrigger className="h-8 w-[140px] text-xs font-mono">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LANGUAGES.map((l) => (
                      <SelectItem key={l.id} value={l.id} className="font-mono text-xs">
                        {l.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button variant="outline" size="sm" onClick={loadNewPuzzle}>
                {t.buttons.skip} <ChevronRight className="w-4 h-4 ml-1" />
              </Button>

              <FeedbackDialog
                context="puzzle"
                puzzleId={puzzle.id}
                trigger={
                  <Button variant="ghost" size="sm">
                    <MessageSquare className="w-4 h-4 mr-1" /> {t.nav.feedback}
                  </Button>
                }
              />
            </div>
          </div>
        </div>

        {/* Learn / Debug tabs */}
        <Tabs value={tab} onValueChange={(v) => setTab(v as Tab)} className="space-y-5">
          <TabsList className="grid grid-cols-2 max-w-md">
            <TabsTrigger value="learn" className="gap-2">
              <GraduationCap className="w-4 h-4" /> {t.game.conceptTab}
            </TabsTrigger>
            <TabsTrigger value="debug" className="gap-2">
              <Code2 className="w-4 h-4" /> {t.game.debugTab}
            </TabsTrigger>
          </TabsList>

          {/* ── LEARN TAB ───────────────────────────────────────────────── */}
          <TabsContent value="learn" className="m-0">
            <div className="grid lg:grid-cols-[1fr_320px] gap-5">
              <LessonPanel lesson={lesson} language={progLang} onContinue={() => setTab("debug")} />
              <aside className="space-y-4">
                {/* Active language reminder */}
                <div className="card-surface rounded-xl p-4 flex items-center gap-3">
                  <Globe className="w-5 h-5 text-primary-glow shrink-0" />
                  <div>
                    <div className="text-xs uppercase tracking-wider text-muted-foreground mb-0.5">
                      {t.game.activeProgrammingLang}
                    </div>
                    <div className="font-mono font-semibold text-sm">{PROG_LANGUAGE_LABELS[progLang]}</div>
                  </div>
                  <Select value={progLang} onValueChange={(v) => handleProgLangChange(v as Language)}>
                    <SelectTrigger className="h-7 w-[110px] text-xs font-mono ml-auto">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {LANGUAGES.map((l) => (
                        <SelectItem key={l.id} value={l.id} className="font-mono text-xs">
                          {l.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="card-surface rounded-xl p-5">
                  <div className="font-display font-semibold inline-flex items-center gap-2 mb-2">
                    <BookOpen className="w-4 h-4 text-primary-glow" /> {t.game.whyLearnFirst}
                  </div>
                  <p className="text-sm text-muted-foreground">{t.game.whyLearnFirstDesc}</p>
                </div>

                <div className="card-surface rounded-xl p-5 text-sm space-y-2">
                  <div className="font-display font-semibold inline-flex items-center gap-2">
                    <Target className="w-4 h-4 text-accent" /> {t.gameUI.whenReady}
                  </div>
                  <p className="text-muted-foreground text-[13px]">{t.gameUI.debugInstructions}</p>
                  <Button variant="hero" size="sm" className="w-full mt-2" onClick={() => setTab("debug")}>
                    {t.gameUI.goToDebug} <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </aside>
            </div>
          </TabsContent>

          {/* ── DEBUG TAB ───────────────────────────────────────────────── */}
          <TabsContent value="debug" className="m-0">
            {/* Execution controls bar */}
            <div className="card-surface rounded-xl p-3 mb-5 flex items-center justify-between gap-3 flex-wrap">
              <div className="text-xs text-muted-foreground inline-flex items-center gap-2">
                <span className="font-mono">
                  {t.gameUI.stepPrefix} {Math.min(stepIdx + 1, runResult.steps.length)} / {runResult.steps.length}
                </span>
                {runResult.timedOut && <span className="text-destructive">· {t.gameUI.executionHalted}</span>}
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={resetExecution}>
                  <RotateCcw className="w-4 h-4 mr-1" /> {t.buttons.reset}
                </Button>
                <Button variant={autoRunning ? "secondary" : "hero"} size="sm" onClick={startAuto}>
                  <Play className="w-4 h-4 mr-1" /> {autoRunning ? t.buttons.pause : t.buttons.play}
                </Button>
                <Button variant="outline" size="sm" onClick={step} disabled={stepIdx >= runResult.steps.length - 1}>
                  <StepForward className="w-4 h-4 mr-1" /> {t.buttons.step}
                </Button>
              </div>
            </div>

            <div className="grid lg:grid-cols-[1fr_360px] gap-5">
              {/* Left: Program viewer */}
              <div className="space-y-4">
                <div className="card-surface rounded-xl p-1.5">
                  <div className="flex items-center justify-between gap-3 px-2.5 py-1.5 flex-wrap">
                    {/* Blocks / Code toggle */}
                    <div className="inline-flex rounded-lg bg-secondary/60 p-0.5">
                      <button
                        onClick={() => setView("blocks")}
                        className={cn(
                          "px-3 py-1.5 text-xs font-medium rounded-md inline-flex items-center gap-1.5 transition-colors",
                          view === "blocks" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        <Blocks className="w-3.5 h-3.5" /> {t.game.blocks}
                      </button>
                      {showCodeToggle && (
                        <button
                          onClick={() => setView("code")}
                          className={cn(
                            "px-3 py-1.5 text-xs font-medium rounded-md inline-flex items-center gap-1.5 transition-colors",
                            view === "code" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                          )}
                        >
                          <Code2 className="w-3.5 h-3.5" /> {t.game.code}
                        </button>
                      )}
                    </div>

                    {/* Language selector in debug tab (always visible, not just code view) */}
                    <Select value={progLang} onValueChange={(v) => handleProgLangChange(v as Language)}>
                      <SelectTrigger className="h-8 w-[150px] text-xs font-mono">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {LANGUAGES.map((l) => (
                          <SelectItem key={l.id} value={l.id} className="font-mono text-xs">
                            {l.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="p-2.5 pt-0">
                    {view === "blocks" ? (
                      <BlockView
                        program={program}
                        activeStmtId={currentStep?.stmtId}
                        bugStmtId={puzzle.bugStmtId}
                        showBug={revealedBug}
                      />
                    ) : (
                      <CodeView
                        program={program}
                        language={progLang}
                        activeStmtId={currentStep?.stmtId}
                        bugStmtId={puzzle.bugStmtId}
                        showBug={revealedBug}
                      />
                    )}
                  </div>
                </div>

                <ExecutionPanel
                  steps={runResult.steps}
                  index={stepIdx}
                  expectedOutput={puzzle.expected.output}
                />

                {/* Fix options */}
                <div className="card-surface rounded-xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-display font-semibold inline-flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-primary-glow" /> {t.game.pickFix}
                    </h3>
                    <span className="text-xs text-muted-foreground">{t.game.attempts} {attempts}</span>
                  </div>
                  <div className="grid gap-2.5">
                    {puzzle.fixes.map((opt) => {
                      const wasTried = feedback?.option.id === opt.id;
                      return (
                        <button
                          key={opt.id}
                          disabled={solved}
                          onClick={() => tryFix(opt)}
                          className={cn(
                            "text-left rounded-lg border p-3.5 transition-all",
                            "bg-card/40 border-border hover:border-primary/40 hover:bg-primary/5",
                            wasTried && opt.correct && "border-success/60 bg-success/10",
                            wasTried && !opt.correct && "border-destructive/60 bg-destructive/10",
                            solved && !wasTried && "opacity-50 cursor-not-allowed",
                          )}
                        >
                          <div className="flex items-start gap-3">
                            <div className={cn(
                              "w-6 h-6 rounded-md inline-flex items-center justify-center text-xs font-bold mt-0.5 shrink-0",
                              wasTried && opt.correct ? "bg-success text-success-foreground"
                              : wasTried && !opt.correct ? "bg-destructive text-destructive-foreground"
                              : "bg-secondary text-foreground/70"
                            )}>
                              {wasTried
                                ? (opt.correct ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />)
                                : "?"}
                            </div>
                            <div className="text-sm font-medium">{opt.label}</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <AnimatePresence>
                    {feedback && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className={cn(
                          "mt-4 rounded-lg border p-4",
                          feedback.correct ? "border-success/40 bg-success/5" : "border-destructive/40 bg-destructive/5"
                        )}
                      >
                        <div className="flex items-start gap-2 mb-2">
                          {feedback.correct
                            ? <CheckCircle2 className="w-5 h-5 text-success shrink-0" />
                            : <XCircle className="w-5 h-5 text-destructive shrink-0" />}
                          <div>
                            <div className="font-display font-semibold">
                              {feedback.correct ? t.game.correctFeedback : t.game.incorrectFeedback}
                            </div>
                            <p className="text-sm text-muted-foreground mt-0.5">{feedback.option.explanation}</p>
                          </div>
                        </div>
                        {feedback.correct && (
                          <div className="mt-3 rounded-md bg-card/60 p-3 text-sm space-y-1.5">
                            <div className="text-xs uppercase tracking-wider text-muted-foreground inline-flex items-center gap-1.5">
                              <BookOpen className="w-3.5 h-3.5" /> {t.game.whatYouLearned}
                            </div>
                            <div><b className="text-primary-glow">{t.game.theBug}</b> {prettyBug(puzzle.bugType, t)} {t.game.in} <b>{puzzle.concept}</b>.</div>
                            <div><b className="text-primary-glow">{t.game.whyItWorks}</b> {t.game.whyItWorksDesc}</div>
                            <div><b className="text-primary-glow">{t.game.underlyingConcept}</b> {conceptExplainer(puzzle.bugType, t)}</div>
                          </div>
                        )}
                        {feedback.correct && (
                          <Button variant="hero" size="sm" className="mt-3" onClick={loadNewPuzzle}>
                            {t.game.nextPuzzle} <ChevronRight className="w-4 h-4 ml-1" />
                          </Button>
                        )}
                        {!feedback.correct && (
                          <Button
                            variant="outline" size="sm" className="mt-3"
                            onClick={() => { if (puzzle) setProgram(puzzle.program); setFeedback(null); }}
                          >
                            <RotateCcw className="w-4 h-4 mr-1" /> {t.game.restoreAndRetry}
                          </Button>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Right: Hints + meta */}
              <aside className="space-y-4">
                <div className="card-surface rounded-xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-display font-semibold inline-flex items-center gap-2">
                      <Lightbulb className="w-4 h-4 text-accent" /> {t.game.hints}
                    </h3>
                    <span className="text-xs text-muted-foreground">
                      {hintsRevealed} / {maxHints(puzzle, d)}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {puzzle.hints.slice(0, maxHints(puzzle, d)).map((h, i) => {
                      const shown = i < hintsRevealed;
                      const isSpoiler = i === puzzle.hints.length - 1;
                      return (
                        <div
                          key={i}
                          className={cn(
                            "rounded-md border p-3 text-sm transition-all",
                            shown
                              ? (isSpoiler ? "border-destructive/40 bg-destructive/5" : "border-accent/40 bg-accent/5")
                              : "border-border bg-card/40 text-muted-foreground/60"
                          )}
                        >
                          <div className="text-[10px] uppercase tracking-wider mb-0.5 opacity-70">
                            {isSpoiler ? t.game.spoiler : `${t.game.hint} ${i + 1}`}
                          </div>
                          {shown ? h : t.game.locked}
                        </div>
                      );
                    })}
                  </div>
                  <Button
                    variant="outline" size="sm" className="mt-3 w-full"
                    onClick={revealHint}
                    disabled={hintsRevealed >= maxHints(puzzle, d)}
                  >
                    <Lightbulb className="w-4 h-4 mr-1" />
                    {hintsRevealed >= maxHints(puzzle, d) ? t.game.allHintsRevealed : t.buttons.hint}
                  </Button>
                  <p className="text-[11px] text-muted-foreground mt-2">{t.game.hintCostNote}</p>
                </div>

                <div className="card-surface rounded-xl p-5 text-sm space-y-2">
                  <div className="font-display font-semibold inline-flex items-center gap-2">
                    <Target className="w-4 h-4 text-primary-glow" /> {t.game.debugStrategy}
                  </div>
                  <ol className="space-y-1.5 text-muted-foreground text-[13px]">
                    <li><b className="text-foreground">{t.game.strategyTrace}</b></li>
                    <li><b className="text-foreground">{t.game.strategyIsolate}</b></li>
                    <li><b className="text-foreground">{t.game.strategyFix}</b></li>
                  </ol>
                </div>

                <div className="card-surface rounded-xl p-5 text-sm">
                  <div className="font-display font-semibold inline-flex items-center gap-2 mb-2">
                    <GraduationCap className="w-4 h-4 text-primary-glow" /> {t.game.needRefresher}
                  </div>
                  <Button variant="outline" size="sm" className="w-full" onClick={() => setTab("learn")}>
                    {t.game.reReadLesson}
                  </Button>
                </div>
              </aside>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

function maxHints(p: Puzzle, d: Difficulty): number {
  if (d === "easy")   return p.hints.length;
  if (d === "medium") return Math.min(p.hints.length, 2);
  if (d === "hard")   return Math.min(p.hints.length, 1);
  return p.hints.length;
}

function prettyBug(b: string, t: ReturnType<typeof useLanguage>["t"]): string {
  return t.game.bugTypes?.[b as keyof typeof t.game.bugTypes] ?? b;
}

function conceptExplainer(b: string, t: ReturnType<typeof useLanguage>["t"]): string {
  return t.game.conceptExplainers?.[b as keyof typeof t.game.conceptExplainers]
    ?? "Understanding the execution model is the foundation of debugging.";
}
