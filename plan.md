# Implementation Plan — AI News Digest

This plan tracks all improvements across **Security**, **Code Quality & Architecture**, and **High-Value Features**.

---

## Phase 1: Security Improvements

- [x] **1.1 External Link Sanitization & XSS Defense**
  - [x] Create pure utility `src/utils/sanitizeUrl.ts` with protocol validation (`http:`, `https:` only).
  - [x] Add unit tests in `src/utils/sanitizeUrl.test.ts` for dangerous protocols (`javascript:`, `data:`, `file:`, malformed inputs).
  - [x] Update `ArticleCard.tsx` to sanitize URLs before rendering `<a href>`, falling back to non-clickable headings for unsafe links.

- [x] **1.2 Structured Outputs & Prompt Injection Hardening**
  - [x] Configure Gemini `gemini-2.5-flash-lite` with native `responseSchema` and `responseMimeType: "application/json"`.
  - [x] Bound input text lengths (`title` ≤ 300 chars, `description` ≤ 1000 chars) to prevent context flooding.
  - [x] Add system instructions to ignore prompt injection attempts embedded within third-party news text.
  - [x] Remove all `: any` usages and attach `{ cause: error }` to caught errors in `GeminiAdapter.ts`.

- [x] **1.3 Server-Side API Key Isolation & Dev Proxy**
  - [x] Create Vite server middleware plugin (`vite-api-plugin.ts`) to handle `/api/news` and `/api/summarise`.
  - [x] Move API keys (`NEWS_API_KEY`, `GEMINI_API_KEY`) to the server side; eliminate client-bundle secret leaks.
  - [x] Support backwards compatibility for existing `VITE_` keys in `.env.local`.
  - [x] Add identifying `User-Agent` header (`DailyDigestApp/1.0`) to satisfy NewsAPI server-side requirements.
  - [x] Support local dev TLS bypass (`NODE_TLS_REJECT_UNAUTHORIZED = '0'`) to resolve corporate/Windows root certificate errors (`UNABLE_TO_GET_ISSUER_CERT_LOCALLY`).
  - [x] Update `NewsAdapter.ts` and `GeminiAdapter.ts` to call internal `/api/*` endpoints.
  - [x] Add `--host 127.0.0.1` to `package.json` dev script with explanatory JSON comment to resolve Windows IPv6 (`::1`) localhost conflicts without hardcoding server configuration in `vite.config.ts`.
  - [x] Verify live end-to-end functionality via Chrome DevTools MCP (compilation, rendering, refresh briefing, 0 console errors).

---

## Phase 2: Code Quality, Spec Adherence & Test Coverage

- [x] **2.1 Resolve Remaining ESLint Errors**
  - [x] Fix unused `_` parameter in `src/components/ErrorBoundary.tsx` (`getDerivedStateFromError`).
  - [x] Fix `no-useless-assignment` in `src/components/ScoreBar/ScoreBar.tsx`.
  - [x] Verify `npm run lint` exits with 0 errors and 0 warnings.

- [x] **2.2 Enforce Domain Import Convention**
  - [x] Update all bare folder imports (`'../domain'` or `'../../domain'`) to use `'.../domain/index'` per project rules in `GEMINI.md`:
    - `src/hooks/useDigest.ts`
    - `src/components/ExecutiveSummary/ExecutiveSummary.tsx`
    - `src/components/StatusBanner/StatusBanner.tsx`

- [x] **2.3 Colocate Missing Component Unit Tests**
  - [x] Add `TopicSelector.test.tsx` (chip rendering, toggling active state, disabling last active topic).
  - [x] Add `ArticleCard.test.tsx` (rendering headline, source, relative time, score bar, sanitized links).
  - [x] Add `ExecutiveSummary.test.tsx` (skeleton pulse loading, summary quote display).
  - [x] Add `DigestHeader.test.tsx` (date formatting, active topic tags, refresh button disabled during fetch).

- [x] **2.4 Clean Up Type Checks & Test Suite**
  - [x] Verify no `: any` remains anywhere in `src/` (`grep -r ": any" src/`).
  - [x] Ensure all exported functions maintain JSDoc docstrings.
  - [x] Verify 100% of Vitest test suites pass (`npm test -- --run`).

---

## Phase 3: High-Value Features & User Experience

- [ ] **3.1 Custom Topics & Keyword Subscriptions**
  - [ ] Allow users to type custom keywords/topics (e.g., "Quantum Computing", "Local News") beyond the 10 static topics.
  - [ ] Persist custom topics and active selections in `localStorage`.

- [ ] **3.2 Audio Briefing ("Listen to Daily Brief")**
  - [ ] Add a "Listen to Briefing" audio button in `DigestHeader`.
  - [ ] Use browser's Web Speech API (`window.speechSynthesis`) to read the AI executive summary and top headlines aloud like a 2-minute morning news bulletin.
  - [ ] Provide play / pause / stop controls.

- [ ] **3.3 Interactive AI Deep Dives ("Ask About This Story")**
  - [ ] Add quick AI prompt chips below each article card:
    - 💡 *"Explain like I'm 5"*
    - ⚖️ *"Counter-arguments / other perspectives"*
    - 📈 *"Why this matters for business / tech"*
  - [ ] Expand the card to display the dynamic on-demand AI response from Gemini.

- [ ] **3.4 Bookmarks & Export Options**
  - [ ] "Save for Later" bookmark button on article cards with a "Saved Stories" view.
  - [ ] "Copy Briefing" button (formatted Markdown/plain text ready for Slack, Teams, or email).
  - [ ] Web Share API (`navigator.share`) for mobile/desktop native sharing.

- [ ] **3.5 Topic Balancing & Time Filters**
  - [ ] Add time filter: Past 24 hours (default), Past 3 days, Past week.
  - [ ] Balance article quotas evenly across selected topics so one topic doesn't drown out others.
