import { motion } from "framer-motion";
import { GraduationCap, Calendar, Building2, Award, MapPin } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { IEducationItem, IEducationContent } from "@shared/schema";

const EducationSection = () => {
  // Fetch education items from admin-managed data
  const { data: educationResponse, isLoading: isLoadingItems } = useQuery<{ success: boolean; data: IEducationItem[] }>({
    queryKey: ['/api/education'],
    staleTime: 0,
    refetchInterval: 30000,
    refetchOnWindowFocus: true,
    refetchOnMount: true
  });

  // Fetch education content (titles, descriptions, etc.)
  const { data: educationContentResponse, isLoading: isLoadingContent } = useQuery<{ success: boolean; data: IEducationContent }>({
    queryKey: ['/api/education-content'],
    staleTime: 0,
    refetchInterval: 30000,
    refetchOnWindowFocus: true,
    refetchOnMount: true
  });

  const isLoading = isLoadingItems || isLoadingContent;
  
  // Get education content data
  const educationContent = educationContentResponse?.data;

  // Filter active education items and sort by display order
  const educationItems = educationResponse?.data || [];
  const activeEducation = Array.isArray(educationItems) 
    ? educationItems
        .filter(item => item.isActive)
        .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
    : [];

  // Default content if not loaded yet
  const sectionData = educationContent || {
    sectionTitle: "Education",
    sectionSubtitle: "Academic Background", 
    sectionDescription: "My academic journey and qualifications that have shaped my professional development.",
    bottomDescription: "My education has provided me with a strong foundation in computer science, engineering principles, and problem-solving methodologies that I apply to my work every day.",
    certificationsLinkText: "View My Professional Certifications →",
    certificationsLinkUrl: "#certifications"
  };

  const sectionVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };
  
  const iconVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: { 
      scale: 1, 
      opacity: 1,
      transition: { type: "spring", stiffness: 260, damping: 20, delay: 0.3 } 
    }
  };

  if (isLoading) {
    return (
      <section id="education" className="py-16 md:py-24 relative overflow-hidden">
        <div className="container mx-auto px-4 text-center">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-64 mx-auto mb-4"></div>
            <div className="h-4 bg-gray-300 rounded w-96 mx-auto mb-8"></div>
            <div className="space-y-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-gray-300 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="education" className="py-16 md:py-24 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800/80"></div>
      <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-b from-primary/5 to-transparent"></div>
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10"></div>
      
      <div className="container mx-auto px-4 relative">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-block px-3 py-1 text-sm font-medium bg-primary/10 dark:bg-primary/20 text-primary-600 dark:text-primary-300 rounded-full mb-3 border border-primary/20">
            {sectionData.sectionSubtitle}
          </span>
          <h2 className="text-3xl md:text-5xl font-bold mb-4">{sectionData.sectionTitle}</h2>
          <div className="w-20 h-1 bg-gradient-to-r from-primary to-purple-500 mx-auto rounded-full mb-6"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-lg">
            {sectionData.sectionDescription}
          </p>
        </motion.div>

        <div className="max-w-5xl mx-auto">
          <motion.div
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="relative"
          >
            {/* Center icon */}
            <motion.div
              className="hidden md:flex items-center justify-center w-20 h-20 bg-white dark:bg-gray-800 rounded-full mx-auto mb-12 shadow-lg border-4 border-gray-100 dark:border-gray-700 z-20 relative"
              variants={iconVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <GraduationCap className="w-10 h-10 text-primary" />
            </motion.div>
            
            {/* Timeline bar */}
            <div className="absolute left-4 md:left-1/2 transform md:-translate-x-1/2 top-0 h-full w-1 bg-gradient-to-b from-primary via-purple-500 to-blue-500 rounded-full z-0 hidden md:block"></div>
            
            {/* Education items */}
            <div className="space-y-16 relative z-10">
              {activeEducation.map((edu: IEducationItem, index: number) => (
                <motion.div 
                  key={index}
                  variants={itemVariants}
                  className="relative pb-2"
                >
                  <div className={`flex flex-col ${
                    index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                  } items-center gap-8`}
                  >
                    {/* Year marker with dot */}
                    <div className="md:w-5/12 flex items-center">
                      <div className={`hidden md:flex items-center ${
                        index % 2 === 0 ? 'justify-end' : 'justify-start flex-row-reverse'
                      }`}>
                        <span className={`px-4 py-2 bg-white dark:bg-gray-800 rounded-full shadow-md text-sm font-semibold text-primary-600 dark:text-primary-400 border border-gray-100 dark:border-gray-700 ${
                          index % 2 === 0 ? 'mr-6' : 'ml-6'
                        }`}>
                          <Calendar className="inline w-4 h-4 mr-1.5 -mt-0.5" />
                          {edu.year}
                        </span>
                        
                        {/* Timeline point dot */}
                        <div className="relative">
                          <div className="absolute top-1/2 -translate-y-1/2 w-6 h-6 bg-white dark:bg-gray-900 border-4 border-primary rounded-full z-20"></div>
                          <div className="absolute top-1/2 -translate-y-1/2 w-10 h-10 bg-primary/20 rounded-full animate-ping-slow opacity-75"></div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Education card - always visible */}
                    <div className="md:w-7/12 w-full">
                      <div className="bg-white dark:bg-gray-800 p-5 sm:p-6 md:p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 relative overflow-hidden group">
                        {/* Top accent bar */}
                        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary to-purple-500"></div>
                        
                        {/* Mobile-only year display */}
                        <div className="md:hidden mb-3 inline-flex items-center px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm font-medium bg-primary/10 dark:bg-primary/20 text-primary-600 dark:text-primary-300">
                          <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1" />
                          {edu.year}
                        </div>
                        
                        <h3 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3 text-gray-900 dark:text-white group-hover:text-primary dark:group-hover:text-primary-400 transition-colors">
                          {edu.degree}
                        </h3>
                        
                        <div className="space-y-2 sm:space-y-3 mb-3 sm:mb-4">
                          <div className="flex items-center text-gray-700 dark:text-gray-300 text-sm sm:text-base">
                            <Building2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                            <span>{edu.institution}</span>
                          </div>
                          
                          {'location' in edu && edu.location && (
                            <div className="flex items-center text-gray-600 dark:text-gray-400 text-sm sm:text-base">
                              <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 text-gray-500 dark:text-gray-500 flex-shrink-0" />
                              <span>{edu.location}</span>
                            </div>
                          )}
                          
                          {edu.result && (
                            <div className="flex items-center text-gray-700 dark:text-gray-300 text-sm sm:text-base">
                              <Award className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                              <span>{edu.result}</span>
                            </div>
                          )}
                        </div>
                        
                        {'description' in edu && edu.description && (
                          <p className="text-gray-600 dark:text-gray-400 mt-3 text-xs sm:text-sm border-t border-gray-100 dark:border-gray-700 pt-3">
                            {edu.description}
                          </p>
                        )}
                        
                        {/* Background decoration */}
                        <div className="absolute -bottom-12 -right-12 w-24 h-24 bg-primary/5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
          
          {/* Education summary/CTA */}
          <motion.div
            className="mt-20 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
          >
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-6">
              {sectionData.bottomDescription}
            </p>
            <a
              href={sectionData.certificationsLinkUrl}
              className="inline-flex items-center text-primary-600 dark:text-primary-400 font-medium hover:underline"
            >
              {sectionData.certificationsLinkText}
              <svg className="w-4 h-4 ml-1" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd"></path>
              </svg>
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default EducationSection;