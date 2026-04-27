// Java puzzle definitions for DebugQuest.
// 10 puzzles: java-1 through java-10. Mix of fill-blank and pick-fix interactions.

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
];
