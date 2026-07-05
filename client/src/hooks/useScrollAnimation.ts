import { useEffect } from "react";

// Animation types for different entrances
export type AnimationType = 
  | 'fade-in'
  | 'fade-up'
  | 'fade-down'
  | 'fade-left'
  | 'fade-right'
  | 'zoom-in'
  | 'zoom-out'
  | 'flip-up'
  | 'flip-down'
  | 'slide-up'
  | 'slide-down'
  | 'slide-left'
  | 'slide-right'
  | 'rotate-in';

interface AnimationProps {
  selector: string;
  threshold?: number;
  rootMargin?: string;
  animation?: AnimationType | string;
  delay?: number;
  duration?: number;
  staggerChildren?: number;
  once?: boolean;
  offset?: number;
}

// Animation classes mapping - we'll use Tailwind animations
const animationClasses: Record<AnimationType, string> = {
  'fade-in': 'animate-fadeIn',
  'fade-up': 'animate-fadeInUp',
  'fade-down': 'animate-fadeInDown',
  'fade-left': 'animate-fadeInLeft',
  'fade-right': 'animate-fadeInRight',
  'zoom-in': 'animate-zoomIn',
  'zoom-out': 'animate-zoomOut',
  'flip-up': 'animate-flipUp',
  'flip-down': 'animate-flipDown',
  'slide-up': 'animate-slideUp',
  'slide-down': 'animate-slideDown',
  'slide-left': 'animate-slideLeft',
  'slide-right': 'animate-slideRight',
  'rotate-in': 'animate-rotateIn',
};

// Custom CSS for animations (will be injected into document if necessary)
const animationStyles = `
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @keyframes fadeInUp {
    from { opacity: 0; transform: translate3d(0, 20px, 0); }
    to { opacity: 1; transform: translate3d(0, 0, 0); }
  }
  
  @keyframes fadeInDown {
    from { opacity: 0; transform: translate3d(0, -20px, 0); }
    to { opacity: 1; transform: translate3d(0, 0, 0); }
  }
  
  @keyframes fadeInLeft {
    from { opacity: 0; transform: translate3d(-20px, 0, 0); }
    to { opacity: 1; transform: translate3d(0, 0, 0); }
  }
  
  @keyframes fadeInRight {
    from { opacity: 0; transform: translate3d(20px, 0, 0); }
    to { opacity: 1; transform: translate3d(0, 0, 0); }
  }
  
  @keyframes zoomIn {
    from { opacity: 0; transform: scale3d(0.8, 0.8, 0.8); }
    to { opacity: 1; transform: scale3d(1, 1, 1); }
  }
  
  @keyframes zoomOut {
    from { opacity: 0; transform: scale3d(1.2, 1.2, 1.2); }
    to { opacity: 1; transform: scale3d(1, 1, 1); }
  }
  
  @keyframes flipUp {
    from { opacity: 0; transform: perspective(400px) rotate3d(1, 0, 0, 90deg); }
    to { opacity: 1; transform: perspective(400px) rotate3d(1, 0, 0, 0deg); }
  }
  
  @keyframes flipDown {
    from { opacity: 0; transform: perspective(400px) rotate3d(1, 0, 0, -90deg); }
    to { opacity: 1; transform: perspective(400px) rotate3d(1, 0, 0, 0deg); }
  }
  
  @keyframes slideUp {
    from { transform: translate3d(0, 100%, 0); visibility: visible; }
    to { transform: translate3d(0, 0, 0); }
  }
  
  @keyframes slideDown {
    from { transform: translate3d(0, -100%, 0); visibility: visible; }
    to { transform: translate3d(0, 0, 0); }
  }
  
  @keyframes slideLeft {
    from { transform: translate3d(-100%, 0, 0); visibility: visible; }
    to { transform: translate3d(0, 0, 0); }
  }
  
  @keyframes slideRight {
    from { transform: translate3d(100%, 0, 0); visibility: visible; }
    to { transform: translate3d(0, 0, 0); }
  }
  
  @keyframes rotateIn {
    from { opacity: 0; transform: rotate3d(0, 0, 1, -45deg); }
    to { opacity: 1; transform: rotate3d(0, 0, 1, 0deg); }
  }
  
  .animate-fadeIn { animation: fadeIn 0.8s ease forwards; }
  .animate-fadeInUp { animation: fadeInUp 0.8s ease forwards; }
  .animate-fadeInDown { animation: fadeInDown 0.8s ease forwards; }
  .animate-fadeInLeft { animation: fadeInLeft 0.8s ease forwards; }
  .animate-fadeInRight { animation: fadeInRight 0.8s ease forwards; }
  .animate-zoomIn { animation: zoomIn 0.8s ease forwards; }
  .animate-zoomOut { animation: zoomOut 0.8s ease forwards; }
  .animate-flipUp { animation: flipUp 0.8s ease forwards; }
  .animate-flipDown { animation: flipDown 0.8s ease forwards; }
  .animate-slideUp { animation: slideUp 0.8s ease forwards; }
  .animate-slideDown { animation: slideDown 0.8s ease forwards; }
  .animate-slideLeft { animation: slideLeft 0.8s ease forwards; }
  .animate-slideRight { animation: slideRight 0.8s ease forwards; }
  .animate-rotateIn { animation: rotateIn 0.8s ease forwards; }
`;

