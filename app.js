/* ==================== CYPRUS ROAD SIGNS - APP LOGIC ==================== 
   Version: 1.4
   Last Updated: 2026-02-20
====================================================================== */

// ==================== STATE ====================
let current = 0, points = 0, testSet = [], results = [], selectedCategory = 'all';
let currentOptionsSigns = []; // Зберігаємо знаки для поточних варіантів відповідей
let questionStartTime = 0; // Час початку поточного питання
let questionTimes = []; // Масив {time: number, isCorrect: boolean}
let totalStartTime = 0; // Час початку всього тесту
let savedTestSet = null; // Збережений тест для повтору

// Flashcard state
let flashcardMode = false;
let flashcardAnswerShown = false;
let flashcardTranslateShown = false;

// ==================== INITIALIZATION ====================
window.addEventListener('DOMContentLoaded', () => {
    updateUI();
    setupServiceWorker();
    
    // Ховаємо spinner коли все завантажено
    setTimeout(() => {
        if (typeof allSigns !== 'undefined' && allSigns.length > 0) {
            document.getElementById('loading-spinner').classList.add('hidden');
            document.getElementById('start-screen').classList.remove('hidden');
        } else {
            document.getElementById('loading-text').textContent = 'Error loading signs. Please refresh.';
            document.getElementById('loading-text').style.color = 'var(--danger)';
        }
    }, 500);
});

// ==================== SERVICE WORKER ====================
function setupServiceWorker() {
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('./sw.js')
                .then(reg => {
                    console.log('SW registered!', reg);
                    
                    // Перевіряємо оновлення SW
                    reg.addEventListener('updatefound', () => {
                        const newWorker = reg.installing;
                        console.log('SW update found');
                        
                        newWorker.addEventListener('statechange', () => {
                            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                // Новий SW встановлений, є оновлення
                                console.log('New SW available, reloading...');
                                if (confirm('Доступна нова версія! Оновити сторінку?')) {
                                    window.location.reload();
                                }
                            }
                        });
                    });
                })
                .catch(err => console.log('SW error:', err));
        });
    }
}

// ==================== LANGUAGE FUNCTIONS ====================
function updateUILanguage() {
    interfaceLang = document.getElementById('interface-lang').value;
    updateUI();
}

function saveQuizLang() {
    quizLang = document.getElementById('quiz-lang').value;
}

function saveHelperLang() {
    helperLang = document.getElementById('helper-lang').value;
}

function updateUI() {
    const t = UI_TRANSLATIONS[interfaceLang];
    document.getElementById('ui-title').textContent = t.title;
    document.getElementById('ui-fav-only').textContent = t.favOnly;
    document.getElementById('ui-interface-lang').textContent = t.interfaceLang;
    document.getElementById('ui-quiz-lang').textContent = t.quizLang;
    document.getElementById('ui-helper-lang').textContent = t.helperLang;
    document.getElementById('ui-category').textContent = t.category;
    document.getElementById('ui-questions').textContent = t.questions;
    document.getElementById('ui-quiz-mode-btn').textContent = t.quizModeBtn;
    document.getElementById('ui-flashcard-btn').textContent = t.flashcardBtn;
    document.getElementById('ui-back-btn').textContent = t.backToMenu;
    document.getElementById('ui-retry-btn').textContent = t.retryBtn;
    document.getElementById('ui-reference-btn').textContent = t.referenceBtn;
    document.getElementById('ui-score').textContent = t.score;
    document.getElementById('translate-toggle').textContent = t.showTranslate;

    document.querySelectorAll('.category-btn').forEach(btn => {
        const key = btn.dataset.key;
        if (key && t.categories[key]) btn.textContent = t.categories[key];
    });

    const opts = document.getElementById('question-count').querySelectorAll('option');
    opts[0].textContent = t.questionCount["5"];
    opts[1].textContent = t.questionCount["10"];
    opts[2].textContent = t.questionCount["20"];
    opts[3].textContent = t.questionCount["50"];
    opts[4].textContent = t.questionCount["all"];
}

