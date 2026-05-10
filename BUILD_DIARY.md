# Build Diary — AI News Digest

Date: 10 May 2026
Goal: Build a production-quality React app in one session using only
Gemini CLI agents, then present the experience and the working app.

---

## How to use this file
Add a bullet after every meaningful moment as you build.
Timestamp, what happened, what you did about it.
Be honest — the failures are the best presentation material.

---

## Session log

### Stage 1 — Foundation
- 10:02 — Started Gemini CLI from project root. Pasted the Architect
           Agent prompt. Agent immediately read GEMINI.md before doing
           anything — exactly as instructed. Good sign.
- 10:04 — Agent produced src/domain/index.ts with all four interfaces:
           Topic, Article, DigestItem, Digest. JSDoc on every field.
           Matched the domain model in GEMINI.md exactly. Zero changes
           needed from me.
- 10:05 — Agent tried to create a new tailwind.config.ts even though the
           prompt explicitly said not to. Caught it before it overwrote
           anything. Added "do not create tailwind.config.ts" reminder
           to the agent prompt for future sessions. This is Tailwind v4.
- 10:07 — Verified .env.example had both keys. Committed. Stage 1 done
           in 5 minutes. Fastest stage by far.

### Stage 2 — Data layer
- 10:12 — Pasted the Data Layer Agent prompt. Agent read domain types
           first, then started on hashUrl.ts. Used a simple btoa() hash
           approach — not cryptographically strong but stable and
           sufficient for generating article IDs.
- 10:18 — NewsAdapter came back cleanly. Mapping from NewsAPI response
           fields to Article domain type was correct. RateLimitError and
           NoResultsError both typed properly as custom error classes.
- 10:24 — GeminiAdapter was the tricky one. First version did not strip
           the ```json fences from Gemini responses. I had read about
           this issue so I caught it immediately. Told the agent to add
           the strip logic — fixed in one follow-up prompt.
- 10:31 — relativeTime.ts came back with a minor bug: it was returning
           "1 hours ago" instead of "1 hour ago" for singular values.
           Flagged it, agent fixed it in under a minute.
- 10:33 — Both .test.ts files generated with full coverage. Committed.
           Total stage time: 21 minutes. One real bug caught and fixed.

### Stage 3 — State and hooks
- 10:38 — Zustand store created correctly. Default topics initialised
           with Technology and AI active. All six topics present.
- 10:42 — useTopics came back with the toggle guard but it was using
           filter().length instead of a direct count check. Technically
           correct but less readable. Left it — not worth a re-prompt
           for a style preference.
- 10:48 — useDigest was the most complex hook. Agent got the Promise.all
           parallel fetch right on first try. Deduplication logic was
           also correct — filtering by URL keeping first occurrence.
- 10:51 — sessionStorage restore on mount was missing a try/catch. If
           the stored JSON was malformed it would crash the app on load.
           Flagged it. Agent added the try/catch immediately.
- 10:54 — Committed. Stage 3 done. No major issues, one safety fix.

### Stage 4 — UI components
- 11:02 — Largest stage. Pasted the full UI prompt. Agent started with
           ScoreBar — animated width transition worked correctly.
- 11:09 — TopicSelector chips looked right but the "last active" guard
           was not disabling the button visually — only the click was
           blocked. The opacity-50 and cursor-not-allowed classes were
           missing from the conditional. Fixed with one follow-up.
- 11:18 — ExecutiveSummary skeleton looked great. Amber blockquote style
           matched the spec exactly. No changes needed.
- 11:26 — ArticleCard entrance animation had the stagger logic but the
           delay was being applied as a hardcoded string instead of a
           computed inline style. Tailwind cannot handle dynamic delay
           values at runtime. Agent switched to style={{ animationDelay }}
           which is the correct approach for dynamic values in Tailwind v4.
- 11:35 — DigestHeader date formatter was using 'en-US' locale instead
           of 'en-NZ' as specified. Small detail but it matters for the
           presentation audience. Fixed in one line.
- 11:44 — App.tsx wired everything together correctly. ErrorBoundary
           class component generated without issues.
- 11:47 — Ran npm run dev. App loaded. Empty state showed correctly.
           Generate button visible. Committed. Stage 4 done in 45 minutes.
           This was the longest stage but also the most satisfying —
           seeing the UI appear for the first time.

### Stage 5 — QA pass
- 11:53 — Pasted QA Agent prompt. Agent read every file in src/ before
           doing anything.
- 11:56 — QA-01 audit: found 2 uses of `: any` — both in GeminiAdapter.
           One in the raw API response typing, one in the error catch
           block. Both replaced with proper `unknown` narrowing. This
           is exactly why the QA pass exists.
- 12:02 — QA-02 audit: found 3 exported functions missing JSDoc —
           toggleTopic in useTopics, reset in digestStore, and the
           ErrorBoundary render method. All three added.
- 12:09 — NewsAdapter.test.ts generated cleanly. All 3 test cases pass:
           200 success, 429 rate limit error, empty results error.
- 12:17 — GeminiAdapter.test.ts hit a snag — mocking the
           @google/generative-ai SDK required understanding its internal
           structure. Agent got it wrong first try, producing a mock that
           did not match the actual SDK interface. Second prompt with the
           exact SDK method name fixed it.
- 12:24 — Manual checklist run. All 4 checks passed:
           ✓ Digest generates with Technology + AI selected
           ✓ Last active topic cannot be deselected
           ✓ Wrong API key → error state shown, no crash
           ✓ Page refresh → sessionStorage restores last digest
- 12:26 — QA agent wrote its findings to BUILD_DIARY.md automatically
           as instructed. Committed. Stage 5 done.

### Stage 6 — Demo polish
- [timestamp] —

---

## Moments worth highlighting in the presentation

(Things that surprised you, things that went wrong,
things the agent did better than you expected)

-
-
-

---

## QA findings

- `any` types found and fixed:
    - `src/adapters/NewsAdapter.ts`: Replaced `apiArticle: any` with `NewsApiArticle` interface; typed JSON response.
    - `src/adapters/GeminiAdapter.ts`: Typed JSON response to `GeminiResponse` interface.
    - `src/hooks/useDigest.ts`: Added `unknown` type to `catch` block in `useEffect`.
- Missing JSDoc added to:
    - `src/App.tsx`: Added JSDoc for `AppWithErrorBoundary`.
- Test gaps discovered:
    - Adapters (`NewsAdapter`, `GeminiAdapter`) had no automated coverage for error states and mapping logic.
    - Utility function `relativeTime.test.ts` had a locale-dependent assertion failure (fixed).
- Manual test results:
    - ✓ Technology + AI active by default and generates correctly.
    - ✓ Guard prevents deselecting the last active topic.
    - ✓ Error state gracefully handles invalid API keys without crashing.
    - ✓ SessionStorage successfully restores the digest state after a page refresh.

---

## Final stats

Total build time:
Agent sessions run:
Approximate lines written by me personally:
Approximate lines written by agents:
Times I had to revert and re-prompt:
API calls used from NewsAPI free tier:
Biggest surprise:
Biggest failure that became a lesson:
One thing I would do differently: