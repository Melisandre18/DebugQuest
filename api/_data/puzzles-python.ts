// Python puzzle definitions for DebugQuest.
// 10 puzzles: py-1 through py-10. Mix of fill-blank and pick-fix interactions.

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

// ─── py-1: Off-By-One in range ────────────────────────────────────────────────

const py1: TextFillBlankDef = {
  id: "py-1",
  difficulty: "easy",
  bugType: "off-by-one",
  programmingLanguage: "python",
  concept: { en: "Loop bounds: range() is exclusive at the end", ka: "მარყუჟის ზღვრები: range() არ მოიცავს ბოლო მნიშვნელობას" },
  title: { en: "Missing the Last Number", ka: "ბოლო რიცხვი გამოტოვებულია" },
  story: { en: "A student wants to sum all integers from 1 to n, but the total is always too small.", ka: "სტუდენტს სურს 1-დან n-მდე ყველა მთელი რიცხვის ჯამი, მაგრამ ჯამი ყოველთვის პატარაა." },
  task: { en: "Fix the range so it includes n itself.", ka: "გაასწორე range ისე, რომ n-ც შევიდეს." },
  hints: [
    { en: "What does range(1, n) actually produce? Try n=5 in your head.", ka: "რას გვაძლევს range(1, n)? სცადე n=5 გონებაში." },
    { en: "range(start, stop) stops *before* stop. You want to include n.", ka: "range(start, stop) ჩერდება stop-*მდე*. გჭირდება n-ის ჩათვლა." },
    { en: "Use range(1, n+1) so the loop reaches n.", ka: "გამოიყენე range(1, n+1), რომ მარყუჟი n-ს მიაღწიოს." },
  ],
  format: "text",
  interaction: "fill-blank",
  codeBefore: `def sum_to_n(n):
    total = 0
    for i in range(1, `,
  codeAfter: `):
        total += i
    return total

print(sum_to_n(5))  # expected: 15`,
  options: [
    {
      id: "a", value: "n+1", correct: true,
      explanation: { en: "range(1, n+1) includes n, producing 1+2+3+4+5 = 15.", ka: "range(1, n+1) მოიცავს n-ს და იძლევა 1+2+3+4+5 = 15." },
    },
    {
      id: "b", value: "n", correct: false,
      explanation: { en: "range(1, n) stops before n — misses the last value.", ka: "range(1, n) ჩერდება n-მდე — ბოლო მნიშვნელობა გამოტოვდება." },
    },
    {
      id: "c", value: "n-1", correct: false,
      explanation: { en: "range(1, n-1) misses both n-1 and n.", ka: "range(1, n-1) გამოტოვებს n-1-სა და n-ს." },
    },
    {
      id: "d", value: "n+2", correct: false,
      explanation: { en: "range(1, n+2) overshoots — adds n+1 as well.", ka: "range(1, n+2) ზედმეტია — n+1-საც ამატებს." },
    },
  ],
};

// ─── py-2: print() returns None ───────────────────────────────────────────────

const py2: TextPickFixDef = {
  id: "py-2",
  difficulty: "easy",
  bugType: "return-error",
  programmingLanguage: "python",
  concept: { en: "print() returns None — do not assign its result", ka: "print() აბრუნებს None — შედეგი არ უნდა მიენიჭოს ცვლადს" },
  title: { en: "The None Greeter", ka: "None-მისალმება" },
  story: { en: "A helper function should return a greeting string, but it always returns None.", ka: "დამხმარე ფუნქცია სალამის სტრიქონს უნდა აბრუნებდეს, მაგრამ ყოველთვის None-ს აბრუნებს." },
  task: { en: "Make the function return the greeting string instead of None.", ka: "გახადე ფუნქცია, რომ სალამის სტრიქონი დაბრუნდეს None-ის ნაცვლად." },
  hints: [
    { en: "What does print() return? Check the Python docs.", ka: "რას აბრუნებს print()? შეამოწმე Python-ის დოკუმენტაცია." },
    { en: "Assigning the result of print() always gives you None.", ka: "print()-ის შედეგის მინიჭება ყოველთვის None-ს გაძლევს." },
    { en: "Use return to give back the string directly, without print().", ka: "გამოიყენე return სტრიქონის პირდაპირ დასაბრუნებლად, print()-ის გარეშე." },
  ],
  format: "text",
  interaction: "pick-fix",
  code: `def greet(name):
    message = "Hello, " + name + "!"
    result = print(message)
    return result

greeting = greet("Alice")
print(greeting)  # expected: Hello, Alice!`,
  bugLine: 3,
  fixes: [
    {
      id: "return-msg", correct: true,
      label: { en: "return message directly (remove the print)", ka: "პირდაპირ დააბრუნე message (print-გარეშე)" },
      explanation: { en: "print() outputs to the console and returns None. Return the string itself so callers can use it.", ka: "print() კონსოლზე გამოაქვს და None-ს აბრუნებს. დაბრუნე სტრიქონი პირდაპირ, რომ გამოძახებელმა გამოიყენოს." },
    },
    {
      id: "print-result", correct: false,
      label: { en: "print(result) at the end", ka: "ბოლოში print(result) გამოიყენე" },
      explanation: { en: "result is still None from the first print — printing None twice changes nothing.", ka: "result ისევ None-ია პირველი print-ისგან — None-ის ორჯერ დაბეჭდვა არაფერს ცვლის." },
    },
    {
      id: "assign-str", correct: false,
      label: { en: "result = message (assign without calling print)", ka: "result = message (print-ის გამოძახების გარეშე)" },
      explanation: { en: "Better, but the function still returns result not message — they're equal here, yet the original print is still called unnecessarily.", ka: "უკეთესია, მაგრამ ფუნქცია ჯერ კიდევ result-ს აბრუნებს — ისინი ტოლია, ოღონდ print ისევ ზედმეტად გამოიძახება." },
    },
  ],
};

