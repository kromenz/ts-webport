# Portfolio "ASCII vivo" Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Animate the terminal-themed portfolio in direction C ("ASCII generativo"): glyph-field hero, first-visit boot, git-log Experience, npm-install skills, spotlight Projects, glitch navigation, Ctrl+K shell, sound, CRT and token rain.

**Architecture:** Pure logic (glyph density, git graph, npm frames, shell commands, text bar) lives in small tested modules under `app/src/lib/`. React client components render them. anime.js 4.5.0 handles text, SVG and staggers through one `useAnimeScope` hook; framer-motion keeps its current jobs. A client `GlobalLayer`, mounted in `app/layout.tsx`, owns sound, CRT, Konami and the shell on every route.

**Tech Stack:** Next.js 16.2 (App Router, Turbopack), React 19.2, TypeScript 5, Tailwind v4, framer-motion 12, **animejs 4.5.0** (new), **vitest** (new, dev-only, for the pure modules).

**Spec:** `docs/superpowers/specs/2026-10-23-ascii-motion-design.md`. Read it first. **Visual reference:** the Motion Lab prototype, saved at `docs/superpowers/specs/2026-10-23-motion-lab.html` (open it in a browser). Each demo shows the target look and timing, and its vanilla-JS source is a starting point for the canvas maths, CSS and anime.js calls. It is not React code to paste.

## Global Constraints

- `animejs` pinned to exactly `4.5.0` in `package.json`, with no `^`. Import from subpaths (`animejs`, `animejs/text`, `animejs/svg`). Always go through `createScope({ root })` with `revert()` on cleanup.
- Never animate the same element with framer-motion and anime.js. Wrap it in a separate element if both are needed.
- `HONOR_REDUCED_MOTION = false` in `app/src/lib/motion.ts` stays as is. Every new animation reads `useSiteReducedMotion()` or `siteReducedMotion()`. When either returns true, the element shows its final state with no motion.
- No JSX branching on client-only values: SSR output must equal the first client render. Random or derived strings rendered in markup must be deterministic.
- Canvases pause off-screen (IntersectionObserver) and on `document.hidden`. DPR is capped at 2. Density drops when width < 640 or `navigator.hardwareConcurrency <= 4`.
- Palette: `--background #14141a`, `green-primary #34d399`, git hash `#e5c07b`, git ref `#7dd3fc`. No other new colours.
- Fonts: Fira Code (`font-mono`) for terminal chrome, Geist for prose.
- Profile copy, exact:
  - role `"Software Engineer @ RHY Consulting"`
  - about `"Software engineer. Builds platforms end to end: schema, auth, payments, deploy pipelines. Currently at RHY Consulting, through Alongside."`
- The hero's rotating `ROLES` and the site `<title>` do not change.
- Out of scope: WebGL/three, GSAP, Lenis, the circuit divider, the block-caret cursor, a light theme, and any content restructuring.

## Review Focus

1. **Hydration.** Git hashes, the boot overlay and any scrambled heading must render the same string on the server and on the first client render. Expect no React hydration warning in the dev console on a cold load.
2. **Fast tab switching.** Clicking five Experience or Projects tabs in under a second must not leave stacked or garbled text. Only the last selection animates, and it settles on the correct strings.
3. **Storage unavailable.** In private mode, or when `sessionStorage` or `localStorage` throws, the boot is skipped, sound stays off and nothing crashes.
4. **Odd shell input.** Empty input, surrounding spaces, uppercase (`CAT About.txt`), an unknown project and a 500-character line all produce a sensible single response. Nothing ever throws.
5. **Glitch re-entrancy and deep links.** Clicking another nav item mid-glitch ends on the last target with one jump. Loading `/#projects` lands on Projects with no glitch and no boot covering it.

---

### Task 0: Preconditions (no code)

- [ ] **Step 1:** Run `git status`. `app/src/data/data.ts` has uncommitted edits by Rafael. **Stop and ask Rafael to commit them, or to confirm you may commit them as they are, before touching that file.** Never discard them.
- [ ] **Step 2:** Work on branch `feat/ascii-motion` off `dev`, using superpowers:using-git-worktrees if executing with subagents.

### Task 1: Foundations: anime.js, vitest, `useAnimeScope`, `PROFILE`

