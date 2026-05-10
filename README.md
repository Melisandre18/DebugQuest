# DebugQuest

An interactive programming game where players learn to debug by reading, reasoning, and picking the right fix. Every puzzle is a real broken program — no syntax drills, no fill-the-blank trivia. The player steps through execution, identifies the root cause, and applies the smallest correct change.

**Live languages:** Python · JavaScript · C++ · Java  
**Difficulty modes:** Easy · Medium · Hard · Adaptive  
**UI languages:** English · Georgian (ქართული)

---

## Table of contents

1. [Tech stack](#tech-stack)
2. [Project structure](#project-structure)
3. [Provider / context order](#provider--context-order)
4. [Quick start](#quick-start)
5. [Scripts](#scripts)
6. [Environment variables](#environment-variables)
7. [Game flow](#game-flow)
8. [Puzzle formats](#puzzle-formats)
9. [Scoring model](#scoring-model)
10. [Adaptive difficulty](#adaptive-difficulty)
11. [Achievements](#achievements)
12. [Localisation system](#localisation-system)
13. [Trophies page](#trophies-page)
14. [Authentication](#authentication)
15. [Progress isolation](#progress-isolation)
16. [Code editor](#code-editor)
17. [Database schema](#database-schema)
18. [API reference](#api-reference)
19. [Deployment](#deployment)
20. [Adding puzzles](#adding-puzzles)
21. [Adding translations](#adding-translations)

---

## Tech stack

### Frontend
| Layer | Library | Version |
|---|---|---|
| Framework | React | 18 |
| Build | Vite + SWC | 5 |
| Language | TypeScript | 5 |
| Routing | React Router DOM | 6 |
| Styling | Tailwind CSS | 3 |
| Components | Radix UI primitives + shadcn/ui | — |
| Animation | Framer Motion | 12 |
| Data fetching | TanStack React Query | 5 |
| Charts | Recharts | 2 |
| Code editor | Monaco Editor (`@monaco-editor/react`) | 4 |
| Forms | React Hook Form + Zod | — |
| Toasts | Sonner | 1 |
| Icons | Lucide React | — |
| ORM client | Prisma Client | 5 |

### Backend (serverless + Express)
| Layer | Technology |
|---|---|
| Serverless functions | Vercel (`api/` directory, ships with frontend) |
| Express backend | Node.js + TypeScript, port 5000 |
| Database | PostgreSQL via Prisma v5 |
| Auth | bcryptjs (cost 10), username + password |
| Email | Nodemailer + Gmail SMTP (feedback submissions) |
| Code execution | Wandbox API (Python, C++, Java) · Node.js `vm` (JavaScript) |

---

## Project structure

```
DebugQuest/
│
├── src/                              React frontend (Vite)
│   ├── App.tsx                       Provider tree + route definitions
│   ├── main.tsx                      Entry point
│   │
│   ├── contexts/
│   │   ├── AuthContext.tsx           Logged-in user state (id + username)
│   │   ├── LanguageContext.tsx       UI language (en / ka) + t translation object
│   │   └── ProgressContext.tsx       Score, attempts, achievements
│   │                                  • logged in  → fetched from DB, memory-only
│   │                                  • logged out → localStorage cache
│   │
│   ├── hooks/
│   │   ├── useGameSession.ts         All game state + actions (tab, puzzle, execution)
│   │   ├── use-mobile.tsx            Breakpoint detection hook
│   │   └── use-toast.ts             Toast utility
│   │
│   ├── components/
│   │   ├── TopNav.tsx                Sticky nav bar — links, score chip, auth, language toggle
│   │   ├── LessonPanel.tsx           Pre-puzzle concept lesson with mini quiz (fully translated)
│   │   ├── CodeEditor.tsx            Reusable Monaco wrapper (vs-dark theme, lazy-loaded)
│   │   ├── AuthModal.tsx             Sign in / Register modal
│   │   ├── FeedbackDialog.tsx        Feedback form (sends email via Nodemailer)
│   │   ├── DifficultyMeta.tsx        Difficulty badge + metadata (DIFFICULTY_META map)
│   │   ├── LanguageSelectModal.tsx   Programming language picker modal
│   │   ├── BlockView.tsx             Visual block renderer for AST puzzles
│   │   ├── CodeView.tsx              Source code renderer (syntax highlighted)
│   │   ├── ExecutionPanel.tsx        Step-through execution viewer (variables + output)
│   │   ├── NavLink.tsx               Nav item with active state
│   │   ├── Logo.tsx                  App logo
│   │   └── ui/                       shadcn/ui component library
│   │
│   ├── components/game/
│   │   ├── SolvedEditor.tsx          "Run it yourself" tab — Monaco + stdin + run button
│   │   ├── TextPickFix.tsx           Text-format pick-the-fix interaction
│   │   ├── TextFillBlank.tsx         Text-format fill-in-the-blank interaction
│   │   └── AstReorder.tsx            Drag-and-drop block reordering interaction
│   │
│   ├── lib/
│   │   ├── translations.ts           Full Translations interface + en/ka string tables
│   │   ├── lessons.ts                Per-bug-type lesson content (LocalizedString, 6 types)
│   │   ├── progress.ts               SCORING_CONFIG · computeScore() · computePerformance()
│   │   │                              · ACHIEVEMENTS · recordAttempt()
│   │   ├── puzzle-engine.ts          AST types, run(), matchesExpected()
│   │   ├── puzzle-service.ts         fetchPuzzleById(), getNextPuzzle(),
│   │   │                              usePuzzle(), usePuzzleCounts() hooks
│   │   ├── api.ts                    logAttempt(), runCode(), auth helpers
│   │   ├── feedback.ts               submitFeedback()
│   │   ├── user.ts                   getUserId() — real UUID when logged in, anon otherwise
│   │   └── utils.ts                  cn() class merge helper
│   │
│   └── pages/
│       ├── Landing.tsx               Marketing / how-it-works page (/)
│       ├── Modes.tsx                 Difficulty selector (/modes)
│       ├── Game.tsx                  Main puzzle page (/play/:difficulty/:language?)
│       ├── Trophies.tsx              Stats, charts, achievements (/trophies)
│       ├── Sandbox.tsx               Standalone code editor (/editor)
│       ├── Index.tsx                 Redirect root
│       └── NotFound.tsx              404 page
│
├── api/                              Vercel serverless functions
│   ├── next-puzzle.ts                POST — adaptive puzzle selection
│   ├── puzzle.ts                     GET  — single puzzle by ID + language
│   ├── puzzle-counts.ts              GET  — puzzle count per difficulty
│   ├── puzzles.ts                    GET  — all puzzles for a difficulty
│   ├── feedback.ts                   POST — send feedback email
│   ├── attempt.ts                    POST — log a solved attempt to Postgres
│   ├── progress.ts                   GET / DELETE — user attempt history
│   ├── health.ts                     GET  — health check
│   ├── run.ts                        POST — execute code via Wandbox or Node vm
│   │
│   ├── auth/
│   │   ├── register.ts               POST /api/auth/register
│   │   └── login.ts                  POST /api/auth/login
│   │
│   ├── _data/                        Puzzle definitions (server-side only)
│   │   ├── index.ts                  getAllPuzzles(), getPuzzleById(), pickNext()
│   │   ├── puzzles-source.ts         AST pick-fix puzzles (6, language-agnostic)
│   │   ├── puzzles-reorder.ts        AST drag-and-drop reorder puzzles
│   │   ├── puzzles-python.ts         Text-format Python puzzles (10)
│   │   ├── puzzles-javascript.ts     Text-format JavaScript puzzles (10)
│   │   ├── puzzles-cpp.ts            Text-format C++ puzzles (11)
│   │   └── puzzles-java.ts           Text-format Java puzzles (10)
│   │
│   └── _lib/
│       ├── ast-to-code.ts            AST → source converter (Python, JS, C++, Java)
│       └── types.ts                  Shared server-side TypeScript types
│
└── server/                           Express backend (port 5000)
    ├── src/
    │   ├── app.ts                    Entry point — dotenv, cors, json, routes
    │   ├── routes/index.ts           All /api/* route definitions
    │   └── controllers/
    │       ├── authController.ts     register + login (bcrypt, uniqueness check)
    │       ├── attemptController.ts  POST /attempt — insert solve into Postgres
    │       ├── progressController.ts GET + DELETE /progress
    │       └── codeController.ts     POST /run — route to Wandbox or Node vm
    └── prisma/
        └── schema.prisma             User + Attempt models
```

---

## Provider / context order

```
QueryClientProvider              React Query cache (puzzle fetches, staleTime Infinity)
└── LanguageProvider             en / ka, persisted to localStorage["debugquest.language"]
    └── AuthProvider             { id, username }, persisted to localStorage["debugquest.auth"]
        └── ProgressProvider     DB-sourced (logged in) or localStorage (logged out)
            └── TooltipProvider
                └── BrowserRouter
                    └── Routes
```

---

## Quick start

### Prerequisites
- Node.js 20+
- npm 9+
- PostgreSQL (local or hosted)

### 1. Clone and install

```bash
git clone https://github.com/your-org/debugquest.git
cd debugquest
npm install
```

### 2. Configure environment

```bash
cp .env.example .env.local
# Fill in GMAIL_USER and GMAIL_PASS (see Environment variables below)
```

### 3. Start the frontend

```bash
npm run dev          # → http://localhost:8080
```

### 4. Set up and start the backend (needed for auth + code execution)

```bash
# Create a local Postgres database
createdb debugquest

# Configure
cd server
echo 'DATABASE_URL="postgresql://USER:PASS@localhost:5432/debugquest?schema=public"' > .env

# Install + migrate
npm install
npm run db:migrate        # enter a migration name, e.g. "init"

# Start
npm run dev               # → http://localhost:5000
```

> **Port 5000 in use on Windows?**
> ```bash
> netstat -ano | findstr ":5000"
> taskkill /PID <pid> /F
> ```

---

## Scripts

### Frontend (`/`)

| Command | Description |
|---|---|
| `npm run dev` | Vite dev server with hot reload — `http://localhost:8080` |
| `npm run build` | Production build → `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | ESLint (TypeScript + React hooks rules) |
| `npm run test` | Vitest single run |
| `npm run test:watch` | Vitest watch mode |

### Backend (`/server`)

| Command | Description |
|---|---|
| `npm run dev` | TypeScript server with `node --watch` hot reload |
| `npm start` | Production start |
| `npm run db:generate` | Regenerate Prisma client after schema changes |
| `npm run db:migrate` | Apply pending migrations (prompts for a name) |
| `npm run db:studio` | Prisma Studio GUI at `http://localhost:5555` |

---

## Environment variables

### Frontend — `.env.local`

| Variable | Required | Description |
|---|---|---|
| `GMAIL_USER` | Yes | Gmail address used to send feedback emails |
| `GMAIL_PASS` | Yes | Gmail App Password — 16 chars, generated in Google Account → Security → App Passwords |
| `VITE_SERVER_URL` | No | Express backend base URL (default: `http://localhost:5000`) |

### Backend — `server/.env`

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `PORT` | No | Server port (default: `5000`) |

---

## Game flow

```
/ or /modes
  → Choose difficulty: Easy / Medium / Hard / Adaptive
  → Choose programming language: Python / JavaScript / C++ / Java
  ↓
/play/:difficulty/:language

  Tab 1 — [Learn the concept]
    • Concept title + one-line summary
    • "What you need to know" explanation paragraph
    • Worked example (code block + explanation, in selected language)
    • 3 key ideas
    • Quick-check mini quiz (multiple choice, immediate correctness feedback)
    • Related concepts tags
    • "Start debugging" → switches to Tab 2

  Tab 2 — [Debug the program]
    • Puzzle title, story, goal
    • Visual blocks OR source code toggle (Medium / Hard only)
    • Step-through execution: Play / Step / Reset / Auto
    • Variable state + stdout at every step
    • Tiered hint system (each hint deducts from score)
    • Interaction type: pick-fix / reorder / fill-blank

  After solving:
  Tab 3 — [Run it yourself]
    • Monaco editor pre-loaded with corrected code
    • Stdin panel for interactive programs
    • Run → POST /api/run → Wandbox or Node vm
    • Output displayed inline; code is fully editable
```

---

## Puzzle formats

### AST pick-fix (`puzzles-source.ts`)

Full interactive debugger. The program is an AST, rendered as visual blocks and source code simultaneously. The player steps through execution watching variable state, then picks the correct fix from 3–4 options. Works with all four languages (AST is language-agnostic; `ast-to-code.ts` generates source on the fly).

Bug types: `swapped-branches` `wrong-operator` `off-by-one` `infinite-loop` `wrong-init` `wrong-condition`

### AST reorder (`puzzles-reorder.ts`)

The program's statements are scrambled. The player drags blocks into the correct order and can use the step-through debugger to verify.

### Text pick-fix (`puzzles-{language}.ts`)

A real source file with one bug. The player reads the code and picks the correct fix label. Each fix shows an explanation after selection. `codeByLang` / `correctedCodeByLang` fields allow showing the same logic in multiple languages.

### Text fill-blank (`puzzles-{language}.ts`)

A code fragment with one expression replaced by `___`. The player picks the correct expression from 3–4 options. `codeBefore` and `codeAfter` wrap the blank.

---

## Scoring model

Defined in `src/lib/progress.ts` as `SCORING_CONFIG`.

```
score       = base × performance
performance = clamp(1 − time_deduction − hint_deduction − retry_deduction, floor, 1.0)
```

### Base points by difficulty

| Difficulty | Base |
|---|---|
| Easy | 100 pts |
| Medium | 200 pts |
| Hard | 350 pts |

### Deductions

| Component | Formula | Maximum loss |
|---|---|---|
| Time | `clamp((seconds − par) / (cap − par), 0, 1) × 0.40` | −40% |
| Hints | `min(hints_used, 3) × 0.15` | −45% |
| Retries | `min(wrong_attempts, 5) × 0.10` | −50% |
| Floor | `max(performance, 0.10)` | Always ≥ 10% of base |

### Time thresholds (seconds)

| Difficulty | Par — no penalty | Cap — full −40% |
|---|---|---|
| Easy | 60 s | 150 s |
| Medium | 90 s | 210 s |
| Hard | 120 s | 300 s |

### Hint limits by difficulty

| Difficulty | Max hints shown |
|---|---|
| Easy | All available |
| Medium | 2 |
| Hard | 1 |

### `computePerformance()` output

```ts
interface PerformanceBreakdown {
  performance: number   // 0.10–1.0  primary adaptive selector input
  timePenalty: number
  hintPenalty: number
  retryPenalty: number
}
```

`performance` is stored in the `Attempt.performance` column and read by the adaptive selector.

---

## Adaptive difficulty

When the player selects **Adaptive** mode, `pickNext()` in `api/_data/index.ts` reads the last 5 attempts:

| Condition | Next difficulty |
|---|---|
| avgAttempts ≤ 1.3 AND avgHints < 0.5 | Hard |
| avgAttempts ≤ 2.2 AND avgHints < 2 | Medium |
| Otherwise | Easy |

Already-solved puzzle IDs are excluded first. If all puzzles in the chosen difficulty are solved, any puzzle from the pool is returned.

---

## Achievements

Defined in `src/lib/progress.ts` → `ACHIEVEMENTS`. Unlocked automatically on correct solves and shown immediately as a toast. Titles and descriptions are fully bilingual via `src/lib/translations.ts` → `achievements`.

| Code | Title (en) | Unlock condition |
|---|---|---|
| `first-fix` | First Fix | Solve any puzzle |
| `no-hints` | Pure Insight | Solve without using any hints |
| `speed-demon` | Speed Demon | Solve in under 30 seconds |
| `hard-mode` | Bug Hunter | Solve a Hard-difficulty puzzle |
| `streak-3` | On a Roll | Solve 3 puzzles in a row on the first attempt |

---

## Localisation system

All user-visible text supports English and Georgian. The system has three layers.

### 1. UI strings — `src/lib/translations.ts`

The `Translations` interface defines every key. Both `en` and `ka` objects must satisfy it — TypeScript errors if a key is missing from either. Consumed via `useLanguage()`:

```ts
const { t, language, setLanguage } = useLanguage();
// language: "en" | "ka"
// t.game.concept, t.trophiesUI.resetTitle, t.achievements["first-fix"].title, …
```

Key sections of the `Translations` interface:

| Section | Contents |
|---|---|
| `nav` | Navigation link labels |
| `game` | All in-game strings — tabs, hints, feedback, strategy panel, bug type names, lesson panel labels |
| `difficulty` | Easy / Medium / Hard / Adaptive — titles, taglines, feature bullets |
| `trophies` | Trophy room hero section strings |
| `trophiesUI` | Stats panel labels, chart labels, reset dialog |
| `achievements` | Achievement title + desc keyed by code (`Record<AchievementCode, {title, desc}>`) |
| `modes` / `modesUI` | Mode selection page |
| `landing` / `landingUI` | Marketing page content |
| `common` | Shared words — Solved, Cancel, Reset, … |
| `feedback` | Feedback form labels and categories |
| `auth` | Sign in / Register form labels and validation messages |
| `buttons` | Action button labels |
| `messages` | Correct / incorrect / points toast messages |
| `gameUI` | Debug instructions panel |

### 2. Lesson content — `src/lib/lessons.ts`

Lesson text uses `LocalizedString`:

```ts
type LocalizedString = { en: string; ka: string };
```

Every field — concept title, intro paragraph, key ideas, quiz question, options, rationale, example explanations, further reading tags — is a `LocalizedString`. `LessonPanel.tsx` picks the correct language at render time:

```ts
const { language: uiLang } = useLanguage();
const p = (text: LocalizedString) => pickL(text, uiLang);
// then: {p(lesson.title)}, {p(lesson.intro)}, etc.
```

### 3. Puzzle content — `api/_data/`

Every displayed puzzle field uses `LocalizedText`:

```ts
interface LocalizedText { en: string; ka: string; }
```

The serialiser applies the requested language at the API level. The frontend always passes the current UI language as `?lang=en|ka`. If a `ka` value is missing the serialiser falls back to `en`.

### Live language switching

Switching language mid-puzzle does **not** load a new puzzle. `useGameSession` stores `uiLang` in a `uiLangRef` to decouple it from puzzle loading, and a dedicated effect re-fetches the **same puzzle ID** in the new language:

```ts
useEffect(() => {
  if (!anyPuzzle) return;
  fetchPuzzleById(anyPuzzle.id, uiLang, progLangRef.current)
    .then(setAnyPuzzle)
    .catch(() => {});
}, [uiLang]);
```

All game state — active tab, timer, hints revealed, attempts — is preserved across language switches.

---

## Trophies page

Route: `/trophies`

### Sections

| Section | Description |
|---|---|
| Hero | Total score, KPI chips (Accuracy, Avg time, Avg hints, Best streak), language filter |
| Score over time | Line chart — running cumulative score across all attempts |
| Solved by difficulty | Bar chart — solved vs total per difficulty level, coloured by difficulty theme |
| Achievements | Grid of all 5 achievements — unlocked (accent glow) vs locked (dimmed, star outline) |
| Recent attempts | Last 8 attempts — result icon, puzzle title, difficulty badge, language badge, time, hints, score delta |

### Language filter

A `<Select>` in the hero filters all stats to a single programming language. All KPIs, charts, and the recent attempts list update reactively. Defaults to "All languages".

### Recent attempts — puzzle titles

Titles are always shown in English regardless of the UI language active when the puzzle was solved. The page batch-fetches `GET /api/puzzle?id=&lang=en` for each unique puzzle ID using `useQueries` with `staleTime: Infinity` (cached indefinitely).

### Reset progress

Opens an `AlertDialog` with translated title (`t.trophiesUI.resetTitle`), description (`t.trophiesUI.resetDesc`), cancel (`t.common.cancel`), and confirm (`t.trophiesUI.resetConfirm`) labels. On confirm, clears `localStorage["debugquest.progress.v1"]`.

---

## Authentication

Username + password only. No OAuth, no email magic links. The server returns `{ id, username }` which the client stores in localStorage — no session cookies.

### Username rules

| Rule | Value |
|---|---|
| Min length | 3 characters |
| Max length | 20 characters |
| Allowed characters | `a–z` `A–Z` `0–9` `_` |
| Uniqueness | Enforced server-side — `409 Conflict` if taken |
| Password minimum | 6 characters |

### Registration flow

```
POST /api/auth/register { username, password }
  ↓ Validate length and character set
  ↓ Check username uniqueness → 409 if taken
  ↓ bcrypt.hash(password, 10)
  ↓ INSERT User row
  ↓ Return { id, username }
  ↓ Client stores in localStorage["debugquest.auth"]
```

### Sign-in flow

```
POST /api/auth/login { username, password }
  ↓ Find User by username → 401 if not found
  ↓ bcrypt.compare(password, passwordHash) → 401 if mismatch
  ↓ Return { id, username }
  ↓ Client stores in localStorage["debugquest.auth"]
```

### Error codes

| Code | Meaning |
|---|---|
| `400` | Missing field, too short/long, invalid characters |
| `401` | Wrong username or password |
| `409` | Username already taken |

### localStorage keys

| Key | Contents | Lifetime |
|---|---|---|
| `debugquest.auth` | `{ id, username }` | Until sign-out |
| `debugquest.userId` | Anonymous UUID | Forever |
| `debugquest.progress.v1` | Anonymous progress object | Forever |
| `debugquest.language` | `"en"` or `"ka"` | Forever |

---

## Progress isolation

- **Logged in** — `ProgressContext` loads the full attempt history from `GET /api/progress?userId=<id>` into memory on mount. The anonymous localStorage cache is never read or written. Sign-out restores the exact pre-login anonymous state with no data loss or contamination.
- **Logged out** — all reads and writes go to `localStorage["debugquest.progress.v1"]`.
- Achievements are computed client-side from `AttemptRecord[]` and stored in the same progress object.
- Solves are fire-and-forget POSTed to `POST /api/attempt` for server-side persistence; the game works fully offline if the backend is unavailable.

---

## Code editor

### Standalone editor (`/editor`)

Accessible from the nav bar (Terminal icon). Write, edit, and run code in all four languages.

| Language | Execution engine | Requirement |
|---|---|---|
| JavaScript | Node.js `vm` module (sandboxed) | Express backend running |
| Python | Wandbox public API | Internet access |
| C++ | Wandbox public API | Internet access |
| Java | Wandbox public API | Internet access |

**Stdin** — enter one value per line; consumed in order by `input()` / `prompt()` / `cin >>` / `Scanner.nextLine()`.

**Limits** — 5 s timeout · 512 KB output cap.

### In-game "Run it yourself" tab (`SolvedEditor.tsx`)

Appears after solving any puzzle. Pre-loads the corrected code:

| Puzzle type | Pre-loaded content |
|---|---|
| AST pick-fix | Fixed AST converted to the active programming language |
| AST reorder | Correctly-ordered AST converted to source |
| Text pick-fix | Source code with the correct fix applied |
| Text fill-blank | `codeBefore + correctValue + codeAfter` — fully runnable |

The editor is fully editable. The player can modify and re-run freely.

---

## Database schema

Managed by **Prisma v5** (`server/prisma/schema.prisma`).

```prisma
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

  challengeId  String              // puzzle id e.g. "easy-greet", "py-3"
  bugType      String              // e.g. "off-by-one", "wrong-operator"
  difficulty   String              // "easy" | "medium" | "hard"
  language     String?             // "python" | "javascript" | "cpp" | "java"

  correct      Boolean
  score        Int
  time         Float               // seconds
  hintsUsed    Int
  retriesCount Int      @default(0)
  performance  Float?              // 0.10–1.0 — adaptive selector input

  createdAt    DateTime @default(now())

  @@index([userId])
  @@index([challengeId])
  @@index([bugType])
}
```

> Postgres quotes identifiers. Use `SELECT * FROM "User";` — not `select * from user;`

---

## API reference

### Vercel serverless (`api/` — deployed with frontend)

| Method | Path | Body / Query | Description |
|---|---|---|---|
| `POST` | `/api/next-puzzle` | `{ difficulty, lang, progLang, solved[], recent[] }` | Adaptive puzzle selection |
| `GET` | `/api/puzzle` | `?id=&lang=en\|ka&progLang=` | Single puzzle by ID |
| `GET` | `/api/puzzle-counts` | `?progLang=` | Puzzle count per difficulty |
| `GET` | `/api/puzzles` | `?difficulty=&lang=&progLang=` | All puzzles for a difficulty |
| `POST` | `/api/feedback` | `{ context, rating, message, name?, email?, category }` | Send feedback email |
| `POST` | `/api/attempt` | see below | Log a solve to Postgres |
| `GET` | `/api/progress` | `?userId=` | Full attempt history for a user |
| `DELETE` | `/api/progress` | `?userId=` | Delete all attempts for a user |
| `GET` | `/api/health` | — | Health check |
| `POST` | `/api/run` | `{ language, code, stdin? }` | Execute code |
| `POST` | `/api/auth/register` | `{ username, password }` | Create account |
| `POST` | `/api/auth/login` | `{ username, password }` | Sign in |

#### `POST /api/next-puzzle` — request body

```ts
{
  difficulty: "easy" | "medium" | "hard" | "adaptive"
  lang:       "en" | "ka"
  progLang?:  "python" | "javascript" | "cpp" | "java"
  solved?:    string[]
  recent?:    { puzzleId: string; correct: boolean; hintsUsed: number; attempts: number }[]
}
```

#### `POST /api/attempt` — request body

```ts
{
  userId:       string
  challengeId:  string
  score:        number
  time:         number      // seconds
  hintsUsed:    number
  bugType:      string
  correct:      boolean
  difficulty:   string
  language?:    string
  performance?: number      // 0.10–1.0
  retriesCount: number
}
```

#### `POST /api/run` — request and response

```ts
// Request
{ language: "javascript" | "python" | "cpp" | "java", code: string, stdin?: string }

// Response
{ output: string, error: string | null, executionTimeMs: number }
```

---

## Deployment

### Frontend + serverless API — Vercel

```bash
vercel deploy
```

Add to **Project Settings → Environment Variables**:
- `GMAIL_USER`, `GMAIL_PASS`
- `VITE_SERVER_URL` → deployed Express backend URL
- `DATABASE_URL` → Postgres connection string (used by serverless auth + attempt routes)

### Express backend — Render.com

1. Create a free [Neon](https://neon.tech) or [Supabase](https://supabase.com) Postgres database.
2. Create a **Web Service** on [Render](https://render.com):

| Setting | Value |
|---|---|
| Root directory | `server` |
| Build command | `npm install && npx prisma generate` |
| Start command | `npm start` |
| `DATABASE_URL` | Neon / Supabase connection string |
| Node version | `20` |

3. Run the migration once after first deploy:

```bash
cd server
DATABASE_URL="<connection-string>" npm run db:migrate
```

> Render free tier spins down after 15 min inactivity (~30 s cold start on next request). The $7/month Starter plan keeps it always-on.

---

## Adding puzzles

All puzzle definitions live in `api/_data/`. Puzzle content is never shipped to the browser — it is serialised server-side per request.

### File by format and interaction type

| File | Format | Interaction types |
|---|---|---|
| `api/_data/puzzles-source.ts` | AST | `pick-fix` |
| `api/_data/puzzles-reorder.ts` | AST | `reorder` |
| `api/_data/puzzles-python.ts` | Text | `pick-fix`, `fill-blank` |
| `api/_data/puzzles-javascript.ts` | Text | `pick-fix`, `fill-blank` |
| `api/_data/puzzles-cpp.ts` | Text | `pick-fix`, `fill-blank` |
| `api/_data/puzzles-java.ts` | Text | `pick-fix`, `fill-blank` |

### Rules

- Every `LocalizedText` field needs both `en:` and `ka:` values.
- IDs must be globally unique across all files.
- Export the new puzzle by appending it to the file's `PUZZLE_DEFS_*` array.
- Run `npx tsc --noEmit` after editing — TypeScript will catch missing fields.

### Minimal text pick-fix template

```ts
const myPuzzle: TextPickFixDef = {
  id: "py-11",                          // globally unique
  difficulty: "easy",                   // "easy" | "medium" | "hard"
  bugType: "off-by-one",
  programmingLanguage: "python",
  concept: { en: "...", ka: "..." },
  title:   { en: "...", ka: "..." },
  story:   { en: "...", ka: "..." },
  task:    { en: "...", ka: "..." },
  hints: [
    { en: "Gentle nudge", ka: "..." },
    { en: "Stronger hint", ka: "..." },
    { en: "Near-spoiler", ka: "..." },
  ],
  format: "text",
  interaction: "pick-fix",
  code: `def example():\n    pass`,
  bugLine: 2,                           // 1-based line number of the bug
  correctedCode: `def example():\n    return True`,
  fixes: [
    {
      id: "correct",
      correct: true,
      label:       { en: "The right fix", ka: "..." },
      explanation: { en: "Why it works", ka: "..." },
    },
    {
      id: "distractor-1",
      correct: false,
      label:       { en: "Plausible wrong fix", ka: "..." },
      explanation: { en: "Why this doesn't work", ka: "..." },
    },
  ],
};
```

---

## Adding translations

### UI strings (`src/lib/translations.ts`)

1. Add the key to the relevant section of the `Translations` interface.
2. Add the English value to the `en` object.
3. Add the Georgian value to the `ka` object.
4. TypeScript will error on any of the three steps until all are complete.

### Lesson content (`src/lib/lessons.ts`)

Every text field is `LocalizedString = { en: string; ka: string }`. Edit the relevant entry in the `LESSONS` record. `LessonPanel.tsx` picks the correct string at render time via `pickL(text, uiLang)`.

### Puzzle content (`api/_data/`)

Every `LocalizedText` field needs `en:` and `ka:`. The API serialiser falls back to `en` if `ka` is absent, but all fields should be fully translated. After editing run `npx tsc --noEmit` to verify.
