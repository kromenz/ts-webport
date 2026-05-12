/* eslint-disable react/jsx-no-comment-textnodes */
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { WORK_EXPERIENCE } from "@/src/data/data";

type Responsibility = string | string[];

type Experience = {
  title: string;
  position: string;
  date: string;
  responsibilities: Responsibility[];
  skills?: string[];
};

const EXPERIENCES = WORK_EXPERIENCE as Experience[];

const Experience = () => {
  const [activeIndex, setActiveIndex] = useState(EXPERIENCES.length - 1);
  const active = EXPERIENCES[activeIndex];

  return (
    <section id="experience" className="pt-24 pb-40 md:pb-48">
      <div className="container mx-auto px-4">
        <h2 className="text-center text-2xl md:text-3xl font-bold text-foreground/80 mb-12 font-mono">
          <span className="text-green-primary">{"~/"}</span>work-experience
        </h2>

        <div className="max-w-5xl mx-auto rounded-2xl border border-white/10 bg-white/2 backdrop-blur-sm overflow-hidden shadow-xl shadow-black/20">
          {/* Window chrome */}
          <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10 bg-white/3">
            <span className="w-3 h-3 rounded-full bg-red-400/70" />
            <span className="w-3 h-3 rounded-full bg-yellow-400/70" />
            <span className="w-3 h-3 rounded-full bg-green-primary/80" />
            <span className="ml-3 text-xs text-foreground/50 font-mono truncate">
              {active.title.toLowerCase().replace(/\s+/g, "-")}.md
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[260px_1fr]">
            <div className="flex md:flex-col overflow-x-auto md:overflow-visible border-b md:border-b-0 md:border-r border-white/10 scrollbar-hidden">
              {EXPERIENCES.map((exp, i) => {
                const isActive = i === activeIndex;
                return (
                  <button
                    key={i}
                    onClick={() => setActiveIndex(i)}
                    className={`relative shrink-0 md:shrink text-left px-4 py-3 transition-colors font-mono text-sm whitespace-nowrap md:whitespace-normal ${
                      isActive
                        ? "bg-white/4 text-foreground"
                        : "text-foreground/55 hover:text-foreground hover:bg-white/2"
                    }`}>
                    {isActive && (
                      <motion.span
                        layoutId="experienceTab"
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
                        layoutId="experienceTabMobile"
                        className="absolute left-0 right-0 bottom-0 h-0.5 bg-green-primary md:hidden"
                        transition={{
                          type: "spring",
                          stiffness: 500,
                          damping: 35,
                        }}
                      />
                    )}
                    <div className="flex items-center gap-2">
                      <span className="text-green-primary/70">{">"}</span>
                      <span className="font-medium">{exp.title}</span>
                    </div>
                    <span className="block text-xs text-foreground/45 md:ml-4 ml-5">
                      {exp.position}
                    </span>
                  </button>
                );
              })}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeIndex}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="p-6 md:p-8">
                <div className="flex flex-col md:flex-row md:items-baseline md:justify-between gap-1 mb-1">
                  <h3 className="text-xl font-bold text-foreground">
                    {active.title}
                    <span className="text-foreground/55 font-normal">
                      {" "}
                      / {active.position}
                    </span>
                  </h3>
                  <span className="text-xs font-mono text-green-primary/90 shrink-0">
                    {active.date}
                  </span>
                </div>

                <div className="space-y-3 text-foreground/75 text-sm leading-relaxed mt-6">
                  {active.responsibilities.map((responsibility, respIndex) =>
                    Array.isArray(responsibility) ? (
                      <ul key={respIndex} className="space-y-1.5 pl-1">
                        {responsibility.map((item, itemIndex) => (
                          <li key={itemIndex} className="flex gap-2">
                            <span className="text-green-primary/70 select-none">
                              ▹
                            </span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p key={respIndex}>{responsibility}</p>
                    ),
                  )}
                </div>

                {active.skills && active.skills.length > 0 && (
                  <div className="mt-7 pt-5 border-t border-white/10">
                    <p className="text-xs uppercase tracking-wider text-foreground/45 font-mono mb-3">
                      // skills gained
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {active.skills.map((skill, skillIndex) => (
                        <motion.span
                          key={skill}
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{
                            duration: 0.2,
                            delay: 0.05 * skillIndex,
                          }}
                          className="px-3 py-1 text-xs rounded-full border border-white/10 bg-white/3 text-green-primary/90 hover:border-green-primary/40 hover:bg-green-primary/10 transition-colors cursor-default font-mono">
                          {skill}
                        </motion.span>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Experience;
