import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  Settings,
  Briefcase,
  GraduationCap,
  FileText,
  Award,
  Code,
  User,
  Menu,
  ChevronRight,
  FolderOpen,
  Home,
  LogOut,
  Layout,
} from "lucide-react";

export type AdminTab = 
  | "dashboard"
  | "users"
  | "messages"
  | "about"
  | "contact-content"
  | "skill-categories"
  | "skills"
  | "education"
  | "experience"
  | "experience-content"
  | "projects"
  | "projects-content"
  | "certifications"
  | "blog"
  | "blog-content"
  | "settings"
  | "hero-content"
  | "social-links"
  | "testimonials"
  | "services"
  | "footer";

interface SidebarItem {
  tab: AdminTab;
  icon: React.ReactNode;
  label: string;
  color: string;
  count?: number;
  description?: string;
  category?: string;
}

interface ResponsiveSidebarProps {
  activeTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
  className?: string;
  counts?: Record<string, number>;
  onGoToMainPage?: () => void;
  onLogout?: () => void;
}

const sidebarItems: SidebarItem[] = [
  {
    tab: "dashboard",
    icon: <LayoutDashboard className="h-4 w-4" />,
    label: "Dashboard",
    color: "blue",
    description: "Overview and analytics",
    category: "main",
  },
  {
    tab: "users",
    icon: <Users className="h-4 w-4" />,
    label: "Users",
    color: "green",
    description: "Manage admin users",
    category: "management",
  },
  {
    tab: "messages",
    icon: <MessageSquare className="h-4 w-4" />,
    label: "Messages",
    color: "yellow",
    description: "Contact form submissions",
    category: "management",
  },
  {
    tab: "hero-content",
    icon: <Home className="h-4 w-4" />,
    label: "Hero Section",
    color: "blue",
    description: "Main header content",
    category: "content",
  },
  {
    tab: "about",
    icon: <User className="h-4 w-4" />,
    label: "About Content",
    color: "purple",
    description: "Personal information",
    category: "content",
  },
  {
    tab: "contact-content",
    icon: <MessageSquare className="h-4 w-4" />,
    label: "Contact Content",
    color: "blue",
    description: "Contact section management",
    category: "content",
  },
  {
    tab: "skill-categories",
    icon: <FolderOpen className="h-4 w-4" />,
    label: "Skill Categories",
    color: "indigo",
    description: "Organize skill groups",
    category: "content",
  },
  {
    tab: "skills",
    icon: <Code className="h-4 w-4" />,
    label: "Skills",
    color: "cyan",
    description: "Technical abilities",
    category: "content",
  },
  {
    tab: "education",
    icon: <GraduationCap className="h-4 w-4" />,
    label: "Education",
    color: "emerald",
    description: "Academic background",
    category: "content",
  },
  {
    tab: "experience",
    icon: <Briefcase className="h-4 w-4" />,
    label: "Experience",
    color: "orange",
    description: "Work history",
    category: "content",
  },
  {
    tab: "experience-content",
    icon: <Layout className="h-4 w-4" />,
    label: "Experience Section",
    color: "amber",
    description: "Experience section content",
    category: "content",
  },
  {
    tab: "projects",
    icon: <FileText className="h-4 w-4" />,
    label: "Projects",
    color: "pink",
    description: "Portfolio projects",
    category: "content",
  },
  {
    tab: "projects-content",
    icon: <Layout className="h-4 w-4" />,
    label: "Projects Section",
    color: "indigo",
    description: "Projects section content",
    category: "content",
  },
  {
    tab: "certifications",
    icon: <Award className="h-4 w-4" />,
    label: "Certifications",
    color: "red",
    description: "Professional certificates",
    category: "content",
  },
  {
    tab: "blog",
    icon: <FileText className="h-4 w-4" />,
    label: "Blog Posts",
    color: "violet",
    description: "Article management",
    category: "content",
  },
  {
    tab: "blog-content",
    icon: <Layout className="h-4 w-4" />,
    label: "Blog Section",
    color: "indigo",
    description: "Blog page settings",
    category: "content",
  },
  {
    tab: "settings",
    icon: <Settings className="h-4 w-4" />,
    label: "Site Settings",
    color: "gray",
    description: "Global configuration",
    category: "settings",
  },
  {
    tab: "hero-content",
    icon: <User className="h-4 w-4" />,
    label: "Hero Section",
    color: "blue",
    description: "Homepage hero content",
    category: "content",
  },
  {
    tab: "social-links",
    icon: <MessageSquare className="h-4 w-4" />,
    label: "Social Links",
    color: "green",
    description: "Social media links",
    category: "content",
  },
  {
    tab: "testimonials",
    icon: <Award className="h-4 w-4" />,
    label: "Testimonials",
    color: "purple",
    description: "Client testimonials",
    category: "content",
  },
  {
    tab: "services",
    icon: <Briefcase className="h-4 w-4" />,
    label: "Services",
    color: "teal",
    description: "Services offered",
    category: "content",
  },
  {
    tab: "footer",
    icon: <Layout className="h-4 w-4" />,
    label: "Footer Content",
    color: "slate",
    description: "Footer sections & links",
    category: "content",
  },
];

