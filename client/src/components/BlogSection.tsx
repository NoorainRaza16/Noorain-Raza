import { motion } from "framer-motion";
import { Calendar, ExternalLink } from "lucide-react";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { formatDate } from "@/lib/utils";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useSocket } from "@/lib/socket";
import { useEffect } from "react";
import { useBlogStatus } from "@/hooks/useBlogStatus";

const BlogSection = () => {
  const { addEventListener, removeEventListener } = useSocket();
  const { isBlogActive } = useBlogStatus();
  const [, setLocation] = useLocation();

  // Don't render the section if blog is inactive
  if (!isBlogActive) {
    return null;
  }

  // Fetch blog posts with aggressive refresh settings
  const { data: blogResponse, isLoading, error, refetch } = useQuery({
    queryKey: ['/api/blog'],
    queryFn: async () => {
      const response = await fetch(`/api/blog?t=${Date.now()}`, {
        credentials: 'include',
        cache: 'no-cache',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      if (!response.ok) throw new Error('Failed to fetch blog posts');
      return response.json();
    },
    staleTime: 0,
    gcTime: 1000 * 30,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchInterval: 30000,
  });

  // Listen for real-time blog updates
  useEffect(() => {
    const handleBlogUpdate = () => {
      refetch();
    };

    addEventListener('blog-updated', handleBlogUpdate);

    return () => {
      removeEventListener('blog-updated', handleBlogUpdate);
    };
  }, [addEventListener, removeEventListener, refetch]);

  const blogPosts = blogResponse?.data || [];

  const sectionVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
      },
    },
  };

  const postsContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.2,
      },
    },
  };

  const postVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  return (
    <section id="blog" className="py-12 md:py-20 lg:py-24 bg-gray-50 dark:bg-gray-800/50 relative overflow-hidden">
      {/* Background decoration elements */}
      <div className="absolute top-1/4 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl -z-10"></div>
      
      <div className="container mx-auto px-4 sm:px-6">
        <motion.div
          className="text-center mb-8 md:mb-12"
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <span className="inline-block px-3 py-1 text-sm font-medium bg-primary/10 dark:bg-primary/20 text-primary-600 dark:text-primary-300 rounded-full mb-3 border border-primary/20">
            Blog & Articles
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">Blog Posts</h2>
          <div className="w-20 h-1 bg-gradient-to-r from-primary to-purple-500 mx-auto rounded-full mb-6"></div>
          <p className="text-gray-600 dark:text-gray-300 mt-4 max-w-2xl mx-auto text-sm sm:text-base lg:text-lg">
            Sharing thoughts, tutorials, and insights about technology, DevOps,
            and software development.
          </p>
        </motion.div>

        {/* Blog Posts Grid or Empty State */}
        {isLoading ? (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading blog posts...</p>
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <p className="text-red-600 dark:text-red-400">
              {error instanceof Error ? error.message : 'Failed to load blog posts'}
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-primary text-white rounded hover:bg-primary-600"
            >
              Retry
            </button>
          </div>
        ) : blogPosts.length === 0 ? (
          <motion.div
            className="text-center py-16"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-primary/10 dark:bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <ExternalLink className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No Blog Posts Yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Blog posts will appear here once they're published through the admin panel.
              </p>
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  // Ensure we navigate directly without any scroll interference
                  setTimeout(() => {
                    setLocation("/blog");
                  }, 0);
                }}
                className="px-6 py-3 bg-primary hover:bg-primary-600 text-white rounded-lg font-medium transition-colors"
              >
                Visit Blog Page
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8"
            variants={postsContainerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {blogPosts.slice(0, 6).map((post: any, index: number) => (
              <motion.div
                key={post._id || index}
                className="group bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl md:rounded-2xl overflow-hidden shadow-md hover:shadow-xl sm:shadow-lg sm:hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-700 h-full flex flex-col"
                variants={postVariants}
                whileHover={{ 
                  y: -5,
                  transition: { type: "spring", stiffness: 300, damping: 20 }
                }}
              >
                <div className="relative h-40 sm:h-48 md:h-56 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/50 group-hover:opacity-100 opacity-70 transition-opacity z-10"></div>
                  
                  <OptimizedImage
                    src={post.featuredImage || "/api/placeholder/400/300"}
                    alt={post.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    width={400}
                    height={300}
                  />
                  
                  <div className="absolute top-2 right-2 sm:top-3 sm:right-3 z-10">
                    <span className="inline-flex items-center px-1.5 sm:px-2 md:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs font-semibold rounded-full bg-black/40 backdrop-blur-sm text-white border border-white/20">
                      Article {index + 1}
                    </span>
                  </div>
                </div>
                
                <div className="p-3 sm:p-4 md:p-6 relative flex-1 flex flex-col">
                  <div className="absolute top-0 left-0 right-0 h-0.5 sm:h-1 bg-gradient-to-r from-primary via-purple-500 to-blue-500"></div>
                  
                  <div className="flex items-center space-x-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-2 sm:mb-3">
                    <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span>{formatDate(post.createdAt || post.publishedAt || new Date())}</span>
                  </div>
                  
                  <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-1.5 sm:mb-2 md:mb-3 text-gray-900 dark:text-white group-hover:text-primary dark:group-hover:text-primary-400 transition-colors line-clamp-2">
                    {post.title}
                  </h3>
                  
                  <p className="text-gray-700 dark:text-gray-300 mb-3 sm:mb-4 md:mb-5 text-xs sm:text-sm md:text-base flex-1 line-clamp-3 sm:line-clamp-4">
                    {post.excerpt}
                  </p>

                  {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 sm:gap-1.5 md:gap-2 mb-3 sm:mb-4 md:mb-6">
                      {post.tags.slice(0, 3).map((tag: string, tagIndex: number) => (
                        <span
                          key={tagIndex}
                          className="inline-flex items-center px-1.5 sm:px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs font-medium rounded-full bg-primary/10 dark:bg-primary/20 text-primary-700 dark:text-primary-300 border border-primary/20"
                        >
                          {tag}
                        </span>
                      ))}
                      {post.tags.length > 3 && (
                        <span className="inline-flex items-center px-1.5 sm:px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs font-medium rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                          +{post.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                  
                  <a
                    href={post.externalLink || `/blog/${post.slug}`}
                    target={post.externalLink ? "_blank" : "_self"}
                    rel={post.externalLink ? "noopener noreferrer" : undefined}
                    className="inline-flex items-center text-primary dark:text-primary-400 hover:text-primary-600 dark:hover:text-primary-300 text-sm font-medium mt-auto group-hover:underline transition-colors"
                  >
                    Read More
                    <ExternalLink className="ml-1 h-3 w-3 sm:h-4 sm:w-4" />
                  </a>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* View All Posts Button */}
        {blogPosts.length > 0 && (
          <motion.div 
            className="text-center mt-8 md:mt-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
          >
            <button 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                // Ensure we navigate directly without any scroll interference
                setTimeout(() => {
                  setLocation("/blog");
                }, 0);
              }}
              className="group inline-flex items-center px-6 py-3 bg-primary hover:bg-primary-600 text-white rounded-lg font-medium transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              View All Posts
              <ExternalLink className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default BlogSection;