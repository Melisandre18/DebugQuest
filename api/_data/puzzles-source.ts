// Canonical puzzle definitions for DebugQuest.
// Puzzles are stored here on the server side so business logic does NOT live in the browser bundle.
// Each definition carries localized text and a function to produce the "fixed" program for each option.
// The /api/puzzles* handlers serialize these into SerializedPuzzle for the client.

import type { BugType, Difficulty, Expr, Program, Stmt, UiLanguage } from "../_lib/types.js";

// ─── helpers ──────────────────────────────────────────────────────────────────

let _uid = 0;
const sid = (tag: string) => `${tag}_${++_uid}`;

function num(value: number): Expr { return { kind: "num", value }; }
function str(value: string): Expr { return { kind: "str", value }; }
function vr(name: string): Expr  { return { kind: "var", name }; }
function bin(op: Extract<Expr, { kind: "bin" }>["op"], left: Expr, right: Expr): Expr {
  return { kind: "bin", op, left, right };
}

// ─── internal definition type ─────────────────────────────────────────────────

interface LocalizedText {
  en: string;
  ka: string;
}

interface FixDef {
  id: string;
  correct: boolean;
  label: LocalizedText;
  explanation: LocalizedText;
  applyToProgram: (p: Program) => Program;
}

interface PuzzleDef {
  id: string;
  difficulty: Exclude<Difficulty, "adaptive">;
  bugType: BugType;
  bugStmtId: string;
  expected: { output?: string[]; returned?: number | string };
  program: Program;
  fixes: FixDef[];
  concept: LocalizedText;
  title: LocalizedText;
  story: LocalizedText;
  task: LocalizedText;
  hints: { en: string; ka: string }[];
}

// ─── puzzle 1: Backwards Greeting ─────────────────────────────────────────────

const p1: PuzzleDef = (() => {
  _uid = 100;
  const a = sid("p1"); const b = sid("p1");
  const program: Program = [
    { id: a, kind: "print", value: str("World"), isBug: true },
    { id: b, kind: "print", value: str("Hello") },
  ];
  return {
    id: "easy-greet",
    difficulty: "easy",
    bugType: "swapped-branches",
    bugStmtId: a,
    expected: { output: ["Hello", "World"] },
    program,
    concept: {
      en: "Sequence: statements run top to bottom",
      ka: "თანმიმდევრობა: ბრძანებები სრულდება ზემოდან ქვემოთ",
    },
    title: {
      en: "Backwards Greeting",
      ka: "შებრუნებული მისალმება",
    },
    story: {
      en: "The greeter robot is grumpy and prints things in the wrong order.",
      ka: "მისალმების რობოტი ფუჭია — ტექსტს არასწორი თანმიმდევრობით ბეჭდავს.",
    },
    task: {
      en: 'Print "Hello" then "World".',
      ka: 'დაბეჭდე "Hello", შემდეგ "World".',
    },
    hints: [
      {
        en: "Read the lines top to bottom — what gets printed first right now?",
        ka: "წაიკითხე სტრიქონები ზემოდან ქვემოთ — ამჟამად რა იბეჭდება პირველი?",
      },
      {
        en: "Sequence matters. Reorder so that 'Hello' runs before 'World'.",
        ka: "თანმიმდევრობა მნიშვნელოვანია. გადაალაგე, რომ 'Hello' პირველი გამოვიდეს.",
      },
      {
        en: "Swap the two print statements.",
        ka: "გადაადგილე ორი print ბრძანება ადგილებზე.",
      },
    ],
    fixes: [
      {
        id: "swap",
        correct: true,
        label: { en: "Swap the two print statements", ka: "გადაუცვალე ადგილები ორ print ბრძანებას" },
        explanation: {
          en: "Programs execute top-to-bottom. To print 'Hello' first, that statement must come first.",
          ka: "პროგრამა სრულდება ზემოდან ქვემოთ. 'Hello'-ს პირველ დასაბეჭდად, ის ბრძანება პირველი უნდა იდგეს.",
        },
        applyToProgram: () => [
          { id: b, kind: "print", value: str("Hello") },
          { id: a, kind: "print", value: str("World") },
        ],
      },
      {
        id: "delete",
        correct: false,
        label: { en: 'Delete the "World" line', ka: '"World"-ს სტრიქონის წაშლა' },
        explanation: {
          en: "We still need to print 'World' — deleting it loses required output.",
          ka: "'World'-ს დაბეჭდვა მაინც გვჭირდება — მისი წაშლა საჭირო გამოსავალს კარგავს.",
        },
        applyToProgram: (p) => p.filter(s => s.id !== a),
      },
    ],
  };
})();

// ─── puzzle 2: The Wrong Welcome ──────────────────────────────────────────────

const p2: PuzzleDef = (() => {
  _uid = 200;
  const a = sid("p2"); const b = sid("p2"); const c = sid("p2");
  const program: Program = [
    { id: a, kind: "assign", name: "age", value: num(16) },
    {
      id: b, kind: "if", isBug: true,
      cond: bin("<", vr("age"), num(18)),
      then: [{ id: c, kind: "print", value: str("Welcome") }],
    },
  ];
  return {
    id: "easy-age",
    difficulty: "easy",
    bugType: "wrong-operator",
    bugStmtId: b,
    expected: { output: [] },
    program,
    concept: { en: "Comparison operators", ka: "შედარების ოპერატორები" },
    title: { en: "The Wrong Welcome", ka: "არასწორი მისასალმებელი" },
    story: {
      en: "A door checker greets the wrong people.",
      ka: "კარის შემომმოწმებელი არასწორ ადამიანებს ესალმება.",
    },
    task: {
      en: "Print 'Welcome' only when age is 18 or more.",
      ka: "დაბეჭდე 'Welcome' მხოლოდ მაშინ, როდესაც ასაკი 18 ან მეტია.",
    },
    hints: [
      {
        en: "Read the condition out loud. Does it match the goal?",
        ka: "წაიკითხე პირობა ხმამაღლა. ემთხვევა თუ არა მიზანს?",
      },
      {
        en: "We want age 18 OR MORE. Which operator means that?",
        ka: "გვჭირდება ასაკი 18 ან მეტი. რომელი ოპერატორი გამოხატავს ამას?",
      },
      { en: "Use `>=` instead of `<`.", ka: "გამოიყენე `>=` `<`-ის ნაცვლად." },
    ],
    fixes: [
      {
        id: "gte",
        correct: true,
        label: { en: "Change `<` to `>=`", ka: "შეცვალე `<` `>=`-ით" },
        explanation: {
          en: "We want to welcome people who are 18 or older — that's `age >= 18`. The original `<` welcomes the wrong group.",
          ka: "გვინდა ვიმასპინძლოთ 18 და მეტი ასაკის ადამიანებს — ეს არის `age >= 18`. `<` ოპერატორი პირიქითს აკეთებს.",
        },
        applyToProgram: (p) => p.map(s =>
          s.id === b && s.kind === "if"
            ? { ...s, cond: { ...s.cond as Extract<typeof s.cond, {kind:"bin"}>, op: ">=" as const } }
            : s
        ),
      },
      {
        id: "gt",
        correct: false,
        label: { en: "Change `<` to `>`", ka: "შეცვალე `<` `>`-ით" },
        explanation: {
          en: "Close, but `>` excludes age = 18, who *should* be welcomed.",
          ka: "თითქმის სწორია, მაგრამ `>` გამორიცხავს ზუსტად 18 ასაკს, ვინც *უნდა* შეიყვანო.",
        },
        applyToProgram: (p) => p.map(s =>
          s.id === b && s.kind === "if"
            ? { ...s, cond: { ...s.cond as Extract<typeof s.cond, {kind:"bin"}>, op: ">" as const } }
            : s
        ),
      },
      {
        id: "eq",
        correct: false,
        label: { en: "Change `<` to `==`", ka: "შეცვალე `<` `==`-ით" },
        explanation: {
          en: "`==` only welcomes people who are *exactly* 18, not all adults.",
          ka: "`==` მხოლოდ *ზუსტად* 18 ასაკის ადამიანებს შეიყვანს, არა ყველა ზრდასრულს.",
        },
        applyToProgram: (p) => p.map(s =>
          s.id === b && s.kind === "if"
            ? { ...s, cond: { ...s.cond as Extract<typeof s.cond, {kind:"bin"}>, op: "==" as const } }
            : s
        ),
      },
    ],
  };
})();

