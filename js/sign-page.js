/* ==================== SIGN PAGE ====================
   Version: 1.1
   Last Updated: 2026-03-22
====================================================================== */

import { detectLanguage, t, getDisplayName, getDisplayExplanation, getCategoryName } from './i18n.js';
import { AppState } from './state.js';
import { handleImageError } from './utils.js';

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', () => {
    const currentLang = detectLanguage(false);
    document.documentElement.lang = currentLang;

    const pathname = window.location.pathname;
    const filename = pathname.substring(pathname.lastIndexOf('/') + 1);
    const signId = filename.replace('.html', '');

    if (typeof allSigns === 'undefined' || !Array.isArray(allSigns) || allSigns.length === 0) {
        showLoadingError('Signs database not loaded');
        return;
    }

    const sign = findSignById(signId);
    
    if (!sign) {
        showLoadingError('Sign not found');
        setTimeout(() => {
            window.location.href = '../reference.html';
        }, 2000);
        return;
    }

    localStorage.setItem('scrollToSign', sign.file);

    showSignContent(sign, currentLang);
});

function findSignById(signId) {
    for (const sign of allSigns) {
        if (sign.id === signId) {
            return sign;
        }
    }
    return null;
}

function showLoadingError(message) {
    const loadingSpinner = document.getElementById('loading-spinner');
    const loadingText = document.getElementById('loading-text');
    
    if (loadingText) {
        loadingText.innerHTML = `
            <span style="color: var(--danger);">${message}</span><br>
            <span style="font-size: 14px; color: #666;">Redirecting to reference page...</span>
        `;
    }
}

function showSignContent(sign, interfaceLang) {
    const loadingSpinner = document.getElementById('loading-spinner');
    const signScreen = document.getElementById('sign-screen');

    if (loadingSpinner) loadingSpinner.classList.add('hidden');
    if (signScreen) signScreen.classList.remove('hidden');

    const signImg = document.getElementById('sign-img');
    if (signImg) {
        signImg.src = `../img/${sign.file}`;
        signImg.alt = getDisplayName(sign, AppState.settings.quizLang);
        signImg.onerror = () => handleImageError(signImg);
    }

    const signName = document.getElementById('sign-name');
    if (signName) {
        signName.textContent = getDisplayName(sign, AppState.settings.quizLang);
    }

    const signCategory = document.getElementById('sign-category');
    if (signCategory) {
        signCategory.textContent = getCategoryName(sign.cat, AppState.settings.quizLang);
    }

    const signExplanation = document.getElementById('sign-explanation');
    if (signExplanation) {
        signExplanation.textContent = getDisplayExplanation(sign, AppState.settings.helperLang);
    }

    const backBtn = document.getElementById('back-btn');
    if (backBtn) {
        const translations = t[interfaceLang];
        backBtn.textContent = translations.backToMenu || 'Back to List';
    }

    const name = getDisplayName(sign, AppState.settings.quizLang);
    document.title = `${name} Sign Cyprus — Meaning & Explanation`;

    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
        const hint = getDisplayExplanation(sign, AppState.settings.helperLang);
        metaDesc.setAttribute('content', `${name}: ${hint.substring(0, 150)}...`);
    }
}
