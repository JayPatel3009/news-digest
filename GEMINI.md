# Project: AI News Digest

## What we're building
A React app where users pick topics they care about, the app fetches live
headlines from NewsAPI, and Gemini summarises + ranks them into a clean
personalised daily briefing. Single-page, no backend, no database.

## Tech stack
- React 18 + TypeScript + Vite
- Tailwind CSS v4 (@tailwindcss/vite plugin — no tailwind.config.ts needed,
  no @tailwind directives, CSS uses @import "tailwindcss" only)
- Zustand (state)
- @google/generative-ai (Gemini SDK, browser-compatible)
- NewsAPI (free tier — 100 req/day, localhost works in dev)
- Vitest + React Testing Library

## Domain model (source of truth — read before writing anything)
Topic = {
  id: string
  label: string
  query: string
  isActive: boolean
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
  relevanceScore: number  // 1-10, assigned by Gemini
  aiReason: string        // one sentence explaining why it matters
}

Digest = {
  id: string
  createdAt: string
  topicIds: string[]
  executiveSummary: string
  items: DigestItem[]
  status: 'idle' | 'fetching' | 'summarising' | 'ready' | 'error'
}

## Architecture
src/
  domain/              ← types only, no logic (index.ts)
  adapters/
    NewsAdapter.ts     ← fetches articles from NewsAPI, maps to Article[]
    GeminiAdapter.ts   ← takes Article[], returns summary + DigestItem[]
  hooks/
    useTopics.ts       ← manages topic selection state
    useDigest.ts       ← orchestrates fetch → summarise flow
  store/
    digestStore.ts     ← Zustand: topics, digest, status, error
  components/
    TopicSelector/     ← chip multi-select UI
    DigestHeader/      ← date, active topic pills, refresh button
    ExecutiveSummary/  ← highlighted AI summary block
    ArticleCard/       ← title, source, time, AI reason, score bar
    ScoreBar/          ← reusable animated score bar
    StatusBanner/      ← "Fetching headlines..." → "Generating digest..."
  utils/
    hashUrl.ts         ← generates stable Article id from url
    relativeTime.ts    ← "2 hours ago" formatting

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
- API keys from import.meta.env (VITE_NEWS_API_KEY, VITE_GEMINI_API_KEY)
- JSDoc on every exported function
- Errors are typed — never throw raw strings

## MVP scope (do not exceed this in one session)
- 6 default topics: Technology, AI, Climate, Business, Science, Design
- Multi-select topic chips, minimum 1 required
- Fetch top 5 articles per active topic (max 30 total)
- Deduplicate articles by URL before sending to Gemini
- Generate digest via Gemini
- Display executive summary + ranked article list with AI reasons
- Loading states: "Fetching headlines..." then "Generating your digest..."
- Error states: NewsAPI failure, Gemini failure, no results
- Skeleton loaders during generation
- Refresh digest button
- Cache last digest in sessionStorage (survives page refresh)

## Out of scope for MVP
- Saving or sharing digests
- User accounts
- Push notifications
- Dark mode
- Deployed hosting (demo runs on localhost)

## Presentation context
This app is a live demo for a talk on vibe coding with AI agents.
Keep code readable and well-commented — the audience will see it on screen.
Prefer clarity over cleverness. No clever abstractions that need explaining.