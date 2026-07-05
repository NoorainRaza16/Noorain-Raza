import React, { useState, useEffect } from 'react';
import { useAdaptiveLoading } from '@/utils/performance';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface DeferredComponentProps {
  children: React.ReactNode;
  delay?: number;
  priority?: 'high' | 'medium' | 'low';
  placeholder?: React.ReactNode;
  adaptToNetwork?: boolean;
  className?: string;
  onLoad?: () => void;
}

/**
 * Defers rendering of non-critical components based on priority and network conditions
 * Helps improve performance by separating critical from non-critical rendering
 *
 * @example
 * <DeferredComponent delay={100}>
 *   <SocialMediaWidgets />
 * </DeferredComponent>
 *
 * @example
 * <DeferredComponent 
 *   priority="low" 
 *   adaptToNetwork
 *   placeholder={<ContentPlaceholder />}
 *   onLoad={() => trackLoadCompletion('analytics')}
 * >
 *   <ThirdPartyAnalytics />
 * </DeferredComponent>
 */
export function DeferredComponent({
  children,
  delay: initialDelay,
  priority = 'medium',
  placeholder,
  adaptToNetwork = false,
  className = '',
  onLoad,
}: DeferredComponentProps) {
  const [shouldRender, setShouldRender] = useState(false);
  const networkStatus = useAdaptiveLoading();
  
  // Calculate actual delay based on priority and network conditions
  const calculateDelay = () => {
    let delay = initialDelay;
    
    // Set default delays based on priority if not specified
    if (delay === undefined) {
      if (priority === 'high') delay = 100;
      else if (priority === 'medium') delay = 500;
      else delay = 1000;
    }
    
    // Adjust delay based on network conditions if adaptToNetwork is true
    if (adaptToNetwork) {
      if (!networkStatus.isOnline) {
        return delay * 2; // Double the delay when offline
      }
      
      // Adjust based on connection type
      if (networkStatus.effectiveType === '4g') {
        return delay;
      } else if (networkStatus.effectiveType === '3g') {
        return delay * 1.5;
      } else if (networkStatus.effectiveType === '2g' || networkStatus.effectiveType === 'slow-2g') {
        return delay * 2;
      }
      
      // Adjust based on device capability
      if (networkStatus.isLowEndDevice) {
        return delay * 1.5;
      }
      
      // Adjust for save-data mode
      if (networkStatus.isSaveData) {
        return delay * 2;
      }
    }
    
    return delay;
  };
  
  useEffect(() => {
    // If it's high priority with no delay, render immediately
    if (priority === 'high' && initialDelay === 0) {
      setShouldRender(true);
      if (onLoad) onLoad();
      return;
    }
    
    const finalDelay = calculateDelay();
    
    // Use requestIdleCallback for low priority or fall back to setTimeout
    if (priority === 'low' && typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      const handle = (window as any).requestIdleCallback(
        () => {
          setTimeout(() => {
            setShouldRender(true);
            if (onLoad) onLoad();
          }, finalDelay);
        },
        { timeout: 2000 }
      );
      
      return () => {
        if ('cancelIdleCallback' in window) {
          (window as any).cancelIdleCallback(handle);
        }
      };
    } else {
      // For medium/high priority or when requestIdleCallback is not available
      const timer = setTimeout(() => {
        setShouldRender(true);
        if (onLoad) onLoad();
      }, finalDelay);
      
      return () => clearTimeout(timer);
    }
  }, [priority, initialDelay, adaptToNetwork, onLoad, networkStatus]);
  
  // Default placeholder is a simple loading spinner
  const defaultPlaceholder = (
    <div className="flex items-center justify-center py-4">
      <LoadingSpinner size="sm" />
    </div>
  );
  
  // The placeholder to show while content is being deferred
  const placeholderContent = placeholder || defaultPlaceholder;
  
  return (
    <div className={className}>
      {shouldRender ? children : placeholderContent}
    </div>
  );
}

export default DeferredComponent;