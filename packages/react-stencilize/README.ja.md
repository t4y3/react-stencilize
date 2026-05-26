# react-stencilize

実際のコンポーネントからスケルトンプレースホルダーを自動生成する軽量 React HOC。レンダーロジックの分岐は不要です。

`withStencil(Component)` はコンポーネントに安全なプレースホルダー props を渡し、出力をサニタイズしてスケルトン向けの構造マークアップのみを残します。`Suspense` の fallback やローディング状態に最適です。

## 特徴

- **ゼロブランチ スケルトン** — `withStencil(YourComponent)` で実際のレイアウトを反映したスケルトンを生成
- **安全な深層 Proxy props** — 任意のプロパティアクセス・関数呼び出し・イテレーションが例外をスローしない
- **幅広い互換性** — 関数コンポーネント、`React.memo`、`React.forwardRef` に対応
- **CSS ライブラリ非依存** — clsx、cva、tailwind-merge、tailwind-variants など任意の className ユーティリティと共存
- **サニタイズ済み出力** — テキストコンテンツを除去し、構造マークアップのみを保持
- **TypeScript** — ジェネリクス完全対応、型の自動推論

## インストール

```bash
npm i react-stencilize
```

ピア依存: `react` および `react-dom` (>=18 or ^19)

## クイックスタート

```tsx
import { Suspense, use } from 'react';
import { withStencil } from 'react-stencilize';

type User = { name: string; bio: string };

// 1. プレゼンテーショナルコンポーネント（フックなし）
function UserCardView(props: { user: User }) {
  return (
    <section className="card">
      <h2 className="ss-text-[8]">{props.user.name}</h2>
      <p className="ss-text-[20/14]">{props.user.bio}</p>
    </section>
  );
}

// 2. プレゼンテーショナルコンポーネントからスケルトンを生成
const UserCardSkeleton = withStencil(UserCardView);

// 3. データコンポーネントで React.use() により Promise を解決
function UserCard(props: { user: Promise<User> }) {
  const user = use(props.user);
  return <UserCardView user={user} />;
}

// 4. Suspense の fallback として使用
export function Page() {
  const userPromise = fetch('/api/user').then((r) => r.json());
  return (
    <Suspense fallback={<UserCardSkeleton />}>
      <UserCard user={userPromise} />
    </Suspense>
  );
}
```

