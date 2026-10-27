"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { BAR_CELLS, installFrame } from "@/src/lib/npmInstall";
import { useSiteReducedMotion } from "@/src/lib/motion";

const VISIBLE_LINES = 14;
const TICK_MS = 12;

/**
 * `// skills gained` as an `npm install` run. Render it with `key` set to the
 * active experience: a new key mounts a fresh instance, and unmount cancels
 * the interval, so fast tab switching can never stack output.
 *
 * Initial render is the final output, so SSR equals the first client render
 * and reduced motion shows it too.
 */
const NpmInstall = ({ skills }: { skills: string[] }) => {
  const reduced = useSiteReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  // Run state is null until the effect starts a run, so the first render (and
  // SSR) shows the final output. Reduced motion always shows it too.
  const [run, setRun] = useState<{ pkg: number; tick: number } | null>(null);
  const lines =
    reduced || run === null
      ? installFrame(skills, skills.length, 0)
      : installFrame(skills, run.pkg, run.tick);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (reduced || !root) return;

    let timer: ReturnType<typeof setInterval> | undefined;
    let pkg = 0;
    let tick = 0;

    const stop = () => {
      if (timer !== undefined) clearInterval(timer);
      timer = undefined;
    };

    const start = () => {
      timer = setInterval(() => {
        tick += 1;
        if (tick > BAR_CELLS) {
          pkg += 1;
          tick = 0;
        }
        setRun({ pkg, tick });
        if (pkg >= skills.length) stop();
      }, TICK_MS);
    };

    // Layout effect: rewinds before paint. The bar itself starts once the
    // block scrolls into view.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRun({ pkg: 0, tick: 0 });

    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          io.disconnect();
          start();
        }
      },
      { threshold: 0.1 },
    );
    io.observe(root);

    return () => {
      io.disconnect();
      stop();
    };
  }, [skills, reduced]);

  // Fixed height so the run does not push the page around while it grows.
  const rows = Math.min(skills.length + 2, VISIBLE_LINES);

  return (
    <div
      ref={rootRef}
      className="font-mono text-xs leading-[1.55] text-foreground/75 overflow-hidden rounded-md border border-white/10 bg-black/20 px-4 py-3"
      style={{ minHeight: `calc(${rows + 1} * 1.55em + 1.5rem)` }}>
      <span className="sr-only">{skills.join(", ")}</span>
      <pre aria-hidden className="m-0 whitespace-pre font-mono">
        <span className="block">
          <span className="text-foreground/45">$</span> npm install
        </span>
        {lines.slice(-VISIBLE_LINES).map((line, i) => (
          <span key={i} className="block">
            {line.startsWith("+ ") ? (
              <>
                <span className="text-green-primary">+</span>
                {line.slice(1)}
              </>
            ) : (
              line || " "
            )}
          </span>
        ))}
      </pre>
    </div>
  );
};

export default NpmInstall;
