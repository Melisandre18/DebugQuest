import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, ArrowLeft, Home, Gamepad2, Workflow, Menu, X } from "lucide-react";
import Logo from "@/components/Logo";
import { Button } from "@/components/ui/button";
import FeedbackDialog from "@/components/FeedbackDialog";
import { loadProgress } from "@/lib/progress";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";

interface TopNavProps {
  /** Optional extra slot rendered between logo block and right-side actions. */
  center?: React.ReactNode;
  /** Show "back to modes" button (used on Game). */
  backTo?: { to: string; label: string };
}

const STORAGE_KEY = "debugquest.progress.v1";

interface NavItem {
  label: string;
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  /** External-style hash links scroll to landing sections. */
  external?: boolean;
}
const STATIC_NAV_ITEMS: Omit<NavItem, "label">[] = [
  { to: "/",             icon: Home },
  { to: "/#how",         icon: Workflow, external: true },
  { to: "/modes",        icon: Gamepad2 },
  { to: "/trophies",     icon: Trophy },
];

/** Persistent app nav: logo + section links + live score chip + feedback. */
export default function TopNav({ center, backTo }: TopNavProps) {
  const { pathname, hash } = useLocation();
  const { t, language, setLanguage } = useLanguage();
  const [score, setScore] = useState<number>(() => loadProgress().totalScore);
  const [solved, setSolved] = useState<number>(() => loadProgress().solved.length);
  const [bump, setBump] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const refresh = () => {
      const p = loadProgress();
      setScore(prev => {
        if (p.totalScore !== prev) setBump(b => b + 1);
        return p.totalScore;
      });
      setSolved(p.solved.length);
    };
    const onStorage = (e: StorageEvent) => { if (e.key === STORAGE_KEY) refresh(); };
    window.addEventListener("storage", onStorage);
    window.addEventListener("debugquest:progress", refresh);
    const t = window.setInterval(refresh, 1500);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("debugquest:progress", refresh);
      window.clearInterval(t);
    };
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setMobileOpen(false); }, [pathname, hash]);

  const navItems: NavItem[] = STATIC_NAV_ITEMS.map((item) => ({
    ...item,
    label:
      item.to === "/" ? t.nav.home :
      item.to === "/#how" ? t.nav.howItWorks :
      item.to === "/modes" ? t.nav.modes :
      item.to === "/trophies" ? t.nav.trophies :
      item.to,
  }));

  function isActive(item: NavItem) {
    if (item.external) return false;
    if (item.to === "/") return pathname === "/";
    return pathname.startsWith(item.to);
  }

  function handleNavClick(item: NavItem) {
    if (item.external && item.to.startsWith("/#")) {
      // Handle hash links - scroll to section
      const sectionId = item.to.slice(2); // Remove "/#" prefix
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }, 0);
    } else {
      // For regular page navigation, scroll to top smoothly
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }, 0);
    }
  }

  return (
    <header className="border-b border-border/50 backdrop-blur-md sticky top-0 z-40 bg-background/80">
      <div className="container flex items-center justify-between py-3 gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <Logo />
          {center}
        </div>

        {/* Desktop nav links */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item);
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => handleNavClick(item)}
                className={cn(
                  "px-3 py-1.5 rounded-md text-sm font-medium transition-colors inline-flex items-center gap-1.5",
                  active
                    ? "bg-primary/10 text-primary-glow"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setLanguage(language === "en" ? "ka" : "en")}
            className="hidden sm:inline-flex items-center rounded-full border border-border bg-background px-3 py-1.5 text-sm font-medium transition-colors hover:bg-secondary/60 hover:text-foreground"
          >
            {language === "en" ? "KA" : "EN"}
          </button>

          {/* Score chip */}
          <Link
            to="/trophies"
            className="group relative inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent/5 pl-2 pr-3 py-1.5 hover:border-accent/70 hover:bg-accent/10 transition-colors"
            aria-label={t.nav.trophies}
          >
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gradient-accent text-accent-foreground shadow-glow-accent">
              <Trophy className="w-3.5 h-3.5" />
            </span>
            <AnimatePresence mode="popLayout">
              <motion.span
                key={`${score}-${bump}`}
                initial={{ y: -8, opacity: 0, scale: 0.9 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ y: 8, opacity: 0, scale: 0.9 }}
                transition={{ type: "spring", stiffness: 380, damping: 22 }}
                className="font-display font-bold text-sm tabular-nums text-gradient-accent"
              >
                {score.toLocaleString()}
              </motion.span>
            </AnimatePresence>
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground hidden lg:inline">
              {solved} {t.common.solved}
            </span>
          </Link>

          {/* Feedback */}
          <FeedbackDialog />

          {backTo && (
            <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
              <Link to={backTo.to}><ArrowLeft className="w-4 h-4 mr-1" /> {backTo.label}</Link>
            </Button>
          )}

          {pathname === "/" && (
            <Button asChild variant="hero" size="sm" className="hidden sm:inline-flex">
              <Link to="/modes"><Gamepad2 className="w-4 h-4 mr-1" /> {t.nav.play}</Link>
            </Button>
          )}

          {/* Mobile menu toggle */}
          <button
            type="button"
            onClick={() => setMobileOpen(v => !v)}
            className="md:hidden inline-flex items-center justify-center w-9 h-9 rounded-md border border-border bg-background hover:bg-secondary/60 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="md:hidden border-t border-border/60 overflow-hidden bg-background/95 backdrop-blur-md"
          >
            <nav className="container py-3 grid gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item);
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => {
                      handleNavClick(item);
                      setMobileOpen(false);
                    }}
                    className={cn(
                      "px-3 py-2 rounded-md text-sm font-medium transition-colors inline-flex items-center gap-2",
                      active
                        ? "bg-primary/10 text-primary-glow"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

/** Helper to fire when score updates so the nav refreshes instantly. */
export function notifyProgressChanged() {
  window.dispatchEvent(new CustomEvent("debugquest:progress"));
}
