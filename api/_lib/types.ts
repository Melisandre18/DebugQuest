// Shared types between server-side puzzle definitions and client-facing API responses.

export type Difficulty = "easy" | "medium" | "hard" | "adaptive";
export type ProgrammingLanguage = "python" | "javascript" | "cpp" | "java";
export type UiLanguage = "en" | "ka";

export type BugType =
  | "wrong-operator" | "off-by-one" | "wrong-condition"
  | "infinite-loop"  | "wrong-init"  | "swapped-branches"
  | "type-error"     | "scope-error" | "mutation-error"
  | "null-error"     | "overflow"    | "comparison-error"
  | "default-arg"    | "return-error"| "syntax-logic";

// ─── AST types (re-exported for server-side use) ───────────────────────────

export type Expr =
  | { kind: "num"; value: number }
  | { kind: "str"; value: string }
  | { kind: "var"; name: string }
  | { kind: "bin"; op: "+" | "-" | "*" | "/" | "%" | "<" | ">" | "<=" | ">=" | "==" | "!="; left: Expr; right: Expr };

export type Stmt =
  | { id: string; kind: "assign"; name: string; value: Expr; isBug?: boolean }
  | { id: string; kind: "if"; cond: Expr; then: Stmt[]; else?: Stmt[]; isBug?: boolean }
  | { id: string; kind: "while"; cond: Expr; body: Stmt[]; isBug?: boolean }
  | { id: string; kind: "for"; var: string; from: Expr; to: Expr; body: Stmt[]; inclusive?: boolean; isBug?: boolean }
  | { id: string; kind: "print"; value: Expr; isBug?: boolean }
  | { id: string; kind: "return"; value: Expr; isBug?: boolean };

export type Program = Stmt[];

// ─── Serialized puzzle shapes (sent over the wire) ─────────────────────────

interface BasePuzzle {
  id: string;
  difficulty: Exclude<Difficulty, "adaptive">;
  bugType: string;
  concept: string;
  title: string;
  story: string;
  task: string;
  hints: string[];
  /** "any" = works regardless of selected programming language */
  programmingLanguage: ProgrammingLanguage | "any";
}

// AST-based pick-fix (full step debugger)
export interface AstPickFixPuzzle extends BasePuzzle {
  format: "ast";
  interaction: "pick-fix";
  bugStmtId: string;
  program: Program;
  expected: { output?: string[]; returned?: number | string };
  fixes: SerializedFix[];
}

export interface SerializedFix {
  id: string;
  correct: boolean;
  label: string;
  explanation: string;
  appliedProgram: Program;
}

// AST-based reorder (drag blocks into correct order)
export interface AstReorderPuzzle extends BasePuzzle {
  format: "ast";
  interaction: "reorder";
  scrambledProgram: Program;
  correctOrder: string[];   // stmt IDs in correct order
  explanation: string;      // shown after solve
}

// Text-based pick-fix (read code, choose fix)
export interface TextPickFixPuzzle extends BasePuzzle {
  format: "text";
  interaction: "pick-fix";
  code: string;
  bugLine?: number;         // 1-indexed line to highlight
  fixes: TextFix[];
}

export interface TextFix {
  id: string;
  label: string;
  correct: boolean;
  explanation: string;
}

// Text-based fill-blank (complete the missing expression)
export interface TextFillBlankPuzzle extends BasePuzzle {
  format: "text";
  interaction: "fill-blank";
  codeBefore: string;
  codeAfter: string;
  options: BlankOption[];
}

export interface BlankOption {
  id: string;
  value: string;
  correct: boolean;
  explanation: string;
}

export type SerializedPuzzle =
  | AstPickFixPuzzle
  | AstReorderPuzzle
  | TextPickFixPuzzle
  | TextFillBlankPuzzle;

// ─── Request / response ────────────────────────────────────────────────────

export interface AttemptSummary {
  puzzleId: string;
  correct: boolean;
  hintsUsed: number;
  attempts: number;   // total tries including wrong ones
}

export interface NextPuzzleRequest {
  difficulty: Difficulty;
  lang?: UiLanguage;
  progLang?: ProgrammingLanguage;
  solved?: string[];
  recent?: AttemptSummary[];
}