// ─── puzzle 3: Sum to N ───────────────────────────────────────────────────────

const p3: PuzzleDef = (() => {
  _uid = 300;
  const a = sid("p3"); const b = sid("p3"); const c = sid("p3"); const d = sid("p3");
  const program: Program = [
    { id: a, kind: "assign", name: "total", value: num(0) },
    {
      id: b, kind: "for", isBug: true,
      var: "i", from: num(1), to: num(5), inclusive: false,
      body: [
        { id: c, kind: "assign", name: "total",
          value: bin("+", vr("total"), vr("i")) },
      ],
    },
    { id: d, kind: "return", value: vr("total") },
  ];
  return {
    id: "med-sum",
    difficulty: "medium",
    bugType: "off-by-one",
    bugStmtId: b,
    expected: { returned: 15 },
    program,
    concept: { en: "Loop bounds & off-by-one errors", ka: "მარყუჟის საზღვრები და off-by-one შეცდომები" },
    title: { en: "Sum to N", ka: "ჯამი N-მდე" },
    story: {
      en: "Add up numbers 1..5. The accountant always gets it wrong.",
      ka: "შეაჯამე 1..5 რიცხვები. ბუღალტერი ყოველთვის ცდება.",
    },
    task: {
      en: "Return the sum of 1 + 2 + 3 + 4 + 5 (which is 15).",
      ka: "დააბრუნე 1 + 2 + 3 + 4 + 5 ჯამი (15).",
    },
    hints: [
      {
        en: "Trace the loop on paper. What values does `i` actually take?",
        ka: "გაიარე მარყუჟი ქაღალდზე. რა მნიშვნელობებს ღებულობს `i` სინამდვილეში?",
      },
      {
        en: "Check the upper bound. Does the loop reach 5?",
        ka: "შეამოწმე ზედა ზღვარი. მარყუჟი 5-ს აღწევს?",
      },
      { en: "Make the range inclusive of 5.", ka: "გახადე დიაპაზონი 5-ის ჩათვლით." },
    ],
    fixes: [
      {
        id: "inclusive",
        correct: true,
        label: { en: "Make the range include 5", ka: "შეიტანე 5 დიაპაზონში" },
        explanation: {
          en: "The loop currently stops *before* 5 (classic off-by-one). Including 5 gives 1+2+3+4+5 = 15.",
          ka: "მარყუჟი ამჟამად ჩერდება 5-*მდე* (კლასიკური off-by-one). 5-ის ჩათვლა იძლევა 1+2+3+4+5 = 15.",
        },
        applyToProgram: (p) => p.map(s =>
          s.id === b && s.kind === "for" ? { ...s, inclusive: true } : s
        ),
      },
      {
        id: "from0",
        correct: false,
        label: { en: "Start the range at 0 instead of 1", ka: "დაიწყე 0-ით 1-ის ნაცვლად" },
        explanation: {
          en: "Adding 0 doesn't fix anything — you'd still miss 5 and only reach 10.",
          ka: "0-ის დამატება არაფერს არ შველის — 5 მაინც გამოტოვდება და ჯამი 10 გამოვა.",
        },
        applyToProgram: (p) => p.map(s =>
          s.id === b && s.kind === "for" ? { ...s, from: num(0) } : s
        ),
      },
      {
        id: "init1",
        correct: false,
        label: { en: "Initialise total to 1", ka: "total-ს მიანიჭე საწყისი მნიშვნელობა 1" },
        explanation: {
          en: "That gives 1 + (1+2+3+4) = 11. The loop bound is the real bug.",
          ka: "ეს იძლევა 1 + (1+2+3+4) = 11. ნამდვილი შეცდომა მარყუჟის ზღვარშია.",
        },
        applyToProgram: (p) => p.map(s =>
          s.id === a && s.kind === "assign" ? { ...s, value: num(1) } : s
        ),
      },
    ],
  };
})();

