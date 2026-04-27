// Combines all puzzle sources. Import from here in the API handlers.
import { PUZZLE_DEFS, serializePuzzle, pickNextPuzzle as pickNextAst } from "./puzzles-source.js";
import { PUZZLE_DEFS_REORDER, serializeReorder } from "./puzzles-reorder.js";
import type { SerializedPuzzle, UiLanguage, ProgrammingLanguage, Difficulty, AttemptSummary } from "../_lib/types.js";

// Lazily loaded language-specific puzzle files
let _textPuzzlesLoaded = false;
let _textDefs: any[] = [];

async function loadTextPuzzles() {
  if (_textPuzzlesLoaded) return;
  try {
    const [py, js, cpp, java] = await Promise.all([
      import("./puzzles-python.js").catch(() => ({ PUZZLE_DEFS_PYTHON: [] })),
      import("./puzzles-javascript.js").catch(() => ({ PUZZLE_DEFS_JAVASCRIPT: [] })),
      import("./puzzles-cpp.js").catch(() => ({ PUZZLE_DEFS_CPP: [] })),
      import("./puzzles-java.js").catch(() => ({ PUZZLE_DEFS_JAVA: [] })),
    ]);
    _textDefs = [
      ...(py.PUZZLE_DEFS_PYTHON || []),
      ...(js.PUZZLE_DEFS_JAVASCRIPT || []),
      ...(cpp.PUZZLE_DEFS_CPP || []),
      ...(java.PUZZLE_DEFS_JAVA || []),
    ];
    _textPuzzlesLoaded = true;
  } catch {
    _textPuzzlesLoaded = true;
  }
}

function serializeTextPuzzle(def: any, lang: UiLanguage): SerializedPuzzle {
  const p = (t: { en: string; ka: string }) => t[lang] ?? t.en;
  const base = {
    id: def.id,
    difficulty: def.difficulty,
    bugType: def.bugType,
    programmingLanguage: def.programmingLanguage,
    concept: p(def.concept),
    title: p(def.title),
    story: p(def.story),
    task: p(def.task),
    hints: (def.hints as any[]).map(p),
  };
  if (def.interaction === "pick-fix") {
    return {
      ...base,
      format: "text",
      interaction: "pick-fix",
      code: def.code,
      bugLine: def.bugLine,
      fixes: (def.fixes as any[]).map((f: any) => ({
        id: f.id, correct: f.correct,
        label: p(f.label), explanation: p(f.explanation),
      })),
    } as SerializedPuzzle;
  }
  return {
    ...base,
    format: "text",
    interaction: "fill-blank",
    codeBefore: def.codeBefore,
    codeAfter: def.codeAfter,
    options: (def.options as any[]).map((o: any) => ({
      id: o.id, value: o.value, correct: o.correct,
      explanation: p(o.explanation),
    })),
  } as SerializedPuzzle;
}

// Get all serialized puzzles filtered by difficulty and programming language
export async function getAllPuzzles(
  difficulty: Exclude<Difficulty, "adaptive">,
  lang: UiLanguage = "en",
  progLang?: ProgrammingLanguage
): Promise<SerializedPuzzle[]> {
  await loadTextPuzzles();

  const results: SerializedPuzzle[] = [];

  // Universal AST pick-fix
  PUZZLE_DEFS.filter(p => p.difficulty === difficulty)
    .forEach(p => results.push(serializePuzzle(p, lang)));

  // Universal AST reorder
  PUZZLE_DEFS_REORDER.filter(p => p.difficulty === difficulty)
    .forEach(p => results.push(serializeReorder(p, lang)));

  // Language-specific text puzzles
  _textDefs
    .filter(p =>
      p.difficulty === difficulty &&
      (progLang ? p.programmingLanguage === progLang : true)
    )
    .forEach(p => results.push(serializeTextPuzzle(p, lang)));

  return results;
}

// Pick the next best puzzle for a player
export async function pickNext(opts: {
  difficulty: Difficulty;
  lang?: UiLanguage;
  progLang?: ProgrammingLanguage;
  solved?: string[];
  recent?: AttemptSummary[];
}): Promise<SerializedPuzzle> {
  await loadTextPuzzles();

  const { difficulty, lang = "en", progLang, solved = [], recent = [] } = opts;

  // Determine effective difficulty for adaptive mode.
  // Since only correct answers are recorded, we use attempts count and hints used
  // as the performance signal: few tries + no hints → too easy → go harder.
  let effectiveDiff: Exclude<Difficulty, "adaptive">;
  if (difficulty === "adaptive") {
    const last5 = recent.slice(-5);
    const avgAttempts = last5.length
      ? last5.reduce((s, a) => s + (a.attempts ?? 1), 0) / last5.length
      : 1.5;
    const avgHints = last5.length
      ? last5.reduce((s, a) => s + a.hintsUsed, 0) / last5.length
      : 1;
    if (avgAttempts <= 1.3 && avgHints < 0.5) {
      effectiveDiff = "hard";
    } else if (avgAttempts <= 2.2 && avgHints < 2) {
      effectiveDiff = "medium";
    } else {
      effectiveDiff = "easy";
    }
  } else {
    effectiveDiff = difficulty;
  }

  const pool = await getAllPuzzles(effectiveDiff, lang, progLang);
  const unseen = pool.filter(p => !solved.includes(p.id));
  const list = unseen.length ? unseen : pool;

  if (!list.length) {
    // Fallback: any difficulty
    const fallback = await getAllPuzzles("easy", lang, progLang);
    const fb = fallback[Math.floor(Math.random() * fallback.length)];
    if (fb) return fb;
  }

  return list[Math.floor(Math.random() * list.length)];
}

// Get a single puzzle by ID
export async function getPuzzleById(id: string, lang: UiLanguage = "en"): Promise<SerializedPuzzle | null> {
  await loadTextPuzzles();

  // AST pick-fix
  const astDef = PUZZLE_DEFS.find(p => p.id === id);
  if (astDef) return serializePuzzle(astDef, lang);

  // AST reorder
  const reorderDef = PUZZLE_DEFS_REORDER.find(p => p.id === id);
  if (reorderDef) return serializeReorder(reorderDef, lang);

  // Text puzzles
  const textDef = _textDefs.find(p => p.id === id);
  if (textDef) return serializeTextPuzzle(textDef, lang);

  return null;
}

// Count puzzles per difficulty for the trophies screen
export async function getPuzzleCounts(progLang?: ProgrammingLanguage) {
  await loadTextPuzzles();
  const diffs = ["easy", "medium", "hard"] as const;
  const result: Record<string, number> = {};
  for (const d of diffs) {
    const all = await getAllPuzzles(d, "en", progLang);
    result[d] = all.length;
  }
  return result;
}
