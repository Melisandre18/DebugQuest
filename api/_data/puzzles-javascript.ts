// JavaScript puzzle definitions for DebugQuest.
// 10 puzzles: js-1 through js-10. Mix of fill-blank and pick-fix interactions.

interface LocalizedText { en: string; ka: string; }

interface TextPickFixDef {
  id: string; difficulty: "easy" | "medium" | "hard";
  bugType: string; programmingLanguage: "python" | "javascript" | "cpp" | "java";
  concept: LocalizedText; title: LocalizedText; story: LocalizedText; task: LocalizedText;
  hints: LocalizedText[];
  format: "text"; interaction: "pick-fix";
  code: string; bugLine?: number;
  fixes: Array<{ id: string; label: LocalizedText; correct: boolean; explanation: LocalizedText }>;
}

interface TextFillBlankDef {
  id: string; difficulty: "easy" | "medium" | "hard";
  bugType: string; programmingLanguage: "python" | "javascript" | "cpp" | "java";
  concept: LocalizedText; title: LocalizedText; story: LocalizedText; task: LocalizedText;
  hints: LocalizedText[];
  format: "text"; interaction: "fill-blank";
  codeBefore: string; codeAfter: string;
  options: Array<{ id: string; value: string; correct: boolean; explanation: LocalizedText }>;
}

type AnyTextPuzzleDef = TextPickFixDef | TextFillBlankDef;

// ─── js-1: == vs === type coercion ────────────────────────────────────────────

const js1: TextFillBlankDef = {
  id: "js-1",
  difficulty: "easy",
  bugType: "comparison-error",
  programmingLanguage: "javascript",
  concept: { en: "== performs type coercion; === checks value AND type", ka: "== ტიპის გარდაქმნას ახდენს; === ამოწმებს მნიშვნელობასაც და ტიპსაც" },
  title: { en: "The Sneaky Five", ka: "მოტყუებული ხუთი" },
  story: { en: "A form validator accepts the string '5' as a valid age instead of rejecting it, because the comparison is too loose.", ka: "ფორმის ვალიდატორი სტრიქონს '5'-ს მისაღებ ასაკად ღებულობს უარყოფის ნაცვლად, რადგან შედარება ზედმეტად ფხვიერია." },
  task: { en: "Use strict equality so the string '5' is NOT considered equal to the number 5.", ka: "გამოიყენე მკაცრი ტოლობა, რომ სტრიქონი '5' რიცხვ 5-ის ტოლი არ ჩაითვალოს." },
  hints: [
    { en: "What does '5' == 5 return in JavaScript?", ka: "რას აბრუნებს '5' == 5 JavaScript-ში?" },
    { en: "== converts types before comparing. === does not.", ka: "== ადარებამდე ტიპებს გარდაქმნის. === არ გარდაქმნის." },
    { en: "Replace == with === to require the same type.", ka: "== შეცვალე ===-ით ერთი ტიპის მოთხოვნისთვის." },
  ],
  format: "text",
  interaction: "fill-blank",
  codeBefore: `function isValidAge(age) {
  return typeof age === "number" && age `,
  codeAfter: ` 0;
}

console.log(isValidAge(5));    // true
console.log(isValidAge("5"));  // should be false`,
  options: [
    {
      id: "a", value: ">", correct: true,
      explanation: { en: "typeof age === 'number' already ensures age is a number, so > 0 correctly rejects strings before reaching this check.", ka: "typeof age === 'number' ამოწმებს ტიპს, ამიტომ > 0 სტრიქონებს პირველი შემოწმებით ანაგდებს." },
    },
    {
      id: "b", value: "== 5 ||", correct: false,
      explanation: { en: "Checking == 5 reintroduces loose equality — '5' == 5 would be true again.", ka: "== 5-ის შემოწმება ფხვიერ ტოლობას კვლავ შეიყვანს — '5' == 5 ისევ true იქნება." },
    },
    {
      id: "c", value: ">==", correct: false,
      explanation: { en: ">== is not a valid operator in JavaScript.", ka: ">== JavaScript-ში სწორი ოპერატორი არ არის." },
    },
  ],
};

// ─── js-2: var in loop closure ────────────────────────────────────────────────

const js2: TextPickFixDef = {
  id: "js-2",
  difficulty: "easy",
  bugType: "scope-error",
  programmingLanguage: "javascript",
  concept: { en: "var is function-scoped; closures inside a loop all share the same var binding", ka: "var ფუნქციის სფეროსაა; მარყუჟში დახურვები ერთ var ბმას იზიარებს" },
  title: { en: "Three Times Three", ka: "სამჯერ სამი" },
  story: { en: "A set of buttons should each log their own index, but they all log the same last value.", ka: "ღილაკების ნაკრები თითოეულს საკუთარ ინდექსს უნდა ჩაიწეროს, მაგრამ ყველა ბოლო მნიშვნელობას წერს." },
  task: { en: "Fix the loop so each callback captures its own index.", ka: "გაასწორე მარყუჟი, რომ თითოეულმა callback-მა საკუთარი ინდექსი დაიჭიროს." },
  hints: [
    { en: "What does var's scope look like compared to let?", ka: "var-ის სფერო let-ის სფეროსთან შედარებით როგორ გამოიყურება?" },
    { en: "All three closures share the same i variable — when they finally run, i is already 3.", ka: "სამივე დახურვა ერთ i ცვლადს იზიარებს — გაშვებისას i უკვე 3-ია." },
    { en: "Replace var with let to give each iteration its own block-scoped binding.", ka: "var შეცვალე let-ით, რომ ყოველ იტერაციას საკუთარი ბლოკ-სფეროს ბმა ჰქონდეს." },
  ],
  format: "text",
  interaction: "pick-fix",
  code: `const fns = [];
for (var i = 0; i < 3; i++) {
  fns.push(() => console.log(i));
}
fns[0]();  // expected 0, prints 3
fns[1]();  // expected 1, prints 3
fns[2]();  // expected 2, prints 3`,
  bugLine: 2,
  fixes: [
    {
      id: "let", correct: true,
      label: { en: "Change var to let", ka: "var → let" },
      explanation: { en: "let is block-scoped so each loop iteration creates a new binding. The closure captures its own unique i.", ka: "let ბლოკ-სფეროსაა, ამიტომ ყოველ იტერაციაზე ახალი ბმა იქმნება. დახურვა საკუთარ i-ს იჭერს." },
    },
    {
      id: "iife", correct: false,
      label: { en: "Wrap in IIFE: (function(j){ fns.push(()=>console.log(j)) })(i)", ka: "IIFE-ში გახვევა: (function(j){ fns.push(()=>console.log(j)) })(i)" },
      explanation: { en: "IIFE works but is the ES5 workaround. let is the clean modern solution.", ka: "IIFE მუშაობს, მაგრამ ES5-ის გამოსავალია. let სუფთა თანამედროვე გადაწყვეტაა." },
    },
    {
      id: "const", correct: false,
      label: { en: "Change var to const", ka: "var → const" },
      explanation: { en: "const cannot be reassigned — the i++ in the loop header would throw a TypeError.", ka: "const-ი ვერ გადაინიჭება — i++ მარყუჟის სათაურში TypeError-ს გამოიძახებს." },
    },
  ],
};

