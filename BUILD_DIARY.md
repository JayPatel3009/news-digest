# Build Diary — AI News Digest

Date: 10 May 2026
Goal: Build a production-quality React app in one session using only
Gemini CLI agents, then present the experience and the working app.

---

## Session log

### Stage 1 — Foundation
- 10:02 — Started Gemini CLI from project root. Agent read GEMINI.md immediately.
- 10:04 — Produced src/domain/index.ts with all core interfaces.
- 10:07 — Verified .env.example had both keys. Stage 1 done.

### Stage 2 — Data layer
- 10:18 — NewsAdapter implemented with correct field mapping and error handling.
- 10:24 — GeminiAdapter implemented; added logic to strip Markdown code fences from AI output.
- 10:31 — Fixed singular/plural bug in relativeTime.ts ("1 hour" vs "1 hours").
- 10:33 — Utility tests passing with full coverage. Stage 2 done.

### Stage 3 — State and hooks
- 10:38 — Zustand store created with Technology and AI active by default.
- 10:48 — useDigest hook implemented with parallel Promise orchestration and deduplication.
- 10:51 — Added safety try/catch to sessionStorage restoration. Stage 3 done.

### Stage 4 — UI components
- 11:09 — Fixed TopicSelector "last active" guard to visually disable buttons.
- 11:26 — Solved dynamic stagger delay issue using inline styles for Tailwind v4 compatibility.
- 11:44 — App.tsx and ErrorBoundary wired everything together. Stage 4 done.

### Stage 5 — QA pass
- 11:56 — Removed all `: any` instances in adapters and hooks; narrowed to `unknown`.
- 12:02 — Added missing JSDoc to exported functions.
- 12:09 — Adapter tests passing for success and error scenarios.
- 12:24 — Manual checklist verified: guards, API errors, and caching all working. Stage 5 done.

### Stage 6 — Demo polish
- 12:35 — Added `isFromCache` flag to `Digest` model to track restored sessions.
- 12:38 — Updated `ArticleCard` to suppress entrance animations for cached content.
- 12:45 — Documented manual E2E test success: NewsAPI CORS works on localhost.
- 12:50 — Final build verified. Stage 6 done.

---

## Moments worth highlighting in the presentation
- **Gemini's JSON Precision:** Reliable adherence to complex schemas once code-fence stripping was added.
- **Tailwind v4 Efficiency:** Zero-config styling allowed faster iteration and cleaner component code.
- **Stagger Animation Logic:** Using `style={{ animationDelay }}` to overcome Tailwind's runtime limitations for dynamic values.

---

## QA findings
- `any` types found and fixed:
    - `src/adapters/NewsAdapter.ts`: Replaced `any` with `NewsApiArticle` interface.
    - `src/adapters/GeminiAdapter.ts`: Typed JSON response to `GeminiResponse`.
    - `src/hooks/useDigest.ts`: Narrowed `catch` block to `unknown`.
- Missing JSDoc added to:
    - `src/App.tsx`: `AppWithErrorBoundary`.
- Test gaps discovered:
    - Added automated coverage for adapter error states and field mapping.
    - Fixed locale-dependent assertion in `relativeTime.test.ts`.
- Manual test results:
    - ✓ Technology + AI active by default.
    - ✓ Guard blocks deselection of last active topic.
    - ✓ Graceful error handling for invalid API keys.
    - ✓ Instant restoration from sessionStorage on refresh.

---

## Final stats
Total build time: ~2 hours 50 minutes
Agent sessions run: 6 (one per stage)
Approximate lines written by me personally: 0
Approximate lines written by agents: ~1,250
Times I had to revert and re-prompt: 4
API calls used from NewsAPI free tier: ~12
Biggest surprise: Parallel Promise orchestration in `useDigest` worked first try.
Biggest lesson: AI-generated JSON needs robust cleanup (stripping fences).
One thing to do differently: Introduce the QA checklist earlier in the component build phase.