function getDisplayName(sign, lang) { return sign.name[lang] || sign.name.en; }
function getDisplayHint(sign, lang) { return sign.hint[lang] || sign.hint.en; }

function handleImageError(imgElement) {
    // Fallback зображення у випадку помилки
    imgElement.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="150" height="150" viewBox="0 0 150 150"><rect fill="%23ddd" width="150" height="150"/><text fill="%23666" x="50%" y="50%" text-anchor="middle" dy=".3em" font-family="Arial" font-size="14">No Image</text></svg>';
    imgElement.style.maxHeight = '100px';
}

function toggleTranslate() {
    showingTranslation = !showingTranslation;
    const btn = document.getElementById('translate-toggle');
    const t = UI_TRANSLATIONS[interfaceLang];
    btn.textContent = showingTranslation ? t.hideTranslate : t.showTranslate;
    btn.classList.toggle('active', showingTranslation);

    // Оновлюємо тільки текст кнопок, а не генеруємо нові
    if (testSet.length > 0 && current < testSet.length) {
        updateOptionsText();
    }
}

function updateOptionsText() {
    const quizLangCurrent = getCurrentQuizLang();
    const buttons = document.querySelectorAll('#options button');

    // Оновлюємо текст кнопок на основі збережених знаків
    currentOptionsSigns.forEach((sign, index) => {
        if (index < buttons.length) {
            buttons[index].innerText = getDisplayName(sign, quizLangCurrent);
        }
    });
}

function getCurrentQuizLang() { return showingTranslation ? helperLang : quizLang; }

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
        const minText = interfaceLang === 'en' ? 'min' : 
                       interfaceLang === 'el' ? 'λεπ' : 'хв';
        return `${mins} ${minText} ${secs} ${UI_TRANSLATIONS[interfaceLang].seconds}`;
    }
    return `${secs} ${UI_TRANSLATIONS[interfaceLang].seconds}`;
}

// ==================== GAME FUNCTIONS ====================
function setCat(cat, btn) {
    selectedCategory = cat;
    document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
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
    // Перевірка наявності даних
    if (!allSigns || allSigns.length === 0) {
        alert('Error: Signs database not loaded. Please refresh the page.');
        return;
    }
    
    quizLang = document.getElementById('quiz-lang').value;
    helperLang = document.getElementById('helper-lang').value;
    showingTranslation = false;

    const isFavOnly = document.getElementById('fav-only').checked;
    let base = isFavOnly ? allSigns.filter(s => s.fav) : allSigns;
    base = selectedCategory === 'all' ? base : base.filter(s => s.cat === selectedCategory);

    if (base.length === 0) {
        alert(UI_TRANSLATIONS[interfaceLang].noSignsInCat);
        return;
    }

    const countSelect = document.getElementById('question-count').value;
    let requestedCount = countSelect === 'all' ? base.length : parseInt(countSelect);
    let totalQuestions = Math.min(requestedCount, base.length);

    testSet = shuffle(base).slice(0, totalQuestions);
    savedTestSet = [...testSet]; // Зберігаємо для можливого повтору
    current = 0; points = 0; results = [];
    questionTimes = [];
    totalStartTime = Date.now(); // Запускаємо загальний таймер

    // Ховаємо ВСІ екрани крім quiz-screen
    document.getElementById('start-screen').classList.add('hidden');
    document.getElementById('flashcard-screen').classList.add('hidden');
    document.getElementById('result-screen').classList.add('hidden');
    document.getElementById('reference-screen').classList.add('hidden');
    document.getElementById('quiz-screen').classList.remove('hidden');
    render();
}