// ─── js-3: typeof null === "object" trap ──────────────────────────────────────

const js3: TextPickFixDef = {
  id: "js-3",
  difficulty: "easy",
  bugType: "comparison-error",
  programmingLanguage: "javascript",
  concept: { en: "typeof null === 'object' is a historical JS quirk; check === null explicitly", ka: "typeof null === 'object' JavaScript-ის ისტორიული ხარვეზია; === null-ით ამოწმე" },
  title: { en: "The Null Impostor", ka: "null-გარჩეული" },
  story: { en: "A null-guard function lets null values through because it relies on typeof.", ka: "null-ის დამცავი ფუნქცია null-ს გაუშვებს, რადგან typeof-ს ეყრდნობა." },
  task: { en: "Fix the guard so null is correctly detected and rejected.", ka: "გაასწორე დამცავი, რომ null სწორად გამოვლინდეს." },
  hints: [
    { en: "What does typeof null return? Is that what you expect?", ka: "typeof null-ი რას დაბრუნებს? ეს ის არის რასაც ელი?" },
    { en: "typeof null returns 'object' — a well-known JavaScript bug from 1995.", ka: "typeof null-ი 'object'-ს აბრუნებს — JavaScript-ის ცნობილი ბაგი 1995 წლიდან." },
    { en: "Use value === null for an explicit null check.", ka: "value === null გამოიყენე null-ის პირდაპირი შემოწმებისთვის." },
  ],
  format: "text",
  interaction: "pick-fix",
  code: `function processObject(value) {
  if (typeof value === "object") {
    return value.name;
  }
  return "not an object";
}

console.log(processObject(null));   // crashes: Cannot read properties of null`,
  bugLine: 2,
  fixes: [
    {
      id: "null-check", correct: true,
      label: { en: "Add value !== null to the condition", ka: "პირობაში value !== null დაამატე" },
      explanation: { en: "typeof null === 'object' so you must also guard against null explicitly: typeof value === 'object' && value !== null.", ka: "typeof null === 'object', ამიტომ null-ი ცალკე უნდა გამოიყო: typeof value === 'object' && value !== null." },
    },
    {
      id: "instanceof", correct: false,
      label: { en: "Use instanceof Object instead", ka: "instanceof Object გამოიყენე" },
      explanation: { en: "instanceof Object returns false for null (good), but also false for plain objects created with literals — not fully equivalent.", ka: "instanceof Object null-ისთვის false-ს (კარგი), მაგრამ ლიტერალით შექმნილი plain ობიექტებისთვისაც — არ არის სრული ეკვივალენტი." },
    },
    {
      id: "typeof-null", correct: false,
      label: { en: "Change to typeof value === 'null'", ka: "typeof value === 'null'-ად შეცვალე" },
      explanation: { en: "'null' is not a value typeof ever returns — the check would always be false.", ka: "'null' typeof-ის დასაბრუნებელი მნიშვნელობა არ არის — შემოწმება ყოველთვის false იქნება." },
    },
  ],
};

// ─── js-4: NaN !== NaN comparison ─────────────────────────────────────────────

const js4: TextFillBlankDef = {
  id: "js-4",
  difficulty: "medium",
  bugType: "comparison-error",
  programmingLanguage: "javascript",
  concept: { en: "NaN is the only value not equal to itself; use Number.isNaN() to detect it", ka: "NaN ერთადერთი მნიშვნელობაა, რომელიც საკუთარ თავს არ უდრის; Number.isNaN() გამოიყენე" },
  title: { en: "The Undetectable NaN", ka: "გამოუვლინებელი NaN" },
  story: { en: "A calculator's error-check always misses NaN results because it compares NaN directly.", ka: "კალკულატორის შეცდომების შემოწმება ყოველთვის NaN-ს ვერ ამჩნევს, რადგან NaN-ს პირდაპირ ადარებს." },
  task: { en: "Use the correct built-in function to detect NaN.", ka: "სწორი ჩაშენებული ფუნქცია გამოიყენე NaN-ის აღმოსაჩენად." },
  hints: [
    { en: "Try NaN === NaN in the browser console. What does it return?", ka: "სცადე NaN === NaN ბრაუზერის კონსოლში. რას დაბრუნებს?" },
    { en: "NaN is not equal to anything, including itself. No comparison operator can detect it.", ka: "NaN არაფრის ტოლი არ არის, მათ შორის საკუთარი თავის. ოპერატორი ვერ ამოიცნობს მას." },
    { en: "Number.isNaN(result) returns true only when result is the actual NaN value.", ka: "Number.isNaN(result) true-ს აბრუნებს მხოლოდ მაშინ, როცა result ნამდვილი NaN-ია." },
  ],
  format: "text",
  interaction: "fill-blank",
  codeBefore: `function safeDivide(a, b) {
  const result = a / b;
  if (`,
  codeAfter: `) {
    return "Error: result is NaN";
  }
  return result;
}

console.log(safeDivide(0, 0));   // Error: result is NaN
console.log(safeDivide(10, 2));  // 5`,
  options: [
    {
      id: "a", value: "Number.isNaN(result)", correct: true,
      explanation: { en: "Number.isNaN() strictly checks for the NaN value without type coercion.", ka: "Number.isNaN() ტიპის გარდაქმნის გარეშე მკაცრად ამოწმებს NaN-ს." },
    },
    {
      id: "b", value: "result === NaN", correct: false,
      explanation: { en: "NaN === NaN is always false by IEEE 754 spec — this check can never be true.", ka: "NaN === NaN ყოველთვის false-ია IEEE 754-ის სტანდარტით — ეს შემოწმება ვერასდროს true გახდება." },
    },
    {
      id: "c", value: "isNaN(result)", correct: false,
      explanation: { en: "Global isNaN() coerces its argument first — isNaN('hello') is true, which is a trap. Number.isNaN is safer.", ka: "გლობალური isNaN() ჯერ ტიპს გარდაქმნის — isNaN('hello') true-ია, რაც მახე. Number.isNaN უსაფრთხოა." },
    },
    {
      id: "d", value: "result == null", correct: false,
      explanation: { en: "null check has nothing to do with NaN — this would miss the NaN case entirely.", ka: "null-ის შემოწმება NaN-ს არ ეხება — NaN-ი ამ შემოწმებას ჩაუვლის." },
    },
  ],
};

