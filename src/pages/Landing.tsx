import { Link } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import TopNav from "@/components/TopNav";
import {
  ArrowRight, Bug, Brain, Workflow, Trophy, Code2, Eye, Lightbulb, Network,
  Activity, Sparkles, GraduationCap, CheckCircle2,
} from "lucide-react";
import { DIFFICULTY_META } from "@/components/DifficultyMeta";
import { Difficulty } from "@/lib/puzzle-engine";

const features = [
  { icon: GraduationCap, title: "Learn first, then fix",       desc: "Every puzzle opens with a focused 60-second lesson on the underlying concept — then you apply it." },
  { icon: Bug,           title: "Real broken programs",        desc: "No syntax drills. Every level is a working program with a real, traceable defect." },
  { icon: Workflow,      title: "Blocks ↔ code, in sync",      desc: "Toggle visual blocks or read the same program in Python, JavaScript, C++ or Java." },
  { icon: Activity,      title: "Step-through execution",      desc: "Run, pause and step. Watch variables and control flow change line by line." },
  { icon: Lightbulb,     title: "Tiered hints",                desc: "From a gentle nudge to a full explanation — only when you ask, never spoiled by default." },
  { icon: Brain,         title: "Adaptive difficulty",         desc: "We track accuracy, time and hints used, and quietly tune the next puzzle to keep you in flow." },
];

const modes: Difficulty[] = ["easy", "medium", "hard", "adaptive"];

const STEPS: [string, string][] = [
  ["Read",        "Understand what the program is supposed to do."],
  ["Run",        "Step through it. Watch variables. Find where reality diverges."],
  ["Hypothesise", "Pick the fix you believe will work."],
  ["Test",        "Apply the fix and re-run. Did the output match?"],
  ["Reflect",     "Read the explanation. Lock the concept in."],
  ["Level up",    "Score, streak, and a slightly harder puzzle next."],
];

