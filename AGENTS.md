# Repository Guidelines

## Project Structure & Module Organization
- Monorepo managed via npm workspaces (`package.json`), with Volta pinning Node 24.11.0 and npm 11.6.2.
- Example app: `apps/example` (Vite + React + Tailwind). Entry and pages live in `src/`; Vite config is `vite.config.ts`; static assets under `public/`.
- Library: `packages/react-stencilize` (React HOC). Source lives at `index.tsx`; unit tests at `index.test.tsx`; build artifacts emitted to `dist/` via `tsconfig.build.json`.
- Repo-level tooling: `biome.json` for lint/format rules; `lefthook` for git hooks (`npx lefthook install` to enable).

## Build, Test, and Development Commands
- Install: `npm install` (root).
- Example app:
  - `npm run -w @react-stencilize/example dev` — Vite dev server.
  - `npm run -w @react-stencilize/example build` — type-check then Vite build (base path set for GitHub Pages).
  - `npm run -w @react-stencilize/example preview` — serve the built app locally.
  - `npm run -w @react-stencilize/example typecheck` / `biome:check` — TS types and lint/format verification.
- Library:
  - `npm run -w react-stencilize build` — emit `dist/`.
  - `npm run -w react-stencilize typecheck` — TS without emit.
  - `npm run -w react-stencilize test` — Vitest suite.
  - `npm run -w react-stencilize biome:check` — lint/format check.

## Coding Style & Naming Conventions
- TypeScript everywhere; prefer explicit exports from entry files.
- Biome enforces formatting (2-space indent, semicolons optional per Biome defaults); run `biome:fix` to auto-fix.
- React components in PascalCase; hooks and utils in camelCase; tests named `*.test.tsx`.
- Keep components pure; avoid runtime branching solely for skeletons (use `withStencil` instead).

## Testing Guidelines
- Library tests use Vitest; place alongside source (`index.test.tsx` pattern).
- Aim to cover prop edge cases and Suspense fallbacks; prefer React Testing Library style assertions if added later.
- Run `npm run -w react-stencilize test` before pushing; add snapshots only when value outweighs maintenance cost.

## Commit & Pull Request Guidelines
- Follow conventional-style prefixes seen in history (`feat:`, `fix:`, `build:`, `ci:`); keep messages in imperative, ~50 chars subject.
- PRs should state scope (app vs library), link issues when applicable, and note user-facing changes; include screenshots for UI tweaks in `apps/example`.
- Ensure `biome:check`, type checks, and tests pass for touched workspaces; note any skipped checks with rationale.

## Security & Configuration Tips
- GitHub Pages expects base `/react-stencilize/`; keep `apps/example/vite.config.ts` `base` aligned with that path.
- Avoid committing `dist/` outside releases; run `npm run -w react-stencilize clean` before rebuilding artifacts intended for publish. 
