import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { 
  MenuIcon, XIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { scrollToElement } from '@/lib/utils';
import { data } from '@/data';
import ThemeToggle from '@/components/ui/ThemeToggle';
import ResponsiveSidebar from './ResponsiveSidebar';
import { useDeviceType, DeviceType } from '../responsive';
import { EnhancedLogo } from '@/components/ui/EnhancedLogo';
import { NavProfilePhoto } from '@/components/ui/NavProfilePhoto';
import { useQuery } from '@tanstack/react-query';

// Resume direct download functionality
function triggerDownload(filename: string, fileUrl: string, newFilename: string) {
  fetch('/api/resume')
    .then(response => response.blob())
    .then(blob => {
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = blobUrl;
      a.download = newFilename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(blobUrl);
      document.body.removeChild(a);
    })
    .catch(error => console.error('Download failed:', error));
}

interface NavLink {
  label: string;
  id: string;
  icon: React.ReactNode;
  path?: string;
}

interface ResponsiveHeaderProps {
  navLinks: Array<NavLink>;
  className?: string;
}

/**
 * A responsive header component with a sidebar that slides in from the left
 * 
 * @example
 * <ResponsiveHeader navLinks={navLinks} />
 */
export function ResponsiveHeader({
  navLinks,
  className = '',
}: ResponsiveHeaderProps) {
  // Theme is now handled by ThemeToggle component
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const deviceType = useDeviceType();
  
  const { profile } = data;
  const initials = `${profile.firstName.charAt(0)}${profile.lastName.charAt(0)}`;

  // Fetch hero content for profile image
  const { data: heroData } = useQuery({
    queryKey: ['/api/hero'],
    queryFn: async () => {
      const response = await fetch('/api/hero', {
        cache: 'no-cache',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      if (!response.ok) throw new Error('Failed to fetch hero data');
      return response.json();
    },
    staleTime: 0,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchInterval: 30000,
  });

  const heroContent = (heroData as any)?.data;

  // Handle scroll event to add shadow and background blur on scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const handleNavClick = (link: NavLink) => {
    if (link.id === 'resume') {
      // Direct resume download - no redirection
      triggerDownload('resume.pdf', '/api/resume', 'Noorain_Raza_Resume.pdf');
    } else if (link.path) {
      // If it has a path, it's a page navigation
      window.location.href = link.path;
    } else {
      // Otherwise it's a section scroll within the current page
      scrollToElement(link.id);
    }
    closeSidebar();
  };

  // Theme toggle is now handled by the ThemeToggle component

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 w-full ${
        isScrolled
          ? 'bg-white dark:bg-gray-900 shadow-md'
          : 'bg-white dark:bg-gray-900 shadow'
      } ${className}`}
    >
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {/* Enhanced Logo */}
            <div 
              className="flex items-center"
              aria-label="Professional Portfolio - Home"
            >
              <NavProfilePhoto 
                size={40}
                onClick={() => window.location.href = '/'}
                className="mr-2"
                src={heroContent?.navImage || heroContent?.heroImage}
              />
              <span 
                className="text-xl font-bold text-primary hover:text-primary/90 dark:text-primary-400 inline hover:text-primary-accent duration-200 cursor-pointer"
                onClick={() => window.location.href = '/'}
              >
                Noorain Raza
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-6 xl:space-x-8">
            {navLinks.map((link) => (
              <a
                key={link.id}
                onClick={() => handleNavClick(link)}
                className="text-sm font-medium hover:text-primary dark:hover:text-primary-400 transition-colors cursor-pointer"
                role="button"
                tabIndex={0}
                aria-label={`Navigate to ${link.label} ${link.path ? 'page' : 'section'}`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    handleNavClick(link);
                  }
                }}
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Removed Contact button from desktop nav */}
            
            {/* Theme Toggle */}
            <ThemeToggle />
            
            {/* Mobile Menu Button - Right Side */}
            <Button
              variant="ghost"
              size="icon"
              className="block lg:hidden h-10 w-10 sm:h-10 sm:w-10 ml-2 hover:bg-primary/10 dark:hover:bg-primary-400/10 rounded-md transition-all duration-200"
              onClick={toggleSidebar}
              aria-label={sidebarOpen ? "Close menu" : "Open menu"}
              aria-expanded={sidebarOpen}
            >
              {sidebarOpen ? (
                <XIcon className="h-5 w-5 sm:h-6 sm:w-6 text-primary dark:text-primary-400 transition-all duration-200" />
              ) : (
                <MenuIcon className="h-5 w-5 sm:h-6 sm:w-6 text-primary dark:text-primary-400 transition-all duration-200" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Right side sliding sidebar for navigation */}
      <ResponsiveSidebar
        isOpen={sidebarOpen}
        onClose={closeSidebar}
        position="right"
        width={{
          mobile: '85%',
          tablet: '320px',
          desktop: '300px',
        }}
        headerContent={
          <div 
            className="flex items-center text-xl font-bold text-primary dark:text-primary-400 cursor-pointer" 
            onClick={() => {
              closeSidebar();
              window.location.href = '/';
            }}
          >
            <NavProfilePhoto 
              size={36}
              onClick={() => {
                closeSidebar();
                window.location.href = '/';
              }}
              className="mr-2"
            />
            <span className="hover:text-primary-accent duration-200">Noorain Raza</span>
          </div>
        }
      >
        <nav className="p-3 space-y-0.5">
          {navLinks.map((link) => (
            <a
              key={link.id}
              onClick={() => handleNavClick(link)}
              className="flex items-center gap-2 py-2 px-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors cursor-pointer"
              role="button"
              tabIndex={0}
              aria-label={`Navigate to ${link.label} ${link.path ? 'page' : 'section'}`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  handleNavClick(link);
                }
              }}
            >
              {link.icon}
              <span>{link.label}</span>
            </a>
          ))}
          
          {/* Removed Contact button for mobile to save space */}
        </nav>
      </ResponsiveSidebar>
    </header>
  );
}

export default ResponsiveHeader;