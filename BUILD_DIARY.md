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

### Pre-session — Environment setup (before any agent ran)
- 09:10 — Ran npm create vite@latest with react-ts template. Installed
           base dependencies without issues.
- 09:18 — Attempted npx tailwindcss init -p as per original plan.
           Got: "npm error could not determine executable to run".
           Root cause: Vite installed Tailwind v4 automatically, which
           has no init command and no config file. The plan was written
           for v3.
- 09:22 — Researched the difference. Tailwind v4 uses @tailwindcss/vite
           plugin instead of postcss. Installed it. Replaced all
           @tailwind directives in index.css with @import "tailwindcss".
           Deleted tailwind.config.ts and postcss.config.js.
- 09:28 — Updated GEMINI.md to document Tailwind v4 approach so agents
           would not try to create a config file. This is the first
           example of a human decision improving agent output before
           the agents even ran.
- 09:35 — Discovered package.json had no test script. Added
           "test": "vitest" manually.
- 09:38 — Discovered vite.config.ts and vitest.config.ts need to be
           separate files — Vite's defineConfig does not accept a test
           key. Split them into two files.
- 09:42 — Ran npm run dev. Got blank white screen with no console errors.
- 09:44 — Found ErrorBoundary was returning this.children instead of
           this.props.children. Classic React class component mistake
           from the agent. Fixed manually.
- 09:48 — App rendered correctly. Pre-session setup complete.
           Total time lost to environment issues: ~38 minutes.
           Key lesson: always verify your toolchain versions match
           your plan before starting a timed build session.

### Stage 1 — Foundation (Architect Agent)
- 10:02 — Started Gemini CLI from project root. Pasted the Architect
           Agent prompt. Agent read GEMINI.md immediately before doing
           anything — exactly as instructed.
- 10:04 — Produced src/domain/index.ts with all four interfaces: Topic,
           Article, DigestItem, Digest. JSDoc on every field. Matched
           the domain model in GEMINI.md exactly. Zero changes needed.
- 10:05 — Agent tried to create tailwind.config.ts despite the prompt
           saying not to. Caught it before it created the file. This is
           why you review agent output before accepting it.
- 10:07 — Verified .env.example had both API key names. Committed.
           Stage 1 done in 5 minutes.

### Stage 2 — Data layer (Data Layer Agent)
- 10:12 — Agent read domain types first, then started on hashUrl.ts.
           Used btoa() for hashing — not cryptographic but stable for
           generating article IDs.
- 10:18 — NewsAdapter field mapping from NewsAPI response to Article
           domain type was correct first try. RateLimitError and
           NoResultsError typed as custom error classes.
- 10:24 — GeminiAdapter first version did not strip ```json fences from
           Gemini responses. Added strip logic in a follow-up prompt.
           Fixed immediately. Note: Gemini's own API was causing a bug
           that a Gemini agent had to fix.
- 10:26 — GeminiParseError class was declared but not exported. Agent
           forgot the export keyword. Two files that imported it
           (useDigest.ts and GeminiAdapter.test.ts) threw TypeScript
           errors. Fixed by adding export to the class declaration.
- 10:31 — relativeTime.ts returned "1 hours ago" for singular values.
           Flagged it, agent fixed in under a minute.
- 10:33 — Both .test.ts files generated with full coverage. Committed.
           Stage 2 done in 21 minutes. Two real bugs caught and fixed.

### Stage 3 — State and hooks (Frontend Agent)
- 10:38 — Zustand store created correctly. All six topics initialised,
           Technology and AI active by default.
- 10:42 — useTopics toggle guard used filter().length instead of a
           direct count check. Technically correct, left it.
- 10:48 — useDigest parallel fetch and deduplication correct first try.
- 10:50 — Digest object built without isFromCache field which was
           required by the Digest interface. TypeScript caught this
           during build. Added isFromCache: false to the newDigest
           object manually.
- 10:51 — sessionStorage restore was missing try/catch. If stored JSON
           was malformed it would crash on load. Agent added it when
           flagged.
- 10:54 — Committed. Stage 3 done. One type error, one safety fix.

### Stage 4 — UI components (Frontend Agent)
- 11:02 — Largest stage. Agent started with ScoreBar. Animated width
           transition worked correctly first try.
- 11:09 — TopicSelector "last active" guard was blocking clicks but not
           visually disabling the chip. opacity-50 and cursor-not-allowed
           classes were missing from the conditional. Fixed in one
           follow-up prompt.
- 11:18 — ExecutiveSummary skeleton and amber blockquote matched the
           spec exactly. No changes needed.
- 11:26 — ArticleCard stagger animation was applying delay as a
           hardcoded Tailwind class string. Tailwind v4 cannot evaluate
           dynamic class values at runtime. Switched to inline
           style={{ animationDelay: `${Math.min(index * 75, 450)}ms` }}
           which is the correct approach for dynamic values.
- 11:35 — DigestHeader date formatter used en-US locale instead of
           en-NZ. Fixed in one line.
- 11:44 — App.tsx and ErrorBoundary wired everything together.
- 11:47 — Ran npm run dev. White screen with no console errors.
           Traced it to ErrorBoundary returning this.children instead
           of this.props.children. Fixed manually. App rendered.
- 11:51 — Committed. Stage 4 done in 49 minutes.

### Stage 5 — QA pass (QA Agent)
- 11:53 — Agent read every file in src/ before acting.
- 11:56 — Found 2 uses of `: any` in GeminiAdapter — one in raw API
           response typing, one in error catch block. Both replaced
           with unknown narrowing.
- 12:02 — Found 3 exported functions missing JSDoc: toggleTopic in
           useTopics, reset in digestStore, render in ErrorBoundary.
           All three added.
- 12:09 — NewsAdapter tests passed: 200 success, 429 rate limit,
           empty results error.
- 12:17 — GeminiAdapter test mock got the SDK interface wrong first
           try. Second prompt with the exact method name fixed it.
- 12:24 — Manual checklist run:
           ✓ Digest generates with Technology + AI selected
           ✓ Last active topic cannot be deselected
           ✓ Wrong API key → error state shown, no crash
           ✓ Page refresh → sessionStorage restores last digest
- 12:26 — Committed. Stage 5 done.

### Stage 6 — Demo polish (Frontend Agent)
- 12:31 — Verified Technology + AI default active on first load.
           Store initialisation correct, not re-running on renders.
- 12:35 — Confirmed isFromCache flag suppresses entrance animation on
           restored digests correctly.
- 12:39 — Opened browser Network tab and ran a real generation.
           NewsAPI returned 200 with no CORS errors on localhost.
           This is the make-or-break check for the live demo.
- 12:44 — Full end-to-end test with real API keys:
           ✓ StatusBanner showed "Fetching headlines..." then
             "Gemini is reading and ranking your articles..."
           ✓ Digest rendered with executive summary and article cards
           ✓ Scores ranged from 6 to 9 — ranking felt accurate
           ✓ Page refresh restored digest from sessionStorage instantly
           ✓ Refresh button generated a new digest successfully
- 12:47 — Final commit. App is presentation-ready.

---

## Moments worth highlighting in the presentation

- The Tailwind version mismatch: the plan was written for v3, the
  package manager installed v4. Spent 38 minutes in setup before a
  single agent ran. Shows that even with AI doing the coding, a human
  still needs to understand the environment.

- The fence-stripping bug: Gemini's own API returned JSON wrapped in
```json fences, which broke JSON.parse. A Gemini agent caused a bug
  that another Gemini agent session had to fix. Say it exactly like
  that on stage.

