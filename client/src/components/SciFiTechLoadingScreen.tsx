import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import * as THREE from 'three';
import { useTheme } from './ThemeProvider';
import { HOLOGRAPHIC_PROFILE_IMAGE } from './ProfileImageData';

interface SciFiTechLoadingScreenProps {
  onComplete?: () => void;
  duration?: number;
  minDisplayTime?: number;
  text?: string;
  showProgressBar?: boolean;
}

/**
 * A sci-fi high-tech 3D animation loading screen with advanced effects
 */
export function SciFiTechLoadingScreen({
  onComplete,
  duration = 3000,
  minDisplayTime = 1500,
  text = "SYSTEM INITIALIZATION...",
  showProgressBar = true
}: SciFiTechLoadingScreenProps) {
  // State management
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [startTime] = useState(Date.now());
  const [loadingText, setLoadingText] = useState('INITIALIZING');
  const [textBlink, setTextBlink] = useState(false);
  
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
  const clockRef = useRef<THREE.Clock>(new THREE.Clock());
  
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
  
  // Change loading text periodically
  useEffect(() => {
    const loadingPhrases = [
      'INITIALIZING SYSTEM',
      'LOADING CORE MODULES',
      'ESTABLISHING CONNECTION',
      'RENDERING INTERFACE',
      'COMPILING DATA',
      'ACTIVATING PROTOCOLS',
      'SYNCHRONIZING'
    ];
    
    let textIndex = 0;
    const textChangeInterval = setInterval(() => {
      textIndex = (textIndex + 1) % loadingPhrases.length;
      setLoadingText(loadingPhrases[textIndex]);
      
      // Blink effect
      setTextBlink(true);
      setTimeout(() => setTextBlink(false), 150);
    }, 2000);
    
    return () => clearInterval(textChangeInterval);
  }, []);
  
  // Simulate loading progress
  useEffect(() => {
    const intervalId = setInterval(() => {
      setProgress(prev => {
        // Add some random spikes for more realistic effect
        const increment = (100 - prev) * (0.05 + Math.random() * 0.1);
        const newProgress = prev + increment;
        return newProgress > 99.5 ? 100 : newProgress;
      });
    }, 150);
    
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
    
    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    
    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75, 
      window.innerWidth / window.innerHeight, 
      0.1, 
      1000
    );
    camera.position.z = 15;
    cameraRef.current = camera;
    
    // Renderer with high quality settings
    const renderer = new THREE.WebGLRenderer({ 
      canvas: canvasRef.current,
      antialias: true,
      alpha: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    rendererRef.current = renderer;
    
    // Environment color based on theme
    const envColor = currentTheme === 'dark' 
      ? new THREE.Color(0x000823) 
      : new THREE.Color(0x001040);
    scene.background = envColor;
    
    // Create futuristic sci-fi elements
    createHolographicCircuit(scene);
    createFloatingHexagons(scene);
    createEnergyCore(scene);
    createDataStream(scene);
    
    // Add ambient and directional light
    const ambientLight = new THREE.AmbientLight(
      currentTheme === 'dark' ? 0x0a2a5e : 0x2a4a7e, 
      0.5
    );
    scene.add(ambientLight);
    
    const mainLight = new THREE.DirectionalLight(
      currentTheme === 'dark' ? 0x4080ff : 0x80a0ff, 
      1
    );
    mainLight.position.set(5, 5, 7);
    scene.add(mainLight);
    
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
      
      const delta = clockRef.current.getDelta();
      const elapsedTime = clockRef.current.getElapsedTime();
      
      // Update all animations
      updateHolographicCircuit(elapsedTime);
      updateFloatingHexagons(delta, elapsedTime);
      updateEnergyCore(delta, elapsedTime, progress);
      updateDataStream(delta, elapsedTime);
      
      // Camera slight movement for more dynamic feel
      camera.position.x = Math.sin(elapsedTime * 0.2) * 0.5;
      camera.position.y = Math.cos(elapsedTime * 0.1) * 0.3;
      camera.lookAt(0, 0, 0);
      
      // Render scene
      rendererRef.current.render(sceneRef.current, cameraRef.current);
      
      // Continue animation loop
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    
    // Starting the animation loop
    clockRef.current.start();
    animate();
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      
      // Dispose of all resources
      if (rendererRef.current) rendererRef.current.dispose();
      
      // Scene resources will be disposed by specific object functions
      disposeAllObjects();
    };
  }, [currentTheme]);
  
  // Object collections for updating and disposal
  const holographicObjects = useRef<THREE.Object3D[]>([]);
  const hexagonObjects = useRef<THREE.Object3D[]>([]);
  const energyCoreObjects = useRef<THREE.Object3D[]>([]);
  const dataStreamObjects = useRef<THREE.Object3D[]>([]);
  
  // Clean up all objects on unmount
  const disposeAllObjects = () => {
    const allObjects = [
      ...holographicObjects.current,
      ...hexagonObjects.current,
      ...energyCoreObjects.current,
      ...dataStreamObjects.current
    ];
    
    allObjects.forEach(object => {
      if (object instanceof THREE.Mesh) {
        if (object.geometry) object.geometry.dispose();
        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach(mat => mat.dispose());
          } else {
            object.material.dispose();
          }
        }
      }
    });
  };
  
  // Create holographic circuit elements
  const createHolographicCircuit = (scene: THREE.Scene) => {
    // Base platform
    const platformGeometry = new THREE.CylinderGeometry(8, 8, 0.2, 32, 1, false);
    const platformMaterial = new THREE.MeshPhongMaterial({
      color: currentTheme === 'dark' ? 0x0a1a3a : 0x2a4a7a,
      emissive: currentTheme === 'dark' ? 0x061428 : 0x0a2050,
      transparent: true,
      opacity: 0.9,
      wireframe: false
    });
    
    const platform = new THREE.Mesh(platformGeometry, platformMaterial);
    platform.position.y = -3;
    scene.add(platform);
    holographicObjects.current.push(platform);
    
    // Circuit lines
    const circuitCount = 24;
    const circuitRadius = 7.5;
    
    for (let i = 0; i < circuitCount; i++) {
      const angle = (i / circuitCount) * Math.PI * 2;
      const length = 3 + Math.random() * 4;
      
      const startX = Math.cos(angle) * circuitRadius * 0.6;
      const startZ = Math.sin(angle) * circuitRadius * 0.6;
      
      const endX = Math.cos(angle) * circuitRadius;
      const endZ = Math.sin(angle) * circuitRadius;
      
      const points = [
        new THREE.Vector3(startX, -2.9, startZ),
        new THREE.Vector3(endX, -2.9, endZ)
      ];
      
      const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
      const lineMaterial = new THREE.LineBasicMaterial({ 
        color: currentTheme === 'dark' ? 0x3a80ff : 0x0040c0,
        transparent: true,
        opacity: 0.7
      });
      
      const line = new THREE.Line(lineGeometry, lineMaterial);
      line.userData = {
        originalOpacity: 0.7,
        pulseSpeed: 0.5 + Math.random() * 1.5
      };
      
      scene.add(line);
      holographicObjects.current.push(line);
      
      // Add circuit nodes at ends
      const nodeGeometry = new THREE.SphereGeometry(0.1, 8, 8);
      const nodeMaterial = new THREE.MeshBasicMaterial({
        color: currentTheme === 'dark' ? 0x60a0ff : 0x0060ff,
        transparent: true,
        opacity: 0.9
      });
      
      const startNode = new THREE.Mesh(nodeGeometry, nodeMaterial);
      startNode.position.set(startX, -2.9, startZ);
      startNode.userData = {
        pulseSpeed: 1 + Math.random(),
        originalScale: 1
      };
      
      const endNode = new THREE.Mesh(nodeGeometry, nodeMaterial);
      endNode.position.set(endX, -2.9, endZ);
      endNode.userData = {
        pulseSpeed: 1 + Math.random(),
        originalScale: 1
      };
      
      scene.add(startNode);
      scene.add(endNode);
      holographicObjects.current.push(startNode, endNode);
    }
  };
  
  // Update holographic circuit animations
  const updateHolographicCircuit = (time: number) => {
    holographicObjects.current.forEach(object => {
      if (!object.userData) return;
      
      if (object instanceof THREE.Line && object.userData.originalOpacity) {
        const lineMaterial = object.material as THREE.LineBasicMaterial;
        lineMaterial.opacity = object.userData.originalOpacity * 
          (0.6 + 0.4 * Math.sin(time * object.userData.pulseSpeed));
      }
      
      if (object instanceof THREE.Mesh && object.userData.pulseSpeed) {
        const scale = 0.8 + 0.4 * Math.sin(time * object.userData.pulseSpeed);
        object.scale.set(scale, scale, scale);
        
        if (object.material instanceof THREE.MeshBasicMaterial) {
          object.material.opacity = 0.7 + 0.3 * Math.sin(time * object.userData.pulseSpeed);
        }
      }
    });
  };
  
  // Create floating hexagon elements
  const createFloatingHexagons = (scene: THREE.Scene) => {
    const hexCount = 12;
    
    for (let i = 0; i < hexCount; i++) {
      const radius = 3 + Math.random() * 4;
      const angle = Math.random() * Math.PI * 2;
      const height = Math.random() * 6 - 3;
      
      const hexGeometry = new THREE.CircleGeometry(0.5 + Math.random() * 0.5, 6);
      const hexMaterial = new THREE.MeshBasicMaterial({
        color: currentTheme === 'dark' 
          ? new THREE.Color(0.1 + Math.random() * 0.2, 0.3 + Math.random() * 0.3, 0.8 + Math.random() * 0.2)
          : new THREE.Color(0, 0.2 + Math.random() * 0.3, 0.7 + Math.random() * 0.3),
        transparent: true,
        opacity: 0.2 + Math.random() * 0.4,
        side: THREE.DoubleSide
      });
      
      const hexagon = new THREE.Mesh(hexGeometry, hexMaterial);
      hexagon.position.set(
        Math.cos(angle) * radius,
        height,
        Math.sin(angle) * radius
      );
      
      // Rotate to face center with random offset
      hexagon.lookAt(0, height, 0);
      hexagon.rotateZ(Math.random() * Math.PI);
      
      // Animation properties
      hexagon.userData = {
        originalPos: hexagon.position.clone(),
        floatSpeed: 0.2 + Math.random() * 0.3,
        floatAmount: 0.3 + Math.random() * 0.5,
        rotationSpeed: 0.1 + Math.random() * 0.4,
        pulseSpeed: 0.3 + Math.random() * 0.4
      };
      
      scene.add(hexagon);
      hexagonObjects.current.push(hexagon);
    }
  };
  
  // Update floating hexagon animations
  const updateFloatingHexagons = (delta: number, time: number) => {
    hexagonObjects.current.forEach(hexagon => {
      if (!hexagon.userData) return;
      
      // Floating motion
      hexagon.position.y = hexagon.userData.originalPos.y + 
        Math.sin(time * hexagon.userData.floatSpeed) * hexagon.userData.floatAmount;
      
      // Slow rotation
      hexagon.rotateZ(delta * hexagon.userData.rotationSpeed);
      
      // Opacity pulse
      if (hexagon instanceof THREE.Mesh && hexagon.material instanceof THREE.MeshBasicMaterial) {
        hexagon.material.opacity = 0.2 + 0.3 * Math.sin(time * hexagon.userData.pulseSpeed);
      }
    });
  };
  
  // Create central energy core
  const createEnergyCore = (scene: THREE.Scene) => {
    // Core sphere
    const coreGeometry = new THREE.SphereGeometry(1.2, 32, 32);
    const coreMaterial = new THREE.MeshPhongMaterial({
      color: currentTheme === 'dark' ? 0x3080ff : 0x0060e0,
      emissive: currentTheme === 'dark' ? 0x1040a0 : 0x0040a0,
      transparent: true,
      opacity: 0.8,
      wireframe: true
    });
    
    const core = new THREE.Mesh(coreGeometry, coreMaterial);
    scene.add(core);
    energyCoreObjects.current.push(core);
    
    // Inner core
    const innerGeometry = new THREE.SphereGeometry(0.8, 24, 24);
    const innerMaterial = new THREE.MeshBasicMaterial({
      color: currentTheme === 'dark' ? 0x60a0ff : 0x40a0ff,
      transparent: true,
      opacity: 0.7
    });
    
    const innerCore = new THREE.Mesh(innerGeometry, innerMaterial);
    scene.add(innerCore);
    energyCoreObjects.current.push(innerCore);
    
    // Outer rings
    const ringCount = 3;
    for (let i = 0; i < ringCount; i++) {
      const radius = 1.8 + i * 0.5;
      const ringGeometry = new THREE.TorusGeometry(radius, 0.05, 8, 64);
      const ringMaterial = new THREE.MeshBasicMaterial({
        color: currentTheme === 'dark' ? 0x4080ff : 0x0060c0,
        transparent: true,
        opacity: 0.6 - i * 0.15
      });
      
      const ring = new THREE.Mesh(ringGeometry, ringMaterial);
      ring.userData = {
        rotationAxis: new THREE.Vector3(
          Math.random() - 0.5,
          Math.random() - 0.5,
          Math.random() - 0.5
        ).normalize(),
        rotationSpeed: 0.2 + Math.random() * 0.3
      };
      
      scene.add(ring);
      energyCoreObjects.current.push(ring);
    }
    
    // Energy beams
    const beamCount = 6;
    for (let i = 0; i < beamCount; i++) {
      const angle = (i / beamCount) * Math.PI * 2;
      const beamGeometry = new THREE.CylinderGeometry(0.05, 0.2, 4, 8);
      const beamMaterial = new THREE.MeshBasicMaterial({
        color: currentTheme === 'dark' ? 0x80c0ff : 0x60a0ff,
        transparent: true,
        opacity: 0.4
      });
      
      const beam = new THREE.Mesh(beamGeometry, beamMaterial);
      beam.position.set(
        Math.cos(angle) * 2,
        0,
        Math.sin(angle) * 2
      );
      
      // Point away from center
      beam.lookAt(
        Math.cos(angle) * 10,
        0,
        Math.sin(angle) * 10
      );
      beam.rotateX(Math.PI / 2);
      
      beam.userData = {
        pulseSpeed: 0.5 + Math.random() * 0.5,
        originalScale: new THREE.Vector3(1, 1, 1),
        originalOpacity: 0.4
      };
      
      scene.add(beam);
      energyCoreObjects.current.push(beam);
    }
  };
  
  // Update energy core animations
  const updateEnergyCore = (delta: number, time: number, progress: number) => {
    energyCoreObjects.current.forEach((object, index) => {
      if (!object.userData) return;
      
      if (index === 0 && object instanceof THREE.Mesh) {
        // Core rotation
        object.rotation.x += delta * 0.2;
        object.rotation.y += delta * 0.3;
        
        // Scale based on progress
        const scale = 1 + (progress / 100) * 0.3;
        object.scale.set(scale, scale, scale);
        
        // Increase emissive intensity
        if (object.material instanceof THREE.MeshPhongMaterial) {
          const progressColor = new THREE.Color(
            0.1 + (progress / 100) * 0.3,
            0.2 + (progress / 100) * 0.4,
            0.6 + (progress / 100) * 0.4
          );
          object.material.emissive = progressColor;
        }
      } 
      else if (index === 1 && object instanceof THREE.Mesh) {
        // Inner core pulse
        const pulseScale = 0.9 + 0.3 * Math.sin(time * 2);
        object.scale.set(pulseScale, pulseScale, pulseScale);
        
        if (object.material instanceof THREE.MeshBasicMaterial) {
          object.material.opacity = 0.5 + 0.3 * Math.sin(time * 1.5);
        }
      }
      else if (object instanceof THREE.Mesh && object.userData.rotationAxis) {
        // Ring rotation around custom axis
        const axis = object.userData.rotationAxis;
        object.rotateOnAxis(axis, delta * object.userData.rotationSpeed);
      }
      else if (object instanceof THREE.Mesh && object.userData.pulseSpeed) {
        // Energy beam pulse
        const pulse = 0.8 + 0.4 * Math.sin(time * object.userData.pulseSpeed);
        object.scale.y = pulse;
        
        if (object.material instanceof THREE.MeshBasicMaterial) {
          object.material.opacity = object.userData.originalOpacity * 
            (0.7 + 0.3 * Math.sin(time * object.userData.pulseSpeed));
        }
      }
    });
  };
  
  // Create data stream particles
  const createDataStream = (scene: THREE.Scene) => {
    const particleCount = 300;
    const particlesGeometry = new THREE.BufferGeometry();
    
    // Positions for particles
    const positions = new Float32Array(particleCount * 3);
    const speeds = new Float32Array(particleCount);
    const sizes = new Float32Array(particleCount);
    const colors = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount; i++) {
      // Random position in a sphere
      const radius = 2 + Math.random() * 8;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);
      
      // Random speed
      speeds[i] = 0.5 + Math.random() * 1.5;
      
      // Random size
      sizes[i] = 0.05 + Math.random() * 0.1;
      
      // Color based on theme with slight variation
      if (currentTheme === 'dark') {
        colors[i * 3] = 0.2 + Math.random() * 0.2;     // r
        colors[i * 3 + 1] = 0.4 + Math.random() * 0.3; // g
        colors[i * 3 + 2] = 0.8 + Math.random() * 0.2; // b
      } else {
        colors[i * 3] = 0.1 + Math.random() * 0.1;     // r
        colors[i * 3 + 1] = 0.3 + Math.random() * 0.2; // g
        colors[i * 3 + 2] = 0.7 + Math.random() * 0.3; // b
      }
    }
    
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particlesGeometry.setAttribute('speed', new THREE.BufferAttribute(speeds, 1));
    particlesGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    // Simple material to avoid shader errors but still look good
    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.1,
      transparent: true,
      opacity: 0.7,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true
    });
    
    const particles = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particles);
    dataStreamObjects.current.push(particles);
  };
  
  // Update data stream animations
  const updateDataStream = (delta: number, time: number) => {
    dataStreamObjects.current.forEach(object => {
      if (!(object instanceof THREE.Points)) return;
      
      const positions = (object.geometry.attributes.position as THREE.BufferAttribute).array;
      const speeds = (object.geometry.attributes.speed as THREE.BufferAttribute).array;
      
      for (let i = 0; i < positions.length / 3; i++) {
        // Calculate direction to center
        const x = positions[i * 3];
        const y = positions[i * 3 + 1];
        const z = positions[i * 3 + 2];
        
        const length = Math.sqrt(x * x + y * y + z * z);
        
        // Move towards center
        if (length > 0.1) {
          positions[i * 3] -= (x / length) * delta * (speeds[i] as number);
          positions[i * 3 + 1] -= (y / length) * delta * (speeds[i] as number);
          positions[i * 3 + 2] -= (z / length) * delta * (speeds[i] as number);
        } else {
          // Reset particle to outer sphere when it reaches center
          const radius = 8 + Math.random() * 2;
          const theta = Math.random() * Math.PI * 2;
          const phi = Math.acos(2 * Math.random() - 1);
          
          positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
          positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
          positions[i * 3 + 2] = radius * Math.cos(phi);
        }
      }
      
      // Update geometry
      (object.geometry.attributes.position as THREE.BufferAttribute).needsUpdate = true;
    });
  };
  
  // Theme colors
  const bgColor = currentTheme === 'dark' 
    ? 'bg-black'
    : 'bg-gray-900';
    
  const primaryColor = currentTheme === 'dark' 
    ? '#4080ff' 
    : '#2060e0';
    
  const secondaryColor = currentTheme === 'dark' 
    ? '#60a0ff' 
    : '#40a0ff';
    
  const textColor = currentTheme === 'dark'
    ? 'text-blue-300'
    : 'text-blue-200';
    
  const glowColor = currentTheme === 'dark'
    ? '0 0 20px rgba(96, 165, 250, 0.7), 0 0 40px rgba(96, 165, 250, 0.4)'
    : '0 0 20px rgba(37, 99, 235, 0.7), 0 0 40px rgba(37, 99, 235, 0.4)';
    
  return (
    <motion.div 
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden ${bgColor}`}
      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      ref={containerRef}
    >
      {/* 3D Background */}
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 z-0"
        style={{ position: 'absolute' }}
      />
      
      {/* Interface Overlay */}
      <div className="relative z-10 flex flex-col items-center justify-center w-full max-w-3xl px-4">
        {/* Sci-fi header */}
        <motion.div
          className="mb-6 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <div 
            className={`inline-block px-6 py-3 rounded ${textColor} border border-blue-500/50 font-mono text-sm font-bold tracking-widest`}
            style={{ 
              background: 'rgba(15, 23, 42, 0.7)',
              boxShadow: glowColor
            }}
          >
            {text}
          </div>
        </motion.div>
        
        {/* 3D Animated Profile Photo */}
        <motion.div
          className="mb-10"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          {/* Circular container with high-tech border */}
          <div className="relative">
            {/* Profile photo */}
            <div 
              className="w-32 h-32 rounded-full overflow-hidden border-4 border-blue-600/70"
              style={{ 
                boxShadow: `0 0 15px ${primaryColor}, 0 0 30px ${primaryColor}40`
              }}
            >
              <img 
                src="/assets/profile-photo.jpg" 
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Scanning effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-500/40 to-transparent rounded-full"
              animate={{
                y: ['-100%', '100%'],
              }}
              transition={{
                repeat: Infinity,
                duration: 2,
                ease: "linear"
              }}
              style={{ height: '200%', top: '-50%' }}
            />
            
            {/* Rotating ring */}
            <motion.div
              className="absolute -inset-2 rounded-full border-2 border-dashed border-blue-400/50"
              animate={{ rotate: 360 }}
              transition={{
                repeat: Infinity,
                duration: 20,
                ease: "linear"
              }}
            />
            
            {/* Rotating ring 2 (opposite direction) */}
            <motion.div
              className="absolute -inset-4 rounded-full border border-blue-500/30"
              animate={{ rotate: -360 }}
              transition={{
                repeat: Infinity,
                duration: 15,
                ease: "linear"
              }}
            />
            
            {/* Pulse effect */}
            <motion.div
              className="absolute inset-0 rounded-full"
              animate={{ 
                boxShadow: [
                  `0 0 0 4px ${primaryColor}30`,
                  `0 0 0 8px ${primaryColor}10`,
                  `0 0 0 12px ${primaryColor}05`,
                  `0 0 0 0px ${primaryColor}00`
                ],
                scale: [1, 1.1, 1.2, 1]
              }}
              transition={{
                repeat: Infinity,
                duration: 2.5,
                ease: "easeOut"
              }}
            />
            
            {/* Corner highlight spots */}
            {[45, 135, 225, 315].map((angle, index) => (
              <motion.div
                key={index}
                className="absolute w-3 h-3 rounded-full bg-blue-400"
                style={{
                  left: `calc(50% + ${Math.cos((angle * Math.PI) / 180) * 60}px)`,
                  top: `calc(50% + ${Math.sin((angle * Math.PI) / 180) * 60}px)`,
                  transform: 'translate(-50%, -50%)'
                }}
                animate={{
                  opacity: [0.7, 1, 0.7],
                  boxShadow: [
                    `0 0 5px ${primaryColor}`,
                    `0 0 10px ${primaryColor}`,
                    `0 0 5px ${primaryColor}`
                  ]
                }}
                transition={{
                  repeat: Infinity,
                  duration: 2,
                  delay: index * 0.5
                }}
              />
            ))}
            
            {/* Tech data points */}
            {[0, 60, 120, 180, 240, 300].map((angle, index) => (
              <motion.div
                key={index}
                className="absolute"
                style={{
                  left: `calc(50% + ${Math.cos((angle * Math.PI) / 180) * 75}px)`,
                  top: `calc(50% + ${Math.sin((angle * Math.PI) / 180) * 75}px)`,
                  transform: 'translate(-50%, -50%)'
                }}
                initial={{ opacity: 0 }}
                animate={{
                  opacity: [0, 1, 0]
                }}
                transition={{
                  repeat: Infinity,
                  duration: 2,
                  delay: index * (2 / 6)
                }}
              >
                <div className="text-xs font-mono text-blue-400">
                  {['ID', 'OK', 'SYS', 'SCAN', 'INIT', 'SYNC'][index]}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
        
        {/* Progress section */}
        <motion.div
          className="w-full mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          {/* No loading text */}
          
          {/* Progress bar */}
          {showProgressBar && (
            <div className="h-2 w-full bg-gray-800/70 rounded-sm overflow-hidden border border-blue-900/50">
              <motion.div
                className="h-full"
                style={{
                  background: `linear-gradient(90deg, ${primaryColor}, ${secondaryColor})`,
                  boxShadow: '0 0 10px rgba(96, 165, 250, 0.5)'
                }}
                initial={{ width: '0%' }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          )}
          
          {/* No progress text */}
        </motion.div>
        
        {/* No technical data display */}
      </div>
      
      {/* No bottom text */}
    </motion.div>
  );
}

export default SciFiTechLoadingScreen;