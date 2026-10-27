import { expect, test } from "vitest";
import { pushFrames, pushResult, validateCommit } from "@/src/lib/commitPush";

const ok = { subject: "Hello", message: "Hi Rafael", from: "a@b.co" };

test("valid commit has no errors", () => {
  expect(validateCommit(ok)).toEqual([]);
});

test("subject length bounds", () => {
  expect(validateCommit({ ...ok, subject: "" })).toContain(
    "error: empty commit message subject",
  );
  expect(validateCommit({ ...ok, subject: "   " }).length).toBe(1);
  expect(validateCommit({ ...ok, subject: "x" })).toEqual([]);
  expect(validateCommit({ ...ok, subject: "x".repeat(200) })).toEqual([]);
  expect(validateCommit({ ...ok, subject: "x".repeat(201) })).toEqual([
    "error: subject too long (max 200 characters)",
  ]);
});

test("message length bounds", () => {
  expect(validateCommit({ ...ok, message: "abcd" })).toEqual([
    "error: message too short (min 5 characters)",
  ]);
  expect(validateCommit({ ...ok, message: "abcde" })).toEqual([]);
  expect(validateCommit({ ...ok, message: "x".repeat(5001) })).toEqual([
    "error: message too long (max 5000 characters)",
  ]);
});

test("email validation", () => {
  expect(validateCommit({ ...ok, from: "nope" })).toEqual([
    "error: invalid author email",
  ]);
  expect(validateCommit({ ...ok, from: "a b@c.de" }).length).toBe(1);
  expect(validateCommit({ ...ok, from: "you@company.com" })).toEqual([]);
});

test("multiple errors accumulate", () => {
  expect(validateCommit({ subject: "", message: "", from: "" }).length).toBe(3);
});

test("pushFrames", () => {
  expect(pushFrames(0)).toEqual([
    "$ git push origin hello",
    "Enumerating objects: 3, done.",
    "Writing objects:   0% [░░░░░░░░░░]",
  ]);
  expect(pushFrames(0.5)[2]).toBe("Writing objects:  50% [█████░░░░░]");
  expect(pushFrames(1)[2]).toBe("Writing objects: 100% [██████████]");
  expect(pushFrames(5)).toEqual(pushFrames(1));
  expect(pushFrames(-2)).toEqual(pushFrames(0));
});

test("pushResult", () => {
  expect(pushResult(true, "a1b2c3d")).toEqual([
    "To rafael@inbox",
    "   a1b2c3d..hello  ✓ delivered",
  ]);
  expect(pushResult(false, "a1b2c3d", "boom")).toEqual([
    "! [rejected]        hello -> hello (boom)",
    "error: failed to push some refs",
  ]);
});
