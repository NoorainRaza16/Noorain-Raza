import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TechLoadingAnimation, 
  AdvancedTechLoading, 
  Enhanced3DProfileAnimation,
  HighTechBackground
} from './animations';
// Import the ProfilePhotoLogo component
import { ProfilePhotoLogo } from './ui/ProfilePhotoLogo';
import { useTheme } from './ThemeProvider';

interface LoadingScreenProps {
  onComplete?: () => void;
  duration?: number;
  minDisplayTime?: number;
  text?: string;
  showProgressBar?: boolean;
  logoText?: string;
}

/**
 * A full-screen loading component with 3D tech animation
 * 
 * @example
 * <LoadingScreen 
 *   onComplete={() => setLoading(false)} 
 *   duration={3000}
 *   minDisplayTime={1500}
 *   text="Initializing Portfolio..."
 *   showProgressBar={true}
 * />
 */
export function LoadingScreen({
  onComplete,
  duration = 3000,
  minDisplayTime = 1500,
  text = "Loading...",
  showProgressBar = true,
  logoText
}: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [startTime] = useState(Date.now());
  
  // Use the site's theme from ThemeProvider
  const { theme: siteTheme } = useTheme();
  const [currentTheme, setCurrentTheme] = useState<'light' | 'dark'>('dark');
  
  // Enhanced theme handling with direct connection to ThemeProvider
  useEffect(() => {
    // First, set theme immediately based on current document class
    const root = window.document.documentElement;
    const isDark = root.classList.contains('dark');
    setCurrentTheme(isDark ? 'dark' : 'light');
    console.log("Loading screen theme updated to:", isDark ? 'dark' : 'light');
    
    // Create observer to watch for theme changes on the root element
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          const isDarkMode = root.classList.contains('dark');
          setCurrentTheme(isDarkMode ? 'dark' : 'light');
          console.log("Toggle theme from", isDarkMode ? 'light' : 'dark', "to", isDarkMode ? 'dark' : 'light');
          
          // Force re-render of animation components when theme changes
          if (progress < 100) {
            // Small animation to highlight the theme change
            const container = document.getElementById('loading-container');
            if (container) {
              container.animate([
                { opacity: 0.85 },
                { opacity: 1 }
              ], { 
                duration: 300, 
                easing: 'ease-out' 
              });
            }
          }
        }
      });
    });
    
    // Start observing
    observer.observe(root, { attributes: true });
    
    // Clean up observer on unmount
    return () => observer.disconnect();
  }, [siteTheme, progress]);
  
  // Simulate loading progress
  useEffect(() => {
    const intervalId = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + (100 - prev) * 0.1;
        return newProgress > 99.5 ? 100 : newProgress;
      });
    }, 100);
    
    return () => clearInterval(intervalId);
  }, []);
  
  // Handle completion after minimum display time
  useEffect(() => {
    if (progress >= 100) {
      const currentTime = Date.now();
      const elapsedTime = currentTime - startTime;
      
      const timeoutId = setTimeout(() => {
        setIsComplete(true);
        if (onComplete) onComplete();
      }, Math.max(0, minDisplayTime - elapsedTime));
      
      return () => clearTimeout(timeoutId);
    }
  }, [progress, minDisplayTime, startTime, onComplete]);
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { duration: 0.5 }
    },
    exit: { 
      opacity: 0,
      transition: { 
        duration: 0.5,
        when: "afterChildren" 
      }
    }
  };
  
  // Background gradient based on theme
  const backgroundGradient = currentTheme === 'dark'
    ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900'
    : 'bg-gradient-to-br from-blue-50 via-white to-blue-50';
  
  // Text color based on theme
  const textColor = currentTheme === 'dark'
    ? 'text-white'
    : 'text-gray-800';
  
  // Enhanced theme-specific styling and effects
  const themeSpecificStyles = {
    // Different motion patterns based on theme
    animationPattern: currentTheme === 'dark'
      ? { rotate: [0, 1, 0, -1, 0], scale: [1, 1.02, 1] }
      : { rotate: [0, 0.5, 0, -0.5, 0], scale: [1, 1.01, 1] },
      
    // Different color schemes for components
    progressColor: currentTheme === 'dark' 
      ? 'bg-blue-500'
      : 'bg-blue-600',
      
    // Text styling based on theme
    textShadow: currentTheme === 'dark'
      ? '0 0 10px rgba(255,255,255,0.3)'
      : 'none',
      
    // Container shadow based on theme  
    containerShadow: currentTheme === 'dark'
      ? 'inset 0 0 100px rgba(0,0,0,0.3)'
      : 'inset 0 0 50px rgba(0,0,0,0.1)'
  };
  
  return (
    <motion.div 
      id="loading-container"
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center ${backgroundGradient}`}
      variants={containerVariants}
      initial="hidden"
      animate={isComplete ? "exit" : "visible"}
      exit="exit"
      style={{ 
        position: 'fixed',
        boxShadow: themeSpecificStyles.containerShadow
      }}
      key={`loading-theme-${currentTheme}`} // Force re-mount on theme change
    >
      {/* High-tech animated background based on theme */}
      {currentTheme === 'dark' ? (
        <HighTechBackground
          color="#60a5fa"
          density={50}
          speed={1}
          theme="dark"
          type="grid"
        />
      ) : (
        <HighTechBackground
          color="#3b82f6"
          density={30}
          speed={0.8}
          theme="light"
          type="dots"
        />
      )}
      
      <div className="flex flex-col items-center max-w-md px-4" style={{ position: 'relative' }}>
        {/* Profile Photo Logo - now with theme-specific animation */}
        <motion.div 
          className="mb-8 relative"
          initial={{ y: -20, opacity: 0 }}
          animate={{ 
            y: 0, 
            opacity: 1,
            ...themeSpecificStyles.animationPattern
          }}
          transition={{ 
            y: { delay: 0.2, duration: 0.5 },
            opacity: { delay: 0.2, duration: 0.5 },
            rotate: { duration: 6, repeat: Infinity, ease: "easeInOut" },
            scale: { duration: 4, repeat: Infinity, ease: "easeInOut" }
          }}
        >
          {/* Add subtle glow effect based on theme */}
          {currentTheme === 'dark' && (
            <div 
              className="absolute -inset-2 rounded-full blur-md opacity-30 z-0"
              style={{ 
                background: 'radial-gradient(circle, #60a5fa 0%, transparent 70%)',
                animation: 'pulse 4s infinite'
              }}
            />
          )}
          
          <div className="relative z-10">
            {/* Using Enhanced 3D Profile Animation with advanced effects */}
            <Enhanced3DProfileAnimation 
              imagePath="/assets/profile-photo.jpg"
              size={100}
              borderColor={currentTheme === 'dark' ? '#60a5fa' : '#3b82f6'}
              glowEffect={true}
              rotateOnHover={true}
              pulseEffect={true}
              interactive3D={true}
              highTechBorder={true}
              particleEffect={true}
              holographicEffect={currentTheme === 'dark'}
              className="animate-float"
            />
          </div>
        </motion.div>
        
        {/* Advanced 3D Tech Loading Animation with theme-specific parameters */}
        {/* Force complete remount when theme changes */}
        {currentTheme === 'dark' ? (
          <AdvancedTechLoading 
            key="dark-animation"
            duration={duration}
            color="#60a5fa"
            size="lg"
            showText={false}
            variation="futuristic"
            complexity="high"
            interactive={true}
            logoText={logoText}
          />
        ) : (
          <AdvancedTechLoading 
            key="light-animation"
            duration={duration}
            color="#3b82f6"
            size="lg"
            showText={false}
            variation="holographic"
            complexity="high"
            interactive={true}
            logoText={logoText}
          />
        )}
        
        {/* Loading Text with theme-specific styling */}
        <motion.div 
          className={`mt-6 text-xl font-medium ${textColor}`}
          initial={{ opacity: 0 }}
          animate={{ 
            opacity: 1,
            y: [0, -3, 0, 3, 0] 
          }}
          transition={{ 
            opacity: { delay: 0.4, duration: 0.5 },
            y: { duration: 4, repeat: Infinity, ease: "easeInOut" }
          }}
          style={{ 
            textShadow: themeSpecificStyles.textShadow
          }}
        >
          {text}
        </motion.div>
        
        {/* Progress Bar with theme-specific styling */}
        {showProgressBar && (
          <motion.div 
            className="w-full mt-4 bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden"
            initial={{ width: "80%", opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <motion.div 
              className={`h-full ${themeSpecificStyles.progressColor}`}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              style={{
                backgroundImage: currentTheme === 'dark'
                  ? 'linear-gradient(to right, #3b82f6, #60a5fa, #3b82f6)'
                  : 'linear-gradient(to right, #2563eb, #3b82f6, #2563eb)',
                backgroundSize: '200% 100%',
                animation: 'gradient-shift 2s linear infinite'
              }}
            />
          </motion.div>
        )}
      </div>
      
      {/* Animation keyframes added via CSS in index.css */}
    </motion.div>
  );
}

export default LoadingScreen;