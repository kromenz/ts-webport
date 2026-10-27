"use client";

import { useEffect, useRef } from "react";

import { BOOT_KEY, BOOT_LINES } from "@/src/lib/boot";
import { siteReducedMotion } from "@/src/lib/motion";

const LINE_MS = 140;
const HOLD_MS = 220;
const FADE_MS = 300;
const REVEAL_MS = 1000;
const MAX_DPR = 2;
/**
 * The CSS failsafe hides the overlay 3 s after first paint. The sequence needs
 * about 1.3 s of timers plus the 300 ms fade, so it can only complete if it
 * starts before roughly 1.4 s. Start later than 1 s and the 0.4 s of margin
 * (timer drift on a loaded main thread) is gone: skip instead of being cut off.
 * Normal hydration lands well under that, so the boot still plays.
 */
const START_BUDGET_MS = 1000;

const MONO = '"Fira Code", ui-monospace, monospace';
const RAMP = " .:-=+*#%@";
const NOISE = "!%#_|*+=<>/\\01";
const CELL_W = 8;
const CELL_H = 14;

const hash = (a: number, b: number, c: number) => {
  const s = Math.sin(a * 127.1 + b * 311.7 + c * 74.7) * 43758.5453;
  return s - Math.floor(s);
};

/** "RA" in Geist 800, sampled to a luminance grid (one value per cell). */
function sampleMonogram(cols: number, rows: number, family: string) {
  const off = document.createElement("canvas");
  off.width = cols;
  off.height = rows;
  const o = off.getContext("2d");
  if (!o) return null;
  o.fillStyle = "#000";
  o.fillRect(0, 0, cols, rows);
  o.fillStyle = "#fff";
  o.textAlign = "center";
  o.textBaseline = "middle";
  // Cells are taller than wide, so squash the glyphs vertically to compensate.
  o.translate(cols / 2, rows / 2 + rows * 0.04);
  o.scale(1, (CELL_W / CELL_H) * 1.05);
  o.font = `800 ${Math.round(rows * 1.45)}px ${family}`;
  o.fillText("RA", 0, 0);
  const d = o.getImageData(0, 0, cols, rows).data;
  const lum = new Float32Array(cols * rows);
  for (let i = 0; i < lum.length; i++) lum[i] = d[i * 4] / 255;
  return lum;
}

/**
 * First-visit BIOS screen. The overlay markup is always in the server HTML and
 * CSS hides it unless the inline head script marked <html data-boot>, so there
 * is no hero flash and no JS means no overlay. Everything dynamic (log lines,
 * canvas) is written straight to the DOM from the effect, which keeps the
 * server and first client render identical.
 */
