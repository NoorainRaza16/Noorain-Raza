import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Loader2, LogOut, User, ShieldCheck, Home, FileText } from "lucide-react";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { ResponsiveSidebar, AdminTab } from "@/components/admin/ResponsiveSidebar";
import { ResponsiveEnhancedDataTable } from "@/components/admin/ResponsiveEnhancedDataTable";
import { DynamicForm } from "@/components/admin/DynamicForm";
import { DashboardStats } from "@/components/admin/DashboardStats";
import { AdminCardView } from "@/components/admin/AdminCardView";
import { FooterManager } from "@/components/admin/FooterManager";
import { MessageManager } from "@/components/admin/MessageManager";
import { AboutContentManager } from "@/components/admin/AboutContentManager";
import { ContactContentManager } from "@/components/admin/ContactContentManager";
import { HeroContentManager } from "@/components/admin/HeroContentManager";
import EducationManager from "@/components/admin/EducationManager";
import CertificationsManager from "@/components/admin/CertificationsManager";
import ExperienceManager from "@/components/admin/ExperienceManager";
import ProjectsManager from "@/components/admin/ProjectsManager";
import SkillsManager from "@/components/admin/SkillsManager";
import BlogManager from "@/components/admin/BlogManager";
import { getAdminConfig } from "@/lib/adminConfig";

