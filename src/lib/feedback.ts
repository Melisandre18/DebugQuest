const KEY = "debugquest.feedback.v1";

export type FeedbackContext = "general" | "puzzle";
export interface FeedbackEntry {
  id: string;
  context: FeedbackContext;
  rating: 1 | 2 | 3 | 4 | 5;
  category: string;
  message: string;
  puzzleId?: string;
  route?: string;
  at: number;
}

export function loadFeedback(): FeedbackEntry[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function submitFeedback(entry: Omit<FeedbackEntry, "id" | "at">): FeedbackEntry {
  const full: FeedbackEntry = {
    ...entry,
    id: `fb_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
    at: Date.now(),
  };
  const list = loadFeedback();
  list.push(full);
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch { /* quota — silent */ }
  return full;
}

/** POSTs the entry to the backend so it is emailed to the owner. */
export async function sendFeedbackToServer(entry: Omit<FeedbackEntry, "id" | "at">): Promise<void> {
  await fetch("/api/feedback", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(entry),
  });
}

export const FEEDBACK_CATEGORIES = ["Bug", "Idea", "Difficulty", "Praise", "Other"] as const;
