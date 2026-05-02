// Appears after any puzzle is solved — lets the player run and experiment
// with the corrected code directly inside the game flow.
import { useState } from "react";
import { motion } from "framer-motion";
import { Play, Terminal, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import CodeEditor from "@/components/CodeEditor";
import { runCode, type CodeRunResult } from "@/lib/api";
import { cn } from "@/lib/utils";

interface Props {
  code: string;
  language: string; // "javascript" | "python" | "cpp" | "java"
}

interface OutputLine { text: string; kind: "out" | "err" | "meta"; }

function parseResult(r: CodeRunResult): OutputLine[] {
  const lines: OutputLine[] = [];
  if (r.output) r.output.split("\n").forEach(t => lines.push({ text: t, kind: "out" }));
  if (r.error)  r.error.split("\n").forEach(t  => lines.push({ text: t, kind: "err" }));
  lines.push({ text: `Finished in ${r.executionTimeMs} ms`, kind: "meta" });
  return lines;
}

export default function SolvedEditor({ code: initialCode, language }: Props) {
  const [code, setCode]       = useState(initialCode);
  const [stdin, setStdin]     = useState("");
  const [output, setOutput]   = useState<OutputLine[] | null>(null);
  const [running, setRunning] = useState(false);
  const [stdinOpen, setStdinOpen] = useState(false);

  async function handleRun() {
    setRunning(true);
    try {
      const result = await runCode(language, code, stdin);
      setOutput(parseResult(result));
    } catch (err) {
      setOutput([
        { text: err instanceof Error ? err.message : "Run failed", kind: "err" },
        { text: "Is the backend running on port 5000?", kind: "meta" },
      ]);
    } finally {
      setRunning(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, type: "spring", stiffness: 180, damping: 22 }}
      className="mt-6 card-surface rounded-2xl overflow-hidden border border-success/20"
    >
      {/* Header */}
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
          <Button variant="hero" size="sm" onClick={handleRun} disabled={running}>
            <Play className="w-3.5 h-3.5 mr-1" />
            {running ? "Running…" : "Run"}
          </Button>
        </div>
      </div>

      {/* Stdin (collapsible) */}
      {stdinOpen && (
        <div className="border-b border-border/60 bg-[#1a1a1a]">
          <textarea
            value={stdin}
            onChange={e => setStdin(e.target.value)}
            rows={2}
            placeholder="stdin input (one value per line)…"
            spellCheck={false}
            className="w-full bg-transparent font-mono text-sm text-foreground/80 resize-none px-4 py-2.5 outline-none placeholder:text-muted-foreground/30"
          />
        </div>
      )}

      {/* Editor + output side by side */}
      <div className="grid lg:grid-cols-2 min-h-0">
        <div className="border-r border-border/60" style={{ height: 280 }}>
          <CodeEditor value={code} onChange={setCode} language={language} height="280px" />
        </div>

        <div className="bg-[#1e1e1e] overflow-auto p-4 font-mono text-sm" style={{ height: 280 }}>
          {output === null ? (
            <p className="text-muted-foreground/40 text-xs">
              Press <span className="text-success">Run</span> to execute your code.
            </p>
          ) : (
            output.map((line, i) => (
              <div
                key={i}
                className={cn(
                  "leading-relaxed whitespace-pre-wrap break-all",
                  line.kind === "out"  && "text-green-300",
                  line.kind === "err"  && "text-red-400",
                  line.kind === "meta" && "text-muted-foreground/40 text-xs mt-2 border-t border-white/5 pt-2",
                )}
              >
                {line.kind === "err" && <span className="text-red-500 mr-1">✕</span>}
                {line.text}
              </div>
            ))
          )}
        </div>
      </div>
    </motion.div>
  );
}
