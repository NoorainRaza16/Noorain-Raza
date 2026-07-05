import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { motion } from 'framer-motion';

interface AdvancedTechLoadingProps {
  onComplete?: () => void;
  duration?: number;
  color?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showText?: boolean;
  text?: string;
  complexity?: 'low' | 'medium' | 'high' | 'ultra';
  variation?: 'futuristic' | 'holographic' | 'neon' | 'dataflow';
  interactive?: boolean;
  logoText?: string;
}

/**
 * An enhanced 3D tech loading animation component with advanced effects
 * 
 * @example
 * <AdvancedTechLoading 
 *   onComplete={() => setIsLoaded(true)} 
 *   duration={3000}
 *   color="#60a5fa"
 *   size="lg"
 *   complexity="high"
 *   variation="futuristic"
 *   interactive={true}
 *   logoText="NR"
 * />
 */
export function AdvancedTechLoading({
  onComplete,
  duration = 3000,
  color = '#60a5fa',
  size = 'lg',
  className = '',
  showText = true,
  text = 'Loading...',
  complexity = 'high',
  variation = 'futuristic',
  interactive = true,
  logoText
}: AdvancedTechLoadingProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const objectsRef = useRef<THREE.Object3D[]>([]);
  const frameIdRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const [progress, setProgress] = useState(0);
  const [isInteracting, setIsInteracting] = useState(false);
  const mouseRef = useRef<{x: number, y: number}>({ x: 0, y: 0 });
  
  // Size mapping with additional XL size
  const sizeDimensions = {
    sm: { width: 100, height: 100 },
    md: { width: 160, height: 160 },
    lg: { width: 220, height: 220 },
    xl: { width: 300, height: 300 }
  };
  
  const { width, height } = sizeDimensions[size];
  
  // Complexity settings that affect particle count and detail level
  const complexitySettings = {
    low: { particleCount: 30, geometryDetail: 1, effectIntensity: 0.5 },
    medium: { particleCount: 60, geometryDetail: 2, effectIntensity: 0.8 },
    high: { particleCount: 100, geometryDetail: 3, effectIntensity: 1 },
    ultra: { particleCount: 160, geometryDetail: 4, effectIntensity: 1.2 }
  };
  
  const settings = complexitySettings[complexity];
  
  useEffect(() => {
    // Initialize Three.js scene
    const initialize = () => {
      if (!containerRef.current || !canvasRef.current) return;
      
      // Create scene with higher sophistication
      const scene = new THREE.Scene();
      sceneRef.current = scene;
      
      // Advanced fog effect for depth
      if (variation === 'futuristic' || variation === 'neon') {
        const fogColor = new THREE.Color(color).offsetHSL(0, -0.8, -0.7);
        scene.fog = new THREE.FogExp2(fogColor.getHex(), 0.035);
      }
      
      // Create advanced camera with more dynamic properties
      const aspectRatio = width / height;
      const camera = new THREE.PerspectiveCamera(70, aspectRatio, 0.1, 1000);
      camera.position.z = 7;
      cameraRef.current = camera;
      
      // Create high-quality renderer
      const renderer = new THREE.WebGLRenderer({ 
        canvas: canvasRef.current,
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setClearColor(0x000000, 0);
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      rendererRef.current = renderer;
      
      // Enhanced lighting setup based on variation
      setupLighting(scene, variation);
      
      // Create 3D objects based on selected variation
      switch (variation) {
        case 'holographic':
          createHolographicObjects(scene);
          break;
        case 'neon':
          createNeonObjects(scene);
          break;
        case 'dataflow':
          createDataFlowObjects(scene);
          break;
        case 'futuristic':
        default:
          createFuturisticObjects(scene);
          break;
      }
      
      // Add logo text if provided
      if (logoText) {
        addLogoText(scene, logoText);
      }
      
      // Start animation
      startTimeRef.current = Date.now();
      animate();
    };
    
    // Setup advanced lighting based on selected variation
    const setupLighting = (scene: THREE.Scene, variation: string) => {
      // Base lights that all variations need
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
      scene.add(ambientLight);
      
      // Custom lighting based on variation
      switch (variation) {
        case 'holographic': {
          // Soft, diffused lighting for holographic effect
          const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x000000, 0.6);
          scene.add(hemisphereLight);
          
          // Rim lighting to emphasize edges
          const backLight = new THREE.DirectionalLight(0xffffff, 0.5);
          backLight.position.set(-5, 5, -5);
          scene.add(backLight);
          
          // Main light with shadows
          const mainLight = new THREE.DirectionalLight(0xffffff, 1);
          mainLight.position.set(5, 10, 7.5);
          mainLight.castShadow = true;
          mainLight.shadow.mapSize.width = 1024;
          mainLight.shadow.mapSize.height = 1024;
          scene.add(mainLight);
          break;
        }
        
        case 'neon': {
          // Multiple colored point lights for neon effect
          const mainColor = new THREE.Color(color);
          const complementaryColor = mainColor.clone().offsetHSL(0.5, 0, 0);
          
          const neonLight1 = new THREE.PointLight(mainColor, 1, 10);
          neonLight1.position.set(3, 2, 3);
          scene.add(neonLight1);
          
          const neonLight2 = new THREE.PointLight(complementaryColor, 1, 10);
          neonLight2.position.set(-3, -2, 3);
          scene.add(neonLight2);
          
          // Spotlight for dramatic shadows
          const spotlight = new THREE.SpotLight(0xffffff, 1);
          spotlight.position.set(0, 10, 10);
          spotlight.angle = Math.PI / 6;
          spotlight.penumbra = 0.3;
          spotlight.castShadow = true;
          scene.add(spotlight);
          break;
        }
        
        case 'dataflow': {
          // Subtle ambient and directional for data visualization
          const hemisphereLight = new THREE.HemisphereLight(0xaaaaff, 0x000033, 0.5);
          scene.add(hemisphereLight);
          
          // Main directional light
          const mainLight = new THREE.DirectionalLight(0xffffff, 0.8);
          mainLight.position.set(1, 1, 1);
          scene.add(mainLight);
          
          // Add multiple small point lights for data nodes
          for (let i = 0; i < 5; i++) {
            const intensity = 0.7 + Math.random() * 0.3;
            const distance = 6 + Math.random() * 4;
            const nodeLight = new THREE.PointLight(0xaaffff, intensity, distance);
            const angle = Math.random() * Math.PI * 2;
            const radius = 3 + Math.random() * 2;
            nodeLight.position.set(
              Math.cos(angle) * radius,
              Math.sin(angle) * radius,
              Math.random() * 2 - 1
            );
            scene.add(nodeLight);
            
            // Store for animation
            (nodeLight as any).userData = {
              basePosition: nodeLight.position.clone(),
              speed: 0.005 + Math.random() * 0.01,
              amplitude: 0.5 + Math.random() * 0.5,
              phase: Math.random() * Math.PI * 2
            };
            
            objectsRef.current.push(nodeLight);
          }
          break;
        }
        
        case 'futuristic':
        default: {
          // Sophisticated lighting setup for futuristic tech look
          const mainColor = new THREE.Color(color);
          
          // Key light
          const keyLight = new THREE.DirectionalLight(0xffffff, 0.7);
          keyLight.position.set(5, 5, 5);
          keyLight.castShadow = true;
          scene.add(keyLight);
          
          // Fill light
          const fillLight = new THREE.DirectionalLight(0xffffff, 0.3);
          fillLight.position.set(-5, -2, 8);
          scene.add(fillLight);
          
          // Rim light with slight hue shift
          const rimColor = mainColor.clone().offsetHSL(0.1, 0, 0.2);
          const rimLight = new THREE.DirectionalLight(rimColor.getHex(), 0.5);
          rimLight.position.set(0, 0, -10);
          scene.add(rimLight);
          
          // Center point light with color
          const centerLight = new THREE.PointLight(mainColor.getHex(), 1, 10);
          centerLight.position.set(0, 0, 2);
          scene.add(centerLight);
          
          // Store for animation
          (centerLight as any).userData = {
            originalIntensity: centerLight.intensity,
            pulseSpeed: 0.003
          };
          
          objectsRef.current.push(centerLight);
          break;
        }
      }
    };
    
    // Create futuristic tech objects
    const createFuturisticObjects = (scene: THREE.Scene) => {
      const mainColor = new THREE.Color(color);
      const accentColor = mainColor.clone().offsetHSL(0.1, 0, 0.2);
      const glowColor = mainColor.clone().offsetHSL(0, -0.1, 0.3);
      
      // Enhanced materials with advanced shading
      const materials = [
        // High-tech metallic material
        new THREE.MeshPhysicalMaterial({ 
          color: mainColor,
          metalness: 0.9,
          roughness: 0.1,
          clearcoat: 1.0,
          clearcoatRoughness: 0.1,
          reflectivity: 1.0,
          envMapIntensity: 1.5
        }),
        // Holographic circuit-like material
        new THREE.MeshPhysicalMaterial({
          color: accentColor,
          metalness: 0.7,
          roughness: 0.2,
          clearcoat: 0.5,
          transmission: 0.2,
          transparent: true,
          opacity: 0.8
        }),
        // Glowing edge material
        new THREE.MeshStandardMaterial({
          color: glowColor,
          emissive: glowColor,
          emissiveIntensity: 0.8,
          metalness: 0.5,
          roughness: 0.3,
        }),
        // Wireframe overlay
        new THREE.MeshBasicMaterial({
          color: mainColor.clone().offsetHSL(0.05, 0, 0.5),
          wireframe: true,
          transparent: true,
          opacity: 0.4
        })
      ];
      
      // Create a central complex geometric shape (core)
      const coreGroup = new THREE.Group();
      scene.add(coreGroup);
      
      // Central dodecahedron as the core
      const coreGeometry = new THREE.DodecahedronGeometry(1.2, settings.geometryDetail);
      const core = new THREE.Mesh(coreGeometry, materials[0]);
      coreGroup.add(core);
      
      // Add wireframe overlay to the core
      const coreWire = new THREE.Mesh(
        new THREE.DodecahedronGeometry(1.3, settings.geometryDetail),
        materials[3]
      );
      coreGroup.add(coreWire);
      
      // Add glowing elements around the core
      const glowRingGeometry = new THREE.TorusGeometry(1.8, 0.05, 16, 60);
      const glowRing1 = new THREE.Mesh(glowRingGeometry, materials[2]);
      glowRing1.rotation.x = Math.PI / 2;
      coreGroup.add(glowRing1);
      
      const glowRing2 = new THREE.Mesh(glowRingGeometry, materials[2]);
      glowRing2.rotation.y = Math.PI / 2;
      coreGroup.add(glowRing2);
      
      // Add orbiting satellites around the core
      const satelliteCount = 3;
      const satelliteGroup = new THREE.Group();
      coreGroup.add(satelliteGroup);
      
      for (let i = 0; i < satelliteCount; i++) {
        const satelliteGeometry = new THREE.OctahedronGeometry(0.4, settings.geometryDetail);
        const satellite = new THREE.Mesh(satelliteGeometry, materials[1]);
        
        // Position satellites in orbit
        const angle = (i / satelliteCount) * Math.PI * 2;
        const orbitRadius = 2.5;
        satellite.position.set(
          Math.cos(angle) * orbitRadius,
          Math.sin(angle) * orbitRadius * 0.5,
          Math.sin(angle) * Math.cos(angle) * orbitRadius
        );
        
        // Store orbit data for animation
        (satellite as any).userData = {
          orbitRadius: orbitRadius,
          orbitSpeed: 0.001 * (i + 1),
          initialAngle: angle,
          pulseSpeed: 0.01 + (i * 0.005)
        };
        
        satelliteGroup.add(satellite);
        objectsRef.current.push(satellite);
        
        // Add connecting beams between core and satellites
        const beamGeometry = new THREE.CylinderGeometry(0.03, 0.03, orbitRadius, 8);
        beamGeometry.rotateX(Math.PI / 2);
        
        const beam = new THREE.Mesh(
          beamGeometry,
          new THREE.MeshBasicMaterial({
            color: glowColor,
            transparent: true,
            opacity: 0.3
          })
        );
        
        // Position and orient the beam to connect core and satellite
        beam.position.copy(satellite.position.clone().multiplyScalar(0.5));
        beam.lookAt(0, 0, 0);
        
        (beam as any).userData = {
          target: satellite,
          corePosition: new THREE.Vector3(0, 0, 0)
        };
        
        satelliteGroup.add(beam);
        objectsRef.current.push(beam);
      }
      
      // Add floating particles around the entire structure
      const particleCount = settings.particleCount;
      const particleGeometry = new THREE.SphereGeometry(0.06, 8, 8);
      
      for (let i = 0; i < particleCount; i++) {
        const particleMaterial = new THREE.MeshBasicMaterial({
          color: i % 3 === 0 ? mainColor : i % 3 === 1 ? accentColor : glowColor,
          transparent: true,
          opacity: 0.7
        });
        
        const particle = new THREE.Mesh(particleGeometry, particleMaterial);
        
        // Create complex 3D orbital paths
        const radius = 2.5 + Math.random() * 2;
        const angle = Math.random() * Math.PI * 2;
        const height = (Math.random() - 0.5) * 4;
        
        particle.position.set(
          Math.cos(angle) * radius,
          height,
          Math.sin(angle) * radius
        );
        
        // Scale particles randomly for varied appearance
        const scale = Math.random() * 0.6 + 0.2;
        particle.scale.set(scale, scale, scale);
        
        // Store initial position and animation parameters
        (particle as any).userData = {
          orbitRadius: radius,
          orbitSpeed: 0.001 + Math.random() * 0.003,
          initialAngle: angle,
          height: height,
          pulseSpeed: 0.01 + Math.random() * 0.02,
          originalScale: scale,
          wobbleFrequency: 0.5 + Math.random() * 2,
          wobbleAmplitude: 0.2 + Math.random() * 0.5
        };
        
        scene.add(particle);
        objectsRef.current.push(particle);
      }
      
      // Add the central core group to objects for animation
      objectsRef.current.push(coreGroup);
      objectsRef.current.push(satelliteGroup);
    };
    
    // Create holographic style objects
    const createHolographicObjects = (scene: THREE.Scene) => {
      const mainColor = new THREE.Color(color);
      const accentColor = mainColor.clone().offsetHSL(0.1, 0, 0.2);
      
      // Create advanced holographic materials
      const hologramMaterial = new THREE.MeshPhysicalMaterial({
        color: mainColor,
        metalness: 0.1,
        roughness: 0.2,
        transparent: true,
        opacity: 0.7,
        transmission: 0.4,
        clearcoat: 0.8,
        side: THREE.DoubleSide
      });
      
      const detailMaterial = new THREE.MeshStandardMaterial({
        color: accentColor,
        emissive: accentColor,
        emissiveIntensity: 0.5,
        transparent: true,
        opacity: 0.8,
        wireframe: true
      });
      
      // Create a central holographic projection
      const coreGroup = new THREE.Group();
      
      // Layered geometric structure
      const shapes = [
        new THREE.IcosahedronGeometry(1.2, settings.geometryDetail),
        new THREE.DodecahedronGeometry(1.0, settings.geometryDetail),
        new THREE.OctahedronGeometry(0.8, settings.geometryDetail)
      ];
      
      shapes.forEach((geometry, index) => {
        // Create the main holographic shape
        const shape = new THREE.Mesh(geometry, hologramMaterial.clone());
        shape.material.opacity = 0.6 - (index * 0.1);
        coreGroup.add(shape);
        
        // Add wireframe detail layer
        const detail = new THREE.Mesh(geometry, detailMaterial.clone());
        detail.scale.multiplyScalar(1.05);
        coreGroup.add(detail);
        
        // Store animation parameters
        (shape as any).userData = {
          rotationSpeed: { 
            x: 0.001 + (index * 0.0005), 
            y: 0.002 - (index * 0.0003), 
            z: 0.0005 + (index * 0.0002) 
          },
          pulseSpeed: 0.003 + (index * 0.001)
        };
        
        (detail as any).userData = {
          rotationSpeed: { 
            x: 0.001 - (index * 0.0002), 
            y: 0.0015 + (index * 0.0003), 
            z: 0.001 - (index * 0.0001) 
          },
          pulseSpeed: 0.004 - (index * 0.001)
        };
        
        objectsRef.current.push(shape);
        objectsRef.current.push(detail);
      });
      
      scene.add(coreGroup);
      
      // Create horizontal projection platform
      const platformGeometry = new THREE.CylinderGeometry(1.8, 1.8, 0.05, 32);
      const platformMaterial = new THREE.MeshStandardMaterial({
        color: mainColor,
        emissive: mainColor,
        emissiveIntensity: 0.3,
        transparent: true,
        opacity: 0.5
      });
      
      const platform = new THREE.Mesh(platformGeometry, platformMaterial);
      platform.position.y = -1.5;
      scene.add(platform);
      
      // Add projection beams from platform to hologram
      const beamGeometry = new THREE.CylinderGeometry(0.1, 0.4, 3, 16);
      const beamMaterial = new THREE.MeshBasicMaterial({
        color: mainColor,
        transparent: true,
        opacity: 0.2
      });
      
      const beam = new THREE.Mesh(beamGeometry, beamMaterial);
      beam.position.y = -1.5 + 1.5; // Position between platform and hologram
      scene.add(beam);
      
      // Add scanning effect
      const scanGeometry = new THREE.PlaneGeometry(5, 5);
      const scanMaterial = new THREE.MeshBasicMaterial({
        color: accentColor,
        transparent: true,
        opacity: 0.2,
        side: THREE.DoubleSide
      });
      
      const scanPlane = new THREE.Mesh(scanGeometry, scanMaterial);
      scanPlane.rotation.x = Math.PI / 2;
      
      // Store animation data
      (scanPlane as any).userData = {
        scanSpeed: 0.02,
        range: { min: -1.5, max: 1.5 }
      };
      
      scene.add(scanPlane);
      objectsRef.current.push(scanPlane);
      
      // Add floating data particles
      const particleCount = settings.particleCount * 0.7;
      const particleGeometry = new THREE.SphereGeometry(0.05, 8, 8);
      const particleMaterial = new THREE.MeshBasicMaterial({
        color: accentColor,
        transparent: true,
        opacity: 0.6
      });
      
      for (let i = 0; i < particleCount; i++) {
        const particle = new THREE.Mesh(particleGeometry, particleMaterial.clone());
        
        // Random position within hologram volume
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI;
        const radius = 1.5 * Math.random();
        
        particle.position.set(
          radius * Math.sin(phi) * Math.cos(theta),
          radius * Math.cos(phi),
          radius * Math.sin(phi) * Math.sin(theta)
        );
        
        // Store animation data
        (particle as any).userData = {
          originalPosition: particle.position.clone(),
          speed: 0.01 + Math.random() * 0.02,
          range: 0.2 + Math.random() * 0.3
        };
        
        scene.add(particle);
        objectsRef.current.push(particle);
      }
      
      // Add holographic text floating above
      if (logoText) {
        addHolographicText(scene, logoText, mainColor);
      }
    };
    
    // Create neon-style objects
    const createNeonObjects = (scene: THREE.Scene) => {
      const mainColor = new THREE.Color(color);
      const accentColor = mainColor.clone().offsetHSL(0.5, 0, 0); // Complementary color
      const thirdColor = mainColor.clone().offsetHSL(0.3, 0, 0);
      
      // Create neon glow materials
      const createNeonMaterial = (color: THREE.Color, intensity = 1) => {
        return new THREE.MeshStandardMaterial({
          color: color,
          emissive: color,
          emissiveIntensity: intensity,
          metalness: 0.3,
          roughness: 0.4
        });
      };
      
      const neonMaterialMain = createNeonMaterial(mainColor, 1.2);
      const neonMaterialAccent = createNeonMaterial(accentColor, 1);
      const neonMaterialThird = createNeonMaterial(thirdColor, 0.8);
      
      // Create a central neon framework structure
      const frameGroup = new THREE.Group();
      
      // Build a framework of neon tubes
      const buildNeonFrame = () => {
        const thickness = 0.08;
        const frameSize = 2;
        const frameGeometry = new THREE.TorusGeometry(thickness * 2, thickness, 8, 8);
        
        // Create frame corners
        for (let x = -1; x <= 1; x += 2) {
          for (let y = -1; y <= 1; y += 2) {
            for (let z = -1; z <= 1; z += 2) {
              const corner = new THREE.Mesh(frameGeometry, 
                x === 1 ? neonMaterialMain : 
                y === 1 ? neonMaterialAccent : neonMaterialThird
              );
              
              corner.position.set(
                x * frameSize / 2,
                y * frameSize / 2,
                z * frameSize / 2
              );
              
              // Rotate to correct orientation
              if (x === 1) {
                corner.rotation.y = Math.PI / 2;
              } else if (y === 1) {
                corner.rotation.x = Math.PI / 2;
              }
              
              frameGroup.add(corner);
              objectsRef.current.push(corner);
            }
          }
        }
        
        // Connect corners with neon tubes
        const createTube = (start: THREE.Vector3, end: THREE.Vector3, material: THREE.Material) => {
          const direction = new THREE.Vector3().subVectors(end, start);
          const length = direction.length();
          
          const tubeGeometry = new THREE.CylinderGeometry(thickness, thickness, length, 8);
          const tube = new THREE.Mesh(tubeGeometry, material);
          
          // Position at midpoint
          tube.position.copy(start).add(direction.multiplyScalar(0.5));
          
          // Orient along the direction
          tube.quaternion.setFromUnitVectors(
            new THREE.Vector3(0, 1, 0),
            direction.clone().normalize()
          );
          
          frameGroup.add(tube);
          return tube;
        };
        
        // Create the main frame tubes
        const framePoints = [
          new THREE.Vector3(-frameSize/2, -frameSize/2, -frameSize/2),
          new THREE.Vector3(frameSize/2, -frameSize/2, -frameSize/2),
          new THREE.Vector3(frameSize/2, frameSize/2, -frameSize/2),
          new THREE.Vector3(-frameSize/2, frameSize/2, -frameSize/2),
          new THREE.Vector3(-frameSize/2, -frameSize/2, frameSize/2),
          new THREE.Vector3(frameSize/2, -frameSize/2, frameSize/2),
          new THREE.Vector3(frameSize/2, frameSize/2, frameSize/2),
          new THREE.Vector3(-frameSize/2, frameSize/2, frameSize/2)
        ];
        
        // Connect in a cube pattern
        const connections = [
          [0, 1], [1, 2], [2, 3], [3, 0], // Front face
          [4, 5], [5, 6], [6, 7], [7, 4], // Back face
          [0, 4], [1, 5], [2, 6], [3, 7]  // Connecting edges
        ];
        
        connections.forEach(([startIdx, endIdx], i) => {
          const material = i % 3 === 0 ? neonMaterialMain : 
                           i % 3 === 1 ? neonMaterialAccent : neonMaterialThird;
          
          const tube = createTube(framePoints[startIdx], framePoints[endIdx], material);
          
          // Add animation data
          (tube as any).userData = {
            pulseSpeed: 0.01 + (i * 0.001),
            pulseIntensity: 0.3,
            baseIntensity: 1
          };
          
          objectsRef.current.push(tube);
        });
      };
      
      buildNeonFrame();
      scene.add(frameGroup);
      
      // Add inner neon geometric shape
      const innerGeometry = new THREE.IcosahedronGeometry(1, settings.geometryDetail);
      const innerShape = new THREE.Mesh(innerGeometry, neonMaterialAccent);
      innerShape.scale.set(0.7, 0.7, 0.7);
      
      // Add wireframe overlay
      const wireGeometry = new THREE.IcosahedronGeometry(1.05, settings.geometryDetail);
      const wireShape = new THREE.Mesh(
        wireGeometry,
        new THREE.MeshBasicMaterial({
          color: accentColor,
          wireframe: true,
          transparent: true,
          opacity: 0.3
        })
      );
      wireShape.scale.set(0.7, 0.7, 0.7);
      
      frameGroup.add(innerShape);
      frameGroup.add(wireShape);
      
      objectsRef.current.push(innerShape);
      objectsRef.current.push(wireShape);
      
      // Add neon particles around the structure
      const particleCount = settings.particleCount * 0.6;
      const particleGeometry = new THREE.SphereGeometry(0.04, 8, 8);
      
      for (let i = 0; i < particleCount; i++) {
        const material = i % 3 === 0 ? neonMaterialMain.clone() : 
                         i % 3 === 1 ? neonMaterialAccent.clone() : neonMaterialThird.clone();
        
        // Make particles more transparent
        material.transparent = true;
        material.opacity = 0.8;
        
        const particle = new THREE.Mesh(particleGeometry, material);
        
        // Position particles in orbital patterns
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * 3 + 1;
        const height = (Math.random() - 0.5) * 3;
        
        particle.position.set(
          Math.cos(angle) * radius,
          height,
          Math.sin(angle) * radius
        );
        
        // Store animation data
        (particle as any).userData = {
          orbitSpeed: 0.005 + Math.random() * 0.01,
          orbitRadius: radius,
          height: height,
          pulseSpeed: 0.05 + Math.random() * 0.1
        };
        
        scene.add(particle);
        objectsRef.current.push(particle);
      }
      
      // Add neon text if logo provided
      if (logoText) {
        addNeonText(scene, logoText, mainColor);
      }
    };
    
    // Create data flow visualization objects
    const createDataFlowObjects = (scene: THREE.Scene) => {
      const mainColor = new THREE.Color(color);
      const accentColor = mainColor.clone().offsetHSL(0.1, 0, 0.2);
      
      // Create materials for data visualization
      const nodeMaterial = new THREE.MeshStandardMaterial({
        color: mainColor,
        emissive: mainColor.clone().offsetHSL(0, 0, 0.2),
        emissiveIntensity: 0.5,
        metalness: 0.7,
        roughness: 0.3
      });
      
      const connectionMaterial = new THREE.MeshBasicMaterial({
        color: accentColor,
        transparent: true,
        opacity: 0.5
      });
      
      const highlightMaterial = new THREE.MeshStandardMaterial({
        color: mainColor.clone().offsetHSL(0, 0.5, 0.3),
        emissive: mainColor.clone().offsetHSL(0, 0.5, 0.3),
        emissiveIntensity: 1,
        metalness: 0.8,
        roughness: 0.2
      });
      
      // Create a network of data nodes
      const nodeGroup = new THREE.Group();
      const nodes: THREE.Mesh[] = [];
      const nodeCount = Math.min(12, settings.particleCount / 10);
      
      // Create data nodes in a network pattern
      for (let i = 0; i < nodeCount; i++) {
        const size = 0.2 + Math.random() * 0.3;
        const nodeGeometry = new THREE.SphereGeometry(size, 16, 16);
        const node = new THREE.Mesh(
          nodeGeometry, 
          i === 0 ? highlightMaterial : nodeMaterial.clone()
        );
        
        // Position nodes in a 3D network layout
        const radius = 3;
        const phi = Math.acos(-1 + (2 * i) / nodeCount);
        const theta = Math.sqrt(nodeCount * Math.PI) * phi;
        
        node.position.set(
          radius * Math.sin(phi) * Math.cos(theta),
          radius * Math.sin(phi) * Math.sin(theta),
          radius * Math.cos(phi)
        );
        
        // For central node
        if (i === 0) {
          node.position.set(0, 0, 0);
          node.scale.multiplyScalar(1.5);
        }
        
        // Add unique identifier
        (node as any).userData = {
          id: i,
          isActive: Math.random() > 0.3, // Some nodes start active
          processingSpeed: 0.5 + Math.random() * 1.5,
          connections: [],
          pulseSpeed: 0.03 + Math.random() * 0.02
        };
        
        nodeGroup.add(node);
        nodes.push(node);
        objectsRef.current.push(node);
      }
      
      // Connect nodes with data paths
      const connections: THREE.Object3D[] = [];
      
      // Always connect to central node
      nodes.forEach((node, i) => {
        if (i === 0) return; // Skip central node itself
        
        // Connect to central node
        createConnection(nodes[0], node);
        
        // Connect to some other nodes for a network effect
        const connectionCount = Math.floor(Math.random() * 3) + 1;
        for (let j = 0; j < connectionCount; j++) {
          const targetIndex = Math.floor(Math.random() * nodeCount);
          if (targetIndex !== i && targetIndex !== 0) {
            createConnection(node, nodes[targetIndex]);
          }
        }
      });
      
      function createConnection(node1: THREE.Mesh, node2: THREE.Mesh) {
        // Check if connection already exists
        const id1 = (node1 as any).userData.id;
        const id2 = (node2 as any).userData.id;
        
        if ((node1 as any).userData.connections.includes(id2) ||
            (node2 as any).userData.connections.includes(id1)) {
          return;
        }
        
        // Create connection between nodes
        const start = node1.position;
        const end = node2.position;
        
        const direction = new THREE.Vector3().subVectors(end, start);
        const distance = direction.length();
        
        // Create data path as a thin cylinder
        const pathGeometry = new THREE.CylinderGeometry(0.03, 0.03, distance, 8);
        const path = new THREE.Mesh(pathGeometry, connectionMaterial.clone());
        
        // Position at midpoint
        path.position.copy(start).add(direction.multiplyScalar(0.5));
        
        // Orient along the direction
        path.quaternion.setFromUnitVectors(
          new THREE.Vector3(0, 1, 0),
          direction.clone().normalize()
        );
        
        // Create data packets that will flow along this path
        const packetCount = Math.floor(Math.random() * 3) + 1;
        const packets: THREE.Mesh[] = [];
        
        for (let i = 0; i < packetCount; i++) {
          const packetGeometry = new THREE.SphereGeometry(0.06, 8, 8);
          const packet = new THREE.Mesh(
            packetGeometry,
            highlightMaterial.clone()
          );
          
          // Add packet-specific data
          (packet as any).userData = {
            path: path,
            startNode: node1,
            endNode: node2,
            speed: 0.01 + Math.random() * 0.02,
            progress: Math.random(), // Start at random position
            direction: Math.random() > 0.5 ? 1 : -1, // Random direction
            active: true
          };
          
          nodeGroup.add(packet);
          packets.push(packet);
          objectsRef.current.push(packet);
        }
        
        // Store connection data
        (path as any).userData = {
          startNode: node1,
          endNode: node2,
          packets: packets,
          active: true
        };
        
        // Register connection in the nodes
        (node1 as any).userData.connections.push(id2);
        (node2 as any).userData.connections.push(id1);
        
        nodeGroup.add(path);
        connections.push(path);
        objectsRef.current.push(path);
      }
      
      scene.add(nodeGroup);
      objectsRef.current.push(nodeGroup);
      
      // Add background particles for depth
      const particleCount = settings.particleCount;
      const particleGeometry = new THREE.SphereGeometry(0.02, 6, 6);
      const particleMaterial = new THREE.MeshBasicMaterial({
        color: mainColor.clone().offsetHSL(0, -0.5, 0.3),
        transparent: true,
        opacity: 0.3
      });
      
      for (let i = 0; i < particleCount; i++) {
        const particle = new THREE.Mesh(particleGeometry, particleMaterial.clone());
        
        // Create wider background field
        const radius = 4 + Math.random() * 4;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI;
        
        particle.position.set(
          radius * Math.sin(phi) * Math.cos(theta),
          radius * Math.cos(phi),
          radius * Math.sin(phi) * Math.sin(theta)
        );
        
        // Store animation data
        (particle as any).userData = {
          originalPosition: particle.position.clone(),
          speed: 0.0005 + Math.random() * 0.001,
          wobbleAmount: 0.1 + Math.random() * 0.3
        };
        
        scene.add(particle);
        objectsRef.current.push(particle);
      }
      
      // Add data flow themed text if logo provided
      if (logoText) {
        addDataText(scene, logoText, mainColor);
      }
    };
    
    // Add 3D logo text to the scene
    const addLogoText = (scene: THREE.Scene, text: string) => {
      // Create a simple colored plane for text (placeholder)
      // In a real implementation, you would use THREE.TextGeometry, but 
      // that requires loading a font which is beyond scope here
      const textMaterial = new THREE.MeshStandardMaterial({
        color: new THREE.Color(color),
        emissive: new THREE.Color(color),
        emissiveIntensity: 0.5,
      });
      
      // Create backing plate for text
      const plateGeometry = new THREE.PlaneGeometry(2, 0.6);
      const plate = new THREE.Mesh(plateGeometry, new THREE.MeshStandardMaterial({
        color: 0x222222,
        metalness: 0.7,
        roughness: 0.3,
        transparent: true,
        opacity: 0.8
      }));
      
      plate.position.set(0, 2, 0);
      scene.add(plate);
      
      // Create simple text representation (in a real implementation, use TextGeometry)
      // For now, create a simple representation with basic shapes
      const textGroup = new THREE.Group();
      
      const letters = text.split('');
      const letterWidth = 1.6 / letters.length;
      const startX = -(letterWidth * (letters.length - 1)) / 2;
      
      letters.forEach((letter, i) => {
        // Create a simple cube representing each letter
        const letterGeometry = new THREE.BoxGeometry(letterWidth * 0.8, 0.4, 0.05);
        const letterMesh = new THREE.Mesh(letterGeometry, textMaterial);
        letterMesh.position.x = startX + (i * letterWidth);
        textGroup.add(letterMesh);
        
        // Add letter-specific animation data
        (letterMesh as any).userData = {
          originalY: letterMesh.position.y,
          pulseSpeed: 0.1 + (i * 0.05),
          pulseHeight: 0.03
        };
        
        objectsRef.current.push(letterMesh);
      });
      
      textGroup.position.set(0, 2, 0);
      scene.add(textGroup);
      objectsRef.current.push(textGroup);
    };
    
    // Add holographic style text
    const addHolographicText = (scene: THREE.Scene, text: string, color: THREE.Color) => {
      const textGroup = new THREE.Group();
      
      // Create a circular platform for the text
      const platformGeometry = new THREE.CylinderGeometry(1.2, 1.2, 0.05, 32);
      const platformMaterial = new THREE.MeshStandardMaterial({
        color: color,
        emissive: color,
        emissiveIntensity: 0.3,
        transparent: true,
        opacity: 0.5
      });
      
      const platform = new THREE.Mesh(platformGeometry, platformMaterial);
      platform.position.y = 1.8;
      
      textGroup.add(platform);
      
      // Create simple text representation with glow effect
      const letters = text.split('');
      const letterWidth = 1.8 / letters.length;
      const startX = -(letterWidth * (letters.length - 1)) / 2;
      
      letters.forEach((letter, i) => {
        // Main letter shape
        const letterGeometry = new THREE.BoxGeometry(letterWidth * 0.8, 0.4, 0.05);
        const letterMaterial = new THREE.MeshStandardMaterial({
          color: color,
          emissive: color,
          emissiveIntensity: 0.8,
          transparent: true,
          opacity: 0.8
        });
        
        const letterMesh = new THREE.Mesh(letterGeometry, letterMaterial);
        letterMesh.position.set(startX + (i * letterWidth), 2, 0);
        
        // Add glow effect around letter
        const glowGeometry = new THREE.BoxGeometry(
          letterWidth * 0.8 * 1.2, 
          0.4 * 1.2, 
          0.05 * 1.2
        );
        const glowMaterial = new THREE.MeshBasicMaterial({
          color: color,
          transparent: true,
          opacity: 0.3,
          side: THREE.BackSide
        });
        
        const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
        glowMesh.position.copy(letterMesh.position);
        
        textGroup.add(letterMesh);
        textGroup.add(glowMesh);
        
        // Add animation data
        (letterMesh as any).userData = {
          originalY: letterMesh.position.y,
          pulseSpeed: 0.05 + (i * 0.01),
          glowMesh: glowMesh
        };
        
        objectsRef.current.push(letterMesh);
        objectsRef.current.push(glowMesh);
      });
      
      scene.add(textGroup);
      objectsRef.current.push(textGroup);
      
      // Add scanning light effect
      const scanGeometry = new THREE.PlaneGeometry(3, 0.1);
      const scanMaterial = new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: 0.7,
        side: THREE.DoubleSide
      });
      
      const scanPlane = new THREE.Mesh(scanGeometry, scanMaterial);
      scanPlane.position.y = 2;
      scanPlane.rotation.x = Math.PI / 2;
      
      // Store animation data
      (scanPlane as any).userData = {
        scanSpeed: 0.05,
        range: { min: 1.7, max: 2.3 }
      };
      
      scene.add(scanPlane);
      objectsRef.current.push(scanPlane);
    };
    
    // Add neon style text
    const addNeonText = (scene: THREE.Scene, text: string, color: THREE.Color) => {
      const textGroup = new THREE.Group();
      
      // Create a neon material for text
      const neonTextMaterial = new THREE.MeshStandardMaterial({
        color: color,
        emissive: color,
        emissiveIntensity: 1.5,
        metalness: 0.3,
        roughness: 0.4
      });
      
      // Create a glow material for text
      const glowTextMaterial = new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: 0.6,
        side: THREE.BackSide
      });
      
      // Create simple text representation with neon effect
      const letters = text.split('');
      const letterWidth = 1.8 / letters.length;
      const startX = -(letterWidth * (letters.length - 1)) / 2;
      
      letters.forEach((letter, i) => {
        // Create cylindrical shape for neon-tube like text
        const letterGeometry = new THREE.CylinderGeometry(
          letterWidth * 0.15, 
          letterWidth * 0.15, 
          0.5, 
          16
        );
        
        // Rotate to horizontal position
        letterGeometry.rotateX(Math.PI / 2);
        
        const letterMesh = new THREE.Mesh(letterGeometry, neonTextMaterial.clone());
        letterMesh.position.set(startX + (i * letterWidth), 1.7, 0);
        
        // Create glow effect
        const glowGeometry = new THREE.CylinderGeometry(
          letterWidth * 0.15 * 1.5, 
          letterWidth * 0.15 * 1.5, 
          0.5 * 1.2, 
          16
        );
        glowGeometry.rotateX(Math.PI / 2);
        
        const glowMesh = new THREE.Mesh(glowGeometry, glowTextMaterial.clone());
        glowMesh.position.copy(letterMesh.position);
        
        textGroup.add(letterMesh);
        textGroup.add(glowMesh);
        
        // Add animation data
        (letterMesh as any).userData = {
          pulseSpeed: 0.05 + (i * 0.01),
          pulseIntensity: 0.3,
          glowMesh: glowMesh
        };
        
        objectsRef.current.push(letterMesh);
        objectsRef.current.push(glowMesh);
      });
      
      scene.add(textGroup);
      objectsRef.current.push(textGroup);
    };
    
    // Add data-style text
    const addDataText = (scene: THREE.Scene, text: string, color: THREE.Color) => {
      const textGroup = new THREE.Group();
      
      // Create data-style materials
      const dataMaterial = new THREE.MeshStandardMaterial({
        color: color,
        emissive: color,
        emissiveIntensity: 0.6,
        metalness: 0.7,
        roughness: 0.3
      });
      
      // Create simple text representation
      const letters = text.split('');
      const letterWidth = 1.8 / letters.length;
      const startX = -(letterWidth * (letters.length - 1)) / 2;
      
      letters.forEach((letter, i) => {
        // Create a letter mesh
        const letterGeometry = new THREE.BoxGeometry(letterWidth * 0.7, 0.4, 0.05);
        const letterMesh = new THREE.Mesh(letterGeometry, dataMaterial.clone());
        letterMesh.position.set(startX + (i * letterWidth), 1.8, 0);
        
        // Add small data cubes floating around each letter
        const cubeCount = 3;
        for (let j = 0; j < cubeCount; j++) {
          const size = 0.04 + Math.random() * 0.03;
          const cubeGeometry = new THREE.BoxGeometry(size, size, size);
          const cube = new THREE.Mesh(
            cubeGeometry,
            dataMaterial.clone()
          );
          
          // Position cubes around the letter
          const angle = (j / cubeCount) * Math.PI * 2;
          const radius = 0.2 + Math.random() * 0.1;
          
          cube.position.set(
            letterMesh.position.x + Math.cos(angle) * radius,
            letterMesh.position.y + Math.sin(angle) * radius,
            letterMesh.position.z + (Math.random() - 0.5) * 0.1
          );
          
          // Add animation data
          (cube as any).userData = {
            centerPosition: new THREE.Vector3(
              letterMesh.position.x,
              letterMesh.position.y,
              letterMesh.position.z
            ),
            orbitSpeed: 0.02 + Math.random() * 0.03,
            orbitRadius: radius,
            orbitAngle: angle,
            pulseSpeed: 0.1 + Math.random() * 0.2
          };
          
          textGroup.add(cube);
          objectsRef.current.push(cube);
        }
        
        // Add a line connecting to the main scene
        const lineGeometry = new THREE.CylinderGeometry(0.01, 0.01, 1.8, 8);
        const line = new THREE.Mesh(lineGeometry, new THREE.MeshBasicMaterial({
          color: color,
          transparent: true,
          opacity: 0.3
        }));
        
        line.position.set(letterMesh.position.x, 0.9, 0);
        line.rotation.x = Math.PI / 2;
        
        textGroup.add(letterMesh);
        textGroup.add(line);
        
        // Add animation data
        (letterMesh as any).userData = {
          originalY: letterMesh.position.y,
          pulseSpeed: 0.03 + (i * 0.01),
          dataActive: Math.random() > 0.3
        };
        
        objectsRef.current.push(letterMesh);
        objectsRef.current.push(line);
      });
      
      scene.add(textGroup);
      objectsRef.current.push(textGroup);
    };
    
    // Enhanced 3D animation loop
    const animate = () => {
      if (!sceneRef.current || !cameraRef.current || !rendererRef.current) return;
      
      const currentTime = Date.now();
      const elapsedTime = currentTime - startTimeRef.current;
      const animationProgress = Math.min(elapsedTime / duration, 1);
      const time = elapsedTime * 0.001; // Time in seconds
      
      // Update progress for loading indicator
      setProgress(animationProgress * 100);
      
      // Enhanced camera movement
      // Add slight camera movement for a more dynamic feel, influenced by mouse if interactive
      if (interactive && isInteracting) {
        const mouseX = mouseRef.current.x;
        const mouseY = mouseRef.current.y;
        
        cameraRef.current.position.x += (mouseX * 0.3 - cameraRef.current.position.x) * 0.05;
        cameraRef.current.position.y += (-mouseY * 0.3 - cameraRef.current.position.y) * 0.05;
      } else {
        cameraRef.current.position.x = Math.sin(time * 0.2) * 0.5;
        cameraRef.current.position.y = Math.sin(time * 0.3) * 0.3;
      }
      
      // Ensure camera always looks at center
      cameraRef.current.lookAt(0, 0, 0);
      
      // Animate objects based on their type and userData
      animateObjects(time, variation);
      
      // Render the scene
      rendererRef.current.render(sceneRef.current, cameraRef.current);
      
      // Continue animation or complete
      if (animationProgress < 1) {
        frameIdRef.current = requestAnimationFrame(animate);
      } else if (onComplete) {
        // Allow the last frame to render with completed animation before triggering onComplete
        setTimeout(onComplete, 100);
      }
    };
    
    // Animation function that handles specific animations for different object types
    const animateObjects = (time: number, variation: string) => {
      objectsRef.current.forEach(object => {
        const userData = (object as any).userData;
        if (!userData) return;
        
        // Type-specific animations based on the variation
        switch (variation) {
          case 'futuristic':
            animateFuturisticObject(object, time, userData);
            break;
          case 'holographic':
            animateHolographicObject(object, time, userData);
            break;
          case 'neon':
            animateNeonObject(object, time, userData);
            break;
          case 'dataflow':
            animateDataFlowObject(object, time, userData);
            break;
        }
      });
    };
    
    // Futuristic object animations
    const animateFuturisticObject = (object: THREE.Object3D, time: number, userData: any) => {
      // Central core group rotation
      if (object.type === 'Group') {
        object.rotation.y = time * 0.1;
        object.rotation.x = Math.sin(time * 0.2) * 0.1;
        return;
      }
      
      // Point light animation
      if (object.type === 'PointLight') {
        if (userData.pulseSpeed) {
          const pulse = Math.sin(time * userData.pulseSpeed * 5) * 0.2 + 1;
          object.intensity = userData.originalIntensity * pulse;
        }
        return;
      }
      
      // Satellite objects
      if (userData.orbitRadius && userData.orbitSpeed) {
        // Orbital motion
        const angle = userData.initialAngle + time * userData.orbitSpeed;
        const orbitRadius = userData.orbitRadius;
        
        object.position.x = Math.cos(angle) * orbitRadius;
        object.position.z = Math.sin(angle) * orbitRadius;
        
        // Y position with wobble
        if (userData.height !== undefined) {
          object.position.y = userData.height + Math.sin(time * userData.wobbleFrequency) * userData.wobbleAmplitude;
        }
        
        // Rotation of the object itself
        object.rotation.x += 0.01;
        object.rotation.y += 0.01;
        
        // Pulsing effect for particles
        if (userData.pulseSpeed && userData.originalScale) {
          const pulse = Math.sin(time * userData.pulseSpeed * 5) * 0.3 + 1;
          const scale = userData.originalScale * pulse;
          object.scale.set(scale, scale, scale);
        }
      }
      
      // Beam connections (update to connect moving objects)
      if (userData.target) {
        // Update beam position to target
        const startPos = userData.corePosition;
        const endPos = userData.target.position;
        
        // Position at midpoint
        object.position.copy(new THREE.Vector3().addVectors(startPos, endPos).multiplyScalar(0.5));
        
        // Scale to match distance
        const distance = startPos.distanceTo(endPos);
        object.scale.y = distance / 2; // Original length is 2
        
        // Orient towards target
        object.lookAt(endPos);
      }
    };
    
    // Holographic object animations
    const animateHolographicObject = (object: THREE.Object3D, time: number, userData: any) => {
      // Rotating holographic layers
      if (userData.rotationSpeed) {
        object.rotation.x += userData.rotationSpeed.x;
        object.rotation.y += userData.rotationSpeed.y;
        object.rotation.z += userData.rotationSpeed.z;
        
        // Pulsing scale
        if (userData.pulseSpeed) {
          const pulse = Math.sin(time * userData.pulseSpeed * 3) * 0.05 + 1;
          object.scale.set(pulse, pulse, pulse);
        }
      }
      
      // Scan plane animation
      if (userData.scanSpeed && userData.range) {
        // Move scan plane up and down
        object.position.y = 
          userData.range.min + 
          (Math.sin(time * userData.scanSpeed * 2) + 1) / 2 * 
          (userData.range.max - userData.range.min);
      }
      
      // Floating particles
      if (userData.originalPosition && userData.speed && userData.range) {
        // Random movement around original position
        object.position.x = userData.originalPosition.x + Math.sin(time * userData.speed * 3) * userData.range;
        object.position.y = userData.originalPosition.y + Math.cos(time * userData.speed * 2) * userData.range;
        object.position.z = userData.originalPosition.z + Math.sin(time * userData.speed * 4) * userData.range;
      }
      
      // Text animation
      if (userData.originalY && userData.pulseSpeed && userData.glowMesh) {
        // Subtle floating movement
        object.position.y = userData.originalY + Math.sin(time * userData.pulseSpeed) * 0.05;
        
        // Match glow position
        userData.glowMesh.position.copy(object.position);
        
        // Pulse glow size
        const pulse = Math.sin(time * userData.pulseSpeed * 2) * 0.1 + 1.1;
        userData.glowMesh.scale.set(pulse, pulse, pulse);
      }
    };
    
    // Neon object animations
    const animateNeonObject = (object: THREE.Object3D, time: number, userData: any) => {
      // Pulse intensity for neon objects
      if (userData.pulseSpeed && userData.pulseIntensity) {
        if (object.material && object.material.emissiveIntensity !== undefined) {
          const pulse = Math.sin(time * userData.pulseSpeed * 3) * userData.pulseIntensity + userData.baseIntensity;
          object.material.emissiveIntensity = pulse;
        }
        
        // For glow mesh
        if (userData.glowMesh) {
          const pulse = Math.sin(time * userData.pulseSpeed * 3) * 0.3 + 1;
          userData.glowMesh.scale.set(pulse, pulse, pulse);
        }
      }
      
      // Orbiting particles
      if (userData.orbitSpeed && userData.orbitRadius) {
        const angle = time * userData.orbitSpeed;
        
        object.position.x = Math.cos(angle) * userData.orbitRadius;
        object.position.z = Math.sin(angle) * userData.orbitRadius;
        
        if (userData.height !== undefined) {
          // Floating up and down
          object.position.y = userData.height + Math.sin(time * userData.pulseSpeed) * 0.3;
        }
      }
      
      // Inner shape rotation
      if (object.type === 'Mesh' && object.geometry.type.includes('Icosahedron')) {
        object.rotation.x = time * 0.2;
        object.rotation.y = time * 0.3;
        object.rotation.z = time * 0.1;
      }
    };
    
    // Data flow object animations
    const animateDataFlowObject = (object: THREE.Object3D, time: number, userData: any) => {
      // Data node pulsing
      if (userData.id !== undefined && userData.pulseSpeed) {
        // Pulse active nodes
        if (userData.isActive) {
          const pulse = Math.sin(time * userData.pulseSpeed) * 0.1 + 1;
          object.scale.set(pulse, pulse, pulse);
          
          // Randomly toggle active state
          if (Math.random() < 0.001) {
            userData.isActive = false;
          }
        } else {
          // Inactive state
          const scale = 0.8;
          object.scale.set(scale, scale, scale);
          
          // Randomly reactivate
          if (Math.random() < 0.005) {
            userData.isActive = true;
          }
        }
      }
      
      // Data packet animation along paths
      if (userData.path && userData.progress !== undefined) {
        // Get path start and end
        const startNode = userData.startNode.position;
        const endNode = userData.endNode.position;
        
        // Move along path in the correct direction
        userData.progress += userData.speed * userData.direction;
        
        // Loop the movement
        if (userData.progress > 1) {
          // Reached end node, reverse or restart
          if (Math.random() > 0.5) {
            userData.direction *= -1;
            userData.progress = 1;
          } else {
            userData.progress = 0;
          }
          
          // Toggle node active state
          (userData.endNode as any).userData.isActive = true;
        } else if (userData.progress < 0) {
          // Reached start node, reverse or restart
          if (Math.random() > 0.5) {
            userData.direction *= -1;
            userData.progress = 0;
          } else {
            userData.progress = 1;
          }
          
          // Toggle node active state
          (userData.startNode as any).userData.isActive = true;
        }
        
        // Interpolate position along path
        object.position.lerpVectors(startNode, endNode, userData.progress);
      }
      
      // Background particle animation
      if (userData.originalPosition && userData.speed && userData.wobbleAmount) {
        // Create slow drifting movement
        const wobble = userData.wobbleAmount;
        object.position.x = userData.originalPosition.x + Math.sin(time * userData.speed) * wobble;
        object.position.y = userData.originalPosition.y + Math.cos(time * userData.speed * 1.5) * wobble;
        object.position.z = userData.originalPosition.z + Math.sin(time * userData.speed * 0.5) * wobble;
      }
      
      // Text animation
      if (userData.originalY && userData.pulseSpeed) {
        // Data-like text floating
        object.position.y = userData.originalY + Math.sin(time * userData.pulseSpeed) * 0.05;
        
        // Blink effect for data text
        if (userData.dataActive !== undefined) {
          // Random blinking effect
          if (Math.random() < 0.005) {
            userData.dataActive = !userData.dataActive;
          }
          
          // Adjust material based on active state
          if ('material' in object && (object as THREE.Mesh).material) {
            const material = (object as THREE.Mesh).material;
            if (!Array.isArray(material) && 'opacity' in material) {
              material.opacity = userData.dataActive ? 0.9 : 0.4;
            }
          }
        }
      }
      
      // Data node light animation
      if (userData.basePosition && userData.speed && userData.amplitude) {
        // Create gentle floating movement for node lights
        const time = Date.now() * 0.001;
        const x = userData.basePosition.x + Math.sin(time * userData.speed) * userData.amplitude;
        const y = userData.basePosition.y + Math.cos(time * userData.speed * 1.3) * userData.amplitude;
        const z = userData.basePosition.z + Math.sin(time * userData.speed * 0.7) * userData.amplitude;
        
        object.position.set(x, y, z);
        
        // Random intensity changes
        if ('intensity' in object) {
          (object as THREE.Light).intensity = 0.7 + Math.sin(time * userData.speed * 2) * 0.3;
        }
      }
      
      // Animated orbit position for data cubes around text
      if (userData.centerPosition && userData.orbitSpeed && userData.orbitRadius) {
        const angle = userData.orbitAngle + time * userData.orbitSpeed;
        
        object.position.x = userData.centerPosition.x + Math.cos(angle) * userData.orbitRadius;
        object.position.y = userData.centerPosition.y + Math.sin(angle) * userData.orbitRadius;
        
        // Add subtle movement in Z
        object.position.z = userData.centerPosition.z + Math.sin(time * userData.pulseSpeed) * 0.05;
        
        // Rotate the cube
        object.rotation.x += 0.02;
        object.rotation.y += 0.02;
      }
    };
    
    // Setup mouse event handlers for interactive mode
    const setupInteractivity = () => {
      if (!interactive || !containerRef.current) return;
      
      const handleMouseMove = (e: MouseEvent) => {
        if (!containerRef.current) return;
        
        const rect = containerRef.current.getBoundingClientRect();
        
        // Calculate normalized mouse position (-1 to 1)
        mouseRef.current = {
          x: ((e.clientX - rect.left) / rect.width) * 2 - 1,
          y: -((e.clientY - rect.top) / rect.height) * 2 + 1
        };
        
        setIsInteracting(true);
      };
      
      const handleMouseLeave = () => {
        setIsInteracting(false);
      };
      
      containerRef.current.addEventListener('mousemove', handleMouseMove);
      containerRef.current.addEventListener('mouseleave', handleMouseLeave);
      
      return () => {
        if (containerRef.current) {
          containerRef.current.removeEventListener('mousemove', handleMouseMove);
          containerRef.current.removeEventListener('mouseleave', handleMouseLeave);
        }
      };
    };
    
    // Initialize the scene
    initialize();
    
    // Setup interactivity if enabled
    const cleanupInteractivity = setupInteractivity();
    
    // Enhanced cleanup function with comprehensive resource disposal
    return () => {
      // Clean up interactivity
      if (cleanupInteractivity) cleanupInteractivity();
      
      // Cancel animation frame
      if (frameIdRef.current !== null) {
        cancelAnimationFrame(frameIdRef.current);
        frameIdRef.current = null;
      }
      
      // Dispose of Three.js resources
      objectsRef.current.forEach(object => {
        // Dispose of geometries
        if ((object as THREE.Mesh).geometry) {
          (object as THREE.Mesh).geometry.dispose();
        }
        
        // Dispose of materials
        if ((object as THREE.Mesh).material) {
          const material = (object as THREE.Mesh).material;
          
          if (Array.isArray(material)) {
            material.forEach(mat => mat.dispose());
          } else {
            material.dispose();
          }
        }
        
        // Remove from scene if still there
        if (sceneRef.current && object.parent === sceneRef.current) {
          sceneRef.current.remove(object);
        }
      });
      
      // Clear objects array
      objectsRef.current = [];
      
      // Dispose of the renderer
      if (rendererRef.current) {
        rendererRef.current.dispose();
        rendererRef.current = null;
      }
      
      // Remove any references
      sceneRef.current = null;
      cameraRef.current = null;
    };
  }, [color, duration, width, height, variation, complexity, interactive, logoText]);
  
  // Progress bar and text styles based on color
  const mainColor = color || '#60a5fa';
  const textColor = 'text-primary-foreground dark:text-primary-foreground';
  
  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      {/* Main 3D animation container */}
      <div 
        ref={containerRef}
        className="relative group" 
        style={{ 
          width, 
          height, 
          perspective: 1000,
          cursor: interactive ? 'move' : 'default'
        }}
      >
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          className="block"
        />
        
        {/* Interactive hint overlay */}
        {interactive && (
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            <div className="bg-black bg-opacity-40 text-white text-xs px-2 py-1 rounded">
              Move mouse to interact
            </div>
          </div>
        )}
      </div>
      
      {/* Loading text */}
      {showText && (
        <motion.div 
          className={`text-center mt-4 font-medium ${textColor}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <div className="text-lg">{text}</div>
          
          {/* Progress bar */}
          <div className="w-full mt-2 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
            <motion.div 
              className="h-full transition-all duration-300 ease-out"
              style={{ 
                width: `${progress}%`,
                background: `linear-gradient(to right, ${mainColor}, ${mainColor}dd, ${mainColor})`,
                backgroundSize: '200% 100%',
                animation: 'gradient-shift 2s linear infinite'
              }}
            />
          </div>
        </motion.div>
      )}
    </div>
  );
}

export default AdvancedTechLoading;