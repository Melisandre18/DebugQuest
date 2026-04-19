import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play, StepForward, RotateCcw, Lightbulb, CheckCircle2, XCircle,
  Code2, Blocks, ChevronRight, Sparkles, Target, BookOpen, GraduationCap, MessageSquare,
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
  Difficulty, FixOption, LANGUAGES, Language, Program, Puzzle, RunResult, matchesExpected, run,
} from "@/lib/puzzle-engine";
import { getLesson } from "@/lib/lessons";
import { ACHIEVEMENTS, computeScore, loadProgress, pickAdaptive, pickNext, recordAttempt } from "@/lib/progress";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type View = "blocks" | "code";
type Tab = "learn" | "debug";

export default function Game() {
  const { difficulty } = useParams<{ difficulty: Difficulty }>();
  const navigate = useNavigate();
  const d = (["easy","medium","hard","adaptive"].includes(difficulty ?? "")
    ? difficulty
    : "easy") as Difficulty;

  const [puzzle, setPuzzle] = useState<Puzzle>(() => choosePuzzle(d));
  const [tab, setTab] = useState<Tab>("learn");
  const [language, setLanguage] = useState<Language>("python");
  const [view, setView] = useState<View>("blocks");
  const [program, setProgram] = useState<Program>(puzzle.program);
  const [hintsRevealed, setHintsRevealed] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [solved, setSolved] = useState(false);
  const [revealedBug, setRevealedBug] = useState(false);
  const [feedback, setFeedback] = useState<{ option: FixOption; correct: boolean; result: RunResult } | null>(null);
  const startedAt = useRef(performance.now());

  // Execution state (for the trace panel)
  const runResult = useMemo(() => run(program), [program]);
  const [stepIdx, setStepIdx] = useState(0);
  const [autoRunning, setAutoRunning] = useState(false);
  const autoTimer = useRef<number | null>(null);

  // Reset execution when program changes
  useEffect(() => { setStepIdx(0); stopAuto(); }, [program]);

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

  function chooseAndLoadNext() {
    resetForPuzzle(choosePuzzle(d));
  }

  function stopAuto() {
    if (autoTimer.current) { window.clearInterval(autoTimer.current); autoTimer.current = null; }
    setAutoRunning(false);
  }
  function step() {
    setStepIdx(i => Math.min(i + 1, runResult.steps.length - 1));
  }
  function startAuto() {
    if (autoRunning) { stopAuto(); return; }
    setAutoRunning(true);
    autoTimer.current = window.setInterval(() => {
      setStepIdx(i => {
        const next = i + 1;
        if (next >= runResult.steps.length) { stopAuto(); return runResult.steps.length - 1; }
        return next;
      });
    }, 450);
  }
  function resetExecution() { setStepIdx(0); stopAuto(); }

  function tryFix(option: FixOption) {
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
      const { newAchievements } = recordAttempt({
        puzzleId: puzzle.id, correct: true, timeMs: elapsed,
        hintsUsed: hintsRevealed, attempts: newAttempts, score, at: Date.now(),
      }, puzzle);
      toast.success(`+${score} points`, { description: "Puzzle solved." });
      notifyProgressChanged();
      newAchievements.forEach(code => {
        const a = ACHIEVEMENTS[code];
        toast(`🏆 ${a.title}`, { description: a.desc });
      });
    } else if (!correct) {
      toast.error("Not quite — read the explanation and try again.");
    }
  }

  function revealHint() {
    if (hintsRevealed >= maxHints(puzzle, d)) return;
    setHintsRevealed(h => h + 1);
  }

  const meta = DIFFICULTY_META[d];
  const showCodeToggle = d !== "easy";
  const currentStep = runResult.steps[stepIdx];
  const lesson = getLesson(puzzle.bugType);

  return (
    <div className="min-h-screen flex flex-col">
      <TopNav
        center={
          <>
            <span className="text-muted-foreground/40 hidden sm:inline">/</span>
            <DifficultyBadge d={d} />
          </>
        }
        backTo={{ to: "/modes", label: "Modes" }}
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
                <span><b className="text-primary-glow">Goal:</b> {puzzle.task}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Button variant="outline" size="sm" onClick={chooseAndLoadNext}>
                Skip <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
              <FeedbackDialog
                context="puzzle"
                puzzleId={puzzle.id}
                trigger={
                  <Button variant="ghost" size="sm">
                    <MessageSquare className="w-4 h-4 mr-1" /> Feedback
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
              <GraduationCap className="w-4 h-4" /> Learn the concept
            </TabsTrigger>
            <TabsTrigger value="debug" className="gap-2">
              <Code2 className="w-4 h-4" /> Debug the program
            </TabsTrigger>
          </TabsList>

          {/* LEARN TAB */}
          <TabsContent value="learn" className="m-0">
            <div className="grid lg:grid-cols-[1fr_320px] gap-5">
              <LessonPanel lesson={lesson} onContinue={() => setTab("debug")} />
              <aside className="space-y-4">
                <div className="card-surface rounded-xl p-5">
                  <div className="font-display font-semibold inline-flex items-center gap-2 mb-2">
                    <BookOpen className="w-4 h-4 text-primary-glow" /> Why learn first?
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Real debugging requires a mental model of <b className="text-foreground/90">how</b> the
                    code is supposed to behave. The Learn tab gives you that model in 60 seconds — then
                    you'll be hunting a real bug, not guessing.
                  </p>
                </div>
                <div className="card-surface rounded-xl p-5 text-sm space-y-2">
                  <div className="font-display font-semibold inline-flex items-center gap-2">
                    <Target className="w-4 h-4 text-accent" /> When you're ready
                  </div>
                  <p className="text-muted-foreground text-[13px]">
                    Switch to the <b className="text-foreground/90">Debug</b> tab, run the program
                    step-by-step, and pick the fix you believe is correct.
                  </p>
                  <Button variant="hero" size="sm" className="w-full mt-2" onClick={() => setTab("debug")}>
                    Go to Debug <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </aside>
            </div>
          </TabsContent>

          {/* DEBUG TAB */}
          <TabsContent value="debug" className="m-0">
            {/* Execution controls bar */}
            <div className="card-surface rounded-xl p-3 mb-5 flex items-center justify-between gap-3 flex-wrap">
              <div className="text-xs text-muted-foreground inline-flex items-center gap-2">
                <span className="font-mono">step {Math.min(stepIdx + 1, runResult.steps.length)} / {runResult.steps.length}</span>
                {runResult.timedOut && <span className="text-destructive">· halted (loop limit)</span>}
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={resetExecution}>
                  <RotateCcw className="w-4 h-4 mr-1" /> Reset
                </Button>
                <Button variant={autoRunning ? "secondary" : "hero"} size="sm" onClick={startAuto}>
                  <Play className="w-4 h-4 mr-1" /> {autoRunning ? "Pause" : "Run"}
                </Button>
                <Button variant="outline" size="sm" onClick={step} disabled={stepIdx >= runResult.steps.length - 1}>
                  <StepForward className="w-4 h-4 mr-1" /> Step
                </Button>
              </div>
            </div>

            <div className="grid lg:grid-cols-[1fr_360px] gap-5">
              {/* Left: Program viewer */}
              <div className="space-y-4">
                <div className="card-surface rounded-xl p-1.5">
                  <div className="flex items-center justify-between gap-3 px-2.5 py-1.5 flex-wrap">
                    <div className="inline-flex rounded-lg bg-secondary/60 p-0.5">
                      <button
                        onClick={() => setView("blocks")}
                        className={cn(
                          "px-3 py-1.5 text-xs font-medium rounded-md inline-flex items-center gap-1.5 transition-colors",
                          view === "blocks" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        <Blocks className="w-3.5 h-3.5" /> Blocks
                      </button>
                      {showCodeToggle && (
                        <button
                          onClick={() => setView("code")}
                          className={cn(
                            "px-3 py-1.5 text-xs font-medium rounded-md inline-flex items-center gap-1.5 transition-colors",
                            view === "code" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                          )}
                        >
                          <Code2 className="w-3.5 h-3.5" /> Code
                        </button>
                      )}
                    </div>
                    {view === "code" && (
                      <Select value={language} onValueChange={(v) => setLanguage(v as Language)}>
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
                    )}
                  </div>
                  <div className="p-2.5 pt-0">
                    {view === "blocks" ? (
                      <BlockView program={program} activeStmtId={currentStep?.stmtId} bugStmtId={puzzle.bugStmtId} showBug={revealedBug} />
                    ) : (
                      <CodeView program={program} language={language} activeStmtId={currentStep?.stmtId} bugStmtId={puzzle.bugStmtId} showBug={revealedBug} />
                    )}
                  </div>
                </div>

                <ExecutionPanel steps={runResult.steps} index={stepIdx} expectedOutput={puzzle.expected.output} />

                {/* Fix options */}
                <div className="card-surface rounded-xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-display font-semibold inline-flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-primary-glow" /> Pick a fix
                    </h3>
                    <span className="text-xs text-muted-foreground">Attempts: {attempts}</span>
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
                              {wasTried ? (opt.correct ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />) : "?"}
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
                          feedback.correct
                            ? "border-success/40 bg-success/5"
                            : "border-destructive/40 bg-destructive/5"
                        )}
                      >
                        <div className="flex items-start gap-2 mb-2">
                          {feedback.correct
                            ? <CheckCircle2 className="w-5 h-5 text-success shrink-0" />
                            : <XCircle className="w-5 h-5 text-destructive shrink-0" />}
                          <div>
                            <div className="font-display font-semibold">
                              {feedback.correct ? "Correct — bug squashed." : "Not yet."}
                            </div>
                            <p className="text-sm text-muted-foreground mt-0.5">{feedback.option.explanation}</p>
                          </div>
                        </div>
                        {feedback.correct && (
                          <div className="mt-3 rounded-md bg-card/60 p-3 text-sm space-y-1.5">
                            <div className="text-xs uppercase tracking-wider text-muted-foreground inline-flex items-center gap-1.5">
                              <BookOpen className="w-3.5 h-3.5" /> What you just learned
                            </div>
                            <div><b className="text-primary-glow">The bug:</b> a <b>{prettyBug(puzzle.bugType)}</b> in <b>{puzzle.concept}</b>.</div>
                            <div><b className="text-primary-glow">Why this fix works:</b> stepping through the new program shows the variables now reach the expected state and produce the required output.</div>
                            <div><b className="text-primary-glow">Underlying concept:</b> {conceptExplainer(puzzle.bugType)}</div>
                          </div>
                        )}
                        {feedback.correct && (
                          <Button variant="hero" size="sm" className="mt-3" onClick={chooseAndLoadNext}>
                            Next puzzle <ChevronRight className="w-4 h-4 ml-1" />
                          </Button>
                        )}
                        {!feedback.correct && (
                          <Button variant="outline" size="sm" className="mt-3" onClick={() => { setProgram(puzzle.program); setFeedback(null); }}>
                            <RotateCcw className="w-4 h-4 mr-1" /> Restore original & try again
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
                      <Lightbulb className="w-4 h-4 text-accent" /> Hints
                    </h3>
                    <span className="text-xs text-muted-foreground">{hintsRevealed} / {maxHints(puzzle, d)}</span>
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
                            {isSpoiler ? "Spoiler" : `Hint ${i + 1}`}
                          </div>
                          {shown ? h : "— locked —"}
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
                    {hintsRevealed >= maxHints(puzzle, d) ? "All hints revealed" : "Reveal next hint"}
                  </Button>
                  <p className="text-[11px] text-muted-foreground mt-2">Each hint lowers your score for this puzzle. Try to solve with as few as possible.</p>
                </div>

                <div className="card-surface rounded-xl p-5 text-sm space-y-2">
                  <div className="font-display font-semibold inline-flex items-center gap-2">
                    <Target className="w-4 h-4 text-primary-glow" /> Debugging strategy
                  </div>
                  <ol className="space-y-1.5 text-muted-foreground text-[13px]">
                    <li><b className="text-foreground">1. Trace —</b> Step through and watch how variables change.</li>
                    <li><b className="text-foreground">2. Isolate —</b> Find the first moment reality diverges from expectation.</li>
                    <li><b className="text-foreground">3. Fix —</b> Apply the smallest change that addresses the actual cause.</li>
                  </ol>
                </div>

                <div className="card-surface rounded-xl p-5 text-sm">
                  <div className="font-display font-semibold inline-flex items-center gap-2 mb-2">
                    <GraduationCap className="w-4 h-4 text-primary-glow" /> Need a refresher?
                  </div>
                  <Button variant="outline" size="sm" className="w-full" onClick={() => setTab("learn")}>
                    Re-read the lesson
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

function choosePuzzle(d: Difficulty): Puzzle {
  const progress = loadProgress();
  if (d === "adaptive") return pickAdaptive(progress);
  return pickNext(d, progress);
}

function maxHints(p: Puzzle, d: Difficulty): number {
  if (d === "easy") return p.hints.length;
  if (d === "medium") return Math.min(p.hints.length, 2);
  if (d === "hard") return Math.min(p.hints.length, 1);
  return p.hints.length;
}

function prettyBug(b: string): string {
  return ({
    "wrong-operator": "wrong operator",
    "off-by-one": "off-by-one error",
    "wrong-condition": "wrong condition",
    "infinite-loop": "non-terminating loop",
    "wrong-init": "incorrect initialisation",
    "swapped-branches": "wrong execution order",
  } as Record<string,string>)[b] ?? b;
}

function conceptExplainer(b: string): string {
  return ({
    "wrong-operator":   "Comparison operators define which inputs pass the condition. Off-by-one operator choices ripple through the entire branch.",
    "off-by-one":       "Loop bounds are inclusive/exclusive in different languages. Always trace the first and last iteration to verify boundaries.",
    "wrong-condition":  "When multiple conditions overlap, the order of checks matters. Specific cases must come before general ones.",
    "infinite-loop":    "A while-loop only terminates if the loop variable moves toward making the condition false on every iteration.",
    "wrong-init":       "The initial value of an accumulator (sum, max, min, count) defines what the loop is actually computing.",
    "swapped-branches": "Programs execute statements in order. Ordering itself is logic.",
  } as Record<string,string>)[b] ?? "Understanding the execution model is the foundation of debugging.";
}
