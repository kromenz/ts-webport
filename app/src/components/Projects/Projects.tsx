"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
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

type Project = (typeof PROJECTS)[number];

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

function ProjectCard({
  project,
  imageSizes,
}: {
  project: Project;
  imageSizes: string;
}) {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    card.style.setProperty("--mx", `${e.clientX - rect.left}px`);
    card.style.setProperty("--my", `${e.clientY - rect.top}px`);
  };

  return (
    <article
      onMouseMove={handleMouseMove}
      className="group relative flex h-full w-full">
      <div className="absolute inset-0 rounded-2xl bg-linear-to-br from-green-primary/20 via-transparent to-green-primary/5 p-px">
        <div className="h-full w-full rounded-2xl bg-background/90" />
      </div>

      <div
        ref={cardRef}
        className="relative flex min-h-0 w-full flex-1 flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/3 shadow-none transition-[border-color,box-shadow] duration-300 md:group-hover:border-green-primary/30 md:group-hover:shadow-[0_0_0_1px_rgba(52,211,153,0.15),0_24px_60px_-28px_rgba(0,0,0,0.65)]">
        <div
          className="pointer-events-none absolute inset-0 z-10 opacity-0 transition-opacity duration-300 md:group-hover:opacity-100"
          style={{
            background:
              "radial-gradient(420px circle at var(--mx,50%) var(--my,50%), rgba(52,211,153,0.16), transparent 45%)",
          }}
          aria-hidden
        />

        <div className="relative aspect-video shrink-0 overflow-hidden bg-white/4">
          {project.imageUrl ? (
            <Image
              src={project.imageUrl}
              alt={`Preview for ${project.title}`}
              fill
              sizes={imageSizes}
              className="object-cover motion-safe:md:group-hover:scale-[1.03] motion-safe:transition-transform motion-safe:duration-500 motion-safe:ease-out"
            />
          ) : (
            <ProjectImagePlaceholder title={project.title} />
          )}
          <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent opacity-0 transition-opacity duration-300 md:group-hover:opacity-100" />
          <div className="pointer-events-none absolute left-3 top-3 inline-flex max-w-[calc(100%-1.5rem)] items-center gap-1.5 rounded-full border border-white/15 bg-black/55 backdrop-blur-sm px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-white/90 font-mono">
            <span
              className="h-1 w-1 shrink-0 rounded-full bg-green-primary shadow-[0_0_6px_rgba(52,211,153,0.9)]"
              aria-hidden
            />
            <span className="truncate">{project.type}</span>
          </div>
        </div>

        <div className="flex flex-1 flex-col p-4 sm:p-5 md:p-6">
          <h3 className="text-base sm:text-lg font-semibold leading-snug text-foreground">
            {project.title}
          </h3>
          <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-foreground/65">
            {project.description}
          </p>
          {project.tech && project.tech.length > 0 && (
            <ul className="mt-4 flex flex-wrap gap-1.5">
              {project.tech.slice(0, 4).map((t) => (
                <li
                  key={t}
                  className="rounded-full border border-white/10 bg-white/3 px-2 py-0.5 text-[10px] font-mono text-foreground/70">
                  {t}
                </li>
              ))}
            </ul>
          )}
          <div className="mt-4 flex flex-wrap gap-2">
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`GitHub repository for ${project.title}`}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/4 px-3 py-1.5 text-xs font-medium text-foreground/80 transition-colors hover:border-green-primary/40 hover:bg-green-primary/10 hover:text-green-primary font-mono">
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
                aria-label={`Demo video for ${project.title}`}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/4 px-3 py-1.5 text-xs font-medium text-foreground/80 transition-colors hover:border-green-primary/40 hover:bg-green-primary/10 hover:text-green-primary font-mono">
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

const MARQUEE_IMAGE_SIZES = "20rem";

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

  // Two copies — the minimum to make a seamless infinite scroll.
  const loop = [...projects, ...projects];
  const animationName =
    direction === "left" ? "projects-marquee-left" : "projects-marquee-right";
  const effectiveDurationSec = durationSec * motionFactor;

  return (
    <div className="projects-marquee-row-shell relative py-3">
      <div
        className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-linear-to-r from-background via-background/80 to-transparent md:w-32 lg:w-48"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-linear-to-l from-background via-background/80 to-transparent md:w-32 lg:w-48"
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
          <div
            key={`${direction}-${project.title}-${index}`}
            className="flex w-80 shrink-0">
            <ProjectCard project={project} imageSizes={MARQUEE_IMAGE_SIZES} />
          </div>
        ))}
      </div>
    </div>
  );
}

const GRID_IMAGE_SIZES =
  "(max-width: 640px) calc(100vw - 2rem), (max-width: 768px) calc((100vw - 3rem) / 2), (max-width: 1024px) calc((100vw - 4rem) / 3), 20rem";

const Projects = () => {
  const motionFactor = useMarqueeMotionFactor();
  const mid = Math.ceil(PROJECTS.length / 2);
  const rowTop = PROJECTS.slice(0, mid);
  const rowBottom = PROJECTS.slice(mid);

  return (
    <section
      id="projects"
      className="relative overflow-hidden py-20 md:py-24">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.25]"
        aria-hidden>
        <div className="absolute -left-1/4 top-0 h-[420px] w-[420px] rounded-full bg-green-primary/15 blur-[60px]" />
        <div className="absolute -right-1/4 bottom-0 h-[380px] w-[380px] rounded-full bg-green-primary/10 blur-[60px]" />
        <div
          className="absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgb(255 255 255 / 0.06) 1px, transparent 1px),
              linear-gradient(to bottom, rgb(255 255 255 / 0.06) 1px, transparent 1px)
            `,
            backgroundSize: "48px 48px",
          }}
        />
      </div>

      <div className="container relative z-10 mx-auto px-4">
        <div className="mx-auto mb-10 md:mb-12 max-w-2xl text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground/80 font-mono">
            <span className="text-green-primary">{"~/"}</span>projects
          </h2>
        </div>
      </div>

      {/* Small / Medium: responsive grid (no horizontal scroll) */}
      <div className="lg:hidden">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
          <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 md:grid-cols-3">
            {PROJECTS.map((project) => (
              <li key={`grid-${project.title}`} className="flex">
                <ProjectCard
                  project={project}
                  imageSizes={GRID_IMAGE_SIZES}
                />
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Large: animated marquee rows */}
      <div className="relative left-1/2 z-10 hidden w-screen max-w-[100vw] -translate-x-1/2 space-y-4 overflow-x-hidden lg:block">
        <MarqueeRow
          projects={rowTop}
          direction="left"
          durationSec={30}
          motionFactor={motionFactor}
        />
        {rowBottom.length > 0 && (
          <MarqueeRow
            projects={rowBottom}
            direction="right"
            durationSec={30}
            motionFactor={motionFactor}
          />
        )}
      </div>
    </section>
  );
};

export default Projects;