// ─── puzzle 4: Endless Countdown ──────────────────────────────────────────────

const p4: PuzzleDef = (() => {
  _uid = 400;
  const a = sid("p4"); const b = sid("p4"); const bp = sid("p4"); const c = sid("p4");
  const program: Program = [
    { id: a, kind: "assign", name: "n", value: num(3) },
    {
      id: b, kind: "while",
      cond: bin(">", vr("n"), num(0)),
      body: [
        { id: bp, kind: "print", value: vr("n") },
        { id: c, kind: "assign", isBug: true, name: "n",
          value: bin("+", vr("n"), num(1)) },
      ],
    },
  ];
  return {
    id: "med-countdown",
    difficulty: "medium",
    bugType: "infinite-loop",
    bugStmtId: c,
    expected: { output: ["3", "2", "1"] },
    program,
    concept: {
      en: "Loop termination — the variable must move toward the exit condition",
      ka: "მარყუჟის დასრულება — ცვლადი გამოსასვლელი პირობისკენ უნდა მიდიოდეს",
    },
    title: { en: "Endless Countdown", ka: "უსასრულო კარათვლა" },
    story: {
      en: "The launch keeps getting delayed because the countdown never ends.",
      ka: "გაშვება მუდმივ გადავადებაში ჩარჩა, რადგან კარათვლა არ სრულდება.",
    },
    task: {
      en: "Count down from 3 to 1, printing each number.",
      ka: "დაითვალე 3-დან 1-მდე, დაბეჭდე თითოეული რიცხვი.",
    },
    hints: [
      {
        en: "Run it and watch `n`. Is it getting closer to 0 or further away?",
        ka: "გაუშვი და დააკვირდი `n`-ს. ის 0-ს უახლოვდება თუ შორდება?",
      },
      {
        en: "For a while-loop to end, the variable must move toward making the condition false.",
        ka: "while-მარყუჟის დასასრულებლად, ცვლადი პირობის false-ად გახდის მიმართულებით უნდა მიდიოდეს.",
      },
      { en: "Replace `+ 1` with `- 1`.", ka: "შეცვალე `+ 1` `-1`-ით." },
    ],
    fixes: [
      {
        id: "dec",
        correct: true,
        label: { en: "Change `n = n + 1` to `n = n - 1`", ka: "შეცვალე `n = n + 1` `n = n - 1`-ად" },
        explanation: {
          en: "The loop stops when `n` reaches 0. Adding 1 moves *away* from 0, so it never stops. Subtracting drives it toward the exit.",
          ka: "მარყუჟი ჩერდება, როდესაც `n` 0-ს გაუტოლდება. 1-ის დამატება 0-ისგან *შორდება*, ამიტომ არ ჩერდება. გამოკლება სწორი მიმართულებაა.",
        },
        applyToProgram: (p) => {
          const fixNode = (s: typeof p[number]): typeof p[number] => {
            if (s.id === c && s.kind === "assign")
              return { ...s, value: bin("-", vr("n"), num(1)) };
            if (s.kind === "while") return { ...s, body: s.body.map(fixNode) };
            if (s.kind === "if")    return { ...s, then: s.then.map(fixNode), else: s.else?.map(fixNode) };
            if (s.kind === "for")   return { ...s, body: s.body.map(fixNode) };
            return s;
          };
          return p.map(fixNode);
        },
      },
      {
        id: "init0",
        correct: false,
        label: { en: "Start `n` at 0", ka: "დააყენე `n` 0-ით" },
        explanation: {
          en: "Then the loop body never runs — nothing gets printed.",
          ka: "მაშინ მარყუჟის სხეული არასდროს სრულდება — არარაფერი არ დაიბეჭდება.",
        },
        applyToProgram: (p) => p.map(s =>
          s.id === a && s.kind === "assign" ? { ...s, value: num(0) } : s
        ),
      },
      {
        id: "lt",
        correct: false,
        label: { en: "Flip the condition to `n < 0`", ka: "შეცვალე პირობა `n < 0`-ად" },
        explanation: {
          en: "The body wouldn't execute at all (since 3 < 0 is false). No output produced.",
          ka: "სხეული საერთოდ არ შესრულდება (3 < 0 არის false). გამოსავალი ცარიელი იქნება.",
        },
        applyToProgram: (p) => p.map(s =>
          s.id === b && s.kind === "while"
            ? { ...s, cond: { ...s.cond as Extract<typeof s.cond, {kind:"bin"}>, op: "<" as const } }
            : s
        ),
      },
    ],
  };
})();

