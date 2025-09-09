import React from 'react';
import { cn } from '@/lib/utils';

interface LoadingProps {
  variant?: 'dots' | 'circuit' | 'matrix' | 'data-stream' | 'hologram';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const Loading: React.FC<LoadingProps> = ({ 
  variant = 'circuit', 
  size = 'md', 
  className 
}) => {
  const sizeClasses = {
    sm: 'scale-75',
    md: 'scale-100',
    lg: 'scale-125'
  };

  const renderLoading = () => {
    switch (variant) {
      case 'dots':
        return (
          <div className="loading-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
        );
      
      case 'circuit':
        return <div className="loading-circuit"></div>;
      
      case 'matrix':
        return (
          <div className="loading-matrix">
            <div></div>
            <div></div>
          </div>
        );
      
      case 'data-stream':
        return <div className="loading-data-stream"></div>;
      
      case 'hologram':
        return <div className="loading-hologram"></div>;
      
      default:
        return <div className="loading-circuit"></div>;
    }
  };

  return (
    <div className={cn(
      'flex items-center justify-center',
      sizeClasses[size],
      className
    )}>
      {renderLoading()}
    </div>
  );
};

export default Loading;
export { Loading };