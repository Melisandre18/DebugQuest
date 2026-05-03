// Java puzzle definitions for DebugQuest.
// 10 puzzles: java-1 through java-10. Mix of fill-blank and pick-fix interactions.

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

// ─── java-1: == vs .equals() for Strings ─────────────────────────────────────

const java1: TextFillBlankDef = {
  id: "java-1",
  difficulty: "easy",
  bugType: "comparison-error",
  programmingLanguage: "java",
  concept: { en: "== compares object references; .equals() compares String content", ka: "== ობიექტის მითითებებს ადარებს; .equals() String-ის შინაარსს ადარებს" },
  title: { en: "The Unreliable Password Check", ka: "სანდო-არარსებული პაროლის შემოწმება" },
  story: { en: "A login check randomly fails even with the correct password because Strings are compared by reference.", ka: "შესვლის შემოწმება ზოგჯერ სწორი პაროლითაც ჩავარდება, რადგან String-ები მითითებით ადარებს." },
  task: { en: "Use the method that compares String values rather than object identity.", ka: "მეთოდი გამოიყენე, რომელიც String-ის მნიშვნელობებს ადარებს, არა ობიექტის იდენტობას." },
  hints: [
    { en: "What does new String(\"abc\") == new String(\"abc\") return?", ka: "new String(\"abc\") == new String(\"abc\") რას აბრუნებს?" },
    { en: "Two String objects with the same content are not necessarily the same object in memory.", ka: "ერთი შინაარსის ორი String ობიექტი მეხსიერებაში სავალდებულოდ ერთი ობიექტი არ არის." },
    { en: "Use .equals() to compare String contents: input.equals(expected).", ka: "String-ის შინაარსის შედარებისთვის .equals() გამოიყენე: input.equals(expected)." },
  ],
  format: "text",
  interaction: "fill-blank",
  codeBefore: `boolean checkPassword(String input, String stored) {
    return input.`,
  codeAfter: `(stored);
}

// checkPassword("secret", new String("secret")) should return true`,
  correctedCode: `public class Main {
    static boolean checkPassword(String input, String stored) {
        return input.equals(stored);
    }

    public static void main(String[] args) {
        String stored = new String("secret");
        System.out.println(checkPassword("secret", stored));        // true
        System.out.println(checkPassword("wrong",  stored));        // false
        System.out.println(checkPassword(new String("secret"), stored)); // true
    }
}`,
  codeBeforeByLang: {
    python: `def check_password(input_pw, stored):\n    return input_pw `,
    javascript: `function checkPassword(input, stored) {\n  return input `,
    cpp: `#include <iostream>\n#include <string>\n\nbool checkPassword(const std::string& input, const std::string& stored) {\n    return input `,
  },
  codeAfterByLang: {
    python: ` stored\n\nstored = "secret"\nprint(check_password("secret", stored))         # should be True\nprint(check_password("wrong",  stored))          # should be False`,
    javascript: ` stored;\n}\n\nconst stored = "secret";\nconsole.log(checkPassword("secret", stored));  // should be true\nconsole.log(checkPassword("wrong",  stored));  // false`,
    cpp: ` stored;\n}\n\nint main() {\n    std::string stored = "secret";\n    std::cout << std::boolalpha << checkPassword("secret", stored) << "\\n"; // true\n    std::cout << checkPassword("wrong",  stored) << "\\n"; // false\n}`,
  },
  correctedCodeByLang: {
    python: `def check_password(input_pw, stored):\n    return input_pw == stored\n\nstored = "secret"\nprint(check_password("secret", stored))          # True\nprint(check_password("wrong",  stored))           # False\nprint(check_password("secret", str(stored)))      # True`,
    javascript: `function checkPassword(input, stored) {\n  return input === stored;\n}\n\nconst stored = "secret";\nconsole.log(checkPassword("secret", stored));  // true\nconsole.log(checkPassword("wrong",  stored));  // false`,
    cpp: `#include <iostream>\n#include <string>\n\nbool checkPassword(const std::string& input, const std::string& stored) {\n    return input == stored;\n}\n\nint main() {\n    std::string stored = "secret";\n    std::cout << std::boolalpha << checkPassword("secret", stored) << "\\n"; // true\n    std::cout << checkPassword("wrong",  stored) << "\\n"; // false\n}`,
  },
  options: [
    {
      id: "a", value: "equals", correct: true,
      explanation: { en: "equals() compares the character sequences — two Strings with the same content return true.", ka: "equals() სიმბოლოების მიმდევრობებს ადარებს — ერთი შინაარსის ორი String true-ს აბრუნებს." },
    },
    {
      id: "b", value: "== stored; //", correct: false,
      explanation: { en: "== tests reference equality — only true if both variables point to the exact same object.", ka: "== მითითების ტოლობას ამოწმებს — true მხოლოდ მაშინ, თუ ორი ცვლადი ერთ ობიექტს მიუთითებს." },
    },
    {
      id: "c", value: "equalsIgnoreCase", correct: false,
      explanation: { en: "equalsIgnoreCase() is case-insensitive — passwords are case-sensitive, so this is too loose.", ka: "equalsIgnoreCase() რეგისტრს უგულებელყოფს — პაროლები რეგისტრ-სენსიტიურია, ამიტომ ეს ზედმეტად ფხვიერია." },
    },
  ],
};

// ─── java-2: Integer autoboxing NullPointerException ──────────────────────────

const java2: TextPickFixDef = {
  id: "java-2",
  difficulty: "easy",
  bugType: "type-error",
  programmingLanguage: "java",
  concept: { en: "Unboxing a null Integer throws NullPointerException; always null-check before unboxing", ka: "null Integer-ის unboxing NullPointerException-ს გამოიძახებს; unboxing-მდე ყოველთვის null-ის შემოწმება გჭირდება" },
  title: { en: "The Null Unboxer", ka: "null-ის ყუთის გამხსნელი" },
  story: { en: "A score retrieval function crashes when a player has no recorded score, because it tries to unbox a null Integer.", ka: "ქულის მოძიების ფუნქცია ჭედება, როდესაც მოთამაშეს ჩაწერილი ქულა არ აქვს, რადგან null Integer-ის unboxing-ს ცდილობს." },
  task: { en: "Return a safe default when the score is null instead of letting it crash.", ka: "null ქულის შემთხვევაში უსაფრთხო default დაბრუნება, ავარიის ნაცვლად." },
  hints: [
    { en: "When does NullPointerException occur here? Trace the call path.", ka: "სად ხდება NullPointerException? გამოძახების გზა გაიარე." },
    { en: "scores.get() returns null for a missing key. Unboxing null to int throws NPE.", ka: "scores.get() გამოტოვებული key-სთვის null-ს აბრუნებს. null-ის int-ად unboxing NPE-ს გამოიძახებს." },
    { en: "Use getOrDefault(player, 0) to return 0 when the player has no score.", ka: "getOrDefault(player, 0) გამოიყენე, რომ 0 დაბრუნდეს, როდესაც მოთამაშეს ქულა არ აქვს." },
  ],
  format: "text",
  interaction: "pick-fix",
  code: `int getScore(Map<String, Integer> scores, String player) {
    return scores.get(player);  // NPE when player not in map
}`,
  bugLine: 2,
  correctedCode: `import java.util.*;

public class Main {
    static int getScore(Map<String, Integer> scores, String player) {
        return scores.getOrDefault(player, 0);
    }

    public static void main(String[] args) {
        Map<String, Integer> scores = new HashMap<>();
        scores.put("Alice", 42);
        System.out.println(getScore(scores, "Alice"));  // 42
        System.out.println(getScore(scores, "Bob"));    // 0
    }
}`,
  codeByLang: {
    python: `def get_score(scores, player):\n    return scores[player]  # KeyError / None crash when player not in dict\n\nscores = {"Alice": 42}\nprint(get_score(scores, "Alice"))  # 42\nprint(get_score(scores, "Bob"))    # KeyError!`,
    javascript: `function getScore(scores, player) {\n  return scores[player].total;  // TypeError: Cannot read properties of undefined\n}\n\nconst scores = { Alice: { total: 42 } };\nconsole.log(getScore(scores, "Alice"));  // 42\nconsole.log(getScore(scores, "Bob"));    // crash!`,
    cpp: `#include <iostream>\n#include <map>\n#include <string>\n\nint getScore(std::map<std::string,int>& scores, const std::string& player) {\n    return scores.at(player);  // std::out_of_range when player not in map\n}\n\nint main() {\n    std::map<std::string,int> scores;\n    scores["Alice"] = 42;\n    std::cout << getScore(scores, "Alice") << "\\n";  // 42\n    std::cout << getScore(scores, "Bob")   << "\\n";  // exception!\n}`,
  },
  bugLineByLang: { python: "2", javascript: "2", cpp: "6" },
  correctedCodeByLang: {
    python: `def get_score(scores, player):\n    return scores.get(player, 0)\n\nscores = {"Alice": 42}\nprint(get_score(scores, "Alice"))  # 42\nprint(get_score(scores, "Bob"))    # 0`,
    javascript: `function getScore(scores, player) {\n  return (scores[player] ?? {total: 0}).total;\n}\n\nconst scores = { Alice: { total: 42 } };\nconsole.log(getScore(scores, "Alice"));  // 42\nconsole.log(getScore(scores, "Bob"));    // 0`,
    cpp: `#include <iostream>\n#include <map>\n#include <string>\n\nint getScore(std::map<std::string,int>& scores, const std::string& player) {\n    auto it = scores.find(player);\n    return it != scores.end() ? it->second : 0;\n}\n\nint main() {\n    std::map<std::string,int> scores;\n    scores["Alice"] = 42;\n    std::cout << getScore(scores, "Alice") << "\\n";  // 42\n    std::cout << getScore(scores, "Bob")   << "\\n";  // 0\n}`,
  },
  fixes: [
    {
      id: "getOrDefault", correct: true,
      label: { en: "scores.getOrDefault(player, 0)", ka: "scores.getOrDefault(player, 0)" },
      explanation: { en: "getOrDefault returns the value if present, or the default (0) if the key is absent — no NPE.", ka: "getOrDefault მნიშვნელობას აბრუნებს, თუ არსებობს, ან default-ს (0), თუ key არ არის — NPE არ იქნება." },
    },
    {
      id: "null-check", correct: false,
      label: { en: "Integer s = scores.get(player); return s != null ? s : 0;", ka: "Integer s = scores.get(player); return s != null ? s : 0;" },
      explanation: { en: "Correct and explicit, but getOrDefault is the idiomatic one-liner for this pattern.", ka: "სწორი და ცხადია, მაგრამ getOrDefault ამ შაბლონის სტანდარტული ერთსტრიქონიანია." },
    },
    {
      id: "try-catch", correct: false,
      label: { en: "Wrap in try-catch NullPointerException", ka: "try-catch NullPointerException-ში გახვიე" },
      explanation: { en: "Catching NPE to handle expected null is an anti-pattern — use null-safe APIs instead.", ka: "NPE-ს დაჭერა მოსალოდნელი null-ის სამართავად ანტი-შაბლონია — null-safe API-ები გამოიყენე." },
    },
  ],
};

// ─── java-3: Array index out of bounds ───────────────────────────────────────

