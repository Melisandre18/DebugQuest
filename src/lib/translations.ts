export type Language = "en" | "ka";

export interface Translations {
  // Navigation
  nav: {
    home: string;
    howItWorks: string;
    modes: string;
    trophies: string;
    play: string;
    back: string;
    feedback: string;
  };

  // Landing page
  landing: {
    hero: {
      title: string;
      subtitle: string;
      description: string;
      cta: string;
    };
    features: {
      learnFirst: {
        title: string;
        desc: string;
      };
      realPrograms: {
        title: string;
        desc: string;
      };
      blocksAndCode: {
        title: string;
        desc: string;
      };
      execution: {
        title: string;
        desc: string;
      };
      hints: {
        title: string;
        desc: string;
      };
      adaptive: {
        title: string;
        desc: string;
      };
    };
    howItWorks: {
      title: string;
      subtitle: string;
      description: string;
      steps: {
        read: string;
        run: string;
        hypothesise: string;
        test: string;
        reflect: string;
        levelUp: string;
      };
      descriptions: {
        read: string;
        run: string;
        hypothesise: string;
        test: string;
        reflect: string;
        levelUp: string;
      };
    };
    modes: {
      title: string;
      subtitle: string;
      description: string;
      start: string;
    };
    concepts: {
      title: string;
    };
  };

  // Modes page
  modes: {
    title: string;
    subtitle: string;
    description: string;
    selectLanguage: string;
    languageDescription: string;
    continue: string;
    progressTitle: string;
    totalScore: string;
    puzzlesSolved: string;
    attempts: string;
    achievements: string;
  };

