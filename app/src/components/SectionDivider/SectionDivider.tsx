"use client";

import { type ReactNode, useEffect, useLayoutEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";

import { useSiteReducedMotion } from "@/src/lib/motion";

type Props = {
  path: string;
  command: string;
  output: string;
  className?: string;
};

const SEGMENT_STAGGER_MS = 60;
const TYPE_MS = 22;
const ENTER_BEAT_MS = 180;

// Right-pointing powerline chevron, drawn with clip-path so it stays crisp at
// any size (the U+E0B0 glyph is not in Fira Code).
const CHEVRON =
  "polygon(0 0, calc(100% - 0.55em) 0, 100% 50%, calc(100% - 0.55em) 100%, 0 100%)";

const segmentClass =
  "relative inline-block py-0.5 pl-2 pr-[1.1em] -mr-[0.55em] whitespace-nowrap";

/**
 * Starship-style section heading: a powerline segment line, a typed command
 * and its real output.
 *
 * The server HTML and the first client render carry the final text (an sr-only
 * copy inside the h2 plus the visual copy). Only after mount does a layout
 * effect hide the visual pieces, and the sequence then reveals them through
 * refs, so nothing here branches on client-only values and no-JS visitors see
 * everything. None of these elements is animated by framer-motion.
 */
const SectionDivider = ({ path, command, output, className }: Props) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.4 });
  const reduceMotion = useSiteReducedMotion();

  const segRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const commandRef = useRef<HTMLSpanElement>(null);
  const outputRef = useRef<HTMLSpanElement>(null);
  const promptRef = useRef<HTMLSpanElement>(null);
  const cursorRef = useRef<HTMLSpanElement>(null);

  const showFinal = () => {
    segRefs.current.forEach((el) => {
      if (!el) return;
      el.style.transition = "";
      el.style.opacity = "";
      el.style.transform = "";
    });
    if (commandRef.current) commandRef.current.textContent = command;
    if (promptRef.current) promptRef.current.style.visibility = "";
    if (outputRef.current) {
      outputRef.current.style.transition = "";
      outputRef.current.style.opacity = "";
      outputRef.current.style.transform = "";
    }
    if (cursorRef.current) cursorRef.current.style.visibility = "";
  };

  const hideAll = () => {
    segRefs.current.forEach((el) => {
      if (!el) return;
      el.style.transition = "none";
      el.style.opacity = "0";
      el.style.transform = "translateX(-6px)";
    });
    if (commandRef.current) commandRef.current.textContent = "";
    if (promptRef.current) promptRef.current.style.visibility = "hidden";
    if (outputRef.current) {
      outputRef.current.style.transition = "none";
      outputRef.current.style.opacity = "0";
      outputRef.current.style.transform = "translateY(4px)";
    }
    if (cursorRef.current) cursorRef.current.style.visibility = "hidden";
  };

  // Hide before first paint, client-side only. With motion off the final text
  // is left alone.
  useLayoutEffect(() => {
    if (reduceMotion) return;
    hideAll();
    return showFinal;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduceMotion, command]);

  useEffect(() => {
    if (!isInView || reduceMotion) return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const at = (fn: () => void, ms: number) => {
      timers.push(setTimeout(fn, ms));
    };

    hideAll();
    const segs = segRefs.current.filter(Boolean) as HTMLSpanElement[];
    segs.forEach((el, i) =>
      at(() => {
        el.style.transition =
          "opacity 200ms ease-out, transform 200ms ease-out";
        el.style.opacity = "1";
        el.style.transform = "none";
      }, i * SEGMENT_STAGGER_MS),
    );

    const typeStart = segs.length * SEGMENT_STAGGER_MS + 80;
    at(() => {
      if (promptRef.current) promptRef.current.style.visibility = "";
    }, typeStart);
    for (let i = 1; i <= command.length; i++) {
      at(() => {
        if (commandRef.current)
          commandRef.current.textContent = command.slice(0, i);
      }, typeStart + i * TYPE_MS);
    }
    const enterAt = typeStart + command.length * TYPE_MS + ENTER_BEAT_MS;
    at(() => {
      if (outputRef.current) {
        outputRef.current.style.transition =
          "opacity 240ms ease-out, transform 240ms ease-out";
        outputRef.current.style.opacity = "1";
        outputRef.current.style.transform = "none";
      }
      if (cursorRef.current) cursorRef.current.style.visibility = "";
    }, enterAt);

    return () => {
      timers.forEach(clearTimeout);
      showFinal();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInView, reduceMotion, command]);

  const segments: { text: ReactNode; className: string }[] = [
    { text: "rafael", className: "bg-green-primary text-[#14141a] font-bold" },
    { text: path, className: "bg-white/10 text-foreground/80" },
    {
      text: (
        <>
          <span className="text-[#7dd3fc]">⎇ main</span>{" "}
          <span className="text-green-primary">✓</span>
        </>
      ),
      className: "bg-white/5 text-foreground/80",
    },
  ];

  return (
    <div
      ref={ref}
      className={`container mx-auto px-4 mb-10 md:mb-14 ${className ?? ""}`}>
      <div className="flex flex-col items-center gap-4">
        <h2 className="w-fit max-w-full text-left font-mono">
          <span className="sr-only">{`${path} — ${command}: ${output}`}</span>
          <span aria-hidden className="block">
            <span className="flex flex-wrap pl-0.5 text-xs sm:text-sm">
              {segments.map((s, i) => (
                <span
                  key={i}
                  ref={(el) => {
                    segRefs.current[i] = el;
                  }}
                  style={{ clipPath: CHEVRON, zIndex: segments.length - i }}
                  className={`${segmentClass} ${i > 0 ? "pl-[calc(0.55em+0.5rem)]" : ""} ${s.className}`}>
                  {s.text}
                </span>
              ))}
            </span>
            <span className="mt-2 block text-2xl md:text-3xl font-bold text-foreground/85 break-words">
              <span ref={promptRef} className="text-green-primary">
                ❯{" "}
              </span>
              <span ref={commandRef}>{command}</span>
            </span>
            <span className="mt-1 block pl-[2ch] text-sm font-normal text-foreground/55">
              <span ref={outputRef} className="inline-block">
                {output}
              </span>
              <span
                ref={cursorRef}
                className="ml-1 inline-block h-[0.95em] w-[0.5ch] translate-y-0.5 align-middle bg-green-primary animate-terminal-blink"
              />
            </span>
          </span>
        </h2>
        <motion.div
          aria-hidden
          initial={{ scaleX: 0 }}
          animate={isInView ? { scaleX: 1 } : { scaleX: 0 }}
          transition={{
            duration: reduceMotion ? 0 : 0.8,
            ease: "easeOut",
            delay: reduceMotion ? 0 : 0.25,
          }}
          style={{ transformOrigin: "center" }}
          className="h-px w-full max-w-2xl bg-linear-to-r from-transparent via-green-primary/50 to-transparent"
        />
      </div>
    </div>
  );
};

export default SectionDivider;
