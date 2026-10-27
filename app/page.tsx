"use client";

import Navbar from "@/src/components/Navbar/Navbar";
import BootSequence from "@/src/components/Hero/BootSequence";
import Hero from "@/src/components/Hero/Hero";
import Projects from "@/src/components/Projects/Projects";
import Experience from "@/src/components/Experience/Experience";
import ContactMe from "@/src/components/ContactMe/ContactMe";
import Footer from "@/src/components/Footer/Footer";
import ScrollButton from "@/src/components/ScrollButton/ScrollButton";
import ScrollProgress from "@/src/components/ScrollProgress/ScrollProgress";
import ConsoleBanner from "@/src/components/EasterEggs/ConsoleBanner";
import { MotionConfig } from "framer-motion";
import { Analytics } from "@vercel/analytics/next";

export default function Home() {
  // "never" is deliberate: see HONOR_REDUCED_MOTION in src/lib/motion.ts
  return (
    <MotionConfig reducedMotion="never">
      <div className="flex min-h-[100dvh] flex-col bg-background text-foreground font-sans">
        <BootSequence />
        <Analytics />
        <ScrollProgress />
        <ConsoleBanner />
        <Navbar />
        <div id="page-content" className="flex flex-1 flex-col">
        <Hero />
        <Experience />
        <Projects />
        <ContactMe />
        <Footer />
        </div>
        <ScrollButton />
      </div>
    </MotionConfig>
  );
}
