import React, { useEffect, useRef, useState } from 'react';
import { motion, useSpring, useMotionValue, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';

interface Enhanced3DProfileAnimationProps {
  imagePath: string | { src: string; };
  size?: number;
  borderColor?: string;
  className?: string;
  glowEffect?: boolean;
  rotateOnHover?: boolean;
  pulseEffect?: boolean;
  interactive3D?: boolean;
  highTechBorder?: boolean;
  particleEffect?: boolean;
  holographicEffect?: boolean;
  style?: React.CSSProperties;
}

/**
 * A component that displays a profile image with advanced 3D and high-tech animation effects
 * 
 * @example
 * <Enhanced3DProfileAnimation 
 *   imagePath="/assets/profile-photo.jpg" 
 *   size={250}
 *   borderColor="#3b82f6"
 *   glowEffect={true}
 *   rotateOnHover={true}
 *   interactive3D={true}
 *   highTechBorder={true}
 *   particleEffect={true}
 * />
 */
export function Enhanced3DProfileAnimation({
  imagePath,
  size = 250,
  borderColor = "#3b82f6",
  className = "",
  glowEffect = false,
  rotateOnHover = true,
  pulseEffect = false,
  interactive3D = false,
  highTechBorder = false,
  particleEffect = false,
  holographicEffect = false,
  style = {}
}: Enhanced3DProfileAnimationProps) {
  // References and state
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const frameIdRef = useRef<number | null>(null);
  const objectsRef = useRef<THREE.Object3D[]>([]);
  
  const [isHovering, setIsHovering] = useState(false);
  const [is3DInitialized, setIs3DInitialized] = useState(false);
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  
  // Configure spring physics for smoother animation
  const springConfig = { damping: 15, stiffness: 150 };
  const springRotateX = useSpring(rotateX, springConfig);
  const springRotateY = useSpring(rotateY, springConfig);

  // Determine the image path
  const imgSrc = typeof imagePath === 'string' ? imagePath : imagePath.src;

  // Main 3D scene setup for border and particle effects
  useEffect(() => {
    if (!interactive3D || !canvasRef.current || !containerRef.current) return;
    
    // Initialize Three.js scene
    const initialize = () => {
      const scene = new THREE.Scene();
      sceneRef.current = scene;
      
      // Camera setup
      const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
      camera.position.z = 5;
      cameraRef.current = camera;
      
      // Renderer setup
      const renderer = new THREE.WebGLRenderer({
        canvas: canvasRef.current as HTMLCanvasElement,
        alpha: true,
        antialias: true
      });
      renderer.setSize(size, size);
      renderer.setClearColor(0x000000, 0);
      rendererRef.current = renderer;
      
      // Lighting
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
      scene.add(ambientLight);
      
      const mainLight = new THREE.DirectionalLight(0xffffff, 0.8);
      mainLight.position.set(5, 5, 5);
      scene.add(mainLight);
      
      // Create high-tech border elements
      if (highTechBorder) {
        createHighTechBorder(scene);
      }
      
      // Create particle effects
      if (particleEffect) {
        createParticleEffects(scene);
      }
      
      // Create holographic effect
      if (holographicEffect) {
        createHolographicEffect(scene);
      }
      
      // Start animation
      setIs3DInitialized(true);
      animate();
    };
    
    // Create high-tech border with moving elements
    const createHighTechBorder = (scene: THREE.Scene) => {
      const hexColor = new THREE.Color(borderColor);
      
      // Create outer ring as a set of segments
      const segmentCount = 12;
      const radius = 2;
      const thickness = 0.05;
      
      for (let i = 0; i < segmentCount; i++) {
        const angle = (i / segmentCount) * Math.PI * 2;
        const angleNext = ((i + 1) / segmentCount) * Math.PI * 2;
        
        // Curve geometry for each segment
        const curve = new THREE.QuadraticBezierCurve3(
          new THREE.Vector3(Math.cos(angle) * radius, Math.sin(angle) * radius, 0),
          new THREE.Vector3(
            Math.cos(angle + (angleNext - angle) / 2) * (radius * 1.1),
            Math.sin(angle + (angleNext - angle) / 2) * (radius * 1.1),
            0
          ),
          new THREE.Vector3(Math.cos(angleNext) * radius, Math.sin(angleNext) * radius, 0)
        );
        
        const points = curve.getPoints(10);
        const tubeGeometry = new THREE.TubeGeometry(
          new THREE.CatmullRomCurve3(points),
          10,
          thickness,
          8,
          false
        );
        
        // Create materials based on index for variation
        const material = new THREE.MeshStandardMaterial({
          color: hexColor.clone().offsetHSL(i * 0.05, 0, 0),
          metalness: 0.8,
          roughness: 0.2,
          emissive: hexColor.clone().offsetHSL(i * 0.05, 0, 0),
          emissiveIntensity: 0.3
        });
        
        const tube = new THREE.Mesh(tubeGeometry, material);
        
        // Store animation parameters
        (tube as any).userData = {
          initialScale: 1,
          pulseSpeed: 0.5 + (i * 0.1),
          rotationSpeed: 0.001 * (i % 2 === 0 ? 1 : -1),
          segmentIndex: i
        };
        
        scene.add(tube);
        objectsRef.current.push(tube);
      }
      
      // Add connector nodes at intersections
      for (let i = 0; i < segmentCount; i++) {
        const angle = (i / segmentCount) * Math.PI * 2;
        
        const sphereGeometry = new THREE.SphereGeometry(thickness * 2, 16, 16);
        const sphereMaterial = new THREE.MeshStandardMaterial({
          color: hexColor,
          metalness: 0.9,
          roughness: 0.1,
          emissive: hexColor,
          emissiveIntensity: 0.5
        });
        
        const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
        sphere.position.set(
          Math.cos(angle) * radius,
          Math.sin(angle) * radius,
          0
        );
        
        // Store animation parameters
        (sphere as any).userData = {
          initialScale: 1,
          pulseSpeed: 1 + (i * 0.2),
          nodeIndex: i
        };
        
        scene.add(sphere);
        objectsRef.current.push(sphere);
      }
      
      // Add decorative rotating elements
      const decorationCount = 3;
      for (let i = 0; i < decorationCount; i++) {
        const angle = (i / decorationCount) * Math.PI * 2;
        const decorationRadius = radius * 1.2;
        
        // Create small decorative element
        const geometry = new THREE.TorusGeometry(0.2, 0.03, 16, 32);
        const material = new THREE.MeshStandardMaterial({
          color: hexColor.clone().offsetHSL(0.1 * i, 0, 0.2),
          metalness: 0.9,
          roughness: 0.1,
          emissive: hexColor.clone().offsetHSL(0.1 * i, 0, 0.2),
          emissiveIntensity: 0.5
        });
        
        const decoration = new THREE.Mesh(geometry, material);
        decoration.position.set(
          Math.cos(angle) * decorationRadius,
          Math.sin(angle) * decorationRadius,
          0.1
        );
        
        // Set random rotation
        decoration.rotation.set(
          Math.random() * Math.PI,
          Math.random() * Math.PI,
          Math.random() * Math.PI
        );
        
        // Store animation parameters
        (decoration as any).userData = {
          orbitSpeed: 0.0005 + (i * 0.0002),
          orbitRadius: decorationRadius,
          orbitInitialAngle: angle,
          rotationSpeed: {
            x: 0.02 - (i * 0.005),
            y: 0.03 + (i * 0.005),
            z: 0.01 + (i * 0.005)
          }
        };
        
        scene.add(decoration);
        objectsRef.current.push(decoration);
      }
    };
    
    // Create particle effects around the profile image
    const createParticleEffects = (scene: THREE.Scene) => {
      const hexColor = new THREE.Color(borderColor);
      const particleCount = 40;
      const particleGeometry = new THREE.SphereGeometry(0.03, 8, 8);
      
      for (let i = 0; i < particleCount; i++) {
        // Create variation in particle colors
        const particleColor = hexColor.clone().offsetHSL(
          (Math.random() - 0.5) * 0.2,
          0,
          (Math.random() - 0.5) * 0.3
        );
        
        const particleMaterial = new THREE.MeshBasicMaterial({
          color: particleColor,
          transparent: true,
          opacity: 0.6 + Math.random() * 0.4
        });
        
        const particle = new THREE.Mesh(particleGeometry, particleMaterial);
        
        // Distribute particles in a sphere around the profile
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI;
        const radius = 1.8 + Math.random() * 0.7;
        
        particle.position.set(
          radius * Math.sin(phi) * Math.cos(theta),
          radius * Math.sin(phi) * Math.sin(theta),
          radius * Math.cos(phi)
        );
        
        // Scale particles randomly for variation
        const scale = 0.5 + Math.random() * 1;
        particle.scale.set(scale, scale, scale);
        
        // Store animation parameters
        (particle as any).userData = {
          initialPosition: particle.position.clone(),
          orbitSpeed: 0.001 + Math.random() * 0.002,
          orbitAmplitude: 0.1 + Math.random() * 0.2,
          pulseSpeed: 0.5 + Math.random() * 2,
          initialScale: scale
        };
        
        scene.add(particle);
        objectsRef.current.push(particle);
      }
      
      // Add glowing energy trails
      const trailCount = 8;
      for (let i = 0; i < trailCount; i++) {
        const angle = (i / trailCount) * Math.PI * 2;
        const radius = 2.0;
        
        // Create curve for energy trail
        const curve = new THREE.CurvePath<THREE.Vector3>();
        const points = [];
        const segments = 8;
        
        for (let j = 0; j <= segments; j++) {
          const segmentAngle = angle + (j / segments) * (Math.PI * 2 / trailCount);
          const segmentRadius = radius * (1 + Math.sin(j / segments * Math.PI) * 0.15);
          
          points.push(new THREE.Vector3(
            segmentRadius * Math.cos(segmentAngle),
            segmentRadius * Math.sin(segmentAngle),
            (Math.random() - 0.5) * 0.1
          ));
        }
        
        const spline = new THREE.CatmullRomCurve3(points);
        
        const tubeGeometry = new THREE.TubeGeometry(spline, 20, 0.02, 8, false);
        const trailMaterial = new THREE.MeshBasicMaterial({
          color: hexColor.clone().offsetHSL(i * 0.1, 0, 0.2),
          transparent: true,
          opacity: 0.3
        });
        
        const trail = new THREE.Mesh(tubeGeometry, trailMaterial);
        
        // Store animation parameters
        (trail as any).userData = {
          rotationSpeed: 0.001 * (i % 2 === 0 ? 1 : -1),
          pulseSpeed: 0.5 + (i * 0.1)
        };
        
        scene.add(trail);
        objectsRef.current.push(trail);
      }
    };
    
    // Create holographic effect for the profile
    const createHolographicEffect = (scene: THREE.Scene) => {
      const hexColor = new THREE.Color(borderColor);
      
      // Create holographic scan line
      const scanPlaneGeometry = new THREE.PlaneGeometry(4, 0.05);
      const scanMaterial = new THREE.MeshBasicMaterial({
        color: hexColor,
        transparent: true,
        opacity: 0.7,
        side: THREE.DoubleSide
      });
      
      const scanPlane = new THREE.Mesh(scanPlaneGeometry, scanMaterial);
      
      // Store animation parameters
      (scanPlane as any).userData = {
        scanSpeed: 0.03,
        scanRange: { min: -2, max: 2 }
      };
      
      scene.add(scanPlane);
      objectsRef.current.push(scanPlane);
      
      // Create circular holographic rings
      const ringCount = 3;
      for (let i = 0; i < ringCount; i++) {
        const radius = 1.5 + (i * 0.3);
        const ringGeometry = new THREE.RingGeometry(radius, radius + 0.05, 32);
        const ringMaterial = new THREE.MeshBasicMaterial({
          color: hexColor.clone().offsetHSL(i * 0.1, 0, 0),
          transparent: true,
          opacity: 0.3,
          side: THREE.DoubleSide
        });
        
        const ring = new THREE.Mesh(ringGeometry, ringMaterial);
        ring.rotation.x = Math.PI / 2;
        
        // Store animation parameters
        (ring as any).userData = {
          pulseSpeed: 0.5 + (i * 0.2),
          rotationSpeed: 0.001 * (i % 2 === 0 ? 1 : -1)
        };
        
        scene.add(ring);
        objectsRef.current.push(ring);
      }
      
      // Create glitch effect planes
      const glitchCount = 4;
      for (let i = 0; i < glitchCount; i++) {
        const height = 0.1 + Math.random() * 0.3;
        const width = 1 + Math.random() * 1.5;
        
        const glitchGeometry = new THREE.PlaneGeometry(width, height);
        const glitchMaterial = new THREE.MeshBasicMaterial({
          color: hexColor.clone().offsetHSL(0, -0.5, 0.3),
          transparent: true,
          opacity: 0.15,
          side: THREE.DoubleSide
        });
        
        const glitch = new THREE.Mesh(glitchGeometry, glitchMaterial);
        glitch.position.z = 0.1;
        
        // Store animation parameters
        (glitch as any).userData = {
          originalOpacity: 0.15,
          glitchSpeed: 0.1 + Math.random() * 0.2,
          glitchInterval: 1000 + Math.random() * 2000,
          lastGlitch: 0
        };
        
        scene.add(glitch);
        objectsRef.current.push(glitch);
      }
    };
    
    // Animation loop
    const animate = () => {
      if (!sceneRef.current || !cameraRef.current || !rendererRef.current) return;
      
      const time = Date.now() * 0.001;
      
      // Apply mouse-controlled rotation to the entire scene
      if (rotateOnHover && isHovering) {
        sceneRef.current.rotation.x = springRotateX.get() * 0.01;
        sceneRef.current.rotation.y = springRotateY.get() * 0.01;
      }
      
      // Animate border segments
      objectsRef.current.forEach(object => {
        const userData = (object as any).userData;
        if (!userData) return;
        
        // Border segments
        if (userData.segmentIndex !== undefined) {
          const pulse = Math.sin(time * userData.pulseSpeed) * 0.05 + 1;
          object.scale.set(userData.initialScale * pulse, userData.initialScale * pulse, userData.initialScale * pulse);
          object.rotation.z += userData.rotationSpeed;
        }
        
        // Connection nodes
        if (userData.nodeIndex !== undefined) {
          const pulse = Math.sin(time * userData.pulseSpeed) * 0.2 + 1;
          object.scale.set(pulse, pulse, pulse);
        }
        
        // Decorative elements
        if (userData.orbitSpeed !== undefined && userData.orbitRadius) {
          // Orbital movement
          if (userData.orbitInitialAngle !== undefined) {
            const angle = userData.orbitInitialAngle + time * userData.orbitSpeed;
            object.position.x = Math.cos(angle) * userData.orbitRadius;
            object.position.y = Math.sin(angle) * userData.orbitRadius;
          }
          
          // Rotation animation
          if (userData.rotationSpeed) {
            object.rotation.x += userData.rotationSpeed.x;
            object.rotation.y += userData.rotationSpeed.y;
            object.rotation.z += userData.rotationSpeed.z;
          }
        }
        
        // Particle animation
        if (userData.initialPosition && userData.orbitAmplitude) {
          // Create gentle floating movement
          object.position.x = userData.initialPosition.x + Math.sin(time * userData.orbitSpeed * 2) * userData.orbitAmplitude;
          object.position.y = userData.initialPosition.y + Math.cos(time * userData.orbitSpeed * 3) * userData.orbitAmplitude;
          object.position.z = userData.initialPosition.z + Math.sin(time * userData.orbitSpeed * 5) * userData.orbitAmplitude;
          
          // Pulsing scale
          if (userData.pulseSpeed && userData.initialScale) {
            const pulse = Math.sin(time * userData.pulseSpeed) * 0.3 + 1;
            object.scale.set(
              userData.initialScale * pulse,
              userData.initialScale * pulse,
              userData.initialScale * pulse
            );
          }
        }
        
        // Energy trails animation
        if (userData.rotationSpeed !== undefined && userData.pulseSpeed !== undefined) {
          object.rotation.z += userData.rotationSpeed;
          
          // Pulse opacity
          if (object.material && !Array.isArray(object.material) && 'opacity' in object.material) {
            object.material.opacity = 0.3 + Math.sin(time * userData.pulseSpeed) * 0.2;
          }
        }
        
        // Holographic scan animation
        if (userData.scanSpeed && userData.scanRange) {
          // Move scan plane up and down
          object.position.y = 
            userData.scanRange.min + 
            (Math.sin(time * userData.scanSpeed) + 1) / 2 * 
            (userData.scanRange.max - userData.scanRange.min);
        }
        
        // Glitch effect animation
        if (userData.glitchSpeed && userData.glitchInterval) {
          const currentTime = Date.now();
          
          // Glitch effect at intervals
          if (currentTime - userData.lastGlitch > userData.glitchInterval) {
            userData.lastGlitch = currentTime;
            
            // Hide or show randomly
            object.visible = Math.random() > 0.5;
            
            // Randomize position
            object.position.y = (Math.random() * 4) - 2;
            
            // Randomize opacity
            if (object.material && !Array.isArray(object.material) && 'opacity' in object.material) {
              object.material.opacity = Math.random() * 0.3;
            }
          }
          
          // Restore after glitch effect
          if (currentTime - userData.lastGlitch > 200) {
            object.visible = true;
            
            if (object.material && !Array.isArray(object.material) && 'opacity' in object.material) {
              object.material.opacity = userData.originalOpacity;
            }
          }
        }
      });
      
      // Render scene
      rendererRef.current.render(sceneRef.current, cameraRef.current);
      
      // Continue animation loop
      frameIdRef.current = requestAnimationFrame(animate);
    };
    
    // Initialize 3D scene
    initialize();
    
    // Cleanup function
    return () => {
      if (frameIdRef.current) {
        cancelAnimationFrame(frameIdRef.current);
      }
      
      // Clean up Three.js resources
      objectsRef.current.forEach(object => {
        if ('geometry' in object && object.geometry) {
          object.geometry.dispose();
        }
        
        if ('material' in object && object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach(m => m.dispose());
          } else {
            object.material.dispose();
          }
        }
      });
      
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
      
      objectsRef.current = [];
      sceneRef.current = null;
      cameraRef.current = null;
      rendererRef.current = null;
    };
  }, [interactive3D, highTechBorder, particleEffect, holographicEffect, size, borderColor, isHovering, rotateOnHover]);
  
  // Handle mouse interaction for 3D effect
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
        perspective: 800,
        ...style
      }}
    >
      {/* Three.js canvas for 3D effects */}
      {interactive3D && (
        <canvas
          ref={canvasRef}
          width={size}
          height={size}
          className="absolute inset-0 z-0 pointer-events-none"
        />
      )}
      
      {/* Main profile image container with 3D effect */}
      <motion.div
        style={{
          width: '100%',
          height: '100%',
          rotateX: rotateOnHover && !interactive3D ? springRotateX : 0,
          rotateY: rotateOnHover && !interactive3D ? springRotateY : 0,
          zIndex: 1,
        }}
        className="w-full h-full relative"
      >
        {/* High-tech border effects (CSS fallback when Three.js is not used) */}
        {highTechBorder && !interactive3D && (
          <div 
            className="absolute inset-0 rounded-full overflow-hidden z-0"
            style={{
              background: `linear-gradient(45deg, ${borderColor}, transparent)`,
              animation: 'spin 15s linear infinite'
            }}
          >
            <div className="absolute inset-2 rounded-full bg-black z-10" />
          </div>
        )}
        
        {/* Glow effect (CSS fallback when Three.js is not used) */}
        {glowEffect && (
          <div 
            className="absolute -inset-2 rounded-full z-0"
            style={{ 
              background: `radial-gradient(circle, ${borderColor}80 0%, transparent 70%)`,
              filter: 'blur(10px)',
              opacity: 0.8,
              animation: isHovering ? 'pulse 2s infinite' : 'none'
            }}
          />
        )}
        
        {/* Profile image */}
        <motion.div
          className="w-full h-full rounded-full overflow-hidden relative z-10"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', duration: 0.8 }}
          style={{
            border: `2px solid ${borderColor}`,
            boxShadow: glowEffect ? `0 0 20px ${borderColor}` : 'none',
          }}
        >
          <img
            src={imgSrc}
            alt="Profile"
            className="w-full h-full object-cover"
            style={{ 
              filter: holographicEffect && !interactive3D ? 'hue-rotate(15deg) brightness(1.2)' : 'none'
            }}
            onError={(e) => console.error("Image failed to load:", imgSrc)}
          />
          
          {/* Holographic overlay effect (CSS fallback) */}
          {holographicEffect && !interactive3D && (
            <motion.div 
              className="absolute inset-0 bg-gradient-to-tr from-transparent via-white to-transparent z-20"
              style={{ 
                opacity: 0.1,
                background: `linear-gradient(45deg, transparent, ${borderColor}40, transparent)`,
              }}
              animate={{ 
                opacity: [0.05, 0.2, 0.05],
                y: [-10, 10, -10] 
              }}
              transition={{ 
                duration: 8, 
                repeat: Infinity,
                ease: "linear" 
              }}
            />
          )}
          
          {/* Particle effects (CSS fallback) */}
          {particleEffect && !interactive3D && (
            <div className="absolute inset-0 overflow-hidden">
              {[...Array(10)].map((_, i) => (
                <motion.div 
                  key={i}
                  className="absolute rounded-full z-20"
                  style={{ 
                    width: 2 + Math.random() * 4,
                    height: 2 + Math.random() * 4,
                    background: borderColor,
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    opacity: 0.2 + Math.random() * 0.6,
                  }}
                  animate={{ 
                    opacity: [0, 1, 0],
                    scale: [0, 1, 0],
                    x: [-(20 + Math.random() * 30), 0, 20 + Math.random() * 30],
                    y: [-(20 + Math.random() * 30), 0, 20 + Math.random() * 30],
                  }}
                  transition={{ 
                    duration: 2 + Math.random() * 4, 
                    repeat: Infinity,
                    delay: Math.random() * 5,
                    ease: "easeInOut"
                  }}
                />
              ))}
            </div>
          )}
          
          {/* Subtle shine overlay effect on hover */}
          <motion.div 
            className={`absolute inset-0 bg-gradient-to-tr from-transparent via-white to-transparent z-30`}
            animate={{ 
              opacity: isHovering ? 0.2 : 0 
            }}
            transition={{ duration: 0.3 }}
          />
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

export default Enhanced3DProfileAnimation;