// ─── puzzle 5: Fizz, Buzz, Tangled ────────────────────────────────────────────

const p5: PuzzleDef = (() => {
  _uid = 500;
  const fa = sid("p5"); const fb = sid("p5"); const fc = sid("p5");
  const fd = sid("p5"); const fe = sid("p5"); const ff = sid("p5");
  const program: Program = [
    {
      id: fa, kind: "for", var: "i",
      from: num(1), to: num(6), inclusive: true,
      body: [
        {
          id: fb, kind: "if", isBug: true,
          cond: bin("==", bin("%", vr("i"), num(3)), num(0)),
          then: [{ id: fc, kind: "print", value: str("Fizz") }],
          else: [{
            id: fd, kind: "if",
            cond: bin("==", bin("%", vr("i"), num(5)), num(0)),
            then: [{ id: fe, kind: "print", value: str("Buzz") }],
            else: [{ id: ff, kind: "print", value: vr("i") }],
          }],
        },
      ],
    },
  ];

  const s = () => `fx_${++_uid}`;
  const fixedProgram: Program = [{
    id: fa, kind: "for", var: "i",
    from: num(1), to: num(15), inclusive: true,
    body: [{
      id: fb, kind: "if",
      cond: bin("==", bin("%", vr("i"), num(15)), num(0)),
      then: [{ id: s(), kind: "print", value: str("FizzBuzz") }],
      else: [{
        id: s(), kind: "if",
        cond: bin("==", bin("%", vr("i"), num(3)), num(0)),
        then: [{ id: s(), kind: "print", value: str("Fizz") }],
        else: [{
          id: s(), kind: "if",
          cond: bin("==", bin("%", vr("i"), num(5)), num(0)),
          then: [{ id: s(), kind: "print", value: str("Buzz") }],
          else: [{ id: s(), kind: "print", value: vr("i") }],
        }],
      }],
    }],
  }];

  return {
    id: "hard-fizz",
    difficulty: "hard",
    bugType: "wrong-condition",
    bugStmtId: fb,
    expected: { output: ["1","2","Fizz","4","Buzz","Fizz","7","8","Fizz","Buzz","11","Fizz","13","14","FizzBuzz"] },
    program,
    concept: {
      en: "Nested conditions & order of checks",
      ka: "მოდებული პირობები და შემოწმებების თანმიმდევრობა",
    },
    title: { en: "Fizz, Buzz, Tangled", ka: "Fizz, Buzz, აბდა-უბდა" },
    story: {
      en: "The classifier swapped its branches and labels everything wrong.",
      ka: "კლასიფიკატორმა ტოტები გადაუცვალა ადგილები და ყველაფერს მცდარ ეტიკეტს ადებს.",
    },
    task: {
      en: 'For numbers 1..15: print "FizzBuzz" if div by 3&5, "Fizz" if only 3, "Buzz" if only 5, else the number.',
      ka: '1..15 რიცხვებისთვის: "FizzBuzz" 3-ისა და 5-ის გამყოფისთვის, "Fizz" მხოლოდ 3-ისთვის, "Buzz" მხოლოდ 5-ისთვის, წინააღმდეგ შემთხვევაში — რიცხვი.',
    },
    hints: [
      {
        en: "What number would expose the bug? Try 15 in your head.",
        ka: "რომელი რიცხვი გამოავლენდა შეცდომას? სცადე 15 გონებაში.",
      },
      {
        en: "When BOTH conditions are true, only the first branch runs. Which check should run first?",
        ka: "როდესაც ორივე პირობა მართალია, მხოლოდ პირველი ტოტი სრულდება. რომელი შემოწმება უნდა იყოს პირველი?",
      },
      {
        en: "Add a `% 15 == 0` check BEFORE the others.",
        ka: "დაამატე `% 15 == 0` შემოწმება სხვებამდე.",
      },
    ],
    fixes: [
      {
        id: "addboth",
        correct: true,
        label: {
          en: "Check divisible-by-15 FIRST (FizzBuzz branch)",
          ka: "შეამოწმე 15-ზე გაყოფა პირველ რიგში (FizzBuzz ტოტი)",
        },
        explanation: {
          en: "When a number is divisible by both 3 and 5, the original code prints just 'Fizz' because the %3 branch wins. Checking %15 first catches FizzBuzz before the others.",
          ka: "როდესაც რიცხვი 3-ზეც და 5-ზეც იყოფა, ორიგინალი კოდი ბეჭდავს 'Fizz'-ს, რადგან %3 ტოტი იმარჯვებს. %15-ის პირველ შემოწმებაში FizzBuzz ილაგება სწორად.",
        },
        applyToProgram: () => fixedProgram,
      },
      {
        id: "swap35",
        correct: false,
        label: {
          en: "Swap the order: check %5 first, then %3",
          ka: "გადაუცვალე თანმიმდევრობა: პირველ %5, შემდეგ %3",
        },
        explanation: {
          en: "Now 15 prints 'Buzz' instead of 'Fizz' — still wrong. The real fix is to check BOTH first.",
          ka: "ახლა 15 ბეჭდავს 'Buzz'-ს 'Fizz'-ის ნაცვლად — მაინც მცდარია. ნამდვილი გამოსწორებაა ორივეს ერთად შემოწმება.",
        },
        applyToProgram: (p) => {
          const s2 = () => `fx_${++_uid}`;
          return [{
            ...(p[0] as Extract<typeof p[number], {kind:"for"}>),
            to: num(15),
            body: [{
              id: fb, kind: "if",
              cond: bin("==", bin("%", vr("i"), num(5)), num(0)),
              then: [{ id: s2(), kind: "print", value: str("Buzz") }],
              else: [{
                id: s2(), kind: "if",
                cond: bin("==", bin("%", vr("i"), num(3)), num(0)),
                then: [{ id: s2(), kind: "print", value: str("Fizz") }],
                else: [{ id: s2(), kind: "print", value: vr("i") }],
              }],
            }],
          }];
        },
      },
      {
        id: "rangeonly",
        correct: false,
        label: {
          en: "Just shrink the loop so the bug is hidden",
          ka: "შეამცირე მარყუჟი, რათა შეცდომა დამალული იყოს",
        },
        explanation: {
          en: "Hiding a bug isn't fixing it. The logic is still wrong for 15, 30, 45, …",
          ka: "შეცდომის დამალვა გამოსწორება არ არის. ლოგიკა მაინც მცდარია 15, 30, 45, …-სთვის.",
        },
        applyToProgram: (p) => p.map(s =>
          s.id === fa && s.kind === "for" ? { ...s, to: num(4) } : s
        ),
      },
    ],
  };
})();

