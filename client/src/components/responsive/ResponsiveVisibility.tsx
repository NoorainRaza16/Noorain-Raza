import React from 'react';
import { useDeviceType, DeviceType } from '@/utils/responsive';

interface ResponsiveVisibilityProps {
  children: React.ReactNode;
  showOn: DeviceType[];
  className?: string;
  as?: React.ElementType;
  fallback?: React.ReactNode;
}

/**
 * A component that conditionally renders its children based on the current device type
 *
 * @example
 * <ResponsiveVisibility showOn={['desktop', 'largeDesktop']}>
 *   <p>Only visible on desktop and larger screens</p>
 * </ResponsiveVisibility>
 *
 * @example
 * <ResponsiveVisibility 
 *   showOn={['mobile', 'tablet']} 
 *   as="section"
 *   fallback={<p>Please view on mobile or tablet</p>}
 * >
 *   <p>Mobile and tablet content</p>
 * </ResponsiveVisibility>
 */
export function ResponsiveVisibility({
  children,
  showOn,
  className = '',
  as: Component = 'div',
  fallback = null,
}: ResponsiveVisibilityProps) {
  const deviceType = useDeviceType();
  
  // Determine if content should be shown on the current device type
  const isVisible = showOn.includes(deviceType);
  
  if (!isVisible) {
    return fallback ? (
      <Component className={className}>
        {fallback}
      </Component>
    ) : null;
  }
  
  return (
    <Component className={className}>
      {children}
    </Component>
  );
}

/**
 * Shorthand components for specific device types
 */

export function MobileOnly({ 
  children, 
  ...props 
}: Omit<ResponsiveVisibilityProps, 'showOn'>) {
  return (
    <ResponsiveVisibility showOn={['mobile']} {...props}>
      {children}
    </ResponsiveVisibility>
  );
}

export function TabletOnly({ 
  children, 
  ...props 
}: Omit<ResponsiveVisibilityProps, 'showOn'>) {
  return (
    <ResponsiveVisibility showOn={['tablet']} {...props}>
      {children}
    </ResponsiveVisibility>
  );
}

export function DesktopOnly({ 
  children, 
  ...props 
}: Omit<ResponsiveVisibilityProps, 'showOn'>) {
  return (
    <ResponsiveVisibility showOn={['desktop', 'largeDesktop']} {...props}>
      {children}
    </ResponsiveVisibility>
  );
}

export function MobileAndTablet({ 
  children, 
  ...props 
}: Omit<ResponsiveVisibilityProps, 'showOn'>) {
  return (
    <ResponsiveVisibility showOn={['mobile', 'tablet']} {...props}>
      {children}
    </ResponsiveVisibility>
  );
}

export function TabletAndUp({ 
  children, 
  ...props 
}: Omit<ResponsiveVisibilityProps, 'showOn'>) {
  return (
    <ResponsiveVisibility showOn={['tablet', 'desktop', 'largeDesktop']} {...props}>
      {children}
    </ResponsiveVisibility>
  );
}

export default ResponsiveVisibility;