function render() {
    const q = testSet[current];
    const t = UI_TRANSLATIONS[interfaceLang];
    const quizLangCurrent = getCurrentQuizLang();

    // Оновлюємо прогрес-бар
    const progressPercent = ((current + 1) / testSet.length) * 100;
    document.getElementById('progress-fill').style.width = `${progressPercent}%`;

    document.getElementById('progress').innerText = `${t.progress} ${current + 1} ${t.of} ${testSet.length}`;
    document.getElementById('q-img').src = "./img/" + q.file;

    questionStartTime = Date.now(); // Запускаємо таймер для цього питання

    // Очищаємо старі елементи
    const oldHint = document.getElementById('active-hint');
    if (oldHint) oldHint.remove();
    const oldNext = document.getElementById('next-btn-manual');
    if (oldNext) oldNext.remove();
    document.getElementById('quiz-buttons').innerHTML = '';  // Очищаємо контейнер кнопок

    // Генеруємо варіанти відповідей
    let optionsSigns = [q]; // Правильна відповідь
    let others = allSigns.filter(s => s.file !== q.file)
        .sort(() => 0.5 - Math.random()).slice(0, 3);
    optionsSigns = [...optionsSigns, ...others].sort(() => 0.5 - Math.random());

    // Зберігаємо знаки для перемикання мов
    currentOptionsSigns = optionsSigns;

    const container = document.getElementById('options');
    container.innerHTML = '';
    optionsSigns.forEach(sign => {
        const b = document.createElement('button');
        b.innerText = getDisplayName(sign, quizLangCurrent);
        b.onclick = () => check(sign, b);
        container.appendChild(b);
    });

    const translateBtn = document.getElementById('translate-toggle');
    translateBtn.textContent = showingTranslation ? t.hideTranslate : t.showTranslate;
    if (showingTranslation) translateBtn.classList.add('active');
}

function check(ans, btn) {
    const q = testSet[current];
    const quizLangCurrent = getCurrentQuizLang();
    const correct = getDisplayName(q, quizLangCurrent);
    const btns = document.querySelectorAll('#options button');
    btns.forEach(b => b.disabled = true);

    // ans тепер знак, а не текст
    const userAnswerText = getDisplayName(ans, quizLangCurrent);
    const isOk = ans.file === q.file;

    // Записуємо час відповіді
    const timeSpent = (Date.now() - questionStartTime) / 1000; // секунди
    questionTimes.push({ time: timeSpent, isCorrect: isOk });

    results.push({ q, isOk, userChoice: userAnswerText, time: timeSpent });

    if (isOk) {
        btn.classList.add('correct');
        points++;
        setTimeout(next, 1000);
    } else {
        btn.classList.add('wrong');
        btns.forEach(b => {
            if (b.innerText === correct) b.classList.add('correct');
        });

        const t = UI_TRANSLATIONS[interfaceLang];

        // Отримуємо підказку
        const hintText = getDisplayHint(q, helperLang);

        // Створюємо красиву підказку
        const hintDiv = document.createElement('div');
        hintDiv.id = 'active-hint';
        hintDiv.className = 'hint-box';
        hintDiv.innerHTML = `<strong>💡 ${t.hintLabel}</strong><br>${hintText || 'Підказка відсутня'}`;

        // Вставляємо підказку відразу після кнопок
        const optionsContainer = document.getElementById('options');
        optionsContainer.appendChild(hintDiv);

        // Кнопка "Далі" з'являється в quiz-buttons (перед кнопкою перекладу)
        const nextBtn = document.createElement('button');
        nextBtn.id = 'next-btn-manual';
        nextBtn.innerText = t.nextBtn;
        nextBtn.className = "main-btn";
        nextBtn.onclick = next;
        document.getElementById('quiz-buttons').appendChild(nextBtn);

        // Прокручуємо до підказки з урахуванням липкої кнопки
        setTimeout(() => {
            hintDiv.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
        }, 100);
    }
}

function next() {
    current++;
    currentOptionsSigns = []; // Очищаємо старі опції
    if (current < testSet.length) render();
    else finish();
}

