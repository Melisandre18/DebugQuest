import { Difficulty } from "@/lib/puzzle-engine";
import { Sparkles, Zap, Flame, Cpu } from "lucide-react";
import { cn } from "@/lib/utils";

export const DIFFICULTY_META: Record<Difficulty, {
  title: string; tagline: string; icon: any; color: string; ring: string; chip: string;
  bullets: string[];
}> = {
  easy: {
    title: "Easy", tagline: "First steps in debugging",
    icon: Sparkles, color: "text-difficulty-easy", ring: "ring-difficulty-easy/40",
    chip: "bg-difficulty-easy/10 text-difficulty-easy border-difficulty-easy/30",
    bullets: ["Sequence & basic if-statements", "Strong, friendly hints", "Visual block focus"],
  },
  medium: {
    title: "Medium", tagline: "Loops and variables enter the chat",
    icon: Zap, color: "text-difficulty-medium", ring: "ring-difficulty-medium/40",
    chip: "bg-difficulty-medium/10 text-difficulty-medium border-difficulty-medium/30",
    bullets: ["Loops, off-by-one, infinite loops", "Limited hint tiers", "Code + blocks side by side"],
  },
  hard: {
    title: "Hard", tagline: "Real-world tangled logic",
    icon: Flame, color: "text-difficulty-hard", ring: "ring-difficulty-hard/40",
    chip: "bg-difficulty-hard/10 text-difficulty-hard border-difficulty-hard/30",
    bullets: ["Nested conditions, multiple variables", "Minimal hints", "Subtle correctness bugs"],
  },
  adaptive: {
    title: "Adaptive", tagline: "The platform tunes itself to you",
    icon: Cpu, color: "text-difficulty-adaptive", ring: "ring-difficulty-adaptive/40",
    chip: "bg-difficulty-adaptive/10 text-difficulty-adaptive border-difficulty-adaptive/30",
    bullets: ["Tracks accuracy, time, hints", "Scales up when you're confident", "Eases back when you struggle"],
  },
};

export function DifficultyBadge({ d, className }: { d: Difficulty; className?: string }) {
  const m = DIFFICULTY_META[d];
  const Icon = m.icon;
  return (
    <span className={cn("inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-xs font-medium", m.chip, className)}>
      <Icon className="w-3 h-3" /> {m.title}
    </span>
  );
}
