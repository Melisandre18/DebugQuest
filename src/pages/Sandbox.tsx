import { useRef, useState } from "react";
import { Play, RotateCcw, Clock, ChevronDown, Terminal } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import TopNav from "@/components/TopNav";
import CodeEditor from "@/components/CodeEditor";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const SERVER_URL = (import.meta.env.VITE_SERVER_URL as string | undefined) ?? "http://localhost:5000";

type Lang = "javascript" | "python" | "cpp" | "java";

const LANGUAGES: { id: Lang; label: string; monaco: string }[] = [
  { id: "javascript", label: "JavaScript", monaco: "javascript" },
  { id: "python",     label: "Python",     monaco: "python"     },
  { id: "cpp",        label: "C++",        monaco: "cpp"        },
  { id: "java",       label: "Java",       monaco: "java"       },
];

const STARTERS: Record<Lang, string> = {
  javascript:
`// JavaScript — prompt() reads from the stdin panel below
function greetUser() {
  const name = prompt("Enter your name:");
  if (name && name.trim() !== "") {
    console.log(\`Hello, \${name}!\`);
  } else {
    console.log("Hello, stranger!");
  }
}

greetUser();
console.log([1, 2, 3].map(x => x * x));
`,

  python:
`# Python — input() reads from the stdin panel below
name = input("Enter your name: ")
print(f"Hello, {name}!")
print([x ** 2 for x in range(1, 6)])
`,

  cpp:
`#include <iostream>
#include <string>
using namespace std;

int main() {
    string name;
    cout << "Enter your name: ";
    cin >> name;
    cout << "Hello, " << name << "!" << endl;
    return 0;
}
`,

  java:
`import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        System.out.print("Enter your name: ");
        String name = scanner.nextLine();
        System.out.println("Hello, " + name + "!");
    }
}
`,
};

const DEFAULT_STDIN: Record<Lang, string> = {
  javascript: "DebugQuest",
  python:     "DebugQuest",
  cpp:        "DebugQuest",
  java:       "DebugQuest",
};

interface RunResult {
  output: string;
  error: string | null;
  executionTimeMs: number;
}

interface OutputLine {
  text: string;
  kind: "out" | "err" | "meta";
}

function parseOutput(r: RunResult): OutputLine[] {
  const lines: OutputLine[] = [];
  if (r.output) r.output.split("\n").forEach(t => lines.push({ text: t, kind: "out" }));
  if (r.error)  r.error.split("\n").forEach(t  => lines.push({ text: t, kind: "err" }));
  lines.push({ text: `Finished in ${r.executionTimeMs} ms`, kind: "meta" });
  return lines;
}