function retry() {
    if (!savedTestSet) return;

    // Явне очищення масивів
    questionTimes.length = 0;
    results.length = 0;
    currentOptionsSigns.length = 0;

    testSet = [...savedTestSet]; // Відновлюємо збережений тест
    current = 0;
    points = 0;
    totalStartTime = Date.now();
    showingTranslation = false;

    document.getElementById('result-screen').classList.add('hidden');
    document.getElementById('quiz-screen').classList.remove('hidden');
    render();
}

function backToMenu() {
    // Скидаємо збережений тест
    savedTestSet = null;
    flashcardMode = false;

    // Скидаємо фільтри до дефолтних
    selectedCategory = 'all';
    document.getElementById('fav-only').checked = false;
    document.getElementById('quiz-lang').value = quizLang;
    document.getElementById('helper-lang').value = helperLang;

    // Ховаємо ВСІ екрани крім start-screen
    document.getElementById('quiz-screen').classList.add('hidden');
    document.getElementById('result-screen').classList.add('hidden');
    document.getElementById('flashcard-screen').classList.add('hidden');
    document.getElementById('reference-screen').classList.add('hidden');
    document.getElementById('start-screen').classList.remove('hidden');

    // Повертаємо кнопку Retry (вона сховається якщо був Flashcard)
    document.getElementById('ui-retry-btn').style.display = 'block';

    // Скидаємо активну категорію
    document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
    document.querySelector('.category-btn[data-key="all"]').classList.add('active');

    // Оновлюємо UI
    updateUI();
}

function finish() {
    const t = UI_TRANSLATIONS[interfaceLang];
    
    // Ховаємо ВСІ екрани крім result-screen
    document.getElementById('start-screen').classList.add('hidden');
    document.getElementById('quiz-screen').classList.add('hidden');
    document.getElementById('flashcard-screen').classList.add('hidden');
    document.getElementById('reference-screen').classList.add('hidden');
    document.getElementById('result-screen').classList.remove('hidden');
    
    document.getElementById('score').innerText = points;
    document.getElementById('total-q').innerText = testSet.length;

    // Розраховуємо загальний час
    const totalTime = (Date.now() - totalStartTime) / 1000;
    document.getElementById('result-title').innerHTML =
        `${t.score}: <span id="score">${points}</span> / <span id="total-q">${testSet.length}</span><br>
        <span style="font-size: 16px; color: #666; font-weight: 500; margin-top: 8px; display: inline-block;">${t.totalTime}: ${formatTime(totalTime)}</span>`;

    // Для Flashcard Mode ховаємо кнопку Retry
    const retryBtn = document.getElementById('ui-retry-btn');
    if (flashcardMode) {
        retryBtn.style.display = 'none';
    } else {
        retryBtn.style.display = 'block';
    }

    const log = document.getElementById('log');
    log.innerHTML = '';

    results.forEach(r => {
        const row = document.createElement('div');
        row.className = 'result-item';
        const timeColor = getTimeColor(r.time);
        const statusText = r.isOk ? `✅ ${t.correct}` : `❌ ${t.wrong}`;
        row.innerHTML = `
            <img src="./img/${r.q.file}" alt="Sign">
            <div>
                <div class="status" style="color:${r.isOk ? 'var(--success)' : 'var(--danger)'}">
                    ${statusText}
                </div>
                <div class="answer">${getDisplayName(r.q, quizLang)}</div>
                ${!r.isOk ? `<div class="user-answer">${t.categories.all}: ${r.userChoice}</div>` : ''}
                <div class="hint">${t.hintLabel} ${getDisplayHint(r.q, helperLang)}</div>
                <div class="time" style="color:${timeColor}">${t.answerTime}: ${r.time.toFixed(1)} ${t.seconds}</div>
            </div>
        `;
        log.appendChild(row);
    });
}

