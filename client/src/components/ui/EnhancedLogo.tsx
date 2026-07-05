import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import * as THREE from 'three';

interface EnhancedLogoProps {
  text?: string;
  size?: number;
  primaryColor?: string;
  secondaryColor?: string;
  className?: string;
  onClick?: () => void;
  animated?: boolean;
  variant?: 'default' | '3d' | 'gradient' | 'outlined';
}

/**
 * An enhanced logo component with 3D and animation effects
 * 
 * @example
 * <EnhancedLogo 
 *   text="NR" 
 *   size={64} 
 *   primaryColor="#3b82f6" 
 *   secondaryColor="#60a5fa" 
 *   animated={true} 
 *   variant="3d" 
 * />
 */
export function EnhancedLogo({
  text = "NR",
  size = 64,
  primaryColor = "#3b82f6",
  secondaryColor = "#60a5fa",
  className = "",
  onClick,
  animated = true,
  variant = 'default'
}: EnhancedLogoProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const textMeshRef = useRef<THREE.Mesh | null>(null);
  const frameIdRef = useRef<number | null>(null);
  
  // Gradient animation variants
  const gradientVariants = {
    initial: {
      backgroundPosition: '0% 50%',
    },
    animate: {
      backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
      transition: {
        duration: 15,
        ease: "easeInOut",
        repeat: Infinity,
      }
    }
  };
  
  // Shadow and glow effect for the logo
  const glowVariants = {
    initial: {
      boxShadow: `0 0 0 rgba(${parseInt(primaryColor.slice(1, 3), 16)}, ${parseInt(primaryColor.slice(3, 5), 16)}, ${parseInt(primaryColor.slice(5, 7), 16)}, 0.7)`
    },
    animate: {
      boxShadow: [
        `0 0 5px rgba(${parseInt(primaryColor.slice(1, 3), 16)}, ${parseInt(primaryColor.slice(3, 5), 16)}, ${parseInt(primaryColor.slice(5, 7), 16)}, 0.7)`,
        `0 0 20px rgba(${parseInt(primaryColor.slice(1, 3), 16)}, ${parseInt(primaryColor.slice(3, 5), 16)}, ${parseInt(primaryColor.slice(5, 7), 16)}, 0.5)`,
        `0 0 5px rgba(${parseInt(primaryColor.slice(1, 3), 16)}, ${parseInt(primaryColor.slice(3, 5), 16)}, ${parseInt(primaryColor.slice(5, 7), 16)}, 0.7)`
      ],
      transition: {
        duration: 2,
        ease: "easeInOut",
        repeat: Infinity,
      }
    }
  };
  
  // Initialize 3D scene if the variant is 3d
  useEffect(() => {
    if (variant !== '3d' || !containerRef.current) return;
    
    let cancelAnimation = false;
    
    const init3D = async () => {
      if (cancelAnimation || !containerRef.current) return;
      
      // Create scene
      const scene = new THREE.Scene();
      sceneRef.current = scene;
      
      // Create camera
      const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
      camera.position.z = 5;
      cameraRef.current = camera;
      
      // Create renderer
      const renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        canvas: canvasRef.current as HTMLCanvasElement
      });
      renderer.setSize(size, size);
      renderer.setClearColor(0x000000, 0);
      rendererRef.current = renderer;
      
      // Add lighting
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
      scene.add(ambientLight);
      
      const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
      directionalLight.position.set(5, 5, 5);
      scene.add(directionalLight);
      
      // Add point lights for better 3D effect
      const pointLight1 = new THREE.PointLight(primaryColor.replace('#', '0x'), 1, 10);
      pointLight1.position.set(2, 2, 2);
      scene.add(pointLight1);
      
      const pointLight2 = new THREE.PointLight(secondaryColor.replace('#', '0x'), 1, 10);
      pointLight2.position.set(-2, -2, 2);
      scene.add(pointLight2);
      
      // Create 3D text
      try {
        // Use a geometry to create the text for now
        const textGeometry = new THREE.BoxGeometry(2, 2, 0.5);
        const material = new THREE.MeshStandardMaterial({
          color: primaryColor.replace('#', '0x'),
          metalness: 0.8,
          roughness: 0.2,
        });
        
        const textMesh = new THREE.Mesh(textGeometry, material);
        scene.add(textMesh);
        textMeshRef.current = textMesh;
        
        // Start animation
        animate();
      } catch (error) {
        console.error('Error loading 3D text:', error);
      }
    };
    
    const animate = () => {
      if (cancelAnimation || !sceneRef.current || !cameraRef.current || !rendererRef.current || !textMeshRef.current) return;
      
      // Rotate text mesh
      if (textMeshRef.current) {
        textMeshRef.current.rotation.y += 0.01;
        textMeshRef.current.rotation.x += 0.005;
      }
      
      // Render scene
      rendererRef.current.render(sceneRef.current, cameraRef.current);
      
      // Continue animation
      frameIdRef.current = requestAnimationFrame(animate);
    };
    
    init3D();
    
    return () => {
      cancelAnimation = true;
      if (frameIdRef.current) {
        cancelAnimationFrame(frameIdRef.current);
      }
      
      // Clean up Three.js resources
      if (textMeshRef.current) {
        if (textMeshRef.current.geometry) textMeshRef.current.geometry.dispose();
        if (textMeshRef.current.material) {
          if (Array.isArray(textMeshRef.current.material)) {
            textMeshRef.current.material.forEach(m => m.dispose());
          } else {
            textMeshRef.current.material.dispose();
          }
        }
      }
      
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
    };
  }, [variant, primaryColor, secondaryColor, size]);
  
  // Render different variants
  const renderLogoContent = () => {
    if (variant === '3d') {
      return (
        <div className="relative">
          <canvas 
            ref={canvasRef} 
            width={size} 
            height={size} 
            className="w-full h-full"
          />
          <div className="absolute inset-0 flex items-center justify-center text-white font-bold" style={{ fontSize: size / 2 }}>
            {text}
          </div>
        </div>
      );
    }
    
    if (variant === 'gradient') {
      return (
        <motion.div 
          className="flex items-center justify-center w-full h-full text-white font-bold"
          style={{ 
            fontSize: size / 2,
            background: `linear-gradient(120deg, ${primaryColor}, ${secondaryColor}, ${primaryColor})`,
            backgroundSize: '200% 200%',
          }}
          variants={gradientVariants}
          initial="initial"
          animate={animated ? "animate" : "initial"}
        >
          {text}
        </motion.div>
      );
    }
    
    if (variant === 'outlined') {
      return (
        <div 
          className="flex items-center justify-center w-full h-full font-bold"
          style={{ 
            fontSize: size / 2,
            color: 'transparent',
            WebkitTextStroke: `2px ${primaryColor}`,
            textShadow: `0 0 10px ${secondaryColor}80`,
          }}
        >
          {text}
        </div>
      );
    }
    
    // Default variant
    return (
      <div 
        className="flex items-center justify-center w-full h-full text-white font-bold"
        style={{ fontSize: size / 2 }}
      >
        {text}
      </div>
    );
  };
  
  return (
    <motion.div
      ref={containerRef}
      className={`relative rounded-md overflow-hidden cursor-pointer ${className}`}
      style={{
        width: size,
        height: size,
        background: variant !== 'gradient' ? `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` : 'transparent',
      }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      variants={glowVariants}
      initial="initial"
      animate={animated ? "animate" : "initial"}
    >
      {renderLogoContent()}
    </motion.div>
  );
}

export default EnhancedLogo;