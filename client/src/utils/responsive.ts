import { useEffect, useState, useMemo } from 'react';

// Define standard breakpoints for the application
export enum Breakpoint {
  XS = 320,    // Extra small devices (phones)
  SM = 640,    // Small devices (large phones, small tablets)
  MD = 768,    // Medium devices (tablets)
  LG = 1024,   // Large devices (desktops)
  XL = 1280,   // Extra large devices (large desktops)
  XXL = 1536   // Extra extra large devices (ultra large screens)
}

// Define device types for better semantic understanding
export type DeviceType = 'mobile' | 'tablet' | 'desktop' | 'largeDesktop';

// A hook to detect the current viewport width
export function useViewportWidth() {
  const [width, setWidth] = useState<number>(
    typeof window !== 'undefined' ? window.innerWidth : 0
  );

  useEffect(() => {
    // Only run in browser environment
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      setWidth(window.innerWidth);
    };

    // Set initial width
    setWidth(window.innerWidth);

    // Add event listener
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return width;
}

// Hook to determine if the viewport is below a certain breakpoint
export function useBreakpoint(breakpoint: Breakpoint) {
  const width = useViewportWidth();
  return width < breakpoint;
}

// Hook to determine the current device type
export function useDeviceType(): DeviceType {
  const width = useViewportWidth();
  
  return useMemo(() => {
    if (width < Breakpoint.SM) return 'mobile';
    if (width < Breakpoint.LG) return 'tablet';
    if (width < Breakpoint.XL) return 'desktop';
    return 'largeDesktop';
  }, [width]);
}

// Enhanced mobile detection hook with additional functionality beyond the original useIsMobile
export function useIsMobile() {
  const deviceType = useDeviceType();
  return deviceType === 'mobile';
}

// Hook to check if the device is in portrait or landscape orientation
export function useOrientation() {
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>(
    typeof window !== 'undefined' 
      ? window.innerHeight > window.innerWidth 
        ? 'portrait' 
        : 'landscape'
      : 'portrait'
  );

  useEffect(() => {
    // Only run in browser environment
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      setOrientation(
        window.innerHeight > window.innerWidth ? 'portrait' : 'landscape'
      );
    };

    // Set initial orientation
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return orientation;
}

// Helper function to generate responsive styles based on breakpoints
export function getResponsiveValue<T>(
  values: Partial<Record<DeviceType, T>>,
  deviceType: DeviceType,
  defaultValue: T
): T {
  if (values[deviceType] !== undefined) {
    return values[deviceType] as T;
  }
  
  // Fallback logic based on device hierarchy
  if (deviceType === 'mobile' && values.tablet !== undefined) return values.tablet as T;
  if (deviceType === 'tablet' && values.desktop !== undefined) return values.desktop as T;
  if (deviceType === 'desktop' && values.largeDesktop !== undefined) return values.largeDesktop as T;
  if (deviceType === 'largeDesktop' && values.desktop !== undefined) return values.desktop as T;
  
  return defaultValue;
}

// Generate appropriate text sizes for different devices
export function getResponsiveTextSize(
  deviceType: DeviceType, 
  baseSize: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl'
): string {
  const sizeMap: Record<typeof baseSize, Record<DeviceType, string>> = {
    'xs': {
      mobile: 'text-xs',
      tablet: 'text-xs',
      desktop: 'text-xs',
      largeDesktop: 'text-xs'
    },
    'sm': {
      mobile: 'text-xs',
      tablet: 'text-sm',
      desktop: 'text-sm',
      largeDesktop: 'text-sm'
    },
    'base': {
      mobile: 'text-sm',
      tablet: 'text-base',
      desktop: 'text-base',
      largeDesktop: 'text-base'
    },
    'lg': {
      mobile: 'text-base',
      tablet: 'text-lg',
      desktop: 'text-lg',
      largeDesktop: 'text-lg'
    },
    'xl': {
      mobile: 'text-lg',
      tablet: 'text-xl',
      desktop: 'text-xl',
      largeDesktop: 'text-xl'
    },
    '2xl': {
      mobile: 'text-xl',
      tablet: 'text-2xl',
      desktop: 'text-2xl',
      largeDesktop: 'text-2xl'
    },
    '3xl': {
      mobile: 'text-2xl',
      tablet: 'text-3xl',
      desktop: 'text-3xl',
      largeDesktop: 'text-3xl'
    },
    '4xl': {
      mobile: 'text-3xl',
      tablet: 'text-4xl',
      desktop: 'text-4xl',
      largeDesktop: 'text-4xl'
    },
    '5xl': {
      mobile: 'text-4xl',
      tablet: 'text-5xl',
      desktop: 'text-5xl',
      largeDesktop: 'text-5xl'
    }
  };
  
  return sizeMap[baseSize][deviceType];
}

// Helper to create responsive spacing for margin and padding
export function getResponsiveSpacing(
  deviceType: DeviceType,
  type: 'margin' | 'padding',
  direction: 'x' | 'y' | 't' | 'r' | 'b' | 'l' | '',
  size: number
): string {
  const prefix = type === 'margin' ? 'm' : 'p';
  const dir = direction ? `-${direction}` : '';
  
  const sizeMap: Record<DeviceType, number> = {
    mobile: Math.max(1, size - 2),
    tablet: Math.max(1, size - 1),
    desktop: size,
    largeDesktop: size
  };
  
  return `${prefix}${dir}-${sizeMap[deviceType]}`;
}

// Helper to detect touch-capable devices
export function useTouchDevice() {
  const [isTouch, setIsTouch] = useState<boolean>(false);
  
  useEffect(() => {
    // Only run in browser environment
    if (typeof window === 'undefined') return;
    
    setIsTouch(
      'ontouchstart' in window || 
      navigator.maxTouchPoints > 0 || 
      (navigator as any).msMaxTouchPoints > 0
    );
  }, []);
  
  return isTouch;
}

// Helper to detect reduced motion preference
export function usePrefersReducedMotion() {
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

// Helper to detect dark mode preference
export function usePrefersDarkMode() {
  const [prefersDarkMode, setPrefersDarkMode] = useState<boolean>(false);
  
  useEffect(() => {
    // Only run in browser environment
    if (typeof window === 'undefined') return;
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setPrefersDarkMode(mediaQuery.matches);
    
    const listener = (event: MediaQueryListEvent) => {
      setPrefersDarkMode(event.matches);
    };
    
    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, []);
  
  return prefersDarkMode;
}

// Helper to detect high contrast mode preference
export function usePrefersHighContrast() {
  const [prefersHighContrast, setPrefersHighContrast] = useState<boolean>(false);
  
  useEffect(() => {
    // Only run in browser environment
    if (typeof window === 'undefined') return;
    
    const mediaQuery = window.matchMedia('(prefers-contrast: more)');
    setPrefersHighContrast(mediaQuery.matches);
    
    const listener = (event: MediaQueryListEvent) => {
      setPrefersHighContrast(event.matches);
    };
    
    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, []);
  
  return prefersHighContrast;
}

// Function to get grid column classes based on device type
export function getResponsiveGridCols(deviceType: DeviceType, colsDesktop: number): string {
  const colsMap: Record<DeviceType, number> = {
    mobile: colsDesktop === 1 ? 1 : Math.min(colsDesktop, 1),
    tablet: colsDesktop === 1 ? 1 : Math.min(colsDesktop, 2),
    desktop: colsDesktop,
    largeDesktop: colsDesktop
  };
  
  return `grid-cols-${colsMap[deviceType]}`;
}

// Function to generate container width classes based on device
export function getResponsiveContainer(deviceType: DeviceType): string {
  const containerMap: Record<DeviceType, string> = {
    mobile: 'container mx-auto px-4',
    tablet: 'container mx-auto px-6',
    desktop: 'container mx-auto px-8',
    largeDesktop: 'container mx-auto px-12'
  };
  
  return containerMap[deviceType];
}