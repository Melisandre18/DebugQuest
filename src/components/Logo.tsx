import { Bug, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

export default function Logo({ to = "/" }: { to?: string }) {
  return (
    <Link to={to} className="inline-flex items-center gap-2 group">
      <span className="relative inline-flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-primary text-primary-foreground shadow-glow-primary">
        <Bug className="w-5 h-5" strokeWidth={2.5} />
        <Sparkles className="w-3 h-3 absolute -top-1 -right-1 text-accent animate-glow-pulse" />
      </span>
      <span className="font-display font-bold text-lg tracking-tight">
        Debug<span className="text-gradient-primary">Quest</span>
      </span>
    </Link>
  );
}