**Files:**
- Modify: `package.json` (add `animejs` `4.5.0`, devDeps `vitest`; script `"test": "vitest run"`)
- Create: `vitest.config.ts` (alias `@` → `./app`, environment `node`, include `app/**/*.test.ts`)
- Create: `app/src/lib/useAnimeScope.ts`
- Modify: `app/src/data/data.ts`: add `PROFILE`, and fix the Alongside responsibility sentence (approved by Rafael)
- Test: `app/src/data/data.test.ts`

**Interfaces:**
- Produces:
  - `useAnimeScope(root: RefObject<HTMLElement | null>, setup: (scope: Scope) => void | (() => void), deps: DependencyList): RefObject<Scope | null>`. It creates `createScope({ root })` in `useEffect`, runs `setup` via `scope.add`, and calls `revert()` on cleanup and before re-running when deps change.
  - `export const PROFILE: { name: string; role: string; about: string; since: number }` in `data.ts`.

- [ ] **Step 1:** `npm i animejs@4.5.0 --save-exact && npm i -D vitest`. Check that `package.json` shows `"animejs": "4.5.0"`.
- [ ] **Step 2: Write the failing test** `app/src/data/data.test.ts`:
  ```ts
  import { PROFILE, WORK_EXPERIENCE } from "@/src/data/data";
  test("profile copy", () => {
    expect(PROFILE.role).toBe("Software Engineer @ RHY Consulting");
    expect(PROFILE.about).toBe("Software engineer. Builds platforms end to end: schema, auth, payments, deploy pipelines. Currently at RHY Consulting, through Alongside.");
    expect(PROFILE.since).toBe(2022);
  });
  test("Alongside entry says RHY through Alongside", () => {
    const a = WORK_EXPERIENCE.find((e) => e.title === "Alongside")!;
    expect(a.responsibilities[0]).toMatch(/^Software engineer at RHY Consulting, through Alongside\./);
  });
  ```
- [ ] **Step 3:** Run `npm test`. It should FAIL: `PROFILE` is undefined.
- [ ] **Step 4:** Add `PROFILE = { name: "Rafael André", role, about, since: 2022 }`. Change the first Alongside responsibility to begin `"Software engineer at RHY Consulting, through Alongside. Three projects to date:"`. Implement `useAnimeScope`.
- [ ] **Step 5:** Run `npm test && npm run lint && npm run build`. All should pass.
- [ ] **Step 6:** Commit `feat: add animejs, vitest, useAnimeScope and PROFILE`.

### Task 2: Hero glyph field (replaces the starfield)

**Files:**
- Create: `app/src/lib/ascii/glyphField.ts` (pure maths)
- Create: `app/src/components/Hero/GlyphField.tsx` (canvas)
- Modify: `app/src/components/Hero/Hero.tsx:5,69`: swap `StarfieldBackground` for `GlyphField`
- Delete: `components/ui/starfield.tsx`, once nothing imports it (`grep -r starfield app components`)
- Test: `app/src/lib/ascii/glyphField.test.ts`

**Interfaces:**
- Produces, all in `glyphField.ts`:
  - `RAMP = " .·:-=+*#%@"`
  - `STAR_GLYPHS = [".", "·", "+", "*", "#"]`
  - `type Ripple = { x: number; y: number; t: number }`
  - `bloomAt(cx: number, cy: number, px: number, py: number, radius: number, ripples: Ripple[], t: number): number`, returning 0..1. Cursor falloff is `max(0, 1 - d/radius) ** 1.6 * 0.95`. Ripple band is 26 px wide, travels at 240 px/s and fades over 2 s. There is **no ambient term**, because the grid is invisible at rest (spec 4.2).
  - `starGlyph(z: number): string`, where z in (0, 1] and nearer means a bigger glyph.
  - `rampChar(v: number): string`

- [ ] **Step 1: Write the failing tests:**
  - `bloomAt(0,0, 500,500, 100, [], 0) === 0`, because the grid is invisible away from the cursor.
  - `bloomAt(10,10, 10,10, 100, [], 0)` is close to 0.95.
  - A ripple at `(0,0,t=0)` checked at `d=240, t=1` gives a value > 0.4, and at `t=2.1` gives 0.
  - `starGlyph(1) === "."` and `starGlyph(0.05) === "#"`.
  - `rampChar(0) === " "` and `rampChar(1) === "@"`.