export default function AdminPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { user: authUser, logoutMutation, isLoading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>("dashboard");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<any>(null);
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const queryClient = useQueryClient();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !authUser) {
      navigate("/admin/login");
    }
  }, [authUser, authLoading, navigate]);

  // Get current tab configuration
  const tabConfig = getAdminConfig(activeTab);

  // Fetch data for current tab
  const {
    data: contentData,
    isLoading: isContentLoading,
    refetch: refetchContent,
  } = useQuery({
    queryKey: [tabConfig?.apiEndpoint || `/api/admin/${activeTab}`],
    queryFn: async () => {
      if (activeTab === "dashboard") return null;
      
      const response = await fetch(tabConfig?.apiEndpoint || `/api/admin/${activeTab}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch ${activeTab} data`);
      }
      
      const result = await response.json();
      
      // Handle single object responses (like blog-content) by wrapping in array
      if (result.success && result.data && !Array.isArray(result.data)) {
        return { ...result, data: [result.data] };
      }
      
      return result;
    },
    enabled: !!authUser && activeTab !== "dashboard",
  });

  // Fetch dashboard stats
  const {
    data: dashboardData,
    isLoading: isDashboardLoading,
  } = useQuery({
    queryKey: ["/api/admin/dashboard"],
    queryFn: async () => {
      const endpoints = [
        "/api/admin/messages",
        "/api/projects", 
        "/api/education",
        "/api/experience",
        "/api/certifications",
        "/api/about",
        "/api/hero",
        "/api/footer",
      ];

      const results = await Promise.all(
        endpoints.map(async (endpoint) => {
          try {
            const response = await fetch(endpoint, {
              method: 'GET',
              credentials: 'include',
              headers: {
                "Content-Type": "application/json",
              },
            });
            
            if (!response.ok) {
              return { endpoint, data: [] };
            }
            
            const result = await response.json();
            const data = result.success ? (result.data || []) : [];
            return { endpoint, data: Array.isArray(data) ? data : (data ? [data] : []) };
          } catch {
            return { endpoint, data: [] };
          }
        })
      );

      return results.reduce((acc, { endpoint, data }) => {
        const key = endpoint.split("/").pop() || endpoint;
        const cleanKey = key.replace('admin/', '');
        acc[cleanKey] = { count: Array.isArray(data) ? data.length : 0 };
        return acc;
      }, {} as Record<string, any>);
    },
    enabled: !!authUser && activeTab === "dashboard",
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (newData: any) => {
      return apiRequest({
        method: "POST",
        url: tabConfig?.apiEndpoint || `/api/admin/${activeTab}`,
        data: newData,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [tabConfig?.apiEndpoint] });
      // Also invalidate main page cache if updating about content
      if (activeTab === "about") {
        queryClient.invalidateQueries({ queryKey: ['/api/about'] });
        queryClient.removeQueries({ queryKey: ['/api/about'] });
        window.dispatchEvent(new CustomEvent('about-content-updated'));
        localStorage.setItem('about-content-updated', Date.now().toString());
      }
      toast({ title: "Success", description: "Item created successfully" });
      setIsFormOpen(false);
      setCurrentItem(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error", 
        description: error.message || "Failed to create item",
        variant: "destructive"
      });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      return apiRequest({
        method: "PUT",
        url: `${tabConfig?.apiEndpoint}/${id}`,
        data,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [tabConfig?.apiEndpoint] });
      // Also invalidate main page cache if updating about content
      if (activeTab === "about") {
        queryClient.invalidateQueries({ queryKey: ['/api/about'] });
        queryClient.removeQueries({ queryKey: ['/api/about'] });
        window.dispatchEvent(new CustomEvent('about-content-updated'));
        localStorage.setItem('about-content-updated', Date.now().toString());
      }
      toast({ title: "Success", description: "Item updated successfully" });
      setIsFormOpen(false);
      setCurrentItem(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update item",
        variant: "destructive"
      });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest({
        method: "DELETE",
        url: `${tabConfig?.apiEndpoint}/${id}`,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [tabConfig?.apiEndpoint] });
      // Also invalidate main page cache if deleting about content
      if (activeTab === "about") {
        queryClient.invalidateQueries({ queryKey: ['/api/about'] });
        queryClient.removeQueries({ queryKey: ['/api/about'] });
        window.dispatchEvent(new CustomEvent('about-content-updated'));
        localStorage.setItem('about-content-updated', Date.now().toString());
      }
      toast({ title: "Success", description: "Item deleted successfully" });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete item",
        variant: "destructive"
      });
    },
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const handleGoToMainPage = () => {
    navigate("/");
  };

  const handleEdit = (item: any) => {
    setCurrentItem(item);
    setIsFormOpen(true);
  };

  const handleDelete = (item: any) => {
    deleteMutation.mutate(item._id || item.id);
  };

  const handleAdd = () => {
    setCurrentItem(null);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (data: any) => {
    try {
      // Process blog-specific data transformations
      if (activeTab === 'blog') {
        const processedData = { ...data };
        
        // Convert tags from comma-separated string to array
        if (typeof processedData.tags === 'string') {
          processedData.tags = processedData.tags
            .split(',')
            .map((tag: string) => tag.trim())
            .filter((tag: string) => tag.length > 0);
        }
        
        // Convert socialLinks from comma-separated string to array
        if (typeof processedData.socialLinks === 'string') {
          processedData.socialLinks = processedData.socialLinks
            .split(',')
            .map((link: string) => link.trim())
            .filter((link: string) => link.length > 0);
        }
        
        // Ensure publishedAt is set for published posts
        if (processedData.status === 'published' && !processedData.publishedAt) {
          processedData.publishedAt = new Date().toISOString();
        }
        
        // Generate slug from title if not provided
        if (!processedData.slug && processedData.title) {
          processedData.slug = processedData.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
        }
        
        // Calculate estimated reading time based on content length
        if (processedData.content) {
          const wordsPerMinute = 200;
          const wordCount = processedData.content.split(/\s+/).length;
          processedData.readTime = Math.ceil(wordCount / wordsPerMinute);
        }
        
        data = processedData;
      }
      
      if (currentItem) {
        await updateMutation.mutateAsync({ id: currentItem._id || currentItem.id, data });
      } else {
        await createMutation.mutateAsync(data);
      }
    } catch (error) {
      console.error('Form submission error:', error);
      toast({
        title: "Error",
        description: "Failed to submit form. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleViewModeChange = (mode: "table" | "grid") => {
    setViewMode(mode);
  };

  const renderCardView = (item: any) => {
    return (
      <AdminCardView
        item={item}
        type={activeTab}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    );
  };

  // Get counts for sidebar
  const counts = dashboardData || {} as any;

  // Show loading state during auth check
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <p className="text-gray-400 font-mono">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (!authUser && !authLoading) {
    return null; // Will redirect to login
  }

  return (
    <div className="h-screen bg-gray-900 text-white flex flex-col">
      <Toaster />
      
      {/* Dynamic Form Modal */}
      {isFormOpen && tabConfig && (
        <DynamicForm
          title={currentItem ? `Edit ${tabConfig.title}` : `Create New ${tabConfig.title}`}
          fields={tabConfig.fields}
          isOpen={isFormOpen}
          onClose={() => {
            setIsFormOpen(false);
            setCurrentItem(null);
          }}
          onSubmit={handleFormSubmit}
          isLoading={createMutation.isPending || updateMutation.isPending}
          initialData={currentItem || {}}
        />
      )}

      {/* Header */}
      <header className="admin-header flex-shrink-0 border-b border-gray-800 bg-gray-900">
        <div className="container mx-auto px-2 sm:px-4 py-3 flex justify-between items-center">
          {/* Mobile Menu Button */}
          <div className="lg:hidden">
            <ResponsiveSidebar
              activeTab={activeTab}
              onTabChange={setActiveTab}
              className=""
              counts={counts}
              onGoToMainPage={handleGoToMainPage}
              onLogout={handleLogout}
            />
          </div>
          
          <div className="flex items-center space-x-2 sm:space-x-3">
            <ShieldCheck className="h-5 w-5 sm:h-6 sm:w-6 text-blue-500" />
            <div>
              <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
                ADMIN DASHBOARD
              </h1>
              <p className="text-xs text-gray-400 hidden sm:block">Portfolio Management System</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 sm:space-x-4">
            {authUser && (
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="hidden md:block text-right">
                  <p className="text-sm font-medium">{authUser.username}</p>
                  <p className="text-xs text-gray-400">{authUser.email}</p>
                </div>
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <User className="h-3 w-3 sm:h-4 sm:w-4 text-blue-400" />
                </div>
              </div>
            )}
            
            {/* Navigation Buttons - Hidden on mobile, sidebar handles navigation */}
            <div className="hidden lg:flex items-center space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleGoToMainPage}
                className="bg-gray-800/50 border-cyan-900/50 text-cyan-100 hover:bg-cyan-900/20 hover:border-cyan-400 hover:text-cyan-300 font-mono transition-all duration-300"
              >
                <Home className="h-4 w-4 mr-2" />
                <span className="hidden xl:inline">Main Page</span>
                <span className="xl:hidden">Home</span>
              </Button>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleLogout}
                className="bg-gray-800/50 border-red-900/50 text-red-100 hover:bg-red-900/20 hover:border-red-400 hover:text-red-300 font-mono transition-all duration-300"
              >
                <LogOut className="h-4 w-4 mr-2" />
                <span className="hidden xl:inline">Logout</span>
                <span className="xl:hidden">Exit</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Sidebar - Hidden on mobile */}
        <div className="admin-sidebar hidden lg:block">
          <ResponsiveSidebar
            activeTab={activeTab}
            onTabChange={setActiveTab}
            className="w-64 xl:w-80 flex-shrink-0"
            counts={counts}
            onGoToMainPage={handleGoToMainPage}
            onLogout={handleLogout}
          />
        </div>

        {/* Main Content */}
        <main className="admin-content flex-1 p-3 sm:p-4 lg:p-6 overflow-auto bg-gray-900">
          {activeTab === "dashboard" ? (
            <DashboardStats
              stats={(dashboardData || {}) as any}
              isLoading={isDashboardLoading}
              recentActivity={[]}
            />
          ) : activeTab === "footer" ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white">Footer Management</h2>
                  <p className="text-gray-400">Configure footer content and social links</p>
                </div>
              </div>
              <FooterManager />
            </div>
          ) : activeTab === "messages" ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white">Contact Messages</h2>
                  <p className="text-gray-400">Manage contact form submissions with advanced tracking</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => refetchContent()}
                    className="px-4 py-2 bg-blue-500/20 border border-blue-500/50 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors"
                  >
                    Refresh
                  </button>
                  <button
                    onClick={handleAdd}
                    className="px-4 py-2 bg-green-500/20 border border-green-500/50 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors"
                  >
                    Add Message
                  </button>
                </div>
              </div>
              
              {isContentLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                <MessageManager
                  messages={contentData?.data || []}
                  onRefresh={refetchContent}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              )}
            </div>
          ) : activeTab === "hero-content" ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white">Hero Section Management</h2>
                  <p className="text-gray-400">Configure homepage hero content and presentation</p>
                </div>
              </div>
              <HeroContentManager />
            </div>
          ) : activeTab === "about" ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white">About Content</h2>
                  <p className="text-gray-400">Comprehensive management of about section with personal info and achievements</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => refetchContent()}
                    className="px-4 py-2 bg-blue-500/20 border border-blue-500/50 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors"
                  >
                    Refresh
                  </button>
                  <button
                    onClick={handleAdd}
                    className="px-4 py-2 bg-green-500/20 border border-green-500/50 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors"
                  >
                    Add Content
                  </button>
                </div>
              </div>
              
              {isContentLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                <AboutContentManager
                  contents={contentData?.data || []}
                  onRefresh={refetchContent}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              )}
            </div>
          ) : activeTab === "contact-content" ? (
            <div className="space-y-6">
              {isContentLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                <ContactContentManager
                  contents={contentData?.data || []}
                  onRefresh={refetchContent}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              )}
            </div>

          ) : activeTab === "education" ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white">Education Management</h2>
                  <p className="text-gray-400">Manage educational background and timeline</p>
                </div>
              </div>
              <EducationManager />
            </div>
          ) : activeTab === "experience" ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white">Experience Management</h2>
                  <p className="text-gray-400">Manage professional work experience</p>
                </div>
              </div>
              <ExperienceManager />
            </div>
          ) : activeTab === "certifications" ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white">Certifications Management</h2>
                  <p className="text-gray-400">Manage professional certifications and awards</p>
                </div>
              </div>
              <CertificationsManager />
            </div>
          ) : activeTab === "skill-categories" ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white">Skill Categories</h2>
                  <p className="text-gray-400">Manage skill categories (Programming Languages, Frameworks, etc.)</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveTab("skills")}
                    className="px-4 py-2 bg-purple-500/20 border border-purple-500/50 text-purple-400 rounded-lg hover:bg-purple-500/30 transition-colors"
                  >
                    Manage Skills
                  </button>
                  <button
                    onClick={() => refetchContent()}
                    className="px-4 py-2 bg-blue-500/20 border border-blue-500/50 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors"
                  >
                    Refresh
                  </button>
                  <button
                    onClick={handleAdd}
                    className="px-4 py-2 bg-green-500/20 border border-green-500/50 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors"
                  >
                    Add Category
                  </button>
                </div>
              </div>
              
              {isContentLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                tabConfig && (
                  <ResponsiveEnhancedDataTable
                    data={contentData?.data || []}
                    columns={tabConfig.displayColumns.map(col => ({
                      ...col,
                      render: col.render === "date" ? (item: any) => {
                        const date = item[col.key];
                        return date ? new Date(date).toLocaleDateString() : "—";
                      } : col.render === "boolean" ? (item: any) => {
                        return item[col.key] ? "Yes" : "No";
                      } : undefined,
                    }))}
                    title={tabConfig.title}
                    description={tabConfig.description}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onAdd={handleAdd}
                    onRefresh={refetchContent}
                    isLoading={isContentLoading}
                    searchPlaceholder={`Search ${tabConfig.title.toLowerCase()}...`}
                    emptyMessage={`No ${tabConfig.title.toLowerCase()} found. Create your first item!`}
                    viewMode={viewMode}
                    onViewModeChange={handleViewModeChange}
                    renderCard={renderCardView}
                  />
                )
              )}
            </div>
          ) : activeTab === "skills" ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-white">Skills Management</h2>
                  <p className="text-gray-400">Manage individual skills and their proficiency levels</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveTab("skill-categories")}
                    className="px-4 py-2 bg-purple-500/20 border border-purple-500/50 text-purple-400 rounded-lg hover:bg-purple-500/30 transition-colors"
                  >
                    Manage Categories
                  </button>
                </div>
              </div>
              <SkillsManager />
            </div>
          ) : activeTab === "projects" ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white">Projects Management</h2>
                  <p className="text-gray-400">Manage portfolio projects and showcases</p>
                </div>
              </div>
              <ProjectsManager />
            </div>
          ) : activeTab === "projects-content" ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white">Projects Section Content</h2>
                  <p className="text-gray-400">Manage projects section headers, descriptions, and GitHub button</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveTab("projects")}
                    className="px-4 py-2 bg-purple-500/20 border border-purple-500/50 text-purple-400 rounded-lg hover:bg-purple-500/30 transition-colors"
                  >
                    Manage Projects
                  </button>
                  <button
                    onClick={() => refetchContent()}
                    className="px-4 py-2 bg-blue-500/20 border border-blue-500/50 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors"
                  >
                    Refresh
                  </button>
                  <button
                    onClick={handleAdd}
                    className="px-4 py-2 bg-green-500/20 border border-green-500/50 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors"
                  >
                    Add Content
                  </button>
                </div>
              </div>
              
              {/* Info Banner */}
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="bg-blue-500/20 rounded-full p-2">
                    <FileText className="h-4 w-4 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-blue-200 font-medium">Projects Section Content</h3>
                    <p className="text-blue-300/80 text-sm mt-1">
                      This page manages the section headers and descriptions. To add, edit, or delete individual projects, 
                      <button 
                        onClick={() => setActiveTab("projects")}
                        className="text-blue-400 hover:text-blue-300 underline ml-1"
                      >
                        go to Projects Management
                      </button>
                    </p>
                  </div>
                </div>
              </div>
              
              {isContentLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                tabConfig && (
                  <ResponsiveEnhancedDataTable
                    data={contentData?.data || []}
                    columns={tabConfig.displayColumns.map(col => ({
                      ...col,
                      render: col.render === "date" ? (item: any) => {
                        const date = item[col.key];
                        return date ? new Date(date).toLocaleDateString() : "—";
                      } : col.render === "boolean" ? (item: any) => {
                        return item[col.key] ? "Yes" : "No";
                      } : col.render === "array" ? (item: any) => {
                        const arr = item[col.key];
                        return Array.isArray(arr) ? arr.slice(0, 3).join(", ") + (arr.length > 3 ? "..." : "") : "—";
                      } : undefined,
                    }))}
                    title={tabConfig.title}
                    description={tabConfig.description}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onAdd={handleAdd}
                    onRefresh={refetchContent}
                    isLoading={isContentLoading}
                    searchPlaceholder={`Search ${tabConfig.title.toLowerCase()}...`}
                    emptyMessage={`No ${tabConfig.title.toLowerCase()} found. Create your first item!`}
                    viewMode={viewMode}
                    onViewModeChange={handleViewModeChange}
                    renderCard={renderCardView}
                  />
                )
              )}
            </div>
          ) : activeTab === "blog" ? (
            <div className="space-y-6">
              <BlogManager />
            </div>
          ) : (
            tabConfig && (
              <ResponsiveEnhancedDataTable
                data={contentData?.data || []}
                columns={tabConfig.displayColumns.map(col => ({
                  ...col,
                  render: col.render === "date" ? (item: any) => {
                    const date = item[col.key];
                    return date ? new Date(date).toLocaleDateString() : "—";
                  } : col.render === "boolean" ? (item: any) => {
                    return item[col.key] ? "Yes" : "No";
                  } : col.render === "array" ? (item: any) => {
                    const arr = item[col.key];
                    return Array.isArray(arr) ? arr.slice(0, 3).join(", ") + (arr.length > 3 ? "..." : "") : "—";
                  } : col.render === "progress" ? (item: any) => {
                    const value = item[col.key] || 0;
                    return `${value}%`;
                  } : col.render === "status" ? (item: any) => {
                    const status = item[col.key];
                    switch (status) {
                      case 'unread': return "🔵 Unread";
                      case 'read': return "👁️ Read";
                      case 'replied': return "✅ Replied";
                      case 'archived': return "📁 Archived";
                      default: return status;
                    }
                  } : col.render === "priority" ? (item: any) => {
                    const priority = item[col.key];
                    switch (priority) {
                      case 'low': return "🟢 Low";
                      case 'medium': return "🟡 Medium";
                      case 'high': return "🟠 High";
                      case 'urgent': return "🔴 Urgent";
                      default: return priority;
                    }
                  } : col.render === "sectionType" ? (item: any) => {
                    const type = item[col.key];
                    switch (type) {
                      case 'main': return "🏠 Main";
                      case 'detailed': return "📄 Detailed";
                      case 'summary': return "📝 Summary";
                      default: return type;
                    }
                  } : undefined,
                }))}
                title={tabConfig.title}
                description={tabConfig.description}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onAdd={handleAdd}
                onRefresh={refetchContent}
                isLoading={isContentLoading}
                searchPlaceholder={`Search ${tabConfig.title.toLowerCase()}...`}
                emptyMessage={`No ${tabConfig.title.toLowerCase()} found. Create your first item!`}
                viewMode={viewMode}
                onViewModeChange={handleViewModeChange}
                renderCard={renderCardView}
              />
            )
          )}
        </main>
      </div>
      
      {/* Footer */}
      <footer className="flex-shrink-0 border-t border-gray-800 bg-gray-900">
        <div className="container mx-auto px-2 sm:px-4 py-2 sm:py-3">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
            <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-400">
              <ShieldCheck className="h-3 w-3 sm:h-4 sm:w-4 text-blue-500" />
              <span>Admin Dashboard v2.0</span>
              <span className="hidden md:inline">•</span>
              <span className="hidden md:inline">Portfolio Management System</span>
            </div>
            
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-xs text-gray-500">
              <span>Connected to MongoDB</span>
              <span className="hidden sm:inline">•</span>
              <span>{new Date().getFullYear()} Portfolio Admin</span>
              <span className="hidden sm:inline">•</span>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <span>System Online</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}