"use client";

import { useReducedMotion } from "framer-motion";

/**
 * Whether the site hands its animation over to the OS `prefers-reduced-motion`
 * setting.
 *
 * Set to false on purpose. Every animation here is ambient: a drifting grid,
 * falling glyphs, a typing prompt, a starfield. Honouring the preference for
 * all of it did not read as calm, it read as broken, and it hid the site's
 * whole identity from anyone with the OS setting on.
 *
 * Flip this to true to hand control back, and both the hook and the
 * components that read it follow in one step.
 */
export const HONOR_REDUCED_MOTION = false;

/**
 * The single source of truth for whether to degrade an animation.
 *
 * Always drives effects and transition timings, never the rendered markup:
 * `useReducedMotion` resolves to null on the server and to the real value on
 * the client's first render, so branching JSX on it is a hydration mismatch.
 */
export function useSiteReducedMotion(): boolean {
  const prefers = useReducedMotion();
  return HONOR_REDUCED_MOTION ? prefers === true : false;
}

/** Same decision, for code outside React's render cycle (canvas loops). */
export function siteReducedMotion(): boolean {
  if (!HONOR_REDUCED_MOTION) return false;
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
