import { describe, expect, it } from "vitest";
import { readSoundPref, writeSoundPref } from "./useSound";

const throwing = {
  getItem(): string | null {
    throw new Error("blocked");
  },
  setItem(): void {
    throw new Error("blocked");
  },
};

describe("sound preference storage", () => {
  it("reads off when storage throws or is missing", () => {
    expect(readSoundPref(throwing)).toBe(false);
    expect(readSoundPref(null)).toBe(false);
  });
  it("does not throw on write when storage throws", () => {
    expect(() => writeSoundPref(true, throwing)).not.toThrow();
  });
  it("round-trips", () => {
    const m = new Map<string, string>();
    const s = {
      getItem: (k: string) => m.get(k) ?? null,
      setItem: (k: string, v: string) => void m.set(k, v),
    };
    expect(readSoundPref(s)).toBe(false);
    writeSoundPref(true, s);
    expect(readSoundPref(s)).toBe(true);
    writeSoundPref(false, s);
    expect(readSoundPref(s)).toBe(false);
  });
});