// ─── py-3: String + int TypeError ─────────────────────────────────────────────

const py3: TextPickFixDef = {
  id: "py-3",
  difficulty: "easy",
  bugType: "type-error",
  programmingLanguage: "python",
  concept: { en: "Type coercion: you cannot concatenate str and int in Python", ka: "ტიპების გარდაქმნა: Python-ში str-სა და int-ს ვერ შეაერთებ" },
  title: { en: "Broken Badge", ka: "გაფუჭებული ნიშანი" },
  story: { en: "A badge printer crashes every time it tries to include the employee's age.", ka: "ნიშნის პრინტერი ჭედება ყოველ ჯერზე, როცა თანამშრომლის ასაკს ცდილობს ჩართოს." },
  task: { en: "Fix the line so the age integer is joined into the string without a TypeError.", ka: "გაასწორე სტრიქონი ისე, რომ ასაკის int სტრიქონში ჩაერთოს TypeError-ის გარეშე." },
  hints: [
    { en: "Run the code — what error do you see?", ka: "გაუშვი კოდი — რა შეცდომა გამოჩნდება?" },
    { en: "Python won't automatically convert int to str. You have to do it explicitly.", ka: "Python int-ს str-ად ავტომატურად არ გადაიყვანს. ეს ხელით უნდა გაკეთდეს." },
    { en: "Wrap age in str() before the + operator.", ka: "age-ი str()-ში გახვიე + ოპერატორამდე." },
  ],
  format: "text",
  interaction: "pick-fix",
  code: `def make_badge(name, age):
    badge = "Name: " + name + ", Age: " + age
    return badge

print(make_badge("Bob", 25))`,
  bugLine: 2,
  fixes: [
    {
      id: "str-cast", correct: true,
      label: { en: 'Change age to str(age)', ka: "age → str(age)" },
      explanation: { en: "str(age) converts the integer to a string so the + operator can concatenate them.", ka: "str(age) მთელ რიცხვს სტრიქონად გადაიყვანს, რათა + ოპერატორმა შეაერთოს ისინი." },
    },
    {
      id: "fstring", correct: false,
      label: { en: 'Use an f-string: f"Name: {name}, Age: {age}"', ka: 'f-სტრიქონი: f"Name: {name}, Age: {age}"' },
      explanation: { en: "f-strings do work here — but pick-fix expects the minimal targeted fix. str(age) changes only the bug.", ka: "f-სტრიქონები კი მუშაობს, მაგრამ str(age) მიზანმიმართული მინიმალური გამოსწორებაა." },
    },
    {
      id: "int-cast", correct: false,
      label: { en: 'Change name to int(name)', ka: "name → int(name)" },
      explanation: { en: "int('Bob') raises a ValueError — names aren't numbers.", ka: 'int("Bob") ValueError-ს გამოიძახებს — სახელები რიცხვები არ არის.' },
    },
  ],
};

// ─── py-4: Integer division vs float division ─────────────────────────────────

const py4: TextFillBlankDef = {
  id: "py-4",
  difficulty: "medium",
  bugType: "wrong-operator",
  programmingLanguage: "python",
  concept: { en: "// is integer (floor) division; / gives a float result", ka: "// მთელი (ქვედა) გაყოფაა; / ათწილადს გვაძლევს" },
  title: { en: "The Shrinking Average", ka: "შემცირებადი საშუალო" },
  story: { en: "A gradebook calculator always reports whole-number averages and loses the decimal part.", ka: "ნიშნების კალკულატორი ყოველთვის მთელ რიცხვებს ახსენებს და ათწილადს კარგავს." },
  task: { en: "Use the correct division operator so the average keeps its decimal portion.", ka: "გამოიყენე სწორი გაყოფის ოპერატორი, რომ საშუალო ათწილადს შეინარჩუნებს." },
  hints: [
    { en: "What is 7 // 2 in Python? What about 7 / 2?", ka: "რა არის 7 // 2 Python-ში? და 7 / 2?" },
    { en: "You need a fractional result — one of these operators discards the remainder.", ka: "გჭირდება წილადი შედეგი — ერთ-ერთი ოპერატორი ნაშთს გვირიგებს." },
    { en: "Replace // with / for true float division.", ka: "გამოიყენე / // -ის ნაცვლად ნამდვილი ათწილადი გაყოფისთვის." },
  ],
  format: "text",
  interaction: "fill-blank",
  codeBefore: `def average(scores):
    total = sum(scores)
    return total `,
  codeAfter: ` len(scores)

print(average([7, 8, 9]))  # expected: 8.0`,
  options: [
    {
      id: "a", value: "/", correct: true,
      explanation: { en: "/ performs true division and returns a float: 24 / 3 = 8.0.", ka: "/ ნამდვილ გაყოფას ახდენს და ათწილადს აბრუნებს: 24 / 3 = 8.0." },
    },
    {
      id: "b", value: "//", correct: false,
      explanation: { en: "// is floor division — it truncates the decimal, e.g. 7 // 2 = 3.", ka: "// ქვედა გაყოფაა — ათწილადს კვეჭს, მაგ. 7 // 2 = 3." },
    },
    {
      id: "c", value: "%", correct: false,
      explanation: { en: "% is the modulo (remainder) operator, not division.", ka: "% ნაშთის ოპერატორია, არა გაყოფის." },
    },
  ],
};

// ─── py-5: is vs == for value comparison ──────────────────────────────────────

