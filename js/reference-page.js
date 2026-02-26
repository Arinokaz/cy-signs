/* ==================== REFERENCE PAGE ====================
   Version: 1.1
   Last Updated: 2026-02-26
   
   Features:
   - Single universal search (filters by name, hint, explanation)
   - No category filter
   - Multilingual support (4 languages)
   - Language detection: URL → localStorage (from index.html) → browser → default
   - NEVER writes to localStorage (read-only)
====================================================================== */

import { detectLanguage, t, getDisplayName, getDisplayHint, getDisplayExplanation } from './i18n.js';
import { handleImageError } from './utils.js';

// ==================== STATE ====================
let currentLang = 'en';
let allSignsList = [];  // All signs
let filteredSigns = [];  // Filtered signs
let isLoaded = false;  // Track if signs are loaded

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', () => {
    // Detect language (read-only, DON'T write to localStorage)
    currentLang = detectLanguage(false);

    // Update HTML lang attribute
    document.documentElement.lang = currentLang;

    // Debug: Check if allSigns is available
    console.log('=== Reference Page Loading ===');
    console.log('allSigns available:', typeof allSigns !== 'undefined');
    console.log('allSigns is array:', Array.isArray(allSigns));
    console.log('allSigns length:', allSigns ? allSigns.length : 'N/A');

    // Load signs - check immediately without timeout
    try {
        if (typeof allSigns !== 'undefined' && Array.isArray(allSigns) && allSigns.length > 0) {
            console.log('✓ Signs loaded successfully:', allSigns.length, 'signs');
            
            allSignsList = [...allSigns];
            filteredSigns = [...allSigns];
            isLoaded = true;

            console.log('Getting DOM elements...');
            const spinner = document.getElementById('loading-spinner');
            const referenceScreen = document.getElementById('reference-screen');
            
            console.log('Spinner element:', spinner);
            console.log('Reference screen element:', referenceScreen);

            console.log('Removing inline styles...');
            // No inline styles needed - using CSS classes only
            
            console.log('Hiding spinner with class...');
            spinner.classList.add('hidden');
            
            console.log('Showing reference screen...');
            referenceScreen.classList.remove('hidden');
            
            console.log('Calling renderReferenceList()...');
            renderReferenceList();
            
            console.log('Calling updatePageContent()...');
            updatePageContent();
            
            console.log('✓ Page loaded successfully!');
        } else {
            console.error('✗ allSigns is not loaded or empty');
            console.error('typeof allSigns:', typeof allSigns);
            console.error('allSigns value:', allSigns);
            showLoadingError('Signs data not loaded. Please refresh the page.');
        }
    } catch (error) {
        console.error('✗ Error loading signs:', error);
        showLoadingError('Error loading signs. Please refresh the page.');
    }

    setupEventListeners();
});