- [ ] **Step 2:** Run `npm test -- glyphField`. It should FAIL.
- [ ] **Step 3:** Implement `glyphField.ts`.
- [ ] **Step 4:** Implement `GlyphField.tsx`: one canvas, two passes per frame (spec 4.2). Pass 1 draws ~260 glyph stars, with the vanishing point eased 5% per frame towards a cursor offset of ±25% of size. Pass 2 draws grid cells (13 px Fira Code, cell = measured `M` width × 1.05 by 17 px), where `rampChar(bloomAt(...)) !== " "`. Cells above 0.56 are `#34d399`, others `rgba(226,232,240, 0.1 + v*0.55)`. With no cursor (touch or none), the bloom centre drifts on a Lissajous path. `pointerdown` adds a ripple. Follow the canvas rules in Global Constraints. Re-measure on `document.fonts.ready` and on ResizeObserver.
- [ ] **Step 5:** Run `npm test && npm run build`, then `npm run dev`. Check by eye at 1280 and 400 px: the stars move, the grid shows only around the cursor, a click sends a wave, and the hero text is unchanged.
- [ ] **Step 6:** Commit `feat(hero): glyph field replaces starfield`.

### Task 3: First-visit boot with the RA monogram

**Files:**
- Create: `app/src/lib/boot.ts`
- Create: `app/src/components/Hero/BootSequence.tsx`
- Modify: `app/layout.tsx`: inline pre-paint script in `<head>`
- Modify: `app/page.tsx`: render `<BootSequence />` first
- Modify: `app/globals.css`: `html:not([data-boot]) .boot-overlay { display: none }`
- Test: `app/src/lib/boot.test.ts`

**Interfaces:**
- Produces:
  - `BOOT_KEY = "ra:booted"`
  - `shouldBoot(storage: Pick<Storage, "getItem"> | null, hash: string): boolean`. Returns false when storage is null, when `getItem` throws, when the key is set, or when `hash` is non-empty (deep link).
  - `BOOT_SCRIPT: string`, the inline JS that sets `document.documentElement.dataset.boot = "1"` when the same rules hold, wrapped in try/catch.
  - `BOOT_LINES: ReadonlyArray<readonly [text: string, ok: boolean]>`, copied from the Motion Lab boot demo, but `mounting /experience (N)` and `mounting /projects (N)` must use `WORK_EXPERIENCE.length` and `PROJECTS.length`.

- [ ] **Step 1: Write the failing tests:**
  - `shouldBoot(null, "")` is false.
  - `shouldBoot({ getItem: () => { throw new Error() } }, "")` is false (Review Focus 3).
  - `shouldBoot({ getItem: () => "1" }, "")` is false.
  - `shouldBoot({ getItem: () => null }, "#projects")` is false (Review Focus 5).
  - `shouldBoot({ getItem: () => null }, "")` is true.
- [ ] **Step 2:** Run `npm test -- boot`. It should FAIL.
- [ ] **Step 3:** Implement `boot.ts`, then put `<script dangerouslySetInnerHTML={{ __html: BOOT_SCRIPT }} />` in the layout `<head>`.
- [ ] **Step 4:** Implement `BootSequence.tsx`.
  - Render a full-screen `.boot-overlay` in the server HTML, hidden by CSS unless `html[data-boot]`.
  - On mount, if `data-boot` is set:
    - Run the lines at about 150 ms each, so the whole sequence is ≤ 1.5 s.
    - Draw the RA monogram on a small canvas: "RA" in Geist 800, sampled to a cell grid and revealed from noise. The approach is the same as the Motion Lab monogram demo.
    - End on `$ whoami`.
  - Then set `sessionStorage[BOOT_KEY] = "1"` in try/catch, fade out over 300 ms and remove `data-boot`.
  - Any key, a click or the "skip" button jumps straight to the end.
  - No sound (spec 4.8).
  - Under reduced motion, skip the sequence entirely.
- [ ] **Step 5:** Run `npm run build && npm run dev`, then check with the playwright-skill:
  - A new context shows the overlay, and it is gone by 2 s.
  - A reload in the same context shows no overlay.
  - `/#projects` shows no overlay.
  - The console has no hydration warning.
- [ ] **Step 6:** Commit `feat(hero): first-visit boot sequence with ASCII monogram`.

### Task 4: Text-effect hooks and navbar scramble

