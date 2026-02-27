/* ==================== I18N - INTERNATIONALIZATION ====================
   Version: 3.0
   Last Updated: 2026-02-24
   Prepared for multi-page support
====================================================================== */

import { AppState } from './state.js';
import { sanitizeHTML } from './utils.js';

/**
 * Get display name for a sign in specified language
 */
export function getDisplayName(sign, lang) {
    return sign.name[lang] || sign.name.en;
}

/**
 * Get short hint for a sign in specified language
 */
export function getDisplayHint(sign, lang) {
    return sign.hint[lang] || sign.hint.en;
}

/**
 * Get full explanation for a sign in specified language
 */
export function getDisplayExplanation(sign, lang) {
    return sign.explanation ? (sign.explanation[lang] || sign.explanation.en) : (sign.hint[lang] || sign.hint.en);
}

/**
 * Get current quiz language (respects translation toggle)
 */
export function getCurrentQuizLang() {
    return AppState.settings.showingTranslation ? AppState.settings.helperLang : AppState.settings.quizLang;
}

/**
 * Detect language from URL, localStorage, or browser
 *
 * @param {boolean} writeToLocalStorage - If true, save detected language to localStorage
 *                                        If false, only read (for non-index pages)
 * @returns {string} Detected language code
 *
 * Priority:
 * 1. URL parameter ?lang= (PRIORITY) → use, save if writeToLocalStorage=true
 * 2. localStorage 'cy_interface_lang' → use if exists (don't overwrite)
 * 3. Browser language → use if no URL/localStorage, save if writeToLocalStorage=true
 * 4. Default English → fallback, save if writeToLocalStorage=true
 *
 * Usage:
 * - index.html (app.js): detectLanguage(true)  → writes to localStorage
 * - reference.html: detectLanguage(false) → read-only
 * - other pages: detectLanguage(false) → read-only
 */
export function detectLanguage(writeToLocalStorage = false) {
    const supportedLangs = ['en', 'uk', 'el', 'ru'];
    let lang = 'en';

    // 1. URL parameter (PRIORITY)
    const urlParams = new URLSearchParams(window.location.search);
    const urlLang = urlParams.get('lang');

    if (urlLang && supportedLangs.includes(urlLang)) {
        lang = urlLang;
        if (writeToLocalStorage) {
            localStorage.setItem('cy_interface_lang', lang);
        }
        return lang;
    }

    // 2. localStorage (from previous visits)
    const storedLang = localStorage.getItem('cy_interface_lang');
    if (storedLang && supportedLangs.includes(storedLang)) {
        lang = storedLang;
        // Don't overwrite (already in localStorage)
        return lang;
    }

    // 3. Browser language (only save if not already in localStorage)
    const browserLang = navigator.language.slice(0, 2);
    if (supportedLangs.includes(browserLang)) {
        lang = browserLang;
        if (writeToLocalStorage) {
            localStorage.setItem('cy_interface_lang', lang);
        }
        return lang;
    }

    // 4. Default English (only save if not already in localStorage)
    lang = 'en';
    if (writeToLocalStorage) {
        localStorage.setItem('cy_interface_lang', lang);
    }
    return lang;
}

/**
 * Detect and set language from URL parameter or browser
 * This is the main entry point for language initialization
 * @deprecated - use detectLanguage(true) instead
 */
export function detectAndSetLanguage() {
    const lang = detectLanguage(true);

    // For backward compatibility with AppState
    if (typeof AppState !== 'undefined') {
        AppState.settings.interfaceLang = lang;

        const interfaceLangSelect = document.getElementById('interface-lang');
        if (interfaceLangSelect) {
            interfaceLangSelect.value = lang;
        }
    }

    document.documentElement.lang = lang;
    return lang;
}

/**
 * Save quiz language to localStorage
 * @deprecated - logic moved to app.js event listeners
 */
export function saveQuizLang() {
    // Deprecated
}

/**
 * Save helper language to localStorage
 * @deprecated - logic moved to app.js event listeners
 */
export function saveHelperLang() {
    // Deprecated
}

/**
 * Load saved language preferences from localStorage
 */
export function loadSavedLanguagePrefs() {
    const interfaceLang = localStorage.getItem('cy_interface_lang');
    const quizLang = localStorage.getItem('cy_quiz_lang');
    const helperLang = localStorage.getItem('cy_helper_lang');
    const supportedLangs = ['en', 'uk', 'el', 'ru'];

    // Load interface language
    if (interfaceLang && supportedLangs.includes(interfaceLang)) {
        AppState.settings.interfaceLang = interfaceLang;
        const interfaceLangSelect = document.getElementById('interface-lang');
        if (interfaceLangSelect) interfaceLangSelect.value = interfaceLang;
    }

    // Load quiz language
    if (quizLang && supportedLangs.includes(quizLang)) {
        AppState.settings.quizLang = quizLang;
        const quizLangSelect = document.getElementById('quiz-lang');
        if (quizLangSelect) quizLangSelect.value = quizLang;
    } else {
        // Default to interface language
        AppState.settings.quizLang = AppState.settings.interfaceLang;
    }

    // Load helper language
    if (helperLang && supportedLangs.includes(helperLang)) {
        AppState.settings.helperLang = helperLang;
        const helperLangSelect = document.getElementById('helper-lang');
        if (helperLangSelect) helperLangSelect.value = helperLang;
    } else {
        // Default to interface language
        AppState.settings.helperLang = AppState.settings.interfaceLang;
    }
}

