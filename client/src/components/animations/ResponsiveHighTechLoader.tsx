import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { motion } from 'framer-motion';
import { useDeviceType } from '../../utils/responsive';

interface ResponsiveHighTechLoaderProps {
  theme: 'dark' | 'light';
  progress?: number;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  complexity?: 'low' | 'medium' | 'high' | 'ultra';
  color?: string;
  accentColor?: string;
  pulseEffect?: boolean;
  glowEffect?: boolean;
  showProgressText?: boolean;
  loadingText?: string;
  className?: string;
  onComplete?: () => void;
}

/**
 * A responsive high-tech 3D loading animation with theme awareness
 * that scales appropriately for different device sizes
 */
export function ResponsiveHighTechLoader({
  theme = 'dark',
  progress = 0,
  size = 'lg',
  complexity = 'high',
  color = '#3b82f6',
  accentColor,
  pulseEffect = true,
  glowEffect = true,
  showProgressText = true,
  loadingText = 'Loading...',
  className = '',
  onComplete
}: ResponsiveHighTechLoaderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const frameIdRef = useRef<number | null>(null);
  const objectsRef = useRef<THREE.Object3D[]>([]);
  
  // Track if the component is mounted
  const [isMounted, setIsMounted] = useState(false);
  
  // Get device type for responsive adjustments
  const deviceType = useDeviceType();
  
  // Handle completion when progress reaches 100
  useEffect(() => {
    if (progress >= 100 && onComplete) {
      onComplete();
    }
  }, [progress, onComplete]);
  
  // Convert size prop to actual dimensions
  const getDimension = () => {
    const baseSize = {
      sm: 200,
      md: 300,
      lg: 400,
      xl: 500,
      full: '100%'
    }[size];
    
    // Adjust size based on device type
    if (baseSize !== '100%') {
      if (deviceType === 'mobile') {
        return Math.min(baseSize as number, window.innerWidth - 40);
      } else if (deviceType === 'tablet') {
        return Math.min(baseSize as number, window.innerWidth - 80);
      }
    }
    
    return baseSize;
  };
  
  // Get complexity factor to adjust the number of elements
  const getComplexityFactor = () => {
    const baseFactor = {
      low: 0.5,
      medium: 1,
      high: 1.5,
      ultra: 2
    }[complexity];
    
    // Reduce complexity on mobile devices
    if (deviceType === 'mobile') {
      return baseFactor * 0.5;
    } else if (deviceType === 'tablet') {
      return baseFactor * 0.7;
    }
    
    return baseFactor;
  };
  
  // Set up the Three.js scene
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;
    setIsMounted(true);
    
    // Set up Three.js scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    
    // Set up camera
    const aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
    const camera = new THREE.PerspectiveCamera(50, aspect, 0.1, 2000);
    camera.position.z = 20;
    cameraRef.current = camera;
    
    // Set up renderer
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      alpha: true,
      antialias: true
    });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(0x000000, 0);
    rendererRef.current = renderer;
    
    // Add ambient light
    const ambientLight = new THREE.AmbientLight(
      theme === 'dark' ? 0x404040 : 0x909090,
      theme === 'dark' ? 0.5 : 0.8
    );
    scene.add(ambientLight);
    
    // Add directional light
    const mainLight = new THREE.DirectionalLight(
      theme === 'dark' ? 0xffffff : 0xf0f0f0,
      theme === 'dark' ? 1.0 : 0.8
    );
    mainLight.position.set(1, 1, 1);
    scene.add(mainLight);
    
    // Add spotlight for emphasis
    const spotlight = new THREE.SpotLight(
      new THREE.Color(color).getHex(),
      1.5,
      100,
      Math.PI / 6,
      0.5,
      1
    );
    spotlight.position.set(0, 15, 15);
    spotlight.lookAt(0, 0, 0);
    scene.add(spotlight);
    
    // Create the loading animation elements
    createLoadingAnimation(scene);
    
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
    
    // Start animation loop
    const animate = () => {
      if (!sceneRef.current || !cameraRef.current || !rendererRef.current) return;
      
      // Update animation
      updateAnimation();
      
      // Render scene
      rendererRef.current.render(sceneRef.current, cameraRef.current);
      
      // Continue animation loop
      frameIdRef.current = requestAnimationFrame(animate);
    };
    
    animate();
    
    // Clean up function
    return () => {
      window.removeEventListener('resize', handleResize);
      
      if (frameIdRef.current) {
        cancelAnimationFrame(frameIdRef.current);
      }
      
      // Dispose all Three.js objects
      objectsRef.current.forEach(object => {
        if ('geometry' in object && (object as THREE.Mesh).geometry) {
          (object as THREE.Mesh).geometry.dispose();
        }
        
        if ('material' in object && (object as THREE.Mesh).material) {
          const material = (object as THREE.Mesh).material;
          if (Array.isArray(material)) {
            material.forEach(m => m.dispose());
          } else {
            material.dispose();
          }
        }
      });
      
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
      
      objectsRef.current = [];
      setIsMounted(false);
    };
  }, [theme, color, deviceType, complexity]);
  
  // Create loading animation elements
  const createLoadingAnimation = (scene: THREE.Scene) => {
    // Get parameters based on complexity
    const complexityFactor = getComplexityFactor();
    
    // Clear any existing objects
    objectsRef.current.forEach(obj => scene.remove(obj));
    objectsRef.current = [];
    
    // Create central sphere
    createCentralSphere(scene, complexityFactor);
    
    // Create orbital rings
    createOrbitalRings(scene, complexityFactor);
    
    // Create particle system
    createParticleSystem(scene, complexityFactor);
    
    // Create progress indicator
    createProgressIndicator(scene);
    
    // Create holographic elements
    if (theme === 'dark') {
      createHolographicElements(scene, complexityFactor);
    }
    
    // Create glowing elements
    if (glowEffect) {
      createGlowingElements(scene, complexityFactor);
    }
  };
  
  // Create central sphere (core of the animation)
  const createCentralSphere = (scene: THREE.Scene, complexityFactor: number) => {
    // Core geometry - dodecahedron for more tech look
    const coreGeometry = new THREE.DodecahedronGeometry(2, 2);
    
    // Material based on theme
    const coreMaterial = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(color),
      metalness: theme === 'dark' ? 0.8 : 0.6,
      roughness: theme === 'dark' ? 0.2 : 0.3,
      emissive: new THREE.Color(color).multiplyScalar(0.4),
      clearcoat: 1.0,
      clearcoatRoughness: 0.4,
      wireframe: false
    });
    
    const core = new THREE.Mesh(coreGeometry, coreMaterial);
    
    // Add animation data
    (core as any).userData = {
      rotationSpeed: {
        x: 0.003,
        y: 0.005,
        z: 0.002
      },
      pulseSpeed: 0.2,
      originalScale: 1.0
    };
    
    scene.add(core);
    objectsRef.current.push(core);
    
    // Add wireframe overlay for tech effect
    const wireframeMaterial = new THREE.MeshBasicMaterial({
      color: new THREE.Color(accentColor || color).multiplyScalar(1.5),
      wireframe: true,
      transparent: true,
      opacity: 0.3
    });
    
    const wireframe = new THREE.Mesh(coreGeometry, wireframeMaterial);
    wireframe.scale.multiplyScalar(1.05);
    
    (wireframe as any).userData = {
      rotationSpeed: {
        x: -0.002,
        y: 0.004,
        z: -0.001
      },
      pulseSpeed: 0.3,
      originalScale: 1.05
    };
    
    scene.add(wireframe);
    objectsRef.current.push(wireframe);
    
    // Add energy spikes coming out of the core
    const spikeCount = Math.round(5 * complexityFactor);
    for (let i = 0; i < spikeCount; i++) {
      const height = 2 + Math.random() * 3;
      const spikeGeometry = new THREE.ConeGeometry(0.2, height, 4);
      
      const spikeMaterial = new THREE.MeshBasicMaterial({
        color: new THREE.Color(accentColor || color),
        transparent: true,
        opacity: 0.7
      });
      
      const spike = new THREE.Mesh(spikeGeometry, spikeMaterial);
      
      // Position spike radially around sphere
      const angle = (i / spikeCount) * Math.PI * 2;
      const radius = 2;
      
      spike.position.set(
        Math.cos(angle) * radius,
        Math.sin(angle) * radius,
        0
      );
      
      // Make spike point outward
      spike.lookAt(
        spike.position.x * 2,
        spike.position.y * 2,
        spike.position.z * 2
      );
      
      (spike as any).userData = {
        pulseSpeed: 0.1 + Math.random() * 0.2,
        originalOpacity: 0.7,
        originalScale: 1.0
      };
      
      scene.add(spike);
      objectsRef.current.push(spike);
    }
  };
  
  // Create orbital rings with tech elements
  const createOrbitalRings = (scene: THREE.Scene, complexityFactor: number) => {
    // Get ring count based on complexity
    const ringCount = Math.round(2 * complexityFactor);
    
    for (let i = 0; i < ringCount; i++) {
      // Create ring
      const radius = 4 + i * 2;
      const thickness = 0.1;
      const segments = Math.max(32, Math.floor(64 * complexityFactor));
      
      const ringGeometry = new THREE.TorusGeometry(radius, thickness, 6, segments);
      const ringMaterial = new THREE.MeshPhongMaterial({
        color: new THREE.Color(color),
        emissive: new THREE.Color(color).multiplyScalar(0.2),
        transparent: true,
        opacity: 0.5,
        shininess: 80
      });
      
      const ring = new THREE.Mesh(ringGeometry, ringMaterial);
      
      // Tilt each ring in a different direction
      ring.rotation.x = Math.PI / 2;
      ring.rotation.y = Math.random() * Math.PI;
      
      (ring as any).userData = {
        rotationSpeed: {
          x: 0.001 * (i % 2 === 0 ? 1 : -1),
          y: 0.002 * (i % 2 === 0 ? -1 : 1),
          z: 0.001 * (i % 3 === 0 ? 1 : -1)
        },
        pulseSpeed: 0.05 + (i * 0.02),
        originalOpacity: 0.5
      };
      
      scene.add(ring);
      objectsRef.current.push(ring);
      
      // Add data nodes along the ring
      const nodeCount = Math.max(4, Math.floor(8 * complexityFactor));
      for (let j = 0; j < nodeCount; j++) {
        const nodeSize = 0.3;
        const nodeGeometry = new THREE.SphereGeometry(nodeSize, 8, 8);
        const nodeMaterial = new THREE.MeshPhongMaterial({
          color: new THREE.Color(accentColor || color),
          emissive: new THREE.Color(accentColor || color).multiplyScalar(0.5),
          shininess: 80
        });
        
        const node = new THREE.Mesh(nodeGeometry, nodeMaterial);
        
        // Position node on the ring
        const angle = (j / nodeCount) * Math.PI * 2;
        node.position.set(
          ring.position.x + radius * Math.cos(angle),
          ring.position.y,
          ring.position.z + radius * Math.sin(angle)
        );
        
        // Rotate ring rotation to node position
        const nodePosition = new THREE.Vector3();
        node.getWorldPosition(nodePosition);
        
        (node as any).userData = {
          pulseSpeed: 0.3 + Math.random() * 0.5,
          originalScale: 1.0,
          orbit: {
            center: new THREE.Vector3(0, 0, 0),
            radius: radius,
            speed: 0.2 + j * 0.05,
            angle: angle,
            ringIndex: i
          }
        };
        
        scene.add(node);
        objectsRef.current.push(node);
      }
    }
  };
  
  // Create particle system
  const createParticleSystem = (scene: THREE.Scene, complexityFactor: number) => {
    // Number of particles based on complexity
    const particleCount = Math.floor(200 * complexityFactor);
    
    // Create particle geometry
    const particlesGeometry = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleSizes = new Float32Array(particleCount);
    const particleColors = new Float32Array(particleCount * 3);
    
    const mainColor = new THREE.Color(color);
    const secondColor = accentColor 
      ? new THREE.Color(accentColor)
      : new THREE.Color(color).offsetHSL(0.1, 0, 0);
    
    for (let i = 0; i < particleCount; i++) {
      // Random position in sphere
      const radius = 6 + Math.random() * 10;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      
      particlePositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      particlePositions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      particlePositions[i * 3 + 2] = radius * Math.cos(phi);
      
      // Random size, smaller on mobile for better performance
      particleSizes[i] = deviceType === 'mobile' 
        ? 0.05 + Math.random() * 0.1
        : 0.1 + Math.random() * 0.2;
      
      // Alternate between main and accent color
      const useMainColor = Math.random() > 0.5;
      const color = useMainColor ? mainColor : secondColor;
      
      particleColors[i * 3] = color.r;
      particleColors[i * 3 + 1] = color.g;
      particleColors[i * 3 + 2] = color.b;
    }
    
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    particlesGeometry.setAttribute('size', new THREE.BufferAttribute(particleSizes, 1));
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));
    
    // Create shader material
    const particlesMaterial = new THREE.ShaderMaterial({
      uniforms: {
        pointTexture: { value: new THREE.TextureLoader().load('/assets/particle.png') },
        time: { value: 0.0 }
      },
      vertexShader: `
        attribute float size;
        varying vec3 vColor;
        uniform float time;
        
        void main() {
          // Get color from the existing color attribute
          vColor = color;
          
          // Simple animation
          vec3 pos = position;
          pos.x += sin(time * 0.5 + position.z * 0.1) * 0.2;
          pos.y += cos(time * 0.6 + position.x * 0.1) * 0.2;
          pos.z += sin(time * 0.7 + position.y * 0.1) * 0.2;
          
          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          gl_PointSize = size * (300.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform sampler2D pointTexture;
        varying vec3 vColor;
        
        void main() {
          gl_FragColor = vec4(vColor, 1.0) * texture2D(pointTexture, gl_PointCoord);
        }
      `,
      blending: THREE.AdditiveBlending,
      depthTest: false,
      transparent: true,
      vertexColors: true
    });
    
    const particles = new THREE.Points(particlesGeometry, particlesMaterial);
    (particles as any).userData = { time: 0 };
    
    scene.add(particles);
    objectsRef.current.push(particles);
    
    // Add data connections between particles
    const connectionCount = Math.floor(20 * complexityFactor);
    const connectionsGroup = new THREE.Group();
    
    for (let i = 0; i < connectionCount; i++) {
      // Pick two random particles to connect
      const index1 = Math.floor(Math.random() * particleCount);
      const index2 = Math.floor(Math.random() * particleCount);
      
      const point1 = new THREE.Vector3(
        particlePositions[index1 * 3],
        particlePositions[index1 * 3 + 1],
        particlePositions[index1 * 3 + 2]
      );
      
      const point2 = new THREE.Vector3(
        particlePositions[index2 * 3],
        particlePositions[index2 * 3 + 1],
        particlePositions[index2 * 3 + 2]
      );
      
      // Only create connection if points are not too far
      if (point1.distanceTo(point2) < 7) {
        const lineGeometry = new THREE.BufferGeometry().setFromPoints([point1, point2]);
        const lineMaterial = new THREE.LineBasicMaterial({
          color: new THREE.Color(color),
          transparent: true,
          opacity: 0.3
        });
        
        const line = new THREE.Line(lineGeometry, lineMaterial);
        
        (line as any).userData = {
          particleIndices: [index1, index2],
          pulseSpeed: 0.5 + Math.random() * 0.5,
          originalOpacity: 0.3
        };
        
        connectionsGroup.add(line);
        objectsRef.current.push(line);
      }
    }
    
    scene.add(connectionsGroup);
  };
  
  // Create progress indicator
  const createProgressIndicator = (scene: THREE.Scene) => {
    // Create progress ring
    const ringRadius = 3;
    const thickness = 0.2;
    const arcLength = Math.PI * 2; // Full circle
    
    const ringGeometry = new THREE.TorusGeometry(ringRadius, thickness, 8, 64);
    const baseMaterial = new THREE.MeshBasicMaterial({
      color: theme === 'dark' ? 0x444444 : 0xCCCCCC,
      transparent: true,
      opacity: 0.3
    });
    
    const progressMaterial = new THREE.MeshPhongMaterial({
      color: new THREE.Color(color),
      emissive: new THREE.Color(color).multiplyScalar(0.5),
      transparent: true
    });
    
    // Base ring (background)
    const baseRing = new THREE.Mesh(ringGeometry, baseMaterial);
    baseRing.rotation.x = Math.PI / 2;
    baseRing.position.z = -3;
    
    (baseRing as any).userData = {
      type: 'progress-background'
    };
    
    scene.add(baseRing);
    objectsRef.current.push(baseRing);
    
    // Progress ring (foreground)
    const progressRing = new THREE.Mesh(ringGeometry, progressMaterial);
    progressRing.rotation.x = Math.PI / 2;
    progressRing.position.z = -3;
    progressRing.scale.set(1, 1, 1);
    
    // Add custom progress shader
    (progressRing as any).userData = {
      type: 'progress-indicator',
      progress: progress
    };
    
    scene.add(progressRing);
    objectsRef.current.push(progressRing);
  };
  
  // Create holographic elements
  const createHolographicElements = (scene: THREE.Scene, complexityFactor: number) => {
    // Create holographic scan line
    const scanHeight = 10;
    const scanWidth = 10;
    const scanGeometry = new THREE.PlaneGeometry(scanWidth, 0.05);
    const scanMaterial = new THREE.MeshBasicMaterial({
      color: new THREE.Color(color),
      transparent: true,
      opacity: 0.3,
      side: THREE.DoubleSide
    });
    
    const scanLine = new THREE.Mesh(scanGeometry, scanMaterial);
    scanLine.position.z = 0;
    
    (scanLine as any).userData = {
      scanSpeed: 0.05,
      scanRange: {
        min: -scanHeight / 2,
        max: scanHeight / 2
      },
      originalY: 0
    };
    
    scene.add(scanLine);
    objectsRef.current.push(scanLine);
    
    // Add holographic grid if complexity is high enough
    if (complexityFactor > 1) {
      const gridSize = 20;
      const gridDivisions = Math.floor(10 * complexityFactor);
      const gridColor = new THREE.Color(color).multiplyScalar(0.5);
      
      const grid = new THREE.GridHelper(gridSize, gridDivisions, gridColor, gridColor);
      grid.position.y = -5;
      
      (grid as any).userData = {
        pulseSpeed: 0.1,
        originalOpacity: 0.2
      };
      
      // Make grid partially transparent
      if ((grid.material as THREE.Material).opacity !== undefined) {
        (grid.material as THREE.Material).transparent = true;
        (grid.material as THREE.Material).opacity = 0.2;
      } else if (Array.isArray(grid.material)) {
        grid.material.forEach(mat => {
          mat.transparent = true;
          mat.opacity = 0.2;
        });
      }
      
      scene.add(grid);
      objectsRef.current.push(grid);
    }
    
    // Add floating data panels
    const panelCount = Math.floor(3 * complexityFactor);
    
    for (let i = 0; i < panelCount; i++) {
      const width = 1 + Math.random() * 2;
      const height = 0.6 + Math.random() * 1;
      
      const panelGeometry = new THREE.PlaneGeometry(width, height);
      const panelMaterial = new THREE.MeshBasicMaterial({
        color: new THREE.Color(accentColor || color),
        transparent: true,
        opacity: 0.2,
        side: THREE.DoubleSide
      });
      
      const panel = new THREE.Mesh(panelGeometry, panelMaterial);
      
      // Position panel randomly around the center
      const radius = 6 + Math.random() * 4;
      const angle = Math.random() * Math.PI * 2;
      const height_pos = Math.random() * 6 - 3;
      
      panel.position.set(
        Math.cos(angle) * radius,
        height_pos,
        Math.sin(angle) * radius
      );
      
      // Make panel face the center
      panel.lookAt(0, panel.position.y, 0);
      
      // Animation parameters
      (panel as any).userData = {
        pulseSpeed: 0.2 + Math.random() * 0.3,
        originalOpacity: 0.2 + Math.random() * 0.1,
        floating: {
          speed: 0.2 + Math.random() * 0.3,
          amplitude: 0.2 + Math.random() * 0.3,
          originalY: panel.position.y
        },
        glitchEffect: {
          interval: 2000 + Math.random() * 4000,
          lastGlitch: 0
        }
      };
      
      scene.add(panel);
      objectsRef.current.push(panel);
    }
  };
  
  // Create glowing elements
  const createGlowingElements = (scene: THREE.Scene, complexityFactor: number) => {
    // Create a glow sphere around the central core
    const glowRadius = 2.5;
    const glowGeometry = new THREE.SphereGeometry(glowRadius, 32, 32);
    const glowMaterial = new THREE.ShaderMaterial({
      uniforms: {
        color: { value: new THREE.Color(color) },
        viewVector: { value: new THREE.Vector3(0, 0, 20) }
      },
      vertexShader: `
        uniform vec3 viewVector;
        varying float intensity;
        void main() {
          vec3 vNormal = normalize(normalMatrix * normal);
          vec3 vNormel = normalize(normalMatrix * viewVector);
          intensity = pow(0.6 - dot(vNormal, vNormel), 4.0);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 color;
        varying float intensity;
        void main() {
          gl_FragColor = vec4(color, 1.0) * intensity;
        }
      `,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      transparent: true
    });
    
    const glowSphere = new THREE.Mesh(glowGeometry, glowMaterial);
    
    (glowSphere as any).userData = {
      type: 'glow',
      viewVector: new THREE.Vector3(0, 0, 20),
      pulseSpeed: 0.1
    };
    
    scene.add(glowSphere);
    objectsRef.current.push(glowSphere);
    
    // Create energy beams connecting to the core
    const beamCount = Math.floor(4 * complexityFactor);
    
    for (let i = 0; i < beamCount; i++) {
      const beamLength = 5 + Math.random() * 5;
      const beamGeometry = new THREE.CylinderGeometry(0.05, 0.05, beamLength, 8);
      const beamMaterial = new THREE.MeshBasicMaterial({
        color: new THREE.Color(accentColor || color),
        transparent: true,
        opacity: 0.3
      });
      
      const beam = new THREE.Mesh(beamGeometry, beamMaterial);
      
      // Position beam with one end at origin
      const angle = (i / beamCount) * Math.PI * 2;
      const radius = beamLength / 2;
      
      beam.position.set(
        Math.cos(angle) * radius,
        Math.sin(angle) * (radius / 2), // Flatten the distribution vertically
        Math.sin(angle * 2) * radius // Add some depth variation
      );
      
      // Rotate beam to point toward origin
      beam.lookAt(0, 0, 0);
      // Adjust for cylinder's default orientation
      beam.rotateX(Math.PI / 2);
      
      (beam as any).userData = {
        pulseSpeed: 0.5 + Math.random() * 0.5,
        originalOpacity: 0.3,
        originalScale: 1.0
      };
      
      scene.add(beam);
      objectsRef.current.push(beam);
    }
  };
  
  // Update animation on each frame
  const updateAnimation = () => {
    if (!objectsRef.current) return;
    
    const time = Date.now() * 0.001; // Convert to seconds
    
    // Update all objects
    objectsRef.current.forEach(object => {
      const userData = (object as any).userData;
      if (!userData) return;
      
      // Update rotation
      if (userData.rotationSpeed) {
        object.rotation.x += userData.rotationSpeed.x;
        object.rotation.y += userData.rotationSpeed.y;
        object.rotation.z += userData.rotationSpeed.z;
      }
      
      // Update pulse effect
      if (pulseEffect && userData.pulseSpeed !== undefined) {
        if (userData.originalScale !== undefined) {
          const scale = userData.originalScale + Math.sin(time * userData.pulseSpeed) * 0.1;
          object.scale.set(scale, scale, scale);
        }
        
        if (userData.originalOpacity !== undefined && 'material' in object) {
          const material = (object as THREE.Mesh).material;
          if (!Array.isArray(material) && material.opacity !== undefined) {
            material.opacity = userData.originalOpacity + Math.sin(time * userData.pulseSpeed) * 0.1;
          }
        }
      }
      
      // Update scanner position
      if (userData.scanRange) {
        object.position.y = 
          userData.scanRange.min + 
          (Math.sin(time * userData.scanSpeed) + 1) / 2 * 
          (userData.scanRange.max - userData.scanRange.min);
      }
      
      // Update floating animation
      if (userData.floating) {
        object.position.y = userData.floating.originalY + 
          Math.sin(time * userData.floating.speed) * userData.floating.amplitude;
      }
      
      // Update glitching effect
      if (userData.glitchEffect) {
        const currentTime = Date.now();
        
        if (currentTime - userData.glitchEffect.lastGlitch > userData.glitchEffect.interval) {
          userData.glitchEffect.lastGlitch = currentTime;
          
          // Apply random transformations for glitch effect
          if (Math.random() > 0.5) {
            object.visible = !object.visible;
            
            // Add a timeout to restore visibility
            setTimeout(() => {
              if (object && userData) {
                object.visible = true;
              }
            }, 200);
          }
        }
      }
      
      // Update orbital animation
      if (userData.orbit) {
        userData.orbit.angle += 0.01 * userData.orbit.speed;
        
        // Calculate new position based on orbit
        const ringRotation = objectsRef.current[userData.orbit.ringIndex].rotation;
        
        // Apply the ring's rotation to the orbital calculation
        const radius = userData.orbit.radius;
        const angle = userData.orbit.angle;
        
        // Calculate base position in XZ plane
        const baseX = radius * Math.cos(angle);
        const baseZ = radius * Math.sin(angle);
        
        // Apply ring rotation
        const rotatedX = baseX * Math.cos(ringRotation.y) - baseZ * Math.sin(ringRotation.y);
        const rotatedZ = baseX * Math.sin(ringRotation.y) + baseZ * Math.cos(ringRotation.y);
        
        // Set position
        object.position.set(rotatedX, 0, rotatedZ);
      }
      
      // Update particle system
      if (userData.time !== undefined && object instanceof THREE.Points) {
        userData.time = time;
        const material = object.material as THREE.ShaderMaterial;
        if (material.uniforms && material.uniforms.time) {
          material.uniforms.time.value = time;
        }
      }
      
      // Update glow effect
      if (userData.type === 'glow' && userData.viewVector && cameraRef.current) {
        userData.viewVector.copy(cameraRef.current.position).sub(object.position);
        if (object.material && (object.material as THREE.ShaderMaterial).uniforms) {
          (object.material as THREE.ShaderMaterial).uniforms.viewVector.value = userData.viewVector;
        }
      }
      
      // Update progress indicator
      if (userData.type === 'progress-indicator') {
        userData.progress = progress;
        
        // Create mask effect by scaling only in one direction
        object.scale.x = progress / 100;
        // Move pivot to left side
        object.position.x = -1.5 * (1 - progress / 100);
      }
    });
  };
  
  // Calculate dimensions for responsive sizing
  const containerSize = getDimension();
  const containerSizeStyle = typeof containerSize === 'string' 
    ? containerSize 
    : `${containerSize}px`;
  
  return (
    <div 
      className={`relative ${className}`}
      style={{ 
        width: containerSizeStyle, 
        height: containerSizeStyle,
        overflow: 'hidden'
      }}
      ref={containerRef}
    >
      {/* 3D canvas for animations */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
      />
      
      {/* Optional overlay for progress text */}
      {showProgressText && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none">
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className={`text-center ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}
          >
            <div className="text-lg font-medium mb-2">{loadingText}</div>
            <div className="text-2xl font-bold">{Math.round(progress)}%</div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

export default ResponsiveHighTechLoader;