**Files:**
- Create: `app/src/lib/useScramble.ts`
- Create: `app/src/lib/useSplitReveal.ts`
- Modify: `app/src/components/Navbar/NavbarContent.tsx`: scramble each label on `mouseenter`

**Interfaces:**
- Produces:
  - `useScramble(): (el: HTMLElement | null, text?: string) => void`. It calls `animate(el, { innerHTML: scrambleText({ text, chars: "a-zA-Z0-9!%#_" }) })`. It cancels the previous animation on the same element, using a `WeakMap<HTMLElement, JSAnimation>`. It sets `aria-label` to the final text. Under reduced motion it just sets the text.
  - `useSplitReveal(ref: RefObject<HTMLElement | null>, key: unknown): void`. On each `key` change it reverts the previous split, runs `splitText(el, { words: { wrap: "clip" }, accessible: true })`, and animates the words `translateY: ["105%", "0%"]` over 650 ms, `ease: "out(3)"`, `delay: stagger(28)`.

- [ ] **Step 1:** Implement both hooks. They are DOM-only, so there are no unit tests; Review Focus 2 is verified in Tasks 5 and 6.
- [ ] **Step 2:** In `NavbarContent`, attach the scramble to each label span on `mouseenter`. Check that the server-rendered label text is unchanged.
- [ ] **Step 3:** Run `npm run lint && npm run build`. In dev, hovering a nav item scrambles it and settles on the original label. Hovering three items quickly leaves every label correct.
- [ ] **Step 4:** Commit `feat(text): scramble and split-reveal hooks, navbar hover scramble`.

### Task 5: Experience as `git log --graph`, plus `npm install` skills

**Files:**
- Create: `app/src/lib/gitGraph.ts`
- Create: `app/src/lib/npmInstall.ts`
- Create: `app/src/components/Experience/CommitGraph.tsx` (sidebar)
- Create: `app/src/components/Experience/NpmInstall.tsx`
- Modify: `app/src/components/Experience/Experience.tsx`: sidebar becomes `CommitGraph`; detail header becomes `git show <hash>` with scrambled title; skills block becomes `NpmInstall`
- Modify: `app/src/data/data.ts`: add optional `branch?: true` to the BorgWarner entry whose `position` is `"Summer Internship"`, the only branch (spec 4.4)
- Test: `app/src/lib/gitGraph.test.ts`, `app/src/lib/npmInstall.test.ts`

**Interfaces:**
- Produces:
  - `shortHash(seed: string): string`. Seven lowercase hex characters, deterministic (FNV-1a 32-bit plus 4 hex from a second pass is fine). Seed is `` `${title}|${position}|${date}` ``.
  - `type Commit = { index: number; hash: string; lane: 0 | 1; isHead: boolean }`, where `index` points into `WORK_EXPERIENCE`.
  - `buildCommits(entries: { title: string; position: string; date: string; branch?: boolean }[]): Commit[]`. Newest first (the reverse of data order). `lane` is 1 when `branch`. `isHead` is true only for the first item.
  - `branchSpans(commits: Commit[]): { merge: number; branch: number; fork: number }[]`. Positions are in the commits array. A lane-1 commit at position p gives `{ merge: p-1, branch: p, fork: p+1 }`.
  - `toPackageName(skill: string): string`, for example `"Working Under Pressure"` becomes `"working-under-pressure"`.
  - `installFrame(skills: string[], pkgIndex: number, tick: number): string[]`. Returns the lines to show: done lines are `+ name`, the active line is `{spinner} fetching name [{bar}]` with 10 cells, and the final state ends with `added N packages`. When `pkgIndex >= skills.length` it returns the final state.

- [ ] **Step 1: Write the failing tests:**
  - `shortHash("a")` matches `/^[0-9a-f]{7}$/`, and calling it twice returns the same value (Review Focus 1).
  - `buildCommits(WORK_EXPERIENCE)[0]` is Alongside with `isHead`.
  - Exactly one commit has `lane === 1`, and it is the summer internship.
  - With today's data (oldest first: Petiscas, BorgWarner Summer, BorgWarner Intern, Worldover, Alongside), the commit order is Alongside, Worldover, Intern, Summer, Petiscas, so `branchSpans` is `[{ merge: 2, branch: 3, fork: 4 }]`. Assert via `position` strings so the test explains itself.
  - `toPackageName("Customer Service") === "customer-service"`.
  - `installFrame(["A b"], 1, 0)` deep-equals `["+ a-b", "", "added 1 package"]`, singular for 1.
  - `installFrame(["x","y"], 0, 5)` has last line matching `/fetching x \[█{5}░{5}\]/`.
