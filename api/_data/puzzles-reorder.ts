// AST-based block-reorder puzzles.
// The user drags program blocks into the correct execution order.
import type { Program, UiLanguage } from "../_lib/types.js";

interface LocalizedText { en: string; ka: string; }

interface AstReorderDef {
  id: string;
  difficulty: "easy" | "medium" | "hard";
  bugType: string;
  programmingLanguage: "any";
  concept: LocalizedText;
  title: LocalizedText;
  story: LocalizedText;
  task: LocalizedText;
  hints: LocalizedText[];
  format: "ast";
  interaction: "reorder";
  scrambledProgram: Program;
  correctOrder: string[];
  explanation: LocalizedText;
}

// ─── Reorder 1: Variable Swap (easy) ──────────────────────────────────────
// Correct: tmp=a, a=b, b=tmp
// Scrambled: a=b, b=tmp, tmp=a  ← classic broken swap
const r1: AstReorderDef = {
  id: "reorder-swap",
  difficulty: "easy",
  bugType: "swapped-branches",
  programmingLanguage: "any",
  concept: {
    en: "Sequence: swapping two variables requires a temporary",
    ka: "თანმიმდევრობა: ორი ცვლადის გაცვლა საჭიროებს დამხმარე ცვლადს",
  },
  title: { en: "Tangled Swap", ka: "გადახლართული გაცვლა" },
  story: {
    en: "An engineer tried to swap two values but ran the steps out of order — now both variables hold the same number.",
    ka: "ინჟინერმა სცადა ორი მნიშვნელობის გაცვლა, მაგრამ ნაბიჯები არასწორი თანმიმდევრობით განახორციელა.",
  },
  task: {
    en: "Reorder the three statements so that after the swap, a contains the original b and vice versa.",
    ka: "გადაალაგე სამი ბრძანება ისე, რომ a-ს ჰქონდეს b-ს ორიგინალი და პირიქით.",
  },
  hints: [
    {
      en: "You can't copy a to b if b has already been overwritten.",
      ka: "a-ს b-ში ვერ დააკოპირებ, თუ b უკვე გადაწერილია.",
    },
    {
      en: "Save the original value of a in a temporary variable first.",
      ka: "ჯერ a-ს ორიგინალი tmp-ში შეინახე.",
    },
    {
      en: "Correct order: tmp = a → a = b → b = tmp.",
      ka: "სწორი თანმიმდევრობა: tmp = a → a = b → b = tmp.",
    },
  ],
  // scrambled: a=b, b=tmp, tmp=a
  scrambledProgram: [
    { id: "rs1-2", kind: "assign", name: "a",   value: { kind: "var", name: "b" } },
    { id: "rs1-3", kind: "assign", name: "b",   value: { kind: "var", name: "tmp" } },
    { id: "rs1-1", kind: "assign", name: "tmp", value: { kind: "var", name: "a" } },
  ],
  // correct: tmp=a, a=b, b=tmp
  correctOrder: ["rs1-1", "rs1-2", "rs1-3"],
  explanation: {
    en: "A swap needs a temporary variable to hold one value while you overwrite it. Order: (1) save a in tmp, (2) copy b into a, (3) copy tmp (original a) into b.",
    ka: "გაცვლა საჭიროებს დამხმარე ცვლადს ერთი მნიშვნელობის შესანახად გადაწერის დროს. თანმიმდევრობა: (1) a-ს tmp-ში შენახვა, (2) b-ს a-ში კოპირება, (3) tmp-ის (ორიგინალი a) b-ში კოპირება.",
  },
};

// ─── Reorder 2: Recipe Steps (easy) ───────────────────────────────────────
// Cook must: heat pan, add oil, add egg, flip
// Scrambled randomly
const r2: AstReorderDef = {
  id: "reorder-recipe",
  difficulty: "easy",
  bugType: "swapped-branches",
  programmingLanguage: "any",
  concept: {
    en: "Sequence: operations depend on prior state",
    ka: "თანმიმდევრობა: ოპერაციები დამოკიდებულია წინა მდგომარეობაზე",
  },
  title: { en: "Scrambled Instructions", ka: "გადარეული ინსტრუქციები" },
  story: {
    en: "A robot chef received the cooking steps in the wrong order and burned everything. Restore the correct sequence.",
    ka: "რობოტ-მზარეულმა სამზარეულოს ნაბიჯები არასწორი თანმიმდევრობით მიიღო და ყველაფერი დაწვა.",
  },
  task: {
    en: 'Reorder so output is: "heat", "oil", "egg", "flip".',
    ka: 'გადაალაგე ისე, რომ გამოსავალი იყოს: "heat", "oil", "egg", "flip".',
  },
  hints: [
    {
      en: "You can't add oil to a cold pan, and you can't add an egg before there is oil.",
      ka: "ცივ ტაფაში ზეთს ვერ დაასხამ, ხოლო ზეთამდე კვერცხს ვერ ჩადებ.",
    },
    {
      en: "Think about what each step requires from the previous step.",
      ka: "გააანალიზე, რას მოითხოვს თითოეული ნაბიჯი წინა ნაბიჯისგან.",
    },
    {
      en: 'Correct order: heat → oil → egg → flip.',
      ka: 'სწორი თანმიმდევრობა: heat → oil → egg → flip.',
    },
  ],
  scrambledProgram: [
    { id: "rr2-3", kind: "print", value: { kind: "str", value: "egg" } },
    { id: "rr2-1", kind: "print", value: { kind: "str", value: "heat" } },
    { id: "rr2-4", kind: "print", value: { kind: "str", value: "flip" } },
    { id: "rr2-2", kind: "print", value: { kind: "str", value: "oil" } },
  ],
  correctOrder: ["rr2-1", "rr2-2", "rr2-3", "rr2-4"],
  explanation: {
    en: "Each step depends on the previous one. You must heat the pan before adding oil, add oil before the egg, and the egg must cook before you flip it.",
    ka: "თითოეული ნაბიჯი დამოკიდებულია წინაზე. ჯერ ტაფა გაათბე, შემდეგ ზეთი ჩაასხი, შემდეგ კვერცხი — და ბოლოს ბრუნვა.",
  },
};