// ─── puzzle 6: The Lost Maximum ───────────────────────────────────────────────

const p6: PuzzleDef = (() => {
  _uid = 600;
  const a = sid("p6"); const b = sid("p6"); const c = sid("p6");
  const d = sid("p6"); const e = sid("p6");
  const f = sid("p6"); const g = sid("p6"); const h = sid("p6");
  const ii = sid("p6"); const jj = sid("p6"); const kk = sid("p6");
  const ll = sid("p6"); const mm = sid("p6"); const nn = sid("p6");

  const program: Program = [
    { id: a, kind: "assign", name: "a", value: num(4) },
    { id: b, kind: "assign", name: "b", value: num(9) },
    { id: c, kind: "assign", name: "c", value: num(2) },
    { id: d, kind: "assign", name: "d", value: num(7) },
    { id: e, kind: "assign", isBug: true, name: "max", value: num(100) },
    {
      id: f, kind: "if",
      cond: bin(">", vr("a"), vr("max")),
      then: [{ id: g, kind: "assign", name: "max", value: vr("a") }],
    },
    {
      id: h, kind: "if",
      cond: bin(">", vr("b"), vr("max")),
      then: [{ id: ii, kind: "assign", name: "max", value: vr("b") }],
    },
    {
      id: jj, kind: "if",
      cond: bin(">", vr("c"), vr("max")),
      then: [{ id: kk, kind: "assign", name: "max", value: vr("c") }],
    },
    {
      id: ll, kind: "if",
      cond: bin(">", vr("d"), vr("max")),
      then: [{ id: mm, kind: "assign", name: "max", value: vr("d") }],
    },
    { id: nn, kind: "return", value: vr("max") },
  ];

  return {
    id: "hard-max",
    difficulty: "hard",
    bugType: "wrong-init",
    bugStmtId: e,
    expected: { returned: 9 },
    program,
    concept: {
      en: "Initialisation matters — bad initial state corrupts the whole loop's logic",
      ka: "ინიციალიზაცია მნიშვნელოვანია — მცდარი საწყისი მნიშვნელობა ანგრევს მარყუჟის ლოგიკას",
    },
    title: { en: "The Lost Maximum", ka: "დაკარგული მაქსიმუმი" },
    story: {
      en: "A scoreboard keeps reporting the wrong winner.",
      ka: "ქულათა დაფა მუდმივ მცდარ გამარჯვებულს ასახელებს.",
    },
    task: {
      en: "Find the maximum of a, b, c, d (here 4, 9, 2, 7) and return it. Expected: 9.",
      ka: "იპოვე a, b, c, d-ის მაქსიმუმი (4, 9, 2, 7) და დაახბრუნე. სასურველი: 9.",
    },
    hints: [
      {
        en: "Step through it. Does any `if` ever fire?",
        ka: "გაიარე ნაბიჯ-ნაბიჯ. რომელი `if` საერთოდ სრულდება?",
      },
      {
        en: "Compare the initial value of `max` to the candidates. Can any of them be larger?",
        ka: "შეადარე `max`-ის საწყისი მნიშვნელობა კანდიდატებს. რომელიმე შეიძლება მეტი იყოს?",
      },
      {
        en: "Initialise `max` to one of the actual candidates (e.g. `a`).",
        ka: "ჩასვი `max`-ში ერთ-ერთი კანდიდატი (მაგ. `a`).",
      },
    ],
    fixes: [
      {
        id: "init-a",
        correct: true,
        label: { en: "Initialise `max` to `a` (the first value)", ka: "ჩასვი `max`-ში `a` (პირველი მნიშვნელობა)" },
        explanation: {
          en: "When seeking a maximum, initialise to the first candidate (or -∞). 100 is artificially high so nothing ever beats it.",
          ka: "მაქსიმუმის საძიებლად, ინიციალიზება უნდა მოხდეს პირველი კანდიდატით (ან -∞). 100 ხელოვნურად დიდია — არაფერი ვერ გადააჭარბებს.",
        },
        applyToProgram: (p) => p.map(s =>
          s.id === e && s.kind === "assign" ? { ...s, value: vr("a") } : s
        ),
      },
      {
        id: "init-zero",
        correct: false,
        label: { en: "Initialise `max` to 0", ka: "ჩასვი `max`-ში 0" },
        explanation: {
          en: "Works for THIS data, but fails if all numbers are negative. Brittle — not a real fix.",
          ka: "ამ მონაცემებისთვის მუშაობს, მაგრამ ჩავარდება, თუ ყველა რიცხვი უარყოფითია. მყიფე გამოსწორება.",
        },
        applyToProgram: (p) => p.map(s =>
          s.id === e && s.kind === "assign" ? { ...s, value: num(0) } : s
        ),
      },
      {
        id: "flip",
        correct: false,
        label: { en: "Change `>` to `<` everywhere", ka: "შეცვალე `>` `<`-ით ყველგან" },
        explanation: {
          en: "Now you'd compute the *minimum* of values that are below 100. Wrong direction.",
          ka: "ახლა გამოთვლი იმ მნიშვნელობების *მინიმუმს*, რომლებიც 100-ზე ნაკლებია. მცდარი მიმართულება.",
        },
        applyToProgram: (p) => p.map(s =>
          s.kind === "if"
            ? { ...s, cond: { ...s.cond as Extract<typeof s.cond, {kind:"bin"}>, op: "<" as const } as typeof s.cond }
            : s
        ),
      },
    ],
  };
})();