export default function Landing() {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <TopNav />

      <Hero />

      {/* HOW IT WORKS */}
      <section id="how" className="container py-20 scroll-mt-20">
        <div className="max-w-2xl mb-10">
          <div className="text-xs uppercase tracking-wider text-primary-glow font-mono mb-2">How it works</div>
          <h2 className="font-display text-3xl md:text-4xl font-bold">A learning loop, not a lecture.</h2>
          <p className="mt-3 text-muted-foreground">
            Every puzzle moves you through the same six steps — the actual workflow real programmers
            use when they debug.
          </p>
        </div>
        <ol className="grid md:grid-cols-3 gap-4">
          {STEPS.map(([title, desc], i) => (
            <motion.li
              key={title}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: i * 0.05 }}
              className="card-surface rounded-xl p-5 hover:border-primary/40 transition-colors"
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="font-mono text-xs text-primary-glow w-6 h-6 rounded-md border border-primary/40 inline-flex items-center justify-center">
                  {i + 1}
                </span>
                <h3 className="font-display font-semibold">{title}</h3>
              </div>
              <p className="text-sm text-muted-foreground">{desc}</p>
            </motion.li>
          ))}
        </ol>
      </section>

      {/* FEATURES */}
      <section id="features" className="container py-20 scroll-mt-20">
        <div className="max-w-2xl mb-10">
          <div className="text-xs uppercase tracking-wider text-primary-glow font-mono mb-2">Features</div>
          <h2 className="font-display text-3xl md:text-4xl font-bold">Built for understanding, not memorisation.</h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map(({ icon: Icon, title, desc }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ delay: i * 0.04 }}
              className="card-surface rounded-xl p-6 hover:border-primary/40 transition-colors"
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/30 inline-flex items-center justify-center text-primary-glow mb-4">
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="font-display font-semibold text-lg">{title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* MODES */}
      <section id="modes" className="container py-20 scroll-mt-20">
        <div className="max-w-2xl mb-10">
          <div className="text-xs uppercase tracking-wider text-primary-glow font-mono mb-2">Modes</div>
          <h2 className="font-display text-3xl md:text-4xl font-bold">Four ways to play.</h2>
          <p className="mt-3 text-muted-foreground">
            Pick a mode that fits your level — or let Adaptive Mode meet you where you are.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {modes.map((d, i) => {
            const m = DIFFICULTY_META[d];
            const Icon = m.icon;
            return (
              <motion.div
                key={d}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ delay: i * 0.05 }}
              >
                <Link
                  to={`/play/${d}`}
                  className="card-surface rounded-xl p-6 group hover:border-primary/40 hover:-translate-y-0.5 transition-all block h-full"
                >
                  <div className={`w-10 h-10 rounded-lg inline-flex items-center justify-center border ${m.chip} mb-4`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-display font-semibold text-lg">{m.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{m.tagline}</p>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    {m.bullets.map(b => <li key={b} className="flex gap-2"><span className={m.color}>›</span>{b}</li>)}
                  </ul>
                  <div className="mt-5 inline-flex items-center text-sm text-primary-glow opacity-80 group-hover:opacity-100 transition-opacity">
                    Start <ArrowRight className="ml-1 w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* CONCEPTS */}
      <section id="concepts" className="container pb-24 pt-4 scroll-mt-20">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="card-surface rounded-2xl p-8 md:p-12 relative overflow-hidden"
        >
          <div className="absolute inset-0 grid-bg opacity-15 [mask-image:linear-gradient(180deg,black,transparent)]" />
          <div className="relative grid md:grid-cols-2 gap-10 items-center">
            <div>
              <div className="text-xs uppercase tracking-wider text-accent font-mono mb-2">Pedagogy</div>
              <h2 className="font-display text-3xl md:text-4xl font-bold">
                Built on the science of <span className="text-gradient-accent">how programmers think.</span>
              </h2>
              <p className="mt-4 text-muted-foreground">
                Each puzzle exposes one of the foundational mental models — control flow,
                execution state, debugging strategy. The interface visualises what's usually
                invisible, so beginners build intuition the way experienced programmers do.
              </p>
              <Button asChild size="lg" variant="hero" className="mt-6">
                <Link to="/modes">Try it now <ArrowRight className="ml-1 w-4 h-4" /></Link>
              </Button>
            </div>
            <div className="grid gap-3">
              {[
                ["Control Flow Graphs", "Highlighted paths show which branches actually run."],
                ["Execution Models", "Step-by-step variable snapshots make abstract state concrete."],
                ["Debugging Strategy", "Trace → Isolate → Fix — the same loop pros use."],
              ].map(([t, d], i) => (
                <motion.div
                  key={t}
                  initial={{ opacity: 0, x: 16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="rounded-lg p-4 border border-border bg-card/40 hover:border-accent/40 transition-colors"
                >
                  <div className="font-display font-semibold">{t}</div>
                  <div className="text-sm text-muted-foreground mt-0.5">{d}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      <footer className="border-t border-border/50 py-8 mt-auto">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-3 text-sm text-muted-foreground">
          <span>Learn to think like a programmer, one bug at a time.</span>
          <span className="font-mono text-xs opacity-70">// 0 bugs survive · DebugQuest</span>
        </div>
      </footer>
    </div>
  );
}

/* ---------------- Hero (toned down) ---------------- */

function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-hero border-b border-border/50">
      <div className="absolute inset-0 grid-bg opacity-20 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />
      <div className="absolute -top-32 -right-32 w-[420px] h-[420px] rounded-full bg-primary/15 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-[360px] h-[360px] rounded-full bg-accent/10 blur-3xl pointer-events-none" />

      <div className="container py-16 md:py-20 relative grid lg:grid-cols-[1.1fr_1fr] gap-10 items-center">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/5 text-primary-glow text-xs font-medium mb-5">
            <span className="relative inline-flex w-1.5 h-1.5 rounded-full bg-primary" />
            Learn programming by debugging real code
          </span>

          <h1 className="font-display font-bold text-4xl md:text-6xl tracking-tight leading-[1.05]">
            Don't write code.
            <br />
            <span className="text-gradient-primary">Fix it.</span>
          </h1>

          <p className="mt-5 text-base md:text-lg text-muted-foreground max-w-xl">
            DebugQuest teaches computational thinking through guided debugging. Each level pairs a
            short concept lesson with a real broken program — read it, run it, fix it, learn why.
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <Button asChild size="xl" variant="hero">
              <Link to="/modes">
                Start playing <ArrowRight className="ml-1 w-5 h-5" />
              </Link>
            </Button>
            <Button asChild size="xl" variant="outline">
              <a href="#how">How it works</a>
            </Button>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-success" /> 4 difficulty modes</span>
            <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-success" /> Python · JS · C++ · Java</span>
            <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-success" /> No signup required</span>
          </div>
        </motion.div>

        {/* Static preview card — calmer than the previous interactive demo */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="card-surface rounded-2xl p-1.5 shadow-glow-primary"
        >
          <div className="code-surface rounded-xl overflow-hidden text-sm">
            <div className="flex items-center gap-2 px-4 py-2 border-b border-border bg-code-line/60">
              <div className="flex gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-destructive/70" />
                <span className="w-2.5 h-2.5 rounded-full bg-accent/70" />
                <span className="w-2.5 h-2.5 rounded-full bg-success/70" />
              </div>
              <span className="text-xs font-mono text-muted-foreground ml-2">countdown.py</span>
              <span className="ml-auto text-[10px] uppercase tracking-wider text-destructive/80">bug detected</span>
            </div>
            <pre className="p-5 leading-7 text-[13px] font-mono">
{`n = 3
while n > 0:
    print(n)
    `}<span className="bg-destructive/15 text-code-bug px-1 rounded">n = n + 1</span>{`   # 🐞 never ends`}
            </pre>
            <div className="border-t border-border bg-code-line/40 px-4 py-3 text-xs flex items-center justify-between">
              <span className="text-muted-foreground inline-flex items-center gap-1.5">
                <Lightbulb className="w-3.5 h-3.5 text-accent" /> Hint: which direction is n moving?
              </span>
              <span className="text-primary-glow font-mono">step 4 / ∞</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
