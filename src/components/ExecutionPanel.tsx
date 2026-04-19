import { Step } from "@/lib/puzzle-engine";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, Terminal, Variable } from "lucide-react";

interface Props {
  steps: Step[];
  index: number;
  expectedOutput?: string[];
}

export default function ExecutionPanel({ steps, index, expectedOutput }: Props) {
  const current = steps[index];
  const vars = current?.vars ?? {};
  const output = current?.output ?? [];

  return (
    <div className="card-surface rounded-lg p-4 space-y-4">
      <div>
        <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground mb-2">
          <Activity className="w-3.5 h-3.5" /> Execution trace
        </div>
        <div className="font-mono text-xs text-foreground/80 min-h-[1.25rem]">
          {current ? (
            <span>step {index + 1} / {steps.length} — <span className="text-primary-glow">{current.note}</span></span>
          ) : (
            <span className="text-muted-foreground">Press <b>Run</b> or <b>Step</b> to begin.</span>
          )}
        </div>
      </div>

      <div>
        <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground mb-2">
          <Variable className="w-3.5 h-3.5" /> Variables
        </div>
        <div className="flex flex-wrap gap-2 min-h-[2.25rem]">
          {Object.entries(vars).length === 0 && (
            <span className="text-xs text-muted-foreground italic">no variables yet</span>
          )}
          <AnimatePresence>
            {Object.entries(vars).map(([k, v]) => (
              <motion.div
                key={k}
                layout
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="font-mono text-xs px-2.5 py-1.5 rounded-md bg-primary/10 border border-primary/30"
              >
                <span className="text-muted-foreground">{k}</span>
                <span className="mx-1.5 text-foreground/40">=</span>
                <span className="text-primary-glow font-semibold">{String(v)}</span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      <div>
        <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground mb-2">
          <Terminal className="w-3.5 h-3.5" /> Output
        </div>
        <div className="code-surface rounded-md p-3 min-h-[5rem] max-h-32 overflow-auto text-xs space-y-0.5">
          {output.length === 0 && <div className="text-muted-foreground italic">— no output yet —</div>}
          {output.map((line, i) => (
            <div key={i} className="text-success">› {line}</div>
          ))}
        </div>
        {expectedOutput && expectedOutput.length > 0 && (
          <div className="mt-2 text-xs text-muted-foreground">
            <span className="opacity-70">Expected: </span>
            <span className="font-mono text-foreground/80">[{expectedOutput.join(", ")}]</span>
          </div>
        )}
      </div>
    </div>
  );
}