// ─── js-5: push mutation vs concat ────────────────────────────────────────────

const js5: TextPickFixDef = {
  id: "js-5",
  difficulty: "medium",
  bugType: "mutation-error",
  programmingLanguage: "javascript",
  concept: { en: "Array.push() mutates in place; concat() returns a new array", ka: "Array.push() ადგილზე ცვლის; concat() ახალ მასივს აბრუნებს" },
  title: { en: "The Contaminated Cart", ka: "დაბინძურებული კალათა" },
  story: { en: "A shopping cart utility should produce a new cart with an added item, but it silently mutates the original instead.", ka: "სავაჭრო კალათის ფუნქცია ახალ კალათას უნდა გამოაქვეყნებდეს დამატებული ნივთთან ერთად, მაგრამ ჩუმად ორიგინალს ცვლის." },
  task: { en: "Return a new array without mutating the original cart.", ka: "ახალი მასივი დაბრუნე ორიგინალი კალათის შეცვლის გარეშე." },
  hints: [
    { en: "After calling addItem, check the original cart. Has it changed?", ka: "addItem-ის გამოძახების შემდეგ ორიგინალური კალათა შეამოწმე. შეიცვალა?" },
    { en: "push() modifies the array it is called on and returns the new length, not the array.", ka: "push() მასივს, რომელზეც გამოიძახება, ცვლის და ახალ სიგრძეს, არა მასივს, აბრუნებს." },
    { en: "Use [...cart, item] or cart.concat(item) to get a new array.", ka: "გამოიყენე [...cart, item] ან cart.concat(item) ახალი მასივის მისაღებად." },
  ],
  format: "text",
  interaction: "pick-fix",
  code: `function addItem(cart, item) {
  cart.push(item);
  return cart;
}

const original = ["apple", "bread"];
const updated = addItem(original, "milk");
console.log(original);  // expected: ["apple","bread"], got: ["apple","bread","milk"]`,
  bugLine: 2,
  fixes: [
    {
      id: "spread", correct: true,
      label: { en: "return [...cart, item] instead", ka: "[...cart, item] დაბრუნება" },
      explanation: { en: "Spread syntax creates a new array. The original is untouched.", ka: "Spread სინტაქსი ახალ მასივს ქმნის. ორიგინალი უცვლელი რჩება." },
    },
    {
      id: "concat", correct: false,
      label: { en: "return cart.concat(item)", ka: "cart.concat(item) დაბრუნება" },
      explanation: { en: "concat also works and is correct — but spread is the idiomatic modern answer expected here.", ka: "concat-ი ასევე მუშაობს — მაგრამ spread თანამედროვე სტანდარტული პასუხია." },
    },
    {
      id: "slice-push", correct: false,
      label: { en: "const copy = cart.slice(); copy.push(item); return copy;", ka: "const copy = cart.slice(); copy.push(item); return copy;" },
      explanation: { en: "Correct but verbose — slice + push vs a single spread expression.", ka: "სწორია, მაგრამ ვრცელი — slice + push ერთი spread გამოთქმის ნაცვლად." },
    },
  ],
};

// ─── js-6: parseInt truncates decimals ───────────────────────────────────────

const js6: TextFillBlankDef = {
  id: "js-6",
  difficulty: "medium",
  bugType: "wrong-operator",
  programmingLanguage: "javascript",
  concept: { en: "parseInt() truncates decimals; use parseFloat() to keep fractional values", ka: "parseInt() ათწილადს კვეჭს; parseFloat() გამოიყენე წილადების შენარჩუნებისთვის" },
  title: { en: "Lost Decimal", ka: "დაკარგული ათწილადი" },
  story: { en: "A price converter loses cents because it parses the string with the wrong function.", ka: "ფასის გარდამქმნელი ცენტებს კარგავს, რადგან სტრიქონს არასწორი ფუნქციით არსებს." },
  task: { en: "Use the function that preserves the decimal part of a numeric string.", ka: "გამოიყენე ფუნქცია, რომ სტრიქონის ათწილადი ნაწილი შენარჩუნდეს." },
  hints: [
    { en: "What does parseInt('3.75') return?", ka: "parseInt('3.75') რას აბრუნებს?" },
    { en: "parseInt stops at the decimal point — '3.75' becomes 3.", ka: "parseInt ათწილადის წერტილზე ჩერდება — '3.75' გამოდის 3." },
    { en: "parseFloat('3.75') keeps the decimal.", ka: "parseFloat('3.75') ათწილადს ინარჩუნებს." },
  ],
  format: "text",
  interaction: "fill-blank",
  codeBefore: `function parsePrice(str) {
  return `,
  codeAfter: `(str);
}

console.log(parsePrice("3.75"));  // expected: 3.75, got: 3`,
  options: [
    {
      id: "a", value: "parseFloat", correct: true,
      explanation: { en: "parseFloat('3.75') correctly returns 3.75, preserving the decimal part.", ka: "parseFloat('3.75') სწორად აბრუნებს 3.75-ს, ათწილადი ნაწილით." },
    },
    {
      id: "b", value: "parseInt", correct: false,
      explanation: { en: "parseInt('3.75') truncates at the decimal point and returns 3.", ka: "parseInt('3.75') ათწილადის წერტილზე კვეჭს და 3-ს აბრუნებს." },
    },
    {
      id: "c", value: "Number", correct: false,
      explanation: { en: "Number('3.75') = 3.75 also works, but the puzzle targets the parseInt/parseFloat distinction.", ka: "Number('3.75') = 3.75 ასევე მუშაობს, მაგრამ ამოცანა parseInt/parseFloat განსხვავებაზეა." },
    },
  ],
};

