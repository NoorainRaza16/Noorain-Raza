import { useEffect, useRef, useState } from "react";
import { motion, useAnimation, useMotionValue, useTransform, animate, useScroll, useSpring } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Briefcase, Building2, Calendar, MapPin, Code, Server, GitBranch, Lock } from "lucide-react";
import { OptimizedImage } from "@/components/performance/OptimizedImage";
import type { IExperienceItem, IExperienceContent } from "@shared/schema";

const ExperienceSection = () => {
  const { data: experienceResponse, isLoading } = useQuery<{ data: IExperienceItem[] }>({
    queryKey: ['/api/experience'],
    queryFn: async () => {
      const response = await fetch('/api/experience', {
        cache: 'no-cache',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      if (!response.ok) throw new Error('Failed to fetch experience data');
      return response.json();
    },
    staleTime: 0,
    gcTime: 1000 * 30,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchInterval: 30000,
  });
  
  const { data: contentResponse } = useQuery<{ data: IExperienceContent }>({
    queryKey: ['/api/experience-content'],
    queryFn: async () => {
      const response = await fetch('/api/experience-content', {
        cache: 'no-cache',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      if (!response.ok) throw new Error('Failed to fetch experience content');
      return response.json();
    },
    staleTime: 0,
    gcTime: 1000 * 60,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });
  
  const experience = experienceResponse?.data || [];
  const content = contentResponse?.data;
  
  const sectionRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const lineControls = useAnimation();
  const [hoveredItem, setHoveredItem] = useState<number | null>(null);
  
  // For animations
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });
  
  // Smooth spring physics for scroll-based animations
  const springyScroll = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });
  
  // Transform scroll progress to multiple visual effects
  const backgroundOpacity = useTransform(springyScroll, [0, 0.2, 0.8, 1], [0, 0.05, 0.1, 0]);
  const rotateIcon1 = useMotionValue(0);
  const rotateIcon2 = useMotionValue(0);
  const rotateIcon3 = useMotionValue(0);
  
  // For animated count
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest));
  const experienceYears = new Date().getFullYear() - 2023; // Years since first job

  useEffect(() => {
    // Animate the count for years of experience
    const animation = animate(count, experienceYears, { duration: 2 });
    return animation.stop;
  }, []);

  useEffect(() => {
    // Animate the timeline line growth
    const animateLine = async () => {
      await lineControls.start({
        height: "100%",
        transition: { duration: 1.5, ease: "easeOut" }
      });
    };
    
    animateLine();
  }, []);
  
  // Add floating icon animations
  useEffect(() => {
    const rotateAnim1 = animate(rotateIcon1, [0, 10, -5, 0], {
      duration: 8,
      repeat: Infinity,
      ease: "easeInOut"
    });
    
    const rotateAnim2 = animate(rotateIcon2, [0, -8, 5, 0], {
      duration: 7,
      repeat: Infinity,
      ease: "easeInOut"
    });
    
    const rotateAnim3 = animate(rotateIcon3, [0, 5, -10, 0], {
      duration: 9,
      repeat: Infinity,
      ease: "easeInOut"
    });
    
    return () => {
      rotateAnim1.stop();
      rotateAnim2.stop();
      rotateAnim3.stop();
    };
  }, []);

  const sectionVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
      },
    },
  };

  const headingVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.7,
        ease: "easeOut"
      }
    }
  };

  const timelineVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.4,
        delayChildren: 0.3
      },
    },
  };

  const timelineItemVariants = {
    hidden: { opacity: 0, x: -30, y: 20 },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: { 
        type: "spring",
        stiffness: 100,
        damping: 12,
        duration: 0.7
      },
    },
  };
  
  const iconVariants = {
    hidden: { scale: 0, opacity: 0, rotate: -45 },
    visible: { 
      scale: 1, 
      opacity: 1,
      rotate: 0,
      transition: { 
        type: "spring", 
        stiffness: 260, 
        damping: 20, 
        delay: 0.5
      } 
    }
  };
  
  const dotVariants = {
    hidden: { scale: 0 },
    visible: { 
      scale: [0, 1.5, 1],
      transition: { 
        times: [0, 0.6, 1],
        duration: 0.5
      }
    }
  };
  
  const responsibilityVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { 
        duration: 0.4
      }
    }
  };

  return (
    <section id="experience" className="py-12 sm:py-16 md:py-24 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 relative overflow-hidden" ref={sectionRef}>
      {/* Enhanced background with scroll-based animations */}
      <motion.div 
        className="absolute inset-0 bg-gradient-to-b from-gray-50/50 to-white/50 dark:from-gray-900/50 dark:to-gray-800/50 transition-colors duration-300"
        style={{ 
          opacity: backgroundOpacity
        }}
      />
      
      {/* Animated grid pattern background */}
      <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.01] bg-[linear-gradient(to_right,hsl(var(--primary)/10%)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--primary)/10%)_1px,transparent_1px)] bg-[size:3rem_3rem]"></div>
      
      {/* Floating tech icons in background for visual flair */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div 
          className="absolute top-[10%] right-[15%] w-12 h-12 md:w-16 md:h-16 opacity-10 dark:opacity-5"
          style={{ rotate: rotateIcon1 }}
          animate={{ 
            y: [0, -15, 0],
          }}
          transition={{ 
            y: { duration: 5, repeat: Infinity, ease: "easeInOut" },
          }}
        >
          <Server className="w-full h-full text-primary" />
        </motion.div>
        
        <motion.div 
          className="absolute bottom-[20%] left-[10%] w-10 h-10 md:w-14 md:h-14 opacity-10 dark:opacity-5"
          style={{ rotate: rotateIcon2 }}
          animate={{ 
            y: [0, 20, 0],
          }}
          transition={{ 
            y: { duration: 6, repeat: Infinity, ease: "easeInOut" },
            delay: 1
          }}
        >
          <Code className="w-full h-full text-secondary" />
        </motion.div>
        
        <motion.div 
          className="absolute top-[40%] right-[10%] w-8 h-8 md:w-12 md:h-12 opacity-10 dark:opacity-5"
          style={{ rotate: rotateIcon3 }}
          animate={{ 
            y: [0, 10, 0],
          }}
          transition={{ 
            y: { duration: 7, repeat: Infinity, ease: "easeInOut" },
            delay: 2
          }}
        >
          <GitBranch className="w-full h-full text-primary-accent" />
        </motion.div>
        
        <motion.div 
          className="absolute bottom-[30%] right-[20%] w-9 h-9 md:w-13 md:h-13 opacity-10 dark:opacity-5"
          animate={{ 
            y: [0, -12, 0],
            rotate: [0, -5, 0]
          }}
          transition={{ 
            y: { duration: 9, repeat: Infinity, ease: "easeInOut" },
            rotate: { duration: 7, repeat: Infinity, ease: "easeInOut" },
            delay: 1.5
          }}
        >
          <Lock className="w-full h-full text-secondary-accent" />
        </motion.div>
      </div>
      
      {/* Background decoration elements with enhanced parallax effect */}
      <motion.div 
        className="absolute top-0 left-0 w-full h-40 bg-gradient-to-b from-primary/5 to-transparent"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 1 }}
        viewport={{ once: true }}
      ></motion.div>
      <motion.div 
        className="absolute bottom-0 right-0 w-64 h-64 rounded-full blur-3xl -z-10"
        style={{ 
          background: "radial-gradient(circle, hsl(var(--primary)/10%) 0%, hsl(var(--primary)/2%) 70%)"
        }}
        initial={{ scale: 0.5, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        animate={{
          background: [
            "radial-gradient(circle, hsl(var(--primary)/10%) 0%, hsl(var(--primary)/2%) 70%)",
            "radial-gradient(circle, hsl(var(--primary)/12%) 0%, hsl(var(--primary)/1%) 70%)",
            "radial-gradient(circle, hsl(var(--primary)/10%) 0%, hsl(var(--primary)/2%) 70%)"
          ]
        }}
      ></motion.div>
      <motion.div 
        className="absolute top-1/3 left-10 w-32 h-32 rounded-full blur-3xl -z-10 hidden sm:block"
        style={{ 
          background: "radial-gradient(circle, hsl(var(--secondary)/10%) 0%, hsl(var(--secondary)/2%) 70%)"
        }}
        initial={{ scale: 0.2, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.5, delay: 0.2, ease: "easeOut" }}
        animate={{
          background: [
            "radial-gradient(circle, hsl(var(--secondary)/10%) 0%, hsl(var(--secondary)/2%) 70%)",
            "radial-gradient(circle, hsl(var(--secondary)/12%) 0%, hsl(var(--secondary)/1%) 70%)",
            "radial-gradient(circle, hsl(var(--secondary)/10%) 0%, hsl(var(--secondary)/2%) 70%)"
          ]
        }}
      ></motion.div>
      
      <div className="container mx-auto px-4 sm:px-6 relative">
        <motion.div
          className="text-center mb-8 sm:mb-12"
          variants={headingVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
        >
          <motion.span 
            className="inline-block px-3 py-1 text-sm font-medium bg-primary/10 dark:bg-primary/20 text-primary-600 dark:text-primary-300 rounded-full mb-3 border border-primary/20"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            viewport={{ once: true }}
          >
            {content?.sectionTag || "Career Path"}
          </motion.span>
          <motion.h2 
            className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4"
            variants={headingVariants}
          >
            {content?.sectionTitle || "Professional Experience"}
          </motion.h2>
          <motion.div 
            className="w-20 h-1 bg-gradient-to-r from-primary to-purple-500 mx-auto rounded-full mb-6"
            initial={{ width: 0 }}
            whileInView={{ width: 80 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            viewport={{ once: true }}
          ></motion.div>
          <motion.p 
            className="mt-4 text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-sm sm:text-base lg:text-lg"
            variants={headingVariants}
          >
            {content?.sectionDescription || "My professional journey in DevOps and software development, showcasing key roles and achievements."}
          </motion.p>
          
          {/* Years counter */}
          <motion.div 
            className="flex items-center justify-center gap-3 mt-5"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center gap-1 px-3 py-1 bg-primary/10 dark:bg-primary/20 rounded-full">
              <span className="text-primary font-bold text-sm">{content?.experienceBadgeText || "2+ Years Experience"}</span>
            </div>
          </motion.div>
        </motion.div>
        
        <div className="relative max-w-4xl mx-auto">
          {/* Experience timeline */}
          <motion.div
            variants={timelineVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            className="ml-0 md:ml-8"
          >
            {/* Vertical line with animated growth */}
            <motion.div
              ref={lineRef}
              initial={{ height: 0 }}
              animate={lineControls}
              className="absolute left-5 md:left-8 top-0 h-0 w-0.5 md:w-1 bg-gradient-to-b from-primary via-purple-500 to-blue-500 rounded-full block md:block"
            ></motion.div>
            
            {/* Timeline items */}
            <div className="space-y-8 sm:space-y-12">
              {isLoading ? (
                [1, 2].map((i) => (
                  <div key={i} className="ml-10 sm:ml-12 md:ml-16 w-full bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 md:p-8 shadow-md border border-gray-100 dark:border-gray-700 animate-pulse">
                    <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-48 mb-4"></div>
                    <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-32 mb-4"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-full"></div>
                      <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
                    </div>
                  </div>
                ))
              ) : (
                experience.map((item: IExperienceItem, index: number) => (
                <motion.div
                  key={item._id?.toString() || index}
                  className="relative flex flex-col md:flex-row"
                  variants={timelineItemVariants}
                  custom={index}
                >
                  {/* Timeline circle indicator with pulse animation */}
                  <motion.div 
                    className="absolute left-5 md:left-8 top-6 sm:top-8 w-6 h-6 sm:w-8 sm:h-8 -ml-3 sm:-ml-4 md:-ml-4 bg-white dark:bg-gray-900 border-3 sm:border-4 border-primary rounded-full z-10 block"
                    variants={dotVariants}
                  ></motion.div>
                  
                  {/* Experience card with hover animation */}
                  <motion.div 
                    className="ml-10 sm:ml-12 md:ml-16 w-full bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 md:p-8 shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 relative group"
                    whileHover={{ 
                      y: -5,
                      boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
                    }}
                  >
                    {/* Top accent bar with animation */}
                    <motion.div 
                      className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary to-purple-500 rounded-t-xl"
                      initial={{ width: 0 }}
                      whileInView={{ width: "100%" }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                      viewport={{ once: true }}
                    ></motion.div>
                    
                    {/* Role and year */}
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-3 sm:mb-4">
                      <motion.h3 
                        className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-0"
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: 0.1 }}
                        viewport={{ once: true }}
                      >
                        {item.position}
                      </motion.h3>
                      <motion.span 
                        className="inline-flex items-center px-2.5 py-0.5 sm:px-3 sm:py-1 text-xs sm:text-sm font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 whitespace-nowrap"
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: 0.2 }}
                        viewport={{ once: true }}
                      >
                        <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                        {item.duration}
                      </motion.span>
                    </div>
                    
                    {/* Company and location */}
                    <motion.div 
                      className="flex flex-wrap gap-3 sm:gap-4 mb-4 sm:mb-5 text-xs sm:text-sm"
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.3 }}
                      viewport={{ once: true }}
                    >
                      <div className="flex items-center text-gray-600 dark:text-gray-400">
                        <Building2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-1.5 text-gray-500 dark:text-gray-400" />
                        {item.company}
                      </div>
                      <div className="flex items-center text-gray-600 dark:text-gray-400">
                        <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-1.5 text-gray-500 dark:text-gray-400" />
                        {item.location}
                      </div>
                    </motion.div>
                    
                    {/* Responsibilities with staggered animation */}
                    <motion.div 
                      className="space-y-2 sm:space-y-2.5"
                      initial="hidden"
                      whileInView="visible"
                      viewport={{ once: true }}
                      variants={{
                        hidden: { opacity: 0 },
                        visible: {
                          opacity: 1,
                          transition: {
                            staggerChildren: 0.15,
                            delayChildren: 0.3
                          }
                        }
                      }}
                    >
                      {item.responsibilities?.map((resp, idx) => (
                        <motion.div 
                          key={idx} 
                          className="flex items-start"
                          variants={responsibilityVariants}
                        >
                          <div className="flex-shrink-0 w-4 h-4 sm:w-5 sm:h-5 mt-0.5 sm:mt-1 mr-2 sm:mr-3 text-primary">
                            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 sm:w-5 sm:h-5">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <p className="text-gray-700 dark:text-gray-300 text-sm sm:text-base">{resp}</p>
                        </motion.div>
                      ))}
                    </motion.div>
                    
                    {/* Decorative element with hover animation */}
                    <motion.div 
                      className="absolute bottom-0 right-0 w-16 h-16 bg-primary/5 dark:bg-primary/10 rounded-tl-3xl -z-10 opacity-0 group-hover:opacity-100 transition-opacity"
                      whileHover={{ scale: 1.2 }}
                    ></motion.div>
                  </motion.div>
                </motion.div>
                ))
              )}
            </div>
          </motion.div>
          
          {/* Experience summary icon with spinning animation */}
          <motion.div
            className="hidden md:flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-primary to-purple-500 rounded-full mx-auto mt-8 shadow-lg"
            variants={iconVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            whileHover={{ 
              scale: 1.1,
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
            }}
          >
            <Briefcase className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
          </motion.div>
          
          {/* Bottom CTA with hover animation */}
          <motion.div
            className="mt-10 sm:mt-16 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
          >
            <motion.a 
              href="#projects" 
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-all text-primary dark:text-primary-400 font-medium text-sm border border-gray-100 dark:border-gray-700"
              whileHover={{ 
                scale: 1.05,
                boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)"
              }}
              whileTap={{ scale: 0.98 }}
            >
              See My Projects
              <motion.svg 
                className="w-4 h-4" 
                viewBox="0 0 20 20" 
                fill="currentColor"
                animate={{ x: [0, 3, 0] }}
                transition={{ repeat: Infinity, duration: 1.5, repeatType: "loop" }}
              >
                <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </motion.svg>
            </motion.a>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ExperienceSection;
