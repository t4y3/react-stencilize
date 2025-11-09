# React Stencilize

A tiny HOC for React that renders an outline-only, safe fallback using a deep safe Proxy. Share the same component for both normal rendering and Suspense fallback without adding conditional branches or special props.

## Features

- Share one component for both normal UI and Suspense fallback
- No runtime TypeError when props are missing (deep safe Proxy)
- No `if (skeleton)` or skeleton-only props required
- Works with arbitrary components via a generic HOC

## Install (planned)

```
npm i react-stencilize
```

## Usage

```tsx
import { Suspense } from 'react'
import { withStencil } from 'react-stencilize'

const StencilUser = withStencil(User)

export default function App() {
  return (
    <Suspense fallback={<StencilUser />}>
      <User user={data.user} />
    </Suspense>
  )
}
```

## Monorepo

- Example app: `apps/example` (Vite + React + TS)
- Library: `packages/react-stencilize`

## Scripts (workspace)

Run commands per workspace:

```
# Example app
npm run -w @react-stencilize/example dev
npm run -w @react-stencilize/example build
npm run -w @react-stencilize/example typecheck
npm run -w @react-stencilize/example biome:check

# Library
npm run -w react-stencilize typecheck
npm run -w react-stencilize biome:check
```

## Formatting & Hooks

- Biome is used for formatting and linting
- Lefthook manages git hooks

Enable hooks:

```
npx lefthook install
```

Hooks:

- pre-commit: Biome on staged files per workspace
- pre-push: type checks for example and library, plus tests if present