- [ ] **Step 2:** Run `npm test`. It should FAIL.
- [ ] **Step 3:** Implement `gitGraph.ts` and `npmInstall.ts`.
- [ ] **Step 4:** Implement `CommitGraph.tsx`.
  - Each row is a `<button>` that keeps the current tab semantics and active indicator. It shows: hash (`#e5c07b`), `(HEAD -> main)` (`#7dd3fc`) on the head only, company, position and date.
  - An absolutely positioned SVG draws the main line plus one curve per `branchSpans` entry, measuring row centres with ResizeObserver.
  - When the section enters view, it draws with `svg.createDrawable` and `draw: ["0 0", "0 1"]`, `stagger(90)`.
  - On mobile (< md), drop the SVG and keep the horizontal tabs with the hash prefixed.
- [ ] **Step 5:** Implement `NpmInstall.tsx`. Keyed by the active experience, it ticks `installFrame` every 12 ms per bar cell. Cancel on unmount or key change (Review Focus 2). Under reduced motion it shows the final state.
- [ ] **Step 6:** Wire both into `Experience.tsx`. The detail header shows `$ git show {hash}` in mono above the existing title, and the title runs `useScramble` on tab change. Keep `AnimatePresence`, attachments and the iframe exactly as they are.
- [ ] **Step 7:** Run `npm test && npm run build`. With the playwright-skill:
  - Click all five commits within 1 s, then wait 2 s. The title equals the last commit's `title / position`, and the skills block ends with `added N packages`.
  - No console errors.
- [ ] **Step 8:** Commit `feat(experience): git log graph sidebar and npm-install skills`.

### Task 6: Projects: spotlight, magnetic links, title scramble, description reveal

**Files:**
- Create: `app/src/lib/useMagnetic.ts`
- Modify: `app/src/components/Projects/Projects.tsx`

**Interfaces:**
- Consumes: `useScramble` and `useSplitReveal` (Task 4), `useAnimeScope` (Task 1).
- Produces: `useMagnetic(ref: RefObject<HTMLElement | null>, radius = 90, strength = 0.35): void`. It uses `createAnimatable(el, { x: 380, y: 380, ease: "out(3)" })` on the parent's `pointermove`, and resets on `pointerleave`. It is a no-op without `(hover: hover) and (pointer: fine)`.

- [ ] **Step 1:** Spotlight on the content pane: set `--mx`/`--my` from `pointermove`. Add two layers: a 260 px radial `rgba(52,211,153,.16)` fill and a 180 px masked border glow. The CSS is in the Motion Lab `.spot` rules. Remove the existing `group-hover` blur glow on the preview so the two effects don't stack.
- [ ] **Step 2:** Apply `useMagnetic` to each project link (GitHub, live, video). The animatable goes on an inner wrapper span, not on any framer-motion element.
- [ ] **Step 3:** Run `useScramble` on the project title when `activeIndex` changes. Run `useSplitReveal(descriptionRef, activeIndex)`.
- [ ] **Step 4:** Run `npm run build`. With the playwright-skill, click five project tabs within 1 s. The title and description equal the last project's, the description text matches `data.ts` exactly, and nothing is clipped (Review Focus 2).
- [ ] **Step 5:** Commit `feat(projects): spotlight, magnetic links, title scramble, description reveal`.

### Task 7: Glitch navigation

**Files:**
- Create: `app/src/lib/glitchJump.ts`
- Modify: `app/src/components/Navbar/NavbarContent.tsx:56-64` (`goToSection`)
- Modify: `app/src/components/Hero/Hero.tsx:108-113` ("View Projects")
- Modify: `app/globals.css`: `.glitching` RGB split, using `text-shadow: -2px 0 rgba(244,114,182,.85), 2px 0 rgba(125,211,252,.85)`
- Test: `app/src/lib/glitchJump.test.ts`

