import React, {type CSSProperties} from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { withStencil } from './index.js';

describe('withStencil', () => {
  it('sanitizes host markup from memoized components', () => {
    const Profile = React.memo(function Profile(props: {
      user: { name: string; title?: string };
    }) {
      return (
        <section data-raw={{}} onClick={() => {}}>
          <h1 key="name">{props.user.name}</h1>
          <p key="title">{props.user.title}</p>
        </section>
      );
    });

    const Skeleton = withStencil(Profile);
    const html = renderToStaticMarkup(<Skeleton />);

    expect(html).toContain('data-raw=""');
    expect(html).not.toContain('onclick');
    expect(html).toContain('<h1></h1>');
    expect(html).toContain('<p></p>');
    expect(html).not.toMatch(/name|title/);
  });

  it('falls back to element rendering when hooks are used', () => {
    function WithHooks(props: { initial?: number }) {
      const [count] = React.useState(props.initial);
      return (
        <div data-count={count}>
          <span>{count}</span>
        </div>
      );
    }

    const Skeleton = withStencil(WithHooks);
    const html = renderToStaticMarkup(<Skeleton />);

    expect(html).toBe('<div data-count=""><span></span></div>');
  });

  it('creates safe props that tolerate deep access and calls', () => {
    function DeepAccess(props: { user: { address: { city: () => string } } }) {
      const city = props.user.address.city().toString();
      return [
        <div key="city">{city}</div>,
        // @ts-ignore
        <span key="street">{props.user.address.city().street}</span>,
      ];
    }

    const Skeleton = withStencil(DeepAccess);
    const html = renderToStaticMarkup(<Skeleton />);

    expect(html).toBe('<div></div><span></span>');
  });

  it('sets a helpful displayName', () => {
    function Card() {
      return null;
    }

    const Skeleton = withStencil(Card);

    expect(Skeleton.displayName).toBe('Skeleton(Card)');
  });

  it('marks then as undefined so placeholders are not treated as promises', () => {
    function ThenAware(props: { user: unknown }) {
      const then = (props.user as { then?: unknown }).then;
      const safe = then === undefined;
      return <div data-then-safe={safe}>{String(then)}</div>;
    }

    const Skeleton = withStencil(ThenAware);
    const html = renderToStaticMarkup(<Skeleton />);

    expect(html).toBe('<div data-then-safe="true"></div>');
  });

  it('preserves safe style objects on host elements', () => {
    function Styled(props: { children?: React.ReactNode }) {
      return (
        <div className="box" style={{ color: 'red', width: 100 }}>
          {props.children}
        </div>
      );
    }

    const Skeleton = withStencil(Styled);
    const html = renderToStaticMarkup(<Skeleton />);

    expect(html).toContain('class="box"');
    expect(html).toContain('style="color:red;width:100px"');
  });

  it('supports forwardRef components', () => {
    const Forward = React.forwardRef<HTMLDivElement, { label?: string }>(function Forward(
      props,
      ref,
    ) {
      return (
        <div ref={ref} data-label={props.label}>
          <span>{props.label}</span>
        </div>
      );
    });

    const Skeleton = withStencil(Forward);
    const html = renderToStaticMarkup(<Skeleton />);

    expect(html).toBe('<div data-label=""><span></span></div>');
  });

  it('keeps hardcoded style primitives and drops unsafe ones', () => {
    function Styled() {
      return (
        <div
          style={{
            color: 'blue',
            padding: { left: 1 } as unknown as string,
            width: 50,
            '--flag': 'on',
          } as CSSProperties}
        />
      );
    }

    const Skeleton = withStencil(Styled);
    const html = renderToStaticMarkup(<Skeleton />);

    expect(html).toBe('<div style="color:blue;width:50px;--flag:on"></div>');
  });

  it('keeps placeholder style harmless when coming from props', () => {
    function StyledFromProps(props: { style?: React.CSSProperties }) {
      return <div style={props.style}>hello</div>;
    }

    const Skeleton = withStencil(StyledFromProps);
    const html = renderToStaticMarkup(<Skeleton />);

    expect(html).toBe('<div></div>');
  });
});

