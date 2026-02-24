/* ==================== UTILITY FUNCTIONS ====================
   Version: 3.0
   Last Updated: 2026-02-24
====================================================================== */

import { AppState } from './state.js';

// UI_TRANSLATIONS is global (loaded before modules)
// Use it directly instead of importing to avoid circular dependency

/**
 * Sanitize HTML to prevent XSS attacks
 */
export function sanitizeHTML(str) {
    if (typeof str !== 'string') return str;
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

/**
 * Shuffle array using Fisher-Yates algorithm
 */
export function shuffle(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

/**
 * Get color based on response time
 */
export function getTimeColor(seconds) {
    const styles = getComputedStyle(document.documentElement);
    if (seconds < 5) return styles.getPropertyValue('--success').trim();
    if (seconds <= 10) return styles.getPropertyValue('--warning').trim();
    return styles.getPropertyValue('--danger').trim();
}

/**
 * Format time in seconds to readable string
 */
export function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    if (mins > 0) {
        const minText = AppState.settings.interfaceLang === 'en' ? 'min' :
                       AppState.settings.interfaceLang === 'el' ? 'λεπ' : 'хв';
        return `${mins} ${minText} ${secs} ${UI_TRANSLATIONS[AppState.settings.interfaceLang].seconds}`;
    }
    return `${secs} ${UI_TRANSLATIONS[AppState.settings.interfaceLang].seconds}`;
}

/**
 * Get attempt text based on language and count
 */
export function getAttemptText(count, lang) {
    if (lang === 'ru') {
        if (count === 1) return 'попытка';
        if (count >= 2 && count <= 4) return 'попытки';
        return 'попыток';
    } else if (lang === 'uk') {
        if (count === 1) return 'спроба';
        if (count >= 2 && count <= 4) return 'спроби';
        return 'спроб';
    } else {
        return count === 1 ? 'attempt' : 'attempts';
    }
}

/**
 * Handle image loading errors
 */
export function handleImageError(imgElement) {
    imgElement.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="150" height="150" viewBox="0 0 150 150"><rect fill="%23ddd" width="150" height="150"/><text fill="%23666" x="50%" y="50%" text-anchor="middle" dy=".3em" font-family="Arial" font-size="14">No Image</text></svg>';
    imgElement.style.maxHeight = '100px';
}

/**
 * Show toast notification
 */
export function showToast(message) {
    const existing = document.querySelector('.flashcard-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'flashcard-toast';
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => toast.remove(), 2000);
}