const py5: TextFillBlankDef = {
  id: "py-5",
  difficulty: "medium",
  bugType: "comparison-error",
  programmingLanguage: "python",
  concept: { en: "is checks object identity; == checks value equality", ka: "is ამოწმებს ობიექტის იდენტობას; == ამოწმებს მნიშვნელობის ტოლობას" },
  title: { en: "Identity Crisis", ka: "იდენტობის კრიზისი" },
  story: { en: "A configuration loader randomly fails to detect the string 'yes' because of how Python interns strings.", ka: "კონფიგურაციის ჩამტვირთავი შემთხვევით ვერ ამოიცნობს სტრიქონს 'yes', სტრიქონების ინტერნინგის გამო." },
  task: { en: "Use the right operator to compare the value of the string, not its memory address.", ka: "გამოიყენე სწორი ოპერატორი სტრიქონის *მნიშვნელობის* შედარებისთვის, არა მეხსიერების მისამართის." },
  hints: [
    { en: "Does the program behave differently when the string comes from user input vs a literal?", ka: "იქცევა განსხვავებულად პროგრამა, როცა სტრიქონი შეყვანიდან მოდის და არა ლიტერალიდან?" },
    { en: "is compares memory addresses. Two equal strings may live at different addresses.", ka: "is ადარებს მეხსიერების მისამართებს. ორი ტოლი სტრიქონი სხვადასხვა მისამართზე შეიძლება იყოს." },
    { en: "Replace is with == to compare values.", ka: "შეცვალე is ==-ით მნიშვნელობების შესადარებლად." },
  ],
  format: "text",
  interaction: "fill-blank",
  codeBefore: `def is_enabled(value):
    return value `,
  codeAfter: ` "yes"

flag = input("Enable? ").strip()
print(is_enabled(flag))  # should print True when user types yes`,
  options: [
    {
      id: "a", value: "==", correct: true,
      explanation: { en: "== compares values: 'yes' == 'yes' is always True regardless of which object it is.", ka: "== ადარებს მნიშვნელობებს: 'yes' == 'yes' ყოველთვის True-ია, განურჩევლად ობიექტისა." },
    },
    {
      id: "b", value: "is", correct: false,
      explanation: { en: "is checks if both sides point to the exact same object in memory. Input strings are rarely interned, so this is unreliable.", ka: "is ამოწმებს ორივე გამოთქმა ერთ ობიექტზე მიუთითებს თუ არა. შეყვანის სტრიქონები იშვიათად ინტერნდება, ამიტომ ეს არასანდოა." },
    },
    {
      id: "c", value: "is not", correct: false,
      explanation: { en: "is not is the opposite of is — still an identity check, and inverted at that.", ka: "is not is-ის საწინააღმდეგოა — კვლავ იდენტობის შემოწმებაა, თანაც შებრუნებული." },
    },
  ],
};

// ─── py-6: Mutable default argument ───────────────────────────────────────────

const py6: TextPickFixDef = {
  id: "py-6",
  difficulty: "medium",
  bugType: "default-arg",
  programmingLanguage: "python",
  concept: { en: "Mutable default arguments are shared across all calls", ka: "ცვლადი default არგუმენტები ყველა გამოძახებაში გაზიარებულია" },
  title: { en: "The Growing List", ka: "გაზრდადი სია" },
  story: { en: "A utility that appends items to a list somehow accumulates values from previous calls.", ka: "სიაზე დამატების ფუნქცია რატომღაც წინა გამოძახებების მნიშვნელობებს გროვდება." },
  task: { en: "Fix the default argument so each call starts with a fresh empty list.", ka: "გაასწორე default არგუმენტი, რომ თითოეული გამოძახება ახალ ცარიელ სიაზე დაიწყოს." },
  hints: [
    { en: "Call append_item('a') twice, then call append_item('b'). What does the second call return?", ka: "გამოიძახე append_item('a') ორჯერ, შემდეგ append_item('b'). მეორე გამოძახება რას დაბრუნებს?" },
    { en: "Default argument values are evaluated once when the function is defined, not on each call.", ka: "Default არგუმენტების მნიშვნელობები ერთხელ გამოითვლება ფუნქციის განსაზღვრებისას, არა ყოველ გამოძახებაზე." },
    { en: "Use None as the default, then set lst = [] inside the function body.", ka: "გამოიყენე None default-ად, შემდეგ lst = [] ფუნქციის სხეულში." },
  ],
  format: "text",
  interaction: "pick-fix",
  code: `def append_item(item, lst=[]):
    lst.append(item)
    return lst

print(append_item("a"))  # ['a']
print(append_item("b"))  # expected ['b'], got ['a', 'b']`,
  bugLine: 1,
  fixes: [
    {
      id: "none-default", correct: true,
      label: { en: "Use None default; create new list inside", ka: "None default; ახალი სია შიგნით" },
      explanation: { en: "def append_item(item, lst=None): lst = lst if lst is not None else []. Each call without an argument gets a brand-new list.", ka: "def append_item(item, lst=None): lst = lst if lst is not None else []. ყოველი გამოძახება ახალ სიას ქმნის." },
    },
    {
      id: "tuple-default", correct: false,
      label: { en: "Use a tuple as default: lst=()", ka: "Tuple default: lst=()" },
      explanation: { en: "Tuples are immutable, so appending would raise an AttributeError immediately.", ka: "კორტეჟები უცვლელია, ამიტომ append ოპერაცია AttributeError-ს გამოიძახებს." },
    },
    {
      id: "clear-end", correct: false,
      label: { en: "Call lst.clear() at the end of the function", ka: "ფუნქციის ბოლოს lst.clear() გამოიძახე" },
      explanation: { en: "Clearing after returning would run after the return — it never executes, and you'd still return the accumulated list.", ka: "return-ის შემდეგ clear() გამოძახება ვერ შესრულდება — ის ვერ გაეშვება, ჩევამიმდებარე სია მაინც დაგროვდება." },
    },
  ],
};

// ─── py-7: list.append returns None ───────────────────────────────────────────

