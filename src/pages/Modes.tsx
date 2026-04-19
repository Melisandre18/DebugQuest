import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import TopNav from "@/components/TopNav";
import { DIFFICULTY_META } from "@/components/DifficultyMeta";
import { Difficulty, LANGUAGES } from "@/lib/puzzle-engine";
import { loadProgress, ACHIEVEMENTS } from "@/lib/progress";
import { ArrowRight, Trophy, Award, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const modes: Difficulty[] = ["easy", "medium", "hard", "adaptive"];

export default function Modes() {
  const progress = loadProgress();
  const navigate = useNavigate();
  const [selectedMode, setSelectedMode] = useState<Difficulty | null>(null);

  const handleModeSelect = (mode: Difficulty) => {
    setSelectedMode(mode);
  };

  const handleLanguageSelect = (language: string) => {
    if (selectedMode) {
      navigate(`/play/${selectedMode}/${language}`);
      setSelectedMode(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <TopNav />

      <main className="container py-12 md:py-16 flex-1">
        <div className="max-w-3xl">
          <div className="text-xs uppercase tracking-wider text-primary-glow font-mono mb-2">Modes</div>
          <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight">Choose your mode</h1>
          <p className="mt-3 text-muted-foreground">
            Each mode introduces new bug types and fewer safety nets. Adaptive Mode picks for you,
            based on how you've been playing.
          </p>
        </div>

        <div className="mt-10 grid md:grid-cols-2 gap-5">
          {modes.map((d) => {
            const m = DIFFICULTY_META[d];
            const Icon = m.icon;
            return (
              <button
                key={d}
                onClick={() => handleModeSelect(d)}
                className="card-surface rounded-2xl p-6 group hover:border-primary/40 hover:-translate-y-0.5 transition-all relative overflow-hidden text-left"
              >
                <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full opacity-10 blur-2xl bg-primary" />
                <div className="flex items-start justify-between">
                  <div className={`w-12 h-12 rounded-xl inline-flex items-center justify-center border ${m.chip}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className={`text-xs font-mono uppercase tracking-wider ${m.color}`}>{m.title}</span>
                </div>
                <h2 className="font-display text-2xl font-bold mt-4">{m.tagline}</h2>
                <ul className="mt-4 space-y-1.5 text-sm text-muted-foreground">
                  {m.bullets.map(b => <li key={b} className="flex gap-2"><span className={m.color}>›</span>{b}</li>)}
                </ul>
                <div className="mt-6 inline-flex items-center text-sm font-medium text-primary-glow">
                  Continue <ArrowRight className="ml-1 w-4 h-4 transition-transform group-hover:translate-x-1" />
                </div>
              </button>
            );
          })}
        </div>

        {/* Language Selection Modal */}
        {selectedMode && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="card-surface rounded-2xl p-8 max-w-md w-full mx-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display text-2xl font-bold">Select your language</h2>
                <button
                  onClick={() => setSelectedMode(null)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Both the learn and debug sections will be shown in your chosen language.
              </p>
              <div className="space-y-2">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.id}
                    onClick={() => handleLanguageSelect(lang.id)}
                    className="w-full text-left px-4 py-3 rounded-lg border border-border bg-card/40 hover:bg-primary/10 hover:border-primary/40 transition-all"
                  >
                    <span className="font-medium">{lang.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Progress strip */}
        <section className="mt-14">
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="w-5 h-5 text-accent" />
            <h2 className="font-display text-xl font-semibold">Your progress</h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="card-surface rounded-xl p-5">
              <div className="text-xs uppercase tracking-wider text-muted-foreground">Total score</div>
              <div className="font-display text-3xl font-bold text-gradient-primary mt-1">{progress.totalScore}</div>
            </div>
            <div className="card-surface rounded-xl p-5">
              <div className="text-xs uppercase tracking-wider text-muted-foreground">Puzzles solved</div>
              <div className="font-display text-3xl font-bold mt-1">{progress.solved.length}</div>
            </div>
            <div className="card-surface rounded-xl p-5">
              <div className="text-xs uppercase tracking-wider text-muted-foreground">Attempts</div>
              <div className="font-display text-3xl font-bold mt-1">{progress.attempts.length}</div>
            </div>
          </div>

          <div className="mt-6 card-surface rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Award className="w-4 h-4 text-accent" />
              <h3 className="font-display font-semibold">Achievements</h3>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {Object.entries(ACHIEVEMENTS).map(([code, a]) => {
                const unlocked = progress.achievements.includes(code);
                return (
                  <div key={code} className={`rounded-lg p-3 border flex gap-3 items-center ${unlocked ? "border-accent/40 bg-accent/5" : "border-border bg-card/40 opacity-60"}`}>
                    <div className={`w-9 h-9 rounded-md inline-flex items-center justify-center text-xs font-bold ${unlocked ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"}`}>★</div>
                    <div>
                      <div className="font-display text-sm font-semibold">{a.title}</div>
                      <div className="text-xs text-muted-foreground">{a.desc}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
