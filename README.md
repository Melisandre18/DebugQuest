# DebugQuest

An interactive coding game where players debug real programs by reading, reasoning, and picking the right fix. Supports Python, JavaScript, C++, and Java puzzles across three difficulty levels, with a step-by-step visual execution engine, bilingual UI (English / Georgian), a persistent progress/trophy system, and a formal scoring model that feeds an adaptive difficulty engine.

---

## Project structure

```
DebugQuest/
│
├── src/                              React + Vite + TypeScript frontend
│   ├── App.tsx                       Provider tree: Language → Auth → Progress → Router
│   │
│   ├── contexts/
│   │   ├── AuthContext.tsx           Auth state — username + id, persisted in localStorage
│   │   ├── LanguageContext.tsx       UI language toggle (en / ka)
│   │   └── ProgressContext.tsx       Score + attempts + achievements
│   │                                  • logged in  → loads from DB, kept in memory only
│   │                                  • logged out → reads/writes localStorage cache
│   │
│   ├── hooks/
│   │   └── useGameSession.ts         All game logic (state + actions) extracted from UI
│   │
│   ├── components/
│   │   ├── TopNav.tsx                Nav bar (Play link, score chip, auth, lang toggle)
│   │   └── AuthModal.tsx             Sign in / Register modal (username + password)
│   │
│   ├── lib/
│   │   ├── progress.ts               SCORING_CONFIG · computeScore() · computePerformance()
│   │   ├── api.ts                    Fetch helpers for the Express backend
│   │   ├── user.ts                   getUserId() — real id when logged in, UUID otherwise
│   │   └── puzzle-service.ts         Fetch helpers for the Vercel puzzle API
│   │
│   └── pages/
│       ├── Landing.tsx
│       ├── Modes.tsx                 Difficulty selector (route /modes → labelled "Play")
│       ├── Game.tsx                  Main puzzle page (/play/:difficulty/:language?)
│       └── Trophies.tsx             Stats, charts, achievements
│
├── api/                              Vercel serverless functions
│   ├── next-puzzle.ts                Adaptive puzzle selection (POST)
│   ├── puzzle.ts                     Fetch by ID (GET)
│   ├── puzzle-counts.ts              Counts per difficulty (GET)
│   ├── feedback.ts                   Feedback submission (POST)
│   └── _data/                        Puzzle content + selection logic
│       ├── puzzles-source.ts         AST pick-fix puzzles
│       ├── puzzles-reorder.ts        AST drag-and-drop reorder puzzles
│       ├── puzzles-python.ts
│       ├── puzzles-javascript.ts
│       ├── puzzles-cpp.ts
│       ├── puzzles-java.ts
│       └── index.ts                  pickNext() adaptive selection logic
│
└── server/                           Express backend (port 5000)
    ├── src/
    │   ├── app.ts                    Entry point — dotenv, cors, json, routes
    │   ├── routes/
    │   │   └── index.ts              All /api/* routes wired here
    │   ├── controllers/
    │   │   ├── authController.ts     register + login (bcrypt, username validation)
    │   │   ├── attemptController.ts  POST /attempt — logs solve to Postgres
    │   │   └── progressController.ts GET + DELETE /progress — user history
    │   └── models/
    │       └── prisma.ts             PrismaClient singleton
    └── prisma/
        └── schema.prisma             Database schema (Prisma v5, prisma-client-js)
```

---

## Provider / context order

```
QueryClientProvider        (React Query — puzzle fetch cache)
└── LanguageProvider       (en / ka, persisted in localStorage)
    └── AuthProvider       (username + id, persisted in localStorage)
        └── ProgressProvider  (reads auth; DB when logged in, localStorage when not)
            └── TooltipProvider
                └── BrowserRouter → Routes
```

---

## Quick start

### Frontend

```bash
npm install
cp .env.example .env.local          # fill in GMAIL_USER + GMAIL_PASS
npm run dev                          # http://localhost:8080
```

### Backend

```bash
# 1. Create a local Postgres database
createdb debugquest                  # or use pgAdmin

# 2. Configure the connection string
cd server
# edit server/.env:
# DATABASE_URL="postgresql://USER:PASS@localhost:5432/debugquest?schema=public"

# 3. Create tables
npm install
npm run db:migrate                   # first run: name the migration e.g. "init"

# 4. Start
npm run dev                          # http://localhost:5000
```

> If port 5000 is already in use:
> ```
> netstat -ano | findstr ":5000"
> taskkill /PID <pid> /F
> ```

---

## Scripts

### Frontend (`/`)

