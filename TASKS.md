# Build Session — AI News Digest

## Stage 1 — Foundation (Architect Agent)
- [x] ARCH-01: src/domain/index.ts — Topic, Article, DigestItem, Digest
               with JSDoc on every interface and field
- [x] ARCH-02: .env.example — VITE_NEWS_API_KEY, VITE_GEMINI_API_KEY
- [x] ARCH-03: Verify vite.config.ts has @tailwindcss/vite plugin and
               Vitest config. No tailwind.config.ts needed.

## Stage 2 — Data layer (Data Layer Agent)
- [x] BE-01: src/utils/hashUrl.ts — pure function, stable id from url
- [x] BE-02: src/utils/relativeTime.ts — pure function, "2 hours ago" format
- [x] BE-03: src/adapters/NewsAdapter.ts
             fetchArticles(topic: Topic): Promise<Article[]>
             URL: newsapi.org/v2/everything?q={query}&pageSize=5&apiKey={key}
             Handle: 429 rate limit, network error, empty results
- [x] BE-04: src/adapters/GeminiAdapter.ts
             summarise(articles: Article[], topicLabels: string[]): Promise<DigestSummary>
             Strip ```json fences before parsing
             Validate response shape before returning

## Stage 3 — State and hooks (Frontend Agent)
- [x] FE-01: src/store/digestStore.ts — Zustand slice
             State: topics, digest, status, error
             Actions: setTopics, setDigest, setStatus, setError, reset
             Init: Technology and AI active by default
- [x] FE-02: src/hooks/useTopics.ts
             toggleTopic(id) — guard against deselecting last active topic
- [x] FE-03: src/hooks/useDigest.ts
             Flow: NewsAdapter → dedupe by url → GeminiAdapter
             Exposes: { digest, status, error, generate, reset }
             Persists result to sessionStorage under key 'last_digest'

## Stage 4 — UI components (Frontend Agent)
- [x] FE-04: ScoreBar — animated width on mount, amber ≤6, green ≥7
- [x] FE-05: StatusBanner + test — message per Digest status
- [x] FE-06: TopicSelector + test — chips, active styling, disabled last
- [x] FE-07: ExecutiveSummary + test — amber blockquote, skeleton state
- [x] FE-08: ArticleCard + test — link title, source, time, reason, ScoreBar
- [x] FE-09: DigestHeader + test — date, topic pills, Refresh button
- [x] FE-10: App.tsx + ErrorBoundary — layout, empty state, wires all together

## Stage 5 — QA pass (QA Agent)
- [x] QA-01: grep -r ": any" src/ — fix every hit
- [x] QA-02: JSDoc audit — add any missing on exported functions
- [x] QA-03: NewsAdapter tests — 200, 429, empty array cases
- [x] QA-04: GeminiAdapter tests — valid JSON, fenced JSON, malformed JSON
- [x] QA-05: Manual checklist — valid topics, last topic guard,
             wrong API key, sessionStorage cache
- [x] QA-06: Write QA section in BUILD_DIARY.md

## Stage 6 — Demo polish (Frontend Agent)
- [x] DEMO-01: Verify Technology + AI active on first load
- [x] DEMO-02: Stagger animation on ArticleCard entrance (75ms delay per card)
- [x] DEMO-03: Verify NewsAPI CORS on localhost in browser Network tab
- [x] DEMO-04: End-to-end test with real keys — generate real digest,
               refresh page, confirm sessionStorage restores it