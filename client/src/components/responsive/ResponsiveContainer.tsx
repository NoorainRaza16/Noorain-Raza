import React from 'react';
import { useDeviceType, getResponsiveContainer } from '@/utils/responsive';

interface ResponsiveContainerProps {
  children: React.ReactNode;
  className?: string;
  as?: React.ElementType;
  fluid?: boolean;
}

/**
 * A responsive container component that automatically adjusts its padding and max-width
 * based on the current device type
 *
 * @example
 * <ResponsiveContainer>
 *   <p>Content adapts to screen size</p>
 * </ResponsiveContainer>
 *
 * @example
 * <ResponsiveContainer as="section" className="my-8" fluid>
 *   <p>Full-width section with custom classes</p>
 * </ResponsiveContainer>
 */
export function ResponsiveContainer({
  children,
  className = '',
  as: Component = 'div',
  fluid = false,
}: ResponsiveContainerProps) {
  const deviceType = useDeviceType();
  
  // Get responsive container classes based on device type
  const containerClasses = fluid 
    ? 'w-full px-4 sm:px-6 md:px-8 lg:px-12' 
    : getResponsiveContainer(deviceType);
  
  return (
    <Component className={`${containerClasses} ${className}`.trim()}>
      {children}
    </Component>
  );
}

export default ResponsiveContainer;