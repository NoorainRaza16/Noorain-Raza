import { QueryClient } from "@tanstack/react-query";
import { persistQueryClient } from "@tanstack/react-query-persist-client";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { apiRequest, getQueryFn } from "./queryClient";

// Create a persister for local storage
const localStoragePersister = createSyncStoragePersister({
  storage: window.localStorage,
  key: "portfolio-cache",
  serialize: JSON.stringify,
  deserialize: JSON.parse,
});

// Create the persistent query client
export const persistentQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: 10 * 60 * 1000, // 10 minutes
      gcTime: 24 * 60 * 60 * 1000, // 24 hours - keep data for a full day
      retry: 2,
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnMount: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 2,
      onSuccess: () => {
        // Clear cache on successful mutations to ensure fresh data
        persistentQueryClient.invalidateQueries();
      },
    },
  },
});

// Persist the query client
persistQueryClient({
  queryClient: persistentQueryClient,
  persister: localStoragePersister,
  maxAge: 24 * 60 * 60 * 1000, // 24 hours
});

// Export the same apiRequest function for consistency
export { apiRequest };