const py7: TextPickFixDef = {
  id: "py-7",
  difficulty: "medium",
  bugType: "return-error",
  programmingLanguage: "python",
  concept: { en: "list.append() mutates in place and returns None", ka: "list.append() ადგილზე ცვლის სიას და None-ს აბრუნებს" },
  title: { en: "The Vanishing List", ka: "გაქრობადი სია" },
  story: { en: "A data pipeline keeps replacing its working list with None on each step.", ka: "მონაცემთა კონვეიერი თავის სამუშაო სიას ყოველ საფეხურზე None-ით ანაცვლებს." },
  task: { en: "Fix the assignment so the list is preserved after appending.", ka: "გაასწორე მინიჭება, რომ სია append-ის შემდეგ შენარჩუნდეს." },
  hints: [
    { en: "Print result right after the assignment. What do you see?", ka: "result-ი დაბეჭდე მინიჭების შემდეგ. რას ხედავ?" },
    { en: "append() returns None — it modifies the list object directly.", ka: "append() None-ს აბრუნებს — სიის ობიექტს პირდაპირ ცვლის." },
    { en: "Remove the assignment: just call result.append(value) on its own.", ka: "მინიჭება ამოიღე: მხოლოდ result.append(value) გამოიძახე." },
  ],
  format: "text",
  interaction: "pick-fix",
  code: `def build_list(values):
    result = []
    for value in values:
        result = result.append(value)
    return result

print(build_list([1, 2, 3]))  # expected: [1, 2, 3]`,
  bugLine: 4,
  fixes: [
    {
      id: "no-assign", correct: true,
      label: { en: "Remove the assignment: result.append(value)", ka: "მინიჭება ამოიღე: result.append(value)" },
      explanation: { en: "append() mutates the list in place. Assigning its return value (None) overwrites your list reference.", ka: "append() სიას ადგილზე ცვლის. მისი return მნიშვნელობის (None) მინიჭება თქვენი სიის მითითებას ანგრევს." },
    },
    {
      id: "plus-assign", correct: false,
      label: { en: "result += [value]", ka: "result += [value]" },
      explanation: { en: "This works but is not the minimal fix — it creates a new list each iteration. The intended fix is to just not assign the return value of append.", ka: "ეს მუშაობს, მაგრამ მინიმალური გამოსწორება არ არის — ყოველ იტერაციაზე ახალ სიას ქმნის." },
    },
    {
      id: "extend", correct: false,
      label: { en: "result.extend([value])", ka: "result.extend([value])" },
      explanation: { en: "extend adds items from an iterable — also works but is unnecessarily verbose for a single item.", ka: "extend ჩამომთვლელიდან ელემენტებს ამატებს — ასევე მუშაობს, მაგრამ ერთი ელემენტისთვის ზედმეტია." },
    },
  ],
};

// ─── py-8: Mutating list while iterating ──────────────────────────────────────

const py8: TextFillBlankDef = {
  id: "py-8",
  difficulty: "hard",
  bugType: "mutation-error",
  programmingLanguage: "python",
  concept: { en: "Never mutate a list while iterating over it — use a copy instead", ka: "იტერაციის დროს სიის ცვლა დაუშვებელია — გამოიყენე ასლი" },
  title: { en: "Skipping Evens", ka: "წყვილების გამოტოვება" },
  story: { en: "A filter that removes even numbers skips some of them because it modifies the list it is walking through.", ka: "ლუწი რიცხვების გამფილტრავი ზოგიერთს გამოტოვებს, რადგან გასვლის დროს სიას ცვლის." },
  task: { en: "Iterate over a copy of the list so removals don't affect the loop.", ka: "გაიარე სიის ასლზე, რომ წაშლები მარყუჟს არ ეხება." },
  hints: [
    { en: "Trace what happens when numbers = [1, 2, 4, 3]. Which elements get skipped?", ka: "გაიარე numbers = [1, 2, 4, 3]-ისთვის. რომელი ელემენტები გამოტოვდება?" },
    { en: "Removing an element shifts later elements left, causing the iterator to skip the next one.", ka: "ელემენტის ამოღება შემდეგ ელემენტებს მარცხნივ ცვლის, ამიტომ იტერატორი მომდევნოს გამოტოვებს." },
    { en: "Iterate over numbers[:] — a shallow copy — so the original can be safely modified.", ka: "გაიარე numbers[:]-ზე — ზედაპირული ასლი — რათა ორიგინალის ცვლა უსაფრთხო იყოს." },
  ],
  format: "text",
  interaction: "fill-blank",
  codeBefore: `def remove_evens(numbers):
    for n in `,
  codeAfter: `:
        if n % 2 == 0:
            numbers.remove(n)
    return numbers

print(remove_evens([1, 2, 4, 3, 6]))  # expected: [1, 3]`,
  options: [
    {
      id: "a", value: "numbers[:]", correct: true,
      explanation: { en: "numbers[:] creates a shallow copy, so modifying numbers inside the loop doesn't disrupt the iteration.", ka: "numbers[:] ზედაპირულ ასლს ქმნის, ამიტომ მარყუჟში numbers-ის ცვლა იტერაციას არ ხელს არ უშლის." },
    },
    {
      id: "b", value: "numbers", correct: false,
      explanation: { en: "Iterating over numbers while removing from it causes skips — the classic mutation-during-iteration bug.", ka: "numbers-ზე იტერაცია მასზე წაშლის დროს გამოტოვებებს იწვევს — კლასიკური mutation-during-iteration შეცდომა." },
    },
    {
      id: "c", value: "list(numbers)", correct: true,
      explanation: { en: "list(numbers) also produces a copy and is equivalent to numbers[:]. Both are correct.", ka: "list(numbers) ასევე ასლს ქმნის და numbers[:]-ის ეკვივალენტია. ორივე სწორია." },
    },
    {
      id: "d", value: "reversed(numbers)", correct: false,
      explanation: { en: "reversed() iterates backwards — avoids the skip but is a workaround, not the idiomatic fix.", ka: "reversed() უკუმიმართულებით გადის — გამოტოვებას თავს არიდებს, მაგრამ ეს გამოსავალია, არა სტანდარტული გამოსწორება." },
    },
  ],
};

