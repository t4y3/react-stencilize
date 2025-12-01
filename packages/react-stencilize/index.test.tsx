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
