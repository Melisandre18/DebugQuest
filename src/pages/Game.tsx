import { useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play, StepForward, RotateCcw, Lightbulb, CheckCircle2, XCircle,
  Code2, Blocks, ChevronRight, Sparkles, Target, BookOpen, GraduationCap,
  MessageSquare, Globe, Loader2, Shuffle, PencilLine,
} from "lucide-react";
import TopNav from "@/components/TopNav";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CodeView from "@/components/CodeView";
import BlockView from "@/components/BlockView";
import ExecutionPanel from "@/components/ExecutionPanel";
import LessonPanel from "@/components/LessonPanel";
import FeedbackDialog from "@/components/FeedbackDialog";
import { DIFFICULTY_META, DifficultyBadge } from "@/components/DifficultyMeta";
import TextPickFix from "@/components/game/TextPickFix";
import TextFillBlank from "@/components/game/TextFillBlank";
import AstReorder from "@/components/game/AstReorder";
import {
  type Difficulty, type FixOption, LANGUAGES, type Language, type Program,
  type Puzzle, type RunResult, type Step,
} from "@/lib/puzzle-engine";
import { getLesson } from "@/lib/lessons";
import { type AnyPuzzle, type AstReorderPuzzle, type TextPickFixPuzzle, type TextFillBlankPuzzle } from "@/lib/puzzle-service";
import { cn } from "@/lib/utils";
import { type Translations } from "@/lib/translations";
import { useGameSession, maxHints, type View, type Tab } from "@/hooks/useGameSession";

const PROG_LANG_LABELS: Record<Language, string> = {
  python: "Python", javascript: "JavaScript", cpp: "C++", java: "Java",
};

const INTERACTION_BADGE: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  "pick-fix":   { label: "Find & Fix",  icon: Target,     color: "border-primary/40 bg-primary/5 text-primary-glow" },
  "reorder":    { label: "Reorder",     icon: Shuffle,    color: "border-accent/40 bg-accent/5 text-accent" },
  "fill-blank": { label: "Fill Blank",  icon: PencilLine, color: "border-success/40 bg-success/5 text-success" },
};

function InteractionBadge({ interaction }: { interaction: string }) {
  const meta = INTERACTION_BADGE[interaction];
  if (!meta) return null;
  const Icon = meta.icon;
  return (
    <span className={cn("inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-semibold px-2 py-1 rounded-md border", meta.color)}>
      <Icon className="w-3 h-3" /> {meta.label}
    </span>
  );
}