// ---- 実際の clsx / cva / twMerge / tv パッケージを使用したテスト ----
// @ts-ignore
import { clsx } from 'clsx';
// @ts-ignore
import { cva } from 'class-variance-authority';
// @ts-ignore
import { twMerge } from 'tailwind-merge';
// @ts-ignore
import { tv } from 'tailwind-variants';

describe('withStencil with real clsx', () => {
  it('handles clsx with hardcoded classes only', () => {
    function Component() {
      return <div className={clsx('foo', 'bar')}>hello</div>;
    }

    const Skeleton = withStencil(Component);
    const html = renderToStaticMarkup(<Skeleton />);

    expect(html).toContain('class="foo bar"');
  });

  it('handles clsx with props.className (proxy as argument)', () => {
    function Component(props: { className?: string }) {
      return <div className={clsx(props.className, 'extra')}>hello</div>;
    }

    const Skeleton = withStencil(Component);
    const html = renderToStaticMarkup(<Skeleton />);

    expect(html).toContain('class=');
  });

  it('handles clsx with conditional && using proxy value', () => {
    function Component(props: { isActive: boolean }) {
      return (
        <div className={clsx('base', props.isActive && 'active')}>hello</div>
      );
    }

    const Skeleton = withStencil(Component);
    const html = renderToStaticMarkup(<Skeleton />);

    expect(html).toContain('class=');
  });

  it('handles clsx with object syntax and proxy value', () => {
    function Component(props: { variant: string }) {
      return (
        <div className={clsx({ primary: props.variant === 'primary', base: true })}>
          hello
        </div>
      );
    }

    const Skeleton = withStencil(Component);
    const html = renderToStaticMarkup(<Skeleton />);

    expect(html).toContain('class="base"');
  });

  it('handles clsx where proxy is passed as object argument', () => {
    function Component(props: { classNames: Record<string, boolean> }) {
      return <div className={clsx(props.classNames)}>hello</div>;
    }

    const Skeleton = withStencil(Component);
    expect(() => renderToStaticMarkup(<Skeleton />)).not.toThrow();
  });

  it('handles clsx with template literal containing proxy', () => {
    function Component(props: { size: string }) {
      return (
        <div className={clsx(`text-${props.size}`, 'font-bold')}>hello</div>
      );
    }

    const Skeleton = withStencil(Component);
    const html = renderToStaticMarkup(<Skeleton />);

    expect(html).toContain('class=');
  });

  it('handles clsx with array syntax containing proxy', () => {
    function Component(props: { extra?: string }) {
      return (
        <div className={clsx(['base', props.extra])}>hello</div>
      );
    }

    const Skeleton = withStencil(Component);
    expect(() => renderToStaticMarkup(<Skeleton />)).not.toThrow();
  });

  it('handles clsx receiving proxy directly (typeof function)', () => {
    function Component(props: { className: string }) {
      return <div className={clsx(props.className)}>hello</div>;
    }

    const Skeleton = withStencil(Component);
    const html = renderToStaticMarkup(<Skeleton />);

    // clsx は typeof 'function' を無視する → class="" になるはず
    expect(html).toContain('class=');
  });
});