| Command | Description |
|---|---|
| `npm run dev` | Dev server — hot reload on port 8080 |
| `npm run build` | Production build → `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | ESLint |
| `npm run test` | Vitest (single run) |
| `npm run test:watch` | Vitest watch mode |

### Backend (`/server`)

| Command | Description |
|---|---|
| `npm run dev` | TypeScript server — hot reload via `node --watch` |
| `npm start` | Production start |
| `npm run db:generate` | Regenerate Prisma client after schema changes |
| `npm run db:migrate` | Apply pending migrations to the database |
| `npm run db:studio` | Open Prisma Studio (visual database browser) |

---

## Environment variables

### Frontend — `.env.local`

| Variable | Required | Description |
|---|---|---|
| `GMAIL_USER` | Yes | Gmail address for feedback emails |
| `GMAIL_PASS` | Yes | Gmail App Password (16-char) |
| `VITE_SERVER_URL` | No | Express backend URL (default: `http://localhost:5000`) |

### Backend — `server/.env`

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `PORT` | No | Server port (default: `5000`) |

---

## Authentication

Username + password only. No OAuth, no email magic links.

### Username rules (enforced on both client and server)

| Rule | Value |
|---|---|
| Min length | 3 characters |
| Max length | 20 characters |
| Allowed characters | `a–z` `A–Z` `0–9` `_` (no spaces or special chars) |
| Must be unique | Yes — `409 Conflict` if taken |
| Password minimum | 6 characters |

### Sign-up / sign-in flow

```
User clicks "Sign in" in nav (top-right)
  │
  ├─ Register tab ──→ POST /api/auth/register { username, password }
  │                         ↓ bcrypt hash (cost 10)
  │                         ↓ INSERT User row
  │                         ↓ { id, username } stored in localStorage["debugquest.auth"]
  │
  └─ Sign in tab  ──→ POST /api/auth/login { username, password }
                            ↓ bcrypt.compare
                            ↓ { id, username } stored in localStorage["debugquest.auth"]
```

### Session persistence

| Storage key | Contents | Lifetime |
|---|---|---|
| `debugquest.auth` | `{ id, username }` | Until sign-out |
| `debugquest.userId` | Anonymous UUID | Forever (browser) |
| `debugquest.progress.v1` | Anonymous progress cache | Forever (browser) |
| `debugquest.language` | `"en"` or `"ka"` | Forever (browser) |

### Progress isolation

- **Logged in** — progress lives in memory only, sourced from `GET /api/progress?userId=`. Anonymous localStorage cache is never written to or overwritten.
- **Logged out** — progress reads/writes `localStorage["debugquest.progress.v1"]`. The anonymous cache is untouched during a logged-in session, so sign-out always restores the exact pre-login state.

---

## Scoring model

Defined in `src/lib/progress.ts` → `SCORING_CONFIG`.

```
score       = base × performance
performance = 1 − time_deduction − hint_deduction − retry_deduction
```

### Base points by difficulty

| Difficulty | Base |
|---|---|
| Easy | 100 |
| Medium | 200 |
| Hard | 350 |

### Deductions

| Component | Formula | Cap |
|---|---|---|
| Time | `clamp((seconds − par) / (cap − par), 0, 1) × 0.40` | −40% |
| Hints | `min(hints_used, 3) × 0.15` | −45% |
| Retries | `min(wrong_attempts, 5) × 0.10` | −50% |
| Floor | `max(performance, 0.10)` | ≥ 10% of base |

### Time par and cap (seconds)

| Difficulty | Par (no penalty) | Cap (full −40%) |
|---|---|---|
| Easy | 60 s | 150 s |
| Medium | 90 s | 210 s |
| Hard | 120 s | 300 s |

### `performance` signal

`computePerformance()` returns `PerformanceBreakdown`:
```ts
{ performance: number   // 0.10–1.0 — primary adaptive engine input
  timePenalty: number
  hintPenalty: number
  retryPenalty: number }
```

`performance` is stored in `Attempt.performance` on every solve. The adaptive puzzle selector reads the last 5 values to decide whether to bump, hold, or lower difficulty.

---

## Database schema

Managed by **Prisma v5** (`server/prisma/schema.prisma`).

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id           String    @id @default(uuid())
  username     String    @unique
  email        String?   @unique          // reserved for future password-reset
  passwordHash String?
  createdAt    DateTime  @default(now())
  attempts     Attempt[]
}

