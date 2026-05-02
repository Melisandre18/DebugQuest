export type Language = "en" | "ka";

export interface Translations {
  nav: {
    home: string;
    howItWorks: string;
    modes: string;
    trophies: string;
    play: string;
    sandbox: string;
    back: string;
    feedback: string;
  };

  landing: {
    hero: { title: string; subtitle: string; description: string; cta: string };
    features: {
      learnFirst:   { title: string; desc: string };
      realPrograms: { title: string; desc: string };
      blocksAndCode:{ title: string; desc: string };
      execution:    { title: string; desc: string };
      hints:        { title: string; desc: string };
      adaptive:     { title: string; desc: string };
    };
    howItWorks: {
      title: string; subtitle: string; description: string;
      steps: { read: string; run: string; hypothesise: string; test: string; reflect: string; levelUp: string };
      descriptions: { read: string; run: string; hypothesise: string; test: string; reflect: string; levelUp: string };
    };
    modes:    { title: string; subtitle: string; description: string; start: string };
    concepts: { title: string };
  };

  modes: {
    title: string; subtitle: string; description: string;
    selectLanguage: string; languageDescription: string;
    continue: string; progressTitle: string;
    totalScore: string; puzzlesSolved: string; attempts: string; achievements: string;
  };

  game: {
    goal: string;
    skip: string;
    whyLearnFirst: string;
    whyLearnFirstDesc: string;
    blocks: string;
    code: string;
    playButton: string;
    stepButton: string;
    resetButton: string;
    autoPlayButton: string;
    hint: string;
    hints: string;
    pickFix: string;
    attempts: string;
    concept: string;
    keyIdeas: string;
    quickCheck: string;
    readMoreTitle: string;
    conceptTab: string;
    debugTab: string;

    // API states
    loadingPuzzle: string;
    loadError: string;
    retry: string;

    // Programming language dropdown
    activeProgrammingLang: string;
    programmingLanguage: string;

    // Feedback text
    correctFeedback: string;
    incorrectFeedback: string;
    whatYouLearned: string;
    theBug: string;
    in: string;
    whyItWorks: string;
    whyItWorksDesc: string;
    underlyingConcept: string;
    nextPuzzle: string;
    restoreAndRetry: string;

    // Hints
    spoiler: string;
    locked: string;
    allHintsRevealed: string;
    hintCostNote: string;

    // Strategy panel
    debugStrategy: string;
    strategyTrace: string;
    strategyIsolate: string;
    strategyFix: string;
    needRefresher: string;
    reReadLesson: string;

    // Bug type names
    bugTypes: {
      "wrong-operator": string;
      "off-by-one": string;
      "wrong-condition": string;
      "infinite-loop": string;
      "wrong-init": string;
      "swapped-branches": string;
    };

    // Concept explainers
    conceptExplainers: {
      "wrong-operator": string;
      "off-by-one": string;
      "wrong-condition": string;
      "infinite-loop": string;
      "wrong-init": string;
      "swapped-branches": string;
    };

    // Session & interaction types
    sessionSolved: string;
    chooseExpression: string;
    reorderInstructions: string;
    checkOrder: string;
    orderWrong: string;
    tryAgain: string;
  };

  difficulty: {
    easy:     { title: string; tagline: string; bullets: string[] };
    medium:   { title: string; tagline: string; bullets: string[] };
    hard:     { title: string; tagline: string; bullets: string[] };
    adaptive: { title: string; tagline: string; bullets: string[] };
  };

  trophies: {
    title: string; accuracy: string; avgTime: string; avgHints: string;
    bestScore: string; achievements: string; reset: string; trophyRoom: string;
    pointsUnit: string; subtitle: string; earnMorePoints: string;
    attemptNumber: string; startFirstPuzzle: string;
  };

  messages: { correct: string; incorrect: string; solved: string; points: string };

  language: { english: string; georgian: string };

  common: {
    solved: string; attempts: string; reset: string; cancel: string;
    send: string; rating: string; noProgress: string; noProgressDesc: string;
  };

  landingUI: {
    features: string; builtFor: string; modes: string; fourWays: string;
    whyDebugging: string; difficultyModes: string; languages: string; noSignup: string;
  };

