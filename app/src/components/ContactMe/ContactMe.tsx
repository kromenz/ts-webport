"use client";

import { useSyncExternalStore } from "react";
import { motion } from "framer-motion";
import SectionDivider from "@/src/components/SectionDivider/SectionDivider";
import ContactTerminal from "./ContactTerminal";

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

  return (
    <section id="contact" className="relative py-20 md:py-28">
      <SectionDivider command="cd ../contacts" />
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.97 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: false, amount: 0.25 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.05 }}
          className="max-w-4xl mx-auto rounded-2xl border border-white/10 bg-white/2 backdrop-blur-sm overflow-hidden shadow-xl shadow-black/20">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10 bg-white/3">
            <span className="w-3 h-3 rounded-full bg-red-400/70" />
            <span className="w-3 h-3 rounded-full bg-yellow-400/70" />
            <span className="w-3 h-3 rounded-full bg-green-primary/80" />
            <span className="ml-3 text-xs text-foreground/50 font-mono truncate">
              contact.sh
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

            <p className="text-foreground/75 leading-relaxed mb-6 text-sm md:text-base">
              Currently open to new opportunities. Pick a channel below — I&apos;ll
              get back to you as soon as I can.
            </p>

            <ContactTerminal />

            <div className="mt-8 flex justify-center overflow-x-auto">
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