// ==================== EVENT LISTENERS ====================
function setupEventListeners() {
    // SEO Accordion toggle
    const seoToggle = document.getElementById('seo-toggle');
    const seoDescriptionWrapper = document.getElementById('seo-description-wrapper');
    const accordionIcon = document.querySelector('.accordion-icon');
    
    if (seoToggle && seoDescriptionWrapper) {
        seoToggle.addEventListener('click', () => {
            seoDescriptionWrapper.classList.toggle('open');
            if (accordionIcon) {
                accordionIcon.classList.toggle('rotated');
            }
        });
    }

    // Search (debounced 300ms)
    const searchInput = document.getElementById('reference-search');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(filterBySearch, 300));

        // Show/hide clear button based on input
        searchInput.addEventListener('input', () => {
            const clearBtn = document.getElementById('clear-search-btn');
            if (clearBtn) {
                clearBtn.style.display = searchInput.value.trim() ? 'block' : 'none';
            }
        });
    }

    // Clear search button
    const clearBtn = document.getElementById('clear-search-btn');
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            const searchInput = document.getElementById('reference-search');
            if (searchInput) {
                searchInput.value = '';
                clearBtn.style.display = 'none';
                searchInput.focus();
                filterBySearch({ target: searchInput });
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

// ==================== RENDER FUNCTIONS ====================
/**
 * Render reference list
 */
function renderReferenceList() {
    const list = document.getElementById('reference-list');
    if (!list) return;

    list.innerHTML = '';

    // If no signs filtered
    if (filteredSigns.length === 0) {
        list.innerHTML = `
            <div class="reference-no-results">
                <p>🔍 No signs found</p>
                <p>Try a different search term or clear the search box</p>
            </div>
        `;
        updateCountDisplay();
        return;
    }

    // Render each sign
    filteredSigns.forEach((sign) => {
        const item = document.createElement('div');
        item.className = 'reference-item';

        const categoryName = t[currentLang].categories?.[sign.cat] || sign.cat;
        const signName = getDisplayName(sign, currentLang);
        const signHint = getDisplayHint(sign, currentLang);
        const signExplanation = getDisplayExplanation(sign, currentLang);

        item.innerHTML = `
            <img src="./img/${sign.file}"
                 alt="${signName}"
                 loading="lazy"
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

/**
 * Filter signs by search query
 * Search in 3 fields: name, hint, explanation
 * If ANY field matches → show the sign
 */
function filterBySearch(e) {
    const query = e.target.value.toLowerCase().trim();

    // If empty query → show all signs
    if (!query) {
        filteredSigns = [...allSignsList];
        renderReferenceList();
        // Analytics: track clear search
        if (typeof gtag !== 'undefined') {
            gtag('event', 'reference_search', {
                event_category: 'reference',
                event_label: 'clear',
                value: 0
            });
        }
        return;
    }

    // Filter by 3 fields: name, hint, explanation
    filteredSigns = allSignsList.filter(sign => {
        const name = getDisplayName(sign, currentLang).toLowerCase();
        const hint = getDisplayHint(sign, currentLang).toLowerCase();
        const explanation = getDisplayExplanation(sign, currentLang).toLowerCase();

        // Match in ANY field
        return name.includes(query) || hint.includes(query) || explanation.includes(query);
    });

    renderReferenceList();
    
    // Analytics: track search
    if (typeof gtag !== 'undefined') {
        gtag('event', 'reference_search', {
            event_category: 'reference',
            event_label: query,
            value: filteredSigns.length
        });
    }
}

/**
 * Update count display
 */
function updateCountDisplay() {
    const countCurrent = document.getElementById('count-current');
    const countTotal = document.getElementById('count-total');

    if (countCurrent) countCurrent.textContent = filteredSigns.length;
    if (countTotal) countTotal.textContent = allSignsList.length;

    // Update text based on language (without recreating elements)
    const signsCount = document.getElementById('signs-count');
    if (signsCount) {
        const texts = {
            en: `Showing <strong id="count-current">${filteredSigns.length}</strong> of <strong id="count-total">${allSignsList.length}</strong> signs`,
            uk: `Показано <strong id="count-current">${filteredSigns.length}</strong> з <strong id="count-total">${allSignsList.length}</strong> знаків`,
            el: `Εμφανίζονται <strong id="count-current">${filteredSigns.length}</strong> από <strong id="count-total">${allSignsList.length}</strong> σήματα`,
            ru: `Показано <strong id="count-current">${filteredSigns.length}</strong> из <strong id="count-total">${allSignsList.length}</strong> знаков`
        };
        // Only update if text changed (avoid unnecessary DOM manipulation)
        const newText = texts[currentLang];
        if (signsCount.innerHTML !== newText) {
            signsCount.innerHTML = newText;
        }
    }
}

// ==================== I18N FUNCTIONS ====================
/**
 * Update all page content based on current language
 */
function updatePageContent() {
    // Safety check: if signs not loaded yet, use 228 as default
    const signsCount = isLoaded ? allSignsList.length : 228;
    
    // Page title
    const pageTitle = document.getElementById('page-title');
    if (pageTitle) {
        const titles = {
            en: `All Cyprus Road Signs — Complete Reference (${signsCount} Signs)`,
            uk: `Всі дорожні знаки Кіпру — Повний довідник (${signsCount} знаків)`,
            el: `Όλες οι Οδικές Πινακίδες Κύπρου — Πλήρης Οδηγός (${signsCount} Σήματα)`,
            ru: `Все дорожные знаки Кипра — Полный справочник (${signsCount} знаков)`
        };
        pageTitle.textContent = titles[currentLang];
    }

    // Meta description
    const metaDesc = document.getElementById('meta-description');
    if (metaDesc) {
        const descriptions = {
            en: `Complete reference of all ${signsCount} Cyprus road signs with explanations, meanings, and rules. Search and learn at your own pace.`,
            uk: `Повний довідник усіх ${signsCount} дорожніх знаків Кіпру з поясненнями та значеннями. Вивчайте у власному темпі.`,
            el: `Πλήρης οδηγός όλων των ${signsCount} οδικών σημάτων της Κύπρου με εξηγήσεις και κανόνες.`,
            ru: `Полный справочник всех ${signsCount} дорожных знаков Кипра с объяснениями и значениями.`
        };
        metaDesc.setAttribute('content', descriptions[currentLang]);
    }

    // OG tags
    const ogTitle = document.getElementById('og-title');
    const ogDesc = document.getElementById('og-description');
    if (ogTitle) ogTitle.setAttribute('content', pageTitle.textContent);
    if (ogDesc) ogDesc.setAttribute('content', metaDesc.getAttribute('content'));

    // SEO content
    updateSEOContent(signsCount);

    // Search placeholder
    const searchInput = document.getElementById('reference-search');
    if (searchInput) {
        const placeholders = {
            en: '🔍 Search signs by name, hint, or explanation...',
            uk: '🔍 Пошук знаків за назвою, підказкою або поясненням...',
            el: '🔍 Αναζήτηση σημάτων κατά όνομα, υπόδειξη ή εξήγηση...',
            ru: '🔍 Поиск знаков по названию, подсказке или объяснению...'
        };
        searchInput.placeholder = placeholders[currentLang];
    }

    // Back button
    const backBtn = document.getElementById('back-btn');
    if (backBtn) {
        const backTexts = {
            en: '← Back to Menu',
            uk: '← До меню',
            el: '← Πίσω στο Μενού',
            ru: '← В меню'
        };
        backBtn.textContent = backTexts[currentLang];
    }

    // Update Schema.org
    updateSchemaOrg();
}

/**
 * Update SEO content
 */
function updateSEOContent(signsCount = 228) {
    const seoTitle = document.getElementById('seo-title');
    const seoDesc = document.getElementById('seo-description');

    if (seoTitle) {
        const seoTitles = {
            en: `📚 Cyprus Road Signs (${signsCount})`,
            uk: `📚 Дорожні знаки Кіпру (${signsCount})`,
            el: `📚 Οδικές Πινακίδες Κύπρου (${signsCount})`,
            ru: `📚 Дорожные знаки Кипра (${signsCount})`
        };
        seoTitle.textContent = seoTitles[currentLang];
    }

    if (seoDesc) {
        const seoDescriptions = {
            en: `Complete reference with explanations and rules. Search by name, hint, or description.`,
            uk: `Повний довідник з поясненнями та правилами. Пошук за назвою, підказкою або описом.`,
            el: `Πλήρης οδηγός με εξηγήσεις και κανόνες. Αναζήτηση κατά όνομα, υπόδειξη ή περιγραφή.`,
            ru: `Полный справочник с объяснениями и правилами. Поиск по названию, подсказке или описанию.`
        };
        seoDesc.textContent = seoDescriptions[currentLang];
    }
}

/**
 * Update Schema.org JSON-LD
 */
function updateSchemaOrg() {
    const schemaScript = document.getElementById('schema-json');
    if (!schemaScript) return;
    
    const schemaData = {
        "@context": "https://schema.org",
        "@type": "ItemList",
        "name": getSchemaName(),
        "description": getSchemaDescription(),
        "numberOfItems": allSignsList.length,
        "itemListElement": filteredSigns.slice(0, 10).map((sign, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "name": getDisplayName(sign, currentLang),
            "description": getDisplayHint(sign, currentLang)
        }))
    };
    
    schemaScript.textContent = JSON.stringify(schemaData);
}

function getSchemaName() {
    const names = {
        en: 'Cyprus Road Signs Complete List',
        uk: 'Повний список дорожніх знаків Кіпру',
        el: 'Πλήρης Λίστα Οδικών Σημάτων Κύπρου',
        ru: 'Полный список дорожных знаков Кипра'
    };
    return names[currentLang];
}

function getSchemaDescription() {
    const descriptions = {
        en: 'Complete list of 228 Cyprus road signs with explanations',
        uk: 'Повний список з 228 дорожніх знаків Кіпру з поясненнями',
        el: 'Πλήρης λίστα 228 οδικών σημάτων της Κύπρου με εξηγήσεις',
        ru: 'Полный список из 228 дорожных знаков Кипра с объяснениями'
    };
    return descriptions[currentLang];
}

// ==================== UTILITIES ====================
/**
 * Debounce function
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Show loading error
 */
function showLoadingError(message = 'Error loading signs.') {
    const spinner = document.getElementById('loading-spinner');
    const loadingText = document.getElementById('loading-text');
    
    if (spinner) {
        spinner.classList.add('hidden');
    }
    
    if (loadingText) {
        loadingText.innerHTML = `
            <span style="color: var(--danger); font-size: 16px; font-weight: 600;">${message}</span><br>
            <button class="main-btn" style="margin-top: 15px;" onclick="location.reload()">🔄 Refresh Page</button>
        `;
    }
}