model Attempt {
  id           String   @id @default(uuid())
  userId       String
  user         User     @relation(fields: [userId], references: [id])

  challengeId  String                     // puzzle id
  bugType      String                     // e.g. "off-by-one", "type-error"
  difficulty   String                     // "easy" | "medium" | "hard"
  language     String?                    // "python" | "javascript" | "cpp" | "java"

  correct      Boolean
  score        Int
  time         Float                      // seconds
  hintsUsed    Int
  retriesCount Int      @default(0)       // wrong attempts before solving
  performance  Float?                     // 0.10–1.0 adaptive signal

  createdAt    DateTime @default(now())

  @@index([userId])
  @@index([challengeId])
  @@index([bugType])
}
```

### Migrations

```bash
cd server
npm run db:migrate      # prompts for a migration name, applies SQL, updates migration history
npm run db:studio       # opens Prisma Studio at http://localhost:5555
```

To query users directly:
```sql
SELECT id, username, "createdAt" FROM "User";   -- note capital U + quotes
```

---

## API reference

### Vercel serverless (`api/` — deployed with the frontend)

| Method | Path | Body | Description |
|---|---|---|---|
| `POST` | `/api/next-puzzle` | `{ difficulty, lang, progLang, solved[], recent[] }` | Adaptive puzzle selection |
| `GET` | `/api/puzzle?id=&lang=` | — | Fetch a single puzzle by ID |
| `GET` | `/api/puzzle-counts?progLang=` | — | Count of puzzles per difficulty |
| `POST` | `/api/feedback` | `{ context, rating, message, … }` | Submit user feedback |

### Express backend (`server/` — port 5000)

| Method | Path | Body / Query | Response | Description |
|---|---|---|---|---|
| `GET` | `/` | — | `{ status, message }` | Root health check |
| `GET` | `/api/health` | — | `{ status }` | Health check |
| `POST` | `/api/auth/register` | `{ username, password }` | `201 { id, username }` | Create account |
| `POST` | `/api/auth/login` | `{ username, password }` | `200 { id, username }` | Sign in |
| `GET` | `/api/progress` | `?userId=` | `200 Attempt[]` | Load user's full attempt history |
| `DELETE` | `/api/progress` | `?userId=` | `200 { success }` | Wipe user's attempt history |
| `POST` | `/api/attempt` | attempt payload | `201 Attempt` | Log a solved puzzle |

#### `POST /api/attempt` payload

```ts
{
  userId:       string
  challengeId:  string
  score:        number
  time:         number    // seconds
  hintsUsed:    number
  bugType:      string
  correct:      boolean
  difficulty:   string
  language?:    string
  performance?: number    // 0.10–1.0
  retriesCount: number
}
```

#### Auth error codes

| Code | Meaning |
|---|---|
| `400` | Missing field or username/password fails validation |
| `401` | Wrong username or password |
| `409` | Username already taken |

---

## Deployment

### Frontend + Vercel serverless

```bash
vercel deploy
```

Add to Vercel **Project Settings → Environment Variables**:
- `GMAIL_USER`, `GMAIL_PASS` (feedback emails)
- `VITE_SERVER_URL` → your deployed backend URL

### Express backend — Render.com (recommended free tier)

1. **Database** — create a free [Neon](https://neon.tech) Postgres project; copy the connection string
2. **Server** — create a new **Web Service** on [Render](https://render.com):

| Setting | Value |
|---|---|
| Root directory | `server` |
| Build command | `npm install && npx prisma generate` |
| Start command | `npm start` |
| Env var `DATABASE_URL` | Neon connection string |
| Env var `NODE_VERSION` | `20` |

3. After first deploy, run the migration once:
```bash
cd server
DATABASE_URL="<neon-url>" npm run db:migrate
```

> **Free-tier note** — Render spins down after 15 min of inactivity (~30 s cold start). Upgrade to the $7/month Starter plan or use Railway for always-on hosting.

---

## Adding puzzles

| File | Format | Interaction |
|---|---|---|
| `api/_data/puzzles-source.ts` | AST | pick-fix (full step debugger) |
| `api/_data/puzzles-reorder.ts` | AST | drag-and-drop reorder |
| `api/_data/puzzles-python.ts` | Text | pick-fix + fill-blank |
| `api/_data/puzzles-javascript.ts` | Text | pick-fix + fill-blank |
| `api/_data/puzzles-cpp.ts` | Text | pick-fix + fill-blank |
| `api/_data/puzzles-java.ts` | Text | pick-fix + fill-blank |

Rules:
- Every string field requires both `en` and `ka` translations
- IDs must be unique across all files
- Run `npx tsc --noEmit` after editing to catch type errors
