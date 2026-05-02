// AST-based block-reorder puzzles.
// The user drags program blocks into the correct execution order.
import type { Program, UiLanguage } from "../_lib/types.js";
import { astToCode } from "../_lib/ast-to-code.js";

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
  format: "ast",
  interaction: "reorder",
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
  format: "ast",
  interaction: "reorder",
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
  format: "ast",
  interaction: "reorder",
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

// ─── Reorder 4: Fibonacci step (medium) ───────────────────────────────────────
// To advance Fibonacci: save a+b in a temp, then shift a←b, b←temp.
// Scrambled: a=b first (overwrites a before saving), then new_b = a+b (wrong!), then b=new_b.
const r4: AstReorderDef = {
  id: "reorder-fibonacci",
  difficulty: "medium",
  bugType: "swapped-branches",
  programmingLanguage: "any",
  format: "ast",
  interaction: "reorder",
  concept: {
    en: "Fibonacci step: compute the next value before overwriting either variable",
    ka: "Fibonacci ნაბიჯი: შემდეგი მნიშვნელობა გამოთვალე ორივე ცვლადის გადაწერამდე",
  },
  title: { en: "Fibonacci Tangle", ka: "Fibonacci-ს გახლართვა" },
  story: {
    en: "A Fibonacci generator produces wrong numbers because it overwrites 'a' before computing the next value.",
    ka: "Fibonacci-ს გენერატორი არასწორ რიცხვებს გამოაქვს, რადგან 'a'-ს გადასწერს შემდეგი მნიშვნელობის გამოთვლამდე.",
  },
  task: {
    en: "Reorder so new_b = a+b is computed first, then a = b, then b = new_b.",
    ka: "გადაალაგე ისე, რომ ჯერ new_b = a+b გამოითვლოს, შემდეგ a = b, შემდეგ b = new_b.",
  },
  hints: [
    {
      en: "If you do a = b first, the original value of a is lost before you can add it to b.",
      ka: "თუ ჯერ a = b შეასრულებ, a-ს ორიგინალი მნიშვნელობა დაიკარგება b-ზე დამატებამდე.",
    },
    {
      en: "Compute the next Fibonacci number into a temporary variable first.",
      ka: "შემდეგი Fibonacci-ს რიცხვი ჯერ დამხმარე ცვლადში გამოთვალე.",
    },
    {
      en: "Correct order: new_b = a+b → a = b → b = new_b.",
      ka: "სწორი: new_b = a+b → a = b → b = new_b.",
    },
  ],
  // scrambled: a=b, new_b=a+b, b=new_b
  scrambledProgram: [
    { id: "rf4-2", kind: "assign", name: "a",     value: { kind: "var", name: "b" } },
    { id: "rf4-1", kind: "assign", name: "new_b", value: { kind: "bin", op: "+", left: { kind: "var", name: "a" }, right: { kind: "var", name: "b" } } },
    { id: "rf4-3", kind: "assign", name: "b",     value: { kind: "var", name: "new_b" } },
  ],
  correctOrder: ["rf4-1", "rf4-2", "rf4-3"],
  explanation: {
    en: "You must compute new_b = a+b first so the original 'a' is still available. Then slide a←b and b←new_b to advance the sequence.",
    ka: "ჯერ new_b = a+b უნდა გამოითვალო, რომ 'a'-ს ორიგინალი ჯერ კიდევ ხელმისაწვდომი იყოს. შემდეგ a←b და b←new_b მიდგენი მიმდევრობის გასაგრძელებლად.",
  },
};