// ─── Reorder 3: Score Computation (medium) ────────────────────────────────
// Steps: init bonus=10, assign score = attempts × 5, add bonus, print score
// Scrambled order: score = attempts*5, print score, bonus=10, score = score+bonus
const r3: AstReorderDef = {
  id: "reorder-score",
  difficulty: "medium",
  bugType: "swapped-branches",
  programmingLanguage: "any",
  concept: {
    en: "Sequence: variables must be defined before they are used",
    ka: "თანმიმდევრობა: ცვლადი გამოყენებამდე განსაზღვრული უნდა იყოს",
  },
  title: { en: "Score Before Setup", ka: "ქულა კონფიგურაციამდე" },
  story: {
    en: "A game's score calculation is broken — the bonus is added before it's initialised, and the result is printed before the bonus is applied.",
    ka: "თამაშის ქულათვლა გატეხილია — ბონუსი ემატება ინიციალიზაციამდე, ხოლო შედეგი იბეჭდება ბონუსის გამოყენებამდე.",
  },
  task: {
    en: "Reorder the four statements so score is printed with the bonus applied. Expected: attempts=3 → score = (3×5)+10 = 25.",
    ka: "გადაალაგე ოთხი ბრძანება ისე, რომ score დაიბეჭდოს ბონუსის ჩათვლით. მოსალოდნელი: attempts=3 → score = (3×5)+10 = 25.",
  },
  hints: [
    {
      en: "You can't use a variable in an expression before assigning it a value.",
      ka: "ცვლადს გამოთქმაში ვერ გამოიყენებ, სანამ მას მნიშვნელობა არ მიანიჭე.",
    },
    {
      en: "bonus must exist before you add it to score. score must be calculated before you print it.",
      ka: "bonus უნდა არსებობდეს score-ში მის დამატებამდე. score გამოთვლილი უნდა იყოს დაბეჭდვამდე.",
    },
    {
      en: "Correct order: bonus=10 → score=attempts×5 → score=score+bonus → print score.",
      ka: "სწორი: bonus=10 → score=attempts×5 → score=score+bonus → print score.",
    },
  ],
  scrambledProgram: [
    { id: "rs3-2", kind: "assign", name: "score",
      value: { kind: "bin", op: "*", left: { kind: "var", name: "attempts" }, right: { kind: "num", value: 5 } } },
    { id: "rs3-4", kind: "print", value: { kind: "var", name: "score" } },
    { id: "rs3-1", kind: "assign", name: "bonus", value: { kind: "num", value: 10 } },
    { id: "rs3-3", kind: "assign", name: "score",
      value: { kind: "bin", op: "+", left: { kind: "var", name: "score" }, right: { kind: "var", name: "bonus" } } },
  ],
  correctOrder: ["rs3-1", "rs3-2", "rs3-3", "rs3-4"],
  explanation: {
    en: "Variables must be initialised before use. bonus=10 first, then score=attempts×5 (score needs attempts), then score=score+bonus (bonus must exist), then print.",
    ka: "ცვლადები გამოყენებამდე ინიციალიზებული უნდა იყოს. ჯერ bonus=10, შემდეგ score=attempts×5, შემდეგ score=score+bonus, ბოლოს print.",
  },
};

export const PUZZLE_DEFS_REORDER: AstReorderDef[] = [r1, r2, r3];

export function serializeReorder(def: AstReorderDef, lang: UiLanguage = "en") {
  const p = (t: LocalizedText) => t[lang] ?? t.en;
  return {
    id: def.id,
    difficulty: def.difficulty,
    bugType: def.bugType,
    programmingLanguage: def.programmingLanguage,
    concept: p(def.concept),
    title: p(def.title),
    story: p(def.story),
    task: p(def.task),
    hints: def.hints.map(p),
    format: "ast" as const,
    interaction: "reorder" as const,
    scrambledProgram: def.scrambledProgram,
    correctOrder: def.correctOrder,
    explanation: p(def.explanation),
  };
}
