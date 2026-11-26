# Architecture Decision Records

## ADR-001: No backend for MVP
Decision: React-only, all API calls from browser
Reason: Zero infrastructure, one command to run, nothing to break on stage
Revisit: If NewsAPI blocks browser requests on deployed domain
Note: localhost is explicitly allowed on NewsAPI free tier
Superseded by ADR-008. API calls now go through the Vite server middleware.

## ADR-002: Gemini API direct from browser
Decision: Use @google/generative-ai SDK directly in the browser
Reason: Simplest path, no proxy needed for demo
Important: VITE_GEMINI_API_KEY will be visible in the bundle.
Acceptable for a demo. Mention this in the talk as a production caveat.
Superseded by ADR-008. Gemini is called from the server plugin, not the browser.

## ADR-003: sessionStorage for digest cache
Decision: Persist last digest in sessionStorage key 'last_digest'
Reason: Page refresh on stage won't re-trigger API calls or lose result
Clears when tab closes — intentional for demo freshness

## ADR-004: Deduplicate articles by URL before Gemini
Decision: Filter duplicate URLs after merging all topic fetches
Reason: Multiple topics return the same article; duplicates waste tokens

## ADR-005: Zustand over Context + useReducer
Decision: Zustand for all global state
Reason: Less boilerplate, easier to read on a presentation screen

## ADR-006: NewsAPI CORS on free tier
Decision: Demo runs on localhost only, not deployed
Reason: NewsAPI free tier allows localhost browser requests but blocks
deployed domains without a CORS proxy
Superseded by ADR-008 and ADR-010. The browser no longer calls NewsAPI, and the news provider is Currents.

## ADR-007: Tailwind CSS v4 via @tailwindcss/vite
Decision: Use Tailwind v4 with the Vite plugin instead of v3
Reason: npx tailwindcss init -p fails in v4 — no config file needed.
The plugin is added to vite.config.ts and CSS uses @import "tailwindcss".
No tailwind.config.ts, no postcss.config.js, no @tailwind directives.

## ADR-008: Server-Side API Middleware for Secret Isolation
Decision: Isolate news and Gemini API keys behind a Vite server middleware plugin (`vite-api-plugin.ts`).
Reason: Keeps API keys out of client-side browser bundles, eliminates CORS restrictions from the news provider, reduces client bundle size by ~19kB, and maintains single-command (`npm run dev`) developer experience.
Note: The original provider was NewsAPI. ADR-010 replaces it with Currents.

## ADR-009: URL Protocol Sanitization & Structured Outputs
Decision: Enforce `sanitizeUrl` on external news URLs and Gemini `responseSchema` with input bounding.
Reason: Eliminates XSS vectors from untrusted article links and protects against indirect prompt injection.

## ADR-010: Currents instead of NewsAPI
Decision: Fetch headlines from the Currents Search API inside `vite-api-plugin.ts`, and map the response to the existing articles payload before it reaches NewsAdapter.
Reason: NewsAPI's free tier cannot be used in a production app. Currents' free tier allows production use (250 requests/day, real time) and still supports keyword search per topic. Display order stays relevance-score descending after Gemini scoring. The Currents query is limited to the last 7 days so the candidate pool stays recent.
Note: Currents' terms allow a title, a short description, and a link to the publisher, with attribution. Customer-facing AI summaries are not included by default and may need separate permission.