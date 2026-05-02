const KEY = "debugquest.userId";

// Returns a stable UUID for this browser session.
// Replaced with real auth later — callers never need to change.
export function getUserId(): string {
  let id = localStorage.getItem(KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(KEY, id);
  }
  return id;
}
