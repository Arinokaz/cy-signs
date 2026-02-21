/* ==================== CYPRUS ROAD SIGNS - APP LOGIC ====================
   Version: 2.1
   Last Updated: 2026-02-20
   Refactored: XSS fixed, showScreen(), AppState, null-safe checks
====================================================================== */

// ==================== STATE ====================
const AppState = {
    showRetryButton: false,  // ✅ Глобальный динамический флаг
    quiz: {
        current: 0,
        points: 0,
        testSet: [],
        results: [],
        selectedCategory: 'all',
        currentOptionsSigns: [],
        savedTestSet: null,
        showRetry: true      // ✅ Константа: Quiz ВСЕГДА показывает кнопку
    },
    timing: {
        questionStartTime: 0,
        questionTimes: [],
        totalStartTime: 0
    },
    flashcard: {
        mode: false,
        answerShown: false,
        showRetry: false     // ✅ Константа: Flashcard НИКОГДА не показывает кнопку
    },
    settings: {
        interfaceLang: 'en',
        quizLang: 'en',
        helperLang: 'en',
        showingTranslation: false
    }
};

// ==================== INITIALIZATION ====================
window.addEventListener('DOMContentLoaded', () => {
    // При загрузке — кнопка Retry скрыта
    AppState.showRetryButton = false;
    
    // Определяем язык браузера и устанавливаем если поддерживается
    detectAndSetBrowserLanguage();
    
    updateUI();
    setupServiceWorker();

    setTimeout(() => {
        if (typeof allSigns !== 'undefined' && allSigns.length > 0) {
            document.getElementById('loading-spinner').classList.add('hidden');
            document.getElementById('start-screen').classList.remove('hidden');
        } else {
            const loadingText = document.getElementById('loading-text');
            if (loadingText) {
                loadingText.innerHTML = '';
                
                const errorSpan = document.createElement('span');
                errorSpan.style.color = 'var(--danger)';
                errorSpan.textContent = 'Error loading signs.';
                loadingText.appendChild(errorSpan);
                
                const lineBreak = document.createElement('br');
                loadingText.appendChild(lineBreak);
                
                const refreshBtn = document.createElement('button');
                refreshBtn.className = 'main-btn';
                refreshBtn.style.marginTop = '15px';
                refreshBtn.textContent = '🔄 Refresh Page';
                refreshBtn.onclick = () => location.reload();
                loadingText.appendChild(refreshBtn);
            }
        }
    }, 500);
});

// ==================== LANGUAGE DETECTION ====================
function detectAndSetBrowserLanguage() {
    const supportedLangs = ['en', 'uk', 'el', 'ru'];
    
    // 1. Сначала проверяем URL параметр ?lang=
    const urlParams = new URLSearchParams(window.location.search);
    const urlLang = urlParams.get('lang');
    
    if (urlLang && supportedLangs.includes(urlLang)) {
        AppState.settings.interfaceLang = urlLang;
        const interfaceLangSelect = document.getElementById('interface-lang');
        if (interfaceLangSelect) {
            interfaceLangSelect.value = urlLang;
        }
        document.documentElement.lang = urlLang;
        return;
    }
    
    // 2. Если нет в URL — проверяем язык браузера
    const browserLang = navigator.language || navigator.userLanguage;
    const primaryLang = browserLang.split('-')[0].toLowerCase();
    
    if (supportedLangs.includes(primaryLang)) {
        AppState.settings.interfaceLang = primaryLang;
        
        const interfaceLangSelect = document.getElementById('interface-lang');
        if (interfaceLangSelect) {
            interfaceLangSelect.value = primaryLang;
        }
        
        document.documentElement.lang = primaryLang;
    }
    // 3. Если не поддерживается — остаётся English (по умолчанию в AppState)
}

