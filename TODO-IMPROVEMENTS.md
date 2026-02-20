# 📋 Cyprus Road Signs Quiz — План улучшений

**Дата создания:** 2026-02-20  
**Версия приложения:** 3.3  
**Общая оценка:** 4.2/5.0 ⭐⭐⭐⭐

---

## 🎯 Приоритеты

| Приоритет | Описание | Срок |
|-----------|----------|------|
| 🔴 | Критические исправления | Немедленно |
| 🟡 | Важные улучшения | 1-2 недели |
| 🟢 | Опциональные улучшения | 1-2 месяца |
| ⏸ | На будущее | Без срока |

---

## 🔴 Критические исправления

### 1. XSS-уязвимость через innerHTML

**Файл:** `app.js`  
**Приоритет:** 🔴 Высокий  
**Время:** 30 мин  
**Статус:** ⏳ Требуется

**Проблема:**
```javascript
// Строка 298
hintDiv.innerHTML = `<strong>💡 ${t.hintLabel}</strong><br>${hintText || 'Підказка відсутня'}`;

// Строка 412
row.innerHTML = `
    <img src="./img/${r.q.file}" alt="Sign">
    ...
`;

// Строка 455
item.innerHTML = `
    <img src="./img/${sign.file}" alt="${signName}" ...>
    ...
`;
```

**Решение:**
```javascript
// Для текста использовать textContent
hintDiv.innerHTML = `<strong>💡 ${t.hintLabel}</strong><br>`;
hintDiv.appendChild(document.createTextNode(hintText || 'Підказка відсутня'));

// Для img использовать createElement
const img = document.createElement('img');
img.src = `./img/${r.q.file}`;
img.alt = 'Sign';
row.appendChild(img);
```

**Выгоды:**
- ✅ Безопасность
- ✅ Защита от инъекций кода
- ✅ Лучшая практика

---

### 2. Отсутствует иконка 512x512 для PWA

**Файл:** `manifest.json`  
**Приоритет:** 🔴 Высокий  
**Время:** 15 мин  
**Статус:** ⏳ Требуется

**Проблема:**
```json
"icons": [
  {
    "src": "img/main-icon.png",
    "type": "image/png",
    "sizes": "192x192"  // ❌ Только один размер
  }
]
```

**Решение:**
1. Создать иконку 512x512 (`img/main-icon-512.png`)
2. Обновить manifest.json:

```json
"icons": [
  {
    "src": "img/main-icon.png",
    "sizes": "192x192",
    "type": "image/png",
    "purpose": "any maskable"
  },
  {
    "src": "img/main-icon-512.png",
    "sizes": "512x512",
    "type": "image/png",
    "purpose": "any maskable"
  }
]
```

**Выгоды:**
- ✅ Полноценная PWA установка
- ✅ Лучшее отображение на домашних экранах

---

### 3. Нет кнопки Refresh при ошибке загрузки

**Файл:** `app.js`  
**Приоритет:** 🟡 Средний  
**Время:** 15 мин  
**Статус:** ⏳ Требуется

**Проблема:**
```javascript
// Строка 28-31
} else {
    document.getElementById('loading-text').textContent = 'Error loading signs. Please refresh.';
    document.getElementById('loading-text').style.color = 'var(--danger)';
}
```

**Решение:**
```javascript
} else {
    document.getElementById('loading-text').innerHTML = `
        <span style="color: var(--danger)">Error loading signs.</span><br>
        <button onclick="location.reload()" class="main-btn" style="margin-top: 15px;">
            🔄 Refresh Page
        </button>
    `;
}
```

**Выгоды:**
- ✅ Лучший UX при ошибках
- ✅ Быстрое восстановление

---

### 4. Нет meta description

**Файл:** `index.html`  
**Приоритет:** 🟢 Низкий  
**Время:** 5 мин  
**Статус:** ⏳ Требуется

**Проблема:** Отсутствует мета-тег description для SEO.

**Решение:** Добавить в `<head>`:
```html
<meta name="description" content="Interactive quiz app for learning Cyprus road signs. 217 signs, 4 languages, offline support.">
<meta name="keywords" content="Cyprus, road signs, driving test, quiz, PWA, traffic signs">
<meta name="author" content="Cyprus Driving Test">
```

**Выгоды:**
- ✅ Лучшее SEO
- ✅ Описание в поисковой выдаче

---

## 🟡 Важные улучшения

### 5. Синхронизировать версии файлов

**Файлы:** `index.html`, `sw.js`, `manifest.json`  
**Приоритет:** 🟢 Низкий  
**Время:** 10 мин  
**Статус:** ⏳ Требуется

