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
      className={`hidden lg:block fixed top-4 left-1/2 -translate-x-1/2 z-50 rounded-full border transition-all duration-300 font-mono ${
        isScrolled
          ? "bg-[#1c1c24]/80 border-white/10 backdrop-blur-md shadow-lg shadow-black/30"
          : "bg-transparent border-transparent"
      }`}>
      <div className="px-6 py-2">
        <div className="flex items-center justify-between">
          <NavbarContent />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
