import { useEffect, useRef, useState } from 'react';
import { motion, useSpring, useMotionValue } from 'framer-motion';
import { ProfileImageAnimation } from '../animations/ProfileImageAnimation';

interface ProfilePhotoLogoProps {
  size?: 'small' | 'medium' | 'large';
  className?: string;
  rotateOnHover?: boolean;
  glowEffect?: boolean;
  pulseEffect?: boolean;
  glowColor?: string;
  imagePath?: string;
}

export function ProfilePhotoLogo({
  size = 'medium',
  className = '',
  rotateOnHover = false,
  glowEffect = false,
  pulseEffect = false,
  glowColor = '#3b82f6',
  imagePath = '/assets/profile-photo.jpg',
}: ProfilePhotoLogoProps) {
  // References and state
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);

  // Configure spring physics for smoother animation
  const springConfig = { damping: 15, stiffness: 150 };
  const springRotateX = useSpring(rotateX, springConfig);
  const springRotateY = useSpring(rotateY, springConfig);

  // Determine size in pixels
  const sizeInPixels = size === 'small' ? 32 : size === 'medium' ? 48 : 64;

  // Determine border width based on size
  const borderWidth = size === 'small' ? 2 : size === 'medium' ? 3 : 4;

  // Calculate glow intensity based on size
  const glowSize = size === 'small' ? '0 0 10px' : size === 'medium' ? '0 0 15px' : '0 0 20px';

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
      const maxRotation = 10;
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
      className={`relative ${className}`}
      style={{ 
        width: sizeInPixels, 
        height: sizeInPixels,
        perspective: 800,
        transformStyle: 'preserve-3d',
      }}
    >
      <motion.div
        style={{
          width: '100%',
          height: '100%',
          rotateX: rotateOnHover ? springRotateX : 0,
          rotateY: rotateOnHover ? springRotateY : 0,
          transformStyle: 'preserve-3d',
        }}
        className={`
          relative overflow-hidden rounded-full 
          ${pulseEffect ? 'animate-pulse' : ''}
        `}
      >
        {/* Use the ProfileImageAnimation component for the logo */}
        <ProfileImageAnimation
          imagePath={imagePath}
          size={sizeInPixels}
          glowEffect={glowEffect}
          borderColor={glowColor}
          rotateOnHover={false} // We're handling rotation at this level
          pulseEffect={false} // We're handling pulse at this level
          className={`rounded-full ${glowEffect ? '' : ''}`}
        />
      </motion.div>
    </motion.div>
  );
}