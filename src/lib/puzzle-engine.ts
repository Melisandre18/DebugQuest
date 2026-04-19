// Puzzle types and a small step-based interpreter for visualizing execution.
// Programs are represented as a tiny AST that we can render in either
// "blocks" or as Python/JavaScript text — keeping the two views perfectly in sync.

export type Difficulty = "easy" | "medium" | "hard" | "adaptive";
export type Language = "python" | "javascript" | "cpp" | "java";

export const LANGUAGES: { id: Language; label: string; ext: string }[] = [
  { id: "python",     label: "Python",     ext: "py"   },
  { id: "javascript", label: "JavaScript", ext: "js"   },
  { id: "cpp",        label: "C++",        ext: "cpp"  },
  { id: "java",       label: "Java",       ext: "java" },
];

export type BugType =
  | "wrong-operator"
  | "off-by-one"
  | "wrong-condition"
  | "infinite-loop"
  | "wrong-init"
  | "swapped-branches";

// --- AST ---------------------------------------------------------------
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

// --- Rendering programs to source strings -----------------------------
function exprToStr(e: Expr, lang: Language): string {
  switch (e.kind) {
    case "num": return String(e.value);
    case "str": return JSON.stringify(e.value);
    case "var": return e.name;
    case "bin": return `${exprToStr(e.left, lang)} ${e.op} ${exprToStr(e.right, lang)}`;
  }
}

function indent(n: number) { return "  ".repeat(n); }

