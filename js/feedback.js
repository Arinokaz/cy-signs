/* ==================== SHARE FUNCTIONALITY ====================
   Version: 3.0
   Last Updated: 2026-02-24
   Share app functionality
====================================================================== */

import { showToast } from './utils.js';

/**
 * Share app
 */
export async function shareApp() {
    const shareData = {
        title: 'Cyprus Road Signs Quiz — Free Driving Test Practice',
        text: '🚗 Learn 228 Cyprus road signs for free!\n\n' +
              '✅ Quiz Mode\n' +
              '✅ Flashcard Mode\n' +
              '✅ 4 languages (EN/UK/EL/RU)\n' +
              '✅ Offline support\n\n' +
              'Try it now!',
        url: window.location.href
    };

    if (navigator.share) {
        try {
            await navigator.share(shareData);
            showToast('✅ Shared!');
        } catch (err) {
            if (err.name !== 'AbortError') {
                fallbackShare(shareData);
            }
        }
    } else {
        fallbackShare(shareData);
    }
}

/**
 * Fallback share (copy to clipboard)
 */
function fallbackShare(shareData) {
    navigator.clipboard.writeText(`${shareData.text}\n\n🔗 ${shareData.url}`)
        .then(() => {
            showToast('📋 Link copied to clipboard!');
        })
        .catch(() => {
            alert(`${shareData.text}\n\n${shareData.url}`);
        });
}
