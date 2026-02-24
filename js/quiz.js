/* ==================== QUIZ MODE ====================
   Version: 3.0
   Last Updated: 2026-02-24
====================================================================== */

import { AppState, AD_CONFIG } from './state.js';
import { showScreen, cleanupQuiz } from './ui.js';
import { getDisplayName, getCurrentQuizLang, updateUI, getDisplayHint, t } from './i18n.js';
import { shuffle, handleImageError } from './utils.js';
import { renderResultsList, renderResultHeader } from './results.js';

// t is the translations object (imported from i18n.js)

/**
 * Set category filter
 */
export function setCat(cat, btn) {
    AppState.quiz.selectedCategory = cat;
    document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');
}

/**
 * Start quiz mode
 */
export function start() {
    if (!allSigns || allSigns.length === 0) {
        alert('Error: Signs database not loaded. Please refresh the page.');
        return;
    }

    // Analytics
    if (typeof gtag !== 'undefined') {
        gtag('event', 'mode_select', {
            event_category: 'training',
            event_label: 'Quiz Mode'
        });
    }

    const quizLangSelect = document.getElementById('quiz-lang');
    const helperLangSelect = document.getElementById('helper-lang');
    const favOnlyCheckbox = document.getElementById('fav-only');
    const questionCountSelect = document.getElementById('question-count');

    if (quizLangSelect) AppState.settings.quizLang = quizLangSelect.value;
    if (helperLangSelect) AppState.settings.helperLang = helperLangSelect.value;
    AppState.settings.showingTranslation = false;
    AppState.flashcard.mode = false;
    AppState.showRetryButton = AppState.quiz.showRetry;

    const isFavOnly = favOnlyCheckbox ? favOnlyCheckbox.checked : false;
    let base = isFavOnly ? allSigns.filter(s => s.fav) : allSigns;
    base = AppState.quiz.selectedCategory === 'all' ? base : base.filter(s => s.cat === AppState.quiz.selectedCategory);

    if (base.length === 0) {
        alert(t[AppState.settings.interfaceLang].noSignsInCat);
        return;
    }

    const countSelect = questionCountSelect ? questionCountSelect.value : '20';
    let requestedCount = countSelect === 'all' ? base.length : parseInt(countSelect);
    let totalQuestions = Math.min(requestedCount, base.length);

    AppState.quiz.testSet = shuffle(base).slice(0, totalQuestions);
    AppState.quiz.savedTestSet = [...AppState.quiz.testSet];
    AppState.quiz.current = 0;
    AppState.quiz.points = 0;
    AppState.quiz.results = [];
    AppState.quiz.hintsUsed = 0;
    AppState.quiz.currentAttempt = 0;
    AppState.timing.questionTimes = [];
    AppState.timing.totalStartTime = Date.now();

    const seoFooter = document.getElementById('seo-footer');
    if (seoFooter) seoFooter.style.display = 'none';

    showScreen('quiz-screen');
    render();
}

/**
 * Render current quiz question
 */
export function render() {
    const q = AppState.quiz.testSet[AppState.quiz.current];
    const lang = AppState.settings.interfaceLang;
    let quizLangCurrent = getCurrentQuizLang();
    
    // Fallback to English if quiz language is not set
    if (!quizLangCurrent || !['en', 'uk', 'el', 'ru'].includes(quizLangCurrent)) {
        quizLangCurrent = 'en';
        AppState.settings.quizLang = 'en';
    }

    const progressPercent = ((AppState.quiz.current + 1) / AppState.quiz.testSet.length) * 100;
    const progressFill = document.getElementById('progress-fill');
    if (progressFill) progressFill.style.width = `${progressPercent}%`;

    const progressEl = document.getElementById('progress');
    if (progressEl) progressEl.innerText = `${t[lang].progress} ${AppState.quiz.current + 1} ${t[lang].of} ${AppState.quiz.testSet.length}`;

    const qImg = document.getElementById('q-img');
    if (qImg) {
        qImg.src = "./img/" + q.file;
        qImg.onerror = () => handleImageError(qImg);
    }

    AppState.timing.questionStartTime = Date.now();

    cleanupQuiz();

    // Generate options (1 correct + 3 random)
    let optionsSigns = [q];
    let others = allSigns.filter(s => s.file !== q.file)
        .sort(() => 0.5 - Math.random()).slice(0, 3);
    optionsSigns = [...optionsSigns, ...others].sort(() => 0.5 - Math.random());

    AppState.quiz.currentOptionsSigns = optionsSigns;

    const container = document.getElementById('options');
    if (container) {
        container.innerHTML = '';
        
        optionsSigns.forEach((sign, index) => {
            const b = document.createElement('button');
            b.innerText = getDisplayName(sign, quizLangCurrent);
            b.onclick = () => check(sign, b);
            container.appendChild(b);
        });
    }

    // Translation toggle button
    const translateBtn = document.getElementById('translate-toggle');
    if (translateBtn) {
        const lang = AppState.settings.interfaceLang;
        translateBtn.textContent = AppState.settings.showingTranslation ? t[lang].hideTranslate : t[lang].showTranslate;
        translateBtn.classList.toggle('active', AppState.settings.showingTranslation);
    }

    // Hints button
    let hintsBtn = document.getElementById('hints-btn');
    if (!hintsBtn) {
        const lang = AppState.settings.interfaceLang;
        hintsBtn = document.createElement('button');
        hintsBtn.id = 'hints-btn';
        hintsBtn.className = 'translate-btn';
        hintsBtn.textContent = t[lang].showHints;
        hintsBtn.onclick = toggleHints;

        const translateBtn = document.getElementById('translate-toggle');
        if (translateBtn && translateBtn.parentNode) {
            translateBtn.parentNode.insertBefore(hintsBtn, translateBtn.nextSibling);
        }
    }
}