export function programToSource(p: Program, lang: Language): { line: number; text: string; stmtId?: string }[] {
  const out: { line: number; text: string; stmtId?: string }[] = [];
  let line = 1;
  const push = (text: string, stmtId?: string) => { out.push({ line: line++, text, stmtId }); };

  // Variable types are inferred from first assignment for typed languages.
  const varType: Record<string, "int" | "string"> = {};
  function inferType(e: Expr): "int" | "string" {
    if (e.kind === "str") return "string";
    if (e.kind === "num") return "int";
    if (e.kind === "var") return varType[e.name] ?? "int";
    if (e.kind === "bin") {
      const l = inferType(e.left), r = inferType(e.right);
      return (l === "string" || r === "string") ? "string" : "int";
    }
    return "int";
  }
  const ctype = (t: "int" | "string") => t === "string" ? "std::string" : "int";
  const jtype = (t: "int" | "string") => t === "string" ? "String" : "int";
  const semi = (lang === "javascript" || lang === "cpp" || lang === "java") ? ";" : "";
  const usesBraces = lang !== "python";

  // Detect if the program returns anything (controls Java/C++ wrapper signature).
  function hasReturn(stmts: Stmt[]): boolean {
    return stmts.some(s =>
      s.kind === "return" ||
      (s.kind === "if"    && (hasReturn(s.then) || (s.else ? hasReturn(s.else) : false))) ||
      (s.kind === "while" && hasReturn(s.body)) ||
      (s.kind === "for"   && hasReturn(s.body))
    );
  }
  const programReturns = hasReturn(p);

  // Pre-compute first-assign types for clean Java/C++ declarations.
  function preassign(stmts: Stmt[]) {
    for (const s of stmts) {
      if (s.kind === "assign" && varType[s.name] === undefined) varType[s.name] = inferType(s.value);
      else if (s.kind === "if")    { preassign(s.then); if (s.else) preassign(s.else); }
      else if (s.kind === "while") preassign(s.body);
      else if (s.kind === "for")   { varType[s.var] = "int"; preassign(s.body); }
    }
  }

  function emitStmt(s: Stmt, depth: number, declared: Set<string>) {
    const pad = indent(depth);
    if (s.kind === "assign") {
      const valStr = exprToStr(s.value, lang);
      const t = varType[s.name];
      const isFirst = !declared.has(s.name);
      declared.add(s.name);
      if (lang === "python")          push(`${pad}${s.name} = ${valStr}`, s.id);
      else if (lang === "javascript") push(`${pad}${isFirst ? "let " : ""}${s.name} = ${valStr};`, s.id);
      else if (lang === "cpp")        push(`${pad}${isFirst ? ctype(t) + " " : ""}${s.name} = ${valStr};`, s.id);
      else /* java */                 push(`${pad}${isFirst ? jtype(t) + " " : ""}${s.name} = ${valStr};`, s.id);
    }
    else if (s.kind === "print") {
      const v = exprToStr(s.value, lang);
      if (lang === "python")          push(`${pad}print(${v})`, s.id);
      else if (lang === "javascript") push(`${pad}console.log(${v});`, s.id);
      else if (lang === "cpp")        push(`${pad}std::cout << ${v} << std::endl;`, s.id);
      else /* java */                 push(`${pad}System.out.println(${v});`, s.id);
    }
    else if (s.kind === "return") {
      push(`${pad}return ${exprToStr(s.value, lang)}${semi}`, s.id);
    }
    else if (s.kind === "if") {
      if (!usesBraces) {
        push(`${pad}if ${exprToStr(s.cond, lang)}:`, s.id);
        s.then.forEach(x => emitStmt(x, depth + 1, declared));
        if (s.else) { push(`${pad}else:`); s.else.forEach(x => emitStmt(x, depth + 1, declared)); }
      } else {
        push(`${pad}if (${exprToStr(s.cond, lang)}) {`, s.id);
        s.then.forEach(x => emitStmt(x, depth + 1, declared));
        if (s.else) { push(`${pad}} else {`); s.else.forEach(x => emitStmt(x, depth + 1, declared)); }
        push(`${pad}}`);
      }
    }
    else if (s.kind === "while") {
      if (!usesBraces) {
        push(`${pad}while ${exprToStr(s.cond, lang)}:`, s.id);
        s.body.forEach(x => emitStmt(x, depth + 1, declared));
      } else {
        push(`${pad}while (${exprToStr(s.cond, lang)}) {`, s.id);
        s.body.forEach(x => emitStmt(x, depth + 1, declared));
        push(`${pad}}`);
      }
    }
    else if (s.kind === "for") {
      if (lang === "python") {
        const stop = s.inclusive ? `${exprToStr(s.to, lang)} + 1` : exprToStr(s.to, lang);
        push(`${pad}for ${s.var} in range(${exprToStr(s.from, lang)}, ${stop}):`, s.id);
        s.body.forEach(x => emitStmt(x, depth + 1, declared));
      } else {
        const cmp = s.inclusive ? "<=" : "<";
        const decl = lang === "javascript" ? "let " : "int ";
        declared.add(s.var);
        push(`${pad}for (${decl}${s.var} = ${exprToStr(s.from, lang)}; ${s.var} ${cmp} ${exprToStr(s.to, lang)}; ${s.var}++) {`, s.id);
        s.body.forEach(x => emitStmt(x, depth + 1, declared));
        push(`${pad}}`);
      }
    }
  }

  preassign(p);
  const declared = new Set<string>();

  // Wrap C++/Java in a real entry point so the code feels like prod.
  if (lang === "cpp") {
    push(`#include <iostream>`);
    push(`#include <string>`);
    push(``);
    push(`int main() {`);
    p.forEach(s => emitStmt(s, 1, declared));
    if (!programReturns) push(`  return 0;`);
    push(`}`);
  } else if (lang === "java") {
    push(`public class Main {`);
    push(`  public static ${programReturns ? "int" : "void"} ${programReturns ? "solve" : "main"}(${programReturns ? "" : "String[] args"}) {`);
    p.forEach(s => emitStmt(s, 2, declared));
    push(`  }`);
    push(`}`);
  } else {
    p.forEach(s => emitStmt(s, 0, declared));
  }
  return out;
}

// --- Interpreter (step-recording) -------------------------------------
export interface Step {
  stmtId: string;
  vars: Record<string, number | string>;
  output: string[];
  note: string;
}
export interface RunResult {
  steps: Step[];
  output: string[];
  finalVars: Record<string, number | string>;
  timedOut: boolean;
  returned?: number | string;
}

const MAX_STEPS = 400;

function evalExpr(e: Expr, env: Record<string, number | string>): number | string {
  switch (e.kind) {
    case "num": return e.value;
    case "str": return e.value;
    case "var": return env[e.name] ?? 0;
    case "bin": {
      const l = evalExpr(e.left, env) as number;
      const r = evalExpr(e.right, env) as number;
      switch (e.op) {
        case "+": return (typeof l === "string" || typeof r === "string") ? String(l) + String(r) : l + r;
        case "-": return (l as number) - (r as number);
        case "*": return (l as number) * (r as number);
        case "/": return (l as number) / (r as number);
        case "%": return (l as number) % (r as number);
        case "<": return l < r ? 1 : 0;
        case ">": return l > r ? 1 : 0;
        case "<=": return l <= r ? 1 : 0;
        case ">=": return l >= r ? 1 : 0;
        case "==": return l === r ? 1 : 0;
        case "!=": return l !== r ? 1 : 0;
      }
    }
  }
}

