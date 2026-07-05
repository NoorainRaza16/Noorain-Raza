import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface CyberHolographicEffectProps {
  width?: number;
  height?: number;
  linesCount?: number;
  color?: string;
  speed?: number;
  intensity?: number;
  responsive?: boolean;
}

export function CyberHolographicEffect({
  width = 400,
  height = 600,
  linesCount = 20,
  color = '#3b82f6',
  speed = 1,
  intensity = 0.7,
  responsive = true
}: CyberHolographicEffectProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number>(0);
  const [dimensions, setDimensions] = useState({ width, height });
  
  // Handle resize for responsive mode
  useEffect(() => {
    if (!responsive) {
      setDimensions({ width, height });
      return;
    }
    
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDimensions({
          width: rect.width,
          height: rect.height
        });
      }
    };
    
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    
    return () => window.removeEventListener('resize', updateDimensions);
  }, [responsive, width, height]);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas size
    canvas.width = dimensions.width;
    canvas.height = dimensions.height;
    
    // Convert hex to rgba
    const hexToRgba = (hex: string, alpha: number) => {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    };
    
    // Create scanner lines
    const scanLines = Array(linesCount).fill(null).map(() => ({
      y: Math.random() * height,
      height: 1 + Math.random() * 3,
      opacity: 0.1 + Math.random() * 0.3,
      speed: (0.5 + Math.random() * 1.5) * speed
    }));
    
    // Create glitch artifacts
    const glitchArtifacts = Array(10).fill(null).map(() => ({
      x: Math.random() * width,
      y: Math.random() * height,
      width: 20 + Math.random() * 30,
      height: 2 + Math.random() * 5,
      opacity: 0,
      duration: 10 + Math.random() * 50,
      current: 0
    }));
    
    // Animation state
    let time = 0;
    let glitchMode = false;
    let glitchTimer = 0;
    
    // Draw holographic scan lines
    const drawScanLines = () => {
      scanLines.forEach(line => {
        // Move line
        line.y += line.speed;
        if (line.y > height) {
          line.y = -line.height;
        }
        
        // Draw line
        ctx.globalAlpha = line.opacity * intensity;
        ctx.fillStyle = color;
        ctx.fillRect(0, line.y, width, line.height);
      });
      
      ctx.globalAlpha = 1;
    };
    
    // Draw noise effect
    const drawNoise = () => {
      const noiseIntensity = glitchMode ? 0.1 : 0.03;
      
      for (let i = 0; i < 100 * intensity; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const size = 1 + Math.random() * 2;
        
        ctx.globalAlpha = Math.random() * noiseIntensity * intensity;
        ctx.fillStyle = color;
        ctx.fillRect(x, y, size, size);
      }
      
      ctx.globalAlpha = 1;
    };
    
    // Draw glitch artifacts
    const drawGlitchArtifacts = () => {
      if (!glitchMode) return;
      
      glitchArtifacts.forEach(artifact => {
        if (Math.random() > 0.7) {
          artifact.x = Math.random() * width;
          artifact.y = Math.random() * height;
          artifact.width = 20 + Math.random() * 30;
          artifact.height = 2 + Math.random() * 5;
          artifact.opacity = 0.5 + Math.random() * 0.5;
        }
        
        ctx.globalAlpha = artifact.opacity * intensity;
        ctx.fillStyle = hexToRgba(color, 0.7);
        ctx.fillRect(artifact.x, artifact.y, artifact.width, artifact.height);
      });
      
      ctx.globalAlpha = 1;
    };
    
    // Add holographic grid
    const drawGrid = () => {
      const gridSize = 40;
      ctx.strokeStyle = hexToRgba(color, 0.15 * intensity);
      ctx.lineWidth = 1;
      
      // Vertical lines
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      
      // Horizontal lines
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
    };
    
    // Create border effect
    const drawBorder = () => {
      const borderWidth = 2;
      const borderGlow = 10;
      
      // Main border
      ctx.strokeStyle = color;
      ctx.lineWidth = borderWidth;
      ctx.strokeRect(0, 0, width, height);
      
      // Glow effect
      const glow = ctx.createLinearGradient(0, 0, width, height);
      glow.addColorStop(0, hexToRgba(color, 0));
      glow.addColorStop(0.5, hexToRgba(color, 0.5 * intensity));
      glow.addColorStop(1, hexToRgba(color, 0));
      
      ctx.strokeStyle = glow;
      ctx.lineWidth = borderGlow;
      ctx.strokeRect(
        -borderGlow / 2, 
        -borderGlow / 2, 
        width + borderGlow, 
        height + borderGlow
      );
    };
    
    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      
      time += 0.01 * speed;
      
      // Random glitch mode trigger
      if (Math.random() > 0.995) {
        glitchMode = true;
        glitchTimer = 15 + Math.random() * 30;
      }
      
      // Handle glitch timer
      if (glitchMode) {
        glitchTimer--;
        if (glitchTimer <= 0) {
          glitchMode = false;
        }
      }
      
      // Draw effects
      drawGrid();
      drawScanLines();
      drawGlitchArtifacts();
      drawNoise();
      drawBorder();
      
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    
    animate();
    
    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, [width, height, linesCount, color, speed, intensity]);
  
  return (
    <motion.div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 w-full h-full pointer-events-none"
      />
    </motion.div>
  );
}