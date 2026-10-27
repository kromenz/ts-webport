import { expect, test } from "vitest";
import { PROFILE, PROJECTS, WORK_EXPERIENCE } from "@/src/data/data";
import { experienceOutput, projectsOutput } from "./sectionPrompts";

test("experienceOutput pluralises commits", () => {
  expect(experienceOutput([1, 2, 3], 2022)).toBe("3 commits since 2022");
  expect(experienceOutput([1], 2022)).toBe("1 commit since 2022");
  expect(experienceOutput([], 2022)).toBe("0 commits since 2022");
});

test("projectsOutput counts projects and distinct types", () => {
  expect(
    projectsOutput([{ type: "a" }, { type: "a" }, { type: "b" }]),
  ).toBe("3 projects · 2 categories");
});

test("projectsOutput uses singulars", () => {
  expect(projectsOutput([{ type: "a" }])).toBe("1 project · 1 category");
});

test("real data produces sane output", () => {
  expect(experienceOutput(WORK_EXPERIENCE, PROFILE.since)).toMatch(
    /^\d+ commits since 2022$/,
  );
  expect(projectsOutput(PROJECTS)).toMatch(/^\d+ projects · 3 categories$/);
});
