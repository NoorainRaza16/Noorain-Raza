import React, { useEffect, useState, useRef } from 'react';
import { useInView } from '@/utils/performance';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface LazyLoadProps {
  children: React.ReactNode;
  height?: string | number;
  width?: string | number;
  threshold?: number;
  rootMargin?: string;
  placeholder?: React.ReactNode;
  className?: string;
  onVisible?: () => void;
  once?: boolean;
}

/**
 * A component that lazily renders its children when they come into view
 * Helps improve performance by deferring rendering and associated work
 *
 * @example
 * <LazyLoad height="300px">
 *   <ExpensiveComponent />
 * </LazyLoad>
 *
 * @example
 * <LazyLoad 
 *   threshold={0.5} 
 *   rootMargin="100px" 
 *   placeholder={<Skeleton />}
 *   onVisible={() => console.log('Component is visible')}
 * >
 *   <DataTable data={largeDataset} />
 * </LazyLoad>
 */
export function LazyLoad({
  children,
  height,
  width,
  threshold = 0,
  rootMargin = '0px',
  placeholder,
  className = '',
  onVisible,
  once = true,
}: LazyLoadProps) {
  const [shouldRender, setShouldRender] = useState(false);
  const { ref, isInView } = useInView(rootMargin, threshold);
  const loadedOnce = useRef(false);
  
  useEffect(() => {
    // Handle visibility state changes
    if (isInView && !shouldRender) {
      // If we should only load once and haven't done so yet, or if we should always update
      if ((once && !loadedOnce.current) || !once) {
        setShouldRender(true);
        loadedOnce.current = true;
        
        // Call the onVisible callback if provided
        if (onVisible) {
          onVisible();
        }
      }
    } else if (!isInView && shouldRender && !once) {
      // If we're using "once=false", we need to reset when out of view
      setShouldRender(false);
    }
  }, [isInView, shouldRender, once, onVisible]);
  
  // Default placeholder is a loading spinner in a container of specified dimensions
  const defaultPlaceholder = (
    <div 
      className="flex items-center justify-center bg-gray-100 dark:bg-gray-800"
      style={{ 
        height: height || '200px', 
        width: width || '100%' 
      }}
    >
      <LoadingSpinner size="md" />
    </div>
  );
  
  // The placeholder to show while content is not yet visible
  const placeholderContent = placeholder || defaultPlaceholder;
  
  return (
    <div 
      ref={ref as React.RefObject<HTMLDivElement>} 
      className={className}
      style={{ 
        minHeight: shouldRender ? undefined : height,
        minWidth: shouldRender ? undefined : width
      }}
    >
      {shouldRender ? children : placeholderContent}
    </div>
  );
}

export default LazyLoad;