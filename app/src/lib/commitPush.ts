const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type CommitDraft = { subject: string; message: string; from: string };

/** Git-style validation lines; mirrors the rules in app/api/contact/route.ts. */
export function validateCommit({
  subject,
  message,
  from,
}: CommitDraft): string[] {
  const errors: string[] = [];
  const s = subject.trim();
  const m = message.trim();
  if (s.length < 1) errors.push("error: empty commit message subject");
  else if (s.length > 200)
    errors.push("error: subject too long (max 200 characters)");
  if (m.length < 5) errors.push("error: message too short (min 5 characters)");
  else if (m.length > 5000)
    errors.push("error: message too long (max 5000 characters)");
  if (!EMAIL_RE.test(from.trim())) errors.push("error: invalid author email");
  return errors;
}

const CELLS = 10;

/** Push log at progress 0..1 (clamped). */
export function pushFrames(progress: number): string[] {
  const p = Math.min(1, Math.max(0, Number.isFinite(progress) ? progress : 0));
  const pct = Math.round(p * 100);
  const filled = Math.round(p * CELLS);
  const bar = "█".repeat(filled) + "░".repeat(CELLS - filled);
  return [
    "$ git push origin hello",
    "Enumerating objects: 3, done.",
    `Writing objects: ${String(pct).padStart(3, " ")}% [${bar}]`,
  ];
}

export function pushResult(
  ok: boolean,
  hash: string,
  error?: string,
): string[] {
  if (ok) return ["To rafael@inbox", `   ${hash}..hello  ✓ delivered`];
  return [
    `! [rejected]        hello -> hello (${error ?? "unknown error"})`,
    "error: failed to push some refs",
  ];
}
