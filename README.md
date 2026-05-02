# DebugQuest

An interactive coding game where players debug real programs by reading, reasoning, and picking the right fix. Supports Python, JavaScript, C++, and Java puzzles across three difficulty levels, with a step-by-step visual execution engine, bilingual UI (English / Georgian), a persistent progress/trophy system, a formal scoring model that feeds an adaptive difficulty engine, and a live code editor available from any solved puzzle.

---

## Project structure

```
DebugQuest/
│
├── src/                              React + Vite + TypeScript frontend
│   ├── App.tsx                       Provider tree — see "Context order" below
│   │
│   ├── contexts/
│   │   ├── AuthContext.tsx           Auth state (username + id → localStorage)
│   │   ├── LanguageContext.tsx       UI language toggle (en / ka → localStorage)
│   │   └── ProgressContext.tsx       Score + attempts + achievements
│   │                                  • logged in  → DB-sourced, memory only
│   │                                  • logged out → localStorage cache
│   │
│   ├── hooks/
│   │   └── useGameSession.ts         All game state + actions extracted from UI
│   │                                  Tab type: "learn" | "play" | "run"
│   │
│   ├── components/
│   │   ├── CodeEditor.tsx            Reusable Monaco wrapper (vs-dark, lazy-loaded)
│   │   ├── TopNav.tsx                Nav bar — Play, Trophies, Editor links + auth
│   │   └── AuthModal.tsx             Sign in / Register modal (username + password)
│   │
│   ├── components/game/
│   │   ├── SolvedEditor.tsx          "Run it yourself" tab content (Monaco + output)
│   │   ├── TextPickFix.tsx
│   │   ├── TextFillBlank.tsx
│   │   └── AstReorder.tsx
│   │
│   ├── lib/
│   │   ├── progress.ts               SCORING_CONFIG · computeScore() · computePerformance()
│   │   ├── api.ts                    Fetch helpers — backend auth, progress, runCode()
│   │   ├── user.ts                   getUserId() — real id when logged in, UUID otherwise
│   │   └── puzzle-service.ts         Fetch helpers for the Vercel puzzle API
│   │
│   └── pages/
│       ├── Landing.tsx
│       ├── Modes.tsx                 Difficulty selector (route /modes, nav label "Play")
│       ├── Game.tsx                  Main puzzle page (/play/:difficulty/:language?)
│       ├── Trophies.tsx              Stats, charts, achievements (/trophies)
│       └── Sandbox.tsx              Standalone code editor (/editor)
│
├── api/                              Vercel serverless functions
│   ├── next-puzzle.ts                Adaptive puzzle selection (POST)
│   ├── puzzle.ts                     Fetch puzzle by ID (GET)
│   ├── puzzle-counts.ts              Count by difficulty (GET)
│   ├── feedback.ts                   Feedback submission (POST)
│   └── _data/                        Puzzle content + selection logic
│       ├── puzzles-source.ts         AST pick-fix puzzles
│       ├── puzzles-reorder.ts        AST drag-and-drop reorder
│       ├── puzzles-python.ts
│       ├── puzzles-javascript.ts
│       ├── puzzles-cpp.ts
│       ├── puzzles-java.ts
│       └── index.ts                  pickNext() adaptive selection logic
│
└── server/                           Express backend (port 5000)
    ├── src/
    │   ├── app.ts                    Entry point — dotenv first, then cors/json/routes
    │   ├── routes/index.ts           All /api/* routes
    │   └── controllers/
    │       ├── authController.ts     register + login (bcrypt, username validation)
    │       ├── attemptController.ts  POST /attempt — writes solve to Postgres
    │       ├── progressController.ts GET + DELETE /progress — user history
    │       └── codeController.ts     POST /run — sandboxed code execution
    └── prisma/
        └── schema.prisma             User + Attempt models (Prisma v5)
```

---

## Context / provider order

```
QueryClientProvider        (React Query — puzzle fetch cache)
└── LanguageProvider       (en / ka, localStorage)
    └── AuthProvider       (username + id, localStorage)
        └── ProgressProvider  (DB when logged in, localStorage when logged out)
            └── TooltipProvider
                └── BrowserRouter → Routes
```

---

## Quick start

### Frontend

```bash
npm install
cp .env.example .env.local     # fill in GMAIL_USER + GMAIL_PASS
npm run dev                     # http://localhost:8080
```

### Backend

```bash
# 1. Create a local Postgres database
createdb debugquest              # or use pgAdmin

# 2. Configure the connection
cd server
# edit server/.env:
# DATABASE_URL="postgresql://USER:PASS@localhost:5432/debugquest?schema=public"

# 3. Install + migrate
npm install
npm run db:migrate               # prompts for a migration name (e.g. "init")

# 4. Start
npm run dev                      # http://localhost:5000
```

> **Port already in use?**
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
| `npm run db:migrate` | Apply pending migrations |
| `npm run db:studio` | Open Prisma Studio at http://localhost:5555 |

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

