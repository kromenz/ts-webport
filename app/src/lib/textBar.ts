/**
 * Text progress bar for the scroll pill, e.g. `[██████░░░░] 62%`.
 * Non-finite input and out-of-range values are clamped into 0..1.
 */
export function textBar(progress: number, cells = 10): string {
  const p = Number.isFinite(progress) ? Math.min(1, Math.max(0, progress)) : 0;
  const n = Math.round(p * cells);
  const pct = Math.round(p * 100);
  return `[${"█".repeat(n)}${"░".repeat(cells - n)}] ${pct}%`;
}
