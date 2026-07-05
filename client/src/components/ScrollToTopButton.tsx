import { useState, useEffect } from "react";
import { ChevronUpIcon } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

// Simple scroll button without any animations or framer-motion
export function ScrollToTopButton() {
  const [isVisible, setIsVisible] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    const toggleVisibility = () => {
      const scrollThreshold = isMobile ? 300 : 500;
      if (window.scrollY > scrollThreshold) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);
    toggleVisibility();
    
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, [isMobile]);

  // Simple handler with no additional logic
  const handleScrollToTop = () => {
    window.scrollTo(0, 0);
  };

  // Only render the button if it should be visible
  if (!isVisible) return null;

  return (
    <button
      type="button"
      onClick={handleScrollToTop}
      aria-label="Scroll to top"
      style={{
        position: 'fixed',
        bottom: isMobile ? '80px' : '32px',
        right: isMobile ? '16px' : '32px',
        width: isMobile ? '40px' : '48px',
        height: isMobile ? '40px' : '48px',
        borderRadius: '9999px',
        backgroundColor: 'var(--primary-color, #4F46E5)',
        color: 'white',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 4px 14px 0 rgba(0, 0, 0, 0.25)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        zIndex: 50,
        padding: 0,
        transform: 'translateZ(0)',
        transition: 'background-color 0.3s ease'
      }}
    >
      <ChevronUpIcon style={{ 
        width: isMobile ? '20px' : '24px', 
        height: isMobile ? '20px' : '24px'
      }} />
    </button>
  );
}

export default ScrollToTopButton;