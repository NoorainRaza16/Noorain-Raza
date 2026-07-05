import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Calendar, Clock, Eye, ArrowLeft, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Link, useLocation } from "wouter";
import { format } from "date-fns";
import { useBlogStatus } from "@/hooks/useBlogStatus";

interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage?: string;
  tags: string[];
  category?: string;
  status: 'draft' | 'published' | 'archived';
  isActive: boolean;
  isPublished: boolean;
  isFeatured: boolean;
  views: number;
  readTime?: number;
  externalLink?: string;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
}

const BlogPage = () => {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [, setLocation] = useLocation();
  const { isBlogActive, isLoading: blogStatusLoading } = useBlogStatus();

  // Redirect to home if blog is inactive
  useEffect(() => {
    if (!blogStatusLoading && !isBlogActive) {
      setLocation('/');
    }
  }, [isBlogActive, blogStatusLoading, setLocation]);

  // Direct fetch without any caching
  const fetchBlogPosts = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/blog?t=${Date.now()}`, {
        credentials: 'include',
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      const data = await response.json();
      console.log('BlogPage - Fresh data from API:', data);
      if (data.success) {
        setBlogPosts(data.data || []);
      } else {
        setError(data.message);
      }
    } catch (err) {
      console.error('BlogPage - Fetch error:', err);
      setError('Failed to fetch blog posts');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogPosts();
    // Force scroll to top when component mounts - use multiple methods to ensure it works
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p className="ml-4 text-gray-600 dark:text-gray-400">Loading blog posts...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <Button onClick={fetchBlogPosts}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <Link href="/">
                <Button variant="ghost" size="sm" className="mb-4">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Blog Posts</h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Sharing insights, tutorials, and thoughts about technology and software development
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Blog Posts */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {blogPosts.length === 0 ? (
          <motion.div
            className="text-center py-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              No blog posts available
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Check back soon for new articles and insights!
            </p>
          </motion.div>
        ) : (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {blogPosts.map((post: BlogPost) => (
              <motion.div key={post._id} variants={itemVariants}>
                <Card className="h-full hover:shadow-lg transition-shadow duration-300 overflow-hidden">
                  {/* Featured Image */}
                  {post.featuredImage && (
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={post.featuredImage}
                        alt={post.title}
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                      />
                      {post.isFeatured && (
                        <Badge className="absolute top-2 right-2" variant="secondary">
                          Featured
                        </Badge>
                      )}
                    </div>
                  )}

                  <CardContent className="p-6">
                    {/* Title */}
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3 line-clamp-2">
                      {post.title}
                    </h2>

                    {/* Excerpt */}
                    <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                      {post.excerpt}
                    </p>

                    {/* Tags */}
                    {post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {post.tags.slice(0, 3).map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {post.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{post.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}

                    {/* Meta Information */}
                    <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {post.publishedAt 
                              ? format(new Date(post.publishedAt), "MMM dd, yyyy")
                              : format(new Date(post.createdAt), "MMM dd, yyyy")
                            }
                          </span>
                        </div>
                        {post.readTime && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>{post.readTime} min read</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        <span>{post.views}</span>
                      </div>
                    </div>

                    {/* Read More Button */}
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => {
                        if (post.externalLink) {
                          window.open(post.externalLink, '_blank', 'noopener,noreferrer');
                        } else {
                          window.location.href = `/blog/${post.slug}`;
                        }
                      }}
                    >
                      Read Full Article
                      <ExternalLink className="h-4 w-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default BlogPage;