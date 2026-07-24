/* eslint-disable react/jsx-no-comment-textnodes */
"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { GithubLogo, PlayCircle, Globe } from "@phosphor-icons/react";

import { PROJECTS } from "@/src/data/data";
import SectionDivider from "@/src/components/SectionDivider/SectionDivider";

type Project = (typeof PROJECTS)[number];

const TYPE_ORDER = ["Work", "Personal", "University"] as const;

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function ProjectImagePlaceholder({ title }: { title: string }) {
  return (
    <div
      className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-linear-to-br from-white/3 via-transparent to-green-primary/5"
      aria-hidden>
      <svg
        className="h-14 w-14 text-green-primary/30"
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="32" r="3" fill="currentColor" />
        <circle cx="32" cy="14" r="3" fill="currentColor" />
        <circle cx="52" cy="32" r="3" fill="currentColor" />
        <circle cx="32" cy="50" r="3" fill="currentColor" />
        <circle
          cx="32"
          cy="32"
          r="4"
          fill="currentColor"
          className="opacity-60"
        />
        <path
          d="M15 32h14M32 17v14M49 32H35M32 35v14"
          stroke="currentColor"
          strokeWidth="1"
          strokeOpacity="0.35"
        />
      </svg>
      <span className="max-w-[85%] truncate px-2 text-center text-[10px] font-medium uppercase tracking-[0.2em] text-foreground/40">
        {title}
      </span>
    </div>
  );
}

