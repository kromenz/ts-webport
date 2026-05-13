"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const NavbarContent = () => {
  const [activeSection, setActiveSection] = useState("hero");

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setActiveSection(sectionId);
    }
  };

  useEffect(() => {
    const sections = ["hero", "experience", "projects", "contact"];

    const detectActiveSection = () => {
      // Bottom-of-page override: when there's no room to scroll any further,
      // force the last section. Short final sections can otherwise leave the
      // detection point stuck inside the previous section.
      const docHeight = Math.max(
        document.documentElement.scrollHeight,
        document.body.scrollHeight,
      );
      const scrolledToBottom =
        window.innerHeight + window.scrollY >= docHeight - 2;
      if (scrolledToBottom) {
        setActiveSection(sections[sections.length - 1]);
        return;
      }

      // Pick the last section whose top has been passed. Robust against
      // mismatched section heights and avoids the previous "stuck in a
      // range" failure mode.
      const scrollPosition = window.scrollY + 120;
      let current = sections[0];
      for (const section of sections) {
        const element = document.getElementById(section);
        if (!element) continue;
        if (element.offsetTop <= scrollPosition) {
          current = section;
        } else {
          break;
        }
      }
      setActiveSection(current);
    };

    detectActiveSection();

    const handleLoad = () => detectActiveSection();
    if (document.readyState === "complete") {
      detectActiveSection();
    } else {
      window.addEventListener("load", handleLoad);
    }

    window.addEventListener("scroll", detectActiveSection, { passive: true });
    return () => {
      window.removeEventListener("scroll", detectActiveSection);
      window.removeEventListener("load", handleLoad);
    };
  }, []);

  const navItems = [
    { id: "hero", label: "Home" },
    { id: "experience", label: "Experience" },
    { id: "projects", label: "Projects" },
    { id: "contact", label: "Contact Me" },
  ];

  return (
    <div className="flex lg:grow lg:justify-center">
      <div className="hidden lg:flex space-x-1">
        {navItems.map((item) => (
          <motion.button
            key={item.id}
            onClick={() => scrollToSection(item.id)}
            className={`relative px-4 py-2 text-lg font-medium rounded-lg transition-colors ${
              activeSection === item.id
                ? "text-green-primary"
                : "text-slate-300 hover:text-green-primary"
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}>
            {item.label}
            {activeSection === item.id && (
              <motion.div
                className="absolute bottom-0 left-0 w-full h-0.5 bg-green-primary"
                layoutId="activeIndicator"
                initial={false}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default NavbarContent;
