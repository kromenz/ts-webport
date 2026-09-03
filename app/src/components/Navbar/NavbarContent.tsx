"use client";

import { useEffect, useState, type MouseEvent } from "react";
import { motion } from "framer-motion";
import {
  Briefcase,
  EnvelopeSimple,
  FilePdf,
  FolderOpen,
  House,
  type Icon,
} from "@phosphor-icons/react";

const CV_URL = "/docs/Rafael_Andre.pdf";

type NavItem = {
  id: string;
  label: string;
  shortLabel: string;
  icon: Icon;
};

const NAV_ITEMS: NavItem[] = [
  { id: "hero", label: "Home", shortLabel: "Home", icon: House },
  {
    id: "experience",
    label: "Experience",
    shortLabel: "Work",
    icon: Briefcase,
  },
  {
    id: "projects",
    label: "Projects",
    shortLabel: "Projects",
    icon: FolderOpen,
  },
  {
    id: "contact",
    label: "Contact Me",
    shortLabel: "Contact",
    icon: EnvelopeSimple,
  },
];

type Props = {
  variant?: "default" | "compact";
};

const NavbarContent = ({ variant = "default" }: Props) => {
  const [activeSection, setActiveSection] = useState(NAV_ITEMS[0].id);
  const [hovered, setHovered] = useState<string | null>(null);

  // Real anchors, so the items are right-clickable and deep-linkable. The
  // handler only takes over to keep the existing smooth scroll.
  const goToSection = (
    event: MouseEvent<HTMLAnchorElement>,
    sectionId: string,
  ) => {
    const element = document.getElementById(sectionId);
    if (!element) return;
    event.preventDefault();
    element.scrollIntoView({ behavior: "smooth" });
    setActiveSection(sectionId);
  };

  useEffect(() => {
    const elements = NAV_ITEMS.map((item) =>
      document.getElementById(item.id),
    ).filter((el): el is HTMLElement => el !== null);
    if (elements.length === 0) return;

    // A thin band across the middle of the viewport. Sections are contiguous,
    // so exactly one crosses it at a time. Nothing is ever cleared, which
    // keeps the last section active once the footer pushes it past the band.
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        }
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 },
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  if (variant === "compact") {
    return (
      <ul className="flex items-center gap-0.5">
        {NAV_ITEMS.map((item) => {
          const ItemIcon = item.icon;
          const isActive = activeSection === item.id;
          return (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                onClick={(event) => goToSection(event, item.id)}
                aria-label={item.label}
                aria-current={isActive ? "true" : undefined}
                className={`relative flex flex-col items-center gap-1 rounded-full px-3 py-1.5 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-green-primary/60 ${
                  isActive ? "text-green-primary" : "text-slate-300"
                }`}>
                {isActive && (
                  <motion.span
                    layoutId="navActivePill"
                    className="absolute inset-0 rounded-full bg-green-primary/12"
                    initial={false}
                    transition={{ type: "spring", stiffness: 420, damping: 34 }}
                  />
                )}
                <ItemIcon
                  className="relative h-5 w-5"
                  weight={isActive ? "fill" : "regular"}
                  aria-hidden
                />
                <span className="relative text-[10px] leading-none">
                  {item.shortLabel}
                </span>
              </a>
            </li>
          );
        })}
      </ul>
    );
  }

  // The sliding highlight follows the cursor and falls back to the active
  // section, so there is never a moment with no indicator on screen.
  const highlighted = hovered ?? activeSection;

  return (
    <div className="flex items-center gap-3">
      <span
        className="select-none pl-1 text-xs text-foreground/35"
        aria-hidden>
        ~/rafael
      </span>

      <div className="flex items-center gap-0.5">
        {NAV_ITEMS.map((item) => {
          const isActive = activeSection === item.id;
          return (
            <a
              key={item.id}
              href={`#${item.id}`}
              onClick={(event) => goToSection(event, item.id)}
              onMouseEnter={() => setHovered(item.id)}
              onMouseLeave={() => setHovered(null)}
              onFocus={() => setHovered(item.id)}
              onBlur={() => setHovered(null)}
              aria-current={isActive ? "true" : undefined}
              className={`relative rounded-full px-3.5 py-1.5 text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-green-primary/60 ${
                isActive ? "text-green-primary" : "text-slate-300"
              }`}>
              {highlighted === item.id && (
                <motion.span
                  layoutId="navHighlight"
                  className="absolute inset-0 rounded-full bg-white/8"
                  initial={false}
                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                />
              )}
              <span className="relative">{item.label}</span>
            </a>
          );
        })}
      </div>

      <span className="h-4 w-px bg-white/10" aria-hidden />

      <a
        href={CV_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-sm font-medium text-foreground/80 outline-none transition-colors hover:border-green-primary/40 hover:bg-green-primary/10 hover:text-green-primary focus-visible:ring-2 focus-visible:ring-green-primary/60">
        <FilePdf className="h-4 w-4 shrink-0" weight="duotone" aria-hidden />
        My CV
      </a>
    </div>
  );
};

export default NavbarContent;
