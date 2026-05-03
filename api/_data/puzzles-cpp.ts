// C++ puzzle definitions for DebugQuest.
// 10 puzzles: cpp-1 through cpp-10. Mix of fill-blank and pick-fix interactions.

interface LocalizedText { en: string; ka: string; }

type LangMap = Partial<Record<"python" | "javascript" | "cpp" | "java", string>>;

interface TextPickFixDef {
  id: string; difficulty: "easy" | "medium" | "hard";
  bugType: string; programmingLanguage: "python" | "javascript" | "cpp" | "java";
  concept: LocalizedText; title: LocalizedText; story: LocalizedText; task: LocalizedText;
  hints: LocalizedText[];
  format: "text"; interaction: "pick-fix";
  code: string; bugLine?: number;
  bugLineByLang?: LangMap;
  correctedCode?: string;
  codeByLang?: LangMap;
  correctedCodeByLang?: LangMap;
  fixes: Array<{ id: string; label: LocalizedText; correct: boolean; explanation: LocalizedText }>;
}

interface TextFillBlankDef {
  id: string; difficulty: "easy" | "medium" | "hard";
  bugType: string; programmingLanguage: "python" | "javascript" | "cpp" | "java";
  concept: LocalizedText; title: LocalizedText; story: LocalizedText; task: LocalizedText;
  hints: LocalizedText[];
  format: "text"; interaction: "fill-blank";
  codeBefore: string; codeAfter: string;
  correctedCode?: string;
  codeBeforeByLang?: LangMap;
  codeAfterByLang?: LangMap;
  correctedCodeByLang?: LangMap;
  options: Array<{ id: string; value: string; correct: boolean; explanation: LocalizedText; valueByLang?: LangMap }>;
}

type AnyTextPuzzleDef = TextPickFixDef | TextFillBlankDef;

// ─── cpp-1: Integer division truncates ───────────────────────────────────────

const cpp1: TextFillBlankDef = {
  id: "cpp-1",
  difficulty: "easy",
  bugType: "wrong-operator",
  programmingLanguage: "cpp",
  concept: { en: "Integer division in C++ truncates toward zero; cast to double for floating-point result", ka: "C++-ში მთელი რიცხვის გაყოფა ნულისკენ მოჭრის; ათწილადისთვის double-ად გარდაქმნა გჭირდება" },
  title: { en: "The Shrinking Average", ka: "შემცირებადი საშუალო" },
  story: { en: "A grade calculator always rounds down the average, losing decimal precision.", ka: "ნიშნების კალკულატორი საშუალოს ყოველთვის ქვემოთ ამრგვალებს და ათწილადებს კარგავს." },
  task: { en: "Fix the division so the result is a floating-point number.", ka: "გაასწორე გაყოფა, რომ შედეგი ათწილადი იყოს." },
  hints: [
    { en: "What is 7 / 2 in C++ when both operands are int?", ka: "რა არის 7 / 2 C++-ში, როდესაც ორივე ოპერანდი int-ია?" },
    { en: "Integer division discards the remainder — 7/2 = 3, not 3.5.", ka: "მთელი რიცხვის გაყოფა ნაშთს გვირიგებს — 7/2 = 3, არა 3.5." },
    { en: "Cast one operand to double: (double)sum / count.", ka: "ერთი ოპერანდი double-ად გარდაქმენი: (double)sum / count." },
  ],
  format: "text",
  interaction: "fill-blank",
  codeBefore: `double average(int sum, int count) {
    return `,
  codeAfter: `sum / count;
}

int main() {
    std::cout << average(7, 2) << std::endl; // expected: 3.5
}`,
  correctedCode: `#include <iostream>

double average(int sum, int count) {
    return (double)sum / count;
}

int main() {
    std::cout << average(7, 2)  << std::endl;  // 3.5
    std::cout << average(10, 4) << std::endl;  // 2.5
}`,
  codeBeforeByLang: {
    python: `def average(total, count):
    return `,
    javascript: `function average(sum, count) {
    return `,
    java: `public class Main {
    static double average(int sum, int count) {
        return `,
  },
  codeAfterByLang: {
    python: `total // count  # bug: floor division loses decimal

print(average(7, 2))   # expected: 3.5`,
    javascript: `Math.trunc(sum / count);  // bug: truncates decimal
}

console.log(average(7, 2));   // expected: 3.5`,
    java: `sum / count;  // bug: integer division truncates
    }
    public static void main(String[] args) {
        System.out.println(average(7, 2));  // expected: 3.5
    }
}`,
  },
  correctedCodeByLang: {
    python: `def average(total, count):
    return total / count  # / always gives float in Python 3

print(average(7, 2))    # 3.5
print(average(10, 4))   # 2.5`,
    javascript: `function average(sum, count) {
    return sum / count;  // JS division always returns float
}

console.log(average(7, 2));    // 3.5
console.log(average(10, 4));   // 2.5`,
    java: `public class Main {
    static double average(int sum, int count) {
        return (double) sum / count;  // cast forces floating-point division
    }
    public static void main(String[] args) {
        System.out.println(average(7, 2));    // 3.5
        System.out.println(average(10, 4));   // 2.5
    }
}`,
  },
  options: [
    {
      id: "a", value: "(double)", correct: true,
      explanation: { en: "(double)sum / count casts sum to double, so the division is floating-point: 7.0 / 2 = 3.5.", ka: "(double)sum / count sum-ს double-ად გარდაქმნის, ამიტომ გაყოფა ათწილადია: 7.0 / 2 = 3.5." },
    },
    {
      id: "b", value: "(int)", correct: false,
      explanation: { en: "(int)sum still makes the result an integer — no improvement.", ka: "(int)sum შედეგს კვლავ მთელ რიცხვად ტოვებს — გაუმჯობესება არ არის." },
    },
    {
      id: "c", value: "(float)", correct: false,
      explanation: { en: "float works but double is preferred in C++ for precision unless memory is constrained.", ka: "float მუშაობს, მაგრამ C++-ში სიზუსტისთვის double-ია სასურველი, თუ მეხსიერება არ გვჭირდება." },
    },
  ],
};

// ─── cpp-2: Off-by-one in array loop ─────────────────────────────────────────

const cpp2: TextPickFixDef = {
  id: "cpp-2",
  difficulty: "easy",
  bugType: "off-by-one",
  programmingLanguage: "cpp",
  concept: { en: "Array indices are 0-based; the valid range is [0, size-1]", ka: "მასივის ინდექსები 0-დან იწყება; სწორი დიაპაზონი [0, size-1]" },
  title: { en: "One Too Many", ka: "ერთით მეტი" },
  story: { en: "A loop that sums an array reads one element past the end, causing undefined behavior.", ka: "მასივის შემჯამებელი მარყუჟი ბოლოს გადასცდება და გაუმართავ ქცევას იწვევს." },
  task: { en: "Fix the loop condition so it stays within bounds.", ka: "გაასწორე მარყუჟის პირობა, რომ ზღვარს არ გადასცდეს." },
  hints: [
    { en: "If the array has 5 elements, what are the valid indices?", ka: "თუ მასივს 5 ელემენტი აქვს, რა ინდექსებია სწორი?" },
    { en: "The last valid index is size - 1. Your loop goes one step further.", ka: "ბოლო სწორი ინდექსია size - 1. შენი მარყუჟი ერთი ნაბიჯით გადასდის." },
    { en: "Change <= to < in the loop condition.", ka: "მარყუჟის პირობაში <= შეცვალე <-ით." },
  ],
  format: "text",
  interaction: "pick-fix",
  code: `int sumArray(int arr[], int size) {
    int total = 0;
    for (int i = 0; i <= size; i++) {  // bug: reads arr[size]
        total += arr[i];
    }
    return total;
}`,
  bugLine: 3,
  correctedCode: `#include <iostream>

int sumArray(int arr[], int size) {
    int total = 0;
    for (int i = 0; i < size; i++) {
        total += arr[i];
    }
    return total;
}

int main() {
    int nums[] = {1, 2, 3, 4, 5};
    std::cout << sumArray(nums, 5) << std::endl;  // 15
}`,
  codeByLang: {
    python: `def sum_array(arr):
    total = 0
    for i in range(len(arr) + 1):  # bug: reads arr[len(arr)]
        total += arr[i]
    return total`,
    javascript: `function sumArray(arr) {
    let total = 0;
    for (let i = 0; i <= arr.length; i++) {  // bug: reads arr[arr.length]
        total += arr[i];
    }
    return total;
}`,
    java: `public class Main {
    static int sumArray(int[] arr) {
        int total = 0;
        for (int i = 0; i <= arr.length; i++) {  // bug: reads arr[arr.length]
            total += arr[i];
        }
        return total;
    }
}`,
  },
  bugLineByLang: {
    python: 3,
    javascript: 3,
    java: 4,
  },
  correctedCodeByLang: {
    python: `def sum_array(arr):
    total = 0
    for i in range(len(arr)):  # range excludes upper bound
        total += arr[i]
    return total

print(sum_array([1, 2, 3, 4, 5]))  # 15`,
    javascript: `function sumArray(arr) {
    let total = 0;
    for (let i = 0; i < arr.length; i++) {  // < not <=
        total += arr[i];
    }
    return total;
}

console.log(sumArray([1, 2, 3, 4, 5]));  // 15`,
    java: `public class Main {
    static int sumArray(int[] arr) {
        int total = 0;
        for (int i = 0; i < arr.length; i++) {  // < not <=
            total += arr[i];
        }
        return total;
    }
    public static void main(String[] args) {
        int[] nums = {1, 2, 3, 4, 5};
        System.out.println(sumArray(nums));  // 15
    }
}`,
  },
  fixes: [
    {
      id: "lt", correct: true,
      label: { en: "Change <= to <", ka: "<= → <" },
      explanation: { en: "i < size stops the loop at index size-1, the last valid position.", ka: "i < size მარყუჟს size-1 ინდექსზე ჩერებს, რაც ბოლო სწორი პოზიციაა." },
    },
    {
      id: "size-minus", correct: false,
      label: { en: "Change size to size-1 in the condition", ka: "პირობაში size → size-1" },
      explanation: { en: "i <= size-1 is equivalent to i < size — that's correct — but keeping <= with size-1 is less idiomatic in C++.", ka: "i <= size-1 i < size-ის ეკვივალენტია — სწორია — მაგრამ <= size-1-თან C++-ში ნაკლებ სტანდარტულია." },
    },
    {
      id: "zero", correct: false,
      label: { en: "Start the loop from i = 1 instead", ka: "მარყუჟი i = 1-დან დავიწყოთ" },
      explanation: { en: "Starting from 1 would miss the first element arr[0], not fix the off-by-one at the end.", ka: "1-ზე დაწყება arr[0]-ს გამოტოვებს — ეს ბოლოში off-by-one-ს არ გაასწორებს." },
    },
  ],
};

