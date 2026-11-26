# 📰 The Daily Digest

> **AI-powered news briefing — built entirely with structured vibe coding using Gemini CLI agents.**

The Daily Digest fetches live headlines from the Currents news API, summarises and ranks them using Google's Gemini API, and delivers a personalised daily briefing tailored to your selected topics. API keys stay on the Vite dev and preview server. There is no database and no separate backend process to deploy.

This project was built in a single afternoon as a live demo for a presentation on effective AI use in software development. Every agent session, architecture decision, bug, and honest moment is documented in [`BUILD_DIARY.md`](./BUILD_DIARY.md).

---

## 📸 What It Looks Like

```
┌─────────────────────────────────────────────────────┐
│  Daily Digest          Monday, 10 May 2026          │
│                                                     │
│  Topics:  [Technology ×]  [AI ×]                   │
│                                         [Refresh]   │
├─────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────┐   │
│  │  Executive Summary                          │   │
│  │  AI is reshaping software development       │   │
│  │  faster than expected, with major releases  │   │
│  │  from Google, OpenAI and Anthropic...       │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  AI reshapes software development         90%      │
│  ████████████████████░░░░  BBC News · 2h ago       │
│  AI Insight: Signals a fundamental shift...        │
│                                                     │
│  Google releases Gemini 2.5 Flash         85%      │
│  ████████████████░░░░░░░░  TechCrunch · 3h ago     │
│  AI Insight: The most capable model yet...         │
└─────────────────────────────────────────────────────┘
```

---

## ✨ Features

- **AI curation** — Gemini reads, ranks, and summarises every article with a 0–100 relevance score and a one-sentence explanation of why it matters today
- **Executive briefing** — a three-sentence summary of the biggest story, written entirely by Gemini
- **Live headlines** — fetches the 10 most recent articles per topic from Currents, covering the last 7 days, in parallel using `Promise.all`
- **Smart deduplication** — duplicate URLs are removed before any AI call, saving tokens and improving summary quality
- **10 topics** — Technology, AI, Finance, Science, Health, Space, Climate, Politics, Culture, Design — plus custom topics you add yourself
- **Saved stories** — bookmark articles in the browser. Bookmarks and custom topics persist in `localStorage`
- **Deep dives** — ask Gemini to explain a story simply, give the counter-argument, or spell out the impact
- **Audio briefing** — listen to the summary and top stories through the browser's Web Speech API
- **Copy and share** — copy the briefing as Markdown, or share it through the browser share sheet
- **Session caching** — the last generated digest is persisted to `sessionStorage` so a page refresh restores your briefing instantly without re-triggering the APIs
- **Privacy-first** — no database, no user accounts, no tracking. API keys stay on the server
- **Zero extra infrastructure** — `npm run dev` or `npm run preview` runs the UI and the API routes together

---

## 🛠️ Tech Stack