// ─── Reorder 5: Area with formula (easy) ──────────────────────────────────────
// Variables must be defined before use: width=8, height=5, area=width*height, print area.
// Scrambled: area=width*height first, then width, then print, then height.
const r5: AstReorderDef = {
  id: "reorder-area",
  difficulty: "easy",
  bugType: "wrong-init",
  programmingLanguage: "any",
  format: "ast",
  interaction: "reorder",
  concept: {
    en: "Variables must be assigned before they appear in an expression",
    ka: "ცვლადები გამოთქმაში გამოჩენამდე მინიჭებული უნდა იყოს",
  },
  title: { en: "Unbuilt Rectangle", ka: "გაუმართავი მართკუთხედი" },
  story: {
    en: "A geometry program crashes because it tries to multiply width and height before either variable has been set.",
    ka: "გეომეტრიის პროგრამა ჭედება, რადგან სიგანისა და სიმაღლის ცვლადების დაყენებამდე გამრავლებას ცდილობს.",
  },
  task: {
    en: "Reorder so width and height are assigned before area is computed. Expected output: 40.",
    ka: "გადაალაგე ისე, რომ width და height area-ს გამოთვლამდე მიენიჭოს. მოსალოდნელი გამოსავალი: 40.",
  },
  hints: [
    {
      en: "area = width * height uses both variables — they must exist first.",
      ka: "area = width * height ორივე ცვლადს იყენებს — ისინი ჯერ უნდა არსებობდნენ.",
    },
    {
      en: "print area needs area to already have a value.",
      ka: "print area-ს სჭირდება, რომ area-ს უკვე ჰქონდეს მნიშვნელობა.",
    },
    {
      en: "Correct order: width=8 → height=5 → area=width*height → print area.",
      ka: "სწორი: width=8 → height=5 → area=width*height → print area.",
    },
  ],
  // scrambled: area=w*h, width=8, print area, height=5
  scrambledProgram: [
    { id: "ra5-3", kind: "assign", name: "area",   value: { kind: "bin", op: "*", left: { kind: "var", name: "width" }, right: { kind: "var", name: "height" } } },
    { id: "ra5-1", kind: "assign", name: "width",  value: { kind: "num", value: 8 } },
    { id: "ra5-4", kind: "print",  value: { kind: "var", name: "area" } },
    { id: "ra5-2", kind: "assign", name: "height", value: { kind: "num", value: 5 } },
  ],
  correctOrder: ["ra5-1", "ra5-2", "ra5-3", "ra5-4"],
  explanation: {
    en: "width and height must both be assigned before area = width * height can run. Then print area displays the result: 8 × 5 = 40.",
    ka: "width-ი და height-ი ორივე მინიჭებული უნდა იყოს area = width * height-ის გაშვებამდე. შემდეგ print area შედეგს აჩვენებს: 8 × 5 = 40.",
  },
};

// ─── Reorder 6: Discount price (medium) ───────────────────────────────────────
// price=100, discount=20, savings=price*(discount/100), final=price-savings, print final.
// Scrambled: final=price-savings first, then print, then savings=..., then price, then discount.
const r6: AstReorderDef = {
  id: "reorder-discount",
  difficulty: "medium",
  bugType: "wrong-init",
  programmingLanguage: "any",
  format: "ast",
  interaction: "reorder",
  concept: {
    en: "Multi-step computations require each intermediate result to be ready before it is used",
    ka: "მრავალსაფეხურიანი გამოთვლები მოითხოვს, რომ ყოველი შუალედური შედეგი გამოყენებამდე მზად იყოს",
  },
  title: { en: "Discount Disaster", ka: "ფასდაკლების კატასტროფა" },
  story: {
    en: "A checkout system computes the wrong final price because the discount and savings are calculated out of order.",
    ka: "გადახდის სისტემა არასწორ საბოლოო ფასს გამოთვლის, რადგან ფასდაკლება და დანაზოგი არასწორი თანმიმდევრობით გამოიანგარიშება.",
  },
  task: {
    en: "Reorder so price and discount are set, savings computed, then final = price - savings printed. Expected: 80.",
    ka: "გადაალაგე ისე, რომ price და discount დაყენდეს, savings გამოითვალოს, შემდეგ final = price - savings დაიბეჭდოს. მოსალოდნელი: 80.",
  },
  hints: [
    {
      en: "savings depends on price and discount — both must be defined first.",
      ka: "savings price-ზე და discount-ზეა დამოკიდებული — ორივე ჯერ განსაზღვრული უნდა იყოს.",
    },
    {
      en: "final depends on savings — savings must be computed before final.",
      ka: "final savings-ზეა დამოკიდებული — savings final-მდე გამოთვლილი უნდა იყოს.",
    },
    {
      en: "Correct order: price=100 → discount=20 → savings=price*discount/100 → final=price-savings → print final.",
      ka: "სწორი: price=100 → discount=20 → savings=price*discount/100 → final=price-savings → print final.",
    },
  ],
  // scrambled: final=price-savings, print final, savings=price*discount/100, price=100, discount=20
  scrambledProgram: [
    { id: "rd6-4", kind: "assign", name: "final",    value: { kind: "bin", op: "-", left: { kind: "var", name: "price" },   right: { kind: "var", name: "savings" } } },
    { id: "rd6-5", kind: "print",  value: { kind: "var", name: "final" } },
    { id: "rd6-3", kind: "assign", name: "savings",  value: { kind: "bin", op: "*", left: { kind: "var", name: "price" },   right: { kind: "bin", op: "/", left: { kind: "var", name: "discount" }, right: { kind: "num", value: 100 } } } },
    { id: "rd6-1", kind: "assign", name: "price",    value: { kind: "num", value: 100 } },
    { id: "rd6-2", kind: "assign", name: "discount", value: { kind: "num", value: 20 } },
  ],
  correctOrder: ["rd6-1", "rd6-2", "rd6-3", "rd6-4", "rd6-5"],
  explanation: {
    en: "price and discount must exist before savings can be computed. savings must exist before final. final must exist before it can be printed. Result: 100 - 100*20/100 = 80.",
    ka: "price-ი და discount-ი savings-ის გამოთვლამდე უნდა არსებობდეს. savings-ი final-მდე. final-ი print-მდე. შედეგი: 100 - 100*20/100 = 80.",
  },
};

