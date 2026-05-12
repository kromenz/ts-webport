"use client";

import Navbar from "@/src/components/Navbar/Navbar";
import Hero from "@/src/components/Hero/Hero";
import Projects from "@/src/components/Projects/Projects";
import Experience from "@/src/components/Experience/Experiance";
import ContactMe from "@/src/components/ContactMe/ContactMe";
import ScrollButton from "@/src/components/ScrollButton/ScrollButton";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground font-mono">
      <Navbar />
      <Hero />
      <Experience />
      <Projects />
      <ContactMe />
      <ScrollButton />
    </div>
  );
}
