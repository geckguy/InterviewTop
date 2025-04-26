import React from 'react';
import { cn } from '@/lib/utils';

interface CompanyBadgeProps {
  name: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const CompanyBadge = ({ name, size = 'md', className }: CompanyBadgeProps) => {
  // Generate initials from company name
  const initials = name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  // Generate a deterministic background color based on company name
  const lightColors = ['bg-blue-100', 'bg-green-100', 'bg-yellow-100', 'bg-purple-100', 'bg-pink-100', 'bg-indigo-100', 'bg-red-100'];
  const darkColors = ['bg-blue-900', 'bg-green-900', 'bg-yellow-900', 'bg-purple-900', 'bg-pink-900', 'bg-indigo-900', 'bg-red-900'];
  
  const colorIndex = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % lightColors.length;
  
  // Generate a deterministic text color based on company name
  const lightTextColors = ['text-blue-700', 'text-green-700', 'text-yellow-700', 'text-purple-700', 'text-pink-700', 'text-indigo-700', 'text-red-700'];
  const darkTextColors = ['text-blue-200', 'text-green-200', 'text-yellow-200', 'text-purple-200', 'text-pink-200', 'text-indigo-200', 'text-red-200'];

  const sizeClasses = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-12 h-12 text-base'
  };

  return (
    <div className={cn(
      'flex items-center justify-center rounded-md font-semibold',
      lightColors[colorIndex],
      lightTextColors[colorIndex],
      `dark:${darkColors[colorIndex]}`,
      `dark:${darkTextColors[colorIndex]}`,
      `dark:bg-opacity-30`,
      sizeClasses[size],
      className
    )}>
      {initials}
    </div>
  );
};

export default CompanyBadge;
