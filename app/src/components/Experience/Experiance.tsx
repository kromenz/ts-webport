import { WORK_EXPERIENCE } from "@/src/data/data";

const Experience = () => {
  return (
    <section id="experience" className="py-20 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-16 text-black dark:text-white">
          Work Experience
        </h2>
        <div className="max-w-3xl mx-auto">
          {WORK_EXPERIENCE.map((experience, index) => (
            <div key={index} className="mb-12 last:mb-0">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-black dark:text-white">
                  {experience.title} -{" "}
                  <span className="text-gray-600 dark:text-gray-400">
                    {experience.position}
                  </span>
                </h3>
                <span className="text-gray-900 dark:text-gray-200 mt-1 md:mt-0">
                  {experience.date}
                </span>
              </div>
              <div className="space-y-2">
                {experience.responsibilities.map(
                  (responsibility, respIndex) => (
                    <div
                      key={respIndex}
                      className="text-gray-700 dark:text-gray-300">
                      {Array.isArray(responsibility) ? (
                        <ul className="list-disc pl-5 space-y-1">
                          {responsibility.map((item, itemIndex) => (
                            <li key={itemIndex}>{item}</li>
                          ))}
                        </ul>
                      ) : (
                        <p>{responsibility}</p>
                      )}
                    </div>
                  ),
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Experience;
