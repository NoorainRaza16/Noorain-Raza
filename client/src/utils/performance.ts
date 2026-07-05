import { useEffect, useState, useRef } from 'react';

// Interface for image optimization options
export interface ImageOptimizationOptions {
  quality?: number;
  format?: 'webp' | 'avif' | 'jpeg' | 'png' | 'original';
  width?: number;
  height?: number;
  blur?: boolean;
  preload?: boolean;
}

// Define critical resource types
export type CriticalResource = 'image' | 'script' | 'style' | 'font';

// Interface for resource loading preferences
export interface ResourceLoadingPreferences {
  critical: CriticalResource[];
  lazyLoad: boolean;
  preconnect: string[];
  prefetch: string[];
  preload: string[];
}

// Default options for image optimization
export const DEFAULT_IMAGE_OPTIONS: ImageOptimizationOptions = {
  quality: 80,
  format: 'webp',
  blur: false,
  preload: false
};

// Utility for optimizing image URLs - can be extended for a real image service
export function getOptimizedImageUrl(
  src: string,
  options: ImageOptimizationOptions = DEFAULT_IMAGE_OPTIONS
): string {
  // If it's already from an optimization service, return as is
  if (src.includes('imagecdn') || src.includes('imgix') || src.includes('cloudinary')) {
    return src;
  }

  // For local images, assume they'll be processed through an image loader
  if (!src.startsWith('http') && !src.startsWith('https')) {
    // For local images, process them based on the selected format
    const extension = options.format === 'original' 
      ? src.split('.').pop() 
      : options.format;
    
    // Remove extension and add the new one
    const baseUrl = src.includes('.') 
      ? src.substring(0, src.lastIndexOf('.'))
      : src;
    
    return `${baseUrl}.${extension}`;
  }

  // For remote images, we can't transform them directly without a service
  // Return original but could log or suggest using an image optimization service
  return src;
}

// Hook to detect when an element is visible in the viewport (for lazy loading)
export function useInView(rootMargin = '0px', threshold = 0) {
  const [isInView, setIsInView] = useState(false);
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!ref.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { rootMargin, threshold }
    );

    observer.observe(ref.current);

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [rootMargin, threshold]);

  return { ref, isInView };
}

// Hook for measuring component render performance
export function useRenderMetrics(componentName: string) {
  const startTimeRef = useRef<number>(0);
  
  useEffect(() => {
    startTimeRef.current = performance.now();
    
    return () => {
      const endTime = performance.now();
      const duration = endTime - startTimeRef.current;
      
      // Only log in development environment
      if (process.env.NODE_ENV === 'development') {
        console.log(`[Render Metrics] ${componentName}: ${duration.toFixed(2)}ms`);
      }
    };
  }, [componentName]);
}

// Hook to preload image assets that will be needed soon
export function useImagePreloader(imageSrcs: string[]) {
  useEffect(() => {
    const preloadImages = async () => {
      const promises = imageSrcs.map(src => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.src = src;
          img.onload = resolve;
          img.onerror = reject;
        });
      });
      
      try {
        await Promise.all(promises);
      } catch (error) {
        // Silently fail on image preload errors
        console.warn('Failed to preload some images');
      }
    };
    
    preloadImages();
  }, [imageSrcs]);
}

// Function to determine if browser supports certain image formats
export function getOptimalImageFormat(): 'avif' | 'webp' | 'jpg' {
  if (typeof window === 'undefined') {
    return 'webp'; // Default for SSR
  }
  
  // Create a test canvas to check format support
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    return 'jpg';
  }
  
  // Test AVIF support
  if (canvas.toDataURL('image/avif').indexOf('data:image/avif') === 0) {
    return 'avif';
  }
  
  // Test WebP support
  if (canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0) {
    return 'webp';
  }
  
  return 'jpg';
}