// ==================== SERVICE WORKER ====================
function setupServiceWorker() {
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

// ==================== SCREEN MANAGEMENT ====================
function showScreen(screenId) {
    const screens = ['start-screen', 'quiz-screen', 'result-screen', 'flashcard-screen', 'reference-screen', 'feedback-screen'];
    screens.forEach(id => {
        const screen = document.getElementById(id);
        if (screen) {
            screen.classList.toggle('hidden', id !== screenId);
        }
    });
}

// ==================== LANGUAGE FUNCTIONS ====================
function updateUILanguage() {
    const interfaceLangSelect = document.getElementById('interface-lang');
    if (interfaceLangSelect) {
        const lang = interfaceLangSelect.value;
        AppState.settings.interfaceLang = lang;
        document.documentElement.lang = lang;
        
        // Динамічний Title для SEO
        const titles = {
            en: 'Cyprus Road Signs Quiz — Free Driving Test Practice (217 Signs)',
            uk: 'Дорожні знаки Кіпру — Безкоштовний онлайн тест (217 знаків)',
            el: 'Οδικές Πινακίδες Κύπρου — Δωρεάν Θεωρητικό Τεστ (217 Σήματα)',
            ru: 'Дорожные знаки Кипра — Бесплатный онлайн тест (217 знаков)'
        };
        document.title = titles[lang] || titles.en;
        
        // Динамічний meta description
        const descriptions = {
            en: 'Interactive quiz app for learning Cyprus road signs. 217 signs, 4 languages, offline PWA support. Free driving test preparation.',
            uk: 'Інтерактивний додаток для вивчення дорожніх знаків Кіпру. 217 знаків, 4 мови, офлайн режим. Безкоштовна підготовка до екзамену.',
            el: 'Διαδραστική εφαρμογή για την εκμάθηση οδικών πινακίδων Κύπρου. 217 σήματα, 4 γλώσσες, υποστήριξη εκτός σύνδεσης.',
            ru: 'Интерактивное приложение для изучения дорожных знаков Кипра. 217 знаков, 4 языка, офлайн режим. Бесплатная подготовка к экзамену.'
        };
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) {
            metaDesc.setAttribute('content', descriptions[lang] || descriptions.en);
        }
        
        updateUI();
    }
}

function saveQuizLang() {
    const quizLangSelect = document.getElementById('quiz-lang');
    if (quizLangSelect) {
        AppState.settings.quizLang = quizLangSelect.value;
    }
}

function saveHelperLang() {
    const helperLangSelect = document.getElementById('helper-lang');
    if (helperLangSelect) {
        AppState.settings.helperLang = helperLangSelect.value;
    }
}

function updateUI() {
    const t = UI_TRANSLATIONS[AppState.settings.interfaceLang];

    // Безопасное обновление UI элементов
    const elements = {
        'ui-title': t.title,
        'ui-fav-only': t.favOnly,
        'ui-interface-lang': t.interfaceLang,
        'ui-quiz-lang': t.quizLang,
        'ui-helper-lang': t.helperLang,
        'ui-category': t.category,
        'ui-questions': t.questions,
        'ui-quiz-mode-btn': t.quizModeBtn,
        'ui-flashcard-btn': t.flashcardBtn,
        'ui-back-btn': t.backToMenu,
        'ui-retry-btn': t.retryBtn,
        'ui-reference-btn': t.referenceBtn,
        'ui-feedback-title': t.feedbackTitle
    };

    for (const [id, text] of Object.entries(elements)) {
        const el = document.getElementById(id);
        if (el) el.textContent = text;
    }

    // Обновляем label'ы для формы feedback
    const feedbackNameLabel = document.querySelector('label[for="feedback-name"]');
    if (feedbackNameLabel) feedbackNameLabel.textContent = `${t.feedbackName}`;
    
    const feedbackEmailLabel = document.querySelector('label[for="feedback-email"]');
    if (feedbackEmailLabel) feedbackEmailLabel.textContent = `${t.feedbackEmail}`;
    
    const feedbackRatingLabel = document.querySelector('label[for="feedback-rating"]');
    if (feedbackRatingLabel) feedbackRatingLabel.textContent = `${t.feedbackRating}`;
    
    const feedbackMessageLabel = document.querySelector('label[for="feedback-message"]');
    if (feedbackMessageLabel) feedbackMessageLabel.textContent = `${t.feedbackMessage}`;
    
    const feedbackTextarea = document.getElementById('feedback-message');
    if (feedbackTextarea) feedbackTextarea.placeholder = t.feedbackPlaceholder;
    
    const feedbackSubmitBtn = document.getElementById('feedback-submit-btn');
    if (feedbackSubmitBtn) feedbackSubmitBtn.textContent = t.feedbackSend;

    // ui-score на экране результатов — может быть null
    const uiScore = document.getElementById('ui-score');
    if (uiScore) {
        uiScore.textContent = t.score;
    }
    
    const translateToggle = document.getElementById('translate-toggle');
    if (translateToggle) {
        translateToggle.textContent = t.showTranslate;
    }

    document.querySelectorAll('.category-btn').forEach(btn => {
        const key = btn.dataset.key;
        if (key && t.categories[key]) btn.textContent = t.categories[key];
    });

    const questionCount = document.getElementById('question-count');
    if (questionCount) {
        const opts = questionCount.querySelectorAll('option');
        if (opts[0]) opts[0].textContent = t.questionCount["5"];
        if (opts[1]) opts[1].textContent = t.questionCount["10"];
        if (opts[2]) opts[2].textContent = t.questionCount["20"];
        if (opts[3]) opts[3].textContent = t.questionCount["50"];
        if (opts[4]) opts[4].textContent = t.questionCount["all"];
    }
}