// ─── cpp-3: Uninitialized variable ───────────────────────────────────────────

const cpp3: TextPickFixDef = {
  id: "cpp-3",
  difficulty: "easy",
  bugType: "wrong-init",
  programmingLanguage: "cpp",
  concept: { en: "Local variables in C++ are not zero-initialized; always initialize before use", ka: "C++-ში ლოკალური ცვლადები ავტომატურად ნულად არ ინიციალიზდება; გამოყენებამდე ყოველთვის ინიციალიზება გჭირდება" },
  title: { en: "The Garbage Counter", ka: "ნაგვის მთვლელი" },
  story: { en: "A function counts how many numbers exceed a threshold, but starts with a random value in memory.", ka: "ფუნქცია ითვლის, რამდენი რიცხვი აჭარბებს ზღვარს, მაგრამ მეხსიერებაში შემთხვევით მნიშვნელობაზე იწყებს." },
  task: { en: "Initialize the counter so the function produces reliable results.", ka: "მთვლელი ინიციალიზე, რომ ფუნქცია სანდო შედეგებს გამოსცემდეს." },
  hints: [
    { en: "Print count right after declaring it. Is it always 0?", ka: "count-ი დაბეჭდე დეკლარირებისთანავე. ყოველთვის 0-ია?" },
    { en: "C++ leaves local variables uninitialized — they contain whatever was in memory.", ka: "C++ ლოკალურ ცვლადებს არ ინიციალიზებს — ისინი მეხსიერებაში რაც არ უნდა ყოფილა, შეიცავს." },
    { en: "Declare count as int count = 0; to start from a known state.", ka: "count-ი int count = 0;-ად გამოაცხადე, რომ ცნობილი მდგომარეობიდან დაიწყო." },
  ],
  format: "text",
  interaction: "pick-fix",
  code: `int countAbove(int arr[], int size, int threshold) {
    int count;  // uninitialized!
    for (int i = 0; i < size; i++) {
        if (arr[i] > threshold) count++;
    }
    return count;
}`,
  bugLine: 2,
  correctedCode: `#include <iostream>

int countAbove(int arr[], int size, int threshold) {
    int count = 0;
    for (int i = 0; i < size; i++) {
        if (arr[i] > threshold) count++;
    }
    return count;
}

int main() {
    int nums[] = {1, 5, 3, 8, 2};
    std::cout << countAbove(nums, 5, 3) << std::endl;  // 2
}`,
  codeByLang: {
    python: `def count_above(arr, threshold):
    count = 999  # wrong initial value — simulates uninitialized garbage
    for x in arr:
        if x > threshold:
            count += 1
    return count`,
    javascript: `function countAbove(arr, threshold) {
    let count;  // undefined — simulates uninitialized variable
    for (let i = 0; i < arr.length; i++) {
        if (arr[i] > threshold) count++;  // NaN after first ++ on undefined
    }
    return count;
}`,
    java: `public class Main {
    static int countAbove(int[] arr, int threshold) {
        int count;  // uninitialized — Java compiler will error
        for (int i = 0; i < arr.length; i++) {
            if (arr[i] > threshold) count++;
        }
        return count;
    }
}`,
  },
  bugLineByLang: {
    python: 2,
    javascript: 2,
    java: 3,
  },
  correctedCodeByLang: {
    python: `def count_above(arr, threshold):
    count = 0  # correct initial value
    for x in arr:
        if x > threshold:
            count += 1
    return count

print(count_above([1, 5, 3, 8, 2], 3))  # 2`,
    javascript: `function countAbove(arr, threshold) {
    let count = 0;  // initialized to 0
    for (let i = 0; i < arr.length; i++) {
        if (arr[i] > threshold) count++;
    }
    return count;
}

console.log(countAbove([1, 5, 3, 8, 2], 3));  // 2`,
    java: `public class Main {
    static int countAbove(int[] arr, int threshold) {
        int count = 0;  // must initialize before use
        for (int i = 0; i < arr.length; i++) {
            if (arr[i] > threshold) count++;
        }
        return count;
    }
    public static void main(String[] args) {
        int[] nums = {1, 5, 3, 8, 2};
        System.out.println(countAbove(nums, 3));  // 2
    }
}`,
  },
  fixes: [
    {
      id: "init-zero", correct: true,
      label: { en: "int count = 0;", ka: "int count = 0;" },
      explanation: { en: "Initializing count to 0 gives the accumulator a known starting value.", ka: "count-ის 0-ზე ინიციალიზება აკუმულატორს ცნობილ საწყის მნიშვნელობას ანიჭებს." },
    },
    {
      id: "static", correct: false,
      label: { en: "Declare count as static int count;", ka: "static int count; გამოაცხადე" },
      explanation: { en: "static variables are zero-initialized, but using static here causes count to persist across calls — wrong behavior.", ka: "static ცვლადები ნულამდე ინიციალიზდება, მაგრამ static-ი count-ს გამოძახებებს შორის ინახავს — არასწორი ქცევა." },
    },
    {
      id: "count-plus", correct: false,
      label: { en: "Change count++ to count = count + 1", ka: "count++ → count = count + 1" },
      explanation: { en: "The increment itself is fine — the bug is that count starts at an unknown value, not how it is incremented.", ka: "ინკრემენტი სწორია — ბაგი ის არის, რომ count უცნობ მნიშვნელობაზე იწყება, არა ინკრემენტის გზა." },
    },
  ],
};

// ─── cpp-4: == vs = in condition ─────────────────────────────────────────────

const cpp4: TextFillBlankDef = {
  id: "cpp-4",
  difficulty: "medium",
  bugType: "wrong-operator",
  programmingLanguage: "cpp",
  concept: { en: "= is assignment; == is comparison. Using = in an if condition assigns and checks the result", ka: "= მინიჭებაა; == შედარება. if პირობაში = გამოყენება ანიჭებს და შედეგს ამოწმებს" },
  title: { en: "The Always-True Guard", ka: "ყოველთვის-true-ის დამცავი" },
  story: { en: "A safety guard that should activate only when mode equals 1 fires every time instead.", ka: "უსაფრთხოების დამცავი, რომელიც მხოლოდ mode == 1-ზე უნდა ჩაირთოს, ყოველ ჯერზე ჩაირთვება." },
  task: { en: "Use the correct operator to compare mode against 1.", ka: "სწორი ოპერატორი გამოიყენე mode-ის 1-თან შედარებისთვის." },
  hints: [
    { en: "What does if (mode = 1) actually do?", ka: "რას გვიკეთებს if (mode = 1)?" },
    { en: "= assigns 1 to mode and then evaluates mode — which is 1, which is truthy. Always fires.", ka: "= mode-ს 1-ს ანიჭებს და შემდეგ mode-ს ამოწმებს — 1 არის, რაც true-ია. ყოველთვის ჩაირთვება." },
    { en: "Use == to compare values without side effects.", ka: "== გამოიყენე გვერდითი ეფექტების გარეშე შედარებისთვის." },
  ],
  format: "text",
  interaction: "fill-blank",
  codeBefore: `void checkMode(int mode) {
    if (mode `,
  codeAfter: ` 1) {
        std::cout << "Safety system activated\\n";
    }
}

// checkMode(0) should NOT activate`,
  correctedCode: `#include <iostream>

void checkMode(int mode) {
    if (mode == 1) {
        std::cout << "Safety system activated\\n";
    }
}

int main() {
    checkMode(1);  // Safety system activated
    checkMode(0);  // (nothing)
    checkMode(2);  // (nothing)
}`,
  codeBeforeByLang: {
    python: `def check_mode(mode):
    if mode `,
    javascript: `function checkMode(mode) {
    if (mode `,
    java: `public class Main {
    static void checkMode(int mode) {
        if (mode `,
  },
  codeAfterByLang: {
    python: ` 1:  # Python: 'is' checks identity, not equality
        print("Safety system activated")

# check_mode(0) should NOT activate`,
    javascript: ` 1) {  // bug: = instead of ==
        console.log("Safety system activated");
    }
}

// checkMode(0) should NOT activate`,
    java: ` 1) {  // bug: = instead of ==
            System.out.println("Safety system activated");
        }
    }
    public static void main(String[] args) {
        checkMode(0);  // should NOT activate
    }
}`,
  },
  correctedCodeByLang: {
    python: `def check_mode(mode):
    if mode == 1:  # == for value equality; 'is' checks identity
        print("Safety system activated")

check_mode(1)  # Safety system activated
check_mode(0)  # (nothing)
check_mode(2)  # (nothing)`,
    javascript: `function checkMode(mode) {
    if (mode === 1) {  // === checks value AND type
        console.log("Safety system activated");
    }
}

checkMode(1);  // Safety system activated
checkMode(0);  // (nothing)
checkMode(2);  // (nothing)`,
    java: `public class Main {
    static void checkMode(int mode) {
        if (mode == 1) {  // == for primitive comparison
            System.out.println("Safety system activated");
        }
    }
    public static void main(String[] args) {
        checkMode(1);  // Safety system activated
        checkMode(0);  // (nothing)
        checkMode(2);  // (nothing)
    }
}`,
  },
  options: [
    {
      id: "a", value: "==", correct: true,
      explanation: { en: "== compares mode to 1 without changing mode.", ka: "== mode-ს 1-ს ადარებს mode-ის შეცვლის გარეშე." },
    },
    {
      id: "b", value: "=", correct: false,
      explanation: { en: "= assigns 1 to mode. The condition is then (1), which is always true.", ka: "= mode-ს 1-ს ანიჭებს. შემდეგ პირობა (1)-ია, რაც ყოველთვის true-ია." },
    },
    {
      id: "c", value: "!=", correct: false,
      explanation: { en: "!= fires when mode is NOT 1 — the opposite of what's needed.", ka: "!= ჩაირთვება, როცა mode 1-ი *არ* არის — ეს საჭიროს საწინააღმდეგოა." },
    },
  ],
};

// ─── cpp-5: Stack vs heap lifetime ───────────────────────────────────────────