// ─── py-9: Missing global keyword ─────────────────────────────────────────────

const py9: TextPickFixDef = {
  id: "py-9",
  difficulty: "hard",
  bugType: "scope-error",
  programmingLanguage: "python",
  concept: { en: "global keyword is required to assign to a module-level variable inside a function", ka: "global საკვანძო სიტყვა საჭიროა მოდულის დონის ცვლადისთვის ფუნქციის შიგნიდან" },
  title: { en: "The Forgotten Counter", ka: "დავიწყებული მთვლელი" },
  story: { en: "A hit counter never increments because the function creates a local variable instead of updating the global one.", ka: "მომართვათა მთვლელი არასდროს იზრდება, რადგან ფუნქცია ლოკალურ ცვლადს ქმნის გლობალურის ნაცვლად." },
  task: { en: "Fix the function so it actually updates the global counter variable.", ka: "გაასწორე ფუნქცია, რომ გლობალური counter ნამდვილად განახლდეს." },
  hints: [
    { en: "Print counter before and after calling increment(). Is it changing?", ka: "counter-ი დაბეჭდე increment()-ის გამოძახებამდე და შემდეგ. იცვლება?" },
    { en: "Assigning to a name inside a function makes it local unless declared otherwise.", ka: "ფუნქციის შიგნით სახელზე მინიჭება მას ლოკალურს ხდის, თუ სხვაგვარად არ არის დეკლარირებული." },
    { en: "Add global counter at the top of the increment() function.", ka: "increment()-ის დასაწყისში global counter დაამატე." },
  ],
  format: "text",
  interaction: "pick-fix",
  code: `counter = 0

def increment():
    counter = counter + 1

increment()
increment()
print(counter)  # expected: 2`,
  bugLine: 4,
  fixes: [
    {
      id: "global-kw", correct: true,
      label: { en: "Add 'global counter' before the assignment", ka: "მინიჭებამდე 'global counter' დაამატე" },
      explanation: { en: "Without global, Python treats counter as a local variable. Adding global counter tells Python to use the module-level binding.", ka: "global-ის გარეშე Python counter-ს ლოკალურ ცვლადად მიიჩნევს. global counter Python-ს ეუბნება მოდულის დონის ბმას გამოიყენოს." },
    },
    {
      id: "return-val", correct: false,
      label: { en: "Return counter + 1 and reassign outside", ka: "counter + 1 დაბრუნება და გარეთ მინიჭება" },
      explanation: { en: "That would work structurally, but requires changing every call site. The simplest fix for this pattern is global.", ka: "სტრუქტურულად მუშაობდა, მაგრამ ყველა გამოძახების ადგილის შეცვლა სჭირდება. ამ შაბლონისთვის მარტივი გამოსწორებაა global." },
    },
    {
      id: "nonlocal", correct: false,
      label: { en: "Use nonlocal counter instead", ka: "nonlocal counter გამოიყენე" },
      explanation: { en: "nonlocal refers to the enclosing function scope, not the module scope. There is no enclosing function here, so it would raise a SyntaxError.", ka: "nonlocal მომდევნო ფუნქციის სფეროს ეხება, არა მოდულის სფეროს. აქ მომდევნო ფუნქცია არ არის, ამიტომ SyntaxError გამოიძახება." },
    },
  ],
};

// ─── py-10: Page calculation with // ─────────────────────────────────────────

const py10: TextFillBlankDef = {
  id: "py-10",
  difficulty: "hard",
  bugType: "wrong-operator",
  programmingLanguage: "python",
  concept: { en: "Ceiling division for pagination: use -(-n // d) or math.ceil(n/d)", ka: "ზედა გაყოფა გვერდებისთვის: გამოიყენე -(-n // d) ან math.ceil(n/d)" },
  title: { en: "Missing Page", ka: "გამოტოვებული გვერდი" },
  story: { en: "A paginator that splits 10 items into pages of 3 shows only 3 pages but the last 1 item never appears.", ka: "10 ელემენტის 3-იანი გვერდებად დამყოფი 3 გვერდს აჩვენებს, მაგრამ ბოლო 1 ელემენტი არასდროს ჩნდება." },
  task: { en: "Use ceiling division so a partial last page is still counted.", ka: "გამოიყენე ზედა გაყოფა, რომ ნაწილობრივი ბოლო გვერდი დათვლილ იქნეს." },
  hints: [
    { en: "10 / 3 = 3.33. How many pages do you actually need?", ka: "10 / 3 = 3.33. რამდენი გვერდი გჭირდება სინამდვილეში?" },
    { en: "Floor division drops the remainder. You need to round UP.", ka: "ქვედა გაყოფა ნაშთს ყრის. ზემოთ დამრგვალება გჭირდება." },
    { en: "Use -(-total // per_page) — the double-negation ceiling trick — or import math and use math.ceil.", ka: "გამოიყენე -(-total // per_page) — ორმაგი უარყოფის ceil ხრიკი — ან import math და math.ceil." },
  ],
  format: "text",
  interaction: "fill-blank",
  codeBefore: `def page_count(total, per_page):
    return `,
  codeAfter: `

print(page_count(10, 3))  # expected: 4
print(page_count(9, 3))   # expected: 3`,
  options: [
    {
      id: "a", value: "-(-total // per_page)", correct: true,
      explanation: { en: "Double-negation ceiling: -(-10 // 3) = -(- 4) = 4. Works without importing math.", ka: "ორმაგი უარყოფის ceil: -(-10 // 3) = -(-4) = 4. math-ის გარეშე მუშაობს." },
    },
    {
      id: "b", value: "total // per_page", correct: false,
      explanation: { en: "Floor division: 10 // 3 = 3, dropping the remainder. The last partial page is lost.", ka: "ქვედა გაყოფა: 10 // 3 = 3, ნაშთი იყრება. ბოლო ნაწილობრივი გვერდი იკარგება." },
    },
    {
      id: "c", value: "total / per_page", correct: false,
      explanation: { en: "Returns 3.333… — a float, not an integer page count.", ka: "3.333…-ს აბრუნებს — ათწილადი, არა მთელი გვერდების რაოდენობა." },
    },
    {
      id: "d", value: "(total + per_page) // per_page", correct: false,
      explanation: { en: "This overshoots: (10+3)//3 = 4, coincidentally correct here, but (9+3)//3 = 4 instead of 3.", ka: "ეს ზედმეტია: (10+3)//3 = 4, შემთხვევით სწორია, მაგრამ (9+3)//3 = 4 3-ის ნაცვლად." },
    },
  ],
};

