import { describe, expect, test } from "vitest";

import {
  NOISE,
  RAMP,
  ease,
  hash,
  isFresh,
  isRevealed,
  lockedCell,
  lockedColor,
  noiseCell,
  noiseTick,
} from "./monogram";

describe("monogram maths", () => {
  test("hash is deterministic and in [0,1)", () => {
    expect(hash(3, 4, 5)).toBe(hash(3, 4, 5));
    for (let i = 0; i < 200; i++) {
      const h = hash(i, i * 7, 3);
      expect(h).toBeGreaterThanOrEqual(0);
      expect(h).toBeLessThan(1);
    }
  });

  test("ease maps 0 to 0 and 1 to 1", () => {
    expect(ease(0)).toBe(0);
    expect(ease(1)).toBe(1);
    expect(ease(0.5)).toBe(0.5);
  });

  test("no cell is revealed at 0, every cell at 1", () => {
    for (let y = 0; y < 10; y++) {
      for (let x = 0; x < 10; x++) {
        expect(isRevealed(x, y, 0)).toBe(false);
        expect(isRevealed(x, y, 1)).toBe(true);
      }
    }
  });

  test("revealed set only grows with progress", () => {
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        if (isRevealed(x, y, 0.3)) expect(isRevealed(x, y, 0.6)).toBe(true);
      }
    }
  });

  test("noiseTick steps at 14 Hz", () => {
    expect(noiseTick(0)).toBe(0);
    expect(noiseTick(1)).toBe(14);
  });

  test("noiseCell yields a NOISE glyph with a faint alpha, or null", () => {
    let shown = 0;
    for (let t = 0; t < 50; t++) {
      const n = noiseCell(2, 3, t);
      if (!n) continue;
      shown++;
      expect(NOISE).toContain(n.char);
      expect(n.alpha).toBeGreaterThanOrEqual(0.08);
      expect(n.alpha).toBeLessThan(0.33);
    }
    expect(shown).toBeGreaterThan(0);
    expect(shown).toBeLessThan(50);
  });

  test("lockedCell maps luminance to glyph and colour", () => {
    expect(lockedCell(0)).toBeNull();
    expect(lockedCell(0.05)).toBeNull();
    expect(lockedCell(1)).toEqual({ char: RAMP[RAMP.length - 1], color: "#34d399" });
    const mid = lockedCell(0.3)!;
    expect(mid.char).not.toBe(" ");
    expect(mid.color).toMatch(/^rgba\(52,211,153,/);
  });
});

describe("isFresh / lockedColor", () => {
  test("at settled progress (eased === 1) no cell is fresh", () => {
    for (let y = 0; y < 20; y++) {
      for (let x = 0; x < 20; x++) expect(isFresh(x, y, 1)).toBe(false);
    }
  });

  test("mid-reveal some just-locked cells are fresh", () => {
    let fresh = 0;
    for (let x = 0; x < 200; x++) if (isFresh(x, 0, 0.5)) fresh++;
    expect(fresh).toBeGreaterThan(0);
  });

  test("settled frame colours every locked cell with the quiet tint", () => {
    for (let y = 0; y < 20; y++) {
      for (let x = 0; x < 20; x++) {
        expect(lockedColor(x, y, 1, 1, 0.3)).toMatch(/^rgba\(226,232,240,/);
      }
    }
  });

  test("without settled the boot's green is kept", () => {
    expect(lockedColor(1, 1, 1, 1)).toBe("#34d399");
  });
});
