/* ==================== SIGN PAGE ====================
   Version: 1.0
   Last Updated: 2026-02-28
   Страница отдельного знака
====================================================================== */

import { detectLanguage, t, getDisplayName, getDisplayExplanation, getCategoryName } from './i18n.js';
import { handleImageError } from './utils.js';

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', () => {
    // 1. Детектим язык (read-only, не пишем в localStorage)
    const currentLang = detectLanguage(false);
    document.documentElement.lang = currentLang;
    
    // 2. Получаем ID знака из URL pathname
    // URL: signs/built-up-area.html → signId = "built-up-area"
    const pathname = window.location.pathname;
    const filename = pathname.substring(pathname.lastIndexOf('/') + 1);
    const signId = filename.replace('.html', '');
    
    // 3. Проверяем загрузку данных
    if (typeof allSigns === 'undefined' || !Array.isArray(allSigns) || allSigns.length === 0) {
        showLoadingError('Signs database not loaded');
        return;
    }
    
    // 4. Находим знак по ID
    const sign = findSignById(signId);
    
    if (!sign) {
        showLoadingError('Sign not found');
        setTimeout(() => {
            window.location.href = '../reference.html';
        }, 2000);
        return;
    }
    
    // 5. Сохраняем в localStorage для возврата
    localStorage.setItem('scrollToSign', sign.file);
    
    // 6. Показываем контент
    showSignContent(sign, currentLang);
});

/**
 * Находит знак по ID
 * Теперь используется sign.id из signs-data.js
 */
function findSignById(signId) {
    // Прямой поиск по sign.id
    for (const sign of allSigns) {
        if (sign.id === signId) {
            return sign;
        }
    }
    return null;
}

/**
 * Показывает ошибку загрузки
 */
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

/**
 * Показывает контент знака
 */
function showSignContent(sign, lang) {
    // Скрываем спиннер, показываем контент
    const loadingSpinner = document.getElementById('loading-spinner');
    const signScreen = document.getElementById('sign-screen');
    
    if (loadingSpinner) loadingSpinner.classList.add('hidden');
    if (signScreen) signScreen.classList.remove('hidden');
    
    // Обновляем картинку
    const signImg = document.getElementById('sign-img');
    if (signImg) {
        signImg.src = `../img/${sign.file}`;
        signImg.alt = getDisplayName(sign, lang);
        signImg.onerror = () => handleImageError(signImg);
    }
    
    // Обновляем название
    const signName = document.getElementById('sign-name');
    if (signName) {
        signName.textContent = getDisplayName(sign, lang);
    }
    
    // Обновляем категорию
    const signCategory = document.getElementById('sign-category');
    if (signCategory) {
        signCategory.textContent = getCategoryName(sign.cat, lang);
    }
    
    // Обновляем описание
    const signExplanation = document.getElementById('sign-explanation');
    if (signExplanation) {
        signExplanation.textContent = getDisplayExplanation(sign, lang);
    }
    
    // Обновляем кнопку назад
    const backBtn = document.getElementById('back-btn');
    if (backBtn) {
        const translations = t[lang];
        backBtn.textContent = translations.backToMenu || 'Back to List';
    }
    
    // Обновляем заголовок страницы
    const name = getDisplayName(sign, lang);
    document.title = `${name} Sign Cyprus — Meaning & Explanation`;
    
    // Обновляем meta description
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
        const hint = getDisplayExplanation(sign, lang);
        metaDesc.setAttribute('content', `${name}: ${hint.substring(0, 150)}...`);
    }
}