| Layer | Technology | Notes |
|---|---|---|
| Frontend | React 19 + TypeScript | Strict mode, verbatimModuleSyntax enabled |
| Build tool | Vite | Dev server on localhost:5173. `vite-api-plugin.ts` serves `/api/*` |
| Styling | Tailwind CSS v4 | `@tailwindcss/vite` plugin — no config file needed |
| AI | Google Generative AI SDK | Model: `gemini-2.5-flash-lite`, called from the Vite server |
| News data | Currents | Free tier — 250 req/day, production use allowed with attribution |
| State | Zustand | Global digest, topic, and bookmark state |
| Testing | Vitest + React Testing Library | Colocated test files |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18 or higher — check with `node --version`
- **Currents API key** — free account at [currentsapi.services](https://currentsapi.services/en/docs/). The free tier allows 250 requests per day and can be used in a production app. Show attribution and link each story back to the publisher
- **Gemini API key** — free at [aistudio.google.com/apikey](https://aistudio.google.com/apikey). When creating the key, select **Create a new project** to ensure the free tier quota is active. If you use an existing Google Cloud project with billing restrictions, you may receive a `limit: 0` quota error

> **⚠️ Region note:** If you are in New Zealand or Australia, the Gemini API free tier may require billing to be enabled on your Google Cloud project even for zero-cost usage. Linking a credit card unblocks the quota — you will not be charged within free tier limits.

> **⚠️ Currents and AI summaries:** Currents allows displaying a title, a short description, and a link to the original article. Their terms say customer-facing AI summaries are not included by default and may need separate permission. This app summarises those short snippets and always links out to the publisher.

---

### 1. Clone and install

```bash
git clone https://github.com/[your-username]/news-digest.git
cd news-digest
npm install
```

---

### 2. Set up environment variables

Copy the example file and fill in your real keys:

```bash
cp .env.example .env.local
```

Open `.env.local` and replace the placeholder values:

```env
CURRENTS_API_KEY=your_currents_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here
```

`VITE_CURRENTS_API_KEY` is accepted and is used ahead of any old news key still in the file. The Vite server reads it. Do not reference that name from client code, or Vite can bundle the key. `NEWS_API_KEY` and `VITE_NEWS_API_KEY` are fallbacks only when no Currents name is set.

> Never commit `.env.local` — it is already in `.gitignore`.

---

### 3. Start the development server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

Select one or more topics and click **Compile My Digest** to produce your first digest.

---

### 4. Run tests

```bash
npm run test
```

---

### 5. Build for production

```bash
npm run build
npm run preview
```

`npm run preview` serves the built app and the same `/api` routes, so keys stay on the server. Uploading the `dist/` folder to a static host by itself will not serve those routes.

> See [Known Limitations](#-known-limitations) before deploying.

---

## 🧠 How It Works

### Flow overview

```
User selects topics
       │
       ▼
NewsAdapter.fetchArticles()     ← one call per topic, in parallel
       │                         ← browser calls GET /api/news
       ▼
Vite API plugin                 ← Currents search, last 7 days, 10 articles
       │
       ▼
Deduplicate by URL              ← browser-side, before any AI call
       │
       ▼
GeminiAdapter.summarise()       ← POST /api/summarise (Gemini on the server)
       │
       ▼
Build Digest object             ← typed, scored, sorted by relevance
       │
       ▼
Render + persist to             ← sessionStorage for refresh survival
sessionStorage
```

Articles are ordered by **relevance score, highest first**. Currents supplies a recent pool (the last 7 days, 10 per topic). Gemini scores that pool from 0 to 100, and `useDigest` sorts the list before it renders. A newer story does not jump ahead of a more important one.

### Key architectural decisions

**API keys on the Vite server** — the browser calls `/api/news`, `/api/summarise`, and `/api/deep-dive`. `vite-api-plugin.ts` holds the Currents and Gemini keys and runs with `npm run dev` and `npm run preview`. See [ADR-008](./DECISIONS.md) and [ADR-010](./DECISIONS.md).

**Domain types first** — `src/domain/index.ts` was the first file written. All adapters, hooks, and components import from it. TypeScript enforces correctness across every layer — four agent mistakes were caught at compile time rather than runtime because of this.

**Deduplication before Gemini** — multiple topics can return the same article. Filtering duplicates by URL in `useDigest.ts` before the Gemini call saves tokens, improves summary coherence, and keeps costs down.

**JSON fence stripping** — Gemini sometimes wraps JSON responses in backtick code fences. `GeminiAdapter` strips these before calling `JSON.parse`. This was a real bug discovered during the build — see [BUILD_DIARY.md](./BUILD_DIARY.md) for the full entry.

---

## 📁 Project Structure

```
news-digest/
│
├── GEMINI.md               # Agent memory — tech stack, domain model, coding rules
├── AGENTS.md               # Role definitions and folder ownership per agent
├── TASKS.md                # Sprint board with completion status
├── DECISIONS.md            # Architecture decision records with rationale
├── BUILD_DIARY.md          # Real-time build log — what happened, what broke, final stats
│
├── .env.example            # Environment variable template
├── .env.local              # Your real keys — never committed
├── vite.config.ts          # Vite config (no test config — see vitest.config.ts)
├── vite-api-plugin.ts      # Server routes for Currents, Gemini summary, and deep dive
├── vitest.config.ts        # Vitest config (separate from Vite in this setup)
├── tsconfig.json
│
└── src/
    ├── domain/
    │   └── index.ts        # ← All TypeScript interfaces live here. Read this first.
    │
    ├── adapters/
    │   ├── NewsAdapter.ts          # Calls GET /api/news, maps response to Article[]
    │   ├── NewsAdapter.test.ts
    │   ├── GeminiAdapter.ts        # Calls /api/summarise and /api/deep-dive
    │   └── GeminiAdapter.test.ts
    │
    ├── hooks/
    │   ├── useTopics.ts            # Topic toggle logic with last-active guard
    │   ├── useDigest.ts            # Orchestrates the full fetch → summarise flow
    │   ├── useDeepDive.ts          # On-demand ELI5, counter, and impact answers
    │   └── useAudioBriefing.ts     # Web Speech playback of the briefing
    │
    ├── store/
    │   └── digestStore.ts          # Zustand store — topics, digest, bookmarks, status
    │
    ├── components/
    │   ├── TopicSelector/          # Chip multi-select UI and custom topics
    │   ├── DigestHeader/           # Date, topic pills, audio, copy/share, refresh
    │   ├── ExecutiveSummary/       # Amber blockquote with skeleton loading state
    │   ├── ArticleCard/            # Title link, source, time, AI reason, bookmark, deep dive
    │   ├── StatusBanner/           # Loading and error message display
    │   └── ScoreBar/               # Animated relevance score bar (0–100)
    │
    ├── utils/
    │   ├── hashUrl.ts              # Generates stable Article.id from URL
    │   ├── relativeTime.ts         # "2 hours ago" formatting
    │   ├── sanitizeUrl.ts          # Allows only http(s) article links
    │   ├── exportBriefing.ts       # Markdown copy and share of the digest
    │   └── mapCurrentsNews.ts      # Maps Currents search results to Article fields
    │
    ├── ErrorBoundary.tsx
    ├── App.tsx
    ├── main.tsx
    └── index.css                   # Contains only: @import "tailwindcss"
```

---

## 🗂️ Workspace Files

This project was built using **structured vibe coding** — an approach where AI agents are given scoped responsibilities, persistent context via workspace files, and clear boundaries between roles.

| File | Purpose |
|---|---|
| [`GEMINI.md`](./GEMINI.md) | The agent's brain — read automatically by Gemini CLI on every session |
| [`AGENTS.md`](./AGENTS.md) | Defines 4 specialist agents: Architect, Data Layer, Frontend, QA |
| [`TASKS.md`](./TASKS.md) | Sprint board — every task tracked as `[ ]` or `[x]` |
| [`DECISIONS.md`](./DECISIONS.md) | Architecture decision log — every major choice with its reason |
| [`BUILD_DIARY.md`](./BUILD_DIARY.md) | Honest real-time build log written by the developer, not the agents |

These files are not documentation added after the fact. They were written **before any code**, and every agent session read them before producing output. This is the core technique that makes multi-session AI coding coherent.

---

## 🤖 Agent Sessions

The application was built across 6 sequential Gemini CLI sessions:

| Session | Agent | Tasks completed |
|---|---|---|
| 1 | Architect | Domain types, .env.example, scaffold verification |
| 2 | Data Layer | NewsAdapter, GeminiAdapter, hashUrl, relativeTime |
| 3 | Frontend | Zustand store, useTopics, useDigest |
| 4 | Frontend | All UI components, App shell, ErrorBoundary |
| 5 | QA | Type audit, JSDoc audit, adapter tests, manual checklist |
| 6 | Frontend | Demo polish, animation, end-to-end verification |

Each session was followed by a commit tagged `[gemini-cli]`. The full prompt used for each session is documented in [`TASKS.md`](./TASKS.md).

---

## ⚠️ Known Limitations

### The API server is the Vite process
`CURRENTS_API_KEY` (or `VITE_CURRENTS_API_KEY`) and `GEMINI_API_KEY` are read by `vite-api-plugin.ts`. They are not bundled into client JavaScript when you use `npm run dev` or `npm run preview`, as long as client code does not read the `VITE_` name.

A static host that only serves `dist/` has no `/api` routes. Run `npm run preview`, or host the app somewhere that executes the same Vite middleware.

### Currents free tier
The free plan allows 250 requests per day, 20 results per request, and a 7-day search window. This app asks for 10 English articles per topic inside that window. Exceeding the daily cap returns HTTP 429.

Currents requires attribution and a link to the original publisher. Do not store a permanent archive of article text. Customer-facing AI summaries may need separate permission from Currents.

### Gemini free tier by region
The Gemini API free tier is not uniformly available in all regions. If you receive a `limit: 0` quota error, link a billing account to your Google Cloud project — you will not be charged within free tier usage limits, but the billing link is required to unlock the quota in some regions.

### sessionStorage scope
The digest cache is stored in `sessionStorage`, which clears when the browser tab is closed. This is intentional for demo freshness. Bookmarks and custom topics use `localStorage` and survive a closed tab. If you want the digest itself to persist across sessions, replace `sessionStorage` with `localStorage` in `useDigest.ts`.

---

## 🏗️ How This Was Built

This application was built using **Gemini CLI** as the coding agent and a structured multi-agent workflow documented in the workspace files above.

**Build stats:**
- Total build time: 3 hours 37 minutes (including 38 minutes of environment setup)
- Lines written by agents: ~1,250
- Lines written personally: 47
- TypeScript errors caught at compile time: 4
- Agent sessions: 6

The complete story — including every bug, every fix, and every moment that went wrong — is in [`BUILD_DIARY.md`](./BUILD_DIARY.md).

---

## 📄 License

MIT — see [`LICENSE`](./LICENSE) for details.

---

## 🙏 Built With

- [Gemini CLI](https://github.com/google-gemini/gemini-cli) — open source AI coding agent (Apache 2.0)
- [Currents](https://currentsapi.services/) — real-time news headlines
- [Google Gemini](https://ai.google.dev) — AI summarisation
- [React](https://react.dev) + [TypeScript](https://typescriptlang.org) + [Vite](https://vitejs.dev)
- [Tailwind CSS v4](https://tailwindcss.com) + [Zustand](https://zustand-demo.pmnd.rs)
