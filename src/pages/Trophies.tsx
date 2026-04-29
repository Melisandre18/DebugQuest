import { useMemo, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Bar, BarChart, CartesianGrid, Cell, Line, LineChart, ResponsiveContainer,
  Tooltip, XAxis, YAxis,
} from "recharts";
import {
  Trophy, Award, Target, Clock, Lightbulb, Flame, Zap, Activity, ArrowRight,
  CheckCircle2, XCircle, Globe, Trash2, AlertTriangle,
} from "lucide-react";
import TopNav from "@/components/TopNav";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ACHIEVEMENTS, loadProgress, resetProgress } from "@/lib/progress";
import { usePuzzleCounts } from "@/lib/puzzle-service";
import { LANGUAGES, type Language } from "@/lib/puzzle-engine";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Trophies() {
  const progress = loadProgress();
  const { t } = useLanguage();
  const a = progress.attempts;
  const { data: puzzleCounts } = usePuzzleCounts();
  const [selectedLang, setSelectedLang] = useState<Language | "all">("all");

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // Filter attempts by selected language ("all" = no filter)
  const filtered = useMemo(
    () => selectedLang === "all" ? a : a.filter(x => x.language === selectedLang),
    [a, selectedLang]
  );

  const filteredScore = useMemo(
    () => filtered.filter(x => x.correct).reduce((s, x) => s + x.score, 0),
    [filtered]
  );

  const stats = useMemo(() => {
    const correct = filtered.filter(x => x.correct);
    // Accuracy: quality of answers — deducted for wrong attempts and hints used
    const quality = (x: typeof filtered[0]) => Math.max(0, 100 - (x.attempts - 1) * 30 - x.hintsUsed * 15);
    const accuracy = filtered.length ? Math.round(filtered.reduce((s, x) => s + quality(x), 0) / filtered.length) : 0;
    const avgTime = correct.length
      ? Math.round(correct.reduce((s, x) => s + x.timeMs, 0) / correct.length / 100) / 10
      : 0;
    const avgHints = filtered.length ? Math.round((filtered.reduce((s, x) => s + x.hintsUsed, 0) / filtered.length) * 10) / 10 : 0;
    const best = correct.reduce((m, x) => Math.max(m, x.score), 0);
    let bestStreak = 0, cur = 0;
    filtered.forEach(x => { if (x.correct && x.attempts === 1) { cur++; bestStreak = Math.max(bestStreak, cur); } else cur = 0; });
    return { accuracy, avgTime, avgHints, best, bestStreak };
  }, [filtered]);

  const scoreSeries = useMemo(() => {
    let running = 0;
    return filtered.map((x, i) => {
      running += x.correct ? x.score : 0;
      return { i: i + 1, score: running, gain: x.correct ? x.score : 0 };
    });
  }, [filtered]);

  const byDifficulty = useMemo(() => {
    const totals = puzzleCounts ?? { easy: 0, medium: 0, hard: 0 };
    const counts: Record<string, { difficulty: string; solved: number; total: number; fill: string }> = {
      easy:   { difficulty: "Easy",   solved: 0, total: totals.easy   ?? 0, fill: "hsl(var(--diff-easy))" },
      medium: { difficulty: "Medium", solved: 0, total: totals.medium ?? 0, fill: "hsl(var(--diff-medium))" },
      hard:   { difficulty: "Hard",   solved: 0, total: totals.hard   ?? 0, fill: "hsl(var(--diff-hard))" },
    };
    // Derive solved from filtered correct attempts (so language filter applies)
    // Use stored difficulty field; fall back to ID prefix for legacy records.
    const seenIds = new Set<string>();
    filtered.filter(x => x.correct).forEach(x => {
      if (seenIds.has(x.puzzleId)) return;
      seenIds.add(x.puzzleId);
      const diff = x.difficulty
        ?? (x.puzzleId.startsWith("easy") ? "easy"
          : x.puzzleId.startsWith("med") ? "medium"
          : x.puzzleId.startsWith("hard") ? "hard"
          : null);
      if (diff === "easy")   counts.easy.solved++;
      else if (diff === "medium") counts.medium.solved++;
      else if (diff === "hard")   counts.hard.solved++;
    });
    return Object.values(counts);
  }, [filtered, puzzleCounts]);

  const recent = filtered.slice(-8).reverse();

  const totalUnlocks = Object.keys(ACHIEVEMENTS).length;
  const unlocked = progress.achievements.length;

  return (
    <div className="min-h-screen flex flex-col">
      <TopNav backTo={{ to: "/modes", label: t.nav.modes }} />

      <main className="container py-10 md:py-14 flex-1">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative card-surface rounded-2xl p-6 md:p-10 overflow-hidden"
        >
          <div className="absolute inset-0 grid-bg opacity-20 [mask-image:radial-gradient(ellipse_at_top_right,black,transparent_70%)]" />
          <div className="absolute -right-10 -top-10 w-72 h-72 rounded-full bg-accent/20 blur-3xl animate-glow-pulse" />
          <div className="relative flex flex-wrap items-end justify-between gap-6">
            <div>
              <div className="flex flex-wrap items-center gap-3 mb-1">
                <div className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-accent">
                  <Trophy className="w-3.5 h-3.5" /> {t.trophies.trophyRoom}
                </div>
                <div className="inline-flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-muted-foreground" />
                  <Select value={selectedLang} onValueChange={(v) => setSelectedLang(v as Language | "all")}>
                    <SelectTrigger className="h-7 w-[150px] text-xs font-mono border-border/60">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all" className="text-xs">{t.trophiesUI.allLanguages}</SelectItem>
                      {LANGUAGES.map(l => (
                        <SelectItem key={l.id} value={l.id} className="font-mono text-xs">{l.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <h1 className="font-display text-4xl md:text-6xl font-bold tracking-tight mt-2">
                <span className="text-gradient-accent">{filteredScore.toLocaleString()}</span>
                <span className="text-muted-foreground text-2xl md:text-3xl ml-2">{t.trophies.pointsUnit}</span>
              </h1>
              <p className="mt-2 text-muted-foreground">
                {t.trophies.subtitle}
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <Button asChild variant="hero" size="lg">
                  <Link to="/modes">{t.trophies.earnMorePoints} <ArrowRight className="ml-1 w-4 h-4" /></Link>
                </Button>
                {a.length > 0 && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="lg">
                        <Trash2 className="w-4 h-4 mr-2" /> {t.trophiesUI.resetProgress}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="max-w-md">
                      <AlertDialogHeader>
                        <div className="flex items-center gap-3 mb-1">
                          <div className="w-10 h-10 rounded-xl bg-destructive/10 border border-destructive/30 flex items-center justify-center shrink-0">
                            <AlertTriangle className="w-5 h-5 text-destructive" />
                          </div>
                          <AlertDialogTitle className="text-xl">Reset all progress?</AlertDialogTitle>
                        </div>
                        <AlertDialogDescription className="text-sm text-muted-foreground leading-relaxed">
                          This will permanently erase your <span className="text-foreground font-medium">score</span>, <span className="text-foreground font-medium">solved puzzles</span>, and <span className="text-foreground font-medium">all achievements</span>. There is no way to undo this.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter className="gap-2 sm:gap-2">
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90 gap-2"
                          onClick={() => { resetProgress(); location.reload(); }}
                        >
                          <Trash2 className="w-4 h-4" /> Reset everything
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 min-w-[260px]">
              <KPI icon={Target}   label={t.trophiesUI.accuracy}    value={`${stats.accuracy}%`} tone="primary" />
              <KPI icon={Clock}    label={t.trophiesUI.avgTime}     value={filtered.length ? `${stats.avgTime}s` : "—"} tone="accent" />
              <KPI icon={Lightbulb} label={t.trophiesUI.avgHints}   value={filtered.length ? stats.avgHints : "—"} tone="accent" />
              <KPI icon={Flame}    label={t.trophiesUI.bestStreak} value={stats.bestStreak} tone="primary" />
            </div>
          </div>
        </motion.div>

        {filtered.length === 0 ? (
          <EmptyState t={t} />
        ) : (
          <>
            {/* Score over time + difficulty */}
            <div className="grid lg:grid-cols-[1.6fr_1fr] gap-5 mt-6">
              <Panel title={t.trophiesUI.scoreOverTime} icon={Activity}>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={scoreSeries} margin={{ top: 5, right: 12, bottom: 0, left: -12 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} />
                      <XAxis dataKey="i" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
                      <Tooltip
                        contentStyle={{
                          background: "hsl(var(--popover))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: 8,
                          fontSize: 12,
                        }}
                        labelFormatter={(l) => `${t.trophies.attemptNumber}${l}`}
                      />
                      <Line
                        type="monotone"
                        dataKey="score"
                        stroke="hsl(var(--primary))"
                        strokeWidth={2.5}
                        dot={{ r: 3, fill: "hsl(var(--primary))" }}
                        activeDot={{ r: 5 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Panel>

              <Panel title={t.trophiesUI.solvedByDifficulty} icon={Zap}>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={byDifficulty} margin={{ top: 5, right: 12, bottom: 0, left: -12 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} />
                      <XAxis dataKey="difficulty" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} allowDecimals={false} />
                      <Tooltip
                        contentStyle={{
                          background: "hsl(var(--popover))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: 8,
                          fontSize: 12,
                        }}
                        formatter={(v: number, _n, p) => [`${v} / ${(p.payload as { total: number }).total}`, "Solved"]}
                      />
                      <Bar dataKey="solved" radius={[6, 6, 0, 0]}>
                        {byDifficulty.map((d) => <Cell key={d.difficulty} fill={d.fill} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
                  {byDifficulty.map(d => (
                    <div key={d.difficulty} className="rounded-md bg-card/40 border border-border p-2">
                      <div className="font-display font-semibold" style={{ color: d.fill }}>{d.difficulty}</div>
                      <div className="text-muted-foreground">{d.solved} / {d.total}</div>
                    </div>
                  ))}
                </div>
              </Panel>
            </div>

            {/* Achievements + Recent */}
            <div className="grid lg:grid-cols-[1fr_1fr] gap-5 mt-6">
              <Panel
                title="Achievements"
                icon={Award}
                right={<span className="text-xs text-muted-foreground">{unlocked} / {totalUnlocks}</span>}
              >
                <Progress value={(unlocked / totalUnlocks) * 100} className="mb-4 h-2" />
                <div className="grid sm:grid-cols-2 gap-2.5">
                  {Object.entries(ACHIEVEMENTS).map(([code, ach]) => {
                    const got = progress.achievements.includes(code);
                    return (
                      <motion.div
                        key={code}
                        whileHover={{ y: -2 }}
                        className={cn(
                          "rounded-lg p-3 border flex gap-3 items-center transition-all",
                          got
                            ? "border-accent/50 bg-accent/5 shadow-glow-accent"
                            : "border-border bg-card/30 opacity-60"
                        )}
                      >
                        <div className={cn(
                          "w-10 h-10 rounded-lg inline-flex items-center justify-center text-base font-bold shrink-0",
                          got ? "bg-gradient-accent text-accent-foreground" : "bg-muted text-muted-foreground"
                        )}>
                          {got ? "★" : "☆"}
                        </div>
                        <div className="min-w-0">
                          <div className="font-display text-sm font-semibold truncate">{ach.title}</div>
                          <div className="text-xs text-muted-foreground">{ach.desc}</div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </Panel>

              <Panel title={t.trophiesUI.recentAttempts} icon={Clock}>
                <div className="space-y-2 max-h-80 overflow-auto pr-1">
                  {recent.map((r, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between gap-3 rounded-md border border-border bg-card/30 p-2.5 text-sm"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        {r.correct
                          ? <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
                          : <XCircle className="w-4 h-4 text-destructive shrink-0" />}
                        <span className="text-xs text-muted-foreground truncate">{r.puzzleTitle ?? r.puzzleId}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground shrink-0">
                        <span>{(r.timeMs / 1000).toFixed(1)}s</span>
                        <span>{r.hintsUsed} 💡</span>
                        <span className={cn("font-mono font-semibold", r.correct ? "text-accent" : "text-muted-foreground")}>
                          {r.correct ? `+${r.score}` : "—"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </Panel>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

function KPI({
  icon: Icon, label, value, tone,
}: { icon: React.ElementType; label: string; value: React.ReactNode; tone: "primary" | "accent" }) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className={cn(
        "rounded-xl border bg-card/50 p-3.5",
        tone === "primary" ? "border-primary/30" : "border-accent/30"
      )}
    >
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
        <Icon className={cn("w-3 h-3", tone === "primary" ? "text-primary-glow" : "text-accent")} />
        {label}
      </div>
      <div className="font-display text-2xl font-bold mt-1 tabular-nums">{value}</div>
    </motion.div>
  );
}

function Panel({
  title, icon: Icon, right, children,
}: { title: string; icon: React.ElementType; right?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="card-surface rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display font-semibold inline-flex items-center gap-2">
          <Icon className="w-4 h-4 text-primary-glow" /> {title}
        </h2>
        {right}
      </div>
      {children}
    </div>
  );
}

function EmptyState({ t }: { t: ReturnType<typeof useLanguage>["t"] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="card-surface rounded-2xl p-10 mt-6 text-center"
    >
      <div className="inline-flex w-14 h-14 rounded-2xl bg-gradient-accent text-accent-foreground items-center justify-center shadow-glow-accent animate-bounce-soft">
        <Trophy className="w-7 h-7" />
      </div>
      <h2 className="font-display text-2xl font-bold mt-4">{t.trophiesUI.noTrophies}</h2>
      <p className="text-muted-foreground mt-1 max-w-md mx-auto">
        {t.trophiesUI.noTrophiesDesc}
      </p>
      <Button asChild variant="hero" size="lg" className="mt-5">
        <Link to="/modes">{t.trophies.startFirstPuzzle} <ArrowRight className="ml-1 w-4 h-4" /></Link>
      </Button>
    </motion.div>
  );
}
