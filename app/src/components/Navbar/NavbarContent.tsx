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

  // Track scroll position to highlight active section
  useEffect(() => {
    const handleScroll = () => {
      const sections = ["hero", "skills", "projects", "experience", "contact"];
      const scrollPosition = window.scrollY + 100;

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const offsetTop = element.offsetTop;
          const height = element.offsetHeight;

          if (
            scrollPosition >= offsetTop &&
            scrollPosition < offsetTop + height
          ) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { id: "hero", label: "Home" },
    { id: "skills", label: "Skills" },
    { id: "projects", label: "Projects" },
    { id: "experience", label: "Experience" },
    { id: "contact", label: "Contact Me" },
  ];

  return (
    <div className="flex md:grow md:justify-center">
      <div className="hidden md:flex space-x-1">
        {navItems.map((item) => (
          <motion.button
            key={item.id}
            onClick={() => scrollToSection(item.id)}
            className={`relative px-4 py-2 text-lg font-medium rounded-lg transition-colors ${
              activeSection === item.id
                ? "text-brand-purple"
                : "text-gray-700 hover:text-brand-purple dark:text-gray-300 dark:hover:text-brand-purple"
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}>
            {item.label}
            {activeSection === item.id && (
              <motion.div
                className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-purple"
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
