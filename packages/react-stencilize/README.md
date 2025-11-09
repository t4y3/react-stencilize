# react-stencilize

A tiny React helper that generates skeleton placeholders from your real components — without branching your render logic. It wraps a component with safe placeholder props and sanitizes its output to keep only outline‑friendly markup for use in Suspense fallbacks and loading states.

## Features

- Zero‑branch skeletons via `withStencil(Component)`
- Safe deep Proxy props that never throw on access or calls
- Works with function components, `memo`, and `forwardRef` shapes
- Sanitizes output to suppress text/content and keep simple host markup
- TypeScript ready with proper generics and `displayName`

## Install

```bash
npm i react-stencilize
```

Peer deps: `react` and `react-dom` (>=18 or ^19).

## Quick Start

```tsx
import React, { Suspense } from 'react';
import { withStencil } from 'react-stencilize';

// Your real component
function UserCard(props: { user: { name: string; bio?: string } }) {
  return (
    <section className="card">
      <h2>{props.user.name}</h2>
      <p>{props.user.bio}</p>
    </section>
  );
}

// Generate a skeleton from the real component
const UserCardSkeleton = withStencil(UserCard);

export function View() {
  return (
    <Suspense fallback={<UserCardSkeleton />}> 
      <UserCard /* ...real props when ready... */ />
    </Suspense>
  );
}
```

The skeleton renders immediately with safe placeholder props and a sanitized DOM outline, making it ideal for use as a `Suspense` fallback or interim loading state.

## How It Works

`withStencil` produces a component that:

1. Creates a deeply safe placeholder props object via a `Proxy`:
   - Any property access returns another safe value
   - Function calls are safe and chainable
   - Special cases avoid Promise/Thenable and React pitfalls (e.g. `then`, `key`, `ref`)
2. Tries to render your component with those props and sanitizes the result:
   - Text and numbers collapse to an empty string
   - Arrays are sanitized recursively
   - Host elements (e.g. `div`, `span`, `Fragment`) keep only primitive attributes and get sanitized children
   - Non‑renderable values collapse to an empty string
3. If direct invocation is unsuitable (e.g. hook usage), it falls back to creating an element instance with the safe props; React will render it normally, but the placeholder props usually suppress most content and side effects.

This approach reuses your real component structure so the skeleton naturally mirrors the final layout, while minimizing content noise.

## API

```ts
function withStencil<P extends object>(Component: React.ComponentType<P>): React.FC;
```

- Returns a React component you can use as a skeleton placeholder.
- The returned component has a helpful `displayName` like `Skeleton(ComponentName)`.
- No props are required; it internally supplies safe placeholder props.

## Behavior Details

- Placeholder props are safe to read, iterate, or call; they never throw.
- `then` is undefined to avoid being treated as a Promise/Thenable.
- For host elements, only primitive attributes (string/number/boolean) are preserved; complex values are coerced to an empty string.
- Children are sanitized recursively so deeply nested text is suppressed.

## Styling Skeletons

- Add CSS classes in your real components (e.g., `.card`, `.title`, `.avatar`) and target them with skeleton styles when used inside the stencil. Because structure is preserved, your layout skeleton stays aligned.
- Common patterns include using background shimmer, neutral blocks, or aspect‑ratio placeholders for media.

## TypeScript

- Generics infer from your component: `withStencil<typeof Component>` is usually not needed.
- Works with `memo`/`forwardRef`; callable extraction is supported where possible for better sanitization.

## Limitations

- Components that render hardcoded strings/icons will show them in the skeleton. Prefer conditional rendering bound to real data or hide such content with CSS in loading states.
- When hooks are used, the library renders through React with safe props instead of direct invocation; most content will still collapse via placeholder props, but sanitization cannot intercept the final VDOM after React renders.

## Example: Next.js/React 18 Suspense

```tsx
const Article = React.lazy(() => import('./Article'));
const ArticleSkeleton = withStencil(Article);

export default function Page() {
  return (
    <React.Suspense fallback={<ArticleSkeleton />}> 
      <Article />
    </React.Suspense>
  );
}
```

