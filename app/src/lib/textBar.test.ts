import { test, expect } from "vitest";
import { textBar } from "@/src/lib/textBar";

test("empty bar at 0%", () => {
  expect(textBar(0)).toBe("[░░░░░░░░░░] 0%");
});

test("62% fills six of ten cells", () => {
  expect(textBar(0.62)).toBe("[██████░░░░] 62%");
});

test("clamps above 1 to 100%", () => {
  expect(textBar(1.4)).toBe("[██████████] 100%");
});

test("NaN renders as 0%", () => {
  expect(textBar(NaN)).toBe("[░░░░░░░░░░] 0%");
});