/**
 * Check answer
 */
export function check(ans, btn) {
    if (AppState.quiz.isProcessing) {
        return;
    }
    AppState.quiz.isProcessing = true;

    const q = AppState.quiz.testSet[AppState.quiz.current];
    const quizLangCurrent = getCurrentQuizLang();
    const btns = document.querySelectorAll('#options button');

    const userAnswerText = getDisplayName(ans, quizLangCurrent);
    const isOk = ans.file === q.file;

    const timeSpent = (Date.now() - AppState.timing.questionStartTime) / 1000;

    // Record attempt
    AppState.quiz.results.push({
        q,
        isOk,
        userChoice: userAnswerText,
        time: timeSpent,
        attempt: AppState.quiz.currentAttempt + 1
    });
    AppState.timing.questionTimes.push({ time: timeSpent, isCorrect: isOk });

    // Hide hints
    const allHintItems = document.querySelectorAll('.hint-item');
    allHintItems.forEach(item => item.remove());

    if (isOk) {
        // Correct answer
        if (btn) btn.classList.add('correct');
        AppState.quiz.points++;

        setTimeout(() => {
            AppState.quiz.isProcessing = false;
            AppState.quiz.currentAttempt = 0;
            next();
        }, 1000);
    } else {
        // Wrong answer
        if (btn) {
            btn.classList.add('wrong');
            btn.disabled = true;
        }

        btns.forEach(b => b.disabled = true);

        setTimeout(() => {
            // Remove wrong button from DOM
            if (btn) btn.remove();
            
            // Remove wrong button from optionsSigns array
            const wrongIndex = AppState.quiz.currentOptionsSigns.findIndex(s => s.file === ans.file);
            if (wrongIndex > -1) {
                AppState.quiz.currentOptionsSigns.splice(wrongIndex, 1);
            }
            
            shuffleRemainingButtons();

            const remainingBtns = document.querySelectorAll('#options button:not(.removed)');
            remainingBtns.forEach(b => b.disabled = false);

            AppState.quiz.currentAttempt++;
            AppState.quiz.isProcessing = false;
            AppState.timing.questionStartTime = Date.now();
        }, 500);
    }
}

/**
 * Shuffle remaining buttons after wrong answer
 */
function shuffleRemainingButtons() {
    const container = document.getElementById('options');
    if (!container) return;

    const buttons = Array.from(container.querySelectorAll('button:not(.removed)'));

    for (let i = buttons.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [buttons[i], buttons[j]] = [buttons[j], buttons[i]];
    }

    buttons.forEach(btn => container.appendChild(btn));

    buttons.forEach((btn, index) => {
        btn.style.animation = 'none';
        setTimeout(() => {
            btn.style.animation = `shuffle 0.2s ease-in-out ${index * 0.03}s`;
        }, 10);
    });
}

/**
 * Go to next question
 */
export function next() {
    AppState.quiz.current++;
    AppState.quiz.currentOptionsSigns = [];

    if (AppState.quiz.current < AppState.quiz.testSet.length) {
        render();
    } else {
        finish();
    }
}

/**
 * Finish quiz and show results
 */
export function finish() {
    showScreen('result-screen');

    const totalTime = (Date.now() - AppState.timing.totalStartTime) / 1000;

    // Use shared result rendering logic
    renderResultHeader(
        AppState.quiz.points,
        AppState.quiz.testSet.length,
        totalTime,
        AppState.quiz.hintsUsed,
        false // isFlashcard = false
    );

    const retryBtn = document.getElementById('ui-retry-btn');
    if (retryBtn) {
        retryBtn.style.display = AppState.showRetryButton ? 'block' : 'none';
    }

    // Use shared results list rendering
    renderResultsList(AppState.quiz.results, AppState.quiz.testSet, false);
}

/**
 * Retry quiz with same questions
 */