describe('withStencil with real cva', () => {
  it('handles cva with hardcoded variant values', () => {
    const buttonVariants = cva('btn', {
      variants: {
        variant: {
          primary: 'btn-primary',
          secondary: 'btn-secondary',
        },
      },
    });

    function Button() {
      return <button className={buttonVariants({ variant: 'primary' })}>click</button>;
    }

    const Skeleton = withStencil(Button);
    const html = renderToStaticMarkup(<Skeleton />);

    expect(html).toContain('class="btn btn-primary"');
  });

  it('handles cva with proxy variant value', () => {
    const buttonVariants = cva('btn', {
      variants: {
        variant: {
          primary: 'btn-primary',
          secondary: 'btn-secondary',
        },
      },
    });

    function Button(props: { variant: 'primary' | 'secondary' }) {
      return (
        <button className={buttonVariants({ variant: props.variant })}>
          click
        </button>
      );
    }

    const Skeleton = withStencil(Button);
    expect(() => renderToStaticMarkup(<Skeleton />)).not.toThrow();
  });

  it('handles cva combined with clsx and proxy className', () => {
    const buttonVariants = cva('btn', {
      variants: {
        size: {
          sm: 'btn-sm',
          lg: 'btn-lg',
        },
      },
    });

    function Button(props: { size: 'sm' | 'lg'; className?: string }) {
      return (
        <button className={clsx(buttonVariants({ size: props.size }), props.className)}>
          click
        </button>
      );
    }

    const Skeleton = withStencil(Button);
    expect(() => renderToStaticMarkup(<Skeleton />)).not.toThrow();
  });

  it('handles cva with proxy as entire props object', () => {
    const cardVariants = cva('card', {
      variants: {
        color: {
          red: 'card-red',
          blue: 'card-blue',
        },
      },
    });

    function Card(props: { color: 'red' | 'blue' }) {
      return <div className={cardVariants(props as any)}>content</div>;
    }

    const Skeleton = withStencil(Card);
    expect(() => renderToStaticMarkup(<Skeleton />)).not.toThrow();
  });

  it('handles cva with defaultVariants and proxy', () => {
    const variants = cva('base', {
      variants: {
        intent: {
          primary: 'intent-primary',
          danger: 'intent-danger',
        },
        size: {
          sm: 'size-sm',
          md: 'size-md',
        },
      },
      defaultVariants: {
        intent: 'primary',
        size: 'md',
      },
    });

    function Component(props: { intent?: 'primary' | 'danger'; size?: 'sm' | 'md' }) {
      return <div className={variants({ intent: props.intent, size: props.size })}>hello</div>;
    }

    const Skeleton = withStencil(Component);
    expect(() => renderToStaticMarkup(<Skeleton />)).not.toThrow();
  });

  it('handles cva with compoundVariants and proxy', () => {
    const variants = cva('base', {
      variants: {
        intent: {
          primary: 'intent-primary',
          danger: 'intent-danger',
        },
        size: {
          sm: 'size-sm',
          lg: 'size-lg',
        },
      },
      compoundVariants: [
        { intent: 'primary', size: 'lg', class: 'compound-primary-lg' },
      ],
    });

    function Component(props: { intent: 'primary' | 'danger'; size: 'sm' | 'lg' }) {
      return <div className={variants(props as any)}>hello</div>;
    }

    const Skeleton = withStencil(Component);
    expect(() => renderToStaticMarkup(<Skeleton />)).not.toThrow();
  });
});

