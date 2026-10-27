"use client";

import { useEffect, useRef, type ReactNode } from "react";
import KonamiCode from "@/src/components/EasterEggs/KonamiCode";
import Shell from "@/src/components/CommandPalette/Shell";
import { CrtProvider } from "@/src/lib/useCrt";
import { SoundProvider } from "@/src/lib/useSound";
import { siteReducedMotion } from "@/src/lib/motion";

function CrtOverlay() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    // Static scanlines are fine; only the flicker is motion.
    if (siteReducedMotion() && ref.current) ref.current.style.animation = "none";
  }, []);
  return <div id="crt-overlay" ref={ref} aria-hidden="true" />;
}

/** Sound, CRT mode and the Konami code, for every route. */
export default function GlobalLayer({ children }: { children: ReactNode }) {
  return (
    <SoundProvider>
      <CrtProvider>
        {children}
        <CrtOverlay />
        <KonamiCode />
        <Shell />
      </CrtProvider>
    </SoundProvider>
  );
}