export function run(program: Program): RunResult {
  const env: Record<string, number | string> = {};
  const output: string[] = [];
  const steps: Step[] = [];
  let timedOut = false;
  let returned: number | string | undefined;

  function snap(stmtId: string, note: string) {
    if (steps.length >= MAX_STEPS) { timedOut = true; throw new Error("HALT"); }
    steps.push({ stmtId, vars: { ...env }, output: [...output], note });
  }

  function exec(stmts: Stmt[]) {
    for (const s of stmts) {
      if (returned !== undefined) return;
      if (s.kind === "assign") {
        const v = evalExpr(s.value, env);
        env[s.name] = v;
        snap(s.id, `${s.name} = ${v}`);
      } else if (s.kind === "print") {
        const v = evalExpr(s.value, env);
        output.push(String(v));
        snap(s.id, `print → ${v}`);
      } else if (s.kind === "return") {
        const v = evalExpr(s.value, env);
        returned = v;
        snap(s.id, `return ${v}`);
        return;
      } else if (s.kind === "if") {
        const c = evalExpr(s.cond, env) as number;
        snap(s.id, `if → ${c ? "true" : "false"}`);
        if (c) exec(s.then); else if (s.else) exec(s.else);
      } else if (s.kind === "while") {
        while (true) {
          const c = evalExpr(s.cond, env) as number;
          snap(s.id, `while → ${c ? "true" : "false"}`);
          if (!c) break;
          exec(s.body);
          if (returned !== undefined) return;
        }
      } else if (s.kind === "for") {
        const start = evalExpr(s.from, env) as number;
        const end = evalExpr(s.to, env) as number;
        const limit = s.inclusive ? end : end - 1;
        for (let i = start; i <= limit; i++) {
          env[s.var] = i;
          snap(s.id, `${s.var} = ${i}`);
          exec(s.body);
          if (returned !== undefined) return;
        }
      }
    }
  }

  try { exec(program); } catch { /* HALT */ }
  return { steps, output, finalVars: { ...env }, timedOut, returned };
}

// --- Puzzle definition -----------------------------------------------
export interface FixOption {
  id: string;
  /** Human label shown in UI. */
  label: string;
  /** Mutator that produces a new program from the current buggy one. */
  apply: (p: Program) => Program;
  correct: boolean;
  /** Why this option works/fails. Shown in feedback. */
  explanation: string;
}

export interface Puzzle {
  id: string;
  difficulty: Exclude<Difficulty, "adaptive">;
  title: string;
  story: string;            // friendly framing
  task: string;             // what the program should do
  bugType: BugType;
  concept: string;          // e.g. "comparison operators"
  program: Program;         // buggy version
  /** Expected output OR returned value when fixed. */
  expected: { output?: string[]; returned?: number | string };
  fixes: FixOption[];
  hints: string[];          // tier 1 → tier N (last is "spoiler")
  bugStmtId: string;        // which line is buggy (for highlighting after reveal)
}

// helper id
let _id = 0;
const sid = () => `s${++_id}`;

// ============ Puzzles ==================================================

const easy1: Puzzle = (() => {
  _id = 0;
  const a = sid(); const b = sid(); const c = sid(); const d = sid();
  return {
    id: "easy-greet",
    difficulty: "easy",
    title: "Backwards Greeting",
    story: "The greeter robot is grumpy and prints things in the wrong order.",
    task: 'Print "Hello" then "World".',
    bugType: "swapped-branches",
    concept: "Sequence: statements run top to bottom",
    bugStmtId: a, // we'll mark the first print as the swapped one
    program: [
      { id: a, kind: "print", value: { kind: "str", value: "World" }, isBug: true },
      { id: b, kind: "print", value: { kind: "str", value: "Hello" } },
    ],
    expected: { output: ["Hello", "World"] },
    fixes: [
      {
        id: "swap",
        label: "Swap the two print statements",
        correct: true,
        explanation: "Programs execute top-to-bottom. To print 'Hello' first, that statement must come first.",
        apply: () => [
          { id: b, kind: "print", value: { kind: "str", value: "Hello" } },
          { id: a, kind: "print", value: { kind: "str", value: "World" } },
        ],
      },
      {
        id: "delete",
        label: 'Delete the "World" line',
        correct: false,
        explanation: "We still need to print 'World' — deleting it loses required output.",
        apply: (p) => p.filter(s => s.id !== a),
      },
    ],
    hints: [
      "Read the lines from top to bottom — what gets printed first right now?",
      "Sequence matters. Reorder so that 'Hello' runs before 'World'.",
      "Swap the two print statements.",
    ],
  };
})();