function getDisplayName(sign, lang) { return sign.name[lang] || sign.name.en; }
function getDisplayHint(sign, lang) { return sign.hint[lang] || sign.hint.en; }

function handleImageError(imgElement) {
    imgElement.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="150" height="150" viewBox="0 0 150 150"><rect fill="%23ddd" width="150" height="150"/><text fill="%23666" x="50%" y="50%" text-anchor="middle" dy=".3em" font-family="Arial" font-size="14">No Image</text></svg>';
    imgElement.style.maxHeight = '100px';
}

function toggleTranslate() {
    AppState.settings.showingTranslation = !AppState.settings.showingTranslation;
    const btn = document.getElementById('translate-toggle');
    if (btn) {
        const t = UI_TRANSLATIONS[AppState.settings.interfaceLang];
        btn.textContent = AppState.settings.showingTranslation ? t.hideTranslate : t.showTranslate;
        btn.classList.toggle('active', AppState.settings.showingTranslation);
    }

    if (AppState.quiz.testSet.length > 0 && AppState.quiz.current < AppState.quiz.testSet.length) {
        updateOptionsText();
    }
}

function updateOptionsText() {
    const quizLangCurrent = getCurrentQuizLang();
    const buttons = document.querySelectorAll('#options button');

    AppState.quiz.currentOptionsSigns.forEach((sign, index) => {
        if (index < buttons.length) {
            buttons[index].innerText = getDisplayName(sign, quizLangCurrent);
        }
    });
}

function getCurrentQuizLang() {
    return AppState.settings.showingTranslation ? AppState.settings.helperLang : AppState.settings.quizLang;
}

// ==================== TIMER FUNCTIONS ====================
function getTimeColor(seconds) {
    const styles = getComputedStyle(document.documentElement);
    if (seconds < 5) return styles.getPropertyValue('--success').trim();
    if (seconds <= 10) return styles.getPropertyValue('--warning').trim();
    return styles.getPropertyValue('--danger').trim();
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    if (mins > 0) {
        const minText = AppState.settings.interfaceLang === 'en' ? 'min' :
                       AppState.settings.interfaceLang === 'el' ? 'λεπ' : 'хв';
        return `${mins} ${minText} ${secs} ${UI_TRANSLATIONS[AppState.settings.interfaceLang].seconds}`;
    }
    return `${secs} ${UI_TRANSLATIONS[AppState.settings.interfaceLang].seconds}`;
}

// ==================== GAME FUNCTIONS ====================
function setCat(cat, btn) {
    AppState.quiz.selectedCategory = cat;
    document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');
}