const java3: TextFillBlankDef = {
  id: "java-3",
  difficulty: "easy",
  bugType: "off-by-one",
  programmingLanguage: "java",
  concept: { en: "Java array length is arr.length; valid indices are 0 to arr.length-1", ka: "Java მასივის სიგრძე arr.length-ია; სწორი ინდექსები 0-დან arr.length-1-მდე" },
  title: { en: "One Step Too Far", ka: "ერთი ნაბიჯით ზედმეტი" },
  story: { en: "A loop that prints all elements of an array throws ArrayIndexOutOfBoundsException on the last step.", ka: "მასივის ყველა ელემენტის დამბეჭდი მარყუჟი ბოლო ნაბიჯზე ArrayIndexOutOfBoundsException-ს გამოიძახებს." },
  task: { en: "Fix the loop bound so it stops at the last valid index.", ka: "მარყუჟის ზღვარი გაასწორე, რომ ბოლო სწორ ინდექსზე ჩერდებოდეს." },
  hints: [
    { en: "An array of length 5 has indices 0, 1, 2, 3, 4. What is the last index?", ka: "სიგრძის 5 მასივს 0, 1, 2, 3, 4 ინდექსები აქვს. რა არის ბოლო ინდექსი?" },
    { en: "arr.length gives 5 for a 5-element array. arr[5] throws AIOBE.", ka: "arr.length 5-ელემენტიანი მასივისთვის 5-ს გვაძლევს. arr[5] AIOBE-ს გამოიძახებს." },
    { en: "Use i < arr.length (strict less-than) as the loop condition.", ka: "i < arr.length (მკაცრი less-than) მარყუჟის პირობად გამოიყენე." },
  ],
  format: "text",
  interaction: "fill-blank",
  codeBefore: `void printAll(int[] arr) {
    for (int i = 0; i `,
  codeAfter: ` arr.length; i++) {
        System.out.println(arr[i]);
    }
}`,
  correctedCode: `public class Main {
    static void printAll(int[] arr) {
        for (int i = 0; i < arr.length; i++) {
            System.out.println(arr[i]);
        }
    }

    public static void main(String[] args) {
        int[] nums = {10, 20, 30, 40, 50};
        printAll(nums);  // 10 20 30 40 50
    }
}`,
  codeBeforeByLang: {
    python: `def print_all(arr):\n    for i in range(0, len(arr)`,
    javascript: `function printAll(arr) {\n  for (let i = 0; i `,
    cpp: `#include <iostream>\n#include <vector>\n\nvoid printAll(const std::vector<int>& arr) {\n    for (int i = 0; i `,
  },
  codeAfterByLang: {
    python: ` + 1):\n        print(arr[i])\n\nprint_all([10, 20, 30, 40, 50])  # IndexError on last step`,
    javascript: ` arr.length; i++) {\n    console.log(arr[i]);\n  }\n}\n\nprintAll([10,20,30,40,50]);`,
    cpp: ` arr.size(); i++) {\n        std::cout << arr[i] << "\\n";\n    }\n}\n\nint main() {\n    printAll({10,20,30,40,50});\n}`,
  },
  correctedCodeByLang: {
    python: `def print_all(arr):\n    for i in range(len(arr)):\n        print(arr[i])\n\nprint_all([10, 20, 30, 40, 50])  # 10 20 30 40 50`,
    javascript: `function printAll(arr) {\n  for (let i = 0; i < arr.length; i++) {\n    console.log(arr[i]);\n  }\n}\n\nprintAll([10,20,30,40,50]);`,
    cpp: `#include <iostream>\n#include <vector>\n\nvoid printAll(const std::vector<int>& arr) {\n    for (int i = 0; i < (int)arr.size(); i++) {\n        std::cout << arr[i] << "\\n";\n    }\n}\n\nint main() {\n    printAll({10,20,30,40,50});\n}`,
  },
  options: [
    {
      id: "a", value: "<", correct: true,
      explanation: { en: "i < arr.length stops at index arr.length-1, the last valid position.", ka: "i < arr.length arr.length-1 ინდექსზე ჩერდება, ეს ბოლო სწორი პოზიციაა." },
    },
    {
      id: "b", value: "<=", correct: false,
      explanation: { en: "i <= arr.length tries to access arr[arr.length] which is out of bounds.", ka: "i <= arr.length arr[arr.length]-ის წვდომას ცდილობს, რაც ზღვარს გარეთაა." },
    },
    {
      id: "c", value: "< arr.length - 1 &&  i", correct: false,
      explanation: { en: "This skips the last element and adds no benefit — off-by-one in the wrong direction.", ka: "ეს ბოლო ელემენტს გამოტოვებს — off-by-one არასწორი მიმართულებით." },
    },
  ],
};

// ─── java-4: int overflow in multiplication ───────────────────────────────────

const java4: TextPickFixDef = {
  id: "java-4",
  difficulty: "medium",
  bugType: "type-error",
  programmingLanguage: "java",
  concept: { en: "int arithmetic overflows silently in Java; use long literals or cast to long before multiplication", ka: "Java-ში int-ის არითმეტიკა ჩუმად ივსება; long ლიტერალები ან long-ად გარდაქმნა გამრავლებამდე" },
  title: { en: "The Overflowing Factory", ka: "გადახურული ქარხანა" },
  story: { en: "A factory calculates daily revenue but the result wraps to a negative number because of int overflow.", ka: "ქარხანა დღის შემოსავალს ითვლის, მაგრამ შედეგი int-ის გადავსებით უარყოფითი ხდება." },
  task: { en: "Ensure the multiplication is done in 64-bit arithmetic.", ka: "გამრავლება 64-ბიტიანი არითმეტიკით გამოვახდინოთ." },
  hints: [
    { en: "What is Integer.MAX_VALUE? Can 50000 * 100000 fit in an int?", ka: "Integer.MAX_VALUE რა არის? 50000 * 100000 int-ში ეტევა?" },
    { en: "Both 50000 and 100000 are int literals. Java multiplies as int, then assigns — overflow happens before assignment.", ka: "50000 და 100000 int ლიტერალებია. Java int-ად ამრავლებს, შემდეგ ანიჭებს — გადავსება მინიჭებამდე ხდება." },
    { en: "Use 50000L or cast one operand: (long)units * pricePerUnit.", ka: "50000L გამოიყენე ან ერთი ოპერანდი გარდაქმენი: (long)units * pricePerUnit." },
  ],
  format: "text",
  interaction: "pick-fix",
  code: `long dailyRevenue(int units, int pricePerUnit) {
    return units * pricePerUnit;  // int * int overflows before widening to long
}

System.out.println(dailyRevenue(50000, 100000)); // expected: 5000000000, got: -1794967296`,
  bugLine: 2,
  correctedCode: `public class Main {
    static long dailyRevenue(int units, int pricePerUnit) {
        return (long)units * pricePerUnit;
    }

    public static void main(String[] args) {
        System.out.println(dailyRevenue(50000, 100000));  // 5000000000
    }
}`,
  codeByLang: {
    python: `def daily_revenue(units, price_per_unit):\n    # Python ints don't overflow — show integer division truncation bug instead\n    return units * price_per_unit // 1  # force int — but what if divided too early?\n\n# Equivalent truncation bug: dividing before multiplying\ndef daily_revenue_bug(units, price_per_unit):\n    return (units // 100) * price_per_unit * 100  # loses remainder\n\nprint(daily_revenue_bug(50001, 100000))  # 5000000000, not 5000100000`,
    javascript: `function dailyRevenue(units, pricePerUnit) {\n    // JavaScript: Number.MAX_SAFE_INTEGER = 2^53-1; large ints lose precision\n    return units * pricePerUnit;  // loses precision past 2^53\n}\n\n// Safe approach needed for very large numbers\nconsole.log(dailyRevenue(50000, 100000));          // 5000000000 (ok here)\nconsole.log(dailyRevenue(100000000, 100000000));   // imprecise!`,
    cpp: `#include <iostream>\n\nlong dailyRevenue(int units, int pricePerUnit) {\n    return units * pricePerUnit;  // int * int overflows before widening to long\n}\n\nint main() {\n    std::cout << dailyRevenue(50000, 100000) << "\\n"; // expected 5000000000, got overflow\n}`,
  },
  bugLineByLang: { javascript: "3", cpp: "4" },
  correctedCodeByLang: {
    python: `def daily_revenue(units, price_per_unit):\n    return units * price_per_unit  # Python ints are arbitrary precision, no overflow\n\nprint(daily_revenue(50000, 100000))  # 5000000000`,
    javascript: `function dailyRevenue(units, pricePerUnit) {\n    return BigInt(units) * BigInt(pricePerUnit);\n}\n\nconsole.log(dailyRevenue(50000, 100000).toString());  // "5000000000"`,
    cpp: `#include <iostream>\n\nlong long dailyRevenue(int units, int pricePerUnit) {\n    return (long long)units * pricePerUnit;\n}\n\nint main() {\n    std::cout << dailyRevenue(50000, 100000) << "\\n"; // 5000000000\n}`,
  },
  fixes: [
    {
      id: "long-cast", correct: true,
      label: { en: "return (long)units * pricePerUnit;", ka: "return (long)units * pricePerUnit;" },
      explanation: { en: "Casting units to long promotes the multiplication to 64-bit arithmetic before overflow can occur.", ka: "units-ის long-ად გარდაქმნა გამრავლებას 64-ბიტიანზე გადადის, გადავსებამდე." },
    },
    {
      id: "long-literal", correct: false,
      label: { en: "return units * 1L * pricePerUnit;", ka: "return units * 1L * pricePerUnit;" },
      explanation: { en: "Multiplying by 1L also works (widens to long), but casting the operand directly is clearer.", ka: "1L-ზე გამრავლება ასევე მუშაობს (long-ზე გაფართოება), მაგრამ ოპერანდის პირდაპირ გარდაქმნა გასაგებია." },
    },
    {
      id: "biginteger", correct: false,
      label: { en: "Use BigInteger for the calculation", ka: "გამოთვლისთვის BigInteger გამოიყენე" },
      explanation: { en: "BigInteger handles arbitrary precision but is overkill — long covers this range easily.", ka: "BigInteger თვითნებური სიზუსტის მხარდამჭერია, მაგრამ ზედმეტია — long ამ დიაპაზონს ადვილად ფარავს." },
    },
  ],
};

// ─── java-5: String concatenation in loop ─────────────────────────────────────

