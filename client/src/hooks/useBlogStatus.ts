import { useQuery } from "@tanstack/react-query";

export const useBlogStatus = () => {
  const { data: blogContentResponse, isLoading } = useQuery({
    queryKey: ['/api/blog-content'],
    queryFn: async () => {
      const response = await fetch('/api/blog-content', {
        credentials: 'include',
        cache: 'no-cache',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      if (!response.ok) throw new Error('Failed to fetch blog content');
      return response.json();
    },
    staleTime: 0,
    gcTime: 1000 * 30,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchInterval: 30000,
  });

  const blogContent = blogContentResponse?.data;
  const isBlogActive = blogContent?.isActive ?? true; // Default to active if not set

  return {
    isBlogActive,
    isLoading,
    blogContent
  };
};