**Interfaces:**
- Produces:
  - `createGlitchJumper(deps: { target: (id: string) => HTMLElement | null; root: () => HTMLElement; run: (root: HTMLElement, onMid: () => void) => Promise<void>; reduced: () => boolean }): (id: string) => void`
    - Missing target: no-op.
    - Reduced motion: an instant `scrollIntoView({ behavior: "instant" })`.
    - A call during an active glitch replaces the pending target, so there is one jump, to the last id (Review Focus 5).
  - `glitchJump(id: string): void`, the default instance. Its `run` is an anime timeline on the page wrapper: 5 `clipPath: inset(a% 0 b% 0)` keyframes of 45 ms plus `translateX` ±6 px, `onMid` at keyframe 3, about 250 ms in total.

- [ ] **Step 1: Write the failing tests**, with fake deps and a `run` that resolves manually:
  - Calling `jump("a")` then `jump("b")` before resolve gives exactly one `scrollIntoView`, on "b".
  - Missing target: `run` is never called.
  - With `reduced`, `run` is not called and `scrollIntoView` gets `{ behavior: "instant" }`.
- [ ] **Step 2:** Run `npm test -- glitchJump`. It should FAIL.
- [ ] **Step 3:** Implement it, then replace the two smooth-scroll calls. Keep the `<a href="#id">` anchors and `setActiveSection`.
- [ ] **Step 4:** Run `npm run build`. In dev, nav clicks glitch and land on the section, and the `SectionDivider` types its `cd`. Loading `/#projects` lands with no glitch.
- [ ] **Step 5:** Commit `feat(nav): glitch jump replaces smooth scroll`.

### Task 8: Global layer: sound, CRT, Konami (all routes)

**Files:**
- Create: `app/src/components/Global/GlobalLayer.tsx` (client; providers plus overlays)
- Create: `app/src/lib/sfx.ts`
- Create: `app/src/lib/useSound.ts`
- Create: `app/src/lib/useCrt.ts`
- Modify: `app/layout.tsx`: wrap `{children}` in `<GlobalLayer>`
- Modify: `app/page.tsx`: remove `<KonamiCode />` (it moves into GlobalLayer)
- Modify: `app/src/components/EasterEggs/KonamiCode.tsx`: on activation, call `toggleCrt()` and show toast `// crt mode: on` or `// crt mode: off`, instead of the rainbow
- Modify: `app/globals.css`: remove the `konami-rainbow`/`konami-flash` rules and add `html.crt-on` plus the `#crt-overlay` scanlines/vignette from the Motion Lab CRT demo, including the subtle `flick` keyframes
- Modify: `app/src/components/Navbar/NavbarContent.tsx`: add a sound toggle button (`aria-pressed`, label `sound on`/`sound off`)

**Interfaces:**
- Produces:
  - `useSound(): { enabled: boolean; toggle(): void; click(soft?: boolean): void; beep(error?: boolean): void }`. Defaults to off. It persists `localStorage["ra:sound"]` in try/catch (Review Focus 3). It creates the `AudioContext` only inside `toggle()` when turning on.
  - `sfx.ts`: `makeClick(ctx: AudioContext, soft: boolean): void` (25 ms noise burst through a bandpass at 2200–3800 Hz, 1400 when soft) and `makeBeep(ctx: AudioContext, error: boolean): void` (square wave, 880 Hz for 90 ms; 220 Hz for 220 ms on error).
  - `useCrt(): { on: boolean; toggle(): void; set(v: boolean): void }`. State lives for the session only. It toggles `html.crt-on`.

- [ ] **Step 1:** Implement `sfx.ts`, `useSound`, `useCrt` and `GlobalLayer`. GlobalLayer renders the providers, the `#crt-overlay` div and `KonamiCode`.
- [ ] **Step 2:** Mount it in the layout, remove Konami from `page.tsx`, rewire Konami, and add the navbar toggle.
- [ ] **Step 3:** Run `npm run build`. In dev:
  - The Konami code toggles CRT on and off, and the toast shows.
  - CRT also works on `/does-not-exist` (404).
  - The sound toggle survives a reload.
  - With `localStorage` blocked (Playwright `context.addInitScript` making `localStorage.getItem` throw), the page loads and sound is off.
- [ ] **Step 4:** Commit `feat(global): sound, CRT mode and Konami on every route`.

### Task 9: Ctrl+K shell