**Проблема:** Версии не синхронизированы:
- `index.html`: `styles.css?v=3.1`, `app.js?v=3.3`
- `sw.js`: `CACHE_NAME = 'cyprus-signs-dynamic-v3.2'`
- `manifest.json`: `manifest.json?v=3.1`

**Решение:** Использовать единую версию (например, 3.4):

**index.html:**
```html
<link rel="manifest" href="manifest.json?v=3.4">
<link rel="stylesheet" href="styles.css?v=3.4">
<script src="translations.js?v=3.4"></script>
<script src="signs-data.js?v=3.4"></script>
<script src="app.js?v=3.4"></script>
```

**sw.js:**
```javascript
const CACHE_NAME = 'cyprus-signs-dynamic-v3.4';
```

**manifest.json:**
```json
{
  "name": "Cyprus Driving Test Quiz v3.4"
}
```

**Выгоды:**
- ✅ Проще отладка
- ✅ Ясная версионность

---

### 6. Рефакторинг переключения экранов

**Файл:** `app.js`  
**Приоритет:** 🟢 Низкий  
**Время:** 40 мин  
**Статус:** ⏸ Опционально

**Проблема:** Дублирование кода (5 функций × 5 строк = 25 строк):

```javascript
// start() — строки 204-208
document.getElementById('start-screen').classList.add('hidden');
document.getElementById('flashcard-screen').classList.add('hidden');
document.getElementById('result-screen').classList.add('hidden');
document.getElementById('reference-screen').classList.add('hidden');
document.getElementById('quiz-screen').classList.remove('hidden');

// startFlashcard() — строки 513-517 (аналогично)
// showReference() — строки 467-471 (аналогично)
// finish() — строки 383-387 (аналогично)
// backToMenu() — строки 362-366 (аналогично)
```

**Решение:**
```javascript
// Новая utility-функция
function showScreen(screenId) {
    const screens = ['start-screen', 'quiz-screen', 'result-screen', 
                     'flashcard-screen', 'reference-screen'];
    screens.forEach(id => {
        document.getElementById(id).classList.toggle('hidden', id !== screenId);
    });
}

// Использование:
function start() {
    // ... логика ...
    showScreen('quiz-screen');
}

function startFlashcard() {
    // ... логика ...
    showScreen('flashcard-screen');
}

function showReference() {
    // ... логика ...
    showScreen('reference-screen');
}

function finish() {
    // ... логика ...
    showScreen('result-screen');
}

function backToMenu() {
    // ... логика ...
    showScreen('start-screen');
}
```

**Выгоды:**
- ✅ -25 строк кода
- ✅ Меньше дублирования
- ✅ Проще поддерживать

---

### 7. Вынести магические числа в константы

**Файл:** `app.js`  
**Приоритет:** 🟢 Низкий  
**Время:** 20 мин  
**Статус:** ⏸ Опционально

**Проблема:**
```javascript
// Строка 33
}, 500);  // ❌ Почему 500мс?

// Строка 279
setTimeout(next, 1000);  // ❌ Почему 1000мс?

// Строка 307
}, 100);  // ❌ Почему 100мс?
```

**Решение:**
```javascript
// В начале файла
const CONFIG = {
    LOADING_DELAY: 500,
    AUTO_NEXT_DELAY: 1000,
    SCROLL_DELAY: 100,
    TOAST_DURATION: 2000,
    SIGN_BOX_MIN_HEIGHT: 200,
    SIGN_IMAGE_MAX_HEIGHT: 160
};

// Использование:
setTimeout(() => { ... }, CONFIG.LOADING_DELAY);
setTimeout(next, CONFIG.AUTO_NEXT_DELAY);
setTimeout(() => { ... }, CONFIG.SCROLL_DELAY);
```

**Выгоды:**
- ✅ Читаемость кода
- ✅ Проще настраивать
- ✅ Документирование значений

---

### 8. Добавить ARIA-атрибуты

**Файл:** `index.html`  
**Приоритет:** 🟢 Низкий  
**Время:** 1 час  
**Статус:** ⏸ Опционально

**Проблема:** Нет доступности для скринридеров.

**Решение:**

**Прогресс-бары:**
```html
<div class="progress-container" 
     role="progressbar" 
     aria-valuenow="0" 
     aria-valuemin="0" 
     aria-valuemax="100"
     aria-label="Quiz progress">
    <div class="progress-fill" id="progress-fill"></div>
</div>
```

**Кнопки:**
```html
<button class="main-btn" onclick="start()" aria-label="Start quiz mode">
    📝 Quiz Mode
</button>

<button id="translate-toggle" class="translate-btn" onclick="toggleTranslate()" 
        aria-label="Toggle translation" aria-pressed="false">
    🔄 Show Translation
</button>
```