  // Game page
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
    pickFix: string;
    attempts: string;
    concept: string;
    keyIdeas: string;
    quickCheck: string;
    readMoreTitle: string;
    conceptTab: string;
    debugTab: string;
  };

  // Difficulty levels
  difficulty: {
    easy: {
      title: string;
      tagline: string;
      bullets: string[];
    };
    medium: {
      title: string;
      tagline: string;
      bullets: string[];
    };
    hard: {
      title: string;
      tagline: string;
      bullets: string[];
    };
    adaptive: {
      title: string;
      tagline: string;
      bullets: string[];
    };
  };

  // Trophies page
  trophies: {
    title: string;
    accuracy: string;
    avgTime: string;
    avgHints: string;
    bestScore: string;
    achievements: string;
    reset: string;
    trophyRoom: string;
    pointsUnit: string;
    subtitle: string;
    earnMorePoints: string;
    attemptNumber: string;
    startFirstPuzzle: string;
  };

  // Messages
  messages: {
    correct: string;
    incorrect: string;
    solved: string;
    points: string;
  };

  // Language
  language: {
    english: string;
    georgian: string;
  };

  // Common UI
  common: {
    solved: string;
    attempts: string;
    reset: string;
    cancel: string;
    send: string;
    rating: string;
    noProgress: string;
    noProgressDesc: string;
  };

  // Landing specific
  landingUI: {
    features: string;
    builtFor: string;
    modes: string;
    fourWays: string;
    whyDebugging: string;
    difficultyModes: string;
    languages: string;
    noSignup: string;
  };

  // Modes specific
  modesUI: {
    selectLanguage: string;
    selectLanguageDesc: string;
    yourProgress: string;
    totalScore: string;
    puzzlesSolved: string;
  };

  // Trophies specific
  trophiesUI: {
    resetProgress: string;
    confirmReset: string;
    accuracy: string;
    avgTime: string;
    avgHints: string;
    bestStreak: string;
    noTrophies: string;
    noTrophiesDesc: string;
    scoreOverTime: string;
    solvedByDifficulty: string;
    recentAttempts: string;
  };

  // Feedback dialog
  feedback: {
    feedbackOnPuzzle: string;
    sendFeedback: string;
    feedbackDesc: string;
    puzzleQuestion: string;
    generalQuestion: string;
  };

  // Game specific
  gameUI: {
    whenReady: string;
    debugInstructions: string;
    goToDebug: string;
    stepPrefix: string;
    executionHalted: string;
  };

  buttons: {
    skip: string;
    play: string;
    step: string;
    reset: string;
    auto: string;
    hint: string;
    startDebugging: string;
    pause: string;
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
        learnFirst: {
          title: "Learn first, then fix",
          desc: "Every puzzle opens with a focused 60-second lesson on the underlying concept — then you apply it.",
        },
        realPrograms: {
          title: "Real broken programs",
          desc: "No syntax drills. Every level is a working program with a real, traceable defect.",
        },
        blocksAndCode: {
          title: "Blocks ↔ code, in sync",
          desc: "Toggle visual blocks or read the same program in Python, JavaScript, C++ or Java.",
        },
        execution: {
          title: "Step-through execution",
          desc: "Run, pause and step. Watch variables and control flow change line by line.",
        },
        hints: {
          title: "Tiered hints",
          desc: "From a gentle nudge to a full explanation — only when you ask.",
        },
        adaptive: {
          title: "Adaptive difficulty",
          desc: "We track accuracy, time and hints used, and tune the next puzzle.",
        },
      },
      howItWorks: {
        title: "How it works",
        subtitle: "A learning loop, not a lecture.",
        description:
          "Every puzzle follows the same workflow used by real programmers.",
        steps: {
          read: "Read",
          run: "Run",
          hypothesise: "Hypothesise",
          test: "Test",
          reflect: "Reflect",
          levelUp: "Level up",
        },
        descriptions: {
          read: "Understand what the program should do.",
          run: "Run and observe behavior.",
          hypothesise: "Choose a possible fix.",
          test: "Apply and re-run.",
          reflect: "Read explanation.",
          levelUp: "Move to a harder puzzle.",
        },
      },
      modes: {
        title: "Four ways to play",
        subtitle: "Pick a mode or let Adaptive decide.",
        description: "Each mode increases difficulty.",
        start: "Start",
      },
      concepts: {
        title: "Why debugging?",
      },
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
      whyLearnFirstDesc:
        "You need a mental model before debugging effectively.",
      blocks: "Blocks",
      code: "Code",
      playButton: "Play",
      stepButton: "Step",
      resetButton: "Reset",
      autoPlayButton: "Auto",
      hint: "Reveal next hint",
      pickFix: "Pick a fix",
      attempts: "Attempts:",
      concept: "Concept",
      keyIdeas: "Key ideas",
      quickCheck: "Quick check",
      readMoreTitle: "Read More",
      conceptTab: "Learn",
      debugTab: "Debug",
    },

    difficulty: {
      easy: {
        title: "Easy",
        tagline: "Foundations",
        bullets: ["Core concepts", "Guided hints", "Blocks only"],
      },
      medium: {
        title: "Medium",
        tagline: "Intermediate",
        bullets: ["Real patterns", "Fewer hints", "Blocks & code"],
      },
      hard: {
        title: "Hard",
        tagline: "Advanced",
        bullets: ["Tough bugs", "Minimal hints", "Code only"],
      },
      adaptive: {
        title: "Adaptive",
        tagline: "Smart difficulty",
        bullets: ["Learns from you", "Auto-adjusted"],
      },
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

    messages: {
      correct: "Puzzle solved.",
      incorrect: "Try again.",
      solved: "Solved",
      points: "points",
    },

    language: {
      english: "English",
      georgian: "Georgian",
    },

    common: {
      solved: "Solved",
      attempts: "Attempts",
      reset: "Reset",
      cancel: "Cancel",
      send: "Send",
      rating: "Rating",
      noProgress: "No progress yet",
      noProgressDesc: "Solve your first puzzle.",
    },

    landingUI: {
      features: "Features",
      builtFor: "Built for understanding.",
      modes: "Modes",
      fourWays: "Four ways to play",
      whyDebugging: "Why debugging?",
      difficultyModes: "4 modes",
      languages: "Python · JS · C++ · Java",
      noSignup: "No signup required",
    },

    modesUI: {
      selectLanguage: "Select your language",
      selectLanguageDesc: "Content matches your language.",
      yourProgress: "Your progress",
      totalScore: "Total score",
      puzzlesSolved: "Puzzles solved",
    },

    trophiesUI: {
      resetProgress: "Reset Progress",
      confirmReset: "Are you sure?",
      accuracy: "Accuracy",
      avgTime: "Avg. time",
      avgHints: "Avg. hints",
      bestStreak: "Best streak",
      noTrophies: "No trophies yet",
      noTrophiesDesc: "Solve your first puzzle.",
      scoreOverTime: "Score over time",
      solvedByDifficulty: "Solved by difficulty",
      recentAttempts: "Recent attempts",
    },

    feedback: {
      feedbackOnPuzzle: "Feedback on this puzzle",
      sendFeedback: "Send feedback",
      feedbackDesc: "Share your thoughts.",
      puzzleQuestion: "Was it clear?",
      generalQuestion: "Any feedback?",
    },

    gameUI: {
      whenReady: "When ready",
      debugInstructions: "Run and fix the bug.",
      goToDebug: "Go to Debug",
      stepPrefix: "step",
      executionHalted: "halted",
    },

    buttons: {
      skip: "Skip",
      play: "Play",
      step: "Step",
      reset: "Reset",
      auto: "Auto",
      hint: "Hint",
      startDebugging: "Start debugging",
      pause: "Pause",
    },
  },
