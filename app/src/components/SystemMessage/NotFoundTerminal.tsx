"use client";

import { ArrowLeft } from "@phosphor-icons/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import SystemMessage from "./SystemMessage";

/** Everything this site actually has, in the order the page presents it. */
const ENTRIES = [
  { name: "experience/", href: "/#experience", external: false },
  { name: "projects/", href: "/#projects", external: false },
  { name: "contact/", href: "/#contact", external: false },
  { name: "Rafael_Andre.pdf", href: "/docs/Rafael_Andre.pdf", external: true },
];

/** Long enough to recognise the path, short enough not to break the card. */
const MAX_PATH = 42;

const NotFoundTerminal = () => {
  const pathname = usePathname();
  const shown =
    pathname.length > MAX_PATH ? `${pathname.slice(0, MAX_PATH)}…` : pathname;

  return (
    <SystemMessage
      shell="zsh"
      command={`cd ~${shown}`}
      stderr={`cd: no such file or directory: ~${shown}`}
      exitCode="404"
      note="nothing lives at that path. these do:"
      actions={
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-medium text-zinc-950 ring-2 ring-transparent transition-[color,box-shadow,background-color] hover:bg-transparent hover:text-white hover:ring-white focus-visible:outline-none focus-visible:ring-green-primary">
          <ArrowLeft className="h-4 w-4" weight="bold" aria-hidden />
          cd ~
        </Link>
      }>
      <p className="mb-2">
        <span className="select-none text-foreground/35">$</span>{" "}
        <span className="text-green-primary">ls ~</span>
      </p>
      <ul className="grid grid-cols-2 gap-x-6 gap-y-1.5 sm:grid-cols-4">
        {ENTRIES.map((entry) => (
          <li key={entry.href}>
            {entry.external ? (
              <a
                href={entry.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground/75 underline-offset-4 transition-colors hover:text-green-primary hover:underline focus-visible:text-green-primary">
                {entry.name}
              </a>
            ) : (
              <Link
                href={entry.href}
                className="text-foreground/75 underline-offset-4 transition-colors hover:text-green-primary hover:underline focus-visible:text-green-primary">
                {entry.name}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </SystemMessage>
  );
};

export default NotFoundTerminal;
