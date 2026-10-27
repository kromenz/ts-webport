import { createTimeline } from "animejs";
import { siteReducedMotion } from "./motion";

type Deps = {
  target: (id: string) => HTMLElement | null;
  root: () => HTMLElement;
  run: (root: HTMLElement, onMid: () => void) => Promise<void>;
  reduced: () => boolean;
};

/**
 * Builds `jump(id)`. A call while a glitch is playing only replaces the
 * pending target, so there is exactly one jump, to the last id.
 */
export function createGlitchJumper(deps: Deps): (id: string) => void {
  let active = false;
  let pending: string | null = null;

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
    const finish = () => {
      active = false;
      pending = null;
    };
    deps
      .run(deps.root(), () => {
        if (pending !== null) land(pending);
      })
      .then(finish, finish);
  };
}

const SLICES: [number, number][] = [
  [0, 0],
  [22, 55],
  [60, 12],
  [8, 70],
  [45, 30],
  [0, 0],
];

function runGlitch(root: HTMLElement, onMid: () => void): Promise<void> {
  root.classList.add("glitching");
  const tl = createTimeline({ defaults: { duration: 45, ease: "linear" } });
  SLICES.forEach(([top, bottom], k) => {
    tl.add(root, {
      clipPath: `inset(${top}% 0 ${bottom}% 0)`,
      translateX: k % 2 ? 6 : -5,
    });
    if (k === 2) tl.call(onMid);
  });
  tl.add(root, { clipPath: "inset(0% 0 0% 0)", translateX: 0, duration: 40 });
  const cleanup = () => {
    root.classList.remove("glitching");
    root.style.removeProperty("clip-path");
    root.style.removeProperty("transform");
  };
  return tl.then(() => undefined).then(cleanup, cleanup);
}

export const glitchJump = createGlitchJumper({
  target: (id) => document.getElementById(id),
  root: () => document.getElementById("page-content") ?? document.body,
  run: runGlitch,
  reduced: siteReducedMotion,
});
