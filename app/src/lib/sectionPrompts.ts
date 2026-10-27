const plural = (n: number, one: string, many: string) =>
  `${n} ${n === 1 ? one : many}`;

/** Output line for the experience prompt: `git log --oneline | wc -l`. */
export function experienceOutput(
  entries: readonly unknown[],
  since: number,
): string {
  return `${plural(entries.length, "commit", "commits")} since ${since}`;
}

/** Output line for the projects prompt: `ls --count`. */
export function projectsOutput(projects: readonly { type: string }[]): string {
  const categories = new Set(projects.map((p) => p.type)).size;
  return `${plural(projects.length, "project", "projects")} · ${plural(categories, "category", "categories")}`;
}