function shuffle(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

function start() {
    if (!allSigns || allSigns.length === 0) {
        alert('Error: Signs database not loaded. Please refresh the page.');
        return;
    }

    if (typeof gtag !== 'undefined') {
        gtag('event', 'mode_select', {
            event_category: 'training',
            event_label: 'Quiz Mode'
        });
    }

    const quizLangSelect = document.getElementById('quiz-lang');
    const helperLangSelect = document.getElementById('helper-lang');
    const favOnlyCheckbox = document.getElementById('fav-only');
    const questionCountSelect = document.getElementById('question-count');
    
    if (quizLangSelect) AppState.settings.quizLang = quizLangSelect.value;
    if (helperLangSelect) AppState.settings.helperLang = helperLangSelect.value;
    AppState.settings.showingTranslation = false;
    AppState.flashcard.mode = false;
    AppState.showRetryButton = AppState.quiz.showRetry;

    const isFavOnly = favOnlyCheckbox ? favOnlyCheckbox.checked : false;
    let base = isFavOnly ? allSigns.filter(s => s.fav) : allSigns;
    base = AppState.quiz.selectedCategory === 'all' ? base : base.filter(s => s.cat === AppState.quiz.selectedCategory);

    if (base.length === 0) {
        alert(UI_TRANSLATIONS[AppState.settings.interfaceLang].noSignsInCat);
        return;
    }

    const countSelect = questionCountSelect ? questionCountSelect.value : '20';
    let requestedCount = countSelect === 'all' ? base.length : parseInt(countSelect);
    let totalQuestions = Math.min(requestedCount, base.length);

    AppState.quiz.testSet = shuffle(base).slice(0, totalQuestions);
    AppState.quiz.savedTestSet = [...AppState.quiz.testSet];
    AppState.quiz.current = 0;
    AppState.quiz.points = 0;
    AppState.quiz.results = [];
    AppState.timing.questionTimes = [];
    AppState.timing.totalStartTime = Date.now();

    // Ховаємо SEO футер під час тесту
    const seoFooter = document.getElementById('seo-footer');
    if (seoFooter) seoFooter.style.display = 'none';

    showScreen('quiz-screen');
    render();
}

function render() {
    const q = AppState.quiz.testSet[AppState.quiz.current];
    const t = UI_TRANSLATIONS[AppState.settings.interfaceLang];
    const quizLangCurrent = getCurrentQuizLang();

    const progressPercent = ((AppState.quiz.current + 1) / AppState.quiz.testSet.length) * 100;
    const progressFill = document.getElementById('progress-fill');
    if (progressFill) progressFill.style.width = `${progressPercent}%`;

    const progressEl = document.getElementById('progress');
    if (progressEl) progressEl.innerText = `${t.progress} ${AppState.quiz.current + 1} ${t.of} ${AppState.quiz.testSet.length}`;
    
    const qImg = document.getElementById('q-img');
    if (qImg) qImg.src = "./img/" + q.file;

    AppState.timing.questionStartTime = Date.now();

    const oldHint = document.getElementById('active-hint');
    if (oldHint) oldHint.remove();
    const oldNext = document.getElementById('next-btn-manual');
    if (oldNext) oldNext.remove();

    const quizButtons = document.getElementById('quiz-buttons');
    if (quizButtons) {
        while (quizButtons.firstChild) {
            quizButtons.removeChild(quizButtons.firstChild);
        }
    }

    let optionsSigns = [q];
    let others = allSigns.filter(s => s.file !== q.file)
        .sort(() => 0.5 - Math.random()).slice(0, 3);
    optionsSigns = [...optionsSigns, ...others].sort(() => 0.5 - Math.random());

    AppState.quiz.currentOptionsSigns = optionsSigns;

    const container = document.getElementById('options');
    if (container) {
        container.innerHTML = '';
        optionsSigns.forEach(sign => {
            const b = document.createElement('button');
            b.innerText = getDisplayName(sign, quizLangCurrent);
            b.onclick = () => check(sign, b);
            container.appendChild(b);
        });
    }

    const translateBtn = document.getElementById('translate-toggle');
    if (translateBtn) {
        translateBtn.textContent = AppState.settings.showingTranslation ? t.hideTranslate : t.showTranslate;
        translateBtn.classList.toggle('active', AppState.settings.showingTranslation);
    }
}

function check(ans, btn) {
    const q = AppState.quiz.testSet[AppState.quiz.current];
    const quizLangCurrent = getCurrentQuizLang();
    const correct = getDisplayName(q, quizLangCurrent);
    const btns = document.querySelectorAll('#options button');
    btns.forEach(b => b.disabled = true);

    const userAnswerText = getDisplayName(ans, quizLangCurrent);
    const isOk = ans.file === q.file;

    const timeSpent = (Date.now() - AppState.timing.questionStartTime) / 1000;
    AppState.timing.questionTimes.push({ time: timeSpent, isCorrect: isOk });
    AppState.quiz.results.push({ q, isOk, userChoice: userAnswerText, time: timeSpent });

    if (isOk) {
        if (btn) btn.classList.add('correct');
        AppState.quiz.points++;
        setTimeout(next, 1000);
    } else {
        if (btn) btn.classList.add('wrong');
        btns.forEach(b => {
            if (b.innerText === correct) b.classList.add('correct');
        });

        const t = UI_TRANSLATIONS[AppState.settings.interfaceLang];
        const hintText = getDisplayHint(q, AppState.settings.helperLang);

        const hintDiv = document.createElement('div');
        hintDiv.id = 'active-hint';
        hintDiv.className = 'hint-box';
        const hintTitle = document.createElement('strong');
        hintTitle.textContent = `💡 ${t.hintLabel}`;
        hintDiv.appendChild(hintTitle);
        hintDiv.appendChild(document.createElement('br'));
        hintDiv.appendChild(document.createTextNode(hintText || 'Підказка відсутня'));

        const optionsContainer = document.getElementById('options');
        if (optionsContainer) optionsContainer.appendChild(hintDiv);

        const nextBtn = document.createElement('button');
        nextBtn.id = 'next-btn-manual';
        nextBtn.innerText = t.nextBtn;
        nextBtn.className = "main-btn";
        nextBtn.onclick = next;
        const quizButtons = document.getElementById('quiz-buttons');
        if (quizButtons) quizButtons.appendChild(nextBtn);

        setTimeout(() => {
            if (hintDiv) {
                hintDiv.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                });
            }
        }, 100);
    }
}

