/* ==================== FLASHCARD MODE ====================
   Version: 3.0
   Last Updated: 2026-02-24
====================================================================== */

import { AppState } from './state.js';
import { showScreen } from './ui.js';
import { getDisplayName, getDisplayHint, t } from './i18n.js';
import { shuffle, handleImageError, showToast } from './utils.js';

// t is the translations object (imported from i18n.js)

/**
 * Start flashcard mode
 */
export function startFlashcard() {
    if (!allSigns || allSigns.length === 0) {
        alert('Error: Signs database not loaded. Please refresh the page.');
        return;
    }

    // Analytics
    if (typeof gtag !== 'undefined') {
        gtag('event', 'mode_select', {
            event_category: 'training',
            event_label: 'Flashcard Mode'
        });
    }

    AppState.flashcard.mode = true;
    AppState.showRetryButton = AppState.flashcard.showRetry;

    const quizLangSelect = document.getElementById('quiz-lang');
    const helperLangSelect = document.getElementById('helper-lang');
    const favOnlyCheckbox = document.getElementById('fav-only');
    const questionCountSelect = document.getElementById('question-count');

    if (quizLangSelect) AppState.settings.quizLang = quizLangSelect.value;
    if (helperLangSelect) AppState.settings.helperLang = helperLangSelect.value;

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

    showScreen('flashcard-screen');
    renderFlashcard();
}

/**
 * Render current flashcard
 */
export function renderFlashcard() {
    const q = AppState.quiz.testSet[AppState.quiz.current];
    const lang = AppState.settings.interfaceLang;
    const translations = t[lang];  // Get translations for current language

    const progressPercent = ((AppState.quiz.current + 1) / AppState.quiz.testSet.length) * 100;

    const flashcardProgressFill = document.getElementById('flashcard-progress-fill');
    if (flashcardProgressFill) flashcardProgressFill.style.width = `${progressPercent}%`;

    const flashcardProgress = document.getElementById('flashcard-progress');
    if (flashcardProgress) flashcardProgress.innerText = `${translations.progress} ${AppState.quiz.current + 1} ${translations.of} ${AppState.quiz.testSet.length}`;

    const flashcardQImg = document.getElementById('flashcard-q-img');
    if (flashcardQImg) {
        flashcardQImg.src = "./img/" + q.file;
        flashcardQImg.onerror = () => handleImageError(flashcardQImg);
    }

    AppState.flashcard.answerShown = false;

    const flashcardAnswer = document.getElementById('flashcard-answer');
    if (flashcardAnswer) flashcardAnswer.classList.add('hidden');

    const showAnswerBtn = document.getElementById('flashcard-show-answer');
    if (showAnswerBtn) {
        showAnswerBtn.style.display = 'block';
        showAnswerBtn.disabled = false;
        showAnswerBtn.textContent = translations.showAnswer;
    }

    const flashcardCorrect = document.getElementById('flashcard-correct');
    const flashcardWrong = document.getElementById('flashcard-wrong');
    if (flashcardCorrect) {
        flashcardCorrect.disabled = true;
        flashcardCorrect.textContent = '✅ ' + translations.correct;
    }
    if (flashcardWrong) {
        flashcardWrong.disabled = true;
        flashcardWrong.textContent = '❌ ' + translations.wrong;
    }

    AppState.timing.questionStartTime = Date.now();
}

/**
 * Show flashcard answer
 */
export function showFlashcardAnswer() {
    const q = AppState.quiz.testSet[AppState.quiz.current];
    const lang = AppState.settings.interfaceLang;
    const translations = t[lang];  // Get translations for current language

    AppState.flashcard.answerShown = true;

    const flashcardName = document.getElementById('flashcard-name');
    if (flashcardName) flashcardName.textContent = getDisplayName(q, AppState.settings.quizLang);

    const hintContainer = document.getElementById('flashcard-hint');
    if (hintContainer) {
        hintContainer.innerHTML = '';

        const hintTitle = document.createElement('strong');
        hintTitle.textContent = `💡 ${translations.hintLabel}`;
        hintContainer.appendChild(hintTitle);
        hintContainer.appendChild(document.createElement('br'));
        hintContainer.appendChild(document.createTextNode(getDisplayHint(q, AppState.settings.helperLang)));
    }

    const flashcardAnswer = document.getElementById('flashcard-answer');
    if (flashcardAnswer) flashcardAnswer.classList.remove('hidden');

    const showAnswerBtn = document.getElementById('flashcard-show-answer');
    if (showAnswerBtn) showAnswerBtn.style.display = 'none';

    const flashcardCorrect = document.getElementById('flashcard-correct');
    const flashcardWrong = document.getElementById('flashcard-wrong');
    if (flashcardCorrect) flashcardCorrect.disabled = false;
    if (flashcardWrong) flashcardWrong.disabled = false;
}

/**
 * Handle flashcard answer (correct/wrong)
 */
export function handleFlashcardAnswer(isCorrect) {
    if (!AppState.flashcard.answerShown) {
        showToast(t[AppState.settings.interfaceLang].checkAnswerFirst);
        return;
    }

    const q = AppState.quiz.testSet[AppState.quiz.current];
    const userAnswerText = getDisplayName(q, AppState.settings.quizLang);
    const timeSpent = (Date.now() - AppState.timing.questionStartTime) / 1000;

    AppState.timing.questionTimes.push({ time: timeSpent, isCorrect: isCorrect });
    AppState.quiz.results.push({ q, isOk: isCorrect, userChoice: userAnswerText, time: timeSpent });

    if (isCorrect) {
        AppState.quiz.points++;
    }

    AppState.quiz.current++;
    if (AppState.quiz.current < AppState.quiz.testSet.length) {
        renderFlashcard();
    } else {
        finishFlashcard();
    }
}

/**
 * Finish flashcard session
 */
function finishFlashcard() {
    // Reuse quiz finish logic - import dynamically to avoid circular dependency
    import('./quiz.js').then(({ finish }) => {
        finish();
    });
}