const cpp5: TextPickFixDef = {
  id: "cpp-5",
  difficulty: "medium",
  bugType: "scope-error",
  programmingLanguage: "cpp",
  concept: { en: "Returning a pointer to a local (stack) variable is undefined behavior — the variable is destroyed on return", ka: "ლოკალური (სტეკ) ცვლადის მაჩვენებლის დაბრუნება გაუმართავი ქცევაა — ცვლადი დაბრუნებისას განადგურდება" },
  title: { en: "Dangling Pointer", ka: "ჩამოკიდებული მაჩვენებელი" },
  story: { en: "A function returns the address of a local array, but that memory becomes invalid the moment the function exits.", ka: "ფუნქცია ლოკალური მასივის მისამართს აბრუნებს, მაგრამ ის მეხსიერება ფუნქციის დასრულებისთანავე ბათილდება." },
  task: { en: "Fix the function so it returns a properly heap-allocated array that outlives the function call.", ka: "გაასწორე ფუნქცია, რომ heap-ზე გამოყოფილი მასივი დაბრუნდეს, რომელიც ფუნქციის გამოძახებაზე დიდხანს ცოცხლობს." },
  hints: [
    { en: "Where does a local variable live? What happens to it when the function returns?", ka: "სად ცხოვრობს ლოკალური ცვლადი? რა ემართება მას ფუნქციის დაბრუნებისას?" },
    { en: "Stack memory is reclaimed when the function frame is popped. The caller gets a dangling pointer.", ka: "სტეკის მეხსიერება ფუნქციის ჩარჩოს ამოღებისას გათავისუფლდება. გამომძახებელი ჩამოკიდებულ მაჩვენებელს იღებს." },
    { en: "Allocate on the heap with new int[size] — the caller must delete[] it later.", ka: "Heap-ზე გამოყავი new int[size]-ით — გამომძახებელმა შემდეგ delete[] უნდა გამოიძახოს." },
  ],
  format: "text",
  interaction: "pick-fix",
  code: `int* makeArray(int size) {
    int arr[size];        // local stack array
    for (int i = 0; i < size; i++) arr[i] = i;
    return arr;           // dangling pointer!
}`,
  bugLine: 2,
  correctedCode: `#include <iostream>

int* makeArray(int size) {
    int* arr = new int[size];  // heap allocation — lives beyond function
    for (int i = 0; i < size; i++) arr[i] = i;
    return arr;
}

int main() {
    int* a = makeArray(5);
    for (int i = 0; i < 5; i++) std::cout << a[i] << " ";
    std::cout << std::endl;  // 0 1 2 3 4
    delete[] a;
}`,
  codeByLang: {
    python: `def make_array(size):
    arr = list(range(size))  # local list
    return arr  # Python: this is fine — list survives via reference counting
    # Closest analogy: returning a mutable default arg shared across calls

def buggy_make_array(size, arr=[]):  # bug: mutable default argument — shared state!
    arr.clear()
    for i in range(size):
        arr.append(i)
    return arr  # same object returned every call — caller's ref may be stale`,
    javascript: `function makeArray(size) {
    // JS closures can accidentally capture a loop variable by reference
    let callbacks = [];
    for (var i = 0; i < size; i++) {  // bug: var is function-scoped, not block-scoped
        callbacks.push(function() { return i; });  // all capture same 'i'
    }
    return callbacks;  // every callback returns 'size', not 0,1,2...
}`,
    java: `public class Main {
    static int[] makeArray(int size) {
        int[] arr = new int[size];  // local variable — but Java returns reference
        for (int i = 0; i < size; i++) arr[i] = i;
        return arr;  // safe in Java: GC keeps object alive while referenced
        // Closest bug: returning a reference to a shared mutable field
    }
}`,
  },
  bugLineByLang: {
    python: 6,
    javascript: 3,
    java: 3,
  },
  correctedCodeByLang: {
    python: `def make_array(size):
    return list(range(size))  # new list each call — no shared state

result = make_array(5)
print(result)  # [0, 1, 2, 3, 4]`,
    javascript: `function makeArray(size) {
    let callbacks = [];
    for (let i = 0; i < size; i++) {  // let is block-scoped — each iteration captures own i
        callbacks.push(function() { return i; });
    }
    return callbacks;
}

let fns = makeArray(5);
console.log(fns.map(f => f()));  // [0, 1, 2, 3, 4]`,
    java: `public class Main {
    static int[] makeArray(int size) {
        int[] arr = new int[size];
        for (int i = 0; i < size; i++) arr[i] = i;
        return arr;  // Java GC ensures array lives as long as references exist
    }
    public static void main(String[] args) {
        int[] a = makeArray(5);
        for (int x : a) System.out.print(x + " ");  // 0 1 2 3 4
        System.out.println();
    }
}`,
  },
  fixes: [
    {
      id: "new", correct: true,
      label: { en: "int* arr = new int[size]; — heap allocation", ka: "int* arr = new int[size]; — heap გამოყოფა" },
      explanation: { en: "new int[size] allocates on the heap. The memory persists until the caller calls delete[].", ka: "new int[size] heap-ზე გამოყოფს. მეხსიერება მანამ რჩება, სანამ გამომძახებელი delete[]-ს გამოიძახებს." },
    },
    {
      id: "static-arr", correct: false,
      label: { en: "Declare arr as static int arr[size]", ka: "arr static int arr[size]-ად გამოაცხადე" },
      explanation: { en: "static avoids the dangling problem but makes the array shared across all calls — concurrent calls would corrupt each other.", ka: "static ჩამოკიდების პრობლემას თავიდან არიდებს, მაგრამ ყველა გამოძახებაში გაიზიარება — ერთდროული გამოძახებები ერთმანეთს გააფუჭებს." },
    },
    {
      id: "vector", correct: false,
      label: { en: "Return a std::vector<int> instead", ka: "std::vector<int>-ი დაბრუნება" },
      explanation: { en: "Returning a vector is the safest modern approach, but the task asks to fix the pointer version specifically.", ka: "vector-ის დაბრუნება ყველაზე უსაფრთხო თანამედროვე მიდგომაა, მაგრამ ამოცანა კონკრეტულად მაჩვენებლის ვარიანტის გამოსწორებაა." },
    },
  ],
};

// ─── cpp-6: Pre vs post increment ────────────────────────────────────────────

const cpp6: TextFillBlankDef = {
  id: "cpp-6",
  difficulty: "medium",
  bugType: "wrong-operator",
  programmingLanguage: "cpp",
  concept: { en: "i++ returns the old value before incrementing; ++i increments first and returns the new value", ka: "i++ ძველ მნიშვნელობას აბრუნებს ინკრემენტამდე; ++i ჯერ ზრდის და შემდეგ ახალ მნიშვნელობას აბრუნებს" },
  title: { en: "The Late Counter", ka: "დაგვიანებული მთვლელი" },
  story: { en: "A ticket dispenser issues ticket numbers starting at 1, but the first ticket printed is always 0.", ka: "ბილეთების გამანაწილებელი 1-ით დაწყებულ ნომრებს გასცემს, მაგრამ პირველი ბილეთი ყოველთვის 0 ბეჭდება." },
  task: { en: "Use the increment operator that returns the already-incremented value.", ka: "ინკრემენტ ოპერატორი გამოიყენე, რომელიც უკვე გაზრდილ მნიშვნელობას აბრუნებს." },
  hints: [
    { en: "What does int x = 0; std::cout << x++; print?", ka: "int x = 0; std::cout << x++; რას დაბეჭდავს?" },
    { en: "x++ evaluates to the current x, then increments. You want the new value.", ka: "x++ მიმდინარე x-ს გამოაქვს, შემდეგ ზრდის. ახალ მნიშვნელობა გჭირდება." },
    { en: "++x increments first, then evaluates to the new value.", ka: "++x ჯერ ზრდის, შემდეგ ახალ მნიშვნელობას გამოაქვს." },
  ],
  format: "text",
  interaction: "fill-blank",
  codeBefore: `class TicketDispenser {
    int next = 0;
public:
    int issueTicket() { return `,
  codeAfter: `next; }
};

// first call should return 1, not 0`,
  correctedCode: `#include <iostream>

class TicketDispenser {
    int next = 0;
public:
    int issueTicket() { return ++next; }
};

int main() {
    TicketDispenser td;
    std::cout << td.issueTicket() << "\\n";  // 1
    std::cout << td.issueTicket() << "\\n";  // 2
    std::cout << td.issueTicket() << "\\n";  // 3
}`,
  codeBeforeByLang: {
    python: `class TicketDispenser:
    def __init__(self):
        self.next = 0
    def issue_ticket(self):
        self.next `,
    javascript: `class TicketDispenser {
    constructor() { this.next = 0; }
    issueTicket() {
        return `,
    java: `public class Main {
    static class TicketDispenser {
        int next = 0;
        int issueTicket() { return `,
  },
  codeAfterByLang: {
    python: `+= 1
        return self.next - 1  # bug: returns old value (post-increment style)

# first call should return 1, not 0`,
    javascript: `this.next++;  // bug: returns old value before increment
    }
}

// first call should return 1, not 0`,
    java: `this.next++;  // bug: returns old value before increment
        }
    }
    public static void main(String[] args) {
        TicketDispenser td = new TicketDispenser();
        System.out.println(td.issueTicket());  // should be 1, not 0
    }
}`,
  },
  correctedCodeByLang: {
    python: `class TicketDispenser:
    def __init__(self):
        self.next = 0
    def issue_ticket(self):
        self.next += 1
        return self.next  # return after incrementing

td = TicketDispenser()
print(td.issue_ticket())  # 1
print(td.issue_ticket())  # 2
print(td.issue_ticket())  # 3`,
    javascript: `class TicketDispenser {
    constructor() { this.next = 0; }
    issueTicket() {
        return ++this.next;  // pre-increment: increment then return
    }
}

const td = new TicketDispenser();
console.log(td.issueTicket());  // 1
console.log(td.issueTicket());  // 2
console.log(td.issueTicket());  // 3`,
    java: `public class Main {
    static class TicketDispenser {
        int next = 0;
        int issueTicket() { return ++next; }  // pre-increment
    }
    public static void main(String[] args) {
        TicketDispenser td = new TicketDispenser();
        System.out.println(td.issueTicket());  // 1
        System.out.println(td.issueTicket());  // 2
        System.out.println(td.issueTicket());  // 3
    }
}`,
  },
  options: [
    {
      id: "a", value: "++", correct: true,
      explanation: { en: "++next increments next from 0 to 1, then returns 1. The first ticket is correctly numbered 1.", ka: "++next next-ს 0-დან 1-ზე ზრდის, შემდეგ 1-ს აბრუნებს. პირველი ბილეთი სწორად 1-ია." },
    },
    {
      id: "b", value: "", correct: false,
      explanation: { en: "Without any operator, next is returned unchanged (0 for the first call) and never incremented.", ka: "ოპერატორის გარეშე next უცვლელად (0) დაბრუნდება და ვერ გაიზრდება." },
    },
    {
      id: "c", value: "next++,", correct: false,
      explanation: { en: "next++ would return next's old value before incrementing — first ticket is 0. Also syntactically broken with trailing comma.", ka: "next++ ინკრემენტამდე ძველ მნიშვნელობას დაბრუნებს — პირველი ბილეთი 0 გამოვა. ბოლო მძიმის გამო სინტაქსური პრობლემაც." },
    },
  ],
};

