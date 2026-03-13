"use client";

import { useState, useEffect } from "react";
import NavbarContent from "./NavbarContent";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 font-mono ${
        isScrolled
          ? "bg-white/90 dark:bg-black/80 backdrop-blur-sm shadow-sm"
          : "bg-transparent"
      }`}>
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <NavbarContent />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