// ─── js-7: forEach cannot break with return ───────────────────────────────────

const js7: TextPickFixDef = {
  id: "js-7",
  difficulty: "medium",
  bugType: "wrong-condition",
  programmingLanguage: "javascript",
  concept: { en: "return inside forEach only exits the callback, not the loop; use for...of to break early", ka: "return forEach-ში მხოლოდ callback-დან გამოდის, არა მარყუჟიდან; for...of გამოიყენე ადრე გასასვლელად" },
  title: { en: "The Unstoppable Loop", ka: "გაუჩერებელი მარყუჟი" },
  story: { en: "A search function tries to stop at the first match but always scans the entire array.", ka: "საძიებო ფუნქცია პირველ დამთხვევაზე ჩერდება, მაგრამ მთელ მასივს ყოველთვის გადის." },
  task: { en: "Rewrite the loop so it actually stops as soon as the target is found.", ka: "მარყუჟი გადაწერე ისე, რომ სამიზნის პოვნასთანავე ნამდვილად შეჩერდეს." },
  hints: [
    { en: "Does forEach have a way to break? Check MDN.", ka: "forEach-ს გაჩერების საშუალება აქვს? MDN შეამოწმე." },
    { en: "return inside forEach just finishes that single callback invocation — the loop continues.", ka: "return forEach-ში მხოლოდ ამ ერთ callback-ის გამოძახებას ასრულებს — მარყუჟი გრძელდება." },
    { en: "Replace forEach with a for...of loop and use break.", ka: "forEach for...of მარყუჟით შეცვალე და break გამოიყენე." },
  ],
  format: "text",
  interaction: "pick-fix",
  code: `function findFirst(arr, target) {
  let found = null;
  arr.forEach((item) => {
    if (item === target) {
      found = item;
      return;  // does NOT stop the loop
    }
  });
  return found;
}`,
  bugLine: 3,
  fixes: [
    {
      id: "for-of", correct: true,
      label: { en: "Replace forEach with for...of and use break", ka: "forEach → for...of + break" },
      explanation: { en: "for...of supports break, so the loop genuinely stops at the first match.", ka: "for...of break-ს მხარს უჭერს, ამიტომ მარყუჟი პირველ დამთხვევაზე ნამდვილად ჩერდება." },
    },
    {
      id: "array-find", correct: false,
      label: { en: "Use arr.find(item => item === target)", ka: "arr.find(item => item === target) გამოიყენე" },
      explanation: { en: "find is correct and idiomatic, but the task asks to fix the loop structure, not replace it entirely.", ka: "find სწორი და სტანდარტულია, მაგრამ ამოცანა მარყუჟის სტრუქტურის გასწორებაა, არა მის სრულ შეცვლა." },
    },
    {
      id: "throw-trick", correct: false,
      label: { en: "Throw a special exception to break out of forEach", ka: "forEach-ს გასათიშად სპეციალური გამონაკლისი გადაისროლე" },
      explanation: { en: "Throwing to break a loop is an anti-pattern — hard to read and error-prone.", ka: "მარყუჟის გასათიშად გამოსროლა ანტი-შაბლონია — წასაკითხად ძნელია და შეცდომებისადმი მიდრეკილია." },
    },
  ],
};

// ─── js-8: async result not awaited ───────────────────────────────────────────

const js8: TextPickFixDef = {
  id: "js-8",
  difficulty: "hard",
  bugType: "return-error",
  programmingLanguage: "javascript",
  concept: { en: "Calling an async function without await returns a Promise, not the resolved value", ka: "async ფუნქციის await-ის გარეშე გამოძახება Promise-ს, არა resolved მნიშვნელობას, აბრუნებს" },
  title: { en: "The Pending Data", ka: "მოსალოდნელი მონაცემები" },
  story: { en: "A data loader logs a Promise object instead of the actual user data.", ka: "მონაცემთა ჩამტვირთავი Promise ობიექტს ბეჭდავს ნამდვილი მომხმარებლის მონაცემების ნაცვლად." },
  task: { en: "Ensure the resolved value is obtained before it is used.", ka: "დარწმუნდი, რომ resolved მნიშვნელობა გამოყენებამდე მიღებულია." },
  hints: [
    { en: "What does fetchUser() return immediately when called without await?", ka: "fetchUser() await-ის გარეშე გამოძახებისას მაშინვე რას აბრუნებს?" },
    { en: "async functions always return a Promise. You need to wait for it to settle.", ka: "async ფუნქციები ყოველთვის Promise-ს აბრუნებს. მისი დასრულება უნდა დაიცადო." },
    { en: "Add await before fetchUser() or use .then().", ka: "fetchUser()-ს წინ await დაამატე ან .then() გამოიყენე." },
  ],
  format: "text",
  interaction: "pick-fix",
  code: `async function fetchUser(id) {
  const res = await fetch(\`/api/users/\${id}\`);
  return res.json();
}

async function showUser(id) {
  const user = fetchUser(id);  // missing await
  console.log(user.name);      // logs undefined
}`,
  bugLine: 6,
  fixes: [
    {
      id: "add-await", correct: true,
      label: { en: "Add await before fetchUser(id)", ka: "fetchUser(id)-ს წინ await დაამატე" },
      explanation: { en: "await pauses execution until the Promise resolves, so user holds the actual data object.", ka: "await პაუზავს შესრულებას Promise-ის resolved-ამდე, ამიტომ user ნამდვილ მონაცემთა ობიექტს შეიცავს." },
    },
    {
      id: "then", correct: false,
      label: { en: "Use fetchUser(id).then(user => console.log(user.name))", ka: "fetchUser(id).then(user => console.log(user.name))" },
      explanation: { en: ".then() also works, but mixing await and .then() in the same async function is inconsistent.", ka: ".then() ასევე მუშაობს, მაგრამ await-ისა და .then()-ის ერთ async ფუნქციაში შერევა არათანმიმდევრულია." },
    },
    {
      id: "sync", correct: false,
      label: { en: "Remove async from fetchUser so it runs synchronously", ka: "fetchUser-დან async ამოიღე სინქრონული გაშვებისთვის" },
      explanation: { en: "Removing async doesn't make fetch synchronous — it would still return a Promise.", ka: "async-ის ამოღება fetch-ს სინქრონულს არ ხდის — ის კვლავ Promise-ს დაბრუნებს." },
    },
  ],
};

