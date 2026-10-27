/** Density ramp, empty to full. */
export const RAMP = " .·:-=+*#%@";

/** Star glyphs, far to near. */
export const STAR_GLYPHS = [".", "·", "+", "*", "#"];

export type Ripple = { x: number; y: number; t: number };

const RIPPLE_WIDTH = 26;
const RIPPLE_SPEED = 240;
const RIPPLE_LIFE = 2;

/**
 * Brightness (0..1) of the density grid at a point. There is deliberately no
 * ambient term: away from the cursor and the ripples the grid is invisible.
 */
export function bloomAt(
  cx: number,
  cy: number,
  px: number,
  py: number,
  radius: number,
  ripples: Ripple[],
  t: number,
): number {
  const d = Math.hypot(cx - px, cy - py);
  let v = Math.max(0, 1 - d / radius) ** 1.6 * 0.95;
  for (const rp of ripples) {
    const age = t - rp.t;
    if (age < 0 || age >= RIPPLE_LIFE) continue;
    const band =
      1 - Math.abs(Math.hypot(cx - rp.x, cy - rp.y) - age * RIPPLE_SPEED) / RIPPLE_WIDTH;
    if (band > 0) v += band * (1 - age / RIPPLE_LIFE) * 0.9;
  }
  return Math.min(1, Math.max(0, v));
}

/** Star glyph for depth z in (0, 1]; nearer (smaller z) is bigger. */
export function starGlyph(z: number): string {
  const near = 1 - Math.min(1, Math.max(0, z));
  const i = Math.min(
    STAR_GLYPHS.length - 1,
    Math.floor(near * near * STAR_GLYPHS.length * 1.1),
  );
  return STAR_GLYPHS[i];
}

/** Ramp character for a 0..1 density. */
export function rampChar(v: number): string {
  const clamped = Math.min(1, Math.max(0, v));
  return RAMP[Math.floor(clamped * (RAMP.length - 1))];
}
