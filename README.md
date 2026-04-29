# DebugQuest

An interactive coding game where players debug real programs by reading, reasoning, and picking the right fix. Supports Python, JavaScript, C++, and Java puzzles across three difficulty levels, with a step-by-step visual execution engine, bilingual UI (English / Georgian), and a persistent progress/trophy system.

## Quick start

```bash
npm install
cp .env.example .env.local   # fill in Gmail credentials for feedback emails
npm run dev                  # http://localhost:8080
```

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Dev server with hot reload on port 8080 |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | ESLint |
| `npm run test` | Vitest (single run) |
| `npm run test:watch` | Vitest in watch mode |

## Environment variables

Copy `.env.example` to `.env.local`. Required for the feedback email endpoint:

| Variable | Description |
|---|---|
| `GMAIL_USER` | Gmail address to send feedback emails from |
| `GMAIL_PASS` | Gmail App Password (Google Account → Security → App Passwords) |

On Vercel, add these under **Project Settings → Environment Variables**.

## Deployment

The project deploys to Vercel as a static SPA + serverless functions. No configuration changes needed — `vercel.json` rewrites all `/api/*` requests to the handlers in `api/` and everything else to `index.html`.

```bash
vercel deploy
```

## Adding puzzles

Four puzzle formats exist. Pick the one that fits:

- **`api/_data/puzzles-source.ts`** — AST pick-fix puzzles (full step debugger, language-agnostic blocks)
- **`api/_data/puzzles-reorder.ts`** — AST drag-and-drop reorder puzzles
- **`api/_data/puzzles-python.ts`** / `puzzles-javascript.ts` / `puzzles-cpp.ts` / `puzzles-java.ts` — text pick-fix and fill-blank puzzles, one file per language

All puzzle fields require both `en` and `ka` localized strings. IDs must be unique across all files. After adding puzzles, run `npx tsc --noEmit` to confirm no type errors.