function next() {
    AppState.quiz.current++;
    AppState.quiz.currentOptionsSigns = [];
    if (AppState.quiz.current < AppState.quiz.testSet.length) render();
    else finish();
}

function retry() {
    if (!AppState.quiz.savedTestSet) return;

    AppState.timing.questionTimes.length = 0;
    AppState.quiz.results.length = 0;
    AppState.quiz.currentOptionsSigns.length = 0;

    AppState.quiz.testSet = [...AppState.quiz.savedTestSet];
    AppState.quiz.current = 0;
    AppState.quiz.points = 0;
    AppState.timing.totalStartTime = Date.now();
    AppState.settings.showingTranslation = false;

    showScreen('quiz-screen');
    render();
}

function backToMenu() {
    AppState.quiz.savedTestSet = null;
    AppState.flashcard.mode = false;
    AppState.showRetryButton = false;
    AppState.quiz.selectedCategory = 'all';
    
    const favOnlyCheckbox = document.getElementById('fav-only');
    const quizLangSelect = document.getElementById('quiz-lang');
    const helperLangSelect = document.getElementById('helper-lang');
    
    if (favOnlyCheckbox) favOnlyCheckbox.checked = false;
    if (quizLangSelect) quizLangSelect.value = AppState.settings.quizLang;
    if (helperLangSelect) helperLangSelect.value = AppState.settings.helperLang;

    showScreen('start-screen');

    // Показуємо SEO футер на головному екрані
    const seoFooter = document.getElementById('seo-footer');
    if (seoFooter) seoFooter.style.display = 'block';

    document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
    const defaultCat = document.querySelector('.category-btn[data-key="all"]');
    if (defaultCat) defaultCat.classList.add('active');

    updateUI();
}