export default function Sandbox() {
  const [lang, setLang]       = useState<Lang>("javascript");
  const [code, setCode]       = useState(STARTERS.javascript);
  const [stdin, setStdin]     = useState(DEFAULT_STDIN.javascript);
  const [output, setOutput]   = useState<OutputLine[] | null>(null);
  const [running, setRunning] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const outputRef = useRef<HTMLDivElement>(null);

  function handleLangChange(l: Lang) {
    setLang(l);
    setCode(STARTERS[l]);
    setStdin(DEFAULT_STDIN[l]);
    setOutput(null);
    setLangOpen(false);
  }

  async function handleRun() {
    setRunning(true);
    setOutput(null);
    try {
      const res = await fetch(`${SERVER_URL}/api/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language: lang, code, stdin }),
      });
      const data = await res.json() as RunResult & { error?: string };
      if (!res.ok) {
        setOutput([
          { text: data.error ?? "Execution failed", kind: "err" },
          { text: `HTTP ${res.status}`, kind: "meta" },
        ]);
      } else {
        setOutput(parseOutput(data));
      }
    } catch {
      setOutput([
        { text: "Could not reach the execution server.", kind: "err" },
        { text: "Is the backend running on port 5000?", kind: "meta" },
      ]);
    } finally {
      setRunning(false);
      setTimeout(() => outputRef.current?.scrollTo({ top: 0 }), 50);
    }
  }

  const currentLang = LANGUAGES.find(l => l.id === lang)!;
  const execTime = output?.find(l => l.kind === "meta")?.text;

  return (
    <div className="min-h-screen flex flex-col">
      <TopNav />

      <main className="flex-1 flex flex-col container py-5 gap-3" style={{ height: "calc(100vh - 56px)" }}>

        {/* ── Toolbar ── */}
        <div className="flex items-center gap-2 flex-wrap shrink-0">

          {/* Language picker */}
          <div className="relative">
            <button
              onClick={() => setLangOpen(v => !v)}
              className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md border border-border bg-background text-sm font-mono hover:bg-secondary/60 transition-colors"
            >
              {currentLang.label}
              <ChevronDown className="w-3 h-3 text-muted-foreground" />
            </button>
            <AnimatePresence>
              {langOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="absolute top-10 left-0 z-20 w-36 rounded-lg border border-border bg-popover shadow-lg overflow-hidden"
                >
                  {LANGUAGES.map(l => (
                    <button
                      key={l.id}
                      onClick={() => handleLangChange(l.id)}
                      className={cn(
                        "w-full text-left px-3 py-2 text-sm font-mono transition-colors",
                        l.id === lang ? "bg-primary/10 text-primary-glow" : "hover:bg-secondary/60",
                      )}
                    >
                      {l.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <Button variant="hero" size="sm" onClick={handleRun} disabled={running}>
            <Play className="w-3.5 h-3.5 mr-1.5" />
            {running ? "Running…" : "Run"}
          </Button>

          <Button variant="outline" size="sm" onClick={() => { setCode(STARTERS[lang]); setOutput(null); }}>
            <RotateCcw className="w-3.5 h-3.5 mr-1.5" /> Reset
          </Button>

          {execTime && (
            <span className="ml-auto text-xs text-muted-foreground inline-flex items-center gap-1 font-mono">
              <Clock className="w-3 h-3" /> {execTime}
            </span>
          )}
        </div>

        {/* ── Main area ── */}
        <div className="flex-1 grid lg:grid-cols-[1fr_380px] gap-3 min-h-0">

          {/* Monaco editor */}
          <div className="rounded-xl overflow-hidden border border-border min-h-0">
            <CodeEditor
              value={code}
              onChange={setCode}
              language={currentLang.monaco}
            />
          </div>

          {/* Right column: stdin + output */}
          <div className="flex flex-col gap-3 min-h-0">

            {/* Stdin */}
            <div className="shrink-0 rounded-xl border border-border bg-[#1e1e1e] overflow-hidden">
              <div className="px-3 py-2 border-b border-white/5 text-[10px] uppercase tracking-widest text-muted-foreground/50 font-mono">
                stdin / input
              </div>
              <textarea
                value={stdin}
                onChange={e => setStdin(e.target.value)}
                rows={3}
                placeholder="Enter input here (one value per line)…"
                spellCheck={false}
                className="w-full bg-transparent font-mono text-sm text-foreground/80 resize-none px-3 py-2 outline-none placeholder:text-muted-foreground/30"
              />
            </div>

            {/* Output */}
            <div className="flex-1 rounded-xl border border-border bg-[#1e1e1e] flex flex-col overflow-hidden min-h-0">
              <div className="px-3 py-2 border-b border-white/5 text-[10px] uppercase tracking-widest text-muted-foreground/50 font-mono shrink-0">
                output
              </div>
              <div ref={outputRef} className="flex-1 overflow-auto p-3 font-mono text-sm">
                {output === null ? (
                  <p className="text-muted-foreground/40 text-xs mt-1">
                    Press <span className="text-primary-glow">Run</span> to execute.
                  </p>
                ) : (
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={output[0]?.text}
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="space-y-0.5"
                    >
                      {output.map((line, i) => (
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
                      ))}
                    </motion.div>
                  </AnimatePresence>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
