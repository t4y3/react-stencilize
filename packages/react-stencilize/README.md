# react-stencilize

A tiny React HOC that generates skeleton placeholders from your real components — without branching your render logic.

`withStencil(Component)` wraps a component with safe placeholder props and sanitizes its output to keep only outline-friendly markup, ideal for `Suspense` fallbacks and loading states.

## Features

- **Zero-branch skeletons** — `withStencil(YourComponent)` produces a skeleton that mirrors the real layout
- **Safe deep Proxy props** — arbitrary property access, function calls, and iteration never throw
- **Broad compatibility** — function components, `React.memo`, `React.forwardRef`
- **CSS library agnostic** — works with clsx, cva, tailwind-merge, tailwind-variants, and any className utility
- **Sanitized output** — text content removed, only structural markup preserved
- **TypeScript** — full generics support with auto-inferred types

## Install

```bash
npm i react-stencilize
```

Peer dependencies: `react` and `react-dom` (>=18 or ^19).

## Quick Start

```tsx
import { Suspense, use } from 'react';
import { withStencil } from 'react-stencilize';

type User = { name: string; bio: string };

// 1. Presentational component (no hooks)
function UserCardView(props: { user: User }) {
  return (
    <section className="card">
      <h2 className="ss-text-[8]">{props.user.name}</h2>
      <p className="ss-text-[20/14]">{props.user.bio}</p>
    </section>
  );
}

// 2. Generate skeleton from the presentational component
const UserCardSkeleton = withStencil(UserCardView);

// 3. Data component resolves the Promise via React.use()
function UserCard(props: { user: Promise<User> }) {
  const user = use(props.user);
  return <UserCardView user={user} />;
}

// 4. Use as Suspense fallback
export function Page() {
  const userPromise = fetch('/api/user').then((r) => r.json());
  return (
    <Suspense fallback={<UserCardSkeleton />}>
      <UserCard user={userPromise} />
    </Suspense>
  );
}
```