// ─── exports ──────────────────────────────────────────────────────────────────

export const PUZZLE_DEFS: PuzzleDef[] = [p1, p2, p3, p4, p5, p6];

export function serializePuzzle(def: PuzzleDef, lang: UiLanguage = "en") {
  const pick = (t: LocalizedText) => t[lang] ?? t.en;
  return {
    id: def.id,
    difficulty: def.difficulty,
    bugType: def.bugType,
    bugStmtId: def.bugStmtId,
    programmingLanguage: "any" as const,
    format: "ast" as const,
    interaction: "pick-fix" as const,
    concept: pick(def.concept),
    title: pick(def.title),
    story: pick(def.story),
    task: pick(def.task),
    program: def.program,
    expected: def.expected,
    hints: def.hints.map(h => pick(h)),
    fixes: def.fixes.map(f => ({
      id: f.id,
      correct: f.correct,
      label: pick(f.label),
      explanation: pick(f.explanation),
      appliedProgram: f.applyToProgram(def.program),
    })),
  };
}

export function getPuzzlesByDifficulty(
  difficulty: Exclude<"easy" | "medium" | "hard" | "adaptive", "adaptive">,
  lang: UiLanguage = "en"
) {
  return PUZZLE_DEFS.filter(p => p.difficulty === difficulty).map(p => serializePuzzle(p, lang));
}

