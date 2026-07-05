import { useEffect } from 'react';

/**
 * Hook to prefetch components or pages when they're likely to be needed
 * @param prefetchFn - Function to import the component that should be prefetched
 * @param condition - Optional condition to determine when to prefetch
 */
export function usePrefetch(
  prefetchFn: () => Promise<any>,
  condition: boolean = true
) {
  useEffect(() => {
    if (condition) {
      const timer = setTimeout(() => {
        prefetchFn().catch(err => {
          console.error('Error prefetching component:', err);
        });
      }, 2000); // Delay by 2 seconds to not interfere with initial page load
      
      return () => clearTimeout(timer);
    }
  }, [prefetchFn, condition]);
}

export default usePrefetch;