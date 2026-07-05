import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSocket } from "@/lib/socket";

// Define the skill structure
interface Skill {
  name: string;
  icon: string;
  proficiency: number;
  years?: string;
}

interface SkillCategory {
  name: string;
  items: Skill[];
}

const SkillsSection = () => {
  const [activeCategory, setActiveCategory] = useState<string>('');
  const { addEventListener, removeEventListener } = useSocket();
  
  // Fetch skills data from API with aggressive refresh settings
  const { data: skillsResponse, isLoading, error, refetch } = useQuery({
    queryKey: ["/api/skills"],
    queryFn: async () => {
      const response = await fetch('/api/skills', {
        cache: 'no-cache',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      if (!response.ok) throw new Error('Failed to fetch skills data');
      return response.json();
    },
    staleTime: 0,
    gcTime: 1000 * 30,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchInterval: 30000,
  });

  // Listen for real-time skill updates
  useEffect(() => {
    const handleSkillsUpdate = () => {
      refetch();
    };

    addEventListener('skills-updated', handleSkillsUpdate);
    addEventListener('skill-updated', handleSkillsUpdate);

    return () => {
      removeEventListener('skills-updated', handleSkillsUpdate);
      removeEventListener('skill-updated', handleSkillsUpdate);
    };
  }, [addEventListener, removeEventListener, refetch]);

  const skills: SkillCategory[] = (skillsResponse as any)?.data || [];

  // Update active category when skills data loads
  useEffect(() => {
    if (skills.length > 0 && !activeCategory) {
      setActiveCategory(skills[0].name);
    }
  }, [skills, activeCategory]);

  const handleCategoryClick = (categoryName: string) => {
    setActiveCategory(categoryName);
  };
  
  // Animation variants
  const sectionVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  };
  
  const skillVariants = {
    hidden: { 
      scale: 0.9, 
      opacity: 0,
      y: 20 
    },
    visible: {
      scale: 1,
      opacity: 1,
      y: 0,
      transition: { 
        type: "spring", 
        stiffness: 100, 
        damping: 15
      },
    },
    hover: {
      y: -5,
      scale: 1.02,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 10
      }
    }
  };

  const categoryButtonVariants = {
    inactive: {
      scale: 1,
      backgroundColor: "rgba(255, 255, 255, 0.8)",
      color: "#374151",
      transition: { duration: 0.2 }
    },
    active: {
      scale: 1.05,
      backgroundColor: "rgba(79, 70, 229, 0.1)",
      color: "#4F46E5",
      transition: { 
        type: "spring", 
        stiffness: 300, 
        damping: 15 
      }
    },
    hover: {
      scale: 1.03,
      backgroundColor: "rgba(79, 70, 229, 0.05)",
      transition: { 
        type: "spring", 
        stiffness: 400, 
        damping: 10 
      }
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <section id="skills" className="py-12 sm:py-16 md:py-24 bg-gray-50 dark:bg-gray-900/60">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading skills...</p>
          </div>
        </div>
      </section>
    );
  }

  // Show error state
  if (error) {
    return (
      <section id="skills" className="py-12 sm:py-16 md:py-24 bg-gray-50 dark:bg-gray-900/60">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <p className="text-red-600 dark:text-red-400">Failed to load skills data</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section 
      id="skills" 
      className="py-12 sm:py-16 md:py-24 bg-gray-50 dark:bg-gray-900/60 relative overflow-hidden"
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-50 to-blue-50 dark:from-gray-900/60 dark:to-gray-800/40" />
      
      {/* Grid pattern background */}
      <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.01] bg-[linear-gradient(to_right,hsl(var(--primary)/10%)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--primary)/10%)_1px,transparent_1px)] bg-[size:3rem_3rem]"></div>
      
      <div className="container mx-auto px-4 sm:px-6 relative">
        {/* Heading */}
        <motion.div 
          className="text-center mb-8 sm:mb-12 md:mb-16"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <motion.span 
            className="inline-block px-3 py-1 text-sm font-medium bg-primary/10 dark:bg-primary/20 text-primary-600 dark:text-primary-300 rounded-full mb-3 border border-primary/20"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
          >
            My Expertise
          </motion.span>
          <motion.h2 
            className="text-3xl md:text-5xl font-bold mb-4"
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Technical Skills
          </motion.h2>
          <motion.div 
            className="h-1 bg-gradient-to-r from-primary to-purple-500 mx-auto rounded-full mb-6"
            initial={{ width: 0 }}
            whileInView={{ width: 80 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          ></motion.div>
          <motion.p 
            className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-lg"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Here are the technologies and tools I work with regularly to build robust, scalable applications.
          </motion.p>
        </motion.div>

        {/* Category tabs */}
        <motion.div 
          className="max-w-6xl mx-auto mb-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="flex flex-wrap justify-center gap-3">
            {skills.map((category: SkillCategory) => (
              <motion.button
                key={category.name}
                onClick={() => handleCategoryClick(category.name)}
                className="px-4 py-2 rounded-full text-base font-medium transition-all duration-300 border border-gray-200 dark:border-gray-700"
                variants={categoryButtonVariants}
                initial="inactive"
                animate={activeCategory === category.name ? "active" : "inactive"}
                whileHover="hover"
                whileTap={{ scale: 0.98 }}
              >
                {category.name}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Skills grid */}
        <div className="max-w-6xl mx-auto">
          <AnimatePresence mode="wait">
            {skills.map((category: SkillCategory) => (
              category.name === activeCategory && (
                <motion.div
                  key={category.name}
                  variants={sectionVariants}
                  initial="hidden"
                  animate="visible"
                  exit={{ opacity: 0, y: -20 }}
                  className="mb-12"
                >
                  <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {category.items.map((skill: Skill, index: number) => (
                      <motion.div
                        key={skill.name}
                        className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-5 border border-gray-100 dark:border-gray-700 relative overflow-hidden group"
                        variants={skillVariants}
                        whileHover="hover"
                        whileTap={{ scale: 0.98 }}
                      >
                        {/* Corner decoration */}
                        <div className="absolute top-0 left-0 w-2 h-2 bg-primary rounded-br-md"></div>
                        
                        <div className="flex items-center justify-between mb-6">
                          <div className="flex items-center gap-4">
                            <div className="p-2.5 rounded-lg bg-gray-100 dark:bg-gray-900/50 flex items-center justify-center">
                              <img 
                                src={skill.icon} 
                                alt={skill.name} 
                                className="w-10 h-10 object-contain"
                                width={40}
                                height={40}
                              />
                            </div>
                            <span className="font-semibold text-lg text-gray-900 dark:text-white">
                              {skill.name}
                            </span>
                          </div>
                        </div>
                        
                        <div className="mb-2 flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Proficiency</span>
                          <span className="font-semibold bg-primary/10 dark:bg-primary/20 text-primary-700 dark:text-primary-300 px-2 py-0.5 rounded-full text-sm">
                            {skill.proficiency}%
                          </span>
                        </div>
                        
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                          <motion.div 
                            className="h-full rounded-full bg-gradient-to-r from-primary to-primary/80"
                            initial={{ width: 0 }}
                            animate={{ width: `${skill.proficiency}%` }}
                            transition={{ duration: 1.2, delay: 0.3 + index * 0.1, ease: "easeOut" }}
                          />
                        </div>
                        
                        {/* Experience tag */}
                        {skill.years && (
                          <div className="mt-4 inline-block text-xs px-2.5 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full">
                            {skill.years} {String(skill.years) === '1' ? 'year' : 'years'} experience
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </motion.div>
                </motion.div>
              )
            ))}
          </AnimatePresence>
          
          {/* CTA section */}
          <motion.div
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-8 mt-16 text-center relative"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <div className="max-w-3xl mx-auto">
              <h3 className="text-2xl font-bold mb-4">Always Learning</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                My skills continue to evolve as I embrace new technologies and methodologies. 
                I'm passionate about learning and regularly update my knowledge through courses, 
                projects, and community engagement.
              </p>
              <motion.a 
                href="#projects" 
                className="inline-flex items-center px-6 py-3 rounded-full bg-primary/10 text-primary-700 dark:bg-primary/20 dark:text-primary-300 font-medium transition-all hover:bg-primary/20"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                See My Projects
                <svg 
                  className="w-5 h-5 ml-2" 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 20 20" 
                  fill="currentColor"
                >
                  <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </motion.a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default SkillsSection;