# React Stencilize Example

This directory contains a "complete fallback" sample that uses the same component for both normal rendering and its skeleton state, powered by `withStencil` and `tailwindcss-skeleton-screen`.

- withStencil: Wraps an existing component via HOC to safely render a skeleton even with missing/unknown props.
- tailwindcss-skeleton-screen: Applies the visual skeleton (outline/placeholders) using Tailwind utilities.
- Combined with React Suspense, the skeleton is used as a like-for-like fallback during data loading.

## Setup & Run

Install dependencies at the repository root:

```
npm i
```

Start dev server:

```
npm run -w @react-stencilize/example dev
```

Build / Preview:

```
npm run -w @react-stencilize/example build
npm run -w @react-stencilize/example preview
```

Type check:

```
npm run -w @react-stencilize/example typecheck
```

## Format / Lint (Biome)

Use Biome for formatting and linting.

```
npm run -w @react-stencilize/example biome:check
npm run -w @react-stencilize/example biome:fix
npm run -w @react-stencilize/example format
```