// Makes sure our animation styles are injected once
let stylesInjected = false;

const useScrollAnimation = ({
  selector,
  threshold = 0.1,
  rootMargin = "0px",
  animation = 'fade-up',
  delay = 0,
  duration = 0.8,
  staggerChildren = 0.1,
  once = true,
  offset = 0,
}: AnimationProps) => {
  useEffect(() => {
    // Check if we're in a browser environment
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return;
    }

    try {
      // Inject animation styles if they haven't been already
      if (!stylesInjected) {
        const styleElement = document.createElement('style');
        styleElement.innerHTML = animationStyles;
        document.head.appendChild(styleElement);
        stylesInjected = true;
      }

      // Get animation class
      const animClass = animationClasses[animation as AnimationType] || animation;

      const observerCallback = (entries: IntersectionObserverEntry[]) => {
        entries.forEach((entry, index) => {
          if (entry.isIntersecting) {
            const element = entry.target as HTMLElement;
            
            // Calculate delay based on staggering and any existing data-delay
            let finalDelay = delay;
            
            // If it's part of staggering children
            if (staggerChildren > 0) {
              const childIndex = parseInt(element.dataset.index || "0", 10);
              finalDelay += childIndex * staggerChildren;
            }
            
            // Apply delay and animation
            element.style.animationDelay = `${finalDelay}s`;
            element.style.animationDuration = `${duration}s`;
            element.classList.add(animClass);
            element.style.opacity = "1";
            
            // Unobserve element if once is true
            if (once) {
              observer.unobserve(element);
            }
          } else if (!once) {
            // If we want to replay the animation when element leaves the viewport
            const element = entry.target as HTMLElement;
            element.classList.remove(animClass);
            element.style.opacity = "0";
          }
        });
      };

      const observer = new IntersectionObserver(observerCallback, {
        threshold,
        rootMargin: `${offset}px ${rootMargin}`,
      });

      // Get all elements that match the selector
      const elements = document.querySelectorAll(selector);
      
      // Set initial opacity and observe each element
      elements.forEach((element, index) => {
        const el = element as HTMLElement;
        el.style.opacity = "0";
        el.style.transform = "translateZ(0)"; // Hardware acceleration
        el.dataset.index = index.toString(); // Store index for staggering
        observer.observe(el);
      });

      // Cleanup observer on component unmount
      return () => {
        elements.forEach((element) => {
          observer.unobserve(element);
        });
      };
    } catch (error) {
      // Silently handle any errors to prevent crashes
      console.error('ScrollAnimation error:', error);
    }
  }, [selector, threshold, rootMargin, animation, delay, duration, staggerChildren, once, offset]);
};

export default useScrollAnimation;
