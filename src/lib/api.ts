const SERVER_URL = (import.meta.env.VITE_SERVER_URL as string | undefined) ?? "http://localhost:5000";

// ─── Attempt logging ──────────────────────────────────────────────────────────

export interface AttemptPayload {
  userId: string;
  challengeId: string;
  score: number;
  time: number;
  hintsUsed: number;
  bugType: string;
  correct: boolean;
  difficulty: string;
  language?: string;
  performance?: number;
  retriesCount: number;
}

export async function logAttempt(payload: AttemptPayload): Promise<void> {
  try {
    await fetch(`${SERVER_URL}/api/attempt`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch {
    // Fire-and-forget — game continues if server is unreachable
  }
}

// ─── Progress (DB-backed for logged-in users) ─────────────────────────────────

export interface DbAttempt {
  id: string;
  challengeId: string;
  bugType: string;
  difficulty: string;
  language: string | null;
  correct: boolean;
  score: number;
  time: number;        // seconds
  hintsUsed: number;
  retriesCount: number;
  performance: number | null;
  createdAt: string;   // ISO string
}

export async function fetchUserProgress(userId: string): Promise<DbAttempt[]> {
  const res = await fetch(`${SERVER_URL}/api/progress?userId=${encodeURIComponent(userId)}`);
  if (!res.ok) throw new Error("Failed to fetch progress");
  return res.json();
}

export async function deleteUserProgress(userId: string): Promise<void> {
  await fetch(`${SERVER_URL}/api/progress?userId=${encodeURIComponent(userId)}`, {
    method: "DELETE",
  });
}
