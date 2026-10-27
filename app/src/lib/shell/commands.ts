import { PROFILE, PROJECTS } from "@/src/data/data";

export type ShellLine = {
  text: string;
  tone: "info" | "muted" | "accent" | "error" | "link";
  href?: string;
};

export type ShellEffect =
  | { kind: "clear" }
  | { kind: "crt"; on: boolean }
  | { kind: "goto"; hash: "#contact"; focusContact: true };

export type ShellResult = { lines: ShellLine[]; effect?: ShellEffect };

const MAX_ECHO = 200;

/** Long input is cut for display only. */
export function truncateEcho(s: string): string {
  return s.length > MAX_ECHO ? `${s.slice(0, MAX_ECHO)}…` : s;
}

/**
 * "Access OS — Deal-Sourcing…" -> "access-os". Takes the part before the
 * first " — " or " - ", lower-kebab-cases it and drops everything else.
 */
export function projectSlug(title: string): string {
  const head = title.split(/\s[—-]\s/)[0] ?? title;
  return head
    .toLowerCase()
    .replace(/[\s_/\\]+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

const SLUGS = PROJECTS.map((p) => projectSlug(p.title));
const findProject = (slug: string) => {
  const i = SLUGS.indexOf(slug);
  return i === -1 ? undefined : PROJECTS[i];
};

const COMMANDS = [
  "help",
  "whoami",
  "ls",
  "cat",
  "open",
  "neofetch",
  "history",
  "clear",
  "theme",
  "sudo",
  "contact",
];

const line = (text: string, tone: ShellLine["tone"] = "info"): ShellLine => ({
  text,
  tone,
});
const err = (text: string): ShellLine => line(text, "error");

const HELP: ShellLine[] = [
  line("commands:", "muted"),
  line("  whoami                 who is this"),
  line("  ls [projects]          list files or projects"),
  line("  cat <file|project>     read about.txt or a project"),
  line("  open <project>         show a project's links"),
  line("  neofetch               system info"),
  line("  theme crt | default    toggle the CRT look"),
  line("  history                previous commands"),
  line("  clear                  empty the screen"),
  line("  contact                jump to the contact terminal"),
  line("  sudo hire-me           you know you want to"),
  line("// Tab completes, ↑/↓ browse history, Esc closes.", "muted"),
];

function neofetch(): ShellLine[] {
  const art = [
    "██████   █████ ",
    "██   ██ ██   ██",
    "██████  ███████",
    "██   ██ ██   ██",
    "██   ██ ██   ██",
  ];
  const info = [
    "rafael@portfolio",
    "─────────────────",
    `role   ${PROFILE.role}`,
    `since  ${PROFILE.since}`,
    `works  ${PROJECTS.length} projects`,
  ];
  return art.map((a, i) => line(`${a}  ${info[i]}`, "accent"));
}

function open(arg: string): ShellLine[] {
  const slug = arg.toLowerCase();
  const p = findProject(slug);
  if (!p) return [err(`open: unknown project '${truncateEcho(arg)}'`)];
  const links: ShellLine[] = [];
  if (p.githubUrl) links.push({ text: `github  ${p.githubUrl}`, tone: "link", href: p.githubUrl });
  if (p.liveUrl) links.push({ text: `live    ${p.liveUrl}`, tone: "link", href: p.liveUrl });
  if (p.videoUrl) links.push({ text: `video   ${p.videoUrl}`, tone: "link", href: p.videoUrl });
  return links.length ? links : [line(`no links for ${slug}`, "muted")];
}

function cat(arg: string): ShellLine[] {
  const key = arg.toLowerCase().replace(/^projects\//, "");
  if (key === "about.txt") return [line(PROFILE.about)];
  const p = findProject(key);
  if (!p) return [err(`cat: ${truncateEcho(arg)}: No such file or directory`)];
  const out = [line(p.title, "accent"), line(p.description)];
  if (p.tech?.length) out.push(line(p.tech.join(" · "), "muted"));
  return out;
}

function ls(arg: string): ShellLine[] {
  const key = arg.toLowerCase().replace(/\/+$/, "");
  if (key === "") return [line("projects/  about.txt", "info")];
  if (key === "projects") return [line(SLUGS.join("  "), "info")];
  return [err(`ls: ${truncateEcho(arg)}: No such file or directory`)];
}

/** Never throws. The echo of the typed line is the caller's job. */
export function runCommand(
  input: string,
  ctx: { history: string[] },
): ShellResult {
  try {
    const trimmed = (input ?? "").trim();
    if (!trimmed) return { lines: [] };
    const [rawCmd, ...rest] = trimmed.split(/\s+/);
    const cmd = rawCmd.toLowerCase();
    const arg = rest.join(" ");

    switch (cmd) {
      case "help":
        return { lines: HELP };
      case "whoami":
        return { lines: [line(`${PROFILE.name} — ${PROFILE.role}`)] };
      case "ls":
        return { lines: ls(arg) };
      case "cat":
        return {
          lines: arg ? cat(arg) : [err("cat: missing file operand")],
        };
      case "open":
        return {
          lines: arg ? open(arg) : [err("open: missing project name")],
        };
      case "neofetch":
        return { lines: neofetch() };
      case "history":
        return {
          lines: ctx.history.map((h, i) =>
            line(`${String(i + 1).padStart(4)}  ${truncateEcho(h)}`, "muted"),
          ),
        };
      case "clear":
        return { lines: [], effect: { kind: "clear" } };
      case "theme": {
        const v = arg.toLowerCase();
        if (v === "crt") {
          return {
            lines: [line("theme: crt on", "accent")],
            effect: { kind: "crt", on: true },
          };
        }
        if (v === "default") {
          return {
            lines: [line("theme: default", "accent")],
            effect: { kind: "crt", on: false },
          };
        }
        return { lines: [err("usage: theme crt | default")] };
      }
      case "sudo":
        if (arg.toLowerCase() === "hire-me") {
          return {
            lines: [
              line("[sudo] password for recruiter: ********", "muted"),
              line("✓ access granted — opening the contact form…", "accent"),
            ],
            effect: { kind: "goto", hash: "#contact", focusContact: true },
          };
        }
        return { lines: [err("sudo: nice try.")] };
      case "contact":
        return {
          lines: [line("opening the contact form…", "accent")],
          effect: { kind: "goto", hash: "#contact", focusContact: true },
        };
      default:
        return {
          lines: [
            err(`zsh: command not found: ${truncateEcho(rawCmd)}`),
          ],
        };
    }
  } catch {
    return { lines: [err("zsh: something went wrong")] };
  }
}

/** Candidates for the (possibly partial) input; whole-line replacements. */
export function complete(input: string): string[] {
  const v = (input ?? "").trimStart();
  const m = v.match(/^(\S+)\s+(\S*)$/);
  if (!m) {
    if (/\s/.test(v)) return [];
    const word = v.toLowerCase();
    return COMMANDS.filter((c) => c.startsWith(word));
  }
  const cmd = m[1].toLowerCase();
  const part = m[2].toLowerCase();
  let pool: string[] = [];
  if (cmd === "cat") pool = [...SLUGS, "about.txt"];
  else if (cmd === "open") pool = SLUGS;
  else if (cmd === "ls") pool = ["projects"];
  else if (cmd === "theme") pool = ["crt", "default"];
  else if (cmd === "sudo") pool = ["hire-me"];
  return pool.filter((p) => p.startsWith(part)).map((p) => `${cmd} ${p}`);
}
