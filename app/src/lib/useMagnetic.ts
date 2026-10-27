"use client";

import { createAnimatable } from "animejs";
import { type RefObject, useEffect } from "react";
import { useSiteReducedMotion } from "./motion";

/**
 * Pulls `ref.current` toward the cursor while the pointer is within `radius`
 * px of its centre, and eases it back on leave.
 *
 * Listens on the closest `[data-magnet-scope]` ancestor (falling back to the
 * parent element). The target must be a plain element, never a framer-motion
 * one. No-op without a hovering fine pointer, and under reduced motion.
 */
export function useMagnetic(
  ref: RefObject<HTMLElement | null>,
  radius = 90,
  strength = 0.35,
): void {
  const reduced = useSiteReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el || reduced) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
      return;
    }
    const scope =
      el.closest<HTMLElement>("[data-magnet-scope]") ?? el.parentElement;
    if (!scope) return;

    const a = createAnimatable(el, { x: 380, y: 380, ease: "out(3)" });
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      const near = Math.hypot(dx, dy) < radius;
      a.x(near ? dx * strength : 0);
      a.y(near ? dy * strength : 0);
    };
    const onLeave = () => {
      a.x(0);
      a.y(0);
    };
    scope.addEventListener("pointermove", onMove);
    scope.addEventListener("pointerleave", onLeave);
    return () => {
      scope.removeEventListener("pointermove", onMove);
      scope.removeEventListener("pointerleave", onLeave);
      a.revert();
    };
  }, [ref, radius, strength, reduced]);
}
