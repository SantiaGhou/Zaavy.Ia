import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export function Card({ children, className = '', hover = false }: CardProps) {
  const baseClasses = 'bg-gray-800 border border-gray-700 rounded-lg shadow-lg';
  const hoverClasses = hover ? 'hover:bg-gray-750 hover:border-gray-600 transition-all duration-200 cursor-pointer' : '';

  return (
    <div className={`${baseClasses} ${hoverClasses} ${className}`}>
      {children}
    </div>
  );
}