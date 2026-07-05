import React from 'react';
import { scrollToElement } from "@/lib/utils";

type ScrollIndicatorProps = {
  targetSection: string;
};

/**
 * A simple scroll indicator button that animates with CSS
 * Using pure inline styles to avoid any CSS transformation issues
 */
export default function ScrollIndicator({ targetSection }: ScrollIndicatorProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    scrollToElement(targetSection);
  };

  // Add keyframe animations to the document
  React.useEffect(() => {
    // Create style element for animations if it doesn't exist
    const id = 'scroll-indicator-styles';
    if (!document.getElementById(id)) {
      const style = document.createElement('style');
      style.id = id;
      style.textContent = `
        @keyframes pulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
          
        @keyframes scrollDot {
          0%, 100% { transform: translateY(0); opacity: 1; }
          50% { transform: translateY(1rem); opacity: 0.8; }
        }
      `;
      document.head.appendChild(style);
    }
    
    // Cleanup on unmount
    return () => {
      const styleEl = document.getElementById(id);
      if (styleEl) {
        styleEl.remove();
      }
    };
  }, []);

  return (
    <div style={{
      position: 'absolute',
      bottom: '-3rem',
      left: 0,
      right: 0,
      display: 'flex',
      justifyContent: 'center',
      zIndex: 10,
      width: '100%',
      pointerEvents: 'none',
      transform: 'translateZ(0)'
    }}>
      <button
        type="button"
        onClick={handleClick}
        aria-label={`Scroll to ${targetSection} section`}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          background: 'transparent',
          border: 'none',
          padding: 0,
          cursor: 'pointer',
          pointerEvents: 'auto'
        }}
      >
        <p style={{
          fontSize: '0.75rem',
          marginBottom: '0.5rem',
          fontWeight: 500,
          color: 'var(--primary-color, #4F46E5)',
          animation: 'pulse 2s ease-in-out infinite'
        }}>
          Scroll Down
        </p>
        
        <div style={{
          position: 'relative',
          width: '1.5rem',
          height: '2.5rem',
          borderRadius: '9999px',
          border: '2px solid rgba(var(--primary-rgb, 79, 70, 229), 0.4)',
          display: 'flex',
          justifyContent: 'center',
          paddingTop: '0.375rem',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          backgroundColor: 'rgba(255, 255, 255, 0.3)',
          backdropFilter: 'blur(4px)',
          overflow: 'hidden'
        }}>
          <div style={{
            width: '0.25rem',
            height: '0.5rem',
            borderRadius: '9999px',
            background: 'linear-gradient(to bottom, var(--primary-color, #4F46E5), var(--primary-accent-color, #818CF8))',
            animation: 'scrollDot 1.5s ease-in-out infinite'
          }} />
        </div>
      </button>
    </div>
  );
}