const easy2: Puzzle = (() => {
  _id = 0;
  const a = sid(); const b = sid(); const c = sid();
  return {
    id: "easy-age",
    difficulty: "easy",
    title: "The Wrong Welcome",
    story: "A door checker greets the wrong people.",
    task: "Print 'Welcome' only when age is 18 or more.",
    bugType: "wrong-operator",
    concept: "Comparison operators",
    bugStmtId: b,
    program: [
      { id: a, kind: "assign", name: "age", value: { kind: "num", value: 16 } },
      {
        id: b, kind: "if", isBug: true,
        cond: { kind: "bin", op: "<", left: { kind: "var", name: "age" }, right: { kind: "num", value: 18 } },
        then: [{ id: c, kind: "print", value: { kind: "str", value: "Welcome" } }],
      },
    ],
    expected: { output: [] },
    fixes: [
      {
        id: "gte", label: "Change `<` to `>=`", correct: true,
        explanation: "We want to welcome people who are 18 or older — that's `age >= 18`. The original `<` welcomes the *wrong* group.",
        apply: (p) => p.map(s => s.id === b && s.kind === "if"
          ? { ...s, cond: { ...s.cond, op: ">=" as const } } : s),
      },
      {
        id: "gt", label: "Change `<` to `>`", correct: false,
        explanation: "Close, but `>` excludes age = 18, who *should* be welcomed.",
        apply: (p) => p.map(s => s.id === b && s.kind === "if"
          ? { ...s, cond: { ...s.cond, op: ">" as const } } : s),
      },
      {
        id: "eq", label: "Change `<` to `==`", correct: false,
        explanation: "`==` only welcomes people who are *exactly* 18, not all adults.",
        apply: (p) => p.map(s => s.id === b && s.kind === "if"
          ? { ...s, cond: { ...s.cond, op: "==" as const } } : s),
      },
    ],
    hints: [
      "Read the condition out loud. Does it match the goal?",
      "We want age 18 OR MORE. Which operator means that?",
      "Use `>=` instead of `<`.",
    ],
  };
})();

const med1: Puzzle = (() => {
  _id = 0;
  const a = sid(); const b = sid(); const c = sid();
  return {
    id: "med-sum",
    difficulty: "medium",
    title: "Sum to N",
    story: "Add up numbers 1..5. The accountant always gets it wrong.",
    task: "Return the sum of 1 + 2 + 3 + 4 + 5 (which is 15).",
    bugType: "off-by-one",
    concept: "Loop bounds & off-by-one errors",
    bugStmtId: b,
    program: [
      { id: a, kind: "assign", name: "total", value: { kind: "num", value: 0 } },
      {
        id: b, kind: "for", isBug: true,
        var: "i", from: { kind: "num", value: 1 }, to: { kind: "num", value: 5 }, inclusive: false,
        body: [
          { id: c, kind: "assign", name: "total",
            value: { kind: "bin", op: "+", left: { kind: "var", name: "total" }, right: { kind: "var", name: "i" } } },
        ],
      },
      { id: sid(), kind: "return", value: { kind: "var", name: "total" } },
    ],
    expected: { returned: 15 },
    fixes: [
      {
        id: "inclusive", label: "Make the range include 5", correct: true,
        explanation: "The loop currently stops *before* 5 (classic off-by-one). Including 5 gives 1+2+3+4+5 = 15.",
        apply: (p) => p.map(s => s.id === b && s.kind === "for" ? { ...s, inclusive: true } : s),
      },
      {
        id: "from0", label: "Start the range at 0 instead of 1", correct: false,
        explanation: "Adding 0 doesn't fix anything — you'd still miss 5 and only reach 10.",
        apply: (p) => p.map(s => s.id === b && s.kind === "for" ? { ...s, from: { kind: "num", value: 0 } } : s),
      },
      {
        id: "init1", label: "Initialise total to 1", correct: false,
        explanation: "That gives 1 + (1+2+3+4) = 11. The loop bound is the real bug.",
        apply: (p) => p.map(s => s.id === a && s.kind === "assign" ? { ...s, value: { kind: "num", value: 1 } } : s),
      },
    ],
    hints: [
      "Trace the loop on paper. What values does `i` actually take?",
      "Check the upper bound. Does the loop reach 5?",
      "Make the range inclusive of 5.",
    ],
  };
})();

