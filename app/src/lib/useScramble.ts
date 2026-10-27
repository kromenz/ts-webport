"use client";

import { animate, type JSAnimation } from "animejs";
import { scrambleText } from "animejs/text";
import { useCallback, useEffect, useRef } from "react";
import { useSiteReducedMotion } from "./motion";

const CHARS = "a-zA-Z0-9!%#_";

/**
 * Returns `scramble(el, text?)`, which scrambles `el` and settles on `text`.
 *
 * Caller contract (anime writes `innerHTML`, which replaces the text node
 * React rendered, so React can no longer patch it):
 *  - If the text is fixed (navbar labels), nothing else is needed. Omit
 *    `text` and the element's current text is the target.
 *  - If the text changes over time (job titles, project titles), render the
 *    element with `key={text}` (or the tab index). A new key makes React
 *    mount a fresh element holding the new text, so React never patches a
 *    node anime detached. Then call `scramble(el)` on that new element.
 *  - Do not also animate the same element with framer-motion.
 *
 * Calling again on the same element cancels the previous run and always
 * leaves the final text in place, so rapid calls cannot garble it.
 */
export function useScramble(): (el: HTMLElement | null, text?: string) => void {
  const reduced = useSiteReducedMotion();
  const running = useRef(new WeakMap<HTMLElement, JSAnimation>());
  const finals = useRef(new WeakMap<HTMLElement, string>());
  const live = useRef(new Set<HTMLElement>());

  useEffect(() => {
    const anims = running.current;
    const targets = live.current;
    const texts = finals.current;
    return () => {
      for (const el of targets) {
        anims.get(el)?.cancel();
        anims.delete(el);
        const final = texts.get(el);
        if (final !== undefined) el.textContent = final;
      }
      targets.clear();
    };
  }, []);

  return useCallback(
    (el, text) => {
      if (!el) return;
      const anims = running.current;
      const texts = finals.current;

      anims.get(el)?.cancel();
      anims.delete(el);

      // Without an explicit target, remember the first text we saw so a
      // later call mid-scramble does not read garbled characters.
      const final = text ?? texts.get(el) ?? el.textContent ?? "";
      texts.set(el, final);
      el.setAttribute("aria-label", final);
      el.textContent = final;
      if (reduced || final.length === 0) return;

      live.current.add(el);
      const anim = animate(el, {
        innerHTML: scrambleText({ text: final, chars: CHARS }),
        duration: 600,
        ease: "linear",
        onComplete: () => {
          el.textContent = final;
          if (anims.get(el) === anim) anims.delete(el);
        },
      });
      anims.set(el, anim);
    },
    [reduced],
  );
}