**Экраны:**
```html
<div id="quiz-screen" class="hidden" role="region" aria-label="Quiz screen">
<div id="flashcard-screen" class="hidden" role="region" aria-label="Flashcard screen">
```

**Выгоды:**
- ✅ Доступность для людей с ограничениями
- ✅ Лучшее SEO
- ✅ Соответствие стандартам

---

## 🟢 Опциональные улучшения

### 9. Рефакторинг глобального состояния

**Файлы:** `app.js`, `translations.js`  
**Приоритет:** 🟢 Низкий  
**Время:** 1 час  
**Статус:** ⏸ Опционально

**Проблема:** 13 глобальных переменных:

```javascript
// app.js
let current = 0, points = 0, testSet = [], results = [], selectedCategory = 'all';
let currentOptionsSigns = [];
let questionStartTime = 0;
let questionTimes = [];
let totalStartTime = 0;
let savedTestSet = null;
let flashcardMode = false;
let flashcardAnswerShown = false;

// translations.js
let interfaceLang = 'en';
let quizLang = 'en';
let helperLang = 'en';
let showingTranslation = false;
```

**Решение:**
```javascript
const AppState = {
    quiz: {
        current: 0,
        points: 0,
        testSet: [],
        results: [],
        selectedCategory: 'all',
        currentOptionsSigns: [],
        savedTestSet: null
    },
    timing: {
        questionStartTime: 0,
        questionTimes: [],
        totalStartTime: 0
    },
    flashcard: {
        mode: false,
        answerShown: false
    },
    settings: {
        interfaceLang: 'en',
        quizLang: 'en',
        helperLang: 'en',
        showingTranslation: false
    }
};

// Использование:
function start() {
    AppState.quiz.current = 0;
    AppState.quiz.points = 0;
    AppState.timing.totalStartTime = Date.now();
}
```

**Выгоды:**
- ✅ Инкапсуляция
- ✅ Проще тестировать
- ✅ Меньше конфликтов имён

---

### 10. Обработка ошибок сети в Service Worker

**Файл:** `sw.js`  
**Приоритет:** 🟢 Низкий  
**Время:** 30 мин  
**Статус:** ⏸ Опционально

**Проблема:**
```javascript
// Строка 36-46
return fetch(event.request).then((response) => {
    if (!response || response.status !== 200) return response;  // ❌ Возвращаем ошибку
    
    const responseToCache = response.clone();
    caches.open(CACHE_NAME).then((cache) => {
        cache.put(event.request, responseToCache);
    });
    
    return response;
});
```

**Решение:**
```javascript
return fetch(event.request).then((response) => {
    if (!response || response.status !== 200) {
        // Возвращаем офлайн-страницу или кэш
        return caches.match('offline.html').then(offlineResponse => {
            return offlineResponse || response;
        });
    }
    
    const responseToCache = response.clone();
    caches.open(CACHE_NAME).then((cache) => {
        cache.put(event.request, responseToCache);
    });
    
    return response;
});
```

**Требует:** Создать `offline.html` с сообщением "Нет соединения".

**Выгоды:**
- ✅ Лучший офлайн-UX
- ✅ Обработка ошибок сети

---

### 11. Стандартизировать язык комментариев

**Файл:** `app.js`  
**Приоритет:** 🟢 Очень низкий  
**Время:** 30 мин  
**Статус:** ⏸ Опционально

**Проблема:** Смешанные украинские/английские комментарии:

```javascript
// Ховаємо spinner коли все завантажено
// Запускаємо загальний таймер
// Перевірка наявності даних
```

**Решение:** Перевести все комментарии на английский:

```javascript
// Hide spinner when everything is loaded
// Start total timer
// Check data availability
```

**Выгоды:**
- ✅ Международная поддерживаемость
- ✅ Единый стиль

---

### 12. Использовать questionTimes для статистики

**Файл:** `app.js`  
**Приоритет:** 🟢 Очень низкий  
**Время:** 1 час  
**Статус:** ⏸ Опционально

**Проблема:** Массив заполняется, но не используется:

```javascript
// Строка 10
let questionTimes = []; // Масив {time: number, isCorrect: boolean}

// Строка 271 — запись данных
questionTimes.push({ time: timeSpent, isCorrect: isOk });

// ❌ Нигде не читается!
```

**Решение:** Добавить статистику в экран результатов:

