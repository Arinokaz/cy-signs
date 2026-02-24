/* ==================== CYPRUS ROAD SIGNS - MAIN ENTRY POINT ====================
   Version: 3.0
   Last Updated: 2026-02-24
   Refactored: ES6 Modules
====================================================================== */

// Import modules
import { AppState } from './state.js';
import { detectAndSetLanguage, loadSavedLanguagePrefs, updateUI } from './i18n.js';
import { setupServiceWorker, showScreen } from './ui.js';
import { setCat, start, backToMenu, retry, toggleTranslate, toggleHints } from './quiz.js';
import { startFlashcard, showFlashcardAnswer, handleFlashcardAnswer } from './flashcard.js';
import { showReference, filterReference } from './reference.js';
import { shareApp } from './feedback.js';

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', () => {
    // Reset retry button state
    AppState.showRetryButton = false;

    // Detect and set language (from URL, localStorage, or browser)
    detectAndSetLanguage();
    
    // Load saved language preferences
    loadSavedLanguagePrefs();

    // Update UI
    updateUI();

    // Setup Service Worker
    setupServiceWorker();

    // Setup event listeners
    setupEventListeners();

    // Hide loading spinner, show start screen
    setTimeout(() => {
        if (typeof allSigns !== 'undefined' && Array.isArray(allSigns) && allSigns.length > 0) {
            document.getElementById('loading-spinner').classList.add('hidden');
            document.getElementById('start-screen').classList.remove('hidden');
        } else {
            showLoadingError();
        }
    }, 500);
});

/**
 * Setup all event listeners
 */
function setupEventListeners() {
    // Language selectors with validation
    const interfaceLangSelect = document.getElementById('interface-lang');
    const quizLangSelect = document.getElementById('quiz-lang');
    const helperLangSelect = document.getElementById('helper-lang');
    
    const SUPPORTED_LANGS = ['en', 'uk', 'el', 'ru'];

    if (interfaceLangSelect) {
        interfaceLangSelect.addEventListener('change', () => {
            const value = interfaceLangSelect.value;
            // Validate
            if (!SUPPORTED_LANGS.includes(value)) {
                console.warn(`Invalid interface language: ${value}`);
                return;
            }
            AppState.settings.interfaceLang = value;
            document.documentElement.lang = value;
            localStorage.setItem('cy_interface_lang', value);  // ✅ Consistent naming
            updateUI();
        });
    }

    if (quizLangSelect) {
        quizLangSelect.addEventListener('change', () => {
            const value = quizLangSelect.value;
            // Validate
            if (!SUPPORTED_LANGS.includes(value)) {
                console.warn(`Invalid quiz language: ${value}`);
                return;
            }
            AppState.settings.quizLang = value;
            localStorage.setItem('cy_quiz_lang', value);
        });
    }

    if (helperLangSelect) {
        helperLangSelect.addEventListener('change', () => {
            const value = helperLangSelect.value;
            // Validate
            if (!SUPPORTED_LANGS.includes(value)) {
                console.warn(`Invalid helper language: ${value}`);
                return;
            }
            AppState.settings.helperLang = value;
            localStorage.setItem('cy_helper_lang', value);
        });
    }

    // Category buttons
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const cat = e.target.dataset.key;
            setCat(cat, e.target);
        });
    });

    // Main action buttons
    const startBtn = document.getElementById('ui-quiz-mode-btn');
    const flashcardBtn = document.getElementById('ui-flashcard-btn');
    const referenceBtn = document.getElementById('ui-reference-btn');

    if (startBtn) startBtn.addEventListener('click', start);
    if (flashcardBtn) flashcardBtn.addEventListener('click', startFlashcard);
    if (referenceBtn) referenceBtn.addEventListener('click', showReference);

    // Share button
    const shareBtn = document.querySelector('.share-btn');
    if (shareBtn) shareBtn.addEventListener('click', shareApp);

    // Feedback button now links to feedback.html - no event listener needed

    // Quiz screen buttons
    const translateBtn = document.getElementById('translate-toggle');
    if (translateBtn) translateBtn.addEventListener('click', toggleTranslate);

    // Result screen buttons
    const retryBtn = document.getElementById('ui-retry-btn');
    const backBtn = document.getElementById('ui-back-btn');

    if (retryBtn) retryBtn.addEventListener('click', retry);
    if (backBtn) backBtn.addEventListener('click', backToMenu);

    // Flashcard screen buttons
    const showAnswerBtn = document.getElementById('flashcard-show-answer');
    const correctBtn = document.getElementById('flashcard-correct');
    const wrongBtn = document.getElementById('flashcard-wrong');

    if (showAnswerBtn) showAnswerBtn.addEventListener('click', showFlashcardAnswer);
    if (correctBtn) correctBtn.addEventListener('click', () => handleFlashcardAnswer(true));
    if (wrongBtn) wrongBtn.addEventListener('click', () => handleFlashcardAnswer(false));

    // Reference search
    const referenceSearch = document.getElementById('reference-search');
    if (referenceSearch) {
        referenceSearch.addEventListener('input', filterReference);
    }

    // Reference back button
    const referenceBackBtn = document.getElementById('ui-reference-back-btn');
    if (referenceBackBtn) {
        referenceBackBtn.addEventListener('click', backToMenu);
    }
}

/**
 * Show error when signs fail to load
 */
function showLoadingError() {
    const loadingText = document.getElementById('loading-text');
    if (loadingText) {
        loadingText.innerHTML = '';

        const errorSpan = document.createElement('span');
        errorSpan.style.color = 'var(--danger)';
        errorSpan.textContent = 'Error loading signs.';
        loadingText.appendChild(errorSpan);

        const lineBreak = document.createElement('br');
        loadingText.appendChild(lineBreak);

        const refreshBtn = document.createElement('button');
        refreshBtn.className = 'main-btn';
        refreshBtn.style.marginTop = '15px';
        refreshBtn.textContent = '🔄 Refresh Page';
        refreshBtn.addEventListener('click', () => location.reload());
        loadingText.appendChild(refreshBtn);
    }
}

// Export functions for global access (debugging)
window.CySigns = {
    AppState,
    start,
    startFlashcard,
    showReference,
    shareApp
};
