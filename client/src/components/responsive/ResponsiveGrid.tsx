import React from 'react';
import { useDeviceType, getResponsiveGridCols, DeviceType } from '@/utils/responsive';

interface ResponsiveGridProps {
  children: React.ReactNode;
  columns: number;
  className?: string;
  gap?: string;
  rowGap?: string;
  columnGap?: string;
  customColumns?: Partial<Record<DeviceType, number>>;
}

/**
 * A responsive grid component that automatically adjusts its column count
 * based on the current device type
 *
 * @example
 * <ResponsiveGrid columns={3} gap="gap-4">
 *   <div>Item 1</div>
 *   <div>Item 2</div>
 *   <div>Item 3</div>
 * </ResponsiveGrid>
 *
 * @example
 * <ResponsiveGrid 
 *   columns={4} 
 *   className="mt-8" 
 *   gap="gap-4"
 *   customColumns={{ mobile: 1, tablet: 2, desktop: 3, largeDesktop: 4 }}
 * >
 *   {items.map(item => (
 *     <div key={item.id}>{item.content}</div>
 *   ))}
 * </ResponsiveGrid>
 */
export function ResponsiveGrid({
  children,
  columns,
  className = '',
  gap = 'gap-4',
  rowGap,
  columnGap,
  customColumns,
}: ResponsiveGridProps) {
  const deviceType = useDeviceType();
  
  // Determine column count based on device type
  let colsClass = '';
  
  if (customColumns && customColumns[deviceType] !== undefined) {
    // Use custom column count if provided for this device type
    colsClass = `grid-cols-${customColumns[deviceType]}`;
  } else {
    // Otherwise use the standard responsive column logic
    colsClass = getResponsiveGridCols(deviceType, columns);
  }
  
  // Build the gap classes
  const gapClasses = [
    gap, 
    rowGap ? `row-${rowGap}` : '', 
    columnGap ? `column-${columnGap}` : ''
  ].filter(Boolean).join(' ');
  
  return (
    <div className={`grid ${colsClass} ${gapClasses} ${className}`.trim()}>
      {children}
    </div>
  );
}

export default ResponsiveGrid;