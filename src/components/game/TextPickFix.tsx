// Interaction component for text-based pick-fix puzzles.
// Shows a code block + multiple-choice fix options.
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, RotateCcw, ChevronRight, Sparkles, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import CodeDisplay from "./CodeDisplay";
import type { TextPickFixPuzzle, TextFix } from "@/lib/puzzle-service";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";

interface Props {
  puzzle: TextPickFixPuzzle;
  onSolved: (score: number, attempts: number) => void;
  onNext: () => void;
}

export default function TextPickFix({ puzzle, onSolved, onNext }: Props) {
  const { t } = useLanguage();
  const [picked, setPicked] = useState<TextFix | null>(null);
  const [attempts, setAttempts] = useState(0);

  const solved = picked?.correct ?? false;

  function handlePick(fix: TextFix) {
    if (solved) return;
    setPicked(fix);
    setAttempts(a => a + 1);
    if (fix.correct) onSolved(Math.max(50, 200 - attempts * 40), attempts + 1);
  }

  function handleRetry() {
    if (solved) return;
    setPicked(null);
  }

  return (
    <div className="space-y-4">
      <CodeDisplay
        code={puzzle.code}
        language={puzzle.programmingLanguage === "any" ? undefined : puzzle.programmingLanguage}
        bugLine={picked?.correct ? undefined : puzzle.bugLine}
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
          {puzzle.fixes.map((fix) => {
            const wasPicked = picked?.id === fix.id;
            return (
              <button
                key={fix.id}
                disabled={solved}
                onClick={() => handlePick(fix)}
                className={cn(
                  "text-left rounded-lg border p-3.5 transition-all",
                  "bg-card/40 border-border hover:border-primary/40 hover:bg-primary/5",
                  wasPicked && fix.correct   && "border-success/60 bg-success/10",
                  wasPicked && !fix.correct  && "border-destructive/60 bg-destructive/10",
                  solved && !wasPicked       && "opacity-50 cursor-not-allowed",
                )}
              >
                <div className="flex items-start gap-3">
                  <div className={cn(
                    "w-6 h-6 rounded-md inline-flex items-center justify-center text-xs font-bold mt-0.5 shrink-0",
                    wasPicked && fix.correct  ? "bg-success text-success-foreground"
                    : wasPicked && !fix.correct ? "bg-destructive text-destructive-foreground"
                    : "bg-secondary text-foreground/70"
                  )}>
                    {wasPicked ? (fix.correct ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />) : "?"}
                  </div>
                  <div className="text-sm font-medium leading-snug">{fix.label}</div>
                </div>
              </button>
            );
          })}
        </div>

        <AnimatePresence>
          {picked && (
            <motion.div
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className={cn(
                "mt-4 rounded-lg border p-4",
                picked.correct ? "border-success/40 bg-success/5" : "border-destructive/40 bg-destructive/5"
              )}
            >
              <div className="flex items-start gap-2 mb-2">
                {picked.correct
                  ? <CheckCircle2 className="w-5 h-5 text-success shrink-0" />
                  : <XCircle className="w-5 h-5 text-destructive shrink-0" />}
                <div>
                  <div className="font-display font-semibold">
                    {picked.correct ? t.game.correctFeedback : t.game.incorrectFeedback}
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">{picked.explanation}</p>
                </div>
              </div>
              {picked.correct && (
                <div className="mt-3 rounded-md bg-card/60 p-3 text-sm">
                  <div className="text-xs uppercase tracking-wider text-muted-foreground inline-flex items-center gap-1.5 mb-1">
                    <BookOpen className="w-3.5 h-3.5" /> {t.game.whatYouLearned}
                  </div>
                  <p className="text-muted-foreground text-[13px]">{puzzle.concept}</p>
                </div>
              )}
              <div className="flex gap-2 mt-3">
                {picked.correct && (
                  <Button variant="hero" size="sm" onClick={onNext}>
                    {t.game.nextPuzzle} <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                )}
                {!picked.correct && (
                  <Button variant="outline" size="sm" onClick={handleRetry}>
                    <RotateCcw className="w-4 h-4 mr-1" /> {t.game.tryAgain}
                  </Button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
