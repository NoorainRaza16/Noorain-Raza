// Export all responsive components for easy importing
export { default as ResponsiveContainer } from './ResponsiveContainer';
export { default as ResponsiveText } from './ResponsiveText';
export { default as ResponsiveGrid } from './ResponsiveGrid';
export { default as ResponsiveSidebar } from './ResponsiveSidebar';
export { default as ResponsiveHeader } from './ResponsiveHeader';
export { 
  default as ResponsiveVisibility,
  MobileOnly,
  TabletOnly,
  DesktopOnly,
  MobileAndTablet,
  TabletAndUp
} from './ResponsiveVisibility';

// For convenience, re-export types and functions from the responsive utility
export {
  useDeviceType,
  useIsMobile,
  useBreakpoint,
  useOrientation,
  useTouchDevice,
  usePrefersDarkMode,
  usePrefersHighContrast,
  usePrefersReducedMotion,
  getResponsiveContainer,
  getResponsiveGridCols,
  getResponsiveTextSize,
  getResponsiveSpacing,
  getResponsiveValue,
  Breakpoint
} from '@/utils/responsive';

// Define device type
export type DeviceType = 'mobile' | 'tablet' | 'desktop' | 'largeDesktop';