// ─── py-11: dict.get() with default ──────────────────────────────────────────

const py11: TextFillBlankDef = {
  id: "py-11",
  difficulty: "easy",
  bugType: "wrong-condition",
  programmingLanguage: "python",
  concept: { en: "dict.get(key, default) returns a fallback instead of raising KeyError", ka: "dict.get(key, default) სათადარიგო მნიშვნელობას აბრუნებს KeyError-ის ნაცვლად" },
  title: { en: "Missing Key Crash", ka: "არარსებული გასაღების ავარია" },
  story: { en: "A word counter crashes on the first new word because it reads from the dict before the key exists.", ka: "სიტყვათა მთვლელი პირველ ახალ სიტყვაზე ჭედება, რადგან dict-ს კითხულობს გასაღების გამოჩენამდე." },
  task: { en: "Use the dict method that returns 0 when the word is not yet in the counter.", ka: "გამოიყენე dict-ის მეთოდი, რომელიც 0-ს დაბრუნებს, თუ სიტყვა ჯერ მთვლელში არ არის." },
  hints: [
    { en: "Accessing d[key] when key is absent raises a KeyError.", ka: "d[key]-ით არარსებულ გასაღებზე წვდომა KeyError-ს გამოიძახებს." },
    { en: "dict has a .get() method that accepts a fallback value.", ka: "dict-ს გააჩნია .get() მეთოდი სათადარიგო მნიშვნელობით." },
    { en: "counter.get(word, 0) safely returns 0 for a new word.", ka: "counter.get(word, 0) ახალი სიტყვისთვის 0-ს უსაფრთხოდ დაბრუნებს." },
  ],
  format: "text",
  interaction: "fill-blank",
  codeBefore: `def count_words(words):
    counter = {}
    for word in words:
        counter[word] = `,
  codeAfter: ` + 1
    return counter

print(count_words(["cat", "dog", "cat"]))  # {'cat': 2, 'dog': 1}`,
  options: [
    {
      id: "a", value: "counter.get(word, 0)", correct: true,
      explanation: { en: "counter.get(word, 0) returns 0 for an unknown word, so the first occurrence becomes 0+1=1.", ka: "counter.get(word, 0) უცნობი სიტყვისთვის 0-ს დაბრუნებს, ამიტომ პირველი გამოჩენა 0+1=1 ხდება." },
    },
    {
      id: "b", value: "counter[word]", correct: false,
      explanation: { en: "counter[word] raises KeyError on the first occurrence of any new word.", ka: "counter[word] ნებისმიერი ახალი სიტყვის პირველ გამოჩენაზე KeyError-ს გამოიძახებს." },
    },
    {
      id: "c", value: "counter.pop(word, 0)", correct: false,
      explanation: { en: "pop() removes the key and returns its value — the opposite of what you want here.", ka: "pop() გასაღებს შლის და მის მნიშვნელობას აბრუნებს — ზუსტად საპირისპიროა." },
    },
  ],
};

// ─── py-12: enumerate() vs manual counter ────────────────────────────────────

const py12: TextPickFixDef = {
  id: "py-12",
  difficulty: "easy",
  bugType: "wrong-condition",
  programmingLanguage: "python",
  concept: { en: "enumerate(iterable) yields (index, value) pairs — no manual counter needed", ka: "enumerate(iterable) (ინდექსი, მნიშვნელობა) წყვილებს გასცემს — ხელით მთვლელი საჭირო არ არის" },
  title: { en: "The Manual Counter", ka: "ხელით მთვლელი" },
  story: { en: "A labeling function maintains a separate counter variable that it forgets to reset between calls.", ka: "ლეიბლების ფუნქცია ცალკე მთვლელ ცვლადს ინარჩუნებს, რომლის გამოძახებებს შორის გადაყენებაც ავიწყდება." },
  task: { en: "Replace the manual index variable with enumerate() to cleanly get both index and item.", ka: "ხელით ინდექსი enumerate()-ით შეცვალე, რომ ინდექსი და ელემენტი სუფთად მიიღო." },
  hints: [
    { en: "Python's for loop gives you the value, not the index. How do you get both?", ka: "Python-ის for მარყუჟი მნიშვნელობას გაძლევს, არა ინდექსს. ორივეს როგორ მიიღებ?" },
    { en: "enumerate() wraps any iterable and adds an automatic counter.", ka: "enumerate() ნებისმიერ iterable-ს ახვევს და ავტომატური მთვლელი ემატება." },
    { en: "for i, item in enumerate(items): is the idiomatic pattern.", ka: "for i, item in enumerate(items): სტანდარტული Python შაბლონია." },
  ],
  format: "text",
  interaction: "pick-fix",
  code: `def label_items(items):
    idx = 0
    for item in items:
        print(f"{idx}: {item}")
        idx += 1

label_items(["apple", "banana", "cherry"])`,
  bugLine: 2,
  fixes: [
    {
      id: "enumerate", correct: true,
      label: { en: "for i, item in enumerate(items): (remove idx)", ka: "for i, item in enumerate(items): (idx ამოიღე)" },
      explanation: { en: "enumerate yields (index, item) pairs automatically, eliminating the error-prone manual counter.", ka: "enumerate (ინდექსი, ელემენტი) წყვილებს ავტომატურად გასცემს, შეცდომისადმი მიდრეკილ ხელით მთვლელს გამორიცხავს." },
    },
    {
      id: "range-len", correct: false,
      label: { en: "for i in range(len(items)): item = items[i]", ka: "for i in range(len(items)): item = items[i]" },
      explanation: { en: "Works but un-Pythonic — manual indexing when enumerate exists is an anti-pattern.", ka: "მუშაობს, მაგრამ un-Pythonic-ია — ხელით ინდექსი enumerate-ს არსებობისას ანტი-შაბლონია." },
    },
    {
      id: "global-idx", correct: false,
      label: { en: "Make idx a global variable", ka: "idx გლობალური ცვლადი გახადე" },
      explanation: { en: "A global counter makes things worse — it persists across calls and introduces shared mutable state.", ka: "გლობალური მთვლელი მდგომარეობას აუარესებს — გამოძახებებს შორის რჩება და გაზიარებულ ცვლად მდგომარეობას ქმნის." },
    },
  ],
};

