import { QueryClient, QueryFunction } from "@tanstack/react-query";

// Secure authentication utilities
function getSecureHeaders(): HeadersInit {
  return {
    "Content-Type": "application/json",
    "X-Requested-With": "XMLHttpRequest", // CSRF protection
  };
}

// Check if session is valid without exposing sensitive data
function isSecureSessionValid(): boolean {
  const authStatus = sessionStorage.getItem('auth-status');
  const authTimestamp = sessionStorage.getItem('auth-timestamp');
  
  if (!authStatus || !authTimestamp) {
    return false;
  }
  
  // Check if session is too old (4 hours max for client-side check)
  const sessionAge = Date.now() - parseInt(authTimestamp);
  const maxAge = 4 * 60 * 60 * 1000; // 4 hours
  
  if (sessionAge > maxAge) {
    clearSecureSession();
    return false;
  }
  
  return authStatus === 'authenticated';
}

function clearSecureSession(): void {
  sessionStorage.removeItem('auth-status');
  sessionStorage.removeItem('auth-timestamp');
  localStorage.removeItem("adminAuth");
  localStorage.removeItem("adminUser");
}

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest<T = any>({
  method,
  url,
  data,
}: {
  method: string;
  url: string;
  data?: unknown;
}): Promise<T> {
  const headers = getSecureHeaders();
  
  const res = await fetch(url, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include", // Essential for secure cookie handling
  });

  await throwIfResNotOk(res);
  return res.json();
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const headers = getSecureHeaders();
    
    const res = await fetch(queryKey[0] as string, {
      headers,
      credentials: "include", // Essential for secure cookie handling
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      clearSecureSession();
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false, // Prevent unnecessary refetches
      staleTime: 5 * 60 * 1000, // 5 minutes - keep data fresh but not overly aggressive
      gcTime: 10 * 60 * 1000, // 10 minutes - keep in memory longer
      retry: 2,
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnMount: false, // Don't refetch on mount if data exists
      refetchOnReconnect: true, // Do refetch when reconnecting
    },
    mutations: {
      retry: 2,
    },
  },
});
