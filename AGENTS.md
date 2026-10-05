# AGENTS.md — AWS Production Masterclass Platform

Interactive AWS learning platform: a **data-driven static frontend** served by a
**FastAPI backend** that persists progress/quiz/lab-note state to Postgres (or
SQLite). All lesson content lives in JS data files — the backend never serves
content.

## Repo Layout

```
Uday_AWS/
├── backend/                    # FastAPI + SQLAlchemy (async)
│   ├── app.py                  # App entry: routers + StaticFiles mount at /
│   ├── database.py             # Engine/session; DATABASE_URL → asyncpg, else SQLite fallback
│   ├── models.py               # ORM (user_progress, quiz_submissions,
│   │                           #   challenge_submissions, user_notes) + Pydantic schemas
│   ├── requirements.txt        # includes greenlet (required by sqlalchemy asyncio)
│   └── routes/                 # health, courses, progress, quizzes, sandbox, labs
├── aws-lambda-masterclass/     # Frontend (vanilla JS, NO build step)
│   ├── index.html              # Landing page → app.initLanding()
│   ├── component-library.html  # Storybook-style catalog for MasterclassUI
│   ├── lab-server.cjs          # Alt Node server (:8081); /api/lab now also in FastAPI
│   ├── chapters/               # Copies of Chapter_XX_*.md (fetched by popups)
│   ├── modules/module-XX.html  # 47 near-identical page shells
│   ├── css/                    # design-system.css (tokens + [data-theme=dark])
│   └── js/
│       ├── shared.js           # MCUtils, MCChapters, MCI18n, MCTheme — LOAD FIRST
│       ├── app.js              # App controller (window.app)
│       ├── data/courses.js     # COURSE_REGISTRY — 47 modules, metadata, achievements
│       ├── data/module-XX-*.js # MODULE_XX_DATA — actual lesson content per module
│       ├── engine/             # render engines + api-sync (see below)
│       └── components/         # masterclass-ui.js facade + web-components.js (<ui-*>)
├── Chapter_XX_*.md             # Source markdown (47 chapters, 28-section format)
├── Dockerfile                  # python:3.11-slim → uvicorn :8080
├── docker-compose.yml          # postgres:15 (host :5433) + web (:8080)
└── render.yaml                 # Render.com blueprint (Docker + managed Postgres)
```

## How to Run

```bash
# Full stack (recommended)
docker compose up --build            # → http://localhost:8080

# FastAPI only (SQLite fallback → data/masterclass.db)
pip install -r backend/requirements.txt
uvicorn backend.app:app --host 0.0.0.0 --port 8080 --reload

# Static + lab-note persistence (legacy alternative; FastAPI covers it now)
cd aws-lambda-masterclass && node lab-server.cjs   # → http://localhost:8081

# Static only (everything degrades to localStorage)
cd aws-lambda-masterclass && python -m http.server 5500
```

Useful endpoints: `/docs` (Swagger), `/health`, `/api/progress/summary`,
`/api/lab/:moduleId`, `/components` (component catalog).

## Shared Foundation (`js/shared.js`) — load before ALL engines

Four globals, one file, loaded first in every page:

| Global | Provides |
|---|---|
| `MCUtils` | `escapeHtml`, `slugify`, `injectStyles`, `loadScript`, `loadMarked`, `loadMermaid`, `renderMermaid`, `createModal` (+ shared `.mc-modal-*` / `.md-rendered` CSS) |
| `MCChapters` | single `MD_MAP` (module → chapter file), `currentModuleId/Title`, `fetchMarkdown`, `stripPracticalLabs`, `extractPracticalLabs` |
| `MCI18n` | `t(key, vars)`, `setLocale`, `localizeDocument` (translates `data-i18n`/`data-i18n-placeholder`), dicts: `en`, `hi` — persisted in `localStorage['mc-locale']` |
| `MCTheme` | `apply/toggle/get`, persisted in `localStorage['mc-theme']`, respects `prefers-color-scheme`; auto-adds 🌙/☀️ toggle + locale picker to `.topbar-actions` (or floating) |

Dark theme lives in `design-system.css` under `[data-theme="dark"]` — it
inverts the neutral ramp + semantic tints. White text on colored surfaces uses
`--text-on-accent` (not `--color-neutral-0`); keep it that way.

## Frontend Architecture

- **No framework, no bundler.** Plain `<script>` tags; global classes on `window`.
  Load order in each `modules/module-XX.html` matters:
  `shared.js → progress-engine → interactive engines → lesson-engine →
  courses.js → module-XX data → lab-popup → details-popup → api-sync → app.js`,
  then inline `app.currentModule='module-XX'; app.initModule(MODULE_XX_DATA)`.
