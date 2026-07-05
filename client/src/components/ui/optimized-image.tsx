import React, { useState } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  loading?: 'lazy' | 'eager';
  priority?: boolean;
  sizes?: string;
}

export function OptimizedImage({
  src,
  alt,
  className,
  width,
  height,
  loading = 'lazy',
  priority = false,
  sizes = '100vw',
  ...props
}: OptimizedImageProps & React.ImgHTMLAttributes<HTMLImageElement>) {
  const [imgError, setImgError] = useState(false);
  
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
  
  // For SVG icons specifically from devicon, generate fallback using initials
  const getIconFallback = () => {
    const iconName = src?.split('/').pop()?.split('-')[0] || alt || 'icon';
    const initial = iconName.charAt(0).toUpperCase();
    const bgColor = stringToColor(iconName);
    const textColor = '#ffffff';
    
    return (
      <div 
        className={`${className} flex items-center justify-center rounded-md overflow-hidden`}
        style={{
          width: width || '100%',
          height: height || '100%',
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
    const placeholderText = (alt || 'IMG').split(' ').map(word => word[0]).join('').slice(0, 2).toUpperCase();
    const bgColor = stringToColor(alt || 'placeholder');
    const textColor = '#ffffff';
    
    // Apply the border radius from the original image class if it contains border radius
    const hasBorderRadius = className?.includes('rounded');
    const roundedClass = hasBorderRadius ? className : `${className} rounded-md`;
    
    return (
      <div 
        className={`${roundedClass} flex items-center justify-center overflow-hidden`}
        style={{
          width: width || '100%',
          height: height || '100%',
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
  
  // For external URLs (like CDN images), use direct loading without picture element
  const isExternalUrl = src && (src.startsWith('http') || src.startsWith('https'));
  
  // Create a fallback image for icons/logos with issues
  const isSvgIcon = src && (src.includes('devicon') || src.endsWith('.svg'));
  const isPlaceholderImage = src && (src.includes('placeholder') || src.includes('example'));

  // Handle undefined or null src
  if (!src) {
    return getImagePlaceholder();
  }
  
  // Set default dimensions for aspect ratio if provided
  const aspectRatio = (width && height) ? { aspectRatio: `${width} / ${height}` } : {};
  
  // If priority is true, use eager loading
  const imgLoading = priority ? 'eager' : loading;
  
  // Create props for the img element
  const imgProps: React.ImgHTMLAttributes<HTMLImageElement> & { [key: string]: any } = {
    src,
    alt,
    className,
    loading: imgLoading,
    width,
    height,
    sizes,
    style: {
      ...aspectRatio,
      objectFit: props.style?.objectFit || 'contain',
    } as React.CSSProperties,
    ...props
  };
  
  // Add fetchpriority as a custom property
  if (priority) {
    imgProps.fetchpriority = 'high';
  }
  
  // Handle image loading error
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    console.warn("Image failed to load, using fallback:", src);
    const target = e.target as HTMLImageElement;
    target.onerror = null; // Prevent infinite error loop
    
    // Try to use demo.png as fallback for missing images
    if (!src.includes('demo.png')) {
      target.src = '/assets/demo.png';
    } else {
      setImgError(true);
    }
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
  
  // For local URLs, we can still use picture element with different formats
  // Extract file extension and base URL for local files
  const [baseUrl, extension] = src.split(/\.(?=[^.]+$)/);
  
  // Generate optimized image URLs for local files
  const webpUrl = extension && baseUrl ? `${baseUrl}.webp` : src;
  const fallbackUrl = src;
  
  return (
    <picture>
      {/* WebP format - good compatibility and better than JPEG/PNG */}
      <source
        srcSet={webpUrl}
        type="image/webp"
        sizes={sizes}
      />
      
      {/* Fallback image */}
      <img {...imgProps} onError={handleImageError} />
    </picture>
  );
}

export default OptimizedImage;