const med2: Puzzle = (() => {
  _id = 0;
  const a = sid(); const b = sid(); const c = sid();
  return {
    id: "med-countdown",
    difficulty: "medium",
    title: "Endless Countdown",
    story: "The launch keeps getting delayed because the countdown never ends.",
    task: "Count down from 3 to 1, printing each number.",
    bugType: "infinite-loop",
    concept: "Loop termination — the variable must move toward the exit condition",
    bugStmtId: c,
    program: [
      { id: a, kind: "assign", name: "n", value: { kind: "num", value: 3 } },
      {
        id: b, kind: "while",
        cond: { kind: "bin", op: ">", left: { kind: "var", name: "n" }, right: { kind: "num", value: 0 } },
        body: [
          { id: sid(), kind: "print", value: { kind: "var", name: "n" } },
          { id: c, kind: "assign", isBug: true, name: "n",
            value: { kind: "bin", op: "+", left: { kind: "var", name: "n" }, right: { kind: "num", value: 1 } } },
        ],
      },
    ],
    expected: { output: ["3", "2", "1"] },
    fixes: [
      {
        id: "dec", label: "Change `n = n + 1` to `n = n - 1`", correct: true,
        explanation: "The loop stops when `n` reaches 0. Adding 1 moves *away* from 0, so it never stops. Subtracting drives it toward the exit.",
        apply: (p) => {
          const fix = (s: Stmt): Stmt => s.id === c && s.kind === "assign"
            ? { ...s, value: { kind: "bin", op: "-", left: { kind: "var", name: "n" }, right: { kind: "num", value: 1 } } }
            : s.kind === "while" ? { ...s, body: s.body.map(fix) }
            : s.kind === "if"    ? { ...s, then: s.then.map(fix), else: s.else?.map(fix) }
            : s.kind === "for"   ? { ...s, body: s.body.map(fix) }
            : s;
          return p.map(fix);
        },
      },
      {
        id: "init0", label: "Start `n` at 0", correct: false,
        explanation: "Then the loop body never runs — nothing gets printed. We still need 3, 2, 1.",
        apply: (p) => p.map(s => s.id === a && s.kind === "assign" ? { ...s, value: { kind: "num", value: 0 } } : s),
      },
      {
        id: "lt", label: "Flip the condition to `n < 0`", correct: false,
        explanation: "The body wouldn't execute at all (since 3 < 0 is false). No output produced.",
        apply: (p) => p.map(s => s.id === b && s.kind === "while"
          ? { ...s, cond: { ...s.cond, op: "<" as const } } : s),
      },
    ],
    hints: [
      "Run it and watch `n`. Is it getting closer to 0 or further away?",
      "For a while-loop to end, the variable in the condition must move toward making it false.",
      "Replace `+ 1` with `- 1`.",
    ],
  };
})();

