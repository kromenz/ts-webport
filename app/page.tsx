"use client";

import Navbar from "@/src/components/Navbar/Navbar";
import Hero from "@/src/components/Hero/Hero";
import Skills from "@/src/components/Skills/Skills";
import Projects from "@/src/components/Projects/Projects";
import Experience from "@/src/components/Experience/Experiance";
import ContactMe from "@/src/components/ContactMe/ContactMe";
import ScrollButton from "@/src/components/ScrollButton/ScrollButton";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 font-mono dark:bg-black">
      <Navbar />
      <Hero />
      <Skills />
      <Projects />
      <Experience />
      <ContactMe />
      <ScrollButton />
    </div>
  );
}
