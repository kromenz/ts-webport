const SPINNER = "⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏";
export const BAR_CELLS = 10;

export function toPackageName(skill: string): string {
  return skill
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Lines to show for a given install state. `tick` (0..10) is how many bar
 * cells of the active package are filled.
 */
export function installFrame(
  skills: string[],
  pkgIndex: number,
  tick: number,
): string[] {
  const names = skills.map(toPackageName);
  if (pkgIndex >= skills.length) {
    return [
      ...names.map((n) => `+ ${n}`),
      "",
      `added ${skills.length} package${skills.length === 1 ? "" : "s"}`,
    ];
  }
  const fill = Math.max(0, Math.min(BAR_CELLS, tick));
  const bar = "█".repeat(fill) + "░".repeat(BAR_CELLS - fill);
  return [
    ...names.slice(0, pkgIndex).map((n) => `+ ${n}`),
    `${SPINNER[tick % SPINNER.length]} fetching ${names[pkgIndex]} [${bar}]`,
  ];
}