// ─── cpp-7: Integer overflow ──────────────────────────────────────────────────

const cpp7: TextPickFixDef = {
  id: "cpp-7",
  difficulty: "medium",
  bugType: "type-error",
  programmingLanguage: "cpp",
  concept: { en: "int overflow wraps around silently in C++; use long long for large values", ka: "C++-ში int-ის გადავსება ჩუმად ირახება; დიდი მნიშვნელობებისთვის long long გამოიყენე" },
  title: { en: "The Population Counter", ka: "მოსახლეობის მთვლელი" },
  story: { en: "A world population calculator produces negative results because the product overflows a 32-bit integer.", ka: "მსოფლიო მოსახლეობის კალკულატორი უარყოფით შედეგებს გამოაქვს, რადგან ნამრავლი 32-ბიტიანი მთელ რიცხვს ევსება." },
  task: { en: "Use a type that can hold values in the billions.", ka: "ტიპი გამოიყენე, რომელსაც მილიარდები შეუძლია შეინახოს." },
  hints: [
    { en: "INT_MAX is 2,147,483,647. World population is ~8 billion.", ka: "INT_MAX-ი 2,147,483,647-ია. მსოფლიო მოსახლეობა ~8 მილიარდია." },
    { en: "When an int exceeds INT_MAX, it wraps to a large negative number.", ka: "int INT_MAX-ს გადასვლისას დიდ უარყოფით რიცხვზე გადადის." },
    { en: "Declare the variable as long long — 64-bit integers hold up to ~9.2×10^18.", ka: "ცვლადი long long-ად გამოაცხადე — 64-ბიტიანი მთელი რიცხვები ~9.2×10^18-მდე." },
  ],
  format: "text",
  interaction: "pick-fix",
  code: `int worldPopulation() {
    int billions = 8;
    int perBillion = 1000000000;
    return billions * perBillion; // overflows int!
}`,
  bugLine: 2,
  correctedCode: `#include <iostream>

long long worldPopulation() {
    long long billions = 8;
    long long perBillion = 1000000000;
    return billions * perBillion;
}

int main() {
    std::cout << worldPopulation() << std::endl;  // 8000000000
}`,
  codeByLang: {
    python: `# Python integers never overflow — show a related precision bug instead
import sys

def world_population():
    # bug: using float loses precision for large integers
    billions = 8.0
    per_billion = 1000000000.0
    result = billions * per_billion
    return int(result + 0.9)  # bug: incorrect rounding adds phantom people`,
    javascript: `function worldPopulation() {
    // JS uses 64-bit floats — loses integer precision above Number.MAX_SAFE_INTEGER
    let billions = 8;
    let perBillion = 1000000000;
    let result = billions * perBillion;
    // bug: adding a large offset pushes past MAX_SAFE_INTEGER (9007199254740991)
    return result + 999999999999999;  // precision lost — last digits become 0
}`,
    java: `public class Main {
    static int worldPopulation() {
        int billions = 8;
        int perBillion = 1000000000;
        return billions * perBillion;  // overflows int — same bug as C++!
    }
}`,
  },
  bugLineByLang: {
    python: 8,
    javascript: 7,
    java: 4,
  },
  correctedCodeByLang: {
    python: `def world_population():
    # Python ints are arbitrary precision — no overflow
    billions = 8
    per_billion = 1_000_000_000
    return billions * per_billion

print(world_population())  # 8000000000`,
    javascript: `function worldPopulation() {
    // Use BigInt for integers beyond Number.MAX_SAFE_INTEGER
    const billions = 8n;
    const perBillion = 1_000_000_000n;
    return billions * perBillion;
}

console.log(worldPopulation().toString());  // "8000000000"`,
    java: `public class Main {
    static long worldPopulation() {
        long billions = 8L;
        long perBillion = 1_000_000_000L;
        return billions * perBillion;  // long holds up to ~9.2e18
    }
    public static void main(String[] args) {
        System.out.println(worldPopulation());  // 8000000000
    }
}`,
  },
  fixes: [
    {
      id: "long-long", correct: true,
      label: { en: "Declare billions and perBillion as long long", ka: "billions და perBillion long long-ად გამოაცხადე" },
      explanation: { en: "long long is 64-bit and holds values up to 9.2×10^18 — more than enough for billions.", ka: "long long 64-ბიტიანია და 9.2×10^18-მდე ინახავს — მილიარდებისთვის საკმარისია." },
    },
    {
      id: "unsigned", correct: false,
      label: { en: "Use unsigned int instead", ka: "unsigned int გამოიყენე" },
      explanation: { en: "unsigned int doubles the range to ~4.3 billion, still not enough for 8 billion.", ka: "unsigned int დიაპაზონს ~4.3 მილიარდამდე ორმაგობს, 8 მილიარდისთვის მაინც არ კმარა." },
    },
    {
      id: "float", correct: false,
      label: { en: "Use float or double", ka: "float ან double გამოიყენე" },
      explanation: { en: "float/double lose precision for large integers. Use integral types (long long) when you need exact integer values.", ka: "float/double დიდი მთელი რიცხვებისთვის სიზუსტეს კარგავს. ზუსტი მთელი მნიშვნელობებისთვის მთელი ტიპები (long long) გამოიყენე." },
    },
  ],
};

// ─── cpp-8: Missing break in switch ──────────────────────────────────────────

const cpp8: TextPickFixDef = {
  id: "cpp-8",
  difficulty: "hard",
  bugType: "wrong-condition",
  programmingLanguage: "cpp",
  concept: { en: "switch cases fall through without break; always add break unless fall-through is intentional", ka: "switch-ის case-ები break-ის გარეშე გადადიან; break ყოველთვის დაამატე, თუ fall-through განზრახული არ არის" },
  title: { en: "The Overeager Switch", ka: "გადამეტებულად-მოხალისე switch" },
  story: { en: "A menu handler executes multiple actions when only one should run, because of unintended fall-through.", ka: "მენიუს დამამუშავებელი რამდენიმე მოქმედებას ასრულებს, მაშინ როცა მხოლოდ ერთი უნდა გაშვებულიყო, fall-through-ის გამო." },
  task: { en: "Add break statements to prevent each case from falling into the next.", ka: "break ბრძანებები დაამატე, რათა თითოეული case მომდევნოში არ გადადიოდეს." },
  hints: [
    { en: "Trace what happens when choice = 1. Which cases execute?", ka: "choice = 1-ისთვის გაიარე. რომელი case-ები სრულდება?" },
    { en: "Without break, execution continues into the next case regardless of its label.", ka: "break-ის გარეშე შესრულება შემდეგ case-ში გადადის, მის ეტიკეტზე განურჩევლად." },
    { en: "Add break; as the last statement of each case.", ka: "break; ყოველი case-ის ბოლო ბრძანებად დაამატე." },
  ],
  format: "text",
  interaction: "pick-fix",
  code: `void handleMenu(int choice) {
    switch (choice) {
        case 1: std::cout << "New game\\n";   // falls through!
        case 2: std::cout << "Load game\\n";  // falls through!
        case 3: std::cout << "Options\\n";
    }
}`,
  bugLine: 3,
  correctedCode: `#include <iostream>

void handleMenu(int choice) {
    switch (choice) {
        case 1: std::cout << "New game\\n";  break;
        case 2: std::cout << "Load game\\n"; break;
        case 3: std::cout << "Options\\n";   break;
    }
}

int main() {
    handleMenu(1);  // New game
    handleMenu(2);  // Load game
    handleMenu(3);  // Options
}`,
  codeByLang: {
    python: `def handle_menu(choice):
    # Python has no switch (pre-3.10) — simulate with if/elif chain with missing condition
    if choice == 1:
        print("New game")
        # bug: missing 'elif' — falls through to next print
    if choice == 2:  # bug: should be elif — always checked separately
        print("Load game")
    if choice == 3:  # bug: should be elif
        print("Options")`,
    javascript: `function handleMenu(choice) {
    switch (choice) {
        case 1: console.log("New game");    // falls through!
        case 2: console.log("Load game");   // falls through!
        case 3: console.log("Options");
    }
}`,
    java: `public class Main {
    static void handleMenu(int choice) {
        switch (choice) {
            case 1: System.out.println("New game");    // falls through!
            case 2: System.out.println("Load game");   // falls through!
            case 3: System.out.println("Options");
        }
    }
}`,
  },
  bugLineByLang: {
    python: 4,
    javascript: 3,
    java: 4,
  },
  correctedCodeByLang: {
    python: `def handle_menu(choice):
    if choice == 1:
        print("New game")
    elif choice == 2:
        print("Load game")
    elif choice == 3:
        print("Options")

handle_menu(1)  # New game
handle_menu(2)  # Load game
handle_menu(3)  # Options`,
    javascript: `function handleMenu(choice) {
    switch (choice) {
        case 1: console.log("New game");   break;
        case 2: console.log("Load game");  break;
        case 3: console.log("Options");    break;
    }
}

handleMenu(1);  // New game
handleMenu(2);  // Load game
handleMenu(3);  // Options`,
    java: `public class Main {
    static void handleMenu(int choice) {
        switch (choice) {
            case 1: System.out.println("New game");   break;
            case 2: System.out.println("Load game");  break;
            case 3: System.out.println("Options");    break;
        }
    }
    public static void main(String[] args) {
        handleMenu(1);  // New game
        handleMenu(2);  // Load game
        handleMenu(3);  // Options
    }
}`,
  },
  fixes: [
    {
      id: "break-each", correct: true,
      label: { en: "Add break; after each case body", ka: "ყოველი case-ის შემდეგ break; დაამატე" },
      explanation: { en: "break exits the switch block. Without it, C++ continues executing subsequent cases.", ka: "break switch ბლოკს ტოვებს. მის გარეშე C++ შემდეგ case-ებს ასრულებს." },
    },
    {
      id: "default", correct: false,
      label: { en: "Add a default: case at the end", ka: "ბოლოში default: case დაამატე" },
      explanation: { en: "default handles unmatched values but doesn't stop fall-through between existing cases.", ka: "default დაუმთხვეველ მნიშვნელობებს მართავს, მაგრამ არსებულ case-ებს შორის fall-through-ს არ წყვეტს." },
    },
    {
      id: "if-else", correct: false,
      label: { en: "Replace switch with if-else chains", ka: "switch → if-else ჯაჭვი" },
      explanation: { en: "if-else would work but is not the minimal targeted fix — the task is to understand break in switch.", ka: "if-else მუშაობდა, მაგრამ მინიმალური მიზანმიმართული გამოსწორება არ არის — ამოცანა switch-ში break-ის გაგებაა." },
    },
  ],
};

