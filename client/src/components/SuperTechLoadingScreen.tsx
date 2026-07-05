import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ResponsiveHighTechLoader, 
  Enhanced3DProfileAnimation,
  HighTechBackground
} from './animations';
import { useTheme } from './ThemeProvider';
import { useDeviceType } from '../utils/responsive';

interface SuperTechLoadingScreenProps {
  onComplete?: () => void;
  duration?: number;
  minDisplayTime?: number;
  text?: string;
  showProgressBar?: boolean;
  logoText?: string;
}

/**
 * A highly advanced responsive loading screen with 3D animations
 * that adapts to different device sizes and themes
 */
export function SuperTechLoadingScreen({
  onComplete,
  duration = 3000,
  minDisplayTime = 1500,
  text = "Initializing...",
  showProgressBar = true,
  logoText
}: SuperTechLoadingScreenProps) {
  // State management
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [startTime] = useState(Date.now());
  
  // Get current theme
  const { theme: siteTheme } = useTheme();
  const [currentTheme, setCurrentTheme] = useState<'light' | 'dark'>('dark');
  
  // Get device type for responsive adjustments
  const deviceType = useDeviceType();
  const isMobile = deviceType === 'mobile';
  
  // Enhanced theme handling with direct connection to ThemeProvider
  useEffect(() => {
    // First, set theme immediately based on current document class
    const root = window.document.documentElement;
    const isDark = root.classList.contains('dark');
    setCurrentTheme(isDark ? 'dark' : 'light');
    
    // Create observer to watch for theme changes on the root element
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          const isDarkMode = root.classList.contains('dark');
          setCurrentTheme(isDarkMode ? 'dark' : 'light');
          
          // Force re-render of animation components when theme changes
          if (progress < 100) {
            // Small animation to highlight the theme change
            const container = document.getElementById('super-loading-container');
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
  
  // Get theme-specific color
  const themeColor = currentTheme === 'dark' ? '#60a5fa' : '#3b82f6';
  const accentColor = currentTheme === 'dark' ? '#818cf8' : '#2563eb';
  
  return (
    <motion.div 
      id="super-loading-container"
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center ${backgroundGradient}`}
      variants={containerVariants}
      initial="hidden"
      animate={isComplete ? "exit" : "visible"}
      exit="exit"
      style={{
        position: 'fixed',
      }}
      key={`loading-theme-${currentTheme}`} // Force re-mount on theme change
    >
      {/* High-tech animated background */}
      <HighTechBackground
        color={themeColor}
        density={isMobile ? 20 : 50}
        speed={0.7}
        theme={currentTheme}
        type={currentTheme === 'dark' ? 'grid' : 'dots'}
      />
      
      <div className={`w-full max-w-7xl px-4 mx-auto z-10 ${isMobile ? 'max-w-xs' : ''}`}>
        <div className="flex flex-col items-center justify-center">
          {/* Main loading animation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="mb-8 relative"
          >
            <div className="relative z-10">
              <ResponsiveHighTechLoader
                theme={currentTheme}
                progress={progress}
                size={isMobile ? 'md' : 'lg'}
                complexity={isMobile ? 'medium' : 'high'}
                color={themeColor}
                accentColor={accentColor}
                pulseEffect={true}
                glowEffect={true}
                showProgressText={false}
                loadingText={text}
              />
            </div>
          </motion.div>
          
          {/* Profile photo section */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="mb-10 text-center"
          >
            <div className="flex justify-center mb-4">
              <Enhanced3DProfileAnimation 
                imagePath="/assets/profile-photo.jpg"
                size={isMobile ? 80 : 120}
                borderColor={themeColor}
                glowEffect={true}
                rotateOnHover={true}
                pulseEffect={true}
                interactive3D={true}
                highTechBorder={true}
                particleEffect={true}
                holographicEffect={currentTheme === 'dark'}
              />
            </div>
            
            {/* Loading text with fading letters effect */}
            <div className="relative h-8 overflow-hidden">
              <motion.div
                className={`text-lg md:text-xl font-medium ${textColor} flex justify-center`}
              >
                {text.split('').map((char, index) => (
                  <motion.span
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: 0.6 + index * 0.05,
                      duration: 0.3,
                      repeat: Infinity,
                      repeatType: "reverse",
                      repeatDelay: 3
                    }}
                    className="inline-block mx-[1px]"
                  >
                    {char === ' ' ? '\u00A0' : char}
                  </motion.span>
                ))}
              </motion.div>
            </div>
          </motion.div>
          
          {/* Progress indicator */}
          {showProgressBar && (
            <motion.div
              initial={{ opacity: 0, width: '90%' }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              className="w-full max-w-md mx-auto"
            >
              <div className="relative pt-1">
                <div className="flex items-center justify-between mb-2">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1, duration: 0.5 }}
                  >
                    <span className={`text-xs font-semibold inline-block uppercase ${textColor}`}>
                      Loading Progress
                    </span>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1, duration: 0.5 }}
                  >
                    <span className={`text-xs font-semibold inline-block ${textColor}`}>
                      {Math.round(progress)}%
                    </span>
                  </motion.div>
                </div>
                
                {/* Fancy progress bar with glowing effect */}
                <div className={`overflow-hidden h-2 mb-4 text-xs flex rounded ${
                  currentTheme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
                }`}>
                  <motion.div
                    initial={{ width: '0%' }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center relative"
                    style={{
                      background: currentTheme === 'dark'
                        ? `linear-gradient(90deg, ${themeColor}, ${accentColor}, ${themeColor})`
                        : `linear-gradient(90deg, ${accentColor}, ${themeColor}, ${accentColor})`,
                      backgroundSize: '200% 100%',
                      animation: 'gradient-shift 2s linear infinite',
                      boxShadow: currentTheme === 'dark'
                        ? `0 0 10px ${themeColor}80`
                        : 'none'
                    }}
                  >
                    {/* Animated pulse effect */}
                    <motion.div
                      className="absolute inset-0 bg-white opacity-30"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: [0, 0.2, 0] }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />
                  </motion.div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
      
      {/* Tech decorative elements - different for each theme */}
      <AnimatePresence>
        {currentTheme === 'dark' && (
          <motion.div
            className="absolute bottom-8 left-0 right-0 flex justify-center pointer-events-none opacity-40 z-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="w-full max-w-4xl px-4">
              <div className="h-[1px] bg-gradient-to-r from-transparent via-blue-500 to-transparent" />
              <div className="flex justify-between text-blue-400 font-mono text-xs mt-2">
                <div>SYSTEM.INITIALIZE()</div>
                <div>STATUS: {progress < 100 ? 'LOADING' : 'COMPLETE'}</div>
              </div>
            </div>
          </motion.div>
        )}
        
        {currentTheme === 'light' && (
          <motion.div
            className="absolute bottom-8 left-0 right-0 flex justify-center pointer-events-none opacity-40 z-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="w-full max-w-4xl px-4">
              <div className="h-[1px] bg-gradient-to-r from-transparent via-blue-600 to-transparent" />
              <div className="flex justify-between text-blue-600 font-medium text-xs mt-2">
                <div>Initializing System</div>
                <div>{progress < 100 ? 'Loading...' : 'Ready'}</div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* CSS animations are defined in index.css */}
    </motion.div>
  );
}

export default SuperTechLoadingScreen;