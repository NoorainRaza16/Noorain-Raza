import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

/**
 * Hook to ensure data persistence and recovery on app refresh
 */
export const useDataRecovery = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Prevent query cache from being cleared on window focus
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Invalidate stale queries to refresh data
        queryClient.invalidateQueries({
          predicate: (query) => {
            const lastUpdated = query.state.dataUpdatedAt;
            const staleTime = 5 * 60 * 1000; // 5 minutes
            return Date.now() - lastUpdated > staleTime;
          }
        });
      }
    };

    // Ensure critical data is always available
    const ensureCriticalData = async () => {
      const criticalQueries = [
        '/api/hero',
        '/api/about',
        '/api/skills',
        '/api/projects',
        '/api/experience',
        '/api/certifications',
        '/api/blog'
      ];

      for (const queryKey of criticalQueries) {
        const query = queryClient.getQueryData([queryKey]);
        if (!query) {
          // Prefetch missing data
          await queryClient.prefetchQuery({
            queryKey: [queryKey],
            staleTime: 1000 * 60 * 5
          });
        }
      }
    };

    // Recovery on app start
    ensureCriticalData();

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [queryClient]);

  return { queryClient };
};