"use client";

import Navbar from "@/src/components/Navbar/Navbar";
import Hero from "@/src/components/Hero/Hero";
import Projects from "@/src/components/Projects/Projects";
import Experience from "@/src/components/Experience/Experience";
import ContactMe from "@/src/components/ContactMe/ContactMe";
import Footer from "@/src/components/Footer/Footer";
import ScrollButton from "@/src/components/ScrollButton/ScrollButton";
import ScrollProgress from "@/src/components/ScrollProgress/ScrollProgress";
import ConsoleBanner from "@/src/components/EasterEggs/ConsoleBanner";
import KonamiCode from "@/src/components/EasterEggs/KonamiCode";
import { MotionConfig } from "framer-motion";
import { Analytics } from "@vercel/analytics/next";

export default function Home() {
  // "never" is deliberate: see HONOR_REDUCED_MOTION in src/lib/motion.ts
  return (
    <MotionConfig reducedMotion="never">
      <div className="flex min-h-[100dvh] flex-col bg-background text-foreground font-sans">
        <Analytics />
        <ScrollProgress />
        <ConsoleBanner />
        <KonamiCode />
        <Navbar />
        <Hero />
        <Experience />
        <Projects />
        <ContactMe />
        <Footer />
        <ScrollButton />
      </div>
    </MotionConfig>
  );
}