// ==================== REFERENCE MODE ====================
function showReference() {
    // Перевірка наявності даних
    if (!allSigns || allSigns.length === 0) {
        alert('Error: Signs database not loaded. Please refresh the page.');
        return;
    }
    
    const t = UI_TRANSLATIONS[interfaceLang];
    
    // Оновлюємо заголовок
    document.querySelector('#reference-screen h2').textContent = `📖 ${t.referenceTitle}`;
    
    const list = document.getElementById('reference-list');
    list.innerHTML = '';
    
    // Відображаємо всі знаки простим списком
    allSigns.forEach(sign => {
        const item = document.createElement('div');
        item.className = 'reference-item';
        item.setAttribute('data-name', getDisplayName(sign, interfaceLang));
        
        // Отримуємо назву категорії з захистом від undefined
        const categoryName = t.categories[sign.cat] || sign.cat;
        const signName = getDisplayName(sign, interfaceLang);
        const signHint = getDisplayHint(sign, interfaceLang);
        
        item.innerHTML = `
            <img src="./img/${sign.file}" alt="${signName}" onerror="handleImageError(this)">
            <div class="reference-content">
                <div class="reference-category ${sign.cat}">${categoryName}</div>
                <div class="reference-name">${signName}</div>
                <div class="reference-hint">${signHint}</div>
            </div>
        `;
        list.appendChild(item);
    });

    // Показуємо екран довідника
    document.getElementById('start-screen').classList.add('hidden');
    document.getElementById('quiz-screen').classList.add('hidden');
    document.getElementById('flashcard-screen').classList.add('hidden');
    document.getElementById('result-screen').classList.add('hidden');
    document.getElementById('reference-screen').classList.remove('hidden');
}

// ==================== FILTER REFERENCE ====================
function filterReference() {
    const query = document.getElementById('reference-search').value.toLowerCase();
    const items = document.querySelectorAll('.reference-item');
    
    items.forEach(item => {
        // Шукаємо тільки по назві знака (data-name атрибут)
        const signName = item.getAttribute('data-name').toLowerCase();
        item.style.display = signName.includes(query) ? 'flex' : 'none';
    });
}

// ==================== FLASHCARD MODE ====================
function startFlashcard() {
    // Перевірка наявності даних
    if (!allSigns || allSigns.length === 0) {
        alert('Error: Signs database not loaded. Please refresh the page.');
        return;
    }
    
    flashcardMode = true;
    quizLang = document.getElementById('quiz-lang').value;
    helperLang = document.getElementById('helper-lang').value;
    flashcardTranslateShown = false;
    
    const isFavOnly = document.getElementById('fav-only').checked;
    let base = isFavOnly ? allSigns.filter(s => s.fav) : allSigns;
    base = selectedCategory === 'all' ? base : base.filter(s => s.cat === selectedCategory);
    
    if (base.length === 0) {
        alert(UI_TRANSLATIONS[interfaceLang].noSignsInCat);
        return;
    }
    
    const countSelect = document.getElementById('question-count').value;
    let requestedCount = countSelect === 'all' ? base.length : parseInt(countSelect);
    let totalQuestions = Math.min(requestedCount, base.length);
    
    testSet = shuffle(base).slice(0, totalQuestions);
    savedTestSet = [...testSet];
    current = 0;
    points = 0;
    results = [];
    questionTimes = [];
    totalStartTime = Date.now();

    // Ховаємо ВСІ екрани крім flashcard-screen
    document.getElementById('start-screen').classList.add('hidden');
    document.getElementById('quiz-screen').classList.add('hidden');
    document.getElementById('result-screen').classList.add('hidden');
    document.getElementById('reference-screen').classList.add('hidden');
    document.getElementById('flashcard-screen').classList.remove('hidden');
    renderFlashcard();
}

