import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

interface CyberGridProps {
  rows?: number;
  columns?: number;
  cellSize?: number;
  color?: string;
  pulseColor?: string;
}

export function CyberGrid({
  rows = 15,
  columns = 20,
  cellSize = 30,
  color = "#3b82f6",
  pulseColor = "#60a5fa"
}: CyberGridProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>(0);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    // Set canvas size
    const width = columns * cellSize;
    const height = rows * cellSize;
    canvas.width = width;
    canvas.height = height;
    
    // Convert hex color to RGB
    const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : { r: 0, g: 0, b: 0 };
    };
    
    const baseColor = hexToRgb(color);
    const highlightColor = hexToRgb(pulseColor);
    
    // Initialize grid cells with random activity levels
    const cells = Array(rows).fill(null).map(() => 
      Array(columns).fill(null).map(() => ({
        active: Math.random() > 0.7,
        intensity: Math.random(),
        pulseSpeed: 0.5 + Math.random() * 1.5,
        pulseDirection: Math.random() > 0.5 ? 1 : -1
      }))
    );
    
    // Active random connections
    const connections: {from: {x: number, y: number}, to: {x: number, y: number}, life: number, maxLife: number}[] = [];
    
    const drawGrid = (time: number) => {
      ctx.clearRect(0, 0, width, height);
      
      // Draw grid lines
      ctx.strokeStyle = `rgba(${baseColor.r}, ${baseColor.g}, ${baseColor.b}, 0.1)`;
      ctx.lineWidth = 1;
      
      // Vertical lines
      for (let x = 0; x <= columns; x++) {
        const xPos = x * cellSize;
        ctx.beginPath();
        ctx.moveTo(xPos, 0);
        ctx.lineTo(xPos, height);
        ctx.stroke();
      }
      
      // Horizontal lines
      for (let y = 0; y <= rows; y++) {
        const yPos = y * cellSize;
        ctx.beginPath();
        ctx.moveTo(0, yPos);
        ctx.lineTo(width, yPos);
        ctx.stroke();
      }
      
      // Update and draw cells
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < columns; x++) {
          const cell = cells[y][x];
          
          // Update cell intensity with pulsing effect
          cell.intensity += 0.01 * cell.pulseSpeed * cell.pulseDirection;
          if (cell.intensity > 1) {
            cell.intensity = 1;
            cell.pulseDirection = -1;
          } else if (cell.intensity < 0.2) {
            cell.intensity = 0.2;
            cell.pulseDirection = 1;
            
            // Randomly change active state
            if (Math.random() > 0.99) {
              cell.active = !cell.active;
            }
          }
          
          // Draw active cells
          if (cell.active) {
            const centerX = x * cellSize + cellSize / 2;
            const centerY = y * cellSize + cellSize / 2;
            const radius = (cellSize / 4) * cell.intensity;
            
            // Glow effect
            const glow = ctx.createRadialGradient(
              centerX, centerY, 0,
              centerX, centerY, radius * 2
            );
            
            const alpha = 0.1 + cell.intensity * 0.4;
            glow.addColorStop(0, `rgba(${highlightColor.r}, ${highlightColor.g}, ${highlightColor.b}, ${alpha})`);
            glow.addColorStop(1, `rgba(${baseColor.r}, ${baseColor.g}, ${baseColor.b}, 0)`);
            
            ctx.fillStyle = glow;
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius * 2, 0, Math.PI * 2);
            ctx.fill();
            
            // Core
            ctx.fillStyle = `rgba(${highlightColor.r}, ${highlightColor.g}, ${highlightColor.b}, ${alpha * 1.5})`;
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius / 2, 0, Math.PI * 2);
            ctx.fill();
            
            // Randomly create new connections
            if (Math.random() > 0.995 && cell.intensity > 0.7) {
              const possibleTargets = [];
              
              // Look for active cells nearby
              for (let ny = Math.max(0, y - 3); ny < Math.min(rows, y + 4); ny++) {
                for (let nx = Math.max(0, x - 3); nx < Math.min(columns, x + 4); nx++) {
                  if ((nx !== x || ny !== y) && cells[ny][nx].active) {
                    possibleTargets.push({x: nx, y: ny});
                  }
                }
              }
              
              // Create a connection to a random target
              if (possibleTargets.length > 0) {
                const target = possibleTargets[Math.floor(Math.random() * possibleTargets.length)];
                connections.push({
                  from: {x, y},
                  to: target,
                  life: 0,
                  maxLife: 30 + Math.random() * 60
                });
              }
            }
          }
        }
      }
      
      // Update and draw connections
      for (let i = connections.length - 1; i >= 0; i--) {
        const connection = connections[i];
        connection.life++;
        
        // Remove expired connections
        if (connection.life > connection.maxLife) {
          connections.splice(i, 1);
          continue;
        }
        
        // Calculate connection lifecycle
        const lifecycle = connection.life / connection.maxLife;
        const alpha = lifecycle < 0.2 
          ? lifecycle / 0.2 
          : lifecycle > 0.8 
            ? (1 - lifecycle) / 0.2 
            : 1;
        
        // Draw connection line
        const fromX = connection.from.x * cellSize + cellSize / 2;
        const fromY = connection.from.y * cellSize + cellSize / 2;
        const toX = connection.to.x * cellSize + cellSize / 2;
        const toY = connection.to.y * cellSize + cellSize / 2;
        
        // Animated dash effect
        ctx.strokeStyle = `rgba(${highlightColor.r}, ${highlightColor.g}, ${highlightColor.b}, ${alpha * 0.8})`;
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.lineDashOffset = -time / 100;
        
        ctx.beginPath();
        ctx.moveTo(fromX, fromY);
        ctx.lineTo(toX, toY);
        ctx.stroke();
        
        // Reset line dash for other drawings
        ctx.setLineDash([]);
      }
      
      // Occasionally make new cells active
      if (Math.random() > 0.98) {
        const randomX = Math.floor(Math.random() * columns);
        const randomY = Math.floor(Math.random() * rows);
        cells[randomY][randomX].active = true;
      }
    };
    
    // Animation loop
    let lastTime = 0;
    const animate = (time: number) => {
      drawGrid(time);
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    
    animationFrameRef.current = requestAnimationFrame(animate);
    
    // Cleanup
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [rows, columns, cellSize, color, pulseColor]);
  
  return (
    <motion.div 
      className="w-full h-full overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.5 }}
    >
      <canvas 
        ref={canvasRef} 
        className="w-full h-full object-cover" 
        style={{ display: "block" }}
      />
    </motion.div>
  );
}