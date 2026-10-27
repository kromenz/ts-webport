import { describe, expect, test } from "vitest";
import { BOOT_LINES, BOOT_SCRIPT, shouldBoot } from "@/src/lib/boot";
import { PROJECTS, WORK_EXPERIENCE } from "@/src/data/data";

describe("shouldBoot", () => {
  test("false without storage", () => {
    expect(shouldBoot(null, "")).toBe(false);
  });
  test("false when getItem throws", () => {
    expect(
      shouldBoot(
        {
          getItem: () => {
            throw new Error();
          },
        },
        "",
      ),
    ).toBe(false);
  });
  test("false once booted", () => {
    expect(shouldBoot({ getItem: () => "1" }, "")).toBe(false);
  });
  test("false on a deep link", () => {
    expect(shouldBoot({ getItem: () => null }, "#projects")).toBe(false);
  });
  test("true on a clean first visit", () => {
    expect(shouldBoot({ getItem: () => null }, "")).toBe(true);
  });
});

describe("boot data", () => {
  test("mount counts come from the data", () => {
    const text = BOOT_LINES.map(([t]) => t).join("\n");
    expect(text).toContain(`mounting /experience (${WORK_EXPERIENCE.length})`);
    expect(text).toContain(`mounting /projects (${PROJECTS.length})`);
  });
  test("script is guarded and sets the flag", () => {
    expect(BOOT_SCRIPT).toContain("try");
    expect(BOOT_SCRIPT).toContain("dataset.boot");
  });
});
