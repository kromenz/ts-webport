"use client";

import { motion, type Variants } from "framer-motion";
import type { ReactNode } from "react";

import SectionBackdrop from "@/src/components/SectionBackdrop/SectionBackdrop";
import { useSiteReducedMotion } from "@/src/lib/motion";

type Props = {
  /** Shell name in the window chrome, e.g. "zsh". */
  shell: string;
  /** The command the visitor effectively ran to land here. */
  command: string;
  /** What that command wrote to stderr. */
  stderr: string;
  /** The value of `$?` afterwards. Printed large, because it is the point. */
  exitCode: string;
  /** One plain-language line about what to do next. */
  note: string;
  /** Output that follows the note: a listing, an error digest, whatever fits. */
  children?: ReactNode;
  /** Ways out of here. */
  actions: ReactNode;
};

/**
 * The dead-end page shared by `not-found` and the root error boundary.
 *
 * Both are the same moment (a command failed, here is the exit code, here is
 * the way back), so they are one component with different output rather than
 * two pages that drift apart.
 */
const SystemMessage = ({
  shell,
  command,
  stderr,
  exitCode,
  note,
  children,
  actions,
}: Props) => {
  const reduce = useSiteReducedMotion();

  // Lines arrive in sequence because that is how a shell prints them. The
  // stagger is the whole animation; nothing loops after it settles.
  const list: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: reduce ? 0 : 0.07 } },
  };
  const row: Variants = {
    hidden: { opacity: 0, y: reduce ? 0 : 4 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: reduce ? 0 : 0.3, ease: "easeOut" },
    },
  };

  return (
    <main className="relative isolate flex min-h-[100dvh] items-center justify-center overflow-hidden px-4 py-16">
      <SectionBackdrop />

      <motion.section
        initial={{ opacity: 0, y: reduce ? 0 : 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduce ? 0 : 0.5, ease: "easeOut" }}
        className="relative z-10 w-full max-w-2xl overflow-hidden rounded-xl border border-white/10 bg-white/3 shadow-2xl shadow-black/50 backdrop-blur-sm">
        <div className="flex items-center gap-2 border-b border-white/10 bg-white/3 px-4 py-2.5">
          <span
            className="h-2.5 w-2.5 rounded-full bg-red-400/70"
            aria-hidden
          />
          <span
            className="h-2.5 w-2.5 rounded-full bg-yellow-400/70"
            aria-hidden
          />
          <span
            className="h-2.5 w-2.5 rounded-full bg-green-primary/80"
            aria-hidden
          />
          <span className="ml-2 font-mono text-xs text-foreground/40">
            {shell}
          </span>
        </div>

        <motion.div
          variants={list}
          initial="hidden"
          animate="show"
          className="px-5 py-7 font-mono text-sm leading-relaxed sm:px-8 sm:py-9">
          <motion.p variants={row}>
            <span className="select-none text-foreground/35">$</span>{" "}
            <span className="text-green-primary">{command}</span>
          </motion.p>

          <motion.p
            variants={row}
            className="mt-1 break-words text-red-400"
            role="alert">
            {stderr}
          </motion.p>

          <motion.p variants={row} className="mt-5">
            <span className="select-none text-foreground/35">$</span>{" "}
            <span className="text-green-primary">echo $?</span>
          </motion.p>

          <motion.p
            variants={row}
            className="mt-1 text-5xl font-semibold tracking-tight text-white sm:text-6xl">
            {exitCode}
          </motion.p>

          <motion.p variants={row} className="mt-7 text-foreground/55">
            <span className="text-foreground/30">{"//"}</span> {note}
          </motion.p>

          {children ? (
            <motion.div variants={row} className="mt-4">
              {children}
            </motion.div>
          ) : null}

          <motion.div
            variants={row}
            className="mt-8 flex flex-wrap items-center gap-3">
            {actions}
          </motion.div>

          <motion.p
            variants={row}
            className="mt-7 flex items-center text-foreground/35"
            aria-hidden>
            <span className="select-none">$</span>
            <span className="animate-terminal-blink ml-2 inline-block h-4 w-2 bg-green-primary/70" />
          </motion.p>
        </motion.div>
      </motion.section>
    </main>
  );
};

export default SystemMessage;
