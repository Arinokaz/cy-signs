# Cyprus Road Signs Quiz

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![PWA](https://img.shields.io/badge/PWA-Certified-green)](https://cy-signs.com/)
[![Version](https://img.shields.io/badge/version-5.3-blue)](https://cy-signs.com/)

**Official website:** [cy-signs.com](https://cy-signs.com/)

A professional, production-grade Progressive Web Application for mastering Cyprus road signs. Designed for driving test candidates, this platform delivers an enterprise-level learning experience with 227 official traffic signs across 6 categories.

---

## 📖 Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Data Model](#data-model)
- [Multilingual Support](#multilingual-support)
- [PWA & Offline Capabilities](#pwa--offline-capabilities)
- [Performance](#performance)
- [SEO & Analytics](#seo--analytics)
- [Contributing](#contributing)
- [License](#license)

---

## 📋 Overview

Cyprus Road Signs Quiz is a comprehensive educational platform built for individuals preparing for the Cyprus driving theory examination. The application combines pedagogical best practices with modern web technologies to deliver an efficient, accessible, and engaging learning experience.

**Target Audience:**
- Driving school students in Cyprus
- Expats relocating to Cyprus
- Tourists planning extended stays
- Driving instructors and educators

**Learning Methodology:**
- Spaced repetition through randomized question generation
- Active recall via quiz and flashcard modes
- Contextual learning with detailed explanations
- Self-paced reference mode for systematic study

---

## ✨ Key Features

### Quiz Mode
- **Flexible Test Lengths:** 5, 10, 20, 50 questions, or complete question bank
- **Category Filtering:** Focused practice on specific sign categories
- **Smart Distractors:** Algorithmically generated wrong answers from the same category
- **Performance Analytics:** Response time tracking with color-coded feedback
  - 🟢 Green: < 5 seconds (confident knowledge)
  - 🟡 Yellow: 5–10 seconds (moderate confidence)
  - 🔴 Red: > 10 seconds (needs review)
- **Error Review:** Comprehensive breakdown of incorrect answers with explanations

### Flashcard Mode
- Memorization-focused interface
- Progressive disclosure (question → answer → self-assessment)
- Optimized for spaced repetition learning

### Reference Mode
- Complete catalog of all 227 signs
- Searchable database
- Categorized browsing
- Detailed explanations for each sign

### User Experience
- **Multilingual Interface:** Full support for English, Ukrainian, Greek, and Russian
- **Independent Language Settings:** Separate configuration for interface, quiz content, and hints
- **Responsive Design:** Mobile-first approach ensuring flawless experience across all devices
- **Accessibility:** WCAG 2.1 compliant with proper ARIA labels and keyboard navigation
- **Dark Mode Ready:** CSS variable-based theming system

### Progressive Web App
- **Offline-First:** Full functionality without internet connection
- **Installable:** Add to home screen on iOS and Android
- **Auto-Updates:** Service Worker automatically caches new versions
- **Native-like Experience:** Standalone display mode, custom splash screens

---

## 🛠 Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend** | HTML5, CSS3, Vanilla JavaScript (ES6+) | Core application |
| **Architecture** | ES6 Modules | Code organization and maintainability |
| **Styling** | CSS Custom Properties, Flexbox, CSS Grid | Responsive, themable design |
| **PWA** | Service Worker (Cache API), Web App Manifest | Offline support, installability |
| **Backend** | Firebase Hosting | Global CDN, SSL, automatic compression |
| **Cloud Functions** | Node.js 24, Firebase Functions | Serverless backend services |
| **Analytics** | Google Analytics 4 (GA4) | Usage tracking, user insights |
| **Build** | None (vanilla build) | Zero build complexity, instant deployments |

### Why Vanilla JavaScript?

This project intentionally uses pure JavaScript without frameworks to achieve:
- **Zero Dependencies:** No npm packages for frontend, eliminating supply chain risks
- **Maximum Performance:** No virtual DOM overhead, direct DOM manipulation
- **Long-term Maintainability:** Code will run unchanged for decades
- **Minimal Bundle Size:** ~50KB total (gzipped), instant load times
- **Full Control:** Complete ownership of every line of code

---

## 🏗 Architecture

### Design Principles

1. **Separation of Concerns**
   - Data layer (`signs-data.js`) completely isolated from business logic
   - UI layer (`ui.js`) handles only DOM operations
   - State management (`state.js`) centralizes application state
   - Internationalization (`i18n.js`) encapsulates all translation logic

2. **Module-Based Architecture**
   ```
   js/
   ├── app.js           → Entry point, initialization
   ├── state.js         → Centralized state management
   ├── i18n.js          → Internationalization system
   ├── ui.js            → UI rendering and utilities
   ├── quiz.js          → Quiz mode logic
   ├── flashcard.js     → Flashcard mode logic
   ├── reference-page.js → Reference mode logic
   ├── results.js       → Results display and analytics
   ├── sign-page.js     → Sign rendering utilities
   ├── feedback.js      → Feedback and sharing features
   └── utils.js         → Shared utility functions
   ```

3. **State Management Pattern**
   - Single source of truth: `AppState` object
   - Reactive UI updates triggered by state changes
   - Immutable settings pattern for predictability

4. **Data Flow**
   ```
   signs-data.js (static data)
         ↓
   state.js (runtime state)
         ↓
   i18n.js (localization)
         ↓
   ui.js (rendering)
   ```

---

## 📁 Project Structure

```
cy-signs/
├── index.html                 # Main application entry point
├── reference.html             # Reference mode page
├── feedback.html              # User feedback interface
├── manifest.json              # PWA manifest
├── sw.js                      # Service Worker (offline caching)
├── robots.txt                 # Search engine directives
├── sitemap.xml                # SEO sitemap
├── BingSiteAuth.xml           # Bing verification
├── CNAME                      # Custom domain configuration
│
├── styles.css                 # Global styles (~740 lines)
├── translations.js            # UI translation strings
├── signs-data.js              # Sign database (227 entries)
│
├── js/                        # Application modules
│   ├── app.js                 # Entry point, initialization
│   ├── state.js               # State management
│   ├── i18n.js                # Internationalization
│   ├── ui.js                  # UI utilities
│   ├── quiz.js                # Quiz mode logic
│   ├── flashcard.js           # Flashcard mode logic
│   ├── reference-page.js      # Reference mode
│   ├── results.js             # Results handling
│   ├── sign-page.js           # Sign rendering
│   ├── feedback.js            # Feedback system
│   └── utils.js               # Utilities
│
├── functions/                 # Firebase Cloud Functions
│   ├── index.js               # Function definitions
│   ├── package.json           # Function dependencies
│   └── params.yaml            # Environment parameters
│
├── img/                       # Static assets
│   ├── main-icon.png          # App icon (192x192, 512x512)
│   ├── share.svg              # Share icon
│   └── [220+ sign images]     # Road sign graphics (SVG/PNG)
│
├── .firebaserc                # Firebase project config
├── firebase.json              # Firebase deployment config
├── .gitignore                 # Git ignore rules
└── README.md                  # This documentation
```

---

## 📊 Data Model

### Sign Object Schema

```javascript
{
  "id": "unique-sign-identifier",      // Unique ID for reference
  "name": {                             // Localized names
    "en": "Built-up area",
    "uk": "Межа населеного пункту",
    "el": "Κατοικημένη περιοχή",
    "ru": "Граница населенного пункта"
  },
  "hint": {                             // Short hints (shown on error)
    "en": "Start of built-up area, lower speed",
    "uk": "Початок населеного пункту, менша швидкість",
    "el": "Αρχή κατοικημένης περιοχής, μειωμένη ταχύτητα",
    "ru": "Начало населённого пункта, снижайте скорость"
  },
  "explanation": {                      // Detailed explanations
    "en": "This sign marks the beginning of a built-up area...",
    "uk": "Цей знак позначає початок населеного пункту...",
    "el": "Η πινακίδα αυτή σηματοδοτεί την αρχή...",
    "ru": "Этот знак означает начало застроенной зоны..."
  },
  "file": "built_up_area.svg",         // Image filename (must match exactly)
  "cat": "information",                // Category (see below)
  "fav": false                         // User-marked favorite
}
```

### Sign Categories

| Category | Key | Description | Visual Style |
|----------|-----|-------------|--------------|
| Warning | `warning` | Hazard warnings | Red triangles |
| Regulatory | `regulatory` | Prohibitions and priorities | Red circles |
| Mandatory | `mandatory` | Required actions | Blue circles |
| Information | `information` | Route and service info | Blue/white rectangles |
| Police | `police` | Traffic officer signals | Illustrations |
| Markings | `markings` | Road surface markings | Yellow lines |

---

## 🌐 Multilingual Support

### Supported Languages

| Language | Code | Flag | Coverage |
|----------|------|------|----------|
| English | `en` | 🇬🇧 | 100% |
| Ukrainian | `uk` | 🇺🇦 | 100% |
| Greek | `el` | 🇬🇷 | 100% |
| Russian | `ru` | 🇷🇺 | 100% |

### Language Detection Priority

1. URL parameter (`?lang=uk`)
2. localStorage persistence
3. Browser language (`navigator.language`)
4. Default: English

### Independent Language Tracks

Users can configure three language settings independently:
- **Interface Language:** Buttons, labels, navigation
- **Quiz Language:** Answer options in quiz mode
- **Helper Language:** Explanations and hints

This design supports language learners studying road signs in a non-native language.

---

## 📱 PWA & Offline Capabilities

### Service Worker Strategy

**Cache-First with Network Fallback**

```javascript
// sw.js
const CACHE_NAME = 'cyprus-signs-v5.3';

// Pre-cached assets (install event)
const ASSETS = [
  './',
  './index.html',
  './styles.css',
  './translations.js',
  './signs-data.js',
  './js/app.js',
  './js/state.js',
  './js/i18n.js',
  // ... all modules
];

// Fetch strategy:
// 1. Check cache → return if available
// 2. Fetch from network → cache response → return
```

### Offline Features

- ✅ Full quiz functionality
- ✅ Flashcard mode
- ✅ Reference browsing
- ✅ Search functionality
- ✅ Language switching

### Auto-Update Mechanism

When a new version is detected:
1. Service Worker installs in background
2. User receives update notification
3. On confirmation, page reloads with new version
4. Old cache automatically purged

### Installation Prompts

- **Android:** Automatic install banner
- **iOS:** Custom modal with installation instructions
- **Desktop:** Browser-native install prompt

---

## ⚡ Performance

### Lighthouse Scores (Target)

| Metric | Score | Target |
|--------|-------|--------|
| Performance | 95–100 | ✅ |
| Accessibility | 95–100 | ✅ |
| Best Practices | 95–100 | ✅ |
| SEO | 95–100 | ✅ |
| PWA | 100 | ✅ |

### Optimization Techniques

- **Lazy Loading:** Images loaded with `loading="lazy"`
- **Code Splitting:** ES6 modules loaded on demand
- **Minimal CSS:** No frameworks, hand-optimized styles
- **No JavaScript Frameworks:** Zero virtual DOM overhead
- **CDN Delivery:** Firebase Hosting with global edge locations
- **HTTP/2:** Multiplexed asset delivery
- **Gzip/Brotli:** Automatic compression via Firebase

### Bundle Size

| Resource | Size (gzipped) |
|----------|----------------|
| HTML | ~8 KB |
| CSS | ~15 KB |
| JavaScript (all modules) | ~25 KB |
| Data (227 signs) | ~45 KB |
| **Total** | **~93 KB** |

---

## 🔍 SEO & Analytics

### SEO Implementation

- **Semantic HTML5:** Proper heading hierarchy, ARIA labels
- **Meta Tags:** Comprehensive metadata for all supported languages
- **Structured Data:** Schema.org `LearningProject` markup
- **Hreflang Tags:** Multi-language URL targeting
- **Open Graph:** Social media preview optimization
- **Twitter Cards:** Rich card support
- **Canonical URLs:** Duplicate content prevention
- **XML Sitemap:** Automated sitemap generation

### Analytics Integration

- **Google Analytics 4:** Event tracking for:
  - Quiz completions
  - Category selection
  - Language preferences
  - Error rates
  - Session duration

### Search Console Optimization

- Mobile usability: 100%
- Core Web Vitals: All green
- Index coverage: Full indexing

---

## 🤝 Contributing

We welcome contributions from the community. Please follow these guidelines:

### Code Standards

- **JavaScript:** ES6+, strict mode, semicolons required
- **CSS:** BEM naming convention, CSS custom properties
- **HTML:** Semantic elements, ARIA attributes
- **Comments:** JSDoc for functions, inline comments for complex logic

### Pull Request Process

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Reporting Issues

- Use GitHub Issues for bug reports and feature requests
- Include browser, OS, and reproduction steps
- Attach screenshots when applicable

### Adding New Signs

1. Add image to `img/` directory (SVG preferred)
2. Add entry to `signs-data.js` with all translations
3. Verify filename matches exactly
4. Test in all four languages

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

**Copyright © 2026 Cyprus Driving Test. All rights reserved.**

---

## 📞 Support & Contact

- **Website:** [cy-signs.com](https://cy-signs.com/)
- **Feedback:** [Feedback Form](https://cy-signs.com/feedback.html)
- **Issues:** [GitHub Issues](https://github.com/your-org/cy-signs/issues)

---

## 🗺 Roadmap

### Q2 2026
- [ ] Spaced repetition algorithm for error tracking
- [ ] User accounts with progress sync (Firebase Auth)
- [ ] Dark mode toggle

### Q3 2026
- [ ] Timed exam mode with countdown
- [ ] Achievement system with badges
- [ ] Export mistakes to PDF

### Q4 2026
- [ ] Audio pronunciation for Greek signs
- [ ] Animated police signal demonstrations
- [ ] Multi-language voice support

---

**Version:** 5.3  
**Last Updated:** March 2026  
**Maintained By:** Cyprus Driving Test Team