// ─── cpp-9: Shallow copy of pointer member ───────────────────────────────────

const cpp9: TextPickFixDef = {
  id: "cpp-9",
  difficulty: "hard",
  bugType: "mutation-error",
  programmingLanguage: "cpp",
  concept: { en: "The default copy constructor does a shallow copy — pointer members share the same heap memory", ka: "ნაგულისხმევი კოპირების კონსტრუქტორი ზედაპირულ ასლს ქმნის — მაჩვენებელ წევრებს ერთი heap-ი ეზიარება" },
  title: { en: "The Shared Secret", ka: "გაზიარებული საიდუმლო" },
  story: { en: "Two 'independent' Buffer objects share the same internal array, so modifying one corrupts the other.", ka: "ორი 'დამოუკიდებელი' Buffer ობიექტი ერთ შიდა მასივს იზიარებს, ამიტომ ერთ-ის შეცვლა მეორეს აზიანებს." },
  task: { en: "Implement a copy constructor that allocates a new array and deep-copies the data.", ka: "კოპირების კონსტრუქტორი განახორციელე, რომელიც ახალ მასივს გამოყოფს და მონაცემებს ღრმად კოპირებს." },
  hints: [
    { en: "What does the default copy constructor copy for pointer members?", ka: "ნაგულისხმევი კოპირების კონსტრუქტორი მაჩვენებელ წევრებს რას კოპირებს?" },
    { en: "The default copies the pointer value (address) — both objects point to the same array.", ka: "ნაგულისხმევი კოპირება მაჩვენებლის მნიშვნელობას (მისამართს) კოპირებს — ორივე ობიექტი ერთ მასივს მიუთითებს." },
    { en: "In the copy constructor, allocate a new array and use memcpy or a loop to copy elements.", ka: "კოპირების კონსტრუქტორში ახალი მასივი გამოყავი და memcpy ან მარყუჟი გამოიყენე ელემენტების კოპირებისთვის." },
  ],
  format: "text",
  interaction: "pick-fix",
  code: `class Buffer {
    int* data;
    int  size;
public:
    Buffer(int s) : size(s), data(new int[s]) {}
    // default copy ctor — shallow copy!
    ~Buffer() { delete[] data; }
};

Buffer a(4);
Buffer b = a;  // b.data == a.data — both delete[] same memory!`,
  bugLine: 6,
  correctedCode: `#include <iostream>
#include <algorithm>

class Buffer {
    int* data;
    int  size;
public:
    Buffer(int s) : size(s), data(new int[s]) {}
    Buffer(const Buffer& o) : size(o.size), data(new int[o.size]) {
        std::copy(o.data, o.data + size, data);
    }
    ~Buffer() { delete[] data; }
    int& operator[](int i) { return data[i]; }
};

int main() {
    Buffer a(4);
    a[0] = 42;
    Buffer b = a;   // deep copy — independent memory
    b[0] = 99;
    std::cout << a[0] << std::endl;  // 42 (unchanged)
    std::cout << b[0] << std::endl;  // 99
}`,
  codeByLang: {
    python: `# Python: shallow copy of a list — inner lists are shared
import copy

class Buffer:
    def __init__(self, data):
        self.data = data  # stores reference

a = Buffer([[1, 2], [3, 4]])
b = Buffer(a.data)  # bug: shallow copy — b.data IS a.data
b.data[0][0] = 99   # modifies a's data too!`,
    javascript: `// JS: spread operator is shallow — nested objects are still shared
class Buffer {
    constructor(data) {
        this.data = data;
    }
    shallowCopy() {
        return new Buffer([...this.data]);  // bug: spread only copies top level
    }
}

const a = new Buffer([[1, 2], [3, 4]]);
const b = a.shallowCopy();
b.data[0][0] = 99;  // also changes a.data[0][0]!`,
    java: `public class Main {
    static class Buffer implements Cloneable {
        int[] data;
        Buffer(int size) { this.data = new int[size]; }

        // bug: clone() does shallow copy — data array is shared
        public Buffer clone() throws CloneNotSupportedException {
            return (Buffer) super.clone();  // shallow: data reference copied, not array
        }
    }
}`,
  },
  bugLineByLang: {
    python: 8,
    javascript: 6,
    java: 7,
  },
  correctedCodeByLang: {
    python: `import copy

class Buffer:
    def __init__(self, data):
        self.data = data

a = Buffer([[1, 2], [3, 4]])
b = Buffer(copy.deepcopy(a.data))  # deep copy — independent nested lists
b.data[0][0] = 99
print(a.data[0][0])  # 1 (unchanged)
print(b.data[0][0])  # 99`,
    javascript: `class Buffer {
    constructor(data) {
        this.data = data;
    }
    deepCopy() {
        return new Buffer(JSON.parse(JSON.stringify(this.data)));  // deep copy
    }
}

const a = new Buffer([[1, 2], [3, 4]]);
const b = a.deepCopy();
b.data[0][0] = 99;
console.log(a.data[0][0]);  // 1 (unchanged)
console.log(b.data[0][0]);  // 99`,
    java: `public class Main {
    static class Buffer {
        int[] data;
        Buffer(int size) { this.data = new int[size]; }

        // deep copy constructor
        Buffer(Buffer other) {
            this.data = other.data.clone();  // Arrays.clone() makes a true copy
        }
    }
    public static void main(String[] args) {
        Buffer a = new Buffer(4);
        a.data[0] = 42;
        Buffer b = new Buffer(a);  // deep copy
        b.data[0] = 99;
        System.out.println(a.data[0]);  // 42 (unchanged)
        System.out.println(b.data[0]);  // 99
    }
}`,
  },
  fixes: [
    {
      id: "deep-copy", correct: true,
      label: { en: "Add Buffer(const Buffer& o) : size(o.size), data(new int[o.size]) { std::copy(o.data, o.data+size, data); }", ka: "Buffer(const Buffer& o) : size(o.size), data(new int[o.size]) { std::copy(o.data, o.data+size, data); } დაამატე" },
      explanation: { en: "Deep copy allocates independent memory and copies the contents. Modifying b won't affect a.", ka: "ღრმა კოპირება დამოუკიდებელ მეხსიერებას გამოყოფს და შინაარსს კოპირებს. b-ს შეცვლა a-ს არ შეეხება." },
    },
    {
      id: "no-destructor", correct: false,
      label: { en: "Remove the destructor to avoid double-free", ka: "ორმაგი გათავისუფლების თავიდან ასაცილებლად destructor-ი ამოიღე" },
      explanation: { en: "Removing the destructor avoids double-free but leaks every buffer — a worse problem.", ka: "destructor-ის ამოღება ორმაგ გათავისუფლებას თავიდან არიდებს, მაგრამ ყოველ buffer-ს გაჟონვა ექნება — უარესი პრობლემა." },
    },
    {
      id: "shared-ptr", correct: false,
      label: { en: "Use std::shared_ptr<int[]> instead of raw pointer", ka: "raw მაჩვენებლის ნაცვლად std::shared_ptr<int[]> გამოიყენე" },
      explanation: { en: "shared_ptr handles lifetime automatically but changes the semantics — sharing is intentional, deep copy is not the outcome.", ka: "shared_ptr სიცოცხლეს ავტომატურად მართავს, მაგრამ სემანტიკას ცვლის — გაზიარება განზრახულია, ღრმა კოპირება შედეგი არ არის." },
    },
  ],
};

// ─── cpp-10: Comparison with signed/unsigned ──────────────────────────────────

