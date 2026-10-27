export type Commit = {
  /** Index into WORK_EXPERIENCE (oldest-first data order). */
  index: number;
  hash: string;
  lane: 0 | 1;
  isHead: boolean;
};

export type BranchSpan = { merge: number; branch: number; fork: number };

function fnv1a(str: string, seed: number): number {
  let h = seed >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}

/** Seven lowercase hex chars, deterministic so SSR equals the client. */
export function shortHash(seed: string): string {
  const a = fnv1a(seed, 0x811c9dc5).toString(16).padStart(8, "0");
  const b = fnv1a(seed, 0x9747b28c).toString(16).padStart(8, "0");
  return (a + b).slice(0, 7);
}

type Entry = { title: string; position: string; date: string; branch?: boolean };

/** Commits newest first (reverse of data order). */
export function buildCommits(entries: Entry[]): Commit[] {
  const out: Commit[] = [];
  for (let i = entries.length - 1; i >= 0; i--) {
    const e = entries[i];
    out.push({
      index: i,
      hash: shortHash(`${e.title}|${e.position}|${e.date}`),
      lane: e.branch ? 1 : 0,
      isHead: i === entries.length - 1,
    });
  }
  return out;
}

/** Positions (in the commits array) a branch merges from, lives on, forks at. */
export function branchSpans(commits: Commit[]): BranchSpan[] {
  const spans: BranchSpan[] = [];
  commits.forEach((c, p) => {
    if (c.lane === 1) spans.push({ merge: p - 1, branch: p, fork: p + 1 });
  });
  return spans;
}