function finish() {
    const t = UI_TRANSLATIONS[AppState.settings.interfaceLang];

    showScreen('result-screen');

    const scoreEl = document.getElementById('score');
    const totalQEl = document.getElementById('total-q');
    if (scoreEl) scoreEl.innerText = AppState.quiz.points;
    if (totalQEl) totalQEl.innerText = AppState.quiz.testSet.length;

    const totalTime = (Date.now() - AppState.timing.totalStartTime) / 1000;

    const resultTitle = document.getElementById('result-title');
    if (resultTitle) {
        resultTitle.textContent = `${t.score}: ${AppState.quiz.points} / ${AppState.quiz.testSet.length}`;
        
        const timeSpan = document.createElement('span');
        timeSpan.style.cssText = 'font-size: 16px; color: #666; font-weight: 500; margin-top: 8px; display: inline-block;';
        timeSpan.textContent = `${t.totalTime}: ${formatTime(totalTime)}`;
        
        const lineBreak = document.createElement('br');
        resultTitle.appendChild(lineBreak);
        resultTitle.appendChild(timeSpan);
    }

    const retryBtn = document.getElementById('ui-retry-btn');
    if (retryBtn) {
        if (AppState.showRetryButton === true) {
            retryBtn.style.display = 'block';
        } else {
            retryBtn.style.display = 'none';
        }
    }

    const log = document.getElementById('log');
    if (log) {
        while (log.firstChild) {
            log.removeChild(log.firstChild);
        }
    }

    AppState.quiz.results.forEach(r => {
        const row = document.createElement('div');
        row.className = 'result-item';
        const timeColor = getTimeColor(r.time);
        const statusText = r.isOk ? `✅ ${t.correct}` : `❌ ${t.wrong}`;

        const img = document.createElement('img');
        img.src = `./img/${r.q.file}`;
        img.alt = 'Sign';

        const contentDiv = document.createElement('div');

        const statusDiv = document.createElement('div');
        statusDiv.className = 'status';
        statusDiv.style.color = r.isOk ? 'var(--success)' : 'var(--danger)';
        statusDiv.textContent = statusText;

        const answerDiv = document.createElement('div');
        answerDiv.className = 'answer';
        answerDiv.textContent = getDisplayName(r.q, AppState.settings.quizLang);

        if (!r.isOk) {
            const userAnswerDiv = document.createElement('div');
            userAnswerDiv.className = 'user-answer';
            userAnswerDiv.textContent = `${t.categories.all}: ${r.userChoice}`;
            contentDiv.appendChild(userAnswerDiv);
        }

        const hintDiv = document.createElement('div');
        hintDiv.className = 'hint';
        hintDiv.textContent = `${t.hintLabel} ${getDisplayHint(r.q, AppState.settings.helperLang)}`;

        const timeDiv = document.createElement('div');
        timeDiv.className = 'time';
        timeDiv.style.color = timeColor;
        timeDiv.textContent = `${t.answerTime}: ${r.time.toFixed(1)} ${t.seconds}`;

        contentDiv.appendChild(statusDiv);
        contentDiv.appendChild(answerDiv);
        contentDiv.appendChild(hintDiv);
        contentDiv.appendChild(timeDiv);

        row.appendChild(img);
        row.appendChild(contentDiv);
        log.appendChild(row);
    });
}

// ==================== REFERENCE MODE ====================
function showReference() {
    if (!allSigns || allSigns.length === 0) {
        alert('Error: Signs database not loaded. Please refresh the page.');
        return;
    }

    if (typeof gtag !== 'undefined') {
        gtag('event', 'mode_select', {
            event_category: 'training',
            event_label: 'Reference Mode'
        });
    }

    const t = UI_TRANSLATIONS[AppState.settings.interfaceLang];

    const referenceTitle = document.querySelector('#reference-screen h2');
    if (referenceTitle) referenceTitle.textContent = `📖 ${t.referenceTitle}`;

    // Очищуємо поле пошуку при відкритті Reference Mode
    const searchInput = document.getElementById('reference-search');
    if (searchInput) {
        searchInput.value = '';
    }

    // Отримуємо фільтри з головної сторінки (як для Quiz/Flashcard)
    const isFavOnly = document.getElementById('fav-only')?.checked || false;
    const selectedCat = AppState.quiz.selectedCategory || 'all';

    // Фільтруємо знаки за тими ж правилами що й для тестів
    let filteredSigns = isFavOnly ? allSigns.filter(s => s.fav) : allSigns;
    if (selectedCat !== 'all') {
        filteredSigns = filteredSigns.filter(s => s.cat === selectedCat);
    }

    const list = document.getElementById('reference-list');
    if (list) {
        while (list.firstChild) {
            list.removeChild(list.firstChild);
        }

        filteredSigns.forEach(sign => {
            const item = document.createElement('div');
            item.className = 'reference-item';
            item.setAttribute('data-name', getDisplayName(sign, AppState.settings.interfaceLang));

            const categoryName = t.categories[sign.cat] || sign.cat;
            const signName = getDisplayName(sign, AppState.settings.interfaceLang);
            const signHint = getDisplayHint(sign, AppState.settings.interfaceLang);

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

            const hintDiv = document.createElement('div');
            hintDiv.className = 'reference-hint';
            hintDiv.textContent = signHint;

            contentDiv.appendChild(categoryDiv);
            contentDiv.appendChild(nameDiv);
            contentDiv.appendChild(hintDiv);

            item.appendChild(img);
            item.appendChild(contentDiv);
            list.appendChild(item);
        });

        // Оновлюємо заголовок з кількістю знаків
        const referenceTitleEl = document.querySelector('#reference-screen h2');
        if (referenceTitleEl) {
            referenceTitleEl.textContent = `📖 ${t.referenceTitle} (${filteredSigns.length})`;
        }
    }

    // Ховаємо SEO футер під час перегляду довідника
    const seoFooter = document.getElementById('seo-footer');
    if (seoFooter) seoFooter.style.display = 'none';

    showScreen('reference-screen');
}

