"use client";

import { useEffect, useRef } from "react";

import { tokenStream } from "@/src/lib/ascii/tokens";
import { siteReducedMotion } from "@/src/lib/motion";

const FONT_SIZE = 14;
const COL_W = 15;
/** Wider columns when the device is small or weak. */
const COL_W_LIGHT = 26;
const GROUND = "#14141a";
const WIPE = "rgba(20, 20, 26, 0.07)";
const HEAD = "#d1fae5";
const TRAIL = "rgba(52, 211, 153, 0.9)";

type Column = {
  y: number;
  /** Pixels per second. */
  speed: number;
  acc: number;
  prev: string;
  cur: string;
  next: () => string;
};

/**
 * Stack tokens falling behind the 404 card. Each column advances one cell at
 * a time: the cell the head just left is repainted in green, the new one in
 * near-white, and a faint ground-coloured wipe each frame fades the rest.
 */
const TokenRain = () => {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const still = siteReducedMotion();

    let width = 0;
    let height = 0;
    let colW = COL_W;
    let cols: Column[] = [];
    let frameId = 0;
    let last = 0;
    let running = false;
    let offscreen = false;

    const reset = () => {
      cols = Array.from({ length: Math.ceil(width / colW) }, () => ({
        y: -Math.random() * height,
        speed: 70 + Math.random() * 120,
        acc: 0,
        prev: "",
        cur: "",
        next: tokenStream(),
      }));
    };

    const step = (dt: number) => {
      ctx.fillStyle = WIPE;
      ctx.fillRect(0, 0, width, height);
      ctx.font = `${FONT_SIZE}px "Fira Code", ui-monospace, monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "top";

      for (let i = 0; i < cols.length; i++) {
        const c = cols[i];
        c.acc += c.speed * dt;
        while (c.acc >= FONT_SIZE) {
          c.acc -= FONT_SIZE;
          const ch = c.next();
          c.prev = c.cur;
          c.cur = ch;
          c.y += FONT_SIZE;
          if (c.y > 0) {
            const x = i * colW;
            ctx.fillStyle = GROUND;
            ctx.fillRect(x, c.y - FONT_SIZE, colW, FONT_SIZE);
            if (c.prev && c.prev !== " ") {
              ctx.fillStyle = TRAIL;
              ctx.fillText(c.prev, x + colW / 2, c.y - FONT_SIZE);
            }
            if (ch !== " ") {
              ctx.fillStyle = HEAD;
              ctx.fillText(ch, x + colW / 2, c.y);
            }
          }
          if (c.y > height + Math.random() * height * 0.6) {
            c.y = -Math.random() * 80;
          }
        }
      }
    };

    const layout = () => {
      const rect = wrap.getBoundingClientRect();
      width = Math.max(1, Math.round(rect.width));
      height = Math.max(1, Math.round(rect.height));
      const light =
        width < 640 ||
        (navigator.hardwareConcurrency !== undefined &&
          navigator.hardwareConcurrency <= 4);
      colW = light ? COL_W_LIGHT : COL_W;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = GROUND;
      ctx.fillRect(0, 0, width, height);
      reset();

      if (still) {
        // One settled frame: let the rain fall for a moment, then stop.
        for (let i = 0; i < 90; i++) step(1 / 30);
      }
    };

    const tick = (now: number) => {
      frameId = requestAnimationFrame(tick);
      // Clamp so a returning tab does not teleport every column.
      const dt = Math.min((now - last) / 1000, 0.1);
      last = now;
      step(dt);
    };

    const start = () => {
      if (running || still || offscreen || document.hidden) return;
      running = true;
      last = performance.now();
      frameId = requestAnimationFrame(tick);
    };

    const stop = () => {
      if (!running) return;
      running = false;
      cancelAnimationFrame(frameId);
    };

    layout();
    start();

    const resizeObserver = new ResizeObserver(() => {
      layout();
      start();
    });
    resizeObserver.observe(wrap);

    let intersectionObserver: IntersectionObserver | null = null;
    try {
      intersectionObserver = new IntersectionObserver((entries) => {
        for (const entry of entries) {
          offscreen = !entry.isIntersecting;
          if (offscreen) stop();
          else start();
        }
      });
      intersectionObserver.observe(wrap);
    } catch {
      // No observer available: the loop simply keeps running.
    }

    const onVisibility = () => {
      if (document.hidden) stop();
      else start();
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      stop();
      resizeObserver.disconnect();
      intersectionObserver?.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <div
      ref={wrapRef}
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
    </div>
  );
};

export default TokenRain;