const java5: TextPickFixDef = {
  id: "java-5",
  difficulty: "medium",
  bugType: "wrong-operator",
  programmingLanguage: "java",
  concept: { en: "Concatenating Strings in a loop with += creates O(n²) copies; use StringBuilder for O(n) performance", ka: "მარყუჟში += String-ების შეერთება O(n²) ასლს ქმნის; O(n) შესრულებისთვის StringBuilder გამოიყენე" },
  title: { en: "The Slow Builder", ka: "ნელი მშენებელი" },
  story: { en: "A CSV builder that joins thousands of rows is extremely slow because each iteration creates a new String object.", ka: "CSV მშენებელი, რომელიც ათასობით მწკრივს აერთებს, ძალიან ნელია, რადგან ყოველ იტერაციაზე ახალ String ობიექტს ქმნის." },
  task: { en: "Refactor to use StringBuilder so the loop runs efficiently.", ka: "StringBuilder-ის გამოსაყენებლად გადაწერე, რომ მარყუჟი ეფექტიანად მუშაობდეს." },
  hints: [
    { en: "Each += on a String allocates a brand-new String object. n concatenations = n(n+1)/2 characters copied.", ka: "String-ზე ყოველი += ახალ String ობიექტს გამოყოფს. n შეერთება = n(n+1)/2 კოპირებული სიმბოლო." },
    { en: "StringBuilder.append() adds to the same buffer in O(1) amortized.", ka: "StringBuilder.append() ამორტიზებული O(1)-ით ერთ ბუფერს ამატებს." },
    { en: "Declare StringBuilder sb = new StringBuilder(); then sb.append(row); and return sb.toString();", ka: "StringBuilder sb = new StringBuilder(); გამოაცხადე, შემდეგ sb.append(row); და return sb.toString();" },
  ],
  format: "text",
  interaction: "pick-fix",
  code: `String buildCsv(List<String> rows) {
    String result = "";
    for (String row : rows) {
        result += row + "\\n";  // O(n²) string copies
    }
    return result;
}`,
  bugLine: 4,
  correctedCode: `import java.util.*;

public class Main {
    static String buildCsv(List<String> rows) {
        StringBuilder sb = new StringBuilder();
        for (String row : rows) {
            sb.append(row).append("\\n");
        }
        return sb.toString();
    }

    public static void main(String[] args) {
        List<String> rows = Arrays.asList("a,1", "b,2", "c,3");
        System.out.print(buildCsv(rows));
    }
}`,
  codeByLang: {
    python: `def build_csv(rows):\n    result = ""\n    for row in rows:\n        result += row + "\\n"  # O(n²) string copies\n    return result\n\nrows = ["a,1", "b,2", "c,3"]\nprint(build_csv(rows))`,
    javascript: `function buildCsv(rows) {\n    let result = "";\n    for (const row of rows) {\n        result += row + "\\n";  // O(n²) string copies\n    }\n    return result;\n}\n\nconsole.log(buildCsv(["a,1", "b,2", "c,3"]));`,
    cpp: `#include <iostream>\n#include <vector>\n#include <string>\n\nstd::string buildCsv(const std::vector<std::string>& rows) {\n    std::string result;\n    for (const auto& row : rows) {\n        result += row + "\\n";  // repeated reallocation — O(n²)\n    }\n    return result;\n}\n\nint main() {\n    std::cout << buildCsv({"a,1","b,2","c,3"});\n}`,
  },
  bugLineByLang: { python: "3", javascript: "4", cpp: "8" },
  correctedCodeByLang: {
    python: `def build_csv(rows):\n    return "\\n".join(rows) + "\\n"\n\nprint(build_csv(["a,1", "b,2", "c,3"]))`,
    javascript: `function buildCsv(rows) {\n    return rows.join("\\n") + "\\n";\n}\n\nconsole.log(buildCsv(["a,1", "b,2", "c,3"]));`,
    cpp: `#include <iostream>\n#include <vector>\n#include <string>\n#include <sstream>\n\nstd::string buildCsv(const std::vector<std::string>& rows) {\n    std::ostringstream oss;\n    for (const auto& row : rows) {\n        oss << row << "\\n";\n    }\n    return oss.str();\n}\n\nint main() {\n    std::cout << buildCsv({"a,1","b,2","c,3"});\n}`,
  },
  fixes: [
    {
      id: "stringbuilder", correct: true,
      label: { en: "Use StringBuilder: sb.append(row).append('\\n')", ka: "StringBuilder: sb.append(row).append('\\n')" },
      explanation: { en: "StringBuilder mutates a single internal buffer, reducing n copies to 1 final toString() call.", ka: "StringBuilder ერთ შიდა ბუფერს ცვლის, n ასლს ამცირებს toString()-ის ერთ გამოძახებამდე." },
    },
    {
      id: "string-join", correct: false,
      label: { en: "Use String.join(\"\\n\", rows)", ka: "String.join(\"\\n\", rows)" },
      explanation: { en: "String.join is idiomatic and efficient, but changes the output (no trailing newline). The task targets StringBuilder.", ka: "String.join სტანდარტული და ეფექტიანია, მაგრამ გამოსავალს ცვლის (trailing newline არ). ამოცანა StringBuilder-ზეა." },
    },
    {
      id: "plus-equals-sb", correct: false,
      label: { en: "result = result.concat(row + \"\\n\")", ka: "result = result.concat(row + \"\\n\")" },
      explanation: { en: "concat() still allocates a new String each time — same O(n²) problem.", ka: "concat()-ი ყოველ ჯერზე ახალ String-ს გამოყოფს — იგივე O(n²) პრობლემა." },
    },
  ],
};

// ─── java-6: Static field shared across instances ─────────────────────────────

const java6: TextPickFixDef = {
  id: "java-6",
  difficulty: "medium",
  bugType: "scope-error",
  programmingLanguage: "java",
  concept: { en: "static fields belong to the class, not instances; all objects share the same static field", ka: "static ველები კლასს ეკუთვნის, არა ინსტანციებს; ყველა ობიექტი ერთ static ველს იზიარებს" },
  title: { en: "The Shared Score", ka: "გაზიარებული ქულა" },
  story: { en: "Two Player objects seem to share the same score counter because the field was accidentally declared static.", ka: "ორი Player ობიექტი თითქოს ერთ ქულის მთვლელს იზიარებს, რადგან ველი შემთხვევით static-ად გამოცხადდა." },
  task: { en: "Make the score field belong to each Player instance, not the class.", ka: "score ველი კლასს კი არ, არამედ ყოველ Player ინსტანციას ეკუთვნოდეს." },
  hints: [
    { en: "Create two Player objects and increment one's score. Does the other's score change?", ka: "ორი Player ობიექტი შექმენი და ერთის ქულა გაზარდე. მეორის ქულა იცვლება?" },
    { en: "A static field has one copy per class, not per object.", ka: "static ველს კლასზე ერთი ასლი აქვს, არა ობიექტზე." },
    { en: "Remove the static keyword so score becomes an instance field.", ka: "static საკვანძო სიტყვა ამოიღე, რომ score ინსტანციის ველი გახდეს." },
  ],
  format: "text",
  interaction: "pick-fix",
  code: `class Player {
    static int score = 0;  // shared across ALL Player objects!
    String name;

    Player(String n) { name = n; }
    void addPoints(int p) { score += p; }
    int getScore() { return score; }
}`,
  bugLine: 2,
  correctedCode: `public class Main {
    static class Player {
        int score = 0;
        String name;

        Player(String n) { name = n; }
        void addPoints(int p) { score += p; }
        int getScore() { return score; }
    }

    public static void main(String[] args) {
        Player alice = new Player("Alice");
        Player bob   = new Player("Bob");
        alice.addPoints(10);
        bob.addPoints(5);
        System.out.println(alice.getScore());  // 10
        System.out.println(bob.getScore());    // 5
    }
}`,
  codeByLang: {
    python: `class Player:\n    score = 0  # class variable — shared across ALL instances!\n    def __init__(self, name):\n        self.name = name\n    def add_points(self, p):\n        Player.score += p\n\nalice = Player("Alice")\nbob   = Player("Bob")\nalice.add_points(10)\nprint(alice.score)  # 10\nprint(bob.score)    # also 10 — bug!`,
    javascript: `function Player(name) {\n    this.name = name;\n}\nPlayer.prototype.score = 0;  // shared on the prototype — all instances see the same!\n\nconst alice = new Player("Alice");\nconst bob   = new Player("Bob");\nalice.score += 10;\nconsole.log(alice.score);  // 10 (own property created)\nconsole.log(bob.score);    // 0  (reads prototype — looks ok, but it's shared until written)`,
    cpp: `#include <iostream>\n#include <string>\n\nclass Player {\npublic:\n    static int score;  // shared across ALL Player objects!\n    std::string name;\n    Player(std::string n) : name(n) {}\n    void addPoints(int p) { score += p; }\n    int getScore() { return score; }\n};\nint Player::score = 0;\n\nint main() {\n    Player alice("Alice"), bob("Bob");\n    alice.addPoints(10);\n    std::cout << alice.getScore() << "\\n";  // 10\n    std::cout << bob.getScore()   << "\\n";  // also 10 — bug!\n}`,
  },
  bugLineByLang: { python: "2", javascript: "4", cpp: "6" },
  correctedCodeByLang: {
    python: `class Player:\n    def __init__(self, name):\n        self.name = name\n        self.score = 0  # instance variable — each player has its own\n    def add_points(self, p):\n        self.score += p\n\nalice = Player("Alice")\nbob   = Player("Bob")\nalice.add_points(10)\nbob.add_points(5)\nprint(alice.score)  # 10\nprint(bob.score)    # 5`,
    javascript: `function Player(name) {\n    this.name  = name;\n    this.score = 0;  // instance property — each Player gets its own\n}\n\nconst alice = new Player("Alice");\nconst bob   = new Player("Bob");\nalice.score += 10;\nbob.score  += 5;\nconsole.log(alice.score);  // 10\nconsole.log(bob.score);    // 5`,
    cpp: `#include <iostream>\n#include <string>\n\nclass Player {\npublic:\n    int score = 0;  // instance field\n    std::string name;\n    Player(std::string n) : name(n) {}\n    void addPoints(int p) { score += p; }\n    int getScore() { return score; }\n};\n\nint main() {\n    Player alice("Alice"), bob("Bob");\n    alice.addPoints(10);\n    bob.addPoints(5);\n    std::cout << alice.getScore() << "\\n";  // 10\n    std::cout << bob.getScore()   << "\\n";  // 5\n}`,
  },
  fixes: [
    {
      id: "remove-static", correct: true,
      label: { en: "Remove static: int score = 0;", ka: "static ამოიღე: int score = 0;" },
      explanation: { en: "Without static, each Player instance gets its own score field initialized to 0.", ka: "static-ის გარეშე ყოველ Player ინსტანციას საკუთარი score ველი ეყენება 0-ზე ინიციალიზებული." },
    },
    {
      id: "instance-init", correct: false,
      label: { en: "Initialize in the constructor: this.score = 0;", ka: "კონსტრუქტორში ინიციალიზება: this.score = 0;" },
      explanation: { en: "Adding this.score = 0 to the constructor resets the static field each time — still one shared counter, now reset on every new Player.", ka: "კონსტრუქტორში this.score = 0 დამატება static ველს ყოველ ჯერზე ახლებს — ისევ ერთი გაზიარებული მთვლელი, ყოველ ახალ Player-ზე განულებული." },
    },
    {
      id: "final", correct: false,
      label: { en: "Add final: static final int score = 0;", ka: "final დაამატე: static final int score = 0;" },
      explanation: { en: "final makes the field a constant — score can't be changed at all, which breaks addPoints.", ka: "final ველს კონსტანტად ხდის — score საერთოდ ვერ შეიცვლება, რაც addPoints-ს ანგრევს." },
    },
  ],
};

// ─── java-7: Catching Exception hides bugs ───────────────────────────────────

