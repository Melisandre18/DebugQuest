// Interaction component for text fill-in-the-blank puzzles.
// Shows code split around a blank; user selects the correct expression.
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, ChevronRight, BookOpen, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { TextFillBlankPuzzle, BlankOption } from "@/lib/puzzle-service";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";

interface Props {
  puzzle: TextFillBlankPuzzle;
  onSolved: (attempts: number) => void;
  onNext: () => void;
}

export default function TextFillBlank({ puzzle, onSolved, onNext }: Props) {
  const { t } = useLanguage();
  const [picked, setPicked] = useState<BlankOption | null>(null);
  const [attempts, setAttempts] = useState(0);
  const solved = picked?.correct ?? false;

  function handlePick(opt: BlankOption) {
    if (solved) return;
    setPicked(opt);
    setAttempts(a => a + 1);
    if (opt.correct) onSolved(attempts + 1);
  }

  const lang = puzzle.programmingLanguage === "any" ? undefined : puzzle.programmingLanguage;

  return (
    <div className="space-y-4">
      {/* Code with blank */}
      <div className="code-surface rounded-xl overflow-auto text-sm">
        {lang && (
          <div className="px-4 py-2 border-b border-white/5">
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground/60 font-mono">{lang}</span>
          </div>
        )}
        <pre className="p-4 leading-6 overflow-x-auto whitespace-pre-wrap">
          <code>{puzzle.codeBefore}</code>
          {/* The blank */}
          <span className={cn(
            "inline-block rounded px-2 py-0.5 font-bold font-mono border text-sm cursor-default",
            solved && picked?.correct
              ? "bg-success/20 border-success/60 text-success"
              : "bg-primary/10 border-primary/40 text-primary-glow animate-pulse"
          )}>
            {solved && picked ? picked.value : "___"}
          </span>
          <code>{puzzle.codeAfter}</code>
        </pre>
      </div>

      {/* Option chips */}
      <div className="card-surface rounded-xl p-5">
        <div className="text-xs uppercase tracking-wider text-muted-foreground mb-3">
          {t.game.chooseExpression}
        </div>
        <div className="flex flex-wrap gap-2.5">
          {puzzle.options.map((opt) => {
            const wasPicked = picked?.id === opt.id;
            return (
              <button
                key={opt.id}
                disabled={solved}
                onClick={() => handlePick(opt)}
                className={cn(
                  "font-mono text-sm px-4 py-2 rounded-lg border transition-all",
                  "bg-card/40 border-border hover:border-primary/50 hover:bg-primary/5",
                  wasPicked && opt.correct   && "border-success/60 bg-success/10 text-success",
                  wasPicked && !opt.correct  && "border-destructive/60 bg-destructive/10 text-destructive",
                  solved && !wasPicked       && "opacity-40 cursor-not-allowed",
                )}
              >
                {opt.value}
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
              <div className="flex items-start gap-2 mb-1">
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
                  <Button variant="outline" size="sm" onClick={() => setPicked(null)}>
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
