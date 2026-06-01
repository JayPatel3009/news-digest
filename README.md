# 📰 The Daily Digest

> **AI-powered news briefing — built entirely with structured vibe coding using Gemini CLI agents.**

The Daily Digest fetches live headlines from NewsAPI, summarises and ranks them using Google's Gemini API, and delivers a personalised daily briefing tailored to your selected topics — all in the browser, with no backend and no deployment config.

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

- **AI curation** — Gemini reads, ranks, and summarises every article with a 1–10 relevance score and a one-sentence explanation of why it matters today
- **Executive briefing** — a three-sentence summary of the biggest story, written entirely by Gemini
- **Live headlines** — fetches the 5 most recent articles per topic from NewsAPI in parallel using `Promise.all`
- **Smart deduplication** — duplicate URLs are removed before any AI call, saving tokens and improving summary quality
- **10 topics** — Technology, AI, Finance, Science, Health, Space, Climate, Politics, Culture, Design
- **Session caching** — the last generated digest is persisted to `sessionStorage` so a page refresh restores your briefing instantly without re-triggering the APIs
- **Privacy-first** — no backend, no database, no user accounts, no tracking
- **Zero infrastructure** — one command to run, nothing to deploy or maintain

---

## 🛠️ Tech Stack

| Layer | Technology | Notes |
|---|---|---|
| Frontend | React 18 + TypeScript | Strict mode, verbatimModuleSyntax enabled |
| Build tool | Vite | Dev server on localhost:5173 |
| Styling | Tailwind CSS v4 | `@tailwindcss/vite` plugin — no config file needed |
| AI | Google Generative AI SDK | Model: `gemini-2.0-flash` |
| News data | NewsAPI | Free tier — 100 req/day, localhost allowed |
| State | Zustand | Global digest + topic state |
| Testing | Vitest + React Testing Library | Colocated test files |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18 or higher — check with `node --version`
- **NewsAPI key** — free account at [newsapi.org](https://newsapi.org). The free tier allows 100 requests per day and permits browser requests from `localhost`
- **Gemini API key** — free at [aistudio.google.com/apikey](https://aistudio.google.com/apikey). When creating the key, select **Create a new project** to ensure the free tier quota is active. If you use an existing Google Cloud project with billing restrictions, you may receive a `limit: 0` quota error

> **⚠️ Region note:** If you are in New Zealand or Australia, the Gemini API free tier may require billing to be enabled on your Google Cloud project even for zero-cost usage. Linking a credit card unblocks the quota — you will not be charged within free tier limits.

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
VITE_NEWS_API_KEY=your_newsapi_key_here
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

> Never commit `.env.local` — it is already in `.gitignore`.

---

### 3. Start the development server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

Select one or more topics and click **Generate** to produce your first digest.

---

### 4. Run tests

```bash
npm run test
```

---

### 5. Build for production

```bash
npm run build
```

> See [Known Limitations](#-known-limitations) before deploying — the Gemini API key is bundled into the client in this configuration.

---

## 🧠 How It Works

### Flow overview

```
User selects topics
       │
       ▼
NewsAdapter.fetchArticles()     ← one call per topic, in parallel
       │
       ▼
Deduplicate by URL              ← browser-side, before any AI call
       │
       ▼
GeminiAdapter.summarise()       ← single call with all articles
       │
       ▼
Build Digest object             ← typed, scored, sorted by relevance
       │
       ▼
Render + persist to             ← sessionStorage for refresh survival
sessionStorage
```

### Key architectural decisions

**No backend** — all API calls happen directly from the browser. This keeps the demo to a single `npm run dev` with nothing to configure or maintain. See [ADR-001](./DECISIONS.md) for full reasoning.

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
├── vitest.config.ts        # Vitest config (separate from Vite in this setup)
├── tsconfig.json
│
└── src/
    ├── domain/
    │   └── index.ts        # ← All TypeScript interfaces live here. Read this first.
    │
    ├── adapters/
    │   ├── NewsAdapter.ts          # Calls NewsAPI, maps response to Article[]
    │   ├── NewsAdapter.test.ts
    │   ├── GeminiAdapter.ts        # Calls Gemini, parses DigestSummary
    │   └── GeminiAdapter.test.ts
    │
    ├── hooks/
    │   ├── useTopics.ts            # Topic toggle logic with last-active guard
    │   └── useDigest.ts            # Orchestrates the full fetch → summarise flow
    │
    ├── store/
    │   └── digestStore.ts          # Zustand store — topics, digest, status, error
    │
    ├── components/
    │   ├── TopicSelector/          # Chip multi-select UI
    │   ├── DigestHeader/           # Date, topic pills, Refresh button
    │   ├── ExecutiveSummary/       # Amber blockquote with skeleton loading state
    │   ├── ArticleCard/            # Title link, source, time, AI reason, ScoreBar
    │   ├── StatusBanner/           # Loading and error message display
    │   └── ScoreBar/               # Animated relevance score bar (1–10)
    │
    ├── utils/
    │   ├── hashUrl.ts              # Generates stable Article.id from URL
    │   └── relativeTime.ts         # "2 hours ago" formatting
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

### API key exposure
`VITE_GEMINI_API_KEY` and `VITE_NEWS_API_KEY` are bundled into the client-side JavaScript at build time and are visible to anyone who inspects the network tab. This is acceptable for a local demo but **not safe for a publicly deployed app**.

For production deployment, route both API calls through a lightweight server-side proxy so keys never reach the browser. A simple Express or Next.js API route is sufficient.

### NewsAPI CORS restriction
NewsAPI's free tier explicitly allows browser requests from `localhost` but blocks all requests from deployed domains. Deploying this app without a backend proxy will break the news fetch step silently.

### Gemini free tier by region
The Gemini API free tier is not uniformly available in all regions. If you receive a `limit: 0` quota error, link a billing account to your Google Cloud project — you will not be charged within free tier usage limits, but the billing link is required to unlock the quota in some regions.

### sessionStorage scope
The digest cache is stored in `sessionStorage`, which clears when the browser tab is closed. This is intentional for demo freshness. If you want persistence across sessions, replace `sessionStorage` with `localStorage` in `useDigest.ts`.

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
- [NewsAPI](https://newsapi.org) — real-time news headlines
- [Google Gemini](https://ai.google.dev) — AI summarisation
- [React](https://react.dev) + [TypeScript](https://typescriptlang.org) + [Vite](https://vitejs.dev)
- [Tailwind CSS v4](https://tailwindcss.com) + [Zustand](https://zustand-demo.pmnd.rs)tps://zustand-demo.pmnd.rs)