- **Render pipeline**: `LessonEngine` walks `data.sections[]` and dispatches on
  `section.type` → `text|why|concept|expected-output|what-happened|cleanup`
  (raw HTML), `architecture` (DiagramEngine SVG), `lab` (LabEngine step
  machine), `console` (ConsoleSimulator guided clicks via `.console-clickable`
  + `data-action-id`), `terminal` (TerminalEngine regex command registry),
  `code` (CodeEditorEngine w/ `languages[]` + `explanations`), `command`
  (CommandBlock copy/run/explain/errors), `troubleshooting`/`interview`
  (accordions), `quiz` (QuizEngine, `correctId` client-side), `challenge`
  (ChallengeEngine keyword matching or custom `validator`), `next` (nav links).
- **Progress**: `ProgressEngine` → `localStorage['aws-masterclass-progress']`;
  section → lesson → module → mastery (beginner/intermediate/advanced/
  production-ready at 40/70/90%). `app.initModule` calls
  `progress.registerLesson(moduleId, lessonId, [real section IDs])` so
  completion math uses the data file's real sections, not empty registry stubs.
  `api-sync.js` attaches via `attachToProgressEngine` and POSTs to
  `/api/progress/sync` on every change (graceful no-op offline).
- **Achievements**: 8 defined in `COURSE_REGISTRY.achievements`; granted by
  `ProgressEngine._checkAchievements()` on every save.
- **Markdown popups**: `details-popup.js` ("Detailed Chapter") renders chapter
  markdown minus lab sections; `lab-popup.js` ("Lab Notes") renders only lab
  sections as accordions + a contenteditable notes editor POSTing to
  `/api/lab/:moduleId` (works on BOTH FastAPI and lab-server.cjs;
  localStorage fallback offline). All markdown/mermaid/MD_MAP/modal plumbing
  is in `shared.js` — do not re-add `MD_MAP` copies.

## Conventions

- **Adding a module**: create `js/data/module-XX-<slug>.js` exporting
  `MODULE_XX_DATA`, create `modules/module-XX.html` (copy an existing shell,
  update title + script src + `app.currentModule`), add registry entry in
  `courses.js`, add `MCChapters.MD_MAP` entry in `js/shared.js` (ONE place
  now), copy `Chapter_XX_*.md` into `aws-lambda-masterclass/chapters/`.
- **Screenshot images**: chapter markdown references `image-N.png`; `<img>`
  srcs resolve relative to the *page* URL (`/modules/module-XX.html`), so new
  images MUST land in `aws-lambda-masterclass/modules/` — copies at repo root
  or app root don't render. (Duplicated copies exist; the modules/ one is
  the load-bearing one.)
- **Adding a section**: append a `{id, type, title, content}` object to
  `MODULE_XX_DATA.sections`; follow the per-type content shape documented in
  each engine's constructor JSDoc.
- **UI strings**: route literals through `MCI18n.t('namespace.key')` and add
  translations to `DICTS` in `shared.js`; static shell text uses
  `data-i18n` attributes (auto-applied by `localizeDocument`).
- **Escaping**: always `MCUtils.escapeHtml` — engines delegate their
  `_escapeHtml` to it; don't add new copies.
- **Style**: CSS custom properties from `design-system.css`
  (`--color-*`, `--space-*`, `--radius-*`, `--text-on-accent`); engines inline
  most styles — prefer tokens so dark theme works.
- **Commits**: short imperative messages (see `git log`).

## Known Gaps / Caveats (verified — not aspirational)

- Registry `lessons[].id` (e.g. `rds-overview`) does NOT always match the
  data-file lesson `id` (e.g. `rds-fundamentals`) — live registration handles
  it, but a schema validator would be the real fix.
- 47 module shells still duplicate the same ~15 script tags — a shared
  loader/build step remains the biggest DRY win.
- Quiz grading is client-side (`correctId` in JS); backend trusts
  `correct_option` in the request body.
- `ChallengeEngine` does string matching, not code execution.
- Sandbox executes Python subprocesses behind a small blacklist — bypassable.
  Do not expose publicly as-is. CORS is `allow_origins=["*"]` with
  `allow_credentials=False` (valid, but open).
- `user_id` is a random localStorage ID (`masterclass-user-id`) — progress
  doesn't follow users across devices; no auth exists.
- Two lab-note persistence paths now exist (FastAPI `/api/lab` +
  `lab-server.cjs`) — pick one eventually.
- i18n covers UI chrome only (~100 keys); lesson content is English-only.
  `setLocale` reloads the page (engines render once).
- Dark theme: engines still contain some hardcoded hex in inline styles; the
  `.lab-content-toggle` pastel greens get explicit dark overrides in
  design-system.css — extend that block when adding hardcoded colors.
- There are **no tests** in the repo.

## Verification

No test suite. Quick smoke:
```bash
uvicorn backend.app:app --port 8090 &          # SQLite, no docker needed
curl localhost:8090/health
curl localhost:8090/api/courses/info           # total_modules: 47
curl localhost:8090/api/lab/module-06          # {"content":""}
node --check js/shared.js                      # syntax check any JS change
```
Open `http://localhost:8080/modules/module-XX.html`, check the browser console
for JS errors, confirm engines render, theme toggle 🌙 appears top-right, and
hit `/docs` for API checks.
