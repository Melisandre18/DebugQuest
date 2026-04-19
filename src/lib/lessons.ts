// Per-bug-type lesson content. Shown in the "Learn" tab before fixing.
import type { BugType } from "@/lib/puzzle-engine";

export interface Lesson {
  title: string;
  /** One-line concept summary, shown as a chip. */
  concept: string;
  /** Markdown-ish blocks (we render simply). */
  intro: string;
  /** A short worked example, shown as code. */
  example: { language: "python"; code: string; explanation: string };
  /** Three key takeaways. */
  keyIdeas: string[];
  /** A single multiple-choice quiz question to confirm understanding. */
  quiz: { question: string; options: string[]; correctIndex: number; rationale: string };
  /** Where to read more (internal anchor or link label). */
  furtherReading: string[];
}

export const LESSONS: Record<BugType, Lesson> = {
  "swapped-branches": {
    title: "Sequence: order of execution",
    concept: "Programs run statements top-to-bottom, one at a time.",
    intro:
      "A program is a list of instructions for the computer. It executes them strictly in the order they appear. Two programs with the same instructions in a different order can produce completely different results.",
    example: {
      language: "python",
      code: "print(\"Hello\")\nprint(\"World\")",
      explanation:
        "Line 1 runs first → prints \"Hello\". Then line 2 runs → prints \"World\". Swap the lines and the output reverses.",
    },
    keyIdeas: [
      "Statements execute top to bottom.",
      "Order is part of the logic — reordering changes the meaning.",
      "When debugging, read the program in execution order, not visual order.",
    ],
    quiz: {
      question: "If you swap the two print statements above, what is printed first?",
      options: ["Hello", "World", "Both at the same time", "Nothing"],
      correctIndex: 1,
      rationale: "Whichever statement appears first in source order runs first.",
    },
    furtherReading: ["Sequence", "Statements vs expressions", "Control flow basics"],
  },

  "wrong-operator": {
    title: "Comparison operators",
    concept: "==, !=, <, <=, >, >= each accept a different set of values.",
    intro:
      "A comparison evaluates to true or false. Picking the wrong operator quietly changes which values pass the check — and therefore which branch of the program runs.",
    example: {
      language: "python",
      code: "age = 18\nif age >= 18:\n    print(\"Welcome\")",
      explanation:
        ">= matches 18 AND every number above it. Using > would exclude 18 itself; using == would only match exactly 18.",
    },
    keyIdeas: [
      "Read conditions out loud and check each boundary value.",
      "<= and >= are inclusive; < and > are strict.",
      "When the spec says \"or more\" / \"or less\", you almost always want >= or <=.",
    ],
    quiz: {
      question: "Which operator allows EXACTLY the values 18, 19, 20, …?",
      options: ["age > 18", "age >= 18", "age == 18", "age != 18"],
      correctIndex: 1,
      rationale: ">= 18 includes 18 and everything above.",
    },
    furtherReading: ["Boolean expressions", "Short-circuit evaluation", "Truthiness"],
  },

  "off-by-one": {
    title: "Loop bounds & off-by-one errors",
    concept: "Loops are inclusive/exclusive in different ways depending on the language.",
    intro:
      "A loop iterates over a range of values. The single most common bug in programming is being off by one at the boundary — running one too many or one too few iterations.",
    example: {
      language: "python",
      code: "total = 0\nfor i in range(1, 6):   # i = 1, 2, 3, 4, 5\n    total = total + i\nreturn total           # 15",
      explanation:
        "Python's range(1, 6) is exclusive at the upper bound, so i takes the values 1..5 — five iterations. Writing range(1, 5) would only sum to 10.",
    },
    keyIdeas: [
      "Always verify the FIRST and LAST iteration of any loop.",
      "Python range is half-open [a, b); JS for(i=a; i<=b; i++) is inclusive.",
      "When in doubt, count the iterations on paper.",
    ],
    quiz: {
      question: "How many times does range(0, 5) iterate in Python?",
      options: ["4", "5", "6", "Depends on the variable"],
      correctIndex: 1,
      rationale: "range(0, 5) yields 0, 1, 2, 3, 4 → 5 values.",
    },
    furtherReading: ["Loop semantics", "Half-open intervals", "Iteration vs recursion"],
  },

  "infinite-loop": {
    title: "Loop termination",
    concept: "A while loop stops only when its condition becomes false.",
    intro:
      "A while loop keeps repeating its body forever unless something inside the body moves a variable toward making the condition false. Forgetting to update that variable — or moving it the wrong way — creates an infinite loop.",
    example: {
      language: "python",
      code: "n = 3\nwhile n > 0:\n    print(n)\n    n = n - 1   # crucial: drives n toward 0",
      explanation:
        "Each iteration decreases n. After three iterations n is 0, the condition n > 0 becomes false, and the loop exits.",
    },
    keyIdeas: [
      "Identify the loop variable in the condition.",
      "Make sure the body changes that variable in the right direction.",
      "Mentally simulate the first 2–3 iterations to confirm progress.",
    ],
    quiz: {
      question: "while n > 0, body does n = n + 1, starting at n = 3. What happens?",
      options: ["Runs 3 times", "Runs 0 times", "Runs forever", "Throws an error"],
      correctIndex: 2,
      rationale: "n grows away from 0, so n > 0 is always true — infinite loop.",
    },
    furtherReading: ["Loop invariants", "Termination proofs", "Halting problem (informal)"],
  },

  "wrong-init": {
    title: "Initialisation matters",
    concept: "An accumulator's starting value defines what the loop is computing.",
    intro:
      "Loops that build up a result (sum, product, max, min, count) start from an initial value. The wrong starting value silently corrupts every iteration that follows.",
    example: {
      language: "python",
      code: "total = 0          # correct for SUM\nfor x in [4, 9, 2]:\n    total = total + x\n# total = 15",
      explanation:
        "Sum starts at 0 (the additive identity). For a product, start at 1. For a max, start at the first element or -infinity.",
    },
    keyIdeas: [
      "Sum → start at 0. Product → start at 1.",
      "Max → start at first candidate (or -∞). Min → start at first (or +∞).",
      "Never start max at a hard-coded large number; the data may not exceed it.",
    ],
    quiz: {
      question: "You want the maximum of [4, 9, 2, 7]. What's the safest starting value for `max`?",
      options: ["0", "100", "the first element (4)", "-1"],
      correctIndex: 2,
      rationale: "Initialising to the first candidate guarantees correctness for any data.",
    },
    furtherReading: ["Accumulator pattern", "Identity elements", "Reduce / fold"],
  },

  "wrong-condition": {
    title: "Nested conditions & order of checks",
    concept: "When conditions overlap, more specific cases must be checked first.",
    intro:
      "If two conditions can both be true, the FIRST matching branch wins. Putting the general case before the specific case means the specific case never runs.",
    example: {
      language: "python",
      code: "if i % 15 == 0:    # most specific\n    print(\"FizzBuzz\")\nelif i % 3 == 0:\n    print(\"Fizz\")\nelif i % 5 == 0:\n    print(\"Buzz\")\nelse:\n    print(i)",
      explanation:
        "15 is divisible by both 3 and 5. If we checked %3 first, 15 would print \"Fizz\" and never reach the FizzBuzz branch.",
    },
    keyIdeas: [
      "Most specific → most general, top to bottom.",
      "Try every boundary case in your head: what if BOTH conditions are true?",
      "If branches don't depend on each other, consider explicit AND/OR.",
    ],
    quiz: {
      question: "With %3 checked BEFORE %15, what does 15 print?",
      options: ["FizzBuzz", "Fizz", "Buzz", "15"],
      correctIndex: 1,
      rationale: "The %3 branch matches first and prints 'Fizz', so the FizzBuzz branch never runs.",
    },
    furtherReading: ["if/elif chains", "Mutually exclusive branches", "Decision tables"],
  },
};

export function getLesson(b: BugType): Lesson {
  return LESSONS[b];
}