スケルトンはテキストノードが空の状態で即座にレンダリングされます。`ss-text-*` クラス（[tailwindcss-skeleton-screen](https://github.com/t4y3/tailwindcss-skeleton-screen) 提供）がこれらの `:empty` 要素をグレーのプレースホルダーブロックとしてスタイリングします。

## API

```ts
function withStencil<P extends object>(
  Component: React.ComponentType<P>
): React.FC;
```

| パラメータ | 型 | 説明 |
|-----------|------|-------------|
| `Component` | `React.ComponentType<P>` | スケルトン生成元のプレゼンテーショナルコンポーネント |
| **戻り値** | `React.FC` | スケルトンをレンダリングする props 不要のコンポーネント |

返されるコンポーネントの特性:
- **props 不要** — 安全なプレースホルダー props が内部で自動供給される
- `displayName` が `Skeleton(ComponentName)` に設定される（DevTools 向け）
- `<Suspense fallback>`、条件分岐レンダリングなど、どこでもレンダリング可能

## 仕組み

`withStencil` は3つのフェーズで動作します。

### フェーズ 1: Safe Proxy Props

深くネストされた `Proxy` オブジェクトを生成し、コンポーネントに props として渡します。この Proxy は**あらゆる操作が安全で、例外をスローしない**ように設計されています。

| 操作 | 挙動 |
|------|------|
| プロパティアクセス (`props.user.name`) | 別の安全な Proxy を返す |
| 関数呼び出し (`props.getData()`) | 別の安全な Proxy を返す |
| 深いチェーン (`props.a.b.c().d`) | 常に安全、Proxy を返す |
| 文字列変換 (`String(props.x)`) | `""` を返す |
| `Symbol.toPrimitive` / `valueOf` | `""` を返す |
| `Symbol.iterator` | 空のイテレータを返す |
| `then` | `undefined` を返す（Promise 判定を回避） |
| `ref` / `key` | `undefined` を返す（React のピットフォールを回避） |
| `style` | `{}` を返す（空オブジェクト） |
| `length` | `0` を返す |

この設計により、入力値を検査・イテレート・型変換する CSS ユーティリティライブラリとの互換性が確保されます:

```tsx
// すべて Proxy props で安全に動作:
clsx('base', props.isActive && 'active')
cva('btn', { variants: { size: { sm: '...' } } })({ size: props.size })
tv({ base: '...', variants: { ... } })({ color: props.color })
twMerge('px-2', props.className)
```

### フェーズ 2: コンポーネント実行

`withStencil` は2つのレンダリング戦略を試みます:

1. **直接呼び出し**（優先） — コンポーネント関数を Proxy props で直接呼び出します。出力の完全なサニタイズが可能になります。通常の関数コンポーネント、`React.memo`、`React.forwardRef` で動作します。

2. **Element フォールバック** — 直接呼び出しが失敗した場合（例: コンポーネントが `useState` などのフックを使用）、`React.createElement(Component, safeProps)` にフォールバックします。React が通常通りレンダリングしますが、Proxy props により大半のコンテンツが抑制されます。

```
コンポーネント関数
  ├── フックなし? → 直接呼び出し → 完全サニタイズ ✓
  └── フック使用? → catch → createElement フォールバック → 部分サニタイズ
```

### フェーズ 3: 出力サニタイズ

レンダリング結果を再帰的にサニタイズします:

| ノード型 | 処理 |
|---------|------|
| `string` / `number` | `""`（空文字列）に置換 |
| `null` / `undefined` / `boolean` | `null` に置換 |
| 配列 | 各要素を再帰的にサニタイズ |
| ホスト要素 (`div`, `span`, Fragment) | props をフィルタリング（下表参照）、children を再帰的にサニタイズ |
| ユーザーコンポーネント要素 | そのまま返す（React がレンダリングを制御） |
| その他（object, function, proxy） | `""` に置換 |

**ホスト要素の props フィルタリング:**

| props の型 | 処理 |
|-----------|------|
| `string` | 保持 |
| `number` | 保持 |
| `boolean` | 保持 |
| `style`（オブジェクト） | `string`/`number` 値のみ保持 |
| イベントハンドラ、複雑なオブジェクト | `""` に変換 |
| `children` | 再帰的にサニタイズ |

**変換例:**

```tsx
// 入力（コンポーネントの出力）
<section data-raw={{}} onClick={() => {}}>
  <h1 className="title ss-text-[8]">John Doe</h1>
  <p className="bio ss-text-[20]">Software Engineer</p>
</section>

// 出力（サニタイズ後）
<section data-raw="">
  <h1 className="title ss-text-[8]"></h1>
  <p className="bio ss-text-[20]"></p>
</section>
```

テキストコンテンツが除去され、`className` は保持（CSS ベースのスケルトンスタイリングが可能）、非プリミティブ属性は空文字列に変換されます。

## スケルトンのスタイリング

このライブラリは **CSS を同梱しません**。サニタイズ済みの構造マークアップのみを生成します。スケルトンのスタイルは自前で用意してください。

### 推奨: tailwindcss-skeleton-screen

[tailwindcss-skeleton-screen](https://github.com/t4y3/tailwindcss-skeleton-screen) と組み合わせることで、Tailwind CSS でゼロコンフィグのスケルトンスタイリングが可能です:

```bash
npm i tailwindcss-skeleton-screen
```

```css
/* index.css */
@import "tailwindcss";
@import "tailwindcss-skeleton-screen";
```

#### `ss-text-[n]` — テキストスケルトン

動的テキストをレンダリングする要素に追加します。数値は全角文字数でプレースホルダーの幅を指定します。

```tsx
// 1行、8文字幅
<h2 className="text-lg font-bold ss-text-[8]">{user.name}</h2>

// 複数行: 1行目24文字、2行目16文字
<p className="text-sm ss-text-[24/16]">{user.bio}</p>

// 3行
<p className="ss-text-[30/30/18]">{article.body}</p>
```

仕組み:
- 要素が `:empty` のとき（`withStencil` によりテキストが除去された状態）、`::before` 擬似要素が全角スペース（`U+3000`）をコンテンツとしてレンダリング
- スペースは `font-size` と `line-height` を継承するため、スケルトンブロックが実際のテキスト寸法と一致
- `box-decoration-break: clone` によりコンテンツに `background-color` を適用
- `/` で行を区切り（CSS content 内で `\A` 改行）

#### `ss-object` — ブロックスケルトン

画像やアイコンなど、塗りつぶしプレースホルダーを表示すべき要素に追加します。

```tsx
// 画像プレースホルダー
<img src={user.avatar} className="size-16 rounded-full ss-object" />

// アイコンプレースホルダー
<span className="size-8 rounded-full ss-object">{icon}</span>
```

要素が `:empty` のとき、`background-color: var(--skeleton-color)` が適用されます。

#### スケルトンの外観カスタマイズ

```css
/* @theme でグローバルに上書き */
@theme {
  --skeleton-color: #f3f4f6;
  --skeleton-radius: 0.5rem;
}
```

```tsx
/* Tailwind の任意プロパティで要素ごとに上書き */
<span className="ss-text-[4] [--skeleton-color:transparent]">{tag}</span>
<span className="ss-object [--skeleton-radius:9999px]">{icon}</span>
```

### 手動 CSS（Tailwind なし）

`:empty` 擬似クラスでサニタイズ済み要素を対象にします:

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

## CSS ライブラリ互換性

`withStencil` は実パッケージを使ったテストで、Proxy props が className 生成を壊さないことを検証済みです。

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

const Skeleton = withStencil(AlertBanner); // 動作する — clsx は Proxy を安全に処理
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

const Skeleton = withStencil(Button); // 動作する — cva は未知の値に対しデフォルトにフォールバック
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

const Skeleton = withStencil(ProfileCard); // 動作する — tv のスロットとバリアントを安全に処理
```

### tailwind-merge / cn パターン

```tsx
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

function Box({ className }: { className?: string }) {
  return <div className={cn('bg-red-500 px-2', className)}>hello</div>;
}

const Skeleton = withStencil(Box); // 動作する — Proxy は twMerge 内で空文字列に変換される
```

## 設計パターン: View / Data 分離

`withStencil` は **View / Data コンポーネントパターン** と最も相性が良いです:

```
components/
  User/
    View.tsx      ← プレゼンテーショナル（フックなし、データ取得なし）
    index.tsx     ← データコンポーネント（React.use() やフックを使用）
```

```tsx
// View.tsx — 純粋なプレゼンテーショナルコンポーネント
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

// index.tsx — データコンポーネント
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

**このパターンが有効な理由:**

1. View コンポーネントにフックがないため、`withStencil` が直接呼び出しで完全なサニタイズが可能
2. スケルトンが実コンポーネントの DOM 構造を自動的に反映
3. View に `ss-text-*` / `ss-object` クラスを追加するだけでスケルトンスタイリングが自然に有効化
4. 重複なし — スケルトンは同一のソースコードから生成される

## TypeScript

ジェネリクスは自動推論されるため、明示的な型パラメータは通常不要です:

```tsx
// UserView の props から型が推論される
const Skeleton = withStencil(UserView);

// 明示的なジェネリクス（通常は不要）
const Skeleton = withStencil<{ user: UserData }>(UserView);
```

対応するコンポーネント形式:
- 通常の関数コンポーネント
- `React.memo(Component)`
- `React.forwardRef(Component)`

## 制限事項

### ハードコードされたテキストはスケルトンに表示される

コンポーネント内の静的文字列は**除去されません**:

```tsx
function Card({ user }: { user: User }) {
  return (
    <div>
      <span>Name:</span>           {/* "Name:" はスケルトンに表示される */}
      <span>{user.name}</span>     {/* こちらは空になる ✓ */}
    </div>
  );
}
```

**対策:** View にハードコードラベルを置かないか、スケルトン表示時に CSS で非表示にしてください。

### フック使用コンポーネントはフォールバックレンダリング

コンポーネントがフック（`useState`、`useEffect` など）を使用すると、直接呼び出しが失敗し `React.createElement` にフォールバックします。この経路では:
- Proxy props により大半の動的コンテンツは抑制される
- ただし React がレンダリングした最終 VDOM にはサニタイズが介入できない
- 構造は保持されるが、一部の静的コンテンツが漏れる可能性がある

**推奨:** View コンポーネントにはフックを置かず、データ取得やステートは別のラッパーコンポーネントに配置してください。

### Proxy 値の `typeof` は `"function"` であり `"string"` ではない

コンポーネント内で `typeof props.x === 'string'` をチェックすると、Proxy はこの条件を満たしません:

```tsx
function Component(props: { className?: string }) {
  // Proxy の typeof は "function" であり "string" ではない — このブランチは実行されない
  const cls = typeof props.className === 'string' ? props.className : '';
  return <div className={cls}>hello</div>;
}
```

これは仕様です — Proxy は呼び出し可能である必要があるためです。ほとんどの CSS ライブラリはこれを適切に処理します。

## ライセンス

MIT
