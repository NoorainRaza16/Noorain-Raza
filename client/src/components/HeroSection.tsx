import { Button } from "@/components/ui/button";
import { motion, useMotionValue, useTransform, useScroll, AnimatePresence } from "framer-motion";
import { scrollToElement } from "@/lib/utils";
import { Download, ExternalLink, Code, Server, Database, Github, Linkedin } from "lucide-react";
import { RiTwitterXFill } from "react-icons/ri";
import { FaFacebook, FaYoutube, FaInstagram } from "react-icons/fa";
import ScrollIndicator from "./ScrollIndicator";
import { ProfilePhoto } from "./ProfilePhoto";
import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAutomaticPlatformIcon } from "@/lib/platformIcons";

const HeroSection = () => {
  // Fetch hero content from API with aggressive refresh settings
  const { data: heroData, isLoading } = useQuery({
    queryKey: ['/api/hero'],
    queryFn: async () => {
      const response = await fetch('/api/hero', {
        cache: 'no-cache',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      if (!response.ok) throw new Error('Failed to fetch hero data');
      return response.json();
    },
    staleTime: 0, // Data is immediately stale
    gcTime: 1000 * 30, // Keep in cache for 30 seconds
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Use the hero content from API or fallback
  const heroContent = (heroData as any)?.data || {
    firstName: "Noorain",
    lastName: "Raza", 
    title: "Computer Science Engineering Student",
    tagline: "AI & Cloud enthusiast with expertise in Python, React, and software development. Building innovative solutions for tomorrow's challenges.",
    roles: ["Computer Science & Engineering Student", "Cloud Engineer", "DevOps Engineer", "Software Developer"],
    heroImage: "/assets/profile-photo.jpg",
    resumeUrl: "/resume.pdf",
    resumeLabel: "Download Resume"
  };

  // Roles for typing effect - handle both array and string format
  let roles = ["Computer Science & Engineering Student", "Cloud Engineer", "DevOps Engineer", "Software Developer"];
  
  if (heroContent.roles) {
    if (Array.isArray(heroContent.roles)) {
      roles = heroContent.roles;
    } else if (typeof heroContent.roles === 'string') {
      // Handle string format from admin panel (newline separated)
      roles = heroContent.roles.split('\n').filter((role: string) => role.trim());
    }
  }
  const [currentRoleIndex, setCurrentRoleIndex] = useState(0);
  const [text, setText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [typingSpeed, setTypingSpeed] = useState(100);
  const [colorIndex, setColorIndex] = useState(0);
  const timeoutRef = useRef<number | null>(null);
  
  // Gradient colors for the text
  const gradientColors = [
    "from-primary to-purple-500",
    "from-blue-500 to-cyan-400",
    "from-emerald-500 to-teal-400",
    "from-amber-500 to-orange-400",
    "from-pink-500 to-rose-400"
  ];
  
  // Typing effect with color changes
  useEffect(() => {
    const handleTyping = () => {
      const currentRole = roles[currentRoleIndex];
      
      if (!isDeleting) {
        // Typing
        if (text.length < currentRole.length) {
          setText(currentRole.substring(0, text.length + 1));
          setTypingSpeed(Math.random() * (100 - 50) + 50); // Random typing speed between 50ms and 100ms
          
          // Change color every few characters for visual effect
          if (text.length % 5 === 0) {
            setColorIndex((prevIndex) => (prevIndex + 1) % gradientColors.length);
          }
        } else {
          // Start deleting after a pause
          setIsDeleting(true);
          setTypingSpeed(1000); // Pause before deleting
        }
      } else {
        // Deleting
        if (text.length > 0) {
          setText(currentRole.substring(0, text.length - 1));
          setTypingSpeed(40); // Faster when deleting
          
          // Change color every few deleted characters
          if (text.length % 8 === 0) {
            setColorIndex((prevIndex) => (prevIndex + 1) % gradientColors.length);
          }
        } else {
          // Move to next role
          setIsDeleting(false);
          setCurrentRoleIndex((prevIndex) => (prevIndex + 1) % roles.length);
          setTypingSpeed(500); // Pause before typing next role
          setColorIndex((prevIndex) => (prevIndex + 2) % gradientColors.length); // Change color for next role
        }
      }
    };
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // @ts-ignore
    timeoutRef.current = setTimeout(handleTyping, typingSpeed);
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [text, isDeleting, currentRoleIndex, roles, typingSpeed]);
  
  const handleNavClick = (sectionId: string) => {
    scrollToElement(sectionId);
  };
  
  // Download resume function
  const downloadResume = () => {
    fetch('/api/resume')
      .then(response => response.blob())
      .then(blob => {
        const blobUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = blobUrl;
        a.download = 'Noorain_Raza_Resume.pdf';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(blobUrl);
        document.body.removeChild(a);
      })
      .catch(error => console.error('Download failed:', error));
  };
  
  // Parallax effect for background elements
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, -50]);
  const y2 = useTransform(scrollY, [0, 500], [0, -100]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0.5]);
  
  // Mouse movement effects
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;
    
    mouseX.set(offsetX);
    mouseY.set(offsetY);
  };
  
  const rotateX = useTransform(mouseY, [0, 300], [5, -5]);
  const rotateY = useTransform(mouseX, [0, 300], [-5, 5]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
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

  const imageVariants = {
    hidden: { scale: 0.8, opacity: 0, rotateZ: -5 },
    visible: {
      scale: 1,
      opacity: 1,
      rotateZ: 0,
      transition: { 
        type: "spring", 
        stiffness: 100,
        damping: 15,
        duration: 0.7 
      },
    },
  };
  
  const gradientBorderVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { 
        duration: 1.2,
        delay: 0.3
      }
    }
  };

  const techIconsVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.6,
      },
    },
  };

  const techIconVariant = {
    hidden: { scale: 0, opacity: 0, y: 20 },
    visible: {
      scale: 1,
      opacity: 1,
      y: 0,
      transition: { 
        type: "spring", 
        stiffness: 260, 
        damping: 20 
      },
    },
    hover: {
      scale: 1.1,
      y: -5,
      transition: { 
        type: "spring", 
        stiffness: 400,
        damping: 10
      }
    }
  };
  
  const buttonVariants = {
    hover: {
      scale: 1.05,
      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)"
    },
    tap: {
      scale: 0.98
    }
  };

  return (
    <section 
      id="home" 
      className="relative pt-16 xs:pt-18 sm:pt-20 pb-28 sm:pb-32 md:pt-24 md:pb-40 overflow-hidden"
      onMouseMove={handleMouseMove}
    >
      {/* Enhanced background decoration with parallax and animation effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Main background gradients with parallax effect */}
        <motion.div 
          className="absolute -top-20 -left-20 w-40 sm:w-72 md:w-96 h-40 sm:h-72 md:h-96 bg-gradient-to-br from-primary/10 to-primary/5 dark:from-primary/15 dark:to-primary/5 rounded-full blur-3xl"
          style={{ y: y1, opacity }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5 }}
        ></motion.div>
        <motion.div 
          className="absolute top-40 right-0 w-60 sm:w-96 md:w-[32rem] h-60 sm:h-96 md:h-[32rem] bg-gradient-to-tl from-secondary/10 to-primary-accent/5 dark:from-secondary/15 dark:to-primary-accent/5 rounded-full blur-3xl"
          style={{ y: y2, opacity }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, delay: 0.2 }}
        ></motion.div>
        <motion.div 
          className="absolute -bottom-20 left-1/3 w-48 sm:w-80 md:w-[28rem] h-48 sm:h-80 md:h-[28rem] bg-gradient-to-tr from-primary-accent/10 to-secondary-accent/5 dark:from-primary-accent/15 dark:to-secondary-accent/5 rounded-full blur-3xl"
          style={{ y: y1, opacity }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, delay: 0.4 }}
        ></motion.div>
        
        {/* Animated decorative elements */}
        <motion.div 
          className="absolute top-1/3 left-1/4 w-4 h-4 bg-primary/30 rounded-full"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.7, 0.3]
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        ></motion.div>
        <motion.div 
          className="absolute top-1/4 right-1/4 w-6 h-6 bg-secondary/20 rounded-full"
          animate={{ 
            scale: [1, 1.5, 1],
            opacity: [0.2, 0.5, 0.2]
          }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        ></motion.div>
        <motion.div 
          className="absolute bottom-1/3 right-1/3 w-5 h-5 bg-primary-accent/20 rounded-full"
          animate={{ 
            scale: [1, 1.4, 1],
            opacity: [0.2, 0.6, 0.2]
          }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        ></motion.div>
        
        {/* Animated grid pattern */}
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.02] bg-[linear-gradient(to_right,hsl(var(--primary)/10%)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--primary)/10%)_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
        
        {/* Animated gradient line with pulse */}
        <motion.div 
          className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"
          animate={{ 
            opacity: [0.2, 0.5, 0.2],
            height: ['1px', '1.5px', '1px']
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        ></motion.div>
        
        {/* Mouse following gradient effect */}
        <motion.div 
          className="absolute w-[30rem] h-[30rem] rounded-full opacity-0 sm:opacity-30 dark:sm:opacity-20 pointer-events-none"
          style={{
            background: "radial-gradient(circle, rgba(var(--gradient-1), 0.15), transparent 70%)",
            left: useTransform(mouseX, value => value - 240),
            top: useTransform(mouseY, value => value - 240),
          }}
        ></motion.div>
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 relative">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 md:gap-4">
          {/* Mobile Profile Image (shown at top on mobile) */}
          <motion.div
            className="w-full mb-8 md:hidden relative order-first flex justify-center items-center"
            variants={imageVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div 
              className="relative max-w-[200px] xs:max-w-[240px] sm:max-w-[280px] mx-auto"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 100, damping: 10 }}
            >
              {/* Animated gradient borders and glow effect */}
              <motion.div 
                className="absolute -inset-4 rounded-full bg-gradient-to-r from-primary via-primary-accent to-secondary opacity-80 blur-md"
                variants={gradientBorderVariants}
                animate={{ 
                  rotate: [0, 360],
                  background: [
                    "linear-gradient(to right, hsl(var(--primary)), hsl(var(--primary-accent)), hsl(var(--secondary)))",
                    "linear-gradient(to right, hsl(var(--secondary)), hsl(var(--primary)), hsl(var(--primary-accent)))",
                    "linear-gradient(to right, hsl(var(--primary-accent)), hsl(var(--secondary)), hsl(var(--primary)))",
                    "linear-gradient(to right, hsl(var(--primary)), hsl(var(--primary-accent)), hsl(var(--secondary)))"
                  ]
                }}
                transition={{ 
                  rotate: { repeat: Infinity, duration: 10, ease: "linear" },
                  background: { repeat: Infinity, duration: 8, ease: "easeInOut" }
                }}
              ></motion.div>
              <motion.div 
                className="absolute -inset-2 rounded-full bg-gradient-to-r from-secondary via-primary to-primary-accent opacity-70"
                variants={gradientBorderVariants}
              ></motion.div>
              
              {/* Glass effect overlay */}
              <motion.div 
                className="absolute inset-0 rounded-full bg-white/5 dark:bg-black/5 z-10"
              ></motion.div>
              
              {/* Profile image */}
              <motion.div className="relative rounded-full overflow-hidden neon-glow">
                <ProfilePhoto 
                  size="md"
                  alt={`${heroContent.firstName} ${heroContent.lastName}`}
                  src={heroContent.heroImage}
                />
              </motion.div>
              
              {/* Removed small floating tech icons for cleaner look */}
            </motion.div>
          </motion.div>

          {/* Text Content */}
          <motion.div
            className="md:w-1/2 mb-8 md:mb-0 space-y-4 sm:space-y-6 md:space-y-7 text-center md:text-left"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div className="inline-block" variants={itemVariants}>
              <div className="px-3 sm:px-5 py-1 sm:py-1.5 rounded-full bg-primary/10 dark:bg-primary/20 text-primary-600 dark:text-primary-300 text-xs sm:text-sm font-medium border border-primary/20">
                {heroContent.title}
              </div>
            </motion.div>
            
            <motion.h1
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-2 sm:mb-3 md:mb-4"
              variants={itemVariants}
            >
              Hi, I'm{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-500 dark:from-primary-400 dark:to-purple-400">
                {heroContent.firstName} {heroContent.lastName}
              </span>
            </motion.h1>
            
            {/* Typing effect roles text - Fixed height and overflow */}
            <motion.div
              className="relative h-14 xs:h-16 sm:h-20 md:h-24 overflow-visible w-full mb-3 sm:mb-4 md:mb-5"
              variants={itemVariants}
            >
              <div className="absolute text-xl xs:text-2xl sm:text-3xl md:text-4xl font-bold w-full text-center md:text-left">
                <span className={`text-transparent bg-clip-text bg-gradient-to-r ${gradientColors[colorIndex]} dark:${gradientColors[colorIndex].replace('to-', 'to-')}`}>{text}</span>
                <span className={`inline-block w-[2px] xs:w-1 h-6 xs:h-7 sm:h-8 md:h-9 ml-1 bg-gradient-to-r ${gradientColors[colorIndex]} animate-pulse`}></span>
              </div>
            </motion.div>
            
            <motion.p
              className="text-base sm:text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-xl mx-auto md:mx-0"
              variants={itemVariants}
            >
              {heroContent.tagline}
            </motion.p>
            
            {/* Action buttons with enhanced animations - Improved mobile responsiveness */}
            <motion.div
              className="flex flex-wrap justify-center md:justify-start gap-2 xs:gap-3 sm:gap-4 pt-2 sm:pt-3"
              variants={itemVariants}
            >
              <motion.div
                whileHover="hover"
                whileTap="tap"
                variants={buttonVariants}
              >
                <Button
                  size="default"
                  onClick={() => handleNavClick("contact")}
                  className="relative shadow-md hover:shadow-lg overflow-hidden bg-gradient-to-r from-primary to-purple-600 hover:from-primary hover:to-primary-accent text-white text-sm sm:text-base rounded-lg sm:rounded-xl px-6 sm:px-8 py-2.5 sm:py-3 transition-all duration-300"
                >
                  <span className="relative z-10">Contact Me</span>
                  <motion.span 
                    className="absolute inset-0 bg-gradient-to-r from-secondary to-primary-accent rounded-lg sm:rounded-xl" 
                    initial={{ y: "100%" }}
                    whileHover={{ y: 0 }}
                    transition={{ duration: 0.3 }}
                  />
                </Button>
              </motion.div>
              
              <motion.div
                whileHover="hover"
                whileTap="tap"
                variants={buttonVariants}
              >
                <Button
                  variant="outline"
                  size="default"
                  onClick={() => handleNavClick("projects")}
                  className="shadow-sm hover:shadow-md text-sm sm:text-base rounded-lg sm:rounded-xl border-2 border-gray-300 dark:border-gray-700 hover:border-primary dark:hover:border-primary-400 px-6 sm:px-8 py-2.5 sm:py-3 transition-all duration-300 relative overflow-hidden"
                >
                  <span className="relative z-10">View Projects</span>
                  <motion.span 
                    className="absolute inset-0 bg-gradient-to-r from-primary/10 to-primary-accent/10 rounded-lg sm:rounded-xl"
                    initial={{ scale: 0, opacity: 0 }}
                    whileHover={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.4 }}
                  />
                </Button>
              </motion.div>
              
              {/* Download Resume Button */}
              <motion.div
                whileHover="hover"
                whileTap="tap"
                variants={buttonVariants}
              >
                <Button
                  variant="ghost"
                  size="default"
                  onClick={downloadResume}
                  className="shadow-sm hover:shadow-md text-sm sm:text-base rounded-lg sm:rounded-xl px-5 sm:px-6 py-2.5 sm:py-3 flex items-center gap-1.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300"
                >
                  <motion.span 
                    animate={{ y: [0, -2, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                  >
                    <Download className="h-4 w-4" />
                  </motion.span>
                  {heroContent.resumeLabel || "Download Resume"}
                </Button>
              </motion.div>
            </motion.div>
            
            {/* Social Links with enhanced animations */}
            <motion.div 
              className="flex gap-3 sm:gap-4 justify-center md:justify-start mt-12 mb-6"
              variants={itemVariants}
            >
              {heroContent.socialLinks?.filter((link: any) => link.isVisible !== false).map((socialLink: any, index: number) => {
                // Use automatic platform icon detection
                const { icon: autoIcon } = getAutomaticPlatformIcon(socialLink.url || '', socialLink.platform || '');
                
                const getSocialIcon = () => {
                  // Always prioritize automatic detection from URL
                  if (socialLink.url && socialLink.url.includes('://')) {
                    return autoIcon;
                  }
                  
                  // If no URL, check for custom icon
                  if (socialLink.icon && socialLink.icon.trim()) {
                    const customIcon = socialLink.icon.toLowerCase().trim();
                    
                    // Only allow emoji/special characters as custom icons
                    if (customIcon.length <= 2 && /[\u1F000-\u1F9FF]|[\u2600-\u26FF]|[\u2700-\u27BF]/.test(customIcon)) {
                      return <span className="text-lg">{socialLink.icon}</span>;
                    }
                  }
                  
                  // Final fallback to auto detection based on platform name
                  return autoIcon;
                };

                return (
                  <motion.a 
                    key={index}
                    href={socialLink.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-2 sm:p-2.5 md:p-3.5 rounded-full bg-gray-100 dark:bg-gray-700/60 text-gray-600 dark:text-gray-300 hover:bg-primary/10 dark:hover:bg-primary/20 hover:text-primary dark:hover:text-primary shadow-sm hover:shadow-md transition-all border border-transparent hover:border-primary/30"
                    whileHover={{ y: -2 }}
                    whileTap={{ y: 0 }}
                    transition={{ type: "spring", stiffness: 400, damping: 15 }}
                    aria-label={`${socialLink.platform} Profile`}
                  >
                    {getSocialIcon()}
                  </motion.a>
                );
              }) || (
                /* Fallback to default social links if none are configured */
                <>
                  <motion.a 
                    href="https://github.com/NoorainRaza23" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-2 sm:p-2.5 md:p-3.5 rounded-full bg-gray-100 dark:bg-gray-700/60 text-gray-600 dark:text-gray-300 hover:bg-primary/10 dark:hover:bg-primary/20 hover:text-primary dark:hover:text-primary shadow-sm hover:shadow-md transition-all border border-transparent hover:border-primary/30"
                    whileHover={{ y: -2 }}
                    whileTap={{ y: 0 }}
                    transition={{ type: "spring", stiffness: 400, damping: 15 }}
                    aria-label="GitHub Profile"
                  >
                    <Github className="h-5 w-5" />
                  </motion.a>
                  
                  <motion.a 
                    href="https://x.com/NoorainRaza23" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-2 sm:p-2.5 md:p-3.5 rounded-full bg-gray-100 dark:bg-gray-700/60 text-gray-600 dark:text-gray-300 hover:bg-primary/10 dark:hover:bg-primary/20 hover:text-primary dark:hover:text-primary shadow-sm hover:shadow-md transition-all border border-transparent hover:border-primary/30"
                    whileHover={{ y: -2 }}
                    whileTap={{ y: 0 }}
                    transition={{ type: "spring", stiffness: 400, damping: 15 }}
                    aria-label="X (Twitter) Profile"
                  >
                    <RiTwitterXFill className="h-5 w-5" />
                  </motion.a>
                  
                  <motion.a 
                    href="https://www.linkedin.com/in/noorainraza" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-2 sm:p-2.5 md:p-3.5 rounded-full bg-gray-100 dark:bg-gray-700/60 text-gray-600 dark:text-gray-300 hover:bg-primary/10 dark:hover:bg-primary/20 hover:text-primary dark:hover:text-primary shadow-sm hover:shadow-md transition-all border border-transparent hover:border-primary/30"
                    whileHover={{ y: -2 }}
                    whileTap={{ y: 0 }}
                    transition={{ type: "spring", stiffness: 400, damping: 15 }}
                    aria-label="LinkedIn Profile"
                  >
                    <Linkedin className="h-5 w-5" />
                  </motion.a>
                </>
              )}
            </motion.div>
            
            {/* Removed Stats display */}
          </motion.div>

          {/* Desktop Profile Image (hidden on mobile) with 3D effect */}
          <motion.div
            className="w-full sm:w-3/4 md:w-5/12 relative hidden md:block"
            variants={imageVariants}
            initial="hidden"
            animate="visible"
            style={{
              perspective: "1000px"
            }}
          >
            <motion.div 
              className="relative max-w-[280px] sm:max-w-none mx-auto"
              style={{
                rotateX: rotateX,
                rotateY: rotateY
              }}
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 100, damping: 10 }}
            >
              {/* Animated gradient borders and glow effect */}
              <motion.div 
                className="absolute -inset-4 rounded-full bg-gradient-to-r from-primary via-primary-accent to-secondary opacity-80 blur-md"
                variants={gradientBorderVariants}
                animate={{ 
                  rotate: [0, 360], 
                  background: [
                    "linear-gradient(to right, hsl(var(--primary)), hsl(var(--primary-accent)), hsl(var(--secondary)))",
                    "linear-gradient(to right, hsl(var(--secondary)), hsl(var(--primary)), hsl(var(--primary-accent)))",
                    "linear-gradient(to right, hsl(var(--primary-accent)), hsl(var(--secondary)), hsl(var(--primary)))",
                    "linear-gradient(to right, hsl(var(--primary)), hsl(var(--primary-accent)), hsl(var(--secondary)))"
                  ]
                }}
                transition={{ 
                  rotate: { repeat: Infinity, duration: 10, ease: "linear" },
                  background: { repeat: Infinity, duration: 8, ease: "easeInOut" }
                }}
              ></motion.div>
              <motion.div 
                className="absolute -inset-2 rounded-full bg-gradient-to-r from-secondary via-primary to-primary-accent opacity-70"
                variants={gradientBorderVariants}
              ></motion.div>
              
              {/* Glass effect overlay */}
              <motion.div 
                className="absolute inset-0 rounded-full bg-white/5 dark:bg-black/5 z-10"
              ></motion.div>
              
              {/* Profile image */}
              <motion.div className="relative rounded-full overflow-hidden neon-glow">
                <ProfilePhoto 
                  size="xl"
                  alt={`${heroContent.firstName} ${heroContent.lastName}`}
                  src={heroContent.heroImage}
                />
              </motion.div>
            </motion.div>

            {/* Removed floating technology icons for cleaner profile view */}
          </motion.div>
        </div>
        
        {/* Scroll indicator component */}
        <ScrollIndicator targetSection="about" />
      </div>
    </section>
  );
};

export default HeroSection;
