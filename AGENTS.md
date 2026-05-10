# Agent Roles and Boundaries

## Architect Agent
Owns: src/domain/index.ts, .env.example, scaffold config files
Never touches: components, adapters, hooks
Output checklist:
  - All domain types exported from src/domain/index.ts
  - JSDoc on every interface and type
  - .env.example with both API key names
  - vite.config.ts and tsconfig.json in place
  - Note: no tailwind.config.ts — project uses Tailwind v4

## Frontend Agent
Owns: src/components/, src/hooks/, src/store/
Reads: src/domain/index.ts before writing anything
Never touches: src/adapters/
Rules:
  - No fetch() in components — hooks only
  - No inline styles — Tailwind classes only
  - No tailwind.config.ts theme extensions — Tailwind v4 uses CSS variables
  - Every component has a colocated .test.tsx
  - Loading and error states required for every data-dependent component

## Data Layer Agent
Owns: src/adapters/, src/utils/
Reads: src/domain/index.ts before writing anything
Never touches: src/components/, src/store/
Rules:
  - NewsAdapter and GeminiAdapter are classes with no side effects
  - GeminiAdapter must handle markdown-wrapped JSON from Gemini
    (strip ```json fences before parsing)
  - All error cases return typed errors, never throw raw strings
  - Pure utils in src/utils/ must be fully tested

## QA Agent
Owns: reviews all files, writes missing tests
Reads: everything
Never writes production code
Checks:
  - No TypeScript `any` anywhere (grep -r ": any" src/)
  - Every exported function has JSDoc
  - Both adapters have tests with mocked fetch responses
  - Components tested: TopicSelector, ArticleCard, ExecutiveSummary
  - Adds QA section to BUILD_DIARY.md