import { useState, useEffect, lazy, Suspense } from "react";
import { Switch, Route, useLocation } from "wouter";
import { persistentQueryClient } from "./lib/persistentQueryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ResponsiveHeader } from "@/components/responsive";
import Footer from "@/components/Footer";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { usePrefetch } from "@/hooks/usePrefetch";
import { BrowserCompatibilityCheck } from "@/components/ui/browser-compatibility";
import ScrollToTopButton from "@/components/ScrollToTopButton";
import SciFiTechLoadingScreen from "@/components/SciFiTechLoadingScreen";
import { ProtectedRoute } from "@/components/protected-route";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import SEOLayout from "@/components/SEOLayout";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { useSocket, socketManager } from "@/lib/socket";
import { 
  HomeIcon, UserIcon, CodeIcon, BookIcon, BriefcaseIcon, 
  FolderIcon, AwardIcon, FileTextIcon, PhoneIcon, FileIcon, ShieldIcon
} from "lucide-react";

// Lazy load pages for better initial load performance
const Home = lazy(() => import("@/pages/Home"));
const BlogPage = lazy(() => import("@/pages/BlogPage"));
const BlogPostPage = lazy(() => import("@/pages/BlogPostPage"));
const AdminLoginPage = lazy(() => import("@/pages/admin-login"));
const AdminPage = lazy(() => import("@/pages/admin-page"));
const NotFound = lazy(() => import("@/pages/not-found"));

// Redirect component to handle fallback routes
function RedirectToHome() {
  const [location, setLocation] = useLocation();
  
  // Use effect to redirect once component mounts
  useEffect(() => {
    // Only allow /admin and /admin/login paths - redirect everything else to home
    if (location !== "/admin" && 
        location !== "/admin/login" && 
        !location.startsWith("/api/")) {
      setLocation("/");
    }
  }, [location, setLocation]);
  
  return null;
}

function Router() {
  return (
    <Suspense fallback={
      <div className="flex-1 flex items-center justify-center min-h-[20vh] opacity-0 animate-fade-in">
        <div className="flex flex-col items-center space-y-2">
          <LoadingSpinner size="sm" />
          <span className="text-sm text-gray-500 font-mono">Loading...</span>
        </div>
      </div>
    }>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/blog" component={BlogPage} />
        <Route path="/blog/:slug" component={BlogPostPage} />
        {/* Hidden admin routes - only accessible by direct URL */}
        <Route path="/admin/login" component={AdminLoginPage} />
        <ProtectedRoute path="/admin" component={AdminPage} />
        
        {/* Fallback route: redirect everything else to home */}
        <Route path="/:rest*" component={RedirectToHome} />
      </Switch>
    </Suspense>
  );
}

// Main App component with auth-aware navigation
function AppContent() {
  const [location, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const { user: authUser } = useAuth();
  
  // Prefetch pages
  usePrefetch(() => import("@/pages/not-found"), location === '/');
  usePrefetch(() => import("@/pages/admin-login"), location === '/');
  
  // Base navigation links for all users
  const baseNavLinks = [
    { label: "Home", id: "home", icon: <HomeIcon className="w-4 h-4" /> },
    { label: "About", id: "about", icon: <UserIcon className="w-4 h-4" /> },
    { label: "Skills", id: "skills", icon: <CodeIcon className="w-4 h-4" /> },
    { label: "Education", id: "education", icon: <BookIcon className="w-4 h-4" /> },
    { label: "Experience", id: "experience", icon: <BriefcaseIcon className="w-4 h-4" /> },
    { label: "Projects", id: "projects", icon: <FolderIcon className="w-4 h-4" /> },
    { label: "Certifications", id: "certifications", icon: <AwardIcon className="w-4 h-4" /> },
    { label: "Blog", id: "blog", icon: <FileTextIcon className="w-4 h-4" /> },
    { label: "Contact", id: "contact", icon: <PhoneIcon className="w-4 h-4" /> },
    { label: "Resume", id: "resume", icon: <FileIcon className="w-4 h-4" /> }
  ];

  // Add admin link only for authenticated admin users
  const navLinks = authUser ? [
    ...baseNavLinks,
    { 
      label: "Admin", 
      id: "admin", 
      icon: <ShieldIcon className="w-4 h-4" />,
      path: "/admin" // Special path property for admin navigation
    }
  ] : baseNavLinks;
  
  // Initialize Socket.IO connection and prefetch critical resources
  const { socket, joinPublicRoom, joinAdminRoom } = useSocket();
  
  useEffect(() => {
    // Initialize Socket.IO connection based on current route
    const path = window.location.pathname;
    if (path.includes('/admin')) {
      joinAdminRoom();
    } else {
      joinPublicRoom();
    }

    // Simulate resource loading or wait for actual resources to load
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3500); // Show loading screen for minimum 3.5 seconds
    
    return () => clearTimeout(timer);
  }, [joinPublicRoom, joinAdminRoom]);

  // Switch Socket.IO rooms based on route changes
  useEffect(() => {
    const path = location;
    if (path.includes('/admin')) {
      joinAdminRoom();
    } else {
      joinPublicRoom();
    }
  }, [location, joinAdminRoom, joinPublicRoom]);
  
  return (
    <TooltipProvider>
      <Toaster />
      
      {/* Sci-Fi High-tech 3D Loading Screen */}
      {isLoading && (
        <SciFiTechLoadingScreen 
          onComplete={() => setIsLoading(false)}
          duration={3000}
          minDisplayTime={2800}
          text="INITIALIZATION PORTFOLIO SYSTEM"
          showProgressBar={true}
        />
      )}
      
      <div className="flex flex-col min-h-screen">
        {/* SEO Layout for main site only */}
        {!location.startsWith('/admin') ? (
          <SEOLayout
            title="Noorain Raza - Computer Science Engineering Student | AI & Cloud Specialist | Portfolio"
            description="Noorain Raza - Computer Science Engineering student at Asansol Engineering College specializing in AI, Cloud technologies, Python, React, and software development. Explore innovative projects, technical skills, and professional experience."
            keywords="Noorain Raza, Noorain, Raza, Computer Science Engineering, AI specialist, Cloud technologies, Python developer, React developer, JavaScript, Asansol Engineering College, software development, portfolio, student developer, machine learning, AWS, Docker, Kubernetes, West Bengal, India"
            image="/profile/profile-photo.jpg"
            url="https://www.noorainraza.com"
          >
            {/* Only show header on main site, hide on admin */}
            <ResponsiveHeader navLinks={navLinks} />
            
            <div className="pt-16 sm:pt-16">
              <ErrorBoundary>
                <Router />
              </ErrorBoundary>
            </div>
            
            {/* Only show footer on main site, hide on admin */}
            <Footer />
            
            {/* Only show scroll button on main site */}
            <ScrollToTopButton />
          </SEOLayout>
        ) : (
          <>
            <div>
              <Router />
            </div>
          </>
        )}
        
        {/* Browser compatibility check */}
        <BrowserCompatibilityCheck />
      </div>
    </TooltipProvider>
  );
}

function App() {
  return (
    <QueryClientProvider client={persistentQueryClient}>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;