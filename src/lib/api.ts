// Frontend client for the Express backend (server/).
// Falls back silently — localStorage progress is still the source of truth
// until a real auth system replaces the mock userId.

const SERVER_URL = (import.meta.env.VITE_SERVER_URL as string | undefined) ?? "http://localhost:5000";

export interface AttemptPayload {
  userId: string;
  challengeId: string;
  score: number;
  time: number;        // seconds
  hintsUsed: number;
  bugType: string;
  correct: boolean;
  difficulty: string;
  language?: string;
  performance?: number; // 0.10–1.0 from computePerformance()
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
    // Non-blocking: if the server is unreachable the game continues normally
  }
}