// ─── js-9: Object.keys vs for...in ────────────────────────────────────────────

const js9: TextFillBlankDef = {
  id: "js-9",
  difficulty: "hard",
  bugType: "wrong-condition",
  programmingLanguage: "javascript",
  concept: { en: "for...in iterates inherited prototype properties too; Object.keys() only returns own enumerable keys", ka: "for...in inherited პროტოტიპის property-ებსაც გადის; Object.keys() მხოლოდ საკუთარ ჩამოთვლად key-ებს აბრუნებს" },
  title: { en: "Prototype Pollution", ka: "პროტოტიპის დაბინძურება" },
  story: { en: "A serializer picks up unexpected keys from the prototype chain when iterating an object.", ka: "სერიალიზატორი ობიექტის გადაწვდომისას პროტოტიპის ჯაჭვიდან მოულოდნელ key-ებს იღებს." },
  task: { en: "Use the method that returns only the object's own keys.", ka: "გამოიყენე მეთოდი, რომელიც მხოლოდ ობიექტის საკუთარ key-ებს დაბრუნებს." },
  hints: [
    { en: "Add a method to Object.prototype and watch what for...in picks up.", ka: "Object.prototype-ს მეთოდი დაუმატე და ნახე, for...in-ი რას იღებს." },
    { en: "for...in walks up the prototype chain; you usually only want own properties.", ka: "for...in პროტოტიპის ჯაჭვს მიჰყვება; ჩვეულებრივ მხოლოდ საკუთარი property-ები გჭირდება." },
    { en: "Object.keys() returns only own enumerable properties as an array.", ka: "Object.keys() მხოლოდ საკუთარ ჩამოთვლად property-ებს მასივად აბრუნებს." },
  ],
  format: "text",
  interaction: "fill-blank",
  codeBefore: `function serialize(obj) {
  const result = {};
  `,
  codeAfter: `(obj).forEach(key => {
    result[key] = String(obj[key]);
  });
  return result;
}

const data = { a: 1, b: 2 };
console.log(serialize(data));  // expected: { a: "1", b: "2" }`,
  options: [
    {
      id: "a", value: "Object.keys", correct: true,
      explanation: { en: "Object.keys() returns only own enumerable keys, skipping the prototype chain.", ka: "Object.keys() მხოლოდ საკუთარ ჩამოთვლად key-ებს აბრუნებს, პროტოტიპის ჯაჭვს გვერდს უვლის." },
    },
    {
      id: "b", value: "Object.getOwnPropertyNames", correct: false,
      explanation: { en: "getOwnPropertyNames includes non-enumerable own properties too — broader than needed.", ka: "getOwnPropertyNames არაჩამოთვლად საკუთარ property-ებსაც მოიცავს — ზედმეტი სიგანე." },
    },
    {
      id: "c", value: "Object.entries", correct: false,
      explanation: { en: "Object.entries returns [key, value] pairs — correct scope but wrong shape for .forEach(key => ...).", ka: "Object.entries [key, value] წყვილებს აბრუნებს — სწორი სფერო, მაგრამ .forEach(key => ...)-ისთვის არასწორი ფორმა." },
    },
  ],
};

// ─── js-10: splice mutates; slice does not ────────────────────────────────────

const js10: TextPickFixDef = {
  id: "js-10",
  difficulty: "hard",
  bugType: "mutation-error",
  programmingLanguage: "javascript",
  concept: { en: "splice() mutates the original array; slice() returns a new array without mutation", ka: "splice() ორიგინალ მასივს ცვლის; slice() ახალ მასივს აბრუნებს ცვლის გარეშე" },
  title: { en: "The Disappearing Items", ka: "გაქრობადი ელემენტები" },
  story: { en: "A pagination helper is supposed to return one page of data but keeps destroying the source array.", ka: "გვერდების დამყოფი ფუნქცია ერთი გვერდის მონაცემებს უნდა დაბრუნებდეს, მაგრამ წყარო მასივს ანგრევს." },
  task: { en: "Return a page slice without mutating the original data array.", ka: "გვერდი დაბრუნე ორიგინალ data მასივის შეცვლის გარეშე." },
  hints: [
    { en: "After calling getPage, inspect the original data. Is it intact?", ka: "getPage-ის გამოძახების შემდეგ ორიგინალი data-ი შეამოწმე. მთლიანია?" },
    { en: "splice(start, deleteCount) removes elements from the original array.", ka: "splice(start, deleteCount) ელემენტებს ორიგინალი მასივიდან ამოიღებს." },
    { en: "slice(start, end) extracts without mutation — note: end is exclusive.", ka: "slice(start, end) ამოიღებს შეცვლის გარეშე — შენიშვნა: end გამოირიცხება." },
  ],
  format: "text",
  interaction: "pick-fix",
  code: `function getPage(data, page, size) {
  const start = page * size;
  return data.splice(start, size);
}

const items = [1, 2, 3, 4, 5, 6];
console.log(getPage(items, 0, 3));  // [1, 2, 3]
console.log(items);                 // expected [1,2,3,4,5,6], got [4,5,6]`,
  bugLine: 3,
  fixes: [
    {
      id: "slice", correct: true,
      label: { en: "Replace splice with slice(start, start + size)", ka: "splice → slice(start, start + size)" },
      explanation: { en: "slice extracts a portion without modifying the original. splice removes elements in place.", ka: "slice ნაწილს ამოიღებს ორიგინალის შეცვლის გარეშე. splice ელემენტებს ადგილზე შლის." },
    },
    {
      id: "copy-first", correct: false,
      label: { en: "Spread copy first: [...data].splice(start, size)", ka: "ჯერ ასლი: [...data].splice(start, size)" },
      explanation: { en: "Spreading before splicing works but is less idiomatic and more expensive than a simple slice call.", ka: "Spread-ი splice-ის წინ მუშაობს, მაგრამ slice-ის მარტივ გამოძახებაზე ნაკლებ სტანდარტული და ძვირია." },
    },
    {
      id: "filter", correct: false,
      label: { en: "Use filter with index: data.filter((_, i) => i >= start && i < start + size)", ka: "filter ინდექსით: data.filter((_, i) => i >= start && i < start + size)" },
      explanation: { en: "Correct result but O(n) full scan for every page call. slice is O(k) where k is page size.", ka: "სწორი შედეგი, მაგრამ O(n) სრული სკანი ყოველ გვერდის გამოძახებაზე. slice O(k)-ია სადაც k გვერდის ზომა." },
    },
  ],
};