const java7: TextPickFixDef = {
  id: "java-7",
  difficulty: "medium",
  bugType: "wrong-condition",
  programmingLanguage: "java",
  concept: { en: "Catching the root Exception class swallows all errors silently; catch specific exceptions instead", ka: "root Exception კლასის დაჭერა ყველა შეცდომას ჩუმად ყლაპავს; კონკრეტული exceptions დაიჭირე" },
  title: { en: "The Silent Failure", ka: "ჩუმი წარუმატებლობა" },
  story: { en: "A file reader catches all exceptions and returns null, making it impossible to know whether the file was missing or the format was corrupt.", ka: "ფაილის წამკითხველი ყველა exception-ს იჭერს და null-ს აბრუნებს, ვერ ვიგებთ ფაილი არ არსებობდა თუ ფორმატი გაფუჭებული." },
  task: { en: "Catch only the specific IO exception and let other unexpected errors propagate.", ka: "მხოლოდ კონკრეტული IO exception დაიჭირე და სხვა მოულოდნელ შეცდომებს გავრცელება დაუშვი." },
  hints: [
    { en: "What types of exception can readAllBytes() throw?", ka: "readAllBytes() რა ტიპის exception-ებს შეიძლება გამოიძახოს?" },
    { en: "Catching Exception also catches RuntimeException, NullPointerException, etc. — bugs hide.", ka: "Exception-ის დაჭერა RuntimeException-ს, NullPointerException-ს და სხვა ბაგ-exception-ებს იჭერს — ბაგები იმალება." },
    { en: "Catch IOException specifically so only expected IO failures are handled.", ka: "IOException კონკრეტულად დაიჭირე, რომ მხოლოდ მოსალოდნელი IO წარუმატებლობები დამუშავდეს." },
  ],
  format: "text",
  interaction: "pick-fix",
  code: `byte[] readFile(String path) {
    try {
        return Files.readAllBytes(Paths.get(path));
    } catch (Exception e) {  // too broad!
        return null;
    }
}`,
  bugLine: 4,
  correctedCode: `import java.io.*;
import java.nio.file.*;

public class Main {
    static byte[] readFile(String path) {
        try {
            return Files.readAllBytes(Paths.get(path));
        } catch (IOException e) {
            System.err.println("IO error: " + e.getMessage());
            return null;
        }
    }

    public static void main(String[] args) {
        byte[] data = readFile("example.txt");
        if (data != null) System.out.println("Read " + data.length + " bytes");
        else System.out.println("File not found or unreadable");
    }
}`,
  codeByLang: {
    python: `def read_file(path):\n    try:\n        with open(path, "rb") as f:\n            return f.read()\n    except Exception:  # too broad — hides bugs!\n        return None\n\ndata = read_file("example.txt")\nif data is None:\n    print("failed, but we don't know why")`,
    javascript: `async function readFile(path) {\n    try {\n        const data = await fs.promises.readFile(path);\n        return data;\n    } catch (e) {  // catches everything — programming errors hidden too!\n        return null;\n    }\n}`,
    cpp: `#include <iostream>\n#include <fstream>\n#include <vector>\n\nstd::vector<char> readFile(const std::string& path) {\n    try {\n        std::ifstream f(path, std::ios::binary);\n        return std::vector<char>((std::istreambuf_iterator<char>(f)),\n                                  std::istreambuf_iterator<char>());\n    } catch (...) {  // catches everything — too broad!\n        return {};\n    }\n}\n\nint main() {\n    auto data = readFile("example.txt");\n    std::cout << data.size() << " bytes\\n";\n}`,
  },
  bugLineByLang: { python: "5", javascript: "5", cpp: "11" },
  correctedCodeByLang: {
    python: `import os\n\ndef read_file(path):\n    try:\n        with open(path, "rb") as f:\n            return f.read()\n    except (FileNotFoundError, PermissionError, OSError) as e:\n        print(f"IO error: {e}")\n        return None\n\ndata = read_file("example.txt")\nif data is not None:\n    print(f"Read {len(data)} bytes")\nelse:\n    print("File not found or unreadable")`,
    javascript: `const fs = require("fs");\n\nasync function readFile(path) {\n    try {\n        return await fs.promises.readFile(path);\n    } catch (e) {\n        if (e.code === "ENOENT" || e.code === "EACCES") {\n            console.error("IO error:", e.message);\n            return null;\n        }\n        throw e;  // re-throw unexpected errors\n    }\n}\n\nreadFile("example.txt").then(d => d ? console.log("Read", d.length, "bytes") : console.log("File not found"));`,
    cpp: `#include <iostream>\n#include <fstream>\n#include <vector>\n#include <stdexcept>\n\nstd::vector<char> readFile(const std::string& path) {\n    std::ifstream f(path, std::ios::binary);\n    if (!f) {\n        std::cerr << "IO error: cannot open " << path << "\\n";\n        return {};\n    }\n    return std::vector<char>((std::istreambuf_iterator<char>(f)),\n                              std::istreambuf_iterator<char>());\n}\n\nint main() {\n    auto data = readFile("example.txt");\n    if (!data.empty()) std::cout << "Read " << data.size() << " bytes\\n";\n    else std::cout << "File not found or unreadable\\n";\n}`,
  },
  fixes: [
    {
      id: "ioexception", correct: true,
      label: { en: "catch (IOException e) instead", ka: "catch (IOException e) ნაცვლად" },
      explanation: { en: "IOException covers file-not-found and read errors. Other unexpected exceptions (like NPE) will now propagate and be visible.", ka: "IOException ფაილ-არარსებობასა და წაკითხვის შეცდომებს ფარავს. სხვა მოულოდნელი exceptions (NPE) ახლა გავრცელდება და ჩანს." },
    },
    {
      id: "multi-catch", correct: false,
      label: { en: "catch (IOException | RuntimeException e)", ka: "catch (IOException | RuntimeException e)" },
      explanation: { en: "Adding RuntimeException to the catch defeats the purpose — you're back to swallowing unexpected bugs.", ka: "RuntimeException-ის catch-ში დამატება დანიშნულებას გაუქმებს — კვლავ მოულოდნელ ბაგებს ყლაპავ." },
    },
    {
      id: "rethrow", correct: false,
      label: { en: "Catch Exception but rethrow: throw new RuntimeException(e);", ka: "Exception დაიჭირე, მაგრამ ხელახლა გადასროლე: throw new RuntimeException(e);" },
      explanation: { en: "Rethrowing is better than returning null, but wrapping in RuntimeException loses the original type information.", ka: "Rethrow null-ის დაბრუნებაზე უკეთესია, მაგრამ RuntimeException-ში გახვევა ორიგინალური ტიპის ინფორმაციას კარგავს." },
    },
  ],
};

// ─── java-8: Incorrect equals / hashCode contract ────────────────────────────

const java8: TextPickFixDef = {
  id: "java-8",
  difficulty: "hard",
  bugType: "comparison-error",
  programmingLanguage: "java",
  concept: { en: "Objects used as HashMap keys must override both equals() and hashCode(); violating the contract breaks lookups", ka: "HashMap გასაღებად გამოყენებული ობიექტები equals()-სა და hashCode()-ს ერთდროულად უნდა override-ებდნენ; კონტრაქტის დარღვევა ძიებას ანგრევს" },
  title: { en: "The Invisible Key", ka: "უხილავი გასაღები" },
  story: { en: "A Point class overrides equals() but not hashCode(), so HashMap can never find Points that were stored under equal-value keys.", ka: "Point კლასი equals()-ს override-ებს, მაგრამ hashCode()-ს არ, ამიტომ HashMap ვერ პოულობს ტოლი-მნიშვნელობიანი გასაღებებით შენახულ Point-ებს." },
  task: { en: "Add the missing hashCode() implementation consistent with equals().", ka: "დაამატე გამოტოვებული hashCode() განხორციელება, რომელიც equals()-თან თანმიმდევრულია." },
  hints: [
    { en: "What does the HashMap contract require about equals() and hashCode()?", ka: "HashMap-ის კონტრაქტი equals()-სა და hashCode()-ის შესახებ რას მოითხოვს?" },
    { en: "If a.equals(b) is true, then a.hashCode() must equal b.hashCode().", ka: "თუ a.equals(b) true-ია, მაშინ a.hashCode() b.hashCode()-ის ტოლი უნდა იყოს." },
    { en: "Use Objects.hash(x, y) to generate a consistent hash from the same fields used in equals.", ka: "Objects.hash(x, y) გამოიყენე equals-ში გამოყენებული იმავე ველებიდან თანმიმდევრული ჰეშის გენერაციისთვის." },
  ],
  format: "text",
  interaction: "pick-fix",
  code: `class Point {
    int x, y;
    Point(int x, int y) { this.x = x; this.y = y; }

    @Override
    public boolean equals(Object o) {
        if (!(o instanceof Point)) return false;
        Point p = (Point) o;
        return x == p.x && y == p.y;
    }
    // hashCode() not overridden — HashMap lookups fail!
}`,
  bugLine: 11,
  correctedCode: `import java.util.*;

public class Main {
    static class Point {
        int x, y;
        Point(int x, int y) { this.x = x; this.y = y; }

        @Override
        public boolean equals(Object o) {
            if (!(o instanceof Point)) return false;
            Point p = (Point) o;
            return x == p.x && y == p.y;
        }

        @Override
        public int hashCode() { return Objects.hash(x, y); }
    }

    public static void main(String[] args) {
        Map<Point, String> map = new HashMap<>();
        map.put(new Point(1, 2), "origin");
        System.out.println(map.get(new Point(1, 2)));  // origin
    }
}`,
  codeByLang: {
    python: `class Point:\n    def __init__(self, x, y):\n        self.x = x\n        self.y = y\n    def __eq__(self, other):\n        return isinstance(other, Point) and self.x == other.x and self.y == other.y\n    # __hash__ not defined — Python sets it to None when __eq__ is defined!\n\nd = {}\nd[Point(1, 2)] = "origin"\nprint(d.get(Point(1, 2)))  # None — lookup fails!`,
    javascript: `// JavaScript objects use reference equality for Map keys by default\n// Two different objects with same values are different keys\nconst map = new Map();\nconst key1 = { x: 1, y: 2 };\nmap.set(key1, "origin");\nconst key2 = { x: 1, y: 2 };  // same values, different reference\nconsole.log(map.get(key2));  // undefined — lookup fails!`,
    cpp: `#include <iostream>\n#include <unordered_map>\n\nstruct Point {\n    int x, y;\n    bool operator==(const Point& o) const { return x == o.x && y == o.y; }\n    // hash not defined — unordered_map can't use Point as key!\n};\n\nint main() {\n    // std::unordered_map<Point, std::string> map;  // compile error: no hash!\n    std::cout << "Needs a hash specialization to compile\\n";\n}`,
  },
  bugLineByLang: { python: "7", javascript: "4", cpp: "7" },
  correctedCodeByLang: {
    python: `class Point:\n    def __init__(self, x, y):\n        self.x = x\n        self.y = y\n    def __eq__(self, other):\n        return isinstance(other, Point) and self.x == other.x and self.y == other.y\n    def __hash__(self):\n        return hash((self.x, self.y))  # consistent with __eq__\n\nd = {}\nd[Point(1, 2)] = "origin"\nprint(d.get(Point(1, 2)))  # origin`,
    javascript: `// JavaScript: use a string key derived from the object's values\nconst map = new Map();\nconst toKey = ({x, y}) => \`\${x},\${y}\`;\n\nmap.set(toKey({ x: 1, y: 2 }), "origin");\nconsole.log(map.get(toKey({ x: 1, y: 2 })));  // origin`,
    cpp: `#include <iostream>\n#include <unordered_map>\n\nstruct Point {\n    int x, y;\n    bool operator==(const Point& o) const { return x == o.x && y == o.y; }\n};\n\nstruct PointHash {\n    std::size_t operator()(const Point& p) const {\n        return std::hash<int>()(p.x) ^ (std::hash<int>()(p.y) << 16);\n    }\n};\n\nint main() {\n    std::unordered_map<Point, std::string, PointHash> map;\n    map[{1, 2}] = "origin";\n    std::cout << map[{1, 2}] << "\\n";  // origin\n}`,
  },
  fixes: [
    {
      id: "objects-hash", correct: true,
      label: { en: "@Override public int hashCode() { return Objects.hash(x, y); }", ka: "@Override public int hashCode() { return Objects.hash(x, y); }" },
      explanation: { en: "Objects.hash(x, y) produces a consistent hash based on x and y — matching the equals() logic.", ka: "Objects.hash(x, y) x-სა და y-ზე დაფუძნებულ თანმიმდევრულ ჰეშს გვაძლევს — equals()-ის ლოგიკის შესაბამისი." },
    },
    {
      id: "return-x", correct: false,
      label: { en: "@Override public int hashCode() { return x; }", ka: "@Override public int hashCode() { return x; }" },
      explanation: { en: "Using only x satisfies the contract but creates many collisions — points with the same x always share a bucket.", ka: "მხოლოდ x-ის გამოყენება კონტრაქტს აკმაყოფილებს, მაგრამ ბევრ კოლიზიას ქმნის — ერთი x-ის Point-ები ერთ bucket-ს ყოველთვის იზიარებს." },
    },
    {
      id: "remove-equals", correct: false,
      label: { en: "Remove the equals() override instead", ka: "equals() override ამოიღე" },
      explanation: { en: "Removing equals() restores the contract (default equals and hashCode are consistent) but loses the value-based equality behavior.", ka: "equals()-ის ამოღება კონტრაქტს აღადგენს (ნაგულისხმევი equals და hashCode თანმიმდევრულია), მაგრამ მნიშვნელობაზე დაფუძნებული ტოლობის ქცევას კარგავ." },
    },
  ],
};

