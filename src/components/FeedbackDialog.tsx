import { useState } from "react";
import { useLocation } from "react-router-dom";
import { MessageSquare, Star, Send } from "lucide-react";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { FEEDBACK_CATEGORIES, FeedbackContext, submitFeedback, sendFeedbackToServer } from "@/lib/feedback";
import { useLanguage } from "@/contexts/LanguageContext";

interface Props {
  context?: FeedbackContext;
  puzzleId?: string;
  trigger?: React.ReactNode;
  triggerLabel?: string;
}

export default function FeedbackDialog({
  context = "general",
  puzzleId,
  trigger,
  triggerLabel = "Feedback",
}: Props) {
  const { pathname } = useLocation();
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState<1 | 2 | 3 | 4 | 5>(5);
  const [category, setCategory] = useState<string>(context === "puzzle" ? "Difficulty" : "Idea");
  const [message, setMessage] = useState("");
  const [senderName, setSenderName] = useState("");
  const [senderEmail, setSenderEmail] = useState("");

  function reset() {
    setRating(5);
    setCategory(context === "puzzle" ? "Difficulty" : "Idea");
    setMessage("");
    setSenderName("");
    setSenderEmail("");
  }

  function handleSubmit() {
    if (message.trim().length < 3) {
      toast.error("Please write a few words so we can act on it.");
      return;
    }

    const entry = {
      context,
      rating,
      category,
      message: message.trim(),
      puzzleId,
      route: pathname,
      senderName: senderName.trim() || undefined,
      senderEmail: senderEmail.trim() || undefined,
    };

    // Save locally immediately
    submitFeedback(entry);
    // Fire-and-forget to backend (non-blocking)
    sendFeedbackToServer(entry);

    // Close and confirm right away — don't make the user wait for the email
    setOpen(false);
    reset();
    toast.success("Thanks for your feedback!", {
      description: "Your message has been sent.",
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="ghost" size="sm" className="gap-1.5">
            <MessageSquare className="w-4 h-4" />
            <span className="hidden sm:inline">{triggerLabel}</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary-glow" />
            {context === "puzzle" ? t.feedback.feedbackOnPuzzle : t.feedback.sendFeedback}
          </DialogTitle>
          <DialogDescription>
            {t.feedback.feedbackDesc}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Optional sender info */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs uppercase tracking-wider text-muted-foreground">Name (optional)</label>
              <Input
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                placeholder="Your name"
                className="mt-1.5 h-8 text-sm"
                maxLength={80}
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider text-muted-foreground">Email (optional)</label>
              <Input
                type="email"
                value={senderEmail}
                onChange={(e) => setSenderEmail(e.target.value)}
                placeholder="for a reply"
                className="mt-1.5 h-8 text-sm"
                maxLength={120}
              />
            </div>
          </div>

          {/* Rating */}
          <div>
            <label className="text-xs uppercase tracking-wider text-muted-foreground">{t.common.rating}</label>
            <div className="mt-1.5 flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setRating(n as 1 | 2 | 3 | 4 | 5)}
                  className={cn(
                    "p-1.5 rounded-md transition-all hover:scale-110",
                    n <= rating ? "text-accent" : "text-muted-foreground/40 hover:text-muted-foreground"
                  )}
                  aria-label={`${n} star${n > 1 ? "s" : ""}`}
                >
                  <Star className="w-5 h-5" fill={n <= rating ? "currentColor" : "none"} />
                </button>
              ))}
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="text-xs uppercase tracking-wider text-muted-foreground">Category</label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="mt-1.5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FEEDBACK_CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Message */}
          <div>
            <label className="text-xs uppercase tracking-wider text-muted-foreground">
              {context === "puzzle" ? "Your thoughts on this puzzle" : "What's on your mind?"}
            </label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={context === "puzzle" ? t.feedback.puzzleQuestion : t.feedback.generalQuestion}
              rows={4}
              className="mt-1.5 resize-none"
              maxLength={600}
            />
            <div className="text-[11px] text-muted-foreground mt-1 text-right">
              {message.length} / 600
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>{t.common.cancel}</Button>
          <Button variant="hero" onClick={handleSubmit}>
            <Send className="w-4 h-4 mr-1" /> {t.common.send}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
