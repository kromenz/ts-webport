"use client";

import { createScope, type Scope } from "animejs";
import { type DependencyList, type RefObject, useEffect, useRef } from "react";

/**
 * Binds an anime.js scope to `root` for the lifetime of the effect.
 *
 * `setup` runs inside `scope.add`, so every animation it creates is tracked
 * and reverted on cleanup, and before the effect re-runs when `deps` change.
 * Callers still decide on reduced motion; this hook only manages lifecycle.
 */
export function useAnimeScope(
  root: RefObject<HTMLElement | null>,
  setup: (scope: Scope) => void | (() => void),
  deps: DependencyList,
): RefObject<Scope | null> {
  const scopeRef = useRef<Scope | null>(null);

  useEffect(() => {
    const scope = createScope({ root });
    scopeRef.current = scope;
    scope.add(() => setup(scope));

    return () => {
      scope.revert();
      if (scopeRef.current === scope) scopeRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return scopeRef;
}
