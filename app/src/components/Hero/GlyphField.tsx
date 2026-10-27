"use client";

import { useEffect, useRef } from "react";

import { bloomAt, rampChar, starGlyph, type Ripple } from "@/src/lib/ascii/glyphField";
import { siteReducedMotion } from "@/src/lib/motion";

const FONT = '"Fira Code", ui-monospace, monospace';
const ACCENT = "#34d399";

const STAR_COUNT = 260;
const STAR_COUNT_LIGHT = 120;
const STAR_SPEED = 0.22;
const GRID_FONT_SIZE = 13;
const CELL_H = 17;
const MAX_DPR = 2;

/** Star glyph sizes run MIN..MAX px, one cached font string per size. */
const STAR_MIN_SIZE = 9;
const STAR_MAX_SIZE = 21;
const STAR_FONTS = Array.from(
  { length: STAR_MAX_SIZE - STAR_MIN_SIZE + 1 },
  (_, i) => `${STAR_MIN_SIZE + i}px ${FONT}`,
);
const GRID_FONT = `${GRID_FONT_SIZE}px ${FONT}`;

/** Alpha is quantised into LEVELS steps so fill strings are looked up, not built. */
const LEVELS = 32;
const STAR_FILLS = Array.from(
  { length: LEVELS },
  (_, i) => `rgba(226,232,240,${(0.15 + (i / (LEVELS - 1)) * 0.75).toFixed(3)})`,
);
const GRID_FILLS = Array.from(
  { length: LEVELS },
  (_, i) => `rgba(226,232,240,${(0.1 + (i / (LEVELS - 1)) * 0.55).toFixed(3)})`,
);

type Star = { x: number; y: number; z: number };

const makeStar = (z = Math.random()): Star => ({
  x: Math.random() * 2 - 1,
  y: Math.random() * 2 - 1,
  z,
});

/**
 * The hero's single canvas, two passes per frame: a starfield drawn in glyphs
 * that grow from "." to "#" as they approach, then a character-density grid
 * that is invisible at rest and only lights up around the cursor and ripples.
 *
 * The markup is a plain canvas, so server and client agree; every measurement
 * happens in the effect.
 */