// ==================== FILTER REFERENCE ====================
function filterReference() {
    const searchInput = document.getElementById('reference-search');
    const query = searchInput ? searchInput.value.toLowerCase() : '';
    const items = document.querySelectorAll('.reference-item');

    items.forEach(item => {
        const signName = item.getAttribute('data-name').toLowerCase();
        item.style.display = signName.includes(query) ? 'flex' : 'none';
    });
}

// ==================== FLASHCARD MODE ====================
function startFlashcard() {
    if (!allSigns || allSigns.length === 0) {
        alert('Error: Signs database not loaded. Please refresh the page.');
        return;
    }

    if (typeof gtag !== 'undefined') {
        gtag('event', 'mode_select', {
            event_category: 'training',
            event_label: 'Flashcard Mode'
        });
    }

    AppState.flashcard.mode = true;
    AppState.showRetryButton = AppState.flashcard.showRetry;
    
    const quizLangSelect = document.getElementById('quiz-lang');
    const helperLangSelect = document.getElementById('helper-lang');
    const favOnlyCheckbox = document.getElementById('fav-only');
    const questionCountSelect = document.getElementById('question-count');
    
    if (quizLangSelect) AppState.settings.quizLang = quizLangSelect.value;
    if (helperLangSelect) AppState.settings.helperLang = helperLangSelect.value;

    const isFavOnly = favOnlyCheckbox ? favOnlyCheckbox.checked : false;
    let base = isFavOnly ? allSigns.filter(s => s.fav) : allSigns;
    base = AppState.quiz.selectedCategory === 'all' ? base : base.filter(s => s.cat === AppState.quiz.selectedCategory);

    if (base.length === 0) {
        alert(UI_TRANSLATIONS[AppState.settings.interfaceLang].noSignsInCat);
        return;
    }

    const countSelect = questionCountSelect ? questionCountSelect.value : '20';
    let requestedCount = countSelect === 'all' ? base.length : parseInt(countSelect);
    let totalQuestions = Math.min(requestedCount, base.length);

    AppState.quiz.testSet = shuffle(base).slice(0, totalQuestions);
    AppState.quiz.savedTestSet = [...AppState.quiz.testSet];
    AppState.quiz.current = 0;
    AppState.quiz.points = 0;
    AppState.quiz.results = [];
    AppState.timing.questionTimes = [];
    AppState.timing.totalStartTime = Date.now();

    // Ховаємо SEO футер під час тесту
    const seoFooter = document.getElementById('seo-footer');
    if (seoFooter) seoFooter.style.display = 'none';

    showScreen('flashcard-screen');
    renderFlashcard();
}

function renderFlashcard() {
    const q = AppState.quiz.testSet[AppState.quiz.current];
    const t = UI_TRANSLATIONS[AppState.settings.interfaceLang];

    const progressPercent = ((AppState.quiz.current + 1) / AppState.quiz.testSet.length) * 100;
    
    const flashcardProgressFill = document.getElementById('flashcard-progress-fill');
    if (flashcardProgressFill) flashcardProgressFill.style.width = `${progressPercent}%`;
    
    const flashcardProgress = document.getElementById('flashcard-progress');
    if (flashcardProgress) flashcardProgress.innerText = `${t.progress} ${AppState.quiz.current + 1} ${t.of} ${AppState.quiz.testSet.length}`;

    const flashcardQImg = document.getElementById('flashcard-q-img');
    if (flashcardQImg) flashcardQImg.src = "./img/" + q.file;

    AppState.flashcard.answerShown = false;
    
    const flashcardAnswer = document.getElementById('flashcard-answer');
    if (flashcardAnswer) flashcardAnswer.classList.add('hidden');

    const showAnswerBtn = document.getElementById('flashcard-show-answer');
    if (showAnswerBtn) {
        showAnswerBtn.style.display = 'block';
        showAnswerBtn.disabled = false;
        showAnswerBtn.textContent = t.showAnswer;
    }

    const flashcardCorrect = document.getElementById('flashcard-correct');
    const flashcardWrong = document.getElementById('flashcard-wrong');
    if (flashcardCorrect) flashcardCorrect.disabled = true;
    if (flashcardWrong) flashcardWrong.disabled = true;

    AppState.timing.questionStartTime = Date.now();
}