const cpp10: TextFillBlankDef = {
  id: "cpp-10",
  difficulty: "hard",
  bugType: "comparison-error",
  programmingLanguage: "cpp",
  concept: { en: "Comparing signed int with size_t (unsigned) can produce wrong results when int is negative", ka: "signed int-ის size_t-თან (unsigned) შედარება შეიძლება არასწორ შედეგს გამოიწვიოს, როდესაც int უარყოფითია" },
  title: { en: "The Invisible Negative", ka: "უხილავი უარყოფითი" },
  story: { en: "A bounds check that should catch negative indices silently passes them through because of signed/unsigned comparison.", ka: "ზღვრის შემოწმება, რომელიც უარყოფით ინდექსებს უნდა დაიჭიროს, ჩუმად ატარებს მათ signed/unsigned შედარების გამო." },
  task: { en: "Fix the comparison so negative indices are correctly rejected.", ka: "შედარება გაასწორე, რომ უარყოფითი ინდექსები სწორად მოიგერიოს." },
  hints: [
    { en: "What type does vec.size() return?", ka: "vec.size() რა ტიპს აბრუნებს?" },
    { en: "size_t is unsigned. When you compare int(-1) with size_t, -1 converts to a huge unsigned number.", ka: "size_t unsigned-ია. int(-1)-ის size_t-თან შედარებისას -1 ძალიან დიდ unsigned რიცხვად გარდაიქმნება." },
    { en: "Cast index to ptrdiff_t (signed) or check index < 0 separately first.", ka: "index ptrdiff_t-ად (signed) გარდაქმენი ან index < 0 ცალკე ჯერ შეამოწმე." },
  ],
  format: "text",
  interaction: "fill-blank",
  codeBefore: `bool inBounds(const std::vector<int>& vec, int index) {
    return `,
  codeAfter: `index >= 0 && (size_t)index < vec.size();
}

// inBounds(vec, -1) should return false`,
  correctedCode: `#include <iostream>
#include <vector>

bool inBounds(const std::vector<int>& vec, int index) {
    return index >= 0 && (size_t)index < vec.size();
}

int main() {
    std::vector<int> v = {10, 20, 30};
    std::cout << std::boolalpha;
    std::cout << inBounds(v,  1) << "\\n";  // true
    std::cout << inBounds(v, -1) << "\\n";  // false
    std::cout << inBounds(v,  5) << "\\n";  // false
}`,
  codeBeforeByLang: {
    python: `def in_bounds(lst, index):
    # bug: comparing with NaN-like implicit cast
    return `,
    javascript: `function inBounds(arr, index) {
    // bug: comparing number with NaN
    return `,
    java: `public class Main {
    static boolean inBounds(int[] arr, int index) {
        // bug: implicit signed/unsigned widening
        return `,
  },
  codeAfterByLang: {
    python: `index < len(lst)  # bug: negative index wraps in Python — always truthy for small negatives

# in_bounds([10,20,30], -1) should return False`,
    javascript: `index < arr.length;  // bug: -1 < 3 is true — negative index slips through
}

// inBounds([10,20,30], -1) should return false`,
    java: `(long) index < arr.length;  // bug: cast to long but skips negative check
    }
    public static void main(String[] args) {
        int[] v = {10, 20, 30};
        System.out.println(inBounds(v, -1));  // should print false
    }
}`,
  },
  correctedCodeByLang: {
    python: `def in_bounds(lst, index):
    return 0 <= index < len(lst)  # explicit lower bound check

print(in_bounds([10, 20, 30],  1))  # True
print(in_bounds([10, 20, 30], -1))  # False
print(in_bounds([10, 20, 30],  5))  # False`,
    javascript: `function inBounds(arr, index) {
    return index >= 0 && index < arr.length;  // explicit negative guard
}

console.log(inBounds([10, 20, 30],  1));  // true
console.log(inBounds([10, 20, 30], -1));  // false
console.log(inBounds([10, 20, 30],  5));  // false`,
    java: `public class Main {
    static boolean inBounds(int[] arr, int index) {
        return index >= 0 && index < arr.length;  // check negative first
    }
    public static void main(String[] args) {
        int[] v = {10, 20, 30};
        System.out.println(inBounds(v,  1));  // true
        System.out.println(inBounds(v, -1));  // false
        System.out.println(inBounds(v,  5));  // false
    }
}`,
  },
  options: [
    {
      id: "a", value: "", correct: true,
      explanation: { en: "The explicit check index >= 0 (using signed comparison) catches negatives before the unsigned size comparison.", ka: "ცხადი შემოწმება index >= 0 (signed შედარებით) უარყოფითებს ჭერს unsigned ზომის შედარებამდე." },
    },
    {
      id: "b", value: "(size_t)", correct: false,
      explanation: { en: "Casting index to size_t first converts -1 to a huge number — the >= 0 check would never catch it.", ka: "index-ის size_t-ად გარდაქმნა -1-ს უზარმაზარ რიცხვად გარდაქმნის — >= 0 შემოწმება ვერ დაიჭერს." },
    },
    {
      id: "c", value: "(int)vec.size() >", correct: false,
      explanation: { en: "Casting size() to int risks overflow for very large vectors, and the logic still doesn't catch negative indices.", ka: "size()-ის int-ად გარდაქმნა ძალიან დიდი vector-ებისთვის გადავსებას რისკავს, და ლოგიკა კვლავ უარყოფით ინდექსებს ვერ იჭერს." },
    },
  ],
};

// ─── cpp-11: std::endl flushes buffer; '\n' does not ─────────────────────────

const cpp11: TextFillBlankDef = {
  id: "cpp-11",
  difficulty: "easy",
  bugType: "wrong-operator",
  programmingLanguage: "cpp",
  concept: { en: "std::endl flushes the output buffer every call; use '\\n' for better performance in tight loops", ka: "std::endl ყოველ გამოძახებაზე ბუფერს ჩამოყრის; მჭიდრო მარყუჟებში '\\n' გამოიყენე სიჩქარისთვის" },
  title: { en: "The Slow Logger", ka: "ნელი ლოგერი" },
  story: { en: "A logging function that prints millions of lines is 10× slower than expected because it flushes the buffer every line.", ka: "ლოგის ფუნქცია, რომელიც მილიონობით სტრიქონს ბეჭდავს, 10-ჯერ უფრო ნელია მოსალოდნელზე, რადგან ყოველ სტრიქონს ბუფერს ჩამოყრის." },
  task: { en: "Replace the output with the character that adds a newline without forcing a flush.", ka: "გამოსავალი შეცვალე სიმბოლოთი, რომელიც ახალ სტრიქონს ამატებს flush-ის გარეშე." },
  hints: [
    { en: "std::endl = '\\n' + flush. What does flushing the buffer do?", ka: "std::endl = '\\n' + flush. ბუფერის ჩამოყრა რას ახდენს?" },
    { en: "Flushing writes buffered data to the OS immediately — expensive if done millions of times.", ka: "ჩამოყრა ბუფერულ მონაცემებს OS-ზე მაშინვე წერს — ძვირია მილიონობითჯერ." },
    { en: "Use '\\n' to get a newline without the flush overhead.", ka: "'\\n' გამოიყენე flush-ის ხარჯების გარეშე ახალი სტრიქონისთვის." },
  ],
  format: "text",
  interaction: "fill-blank",
  codeBefore: `#include <iostream>

void log_values(int n) {
    for (int i = 0; i < n; ++i) {
        std::cout << i << `,
  codeAfter: `;
    }
}`,
  correctedCode: `#include <iostream>

void log_values(int n) {
    for (int i = 0; i < n; ++i) {
        std::cout << i << '\\n';
    }
}

int main() {
    log_values(5);  // prints 0 1 2 3 4 on separate lines
}`,
  codeBeforeByLang: {
    python: `def log_values(n):
    result = ""
    for i in range(n):
        result += str(i) + `,
    javascript: `function logValues(n) {
    let result = "";
    for (let i = 0; i < n; i++) {
        result += i + `,
    java: `public class Main {
    static void logValues(int n) {
        String result = "";
        for (int i = 0; i < n; i++) {
            result += i + `,
  },
  codeAfterByLang: {
    python: `"\\n"  # bug: string concatenation in loop is O(n²) — use list + join instead
    print(result, end="")`,
    javascript: `"\\n";  // bug: string concatenation in loop creates O(n²) string copies
    }
    console.log(result);
}`,
    java: `"\\n";  // bug: String += in loop is O(n²) — use StringBuilder instead
        }
        System.out.print(result);
    }
    public static void main(String[] args) { logValues(5); }
}`,
  },
  correctedCodeByLang: {
    python: `def log_values(n):
    lines = []
    for i in range(n):
        lines.append(str(i))
    print("\\n".join(lines))  # O(n) — build list then join once

log_values(5)  # 0\\n1\\n2\\n3\\n4`,
    javascript: `function logValues(n) {
    const parts = [];
    for (let i = 0; i < n; i++) {
        parts.push(i);  // collect into array
    }
    console.log(parts.join("\\n"));  // join once — O(n)
}

logValues(5);`,
    java: `public class Main {
    static void logValues(int n) {
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < n; i++) {
            sb.append(i).append('\\n');  // StringBuilder is O(n) amortized
        }
        System.out.print(sb);
    }
    public static void main(String[] args) { logValues(5); }
}`,
  },
  options: [
    {
      id: "a", value: "'\\n'", correct: true,
      explanation: { en: "'\\n' appends a newline character without triggering a buffer flush, which is much faster in loops.", ka: "'\\n' flush-ის გარეშე ახალ სტრიქონს ამატებს, რაც მარყუჟებში გაცილებით სწრაფია." },
    },
    {
      id: "b", value: "std::endl", correct: false,
      explanation: { en: "std::endl writes '\\n' AND flushes the buffer on every iteration — very slow for tight loops.", ka: "std::endl '\\n'-ს წერს და ბუფერს ყოველ იტერაციაზე ჩამოყრის — მჭიდრო მარყუჟებისთვის ძალიან ნელია." },
    },
    {
      id: "c", value: "std::flush", correct: false,
      explanation: { en: "std::flush only flushes without adding a newline — output would run together on one line.", ka: "std::flush მხოლოდ ჩამოყრის ახალი სტრიქონის გარეშე — გამოსავალი ერთ სტრიქონზე გაერთიანდება." },
    },
  ],
};

// ─── cpp-12: string.empty() check ────────────────────────────────────────────

