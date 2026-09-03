"use client";

import { useState } from "react";
import { useMotionValueEvent, useScroll } from "framer-motion";
import NavbarContent from "./NavbarContent";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const { scrollY } = useScroll();

  // Same boolean on most frames, so React bails out of the re-render.
  useMotionValueEvent(scrollY, "change", (y) => setIsScrolled(y > 10));

  return (
    <>
      {/* Desktop: floating pill at the top */}
      <nav
        aria-label="Main"
        className={`hidden lg:block fixed top-4 left-1/2 -translate-x-1/2 z-50 rounded-full border font-mono transition-[background-color,border-color,box-shadow] duration-300 ${
          isScrolled
            ? "bg-[#1c1c24]/80 border-white/10 backdrop-blur-md shadow-lg shadow-black/30"
            : "bg-transparent border-transparent"
        }`}>
        <div className="px-2 py-1.5">
          <NavbarContent />
        </div>
      </nav>

      {/* Mobile / tablet: docked at the bottom, within thumb reach.
          The safe-area inset keeps it clear of the iOS home indicator. */}
      <nav
        aria-label="Main"
        className="lg:hidden fixed left-1/2 -translate-x-1/2 z-50 rounded-full border border-white/10 bg-[#1c1c24]/85 backdrop-blur-md shadow-lg shadow-black/40 font-mono"
        style={{ bottom: "calc(1rem + env(safe-area-inset-bottom))" }}>
        <div className="px-1.5 py-1.5">
          <NavbarContent variant="compact" />
        </div>
      </nav>
    </>
  );
};

export default Navbar;
