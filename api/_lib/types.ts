// Types shared between server-side puzzle data and client-side service.
// These mirror the runtime types in src/lib/puzzle-engine.ts but are kept
// independent so the backend can be deployed standalone.

export type Difficulty = "easy" | "medium" | "hard" | "adaptive";
export type ProgrammingLanguage = "python" | "javascript" | "cpp" | "java";
export type UiLanguage = "en" | "ka";

export type BugType =
  | "wrong-operator"
  | "off-by-one"
  | "wrong-condition"
  | "infinite-loop"
  | "wrong-init"
  | "swapped-branches";

export type Expr =
  | { kind: "num"; value: number }
  | { kind: "str"; value: string }
  | { kind: "var"; name: string }
  | {
      kind: "bin";
      op: "+" | "-" | "*" | "/" | "%" | "<" | ">" | "<=" | ">=" | "==" | "!=";
      left: Expr;
      right: Expr;
    };

export type Stmt =
  | { id: string; kind: "assign"; name: string; value: Expr; isBug?: boolean }
  | { id: string; kind: "if"; cond: Expr; then: Stmt[]; else?: Stmt[]; isBug?: boolean }
  | { id: string; kind: "while"; cond: Expr; body: Stmt[]; isBug?: boolean }
  | { id: string; kind: "for"; var: string; from: Expr; to: Expr; body: Stmt[]; inclusive?: boolean; isBug?: boolean }
  | { id: string; kind: "print"; value: Expr; isBug?: boolean }
  | { id: string; kind: "return"; value: Expr; isBug?: boolean };

export type Program = Stmt[];

export interface SerializedFix {
  id: string;
  correct: boolean;
  label: string;
  explanation: string;
  appliedProgram: Program;
}

export interface SerializedPuzzle {
  id: string;
  difficulty: Exclude<Difficulty, "adaptive">;
  bugType: BugType;
  bugStmtId: string;
  concept: string;
  title: string;
  story: string;
  task: string;
  program: Program;
  expected: { output?: string[]; returned?: number | string };
  fixes: SerializedFix[];
  hints: string[];
}

export interface AttemptSummary {
  puzzleId: string;
  correct: boolean;
  hintsUsed: number;
}

export interface NextPuzzleRequest {
  difficulty: Difficulty;
  lang?: UiLanguage;
  solved?: string[];
  recent?: AttemptSummary[];
}