const hard1: Puzzle = (() => {
  _id = 0;
  const a = sid(); const b = sid(); const c = sid(); const d = sid(); const e = sid(); const f = sid();
  return {
    id: "hard-fizz",
    difficulty: "hard",
    title: "Fizz, Buzz, Tangled",
    story: "The classifier swapped its branches and labels everything wrong.",
    task: 'For numbers 1..6: print "FizzBuzz" if divisible by both 3 and 5, "Fizz" if only 3, "Buzz" if only 5, otherwise the number.',
    bugType: "wrong-condition",
    concept: "Nested conditions & order of checks",
    bugStmtId: b,
    program: [
      {
        id: a, kind: "for", var: "i",
        from: { kind: "num", value: 1 }, to: { kind: "num", value: 6 }, inclusive: true,
        body: [
          {
            id: b, kind: "if", isBug: true,
            cond: { kind: "bin", op: "==",
              left: { kind: "bin", op: "%", left: { kind: "var", name: "i" }, right: { kind: "num", value: 3 } },
              right: { kind: "num", value: 0 } },
            then: [{ id: c, kind: "print", value: { kind: "str", value: "Fizz" } }],
            else: [{
              id: d, kind: "if",
              cond: { kind: "bin", op: "==",
                left: { kind: "bin", op: "%", left: { kind: "var", name: "i" }, right: { kind: "num", value: 5 } },
                right: { kind: "num", value: 0 } },
              then: [{ id: e, kind: "print", value: { kind: "str", value: "Buzz" } }],
              else: [{ id: f, kind: "print", value: { kind: "var", name: "i" } }],
            }],
          },
        ],
      },
    ],
    expected: { output: ["1", "2", "Fizz", "4", "Buzz", "Fizz", "7", "8", "Fizz", "Buzz", "11", "Fizz", "13", "14", "FizzBuzz"] },
    fixes: [
      {
        id: "addboth", label: "Check divisible-by-15 FIRST (FizzBuzz branch)", correct: true,
        explanation: "When a number is divisible by both 3 and 5, the original code prints just 'Fizz' because the %3 branch wins. Checking %15 first catches FizzBuzz before the others.",
        apply: (p) => p.map(s => s.id === a && s.kind === "for" ? {
          ...s,
          to: { kind: "num", value: 15 },
          body: [{
            id: b, kind: "if",
            cond: { kind: "bin", op: "==",
              left: { kind: "bin", op: "%", left: { kind: "var", name: "i" }, right: { kind: "num", value: 15 } },
              right: { kind: "num", value: 0 } },
            then: [{ id: sid(), kind: "print", value: { kind: "str", value: "FizzBuzz" } }],
            else: [{
              id: sid(), kind: "if",
              cond: { kind: "bin", op: "==",
                left: { kind: "bin", op: "%", left: { kind: "var", name: "i" }, right: { kind: "num", value: 3 } },
                right: { kind: "num", value: 0 } },
              then: [{ id: sid(), kind: "print", value: { kind: "str", value: "Fizz" } }],
              else: [{
                id: sid(), kind: "if",
                cond: { kind: "bin", op: "==",
                  left: { kind: "bin", op: "%", left: { kind: "var", name: "i" }, right: { kind: "num", value: 5 } },
                  right: { kind: "num", value: 0 } },
                then: [{ id: sid(), kind: "print", value: { kind: "str", value: "Buzz" } }],
                else: [{ id: sid(), kind: "print", value: { kind: "var", name: "i" } }],
              }],
            }],
          }],
        } : s),
      },
      {
        id: "swap35", label: "Swap the order: check %5 first, then %3", correct: false,
        explanation: "Now 15 prints 'Buzz' instead of 'Fizz' — still wrong. The real fix is to check BOTH first.",
        apply: (p) => p.map(s => s.id === a && s.kind === "for" ? {
          ...s, to: { kind: "num", value: 15 },
          body: s.body.map(x => x.id === b && x.kind === "if" ? {
            ...x,
            cond: { ...x.cond, left: { ...(x.cond as any).left, right: { kind: "num", value: 5 } } } as any,
            then: [{ id: sid(), kind: "print", value: { kind: "str", value: "Buzz" } }],
            else: [{
              id: sid(), kind: "if",
              cond: { kind: "bin", op: "==",
                left: { kind: "bin", op: "%", left: { kind: "var", name: "i" }, right: { kind: "num", value: 3 } },
                right: { kind: "num", value: 0 } },
              then: [{ id: sid(), kind: "print", value: { kind: "str", value: "Fizz" } }],
              else: [{ id: sid(), kind: "print", value: { kind: "var", name: "i" } }],
            }],
          } : x),
        } : s),
      },
      {
        id: "rangeonly", label: "Just shrink the loop so the bug is hidden", correct: false,
        explanation: "Hiding a bug isn't fixing it. The logic is still wrong for 15, 30, 45, …",
        apply: (p) => p.map(s => s.id === a && s.kind === "for"
          ? { ...s, to: { kind: "num", value: 4 } } : s),
      },
    ],
    hints: [
      "What number would expose the bug? Try 15 in your head.",
      "When BOTH conditions are true, only the first branch runs. Which check should run first?",
      "Add a `% 15 == 0` check BEFORE the others.",
    ],
  };
})();

