# AGENTS.md

Notes for OpenCode sessions working in `cy-signs`. Only high-signal, repo-specific facts.

## Stack at a glance

- Static PWA, vanilla JS (ES6 modules), **no build step**, **no `package.json` at the root**, no bundler, no test runner, no linter, no formatter, no CI workflows, no pre-commit hooks.
- **Frontend → GitHub Pages.** Repo root is served as the site; `CNAME` pins `cy-signs.com`. Do not add a `hosting` block to `firebase.json`.
- **Firebase is Cloud Functions only.** `firebase.json` configures `functions/` (Node 24) and nothing else. The single exported function is `sendFeedback`, which POSTs to a Telegram bot. Project id: `cy-signs-online` (see `.firebaserc`).

## Local dev

- There is no `npm run dev`. From the repo root run `python3 -m http.server 8000` (or any static server) and open `http://localhost:8000/`. The service worker will not register over `file://`.

## Deploy

- **Frontend**: push to the default branch on `origin`; GitHub Pages deploys automatically. `opencode.json` denies `git push`, `git pull`, `git remote`, and `rm` for the agent — the user does the push. Do not try to push from inside a session.
- **Functions**: `cd functions && npm install && firebase deploy --only functions`. Requires the secrets `TELEGRAM_TOKEN` and `TELEGRAM_CHAT_ID` to be set in the `cy-signs-online` project (declared in `functions/params.yaml`).

## Bumping the version

The version lives in **one place**: the `/VERSION` file (plain text, e.g., `5.6`).

To bump:

1. Edit `VERSION` to the new value (e.g., `5.6` → `5.7`).
2. Run `bash scripts/bump-version.sh` — the script reads `VERSION` and substitutes it into:
   - `sw.js` → `CACHE_NAME = 'cyprus-signs-dynamic-vX.Y'`
   - Every `?v=X.Y` in `index.html`, `feedback.html`, `reference.html` (3 root files)
   - Every `?v=X.Y` in **all 227 files under `signs/`** (5 references per file: `styles.css`, `translations.js`, `signs-data.js`, `js/sign-page.js`, `manifest.json`)
3. Verify: `grep -rE '\?v=5\.7' --include='*.html' . | wc -l` should report ~1150.
4. Commit and push.

The script is idempotent — running it twice with the same VERSION makes the same substitutions, no diff.

## Adding a new sign

All four steps are required. There is no codegen.

1. Drop the image into `img/`. `.svg` is preferred; `.png` and `.jpg` are also used. The `file` field below must match the filename exactly.
2. Add an entry to `signs-data.js` with `name`, `hint`, `explanation` translated to **all four languages** (`en`, `uk`, `el`, `ru`), plus `file`, `cat` (one of `warning`, `regulatory`, `mandatory`, `information`, `police`, `markings`), `fav: false`, and a unique kebab-case `id`.
3. Hand-create `signs/<id>.html` by copying `signs/built-up-area.html`. Replace the title, description, canonical URL, hreflang URLs, OG image path (`../img/<file>`), and the GA `page_title` / `page_location` config block. Preserve the GA block shape so analytics keep firing. Keep the script tag pointing to `../js/sign-page.js` — it derives the sign id from the page filename.
4. No code change in `js/reference-page.js`; it iterates `allSigns` and links to `signs/<id>.html` automatically.

## Script vs module loading

- `signs-data.js` and `translations.js` are **classic scripts**, not modules. They define the globals `allSigns` and `t`. The root HTML files load them with `<script src="…">` *before* the module entry, and the modules reference them defensively with `typeof allSigns !== 'undefined'` (see `js/app.js:41`).
- All files under `js/` are ES6 modules loaded with `<script type="module">`. They import from each other; the only window globals they read are `allSigns` and `t`.
- `js/state.js` exports a single `AppState` object. Import it to read or mutate state; do not reintroduce ad-hoc window globals.

## Entry points per page

- `index.html` → `js/app.js` (quiz + flashcard shell).
- `reference.html` → `js/reference-page.js` (browseable catalog).
- `feedback.html` → `js/feedback-page.js` (rating + Telegram submission).
- `signs/<id>.html` → `js/sign-page.js` (single-sign detail view; one page per sign).

## i18n

- Supported languages: `en`, `uk`, `el`, `ru`. The allowed list is the literal `SUPPORTED_LANGS` array in `js/i18n.js:10`.
- **Three independent tracks**: interface / quiz / helper. Stored in `localStorage` under `cy_interface_lang`, `cy_quiz_lang`, `cy_helper_lang`.
- Detection order in `js/i18n.js`: URL `?lang=xx` → `localStorage` → `navigator.language` → `'en'`.
- Adding a new language requires touching: `SUPPORTED_LANGS` in `js/i18n.js`, every entry in `signs-data.js`, `translations.js`, the `<select>` options in `index.html` / `feedback.html` / `reference.html`, and the `hreflang` `<link>` tags in `index.html` and every file under `signs/`.

## Service worker

- Registered exactly once from `js/ui.js` (`setupServiceWorker`). Do not add a second `navigator.serviceWorker.register` call.
- Cache-first for static assets, network-first for HTML requests.
- Any new file referenced from `index.html`, `feedback.html`, or `reference.html` must also be added to the `ASSETS` array in `sw.js`'s `install` handler, or first-load offline will be broken.
- Sign images under `img/` are **not** pre-cached; they are fetched on demand.

## Conventions

- ES6+, strict mode, semicolons required. CSS uses BEM-ish class names and CSS custom properties (theme variables at the top of `styles.css`).
- Module header banners (`/* ==================== NAME ==================== */`) exist in the existing modules; leave them in place.
- `signs/*.html` files are nearly identical templates; preserve their structure when adding or editing one.

## OpenCode-specific

- `opencode.json` denies `git push`, `git pull`, `git remote *`, and `rm *`. The agent can read, edit, stage, and inspect but not push, pull, change remotes, or delete. Hand the user a clear diff summary and let them push.
