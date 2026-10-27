/** The stack, as it would appear in a terminal. Reused by every code-rain. */
export const STACK_TOKENS: readonly string[] = [
  "const",
  "=>",
  "{}",
  "</>",
  "npm",
  "git",
  "ts",
  "sql",
  "()",
  "&&",
  "??",
  "async",
  "await",
  "prisma",
  "0x",
  "fn",
  "===",
  "next",
  "[]",
  "use",
];

/**
 * A stateful stream of characters spelling random stack tokens, each
 * followed by a single space. Every call returns the next character.
 * Allocates only when a token ends (once per token), not per character.
 */
export function tokenStream(rand: () => number = Math.random): () => string {
  let current = "";
  let index = 0;
  return () => {
    if (index >= current.length) {
      const pick = Math.floor(rand() * STACK_TOKENS.length);
      current = `${STACK_TOKENS[pick % STACK_TOKENS.length]} `;
      index = 0;
    }
    return current[index++];
  };
}
