# `sample_deepti` branch analysis — DeeptiShuklaProject/Uday_AWS

> Prepared for the "bring it into our repo" decision. Branch already fetched
> as `deepti/sample_deepti`; merged content is on `main` (f518f2b) alongside
> the vanilla app — nothing removed.

## What it is

A **parallel React/Vite rewrite** of the masterclass frontend — not a feature
branch off our app. Same "content is data" philosophy, richer scope.

```
src/
├── main.jsx / App.jsx        — SPA shell
├── data/
│   ├── docsRegistry.json     — 9 top-level categories (see below)
│   ├── courseRegistry.json   — the 47-module AWS masterclass course
│   ├── categories.js / landingContent.js
│   └── modules/module-*.js   — prebuilt module data (38–47)
├── utils/moduleParser.js     — markdown → {objectives, sections[]} lesson shape
├── utils/github.js           — live GitHub file fetch (sessionStorage cache, PAT)
├── utils/conceptIndex.js + referenceGraph.js — concept cross-referencing
├── utils/monacoSetup.js      — Monaco editor
└── components/slides/        — one section component per slide type
    (Quiz, Lab, Terminal, Code, Command, Diagram, FlowDiagram,
     Troubleshooting, Interview, HotspotImage, ConversationalNotes, …)
```

## Content scope — bigger than vanilla

`docsRegistry.json` categories (public/ has the backing dirs):

| Category | Courses |
|---|---|
| aws-agentcore | 15 (full Show & Tell series) |
| linux | 24 |
| bedrock / bedrock-to-production | 3 + 1 |
| docker / kubernetes / python-devops | 1 each |
| microservices-aws / ecommerce-architecture | 2 + 1 |

Plus `doc_*` source dirs at repo root (doc_bedrock_production 31 files,
doc_python_devops 30, doc_docker 27, agentcore ×10, strands_agents…),
`strands_agentic_app/` (transcript tooling), interview-question `.docx` files.

## Backend story — separate from ours

- `server/index.cjs` — Node server: serves `dist/` + `/api/lab` lab-notes.
  Postgres via `DATABASE_URL`, else `labs/` dir on disk. **No FastAPI
  dependency.**
- `Dockerfile.react` — multi-stage: vite build → node server :8081.
- `render.yaml` — Render blueprint pointed at Dockerfile.react.

So this repo now has **two backends** (FastAPI :8080 vanilla ecosystem,
node :8081 React ecosystem) and **two frontends** — independent of each other.

## vs our vanilla app

| | vanilla (`aws-lambda-masterclass/`) | React (`src/`) |
|---|---|---|
| Stack | plain JS, no build | Vite + React 18 + react-router |
| Module format | `MODULE_XX_DATA.sections` JS | md → `moduleParser` at runtime |
| Extras | quiz/lab/terminal engines | + Monaco, GitHub explorer, concept graph, hotspot images, AgentFlow storyteller |
| Backend | FastAPI (progress/quiz/notes) | Node lab-notes only |
| Deploy | Dockerfile → uvicorn :8080 | Dockerfile.react → node :8081 |

## Merge state (already done)

- `main` = our main + deepti/main + sample_deepti + retained md files.
- One conflict resolved: `.gitignore` (union). `Chapter_02_Amazon_S3.md`
  took deepti/main side (has her latest image/mermaid fixes).
- Her `main` had 15 commits `sample_deepti` lacked — merged in, so docx
  interview files + capstone Ch48/49 + fixes are all present.

## Verified on machine (this analysis run)

- `npm ci` + `vite build` — **clean build**, 3435 modules → `dist/`.
  Main index chunk 4.3MB (1.13MB gzip) — Monaco/mermaid/cytoscape not
  split out; module data files lazy-load correctly.
- `node server/index.cjs` — index 200, `/api/lab/:id` 200 (labs/ dir
  fallback works without Postgres).
- **Registry audit: 397 chapter links, all resolve** — was 39 broken
  (bedrock `aws-employee-video-playlist-summaries` had doubled path
  `file: aws_employee_video_playlist/summaries/…` on top of the same
  `contentBase`). Fixed in `docsRegistry.json`, pushed to main.
- `courseRegistry.json` — all 47 modules have `src/data/modules/*.js`.

## Open items before "idhar laana" (however you want it)

1. **Orphaned chapters** — these md files exist but NO registry points
   at them: our `Chapter_48_Linux_Command_Line.md` +
   `Chapter_49_FDE.md`, and Deepti's own
   `Chapter_48/49_Capstone_Practical_*.md`. React `courseRegistry` stops
   at 47. Decide which set becomes modules 48/49 (or a capstone course).
   NOTE: her `linux` category's Ch48/49 are different files (SSH/SELinux
   under `doc_linux/`) — no collision, just same numbering.
2. **Content tripled** — chapters exist at root + `public/chapters/` +
   `aws-lambda-masterclass/chapters/`; pick the load-bearing one per app.
3. **Two lab-note APIs** — FastAPI `/api/lab` vs node `/api/lab`; choose one.
4. **.agents/skills/** came along — `software_course_builder_from_youtube`
   + `reusable_component_architecture` are now usable here.
5. Untracked junk present on disk: `backend/.venv/`, `debug-*.mjs`,
   `dev.log`, `ch2_smoke.txt`, `nul` — decide what to keep/gitignore.