function showFlashcardAnswer() {
    const q = AppState.quiz.testSet[AppState.quiz.current];
    const t = UI_TRANSLATIONS[AppState.settings.interfaceLang];

    AppState.flashcard.answerShown = true;

    const flashcardName = document.getElementById('flashcard-name');
    if (flashcardName) flashcardName.textContent = getDisplayName(q, AppState.settings.quizLang);

    const hintContainer = document.getElementById('flashcard-hint');
    if (hintContainer) {
        while (hintContainer.firstChild) {
            hintContainer.removeChild(hintContainer.firstChild);
        }
        
        const hintTitle = document.createElement('strong');
        hintTitle.textContent = `💡 ${t.hintLabel}`;
        hintContainer.appendChild(hintTitle);
        hintContainer.appendChild(document.createElement('br'));
        hintContainer.appendChild(document.createTextNode(getDisplayHint(q, AppState.settings.helperLang)));
    }

    const flashcardAnswer = document.getElementById('flashcard-answer');
    if (flashcardAnswer) flashcardAnswer.classList.remove('hidden');
    
    const showAnswerBtn = document.getElementById('flashcard-show-answer');
    if (showAnswerBtn) showAnswerBtn.style.display = 'none';
    
    const flashcardCorrect = document.getElementById('flashcard-correct');
    const flashcardWrong = document.getElementById('flashcard-wrong');
    if (flashcardCorrect) flashcardCorrect.disabled = false;
    if (flashcardWrong) flashcardWrong.disabled = false;
}

function handleFlashcardAnswer(isCorrect) {
    if (!AppState.flashcard.answerShown) {
        showToast(UI_TRANSLATIONS[AppState.settings.interfaceLang].checkAnswerFirst);
        return;
    }

    const q = AppState.quiz.testSet[AppState.quiz.current];
    const userAnswerText = getDisplayName(q, AppState.settings.quizLang);
    const timeSpent = (Date.now() - AppState.timing.questionStartTime) / 1000;

    AppState.timing.questionTimes.push({ time: timeSpent, isCorrect: isCorrect });
    AppState.quiz.results.push({ q, isOk: isCorrect, userChoice: userAnswerText, time: timeSpent });

    if (isCorrect) {
        AppState.quiz.points++;
    }

    AppState.quiz.current++;
    if (AppState.quiz.current < AppState.quiz.testSet.length) {
        renderFlashcard();
    } else {
        finish();
    }
}

function showToast(message) {
    const existing = document.querySelector('.flashcard-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'flashcard-toast';
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => toast.remove(), 2000);
}

// ==================== SHARE FUNCTIONALITY ====================
async function shareApp() {
    const shareData = {
        title: 'Cyprus Road Signs Quiz — Free Driving Test Practice',
        text: '🚗 Learn 217 Cyprus road signs for free!\n\n' +
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

function fallbackShare(shareData) {
    navigator.clipboard.writeText(`${shareData.text}\n\n🔗 ${shareData.url}`)
        .then(() => {
            showToast('📋 Link copied to clipboard!');
        })
        .catch(() => {
            alert(`${shareData.text}\n\n${shareData.url}`);
        });
}

// ==================== FEEDBACK FUNCTIONALITY ====================
let currentRating = 0;

function openFeedbackScreen() {
    showScreen('feedback-screen');
    currentRating = 0;
    resetRating();
    const form = document.getElementById('feedback-form');
    if (form) form.reset();
}

function setRating(rating) {
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

function resetRating() {
    const stars = document.querySelectorAll('#feedback-rating span');
    stars.forEach(star => {
        star.classList.remove('active');
        star.textContent = '☆';
    });
}

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

async function sendFeedback() {
    openFeedbackScreen();
}
