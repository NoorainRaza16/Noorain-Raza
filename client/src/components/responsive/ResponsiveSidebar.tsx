import React, { useState, useEffect, useRef } from 'react';
import { useDeviceType, DeviceType } from '../responsive';
import { XIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ResponsiveSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  position?: 'left' | 'right';
  width?: {
    mobile?: string;
    tablet?: string;
    desktop?: string;
    largeDesktop?: string;
  };
  overlayClassName?: string;
  headerContent?: React.ReactNode;
  showCloseButton?: boolean;
}

/**
 * A responsive sidebar component that slides in from the left or right side
 * 
 * @example
 * <ResponsiveSidebar
 *   isOpen={isSidebarOpen}
 *   onClose={closeSidebar}
 *   position="left"
 * >
 *   <SidebarContent />
 * </ResponsiveSidebar>
 * 
 * @example
 * <ResponsiveSidebar
 *   isOpen={isSidebarOpen}
 *   onClose={closeSidebar}
 *   position="left"
 *   width={{
 *     mobile: '85%',
 *     tablet: '320px',
 *     desktop: '360px'
 *   }}
 *   headerContent={<h2 className="text-xl font-bold">Menu</h2>}
 * >
 *   <SidebarNavigation />
 * </ResponsiveSidebar>
 */
export function ResponsiveSidebar({
  isOpen,
  onClose,
  children,
  className = '',
  position = 'left',
  width = {
    mobile: '85%',
    tablet: '320px',
    desktop: '280px',
    largeDesktop: '320px',
  },
  overlayClassName = '',
  headerContent,
  showCloseButton = true,
}: ResponsiveSidebarProps) {
  const deviceType = useDeviceType();
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Determine sidebar width based on device type
  const getResponsiveWidth = () => {
    const deviceWidth = width[deviceType] || width.mobile;
    return deviceWidth || '80%';
  };

  const sidebarWidth = getResponsiveWidth();
  
  // Handle click outside to close sidebar
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isOpen &&
        !isAnimating &&
        sidebarRef.current && 
        !sidebarRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, isAnimating, onClose]);
  
  // Lock body scroll when sidebar is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);
  
  // Handle animation states
  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
      const timer = setTimeout(() => {
        setIsAnimating(false);
      }, 300); // Match transition duration
      
      return () => clearTimeout(timer);
    }
  }, [isOpen]);
  
  // Ensure we're sliding from the left side
  const translateValue = position === 'left' 
    ? isOpen ? 'translate-x-0' : '-translate-x-full'
    : isOpen ? 'translate-x-0' : 'translate-x-full';
  
  // Position classes
  const positionClasses = position === 'left'
    ? 'left-0'
    : 'right-0';
  
  return (
    <>
      {/* Overlay Background */}
      {isOpen && (
        <div 
          className={`fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm z-40 ${overlayClassName}`}
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      
      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className={`fixed top-0 bottom-0 ${positionClasses} ${translateValue} w-${sidebarWidth} max-w-xs bg-white dark:bg-gray-900 shadow-xl z-50 transform transition-transform duration-300 ease-in-out overflow-y-auto ${className}`}
        style={{ 
          width: sidebarWidth,
          maxHeight: '100vh',
          overflowY: 'auto',
          borderRight: position === 'left' ? '1px solid rgba(209, 213, 219, 0.2)' : 'none',
          borderLeft: position === 'right' ? '1px solid rgba(209, 213, 219, 0.2)' : 'none'
        }}
        role="dialog"
        aria-label={`${position === 'left' ? 'Left' : 'Right'} sidebar`}
        aria-modal="true"
        aria-hidden={!isOpen}
      >
        {/* Header with close button */}
        {(headerContent || showCloseButton) && (
          <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
            {headerContent || <div />}
            
            {showCloseButton && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                aria-label="Close sidebar"
                className="h-8 w-8"
              >
                <XIcon className="h-5 w-5" />
              </Button>
            )}
          </div>
        )}
        
        {/* Sidebar Content */}
        <div className="h-full">
          {children}
        </div>
      </div>
    </>
  );
}

export default ResponsiveSidebar;