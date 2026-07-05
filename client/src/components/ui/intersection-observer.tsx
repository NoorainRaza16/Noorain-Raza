import React, { useEffect, useRef } from 'react';

interface IntersectionObserverProps {
  onIntersect: () => void;
  rootMargin?: string;
  threshold?: number;
  triggerOnce?: boolean;
  children: React.ReactNode;
  className?: string;
}

/**
 * Component that triggers a callback when it enters the viewport
 * Useful for prefetching content just before it's needed
 */
export function IntersectionObserver({
  onIntersect,
  rootMargin = '200px 0px',
  threshold = 0.1,
  triggerOnce = true,
  children,
  className = '',
}: IntersectionObserverProps) {
  const ref = useRef<HTMLDivElement>(null);
  const callback = useRef(onIntersect);
  
  // Update callback ref if it changes
  useEffect(() => {
    callback.current = onIntersect;
  }, [onIntersect]);

  useEffect(() => {
    const currentRef = ref.current;
    let observer: globalThis.IntersectionObserver;
    
    if (currentRef) {
      observer = new globalThis.IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              callback.current();
              
              if (triggerOnce && observer) {
                observer.disconnect();
              }
            }
          });
        },
        { rootMargin, threshold }
      );
      
      observer.observe(currentRef);
    }
    
    return () => {
      if (observer && currentRef) {
        observer.unobserve(currentRef);
        observer.disconnect();
      }
    };
  }, [rootMargin, threshold, triggerOnce]);

  return (
    <div ref={ref} className={className} style={{ position: 'relative' }}>
      {children}
    </div>
  );
}

export default IntersectionObserver;