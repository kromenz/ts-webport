import { expect, test } from "vitest";
import { WORK_EXPERIENCE } from "@/src/data/data";
import { branchSpans, buildCommits, shortHash } from "./gitGraph";

test("shortHash is 7 lowercase hex chars and deterministic", () => {
  expect(shortHash("a")).toMatch(/^[0-9a-f]{7}$/);
  expect(shortHash("a")).toBe(shortHash("a"));
  expect(shortHash("a")).not.toBe(shortHash("b"));
});

test("buildCommits is newest first with HEAD on Alongside", () => {
  const commits = buildCommits(WORK_EXPERIENCE);
  expect(WORK_EXPERIENCE[commits[0].index].title).toBe("Alongside");
  expect(commits.map((c) => c.isHead)).toEqual([
    true,
    false,
    false,
    false,
    false,
  ]);
});

test("exactly one commit is on lane 1: the summer internship", () => {
  const commits = buildCommits(WORK_EXPERIENCE);
  const lane1 = commits.filter((c) => c.lane === 1);
  expect(lane1).toHaveLength(1);
  expect(WORK_EXPERIENCE[lane1[0].index].position).toBe("Summer Internship");
});

test("branchSpans merges into the intern commit and forks from Petiscas", () => {
  const commits = buildCommits(WORK_EXPERIENCE);
  const positions = commits.map((c) => WORK_EXPERIENCE[c.index].position);
  expect(positions).toEqual([
    "Software Engineer",
    "Junior Backend Developer",
    "Software Developer Intern",
    "Summer Internship",
    "Waiter",
  ]);
  expect(branchSpans(commits)).toEqual([{ merge: 2, branch: 3, fork: 4 }]);
});