  modesUI: {
    selectLanguage: string; selectLanguageDesc: string;
    yourProgress: string; totalScore: string; puzzlesSolved: string;
  };

  trophiesUI: {
    resetProgress: string; confirmReset: string; accuracy: string;
    avgTime: string; avgHints: string; bestStreak: string;
    noTrophies: string; noTrophiesDesc: string;
    scoreOverTime: string; solvedByDifficulty: string; recentAttempts: string;
    filterByLanguage: string; allLanguages: string;
  };

  feedback: {
    feedbackOnPuzzle: string; sendFeedback: string; feedbackDesc: string;
    puzzleQuestion: string; generalQuestion: string;
  };

  gameUI: {
    whenReady: string; debugInstructions: string;
    goToDebug: string; stepPrefix: string; executionHalted: string;
  };

  buttons: {
    skip: string; play: string; step: string; reset: string;
    auto: string; hint: string; startDebugging: string; pause: string;
  };
}

export const translations: Record<Language, Translations> = {
  en: {
    nav: {
      home: "Home",
      howItWorks: "How it works",
      modes: "Modes",
      trophies: "Trophies",
      play: "Play",
      sandbox: "Editor",
      back: "Back",
      feedback: "Feedback",
    },

    landing: {
      hero: {
        title: "Learn programming by fixing bugs",
        subtitle: "Don't write code, fix it.",
        description:
          "An interactive debugging game that builds real computational thinking. Master Python, JavaScript, C++, and Java through hands-on problem solving.",
        cta: "Start Playing",
      },
      features: {
        learnFirst:    { title: "Learn first, then fix", desc: "Every puzzle opens with a focused 60-second lesson on the underlying concept — then you apply it." },
        realPrograms:  { title: "Real broken programs",  desc: "No syntax drills. Every level is a working program with a real, traceable defect." },
        blocksAndCode: { title: "Blocks ↔ code, in sync", desc: "Toggle visual blocks or read the same program in Python, JavaScript, C++ or Java." },
        execution:     { title: "Step-through execution", desc: "Run, pause and step. Watch variables and control flow change line by line." },
        hints:         { title: "Tiered hints",           desc: "From a gentle nudge to a full explanation — only when you ask." },
        adaptive:      { title: "Adaptive difficulty",    desc: "We track accuracy, time and hints used, and tune the next puzzle." },
      },
      howItWorks: {
        title: "How it works",
        subtitle: "A learning loop, not a lecture.",
        description: "Every puzzle follows the same workflow used by real programmers.",
        steps: { read: "Read", run: "Run", hypothesise: "Hypothesise", test: "Test", reflect: "Reflect", levelUp: "Level up" },
        descriptions: {
          read: "Understand what the program should do.",
          run: "Run and observe behavior.",
          hypothesise: "Choose a possible fix.",
          test: "Apply and re-run.",
          reflect: "Read explanation.",
          levelUp: "Move to a harder puzzle.",
        },
      },
      modes:    { title: "Four ways to play", subtitle: "Pick a mode or let Adaptive decide.", description: "Each mode increases difficulty.", start: "Start" },
      concepts: { title: "Why debugging?" },
    },

    modes: {
      title: "Choose your mode",
      subtitle: "Adaptive picks based on performance.",
      description: "All puzzles support major languages.",
      selectLanguage: "Select your language",
      languageDescription: "Content will match your choice.",
      continue: "Continue",
      progressTitle: "Your progress",
      totalScore: "Total score",
      puzzlesSolved: "Puzzles solved",
      attempts: "Attempts",
      achievements: "Achievements",
    },

    game: {
      goal: "Goal:",
      skip: "Skip",
      whyLearnFirst: "Why learn first?",
      whyLearnFirstDesc: "You need a mental model before debugging effectively.",
      blocks: "Blocks",
      code: "Code",
      playButton: "Play",
      stepButton: "Step",
      resetButton: "Reset",
      autoPlayButton: "Auto",
      hint: "Hint",
      hints: "Hints",
      pickFix: "Pick a fix",
      attempts: "Attempts:",
      concept: "Concept",
      keyIdeas: "Key ideas",
      quickCheck: "Quick check",
      readMoreTitle: "Read More",
      conceptTab: "Learn the concept",
      debugTab: "Debug the program",

      loadingPuzzle: "Loading puzzle…",
      loadError: "Could not load puzzle. Check your connection and try again.",
      retry: "Try again",

      activeProgrammingLang: "Programming language",
      programmingLanguage: "Language",

      correctFeedback: "Correct — bug squashed.",
      incorrectFeedback: "Not yet — read the explanation and try again.",
      whatYouLearned: "What you just learned",
      theBug: "The bug:",
      in: "in",
      whyItWorks: "Why this fix works:",
      whyItWorksDesc: "Stepping through the fixed program shows variables reach the expected state and produce the required output.",
      underlyingConcept: "Underlying concept:",
      nextPuzzle: "Next puzzle",
      restoreAndRetry: "Restore original & try again",

      spoiler: "Spoiler",
      locked: "— locked —",
      allHintsRevealed: "All hints revealed",
      hintCostNote: "Each hint lowers your score for this puzzle. Solve with as few as possible.",

      debugStrategy: "Debugging strategy",
      strategyTrace:   "1. Trace — Step through and watch how variables change.",
      strategyIsolate: "2. Isolate — Find the first moment reality diverges from expectation.",
      strategyFix:     "3. Fix — Apply the smallest change that addresses the actual cause.",
      needRefresher: "Need a refresher?",
      reReadLesson: "Re-read the lesson",

      bugTypes: {
        "wrong-operator":   "wrong operator",
        "off-by-one":       "off-by-one error",
        "wrong-condition":  "wrong condition",
        "infinite-loop":    "non-terminating loop",
        "wrong-init":       "incorrect initialisation",
        "swapped-branches": "wrong execution order",
      },
      conceptExplainers: {
        "wrong-operator":   "Comparison operators define which inputs pass the condition. Off-by-one operator choices ripple through the entire branch.",
        "off-by-one":       "Loop bounds are inclusive/exclusive in different languages. Always trace the first and last iteration to verify boundaries.",
        "wrong-condition":  "When multiple conditions overlap, the order of checks matters. Specific cases must come before general ones.",
        "infinite-loop":    "A while-loop only terminates if the loop variable moves toward making the condition false on every iteration.",
        "wrong-init":       "The initial value of an accumulator (sum, max, min, count) defines what the loop is actually computing.",
        "swapped-branches": "Programs execute statements in order. Ordering itself is logic.",
      },

      sessionSolved: "Solved this session: {n}",
      chooseExpression: "Choose the correct expression",
      reorderInstructions: "Drag the blocks into the correct order",
      checkOrder: "Check order",
      orderWrong: "Wrong order — try again",
      tryAgain: "Try again",
    },

    difficulty: {
      easy:     { title: "Easy",     tagline: "Foundations",      bullets: ["Core concepts", "Guided hints", "Blocks only"] },
      medium:   { title: "Medium",   tagline: "Intermediate",     bullets: ["Real patterns", "Fewer hints", "Blocks & code"] },
      hard:     { title: "Hard",     tagline: "Advanced",         bullets: ["Tough bugs", "Minimal hints", "Code only"] },
      adaptive: { title: "Adaptive", tagline: "Smart difficulty", bullets: ["Learns from you", "Auto-adjusted"] },
    },

    trophies: {
      title: "Your Trophies",
      accuracy: "Accuracy",
      avgTime: "Avg. time",
      avgHints: "Avg. hints",
      bestScore: "Best score",
      achievements: "Achievements",
      reset: "Reset Progress",
      trophyRoom: "Trophy Room",
      pointsUnit: "pts",
      subtitle: "Your debugging stats.",
      earnMorePoints: "Earn more points",
      attemptNumber: "Attempt #",
      startFirstPuzzle: "Start your first puzzle",
    },

    messages: { correct: "Puzzle solved.", incorrect: "Not quite — try again.", solved: "Solved", points: "points" },
    language: { english: "English", georgian: "Georgian" },

    common: {
      solved: "Solved", attempts: "Attempts", reset: "Reset", cancel: "Cancel",
      send: "Send", rating: "Rating", noProgress: "No progress yet", noProgressDesc: "Solve your first puzzle.",
    },

    landingUI: {
      features: "Features", builtFor: "Built for understanding.", modes: "Modes",
      fourWays: "Four ways to play", whyDebugging: "Why debugging?",
      difficultyModes: "4 modes", languages: "Python · JS · C++ · Java", noSignup: "No signup required",
    },

    modesUI: {
      selectLanguage: "Select your language",
      selectLanguageDesc: "The lesson examples will match your choice.",
      yourProgress: "Your progress",
      totalScore: "Total score",
      puzzlesSolved: "Puzzles solved",
    },

    trophiesUI: {
      resetProgress: "Reset Progress", confirmReset: "Are you sure?",
      accuracy: "Accuracy", avgTime: "Avg. time", avgHints: "Avg. hints",
      bestStreak: "Best streak", noTrophies: "No trophies yet", noTrophiesDesc: "Solve your first puzzle.",
      scoreOverTime: "Score over time", solvedByDifficulty: "Solved by difficulty", recentAttempts: "Recent attempts",
      filterByLanguage: "Language", allLanguages: "All languages",
    },

    feedback: {
      feedbackOnPuzzle: "Feedback on this puzzle",
      sendFeedback: "Send feedback",
      feedbackDesc: "Share your thoughts.",
      puzzleQuestion: "Was it clear?",
      generalQuestion: "Any feedback?",
    },

    gameUI: {
      whenReady: "When you're ready",
      debugInstructions: "Head to the Debug tab, step through the program, and pick the fix that addresses the root cause.",
      goToDebug: "Go to Debug tab",
      stepPrefix: "Step",
      executionHalted: "halted (too many steps)",
    },

    buttons: {
      skip: "Skip", play: "Play", step: "Step", reset: "Reset",
      auto: "Auto", hint: "Reveal next hint", startDebugging: "Start debugging", pause: "Pause",
    },
  },

  // ── Georgian ──────────────────────────────────────────────────────────────
  ka: {
    nav: {
      home: "მთავარი",
      howItWorks: "როგორ მუშაობს",
      modes: "რეჟიმები",
      trophies: "ტროფეები",
      play: "თამაში",
      sandbox: "რედაქტორი",
      back: "უკან",
      feedback: "უკუკავშირი",
    },

    landing: {
      hero: {
        title: "ისწავლე პროგრამირება შეცდომების გამოსწორებით",
        subtitle: "ნუ დაწერ კოდს — გამოასწორე იგი.",
        description:
          "ინტერაქტიული დებაგინგის თამაში, რომელიც ავითარებს ნამდვილ გამოთვლით აზროვნებას. დაეუფლე Python-ს, JavaScript-ს, C++-ს და Java-ს პრაქტიკული პრობლემების გადაჭრით.",
        cta: "თამაშის დაწყება",
      },
      features: {
        learnFirst:    { title: "ჯერ ისწავლე, შემდეგ გამოასწორე", desc: "ყოველი ამოცანა იხსნება 60-წამიანი გაკვეთილით ძირითადი კონცეფციის შესახებ — შემდეგ ახარება." },
        realPrograms:  { title: "ნამდვილი გატეხილი პროგრამები",   desc: "სინტაქსური სავარჯიშოები არ არის. ყოველი დონე სამუშაო პროგრამაა ნამდვილი, თვალსაჩინო დეფექტით." },
        blocksAndCode: { title: "ბლოკები ↔ კოდი, სინქრონულად",   desc: "გადართე ვიზუალური ბლოკები ან წაიკითხე იგივე პროგრამა Python-ში, JavaScript-ში, C++-ში ან Java-ში." },
        execution:     { title: "ნაბიჯ-ნაბიჯ შესრულება",          desc: "გაუშვი, შეაჩერე და ნაბიჯი გადადგი. დააკვირდი, როგორ იცვლება ცვლადები სტრიქონ-სტრიქონ." },
        hints:         { title: "დახარისხებული მინიშნებები",        desc: "მსუბუქი გამიჯვნიდან სრულ განმარტებამდე — მხოლოდ მოთხოვნის შემთხვევაში." },
        adaptive:      { title: "ადაპტური სირთულე",                desc: "სისტემა ადევნებს თვალს სიზუსტეს, დროსა და გამოყენებულ მინიშნებებს და ამოარჩევს შემდეგ ამოცანას." },
      },
      howItWorks: {
        title: "როგორ მუშაობს",
        subtitle: "სასწავლო მარყუჟი, არა ლექცია.",
        description: "ყოველი ამოცანა მიჰყვება იმავე სამუშაო პროცედურას, რასაც ნამდვილი პროგრამისტები იყენებენ.",
        steps: { read: "წაიკითხე", run: "გაუშვი", hypothesise: "ჰიპოთეზა", test: "ტესტი", reflect: "გააანალიზე", levelUp: "ასწიე დონე" },
        descriptions: {
          read: "გაიგე, რა უნდა გააკეთოს პროგრამამ.",
          run: "გაუშვი და დააკვირდი ქცევას.",
          hypothesise: "შეარჩიე შესაძლო გამოსწორება.",
          test: "გამოიყენე და ხელახლა გაუშვი.",
          reflect: "წაიკითხე განმარტება.",
          levelUp: "გადადი უფრო რთულ ამოცანაზე.",
        },
      },
      modes:    { title: "ოთხი სათამაშო გზა", subtitle: "შეარჩიე რეჟიმი ან ნება მიეც ადაპტურს.", description: "ყოველი რეჟიმი სირთულეს ზრდის.", start: "დაწყება" },
      concepts: { title: "რატომ დებაგინგი?" },
    },

    modes: {
      title: "შეარჩიე რეჟიმი",
      subtitle: "ადაპტური ირჩევს შესრულებაზე დაყრდნობით.",
      description: "ყველა ამოცანა მხარს უჭერს ძირითად ენებს.",
      selectLanguage: "შეარჩიე ენა",
      languageDescription: "კოდის მაგალითები შეესაბამება შენს არჩევანს.",
      continue: "გაგრძელება",
      progressTitle: "შენი პროგრესი",
      totalScore: "ჯამური ქულა",
      puzzlesSolved: "ამოხსნილი ამოცანები",
      attempts: "მცდელობები",
      achievements: "მიღწევები",
    },

    game: {
      goal: "მიზანი:",
      skip: "გამოტოვება",
      whyLearnFirst: "რატომ ჯერ სწავლა?",
      whyLearnFirstDesc: "ეფექტური დებაგინგისთვის ჭირდება მენტალური მოდელი.",
      blocks: "ბლოკები",
      code: "კოდი",
      playButton: "გაშვება",
      stepButton: "ნაბიჯი",
      resetButton: "განახლება",
      autoPlayButton: "ავტო",
      hint: "მინიშნება",
      hints: "მინიშნებები",
      pickFix: "შეარჩიე გამოსწორება",
      attempts: "მცდელობები:",
      concept: "კონცეფცია",
      keyIdeas: "ძირითადი იდეები",
      quickCheck: "სწრაფი შემოწმება",
      readMoreTitle: "მეტის წაკითხვა",
      conceptTab: "ისწავლე კონცეფცია",
      debugTab: "გამოასწორე პროგრამა",

      loadingPuzzle: "ამოცანა იტვირთება…",
      loadError: "ამოცანის ჩატვირთვა ვერ მოხერხდა. შეამოწმე კავშირი და სცადე ხელახლა.",
      retry: "ხელახლა სცადე",

      activeProgrammingLang: "პროგრამირების ენა",
      programmingLanguage: "ენა",

      correctFeedback: "სწორია — შეცდომა გამოსწორდა!",
      incorrectFeedback: "ჯერ კიდევ ვერ — წაიკითხე განმარტება და სცადე ხელახლა.",
      whatYouLearned: "რა ისწავლე",
      theBug: "შეცდომა:",
      in: "",
      whyItWorks: "რატომ მუშაობს ეს გამოსწორება:",
      whyItWorksDesc: "გამოსწორებული პროგრამის ნაბიჯ-ნაბიჯ გავლა გვიჩვენებს, რომ ცვლადები სასურველ მდგომარეობას აღწევენ.",
      underlyingConcept: "ძირითადი კონცეფცია:",
      nextPuzzle: "შემდეგი ამოცანა",
      restoreAndRetry: "აღადგინე ორიგინალი და სცადე ხელახლა",

      spoiler: "სპოილერი",
      locked: "— დაბლოკილია —",
      allHintsRevealed: "ყველა მინიშნება გახსნილია",
      hintCostNote: "ყოველი მინიშნება ამ ამოცანის ქულას ამცირებს. გამოასწორე რაც შეიძლება ნაკლები მინიშნებით.",

      debugStrategy: "დებაგინგის სტრატეგია",
      strategyTrace:   "1. თვალყური — ნაბიჯ-ნაბიჯ გაიარე და დააკვირდი ცვლადებს.",
      strategyIsolate: "2. იზოლაცია — იპოვე პირველი მომენტი, სადაც სინამდვილე მოლოდინს განეშორება.",
      strategyFix:     "3. გამოსწორება — გამოიყენე ყველაზე მინიმალური ცვლილება, რომელიც ნამდვილ მიზეზს ეხება.",
      needRefresher: "გჭირდება განმეორება?",
      reReadLesson: "ხელახლა წაიკითხე გაკვეთილი",

      bugTypes: {
        "wrong-operator":   "არასწორი ოპერატორი",
        "off-by-one":       "off-by-one შეცდომა",
        "wrong-condition":  "არასწორი პირობა",
        "infinite-loop":    "უსასრულო მარყუჟი",
        "wrong-init":       "არასწორი ინიციალიზაცია",
        "swapped-branches": "შეცვლილი შესრულების თანმიმდევრობა",
      },
      conceptExplainers: {
        "wrong-operator":   "შედარების ოპერატორები განსაზღვრავს, რომელი მნიშვნელობები გაივლის პირობას. ოფ-ბაი-ვან ოპერატორის არჩევანი მთელ ტოტზე ვრცელდება.",
        "off-by-one":       "მარყუჟის საზღვრები ენის მიხედვით ინკლუზიური ან ექსკლუზიურია. ყოველთვის გაიარე პირველი და ბოლო იტერაცია.",
        "wrong-condition":  "როდესაც მრავალი პირობა გადაფარავს ერთმანეთს, შემოწმებათა თანმიმდევრობა მნიშვნელოვანია. კონკრეტული შემთხვევები ზოგადებამდე.",
        "infinite-loop":    "while-მარყუჟი მხოლოდ მაშინ სრულდება, როდესაც მარყუჟის ცვლადი ყოველ იტერაციაზე პირობის false-ად გახდისკენ მიდის.",
        "wrong-init":       "ა კუმულატორის (ჯამი, მაქსიმუმი, მინიმუმი, დათვლა) საწყისი მნიშვნელობა განსაზღვრავს, რას ითვლის მარყუჟი.",
        "swapped-branches": "პროგრამები ბრძანებებს თანმიმდევრობით ასრულებენ. თანმიმდევრობა თავად ლოგიკაა.",
      },

      sessionSolved: "ამ სესიაში ამოხსნილი: {n}",
      chooseExpression: "აირჩიე სწორი გამოთქმა",
      reorderInstructions: "ბლოკები სწორი თანმიმდევრობით დააწყე",
      checkOrder: "თანმიმდევრობის შემოწმება",
      orderWrong: "არასწორი თანმიმდევრობა — კვლავ სცადე",
      tryAgain: "კვლავ სცადე",
    },

    difficulty: {
      easy:     { title: "მარტივი",  tagline: "საფუძვლები",    bullets: ["ძირითადი კონცეფციები", "კონკრეტული მინიშნებები", "მხოლოდ ბლოკები"] },
      medium:   { title: "საშუალო", tagline: "შუალედური",     bullets: ["ნამდვილი ნიმუშები", "ნაკლები მინიშნება", "ბლოკები და კოდი"] },
      hard:     { title: "რთული",   tagline: "მოწინავე",      bullets: ["რთული შეცდომები", "მინიმალური მინიშნება", "მხოლოდ კოდი"] },
      adaptive: { title: "ადაპტური",tagline: "ჭკვიანი სირთულე",bullets: ["გთვლის", "ავტომატურად ადაპტირება"] },
    },

    trophies: {
      title: "შენი ტროფეები",
      accuracy: "სიზუსტე",
      avgTime: "საშ. დრო",
      avgHints: "საშ. მინიშნება",
      bestScore: "საუკეთესო ქულა",
      achievements: "მიღწევები",
      reset: "პროგრესის განულება",
      trophyRoom: "ტროფეების ოთახი",
      pointsUnit: "ქულა",
      subtitle: "შენი დებაგინგის სტატისტიკა.",
      earnMorePoints: "მეტი ქულის მიღება",
      attemptNumber: "მცდელობა #",
      startFirstPuzzle: "დაიწყე პირველი ამოცანა",
    },

    messages: {
      correct: "ამოცანა ამოხსნილია.",
      incorrect: "ჯერ სწორი არ არის — სცადე ხელახლა.",
      solved: "ამოხსნილია",
      points: "ქულა",
    },

    language: { english: "English", georgian: "ქართული" },

    common: {
      solved: "ამოხსნილია",
      attempts: "მცდელობები",
      reset: "განახლება",
      cancel: "გაუქმება",
      send: "გაგზავნა",
      rating: "შეფასება",
      noProgress: "პროგრესი ჯერ არ არის",
      noProgressDesc: "ამოხსენი შენი პირველი ამოცანა.",
    },

    landingUI: {
      features: "ფუნქციები",
      builtFor: "შექმნილია გასაგებლად.",
      modes: "რეჟიმები",
      fourWays: "ოთხი სათამაშო გზა",
      whyDebugging: "რატომ დებაგინგი?",
      difficultyModes: "4 რეჟიმი",
      languages: "Python · JS · C++ · Java",
      noSignup: "რეგისტრაცია არ არის საჭირო",
    },

    modesUI: {
      selectLanguage: "შეარჩიე პროგრამირების ენა",
      selectLanguageDesc: "კოდის მაგალითები შეესაბამება შენს არჩევანს.",
      yourProgress: "შენი პროგრესი",
      totalScore: "ჯამური ქულა",
      puzzlesSolved: "ამოხსნილი ამოცანები",
    },

    trophiesUI: {
      resetProgress: "პროგრესის განულება",
      confirmReset: "დარწმუნებული ხარ?",
      accuracy: "სიზუსტე",
      avgTime: "საშ. დრო",
      avgHints: "საშ. მინიშნება",
      bestStreak: "საუკეთესო სერია",
      noTrophies: "ტროფეები ჯერ არ არის",
      noTrophiesDesc: "ამოხსენი შენი პირველი ამოცანა.",
      scoreOverTime: "ქულა დროში",
      solvedByDifficulty: "ამოხსნილი სირთულის მიხედვით",
      recentAttempts: "ბოლო მცდელობები",
      filterByLanguage: "ენა",
      allLanguages: "ყველა ენა",
    },

    feedback: {
      feedbackOnPuzzle: "ამოცანის შეფასება",
      sendFeedback: "გაგზავნა",
      feedbackDesc: "გვიზიარე შენი მოსაზრება.",
      puzzleQuestion: "გასაგები იყო?",
      generalQuestion: "გაქვს შენიშვნა?",
    },

    gameUI: {
      whenReady: "როცა მზად ხარ",
      debugInstructions: "გადადი Debug ჩანართზე, ნაბიჯ-ნაბიჯ გაიარე პროგრამა და შეარჩიე გამოსწორება, რომელიც ძირეულ მიზეზს ეხება.",
      goToDebug: "Debug ჩანართზე გადასვლა",
      stepPrefix: "ნაბიჯი",
      executionHalted: "შეჩერებულია (ძალიან ბევრი ნაბიჯი)",
    },

    buttons: {
      skip: "გამოტოვება",
      play: "გაშვება",
      step: "ნაბიჯი",
      reset: "განახლება",
      auto: "ავტო",
      hint: "შემდეგი მინიშნების გახსნა",
      startDebugging: "დებაგინგის დაწყება",
      pause: "პაუზა",
    },
  },
};

export const getTranslation = (language: Language): Translations => translations[language];