// ─── Reorder 7: Speed-distance-time (hard) ────────────────────────────────────
// Compute average speed: time=4, distance=200, speed=distance/time, print speed.
// But also: a second trip is added halfway. Scrambled in a tricky order with 5 statements.
// Simpler version: total_dist = d1+d2, total_time = t1+t2, speed = total_dist/total_time, print.
const r7: AstReorderDef = {
  id: "reorder-speed",
  difficulty: "hard",
  bugType: "wrong-init",
  programmingLanguage: "any",
  format: "ast",
  interaction: "reorder",
  concept: {
    en: "Average speed requires total distance and total time before dividing",
    ka: "საშუალო სიჩქარე მოიცავს მთლიანი მანძილის და დროის გაყოფას",
  },
  title: { en: "Race Calculation", ka: "რბოლის გამოთვლა" },
  story: {
    en: "A race tracker computes average speed over two legs but the intermediate totals are used before they're calculated.",
    ka: "რბოლის ტრეკერი ორ მონაკვეთზე საშუალო სიჩქარეს გამოთვლის, მაგრამ შუალედური ჯამები გამოთვლამდე გამოიყენება.",
  },
  task: {
    en: "Reorder: assign d1, d2, t1, t2 first, then total_dist=d1+d2, total_time=t1+t2, speed=total_dist/total_time, print speed. Expected: 60.",
    ka: "გადაალაგე: ჯერ d1, d2, t1, t2 მიანიჭე, შემდეგ total_dist=d1+d2, total_time=t1+t2, speed=total_dist/total_time, print speed. მოსალოდნელი: 60.",
  },
  hints: [
    {
      en: "total_dist needs d1 and d2; total_time needs t1 and t2.",
      ka: "total_dist-ს d1 და d2 სჭირდება; total_time-ს t1 და t2.",
    },
    {
      en: "speed = total_dist / total_time — both totals must be ready first.",
      ka: "speed = total_dist / total_time — ორივე ჯამი ჯერ მზად უნდა იყოს.",
    },
    {
      en: "Assign the raw measurements (d1, d2, t1, t2), then compute totals, then speed, then print.",
      ka: "ჯერ ნედლი გაზომვები (d1, d2, t1, t2) მიანიჭე, შემდეგ ჯამები, შემდეგ სიჩქარე, შემდეგ print.",
    },
  ],
  // scrambled: speed=total_dist/total_time, d1=120, total_time=t1+t2, t2=2, total_dist=d1+d2, t1=1, print speed, d2=60
  scrambledProgram: [
    { id: "rs7-7", kind: "assign", name: "speed",      value: { kind: "bin", op: "/", left: { kind: "var", name: "total_dist" }, right: { kind: "var", name: "total_time" } } },
    { id: "rs7-1", kind: "assign", name: "d1",         value: { kind: "num", value: 120 } },
    { id: "rs7-6", kind: "assign", name: "total_time", value: { kind: "bin", op: "+", left: { kind: "var", name: "t1" },          right: { kind: "var", name: "t2" } } },
    { id: "rs7-4", kind: "assign", name: "t2",         value: { kind: "num", value: 2 } },
    { id: "rs7-5", kind: "assign", name: "total_dist", value: { kind: "bin", op: "+", left: { kind: "var", name: "d1" },          right: { kind: "var", name: "d2" } } },
    { id: "rs7-3", kind: "assign", name: "t1",         value: { kind: "num", value: 1 } },
    { id: "rs7-8", kind: "print",  value: { kind: "var", name: "speed" } },
    { id: "rs7-2", kind: "assign", name: "d2",         value: { kind: "num", value: 60 } },
  ],
  correctOrder: ["rs7-1", "rs7-2", "rs7-3", "rs7-4", "rs7-5", "rs7-6", "rs7-7", "rs7-8"],
  explanation: {
    en: "Raw values (d1=120, d2=60, t1=1, t2=2) must come first. Then total_dist=180 and total_time=3 can be computed. Only then can speed = 180/3 = 60 be found and printed.",
    ka: "ნედლი მნიშვნელობები (d1=120, d2=60, t1=1, t2=2) ჯერ უნდა მოვიდეს. შემდეგ total_dist=180 და total_time=3 შეიძლება გამოითვალოს. მხოლოდ შემდეგ შეიძლება speed = 180/3 = 60 იქნეს ნაპოვნი და დაბეჭდილი.",
  },
};

export const PUZZLE_DEFS_REORDER: AstReorderDef[] = [r1, r2, r3, r4, r5, r6, r7];

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
    starterCode: astToCode(def.scrambledProgram),
    expectedBehavior: p(def.task),
    solution: p(def.explanation),
  };
}