const BootSequence = () => {
  const overlayRef = useRef<HTMLDivElement>(null);
  const logRef = useRef<HTMLPreElement>(null);
  const whoRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const root = document.documentElement;
    const overlay = overlayRef.current;
    const log = logRef.current;
    const who = whoRef.current;
    const canvas = canvasRef.current;
    if (!overlay || !log || !who || !canvas || !root.dataset.boot) return;

    const timers: number[] = [];
    let raf = 0;
    let done = false;
    let disposed = false;

    const markBooted = () => {
      try {
        window.sessionStorage.setItem(BOOT_KEY, "1");
      } catch {
        /* storage unavailable: the boot just plays again next visit */
      }
    };

    const render = (n: number, withOk: boolean) => {
      log.innerHTML = BOOT_LINES.slice(0, n)
        .map(
          ([text, ok], i) =>
            text +
            (ok && (i < n - 1 || withOk)
              ? ' <span class="text-green-primary">[ OK ]</span>'
              : ""),
        )
        .join("\n");
    };

    const finish = () => {
      if (done) return;
      done = true;
      timers.forEach(clearTimeout);
      markBooted();
      render(BOOT_LINES.length, true);
      // The hero types its own "$ whoami" underneath. Dropping the overlay's
      // copy the instant the fade starts means the prompt is never on screen
      // twice; the hero's takes over as the overlay dissolves.
      who.style.opacity = "0";
      overlay.style.transition = `opacity ${FADE_MS}ms ease-out`;
      overlay.style.opacity = "0";
      overlay.style.pointerEvents = "none";
      timers.push(
        window.setTimeout(() => {
          delete root.dataset.boot;
          root.style.overflow = "";
        }, FADE_MS),
      );
    };

    const overlayHidden = () => getComputedStyle(overlay).visibility === "hidden";

    // Reduced motion, or hydration so late that the CSS failsafe has hidden
    // (or is about to hide) the overlay: no sequence, straight to the hero.
    if (
      siteReducedMotion() ||
      performance.now() > START_BUDGET_MS ||
      overlayHidden()
    ) {
      markBooted();
      delete root.dataset.boot;
      return;
    }

    root.style.overflow = "hidden";
    render(0, false);
    who.style.opacity = "0";

    let i = 0;
    const step = () => {
      if (done) return;
      // The failsafe fired mid-sequence (main thread starved): stop cleanly
      // rather than keep scroll locked under an invisible overlay.
      if (overlayHidden()) {
        done = true;
        timers.forEach(clearTimeout);
        markBooted();
        delete root.dataset.boot;
        root.style.overflow = "";
        return;
      }
      i += 1;
      render(i, true);
      if (i < BOOT_LINES.length) {
        timers.push(window.setTimeout(step, LINE_MS));
      } else {
        who.style.opacity = "1";
        timers.push(window.setTimeout(finish, HOLD_MS));
      }
    };
    timers.push(window.setTimeout(step, 60));

    // --- monogram -------------------------------------------------------
    const ctx = canvas.getContext("2d");
    const cssW = canvas.clientWidth;
    const cssH = canvas.clientHeight;
    if (ctx && cssW > 0 && cssH > 0) {
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      canvas.width = Math.round(cssW * dpr);
      canvas.height = Math.round(cssH * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const cols = Math.ceil(cssW / CELL_W);
      const rows = Math.ceil(cssH / CELL_H);
      const family = getComputedStyle(canvas).fontFamily;
      let lum: Float32Array | null = null;
      const t0 = performance.now();

      const draw = (now: number) => {
        if (disposed || done) return;
        raf = requestAnimationFrame(draw);
        if (document.hidden) return;
        if (!lum) lum = sampleMonogram(cols, rows, family);
        if (!lum) return;
        const t = (now - t0) / 1000;
        const p = Math.min(1, (now - t0) / REVEAL_MS);
        const eased = p * p * (3 - 2 * p);
        const tick = Math.floor(t * 14);
        ctx.clearRect(0, 0, cssW, cssH);
        ctx.font = `12px ${MONO}`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        for (let y = 0; y < rows; y++) {
          for (let x = 0; x < cols; x++) {
            const cx = x * CELL_W + CELL_W / 2;
            const cy = y * CELL_H + CELL_H / 2;
            if (hash(x, y, 1) >= eased) {
              if (hash(x, y, tick) > 0.55) continue;
              ctx.fillStyle = `rgba(226,232,240,${(0.08 + hash(y, x, tick) * 0.25).toFixed(3)})`;
              ctx.fillText(
                NOISE[Math.floor(hash(x, tick, y) * NOISE.length)],
                cx,
                cy,
              );
              continue;
            }
            const v = lum[y * cols + x];
            if (v < 0.08) continue;
            ctx.fillStyle =
              v > 0.6 ? "#34d399" : `rgba(52,211,153,${(0.25 + v * 0.6).toFixed(3)})`;
            ctx.fillText(RAMP[Math.max(1, Math.floor(v * (RAMP.length - 1)))], cx, cy);
          }
        }
      };
      const start = () => {
        if (!disposed && !done) raf = requestAnimationFrame(draw);
      };
      // Geist has to be ready for the canvas to sample it in 800.
      if (document.fonts?.load) {
        document.fonts.load(`800 40px ${family}`).then(start, start);
      } else {
        start();
      }
    }

    const skip = () => finish();
    window.addEventListener("keydown", skip);
    overlay.addEventListener("click", skip);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      timers.forEach(clearTimeout);
      window.removeEventListener("keydown", skip);
      overlay.removeEventListener("click", skip);
      root.style.overflow = "";
    };
  }, []);

  return (
    <div
      ref={overlayRef}
      className="boot-overlay fixed inset-0 z-[100] flex items-center justify-center bg-background px-5 font-mono text-[12.5px] leading-relaxed text-foreground/60">
      <div className="w-full max-w-md">
        <canvas
          ref={canvasRef}
          aria-hidden="true"
          className="mx-auto mb-5 block h-[140px] w-[320px] max-w-full font-sans"
        />
        <pre
          ref={logRef}
          aria-hidden="true"
          className="m-0 min-h-[10.5em] whitespace-pre-wrap"
        />
        <div ref={whoRef} className="mt-2.5 opacity-0">
          <span className="text-foreground/40">$</span>{" "}
          <span className="text-green-primary">whoami</span>
        </div>
        <button
          type="button"
          className="absolute right-4 top-4 rounded border border-foreground/20 px-2.5 py-1 text-xs text-foreground/60 hover:text-foreground focus-visible:outline-2 focus-visible:outline-green-primary">
          skip
        </button>
      </div>
    </div>
  );
};

export default BootSequence;