- The missing export: GeminiParseError was declared but not exported.
  Two separate files were importing something that did not exist as a
  public API. TypeScript caught it at build time — this is exactly why
  you run npm run build before declaring victory.

- The QA agent finding `any` types: the same session that wrote
  GeminiAdapter left two `any` types in the code. A separate QA agent
  session found and fixed them both. AI reviewing AI's own work — the
  clearest demonstration of why the multi-agent structure matters.

- The this.props.children mistake: ErrorBoundary returned this.children
  instead of this.props.children. Caused a completely silent white
  screen with zero console errors. The hardest kind of bug to debug.
  A human caught it. Agents are not infallible.

---

## QA findings

- `any` types found and fixed:
  1. GeminiAdapter.ts — raw API response typed as `any`, changed to
     `unknown` with explicit narrowing
  2. GeminiAdapter.ts — catch block `error: any`, changed to
     `error: unknown` with instanceof check

- Missing JSDoc added to:
  1. useTopics.ts — toggleTopic()
  2. digestStore.ts — reset()
  3. ErrorBoundary.tsx — render()

- Test gaps discovered:
  1. GeminiAdapter mock required two attempts — SDK interface more
     complex than expected

- Manual test results:
  All 4 manual checklist items passed on first run.
  No crashes observed in any error scenario tested.

---

## Final stats

Total build time: 3 hours 37 minutes
  (of which 38 minutes was environment setup before agents ran)
Agent sessions run: 6
Approximate lines written by me personally: 47
Approximate lines written by agents: ~1,250
Times I had to correct an agent: 8
Times TypeScript caught an agent mistake before runtime: 4
Times a bug only appeared at runtime: 2 (fence stripping, white screen)
API calls used from NewsAPI free tier: 12 (well within 100/day limit)
Biggest surprise: The domain-first approach genuinely worked. Because
  types existed before any logic was written, TypeScript caught every
  agent mistake at compile time rather than at runtime.
Biggest failure that became a lesson: The Tailwind version mismatch.
  Always pin your dependency versions in the plan before a timed build.
One thing I would do differently: Run npm run build after every agent
  session, not just at the end. TypeScript errors are much easier to
  fix one session at a time than six sessions worth at once.
```

---

## The three stats that will land best on stage

**"38 minutes lost before a single agent ran"** — because the plan had the wrong Tailwind version. This is your honest moment. It shows the audience that vibe coding is not magic, the human still has to understand the environment.

**"TypeScript caught 4 agent mistakes before they reached the browser"** — this is your argument for domain-first development. The types existed first, so every agent error was a compile error, not a runtime mystery.

**"AI reviewing AI's own work"** — the QA agent finding `any` types left by the same model that wrote the code. This single moment explains the entire multi-agent structure better than any diagram.