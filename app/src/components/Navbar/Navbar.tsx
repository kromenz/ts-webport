"use client";

import React, { useState, useEffect } from "react";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 font-mono ${
        isScrolled
          ? "bg-white/90 dark:bg-black/90 backdrop-blur-sm shadow-sm"
          : "bg-transparent"
      }`}>
      <div className="container mx-auto px-4 py-3 mt-4">
        <div className="flex items-center justify-center">
          <div className="flex space-x-8">
            <button
              onClick={() => scrollToSection("hero")}
              className="text-xl font-medium text-gray-700 hover:text-black dark:text-gray-300 dark:hover:text-white transition-colors">
              Home
            </button>
            <button
              onClick={() => scrollToSection("skills")}
              className="text-xl font-medium text-gray-700 hover:text-black dark:text-gray-300 dark:hover:text-white transition-colors">
              Skills
            </button>
            <button
              onClick={() => scrollToSection("projects")}
              className="text-xl font-medium text-gray-700 hover:text-black dark:text-gray-300 dark:hover:text-white transition-colors">
              Projects
            </button>
            <button
              onClick={() => scrollToSection("experience")}
              className="text-xl font-medium text-gray-700 hover:text-black dark:text-gray-300 dark:hover:text-white transition-colors">
              Experience
            </button>
            <button
              onClick={() => scrollToSection("contact")}
              className="text-xl font-medium text-gray-700 hover:text-black dark:text-gray-300 dark:hover:text-white transition-colors">
              Contact Me
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
