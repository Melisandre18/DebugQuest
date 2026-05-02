const AUTH_KEY = "debugquest.auth";
const UUID_KEY = "debugquest.userId";

// Returns the authenticated user's ID when signed in,
// otherwise a stable anonymous UUID stored in localStorage.
export function getUserId(): string {
  try {
    const auth = localStorage.getItem(AUTH_KEY);
    if (auth) {
      const { id } = JSON.parse(auth) as { id?: string };
      if (id) return id;
    }
  } catch { /* ignore corrupt entry */ }

  let id = localStorage.getItem(UUID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(UUID_KEY, id);
  }
  return id;
}