### Username rules (enforced client-side and server-side)

| Rule | Value |
|---|---|
| Min length | 3 characters |
| Max length | 20 characters |
| Allowed characters | `a–z` `A–Z` `0–9` `_` (no spaces or special chars) |
| Must be unique | Yes — `409 Conflict` if taken |
| Password minimum | 6 characters |

### Sign-up / sign-in flow

```
User clicks "Sign in" (top-right nav)
  │
  ├─ Register tab ──→ POST /api/auth/register { username, password }
  │                       ↓ bcrypt hash (cost 10)
  │                       ↓ INSERT User row
  │                       ↓ { id, username } → localStorage["debugquest.auth"]
  │
  └─ Sign in tab  ──→ POST /api/auth/login { username, password }
                          ↓ bcrypt.compare
                          ↓ { id, username } → localStorage["debugquest.auth"]
```

### localStorage keys

| Key | Contents | Lifetime |
|---|---|---|
| `debugquest.auth` | `{ id, username }` | Until sign-out |
| `debugquest.userId` | Anonymous UUID | Forever (browser) |
| `debugquest.progress.v1` | Anonymous progress cache | Forever (browser) |
| `debugquest.language` | `"en"` or `"ka"` | Forever (browser) |

### Progress isolation

- **Logged in** — progress is loaded from `GET /api/progress?userId=` into memory. The anonymous localStorage cache is never touched, so sign-out always restores the exact pre-login state.
- **Logged out** — progress reads/writes `localStorage["debugquest.progress.v1"]` only.

---

## Scoring model

Defined in `src/lib/progress.ts` as `SCORING_CONFIG`.

```
score       = base × performance
performance = 1 − time_deduction − hint_deduction − retry_deduction
```

### Base points

| Difficulty | Base |
|---|---|
| Easy | 100 |
| Medium | 200 |
| Hard | 350 |

### Deductions

| Component | Formula | Max |
|---|---|---|
| Time | `clamp((s − par) / (cap − par), 0, 1) × 0.40` | −40% |
| Hints | `min(hints, 3) × 0.15` | −45% |
| Retries | `min(wrong_attempts, 5) × 0.10` | −50% |
| Floor | `max(performance, 0.10)` | ≥ 10% of base always |

### Time par / cap (seconds)

| Difficulty | Par (free zone) | Cap (full −40%) |
|---|---|---|
| Easy | 60 s | 150 s |
| Medium | 90 s | 210 s |
| Hard | 120 s | 300 s |

### `performance` signal

`computePerformance()` → `PerformanceBreakdown`:
```ts
{ performance: number   // 0.10–1.0 — adaptive engine primary input
  timePenalty: number
  hintPenalty: number
  retryPenalty: number }
```

Stored in `Attempt.performance` on every solve. The adaptive selector reads the last 5 values to choose the next puzzle difficulty.

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
  email        String?   @unique     // reserved for future password-reset
  passwordHash String?
  createdAt    DateTime  @default(now())
  attempts     Attempt[]
}

model Attempt {
  id           String   @id @default(uuid())
  userId       String
  user         User     @relation(fields: [userId], references: [id])

  challengeId  String              // puzzle id
  bugType      String              // e.g. "off-by-one", "type-error"
  difficulty   String              // "easy" | "medium" | "hard"
  language     String?             // "python" | "javascript" | "cpp" | "java"

  correct      Boolean
  score        Int
  time         Float               // seconds
  hintsUsed    Int
  retriesCount Int      @default(0)
  performance  Float?              // 0.10–1.0 adaptive signal

  createdAt    DateTime @default(now())

  @@index([userId])
  @@index([challengeId])
  @@index([bugType])
}
```

> **Tip:** Table names are quoted in Postgres. Use `SELECT * FROM "User";` not `select * from user;`

---

## API reference

### Vercel serverless (`api/` — ships with the frontend)

| Method | Path | Body | Description |
|---|---|---|---|
| `POST` | `/api/next-puzzle` | `{ difficulty, lang, progLang, solved[], recent[] }` | Adaptive puzzle selection |
| `GET` | `/api/puzzle?id=&lang=` | — | Fetch a single puzzle by ID |
| `GET` | `/api/puzzle-counts?progLang=` | — | Puzzle count per difficulty |
| `POST` | `/api/feedback` | `{ context, rating, message, … }` | Submit feedback |

### Express backend (`server/` — port 5000)

| Method | Path | Body / Query | Response | Description |
|---|---|---|---|---|
| `GET` | `/` | — | `{ status, message }` | Root health |
| `GET` | `/api/health` | — | `{ status }` | Health check |
| `POST` | `/api/auth/register` | `{ username, password }` | `201 { id, username }` | Create account |
| `POST` | `/api/auth/login` | `{ username, password }` | `200 { id, username }` | Sign in |
| `GET` | `/api/progress` | `?userId=` | `200 Attempt[]` | Full attempt history |
| `DELETE` | `/api/progress` | `?userId=` | `200 { success }` | Wipe attempt history |
| `POST` | `/api/attempt` | see below | `201 Attempt` | Log a solved puzzle |
| `POST` | `/api/run` | see below | `200 RunResult` | Execute code in sandbox |

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

#### `POST /api/run` payload + response

```ts
// Request
{ language: "javascript" | "python" | "cpp" | "java", code: string, stdin?: string }

