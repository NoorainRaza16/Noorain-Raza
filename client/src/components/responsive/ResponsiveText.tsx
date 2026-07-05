import React from 'react';
import { useDeviceType, getResponsiveTextSize, DeviceType } from '@/utils/responsive';

interface ResponsiveTextProps {
  children: React.ReactNode;
  size: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl';
  className?: string;
  as?: React.ElementType;
  customSizes?: Partial<Record<DeviceType, string>>;
}

/**
 * A responsive text component that automatically adjusts font size
 * based on the current device type
 *
 * @example
 * <ResponsiveText size="2xl">
 *   Responsive heading
 * </ResponsiveText>
 *
 * @example
 * <ResponsiveText 
 *   size="lg" 
 *   as="p" 
 *   className="font-medium"
 *   customSizes={{ mobile: 'text-sm', tablet: 'text-base' }}
 * >
 *   Custom responsive paragraph
 * </ResponsiveText>
 */
export function ResponsiveText({
  children,
  size,
  className = '',
  as: Component = 'span',
  customSizes,
}: ResponsiveTextProps) {
  const deviceType = useDeviceType();
  
  // Get responsive text size class based on device type
  let sizeClass = '';
  
  if (customSizes && customSizes[deviceType]) {
    // Use custom size if provided for this device type
    sizeClass = customSizes[deviceType] as string;
  } else {
    // Otherwise use the standard responsive sizing
    sizeClass = getResponsiveTextSize(deviceType, size);
  }
  
  return (
    <Component className={`${sizeClass} ${className}`.trim()}>
      {children}
    </Component>
  );
}

export default ResponsiveText;