describe('withStencil with className utility edge cases', () => {
  it('handles String() coercion of proxy value in className', () => {
    function Component(props: { variant: string }) {
      return <div className={String(props.variant)}>hello</div>;
    }

    const Skeleton = withStencil(Component);
    expect(() => renderToStaticMarkup(<Skeleton />)).not.toThrow();
  });

  it('handles proxy used in array join for className', () => {
    function Component(props: { classes: string[] }) {
      return <div className={props.classes.join(' ')}>hello</div>;
    }

    const Skeleton = withStencil(Component);
    expect(() => renderToStaticMarkup(<Skeleton />)).not.toThrow();
  });

  it('handles proxy value in ternary for className', () => {
    function Component(props: { isLarge: boolean }) {
      return (
        <div className={props.isLarge ? 'text-lg' : 'text-sm'}>hello</div>
      );
    }

    const Skeleton = withStencil(Component);
    const html = renderToStaticMarkup(<Skeleton />);

    // proxy は truthy なので 'text-lg' が使われる
    expect(html).toContain('class=');
  });

  it('handles function proxy leaking directly into className prop', () => {
    function Component(props: { data: { getClass: () => string } }) {
      const cls = props.data.getClass();
      return <div className={cls as unknown as string}>hello</div>;
    }

    const Skeleton = withStencil(Component);
    expect(() => renderToStaticMarkup(<Skeleton />)).not.toThrow();
  });

  it('handles for...in on proxy (clsx internal mechanism)', () => {
    function Component(props: { styles: Record<string, boolean> }) {
      const classes: string[] = [];
      for (const key in props.styles) {
        if (props.styles[key]) classes.push(key);
      }
      return <div className={classes.join(' ')}>hello</div>;
    }

    const Skeleton = withStencil(Component);
    expect(() => renderToStaticMarkup(<Skeleton />)).not.toThrow();
  });

  it('handles Object.entries on proxy', () => {
    function Component(props: { styles: Record<string, boolean> }) {
      const classes: string[] = [];
      for (const [key, val] of Object.entries(props.styles)) {
        if (val) classes.push(key);
      }
      return <div className={classes.join(' ')}>hello</div>;
    }

    const Skeleton = withStencil(Component);
    expect(() => renderToStaticMarkup(<Skeleton />)).not.toThrow();
  });

  it('handles typeof check on proxy value (proxy is typeof function, not string)', () => {
    function Component(props: { className?: string }) {
      const cls = typeof props.className === 'string' ? props.className : '';
      return <div className={cls}>hello</div>;
    }

    const Skeleton = withStencil(Component);
    const html = renderToStaticMarkup(<Skeleton />);

    // proxy は typeof 'function' なので string チェックは false → cls は '' になる
    expect(html).toBe('<div class=""></div>');
  });

  it('handles cn utility pattern (clsx + twMerge-like)', () => {
    // shadcn/ui でよく使われる cn パターンのシミュレーション
    // twMerge は文字列を受け取るだけなので clsx の出力(文字列)で十分
    function cn(...inputs: unknown[]) {
      return clsx(inputs); // 実際には twMerge(clsx(inputs))
    }

    function Component(props: { className?: string }) {
      return <div className={cn('base-class', props.className)}>hello</div>;
    }

    const Skeleton = withStencil(Component);
    expect(() => renderToStaticMarkup(<Skeleton />)).not.toThrow();
  });

  it('handles proxy value used as Map/Set key for className lookup', () => {
    const classMap = new Map<string, string>([
      ['primary', 'text-blue-500'],
      ['danger', 'text-red-500'],
    ]);

    function Component(props: { variant: string }) {
      return <div className={classMap.get(props.variant as string) ?? 'default'}>hello</div>;
    }

    const Skeleton = withStencil(Component);
    expect(() => renderToStaticMarkup(<Skeleton />)).not.toThrow();
  });
});

describe('withStencil with twMerge (tailwind-merge)', () => {
  it('handles twMerge with hardcoded classes', () => {
    function Component() {
      return <div className={twMerge('px-2 py-1', 'px-4')}>hello</div>;
    }

    const Skeleton = withStencil(Component);
    const html = renderToStaticMarkup(<Skeleton />);

    expect(html).toContain('class="py-1 px-4"');
  });

  it('handles cn pattern (clsx + twMerge) with proxy className', () => {
    function cn(...inputs: any[]) {
      return twMerge(clsx(inputs));
    }

    function Component(props: { className?: string }) {
      return <div className={cn('bg-red-500 px-2', props.className)}>hello</div>;
    }

    const Skeleton = withStencil(Component);
    expect(() => renderToStaticMarkup(<Skeleton />)).not.toThrow();
    const html = renderToStaticMarkup(<Skeleton />);
    expect(html).toContain('class=');
  });

  it('handles twMerge with proxy value passed directly', () => {
    function Component(props: { className: string }) {
      return <div className={twMerge('base', props.className as string)}>hello</div>;
    }

    const Skeleton = withStencil(Component);
    expect(() => renderToStaticMarkup(<Skeleton />)).not.toThrow();
  });

  it('handles cn pattern with cva and proxy', () => {
    function cn(...inputs: any[]) {
      return twMerge(clsx(inputs));
    }

    const buttonVariants = cva('btn px-4 py-2', {
      variants: {
        variant: {
          primary: 'bg-blue-500 text-white',
          secondary: 'bg-gray-200 text-black',
        },
      },
    });

    function Button(props: { variant: 'primary' | 'secondary'; className?: string }) {
      return (
        <button className={cn(buttonVariants({ variant: props.variant }), props.className)}>
          click
        </button>
      );
    }

    const Skeleton = withStencil(Button);
    expect(() => renderToStaticMarkup(<Skeleton />)).not.toThrow();
  });
});