/**
 * Update UI language (for SPA)
 * For multi-page, use updateStaticPageUI() instead
 */
export function updateUILanguage() {
    const interfaceLangSelect = document.getElementById('interface-lang');
    if (interfaceLangSelect) {
        const lang = interfaceLangSelect.value;
        AppState.settings.interfaceLang = lang;
        document.documentElement.lang = lang;
        localStorage.setItem('cy_interface_lang', lang);

        // Update page title and meta description (SPA only)
        const titles = {
            en: 'Cyprus Road Signs Quiz — Free Driving Test Practice (228 Signs)',
            uk: 'Дорожні знаки Кіпру — Безкоштовний онлайн тест (228 знаків)',
            el: 'Οδικές Πινακίδες Κύπρου — Δωρεάν Θεωρητικό Τεστ (228 Σήματα)',
            ru: 'Дорожные знаки Кипра — Бесплатный онлайн тест (228 знаков)'
        };
        document.title = titles[lang] || titles.en;

        const descriptions = {
            en: 'Interactive quiz app for learning Cyprus road signs. 228 signs, 4 languages, offline PWA support. Free driving test preparation.',
            uk: 'Інтерактивний додаток для вивчення дорожніх знаків Кіпру. 228 знаків, 4 мови, офлайн режим. Безкоштовна підготовка до екзамену.',
            el: 'Διαδραστική εφαρμογή για την εκμάθηση οδικών πινακίδων Κύπρου. 228 σήματα, 4 γλώσσες, υποστήριξη εκτός σύνδεσης.',
            ru: 'Интерактивное приложение для изучения дорожных знаков Кипра. 228 знаков, 4 языка, офлайн режим. Бесплатная подготовка к экзамену.'
        };
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) {
            metaDesc.setAttribute('content', descriptions[lang] || descriptions.en);
        }

        updateUI();
    }
}

/**
 * Update UI translations for SPA
 */
export function updateUI() {
    const t = UI_TRANSLATIONS[AppState.settings.interfaceLang];

    const elements = {
        'ui-title': sanitizeHTML(t.title),
        'ui-fav-only': sanitizeHTML(t.favOnly),
        'ui-interface-lang': sanitizeHTML(t.interfaceLang),
        'ui-quiz-lang': sanitizeHTML(t.quizLang),
        'ui-helper-lang': sanitizeHTML(t.helperLang),
        'ui-category': sanitizeHTML(t.category),
        'ui-questions': sanitizeHTML(t.questions),
        'ui-quiz-mode-btn': sanitizeHTML(t.quizModeBtn),
        'ui-flashcard-btn': sanitizeHTML(t.flashcardBtn),
        'ui-back-btn': sanitizeHTML(t.backToMenu),
        'ui-retry-btn': sanitizeHTML(t.retryBtn),
        'ui-reference-btn': sanitizeHTML(t.referenceBtn),
        'ui-reference-back-btn': sanitizeHTML(t.backToMenu)
    };

    for (const [id, text] of Object.entries(elements)) {
        const el = document.getElementById(id);
        if (el) el.textContent = text;
    }

    const uiScore = document.getElementById('ui-score');
    if (uiScore) {
        uiScore.textContent = sanitizeHTML(t.score);
    }

    const translateToggle = document.getElementById('translate-toggle');
    if (translateToggle) {
        translateToggle.textContent = sanitizeHTML(t.showTranslate);
    }

    document.querySelectorAll('.category-btn').forEach(btn => {
        const key = btn.dataset.key;
        if (key && t.categories[key]) btn.textContent = sanitizeHTML(t.categories[key]);
    });

    const questionCount = document.getElementById('question-count');
    if (questionCount) {
        const opts = questionCount.querySelectorAll('option');
        if (opts[0]) opts[0].textContent = sanitizeHTML(t.questionCount["5"]);
        if (opts[1]) opts[1].textContent = sanitizeHTML(t.questionCount["10"]);
        if (opts[2]) opts[2].textContent = sanitizeHTML(t.questionCount["20"]);
        if (opts[3]) opts[3].textContent = sanitizeHTML(t.questionCount["50"]);
        if (opts[4]) opts[4].textContent = sanitizeHTML(t.questionCount["all"]);
    }
}

/**
 * Update UI for static multi-language pages (about.html, faq.html, etc.)
 * Uses data-i18n attributes
 */
export function updateStaticPageUI(lang = null) {
    const currentLang = lang || AppState.settings.interfaceLang;
    const t = UI_TRANSLATIONS[currentLang];
    
    // Update all elements with data-i18n attribute
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.dataset.i18n;
        const keys = key.split('.');
        let value = t;
        
        for (const k of keys) {
            if (value && typeof value === 'object' && k in value) {
                value = value[k];
            } else {
                value = null;
                break;
            }
        }
        
        if (value) {
            if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                if (el.placeholder !== undefined) {
                    el.placeholder = sanitizeHTML(value);
                } else {
                    el.value = sanitizeHTML(value);
                }
            } else {
                el.textContent = sanitizeHTML(value);
            }
        }
    });
    
    // Update page title if data-i18n-title exists
    const titleEl = document.querySelector('[data-i18n-title]');
    if (titleEl) {
        const key = titleEl.dataset.i18nTitle;
        if (t[key]) {
            document.title = sanitizeHTML(t[key]);
        }
    }
}

// ==================== EXPORT TRANSLATIONS OBJECT ====================
// Export for use in other modules (game.js, reference.js, etc.)
export const t = UI_TRANSLATIONS;
