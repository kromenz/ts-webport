import { createTimeline } from "animejs";
import { siteReducedMotion } from "./motion";

type Deps = {
  target: (id: string) => HTMLElement | null;
  root: () => HTMLElement;
  run: (root: HTMLElement, onMid: () => void) => Promise<void>;
  reduced: () => boolean;
};

/**
 * Builds `jump(id)`.
 *
 * Semantics: calls made before the glitch's mid point only replace the
 * pending target, so there is one jump, to the last id. A call made after the
 * mid jump already happened is landed right after the run ends (an instant
 * scroll, no second glitch), so the final viewport is always the last id.
 * If `run` throws or rejects, the jumper stays usable and the pending target
 * is still landed.
 */
export function createGlitchJumper(deps: Deps): (id: string) => void {
  let active = false;
  let pending: string | null = null;
  let landed: string | null = null;

  const land = (id: string) =>
    deps.target(id)?.scrollIntoView({ behavior: "instant" });

  return (id) => {
    if (!deps.target(id)) return;
    if (deps.reduced()) {
      land(id);
      return;
    }
    pending = id;
    if (active) return;
    active = true;
    landed = null;
    const finish = () => {
      const last = pending;
      active = false;
      pending = null;
      const was = landed;
      landed = null;
      if (last !== null && last !== was) land(last);
    };
    let run: Promise<void>;
    try {
      run = deps.run(deps.root(), () => {
        if (pending !== null) {
          landed = pending;
          land(pending);
        }
      });
    } catch (error) {
      run = Promise.reject(error);
    }
    run.then(finish, finish);
  };
}

/** Slices as [top %, bottom %] of the VIEWPORT that get hidden. */
const SLICES: [number, number][] = [
  [22, 55],
  [60, 12],
  [8, 70],
  [45, 30],
  [0, 0],
];

/**
 * clip-path on the tall page wrapper is relative to the whole page, so the
 * slices are converted to px from the part of the wrapper that is currently
 * inside the viewport.
 */
function inset(root: HTMLElement, [top, bottom]: [number, number]): string {
  const rect = root.getBoundingClientRect();
  const vh = window.innerHeight;
  const visTop = Math.max(0, -rect.top);
  const visBottom = Math.min(rect.height, -rect.top + vh);
  const span = Math.max(0, visBottom - visTop);
  const t = visTop + (span * top) / 100;
  const b = Math.max(0, rect.height - visBottom) + (span * bottom) / 100;
  return `inset(${t}px 0px ${b}px 0px)`;
}

const FULL = "inset(0px 0px 0px 0px)";

async function runGlitch(root: HTMLElement, onMid: () => void): Promise<void> {
  try {
    root.classList.add("glitching");
    const play = (from: number, to: number) => {
      const tl = createTimeline({ defaults: { duration: 45, ease: "linear" } });
      for (let k = from; k < to; k++) {
        tl.add(root, {
          clipPath: [
            k === 0 ? FULL : inset(root, SLICES[k - 1]),
            k === SLICES.length - 1 ? FULL : inset(root, SLICES[k]),
          ],
          translateX: k === SLICES.length - 1 ? 0 : k % 2 ? 6 : -6,
        });
      }
      return tl.then(() => undefined);
    };
    await play(0, 3);
    onMid(); // keyframe 3: jump, then recompute slices for the new scroll
    await play(3, SLICES.length);
  } finally {
    root.classList.remove("glitching");
    root.style.removeProperty("clip-path");
    root.style.removeProperty("transform");
  }
}

export const glitchJump = createGlitchJumper({
  target: (id) => document.getElementById(id),
  root: () => document.getElementById("page-content") ?? document.body,
  run: runGlitch,
  reduced: siteReducedMotion,
});
