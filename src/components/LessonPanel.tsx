import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, CheckCircle2, XCircle, Lightbulb, ArrowRight, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Lesson } from "@/lib/lessons";
import { getExampleForLanguage } from "@/lib/lessons";
import type { Language } from "@/lib/puzzle-engine";
import { cn } from "@/lib/utils";

interface Props {
  lesson: Lesson;
  language: Language;
  /** Called when the user finishes the lesson (passes the quiz or skips). */
  onContinue?: () => void;
  /** Disables the continue button (e.g. already on Debug tab). */
  hideContinue?: boolean;
}

/**
 * Structured pre-puzzle lesson: concept → example → key ideas → mini quiz.
 * Encourages "learn first, fix second".
 */
export default function LessonPanel({ lesson, language, onContinue, hideContinue }: Props) {
  const [picked, setPicked] = useState<number | null>(null);
  const correct = picked !== null && picked === lesson.quiz.correctIndex;
  const example = getExampleForLanguage(lesson, language);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="card-surface rounded-xl p-5 relative overflow-hidden">
        <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-primary/15 blur-3xl pointer-events-none" />
        <div className="relative flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/30 inline-flex items-center justify-center text-primary-glow shrink-0">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Concept</div>
            <h2 className="font-display text-xl font-bold mt-0.5">{lesson.title}</h2>
            <p className="text-sm text-muted-foreground mt-1">{lesson.concept}</p>
          </div>
        </div>
      </div>

      {/* Intro */}
      <section className="card-surface rounded-xl p-5">
        <div className="text-xs uppercase tracking-wider text-muted-foreground inline-flex items-center gap-1.5 mb-2">
          <BookOpen className="w-3.5 h-3.5" /> What you need to know
        </div>
        <p className="text-sm leading-relaxed text-foreground/90">{lesson.intro}</p>
      </section>

      {/* Example */}
      <section className="card-surface rounded-xl p-5">
        <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Example</div>
        <pre className="code-surface rounded-lg p-4 text-xs md:text-sm overflow-auto leading-6">
{example.code}
        </pre>
        <p className="text-sm text-muted-foreground mt-3">{example.explanation}</p>
      </section>

      {/* Key ideas */}
      <section className="card-surface rounded-xl p-5">
        <div className="text-xs uppercase tracking-wider text-muted-foreground inline-flex items-center gap-1.5 mb-3">
          <Lightbulb className="w-3.5 h-3.5" /> Key ideas
        </div>
        <ul className="space-y-2">
          {lesson.keyIdeas.map((k, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm">
              <span className="mt-1 w-1.5 h-1.5 rounded-full bg-primary-glow shrink-0" />
              <span className="text-foreground/90">{k}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Mini quiz */}
      <section className="card-surface rounded-xl p-5">
        <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Quick check</div>
        <p className="text-sm font-medium mb-3">{lesson.quiz.question}</p>
        <div className="grid gap-2">
          {lesson.quiz.options.map((opt, i) => {
            const isPicked = picked === i;
            const isCorrect = i === lesson.quiz.correctIndex;
            const showState = picked !== null;
            return (
              <button
                key={i}
                disabled={picked !== null}
                onClick={() => setPicked(i)}
                className={cn(
                  "text-left rounded-lg border p-3 transition-all text-sm",
                  !showState && "bg-card/40 border-border hover:border-primary/40 hover:bg-primary/5",
                  showState && isCorrect && "border-success/60 bg-success/10",
                  showState && isPicked && !isCorrect && "border-destructive/60 bg-destructive/10",
                  showState && !isPicked && !isCorrect && "opacity-50",
                )}
              >
                <span className="inline-flex items-center gap-2">
                  {showState && isCorrect && <CheckCircle2 className="w-4 h-4 text-success" />}
                  {showState && isPicked && !isCorrect && <XCircle className="w-4 h-4 text-destructive" />}
                  {opt}
                </span>
              </button>
            );
          })}
        </div>
        <AnimatePresence>
          {picked !== null && (
            <motion.div
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
              className={cn(
                "mt-3 rounded-md border p-3 text-sm",
                correct ? "border-success/40 bg-success/5" : "border-accent/40 bg-accent/5"
              )}
            >
              <div className="font-display font-semibold mb-1">
                {correct ? "Correct." : "Not quite — here's why:"}
              </div>
              <div className="text-muted-foreground">{lesson.quiz.rationale}</div>
              {!correct && (
                <button
                  onClick={() => setPicked(null)}
                  className="mt-2 text-xs text-primary-glow hover:underline"
                >
                  Try again
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* Further reading */}
      <section className="card-surface rounded-xl p-5">
        <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Related concepts</div>
        <div className="flex flex-wrap gap-1.5">
          {lesson.furtherReading.map((r) => (
            <span key={r} className="px-2.5 py-1 rounded-md bg-secondary/60 border border-border text-xs text-muted-foreground">
              {r}
            </span>
          ))}
        </div>
      </section>

      {!hideContinue && (
        <div className="flex justify-end">
          <Button variant="hero" onClick={onContinue}>
            I'm ready — start debugging <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
}