// ─── java-9: Modifying list while iterating ───────────────────────────────────

const java9: TextPickFixDef = {
  id: "java-9",
  difficulty: "hard",
  bugType: "mutation-error",
  programmingLanguage: "java",
  concept: { en: "Removing elements from an ArrayList while iterating throws ConcurrentModificationException; use Iterator.remove() or removeIf()", ka: "ArrayList-იდან ელემენტების წაშლა იტერაციის დროს ConcurrentModificationException-ს გამოიძახებს; Iterator.remove() ან removeIf() გამოიყენე" },
  title: { en: "The Unstable List", ka: "არასტაბილური სია" },
  story: { en: "A filter that removes negative numbers from a list crashes with ConcurrentModificationException mid-iteration.", ka: "უარყოფითი რიცხვების გამფილტრავი სია ConcurrentModificationException-ით ჭედება იტერაციის შუაში." },
  task: { en: "Fix the removal so it doesn't trigger ConcurrentModificationException.", ka: "წაშლა გაასწორე, რომ ConcurrentModificationException-ს არ გამოიძახებდეს." },
  hints: [
    { en: "Why does ArrayList throw ConcurrentModificationException here?", ka: "რატომ გამოიძახებს ArrayList ConcurrentModificationException-ს?" },
    { en: "The for-each loop uses an Iterator internally. Modifying the list directly invalidates the iterator.", ka: "for-each მარყუჟი Iterator-ს შიგნიდან იყენებს. სიის პირდაპირი ცვლა iterator-ს ბათილს ხდის." },
    { en: "Use list.removeIf(n -> n < 0) — it is safe and concise.", ka: "list.removeIf(n -> n < 0) გამოიყენე — უსაფრთხო და ლაკონიკური." },
  ],
  format: "text",
  interaction: "pick-fix",
  code: `void removeNegatives(List<Integer> list) {
    for (Integer n : list) {
        if (n < 0) {
            list.remove(n);  // ConcurrentModificationException!
        }
    }
}`,
  bugLine: 4,
  correctedCode: `import java.util.*;

public class Main {
    static void removeNegatives(List<Integer> list) {
        list.removeIf(n -> n < 0);
    }

    public static void main(String[] args) {
        List<Integer> nums = new ArrayList<>(Arrays.asList(3, -1, 7, -4, 2));
        removeNegatives(nums);
        System.out.println(nums);  // [3, 7, 2]
    }
}`,
  codeByLang: {
    python: `def remove_negatives(lst):\n    for n in lst:         # iterating the list directly\n        if n < 0:\n            lst.remove(n)  # RuntimeError: list changed size during iteration\n\nnums = [3, -1, 7, -4, 2]\nremove_negatives(nums)\nprint(nums)`,
    javascript: `function removeNegatives(arr) {\n    arr.forEach((n, i) => {\n        if (n < 0) arr.splice(i, 1);  // mutating while iterating — skips elements!\n    });\n}\n\nconst nums = [3, -1, 7, -4, 2];\nremoveNegatives(nums);\nconsole.log(nums);  // [3, 7, -4, 2] — -4 was skipped!`,
    cpp: `#include <iostream>\n#include <vector>\n\nvoid removeNegatives(std::vector<int>& v) {\n    for (auto it = v.begin(); it != v.end(); ++it) {\n        if (*it < 0) v.erase(it);  // iterator invalidated after erase!\n    }\n}\n\nint main() {\n    std::vector<int> nums = {3, -1, 7, -4, 2};\n    removeNegatives(nums);\n    for (int n : nums) std::cout << n << " ";\n}`,
  },
  bugLineByLang: { python: "3", javascript: "3", cpp: "6" },
  correctedCodeByLang: {
    python: `def remove_negatives(lst):\n    lst[:] = [n for n in lst if n >= 0]  # list comprehension — safe\n\nnums = [3, -1, 7, -4, 2]\nremove_negatives(nums)\nprint(nums)  # [3, 7, 2]`,
    javascript: `function removeNegatives(arr) {\n    // filter returns a new array — no mutation during iteration\n    return arr.filter(n => n >= 0);\n}\n\nconst nums = [3, -1, 7, -4, 2];\nconsole.log(removeNegatives(nums));  // [3, 7, 2]`,
    cpp: `#include <iostream>\n#include <vector>\n#include <algorithm>\n\nvoid removeNegatives(std::vector<int>& v) {\n    v.erase(std::remove_if(v.begin(), v.end(), [](int n){ return n < 0; }), v.end());\n}\n\nint main() {\n    std::vector<int> nums = {3, -1, 7, -4, 2};\n    removeNegatives(nums);\n    for (int n : nums) std::cout << n << " ";\n    std::cout << "\\n";  // 3 7 2\n}`,
  },
  fixes: [
    {
      id: "removeIf", correct: true,
      label: { en: "list.removeIf(n -> n < 0);", ka: "list.removeIf(n -> n < 0);" },
      explanation: { en: "removeIf() handles structural modification safely and is the most readable solution.", ka: "removeIf() სტრუქტურულ ცვლილებას უსაფრთხოდ მართავს და ყველაზე წასაკითხი გადაწყვეტაა." },
    },
    {
      id: "iterator", correct: false,
      label: { en: "Use Iterator: if (it.next() < 0) it.remove();", ka: "Iterator: if (it.next() < 0) it.remove();" },
      explanation: { en: "Iterator.remove() is the classic safe approach, but removeIf is the idiomatic modern solution.", ka: "Iterator.remove() კლასიკური უსაფრთხო მიდგომაა, მაგრამ removeIf თანამედროვე სტანდარტული გადაწყვეტაა." },
    },
    {
      id: "copy", correct: false,
      label: { en: "Iterate over new ArrayList<>(list) and remove from original", ka: "new ArrayList<>(list)-ზე გაიარე და ორიგინალიდან წაშალე" },
      explanation: { en: "Iterating a copy while modifying the original avoids CME but allocates an extra list unnecessarily.", ka: "ასლზე გასვლა ორიგინალის ცვლის დროს CME-ს თავიდან არიდებს, მაგრამ ზედმეტ სიას გამოყოფს." },
    },
  ],
};

// ─── java-10: Thread-unsafe counter ──────────────────────────────────────────

