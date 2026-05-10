# Architecture Decision Records

## ADR-001: No backend for MVP
Decision: React-only, all API calls from browser
Reason: Zero infrastructure, one command to run, nothing to break on stage
Revisit: If NewsAPI blocks browser requests on deployed domain
Note: localhost is explicitly allowed on NewsAPI free tier

## ADR-002: Gemini API direct from browser
Decision: Use @google/generative-ai SDK directly in the browser
Reason: Simplest path, no proxy needed for demo
Important: VITE_GEMINI_API_KEY will be visible in the bundle.
Acceptable for a demo. Mention this in the talk as a production caveat.

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

## ADR-007: Tailwind CSS v4 via @tailwindcss/vite
Decision: Use Tailwind v4 with the Vite plugin instead of v3
Reason: npx tailwindcss init -p fails in v4 — no config file needed.
The plugin is added to vite.config.ts and CSS uses @import "tailwindcss".
No tailwind.config.ts, no postcss.config.js, no @tailwind directives.