function renderFlashcard() {
    const q = testSet[current];
    const t = UI_TRANSLATIONS[interfaceLang];
    
    // Оновлюємо прогрес-бар
    const progressPercent = ((current + 1) / testSet.length) * 100;
    document.getElementById('flashcard-progress-fill').style.width = `${progressPercent}%`;
    document.getElementById('flashcard-progress').innerText = `${t.progress} ${current + 1} ${t.of} ${testSet.length}`;
    
    // Зображення
    document.getElementById('flashcard-q-img').src = "./img/" + q.file;
    
    // Скидаємо стан
    flashcardAnswerShown = false;
    flashcardTranslateShown = false;
    
    // Ховаємо відповідь
    document.getElementById('flashcard-answer').classList.add('hidden');
    
    // Показуємо кнопку "Show Answer"
    const showAnswerBtn = document.getElementById('flashcard-show-answer');
    showAnswerBtn.style.display = 'block';
    showAnswerBtn.disabled = false;
    showAnswerBtn.textContent = t.showAnswer;
    
    // Блокуємо кнопки Correct/Wrong
    document.getElementById('flashcard-correct').disabled = true;
    document.getElementById('flashcard-wrong').disabled = true;
    
    // Ховаємо кнопку перекладу
    document.getElementById('flashcard-translate-toggle').style.display = 'none';
    
    questionStartTime = Date.now();
}

function showFlashcardAnswer() {
    const q = testSet[current];
    const t = UI_TRANSLATIONS[interfaceLang];
    
    flashcardAnswerShown = true;
    
    // Показуємо відповідь
    document.getElementById('flashcard-name').textContent = getDisplayName(q, quizLang);
    document.getElementById('flashcard-hint').innerHTML = `<strong>💡 ${t.hintLabel}</strong><br>${getDisplayHint(q, helperLang)}`;
    document.getElementById('flashcard-answer').classList.remove('hidden');
    
    // Ховаємо кнопку "Show Answer"
    document.getElementById('flashcard-show-answer').style.display = 'none';
    
    // Активуємо кнопки Correct/Wrong
    document.getElementById('flashcard-correct').disabled = false;
    document.getElementById('flashcard-wrong').disabled = false;
    
    // Показуємо кнопку перекладу
    const translateBtn = document.getElementById('flashcard-translate-toggle');
    translateBtn.style.display = 'block';
    translateBtn.textContent = t.showTranslate;
}

function handleFlashcardAnswer(isCorrect) {
    if (!flashcardAnswerShown) {
        // Показуємо повідомлення "Check your answer first"
        showToast(UI_TRANSLATIONS[interfaceLang].checkAnswerFirst);
        return;
    }
    
    const q = testSet[current];
    const quizLangCurrent = flashcardTranslateShown ? helperLang : quizLang;
    const userAnswerText = getDisplayName(q, quizLangCurrent);
    const timeSpent = (Date.now() - questionStartTime) / 1000;
    
    questionTimes.push({ time: timeSpent, isCorrect: isCorrect });
    results.push({ q, isOk: isCorrect, userChoice: userAnswerText, time: timeSpent });
    
    if (isCorrect) {
        points++;
    }
    
    current++;
    if (current < testSet.length) {
        renderFlashcard();
    } else {
        finish();
    }
}

function toggleFlashcardTranslate() {
    flashcardTranslateShown = !flashcardTranslateShown;
    const q = testSet[current];
    const t = UI_TRANSLATIONS[interfaceLang];
    const btn = document.getElementById('flashcard-translate-toggle');
    
    btn.textContent = flashcardTranslateShown ? t.hideTranslate : t.showTranslate;
    
    // Оновлюємо назву знака
    document.getElementById('flashcard-name').textContent = getDisplayName(q, flashcardTranslateShown ? helperLang : quizLang);
}

function showToast(message) {
    // Видаляємо існуючі toast повідомлення
    const existing = document.querySelector('.flashcard-toast');
    if (existing) existing.remove();
    
    const toast = document.createElement('div');
    toast.className = 'flashcard-toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => toast.remove(), 2000);
}
