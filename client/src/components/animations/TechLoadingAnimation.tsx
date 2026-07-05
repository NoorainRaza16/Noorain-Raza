import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { motion } from 'framer-motion';

interface TechLoadingAnimationProps {
  onComplete?: () => void;
  duration?: number;
  color?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showText?: boolean;
  text?: string;
}

/**
 * A 3D tech loading animation component using Three.js
 * 
 * @example
 * <TechLoadingAnimation 
 *   onComplete={() => console.log('Animation complete')} 
 *   duration={2000}
 *   color="#3498db"
 *   size="md"
 *   showText={true}
 *   text="Loading..."
 * />
 */
export function TechLoadingAnimation({
  onComplete,
  duration = 3000,
  color = '#3498db',
  size = 'md',
  className = '',
  showText = true,
  text = 'Loading...'
}: TechLoadingAnimationProps) {
  // Force re-render when color changes (for theme toggling)
  const colorKey = React.useMemo(() => color, [color]);
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const objectsRef = useRef<THREE.Mesh[]>([]);
  const frameIdRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  
  // Size mapping based on the size prop
  const sizeDimensions = {
    sm: { width: 80, height: 80 },
    md: { width: 120, height: 120 },
    lg: { width: 180, height: 180 },
  };
  
  const { width, height } = sizeDimensions[size];

  useEffect(() => {
    // Initialize Three.js scene
    const initialize = () => {
      if (!containerRef.current) return;
      
      // Create scene
      const scene = new THREE.Scene();
      sceneRef.current = scene;
      
      // Create camera
      const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
      camera.position.z = 5;
      cameraRef.current = camera;
      
      // Create renderer
      const renderer = new THREE.WebGLRenderer({ 
        antialias: true,
        alpha: true, // Make background transparent
      });
      renderer.setSize(width, height);
      renderer.setClearColor(0x000000, 0); // Transparent background
      
      // Append renderer to container
      if (containerRef.current.firstChild) {
        containerRef.current.removeChild(containerRef.current.firstChild);
      }
      containerRef.current.appendChild(renderer.domElement);
      rendererRef.current = renderer;
      
      // Add lighting
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
      scene.add(ambientLight);
      
      const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
      directionalLight.position.set(5, 5, 5);
      scene.add(directionalLight);
      
      createTechObjects(scene);
      
      // Start animation
      startTimeRef.current = Date.now();
      animate();
    };
    
    // Create high-tech 3D objects for futuristic loading animation
    const createTechObjects = (scene: THREE.Scene) => {
      const mainColor = new THREE.Color(color);
      const accentColor = mainColor.clone().offsetHSL(0.1, 0, 0.2);
      const glowColor = mainColor.clone().offsetHSL(0, -0.2, 0.2);
      
      // Create advanced materials with more visual effects
      const materials = [
        // High-tech glossy material with slight transparency
        new THREE.MeshPhysicalMaterial({ 
          color: mainColor,
          metalness: 0.9,
          roughness: 0.1,
          clearcoat: 1.0,
          clearcoatRoughness: 0.1,
          reflectivity: 1.0,
          transparent: true,
          opacity: 0.9,
          envMapIntensity: 1.5
        }),
        // Holographic material with color shifts
        new THREE.MeshPhysicalMaterial({
          color: accentColor,
          metalness: 0.7,
          roughness: 0.2,
          clearcoat: 0.5,
          transmission: 0.2,
          transparent: true,
          opacity: 0.8
        }),
        // Tech edge glow material
        new THREE.MeshStandardMaterial({
          color: glowColor,
          metalness: 0.5,
          roughness: 0.3,
          emissive: glowColor,
          emissiveIntensity: 0.5
        }),
        // Wireframe material for tech details
        new THREE.MeshBasicMaterial({
          color: mainColor.clone().offsetHSL(0.05, 0, 0.5),
          wireframe: true,
          transparent: true,
          opacity: 0.6
        })
      ];
      
      // Create a light for more dramatic effect
      const pointLight = new THREE.PointLight(mainColor, 2, 10);
      pointLight.position.set(0, 2, 3);
      scene.add(pointLight);
      
      // Add dynamic glow effect
      const glowLight = new THREE.PointLight(accentColor, 1, 6);
      glowLight.position.set(1, -1, 2);
      scene.add(glowLight);
      
      // Create an animation for the lights
      const animateLight = () => {
        const time = Date.now() * 0.001;
        pointLight.position.x = Math.sin(time) * 3;
        pointLight.position.z = Math.cos(time) * 3;
        pointLight.intensity = 1.5 + Math.sin(time * 2) * 0.5;
        
        glowLight.position.x = -Math.sin(time * 0.7) * 3;
        glowLight.position.z = -Math.cos(time * 0.7) * 3;
        
        requestAnimationFrame(animateLight);
      };
      animateLight();
      
      // Create more complex geometry for main objects
      
      // Advanced Cube with beveled edges and details
      const cubeGeometry = new THREE.BoxGeometry(1.2, 1.2, 1.2, 2, 2, 2);
      const cube = new THREE.Mesh(cubeGeometry, materials[0]);
      cube.position.set(-2, 0, 0);
      scene.add(cube);
      
      // Create a wireframe overlay for the cube
      const cubeWire = new THREE.Mesh(
        new THREE.BoxGeometry(1.25, 1.25, 1.25),
        materials[3]
      );
      cubeWire.position.copy(cube.position);
      scene.add(cubeWire);
      
      objectsRef.current.push(cube);
      objectsRef.current.push(cubeWire);
      
      // Dodecahedron (more complex than a sphere)
      const dodecaGeometry = new THREE.DodecahedronGeometry(0.8, 1);
      const dodeca = new THREE.Mesh(dodecaGeometry, materials[1]);
      dodeca.position.set(0, 0, 0);
      scene.add(dodeca);
      
      // Add a glow sphere around it
      const glowSphereGeometry = new THREE.SphereGeometry(0.95, 32, 32);
      const glowSphere = new THREE.Mesh(
        glowSphereGeometry, 
        new THREE.MeshBasicMaterial({
          color: accentColor,
          transparent: true,
          opacity: 0.15,
          side: THREE.BackSide
        })
      );
      glowSphere.position.copy(dodeca.position);
      scene.add(glowSphere);
      
      objectsRef.current.push(dodeca);
      objectsRef.current.push(glowSphere);
      
      // Torus Knot (more interesting than a simple torus)
      const torusKnotGeometry = new THREE.TorusKnotGeometry(0.6, 0.2, 128, 32, 2, 3);
      const torusKnot = new THREE.Mesh(torusKnotGeometry, materials[2]);
      torusKnot.position.set(2, 0, 0);
      scene.add(torusKnot);
      
      // Add rings around the torus knot
      const ring1 = new THREE.Mesh(
        new THREE.TorusGeometry(1.2, 0.04, 16, 60),
        new THREE.MeshBasicMaterial({
          color: mainColor.clone().offsetHSL(0, 0, 0.4),
          transparent: true,
          opacity: 0.4
        })
      );
      ring1.position.copy(torusKnot.position);
      ring1.rotation.x = Math.PI / 2;
      scene.add(ring1);
      
      const ring2 = ring1.clone();
      ring2.rotation.x = 0;
      ring2.rotation.y = Math.PI / 2;
      scene.add(ring2);
      
      objectsRef.current.push(torusKnot);
      objectsRef.current.push(ring1);
      objectsRef.current.push(ring2);
      
      // Add particles for high-tech data flow effect 
      const particleCount = 40;
      const particleGeometry = new THREE.SphereGeometry(0.08, 8, 8);
      
      // Create two types of particles
      for (let i = 0; i < particleCount; i++) {
        // Regular particles
        const particleMaterial = new THREE.MeshBasicMaterial({
          color: i % 2 === 0 ? mainColor : accentColor,
          transparent: true,
          opacity: 0.7
        });
        
        const particle = new THREE.Mesh(particleGeometry, particleMaterial);
        
        // Create complex orbital paths rather than simple circles
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * 3.5 + 2;
        const height = (Math.random() - 0.5) * 4;
        
        particle.position.x = Math.cos(angle) * radius;
        particle.position.y = height;
        particle.position.z = Math.sin(angle) * radius;
        
        // Random scale for varied appearance
        particle.scale.setScalar(Math.random() * 0.5 + 0.2);
        
        // Store initial position for custom animation paths
        (particle as any).userData = {
          initialPos: particle.position.clone(),
          orbitSpeed: Math.random() * 0.01 + 0.005,
          orbitRadius: radius,
          orbitHeight: height,
          pulseSpeed: Math.random() * 0.03 + 0.01,
          initialScale: particle.scale.x
        };
        
        scene.add(particle);
        objectsRef.current.push(particle);
        
        // Add a few streaks/trails for data stream effect
        if (i % 5 === 0) {
          const trailGeometry = new THREE.BoxGeometry(0.05, 0.05, 0.5);
          const trailMaterial = new THREE.MeshBasicMaterial({
            color: mainColor.clone().offsetHSL(0.1 * (i % 3), 0, 0.3),
            transparent: true,
            opacity: 0.6
          });
          
          const trail = new THREE.Mesh(trailGeometry, trailMaterial);
          trail.position.copy(particle.position);
          trail.lookAt(scene.position); // Always face the center
          
          (trail as any).userData = {
            followParticle: particle,
            speed: Math.random() * 0.02 + 0.01,
            length: Math.random() * 0.5 + 0.3
          };
          
          scene.add(trail);
          objectsRef.current.push(trail);
        }
      }
    };
    
    // High-tech 3D animation loop with advanced motion patterns
    const animate = () => {
      if (!sceneRef.current || !cameraRef.current || !rendererRef.current) return;
      
      const elapsedTime = Date.now() - startTimeRef.current;
      const progress = Math.min(elapsedTime / duration, 1);
      const time = elapsedTime * 0.001; // Time in seconds
      
      // Camera animation for more dynamic feel
      cameraRef.current.position.y = Math.sin(time * 0.3) * 0.5;
      cameraRef.current.position.x = Math.sin(time * 0.2) * 0.3;
      cameraRef.current.lookAt(0, 0, 0);
      
      // Animate all objects with complex patterns specific to their type
      objectsRef.current.forEach((object, index) => {
        const userData = (object as any).userData;
        
        // Main center objects (first 6 objects: cube, cubewire, dodeca, glowsphere, torusknot, ring1, ring2)
        if (index < 7) {
          if (index === 0) { // Cube
            // Complex rotation pattern
            object.rotation.x += 0.01;
            object.rotation.y += 0.015;
            object.rotation.z += 0.005;
            
            // Subtle pulsing
            const pulseFactor = Math.sin(time * 2) * 0.05 + 1;
            object.scale.set(pulseFactor, pulseFactor, pulseFactor);
          } 
          else if (index === 1) { // Cube wireframe
            // Match the cube but with slight offset for effect
            object.rotation.copy(objectsRef.current[0].rotation);
            // Pulse slightly out of sync
            const pulseFactor = Math.sin(time * 2 + 0.5) * 0.08 + 1.05;
            object.scale.set(pulseFactor, pulseFactor, pulseFactor);
          }
          else if (index === 2) { // Dodecahedron
            // Different rotation speeds for more complex motion
            object.rotation.x += 0.007;
            object.rotation.y += 0.012;
            object.rotation.z -= 0.009;
            
            // Floating motion
            object.position.y = Math.sin(time) * 0.2;
          }
          else if (index === 3) { // Glow sphere
            // Match the dodecahedron position
            object.position.copy(objectsRef.current[2].position);
            // Pulse the glow for ethereal effect
            const glowPulse = Math.sin(time * 1.5) * 0.1 + 1.1;
            object.scale.set(glowPulse, glowPulse, glowPulse);
            // Fade in/out slightly for added effect
            (object.material as THREE.Material).opacity = 0.1 + Math.sin(time * 2) * 0.05;
          }
          else if (index === 4) { // Torus knot
            // Complex rotation for interesting visual
            object.rotation.x += 0.01;
            object.rotation.y += 0.01;
            // Subtle pulsing motion
            object.scale.x = object.scale.z = Math.sin(time * 3) * 0.05 + 1;
            object.scale.y = Math.cos(time * 3) * 0.05 + 1;
          }
          else if (index === 5 || index === 6) { // Orbital rings
            // Rotate in different directions
            object.rotation.x += index === 5 ? 0.01 : -0.01;
            object.rotation.y += index === 5 ? 0.02 : -0.015;
            object.rotation.z += 0.005;
          }
        } 
        // Particle animation with advanced data-flow patterns
        else if (userData) {
          if (userData.followParticle) {
            // This is a data stream/trail
            const target = userData.followParticle;
            // Follow the particle with a slight delay for trail effect
            object.position.lerp(target.position, 0.1);
            // Always point toward center for better visuals
            object.lookAt(0, 0, 0);
            // Pulse length for data transfer effect
            object.scale.z = Math.sin(time * 5 * userData.speed) * 0.5 + userData.length;
          } 
          else {
            // Regular particles with orbital motion
            const orbitSpeed = userData.orbitSpeed;
            const radius = userData.orbitRadius;
            
            // Calculate complex orbital path (more interesting than simple circle)
            const angle = time * orbitSpeed * 2;
            const wobble = Math.sin(time * 2) * 0.2;
            
            // Orbital path with vertical wobble for 3D effect
            object.position.x = Math.cos(angle) * radius;
            object.position.z = Math.sin(angle) * radius;
            object.position.y = userData.orbitHeight + Math.sin(time * userData.pulseSpeed * 5) * 0.5;
            
            // Pulse scale for data packet effect
            const pulse = Math.sin(time * 5 * userData.pulseSpeed) * 0.3 + 1;
            object.scale.set(
              userData.initialScale * pulse,
              userData.initialScale * pulse,
              userData.initialScale * pulse
            );
            
            // Fade opacity based on position for ethereal effect
            if (object.material && (object.material as THREE.Material).opacity !== undefined) {
              const dist = object.position.length();
              (object.material as THREE.Material).opacity = 
                0.4 + Math.sin(time * 3 + index) * 0.3;
            }
          }
        }
      });
      
      // Animate the entire scene for an immersive effect
      sceneRef.current.rotation.y = Math.sin(time * 0.2) * 0.1;
      
      // Render scene with high-quality settings
      rendererRef.current.render(sceneRef.current, cameraRef.current);
      
      // Determine if animation should continue or complete
      if (progress < 1) {
        frameIdRef.current = requestAnimationFrame(animate);
      } else if (onComplete) {
        // Fade out animation before completing
        const fadeOut = () => {
          objectsRef.current.forEach(object => {
            if (object.material) {
              if (Array.isArray(object.material)) {
                object.material.forEach(mat => {
                  if ((mat as THREE.Material).opacity !== undefined) {
                    (mat as THREE.Material).opacity *= 0.9;
                  }
                });
              } else if ((object.material as THREE.Material).opacity !== undefined) {
                (object.material as THREE.Material).opacity *= 0.9;
              }
            }
          });
          
          rendererRef.current?.render(sceneRef.current as THREE.Scene, cameraRef.current as THREE.Camera);
          
          if ((objectsRef.current[0].material as THREE.Material).opacity > 0.05) {
            requestAnimationFrame(fadeOut);
          } else {
            setTimeout(onComplete, 100);
          }
        };
        
        fadeOut();
      }
    };
    
    // Initialize scene immediately
    initialize();
    
    // Enhanced cleanup function for proper resource disposal
    return () => {
      console.log("Cleaning up TechLoadingAnimation with color:", color);
      
      // Cancel animation frame
      if (frameIdRef.current !== null) {
        cancelAnimationFrame(frameIdRef.current);
        frameIdRef.current = null;
      }
      
      // Remove canvas element
      if (rendererRef.current && rendererRef.current.domElement && containerRef.current) {
        try {
          containerRef.current.removeChild(rendererRef.current.domElement);
        } catch (e) {
          console.log("Error removing canvas:", e);
        }
      }
      
      // Dispose of geometries and materials
      objectsRef.current.forEach(object => {
        if (object.geometry) {
          object.geometry.dispose();
        }
        
        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach(material => material.dispose());
          } else {
            object.material.dispose();
          }
        }
      });
      
      // Clear objects array
      objectsRef.current = [];
      
      // Dispose renderer
      if (rendererRef.current) {
        rendererRef.current.dispose();
        rendererRef.current = null;
      }
      
      // Clear scene and camera
      sceneRef.current = null;
      cameraRef.current = null;
    };
  }, [colorKey, duration, width, height]);

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div 
        ref={containerRef} 
        className="relative" 
        style={{ width, height, position: 'relative' }}
      />
      
      {showText && (
        <motion.div 
          className="text-center mt-4 font-medium text-primary dark:text-primary-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          {text}
        </motion.div>
      )}
    </div>
  );
}

export default TechLoadingAnimation;