export function retry() {
    if (!AppState.quiz.savedTestSet) return;

    cleanupQuiz();

    AppState.timing.questionTimes.length = 0;
    AppState.quiz.results.length = 0;
    AppState.quiz.currentOptionsSigns.length = 0;
    AppState.quiz.hintsUsed = 0;
    AppState.quiz.currentAttempt = 0;

    AppState.quiz.testSet = [...AppState.quiz.savedTestSet];
    AppState.quiz.current = 0;
    AppState.quiz.points = 0;
    AppState.timing.totalStartTime = Date.now();
    AppState.settings.showingTranslation = false;

    showScreen('quiz-screen');

    setTimeout(() => {
        render();
    }, 50);
}

/**
 * Return to main menu
 */
export function backToMenu() {
    cleanupQuiz();

    AppState.quiz.savedTestSet = null;
    AppState.flashcard.mode = false;
    AppState.showRetryButton = false;
    AppState.quiz.selectedCategory = 'all';

    const favOnlyCheckbox = document.getElementById('fav-only');
    const quizLangSelect = document.getElementById('quiz-lang');
    const helperLangSelect = document.getElementById('helper-lang');

    if (favOnlyCheckbox) favOnlyCheckbox.checked = false;
    if (quizLangSelect) quizLangSelect.value = AppState.settings.quizLang;
    if (helperLangSelect) helperLangSelect.value = AppState.settings.helperLang;

    showScreen('start-screen');

    const seoFooter = document.getElementById('seo-footer');
    if (seoFooter) seoFooter.style.display = 'block';

    document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
    const defaultCat = document.querySelector('.category-btn[data-key="all"]');
    if (defaultCat) defaultCat.classList.add('active');

    updateUI();
}

/**
 * Toggle translation mode
 */
export function toggleTranslate() {
    AppState.settings.showingTranslation = !AppState.settings.showingTranslation;
    const btn = document.getElementById('translate-toggle');
    if (btn) {
        const translations = t[AppState.settings.interfaceLang];
        btn.textContent = AppState.settings.showingTranslation ? translations.hideTranslate : translations.showTranslate;
        btn.classList.toggle('active', AppState.settings.showingTranslation);
    }

    if (AppState.quiz.testSet.length > 0 && AppState.quiz.current < AppState.quiz.testSet.length) {
        const options = document.getElementById('options');
        if (options && options.children.length > 0) {
            updateOptionsText();
        }
    }
}

/**
 * Update options text when language changes
 */
function updateOptionsText() {
    const quizLangCurrent = getCurrentQuizLang();
    const buttons = document.querySelectorAll('#options button');
    const optionsSigns = AppState.quiz.currentOptionsSigns;

    if (!optionsSigns || optionsSigns.length === 0) return;
    
    // Skip if buttons were removed after wrong answer
    if (buttons.length === 0) return;
    
    // Don't require exact match - just update existing buttons
    const count = Math.min(buttons.length, optionsSigns.length);
    
    for (let i = 0; i < count; i++) {
        const button = buttons[i];
        const sign = optionsSigns[i];
        if (button && typeof button.innerText !== 'undefined' && sign) {
            button.innerText = getDisplayName(sign, quizLangCurrent);
        }
    }
}

/**
 * Toggle hints display
 */
export function toggleHints() {
    const translations = t[AppState.settings.interfaceLang];
    const helperLang = AppState.settings.helperLang;

    const firstHintItem = document.querySelector('.hint-item');
    const hintsBtn = document.getElementById('hints-btn');

    if (firstHintItem) {
        const allHintItems = document.querySelectorAll('.hint-item');
        allHintItems.forEach(item => item.remove());

        if (hintsBtn) {
            hintsBtn.textContent = translations.showHints;
        }
        return;
    }

    AppState.quiz.hintsUsed++;

    const optionButtons = document.querySelectorAll('#options button');

    AppState.quiz.currentOptionsSigns.forEach((sign, index) => {
        if (index < optionButtons.length) {
            const button = optionButtons[index];

            const hintItem = document.createElement('div');
            hintItem.className = 'hint-item';
            hintItem.style.cssText = 'background: linear-gradient(135deg, #fff3cd 0%, #ffe8a1 100%); color: var(--hint-text); padding: 10px 14px; border-radius: 8px; margin-top: 6px; font-size: 13px; line-height: 1.5; text-align: left; border: 1px solid #ffc107; animation: slideDown 0.25s ease-out;';

            const name = getDisplayName(sign, helperLang);
            const hint = getDisplayHint(sign, helperLang);

            hintItem.innerHTML = `<strong style="color: #856404; display: block; margin-bottom: 4px;">${index + 1}. ${name}</strong><em style="color: #666;">${hint}</em>`;

            button.parentNode.insertBefore(hintItem, button.nextSibling);
        }
    });

    if (hintsBtn) {
        hintsBtn.textContent = translations.hideHints;
    }
}
