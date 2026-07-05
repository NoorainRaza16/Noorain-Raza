import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import * as THREE from 'three';

interface Cyber3DShieldProps {
  size?: number;
  color?: string;
  pulseColor?: string;
  pulseIntensity?: number;
  rotationSpeed?: number;
  responsive?: boolean;
}

export function Cyber3DShield({
  size = 120,
  color = '#3b82f6',
  pulseColor = '#60a5fa',
  pulseIntensity = 2,
  rotationSpeed = 0.5,
  responsive = true
}: Cyber3DShieldProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const [actualSize, setActualSize] = useState(size);
  
  // Update size based on container size for responsive mode
  useEffect(() => {
    if (!responsive) {
      setActualSize(size);
      return;
    }
    
    const updateSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const newSize = Math.min(rect.width, rect.height, 200); // Cap at 200px max
        setActualSize(newSize);
      }
    };
    
    updateSize();
    window.addEventListener('resize', updateSize);
    
    return () => window.removeEventListener('resize', updateSize);
  }, [responsive, size]);
  
  useEffect(() => {
    if (!containerRef.current) return;
    
    // Scene setup
    const scene = new THREE.Scene();
    
    // Camera setup
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 1000);
    camera.position.z = 5;
    
    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ 
      alpha: true,
      antialias: true
    });
    renderer.setSize(actualSize, actualSize);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;
    
    // Create a clock for animation timing
    const clock = new THREE.Clock();
    
    // Convert hex to THREE.Color
    const mainColor = new THREE.Color(color);
    const glowColor = new THREE.Color(pulseColor);
    
    // Create advanced shield geometry
    const shieldGroup = new THREE.Group();
    scene.add(shieldGroup);
    
    // Create base shield with hexagonal design
    const baseShieldGeometry = new THREE.CylinderGeometry(1.5, 1.7, 0.2, 6, 1);
    baseShieldGeometry.rotateY(Math.PI / 6); // Align flat side
    
    // Create outer shield pieces
    const topShieldGeometry = new THREE.ConeGeometry(1.5, 2.2, 6);
    topShieldGeometry.rotateY(Math.PI / 6); // Align flat side
    topShieldGeometry.rotateX(Math.PI); // Flip cone
    topShieldGeometry.translate(0, 1.2, 0); // Position above base
    
    // Shield materials with different effects
    const shieldMaterial = new THREE.MeshPhongMaterial({
      color: mainColor,
      transparent: true,
      opacity: 0.8,
      specular: 0xffffff,
      shininess: 100,
      side: THREE.DoubleSide
    });
    
    const innerGlowMaterial = new THREE.MeshBasicMaterial({
      color: glowColor,
      transparent: true,
      opacity: 0.4,
      side: THREE.FrontSide
    });
    
    // Create mesh components
    const baseShield = new THREE.Mesh(baseShieldGeometry, shieldMaterial);
    const topShield = new THREE.Mesh(topShieldGeometry, shieldMaterial);
    
    // Create inner glow components
    const innerBaseShield = new THREE.Mesh(
      baseShieldGeometry.clone(),
      innerGlowMaterial
    );
    innerBaseShield.scale.set(0.9, 0.9, 0.9);
    
    const innerTopShield = new THREE.Mesh(
      topShieldGeometry.clone(),
      innerGlowMaterial
    );
    innerTopShield.scale.set(0.9, 0.9, 0.9);
    
    // Add all components to the shield group
    shieldGroup.add(baseShield, topShield, innerBaseShield, innerTopShield);
    
    // Create shield edges (borders)
    const baseEdgesGeometry = new THREE.EdgesGeometry(baseShieldGeometry);
    const topEdgesGeometry = new THREE.EdgesGeometry(topShieldGeometry);
    
    const edgesMaterial = new THREE.LineBasicMaterial({
      color: mainColor,
      transparent: true,
      opacity: 0.9,
    });
    
    const baseEdges = new THREE.LineSegments(baseEdgesGeometry, edgesMaterial);
    const topEdges = new THREE.LineSegments(topEdgesGeometry, edgesMaterial);
    
    shieldGroup.add(baseEdges, topEdges);
    
    // Add advanced cybersecurity emblem to shield
    const emblemGroup = new THREE.Group();
    
    // Create a more advanced security icon - biometric/neural network inspired
    const emblemMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.95
    });
    
    const glowEmblemMaterial = new THREE.MeshBasicMaterial({
      color: glowColor,
      transparent: true,
      opacity: 0.8
    });
    
    // Central node
    const centralNode = new THREE.Mesh(
      new THREE.SphereGeometry(0.15, 16, 16),
      glowEmblemMaterial
    );
    centralNode.position.set(0, 0, 0.2);
    emblemGroup.add(centralNode);
    
    // Create neural network nodes
    const createNetworkNode = (x, y, size = 0.06) => {
      const node = new THREE.Mesh(
        new THREE.SphereGeometry(size, 12, 12),
        emblemMaterial
      );
      node.position.set(x, y, 0.2);
      return node;
    };
    
    // Add network nodes in a pattern
    const nodes = [
      createNetworkNode(-0.3, 0.3),
      createNetworkNode(0.3, 0.3),
      createNetworkNode(-0.3, -0.3),
      createNetworkNode(0.3, -0.3),
      createNetworkNode(0, 0.4, 0.08),
      createNetworkNode(0, -0.4, 0.08),
      createNetworkNode(-0.4, 0, 0.08),
      createNetworkNode(0.4, 0, 0.08),
    ];
    
    // Add nodes to emblem group
    nodes.forEach(node => emblemGroup.add(node));
    
    // Create connection lines between nodes
    const createConnection = (from, to) => {
      // Calculate positions
      const fromPos = from.position;
      const toPos = to.position;
      
      // Create direction vector
      const direction = new THREE.Vector3().subVectors(toPos, fromPos);
      const length = direction.length();
      
      // Create cylinder for line
      const connectionGeometry = new THREE.CylinderGeometry(0.01, 0.01, length, 8);
      
      // Align cylinder with direction
      const connectionMesh = new THREE.Mesh(connectionGeometry, emblemMaterial);
      connectionMesh.position.copy(fromPos);
      connectionMesh.position.lerp(toPos, 0.5);
      connectionMesh.lookAt(toPos);
      connectionMesh.rotateX(Math.PI / 2);
      
      return connectionMesh;
    };
    
    // Connect all nodes to center
    nodes.forEach(node => {
      const connection = createConnection(centralNode, node);
      emblemGroup.add(connection);
    });
    
    // Connect some nodes to each other
    emblemGroup.add(createConnection(nodes[0], nodes[1]));
    emblemGroup.add(createConnection(nodes[2], nodes[3]));
    emblemGroup.add(createConnection(nodes[4], nodes[5]));
    emblemGroup.add(createConnection(nodes[6], nodes[7]));
    
    // Add a ring around the central node
    const securityRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.4, 0.03, 16, 32),
      glowEmblemMaterial
    );
    securityRing.rotation.x = Math.PI / 2;
    securityRing.position.z = 0.2;
    emblemGroup.add(securityRing);
    
    // Add outer protective ring
    const outerRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.7, 0.02, 16, 48),
      glowEmblemMaterial
    );
    outerRing.rotation.x = Math.PI / 2;
    outerRing.position.z = 0.2;
    emblemGroup.add(outerRing);
    
    // Create pulsing scan effects
    const scanRing = new THREE.Mesh(
      new THREE.RingGeometry(0.15, 0.17, 32),
      new THREE.MeshBasicMaterial({
        color: glowColor,
        transparent: true,
        opacity: 0.8,
        side: THREE.DoubleSide
      })
    );
    scanRing.rotation.x = Math.PI / 2;
    scanRing.position.z = 0.2;
    emblemGroup.add(scanRing);
    
    emblemGroup.position.set(0, 0.1, 0.2);
    shieldGroup.add(emblemGroup);
    
    // Add digital circuit patterns on shield
    const circuitGroup = new THREE.Group();
    
    // Create circuit lines
    const createCircuitLine = (startX, startY, width, height, rotation = 0) => {
      const lineGeometry = new THREE.PlaneGeometry(width, height);
      const lineMaterial = new THREE.MeshBasicMaterial({
        color: glowColor,
        transparent: true,
        opacity: 0.6,
      });
      
      const line = new THREE.Mesh(lineGeometry, lineMaterial);
      line.position.set(startX, startY, 0.15);
      line.rotation.z = rotation;
      return line;
    };
    
    // Add horizontal and vertical circuit lines
    circuitGroup.add(
      createCircuitLine(-0.5, -0.3, 0.8, 0.03),
      createCircuitLine(0.5, 0.3, 0.8, 0.03),
      createCircuitLine(-0.2, 0.5, 0.03, 0.6),
      createCircuitLine(0.2, -0.2, 0.03, 0.4),
      createCircuitLine(-0.3, -0.7, 0.4, 0.03),
      createCircuitLine(0.4, -0.5, 0.03, 0.3, Math.PI / 4)
    );
    
    // Add nodes at circuit intersections
    const createNode = (x, y, size = 0.08) => {
      const nodeGeometry = new THREE.CircleGeometry(size, 16);
      const nodeMaterial = new THREE.MeshBasicMaterial({
        color: glowColor,
        transparent: true,
        opacity: 0.7,
      });
      
      const node = new THREE.Mesh(nodeGeometry, nodeMaterial);
      node.position.set(x, y, 0.16);
      return node;
    };
    
    // Add circuit nodes
    circuitGroup.add(
      createNode(-0.5, -0.3, 0.05),
      createNode(0.5, 0.3, 0.05),
      createNode(-0.2, 0.5, 0.05),
      createNode(0.2, -0.2, 0.05),
      createNode(-0.3, -0.7, 0.05),
      createNode(0.4, -0.5, 0.05)
    );
    
    shieldGroup.add(circuitGroup);
    
    // Create outer energy field (orbiting particles)
    const particleGroup = new THREE.Group();
    scene.add(particleGroup);
    
    // Primary particle system (orbiting dots)
    const particleCount = 150;
    const particleGeometry = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleSizes = new Float32Array(particleCount);
    const particleColors = new Float32Array(particleCount * 3);
    const particleSpeedFactors = new Float32Array(particleCount);
    const particleOrbitRadii = new Float32Array(particleCount);
    const particleOrbitPhases = new Float32Array(particleCount);
    
    for (let i = 0; i < particleCount; i++) {
      // Randomize starting positions in a sphere around the shield
      const radius = 2 + Math.random() * 1.5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      
      particlePositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      particlePositions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      particlePositions[i * 3 + 2] = radius * Math.cos(phi);
      
      // Randomize colors between main color and glow color
      const colorFactor = Math.random();
      particleColors[i * 3] = mainColor.r * (1 - colorFactor) + glowColor.r * colorFactor;
      particleColors[i * 3 + 1] = mainColor.g * (1 - colorFactor) + glowColor.g * colorFactor;
      particleColors[i * 3 + 2] = mainColor.b * (1 - colorFactor) + glowColor.b * colorFactor;
      
      // Randomize size and animation parameters
      particleSizes[i] = 0.05 + Math.random() * 0.1;
      particleSpeedFactors[i] = 0.5 + Math.random() * 1.5;
      particleOrbitRadii[i] = 1.8 + Math.random() * 2;
      particleOrbitPhases[i] = Math.random() * Math.PI * 2;
    }
    
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    particleGeometry.setAttribute('size', new THREE.BufferAttribute(particleSizes, 1));
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));
    
    // Create sprite-based particle material
    const particleMaterial = new THREE.PointsMaterial({
      size: 0.12,
      transparent: true,
      opacity: 0.7,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    });
    
    // Create particle system
    const particles = new THREE.Points(particleGeometry, particleMaterial);
    particleGroup.add(particles);
    
    // Create energy beam effects
    const beamGroup = new THREE.Group();
    
    // Create energy beams that flow into the shield
    const beamCount = 6;
    const beams = [];
    
    for (let i = 0; i < beamCount; i++) {
      const angle = (i / beamCount) * Math.PI * 2;
      const radius = 2.5;
      
      const beamGeometry = new THREE.CylinderGeometry(0.03, 0.03, 2, 8);
      beamGeometry.rotateX(Math.PI / 2);
      
      const beamMaterial = new THREE.MeshBasicMaterial({
        color: glowColor,
        transparent: true,
        opacity: 0.5,
      });
      
      const beam = new THREE.Mesh(beamGeometry, beamMaterial);
      beam.position.set(
        Math.cos(angle) * radius,
        Math.sin(angle) * radius * 0.6,
        0
      );
      beam.lookAt(0, 0, 0);
      
      beams.push({
        mesh: beam,
        initialOpacity: 0.5,
        pulsePhase: Math.random() * Math.PI * 2,
        pulseSpeed: 0.05 + Math.random() * 0.05,
      });
      
      beamGroup.add(beam);
    }
    
    scene.add(beamGroup);
    
    // Add scanning effect
    const scanGroup = new THREE.Group();
    
    // Create scanning plane that moves up and down the shield
    const scanPlaneGeometry = new THREE.PlaneGeometry(3, 0.05);
    const scanPlaneMaterial = new THREE.MeshBasicMaterial({
      color: glowColor,
      transparent: true,
      opacity: 0.7,
      side: THREE.DoubleSide,
    });
    
    const scanPlane = new THREE.Mesh(scanPlaneGeometry, scanPlaneMaterial);
    scanPlane.position.z = 0.1;
    scanGroup.add(scanPlane);
    shieldGroup.add(scanGroup);
    
    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);
    
    const pointLight = new THREE.PointLight(glowColor, 1, 10);
    pointLight.position.set(0, 0, 3);
    scene.add(pointLight);
    
    // Animation variables
    let frame = 0;
    
    // Animation loop
    const animate = () => {
      const animationId = requestAnimationFrame(animate);
      
      // Get elapsed time
      const time = clock.getElapsedTime();
      
      // Shield rotation animation
      shieldGroup.rotation.y += rotationSpeed * 0.01;
      
      // Shield floating animation
      shieldGroup.position.y = Math.sin(time * 0.8) * 0.1;
      
      // Pulse the shield and inner glow
      const pulseFactor = (Math.sin(time * 2) * 0.5 + 0.5) * pulseIntensity;
      
      // Scale the inner glow components
      innerBaseShield.scale.set(
        0.92 + pulseFactor * 0.08,
        0.92 + pulseFactor * 0.08,
        0.92 + pulseFactor * 0.08
      );
      
      innerTopShield.scale.set(
        0.92 + pulseFactor * 0.08,
        0.92 + pulseFactor * 0.08,
        0.92 + pulseFactor * 0.08
      );
      
      // Pulse the inner glow opacity
      innerGlowMaterial.opacity = 0.3 + pulseFactor * 0.3;
      
      // Animate the emblem - advanced neural network effects
      emblemGroup.rotation.y = shieldGroup.rotation.y * -0.5; // Counter-rotate partially
      
      // Scale emblem with pulse
      emblemGroup.scale.set(
        1 + pulseFactor * 0.05,
        1 + pulseFactor * 0.05,
        1 + pulseFactor * 0.05
      );
      
      // Animate neural network nodes (pulse, glow and slight movement)
      nodes.forEach((node, index) => {
        // Pulse the nodes with slight offset between them
        const nodePulse = 0.8 + Math.sin(time * 3 + index * 0.5) * 0.2;
        node.scale.set(nodePulse, nodePulse, nodePulse);
        
        // Slight movement of outer nodes
        if (index < 4) { // The corner nodes
          const moveRadius = 0.05;
          const moveSpeed = 0.8;
          const originalX = (index % 2 === 0 ? -0.3 : 0.3);
          const originalY = (index < 2 ? 0.3 : -0.3);
          
          node.position.x = originalX + Math.sin(time * moveSpeed + index) * moveRadius;
          node.position.y = originalY + Math.cos(time * moveSpeed + index * 0.7) * moveRadius;
        }
      });
      
      // Animate the central node with a stronger pulse
      const centerPulse = 1 + Math.sin(time * 4) * 0.2;
      centralNode.scale.set(centerPulse, centerPulse, centerPulse);
      
      // Animate the security rings
      securityRing.rotation.z += 0.01;
      outerRing.rotation.z -= 0.005;
      
      // Animate the scan effect
      scanRing.scale.set(
        1 + Math.sin(time * 5) * 0.3,
        1 + Math.sin(time * 5) * 0.3,
        1
      );
      
      // Animate circuit nodes (pulse them)
      circuitGroup.children.forEach((child, index) => {
        if (index >= 6) { // Nodes start at index 6
          (child as THREE.Mesh).material.opacity = 
            0.5 + Math.sin(time * 3 + index) * 0.3;
        }
      });
      
      // Animate energy beams
      beams.forEach((beam, index) => {
        // Pulse beam opacity
        const beamPulse = Math.sin(time * beam.pulseSpeed + beam.pulsePhase) * 0.5 + 0.5;
        beam.mesh.material.opacity = beam.initialOpacity * (0.7 + beamPulse * 0.3);
        
        // Rotate beams around shield
        const angle = (index / beamCount) * Math.PI * 2 + time * 0.1;
        const radius = 2.5;
        
        beam.mesh.position.set(
          Math.cos(angle) * radius,
          Math.sin(angle) * radius * 0.6,
          0
        );
        beam.mesh.lookAt(0, 0, 0);
      });
      
      // Animate scanning effect
      scanPlane.position.y = Math.sin(time * 0.5) * 1.5;
      scanPlane.material.opacity = 0.3 + Math.sin(time * 2) * 0.2;
      
      // Animate particles
      const positions = particles.geometry.attributes.position.array as Float32Array;
      const sizes = particles.geometry.attributes.size.array as Float32Array;
      
      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        
        // Calculate orbit motion for each particle
        const orbitSpeed = time * 0.5 * particleSpeedFactors[i];
        const orbitRadius = particleOrbitRadii[i];
        const orbitPhase = particleOrbitPhases[i] + orbitSpeed;
        
        // Calculate new position based on spherical coordinates
        const theta = orbitPhase;
        const phi = Math.sin(time * 0.2 + i * 0.1) * 0.2 + Math.PI / 2;
        
        positions[i3] = orbitRadius * Math.sin(phi) * Math.cos(theta);
        positions[i3 + 1] = orbitRadius * Math.sin(phi) * Math.sin(theta);
        positions[i3 + 2] = orbitRadius * Math.cos(phi);
        
        // Pulse particle sizes
        sizes[i] = particleSizes[i] * (0.8 + Math.sin(time * 2 + i * 0.3) * 0.2);
      }
      
      particles.geometry.attributes.position.needsUpdate = true;
      particles.geometry.attributes.size.needsUpdate = true;
      
      // Render scene
      renderer.render(scene, camera);
      frame++;
    };
    
    animate();
    
    // Handle window resize
    const handleResize = () => {
      if (!containerRef.current || !renderer) return;
      
      const newSize = Math.min(
        containerRef.current.clientWidth,
        containerRef.current.clientHeight
      );
      
      camera.aspect = 1;
      camera.updateProjectionMatrix();
      
      renderer.setSize(newSize, newSize);
    };
    
    window.addEventListener('resize', handleResize);
    handleResize();
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
      
      renderer.dispose();
      scene.clear();
    };
  }, [size, color, pulseColor, pulseIntensity, rotationSpeed]);
  
  return (
    <motion.div 
      ref={containerRef}
      className="flex items-center justify-center w-full h-full"
      style={{ minWidth: size / 2, minHeight: size / 2 }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    />
  );
}