/* ==================== REFERENCE MODE ====================
   Version: 3.0
   Last Updated: 2026-02-24
====================================================================== */

import { AppState } from './state.js';
import { showScreen } from './ui.js';
import { getDisplayName, getDisplayExplanation, t } from './i18n.js';
import { handleImageError } from './utils.js';

// t is the translations object (imported from i18n.js)

// Debounce timer for search
let searchDebounceTimer = null;

/**
 * Debounce function to limit search execution
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function}
 */
function debounce(func, wait) {
    return function executedFunction(...args) {
        if (searchDebounceTimer) {
            clearTimeout(searchDebounceTimer);
        }
        searchDebounceTimer = setTimeout(() => {
            func.apply(this, args);
        }, wait);
    };
}

/**
 * Show reference mode (all signs catalog)
 */
export function showReference() {
    if (!allSigns || allSigns.length === 0) {
        alert('Error: Signs database not loaded. Please refresh the page.');
        return;
    }

    // Analytics
    if (typeof gtag !== 'undefined') {
        gtag('event', 'mode_select', {
            event_category: 'training',
            event_label: 'Reference Mode'
        });
    }

    const translations = t[AppState.settings.interfaceLang];

    const referenceTitle = document.querySelector('#reference-screen h2');
    if (referenceTitle) referenceTitle.textContent = `📖 ${translations.referenceTitle}`;

    const searchInput = document.getElementById('reference-search');
    if (searchInput) {
        searchInput.value = '';
    }

    const isFavOnly = document.getElementById('fav-only')?.checked || false;
    const selectedCat = AppState.quiz.selectedCategory || 'all';

    let filteredSigns = isFavOnly ? allSigns.filter(s => s.fav) : allSigns;
    if (selectedCat !== 'all') {
        filteredSigns = filteredSigns.filter(s => s.cat === selectedCat);
    }

    const list = document.getElementById('reference-list');
    if (list) {
        list.innerHTML = '';

        filteredSigns.forEach(sign => {
            const item = document.createElement('div');
            item.className = 'reference-item';
            item.setAttribute('data-name', getDisplayName(sign, AppState.settings.interfaceLang));

            const categoryName = translations.categories[sign.cat] || sign.cat;
            const signName = getDisplayName(sign, AppState.settings.interfaceLang);
            const signExplanation = getDisplayExplanation(sign, AppState.settings.interfaceLang);

            const img = document.createElement('img');
            img.src = `./img/${sign.file}`;
            img.alt = signName;
            img.onerror = () => handleImageError(img);

            const contentDiv = document.createElement('div');
            contentDiv.className = 'reference-content';

            const categoryDiv = document.createElement('div');
            categoryDiv.className = `reference-category ${sign.cat}`;
            categoryDiv.textContent = categoryName;

            const nameDiv = document.createElement('div');
            nameDiv.className = 'reference-name';
            nameDiv.textContent = signName;

            const explanationDiv = document.createElement('div');
            explanationDiv.className = 'reference-hint';
            explanationDiv.textContent = signExplanation;

            contentDiv.appendChild(categoryDiv);
            contentDiv.appendChild(nameDiv);
            contentDiv.appendChild(explanationDiv);

            item.appendChild(img);
            item.appendChild(contentDiv);
            list.appendChild(item);
        });

        // Update title with count
        const referenceTitleEl = document.querySelector('#reference-screen h2');
        if (referenceTitleEl) {
            referenceTitleEl.textContent = `📖 ${translations.referenceTitle} (${filteredSigns.length})`;
        }
    }

    const seoFooter = document.getElementById('seo-footer');
    if (seoFooter) seoFooter.style.display = 'none';

    showScreen('reference-screen');
}

/**
 * Filter reference list by search query (debounced)
 */
export const filterReference = debounce(function() {
    const searchInput = document.getElementById('reference-search');
    const query = searchInput ? searchInput.value.toLowerCase() : '';
    const items = document.querySelectorAll('.reference-item');

    items.forEach(item => {
        const signName = item.getAttribute('data-name').toLowerCase();
        item.style.display = signName.includes(query) ? 'flex' : 'none';
    });
}, 300); // 300ms debounce delay