describe('withStencil with tailwind-variants (tv)', () => {
  it('handles tv with hardcoded values', () => {
    const button = tv({
      base: 'font-medium rounded',
      variants: {
        color: {
          primary: 'bg-blue-500 text-white',
          secondary: 'bg-gray-200 text-black',
        },
        size: {
          sm: 'text-sm px-2 py-1',
          lg: 'text-lg px-4 py-2',
        },
      },
    });

    function Button() {
      return <button className={button({ color: 'primary', size: 'sm' })}>click</button>;
    }

    const Skeleton = withStencil(Button);
    expect(() => renderToStaticMarkup(<Skeleton />)).not.toThrow();
  });

  it('handles tv with proxy variant values', () => {
    const button = tv({
      base: 'font-medium rounded',
      variants: {
        color: {
          primary: 'bg-blue-500 text-white',
          secondary: 'bg-gray-200 text-black',
        },
        size: {
          sm: 'text-sm px-2 py-1',
          lg: 'text-lg px-4 py-2',
        },
      },
    });

    function Button(props: { color: 'primary' | 'secondary'; size: 'sm' | 'lg' }) {
      return <button className={button({ color: props.color, size: props.size })}>click</button>;
    }

    const Skeleton = withStencil(Button);
    expect(() => renderToStaticMarkup(<Skeleton />)).not.toThrow();
  });

  it('handles tv with proxy as entire props', () => {
    const card = tv({
      base: 'p-4 rounded',
      variants: {
        shadow: {
          sm: 'shadow-sm',
          lg: 'shadow-lg',
        },
      },
    });

    function Card(props: { shadow: 'sm' | 'lg' }) {
      return <div className={card(props as any)}>content</div>;
    }

    const Skeleton = withStencil(Card);
    expect(() => renderToStaticMarkup(<Skeleton />)).not.toThrow();
  });

  it('handles tv with className override via proxy', () => {
    const box = tv({
      base: 'p-4',
    });

    function Box(props: { className?: string }) {
      return <div className={box({ className: props.className as string })}>hello</div>;
    }

    const Skeleton = withStencil(Box);
    expect(() => renderToStaticMarkup(<Skeleton />)).not.toThrow();
  });

  it('handles tv with slots and proxy', () => {
    const card = tv({
      slots: {
        base: 'flex flex-col',
        title: 'text-lg font-bold',
        body: 'text-sm',
      },
      variants: {
        color: {
          primary: { base: 'bg-blue-100', title: 'text-blue-800' },
          secondary: { base: 'bg-gray-100', title: 'text-gray-800' },
        },
      },
    });

    function Card(props: { color: 'primary' | 'secondary' }) {
      const { base, title, body } = card({ color: props.color });
      return (
        <div className={base()}>
          <h2 className={title()}>Title</h2>
          <p className={body()}>Body</p>
        </div>
      );
    }

    const Skeleton = withStencil(Card);
    expect(() => renderToStaticMarkup(<Skeleton />)).not.toThrow();
  });
});
