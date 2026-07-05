import { useEffect, useRef } from "react";
import { motion, useInView, useAnimationControls, useScroll, useTransform } from "framer-motion";
import { BookOpen, Star, Lightbulb, BookOpenCheck, Code, Server, Database } from "lucide-react";
import { useAboutData } from "@/hooks/use-about-data";

const AboutSection = () => {
  // Fetch dynamic about content using custom hook
  const { biography, aspirations, main, problemSolver, continuousLearner, devopsSpecialist, isLoading } = useAboutData();
  
  // References for scroll and animations
  const sectionRef = useRef<HTMLElement>(null);
  const biographyRef = useRef<HTMLDivElement>(null);
  const aspirationsRef = useRef<HTMLDivElement>(null);
  const iconRefs = [useRef(null), useRef(null), useRef(null)];
  
  // Check if elements are in view
  const isBiographyInView = useInView(biographyRef, { once: false, amount: 0.3 });
  const isAspirationsInView = useInView(aspirationsRef, { once: false, amount: 0.3 });
  
  // Animation controls
  const biographyControls = useAnimationControls();
  const aspirationsControls = useAnimationControls();
  const iconControls = useAnimationControls();
  
  // Scroll-based animations
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });
  
  // Transform values based on scroll progress
  const backgroundOpacity = useTransform(scrollYProgress, [0, 0.5, 1], [0.5, 1, 0.9]);
  const backgroundScale = useTransform(scrollYProgress, [0, 0.5, 1], [0.95, 1, 1.05]);
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -50]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const rotate = useTransform(scrollYProgress, [0, 1], [0, 20]);
  
  // Trigger animations when elements come into view
  useEffect(() => {
    if (isBiographyInView) {
      biographyControls.start("visible");
    }
    if (isAspirationsInView) {
      aspirationsControls.start("visible");
      iconControls.start("visible");
    }
  }, [isBiographyInView, isAspirationsInView, biographyControls, aspirationsControls, iconControls]);
  
  // Floating tech icons animation
  const floatingIconVariants = {
    hidden: { opacity: 0, y: 20, scale: 0 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
        type: "spring",
        stiffness: 100,
        damping: 10
      }
    }),
    hover: {
      y: -5,
      scale: 1.1,
      transition: {
        duration: 0.3,
        type: "spring",
        stiffness: 300,
        damping: 10
      }
    }
  };

  // Animation variants with improved easing and timing
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }
    }
  };

  const fadeInLeft = {
    hidden: { opacity: 0, x: -50 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { 
        duration: 0.7, 
        ease: [0.25, 0.1, 0.25, 1],
        type: "spring", 
        stiffness: 100,
        damping: 10 
      }
    }
  };

  const fadeInRight = {
    hidden: { opacity: 0, x: 50 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { 
        duration: 0.7, 
        ease: [0.25, 0.1, 0.25, 1],
        type: "spring", 
        stiffness: 100,
        damping: 10
      }
    }
  };

  const zoomIn = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { 
        duration: 0.6, 
        ease: [0.25, 0.1, 0.25, 1],
        type: "spring", 
        stiffness: 150,
        damping: 15
      }
    }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
        ease: "easeOut"
      }
    }
  };
  
  // Advanced card hover animations
  const cardHoverVariants = {
    hover: {
      y: -10,
      boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20
      }
    },
    tap: {
      y: -5,
      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
      transition: {
        type: "spring",
        stiffness: 500,
        damping: 30
      }
    }
  };
  
  // Icon animation
  const iconAnimationVariants = {
    initial: { scale: 1 },
    hover: { 
      scale: 1.15,
      rotate: [0, 5, -5, 0],
      transition: { 
        scale: { duration: 0.3 },
        rotate: { duration: 0.5, repeat: 0 }
      }
    }
  };

  return (
    <section 
      id="about" 
      className="py-12 sm:py-16 md:py-24 relative overflow-hidden"
      ref={sectionRef}
    >
      {/* Enhanced background decoration with parallax effect */}
      <motion.div 
        className="absolute inset-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800/70 transition-colors duration-300"
        style={{ 
          opacity: backgroundOpacity,
          scale: backgroundScale
        }}
      />
      
      {/* Animated background gradients */}
      <motion.div 
        className="absolute top-40 right-0 sm:right-10 w-32 sm:w-64 h-32 sm:h-64 rounded-full blur-3xl"
        style={{ 
          y: y1,
          background: "radial-gradient(circle, hsl(var(--primary)/15%) 0%, hsl(var(--primary)/5%) 70%)"
        }}
        animate={{
          opacity: [0.4, 0.6, 0.4],
          scale: [0.95, 1.05, 0.95],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      <motion.div 
        className="absolute bottom-20 left-0 sm:left-10 w-40 sm:w-72 h-40 sm:h-72 rounded-full blur-3xl"
        style={{ 
          y: y2,
          background: "radial-gradient(circle, hsl(var(--secondary)/15%) 0%, hsl(var(--secondary)/5%) 70%)"
        }}
        animate={{
          opacity: [0.3, 0.5, 0.3],
          scale: [0.9, 1.1, 0.9],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1
        }}
      />
      
      {/* Animated grid pattern */}
      <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.01] bg-[linear-gradient(to_right,hsl(var(--primary)/10%)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--primary)/10%)_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
      
      {/* Floating tech icons in background */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div 
          className="absolute top-[25%] right-[10%] w-12 h-12 md:w-16 md:h-16 opacity-10 dark:opacity-5"
          animate={{ 
            y: [0, -15, 0],
            rotate: [0, 10, 0]
          }}
          transition={{ 
            duration: 5, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
        >
          <Server className="w-full h-full text-primary" />
        </motion.div>
        
        <motion.div 
          className="absolute bottom-[30%] left-[10%] w-10 h-10 md:w-14 md:h-14 opacity-10 dark:opacity-5"
          animate={{ 
            y: [0, 15, 0],
            rotate: [0, -5, 0]
          }}
          transition={{ 
            duration: 4, 
            repeat: Infinity, 
            ease: "easeInOut",
            delay: 1
          }}
        >
          <Code className="w-full h-full text-secondary" />
        </motion.div>
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 relative">
        {/* Section header with improved animations */}
        <motion.div 
          className="text-center mb-10 sm:mb-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                delayChildren: 0.1,
                staggerChildren: 0.1
              }
            }
          }}
        >
          <motion.span 
            className="inline-block px-2.5 sm:px-3 py-1 text-xs sm:text-sm font-medium bg-primary/10 dark:bg-primary/20 text-primary-600 dark:text-primary-300 rounded-full mb-2 sm:mb-3 border border-primary/20 transition-all duration-300"
            variants={zoomIn}
          >
            Who I Am
          </motion.span>
          
          <motion.h2 
            className="text-2xl sm:text-3xl md:text-5xl font-bold mb-3 sm:mb-4 transition-colors duration-300 text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-accent dark:from-primary-400 dark:to-primary-accent"
            variants={fadeIn}
          >
            {main.title}
          </motion.h2>
          
          <motion.div 
            className="w-16 sm:w-20 h-1.5 mx-auto rounded-full mb-4 sm:mb-6 animate-gradient-pulse"
            style={{ 
              background: "linear-gradient(90deg, hsl(var(--primary)), hsl(var(--primary-accent)), hsl(var(--secondary)))" 
            }}
            variants={zoomIn}
          />
          
          <motion.p 
            className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-sm sm:text-base md:text-lg transition-colors duration-300"
            variants={fadeIn}
          >
            {main.content}
          </motion.p>
        </motion.div>

        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 sm:gap-8 lg:gap-10">
            {/* Main content - takes 3/5ths of the grid on large screens */}
            <div className="md:col-span-2 lg:col-span-3 order-2 md:order-1">
              {/* Biography card with enhanced animations */}
              <motion.div 
                ref={biographyRef}
                className="bg-white dark:bg-gray-800 p-5 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl shadow-md sm:shadow-lg border border-gray-100 dark:border-gray-700 mb-6 sm:mb-8 transition-all duration-300 relative overflow-hidden group"
                initial="hidden"
                animate={biographyControls}
                variants={fadeInLeft}
                whileHover="hover"
                whileTap="tap"
              >
                {/* Animated background shimmer effect */}
                <motion.div 
                  className="absolute inset-0 w-full h-full"
                  initial={{ opacity: 0 }}
                  whileHover={{ 
                    opacity: 1,
                    transition: { duration: 0.3 }
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent opacity-0 group-hover:opacity-100 animate-shimmer" />
                </motion.div>
                
                <div className="flex items-center mb-4 sm:mb-6">
                  <motion.div
                    variants={iconAnimationVariants}
                    initial="initial"
                    whileHover="hover"
                  >
                    <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-primary mr-2 sm:mr-3" />
                  </motion.div>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white transition-colors duration-300">{biography.title}</h3>
                </div>
                
                <motion.div 
                  className="space-y-4 sm:space-y-6"
                  variants={staggerContainer}
                >
                  {isLoading ? (
                    <div className="space-y-3">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-5/6"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-4/6"></div>
                    </div>
                  ) : biography.content && biography.content.length > 0 ? (
                    biography.content.map((paragraph: string, index: number) => (
                      <motion.p 
                        key={index} 
                        className="text-gray-700 dark:text-gray-300 text-sm sm:text-base leading-relaxed transition-colors duration-300"
                        variants={fadeIn}
                      >
                        {paragraph}
                      </motion.p>
                    ))
                  ) : (
                    <motion.p 
                      className="text-gray-500 dark:text-gray-400 text-sm sm:text-base leading-relaxed transition-colors duration-300 italic"
                      variants={fadeIn}
                    >
                      Biography content will appear here once added through the admin panel.
                    </motion.p>
                  )}
                </motion.div>
              </motion.div>
              
              {/* Aspirations card with enhanced animations */}
              <motion.div 
                ref={aspirationsRef}
                className="bg-white dark:bg-gray-800 p-5 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl shadow-md sm:shadow-lg border border-gray-100 dark:border-gray-700 transition-all duration-300 relative overflow-hidden group"
                initial="hidden"
                animate={aspirationsControls}
                variants={{
                  ...fadeInLeft,
                  hover: cardHoverVariants.hover,
                  tap: cardHoverVariants.tap
                }}
                whileHover="hover"
                whileTap="tap"
              >
                {/* Animated background shimmer effect */}
                <motion.div 
                  className="absolute inset-0 w-full h-full"
                  initial={{ opacity: 0 }}
                  whileHover={{ 
                    opacity: 1,
                    transition: { duration: 0.3 }
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent opacity-0 group-hover:opacity-100 animate-shimmer" />
                </motion.div>
                
                <div className="flex items-center mb-4 sm:mb-6">
                  <motion.div
                    variants={iconAnimationVariants}
                    initial="initial"
                    whileHover="hover"
                  >
                    <Star className="w-5 h-5 sm:w-6 sm:h-6 text-primary mr-2 sm:mr-3" />
                  </motion.div>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white transition-colors duration-300">{aspirations.title}</h3>
                </div>
                
                {isLoading ? (
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-4/5"></div>
                  </div>
                ) : aspirations.content ? (
                  <motion.p 
                    className="text-gray-700 dark:text-gray-300 text-sm sm:text-base leading-relaxed transition-colors duration-300"
                    variants={fadeIn}
                  >
                    {String(aspirations.content)}
                  </motion.p>
                ) : (
                  <motion.p 
                    className="text-gray-500 dark:text-gray-400 text-sm sm:text-base leading-relaxed transition-colors duration-300 italic"
                    variants={fadeIn}
                  >
                    Aspirations content will appear here once added through the admin panel.
                  </motion.p>
                )}
              </motion.div>
            </div>
            
            {/* Side content - takes 2/5ths of the grid on large screens */}
            <div className="md:col-span-1 lg:col-span-2 order-1 md:order-2 flex flex-col gap-5 sm:gap-8">

              
              {/* Highlight card 1 with enhanced hover effects */}
              <motion.div 
                className="bg-gradient-to-br from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-primary/20 dark:border-primary/30 shadow-sm transition-all duration-300 relative group overflow-hidden"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                variants={{
                  ...fadeInRight,
                  hover: cardHoverVariants.hover,
                  tap: cardHoverVariants.tap
                }}
                whileHover="hover"
                whileTap="tap"
              >
                {/* Card glow effect on hover */}
                <motion.div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-primary/5 to-transparent"
                  animate={{
                    background: [
                      "radial-gradient(circle at center, hsl(var(--primary)/10%) 0%, transparent 70%)",
                      "radial-gradient(circle at center, hsl(var(--primary)/15%) 0%, transparent 70%)",
                      "radial-gradient(circle at center, hsl(var(--primary)/10%) 0%, transparent 70%)"
                    ]
                  }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                />
                
                <div className="flex items-center mb-2 sm:mb-3">
                  <motion.div 
                    className="p-1.5 sm:p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm mr-3 sm:mr-4 transition-colors duration-300"
                    variants={iconAnimationVariants}
                    whileHover="hover"
                  >
                    <Lightbulb className="w-4 h-4 sm:w-6 sm:h-6 text-primary" />
                  </motion.div>
                  <h4 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white transition-colors duration-300">{problemSolver.title}</h4>
                </div>
                <p className="text-gray-700 dark:text-gray-300 text-sm sm:text-base transition-colors duration-300">
                  {problemSolver.content}
                </p>
              </motion.div>
              
              {/* Highlight card 2 with enhanced hover effects */}
              <motion.div 
                className="bg-gradient-to-br from-secondary/10 to-secondary/5 dark:from-secondary/20 dark:to-secondary/10 p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-secondary/20 dark:border-secondary/30 shadow-sm transition-all duration-300 relative group overflow-hidden"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                variants={{
                  ...fadeInRight,
                  hover: cardHoverVariants.hover,
                  tap: cardHoverVariants.tap
                }}
                transition={{ delay: 0.2 }}
                whileHover="hover"
                whileTap="tap"
              >
                {/* Card glow effect on hover */}
                <motion.div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  animate={{
                    background: [
                      "radial-gradient(circle at center, hsl(var(--secondary)/10%) 0%, transparent 70%)",
                      "radial-gradient(circle at center, hsl(var(--secondary)/15%) 0%, transparent 70%)",
                      "radial-gradient(circle at center, hsl(var(--secondary)/10%) 0%, transparent 70%)"
                    ]
                  }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                />
                
                <div className="flex items-center mb-2 sm:mb-3">
                  <motion.div 
                    className="p-1.5 sm:p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm mr-3 sm:mr-4 transition-colors duration-300"
                    variants={iconAnimationVariants}
                    whileHover="hover"
                  >
                    <BookOpenCheck className="w-4 h-4 sm:w-6 sm:h-6 text-secondary" />
                  </motion.div>
                  <h4 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white transition-colors duration-300">{continuousLearner.title}</h4>
                </div>
                <p className="text-gray-700 dark:text-gray-300 text-sm sm:text-base transition-colors duration-300">
                  {continuousLearner.content}
                </p>
              </motion.div>
              
              {/* Highlight card 3 with enhanced hover effects */}
              <motion.div 
                className="bg-gradient-to-br from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-primary/20 dark:border-primary/30 shadow-sm transition-all duration-300 relative group overflow-hidden"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                variants={{
                  ...fadeInRight,
                  hover: cardHoverVariants.hover,
                  tap: cardHoverVariants.tap
                }}
                transition={{ delay: 0.4 }}
                whileHover="hover"
                whileTap="tap"
              >
                {/* Card glow effect on hover */}
                <motion.div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-primary/5 to-transparent"
                  animate={{
                    background: [
                      "radial-gradient(circle at center, hsl(var(--primary)/10%) 0%, transparent 70%)",
                      "radial-gradient(circle at center, hsl(var(--primary)/15%) 0%, transparent 70%)",
                      "radial-gradient(circle at center, hsl(var(--primary)/10%) 0%, transparent 70%)"
                    ]
                  }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                />
                
                <div className="flex items-center mb-2 sm:mb-3">
                  <motion.div 
                    className="p-1.5 sm:p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm mr-3 sm:mr-4 transition-colors duration-300"
                    variants={iconAnimationVariants}
                    whileHover="hover"
                  >
                    <Database className="w-4 h-4 sm:w-6 sm:h-6 text-primary" />
                  </motion.div>
                  <h4 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white transition-colors duration-300">{devopsSpecialist.title}</h4>
                </div>
                <p className="text-gray-700 dark:text-gray-300 text-sm sm:text-base transition-colors duration-300">
                  {devopsSpecialist.content}
                </p>
              </motion.div>

              {/* Floating tech stack icons with enhanced animations */}
              <motion.div 
                className="relative flex justify-center items-center space-x-3 sm:space-x-4 mt-4 sm:mt-6"
                initial="hidden"
                animate={iconControls}
                variants={{
                  hidden: { opacity: 0 },
                  visible: {
                    opacity: 1,
                    transition: {
                      staggerChildren: 0.1,
                      delayChildren: 0.5
                    }
                  }
                }}
              >
                {[
                  { Icon: Code, color: "text-blue-500", delay: 0 },
                  { Icon: Server, color: "text-green-500", delay: 0.1 },
                  { Icon: Database, color: "text-purple-500", delay: 0.2 }
                ].map(({ Icon, color, delay }, index) => (
                  <motion.div
                    key={index}
                    ref={iconRefs[index]}
                    className={`p-2 sm:p-3 bg-white dark:bg-gray-800 rounded-full shadow-md transition-all duration-300 cursor-pointer ${color}`}
                    variants={floatingIconVariants}
                    custom={index}
                    whileHover="hover"
                    whileTap={{ scale: 0.95 }}
                  >
                    <Icon className="w-4 h-4 sm:w-6 sm:h-6" />
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;