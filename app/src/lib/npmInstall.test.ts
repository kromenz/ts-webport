import { expect, test } from "vitest";
import { installFrame, toPackageName } from "./npmInstall";

test("toPackageName kebab-cases", () => {
  expect(toPackageName("Customer Service")).toBe("customer-service");
  expect(toPackageName("Working Under Pressure")).toBe(
    "working-under-pressure",
  );
});

test("installFrame final state, singular for one package", () => {
  expect(installFrame(["A b"], 1, 0)).toEqual(["+ a-b", "", "added 1 package"]);
});

test("installFrame final state when pkgIndex is past the end", () => {
  expect(installFrame(["x", "y"], 9, 0).at(-1)).toBe("added 2 packages");
});

test("installFrame active line shows a 10-cell bar", () => {
  const lines = installFrame(["x", "y"], 0, 5);
  expect(lines.at(-1)).toMatch(/fetching x \[█{5}░{5}\]/);
});