```javascript
function finish() {
    // ... существующий код ...
    
    // Рассчитать среднее время
    const avgTime = questionTimes.reduce((sum, q) => sum + q.time, 0) / questionTimes.length;
    const fastAnswers = questionTimes.filter(q => q.time < 5 && q.isCorrect).length;
    
    // Добавить в result-title
    document.getElementById('result-title').innerHTML += `
        <br><span style="font-size: 14px;">
            ⏱️ Среднее время: ${avgTime.toFixed(1)} сек | 
            🚀 Быстрых ответов: ${fastAnswers}/${questionTimes.length}
        </span>
    `;
}
```

**Выгоды:**
- ✅ Лучшая обратная связь
- ✅ Мотивация улучшать результаты

---

## ⏸ На будущее (Backlog)

### 13. Unit тесты

**Фреймворк:** Jest или Vitest  
**Приоритет:** 🟡 Средний  
**Время:** 4-8 часов  
**Статус:** ⏸ На будущее

**Что тестировать:**
```javascript
// shuffle.test.js
test('shuffle returns array of same length', () => {
    const input = [1, 2, 3, 4, 5];
    const output = shuffle(input);
    expect(output.length).toBe(input.length);
});

// check.test.js
test('check returns true for correct answer', () => {
    // ...
});

// formatTime.test.js
test('formatTime converts seconds to mm:ss', () => {
    expect(formatTime(65)).toBe('1 min 5 sec');
});
```

**Выгоды:**
- ✅ Защита от регрессий
- ✅ Уверенность при рефакторинге

---

### 14. Система интервальных повторений

**Приоритет:** 🟡 Средний  
**Время:** 4-6 часов  
**Статус:** ⏸ На будущее

**Идея:** Сохранять ошибки в localStorage и показывать чаще.

**Алгоритм:**
```javascript
// При ошибке
function saveMistake(signFile) {
    const mistakes = JSON.parse(localStorage.getItem('mistakes') || '[]');
    mistakes.push({
        file: signFile,
        date: Date.now(),
        interval: 1  // Через 1 минуту
    });
    localStorage.setItem('mistakes', JSON.stringify(mistakes));
}

// При генерации теста
function getWeightedTestSet() {
    const mistakes = getDueMistakes();  // Те, что пора повторить
    const random = getRandomSigns(20 - mistakes.length);
    return [...mistakes, ...random];
}
```

**Выгоды:**
- ✅ Эффективное запоминание
- ✅ Персонализация

---

### 15. Тёмная тема

**Приоритет:** 🟢 Низкий  
**Время:** 2-3 часа  
**Статус:** ⏸ На будущее

**Решение:**
```css
:root {
    --bg: #f1f2f6;
    --text: #2c3e50;
}

[data-theme="dark"] {
    --bg: #1a1a2e;
    --text: #eee;
}
```

```html
<button onclick="toggleTheme()">🌓 Тема</button>
```

---

### 16. Экспорт ошибок в PDF

**Приоритет:** 🟢 Очень низкий  
**Время:** 3-4 часа  
**Статус:** ⏸ На будущее

**Библиотека:** jsPDF или html2pdf

**Функционал:**
- Кнопка "Экспорт ошибок" в результатах
- Генерация PDF со списком знаков, которые были ошибочны
- Возможность распечатать для офлайн-изучения

---

### 17. Достижения (Achievements)

**Приоритет:** 🟢 Очень низкий  
**Время:** 4-6 часов  
**Статус:** ⏸ На будущее

**Примеры:**
```javascript
const achievements = {
    'perfect_20': { name: 'Идеальный тест', condition: () => points === 20 },
    'speed_master': { name: 'Скоростной', condition: () => avgTime < 3 },
    'all_categories': { name: 'Универсал', condition: () => completedCategories === 6 }
};
```

---

## 📊 Трекер версий

| Версия | Дата | Изменения |
|--------|------|-----------|
| 3.4 | 2026-02-20 | (План) Исправление XSS, иконка 512px, meta description |
| 3.3 | 2026-02-20 | (Текущая) Удалена кнопка перевода из Flashcard |
| 3.2 | 2026-02-19 | Service Worker v3.2 |
| 3.1 | 2026-02-18 | PWA manifest v3.1 |

---

## ✅ Чек-лист перед релизом v3.4

- [ ] Исправить XSS (innerHTML → textContent)
- [ ] Добавить иконку 512x512
- [ ] Обновить manifest.json
- [ ] Добавить meta description
- [ ] Синхронизировать версии (все v=3.4)
- [ ] Добавить кнопку Refresh при ошибке
- [ ] Протестировать PWA установку
- [ ] Проверить офлайн-режим
- [ ] Протестировать на мобильных устройствах
- [ ] Проверить все 4 языка

---

## 📞 Контакты

Для вопросов и предложений создавайте Issues на GitHub.
