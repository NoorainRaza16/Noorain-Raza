import { useEffect, useRef } from 'react';

interface CyberFloatingParticlesProps {
  count?: number;
  color?: string;
  speed?: number;
  maxSize?: number;
  interactive?: boolean;
}

export function CyberFloatingParticles({
  count = 100,
  color = '#3b82f6',
  speed = 1,
  maxSize = 3,
  interactive = true
}: CyberFloatingParticlesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>(0);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas to full size
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    window.addEventListener('resize', handleResize);
    handleResize();
    
    // Mouse tracking
    let mouseX = 0;
    let mouseY = 0;
    let mouseRadius = 120;
    
    if (interactive) {
      canvas.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
      });
      
      canvas.addEventListener('touchmove', (e) => {
        if (e.touches[0]) {
          mouseX = e.touches[0].clientX;
          mouseY = e.touches[0].clientY;
        }
      });
      
      canvas.addEventListener('mouseleave', () => {
        mouseX = 0;
        mouseY = 0;
      });
    }
    
    // Particle system
    class Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      color: string;
      originalColor: string;
      originalOpacity: number;
      opacity: number;
      links: number;
      
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * speed * 0.4;
        this.vy = (Math.random() - 0.5) * speed * 0.4;
        this.size = Math.max(1, Math.random() * maxSize);
        this.originalOpacity = 0.2 + Math.random() * 0.4;
        this.opacity = this.originalOpacity;
        this.originalColor = color;
        this.color = color;
        this.links = 0;
      }
      
      update() {
        // Move particle
        this.x += this.vx;
        this.y += this.vy;
        
        // Bounce off edges
        if (this.x < 0 || this.x > canvas.width) this.vx = -this.vx;
        if (this.y < 0 || this.y > canvas.height) this.vy = -this.vy;
        
        // Reset color and opacity
        this.color = this.originalColor;
        this.opacity = this.originalOpacity;
        this.links = 0;
        
        // Mouse interaction
        if (interactive && mouseX && mouseY) {
          const dx = this.x - mouseX;
          const dy = this.y - mouseY;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < mouseRadius) {
            // Repel particles from mouse
            const force = (mouseRadius - distance) / mouseRadius;
            this.vx += dx * force * 0.02;
            this.vy += dy * force * 0.02;
            
            // Highlight particles near mouse
            this.color = '#60a5fa';
            this.opacity = Math.min(1, this.opacity * 1.5);
          }
        }
        
        // Limit speed
        const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        if (speed > 1.5) {
          this.vx = (this.vx / speed) * 1.5;
          this.vy = (this.vy / speed) * 1.5;
        }
      }
      
      draw(ctx: CanvasRenderingContext2D) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.globalAlpha = this.opacity;
        ctx.fill();
        ctx.globalAlpha = 1;
      }
    }
    
    // Create particles
    const particles: Particle[] = [];
    for (let i = 0; i < count; i++) {
      particles.push(new Particle());
    }
    
    // Draw connections between particles
    const drawConnections = () => {
      const maxDistance = 150;
      
      ctx.lineWidth = 0.5;
      ctx.strokeStyle = color;
      
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const p1 = particles[i];
          const p2 = particles[j];
          
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < maxDistance) {
            // Only draw a limited number of connections per particle
            if (p1.links < 3 && p2.links < 3) {
              p1.links++;
              p2.links++;
              
              const opacity = 1 - (distance / maxDistance);
              ctx.globalAlpha = opacity * 0.3;
              ctx.beginPath();
              ctx.moveTo(p1.x, p1.y);
              ctx.lineTo(p2.x, p2.y);
              ctx.stroke();
            }
          }
        }
      }
      
      ctx.globalAlpha = 1;
    };
    
    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Update and draw particles
      particles.forEach(particle => {
        particle.update();
        particle.draw(ctx);
      });
      
      // Draw connections
      drawConnections();
      
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    
    animate();
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, [count, color, speed, maxSize, interactive]);
  
  return (
    <canvas 
      ref={canvasRef} 
      className="absolute inset-0 z-0"
      style={{ pointerEvents: 'none' }}
    />
  );
}