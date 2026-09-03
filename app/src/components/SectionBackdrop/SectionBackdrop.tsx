"use client";

import { useEffect, useRef } from "react";

import { siteReducedMotion } from "@/src/lib/motion";

const CHARS = "01{}[]()<>/\\|;:=+-*#$&%_abcdefghijklmnopqrstuvwxyz";

/** Fraction of the width, each side, that the texture is confined to. */
const BAND = 0.32;
/** Glyph column spacing in CSS pixels. Lower packs the bands tighter. */
const STEP = 18;
/** Falling glyphs per column, each with its own speed and start height. */
const DROPS_PER_COLUMN = 2;
/** Peak glyph opacity, at the outer edge of a band. */
const GLYPH_ALPHA = 0.34;
/** Per-frame wipe. Lower leaves a longer trail behind each glyph. */
const GLYPH_TRAIL = 0.18;
/** Distance at which two nodes are linked. Must stay above the mean spacing
    implied by NODE_AREA, or the field reads as loose dots and not a network. */
const LINK = 124;
/** One node per this many square pixels of band. */
const NODE_AREA = 7500;
/** Fraction of the band, measured from the card, over which texture fades.
    The rest runs at full strength. A fade across the whole band halved every
    value, and the graph multiplies two fades together. */
const FADE_ZONE = 0.45;
/** Texture like this is indistinguishable at 30fps and costs half as much. */
const FRAME_MS = 33;

type Glyph = {
  x: number;
  y: number;
  speed: number;
  alpha: number;
  ch: string;
};

type Node = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  minX: number;
  maxX: number;
  /** Which band the node belongs to, so edges never jump the card. */
  band: 0 | 1;
};

const pick = () => CHARS[Math.floor(Math.random() * CHARS.length)];

/** The grid is the constant; this is the layer that changes per section. */
export type BackdropVariant = "glyph" | "graph";

type Props = {
  variant?: BackdropVariant;
  className?: string;
};

/**
 * Two stacked layers behind a section's card: a drifting grid for structure
 * and one of two textures for character. They read as separate layers because
 * they differ in scale, not because they differ in kind.
 *
 * Both textures live in two bands at the edges, and the canvas only ever
 * repaints those bands. The card above is opaque, so anything drawn behind it
 * would be invisible as well as expensive.
 */
