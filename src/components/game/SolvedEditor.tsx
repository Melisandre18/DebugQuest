// After solving a puzzle — run the corrected code step-by-step or all at once.
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, StepForward, RotateCcw, Terminal, ChevronDown, ChevronUp, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import CodeEditor from "@/components/CodeEditor";
import { runCode, type CodeRunResult } from "@/lib/api";
import { cn } from "@/lib/utils";

interface Props {
  code: string;
  language: string;
}

interface OutputLine { text: string; kind: "out" | "err" | "meta"; }

function parseResult(r: CodeRunResult): OutputLine[] {
  const lines: OutputLine[] = [];
  if (r.output) r.output.split("\n").filter(l => l !== "").forEach(t => lines.push({ text: t, kind: "out" }));
  if (r.error)  r.error.split("\n").filter(l => l !== "").forEach(t => lines.push({ text: t, kind: "err" }));
  lines.push({ text: `Finished in ${r.executionTimeMs} ms`, kind: "meta" });
  return lines;
}

export default function SolvedEditor({ code: initialCode, language }: Props) {
  const [code, setCode]         = useState(initialCode);
  const [stdin, setStdin]       = useState("");
  const [stdinOpen, setStdinOpen] = useState(false);
  const [running, setRunning]   = useState(false);

  // All collected output lines after execution
  const [allLines, setAllLines] = useState<OutputLine[] | null>(null);
  // How many lines are currently visible
  const [shown, setShown]       = useState(0);
  // Whether we are auto-advancing
  const [playing, setPlaying]   = useState(false);

  const bottomRef  = useRef<HTMLDivElement>(null);
  const timerRef   = useRef<number | null>(null);

  const total  = allLines?.length ?? 0;
  const atEnd  = shown >= total && total > 0;
  const ready  = allLines !== null && !running;

  // ── Auto-play timer ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!playing) return;
    if (shown < total) {
      timerRef.current = window.setTimeout(() => setShown(n => n + 1), 380);
    } else {
      setPlaying(false);
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [playing, shown, total]);

  // ── Auto-scroll ───────────────────────────────────────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [shown]);

  // ── Execute ───────────────────────────────────────────────────────────────────
  async function handleExecute() {
    if (timerRef.current) clearTimeout(timerRef.current);
    setPlaying(false);
    setRunning(true);
    setAllLines(null);
    setShown(0);
    try {
      const r = await runCode(language, code, stdin);
      setAllLines(parseResult(r));
    } catch (err) {
      setAllLines([
        { text: err instanceof Error ? err.message : "Execution failed", kind: "err" },
        { text: "Finished", kind: "meta" },
      ]);
    } finally {
      setRunning(false);
    }
  }

  // ── Step controls ─────────────────────────────────────────────────────────────
  function handleStep() {
    if (playing) { setPlaying(false); return; }
    if (!atEnd) setShown(n => n + 1);
  }

  function handlePlayPause() {
    if (atEnd) { setShown(0); setPlaying(true); return; } // replay
    setPlaying(p => !p);
  }

  function handleReset() {
    if (timerRef.current) clearTimeout(timerRef.current);
    setPlaying(false);
    setShown(0);
  }

  const visibleLines = allLines?.slice(0, shown) ?? [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15, type: "spring", stiffness: 180, damping: 22 }}
      className="mt-6 card-surface rounded-2xl overflow-hidden border border-success/20"
    >
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-border/60 bg-success/5">
        <div className="inline-flex items-center gap-2 text-sm font-display font-semibold text-success">
          <Terminal className="w-4 h-4" />
          Run it yourself
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground px-2 py-0.5 rounded border border-border">
            {language}
          </span>
          <button
            onClick={() => setStdinOpen(v => !v)}
            className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1 transition-colors"
          >
            stdin {stdinOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
          <Button variant="hero" size="sm" onClick={handleExecute} disabled={running}>
            <Zap className="w-3.5 h-3.5 mr-1" />
            {running ? "Running…" : "Execute"}
          </Button>
        </div>
      </div>

      {/* ── Stdin (collapsible) ── */}
      <AnimatePresence>
        {stdinOpen && (
          <motion.div
            initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }}
            className="overflow-hidden border-b border-border/60 bg-[#1a1a1a]"
          >
            <textarea
              value={stdin}
              onChange={e => setStdin(e.target.value)}
              rows={2}
              placeholder="stdin — one value per line…"
              spellCheck={false}
              className="w-full bg-transparent font-mono text-sm text-foreground/80 resize-none px-4 py-2.5 outline-none placeholder:text-muted-foreground/30"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Editor + Output ── */}
      <div className="grid lg:grid-cols-2 min-h-0">
        {/* Editor */}
        <div className="border-r border-border/60" style={{ height: 300 }}>
          <CodeEditor value={code} onChange={setCode} language={language} height="300px" />
        </div>

        {/* Output panel */}
        <div
          className="bg-[#1a1b1e] overflow-auto p-4 font-mono text-sm relative"
          style={{ height: 300 }}
        >
          {allLines === null ? (
            <div className="h-full flex flex-col items-center justify-center gap-2 text-muted-foreground/30 select-none">
              <Terminal className="w-8 h-8 opacity-20" />
              <span className="text-xs">Press Execute, then step through the output</span>
            </div>
          ) : (
            <>
              {visibleLines.map((line, i) => {
                const isLast = i === visibleLines.length - 1;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.1 }}
                    className={cn(
                      "leading-relaxed whitespace-pre-wrap break-all",
                      line.kind === "out"  && "text-green-300",
                      line.kind === "err"  && "text-red-400",
                      line.kind === "meta" && "text-muted-foreground/35 text-[11px] mt-3 pt-2 border-t border-white/5",
                    )}
                  >
                    {line.kind === "err" && <span className="text-red-500 mr-1">✕</span>}
                    {line.text}
                    {isLast && playing && (
                      <span className="ml-0.5 animate-pulse text-green-400">▌</span>
                    )}
                  </motion.div>
                );
              })}

              {/* Empty-output hint */}
              {shown === 0 && (
                <p className="text-muted-foreground/25 text-xs">
                  Press <span className="text-success/60">Step</span> or <span className="text-success/60">Play</span> to see output
                </p>
              )}
              <div ref={bottomRef} />
            </>
          )}
        </div>
      </div>

      {/* ── Step controls (only after executing) ── */}
      <AnimatePresence>
        {ready && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-border/60 bg-card/40 px-4 py-2.5 flex items-center justify-between gap-3 flex-wrap"
          >
            {/* Progress */}
            <div className="flex items-center gap-3 min-w-0">
              <span className="text-[11px] font-mono text-muted-foreground whitespace-nowrap">
                {atEnd
                  ? <span className="text-success/70">Done — {total - 1} line{total !== 2 ? "s" : ""}</span>
                  : <span>Step <b className="text-foreground">{shown}</b> / <b className="text-foreground">{total - 1}</b></span>
                }
              </span>
              {/* Progress bar */}
              <div className="flex-1 h-1 rounded-full bg-secondary overflow-hidden min-w-[60px] max-w-[120px]">
                <motion.div
                  className="h-full bg-success/60 rounded-full"
                  animate={{ width: total > 1 ? `${(shown / (total - 1)) * 100}%` : "0%" }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline" size="sm"
                onClick={handleReset}
                disabled={shown === 0}
                className="h-7 px-2.5 text-xs gap-1"
              >
                <RotateCcw className="w-3 h-3" /> Reset
              </Button>
              <Button
                variant="outline" size="sm"
                onClick={handleStep}
                disabled={atEnd && !playing}
                className="h-7 px-2.5 text-xs gap-1"
              >
                {playing
                  ? <><Pause className="w-3 h-3" /> Pause</>
                  : <><StepForward className="w-3 h-3" /> Step</>}
              </Button>
              <Button
                variant={playing ? "secondary" : "hero"} size="sm"
                onClick={handlePlayPause}
                className="h-7 px-3 text-xs gap-1"
              >
                {playing
                  ? <><Pause className="w-3 h-3" /> Pause</>
                  : atEnd
                    ? <><RotateCcw className="w-3 h-3" /> Replay</>
                    : <><Play className="w-3 h-3" /> Play</>}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