const hard2: Puzzle = (() => {
  _id = 0;
  const a = sid(); const b = sid(); const c = sid(); const d = sid(); const e = sid();
  return {
    id: "hard-max",
    difficulty: "hard",
    title: "The Lost Maximum",
    story: "A scoreboard keeps reporting the wrong winner.",
    task: "Find the maximum of the numbers stored as a, b, c, d (here 4, 9, 2, 7) and return it. Expected: 9.",
    bugType: "wrong-init",
    concept: "Initialisation matters — bad initial state corrupts the whole loop's logic",
    bugStmtId: e,
    program: [
      { id: a, kind: "assign", name: "a", value: { kind: "num", value: 4 } },
      { id: b, kind: "assign", name: "b", value: { kind: "num", value: 9 } },
      { id: c, kind: "assign", name: "c", value: { kind: "num", value: 2 } },
      { id: d, kind: "assign", name: "d", value: { kind: "num", value: 7 } },
      { id: e, kind: "assign", isBug: true, name: "max", value: { kind: "num", value: 100 } },
      {
        id: sid(), kind: "if",
        cond: { kind: "bin", op: ">", left: { kind: "var", name: "a" }, right: { kind: "var", name: "max" } },
        then: [{ id: sid(), kind: "assign", name: "max", value: { kind: "var", name: "a" } }],
      },
      {
        id: sid(), kind: "if",
        cond: { kind: "bin", op: ">", left: { kind: "var", name: "b" }, right: { kind: "var", name: "max" } },
        then: [{ id: sid(), kind: "assign", name: "max", value: { kind: "var", name: "b" } }],
      },
      {
        id: sid(), kind: "if",
        cond: { kind: "bin", op: ">", left: { kind: "var", name: "c" }, right: { kind: "var", name: "max" } },
        then: [{ id: sid(), kind: "assign", name: "max", value: { kind: "var", name: "c" } }],
      },
      {
        id: sid(), kind: "if",
        cond: { kind: "bin", op: ">", left: { kind: "var", name: "d" }, right: { kind: "var", name: "max" } },
        then: [{ id: sid(), kind: "assign", name: "max", value: { kind: "var", name: "d" } }],
      },
      { id: sid(), kind: "return", value: { kind: "var", name: "max" } },
    ],
    expected: { returned: 9 },
    fixes: [
      {
        id: "init-a", label: "Initialise `max` to `a` (the first value)", correct: true,
        explanation: "When seeking a maximum, initialise to the first candidate (or -∞). 100 is artificially high so nothing ever beats it.",
        apply: (p) => p.map(s => s.id === e && s.kind === "assign" ? { ...s, value: { kind: "var", name: "a" } } : s),
      },
      {
        id: "init-zero", label: "Initialise `max` to 0", correct: false,
        explanation: "Works for THIS data, but fails if all numbers are negative. Brittle — not a real fix.",
        apply: (p) => p.map(s => s.id === e && s.kind === "assign" ? { ...s, value: { kind: "num", value: 0 } } : s),
      },
      {
        id: "flip", label: "Change `>` to `<` everywhere", correct: false,
        explanation: "Now you'd compute the *minimum* of values that are below 100. Wrong direction.",
        apply: (p) => p.map(s => s.kind === "if"
          ? { ...s, cond: { ...s.cond, op: "<" as const } as any } : s),
      },
    ],
    hints: [
      "Step through it. Does any `if` ever fire?",
      "Compare the initial value of `max` to the candidates. Can any of them ever be larger?",
      "Initialise `max` to one of the actual candidates (e.g. `a`).",
    ],
  };
})();

export const PUZZLES: Puzzle[] = [easy1, easy2, med1, med2, hard1, hard2];

export function puzzlesByDifficulty(d: Exclude<Difficulty, "adaptive">): Puzzle[] {
  return PUZZLES.filter(p => p.difficulty === d);
}

// --- Output comparison ------------------------------------------------
export function matchesExpected(result: RunResult, expected: Puzzle["expected"]): boolean {
  if (result.timedOut) return false;
  if (expected.returned !== undefined) return result.returned === expected.returned;
  if (expected.output) {
    if (result.output.length !== expected.output.length) return false;
    return result.output.every((v, i) => v === expected.output![i]);
  }
  return false;
}
