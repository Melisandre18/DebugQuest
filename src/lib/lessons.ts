// Per-bug-type lesson content. Shown in the "Learn" tab before fixing.
import type { BugType, Language as ProgrammingLanguage } from "@/lib/puzzle-engine";

type LocalizedString = { en: string; ka: string };

export interface Lesson {
  title: LocalizedString;
  concept: LocalizedString;
  intro: LocalizedString;
  examples: Record<ProgrammingLanguage, { code: string; explanation: LocalizedString }>;
  keyIdeas: LocalizedString[];
  quiz: {
    question: LocalizedString;
    options: LocalizedString[];
    correctIndex: number;
    rationale: LocalizedString;
  };
  furtherReading: LocalizedString[];
}

export function pickL(text: LocalizedString, lang: "en" | "ka"): string {
  return text[lang] ?? text.en;
}

export function getExampleForLanguage(lesson: Lesson, lang: ProgrammingLanguage) {
  return lesson.examples[lang] || lesson.examples.python;
}

export const LESSONS: Record<BugType, Lesson> = {
  "swapped-branches": {
    title: {
      en: "Order of execution",
      ka: "შესრულების თანმიმდევრობა",
    },
    concept: {
      en: "Programs run statements top to bottom, one at a time",
      ka: "პროგრამა ბრძანებებს ასრულებს ზემოდან ქვემოთ, თითო მოქმედებას ყოველ ნაბიჯზე",
    },
    intro: {
      en: "A program is a list of instructions for the computer. It executes them strictly in the order they appear. Two programs with the same instructions in a different order can produce completely different results",
      ka: "პროგრამა არის კომპიუტერისთვის ინსტრუქციების სია. კომპიუტერი ასრულებს მათ ზუსტად იმ თანმიმდევრობით, რომლითაც ისინია ჩაწერილი. ორი პროგრამა ერთი და იგივე ინსტრუქციებით, თუმცა სხვადასხვა თანმიმდევრობით, სრულიად განსხვავებულ შედეგებს მოგვცემს",
    },
    examples: {
      python: {
        code: "print(\"Hello\")\nprint(\"World\")",
        explanation: {
          en: "Line 1 runs first → prints \"Hello\". Then line 2 runs → prints \"World\". Swap the lines and the output reverses.",
          ka: "1-ლი სტრიქონი სრულდება პირველი → ბეჭდავს \"Hello\" -ს. შემდეგ ეშვება მე-2 → \"World\". ადგილების გაცვლა შედეგს შეაბრუნებს.",
        },
      },
      javascript: {
        code: "console.log(\"Hello\");\nconsole.log(\"World\");",
        explanation: {
          en: "Line 1 runs first → prints \"Hello\". Then line 2 runs → prints \"World\". Swap the lines and the output reverses.",
          ka: "1-ლი სტრიქონი სრულდება პირველი → ბეჭდავს \"Hello\" -ს. შემდეგ ეშვება მე-2 → \"World\". ადგილების გაცვლა შედეგს შეაბრუნებს.",
        },
      },
      cpp: {
        code: "#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << \"Hello\" << endl;\n    cout << \"World\" << endl;\n    return 0;\n}",
        explanation: {
          en: "Line 3 runs first → prints \"Hello\". Then line 4 runs → prints \"World\". Swap the lines and the output reverses",
          ka: "მე-3 სტრიქონი სრულდება პირველი → ბეჭდავს \"Hello\" -ს. შემდეგ ეშვება მე-4 → \"World\". ადგილების გაცვლა შედეგს შეაბრუნებს",
        },
      },
      java: {
        code: "public class Main {\n    public static void main(String[] args) {\n        System.out.println(\"Hello\");\n        System.out.println(\"World\");\n    }\n}",
        explanation: {
          en: "Line 3 runs first → prints \"Hello\". Then line 4 runs → prints \"World\". Swap the lines and the output reverses",
          ka: "მე-3 სტრიქონი სრულდება პირველი → ბეჭდავს \"Hello\" -ს. შემდეგ ეშვება მე-4 → \"World\". ადგილების გაცვლა შედეგს შეაბრუნებს",
        },
      },
    },
    keyIdeas: [
      { en: "Statements execute top to bottom.", ka: "ბრძანებები სრულდება ზემოდან ქვემოთ" },
      { en: "Order is part of the logic — reordering changes the meaning", ka: "თანმიმდევრობა ლოგიკის ნაწილია — გადალაგება ცვლის მნიშვნელობას" },
      { en: "When debugging, read the program in execution order, not visual order", ka: "დებაგინგის დროს წაიკითხე პროგრამა შესრულების თანმიმდევრობით და არა ვიზუალური თანმიმდევრობით" },
    ],
    quiz: {
      question: {
        en: "If you swap the two print statements above, what is printed first?",
        ka: "თუ ორ print ბრძანებას ადგილებს გაუცვლი, რა დაიბეჭდება პირველი?",
      },
      options: [
        { en: "Hello", ka: "Hello" },
        { en: "World", ka: "World" },
        { en: "Both at the same time", ka: "ორივე ერთდროულად" },
        { en: "Nothing", ka: "არაფერი" },
      ],
      correctIndex: 1,
      rationale: {
        en: "Whichever statement appears first in source order runs first",
        ka: "კოდის სიაში პირველ ადგილზე მდგომი ბრძანება პირველ სრულდება",
      },
    },
    furtherReading: [
      { en: "Sequence", ka: "თანმიმდევრობა" },
      { en: "Statements vs expressions", ka: "ბრძანებები და გამოსახულებები" },
      { en: "Control flow basics", ka: "კონტროლის ნაკადის საფუძვლები" },
    ],
  },

  "wrong-operator": {
    title: {
      en: "Comparison operators",
      ka: "შედარების ოპერატორები",
    },
    concept: {
      en: "==, !=, <, <=, >, >= each accept a different set of values",
      ka: "==, !=, <, <=, >, >= თითოეული სხვადასხვა სიმრავლეს ირჩევს",
    },
    intro: {
      en: "A comparison evaluates to true or false. Picking the wrong operator changes which values pass the check and therefore which branch of the program runs.",
      ka: "შედარება გვიბრუნებს true ან false. არასწორი ოპერატორი ცვლის იმ მნიშვნელობების სიმრავლეს, რომლებიც შემოწმებას გადიან და, შესაბამისად იმას, პროგრამის რომელი ნაწილი სრულდება.",
    },
    examples: {
      python: {
        code: "age = 18\nif age >= 18:\n    print(\"Welcome\")",
        explanation: {
          en: ">= matches 18 AND every number above it, Using > would exclude 18 itself, using == would only match exactly 18",
          ka: ">= ირჩევს 18-ს და მეტს, > გამორიცხავს 18-ს, == ზუსტად 18-ს ირჩევს",
        },
      },
      javascript: {
        code: "let age = 18;\nif (age >= 18) {\n    console.log(\"Welcome\");\n}",
        explanation: {
          en: ">= matches 18 AND every number above it, Using > would exclude 18 itself, using == would only match exactly 18",
          ka: ">= ირჩევს 18-ს და მეტს, > გამორიცხავს 18-ს, == ზუსტად 18-ს ირჩევს",
        },
      },
      cpp: {
        code: "int age = 18;\nif (age >= 18) {\n    cout << \"Welcome\" << endl;\n}",
        explanation: {
          en: ">= matches 18 AND every number above it, Using > would exclude 18 itself, using == would only match exactly 18",
          ka: ">= ირჩევს 18-ს და მეტს, > გამორიცხავს 18-ს, == ზუსტად 18-ს ირჩევს",
        },
      },
      java: {
        code: "int age = 18;\nif (age >= 18) {\n    System.out.println(\"Welcome\");\n}",
        explanation: {
          en: ">= matches 18 AND every number above it, Using > would exclude 18 itself, using == would only match exactly 18",
          ka: ">= ირჩევს 18-ს და მეტს, > გამორიცხავს 18-ს, == ზუსტად 18-ს ირჩევს",
        },
      },
    },
    keyIdeas: [
      { en: "Read conditions out loud and check each boundary value.", ka: "პირობა ხმამაღლა წაიკითხე და შეამოწმე ყოველი ზღვრული მნიშვნელობა" },
      { en: "<= and >= are inclusive; < and > are strict.", ka: "<= და >= მოიცავს < და > გამორიცხავს" },
      { en: "When the spec says \"or more\" / \"or less\", you almost always want >= or <=", ka: "თუ პირობა ამბობს \"ან მეტი\" / \"ან ნაკლები\", თითქმის ყოველთვის გჭირდება >= ან <=" },
    ],
    quiz: {
      question: {
        en: "Which operator allows EXACTLY the values 18, 19, 20, …?",
        ka: "რომელი ოპერატორი ირჩევს ზუსტად 18, 19, 20, … მნიშვნელობებს?",
      },
      options: [
        { en: "age > 18", ka: "age > 18" },
        { en: "age >= 18", ka: "age >= 18" },
        { en: "age == 18", ka: "age == 18" },
        { en: "age != 18", ka: "age != 18" },
      ],
      correctIndex: 1,
      rationale: {
        en: ">= 18 includes 18 and everything above",
        ka: ">= 18 მოიცავს 18-ს და ყველა მასზე დიდ რიცხვს",
      },
    },
    furtherReading: [
      { en: "Boolean expressions", ka: "ლოგიკური ოპერატორები" },
      { en: "Short-circuit evaluation", ka: "მოკლე შეფასება" },
      { en: "Conditionality", ka: "პირობითობა" },
    ],
  },

  "off-by-one": {
    title: {
      en: "Loop bounds & off by one errors",
      ka: "ციკლის საზღვრები და off by one შეცდომები",
    },
    concept: {
      en: "Loops are inclusive/exclusive in different ways depending on the language",
      ka: "ციკლები სხვადასხვა ენაში ჩართვითი ან გამომრიცხველია ",
    },
    intro: {
      en: "A loop iterates over a range of values. The single most common bug in programming is being off by one at the boundary — running one too many or one too few iterations",
      ka: "ციკლი იტერაციას ასრულებს გარკვეული დიაპაზონის მნიშვნელობებში. ყველაზე გავრცელებული შეცდომა პროგრამირებაში არის ზღვრული შეცდომა: ერთით ზედმეტი ან ნაკლები იტერაცია",
    },
    examples: {
      python: {
        code: "total = 0\nfor i in range(1, 6):   # i = 1, 2, 3, 4, 5\n    total = total + i\nreturn total           # 15",
        explanation: {
          en: "Python's range(1, 6) is exclusive at the upper bound, so i takes the values 1..5 — five iterations. Writing range(1, 5) would only sum to 10",
          ka: "Python-ის range(1, 6) გამორიცხავს ზედა ზღვარს, ამიტომ i ღებულობს 1..5 — 5 იტერაცია. range(1, 5) მხოლოდ 10-ს მოგვცემდა",
        },
      },
      javascript: {
        code: "let total = 0;\nfor (let i = 1; i <= 5; i++) {   // i = 1, 2, 3, 4, 5\n    total = total + i;\n}\nreturn total;           // 15",
        explanation: {
          en: "JavaScript's <= is inclusive, so i takes the values 1..5 — five iterations. Using < 5 would only sum to 10",
          ka: "JavaScript-ის <= ჩათვლითაა, ამიტომ i ღებულობს 1..5 — 5 იტერაცია. < 5-ის გამოყენება მხოლოდ 10-ს მოგვცემდა",
        },
      },
      cpp: {
        code: "int total = 0;\nfor (int i = 1; i <= 5; i++) {   // i = 1, 2, 3, 4, 5\n    total = total + i;\n}\nreturn total;           // 15",
        explanation: {
          en: "C++ loop with <= is inclusive, so i takes the values 1..5 — five iterations. Using < 5 would only sum to 10",
          ka: "C++-ის <= ჩათვლითაა, ამიტომ i ღებულობს 1..5 — 5 იტერაცია. < 5-ის გამოყენება მხოლოდ 10-ს მოგვცემდა",
        },
      },
      java: {
        code: "int total = 0;\nfor (int i = 1; i <= 5; i++) {   // i = 1, 2, 3, 4, 5\n    total = total + i;\n}\nreturn total;           // 15",
        explanation: {
          en: "Java loop with <= is inclusive, so i takes the values 1..5 — five iterations. Using < 5 would only sum to 10",
          ka: "Java-ს <= ჩათვლითაა, ამიტომ i ღებულობს 1..5 — 5 იტერაცია. < 5-ის გამოყენება მხოლოდ 10-ს მოგვცემდა",
        },
      },
    },
    keyIdeas: [
      { en: "Always verify the FIRST and LAST iteration of any loop", ka: "ყოველთვის შეამოწმე ნებისმიერი ციკლის ᲞᲘᲠᲕᲔᲚᲘ და ᲑᲝᲚᲝ იტერაცია" },
      { en: "Python range is half-open [a, b); JS for(i=a; i<=b; i++) is inclusive.", ka: "Python-ის range ნახევრადღია [a, b); JS-ის for(i=a; i<=b; i++) მოიცავს" },
      { en: "When in doubt, count the iterations on paper.", ka: "ეჭვის შემთხვევაში, იტერაციები ხელით დაითვალე" },
    ],
    quiz: {
      question: {
        en: "How many times does range(0, 5) iterate in Python?",
        ka: "რამდენჯერ ასრულებს range(0, 5) Python-ში?",
      },
      options: [
        { en: "4", ka: "4" },
        { en: "5", ka: "5" },
        { en: "6", ka: "6" },
        { en: "Depends on the variable", ka: "დამოკიდებულია ცვლადზე" },
      ],
      correctIndex: 1,
      rationale: {
        en: "range(0, 5) yields 0, 1, 2, 3, 4 → 5 values.",
        ka: "range(0, 5) გვაძლევს 0, 1, 2, 3, 4 → 5 მნიშვნელობას.",
      },
    },
    furtherReading: [
      { en: "Loop semantics", ka: "ციკლის სემანტიკა" },
      { en: "Half-open intervals", ka: "ნახევრადღია ინტერვალები" },
      { en: "Iteration vs recursion", ka: "იტერაცია vs რეკურსია" },
    ],
  },

  "infinite-loop": {
    title: {
      en: "Loop termination",
      ka: "ციკლის დასრულება",
    },
    concept: {
      en: "A while loop stops only when its condition becomes false",
      ka: "while ციკლი ჩერდება მხოლოდ მაშინ, როდესაც მისი პირობა false-ად იქცევა",
    },
    intro: {
      en: "A while loop keeps repeating its body forever unless something inside the body moves a variable toward making the condition false. Forgetting to update that variable or moving it the wrong way creates an infinite loop",
      ka: "while ციკლი ბრძანებებს უსასრულოდ იმეორებს, თუ რაიმე პირობა false-ად არ შეიცვლება. ამ მოქმედების დავიწყება ქმნის უსასრულო ციკლს",
    },
    examples: {
      python: {
        code: "n = 3\nwhile n > 0:\n    print(n)\n    n = n - 1   # crucial: drives n toward 0",
        explanation: {
          en: "Each iteration decreases n. After three iterations n is 0, the condition n > 0 becomes false, and the loop exits",
          ka: "ყოველ იტერაციაში n მცირდება. სამი იტერაციის შემდეგ n = 0, პირობა n > 0 false-ად იქცევა და ციკლი ჩერდება",
        },
      },
      javascript: {
        code: "let n = 3;\nwhile (n > 0) {\n    console.log(n);\n    n = n - 1;   // crucial: drives n toward 0\n}",
        explanation: {
          en: "Each iteration decreases n. After three iterations n is 0, the condition n > 0 becomes false, and the loop exits",
          ka: "ყოველ იტერაციაში n მცირდება. სამი იტერაციის შემდეგ n = 0, პირობა n > 0 false-ად იქცევა და ციკლი ჩერდება",
        },
      },
      cpp: {
        code: "int n = 3;\nwhile (n > 0) {\n    cout << n << endl;\n    n = n - 1;   // crucial: drives n toward 0\n}",
        explanation: {
          en: "Each iteration decreases n. After three iterations n is 0, the condition n > 0 becomes false, and the loop exits",
          ka: "ყოველ იტერაციაში n მცირდება. სამი იტერაციის შემდეგ n = 0, პირობა n > 0 false-ად იქცევა და ციკლი ჩერდება",
        },
      },
      java: {
        code: "int n = 3;\nwhile (n > 0) {\n    System.out.println(n);\n    n = n - 1;   // crucial: drives n toward 0\n}",
        explanation: {
          en: "Each iteration decreases n. After three iterations n is 0, the condition n > 0 becomes false, and the loop exits",
          ka: "ყოველ იტერაციაში n მცირდება. სამი იტერაციის შემდეგ n = 0, პირობა n > 0 false-ად იქცევა და ციკლი ჩერდება",
        },
      },
    },
    keyIdeas: [
      { en: "Identify the loop variable in the condition", ka: "გამოყავი პირობაში მონაწილე ცვლადი" },
      { en: "Make sure the body changes that variable in the right direction.", ka: "დარწმუნდი, რომ ბრძანება ცვლის ამ ცვლადს სწორი მიმართულებით" },
      { en: "Mentally simulate the first 2–3 iterations to confirm progress.", ka: "გონებაში 2-3 პირველი იტერაცია გაიარე, რათა პროგრესი დაადასტურო" },
    ],
    quiz: {
      question: {
        en: "while n > 0, body does n = n + 1, starting at n = 3. What happens?",
        ka: "while n > 0, ბრძანებები ასრულებს n = n + 1, n = 3-ით ვიწყებთ. რა მოხდება?",
      },
      options: [
        { en: "Runs 3 times", ka: "3-ჯერ სრულდება" },
        { en: "Runs 0 times", ka: "0-ჯერ სრულდება" },
        { en: "Runs forever", ka: "უსასრულოდ სრულდება" },
        { en: "Throws an error", ka: "შეცდომა" },
      ],
      correctIndex: 2,
      rationale: {
        en: "n grows away from 0, so n > 0 is always true — infinite loop",
        ka: "n 0-ს შორდება, ამიტომ n > 0 ყოველთვის true-ა — უსასრულო ციკლი",
      },
    },
    furtherReading: [
      { en: "Loop invariants", ka: "ციკლის ინვარიანტები" },
      { en: "Termination proofs", ka: "დასრულება" },
      { en: "Halting problem", ka: "შეჩერების პრობლემა" },
    ],
  },

  "wrong-init": {
    title: {
      en: "Initialisation matters",
      ka: "ინიციალიზაცია მნიშვნელოვანია",
    },
    concept: {
      en: "Starting value defines what the loop is computing",
      ka: "საწყისი მნიშვნელობა განსაზღვრავს, რას ითვლის ციკლი",
    },
    intro: {
      en: "Loops that build up a result (sum, product, max, min, count) start from an initial value. The wrong starting value corrupts every iteration that follows",
      ka: "ციკლები, რომლებიც მოქმედებენ შედეგამდე (ჯამი, ნამრავლი, მაქსიმუმი, მინიმუმი, დათვლა), იწყებენ საწყისი მნიშვნელობიდან. მცდარი საწყისი მნიშვნელობა გააფუჭებს ყოველ მომდევნო იტერაციას",
    },
    examples: {
      python: {
        code: "total = 0          # correct for SUM\nfor x in [4, 9, 2]:\n    total = total + x\n# total = 15",
        explanation: {
          en: "Sum starts at 0 (the additive identity). For a product, start at 1. For a max, start at the first element or -infinity.",
          ka: "ჯამი იწყება 0-ით (მიმატების ნეიტრალური ელემენტი). ნამრავლისთვის — 1-ით. მაქსიმუმისთვის — პირველი ელემენტი ან -∞.",
        },
      },
      javascript: {
        code: "let total = 0;          // correct for SUM\nfor (let x of [4, 9, 2]) {\n    total = total + x;\n}\n// total = 15",
        explanation: {
          en: "Sum starts at 0 (the additive identity). For a product, start at 1. For a max, start at the first element or -infinity.",
          ka: "ჯამი იწყება 0-ით (მიმატების ნეიტრალური ელემენტი). ნამრავლისთვის — 1-ით. მაქსიმუმისთვის — პირველი ელემენტი ან -∞.",
        },
      },
      cpp: {
        code: "int total = 0;          // correct for SUM\nint arr[] = {4, 9, 2};\nfor (int x : arr) {\n    total = total + x;\n}\n// total = 15",
        explanation: {
          en: "Sum starts at 0 (the additive identity). For a product, start at 1. For a max, start at the first element or -infinity.",
          ka: "ჯამი იწყება 0-ით (მიმატების ნეიტრალური ელემენტი). ნამრავლისთვის — 1-ით. მაქსიმუმისთვის — პირველი ელემენტი ან -∞.",
        },
      },
      java: {
        code: "int total = 0;          // correct for SUM\nint[] arr = {4, 9, 2};\nfor (int x : arr) {\n    total = total + x;\n}\n// total = 15",
        explanation: {
          en: "Sum starts at 0 (the additive identity). For a product, start at 1. For a max, start at the first element or -infinity.",
          ka: "ჯამი იწყება 0-ით (მიმატების ნეიტრალური ელემენტი). ნამრავლისთვის — 1-ით. მაქსიმუმისთვის — პირველი ელემენტი ან -∞.",
        },
      },
    },
    keyIdeas: [
      { en: "Sum → start at 0. Product → start at 1.", ka: "ჯამი → 0-ით. ნამრავლი → 1-ით." },
      { en: "Max → start at first candidate (or -∞). Min → start at first (or +∞).", ka: "მაქსიმუმი → პირველი კანდიდატი (ან -∞). მინიმუმი → პირველი (ან +∞)." },
      { en: "Never start max at a hard coded large number, the data may not exceed it", ka: "არასოდეს დაიწყო max ხელით გაწერილი დიდი რიცხვით, მონაცემებმა მას  შეიძლება ვერ გადააჭარბოს" },
    ],
    quiz: {
      question: {
        en: "You want the maximum of [4, 9, 2, 7]. What's the safest starting value for `max`?",
        ka: "გინდა [4, 9, 2, 7]-ის მაქსიმუმი. `max`-ის ყველაზე სწორი საწყისი მნიშვნელობა?",
      },
      options: [
        { en: "0", ka: "0" },
        { en: "100", ka: "100" },
        { en: "the first element (4)", ka: "პირველი ელემენტი (4)" },
        { en: "-1", ka: "-1" },
      ],
      correctIndex: 2,
      rationale: {
        en: "Initialising to the first candidate guarantees correctness for any data.",
        ka: "პირველი კანდიდატით ინიციალიზება ნებისმიერი მონაცემისთვის სწორ შედეგს იძლევა.",
      },
    },
    furtherReading: [
      { en: "Starting pattern", ka: "საწყისი პატერნები" },
      { en: "Identity elements", ka: "ნეიტრალური ელემენტები" },
      { en: "Reduce / fold", ka: "Reduce / fold" },
    ],
  },

  "wrong-condition": {
    title: {
      en: "Nested conditions & order of checks",
      ka: "ჩაშენებული პირობები და შემოწმებების თანმიმდევრობა",
    },
    concept: {
      en: "When conditions overlap, more specific cases must be checked first",
      ka: "პირობების გადაფარვისას, კონკრეტულები ზოგადებამდე უნდა შემოწმდეს",
    },
    intro: {
      en: "If two conditions can both be true, the FIRST matching branch wins. Putting the general case before the specific case means the specific case never runs",
      ka: "თუ ორი პირობა ერთდროულად შეიძლება მართალი იყოს, ᲞᲘᲠᲕᲔᲚᲘ დამთხვევა პრიორიტეტდება. ზოგადი შემთხვევის კონკრეტულის წინ დაყენება ნიშნავს, რომ კონკრეტული შემთხვევა არასდროს სრულდება",
    },
    examples: {
      python: {
        code: "if i % 15 == 0:    # most specific\n    print(\"FizzBuzz\")\nelif i % 3 == 0:\n    print(\"Fizz\")\nelif i % 5 == 0:\n    print(\"Buzz\")\nelse:\n    print(i)",
        explanation: {
          en: "15 is divisible by both 3 and 5. If we checked %3 first, 15 would print \"Fizz\" and never reach the FizzBuzz branch.",
          ka: "15 იყოფა 3-ზეც და 5-ზეც. %3-ის პირველ შემოწმებაზე, 15 დაბეჭდავდა \"Fizz\"-ს და FizzBuzz ნაწილს ვეღარ მიაღწევდა.",
        },
      },
      javascript: {
        code: "if (i % 15 === 0) {    // most specific\n    console.log(\"FizzBuzz\");\n} else if (i % 3 === 0) {\n    console.log(\"Fizz\");\n} else if (i % 5 === 0) {\n    console.log(\"Buzz\");\n} else {\n    console.log(i);\n}",
        explanation: {
          en: "15 is divisible by both 3 and 5. If we checked %3 first, 15 would print \"Fizz\" and never reach the FizzBuzz branch.",
          ka: "15 იყოფა 3-ზეც და 5-ზეც. %3-ის პირველ შემოწმებაზე, 15 დაბეჭდავდა \"Fizz\"-ს და FizzBuzz ნაწილს ვეღარ მიაღწევდა.",
        },
      },
      cpp: {
        code: "if (i % 15 == 0) {    // most specific\n    cout << \"FizzBuzz\" << endl;\n} else if (i % 3 == 0) {\n    cout << \"Fizz\" << endl;\n} else if (i % 5 == 0) {\n    cout << \"Buzz\" << endl;\n} else {\n    cout << i << endl;\n}",
        explanation: {
          en: "15 is divisible by both 3 and 5. If we checked %3 first, 15 would print \"Fizz\" and never reach the FizzBuzz branch.",
          ka: "15 იყოფა 3-ზეც და 5-ზეც. %3-ის პირველ შემოწმებაზე, 15 დაბეჭდავდა \"Fizz\"-ს და FizzBuzz ნაწილს ვეღარ მიაღწევდა.",
        },
      },
      java: {
        code: "if (i % 15 == 0) {    // most specific\n    System.out.println(\"FizzBuzz\");\n} else if (i % 3 == 0) {\n    System.out.println(\"Fizz\");\n} else if (i % 5 == 0) {\n    System.out.println(\"Buzz\");\n} else {\n    System.out.println(i);\n}",
        explanation: {
          en: "15 is divisible by both 3 and 5. If we checked %3 first, 15 would print \"Fizz\" and never reach the FizzBuzz branch.",
          ka: "15 იყოფა 3-ზეც და 5-ზეც. %3-ის პირველ შემოწმებაზე, 15 დაბეჭდავდა \"Fizz\"-ს და FizzBuzz ნაწილს ვეღარ მიაღწევდა.",
        },
      },
    },
    keyIdeas: [
      { en: "Most specific → most general, top to bottom.", ka: "ყველაზე კონკრეტული → ყველაზე ზოგადი, ზემოდან ქვემოთ." },
      { en: "Try every boundary case in your head: what if BOTH conditions are true?", ka: "ყოველი ზღვრული შემთხვევა გონებაში სცადე: რა მოხდება, თუ ორივე პირობა მართალია?" },
      { en: "If branches don't depend on each other, consider explicit AND/OR.", ka: "თუ ნაწილები ერთმანეთზე დამოკიდებული არ არის, განიხილე AND/OR." },
    ],
    quiz: {
      question: {
        en: "With %3 checked BEFORE %15, what does 15 print?",
        ka: "%3-ის %15-ამდე შემოწმებისას, 15 რას დაბეჭდავს?",
      },
      options: [
        { en: "FizzBuzz", ka: "FizzBuzz" },
        { en: "Fizz", ka: "Fizz" },
        { en: "Buzz", ka: "Buzz" },
        { en: "15", ka: "15" },
      ],
      correctIndex: 1,
      rationale: {
        en: "The %3 branch matches first and prints 'Fizz', so the FizzBuzz branch never runs.",
        ka: "%3 ნაწილი პირველი ემთხვევა და ბეჭდავს 'Fizz'-ს — FizzBuzz ნაწილი არასდროს სრულდება.",
      },
    },
    furtherReading: [
      { en: "if/elif chains", ka: "if/elif ჯაჭვები" },
      { en: "Mutually exclusive branches", ka: "ურთიერთგამომრიცხველი ნაწილები" },
      { en: "Decision tables", ka: "გადაწყვეტილების ცხრილები" },
    ],
  },
};

export function getLesson(b: BugType): Lesson {
  return LESSONS[b];
}
