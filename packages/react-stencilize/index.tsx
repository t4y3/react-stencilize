import React from 'react';

// Symbol used to mark a component as already wrapped by withStencil
const STENCIL_WRAPPED = Symbol('react-stencilize.withStencil');

// Create a deep, safe Proxy that never throws on property access, calls, or iteration.
// It returns further safe proxies so arbitrary chaining stays safe.
function createSafeProxy(): unknown {
  const emptyIterator = function* () {
    /* empty */
  };

  type SafeFn = (..._args: unknown[]) => unknown;

  // A function-like safe proxy (callable and chainable)
  const fnHandler: ProxyHandler<SafeFn> = {
    get(_t, prop) {
      // Avoid being treated as a Promise
      if (prop === 'then') return undefined;
      // Coercions produce empty string
      if (prop === 'toString') return () => '';
      if (prop === 'valueOf') return () => '';
      if (prop === Symbol.toPrimitive) return () => '';
      // Common special props
      if (prop === 'length') return 0;
      if (prop === 'ref' || prop === 'key') return undefined;
      // Safe empty iteration
      if (prop === Symbol.iterator) return emptyIterator;
      // Any further lookup returns another function-like proxy
      return new Proxy(() => {}, fnHandler);
    },
    apply() {
      // Calling it yields another function-like proxy
      return new Proxy(() => {}, fnHandler);
    },
  };

  // Root object-like safe proxy keeps object invariants simple
  const objHandler: ProxyHandler<Record<string, unknown>> = {
    get(_t, prop) {
      if (prop === 'then') return undefined;
      if (prop === 'toString') return () => '';
      if (prop === 'valueOf') return () => '';
      if (prop === Symbol.toPrimitive) return () => '';
      if (prop === 'ref' || prop === 'key') return undefined;
      if (prop === Symbol.iterator) return emptyIterator;
      // Return a function-like proxy so both call and deep access are safe
      return new Proxy(() => {}, fnHandler);
    },
  };

  return new Proxy({}, objHandler);
}

// Sanitize a React node so that skeleton rendering shows only safe, outline-friendly content.
// - Strings/numbers collapse to empty string
// - Arrays are sanitized recursively
// - Host elements keep only primitive props and get sanitized children
// - Non-renderable values collapse to empty string
function sanitizeNode(node: unknown): React.ReactNode {
  if (Array.isArray(node)) return node.map(sanitizeNode);

  if (node == null || typeof node === 'boolean') return null;

  if (typeof node === 'string' || typeof node === 'number') return '';

  if (React.isValidElement(node)) {
    const type: unknown = node.type;
    const isHostLike = typeof type === 'string' || type === React.Fragment;

    if (isHostLike) {
      const prevProps = (node.props ?? {}) as Readonly<Record<string, unknown>> & {
        children?: React.ReactNode;
      };
      const nextProps: Record<string, unknown> = {};

      for (const key of Object.keys(prevProps)) {
        if (key === 'children') continue;
        const v = prevProps[key];
        // Allow only primitive attributes; coerce others to empty string
        nextProps[key] =
          typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean' ? v : '';
      }

      const children = prevProps.children;
      if (children !== undefined) nextProps.children = sanitizeNode(children);

      return React.cloneElement(node as React.ReactElement<Record<string, unknown>>, nextProps);
    }

    // For non-host (user) elements, return as-is; execution is controlled by withStencil
    return node;
  }

  // Non-renderable outputs (objects/functions/proxies) collapse to empty string
  return '';
}

// Try to obtain a callable function from various React component wrappers (memo/forwardRef-like)
function resolveCallableComponent<P extends object>(C: unknown): ((props: P) => unknown) | null {
  if (typeof C === 'function') return C as (props: P) => unknown;
  if (C && typeof C === 'object') {
    // Support memo/forwardRef-like shapes
    const obj = C as { render?: unknown; type?: unknown };
    if (typeof obj.render === 'function') return obj.render as (props: P) => unknown;
    if (typeof obj.type === 'function') return obj.type as (props: P) => unknown;
  }
  return null;
}

/**
 * @example
 * const Skeleton = withStencil(User)
 * <Suspense fallback={<Skeleton />}>
 *   <User user={data.user} />
 * </Suspense>
 */
export function withStencil<P extends object = Record<string, unknown>>(
  Component: React.ComponentType<P>,
) {
  const Skeleton: React.FC = () => {
    const safeProps = createSafeProxy() as P;

    // Prefer direct call for simple function components (no hooks),
    // otherwise safely fall back to element creation.
    const inner = resolveCallableComponent<P>(Component as unknown);
    try {
      if (inner) {
        const out = inner(safeProps);
        return sanitizeNode(out);
      }
    } catch (_e) {
      // If direct execution fails (e.g., hooks used), fall through to element path
    }

    const element = React.createElement(Component as React.ComponentType<P>, safeProps);
    return sanitizeNode(element);
  };

  Reflect.set(Skeleton, STENCIL_WRAPPED, true);
  const name =
    (Component as { displayName?: string; name?: string }).displayName ||
    (Component as { name?: string }).name ||
    'Component';
  Skeleton.displayName = `Skeleton(${name})`;
  return Skeleton;
}
