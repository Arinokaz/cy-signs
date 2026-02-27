/* ==================== REFERENCE PAGE ====================
   Version: 2.1
   Last Updated: 2026-02-26
   
   Uses translations from translations.js
====================================================================== */

import { detectLanguage, t, getDisplayName, getDisplayHint, getDisplayExplanation } from './i18n.js';
import { handleImageError } from './utils.js';

// State
let currentLang = 'en';
let allSignsList = [];
let filteredSigns = [];

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', () => {
    // Detect language
    currentLang = detectLanguage(false);
    document.documentElement.lang = currentLang;

    // Check if signs are loaded
    if (typeof allSigns === 'undefined' || !Array.isArray(allSigns) || allSigns.length === 0) {
        document.getElementById('loading-text').innerHTML = `
            <span style="color: var(--danger);">Error loading signs.</span><br>
            <button class="main-btn" style="margin-top: 15px;" onclick="location.reload()">🔄 Refresh</button>
        `;
        return;
    }

    // Initialize
    allSignsList = [...allSigns];
    filteredSigns = [...allSigns];

    // Show reference screen, hide spinner
    const spinner = document.getElementById('loading-spinner');
    const referenceScreen = document.getElementById('reference-screen');
    
    spinner.style.display = 'none';
    referenceScreen.style.display = 'block';

    // Render content
    updatePageContent();
    renderReferenceList();
    setupEventListeners();
});

// ==================== EVENT LISTENERS ====================
function setupEventListeners() {
    // SEO Accordion
    const seoToggle = document.getElementById('seo-toggle');
    const seoWrapper = document.getElementById('seo-description-wrapper');
    const accordionIcon = document.querySelector('.accordion-icon');
    
    if (seoToggle && seoWrapper) {
        seoToggle.addEventListener('click', () => {
            seoWrapper.classList.toggle('open');
            if (accordionIcon) accordionIcon.classList.toggle('rotated');
        });
    }

    // Search
    const searchInput = document.getElementById('reference-search');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(() => {
            filterBySearch(searchInput.value);
            
            // Show/hide clear button
            const clearBtn = document.getElementById('clear-search-btn');
            if (clearBtn) {
                clearBtn.style.display = searchInput.value.trim() ? 'block' : 'none';
            }
        }, 300));
    }

    // Clear button
    const clearBtn = document.getElementById('clear-search-btn');
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            const searchInput = document.getElementById('reference-search');
            if (searchInput) {
                searchInput.value = '';
                clearBtn.style.display = 'none';
                searchInput.focus();
                filterBySearch('');
            }
        });
    }

    // Back button
    const backBtn = document.getElementById('back-btn');
    if (backBtn) {
        backBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = 'index.html';
        });
    }
}

// ==================== RENDER ====================
function renderReferenceList() {
    const list = document.getElementById('reference-list');
    if (!list) return;

    list.innerHTML = '';

    if (filteredSigns.length === 0) {
        const tr = t[currentLang];
        list.innerHTML = `
            <div class="reference-no-results">
                <p>${tr.referenceNoResults || '🔍 No signs found'}</p>
                <p>${tr.referenceTryDifferent || 'Try a different search term'}</p>
            </div>
        `;
        updateCountDisplay();
        return;
    }

    filteredSigns.forEach(sign => {
        const item = document.createElement('div');
        item.className = 'reference-item';

        const categoryName = t[currentLang].categories?.[sign.cat] || sign.cat;
        const signName = getDisplayName(sign, currentLang);
        const signHint = getDisplayHint(sign, currentLang);
        const signExplanation = getDisplayExplanation(sign, currentLang);

        item.innerHTML = `
            <img src="./img/${sign.file}" alt="${signName}" loading="lazy"
                 onerror="this.onerror=null; handleImageError(this);">
            <div class="reference-content">
                <div class="reference-category ${sign.cat}">${categoryName}</div>
                <div class="reference-name">${signName}</div>
                <div class="reference-hint">${signHint}</div>
                <div class="reference-explanation">${signExplanation}</div>
            </div>
        `;

        list.appendChild(item);
    });

    updateCountDisplay();
}

function filterBySearch(query) {
    query = query.toLowerCase().trim();

    if (!query) {
        filteredSigns = [...allSignsList];
    } else {
        // Search only by name (case-insensitive)
        filteredSigns = allSignsList.filter(sign => {
            const name = getDisplayName(sign, currentLang).toLowerCase();
            return name.includes(query);
        });
    }

    renderReferenceList();
}

function updateCountDisplay() {
    const countCurrent = document.getElementById('count-current');
    const countTotal = document.getElementById('count-total');
    const signsCount = document.getElementById('signs-count');
    const tr = t[currentLang];

    if (countCurrent) countCurrent.textContent = filteredSigns.length;
    if (countTotal) countTotal.textContent = allSignsList.length;

    if (signsCount) {
        // Use template from translations.js
        const template = tr.referenceShowing || 'Showing {current} of {total} signs';
        const text = template
            .replace('{current}', filteredSigns.length)
            .replace('{total}', allSignsList.length);
        signsCount.innerHTML = text
            .replace('{current}', `<strong id="count-current">${filteredSigns.length}</strong>`)
            .replace('{total}', `<strong id="count-total">${allSignsList.length}</strong>`);
    }
}

// ==================== I18N ====================
function updatePageContent() {
    const signsCount = allSignsList.length;
    const tr = t[currentLang];
    
    // Title - use translations.js
    const pageTitle = document.getElementById('page-title');
    if (pageTitle) {
        const titleTemplate = tr.referenceTitle || 'Road Signs Reference';
        pageTitle.textContent = `${titleTemplate} (${signsCount})`;
    }

    // Meta description - use translations.js
    const metaDesc = document.getElementById('meta-description');
    if (metaDesc) {
        const template = tr.referenceMetaDescription || 'Complete reference of all {count} Cyprus road signs.';
        metaDesc.setAttribute('content', template.replace('{count}', signsCount));
    }

    // SEO content - translate H1 based on language
    const seoTitle = document.getElementById('seo-title');
    const seoDesc = document.getElementById('seo-description');

    if (seoTitle) {
        const template = tr.referenceH1 || '📚 Cyprus Road Signs Reference ({count} Signs)';
        seoTitle.textContent = template.replace('{count}', signsCount);
    }
    
    if (seoDesc) {
        seoDesc.textContent = tr.referenceSEODescription || 'Complete reference with explanations and rules.';
    }

    // Search placeholder - use translations.js
    const searchInput = document.getElementById('reference-search');
    if (searchInput) {
        searchInput.placeholder = tr.referenceSearchPlaceholder || '🔍 Search signs...';
    }

    // Back button - use translations.js
    const backBtn = document.getElementById('back-btn');
    if (backBtn) {
        backBtn.textContent = tr.backToMenu || '← Back to Menu';
    }
}

// ==================== UTILS ====================
function debounce(func, wait) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}
