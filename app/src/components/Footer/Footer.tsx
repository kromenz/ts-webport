/* eslint-disable react/jsx-no-comment-textnodes */
"use client";

import { motion } from "framer-motion";
import { ArrowUp, GithubLogo, Heart } from "@phosphor-icons/react";

const TECH = ["Next.js 16", "TypeScript", "Tailwind v4", "Framer Motion"];
const REPO_URL = "https://github.com/kromenz/ts-webport";
const YEAR = new Date().getFullYear();

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="relative mt-auto border-t border-white/10 bg-white/2">
      {/* Animated hairline that draws in from the center on enter */}
      <motion.div
        initial={{ scaleX: 0, opacity: 0 }}
        whileInView={{ scaleX: 1, opacity: 1 }}
        viewport={{ once: false, amount: 0.4 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        style={{ transformOrigin: "center" }}
        className="pointer-events-none absolute -top-px left-0 right-0 h-px bg-linear-to-r from-transparent via-green-primary/50 to-transparent"
        aria-hidden
      />

      <div className="container mx-auto px-4 py-5 md:py-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="grid gap-4 md:grid-cols-[1fr_auto] md:items-center">
          <div className="font-mono">
            <div className="flex items-center gap-2 text-green-primary/90 text-sm mb-1">
              <span className="select-none">$</span>
              <span>logout</span>
              <span
                className="ml-0.5 inline-block h-3 w-1 animate-pulse bg-green-primary/70"
                aria-hidden
              />
            </div>
            <p className="text-xs text-foreground/60 leading-relaxed">
              <span className="text-foreground/35">{"//"}</span> Crafted with{" "}
              <motion.span
                className="inline-block align-[-2px]"
                animate={{ scale: [1, 1.18, 1] }}
                transition={{
                  duration: 1.4,
                  repeat: Infinity,
                  repeatDelay: 1.2,
                  ease: "easeInOut",
                }}>
                <Heart
                  className="h-3 w-3 text-green-primary"
                  aria-hidden
                  weight="fill"
                />
              </motion.span>{" "}
              in Ponte de Lima · © {YEAR} Rafael André
            </p>
          </div>

          <div className="flex flex-col gap-2 md:items-end">
            <ul className="flex flex-wrap gap-1">
              {TECH.map((t, i) => (
                <motion.li
                  key={t}
                  initial={{ opacity: 0, y: 6 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: false, amount: 0.5 }}
                  transition={{
                    duration: 0.35,
                    ease: "easeOut",
                    delay: 0.15 + i * 0.06,
                  }}
                  className="rounded-full border border-white/10 bg-white/3 px-2 py-0.5 text-[10px] font-mono text-foreground/70 transition-colors hover:border-green-primary/40 hover:text-green-primary">
                  {t}
                </motion.li>
              ))}
            </ul>
            <div className="flex items-center gap-2.5 font-mono text-xs">
              <a
                href={REPO_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-1 text-foreground/65 transition-colors hover:text-green-primary">
                <GithubLogo
                  className="h-3.5 w-3.5 opacity-80 group-hover:opacity-100"
                  aria-hidden
                  weight="duotone"
                />
                <span>source</span>
              </a>
              <span className="text-foreground/20" aria-hidden>
                ·
              </span>
              <button
                type="button"
                onClick={scrollToTop}
                className="group inline-flex items-center gap-1 text-foreground/65 transition-colors hover:text-green-primary">
                <ArrowUp
                  className="h-3.5 w-3.5 opacity-80 group-hover:opacity-100 transition-transform group-hover:-translate-y-0.5"
                  aria-hidden
                  weight="bold"
                />
                <span>top</span>
              </button>
            </div>
          </div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: false, amount: 0.8 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-5 text-center font-mono text-[10px] uppercase tracking-[0.3em] text-foreground/30"
          aria-hidden>
          // end of file
        </motion.p>
      </div>
    </footer>
  );
};

export default Footer;
