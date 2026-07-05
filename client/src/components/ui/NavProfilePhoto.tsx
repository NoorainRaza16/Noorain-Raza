import React, { useState, useRef, useEffect } from "react";
import { motion, useSpring, useMotionValue, useTransform } from "framer-motion";

interface NavProfilePhotoProps {
  size?: number;
  className?: string;
  onClick?: () => void;
  src?: string;
}

/**
 * A profile photo component with 3D animation and glowing border effect for the navigation bar
 */
export function NavProfilePhoto({
  size = 40,
  className = "",
  onClick,
  src,
}: NavProfilePhotoProps) {
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Values for 3D rotation
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Transform mouse position to rotation angle - more subtle effect for small images
  const rotateX = useTransform(mouseY, [-size, size], [10, -10]);
  const rotateY = useTransform(mouseX, [-size, size], [-10, 10]);

  // Add spring physics for smoother animation - higher damping for more controlled movement
  const springConfig = { damping: 25, stiffness: 300 };
  const springRotateX = useSpring(rotateX, springConfig);
  const springRotateY = useSpring(rotateY, springConfig);

  // Subtle glow without a visible border
  const glowVariants = {
    initial: {
      boxShadow: "0 0 5px rgba(var(--primary-rgb), 0.2)",
    },
    animate: {
      boxShadow: [
        "0 0 5px rgba(var(--primary-rgb), 0.2)",
        "0 0 8px rgba(var(--primary-rgb), 0.4)",
        "0 0 5px rgba(var(--primary-rgb), 0.2)",
      ],
      transition: {
        duration: 2.5,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  // Handle mouse movement over the component
  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // Calculate the distance from center
    mouseX.set(event.clientX - centerX);
    mouseY.set(event.clientY - centerY);
  };

  // Reset position when mouse leaves
  const handleMouseLeave = () => {
    setIsHovered(false);
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <motion.div
      ref={containerRef}
      className={`rounded-full overflow-hidden cursor-pointer ${className}`}
      style={{
        width: size,
        height: size,
        position: "relative",
        perspective: size * 4,
        transformStyle: "preserve-3d",
      }}
      variants={glowVariants}
      initial="initial"
      animate="animate"
      whileHover={{
        scale: 1.08,
        boxShadow: "0 0 10px rgba(var(--primary-rgb), 0.5)",
      }}
      whileTap={{
        scale: 0.95,
        boxShadow: "0 0 5px rgba(var(--primary-rgb), 0.3)",
        rotateX: 0,
        rotateY: 0,
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
    >
      {/* 3D transformed image container */}
      <motion.div
        className="absolute inset-0 rounded-full overflow-hidden z-10"
        style={{
          transformStyle: "preserve-3d",
          rotateX: springRotateX,
          rotateY: springRotateY,
          // Add a subtle 3D depth effect
          transform: isHovered ? "translateZ(2px)" : "translateZ(0px)",
        }}
      >
        <img
          src={src || "/assets/profile-photo.jpg"}
          alt="Noorain Raza"
          className="w-full h-full object-cover"
          width={size}
          height={size}
        />
      </motion.div>

      {/* Shine effect overlay */}
      <motion.div
        className="absolute inset-0 z-20 rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0) 60%)",
          opacity: isHovered ? 1 : 0,
        }}
        animate={{
          opacity: isHovered ? [0.2, 0.7, 0.2] : 0,
          scale: isHovered ? [0.9, 1.05, 0.9] : 1,
          // Move highlight position to create a dynamic lighting effect
          backgroundPosition: isHovered
            ? ["30% 30%", "70% 70%", "30% 30%"]
            : "50% 50%",
        }}
        transition={{
          duration: 2.5,
          repeat: isHovered ? Infinity : 0,
          ease: "easeInOut",
        }}
      />

      {/* Additional subtle glow for more depth */}
      {isHovered && (
        <motion.div
          className="absolute inset-0 z-15 rounded-full pointer-events-none"
          style={{
            boxShadow: "inset 0 0 10px rgba(255,255,255,0.1)",
            background:
              "radial-gradient(circle at center, transparent 50%, rgba(0,0,0,0.1) 100%)",
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.7 }}
          exit={{ opacity: 0 }}
        />
      )}
    </motion.div>
  );
}

export default NavProfilePhoto;
