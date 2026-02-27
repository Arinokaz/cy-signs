/* ==================== UI MANAGEMENT ====================
   Version: 3.0
   Last Updated: 2026-02-24
====================================================================== */

/**
 * Show specific screen, hide others
 */
export function showScreen(screenId) {
    const screens = ['start-screen', 'quiz-screen', 'result-screen', 'flashcard-screen', 'reference-screen', 'feedback-screen'];
    screens.forEach(id => {
        const screen = document.getElementById(id);
        if (screen) {
            screen.classList.toggle('hidden', id !== screenId);
        }
    });
}

/**
 * Setup Service Worker for PWA
 */
export function setupServiceWorker() {
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('./sw.js')
                .then(reg => {
                    reg.addEventListener('updatefound', () => {
                        const newWorker = reg.installing;

                        newWorker.addEventListener('statechange', () => {
                            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                if (confirm('New version available! Refresh page?')) {
                                    window.location.reload();
                                }
                            }
                        });
                    });
                })
                .catch(() => {});
        });
    }
}

/**
 * Clean up quiz screen to prevent memory leaks
 */
export function cleanupQuiz() {
    // Remove hint div
    const hintDiv = document.getElementById('active-hint');
    if (hintDiv) hintDiv.remove();

    // Remove next button
    const nextBtn = document.getElementById('next-btn-manual');
    if (nextBtn) nextBtn.remove();

    // Remove hint items
    const allHintItems = document.querySelectorAll('.hint-item');
    allHintItems.forEach(item => item.remove());

    // Remove hints button
    const hintsBtn = document.getElementById('hints-btn');
    if (hintsBtn) hintsBtn.remove();

    // Clear options container by replacing it (removes event listeners)
    const options = document.getElementById('options');
    if (options) {
        const newOptions = options.cloneNode(false);
        options.parentNode.replaceChild(newOptions, options);
    }
}