export default function Game() {
  const { difficulty, language: urlLanguage } = useParams<{ difficulty: Difficulty; language?: Language }>();

  const d = (["easy","medium","hard","adaptive"].includes(difficulty ?? "") ? difficulty : "easy") as Difficulty;
  const initialProgLang = (["python","javascript","cpp","java"].includes(urlLanguage ?? "") ? urlLanguage : "python") as Language;

  const session = useGameSession(d, initialProgLang);
  const {
    loading, loadError, anyPuzzle, astPuzzle, runResult, currentStep, lesson, hints, maxHintsCount,
    isAstPickFix, isAstReorder, isTextPickFix, isTextFillBlank,
    sessionSolved, progLang, tab, setTab,
    view, setView, program, setProgram,
    hintsRevealed, attempts, solved, revealedBug, feedback, setFeedback,
    stepIdx, autoRunning, meta, showCodeToggle,
    loadNewPuzzle, tryFix, handleSolve, revealHint, handleProgLangChange,
    step, startAuto, resetExecution, t,
  } = session;

  if (loading) return (
    <div className="min-h-screen flex flex-col">
      <TopNav center={<DifficultyBadge d={d} />} backTo={{ to: "/modes", label: t.nav.modes }} />
      <main className="container flex-1 flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-4 text-muted-foreground">
          <Loader2 className="w-10 h-10 animate-spin text-primary-glow" />
          <p className="text-sm">{t.game.loadingPuzzle}</p>
        </div>
      </main>
    </div>
  );

  if (loadError || !anyPuzzle) return (
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

        {sessionSolved > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            className="mb-4 flex items-center gap-3 card-surface rounded-xl px-4 py-2.5"
          >
            <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
            <span className="text-sm text-muted-foreground">
              {t.game.sessionSolved.replace("{n}", String(sessionSolved))}
            </span>
            <div className="flex-1 h-1.5 rounded-full bg-secondary overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, sessionSolved * 10)}%` }}
                transition={{ type: "spring", stiffness: 200 }}
              />
            </div>
          </motion.div>
        )}

        {/* Puzzle header */}
        <motion.div
          key={anyPuzzle.id}
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="card-surface rounded-2xl p-5 md:p-6 mb-5 relative overflow-hidden"
        >
          <div className={cn("absolute -right-10 -top-10 w-40 h-40 rounded-full blur-3xl opacity-20", meta.color.replace("text-", "bg-"))} />
          <div className="relative flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <div className="text-xs text-muted-foreground inline-flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5" /> {anyPuzzle.concept}
                </div>
                <InteractionBadge interaction={anyPuzzle.interaction} />
                {anyPuzzle.programmingLanguage !== "any" && (
                  <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-1 rounded-md border border-border bg-card/40 text-muted-foreground">
                    {anyPuzzle.programmingLanguage}
                  </span>
                )}
              </div>
              <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight">{anyPuzzle.title}</h1>
              <p className="text-muted-foreground mt-1.5">{anyPuzzle.story}</p>
              <div className="mt-3 inline-flex items-start gap-2 text-sm bg-primary/5 border border-primary/30 rounded-lg px-3 py-2 text-foreground/90">
                <Sparkles className="w-4 h-4 text-primary-glow mt-0.5 shrink-0" />
                <span><b className="text-primary-glow">{t.game.goal}</b> {anyPuzzle.task}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-muted-foreground shrink-0" />
                <Select value={progLang} onValueChange={(v) => handleProgLangChange(v as Language)}>
                  <SelectTrigger className="h-8 w-[140px] text-xs font-mono">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LANGUAGES.map((l) => (
                      <SelectItem key={l.id} value={l.id} className="font-mono text-xs">{l.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button variant="outline" size="sm" onClick={loadNewPuzzle}>
                {t.buttons.skip} <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
              <FeedbackDialog
                context="puzzle" puzzleId={anyPuzzle.id}
                trigger={
                  <Button variant="ghost" size="sm">
                    <MessageSquare className="w-4 h-4 mr-1" /> {t.nav.feedback}
                  </Button>
                }
              />
            </div>
          </div>
        </motion.div>

        <Tabs value={tab} onValueChange={(v) => setTab(v as Tab)} className="space-y-5">
          <TabsList className="grid grid-cols-2 max-w-md">
            <TabsTrigger value="learn" className="gap-2">
              <GraduationCap className="w-4 h-4" /> {t.game.conceptTab}
            </TabsTrigger>
            <TabsTrigger value="play" className="gap-2">
              {anyPuzzle.interaction === "reorder"    ? <Shuffle className="w-4 h-4" />
              : anyPuzzle.interaction === "fill-blank" ? <PencilLine className="w-4 h-4" />
              : <Code2 className="w-4 h-4" />}
              {t.game.debugTab}
            </TabsTrigger>
          </TabsList>

          <div hidden={tab !== "learn"}>
            {lesson ? (
              <div className="grid lg:grid-cols-[1fr_300px] gap-5">
                <LessonPanel lesson={lesson} language={progLang} onContinue={() => setTab("play")} />
                <aside className="space-y-4">
                  <div className="card-surface rounded-xl p-4 flex items-center gap-3">
                    <Globe className="w-5 h-5 text-primary-glow shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs uppercase tracking-wider text-muted-foreground mb-0.5">{t.game.activeProgrammingLang}</div>
                      <div className="font-mono font-semibold text-sm">{PROG_LANG_LABELS[progLang]}</div>
                    </div>
                    <Select value={progLang} onValueChange={(v) => handleProgLangChange(v as Language)}>
                      <SelectTrigger className="h-7 w-[110px] text-xs font-mono">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {LANGUAGES.map((l) => <SelectItem key={l.id} value={l.id} className="font-mono text-xs">{l.label}</SelectItem>)}
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
                    <Button variant="hero" size="sm" className="w-full mt-2" onClick={() => setTab("play")}>
                      {t.gameUI.goToDebug} <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </aside>
              </div>
            ) : (
              <div className="grid lg:grid-cols-[1fr_300px] gap-5">
                <div className="space-y-4">
                  <div className="card-surface rounded-2xl p-6 space-y-4">
                    <div className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-primary-glow font-semibold">
                      <BookOpen className="w-4 h-4" /> {t.game.concept}
                    </div>
                    <h2 className="font-display text-xl font-bold">{anyPuzzle.concept}</h2>
                    <p className="text-muted-foreground text-sm leading-relaxed">{anyPuzzle.story}</p>
                    <div className="rounded-lg bg-primary/5 border border-primary/20 p-4">
                      <div className="text-xs uppercase tracking-wider text-primary-glow font-semibold mb-2">{t.game.goal}</div>
                      <p className="text-sm">{anyPuzzle.task}</p>
                    </div>
                  </div>
                  {hints.length > 0 && (
                    <div className="card-surface rounded-xl p-5 space-y-3">
                      <div className="font-display font-semibold inline-flex items-center gap-2">
                        <Lightbulb className="w-4 h-4 text-accent" /> {t.game.keyIdeas}
                      </div>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        {hints.slice(0, 2).map((h, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="w-5 h-5 rounded-md bg-accent/20 text-accent text-xs font-bold inline-flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                            <span>{h}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <Button variant="hero" className="w-full" onClick={() => setTab("play")}>
                    {t.gameUI.goToDebug} <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
                <aside className="space-y-4">
                  <div className="card-surface rounded-xl p-4 flex items-center gap-3">
                    <Globe className="w-5 h-5 text-primary-glow shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs uppercase tracking-wider text-muted-foreground mb-0.5">{t.game.activeProgrammingLang}</div>
                      <div className="font-mono font-semibold text-sm">{PROG_LANG_LABELS[progLang]}</div>
                    </div>
                    <Select value={progLang} onValueChange={(v) => handleProgLangChange(v as Language)}>
                      <SelectTrigger className="h-7 w-[110px] text-xs font-mono">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {LANGUAGES.map((l) => <SelectItem key={l.id} value={l.id} className="font-mono text-xs">{l.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="card-surface rounded-xl p-5 text-sm space-y-2">
                    <div className="font-display font-semibold inline-flex items-center gap-2">
                      <Target className="w-4 h-4 text-accent" /> {t.gameUI.whenReady}
                    </div>
                    <p className="text-muted-foreground text-[13px]">{t.gameUI.debugInstructions}</p>
                  </div>
                </aside>
              </div>
            )}
          </div>

          <div hidden={tab !== "play"}>
            <PlayArea
              anyPuzzle={anyPuzzle} astPuzzle={astPuzzle} progLang={progLang}
              isAstPickFix={isAstPickFix} isAstReorder={isAstReorder}
              isTextPickFix={isTextPickFix} isTextFillBlank={isTextFillBlank}
              program={program} setProgram={setProgram} runResult={runResult}
              stepIdx={stepIdx} autoRunning={autoRunning} revealedBug={revealedBug}
              solved={solved} feedback={feedback} attempts={attempts}
              hintsRevealed={hintsRevealed} hints={hints} maxHintsCount={maxHintsCount}
              view={view} setView={setView} showCodeToggle={showCodeToggle}
              currentStep={currentStep}
              tryFix={tryFix} step={step} startAuto={startAuto}
              resetExecution={resetExecution} revealHint={revealHint}
              loadNewPuzzle={loadNewPuzzle}
              handleSolve={handleSolve} setFeedback={setFeedback} setTab={setTab}
              d={d} t={t}
            />
          </div>
        </Tabs>
      </main>
    </div>
  );
}

// ─── PlayArea ─────────────────────────────────────────────────────────────────

interface PlayAreaProps {
  anyPuzzle: AnyPuzzle;
  astPuzzle: Puzzle | null;
  progLang: Language;
  isAstPickFix: boolean; isAstReorder: boolean; isTextPickFix: boolean; isTextFillBlank: boolean;
  program: Program; setProgram: (p: Program) => void; runResult: ReturnType<typeof import("@/lib/puzzle-engine").run> | null;
  stepIdx: number; autoRunning: boolean; revealedBug: boolean;
  solved: boolean; feedback: { option: FixOption; correct: boolean; result: RunResult } | null;
  attempts: number; hintsRevealed: number; hints: string[]; maxHintsCount: number;
  view: View; setView: (v: View) => void; showCodeToggle: boolean;
  currentStep: Step | undefined;
  tryFix: (o: FixOption) => void;
  step: () => void; startAuto: () => void; resetExecution: () => void; revealHint: () => void;
  loadNewPuzzle: () => void;
  handleSolve: (p: { id: string; difficulty: string; title?: string }, att: number) => void;
  setFeedback: (v: null) => void;
  setTab: (t: Tab) => void;
  d: Difficulty;
  t: Translations;
}

function PlayArea({
  anyPuzzle, astPuzzle, progLang,
  isAstPickFix, isAstReorder, isTextPickFix, isTextFillBlank,
  program, setProgram, runResult, stepIdx, autoRunning, revealedBug,
  solved, feedback, attempts, hintsRevealed, hints, maxHintsCount,
  view, setView, showCodeToggle, currentStep,
  tryFix, step, startAuto, resetExecution, revealHint, loadNewPuzzle,
  handleSolve, setFeedback, setTab, d, t,
}: PlayAreaProps) {

  if (isTextPickFix) return (
    <div className="grid lg:grid-cols-[1fr_280px] gap-5">
      <TextPickFix
        key={anyPuzzle.id}
        puzzle={anyPuzzle as TextPickFixPuzzle}
        onSolved={(att) => handleSolve(anyPuzzle, att)}
        onNext={loadNewPuzzle}
      />
      <HintsPanel hints={hints} maxHintsCount={maxHintsCount} hintsRevealed={hintsRevealed} revealHint={revealHint} setTab={setTab} t={t} solved={solved} />
    </div>
  );

  if (isTextFillBlank) return (
    <div className="grid lg:grid-cols-[1fr_280px] gap-5">
      <TextFillBlank
        key={anyPuzzle.id}
        puzzle={anyPuzzle as TextFillBlankPuzzle}
        onSolved={(att) => handleSolve(anyPuzzle, att)}
        onNext={loadNewPuzzle}
      />
      <HintsPanel hints={hints} maxHintsCount={maxHintsCount} hintsRevealed={hintsRevealed} revealHint={revealHint} setTab={setTab} t={t} solved={solved} />
    </div>
  );

  if (isAstReorder) return (
    <div className="grid lg:grid-cols-[1fr_280px] gap-5">
      <AstReorder
        key={anyPuzzle.id}
        puzzle={anyPuzzle as AstReorderPuzzle}
        progLang={progLang}
        onSolved={(att) => handleSolve(anyPuzzle, att)}
        onNext={loadNewPuzzle}
      />
      <HintsPanel hints={hints} maxHintsCount={maxHintsCount} hintsRevealed={hintsRevealed} revealHint={revealHint} setTab={setTab} t={t} solved={solved} />
    </div>
  );

  if (!isAstPickFix || !astPuzzle || !runResult) return (
    <div className="card-surface rounded-xl p-8 text-center text-muted-foreground text-sm">
      {t.game.loadingPuzzle}
    </div>
  );

  return (
    <div className="space-y-5">
      {/* Execution controls */}
      <div className="card-surface rounded-xl p-3 flex items-center justify-between gap-3 flex-wrap">
        <div className="text-xs text-muted-foreground inline-flex items-center gap-2 font-mono">
          {t.gameUI.stepPrefix} {Math.min(stepIdx + 1, runResult.steps.length)} / {runResult.steps.length}
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
        <div className="space-y-4">
          <div className="card-surface rounded-xl p-1.5">
            <div className="flex items-center justify-between gap-3 px-2.5 py-1.5 flex-wrap">
              <div className="inline-flex rounded-lg bg-secondary/60 p-0.5">
                <button
                  onClick={() => setView("blocks")}
                  className={cn("px-3 py-1.5 text-xs font-medium rounded-md inline-flex items-center gap-1.5 transition-colors",
                    view === "blocks" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}
                >
                  <Blocks className="w-3.5 h-3.5" /> {t.game.blocks}
                </button>
                {showCodeToggle && (
                  <button
                    onClick={() => setView("code")}
                    className={cn("px-3 py-1.5 text-xs font-medium rounded-md inline-flex items-center gap-1.5 transition-colors",
                      view === "code" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}
                  >
                    <Code2 className="w-3.5 h-3.5" /> {t.game.code}
                  </button>
                )}
              </div>
              <Select value={progLang} onValueChange={() => {}}>
                <SelectTrigger className="h-8 w-[150px] text-xs font-mono">
                  <SelectValue>{PROG_LANG_LABELS[progLang]}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGES.map(l => <SelectItem key={l.id} value={l.id} className="font-mono text-xs">{l.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="p-2.5 pt-0">
              {view === "blocks"
                ? <BlockView program={program} activeStmtId={currentStep?.stmtId} bugStmtId={astPuzzle.bugStmtId} showBug={revealedBug} />
                : <CodeView program={program} language={progLang} activeStmtId={currentStep?.stmtId} bugStmtId={astPuzzle.bugStmtId} showBug={revealedBug} />}
            </div>
          </div>

          <ExecutionPanel steps={runResult.steps} index={stepIdx} expectedOutput={astPuzzle.expected.output} />

          {/* Fix options */}
          <div className="card-surface rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display font-semibold inline-flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary-glow" /> {t.game.pickFix}
              </h3>
              <span className="text-xs text-muted-foreground">{t.game.attempts} {attempts}</span>
            </div>
            <div className="grid gap-2.5">
              {astPuzzle.fixes.map((opt) => {
                const wasTried = feedback?.option.id === opt.id;
                return (
                  <button
                    key={opt.id} disabled={solved} onClick={() => tryFix(opt)}
                    className={cn(
                      "text-left rounded-lg border p-3.5 transition-all",
                      "bg-card/40 border-border hover:border-primary/40 hover:bg-primary/5",
                      wasTried && opt.correct  && "border-success/60 bg-success/10",
                      wasTried && !opt.correct && "border-destructive/60 bg-destructive/10",
                      solved && !wasTried      && "opacity-50 cursor-not-allowed",
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        "w-6 h-6 rounded-md inline-flex items-center justify-center text-xs font-bold mt-0.5 shrink-0",
                        wasTried && opt.correct  ? "bg-success text-success-foreground"
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
                  className={cn("mt-4 rounded-lg border p-4",
                    feedback.correct ? "border-success/40 bg-success/5" : "border-destructive/40 bg-destructive/5")}
                >
                  <div className="flex items-start gap-2 mb-2">
                    {feedback.correct ? <CheckCircle2 className="w-5 h-5 text-success shrink-0" /> : <XCircle className="w-5 h-5 text-destructive shrink-0" />}
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
                      <div><b className="text-primary-glow">{t.game.theBug}</b> {t.game.bugTypes?.[astPuzzle.bugType as keyof typeof t.game.bugTypes] ?? astPuzzle.bugType} {t.game.in} <b>{astPuzzle.concept}</b>.</div>
                      <div><b className="text-primary-glow">{t.game.whyItWorks}</b> {t.game.whyItWorksDesc}</div>
                      <div><b className="text-primary-glow">{t.game.underlyingConcept}</b> {t.game.conceptExplainers?.[astPuzzle.bugType as keyof typeof t.game.conceptExplainers] ?? astPuzzle.concept}</div>
                    </div>
                  )}
                  <div className="flex gap-2 mt-3">
                    {feedback.correct && <Button variant="hero" size="sm" onClick={loadNewPuzzle}>{t.game.nextPuzzle} <ChevronRight className="w-4 h-4 ml-1" /></Button>}
                    {!feedback.correct && (
                      <Button variant="outline" size="sm" onClick={() => { setProgram(astPuzzle.program); setFeedback(null); }}>
                        <RotateCcw className="w-4 h-4 mr-1" /> {t.game.restoreAndRetry}
                      </Button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <aside className="space-y-4">
          <HintsPanel hints={hints} maxHintsCount={maxHintsCount} hintsRevealed={hintsRevealed} revealHint={revealHint} setTab={setTab} t={t} solved={solved} />
          <div className="card-surface rounded-xl p-5 text-sm space-y-2">
            <div className="font-display font-semibold inline-flex items-center gap-2">
              <Target className="w-4 h-4 text-primary-glow" /> {t.game.debugStrategy}
            </div>
            <ol className="space-y-1.5 text-muted-foreground text-[13px]">
              <li>{t.game.strategyTrace}</li>
              <li>{t.game.strategyIsolate}</li>
              <li>{t.game.strategyFix}</li>
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
    </div>
  );
}

// ─── HintsPanel ───────────────────────────────────────────────────────────────

function HintsPanel({ hints, maxHintsCount, hintsRevealed, revealHint, setTab, t, solved }:
  { hints: string[]; maxHintsCount: number; hintsRevealed: number; revealHint: () => void; setTab: (s: Tab) => void; t: Translations; solved: boolean }) {
  return (
    <div className="card-surface rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-display font-semibold inline-flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-accent" /> {t.game.hints}
        </h3>
        {solved
          ? <span className="text-[10px] uppercase tracking-wider font-semibold text-success px-2 py-0.5 rounded-md bg-success/10 border border-success/30">Solved</span>
          : <span className="text-xs text-muted-foreground">{hintsRevealed} / {maxHintsCount}</span>
        }
      </div>
      <div className="space-y-2">
        {hints.slice(0, maxHintsCount).map((h, i) => {
          const shown = i < hintsRevealed;
          const isSpoiler = i === hints.length - 1;
          return (
            <div key={i} className={cn(
              "rounded-md border p-3 text-sm transition-all",
              shown ? (isSpoiler ? "border-destructive/40 bg-destructive/5" : "border-accent/40 bg-accent/5") : "border-border bg-card/40 text-muted-foreground/60"
            )}>
              <div className="text-[10px] uppercase tracking-wider mb-0.5 opacity-70">
                {isSpoiler ? t.game.spoiler : `${t.game.hint} ${i + 1}`}
              </div>
              {shown ? h : t.game.locked}
            </div>
          );
        })}
      </div>
      <Button variant="outline" size="sm" className="mt-3 w-full" onClick={revealHint}
        disabled={hintsRevealed >= maxHintsCount || solved}
      >
        <Lightbulb className="w-4 h-4 mr-1" />
        {solved ? "Puzzle solved" : hintsRevealed >= maxHintsCount ? t.game.allHintsRevealed : t.buttons.hint}
      </Button>
      {!solved && <p className="text-[11px] text-muted-foreground mt-2">{t.game.hintCostNote}</p>}
    </div>
  );
}