**Files:**
- Create: `app/src/lib/shell/commands.ts`
- Create: `app/src/components/CommandPalette/Shell.tsx`
- Modify: `app/src/components/Global/GlobalLayer.tsx`: mount `<Shell />`
- Modify: `app/src/components/Navbar/NavbarContent.tsx`: terminal button (always rendered; it is the only opener on touch)
- Modify: `app/src/components/ContactMe/ContactTerminal.tsx`: listen for `window` event `"contact:focus"` to focus its input, and call `useSound().click()`/`beep()` on keystrokes and Enter
- Test: `app/src/lib/shell/commands.test.ts`

**Interfaces:**
- Consumes: `PROFILE`, `PROJECTS`, `WORK_EXPERIENCE` (data); `useSound`, `useCrt` (Task 8).
- Produces:
  - `type ShellLine = { text: string; tone: "info" | "muted" | "accent" | "error" | "link"; href?: string }`. The tones mirror `ContactTerminal`'s `Tone`.
  - `type ShellEffect = { kind: "clear" } | { kind: "crt"; on: boolean } | { kind: "goto"; hash: "#contact"; focusContact: true }`.
  - `runCommand(input: string, ctx: { history: string[] }): { lines: ShellLine[]; effect?: ShellEffect }`
    - Trims and lower-cases the command word, but keeps argument case for display.
    - Commands: `help`, `whoami` (→ `` `${PROFILE.name} — ${PROFILE.role}` ``), `ls`, `ls projects`, `cat about.txt` (→ `PROFILE.about`), `cat <slug>`, `open <slug>`, `neofetch`, `history`, `clear`, `theme crt`, `theme default`, `sudo hire-me`, `contact`.
    - Unknown command: `zsh: command not found: <cmd>`, error tone.
    - Input longer than 200 characters is truncated in the echo.
    - Never throws.
  - `projectSlug(title: string): string`. Takes the part before ` — ` or ` - `, lower-kebab-cases it, and strips non `[a-z0-9-]`. For example `"Access OS — Deal-Sourcing…"` becomes `"access-os"`.
  - `complete(input: string): string[]`. Completes commands; completes slugs after `cat `/`open ` (plus `about.txt` for `cat`); completes `projects` after `ls `.

- [ ] **Step 1: Write the failing tests:**
  - `runCommand("", …).lines` is `[]`.
  - `runCommand("  WHOAMI ", …).lines[0].text === "Rafael André — Software Engineer @ RHY Consulting"`.
  - `runCommand("CAT About.txt", …)` returns the about text (Review Focus 4).
  - `runCommand("cat nope", …).lines[0].tone === "error"`.
  - `runCommand("x".repeat(500), …)` does not throw and gives one error line.
  - `runCommand("theme crt", …).effect` deep-equals `{ kind: "crt", on: true }`.
  - `runCommand("sudo hire-me", …).effect?.kind === "goto"`.
  - `projectSlug(PROJECTS[0].title) === "access-os"`.
  - All `PROJECTS` slugs are unique.
  - `complete("ca")` is `["cat"]`, and `complete("cat acc")` is `["cat access-os"]`.
- [ ] **Step 2:** Run `npm test -- commands`. It should FAIL.
- [ ] **Step 3:** Implement `commands.ts`. The neofetch block art and fields are in the Motion Lab shell demo; use `PROFILE`.
- [ ] **Step 4:** Implement `Shell.tsx`:
  - A modal dialog (`role="dialog"`, `aria-modal`). It opens on Ctrl/⌘+K, even when focus is in an input, and on the navbar button. Escape closes it and returns focus.
  - The input supports ↑/↓ history and Tab completion.
  - Quick buttons: `help`, `ls projects`, `cat about.txt`, `sudo hire-me`.
  - Effects:
    - `goto`: on `/`, close, `glitchJump("contact")`, then `dispatchEvent(new Event("contact:focus"))`; elsewhere, `router.push("/#contact")`.
    - `crt`: calls `useCrt().set`.
    - `clear`: empties the output.
  - Keystroke and Enter sounds use `useSound`.
  - Use `font-variant-ligatures: none` in the output.
- [ ] **Step 5:** Wire the navbar button and the `ContactTerminal` listener and sounds.
- [ ] **Step 6:** Run `npm test && npm run build`. With the playwright-skill:
  - Ctrl+K opens the shell, and `sudo hire-me` + Enter scrolls to Contact with the contact input focused.
  - On `/x` (404), Ctrl+K works and `contact` navigates to `/#contact`.
