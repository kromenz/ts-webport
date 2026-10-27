import { describe, expect, test } from "vitest";

import { STACK_TOKENS, tokenStream } from "./tokens";

describe("tokenStream", () => {
  test("spells tokens separated by single spaces", () => {
    // rand() = 0 always selects the first token.
    const next = tokenStream(() => 0);
    const out = Array.from({ length: 12 }, next).join("");
    expect(out).toBe("const const ");
  });

  test("cycles through STACK_TOKENS as rand advances", () => {
    let i = 0;
    const next = tokenStream(() => (i++ + 0.5) / STACK_TOKENS.length);
    const text = Array.from({ length: 200 }, next).join("");
    const words = text.split(" ").slice(0, STACK_TOKENS.length);
    expect(words).toEqual([...STACK_TOKENS]);
    expect(text).not.toMatch(/ {2}/);
  });
});
