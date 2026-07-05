// Export all performance components for easy importing
export { default as OptimizedImage } from './OptimizedImage';
export { default as LazyLoad } from './LazyLoad';
export { default as DeferredComponent } from './DeferredComponent';

// Re-export performance utilities
export {
  useInView,
  useRenderMetrics,
  useImagePreloader,
  useWebVitals,
  useNetworkStatus,
  useAdaptiveLoading,
  useOptimizedAnimation,
  getOptimizedImageUrl,
  getOptimalImageFormat,
  addPreconnect,
  addResourceHint,
  deferNonCriticalResources,
  optimizeCssLoading,
  optimizeCssForCurrentRoute,
  ImageOptimizationOptions,
  CriticalResource,
  ResourceLoadingPreferences,
  DEFAULT_IMAGE_OPTIONS
} from '@/utils/performance';