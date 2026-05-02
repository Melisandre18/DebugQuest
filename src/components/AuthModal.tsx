import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultTab?: "login" | "register";
}

const USERNAME_RE = /^[a-zA-Z0-9_]+$/;

function validateUsername(value: string): string | null {
  if (value.length < 3)          return "At least 3 characters";
  if (value.length > 20)         return "At most 20 characters";
  if (!USERNAME_RE.test(value))  return "Letters, numbers, and underscores only";
  return null;
}

export default function AuthModal({ open, onOpenChange, defaultTab = "login" }: Props) {
  const { register, login } = useAuth();
  const [tab, setTab]               = useState<"login" | "register">(defaultTab);
  const [username, setUsername]     = useState("");
  const [password, setPassword]     = useState("");
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [error, setError]           = useState<string | null>(null);
  const [loading, setLoading]       = useState(false);

  function handleUsernameChange(value: string) {
    setUsername(value);
    // Validate live only while registering and user has typed enough to care
    if (tab === "register" && value.length > 0) {
      setUsernameError(validateUsername(value));
    } else {
      setUsernameError(null);
    }
  }

  function switchTab(next: "login" | "register") {
    setTab(next);
    setError(null);
    setUsernameError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (tab === "register") {
      const err = validateUsername(username);
      if (err) { setUsernameError(err); return; }
    }

    setLoading(true);
    try {
      if (tab === "register") await register(username, password);
      else                    await login(username, password);
      onOpenChange(false);
      setUsername(""); setPassword(""); setUsernameError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{tab === "login" ? "Sign in" : "Create account"}</DialogTitle>
        </DialogHeader>

        {/* Tab toggle */}
        <div className="flex rounded-lg border border-border overflow-hidden text-sm font-medium">
          <button
            type="button"
            onClick={() => switchTab("login")}
            className={cn(
              "flex-1 py-2 transition-colors",
              tab === "login"
                ? "bg-primary/10 text-primary-glow"
                : "text-muted-foreground hover:bg-secondary/60"
            )}
          >
            Sign in
          </button>
          <button
            type="button"
            onClick={() => switchTab("register")}
            className={cn(
              "flex-1 py-2 border-l border-border transition-colors",
              tab === "register"
                ? "bg-primary/10 text-primary-glow"
                : "text-muted-foreground hover:bg-secondary/60"
            )}
          >
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mt-1">
          {/* Username */}
          <div className="space-y-1.5">
            <Label htmlFor="auth-username">Username</Label>
            <Input
              id="auth-username"
              type="text"
              autoComplete="username"
              placeholder="your_username"
              value={username}
              onChange={e => handleUsernameChange(e.target.value)}
              required
              maxLength={20}
              className={cn(usernameError && "border-destructive focus-visible:ring-destructive")}
            />
            {tab === "register" && (
              <p className={cn("text-xs", usernameError ? "text-destructive" : "text-muted-foreground")}>
                {usernameError ?? "3–20 characters · letters, numbers, underscores"}
              </p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <Label htmlFor="auth-password">Password</Label>
            <Input
              id="auth-password"
              type="password"
              autoComplete={tab === "register" ? "new-password" : "current-password"}
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={6}
            />
            {tab === "register" && (
              <p className="text-xs text-muted-foreground">At least 6 characters</p>
            )}
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button
            variant="hero"
            type="submit"
            className="w-full"
            disabled={loading || (tab === "register" && !!usernameError)}
          >
            {loading ? "Please wait…" : tab === "login" ? "Sign in" : "Create account"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