// ─── py-13: zip() for parallel iteration ─────────────────────────────────────

const py13: TextFillBlankDef = {
  id: "py-13",
  difficulty: "medium",
  bugType: "wrong-condition",
  programmingLanguage: "python",
  concept: { en: "zip(a, b) iterates two sequences in parallel — no manual index needed", ka: "zip(a, b) ორ მიმდევრობას პარალელურად გადის — ხელით ინდექსი საჭირო არ არის" },
  title: { en: "Parallel Mismatch", ka: "პარალელური შეუსაბამობა" },
  story: { en: "A price formatter pairs product names with prices using an index, but crashes when the lists have different lengths.", ka: "ფასების ფორმატირება სახელებსა და ფასებს ინდექსით აწყვილებს, მაგრამ სხვადასხვა სიგრძის სიებისას ჭედება." },
  task: { en: "Use zip() to pair each name with its price without an explicit index.", ka: "გამოიყენე zip() ყოველი სახელის ფასთან გაწყვილებისთვის ინდექსის გარეშე." },
  hints: [
    { en: "You have two lists of the same length. How do you iterate them together?", ka: "ორი ერთი სიგრძის სია გაქვს. მათ ერთდროულად როგორ გაივლი?" },
    { en: "zip(names, prices) yields (name, price) tuples one at a time.", ka: "zip(names, prices) (სახელი, ფასი) კორტეჟებს გასცემს ერთ-ერთს." },
    { en: "for name, price in zip(names, prices): is clean and index-free.", ka: "for name, price in zip(names, prices): სუფთა და ინდექსის გარეშეა." },
  ],
  format: "text",
  interaction: "fill-blank",
  codeBefore: `def show_prices(names, prices):
    for `,
  codeAfter: `:
        print(f"{name}: ${price}")

show_prices(["apple", "bread"], [1.2, 2.5])`,
  options: [
    {
      id: "a", value: "name, price in zip(names, prices)", correct: true,
      explanation: { en: "zip pairs each element from both lists, yielding (name, price) tuples cleanly.", ka: "zip ორი სიის თითოეულ ელემენტს აწყვილებს, (სახელი, ფასი) კორტეჟებს სუფთად გასცემს." },
    },
    {
      id: "b", value: "i in range(len(names))", correct: false,
      explanation: { en: "range(len()) works but requires names[i] and prices[i] — verbose and error-prone with mismatched lengths.", ka: "range(len()) მუშაობს, მაგრამ names[i] და prices[i] სჭირდება — ვრცელი და სხვადასხვა სიგრძეებთან შეცდომებისადმი მიდრეკილი." },
    },
    {
      id: "c", value: "name, price in enumerate(names)", correct: false,
      explanation: { en: "enumerate yields (index, name) — price is not accessible that way.", ka: "enumerate (ინდექსი, სახელი)-ს გასცემს — price ამ გზით ხელმიუწვდომელია." },
    },
  ],
};

// ─── py-14: walrus operator misuse ───────────────────────────────────────────

