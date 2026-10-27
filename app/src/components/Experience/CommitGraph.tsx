"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { animate, stagger, svg } from "animejs";
import { branchSpans, type Commit } from "@/src/lib/gitGraph";
import { useAnimeScope } from "@/src/lib/useAnimeScope";
import { useSiteReducedMotion } from "@/src/lib/motion";

type Entry = { title: string; position: string; date: string };

type Props = {
  entries: Entry[];
  commits: Commit[];
  activeIndex: number;
  onSelect: (index: number) => void;
};

type Geometry = { ys: number[]; height: number };

const HASH_COLOR = "#e5c07b";
const REF_COLOR = "#7dd3fc";
const GREEN = "#34d399";
const STAGE = "#17171e";
const GUTTER = 56;
const X = [16, 34];

function sameGeometry(a: Geometry | null, b: Geometry): boolean {
  return (
    a !== null &&
    a.height === b.height &&
    a.ys.length === b.ys.length &&
    a.ys.every((y, i) => y === b.ys[i])
  );
}

const CommitGraph = ({ entries, commits, activeIndex, onSelect }: Props) => {
  const reduced = useSiteReducedMotion();
  const rowsRef = useRef<HTMLDivElement>(null);
  const hashRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const played = useRef(false);
  const [geo, setGeo] = useState<Geometry | null>(null);

  const measure = useCallback(() => {
    const rows = rowsRef.current;
    if (!rows) return;
    const base = rows.getBoundingClientRect();
    const ys = commits.map((_, i) => {
      const el = hashRefs.current[i];
      if (!el) return 0;
      const r = el.getBoundingClientRect();
      return Math.round(r.top - base.top + rows.scrollTop + r.height / 2);
    });
    const next = { ys, height: rows.scrollHeight };
    setGeo((prev) => (sameGeometry(prev, next) ? prev : next));
  }, [commits]);

  useEffect(() => {
    const rows = rowsRef.current;
    if (!rows) return;
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(rows);
    document.fonts?.ready.then(measure);
    return () => ro.disconnect();
  }, [measure]);

  const spans = branchSpans(commits);

  useAnimeScope(
    rowsRef,
    () => {
      if (!geo || reduced || played.current) return;
      const root = rowsRef.current;
      if (!root) return;
      const paths = root.querySelectorAll<SVGPathElement>("[data-draw]");
      const dots = root.querySelectorAll<SVGCircleElement>("[data-dot]");
      if (paths.length === 0) return;

      const lines = animate(svg.createDrawable(paths), {
        draw: ["0 0", "0 1"],
        delay: stagger(90),
        duration: 900,
        ease: "inOut(2)",
        autoplay: false,
      });
      const pops = animate(dots, {
        opacity: [0, 1],
        delay: stagger(90),
        duration: 300,
        ease: "out(2)",
        autoplay: false,
      });
      lines.seek(0);
      pops.seek(0);

      const io = new IntersectionObserver(
        (entries) => {
          if (entries.some((e) => e.isIntersecting)) {
            io.disconnect();
            played.current = true;
            lines.play();
            pops.play();
          }
        },
        { threshold: 0.25 },
      );
      io.observe(root);
      return () => io.disconnect();
    },
    [geo, reduced],
  );

  return (
    <div
      ref={rowsRef}
      className="relative flex md:flex-col overflow-x-auto md:overflow-x-visible md:overflow-y-auto border-b md:border-b-0 md:border-r border-white/10 scrollbar-custom md:pl-14 md:py-3">
      {geo && (
        <svg
          aria-hidden
          className="hidden md:block absolute left-0 top-0 pointer-events-none"
          width={GUTTER}
          height={geo.height}
          viewBox={`0 0 ${GUTTER} ${geo.height}`}
          fill="none">
          <path
            data-draw
            d={`M${X[0]} ${geo.ys[0]} V${geo.ys[geo.ys.length - 1]}`}
            stroke={GREEN}
            strokeWidth={2}
            strokeLinecap="round"
          />
          {spans.map(({ merge, branch, fork }) => {
            const m = geo.ys[merge];
            const b = geo.ys[branch];
            const f = geo.ys[fork];
            if (m === undefined || b === undefined || f === undefined) {
              return null;
            }
            return (
              <path
                key={`${merge}-${branch}`}
                data-draw
                d={`M${X[0]} ${m} C${X[0]} ${m + 18} ${X[1]} ${b - 22} ${X[1]} ${b} C${X[1]} ${b + 22} ${X[0]} ${f - 18} ${X[0]} ${f}`}
                stroke={REF_COLOR}
                strokeWidth={2}
                strokeLinecap="round"
              />
            );
          })}
          {commits.map((c, i) => (
            <circle
              key={c.hash}
              data-dot
              cx={X[c.lane]}
              cy={geo.ys[i]}
              r={5}
              fill={c.index === activeIndex ? (c.lane ? REF_COLOR : GREEN) : STAGE}
              stroke={c.lane ? REF_COLOR : GREEN}
              strokeWidth={2}
            />
          ))}
        </svg>
      )}

      {commits.map((c, i) => {
        const exp = entries[c.index];
        const isActive = c.index === activeIndex;
        return (
          <button
            key={c.hash}
            type="button"
            aria-current={isActive ? "true" : undefined}
            onClick={() => onSelect(c.index)}
            className={`relative shrink-0 md:shrink text-left px-4 md:pr-4 py-3 transition-colors font-mono text-sm whitespace-nowrap md:whitespace-normal ${
              c.lane ? "md:pl-5" : "md:pl-3"
            } ${
              isActive
                ? "bg-white/4 text-foreground"
                : "text-foreground/55 hover:text-foreground hover:bg-white/2"
            }`}>
            {isActive && (
              <motion.span
                layoutId="experienceTab"
                className="absolute left-0 top-0 bottom-0 w-0.5 bg-green-primary md:block hidden"
                transition={{ type: "spring", stiffness: 500, damping: 35 }}
              />
            )}
            {isActive && (
              <motion.span
                layoutId="experienceTabMobile"
                className="absolute left-0 right-0 bottom-0 h-0.5 bg-green-primary md:hidden"
                transition={{ type: "spring", stiffness: 500, damping: 35 }}
              />
            )}
            <div className="flex items-center gap-2 text-xs">
              <span
                ref={(el) => {
                  hashRefs.current[i] = el;
                }}
                style={{ color: HASH_COLOR }}>
                {c.hash}
              </span>
              {c.isHead && (
                <span className="hidden md:inline" style={{ color: REF_COLOR }}>
                  (HEAD -&gt; main)
                </span>
              )}
            </div>
            <span className="block font-medium mt-0.5">{exp.title}</span>
            <span className="block text-xs text-foreground/45">
              {exp.position}
            </span>
            <span className="hidden md:block text-xs text-foreground/35">
              {exp.date}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default CommitGraph;
