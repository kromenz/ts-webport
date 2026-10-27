/**
 * Shared "RA" monogram: sampling plus the pure per-cell reveal maths used by
 * the boot overlay and the contact card. No module-level DOM access.
 */

export const MONO = '"Fira Code", ui-monospace, monospace';
export const RAMP = " .:-=+*#%@";
export const NOISE = "!%#_|*+=<>/\\01";
export const CELL_W = 8;
export const CELL_H = 14;
/** Noise ticks per second. */
export const TICK_HZ = 14;

export const hash = (a: number, b: number, c: number) => {
  const s = Math.sin(a * 127.1 + b * 311.7 + c * 74.7) * 43758.5453;
  return s - Math.floor(s);
};

/** Smoothstep of linear progress 0..1. */
export const ease = (p: number) => p * p * (3 - 2 * p);

export const noiseTick = (seconds: number) => Math.floor(seconds * TICK_HZ);

/** A cell is locked in once the eased progress passes its hash threshold. */
export const isRevealed = (x: number, y: number, eased: number) =>
  hash(x, y, 1) < eased;

/** True for a revealed cell that locked in within the last `window` of eased progress. */
export const isFresh = (x: number, y: number, eased: number, window = 0.15) =>
  eased < 1 && hash(x, y, 1) >= eased - window;

/** Colour of a locked cell: green while fresh (or when not settling), else the quiet tint. */
export function lockedColor(
  x: number,
  y: number,
  eased: number,
  v: number,
  settled?: number,
) {
  const c = lockedCell(v);
  if (!c) return null;
  if (settled === undefined || isFresh(x, y, eased)) return c.color;
  return `rgba(226,232,240,${(settled * (0.45 + v * 0.55)).toFixed(3)})`;
}

/** Noise glyph for a not-yet-revealed cell, or null when it blinks off. */
export function noiseCell(x: number, y: number, tick: number) {
  if (hash(x, y, tick) > 0.55) return null;
  return {
    char: NOISE[Math.floor(hash(x, tick, y) * NOISE.length)],
    alpha: 0.08 + hash(y, x, tick) * 0.25,
  };
}

/** Glyph and green for a revealed cell of luminance v, or null if empty. */
export function lockedCell(v: number) {
  if (v < 0.08) return null;
  return {
    char: RAMP[Math.max(1, Math.floor(v * (RAMP.length - 1)))],
    color: v > 0.6 ? "#34d399" : `rgba(52,211,153,${(0.25 + v * 0.6).toFixed(3)})`,
  };
}

/** "RA" in Geist 800, sampled to a luminance grid (one value per cell). */
export function sampleMonogram(cols: number, rows: number, family: string) {
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
 * Paint one frame. `progress` is linear 0..1; 1 draws the settled monogram.
 * Default look is the boot's green. With `settled` set, locked cells use a
 * foreground tint at `settled` alpha and only freshly locked cells flash green.
 */
export function drawMonogram(
  ctx: CanvasRenderingContext2D,
  lum: Float32Array,
  cols: number,
  rows: number,
  cssW: number,
  cssH: number,
  progress: number,
  seconds: number,
  opts: { settled?: number } = {},
) {
  const eased = ease(Math.min(1, progress));
  const tick = noiseTick(seconds);
  ctx.clearRect(0, 0, cssW, cssH);
  ctx.font = `12px ${MONO}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const cx = x * CELL_W + CELL_W / 2;
      const cy = y * CELL_H + CELL_H / 2;
      if (!isRevealed(x, y, eased)) {
        const n = noiseCell(x, y, tick);
        if (!n) continue;
        ctx.fillStyle = `rgba(226,232,240,${n.alpha.toFixed(3)})`;
        ctx.fillText(n.char, cx, cy);
        continue;
      }
      const v = lum[y * cols + x];
      const c = lockedCell(v);
      if (!c) continue;
      ctx.fillStyle = lockedColor(x, y, eased, v, opts.settled) ?? c.color;
      ctx.fillText(c.char, cx, cy);
    }
  }
}
