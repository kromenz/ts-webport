import { PROFILE, PROJECTS, WORK_EXPERIENCE } from "@/src/data/data";

/** sessionStorage flag: set once the boot has played (or been skipped). */
export const BOOT_KEY = "ra:booted";

/**
 * Whether this visit should play the boot. Any failure (no storage, a
 * throwing getter in private mode) means "no": the boot is decoration and must
 * never be the thing that breaks the page. A hash means a deep link, which
 * should land on its section without a screen in the way. The boot belongs to
 * the home page only: elsewhere (404, error) nothing would ever clear it.
 */
export function shouldBoot(
  storage: Pick<Storage, "getItem"> | null,
  hash: string,
  pathname = "/",
): boolean {
  if (!storage || hash || pathname !== "/") return false;
  try {
    return storage.getItem(BOOT_KEY) === null;
  } catch {
    return false;
  }
}

/**
 * Inline pre-paint script for <head>. Same rules as shouldBoot, written as a
 * string so it runs before first paint and the overlay never flashes the hero.
 */
export const BOOT_SCRIPT = `try{if(location.pathname==="/"&&!location.hash&&window.sessionStorage.getItem(${JSON.stringify(
  BOOT_KEY,
)})===null)document.documentElement.dataset.boot="1"}catch(e){}`;

const dots = (label: string) => label.padEnd(36, ".").slice(0, 36);

export const BOOT_LINES: ReadonlyArray<readonly [text: string, ok: boolean]> = [
  [`RA-BIOS v4.5.0  (c) 2026 ${PROFILE.name}`, false],
  [dots("cpu: caffeine-x86 @ 4.20GHz "), true],
  [dots("memory: 16384M "), true],
  [dots(`mounting /experience (${WORK_EXPERIENCE.length}) `), true],
  [dots(`mounting /projects (${PROJECTS.length}) `), true],
  ["loading stack: next react ts prisma", true],
  [dots("starting shell "), true],
];
