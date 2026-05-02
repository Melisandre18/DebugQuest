# DebugQuest

An interactive coding game where players debug real programs by reading, reasoning, and picking the right fix. Supports Python, JavaScript, C++, and Java puzzles across three difficulty levels, with a step-by-step visual execution engine, bilingual UI (English / Georgian), a persistent progress/trophy system, and a formal scoring model that feeds an adaptive difficulty engine.

---

## Architecture

```
DebugQuest/
├── src/                  Frontend — React + Vite + TypeScript
│   ├── contexts/         LanguageContext, ProgressContext (localStorage)
│   ├── hooks/            useGameSession — all game logic extracted from UI
│   ├── lib/
│   │   ├── progress.ts   Scoring model (SCORING_CONFIG, computePerformance)
│   │   ├── api.ts        Client for the Express backend
│   │   └── user.ts       Mock userId (localStorage UUID, replaced by auth later)
│   └── pages/            Game, Modes, Trophies, Landing
│
├── api/                  Vercel serverless functions (puzzle selection, feedback)
│   └── _data/            Puzzle content + adaptive selection logic
│
└── server/               Express backend — analytics, DB, adaptive engine
    ├── src/
    │   ├── app.js        Entry point (port 5000)
    │   ├── routes/       index.js — all /api/* routes
    │   ├── controllers/  attemptController.js
    │   └── models/       prisma.js singleton
    └── prisma/
        └── schema.prisma User + Attempt models
```

---

## Quick start

### Frontend

```bash
npm install
cp .env.example .env.local   # fill in GMAIL_USER, GMAIL_PASS
npm run dev                  # http://localhost:8080
```

### Backend (Express + PostgreSQL)

```bash
cd server
npm install

# 1. Create a Postgres database
#    Local: createdb debugquest
#    Cloud: Neon (neon.tech) or Supabase — copy the connection string

# 2. Set your DATABASE_URL
cp .env.example .env         # edit DATABASE_URL

# 3. Run migrations (creates tables)
npm run db:migrate           # npx prisma migrate dev

# 4. Start the server
npm run dev                  # http://localhost:5000
```

---

## Scripts

### Frontend (`/`)

| Command | Description |
|---|---|
| `npm run dev` | Dev server with hot reload on port 8080 |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview the production build |
| `npm run lint` | ESLint |
| `npm run test` | Vitest (single run) |
| `npm run test:watch` | Vitest in watch mode |

### Backend (`/server`)

| Command | Description |
|---|---|
| `npm run dev` | Express server with nodemon on port 5000 |
| `npm start` | Production start |
| `npm run db:generate` | Regenerate Prisma client after schema changes |
| `npm run db:migrate` | Apply schema migrations to the database |
| `npm run db:studio` | Open Prisma Studio (DB GUI) |

---

## Environment variables

### Frontend (`.env.local`)

| Variable | Description |
|---|---|
| `GMAIL_USER` | Gmail address for feedback emails |
| `GMAIL_PASS` | Gmail App Password |
| `VITE_SERVER_URL` | Express backend URL (default: `http://localhost:5000`) |

### Backend (`server/.env`)

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `PORT` | Server port (default: `5000`) |

---

## Scoring model

All scoring is defined in `src/lib/progress.ts` as `SCORING_CONFIG`:

```
score       = base × performance
performance = 1 − time_deduction − hint_deduction − retry_deduction
```

| Component | Formula | Max deduction |
|---|---|---|
| Time | `clamp((t − par) / (cap − par), 0, 1) × 0.40` | 40% |
| Hints | `min(hints, 3) × 0.15` | 45% |
| Retries | `min(attempts−1, 5) × 0.10` | 50% |
| Floor | `max(0.10, …)` | min 10% of base |

`performance` (0–1) is the primary input to the adaptive engine. It is stored in the `Attempt.performance` column on every solve.

---

## Database schema

Managed by Prisma (`server/prisma/schema.prisma`):

```prisma
model User {
  id        String    @id @default(uuid())
  email     String    @unique
  createdAt DateTime  @default(now())
  attempts  Attempt[]
}

model Attempt {
  id           String   @id @default(uuid())
  userId       String
  challengeId  String
  bugType      String              // analytics: which concept did the player struggle with?
  difficulty   String
  language     String?
  correct      Boolean
  score        Int
  time         Float               // seconds
  hintsUsed    Int
  retriesCount Int      @default(0)
  performance  Float?              // 0.10–1.0 adaptive signal
  createdAt    DateTime @default(now())
}
```

---

## API endpoints

### Vercel serverless (`api/`)

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/next-puzzle` | Adaptive puzzle selection |
| `GET` | `/api/puzzle?id=…` | Fetch puzzle by ID |
| `GET` | `/api/puzzle-counts` | Count of puzzles per difficulty |
| `POST` | `/api/feedback` | Submit user feedback |

### Express backend (`server/`, port 5000)

| Method | Path | Description |
|---|---|---|
| `GET` | `/` | Health check |
| `GET` | `/api/health` | Health check |
| `POST` | `/api/attempt` | Log a solved attempt to Postgres |

---

## Deployment

The frontend + Vercel serverless functions deploy together:

```bash
vercel deploy
```

Set `VITE_SERVER_URL` in Vercel environment variables to point to the deployed Express backend.

---

## Adding puzzles

Four puzzle formats exist:

- **`api/_data/puzzles-source.ts`** — AST pick-fix (full step debugger, language-agnostic blocks)
- **`api/_data/puzzles-reorder.ts`** — AST drag-and-drop reorder
- **`api/_data/puzzles-python.ts`** / `puzzles-javascript.ts` / `puzzles-cpp.ts` / `puzzles-java.ts` — text pick-fix and fill-blank

All puzzle fields require both `en` and `ka` localized strings. IDs must be unique across all files. Run `npx tsc --noEmit` after changes to confirm no type errors.
