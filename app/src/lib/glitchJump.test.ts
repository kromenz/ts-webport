import { describe, expect, it, vi } from "vitest";
import { createGlitchJumper } from "./glitchJump";

function setup(reduced = false, missing = false) {
  const els: Record<string, { scrollIntoView: ReturnType<typeof vi.fn> }> = {
    a: { scrollIntoView: vi.fn() },
    b: { scrollIntoView: vi.fn() },
  };
  let mid: () => void = () => {};
  let done: () => void = () => {};
  const run = vi.fn(
    (_root: HTMLElement, onMid: () => void) =>
      new Promise<void>((res) => {
        mid = onMid;
        done = res;
      }),
  );
  const jump = createGlitchJumper({
    target: (id) =>
      missing ? null : ((els[id] as unknown as HTMLElement) ?? null),
    root: () => ({}) as HTMLElement,
    run,
    reduced: () => reduced,
  });
  return { els, run, jump, mid: () => mid(), done: () => done() };
}

describe("createGlitchJumper", () => {
  it("jumps once, to the last id, when called during a glitch", async () => {
    const s = setup();
    s.jump("a");
    s.jump("b");
    expect(s.run).toHaveBeenCalledTimes(1);
    s.mid();
    s.done();
    await Promise.resolve();
    expect(s.els.a.scrollIntoView).not.toHaveBeenCalled();
    expect(s.els.b.scrollIntoView).toHaveBeenCalledTimes(1);
    expect(s.els.b.scrollIntoView).toHaveBeenCalledWith({ behavior: "instant" });
  });

  it("allows a new glitch after the previous one finished", async () => {
    const s = setup();
    s.jump("a");
    s.mid();
    s.done();
    await Promise.resolve();
    await Promise.resolve();
    s.jump("b");
    expect(s.run).toHaveBeenCalledTimes(2);
  });

  it("does nothing for a missing target", () => {
    const s = setup(false, true);
    s.jump("a");
    expect(s.run).not.toHaveBeenCalled();
  });

  it("scrolls instantly under reduced motion without running", () => {
    const s = setup(true);
    s.jump("a");
    expect(s.run).not.toHaveBeenCalled();
    expect(s.els.a.scrollIntoView).toHaveBeenCalledWith({ behavior: "instant" });
  });
});
