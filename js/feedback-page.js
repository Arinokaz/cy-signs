/* ==================== FEEDBACK PAGE ====================
   Version: 5.6
   Last Updated: 2026-02-24
   Feedback page logic for standalone page
====================================================================== */

import { detectAndSetLanguage, loadSavedLanguagePrefs, t } from './i18n.js';
import { setupServiceWorker } from './ui.js';
import { showToast } from './utils.js';

let currentRating = 0;

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', () => {
    // Detect and set language
    detectAndSetLanguage();

    // Load saved language preferences
    loadSavedLanguagePrefs();

    // Setup Service Worker
    setupServiceWorker();

    // Setup event listeners
    setupFeedbackEventListeners();

    // Hide loading spinner, show feedback screen
    setTimeout(() => {
        document.getElementById('loading-spinner').classList.add('hidden');
        document.getElementById('feedback-screen').classList.remove('hidden');
    }, 500);
});

/**
 * Setup feedback page event listeners
 */
function setupFeedbackEventListeners() {
    // Feedback rating stars
    document.querySelectorAll('#feedback-rating span').forEach((star) => {
        star.addEventListener('click', (e) => {
            const rating = parseInt(e.target.dataset.rating);
            setRating(rating);
        });

        // Keyboard accessibility
        star.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                const rating = parseInt(star.dataset.rating);
                setRating(rating);
            }
        });
    });

    // Feedback form submission
    const feedbackForm = document.getElementById('feedback-form');
    if (feedbackForm) {
        feedbackForm.addEventListener('submit', submitFeedback);
    }

    // Update UI with translations
    updateFeedbackUI();
}

/**
 * Update feedback page UI with translations
 */
function updateFeedbackUI() {
    const lang = localStorage.getItem('cy_interface_lang') || 'en';
    const translations = t[lang];

    if (!translations) return;

    // Update page title
    document.title = `${translations.feedbackTitle} — Cyprus Road Signs Quiz`;

    // Update elements
    const elements = {
        'ui-feedback-title': translations.feedbackTitle,
        'ui-feedback-name': translations.feedbackName,
        'ui-feedback-email': translations.feedbackEmail,
        'ui-feedback-rating': translations.feedbackRating,
        'ui-feedback-message': translations.feedbackMessage,
        'feedback-submit-btn': translations.feedbackSend,
        'feedback-back-btn': translations.feedbackBack
    };

    for (const [id, text] of Object.entries(elements)) {
        const el = document.getElementById(id);
        if (el) el.textContent = text;
    }

    // Update feedback description
    const description = document.getElementById('feedback-description');
    if (description) {
        description.textContent = getFeedbackDescription(lang);
    }

    // Update placeholder
    const messageEl = document.getElementById('feedback-message');
    if (messageEl) {
        messageEl.placeholder = translations.feedbackPlaceholder;
    }
}

/**
 * Get feedback description based on language
 */
function getFeedbackDescription(lang) {
    const descriptions = {
        en: 'Found a bug? Have a suggestion? We\'d love to hear from you!',
        uk: 'Знайшли баг? Маєте пропозицію? Ми б хотіли почути вас!',
        el: 'Βρήκατε κάποιο σφάλμα; Έχετε κάποια πρόταση; Θα θέλαμε να σας ακούσουμε!',
        ru: 'Нашли баг? Есть предложение? Мы бы хотели услышать вас!'
    };
    return descriptions[lang] || descriptions.en;
}

/**
 * Set rating stars
 */
function setRating(rating) {
    currentRating = rating;
    const stars = document.querySelectorAll('#feedback-rating span');
    stars.forEach((star, index) => {
        if (index < rating) {
            star.classList.add('active');
            star.textContent = '★';
            star.setAttribute('aria-checked', 'true');
        } else {
            star.classList.remove('active');
            star.textContent = '☆';
            star.setAttribute('aria-checked', 'false');
        }
    });
}

/**
 * Submit feedback form
 */
async function submitFeedback(event) {
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
            setRating(0);
            
            // Redirect to home page after success
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
        } else {
            throw new Error('Server error');
        }
    } catch (error) {
        showToast('❌ Error sending feedback. Please try again.');
        // Redirect anyway after error
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
}