// Function to add preconnect links to the document head for performance optimization
export function addPreconnect(origins: string[]) {
  if (typeof document === 'undefined') {
    return; // Skip during SSR
  }
  
  origins.forEach(origin => {
    if (document.querySelector(`link[rel="preconnect"][href="${origin}"]`)) {
      return; // Skip if already exists
    }
    
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = origin;
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
    
    // Also add DNS prefetch as fallback for browsers that don't support preconnect
    const dnsPrefetch = document.createElement('link');
    dnsPrefetch.rel = 'dns-prefetch';
    dnsPrefetch.href = origin;
    document.head.appendChild(dnsPrefetch);
  });
}

// Function to defer non-critical resources
export function deferNonCriticalResources() {
  if (typeof window === 'undefined') {
    return; // Skip during SSR
  }
  
  // Find all non-critical scripts and mark them as async or defer
  const scripts = document.querySelectorAll('script:not([async]):not([defer])');
  Array.from(scripts).forEach((element) => {
    const script = element as HTMLScriptElement;
    // Skip inline scripts
    if (!script.src) return;
    
    // Skip already executed scripts
    if (script.hasAttribute('data-loaded')) return;
    
    // Mark third-party scripts as async
    if (!script.src.includes(window.location.origin)) {
      script.setAttribute('async', '');
      script.setAttribute('data-defer-optimized', 'true');
    }
  });
  
  // Find all CSS links and mark non-critical ones for lazy loading
  const stylesheets = document.querySelectorAll('link[rel="stylesheet"]');
  Array.from(stylesheets).forEach((element) => {
    const link = element as HTMLLinkElement;
    // Skip critical CSS files (which should be defined by specific patterns)
    if (link.href.includes('critical') || link.getAttribute('data-critical')) return;
    
    // Skip already processed links
    if (link.hasAttribute('data-loaded')) return;
    
    // Change to preload and lazy-load non-critical CSS
    link.setAttribute('rel', 'preload');
    link.setAttribute('as', 'style');
    link.setAttribute('onload', "this.onload=null;this.rel='stylesheet';this.setAttribute('data-loaded', 'true')");
    link.setAttribute('data-defer-optimized', 'true');
  });
}

// Web Vitals metric type
interface WebVitalMetric {
  value: number;
  id: string;
  name: string;
  delta?: number;
  entries: PerformanceEntry[];
}

// Hook to measure and report web vitals
export function useWebVitals() {
  useEffect(() => {
    // Only run in production to avoid development noise
    if (process.env.NODE_ENV !== 'production') return;
    
    // Note: The web-vitals library needs to be installed with:
    // npm install web-vitals
    // This function intentionally uses type any for the dynamic import
    const reportWebVitals = async () => {
      try {
        // Use dynamic import to avoid loading the library in all cases
        const webVitals = await import('web-vitals' as any);
        const { getCLS, getFID, getLCP, getFCP, getTTFB } = webVitals;
        
        getCLS((metric: WebVitalMetric) => console.log('CLS:', metric.value));
        getFID((metric: WebVitalMetric) => console.log('FID:', metric.value));
        getLCP((metric: WebVitalMetric) => console.log('LCP:', metric.value));
        getFCP((metric: WebVitalMetric) => console.log('FCP:', metric.value));
        getTTFB((metric: WebVitalMetric) => console.log('TTFB:', metric.value));
      } catch (error) {
        console.warn('Failed to load web-vitals library:', error);
      }
    };
    
    reportWebVitals();
  }, []);
}

// Function to remove unused CSS (to be used in build process)
export function optimizeCssForCurrentRoute(routeSelectors: string[]) {
  if (typeof document === 'undefined' || process.env.NODE_ENV !== 'production') {
    return; // Only run in browser and production
  }
  
  // Get all style elements
  const styles = document.querySelectorAll('style');
  styles.forEach(style => {
    if (style.hasAttribute('data-optimized')) return;
    
    // Parse the CSS content
    const stylesheet = style.sheet;
    if (!stylesheet) return;
    
    // Filter rules that are not needed for current route
    for (let i = stylesheet.cssRules.length - 1; i >= 0; i--) {
      const rule = stylesheet.cssRules[i];
      
      // Skip non-style rules like @media, @keyframes
      if (!(rule instanceof CSSStyleRule)) continue;
      
      let matchesRoute = false;
      
      // Check if any selector matches route-specific selectors
      for (const routeSelector of routeSelectors) {
        if (rule.selectorText.includes(routeSelector)) {
          matchesRoute = true;
          break;
        }
      }
      
      // Remove rules that don't match the current route
      if (!matchesRoute) {
        try {
          stylesheet.deleteRule(i);
        } catch (e) {
          // Ignore errors when trying to delete rules
        }
      }
    }
    
    style.setAttribute('data-optimized', 'true');
  });
}

