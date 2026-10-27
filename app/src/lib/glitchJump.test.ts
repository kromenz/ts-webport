import { describe, expect, it, vi } from "vitest";
import { createGlitchJumper } from "./glitchJump";

const flush = () => new Promise<void>((r) => setTimeout(r));

function setup(reduced = false, missing = false) {
  const els: Record<string, { scrollIntoView: ReturnType<typeof vi.fn> }> = {
    a: { scrollIntoView: vi.fn() },
    b: { scrollIntoView: vi.fn() },
  };
  let mid: () => void = () => {};
  let done: () => void = () => {};
  let fail: (e: unknown) => void = () => {};
  const run = vi.fn(
    (_root: HTMLElement, onMid: () => void) =>
      new Promise<void>((res, rej) => {
        mid = onMid;
        done = res;
        fail = rej;
      }),
  );
  const jump = createGlitchJumper({
    target: (id) =>
      missing ? null : ((els[id] as unknown as HTMLElement) ?? null),
    root: () => ({}) as HTMLElement,
    run,
    reduced: () => reduced,
  });
  return {
    els,
    run,
    jump,
    mid: () => mid(),
    done: () => done(),
    fail: (e: unknown) => fail(e),
  };
}

describe("createGlitchJumper", () => {
  it("jumps once, to the last id, when called during a glitch", async () => {
    const s = setup();
    s.jump("a");
    s.jump("b");
    expect(s.run).toHaveBeenCalledTimes(1);
    s.mid();
    s.done();
    await flush();
    expect(s.els.a.scrollIntoView).not.toHaveBeenCalled();
    expect(s.els.b.scrollIntoView).toHaveBeenCalledTimes(1);
    expect(s.els.b.scrollIntoView).toHaveBeenCalledWith({ behavior: "instant" });
  });

  it("allows a new glitch after the previous one finished", async () => {
    const s = setup();
    s.jump("a");
    s.mid();
    s.done();
    await flush();
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

  it("lands a call made after mid right after the run ends", async () => {
    const s = setup();
    s.jump("a");
    s.mid();
    expect(s.els.a.scrollIntoView).toHaveBeenCalledTimes(1);
    s.jump("b");
    expect(s.els.b.scrollIntoView).not.toHaveBeenCalled();
    s.done();
    await flush();
    expect(s.run).toHaveBeenCalledTimes(1);
    expect(s.els.b.scrollIntoView).toHaveBeenCalledTimes(1);
    expect(s.els.b.scrollIntoView).toHaveBeenCalledWith({ behavior: "instant" });
  });

  it("does not re-land the same id when called again after mid", async () => {
    const s = setup();
    s.jump("a");
    s.mid();
    s.jump("a");
    s.done();
    await flush();
    expect(s.els.a.scrollIntoView).toHaveBeenCalledTimes(1);
  });

  it("stays usable and lands the target when run throws synchronously", async () => {
    const s = setup();
    s.run.mockImplementationOnce(() => {
      throw new Error("boom");
    });
    s.jump("a");
    await flush();
    expect(s.els.a.scrollIntoView).toHaveBeenCalledTimes(1);
    s.jump("b");
    expect(s.run).toHaveBeenCalledTimes(2);
    s.mid();
    s.done();
    await flush();
    expect(s.els.b.scrollIntoView).toHaveBeenCalledTimes(1);
  });

  it("stays usable when run rejects", async () => {
    const s = setup();
    s.jump("a");
    s.fail(new Error("boom"));
    await flush();
    expect(s.els.a.scrollIntoView).toHaveBeenCalledTimes(1);
    s.jump("b");
    expect(s.run).toHaveBeenCalledTimes(2);
  });
});