const SectionBackdrop = ({ variant = "glyph", className }: Props) => {
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
    let band = 0;
    let glyphs: Glyph[] = [];
    let nodes: Node[] = [];
    let frameId = 0;
    let lastFrame = 0;
    let running = false;
    let offscreen = false;

    /** 1 across most of a band, ramping to 0 only where it meets the card. */
    const nearness = (x: number) => {
      let t: number;
      if (x <= band) t = 1 - x / band;
      else if (x >= width - band) t = (x - (width - band)) / band;
      else return 0;
      return Math.min(1, t / FADE_ZONE);
    };

    const paintGlyphs = (advance: boolean) => {
      // Wiping in the page ground colour is what leaves the trail behind each
      // glyph; a solid wipe gives the still frame.
      ctx.fillStyle = advance
        ? `rgba(20, 20, 26, ${GLYPH_TRAIL})`
        : "#14141a";
      ctx.fillRect(0, 0, band, height);
      ctx.fillRect(width - band, 0, band, height);

      ctx.font = '12px "Fira Code", ui-monospace, monospace';
      for (const glyph of glyphs) {
        ctx.fillStyle = `rgba(52, 211, 153, ${glyph.alpha.toFixed(3)})`;
        ctx.fillText(glyph.ch, glyph.x, glyph.y);
        if (!advance) continue;
        glyph.y += glyph.speed;
        if (Math.random() < 0.03) glyph.ch = pick();
        if (glyph.y > height + 12) {
          glyph.y = -12;
          glyph.speed = 0.3 + Math.random() * 0.7;
        }
      }
    };

    const paintGraph = (advance: boolean) => {
      // No trails here, so the bands clear to transparent and the grid
      // underneath keeps showing through.
      ctx.clearRect(0, 0, band, height);
      ctx.clearRect(width - band, 0, band, height);

      if (advance) {
        for (const node of nodes) {
          node.x += node.vx;
          node.y += node.vy;
          if (node.x < node.minX || node.x > node.maxX) node.vx *= -1;
          if (node.y < 0 || node.y > height) node.vy *= -1;
        }
      }

      ctx.lineWidth = 1;
      for (let a = 0; a < nodes.length; a++) {
        const na = nodes[a];
        for (let b = a + 1; b < nodes.length; b++) {
          const nb = nodes[b];
          if (na.band !== nb.band) continue;
          const dx = na.x - nb.x;
          const dy = na.y - nb.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist >= LINK) continue;
          // Edges dissolve both with distance and toward the card.
          const fade =
            (1 - dist / LINK) * ((nearness(na.x) + nearness(nb.x)) / 2);
          ctx.strokeStyle = `rgba(52, 211, 153, ${(0.4 * fade).toFixed(3)})`;
          ctx.beginPath();
          ctx.moveTo(na.x, na.y);
          ctx.lineTo(nb.x, nb.y);
          ctx.stroke();
        }
      }

      for (const node of nodes) {
        const fade = nearness(node.x);
        if (fade <= 0.02) continue;
        ctx.fillStyle = `rgba(52, 211, 153, ${(0.85 * fade).toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(node.x, node.y, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const paint = (advance: boolean) =>
      variant === "graph" ? paintGraph(advance) : paintGlyphs(advance);

    const layout = () => {
      const rect = wrap.getBoundingClientRect();
      width = Math.max(1, Math.round(rect.width));
      height = Math.max(1, Math.round(rect.height));
      band = Math.max(1, Math.round(width * BAND));

      // Deliberately 1, not devicePixelRatio. This is decorative texture at
      // low alpha, and retina backing would quadruple the fill cost of a
      // layer that repaints every frame.
      canvas.width = width;
      canvas.height = height;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, width, height);

      glyphs = [];
      nodes = [];

      if (variant === "graph") {
        const perBand = Math.max(
          14,
          Math.min(80, Math.round((band * height) / NODE_AREA)),
        );
        const spawn = (minX: number, maxX: number, index: 0 | 1) => {
          for (let i = 0; i < perBand; i++) {
            nodes.push({
              x: minX + Math.random() * (maxX - minX),
              y: Math.random() * height,
              vx: (Math.random() - 0.5) * 0.2,
              vy: (Math.random() - 0.5) * 0.2,
              minX,
              maxX,
              band: index,
            });
          }
        };
        spawn(0, band, 0);
        spawn(width - band, width, 1);
      } else {
        const column = (x: number) => {
          const alpha = GLYPH_ALPHA * nearness(x);
          for (let d = 0; d < DROPS_PER_COLUMN; d++) {
            glyphs.push({
              x,
              y: Math.random() * height,
              speed: 0.3 + Math.random() * 0.7,
              alpha,
              ch: pick(),
            });
          }
        };
        for (let x = 0; x < band; x += STEP) column(x);
        for (let x = width - band; x < width; x += STEP) column(x);
      }

      paint(false);
    };

    const tick = (now: number) => {
      frameId = requestAnimationFrame(tick);
      if (now - lastFrame < FRAME_MS) return;
      lastFrame = now;
      paint(true);
    };

    const start = () => {
      if (running || still) return;
      running = true;
      frameId = requestAnimationFrame(tick);
    };

    const stop = () => {
      if (!running) return;
      running = false;
      cancelAnimationFrame(frameId);
    };

    layout();

    // Start here, not in the observer callback. The observer only pauses a
    // loop that is already running, so a late or missing callback can never
    // be the reason the layer sits dead.
    start();

    const resizeObserver = new ResizeObserver(() => {
      layout();
      if (!running && !offscreen) start();
    });
    resizeObserver.observe(wrap);

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
      stop();
      resizeObserver.disconnect();
      intersectionObserver?.disconnect();
    };
  }, [variant]);

  return (
    <div
      ref={wrapRef}
      aria-hidden
      className={`pointer-events-none absolute inset-0 -z-10 overflow-hidden ${
        className ?? ""
      }`}>
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      <div className="backdrop-grid absolute inset-0" />

      {/* Static gradients rather than a mask: a mask on a layer that repaints
          every frame forces the compositor to redo the whole thing. */}
      <div className="absolute inset-x-0 top-0 h-28 bg-linear-to-b from-background to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-28 bg-linear-to-t from-background to-transparent" />
    </div>
  );
};

export default SectionBackdrop;
