import { describe, expect, test } from "vitest";

import { bloomAt, rampChar, starGlyph } from "./glyphField";

describe("bloomAt", () => {
  test("is invisible away from the cursor", () => {
    expect(bloomAt(0, 0, 500, 500, 100, [], 0)).toBe(0);
  });

  test("peaks at 0.95 under the cursor", () => {
    expect(bloomAt(10, 10, 10, 10, 100, [], 0)).toBeCloseTo(0.95, 2);
  });

  test("a ripple band is visible mid-flight and gone after 2s", () => {
    const ripples = [{ x: 0, y: 0, t: 0 }];
    // Cursor far away so only the ripple contributes.
    expect(bloomAt(240, 0, 9999, 9999, 100, ripples, 1)).toBeGreaterThan(0.4);
    expect(bloomAt(504, 0, 9999, 9999, 100, ripples, 2.1)).toBe(0);
  });
});

describe("starGlyph", () => {
  test("far stars are dots, near stars are hashes", () => {
    expect(starGlyph(1)).toBe(".");
    expect(starGlyph(0.05)).toBe("#");
  });
});

describe("rampChar", () => {
  test("spans blank to @", () => {
    expect(rampChar(0)).toBe(" ");
    expect(rampChar(1)).toBe("@");
  });
});