// ─── js-11: Array.isArray vs typeof ──────────────────────────────────────────

const js11: TextFillBlankDef = {
  id: "js-11",
  difficulty: "easy",
  bugType: "comparison-error",
  programmingLanguage: "javascript",
  concept: { en: "typeof [] === 'object' — use Array.isArray() to reliably detect arrays", ka: "typeof [] === 'object' — მასივების სანდოდ გამოსავლენად Array.isArray() გამოიყენე" },
  title: { en: "The False Object", ka: "ყალბი ობიექტი" },
  story: { en: "A type-checker approves arrays as plain objects because typeof cannot distinguish between them.", ka: "ტიპის შემმოწმებელი მასივებს plain ობიექტებად ღებულობს, რადგან typeof ვერ განასხვავებს." },
  task: { en: "Use the built-in that correctly identifies an array.", ka: "გამოიყენე ჩაშენებული საშუალება, რომელიც მასივს სწორად ამოიცნობს." },
  hints: [
    { en: "What does typeof [] return? Test it in the console.", ka: "typeof []-ი რას დაბრუნებს? კონსოლში სცადე." },
    { en: "Arrays have typeof 'object' — same as plain objects.", ka: "მასივების typeof 'object'-ია — ისეთივე, როგორც plain ობიექტებისა." },
    { en: "Array.isArray(value) returns true only for arrays.", ka: "Array.isArray(value) true-ს მხოლოდ მასივებისთვის აბრუნებს." },
  ],
  format: "text",
  interaction: "fill-blank",
  codeBefore: `function isArray(value) {
  return `,
  codeAfter: `;
}

console.log(isArray([1, 2, 3]));  // true
console.log(isArray({ a: 1 }));   // false`,
  options: [
    {
      id: "a", value: "Array.isArray(value)", correct: true,
      explanation: { en: "Array.isArray() returns true for arrays and false for everything else, including plain objects.", ka: "Array.isArray() true-ს აბრუნებს მასივებისთვის და false-ს ყველა სხვასთვის, plain ობიექტების ჩათვლით." },
    },
    {
      id: "b", value: "typeof value === 'array'", correct: false,
      explanation: { en: "'array' is not a typeof result — typeof returns 'object' for both arrays and objects.", ka: "'array' typeof-ის შედეგი არ არის — typeof ობიექტებისა და მასივებისთვის 'object'-ს აბრუნებს." },
    },
    {
      id: "c", value: "typeof value === 'object'", correct: false,
      explanation: { en: "typeof [] and typeof {} both return 'object' — no distinction between arrays and plain objects.", ka: "typeof []-ი და typeof {}-ი ორივე 'object'-ს აბრუნებს — მასივებსა და plain ობიექტებს ვერ განასხვავებს." },
    },
  ],
};

// ─── js-12: optional chaining ?. ─────────────────────────────────────────────

const js12: TextFillBlankDef = {
  id: "js-12",
  difficulty: "medium",
  bugType: "null-error",
  programmingLanguage: "javascript",
  concept: { en: "Optional chaining ?. short-circuits to undefined instead of throwing when a property is null/undefined", ka: "Optional chaining ?. undefined-ს აბრუნებს short-circuit-ით, ბრასვლის ნაცვლად, null/undefined-ზე" },
  title: { en: "The Missing Address", ka: "არარსებული მისამართი" },
  story: { en: "A user profile renderer crashes when a user has no address set, because it chains property access without guarding against null.", ka: "მომხმარებლის პროფილის renderer ჭედება, თუ მომხმარებელს მისამართი არ აქვს, რადგან property-ებს null-ის შემოწმების გარეშე ჯაჭვავს." },
  task: { en: "Access user.address.city safely so it returns undefined instead of throwing.", ka: "user.address.city-ზე უსაფრთხოდ შეიარე, რომ გაგდების ნაცვლად undefined დაბრუნდეს." },
  hints: [
    { en: "What happens when you try to read .city from null?", ka: "რა მოხდება, თუ null-დან .city-ს წაკითხვას სცდი?" },
    { en: "ES2020 introduced ?. to safely access nested properties.", ka: "ES2020-მა ?. შემოიტანა ჩადგმული property-ების უსაფრთხო წვდომისთვის." },
    { en: "user?.address?.city returns undefined without throwing if any part is null.", ka: "user?.address?.city undefined-ს აბრუნებს გაგდების გარეშე, თუ რომელიმე ნაწილი null-ია." },
  ],
  format: "text",
  interaction: "fill-blank",
  codeBefore: `function getCity(user) {
  return `,
  codeAfter: `;
}

console.log(getCity({ address: { city: "Tbilisi" } }));  // "Tbilisi"
console.log(getCity({ address: null }));                  // undefined (not a crash)`,
  options: [
    {
      id: "a", value: "user?.address?.city", correct: true,
      explanation: { en: "?. short-circuits and returns undefined at the first null/undefined in the chain.", ka: "?. პირველ null/undefined-ზე ჯაჭვში short-circuit-ს ახდენს და undefined-ს აბრუნებს." },
    },
    {
      id: "b", value: "user.address.city", correct: false,
      explanation: { en: "When address is null, .city throws: 'Cannot read properties of null'.", ka: "address null-ია, .city-ი გაისვრის: 'Cannot read properties of null'." },
    },
    {
      id: "c", value: "user && user.address && user.address.city", correct: false,
      explanation: { en: "Short-circuit with && works but is verbose — optional chaining is the modern idiomatic replacement.", ka: "&&-ით short-circuit მუშაობს, მაგრამ ვრცელია — optional chaining თანამედროვე სტანდარტული ჩანაცვლებაა." },
    },
  ],
};