const java10: TextFillBlankDef = {
  id: "java-10",
  difficulty: "hard",
  bugType: "wrong-condition",
  programmingLanguage: "java",
  concept: { en: "i++ is not atomic — it involves read-modify-write; use AtomicInteger for thread-safe counters", ka: "i++ ატომური არ არის — read-modify-write მოიცავს; thread-safe მთვლელებისთვის AtomicInteger გამოიყენე" },
  title: { en: "The Lost Increments", ka: "დაკარგული ინკრემენტები" },
  story: { en: "A multi-threaded hit counter consistently reports fewer hits than actually occurred because of a race condition.", ka: "მრავალ-thread-ური მომართვათა მთვლელი ყოველთვის ნაკლებ მომართვას ანგარიშობს, race condition-ის გამო." },
  task: { en: "Use the class that provides atomic increment operations.", ka: "კლასი გამოიყენე, რომელიც ატომური ინკრემენტ ოპერაციებს უზრუნველყოფს." },
  hints: [
    { en: "Why can two threads reading the same counter both see 5, increment to 6, and write 6 back?", ka: "რატომ შეუძლია ორ thread-ს ერთ მთვლელს 5 ნახოს, 6-ამდე გაზარდოს, და ორივე 6 ჩაწეროს?" },
    { en: "count++ is three operations: read, add 1, write. Threads can interleave between them.", ka: "count++ სამი ოპერაციაა: წაკითხვა, 1-ის დამატება, ჩაწერა. Thread-ები შეიძლება გადაიკვეთოს მათ შორის." },
    { en: "java.util.concurrent.atomic.AtomicInteger provides thread-safe incrementAndGet().", ka: "java.util.concurrent.atomic.AtomicInteger thread-safe incrementAndGet()-ს გვაძლევს." },
  ],
  format: "text",
  interaction: "fill-blank",
  codeBefore: `import java.util.concurrent.atomic.AtomicInteger;

class HitCounter {
    private `,
  codeAfter: ` count = new AtomicInteger(0);

    public void hit() { count.incrementAndGet(); }
    public int total() { return count.get(); }
}`,
  correctedCode: `import java.util.concurrent.atomic.AtomicInteger;

class HitCounter {
    private AtomicInteger count = new AtomicInteger(0);
    public void hit() { count.incrementAndGet(); }
    public int total() { return count.get(); }
}

public class Main {
    public static void main(String[] args) {
        HitCounter counter = new HitCounter();
        counter.hit();
        counter.hit();
        counter.hit();
        System.out.println(counter.total());  // 3
    }
}`,
  codeBeforeByLang: {
    python: `import threading\n\nclass HitCounter:\n    def __init__(self):\n        self._lock = threading.Lock()\n        self._count = 0\n    def hit(self):\n        `,
    javascript: `// JavaScript is single-threaded, but async ordering can still cause issues\n// Here we show the correct sequential pattern\nclass HitCounter {\n    constructor() { this.`,
    cpp: `#include <iostream>\n#include <atomic>\n\nclass HitCounter {\n    `,
  },
  codeAfterByLang: {
    python: `with self._lock:\n            self._count += 1\n    def total(self):\n        with self._lock:\n            return self._count\n\ncounter = HitCounter()\ncounter.hit()\ncounter.hit()\ncounter.hit()\nprint(counter.total())  # 3`,
    javascript: `count = 0; }\n    hit() { this.count++; }\n    total() { return this.count; }\n}\n\nconst c = new HitCounter();\nc.hit(); c.hit(); c.hit();\nconsole.log(c.total());  // 3`,
    cpp: `std::atomic<int> count{0};\npublic:\n    void hit() { count.fetch_add(1); }\n    int total() { return count.load(); }\n};\n\nint main() {\n    HitCounter c;\n    c.hit(); c.hit(); c.hit();\n    std::cout << c.total() << "\\n";  // 3\n}`,
  },
  correctedCodeByLang: {
    python: `import threading\n\nclass HitCounter:\n    def __init__(self):\n        self._lock = threading.Lock()\n        self._count = 0\n    def hit(self):\n        with self._lock:\n            self._count += 1\n    def total(self):\n        with self._lock:\n            return self._count\n\ncounter = HitCounter()\ncounter.hit()\ncounter.hit()\ncounter.hit()\nprint(counter.total())  # 3`,
    javascript: `class HitCounter {\n    constructor() { this.count = 0; }\n    hit() { this.count++; }\n    total() { return this.count; }\n}\n\nconst c = new HitCounter();\nc.hit(); c.hit(); c.hit();\nconsole.log(c.total());  // 3`,
    cpp: `#include <iostream>\n#include <atomic>\n\nclass HitCounter {\n    std::atomic<int> count{0};\npublic:\n    void hit() { count.fetch_add(1); }\n    int total() { return count.load(); }\n};\n\nint main() {\n    HitCounter c;\n    c.hit(); c.hit(); c.hit();\n    std::cout << c.total() << "\\n";  // 3\n}`,
  },
  options: [
    {
      id: "a", value: "AtomicInteger", correct: true,
      explanation: { en: "AtomicInteger uses CPU-level atomic instructions so increment is always consistent across threads.", ka: "AtomicInteger CPU-დონის ატომური ინსტრუქციებს იყენებს, ამიტომ ინკრემენტი thread-ებს შორის ყოველთვის თანმიმდევრულია." },
    },
    {
      id: "b", value: "int", correct: false,
      explanation: { en: "Plain int is not thread-safe — increments can be lost when threads interleave.", ka: "ჩვეულებრივი int thread-safe არ არის — ინკრემენტები შეიძლება დაიკარგოს thread-ების გადაკვეთისას." },
    },
    {
      id: "c", value: "volatile int", correct: false,
      explanation: { en: "volatile ensures visibility but not atomicity — compound read-modify-write is still a race.", ka: "volatile ხილვადობას, მაგრამ ატომურობას არ უზრუნველყოფს — კომპლექსური read-modify-write კვლავ race-ია." },
    },
  ],
};

// ─── java-11: List.of() is immutable ─────────────────────────────────────────

const java11: TextPickFixDef = {
  id: "java-11",
  difficulty: "easy",
  bugType: "mutation-error",
  programmingLanguage: "java",
  concept: { en: "List.of() returns an unmodifiable list — calling add() or remove() throws UnsupportedOperationException", ka: "List.of() შეუცვლელ სიას აბრუნებს — add() ან remove()-ის გამოძახება UnsupportedOperationException-ს გამოიძახებს" },
  title: { en: "The Immutable Trap", ka: "შეუცვლელი მახე" },
  story: { en: "A helper that seeds a mutable list crashes when it tries to add items to a List.of() collection.", ka: "ჩამყრელი helper ჭედება, როცა ელემენტების List.of() კოლექციაში დამატებას ცდილობს." },
  task: { en: "Create a mutable list instead of an immutable one.", ka: "შეუცვლელის ნაცვლად შეცვლადი სია შექმენი." },
  hints: [
    { en: "What does List.of() guarantee about mutability?", ka: "List.of() მუტაბელობაზე რას გარანტიას იძლევა?" },
    { en: "List.of() is factory method that returns a fixed-size, unmodifiable view.", ka: "List.of() ფაქტორ-მეთოდია, რომელიც ფიქსირებული ზომის, შეუცვლელ ხედვას აბრუნებს." },
    { en: "Use new ArrayList<>(List.of(...)) or just new ArrayList<>() to get a mutable list.", ka: "new ArrayList<>(List.of(...)) ან new ArrayList<>() გამოიყენე შეცვლადი სიის მისაღებად." },
  ],
  format: "text",
  interaction: "pick-fix",
  code: `import java.util.*;

public class Seeder {
    public List<String> seed() {
        List<String> items = List.of("alpha", "beta");
        items.add("gamma");  // throws UnsupportedOperationException
        return items;
    }
}`,
  bugLine: 5,
  correctedCode: `import java.util.*;

public class Seeder {
    public List<String> seed() {
        List<String> items = new ArrayList<>(List.of("alpha", "beta"));
        items.add("gamma");
        return items;
    }

    public static void main(String[] args) {
        System.out.println(new Seeder().seed());  // [alpha, beta, gamma]
    }
}`,
  codeByLang: {
    python: `def seed():\n    items = ("alpha", "beta")  # tuple — immutable!\n    items.append("gamma")      # AttributeError: 'tuple' object has no attribute 'append'\n    return items\n\nprint(seed())`,
    javascript: `function seed() {\n    const items = Object.freeze(["alpha", "beta"]);  // frozen — immutable!\n    items.push("gamma");  // TypeError in strict mode; silently fails otherwise\n    return items;\n}\n\nconsole.log(seed());`,
    cpp: `#include <iostream>\n#include <vector>\n\nstd::vector<std::string> seed() {\n    const std::vector<std::string> items = {"alpha", "beta"};  // const!\n    // items.push_back("gamma");  // compile error: can't modify const vector\n    return items;\n}\n\nint main() {\n    auto v = seed();\n    for (const auto& s : v) std::cout << s << " ";\n}`,
  },
  bugLineByLang: { python: "3", javascript: "3", cpp: "5" },
  correctedCodeByLang: {
    python: `def seed():\n    items = ["alpha", "beta"]  # list — mutable!\n    items.append("gamma")\n    return items\n\nprint(seed())  # ['alpha', 'beta', 'gamma']`,
    javascript: `function seed() {\n    const items = ["alpha", "beta"];  // plain array — mutable\n    items.push("gamma");\n    return items;\n}\n\nconsole.log(seed());  // [ 'alpha', 'beta', 'gamma' ]`,
    cpp: `#include <iostream>\n#include <vector>\n\nstd::vector<std::string> seed() {\n    std::vector<std::string> items = {"alpha", "beta"};  // non-const\n    items.push_back("gamma");\n    return items;\n}\n\nint main() {\n    for (const auto& s : seed()) std::cout << s << " ";\n    std::cout << "\\n";  // alpha beta gamma\n}`,
  },
  fixes: [
    {
      id: "arraylist", correct: true,
      label: { en: "new ArrayList<>(List.of(\"alpha\", \"beta\"))", ka: "new ArrayList<>(List.of(\"alpha\", \"beta\"))" },
      explanation: { en: "Wrapping List.of() in a new ArrayList copies the elements into a mutable list that supports add/remove.", ka: "List.of()-ის ახალ ArrayList-ში გახვევა ელემენტებს შეცვლად სიაში კოპირებს, რომელიც add/remove-ს მხარს უჭერს." },
    },
    {
      id: "arrays-aslist", correct: false,
      label: { en: "Arrays.asList(\"alpha\", \"beta\")", ka: "Arrays.asList(\"alpha\", \"beta\")" },
      explanation: { en: "Arrays.asList returns a fixed-size list backed by an array — add/remove still throws UnsupportedOperationException.", ka: "Arrays.asList ფიქსირებული ზომის სიას აბრუნებს მასივის მხარდაჭერით — add/remove კვლავ UnsupportedOperationException-ს გამოიძახებს." },
    },
    {
      id: "collections-singleton", correct: false,
      label: { en: "Collections.singletonList(\"alpha\")", ka: "Collections.singletonList(\"alpha\")" },
      explanation: { en: "singletonList holds exactly one element and is immutable — still can't add.", ka: "singletonList ზუსტად ერთ ელემენტს ინახავს და შეუცვლელია — კვლავ ვერ ემატება." },
    },
  ],
};

// ─── java-12: char arithmetic ─────────────────────────────────────────────────

const java12: TextFillBlankDef = {
  id: "java-12",
  difficulty: "easy",
  bugType: "type-error",
  programmingLanguage: "java",
  concept: { en: "char + int promotes to int in Java; cast back to char or use String.valueOf() to keep it a character", ka: "Java-ში char + int int-ად ქვეყნდება; char-ად დაბრუნების ან String.valueOf()-ის გამოყენება სიმბოლოს შესანარჩუნებლად" },
  title: { en: "Character Lost in Math", ka: "მათემატიკაში დაკარგული სიმბოლო" },
  story: { en: "A cipher shifts each letter by 1 but prints ASCII numbers instead of characters because char arithmetic promotes to int.", ka: "შიფრი თითოეულ ასოს 1-ით ცვლის, მაგრამ ASCII რიცხვებს ბეჭდავს სიმბოლოების ნაცვლად, რადგან char-ის არითმეტიკა int-ად ქვეყნდება." },
  task: { en: "Add a cast so the shifted value is printed as a character, not an integer.", ka: "დაამატე cast, რომ გადაადგილებული მნიშვნელობა სიმბოლოდ, არა მთელ რიცხვად, დაიბეჭდოს." },
  hints: [
    { en: "What type does 'a' + 1 have in Java?", ka: "'a' + 1-ს Java-ში რა ტიპი აქვს?" },
    { en: "Adding an int to a char promotes the result to int — you need to cast back.", ka: "char-ზე int-ის დამატება შედეგს int-ად ქვეყნებს — უკან cast-ი გჭირდება." },
    { en: "Cast the expression to char: (char)('a' + 1) gives 'b'.", ka: "გამოთქმა char-ად cast-ე: (char)('a' + 1) 'b'-ს იძლევა." },
  ],
  format: "text",
  interaction: "fill-blank",
  codeBefore: `public class Cipher {
    public static void shiftPrint(char c, int shift) {
        System.out.println(`,
  codeAfter: `);
    }
    public static void main(String[] args) {
        shiftPrint('A', 1);  // should print B, not 66
    }
}`,
  codeBeforeByLang: {
    python: `def shift_print(c, shift):\n    print(`,
    javascript: `function shiftPrint(c, shift) {\n  console.log(`,
    cpp: `#include <iostream>\n\nvoid shiftPrint(char c, int shift) {\n    std::cout << `,
  },
  codeAfterByLang: {
    python: `)\n\nshift_print('A', 1)  # should print B, not 66`,
    javascript: `);\n}\n\nshiftPrint('A', 1);  // should print B, not 66`,
    cpp: ` << "\\n";\n}\n\nint main() {\n    shiftPrint('A', 1);  // should print B, not 66\n}`,
  },
  correctedCodeByLang: {
    python: `def shift_print(c, shift):\n    print(chr(ord(c) + shift))\n\nshift_print('A', 1)  # B`,
    javascript: `function shiftPrint(c, shift) {\n  console.log(String.fromCharCode(c.charCodeAt(0) + shift));\n}\n\nshiftPrint('A', 1);  // B`,
    cpp: `#include <iostream>\n\nvoid shiftPrint(char c, int shift) {\n    std::cout << (char)(c + shift) << "\\n";\n}\n\nint main() {\n    shiftPrint('A', 1);  // B\n}`,
  },
  options: [
    {
      id: "a", value: "(char)(c + shift)", correct: true,
      explanation: { en: "Casting back to char converts the int result to its corresponding character, so 65+1=66 becomes 'B'.", ka: "char-ად cast-ი int შედეგს შესაბამის სიმბოლოდ გარდაქმნის, ამიტომ 65+1=66 'B'-ს ხდება." },
    },
    {
      id: "b", value: "c + shift", correct: false,
      explanation: { en: "char + int promotes to int — println prints the numeric value (e.g., 66) instead of 'B'.", ka: "char + int int-ად ქვეყნდება — println ციფრულ მნიშვნელობას (მაგ. 66) ბეჭდავს 'B'-ის ნაცვლად." },
    },
    {
      id: "c", value: "String.valueOf(c + shift)", correct: false,
      explanation: { en: "String.valueOf(int) converts the integer to its decimal string representation — '66' not 'B'.", ka: "String.valueOf(int) მთელ რიცხვს ათობით სტრიქონად გარდაქმნის — 'B'-ის ნაცვლად '66'." },
    },
  ],
};

