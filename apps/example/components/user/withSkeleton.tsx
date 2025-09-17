// Componentのpropsを全てオプショナルに変更する HOCを提供する
// 使用用途としてはSuspencのfallbackにchildrenとおなじコンポーネントを使用する
/**
 * const SkeletonUser = withSkeleton(User);
 * <Suspense fallback={<SkeletonUser />}>
 *   <User userPromise={userPromise} />
 * </Suspense>
 *
 * <Suspense fallback={<SkeletonUser otherProp=1200 />}>
 *   <User userPromise={userPromise} />
 * </Suspense>
 */

import * as React from 'react';

type OptionalProps<T> = {
  [K in keyof T]?: T[K];
};

function withSkeleton<T extends Record<string, unknown>>(
  Component: React.ComponentType<T>
): React.ComponentType<OptionalProps<T>> {
  return function SkeletonComponent(props: OptionalProps<T>) {
    return <Component {...(props as T)} />;
  };
}

export default withSkeleton;
