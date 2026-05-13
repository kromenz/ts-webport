# ts-webport

Rafael André's personal portfolio — a terminal/IDE-inspired single-page site built with Next.js.

The design borrows from code editors: window chromes with mac-style dots, mono fonts everywhere, `~/section` headings, command prompts like `$ echo $EMAIL`, and a custom dark scrollbar.

## Sections

- **Hero** — name, role, and a starfield background.
- **Experience** — IDE-style window with a sidebar of roles. The Worldover entry has a `letter-of-recommendation.pdf` attachment that opens inline in an iframe (like a PDF viewer extension).
- **Projects** — responsive grid on mobile/tablet; animated marquee with two infinite rows on desktop.
- **Contact** — terminal block with status, local time (Lisbon), copy-to-clipboard email, social links styled as CLI flags, and an ASCII signature.
- **Footer** — sign-off line, tech-stack pills, and small entrance animations.

## Stack

- [Next.js 16](https://nextjs.org) (App Router) + TypeScript
- [Tailwind CSS v4](https://tailwindcss.com)
- [Framer Motion](https://www.framer.com/motion/)
- [Phosphor Icons](https://phosphoricons.com)

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project structure

```
app/
  layout.tsx                # root layout, fonts, metadata
  page.tsx                  # composes all sections
  globals.css               # Tailwind + custom scrollbar styles
  src/
    components/             # Navbar, Hero, Experience, Projects, ContactMe, Footer, ScrollButton
    data/data.ts            # SKILLS / PROJECTS / WORK_EXPERIENCE arrays
public/
  docs/                     # CV and recommendation letter (served as /docs/*.pdf)
```

## Content edits

All site content lives in `app/src/data/data.ts`:

- `PROJECTS` — title, type, description, tech, image, links.
- `WORK_EXPERIENCE` — title, position, dates, responsibilities, skills. Optional `attachments` array renders inline file tiles inside the IDE window.

Static assets like the CV go in `public/docs/` and are linked via absolute paths (e.g. `/docs/Rafael_Andre.pdf`).