export function ResponsiveSidebar({ activeTab, onTabChange, className, counts, onGoToMainPage, onLogout }: ResponsiveSidebarProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const categorizedItems = sidebarItems.reduce((acc, item) => {
    const category = item.category || "other";
    if (!acc[category]) acc[category] = [];
    acc[category].push(item);
    return acc;
  }, {} as Record<string, SidebarItem[]>);

  const SidebarContent = () => (
    <div className="flex flex-col h-full max-h-screen">
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-gray-700">
        <h2 className="text-lg font-bold text-white">Admin Panel</h2>
        <p className="text-sm text-gray-400">Portfolio Management</p>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto min-h-0 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
        <div className="p-2 space-y-4 pb-20">
          {Object.entries(categorizedItems).map(([category, items]) => (
            <div key={category}>
              <h3 className="px-2 py-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                {category === "main" ? "Overview" : 
                 category === "management" ? "Management" :
                 category === "content" ? "Content" :
                 category === "settings" ? "Configuration" : category}
              </h3>
              <div className="space-y-1 mt-2">
                {items.map((item) => {
                  const isActive = activeTab === item.tab;
                  const itemCount = counts?.[item.tab] || 0;
                  
                  return (
                    <Button
                      key={item.tab}
                      variant={isActive ? "secondary" : "ghost"}
                      className={`w-full justify-start text-left h-auto p-3 ${
                        isActive
                          ? `bg-${item.color}-500/20 text-${item.color}-300 border-${item.color}-500/50 hover:bg-${item.color}-500/30`
                          : "text-gray-300 hover:bg-gray-700/50 hover:text-white"
                      }`}
                      onClick={() => {
                        onTabChange(item.tab);
                        setIsMobileOpen(false);
                      }}
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center space-x-3">
                          <div className={`flex-shrink-0 ${isActive ? `text-${item.color}-300` : "text-gray-400"}`}>
                            {item.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium truncate">{item.label}</span>
                              {itemCount > 0 && (
                                <Badge 
                                  variant="secondary" 
                                  className={`text-xs ${
                                    isActive 
                                      ? `bg-${item.color}-500/30 text-${item.color}-200` 
                                      : "bg-gray-600/50 text-gray-300"
                                  }`}
                                >
                                  {itemCount}
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 truncate mt-0.5">
                              {item.description}
                            </p>
                          </div>
                        </div>
                        {isActive && (
                          <ChevronRight className={`h-3 w-3 text-${item.color}-300`} />
                        )}
                      </div>
                    </Button>
                  );
                })}
              </div>
              {category !== "settings" && <Separator className="my-4 bg-gray-700" />}
            </div>
          ))}
        </div>
      </div>

      {/* Footer with Navigation */}
      <div className="flex-shrink-0 p-4 border-t border-gray-700 space-y-3">
        {/* Navigation Buttons */}
        <div className="space-y-2">
          {onGoToMainPage && (
            <Button
              variant="outline"
              className="w-full justify-start text-left h-auto p-3 bg-gray-800/50 border-cyan-900/50 text-cyan-100 hover:bg-cyan-900/20 hover:border-cyan-400 hover:text-cyan-300 font-mono transition-all duration-300"
              onClick={() => {
                onGoToMainPage();
                setIsMobileOpen(false);
              }}
            >
              <div className="flex items-center space-x-3">
                <Home className="h-4 w-4" />
                <span className="text-sm font-medium">Go to Main Page</span>
              </div>
            </Button>
          )}
          
          {onLogout && (
            <Button
              variant="outline"
              className="w-full justify-start text-left h-auto p-3 bg-gray-800/50 border-red-900/50 text-red-100 hover:bg-red-900/20 hover:border-red-400 hover:text-red-300 font-mono transition-all duration-300"
              onClick={() => {
                onLogout();
                setIsMobileOpen(false);
              }}
            >
              <div className="flex items-center space-x-3">
                <LogOut className="h-4 w-4" />
                <span className="text-sm font-medium">Logout</span>
              </div>
            </Button>
          )}
        </div>
        
        {/* Version Info */}
        <div className="text-xs text-gray-500 text-center">
          <p>Portfolio Admin v2.0</p>
          <p className="mt-1">© 2024 Dashboard</p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Sidebar */}
      <div className="lg:hidden">
        <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="sm" className="lg:hidden">
              <Menu className="h-4 w-4" />
              <span className="sr-only">Open sidebar</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80 bg-gray-800 border-gray-700 p-0">
            <SidebarContent />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar */}
      <aside className={`hidden lg:flex flex-col bg-gray-800/50 border-r border-gray-700 h-screen ${className}`}>
        <SidebarContent />
      </aside>
    </>
  );
}