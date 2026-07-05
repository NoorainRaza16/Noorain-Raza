import { motion } from "framer-motion";
import { ExternalLink, Github } from "lucide-react";
import OptimizedImage from "@/components/ui/optimized-image";
import { useQuery } from "@tanstack/react-query";
import { useSocket } from "@/lib/socket";
import { useEffect } from "react";

const ProjectsSection = () => {
  const { addEventListener, removeEventListener } = useSocket();

  // Fetch projects from database with aggressive refresh settings
  const { data: projectsResponse, isLoading, refetch: refetchProjects } = useQuery({
    queryKey: ["/api/projects"],
    queryFn: async () => {
      const response = await fetch("/api/projects", {
        cache: 'no-cache',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      if (!response.ok) throw new Error("Failed to fetch projects");
      return response.json();
    },
    staleTime: 0, // Data is immediately stale
    gcTime: 1000 * 30, // Keep in cache for 30 seconds
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Fetch projects content from admin panel
  const { data: projectsContentResponse, isLoading: isContentLoading, refetch: refetchContent } = useQuery({
    queryKey: ["/api/projects-content"],
    queryFn: async () => {
      const response = await fetch("/api/projects-content", {
        cache: 'no-cache',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      if (!response.ok) throw new Error("Failed to fetch projects content");
      return response.json();
    },
    staleTime: 0,
    gcTime: 1000 * 60, // Keep content cache for 1 minute
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });

  // Listen for real-time project updates
  useEffect(() => {
    const handleProjectsUpdate = () => {
      refetchProjects();
    };

    const handleProjectsContentUpdate = () => {
      refetchContent();
    };

    addEventListener('project-created', handleProjectsUpdate);
    addEventListener('project-updated', handleProjectsUpdate);
    addEventListener('project-deleted', handleProjectsUpdate);
    addEventListener('projects-updated', handleProjectsContentUpdate);

    return () => {
      removeEventListener('project-created', handleProjectsUpdate);
      removeEventListener('project-updated', handleProjectsUpdate);
      removeEventListener('project-deleted', handleProjectsUpdate);
      removeEventListener('projects-updated', handleProjectsContentUpdate);
    };
  }, [addEventListener, removeEventListener, refetchProjects, refetchContent]);

  const projects = projectsResponse?.data || [];
  const projectsContent = projectsContentResponse?.data || {
    sectionTag: "My Work",
    sectionTitle: "Featured Projects",
    sectionDescription: "Here are some of the key projects I've worked on, showcasing my technical skills and problem-solving abilities.",
    githubButtonText: "View All Projects on GitHub",
    githubButtonUrl: "https://github.com/NoorainRaza23"
  };

  // Show loading state
  if (isLoading || isContentLoading) {
    return (
      <section id="projects" className="py-12 sm:py-16 md:py-24 relative overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 relative">
          <div className="text-center mb-8 sm:mb-12 md:mb-16">
            <span className="inline-block px-2.5 sm:px-3 py-1 text-xs sm:text-sm font-medium bg-primary/10 dark:bg-primary/20 text-primary-600 dark:text-primary-300 rounded-full mb-2 sm:mb-3 border border-primary/20">
              Loading...
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold mb-3 sm:mb-4">Loading Projects</h2>
            <div className="w-16 sm:w-20 h-1 bg-gradient-to-r from-primary to-purple-500 mx-auto rounded-full mb-4 sm:mb-6"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 md:gap-8 xl:gap-12">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl md:rounded-2xl overflow-hidden shadow-md border border-gray-100 dark:border-gray-700 animate-pulse">
                <div className="h-40 sm:h-48 md:h-56 lg:h-64 bg-gray-200 dark:bg-gray-700"></div>
                <div className="p-4 sm:p-6 space-y-4">
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                  </div>
                  <div className="flex gap-2">
                    <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  const sectionVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
      },
    },
  };

  const projectGridVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.2,
      },
    },
  };

  const projectCardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  return (
    <section id="projects" className="py-12 sm:py-16 md:py-24 relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5 dark:opacity-[0.03]">
        <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 0 10 L 40 10 M 10 0 L 10 40" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 relative">
        <motion.div
          className="text-center mb-8 sm:mb-12 md:mb-16"
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <span className="inline-block px-2.5 sm:px-3 py-1 text-xs sm:text-sm font-medium bg-primary/10 dark:bg-primary/20 text-primary-600 dark:text-primary-300 rounded-full mb-2 sm:mb-3 border border-primary/20">
            {projectsContent.sectionTag}
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold mb-3 sm:mb-4">{projectsContent.sectionTitle}</h2>
          <div className="w-16 sm:w-20 h-1 bg-gradient-to-r from-primary to-purple-500 mx-auto rounded-full mb-4 sm:mb-6"></div>
          <p className="text-gray-600 dark:text-gray-300 mt-3 sm:mt-4 max-w-2xl mx-auto text-sm sm:text-base md:text-lg">
            {projectsContent.sectionDescription}
          </p>
        </motion.div>

        {/* Project Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 md:gap-8 xl:gap-12 mb-8 sm:mb-10 md:mb-16"
          variants={projectGridVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {projects.map((project: any, index: number) => (
            <motion.div
              key={project.title}
              className="group bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl md:rounded-2xl overflow-hidden shadow-md hover:shadow-xl sm:shadow-lg sm:hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-700 flex flex-col h-full"
              variants={projectCardVariants}
              whileHover={{ 
                y: -5,
                transition: { type: "spring", stiffness: 300, damping: 20 }
              }}
            >
              <div className="relative h-40 sm:h-48 md:h-56 lg:h-64 overflow-hidden">
                {/* Project image with overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/50 group-hover:opacity-100 opacity-70 transition-opacity z-10"></div>
                
                <OptimizedImage
                  src={project.image}
                  alt={project.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  width={600}
                  height={400}
                />
                
                {/* Floating tag on the image */}
                <div className="absolute top-2 right-2 sm:top-3 sm:right-3 z-10">
                  <span className="inline-flex items-center px-1.5 sm:px-2 md:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs font-semibold rounded-full bg-black/40 backdrop-blur-sm text-white border border-white/20">
                    Project {index + 1}
                  </span>
                </div>
              </div>
              
              <div className="p-3 sm:p-4 md:p-6 lg:p-8 relative flex-1 flex flex-col">
                {/* Colorful accent line */}
                <div className="absolute top-0 left-0 right-0 h-0.5 sm:h-1 bg-gradient-to-r from-primary via-purple-500 to-blue-500"></div>
                
                {/* Project title and description */}
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-1.5 sm:mb-2 md:mb-3 text-gray-900 dark:text-white group-hover:text-primary dark:group-hover:text-primary-400 transition-colors line-clamp-2">
                  {project.title}
                </h3>
                <p className="text-gray-700 dark:text-gray-300 mb-3 sm:mb-4 md:mb-5 text-xs sm:text-sm md:text-base flex-1 line-clamp-3 sm:line-clamp-4">
                  {project.description}
                </p>

                {/* Technologies */}
                <div className="flex flex-wrap gap-1 sm:gap-1.5 md:gap-2 mb-3 sm:mb-4 md:mb-6">
                  {Array.isArray(project.technologies) && project.technologies.map((tech: any, techIndex: number) => {
                    // Handle both string and object formats
                    const techName = typeof tech === 'string' ? tech : tech.name || 'Unknown';
                    
                    // Define technology-specific colors
                    const getTechColors = (techName: string) => {
                      const lowerTech = techName.toLowerCase();
                      
                      if (lowerTech.includes('next') || lowerTech.includes('nextjs')) {
                        return 'bg-black dark:bg-gray-900 text-white dark:text-gray-100';
                      } else if (lowerTech.includes('react')) {
                        return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200';
                      } else if (lowerTech.includes('mongodb') || lowerTech.includes('mongo')) {
                        return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200';
                      } else if (lowerTech.includes('python')) {
                        return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200';
                      } else if (lowerTech.includes('javascript') || lowerTech.includes('js')) {
                        return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200';
                      } else if (lowerTech.includes('typescript') || lowerTech.includes('ts')) {
                        return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200';
                      } else if (lowerTech.includes('java')) {
                        return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200';
                      } else if (lowerTech.includes('mysql')) {
                        return 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200';
                      } else if (lowerTech.includes('vercel')) {
                        return 'bg-black dark:bg-gray-900 text-white dark:text-gray-100';
                      } else if (lowerTech.includes('api')) {
                        return 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200';
                      } else if (lowerTech.includes('machine learning') || lowerTech.includes('ml')) {
                        return 'bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200';
                      } else if (lowerTech.includes('streamlit')) {
                        return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200';
                      } else if (lowerTech.includes('pandas')) {
                        return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200';
                      } else if (lowerTech.includes('scikit')) {
                        return 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200';
                      } else if (lowerTech.includes('healthcare')) {
                        return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200';
                      } else if (lowerTech.includes('hardware')) {
                        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200';
                      } else if (lowerTech.includes('iot')) {
                        return 'bg-cyan-100 dark:bg-cyan-900 text-cyan-800 dark:text-cyan-200';
                      } else if (lowerTech.includes('electronics')) {
                        return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200';
                      } else if (lowerTech.includes('shell') || lowerTech.includes('scripting')) {
                        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200';
                      } else if (lowerTech.includes('networking')) {
                        return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200';
                      } else if (lowerTech.includes('swing')) {
                        return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200';
                      } else if (lowerTech.includes('jdbc')) {
                        return 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200';
                      } else {
                        // Default colors for unknown technologies
                        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200';
                      }
                    };

                    return (
                      <span
                        key={`${project.title}-${tech}-${techIndex}`}
                        className={`text-[10px] sm:text-xs font-medium px-1.5 sm:px-2 md:px-3 py-0.5 md:py-1 rounded-full shadow-sm ${getTechColors(tech)}`}
                      >
                        {tech}
                      </span>
                    );
                  })}
                </div>

                {/* Links */}
                <div className="flex justify-between items-center pt-2 sm:pt-3 md:pt-4 border-t border-gray-100 dark:border-gray-700 mt-auto">
                  <div className="flex gap-2 sm:gap-3 md:gap-4">
                    {project.demoUrl && (
                      <a
                        href={project.demoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 inline-flex items-center text-[10px] sm:text-xs md:text-sm font-medium transition-colors"
                      >
                        <ExternalLink className="h-2.5 w-2.5 sm:h-3 sm:w-3 md:h-4 md:w-4 mr-0.5 sm:mr-1 md:mr-1.5" />
                        <span className="hidden xs:inline">Live</span> Demo
                      </a>
                    )}
                    {project.githubUrl && (
                      <a
                        href={project.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white inline-flex items-center text-[10px] sm:text-xs md:text-sm font-medium transition-colors"
                      >
                        <Github className="h-2.5 w-2.5 sm:h-3 sm:w-3 md:h-4 md:w-4 mr-0.5 sm:mr-1 md:mr-1.5" />
                        <span className="hidden xs:inline">Source</span> Code
                      </a>
                    )}
                  </div>
                  
                  {/* View details button */}
                  <a
                    href={project.demoUrl || project.githubUrl || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-full bg-gray-100 dark:bg-gray-700 group-hover:bg-primary group-hover:dark:bg-primary text-gray-500 dark:text-gray-400 group-hover:text-white transition-colors"
                    aria-label="View details"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sm:w-3.5 sm:h-3.5 md:w-4 md:h-4">
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* View More Projects Button */}
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <a
            href={projectsContent.githubButtonUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center px-5 sm:px-6 md:px-8 py-2 sm:py-2.5 md:py-3 border-2 border-primary bg-transparent text-primary hover:bg-primary hover:text-white dark:text-primary-400 dark:border-primary-400 dark:hover:text-black text-sm sm:text-base font-medium rounded-full shadow-sm hover:shadow transition-all duration-300"
          >
            {projectsContent.githubButtonText}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 sm:h-5 sm:w-5 ml-1.5 sm:ml-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default ProjectsSection;
