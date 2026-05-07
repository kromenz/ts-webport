import { StarfieldBackground } from "../../../../components/ui/starfield";

const Hero = () => {
  return (
    <section
      id="hero"
      className="relative isolate min-h-screen flex items-center justify-center overflow-hidden pt-16 pb-20">
      <div className="absolute inset-0 z-0 overflow-hidden">
        <StarfieldBackground className="absolute! inset-0!" />
      </div>
      <div className="container relative z-10 mx-auto px-4 text-center">
        <h1 className="text-4xl md:text-6xl font-bold text-black dark:text-white mb-4">
          Rafael André
        </h1>
        <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8">
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
            className="px-6 py-3 bg-black text-white dark:bg-white dark:text-black rounded-lg font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors">
            View Projects
          </button>
          <button
            onClick={() =>
              document
                .getElementById("contact")
                ?.scrollIntoView({ behavior: "smooth" })
            }
            className="px-6 py-3 border border-black dark:border-white rounded-lg font-medium text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors">
            My CV
          </button>
        </div>
      </div>
    </section>
  );
};

export default Hero;