// Function to load critical CSS first and defer non-critical
export function optimizeCssLoading(criticalCss: string) {
  if (typeof document === 'undefined') {
    return; // Skip during SSR
  }
  
  // Create style element for critical CSS
  const style = document.createElement('style');
  style.setAttribute('data-critical', 'true');
  style.textContent = criticalCss;
  document.head.appendChild(style);
  
  // Defer loading of non-critical stylesheets
  const stylesheets = document.querySelectorAll('link[rel="stylesheet"]:not([data-critical])');
  stylesheets.forEach(link => {
    link.setAttribute('media', 'print');
    link.setAttribute('onload', "this.media='all'");
  });
}

// Helper for resource hints (prefetch, preload, etc.)
export function addResourceHint(type: 'prefetch' | 'preload' | 'prerender', url: string, as?: string) {
  if (typeof document === 'undefined') {
    return; // Skip during SSR
  }
  
  // Skip if already exists
  if (document.querySelector(`link[rel="${type}"][href="${url}"]`)) {
    return;
  }
  
  const link = document.createElement('link');
  link.rel = type;
  link.href = url;
  if (as) {
    link.setAttribute('as', as);
  }
  document.head.appendChild(link);
}

// Function to detect network conditions
export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  
  const [connectionType, setConnectionType] = useState<string>('unknown');
  const [effectiveType, setEffectiveType] = useState<string>('unknown');
  
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Check for Network Information API
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      
      if (connection) {
        setConnectionType(connection.type || 'unknown');
        setEffectiveType(connection.effectiveType || 'unknown');
        
        const handleChange = () => {
          setConnectionType(connection.type || 'unknown');
          setEffectiveType(connection.effectiveType || 'unknown');
        };
        
        connection.addEventListener('change', handleChange);
        return () => {
          connection.removeEventListener('change', handleChange);
        };
      }
    }
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  return {
    isOnline,
    connectionType,
    effectiveType,
    isSaveData: typeof navigator !== 'undefined' && 
      'connection' in navigator && 
      (navigator as any).connection?.saveData || false
  };
}

// Helper for adaptive loading based on device capabilities and network
export function useAdaptiveLoading() {
  const network = useNetworkStatus();
  const [deviceMemory, setDeviceMemory] = useState<number>(
    typeof navigator !== 'undefined' && 'deviceMemory' in navigator 
      ? (navigator as any).deviceMemory 
      : 4
  );
  
  // Determine if we should use high or low-quality assets
  const shouldUseHighQualityAssets = network.isOnline && 
    (network.effectiveType === '4g' || network.effectiveType === 'unknown') &&
    deviceMemory >= 4 &&
    !network.isSaveData;
  
  return {
    ...network,
    deviceMemory,
    shouldUseHighQualityAssets,
    isLowEndDevice: deviceMemory < 4
  };
}

// Helper to control animation performance
export function useOptimizedAnimation(shouldReduce = false) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const { isLowEndDevice } = useAdaptiveLoading();
  
  // Determine if animations should be reduced/disabled
  const shouldReduceMotion = prefersReducedMotion || isLowEndDevice || shouldReduce;
  
  return {
    shouldReduceMotion,
    getAnimationDuration: (baseDuration: number) => 
      shouldReduceMotion ? 0 : baseDuration,
    getTransitionClass: (className: string) => 
      shouldReduceMotion ? '' : className
  };
}

// Import from responsive.ts for dependency
function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(false);
  
  useEffect(() => {
    // Only run in browser environment
    if (typeof window === 'undefined') return;
    
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const listener = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };
    
    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, []);
  
  return prefersReducedMotion;
}