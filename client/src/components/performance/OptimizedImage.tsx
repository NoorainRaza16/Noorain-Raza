import React, { useState } from 'react';
import { getOptimizedImageUrl, getOptimalImageFormat, ImageOptimizationOptions } from '@/utils/performance';
import { useDeviceType, DeviceType } from '@/utils/responsive';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  loading?: 'lazy' | 'eager';
  priority?: boolean;
  sizes?: string;
  quality?: number;
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
  deviceSizes?: Partial<Record<DeviceType, { width?: number; height?: number }>>;
  placeholderColor?: string;
  blur?: boolean;
}

/**
 * An enhanced optimized image component that builds upon the current OptimizedImage
 * with additional responsive and performance capabilities
 *
 * @example
 * <OptimizedImage 
 *   src="/images/hero.jpg" 
 *   alt="Hero image" 
 *   width={800} 
 *   height={600}
 *   priority
 * />
 * 
 * @example
 * <OptimizedImage 
 *   src="https://example.com/image.jpg" 
 *   alt="External image" 
 *   className="rounded-lg" 
 *   loading="lazy"
 *   sizes="(max-width: 768px) 100vw, 50vw"
 *   deviceSizes={{
 *     mobile: { width: 320, height: 240 },
 *     desktop: { width: 800, height: 600 }
 *   }}
 *   objectFit="cover"
 *   blur
 * />
 */
export function OptimizedImage({
  src,
  alt,
  className = '',
  width,
  height,
  loading = 'lazy',
  priority = false,
  sizes = '100vw',
  quality = 80,
  objectFit = 'cover',
  deviceSizes,
  placeholderColor,
  blur = false,
  ...props
}: OptimizedImageProps & Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src' | 'alt' | 'loading' | 'width' | 'height'>) {
  const [imgError, setImgError] = useState(false);
  const deviceType = useDeviceType();
  const optimalFormat = getOptimalImageFormat();
  
  // Determine optimal image dimensions based on device type
  let imgWidth = width;
  let imgHeight = height;
  
  if (deviceSizes && deviceSizes[deviceType]) {
    imgWidth = deviceSizes[deviceType]?.width || width;
    imgHeight = deviceSizes[deviceType]?.height || height;
  }
  
  // For external URLs (like CDN images), use direct loading
  const isExternalUrl = src.startsWith('http') || src.startsWith('https');
  
  // Create a fallback for icons/logos
  const isSvgIcon = src.includes('devicon') || src.endsWith('.svg');
  const isPlaceholderImage = src.includes('placeholder') || src.includes('example');
  
  // Generate a color based on the name for consistent fallback backgrounds
  const stringToColor = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    let color = '#';
    for (let i = 0; i < 3; i++) {
      const value = (hash >> (i * 8)) & 0xFF;
      color += ('00' + value.toString(16)).slice(-2);
    }
    return color;
  };
  
  // For SVG icons specifically, generate fallback using initials
  const getIconFallback = () => {
    // Extract icon name from path or use alt text
    const iconName = src.split('/').pop()?.split('-')[0] || alt;
    const initial = iconName.charAt(0).toUpperCase();
    const bgColor = placeholderColor || stringToColor(iconName);
    const textColor = '#ffffff';
    
    return (
      <div 
        className={`${className} flex items-center justify-center rounded-md overflow-hidden`}
        style={{
          width: imgWidth || '100%',
          height: imgHeight || '100%',
          backgroundColor: bgColor,
          color: textColor,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          ...(props.style || {})
        }}
      >
        <span className="text-lg font-semibold">{initial}</span>
      </div>
    );
  };
  
  // For image placeholders
  const getImagePlaceholder = () => {
    // Extract meaningful parts from the image URL or alt text
    const placeholderText = alt.split(' ').map(word => word[0]).join('').slice(0, 2).toUpperCase();
    const bgColor = placeholderColor || stringToColor(alt);
    const textColor = '#ffffff';
    
    // Apply border radius from the original image class if it contains border radius
    const hasBorderRadius = className?.includes('rounded');
    const roundedClass = hasBorderRadius ? className : `${className} rounded-md`;
    
    return (
      <div 
        className={`${roundedClass} flex items-center justify-center overflow-hidden`}
        style={{
          width: imgWidth || '100%',
          height: imgHeight || '100%',
          backgroundColor: bgColor,
          color: textColor,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          ...(props.style || {})
        }}
      >
        <span className="text-2xl font-bold">{placeholderText}</span>
      </div>
    );
  };
  
  // Generate the optimized image URL based on device needs
  const getOptimizedSrc = () => {
    const options: ImageOptimizationOptions = {
      quality,
      format: optimalFormat === 'jpg' ? 'jpeg' : optimalFormat,
      width: imgWidth,
      height: imgHeight,
      blur
    };
    
    return getOptimizedImageUrl(src, options);
  };
  
  // Set default dimensions for aspect ratio if provided
  const aspectRatio = (imgWidth && imgHeight) ? { aspectRatio: `${imgWidth} / ${imgHeight}` } : {};
  
  // If priority is true, use eager loading
  const imgLoading = priority ? 'eager' : loading;
  
  // Create props for the img element
  const imgProps: React.ImgHTMLAttributes<HTMLImageElement> & { [key: string]: any } = {
    src: getOptimizedSrc(),
    alt,
    className,
    loading: imgLoading,
    width: imgWidth,
    height: imgHeight,
    sizes,
    style: {
      ...aspectRatio,
      objectFit,
    } as React.CSSProperties,
    ...props
  };
  
  // Add fetchpriority for high-priority images
  if (priority) {
    imgProps.fetchpriority = 'high';
  }
  
  // Handle image loading error
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.target as HTMLImageElement;
    target.onerror = null; // Prevent infinite error loop
    setImgError(true);
  };
  
  // If there was an error loading the image, show appropriate fallback
  if (imgError) {
    if (isSvgIcon) {
      return getIconFallback();
    } else if (isPlaceholderImage || src.includes('image') || className?.includes('object-cover')) {
      return getImagePlaceholder();
    }
  }
  
  // For external URLs, just return the img element directly with error handling
  if (isExternalUrl) {
    return <img {...imgProps} onError={handleImageError} />;
  }
  
  // For local URLs, use picture element with modern formats
  const optimizedSrc = getOptimizedSrc();
  
  return (
    <picture>
      {/* AVIF format - best compression but less compatibility */}
      {optimalFormat === 'avif' && (
        <source
          srcSet={optimizedSrc}
          type="image/avif"
          sizes={sizes}
        />
      )}
      
      {/* WebP format - good compatibility and better than JPEG/PNG */}
      {optimalFormat !== 'avif' && (
        <source
          srcSet={optimizedSrc}
          type="image/webp"
          sizes={sizes}
        />
      )}
      
      {/* Fallback image */}
      <img {...imgProps} onError={handleImageError} />
    </picture>
  );
}

export default OptimizedImage;