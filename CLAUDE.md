# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Install dependencies
```bash
npm install --legacy-peer-deps
```
The `--legacy-peer-deps` flag is required due to Expo + React Native peer dependency conflicts.

### Development
```bash
npm run dev          # Start both web (Expo) and API (Fastify) concurrently
npm run dev:web      # Expo web only — runs on http://localhost:19006
npm run dev:api      # Fastify API only — runs on http://localhost:4000
```

### Build
```bash
npm run build        # Build both apps
npm run build:web    # Expo web bundle
npm run build:api    # Compile TypeScript → dist/
```

### Test & lint
```bash
npm run test         # Run Jest in both apps
npm run test:web     # Web tests only
npm run test:api     # API tests only
npm run lint         # ESLint both apps
npm run format       # Prettier both apps
```

API dev server uses `tsx watch` for hot reload (no compile step needed in development).

## Environment Setup

Copy `.env.example` → `.env.local` in the **repo root**. The API loads env from `../../.env.local` relative to `apps/api/src/main.ts`.

Key env vars:
- `ANTHROPIC_API_KEY` — Claude API (required for AI analysis)
- `EBAY_SANDBOX_CLIENT_ID` / `EBAY_SANDBOX_CLIENT_SECRET` — eBay sandbox credentials
- `API_PORT` — defaults to `4000`
- `EXPO_PUBLIC_API_URL` — consumed by Expo web (must be prefixed `EXPO_PUBLIC_`)

## Architecture

This is an **npm workspaces monorepo** with two apps:

```
apps/web/   — Expo (React Native Web), TypeScript, Metro bundler
apps/api/   — Fastify, TypeScript, compiled with tsc / run with tsx
```

### Request flow

```
Browser (Expo Web)
  → POST /api/analyze  (base64 or URL photo array)
  → apps/api/src/main.ts  (Fastify router)
  → apps/api/src/services/ai.ts  (Claude Vision → ClothingAnalysisResult)
  → apps/api/src/services/ebay.ts  (OAuth + publish)
```

### Key types

`ClothingAnalysisResult` (defined in `apps/api/src/services/ai.ts`) is the central data contract between the AI pipeline and the eBay listing builder. Fields: `itemType`, `brand`, `size`, `color[]`, `pattern`, `material`, `condition`, `conditionGrade` (NWT/NWOT/EUC/GUC/Fair), `conditionNotes`, `style`, `gender`, `keywords[]`.

### Frontend screen flow

`App.tsx` manages a three-state machine (`upload → review → publish`) using local `useState`. Only `PhotoUploadScreen` is implemented; `review` and `publish` screens are placeholders. Screen transitions are passed as `onNext` callbacks.

### AI model selection

Default: **Haiku 4.5** (~$0.02–0.03/listing). Premium: **Sonnet 4.6** (~$0.07–0.08/listing). Use prompt caching on the system prompt to reduce input costs ~90%. The Anthropic SDK client is initialized in `apps/api/src/services/ai.ts`.

### What is not yet implemented (Phase 1 in progress)

- Claude Vision multi-image analysis (stub returns placeholder values)
- eBay OAuth exchange and token storage
- `review` and `publish` screens in the web app
- Database (PostgreSQL/Supabase) and cache (Redis/Upstash) — not yet wired
- eBay Taxonomy API, Browse API (pricing), Media API

### CORS

API allows `http://localhost:19006` (Expo web default) in development. Override with `CORS_ORIGIN` env var.

## Workflow

- Use the `gh` CLI for all GitHub operations (issues, PRs, checks). Do not use the GitHub REST API directly.
- Prefer atomic commits — one logical change per commit, with a clear commit message describing the why.
- PRs are not required during initial iteration; commit directly to `main` until the project stabilizes.
- Always ask before pushing. Never push without explicit confirmation.
- After every push, run `npm run test && npm run build` and confirm both pass before reporting the work as done.

## Testing

Jest is installed in both packages but no config file exists yet — tests run with Jest defaults.

### Running tests

```bash
npm run test                   # All tests across both apps
npm run test:api               # API tests only
npm run test:web               # Web tests only

# Run a single file (from repo root)
npm run test -w apps/api -- --testPathPattern=ai
npm run test -w apps/web -- --testPathPattern=PhotoUpload
```

### Test file location

Co-locate test files next to the source file they test:

```
apps/api/src/services/ai.ts
apps/api/src/services/ai.test.ts
```

### What to test

- **`apps/api/src/services/`** — unit test each service function. Mock the Anthropic SDK client and eBay HTTP calls; do not make real network requests in tests.
- **`apps/web/src/screens/`** — test user interactions (photo selection enabling the Continue button, etc.) using React Native Testing Library once it is added.
- Do not test Fastify route wiring or Expo internals — test the service/screen logic directly.

## Coding Standards

### TypeScript

- `strict: true` is enforced in all packages — no implicit `any`, no implicit returns.
- Use `interface` for object shapes and component props; use `type` for unions and primitives (e.g., `conditionGrade: 'NWT' | 'NWOT' | 'EUC' | 'GUC' | 'Fair'`).
- Exported functions must have explicit return types. Internal/inline callbacks may infer.
- Never use `any`. Use `unknown` when the type is genuinely unknown, then narrow it.

### Naming

| Thing | Convention | Example |
|---|---|---|
| React component files | PascalCase | `PhotoUploadScreen.tsx` |
| Service / utility files | camelCase | `ai.ts`, `ebay.ts` |
| Components & interfaces | PascalCase | `PhotoUploadScreen`, `ClothingAnalysisResult` |
| Prop interfaces | `{ComponentName}Props` | `PhotoUploadScreenProps` |
| Functions & variables | camelCase | `analyzeClothingPhotos`, `photoUrls` |
| Env vars | SCREAMING_SNAKE_CASE | `ANTHROPIC_API_KEY` |

### Code style

Prettier enforces: single quotes, semicolons, trailing commas (ES5), print width 100, 2-space indent. Run `npm run format` before committing.

Import order (enforced manually, no plugin yet):
1. React / React Native core
2. Expo packages
3. Third-party libraries
4. Local imports (`./`, `../`)

Prefer named exports everywhere except the top-level `App.tsx` (default export required by Expo entry point).

### React / component patterns

- All components are function components typed with `React.FC<Props>`.
- All styles live in a `StyleSheet.create({})` call at the bottom of the file — no inline style objects.
- **Screens** (`src/screens/`) own state and side effects. **Components** (`src/components/`) are presentational and receive data + callbacks as props.
- Screen-to-screen navigation is callback-based (`onNext`, `onBack`) — `App.tsx` holds the current screen state. Do not introduce a router until the navigation complexity requires it.
- Keep API calls in the screen, not in sub-components. Pass results down as props.
