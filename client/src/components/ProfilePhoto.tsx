import React from 'react';

export function ProfilePhoto({ 
  className, 
  size = 'md',
  alt = "Noorain Raza",
  src
}: { 
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  alt?: string;
  src?: string;
}) {
  const sizeClasses = {
    sm: 'w-40 h-40',
    md: 'w-60 h-60 sm:w-64 sm:h-64',
    lg: 'w-60 h-60 sm:w-72 sm:h-72 md:w-80 md:h-80',
    xl: 'w-60 h-60 sm:w-72 sm:h-72 md:w-80 md:h-80 lg:w-96 lg:h-96',
  };

  return (
    <img
      src={src || "/assets/profile-photo.jpg"}
      alt={alt}
      className={`${sizeClasses[size]} object-cover rounded-full ${className || ''}`}
    />
  );
}