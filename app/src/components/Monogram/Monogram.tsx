"use client";

import { useEffect, useRef } from "react";

import {
  CELL_H,
  CELL_W,
  drawMonogram,
  sampleMonogram,
} from "@/src/lib/ascii/monogram";
import { useSiteReducedMotion } from "@/src/lib/motion";

const REVEAL_MS = 1200;
const SETTLED_ALPHA = 0.3;

/**
 * The RA monogram in ASCII cells. Reveals out of noise the first time it
 * scrolls into view, then settles to a quiet foreground tint. Draws nothing
 * while off-screen or in a hidden tab.
 */
const Monogram = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduced = useSiteReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let disposed = false;
    let raf = 0;
    let running = false;
    let started = false;
    let visible = false;
    let elapsed = 0;
    let last = 0;
    let cols = 0;
    let rows = 0;
    let cssW = 0;
    let cssH = 0;
    let lum: Float32Array | null = null;
    let family = "";
    let fontReady = false;

    const paint = (progress: number) => {
      if (!lum) return;
      drawMonogram(ctx, lum, cols, rows, cssW, cssH, progress, elapsed / 1000, {
        settled: SETTLED_ALPHA,
      });
    };

    const layout = () => {
      cssW = canvas.clientWidth;
      cssH = canvas.clientHeight;
      if (cssW <= 0 || cssH <= 0) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(cssW * dpr);
      canvas.height = Math.round(cssH * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.ceil(cssW / CELL_W);
      rows = Math.ceil(cssH / CELL_H);
      lum = fontReady ? sampleMonogram(cols, rows, family) : null;
      paint(reduced || elapsed >= REVEAL_MS ? 1 : elapsed / REVEAL_MS);
    };

    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    const tick = (now: number) => {
      if (!running) return;
      elapsed += Math.min(now - last, 100);
      last = now;
      if (elapsed >= REVEAL_MS) {
        paint(1);
        stop();
        return;
      }
      paint(elapsed / REVEAL_MS);
      raf = requestAnimationFrame(tick);
    };

    const start = () => {
      if (running || reduced || !visible || !fontReady || !lum) return;
      if (elapsed >= REVEAL_MS || document.hidden) return;
      running = true;
      last = performance.now();
      raf = requestAnimationFrame(tick);
    };

    const ready = () => {
      if (disposed) return;
      fontReady = true;
      layout();
      if (reduced) paint(1);
      else if (started) start();
    };

    family = getComputedStyle(canvas).fontFamily;
    if (document.fonts?.load) {
      document.fonts.load(`800 40px ${family}`).then(ready, ready);
    } else {
      ready();
    }

    const resizeObserver = new ResizeObserver(() => layout());
    resizeObserver.observe(canvas);

    let io: IntersectionObserver | null = null;
    try {
      io = new IntersectionObserver((entries) => {
        for (const e of entries) {
          visible = e.isIntersecting;
          if (visible) {
            started = true;
            start();
          } else {
            stop();
          }
        }
      });
      io.observe(canvas);
    } catch {
      visible = true;
      started = true;
      start();
    }

    const onVisibility = () => {
      if (document.hidden) stop();
      else start();
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      disposed = true;
      stop();
      resizeObserver.disconnect();
      io?.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [reduced]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="block h-[98px] w-[240px] max-w-full select-none font-sans sm:h-[126px] sm:w-[320px]"
    />
  );
};

export default Monogram;