- [ ] **Step 7:** Commit `feat(shell): Ctrl+K command palette shell`.

### Task 10: Stack tokens in backdrops, plus 404 token rain

**Files:**
- Create: `app/src/lib/ascii/tokens.ts`
- Modify: `app/src/components/SectionBackdrop/SectionBackdrop.tsx`: `CHARS`/`pick()` (line 7 onwards) and `paintGlyphs`
- Create: `app/src/components/SystemMessage/TokenRain.tsx`
- Modify: `app/src/components/SystemMessage/NotFoundTerminal.tsx`: render `<TokenRain />` behind the card (404 only; `error.tsx` untouched)

**Interfaces:**
- Produces: `STACK_TOKENS: readonly string[] = ["const", "=>", "{}", "</>", "npm", "git", "ts", "sql", "()", "&&", "??", "async", "await", "prisma", "0x", "fn", "===", "next", "[]", "use"]` and `tokenStream(rand?: () => number): () => string`. It returns the next character of a random token stream, with tokens separated by a single space.

- [ ] **Step 1:** In `SectionBackdrop` glyph mode, each drop draws the next char from its own `tokenStream()` instead of `pick()`. Keep alpha, trail and FRAME_MS unchanged.
- [ ] **Step 2:** Implement `TokenRain.tsx`, a full-viewport canvas behind the 404 card. Each column advances one 14 px cell; the head is drawn `#d1fae5`, the previous char `rgba(52,211,153,.9)`, and there is a `rgba(20,20,26,.07)` wipe per frame. Follow the canvas rules in Global Constraints. The Motion Lab rain demo has the fixed version (prev/cur tracking).
- [ ] **Step 3:** Run `npm run build`. In dev, the section side bands show stack tokens, `/nope` shows the rain behind a readable card, and the error page is unchanged.
- [ ] **Step 4:** Commit `feat(eggs): stack tokens in backdrops and 404 token rain`.

### Task 11: Text scroll progress

**Files:**
- Create: `app/src/lib/textBar.ts`
- Modify: `app/src/components/ScrollProgress/ScrollProgress.tsx`
- Test: `app/src/lib/textBar.test.ts`

**Interfaces:**
- Produces: `textBar(progress: number, cells = 10): string`. Clamps to 0..1 and returns `` `[${"█".repeat(n)}${"░".repeat(cells-n)}] ${pct}%` `` with `n = Math.round(p*cells)` and `pct = Math.round(p*100)`.

- [ ] **Step 1: Write the failing tests:**
  - `textBar(0) === "[░░░░░░░░░░] 0%"`
  - `textBar(0.62) === "[██████░░░░] 62%"`
  - `textBar(1.4) === "[██████████] 100%"`
  - `textBar(NaN) === "[░░░░░░░░░░] 0%"`
- [ ] **Step 2:** Run `npm test -- textBar`. It should FAIL.
- [ ] **Step 3:** Implement it.
- [ ] **Step 4:** On ≥ md, render a fixed mono pill (`text-xs text-foreground/60`, bottom-left, `pointer-events-none`) driven by `useScroll` and hidden at 0%. Below md, keep the existing 2 px bar. SSR renders the 0% state.
- [ ] **Step 5:** Run `npm test && npm run build`. Commit `feat: text scroll progress`.

### Task 12: Final verification

- [ ] **Step 1:** Run `npm test && npm run lint && npm run build`. All should pass.
- [ ] **Step 2:** With the playwright-skill, at 1280×900 and 400×860:
  - A new context first shows the boot, gone by 2 s.
  - The hero name and role are visible by 3 s.
  - `scrollWidth - innerWidth === 0`.
  - The console has no errors and no hydration warnings (Review Focus 1).
- [ ] **Step 3:** Temporarily set `HONOR_REDUCED_MOTION = true` and emulate `reducedMotion: "reduce"`. The boot is skipped, the glyph field shows a still frame, the npm output shows its final state, and nav jumps are instant. **Revert the flag to `false`** and confirm with `git diff app/src/lib/motion.ts` (empty).
- [ ] **Step 4:** In the DevTools Performance panel (or a `requestAnimationFrame` counter via Playwright), check that no canvas loop runs while scrolled to Contact with the hero off-screen, or while the tab is hidden.
- [ ] **Step 5:** Hand off with superpowers:finishing-a-development-branch.
