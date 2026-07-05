import { useEffect, useRef, useState } from 'react';
import { motion, useSpring, useMotionValue } from 'framer-motion';

interface ProfileImageAnimationProps {
  imagePath: string | { src: string; };
  size?: number;
  borderColor?: string;
  className?: string;
  glowEffect?: boolean;
  rotateOnHover?: boolean;
  pulseEffect?: boolean;
}

/**
 * A component that displays a profile image with 3D and animation effects
 * 
 * @example
 * <ProfileImageAnimation 
 *   imagePath="/assets/profile-photo.jpg" 
 *   size={250}
 *   borderColor="#3b82f6"
 *   glowEffect={true}
 *   rotateOnHover={true}
 * />
 */
export function ProfileImageAnimation({
  imagePath,
  size = 250,
  borderColor = "#3b82f6",
  className = "",
  glowEffect = false,
  rotateOnHover = true,
  pulseEffect = false,
}: ProfileImageAnimationProps) {
  // References and state
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  
  // Configure spring physics for smoother animation
  const springConfig = { damping: 15, stiffness: 150 };
  const springRotateX = useSpring(rotateX, springConfig);
  const springRotateY = useSpring(rotateY, springConfig);

  // Determine the image path with fallback
  const primaryPath = typeof imagePath === 'string' ? imagePath : imagePath.src;
  const imgSrc = primaryPath === '/assets/profile-photo.jpg' ? 
    (primaryPath || '/profile/profile-photo.jpg') : primaryPath;
  
  // Handle 3D hover effect
  useEffect(() => {
    if (!rotateOnHover || !containerRef.current) return;
    
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      // Calculate rotation based on mouse position relative to center
      // Limit rotation to a reasonable range (-15 to 15 degrees)
      const maxRotation = 15;
      const rotationX = ((e.clientY - centerY) / (rect.height / 2)) * maxRotation;
      const rotationY = ((centerX - e.clientX) / (rect.width / 2)) * maxRotation;
      
      rotateX.set(rotationX);
      rotateY.set(rotationY);
    };
    
    const handleMouseLeave = () => {
      rotateX.set(0);
      rotateY.set(0);
      setIsHovering(false);
    };
    
    const handleMouseEnter = () => {
      setIsHovering(true);
    };
    
    const element = containerRef.current;
    element.addEventListener('mousemove', handleMouseMove);
    element.addEventListener('mouseleave', handleMouseLeave);
    element.addEventListener('mouseenter', handleMouseEnter);
    
    return () => {
      if (element) {
        element.removeEventListener('mousemove', handleMouseMove);
        element.removeEventListener('mouseleave', handleMouseLeave);
        element.removeEventListener('mouseenter', handleMouseEnter);
      }
    };
  }, [rotateOnHover, rotateX, rotateY]);

  return (
    <motion.div 
      ref={containerRef}
      className={`relative ${className} ${pulseEffect ? 'animate-pulse' : ''}`}
      style={{ 
        width: size, 
        height: size,
        perspective: 800
      }}
    >
      <motion.div
        style={{
          width: '100%',
          height: '100%',
          rotateX: rotateOnHover ? springRotateX : 0,
          rotateY: rotateOnHover ? springRotateY : 0,
        }}
        className="w-full h-full relative"
      >
        {/* Background decorative elements for 3D effect */}
        <div 
          className={`absolute inset-0 rounded-full border-2 ${glowEffect ? 'shadow-lg' : ''}`}
          style={{ 
            borderColor: borderColor,
            boxShadow: glowEffect ? `0 0 20px ${borderColor}` : 'none',
            transform: 'translateZ(-10px)',
            zIndex: -1
          }}
        />
        
        {/* Profile image */}
        <motion.img
          src={imgSrc}
          alt="Profile"
          className="w-full h-full object-cover rounded-full border-2"
          style={{ borderColor }}
          whileHover={{ scale: 1.05 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        />
        
        {/* Subtle shine overlay effect */}
        <div 
          className={`absolute inset-0 rounded-full ${isHovering ? 'opacity-20' : 'opacity-0'} 
          bg-gradient-to-tr from-transparent via-white to-transparent transition-opacity duration-300`}
        />
      </motion.div>
    </motion.div>
  );
}

// Export the component as default export
export default ProfileImageAnimation;