const py14: TextPickFixDef = {
  id: "py-14",
  difficulty: "medium",
  bugType: "syntax-logic",
  programmingLanguage: "python",
  concept: { en: "The walrus operator := assigns and returns a value inside an expression", ka: "Walrus ოპერატორი := გამოთქმაში ანიჭებს და მნიშვნელობას აბრუნებს" },
  title: { en: "The Stale Buffer", ka: "მოძველებული ბუფერი" },
  story: { en: "A streaming reader checks an empty string each iteration instead of the freshly read chunk because assignment and condition are on separate lines.", ka: "ნაკადის წამკითხველი ყოველ იტერაციაზე ცარიელ სტრიქონს ამოწმებს განახლებული ფრაგმენტის ნაცვლად." },
  task: { en: "Use the walrus operator so the read and the while-check happen in the same expression.", ka: "Walrus ოპერატორი გამოიყენე, რომ წაკითხვა და while-შემოწმება ერთ გამოთქმაში მოხდეს." },
  hints: [
    { en: "The chunk is assigned before the loop, so the while condition checks the initial empty value forever.", ka: "ფრაგმენტი მარყუჟამდე ენიჭება, ამიტომ while პირობა ყოველთვის თავდაპირველ ცარიელ მნიშვნელობას ამოწმებს." },
    { en: "The walrus operator := can assign inside a condition: while chunk := read().", ka: "Walrus ოპერატორი := პირობაში ახდენს მინიჭებას: while chunk := read()." },
    { en: "Place the assignment inside the while condition using :=.", ka: "მინიჭება := გამოყენებით while პირობაში მოათავსე." },
  ],
  format: "text",
  interaction: "pick-fix",
  code: `def process_stream(stream):
    chunk = stream.read(1024)
    while chunk:
        process(chunk)
        chunk = stream.read(1024)`,
  bugLine: 2,
  fixes: [
    {
      id: "walrus", correct: true,
      label: { en: "while chunk := stream.read(1024): (remove priming read)", ka: "while chunk := stream.read(1024): (პირველი წაკითხვა ამოიღე)" },
      explanation: { en: "The walrus operator reads and assigns in the while condition itself, eliminating the duplicated stream.read() call.", ka: "Walrus ოპერატორი while პირობაში კითხულობს და ანიჭებს, გამეორებული stream.read()-ის გამოძახებას გამორიცხავს." },
    },
    {
      id: "while-true", correct: false,
      label: { en: "while True: chunk = stream.read(1024); if not chunk: break", ka: "while True: chunk = stream.read(1024); if not chunk: break" },
      explanation: { en: "This works but is more verbose — the walrus pattern is the idiomatic Python 3.8+ solution.", ka: "მუშაობს, მაგრამ ვრცელია — walrus შაბლონი Python 3.8+-ის სტანდარტული გამოსავალია." },
    },
    {
      id: "iter-partial", correct: false,
      label: { en: "for chunk in iter(lambda: stream.read(1024), b''):", ka: "for chunk in iter(lambda: stream.read(1024), b''):" },
      explanation: { en: "iter() with a sentinel also works for binary streams but is harder to read — walrus is simpler here.", ka: "iter() სენტინელით ასევე მუშაობს ბინარული ნაკადებისთვის, მაგრამ წასაკითხად ძნელია — walrus მარტივია." },
    },
  ],
};

// ─── py-15: deepcopy vs shallow copy ─────────────────────────────────────────

const py15: TextPickFixDef = {
  id: "py-15",
  difficulty: "hard",
  bugType: "mutation-error",
  programmingLanguage: "python",
  concept: { en: "copy.copy() is shallow — nested objects are still shared; copy.deepcopy() clones everything", ka: "copy.copy() ზედაპირულია — ჩადგმული ობიექტები ისევ გაზიარებულია; copy.deepcopy() ყველაფერს კლონავს" },
  title: { en: "The Shared Roster", ka: "გაზიარებული სია" },
  story: { en: "A team manager copies a roster to create a new team but modifying the copy's players still changes the original.", ka: "გუნდის მენეჯერი სიას კოპირებს ახალი გუნდის შესაქმნელად, მაგრამ ასლის მოთამაშეების ცვლა ორიგინალსაც ცვლის." },
  task: { en: "Use the copy function that recursively clones all nested objects.", ka: "გამოიყენე copy ფუნქცია, რომელიც ყველა ჩადგმულ ობიექტს რეკურსიულად კლონავს." },
  hints: [
    { en: "A shallow copy copies the outer list, but the inner lists still point to the same objects.", ka: "ზედაპირული ასლი გარე სიას კოპირებს, მაგრამ შიდა სიები ჯერ კიდევ ერთ ობიექტებს მიუთითებენ." },
    { en: "Mutating a nested object in the copy also mutates it in the original.", ka: "ასლში ჩადგმული ობიექტის ცვლა ორიგინალშიც ცვლის." },
    { en: "import copy; copy.deepcopy(obj) creates completely independent clones of all nested objects.", ka: "import copy; copy.deepcopy(obj) ყველა ჩადგმული ობიექტის სრულად დამოუკიდებელ კლონებს ქმნის." },
  ],
  format: "text",
  interaction: "pick-fix",
  code: `import copy

def clone_roster(roster):
    return copy.copy(roster)

team_a = {"players": ["Alice", "Bob"]}
team_b = clone_roster(team_a)
team_b["players"].append("Charlie")
print(team_a["players"])  # expected ['Alice','Bob'], got ['Alice','Bob','Charlie']`,
  bugLine: 4,
  fixes: [
    {
      id: "deepcopy", correct: true,
      label: { en: "Return copy.deepcopy(roster)", ka: "copy.deepcopy(roster) დაბრუნება" },
      explanation: { en: "deepcopy recursively clones all nested objects so team_b['players'] is a separate list from team_a['players'].", ka: "deepcopy ყველა ჩადგმულ ობიექტს რეკურსიულად კლონავს, ამიტომ team_b['players'] team_a['players']-ისგან განსხვავებული სიაა." },
    },
    {
      id: "dict-copy", correct: false,
      label: { en: "Return roster.copy()", ka: "roster.copy() დაბრუნება" },
      explanation: { en: "dict.copy() is also a shallow copy — the nested 'players' list is still shared.", ka: "dict.copy() ასევე ზედაპირული ასლია — ჩადგმული 'players' სია ისევ გაზიარებულია." },
    },
    {
      id: "spread", correct: false,
      label: { en: "Return {**roster}", ka: "{**roster} დაბრუნება" },
      explanation: { en: "Unpacking with ** also creates a shallow copy — same problem as .copy().", ka: "**-ით გაშლა ასევე ზედაპირულ ასლს ქმნის — .copy()-ის ისეთივე პრობლემა." },
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

export const PUZZLE_DEFS_PYTHON: AnyTextPuzzleDef[] = [
  py1, py2, py3, py4, py5, py6, py7, py8, py9, py10,
  py11, py12, py13, py14, py15,
];
