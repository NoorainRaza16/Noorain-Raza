import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { motion } from 'framer-motion';

interface SciFiLoginSceneProps {
  onLoaded?: () => void;
  isAnimating?: boolean;
}

export default function SciFiLoginScene({ onLoaded, isAnimating = true }: SciFiLoginSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const particlesRef = useRef<THREE.Points | null>(null);
  const gridRef = useRef<THREE.GridHelper | null>(null);
  const frameIdRef = useRef<number | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile devices
  useEffect(() => {
    const checkMobile = () => {
      const width = window.innerWidth;
      const userAgent = navigator.userAgent.toLowerCase();
      const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/.test(userAgent);
      
      setIsMobile(isMobileDevice || width < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Initialize scene
  useEffect(() => {
    setIsMounted(true);

    if (!containerRef.current) return;

    // Setup basics
    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x000000, 0.075);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
    camera.position.set(0, 8, 25);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Renderer - with performance optimizations for mobile
    const renderer = new THREE.WebGLRenderer({ 
      antialias: !isMobile,
      alpha: true 
    });
    renderer.setPixelRatio(window.devicePixelRatio > 1 ? 2 : 1);
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Ambient light
    const ambientLight = new THREE.AmbientLight(0x222222);
    scene.add(ambientLight);

    // Directional light
    const directionalLight = new THREE.DirectionalLight(0x06B6D4, 1);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);

    // Point light for the center glow
    const pointLight = new THREE.PointLight(0x06B6D4, 1, 100);
    pointLight.position.set(0, 0, 0);
    scene.add(pointLight);

    // Add a second point light for dynamic effects
    const pointLight2 = new THREE.PointLight(0x3B82F6, 1, 100);
    pointLight2.position.set(20, 10, 5);
    scene.add(pointLight2);

    // Grid helper - 3D grid to create cyberpunk effect
    const grid = new THREE.GridHelper(50, 60, 0x0288d1, 0x0288d1);
    grid.position.set(0, -5, 0);
    grid.material.opacity = 0.15;
    grid.material.transparent = true;
    scene.add(grid);
    gridRef.current = grid;

    // Particle system for the background
    const COUNT = isMobile ? 1000 : 3000;
    const particleGeo = new THREE.BufferGeometry();
    const particleMat = new THREE.PointsMaterial({
      size: 0.1,
      transparent: true,
      color: 0x06B6D4,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    });

    const particlePositions = new Float32Array(COUNT * 3);
    for (let i = 0; i < COUNT; i++) {
      particlePositions[i * 3] = (Math.random() - 0.5) * 50;
      particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 50;
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 50;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);
    particlesRef.current = particles;

    // Handle window resize
    const handleResize = () => {
      if (!containerRef.current || !cameraRef.current || !rendererRef.current) return;
      
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      
      cameraRef.current.aspect = width / height;
      cameraRef.current.updateProjectionMatrix();
      
      rendererRef.current.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    // Animation function
    const animate = () => {
      if (!rendererRef.current || !sceneRef.current || !cameraRef.current || !isAnimating) return;
      
      frameIdRef.current = requestAnimationFrame(animate);
      
      // Rotate particles for cyberpunk atmosphere
      if (particlesRef.current) {
        particlesRef.current.rotation.x += 0.0004;
        particlesRef.current.rotation.y += 0.0005;
      }
      
      // Rotate grid for dynamic ground effect
      if (gridRef.current) {
        gridRef.current.rotation.y += 0.002;
      }
      
      // Oscillate camera slightly for immersive effect
      if (cameraRef.current) {
        cameraRef.current.position.y = 8 + Math.sin(Date.now() * 0.001) * 0.5;
      }
      
      rendererRef.current.render(sceneRef.current, cameraRef.current);
    };

    // Start animation
    animate();
    
    // Signal that the scene is ready
    setTimeout(() => {
      setIsLoaded(true);
      if (onLoaded) onLoaded();
    }, 1000);

    // Cleanup function
    return () => {
      window.removeEventListener('resize', handleResize);
      
      if (frameIdRef.current !== null) {
        cancelAnimationFrame(frameIdRef.current);
      }
      
      if (rendererRef.current && rendererRef.current.domElement && containerRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement);
      }
      
      // Dispose resources
      if (particlesRef.current) {
        particlesRef.current.geometry.dispose();
        (particlesRef.current.material as THREE.Material).dispose();
        scene.remove(particlesRef.current);
      }
      
      if (gridRef.current) {
        gridRef.current.geometry.dispose();
        (gridRef.current.material as THREE.Material).dispose();
        scene.remove(gridRef.current);
      }
      
      renderer.dispose();
    };
  }, [isMobile, isAnimating, onLoaded]);

  // Update animation state
  useEffect(() => {
    if (isAnimating && isMounted) {
      if (frameIdRef.current === null) {
        const animate = () => {
          if (!rendererRef.current || !sceneRef.current || !cameraRef.current) return;
          
          frameIdRef.current = requestAnimationFrame(animate);
          
          if (particlesRef.current) {
            particlesRef.current.rotation.x += 0.0004;
            particlesRef.current.rotation.y += 0.0005;
          }
          
          if (gridRef.current) {
            gridRef.current.rotation.y += 0.002;
          }
          
          if (cameraRef.current) {
            cameraRef.current.position.y = 8 + Math.sin(Date.now() * 0.001) * 0.5;
          }
          
          rendererRef.current.render(sceneRef.current, cameraRef.current);
        };
        
        animate();
      }
    } else {
      if (frameIdRef.current !== null) {
        cancelAnimationFrame(frameIdRef.current);
        frameIdRef.current = null;
      }
    }
    
    return () => {
      if (frameIdRef.current !== null) {
        cancelAnimationFrame(frameIdRef.current);
        frameIdRef.current = null;
      }
    };
  }, [isAnimating, isMounted]);

  return (
    <>
      <div
        ref={containerRef}
        className="absolute inset-0 w-full h-full z-0"
        style={{ background: 'linear-gradient(to bottom, #000000, #0B1120)' }}
      />
      
      {/* Overlay for additional visual effects */}
      <motion.div 
        className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-0 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: isLoaded ? 0.7 : 0 }}
        transition={{ duration: 1 }}
      />
      
      {/* Loading indicator while 3D scene initializes */}
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center z-0">
          <div className="text-cyan-400 font-mono text-sm flex flex-col items-center">
            <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mb-3"></div>
            <div>INITIALIZING QUANTUM INTERFACE</div>
          </div>
        </div>
      )}
    </>
  );
}