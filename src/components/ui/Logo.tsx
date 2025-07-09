import React from 'react';
import { Bot } from 'lucide-react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export function Logo({ size = 'md', showText = true }: LogoProps) {
  const sizes = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-3xl',
  };

  return (
    <div className="flex items-center">
      <div className="relative">
        <Bot className={`${sizes[size]} text-blue-500`} />
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
      </div>
      {showText && (
        <span className={`ml-2 font-bold text-white ${textSizes[size]}`}>
          Zaavy<span className="text-blue-500">.ia</span>
        </span>
      )}
    </div>
  );
}