const cpp12: TextFillBlankDef = {
  id: "cpp-12",
  difficulty: "easy",
  bugType: "wrong-condition",
  programmingLanguage: "cpp",
  concept: { en: "std::string::size() returns size_t (unsigned); use .empty() to check for an empty string", ka: "std::string::size() size_t-ს (unsigned) აბრუნებს; ცარიელი სტრიქონის შესამოწმებლად .empty() გამოიყენე" },
  title: { en: "The Empty Guard", ka: "ცარიელი სტრიქონის დამცავი" },
  story: { en: "A validator that should reject empty strings always passes them because the wrong method is used to check length.", ka: "ვალიდატორი, რომელიც ცარიელ სტრიქონებს უარყოფს, ყოველთვის ათავისუფლებს, რადგან სიგრძის შემოწმებისთვის არასწორი მეთოდი გამოიყენება." },
  task: { en: "Use the std::string method designed specifically for checking if a string is empty.", ka: "გამოიყენე std::string მეთოდი, რომელიც სტრიქონის სიცარიელის შემოსაწმებლად შეიქმნა." },
  hints: [
    { en: "What does size() return for an empty string?", ka: "size() ცარიელი სტრიქონისთვის რას აბრუნებს?" },
    { en: "size() returns 0 for an empty string, but the idiomatic check in C++ uses a dedicated method.", ka: "size() ცარიელი სტრიქონისთვის 0-ს აბრუნებს, მაგრამ C++-ში სტანდარტული შემოწმება სპეციალიზებულ მეთოდს იყენებს." },
    { en: "str.empty() returns true if and only if the string has zero characters.", ka: "str.empty() true-ს აბრუნებს მხოლოდ მაშინ, როცა სტრიქონს ნულოვანი სიმბოლო აქვს." },
  ],
  format: "text",
  interaction: "fill-blank",
  codeBefore: `#include <string>
#include <stdexcept>

void validate(const std::string& name) {
    if (`,
  codeAfter: `)
        throw std::invalid_argument("Name cannot be empty");
}`,
  correctedCode: `#include <iostream>
#include <string>
#include <stdexcept>

void validate(const std::string& name) {
    if (name.empty())
        throw std::invalid_argument("Name cannot be empty");
    std::cout << "Valid: " << name << "\\n";
}

int main() {
    try {
        validate("Alice");  // Valid: Alice
        validate("");       // throws
    } catch (const std::invalid_argument& e) {
        std::cout << "Error: " << e.what() << "\\n";
    }
}`,
  codeBeforeByLang: {
    python: `def validate(name):
    if `,
    javascript: `function validate(name) {
    if (`,
    java: `public class Main {
    static void validate(String name) {
        if (`,
  },
  codeAfterByLang: {
    python: `len(name) == 0:  # works but not idiomatic — use 'not name' instead
        raise ValueError("Name cannot be empty")`,
    javascript: `name.length === 0) {  // works but not idiomatic — use !name instead
        throw new Error("Name cannot be empty");
    }
}`,
    java: `name.length() == 0)  // works but not idiomatic — use name.isEmpty() instead
            throw new IllegalArgumentException("Name cannot be empty");
    }
}`,
  },
  correctedCodeByLang: {
    python: `def validate(name):
    if not name:  # idiomatic: empty string is falsy in Python
        raise ValueError("Name cannot be empty")
    print(f"Valid: {name}")

try:
    validate("Alice")  # Valid: Alice
    validate("")       # raises
except ValueError as e:
    print(f"Error: {e}")`,
    javascript: `function validate(name) {
    if (!name) {  // idiomatic: empty string is falsy in JS
        throw new Error("Name cannot be empty");
    }
    console.log("Valid: " + name);
}

try {
    validate("Alice");  // Valid: Alice
    validate("");       // throws
} catch (e) {
    console.log("Error: " + e.message);
}`,
    java: `public class Main {
    static void validate(String name) {
        if (name.isEmpty())  // idiomatic Java empty-string check
            throw new IllegalArgumentException("Name cannot be empty");
        System.out.println("Valid: " + name);
    }
    public static void main(String[] args) {
        try {
            validate("Alice");  // Valid: Alice
            validate("");       // throws
        } catch (IllegalArgumentException e) {
            System.out.println("Error: " + e.getMessage());
        }
    }
}`,
  },
  options: [
    {
      id: "a", value: "name.empty()", correct: true,
      explanation: { en: "empty() is the idiomatic, clear, and correct way to check if a string has no characters.", ka: "empty() სტანდარტული, გასაგები და სწორი გზაა სტრიქონის სიმბოლოების არარსებობის შესამოწმებლად." },
    },
    {
      id: "b", value: "name.size() == 0", correct: false,
      explanation: { en: "Correct but less readable than .empty(), and size() returns size_t (unsigned) which can cause surprises.", ka: "სწორია, მაგრამ .empty()-ზე ნაკლებად წასაკითხი, ხოლო size() size_t-ს (unsigned) აბრუნებს, რაც სიურპრიზებს შეიძლება გამოიწვიოს." },
    },
    {
      id: "c", value: "name.length() < 1", correct: false,
      explanation: { en: "Equivalent but unnecessarily verbose — .empty() communicates intent more clearly.", ka: "ეკვივალენტია, მაგრამ ზედმეტად ვრცელი — .empty() განზრახვას უფრო ნათლად გამოხატავს." },
    },
  ],
};

// ─── cpp-13: vector passed by value copies it ─────────────────────────────────

const cpp13: TextPickFixDef = {
  id: "cpp-13",
  difficulty: "medium",
  bugType: "mutation-error",
  programmingLanguage: "cpp",
  concept: { en: "Passing std::vector by value copies the entire container; pass by const reference to avoid the copy", ka: "std::vector-ის მნიშვნელობით გადაცემა მთელ კონტეინერს კოპირებს; კოპირების თავიდან ასაცილებლად const reference-ით გადე" },
  title: { en: "The Hidden Copy", ka: "დამალული კოპია" },
  story: { en: "A statistics function works correctly but is unexpectedly slow on large vectors because every call duplicates the entire dataset.", ka: "სტატისტიკის ფუნქცია სწორად მუშაობს, მაგრამ დიდ ვექტორებზე მოულოდნელად ნელია, რადგან ყოველ გამოძახებაზე მთელი მონაცემთა ბაზა კოპირდება." },
  task: { en: "Change the parameter to avoid copying the vector on every function call.", ka: "პარამეტრი შეცვალე, რომ ყოველ გამოძახებაზე ვექტორი არ კოპირდეს." },
  hints: [
    { en: "What happens when you pass a large vector by value?", ka: "რა მოხდება, თუ დიდ ვექტორს მნიშვნელობით გადასცემ?" },
    { en: "Passing by value triggers the copy constructor — O(n) for every call.", ka: "მნიშვნელობით გადაცემა copy constructor-ს ააქტიურებს — ყოველ გამოძახებაზე O(n)." },
    { en: "const std::vector<int>& v gives read-only access with zero copies.", ka: "const std::vector<int>& v კოპირების გარეშე მხოლოდ წასაკითხ წვდომას იძლევა." },
  ],
  format: "text",
  interaction: "pick-fix",
  code: `#include <vector>
#include <numeric>

double average(std::vector<int> v) {
    if (v.empty()) return 0.0;
    return static_cast<double>(std::accumulate(v.begin(), v.end(), 0)) / v.size();
}`,
  bugLine: 4,
  correctedCode: `#include <vector>
#include <numeric>
#include <iostream>

double average(const std::vector<int>& v) {
    if (v.empty()) return 0.0;
    return static_cast<double>(std::accumulate(v.begin(), v.end(), 0)) / v.size();
}

int main() {
    std::vector<int> data = {10, 20, 30, 40};
    std::cout << average(data) << std::endl;  // 25
}`,
  codeByLang: {
    python: `# Python: lists are always passed by reference — different bug: mutation of caller's list
def average(data):
    data.sort()      # bug: mutates the caller's original list!
    total = sum(data)
    return total / len(data) if data else 0.0`,
    javascript: `// JS: arrays are passed by reference — same mutation bug as Python
function average(data) {
    data.sort((a, b) => a - b);  // bug: mutates caller's array in place!
    const total = data.reduce((s, x) => s + x, 0);
    return data.length ? total / data.length : 0;
}`,
    java: `import java.util.List;
import java.util.ArrayList;

public class Main {
    // Java: ArrayList passed by reference — mutation bug
    static double average(List<Integer> data) {
        data.clear();  // bug: clears the caller's list!
        return 0.0;
    }
}`,
  },
  bugLineByLang: {
    python: 3,
    javascript: 3,
    java: 6,
  },
  correctedCodeByLang: {
    python: `def average(data):
    # do not mutate caller's list — work on a copy if sorting needed
    if not data:
        return 0.0
    return sum(data) / len(data)

nums = [10, 20, 30, 40]
print(average(nums))  # 25.0
print(nums)           # [10, 20, 30, 40] — unchanged`,
    javascript: `function average(data) {
    if (!data.length) return 0;
    const total = data.reduce((s, x) => s + x, 0);
    return total / data.length;  // no mutation
}

const nums = [10, 20, 30, 40];
console.log(average(nums));  // 25
console.log(nums);           // [10, 20, 30, 40] — unchanged`,
    java: `import java.util.List;
import java.util.Arrays;

public class Main {
    static double average(List<Integer> data) {
        if (data.isEmpty()) return 0.0;
        int total = data.stream().mapToInt(Integer::intValue).sum();
        return (double) total / data.size();  // read-only — no mutation
    }
    public static void main(String[] args) {
        List<Integer> nums = Arrays.asList(10, 20, 30, 40);
        System.out.println(average(nums));  // 25.0
    }
}`,
  },
  fixes: [
    {
      id: "const-ref", correct: true,
      label: { en: "Change to const std::vector<int>& v", ka: "const std::vector<int>& v-ად შეცვლა" },
      explanation: { en: "A const reference passes a pointer to the existing vector — no copy is made. The function can still read all elements.", ka: "const reference არსებული ვექტორის მაჩვენებელს გადასცემს — კოპირება არ ხდება. ფუნქცია ჯერ კიდევ ყველა ელემენტს კითხულობს." },
    },
    {
      id: "move", correct: false,
      label: { en: "Pass by std::vector<int>&& v (rvalue reference)", ka: "std::vector<int>&& v-ით გადაცემა (rvalue reference)" },
      explanation: { en: "An rvalue reference enables move semantics but transfers ownership — callers lose their vector after the call.", ka: "Rvalue reference move სემანტიკას ახდენს, მაგრამ მფლობელობას გადასცემს — გამომძახებლები ვექტორს კარგავენ გამოძახების შემდეგ." },
    },
    {
      id: "pointer", correct: false,
      label: { en: "Pass as const std::vector<int>* v (pointer)", ka: "const std::vector<int>* v-ად (მაჩვენებლად) გადაცემა" },
      explanation: { en: "A pointer also avoids copying, but requires null checks and dereferencing — a const reference is cleaner here.", ka: "მაჩვენებელი ასევე კოპირებას ერიდება, მაგრამ null-შემოწმება და დერეფერენცია სჭირდება — const reference აქ სუფთაა." },
    },
  ],
};

// ─── cpp-14: nullptr vs NULL ──────────────────────────────────────────────────

