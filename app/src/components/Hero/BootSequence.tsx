"use client";

import { useEffect, useRef } from "react";

import { BOOT_KEY, BOOT_LINES } from "@/src/lib/boot";
import {
  CELL_H,
  CELL_W,
  drawMonogram,
  sampleMonogram,
} from "@/src/lib/ascii/monogram";
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
        drawMonogram(
          ctx,
          lum,
          cols,
          rows,
          cssW,
          cssH,
          (now - t0) / REVEAL_MS,
          (now - t0) / 1000,
        );
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
