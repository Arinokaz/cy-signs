/* ==================== FEEDBACK & SHARE ====================
   Version: 3.0
   Last Updated: 2026-02-24
====================================================================== */

import { AppState } from './state.js';
import { showScreen } from './ui.js';
import { showToast } from './utils.js';
import { backToMenu } from './quiz.js';

let currentRating = 0;

/**
 * Open feedback screen
 */
export function openFeedbackScreen() {
    showScreen('feedback-screen');
    currentRating = 0;
    resetRating();
    const form = document.getElementById('feedback-form');
    if (form) form.reset();
}

/**
 * Set rating stars
 */
export function setRating(rating) {
    currentRating = rating;
    const stars = document.querySelectorAll('#feedback-rating span');
    stars.forEach((star, index) => {
        if (index < rating) {
            star.classList.add('active');
            star.textContent = '★';
        } else {
            star.classList.remove('active');
            star.textContent = '☆';
        }
    });
}

/**
 * Reset rating stars
 */
function resetRating() {
    const stars = document.querySelectorAll('#feedback-rating span');
    stars.forEach(star => {
        star.classList.remove('active');
        star.textContent = '☆';
    });
}

/**
 * Submit feedback form
 */
export async function submitFeedback(event) {
    event.preventDefault();

    const name = document.getElementById('feedback-name').value.trim();
    const email = document.getElementById('feedback-email').value.trim();
    const message = document.getElementById('feedback-message').value.trim();

    if (!message) {
        showToast('⚠️ Please enter a message');
        return;
    }

    const submitBtn = document.getElementById('feedback-submit-btn');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = '⏳ Sending...';

    const feedbackData = {
        name: name || 'Anonymous',
        email: email || 'Not provided',
        rating: currentRating || 'Not rated',
        message: message,
        url: window.location.href,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent
    };

    const formattedMessage = `📝 Feedback from ${feedbackData.url}\n\n` +
                             `🕒 Time: ${feedbackData.timestamp}\n` +
                             `👤 Name: ${feedbackData.name}\n` +
                             `📧 Email: ${feedbackData.email}\n` +
                             `⭐ Rating: ${feedbackData.rating}/5\n\n` +
                             `💬 Message:\n${feedbackData.message}`;

    try {
        const response = await fetch('https://us-central1-cy-signs-online.cloudfunctions.net/sendFeedback', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: formattedMessage })
        });

        if (response.ok) {
            showToast('✅ Thank you for your feedback!');
            document.getElementById('feedback-form').reset();
            resetRating();
            setTimeout(() => backToMenu(), 1000);
        } else {
            throw new Error('Server error');
        }
    } catch (error) {
        resetRating();
        setTimeout(() => backToMenu(), 1000);
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
}

/**
 * Send feedback (alias)
 */
export function sendFeedback() {
    openFeedbackScreen();
}

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