The skeleton renders immediately with empty text nodes. The `ss-text-*` classes (from [tailwindcss-skeleton-screen](https://github.com/t4y3/tailwindcss-skeleton-screen)) style these `:empty` elements as gray placeholder blocks.

## API

```ts
function withStencil<P extends object>(
  Component: React.ComponentType<P>
): React.FC;
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `Component` | `React.ComponentType<P>` | The presentational component to generate a skeleton from |
| **Returns** | `React.FC` | A props-less component that renders the skeleton |

The returned component:
- Requires **no props** — safe placeholder props are supplied internally
- Has `displayName` set to `Skeleton(ComponentName)` for DevTools
- Can be rendered anywhere: `<Suspense fallback>`, conditional rendering, etc.

## How It Works

`withStencil` operates in three phases:

### Phase 1: Safe Proxy Props

A deeply nested `Proxy` object is created and passed as props to your component. This proxy is designed so that **any operation on it is safe and never throws**.

| Operation | Behavior |
|-----------|----------|
| Property access (`props.user.name`) | Returns another safe proxy |
| Function call (`props.getData()`) | Returns another safe proxy |
| Deep chaining (`props.a.b.c().d`) | Always safe, returns proxy |
| String coercion (`String(props.x)`) | Returns `""` |
| `Symbol.toPrimitive` / `valueOf` | Returns `""` |
| `Symbol.iterator` | Returns empty iterator |
| `then` | Returns `undefined` (avoids Promise detection) |
| `ref` / `key` | Returns `undefined` (avoids React pitfalls) |
| `style` | Returns `{}` (empty object) |
| `length` | Returns `0` |

This design ensures compatibility with CSS utility libraries that inspect, iterate, or coerce their inputs:

```tsx
// All of these work safely with proxy props:
clsx('base', props.isActive && 'active')
cva('btn', { variants: { size: { sm: '...' } } })({ size: props.size })
tv({ base: '...', variants: { ... } })({ color: props.color })
twMerge('px-2', props.className)
```

### Phase 2: Component Execution

`withStencil` attempts two rendering strategies:

1. **Direct invocation** (preferred) — calls the component function directly with proxy props. This enables full output sanitization. Works for plain function components, `React.memo`, and `React.forwardRef`.

2. **Element fallback** — if direct invocation fails (e.g., the component uses hooks like `useState`), it falls back to `React.createElement(Component, safeProps)`. React renders it normally, but proxy props suppress most content.

```
Component function
  ├── No hooks? → Direct call → Full sanitization ✓
  └── Uses hooks? → catch → createElement fallback → Partial sanitization
```

### Phase 3: Output Sanitization

The rendered output is recursively sanitized:

| Node type | Treatment |
|-----------|-----------|
| `string` / `number` | Replaced with `""` (empty string) |
| `null` / `undefined` / `boolean` | Replaced with `null` |
| Array | Each element sanitized recursively |
| Host element (`div`, `span`, Fragment) | Props filtered (see below), children sanitized recursively |
| User component element | Returned as-is (React controls rendering) |
| Other (object, function, proxy) | Replaced with `""` |

**Prop filtering for host elements:**

| Prop type | Treatment |
|-----------|-----------|
| `string` | Preserved |
| `number` | Preserved |
| `boolean` | Preserved |
| `style` (object) | Only `string`/`number` values kept |
| Event handlers, complex objects | Coerced to `""` |
| `children` | Sanitized recursively |

**Example transformation:**

```tsx
// Input (your component's output)
<section data-raw={{}} onClick={() => {}}>
  <h1 className="title ss-text-[8]">John Doe</h1>
  <p className="bio ss-text-[20]">Software Engineer</p>
</section>

// Output (after sanitization)
<section data-raw="">
  <h1 className="title ss-text-[8]"></h1>
  <p className="bio ss-text-[20]"></p>
</section>
```

Text content is removed, `className` is preserved (enabling CSS-based skeleton styling), and non-primitive attributes are coerced to empty strings.

## Styling Skeletons

This library **ships no CSS**. It only generates sanitized structural markup. You bring your own skeleton styles.

### Recommended: tailwindcss-skeleton-screen

Pair with [tailwindcss-skeleton-screen](https://github.com/t4y3/tailwindcss-skeleton-screen) for a zero-config Tailwind CSS integration:

```bash
npm i tailwindcss-skeleton-screen
```

```css
/* index.css */
@import "tailwindcss";
@import "tailwindcss-skeleton-screen";
```

#### `ss-text-[n]` — Text skeleton

Add to elements that render dynamic text. The number specifies the placeholder width in full-width characters.

```tsx
// Single line, 8 characters wide
<h2 className="text-lg font-bold ss-text-[8]">{user.name}</h2>

// Multi-line: 24 chars on line 1, 16 chars on line 2
<p className="text-sm ss-text-[24/16]">{user.bio}</p>

// Three lines
<p className="ss-text-[30/30/18]">{article.body}</p>
```

How it works:
- When the element is `:empty` (text removed by `withStencil`), a `::before` pseudo-element renders full-width spaces (`U+3000`) as content
- The spaces inherit `font-size` and `line-height`, so the skeleton block matches the real text dimensions
- `background-color` is applied to the content via `box-decoration-break: clone`
- `/` separates lines (`\A` newline in CSS content)

#### `ss-object` — Block skeleton

Add to elements like images or icons that should show a solid placeholder block.

```tsx
// Image placeholder
<img src={user.avatar} className="size-16 rounded-full ss-object" />

// Icon placeholder
<span className="size-8 rounded-full ss-object">{icon}</span>
```

When the element is `:empty`, `background-color: var(--skeleton-color)` is applied.

#### Customizing skeleton appearance

```css
/* Override globally via @theme */
@theme {
  --skeleton-color: #f3f4f6;
  --skeleton-radius: 0.5rem;
}
```

```tsx
/* Override per-element via Tailwind arbitrary properties */
<span className="ss-text-[4] [--skeleton-color:transparent]">{tag}</span>
<span className="ss-object [--skeleton-radius:9999px]">{icon}</span>
```

### Manual CSS (without Tailwind)

Use the `:empty` pseudo-class to target sanitized elements:

```css
.title:empty {
  background-color: #e5e7eb;
  height: 1.25rem;
  border-radius: 0.25rem;
}

.avatar:empty {
  background-color: #e5e7eb;
}
```

## CSS Library Compatibility

`withStencil` is tested with real packages to ensure proxy props don't break className generation:

### clsx

```tsx
import clsx from 'clsx';

function AlertBanner({ alert }: { alert: AlertData }) {
  return (
    <div className={clsx('rounded-lg border p-4', variantStyles[alert.variant])}>
      <h4 className={clsx('font-semibold ss-text-[10]', styles.title)}>
        {alert.title}
      </h4>
    </div>
  );
}

const Skeleton = withStencil(AlertBanner); // Works — clsx handles proxy gracefully
```

### Class Variance Authority (cva)

```tsx
import { cva } from 'class-variance-authority';

const button = cva('btn rounded-md font-medium', {
  variants: {
    intent: { primary: 'bg-blue-600 text-white', danger: 'bg-red-600 text-white' },
    size: { sm: 'px-3 py-1.5 text-sm', md: 'px-4 py-2 text-sm' },
  },
  defaultVariants: { intent: 'primary', size: 'md' },
});

function Button({ button: btn }: { button: ButtonData }) {
  return (
    <button className={button({ intent: btn.intent, size: btn.size })}>
      <span className="ss-text-[6]">{btn.label}</span>
    </button>
  );
}

const Skeleton = withStencil(Button); // Works — cva falls back to defaults for unknown values
```

### tailwind-variants (tv)

```tsx
import { tv } from 'tailwind-variants';

const profileCard = tv({
  slots: {
    base: 'rounded-xl border p-6',
    avatar: 'size-24 rounded-full ss-object',
    name: 'text-lg font-bold ss-text-[10]',
    bio: 'text-sm ss-text-[26/18]',
  },
  variants: {
    variant: {
      default: { base: 'p-6', name: 'text-center' },
      compact: { base: 'flex gap-4 p-4', name: 'text-base' },
    },
  },
});

function ProfileCard({ profile }: { profile: ProfileData }) {
  const styles = profileCard();
  return (
    <div className={styles.base()}>
      <img src={profile.image} className={styles.avatar()} />
      <h3 className={styles.name()}>{profile.name}</h3>
      <p className={styles.bio()}>{profile.bio}</p>
    </div>
  );
}

const Skeleton = withStencil(ProfileCard); // Works — tv slots and variants handled safely
```

### tailwind-merge / cn pattern

```tsx
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

function Box({ className }: { className?: string }) {
  return <div className={cn('bg-red-500 px-2', className)}>hello</div>;
}

const Skeleton = withStencil(Box); // Works — proxy coerces to empty string in twMerge
```

## Design Pattern: View / Data Separation

`withStencil` works best with the **View / Data component pattern**:

```
components/
  User/
    View.tsx      ← Presentational (no hooks, no data fetching)
    index.tsx     ← Data component (uses React.use() or hooks)
```

```tsx
// View.tsx — Pure presentational component
export function UserView({ user }: { user: UserData }) {
  return (
    <div className="flex gap-4">
      <img src={user.avatar} className="size-12 rounded-full ss-object" />
      <div>
        <h3 className="font-bold ss-text-[8]">{user.name}</h3>
        <p className="text-sm text-gray-500 ss-text-[16]">{user.bio}</p>
      </div>
    </div>
  );
}

// index.tsx — Data component
import { use, Suspense } from 'react';
import { withStencil } from 'react-stencilize';
import { UserView } from './View';

const UserSkeleton = withStencil(UserView);

function UserData({ promise }: { promise: Promise<UserData> }) {
  const user = use(promise);
  return <UserView user={user} />;
}

export function User({ promise }: { promise: Promise<UserData> }) {
  return (
    <Suspense fallback={<UserSkeleton />}>
      <UserData promise={promise} />
    </Suspense>
  );
}
```

**Why this pattern?**

1. The View component has no hooks, so `withStencil` can directly invoke it and fully sanitize the output
2. The skeleton automatically mirrors the real component's DOM structure
3. Adding `ss-text-*` / `ss-object` classes to the View naturally enables skeleton styling
4. No duplication — the skeleton is derived from the same source of truth

## TypeScript

Generics are automatically inferred — explicit type parameters are typically unnecessary:

```tsx
// Type is inferred from UserView's props
const Skeleton = withStencil(UserView);

// Explicit generic (rarely needed)
const Skeleton = withStencil<{ user: UserData }>(UserView);
```

Works with:
- Plain function components
- `React.memo(Component)`
- `React.forwardRef(Component)`

## Limitations

### Hardcoded text appears in skeletons

Static strings in your component will **not** be removed:

```tsx
function Card({ user }: { user: User }) {
  return (
    <div>
      <span>Name:</span>           {/* "Name:" will appear in skeleton */}
      <span>{user.name}</span>     {/* This will be empty ✓ */}
    </div>
  );
}
```

**Workaround:** Avoid hardcoded labels in the View, or hide them with CSS in the skeleton context.

### Hook-based components use fallback rendering

When a component uses hooks (`useState`, `useEffect`, etc.), direct invocation throws and the library falls back to `React.createElement`. In this path:
- Proxy props still suppress most dynamic content
- But sanitization cannot intercept the final VDOM after React renders
- Structure is preserved, but some static content may leak through

**Recommendation:** Keep hooks out of View components. Place data fetching and state in a separate wrapper component.

### Proxy values are `typeof "function"`, not `"string"`

If your component checks `typeof props.x === 'string'`, the proxy will fail that check:

```tsx
function Component(props: { className?: string }) {
  // typeof proxy is "function", not "string" — this branch won't execute
  const cls = typeof props.className === 'string' ? props.className : '';
  return <div className={cls}>hello</div>;
}
```

This is by design — the proxy needs to be callable. Most CSS libraries handle this gracefully.

## License

MIT
