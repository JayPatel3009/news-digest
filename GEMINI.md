# Project: AI News Digest

## What we're building
A React app where users pick topics they care about, the app fetches live
headlines from the Currents news API, and Gemini summarises + ranks them into
a clean personalised daily briefing. Single-page, no database. API keys stay
on the Vite server via vite-api-plugin.ts.

## Tech stack
- React 19 + TypeScript + Vite
- Tailwind CSS v4 (@tailwindcss/vite plugin — no tailwind.config.ts needed,
  no @tailwind directives, CSS uses @import "tailwindcss" only)
- Zustand (state)
- @google/generative-ai (Gemini SDK, model: gemini-2.5-flash-lite, called from the Vite server)
- Currents (free tier — 250 req/day, production use allowed with attribution)
- Vitest + React Testing Library

## Domain model (source of truth — read before writing anything)
Topic = {
  id: string
  label: string
  query: string
  isActive: boolean
  isCustom?: boolean
}

Article = {
  id: string              // stable hash of url
  title: string
  description: string | null
  url: string
  sourceName: string
  publishedAt: string     // ISO string
  topicId: string
}

DigestItem = {
  article: Article
  relevanceScore: number  // 0-100, assigned by Gemini
  aiReason: string        // one sentence explaining why it matters
}

Digest = {
  id: string
  createdAt: string
  topicIds: string[]
  executiveSummary: string
  items: DigestItem[]      // sorted by relevanceScore, highest first
  status: 'idle' | 'fetching' | 'summarising' | 'ready' | 'error'
  isFromCache: boolean
}

## Architecture
src/
  domain/              ← types only, no logic (index.ts)
  adapters/
    NewsAdapter.ts     ← calls GET /api/news, maps response to Article[]
    GeminiAdapter.ts   ← calls POST /api/summarise and /api/deep-dive
  hooks/
    useTopics.ts       ← manages topic selection state, including custom topics
    useDigest.ts       ← orchestrates fetch → summarise flow, sorts by relevance
    useDeepDive.ts     ← on-demand ELI5, counter, and impact answers
    useAudioBriefing.ts ← Web Speech playback of the briefing
  store/
    digestStore.ts     ← Zustand: topics, digest, bookmarks, status, error
  components/
    TopicSelector/     ← chip multi-select UI and custom topics
    DigestHeader/      ← date, topic pills, audio, copy/share, refresh
    ExecutiveSummary/  ← highlighted AI summary block
    ArticleCard/       ← title, source, time, AI reason, bookmark, deep dive
    ScoreBar/          ← reusable animated score bar (0-100)
    StatusBanner/      ← "Fetching headlines..." → "Generating digest..."
  utils/
    hashUrl.ts         ← generates stable Article id from url
    relativeTime.ts    ← "2 hours ago" formatting
    sanitizeUrl.ts     ← allows only http(s) article links
    exportBriefing.ts  ← Markdown copy and share of the digest
    mapCurrentsNews.ts ← maps Currents search results onto the Article shape

vite-api-plugin.ts   ← server routes. Holds CURRENTS_API_KEY and GEMINI_API_KEY.
                       Currents search is limited to the last 7 days, 10 articles
                       per topic. The browser never sees the keys.

## Gemini prompt (use this exact structure in GeminiAdapter)
System: "You are a sharp, concise news editor. You rank articles by importance
and explain why each one matters to a general reader. Never sensationalise.
Always return valid JSON and nothing else."

User: "Given these {count} articles across topics: {topicLabels},
return ONLY valid JSON matching exactly this schema:
{
  executiveSummary: string,
  items: [{
    articleId: string,
    relevanceScore: number,
    aiReason: string
  }]
}
Articles: {JSON}"

## Coding rules
- No TypeScript `any` — use `unknown` and narrow explicitly
- No fetch() in components — adapters and hooks only
- All dates via Intl.DateTimeFormat or relativeTime util
- Tailwind only — no inline styles
- No tailwind.config.ts — Tailwind v4 does not use one
- Every component colocated with its .test.tsx
- API keys from server env in vite-api-plugin.ts (CURRENTS_API_KEY or VITE_CURRENTS_API_KEY, plus GEMINI_API_KEY).
  Old NEWS_API_KEY names are fallbacks only. Do not reference VITE_CURRENTS_API_KEY from client code, and do not call Currents or Gemini from the browser.
- JSDoc on every exported function
- Errors are typed — never throw raw strings
- Always use `import type` for type-only imports — verbatimModuleSyntax is enabled in tsconfig.json
- Always import from '../domain/index' not '../domain' — bare folder imports fail at runtime in this project

## MVP scope (do not exceed this in one session)
- 6 default topics: Technology, AI, Climate, Business, Science, Design
- Multi-select topic chips, minimum 1 required
- Fetch top 10 articles per active topic from the last 7 days
- Deduplicate articles by URL before sending to Gemini
- Generate digest via Gemini
- Display executive summary + ranked article list with AI reasons
- Loading states: "Fetching headlines..." then "Generating your digest..."
- Error states: Currents failure, Gemini failure, no results
- Skeleton loaders during generation
- Refresh digest button
- Cache last digest in sessionStorage (survives page refresh)

## Out of scope for MVP
- User accounts
- Push notifications
- Dark mode
- Static hosting of dist/ alone (npm run dev and npm run preview serve /api)

## Presentation context
This app is a live demo for a talk on vibe coding with AI agents.
Keep code readable and well-commented — the audience will see it on screen.
Prefer clarity over cleverness. No clever abstractions that need explaining.