// ─── js-13: nullish coalescing ?? vs || ──────────────────────────────────────

const js13: TextFillBlankDef = {
  id: "js-13",
  difficulty: "medium",
  bugType: "comparison-error",
  programmingLanguage: "javascript",
  concept: { en: "?? only falls back for null/undefined; || falls back for any falsy value including 0 and ''", ka: "?? მხოლოდ null/undefined-ისთვის ირჩევს სათადარიგოს; || ნებისმიერ falsy მნიშვნელობაზე, 0-ისა და ''-ის ჩათვლით" },
  title: { en: "The Vanishing Zero", ka: "გამქრალი ნული" },
  story: { en: "A config reader replaces a valid timeout of 0ms with the default 1000ms because the fallback operator treats 0 as falsy.", ka: "კონფიგის წამკითხველი ვალიდ 0ms timeout-ს 1000ms default-ით ანაცვლებს, რადგან სათადარიგო ოპერატორი 0-ს falsy-ად მიიჩნევს." },
  task: { en: "Use the operator that only falls back when the value is null or undefined.", ka: "გამოიყენე ოპერატორი, რომელიც სათადარიგოს მხოლოდ null ან undefined-ისთვის ირჩევს." },
  hints: [
    { en: "What does 0 || 1000 evaluate to? Why?", ka: "0 || 1000-ი რას გამოიანგარიშებს? რატომ?" },
    { en: "|| uses JavaScript's falsy check: 0, '', false, null, undefined are all falsy.", ka: "|| JavaScript-ის falsy შემოწმებას იყენებს: 0, '', false, null, undefined ყველა falsy-ია." },
    { en: "?? (nullish coalescing) only falls back for null or undefined.", ka: "?? (nullish coalescing) მხოლოდ null ან undefined-ისთვის ირჩევს სათადარიგოს." },
  ],
  format: "text",
  interaction: "fill-blank",
  codeBefore: `function getTimeout(config) {
  return config.timeout `,
  codeAfter: ` 1000;
}

console.log(getTimeout({ timeout: 0 }));     // should be 0, not 1000
console.log(getTimeout({ timeout: null }));  // 1000`,
  options: [
    {
      id: "a", value: "??", correct: true,
      explanation: { en: "?? returns the right side only when the left side is null or undefined — 0 is neither, so 0 is returned.", ka: "?? მარჯვენა მხარეს მხოლოდ მაშინ აბრუნებს, როცა მარცხენა null ან undefined-ია — 0 ასე არ არის, ამიტომ 0 ბრუნდება." },
    },
    {
      id: "b", value: "||", correct: false,
      explanation: { en: "0 || 1000 evaluates to 1000 because 0 is falsy — the valid zero timeout is lost.", ka: "0 || 1000-ი 1000-ს გამოიანგარიშებს, რადგან 0 falsy-ია — ვალიდ ნულოვანი timeout იკარგება." },
    },
    {
      id: "c", value: "&&", correct: false,
      explanation: { en: "&& returns the first falsy value or the last value — the opposite of what a fallback needs.", ka: "&& პირველ falsy მნიშვნელობას ან ბოლოს აბრუნებს — სათადარიგოს საჭიროების საპირისპიროა." },
    },
  ],
};

// ─── js-14: destructuring with defaults ──────────────────────────────────────

const js14: TextFillBlankDef = {
  id: "js-14",
  difficulty: "medium",
  bugType: "wrong-init",
  programmingLanguage: "javascript",
  concept: { en: "Destructuring defaults apply only when the value is undefined, not when it is null or 0", ka: "Destructuring default-ები მხოლოდ undefined-ზე გამოიყენება, null-ზე ან 0-ზე არა" },
  title: { en: "The Stubborn Null", ka: "ჯიუტი Null" },
  story: { en: "A function destructures an options object but the timeout default never kicks in, even when options.timeout is explicitly set to null.", ka: "ფუნქცია options ობიექტს destructs-ავს, მაგრამ timeout default არასდროს ამოქმედდება, თუნდაც options.timeout ცხადად null-ად იყოს." },
  task: { en: "Fill in the expression that handles null by converting it to undefined before destructuring.", ka: "შეავსე გამოთქმა, რომელიც null-ს undefined-ად გარდაქმნის destructuring-მდე." },
  hints: [
    { en: "Destructuring default: const { x = 5 } = obj — this sets x=5 only when obj.x is undefined.", ka: "Destructuring default: const { x = 5 } = obj — x=5-ს მხოლოდ მაშინ სვამს, როცა obj.x undefined-ია." },
    { en: "null !== undefined in JavaScript — a default in destructuring does NOT apply to null.", ka: "null !== undefined JavaScript-ში — destructuring-ის default null-ზე არ გამოიყენება." },
    { en: "Use ?? to convert null to undefined: options ?? {} lets destructuring's defaults work.", ka: "?? გამოიყენე null-ის undefined-ად გასარდაქმნელად: options ?? {} destructuring-ის defaults-ს გამოიყენებს." },
  ],
  format: "text",
  interaction: "fill-blank",
  codeBefore: `function request(options) {
  const { timeout = 3000, retries = 3 } = `,
  codeAfter: `;
  return { timeout, retries };
}

console.log(request(null));             // { timeout: 3000, retries: 3 }
console.log(request({ timeout: 500 })); // { timeout: 500, retries: 3 }`,
  options: [
    {
      id: "a", value: "options ?? {}", correct: true,
      explanation: { en: "options ?? {} returns {} when options is null or undefined, so the destructuring defaults take effect.", ka: "options ?? {} {}-ს აბრუნებს, თუ options null ან undefined-ია, ამიტომ destructuring defaults ამოქმედდება." },
    },
    {
      id: "b", value: "options", correct: false,
      explanation: { en: "Destructuring null throws: 'Cannot destructure property of null'.", ka: "null-ის destructuring-ი გაისვრის: 'Cannot destructure property of null'." },
    },
    {
      id: "c", value: "options || {}", correct: false,
      explanation: { en: "Works for null, but || also replaces 0, false, and '' — nullish coalescing is the safer choice.", ka: "null-ისთვის მუშაობს, მაგრამ || ასევე 0-ს, false-ს და ''-ს ანაცვლებს — nullish coalescing უსაფრთხო არჩევანია." },
    },
  ],
};

