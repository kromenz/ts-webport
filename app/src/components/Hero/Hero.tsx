import { StarfieldBackground } from "../../../../components/ui/starfield";

const Hero = () => {
  return (
    <section
      id="hero"
      className="relative isolate min-h-screen flex items-center justify-center overflow-hidden pt-16 pb-20">
      <div className="absolute inset-0 z-0 overflow-hidden">
        <StarfieldBackground className="absolute! inset-0!" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-30 bg-linear-to-b from-transparent via-background/70 to-background" />
      </div>
      <div className="container relative z-10 mx-auto px-4 text-center">
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 drop-shadow-sm">
          Rafael André
        </h1>
        <p className="text-xl md:text-2xl text-gray-400 mb-8">
          Full Stack Developer
        </p>
        <br />
        <div className="flex justify-center gap-4">
          <button
            onClick={() =>
              document
                .getElementById("projects")
                ?.scrollIntoView({ behavior: "smooth" })
            }
            className="rounded-lg bg-white px-6 py-3 font-medium text-zinc-950 shadow-sm ring-2 ring-transparent transition-[color,box-shadow,background-color] hover:bg-transparent hover:text-white hover:ring-white">
            View Projects
          </button>
          <a
            href="/docs/Rafael_Andre.pdf"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Open Rafael André's CV in a new tab"
            className="rounded-lg border-2 border-white/90 bg-white/5 px-6 py-3 font-medium text-white backdrop-blur-sm transition-colors hover:border-white hover:bg-white hover:text-zinc-950">
            My CV
          </a>
        </div>
      </div>
    </section>
  );
};

export default Hero;