const cpp14: TextFillBlankDef = {
  id: "cpp-14",
  difficulty: "medium",
  bugType: "type-error",
  programmingLanguage: "cpp",
  concept: { en: "nullptr is a typed null pointer constant in C++11; NULL is just an integer 0 that can cause ambiguous overload resolution", ka: "nullptr C++11-ის ტიპიზებული null მაჩვენებლის კონსტანტაა; NULL მხოლოდ 0 მთელი რიცხვია, რომელსაც ორაზროვანი overload გადაწყვეტა შეუძლია გამოიწვიოს" },
  title: { en: "Ambiguous NULL", ka: "ორაზროვანი NULL" },
  story: { en: "A function is overloaded for both int and pointer arguments. Calling it with NULL picks the wrong overload.", ka: "ფუნქცია int-ისა და მაჩვენებლის არგუმენტებისთვის overload-ებულია. NULL-ით გამოძახება არასწორ overload-ს ირჩევს." },
  task: { en: "Use the C++11 null pointer literal that unambiguously represents a null pointer.", ka: "C++11-ის null მაჩვენებლის ლიტერალი გამოიყენე, რომელიც null მაჩვენებელს ცალსახად წარმოადგენს." },
  hints: [
    { en: "NULL is typically defined as 0 or (void*)0. What type is 0?", ka: "NULL ჩვეულებრივ 0 ან (void*)0-ად განისაზღვრება. 0 რა ტიპია?" },
    { en: "When both f(int) and f(int*) exist, f(NULL) is ambiguous — the compiler may pick f(int).", ka: "f(int)-ი და f(int*)-ი ორივე არსებობს, f(NULL)-ი ორაზროვანია — კომპილატორი f(int)-ს შეიძლება ავარჩიოს." },
    { en: "nullptr has type std::nullptr_t and converts only to pointer types, never to int.", ka: "nullptr-ს std::nullptr_t ტიპი აქვს და მხოლოდ მაჩვენებლის ტიპებად გარდაიქმნება, არასდროს int-ად." },
  ],
  format: "text",
  interaction: "fill-blank",
  codeBefore: `#include <iostream>

void process(int* ptr) { std::cout << "pointer\\n"; }
void process(int val)   { std::cout << "integer\\n"; }

int main() {
    process(`,
  codeAfter: `);  // should print "pointer"
}`,
  codeBeforeByLang: {
    python: `def process(value):
    if value `,
    javascript: `function process(value) {
    if (value `,
    java: `public class Main {
    static void process(Integer ptr) {
        if (ptr `,
  },
  codeAfterByLang: {
    python: ` is 0:  # bug: 'is' checks identity not equality — may fail for larger ints
        print("none/null check failed")
    elif value is None:
        print("pointer (None)")
    else:
        print("integer")`,
    javascript: ` == null) {  // bug: == null matches both null AND undefined — use === null
        console.log("pointer (null)");
    } else {
        console.log("integer");
    }
}

process(null);       // should print "pointer (null)"
process(undefined);  // bug: also matches — should NOT`,
    java: ` == null)  // bug: missing null check — NullPointerException if ptr is null
            System.out.println("pointer (null)");
        else
            System.out.println("integer: " + ptr);
    }
    public static void main(String[] args) {
        process(null);  // should print "pointer (null)" without throwing
    }
}`,
  },
  correctedCodeByLang: {
    python: `def process(value):
    if value is None:  # idiomatic None check with 'is'
        print("pointer (None)")
    else:
        print("integer:", value)

process(None)  # pointer (None)
process(42)    # integer: 42`,
    javascript: `function process(value) {
    if (value === null) {  // === null is precise — doesn't match undefined
        console.log("pointer (null)");
    } else {
        console.log("integer:", value);
    }
}

process(null);  // pointer (null)
process(42);    // integer: 42`,
    java: `public class Main {
    static void process(Integer ptr) {
        if (ptr == null)  // safe: Java auto-unboxing skipped when ptr is null
            System.out.println("pointer (null)");
        else
            System.out.println("integer: " + ptr);
    }
    public static void main(String[] args) {
        process(null);  // pointer (null)
        process(42);    // integer: 42
    }
}`,
  },
  options: [
    {
      id: "a", value: "nullptr", correct: true,
      explanation: { en: "nullptr has type nullptr_t which converts to any pointer type but never to int, so process(int*) is chosen unambiguously.", ka: "nullptr-ს nullptr_t ტიპი აქვს, რომელიც ნებისმიერ მაჩვენებლის ტიპად გარდაიქმნება, მაგრამ არასდროს int-ად, ამიტომ process(int*)-ი ცალსახად ირჩევა." },
    },
    {
      id: "b", value: "NULL", correct: false,
      explanation: { en: "NULL is an integer constant (0). process(NULL) is ambiguous between process(int) and process(int*) and may not compile or pick the wrong overload.", ka: "NULL მთელი რიცხვის კონსტანტაა (0). process(NULL)-ი process(int)-სა და process(int*)-ს შორის ორაზროვანია და შეიძლება არ კომპილირდეს ან არასწორ overload-ს ავარჩიოს." },
    },
    {
      id: "c", value: "0", correct: false,
      explanation: { en: "Passing 0 will call process(int), not process(int*) — 0 is an integer literal.", ka: "0-ის გადაცემა process(int)-ს გამოიძახებს, არა process(int*)-ს — 0 მთელი რიცხვის ლიტერალია." },
    },
  ],
};

// ─── cpp-15: delete[] vs delete for arrays ────────────────────────────────────

const cpp15: TextPickFixDef = {
  id: "cpp-15",
  difficulty: "hard",
  bugType: "mutation-error",
  programmingLanguage: "cpp",
  concept: { en: "Arrays allocated with new[] must be freed with delete[]; using delete alone is undefined behavior", ka: "new[]-ით გამოყოფილი მასივები delete[]-ით უნდა გათავისუფლდეს; delete-ის გამოყენება undefined behavior-ია" },
  title: { en: "Array Delete Bug", ka: "მასივის წაშლის ბაგი" },
  story: { en: "A buffer manager uses new[] to allocate an array but frees it with plain delete, causing a memory corruption bug.", ka: "ბუფერის მენეჯერი new[]-ს იყენებს მასივის გამოსაყოფად, მაგრამ ჩვეულებრივი delete-ით ათავისუფლებს, მეხსიერების კორუფციის ბაგის გამოწვევით." },
  task: { en: "Use the correct operator to free a dynamically allocated array.", ka: "სწორი ოპერატორი გამოიყენე დინამიურად გამოყოფილი მასივის გასათავისუფლებლად." },
  hints: [
    { en: "How was the array allocated — with new or new[]?", ka: "მასივი new-ით გამოიყო თუ new[]-ით?" },
    { en: "new[] and delete[] are paired — just like malloc and free must be paired.", ka: "new[]-ი და delete[]-ი წყვილდება — ისევე, როგორც malloc-ი და free-ი უნდა წყვილდებოდეს." },
    { en: "delete buf frees only the first element's destructor — the rest of the array leaks or corrupts memory.", ka: "delete buf მხოლოდ პირველი ელემენტის destructor-ს ათავისუფლებს — დანარჩენი მასივი გადადის ან მეხსიერებას ახინჯებს." },
  ],
  format: "text",
  interaction: "pick-fix",
  code: `class Buffer {
    int* data;
    int  size;
public:
    Buffer(int n) : data(new int[n]), size(n) {}
    ~Buffer() {
        delete data;  // wrong: should be delete[]
    }
};`,
  bugLine: 7,
  correctedCode: `#include <iostream>

class Buffer {
    int* data;
    int  size;
public:
    Buffer(int n) : data(new int[n]), size(n) {}
    ~Buffer() {
        delete[] data;  // correct: matches new[]
    }
    int getSize() const { return size; }
};

int main() {
    Buffer b(10);
    std::cout << "Buffer size: " << b.getSize() << std::endl;  // 10
}  // ~Buffer() correctly frees all 10 elements`,
  codeByLang: {
    python: `# Python: no manual memory — closest bug: file/resource not properly closed
class Buffer:
    def __init__(self, n):
        self.file = open("temp_buffer.txt", "w")  # resource acquired
        self.size = n

    def write(self, data):
        self.file.write(data)

    def destroy(self):
        pass  # bug: forgot to close the file — resource leak!`,
    javascript: `// JS: no manual memory — closest bug: event listener not removed (resource leak)
class Buffer {
    constructor(n) {
        this.size = n;
        this.handler = () => console.log("event");
        document.addEventListener("click", this.handler);  // resource acquired
    }

    destroy() {
        // bug: forgot removeEventListener — handler leaks in memory
    }
}`,
    java: `public class Main {
    static class Buffer {
        int[] data;
        int size;

        Buffer(int n) {
            this.data = new int[n];
            this.size = n;
        }

        void destroy() {
            data = null;  // bug: just nulls reference — does not release promptly
            // should use try-with-resources or explicit close() pattern
        }
    }
}`,
  },
  bugLineByLang: {
    python: 11,
    javascript: 12,
    java: 11,
  },
  correctedCodeByLang: {
    python: `class Buffer:
    def __init__(self, n):
        self.file = open("temp_buffer.txt", "w")
        self.size = n

    def write(self, data):
        self.file.write(data)

    def destroy(self):
        self.file.close()  # explicitly close the resource

# or use context manager (preferred):
# with open("temp_buffer.txt", "w") as f:
#     f.write("data")`,
    javascript: `class Buffer {
    constructor(n) {
        this.size = n;
        this.handler = () => console.log("event");
        document.addEventListener("click", this.handler);
    }

    destroy() {
        document.removeEventListener("click", this.handler);  // properly removes listener
    }
}`,
    java: `public class Main {
    static class Buffer implements AutoCloseable {
        int[] data;
        int size;

        Buffer(int n) {
            this.data = new int[n];
            this.size = n;
        }

        @Override
        public void close() {
            data = null;  // release reference for GC
            System.out.println("Buffer freed");
        }
    }
    public static void main(String[] args) throws Exception {
        try (Buffer b = new Buffer(10)) {  // try-with-resources ensures close() is called
            System.out.println("Buffer size: " + b.size);
        }
    }
}`,
  },
  fixes: [
    {
      id: "delete-array", correct: true,
      label: { en: "Change delete data to delete[] data", ka: "delete data → delete[] data" },
      explanation: { en: "delete[] calls the destructor for each element and tells the allocator the full size to free. Plain delete only processes one element, causing undefined behavior.", ka: "delete[] ყოველი ელემენტის destructor-ს ააქტიურებს და allocator-ს სრულ ზომას ეუბნება. ჩვეულებრივი delete მხოლოდ ერთ ელემენტს ამუშავებს, undefined behavior-ს იწვევს." },
    },
    {
      id: "free", correct: false,
      label: { en: "Use free(data) instead", ka: "free(data) გამოიყენე" },
      explanation: { en: "free() is a C function for malloc/calloc allocations. Using free() on new[]-allocated memory is undefined behavior.", ka: "free() C ფუნქციაა malloc/calloc-ით გამოყოფილი მეხსიერებისთვის. new[]-ით გამოყოფილ მეხსიერებაზე free()-ის გამოყენება undefined behavior-ია." },
    },
    {
      id: "smart-ptr", correct: false,
      label: { en: "Replace with std::unique_ptr<int[]>", ka: "std::unique_ptr<int[]>-ით ჩანაცვლება" },
      explanation: { en: "unique_ptr is the modern RAII approach and avoids manual delete entirely — but the task is to fix the existing delete expression.", ka: "unique_ptr თანამედროვე RAII მიდგომაა და ხელით delete-ს მთლიანად გამორიცხავს — მაგრამ ამოცანა არსებული delete გამოთქმის გამოსწორებაა." },
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

export const PUZZLE_DEFS_CPP: AnyTextPuzzleDef[] = [
  cpp1, cpp2, cpp3, cpp4, cpp5, cpp6, cpp7, cpp8, cpp9, cpp10,
  cpp11, cpp12, cpp13, cpp14, cpp15,
];