// ─── java-13: Optional.orElseGet() vs orElse() ───────────────────────────────

const java13: TextFillBlankDef = {
  id: "java-13",
  difficulty: "medium",
  bugType: "wrong-condition",
  programmingLanguage: "java",
  concept: { en: "Optional.orElse() always evaluates its argument; orElseGet() is lazy — use it when the default is expensive to compute", ka: "Optional.orElse() ყოველთვის ამოწმებს არგუმენტს; orElseGet() ზარმაცია — გამოიყენე, თუ default-ი ძვირია გამოსათვლელად" },
  title: { en: "The Eager Default", ka: "გულმოდგინე Default" },
  story: { en: "A cache lookup always runs an expensive database query even when the cached value is present, because of the wrong Optional method.", ka: "ქეშის ძიება ყოველთვის ძვირი მონაცემთა ბაზის მოთხოვნას ახდენს, თუნდაც ქეშირებული მნიშვნელობა არსებობდეს, არასწორი Optional მეთოდის გამო." },
  task: { en: "Use the Optional method that only calls the fallback supplier when the value is absent.", ka: "გამოიყენე Optional მეთოდი, რომელიც fallback supplier-ს მხოლოდ მაშინ გამოიძახებს, თუ მნიშვნელობა არ არის." },
  hints: [
    { en: "What is the difference between orElse(T other) and orElseGet(Supplier<T> supplier)?", ka: "რა განსხვავებაა orElse(T other)-სა და orElseGet(Supplier<T> supplier)-ს შორის?" },
    { en: "orElse() evaluates its argument eagerly — even when the Optional is non-empty.", ka: "orElse() არგუმენტს eagerly-ს ამოწმებს — თუნდაც Optional არ იყოს ცარიელი." },
    { en: "orElseGet(() -> expensiveQuery()) only runs the lambda when needed.", ka: "orElseGet(() -> expensiveQuery()) lambda-ს მხოლოდ საჭიროებისას გაუშვებს." },
  ],
  format: "text",
  interaction: "fill-blank",
  codeBefore: `public String getUser(String id) {
    Optional<String> cached = cache.get(id);
    return cached.`,
  codeAfter: `(() -> database.query(id));
}`,
  correctedCode: `import java.util.*;

public class Main {
    static Map<String, String> cache = new HashMap<>();

    static String getUser(String id) {
        Optional<String> cached = Optional.ofNullable(cache.get(id));
        return cached.orElseGet(() -> "DB:" + id);
    }

    public static void main(String[] args) {
        cache.put("u1", "Alice (cached)");
        System.out.println(getUser("u1"));  // Alice (cached)
        System.out.println(getUser("u2"));  // DB:u2  (lazy fallback)
    }
}`,
  codeBeforeByLang: {
    python: `# Python: ternary always evaluates both branches\ncache = {}\n\ndef expensive_query(id):\n    print(f"Running DB query for {id}")\n    return f"DB:{id}"\n\ndef get_user(id):\n    cached = cache.get(id)\n    # bug: expensive_query(id) always called even when cached!\n    return cached if cached is not None else `,
    javascript: `// JavaScript: || evaluates right side when left is falsy (0, '', false too)\nconst cache = {};\n\nfunction expensiveQuery(id) {\n  console.log("Running DB query for", id);\n  return "DB:" + id;\n}\n\nfunction getUser(id) {\n  return cache[id] `,
    cpp: `#include <iostream>\n#include <optional>\n#include <string>\n#include <map>\n\nstd::map<std::string,std::string> cache;\n\nstd::string expensiveQuery(const std::string& id) {\n    std::cout << "Running DB query for " << id << "\\n";\n    return "DB:" + id;\n}\n\nstd::string getUser(const std::string& id) {\n    std::optional<std::string> cached;\n    auto it = cache.find(id);\n    if (it != cache.end()) cached = it->second;\n    // orElse-equivalent: always calls expensiveQuery even when cached!\n    return cached.`,
  },
  codeAfterByLang: {
    python: `expensive_query(id)\n\ncache["u1"] = "Alice (cached)"\nprint(get_user("u1"))  # should NOT run query\nprint(get_user("u2"))  # should run query`,
    javascript: ` || expensiveQuery(id);  // always calls expensiveQuery when cache[id] is falsy\n}\n\ncache["u1"] = "Alice (cached)";\nconsole.log(getUser("u1"));  // should NOT run query\nconsole.log(getUser("u2"));  // should run query`,
    cpp: `value_or(expensiveQuery(id));  // always evaluates expensiveQuery!\n}\n\nint main() {\n    cache["u1"] = "Alice (cached)";\n    std::cout << getUser("u1") << "\\n";\n    std::cout << getUser("u2") << "\\n";\n}`,
  },
  correctedCodeByLang: {
    python: `cache = {}\n\ndef expensive_query(id):\n    print(f"Running DB query for {id}")\n    return f"DB:{id}"\n\ndef get_user(id):\n    if id in cache:\n        return cache[id]  # short-circuit: no query\n    return expensive_query(id)\n\ncache["u1"] = "Alice (cached)"\nprint(get_user("u1"))  # Alice (cached) — no query printed\nprint(get_user("u2"))  # Running DB query for u2 / DB:u2`,
    javascript: `const cache = {};\n\nfunction expensiveQuery(id) {\n  console.log("Running DB query for", id);\n  return "DB:" + id;\n}\n\nfunction getUser(id) {\n  return cache[id] ?? expensiveQuery(id);  // ?? only falls back for null/undefined\n}\n\ncache["u1"] = "Alice (cached)";\nconsole.log(getUser("u1"));  // Alice (cached) — no query\nconsole.log(getUser("u2"));  // Running DB query / DB:u2`,
    cpp: `#include <iostream>\n#include <optional>\n#include <string>\n#include <map>\n#include <functional>\n\nstd::map<std::string,std::string> cache;\n\nstd::string expensiveQuery(const std::string& id) {\n    std::cout << "Running DB query for " << id << "\\n";\n    return "DB:" + id;\n}\n\nstd::string getUser(const std::string& id) {\n    auto it = cache.find(id);\n    if (it != cache.end()) return it->second;  // lazy: only query on miss\n    return expensiveQuery(id);\n}\n\nint main() {\n    cache["u1"] = "Alice (cached)";\n    std::cout << getUser("u1") << "\\n";  // Alice (cached)\n    std::cout << getUser("u2") << "\\n";  // DB:u2\n}`,
  },
  options: [
    {
      id: "a", value: "orElseGet", correct: true,
      explanation: { en: "orElseGet takes a Supplier and only calls it when the Optional is empty — the expensive query only runs on cache misses.", ka: "orElseGet Supplier-ს იღებს და მხოლოდ მაშინ გამოიძახებს, თუ Optional ცარიელია — ძვირი query მხოლოდ ქეშის miss-ებზე გაეშვება." },
    },
    {
      id: "b", value: "orElse", correct: false,
      explanation: { en: "orElse() takes a value, not a Supplier — it doesn't compile with a lambda argument. Even if it did, it would evaluate eagerly.", ka: "orElse() მნიშვნელობას იღებს, არა Supplier-ს — lambda არგუმენტით კომპილირება ვერ ხდება. თუნდაც ხდებოდეს, eagerly-ს გამოიანგარიშებდა." },
    },
    {
      id: "c", value: "or", correct: false,
      explanation: { en: "or() returns Optional<T>, not T — the return type doesn't match.", ka: "or() Optional<T>-ს აბრუნებს, არა T-ს — return ტიპი არ ემთხვევა." },
    },
  ],
};

// ─── java-14: Objects.requireNonNull for null checks ─────────────────────────

