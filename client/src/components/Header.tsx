import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useTheme } from "./ThemeProvider";
import { useSocket } from "@/lib/socket";
import {
  SunIcon,
  MoonIcon,
  MenuIcon,
  XIcon,
  HomeIcon,
  UserIcon,
  CodeIcon,
  BookIcon,
  BriefcaseIcon,
  FolderIcon,
  AwardIcon,
  FileTextIcon,
  PhoneIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { scrollToElement } from "@/lib/utils";
import { data } from "@/data";
import {
  motion,
  useSpring,
  useMotionValue,
  useTransform,
  AnimatePresence,
} from "framer-motion";
import { ProfilePhotoLogo } from "./ui/ProfilePhotoLogo";

const Header = () => {
  const { theme, setTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const [previousSection, setPreviousSection] = useState("home");
  const [isTransitioning, setIsTransitioning] = useState(false);

  const queryClient = useQueryClient();

  // Fetch hero content for dynamic profile image
  const { data: heroData } = useQuery({
    queryKey: ["/api/hero"],
    queryFn: async () => {
      const response = await fetch("/api/hero", {
        cache: "no-cache",
        headers: {
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
      });
      if (!response.ok) throw new Error("Failed to fetch hero data");
      return response.json();
    },
    staleTime: 0,
    gcTime: 1000 * 30,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchInterval: 30000,
  });

  // Initialize Socket.IO for real-time updates
  useSocket();

  // 3D animation related state and refs
  const menuRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const navRef = useRef<HTMLDivElement>(null);
  const logoRotateX = useMotionValue(0);
  const logoRotateY = useMotionValue(0);
  const springConfig = { damping: 20, stiffness: 300 };
  const logoSpringRotateX = useSpring(logoRotateX, springConfig);
  const logoSpringRotateY = useSpring(logoRotateY, springConfig);

  const { profile } = data;
  const initials = `${profile.firstName.charAt(0)}${profile.lastName.charAt(0)}`;

  // Navigation link definitions
  const navLinks = [
    { label: "Home", id: "home", icon: <HomeIcon className="w-4 h-4" /> },
    { label: "About", id: "about", icon: <UserIcon className="w-4 h-4" /> },
    { label: "Skills", id: "skills", icon: <CodeIcon className="w-4 h-4" /> },
    {
      label: "Education",
      id: "education",
      icon: <BookIcon className="w-4 h-4" />,
    },
    {
      label: "Experience",
      id: "experience",
      icon: <BriefcaseIcon className="w-4 h-4" />,
    },
    {
      label: "Projects",
      id: "projects",
      icon: <FolderIcon className="w-4 h-4" />,
    },
    {
      label: "Certifications",
      id: "certifications",
      icon: <AwardIcon className="w-4 h-4" />,
    },
    { label: "Blog", id: "blog", icon: <FileTextIcon className="w-4 h-4" /> },
    {
      label: "Contact",
      id: "contact",
      icon: <PhoneIcon className="w-4 h-4" />,
    },
  ];

  // Handle scroll event to add shadow and background blur on scroll
  // Also tracks active section for 3D animations
  useEffect(() => {
    const handleScroll = () => {
      // Check for header styling
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }

      // Check active section
      const sections = navLinks.map((link) => link.id);
      let currentSection = activeSection;

      // Find which section is in view
      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          // Section is considered active if its top is near the viewport top
          const topVisible = rect.top >= -100 && rect.top <= 200;
          if (topVisible) {
            currentSection = section;
            break;
          }
        }
      }

      // Update active section if changed
      if (currentSection !== activeSection) {
        setPreviousSection(activeSection);
        setActiveSection(currentSection);
        // Trigger a transition animation
        setIsTransitioning(true);
        setTimeout(() => setIsTransitioning(false), 500);
      }
    };

    window.addEventListener("scroll", handleScroll);

    // Initial check for active section
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [activeSection, navLinks]);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        mobileMenuOpen &&
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        menuButtonRef.current &&
        !menuButtonRef.current.contains(event.target as Node)
      ) {
        closeMenu();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [mobileMenuOpen]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  // Toggle function with debounce to prevent accidental double clicks
  const toggleMobileMenu = () => {
    // Only toggle if not already toggling (debounce)
    if (!isToggling) {
      setIsToggling(true);
      setMobileMenuOpen(!mobileMenuOpen);

      // Reset toggle state after animation completes
      setTimeout(() => {
        setIsToggling(false);
      }, 300);
    }
  };

  const closeMenu = () => {
    if (!isToggling) {
      setIsToggling(true);
      setMobileMenuOpen(false);

      setTimeout(() => {
        setIsToggling(false);
      }, 300);
    }
  };

  // Enhanced navigation with 3D transition effects
  const handleNavClick = (sectionId: string) => {
    if (sectionId === activeSection) return;

    // Set state for animation
    setPreviousSection(activeSection);
    setActiveSection(sectionId);
    setIsTransitioning(true);

    // Create a 3D effect based on the navigation direction
    const currentIndex = navLinks.findIndex(
      (link) => link.id === activeSection,
    );
    const targetIndex = navLinks.findIndex((link) => link.id === sectionId);
    const isMovingForward = targetIndex > currentIndex;

    // Apply 3D rotation effect
    if (isMovingForward) {
      // Moving forward/down - rotate forward
      logoRotateX.set(15);
      setTimeout(() => logoRotateX.set(0), 300);
    } else {
      // Moving backward/up - rotate backward
      logoRotateX.set(-15);
      setTimeout(() => logoRotateX.set(0), 300);
    }

    // Also add some horizontal rotation based on the "distance" between sections
    const rotationAmount = Math.min(
      Math.abs(targetIndex - currentIndex) * 5,
      20,
    );
    logoRotateY.set(isMovingForward ? rotationAmount : -rotationAmount);
    setTimeout(() => logoRotateY.set(0), 300);

    // Perform the actual scroll
    scrollToElement(sectionId);
    closeMenu();

    // Reset transition state
    setTimeout(() => setIsTransitioning(false), 500);
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/90 dark:bg-gray-900/90 backdrop-blur-md shadow-sm"
          : "bg-white dark:bg-gray-900"
      }`}
    >
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="text-xl font-bold text-primary hover:text-primary/90 dark:text-primary-400 transition-colors"
            aria-label="Professional Portfolio - Home"
          >
            <span className="flex items-center">
              <motion.div
                style={{
                  rotateX: logoSpringRotateX,
                  rotateY: logoSpringRotateY,
                  transformStyle: "preserve-3d",
                  transformOrigin: "center center",
                }}
                className="mr-2"
              >
                <ProfilePhotoLogo
                  size="small"
                  pulseEffect={isTransitioning}
                  rotateOnHover={true}
                  glowEffect={true}
                  glowColor={theme === "dark" ? "#3b82f6" : "#60a5fa"}
                  className={`${isTransitioning ? "animate-pulse" : ""}`}
                  imagePath={
                    heroData?.data?.heroImage || "/assets/profile-photo.jpg"
                  }
                />
              </motion.div>
              <span className="hidden xs:inline">Portfolio</span>
            </span>
          </Link>

          {/* Desktop Navigation with 3D animation effect */}
          <nav
            ref={navRef}
            className="hidden lg:flex items-center space-x-6 xl:space-x-8"
          >
            {navLinks.map((link) => (
              <motion.a
                key={link.id}
                onClick={() => handleNavClick(link.id)}
                className={`text-sm font-medium cursor-pointer relative px-1 py-1`}
                role="button"
                tabIndex={0}
                animate={{
                  scale: activeSection === link.id ? 1.05 : 1,
                  color:
                    activeSection === link.id
                      ? theme === "dark"
                        ? "rgb(96, 165, 250)"
                        : "rgb(59, 130, 246)"
                      : theme === "dark"
                        ? "rgb(229, 231, 235)"
                        : "rgb(55, 65, 81)",
                }}
                transition={{ duration: 0.3 }}
                aria-label={`Navigate to ${link.label} section`}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    handleNavClick(link.id);
                  }
                }}
              >
                {link.label}

                {/* Animated underline indicator */}
                {activeSection === link.id && (
                  <motion.div
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary dark:bg-primary-400"
                    layoutId="nav-indicator"
                    transition={{
                      type: "spring",
                      bounce: 0.25,
                      duration: 0.5,
                    }}
                    style={{
                      boxShadow:
                        theme === "dark"
                          ? "0 0 8px rgba(96, 165, 250, 0.5)"
                          : "0 0 8px rgba(59, 130, 246, 0.3)",
                    }}
                  />
                )}

                {/* Hover indicator */}
                {activeSection !== link.id && (
                  <motion.div
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-300 dark:bg-gray-700"
                    initial={{ scaleX: 0, opacity: 0 }}
                    whileHover={{ scaleX: 1, opacity: 1 }}
                    transition={{ duration: 0.2 }}
                  />
                )}
              </motion.a>
            ))}
          </nav>

          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Contact button - only visible on desktop, with 3D animation */}
            <motion.div
              whileHover={{
                scale: 1.05,
                rotate: [-0.5, 0.5, 0],
                y: [-1, 1, 0],
              }}
              whileTap={{ scale: 0.95 }}
              animate={{
                y:
                  isTransitioning && activeSection === "contact"
                    ? [5, -5, 0]
                    : 0,
                rotate:
                  isTransitioning && activeSection === "contact"
                    ? [1, -1, 0]
                    : 0,
                scale: activeSection === "contact" ? 1.05 : 1,
              }}
              transition={{ duration: 0.3 }}
            >
              <Button
                variant="default"
                size="sm"
                onClick={() => handleNavClick("contact")}
                className={`hidden md:flex items-center gap-1.5 text-sm font-medium px-3 sm:px-4 py-1.5 sm:py-2 rounded-full ${
                  activeSection === "contact"
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                    : "bg-primary/90 text-primary-foreground hover:bg-primary shadow-sm"
                }`}
              >
                <motion.div
                  animate={{
                    rotate:
                      isTransitioning && activeSection === "contact"
                        ? [0, -15, 15, 0]
                        : 0,
                  }}
                  transition={{ duration: 0.5 }}
                >
                  <PhoneIcon className="h-3.5 w-3.5" />
                </motion.div>
                <span>Contact Me</span>
              </Button>
            </motion.div>

            {/* Theme Toggle with 3D animation */}
            <motion.div
              whileHover={{
                rotate: [-5, 5, 0],
                scale: 1.1,
                transition: { duration: 0.3 },
              }}
              whileTap={{ scale: 0.9 }}
            >
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                aria-label="Toggle theme"
                className="rounded-full h-8 w-8 sm:h-9 sm:w-9 relative overflow-hidden"
              >
                <motion.div
                  initial={false}
                  animate={{
                    rotateZ: [0, theme === "dark" ? 180 : -180],
                    scale: [1, 0.5, 1],
                  }}
                  transition={{ duration: 0.5 }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  {theme === "dark" ? (
                    <SunIcon className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-400" />
                  ) : (
                    <MoonIcon className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-400" />
                  )}
                </motion.div>
              </Button>
            </motion.div>

            {/* Mobile Menu Button with 3D animation */}
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="lg:hidden"
            >
              <Button
                ref={menuButtonRef}
                variant="ghost"
                size="icon"
                className="h-8 w-8 sm:h-9 sm:w-9 relative"
                onClick={toggleMobileMenu}
                aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
                aria-expanded={mobileMenuOpen}
              >
                <AnimatePresence mode="wait">
                  {mobileMenuOpen ? (
                    <motion.div
                      key="close"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <XIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="menu"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <MenuIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </Button>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-md z-40"
          onClick={closeMenu}
          aria-hidden="true"
        />
      )}

      <div
        ref={menuRef}
        className={`lg:hidden fixed right-0 top-0 bottom-0 w-3/4 max-w-xs bg-white dark:bg-gray-900 shadow-xl z-50 transform transition-transform duration-300 ease-in-out overflow-y-auto ${
          mobileMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-label="Mobile navigation menu"
        aria-modal="true"
        aria-hidden={!mobileMenuOpen}
      >
        <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
          <div className="text-xl font-bold text-primary dark:text-primary-400">
            Menu
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={closeMenu}
            aria-label="Close menu"
            className="h-8 w-8"
          >
            <XIcon className="h-5 w-5" />
          </Button>
        </div>

        <nav className="p-4 space-y-1">
          <AnimatePresence>
            {navLinks.map((link) => (
              <motion.a
                key={link.id}
                onClick={() => handleNavClick(link.id)}
                className={`flex items-center gap-3 py-2.5 px-4 rounded-md cursor-pointer relative
                  ${
                    activeSection === link.id
                      ? "bg-primary/10 dark:bg-primary-400/10 text-primary dark:text-primary-400"
                      : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                  }
                `}
                whileHover={{
                  scale: 1.02,
                  x: 2,
                  transition: { duration: 0.2 },
                }}
                animate={{
                  y: isTransitioning && link.id === activeSection ? [-5, 0] : 0,
                  opacity:
                    isTransitioning && link.id === previousSection
                      ? [1, 0.7, 1]
                      : 1,
                  scale: activeSection === link.id ? 1.02 : 1,
                }}
                transition={{ duration: 0.3 }}
                role="button"
                tabIndex={0}
                aria-label={`Navigate to ${link.label} section`}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    handleNavClick(link.id);
                  }
                }}
              >
                <motion.div
                  animate={{
                    rotate:
                      isTransitioning && link.id === activeSection
                        ? [0, -10, 0, 10, 0]
                        : 0,
                    scale: activeSection === link.id ? 1.1 : 1,
                  }}
                  transition={{ duration: 0.5 }}
                >
                  {link.icon}
                </motion.div>
                <span>{link.label}</span>

                {/* Active indicator */}
                {activeSection === link.id && (
                  <motion.div
                    className="absolute left-0 top-0 bottom-0 w-1 bg-primary dark:bg-primary-400 rounded-full"
                    layoutId="mobile-nav-indicator"
                    initial={{ height: 0 }}
                    animate={{ height: "100%" }}
                    exit={{ height: 0 }}
                    transition={{ type: "spring", bounce: 0.25, duration: 0.5 }}
                    style={{
                      boxShadow:
                        theme === "dark"
                          ? "0 0 8px rgba(96, 165, 250, 0.5)"
                          : "0 0 8px rgba(59, 130, 246, 0.3)",
                    }}
                  />
                )}
              </motion.a>
            ))}
          </AnimatePresence>

          {/* Contact button for mobile with animation */}
          <div className="pt-4 mt-4 border-t border-gray-100 dark:border-gray-800">
            <motion.a
              onClick={() => handleNavClick("contact")}
              className="flex items-center gap-3 py-2.5 px-4 text-white bg-primary hover:bg-primary/90 rounded-md cursor-pointer"
              role="button"
              tabIndex={0}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              animate={{
                y: isTransitioning ? [3, -3, 0] : 0,
                background:
                  activeSection === "contact"
                    ? "linear-gradient(to right, #3b82f6, #60a5fa)"
                    : "linear-gradient(to right, #2563eb, #3b82f6)",
              }}
              transition={{
                duration: 0.3,
                background: { duration: 0.5 },
              }}
            >
              <motion.div
                animate={{
                  rotate:
                    isTransitioning && activeSection === "contact"
                      ? [0, -15, 15, 0]
                      : 0,
                }}
                transition={{ duration: 0.5 }}
              >
                <PhoneIcon className="h-4 w-4" />
              </motion.div>
              <span>Contact Me</span>
            </motion.a>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;
