/* ==================== APP STATE ====================
   Version: 5.6
   Last Updated: 2026-02-24
   Refactored: ES6 Modules
====================================================================== */

export const AppState = {
    showRetryButton: false,
    quiz: {
        current: 0,
        points: 0,
        testSet: [],
        results: [],
        selectedCategory: 'all',
        currentOptionsSigns: [],
        savedTestSet: null,
        showRetry: true,
        isProcessing: false,
        hintsUsed: 0,
        currentAttempt: 0
    },
    timing: {
        questionStartTime: 0,
        questionTimes: [],
        totalStartTime: 0
    },
    flashcard: {
        mode: false,
        answerShown: false,
        showRetry: false
    },
    settings: {
        interfaceLang: 'en',
        quizLang: 'en',
        helperLang: 'en',
        showingTranslation: false
    }
};

// Ad configuration (for future monetization)
export const AD_CONFIG = {
    enabled: false,
    showAfterQuestions: 5,
    interstitialDelay: 0
};
