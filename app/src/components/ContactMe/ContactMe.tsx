"use client";

import { useState, useSyncExternalStore } from "react";
import { motion } from "framer-motion";
import { Check, Copy, GithubLogo, LinkedinLogo } from "@phosphor-icons/react";
import SectionDivider from "@/src/components/SectionDivider/SectionDivider";

const EMAIL = "andrerafael892@gmail.com";

const SOCIALS = [
  {
    flag: "--linkedin",
    href: "https://www.linkedin.com/in/rafael-andr%C3%A9/",
    Icon: LinkedinLogo,
  },
  {
    flag: "--github",
    href: "https://github.com/kromenz",
    Icon: GithubLogo,
  },
];

const SIGNATURE = [
  "  ____         __            _      _              _",
  " |  _ \\ __ _ / _| __ _  ___| |    / \\   _ __   __| |_ __ ___",
  " | |_) / _` | |_ / _` |/ _ \\ |   / _ \\ | '_ \\ / _` | '__/ _ \\",
  " |  _ < (_| |  _| (_| |  __/ |  / ___ \\| | | | (_| | | |  __/",
  " |_| \\_\\__,_|_|  \\__,_|\\___|_| /_/   \\_\\_| |_|\\__,_|_|  \\___|",
].join("\n");

function formatLisbonTime(): string {
  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Lisbon",
    hour12: false,
  }).format(new Date());
}

const subscribeTime = (callback: () => void) => {
  const id = setInterval(callback, 30000);
  return () => clearInterval(id);
};
const getTimeSnapshot = () => formatLisbonTime();
const getServerTimeSnapshot = (): string | null => null;

const ContactMe = () => {
  const time = useSyncExternalStore(
    subscribeTime,
    getTimeSnapshot,
    getServerTimeSnapshot,
  );
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard API can fail in insecure contexts; fall back silently.
    }
  };

  return (
    <section id="contact" className="relative py-20 md:py-28">
      <SectionDivider command="cd ../contacts" />
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.97 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: false, amount: 0.25 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.05 }}
          className="max-w-2xl mx-auto rounded-2xl border border-white/10 bg-white/2 backdrop-blur-sm overflow-hidden shadow-xl shadow-black/20">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10 bg-white/3">
            <span className="w-3 h-3 rounded-full bg-red-400/70" />
            <span className="w-3 h-3 rounded-full bg-yellow-400/70" />
            <span className="w-3 h-3 rounded-full bg-green-primary/80" />
            <span className="ml-3 text-xs text-foreground/50 font-mono truncate">
              get-in-touch.sh
            </span>
          </div>

          <div className="p-6 md:p-8 font-mono">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-foreground/55 mb-6">
              <span className="text-foreground/40">{"//"}</span>
              <span>Lisbon</span>
              <span className="text-foreground/30">·</span>
              <span className="tabular-nums" suppressHydrationWarning>
                {time ?? "--:--"}
              </span>
              <span className="text-foreground/30">·</span>
              <span className="inline-flex items-center gap-1.5">
                <span className="relative inline-flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-primary opacity-60" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-green-primary" />
                </span>
                <span className="text-green-primary/90">available</span>
              </span>
            </div>

            <p className="text-foreground/75 leading-relaxed mb-8 text-sm md:text-base">
              Currently open to new opportunities. Whether you have a question
              or just want to say hi, I&apos;ll try my best to get back to you
              as soon as possible.
            </p>

            <div className="mb-6">
              <div className="flex items-center gap-2 text-green-primary/90 text-sm mb-1">
                <span className="select-none">$</span>
                <span>echo $EMAIL</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="select-none text-green-primary/70" aria-hidden>
                  ▹
                </span>
                <a
                  href={`mailto:${EMAIL}`}
                  className="text-foreground hover:text-green-primary transition-colors underline decoration-dotted underline-offset-4 hover:decoration-solid">
                  {EMAIL}
                </a>
                <button
                  type="button"
                  onClick={handleCopy}
                  aria-label={copied ? "Email copied" : "Copy email"}
                  className="inline-flex items-center justify-center rounded-md p-1 text-foreground/50 transition-colors hover:bg-white/5 hover:text-foreground">
                  {copied ? (
                    <Check
                      className="h-3.5 w-3.5 text-green-primary"
                      aria-hidden
                      weight="bold"
                    />
                  ) : (
                    <Copy className="h-3.5 w-3.5" aria-hidden weight="bold" />
                  )}
                </button>
                {copied && (
                  <span className="text-xs text-green-primary/80">copied!</span>
                )}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 text-green-primary/90 text-sm mb-2">
                <span className="select-none">$</span>
                <span>socials --</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {SOCIALS.map(({ flag, href, Icon }) => (
                  <a
                    key={flag}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/3 px-3 py-1.5 text-xs text-foreground/75 transition-colors hover:border-green-primary/40 hover:bg-green-primary/10 hover:text-green-primary">
                    <Icon
                      className="h-3.5 w-3.5 opacity-75 group-hover:opacity-100"
                      aria-hidden
                      weight="duotone"
                    />
                    <span>{flag}</span>
                  </a>
                ))}
              </div>
            </div>
            <div className="mt-10 flex justify-center overflow-x-auto">
              <pre
                className="select-none text-[8px] sm:text-[10px] leading-tight text-foreground/25"
                aria-hidden>
                {SIGNATURE}
              </pre>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ContactMe;
