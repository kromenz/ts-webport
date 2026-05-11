"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { GithubLogo, PlayCircle } from "@phosphor-icons/react";

import { PROJECTS } from "@/src/data/data";

function useMarqueeMotionFactor() {
  const [factor, setFactor] = useState(1);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setFactor(mq.matches ? 5 : 1);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  return factor;
}

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 769); // Tailwind's md breakpoint is 768px
    };

    // Check on mount
    checkIsMobile();

    // Update on resize
    window.addEventListener("resize", checkIsMobile);
    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);

  return isMobile;
}

type Project = (typeof PROJECTS)[number];

function ProjectImagePlaceholder({ title }: { title: string }) {
  return (
    <div
      className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-linear-to-br from-zinc-100 via-white to-cyan-50/40 dark:from-zinc-900 dark:via-zinc-950 dark:to-cyan-950/20"
      aria-hidden>
      <svg
        className="h-14 w-14 text-cyan-500/35 dark:text-cyan-400/25"
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
      <span className="max-w-[85%] truncate px-2 text-center text-[10px] font-medium uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500">
        {title}
      </span>
    </div>
  );
}

function ProjectCard({ project }: { project: Project }) {
  return (
    <article className="group relative flex h-full w-[min(22rem,calc(100vw-2.5rem))] shrink-0">
      <div className="absolute inset-0 rounded-2xl bg-linear-to-br from-cyan-500/25 via-transparent to-violet-500/20 p-px dark:from-cyan-400/20 dark:to-violet-500/15">
        <div className="h-full w-full rounded-2xl bg-zinc-50/90 dark:bg-zinc-950/90" />
      </div>

      <div className="relative flex min-h-0 w-full flex-1 flex-col overflow-hidden rounded-2xl border border-zinc-200/90 bg-white/75 shadow-sm backdrop-blur-md transition-[border-color,box-shadow] duration-300 dark:border-white/10 dark:bg-zinc-900/55 dark:shadow-none md:group-hover:border-cyan-500/25 md:group-hover:shadow-[0_0_0_1px_rgba(6,182,212,0.12),0_20px_50px_-24px_rgba(0,0,0,0.35)] md:dark:group-hover:shadow-[0_0_0_1px_rgba(34,211,238,0.15),0_24px_60px_-28px_rgba(0,0,0,0.65)]">
        <div className="relative aspect-16/10 shrink-0 overflow-hidden bg-zinc-100 dark:bg-zinc-800/80">
          {project.imageUrl ? (
            <Image
              src={project.imageUrl}
              alt={`Preview for ${project.title}`}
              fill
              sizes="360px"
              className="object-cover motion-safe:md:group-hover:scale-[1.03] motion-reduce:md:group-hover:scale-100 motion-safe:transition-transform motion-safe:duration-500 motion-safe:ease-out"
            />
          ) : (
            <ProjectImagePlaceholder title={project.title} />
          )}
          <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/25 via-transparent to-transparent opacity-0 transition-opacity duration-300 dark:from-black/40 md:group-hover:opacity-100" />
          <div className="pointer-events-none absolute left-3 top-3 flex items-center gap-1.5 rounded-full border border-white/20 bg-black/35 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-white/90 backdrop-blur-sm dark:bg-black/45">
            <span
              className="h-1 w-1 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.9)]"
              aria-hidden
            />
            build
          </div>
        </div>

        <div className="flex flex-1 flex-col p-5 md:p-6">
          <h3 className="text-lg font-semibold leading-snug text-zinc-900 dark:text-white">
            {project.title}
          </h3>
          <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            {project.description}
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200/90 bg-zinc-50/80 px-3 py-1.5 text-xs font-medium text-zinc-800 transition-colors hover:border-cyan-500/40 hover:bg-cyan-50/50 hover:text-cyan-900 dark:border-white/10 dark:bg-white/5 dark:text-zinc-200 dark:hover:border-cyan-400/35 dark:hover:bg-cyan-950/30 dark:hover:text-cyan-100">
              <GithubLogo
                className="h-3.5 w-3.5 opacity-80"
                aria-hidden
                weight="duotone"
              />
              GitHub
            </a>
            {project.videoUrl ? (
              <a
                href={project.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200/90 bg-zinc-50/80 px-3 py-1.5 text-xs font-medium text-zinc-800 transition-colors hover:border-violet-500/35 hover:bg-violet-50/50 hover:text-violet-900 dark:border-white/10 dark:bg-white/5 dark:text-zinc-200 dark:hover:border-violet-400/35 dark:hover:bg-violet-950/25 dark:hover:text-violet-100">
                <PlayCircle
                  className="h-3.5 w-3.5 opacity-80"
                  aria-hidden
                  weight="duotone"
                />
                Demo
              </a>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}

function MarqueeRow({
  projects,
  direction,
  durationSec,
  motionFactor,
}: {
  projects: Project[];
  direction: "left" | "right";
  durationSec: number;
  motionFactor: number;
}) {
  if (projects.length === 0) return null;

  const loop = [...projects, ...projects];
  const animationName =
    direction === "left" ? "projects-marquee-left" : "projects-marquee-right";
  const effectiveDurationSec = durationSec * motionFactor;

  return (
    <div className="projects-marquee-row-shell relative py-3">
      <div
        className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-linear-to-r from-zinc-50 to-transparent dark:from-black md:w-16"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-linear-to-l from-zinc-50 to-transparent dark:from-black md:w-16"
        aria-hidden
      />
      <div
        className="projects-marquee-track flex w-max items-stretch gap-6"
        style={{
          animationName,
          animationDuration: `${effectiveDurationSec}s`,
          animationTimingFunction: "linear",
          animationIterationCount: "infinite",
          willChange: "transform",
        }}>
        {loop.map((project, index) => (
          <ProjectCard
            key={`${direction}-${project.title}-${index}`}
            project={project}
          />
        ))}
      </div>
    </div>
  );
}

const Projects = () => {
  const motionFactor = useMarqueeMotionFactor();
  const isMobile = useIsMobile();
  const mid = Math.ceil(PROJECTS.length / 2);
  const rowTop = PROJECTS.slice(0, mid);
  const rowBottom = PROJECTS.slice(mid);

  return (
    <section
      id="projects"
      className="relative overflow-hidden border-y border-zinc-200/80 bg-zinc-50 py-24 dark:border-white/5 dark:bg-black">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35] dark:opacity-[0.2]"
        aria-hidden>
        <div className="absolute -left-1/4 top-0 h-[420px] w-[420px] rounded-full bg-cyan-400/20 blur-[100px] dark:bg-cyan-500/15" />
        <div className="absolute -right-1/4 bottom-0 h-[380px] w-[380px] rounded-full bg-violet-500/15 blur-[100px] dark:bg-violet-500/10" />
        <div
          className="absolute inset-0 dark:opacity-[0.12]"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgb(24 24 27 / 0.06) 1px, transparent 1px),
              linear-gradient(to bottom, rgb(24 24 27 / 0.06) 1px, transparent 1px)
            `,
            backgroundSize: "48px 48px",
          }}
        />
      </div>

      <div className="container relative z-10 mx-auto px-4">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white md:text-4xl">
            Projects
          </h2>
        </div>
      </div>

      {/* Mobile view: simple horizontal scroll */}
      {isMobile && (
        <div className="px-4 pb-10">
          <div className="overflow-x-auto whitespace-nowrap py-8 scrollbar-hidden">
            <div className="inline-flex items-center space-x-6">
              {PROJECTS.map((project, index) => (
                <ProjectCard
                  key={`mobile-${project.title}-${index}`}
                  project={project}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Desktop view: animated marquee rows */}
      {!isMobile && (
        <div className="relative left-1/2 z-10 w-screen max-w-[100vw] -translate-x-1/2 space-y-4 overflow-x-hidden">
          <MarqueeRow
            projects={rowTop}
            direction="left"
            durationSec={10}
            motionFactor={motionFactor}
          />
          <MarqueeRow
            projects={rowBottom.length > 0 ? rowBottom : rowTop}
            direction="right"
            durationSec={10}
            motionFactor={motionFactor}
          />
        </div>
      )}
    </section>
  );
};

export default Projects;