// ─── js-15: Promise.all rejects on first failure ──────────────────────────────

const js15: TextPickFixDef = {
  id: "js-15",
  difficulty: "hard",
  bugType: "wrong-condition",
  programmingLanguage: "javascript",
  concept: { en: "Promise.all rejects immediately on the first failure; Promise.allSettled waits for all and reports each outcome", ka: "Promise.all პირველ წარუმატებლობაზე მაშინვე უარყოფს; Promise.allSettled ყველას ელოდება და თითოეულ შედეგს ახსენებს" },
  title: { en: "The Silent Failure", ka: "ჩუმი წარუმატებლობა" },
  story: { en: "A dashboard loads data from three APIs in parallel, but if any one fails the whole page goes blank — the other successful responses are discarded.", ka: "Dashboard სამი API-დან პარალელურად ტვირთავს, მაგრამ ერთის წარუმატებლობა მთელ გვერდს ბლანკს ხდის — სხვა წარმატებული პასუხები გაიყრება." },
  task: { en: "Use the method that gives you all results even when some promises fail.", ka: "გამოიყენე მეთოდი, რომელიც ყველა შედეგს გაძლევს, თუნდაც ზოგი promise ვერ შესრულდეს." },
  hints: [
    { en: "What happens to Promise.all when one of the promises rejects?", ka: "Promise.all-ს რა ემართება, თუ ერთ-ერთი promise უარყოფილია?" },
    { en: "Promise.all short-circuits on the first rejection.", ka: "Promise.all პირველ უარყოფაზე short-circuit-ს ახდენს." },
    { en: "Promise.allSettled returns { status, value/reason } for every promise regardless of outcome.", ka: "Promise.allSettled ყველა promise-სთვის { status, value/reason }-ს აბრუნებს შედეგის მიუხედავად." },
  ],
  format: "text",
  interaction: "pick-fix",
  code: `async function loadDashboard() {
  const results = await Promise.all([
    fetchUsers(),
    fetchProducts(),
    fetchOrders(),
  ]);
  return results;
}`,
  bugLine: 2,
  fixes: [
    {
      id: "all-settled", correct: true,
      label: { en: "Replace Promise.all with Promise.allSettled", ka: "Promise.all → Promise.allSettled" },
      explanation: { en: "Promise.allSettled waits for every promise and returns an array of {status, value/reason} objects — no short-circuit on failure.", ka: "Promise.allSettled ყველა promise-ს ელოდება და {status, value/reason} ობიექტების მასივს აბრუნებს — წარუმატებლობაზე short-circuit არ ხდება." },
    },
    {
      id: "try-catch", correct: false,
      label: { en: "Wrap each fetch in try/catch before Promise.all", ka: "ყოველი fetch-ი try/catch-ში გახვიე Promise.all-მდე" },
      explanation: { en: "Wrapping each fetch works but requires more boilerplate. Promise.allSettled handles this cleanly at the coordination level.", ka: "ყოველი fetch-ის გახვევა მუშაობს, მაგრამ მეტ boilerplate-ს საჭიროებს. Promise.allSettled ამას სუფთად კოორდინაციის დონეზე გვარავს." },
    },
    {
      id: "promise-any", correct: false,
      label: { en: "Replace with Promise.any()", ka: "Promise.any()-ით ჩანაცვლება" },
      explanation: { en: "Promise.any resolves with the first successful result — the opposite of what a dashboard needs.", ka: "Promise.any პირველ წარმატებულ შედეგს ირჩევს — ზუსტად საპირისპირო იმისა, რაც dashboard-ს სჭირდება." },
    },
  ],
};

// ─── serialize helper ─────────────────────────────────────────────────────────

export function serialize(def: AnyTextPuzzleDef, lang: "en" | "ka") {
  const p = (t: LocalizedText) => t[lang] ?? t.en;
  const base = {
    id: def.id, difficulty: def.difficulty, bugType: def.bugType,
    programmingLanguage: def.programmingLanguage, concept: p(def.concept),
    title: p(def.title), story: p(def.story), task: p(def.task),
    hints: def.hints.map(p),
  };
  if (def.interaction === "pick-fix") {
    return {
      ...base, format: "text" as const, interaction: "pick-fix" as const,
      code: def.code, bugLine: def.bugLine,
      fixes: def.fixes.map(f => ({ id: f.id, correct: f.correct, label: p(f.label), explanation: p(f.explanation) })),
    };
  }
  return {
    ...base, format: "text" as const, interaction: "fill-blank" as const,
    codeBefore: def.codeBefore, codeAfter: def.codeAfter,
    options: def.options.map(o => ({ id: o.id, value: o.value, correct: o.correct, explanation: p(o.explanation) })),
  };
}

// ─── export ───────────────────────────────────────────────────────────────────

export const PUZZLE_DEFS_JAVASCRIPT: AnyTextPuzzleDef[] = [
  js1, js2, js3, js4, js5, js6, js7, js8, js9, js10,
  js11, js12, js13, js14, js15,
];
