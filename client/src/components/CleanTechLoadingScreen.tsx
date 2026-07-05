import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';
import { useTheme } from './ThemeProvider';
// Using direct img tag instead of ProfilePhoto component

interface CleanTechLoadingScreenProps {
  onComplete?: () => void;
  duration?: number;
  minDisplayTime?: number;
  text?: string;
  showProgressBar?: boolean;
  logoText?: string;
}

/**
 * A clean, professional high-tech loading screen with optimized theme display
 */
export function CleanTechLoadingScreen({
  onComplete,
  duration = 3000,
  minDisplayTime = 1500,
  text = "Initializing Portfolio...",
  showProgressBar = true,
  logoText
}: CleanTechLoadingScreenProps) {
  // State management
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [startTime] = useState(Date.now());
  
  // Get current theme
  const { theme } = useTheme();
  const [currentTheme, setCurrentTheme] = useState<'light' | 'dark'>(
    typeof window !== 'undefined' && 
    window.document.documentElement.classList.contains('dark') 
      ? 'dark' 
      : 'light'
  );
  
  // Animation container references
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const particlesRef = useRef<THREE.Points | null>(null);
  
  // Enhanced theme handling
  useEffect(() => {
    const root = window.document.documentElement;
    const isDark = root.classList.contains('dark');
    setCurrentTheme(isDark ? 'dark' : 'light');
    
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          const isDarkMode = root.classList.contains('dark');
          setCurrentTheme(isDarkMode ? 'dark' : 'light');
        }
      });
    });
    
    observer.observe(root, { attributes: true });
    return () => observer.disconnect();
  }, [theme]);
  
  // Simulate loading progress
  useEffect(() => {
    const intervalId = setInterval(() => {
      setProgress(prev => {
        // Smooth acceleration curve for progress
        const increment = (100 - prev) * 0.1;
        const newProgress = prev + increment;
        return newProgress > 99.5 ? 100 : newProgress;
      });
    }, 100);
    
    return () => clearInterval(intervalId);
  }, []);
  
  // Handle completion
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
  
  // Initialize and animate the 3D background
  useEffect(() => {
    if (!canvasRef.current) return;
    
    // Get the correct colors based on theme
    const backgroundColor = currentTheme === 'dark' 
      ? new THREE.Color(0x111827) 
      : new THREE.Color(0xf8fafc);
    
    const particleColor = currentTheme === 'dark'
      ? new THREE.Color(0x60a5fa) 
      : new THREE.Color(0x3b82f6);
    
    // Setup scene
    const scene = new THREE.Scene();
    scene.background = backgroundColor;
    sceneRef.current = scene;
    
    // Setup camera
    const camera = new THREE.PerspectiveCamera(
      75, 
      window.innerWidth / window.innerHeight, 
      0.1, 
      1000
    );
    camera.position.z = 15;
    cameraRef.current = camera;
    
    // Setup renderer with transparency
    const renderer = new THREE.WebGLRenderer({ 
      canvas: canvasRef.current,
      antialias: true,
      alpha: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    rendererRef.current = renderer;
    
    // Create particles system - optimized and simple
    const particleCount = window.innerWidth < 768 ? 100 : 200;
    const particlesGeometry = new THREE.BufferGeometry();
    
    // Generate random positions within a sphere
    const positions = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    
    for (let i = 0; i < particleCount; i++) {
      // Position within a sphere
      const angle = Math.random() * Math.PI * 2;
      const radius = 5 + Math.random() * 5;
      const y = (Math.random() - 0.5) * 10;
      
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = Math.sin(angle) * radius;
      
      // Random size for each particle
      sizes[i] = Math.random() * 0.5 + 0.1;
    }
    
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particlesGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    
    // Create material - simplified to avoid shader errors
    const particlesMaterial = new THREE.PointsMaterial({
      color: particleColor,
      size: 0.5,
      transparent: true,
      opacity: 0.7,
      sizeAttenuation: true
    });
    
    const particles = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particles);
    particlesRef.current = particles;
    
    // Add subdued grid for visual depth
    if (currentTheme === 'dark') {
      const gridHelper = new THREE.GridHelper(30, 30, 0x444444, 0x222222);
      gridHelper.position.y = -8;
      scene.add(gridHelper);
    }
    
    // Handle window resize
    const handleResize = () => {
      if (!cameraRef.current || !rendererRef.current) return;
      
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      cameraRef.current.aspect = width / height;
      cameraRef.current.updateProjectionMatrix();
      
      rendererRef.current.setSize(width, height);
    };
    
    window.addEventListener('resize', handleResize);
    
    // Animation loop
    const animate = () => {
      if (!sceneRef.current || !cameraRef.current || !rendererRef.current) return;
      
      // Gentle rotation of the particle system
      if (particlesRef.current) {
        particlesRef.current.rotation.y += 0.001;
        particlesRef.current.rotation.x += 0.0005;
      }
      
      // Render the scene
      rendererRef.current.render(sceneRef.current, cameraRef.current);
      
      // Continue the animation loop
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    
    animate();
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      
      // Dispose of resources
      if (particlesGeometry) particlesGeometry.dispose();
      if (particlesMaterial) particlesMaterial.dispose();
      if (rendererRef.current) rendererRef.current.dispose();
    };
  }, [currentTheme]);
  
  // Theme-specific styles
  const textColor = currentTheme === 'dark' ? 'text-white' : 'text-gray-900';
  const primaryColor = currentTheme === 'dark' ? '#60a5fa' : '#3b82f6';
  const accentColor = currentTheme === 'dark' ? '#93c5fd' : '#2563eb';
  const progressBgColor = currentTheme === 'dark' ? 'bg-gray-800' : 'bg-gray-200';
  
  return (
    <motion.div
      ref={containerRef}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden"
      style={{
        position: 'fixed',
        background: currentTheme === 'dark' 
          ? 'linear-gradient(to bottom right, #0f172a, #1e293b)' 
          : 'linear-gradient(to bottom right, #f8fafc, #e2e8f0)'
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* 3D Background */}
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 z-0"
        style={{ position: 'absolute' }}
      />
      
      {/* Content Container */}
      <div className="relative z-10 flex flex-col items-center justify-center px-4 py-8">
        {/* Profile Photo with Animation */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <div className="relative">
            <div className={`w-28 h-28 md:w-32 md:h-32 border-4 rounded-full overflow-hidden ${
              currentTheme === 'dark' ? 'border-blue-500' : 'border-blue-600'
            }`}>
              <img
                src="/assets/profile-photo.jpg"
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Animated glow ring */}
            <div 
              className="absolute inset-0 rounded-full pulse-glow"
              style={{
                boxShadow: `0 0 20px ${primaryColor}40, 0 0 40px ${primaryColor}20`
              }}
            />
          </div>
        </motion.div>
        
        {/* Loading Text */}
        <motion.div
          className={`text-xl md:text-2xl font-medium mb-6 ${textColor}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          {text}
        </motion.div>
        
        {/* Progress Bar */}
        {showProgressBar && (
          <motion.div
            className="w-full max-w-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <div className="flex justify-between items-center mb-2">
              <span className={`text-sm ${textColor} opacity-80`}>Loading...</span>
              <span className={`text-sm font-medium ${textColor}`}>{Math.round(progress)}%</span>
            </div>
            
            <div className={`h-2 w-full rounded-full overflow-hidden ${progressBgColor}`}>
              <motion.div
                className="h-full"
                style={{
                  background: `linear-gradient(90deg, ${primaryColor}, ${accentColor})`,
                  backgroundSize: '200% 100%',
                  animation: 'gradient-shift 2s linear infinite',
                  boxShadow: currentTheme === 'dark' ? `0 0 8px ${primaryColor}50` : 'none'
                }}
                initial={{ width: '0%' }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </motion.div>
        )}
        
        {/* Tech Lines Decoration */}
        <div className="absolute bottom-10 left-0 right-0 flex justify-center pointer-events-none">
          <div className="w-full max-w-4xl px-6">
            <div 
              className="h-px w-full"
              style={{ 
                background: `linear-gradient(to right, transparent, ${primaryColor}, transparent)`,
                opacity: 0.5
              }}
            />
            <div className="flex justify-between mt-2">
              <div 
                className="text-xs font-mono"
                style={{ color: primaryColor, opacity: 0.8 }}
              >
                {currentTheme === 'dark' ? 'SYSTEM.INITIALIZE()' : 'System Initializing'}
              </div>
              <div
                className="text-xs font-mono"
                style={{ color: primaryColor, opacity: 0.8 }}
              >
                {progress < 100 
                  ? (currentTheme === 'dark' ? 'STATUS: LOADING' : 'Status: Loading') 
                  : (currentTheme === 'dark' ? 'STATUS: COMPLETE' : 'Status: Complete')}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default CleanTechLoadingScreen;