export function getPuzzleById(id: string, lang: UiLanguage = "en") {
  const def = PUZZLE_DEFS.find(p => p.id === id);
  return def ? serializePuzzle(def, lang) : null;
}

export function pickNextPuzzle(opts: {
  difficulty: "easy" | "medium" | "hard" | "adaptive";
  lang?: UiLanguage;
  solved?: string[];
  recent?: { puzzleId: string; correct: boolean; hintsUsed: number }[];
}) {
  const { difficulty, lang = "en", solved = [], recent = [] } = opts;

  let targetDiff: "easy" | "medium" | "hard";

  if (difficulty === "adaptive") {
    const last5 = recent.slice(-5);
    const correctRate = last5.length
      ? last5.filter(a => a.correct).length / last5.length
      : 0.5;
    const avgHints = last5.length
      ? last5.reduce((s, a) => s + a.hintsUsed, 0) / last5.length
      : 1;
    if (correctRate > 0.7 && avgHints < 1) targetDiff = "hard";
    else if (correctRate > 0.5) targetDiff = "medium";
    else targetDiff = "easy";
  } else {
    targetDiff = difficulty;
  }

  const pool = PUZZLE_DEFS.filter(p => p.difficulty === targetDiff);
  const unseen = pool.filter(p => !solved.includes(p.id));
  const list = unseen.length ? unseen : pool;
  const def = list[Math.floor(Math.random() * list.length)];
  return serializePuzzle(def, lang);
}
