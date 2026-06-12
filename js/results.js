/* ==================== RESULTS RENDERING ====================
   Version: 5.6
   Last Updated: 2026-02-24
   Common logic for rendering quiz/flashcard results
====================================================================== */

import { AppState } from './state.js';
import { getDisplayName, getDisplayHint, t } from './i18n.js';
import { handleImageError, getTimeColor, getAttemptText, formatTime } from './utils.js';

/**
 * Render results list for quiz or flashcard mode
 * @param {Array} results - Array of result objects
 * @param {Array} testSet - Array of signs that were in the test
 * @param {boolean} isFlashcard - Whether this is flashcard mode
 */
export function renderResultsList(results, testSet, isFlashcard = false) {
    const lang = AppState.settings.interfaceLang;
    const translations = t[lang];

    const log = document.getElementById('log');
    if (!log) return;

    log.innerHTML = '';

    // Group results by question
    const questionStats = {};
    results.forEach(r => {
        const key = r.q.file;
        if (!questionStats[key]) {
            questionStats[key] = { attempts: 0, errors: 0, lastResult: null };
        }
        questionStats[key].attempts++;
        if (!r.isOk) {
            questionStats[key].errors++;
        } else {
            questionStats[key].lastResult = r;
        }
    });

    // Show all questions in order
    testSet.forEach(q => {
        const key = q.file;
        const stats = questionStats[key];
        const row = createResultItem(q, stats, isFlashcard, translations);
        log.appendChild(row);
    });
}

/**
 * Create a single result item DOM element
 * @param {Object} q - Sign object
 * @param {Object} stats - Statistics for this sign
 * @param {boolean} isFlashcard - Whether this is flashcard mode
 * @param {Object} translations - Translations object
 * @returns {HTMLElement}
 */
function createResultItem(q, stats, isFlashcard, translations) {
    const row = document.createElement('div');
    row.className = 'result-item';

    const hasErrors = stats.errors > 0;
    let statusText;

    if (isFlashcard) {
        statusText = hasErrors ? `❌ ${translations.wrong}` : `✅ ${translations.correct}`;
    } else {
        statusText = hasErrors
            ? `❌ ${translations.wrong} (${stats.attempts} ${getAttemptText(stats.attempts, AppState.settings.interfaceLang)})`
            : `✅ ${translations.correct}`;
    }

    const img = document.createElement('img');
    img.src = `./img/${q.file}`;
    img.alt = getDisplayName(q, AppState.settings.interfaceLang);
    img.onerror = () => handleImageError(img);

    const contentDiv = document.createElement('div');

    const statusDiv = document.createElement('div');
    statusDiv.className = 'status';
    statusDiv.style.color = hasErrors ? 'var(--danger)' : 'var(--success)';
    statusDiv.textContent = statusText;

    const answerDiv = document.createElement('div');
    answerDiv.className = 'answer';
    answerDiv.textContent = getDisplayName(q, AppState.settings.quizLang);

    const hintDiv = document.createElement('div');
    hintDiv.className = 'hint';
    hintDiv.textContent = `${translations.hintLabel} ${getDisplayHint(q, AppState.settings.helperLang)}`;

    if (stats.lastResult) {
        const timeColor = getTimeColor(stats.lastResult.time);
        const timeDiv = document.createElement('div');
        timeDiv.className = 'time';
        timeDiv.style.color = timeColor;
        timeDiv.textContent = `${translations.answerTime}: ${stats.lastResult.time.toFixed(1)} ${translations.seconds}`;
        contentDiv.appendChild(timeDiv);
    }

    contentDiv.appendChild(statusDiv);
    contentDiv.appendChild(answerDiv);
    contentDiv.appendChild(hintDiv);

    row.appendChild(img);
    row.appendChild(contentDiv);

    return row;
}

/**
 * Render result screen header with score and stats
 * @param {number} points - Number of correct answers
 * @param {number} total - Total number of questions
 * @param {number} totalTime - Total time in seconds
 * @param {number} hintsUsed - Number of hints used (optional)
 * @param {boolean} isFlashcard - Whether this is flashcard mode
 */
export function renderResultHeader(points, total, totalTime, hintsUsed = 0, isFlashcard = false) {
    const lang = AppState.settings.interfaceLang;
    const translations = t[lang];

    const scoreEl = document.getElementById('score');
    const totalQEl = document.getElementById('total-q');
    if (scoreEl) scoreEl.innerText = points;
    if (totalQEl) totalQEl.innerText = total;

    const resultTitle = document.getElementById('result-title');
    if (resultTitle) {
        resultTitle.textContent = `${translations.score}: ${points} / ${total}`;

        const timeSpan = document.createElement('span');
        timeSpan.style.cssText = 'font-size: 16px; color: #666; font-weight: 500; margin-top: 8px; display: inline-block;';
        timeSpan.textContent = `${translations.totalTime}: ${formatTime(totalTime)}`;

        const lineBreak = document.createElement('br');
        resultTitle.appendChild(lineBreak);
        resultTitle.appendChild(timeSpan);

        // Add hints counter (only for quiz mode)
        if (hintsUsed > 0 && !isFlashcard) {
            const hintsSpan = document.createElement('span');
            hintsSpan.style.cssText = 'font-size: 14px; color: #f39c12; font-weight: 500; margin-top: 4px; display: inline-block; margin-left: 15px;';
            hintsSpan.textContent = `💡 ${translations.hintsUsed}: ${hintsUsed}`;
            resultTitle.appendChild(hintsSpan);
        }
    }
}