const GlyphField = ({ className }: { className?: string }) => {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Pointer events are listened for on the hero section: the content sits
    // above this canvas, so the canvas itself never receives them.
    const host = wrap.parentElement?.closest("section") ?? wrap.parentElement ?? wrap;

    const still = siteReducedMotion();

    let width = 0;
    let height = 0;
    let cellW = 8;
    let light = false;
    let stars: Star[] = [];
    // Scratch space reused every frame: projected positions and per-size lists.
    let projX = new Float32Array(0);
    let projY = new Float32Array(0);
    const buckets: number[][] = STAR_FONTS.map(() => []);
    const ripples: Ripple[] = [];
    const pointer = { active: false, x: 0, y: 0 };
    const vanish = { x: 0, y: 0 };
    let frameId = 0;
    let running = false;
    let offscreen = false;
    let lastNow = 0;
    let clock = 0;

    const measureCell = () => {
      ctx.font = `${GRID_FONT_SIZE}px ${FONT}`;
      cellW = Math.max(6, ctx.measureText("M").width * 1.05);
    };

    const layout = () => {
      const rect = wrap.getBoundingClientRect();
      width = Math.max(1, Math.round(rect.width));
      height = Math.max(1, Math.round(rect.height));
      light = width < 640 || (navigator.hardwareConcurrency ?? 8) <= 4;

      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = light ? STAR_COUNT_LIGHT : STAR_COUNT;
      stars = Array.from({ length: count }, () => makeStar());
      projX = new Float32Array(count);
      projY = new Float32Array(count);
      measureCell();
    };

    const paintStars = (dt: number) => {
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      if (!still) {
        const tx = pointer.active ? (pointer.x / width - 0.5) * width * 0.5 : 0;
        const ty = pointer.active ? (pointer.y / height - 0.5) * height * 0.5 : 0;
        vanish.x += (tx - vanish.x) * 0.05;
        vanish.y += (ty - vanish.y) * 0.05;
      }
      const ox = width / 2 + vanish.x;
      const oy = height / 2 + vanish.y;

      // Pass A: advance and project, filing each visible star under its size
      // so the font is parsed once per size per frame, not once per star.
      for (const bucket of buckets) bucket.length = 0;
      for (let i = 0; i < stars.length; i++) {
        const star = stars[i];
        if (!still) {
          star.z -= STAR_SPEED * dt;
          if (star.z <= 0.02) Object.assign(star, makeStar(1));
        }
        const k = 0.5 / star.z;
        const sx = ox + star.x * width * k * 0.5;
        const sy = oy + star.y * height * k * 0.5;
        if (sx < -10 || sx > width + 10 || sy < -10 || sy > height + 10) continue;
        projX[i] = sx;
        projY[i] = sy;
        const size = Math.round(STAR_MIN_SIZE + (1 - star.z) * 12);
        buckets[size - STAR_MIN_SIZE].push(i);
      }

      // Pass B: draw bucket by bucket.
      for (let b = 0; b < buckets.length; b++) {
        const bucket = buckets[b];
        if (bucket.length === 0) continue;
        ctx.font = STAR_FONTS[b];
        for (const i of bucket) {
          const z = stars[i].z;
          const glyph = starGlyph(z);
          ctx.fillStyle =
            glyph === "*" || glyph === "#"
              ? ACCENT
              : STAR_FILLS[Math.round((1 - z) * (LEVELS - 1))];
          ctx.fillText(glyph, projX[i], projY[i]);
        }
      }
    };

    const paintGrid = (t: number) => {
      const radius = Math.min(width, height) * 0.45;
      // No cursor (touch or none): the focus drifts on a Lissajous path.
      const px = pointer.active
        ? pointer.x
        : width / 2 + Math.cos(t * 0.55) * width * 0.32;
      const py = pointer.active
        ? pointer.y
        : height / 2 + Math.sin(t * 0.83) * height * 0.3;

      const stepX = light ? cellW * 1.8 : cellW;
      const stepY = light ? CELL_H * 1.6 : CELL_H;
      const cols = Math.ceil(width / stepX);
      const rows = Math.ceil(height / stepY);

      // Nothing outside the cursor box or a live ripple's outer ring (radius
      // age*240 + band width) can be lit, so only those boxes are scanned.
      // Boxes are in pixels: [left, top, right, bottom].
      const boxes: number[][] = [[px - radius, py - radius, px + radius, py + radius]];
      for (const rp of ripples) {
        const age = t - rp.t;
        if (age < 0 || age >= 2) continue;
        const reach = age * 240 + 26;
        boxes.push([rp.x - reach, rp.y - reach, rp.x + reach, rp.y + reach]);
      }

      ctx.font = GRID_FONT;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const spans: number[][] = [];
      for (let r = 0; r < rows; r++) {
        const cy = r * stepY + stepY / 2;
        // Column ranges of every box touching this row, merged so no cell is
        // drawn twice.
        spans.length = 0;
        for (const box of boxes) {
          if (cy < box[1] - stepY / 2 || cy > box[3] + stepY / 2) continue;
          const a = Math.max(0, Math.floor(box[0] / stepX));
          const z = Math.min(cols, Math.ceil(box[2] / stepX));
          if (z > a) spans.push([a, z]);
        }
        if (spans.length === 0) continue;
        spans.sort((m, n) => m[0] - n[0]);
        let from = spans[0][0];
        let to = spans[0][1];
        const merged: number[][] = [];
        for (let s = 1; s < spans.length; s++) {
          if (spans[s][0] <= to) to = Math.max(to, spans[s][1]);
          else {
            merged.push([from, to]);
            from = spans[s][0];
            to = spans[s][1];
          }
        }
        merged.push([from, to]);

        for (const [c0, c1] of merged) {
          for (let c = c0; c < c1; c++) {
            const cx = c * stepX + stepX / 2;
            const v = bloomAt(cx, cy, px, py, radius, ripples, t);
            const ch = rampChar(v);
            if (ch === " ") continue;
            ctx.fillStyle =
              v > 0.56 ? ACCENT : GRID_FILLS[Math.round(v * (LEVELS - 1))];
            ctx.fillText(ch, cx, cy);
          }
        }
      }
    };

    const frame = (dt: number) => {
      ctx.clearRect(0, 0, width, height);
      paintStars(dt);
      if (!still) paintGrid(clock);
    };

    const tick = (now: number) => {
      frameId = requestAnimationFrame(tick);
      const dt = lastNow ? Math.min((now - lastNow) / 1000, 0.05) : 0;
      lastNow = now;
      clock += dt;
      for (let i = ripples.length - 1; i >= 0; i--) {
        if (clock - ripples[i].t > 2) ripples.splice(i, 1);
      }
      frame(dt);
    };

    const start = () => {
      if (running || still || offscreen || document.hidden) return;
      running = true;
      lastNow = 0;
      frameId = requestAnimationFrame(tick);
    };

    const stop = () => {
      if (!running) return;
      running = false;
      cancelAnimationFrame(frameId);
    };

    const local = (e: PointerEvent) => {
      const rect = wrap.getBoundingClientRect();
      return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      const p = local(e);
      pointer.active = true;
      pointer.x = p.x;
      pointer.y = p.y;
    };
    const onLeave = () => {
      pointer.active = false;
    };
    const onDown = (e: PointerEvent) => {
      const p = local(e);
      ripples.push({ x: p.x, y: p.y, t: clock });
    };
    const onVisibility = () => {
      if (document.hidden) stop();
      else start();
    };

    layout();
    frame(0);
    start();

    host.addEventListener("pointermove", onMove as EventListener);
    host.addEventListener("pointerleave", onLeave);
    host.addEventListener("pointerdown", onDown as EventListener);
    document.addEventListener("visibilitychange", onVisibility);

    const resizeObserver = new ResizeObserver(() => {
      layout();
      frame(0);
    });
    resizeObserver.observe(wrap);

    let cancelled = false;
    document.fonts?.ready.then(() => {
      if (cancelled) return;
      measureCell();
      if (!running) frame(0);
    });

    let intersectionObserver: IntersectionObserver | null = null;
    try {
      intersectionObserver = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            offscreen = !entry.isIntersecting;
            if (offscreen) stop();
            else start();
          }
        },
        { rootMargin: "120px" },
      );
      intersectionObserver.observe(wrap);
    } catch {
      // No observer available: the loop simply keeps running.
    }

    return () => {
      cancelled = true;
      stop();
      host.removeEventListener("pointermove", onMove as EventListener);
      host.removeEventListener("pointerleave", onLeave);
      host.removeEventListener("pointerdown", onDown as EventListener);
      document.removeEventListener("visibilitychange", onVisibility);
      resizeObserver.disconnect();
      intersectionObserver?.disconnect();
    };
  }, []);

  return (
    <div
      ref={wrapRef}
      aria-hidden
      className={`pointer-events-none absolute inset-0 ${className ?? ""}`}>
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
    </div>
  );
};

export default GlyphField;
