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
- [timestamp] —

### Stage 3 — State and hooks
- [timestamp] —

### Stage 4 — UI components
- [timestamp] —

### Stage 5 — QA pass
- [timestamp] —

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

(Fill this in during Stage 5 — the QA Agent will add to it too)

- `any` types found and fixed:
- Missing JSDoc added to:
- Test gaps discovered:
- Manual test results:

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