import { describe, expect, it } from "vitest";
import { PROFILE, PROJECTS } from "@/src/data/data";
import { complete, projectSlug, runCommand } from "./commands";

const ctx = { history: [] as string[] };

describe("runCommand", () => {
  it("returns nothing for empty input", () => {
    expect(runCommand("", ctx).lines).toEqual([]);
    expect(runCommand("   ", ctx).lines).toEqual([]);
  });

  it("trims and lower-cases the command word", () => {
    expect(runCommand("  WHOAMI ", ctx).lines[0].text).toBe(
      "Rafael André — Software Engineer @ RHY Consulting",
    );
  });

  it("matches arguments case-insensitively", () => {
    const out = runCommand("CAT About.txt", ctx);
    expect(out.lines.map((l) => l.text).join(" ")).toContain(PROFILE.about);
  });

  it("errors on an unknown file or project", () => {
    expect(runCommand("cat nope", ctx).lines[0].tone).toBe("error");
    expect(runCommand("open nope", ctx).lines[0].tone).toBe("error");
  });

  it("survives a 500 character line with one error line", () => {
    const out = runCommand("x".repeat(500), ctx);
    expect(out.lines).toHaveLength(1);
    expect(out.lines[0].tone).toBe("error");
    expect(out.lines[0].text.length).toBeLessThan(300);
  });

  it("never throws on odd input", () => {
    for (const s of [
      "cat",
      "open",
      "ls  /",
      "theme",
      "sudo",
      "\t\n",
      "ls projects extra",
      "cat " + "a".repeat(500),
    ]) {
      expect(() => runCommand(s, ctx)).not.toThrow();
    }
  });

  it("theme crt / default set the crt effect", () => {
    expect(runCommand("theme crt", ctx).effect).toEqual({ kind: "crt", on: true });
    expect(runCommand("theme default", ctx).effect).toEqual({
      kind: "crt",
      on: false,
    });
  });

  it("sudo hire-me and contact go to contact", () => {
    expect(runCommand("sudo hire-me", ctx).effect?.kind).toBe("goto");
    expect(runCommand("contact", ctx).effect).toEqual({
      kind: "goto",
      hash: "#contact",
      focusContact: true,
    });
  });

  it("clear returns the clear effect", () => {
    expect(runCommand("clear", ctx).effect).toEqual({ kind: "clear" });
  });

  it("open returns link lines with hrefs", () => {
    const slug = projectSlug(PROJECTS.find((p) => p.githubUrl)!.title);
    const out = runCommand(`open ${slug}`, ctx);
    const links = out.lines.filter((l) => l.tone === "link");
    expect(links.length).toBeGreaterThan(0);
    for (const l of links) expect(l.href).toMatch(/^https?:\/\//);
  });

  it("open on a project without links says so, muted", () => {
    const bare = PROJECTS.find((p) => !p.githubUrl && !p.liveUrl && !p.videoUrl);
    if (!bare) return;
    const out = runCommand(`open ${projectSlug(bare.title)}`, ctx);
    expect(out.lines[0].tone).toBe("muted");
  });

  it("history lists previous commands", () => {
    const out = runCommand("history", { history: ["help", "ls"] });
    expect(out.lines.map((l) => l.text).join("\n")).toContain("help");
  });
});

describe("projectSlug", () => {
  it("uses the part before the dash", () => {
    expect(projectSlug(PROJECTS[0].title)).toBe("access-os");
    expect(projectSlug("XML_Parsing - RPC_Server")).toBe("xml-parsing");
  });
  it("collapses separators", () => {
    expect(projectSlug("Web Scrapping / Sentiment Analysis")).toBe(
      "web-scrapping-sentiment-analysis",
    );
    expect(projectSlug("  --A__b//c--  ")).toBe("a-b-c");
  });
  it("is unique across PROJECTS and non-empty", () => {
    const slugs = PROJECTS.map((p) => projectSlug(p.title));
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const s of slugs) expect(s).not.toBe("");
  });
});

describe("complete", () => {
  it("completes commands", () => {
    expect(complete("ca")).toEqual(["cat"]);
  });
  it("completes slugs", () => {
    expect(complete("cat acc")).toEqual(["cat access-os"]);
    expect(complete("open acc")).toEqual(["open access-os"]);
  });
  it("completes about.txt for cat only and projects for ls", () => {
    expect(complete("cat ab")).toEqual(["cat about.txt"]);
    expect(complete("open ab")).toEqual([]);
    expect(complete("ls pro")).toEqual(["ls projects"]);
  });
  it("returns nothing for empty or unknown", () => {
    expect(complete("zzz")).toEqual([]);
  });
});
