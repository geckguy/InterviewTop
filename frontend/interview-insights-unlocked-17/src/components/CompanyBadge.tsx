
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
  const colors = ['bg-blue-100', 'bg-green-100', 'bg-yellow-100', 'bg-purple-100', 'bg-pink-100', 'bg-indigo-100', 'bg-red-100'];
  const colorIndex = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
  const bgColor = colors[colorIndex];
  
  // Generate a deterministic text color based on company name
  const textColors = ['text-blue-700', 'text-green-700', 'text-yellow-700', 'text-purple-700', 'text-pink-700', 'text-indigo-700', 'text-red-700'];
  const textColor = textColors[colorIndex];

  const sizeClasses = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-12 h-12 text-base'
  };

  return (
    <div className={cn(
      'flex items-center justify-center rounded-md font-semibold',
      bgColor,
      textColor,
      sizeClasses[size],
      className
    )}>
      {initials}
    </div>
  );
};

export default CompanyBadge;