const Projects = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = PROJECTS[activeIndex];

  const groups = useMemo(() => {
    const byType = new Map<string, { project: Project; index: number }[]>();
    PROJECTS.forEach((project, index) => {
      const key = project.type ?? "Other";
      if (!byType.has(key)) byType.set(key, []);
      byType.get(key)!.push({ project, index });
    });
    const ordered: {
      type: string;
      items: { project: Project; index: number }[];
    }[] = [];
    TYPE_ORDER.forEach((type) => {
      const items = byType.get(type);
      if (items && items.length > 0) ordered.push({ type, items });
      byType.delete(type);
    });
    byType.forEach((items, type) => ordered.push({ type, items }));
    return ordered;
  }, []);

  const activeSlug = slugify(active.title);
  const hasLinks = Boolean(
    active.githubUrl || active.liveUrl || active.videoUrl,
  );

  return (
    <section id="projects" className="pt-24 pb-32 md:pb-40">
      <SectionDivider command="cd ../projects" />
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.97 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.05 }}
          className="max-w-7xl mx-auto rounded-2xl border border-white/10 bg-white/2 backdrop-blur-sm overflow-hidden shadow-xl shadow-black/20">
          {/* Window chrome */}
          <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10 bg-white/3">
            <span className="w-3 h-3 rounded-full bg-red-400/70" />
            <span className="w-3 h-3 rounded-full bg-yellow-400/70" />
            <span className="w-3 h-3 rounded-full bg-green-primary/80" />
            <span className="ml-3 text-xs text-foreground/50 font-mono truncate">
              projects/{activeSlug}.md
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] md:h-[700px]">
            {/* Sidebar / file tree */}
            <div className="flex md:flex-col overflow-x-auto md:overflow-x-visible md:overflow-y-auto border-b md:border-b-0 md:border-r border-white/10 scrollbar-custom">
              {groups.map((group) => (
                <div
                  key={group.type}
                  className="flex md:block shrink-0 md:shrink">
                  <div className="hidden md:block px-4 pt-4 pb-2 text-[10px] uppercase tracking-[0.18em] font-mono text-foreground/40">
                    // {group.type.toLowerCase()}
                  </div>
                  {group.items.map(({ project, index }) => {
                    const isActive = index === activeIndex;
                    return (
                      <button
                        key={index}
                        onClick={() => setActiveIndex(index)}
                        className={`relative shrink-0 md:shrink text-left px-4 py-2.5 transition-colors font-mono text-sm whitespace-nowrap md:whitespace-normal ${
                          isActive
                            ? "bg-white/4 text-foreground"
                            : "text-foreground/55 hover:text-foreground hover:bg-white/2"
                        }`}>
                        {isActive && (
                          <motion.span
                            layoutId="projectsTab"
                            className="absolute left-0 top-0 bottom-0 w-0.5 bg-green-primary md:block hidden"
                            transition={{
                              type: "spring",
                              stiffness: 500,
                              damping: 35,
                            }}
                          />
                        )}
                        {isActive && (
                          <motion.span
                            layoutId="projectsTabMobile"
                            className="absolute left-0 right-0 bottom-0 h-0.5 bg-green-primary md:hidden"
                            transition={{
                              type: "spring",
                              stiffness: 500,
                              damping: 35,
                            }}
                          />
                        )}
                        <div className="flex items-center gap-2">
                          <span className="text-green-primary/70">{"▸"}</span>
                          <span className="font-medium truncate">
                            {project.title}
                          </span>
                        </div>
                        <span className="block text-xs text-foreground/45 md:ml-4 ml-5">
                          {project.type}
                        </span>
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* Content pane */}
            <div className="relative md:min-h-0">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`project-${activeIndex}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="p-6 md:p-8 md:absolute md:inset-0 md:overflow-y-auto scrollbar-custom">
                  <div className="group relative mx-auto aspect-video w-full max-w-xl">
                    <div
                      className="pointer-events-none absolute -inset-6 rounded-3xl bg-green-primary/25 opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100"
                      aria-hidden
                    />
                    <div className="relative h-full w-full overflow-hidden rounded-lg border border-white/10 bg-white/4 transition-colors duration-300 group-hover:border-green-primary/40">
                      {active.imageUrl ? (
                        <Image
                          src={active.imageUrl}
                          alt={`Preview for ${active.title}`}
                          fill
                          sizes="(max-width: 768px) 100vw, 40rem"
                          className="object-cover"
                        />
                      ) : (
                        <ProjectImagePlaceholder title={active.title} />
                      )}
                      <div className="pointer-events-none absolute left-3 top-3 inline-flex max-w-[calc(100%-1.5rem)] items-center gap-1.5 rounded-full border border-white/15 bg-black/55 backdrop-blur-sm px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-white/90 font-mono">
                        <span
                          className="h-1 w-1 shrink-0 rounded-full bg-green-primary shadow-[0_0_6px_rgba(52,211,153,0.9)]"
                          aria-hidden
                        />
                        <span className="truncate">{active.type}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-col md:flex-row md:items-baseline md:justify-between gap-1 mb-1">
                    <h3 className="text-xl font-bold text-foreground">
                      {active.title}
                    </h3>
                  </div>

                  <p className="mt-3 text-sm leading-relaxed text-foreground/75">
                    {active.description}
                  </p>

                  {active.tech && active.tech.length > 0 && (
                    <div className="mt-7 pt-5 border-t border-white/10">
                      <p className="text-xs uppercase tracking-wider text-foreground/45 font-mono mb-3">
                        // tech stack
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {active.tech.map((t, i) => (
                          <motion.span
                            key={t}
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                              duration: 0.2,
                              delay: 0.05 * i,
                            }}
                            className="px-3 py-1 text-xs rounded-full border border-white/10 bg-white/3 text-green-primary/90 hover:border-green-primary/40 hover:bg-green-primary/10 transition-colors cursor-default font-mono">
                            {t}
                          </motion.span>
                        ))}
                      </div>
                    </div>
                  )}

                  {hasLinks && (
                    <div className="mt-7 pt-5 border-t border-white/10">
                      <p className="text-xs uppercase tracking-wider text-foreground/45 font-mono mb-3">
                        // links
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {active.githubUrl ? (
                          <a
                            href={active.githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`GitHub repository for ${active.title}`}
                            className="inline-flex items-center gap-2 rounded-md border border-white/10 bg-white/3 px-3 py-2 font-mono text-xs text-foreground/75 transition-colors hover:border-green-primary/40 hover:bg-green-primary/10 hover:text-foreground">
                            <GithubLogo
                              className="h-4 w-4 shrink-0 text-green-primary/70"
                              aria-hidden
                              weight="duotone"
                            />
                            <span className="truncate">GitHub</span>
                          </a>
                        ) : null}
                        {active.liveUrl ? (
                          <a
                            href={active.liveUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`Live site for ${active.title}`}
                            className="inline-flex items-center gap-2 rounded-md border border-white/10 bg-white/3 px-3 py-2 font-mono text-xs text-foreground/75 transition-colors hover:border-green-primary/40 hover:bg-green-primary/10 hover:text-foreground">
                            <Globe
                              className="h-4 w-4 shrink-0 text-green-primary/70"
                              aria-hidden
                              weight="duotone"
                            />
                            <span className="truncate">Live site</span>
                          </a>
                        ) : null}
                        {active.videoUrl ? (
                          <a
                            href={active.videoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`Demo video for ${active.title}`}
                            className="inline-flex items-center gap-2 rounded-md border border-white/10 bg-white/3 px-3 py-2 font-mono text-xs text-foreground/75 transition-colors hover:border-green-primary/40 hover:bg-green-primary/10 hover:text-foreground">
                            <PlayCircle
                              className="h-4 w-4 shrink-0 text-green-primary/70"
                              aria-hidden
                              weight="duotone"
                            />
                            <span className="truncate">Demo</span>
                          </a>
                        ) : null}
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Projects;