// Response
{ output: string, error: string | null, executionTimeMs: number }
```

#### Auth error codes

| Code | Meaning |
|---|---|
| `400` | Missing field or validation failure |
| `401` | Wrong username or password |
| `409` | Username already taken |

---

## Code editor

### Standalone editor (`/editor`)

Accessible from the nav bar (Terminal icon). Write and run code in all four languages.

| Language | How it runs | Requires on server |
|---|---|---|
| JavaScript | Node.js `vm` module — `prompt()` reads stdin | Nothing extra |
| Python | `child_process` → `python` (Windows) / `python3` (Mac/Linux) | Python on PATH |
| C++ | `g++ -std=c++17` → temp binary → run | `g++` on PATH |
| Java | `javac` → temp class → `java ClassName` | JDK on PATH |

**Stdin panel** — values entered (one per line) are consumed by:
- `prompt()` calls in JavaScript
- `input()` calls in Python
- `cin >>` / `Scanner` in C++ / Java

**Execution limits:** 5 s timeout · 512 KB output cap · temp files deleted after each run

**Installing compilers (if not present):**

```bash
# g++ on Windows
winget install MSYS2.MSYS2
# then in MSYS2 terminal:
pacman -S mingw-w64-ucrt-x86_64-gcc
# add C:\msys64\ucrt64\bin to PATH

# g++ on Mac
brew install gcc

# g++ on Linux
sudo apt install g++

# JDK on Windows
winget install Oracle.JDK.21

# JDK on Mac
brew install openjdk

# JDK on Linux
sudo apt install default-jdk
```

### In-game editor ("Run it yourself" tab)

After solving any puzzle a third tab **"Run it yourself"** appears next to "Debug the program". Clicking it opens a Monaco editor pre-loaded with the corrected code and a run button.

**What code is pre-loaded:**

| Puzzle type | Pre-loaded code |
|---|---|
| AST pick-fix | Fixed program converted to the selected language (Python / JS / C++ / Java) |
| AST reorder | Correctly-ordered program converted to source |
| Text pick-fix | `// Fix applied: <label>` comment + original code |
| Text fill-blank | `codeBefore + correctValue + codeAfter` — fully correct, runs as-is |

The editor and output are side-by-side. Stdin is available via an expandable toggle. Code is fully editable — the player can experiment freely before or after running.

---

## Game flow

```
/modes          Choose difficulty (Easy / Medium / Hard / Adaptive)
  ↓
Language modal  Pick Python / JavaScript / C++ / Java
  ↓
/play/:d/:lang  Game page — two tabs by default:

  [ Concept ]          Learn the bug type before debugging
  [ Debug the program ] Pick the fix / reorder / fill the blank

  After solving:
  [ Concept ]  [ Debug the program ]  [ Run it yourself ]
                                            ↓
                                      Monaco editor + stdin + output
                                      (calls POST /api/run)
```

---

## Deployment

### Frontend + Vercel serverless

```bash
vercel deploy
```

Add to Vercel **Project Settings → Environment Variables**:
- `GMAIL_USER`, `GMAIL_PASS`
- `VITE_SERVER_URL` → your deployed backend URL

### Express backend — Render.com

1. Create a free [Neon](https://neon.tech) Postgres database and copy the connection string
2. Create a **Web Service** on [Render](https://render.com):

| Setting | Value |
|---|---|
| Root directory | `server` |
| Build command | `npm install && npx prisma generate` |
| Start command | `npm start` |
| `DATABASE_URL` | Neon connection string |
| `NODE_VERSION` | `20` |

3. Run the migration once after first deploy:
```bash
cd server
DATABASE_URL="<neon-url>" npm run db:migrate
```

> Render free tier spins down after 15 min (~30 s cold start). The $7/month Starter plan keeps it always-on.

---

## Adding puzzles

| File | Format | Interaction types |
|---|---|---|
| `api/_data/puzzles-source.ts` | AST | pick-fix (full step debugger) |
| `api/_data/puzzles-reorder.ts` | AST | drag-and-drop reorder |
| `api/_data/puzzles-python.ts` | Text | pick-fix, fill-blank |
| `api/_data/puzzles-javascript.ts` | Text | pick-fix, fill-blank |
| `api/_data/puzzles-cpp.ts` | Text | pick-fix, fill-blank |
| `api/_data/puzzles-java.ts` | Text | pick-fix, fill-blank |

Rules:
- Every string field needs both `en` and `ka` values
- IDs must be unique across all files
- Run `npx tsc --noEmit` after editing to verify types
