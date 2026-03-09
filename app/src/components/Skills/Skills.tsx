import { SKILLS } from "@/src/data/data";

const Skills = () => {
  return (
    <section id="skills" className="py-20 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-16 text-black dark:text-white">
          Skills
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {SKILLS.map((skillCategory, index) => (
            <div
              key={index}
              className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 mr-3 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                  {/* Icon placeholder */}
                  <span className="text-lg">🔧</span>
                </div>
                <h3 className="text-xl font-semibold text-black dark:text-white">
                  {skillCategory.title}
                </h3>
              </div>
              <div className="space-y-3">
                {skillCategory.skills.map((skill, skillIndex) => (
                  <div key={skillIndex}>
                    <div className="flex justify-between mb-1">
                      <span className="text-gray-700 dark:text-gray-300">
                        {skill.skill}
                      </span>
                      <span className="text-gray-700 dark:text-gray-300">
                        {skill.percentage}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-black dark:bg-white h-2 rounded-full"
                        style={{ width: skill.percentage }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Skills;
