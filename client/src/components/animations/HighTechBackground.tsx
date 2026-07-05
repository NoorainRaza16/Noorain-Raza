import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface HighTechBackgroundProps {
  color?: string;
  density?: number;
  speed?: number;
  theme?: 'dark' | 'light';
  type?: 'grid' | 'particles' | 'dots' | 'circuit';
}

/**
 * High-tech 3D background animation component
 */
export function HighTechBackground({
  color = '#3b82f6',
  density = 50,
  speed = 1,
  theme = 'dark',
  type = 'grid'
}: HighTechBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const frameIdRef = useRef<number | null>(null);
  const objectsRef = useRef<THREE.Object3D[]>([]);
  
  // Convert color string to THREE.Color
  const threeColor = new THREE.Color(color);
  const isDark = theme === 'dark';
  
  // Set up Three.js scene
  useEffect(() => {
    if (!containerRef.current || !canvasRef.current) return;
    
    // Get container dimensions
    const { width, height } = containerRef.current.getBoundingClientRect();
    
    // Create scene
    const scene = new THREE.Scene();
    if (isDark) {
      scene.fog = new THREE.FogExp2(0x000000, 0.005);
    }
    sceneRef.current = scene;
    
    // Create camera
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 50;
    if (type === 'grid') {
      camera.position.y = 10;
      camera.lookAt(0, 0, 0);
    }
    cameraRef.current = camera;
    
    // Create renderer
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      alpha: true,
      antialias: true,
    });
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0);
    rendererRef.current = renderer;
    
    // Create appropriate background effect based on type
    switch (type) {
      case 'particles':
        createParticleBackground(scene);
        break;
      case 'dots':
        createDotsBackground(scene);
        break;
      case 'circuit':
        createCircuitBackground(scene);
        break;
      case 'grid':
      default:
        createGridBackground(scene);
        break;
    }
    
    // Start animation
    animate();
    
    // Handle resize
    const handleResize = () => {
      if (!containerRef.current || !cameraRef.current || !rendererRef.current) return;
      
      const { width, height } = containerRef.current.getBoundingClientRect();
      
      cameraRef.current.aspect = width / height;
      cameraRef.current.updateProjectionMatrix();
      
      rendererRef.current.setSize(width, height);
    };
    
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      
      if (frameIdRef.current) {
        cancelAnimationFrame(frameIdRef.current);
      }
      
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
    };
  }, [color, density, speed, theme, type, isDark, threeColor]);
  
  // Create Grid Background
  const createGridBackground = (scene: THREE.Scene) => {
    // Grid size and parameters
    const size = 200;
    const divisions = density;
    
    // Grid helper on the XZ plane (floor)
    const gridHelper = new THREE.GridHelper(size, divisions, 0x444444, 0x222222);
    scene.add(gridHelper);
    objectsRef.current.push(gridHelper);
    
    // Create horizontal lines for the floor grid
    const gridMaterial = new THREE.LineBasicMaterial({
      color: threeColor,
      opacity: 0.2,
      transparent: true
    });
    
    // Add a few highlighted lines
    const linesCount = 5;
    for (let i = 0; i < linesCount; i++) {
      const lineGeometry = new THREE.BufferGeometry();
      const position = ((i / linesCount) * size) - size / 2;
      
      const vertices = new Float32Array([
        -size / 2, 0, position,
        size / 2, 0, position
      ]);
      
      lineGeometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
      const line = new THREE.Line(lineGeometry, gridMaterial);
      scene.add(line);
      objectsRef.current.push(line);
      
      // Add vertical line as well
      const vertLineGeometry = new THREE.BufferGeometry();
      const vertVertices = new Float32Array([
        position, 0, -size / 2,
        position, 0, size / 2
      ]);
      
      vertLineGeometry.setAttribute('position', new THREE.BufferAttribute(vertVertices, 3));
      const vertLine = new THREE.Line(vertLineGeometry, gridMaterial);
      scene.add(vertLine);
      objectsRef.current.push(vertLine);
    }
    
    // Add moving horizontal plane
    const planeGeometry = new THREE.PlaneGeometry(size, size, 1, 1);
    const planeMaterial = new THREE.MeshBasicMaterial({
      color: threeColor,
      transparent: true,
      opacity: 0.05,
      side: THREE.DoubleSide
    });
    
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.rotation.x = Math.PI / 2;
    plane.position.y = 0.1;
    scene.add(plane);
    objectsRef.current.push(plane);
    
    // Add scanning line that moves across the grid
    const scanLineGeometry = new THREE.BoxGeometry(size, 0.1, 0.1);
    const scanLineMaterial = new THREE.MeshBasicMaterial({
      color: threeColor,
      transparent: true,
      opacity: 0.7
    });
    
    const scanLine = new THREE.Mesh(scanLineGeometry, scanLineMaterial);
    scanLine.position.y = 0.2;
    scanLine.position.z = -size / 2;
    
    // Animation parameters for scan line
    (scanLine as any).userData = {
      direction: 1,
      speed: 0.5 * speed,
      limits: {
        min: -size / 2,
        max: size / 2
      }
    };
    
    scene.add(scanLine);
    objectsRef.current.push(scanLine);
    
    // Add moving point lights for dynamic lighting
    const pointLight1 = new THREE.PointLight(threeColor, 1, 50);
    pointLight1.position.set(0, 10, 0);
    scene.add(pointLight1);
    
    (pointLight1 as any).userData = {
      radius: 20,
      angle: 0,
      speed: 0.01 * speed,
      height: 10
    };
    
    objectsRef.current.push(pointLight1);
  };
  
  // Create Particle Background
  const createParticleBackground = (scene: THREE.Scene) => {
    const particlesCount = density * 20;
    const particlesGeometry = new THREE.BufferGeometry();
    const vertices = [];
    
    // Create particle positions
    for (let i = 0; i < particlesCount; i++) {
      const x = Math.random() * 2000 - 1000;
      const y = Math.random() * 2000 - 1000;
      const z = Math.random() * 2000 - 1000;
      
      vertices.push(x, y, z);
    }
    
    particlesGeometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    
    // Create particle material
    const particlesMaterial = new THREE.PointsMaterial({
      color: threeColor,
      size: 2,
      transparent: true,
      opacity: 0.7,
      sizeAttenuation: true
    });
    
    // Create particle system
    const particles = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particles);
    objectsRef.current.push(particles);
    
    // Add parameters for animation
    (particles as any).userData = {
      rotationSpeed: 0.0001 * speed
    };
    
    // Add connecting lines between close particles
    const lineMaterial = new THREE.LineBasicMaterial({
      color: threeColor,
      transparent: true,
      opacity: 0.3
    });
    
    // Add a few connection lines
    const lineCount = Math.min(20, density);
    for (let i = 0; i < lineCount; i++) {
      const lineGeometry = new THREE.BufferGeometry();
      
      // Start with random positions that will be updated in animation
      const lineVertices = new Float32Array([
        0, 0, 0,
        1, 1, 1
      ]);
      
      lineGeometry.setAttribute('position', new THREE.BufferAttribute(lineVertices, 3));
      
      const line = new THREE.Line(lineGeometry, lineMaterial);
      
      // Store vertices for animation updates
      (line as any).userData = {
        particleIndices: [
          Math.floor(Math.random() * particlesCount),
          Math.floor(Math.random() * particlesCount)
        ],
        vertices: lineVertices
      };
      
      scene.add(line);
      objectsRef.current.push(line);
    }
  };
  
  // Create Dots Background
  const createDotsBackground = (scene: THREE.Scene) => {
    const size = 100;
    const spacing = size / Math.sqrt(density);
    
    // Create a grid of dots
    const dotGeometry = new THREE.SphereGeometry(0.2, 8, 8);
    const dotMaterial = new THREE.MeshBasicMaterial({
      color: threeColor
    });
    
    // Create dots in a grid pattern
    for (let x = -size / 2; x < size / 2; x += spacing) {
      for (let z = -size / 2; z < size / 2; z += spacing) {
        const dot = new THREE.Mesh(dotGeometry, dotMaterial.clone());
        
        // Add some randomness to position
        dot.position.set(
          x + (Math.random() - 0.5) * spacing * 0.5,
          0,
          z + (Math.random() - 0.5) * spacing * 0.5
        );
        
        // Set animation parameters
        (dot as any).userData = {
          originalY: 0,
          amplitude: Math.random() * 1 + 0.5,
          phase: Math.random() * Math.PI * 2,
          speed: (0.01 + Math.random() * 0.02) * speed
        };
        
        scene.add(dot);
        objectsRef.current.push(dot);
      }
    }
    
    // Add wave lines connecting dots
    const lineCount = Math.sqrt(density);
    const lineMaterial = new THREE.LineBasicMaterial({
      color: threeColor,
      opacity: 0.3,
      transparent: true
    });
    
    for (let i = 0; i < lineCount; i++) {
      const points = [];
      const segments = 50;
      
      for (let j = 0; j <= segments; j++) {
        const x = (j / segments) * size - size / 2;
        const z = (i / lineCount) * size - size / 2;
        points.push(new THREE.Vector3(x, 0, z));
      }
      
      const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
      const line = new THREE.Line(lineGeometry, lineMaterial);
      
      // Animation parameters
      (line as any).userData = {
        points: points,
        speed: 0.02 * speed,
        amplitude: 1 + Math.random() * 0.5
      };
      
      scene.add(line);
      objectsRef.current.push(line);
    }
  };
  
  // Create Circuit Background
  const createCircuitBackground = (scene: THREE.Scene) => {
    // Create a grid of nodes
    const gridSize = Math.round(Math.sqrt(density));
    const spacing = 10;
    
    // Node geometry and material
    const nodeGeometry = new THREE.SphereGeometry(0.3, 16, 16);
    const nodeMaterial = new THREE.MeshBasicMaterial({
      color: threeColor
    });
    
    // Create nodes in a grid
    const nodes = [];
    for (let x = 0; x < gridSize; x++) {
      for (let z = 0; z < gridSize; z++) {
        const posX = (x - gridSize / 2) * spacing;
        const posZ = (z - gridSize / 2) * spacing;
        
        const node = new THREE.Mesh(nodeGeometry, nodeMaterial.clone());
        node.position.set(posX, 0, posZ);
        
        // Store animation data
        (node as any).userData = {
          active: Math.random() > 0.5,
          pulseSpeed: (0.5 + Math.random() * 0.5) * speed,
          originalScale: 1,
          nodeId: nodes.length
        };
        
        scene.add(node);
        objectsRef.current.push(node);
        nodes.push(node);
      }
    }
    
    // Create circuit connections
    const connectionCount = gridSize * gridSize * 1.5;
    const lineMaterial = new THREE.LineBasicMaterial({
      color: threeColor,
      opacity: 0.5,
      transparent: true
    });
    
    for (let i = 0; i < connectionCount; i++) {
      // Pick two random nodes to connect
      const node1Index = Math.floor(Math.random() * nodes.length);
      let node2Index;
      
      // Pick a node that's close to node1
      do {
        node2Index = Math.floor(Math.random() * nodes.length);
      } while (
        node1Index === node2Index || 
        nodes[node1Index].position.distanceTo(nodes[node2Index].position) > spacing * 1.5
      );
      
      const node1 = nodes[node1Index];
      const node2 = nodes[node2Index];
      
      // Create line geometry
      const geometry = new THREE.BufferGeometry().setFromPoints([
        node1.position,
        node2.position
      ]);
      
      const line = new THREE.Line(geometry, lineMaterial.clone());
      
      // Store connection data
      (line as any).userData = {
        nodes: [node1Index, node2Index],
        active: Math.random() > 0.5,
        pulseSpeed: (0.2 + Math.random() * 0.3) * speed
      };
      
      scene.add(line);
      objectsRef.current.push(line);
    }
    
    // Add data packets that travel along the connections
    const packetGeometry = new THREE.SphereGeometry(0.15, 8, 8);
    const packetMaterial = new THREE.MeshBasicMaterial({
      color: threeColor,
      opacity: 0.8,
      transparent: true
    });
    
    const packetCount = Math.min(20, density / 5);
    for (let i = 0; i < packetCount; i++) {
      const packet = new THREE.Mesh(packetGeometry, packetMaterial.clone());
      
      // Pick a random connection to travel on
      const lineIndex = Math.floor(Math.random() * connectionCount);
      const line = objectsRef.current[nodes.length + lineIndex] as THREE.Line;
      
      // Set initial position at the start node
      if (line && (line as any).userData && (line as any).userData.nodes) {
        const nodeIndex = (line as any).userData.nodes[0];
        packet.position.copy(nodes[nodeIndex].position);
        
        // Store animation data
        (packet as any).userData = {
          lineIndex: nodes.length + lineIndex,
          progress: 0,
          speed: (0.01 + Math.random() * 0.03) * speed,
          active: Math.random() > 0.2
        };
        
        scene.add(packet);
        objectsRef.current.push(packet);
      }
    }
  };
  
  // Animation functions
  const animate = () => {
    if (!sceneRef.current || !cameraRef.current || !rendererRef.current) return;
    
    const time = Date.now() * 0.001;
    
    // Animate objects based on type
    switch (type) {
      case 'grid':
        animateGrid(time);
        break;
      case 'particles':
        animateParticles(time);
        break;
      case 'dots':
        animateDots(time);
        break;
      case 'circuit':
        animateCircuit(time);
        break;
    }
    
    // Render the scene
    rendererRef.current.render(sceneRef.current, cameraRef.current);
    
    // Continue animation loop
    frameIdRef.current = requestAnimationFrame(animate);
  };
  
  // Grid animation
  const animateGrid = (time: number) => {
    objectsRef.current.forEach((object, index) => {
      // Animate scanning line
      if ((object as any).userData && (object as any).userData.limits) {
        const userData = (object as any).userData;
        
        // Update position
        object.position.z += userData.speed * userData.direction;
        
        // Check boundaries
        if (object.position.z > userData.limits.max) {
          userData.direction = -1;
        } else if (object.position.z < userData.limits.min) {
          userData.direction = 1;
        }
      }
      
      // Animate point light
      if ((object as any).userData && (object as any).userData.radius) {
        const userData = (object as any).userData;
        
        // Circular motion
        const angle = time * userData.speed;
        object.position.x = Math.sin(angle) * userData.radius;
        object.position.z = Math.cos(angle) * userData.radius;
        object.position.y = userData.height + Math.sin(time * 0.5) * 2;
      }
    });
  };
  
  // Particles animation
  const animateParticles = (time: number) => {
    const particles = objectsRef.current[0];
    
    if (particles && (particles as any).userData) {
      // Rotate particle system
      particles.rotation.y = time * (particles as any).userData.rotationSpeed;
      particles.rotation.z = time * (particles as any).userData.rotationSpeed * 0.5;
    }
    
    // Animate connecting lines
    objectsRef.current.forEach((object, index) => {
      if (index > 0 && (object as any).userData && (object as any).userData.particleIndices) {
        const userData = (object as any).userData;
        const particlesObject = objectsRef.current[0] as THREE.Points;
        
        // Make sure we have valid particles object with geometry
        if (particlesObject && 'geometry' in particlesObject && particlesObject.geometry && 
            particlesObject.geometry.attributes && particlesObject.geometry.attributes.position) {
          
          const particlesPositions = particlesObject.geometry.attributes.position;
          
          // Make sure the vertices array exists
          if (userData.vertices && particlesPositions && particlesPositions.array) {
            // Get positions from particles
            const index1 = userData.particleIndices[0] * 3;
            const index2 = userData.particleIndices[1] * 3;
            
            // Check that indices are within bounds
            if (index1 >= 0 && index1 + 2 < particlesPositions.array.length &&
                index2 >= 0 && index2 + 2 < particlesPositions.array.length) {
              
              // Update line positions
              userData.vertices[0] = particlesPositions.array[index1];
              userData.vertices[1] = particlesPositions.array[index1 + 1];
              userData.vertices[2] = particlesPositions.array[index1 + 2];
              
              userData.vertices[3] = particlesPositions.array[index2];
              userData.vertices[4] = particlesPositions.array[index2 + 1];
              userData.vertices[5] = particlesPositions.array[index2 + 2];
              
              // Update geometry if it exists
              if ('geometry' in object && (object as THREE.Line).geometry && 
                  (object as THREE.Line).geometry.attributes && 
                  (object as THREE.Line).geometry.attributes.position) {
                (object as THREE.Line).geometry.attributes.position.needsUpdate = true;
              }
            }
          }
        }
      }
    });
  };
  
  // Dots animation
  const animateDots = (time: number) => {
    const lineCount = Math.sqrt(density);
    const dotCount = objectsRef.current.length - lineCount;
    
    // Animate dots
    for (let i = 0; i < dotCount; i++) {
      const dot = objectsRef.current[i];
      
      if ((dot as any).userData) {
        const userData = (dot as any).userData;
        
        // Wave animation
        dot.position.y = userData.originalY + 
          Math.sin(time * userData.speed + userData.phase) * userData.amplitude;
      }
    }
    
    // Animate wave lines
    for (let i = dotCount; i < objectsRef.current.length; i++) {
      if (i >= objectsRef.current.length) break; // Safety check
      
      const line = objectsRef.current[i];
      if (!line) continue; // Skip if line object is undefined
      
      // Ensure userData exists and has points array
      if ((line as any).userData && 
          typeof (line as any).userData === 'object' && 
          (line as any).userData !== null && 
          (line as any).userData.points && 
          Array.isArray((line as any).userData.points)) {
          
        const userData = (line as any).userData;
        
        // Ensure line has geometry and position attributes
        if ('geometry' in line && (line as THREE.Line).geometry && 
            (line as THREE.Line).geometry.attributes && 
            (line as THREE.Line).geometry.attributes.position) {
          
          const positions = (line as THREE.Line).geometry.attributes.position.array;
          
          if (positions && positions.length > 0) {
            // Check if userData.speed and userData.amplitude exist
            if (typeof userData.speed === 'number' && typeof userData.amplitude === 'number') {
              // Update points in the line based on wave animation
              for (let j = 0; j < positions.length / 3; j++) {
                const index = j * 3;
                if (index + 2 < positions.length) {
                  const x = positions[index];
                  
                  // Calculate wave height
                  positions[index + 1] = Math.sin(time * userData.speed + x * 0.2) * userData.amplitude;
                }
              }
              
              // Update geometry
              (line as THREE.Line).geometry.attributes.position.needsUpdate = true;
            }
          }
        }
      }
    }
  };
  
  // Circuit animation
  const animateCircuit = (time: number) => {
    objectsRef.current.forEach(object => {
      if (!(object as any).userData) return;
      
      const userData = (object as any).userData;
      
      // Animate nodes
      if (userData.nodeId !== undefined) {
        if (userData.active) {
          // Pulsing effect for active nodes
          const scale = 1 + Math.sin(time * userData.pulseSpeed) * 0.3;
          object.scale.set(scale, scale, scale);
          
          // Randomly toggle state
          if (Math.random() < 0.001 * speed) {
            userData.active = false;
          }
        } else {
          // Inactive state
          object.scale.set(0.7, 0.7, 0.7);
          
          // Randomly reactivate
          if (Math.random() < 0.005 * speed) {
            userData.active = true;
          }
        }
      }
      
      // Animate connections
      if (userData.nodes !== undefined) {
        if (userData.active && 'material' in object && (object as THREE.Line).material) {
          // Pulse opacity for active connections
          (object as THREE.Line).material.opacity = 
            0.3 + Math.sin(time * userData.pulseSpeed) * 0.2;
          
          // Randomly deactivate
          if (Math.random() < 0.002 * speed) {
            userData.active = false;
          }
        } else {
          // Inactive state
          if ('material' in object && (object as THREE.Line).material) {
            (object as THREE.Line).material.opacity = 0.1;
          }
          
          // Randomly reactivate
          if (Math.random() < 0.003 * speed) {
            userData.active = true;
          }
        }
      }
      
      // Animate data packets
      if (userData.lineIndex !== undefined && userData.progress !== undefined) {
        if (userData.active) {
          // Get reference to the line this packet travels on
          const line = objectsRef.current[userData.lineIndex];
          
          if (line && (line as any).userData && (line as any).userData.nodes) {
            const lineUserData = (line as any).userData;
            
            // Get start and end node indices
            const node1Index = lineUserData.nodes[0];
            const node2Index = lineUserData.nodes[1];
            
            // Get node positions
            const node1 = objectsRef.current[node1Index];
            const node2 = objectsRef.current[node2Index];
            
            if (node1 && node2) {
              // Update progress
              userData.progress += userData.speed;
              
              // Interpolate position between nodes
              if (userData.progress > 1) {
                // Reset and potentially change direction
                userData.progress = 0;
                
                // Activate the node we arrive at
                const arrivalNodeObj = objectsRef.current[node2Index];
                if (arrivalNodeObj && (arrivalNodeObj as any).userData) {
                  const arrivalNode = (arrivalNodeObj as any).userData;
                  if (arrivalNode) {
                    arrivalNode.active = true;
                  }
                }
                
                // Randomly choose a new path
                if (Math.random() < 0.5) {
                  // Find another connection from this node
                  const connections = objectsRef.current.filter((obj, idx) => {
                    return (obj as any).userData && 
                           (obj as any).userData.nodes &&
                           ((obj as any).userData.nodes[0] === node2Index ||
                            (obj as any).userData.nodes[1] === node2Index);
                  });
                  
                  if (connections.length > 0) {
                    const newConnection = connections[Math.floor(Math.random() * connections.length)];
                    userData.lineIndex = objectsRef.current.indexOf(newConnection);
                  }
                }
              }
              
              // Set position
              object.position.lerpVectors(node1.position, node2.position, userData.progress);
            }
          }
        } else {
          // Inactive, hide packet
          if ('material' in object && (object as THREE.Mesh).material) {
            (object as THREE.Mesh).material.opacity = 0;
          }
          
          // Randomly activate
          if (Math.random() < 0.01 * speed) {
            userData.active = true;
            userData.progress = 0;
            
            if ('material' in object && (object as THREE.Mesh).material) {
              (object as THREE.Mesh).material.opacity = 0.8;
            }
          }
        }
      }
    });
  };
  
  return (
    <div
      ref={containerRef}
      className="absolute inset-0 overflow-hidden pointer-events-none z-0"
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full"
      />
    </div>
  );
}

export default HighTechBackground;