const java14: TextPickFixDef = {
  id: "java-14",
  difficulty: "medium",
  bugType: "null-error",
  programmingLanguage: "java",
  concept: { en: "Explicit null-check with Objects.requireNonNull() throws NullPointerException at the call site with a clear message", ka: "Objects.requireNonNull()-ით ცხადი null-შემოწმება NullPointerException-ს გამოძახების ადგილზე ნათელი შეტყობინებით გამოიძახებს" },
  title: { en: "The Distant Crash", ka: "დაშორებული ავარია" },
  story: { en: "A service stores a null repository reference and crashes deep in a call chain, making the root cause hard to find.", ka: "სერვისი null repository-ს ინახავს და გამოძახების ჯაჭვში ღრმად ჭედება, root cause-ის პოვნას ართულებს." },
  task: { en: "Add an early null check so the constructor fails immediately with a meaningful error.", ka: "ადრეული null-შემოწმება დაამატე, რომ constructor-ი დაუყოვნებლივ მნიშვნელოვანი შეცდომით ვერ შეასრულოს." },
  hints: [
    { en: "When should you check for null — when storing it or when using it?", ka: "null-ის შემოწმება როდის უნდა მოხდეს — შენახვისას თუ გამოყენებისას?" },
    { en: "Failing fast at the constructor gives a clear error message right where the bad input arrives.", ka: "constructor-ში სწრაფი ვარდნა ნათელ შეცდომის შეტყობინებას იძლევა ზუსტად იქ, სადაც ცუდი შეყვანა მოდის." },
    { en: "Objects.requireNonNull(value, \"message\") throws NPE with the message if value is null.", ka: "Objects.requireNonNull(value, \"message\") NPE-ს გამოიძახებს შეტყობინებით, თუ value null-ია." },
  ],
  format: "text",
  interaction: "pick-fix",
  code: `import java.util.Objects;

public class UserService {
    private final UserRepository repo;

    public UserService(UserRepository repo) {
        this.repo = repo;  // null silently stored
    }
}`,
  bugLine: 7,
  correctedCode: `import java.util.Objects;

interface UserRepository {}

public class UserService {
    private final UserRepository repo;

    public UserService(UserRepository repo) {
        this.repo = Objects.requireNonNull(repo, "repo must not be null");
    }

    public static void main(String[] args) {
        try {
            new UserService(null);
        } catch (NullPointerException e) {
            System.out.println("Caught: " + e.getMessage());
            // Caught: repo must not be null
        }
    }
}`,
  codeByLang: {
    python: `class UserService:\n    def __init__(self, repo):\n        self.repo = repo  # None silently stored\n\n# Later, deep in call chain:\nservice = UserService(None)\nservice.repo.find_user("alice")  # AttributeError: 'NoneType' object has no attribute 'find_user'`,
    javascript: `class UserService {\n    constructor(repo) {\n        this.repo = repo;  // null silently stored\n    }\n}\n\nconst service = new UserService(null);\nservice.repo.findUser("alice");  // TypeError: Cannot read properties of null`,
    cpp: `#include <iostream>\n#include <stdexcept>\n\nclass UserRepository {};\n\nclass UserService {\n    UserRepository* repo;\npublic:\n    UserService(UserRepository* r) : repo(r) {}  // null silently stored\n\n    void findUser(const std::string& id) {\n        repo->findUser(id);  // undefined behavior / crash if repo is null\n    }\n};`,
  },
  bugLineByLang: { python: "3", javascript: "3", cpp: "9" },
  correctedCodeByLang: {
    python: `class UserService:\n    def __init__(self, repo):\n        if repo is None:\n            raise ValueError("repo must not be None")\n        self.repo = repo\n\ntry:\n    service = UserService(None)\nexcept ValueError as e:\n    print("Caught:", e)  # Caught: repo must not be None`,
    javascript: `class UserService {\n    constructor(repo) {\n        if (repo == null) throw new Error("repo must not be null");\n        this.repo = repo;\n    }\n}\n\ntry {\n    new UserService(null);\n} catch (e) {\n    console.log("Caught:", e.message);  // Caught: repo must not be null\n}`,
    cpp: `#include <iostream>\n#include <stdexcept>\n\nclass UserRepository {};\n\nclass UserService {\n    UserRepository* repo;\npublic:\n    UserService(UserRepository* r) {\n        if (!r) throw std::invalid_argument("repo must not be null");\n        repo = r;\n    }\n};\n\nint main() {\n    try {\n        UserService s(nullptr);\n    } catch (const std::invalid_argument& e) {\n        std::cout << "Caught: " << e.what() << "\\n";  // Caught: repo must not be null\n    }\n}`,
  },
  fixes: [
    {
      id: "require-non-null", correct: true,
      label: { en: "this.repo = Objects.requireNonNull(repo, \"repo must not be null\")", ka: "this.repo = Objects.requireNonNull(repo, \"repo must not be null\")" },
      explanation: { en: "requireNonNull throws NullPointerException immediately at construction time with a descriptive message — fail fast, fail clearly.", ka: "requireNonNull NullPointerException-ს დაუყოვნებლივ კონსტრუქციის დროს გამოიძახებს აღწერილობითი შეტყობინებით — სწრაფი, ნათელი ვარდნა." },
    },
    {
      id: "if-throw", correct: false,
      label: { en: "if (repo == null) throw new IllegalArgumentException(\"null\")", ka: "if (repo == null) throw new IllegalArgumentException(\"null\")" },
      explanation: { en: "IllegalArgumentException is reasonable but Objects.requireNonNull is the idiomatic Java pattern for this use case.", ka: "IllegalArgumentException გონივრულია, მაგრამ Objects.requireNonNull ამ გამოყენების შემთხვევის სტანდარტული Java შაბლონია." },
    },
    {
      id: "assert", correct: false,
      label: { en: "assert repo != null : \"repo must not be null\"", ka: "assert repo != null : \"repo must not be null\"" },
      explanation: { en: "Assertions are disabled by default in production JVMs — this guard would be silently skipped in most deployments.", ka: "Assertions წარმოების JVM-ებში ნაგულისხმევად გამორთულია — ეს გამოყოფა წარმოების უმეტეს განლაგებაში ჩუმად გამოტოვდება." },
    },
  ],
};

// ─── java-15: try-with-resources ─────────────────────────────────────────────

const java15: TextPickFixDef = {
  id: "java-15",
  difficulty: "hard",
  bugType: "return-error",
  programmingLanguage: "java",
  concept: { en: "AutoCloseable resources must be opened in a try-with-resources statement to be closed even when exceptions occur", ka: "AutoCloseable რესურსები try-with-resources-ში უნდა გაიხსნას, რომ გამონაკლისების დროსაც დაიხუროს" },
  title: { en: "The Leaky Reader", ka: "გაჟონვადი Reader" },
  story: { en: "A file reader leaks its stream when an exception is thrown during processing because close() is only called in the happy path.", ka: "ფაილის reader-ი ნაკადს გაჟონავს, თუ დამუშავების დროს გამონაკლისი ჩნდება, რადგან close() მხოლოდ წარმატების შემთხვევაში გამოიძახება." },
  task: { en: "Ensure the reader is always closed, even if an exception is thrown inside the block.", ka: "დარწმუნდი, რომ reader ყოველთვის დაიხურება, თუნდაც ბლოკის შიგნით გამონაკლისი ჩნდეს." },
  hints: [
    { en: "What happens to reader.close() if processLine() throws?", ka: "reader.close()-ს რა ემართება, თუ processLine() გამოისვრის?" },
    { en: "Java 7+ added try-with-resources to automatically close AutoCloseable objects.", ka: "Java 7+-მა try-with-resources დაამატა AutoCloseable ობიექტების ავტომატურად დასახურავად." },
    { en: "try (BufferedReader br = new BufferedReader(...)) { ... } closes br on exit, even if an exception throws.", ka: "try (BufferedReader br = new BufferedReader(...)) { ... } br-ს გასვლაზე ხურავს, თუნდაც გამონაკლისი ჩნდეს." },
  ],
  format: "text",
  interaction: "pick-fix",
  code: `public void readFile(String path) throws IOException {
    BufferedReader reader = new BufferedReader(new FileReader(path));
    String line;
    while ((line = reader.readLine()) != null) {
        processLine(line);  // may throw
    }
    reader.close();  // skipped if exception thrown above
}`,
  bugLine: 2,
  correctedCode: `import java.io.*;

public class Main {
    static void processLine(String line) {
        System.out.println("Line: " + line);
    }

    public static void readFile(String path) throws IOException {
        try (BufferedReader reader = new BufferedReader(new FileReader(path))) {
            String line;
            while ((line = reader.readLine()) != null) {
                processLine(line);
            }
        }  // reader.close() called automatically here, even if an exception is thrown
    }

    public static void main(String[] args) throws IOException {
        readFile("example.txt");
    }
}`,
  codeByLang: {
    python: `def read_file(path):\n    f = open(path, "r")        # opened outside context manager\n    for line in f:\n        process_line(line)     # may raise\n    f.close()                  # skipped if exception raised above\n\ndef process_line(line):\n    print("Line:", line.strip())`,
    javascript: `const fs = require("fs");\n\nfunction readFile(path) {\n    const fd = fs.openSync(path, "r");  // opened manually\n    const buf = Buffer.alloc(1024);\n    let bytesRead;\n    while ((bytesRead = fs.readSync(fd, buf)) > 0) {\n        processChunk(buf.slice(0, bytesRead));  // may throw\n    }\n    fs.closeSync(fd);  // skipped if exception thrown above\n}`,
    cpp: `#include <iostream>\n#include <fstream>\n#include <string>\n\nvoid readFile(const std::string& path) {\n    std::ifstream* f = new std::ifstream(path);  // raw pointer — manual management\n    std::string line;\n    while (std::getline(*f, line)) {\n        processLine(line);  // may throw\n    }\n    delete f;  // skipped if exception thrown above — memory/resource leak!\n}`,
  },
  bugLineByLang: { python: "2", javascript: "3", cpp: "6" },
  correctedCodeByLang: {
    python: `def process_line(line):\n    print("Line:", line.strip())\n\ndef read_file(path):\n    with open(path, "r") as f:  # 'with' guarantees close() on exit\n        for line in f:\n            process_line(line)\n\nread_file("example.txt")`,
    javascript: `const fs = require("fs");\n\nfunction readFile(path) {\n    const fd = fs.openSync(path, "r");\n    try {\n        const buf = Buffer.alloc(1024);\n        let bytesRead;\n        while ((bytesRead = fs.readSync(fd, buf)) > 0) {\n            console.log(buf.slice(0, bytesRead).toString());\n        }\n    } finally {\n        fs.closeSync(fd);  // always runs, even if exception thrown\n    }\n}`,
    cpp: `#include <iostream>\n#include <fstream>\n#include <string>\n\nvoid processLine(const std::string& line) {\n    std::cout << "Line: " << line << "\\n";\n}\n\nvoid readFile(const std::string& path) {\n    std::ifstream f(path);  // stack object — RAII closes on scope exit automatically\n    std::string line;\n    while (std::getline(f, line)) {\n        processLine(line);\n    }\n}  // f.close() called automatically here, even if exception is thrown\n\nint main() {\n    readFile("example.txt");\n}`,
  },
  fixes: [
    {
      id: "try-resources", correct: true,
      label: { en: "try (BufferedReader reader = new BufferedReader(new FileReader(path))) { ... }", ka: "try (BufferedReader reader = new BufferedReader(new FileReader(path))) { ... }" },
      explanation: { en: "try-with-resources guarantees close() is called on exit — normal or exceptional — because the JVM inserts it in a synthetic finally block.", ka: "try-with-resources close()-ის გამოძახებას გარანტიას იძლევა გასვლაზე — ნორმალური ან გამონაკლისი — რადგან JVM მას სინთეზურ finally ბლოკში ჩდებს." },
    },
    {
      id: "finally", correct: false,
      label: { en: "Add a finally { reader.close(); } block", ka: "finally { reader.close(); } ბლოკი დაამატე" },
      explanation: { en: "finally works but reader could be null if the constructor threw — requiring a null check. try-with-resources handles this automatically.", ka: "finally მუშაობს, მაგრამ reader null შეიძლება იყოს, თუ constructor-მა გამოისვრა — null-შემოწმება სჭირდება. try-with-resources ამას ავტომატურად მართავს." },
    },
    {
      id: "catch-close", correct: false,
      label: { en: "Wrap in try/catch and call close() in catch", ka: "try/catch-ში გახვიე და catch-ში close() გამოიძახე" },
      explanation: { en: "Calling close() only in catch still leaks on the normal path if you forget to also call it after the loop.", ka: "close()-ის მხოლოდ catch-ში გამოძახება კვლავ გაჟონავს ნორმალურ გზაზე, თუ მარყუჟის შემდეგ გამოძახებასაც დაივიწყებ." },
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

export const PUZZLE_DEFS_JAVA: AnyTextPuzzleDef[] = [
  java1, java2, java3, java4, java5, java6, java7, java8, java9, java10,
  java11, java12, java13, java14, java15,
];
