import React from 'react';
import { Bot, Cpu, Zap, CircuitBoard } from 'lucide-react';

interface LoadingBotProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function LoadingBot({ message = 'Carregando...', size = 'md' }: LoadingBotProps) {
  const sizes = {
    sm: { container: 'w-32 h-32', icon: 'w-8 h-8', text: 'text-sm' },
    md: { container: 'w-48 h-48', icon: 'w-12 h-12', text: 'text-base' },
    lg: { container: 'w-64 h-64', icon: 'w-16 h-16', text: 'text-lg' }
  };

  const currentSize = sizes[size];

  return (
    <div className="flex flex-col items-center justify-center space-y-6">
      <div className={`relative ${currentSize.container} flex items-center justify-center`}>
        <div className="absolute inset-0 rounded-full border-2 border-blue-500/30 animate-spin"></div>
        
        <div className="absolute inset-2 rounded-full border-2 border-purple-500/30 animate-spin" style={{ animationDirection: 'reverse' }}></div>
        
        <div className="absolute inset-4 rounded-full border border-green-500/30 animate-spin"></div>

        <div className="relative z-10 bg-gray-900/80 backdrop-blur-sm rounded-full p-6 border border-gray-700 animate-pulse">
          <Bot className={`${currentSize.icon} text-blue-400`} />
        </div>

        <div className="absolute top-4 right-4 animate-pulse">
          <Cpu className="w-4 h-4 text-purple-400" />
        </div>

        <div className="absolute bottom-4 left-4 animate-pulse" style={{ animationDelay: '0.5s' }}>
          <Zap className="w-4 h-4 text-green-400" />
        </div>

        <div className="absolute top-4 left-4 animate-pulse" style={{ animationDelay: '1s' }}>
          <CircuitBoard className="w-4 h-4 text-yellow-400" />
        </div>
      </div>

      <div className="text-center space-y-2">
        <p className={`${currentSize.text} font-medium text-white animate-pulse`}>
          {message}
        </p>
        
        <div className="flex space-x-1 justify-center">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>
      </div>

      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-blue-400/30 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}