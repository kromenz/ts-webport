"use client";

import { animate, createScope, stagger } from "animejs";
import { splitText } from "animejs/text";
import { type RefObject, useEffect } from "react";
import { useSiteReducedMotion } from "./motion";

/**
 * Reveals the words of `ref.current` with a clipped slide-up on every `key`
 * change.
 *
 * Caller contract (splitText rewrites the element's children, so React can
 * no longer patch the text it rendered):
 *  - Render the element with `key={key}` (the same value passed here, e.g.
 *    the tab index or id). A new key makes React mount a fresh element with
 *    the new text before this effect runs, so there is never a stale or
 *    detached text node.
 *  - The cleanup reverts the previous split and animation, so five key
 *    changes in under a second leave only the last element split.
 *  - Do not also animate this element with framer-motion.
 *
 * Under reduced motion the text is left as rendered. `accessible: true`
 * keeps the full text available to screen readers.
 */
export function useSplitReveal(
  ref: RefObject<HTMLElement | null>,
  key: unknown,
): void {
  const reduced = useSiteReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el || reduced) return;

    const scope = createScope({ root: el });
    const split = splitText(el, {
      words: { wrap: "clip" },
      accessible: true,
    });
    scope.add(() => {
      animate(split.words, {
        translateY: ["105%", "0%"],
        duration: 650,
        ease: "out(3)",
        delay: stagger(28),
      });
    });

    return () => {
      scope.revert();
      split.revert();
    };
  }, [ref, key, reduced]);
}