// TODO: REFACTOR: The Georgian translations are currently placeholders and need to be updated.
  ka: {
    nav: {
      home: "მთავარი",
      howItWorks: "როგორ მუშაობს",
      modes: "რეჟიმები",
      trophies: "ტროფეები",
      play: "დაწყება",
      back: "უკან",
      feedback: "უკუკავშირი",
    },

    landing: {
      hero: {
        title: "ისწავლე პროგრამირება შეცდომების გასწორებით",
        subtitle: "კოდი არ დაწერო — გამოასწორე იგი.",
        description:
          "ინტერაქტიული დიბაგინგის თამაში, რომელიც ავითარებს ალგორითმულ აზროვნებას.",
        cta: "დაწყება",
      },
      features: {
        learnFirst: {
          title: "ჯერ ისწავლე",
          desc: "მოკლე გაკვეთილი და შემდეგ პრაქტიკა.",
        },
        realPrograms: {
          title: "რეალური პროგრამები",
          desc: "ნამდვილი შეცდომები რეალურ კოდში.",
        },
        blocksAndCode: {
          title: "ბლოკები და კოდი",
          desc: "აირჩიე ფორმატი.",
        },
        execution: {
          title: "ნაბიჯები",
          desc: "დააკვირდი შესრულებას.",
        },
        hints: {
          title: "მინიშნებები",
          desc: "მხოლოდ საჭიროებისას.",
        },
        adaptive: {
          title: "ადაპტური",
          desc: "სირთულე ავტომატურად იცვლება.",
        },
      },
      howItWorks: {
        title: "როგორ მუშაობს",
        subtitle: "პრაქტიკული მიდგომა",
        description: "რეალური დეველოპერის პროცესი.",
        steps: {
          read: "წაკითხვა",
          run: "გაშვება",
          hypothesise: "ჰიპოთეზა",
          test: "ტესტი",
          reflect: "ანალიზი",
          levelUp: "დონე",
        },
        descriptions: {
          read: "გაიგე მიზანი.",
          run: "დააკვირდი.",
          hypothesise: "აირჩიე გამოსწორება.",
          test: "გამოიყენე.",
          reflect: "ისწავლე.",
          levelUp: "გააგრძელე.",
        },
      },
      modes: {
        title: "რეჟიმები",
        subtitle: "აირჩიე დონე",
        description: "სირთულე იზრდება.",
        start: "დაწყება",
      },
      concepts: {
        title: "რატომ დიბაგინგი?",
      },
    },

    modes: {
      title: "აირჩიე რეჟიმი",
      subtitle: "ადაპტური არჩევანი",
      description: "ყველა ენა მხარდაჭერილია.",
      selectLanguage: "აირჩიე ენა",
      languageDescription: "შინაარსი შეიცვლება.",
      continue: "გაგრძელება",
      progressTitle: "პროგრესი",
      totalScore: "ქულა",
      puzzlesSolved: "ამოხსნილი",
      attempts: "ცდები",
      achievements: "მიღწევები",
    },

    game: {
      goal: "მიზანი:",
      skip: "გამოტოვება",
      whyLearnFirst: "რატომ სწავლა?",
      whyLearnFirstDesc: "გჭირდება სწორი გაგება.",
      blocks: "ბლოკები",
      code: "კოდი",
      playButton: "გაშვება",
      stepButton: "ნაბიჯი",
      resetButton: "განულება",
      autoPlayButton: "ავტო",
      hint: "მინიშნება",
      pickFix: "აირჩიე",
      attempts: "ცდები:",
      concept: "კონცეფცია",
      keyIdeas: "იდეები",
      quickCheck: "შემოწმება",
      readMoreTitle: "მეტი",
      conceptTab: "სწავლა",
      debugTab: "დიბაგინგი",
    },

    difficulty: {
      easy: { title: "მარტივი", tagline: "საფუძვლები", bullets: ["კონცეფციები"] },
      medium: { title: "საშუალო", tagline: "შუალედი", bullets: ["ნიმუშები"] },
      hard: { title: "რთული", tagline: "მოწინავე", bullets: ["გამოწვევა"] },
      adaptive: { title: "ადაპტური", tagline: "ჭკვიანი", bullets: ["ავტო"] },
    },

    trophies: {
      title: "ტროფეები",
      accuracy: "სიზუსტე",
      avgTime: "დრო",
      avgHints: "მინიშნებები",
      bestScore: "საუკეთესო",
      achievements: "მიღწევები",
      reset: "განულება",
      trophyRoom: "ტროფეები",
      pointsUnit: "ქულა",
      subtitle: "შენი სტატისტიკა",
      earnMorePoints: "მეტი ქულა",
      attemptNumber: "ცდა #",
      startFirstPuzzle: "დაიწყე",
    },

    messages: {
      correct: "ამოხსნილია",
      incorrect: "სცადე თავიდან",
      solved: "მოგვარებულია",
      points: "ქულა",
    },

    language: {
      english: "English",
      georgian: "ქართული",
    },

    common: {
      solved: "ამოხსნილი",
      attempts: "ცდები",
      reset: "განულება",
      cancel: "გაუქმება",
      send: "გაგზავნა",
      rating: "შეფასება",
      noProgress: "პროგრესი არ არის",
      noProgressDesc: "დაიწყე პირველი ამოცანა",
    },

    landingUI: {
      features: "ფუნქციები",
      builtFor: "გაგებისთვის",
      modes: "რეჟიმები",
      fourWays: "ოთხი გზა",
      whyDebugging: "რატომ?",
      difficultyModes: "4 რეჟიმი",
      languages: "Python · JS · C++ · Java",
      noSignup: "რეგისტრაცია არ არის საჭირო",
    },

    modesUI: {
      selectLanguage: "ენა",
      selectLanguageDesc: "არჩეული ენა",
      yourProgress: "პროგრესი",
      totalScore: "ქულა",
      puzzlesSolved: "ამოხსნილი",
    },

    trophiesUI: {
      resetProgress: "განულება",
      confirmReset: "დარწმუნებული ხარ?",
      accuracy: "სიზუსტე",
      avgTime: "დრო",
      avgHints: "მინიშნებები",
      bestStreak: "სერია",
      noTrophies: "არ არის",
      noTrophiesDesc: "დაიწყე",
      scoreOverTime: "ქულა დროში",
      solvedByDifficulty: "სირთულის მიხედვით",
      recentAttempts: "ბოლო ცდები",
    },

    feedback: {
      feedbackOnPuzzle: "უკუკავშირი",
      sendFeedback: "გაგზავნა",
      feedbackDesc: "გვითხარი აზრი",
      puzzleQuestion: "გასაგები იყო?",
      generalQuestion: "შენიშვნა?",
    },

    gameUI: {
      whenReady: "როცა მზად ხარ",
      debugInstructions: "გაუშვი და გამოასწორე",
      goToDebug: "Debug",
      stepPrefix: "ნაბიჯი",
      executionHalted: "შეჩერებულია",
    },

    buttons: {
      skip: "გამოტოვება",
      play: "გაშვება",
      step: "ნაბიჯი",
      reset: "განულება",
      auto: "ავტო",
      hint: "მინიშნება",
      startDebugging: "დაწყება",
      pause: "პაუზა",
    },
  },
};

export const getTranslation = (language: Language): Translations => {
  return translations[language];
};