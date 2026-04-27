// Drag-and-drop block reorder puzzle component.
// Uses framer-motion Reorder for smooth DnD.
import { useState } from "react";
import { Reorder } from "framer-motion";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, ChevronRight, GripVertical, Send, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AstReorderPuzzle } from "@/lib/puzzle-service";
import type { Stmt } from "@/lib/puzzle-engine";
import { programToSource } from "@/lib/puzzle-engine";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";

interface Props {
  puzzle: AstReorderPuzzle;
  progLang: import("@/lib/puzzle-engine").Language;
  onSolved: (score: number) => void;
  onNext: () => void;
}

export default function AstReorder({ puzzle, progLang, onSolved, onNext }: Props) {
  const { t } = useLanguage();
  const [items, setItems] = useState<Stmt[]>([...puzzle.scrambledProgram]);
  const [result, setResult] = useState<"correct" | "wrong" | null>(null);
  const [attempts, setAttempts] = useState(0);

  function handleSubmit() {
    const userOrder = items.map(s => s.id);
    const correct = puzzle.correctOrder.every((id, i) => id === userOrder[i]);
    setAttempts(a => a + 1);
    setResult(correct ? "correct" : "wrong");
    if (correct) onSolved(Math.max(50, 300 - attempts * 60));
  }

  function handleRetry() {
    setResult(null);
  }

  // Render a single statement as a short label
  function stmtLabel(s: Stmt): string {
    try {
      const lines = programToSource([s], progLang);
      return lines.filter(l => l.text.trim()).map(l => l.text.trim()).join(" ");
    } catch {
      return s.kind;
    }
  }

  const solved = result === "correct";

  return (
    <div className="space-y-4">
      <div className="card-surface rounded-xl p-5">
        <div className="text-xs uppercase tracking-wider text-muted-foreground mb-3">
          {t.game.reorderInstructions}
        </div>

        <Reorder.Group
          axis="y"
          values={items}
          onReorder={setItems}
          className="space-y-2"
        >
          {items.map((stmt, i) => (
            <Reorder.Item
              key={stmt.id}
              value={stmt}
              className={cn(
                "rounded-lg border p-3 cursor-grab active:cursor-grabbing",
                "bg-card/60 border-border transition-colors select-none",
                solved && "cursor-default bg-success/5 border-success/30",
                result === "wrong" && "border-destructive/30",
              )}
              whileDrag={{ scale: 1.02, zIndex: 50, boxShadow: "0 8px 24px rgba(0,0,0,0.3)" }}
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 shrink-0 text-muted-foreground/50">
                  <GripVertical className="w-4 h-4" />
                  <span className="w-5 h-5 rounded-md bg-secondary inline-flex items-center justify-center text-xs font-bold text-foreground/70">
                    {i + 1}
                  </span>
                </div>
                <code className="font-mono text-sm text-foreground/90 truncate flex-1">
                  {stmtLabel(stmt)}
                </code>
              </div>
            </Reorder.Item>
          ))}
        </Reorder.Group>

        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className={cn(
                "mt-4 rounded-lg border p-4",
                result === "correct" ? "border-success/40 bg-success/5" : "border-destructive/40 bg-destructive/5"
              )}
            >
              <div className="flex items-start gap-2">
                {result === "correct"
                  ? <CheckCircle2 className="w-5 h-5 text-success shrink-0" />
                  : <XCircle className="w-5 h-5 text-destructive shrink-0" />}
                <div>
                  <div className="font-display font-semibold">
                    {result === "correct" ? t.game.correctFeedback : t.game.orderWrong}
                  </div>
                  {result === "correct" && (
                    <div className="mt-2 rounded-md bg-card/60 p-3 text-sm">
                      <div className="text-xs uppercase tracking-wider text-muted-foreground inline-flex items-center gap-1.5 mb-1">
                        <BookOpen className="w-3.5 h-3.5" /> {t.game.whatYouLearned}
                      </div>
                      <p className="text-muted-foreground text-[13px]">{puzzle.explanation}</p>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex gap-2 mt-3">
                {result === "correct" && (
                  <Button variant="hero" size="sm" onClick={onNext}>
                    {t.game.nextPuzzle} <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                )}
                {result === "wrong" && (
                  <Button variant="outline" size="sm" onClick={handleRetry}>
                    {t.game.tryAgain}
                  </Button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {!result && (
          <Button
            variant="hero"
            size="sm"
            className="mt-4 w-full"
            onClick={handleSubmit}
          >
            <Send className="w-4 h-4 mr-2" /> {t.game.checkOrder}
          </Button>
        )}
      </div>
    </div>
  );
}
