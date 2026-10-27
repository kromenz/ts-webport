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
  test("false off the home page", () => {
    expect(shouldBoot({ getItem: () => null }, "", "/nope")).toBe(false);
  });
  test("true on a clean first visit", () => {
    expect(shouldBoot({ getItem: () => null }, "")).toBe(true);
    expect(shouldBoot({ getItem: () => null }, "", "/")).toBe(true);
  });
});

/** Runs the real inline script against stubbed globals; returns data-boot. */
function runScript(
  storage: { getItem: (k: string) => string | null } | "throws" | "absent",
  hash: string,
  pathname = "/",
) {
  const dataset: Record<string, string> = {};
  const win =
    storage === "absent"
      ? {}
      : {
          get sessionStorage() {
            if (storage === "throws") throw new Error("denied");
            return storage;
          },
        };
  new Function("window", "location", "document", BOOT_SCRIPT)(
    win,
    { hash, pathname },
    { documentElement: { dataset } },
  );
  return dataset.boot;
}

describe("BOOT_SCRIPT mirrors shouldBoot", () => {
  const none = { getItem: () => null };
  test("clean first visit sets the flag", () => {
    expect(runScript(none, "")).toBe("1");
  });
  test("already booted does not", () => {
    expect(runScript({ getItem: () => "1" }, "")).toBeUndefined();
  });
  test("other routes do not", () => {
    expect(runScript(none, "", "/nope")).toBeUndefined();
  });
  test("deep link does not", () => {
    expect(runScript(none, "#projects")).toBeUndefined();
  });
  test("throwing storage does not, and does not throw", () => {
    expect(runScript("throws", "")).toBeUndefined();
  });
  test("getItem throwing does not", () => {
    const bad = {
      getItem: () => {
        throw new Error();
      },
    };
    expect(runScript(bad, "")).toBeUndefined();
  });
  test("missing storage does not", () => {
    expect(runScript("absent", "")).toBeUndefined();
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
